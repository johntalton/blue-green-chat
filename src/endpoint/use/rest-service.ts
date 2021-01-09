import { MessagePort } from 'worker_threads'

import express from 'express'

export class RestService {
  static router(port: MessagePort) {
    const router = express.Router()
    const routes = {}

    port.addListener('message', msg => {
      if(msg.type === 'addRoute') {
        console.log('Rest Service Adding Route', msg.name)
        routes[msg.name] = {
          active: true,
          _create_count: 0,
          port: msg.port
        }
      } else { console.log('unknown message', msg) }
    })

    router.get('/', (req, res) => {
      res.json({ api: true })
    })

    router.post('/:name', (req, res) => {
      const { name } = req.params
      const { body } = req
      const type = 'http.' + req.method

      const route = routes[name] ?? { active: false }

      if(!route.active) {
        console.log('inactive route', name)
        res.status(404).send()
        return
      }

      route._create_count += 1
      console.log('Rest Service', type, name, route._create_count)

      route.port.postMessage({
        type, name, body
      })

      res.setHeader('Server-Timing', 'foo;desc=FooTime;dur=' + 0.5)
      res.send({ thanks: true })
    })

    return router
  }
}
