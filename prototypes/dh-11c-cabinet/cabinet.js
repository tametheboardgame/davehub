(() => {
  'use strict';
  const model=window.DH11CabinetMath;
  const slots=document.getElementById('cabinet-slots');
  const controls=document.getElementById('drawer-controls');
  const cabinet=document.getElementById('cabinet-model');
  const yaw=document.getElementById('yaw-slider');
  const pitch=document.getElementById('pitch-slider');
  const travel=document.getElementById('travel-slider');
  const close=document.getElementById('close-all');
  const reset=document.getElementById('reset');
  const status=document.getElementById('status');
  if(!model||!slots||!controls||!cabinet||!yaw||!pitch||!travel||!close||!reset||!status)return;
  let state=model.initial();
  const units=new Map(), faces=new Map(), choiceButtons=new Map();
  const node=(tag,classes,text)=>{
    const e=document.createElement(tag);
    e.className=classes;
    if(text!==undefined)e.textContent=text;
    return e;
  };
  // Structural geometry is produced from the same dimensions for every drawer.
  // Surface labels are the only per-drawer variation.
  for(const drawer of model.drawers){
    const socket=node('div','socket');
    socket.style.top=drawer.top+'px';
    socket.setAttribute('aria-hidden','true');
    slots.append(socket);
    const unit=node('div','drawer-unit');
    unit.dataset.drawer=drawer.id;
    unit.style.top=drawer.top+'px';
    for(const part of ['back','left','right','bottom','top-guide'])unit.append(node('div','drawer-'+part));
    const face=node('button','drawer-front');
    face.type='button';
    face.dataset.drawerButton=drawer.id;
    face.setAttribute('aria-label','Open '+drawer.name+' drawer');
    face.setAttribute('aria-expanded','false');
    const label=node('span','drawer-label',drawer.name);
    const handle=node('span','handle');
    handle.setAttribute('aria-hidden','true');
    face.append(label,handle);
    unit.append(face);
    slots.append(unit);
    units.set(drawer.id,unit);
    faces.set(drawer.id,face);
    const choice=node('button','drawer-control');
    choice.type='button';
    choice.dataset.control=drawer.id;
    choice.setAttribute('aria-pressed','false');
    choice.append(node('span','',drawer.name),node('span','position','Closed'));
    controls.append(choice);
    choiceButtons.set(drawer.id,choice);
    face.addEventListener('click',()=>dispatch({type:'toggle',id:drawer.id}));
    choice.addEventListener('click',()=>dispatch({type:'toggle',id:drawer.id}));
  }
  function redraw(silent=false){
    cabinet.style.setProperty('--yaw',state.yaw+'deg');
    cabinet.style.setProperty('--pitch',state.pitch+'deg');
    const active=model.drawers.find(d=>d.id===state.selected);
    for(const drawer of model.drawers){
      const open=drawer.id===state.selected&&state.amount>0;
      const unit=units.get(drawer.id);
      unit.style.setProperty('--travel',model.travelFor(state,drawer.id)+'px');
      unit.dataset.open=String(open);
      const face=faces.get(drawer.id);
      face.setAttribute('aria-expanded',String(open));
      face.setAttribute('aria-label',(open?'Close ':'Open ')+drawer.name+' drawer');
      const choice=choiceButtons.get(drawer.id);
      choice.setAttribute('aria-pressed',String(open));
      choice.querySelector('.position').textContent=open?Math.round(state.amount*100)+'% open':'Closed';
    }
    travel.disabled=!active;
    travel.value=String(Math.round(state.amount*100));
    document.getElementById('travel-value').textContent=Math.round(state.amount*100)+'%';
    yaw.value=String(state.yaw);
    pitch.value=String(state.pitch);
    document.getElementById('yaw-value').textContent=state.yaw+'°';
    document.getElementById('pitch-value').textContent=state.pitch+'°';
    close.disabled=!active;
    if(!silent)status.textContent=active
      ?active.name+' drawer '+Math.round(state.amount*100)+'% extended. Its entire six-sided geometry is moving on the cabinet depth axis.'
      :'All five drawers closed. Select a drawer to examine its movement.';
  }
  function dispatch(action,silent=false){
    state=model.reduce(state,action);
    redraw(silent);
  }
  close.addEventListener('click',()=>dispatch({type:'close'}));
  reset.addEventListener('click',()=>{dispatch({type:'reset'});document.body.dataset.scrubbing='false'});
  function camera(){dispatch({type:'camera',yaw:yaw.value,pitch:pitch.value},true);
    status.textContent='Camera: '+state.yaw+'° yaw, '+state.pitch+'° pitch. All cabinet geometry retains the same perspective.';}
  yaw.addEventListener('input',camera);
  pitch.addEventListener('input',camera);
  travel.addEventListener('input',()=>{
    if(!state.selected)return;
    document.body.dataset.scrubbing='true';
    dispatch({type:'scrub',id:state.selected,amount:Number(travel.value)/100});
  });
  for(const name of ['change','pointerup','keyup','blur'])travel.addEventListener(name,()=>{
    document.body.dataset.scrubbing='false';
  });
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&state.selected){e.preventDefault();dispatch({type:'close'});}
  });
  redraw(true);
})();
