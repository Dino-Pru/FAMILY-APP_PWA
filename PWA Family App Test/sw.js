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
        '/image/user(1).png',
        'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css',
        'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/webfonts/fa-solid-900.woff2',
        'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/webfonts/fa-solid-900.ttf'
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
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // Handle navigation requests (e.g., HTML pages)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        // If not cached, try to fetch from network
        return fetch(event.request).catch(() => {
          // If fetch fails (offline), try to match the request URL to a cached page
          const path = requestUrl.pathname;
          return caches.match(path).then((pathResponse) => {
            return pathResponse || caches.match('/index.html');
          });
        });
      })
    );
  } else {
    // Handle other requests (e.g., CSS, images, fonts)
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((networkResponse) => {
          if (event.request.method === 'GET') {
            caches.open('family-app-v3').then((cache) => {
              cache.put(event.request, networkResponse.clone());
            });
          }
          return networkResponse;
        }).catch(() => {
          // If fetch fails, return nothing (browser will handle missing assets)
          return new Response('', { status: 404 });
        });
      })
    );
  }
});