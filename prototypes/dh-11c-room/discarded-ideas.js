/* DH-11C.6E: nine invented wastepaper curiosities.
   This is a public-safe inspection surface for the EXISTING nine animated
   crumpled 3D meshes, not a source of actual discarded/private manuscripts. */
(function(root,factory){
 'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.DH11DiscardedIdeas=api;
})(typeof window!=='undefined'?window:null,function(){
 'use strict';
 const ITEMS=Object.freeze([
  {id:'demo-moon',title:'The Moon Has Filed a Complaint',stamp:'URGENT / LUNAR',ink:'#805d84',
   lines:['The moon writes to the council because its evening shift keeps getting longer, its parking space is occupied by Jupiter, and somebody has given the stars a fog machine.',
    'Requested remedy: one night off, a decent chair, and an apology from the tides.'],
   reverse:'Rejected on the grounds that nobody in the council owns a ladder long enough to deliver the reply.'},
  {id:'demo-kettle',title:'How to Unhaunt a Kettle',stamp:'DRAFT 004',ink:'#637f88',
   lines:['Step one: ask the kettle politely whether it has unfinished business. Step two: do not mention the tea.',
    'Step three has been torn away. The kettle insists this is a deliberate cliffhanger.'],
   reverse:'The ghost demanded a biscuit. The budget contained no provision for biscuits.'},
  {id:'demo-pigeon',title:'The Crown for the Office Pigeon',stamp:'DO NOT APPROVE',ink:'#8e724e',
   lines:['A pigeon arrives at an unremarkable office with an immaculate royal seal and seventeen advisors.',
    'By lunchtime the photocopier has been knighted and everyone is paying rent to the bird.'],
   reverse:'Too plausible for fantasy. Probably a documentary.'},
  {id:'demo-tuesday',title:'An Alternative to Tuesday',stamp:'SCHEDULING',ink:'#8a635a',
   lines:['The committee proposes replacing every Tuesday with a spare Thursday to save administrative effort.',
    'Wednesday objects in writing, which is impressive given that Wednesday has no hands.'],
   reverse:'The minutes were approved on a day that does not technically exist.'},
  {id:'demo-shopping',title:'A Self-Destructing Shopping List',stamp:'HANDLE GENTLY',ink:'#6f8059',
   lines:['Milk, bread, one small dragon, more milk, batteries for the prophecy, absolutely no more dragons.',
    'The list crosses out its own final item as soon as it is read aloud.'],
   reverse:'Too expensive to print: the paper keeps resigning.'},
  {id:'demo-apology',title:'The Department of Unfinished Apologies',stamp:'RETURN TO SENDER',ink:'#76658a',
   lines:['Dear Sir or Madam, I am terribly sorry about the incident with the clock tower. In my defence, time had been behaving very rudely.',
    'The rest of the apology is held up by an unusually confident semicolon.'],
   reverse:'Apology considered technically incomplete, but the clock has forgiven nobody.'},
  {id:'demo-biscuit',title:'The Last Biscuit Treaty',stamp:'TOP SECRET (CRUMBS)',ink:'#8a6a52',
   lines:['Article I: no person shall claim the final biscuit while pretending not to want it.',
    'Article II: dunking constitutes an act of war unless accompanied by a sincere offer of tea.'],
   reverse:'Negotiations collapsed after the delegates ate the evidence.'},
  {id:'demo-ghost',title:'A Ghost Who Is Afraid of Sheets',stamp:'HAUNTING / FAILED',ink:'#5f7486',
   lines:['An ambitious ghost enrols in night school to learn the traditional art of going “Boo!”',
    'Unfortunately the bedsheet is terrifying. A compromise involving a dressing gown remains under review.'],
   reverse:'The ghost now works in customer service. Everyone agrees that this is much scarier.'},
  {id:'demo-map',title:'A Map That Objects to North',stamp:'CARTOGRAPHY',ink:'#817458',
   lines:['This map believes north is a social construct and east has received altogether too much publicity.',
    'It refuses to show the route home until somebody gives southwest a proper introduction.'],
   reverse:'Drawings of this map led to widespread confusion among compasses.'}
 ].map(item=>Object.freeze({...item,
  kind:'Fictional demonstration',lines:Object.freeze([...item.lines])})));
 function get(index){
  return Number.isInteger(index)&&index>=0&&index<ITEMS.length?ITEMS[index]:null;
 }
 function mount({document,onReturnToBin=()=>{}}){
  if(!document?.getElementById||typeof onReturnToBin!=='function')
   throw Error('Discarded idea reader requires a document and a return-to-bin action');
  const node=id=>{
   const element=document.getElementById(id);
   if(!element)throw Error('Missing discarded-idea reader control '+id);
   return element;
  };
  const dialog=node('discarded-dialog'),close=node('discarded-close'),
   title=node('discarded-title'),number=node('discarded-number'),
   stamp=node('discarded-stamp'),text=node('discarded-text'),reverse=node('discarded-reverse'),
   folded=node('discarded-folded'),sheet=node('discarded-sheet'),
   unfold=node('discarded-unfold'),flip=node('discarded-flip'),
   feedback=node('discarded-feedback'),leave=node('discarded-leave'),
   returnButton=node('discarded-return');
  let current=null,sourceFocus=null,side='front';
  function drawSide(){
   const back=side==='back';
   sheet.dataset.side=side;
   text.hidden=back;
   reverse.hidden=!back;
   flip.textContent=back?'Turn back over':'Turn over';
   flip.setAttribute('aria-label',back?'Read the front of the recovered scrap':'Read why this idea was discarded');
  }
  function show(index){
   const item=get(index);
   if(!item)return false;
   if(dialog.open)dialog.close();
   sourceFocus=document.activeElement;
   current=index;side='front';
   title.textContent=item.title;
   number.textContent='RECOVERED SCRAP '+String(index+1).padStart(2,'0')+' / 09';
   stamp.textContent=item.stamp;
   stamp.style.setProperty('--discarded-ink',item.ink);
   text.replaceChildren(...item.lines.map(line=>{
    const p=document.createElement('p');p.textContent=line;return p;
   }));
   reverse.textContent=item.reverse;
   folded.hidden=false;
   sheet.hidden=true;
   unfold.hidden=false;
   flip.hidden=true;
   feedback.textContent='An entirely fictional discarded idea. No real unpublished work appears here.';
   drawSide();
   if(!dialog.open)dialog.showModal();
   unfold.focus({preventScroll:true});
   return true;
  }
  function dismiss(){
   if(dialog.open)dialog.close();
  }
  function smooth(){
   if(current===null)return;
   folded.hidden=true;
   sheet.hidden=false;
   unfold.hidden=true;
   flip.hidden=false;
   flip.focus({preventScroll:true});
  }
  function turn(){
   if(current===null||sheet.hidden)return;
   side=side==='front'?'back':'front';
   drawSide();
  }
  function crumple(){
   if(current===null)return;
   const index=current;
   dismiss();
   onReturnToBin(index);
  }
  unfold.addEventListener('click',smooth);
  flip.addEventListener('click',turn);
  close.addEventListener('click',dismiss);
  leave.addEventListener('click',dismiss);
  returnButton.addEventListener('click',crumple);
  dialog.addEventListener('click',event=>{if(event.target===dialog)dismiss();});
  dialog.addEventListener('close',()=>{
   current=null;side='front';
   if(sourceFocus?.isConnected&&typeof sourceFocus.focus==='function')
    sourceFocus.focus({preventScroll:true});
  });
  dialog.addEventListener('keydown',event=>{
   if(event.key==='ArrowRight'&&!sheet.hidden){
    event.preventDefault();side='back';drawSide();
   }else if(event.key==='ArrowLeft'&&!sheet.hidden){
    event.preventDefault();side='front';drawSide();
   }
  });
  return Object.freeze({show,dismiss,get,
   get opened(){return dialog.open;},
   get current(){return current;},
   get side(){return side;}
  });
 }
 return Object.freeze({ITEMS,get,mount});
});
