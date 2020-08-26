async function bindRest(scriptPort) {
  scriptPort.onmessage = msg => {
    if(msg.data.type !== 'POST') throw new Error('unknonw message from api channel: ' + msg.data.type)

    scriptPort.postMessage({ body: msg.data.body })

    // console.log('app api handler', msg2.data)
  }
}

module.exports.handler = bindRest