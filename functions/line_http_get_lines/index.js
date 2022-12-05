const lines = require('../controllers/line')
const logger = require('../utils/logger')

const httpTrigger = async (context) => {
  const modes = context.bindingData.modes.split(',')
  logger.debug(`fetching line data for modes: ${modes}`)

  const returndata = { body: await lines.lines(modes) }
  // context.log(returndata)
  return  returndata
}

module.exports = httpTrigger