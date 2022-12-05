const logger = require('../utils/logger')


async function processEvents(context, eventHubMessages) {
  //logger.debug(`JavaScript eventhub trigger function called for message array ${eventHubMessages}`)

  eventHubMessages.forEach((message, index) => {
    // need to find the type of the message
    const parsed_message = jsonParser(message)
    const message_type = parsed_message['type']

    switch (message_type.toLowerCase()) {
    case 'stoppoint':
      //logger.debug('stoppoints message received')
      break
    case 'line':
      //logger.debug('lines message received')
      break
    default:
      logger.debug(`unknown message type received: ${message_type}`)
    }
  })
}

// sometimes objects are over-stringified, and need multiple 'parsing' to get to the object
// https://stackoverflow.com/a/67576746
function jsonParser(blob) {
  let parsed = JSON.parse(blob)
  if (typeof parsed === 'string') parsed = jsonParser(parsed)
  return parsed
}


module.exports = { processEvents }