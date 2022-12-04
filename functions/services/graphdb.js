const Gremlin = require('gremlin')
const config = require('../utils/config')


const authenticator = new Gremlin.driver.auth.PlainTextSaslAuthenticator(`/dbs/${config.graph_database}/colls/${config.graph_stoppoint_colleciton}`, config.graph_primary_key)

const client = new Gremlin.driver.Client(
  config.endpoint,
  {
    authenticator,
    traversalsource : 'g',
    rejectUnauthorized : true,
    mimeType : 'application/vnd.gremlin-v2.0+json'
  }
)

async function addVertex(stationNaptan, lines) {
  // stationNaptan is the station naptan code
  // lines is an array of lines that stop at the station

  const query = `g.addV('stoppoint').property('id', '${stationNaptan}').property('lines', ${JSON.stringify(lines)})`
  const result = await client.submit(query)
  return result

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

module.exports = { addVertex, addEdge }