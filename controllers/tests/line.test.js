const line = require('../line')

jest.mock('../../services/tfl_api')

const expected_results = require('./line.expected')


test.skip('calls TFL API to get ordered Victoria line trains', async () => {
  const r = await line.stoppoints('victoria', true)
  expect(r).toEqual(expected_results.line_stoppoints_victoria_true )
})