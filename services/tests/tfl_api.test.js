const { describe, expect, test } = require('@jest/globals')

const tfl_api = require('../tfl_api')
const axios = require('axios')

const tfl_api_responses = require('./tfl_api.query_responses')
const tfl_sdk_responses = require('./tfl_api.sdk_responses')

const fs = require('fs')



jest.mock('axios')

describe('TfL calls to get line stoppoints', () => {
  test('calls TFL API to get ordered Victoria line stoppoints', async () => {
    axios.get.mockResolvedValue(tfl_api_responses.get_line_stoppoints_in_order_victoria_no_crowding)
    const r = await tfl_api.get_line_stoppoints_in_order('victoria')
    const expected_response = tfl_sdk_responses.get_line_stoppoints_in_order_victoria_no_crowding
    expect(r).toMatchObject(expected_response)
  })
  test('calls TFL API to get default Victoria line trains', async () => {
    axios.get.mockResolvedValue(tfl_api_responses.get_line_stoppoints_victoria)
    const r = await tfl_api.get_line_stoppoints('victoria')
    const expected_response = tfl_sdk_responses.get_line_stoppoints_victoria
    expect(r).toMatchObject(expected_response)
  })
})