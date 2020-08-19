const { MessageChannel } = require('worker_threads')

const express = require('express')

const cors = require('cors')
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")
const slowDown = require("express-slow-down")
const compression = require('compression')
const morgan = require('morgan')

const { errorHandler, notFound } = require('./use')

const MORGAN_BASIC = ':method :url :status :res[content-length] @ :response-time ms'
const MORGAN_EXT = ':status :method :url HTTP/:http-version  :remote-addr @ :response-time ms\x1b[0m'

export class EndpointService {
  static endpoint() {
    const app = express()
    //
    app.set('trust proxy', ['loopback']);

    app
      .use(morgan(MORGAN_EXT))
      .use(limiter)
      .use(speedLimiter)

    if(false) app.use(helmet())
    if(false) app.use(compression())

    app.use('/services', express.Router()
      .use(cors())
      .use(express.json())
      .use('/', APIRoute.extend(channelAPI.port1))
      .use('/es', esRoute(channelES.port1)))

    if(true) app.use('/static', express.static('./public'))

    app.use(notFound)
    app.use(errorHandler)

    return app
  }
}
