/* category-color-safe-picker.js — safe one-time category color picker */
(function(App){
  'use strict';

  const COLORS = [
    ['Canary Yellow','#FFF475'],['Soft Cream','#FFF8CC'],['Warm Vanilla','#FFF1B5'],['Light Amber','#FFE7A3'],
    ['Blush Pink','#FFDCE5'],['Rose','#F9D5E5'],['Peach','#FFE2CC'],['Apricot','#FFD9B3'],
    ['Mint','#D8F3DC'],['Sage','#CFE8D6'],['Sky Blue','#DCEEFF'],['Powder Blue','#CFE7FF'],
    ['Lavender','#E8D9FF'],['Lilac','#E2D7F5'],['Aqua','#D7F5F2'],['Soft Gray','#EEF1F4']
  ];

  function esc(s){return String(s||'').replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];});}
  function valid(hex){return /^#[0-9a-f]{6}$/i.test(String(hex||''));}

  function currentId(){
    const btn=[].slice.call(document.querySelectorAll('#cat-modal button')).find(function(b){return (b.getAttribute('onclick')||'').indexOf('_saveCat')>-1;});
    const match=(btn&&btn.getAttribute('onclick')||'').match(/_saveCat\('([^']*)'\)/);
    return match?match[1]:'';
  }

  function currentColor(){
    const id=currentId();
    const cat=id&&App.Storage&&App.Storage.getState().categories.find(function(c){return c.id===id;});
    return valid(cat&&cat.color)?cat.color:'#FFF475';
  }

  function ensureStyle(){
    if(document.getElementById('safe-cat-color-style'))return;
    const style=document.createElement('style');
    style.id='safe-cat-color-style';
    style.textContent='.safe-cat-color-wrap{margin:14px 0}.safe-cat-color-label{font-weight:800;margin-bottom:8px;color:#3b2708}.safe-cat-color-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.safe-cat-color-btn{height:44px;border-radius:14px;border:2px solid rgba(94,68,24,.16);background:var(--swatch);box-shadow:inset 0 1px 0 rgba(255,255,255,.45)}.safe-cat-color-btn.selected{border-color:#2d2110;box-shadow:0 0 0 3px rgba(45,33,16,.16),inset 0 1px 0 rgba(255,255,255,.45)}';
    document.head.appendChild(style);
  }

  function setColor(hex){
    if(!valid(hex))return;
    const input=document.getElementById('cat-color');
    if(input)input.value=hex;
    document.querySelectorAll('.safe-cat-color-btn').forEach(function(btn){
      btn.classList.toggle('selected',String(btn.dataset.color).toLowerCase()===hex.toLowerCase());
    });
  }

  function injectPicker(){
    const modal=document.getElementById('cat-modal');
    if(!modal||modal.querySelector('.safe-cat-color-wrap'))return;
    ensureStyle();
    const color=currentColor();
    const buttons=COLORS.map(function(item){
      const name=item[0],hex=item[1];
      return '<button type="button" class="safe-cat-color-btn '+(hex.toLowerCase()===color.toLowerCase()?'selected':'')+'" data-color="'+hex+'" aria-label="'+esc(name)+'" style="--swatch:'+hex+'"></button>';
    }).join('');
    const html='<div class="form-group safe-cat-color-wrap"><div class="safe-cat-color-label">Card color</div><input id="cat-color" type="hidden" value="'+esc(color)+'"><div class="safe-cat-color-grid">'+buttons+'</div></div>';
    const name=document.getElementById('cat-name');
    const group=name&&name.closest('.form-group');
    if(group)group.insertAdjacentHTML('afterend',html);
    modal.querySelectorAll('.safe-cat-color-btn').forEach(function(btn){btn.onclick=function(){setColor(btn.dataset.color);};});
  }

  function patchSave(){
    if(!App.Notes||App.Notes.__safeColorPickerPatched)return;
    App.Notes.__safeColorPickerPatched=true;
    const originalSave=App.Notes._saveCat;
    App.Notes._saveCat=function(id){
      const color=document.getElementById('cat-color')&&document.getElementById('cat-color').value;
      if(valid(color)){
        const name=(document.getElementById('cat-name')&&document.getElementById('cat-name').value.trim())||'';
        const icon=(document.getElementById('cat-icon')&&document.getElementById('cat-icon').value.trim())||'📝';
        if(!name){App.showToast&&App.showToast(App.I18n&&App.I18n.t?App.I18n.t('toast_cat_name_req'):'Category name required','error');return;}
        if(id)App.Storage.updateCategory(id,{name:name,icon:icon,color:color});
        else App.Storage.addCategory({name:name,icon:icon,color:color});
        App.Notes._closeModal&&App.Notes._closeModal();
        App.Notes.render&&App.Notes.render();
        App.showToast&&App.showToast(id?'Category updated':'Category added','success');
        setTimeout(function(){document.dispatchEvent(new Event('click'));},80);
        return;
      }
      return originalSave.call(App.Notes,id);
    };
    const originalEdit=App.Notes._editCat;
    App.Notes._editCat=function(id){
      const result=originalEdit.call(App.Notes,id);
      setTimeout(injectPicker,0);
      return result;
    };
    const originalFab=App.Notes.onFab;
    App.Notes.onFab=function(){
      const result=originalFab.call(App.Notes);
      setTimeout(injectPicker,0);
      return result;
    };
  }

  function install(){patchSave();setTimeout(injectPicker,0);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);
  else install();
})(window.App=window.App||{});
