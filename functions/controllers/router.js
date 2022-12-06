// router.js
// ========
// handles reciving all event hub messages and sending them to the appropriate service
//
// Path: functions/controllers/network.js

const line = require('./line')
const logger = require('../utils/logger')

async function route_messages_by_type(message) {
  /**
   * Routes an array of messages to the appropriate service
   *
   * @param {Array} message_array - array of messages to route
   * @returns {Object} - Summary of the publish
   *
   */
  let response = {}
  if (message){ // sometimes we get nulls in the array
    // console.log('route_messages_by_type message: ', message)
    // logger.debug('route_messages_by_type message: ', message)
    
    switch (message.type.ToLower()) {
    case 'line':
      response = line.process_line_message(message)
      break
    case 'stoppoint':
      response = line.process_stoppoint_message(message)
      break
    default:
      logger.error(`route_messages_by_type: unknown message type: ${message.type}`)
    }



  }
  logger.debug(`routed 1 items to services ${message.type}, ${message.id}}`)
  return { success: true, id: message.id, response: response }
}

module.exports = { route_messages_by_type }