const tfl_api = require('../services/tfl_api')
const logger = require('../utils/logger')
const eventhub = require('../services/eventhub')
const graph = require('../services/graphdb')
const helpers = require('../utils/helpers')

// a line (in our context) is a list of stoppoints  connected by route steps. A route step links exactly two stoppoints in a specific direction.

async function lines_for_mode(mode) {
  /**
   * fetches lines from tfl for given modes
   * returns a list of lines and some metadata
   *
   * @param {Array} modes - list of modes to fetch lines for
   * @returns {Object} - lines.data - array of lines, lines.ttl - ttl of the data
   *
   **/

  const lines = await tfl_api.get_lines_for_mode(mode)
  return { lines }
}

async function stoppoints(line, ordered=false) {
  /**
   * Fetches the stoppoints data from TFL by line
   *
   * @param {String} line - line to fetch stoppoints for
   * @returns {Promise} - stoppoints.data - array of stoppoints, stoppoints.ttl - ttl of the data
   *
   **/
  console.log('stoppoints', line, ordered)
  const stoppoints = ordered ? tfl_api.get_line_stoppoints_in_order(line) : tfl_api.get_line_stoppoints(line)
  return stoppoints

}


async function store_all_stoppoints_for_mode(mode){
  /**
   * Fetches the list of lines for a mode from TFL
   * Fetches the stoppoints data from TFL by line
   * pushes the stoppoints to the event hub
   *
   * @param {String} line - line to fetch stoppoints for
   * @returns {Promise} Promise.all from the store_stoppoints function
   *
   **/
  logger.debug(`store_all_stoppoints_for_mode: ${mode}`)
  const { lines } = await lines_for_mode(mode)
  console.log(lines.data)
  const stoppoint_promises = lines.data.map(l => store_stoppoints(l['id']))
  return Promise.all(stoppoint_promises)
}

async function store_all_lines_for_mode(mode){
  /**
   * Fetches the list of lines for a mode from TFL
   * Fetches the ordered list of stoppoints data from TFL by line
   * generates the edges between the stoppoints
   * pushes the edges to the event hub
      *
   * @param {String} line - line to fetch stoppoints for
   * @returns {Promise} Promise.all from eventhub.publishStoppoints
   *
   **/
  logger.debug(`store_all_lines_for_mode: ${mode}`)
  const { lines } = await lines_for_mode(mode)
  console.log(lines.data)
  const line_promises = lines.data.map(l => store_lines(l['id']))
  return Promise.all(line_promises)
}

async function store_stoppoints(line){
  /**
   * Fetches the stoppoints data from TFL by line
   * pushes the stoppoints to the event hub
   *
   * @param {String} line - line to fetch stoppoints for
   * @returns {Promise} Promise.all from eventhub.publishStoppoints
   *
   **/
  logger.debug('store_stoppoints')
  const { data: stoppoints } = await tfl_api.get_line_stoppoints(line)

  return  eventhub.publishBatch(stoppoints)

}


async function store_lines(line) {
  /**
   * fetches the list of stoppoints for a given line
   * generates the edges between the stoppoints
   * pushes the edges to the event hub
   *
   * @param {Array} lines_to_store - array of arrays of lines
   * @returns {Promise} - result of publishLines
   *
   * **/

  const { data: lines } = await tfl_api.get_line_stoppoints_in_order(line)
  const lines_to_store = lines.map(line => generate_single_line(line)).flat()

  //const flat_lines = lines_to_store.flat()
  return eventhub.publishBatch(lines_to_store)
}


function generate_single_line(line) {
  /**
   * generates metadat for a single line (edge).
   * A line is an object with the following metadata:
   * id, lineName, branchId direction
   * and an array of points with the following metadata:
   * id, name, naptanId, stationNaptan, lat, lon, lines
   *
   * @param {Object} line - line to store
   * @returns {array} - edges from point to point
   *
   * **/


  // need to add the line to the graph
  // the point[n] and point[n+1] are connected by an edge
  // the edge has the following metadata:
  // id, type, lineName, branchId, direction, from, to
  // the edge is stored in the graph
  // an array of edges is returned
  return line['points'].map((point, index, points) => {
    if (index < points.length - 1) {
      const edge = {
        'id': `${line['lineName']}-${line['branchId']}-${point['id']}-${points[index + 1]['id']}`,
        'type': 'Line',
        'lineName': line['lineName'],
        'branchId': line['branchId'],
        'direction': line['direction'],
        'from': point['id'],
        'to': points[index + 1]['id']
      }
      return edge
    }
  })
}

async function process_line_message(line) {
  /**
   * processes a line message
   * receives a message defining a line
   * converts it to an edge
   * pushes the edge to the graph
   * it will retry up to 5 times with a 2 second delay
   *
   * @param {Object} message - message to process
   * @returns {Promise} - result of publishLines
   *
   *
   *  **/
  // const line = message['body']
  const edge = generate_single_line(line)
  return helpers.retry(graph.add_line(edge,true),5,2 )

}

async function process_stoppoint_message(stoppoint) {
  /**
   * processes a stoppoint message
   * receives a message defining a stoppoint
   * pushes the stoppoint to the graph
   * it will retry up to 5 times with a 2 second delay
   * 
   * @param {Object} message - message to process
   * @returns {Promise} - result of publishStoppoints
   * 
   * */
  // const stoppoint = message['body']
  return graph.add_stoppoint(stoppoint,true)
}


module.exports = {
  stoppoints,
  lines_for_mode,
  store_stoppoints,
  store_lines,
  store_all_stoppoints_for_mode,
  store_all_lines_for_mode,
  process_line_message,
  process_stoppoint_message }