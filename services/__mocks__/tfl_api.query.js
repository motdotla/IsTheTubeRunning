const responses = require('../tests/tfl_api.query_responses')
console.log('mocking TfL API')


let originalModule = jest.requireActual('../tfl_api.query')
const mockquery = (url, priority) => {
  /**
   * Mocks the query function from tfl_api.query
   */
  console.log('mocking query', url, priority)
  return { data: url }
}

const mocked_module = {
  ...originalModule,
  query: mockquery
}

//originalModule['query'] = mockquery
console.log('mocked')

//mockquery;
module.exports = mocked_module