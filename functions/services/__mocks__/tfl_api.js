const { get_line_stoppoints_in_order_victoria } = require('./tfl_api.responses')

const tfl = jest.createMockFromModule('../tfl_api')

function create_response_with_ttl(data, ttl){
  console.log('create_response_with_ttl', data, ttl)
  return {
    data,ttl
  }
}

tfl.get_line_stoppoints_in_order = create_response_with_ttl(get_line_stoppoints_in_order_victoria, 60)

module.exports = tfl