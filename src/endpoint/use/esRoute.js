const { MessageChannel } = require('worker_threads')

const express = require('express')

const EVENT = {
  CLOSE: 'close',
  CONNECT: 'connect'
}

const MIME_ALT = 'application/x-dom-event-stream'
const MIME = 'text/event-stream'

const BOM = 0xFEFF // BYTE ORDER MARK

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

function addHeaders(res, addKeepAlive) {
  res.setHeader(HEADER.CONTENT_TYPE, MIME);
  res.setHeader(HEADER.CACHE_CONTROL, 'no-cache, no-transform');
  res.setHeader(HEADER.X_ACCEL_BUFFERING, 'no');
  if(addKeepAlive) { res.setHeader(HEADER.CONNECTION, 'keep-alive') }
  // res.setHeader('Content-Encoding', 'deflate'); // gzip deflate br
 }

function addSocketOptions(req) {
  req.socket.setNoDelay(true);
  req.socket.setKeepAlive(true);
  //req.socket.setTimeout(Infinity);
  req.socket.setTimeout(0);
}


function esRoute(port) {
  const route = express.Router()

  route.get('/:feed', (req, res) => {
    console.log('EventSource Route', req.params.feed)
    //
    addSocketOptions(req)

    //
    const addKeepAlive = req.httpVersion !== '2.0'
    addHeaders(res, addKeepAlive)

    // may include a requested last-id (on start)
    const lastEventID = req.header(HEADER.LAST_EVENT_ID)

    const channel = new MessageChannel()
    channel.port1.onmessage = msg => {
      const lines = formatMessageToEventStream(msg.data)
      console.log('lines', lines)
      for (line of lines) { res.write(line) }
    }
    //channel.port1.onmessageerror = () => { res.close(); port.postMessage({ type: EVENT.CLOSE }) }

    // handle client closes
    req.on('close', err => channel.port1.postMessage({ type: EVENT.CLOSE }, err))

    // end http setup of event stream by sending OK (200)
    res.writeHead(200);

    res.write('retry: 10000\n\n') // sets retyr timeout in ms

    const writeBOM = false
    if(writeBOM) { res.write(BOM) }

    // inform consumer
    port.postMessage({
      type: EVENT.CONNECT,
      feed: req.params.feed,
      lastEventID,
      port: channel.port2
    }, { transfer: [ channel.port2 ] })
  })

  return route
}

function formatMessageToEventStream(obj) {
  const mld = [ JSON.stringify(obj) ]
  return formatMultiLineMessageToEventStream({ ...obj, multilineData: mld })
}

function formatMultiLineMessageToEventStream(obj) {
  const comment = ES.COMMENT + 'yo' + ES.END_OF_LINE
  const event = obj.event ? ES.EVENT + obj.event + ES.END_OF_LINE : undefined
  const id = obj.id ? ES.ID + obj.id + ES.END_OF_LINE : undefined
  const datas = obj.multilineData.map(d => ES.DATA + d + ES.END_OF_LINE)
  const retry = obj.retry ? ES.RETRY + parseInt(obj.retry) + ES.END_OF_LINE : undefined

  return [
    // order of field names could be used to fingerprint
    comment, event, id, ...datas, retry, ES.FINAL_END_OF_LINE
  ].filter(line => line !== undefined)
}

module.exports = { esRoute }