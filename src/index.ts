import { MessageChannel } from 'worker_threads'

import http from 'http'

import { EndpointService } from './endpoint'
import { bindService } from './application'

// var privateKey  = fs.readFileSync('sslcert/server.key', 'utf-8');
// var certificate = fs.readFileSync('sslcert/server.crt', 'utf-8');
// const credentials = {} // = { key: privateKey, cert: certificate };

const channels = {
  endpoint: {
    rest: new MessageChannel(),
    eventstream: new MessageChannel()
  },
  script: {
    message: new MessageChannel(),
    event: new MessageChannel(),
    persist: new MessageChannel()
  }
}

const eproute = EndpointService.endpoint(channels.endpoint.rest.port1, channels.endpoint.eventstream.port1)
const httpServer = http.createServer(eproute);

async function scripts() {
  await bindService('urn:service/message', channels.script.message.port1)
  await bindService('urn:service/event', channels.script.event.port1)
  await bindService('urn:service/persist', channels.script.persist.port1)
}
scripts()

channels.endpoint.rest.port2.on('message', msg => {
  // channels.script.message.port2.postMessage({ type: msg.data.type, body: msg.data.body })
  channels.script.event.port2.postMessage({ type: 'broadcast', body: msg.body })
  channels.script.persist.port2.postMessage({ type: 'persist', data: msg.body })
})
channels.endpoint.eventstream.port2.on('message', msg => {
  //console.log('proxy message', msg)
  channels.script.event.port2.postMessage({ type: 'connect', port: msg.port }, [msg.port])
})

//  const ip = req.socket.remoteAddress
//  const forwardedFor = req.headers['x-forwarded-for']//.split(/\s*,\s*/)[0];

type SysCallError = Error & {
  code: string,
  errno: number,
  syscall: string,
  address: string,
  port: number
}

function listen(port) {
  // httpsServer.listen(8443, () => console.log('Server Up (s)'))
  httpServer.listen(port)
  httpServer.on('listening', () => { console.log('Server Up', httpServer.address()) })
  httpServer.on('error', e => {
    const sce = e as SysCallError
    if(sce.code !== 'EADDRINUSE') { console.log('Server Error', e) }

    console.log('Server Address in Use, rollover')
    httpServer.close();
    httpServer.listen(port + 1)
  })
  //process.on('SIGTERM', () => { httpServer.close(() => console.log('Server Down')) })
  process.on('SIGINT', () => httpServer.close(e => console.log('Server Restart', e)))
}

//
listen(8080)
