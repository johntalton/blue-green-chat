import { MessagePort } from 'worker_threads'

export async function handler(port: MessagePort) {
  port.addListener('message', msg => {
    if(msg.type !== 'http.POST') { throw new Error('unknown message from api channel: ' + msg.type) }

    console.log('Message Service create requested by name', msg.name)
    console.log('with body', msg.body)
    console.log('message successfully create and update and will broadcast update')

    // send the message added update
    port.postMessage({ type: 'broadcast', body: msg.body })
  })
}
