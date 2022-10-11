const usersRouter = require('express').Router()
const config = require('../utils/config')


const User = require('../models/User')

if (config.is_non_production) {
  usersRouter.get('/', async (_request, response) => {
    const usersInDb = await User.find({})
    response.json(usersInDb)
  })
}

module.exports = usersRouter