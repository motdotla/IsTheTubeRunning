const fs = require('fs')
const path = require('node:path')

const load_file = (filename) => {
  return fs.readFileSync(path.resolve(__dirname, filename), 'utf8')
}

console.log(process.cwd())
// json_get_line_stoppoints_in_order
const cache_headers_get_line_stoppoints_in_order = { 'cache-control': 'public, must-revalidate, max-age=43200, s-maxage=86400' }
// --> victoria line

const json_get_line_stoppoints_in_order_victoria = load_file('get_line_stoppoints_in_order_victoria.json')
const get_line_stoppoints_in_order_victoria = {
  headers: cache_headers_get_line_stoppoints_in_order,
  data: JSON.parse(json_get_line_stoppoints_in_order_victoria)
}

module.exports = { get_line_stoppoints_in_order_victoria }