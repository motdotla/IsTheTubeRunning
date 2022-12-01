require('dotenv').config()

const PORT = process.env.PORT || 8081
const is_non_production = process.env.NODE_ENV !== ('prod' || 'production')
const TFL_APP_KEY = process.env.TFL_APP_KEY
const version='1.0.0'
const service_name='tfl_poller_service'
const tfl_api_root = 'https://api.tfl.gov.uk'


module.exports = {
  PORT,
  is_non_production,
  TFL_APP_KEY,
  version,
  service_name,
  tfl_api_root
}