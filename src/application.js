const { v4: uuidv4 } = require('uuid')


function sendFakeConversation() {
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
}

function bindService(urn, scriptPort, channels) {
  if(urn === 'urn:service/message') return bindRest(scriptPort)
  if(urn === 'urn:service/event') return bindEventStream(scriptPort)
  throw new Error('unknown urn ' + urn)
}


const clientPorts = []



function bindRest(scriptPort) {
  scriptPort.onmessage = msg2 => {
    if(msg2.data.type !== 'POST') throw new Error('unknonw message from api channel: ' + msg2.data.type)

    console.log('app api handler', msg2.data)
    clientPorts.forEach(client => client.port.postMessage({ uuid: client.uuid, data: msg2.data.body }))
  }
}

function bindEventStream(scriptPort) {
  scriptPort.onmessage = msg => {
    if(msg.data.type !== 'connect') throw new Error('unknown message from es channel')
    console.log('sending welcome to client')
    msg.data.port.postMessage({ uuid: 0, message: 'Welcome to: ' + msg.data.feed })
    clientPorts.push({ port: msg.data.port, uuid: uuidv4() })

    //
    sendFakeConversation()
  }
}


module.exports = { bindService }
