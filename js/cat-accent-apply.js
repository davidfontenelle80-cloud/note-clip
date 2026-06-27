(function(){
  var FALLBACKS=['#FFF4B8','#FFD6DE','#DDEEFF','#DDF5E4','#E9DFFF','#FFE1CC','#D9F7F3','#F2F3F5'];
  function ok(x){return /^#[0-9a-f]{6}$/i.test(String(x||''));}
  function textFor(hex){
    if(!ok(hex))return '#24180a';
    var n=hex.replace('#','');
    var r=parseInt(n.slice(0,2),16),g=parseInt(n.slice(2,4),16),b=parseInt(n.slice(4,6),16);
    return (r*299+g*587+b*114)/1000 < 150 ? '#fffaf0' : '#24180a';
  }
  function run(){
    if(!window.App||!App.Storage)return;
    var data=App.Storage.getState();
    var cards=document.querySelectorAll('#pane-notes .category-card');
    for(var i=0;i<cards.length;i++){
      var cat=data.categories[i];
      if(!cat)continue;
      var color=ok(cat.color)?cat.color:FALLBACKS[i%FALLBACKS.length];
      cards[i].style.setProperty('--cat-accent',color);
      cards[i].style.setProperty('--cat-card-bg',color);
      cards[i].style.setProperty('--cat-card-bg-soft',color);
      cards[i].style.setProperty('--cat-card-text',textFor(color));
      cards[i].style.background=color;
      cards[i].classList.remove('no-accent');
    }
  }
  document.addEventListener('DOMContentLoaded',run);
  document.addEventListener('click',function(){setTimeout(run,80);setTimeout(run,250);});
  setTimeout(run,300);
  setTimeout(run,1000);
})();
