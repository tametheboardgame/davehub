'use strict';
/* DH-08C: local workshop client. No third-party scripts, no remote endpoints. */
const token=document.body.dataset.token;
const $=id=>document.getElementById(id);
const el=(tag,className,text)=>{const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node};
let drafts=[],current=null;
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
 drafts=result.candidates;
 drawQueue();
 if(current){const found=drafts.find(x=>x.id===current.id);if(found)show(found)}
}
function drawQueue(){
 const q=$('queue');q.replaceChildren();
 $('count').textContent=drafts.length+' candidate'+(drafts.length===1?'':'s');
 for(const c of drafts){
  const button=el('button','queueitem'+(current?.id===c.id?' active':''));
  button.type='button';button.append(el('strong','',c.title),el('span','',c.status.replaceAll('_',' ')));
  button.addEventListener('click',()=>show(c));q.append(button);
 }
 if(!drafts.length)q.append(el('p','none','Import an inventory or create your first candidate.'));
}
function show(c){
 current=c;
 $('editor-title').textContent=c.title||'New creation';
 $('id').value=c.id||'';$('slug').value=c.slug||'';
 $('title').value=c.title||'';$('work-type').value=c.workType||'other';
 $('lifecycle').value=c.lifecycle||'active';$('synopsis').value=c.synopsis||'';
 $('source-url').value=c.sourceUrl||'';$('link-url').value=c.linkUrl||'';
 $('link-label').value=c.linkLabel||'';$('status').value=c.status||'nominated';
 $('notes').value=c.notes||'';
 document.querySelectorAll('#views input').forEach(x=>{x.checked=(c.views||[]).includes(x.value)});
 $('check-rights').checked=!!c.review?.rights;
 $('check-meta').checked=!!c.review?.metadata;
 $('check-links').checked=!!c.review?.links;
 $('check-media').checked=!!c.review?.media;
 $('owner-approved').checked=!!c.ownerApproved;
 message('Local draft loaded. No public changes have been made.');
 drawQueue();
}
function toCandidate(){
 const date=new Date().toISOString().slice(0,10);
 const c={
  id:$('id').value.trim(),
  slug:$('slug').value.trim()||$('id').value.trim(),
  title:$('title').value.trim(),
  workType:$('work-type').value,
  lifecycle:$('lifecycle').value,
  synopsis:$('synopsis').value.trim(),
  views:Array.from(document.querySelectorAll('#views input:checked')).map(x=>x.value),
  sourceUrl:$('source-url').value.trim(),
  sourceKind:$('source-url').value.includes('github.com')?'repository':'official',
  linkUrl:$('link-url').value.trim(),
  linkLabel:$('link-label').value.trim(),
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
$('new-record').addEventListener('click',()=>{
 show({id:'',title:'',slug:'',workType:'other',lifecycle:'active',synopsis:'',views:['projects'],status:'nominated',review:{},ownerApproved:false,notes:''});
 $('id').focus();
});
$('edit-form').addEventListener('submit',async e=>{
 e.preventDefault();
 try{
  const c=toCandidate();await api('POST','save',c);
  current=c;message('Saved to the private local catalogue.');
  await load();
 }catch(err){message(err.message,true)}
});
$('import-file').addEventListener('change',async e=>{
 const file=e.target.files?.[0];if(!file)return;
 try{
  if(file.size>1024*1024)throw Error('Import file too large (limit: 1MB)');
  const content=JSON.parse(await file.text());
  const candidates=Array.isArray(content)?content:content.candidates;
  if(!Array.isArray(candidates))throw Error('Expected a candidates array');
  const r=await (await api('POST','import',{candidates})).json();
  await load();message('Imported locally. All imported items require fresh owner review. '+r.count+' total candidates.');
 }catch(err){message(err.message,true)}
 e.target.value='';
});
$('export-approved').addEventListener('click',async()=>{
 try{
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
