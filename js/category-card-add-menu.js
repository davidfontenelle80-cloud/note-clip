/* category-card-add-menu.js — category card create menu */
(function(App){
  'use strict';

  function closeMenu(){
    document.querySelector('.category-create-backdrop')?.remove();
    document.querySelector('.category-create-popover')?.remove();
  }

  function esc(s){
    return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function idFromCard(card){
    const btn=card.querySelector('[onclick*="_viewCat"]');
    const raw=(card.getAttribute('onclick')||'')+' '+(btn?.getAttribute('onclick')||'');
    const m=raw.match(/_viewCat\('([^']+)'\)/)||raw.match(/_editCat\('([^']+)'\)/);
    return m?m[1]:'';
  }

  function createNoteInCategory(catId){
    closeMenu();
    App.Notes?._openNoteModal?.(null);
    setTimeout(function(){
      const select=document.getElementById('note-cat');
      if(select) select.value=catId;
      const title=document.getElementById('note-title');
      if(title) title.focus();
    },80);
  }

  function showUnavailable(label){
    closeMenu();
    App.showToast?.(label+' is not ready yet.', 'error');
  }

  function showMenu(anchor,cat){
    closeMenu();
    const back=document.createElement('div');
    back.className='category-create-backdrop';
    back.addEventListener('click',closeMenu);

    const pop=document.createElement('div');
    pop.className='category-create-popover';
    pop.innerHTML='<div class="category-create-title">Create in '+esc(cat.name)+'</div>'+
      '<button type="button" data-action="scan"><span>📑</span><span>Scan PDF</span></button>'+
      '<button type="button" data-action="photo"><span>📷</span><span>Add Photo</span></button>'+
      '<button type="button" data-action="image"><span>🖼️</span><span>Add Image</span></button>'+
      '<button type="button" data-action="note"><span>📝</span><span>New Note</span></button>'+
      '<button type="button" data-action="voice"><span>🎙️</span><span>Voice Note</span><em>Later</em></button>';
    pop.addEventListener('click',function(e){
      const action=e.target.closest('button')?.dataset.action;
      if(!action)return;
      if(action==='scan') { closeMenu(); App.DocumentScanner?.createScanNote?.(cat.id); }
      if(action==='photo') { closeMenu(); App.PhotoAttachments?.createPhotoNote?.(cat.id); }
      if(action==='image') { closeMenu(); App.PhotoAttachments?.createPhotoNote?.(cat.id); }
      if(action==='note') createNoteInCategory(cat.id);
      if(action==='voice') showUnavailable('Voice Note');
    });

    document.body.appendChild(back);
    document.body.appendChild(pop);
    const r=anchor.getBoundingClientRect();
    const w=250;
    pop.style.left=Math.max(12,Math.min(window.innerWidth-w-12,r.right-w))+'px';
    pop.style.top=Math.max(12,Math.min(window.innerHeight-330,r.bottom+8))+'px';
  }

  function installButtons(){
    const state=App.Storage?.getState?.();
    if(!state?.categories)return;
    document.querySelectorAll('#pane-notes .category-card').forEach(function(card,index){
      if(card.querySelector('.cat-create-btn'))return;
      const id=idFromCard(card)||state.categories[index]?.id;
      const cat=state.categories.find(function(c){return c.id===id;})||state.categories[index];
      if(!cat)return;
      const btn=document.createElement('button');
      btn.type='button';
      btn.className='cat-create-btn';
      btn.setAttribute('aria-label','Create in '+cat.name);
      btn.textContent='+';
      btn.addEventListener('click',function(e){
        e.preventDefault();
        e.stopPropagation();
        card.classList.add('category-card-pressed');
        setTimeout(function(){ card.classList.remove('category-card-pressed'); },140);
        showMenu(btn,cat);
      });
      card.appendChild(btn);
    });
  }

  function install(){
    if(window.__noteClipCategoryCreateReady)return;
    window.__noteClipCategoryCreateReady=true;
    installButtons();
    const pane=document.getElementById('pane-notes')||document.body;
    new MutationObserver(installButtons).observe(pane,{childList:true,subtree:true});
    document.addEventListener('keydown',function(e){if(e.key==='Escape')closeMenu();});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);
  else install();
})(window.App=window.App||{});
