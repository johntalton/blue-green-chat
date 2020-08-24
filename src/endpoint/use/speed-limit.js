const slowDown = require("express-slow-down")

const speedLimiter = slowDown({
  windowMs: 1 * 60 * 1000,
  delayAfter: 100, // allowed requests per winsowMS
  delayMs: 500 // additive value
})

module.exports = { speedLimiter }