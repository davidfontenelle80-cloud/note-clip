const CACHE_VERSION = 'note-clip-v56';

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

const LIGHT_NAV_STYLE_ID = 'noteclip-light-nav-force-refresh';
const LIGHT_NAV_STYLE = `<style id="${LIGHT_NAV_STYLE_ID}">
  html:not([data-theme="dark"]) .bottom-nav {
    background: color-mix(in srgb, var(--color-surface, #fff8ec) 82%, #c18a18 18%) !important;
    border-top-color: rgba(118, 82, 22, .28) !important;
    box-shadow: 0 -12px 28px rgba(103, 73, 26, .18), inset 0 1px 0 rgba(255,255,255,.76) !important;
  }
  html:not([data-theme="dark"]) .nav-tab {
    color: #4b3109 !important;
    font-weight: 850 !important;
    text-shadow: 0 1px 0 rgba(255,255,255,.86) !important;
  }
  html:not([data-theme="dark"]) .nav-tab > span[data-i18n] {
    color: #4b3109 !important;
  }
  html:not([data-theme="dark"]) .nav-tab > svg.nav-icon {
    box-sizing: border-box !important;
    width: 34px !important;
    height: 31px !important;
    padding: 5px !important;
    border-radius: 11px !important;
    color: #2b1c05 !important;
    background: linear-gradient(145deg, #fff1a6 0%, #ffe07b 58%, #e0b43b 100%) !important;
    border: 1.2px solid rgba(83, 57, 12, .38) !important;
    box-shadow: inset 1px 1px 0 rgba(255,255,255,.7), inset -1px -1px 0 rgba(108,73,14,.2), 0 6px 9px rgba(93,64,16,.26) !important;
    filter: saturate(1.2) contrast(1.12) !important;
    transition: transform .18s ease, filter .18s ease, box-shadow .18s ease, background .18s ease !important;
  }
  html:not([data-theme="dark"]) .nav-tab.active {
    color: #261705 !important;
  }
  html:not([data-theme="dark"]) .nav-tab.active > span[data-i18n] {
    color: #261705 !important;
  }
  html:not([data-theme="dark"]) .nav-tab.active > svg.nav-icon {
    color: #160d02 !important;
    background: linear-gradient(145deg, #fff09c 0%, #ffd24f 55%, #c7890c 100%) !important;
    border-color: rgba(113, 70, 4, .52) !important;
    transform: translateY(-3px) !important;
    filter: saturate(1.38) contrast(1.18) !important;
    box-shadow: 0 0 0 3px rgba(213,161,39,.24), inset 1px 1px 0 rgba(255,255,255,.74), inset -1px -1px 0 rgba(85,55,8,.25), 0 9px 13px rgba(102,66,10,.34) !important;
  }
</style>`;

function shouldPatchHtml(request) {
  const url = new URL(request.url);
  return request.mode === 'navigate' || url.pathname.endsWith('/') || url.pathname.endsWith('/index.html');
}

function patchLightNavStyle(html) {
  if (html.includes(`id="${LIGHT_NAV_STYLE_ID}"`)) return html;
  if (html.includes('</head>')) return html.replace('</head>', `${LIGHT_NAV_STYLE}\n</head>`);
  return LIGHT_NAV_STYLE + html;
}

async function patchHtmlResponse(request, response) {
  if (!response || !response.ok || !shouldPatchHtml(request)) return response;

  const contentType = response.headers.get('content-type') || '';
  if (contentType && !contentType.includes('text/html')) return response;

  let html = await response.text();
  if (html.includes(LEGACY_CALENDAR_NAV_ICON)) {
    html = html.replace(LEGACY_CALENDAR_NAV_ICON, CONSISTENT_CALENDAR_NAV_ICON);
  }
  html = patchLightNavStyle(html);

  return new Response(html, {
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
