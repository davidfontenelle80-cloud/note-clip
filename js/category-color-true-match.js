/* category-color-true-match.js — Stage 16F color apply repair */
(function(App){
  'use strict';

  const COLORS = [
    {title:'Pastel', items:[['Soft Yellow','#FFF4B8'],['Soft Pink','#FFD6DE'],['Soft Blue','#DDEEFF'],['Soft Green','#DDF5E4'],['Soft Lavender','#E9DFFF'],['Soft Peach','#FFE1CC'],['Soft Mint','#D9F7F3'],['Soft Gray','#F2F3F5']]},
    {title:'Bold', items:[['Gold','#D0A64B'],['Blue','#2F80ED'],['Green','#219653'],['Orange','#F2994A'],['Purple','#7B61FF'],['Red','#EB5757'],['Teal','#00A6A6'],['Slate','#4F5D75']]}
  ];

  function valid(v){return /^#[0-9a-f]{6}$/i.test(String(v||''));}
  function safe(v){return String(v||'').replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];});}
  function text(hex){
    if(!valid(hex))return '#24180a';
    var n=String(hex).replace('#','');
    var r=parseInt(n.slice(0,2),16),g=parseInt(n.slice(2,4),16),b=parseInt(n.slice(4,6),16);
    return (r*299+g*587+b*114)/1000 < 150 ? '#fffaf0' : '#24180a';
  }
  function saveId(){
    var btn=[].slice.call(document.querySelectorAll('#cat-modal button')).find(function(b){return (b.getAttribute('onclick')||'').indexOf('_saveCat')>-1;});
    var m=(btn&&btn.getAttribute('onclick')||'').match(/_saveCat\('([^']*)'\)/);
    return m?m[1]:'';
  }
  function currentColor(){
    var id=saveId();
    var cat=id && App.Storage.getState().categories.find(function(c){return c.id===id;});
    return valid(cat&&cat.color)?cat.color:'#FFF4B8';
  }
  function style(){
    if(document.getElementById('cat-color-clean-style'))return;
    var s=document.createElement('style');
    s.id='cat-color-clean-style';
    s.textContent='.cat-color-section{margin:14px 0}.cat-color-preview-card{min-height:62px;border-radius:18px;margin:10px 0 12px;padding:12px;display:flex;align-items:end;font-weight:900;background:var(--preview);color:var(--preview-text);border:1px solid rgba(94,68,24,.12)}.cat-color-group-title{font-weight:900;color:#3b2708;margin:12px 0 8px}.cat-color-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.cat-color-choice{min-height:44px;border-radius:14px;border:2px solid rgba(94,68,24,.14);background:var(--choice);font-size:0;position:relative}.cat-color-choice.selected{border-color:#2d2110;box-shadow:0 0 0 3px rgba(45,33,16,.16)}.cat-color-choice.selected:after{content:"✓";position:absolute;inset:0;display:grid;place-items:center;color:var(--check);font-size:1.15rem;font-weight:1000}.cat-accent-preview,.cat-accent-grid,.cat-accent-option{display:none!important}';
    document.head.appendChild(s);
  }
  function picker(color){
    var out='<div class="form-group cat-color-section" data-cat-color-section><label class="form-label">Card color</label><input id="cat-color" type="hidden" value="'+safe(color)+'"><div id="cat-color-preview" class="cat-color-preview-card" style="--preview:'+safe(color)+';--preview-text:'+text(color)+'">Card preview</div>';
    COLORS.forEach(function(group){
      out+='<div class="cat-color-group-title">'+group.title+'</div><div class="cat-color-grid">';
      group.items.forEach(function(item){
        var name=item[0],hex=item[1],sel=hex.toLowerCase()===color.toLowerCase();
        out+='<button type="button" class="cat-color-choice '+(sel?'selected':'')+'" data-color="'+hex+'" aria-label="'+safe(name)+'" style="--choice:'+hex+';--check:'+text(hex)+'">'+safe(name)+'</button>';
      });
      out+='</div>';
    });
    return out+'</div>';
  }
  function setColor(hex){
    if(!valid(hex))return;
    var input=document.getElementById('cat-color'),preview=document.getElementById('cat-color-preview');
    if(input)input.value=hex;
    if(preview){preview.style.setProperty('--preview',hex);preview.style.setProperty('--preview-text',text(hex));}
    document.querySelectorAll('.cat-color-choice').forEach(function(b){b.classList.toggle('selected',String(b.dataset.color).toLowerCase()===hex.toLowerCase());});
  }
  function hideOld(){
    document.querySelectorAll('#cat-modal .cat-accent-preview,#cat-modal .cat-accent-grid').forEach(function(el){(el.closest('.form-group')||el).style.display='none';});
    document.querySelectorAll('#cat-modal label').forEach(function(el){if(/accent/i.test(el.textContent||''))(el.closest('.form-group')||el).style.display='none';});
  }
  function emojiPencil(){
    document.querySelectorAll('.cat-more-btn,.cat-edit-btn').forEach(function(b){b.textContent='✏️';b.setAttribute('aria-label','Edit category');b.style.fontSize='20px';});
  }
  function patchSave(){
    if(!App.Notes || App.Notes.__colorSaveFixed)return;
    var original=App.Notes._saveCat;
    App.Notes.__colorSaveFixed=true;
    App.Notes._saveCat=function(id){
      var name=(document.getElementById('cat-name')&&document.getElementById('cat-name').value.trim())||'';
      var icon=(document.getElementById('cat-icon')&&document.getElementById('cat-icon').value.trim())||'📝';
      var color=(document.getElementById('cat-color')&&document.getElementById('cat-color').value)||currentColor();
      if(name && valid(color)){
        if(id)App.Storage.updateCategory(id,{name:name,icon:icon,color:color});
        else App.Storage.addCategory({name:name,icon:icon,color:color});
        App.Notes._closeModal&&App.Notes._closeModal();
        App.Notes.render&&App.Notes.render();
        setTimeout(function(){document.dispatchEvent(new Event('click'));emojiPencil();},100);
        App.showToast&&App.showToast(id?'Category updated':'Category added','success');
        return;
      }
      return original.call(App.Notes,id);
    };
  }
  function inject(){
    var modal=document.getElementById('cat-modal');
    style();
    patchSave();
    emojiPencil();
    if(!modal)return;
    hideOld();
    if(!modal.querySelector('[data-cat-color-section]')){
      var name=document.getElementById('cat-name');
      var group=name&&name.closest('.form-group');
      if(group)group.insertAdjacentHTML('afterend',picker(currentColor()));
    }
    modal.querySelectorAll('.cat-color-choice').forEach(function(btn){if(!btn.dataset.ready){btn.dataset.ready='1';btn.onclick=function(){setColor(btn.dataset.color);};}});
  }
  document.addEventListener('DOMContentLoaded',inject);
  document.addEventListener('click',function(){setTimeout(inject,30);});
  new MutationObserver(inject).observe(document.documentElement,{childList:true,subtree:true});
  setTimeout(inject,300);
})(window.App=window.App||{});
