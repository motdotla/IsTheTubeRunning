const line = require('../line')
const tfl_api = require('../../services/tfl_api')
jest.mock('../../services/tfl_api.query')


const fs = require('fs')


const expected_results = require('./line.expected')


test('calls TFL API to get ordered Victoria line trains', async () => {
  //tfl_api.query.mockResolvedValue(expected_results.get_line_stoppoints_in_order_victoria_no_disruption)
  const r = await line.stoppoints('victoria', true)
  expect(r).toEqual(expected_results.line_stoppoints_victoria_true )
})