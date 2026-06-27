/* category-note-context.js — default new notes to current category */
(function(App){
  'use strict';

  let currentCategoryId='';

  function applyCategory(catId,force){
    if(!catId)return;
    const select=document.getElementById('note-cat');
    if(select && (force || !select.value)){
      select.value=catId;
      select.dispatchEvent(new Event('change',{bubbles:true}));
    }
  }

  function patchNotes(){
    if(!App.Notes || App.Notes.__categoryNoteContextReady)return false;
    App.Notes.__categoryNoteContextReady=true;

    const originalViewCat=App.Notes._viewCat;
    App.Notes._viewCat=function(catId){
      currentCategoryId=catId||'';
      return originalViewCat.call(App.Notes,catId);
    };

    const originalSetView=App.Notes._setView;
    App.Notes._setView=function(view){
      if(view!=='note-list') currentCategoryId='';
      return originalSetView.call(App.Notes,view);
    };

    const originalOpenNoteModal=App.Notes._openNoteModal;
    App.Notes._openNoteModal=function(note){
      const result=originalOpenNoteModal.call(App.Notes,note);
      if(!note && currentCategoryId){
        setTimeout(function(){applyCategory(currentCategoryId,true);},30);
        setTimeout(function(){applyCategory(currentCategoryId,true);},120);
      }
      return result;
    };

    const originalOnFab=App.Notes.onFab;
    App.Notes.onFab=function(){
      const result=originalOnFab.call(App.Notes);
      if(currentCategoryId){
        setTimeout(function(){applyCategory(currentCategoryId,true);},30);
        setTimeout(function(){applyCategory(currentCategoryId,true);},120);
      }
      return result;
    };

    return true;
  }

  function install(){
    let tries=0;
    const tick=function(){
      tries++;
      if(!patchNotes() && tries<30)setTimeout(tick,100);
    };
    tick();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);
  else install();
})(window.App=window.App||{});
