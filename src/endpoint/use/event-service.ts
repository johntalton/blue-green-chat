import { MessageChannel, MessagePort } from 'worker_threads'
// import { performance, PerformanceObserver } from 'perf_hooks'

import express from 'express'

import {
  ServerSentEvents,
  SSE_MIME, SSE_LAST_EVENT_ID, SSE_BOM, SSE_INACTIVE_STATUS_CODE
} from '@johntalton/sse-util'

const EVENT = {
  CLOSE: 'close',
  CONNECT: 'connect'
}

const HEADER = {
  CONTENT_TYPE: 'Content-Type',
  CACHE_CONTROL: 'Cache-Control',
  X_ACCEL_BUFFERING: 'X-Accel-Buffering', // eslint-disable-line spellcheck/spell-checker
  CONNECTION: 'Connection',
  LAST_EVENT_ID: SSE_LAST_EVENT_ID
}

function addHeaders(res: express.Response, manualKeepAlive: boolean) {
  res.setHeader(HEADER.CONTENT_TYPE, SSE_MIME)
  res.setHeader(HEADER.CACHE_CONTROL, 'no-cache, no-transform')
  res.setHeader(HEADER.X_ACCEL_BUFFERING, 'no')
  if(manualKeepAlive) { res.setHeader(HEADER.CONNECTION, 'keep-alive') }
  // Keep-Alive: timeout=<seconds>, max=1000
  // res.setHeader('Content-Encoding', 'deflate'); // gzip deflate br
}

function addSocketOptions(req: express.Request) {
  const timeout = 0 // Infinity
  req.socket.setNoDelay(true)
  req.socket.setKeepAlive(true)
  req.socket.setTimeout(timeout)
}

export class EventSourceService {
  static router(eventStreamPort: MessagePort) {
    const route = express.Router()

    const configuration = {
      active: true,
      writeBOM: true,
      retryTimeMs: 5 * 1000,
      keepAliveIntervalMs: 5 * 1000
    }

    const feeds = {}

    eventStreamPort.on('message', message => {
      if(message.type === 'addRoute') {
        const { name, port } = message
        console.log('Event Service Add Route', name)
        feeds[name] = {
          active: true,
          // writeBOM
          // retryTimeMs
          // keepAliveIntervalMs
          _count: 0,
          port
        }

      } else {
        console.log('Event  Service message', message)
      }
    })

    route.get('/:feed', (req, res) => {
      const feedName = req.params.feed
      console.log('Event Service get feed: ', feedName)

      // if the feed is in-active, then 204 will prevent client reconnects
      if(!configuration.active) { res.status(SSE_INACTIVE_STATUS_CODE).send(); return }

      const feed = feeds[feedName] ?? { active: false }
      if(!feed.active) { res.status(SSE_INACTIVE_STATUS_CODE).send(); return }

      //
      addSocketOptions(req)

      //
      const manualKeepAlive = req.httpVersion !== '2.0'
      addHeaders(res, manualKeepAlive)

      // may include a requested last-id (on start)
      const lastEventID = req.header(HEADER.LAST_EVENT_ID)

      const channel = new MessageChannel()
      channel.port1.addListener('message', msg => {
        // console.log('event message', msg)
        ServerSentEvents.messageToEventStreamLines({ ...msg, data: [ JSON.stringify(msg.data) ] })
          .forEach(line => { res.write(line) })
      })
      // channel.port1.onmessageerror = () => { res.close(); port.postMessage({ type: EVENT.CLOSE }) }

      // handle client closes
      req.on('close', () => {
        console.log('es route request closed event')
        channel.port1.postMessage({ type: EVENT.CLOSE })
        channel.port1.close()
      })
      req.on('end', () => console.log('es request end event'))
      res.on('close', () => console.log('close on the res'))

      // end http setup of event stream by sending OK (200)
      res.writeHead(200)

      // setup manual keep alive timer
      // TODO store timer so it can be canceled
      setInterval(() => res.write(ServerSentEvents.keepAliveToEventStreamLine()), configuration.keepAliveIntervalMs)

      // set retry timeout
      res.write(ServerSentEvents.retryToEventStreamLine(configuration.retryTimeMs))

      if(configuration.writeBOM) { res.write(SSE_BOM + '\n') }

      // channel.port2.postMessage({ event: 'debug', data: { message: 'inline debug - before transfer' } })

      // inform consumer
      feed.port.postMessage({
        type: EVENT.CONNECT,
        feed: feedName,
        lastEventID,
        port: channel.port2
      }, [ channel.port2 ])
    })

    return route
  }
}
