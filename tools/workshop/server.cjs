'use strict';
/*
 * DH-08C — local-only editorial workshop; NEVER deploy this server on Cloudflare.
 * Usage: node tools/workshop/server.cjs
 * Drafts are persisted OUTSIDE the public git checkout, beneath ~/.davehub/.
 */
const http=require('node:http');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const crypto=require('node:crypto');
const {validateCatalogue}=require('../../scripts/content-check.cjs');

const HOST='127.0.0.1';
const PORT=Number(process.env.DAVEHUB_WORKSHOP_PORT||8765);
if (!Number.isSafeInteger(PORT)||PORT<1024||PORT>65535)throw Error('Port must be 1024–65535');
const DIR=path.join(os.homedir(),'.davehub','workshop');
const FILE=path.join(DIR,'drafts.json');
const TOKEN=crypto.randomBytes(32).toString('hex');
const BASE={schemaVersion:1,candidates:[]};
const MAX_POST=1024*1024;
const TYPES=['book','script','musical','song','game','physical_build','software','idea','other'];
const VIEWS=['projects','writing','games','experiments','music','unfinished','memory-lane'];
const STATUSES=['nominated','needs_review','ready_for_owner_approval','approved_for_export','withdrawn'];
const ID=/^[a-z][a-z0-9-]{2,79}$/;
function ensureStore(){
 fs.mkdirSync(DIR,{recursive:true,mode:0o700});
 if(!fs.existsSync(FILE)){fs.writeFileSync(FILE,JSON.stringify(BASE,null,2)+'\n',{mode:0o600,flag:'wx'})}
}
function readStore(){
 ensureStore();
 const doc=JSON.parse(fs.readFileSync(FILE,'utf8'));
 if(doc.schemaVersion!==1||!Array.isArray(doc.candidates))throw Error('Unrecognised local store format');
 return doc;
}
function writeStore(doc){
 ensureStore();
 const tmp=FILE+'.'+process.pid+'.tmp';
 fs.writeFileSync(tmp,JSON.stringify(doc,null,2)+'\n',{mode:0o600,flag:'wx'});
 try{fs.renameSync(tmp,FILE)}catch(e){fs.rmSync(tmp,{force:true});throw e}
}
function safeStrings(obj) {
 for(const [k,v] of Object.entries(obj||{})) {
  if(typeof v==='string'&&v.length>3000) throw Error(k+' too long');
 }
}
function cleanCandidate(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw Error('Candidate must be an object');
 if(!ID.test(input.id||''))throw Error('Invalid ID (use lowercase slug-like ID)');
 if(typeof input.title!=='string'||!input.title.trim()||input.title.length>180)throw Error('A title is required');
 if(!TYPES.includes(input.workType||'other'))throw Error('Unrecognised work type');
 if(!Array.isArray(input.views)||!input.views.length||!input.views.every(x=>VIEWS.includes(x))||new Set(input.views).size!==input.views.length)throw Error('Invalid categories');
 if(input.status&&!STATUSES.includes(input.status))throw Error('Invalid editorial status');
 safeStrings(input);
 const c={
  id:input.id,title:input.title.trim(),slug:input.slug||input.id,workType:input.workType||'other',
  lifecycle:input.lifecycle||'active', synopsis:typeof input.synopsis==='string'?input.synopsis.trim():'',
  views:input.views, status:input.status||'nominated',
  sourceUrl:typeof input.sourceUrl==='string'?input.sourceUrl.trim():'',
  sourceKind:input.sourceKind||'official',
  linkUrl:typeof input.linkUrl==='string'?input.linkUrl.trim():'',
  linkLabel:typeof input.linkLabel==='string'?input.linkLabel.trim():'',
  notes:typeof input.notes==='string'?input.notes.trim():'',
  review:{
   rights:input.review?.rights===true,
   metadata:input.review?.metadata===true,
   links:input.review?.links===true,
   media:input.review?.media===true
  },
  ownerApproved:input.ownerApproved===true,
  approvedOn:typeof input.approvedOn==='string'?input.approvedOn:''
 };
 if(!ID.test(c.slug))throw Error('Invalid URL slug');
 if(c.synopsis.length>1400)throw Error('Synopsis too long');
 if(!['idea','active','completed','permanently_shelved','abandoned'].includes(c.lifecycle))throw Error('Unknown lifecycle');
 if(c.views.includes('unfinished')&&!['permanently_shelved','abandoned'].includes(c.lifecycle))throw Error('Unfinished Shelf requires shelved/abandoned lifecycle');
 if((c.sourceUrl&&c.sourceUrl.length>2048)||(c.linkUrl&&c.linkUrl.length>2048))throw Error('URL too long');
 if(c.notes.length>3000)throw Error('Notes too long');
 // No covert extra keys survive cleaning (e.g. unpublished lyrics).
 return c;
}
function makeApproved(candidate){
 const c=cleanCandidate(candidate);
 if(c.status!=='approved_for_export'||!c.ownerApproved||!Object.values(c.review).every(Boolean))throw Error(c.id+' not explicitly approved');
 if(!c.synopsis)throw Error(c.id+' has no synopsis');
 const record={
  id:c.id,slug:c.slug,title:c.title,recordType:'work',workType:c.workType,lifecycle:c.lifecycle,synopsis:c.synopsis,
  views:c.views,
  sources:c.sourceUrl?[{kind:c.sourceKind,url:c.sourceUrl}]:[{kind:'owner_attestation'}],
  links:c.linkUrl?[{kind:'official',label:c.linkLabel||'Explore the original',url:c.linkUrl}]:[],
  media:[],relations:[],
  publication:{status:'public_approved',approvedBy:'owner',approvedOn:c.approvedOn,
   rightsReviewed:c.review.rights,metadataReviewed:c.review.metadata,linksReviewed:c.review.links,mediaReviewed:c.review.media}
 };
 return record;
}
function exportReview(store){
 const c=store.candidates.filter(x=>x.status==='approved_for_export');
 if(!c.length)throw Error('No items have been explicitly approved for export.');
 const output={schemaVersion:1,items:c.map(makeApproved)};
 const check=validateCatalogue(output);
 if(!check.valid)throw Error('Export blocked: '+check.errors.join('; '));
 return output;
}
function reply(res,status,data,ctype='application/json; charset=utf-8'){
 const content=ctype.startsWith('application/json')?JSON.stringify(data):data;
 res.writeHead(status,{'Content-Type':ctype,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'; connect-src 'self'; img-src 'self' data:; script-src 'self'; style-src 'self';",'Referrer-Policy':'no-referrer','Access-Control-Allow-Origin':'null'});
 res.end(content);
}
function jsonReply(res,status,data){reply(res,status,data)}
function allowed(req){
 const host=req.headers.host;
 if(host!==HOST+':'+PORT)return false;
 const origin=req.headers.origin;
 if(origin&&origin!=='http://'+HOST+':'+PORT)return false;
 return true;
}
async function body(req){
 let size=0,chunks=[];
 for await(const chunk of req){size+=chunk.length;if(size>MAX_POST)throw Error('Request too large');chunks.push(chunk)}
 return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}
async function serve(req,res){
 if(!allowed(req)){res.writeHead(403);res.end('Access denied');return}
 if(req.method==='GET'&&req.url==='/'){
  const html=fs.readFileSync(path.join(__dirname,'index.html'),'utf8').replace('__SESSION_TOKEN__',TOKEN);
  reply(res,200,html,'text/html; charset=utf-8');return;
 }
 if(!req.url.startsWith('/api/')){res.writeHead(404);res.end('Not found');return}
 if(req.headers['x-workshop-token']!==TOKEN){jsonReply(res,403,{error:'No valid local session'});return}
 if(req.method==='GET'&&req.url==='/api/drafts'){jsonReply(res,200,readStore());return}
 if(req.method==='POST'&&req.url==='/api/import'){
  const data=await body(req),source=Array.isArray(data)?data:data.candidates;
  if(!Array.isArray(source)||source.length>250)throw Error('Import must contain at most 250 candidates');
  const d=readStore();
  for(const incoming of source){
   // Never trust an import file's approval flags or editorial status.
   const clean=cleanCandidate({...incoming,status:'needs_review',ownerApproved:false,approvedOn:'',review:{}});
   if(!d.candidates.some(x=>x.id===clean.id))d.candidates.push(clean);
  }
  writeStore(d);jsonReply(res,200,{count:d.candidates.length});return;
 }
 if(req.method==='POST'&&req.url==='/api/save'){
  const incoming=await body(req);const c=cleanCandidate(incoming);const d=readStore();
  if(c.status==='approved_for_export'){
   if(!c.ownerApproved||!Object.values(c.review).every(Boolean)||!c.approvedOn)throw Error('Approval requires owner sign-off, date and all review gates');
   const check=validateCatalogue({schemaVersion:1,items:[makeApproved(c)]});
   if(!check.valid)throw Error('Cannot approve: '+check.errors.join('; '));
  }
  const ix=d.candidates.findIndex(x=>x.id===c.id);
  if(ix<0)d.candidates.push(c);else d.candidates[ix]=c;
  writeStore(d);jsonReply(res,200,{ok:true,count:d.candidates.length});return;
 }
 if(req.method==='POST'&&req.url==='/api/export'){
  const result=exportReview(readStore());
  const json=JSON.stringify(result,null,2)+'\n';
  res.writeHead(200,{'Content-Type':'application/json; charset=utf-8','Content-Disposition':'attachment; filename="davehub-approved-proposal.json"','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'; frame-ancestors 'none'"});
  res.end(json);return;
 }
 jsonReply(res,404,{error:'Unknown operation'});
}
function start(port=PORT,host=HOST){
 ensureStore();
 const server=http.createServer((req,res)=>{serve(req,res).catch(e=>jsonReply(res,400,{error:e.message}))});
 return new Promise((resolve,reject)=>{
  server.once('error',reject);
  server.listen(port,host,()=>resolve(server));
 });
}
module.exports={start,cleanCandidate,exportReview,readStore,makeApproved,HOST,PORT};
if(require.main===module){
 start().then(()=>{console.log('Local DaveHub Content Workshop: http://'+HOST+':'+PORT);console.log('Private drafts stored at: '+FILE);console.log('This server does not publish anything. Ctrl+C to stop.');}).catch(e=>{console.error(e);process.exit(1)});
}
