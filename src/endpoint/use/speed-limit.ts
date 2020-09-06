import * as slowDown from 'express-slow-down'

export const speedLimiter = slowDown({
  windowMs: 1 * 60 * 1000,
  delayAfter: 100, // allowed requests per winsowMS
  delayMs: 500 // additive value
})
