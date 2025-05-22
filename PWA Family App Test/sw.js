self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('family-app-v3').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/events.html',
        '/electricity.html',
        '/water.html',
        '/petrol.html',
        '/maintenance.html',
        '/budgets.html',
        '/settings.html',
        '/chat.html',
        '/manifest.json',
        '/icons/icon-192x192.png',
        '/image/user(1).png'
      ]).then(() => self.skipWaiting());
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((cacheName) => cacheName !== 'family-app-v3')
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((networkResponse) => {
        if (event.request.method === 'GET' && event.request.url.startsWith(self.location.origin)) {
          const cache = caches.open('family-app-v3');
          cache.put(event.request, networkResponse.clone());
        }
        return networkResponse;
      }).catch(() => {
        return caches.match('/');
      });
    })
  );
});