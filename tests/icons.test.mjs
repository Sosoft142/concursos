import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {app} from '../dist/src/state.js';
import '../dist/src/domain.js';
import '../dist/src/sync/engine.js';

test('referências estáticas e ações existentes resolvem para símbolos únicos',()=>{
 const html=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
 const ids=[...html.matchAll(/<g id="(i\d+)">/g)].map(m=>m[1]);const symbols=new Set(ids);
 assert.equal(symbols.size,ids.length);
 for(let i=0;i<=35;i++)if(i!==3)assert.ok(symbols.has('i'+i),'identificador histórico i'+i);
 const files=['dist/index.html',...readdirSync('dist/src').filter(x=>x.endsWith('.js')).map(x=>'dist/src/'+x)];
 for(const file of files){
  const text=readFileSync(file,'utf8');
  for(const m of text.matchAll(/(?:href="#|app\.ic\(')(i\d+)/g))assert.ok(symbols.has(m[1]),file+' → '+m[1]);
 }
 assert.match(html,/<button[^>]*id="syncPill"[\s\S]*?<use href="#i31"\/>[\s\S]*?<\/button>/);
});
test('ícones auxiliares ficam fora do nome acessível e mantêm escapada do identificador',()=>{
 const icon=app.ic('i23');assert.match(icon,/aria-hidden="true"/);assert.match(icon,/focusable="false"/);
 assert.ok(!app.ic('i1" onload="alert(1)').includes('href="#i1" onload='));
});
test('nuvem mantém descrição acessível e estados existentes sem alterar dados',()=>{
 const attributes={};const label={textContent:''};const pill={className:'',querySelector:()=>label,setAttribute:(k,v)=>attributes[k]=v};
 globalThis.document={getElementById:()=>pill};
 app.syncMsg='';app.syncAt='';
 for(const [state,busy,text,css] of [['off',false,'Sincronizar',''],['on',false,'Sincronizado','on'],['on',true,'Sincronizando…','busy'],['erro',false,'Erro','erro'],['conflito',false,'Conflito','conflito']]){
  app.syncState=state;app.syncBusy=busy;app.renderPill();
  assert.equal(label.textContent,text);assert.equal(attributes['aria-label'],'Sincronização: '+text);
  assert.equal(pill.className,'sync-pill'+(css?' '+css:''));assert.equal(app.syncState,state);
 }
});
