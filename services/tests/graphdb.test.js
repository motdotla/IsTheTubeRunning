const { describe, expect, test } = require('@jest/globals')
const graph = require('../graphdb')
const fs = require('fs')

describe('GraphDB tests', () => {
  describe('test helper functions', () => {
    describe('test escape_string', () => {
      const escape_string = graph.__get__('escape_string')
      test('test escape_string with no single quote', () => {
        const input = 'test'
        const expected = 'test'
        const actual = escape_string(input)
        expect(actual).toBe(expected)
      })
      test('test escape_string with single quote', () => {
      // eslint-disable-next-line quotes
        const input = "test'test"
        // eslint-disable-next-line quotes
        const expected = "test\\'test"
        const actual = escape_string(input)
        expect(actual).toBe(expected)
      })
      test('test escape_string with single quote', () => {
        // eslint-disable-next-line quotes
        const input = "test''test"
        // eslint-disable-next-line quotes
        const expected = "test\\'\\'test"
        const actual = escape_string(input)
        expect(actual).toBe(expected)
      })
    })
  })
  describe('test connecting to graphdb', () => {
    test('stoppoint_authenticator is defined', () => {
      expect(graph.__get__('stoppoint_authenticator')).toBeDefined()
    })

    test('can connect to stoppoint_collection', async () => {
      expect(graph.__get__('stoppoint_client')).toBeDefined()
    })
  })
})