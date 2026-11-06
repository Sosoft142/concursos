import test, {beforeEach} from 'node:test';
import assert from 'node:assert/strict';
import {app} from '../dist/src/state.js';
import '../dist/src/domain.js';
import {handleTopicClick} from '../dist/src/study.js';

let list, body, expanded, opened;
beforeEach(()=>{
 list={innerHTML:''};body={innerHTML:''};expanded='false';opened=false;
 const wrap={classList:{toggle:(_,value)=>{opened=value;}},querySelector:selector=>selector==='.ck-body'?body:{setAttribute:(_,value)=>{expanded=value;}}};
 globalThis.document={getElementById:id=>id==='check-list'?list:id==='ckm-lp'?wrap:null};
 Object.assign(app,{fltr:'all',ckOpen:{},MAT:[{id:'lp',n:'Português',cs:['a','b'],t:['Crase','<img src=x>']}],S:{t:{'lp:0':{e:'2026-11-06',r:'2026-11-06',q:'2026-11-06'}}},DADOS:{materias:[]},corDe:()=> 'var(--blue)'});
});
test('matéria fechada mantém contagem e progresso sem montar os controles de tópicos',()=>{
 app.renderCheck();
 assert.ok(list.innerHTML.includes('1/2'));
 assert.ok(list.innerHTML.includes('50%'));
 assert.ok(!list.innerHTML.includes('class="ck-t'));
 assert.ok(list.innerHTML.includes('aria-expanded="false"'));
});
test('abrir, fechar e reabrir preserva marcações e escapa o conteúdo',()=>{
 const progress=structuredClone(app.S.t);
 app.ckToggle('lp');
 assert.equal(opened,true);assert.equal(expanded,'true');
 assert.ok(body.innerHTML.includes('aria-pressed="true"'));
 assert.ok(body.innerHTML.includes('&lt;img src=x&gt;'));
 assert.ok(!body.innerHTML.includes('<img'));
 app.ckToggle('lp');assert.equal(body.innerHTML,'');assert.equal(expanded,'false');
 app.S.t['lp:1']={e:'2026-11-06'};
 app.ckToggle('lp');
 assert.ok(body.innerHTML.includes('data-topic-index="1" data-topic-stage="e" title="Estudei" aria-pressed="true"'));
 assert.deepEqual(app.S.t['lp:0'],progress['lp:0']);
});
test('redesenho mantém matérias abertas e filtros continuam aplicados',()=>{
 app.ckOpen.lp=true;app.renderCheck();assert.ok(list.innerHTML.includes('class="ck-t done"'));
 app.fltr='ausente';app.renderCheck();assert.ok(list.innerHTML.includes('Nenhuma matéria'));
 app.fltr='comum';app.renderCheck();assert.ok(list.innerHTML.includes('Português'));
});
test('controle delegado resolve clique no texto interno para a marcação correta',()=>{
 const calls=[];app.tg=(...args)=>calls.push(args);
 handleTopicClick({target:{closest:()=>({dataset:{topicSubject:'lp',topicIndex:'1',topicStage:'r'}})}});
 assert.deepEqual(calls,[['lp',1,'r']]);
 handleTopicClick({target:{closest:()=>null}});assert.equal(calls.length,1);
});
