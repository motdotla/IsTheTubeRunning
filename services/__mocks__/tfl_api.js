const { get_line_stoppoints_in_order_victoria } = require('./tfl_api.responses')
console.log('in mock tfl_api.js')

jest.requireActual('tfl_api')
const tfl = jest.createMockFromModule('../tfl_api')

function create_response_with_ttl(data, ttl, purpose = 'unknown'){
  console.log(`create_response_with_ttl for test: ${purpose}`)
  return {
    data,ttl
  }
}

tfl.get_line_stoppoints_in_order = create_response_with_ttl(get_line_stoppoints_in_order_victoria, 60, 'get_line_stoppoints_in_order')

module.exports = tfl