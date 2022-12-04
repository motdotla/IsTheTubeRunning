const disruption = require('../controllers/disruption')

const httpTrigger = async (context) => {
  const returndata = { body: await disruption.disruption_detail(context) }
  // context.log(returndata)
  return  returndata
}

module.exports = httpTrigger