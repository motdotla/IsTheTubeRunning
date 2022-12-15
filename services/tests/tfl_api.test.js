const { describe, expect, test, beforeAll } = require('@jest/globals')



const tfl_api = require('../tfl_api')

const axios = require('axios')

const tfl_api_responses = require('./tfl_api.query_responses')
const tfl_sdk_responses = require('./tfl_api.sdk_responses')

const fs = require('fs')

const calculate_remaining_time = (expected_ttl) => {
  const t = new Date()
  return t.setSeconds(t.getSeconds() + expected_ttl)
}

//https://stackoverflow.com/questions/53369407/include-tobecloseto-in-jest-tomatchobject
expect.extend({
  toBeAround(actual, expected, precision = 2) {
    const pass = Math.abs(expected - actual) < Math.pow(10, -precision) / 2
    if (pass) {
      return {
        message: () => `expected ${actual} not to be around ${expected}`,
        pass: true
      }
    } else {
      return {
        message: () => `expected ${actual} to be around ${expected}`,
        pass: false
      }
    }
  }
})


jest.mock('axios')

describe('TfL calls to get line stoppoints', () => {
  describe('calls without caching', () => {
    test('calls TFL API to get ordered Victoria line stoppoints', async () => {
      axios.get.mockResolvedValue(tfl_api_responses.get_line_stoppoints_in_order_victoria_no_crowding)
      const actual_response = await tfl_api.get_line_stoppoints_in_order('victoria')
      const expected_response = tfl_sdk_responses.get_line_stoppoints_in_order_victoria_no_crowding
      expect(actual_response).toMatchObject(expected_response)
    })
    test('calls TFL API to get default Victoria line trains', async () => {
      axios.get.mockResolvedValue(tfl_api_responses.get_line_stoppoints_victoria)
      const actual_response = await tfl_api.get_line_stoppoints('victoria')
      const expected_response = tfl_sdk_responses.get_line_stoppoints_victoria
      expect(actual_response).toMatchObject(expected_response)
    })
  })
  describe('calls with caching', () => {
    test('calls TFL API to get ordered Victoria line stoppoints', async () => {
      axios.get.mockResolvedValue(tfl_api_responses.get_line_stoppoints_in_order_victoria_no_crowding)
      const expected_response = tfl_sdk_responses.get_line_stoppoints_in_order_victoria_no_crowding
      const first_response = await tfl_api.get_line_stoppoints_in_order('victoria')
      const actual_response = await tfl_api.get_line_stoppoints_in_order('victoria')
      expect(first_response).toMatchObject(expected_response)
      expect(actual_response['data']).toMatchObject(expected_response['data'])
      expect(actual_response['ttl']/10).toBeLessThan(expected_response['ttl'])
      expect(actual_response['ttl']/10).toBeAround(expected_response['ttl']/10,0)
    })
    test('calls TFL API to get default Victoria line trains', async () => {
      axios.get.mockResolvedValue(tfl_api_responses.get_line_stoppoints_victoria)
      const expected_response = tfl_sdk_responses.get_line_stoppoints_victoria
      const first_response = await tfl_api.get_line_stoppoints('victoria')
      const actual_response = await tfl_api.get_line_stoppoints('victoria')
      expect(first_response).toMatchObject(expected_response)
      expect(actual_response['data']).toMatchObject(expected_response['data'])
      expect(actual_response['ttl']/10).toBeLessThan(expected_response['ttl'])
      expect(actual_response['ttl']/10).toBeAround(expected_response['ttl']/10,0)

    })
  })
})

describe('test helper functions', () => {
  describe('extract s-maxage from header', () => {
    const get_s_maxage = tfl_api.__get__('get_s_maxage')

    test('s-maxage = 60', () => {
      const header = 'max-age=0, s-maxage=60'
      const expected = 60
      const actual = get_s_maxage(header)
      expect(actual).toBe(expected)
    })
    test('s-maxage = 100000', () => {
      const header = 'max-age=0, s-maxage=100000'
      const expected = 100000
      const actual = get_s_maxage(header)
      expect(actual).toBe(expected)
    })
    test('s-maxage on its own', () => {
      const header = 's-maxage=23423'
      const expected = 23423
      const actual = get_s_maxage(header)
      expect(actual).toBe(expected)
    })
    test('s-maxage in middle', () => {
      const header = 'public, max-age=43200, s-maxage=86400, must-revalidate'
      const expected = 86400
      const actual = get_s_maxage(header)
      expect(actual).toBe(expected)
    })
    test('missing s-maxage', () => {
      const header = 'max-age=0'
      const expected = -1
      const actual = get_s_maxage(header)
      expect(actual).toBe(expected)
    } )
  })
  describe('test add_search_params', () => {
    const add_search_params = tfl_api.__get__('add_search_params')
    test('add search params to url', () => {
      const url = new URL('https://api.tfl.gov.uk/Line/victoria/StopPoints')
      const params = {
        'app_id': '123',
        'app_key': 'abc'
      }
      const expected = new URL('https://api.tfl.gov.uk/Line/victoria/StopPoints?app_id=123&app_key=abc')
      const actual = add_search_params(url, params)
      expect(actual).toStrictEqual(expected)
    })
    test('add search params to url with existing params', () => {
      const url = new URL('https://api.tfl.gov.uk/Line/victoria/StopPoints?app_id=123')
      const params = {
        'app_key': 'abc'
      }
      const expected = new URL('https://api.tfl.gov.uk/Line/victoria/StopPoints?app_id=123&app_key=abc')
      const actual = add_search_params(url, params)
      expect(actual).toStrictEqual(expected)
    })
    test('add search params to url with null params', () => {
      const url = new URL('https://api.tfl.gov.uk/Line/victoria/StopPoints')
      const params = {
        'app_id': null
      }
      const expected = new URL('https://api.tfl.gov.uk/Line/victoria/StopPoints')
      const actual = add_search_params(url, params)
      expect(actual).toStrictEqual(expected)
    })
    test('add search params to url with empty params', () => {
      const url = new URL('https://api.tfl.gov.uk/Line/victoria/StopPoints')
      const params = {}
      const expected = new URL('https://api.tfl.gov.uk/Line/victoria/StopPoints')
      const actual = add_search_params(url, params)
      expect(actual).toStrictEqual(expected)
    })
  })
  describe('structure_cached_value', () => {
    const structure_cached_value = tfl_api.__get__('structure_cached_value')
    test('structure cached value > 0', () => {
      const data = {
        'a': 1,
        'b': 2
      }
      const ttl = calculate_remaining_time(60)
      const expected = {
        'data': {
          'a': 1,
          'b': 2
        },
        'ttl': 60
      }
      const actual = structure_cached_value(data, ttl)
      expect(actual['data']).toStrictEqual(data)
      expect(actual['ttl']/10).toBeAround(expected['ttl']/10, 0)
    })
    test('structure cached value expired (-1) ', () => {
      const data = {
        'a': 1,
        'b': 2
      }
      const ttl = -1
      const expected = {
        'data': {
          'a': 1,
          'b': 2
        },
        'ttl': -1
      }
      const actual = structure_cached_value(data, ttl)
      expect(actual['data']).toStrictEqual(data)
      expect(actual['ttl']/10).toBeAround(expected['ttl']/10, 0)
    })
  })
})