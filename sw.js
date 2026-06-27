const CACHE_VERSION = 'note-clip-v90-level-two-scanner';

const PRECACHE_URLS = [
  './',
  './index.html',
  './css/styles.css',
  './css/category-modal-source.css',
  './css/bottom-nav-source.css',
  './css/category-card-polish.css',
  './css/attachment-meter.css',
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
  './js/fab-hotfix.js',
  './js/category-card-polish.js',
  './js/cat-accent-apply.js',
  './js/category-card-add-menu.js',
  './js/photo-attachments.js',
  './js/pdf-attachments.js',
  './js/document-scanner.js',
  './js/document-scanner-edge.js',
  './js/attachment-meter.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

const LEGACY_CALENDAR_NAV_ICON = '<span class="nav-icon nav-stationery nav-calendar" aria-hidden="true"><span class="nav-glyph"></span></span>';
const CONSISTENT_CALENDAR_NAV_ICON = `<svg width="24" height="24" viewBox="0 0 28 28" class="nav-icon" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="6" width="18" height="17" rx="2" fill="currentColor" fill-opacity="0.08"/><rect x="5" y="6" width="18" height="17" rx="2"/><line x1="9" y1="3.5" x2="9" y2="8"/><line x1="19" y1="3.5" x2="19" y2="8"/><line x1="5" y1="11" x2="23" y2="11"/><line x1="9" y1="15" x2="11" y2="15"/><line x1="14" y1="15" x2="16" y2="15"/><line x1="19" y1="15" x2="21" y2="15"/><line x1="9" y1="19" x2="11" y2="19"/><line x1="14" y1="19" x2="16" y2="19"/></svg>`;

const HEAD_LINKS = `<link id="noteclip-category-modal-source-css" rel="stylesheet" href="./css/category-modal-source.css">\n<link id="noteclip-light-nav-contrast" rel="stylesheet" href="./css/bottom-nav-source.css">\n<link id="noteclip-category-card-polish" rel="stylesheet" href="./css/category-card-polish.css">\n<link id="noteclip-attachment-meter" rel="stylesheet" href="./css/attachment-meter.css">`;
const BODY_SCRIPTS = `<script id="noteclip-fab-hotfix" src="./js/fab-hotfix.js"></script>\n<script id="noteclip-category-card-polish-js" src="./js/category-card-polish.js"></script>\n<script id="noteclip-cat-accent-apply" src="./js/cat-accent-apply.js"></script>\n<script id="noteclip-category-card-add-menu" src="./js/category-card-add-menu.js"></script>\n<script id="noteclip-attachment-meter-js" src="./js/attachment-meter.js"></script>\n<script id="noteclip-photo-attachments" src="./js/photo-attachments.js"></script>\n<script id="noteclip-pdf-attachments" src="./js/pdf-attachments.js"></script>\n<script id="noteclip-document-scanner" src="./js/document-scanner.js"></script>\n<script id="noteclip-document-scanner-edge" src="./js/document-scanner-edge.js"></script>`;

function shouldPatchHtml(request) {
  const url = new URL(request.url);
  return request.mode === 'navigate' || url.pathname.endsWith('/') || url.pathname.endsWith('/index.html');
}

function patchInjectedStyles(html) {
  html = html.replace(/<style id="noteclip-category-modal-hotfix">[\s\S]*?<\/style>/g, '');
  html = html.replace(/<style id="noteclip-nav-dot-source-pending">[\s\S]*?<\/style>/g, '');
  html = html.replace(/<style id="noteclip-light-nav-contrast">[\s\S]*?<\/style>/g, '');
  html = html.replace(/<link id="noteclip-category-modal-source-css"[^>]*>/g, '');
  html = html.replace(/<link id="noteclip-light-nav-contrast"[^>]*>/g, '');
  html = html.replace(/<link id="noteclip-category-card-polish"[^>]*>/g, '');
  html = html.replace(/<link id="noteclip-attachment-meter"[^>]*>/g, '');
  html = html.replace(/<script id="noteclip-fab-hotfix"[^>]*><\/script>/g, '');
  html = html.replace(/<script id="noteclip-category-card-polish-js"[^>]*><\/script>/g, '');
  html = html.replace(/<script id="noteclip-cat-accent-apply"[^>]*><\/script>/g, '');
  html = html.replace(/<script id="noteclip-category-card-add-menu"[^>]*><\/script>/g, '');
  html = html.replace(/<script id="noteclip-photo-attachments"[^>]*><\/script>/g, '');
  html = html.replace(/<script id="noteclip-pdf-attachments"[^>]*><\/script>/g, '');
  html = html.replace(/<script id="noteclip-document-scanner"[^>]*><\/script>/g, '');
  html = html.replace(/<script id="noteclip-document-scanner-edge"[^>]*><\/script>/g, '');
  html = html.replace(/<script id="noteclip-attachment-meter-js"[^>]*><\/script>/g, '');
  html = html.replace(/\s*<button class="nav-tab" data-tab="shared"[\s\S]*?<\/button>/g, '');
  html = html.replace(/\s*<section id="pane-shared"[\s\S]*?<\/section>/g, '');
  if (html.includes(LEGACY_CALENDAR_NAV_ICON)) html = html.replace(LEGACY_CALENDAR_NAV_ICON, CONSISTENT_CALENDAR_NAV_ICON);
  html = html.includes('</head>') ? html.replace('</head>', `${HEAD_LINKS}\n</head>`) : HEAD_LINKS + html;
  return html.includes('</body>') ? html.replace('</body>', `${BODY_SCRIPTS}\n</body>`) : html + BODY_SCRIPTS;
}

async function patchHtmlResponse(request, response) {
  if (!response || !response.ok || !shouldPatchHtml(request)) return response;
  const contentType = response.headers.get('content-type') || '';
  if (contentType && !contentType.includes('text/html')) return response;
  const html = await response.text();
  return new Response(patchInjectedStyles(html), { status: response.status, statusText: response.statusText, headers: response.headers });
}

async function precache() {
  const cache = await caches.open(CACHE_VERSION);
  await Promise.all(PRECACHE_URLS.map(async url => {
    const request = new Request(url, { cache: 'reload' });
    const response = await fetch(request);
    if (response.ok) await cache.put(request, await patchHtmlResponse(request, response));
  }));
}

self.addEventListener('install', event => { event.waitUntil(precache().then(() => self.skipWaiting())); });
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()).then(() => { self.clients.matchAll({ includeUncontrolled: true }).then(clients => { clients.forEach(client => client.postMessage({ type: 'RELOAD_READY' })); }); }));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith(self.location.origin)) return;
  event.respondWith(caches.match(event.request).then(async cached => {
    if (cached) return patchHtmlResponse(event.request, cached);
    const response = await fetch(event.request);
    if (response.ok) {
      const normalized = await patchHtmlResponse(event.request, response.clone());
      caches.open(CACHE_VERSION).then(cache => cache.put(event.request, normalized.clone()));
      return normalized;
    }
    return response;
  }));
});
self.addEventListener('message', event => { if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting(); });
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  event.waitUntil(self.registration.showNotification(data.title || 'Note Clip Reminder', { body: data.body || '', icon: './icons/icon-192.png', tag: data.tag || 'note-clip-reminder' }));
});
