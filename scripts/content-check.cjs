'use strict';
/* DH-08: dependency-free, fail-closed verification of public creative catalogue.
 * This is a content gate, NOT cryptographic evidence of an owner's approval.
 * Git review and the human editorial decision remain mandatory.
 */
const RECORD_TYPES = new Set(['work','organisation','music_identity','release','artifact']);
const WORK_TYPES = new Set(['book','script','musical','song','game','physical_build','software','idea','other']);
const LIFECYCLES = new Set(['idea','active','completed','permanently_shelved','abandoned']);
const VIEWS = new Set(['projects','writing','games','experiments','music','unfinished','memory-lane']);
const RELATIONS = new Set(['part_of','contains','release_of','music_for','created_by','related_to','based_on','has_song','scene_of']);
const SOURCE_KINDS = new Set(['official','streaming','retailer','repository','archive','owner_attestation','other']);
const LINK_KINDS = new Set(['official','streaming','retailer','repository','read','play','other']);
const MEDIA_KINDS = new Set(['image','video','audio','document','excerpt','concept','other']);
const RIGHTS = new Set(['owned','licensed','permission_received']);
const ID = /^[a-z][a-z0-9-]{2,79}$/;
const YEAR = 1600;
const MAX_YEAR = 2200;

function safePublicUrl(value) {
  if (typeof value !== 'string' || value.length > 2048 || /[\\\r\n\t]/.test(value)) return false;
  try {
    const u = new URL(value);
    if (u.protocol !== 'https:' || !u.hostname || u.username || u.password) return false;
    const host = u.hostname.toLowerCase().replace(/\.$/, '');
    if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local') || host.endsWith('.internal')) return false;
    // Reject all IP-literal URLs, including IPv6, to avoid internal service links.
    if (host.includes(':') || /^\d+(?:\.\d+){3}$/.test(host)) return false;
    if (!host.includes('.')) return false;
    return true;
  } catch { return false; }
}

