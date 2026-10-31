'use strict';
/* DH-11: five visually distinct world experiences, using ONLY validated catalogue
 * records supplied by render-content. No independent feed, API or publication path.
 * The fictional example build is isolated under /previews/dh-08b.
 */
const CREATIVE_VIEWS = new Set(['writing','music','experiments','unfinished','memory-lane']);
const {renderWritingScene}=require('./render-writing-scene.cjs');
const copy = {
  writing: {kicker:'THE MANUSCRIPT HOARD',heading:'A room where stories have taken over',
    detail:'Stories, scraps, scripts, loose fragments and worlds that escaped their folders. Nothing is filed properly. That is part of the point.'},
  music: {kicker:'THE LISTENING ROOM',heading:'Follow the sound, find the story',
    detail:'Songs lead to scenes. Scenes lead to shows. Everything belongs to its own bigger world.'},
  experiments: {kicker:'THE INVENTION CHAMBER',heading:'A laboratory for the improbable',
    detail:'Odd inventions, half-sensible prototypes and questions nobody thought to ask.'},
  unfinished: {kicker:'THE ARCHIVE SHELF',heading:'Not everything needs an ending',
    detail:'These works have been deliberately put away. Their fragments still deserve a place.'},
  'memory-lane': {kicker:'THE TIME CORRIDOR',heading:'The long way back',
    detail:'Old ideas, past adventures and the occasional approximate date. Nothing here is a deadline.'}
};
const quote = str=>String(str).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const kicker = label=>'<p class="dh11-kicker">'+quote(label)+'</p>';
const anchor = (item,root,label,extra='')=>'<a class="dh11-visit '+extra+'" href="'+root+'/creations/'+encodeURIComponent(item.slug)+'/">'+quote(label)+' <span aria-hidden="true">↗</span></a>';
const emptyLink = root=>'<a class="dh11-visit" href="'+root+'/worlds/">Explore the other worlds <span aria-hidden="true">↗</span></a>';
const intro = (view,count)=>'<div class="dh11-introduction">'+kicker(copy[view].kicker)+
  '<h2>'+quote(copy[view].heading)+'</h2><p>'+quote(copy[view].detail)+'</p>'+
  '<span class="dh11-count">'+count+' '+(count===1?'creation':'creations')+' on display</span></div>';
