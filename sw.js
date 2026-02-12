// ================================================================
// SERVICE WORKER - POS Kasir Grosir
// Versi cache: update angka ini setiap kali ada update file
// ================================================================

const CACHE_NAME = 'pos-kasir-v1';
const FILES_TO_CACHE = [
  './',
  './index.html',
  './manifest.json'
];

// Install: simpan file ke cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Caching app files');
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate: hapus cache lama
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keyList =>
      Promise.all(
        keyList.map(key => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// Fetch: ambil dari cache dulu, fallback ke network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) {
        return response; // dari cache
      }
      return fetch(event.request).then(networkResponse => {
        // Simpan response baru ke cache
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Offline & tidak ada cache — tampilkan index
        return caches.match('./index.html');
      });
    })
  );
});
