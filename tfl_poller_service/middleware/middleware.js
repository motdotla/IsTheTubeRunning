const logger = require('./logger')
// const jwt = require('jsonwebtoken')
const config = require('../utils/config')


const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  logger.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  } else if (error.name === 'JsonWebTokenError') {
    return response.status(401).json({ error: 'invalid token' })
  } else if (error.name === 'TokenExpiredError') {
    return response.status(401).json({ error: 'token expired' })
  }
  next(error)
}

/*
const userExtractor = (request, response, next) => {
  //if (config.TESTMODE) {console.log('request:', request)}


  const getTokenFrom = request => {
    if (config.TESTMODE) {console.log('extracting token')}

    const authorization = request.get('authorization')

    if (config.TESTMODE) {console.log('got authorization header', authorization)}

    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
      if (config.TESTMODE) {console.log('got bearer header', authorization.substring(7))}

      return authorization.substring(7)
    }
    return null
  }

  const token = getTokenFrom(request)
  if (!token) {
    request.user = null
    //console.log('set user to null')
  } else {
    const extractedToken = jwt.verify(token, config.JWT_SECRET).id
    //console.log('token', token, 'extractedToken', extractedToken, 'return', isEmptyObject(extractedToken) ? null : extractedToken)
    request.user = isEmptyObject(extractedToken) ? null : extractedToken
  }
  //console.log('set request.user', request.user)
  next()
}
*/
const isEmptyObject = (obj) => {
  return obj
    && Object.keys(obj).length === 0
    && Object.getPrototypeOf(obj) === Object.prototype
}
module.exports = {
  unknownEndpoint,
  errorHandler,
  isEmptyObject
  //userExtractor
}