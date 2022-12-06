const lines = require('../controllers/line')
const logger = require('../utils/logger')

//  "route": "lines/{modes}/store"

const httpTrigger = async (context) => {
  const modes = context.bindingData.modes.split(',')
  const r = await lines.store_all_lines_for_mode(modes)
  return { body: r }
}

module.exports = httpTrigger