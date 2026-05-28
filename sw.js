const CACHE_NAME = 'drivecompanion-v1';
const ASSETS_TO_CACHE = [
  'index.html',
  'manifest.json',
  'icon-192.png',
  'icon-512.png'
];

// Sự kiện cài đặt Service Worker và lưu trữ tài nguyên tĩnh vào Cache Storage
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching Core App Shell assets...');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Kích hoạt worker mới và xóa bỏ cache cũ nếu có
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('Removing old cache store:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Chiến lược Fetch: Ưu tiên lấy từ mạng trực tiếp để đồng bộ luồng Iframe YouTube mượt nhất
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
