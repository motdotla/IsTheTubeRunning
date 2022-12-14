// const { logger } = require('@azure/event-hubs')


const info = (...params) => {
  console.info(...params)
}

const error = (...params) => {
  console.error(...params)
}


const debug = (...params) => {
  console.debug(...params)
}

module.exports = { info, error, debug }