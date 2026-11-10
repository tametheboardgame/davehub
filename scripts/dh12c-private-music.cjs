'use strict';
// DH-12C.2: allowlisted, read-only private music source discovery.
// Never write private source catalogues into public DaveHub outputs.
const OWNER='tametheboardgame';
const REPOSITORIES=Object.freeze([
 'berserk-llama-syndrome','residualreflection','when-victory-falls',
 'form-and-focus','music-archive','the-iron-road','vegan-the-musical'
]);
const TYPES=new Set(['album','ep','single','other']);
const WORLDS=new Set(['record-shop','theatre']);
const ID=/^[a-z][a-z0-9-]{2,79}$/;
function fail(s){throw Error('DH-12C private music: '+s);}
function parseFile(p){
 if(!p||p.type!=='file'||p.encoding!=='base64'||typeof p.content!=='string')
  fail('unexpected GitHub response');
 const b=Buffer.from(p.content.replace(/\s/g,''),'base64');
 if(b.length===0||b.length>131072)fail('file outside size bounds');
 try{return JSON.parse(b.toString('utf8'));}catch{fail('invalid source JSON');}
}
function validateProject(repo,marker,data){
 if(!REPOSITORIES.includes(repo))fail('repository not allowlisted');
 if(!marker||marker.schemaVersion!==1||typeof marker.enabled!=='boolean')
  fail(repo+' invalid marker');
 if(!data||data.schemaVersion!==1||data.project?.id!==repo||
  typeof data.project.name!=='string'||!data.project.name.trim()||
  data.project.name.length>180||!WORLDS.has(data.project.world)||
  typeof data.publication?.davehubReady!=='boolean'||
  !Array.isArray(data.releases)||data.releases.length>60||
  !Array.isArray(data.looseTracks)||data.looseTracks.length>150)
  fail(repo+' invalid catalogue');
 const ids=new Set();
 for(const item of [...data.releases,...data.looseTracks]){
  if(!item||!ID.test(item.id||'')||ids.has(item.id)||
   typeof item.title!=='string'||!item.title.trim()||item.title.length>180)
   fail(repo+' invalid or duplicate work');
  ids.add(item.id);
 }
 for(const r of data.releases){
  if(!TYPES.has(r.type)||
   !['existing_release','scheduled','concept','unverified'].includes(r.status))
   fail(repo+' invalid release type or status');
  if(!Array.isArray(r.tracks)||r.tracks.length>100)
   fail(repo+' invalid tracklist');
  if(r.plannedReleaseDate!==undefined&&
   !/^\d{4}-\d{2}-\d{2}$/.test(r.plannedReleaseDate))
   fail(repo+' invalid release date');
 }
 // Deliberately discard source docs, media links, lyrics, audio and track titles.
 return {repository:repo,markerEnabled:marker.enabled,
  publication:{status:data.publication.status,davehubReady:data.publication.davehubReady},
  project:{id:repo,name:data.project.name,world:data.project.world},
  releases:data.releases.map(r=>({id:r.id,title:r.title,type:r.type,status:r.status,
   ...(r.plannedReleaseDate?{plannedReleaseDate:r.plannedReleaseDate}:{}),
   trackCount:r.tracks.length})),
  looseTrackCount:data.looseTracks.length};
}
async function getFile(repo,path,token,fetchFn){
 const url='https://api.github.com/repos/'+OWNER+'/'+repo+'/contents/'+path+'?ref=main';
 const response=await fetchFn(url,{method:'GET',redirect:'error',headers:{
  Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28',
  Authorization:'Bearer '+token,'User-Agent':'davehub-private-music-readonly'
 }});
 if(response?.status!==200)fail('unable to read '+repo+' ('+(response?.status||'network')+')');
 return parseFile(await response.json());
}
async function readPrivateMusic({token,fetchFn=fetch,repositories=REPOSITORIES}={}){
 if(typeof token!=='string'||!token.trim())fail('DAVEHUB_MUSIC_READ_TOKEN not configured');
 if(!Array.isArray(repositories)||new Set(repositories).size!==repositories.length||
  repositories.some(r=>!REPOSITORIES.includes(r)))fail('repository selection not allowlisted');
 const projects=[];
 for(const repo of repositories){
  const marker=await getFile(repo,'davehub.json',token,fetchFn);
  const data=await getFile(repo,'catalogue/project.json',token,fetchFn);
  projects.push(validateProject(repo,marker,data));
 }
 return Object.freeze({schemaVersion:1,mode:'private_review_only',projects});
}
function publicProjection(review,ledger){
 if(review?.mode!=='private_review_only'||review.schemaVersion!==1||
  !Array.isArray(review.projects)||ledger?.schemaVersion!==1||
  !Array.isArray(ledger.approvals))fail('invalid approval input');
 const records=[],approvals=new Map();
 for(const a of ledger.approvals){
  if(!a||typeof a.repository!=='string'||typeof a.releaseId!=='string')
   fail('invalid approval reference');
  const key=a.repository+'/'+a.releaseId;
  if(approvals.has(key))fail('duplicate approval');
  approvals.set(key,a);
 }
 for(const p of review.projects){
  if(!p.markerEnabled||p.publication.status!=='public_approved'||
   p.publication.davehubReady!==true)continue;
  for(const r of p.releases){
   const a=approvals.get(p.repository+'/'+r.id);
   if(!a||a.approvedBy!=='owner'||
    !/^\d{4}-\d{2}-\d{2}$/.test(a.approvedOn||'')||
    a.rightsReviewed!==true||a.metadataReviewed!==true||
    a.linksReviewed!==true||a.mediaReviewed!==true||
    !['existing_release','scheduled'].includes(r.status))continue;
   records.push({id:p.repository+'/'+r.id,artist:p.project.name,
    artistId:p.repository,title:r.title,type:r.type,status:r.status,
    ...(r.status==='scheduled'&&r.plannedReleaseDate?{plannedReleaseDate:r.plannedReleaseDate}:{})});
  }
 }
 return {schemaVersion:1,records};
}
module.exports={REPOSITORIES,parseFile,validateProject,readPrivateMusic,publicProjection};
if(require.main===module){
 if(process.argv[2]!=='--check')fail('only --check is supported; public export requires separate review');
 readPrivateMusic({token:process.env.DAVEHUB_MUSIC_READ_TOKEN})
  .then(d=>process.stdout.write('Validated '+d.projects.length+
   ' private music repositories. No data published.\n'))
  .catch(e=>{process.stderr.write(e.message+'\n');process.exitCode=1;});
}
