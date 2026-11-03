(function(){
 'use strict';
 const plan=window.DH11RoomPlan,projection=window.DH11IllustratedViews;
 if(!plan||!projection)throw Error('DH-11C.5D.3A requires the geometry-locked camera pipeline');
 const contract=projection.contract(plan);
 const home=contract.views.find(v=>v.id==='home');
 if(!home||home.targets.desktop.anchors.length!==7)throw Error('Missing canonical HOME anchors');
 const map=document.getElementById('projection-map');
 const status=document.getElementById('art-status');
 const file=document.getElementById('new-art-file');
 const image=document.getElementById('illustration-image');
 const reset=document.getElementById('restore-art');
 const toggle=document.getElementById('toggle-projection');
 const stamp=document.getElementById('reference-stamp');
 const original='/assets/worlds/writing/manuscript-room-v1.avif';
 let objectUrl=null;
 for(const anchor of home.targets.desktop.anchors){
  if(!anchor.visible||anchor.x===null||anchor.y===null)continue;
  const object=plan.find(anchor.id);
  const marker=document.createElement('div');
  marker.className='projection-marker';
  marker.dataset.anchor=anchor.id;
  marker.style.left=anchor.x+'%';
  marker.style.top=anchor.y+'%';
  marker.setAttribute('aria-hidden','true');
  const dot=document.createElement('span');dot.className='projection-dot';
  const label=document.createElement('span');label.className='projection-name';
  label.textContent=object.label;
  marker.append(dot,label);map.appendChild(marker);
 }
 map.dataset.guides='true';
 toggle.addEventListener('click',()=>{
  const show=toggle.getAttribute('aria-pressed')!=='true';
  toggle.setAttribute('aria-pressed',String(show));
  map.dataset.guides=String(show);
  toggle.textContent=show?'Show anchor guides':'Hide anchor guides';
 });
 function revoke(){
  if(objectUrl){URL.revokeObjectURL(objectUrl);objectUrl=null;}
 }
 function restore(){
  revoke();file.value='';image.src=original;
  stamp.textContent='STYLE REFERENCE ONLY';
  image.alt='Existing illustrated Writing-room concept art; it is not geometry-registered';
  status.textContent='Reference restored. No artwork was uploaded or saved.';
 }
 reset.addEventListener('click',restore);
 file.addEventListener('change',()=>{
  const candidate=file.files&&file.files[0];
  if(!candidate)return;
  if(!['image/png','image/jpeg','image/webp','image/avif'].includes(candidate.type)||
      candidate.size>20*1024*1024){
   status.textContent='Choose a PNG, JPEG, WebP or AVIF image up to 20 MB.';
   file.value='';return;
  }
  revoke();objectUrl=URL.createObjectURL(candidate);
  image.src=objectUrl;image.alt='Local illustration candidate under visual review, not geometry-aligned or saved';
  stamp.textContent='UNALIGNED ART CANDIDATE';
  status.textContent='Showing '+candidate.name+'. Local only; no upload, no 3D interaction changes.';
 });
 window.addEventListener('pagehide',revoke,{once:true});
})();
