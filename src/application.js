const lookup = {
  'urn:service/message': '../private/chat/message',
  'urn:service/event': '../private/chat/event',
  'urn:service/persist': '../private/chat/persist'
}

async function bindService(urn, scriptPort, channels) {
  if(lookup[urn] !== undefined) return require(lookup[urn]).handler(scriptPort)
  throw new Error('unknown urn ' + urn)
}


module.exports = { bindService }
