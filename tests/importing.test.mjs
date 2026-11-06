import test from 'node:test';
import assert from 'node:assert/strict';
import {planContestImport, applyContestImport, MAX_IMPORT_BYTES} from '../dist/src/importing.js';
import {app} from '../dist/src/state.js';
import '../dist/src/domain.js';
import '../dist/src/forms.js';
import '../dist/src/sync/engine.js';

const current = () => ({concursos:[{id:'existente',titulo:'Meu concurso',notas:'Preservar'}],materias:[{id:'lp',n:'Português',t:['Meu tópico'],mat:[]}],metas:{alvo:80}});
const pack = () => ({tipo:'concursos-pacote',versao:1,materias:[{id:'ibge-lp',n:'IBGE — Português',t:['Texto','Ortografia'],mat:[]}],concursos:[{id:'ibge-2026',titulo:'IBGE — DF',prova:'2027-01-31',mats:['ibge-lp'],blocos:[{itens:[{mid:'ibge-lp',h:'Português'}]}]}]});
const plan = (value,state=current()) => planContestImport(typeof value==='string'?value:JSON.stringify(value),state,app.ccNormalizar);

test('pacote inclui matérias novas sem trocar IDs ou conteúdo existente',()=>{
  const state=current(),before=structuredClone(state);const prepared=plan(pack(),state);const next=applyContestImport(state,prepared);
  assert.deepEqual(state,before);assert.deepEqual(next.concursos[0],before.concursos[0]);assert.deepEqual(next.materias[0],before.materias[0]);assert.deepEqual(next.metas,before.metas);
  assert.equal(next.concursos[1].mats[0],'ibge-lp');assert.equal(next.materias[1].t.length,2);
});
test('reimportação ignora a mesma ficha e mantém notas e progresso por ID',()=>{
  const first=applyContestImport(current(),plan(pack()));first.concursos[1].notas='Minha anotação';
  const repeated=plan(pack(),first);assert.equal(repeated.concursos.length,0);assert.equal(repeated.materias.length,0);assert.equal(repeated.skipped.length,1);
  assert.equal(applyContestImport(first,repeated).concursos[1].notas,'Minha anotação');
});
test('colisão de matéria remapeia ficha e conteúdo sem substituir tópicos locais',()=>{
  const input=pack();input.materias[0].id='lp';input.concursos[0].mats=['lp'];input.concursos[0].blocos[0].itens[0].mid='lp';
  const prepared=plan(input);assert.equal(prepared.materias[0].id,'lp-2');assert.deepEqual(prepared.concursos[0].mats,['lp-2']);assert.equal(prepared.concursos[0].blocos[0].itens[0].mid,'lp-2');
});
test('matéria idêntica é reutilizada em outro concurso do mesmo pacote',()=>{
  const state=current(),input=pack();input.materias[0]={...state.materias[0]};input.concursos[0].mats=['lp'];
  const prepared=plan(input,state);assert.equal(prepared.materias.length,0);assert.deepEqual(prepared.concursos[0].mats,['lp']);
});
test('IDs recebidos viram identificadores seguros e referências acompanham remapeamento',()=>{
  const input=pack();input.materias[0].id="x');alert(1)//";input.concursos[0].mats=[input.materias[0].id];input.concursos[0].id="Concurso ' teste";
  const prepared=plan(input);assert.match(prepared.concursos[0].id,/^[a-z0-9-]+$/);assert.match(prepared.materias[0].id,/^[a-z0-9-]+$/);assert.equal(prepared.concursos[0].mats[0],prepared.materias[0].id);
});
test('objeto e lista de fichas legadas continuam aceitos com matérias existentes',()=>{
  const record={titulo:'Concurso legado',mats:['lp','nao-existe']};assert.deepEqual(plan(record).concursos[0].mats,['lp']);assert.equal(plan([record,{titulo:'Outro'}]).concursos.length,2);
});
test('normalização valida as matérias do plano, sem depender do estado global anterior',()=>{
  app.DADOS={materias:[]};const prepared=plan(pack());assert.deepEqual(prepared.concursos[0].mats,['ibge-lp']);
});
test('pacote inválido falha por inteiro sem modificar dados locais',()=>{
  const state=current(),before=structuredClone(state),input=pack();input.concursos.push({cargo:'Sem título'});
  assert.throws(()=>plan(input,state),/título/);assert.deepEqual(state,before);
  input.concursos.pop();input.concursos[0].mats=['ausente'];assert.throws(()=>plan(input,state),/matéria/);assert.deepEqual(state,before);
});
test('formato futuro, backup e JSON incompleto recebem erros legíveis',()=>{
  assert.throws(()=>plan({...pack(),versao:999}),/versão/);
  assert.throws(()=>plan({d:{concursos:[],materias:[]},t:{}}),/backup/);
  assert.throws(()=>plan('{'),/JSON válido/);assert.throws(()=>plan(''),/Escolha um arquivo/);
});
test('arquivo com BOM é aceito e arquivo muito grande é recusado',()=>{
  assert.equal(plan('\uFEFF'+JSON.stringify(pack())).concursos.length,1);
  assert.throws(()=>plan(' '.repeat(MAX_IMPORT_BYTES)+'{}'),/5 MB/);
});
test('links executáveis são recusados antes de qualquer alteração',()=>{
  const input=pack();input.concursos[0].urlBanca='javascript:alert(1)';assert.throws(()=>plan(input),/http/);
  input.concursos[0].urlBanca='https://example.test';input.materias[0].t=[{n:'Material',u:'data:text/html,test'}];assert.throws(()=>plan(input),/http/);
});
test('matérias sem uso em novas fichas não são acrescentadas',()=>{
  const input=pack();input.materias.push({id:'extra',n:'Sem uso',t:['Tópico']});assert.equal(plan(input).materias.length,1);
});
test('payload de sincronização leva ficha e matérias sem alterar marcações existentes',()=>{
  app.S={t:{'lp:0':{e:true}},qzl:[],cy:{},fc:{},ui:{}};app.dataUpdatedAt='2026-11-06T15:00:00Z';
  app.DADOS=applyContestImport(current(),plan(pack()));
  const payload=app.payload();assert.equal(payload.d.concursos[1].id,'ibge-2026');assert.equal(payload.d.materias[1].id,'ibge-lp');assert.equal(payload.t['lp:0'].e,true);
  assert.deepEqual(payload.d.concursos[1].mats,['ibge-lp']);
});
