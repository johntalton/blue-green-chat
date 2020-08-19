const EventEmitter = require('events')
const { MessageChannel } = require('worker_threads')
//console.log(NodeEventTarget)

class SSECallback {
  dispatchEvent(event) {
    console.log('cb:event', event)

  }
}

class SSEEventEmitter extends EventEmitter {
  dispatchEvent(event) {
    console.log('SSE ET', event)
    this.emit(event)
  }
}

// --

class SSEChannel {
  constructor() {
    this.channel = new MessageChannel()
    this.channel.port1.on('close', () => {})
    this.channel.port1.on('message', message => {})
    this.channel.port1.on('messageerror', error => {})
  }

  on(event, listener) { return this.channel.port2.on(event, listener) }

  //new MessageChannel()
  dispatchEvent(event) {
    //
    this.channel.port1.postMessage(event)
  }
}

class SSEMqtt {
  dispatchEvent(event) {

  }
}

const SSEEventTarget = SSEChannel
module.exports = { SSEEventTarget }