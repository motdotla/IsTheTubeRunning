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
  let routed = 0
  if (message && ('type' in message) && ('id' in message)) { // sometimes we get nulls in the array
    // console.log('route_messages_by_type message: ', message)
    // logger.debug('route_messages_by_type message: ', message)
    const message_type = message.type
    //console.log('route_messages_by_type message_type: ', message_type)
    switch (message_type) {
      case 'Line':
        response = line.process_line_message(message)
        routed++
        break
      case 'StopPoint':
        response = line.process_stoppoint_message(message)
        routed++
        break
      default:
        logger.error(`route_messages_by_type: unknown message type: ${message.type}`)
    }
  } else {
    logger.error(`route_messages_by_type: message is null or does not have a type or id property: ${message}`, `type: ${typeof message}`)
  }
  logger.debug(`routed ${routed} items to services ${message.type}, ${message.id}`)
  return { success: true, id: message.id, response: response }
}

module.exports = { route_messages_by_type }