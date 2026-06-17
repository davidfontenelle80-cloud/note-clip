/**
 * sw.js — Note Clip PWA
 * Network-first for app shell. Offline fallback from cache.
 * BUMP CACHE_VERSION on every deploy that changes HTML, CSS, JS, or manifest.
 */

const CACHE_VERSION = 'noteclip-v1';

const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './css/dark-mode.css',
  './css/main.css',
  './css/components.css',
  './css/responsive.css',
  './css/app.css',
  './js/config.js',
  './js/i18n.js',
  './js/theme.js',
  './js/app.js',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => cache.addAll(PRECACHE_URLS.map(u => new Request(u, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
      .catch(err => console.warn('[QN SW] Install partial failure (icons may be missing):', err))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
      .then(() => {
        self.clients.matchAll({ type: 'window' }).then(clients =>
          clients.forEach(c => c.postMessage({ type: 'RELOAD_READY' }))
        );
      })
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  const isShell = PRECACHE_URLS.some(p => new URL(p, self.location.href).pathname === url.pathname);
  if (!isShell) return;

  event.respondWith(
    fetch(event.request)
      .then(resp => {
        if (resp && resp.status === 200 && resp.type === 'basic') {
          const clone = resp.clone();
          caches.open(CACHE_VERSION).then(c => c.put(event.request, clone));
        }
        return resp;
      })
      .catch(() => caches.match(event.request))
  );
});

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
