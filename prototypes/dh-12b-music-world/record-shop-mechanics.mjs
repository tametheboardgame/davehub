// DH-12B.1: real shop mechanics, no unpublished records or invented artist catalogue.
export const RACKS=Object.freeze([
 Object.freeze({id:'singles',name:'Songs & singles',subtitle:'One song at a time, eventually with its own sleeve.',colour:'#b47a70'}),
 Object.freeze({id:'bands',name:'Bands & music projects',subtitle:'Each act gets its own physical record and history.',colour:'#5b9294'}),
 Object.freeze({id:'albums',name:'Albums & EPs',subtitle:'Collections that deserve a complete shelf of their own.',colour:'#b0a375'})
]);
export function rackFor(id){return RACKS.find(x=>x.id===id)||null;}
export function shopDestination(id,aspect=16/9){
 const mobile=Number.isFinite(aspect)&&aspect<.8;
 const poses={
  whole:{position:[7.4,mobile?7.5:5.0,mobile?17.5:12.7],target:[0,mobile?1.05:2.1,-1.25]},
  singles:{position:[-3.0,3.5,mobile?10:6.45],target:[-3.1,1.65,-2.45]},
  bands:{position:[0,3.5,mobile?10:6.45],target:[0,1.65,-2.45]},
  albums:{position:[3.0,3.5,mobile?10:6.45],target:[3.1,1.65,-2.45]},
  listening:{position:[5.35,2.50,mobile?8.9:6.75],target:[3.45,.92,2.14]}
 };
 return poses[id]||poses.whole;
}
export function pullPosition(selected,id){
 return selected===id?1.00:0;
}
export function spinDisc(angle,playing,delta){
 return angle+(playing?2.3*Math.max(0,Math.min(.08,delta)):0);
}
export function motion(from,to,delta,speed=4){
 return from+(to-from)*(1-Math.exp(-speed*Math.max(0,Math.min(.08,delta))));
}
export function focusAction(current,id){
 if(!rackFor(id)&&id!=='listening')return null;
 return current===id?null:id;
}
