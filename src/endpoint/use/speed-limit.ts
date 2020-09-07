import slowDown from 'express-slow-down'

export const speedLimiter = slowDown({
  windowMs: 1 * 60 * 1000,
  delayAfter: 100, // allowed requests per windowsMs
  delayMs: 500 // additive value
})
