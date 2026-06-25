const CACHE_VERSION = 'note-clip-v58';

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

const NAV_STYLE_ID = 'noteclip-light-nav-force-refresh';
const NAV_STYLE = `<style id="${NAV_STYLE_ID}">
  html:not([data-theme="dark"]) .bottom-nav {
    background: color-mix(in srgb, var(--color-surface, #fff8ec) 80%, #c18a18 20%) !important;
    border-top-color: rgba(118, 82, 22, .32) !important;
    box-shadow: 0 -12px 28px rgba(103, 73, 26, .18), inset 0 1px 0 rgba(255,255,255,.76) !important;
  }
  html:not([data-theme="dark"]) .nav-tab,
  html[data-theme="dark"] .nav-tab {
    position: relative !important;
    border-radius: 20px !important;
    max-width: 82px !important;
    min-width: 0 !important;
    overflow: visible !important;
  }
  html:not([data-theme="dark"]) .nav-tab {
    color: #4b3109 !important;
    font-weight: 850 !important;
    text-shadow: 0 1px 0 rgba(255,255,255,.86) !important;
  }
  html:not([data-theme="dark"]) .nav-tab > span[data-i18n] {
    color: #4b3109 !important;
    max-width: none !important;
    width: auto !important;
    overflow: visible !important;
    text-overflow: clip !important;
    white-space: nowrap !important;
    font-size: 12px !important;
    line-height: 1.05 !important;
  }
  html:not([data-theme="dark"]) .nav-tab[data-tab="dashboard"] > span[data-i18n] {
    font-size: 11px !important;
    letter-spacing: -.35px !important;
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
    color: #1d1102 !important;
    background: linear-gradient(180deg, rgba(255, 219, 111, .95), rgba(211, 153, 35, .72)) !important;
    border: 1px solid rgba(139, 88, 8, .34) !important;
    box-shadow: 0 8px 16px rgba(91, 58, 8, .26), inset 0 1px 0 rgba(255,255,255,.58), inset 0 -1px 0 rgba(98, 62, 6, .2) !important;
    transform: translateY(-4px) !important;
  }
  html:not([data-theme="dark"]) .nav-tab.active::after {
    content: '' !important;
    position: absolute !important;
    left: 50% !important;
    bottom: 5px !important;
    width: 6px !important;
    height: 6px !important;
    transform: translateX(-50%) !important;
    border-radius: 50% !important;
    background: #5d3700 !important;
    box-shadow: 0 0 0 3px rgba(255, 236, 162, .6), 0 2px 4px rgba(83, 50, 3, .24) !important;
  }
  html:not([data-theme="dark"]) .nav-tab.active > span[data-i18n] {
    color: #1d1102 !important;
    font-weight: 900 !important;
    padding-bottom: 6px !important;
  }
  html:not([data-theme="dark"]) .nav-tab.active > svg.nav-icon {
    color: #120a01 !important;
    background: linear-gradient(145deg, #fff2a9 0%, #ffc93e 52%, #b87405 100%) !important;
    border-color: rgba(89, 51, 0, .58) !important;
    transform: translateY(-2px) scale(1.04) !important;
    filter: saturate(1.46) contrast(1.22) !important;
    box-shadow: 0 0 0 3px rgba(255, 242, 181, .42), inset 1px 1px 0 rgba(255,255,255,.78), inset -1px -1px 0 rgba(85,55,8,.28), 0 8px 12px rgba(102,66,10,.36) !important;
  }

  html[data-theme="dark"] .bottom-nav {
    background: linear-gradient(180deg, rgba(42, 35, 22, .96), rgba(20, 17, 12, .98)) !important;
    border-top-color: rgba(238, 198, 91, .28) !important;
    box-shadow: 0 -14px 30px rgba(0, 0, 0, .42), inset 0 1px 0 rgba(255, 230, 155, .12) !important;
  }
  html[data-theme="dark"] .nav-tab {
    color: #d7bd73 !important;
    font-weight: 850 !important;
    text-shadow: 0 1px 2px rgba(0,0,0,.72) !important;
  }
  html[data-theme="dark"] .nav-tab > span[data-i18n] {
    color: #d7bd73 !important;
    max-width: none !important;
    width: auto !important;
    overflow: visible !important;
    text-overflow: clip !important;
    white-space: nowrap !important;
    font-size: 12px !important;
    line-height: 1.05 !important;
  }
  html[data-theme="dark"] .nav-tab[data-tab="dashboard"] > span[data-i18n] {
    font-size: 11px !important;
    letter-spacing: -.35px !important;
  }
  html[data-theme="dark"] .nav-tab > svg.nav-icon {
    box-sizing: border-box !important;
    width: 34px !important;
    height: 31px !important;
    padding: 5px !important;
    border-radius: 11px !important;
    color: #f2d277 !important;
    background: linear-gradient(145deg, #6f5620 0%, #3f3118 62%, #251d11 100%) !important;
    border: 1.2px solid rgba(238, 198, 91, .35) !important;
    box-shadow: inset 1px 1px 0 rgba(255, 230, 155, .16), inset -1px -1px 0 rgba(0,0,0,.34), 0 6px 10px rgba(0,0,0,.48) !important;
    filter: saturate(1.08) contrast(1.08) !important;
    transition: transform .18s ease, filter .18s ease, box-shadow .18s ease, background .18s ease !important;
  }
  html[data-theme="dark"] .nav-tab.active {
    color: #fff0b8 !important;
    background: linear-gradient(180deg, rgba(126, 89, 20, .96), rgba(64, 45, 13, .88)) !important;
    border: 1px solid rgba(244, 198, 83, .42) !important;
    box-shadow: 0 9px 18px rgba(0,0,0,.54), 0 0 0 1px rgba(255, 214, 105, .14), inset 0 1px 0 rgba(255, 233, 161, .2), inset 0 -1px 0 rgba(0,0,0,.3) !important;
    transform: translateY(-4px) !important;
  }
  html[data-theme="dark"] .nav-tab.active::after {
    content: '' !important;
    position: absolute !important;
    left: 50% !important;
    bottom: 5px !important;
    width: 6px !important;
    height: 6px !important;
    transform: translateX(-50%) !important;
    border-radius: 50% !important;
    background: #ffd76a !important;
    box-shadow: 0 0 0 3px rgba(255, 215, 106, .22), 0 0 10px rgba(255, 207, 78, .38), 0 2px 4px rgba(0,0,0,.45) !important;
  }
  html[data-theme="dark"] .nav-tab.active > span[data-i18n] {
    color: #fff0b8 !important;
    font-weight: 900 !important;
    padding-bottom: 6px !important;
  }
  html[data-theme="dark"] .nav-tab.active > svg.nav-icon {
    color: #fff3bd !important;
    background: linear-gradient(145deg, #b37c14 0%, #79520d 52%, #38240a 100%) !important;
    border-color: rgba(255, 213, 95, .55) !important;
    transform: translateY(-2px) scale(1.04) !important;
    filter: saturate(1.24) contrast(1.15) !important;
    box-shadow: 0 0 0 3px rgba(255, 214, 105, .18), inset 1px 1px 0 rgba(255, 233, 161, .24), inset -1px -1px 0 rgba(0,0,0,.36), 0 8px 14px rgba(0,0,0,.55) !important;
  }
</style>`;

function shouldPatchHtml(request) {
  const url = new URL(request.url);
  return request.mode === 'navigate' || url.pathname.endsWith('/') || url.pathname.endsWith('/index.html');
}

function patchNavStyle(html) {
  // Replace any earlier injected nav fix so active state is not weakened by old cache HTML.
  html = html.replace(/<style id="noteclip-light-nav-force-refresh">[\s\S]*?<\/style>/, '');
  if (html.includes('</head>')) return html.replace('</head>', `${NAV_STYLE}\n</head>`);
  return NAV_STYLE + html;
}

async function patchHtmlResponse(request, response) {
  if (!response || !response.ok || !shouldPatchHtml(request)) return response;

  const contentType = response.headers.get('content-type') || '';
  if (contentType && !contentType.includes('text/html')) return response;

  let html = await response.text();
  if (html.includes(LEGACY_CALENDAR_NAV_ICON)) {
    html = html.replace(LEGACY_CALENDAR_NAV_ICON, CONSISTENT_CALENDAR_NAV_ICON);
  }
  html = patchNavStyle(html);

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
