const Gremlin = require('gremlin')
const config = require('../utils/config')
const logger = require('../utils/logger')


const authenticator = new Gremlin.driver.auth.PlainTextSaslAuthenticator(`/dbs/${config.graph_database}/colls/${config.graph_stoppoint_colleciton}`, config.graph_primary_key)

const client = new Gremlin.driver.Client(
  config.graph_endpoint,
  {
    authenticator,
    traversalsource : 'g',
    rejectUnauthorized : true,
    mimeType : 'application/vnd.gremlin-v2.0+json'
  }
)

function escape_object(obj) {
  // escape the object by replacing single quotes with escaped quotes
  return JSON.stringify(obj).replace(/'/g, "\\'")
}

function escape_string(str) {
  return str.replace(/'/g, "\\'")
}

async function add_stoppoint(stoppoint, upsert=false) {
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
  .property('name', '${escape_string(stoppoint['commonName'])}')
  .property('stationNaptan', '${stoppoint['stationNaptan']}')
  .property('commonName', '${escape_string(stoppoint['commonName'])}')
  .property('naptanId', '${stoppoint['naptanId']}')
  .property('lat', '${stoppoint['lat']}')
  .property('lon', '${stoppoint['lon']}')
  .property('modes', '${stoppoint['modes']}')
  .property('lines', '${stoppoint.lines.map(m => m.id)}')`

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
  // submit the query to the graphdb
  return await client.submit(query)

}






async function addEdge(station1Naptan, station2Natplan, line, modeName) {
  // station1Natplan is the from station
  // station2Natplan is the to station
  // line is the line that connects the two stations
  // note that the edge is directional i.e. each edge is from station1 to station2, but not vice versa

  const query = `g.V('${station1Naptan}').addE('next').to(g.V('${station2Natplan}')).property('line', '${line}').property('mode', '${modeName}')`
  const result = await client.submit(query)
  return result
}

module.exports = { add_stoppoint }