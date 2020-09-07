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

channels.endpoint.rest.port2.addListener('message', msg => {
  //channels.script.message.port2.postMessage({ type: msg.data.type, body: msg.data.body })
  channels.script.event.port2.postMessage({ type: 'broadcast', body: msg.data.body })
})
channels.endpoint.eventstream.port2.addListener('message', msg => {
  channels.script.event.port2.postMessage({ type: 'connect', body: msg.data.body, port: msg.data.port }, [msg.data.port])
})

//  const ip = req.socket.remoteAddress
//  const forwardedFor = req.headers['x-forwarded-for']//.split(/\s*,\s*/)[0];

// httpsServer.listen(8443, () => console.log('Server Up (s)'))
httpServer.listen(8080, () => { console.log('Server Up') })
process.on('SIGTERM', () => { httpServer.close(() => console.log('Server Down')) })
process.on('SIGINT', () => httpServer.close(() => console.log('Server Restart')))
