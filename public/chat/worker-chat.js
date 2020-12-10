self.addEventListener('install', evt => {
  console.log('here i am jk', evt)
  evt.waitUntil(
    caches.open('v1').then((cache) => {
      return cache.addAll([
        '/static/chat/index.html'
      ])
    })
  )
})

self.addEventListener('activate', e => {
  console.log('worked activate')

  return self.clients.claim();
})


self.addEventListener('fetch', evt => {
  console.log('worker fetch', evt.request)
  // evt.respondWith(caches.match(evt.request).then(response => {
  //   if(response !== undefined) { return response }
  //   return ''
  // }))

  evt.respondWith(fetch(evt.request))
})
