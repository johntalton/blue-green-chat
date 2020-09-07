export async function handler(scriptPort) {
  scriptPort.onmessage = msg => {
    if(msg.data.type !== 'POST') { throw new Error('unknown message from api channel: ' + msg.data.type) }

    scriptPort.postMessage({ body: msg.data.body })
  }
}
