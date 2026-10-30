'use strict';
/*
 * DH-10C: trusted owner-initiated publication PROPOSALS only.
 *
 * Reads the public, verified root davehub.json from a nominated public
 * repository. Writes a validated diff in a disposable GitHub Actions checkout;
 * the publishing workflow opens a PR against staging. Neither a source
 * marker nor a bot commit can publish a catalogue item without owner review
 * and PR merge. Never fetch README, private source, media or arbitrary URLs.
 */
const fs=require('node:fs');
const path=require('node:path');
const {validateManifest}=require('./davehub-manifest.cjs');
const {validateCatalogue}=require('./content-check.cjs');
const OWNER='tametheboardgame';
const REPO=/^tametheboardgame\/[a-zA-Z0-9_.-]{1,100}$/;
const SLUG=/^[a-z][a-z0-9-]{2,79}$/;
const VIEWS=new Set(['projects','writing','games','experiments','music','unfinished','memory-lane']);
const MODES=new Set(['publish','revise','withdraw']);
const YES='I APPROVE THIS PUBLICATION PROPOSAL';
function requireOwner(input){
 if(input.actor!==OWNER||input.repository!=='tametheboardgame/davehub'||
    input.ref!=='refs/heads/staging')
  throw Error('Only the DaveHub owner can propose a staging catalogue change');
 if(!MODES.has(input.mode))throw Error('Unsupported editorial operation');
 if(input.confirmation!==YES)throw Error('Explicit publication proposal confirmation is required');
 for(const field of ['rights','metadata','links','media'])
  if(input[field]!==true)throw Error('Missing owner editorial sign-off: '+field);
}
function safeSource(repo){
 if(typeof repo!=='string'||!REPO.test(repo)||repo.toLowerCase()==='tametheboardgame/davehub')throw Error('Expected one public creative repository under the known owner');
 return repo;
}
function viewsFrom(csv,fallback){
 if(csv===undefined||csv===null||csv==='')return[...fallback];
 if(typeof csv!=='string'||csv.length>180)throw Error('Invalid category override');
 const values=csv.split(',').map(x=>x.trim());
 if(!values.length||new Set(values).size!==values.length||!values.every(x=>VIEWS.has(x)))
  throw Error('Unknown, repeated or empty categories');
 return values;
}
function reviewDate(value){
 if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value)||!Number.isFinite(Date.parse(value)))throw Error('Invalid owner review date');
 return value;
}
function approved(date){
 return{status:'public_approved',approvedBy:'owner',approvedOn:reviewDate(date),
  rightsReviewed:true,metadataReviewed:true,linksReviewed:true,mediaReviewed:true};
}
function manifestLinks(m){
 const links=[];
 if(m.links.play)links.push({kind:'play',label:'Play the game',url:m.links.play});
 if(m.links.homepage)links.push({kind:'official',label:'Visit the official website',url:m.links.homepage});
 links.push({kind:'repository',label:'View the public repository',url:m.links.repository});
 return links;
}
function validateSourceManifest(m,source){
 const valid=validateManifest(m,source);
 if(!valid.valid||!valid.enabled)throw Error('Public source manifest is not enabled and valid: '+valid.errors.join('; '));
 if(!SLUG.test(m.id))throw Error('Invalid source ID');
 return m;
}
async function fetchSource(repo,fetcher=fetch,token=''){
 safeSource(repo);
 // API endpoint is derived exclusively from the fixed-owner allowlist, never
 // a user-supplied URL. Reject 3xx and private/archived/forked repos.
 const endpoint='https://api.github.com/repos/'+repo;
 const headers={'Accept':'application/vnd.github+json',
  'X-GitHub-Api-Version':'2022-11-28','User-Agent':'DaveHub-Editorial-Proposal/1.0',
  ...(token?{Authorization:'Bearer '+token}:{})};
 async function get(url){
  const r=await fetcher(url,{headers,redirect:'error',signal:AbortSignal.timeout(15000)});
  if(!r.ok)throw Error('GitHub source verification failed HTTP '+r.status);
  return r.json();
 }
 const meta=await get(endpoint);
 if(meta.private||meta.archived||meta.fork||meta.full_name!==repo||meta.owner?.login!==OWNER||meta.default_branch==null)
  throw Error('Only a verified public, active, owner-owned source may be proposed');
 const file=await get(endpoint+'/contents/davehub.json?ref='+encodeURIComponent(meta.default_branch));
 if(file.type!=='file'||file.encoding!=='base64'||typeof file.content!=='string')throw Error('Unsupported source manifest representation');
 const raw=Buffer.from(file.content.replace(/\s/g,''),'base64');
 if(raw.length>8192)throw Error('Source manifest too large');
 return validateSourceManifest(JSON.parse(raw.toString('utf8')),repo);
}
function updateCatalogue(current,m,input){
 requireOwner(input);
 const source=safeSource(input.sourceRepository);
 const baseline=validateCatalogue(current);
 if(!baseline.valid)throw Error('Refusing invalid baseline: '+baseline.errors.join('; '));
 const mode=input.mode;
 const old=current.items.find(x=>x.id===input.id);
 if(mode==='withdraw'){
  if(!old)throw Error('Cannot withdraw an absent project');
  if(!old.sources?.some(x=>x.url==='https://github.com/'+source))
   throw Error('Cannot withdraw a different project source');
  const items=current.items.filter(x=>x.id!==old.id);
  // A published related record cannot point at a removed record.
  if(items.some(x=>x.relations?.some(r=>r.targetId===old.id)))
   throw Error('Cannot withdraw an item still referenced by approved creations');
  const changed={schemaVersion:1,items};
  const chk=validateCatalogue(changed);
  if(!chk.valid)throw Error(chk.errors.join('; '));
  return changed;
 }
 m=validateSourceManifest(m,source);
 if(m.id!==input.id)throw Error('Published ID must exactly match the public source marker');
 if(mode==='publish'&&old)throw Error('Item is already published; use revise');
 if(mode==='revise'&&!old)throw Error('Cannot revise an unpublished project');
 if(old&&!old.sources?.some(x=>x.url==='https://github.com/'+source))
  throw Error('Existing item does not belong to this source');
 const synopsis=(input.synopsis||'').trim();
 if(!synopsis||synopsis.length>1400)throw Error('A reviewed public synopsis is required (up to 1400 characters)');
 const views=viewsFrom(input.categories,m.categories);
 if(views.includes('unfinished')&&!['permanently_shelved','abandoned'].includes(m.lifecycle))throw Error('The Unfinished Shelf is only for shelved work');
 const proposed=mode==='revise'
  ?{...old,synopsis,views,publication:approved(input.date)}
  :{id:m.id,slug:m.id,title:m.title,recordType:'work',workType:m.type,
    lifecycle:m.lifecycle,synopsis,views,
    sources:[{kind:'repository',url:m.links.repository}],
    links:manifestLinks(m),media:[],relations:[],publication:approved(input.date)};
 const items=mode==='revise'
  ? current.items.map(x=>x.id===old.id?proposed:x)
  : [...current.items,proposed];
 const changed={schemaVersion:1,items};
 const check=validateCatalogue(changed);
 if(!check.valid)throw Error('Proposed catalogue would be invalid: '+check.errors.join('; '));
 return changed;
}
function proposalSummary(before,after,input){
 const old=before.items.find(x=>x.id===input.id),now=after.items.find(x=>x.id===input.id);
 return{operation:input.mode,id:input.id,sourceRepository:input.sourceRepository,
  before:old?{title:old.title,views:old.views,synopsis:old.synopsis}:null,
  after:now?{title:now.title,views:now.views,synopsis:now.synopsis}:null,
  approvalDate:input.date,
  mergeRequired:true,publication:'PR review required; never auto-merged'};
}
async function main(){
 const mode=process.env.EDITORIAL_OPERATION;
 const input={
  mode,id:process.env.EDITORIAL_ID,sourceRepository:process.env.EDITORIAL_SOURCE,
  synopsis:process.env.EDITORIAL_SYNOPSIS,categories:process.env.EDITORIAL_CATEGORIES,
  confirmation:process.env.EDITORIAL_CONFIRMATION,date:process.env.EDITORIAL_DATE,
  rights:process.env.REVIEW_RIGHTS==='true',metadata:process.env.REVIEW_METADATA==='true',
  links:process.env.REVIEW_LINKS==='true',media:process.env.REVIEW_MEDIA==='true',
  actor:process.env.GITHUB_ACTOR,repository:process.env.GITHUB_REPOSITORY,ref:process.env.GITHUB_REF
 };
 requireOwner(input);
 safeSource(input.sourceRepository);
 if(!SLUG.test(input.id||''))throw Error('Invalid project ID');
 const manifest=mode==='withdraw'?null:await fetchSource(input.sourceRepository,fetch,process.env.GITHUB_TOKEN||'');
 const where=path.resolve('content/public/catalogue.json');
 const before=JSON.parse(fs.readFileSync(where,'utf8'));
 const after=updateCatalogue(before,manifest,input);
 if(JSON.stringify(before)===JSON.stringify(after))throw Error('Proposal has no changes');
 fs.writeFileSync(where,JSON.stringify(after,null,2)+'\n');
 const summary=proposalSummary(before,after,input);
 fs.writeFileSync('editorial-proposal-summary.json',JSON.stringify(summary,null,2)+'\n');
 console.log('Prepared '+mode+' PR for '+input.id+'; zero direct staging catalogue publication.');
}
if(require.main===module)main().catch(e=>{console.error('DH-10C publication proposal failed:',e.message);process.exitCode=1});
module.exports={requireOwner,safeSource,viewsFrom,reviewDate,validateSourceManifest,fetchSource,updateCatalogue,proposalSummary};
