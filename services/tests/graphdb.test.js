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
    test('serializeGremlinResults returns a properly formed object for a single result', () => {
      const serializeGremlinResults = graph.__get__('serializeGremlinResults')
      const input_value = JSON.parse('[{"id":"28fjp","label":"stoppoint","type":"vertex","properties":{"name":[{"id":"4d89ef30-f815-42a1-8b7b-34b825959db1","value":"yboa6"}],"naptanId":[{"id":"28fjp|naptanId","value":"28fjp"}],"lat":[{"id":"dd1b087f-5b33-4076-9ab6-9262a9f2c17c","value":"51.39571760958728"}],"lon":[{"id":"18b1c07d-76fa-48ec-997e-4eb20c7bf235","value":"-0.14384083030070627"}],"modes":[{"id":"24767fe3-b142-4f29-b059-000c0838c413","value":"31t3i"},{"id":"1bda7368-b2f7-4913-8a94-8906de99a89d","value":"dx038"}],"lines":[{"id":"dadd01de-522c-41cd-b217-7329b8cf524e","value":"dqgm6"},{"id":"d5fdc72f-41ea-4277-a367-d1fc4da22a84","value":"n3nws"},{"id":"465966e9-939f-4bda-a40e-5565e487c50d","value":"2pnpi"}]}}]')
      const expected_result = JSON.parse('[{"id": "28fjp","label": "stoppoint","type": "vertex","name": "yboa6","naptanId": "28fjp","lat": "51.39571760958728","lon": "-0.14384083030070627","modes": ["31t3i","dx038"],"lines": ["dqgm6","n3nws","2pnpi"]}]')
      const actual_result = serializeGremlinResults(input_value)
      expect(actual_result).toMatchObject(expected_result)
    })
  })
  describe('test connecting to graphdb', () => {
    test('stoppoint_authenticator is defined', () => {
      expect(graph.__get__('stoppoint_authenticator')).toBeDefined()
    })

    test('can connect to stoppoint_collection', async () => {
      const stoppoint_client = graph.__get__('stoppoint_client')
      expect(stoppoint_client).toBeDefined()
      const actual_result = await stoppoint_client.submit('g.V().count()')
      expect(actual_result['length']).toBeDefined()
      stoppoint_client.close()
    })
  })
  // TODO: create second user to access graphdb
  describe('test graphdb queries', () => {

    describe('test add_stoppoint with upsert', () => {
      let list_of_added_stoppoints = []
      afterAll(async () => {
        //TODO: move this to independent code i.e. not dependent on graphdb.js
        const client = graph.__get__('stoppoint_client')
        const execute_query = graph.__get__('execute_query')
        const delete_promises = await Promise.all(list_of_added_stoppoints.map(stoppoint_id => execute_query(client, `g.V('${stoppoint_id}').drop()`, 3)))
        const delete_results = delete_promises.every(result => result['success'] === true)
        expect(delete_results).toBe(true)
        console.log(`deleted ${list_of_added_stoppoints.length} stoppoints`)
        await client.close()
      })
      test('add a single stoppoint', async () => {
        const new_stoppoint = generate_random_stoppoint(2, 3)
        list_of_added_stoppoints.push(new_stoppoint['id'])
        const actual_result = await graph.add_stoppoint(new_stoppoint, true)
        expect(actual_result['success']).toBe(true)
        expect(actual_result['data']).toHaveLength(1)
        const added_stoppoint = actual_result['data'][0]
        expect(added_stoppoint['label']).toBe(new_stoppoint['type'])
        expect(added_stoppoint['id']).toBe(new_stoppoint['id'])
        expect(added_stoppoint['name']).toBe(new_stoppoint['name'])
        expect(added_stoppoint['naptanId']).toBe(new_stoppoint['naptanId'])
        expect(added_stoppoint['lat']).toBe(new_stoppoint['lat'])
        expect(added_stoppoint['lon']).toBe(new_stoppoint['lon'])
        expect(added_stoppoint['modes']).toEqual(new_stoppoint['modes'])
        expect(added_stoppoint['lines']).toEqual(new_stoppoint['lines'])
      })

    })
    describe('tests with stubbed client', () => {
      test.skip('test retry by add lots of stoppoints', async () => {
        // increase jest timeout to 60 seconds
        jest.setTimeout(60000)
        const number_of_stoppoints = 100
        let stoppoints = new Array(number_of_stoppoints).fill(null).map(() => generate_random_stoppoint())
        const result_array = await Promise.all(stoppoints.map(stoppoint => graph.add_stoppoint(stoppoint, true)))
        const actual_result = result_array.every(result => result['success'] === true)
        expect(actual_result).toBe(true)
      })
    })

  })
})

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
    lines: generate_random_array(number_of_lines)
  }
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