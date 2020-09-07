import { MessagePort } from 'worker_threads'

const lookup: Record<string, string> = {
  'urn:service/message': '../private/chat/message',
  'urn:service/event': '../private/chat/event',
  'urn:service/persist': '../private/chat/persist'
}

export async function bindService(urn: string, scriptPort: MessagePort) {
  if(lookup[urn] !== undefined) {
    const script = await import(lookup[urn])
    return script.handler(scriptPort)
  }
  throw new Error('unknown urn ' + urn)
}
