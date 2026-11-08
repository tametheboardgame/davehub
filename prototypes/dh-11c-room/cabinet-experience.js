(function(root,factory){
 'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.DH11CabinetExperience=api;
})(typeof window!=='undefined'?window:null,function(){
 'use strict';
 const relatedLabel=entry=>{
  if(entry?.related?.type==='book')return 'Find this book on the shelf';
  if(entry?.related?.type==='manuscript')return 'Read the sample at the desk';
  if(entry?.related?.type==='workshop')return 'Try the typewriter workshop';
  return null;
 };
 function mount({document,catalogue,onRelated=()=>{}}){
  if(!document?.getElementById||!catalogue?.at)throw Error('Archive reader requires approved catalogue');
  const get=id=>{
   const value=document.getElementById(id);
   if(!value)throw Error('Missing archive interface '+id);
   return value;
  };
  const dialog=get('archive-folder-dialog'),close=get('archive-folder-close'),
   category=get('archive-folder-category'),label=get('archive-folder-label'),
   title=get('archive-folder-title'),status=get('archive-folder-status'),
   summary=get('archive-folder-summary'),notice=get('archive-folder-notice'),
   next=get('archive-folder-related'),back=get('archive-folder-back');
  let current=null,invoker=null,navigate=null;
  function show(drawer,index){
   const entry=catalogue.at(drawer,index);
   if(!entry)return false;
   invoker=document.activeElement;
   current=entry;
   const group=catalogue.DRAWERS[entry.drawer];
   dialog.style.setProperty('--archive-folder-colour',group.colour);
   category.textContent=group.label.toUpperCase()+' · '+(entry.slot+1).toString().padStart(2,'0');
   label.textContent=entry.tab;
   title.textContent=entry.title;
   status.textContent=entry.status;
   summary.textContent=entry.description;
   notice.textContent=entry.kind==='Published book'
    ?'This is an existing public edition. Its original bookcase entry contains the publication details.'
    :'Fictional demonstration only. This folder is not a real or unpublished creative project.';
   const action=relatedLabel(entry);
   next.hidden=!action;
   next.textContent=action||'';
   if(!dialog.open)dialog.showModal();
   close.focus({preventScroll:true});
   return true;
  }
  function hide(){if(dialog.open)dialog.close();}
  close.addEventListener('click',hide);
  back.addEventListener('click',hide);
  dialog.addEventListener('click',event=>{if(event.target===dialog)hide();});
  next.addEventListener('click',()=>{
   if(!current?.related)return;
   navigate=current;
   hide();
  });
  dialog.addEventListener('close',()=>{
   current=null;
   const target=navigate;navigate=null;
   if(target)onRelated(target);
   else if(invoker?.isConnected&&typeof invoker.focus==='function')
    invoker.focus({preventScroll:true});
  });
  return Object.freeze({show,hide,relatedLabel,
   get opened(){return dialog.open;},
   get current(){return current;}});
 }
 return Object.freeze({mount,relatedLabel});
});
