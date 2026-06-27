/* category-back-button-polish.js — Stage 16B back button label polish */
(function(){
  'use strict';

  function ensureStyle(){
    if(document.getElementById('noteclip-category-back-polish-style')) return;
    const style=document.createElement('style');
    style.id='noteclip-category-back-polish-style';
    style.textContent='.noteclip-category-back-btn{min-height:48px!important;padding:0 18px!important;border-radius:16px!important;font-weight:850!important;font-size:1.02rem!important;display:inline-flex!important;align-items:center!important;gap:6px!important;box-shadow:0 5px 14px rgba(45,33,16,.08)!important}.noteclip-category-back-btn:active{transform:scale(.97)}';
    document.head.appendChild(style);
  }

  function polishBackButton(){
    ensureStyle();
    document.querySelectorAll('#pane-notes button[onclick*="_setView(\'categories\')"]').forEach(function(btn){
      const text=(btn.textContent||'').trim();
      if(!text.includes('Categories')) return;
      btn.textContent='← Back';
      btn.classList.add('noteclip-category-back-btn');
      btn.setAttribute('aria-label','Back to categories');
    });
  }

  function install(){
    if(window.__noteClipCategoryBackPolishReady) return;
    window.__noteClipCategoryBackPolishReady=true;
    polishBackButton();
    const pane=document.getElementById('pane-notes')||document.body;
    new MutationObserver(polishBackButton).observe(pane,{childList:true,subtree:true});
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',install);
  else install();
})();
