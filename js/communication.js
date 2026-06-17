/**
 * communication.js — Note Clip PWA
 * Communication tab: draft messages, emails, WhatsApp text. EN/ES support.
 */
(function (App) {
  'use strict';

  function _esc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  // Simple template generator
  function _generateDraft(type, context, lang) {
    const isEs = lang === 'es';
    if (type === 'whatsapp') {
      return isEs
        ? `Hola! Quería comunicarme contigo sobre lo siguiente:\n\n${context}\n\nQuedo en espera de tu respuesta. Saludos.`
        : `Hi! I wanted to reach out about the following:\n\n${context}\n\nLooking forward to your reply. Thanks!`;
    } else if (type === 'email') {
      return isEs
        ? `Asunto: [Asunto aquí]\n\nEstimado/a,\n\nEspero que estés bien. Le escribo con respecto a:\n\n${context}\n\nQuedo a su disposición para cualquier pregunta.\n\nAtentamente,\n${App.Storage.getState().settings.username || '[Tu nombre]'}`
        : `Subject: [Subject here]\n\nHi,\n\nI hope this message finds you well. I'm writing regarding:\n\n${context}\n\nPlease don't hesitate to reach out with any questions.\n\nBest regards,\n${App.Storage.getState().settings.username || '[Your name]'}`;
    } else {
      // Generic message
      return isEs
        ? `Hola,\n\n${context}\n\nGracias.`
        : `Hi,\n\n${context}\n\nThank you.`;
    }
  }

  function buildDraftCard(draft) {
    const t = App.I18n.t.bind(App.I18n);
    const date = new Date(draft.createdAt).toLocaleDateString(
      App.I18n.current() === 'es' ? 'es-ES' : 'en-US',
      { month: 'short', day: 'numeric' }
    );
    const icons = { message: '💬', email: '✉️', whatsapp: '📱' };
    return `<div class="share-card">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:var(--space-sm)">
        <div style="flex:1">
          <div style="font-size:var(--text-xs);color:var(--color-text-muted);margin-bottom:4px">
            ${icons[draft.type]||'💬'} ${t('draft_'+draft.type)} · ${date} · ${draft.language.toUpperCase()}
          </div>
          <div style="font-size:var(--text-sm);white-space:pre-wrap;line-height:1.5">${_esc(draft.content.slice(0,200))}${draft.content.length>200?'…':''}</div>
        </div>
        <button class="card-delete-btn" onclick="App.Communication._deleteDraft('${draft.id}')">×</button>
      </div>
      <div class="share-actions">
        <button class="share-btn copy" onclick="App.Communication._copyDraft('${draft.id}')">
          📋 ${t('copy_draft')}
        </button>
        <a class="share-btn whatsapp" href="https://wa.me/?text=${encodeURIComponent(draft.content)}" target="_blank">
          💬 WhatsApp
        </a>
      </div>
    </div>`;
  }

  function render() {
    const el = document.getElementById('pane-communication');
    if (!el) return;
    const state = App.Storage.getState();
    const t = App.I18n.t.bind(App.I18n);
    const lang = state.settings.language || 'en';

    const typeOpts = ['message','email','whatsapp'].map(tp =>
      `<option value="${tp}">${t('draft_'+tp)}</option>`
    ).join('');

    const savedDrafts = state.drafts.length
      ? `<div class="section-header" style="margin-top:var(--space-lg)">
           <span class="section-title">${t('saved_drafts')}</span>
         </div>
         ${state.drafts.map(buildDraftCard).join('')}`
      : '';

    el.innerHTML = `
      <div class="section-header">
        <span class="section-title">${t('tab_communication')}</span>
      </div>
      <div class="card mb-md">
        <div class="form-group">
          <label class="form-label">${t('draft_type')}</label>
          <select id="comm-type" class="form-select">${typeOpts}</select>
        </div>
        <div class="form-group">
          <label class="form-label">${t('draft_context')}</label>
          <textarea id="comm-context" class="form-textarea"
            placeholder="${t('draft_context_ph')}" rows="4"></textarea>
        </div>
        <div style="display:flex;gap:var(--space-sm)">
          <button class="btn btn-secondary" onclick="App.Communication._generate('en')" style="flex:1">
            Generate EN
          </button>
          <button class="btn btn-secondary" onclick="App.Communication._generate('es')" style="flex:1">
            Generar ES
          </button>
        </div>
        <div id="draft-output" class="draft-output hidden"></div>
        <div id="draft-actions" class="share-actions hidden">
          <button class="share-btn copy" onclick="App.Communication._copyOutput()">📋 ${t('copy_draft')}</button>
          <button class="share-btn" onclick="App.Communication._saveOutput()">💾 ${t('save_draft')}</button>
        </div>
      </div>
      ${savedDrafts}`;
  }

  let _currentDraft = { type: 'message', context: '', content: '', language: 'en' };

  function _generate(lang) {
    const type    = document.getElementById('comm-type')?.value    || 'message';
    const context = document.getElementById('comm-context')?.value.trim() || '';
    if (!context) { App.showToast('Add some context first', 'error'); return; }
    const content = _generateDraft(type, context, lang);
    _currentDraft = { type, context, content, language: lang };
    const outputEl  = document.getElementById('draft-output');
    const actionsEl = document.getElementById('draft-actions');
    if (outputEl)  { outputEl.textContent = content; outputEl.classList.remove('hidden'); }
    if (actionsEl) { actionsEl.classList.remove('hidden'); }
  }

  function _copyOutput() {
    if (_currentDraft.content) {
      navigator.clipboard.writeText(_currentDraft.content)
        .then(() => App.showToast('Copied!', 'success'));
    }
  }

  function _saveOutput() {
    if (!_currentDraft.content) return;
    App.Storage.addDraft(_currentDraft);
    App.showToast('Draft saved', 'success');
    render();
  }

  function _deleteDraft(id) {
    if (!confirm('Delete this draft?')) return;
    App.Storage.deleteDraft(id);
    App.showToast('Draft deleted', 'success');
    render();
  }

  function _copyDraft(id) {
    const state = App.Storage.getState();
    const draft = state.drafts.find(d => d.id === id);
    if (draft) {
      navigator.clipboard.writeText(draft.content)
        .then(() => App.showToast('Copied!', 'success'));
    }
  }

  function onFab() { document.getElementById('comm-context')?.focus(); }

  App.Communication = { render, onFab, _generate, _copyOutput, _saveOutput, _deleteDraft, _copyDraft };

})(window.App = window.App || {});
