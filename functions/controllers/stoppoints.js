const call_tfl = require('../services/tfl_api')
const logger = require('../utils/logger')
const graphdb = require('../services/graphdb')

async function stoppoints(line){
  /**
   * Fetches the stoppoints data from TFL by line
   **/

  const stoppoints = await call_tfl.get_line_stoppoints(line)

  return { stoppoints }

}



module.exports = { stoppoints }