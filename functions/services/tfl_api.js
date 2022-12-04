const config = require('../utils/config')
const logger = require('../utils/logger')
const query_cache = require('../services/cache')


const get_s_maxage = (cache_control_header) => {
  //https://stackoverflow.com/questions/60154782/how-to-get-max-age-value-from-cache-control-header-using-request-in-nodejs
  const matches = cache_control_header.match(/s-maxage=(\d+)/)
  const maxAge = matches ? parseInt(matches[1], 10) : -1
  return maxAge
}

const add_search_params = (url, params) => {
  let new_params = params
  Object.keys(new_params).forEach((key) => (new_params[key] === undefined ? delete new_params[key] : {}))
  let new_url = url
  for (var p in new_params)
    if (Object.prototype.hasOwnProperty.call(new_params,p)) {
      new_url.searchParams.append(p, new_params[p])
    }
  return new_url
}

async function get_disruption(detailed = false, for_modes = ['tube', 'dlr', 'overground']) {
  // gets the disruption data from TFL
  const modes = for_modes.join(',')
  const cache_key = `disruption-${modes}-${detailed}`
  const cached_value = query_cache.get(cache_key)

  if (cached_value) {
    logger.debug(`${cache_key} cache hit`)
    return cached_value
  } else {
    logger.debug(`${cache_key} cache miss`)
    const disruption_api_query = `Line/Mode/${modes}/Status`
    const disruption = await query(disruption_api_query, { detail: detailed })
    query_cache.set(cache_key, disruption.data, disruption.ttl)
    return disruption
  }
}


async function query(querystring, params = null) {
  const axios = require('axios')
  const tfl_api_root = config.tfl_api_root
  const tfl_app_key = config.TFL_APP_KEY

  let tfl_api_url = new URL(querystring, tfl_api_root)
  // add params to tfl_api_url as search parameters
  if (params) tfl_api_url = add_search_params(tfl_api_url, params)
  
  const tfl_api_headers = {
    'Content-Type': 'application/json',
    'cache-control': 'no-cache',
    'Accept': 'application/json',
    'app_key': tfl_app_key
  }
  let tfl_api_response = null
  try {
    tfl_api_response = await axios.get(tfl_api_url.toString(), { headers: tfl_api_headers })
  } catch (error) {
    logger.error(error)
    throw error
  }

  // extract s-maxage from cache-control header
  const ttl = get_s_maxage(tfl_api_response.headers['cache-control'])
  const data = tfl_api_response.data
  //logger.debug({ data, ttl })
  return { data, ttl }
}

module.exports = { get_disruption }