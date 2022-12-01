const config = require('../utils/config')
const call_tfl = require('../services/tfl_api')
const logger = require('../utils/logger')


async function get_disruption({ req, res }) {
  // first, check the "light" version of the disruption data
  // if there's disruption, then call the "detailed" version of the disruption data
  const simple_disruption = await call_tfl.get_disruption(detailed = false)
  const line_disruption = simple_disruption.map(l => l['lineStatuses'].every((s => s['statusSeverity'] === 10)))
  const is_there_disruption = !line_disruption.every(s => s === true)
  if (is_there_disruption) {
    const detailed_disruption = await call_tfl.get_disruption(detailed = true)
    res.status(200).json(detailed_disruption)
  } else {
    res.status(200).json(simple_disruption)
  }

}


module.exports = { get_disruption }