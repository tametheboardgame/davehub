(function(){
 'use strict';
 // Only for the full-viewport architectural preview. All original scene
 // movement and raycast interactions still run through room.js.
 if(document.body.dataset.immersiveRoom!=='true')return;
 const objects=document.getElementById('scene-nav');
 const tools=document.getElementById('prototype-tools');
 const skip=document.querySelector('.skip');
 const home=document.getElementById('home-button');
 const scene=document.getElementById('room-canvas');
 if(!objects||!tools||!home||!scene)return;
 skip?.addEventListener('click',()=>{
  objects.open=true;
  requestAnimationFrame(()=>objects.querySelector('[data-focus]')?.focus({preventScroll:true}));
 });
 objects.querySelectorAll('[data-focus]').forEach(button=>{
  button.addEventListener('click',()=>{
   objects.open=false;
   tools.open=false;
   requestAnimationFrame(()=>{
    const first=document.querySelector('#interaction-actions button, #interaction-actions a');
    (first||home).focus({preventScroll:true});
   });
  });
 });
 scene.addEventListener('pointerup',()=>{objects.open=false;tools.open=false;});
 document.addEventListener('keydown',event=>{
  if(event.key!=='Escape')return;
  // Let Escape close a floating panel before room.js returns the camera home.
  if(tools.open||objects.open){
   event.preventDefault();event.stopImmediatePropagation();
   const closing=tools.open?tools:objects;
   closing.open=false;
   closing.querySelector('summary')?.focus({preventScroll:true});
  }
 },true);
})();