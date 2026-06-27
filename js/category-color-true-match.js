/* category-color-true-match.js — Stage 16D true color picker/save */
(function(App){
  'use strict';

  const PALETTE = [
    { group:'Pastel', colors:[
      ['Soft Yellow','#FFF4B8'],['Soft Pink','#FFD6DE'],['Soft Blue','#DDEEFF'],['Soft Green','#DDF5E4'],
      ['Soft Lavender','#E9DFFF'],['Soft Peach','#FFE1CC'],['Soft Mint','#D9F7F3'],['Soft Gray','#F2F3F5']
    ]},
    { group:'Bold', colors:[
      ['Gold','#D0A64B'],['Blue','#2F80ED'],['Green','#219653'],['Orange','#F2994A'],
      ['Purple','#7B61FF'],['Red','#EB5757'],['Teal','#00A6A6'],['Slate','#4F5D75']
    ]}
  ];

  function esc(s){ return String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
  function valid(hex){ return /^#[0-9a-f]{6}$/i.test(String(hex||'')); }
  function luminance(hex){
    if(!valid(hex)) return 1;
    const n=hex.replace('#','');
    const rgb=[0,2,4].map(i=>parseInt(n.slice(i,i+2),16)/255).map(v=>v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4));
    return .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2];
  }
  function textFor(hex){ return luminance(hex)<.42?'#fffaf0':'#24180a'; }

  function ensureStyle(){
    if(document.getElementById('noteclip-true-color-picker-style')) return;
    const style=document.createElement('style');
    style.id='noteclip-true-color-picker-style';
    style.textContent=`
      .cat-color-section{margin-top:14px}.cat-color-group-title{font-weight:900;color:#3b2708;margin:12px 0 8px}.cat-color-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.cat-color-choice{min-height:44px;border-radius:14px;border:2px solid rgba(94,68,24,.14);background:var(--choice);box-shadow:inset 0 1px 0 rgba(255,255,255,.35),0 4px 10px rgba(45,33,16,.08);font-size:0;position:relative}.cat-color-choice.selected{border-color:#2d2110;box-shadow:0 0 0 3px rgba(45,33,16,.16),inset 0 1px 0 rgba(255,255,255,.35)}.cat-color-choice.selected:after{content:'✓';position:absolute;inset:0;display:grid;place-items:center;color:var(--check,#24180a);font-size:1.15rem;font-weight:1000}.cat-color-preview-card{min-height:62px;border-radius:18px;margin:10px 0 2px;padding:12px;display:flex;align-items:end;font-weight:900;background:var(--preview);color:var(--preview-text);border:1px solid rgba(94,68,24,.12)}
    `;
    document.head.appendChild(style);
  }

  function getSaveCategoryId(){
    const save=[...document.querySelectorAll('#cat-modal button')].find(b=>(b.getAttribute('onclick')||'').includes('_saveCat'));
    const raw=save?.getAttribute('onclick')||'';
    const m=raw.match(/_saveCat\('([^']*)'\)/);
    return m?m[1]:'';
  }

  function getCurrentColor(){
    const id=getSaveCategoryId();
    const cat=id && App.Storage?.getState?.().categories.find(c=>c.id===id);
    return valid(cat?.color)?cat.color:'#FFF4B8';
  }

  function pickerHtml(color){
    let html='<div class="form-group cat-color-section" data-cat-color-section><label class="form-label">Card color</label>';
    html+='<input id="cat-color" type="hidden" value="'+esc(color)+'">';
    html+='<div id="cat-color-preview" class="cat-color-preview-card" style="--preview:'+esc(color)+';--preview-text:'+textFor(color)+'">Card preview</div>';
    PALETTE.forEach(g=>{
      html+='<div class="cat-color-group-title">'+g.group+'</div><div class="cat-color-grid">';
      g.colors.forEach(([name,hex])=>{
        html+='<button type="button" class="cat-color-choice '+(hex.toLowerCase()===color.toLowerCase()?'selected':'')+'" data-color="'+hex+'" aria-label="'+esc(name)+'" style="--choice:'+hex+';--check:'+textFor(hex)+'">'+esc(name)+'</button>';
      });
      html+='</div>';
    });
    html+='</div>';
    return html;
  }

  function setColor(hex){
    if(!valid(hex)) return;
    const input=document.getElementById('cat-color');
    const preview=document.getElementById('cat-color-preview');
    if(input) input.value=hex;
    if(preview){
      preview.style.setProperty('--preview',hex);
      preview.style.setProperty('--preview-text',textFor(hex));
    }
    document.querySelectorAll('.cat-color-choice').forEach(b=>b.classList.toggle('selected',String(b.dataset.color).toLowerCase()===hex.toLowerCase()));
  }

  function injectPicker(){
    const modal=document.getElementById('cat-modal');
    if(!modal || modal.querySelector('[data-cat-color-section]')) return;
    ensureStyle();
    const nameInput=modal.querySelector('#cat-name');
    const nameGroup=nameInput?.closest('.form-group');
    if(!nameGroup) return;
    nameGroup.insertAdjacentHTML('afterend',pickerHtml(getCurrentColor()));
    modal.querySelectorAll('.cat-color-choice').forEach(btn=>btn.addEventListener('click',()=>setColor(btn.dataset.color)));
  }

  function patchSave(){
    if(!App.Notes || App.Notes.__trueColorSavePatched) return;
    App.Notes.__trueColorSavePatched=true;
    const originalSave=App.Notes._saveCat;
    App.Notes._saveCat=function(id){
      const name=document.getElementById('cat-name')?.value.trim()||'';
      const icon=document.getElementById('cat-icon')?.value.trim()||'📝';
      const color=document.getElementById('cat-color')?.value||'#FFF4B8';
      if(valid(color) && name){
        if(id){
          App.Storage.updateCategory(id,{name,icon,color});
          App.showToast(App.I18n?.t?.('toast_cat_updated')||'Category updated','success');
        }else{
          App.Storage.addCategory({name,icon,color});
          App.showToast(App.I18n?.t?.('toast_cat_added')||'Category added','success');
        }
        App.Notes._closeModal?.();
        App.Notes.render?.();
        setTimeout(()=>window.dispatchEvent(new Event('noteclip:category-color-updated')),80);
        return;
      }
      return originalSave.call(App.Notes,id);
    };
  }

  function run(){ patchSave(); injectPicker(); }
  document.addEventListener('DOMContentLoaded',run);
  document.addEventListener('click',()=>setTimeout(run,40));
  window.addEventListener('noteclip:category-color-updated',()=>setTimeout(run,80));
  new MutationObserver(run).observe(document.documentElement,{childList:true,subtree:true});
  setTimeout(run,300);
})(window.App=window.App||{});
