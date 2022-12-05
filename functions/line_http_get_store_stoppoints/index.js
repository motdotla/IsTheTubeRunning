const lines = require('../controllers/line')
const logger = require('../utils/logger')

const httpTrigger = async (context) => {
  const line = context.bindingData.line
  logger.debug(`fetching line data for modes: ${line}`)

  const returndata = { body: await lines.store_stoppoints_and_lines(line) }
  // context.log(returndata)
  return  returndata
}

module.exports = httpTrigger