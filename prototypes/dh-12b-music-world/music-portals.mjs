// DH-12B: a real crossroads into distinct Music worlds.
// This is navigation architecture, not an auto-publishing content catalogue.
export const DOORS=Object.freeze([
 Object.freeze({
  id:'theatre',label:'The Impossible Theatre',category:'Musicals',
  description:'Productions, stories, characters and stage worlds.',
  route:'/previews/dh-12a/listening-room/',
  colour:'#a85c80',accent:'#f6d09a'
 }),
 Object.freeze({
  id:'records',label:'The Record Shop',category:'Songs & bands',
  description:'Singles, albums, bands and other musical projects.',
  route:'/previews/dh-12b/record-shop/',
  colour:'#558b89',accent:'#d5d6a1'
 })
]);
export const FOYER_ROUTE='/previews/dh-12b/music-foyer/';
export function doorFor(id){return DOORS.find(d=>d.id===id)||null;}
export function isLocalMusicRoute(route){
 return DOORS.some(d=>d.route===route)||route===FOYER_ROUTE;
}
export function nextDoorState(previous,id){
 if(!doorFor(id))throw Error('Unknown music-world doorway');
 const now=previous||null;
 return now===id?null:id;
}
export function doorAngle(open,side){
 if(side!=='left'&&side!=='right')throw Error('Unknown door side');
 if(!open)return 0;
 return (side==='left'?-1:1)*1.02;
}
export function approach(from,to,seconds,speed=3.8){
 const alpha=1-Math.exp(-Math.min(.08,Math.max(0,seconds))*speed);
 return from+(to-from)*alpha;
}
export function settled(a,b,epsilon=.028){
 return Array.isArray(a)&&Array.isArray(b)&&a.length===b.length&&
  a.every((v,i)=>Number.isFinite(v)&&Number.isFinite(b[i])&&
   Math.abs(v-b[i])<=epsilon);
}
