import test,{beforeEach} from 'node:test';
import assert from 'node:assert/strict';
import {app} from '../dist/src/state.js';
import '../dist/src/domain.js';
import '../dist/src/repository.js';
import '../dist/src/forms.js';
import '../dist/src/sync/engine.js';
import {handleIbgeAction} from '../dist/src/ibge-ui.js';
import {IBGE_PACKAGE as pkg} from '../dist/src/ibge-data.js';
import {buildIbgePlan} from '../dist/src/ibge-plan.js';
let stored,syncs;
const act=(action,other={})=>handleIbgeAction({target:{closest:()=>({dataset:{ibgeAction:action,...other}})}});
beforeEach(()=>{
 stored=new Map();syncs=0;
 globalThis.document={getElementById:()=>null,querySelector:()=>null};
 globalThis.localStorage={getItem:key=>stored.get(key)||null,setItem:(key,v)=>stored.set(key,v)};
 app.SEED={decks:[],cards:[],fontes:[],docs:[],metas:{alvo:70},ciclo:{modo:'auto',blocos:[]}};
 app.DADOS={...structuredClone(app.SEED),...structuredClone({concursos:pkg.concursos,materias:pkg.materias}),docs:[{n:'Documento legado',ic:'i15',u:'https://example.test/doc'}]};
 app.S={t:{'ibge-2026-portugues:0':{e:'2026-11-10'}},cy:{},fc:{},qzl:[],ui:{},d:app.DADOS};
 Object.assign(app,{LSK:'ocdf-prep',arranqueCorrompido:false,arranqueDuvidoso:false,agendarSync:()=>syncs++,renderTudo(){}});
});
test('sessão é salva no mesmo backup e payload da nuvem, sem alterar aprendizado ou documentos legados',()=>{
 const original=structuredClone(app.S.t),session=buildIbgePlan(app.DADOS.concursos[0],app.DADOS.materias).sessions[0];
 act('done',{key:session.key});
 assert.equal(syncs,1);assert.ok(JSON.parse(stored.get('ocdf-prep')).d.planoIBGE.done[session.key]);
 assert.deepEqual(app.S.t,original);assert.equal(app.DADOS.docs[0].n,'Documento legado');
 const restored=app.prepararEstado(JSON.parse(app.bkTexto()),true);
 assert.ok(restored.d.planoIBGE.done[session.key]);
 assert.ok(app.payload().d.planoIBGE.done[session.key]);
 act('done',{key:session.key});assert.equal(Object.keys(app.DADOS.planoIBGE.done).length,0);
});
test('falha de gravação deixa estado, conclusão anterior e cópia local intactos',()=>{
 const s=buildIbgePlan(app.DADOS.concursos[0],app.DADOS.materias).sessions[0];act('done',{key:s.key});
 const before=structuredClone(app.S),raw=stored.get('ocdf-prep');syncs=0;
 localStorage.setItem=()=>{throw Error('quota');};act('done',{key:s.key});
 assert.deepEqual(app.S,before);assert.equal(stored.get('ocdf-prep'),raw);assert.equal(syncs,0);
});
test('preparação inclui pacote sem substituir progresso e sem duplicar concursos',()=>{
 app.DADOS.concursos=[];app.DADOS.materias=[{id:'lp',n:'Outra matéria',t:['Crase']}];app.S.t={'lp:0':{e:'2026-11-10'}};
 act('install');act('install');
 assert.equal(app.DADOS.concursos.length,1);assert.equal(app.DADOS.materias.length,4);assert.equal(app.S.t['lp:0'].e,'2026-11-10');
});
test('preparação restaura IBGE arquivado com matérias e progresso originais',()=>{
 app.DADOS.concursos[0].arquivado=true;act('install');
 assert.equal(app.DADOS.concursos.length,1);assert.equal(app.DADOS.concursos[0].arquivado,false);assert.equal(app.S.t['ibge-2026-portugues:0'].e,'2026-11-10');
});
test('sessão protegida por corrupção não grava nem envia um plano vazio',()=>{
 app.arranqueCorrompido=true;const before=structuredClone(app.S);act('install');
 assert.deepEqual(app.S,before);assert.equal(stored.size,0);assert.equal(syncs,0);
});
