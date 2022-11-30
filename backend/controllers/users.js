const usersRouter = require('express').Router()
const config = require('../utils/config')


const User = require('../models/User')

if (config.is_non_production) {
  usersRouter.get('/', async (_request, response) => {
    const usersInDb = await User.find({})
    response.json(usersInDb)
  })
}

usersRouter.post('/add', async (request, response) => {
  const user = request.body
  console.log('user', user, 'auth', request.auth)

  const newuser = new User(
    { identifier: request.auth.sub,
    authSource: 'auth0' }
  )

  const result = await User.findOneAndUpdate({ 'identifier':newuser.identifier },{ newuser, upsert: true })
  response.status(201).json(result)
})
module.exports = usersRouter