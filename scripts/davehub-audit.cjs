'use strict';
/* DH-10D: fail the weekly/manual discovery check when a NEW public
 * repository lacks davehub.json. Legacy repositories are grandfathered.
 * The scanner remains read-only and never reveals private repo metadata.
 */
const fs=require('node:fs');
const CUTOFF='2026-10-28T13:08:00Z';
function audit(report,cutoff=CUTOFF){
 if(!report||report.schemaVersion!==1||report.mode!=='candidate_review_only'||!Array.isArray(report.repositories))throw Error('Invalid DaveHub discovery report');
 const threshold=Date.parse(cutoff);
 if(!Number.isFinite(threshold))throw Error('Invalid audit cutoff');
 const missing=report.repositories.filter(r=>r&&r.status==='absent'&&typeof r.createdAt==='string'&&Number.isFinite(Date.parse(r.createdAt))&&Date.parse(r.createdAt)>=threshold);
 return{scanned:report.repositories.length,missing,cutoff};
}
function run(report){
 const result=audit(report);
 console.log('DH-10D new-repository audit: '+result.missing.length+' newly created public repositories without davehub.json.');
 for(const entry of result.missing){
  const warning=entry.repository+': missing root davehub.json; add {schemaVersion:1,enabled:false}.';
  console.error('::error title=Missing DaveHub opt-out marker::'+warning);
 }
 if(result.missing.length)process.exitCode=1;
 return result;
}
module.exports={audit,run,CUTOFF};
if(require.main===module){
 try{
  const source=process.argv[2];
  if(!source||process.argv.length!==3)throw Error('Usage: node scripts/davehub-audit.cjs reports/davehub-discovery.json');
  run(JSON.parse(fs.readFileSync(source,'utf8')));
 }catch(error){console.error(error.message);process.exitCode=1}
}
