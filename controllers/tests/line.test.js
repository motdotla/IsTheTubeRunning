const line = require('../line')

const expected_results = require('./line.expected')

jest.mock('tfl_api')

test('calls TFL API to get ordered Victoria line trains', async () => {
  const r = await line.stoppoints('victoria', true)
  expect(r).toEqual(expected_results.line_stoppoints_victoria_true )
})