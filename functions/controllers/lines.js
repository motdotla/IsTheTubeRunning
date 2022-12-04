const call_tfl = require('../services/tfl_api')
const logger = require('../utils/logger')
const graphdb = require('../services/graphdb')

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

async function stoppoints(line){
  /**
   * Fetches the stoppoints data from TFL by line
   *
   * @param {String} line - line to fetch stoppoints for
   * @returns {object} - stoppoints.data - array of stoppoints, stoppoints.ttl - ttl of the data
   *
   **/

  const stoppoints = await call_tfl.get_line_stoppoints(line)

  return { stoppoints }

}

async function store_stoppoints(line){
  /**
   * Fetches the stoppoints data from TFL by line
   *
   * @param {String} line - line to fetch stoppoints for
   * @returns {object} - stoppoints.data - array of stoppoints, stoppoints.ttl - ttl of the data
   *
   **/

  const { data: stoppoints } = await call_tfl.get_line_stoppoints(line)

  //logger.debug(stoppoints)
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

  const result = await Promise.all(stoppoint_map.map(s => graphdb.add_stoppoint(s, true)))
  // logger.debug(result)
  return result
}





module.exports = { lines, stoppoints, store_stoppoints }