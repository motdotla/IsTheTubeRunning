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
      const stoppoint_client =  graph.__get__('stoppoint_client')
      expect(stoppoint_client).toBeDefined()
      const actual_result = await stoppoint_client.submit('g.V().count()')
      expect(actual_result['length']).toBeDefined()
    })
  })
  // TODO: create second user to access graphdb
  describe('test graphdb queries', () => {
    describe('test add_stoppoint with upsert', () => {
      test('add a single stoppoint', async () => {
        const stoppoint = {
          type: 'stoppoint',
          id: 'test',
          name: 'test',
          natplanId: 'test',
          lat: 0,
          lon: 0,
          modes: ['test'],
          lines: ['test'] }
        const expected_result = 'test'
        const actual_result = await graph.add_stoppoint(stoppoint, true)
        expect(actual_result).toBe(expected_result)
      })

    })


  })})