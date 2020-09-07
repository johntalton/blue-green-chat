import { MessagePort } from 'worker_threads'
import express from 'express'

import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'

import { esRoute, RestService, errorHandler, notFound, rateLimiter, speedLimiter } from './use'

// const MORGAN_BASIC = ':method :url :status :res[content-length] @ :response-time ms'
// eslint-disable-next-line spellcheck/spell-checker
const MORGAN_EXT = ':status :method :url HTTP/:http-version  :remote-addr @ :response-time ms\x1b[0m'

export class EndpointService {
  static endpoint(restPort: MessagePort, eventStreamPort: MessagePort) {
    const app = express()
    //
    app.set('trust proxy', ['loopback']);

    if(false) app.use(helmet())
    if(false) app.use(compression())

    app
      .use(morgan(MORGAN_EXT))
      .use(rateLimiter)
      .use(speedLimiter)

    app.use('/services', express.Router()
      .use(cors())
      .use(express.json())
      .use('/', RestService.router(restPort))
      .use('/es', esRoute(eventStreamPort)))

    if(true) app.use('/static', express.static('./public'))

    // storage overlay for index
    app.use('/static/chat/story', (req, res) => {
      console.log('WERE ARE HERE 🔥', req.url, req.query)
      res.status(418)
      res.end()
    })

    app.use(notFound)
    app.use(errorHandler)

    return app
  }
}
