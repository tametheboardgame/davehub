'use strict';
/* DH-10D: create every managed new repository with an opt-out marker in
 * its FIRST commit. Requires local git and an authenticated GitHub CLI.
 * Never turns on DaveHub or accesses any existing repository content.
 */
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const OWNER='tametheboardgame';
const NAME=/^[A-Za-z0-9_.-]{1,100}$/;
const MARKER=JSON.stringify({schemaVersion:1,enabled:false},null,2)+'\n';

function parseArgs(args){
 if(args.length===1&&['--help','-h'].includes(args[0]))return{help:true};
 const repair=args[0]==='--repair',name=args[repair?1:0];
 if(typeof name!=='string'||!NAME.test(name)||name==='.'||name==='..'||name.endsWith('.git')||name.startsWith('-'))throw Error('Provide a valid repository name (not a URL or owner/name).');
 const extra=args.slice(repair?2:1);
 let visibility='private',explicitVisibility=false,description='';
 if(repair&&extra.length)throw Error('--repair accepts only an existing repository name.');
 for(let i=0;i<extra.length;i++){
  const arg=extra[i];
  if(arg==='--private'||arg==='--public'){
   if(explicitVisibility)throw Error('Specify one visibility option at most.');
   visibility=arg.slice(2);explicitVisibility=true;
  }else if(arg==='--description'){
   description=extra[++i];
   if(typeof description!=='string'||description.length>160||/[\r\n]/.test(description))throw Error('Description must be a single line of 160 characters or fewer.');
  }else throw Error('Unknown option: '+arg);
 }
 return{repair,name,visibility,description};
}
function run(command,args,options={}){
 return execFileSync(command,args,{encoding:'utf8',stdio:options.capture?'pipe':'inherit'});
}
function ensureOwner(runFn=run){
 const actual=String(runFn('gh',['api','user','--jq','.login'],{capture:true})).trim();
 if(actual.toLowerCase()!==OWNER.toLowerCase())throw Error('GitHub CLI must be authenticated as '+OWNER+' (currently '+actual+').');
}
function execute(options,runFn=run){
 if(options.help){console.log('Create: node scripts/davehub-new-repo.cjs NAME [--private|--public] [--description TEXT]\nRepair existing: node scripts/davehub-new-repo.cjs --repair NAME\nNew repositories default to PRIVATE and all markers default to enabled:false.');return}
 ensureOwner(runFn);
 const full=OWNER+'/'+options.name;
 if(options.repair){
  // Contents API without a SHA creates a file only if it does not exist.
  // It refuses to overwrite any existing marker, including enabled:true.
  runFn('gh',['api','--method','PUT','repos/'+full+'/contents/davehub.json',
   '-f','message=chore: initialise DaveHub opt-out marker',
   '-f','content='+Buffer.from(MARKER).toString('base64')]);
  console.log('Added disabled DaveHub marker to '+full);
  return;
 }
 const folder=fs.mkdtempSync(path.join(os.tmpdir(),'davehub-new-repo-'));
 let created=false;
 try{
  fs.writeFileSync(path.join(folder,'README.md'),'# '+options.name+'\n',{flag:'wx',mode:0o600});
  fs.writeFileSync(path.join(folder,'davehub.json'),MARKER,{flag:'wx',mode:0o600});
  runFn('git',['init','-b','main',folder]);
  runFn('git',['-C',folder,'add','README.md','davehub.json']);
  runFn('git',['-C',folder,'commit','-m','chore: initialise repository with DaveHub disabled']);
  const args=['repo','create',full,'--'+options.visibility,'--source',folder,'--remote','origin','--push'];
  if(options.description)args.push('--description',options.description);
  runFn('gh',args);
  created=true;
  console.log('Created '+full+' with davehub.json enabled:false in its first commit.');
 }finally{
  if(created)fs.rmSync(folder,{recursive:true,force:true});
  else console.error('Repository not confirmed created. Local initial commit retained at: '+folder);
 }
}
module.exports={parseArgs,execute,ensureOwner,MARKER,OWNER};
if(require.main===module){
 try{execute(parseArgs(process.argv.slice(2)))}
 catch(error){console.error('DaveHub bootstrap failed: '+error.message);process.exitCode=1}
}
