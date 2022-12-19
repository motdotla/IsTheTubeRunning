const { describe, expect, test } = require('@jest/globals')
const graph = require('../graphdb')
const fs = require('fs')

const randomString = () => Math.random().toString(36).slice(2, 7)

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
      stoppoint_client.close()
    })
  })
  // TODO: create second user to access graphdb
  describe('test graphdb queries', () => {
    let list_of_added_stoppoints = []
    afterAll(async () => {
      //TODO: move this to independent code i.e. not dependent on graphdb.js
      const client = graph.__get__('stoppoint_client')
      await client.close()
    })
    describe('test add_stoppoint with upsert', () => {
      test('add a single stoppoint', async () => {
        const new_stoppoint = generate_random_stoppoint(2,3)
        list_of_added_stoppoints.push(new_stoppoint['id'])
        const actual_result = await graph.add_stoppoint(new_stoppoint, true)
        expect(actual_result['success']).toBe(true)
        expect(actual_result['data']).toHaveLength(1)
        const added_stoppoint = actual_result['data'][0]
        expect(added_stoppoint['label']).toBe(new_stoppoint['type'])
        expect(added_stoppoint['id']).toBe(new_stoppoint['id'])
        expect(added_stoppoint['properties']['name']).toBe(new_stoppoint['name'])
        expect(added_stoppoint['properties']['naptanId']).toBe(new_stoppoint['naptanId'])
        expect(added_stoppoint['properties']['lat']).toBe(new_stoppoint['lat'])
        expect(added_stoppoint['properties']['lon']).toBe(new_stoppoint['lon'])
        expect(added_stoppoint['properties']['modes']).toEqual(new_stoppoint['modes'])
        expect(added_stoppoint['properties']['lines']).toEqual(new_stoppoint['lines'])
      })
      test('add 1000 stoppoints', async () => {
        // increase jest timeout to 60 seconds
        jest.setTimeout(60000)
        let stoppoints = new Array(1000).fill(null).map(() => generate_random_stoppoint())
        const result_array = await Promise.all(stoppoints.map(stoppoint => graph.add_stoppoint(stoppoint, true)))
        const actual_result = result_array.every(result => result['success'] === true)
        expect(actual_result).toBe(true)
      })
    })


  })})

const generate_random_stoppoint = (number_of_modes, number_of_lines) => {
  const new_object_id = randomString()
  const [lat, lon] = generate_random_lat_lon()
  const stoppoint = {
    type: 'stoppoint',
    id: new_object_id,
    name: randomString(),
    naptanId: new_object_id,
    lat: lat.toString(),
    lon: lon.toString(),
    modes: generate_random_array(number_of_modes),
    lines: generate_random_array(number_of_lines) }
  return stoppoint
}

const generate_random_array = (number_of_modes) => {
  // return an array containing number_of_modes randomString()
  const modes = new Array(number_of_modes).fill(null).map(() => randomString())
  return modes
}

const generate_random_lat_lon = () => {
  // generate a random lat and lon that are somewhere roughly inside London
  const lat = Math.random() * (51.5 - 51.0) + 51.0
  const lon = Math.random() * (-0.1 - -0.5) + -0.5
  return [lat, lon]
}