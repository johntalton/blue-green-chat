const { v4: uuidv4 } = require('uuid')

const clientPorts = []

async function handleConnect(msg) {
  console.log('event: client connection - welcome')
  clientPorts.push({ port: msg.data.port, uuid: uuidv4() })
}

async function handleBroadcast(msg) {
  console.log('event: braodcast')
  clientPorts.forEach(client => client.port.postMessage({ uuid: client.uuid, data: msg.data.body }))
}

async function bindEventStream(scriptPort) {
  scriptPort.onmessage = msg => {
    if(msg.data.type === 'connect') return handleConnect(msg)
    if(msg.data.type === 'broadcast') return handleBroadcast(msg)
    throw new Error('unknown message from es channel: ' + msg.data.type)
  }
}

module.exports.handler = bindEventStream