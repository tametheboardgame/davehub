/* DH-11B: no dependencies, no network, no data requests.
 * Native dialog manages focus trap and Esc. Works with touch and keyboards.
 */
(() => {
  const stage=document.querySelector('[data-scene="manuscript-hoard"]');
  if(!stage)return;
  const dialog=stage.querySelector('#room-examine');
  const panels=[...stage.querySelectorAll('[data-room-panel]')];
  const close=dialog.querySelector('[data-room-close]');
  let previous=null;
  const open=(id,invoker)=>{
    const target=panels.find(p=>p.dataset.roomPanel===id);
    if(!target)return;
    previous=invoker;
    for(const p of panels)p.hidden=p!==target;
    if(!dialog.open)dialog.showModal();
    close.focus();
  };
  for(const trigger of stage.querySelectorAll('[data-room-target]')){
    trigger.addEventListener('click',()=>open(trigger.dataset.roomTarget,trigger));
  }
  close.addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{
    if(event.target===dialog)dialog.close();
  });
  dialog.addEventListener('close',()=>{
    for(const p of panels)p.hidden=true;
    if(previous?.isConnected)previous.focus();
  });
})();