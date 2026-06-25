const CACHE_VERSION = 'note-clip-v55';

const PRECACHE_URLS = [
  './',
  './index.html',
  './css/styles.css',
  './js/i18n.js',
  './js/storage.js',
  './js/dashboard.js',
  './js/notes.js',
  './js/lists.js',
  './js/shared.js',
  './js/communication.js',
  './js/calendar.js',
  './js/push.js',
  './js/reminders.js',
  './js/settings.js',
  './js/firebase/firebase-config.js',
  './js/firebase/cloud-sync.js',
  './js/onboarding.js',
  './app.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

const LEGACY_CALENDAR_NAV_ICON = '<span class="nav-icon nav-stationery nav-calendar" aria-hidden="true"><span class="nav-glyph"></span></span>';
const CONSISTENT_CALENDAR_NAV_ICON = `<svg width="24" height="24" viewBox="0 0 28 28" class="nav-icon" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <rect x="5" y="6" width="18" height="17" rx="2" fill="currentColor" fill-opacity="0.08"/>
  <rect x="5" y="6" width="18" height="17" rx="2"/>
  <line x1="9" y1="3.5" x2="9" y2="8"/>
  <line x1="19" y1="3.5" x2="19" y2="8"/>
  <line x1="5" y1="11" x2="23" y2="11"/>
  <line x1="9" y1="15" x2="11" y2="15"/>
  <line x1="14" y1="15" x2="16" y2="15"/>
  <line x1="19" y1="15" x2="21" y2="15"/>
  <line x1="9" y1="19" x2="11" y2="19"/>
  <line x1="14" y1="19" x2="16" y2="19"/>
</svg>`;

function shouldPatchHtml(request) {
  const url = new URL(request.url);
  return request.mode === 'navigate' || url.pathname.endsWith('/') || url.pathname.endsWith('/index.html');
}

async function patchHtmlResponse(request, response) {
  if (!response || !response.ok || !shouldPatchHtml(request)) return response;

  const contentType = response.headers.get('content-type') || '';
  if (contentType && !contentType.includes('text/html')) return response;

  const html = await response.text();
  if (!html.includes(LEGACY_CALENDAR_NAV_ICON)) {
    return new Response(html, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  }

  return new Response(html.replace(LEGACY_CALENDAR_NAV_ICON, CONSISTENT_CALENDAR_NAV_ICON), {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}

async function precache() {
  const cache = await caches.open(CACHE_VERSION);
  await Promise.all(PRECACHE_URLS.map(async url => {
    const request = new Request(url, { cache: 'reload' });
    const response = await fetch(request);
    if (response.ok) {
      await cache.put(request, await patchHtmlResponse(request, response));
    }
  }));
}

self.addEventListener('install', event => {
  event.waitUntil(precache().then(() => self.skipWaiting()));
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

  event.respondWith(caches.match(event.request).then(async cached => {
    if (cached) return patchHtmlResponse(event.request, cached);

    const response = await fetch(event.request);
    if (response.ok) {
      const normalized = await patchHtmlResponse(event.request, response.clone());
      const cacheClone = normalized.clone();
      caches.open(CACHE_VERSION).then(cache => cache.put(event.request, cacheClone));
      return normalized;
    }
    return response;
  }));
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

// ── Background push notifications ────────────────────────────────────────────
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  event.waitUntil(
    self.registration.showNotification(data.title || 'Note Clip Reminder', {
      body: data.body || '',
      icon: './icons/icon-192.png',
      tag:  data.tag  || 'note-clip-reminder',
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      const existing = list.find(c => c.url.includes('davidfontenelle80-cloud.github.io'));
      if (existing) return existing.focus();
      return clients.openWindow('./');
    })
  );
});
