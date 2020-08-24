function errorHandler(err, req, res, next) {
  console.log('ERROR Handler', err.toString())
  if(res.statusCode === 200) res.status(500)
  else res.status(res.statusCode)

  res.json({ message: err.message })
}

module.exports = { errorHandler }