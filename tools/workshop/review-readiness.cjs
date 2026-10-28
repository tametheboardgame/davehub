'use strict';
const {firstWave}=require('./first-wave.cjs');
const CHECKS=['rights','metadata','links','media'];
const LABELS={
 rights:'Rights and contributors have not been signed off',
 metadata:'Title and synopsis have not been signed off',
 links:'Destination links need manual browser verification',
 media:'Media and likeness rights have not been signed off'
};
function readiness(store){
 if(!store||!Array.isArray(store.candidates))throw Error('Invalid local candidate store');
 const list=firstWave.map(seed=>{
  const c=store.candidates.find(x=>x.id===seed.id);
  if(!c)return{id:seed.id,title:seed.title,present:false,slug:seed.slug,checked:0,
   stage:'not_prepared',openChecks:['Not yet prepared in this local Workshop'],readyForProposal:false};
  const issues=[];
  if(!String(c.synopsis||'').trim())issues.push('Public-facing description is missing');
  if(!String(c.sourceUrl||'').trim())issues.push('Provenance source is missing');
  if(!String(c.linkUrl||'').trim())issues.push('Public destination link is missing');
  for(const key of CHECKS)if(c.review?.[key]!==true)issues.push(LABELS[key]);
  if(c.ownerApproved!==true)issues.push('Final owner sign-off has not been granted');
  if(c.status!=='approved_for_export')issues.push('Editorial stage is not Approved for export');
  if(!c.approvedOn)issues.push('No owner-approved date recorded');
  return{id:seed.id,title:c.title,present:true,slug:c.slug,checked:CHECKS.filter(k=>c.review?.[k]===true).length,
   stage:c.status,openChecks:issues,readyForProposal:issues.length===0};
 });
 return{schemaVersion:1,mode:'private_editorial_review',total:list.length,
  prepared:list.filter(x=>x.present).length,readyForProposal:list.filter(x=>x.readyForProposal).length,items:list};
}
module.exports={readiness,CHECKS};
