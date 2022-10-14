const routesRouter = require('express').Router()
const config = require('../utils/config')

const Route = require('../models/Route')

if (config.is_non_production) {
  routesRouter.get('/', async (_request, response) => {
    const usersInDb = await Route.find({})
    response.json(usersInDb)
  })
}

routesRouter.post('/add', async (request, response) => {
 
  response.status(201)
})
module.exports = routesRouter