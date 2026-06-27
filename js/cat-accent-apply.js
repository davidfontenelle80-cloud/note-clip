(function(){
  var FALLBACKS=['#FFF4B8','#EAF3FF','#EAF8EC','#F2ECFF','#FFEDE3','#FFF1C9','#EAF7F8','#F6F0EA'];
  function hexToRgb(hex){
    hex=String(hex||'').trim();
    if(!/^#?[0-9a-f]{6}$/i.test(hex)) return null;
    hex=hex.replace('#','');
    return {r:parseInt(hex.slice(0,2),16),g:parseInt(hex.slice(2,4),16),b:parseInt(hex.slice(4,6),16)};
  }
  function pastelize(hex,fallback){
    var rgb=hexToRgb(hex)||hexToRgb(fallback)||hexToRgb('#FFF4B8');
    var mix=.72;
    var r=Math.round(rgb.r*(1-mix)+255*mix);
    var g=Math.round(rgb.g*(1-mix)+255*mix);
    var b=Math.round(rgb.b*(1-mix)+255*mix);
    return 'rgb('+r+','+g+','+b+')';
  }
  function run(){
    if(!window.App||!App.Storage)return;
    var data=App.Storage.getState();
    var list=document.querySelectorAll('#pane-notes .category-card');
    for(var i=0;i<list.length;i++){
      var cat=data.categories[i];
      if(!cat)continue;
      var fallback=FALLBACKS[i%FALLBACKS.length];
      var raw=cat.color||fallback;
      var pastel=pastelize(raw,fallback);
      list[i].style.setProperty('--cat-accent',raw==='transparent'?'transparent':raw);
      list[i].style.setProperty('--cat-card-bg',pastel);
      list[i].style.setProperty('--cat-card-bg-soft',pastelize(raw||fallback,'#FFFFFF'));
      list[i].classList.toggle('no-accent',cat.color==='');
    }
  }
  document.addEventListener('DOMContentLoaded',run);
  document.addEventListener('click',function(){setTimeout(run,80);setTimeout(run,250);});
  setTimeout(run,300);
  setTimeout(run,1000);
})();
