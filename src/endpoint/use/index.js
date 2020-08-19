const { apiRoute } = require('./apiRoute.js')
const { esRoute } = require('./esRoute.js')
const { wsRoute } = require('./wsRoute.js')
const { rateLimiter } = require('./rate-limit.js')
const { speedLimiter } = require('./speed-limit.js')
const { notFound } = require('./not-found.js')
const { errorHandler } = require('./error.js')

module.exports = {
	apiRoute, esRoute, wsRoute,
	rateLimiter, speedLimiter,
	notFound, errorHandler
}