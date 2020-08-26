
const { Story } = require('./story')


async function bindPersist(scriptPort) {
  scriptPort.onmessage = async msg => {
    if(msg.data.type !== '') throw new Error('unknonw message from persit channel')
    console.log('persist request', msg.data)

    const story = Story.store('urn:persist/message', './story')
    await story.update('file name', msg.data)
  }
}

module.exports.handler = bindPersist