(function(root,build){
  'use strict';
  const api=build();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.DH11CabinetMath=api;
})(typeof window!=='undefined'?window:null,function(){
  'use strict';
  // Fixed coordinates (CSS pixels). Every moving face shares these exact values.
  // No generated art or independent camera/perspective per drawer.
  const geometry=Object.freeze({
    width:400,height:650,depth:180,
    socketLeft:34,socketTop:53,slotGap:19,
    drawerWidth:332,drawerHeight:94,drawerDepth:168,
    travel:148
  });
  const names=['Finished','Drafts','Oddities','Fragments','Field Notes'];
  const drawers=Object.freeze(names.map((name,index)=>Object.freeze({
    id:['finished','drafts','oddities','fragments','field-notes'][index],
    name,index,
    top:geometry.socketTop+index*(geometry.drawerHeight+geometry.slotGap)
  })));
  const initial=()=>({selected:null,amount:0,yaw:-18,pitch:-9});
  function bounded(value,min,max){
    const n=Number(value);
    return Number.isFinite(n)?Math.min(max,Math.max(min,n)):min;
  }
  function reduce(state,action){
    if(!state||!action)return initial();
    switch(action.type){
      case 'toggle':
        if(!drawers.some(d=>d.id===action.id))return state;
        return state.selected===action.id&&state.amount>0
          ? {...state,selected:null,amount:0}
          : {...state,selected:action.id,amount:1};
      case 'close':return {...state,selected:null,amount:0};
      case 'scrub':
        if(!drawers.some(d=>d.id===action.id))return state;
        return {...state,selected:action.id,amount:bounded(action.amount,0,1)};
      case 'camera':return {...state,yaw:bounded(action.yaw,-32,32),pitch:bounded(action.pitch,-20,15)};
      case 'reset':return initial();
      default:return state;
    }
  }
  function travelFor(state,id){
    return state.selected===id?Math.round(state.amount*geometry.travel):0;
  }
  function validateGeometry(){
    const g=geometry;
    if(g.socketLeft*2+g.drawerWidth!==g.width)throw Error('Drawer width does not fit cabinet');
    if(g.drawerDepth>g.depth)throw Error('Drawer depth exceeds cabinet');
    if(drawers.length!==5||new Set(drawers.map(d=>d.id)).size!==5)throw Error('Five unique drawers required');
    for(let i=0;i<drawers.length;i++){
      const d=drawers[i];
      if(d.top<0||d.top+g.drawerHeight>g.height)throw Error('Drawer outside case');
      if(i&&d.top<drawers[i-1].top+g.drawerHeight)throw Error('Drawer slots overlap');
    }
    return true;
  }
  validateGeometry();
  return Object.freeze({geometry,drawers,initial,reduce,travelFor,validateGeometry});
});
