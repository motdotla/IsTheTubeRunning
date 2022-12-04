const lines = require('../controllers/lines')
const logger = require('../utils/logger')

const httpTrigger = async (context) => {
  const line = context.bindingData.line
  logger.debug(`fetching line data for modes: ${line}`)

  const returndata = { body: await lines.store_stoppoints(line) }
  // context.log(returndata)
  return  returndata
}

module.exports = httpTrigger