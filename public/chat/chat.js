// import '../perf.js'
import { setupUI } from './ui.js'
// import { setupWorker } from './ui-worker.js'

const es = new EventSource('/services/es/chat', { withCredentials: true })

async function loaded(event) {
  // console.log('finished loadeding', event)
  const ui = await setupUI(es)
  //const uiw = await setupWorker()

  // const reg = await navigator.serviceWorker.register('worker-chat.js', {
  //   scope: '/static/chat/'
  // })

  //const reg2 = await navigator.serviceWorker.ready
  //console.log(reg2.active)

  // reg2.addEventListener('statechange', state => {
  //   console.log('workerState', state)
  // })
}

//document.addEventListener('readystatechange', event => console.log('ready state change', event, document.readyState))
if(document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loaded)
} else {
  loaded()
}
