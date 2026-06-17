/**
 * app.js — QuickNotes PWA
 * All app logic: state, routing, CRUD, modals, calendar, reminders.
 * Follows KHub boilerplate conventions.
 */
(function () {
  'use strict';

  const t   = k => window.KHub.I18n.t(k);
  const log = (...a) => window.KHub.Config.log(...a);

  /* ── CONSTANTS ─────────────────────────────────────────── */
  const STORAGE_KEY   = 'knotes-v1';
  const PRIORITY_RANK = { critical: 0, high: 1, medium: 2, low: 3, optional: 4 };
  const CAT_ICONS     = ['📝','💼','⛪','🏥','📦','👤','🎯','🏠','📚','🛒','💊','✈️','🎉','💡','📞','🔧','⚽','🎵','💰','🌱'];
  const STATUS_LIST   = ['active','awaitingResponse','followUp','hold','toRead','completed','archived'];

  /* ── STATE ─────────────────────────────────────────────── */
  let state = defaultState();
  let calYear, calMonth;
  let currentTab = 'dashboard';
  let catDetailId = null;   // which category is open
  let listDetailId = null;  // which list is open
  let _reminderTimer = null;

  function defaultState() {
    const now = new Date().toISOString();
    return {
      profile: { name: '', lang: KHub.I18n.current(), theme: 'system', defaultReminderMins: 30, listBehavior: 'move', onboardingDone: false },
      notes: [],
      categories: [
        { id: 'cat-work',     name: 'Work',     nameEs: 'Trabajo',  icon: '💼', color: '#7aa2ff', builtIn: true, createdAt: now },
        { id: 'cat-church',   name: 'Church',   nameEs: 'Iglesia',  icon: '⛪', color: '#58c18f', builtIn: true, createdAt: now },
        { id: 'cat-doctor',   name: 'Doctor',   nameEs: 'Doctor',   icon: '🏥', color: '#ff5d5d', builtIn: true, createdAt: now },
        { id: 'cat-orders',   name: 'Orders',   nameEs: 'Pedidos',  icon: '📦', color: '#f5aa2e', builtIn: true, createdAt: now },
        { id: 'cat-personal', name: 'Personal', nameEs: 'Personal', icon: '👤', color: '#a96aff', builtIn: true, createdAt: now },
      ],
      lists:     [],
      listItems: [],
      sharedItems: [],
      messages:    [],
    };
  }

  /* ── STORAGE ─────────────────────────────────────────────── */
  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        // merge to ensure new keys exist
        state = { ...defaultState(), ...saved };
        state.profile = { ...defaultState().profile, ...(saved.profile || {}) };
      }
    } catch (e) { log('loadState error', e); }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) { log('saveState error', e); }
  }

  /* ── UTILITIES ───────────────────────────────────────────── */
  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function formatDate(iso) {
    if (!iso) return '';
    const d = new Date(iso + (iso.includes('T') ? '' : 'T00:00:00'));
    const now   = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dt    = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const diff  = (dt - today) / 86400000;
    if (diff === 0) return t('misc.today');
    if (diff === 1) return t('misc.tomorrow');
    if (diff < 0)   return t('misc.overdue');
    return d.toLocaleDateString(KHub.I18n.current(), { month: 'short', day: 'numeric' });
  }

  function isOverdue(iso) {
    if (!iso) return false;
    const today = new Date(); today.setHours(0,0,0,0);
    return new Date(iso + 'T00:00:00') < today;
  }

  function isToday(iso) {
    if (!iso) return false;
    const today = new Date(); today.setHours(0,0,0,0);
    const d = new Date(iso + 'T00:00:00');
    return d.getTime() === today.getTime();
  }

  function priorityClass(p) {
    return 'p-' + (p || 'medium');
  }

  function priorityColor(p) {
    const map = { critical:'var(--color-error)', high:'var(--color-warning)', medium:'var(--color-info)', low:'var(--color-success)', optional:'var(--color-text-dim)' };
    return map[p] || map.medium;
  }

  function statusChip(status) {
    const map = {
      active:           'chip',
      awaitingResponse: 'chip chip-warning',
      followUp:         'chip chip-info',
      hold:             'chip',
      toRead:           'chip chip-special',
      completed:        'chip chip-success',
      archived:         'chip',
    };
    return map[status] || 'chip';
  }

  function catName(cat) {
    return KHub.I18n.current() === 'es' && cat.nameEs ? cat.nameEs : cat.name;
  }

  function esc(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function toast(msg, type = '') {
    const el = document.createElement('div');
    el.className = `toast ${type ? 'toast-' + type : ''}`;
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2200);
  }

  function showModal(html, onOpen) {
    closeModal();
    const backdrop = document.createElement('div');
    backdrop.id = 'modal-bd';
    backdrop.className = 'modal-backdrop';
    backdrop.innerHTML = `<div class="modal" role="dialog" aria-modal="true">${html}</div>`;
    document.body.appendChild(backdrop);
    backdrop.addEventListener('click', e => { if (e.target === backdrop) closeModal(); });
    document.addEventListener('keydown', _escClose);
    if (onOpen) onOpen(backdrop.querySelector('.modal'));
    // focus first input
    requestAnimationFrame(() => {
      const first = backdrop.querySelector('input, textarea, select, button');
      if (first) first.focus();
    });
  }

  function closeModal() {
    const bd = document.getElementById('modal-bd');
    if (bd) bd.remove();
    document.removeEventListener('keydown', _escClose);
  }

  function _escClose(e) { if (e.key === 'Escape') closeModal(); }

  /* ── SORTING ──────────────────────────────────────────────── */
  function sortNotes(notes) {
    const today    = new Date(); today.setHours(0,0,0,0);
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
    const weekEnd  = new Date(today); weekEnd.setDate(today.getDate() + 7);

    function dateScore(n) {
      if (!n.dueDate) return 50 + (PRIORITY_RANK[n.priority] ?? 2);
      const d = new Date(n.dueDate + 'T00:00:00');
      if (d < today)           return 0;
      if (d.getTime() === today.getTime())    return 1;
      if (d.getTime() === tomorrow.getTime()) return 2;
      if (d < weekEnd)         return 3;
      return 10 + (PRIORITY_RANK[n.priority] ?? 2);
    }

    return [...notes].sort((a, b) => {
      const da = dateScore(a), db = dateScore(b);
      if (da !== db) return da - db;
      const pa = PRIORITY_RANK[a.priority] ?? 2;
      const pb = PRIORITY_RANK[b.priority] ?? 2;
      if (pa !== pb) return pa - pb;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }

  function activeNotes() {
    return state.notes.filter(n => !n.deleted && n.status !== 'archived' && n.status !== 'completed');
  }

  /* ── NAVIGATION ──────────────────────────────────────────── */
  function navigate(tabId) {
    catDetailId  = null;
    listDetailId = null;
    currentTab   = tabId;
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.id === 'tab-' + tabId));
    document.querySelectorAll('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.tab === tabId));
    renderTab(tabId);
  }

  function renderTab(tabId) {
    switch (tabId) {
      case 'dashboard':     renderDashboard(); break;
      case 'categories':    renderCategories(); break;
      case 'lists':         renderLists(); break;
      case 'shared':        renderShared(); break;
      case 'communication': renderCommunication(); break;
      case 'settings':      renderSettings(); break;
    }
  }

  /* ── DASHBOARD ───────────────────────────────────────────── */
  function renderDashboard() {
    const el = document.getElementById('dashboard-content');
    if (!el) return;

    const hour = new Date().getHours();
    let greetKey = 'greeting.morning', greetIcon = '☀️';
    if (hour >= 12 && hour < 17) { greetKey = 'greeting.afternoon'; greetIcon = '🌤️'; }
    else if (hour >= 17 && hour < 20) { greetKey = 'greeting.evening'; greetIcon = '🌅'; }
    else if (hour >= 20 || hour < 5)  { greetKey = 'greeting.night';   greetIcon = '🌙'; }

    const name  = state.profile.name || '';
    const todayNotes = sortNotes(activeNotes().filter(n => isToday(n.dueDate)));
    const overdue    = sortNotes(activeNotes().filter(n => isOverdue(n.dueDate)));
    const upcoming   = sortNotes(activeNotes().filter(n => {
      if (!n.dueDate) return false;
      const d = new Date(n.dueDate + 'T00:00:00');
      const today2 = new Date(); today2.setHours(0,0,0,0);
      const future  = new Date(today2); future.setDate(today2.getDate() + 8);
      return d > today2 && d < future;
    })).slice(0, 5);

    el.innerHTML = `
      <div class="greeting-section">
        <div class="greeting-icon">${greetIcon}</div>
        <div class="greeting-text">
          <h2>${t(greetKey)}${name ? ', ' + esc(name) : ''}!</h2>
          <p id="dash-date">${new Date().toLocaleDateString(KHub.I18n.current(), {weekday:'long',month:'long',day:'numeric'})}</p>
        </div>
      </div>

      <div class="quick-note-card" id="qn-card" role="button" tabindex="0" aria-label="${t('dash.quickNote')}">
        <div class="quick-note-card-icon">✏️</div>
        <div class="quick-note-card-text">
          <h3>${t('dash.quickNote')}</h3>
          <p>${t('dash.qn.sub')}</p>
        </div>
      </div>

      <div class="card calendar-widget" id="cal-wrap"></div>

      ${overdue.length ? `
      <div class="today-section">
        <div class="section-header">
          <span class="section-title">${t('misc.overdue')} <span class="overdue-badge">${overdue.length}</span></span>
        </div>
        ${overdue.map(renderNoteCard).join('')}
      </div>` : ''}

      <div class="today-section">
        <div class="section-header">
          <span class="section-title">${t('dash.today')}</span>
        </div>
        ${todayNotes.length
          ? todayNotes.map(renderNoteCard).join('')
          : `<div class="empty-state" style="padding:24px 0"><p>${t('dash.noToday')}</p></div>`}
      </div>

      ${upcoming.length ? `
      <div class="today-section">
        <div class="section-header">
          <span class="section-title">${t('dash.upcoming')}</span>
          <button class="section-action" data-tab-go="categories">${t('dash.seeAll')}</button>
        </div>
        ${upcoming.map(renderNoteCard).join('')}
      </div>` : ''}
    `;

    renderCalendarWidget();

    el.querySelector('#qn-card')?.addEventListener('click', () => openQuickNoteModal());
    el.querySelector('#qn-card')?.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') openQuickNoteModal(); });
    el.querySelectorAll('[data-tab-go]').forEach(b => b.addEventListener('click', () => navigate(b.dataset.tabGo)));
    el.querySelectorAll('.note-card').forEach(c => c.addEventListener('click', () => openNoteDetail(c.dataset.id)));
  }

  /* ── CALENDAR ────────────────────────────────────────────── */
  function renderCalendarWidget() {
    const wrap = document.getElementById('cal-wrap');
    if (!wrap) return;
    const now = new Date();
    if (!calYear)  calYear  = now.getFullYear();
    if (!calMonth && calMonth !== 0) calMonth = now.getMonth();
    renderCalendarInto(wrap, calYear, calMonth);
  }

  function renderCalendarInto(wrap, year, month) {
    const months = t('cal.months').split(',');
    const days   = t('cal.days').split(',');
    const first  = new Date(year, month, 1);
    const last   = new Date(year, month + 1, 0);
    const today  = new Date(); today.setHours(0,0,0,0);

    // Dates that have items
    const itemDates = new Set(
      state.notes.filter(n => !n.deleted && n.dueDate).map(n => n.dueDate)
    );

    // Build grid (start Sun)
    let cells = '';
    const startDow = first.getDay();
    const totalCells = Math.ceil((startDow + last.getDate()) / 7) * 7;

    for (let i = 0; i < totalCells; i++) {
      const dayNum  = i - startDow + 1;
      const d       = new Date(year, month, dayNum);
      const iso     = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      const isThisMonth = d.getMonth() === month;
      const isTodayD    = d.getTime() === today.getTime();
      const hasItems    = itemDates.has(iso);
      let cls = 'cal-day';
      if (!isThisMonth) cls += ' other-month';
      if (isTodayD)     cls += ' today';
      if (hasItems)     cls += ' has-items';
      cells += `<button class="${cls}" data-date="${iso}" aria-label="${d.toLocaleDateString()}">${d.getDate()}</button>`;
    }

    wrap.innerHTML = `
      <div class="cal-header">
        <button class="cal-nav" id="cal-prev" aria-label="Previous month">‹</button>
        <span class="cal-month-label">${months[month]} ${year}</span>
        <button class="cal-nav" id="cal-next" aria-label="Next month">›</button>
      </div>
      <div class="cal-grid">
        <div class="cal-dow-row">${days.map(d=>`<div class="cal-dow">${d}</div>`).join('')}</div>
        <div class="cal-days-row" id="cal-days">${cells}</div>
      </div>
    `;

    wrap.querySelector('#cal-prev')?.addEventListener('click', () => {
      calMonth--; if (calMonth < 0) { calMonth = 11; calYear--; }
      renderCalendarInto(wrap, calYear, calMonth);
    });
    wrap.querySelector('#cal-next')?.addEventListener('click', () => {
      calMonth++; if (calMonth > 11) { calMonth = 0; calYear++; }
      renderCalendarInto(wrap, calYear, calMonth);
    });
    wrap.querySelectorAll('.cal-day:not(.other-month)').forEach(btn => {
      btn.addEventListener('click', () => openDateActionModal(btn.dataset.date));
    });

    // Touch swipe support
    let touchStartX = 0;
    wrap.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    wrap.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 50) {
        if (dx < 0) { calMonth++; if (calMonth > 11) { calMonth = 0; calYear++; } }
        else        { calMonth--; if (calMonth < 0) { calMonth = 11; calYear--; } }
        renderCalendarInto(wrap, calYear, calMonth);
      }
    }, { passive: true });
  }

  /* ── NOTE CARDS ──────────────────────────────────────────── */
  function renderNoteCard(note) {
    const cats = (note.categoryIds || []).map(cid => {
      const c = state.categories.find(x => x.id === cid);
      return c ? `<span class="cat-pill">${c.icon} ${catName(c)}</span>` : '';
    }).join('');

    const dueLbl = note.dueDate ? (() => {
      const cls = isOverdue(note.dueDate) ? 'due-label overdue' : isToday(note.dueDate) ? 'due-label today' : 'due-label';
      return `<span class="${cls}">📅 ${formatDate(note.dueDate)}${note.dueTime ? ' ' + note.dueTime : ''}</span>`;
    })() : '';

    const statusHtml = note.status && note.status !== 'active'
      ? `<span class="${statusChip(note.status)}">${t('status.' + note.status)}</span>` : '';

    const prioHtml = note.priority && note.priority !== 'medium'
      ? `<span class="chip" style="border-color:${priorityColor(note.priority)};color:${priorityColor(note.priority)}">${t('priority.' + note.priority)}</span>` : '';

    return `
      <div class="note-card ${priorityClass(note.priority)} ${note.status === 'completed' ? 'completed' : ''} ${isOverdue(note.dueDate) && note.status !== 'completed' ? 'overdue' : ''}"
           data-id="${note.id}" style="--priority-color:${priorityColor(note.priority)}" role="button" tabindex="0">
        <div class="note-card-header">
          <div class="note-card-title">${esc(note.title || '(no title)')}</div>
          ${note.reminderAt ? '<span title="Has reminder">🔔</span>' : ''}
        </div>
        ${note.body ? `<div class="note-card-body">${esc(note.body)}</div>` : ''}
        <div class="note-card-meta">
          ${statusHtml}${prioHtml}${dueLbl}${cats}
        </div>
      </div>`;
  }

  /* ── CATEGORIES TAB ──────────────────────────────────────── */
  function renderCategories() {
    const el = document.getElementById('categories-content');
    if (!el) return;

    if (catDetailId) {
      renderCategoryDetail(el);
      return;
    }

    const cards = state.categories.map(c => {
      const count = state.notes.filter(n => !n.deleted && (n.categoryIds || []).includes(c.id) && n.status !== 'archived').length;
      const activeCount = state.notes.filter(n => !n.deleted && (n.categoryIds || []).includes(c.id) && n.status === 'active').length;
      return `
        <div class="cat-card" data-catid="${c.id}" role="button" tabindex="0">
          <div class="cat-card-top">
            <span class="cat-card-icon">${c.icon}</span>
            <span class="cat-card-count">${count}</span>
          </div>
          <div class="cat-card-name">${esc(catName(c))}</div>
          <div class="cat-card-sub">${activeCount} ${t('misc.active')}</div>
        </div>`;
    }).join('');

    el.innerHTML = `
      <div class="section-header" style="padding-top:var(--space-sm)">
        <span class="section-title">${t('cats.title')}</span>
        <button class="btn btn-primary btn-sm" id="cat-new-btn">+ ${t('cats.new')}</button>
      </div>
      <div class="cat-grid">
        ${cards}
        <div class="cat-add-card" id="cat-add-inline">
          <span style="font-size:24px">➕</span>
          <span>${t('cats.new')}</span>
        </div>
      </div>
    `;

    el.querySelectorAll('.cat-card').forEach(c => {
      c.addEventListener('click', () => { catDetailId = c.dataset.catid; renderCategories(); });
    });
    el.querySelector('#cat-new-btn')?.addEventListener('click', openCategoryModal);
    el.querySelector('#cat-add-inline')?.addEventListener('click', openCategoryModal);
  }

  function renderCategoryDetail(el) {
    const cat   = state.categories.find(c => c.id === catDetailId);
    if (!cat)   { catDetailId = null; renderCategories(); return; }

    const allNotes = state.notes.filter(n => !n.deleted && (n.categoryIds || []).includes(catDetailId));
    const active   = sortNotes(allNotes.filter(n => n.status !== 'archived' && n.status !== 'completed'));
    const done     = allNotes.filter(n => n.status === 'completed');
    const archived = allNotes.filter(n => n.status === 'archived');

    el.innerHTML = `
      <div class="cat-detail-header">
        <button class="btn btn-ghost btn-sm" id="cat-back-btn">${t('action.back')}</button>
        <div class="cat-detail-icon">${cat.icon}</div>
        <div>
          <div class="cat-detail-name">${esc(catName(cat))}</div>
          <div class="cat-detail-count">${allNotes.length} ${t('misc.all')}</div>
        </div>
        ${!cat.builtIn ? `<button class="btn-icon" id="cat-edit-btn" title="${t('action.edit')}">✎</button>` : ''}
      </div>
      <button class="btn btn-primary btn-sm" id="cat-add-note-btn">+ ${t('cats.addNote')}</button>
      <hr class="divider">
      ${active.length ? active.map(renderNoteCard).join('') : `<div class="empty-state"><p>${t('cats.empty')}</p></div>`}
      ${done.length ? `
        <div class="section-header" style="margin-top:var(--space-md)">
          <span class="section-title">${t('status.completed')}</span>
        </div>
        ${done.map(renderNoteCard).join('')}` : ''}
      ${archived.length ? `
        <div class="section-header" style="margin-top:var(--space-md)">
          <span class="section-title">${t('status.archived')}</span>
        </div>
        ${archived.map(renderNoteCard).join('')}` : ''}
    `;

    el.querySelector('#cat-back-btn')?.addEventListener('click', () => { catDetailId = null; renderCategories(); });
    el.querySelector('#cat-edit-btn')?.addEventListener('click', () => openCategoryModal(cat));
    el.querySelector('#cat-add-note-btn')?.addEventListener('click', () => openQuickNoteModal(null, catDetailId));
    el.querySelectorAll('.note-card').forEach(c => c.addEventListener('click', () => openNoteDetail(c.dataset.id)));
  }

  /* ── LISTS TAB ───────────────────────────────────────────── */
  function renderLists() {
    const el = document.getElementById('lists-content');
    if (!el) return;

    if (listDetailId) {
      renderListDetail(el);
      return;
    }

    if (!state.lists.length) {
      el.innerHTML = `
        <div class="section-header" style="padding-top:var(--space-sm)">
          <span class="section-title">${t('lists.title')}</span>
          <button class="btn btn-primary btn-sm" id="list-new-btn">+ ${t('lists.new')}</button>
        </div>
        <div class="empty-state">
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="4" width="32" height="40" rx="4" stroke="currentColor" stroke-width="2"/><path d="M16 16h16M16 24h16M16 32h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          <p>${t('lists.noLists')}</p>
          <p style="font-size:var(--text-xs)">${t('misc.tapAdd')}</p>
        </div>`;
      el.querySelector('#list-new-btn')?.addEventListener('click', openListModal);
      return;
    }

    const typeLabel = { reusable: t('lists.type.reusable'), goal: t('lists.type.goal'), template: t('lists.type.template') };
    const typeIcon  = { reusable: '🔄', goal: '🎯', template: '📋' };

    el.innerHTML = `
      <div class="section-header" style="padding-top:var(--space-sm)">
        <span class="section-title">${t('lists.title')}</span>
        <button class="btn btn-primary btn-sm" id="list-new-btn">+ ${t('lists.new')}</button>
      </div>
      ${state.lists.map(list => {
        const items = state.listItems.filter(i => i.listId === list.id);
        const done  = items.filter(i => i.checked).length;
        return `
          <div class="list-card" data-listid="${list.id}" role="button" tabindex="0">
            <div class="list-card-icon">${typeIcon[list.type] || '📋'}</div>
            <div class="list-card-body">
              <div class="list-card-name">${esc(list.name)}</div>
              <div class="list-card-meta">${done}/${items.length} · <span class="list-type-badge">${typeLabel[list.type] || list.type}</span></div>
            </div>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 12l4-4-4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </div>`;
      }).join('')}
    `;

    el.querySelector('#list-new-btn')?.addEventListener('click', openListModal);
    el.querySelectorAll('.list-card').forEach(c => {
      c.addEventListener('click', () => { listDetailId = c.dataset.listid; renderLists(); });
    });
  }

  function renderListDetail(el) {
    const list = state.lists.find(l => l.id === listDetailId);
    if (!list) { listDetailId = null; renderLists(); return; }

    const items    = state.listItems.filter(i => i.listId === listDetailId);
    const behavior = list.completionBehavior || state.profile.listBehavior || 'move';
    const active   = behavior === 'move' ? items.filter(i => !i.checked) : items;
    const done     = behavior === 'move' ? items.filter(i => i.checked)  : [];

    function itemRow(item) {
      return `
        <div class="list-item-row ${item.checked ? 'completed-item' : ''}" data-itemid="${item.id}">
          <div class="check-circle ${item.checked ? 'checked' : ''}" data-toggle="${item.id}">
            ${item.checked ? '<span style="display:block;width:6px;height:10px;border:2px solid var(--color-on-primary);border-top:none;border-left:none;transform:rotate(45deg) translate(-1px,-1px)"></span>' : ''}
          </div>
          <span class="list-item-text">${esc(item.text)}</span>
          <button class="list-item-del" data-del="${item.id}" aria-label="${t('action.delete')}">✕</button>
        </div>`;
    }

    el.innerHTML = `
      <div class="list-detail-header">
        <button class="btn btn-ghost btn-sm" id="list-back-btn">${t('action.back')}</button>
        <div style="flex:1">
          <div style="font-size:var(--text-xl);font-weight:800">${esc(list.name)}</div>
          <div style="font-size:var(--text-xs);color:var(--color-text-muted)">${t('lists.type.' + list.type)}</div>
        </div>
        <button class="btn-icon" id="list-edit-btn" title="${t('action.edit')}">✎</button>
        ${list.type === 'reusable' ? `<button class="btn btn-secondary btn-sm" id="list-reset-btn">${t('lists.resetAll')}</button>` : ''}
      </div>
      <div class="list-add-row">
        <input type="text" id="list-new-item" placeholder="${t('lists.addItem')}" />
        <button class="btn btn-primary" id="list-add-item-btn">${t('lists.add.btn')}</button>
      </div>
      <div id="list-items-wrap">
        ${active.length ? active.map(itemRow).join('') : `<div style="color:var(--color-text-dim);font-size:var(--text-sm);padding:12px 0">${t('lists.empty')}</div>`}
        ${done.length ? `
          <div class="completed-section">
            <div class="completed-section-title">
              <span>${t('lists.completed')} (${done.length})</span>
            </div>
            ${done.map(itemRow).join('')}
          </div>` : ''}
      </div>
    `;

    el.querySelector('#list-back-btn')?.addEventListener('click', () => { listDetailId = null; renderLists(); });
    el.querySelector('#list-edit-btn')?.addEventListener('click', () => openListModal(list));
    el.querySelector('#list-reset-btn')?.addEventListener('click', () => {
      state.listItems.filter(i => i.listId === listDetailId).forEach(i => { i.checked = false; delete i.completedAt; });
      saveState(); renderListDetail(el);
    });
    el.querySelector('#list-add-item-btn')?.addEventListener('click', () => {
      const inp = el.querySelector('#list-new-item');
      const txt = (inp?.value || '').trim();
      if (!txt) return;
      state.listItems.push({ id: uid(), listId: listDetailId, text: txt, checked: false, order: state.listItems.length, createdAt: new Date().toISOString() });
      saveState(); inp.value = ''; renderListDetail(el);
    });
    el.querySelector('#list-new-item')?.addEventListener('keydown', e => {
      if (e.key === 'Enter') el.querySelector('#list-add-item-btn')?.click();
    });
    el.querySelectorAll('[data-toggle]').forEach(c => {
      c.addEventListener('click', () => {
        const item = state.listItems.find(i => i.id === c.dataset.toggle);
        if (item) { item.checked = !item.checked; item.completedAt = item.checked ? new Date().toISOString() : null; }
        saveState(); renderListDetail(el);
      });
    });
    el.querySelectorAll('[data-del]').forEach(b => {
      b.addEventListener('click', e => {
        e.stopPropagation();
        state.listItems = state.listItems.filter(i => i.id !== b.dataset.del);
        saveState(); renderListDetail(el);
      });
    });
  }

  /* ── SHARED TAB ──────────────────────────────────────────── */
  function renderShared() {
    const el = document.getElementById('shared-content');
    if (!el) return;

    el.innerHTML = `
      <div class="section-header" style="padding-top:var(--space-sm)">
        <span class="section-title">${t('shared.title')}</span>
        <button class="btn btn-primary btn-sm" id="shared-new-btn">+ ${t('shared.new')}</button>
      </div>
      ${state.sharedItems.length ? state.sharedItems.map(item => `
        <div class="shared-card">
          <div class="shared-card-header">
            <span class="shared-card-title">${esc(item.title || '(untitled)')}</span>
            <span class="perm-badge">${t('shared.' + (item.permission || 'viewOnly'))}</span>
          </div>
          <div class="shared-card-meta">${t('shared.lastEdit')}: ${new Date(item.updatedAt || item.createdAt).toLocaleDateString()}</div>
          <div class="share-actions">
            <button class="share-btn" data-copy="${item.token}">🔗 ${t('shared.copyLink')}</button>
            <button class="share-btn" data-wa="${item.token}">📱 ${t('shared.whatsapp')}</button>
            <button class="share-btn" data-email="${item.token}">✉️ ${t('shared.email')}</button>
          </div>
        </div>`) .join('')
        : `<div class="empty-state">
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="24" r="6" stroke="currentColor" stroke-width="2"/><circle cx="36" cy="10" r="6" stroke="currentColor" stroke-width="2"/><circle cx="36" cy="38" r="6" stroke="currentColor" stroke-width="2"/><path d="M18 21l12-8M18 27l12 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            <p>${t('shared.empty')}</p>
            <p style="font-size:var(--text-xs)">${t('misc.tapAdd')}</p>
          </div>`
      }
    `;

    el.querySelector('#shared-new-btn')?.addEventListener('click', openSharedModal);
    el.querySelectorAll('[data-copy]').forEach(b => {
      b.addEventListener('click', () => {
        const token = b.dataset.copy;
        const url   = location.origin + location.pathname + '?shared=' + token;
        navigator.clipboard.writeText(url).then(() => toast(t('toast.copied'), 'success'));
      });
    });
    el.querySelectorAll('[data-wa]').forEach(b => {
      b.addEventListener('click', () => {
        const token = b.dataset.wa;
        const url   = location.origin + location.pathname + '?shared=' + token;
        window.open('https://wa.me/?text=' + encodeURIComponent(url));
      });
    });
    el.querySelectorAll('[data-email]').forEach(b => {
      b.addEventListener('click', () => {
        const token  = b.dataset.email;
        const url    = location.origin + location.pathname + '?shared=' + token;
        const item   = state.sharedItems.find(i => i.token === token);
        window.open('mailto:?subject=' + encodeURIComponent(item?.title || 'Shared Note') + '&body=' + encodeURIComponent(url));
      });
    });
  }

  /* ── COMMUNICATION TAB ───────────────────────────────────── */
  function renderCommunication() {
    const el = document.getElementById('comm-content');
    if (!el) return;

    el.innerHTML = `
      <div class="section-header" style="padding-top:var(--space-sm)">
        <span class="section-title">${t('comm.title')}</span>
        <button class="btn btn-primary btn-sm" id="comm-new-btn">+ ${t('comm.new')}</button>
      </div>
      <div id="comm-editor" style="display:none">
        <div class="form-group">
          <label>${t('comm.format')}</label>
          <div class="comm-format-row">
            <button class="format-btn active" data-fmt="text">💬 ${t('shared.text')}</button>
            <button class="format-btn" data-fmt="email">✉️ ${t('shared.email')}</button>
            <button class="format-btn" data-fmt="whatsapp">📱 WhatsApp</button>
          </div>
        </div>
        <div class="form-group" id="comm-subject-wrap">
          <label>${t('comm.subject')}</label>
          <input type="text" id="comm-subject" placeholder="${t('comm.subject')}" />
        </div>
        <div class="form-group">
          <label>${t('comm.body')}</label>
          <textarea id="comm-body" rows="6" placeholder="${t('comm.body')}"></textarea>
        </div>
        <div class="form-group">
          <label>${t('comm.output')}</label>
          <div class="msg-output" id="comm-preview"></div>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn btn-secondary" id="comm-copy-btn">📋 ${t('comm.copy')}</button>
          <button class="btn btn-primary" id="comm-send-btn">🚀 ${t('comm.send')}</button>
          <button class="btn btn-secondary" id="comm-save-btn">💾 ${t('action.save')}</button>
          <button class="btn btn-ghost" id="comm-close-btn">${t('action.cancel')}</button>
        </div>
      </div>
      <div id="comm-drafts">
        ${state.messages.length
          ? state.messages.map(m => `
            <div class="msg-card" data-msgid="${m.id}">
              <div class="msg-card-title">${esc(m.subject || '(no subject)')}</div>
              <div class="msg-card-preview">${esc(m.body || '')}</div>
              <div class="share-actions" style="margin-top:8px">
                <button class="share-btn" data-msg-copy="${m.id}">📋 ${t('comm.copy')}</button>
                <button class="share-btn" data-msg-send="${m.id}" data-fmt="${m.format}">🚀 ${t('comm.send')}</button>
                <button class="share-btn" data-msg-del="${m.id}">🗑 ${t('action.delete')}</button>
              </div>
            </div>`).join('')
          : `<div class="empty-state"><p>${t('comm.noDrafts')}</p></div>`}
      </div>
    `;

    let currentFmt = 'text';
    const editor = el.querySelector('#comm-editor');
    const preview = el.querySelector('#comm-preview');

    function updatePreview() {
      const subj = (el.querySelector('#comm-subject')?.value || '').trim();
      const body = (el.querySelector('#comm-body')?.value || '').trim();
      const subjectWrap = el.querySelector('#comm-subject-wrap');
      if (currentFmt === 'email') {
        if (subjectWrap) subjectWrap.style.display = '';
        preview.textContent = (subj ? 'Subject: ' + subj + '\n\n' : '') + body;
      } else {
        if (subjectWrap) subjectWrap.style.display = 'none';
        preview.textContent = body;
      }
    }

    el.querySelector('#comm-new-btn')?.addEventListener('click', () => {
      editor.style.display = '';
      el.querySelector('#comm-drafts').style.display = 'none';
      updatePreview();
    });
    el.querySelector('#comm-close-btn')?.addEventListener('click', () => {
      editor.style.display = 'none';
      el.querySelector('#comm-drafts').style.display = '';
    });
    el.querySelectorAll('.format-btn').forEach(b => {
      b.addEventListener('click', () => {
        el.querySelectorAll('.format-btn').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        currentFmt = b.dataset.fmt;
        updatePreview();
      });
    });
    el.querySelector('#comm-body')?.addEventListener('input', updatePreview);
    el.querySelector('#comm-subject')?.addEventListener('input', updatePreview);
    el.querySelector('#comm-copy-btn')?.addEventListener('click', () => {
      const text = preview.textContent;
      navigator.clipboard.writeText(text).then(() => toast(t('toast.copied'), 'success'));
    });
    el.querySelector('#comm-send-btn')?.addEventListener('click', () => {
      const text = (el.querySelector('#comm-body')?.value || '').trim();
      const subj = (el.querySelector('#comm-subject')?.value || '').trim();
      sendMessage(currentFmt, subj, text);
    });
    el.querySelector('#comm-save-btn')?.addEventListener('click', () => {
      const body = (el.querySelector('#comm-body')?.value || '').trim();
      const subj = (el.querySelector('#comm-subject')?.value || '').trim();
      if (!body) return;
      state.messages.push({ id: uid(), subject: subj, body, format: currentFmt, createdAt: new Date().toISOString() });
      saveState(); toast(t('toast.saved'), 'success');
      editor.style.display = 'none'; el.querySelector('#comm-drafts').style.display = '';
      renderCommunication();
    });

    el.querySelectorAll('[data-msg-copy]').forEach(b => {
      b.addEventListener('click', () => {
        const m = state.messages.find(x => x.id === b.dataset.msgCopy);
        if (m) navigator.clipboard.writeText(m.body).then(() => toast(t('toast.copied'), 'success'));
      });
    });
    el.querySelectorAll('[data-msg-send]').forEach(b => {
      b.addEventListener('click', () => {
        const m = state.messages.find(x => x.id === b.dataset.msgSend);
        if (m) sendMessage(m.format, m.subject, m.body);
      });
    });
    el.querySelectorAll('[data-msg-del]').forEach(b => {
      b.addEventListener('click', () => {
        state.messages = state.messages.filter(x => x.id !== b.dataset.msgDel);
        saveState(); renderCommunication();
      });
    });
    el.querySelectorAll('.msg-card').forEach(c => {
      c.addEventListener('click', e => {
        if (e.target.closest('button')) return;
        const m = state.messages.find(x => x.id === c.dataset.msgid);
        if (!m) return;
        editor.style.display = '';
        el.querySelector('#comm-drafts').style.display = 'none';
        el.querySelector('#comm-body').value   = m.body;
        el.querySelector('#comm-subject').value = m.subject || '';
        currentFmt = m.format || 'text';
        el.querySelectorAll('.format-btn').forEach(x => x.classList.toggle('active', x.dataset.fmt === currentFmt));
        updatePreview();
      });
    });
  }

  function sendMessage(fmt, subject, body) {
    if (!body.trim()) return;
    if (fmt === 'email') {
      window.open('mailto:?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body));
    } else if (fmt === 'whatsapp') {
      window.open('https://wa.me/?text=' + encodeURIComponent(body));
    } else {
      window.open('sms:?body=' + encodeURIComponent(body));
    }
  }

  /* ── SETTINGS TAB ────────────────────────────────────────── */
  function renderSettings() {
    const el = document.getElementById('settings-content');
    if (!el) return;

    const notifStatus   = Notification?.permission === 'granted' ? t('settings.notifOn') : t('settings.notifOff');
    const defaultMins   = state.profile.defaultReminderMins || 30;
    const listBehavior  = state.profile.listBehavior || 'move';

    el.innerHTML = `
      <div style="padding-top:var(--space-sm)">
        <h2 style="font-size:var(--text-xl);font-weight:800;margin-bottom:var(--space-md)">${t('settings.title')}</h2>

        <div class="settings-section">
          <div class="settings-section-title">${t('settings.account')}</div>
          <div class="settings-row">
            <div>
              <div class="settings-row-label">${t('settings.name')}</div>
              <div class="settings-row-sub">${esc(state.profile.name || '—')}</div>
            </div>
            <button class="btn btn-secondary btn-sm" id="settings-name-btn">${t('settings.change')}</button>
          </div>
        </div>

        <div class="settings-section">
          <div class="settings-section-title">${t('settings.appearance')}</div>
          <div class="settings-row">
            <div class="settings-row-label">${t('settings.theme')}</div>
            <div class="theme-select">
              <button class="theme-btn ${KHub.Theme.current === 'dark'   ? 'active' : ''}" data-theme="dark">🌙 ${t('settings.theme.dark')}</button>
              <button class="theme-btn ${KHub.Theme.current === 'light'  ? 'active' : ''}" data-theme="light">☀️ ${t('settings.theme.light')}</button>
              <button class="theme-btn ${KHub.Theme.current === 'system' ? 'active' : ''}" data-theme="system">⚙️ ${t('settings.theme.system')}</button>
            </div>
          </div>
          <div class="settings-row">
            <div class="settings-row-label">${t('settings.language')}</div>
            <div class="theme-select">
              <button class="theme-btn ${KHub.I18n.current() === 'en' ? 'active' : ''}" data-lang="en">🇺🇸 English</button>
              <button class="theme-btn ${KHub.I18n.current() === 'es' ? 'active' : ''}" data-lang="es">🇲🇽 Español</button>
            </div>
          </div>
        </div>

        <div class="settings-section">
          <div class="settings-section-title">${t('settings.prefs')}</div>
          <div class="settings-row">
            <div class="settings-row-label">${t('settings.reminder')}</div>
            <select id="settings-reminder" style="max-width:160px">
              <option value="0" ${defaultMins===0?'selected':''}>At due time</option>
              <option value="5" ${defaultMins===5?'selected':''}>5 min before</option>
              <option value="15" ${defaultMins===15?'selected':''}>15 min before</option>
              <option value="30" ${defaultMins===30?'selected':''}>30 min before</option>
              <option value="60" ${defaultMins===60?'selected':''}>1 hr before</option>
              <option value="1440" ${defaultMins===1440?'selected':''}>Day before</option>
            </select>
          </div>
          <div class="settings-row">
            <div class="settings-row-label">${t('settings.behavior')}</div>
            <div class="theme-select">
              <button class="theme-btn ${listBehavior==='move'?'active':''}" data-behavior="move">${t('settings.move')}</button>
              <button class="theme-btn ${listBehavior==='strikethrough'?'active':''}" data-behavior="strikethrough">${t('settings.strike')}</button>
            </div>
          </div>
        </div>

        <div class="settings-section">
          <div class="settings-section-title">${t('settings.data')}</div>
          <div class="settings-row">
            <div>
              <div class="settings-row-label">${t('settings.notif')}</div>
              <div class="settings-row-sub" id="notif-status">${notifStatus}</div>
            </div>
            ${Notification?.permission !== 'granted' ? `<button class="btn btn-secondary btn-sm" id="notif-btn">Enable</button>` : ''}
          </div>
          <div class="settings-row">
            <div>
              <div class="settings-row-label">${t('settings.cloud')}</div>
              <div class="settings-row-sub">${t('settings.cloudOff')}</div>
            </div>
          </div>
          <div class="settings-row">
            <div class="settings-row-label">${t('settings.export')}</div>
            <button class="btn btn-secondary btn-sm" id="settings-export-btn">${t('action.copy')}</button>
          </div>
          <div class="settings-row">
            <div class="settings-row-label">${t('settings.import')}</div>
            <button class="btn btn-secondary btn-sm" id="settings-import-btn">${t('settings.import')}</button>
          </div>
          <div class="settings-row">
            <div class="settings-row-label" style="color:var(--color-error)">${t('settings.clear')}</div>
            <button class="btn btn-danger btn-sm" id="settings-clear-btn">⚠️ ${t('action.delete')}</button>
          </div>
        </div>

        <div style="text-align:center;padding:var(--space-lg) 0;color:var(--color-text-dim);font-size:var(--text-xs)">
          QuickNotes v${KHub.Config.version}
        </div>
      </div>
    `;

    el.querySelector('#settings-name-btn')?.addEventListener('click', () => {
      const n = prompt(t('settings.name'), state.profile.name || '');
      if (n !== null) { state.profile.name = n.trim(); saveState(); renderSettings(); renderDashboard(); }
    });
    el.querySelectorAll('.theme-btn[data-theme]').forEach(b => {
      b.addEventListener('click', () => {
        KHub.Theme.apply(b.dataset.theme);
        state.profile.theme = b.dataset.theme; saveState();
        el.querySelectorAll('.theme-btn[data-theme]').forEach(x => x.classList.toggle('active', x.dataset.theme === b.dataset.theme));
      });
    });
    el.querySelectorAll('[data-lang]').forEach(b => {
      b.addEventListener('click', () => {
        KHub.I18n.set(b.dataset.lang);
        state.profile.lang = b.dataset.lang; saveState();
        renderSettings();
      });
    });
    el.querySelectorAll('[data-behavior]').forEach(b => {
      b.addEventListener('click', () => {
        state.profile.listBehavior = b.dataset.behavior; saveState();
        el.querySelectorAll('[data-behavior]').forEach(x => x.classList.toggle('active', x.dataset.behavior === b.dataset.behavior));
      });
    });
    el.querySelector('#settings-reminder')?.addEventListener('change', e => {
      state.profile.defaultReminderMins = parseInt(e.target.value, 10); saveState();
    });
    el.querySelector('#notif-btn')?.addEventListener('click', () => {
      requestNotificationPermission().then(() => renderSettings());
    });
    el.querySelector('#settings-export-btn')?.addEventListener('click', () => {
      const data = JSON.stringify(state, null, 2);
      navigator.clipboard.writeText(data).then(() => toast(t('toast.copied'), 'success'));
    });
    el.querySelector('#settings-import-btn')?.addEventListener('click', () => {
      const raw = prompt('Paste exported JSON data:');
      if (!raw) return;
      try {
        const parsed = JSON.parse(raw);
        if (parsed.notes || parsed.profile) {
          state = { ...defaultState(), ...parsed };
          saveState(); toast(t('toast.saved'), 'success'); renderSettings();
        }
      } catch (e) { alert('Invalid data'); }
    });
    el.querySelector('#settings-clear-btn')?.addEventListener('click', () => {
      if (confirm(t('settings.clearConfirm'))) {
        state = defaultState();
        state.profile.onboardingDone = true;
        saveState(); toast(t('toast.deleted'), 'error');
        renderTab(currentTab);
      }
    });
  }

  /* ── MODALS: QUICK NOTE ──────────────────────────────────── */
  function openQuickNoteModal(prefilledDate, preCatId) {
    showModal(`
      <div class="modal-header">
        <h2 class="modal-title">${t('note.new')}</h2>
        <button class="btn-icon" id="m-close" aria-label="${t('action.close')}">✕</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label for="m-note-title">${t('note.title')}</label>
          <input type="text" id="m-note-title" placeholder="${t('note.title.ph')}" autocomplete="off" />
        </div>
        <div class="form-group">
          <label for="m-note-body">${t('note.body')}</label>
          <textarea id="m-note-body" placeholder="${t('note.body.ph')}" rows="4"></textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" id="m-cancel">${t('action.cancel')}</button>
        <button class="btn btn-primary" id="m-save-next">${t('note.next')}</button>
      </div>
    `, modal => {
      modal.querySelector('#m-close')?.addEventListener('click', closeModal);
      modal.querySelector('#m-cancel')?.addEventListener('click', closeModal);
      modal.querySelector('#m-save-next')?.addEventListener('click', () => {
        const title = modal.querySelector('#m-note-title').value.trim();
        const body  = modal.querySelector('#m-note-body').value.trim();
        if (!title) { modal.querySelector('#m-note-title').focus(); return; }
        const note = {
          id: uid(), title, body, status: 'active', categoryIds: preCatId ? [preCatId] : [],
          priority: 'medium', dueDate: prefilledDate || null, dueTime: null, reminderAt: null,
          locationName: null, address: null, createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(), deleted: false,
        };
        closeModal();
        openCategorizationModal(note, true);
      });
    });
  }

  /* ── MODALS: CATEGORIZATION ──────────────────────────────── */
  function openCategorizationModal(note, isNew) {
    const catOpts = state.categories.map(c =>
      `<option value="${c.id}" ${(note.categoryIds||[]).includes(c.id) ? 'selected' : ''}>${c.icon} ${catName(c)}</option>`
    ).join('');

    const priorityBtns = ['critical','high','medium','low','optional'].map(p =>
      `<button class="prio-btn p-${p} ${note.priority===p?'selected':''}" data-prio="${p}">${t('priority.'+p)}</button>`
    ).join('');

    const statusOpts = STATUS_LIST.map(s =>
      `<option value="${s}" ${note.status===s?'selected':''}>${t('status.'+s)}</option>`
    ).join('');

    showModal(`
      <div class="modal-header">
        <h2 class="modal-title">${t('cat.title')}</h2>
        <button class="btn-icon" id="m-close" aria-label="${t('action.close')}">✕</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label>${t('cat.priority')}</label>
          <div class="priority-row">${priorityBtns}</div>
        </div>
        <div class="form-group">
          <label for="m-status">${t('cat.status')}</label>
          <select id="m-status">${statusOpts}</select>
        </div>
        <div class="form-group">
          <label for="m-cat">${t('cat.category')}</label>
          <select id="m-cat" multiple style="min-height:100px">${catOpts}</select>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="m-due-date">${t('cat.dueDate')}</label>
            <input type="date" id="m-due-date" value="${note.dueDate || ''}" />
          </div>
          <div class="form-group">
            <label for="m-due-time">${t('cat.dueTime')}</label>
            <input type="time" id="m-due-time" value="${note.dueTime || ''}" />
          </div>
        </div>
        <div class="form-group">
          <label>${t('cat.reminder')}</label>
          <div class="reminder-opts">
            ${[
              { key: 'atTime',        label: t('remind.atTime'),     mins: 0 },
              { key: '30min',         label: t('remind.30min'),      mins: 30 },
              { key: 'hoursBefore',   label: t('remind.hoursBefore'),mins: 120 },
              { key: 'dayBefore',     label: t('remind.dayBefore'),  mins: 1440 },
              { key: 'custom',        label: t('remind.custom'),     mins: -1 },
            ].map(r => `<button class="reminder-opt" data-mins="${r.mins}">${r.label}</button>`).join('')}
          </div>
          <input type="datetime-local" id="m-reminder-dt" value="${note.reminderAt ? note.reminderAt.slice(0,16) : ''}" />
        </div>
        <div class="form-group">
          <label for="m-location">${t('cat.location')}</label>
          <input type="text" id="m-location" value="${esc(note.locationName||'')}" placeholder="Doctor's office, store name..." />
        </div>
        <div class="form-group">
          <label for="m-address">${t('cat.address')}</label>
          <input type="text" id="m-address" value="${esc(note.address||'')}" placeholder="123 Main St, City, State" />
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" id="m-skip">${isNew ? t('note.save') : t('action.cancel')}</button>
        <button class="btn btn-primary" id="m-save-cat">${t('cat.save')}</button>
      </div>
    `, modal => {
      // priority buttons
      modal.querySelectorAll('.prio-btn').forEach(b => {
        b.addEventListener('click', () => {
          modal.querySelectorAll('.prio-btn').forEach(x => x.classList.remove('selected'));
          b.classList.add('selected');
          note.priority = b.dataset.prio;
        });
      });

      // reminder presets
      modal.querySelectorAll('.reminder-opt').forEach(btn => {
        btn.addEventListener('click', () => {
          const mins = parseInt(btn.dataset.mins, 10);
          modal.querySelectorAll('.reminder-opt').forEach(x => x.classList.remove('selected'));
          btn.classList.add('selected');
          if (mins >= 0 && note.dueDate) {
            const dueStr = note.dueDate + 'T' + (note.dueTime || '09:00');
            const due = new Date(dueStr);
            due.setMinutes(due.getMinutes() - mins);
            modal.querySelector('#m-reminder-dt').value = due.toISOString().slice(0,16);
          }
        });
      });

      modal.querySelector('#m-close')?.addEventListener('click', closeModal);
      modal.querySelector('#m-skip')?.addEventListener('click', () => {
        if (isNew) { saveNote(note); toast(t('toast.saved'), 'success'); }
        closeModal();
      });
      modal.querySelector('#m-save-cat')?.addEventListener('click', () => {
        note.status   = modal.querySelector('#m-status').value;
        note.dueDate  = modal.querySelector('#m-due-date').value || null;
        note.dueTime  = modal.querySelector('#m-due-time').value || null;
        const rdv     = modal.querySelector('#m-reminder-dt').value;
        note.reminderAt = rdv ? new Date(rdv).toISOString() : null;
        note.locationName = modal.querySelector('#m-location').value.trim() || null;
        note.address      = modal.querySelector('#m-address').value.trim() || null;
        // multi-select categories
        const sel = modal.querySelector('#m-cat');
        note.categoryIds = [...sel.selectedOptions].map(o => o.value);
        saveNote(note);
        toast(t('toast.saved'), 'success');
        closeModal();
        scheduleReminders();
      });
    });
  }

  /* ── MODALS: NOTE DETAIL ─────────────────────────────────── */
  function openNoteDetail(id) {
    const note = state.notes.find(n => n.id === id);
    if (!note) return;

    const cats = (note.categoryIds || []).map(cid => {
      const c = state.categories.find(x => x.id === cid);
      return c ? `<span class="cat-pill">${c.icon} ${catName(c)}</span>` : '';
    }).join('');

    const addrRow = note.address ? `
      <div class="address-row" style="margin-top:var(--space-sm)">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2a6 6 0 0 1 6 6c0 4-6 10-6 10S4 12 4 8a6 6 0 0 1 6-6z" stroke="currentColor" stroke-width="1.5"/><circle cx="10" cy="8" r="2" stroke="currentColor" stroke-width="1.5"/></svg>
        <div class="address-text">
          ${note.locationName ? `<strong>${esc(note.locationName)}</strong><br>` : ''}${esc(note.address)}
        </div>
        <button class="btn btn-ghost btn-sm" id="nd-map-btn">🗺️</button>
      </div>` : '';

    showModal(`
      <div class="modal-header">
        <button class="btn-icon" id="m-close" aria-label="${t('action.close')}">✕</button>
        <h2 class="modal-title" style="flex:1;margin:0 8px">${esc(note.title || '')}</h2>
        <button class="btn btn-secondary btn-sm" id="nd-edit-btn">${t('note.edit.btn')}</button>
      </div>
      <div class="modal-body">
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:var(--space-sm)">
          <span class="${statusChip(note.status)}">${t('status.' + (note.status||'active'))}</span>
          ${note.priority ? `<span class="chip" style="border-color:${priorityColor(note.priority)};color:${priorityColor(note.priority)}">${t('priority.'+note.priority)}</span>` : ''}
          ${cats}
        </div>
        ${note.body ? `<p style="white-space:pre-wrap;line-height:1.6;margin-bottom:var(--space-md)">${esc(note.body)}</p>` : ''}
        ${note.dueDate ? `<div style="font-size:var(--text-sm);color:var(--color-text-muted);margin-bottom:6px">📅 ${formatDate(note.dueDate)}${note.dueTime ? ' at ' + note.dueTime : ''}</div>` : ''}
        ${note.reminderAt ? `<div style="font-size:var(--text-sm);color:var(--color-text-muted);margin-bottom:6px">🔔 ${new Date(note.reminderAt).toLocaleString()}</div>` : ''}
        ${addrRow}
        <div style="margin-top:var(--space-md)">
          <hr class="divider">
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            ${note.status !== 'completed' ? `<button class="btn btn-secondary btn-sm" id="nd-complete-btn">✓ ${t('note.complete')}</button>` : ''}
            ${note.status !== 'archived'  ? `<button class="btn btn-secondary btn-sm" id="nd-archive-btn">${t('note.archive')}</button>` : ''}
            ${note.status === 'archived' || note.status === 'completed' ? `<button class="btn btn-secondary btn-sm" id="nd-restore-btn">${t('note.restore')}</button>` : ''}
            <button class="btn btn-danger btn-sm" id="nd-delete-btn">${t('note.delete')}</button>
          </div>
        </div>
      </div>
    `, modal => {
      modal.querySelector('#m-close')?.addEventListener('click', closeModal);
      modal.querySelector('#nd-edit-btn')?.addEventListener('click', () => { closeModal(); openEditNoteModal(note); });
      modal.querySelector('#nd-complete-btn')?.addEventListener('click', () => {
        note.status = 'completed'; note.completedAt = new Date().toISOString(); note.updatedAt = new Date().toISOString();
        saveState(); toast(t('toast.complete'), 'success'); closeModal(); renderTab(currentTab);
      });
      modal.querySelector('#nd-archive-btn')?.addEventListener('click', () => {
        note.status = 'archived'; note.archivedAt = new Date().toISOString(); note.updatedAt = new Date().toISOString();
        saveState(); toast(t('toast.archived')); closeModal(); renderTab(currentTab);
      });
      modal.querySelector('#nd-restore-btn')?.addEventListener('click', () => {
        note.status = 'active'; note.updatedAt = new Date().toISOString();
        saveState(); toast(t('toast.restored')); closeModal(); renderTab(currentTab);
      });
      modal.querySelector('#nd-delete-btn')?.addEventListener('click', () => {
        if (confirm(t('action.delete') + ' "' + note.title + '"?')) {
          note.deleted = true; note.updatedAt = new Date().toISOString();
          saveState(); toast(t('toast.deleted'), 'error'); closeModal(); renderTab(currentTab);
        }
      });
      modal.querySelector('#nd-map-btn')?.addEventListener('click', () => {
        closeModal(); openAddressModal(note);
      });
    });
  }

  /* ── MODALS: EDIT NOTE ───────────────────────────────────── */
  function openEditNoteModal(note) {
    showModal(`
      <div class="modal-header">
        <h2 class="modal-title">${t('note.edit')}</h2>
        <button class="btn-icon" id="m-close" aria-label="${t('action.close')}">✕</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label for="m-edit-title">${t('note.title')}</label>
          <input type="text" id="m-edit-title" value="${esc(note.title || '')}" />
        </div>
        <div class="form-group">
          <label for="m-edit-body">${t('note.body')}</label>
          <textarea id="m-edit-body" rows="5">${esc(note.body || '')}</textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" id="m-cancel">${t('action.cancel')}</button>
        <button class="btn btn-primary" id="m-save-edit">${t('action.save')}</button>
        <button class="btn btn-secondary" id="m-categorize">${t('cat.title')} →</button>
      </div>
    `, modal => {
      modal.querySelector('#m-close')?.addEventListener('click', closeModal);
      modal.querySelector('#m-cancel')?.addEventListener('click', closeModal);
      modal.querySelector('#m-save-edit')?.addEventListener('click', () => {
        note.title = modal.querySelector('#m-edit-title').value.trim();
        note.body  = modal.querySelector('#m-edit-body').value.trim();
        note.updatedAt = new Date().toISOString();
        saveState(); toast(t('toast.saved'), 'success'); closeModal(); renderTab(currentTab);
      });
      modal.querySelector('#m-categorize')?.addEventListener('click', () => {
        note.title = modal.querySelector('#m-edit-title').value.trim();
        note.body  = modal.querySelector('#m-edit-body').value.trim();
        closeModal(); openCategorizationModal(note, false);
      });
    });
  }

  /* ── MODALS: CATEGORY ────────────────────────────────────── */
  function openCategoryModal(existingCat) {
    const isEdit = !!existingCat;
    const name   = existingCat?.name || '';
    const icon   = existingCat?.icon || '📝';

    showModal(`
      <div class="modal-header">
        <h2 class="modal-title">${isEdit ? t('cats.edit') : t('cats.new')}</h2>
        <button class="btn-icon" id="m-close" aria-label="${t('action.close')}">✕</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label for="m-cat-name">${t('cats.name')}</label>
          <input type="text" id="m-cat-name" value="${esc(name)}" placeholder="Category name" />
        </div>
        <div class="form-group">
          <label>${t('cats.icon')}</label>
          <div class="icon-picker">
            ${CAT_ICONS.map(i => `<button class="icon-opt ${i===icon?'selected':''}" data-icon="${i}">${i}</button>`).join('')}
          </div>
        </div>
        ${isEdit && !existingCat.builtIn ? `<div class="form-group"><button class="btn btn-danger btn-full" id="m-cat-del">${t('cats.delete')}</button></div>` : ''}
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" id="m-cancel">${t('action.cancel')}</button>
        <button class="btn btn-primary" id="m-save-cat">${t('action.save')}</button>
      </div>
    `, modal => {
      let selectedIcon = icon;
      modal.querySelectorAll('.icon-opt').forEach(b => {
        b.addEventListener('click', () => {
          modal.querySelectorAll('.icon-opt').forEach(x => x.classList.remove('selected'));
          b.classList.add('selected');
          selectedIcon = b.dataset.icon;
        });
      });
      modal.querySelector('#m-close')?.addEventListener('click', closeModal);
      modal.querySelector('#m-cancel')?.addEventListener('click', closeModal);
      modal.querySelector('#m-save-cat')?.addEventListener('click', () => {
        const n = modal.querySelector('#m-cat-name').value.trim();
        if (!n) return;
        if (isEdit) {
          existingCat.name = n; existingCat.icon = selectedIcon;
          existingCat.updatedAt = new Date().toISOString();
        } else {
          state.categories.push({ id: uid(), name: n, icon: selectedIcon, createdAt: new Date().toISOString() });
        }
        saveState(); toast(t('toast.saved'), 'success'); closeModal(); renderCategories();
      });
      modal.querySelector('#m-cat-del')?.addEventListener('click', () => {
        if (confirm(t('cats.delete') + '?')) {
          state.categories = state.categories.filter(c => c.id !== existingCat.id);
          saveState(); closeModal(); catDetailId = null; renderCategories();
        }
      });
    });
  }

  /* ── MODALS: LIST ────────────────────────────────────────── */
  function openListModal(existingList) {
    const isEdit = !!existingList;
    const name   = existingList?.name || '';
    const type   = existingList?.type || 'reusable';
    const beh    = existingList?.completionBehavior || state.profile.listBehavior || 'move';

    showModal(`
      <div class="modal-header">
        <h2 class="modal-title">${isEdit ? t('lists.edit') : t('lists.new')}</h2>
        <button class="btn-icon" id="m-close" aria-label="${t('action.close')}">✕</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label for="m-list-name">${t('lists.name')}</label>
          <input type="text" id="m-list-name" value="${esc(name)}" placeholder="My grocery list..." />
        </div>
        <div class="form-group">
          <label>${t('lists.type')}</label>
          <div class="reminder-opts">
            <button class="reminder-opt ${type==='reusable'?'selected':''}" data-type="reusable">🔄 ${t('lists.type.reusable')}</button>
            <button class="reminder-opt ${type==='goal'?'selected':''}" data-type="goal">🎯 ${t('lists.type.goal')}</button>
            <button class="reminder-opt ${type==='template'?'selected':''}" data-type="template">📋 ${t('lists.type.template')}</button>
          </div>
        </div>
        <div class="form-group">
          <label>${t('lists.behavior')}</label>
          <div class="reminder-opts">
            <button class="reminder-opt ${beh==='move'?'selected':''}" data-beh="move">${t('lists.move')}</button>
            <button class="reminder-opt ${beh==='strikethrough'?'selected':''}" data-beh="strikethrough">${t('lists.strike')}</button>
          </div>
        </div>
        ${isEdit ? `<div class="form-group"><button class="btn btn-danger btn-full" id="m-list-del">${t('lists.delete')}</button></div>` : ''}
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" id="m-cancel">${t('action.cancel')}</button>
        <button class="btn btn-primary" id="m-save-list">${t('action.save')}</button>
      </div>
    `, modal => {
      let selectedType = type;
      let selectedBeh  = beh;
      modal.querySelectorAll('[data-type]').forEach(b => {
        b.addEventListener('click', () => {
          modal.querySelectorAll('[data-type]').forEach(x => x.classList.remove('selected'));
          b.classList.add('selected'); selectedType = b.dataset.type;
        });
      });
      modal.querySelectorAll('[data-beh]').forEach(b => {
        b.addEventListener('click', () => {
          modal.querySelectorAll('[data-beh]').forEach(x => x.classList.remove('selected'));
          b.classList.add('selected'); selectedBeh = b.dataset.beh;
        });
      });
      modal.querySelector('#m-close')?.addEventListener('click', closeModal);
      modal.querySelector('#m-cancel')?.addEventListener('click', closeModal);
      modal.querySelector('#m-save-list')?.addEventListener('click', () => {
        const n = modal.querySelector('#m-list-name').value.trim();
        if (!n) return;
        if (isEdit) {
          existingList.name = n; existingList.type = selectedType;
          existingList.completionBehavior = selectedBeh;
          existingList.updatedAt = new Date().toISOString();
        } else {
          state.lists.push({ id: uid(), name: n, type: selectedType, completionBehavior: selectedBeh, createdAt: new Date().toISOString() });
        }
        saveState(); toast(t('toast.saved'), 'success'); closeModal(); renderLists();
      });
      modal.querySelector('#m-list-del')?.addEventListener('click', () => {
        if (confirm(t('lists.delete') + '?')) {
          state.listItems = state.listItems.filter(i => i.listId !== existingList.id);
          state.lists = state.lists.filter(l => l.id !== existingList.id);
          saveState(); closeModal(); listDetailId = null; renderLists();
        }
      });
    });
  }

  /* ── MODALS: SHARED ──────────────────────────────────────── */
  function openSharedModal() {
    showModal(`
      <div class="modal-header">
        <h2 class="modal-title">${t('shared.create')}</h2>
        <button class="btn-icon" id="m-close" aria-label="${t('action.close')}">✕</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label for="m-sh-title">Title</label>
          <input type="text" id="m-sh-title" placeholder="Shared note title" />
        </div>
        <div class="form-group">
          <label for="m-sh-content">${t('shared.content')}</label>
          <textarea id="m-sh-content" rows="6" placeholder="Content to share..."></textarea>
        </div>
        <div class="form-group">
          <label>${t('shared.perm')}</label>
          <div class="reminder-opts">
            <button class="reminder-opt selected" data-perm="viewOnly">${t('shared.viewOnly')}</button>
            <button class="reminder-opt" data-perm="comment">${t('shared.comment')}</button>
            <button class="reminder-opt" data-perm="edit">${t('shared.edit')}</button>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" id="m-cancel">${t('action.cancel')}</button>
        <button class="btn btn-primary" id="m-create-shared">${t('action.create')}</button>
      </div>
    `, modal => {
      let selectedPerm = 'viewOnly';
      modal.querySelectorAll('[data-perm]').forEach(b => {
        b.addEventListener('click', () => {
          modal.querySelectorAll('[data-perm]').forEach(x => x.classList.remove('selected'));
          b.classList.add('selected'); selectedPerm = b.dataset.perm;
        });
      });
      modal.querySelector('#m-close')?.addEventListener('click', closeModal);
      modal.querySelector('#m-cancel')?.addEventListener('click', closeModal);
      modal.querySelector('#m-create-shared')?.addEventListener('click', () => {
        const title   = modal.querySelector('#m-sh-title').value.trim();
        const content = modal.querySelector('#m-sh-content').value.trim();
        if (!content) return;
        const token = uid() + uid();
        state.sharedItems.push({
          id: uid(), token, title: title || 'Shared Note', content, permission: selectedPerm,
          createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        });
        saveState();
        const url = location.origin + location.pathname + '?shared=' + token;
        navigator.clipboard.writeText(url).then(() => toast(t('toast.copied'), 'success'));
        closeModal(); renderShared();
      });
    });
  }

  /* ── MODALS: DATE ACTION ─────────────────────────────────── */
  function openDateActionModal(dateStr) {
    const months = t('cal.months').split(',');
    const d = new Date(dateStr + 'T00:00:00');
    const label = `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;

    showModal(`
      <div class="modal-header">
        <h2 class="modal-title">${t('dateAction.title')} ${label}</h2>
        <button class="btn-icon" id="m-close" aria-label="${t('action.close')}">✕</button>
      </div>
      <div class="modal-body" style="display:flex;flex-direction:column;gap:12px">
        <button class="btn btn-secondary btn-full" id="da-note">📝 ${t('dateAction.note')}</button>
        <button class="btn btn-secondary btn-full" id="da-reminder">🔔 ${t('dateAction.reminder')}</button>
        <button class="btn btn-secondary btn-full" id="da-appt">📋 ${t('dateAction.appt')}</button>
      </div>
    `, modal => {
      modal.querySelector('#m-close')?.addEventListener('click', closeModal);
      modal.querySelector('#da-note')?.addEventListener('click', () => { closeModal(); openQuickNoteModal(dateStr); });
      modal.querySelector('#da-reminder')?.addEventListener('click', () => { closeModal(); openQuickNoteModal(dateStr); });
      modal.querySelector('#da-appt')?.addEventListener('click', () => { closeModal(); openAppointmentModal(dateStr); });
    });
  }

  /* ── MODALS: APPOINTMENT ─────────────────────────────────── */
  function openAppointmentModal(prefilledDate) {
    showModal(`
      <div class="modal-header">
        <h2 class="modal-title">📋 ${t('dateAction.appt')}</h2>
        <button class="btn-icon" id="m-close" aria-label="${t('action.close')}">✕</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label for="m-appt-name">Appointment Name</label>
          <input type="text" id="m-appt-name" placeholder="Doctor visit, dentist, meeting..." />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="m-appt-date">${t('cat.dueDate')}</label>
            <input type="date" id="m-appt-date" value="${prefilledDate || ''}" />
          </div>
          <div class="form-group">
            <label for="m-appt-time">${t('remind.appointmentAt')}</label>
            <input type="time" id="m-appt-time" />
          </div>
        </div>
        <div class="form-group">
          <label for="m-leave-time">${t('remind.leaveAt')}</label>
          <input type="time" id="m-leave-time" />
        </div>
        <div class="form-group">
          <label for="m-appt-addr">${t('cat.address')}</label>
          <input type="text" id="m-appt-addr" placeholder="123 Main St..." />
        </div>
        <div class="form-group">
          <label for="m-appt-notes">Notes</label>
          <textarea id="m-appt-notes" rows="3" placeholder="Bring insurance card, etc."></textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" id="m-cancel">${t('action.cancel')}</button>
        <button class="btn btn-primary" id="m-save-appt">${t('action.save')}</button>
      </div>
    `, modal => {
      modal.querySelector('#m-close')?.addEventListener('click', closeModal);
      modal.querySelector('#m-cancel')?.addEventListener('click', closeModal);
      modal.querySelector('#m-save-appt')?.addEventListener('click', () => {
        const name    = modal.querySelector('#m-appt-name').value.trim();
        const date    = modal.querySelector('#m-appt-date').value;
        const time    = modal.querySelector('#m-appt-time').value;
        const leave   = modal.querySelector('#m-leave-time').value;
        const addr    = modal.querySelector('#m-appt-addr').value.trim();
        const notes   = modal.querySelector('#m-appt-notes').value.trim();
        if (!name) return;

        let reminderAt = null;
        if (date && leave) reminderAt = new Date(date + 'T' + leave).toISOString();
        else if (date && time) { const d2 = new Date(date + 'T' + time); d2.setMinutes(d2.getMinutes() - 30); reminderAt = d2.toISOString(); }

        const note = {
          id: uid(), title: name,
          body: [notes, leave ? `${t('remind.leaveAt')}: ${leave}` : ''].filter(Boolean).join('\n'),
          status: 'active', categoryIds: [], priority: 'high',
          dueDate: date || null, dueTime: time || null, reminderAt,
          locationName: name, address: addr || null,
          createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), deleted: false,
        };
        saveNote(note);
        toast(t('toast.saved'), 'success');
        closeModal(); scheduleReminders();
        renderTab(currentTab);
      });
    });
  }

  /* ── MODALS: ADDRESS ─────────────────────────────────────── */
  function openAddressModal(note) {
    const addr = encodeURIComponent(note.address || '');
    showModal(`
      <div class="modal-header">
        <h2 class="modal-title">📍 ${note.locationName || t('cat.address')}</h2>
        <button class="btn-icon" id="m-close" aria-label="${t('action.close')}">✕</button>
      </div>
      <div class="modal-body" style="display:flex;flex-direction:column;gap:12px">
        <div style="font-size:var(--text-sm);color:var(--color-text-muted)">${esc(note.address)}</div>
        <a href="https://maps.apple.com/?q=${addr}" target="_blank" class="btn btn-secondary btn-full">🍎 ${t('addr.openApple')}</a>
        <a href="https://www.google.com/maps/search/?api=1&query=${addr}" target="_blank" class="btn btn-secondary btn-full">🗺️ ${t('addr.openGoogle')}</a>
        <button class="btn btn-secondary btn-full" id="addr-copy">${t('addr.copy')}</button>
      </div>
    `, modal => {
      modal.querySelector('#m-close')?.addEventListener('click', closeModal);
      modal.querySelector('#addr-copy')?.addEventListener('click', () => {
        navigator.clipboard.writeText(note.address).then(() => { toast(t('toast.copied'), 'success'); closeModal(); });
      });
    });
  }

  /* ── NOTE CRUD ───────────────────────────────────────────── */
  function saveNote(note) {
    const idx = state.notes.findIndex(n => n.id === note.id);
    if (idx >= 0) state.notes[idx] = note;
    else state.notes.unshift(note);
    saveState();
    renderTab(currentTab);
  }

  /* ── REMINDERS / NOTIFICATIONS ───────────────────────────── */
  function requestNotificationPermission() {
    if (!('Notification' in window)) return Promise.resolve();
    return Notification.requestPermission();
  }

  function scheduleReminders() {
    if (_reminderTimer) clearTimeout(_reminderTimer);
    const now = Date.now();
    const upcoming = state.notes
      .filter(n => !n.deleted && n.reminderAt && n.status !== 'completed' && n.status !== 'archived')
      .map(n => ({ note: n, at: new Date(n.reminderAt).getTime() }))
      .filter(x => x.at > now)
      .sort((a, b) => a.at - b.at);

    if (!upcoming.length) return;
    const next = upcoming[0];
    const delay = next.at - now;
    if (delay > 86400000) return; // skip if > 24h away
    _reminderTimer = setTimeout(() => {
      fireReminder(next.note);
      scheduleReminders(); // re-schedule for next one
    }, delay);
  }

  function fireReminder(note) {
    if (Notification?.permission === 'granted') {
      new Notification('QuickNotes', {
        body: note.title,
        icon: './icons/icon-192.png',
        tag: note.id,
      });
    }
    // Also show in-app banner
    toast('🔔 ' + note.title);
  }

  function checkMissedReminders() {
    const now = new Date();
    const missed = state.notes.filter(n =>
      !n.deleted && n.reminderAt && n.status !== 'completed' && n.status !== 'archived' &&
      new Date(n.reminderAt) < now && !n._reminderFired
    );
    if (missed.length) {
      missed.forEach(n => { n._reminderFired = true; });
      saveState();
      // Show missed reminder banner
      if (missed.length === 1) toast('🔔 Missed: ' + missed[0].title);
      else toast(`🔔 ${missed.length} missed reminders`);
    }
  }

  /* ── ONBOARDING ──────────────────────────────────────────── */
  function showOnboarding() {
    const el = document.createElement('div');
    el.className = 'onboard-overlay';
    el.innerHTML = `
      <div class="onboard-icon">✏️</div>
      <h1 class="onboard-title">${t('onboard.title')}</h1>
      <p class="onboard-sub">${t('onboard.sub')}</p>
      <input class="onboard-input" type="text" id="onboard-name" placeholder="${t('onboard.ph')}" autocomplete="given-name" />
      <button class="btn btn-primary" id="onboard-btn" style="min-width:200px">${t('onboard.btn')}</button>
    `;
    document.body.appendChild(el);

    el.querySelector('#onboard-btn')?.addEventListener('click', () => {
      const name = (el.querySelector('#onboard-name')?.value || '').trim();
      state.profile.name = name;
      state.profile.onboardingDone = true;
      saveState();
      el.remove();
      renderDashboard();
    });
    el.querySelector('#onboard-name')?.addEventListener('keydown', e => {
      if (e.key === 'Enter') el.querySelector('#onboard-btn')?.click();
    });
    requestAnimationFrame(() => el.querySelector('#onboard-name')?.focus());
  }

  /* ── SHARED VIEW (public link) ───────────────────────────── */
  function checkSharedView() {
    const params = new URLSearchParams(location.search);
    const token  = params.get('shared');
    if (!token) return false;
    const item = state.sharedItems.find(i => i.token === token);
    if (!item) {
      document.body.innerHTML = `<div style="padding:40px;max-width:600px;margin:0 auto;font-family:system-ui">
        <h2>Item not found</h2><p style="color:#888;margin-top:8px">This shared link is no longer available.</p>
      </div>`;
      return true;
    }
    document.body.innerHTML = `
      <div style="padding:40px;max-width:600px;margin:0 auto;font-family:system-ui;color:#f7f8fb;background:#050607;min-height:100vh">
        <a href="${location.pathname}" style="color:#58c18f;font-size:14px;text-decoration:none">← Open QuickNotes</a>
        <h1 style="margin:24px 0 8px;font-size:1.5rem">${esc(item.title)}</h1>
        <div style="color:#a0a8bd;font-size:13px;margin-bottom:24px">Shared on ${new Date(item.createdAt).toLocaleDateString()}</div>
        <div style="white-space:pre-wrap;line-height:1.7;background:#111318;padding:20px;border-radius:16px">${esc(item.content)}</div>
      </div>`;
    return true;
  }

  /* ── SW UPDATE BANNER ────────────────────────────────────── */
  function initServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('./sw.js')
      .then(reg => {
        reg.addEventListener('updatefound', () => {
          const nw = reg.installing;
          nw?.addEventListener('statechange', () => {
            if (nw.statechange === 'installed' && navigator.serviceWorker.controller) {
              document.getElementById('update-notice')?.removeAttribute('hidden');
            }
          });
        });
        // Check every 12h
        const lastCheck = parseInt(localStorage.getItem('qn_sw_check') || '0', 10);
        if (Date.now() - lastCheck > 43200000) {
          reg.update();
          localStorage.setItem('qn_sw_check', Date.now());
        }
      })
      .catch(e => log('SW registration failed', e));

    navigator.serviceWorker.addEventListener('message', e => {
      if (e.data?.type === 'RELOAD_READY') location.reload();
    });

    document.getElementById('update-reload')?.addEventListener('click', () => {
      navigator.serviceWorker.getRegistration().then(reg => {
        reg?.waiting?.postMessage({ type: 'SKIP_WAITING' });
      });
    });
  }

  /* ── INIT ────────────────────────────────────────────────── */
  function init() {
    loadState();

    // Check for shared view before anything else
    if (checkSharedView()) return;

    // Apply saved theme and language
    KHub.Theme.apply(state.profile.theme || 'system');
    if (state.profile.lang) KHub.I18n.set(state.profile.lang);

    // Init SW
    initServiceWorker();

    // Nav event listeners
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', () => navigate(btn.dataset.tab));
    });

    // Header controls
    document.getElementById('theme-toggle')?.addEventListener('click', () => {
      const next = KHub.Theme.resolved === 'dark' ? 'light' : 'dark';
      KHub.Theme.apply(next);
      state.profile.theme = next; saveState();
    });
    document.getElementById('lang-toggle')?.addEventListener('click', () => {
      const next = KHub.I18n.current() === 'en' ? 'es' : 'en';
      KHub.I18n.set(next);
      state.profile.lang = next; saveState();
      renderTab(currentTab);
    });

    // FAB
    document.getElementById('fab-quick-note')?.addEventListener('click', openQuickNoteModal);

    // Check missed reminders
    checkMissedReminders();

    // Schedule upcoming reminders
    scheduleReminders();

    // First render
    navigate('dashboard');

    // Onboarding (only if name not set)
    if (!state.profile.onboardingDone) {
      showOnboarding();
    }

    // Re-render dashboard every minute (for time-sensitive info)
    setInterval(() => {
      if (currentTab === 'dashboard') renderDashboard();
    }, 60000);

    KHub.Config.log('App initialized');
    window.KHub.emit('app:ready');
  }

  document.addEventListener('DOMContentLoaded', init);
})();
