const { describe, expect, test } = require('@jest/globals')
const tfl_api_query = require('../tfl_api.query')


describe('test helper functions ', () => {
  describe('extract s-maxage from header', () => {
    const get_s_maxage = tfl_api_query.__get__('get_s_maxage')

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
    })
  })
  describe('test add_search_params', () => {
    const add_search_params = tfl_api_query.__get__('add_search_params')
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
})