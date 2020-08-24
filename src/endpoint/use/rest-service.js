const express = require('express')

class RestService {
  static router(restPort) {
    const router = express.Router()

    router.get('/', (req, res) => {
      res.json({ api: true })
    })

    router.post('/message', (req, res) => {
      restPort.postMessage({ type: req.method, body: req.body })
      res.send({ messageCreated: false })
    })

    return router
  }
}

module.exports = { RestService }
