async function handleEvent(event) {
  console.log('handlEvent:', JSON.parse(event.data), event)
}
async function handlePing(event) {
  console.log('handlePing:', event)
}

async function setupES() {
  // const r = await fetch('/api')
  // console.log(await r.json())

  const es = new EventSource('/services/es/feedName', { withCredentials: true })
  es.onopen = () => console.log('EventSource open')
  es.onerror = err => console.log('EventSource error', err, err.target.readyState)
  es.onmessage = event => handleEvent(event)

  es.addEventListener('ping', handlePing)

  return es
}

async function setupWS() {
  const ws = new WebSocket('ws://localhost:5000/thisIsFake')
  ws.onopen = () => { console.log('ws:open'); ws.send(JSON.stringify({ hello: true })) }
  ws.onmessage = msg => console.log('ws:message', msg)
  ws.onerror = err => console.log('ws:error', err)
}

async function setupGoButton(es) {
  const go = document.getElementById('go')
  go.addEventListener('click', event => {
    es.close()
    console.log('click', event)
  })
}



async function loaded(event) {
  console.log('finished loadeding', event)
  const es = await setupES()
  await setupWS()
  await setupGoButton(es)
}

document.addEventListener('readystatechange', event => console.log('ready state change', event, document.readyState))
if(document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loaded)
} else {
  loaded()
}