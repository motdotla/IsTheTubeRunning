require('dotenv').config()

const PORT = process.env.PORT || 8081
const is_non_production = process.env.NODE_ENV !== ('prod' || 'production')
const TFL_APP_KEY = process.env.TFL_APP_KEY
const version='1.0.0'
const service_name='tfl_poller_service'
const tfl_api_root = 'https://api.tfl.gov.uk'
const graph_endpoint = 'wss://tube.gremlin.cosmos.azure.com:443/'
const graph_primary_key = process.env.GRAPH_PRIMARY_KEY
const graph_database = 'tube'
const graph_stoppoint_colleciton = 'stoppoints'
const eventhub_sender_connection_string = process.env.cynexia_tube_sender_EVENTHUB
const eventhub_name = 'tube'

module.exports = {
  PORT,
  is_non_production,
  TFL_APP_KEY,
  version,
  service_name,
  tfl_api_root,
  graph_endpoint,
  graph_primary_key,
  graph_database,
  graph_stoppoint_colleciton,
  eventhub_sender_connection_string,
  eventhub_name
}