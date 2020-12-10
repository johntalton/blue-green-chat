import { MessagePort } from 'worker_threads'

export async function handler(port: MessagePort) {
  port.addListener('message', msg => {
    if(msg.data.type !== 'POST') { throw new Error('unknown message from api channel: ' + msg.data.type) }

    port.postMessage({ body: msg.data.body })
  })
}
