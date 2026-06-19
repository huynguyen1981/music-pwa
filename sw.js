const CACHE_NAME = 'drivecompanion-v3'; // Tăng version để ép trình duyệt dọn sạch rác cũ
const ASSETS = [
  './',
  'index.html',
  'manifest.json',
  'icon-192.png',
  'icon-512.png'
];

// 1. Cài đặt và ép cache file tĩnh của hệ thống app
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// 2. Kích hoạt và dọn sạch bách các ổ cache cũ lỗi thời
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

// 3. Luồng Fetch an toàn: Chỉ cache những file tĩnh thuộc nội bộ app, còn lại cho đi thẳng ra mạng
self.addEventListener('fetch', (e) => {
  // Bỏ qua hoàn toàn, không can thiệp vào request của YouTube hoặc các bên thứ ba
  if (!e.request.url.startsWith(self.location.origin)) {
    return; 
  }

  e.respondWith(
    fetch(e.request)
      .then((res) => {
        // Chỉ lưu cache nếu request thành công và là file nội bộ sạch
        if (res.status === 200 && e.request.method === 'GET') {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, resClone);
          });
        }
        return res;
      })
      .catch(() => {
        // Mất mạng hoàn toàn thì lôi file tĩnh trong cache ra cứu cánh
        return caches.match(e.request);
      })
  );
});
