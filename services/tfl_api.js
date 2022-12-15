const config = require('../utils/config')
const logger = require('../utils/logger')
const query_cache = require('../services/cache')
const axios = require('axios')

const get_s_maxage = (cache_control_header) => {
  /**
   * extracts s-maxage from cache-control header
   *
   * @param {String} cache_control_header - the cache-control header
   * @returns {Number} - the s-maxage value
   *
  */
  //https://stackoverflow.com/questions/60154782/how-to-get-max-age-value-from-cache-control-header-using-request-in-nodejs
  const matches = cache_control_header.match(/s-maxage=(\d+)/)
  const maxAge = matches ? parseInt(matches[1], 10) : -1
  return maxAge
}

const add_search_params = (url, params) => {
  /**
   * adds search params to a url
   *
   * @param {URL} url - the url to add params to
   * @param {Object} params - the params to add
   * @returns {URL} - the url with params added
   *
   */
  let new_params = params
  Object.keys(new_params).forEach((key) => ((new_params[key] == undefined) ? delete new_params[key] : {}))
  let new_url = url
  for (var p in new_params)
    if (Object.prototype.hasOwnProperty.call(new_params, p)) {
      new_url.searchParams.append(p, new_params[p])
    }
  return new_url
}

const structure_cached_value = (cached_value, cache_ttl) => {
  /**
   * structures cached value for return
   *
   * @param {Object} cached_value - the cached value
   * @param {Number} cache_ttl - the cache key
   * @returns {Object} - the structured cached value with .data and .ttl properties
   *
   */

  const currentDate = new Date()
  let remaining_ttl = 0
  if (cache_ttl > 0) {
    remaining_ttl = Math.floor((cache_ttl - currentDate.getTime())/1000)
  }
  else {
    remaining_ttl = cache_ttl
  }
  return { data: cached_value, ttl: remaining_ttl }
}