const blank = (message,root)=>'<div class="dh11-no-works"><span aria-hidden="true">✧</span><p>'+quote(message)+'</p>'+emptyLink(root)+'</div>';
function music(works,root,card){
 const primary=works.find(w=>w.workType==='musical'||w.recordType==='music_identity')||works[0];
 const others=works.filter(w=>w!==primary);
 const bars=Array.from({length:19},(_,i)=>'<i style="--bar:'+String(2+(i*7)%11)+'" aria-hidden="true"></i>').join('');
 return '<div class="dh11-stage"><div class="dh11-stage-art" aria-hidden="true"><span class="dh11-vinyl"><span></span></span>'+
  '<div class="dh11-bars">'+bars+'</div></div><div class="dh11-stage-content">'+
  kicker('NOW ON THE STAGE')+'<h3>'+(primary?quote(primary.title):'The stage is ready')+'</h3>'+
  '<p>'+(primary?quote(primary.synopsis):'The listening room is ready for its first approved music project.')+'</p>'+
  (primary?anchor(primary,root,'Explore the music and story','dh11-stage-link'):emptyLink(root))+'</div></div>'+
  '<section class="dh11-music-collection">'+kicker('TRACKS, SCENES & RELEASES')+
  '<h3>Beyond the opening note</h3>'+
  (others.length?'<div class="cards dh11-music-cards">'+others.map(w=>card(w,root)).join('')+'</div>':
   '<p class="dh11-small">Associated tracks, albums, characters and scripts will appear together only after approval.</p>')+
  '<p class="dh11-small">No autoplay. Recordings and artwork require separate rights approval.</p></section>';
}
function experiments(works,root,card,preview){
 return '<div class="dh11-laboratory"><div class="dh11-lab-machine" aria-hidden="true">'+
   '<div class="dh11-lab-orbit dh11-lab-orbit--one"></div><div class="dh11-lab-orbit dh11-lab-orbit--two"></div>'+
   '<div class="dh11-lab-core">✳</div><span class="dh11-lab-node dh11-lab-node--a"></span>'+
   '<span class="dh11-lab-node dh11-lab-node--b"></span><span class="dh11-lab-node dh11-lab-node--c"></span></div>'+
   '<div class="dh11-lab-notes">'+kicker('SPECIMEN CABINET / 01')+'<h3>A home for curious detours</h3>'+
   '<p>Not everything fits neatly into a book, album or game. Some ideas belong on the workbench, where their oddness is the entire point.</p>'+
   '<p class="dh11-small">The illustrated instrument is decorative. It does not represent a real project.</p>'+
   (works.length?'<span class="dh11-count">'+works.length+' experiments catalogued</span>':
   '<span class="dh11-count">'+(preview?'Fictional workshop design':'No approved experiments yet')+'</span>')+'</div></div>'+
   (works.length?'<section class="dh11-lab-records">'+kicker('OPEN THE SPECIMEN DRAWERS')+
    '<div class="cards dh11-experiment-cards">'+works.map(w=>card(w,root)).join('')+'</div></section>':
    '<div class="dh11-lab-records">'+blank('The workbench is deliberately empty until an experiment is approved for display.',root)+'</div>');
}
function unfinished(works,root,dateLabel){
 return '<div class="dh11-shelf-room"><div class="dh11-shelf-note">'+kicker('ARCHIVED, NOT A TO-DO LIST')+
  '<h3>Some fragments are complete in their incompleteness.</h3>'+
  '<p>There are no progress bars, launch promises or reminders to finish these. Browse what survives, on its own terms.</p></div>'+
  '<div class="dh11-shelf">'+(works.length?works.map((w,i)=>
   '<a class="dh11-spine" href="'+root+'/creations/'+encodeURIComponent(w.slug)+'/" style="--spine:'+i%4+'">'+
   '<span class="dh11-spine-title">'+quote(w.title)+'</span><span class="dh11-spine-meta">'+quote(dateLabel(w))+'</span></a>').join(''):
   '<div class="dh11-spine dh11-spine--empty" aria-hidden="true"></div><div class="dh11-spine dh11-spine--empty" aria-hidden="true"></div>'+
   '<div class="dh11-spine dh11-spine--empty" aria-hidden="true"></div>')+'</div></div>'+
   (works.length?'<div class="dh11-shelf-captions">'+works.map(w=>
    '<div><strong>'+quote(w.title)+'</strong><span>'+quote(w.synopsis)+'</span>'+anchor(w,root,'Explore the surviving fragments')+'</div>').join('')+'</div>':
    blank('There are no owner-approved archived fragments to show yet.',root));
}
function memory(works,root,dateLabel){
 const known=works.filter(w=>Number.isInteger(w.period?.fromYear||w.period?.toYear));
 const unknown=works.filter(w=>!Number.isInteger(w.period?.fromYear||w.period?.toYear));
 const items=[...known,...unknown];
 return '<div class="dh11-timeline-head">'+kicker('MILESTONES WITHOUT A STOPWATCH')+
  '<h3>Remembered in no particular hurry.</h3><p>Approximate dates stay approximate, and unknown dates are welcome.</p></div>'+
  (items.length?'<ol class="dh11-timeline">'+items.map((w,i)=>
   '<li class="dh11-time-stop"><div class="dh11-time-label">'+quote(dateLabel(w))+'</div>'+
   '<div class="dh11-time-card">'+kicker('ARCHIVE ENTRY '+String(i+1).padStart(2,'0'))+
   '<h3>'+quote(w.title)+'</h3><p>'+quote(w.synopsis)+'</p>'+anchor(w,root,'Explore this memory')+'</div></li>').join('')+'</ol>':
   '<div class="dh11-timeline-empty">'+blank('The timeline has room for things worth remembering, whenever their stories are approved.',root)+'</div>');
}
function renderCreativeWorld({view,works,root,preview,card,dateLabel}){
 if(!CREATIVE_VIEWS.has(view))return null;
 if(view==='writing')return renderWritingScene(works,root,preview);
 const content={
  music:()=>music(works,root,card),
  experiments:()=>experiments(works,root,card,preview),
  unfinished:()=>unfinished(works,root,dateLabel),
  'memory-lane':()=>memory(works,root,dateLabel)
 }[view]();
 return '<div class="dh11-world dh11-world--'+view+'">'+intro(view,works.length)+content+'</div>';
}
module.exports={renderCreativeWorld,CREATIVE_VIEWS};
