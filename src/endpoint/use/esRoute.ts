import { MessageChannel, MessagePort } from 'worker_threads'

import * as express from 'express'

const EVENT = {
  CLOSE: 'close',
  CONNECT: 'connect'
}

// const MIME_ALT = 'application/x-dom-event-stream'
const MIME = 'text/event-stream'

const BOM = '\xFE\xFF' // BYTE ORDER MARK

const ENDING = {
  LF: '\n',
  CR: '\n',
  CRLF: '\r\n'
}

const COLON = ': ' // space after colon could be used to fingerprint implementations

const ES = {
  END_OF_LINE: ENDING.LF,
  FINAL_END_OF_LINE: ENDING.LF,

  COMMENT: COLON,
  EVENT: 'event' + COLON,
  ID: 'id' + COLON,
  DATA: 'data' + COLON,
  RETRY: 'retry' + COLON
}

const HEADER = {
  CONTENT_TYPE: 'Content-Type',
  CACHE_CONTROL: 'Cache-Control',
  X_ACCEL_BUFFERING: 'X-Accel-Buffering',
  CONNECTION: 'Connection',
  LAST_EVENT_ID: 'Last-Event-ID'
}

function addHeaders(res: express.Response, addKeepAlive: boolean) {
  res.setHeader(HEADER.CONTENT_TYPE, MIME);
  res.setHeader(HEADER.CACHE_CONTROL, 'no-cache, no-transform');
  res.setHeader(HEADER.X_ACCEL_BUFFERING, 'no');
  if(addKeepAlive) { res.setHeader(HEADER.CONNECTION, 'keep-alive') }
  // res.setHeader('Content-Encoding', 'deflate'); // gzip deflate br
 }

function addSocketOptions(req: express.Request) {
  req.socket.setNoDelay(true);
  req.socket.setKeepAlive(true);
  //req.socket.setTimeout(Infinity);
  req.socket.setTimeout(0);
}


export function esRoute(eventStreamPort: MessagePort) {
  const route = express.Router()

  route.get('/:feed', (req, res) => {
    console.log('EventSource Route', req.params.feed)
    const writeBOM = true
    const retryTimeMs = 10 * 1000

    //
    addSocketOptions(req)

    //
    const addKeepAlive = req.httpVersion !== '2.0'
    addHeaders(res, addKeepAlive)

    // may include a requested last-id (on start)
    const lastEventID = req.header(HEADER.LAST_EVENT_ID)

    const channel = new MessageChannel()
    //channel.port1.onmessage = msg => {
    channel.port1.addListener('message', msg => {
      const lines = formatMessageToEventStream(msg.data)
      console.log('lines', lines)
      for (let line of lines) { res.write(line) }
    })
    //channel.port1.onmessageerror = () => { res.close(); port.postMessage({ type: EVENT.CLOSE }) }

    // handle client closes
    req.on('close', () => channel.port1.postMessage({ type: EVENT.CLOSE }))

    // end http setup of event stream by sending OK (200)
    res.writeHead(200);

    // set retry timeout
    res.write(ES.RETRY + retryTimeMs + ES.END_OF_LINE)

    if(writeBOM) { res.write(BOM) }

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

function formatMessageToEventStream(obj) {
  const mld = [ JSON.stringify(obj) ]
  return formatMultiLineMessageToEventStream({ ...obj, multilineData: mld })
}

function formatMultiLineMessageToEventStream(obj): Array<string> {
  const comment = ES.COMMENT + '🦄' + ES.END_OF_LINE
  const event = obj.event ? ES.EVENT + obj.event + ES.END_OF_LINE : undefined
  const id = obj.id ? ES.ID + obj.id + ES.END_OF_LINE : undefined
  const datas = obj.multilineData.map(d => ES.DATA + d + ES.END_OF_LINE)
  const retry = obj.retry ? ES.RETRY + parseInt(obj.retry) + ES.END_OF_LINE : undefined

  return [
    // order of field names could be used to fingerprint
    comment, event, id, ...datas, retry, ES.FINAL_END_OF_LINE
  ].filter(line => line !== undefined)
}
