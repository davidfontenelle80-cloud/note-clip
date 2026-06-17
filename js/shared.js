/**
 * shared.js — Note Clip PWA
 * Shared tab redesign — Stage 2 Item E.
 * Header · compact recent-shares cards · inline create form · empty state.
 */
(function (App) {
  'use strict';

  function _esc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  // ── Single shared item card ───────────────────────────────────────
  function buildSharedCard(item) {
    const t    = App.I18n.t.bind(App.I18n);
    const lang = App.I18n.current();
    const date = new Date(item.sharedAt).toLocaleDateString(
      lang === 'es' ? 'es-ES' : 'en-US', { month: 'short', day: 'numeric' }
    );
    const text = encodeURIComponent(`${item.title}\n\n${item.content}`);
    const isNote = item.type !== 'list';
    const typeBadge = isNote
      ? `<span class="chip" style="font-size:.7rem;padding:2px 7px">📝 Note</span>`
      : `<span class="chip" style="font-size:.7rem;padding:2px 7px">📋 List</span>`;

    return `<div class="card shared-card">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
        <div style="flex:1;min-width:0">
          <div style="font-weight:700;margin-bottom:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
            ${_esc(item.title)}
          </div>
          <div style="font-size:var(--text-xs);color:var(--color-text-3);margin-bottom:6px">
            ${date} &nbsp;·&nbsp; ${typeBadge}
          </div>
          <div style="font-size:var(--text-sm);color:var(--color-text-2);overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical">
            ${_esc(item.content.slice(0, 120))}${item.content.length > 120 ? '…' : ''}
          </div>
        </div>
        <button class="card-delete-btn" onclick="App.Shared._delete('${item.id}')" title="${t('delete')}">×</button>
      </div>
      <div class="shared-card-actions">
        <a class="btn btn-sm btn-secondary share-btn whatsapp"
           href="https://wa.me/?text=${text}" target="_blank" rel="noopener">
          💬 WhatsApp
        </a>
        <a class="btn btn-sm btn-secondary share-btn email"
           href="mailto:?subject=${encodeURIComponent(item.title)}&body=${text}" target="_blank" rel="noopener">
          ✉️ ${t('share_email')}
        </a>
        <button class="btn btn-sm btn-secondary share-btn copy" onclick="App.Shared._copy('${item.id}')">
          📋 ${t('share_copy')}
        </button>
      </div>
    </div>`;
  }

  // ── Render ────────────────────────────────────────────────────────
  function render() {
    const el = document.getElementById('pane-shared');
    if (!el) return;
    const state = App.Storage.getState();
    const t     = App.I18n.t.bind(App.I18n);

    const noteOptions = state.notes.slice(0, 40).map(n =>
      `<option value="note:${n.id}">${_esc((n.title || n.body).slice(0, 50))}</option>`
    ).join('');
    const listOptions = state.lists.map(l =>
      `<option value="list:${l.id}">${_esc(l.name)}</option>`
    ).join('');

    const hasShared = state.sharedItems && state.sharedItems.length > 0;

    const emptyState = `
      <div class="empty-state" style="padding:var(--space-xl) 0">
        <div class="empty-state-icon">🔗</div>
        <div class="empty-state-text">${t('shared_nothing_yet')}</div>
        <div class="empty-state-sub">${t('shared_subtitle')}</div>
      </div>`;

    const sharedCards = hasShared
      ? state.sharedItems.map(buildSharedCard).join('')
      : emptyState;

    el.innerHTML = `
      <!-- Header -->
      <div class="shared-header">
        <h2 style="font-size:var(--text-xl);font-weight:700">${t('tab_shared')}</h2>
        <p class="shared-subtitle">${t('shared_subtitle')}</p>
      </div>

      <!-- Recent shared items -->
      <div id="shared-cards-wrap">
        ${sharedCards}
      </div>

      <!-- Create share form -->
      <div class="share-form">
        <div class="form-group" style="margin-bottom:10px">
          <label class="form-label" style="margin-bottom:5px">${t('shared_pick_label')}</label>
          <select id="share-select" class="form-select">
            <option value="">— ${t('shared_choose')} —</option>
            ${noteOptions ? `<optgroup label="Notes">${noteOptions}</optgroup>` : ''}
            ${listOptions ? `<optgroup label="Lists">${listOptions}</optgroup>` : ''}
          </select>
        </div>
        <div style="display:flex;gap:8px">
          <button class="btn btn-primary" style="flex:1" onclick="App.Shared._createShare('copy')">
            📋 ${t('share_copy')}
          </button>
          <button class="btn btn-secondary" style="flex:1" onclick="App.Shared._createShare('whatsapp')">
            💬 WhatsApp
          </button>
          <button class="btn btn-secondary" style="flex:1" onclick="App.Shared._createShare('email')">
            ✉️ ${t('share_email')}
          </button>
        </div>
      </div>
    `;
  }

  function _createShare(via) {
    const sel = document.getElementById('share-select');
    if (!sel?.value) { App.showToast('Select something to share', 'error'); return; }
    const [type, id] = sel.value.split(':');
    const state = App.Storage.getState();
    let title = '', content = '';

    if (type === 'note') {
      const note = state.notes.find(n => n.id === id);
      if (!note) return;
      title   = note.title || note.body.slice(0, 50);
      content = note.body;
    } else if (type === 'list') {
      const list = state.lists.find(l => l.id === id);
      if (!list) return;
      title   = list.name;
      content = list.items.map(i => `${i.checked ? '[x]' : '[ ]'} ${i.text}`).join('\n');
    }

    App.Storage.addShared({ title, content, type });

    const text = encodeURIComponent(`${title}\n\n${content}`);
    if (via === 'whatsapp') {
      window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener');
    } else if (via === 'email') {
      window.open(`mailto:?subject=${encodeURIComponent(title)}&body=${text}`, '_blank', 'noopener');
    } else {
      navigator.clipboard.writeText(`${title}\n\n${content}`)
        .then(() => App.showToast('Copied to clipboard', 'success'));
    }

    App.showToast('Added to Shared', 'success');
    render();
  }

  function _delete(id) {
    if (!confirm('Remove from Shared?')) return;
    App.Storage.deleteShared(id);
    App.showToast('Removed', 'success');
    render();
  }

  function _copy(id) {
    const state = App.Storage.getState();
    const item  = state.sharedItems.find(s => s.id === id);
    if (!item) return;
    navigator.clipboard.writeText(`${item.title}\n\n${item.content}`)
      .then(() => App.showToast('Copied to clipboard', 'success'));
  }

  function onFab() {
    render();
    document.getElementById('share-select')?.focus();
  }

  App.Shared = { render, onFab, _createShare, _delete, _copy };

})(window.App = window.App || {});
