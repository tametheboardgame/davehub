(function(root,factory){
 'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.DH11CabinetTray=api;
})(typeof window!=='undefined'?window:null,function(){
 'use strict';
 const COUNT=4;
 // This is a readable *inspection view*, not replacement cabinet geometry.
 // Its four fixed slots mirror the 3D folders in the actual drawer pivot.
 function mount({document,catalogue,onSelect,onCloseDrawer}){
  if(!document?.getElementById||!catalogue?.at||
   typeof onSelect!=='function'||typeof onCloseDrawer!=='function')
   throw Error('Cabinet tray needs its existing drawer catalogue and actions');
  const element=id=>{
   const node=document.getElementById(id);
   if(!node)throw Error('Missing top-down cabinet tray element: '+id);
   return node;
  };
  const dialog=element('archive-tray-dialog');
  const closeButton=element('archive-tray-close');
  const shutButton=element('archive-tray-shut');
  const heading=element('archive-tray-heading');
  const count=element('archive-tray-count');
  const well=element('archive-tray-well');
  const label=element('archive-tray-lip-label');
  const slots=element('archive-tray-slots');
  let active=null,returnFocus=null;
  const node=(tag,className,text)=>{
   const el=document.createElement(tag);
   if(className)el.className=className;
   if(text!==undefined)el.textContent=text;
   return el;
  };
  function draw(drawer){
   const info=catalogue.DRAWERS[drawer];
   if(!info)throw Error('Unknown archive drawer '+drawer);
   heading.textContent=info.label;
   label.textContent=info.label.toUpperCase()+' / '+String(drawer+1).padStart(2,'0');
   const known=catalogue.inDrawer(drawer);
   count.textContent=known.length+' filed '+(known.length===1?'item':'items')+
    ' · '+(COUNT-known.length)+' unlabelled '+(COUNT-known.length===1?'folder':'folders');
   well.style.setProperty('--drawer-file-colour',info.colour);
   const items=[];
   for(let slot=0;slot<COUNT;slot++){
    const record=catalogue.at(drawer,slot);
    const place=node('div','archive-tray-slot');
    place.setAttribute('role','listitem');
    place.dataset.drawerSlot=String(slot);
    if(record){
     const button=node('button','archive-tray-file');
     button.type='button';
     button.dataset.folderSlot=String(slot);
     button.setAttribute('aria-label','Open '+record.title+
      (record.kind==='Published book'?', published book':', fictional demonstration'));
     button.style.setProperty('--file-colour',info.colour);
     const tab=node('span','archive-tray-file__tab',record.tab);
     tab.setAttribute('aria-hidden','true');
     const stamped=node('span','archive-tray-file__stamp',
      record.kind==='Published book'?'PUBLISHED':'FICTIONAL SAMPLE');
     const title=node('span','archive-tray-file__title',record.title);
     const instruction=node('span','archive-tray-file__action','Lift this file');
     button.append(tab,stamped,title,instruction);
     button.addEventListener('click',()=>{
      if(active!==drawer||!dialog.open)return;
      hide();
      onSelect(drawer,slot);
     });
     place.append(button);
    }else{
     const empty=node('div','archive-tray-file archive-tray-file--empty');
     empty.setAttribute('aria-label','Unlabelled spare folder, no public content');
     const tab=node('span','archive-tray-file__tab','UNFILED');
     tab.setAttribute('aria-hidden','true');
     empty.append(tab,node('span','archive-tray-file__empty-mark','Nothing approved for this slot'));
     place.append(empty);
    }
    items.push(place);
   }
   slots.replaceChildren(...items);
  }
  function show(drawer){
   if(!catalogue.DRAWERS[drawer])return false;
   if(dialog.open){
    if(active===drawer)return true;
    hide();
   }
   returnFocus=document.activeElement;
   draw(drawer);
   active=drawer;
   dialog.showModal();
   const first=slots.querySelector('button[data-folder-slot]');
   (first||closeButton).focus({preventScroll:true});
   return true;
  }
  function hide(){
   if(dialog.open)dialog.close();
   active=null;
  }
  closeButton.addEventListener('click',hide);
  shutButton.addEventListener('click',()=>{
   const drawer=active;
   hide();
   if(drawer!==null)onCloseDrawer(drawer);
  });
  dialog.addEventListener('click',event=>{
   if(event.target===dialog)hide();
  });
  dialog.addEventListener('close',()=>{
   active=null;
   if(returnFocus?.isConnected&&typeof returnFocus.focus==='function')
    returnFocus.focus({preventScroll:true});
  });
  return Object.freeze({
   show,hide,
   get opened(){return dialog.open;},
   get drawer(){return active;}
  });
 }
 return Object.freeze({mount,COUNT});
});
