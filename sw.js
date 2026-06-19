const CACHE_VERSION = 'note-clip-v35';

const PRECACHE_URLS = [
  './',
  './index.html',
  './css/styles.css',
  './js/i18n.js',
  './js/storage.js',
  './js/dashboard.js',
  './js/calendar.js',
  './js/notes.js',
  './js/lists.js',
  './js/shared.js',
  './js/communication.js',
  './js/settings.js',
  './js/firebase/firebase-config.js',
  './js/firebase/cloud-sync.js',
  './js/reminders.js',
  './js/onboarding.js',
  './app.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_VERSION).then(cache => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()).then(() => {
    self.clients.matchAll({ includeUncontrolled: true }).then(clients => {
      clients.forEach(client => client.postMessage({ type: 'RELOAD_READY' }));
    });
  }));
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith(self.location.origin)) return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    if (response.ok) {
      const clone = response.clone();
      caches.open(CACHE_VERSION).then(cache => cache.put(event.request, clone));
    }
    return response;
  })));
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});
