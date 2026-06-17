/**
 * shared.js — Note Clip PWA
 * Shared tab: share notes/lists via text, WhatsApp, email, copy link.
 */
(function (App) {
  'use strict';

  function _esc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function buildShareCard(item) {
    const t = App.I18n.t.bind(App.I18n);
    const date = new Date(item.sharedAt).toLocaleDateString(
      App.I18n.current() === 'es' ? 'es-ES' : 'en-US',
      { month: 'short', day: 'numeric' }
    );
    const text = encodeURIComponent(`${item.title}\n\n${item.content}`);
    return `<div class="share-card">
      <div style="display:flex;justify-content:space-between;align-items:flex-start">
        <div>
          <div style="font-weight:700;margin-bottom:4px">${_esc(item.title)}</div>
          <div style="font-size:var(--text-sm);color:var(--color-text-muted)">${_esc(item.content.slice(0,100))}${item.content.length>100?'…':''}</div>
        </div>
        <button class="card-delete-btn" onclick="App.Shared._delete('${item.id}')">×</button>
      </div>
      <div class="share-actions">
        <a class="share-btn whatsapp" href="https://wa.me/?text=${text}" target="_blank">
          💬 ${t('share_whatsapp')}
        </a>
        <a class="share-btn email" href="mailto:?subject=${encodeURIComponent(item.title)}&body=${text}" target="_blank">
          ✉️ ${t('share_email')}
        </a>
        <button class="share-btn copy" onclick="App.Shared._copy('${item.id}')">
          📋 ${t('share_copy')}
        </button>
      </div>
      <div style="font-size:var(--text-xs);color:var(--color-text-dim);margin-top:var(--space-sm)">${date}</div>
    </div>`;
  }

  function render() {
    const el = document.getElementById('pane-shared');
    if (!el) return;
    const state = App.Storage.getState();
    const t = App.I18n.t.bind(App.I18n);

    // Also build share options from existing notes/lists
    const noteOptions = state.notes.slice(0, 30).map(n =>
      `<option value="note:${n.id}">${_esc((n.title || n.body).slice(0,40))}</option>`
    ).join('');
    const listOptions = state.lists.map(l =>
      `<option value="list:${l.id}">${_esc(l.name)}</option>`
    ).join('');

    const sharedCards = state.sharedItems.length
      ? state.sharedItems.map(buildShareCard).join('')
      : `<div class="empty-state">
           <div class="empty-state-icon">🔗</div>
           <div class="empty-state-text">Nothing shared yet</div>
           <div class="empty-state-sub">Select a note or list below to share it</div>
         </div>`;

    el.innerHTML = `
      <div class="section-header">
        <span class="section-title">${t('tab_shared')}</span>
      </div>
      <div class="card mb-md">
        <div class="form-group">
          <label class="form-label">Share a note or list</label>
          <select id="share-select" class="form-select">
            <option value="">— choose one —</option>
            ${noteOptions ? `<optgroup label="Notes">${noteOptions}</optgroup>` : ''}
            ${listOptions ? `<optgroup label="Lists">${listOptions}</optgroup>` : ''}
          </select>
        </div>
        <button class="btn btn-primary w-full" onclick="App.Shared._createShare()">
          ${t('share_via')} →
        </button>
      </div>
      ${sharedCards}`;
  }

  function _createShare() {
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
      content = list.items.map(i => `${i.checked?'[x]':'[ ]'} ${i.text}`).join('\n');
    }
    App.Storage.addShared({ title, content });
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
    const item = state.sharedItems.find(s => s.id === id);
    if (!item) return;
    navigator.clipboard.writeText(`${item.title}\n\n${item.content}`)
      .then(() => App.showToast('Copied to clipboard', 'success'));
  }

  function onFab() { render(); document.getElementById('share-select')?.focus(); }

  App.Shared = { render, onFab, _createShare, _delete, _copy };

})(window.App = window.App || {});
