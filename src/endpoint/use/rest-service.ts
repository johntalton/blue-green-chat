import { MessagePort } from 'worker_threads'

import express from 'express'

export class RestService {
  static router(restPort: MessagePort) {
    const router = express.Router()

    router.get('/', (req, res) => {
      res.json({ api: true })
    })

    router.post('/message', (req, res) => {
      restPort.postMessage({ type: req.method, body: req.body })

      res.setHeader('Server-Timing', 'foo;desc=FooTime;dur=' + 0.5)
      res.send({ messageCreated: false })
    })

    return router
  }
}
