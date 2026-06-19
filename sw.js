const CACHE_NAME = 'drivecompanion-v2'; // Đổi tên version để ép trình duyệt xóa cache cũ
const ASSETS = [
  'index.html',
  'manifest.json',
  'icon-192.png',
  'icon-512.png'
];

// Cài đặt Service Worker và lưu cache cơ bản
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Xóa bỏ các Cache cũ để tránh xung đột code
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Chiến thuật Network-First: Ưu tiên mạng, lỗi mạng mới dùng Cache
self.addEventListener('fetch', (e) => {
  // Không cache các request gọi tới Youtube API
  if (e.request.url.includes('youtube.com') || e.request.url.includes('ytimg.com')) {
    return;
  }
  
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        // Lưu bản mới nhất vào cache để thủ sẵn
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, resClone);
        });
        return res;
      })
      .catch(() => caches.match(e.request)) // Mất mạng thì lấy trong cache ra
  );
});
