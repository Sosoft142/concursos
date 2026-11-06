import test, {beforeEach} from 'node:test';
import assert from 'node:assert/strict';
import {app} from '../dist/src/state.js';
import '../dist/src/domain.js';
import '../dist/src/repository.js';
import '../dist/src/navigation.js';
import '../dist/src/forms.js';
import '../dist/src/rendering.js';
import '../dist/src/study.js';
import '../dist/src/sync/engine.js';

let writes;
const seed={decks:[],cards:[],fontes:[],docs:[],metas:{alvo:70,revisao:[1,7],fciv:[1,3,7,16,35],blocoMin:45,blocosDia:2},ciclo:{modo:'auto',blocos:[]}};
beforeEach(()=>{
  writes=new Map();
  globalThis.localStorage={getItem:key=>writes.get(key)||null,setItem:(key,value)=>writes.set(key,value),removeItem:key=>writes.delete(key)};
  globalThis.document={getElementById:()=>null,querySelector:()=>null,querySelectorAll:()=>[],body:{style:{}}};
  globalThis.alert=()=>{};globalThis.confirm=()=>true;
  Object.assign(app,{SEED:structuredClone(seed),DADOS:{concursos:[],materias:[{id:'lp',n:'Português',t:['Crase']}]},S:{t:{},qzl:[],cy:{},fc:{},ui:{}},LSK:'ocdf-prep',SYNC_KEY:'ocdf:sync',GIST_FILE:'organizador-concursos.json',arranqueDuvidoso:false,arranqueVazio:false,guardaAvisou:false,syncToken:'private-token-fixture',gistId:'gist-fixture',syncState:'off',dataUpdatedAt:'2026-11-06T12:00:00Z',FMT_A:String.fromCharCode(1),FMT_B:String.fromCharCode(2),FMT_OK:{b:'b',strong:'b',i:'i',em:'i',small:'small',u:'u',br:'br'}});
  app.renderTudo=()=>{};
  app.renderPill=()=>{};app.syncModalMsg=()=>{};
});
test('migração preserva identificadores, notas e dados de concursos antigos',()=>{
  app.DADOS.concursos=[{id:'edital-original',titulo:'Original',notas:'Minha anotação',ficha:[{l:'Salário',v:'R$ 5 mil <small>40 horas</small>'}]}];
  app.migrarDados();
  assert.equal(app.DADOS.concursos[0].id,'edital-original');
  assert.equal(app.DADOS.concursos[0].notas,'Minha anotação');
  assert.deepEqual(app.DADOS.concursos[0].ficha[0],{l:'Salário',v:'R$ 5 mil',s:'40 horas'});
  const once=structuredClone(app.DADOS);app.migrarDados();assert.deepEqual(app.DADOS,once);
});
test('salvar mantém chave histórica e todo o progresso',()=>{
  app.DADOS.concursos=[{id:'a',titulo:'Meu concurso'}];app.S.t={'lp:0':{e:true,r:true}};app.S.fc={card:{n:2}};
  app.saveS({noSync:true});
  const saved=JSON.parse(writes.get('ocdf-prep'));
  assert.equal(saved.d.concursos[0].id,'a');assert.deepEqual(saved.t,app.S.t);assert.deepEqual(saved.fc,app.S.fc);
  assert.ok(saved.at);
});
test('armazenamento indisponível impede escrita e sincronização',()=>{
  app.arranqueDuvidoso=true;app.saveS();assert.equal(writes.size,0);assert.equal(app.gravacaoPendente,true);
});
test('arranque vazio adota dados liberados com atraso sem apagá-los',()=>{
  app.arranqueVazio=true;
  const recovered={t:{'lp:0':{e:true}},d:{concursos:[{id:'recuperado'}],materias:[{id:'lp'}]}};
  writes.set(app.LSK,JSON.stringify(recovered));
  app.saveS({noSync:true});
  assert.equal(app.DADOS.concursos[0].id,'recuperado');assert.equal(app.S.t['lp:0'].e,true);
  assert.equal(JSON.parse(writes.get(app.LSK)).d.concursos[0].id,'recuperado');
});
test('backup e payload remoto não incluem credenciais',()=>{
  app.migrarDados();
  const backup=app.bkTexto();const remote=JSON.stringify(app.corpoDoGist());
  for(const text of [backup,remote]){assert.ok(!text.includes('private-token-fixture'));assert.ok(!text.includes('gist-fixture'));}
  assert.deepEqual(JSON.parse(backup).d,app.DADOS);
});
test('backup antigo de questões é convertido sem perder totais',()=>{
  assert.deepEqual(app.qzlDe({qz:{lp:{f:20,a:15},rlm:{f:0,a:0}}}),[{id:'q0-lp',d:'',m:'lp',f:20,a:15}]);
});
test('carga remota válida preserva progresso e migra campos ausentes',()=>{
  const remote={t:{'lp:0':{e:true}},qzl:[{id:'q1',f:10,a:8}],cy:{},fc:{c:{n:3}},ui:{panes:{pn:'check'}},d:{concursos:[{id:'a',titulo:'Nuvem'}],materias:[{id:'lp'}]},updatedAt:'2026-11-06T10:00:00Z'};
  assert.equal(app.aplicarRemoto(remote),true);
  assert.equal(app.DADOS.concursos[0].titulo,'Nuvem');assert.equal(app.S.t['lp:0'].e,true);assert.equal(app.S.fc.c.n,3);
  assert.equal(app.DADOS.metas.alvo,70);
});
test('carga remota incompleta não substitui dados locais',()=>{
  app.DADOS.concursos=[{id:'local'}];const before=structuredClone(app.DADOS);
  assert.equal(app.aplicarRemoto({d:{concursos:[]}}),false);assert.deepEqual(app.DADOS,before);
});
test('upload de aparelho vazio não sobrescreve nuvem preenchida',async()=>{
  app.syncState='on';app.DADOS.concursos=[];let patches=0;
  const previous=app.gh;
  app.gh=async(path,options)=>{if(options?.method==='PATCH')patches++;return {files:{[app.GIST_FILE]:{content:JSON.stringify({t:{},updatedAt:'2026-11-01T10:00:00Z',d:{concursos:[{id:'remote'}],materias:[{id:'lp'}]}})}}};};
  try{await app.syncEnviar(false);assert.equal(patches,0);assert.match(app.syncMsg,/Não enviei nada/);}finally{app.gh=previous;}
});
test('inscrição usa campo próprio e reconhece cronograma legado',()=>{
  assert.equal(app.inscFim({inscAte:'2026-12-01',cronograma:[{label:'Inscrições',end:'2026-11-20'}]}),'2026-12-01');
  assert.equal(app.inscFim({cronograma:[{label:'Inscrições',d:'2026-11-01',end:'2026-11-20'}]}),'2026-11-20');
});
test('arquivamento filtra sem remover o conteúdo',()=>{
  app.DADOS.concursos=[{id:'a',notas:'Preservar',arquivado:true},{id:'b',arquivado:false}];
  assert.deepEqual(app.CC().map(c=>c.id),['b']);assert.equal(app.CCA()[0].notas,'Preservar');assert.equal(app.CCT().length,2);
});
test('títulos e formatação escapam conteúdo HTML executável',()=>{
  assert.equal(app.tx('<img src=x onerror=alert(1)>'),'&lt;img src=x onerror=alert(1)&gt;');
  assert.equal(app.fmt('*Importante* e _itálico_'),'<b>Importante</b> e <i>itálico</i>');
  assert.ok(app.fmt('<script>alert(1)</script>').includes('&lt;script&gt;'));
});
test('edição salva concurso novo e mantém progresso já existente',()=>{
  app.S.t={'lp:0':{e:true}};app.ED=app.edVazio();app.ED.titulo='Concurso teste';app.ED.__it=[];app.ED.__atr='';
  app.edSalvar();assert.equal(app.DADOS.concursos.length,1);assert.equal(app.DADOS.concursos[0].titulo,'Concurso teste');assert.equal(app.S.t['lp:0'].e,true);
});
