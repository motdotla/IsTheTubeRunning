const lines = require('../controllers/line')
const logger = require('../utils/logger')

//      "route": "{line}/stoppoints/store"


const httpTrigger = async (context) => {
  const line = context.bindingData.line
  // check whether parameter ordered=true passed
  
  
  logger.debug(`storing stoppoint data for line: ${line}`)
  
  const returndata = { body: await lines.store_stoppoints(line) }
  // context.log(returndata)
  return  returndata
}

module.exports = httpTrigger