import { MessagePort } from 'worker_threads'

import express from 'express'

export class RestService {
  static router(port: MessagePort) {
    const router = express.Router()
    const routes = {}

    port.addListener('message', msg => {
      routes[msg.name] = {}
    })

    router.get('/', (req, res) => {
      res.json({ api: true })
    })

    router.post('/:name', (req, res) => {
      const { name } = req.params;
      const { body } = req;
      const type = 'http.' + req.method;

      //if(!validScope(scope)) { res.status(404).send(); }

      port.postMessage({
        type, name, body
      })

      res.setHeader('Server-Timing', 'foo;desc=FooTime;dur=' + 0.5)
      res.send({ thanks: true })
    })

    return router
  }
}
