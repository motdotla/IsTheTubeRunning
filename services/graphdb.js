const Gremlin = require('gremlin')
const config = require('../utils/config')
const logger = require('../utils/logger')
const helpers = require('../utils/helpers')

const fs = require('fs')

const gremlin_db_string = `/dbs/${config.graph_database}/colls/${config.graph_stoppoint_colleciton}`
const stoppoint_authenticator = new Gremlin.driver.auth.PlainTextSaslAuthenticator(gremlin_db_string, config.graph_primary_key)

const stoppoint_client = new Gremlin.driver.Client(
  config.GRAPH_DATABASE_ENDPOINT,
  {
    authenticator: stoppoint_authenticator,
    traversalsource: 'g',
    rejectUnauthorized: true,
    mimeType: 'application/vnd.gremlin-v2.0+json'
  }
)

function escape_string(str) {
  return str.replace(/'/g, '\\\'')
}

const add_array_value = (arr, property_name) => {
  /**
   * Converts an array to a string containing the same property
   * with each different value ('multi-properties')
   * see https://tinkerpop.apache.org/docs/current/reference/#vertex-properties
   * @param {Array} arr - array to convert
   * @returns {String} - list of .property entries
   */
  const items = arr.map((item) => `.property('${property_name}', '${escape_string(item)}')`).join('\n')

  return items
}

const add_stoppoint = async (stoppoint, upsert = false) => {
  /**
   * Adds a stoppoint to the graphdb.
   * a stoppoint is an object with teh following properties:
   * id, type, name, naptanId, stationNaptan, lat, lon, modes, lines
   *
   * @param {object} stoppoint - stoppoint object
   * @returns {Promise} - pending query to graphdb
   */

  // construct a query to add the stoppoint to the graphdb
  const add_query = `addV('${stoppoint['type']}')
  .property('id', '${stoppoint['id']}')
  .property('name', '${escape_string(stoppoint['name'])}')
  .property('naptanId', '${stoppoint['naptanId']}')
  .property('lat', '${stoppoint['lat']}')
  .property('lon', '${stoppoint['lon']}')
  ${add_array_value(stoppoint['modes'], 'modes')}
  ${add_array_value(stoppoint['lines'], 'lines')}`

  // if upsert is true, then we want to wrap the add_query in an upsert
  const with_upsert = `V('${stoppoint.id}')
  .fold()
  .coalesce(
    unfold(),
    ${add_query}
    )`

  // if upsert is false, then we just want to run the add_query
  const query = `g.${upsert ? with_upsert : add_query}`
  // log the query, removing the newlines
  // logger.debug(query.replace(/\n/g, ''))

  const result = await execute_query(stoppoint_client, query, 5)
  return result
}

const add_line = async (line_edge, upsert = false) => {
  // add a line to the graphdb
  // a line is an object with the following properties:
  // id, name, modeName, modeId, routeSections
  logger.debug(`adding line ${line_edge.id} to graphdb`)


  const query = `g.E('${line_edge['id']}')
    .fold()
    .coalesce(
      unfold(),
      addE('TO')
      .from(g.V('${line_edge['from']}'))
      .to(g.V('${line_edge['to']}'))
      .property('id', '${line_edge['id']}')
      .property('line', '${line_edge['lineName']}')
      .property('branch', '${line_edge['branchId']}')
      .property('direction', '${line_edge['direction']}'))`
  // submit the query to the graphdb
  //logger.debug(query.replace(/\n/g, ''))
  const result = await execute_query(query, 5)
  return result

}

const execute_query = async (client, query, maxAttempts) => {
  /**
   * Retry a function up to a maximum number of attempts
   * adapted from https://solutional.ee/blog/2020-11-19-Proper-Retry-in-JavaScript.html
   *
   * @param {String} query - query to execute
   * @param {Number} maxAttempts - maximum number of attempts to execute the query
   *
   * @returns {String} - result of the query
   */


  let retry_time = 1000
  const execute = async (attempt) => {
    if (attempt > 1) { logger.debug(`attempt ${attempt} of ${maxAttempts}`) }
    try {
      const client_result = await client.submit(query)
      if (Object.hasOwnProperty.call(client_result.attributes, 'x-ms-retry-after-ms')) {
        retry_time = client_result.attributes['x-ms-retry-after-ms']
        throw new Error(`received x-ms-retry-after-ms - retrying after ${retry_time} ms`)
      }
      const seralised_result = serializeGremlinResults(client_result['_items'])
      return { data: seralised_result, success: true }
    } catch (err) {
      const ms_status_code = err['statusAttributes'] ? err['statusAttributes']['x-ms-status-code'] : null
      if (ms_status_code === 409) {
        // conflict - we need to abort
        return { success: false, error: err['statusMessage'], status_code: ms_status_code }
      } else if (attempt <= maxAttempts) {
        const nextAttempt = attempt + 1
        const delayInMs = retry_time ? retry_time : Math.max(Math.min(Math.pow(2, nextAttempt) + randInt(-nextAttempt, nextAttempt), 5), 1)
        logger.error(`Retrying after ${delayInMs} ms due to:`, err)
        return delay(() => execute(nextAttempt), delayInMs)
      } else {
        return { success: false, error: err['statusMessage'], status_code: ms_status_code }
      }
    }
  }
  const final_result = await execute(1)
  return final_result
}

function serializeGremlinResults(results) {
  /**
   * Serialise the results of a gremlin query
   * return an array of objects.
   * The gremlin 'properties' key is flattened into the object
   * If a property has multiple values, then the value is an array
   * If a property has a single value, then the value is a string
   * @param {Array} results - results of a gremlin query
   * @returns {Array} - array of objects
   */

  let serializedResults = []
  results.forEach(result => {
    serializedResults.push({
      id: result.id,
      label: result.label,
      type: result.type,
      ...serializeProperties(result.properties)
    })
  })
  return serializedResults
}

function serializeProperties(properties) {
  let serializedProperties = {}
  Object.keys(properties).forEach(key => {
    const value = properties[key]
    if (value.length > 1) {
      serializedProperties[key] = value.map(item => item.value)
    } else {
      serializedProperties[key] = value[0].value
    }
  })
  return serializedProperties
}


const delay = (fn, ms) => new Promise((resolve) => setTimeout(() => resolve(fn()), ms))

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1) + min)

module.exports = { add_stoppoint, add_line }