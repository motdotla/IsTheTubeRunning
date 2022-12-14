/**
 * This file contains the responses from the TFL_API library
 * As the responses are quite large, they are stored in a ./tfl_api_responses folder
 * and loaded into this file
 *
 */

const fs = require('fs')
const path = require('node:path')
const helpers = require('../../utils/helpers')


const load_file = (filename) => {
  const f= fs.readFileSync(path.resolve(__dirname, 'tfl_sdk_responses', filename), 'utf8')
  return f
}

const get_data = (filename) => {
  return helpers.jsonParser(load_file(filename))
}


const get_line_stoppoints_in_order_victoria_no_crowding = get_data('get_line_stoppoints_in_order_victoria_no_crowding.json')
const get_line_stoppoints_victoria = get_data('get_line_stoppoints_victoria.json')

module.exports = {
  get_line_stoppoints_in_order_victoria_no_crowding,
  get_line_stoppoints_victoria
}
