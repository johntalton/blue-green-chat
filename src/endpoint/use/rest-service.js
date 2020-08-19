const express = require('express')

export class RestService {
  extendRoute(port) {
    const router = express.Router()

    router.get('/', (req, res) => {
      res.json({ api: true })
    })

    router.post('/message', (req, res) => {
      try {
        console.log('message router posting message to api port', req.body)
        port.postMessage({ type: 'post', body: req.body })
        res.send({ messageCreated: false })
      }
      catch (e) {
        console.log('post message error', e)
      }
    })

    return router
  }
}
