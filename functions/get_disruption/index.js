const disruption = require('../controllers/disruption')

const httpTrigger = async function (context, req) {
  await disruption.get_disruption(context)
  context.done()
};

module.exports = httpTrigger;