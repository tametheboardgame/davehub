/* DH-11C.6C.1: public-safe demonstration reader and creative workshop.
   Manuscript contents are explicitly fictional samples, not David's private drafts. */
(function(root,factory){
 'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.DH11ManuscriptExperience=api;
})(typeof window!=='undefined'?window:null,function(){
 'use strict';
 const MANUSCRIPTS=Object.freeze([
  {id:'demo-unsent-letters',title:'The Museum of Unsent Letters',kind:'Fictional demonstration',pages:[
   {heading:'A door in the wrong wall',paragraphs:[
    'The museum opened only when nobody expected a delivery. Its doors were addressed to people who had moved away, grown older, or forgotten to exist.',
    'On the first floor, a curator polished the silence between two sentences. Nobody had ever written either of them.'
   ]},
   {heading:'An envelope, unopened',paragraphs:[
    'There was a letter with no recipient, a stamp from a country that had not been invented, and an apology written in the future tense.',
    'Here a real manuscript might continue. For now, the pages are only a demonstration of how reading in the room could work.'
   ]}
  ]},
  {id:'demo-bottom-drawer',title:'Instructions for the Bottom Drawer',kind:'Fictional demonstration',pages:[
   {heading:'An inventory of peculiar things',paragraphs:[
    'One missing Tuesday. Four respectable excuses. An idea with very sharp corners. A map of somewhere nobody would admit visiting.',
    'At the bottom was a label that read: KEEP UNTIL IMPORTANT. Nobody could remember what that meant.'
   ]},
   {heading:'The second inventory',paragraphs:[
    'The drawer had developed another drawer overnight. Its contents were identical except for one small, inconvenient possibility.',
    'Future approved extracts could replace this specimen without changing the reading interface.'
   ]}
  ]},
  {id:'demo-margin-notes',title:'Marginal Notes from Tomorrow',kind:'Fictional demonstration',pages:[
   {heading:'Correction in violet ink',paragraphs:[
    'The original sentence had been crossed out so fiercely that it nearly became a doorway.',
    'In the margin somebody had written: This is not where the story starts. Which, of course, made it exactly where the story started.'
   ]},
   {heading:'A note to the reader',paragraphs:[
    'These pages are invented examples, not previews of an unpublished project.',
    'When excerpts are approved for DaveHub, they can be arranged here by work, chapter and page.'
   ]}
  ]}
 ]);
 const PROMPTS=Object.freeze([
  'A character discovers a door where yesterday there was a window.',
  'Write a complaint to an organisation that controls the weather.',
  'Begin with: “I was not expecting the moon to telephone.”',
  'Describe something impossible as though it were perfectly ordinary.'
 ]);
 const sheetForIndex=index=>Number.isInteger(index)&&index>=0&&index<13?index%MANUSCRIPTS.length:null;
 function mount({document,onType=()=>{},catalogue=MANUSCRIPTS}){
  if(!document?.getElementById||!Array.isArray(catalogue)||!catalogue.length)
   throw Error('Manuscript experience requires a non-empty public-safe catalogue');
  const get=id=>{
   const node=document.getElementById(id);
   if(!node)throw Error('Missing manuscript experience control: '+id);
   return node;
  };
  const reader=get('manuscript-dialog'),readerClose=get('manuscript-close'),
   readerTitle=get('manuscript-title'),readerKind=get('manuscript-kind'),
   pageHeading=get('manuscript-page-heading'),pageText=get('manuscript-page-text'),
   pageNumber=get('manuscript-page-number'),previous=get('manuscript-prev'),
   next=get('manuscript-next'),readerIndex=get('manuscript-position');
  const workshop=get('workshop-dialog'),workshopClose=get('workshop-close'),
   prompt=get('workshop-prompt'),nextPrompt=get('workshop-next-prompt'),
   textArea=get('workshop-page'),counter=get('workshop-count'),
   clear=get('workshop-clear'),copy=get('workshop-copy'),feedback=get('workshop-feedback');
  let current=null,page=0,promptIndex=0,readerInvoker=null,workshopInvoker=null,lastLength=0;
  function restore(invoker){
   if(invoker?.isConnected&&typeof invoker.focus==='function')
    invoker.focus({preventScroll:true});
  }
  function pageView(){
   const item=catalogue.find(entry=>entry.id===current);
   if(!item)return;
   const sheet=item.pages[page];
   readerTitle.textContent=item.title;
   readerKind.textContent=item.kind+' · Sample only, not a published manuscript';
   pageHeading.textContent=sheet.heading;
   pageText.replaceChildren();
   for(const passage of sheet.paragraphs){
    const p=document.createElement('p');p.textContent=passage;pageText.append(p);
   }
   pageNumber.textContent='Page '+(page+1)+' of '+item.pages.length;
   readerIndex.textContent=String(page+1).padStart(2,'0')+' / '+String(item.pages.length).padStart(2,'0');
   previous.disabled=page===0;next.disabled=page===item.pages.length-1;
  }
  function openManuscript(index=0){
   const sample=sheetForIndex(index);
   if(sample===null)return false;
   const item=catalogue[sample%catalogue.length];
   if(!item?.pages?.length)return false;
   readerInvoker=document.activeElement;current=item.id;page=0;
   pageView();
   if(!reader.open)reader.showModal();
   readerClose.focus({preventScroll:true});
   return true;
  }
  previous.addEventListener('click',()=>{if(page>0){page--;pageView();}});
  next.addEventListener('click',()=>{const item=catalogue.find(x=>x.id===current);if(item&&page<item.pages.length-1){page++;pageView();}});
  readerClose.addEventListener('click',()=>reader.close());
  reader.addEventListener('click',event=>{if(event.target===reader)reader.close();});
  reader.addEventListener('close',()=>{current=null;restore(readerInvoker);});
  reader.addEventListener('keydown',event=>{
   if(event.target?.matches?.('input,textarea'))return;
   if(event.key==='ArrowLeft'&&page>0){event.preventDefault();page--;pageView();}
   if(event.key==='ArrowRight'){const item=catalogue.find(x=>x.id===current);if(item&&page<item.pages.length-1){event.preventDefault();page++;pageView();}}
  });
  function updateCount(){
   const value=textArea.value;
   const words=value.trim()?value.trim().split(/\s+/).length:0;
   counter.textContent=words+' '+(words===1?'word':'words')+' · '+value.length+' characters';
  }
  function openWorkshop(){
   workshopInvoker=document.activeElement;prompt.textContent=PROMPTS[promptIndex];
   feedback.textContent='Nothing is saved or sent. Copy your text if you want to keep it.';
   updateCount();
   if(!workshop.open)workshop.showModal();
   textArea.focus({preventScroll:true});return true;
  }
  nextPrompt.addEventListener('click',()=>{
   promptIndex=(promptIndex+1)%PROMPTS.length;
   prompt.textContent=PROMPTS[promptIndex];
  });
  textArea.addEventListener('input',event=>{
   if(textArea.value.length>lastLength&&event.inputType==='insertText'&&event.data?.length===1)onType();
   lastLength=textArea.value.length;updateCount();feedback.textContent='';
  });
  clear.addEventListener('click',()=>{
   textArea.value='';lastLength=0;updateCount();feedback.textContent='Fresh page. Nothing has been saved.';textArea.focus();
  });
  copy.addEventListener('click',async()=>{
   if(!textArea.value){feedback.textContent='The page is blank.';return;}
   try{
    if(!globalThis.navigator?.clipboard?.writeText)throw Error('Clipboard unavailable');
    await globalThis.navigator.clipboard.writeText(textArea.value);
    feedback.textContent='Copied to your clipboard.';
   }catch{feedback.textContent='Copy unavailable here. Select the page text and copy it manually.';textArea.focus();}
  });
  workshopClose.addEventListener('click',()=>workshop.close());
  workshop.addEventListener('click',event=>{if(event.target===workshop)workshop.close();});
  workshop.addEventListener('close',()=>restore(workshopInvoker));
  return Object.freeze({openManuscript,openWorkshop,sheetForIndex,get reading(){return reader.open;},get writing(){return workshop.open;}});
 }
 return Object.freeze({MANUSCRIPTS,PROMPTS,sheetForIndex,mount});
});
