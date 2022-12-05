const call_tfl = require('../services/tfl_api')
const logger = require('../utils/logger')
const eventhub = require('../services/eventhub')

async function lines(modes) {
  /**
   * fetches lines from tfl for given modes
   * returns a list of lines with originating and terminating stoppoints
   *
   * @param {Array} modes - list of modes to fetch lines for
   * @returns {Object} - lines.data - array of lines, lines.ttl - ttl of the data
   *
   **/

  const lines = await call_tfl.get_all_lines(modes)
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

/*
async function call_store_stoppoints(stoppoint_map) {
  const result = await Promise.all(stoppoint_map.map(s => graphdb.add_stoppoint(s, true)))
  // logger.debug(result)
  return result
}*/
/*
async function store_lines_direct(line) {
  /**
   * Fetches the stoppoints data from TFL by line
   * creates an edge between the stoppoints
   *
   * @param {String} line - line to fetch stoppoints for
   * @returns {Promise} - stoppoints.data - array of stoppoints, stoppoints.ttl - ttl of the data
   *
   *  **
  logger.debug('store_lines')
  const { data: lines } = await call_tfl.get_line_stoppoints_in_order(line)
  // logger.debug(lines)
  return Promise.all(lines.map(line => store_single_line(line)))

}
*/

async function store_lines(line) {
  /**
   * takes an array of arrays of lines
   * flattens them to a single array
   * sends to publishLines
   * returns a promise
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
/*
async function get_lines_to_store(line) {
  /**
   * Fetches the stoppoints data from TFL by line
   * creates an edge between the stoppoints
   *
   * @param {String} line - line to fetch stoppoints for
   * @returns {Promise} - stoppoints.data - array of arrays. One array per branch. each array contains a list of edges
   *
   *  **



  logger.debug('store_lines')
  const { data: lines } = await call_tfl.get_line_stoppoints_in_order(line)
  // logger.debug(lines)
  const lines_to_store = lines.map(line => generate_single_line(line))
  return lines_to_store

}
*/

/*
async function store_single_line(line) {
  /**
   * stores a single line. A line is an object with the following metadata:
   * id, lineName, branchId direction
   * and an array of points with the following metadata:
   * id, name, naptanId, stationNaptan, lat, lon, lines
   *
   * @param {Object} line - line to store
   * @returns {Promise} - ???
   *
   * **


  // need to add the line to the graph
  // the point[n] and point[n+1] are connected by an edge
  // the edge has the following metadata:
  // id, type, lineName, branchId, direction, from, to
  // the edge is stored in the graph
  // the edge is returned
  return Promise.all(line['points'].map((point, index, points) => {
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
      return graphdb.add_line(edge, true)
    }
  }))
}*/

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
  // the edge is returned
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

module.exports = { lines, stoppoints, store_stoppoints, store_lines, store_stoppoints_and_lines }