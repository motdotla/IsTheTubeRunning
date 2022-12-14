

// sometimes objects are over-stringified, and need multiple 'parsing' to get to the object
// https://stackoverflow.com/a/67576746
function jsonParser(blob) {
  let parsed = JSON.parse(blob)
  if (typeof parsed === 'string') parsed = jsonParser(parsed)
  return parsed
}

// This function will retry a function up to a maximum number of attempts

const retry = async (fn, maxAttempts, retry_time = null) => {
  /**
   * Retry a function up to a maximum number of attempts
   * adapted from https://solutional.ee/blog/2020-11-19-Proper-Retry-in-JavaScript.html
   * 
   * @param {Number} maxAttempts
   * @param {Number} retry_time - time in seconds to wait before retrying
   * @param {Function} fn - function to retry
   * 
   * @returns 
   */
  const execute = async (attempt) => {
    try {
      return await fn()
    } catch (err) {
      if (attempt <= maxAttempts) {
        const nextAttempt = attempt + 1
        const delayInSeconds = retry_time ? retry_time : Math.max(Math.min(Math.pow(2, nextAttempt) + randInt(-nextAttempt, nextAttempt), 5), 1)
        console.error(`Retrying after ${delayInSeconds} seconds due to:`, err)
        return delay(() => execute(nextAttempt), delayInSeconds * 1000)
      } else {
        throw err
      }
    }
  }
  return execute(1)
}

const delay = (fn, ms) => new Promise((resolve) => setTimeout(() => resolve(fn()), ms))

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1) + min)


module.exports = { retry, jsonParser }