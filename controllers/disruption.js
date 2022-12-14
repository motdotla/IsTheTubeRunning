const call_tfl = require('../services/tfl_api')
const logger = require('../utils/logger')


async function is_there_disruption() {
/**
 * Fetches the disruption data from TFL. returns a binary true/false.
 **/

  const disruption = await call_tfl.get_disruption(false)

  // check if statusSeverity for every lineStatus is 10 (good service)
  const line_disruption = disruption.data.map(l => l['lineStatuses'].every((s => s['statusSeverity'] === 10)))
  // if any of the lines have disruption, then flag this as true
  const is_there_disruption = !line_disruption.every(s => s === true)
  logger.debug(`is_there_disruption: ${is_there_disruption}`)

  return { is_there_disruption, ttl: disruption.ttl }

}

async function disruption_detail() {
/**
 * Fetches the disruption data from TFL. returns the detailed disruption data.
 * can be quite large - several MB - as it includes every impacted station
 **/

  const disruption  = await call_tfl.get_disruption(true)

  return { disruption }

}

module.exports = { is_there_disruption, disruption_detail }