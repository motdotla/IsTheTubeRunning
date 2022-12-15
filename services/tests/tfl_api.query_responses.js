/**
 * This file contains mock responses from the TFL API
 * As the responses are quite large, they are stored in a ./tfl_responses folder
 * and loaded into this file
 *
 */

const fs = require('fs')
const helpers = require('../../utils/helpers')
const path = require('node:path')

const load_file = (filename) => {
  return fs.readFileSync(path.resolve(__dirname, 'tfl_query_responses', filename), 'utf8')
}

const get_data = (filename) => {
  return helpers.jsonParser(load_file(filename))
}

// results for get_line_stoppoints_in_order()
// --> victoria line
const get_line_stoppoints_in_order_victoria_no_crowding = {
  headers: { 'cache-control': 'public, must-revalidate, max-age=43200, s-maxage=86400' },
  data: get_data('get_line_victoria_route_sequence_all(excludeCrowding).json')// JSON.parse(json_get_line_stoppoints_in_order_victoria)
}

// results for get_line_stoppoints()
const get_line_stoppoints_victoria = {
  headers: { 'cache-control': 'public, must-revalidate, max-age=43200, s-maxage=86400' },
  data: get_data('get_line_victoria_stoppoints.json')
}

// results for get_disruption()
// detail: false
const get_disruption_tube = {
  headers: { 'cache-control': 'public, must-revalidate, max-age=30, s-maxage=60' },
  data: get_data('get_line_mode_tube_status(detail-false)[disrupted].json')
}
const get_disruption_tube_overground = {
  headers: { 'cache-control': 'public, must-revalidate, max-age=30, s-maxage=60' },
  data: get_data('get_line_mode_tube,overground_status(detail-false)[disrupted].json')
}
// detail: true
const get_disruption_tube_detailed = {
  headers: { 'cache-control': 'public, must-revalidate, max-age=30, s-maxage=60' },
  data: get_data('get_line_mode_tube_status(detail-true)[disrupted].json')
}
const get_disruption_tube_overground_detailed = {
  headers: { 'cache-control': 'public, must-revalidate, max-age=30, s-maxage=60' },
  data: get_data('get_line_mode_tube,overground_status(detail-true)[disrupted].json')
}
module.exports = {
  get_line_stoppoints_in_order_victoria_no_crowding,
  get_line_stoppoints_victoria,
  get_disruption_tube,
  get_disruption_tube_overground,
  get_disruption_tube_detailed,
  get_disruption_tube_overground_detailed
}