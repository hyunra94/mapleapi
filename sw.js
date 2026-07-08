const CACHE_NAME = 'maple-scheduler-v1';
const APP_SHELL = ['./', './index.html', './manifest.json', './icon.svg'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  // Worker API 호출은 항상 네트워크로 보낸다 - 캐시하면 오래된 보스/퀘스트 상태가 보일 수 있다.
  if (url.pathname.startsWith('/api/')) return;
  e.respondWith(caches.match(e.request).then(cached => cached || fetch(e.request)));
});
