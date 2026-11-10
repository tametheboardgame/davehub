'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const path=require('node:path'),fs=require('node:fs'),{pathToFileURL}=require('node:url');
const {REPOSITORIES,parseFile,validateProject,readPrivateMusic,publicProjection}=
 require('../scripts/dh12c-private-music.cjs');
const client=import(pathToFileURL(path.join(__dirname,'../prototypes/dh-12b-music-world/approved-catalogue-client.mjs')).href);
const file=x=>({type:'file',encoding:'base64',content:Buffer.from(JSON.stringify(x)).toString('base64')});
const data={schemaVersion:1,project:{id:'when-victory-falls',name:'When Victory Falls',world:'record-shop'},
 publication:{status:'not_approved',davehubReady:false},
 releases:[{id:'spaced',title:'Spaced',type:'single',status:'existing_release',tracks:[{number:1,title:'Spaced'}]}],
 looseTracks:[]};
const marker={schemaVersion:1,enabled:false};
test('exactly seven verified repositories are allowlisted',()=>{
 assert.equal(REPOSITORIES.length,7);
 for(const name of ['berserk-llama-syndrome','form-and-focus','vegan-the-musical'])
  assert.ok(REPOSITORIES.includes(name));
});
test('private importer returns only bounded review metadata and refuses invalid sources',()=>{
 const p=validateProject('when-victory-falls',marker,{...data,sourceDocuments:[{url:'https://private.test/secret'}]});
 assert.equal(p.releases[0].title,'Spaced');
 assert.equal(p.markerEnabled,false);
 assert.ok(!JSON.stringify(p).includes('private.test'));
 assert.throws(()=>validateProject('other',marker,data),/allowlisted/);
 assert.throws(()=>validateProject('when-victory-falls',marker,{...data,project:{...data.project,id:'other'}}),/invalid catalogue/);
 assert.throws(()=>validateProject('when-victory-falls',marker,{...data,releases:[data.releases[0],data.releases[0]]}),/duplicate/);
 assert.throws(()=>validateProject('when-victory-falls',marker,{...data,releases:[{...data.releases[0],type:'bad'}]}),/release type/);
 assert.throws(()=>parseFile({type:'file',encoding:'utf-8',content:'{}'}),/unexpected/);
});
test('read requires a private token and refuses unlisted repos or HTTP errors',async()=>{
 await assert.rejects(readPrivateMusic({token:''}),/not configured/);
 await assert.rejects(readPrivateMusic({token:'x',repositories:['evil'],fetchFn:async()=>{throw Error('must not reach');}}),/not allowlisted/);
 const requests=[];
 const fetchFn=async(url,options)=>{
  requests.push([url,options]);
  return {status:200,json:async()=>file(url.includes('davehub.json')?marker:data)};
 };
 const result=await readPrivateMusic({token:'synthetic-test-token',repositories:['when-victory-falls'],fetchFn});
 assert.equal(result.mode,'private_review_only');
 assert.equal(result.projects.length,1);
 assert.equal(requests.length,2);
 assert.ok(requests.every(([url,options])=>
  url.startsWith('https://api.github.com/repos/tametheboardgame/when-victory-falls/contents/')&&
  options.redirect==='error'&&
  options.headers.Authorization==='Bearer synthetic-test-token'));
 await assert.rejects(readPrivateMusic({token:'x',repositories:['when-victory-falls'],
  fetchFn:async()=>({status:403})}),/unable to read/);
});
test('both source approval and separate owner review are mandatory',()=>{
 const project=validateProject('when-victory-falls',marker,data);
 const review={schemaVersion:1,mode:'private_review_only',projects:[project]};
 const approved={repository:'when-victory-falls',releaseId:'spaced',approvedBy:'owner',
  approvedOn:'2026-11-10',rightsReviewed:true,metadataReviewed:true,linksReviewed:true,mediaReviewed:true};
 const ledger={schemaVersion:1,approvals:[approved]};
 assert.deepEqual(publicProjection(review,ledger),{schemaVersion:1,records:[]});
 const enabled={...review,projects:[{...project,markerEnabled:true}]};
 assert.deepEqual(publicProjection(enabled,ledger).records,[]);
 const ready={...enabled,projects:[{...enabled.projects[0],publication:{status:'public_approved',davehubReady:true}}]};
 assert.deepEqual(publicProjection(ready,{schemaVersion:1,approvals:[]}).records,[]);
 const published=publicProjection(ready,ledger);
 assert.deepEqual(published.records,[{id:'when-victory-falls/spaced',artist:'When Victory Falls',
  artistId:'when-victory-falls',title:'Spaced',type:'single',status:'existing_release'}]);
 assert.deepEqual(publicProjection(ready,{schemaVersion:1,approvals:[{...approved,rightsReviewed:false}]}).records,[]);
 assert.throws(()=>publicProjection(ready,{schemaVersion:1,approvals:[approved,approved]}),/duplicate/);
});
test('browser parses only valid approved projections, with category filtering',async()=>{
 const c=await client;
 assert.deepEqual(c.parseApprovedCatalogue({schemaVersion:1,records:[]}),[]);
 const duplicate={id:'test/album',artist:'Test',title:'Album',type:'album',status:'existing_release'};
 assert.deepEqual(c.parseApprovedCatalogue({schemaVersion:1,records:[duplicate,duplicate]}),[]);
 const records=c.parseApprovedCatalogue({schemaVersion:1,records:[
  duplicate,{id:'test/song',artist:'Test',title:'Song',type:'single',status:'existing_release'}
 ]});
 assert.equal(c.recordsForRack(records,'albums').length,1);
 assert.equal(c.recordsForRack(records,'singles').length,1);
 assert.equal(c.recordsForRack(records,'bands').length,1);
 assert.equal(c.recordsForRack(records,'none').length,0);
});
test('checked-in public projection and independent owner ledger are empty',()=>{
 const root=path.resolve(__dirname,'..');
 assert.deepEqual(JSON.parse(fs.readFileSync(path.join(root,'content/music-publication-approvals.json'),'utf8')),
  {schemaVersion:1,approvals:[]});
 assert.deepEqual(JSON.parse(fs.readFileSync(path.join(root,'prototypes/dh-12b-music-world/approved-catalogue.json'),'utf8')),
  {schemaVersion:1,records:[]});
});
