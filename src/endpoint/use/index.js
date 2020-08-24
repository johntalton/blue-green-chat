const { RestService } = require('./rest-service.js')

const { rateLimiter } = require('./rate-limit.js')
const { speedLimiter } = require('./speed-limit.js')
const { notFound } = require('./not-found.js')
const { errorHandler } = require('./error.js')

module.exports = {
	RestService,
	rateLimiter, speedLimiter,
	notFound, errorHandler
}