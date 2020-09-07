function notFound(req, res, next) {
  res.status(404)
  next(new Error('🎁 ' + req.originalUrl))
}

module.exports = { notFound }
