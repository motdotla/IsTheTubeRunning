const call_tfl = require('../services/tfl_api')
const logger = require('../utils/logger')
const graphdb = require('../services/graphdb')

async function lines(modes = ['tube', 'dlr', 'overground']) {
  /**
   * fetches lines from tfl for given modes
   * returns a list of lines with originating and terminating stoppoints  
   * 
   * @param {Array} modes - list of modes to fetch lines for
   * @returns {Array} - list of lines
   *  
   **/

  const lines = await call_tfl.get_all_lines(modes)
  return { lines }
}




module.exports = { lines }