import test from 'node:test';
import assert from 'node:assert/strict';
import {app} from '../dist/src/state.js';
import '../dist/src/domain.js';
const listeners=new Map();
const nodes=Object.fromEntries(['cc-list','contest-toolbar','contest-count','next-deadline'].map(id=>[id,{innerHTML:'',textContent:'',hidden:false}]));
globalThis.document={getElementById:id=>nodes[id],addEventListener:(type,fn)=>listeners.set(type,fn)};
await import('../dist/src/contest-ui.js');

test('busca e filtro atualizam cartões sem reconstruir o resumo e o início da página',()=>{
 let overview=0,welcome=0;
 Object.assign(app,{CC:()=>[{id:'a',titulo:'IBGE',cargo:'Recenseador',inscrita:false},{id:'b',titulo:'Tribunal',inscrita:true}],renderContagem:()=>overview++,renderBoasVindas:()=>welcome++,chipInscricao:()=>'',inscFim:()=>null,hoje:()=> '2026-11-06'});
 app.renderCards();assert.equal(overview,1);assert.equal(welcome,1);
 const summary=nodes['next-deadline'].innerHTML;
 listeners.get('input')({target:{id:'contest-search',value:'ibge'}});
 assert.equal(nodes['contest-count'].textContent,'1 de 2');
 assert.ok(nodes['cc-list'].innerHTML.includes('<h4>IBGE</h4>'));
 assert.ok(!nodes['cc-list'].innerHTML.includes('Tribunal'));
 listeners.get('change')({target:{id:'contest-filter',value:'registered'}});
 assert.equal(nodes['contest-count'].textContent,'0 de 2');
 assert.ok(nodes['cc-list'].innerHTML.includes('Nenhum concurso corresponde'));
 assert.equal(overview,1);assert.equal(welcome,1);assert.equal(nodes['next-deadline'].innerHTML,summary);
 app.ccQuery='';app.renderCards();assert.equal(overview,2);assert.equal(welcome,2);
});
