const { MessageChannel } = require('worker_threads')

const express = require('express')

const cors = require('cors')
const helmet = require("helmet")
const compression = require('compression')
const morgan = require('morgan')

const { RestService, errorHandler, notFound, rateLimiter, speedLimiter } = require('./use')
const { esRoute } = require('./use/esRoute.js')

const MORGAN_BASIC = ':method :url :status :res[content-length] @ :response-time ms'
const MORGAN_EXT = ':status :method :url HTTP/:http-version  :remote-addr @ :response-time ms\x1b[0m'

class EndpointService {
  static endpoint(restPort, eventStreamPort) {
    const app = express()
    //
    app.set('trust proxy', ['loopback']);

    if(true) app.use(helmet())
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

module.exports = { EndpointService }