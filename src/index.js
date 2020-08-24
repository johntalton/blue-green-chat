
const { MessageChannel } = require('worker_threads')

const http = require('http')
const https = require('https')

const { EndpointService } = require('./endpoint')
const { bindService } = require('./application')

//var privateKey  = fs.readFileSync('sslcert/server.key', 'utf8');
//var certificate = fs.readFileSync('sslcert/server.crt', 'utf8');
const credentials = {} // = { key: privateKey, cert: certificate };

const channels = {
  endpoint: new MessageChannel(),
  eventstream: new MessageChannel(),
  script: new MessageChannel()
}

const endpoint = EndpointService.endpoint(channels.endpoint.port1, channels.eventstream.port1)
const httpServer = http.createServer(endpoint);

bindService('urn:service/message', channels.endpoint.port2, channels)
bindService('urn:service/event', channels.eventstream.port2, channels)

//  const ip = req.socket.remoteAddress
//  const forwardedFor = req.headers['x-forwarded-for']//.split(/\s*,\s*/)[0];

//httpsServer.listen(8443, () => console.log('Server Up (s)'))
httpServer.listen(8080, () => { console.log('Server Up') })
process.on('SIGTERM', () => { httpServer.close(() => console.log('Server Down')) })
process.on('SIGINT', () => httpServer.close(() => console.log('Server Restart')))
