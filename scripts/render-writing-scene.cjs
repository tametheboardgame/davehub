'use strict';
/* DH-11B: scene-first Writing island. Pure static markup from the existing
 * validated public catalogue. No hidden or independent repository feeds.
 */
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const AREAS=[
 {id:'desk',label:'Main desk',title:'The writing desk',hint:'Pull a manuscript from the enormous central pile.',empty:'The desk is buried beneath paper, but no approved manuscript is here yet.'},
 {id:'cabinet',label:'Filing cabinet',title:'Cabinet of manuscripts',hint:'Open the creaking drawers marked Finished, Drafts and Oddities.',empty:'The drawers are locked to visitors until their manuscripts are approved.'},
 {id:'bin',label:'Overflowing bin',title:'The rejected-but-useful bin',hint:'Discover abandoned fragments and ideas that refused to go away.',empty:'Plenty of crumpled paper, but no archived fragments are cleared for display.'},
 {id:'bookcase',label:'Bookcase',title:'Notes from stranger worlds',hint:'Pull out world notes, concepts, lore and other improbable research.',empty:'The shelves are full of secrets; none has been approved for reading yet.'},
 {id:'typewriter',label:'Typewriter',title:'The argumentative typewriter',hint:'Find scenes, dialogue and the words that have escaped their authors.',empty:'The keys are quiet. No approved scenes or scripts have been placed here.'}
];
function groupWorks(works){
 const buckets=Object.fromEntries(AREAS.map(a=>[a.id,[]]));
 const selected=works.find(w=>!['abandoned','permanently_shelved'].includes(w.lifecycle)&&
  ['musical','book','script'].includes(w.workType))||
  works.find(w=>!['abandoned','permanently_shelved'].includes(w.lifecycle)&&w.recordType==='work')||works[0];
 if(selected)buckets.desk.push(selected);
 for(const w of works){
  if(w===selected)continue;
  if(['abandoned','permanently_shelved'].includes(w.lifecycle)||w.workType==='song'||['excerpt','demo'].includes(w.artifactKind))
   buckets.bin.push(w);
  else if(['concept','development_note','artwork'].includes(w.artifactKind))buckets.bookcase.push(w);
  else if(['script_scene','lyrics'].includes(w.artifactKind))buckets.typewriter.push(w);
  else buckets.cabinet.push(w);
 }
 return buckets;
}
function page(item,root,index){
 const label=(item.workType||item.artifactKind||item.releaseKind||item.recordType).replaceAll('_',' ');
 return '<a class="room-manuscript room-manuscript--'+(index%3)+'" href="'+root+'/creations/'+encodeURIComponent(item.slug)+'/">'+
  '<span class="room-manuscript-kind">'+esc(label)+'</span><strong>'+esc(item.title)+'</strong>'+
  '<span class="room-manuscript-description">'+esc(item.synopsis)+'</span>'+
  '<span class="room-manuscript-action">Open the manuscript <span aria-hidden="true">↗</span></span></a>';
}
function areaPanel(area,works,root){
 const cards=works.length?'<div class="room-manuscripts">'+works.map((w,i)=>page(w,root,i)).join('')+'</div>':
  '<p class="room-no-manuscripts">'+esc(area.empty)+'</p>';
 return '<section class="room-panel room-panel--'+area.id+'" data-room-panel="'+area.id+'" hidden aria-label="'+esc(area.title)+'">'+
  '<div class="room-panel-illustration" aria-hidden="true"></div>'+
  '<div class="room-panel-content"><span class="room-panel-kicker">UNCOVERED / '+esc(area.label.toUpperCase())+'</span>'+
  '<h2>'+esc(area.title)+'</h2><p class="room-panel-hint">'+esc(area.hint)+'</p>'+cards+
  '<span class="room-panel-count">'+works.length+' '+(works.length===1?'work':'works')+' to examine</span></div></section>';
}
function hotspot(area){
 return '<button type="button" class="room-hotspot room-hotspot--'+area.id+'" data-room-target="'+area.id+
  '" aria-label="Examine '+esc(area.label)+'" title="Examine '+esc(area.label)+'"><span class="room-hotspot-tooltip" aria-hidden="true">'+
  esc(area.label)+'</span></button>';
}
function renderWritingScene(works,root,preview){
 const grouped=groupWorks(works);
 const stage='<div class="room-pan" role="region" aria-label="Illustrated Writing island; scroll sideways on small screens" tabindex="0">'+
 '<div class="room-stage"><img class="room-stage-image" src="/assets/worlds/writing/manuscript-room-v1.avif" alt="" width="1250" height="593" decoding="async">'+
 '<div class="room-stage-vignette" aria-hidden="true"></div>'+
 AREAS.map(hotspot).join('')+
 '<a class="room-hotspot room-hotspot--exit" href="/" title="Return to DaveHub islands" aria-label="Return to DaveHub islands">'+
 '<span class="room-hotspot-tooltip" aria-hidden="true">Return to DaveHub</span></a></div></div>';
 const quick='<nav class="room-object-nav" aria-label="Explore objects in the room">'+
 AREAS.map(a=>'<button type="button" data-room-target="'+a.id+'">'+esc(a.label)+'</button>').join('')+
 '<a href="/">Exit to DaveHub</a></nav>';
 const panels=AREAS.map(a=>areaPanel(a,grouped[a.id],root)).join('');
 return '<div class="dh11-world dh11-world--writing room-world" data-scene="manuscript-hoard">'+
 '<div class="room-story-heading"><span>THE WRITING ISLAND</span><h1>The Manuscript Hoard</h1>'+
 '<p>It seems the stories have escaped their folders. Click something suspicious and see what you uncover.</p>'+
 (preview===true?'<div class="room-fictional"><strong>Fictional design demonstration.</strong> The manuscripts in this example are invented and not published projects.</div>':'')+
 '</div>'+stage+'<div class="room-bottom-bar"><p>Look around. Everything worth exploring is part of the room.</p>'+
 '<span>'+works.length+' approved '+(works.length===1?'piece':'pieces')+' hidden here</span></div>'+quick+
 '<dialog class="room-dialog" id="room-examine" aria-label="Examine an object in the Writing room">'+
 '<div class="room-dialog-shell"><button type="button" class="room-dialog-close" data-room-close aria-label="Close close-up and return to the room">✕ <span>Back to the room</span></button>'+
 panels+'</div></dialog>'+
 '<noscript><p class="room-noscript">Enable JavaScript to examine the objects in this room. The Writing world contains '+works.length+' approved creations.</p></noscript>'+
 '</div>';
}
module.exports={renderWritingScene,groupWorks,AREAS};
