const lines = require('../controllers/lines')

const httpTrigger = async (context) => {
  const returndata = { body: await lines.lines(context) }
  // context.log(returndata)
  return  returndata
}

module.exports = httpTrigger