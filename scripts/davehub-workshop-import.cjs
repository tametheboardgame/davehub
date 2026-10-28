'use strict';
/* DH-10: convert read-only scanner results to DH-08C private Content Workshop
 * import format. Nothing is published and all approval flags are reset.
 */
const fs=require('node:fs');
function toWorkshopImport(report){
 if(!report||report.schemaVersion!==1||report.mode!=='candidate_review_only'||!Array.isArray(report.candidates))throw Error('Invalid read-only discovery report');
 if(report.candidates.length>250)throw Error('Too many candidates');
 const seen=new Set();
 const candidates=report.candidates.map(item=>{
  if(!item||item.reviewStatus!=='needs_owner_review'||item.published!==false||typeof item.id!=='string')throw Error('Candidate missing private-review gate');
  if(seen.has(item.id))throw Error('Duplicate ID: '+item.id);seen.add(item.id);
  const source=item.links?.repository;
  if(typeof source!=='string'||source!=='https://github.com/'+item.sourceRepository)throw Error('Candidate missing linked source repository');
  const link=item.links.play||item.links.homepage||item.links.repository;
  return{
   id:item.id,slug:item.slug,title:item.title,workType:item.workType,
   lifecycle:item.lifecycle,views:[...item.views],synopsis:item.description,
   sourceUrl:source,sourceKind:'repository',
   linkUrl:link,linkLabel:item.links.play?'Play the game':item.links.homepage?'Visit the website':'View source repository',
   status:'needs_review',notes:'',review:{rights:false,metadata:false,links:false,media:false},
   ownerApproved:false,approvedOn:''
  };
 });
 return{schemaVersion:1,candidates};
}
module.exports={toWorkshopImport};
if(require.main===module){
 const [src,out]=process.argv.slice(2);
 if(!src||!out)throw Error('Usage: node scripts/davehub-workshop-import.cjs discovery.json workshop-import.json');
 const report=JSON.parse(fs.readFileSync(src,'utf8'));
 const prepared=toWorkshopImport(report);
 fs.writeFileSync(out,JSON.stringify(prepared,null,2)+'\n',{mode:0o600});
 console.log('Prepared '+prepared.candidates.length+' private-workshop candidates. All require individual owner review.');
}
