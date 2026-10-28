'use strict';
/* DH-10: read PUBLIC GitHub repositories and opt-in manifests. The discovery
 * report is review input ONLY; never alters DaveHub public catalogue.
 */
const fs=require('node:fs');
const path=require('node:path');
const {validateManifest,toReviewCandidate}=require('./davehub-manifest.cjs');
const OWNER=/^[a-zA-Z0-9-]{1,39}$/;
const DEFAULT_OWNER='tametheboardgame';
async function getJson(fetchFn,url,token){
 const headers={'Accept':'application/vnd.github+json','User-Agent':'davehub-readonly-discovery','X-GitHub-Api-Version':'2022-11-28'};
 if(token)headers.Authorization='Bearer '+token;
 const response=await fetchFn(url,{headers,redirect:'error'});
 if(response.status===404)return null;
 if(!response.ok)throw Error('GitHub request failed '+response.status+' at '+new URL(url).pathname);
 return response.json();
}
async function discover({owner=DEFAULT_OWNER,fetchFn=fetch,token='',maxPages=5}={}){
 if(!OWNER.test(owner))throw Error('Invalid repository owner');
 if(!Number.isInteger(maxPages)||maxPages<1||maxPages>10)throw Error('Invalid maximum pages');
 const repositories=[];
 for(let page=1;page<=maxPages;page++){
  const url='https://api.github.com/users/'+owner+'/repos?per_page=100&page='+page+'&type=owner';
  const batch=await getJson(fetchFn,url,token);
  if(!Array.isArray(batch))throw Error('GitHub repository list missing');
  repositories.push(...batch.filter(r=>r&&!r.private&&!r.archived&&!r.fork&&r.owner?.login?.toLowerCase()===owner.toLowerCase()));
  if(batch.length<100)break;
 }
 const seen=new Set(),details=[],candidates=[];
 for(const r of repositories){
  const repo=r.name;
  if(typeof repo!=='string'||!/^[a-zA-Z0-9_.-]{1,100}$/.test(repo)||seen.has(repo))continue;
  seen.add(repo);
  const source=owner+'/'+repo;
  const endpoint='https://api.github.com/repos/'+encodeURIComponent(owner)+'/'+encodeURIComponent(repo)+'/contents/davehub.json?ref='+encodeURIComponent(r.default_branch||'main');
  let content;
  try{content=await getJson(fetchFn,endpoint,token)}
  catch(e){details.push({repository:source,status:'fetch_error',errors:[e.message]});continue}
  if(content===null){details.push({repository:source,status:'absent'});continue}
  if(content.type!=='file'||content.encoding!=='base64'||typeof content.content!=='string'){
   details.push({repository:source,status:'invalid',errors:['manifest file encoding unexpected']});continue
  }
  let manifest;
  try{
   const raw=Buffer.from(content.content.replace(/\s/g,''),'base64');
   if(raw.length>8192)throw Error('manifest exceeds 8 KiB');
   manifest=JSON.parse(raw.toString('utf8'));
  }catch(e){details.push({repository:source,status:'invalid',errors:[e.message]});continue}
  const check=validateManifest(manifest,source);
  if(!check.valid){details.push({repository:source,status:'invalid',errors:check.errors});continue}
  if(!check.enabled){details.push({repository:source,status:'disabled'});continue}
  const candidate=toReviewCandidate(manifest,source);
  details.push({repository:source,status:'enabled',id:candidate.id});
  candidates.push(candidate);
 }
 // Prevent two different repositories claiming the same canonical DaveHub ID.
 const ids=new Set();
 for(const candidate of candidates){
  if(ids.has(candidate.id)){
   details.find(x=>x.repository===candidate.sourceRepository).status='invalid';
   details.find(x=>x.repository===candidate.sourceRepository).errors=['duplicate DaveHub id: '+candidate.id];
  }
  ids.add(candidate.id);
 }
 return {
  schemaVersion:1,
  generatedBy:'DH-10 read-only GitHub manifest discovery',
  owner,
  mode:'candidate_review_only',
  repositories:details.sort((a,b)=>a.repository.localeCompare(b.repository)),
  candidates:candidates.filter(c=>details.find(x=>x.repository===c.sourceRepository)?.status==='enabled'),
  counts:{
   scanned:details.length,
   enabled:details.filter(x=>x.status==='enabled').length,
   disabled:details.filter(x=>x.status==='disabled'||x.status==='absent').length,
   errors:details.filter(x=>x.status==='invalid'||x.status==='fetch_error').length
  }
 };
}
module.exports={discover,getJson};
if(require.main===module){
 const argv=process.argv.slice(2),arg=name=>{const i=argv.indexOf(name);return i<0?null:argv[i+1]};
 const owner=arg('--owner')||DEFAULT_OWNER;
 const out=arg('--out');
 if(!out)throw Error('Usage: node scripts/davehub-discover.cjs --owner tametheboardgame --out path/to/report.json');
 discover({owner,token:process.env.GITHUB_TOKEN||''}).then(report=>{
  fs.mkdirSync(path.dirname(path.resolve(out)),{recursive:true});
  fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n',{flag:'w',mode:0o600});
  console.log('Discovered '+report.counts.enabled+' enabled, '+report.counts.disabled+' not opted-in, '+report.counts.errors+' errors across '+report.counts.scanned+' public repos.');
  if(report.counts.errors)process.exitCode=1;
 }).catch(e=>{console.error(e.message);process.exitCode=1});
}
