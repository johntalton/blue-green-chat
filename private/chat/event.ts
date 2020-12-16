import { MessagePort } from 'worker_threads'
import { v4 as uuidv4 } from 'uuid'

const clientPorts: Array<{ uuid: string, port: MessagePort }> = []

async function handleConnect(msg) {
  console.log('Event Service: client connection - welcome')
  clientPorts.push({ port: msg.data.port, uuid: uuidv4() })
}

async function handleBroadcast(msg) {
  console.log('Event Service: broadcast message', msg.data)
  clientPorts.forEach(client => client.port.postMessage({ uuid: client.uuid, data: msg.data.body }))
}

export async function handler(scriptPort) {
  scriptPort.onmessage = msg => {
    if(msg.data.type === 'connect') { return handleConnect(msg) }
    if(msg.data.type === 'broadcast') { return handleBroadcast(msg) }
    throw new Error('unknown message from es channel: ' + msg.data.type)
  }
}
