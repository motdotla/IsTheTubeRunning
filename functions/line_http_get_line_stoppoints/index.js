const lines = require('../controllers/line')
const logger = require('../utils/logger')

const httpTrigger = async (context) => {
  const line = context.bindingData.line
  // check whether parameter ordered=true passed
  const ordered = context.bindingData.ordered === true
  
  logger.debug(`fetching line data for modes: ${line}, ordered: ${ordered}`)
  
  const returndata = { body: await lines.stoppoints(line, ordered) }
  // context.log(returndata)
  return  returndata
}

module.exports = httpTrigger