import { MessageChannel, MessagePort } from 'worker_threads'
import {
  performance,
  PerformanceObserver
} from 'perf_hooks'

import express from 'express'

import {
  ServerSentEvents,
  SSE_MIME, SSE_LAST_EVENT_ID, SSE_BOM, SSE_INACTIVE_STATUS_CODE
} from './sse'

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
  res.setHeader(HEADER.CONTENT_TYPE, SSE_MIME);
  res.setHeader(HEADER.CACHE_CONTROL, 'no-cache, no-transform');
  res.setHeader(HEADER.X_ACCEL_BUFFERING, 'no');
  if(manualKeepAlive) { res.setHeader(HEADER.CONNECTION, 'keep-alive') }
  // Keep-Alive: timeout=<seconds>, max=1000
  // res.setHeader('Content-Encoding', 'deflate'); // gzip deflate br
}

function addSocketOptions(req: express.Request) {
  const timeout = 0 // Infinity
  req.socket.setNoDelay(true);
  req.socket.setKeepAlive(true);
  req.socket.setTimeout(timeout);
}

export class EventSourceService {
  static router(eventStreamPort: MessagePort) {
    const route = express.Router()

    const configuration = {
      active: true,
      writeBOM: true,
      retryTimeMs: 10 * 1000,
      keepAliveIntervalMs: 3 * 1000
    }

    route.get('/:feed', (req, res) => {
      console.log('EventSource Route', req.params.feed)

      // if the feed is in-active, then 204 will prevent client reconnects
      if(!configuration.active) { res.status(SSE_INACTIVE_STATUS_CODE); return }

      //
      addSocketOptions(req)

      //
      const manualKeepAlive = req.httpVersion !== '2.0'
      addHeaders(res, manualKeepAlive)

      // may include a requested last-id (on start)
      const lastEventID = req.header(HEADER.LAST_EVENT_ID)

      const channel = new MessageChannel()
      channel.port1.addListener('message', msg => ServerSentEvents.formatMessageToEventStream(msg.data)
          .forEach(line => res.write(line)))
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
      res.writeHead(200);

      // setup manual keep alive timer
      setInterval(() => res.write(ServerSentEvents.keepAliveLine()), configuration.keepAliveIntervalMs)

      // set retry timeout
      res.write(ServerSentEvents.retryLine(configuration.retryTimeMs))

      if(configuration.writeBOM) { res.write(SSE_BOM) }

      // inform consumer
      eventStreamPort.postMessage({
        type: EVENT.CONNECT,
        feed: req.params.feed,
        lastEventID,
        port: channel.port2
      }, [ channel.port2 ])
    })

    return route
  }
}
