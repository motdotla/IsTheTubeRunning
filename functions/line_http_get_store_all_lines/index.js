const lines = require('../controllers/line')
const logger = require('../utils/logger')

const httpTrigger = async (context) => {
  const modes = context.bindingData.modes.split(',')
  logger.debug(`fetching line data for modes: ${modes}`)
  const relevant_lines = await lines.lines_for_mode(modes)
  logger.debug(`relevant_lines.lines: ${relevant_lines.lines}`)
  const return_promises = await Promise.all(relevant_lines.lines.data.map(line => line.id).map(line => lines.store_stoppoints_and_lines(line)))
  logger.debug(`return_promises: ${return_promises}`)
  // context.log(returndata)
  return  { body: return_promises }
}

module.exports = httpTrigger