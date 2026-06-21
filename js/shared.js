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
      ? `<span class="chip" style="font-size:.7rem;padding:2px 7px">${t('share_note')}</span>`
      : `<span class="chip" style="font-size:.7rem;padding:2px 7px">${t('share_list')}</span>`;

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
          WhatsApp
        </a>
        <a class="btn btn-sm btn-secondary share-btn email"
           href="mailto:?subject=${encodeURIComponent(item.title)}&body=${text}" target="_blank" rel="noopener">
          ${t('share_email')}
        </a>
        <button class="btn btn-sm btn-secondary share-btn copy" onclick="App.Shared._copy('${item.id}')">
          ${t('share_copy')}
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

    const byMeContent = hasShared
      ? state.sharedItems.map(buildSharedCard).join('')
      : `<p class="empty-state-sm">${t('shared_nothing_yet')}</p>`;

    el.innerHTML = `
      <!-- Header -->
      <div class="shared-header">
        <h2 style="font-size:var(--text-xl);font-weight:700">${t('tab_shared')}</h2>
        <p class="shared-subtitle">${t('shared_subtitle')}</p>
      </div>

      <!-- Shared by Me -->
      <section class="dash-section">
        <h3 class="dash-section-title">${t('shared_by_me')}</h3>
        <div id="shared-cards-wrap">${byMeContent}</div>
      </section>

      <!-- Shared with Me (placeholder) -->
      <section class="dash-section">
        <h3 class="dash-section-title">${t('shared_with_me')}</h3>
        <p class="empty-state-sm">${t('shared_with_me_empty')}</p>
      </section>

      <!-- Share Something -->
      <section class="dash-section" id="share-workflow">
        <h3 class="dash-section-title">${t('shared_share_something')}</h3>
        <div class="share-form">
          <div class="form-group" style="margin-bottom:10px">
            <label class="form-label" style="margin-bottom:5px">${t('shared_pick_label')}</label>
            <select id="share-select" class="form-select">
              <option value="">— ${t('shared_choose')} —</option>
              ${noteOptions ? `<optgroup label="${t('tab_notes')}">${noteOptions}</optgroup>` : ''}
              ${listOptions ? `<optgroup label="${t('tab_lists')}">${listOptions}</optgroup>` : ''}
            </select>
          </div>
          <div style="display:flex;gap:8px;flex-direction:column">
            <button class="btn btn-primary w-full" onclick="App.Shared._createShare('copy')">
              ${t('share_copy')}
            </button>
            <button class="btn btn-secondary w-full" onclick="App.Shared._createShare('whatsapp')">
              WhatsApp
            </button>
            <button class="btn btn-secondary w-full" onclick="App.Shared._createShare('email')">
              ${t('share_email')}
            </button>
          </div>
        </div>
      </section>
    `;
  }

  function _createShare(via) {
    const sel = document.getElementById('share-select');
    if (!sel?.value) { App.showToast(App.I18n.t('toast_share_select'), 'error'); return; }
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

    const rawText = `${title}\n\n${content}`;
    const text = encodeURIComponent(rawText);
    if (via === 'whatsapp') {
      App.Storage.addShared({ title, content, type });
      window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener');
      App.showToast(App.I18n.t('toast_shared_added'), 'success');
      render();
    } else if (via === 'email') {
      App.Storage.addShared({ title, content, type });
      window.open(`mailto:?subject=${encodeURIComponent(title)}&body=${text}`, '_blank', 'noopener');
      App.showToast(App.I18n.t('toast_shared_added'), 'success');
      render();
    } else {
      _copyText(rawText)
        .then(() => {
          App.Storage.addShared({ title, content, type });
          App.showToast(App.I18n.t('toast_copied'), 'success');
          render();
        })
        .catch(() => App.showToast(App.I18n.t('toast_copy_failed'), 'error'));
    }
  }

  function _delete(id) {
    if (!confirm(App.I18n.t('confirm_remove_shared'))) return;
    App.Storage.deleteShared(id);
    App.showToast(App.I18n.t('toast_removed'), 'success');
    render();
  }

  function _copy(id) {
    const state = App.Storage.getState();
    const item  = state.sharedItems.find(s => s.id === id);
    if (!item) return;
    _copyText(`${item.title}\n\n${item.content}`)
      .then(() => App.showToast(App.I18n.t('toast_copied'), 'success'))
      .catch(() => App.showToast(App.I18n.t('toast_copy_failed'), 'error'));
  }

  function _copyText(text) {
    if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
    return new Promise((resolve, reject) => {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy') ? resolve() : reject(new Error('copy failed'));
      } catch (err) {
        reject(err);
      } finally {
        ta.remove();
      }
    });
  }

  function onFab() {
    const workflow = document.getElementById('share-workflow');
    const select = document.getElementById('share-select');
    if (!workflow || !select) {
      render();
      setTimeout(onFab, 0);
      return;
    }
    workflow.scrollIntoView({ behavior: 'smooth', block: 'center' });
    select.focus();
    App.showToast(App.I18n.t('toast_share_ready'), 'info');
  }

  App.Shared = { render, onFab, _createShare, _delete, _copy };

})(window.App = window.App || {});
