const disruption = require('../controllers/disruption')

const httpTrigger = async (context, _req) => {
  await disruption.get_disruption(context)
  context.done()
}

module.exports = httpTrigger