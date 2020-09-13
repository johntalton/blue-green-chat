import { Story } from './story'

export async function handler(scriptPort) {
  scriptPort.onmessage = async msg => {
    if(msg.data.type !== 'persist') { throw new Error('unknown message on persist') }

    const story = await Story.store('urn:persist/message', './public/chat/story')
    await story.update('file name', msg.data.data)
  }
}
