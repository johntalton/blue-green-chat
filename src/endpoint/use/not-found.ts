import express from 'express'

export function notFound(req: express.Request, res: express.Response, next: express.NextFunction) {
  res.status(404)
  next(new Error('🎁 ' + req.originalUrl))
}
