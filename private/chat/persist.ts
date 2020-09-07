import { Story } from './story'

export async function handler(scriptPort) {
  scriptPort.onmessage = async msg => {
    if(msg.data.type !== '') { throw new Error('unknown message on persist') }
    console.log('persist request', msg.data)

    const story = await Story.store('urn:persist/message', './story')
    await story.update('file name', msg.data)
  }
}
