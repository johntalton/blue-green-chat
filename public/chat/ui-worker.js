
export function setupWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./ui-worker.js', { scope: './SCOPE/' })
    .then((reg) => {
      // registration worked
      console.log('Registration succeeded. Scope is ' + reg.scope);
    }).catch((error) => {
      // registration failed
      console.log('Registration failed with ' + error);
    });
  }
}




self.addEventListener('install', e => {
  e.waitUntil(
    caches.open('v1').then((cache) => {
      return cache.addAll([
        './static/services/Foo/',
        './static/services/Foo/foo.json',
      ])
    })
  )
})
self.addEventListener('activate', e => {})
self.addEventListener('message', e => {})
// e.waitUntil
self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request))
})
// e.respondWith
self.addEventListener('sync', e => {})
self.addEventListener('push', e => {})