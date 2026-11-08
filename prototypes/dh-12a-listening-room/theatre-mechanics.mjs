// DH-12A: geometry-first mechanics of the Impossible Theatre.
// All motion is computed in one world. Nothing is an image swap or an audio player.
export const STAGE_ACTS=Object.freeze(['Songs','Shows','Characters']);
export const CURTAIN_CLOSED_X=1.64;
export const CURTAIN_OPEN_X=4.03;
export const STAGE_STEP=(Math.PI*2)/3;
export const RECORD_RADIANS_PER_SECOND=2.3;
export const TONEARM_REST=0.2;
export const TONEARM_PLAY=-0.52;
export function curtainX(side,open){
 if(side!=='left'&&side!=='right')throw Error('Unknown curtain side');
 return (side==='left'?-1:1)*(open?CURTAIN_OPEN_X:CURTAIN_CLOSED_X);
}
export function actIndex(value){
 return ((Math.trunc(Number(value)||0)%STAGE_ACTS.length)+STAGE_ACTS.length)%STAGE_ACTS.length;
}
export function stageAngle(steps){
 return -(Math.trunc(Number(steps)||0))*STAGE_STEP;
}
export function smoothTowards(from,to,delta,speed=5){
 if(!Number.isFinite(from)||!Number.isFinite(to))throw Error('Non-finite motion');
 const alpha=1-Math.exp(-Math.max(0,Math.min(.08,delta))*speed);
 return from+(to-from)*alpha;
}
export function recordAdvance(angle,playing,delta){
 return angle+(playing?RECORD_RADIANS_PER_SECOND*Math.max(0,Math.min(.08,delta)):0);
}
export function tonearmAngle(playing){return playing?TONEARM_PLAY:TONEARM_REST;}
export function theatreState(current,action){
 const state=current||Object.freeze({curtainsOpen:false,stageSteps:0,recordPlaying:false});
 if(!action||typeof action.type!=='string')return state;
 switch(action.type){
  case 'curtains':return {...state,curtainsOpen:!state.curtainsOpen};
  case 'act':return {...state,stageSteps:state.stageSteps+1};
  case 'record':return {...state,recordPlaying:!state.recordPlaying};
  case 'reset':return {curtainsOpen:false,stageSteps:0,recordPlaying:false};
  default:return state;
 }
}
