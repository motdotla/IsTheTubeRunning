const responses = require('../tests/tfl_api.query_responses')
console.log('mocking TfL API')


// jest.requireActual('tfl_api')
const tfl = jest.createMockFromModule('../tfl_api')


tfl.query = function (query, params){
  console.log('mock tfl_api.js: query', query, params)
  switch (query.toLowerCase()){
  case 'line/victoria/route/sequence/all'.toLowerCase():{
    if (params.excludeCrowding === true){
      console.log('mock tfl_api.js: returning get_line_stoppoints_in_order_victoria_no_disruption', responses.get_line_stoppoints_in_order_victoria_no_disruption.headers)
      return responses.get_line_stoppoints_in_order_victoria_no_disruption
    } else {
      throw new Error(`Unknown params: ${params}`)
    }
  }
  default:
    throw new Error(`Unknown query: ${query}`)
  }
}




module.exports = tfl