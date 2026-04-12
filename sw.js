const CACHE = 'sm101-v1';
// './'를 추가해야 메인 주소 접속 시 index.html을 찾을 수 있습니다.
const URLS = ['./', './index.html', './manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(URLS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// 핵심: 캐시를 먼저 확인하는 전략으로 변경
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(response => {
      // 캐시에 있으면 즉시 반환, 없으면 네트워크 시도
      return response || fetch(e.request).then(networkResponse => {
        return caches.open(CACHE).then(cache => {
          cache.put(e.request, networkResponse.clone());
          return networkResponse;
        });
      });
    })
  );
});
