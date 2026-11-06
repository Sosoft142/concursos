import test, {beforeEach} from 'node:test';
import assert from 'node:assert/strict';
import {app} from '../dist/src/state.js';
import {initializeHistory} from '../dist/src/history.js';
let active, open, discard, drawerOpen, listeners, stack, cursor;
beforeEach(()=>{
  active='concursos';open=false;discard=true;drawerOpen=false;listeners={};stack=[];cursor=0;
  const drawer={classList:{contains:()=>drawerOpen}};
  const dialog={querySelector:()=>({click:()=>{if(discard)app.modalFechar();}})};
  globalThis.document={activeElement:{isConnected:false},querySelector:selector=>selector==='.view.active'?{id:'view-'+active}:open?dialog:null,getElementById:id=>id==='drawer'?drawer:id.startsWith('view-')?{}:null};
  globalThis.window={addEventListener:(name,callback)=>{listeners[name]=callback;}};
  globalThis.location={href:'https://example.test/concursos/'};
  globalThis.history={get state(){return stack[cursor];},replaceState:s=>{stack[cursor]=s;},pushState:s=>{stack=stack.slice(0,cursor+1);stack.push(s);cursor++;},back:()=>{if(cursor>0){cursor--;listeners.popstate({state:stack[cursor]});}}};
  Object.assign(app,{S:{ui:{}},salvarUI:()=>{},oculto:()=>false,modalAbrir:()=>{open=true;},modalFechar:()=>{open=false;},showView:name=>{active=name;},toggleDrawer:force=>{drawerOpen=typeof force==='boolean'?force:!drawerOpen;}});
  initializeHistory();
});
test('Voltar retorna à área anterior em vez de sair do app',()=>{
  app.showView('estudo');assert.equal(active,'estudo');history.back();assert.equal(active,'concursos');
});
test('Voltar fecha janela simples e preserva a área de origem',()=>{
  app.showView('estudo');app.modalAbrir();history.back();assert.equal(open,false);assert.equal(active,'estudo');
});
test('Voltar conserva editor e histórico quando descarte é recusado',()=>{
  discard=false;app.modalAbrir();history.back();assert.equal(open,true);assert.equal(history.state.modal,true);
  discard=true;history.back();assert.equal(open,false);
});
test('fechamento explícito não exige dois toques em Voltar',()=>{
  app.showView('estudo');app.modalAbrir();app.modalFechar();assert.equal(open,false);history.back();assert.equal(active,'concursos');
});
test('Voltar fecha menu lateral antes de trocar de área',()=>{
  app.toggleDrawer(true);history.back();assert.equal(drawerOpen,false);assert.equal(active,'concursos');
});
test('abrir configurações a partir do menu não deixa entrada fantasma',async()=>{
  app.toggleDrawer(true);app.toggleDrawer(false);app.modalAbrir();await Promise.resolve();
  assert.equal(history.state.modal,true);assert.equal(open,true);history.back();assert.equal(open,false);assert.equal(cursor,0);
});
test('menu troca de área sem registrar menu aberto no retorno',()=>{
  app.toggleDrawer(true);app.showView('comparar');app.toggleDrawer(false);history.back();assert.equal(active,'concursos');assert.equal(drawerOpen,false);
});
