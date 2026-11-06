import test from 'node:test';
import assert from 'node:assert/strict';
import {filterContests, nextDeadline} from '../dist/src/catalog.js';
import {gestureAxis, completesSwipe} from '../dist/src/gestures.js';

const contests = [
  {id:'a',titulo:'Fundação de Educação',cargo:'Técnico Administrativo',banca:'Cebraspe',nivel:'Médio',inscrita:true,prova:'2026-11-15'},
  {id:'b',titulo:'Instituto de Pesquisa',cargo:'Analista de Sociologia',banca:'FGV',nivel:'Superior',inscrita:false,inscAte:'2026-11-09',prova:'2026-12-10'},
  {id:'c',titulo:'Tribunal',cargo:'Técnico',inscrita:false,inscAte:'2026-10-01',prova:'2026-10-30'}
];
test('busca aceita acentos, caixa, espaços e termos em campos diferentes',()=>{
  assert.deepEqual(filterContests(contests,{query:'  EDUCACAO medio  '}).map(c=>c.id),['a']);
  assert.deepEqual(filterContests(contests,{query:'sociologia FGV'}).map(c=>c.id),['b']);
});
test('filtro de inscrição combina com busca sem alterar os concursos',()=>{
  const before=structuredClone(contests);
  assert.equal(filterContests(contests,{filter:'registered'}).length,1);
  assert.equal(filterContests(contests,{filter:'watching',query:'técnico'}).length,1);
  assert.equal(filterContests(contests,{query:'inexistente'}).length,0);
  assert.deepEqual(contests,before);
});
test('próximo prazo prioriza inscrição pendente e ignora datas vencidas',()=>{
  const next=nextDeadline(contests,'2026-11-06',c=>c.inscAte);
  assert.equal(next.kind,'registration');assert.equal(next.contest.id,'b');
});
test('inscrição cumprida deixa a prova como próximo prazo',()=>{
  const next=nextDeadline([{...contests[1],inscrita:true}],'2026-11-06',c=>c.inscAte);
  assert.equal(next.kind,'exam');assert.equal(next.date,'2026-12-10');
});
test('prazo de hoje é preservado e lista sem datas futuras não inventa prazo',()=>{
  assert.equal(nextDeadline([contests[1]],'2026-11-09',c=>c.inscAte).date,'2026-11-09');
  assert.equal(nextDeadline([contests[2]],'2026-11-06',c=>c.inscAte),null);
});
test('gesto exige intenção horizontal e mantém rolagem vertical',()=>{
  assert.equal(gestureAxis(4,3),null);
  assert.equal(gestureAxis(20,80),'vertical');
  assert.equal(gestureAxis(18,17),'vertical');
  assert.equal(gestureAxis(-60,12),'horizontal');
});
test('gestos curtos retornam à aba e arraste ou impulso completam navegação',()=>{
  assert.equal(completesSwipe(20,390,50),false);
  assert.equal(completesSwipe(-110,390,1000),true);
  assert.equal(completesSwipe(-60,390,100),true);
  assert.equal(completesSwipe(60,390,600),false);
  assert.equal(completesSwipe(84,320,700),true);
});
