const rateLimit = require("express-rate-limit")

const rateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100
})

module.exports = { rateLimiter }