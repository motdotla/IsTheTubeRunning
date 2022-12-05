const disruption = require('../controllers/disruption')

const httpTrigger = async (context) => {
  const returndata = { body: await disruption.is_there_disruption(context) }
  // context.log(returndata)
  return  returndata
}

module.exports = httpTrigger