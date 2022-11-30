import { Context } from '@azure/functions';

const config = require('../utils/config')
const logger = require('../middleware/logger')
const query_cache = require('../middleware/cache')

logger.info(`Running in ${process.env.NODE_ENV} mode`)



const get_s_maxage = (cache_control_header)=> {
  //https://stackoverflow.com/questions/60154782/how-to-get-max-age-value-from-cache-control-header-using-request-in-nodejs
  const matches = cache_control_header.match(/s-maxage=(\d+)/)
  const maxAge = matches ? parseInt(matches[1], 10) : -1
  return maxAge
}

const call_tfl = async (query) => {
  const axios = require('axios')
  const tfl_api_root = config.tfl_api_root
  const tfl_app_key = config.TFL_APP_KEY
  const tfl_api_url =  new URL(query, tfl_api_root)
  const tfl_api_headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'app_key': tfl_app_key
  }
  const tfl_api_response = await axios.get(tfl_api_url.toString(), { headers: tfl_api_headers })
  return tfl_api_response
}



// send basic info about the service
if (config.is_non_production) {
  queryRouter.all('/', async (_request, response) => {
    const r = { service: config.service_name,
      version: config.version,
      status: 'ok',
      message: `${config.service_name} is running`,
      timestamp: new Date().toISOString(),
      request_header: JSON.stringify(_request.headers),
      request_body: JSON.stringify(_request.body) }

    response.json(r)
  })
} else {
  queryRouter.all('/', async (_request, response) => {
    const r = { service: config.service_name,
      version: config.version,
      status: 'ok',
      message: `${config.service_name} is running`,
      timestamp: new Date().toISOString() }
    response.json(r)
  })
}

queryRouter.get('/general_disruption', async (_request, response) => {
  const cached_value = query_cache.get('general_disruption')
  if (cached_value) {
    logger.debug('general_disruption cache hit')
    response.json(cached_value)

  } else {
    logger.debug('general_disruption cache miss')
    // calls the TfL API to get the current disruption status
    const query = 'Line/Mode/tube,dlr,overground/Status?detail=true'
    const query_response = await call_tfl(query)
    // extract s-maxage from the response header
    const response_ttl = get_s_maxage(query_response.headers['cache-control'])
    query_cache.set('general_disruption', query_response.data, response_ttl)
    response.json(query_response.data)
  }
})

module.exports = queryRouter