function validateCatalogue(data) {
  const errors = [];
  const fail = (place, detail) => errors.push(place + ': ' + detail);
  const isObj = x => !!x && typeof x === 'object' && !Array.isArray(x);
  const text = (v,max=2000) => typeof v === 'string' && v.trim().length > 0 && v.length <= max && !/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(v);
  if (!isObj(data) || data.schemaVersion !== 1 || !Array.isArray(data.items)) {
    return {valid:false, errors:['catalogue: require {schemaVersion:1, items:[]}'], count:0};
  }
  if (data.items.length > 1000) fail('items', 'maximum 1000 records');
  const ids = new Set(), slugs = new Set(), records = new Map();
  data.items.forEach((item,index)=>{
    const p='items['+index+']';
    if (!isObj(item)) { fail(p,'not an object'); return; }
    if (!ID.test(item.id || '')) fail(p+'.id','expected stable lowercase ID');
    else if(ids.has(item.id)) fail(p+'.id','duplicate ID');
    else { ids.add(item.id); records.set(item.id,item); }
    if (!ID.test(item.slug || '')) fail(p+'.slug','expected URL-safe slug');
    else if (slugs.has(item.slug)) fail(p+'.slug','duplicate slug');
    else slugs.add(item.slug);
    if (!text(item.title,180)) fail(p+'.title','required, max 180 characters');
    if (!RECORD_TYPES.has(item.recordType)) fail(p+'.recordType','unknown record type');
    if (item.recordType==='work' && !WORK_TYPES.has(item.workType)) fail(p+'.workType','required for creative works');
    if (!LIFECYCLES.has(item.lifecycle)) fail(p+'.lifecycle','unknown lifecycle');
    if (!text(item.synopsis,1400)) fail(p+'.synopsis','public-approved synopsis required (max 1400 characters)');
    if (!Array.isArray(item.views) || !item.views.length || item.views.length>7 || new Set(item.views).size!==item.views.length || !item.views.every(v=>VIEWS.has(v))) fail(p+'.views','unique recognised discovery views required');
    if (Array.isArray(item.views) && item.views.includes('unfinished') && !['permanently_shelved','abandoned'].includes(item.lifecycle)) fail(p+'.views','unfinished must be permanently shelved or abandoned');
    if (item.period !== undefined) {
      if (!isObj(item.period)) fail(p+'.period','expected object');
      else {
        const {fromYear,toYear,approximate}=item.period;
        if (fromYear!==undefined && (!Number.isInteger(fromYear)||fromYear<YEAR||fromYear>MAX_YEAR)) fail(p+'.period.fromYear','invalid year');
        if (toYear!==undefined && (!Number.isInteger(toYear)||toYear<YEAR||toYear>MAX_YEAR)) fail(p+'.period.toYear','invalid year');
        if (Number.isInteger(fromYear)&&Number.isInteger(toYear)&&fromYear>toYear) fail(p+'.period','date range reversed');
        if (approximate!==undefined && typeof approximate!=='boolean') fail(p+'.period.approximate','expected boolean');
      }
    }
    const a=item.publication;
    if (!isObj(a)||a.status!=='public_approved'||a.approvedBy!=='owner'||!/^\d{4}-\d{2}-\d{2}$/.test(a.approvedOn||'')||
        !Number.isFinite(Date.parse(a.approvedOn))||
        a.rightsReviewed!==true||a.metadataReviewed!==true||a.mediaReviewed!==true||a.linksReviewed!==true) {
      fail(p+'.publication','must include explicit owner approval, a valid date, and all four review gates');
    }
    if (!Array.isArray(item.sources)||!item.sources.length) fail(p+'.sources','at least one provenance source required');
    else item.sources.forEach((source,i)=>{
      const sp=p+'.sources['+i+']';
      if (!isObj(source)||!SOURCE_KINDS.has(source.kind)) {fail(sp,'invalid source');return;}
      if (source.kind==='owner_attestation') {
        if (source.url!==undefined) fail(sp+'.url','owner attestation must not include a public link');
      } else if (!safePublicUrl(source.url)) fail(sp+'.url','require safe public HTTPS link');
    });
    if (!Array.isArray(item.links)) fail(p+'.links','expected links array (empty is allowed)');
    else item.links.forEach((link,i)=>{
      if (!isObj(link)||!text(link.label,100)||!LINK_KINDS.has(link.kind)||!safePublicUrl(link.url)) fail(p+'.links['+i+']','invalid public link');
    });
    if (!Array.isArray(item.media)) fail(p+'.media','expected media array (empty is allowed)');
    else item.media.forEach((media,i)=>{
      const mp=p+'.media['+i+']';
      if (!isObj(media)||!ID.test(media.id||'')||!text(media.title,160)||!MEDIA_KINDS.has(media.kind)||!RIGHTS.has(media.rights)||
          media.approval!=='public_approved'||!safePublicUrl(media.url)) fail(mp,'media requires ID, type, title, approved rights and a safe HTTPS URL');
    });
    if (!Array.isArray(item.relations)) fail(p+'.relations','expected relations array (empty is allowed)');
    else item.relations.forEach((rel,i)=>{
      if (!isObj(rel)||!RELATIONS.has(rel.kind)||!ID.test(rel.targetId||'')) fail(p+'.relations['+i+']','invalid relation');
    });
  });
  data.items.forEach((item,index)=>{
    if (!isObj(item)||!Array.isArray(item.relations))return;
    item.relations.forEach((r,i)=>{
      if (!isObj(r))return;
      if (r.targetId===item.id) fail('items['+index+'].relations['+i+']','self-reference');
      else if (typeof r.targetId==='string'&&!records.has(r.targetId)) fail('items['+index+'].relations['+i+']','target not present in public catalogue');
    });
  });
  return {valid:errors.length===0,errors,count:data.items.length};
}
module.exports={validateCatalogue,safePublicUrl};
if (require.main === module) {
  const fs=require('node:fs');
  const path=process.argv[2];
  if (!path) { console.error('Usage: node scripts/content-check.cjs path/to/public-catalogue.json');process.exit(2); }
  try {
    const d=JSON.parse(fs.readFileSync(path,'utf8'));
    const r=validateCatalogue(d);
    if (!r.valid) { for(const error of r.errors)console.error('FAIL '+error);process.exit(1); }
    console.log('PASS public catalogue validated ('+r.count+' items)');
  } catch(e) { console.error('FAIL catalogue unreadable: '+e.message);process.exit(1); }
}
