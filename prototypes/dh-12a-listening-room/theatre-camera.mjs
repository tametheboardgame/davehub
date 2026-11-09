// DH-12A.2: actual camera poses for the three physical theatre mechanisms.
// One shared PerspectiveCamera travels between these poses. No scene swap.
const FOV_DEGREES=43;
const RAD=Math.PI/180;
export const FOCUS_NAMES=Object.freeze({
 curtains:'Velvet curtains',act:'Revolving stage',record:'Record player'
});
const POSES=Object.freeze({
 overview:Object.freeze({
  position:Object.freeze([8,6,12.5]),
  target:Object.freeze([0,2.06,-.15]),
  width:10.5
 }),
 curtains:Object.freeze({
  position:Object.freeze([2.9,4.05,9.0]),
  target:Object.freeze([-.55,2.42,1.18]),
  width:7.4
 }),
 act:Object.freeze({
  position:Object.freeze([2.85,3.7,6.35]),
  target:Object.freeze([-.65,1.78,.3]),
  width:5.9
 }),
 record:Object.freeze({
  position:Object.freeze([5.25,2.68,5.52]),
  target:Object.freeze([3.22,1.17,2.42]),
  width:1.85
 })
});
export const CAMERA_MODES=Object.freeze(Object.keys(POSES));
export function normalizeFocus(mode){
 return Object.prototype.hasOwnProperty.call(FOCUS_NAMES,mode)?mode:null;
}
export function cameraPose(mode,aspect=16/9,height=800){
 const id=normalizeFocus(mode)||'overview';
 const base=POSES[id];
 const ratio=Number.isFinite(aspect)?Math.min(3.5,Math.max(.35,aspect)):16/9;
 const availableHeight=Number.isFinite(height)?Math.max(250,height):800;
 // Narrow canvases must fit the actual 3D mechanism in horizontal FOV,
 // not blindly use desktop zooms which clip both curtain rails or stage wings.
 const desiredWidth=base.width*(id==='record'?1.22:1.14);
 const minDistance=desiredWidth/(2*Math.tan(FOV_DEGREES*RAD/2)*ratio);
 const distance=Math.hypot(...base.position.map((v,i)=>v-base.target[i]));
 const shortScreen=availableHeight<620?1.14:1;
 const scale=Math.max(1,minDistance/distance)*shortScreen;
 const target=[...base.target];
 // On mobile, the action controls occupy the lower portion of the screen.
 // Aim slightly below the object so its centre stays visible above the tray.
 if(ratio<.8){
  target[0]+=id==='record'?.02:.30;
  target[1]-=id==='overview'?.55:.35;
 }
 const position=base.position.map((v,i)=>target[i]+(v-base.target[i])*scale);
 return {mode:id,position,target};
}
export function focusStatus(mode){
 const id=normalizeFocus(mode);
 return id?FOCUS_NAMES[id]+' · close-up view':'Whole theatre · overview';
}
export function approaching(current,target,epsilon=.035){
 return current.length===3&&target.length===3&&
  current.every((v,i)=>Number.isFinite(v)&&Number.isFinite(target[i])&&
   Math.abs(v-target[i])<=epsilon);
}
