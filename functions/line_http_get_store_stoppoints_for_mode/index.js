const lines = require('../controllers/line')
const logger = require('../utils/logger')

//  "route": "lines/{mode}/stoppoints/store"

const httpTrigger = async (context) => {
  const mode = context.bindingData.mode
  logger.debug(`storing all stoppoints for all lines for mode: ${mode}`)

  const returndata = { body: await lines.store_all_stoppoints_for_mode(mode) }
  // context.log(returndata)
  return  returndata
}

module.exports = httpTrigger