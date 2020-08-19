import '../perf.js'
import { setupUI } from './ui.js'
// import { setupWorker } from './ui-worker.js'

async function loaded(event) {
  console.log('finished loadeding', event)
  const es = new EventSource('/services/es/chat', { withCredentials: true })
  const ui = await setupUI(es)
  //const uiw = await setupWorker()
}

document.addEventListener('readystatechange', event => console.log('ready state change', event, document.readyState))
if(document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loaded)
} else {
  loaded()
}