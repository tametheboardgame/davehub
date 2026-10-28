'use strict';
/* DH-08C: local workshop client. No third-party scripts, no remote endpoints. */
const token=document.body.dataset.token;
const $=id=>document.getElementById(id);
const el=(tag,className,text)=>{const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node};
let drafts=[],current=null,dirty=false;
const F=['id','slug','title','work-type','lifecycle','synopsis','source-url','link-url','link-label','status','notes'];
function message(text,error=false){$('message').textContent=text;$('message').className=error?'error':''}
async function api(method,endpoint,body){
 const response=await fetch('/api/'+endpoint,{
  method,headers:{'X-Workshop-Token':token,...(body?{'Content-Type':'application/json'}:{})},
  body:body?JSON.stringify(body):undefined,cache:'no-store'
 });
 if(!response.ok){let o={};try{o=await response.json()}catch{}throw Error(o.error||'Request failed ('+response.status+')')}
 return response;
}
async function load(){
 const result=await (await api('GET','drafts')).json();
 const review=await (await api('GET','readiness')).json();
 drafts=result.candidates;
 drawQueue();
 drawReview(review);
 if(current&&!dirty){const found=drafts.find(x=>x.id===current.id);if(found)show(found)}
}
function drawReview(report){
 const target=$('review-cards');target.replaceChildren();
 $('review-progress').textContent=report.prepared+' of '+report.total+' prepared · '+report.readyForProposal+' ready for owner-approved proposal';
 for(const item of report.items){
  const card=el('article','review-card');
  const header=el('div','review-card-head');
  header.append(el('strong','',item.title),el('span',item.readyForProposal?'review-done':'review-wait',item.present?item.checked+'/4 checks signed':'Not prepared'));
  card.append(header);
  const summary=el('p','',item.present
   ?'Editorial stage: '+item.stage.replaceAll('_',' ')+'. '+item.openChecks.length+' outstanding review item'+(item.openChecks.length===1?'':'s')+'.'
   :'This project has not been prepared in your local Workshop.');
  card.append(summary);
  if(item.openChecks.length){
   const details=el('details','review-issues');
   const heading=el('summary','',item.openChecks.length+' items to review');
   const list=el('ul','');
   item.openChecks.forEach(t=>{const li=el('li','',t);list.append(li)});
   details.append(heading,list);card.append(details);
  }
  const actions=el('div','review-actions');
  if(item.present){
   const select=el('button','', 'Review record');
   select.type='button';
   select.addEventListener('click',()=>{
    const selected=drafts.find(x=>x.id===item.id);
    if(dirty&&!window.confirm('Discard unsaved edits before opening another record?'))return;
    if(selected)show(selected);
    $('editor-title').scrollIntoView({behavior:'smooth',block:'start'});
   });
   const preview=el('a','', 'Preview private page');
   preview.href='/creations/'+encodeURIComponent(item.slug)+'/';
   preview.target='_blank';preview.rel='noopener noreferrer';
   actions.append(select,preview);
  }
  card.append(actions);target.append(card);
 }
}
function drawQueue(){
 const q=$('queue');q.replaceChildren();
 $('count').textContent=drafts.length+' candidate'+(drafts.length===1?'':'s');
 for(const c of drafts){
  const button=el('button','queueitem'+(current?.id===c.id?' active':''));
  button.type='button';button.append(el('strong','',c.title),el('span','',c.status.replaceAll('_',' ')));
  button.addEventListener('click',()=>{if(dirty&&!window.confirm('Discard unsaved edits before opening another record?'))return;show(c)});q.append(button);
 }
 if(!drafts.length)q.append(el('p','none','Import an inventory or create your first candidate.'));
}
function show(c){
 current=c;dirty=false;
 $('editor-title').textContent=c.title||'New creation';
 $('id').value=c.id||'';$('slug').value=c.slug||'';
 $('title').value=c.title||'';
 $('record-type').value=c.recordType||'work';$('work-type').value=c.workType||'other';
 $('release-kind').value=c.releaseKind||'album';$('artifact-kind').value=c.artifactKind||'other';
 $('lifecycle').value=c.lifecycle||'active';$('synopsis').value=c.synopsis||'';
 $('source-url').value=c.sourceUrl||'';$('link-url').value=c.linkUrl||'';
 $('source-kind').value=c.sourceKind||'official';$('link-kind').value=c.linkKind||'official';
 $('link-label').value=c.linkLabel||'';$('status').value=c.status||'nominated';
 $('notes').value=c.notes||'';
 document.querySelectorAll('#views input').forEach(x=>{x.checked=(c.views||[]).includes(x.value)});
 $('check-rights').checked=!!c.review?.rights;
 $('check-meta').checked=!!c.review?.metadata;
 $('check-links').checked=!!c.review?.links;
 $('check-media').checked=!!c.review?.media;
 $('owner-approved').checked=!!c.ownerApproved;
 const saved=drafts.some(x=>x.id===c.id);
 $('preview-page').href=saved?'/creations/'+encodeURIComponent(c.slug||c.id)+'/':'#';
 $('preview-page').setAttribute('aria-disabled',saved?'false':'true');
 $('draft-state').textContent='Saved local draft. Changes you make here are not included in the preview until you save again.';
 message('Local draft loaded. No public changes have been made.');
 drawQueue();
}
function toCandidate(){
 const date=new Date().toISOString().slice(0,10);
 const c={
  id:$('id').value.trim(),
  slug:$('slug').value.trim()||$('id').value.trim(),
  title:$('title').value.trim(),
  recordType:$('record-type').value,workType:$('work-type').value,
  releaseKind:$('release-kind').value,artifactKind:$('artifact-kind').value,
  lifecycle:$('lifecycle').value,
  synopsis:$('synopsis').value.trim(),
  views:Array.from(document.querySelectorAll('#views input:checked')).map(x=>x.value),
  sourceUrl:$('source-url').value.trim(),
  sourceKind:$('source-kind').value,
  linkUrl:$('link-url').value.trim(),
  linkLabel:$('link-label').value.trim(),linkKind:$('link-kind').value,
  status:$('status').value,
  notes:$('notes').value.trim(),
  review:{
   rights:$('check-rights').checked,metadata:$('check-meta').checked,
   links:$('check-links').checked,media:$('check-media').checked
  },
  ownerApproved:$('owner-approved').checked,
  approvedOn:$('status').value==='approved_for_export'&&$('owner-approved').checked?(current?.approvedOn||date):''
 };
 return c;
}
$('seed-first-wave').addEventListener('click',async()=>{
 try{
  const r=await (await api('POST','seed',{})).json();
  await load();
  message('Three agreed projects prepared locally: '+r.added+' added, '+r.skipped+' already present. No approval granted and nothing published.');
 }catch(err){message(err.message,true)}
});
$('preview-page').addEventListener('click',e=>{
 if($('preview-page').getAttribute('aria-disabled')==='true'){e.preventDefault();message('Save this draft locally before previewing.',true)}
});
function markDirty(){
 if(!current)return;
 dirty=true;
 $('draft-state').textContent='Unsaved changes. Save local draft before previewing this revision.';
 $('preview-page').setAttribute('aria-disabled','true');
}
$('edit-form').addEventListener('input',markDirty);
$('edit-form').addEventListener('change',markDirty);
$('new-record').addEventListener('click',()=>{
 if(dirty&&!window.confirm('Discard unsaved edits before creating another record?'))return;
 show({id:'',title:'',slug:'',workType:'other',lifecycle:'active',synopsis:'',views:['projects'],status:'nominated',review:{},ownerApproved:false,notes:''});
 $('id').focus();
});
$('edit-form').addEventListener('submit',async e=>{
 e.preventDefault();
 try{
  const c=toCandidate();await api('POST','save',c);
  dirty=false;current=c;message('Saved to the private local catalogue.');
  await load();
 }catch(err){message(err.message,true)}
});
$('import-file').addEventListener('change',async e=>{
 const file=e.target.files?.[0];if(!file)return;
 try{
  if(file.size>1024*1024)throw Error('Import file too large (limit: 1MB)');
  const content=JSON.parse(await file.text());
  if(!Array.isArray(content)&&(!content||!Array.isArray(content.candidates)))throw Error('Expected a discovery report or candidates array');
  const r=await (await api('POST','import',content)).json();
  await load();message('Imported '+r.added+' new drafts; '+r.skipped+' duplicates retained without modification. '+r.count+' in local review queue. None approved.');
 }catch(err){message(err.message,true)}
 e.target.value='';
});
$('export-approved').addEventListener('click',async()=>{
 try{
  if(dirty)throw Error('Save or discard your unsaved edits before exporting a proposal.');
  const response=await api('POST','export',{});
  const content=await response.blob();
  const url=URL.createObjectURL(content);
  const anchor=document.createElement('a');anchor.href=url;anchor.download='davehub-approved-proposal.json';
  document.body.append(anchor);anchor.click();anchor.remove();
  URL.revokeObjectURL(url);
  message('Downloaded an approved proposal. No GitHub commit or public deployment was made.');
 }catch(err){message(err.message,true)}
});
load().catch(e=>message(e.message,true));
