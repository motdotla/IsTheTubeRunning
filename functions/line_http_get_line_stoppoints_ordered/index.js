const lines = require('../controllers/line')
const logger = require('../utils/logger')

const httpTrigger = async (context) => {
  const mode = context.bindingData.mode
  logger.debug(`fetching line data for modes: ${mode}`)
  
  const returndata = { body: await lines.store_all_lines(mode) }
  // context.log(returndata)
  return  returndata
}

module.exports = httpTrigger