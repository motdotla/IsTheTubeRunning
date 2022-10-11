const homeRouter = require('express').Router()

homeRouter.get('/', async (_request, response) => {

  const r = { loaded: 'ok' }
  response.send(r)
})

module.exports = homeRouter