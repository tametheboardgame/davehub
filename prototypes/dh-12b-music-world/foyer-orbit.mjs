// DH-12B.3: pointer/touch/keyboard orbit around the actual 3D Music foyer.
// Pure maths, independent of Three.js, with real spherical camera positions.
const PI=Math.PI;
const TWOPI=PI*2;
export const ORBIT_LIMITS=Object.freeze({
 pitchMin:-.09,pitchMax:1.32,
 zoomMin:.52,zoomMax:2.3,
 mouseRadiansPerPixel:.0062,
 touchRadiansPerPixel:.0065,
 wheelSensitivity:.0011
});
const finite=value=>Number.isFinite(value);
export const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
export function initialOrbit(){
 return {yaw:0,pitch:0,zoom:1};
}
export function dragOrbit(current,deltaX,deltaY,scale=ORBIT_LIMITS.mouseRadiansPerPixel){
 if(!finite(deltaX)||!finite(deltaY))return current;
 return {
  ...current,
  yaw:current.yaw-deltaX*scale,
  pitch:current.pitch+deltaY*scale
 };
}
export function zoomOrbit(current,delta,sensitivity=ORBIT_LIMITS.wheelSensitivity){
 if(!finite(delta))return current;
 return {...current,zoom:clamp(current.zoom*Math.exp(delta*sensitivity),
  ORBIT_LIMITS.zoomMin,ORBIT_LIMITS.zoomMax)};
}
export function zoomPinch(current,previousDistance,currentDistance){
 if(!finite(previousDistance)||!finite(currentDistance)||
  previousDistance<=1||currentDistance<=1)return current;
 return {...current,zoom:clamp(current.zoom*previousDistance/currentDistance,
  ORBIT_LIMITS.zoomMin,ORBIT_LIMITS.zoomMax)};
}
export function orbitPose(basePosition,lookAt,orbit=initialOrbit(),options={}){
 if(!Array.isArray(basePosition)||!Array.isArray(lookAt)||
  basePosition.length!==3||lookAt.length!==3||
  !basePosition.every(finite)||!lookAt.every(finite))
  throw Error('A valid physical base camera pose is required');
 const dx=basePosition[0]-lookAt[0],
  dy=basePosition[1]-lookAt[1],
  dz=basePosition[2]-lookAt[2];
 const originalRadius=Math.hypot(dx,dy,dz);
 if(originalRadius<.0001)throw Error('Orbit cannot target its own camera position');
 const basePitch=Math.asin(clamp(dy/originalRadius,-1,1));
 const baseYaw=Math.atan2(dx,dz);
 const pitch=clamp(basePitch+(orbit.pitch||0),
  ORBIT_LIMITS.pitchMin,ORBIT_LIMITS.pitchMax);
 const yaw=baseYaw+(orbit.yaw||0);
 const minRadius=finite(options.minRadius)?options.minRadius:3.7;
 const maxRadius=finite(options.maxRadius)?options.maxRadius:38;
 const radius=clamp(originalRadius*(orbit.zoom||1),minRadius,maxRadius);
 const horizontal=Math.cos(pitch)*radius;
 return {
  position:[
   lookAt[0]+horizontal*Math.sin(yaw),
   lookAt[1]+Math.sin(pitch)*radius,
   lookAt[2]+horizontal*Math.cos(yaw)
  ],
  target:[...lookAt],
  radius,pitch,yaw
 };
}
export function dragDistance(start,current){
 if(!start||!current)return Infinity;
 return Math.hypot(current.x-start.x,current.y-start.y);
}
export function pointerSeparation(first,second){
 if(!first||!second)return 0;
 return Math.hypot(first.x-second.x,first.y-second.y);
}
