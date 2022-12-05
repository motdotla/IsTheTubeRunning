const { EventHubProducerClient } = require('@azure/event-hubs')
const logger = require('../utils/logger')
const config = require('../utils/config')

const connectionString = config.eventhub_sender_connection_string
const eventHubName = config.eventhub_name


async function publishBatch(batch_array) {
  /**
   * Publishes an array of batch_array to eventhub
   *
   * @param {Array} batch_array - array of batch_array to publish
   * @returns {Object} - Summary of the publish
   *
   */
  logger.info('publishBatch received batch of: ', batch_array.length)
  const client = new EventHubProducerClient(connectionString, eventHubName)

  let batch = await client.createBatch()
  let batch_count = 0
  for (let i = 0; i < batch_array.length; i++) {
    if (batch_array[i]){
      if (!batch.tryAdd(batch_array[i])) {
        await client.sendBatch(batch)
        batch = await client.createBatch()
        if (!batch.tryAdd(batch_array[i])) {
          throw new Error(`Failed to add item to batch: ${batch_array[i]}`)
        } else {batch_count++}
        if (i === batch_array.length - 1) {
          await client.sendBatch(batch)
        }
      } else {batch_count++}
    }
  }
  await client.close()
  logger.debug(`published ${batch_count} items to eventhub`)
  return { success: true, submitted: batch_count, total_possible: batch_array.length }
}


module.exports = { publishBatch }