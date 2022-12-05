const call_tfl = require('../services/tfl_api')
const logger = require('../utils/logger')
const eventhub = require('../services/eventhub')

async function lines_for_mode(mode) {
  /**
   * fetches lines from tfl for given modes
   * returns a list of lines and some metadata
   *
   * @param {Array} modes - list of modes to fetch lines for
   * @returns {Object} - lines.data - array of lines, lines.ttl - ttl of the data
   *
   **/

  const lines = await call_tfl.get_lines_for_mode(mode)
  return { lines }
}

async function stoppoints(line, ordered=false) {
  /**
   * Fetches the stoppoints data from TFL by line
   *
   * @param {String} line - line to fetch stoppoints for
   * @returns {object} - stoppoints.data - array of stoppoints, stoppoints.ttl - ttl of the data
   *
   **/


  if (ordered) {
    return await call_tfl.get_line_stoppoints_in_order(line)
  } else {
    return await call_tfl.get_line_stoppoints(line)
  }

}

async function store_stoppoints_and_lines(line){
  /** fetches stoppoints for a line
   * pushes the stoppoints to the event hub
   * fetches the lines
   * pushes the lines to the event hub
   * returns a promise
   * @param {String} line - line to fetch stoppoints for
   * @returns {Promise} - ???
   * **/

  return Promise.all([store_stoppoints(line), store_lines(line)])

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
  const { data: stoppoints } = await call_tfl.get_line_stoppoints(line)

  // logger.debug(stoppoints)
  const stoppoint_map = stoppoints.map(s => {
    return {
      'id': s['id'],
      'type': 'StopPoint',
      'commonName': s['commonName'],
      'naptanId': s['naptanId'],
      'stationNaptan': s['stationNaptan'],
      'lat': s['lat'],
      'lon': s['lon'],
      'modes': s['modes'],
      'lines': s['lines']
    }
  })
  //logger.debug(stoppoint_map)

  return  eventhub.publishBatch(stoppoint_map)

}

async function store_all_lines(mode){
  /** 
   * fetches all line types for a given mode
   * calls store_lines and store_stoppoints for each line
   * returns a promise array
   * 
   * @param {String} mode - mode to fetch lines for
   * @returns {Promise} - 
   * 
   */

  const lines = await call_tfl.get_lines_for_mode(mode)
  const lines_to_store = lines.data.map(line => line['id'])
  return Promise.all(lines_to_store.map(line => store_stoppoints_and_lines(line)))

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

  const { data: lines } = await call_tfl.get_line_stoppoints_in_order(line)
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

module.exports = { 
  stoppoints,
  lines_for_mode,
  store_stoppoints,
  store_lines,
  store_stoppoints_and_lines,
  store_all_lines }