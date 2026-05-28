const CACHE_NAME = 'drivecompanion-v2';
const ASSETS_TO_CACHE = [
  'index.html',
  'manifest.json',
  'icon-192.png',
  'icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Chỉ xử lý cache các file tĩnh nội bộ app, bypass toàn bộ luồng mạng bên ngoài để tránh nghẽn channel
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (ASSETS_TO_CACHE.some(asset => url.pathname.endsWith(asset))) {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        return cachedResponse || fetch(event.request);
      })
    );
  }
});
