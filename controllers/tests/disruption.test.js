const extended_tests = require('../../tests/extendExpects')

const disruption = require('../disruption')
jest.mock('../../services/tfl_api.query')

const fs = require('fs')

//const expected_results = require('./disruption.expected')
expect.extend({
  ...extended_tests
})

describe('disruption controller', () => {
  test('reports "true" for disruption', async () => {
    const expected_response = true
    const actual_response = await disruption.is_there_disruption()
    expect(actual_response).toMatchObject(expected_response)
  })
})