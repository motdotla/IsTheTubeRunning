const config = require('./utils/config')
const express = require('express')
require('express-async-errors')
const morgan = require('morgan')
const app = express()
// const cors = require('cors')
const queryRouter = require('./controllers/query')

const middleware = require('./middleware/middleware')
const logger = require('./middleware/logger')


if (config.is_non_production) {
  logger.info(`Running in ${process.env.NODE_ENV} mode`)
}

// app.use(cors())

// serve front end - not yet!
// app.use(express.static('build'))

app.use(express.json())

morgan.token('body', function getBody(req) { return JSON.stringify(req.body) })
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.use('/',  queryRouter)


app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app