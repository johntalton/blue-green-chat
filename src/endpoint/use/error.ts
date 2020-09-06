export function errorHandler(err, req, res, next) {
  if(res.statusCode === 200) res.status(500)
  //else res.status(res.statusCode)

  res.json({ message: err.message })
}
