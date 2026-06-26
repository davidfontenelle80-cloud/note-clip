/* photo-attachments.js — Stage 13A local photo attachment MVP */
(function(App){
  'use strict';

  const MAX_SIDE = 1400;
  const JPEG_QUALITY = 0.78;

  function uid(){ return 'att_' + Date.now().toString(36) + Math.random().toString(36).slice(2,7); }
  function esc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

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

  async function createPhotoNote(catId){
    const file = await choosePhoto();
    if(!file) return;
    if(!file.type || !file.type.startsWith('image/')){ App.showToast('Please choose an image.', 'error'); return; }
    App.showToast('Preparing photo…', 'success');
    try{
      const dataUrl = await compressImage(file);
      if(!storageCheck(dataUrl.length)) return;
      const att = { id: uid(), type: 'image', name: file.name || 'Photo', mime: 'image/jpeg', size: dataUrl.length, dataUrl: dataUrl, createdAt: new Date().toISOString() };
      const note = App.Storage.addNote({ title: file.name ? file.name.replace(/\.[^.]+$/,'') : 'Photo', body: '', categoryId: catId || null, status: 'active', attachments: [att] });
      App.showToast('Photo note saved', 'success');
      App.Notes?.render?.();
      setTimeout(function(){ App.Notes?._editNote?.(note.id); }, 150);
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
      const dataUrl = await compressImage(file);
      if(!storageCheck(dataUrl.length)) return;
      const state = App.Storage.getState();
      const note = state.notes.find(function(n){ return n.id === noteId; });
      if(!note) return;
      const attachments = Array.isArray(note.attachments) ? note.attachments.slice() : [];
      attachments.push({ id: uid(), type: 'image', name: file.name || 'Photo', mime: 'image/jpeg', size: dataUrl.length, dataUrl: dataUrl, createdAt: new Date().toISOString() });
      App.Storage.updateNote(noteId,{ attachments: attachments });
      App.showToast('Photo attached', 'success');
      App.Notes?.render?.();
      setTimeout(function(){ App.Notes?._editNote?.(noteId); }, 120);
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
    const actions = modal.querySelector('.modal-actions');
    if(!actions) return;
    const section = document.createElement('div');
    section.className = 'note-attachments-section';
    section.innerHTML = '<div class="note-attachments-title"><span>Attachments</span><button type="button" class="btn btn-secondary btn-sm" onclick="App.PhotoAttachments.addPhotoToNote(\''+noteId+'\')">+ Photo</button></div>' +
      (attachments.length ? '<div class="note-attachment-grid">'+attachments.map(function(att){ return '<div class="note-attachment-thumb"><button type="button" onclick="App.PhotoAttachments.openViewer(\''+noteId+'\',\''+att.id+'\')"><img src="'+att.dataUrl+'" alt="'+esc(att.name)+'"></button><button class="note-attachment-delete" onclick="App.PhotoAttachments.deleteAttachment(\''+noteId+'\',\''+att.id+'\')">×</button></div>'; }).join('')+'</div>' : '<div class="note-attachments-empty">No photos yet.</div>');
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
