/* photo-attachments.js — Stage 15C photo review + naming */
(function(App){
  'use strict';

  const MAX_SIDE = 1400;
  const JPEG_QUALITY = 0.78;

  function uid(){ return 'att_' + Date.now().toString(36) + Math.random().toString(36).slice(2,7); }
  function esc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
  function baseName(name,fallback){ return String(name||fallback||'Photo').replace(/\.[^.]+$/,'').trim() || fallback || 'Photo'; }

  function ensureReviewStyles(){
    if(document.getElementById('photo-review-inline-style')) return;
    const s=document.createElement('style');
    s.id='photo-review-inline-style';
    s.textContent='.photo-review-backdrop{position:fixed;inset:0;z-index:2147482500;background:rgba(0,0,0,.72);display:flex;align-items:center;justify-content:center;padding:16px}.photo-review-card{width:min(560px,100%);max-height:92vh;overflow:auto;border-radius:24px;background:#fffaf0;padding:16px;box-shadow:0 22px 60px rgba(0,0,0,.35);display:flex;flex-direction:column;gap:12px;color:#2d2110}.photo-review-head{display:flex;align-items:center;justify-content:space-between}.photo-review-head b{font-size:1.05rem}.photo-review-close{width:42px;height:42px;border:0;border-radius:50%;background:rgba(45,33,16,.12);font-size:28px;color:#2d2110}.photo-review-preview{max-width:100%;max-height:52vh;object-fit:contain;align-self:center;border-radius:18px;background:#111}.photo-review-field{display:flex;flex-direction:column;gap:6px;font-weight:800}.photo-review-field input{min-height:46px;border-radius:14px;border:1px solid rgba(45,33,16,.2);padding:0 12px;font-size:1rem;background:#fff}.photo-review-actions{display:grid;grid-template-columns:1fr 1.1fr;gap:10px}.photo-review-actions .btn{min-height:46px}@media(max-width:430px){.photo-review-actions{grid-template-columns:1fr}}';
    document.head.appendChild(s);
  }

  function readAsDataUrl(file){
    return new Promise(function(resolve,reject){
      const reader = new FileReader();
      reader.onload = function(){ resolve(reader.result); };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function loadImage(src){
    return new Promise(function(resolve,reject){
      const img = new Image();
      img.onload = function(){ resolve(img); };
      img.onerror = reject;
      img.src = src;
    });
  }

  async function compressImage(file){
    const src = await readAsDataUrl(file);
    const img = await loadImage(src);
    let w = img.width;
    let h = img.height;
    const scale = Math.min(1, MAX_SIDE / Math.max(w,h));
    w = Math.round(w * scale);
    h = Math.round(h * scale);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img,0,0,w,h);
    return canvas.toDataURL('image/jpeg', JPEG_QUALITY);
  }

  function storageCheck(size){
    const check = App.AttachmentMeter?.canAdd?.(size);
    if(!check) return true;
    if(!check.ok){ App.showToast(check.message, 'error'); return false; }
    if(check.warn) App.showToast(check.message, 'success');
    return true;
  }

  function choosePhoto(){
    return new Promise(function(resolve){
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.setAttribute('capture','environment');
      input.style.position = 'fixed';
      input.style.left = '-9999px';
      input.addEventListener('change', function(){ resolve(input.files && input.files[0] ? input.files[0] : null); input.remove(); });
      document.body.appendChild(input);
      input.click();
    });
  }

  function showPhotoReview(opts){
    ensureReviewStyles();
    document.getElementById('photo-review-modal')?.remove();
    const idSuffix = String(Date.now());
    const html = '<div id="photo-review-modal" class="photo-review-backdrop" role="dialog" aria-label="Review photo">'+
      '<div class="photo-review-card">'+
      '<div class="photo-review-head"><b>Review photo</b><button type="button" class="photo-review-close" aria-label="Cancel">×</button></div>'+
      '<img class="photo-review-preview" src="'+opts.dataUrl+'" alt="Photo preview">'+
      '<label class="photo-review-field" for="photo-review-name-'+idSuffix+'">Photo name<input id="photo-review-name-'+idSuffix+'" type="text" value="'+esc(opts.defaultName)+'" autocomplete="off"></label>'+
      '<div class="photo-review-actions"><button type="button" class="btn btn-secondary" data-action="cancel">Cancel</button><button type="button" class="btn btn-primary" data-action="save">Save Photo</button></div>'+
      '</div></div>';
    document.body.insertAdjacentHTML('beforeend', html);
    const modal=document.getElementById('photo-review-modal');
    const input=document.getElementById('photo-review-name-'+idSuffix);
    const close=function(){ modal?.remove(); };
    modal.querySelector('.photo-review-close').addEventListener('click', close);
    modal.querySelector('[data-action="cancel"]').addEventListener('click', close);
    modal.addEventListener('click', function(e){ if(e.target===modal) close(); });
    modal.querySelector('[data-action="save"]').addEventListener('click', function(){
      const name=(input.value||opts.defaultName||'Photo').trim() || 'Photo';
      close();
      opts.onSave(name);
    });
    setTimeout(function(){ input.focus(); input.select(); }, 80);
  }

  async function createPhotoNote(catId){
    const file = await choosePhoto();
    if(!file) return;
    if(!file.type || !file.type.startsWith('image/')){ App.showToast('Please choose an image.', 'error'); return; }
    App.showToast('Preparing photo…', 'success');
    try{
      const dataUrl = await compressImage(file);
      if(!storageCheck(dataUrl.length)) return;
      showPhotoReview({
        dataUrl: dataUrl,
        defaultName: baseName(file.name,'Photo'),
        onSave: function(name){
          const att = { id: uid(), type: 'image', name: name, mime: 'image/jpeg', size: dataUrl.length, dataUrl: dataUrl, createdAt: new Date().toISOString() };
          const note = App.Storage.addNote({ title: name, body: '', categoryId: catId || null, status: 'active', attachments: [att] });
          App.showToast('Photo note saved', 'success');
          App.Notes?.render?.();
          setTimeout(function(){ App.Notes?._editNote?.(note.id); }, 150);
        }
      });
    }catch(e){
      console.error('[PhotoAttachments] create failed', e);
      App.showToast('Photo could not be saved.', 'error');
    }
  }

  async function addPhotoToNote(noteId){
    const file = await choosePhoto();
    if(!file) return;
    if(!file.type || !file.type.startsWith('image/')){ App.showToast('Please choose an image.', 'error'); return; }
    try{
      App.showToast('Preparing photo…', 'success');
      const dataUrl = await compressImage(file);
      if(!storageCheck(dataUrl.length)) return;
      showPhotoReview({
        dataUrl: dataUrl,
        defaultName: baseName(file.name,'Photo'),
        onSave: function(name){
          const state = App.Storage.getState();
          const note = state.notes.find(function(n){ return n.id === noteId; });
          if(!note) return;
          const attachments = Array.isArray(note.attachments) ? note.attachments.slice() : [];
          attachments.push({ id: uid(), type: 'image', name: name, mime: 'image/jpeg', size: dataUrl.length, dataUrl: dataUrl, createdAt: new Date().toISOString() });
          App.Storage.updateNote(noteId,{ attachments: attachments });
          App.showToast('Photo attached', 'success');
          App.Notes?.render?.();
          setTimeout(function(){ App.Notes?._editNote?.(noteId); }, 120);
        }
      });
    }catch(e){
      console.error('[PhotoAttachments] attach failed', e);
      App.showToast('Photo could not be attached.', 'error');
    }
  }

  function openViewer(noteId, attId){
    const state = App.Storage.getState();
    const note = state.notes.find(function(n){ return n.id === noteId; });
    const att = note && (note.attachments||[]).find(function(a){ return a.id === attId; });
    if(!att || !att.dataUrl) return;
    document.getElementById('photo-viewer-modal')?.remove();
    const html = '<div id="photo-viewer-modal" class="photo-viewer-backdrop" onclick="if(event.target===this)this.remove()"><button class="photo-viewer-close" onclick="document.getElementById(\'photo-viewer-modal\').remove()">×</button><img src="'+att.dataUrl+'" alt="'+esc(att.name)+'"></div>';
    document.body.insertAdjacentHTML('beforeend', html);
  }

  function deleteAttachment(noteId, attId){
    if(!confirm('Delete this photo?')) return;
    const state = App.Storage.getState();
    const note = state.notes.find(function(n){ return n.id === noteId; });
    if(!note) return;
    const attachments = (note.attachments || []).filter(function(a){ return a.id !== attId; });
    App.Storage.updateNote(noteId,{ attachments: attachments });
    App.showToast('Photo deleted', 'success');
    document.getElementById('note-modal')?.remove();
    App.Notes?.render?.();
    setTimeout(function(){ App.Notes?._editNote?.(noteId); }, 120);
  }

  function noteIdFromModal(){
    const btn = document.getElementById('note-save-btn');
    const raw = btn ? btn.getAttribute('onclick') || '' : '';
    const m = raw.match(/_saveNote\('([^']*)'\)/);
    return m ? m[1] : '';
  }

  function renderModalAttachments(){
    const modal = document.getElementById('note-modal');
    if(!modal || modal.querySelector('.note-attachments-section')) return;
    const noteId = noteIdFromModal();
    if(!noteId) return;
    const state = App.Storage.getState();
    const note = state.notes.find(function(n){ return n.id === noteId; });
    const attachments = note && Array.isArray(note.attachments) ? note.attachments : [];
    const images = attachments.filter(function(a){ return a.type === 'image'; });
    const actions = modal.querySelector('.modal-actions');
    if(!actions) return;
    const section = document.createElement('div');
    section.className = 'note-attachments-section';
    section.innerHTML = '<div class="note-attachments-title"><span>Photos</span><button type="button" class="btn btn-secondary btn-sm" onclick="App.PhotoAttachments.addPhotoToNote(\''+noteId+'\')">+ Photo</button></div>' +
      (images.length ? '<div class="note-attachment-grid">'+images.map(function(att){ return '<div class="note-attachment-thumb"><button type="button" onclick="App.PhotoAttachments.openViewer(\''+noteId+'\',\''+att.id+'\')"><img src="'+att.dataUrl+'" alt="'+esc(att.name)+'"></button><button class="note-attachment-delete" onclick="App.PhotoAttachments.deleteAttachment(\''+noteId+'\',\''+att.id+'\')">×</button></div>'; }).join('')+'</div>' : '<div class="note-attachments-empty">No photos yet.</div>');
    actions.parentElement.insertBefore(section, actions);
  }

  function renderCardThumbs(){
    const state = App.Storage?.getState?.();
    if(!state) return;
    document.querySelectorAll('.note-card').forEach(function(card){
      if(card.querySelector('.note-card-attachments')) return;
      const raw = card.getAttribute('onclick') || '';
      const m = raw.match(/_editNote\('([^']+)'\)/);
      if(!m) return;
      const note = state.notes.find(function(n){ return n.id === m[1]; });
      const images = note && Array.isArray(note.attachments) ? note.attachments.filter(function(a){ return a.type === 'image' && a.dataUrl; }) : [];
      if(!images.length) return;
      const strip = document.createElement('div');
      strip.className = 'note-card-attachments';
      strip.innerHTML = images.slice(0,3).map(function(att){ return '<img src="'+att.dataUrl+'" alt="">'; }).join('') + (images.length>3 ? '<span>+'+(images.length-3)+'</span>' : '');
      card.appendChild(strip);
    });
  }

  function install(){
    if(window.__noteClipPhotoAttachmentsReady) return;
    window.__noteClipPhotoAttachmentsReady = true;
    renderCardThumbs();
    renderModalAttachments();
    new MutationObserver(function(){ renderCardThumbs(); renderModalAttachments(); }).observe(document.body,{childList:true,subtree:true});
  }

  App.PhotoAttachments = { createPhotoNote, addPhotoToNote, openViewer, deleteAttachment };
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install); else install();
})(window.App = window.App || {});
