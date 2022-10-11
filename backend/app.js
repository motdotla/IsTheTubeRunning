const config = require('./utils/config')
const express = require('express')
require('express-async-errors')
const morgan = require('morgan')
const app = express()
const cors = require('cors')
const homeRouter = require('./controllers/home')
const usersRouter = require('./controllers/users')

const { authRequired, authOptional } = require('./middleware/auth0')
const middleware = require('./utils/middleware')
const logger = require('./utils/logger')


if (config.is_non_production) {
  logger.info(`Running in ${process.env.NODE_ENV} mode`)
}

const mongoose = require('mongoose')
logger.info('connecting to', config.MONGO_CONNECTION_STRING)

mongoose.connect(config.MONGO_CONNECTION_STRING)
  .then(() => {
    logger.info('connected to MongoDB')
  })
  .catch((error) => {
    logger.error('error connection to MongoDB:', error.message)
  })

app.use(cors())

// serve front end - not yet!
// app.use(express.static('build'))

app.use(express.json())

morgan.token('body', function getBody(req) { return JSON.stringify(req.body) })
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.use('/', authOptional, homeRouter)
app.use('/api/users', authRequired, usersRouter)


app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app