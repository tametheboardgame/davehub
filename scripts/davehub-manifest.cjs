'use strict';
/* DH-10: source-repo opt-in manifest. The manifest is PUBLIC METADATA,
 * not a signed publication approval or permission to mirror assets.
 */
const VERSION=1;
const VIEWS=new Set(['projects','writing','games','experiments','music','unfinished','memory-lane']);
const TYPES=new Set(['book','script','musical','song','game','physical_build','software','idea','other']);
const LIFECYCLES=new Set(['idea','active','completed','permanently_shelved','abandoned']);
const ID=/^[a-z][a-z0-9-]{2,79}$/;
const ROOT=new Set(['schemaVersion','enabled','id','title','description','type','lifecycle','categories','links','tags','updates']);
const LINKS=new Set(['play','homepage','repository']);
const UPDATES=new Set(['proposeMilestones']);
function isObj(v){return !!v && typeof v==='object'&&!Array.isArray(v);}
function checkUrl(v){
 if(typeof v!=='string'||v.length>2048||/[\\\r\n\t]/.test(v))return false;
 try{
  const u=new URL(v);
  if(u.protocol!=='https:'||!u.hostname||u.username||u.password)return false;
  const host=u.hostname.toLowerCase().replace(/\.$/,'');
  if(!host.includes('.')||host==='localhost'||host.endsWith('.local')||host.endsWith('.internal')||host.endsWith('.localhost'))return false;
  if(host.includes(':')||/^\d+(?:\.\d+){3}$/.test(host))return false;
  return true;
 }catch{return false}
}
function validateManifest(m,repositoryName){
 const errors=[],fail=(key,msg)=>errors.push(key+': '+msg);
 if(!isObj(m))return {valid:false,enabled:false,errors:['manifest must be an object']};
 for(const key of Object.keys(m))if(!ROOT.has(key))fail(key,'unknown field');
 if(m.schemaVersion!==VERSION)fail('schemaVersion','expected 1');
 if(typeof m.enabled!=='boolean')fail('enabled','must be boolean');
 if(m.enabled===false){
  if(Object.keys(m).some(k=>!['schemaVersion','enabled'].includes(k)))fail('disabled','disabled manifest must be minimal; remove other fields');
  return {valid:errors.length===0,enabled:false,errors};
 }
 if(m.enabled!==true)return {valid:false,enabled:false,errors};
 if(!ID.test(m.id||''))fail('id','must be lower-case URL-safe unique identifier');
 if(typeof m.title!=='string'||!m.title.trim()||m.title.length>180)fail('title','required (max 180)');
 if(typeof m.description!=='string'||!m.description.trim()||m.description.length>500)fail('description','required (max 500)');
 if(!TYPES.has(m.type))fail('type','unknown creative type');
 if(!LIFECYCLES.has(m.lifecycle))fail('lifecycle','unknown lifecycle');
 if(!Array.isArray(m.categories)||m.categories.length<1||m.categories.length>7||new Set(m.categories).size!==m.categories.length||!m.categories.every(v=>VIEWS.has(v)))fail('categories','at least one unique recognised category required');
 if(Array.isArray(m.categories)&&m.categories.includes('unfinished')&&!['permanently_shelved','abandoned'].includes(m.lifecycle))fail('categories','unfinished requires permanently shelved or abandoned lifecycle');
 if(m.tags!==undefined&&(!Array.isArray(m.tags)||m.tags.length>8||new Set(m.tags).size!==m.tags.length||!m.tags.every(t=>typeof t==='string'&&/^[a-z0-9][a-z0-9 -]{0,39}$/.test(t))))fail('tags','up to eight short unique public-safe tags');
 if(!isObj(m.links))fail('links','must be an object');
 else{
  for(const [k,v] of Object.entries(m.links)){
   if(!LINKS.has(k))fail('links.'+k,'unknown link type');
   if(!checkUrl(v))fail('links.'+k,'safe public HTTPS URL required');
  }
  if(!checkUrl(m.links.repository))fail('links.repository','public GitHub source URL required');
  if(repositoryName&&m.links.repository!=='https://github.com/'+repositoryName)fail('links.repository','must match scanned source repo exactly');
 }
 if(m.updates!==undefined){
  if(!isObj(m.updates)||Object.keys(m.updates).some(k=>!UPDATES.has(k))||typeof m.updates.proposeMilestones!=='boolean')fail('updates','only boolean proposeMilestones supported');
 }
 return {valid:errors.length===0,enabled:true,errors};
}
function toReviewCandidate(m,source){
 const check=validateManifest(m,source);
 if(!check.valid||!check.enabled)throw Error('Manifest not enabled and valid: '+check.errors.join('; '));
 // NEVER copy a source-defined "approved" value: these are candidate
 // suggestions, never deployable public catalogue entries.
 return Object.freeze({
  id:m.id,slug:m.id,title:m.title,description:m.description,
  recordType:'work',workType:m.type,lifecycle:m.lifecycle,
  views:[...m.categories],tags:[...(m.tags||[])],
  links:{...m.links},sourceRepository:source,
  updateSuggestionsEnabled:m.updates?.proposeMilestones===true,
  reviewStatus:'needs_owner_review',
  published:false
 });
}
module.exports={validateManifest,toReviewCandidate,checkUrl};
