require('dotenv').config()
console.log(process.env) 

const PORT = process.env.PORT || 8080
const MONGO_CONNECTION_STRING = process.env.MONGO_CONNECTION_STRING || null
const is_non_production = process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development'

const AUTH0_audience= process.env.AUTH0_audience
const AUTH0_issuer= process.env.AUTH0_issuer
const AUTH0_jwksUri= process.env.AUTH0_jwksUri


module.exports = {
  PORT,
  MONGO_CONNECTION_STRING,
  is_non_production,
  AUTH0_audience,
  AUTH0_issuer,
  AUTH0_jwksUri }