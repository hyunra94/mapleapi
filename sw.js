const CACHE_NAME = 'maple-scheduler-v2';
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
  // 네트워크 우선: 개발 중 파일이 계속 바뀌므로 항상 최신을 먼저 시도하고,
  // 오프라인일 때만 캐시로 대체한다 (예전엔 캐시 우선이라 파일을 고쳐도 계속 옛날 버전이 보였음).
  e.respondWith(
    fetch(e.request).then(res => {
      const resClone = res.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(e.request, resClone));
      return res;
    }).catch(() => caches.match(e.request))
  );
});
