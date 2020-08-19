
const { MessageChannel } = require('worker_threads')

const http = require('http')
const https = require('https')

//var privateKey  = fs.readFileSync('sslcert/server.key', 'utf8');
//var certificate = fs.readFileSync('sslcert/server.crt', 'utf8');
const credentials = {} // = { key: privateKey, cert: certificate };

const endpoint = EndpointService.endpoint()
const httpServer = http.createServer(endpoint);



const channelPersist = new MessageChannel()
const channelAPI = new MessageChannel()
const channelES = new MessageChannel()

const clientPorts = []
channelES.port2.onmessage = msg => {
  if(msg.data.type !== 'connect') throw new Error('unknown message from es channel')
  console.log('sending welcome to client')
  msg.data.port.postMessage({ uuid: 0, message: 'Welcome to: ' + msg.data.feed })
  clientPorts.push({ port: msg.data.port, uuid: uuidv4() })

  //
  sendFakeConversation()
}
channelAPI.port2.onmessage = msg2 => {
  if(msg2.data.type !== 'post') throw new Error('unknonw message from api channel')

  console.log('app api handler', msg2.data)
  clientPorts.forEach(client => client.port.postMessage({ uuid: client.uuid, data: msg2.data }))
}

sendFakeConversation
const suffle = list => list
  .map(a => [Math.random(), a])
  .sort((a, b) => a[0] - b[0])
  .map(a => a[1])

const personOne = [
  'Hows it going?',
  'Tell me about it',
  '😀', '😳'
]

const personTwo = [
  'good, you?',
  'you should have seen the other guy!',
  '🤦🏻‍♂️', '🦄'
]





//  const ip = req.socket.remoteAddress
//  const forwardedFor = req.headers['x-forwarded-for']//.split(/\s*,\s*/)[0];



//httpsServer.listen(8443, () => console.log('Server Up (s)'))
httpServer.listen(8080, () => { console.log('Server Up') })
process.on('SIGTERM', () => { httpServer.close(() => console.log('Server Down')) })
process.on('SIGINT', () => httpServer.close(() => console.log('Server Restart')))