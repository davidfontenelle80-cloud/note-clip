const CACHE_VERSION = 'note-clip-v59';

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

const PAPER_STYLE_ID = 'noteclip-icon-paper-cards';
const PAPER_STYLE = `<style id="${PAPER_STYLE_ID}">
  :root {
    --icon-paper-default: #fff3bd;
    --icon-paper-edge: rgba(113, 78, 18, .22);
    --icon-paper-ink: #2f2718;
    --icon-paper-line: rgba(126, 92, 25, .16);
    --icon-paper-grain: rgba(110, 78, 23, .11);
    --icon-paper-shadow: rgba(102, 72, 20, .22);
    --icon-clip: rgba(235, 238, 238, .54);
    --icon-clip-edge: rgba(118, 127, 132, .45);
  }
  html[data-theme="dark"] {
    --icon-paper-default: #d6bd59;
    --icon-paper-edge: rgba(255, 228, 126, .18);
    --icon-paper-ink: #161204;
    --icon-paper-line: rgba(255, 239, 159, .19);
    --icon-paper-grain: rgba(255, 238, 156, .13);
    --icon-paper-shadow: rgba(0, 0, 0, .46);
    --icon-clip: rgba(235, 238, 238, .46);
    --icon-clip-edge: rgba(216, 224, 226, .32);
  }

  .focus-card,
  .quick-note-card,
  .note-card,
  .category-card,
  .list-card,
  .mini-calendar,
  .settings-section,
  .share-card,
  .card,
  .modal-sheet {
    position: relative !important;
    overflow: visible !important;
    border-radius: 24px !important;
    border: 1.4px solid var(--icon-paper-edge) !important;
    color: var(--icon-paper-ink) !important;
    background:
      radial-gradient(circle at 20% 18%, var(--icon-paper-grain) 0 1px, transparent 1.7px),
      radial-gradient(circle at 76% 36%, var(--icon-paper-grain) 0 1px, transparent 1.9px),
      repeating-linear-gradient(to bottom, transparent 0 31px, var(--icon-paper-line) 31px 32px, transparent 32px 38px),
      linear-gradient(145deg, #fff9cf 0%, var(--paper-bg, var(--icon-paper-default)) 61%, var(--paper-deep, #e1bf4e) 100%) !important;
    background-size: 28px 28px, 37px 37px, auto, auto !important;
    box-shadow:
      0 3px 4px rgba(118, 82, 20, .10),
      0 12px 22px var(--icon-paper-shadow),
      0 18px 0 -13px rgba(122, 82, 16, .34),
      inset 1px 1px 0 rgba(255,255,255,.64),
      inset -1px -1px 0 rgba(111, 74, 15, .10) !important;
  }

  .focus-card,
  .quick-note-card,
  .note-card,
  .category-card,
  .list-card {
    padding-top: max(var(--space-md), 18px) !important;
  }

  .focus-card::before,
  .quick-note-card::before,
  .note-card::before,
  .category-card::before,
  .list-card::before,
  .mini-calendar::before,
  .settings-section::before,
  .share-card::before,
  .card::before,
  .modal-sheet::before {
    content: '' !important;
    position: absolute !important;
    left: 50% !important;
    top: -10px !important;
    z-index: 5 !important;
    width: 42px !important;
    height: 54px !important;
    transform: translateX(-50%) !important;
    border: 2px solid var(--icon-clip-edge) !important;
    border-top-color: rgba(255,255,255,.68) !important;
    border-radius: 15px 15px 23px 23px !important;
    background: linear-gradient(180deg, rgba(255,255,255,.66), var(--icon-clip) 55%, rgba(155, 164, 168, .18)) !important;
    box-shadow: 0 5px 10px rgba(54, 45, 28, .18), inset 0 2px 0 rgba(255,255,255,.48) !important;
    pointer-events: none !important;
  }

  .note-card::before,
  .category-card::before,
  .list-card::before,
  .mini-calendar::before,
  .settings-section::before,
  .share-card::before,
  .card::before {
    width: 22px !important;
    height: 30px !important;
    top: -7px !important;
    border-radius: 9px 9px 14px 14px !important;
    opacity: .72 !important;
  }

  .focus-card::after,
  .quick-note-card::after,
  .note-card::after,
  .category-card::after,
  .list-card::after,
  .mini-calendar::after,
  .settings-section::after,
  .share-card::after,
  .card::after,
  .modal-sheet::after {
    content: '' !important;
    position: absolute !important;
    right: -1px !important;
    bottom: -1px !important;
    z-index: 2 !important;
    width: 54px !important;
    height: 54px !important;
    border-radius: 0 0 22px 0 !important;
    background: linear-gradient(135deg, transparent 0 48%, rgba(255,255,255,.58) 49% 60%, rgba(143, 99, 25, .22) 61% 100%) !important;
    clip-path: polygon(100% 0, 0 100%, 100% 100%) !important;
    pointer-events: none !important;
  }

  .note-card[data-color="lavender"] { --paper-bg: #eadcf7; --paper-deep: #c8addf; }
  .note-card[data-color="sky"]      { --paper-bg: #d9ecfb; --paper-deep: #a9cee7; }
  .note-card[data-color="mint"]     { --paper-bg: #ddf2d9; --paper-deep: #acd5a8; }
  .note-card[data-color="yellow"]   { --paper-bg: #fff3bd; --paper-deep: #dfbf4d; }
  .note-card[data-color="coral"]    { --paper-bg: #f8d5c8; --paper-deep: #dfa18d; }
  .note-card[data-color="peach"]    { --paper-bg: #ffe1b7; --paper-deep: #e0ad6b; }

  .category-card:nth-child(6n+1) { --paper-bg: #fff3bd; --paper-deep: #dfbf4d; }
  .category-card:nth-child(6n+2) { --paper-bg: #e8dcf6; --paper-deep: #c8addf; }
  .category-card:nth-child(6n+3) { --paper-bg: #dff2de; --paper-deep: #acd5a8; }
  .category-card:nth-child(6n+4) { --paper-bg: #dceefb; --paper-deep: #a9cee7; }
  .category-card:nth-child(6n+5) { --paper-bg: #ffe1b7; --paper-deep: #e0ad6b; }
  .category-card:nth-child(6n+6) { --paper-bg: #f8d5c8; --paper-deep: #dfa18d; }

  .quick-note-card,
  .focus-card { --paper-bg: #fff0a5; --paper-deep: #d7aa32; }
  .list-card { --paper-bg: #fff5ca; --paper-deep: #d8b250; }
  .mini-calendar { --paper-bg: #f7e7bd; --paper-deep: #ceb064; }
  .settings-section { --paper-bg: #fff8dd; --paper-deep: #d9bd6d; }

  .note-card-title,
  .category-name,
  .list-title,
  .focus-label,
  .section-title,
  .modal-title {
    color: var(--icon-paper-ink) !important;
  }
  .note-card-body,
  .category-count,
  .list-item-text,
  .focus-input,
  .quick-note-input,
  .settings-row-sub {
    color: color-mix(in srgb, var(--icon-paper-ink) 72%, transparent) !important;
  }

  .quick-note-input,
  .focus-input,
  .list-add-input,
  .form-input,
  .form-textarea,
  .form-select {
    background: rgba(255, 252, 224, .42) !important;
    border-color: rgba(112, 77, 18, .16) !important;
  }

  .list-card-header,
  .quick-note-actions,
  .settings-section-label,
  .settings-row,
  .list-item,
  .modal-actions.sticky-actions {
    background: rgba(255, 250, 214, .18) !important;
    border-color: rgba(112, 77, 18, .13) !important;
  }

  .note-card:hover,
  .category-card:hover,
  .list-card:hover,
  .card:hover {
    transform: translateY(-3px) rotate(-.25deg) !important;
    box-shadow:
      0 4px 5px rgba(118, 82, 20, .12),
      0 16px 28px var(--icon-paper-shadow),
      0 22px 0 -15px rgba(122, 82, 16, .38),
      inset 1px 1px 0 rgba(255,255,255,.70) !important;
  }

  html[data-theme="dark"] .focus-card,
  html[data-theme="dark"] .quick-note-card,
  html[data-theme="dark"] .note-card,
  html[data-theme="dark"] .category-card,
  html[data-theme="dark"] .list-card,
  html[data-theme="dark"] .mini-calendar,
  html[data-theme="dark"] .settings-section,
  html[data-theme="dark"] .share-card,
  html[data-theme="dark"] .card,
  html[data-theme="dark"] .modal-sheet {
    background:
      radial-gradient(circle at 20% 18%, var(--icon-paper-grain) 0 1px, transparent 1.7px),
      radial-gradient(circle at 76% 36%, var(--icon-paper-grain) 0 1px, transparent 1.9px),
      repeating-linear-gradient(to bottom, transparent 0 31px, var(--icon-paper-line) 31px 32px, transparent 32px 38px),
      linear-gradient(145deg, #e0c96b 0%, var(--paper-bg, var(--icon-paper-default)) 61%, var(--paper-deep, #9c7a25) 100%) !important;
    box-shadow:
      0 4px 8px rgba(0,0,0,.34),
      0 16px 28px var(--icon-paper-shadow),
      0 18px 0 -13px rgba(0,0,0,.44),
      inset 1px 1px 0 rgba(255,236,157,.12),
      inset -1px -1px 0 rgba(0,0,0,.18) !important;
  }

  html[data-theme="dark"] .note-card[data-color="lavender"] { --paper-bg: #665083; --paper-deep: #39294f; }
  html[data-theme="dark"] .note-card[data-color="sky"]      { --paper-bg: #456f91; --paper-deep: #17314d; }
  html[data-theme="dark"] .note-card[data-color="mint"]     { --paper-bg: #557d57; --paper-deep: #193d25; }
  html[data-theme="dark"] .note-card[data-color="yellow"]   { --paper-bg: #d0b84f; --paper-deep: #806d27; }
  html[data-theme="dark"] .note-card[data-color="coral"]    { --paper-bg: #9c5f52; --paper-deep: #4b241d; }
  html[data-theme="dark"] .note-card[data-color="peach"]    { --paper-bg: #b57a3e; --paper-deep: #51320f; }
</style>`;

function shouldPatchHtml(request) {
  const url = new URL(request.url);
  return request.mode === 'navigate' || url.pathname.endsWith('/') || url.pathname.endsWith('/index.html');
}

function patchInjectedStyles(html) {
  html = html.replace(/<style id="noteclip-light-nav-force-refresh">[\s\S]*?<\/style>/, '');
  html = html.replace(/<style id="noteclip-icon-paper-cards">[\s\S]*?<\/style>/, '');
  const styles = `${NAV_STYLE}\n${PAPER_STYLE}`;
  if (html.includes('</head>')) return html.replace('</head>', `${styles}\n</head>`);
  return styles + html;
}

async function patchHtmlResponse(request, response) {
  if (!response || !response.ok || !shouldPatchHtml(request)) return response;

  const contentType = response.headers.get('content-type') || '';
  if (contentType && !contentType.includes('text/html')) return response;

  let html = await response.text();
  if (html.includes(LEGACY_CALENDAR_NAV_ICON)) {
    html = html.replace(LEGACY_CALENDAR_NAV_ICON, CONSISTENT_CALENDAR_NAV_ICON);
  }
  html = patchInjectedStyles(html);

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
