
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
