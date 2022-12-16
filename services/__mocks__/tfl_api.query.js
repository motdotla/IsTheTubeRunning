const responses = require('./tfl_api.query.axios_responses')
console.log('mocking TfL API')


const check_params = (params, expected_params) => {
  /**
   * Checks that the params object contains the expected params
   * @param {Object} params - params object
   * @param {Object} expected_params - expected params object
   * @returns {Boolean} - true if params contains expected_params
   *
   */
  if (params === undefined) {
    return false
  }
  for (const [key, value] of Object.entries(expected_params)) {
    if (params[key] !== value) {
      return false
    }
  }
  return true
}


let originalModule = jest.requireActual('../tfl_api.query')
/*
const mockquery = (url, params) => {
  /**
   * Mocks the query function from tfl_api.query
   *
  console.log('mocking query', url, params)

  switch (url.toLowerCase()) {
    case 'line/victoria/route/sequence/all':
      return responses.get_line_stoppoints_in_order_victoria_no_crowding
    case 'line/victoria/stoppoints':
      return responses.get_line_stoppoints_victoria
    case 'line/mode/tube/status':
      if (check_params(params, { detailed: 'true' })) {
        return responses.get_disruption_tube_detailed
      } else {
        return responses.get_disruption_tube
      }
    case 'line/mode/tube,overground/status':
      if (check_params(params, { detailed: 'true' })) {
        return responses.get_disruption_tube_overground_detailed
      } else {
        return responses.get_disruption_tube_overground
      }
    case 'line/mode/tube/route':
      return responses.get_lines_for_mode_tube
    case 'line/mode/tube,overground/route':
      return responses.get_lines_for_mode_tube_overground
    default:
      throw new Error(`No mock response for ${url}`)

  }
}

const mocked_module = {
  ...originalModule,
  query: mockquery
}

*/
const axios = require('axios')
jest.mock('axios')
const mockquery = (url, params) => {
  /**
   * Mocks the query function from tfl_api.query
   */
  console.log('mocking query', url, params)

  switch (url.toLowerCase()) {
  case 'line/victoria/route/sequence/all':
    //TODO add support for crowding
    axios.get.mockResolvedValue(responses.get_line_victoria_route_sequence_all_no_crowding)
    return originalModule.query(url, params)

  case 'line/victoria/stoppoints':
    axios.get.mockResolvedValue(responses.get_line_stoppoints_victoria)
    return originalModule.query(url, params)

  case 'line/mode/tube/status':
    if (check_params(params, { detailed: 'true' })) {
      axios.get.mockResolvedValue(responses.get_line_mode_tube_status_detail_true_disrupted)
    } else {
      axios.get.mockResolvedValue(responses.get_line_mode_tube_status_detail_false_disrupted)
    }
    return originalModule.query(url, params)

  case 'line/mode/tube,overground/status':
    if (check_params(params, { detailed: 'true' })) {
      axios.get.mockResolvedValue(responses.get_line_mode_tube_overground_status_detail_true_disrupted)
    } else {
      axios.get.mockResolvedValue(responses.get_line_mode_tube_overground_status_detail_false_disrupted)
    }
    return originalModule.query(url, params)

  case 'line/mode/tube/route':
    axios.get.mockResolvedValue(responses.get_line_mode_tube_route)
    return originalModule.query(url, params)

  case 'line/mode/tube,overground/route':
    axios.get.mockResolvedValue(responses.get_line_mode_tube_overground_route)
    return originalModule.query(url, params)

  default:
    throw new Error(`No mock response for ${url}`)

  }
}

const mocked_module = {
  ...originalModule,
  query: mockquery
}




//originalModule['query'] = mockquery
console.log('mocked')

//mockquery;
module.exports = mocked_module