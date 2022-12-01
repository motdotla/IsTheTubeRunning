const config = require('../utils/config')
const call_tfl = require('../services/tfl_api')
const logger = require('../utils/logger')


async function get_disruption({ req, res }) {
/**
 * Fetches the disruption data from TFL. If there's no disruption, a simple message is returned.
 * if there is disruption, the disruption full set of detailed data is returned, including every impacted station.
 * 
 */

  // first, check the "light" version of the disruption data
  // if there's disruption, then call the "detailed" version of the disruption data
  // the simple version is often 400 lines, the detailed verison is over 10,000 lines
  // so we want to avoid calling the detailed version if we don't have to

  const simple_disruption = await call_tfl.get_disruption(detailed = false)

  // check if statusSeverity for every lineStatus is 10 (good service)
  const line_disruption = simple_disruption.map(l => l['lineStatuses'].every((s => s['statusSeverity'] === 10)))
  // if any of the lines have disruption, then flag this as true
  const is_there_disruption = !line_disruption.every(s => s === true)

  if (is_there_disruption) {
    // if there's disruption, then call the "detailed" version of the disruption data
    const detailed_disruption = await call_tfl.get_disruption(detailed = true)
    res.status(200).json(detailed_disruption)
  } else {
    res.status(200).json(simple_disruption)
  }

}


module.exports = { get_disruption }