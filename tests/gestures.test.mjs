import test, {beforeEach} from 'node:test';
import assert from 'node:assert/strict';
import {app} from '../dist/src/state.js';
import {initializeGestures} from '../dist/src/gestures.js';
let callbacks, current, preview, drawer, main, target, clock, changed;
function element(extra={}) {
  const classes=new Set();
  return {style:{},classList:{add:x=>classes.add(x),remove:x=>classes.delete(x),contains:x=>classes.has(x)},setAttribute(){},removeAttribute(){},setPointerCapture(){},hasPointerCapture:()=>false,getBoundingClientRect:()=>({width:300,top:0,bottom:70}),querySelector:()=>null,animate:()=>({finished:Promise.resolve(),cancel(){}}),...extra};
}
beforeEach(()=>{
  callbacks={};clock=0;changed=[];
  current=element({id:'view-concursos',offsetTop:20});preview=element({id:'view-estudo'});
  target={closest:()=>null};
  main=element({clientWidth:390,contains:()=>true});drawer=element({contains:()=>false});
  globalThis.document={querySelector:s=>s==='main'?main:s==='.view.active'?current:s==='header.top'?element():null,getElementById:id=>id==='drawer'?drawer:id==='drawerBackdrop'?element():id==='view-estudo'?preview:null,querySelectorAll:()=>['concursos','estudo','comparar'].map(name=>({id:'tab-'+name,hidden:false})),addEventListener:(type,fn)=>{(callbacks[type]||=[]).push(fn);}};
  globalThis.window={getSelection:()=>null,addEventListener(){}};
  globalThis.matchMedia=query=>({matches:query.includes('max-width')});
  globalThis.getComputedStyle=()=>({display:'flex'});
  globalThis.innerWidth=390;
  Object.defineProperty(globalThis,'performance',{configurable:true,value:{now:()=>clock}});
  app.toggleDrawer=force=>{if(force)drawer.classList.add('open');else drawer.classList.remove('open');};
  app.showView=view=>changed.push(view);
  initializeGestures();
});
function send(type,x,y,extras={}){
  const event={pointerId:1,pointerType:'touch',isPrimary:true,button:0,clientX:x,clientY:y,target,preventDefault(){},...extras};
  for(const fn of callbacks[type]||[])fn(event);
}
async function settled(){await Promise.resolve();await Promise.resolve();await Promise.resolve();}
test('conteúdo acompanha o dedo e só então confirma a troca de aba',async()=>{
  send('pointerdown',220,300);clock=150;send('pointermove',100,307);
  assert.match(current.style.transform,/-120px/);assert.equal(preview.classList.contains('gesture-preview'),true);assert.deepEqual(changed,[]);
  send('pointerup',100,307);await settled();assert.deepEqual(changed,['estudo']);assert.equal(current.style.transform,'');
});
test('pointercancel restaura a aba e não navega',async()=>{
  send('pointerdown',220,300);send('pointermove',80,308);send('pointercancel',80,308);await settled();assert.deepEqual(changed,[]);assert.equal(current.style.transform,'');
});
test('deslocamento vertical permanece rolagem, mesmo com ruído horizontal',()=>{
  send('pointerdown',200,300);send('pointermove',180,420);assert.equal(current.style.transform,undefined);assert.deepEqual(changed,[]);
});
test('bordas do sistema, campos e mouse não iniciam navegação por gesto',()=>{
  send('pointerdown',8,300);send('pointermove',150,300);assert.equal(current.style.transform,undefined);
  target.closest=()=>({});send('pointerdown',200,300);send('pointermove',50,300);assert.equal(current.style.transform,undefined);
  target.closest=()=>null;send('pointerdown',200,300,{pointerType:'mouse'});send('pointermove',50,300);assert.equal(current.style.transform,undefined);
});
test('arraste para direita na primeira aba abre menu lateral',()=>{
  send('pointerdown',80,300);clock=200;send('pointermove',220,306);assert.match(drawer.style.transform,/-160px/);send('pointerup',220,306);assert.equal(drawer.classList.contains('open'),true);
});
