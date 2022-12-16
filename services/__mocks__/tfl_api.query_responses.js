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
// `Line/${line_id}/Route/Sequence/all`
// --> victoria line
// `Line/victoria/Route/Sequence/all`
const get_line_stoppoints_in_order_victoria_no_crowding = {
  headers: { 'cache-control': 'public, must-revalidate, max-age=43200, s-maxage=86400' },
  data: get_data('get_line_victoria_route_sequence_all(excludeCrowding).json')// JSON.parse(json_get_line_stoppoints_in_order_victoria)
}

// results for get_line_stoppoints()
//`Line/${line_id}/StopPoints`
//`Line/victoria/StopPoints`
const get_line_stoppoints_victoria = {
  headers: { 'cache-control': 'public, must-revalidate, max-age=43200, s-maxage=86400' },
  data: get_data('get_line_victoria_stoppoints.json')
}

// results for get_disruption()
// detail: false
// `Line/Mode/tube/Status`
const get_disruption_tube = {
  headers: { 'cache-control': 'public, must-revalidate, max-age=30, s-maxage=60' },
  data: get_data('get_line_mode_tube_status(detail-false)[disrupted].json')
}
//`Line/Mode/tube,overground/Status`
const get_disruption_tube_overground = {
  headers: { 'cache-control': 'public, must-revalidate, max-age=30, s-maxage=60' },
  data: get_data('get_line_mode_tube,overground_status(detail-false)[disrupted].json')
}
// detail: true
// `Line/Mode/tube/Status?detailed=true`
const get_disruption_tube_detailed = {
  headers: { 'cache-control': 'public, must-revalidate, max-age=30, s-maxage=60' },
  data: get_data('get_line_mode_tube_status(detail-true)[disrupted].json')
}
// `Line/Mode/tube,overground/Status?detailed=true`
const get_disruption_tube_overground_detailed = {
  headers: { 'cache-control': 'public, must-revalidate, max-age=30, s-maxage=60' },
  data: get_data('get_line_mode_tube,overground_status(detail-true)[disrupted].json')
}

// get_lines_for_mode()
// `Line/Mode/${modes}/Route`
// `Line/Mode/tube/Route`
const get_lines_for_mode_tube = {
  headers: { 'cache-control': 'public, must-revalidate, max-age=43200, s-maxage=86400' },
  data: get_data('get_line_mode_tube_route.json')
}
// `Line/Mode/tube,overground/Route`
const get_lines_for_mode_tube_overground = {
  headers: { 'cache-control': 'public, must-revalidate, max-age=43200, s-maxage=86400' },
  data: get_data('get_line_mode_tube,overground_route.json')
}

module.exports = {
  get_line_stoppoints_in_order_victoria_no_crowding,
  get_line_stoppoints_victoria,
  get_disruption_tube,
  get_disruption_tube_overground,
  get_disruption_tube_detailed,
  get_disruption_tube_overground_detailed,
  get_lines_for_mode_tube,
  get_lines_for_mode_tube_overground
}