(function(){
  function run(){
    if(!window.App||!App.Storage)return;
    var data=App.Storage.getState();
    var list=document.querySelectorAll('#pane-notes .category-card');
    for(var i=0;i<list.length;i++){
      var cat=data.categories[i];
      if(!cat)continue;
      if(cat.color===''){
        list[i].style.setProperty('--cat-accent','transparent');
        list[i].classList.add('no-accent');
      }else if(cat.color){
        list[i].style.setProperty('--cat-accent',cat.color);
        list[i].classList.remove('no-accent');
      }
    }
  }
  document.addEventListener('DOMContentLoaded',run);
  document.addEventListener('click',function(){setTimeout(run,80);});
  setTimeout(run,300);
  setTimeout(run,1000);
})();
