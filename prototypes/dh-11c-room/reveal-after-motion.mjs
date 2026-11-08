// DH-11C.6C.2: a reader may open only after its actual 3D furniture
// and shared camera have reached their targets. Frame-driven, not a blind timer.
export const ITEM_TOLERANCE = .009;
export const CAMERA_TOLERANCE = .10;
export const REVEAL_HOLD_SECONDS = .18;
export function revealReady({focus,expectedFocus,active,itemDistance,cameraDistance,aimDistance}){
 return focus===expectedFocus&&active===true&&
  [itemDistance,cameraDistance,aimDistance].every(Number.isFinite)&&
  itemDistance<=ITEM_TOLERANCE&&
  cameraDistance<=CAMERA_TOLERANCE&&
  aimDistance<=CAMERA_TOLERANCE;
}
export const TYPEWRITER_KEY_LABELS='QWERTYUIASDFGHJKZXCVBNM,';
export function keyIndexForCharacter(key){
 if(typeof key!=='string'||key.length!==1)return null;
 const index=TYPEWRITER_KEY_LABELS.indexOf(key.toUpperCase());
 return index<0?null:index;
}