async function query(querystring, params = null) {
  /**
   * fetches data from tfl api
   *
   * @param {String} querystring - the query string to append to the base url
   * @param {Object} params - the query parameters to append to the url
   * @returns {Object} - the response from the api
   */


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
    logger.debug(`fetching ${tfl_api_url.toString()}`)
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

async function get_disruption(detailed = false, for_modes = ['tube', 'dlr', 'overground']) {
  /**
   * fetches disruptions from tfl for given modes
   *
   * @param {Boolean} detailed - whether to fetch detailed disruption information
   * @param {Array} for_modes - array of modes to fetch disruptions for
   * @returns {Array} - array of lines with disruption data
   */
  const modes = for_modes.join(',')
  const cache_key = `disruption-${modes}-${detailed}`
  const cached_value = query_cache.get(cache_key)

  if (cached_value) {
    logger.debug(`${cache_key} cache hit`)
    return structure_cached_value(cached_value, query_cache.getTtl( cache_key ))
  } else {
    logger.debug(`${cache_key} cache miss`)
    const disruption_api_query = `Line/Mode/${modes}/Status`
    const disruption = await query(disruption_api_query, { detail: detailed })
    query_cache.set(cache_key, disruption.data, disruption.ttl)
    return disruption
  }
}





async function get_line_stoppoints(line_id) {
  /**
   * fetches stoppoints for a given line in order
   *
   * @param {String} line_id - the line ID
   * @returns {Array} - line object with an array of stoppoints
   *
   */
  const cache_key = `line_stoppoints-${line_id}`
  const cached_value = query_cache.get(cache_key)
  if (cached_value) {
    logger.debug(`${cache_key} cache hit`)

    return structure_cached_value(cached_value, query_cache.getTtl( cache_key ))
  }
  else {
    logger.debug(`${cache_key} cache miss`)
    const line_stoppoints_api_query = `Line/${line_id}/StopPoints`
    const line_stoppoints = await query(line_stoppoints_api_query)
    const stoppoint_data = extract_stoppoints_from_stoppoint_array(line_stoppoints.data)
    query_cache.set(cache_key, stoppoint_data, line_stoppoints.ttl)
    return { data: stoppoint_data, ttl: line_stoppoints.ttl }
  }
}


async function get_line_stoppoints_in_order(line_id) {
  /**
   * fetches stoppoints for a given line in order
   *
   * @param {String} line_id - the line ID
   * @returns {Array} - array of line object with an array of stoppoints and other metadata
   *
   */
  const cache_key = `line_stoppoints_ordered-${line_id}`
  const cached_value = query_cache.get(cache_key)
  if (cached_value) {
    logger.debug(`${cache_key} cache hit`)

    return structure_cached_value(cached_value, query_cache.getTtl( cache_key ))
  }
  else {
    logger.debug(`${cache_key} cache miss`)
    const line_stoppoints_api_query = `Line/${line_id}/Route/Sequence/all`
    const line_stoppoints = await query(line_stoppoints_api_query, { excludeCrowding: true })
    // extract the stoppoints from the line_stoppoints data
    if (!line_stoppoints.data.stopPointSequences){
      logger.debug('line_stoppoints.data.stopPointSequences', line_stoppoints.data.stopPointSequences, line_stoppoints.data, line_id)
      throw new Error('line_stoppoints.data.stopPointSequences is undefined')
      
    }
    const directional_points = line_stoppoints.data.stopPointSequences.map(sp => get_directional_stoppoints(sp))

    query_cache.set(cache_key, directional_points, line_stoppoints.ttl)
    return { data: directional_points, ttl: line_stoppoints.ttl }
  }
}


function get_directional_stoppoints(stoppoint) {

  return {
    id: stoppoint['lineId'],
    lineName: stoppoint['lineName'],
    branchId: stoppoint['branchId'],
    nextBranchIds: stoppoint['nextBranchIds'],
    prevBranchIds: stoppoint['prevBranchIds'],
    direction: stoppoint['direction'],
    points: extract_stoppoints_from_stoppoint_array(stoppoint['stopPoint'])
  }

}
function extract_stoppoints_from_stoppoint_array(stoppoint_array) {
  return stoppoint_array.map((sp) => {
    return {
      id: sp['id'],
      type: 'StopPoint',
      name: ('name' in sp) ? sp['name'] : sp['commonName'],
      naptanId: ('stationId' in sp) ? sp['stationId'] : sp['naptanId'],
      lat: sp['lat'],
      lon: sp['lon'],
      modes: sp['modes'],
      lines: sp['lines'].map(l => l['id'])
    }}
  )
}

async function get_lines_for_mode(modes = ['tube', 'dlr', 'overground']) {
  /**
   * fetches lines from tfl for given modes
   *
   * @param {Array} modes - array of modes to fetch lines for
   * @returns {Array} - array of lines including the name and ID of the originating and terminating stations
   *
   */


  const cache_key = `all_lines-${modes}`
  const cached_value = query_cache.get(cache_key)
  if (cached_value) {
    logger.debug(`${cache_key} cache hit`)

    return structure_cached_value(cached_value, query_cache.getTtl( cache_key ))
  }
  else {
    logger.debug(`${cache_key} cache miss`)
    const all_lines_api_query = `Line/Mode/${modes}/Route`
    const all_lines = await query(all_lines_api_query)
    const all_lines_summarised = all_lines.data.map((line) => {
      return {
        id: line['id'],
        name: line['name'],
        modeName: line['modeName'],
        serviceTypes: line['serviceTypes'].map((st) => st['name'])
      }})

    query_cache.set(cache_key, all_lines_summarised, all_lines.ttl)
    return { data: all_lines_summarised, ttl: all_lines.ttl }
  }
}

module.exports = { get_disruption,
  get_line_stoppoints,
  get_lines_for_mode,
  get_line_stoppoints_in_order }