const config = require('../utils/config')
const { expressjwt: jwt }  = require('express-jwt')
const jwks = require('jwks-rsa')

const authRequired = jwt({
  secret: jwks.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: config.AUTH0_jwksUri
  }),
  audience: config.AUTH0_audience,
  issuer: config.AUTH0_issuer,
  algorithms: ['RS256']
})

const authOptional = jwt({
  secret: jwks.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: config.AUTH0_jwksUri
  }),
  audience: config.AUTH0_audience,
  issuer: config.AUTH0_issuer,
  algorithms: ['RS256'],
  credentialsRequired: false
})


module.exports = {authRequired, authOptional}