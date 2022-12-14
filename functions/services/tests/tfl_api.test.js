const tfl_api = require('../tfl_api')
const axios = require('axios')

const tfl_responses = require('./tfl_api.responses')

jest.mock('axios')

it('calls TFL API to get ordered Victoria line trains', async () => {
  console.log('mocking axios.get')
  const expected_response = tfl_responses.get_line_stoppoints_in_order_victoria
  axios.get.mockResolvedValue(expected_response)
  const r = await tfl_api.get_line_stoppoints_in_order('victoria')

  expect(r).toBeDefined()
})