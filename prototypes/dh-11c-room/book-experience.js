(function(root,factory){
 'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.DH11BookExperience=api;
})(typeof window!=='undefined'?window:null,function(){
 'use strict';
 const secureUrl=url=>{
  try{const u=new URL(url);return u.protocol==='https:'?u.href:null;}
  catch{return null;}
 };
 function mount({catalog,document}){
  if(!catalog?.BOOKS||!document?.getElementById)
   throw Error('Published-book UI needs an authenticated title catalogue and document');
  const dialog=document.getElementById('published-book-dialog');
  if(!dialog)throw Error('Missing published-book dialog');
  const get=id=>{
   const node=document.getElementById(id);
   if(!node)throw Error('Missing published-book UI element '+id);
   return node;
  };
  const title=get('published-book-title'),
   subtype=get('published-book-subtitle'),
   summary=get('published-book-description'),
   author=get('published-book-author'),
   publisher=get('published-book-publisher'),
   year=get('published-book-year'),
   isbn=get('published-book-isbn'),
   cover=get('published-book-cover'),
   fallback=get('published-book-cover-fallback'),
   fallbackTitle=get('published-book-cover-fallback-title'),
   links=get('published-book-links'),
   close=get('published-book-close');
  let current=null,invoker=null;
  const showFallback=()=>{
   cover.hidden=true;fallback.hidden=false;
  };
  cover.addEventListener('error',showFallback);
  function show(index){
   const book=catalog.byIndex(index);
   if(!book)return false;
   invoker=document.activeElement;
   current=book.id;
   title.textContent=book.title;
   subtype.textContent=book.genre+' · '+book.format;
   summary.textContent=book.description;
   author.textContent=book.author;
   publisher.textContent=book.publisher;
   year.textContent=String(book.year);
   isbn.textContent=book.isbn;
   fallbackTitle.textContent=book.title;
   cover.alt='Cover of '+book.title;
   cover.hidden=true;fallback.hidden=false;cover.removeAttribute('src');
   if(book.cover&&secureUrl(book.cover)){
    cover.onload=()=>{
     if(current!==book.id)return;
     cover.hidden=false;fallback.hidden=true;
    };
    cover.src=secureUrl(book.cover);
    // On very fast loads the load event may have fired before handler dispatch.
    if(cover.complete&&cover.naturalWidth>0){cover.hidden=false;fallback.hidden=true;}
   }
   links.replaceChildren();
   for(const link of book.links){
    const href=secureUrl(link.url);
    if(!href)continue;
    const a=document.createElement('a');
    a.href=href;a.target='_blank';a.rel='noopener noreferrer';
    a.className=link.type==='buy'?'book-buy-link book-buy-link--primary':'book-buy-link';
    a.textContent=link.label;
    links.append(a);
   }
   if(!dialog.open)dialog.showModal();
   close.focus({preventScroll:true});
   return true;
  }
  function hide(){
   if(dialog.open)dialog.close();
  }
  close.addEventListener('click',hide);
  dialog.addEventListener('click',event=>{
   if(event.target===dialog)hide();
  });
  dialog.addEventListener('close',()=>{
   current=null;
   if(invoker?.isConnected&&typeof invoker.focus==='function')
    invoker.focus({preventScroll:true});
  });
  return Object.freeze({show,hide,get current(){return current;},get opened(){return dialog.open;}});
 }
 return Object.freeze({mount,secureUrl});
});
