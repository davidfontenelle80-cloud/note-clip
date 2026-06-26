/* category-card-polish.js — category card refresh and more menu */
(function(App){
  'use strict';

  function closeMenu(){
    document.querySelector('.category-action-backdrop')?.remove();
    document.querySelector('.category-action-popover')?.remove();
  }

  function showMenu(anchor, editBtn, deleteBtn){
    closeMenu();
    const backdrop=document.createElement('div');
    backdrop.className='category-action-backdrop';
    backdrop.addEventListener('click', closeMenu);

    const pop=document.createElement('div');
    pop.className='category-action-popover';
    pop.innerHTML=`
      <button type="button" data-action="edit"><span>✎</span><span>Edit</span></button>
      <button type="button" class="danger" data-action="delete"><span>⌫</span><span>Delete</span></button>`;

    pop.addEventListener('click', e=>{
      const action=e.target.closest('button')?.dataset.action;
      if(!action)return;
      closeMenu();
      if(action==='delete') deleteBtn?.click();
      else editBtn?.click();
    });

    document.body.appendChild(backdrop);
    document.body.appendChild(pop);
    const r=anchor.getBoundingClientRect();
    const w=220;
    const left=Math.max(12,Math.min(window.innerWidth-w-12,r.right-w));
    const top=Math.max(12,Math.min(window.innerHeight-130,r.bottom+8));
    pop.style.left=left+'px';
    pop.style.top=top+'px';
  }

  function polishCards(){
    const cards=[...document.querySelectorAll('#pane-notes .category-card')];
    cards.forEach((card,i)=>{
      if(card.classList.contains('category-polished'))return;
      const buttons=[...card.querySelectorAll('.card-delete-btn')];
      const editBtn=buttons.find(b=>(b.getAttribute('title')||'').toLowerCase().includes('edit'))||buttons[0];
      const deleteBtn=buttons.find(b=>(b.getAttribute('title')||'').toLowerCase().includes('delete'))||buttons[1];
      const actionWrap=buttons[0]?.parentElement;
      if(!actionWrap)return;
      card.classList.add('category-polished','category-accent-'+(i%8));
      const more=document.createElement('button');
      more.type='button';
      more.className='cat-more-btn';
      more.setAttribute('aria-label','Category actions');
      more.textContent='•••';
      more.addEventListener('click',e=>{
        e.preventDefault();
        e.stopPropagation();
        showMenu(more,editBtn,deleteBtn);
      });
      actionWrap.appendChild(more);
    });
  }

  function install(){
    if(window.__noteClipCategoryPolishReady)return;
    window.__noteClipCategoryPolishReady=true;
    polishCards();
    const pane=document.getElementById('pane-notes')||document.body;
    const mo=new MutationObserver(()=>polishCards());
    mo.observe(pane,{childList:true,subtree:true});
    document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);
  else install();
})(window.App=window.App||{});
