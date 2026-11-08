import test, {beforeEach,afterEach} from 'node:test';
import assert from 'node:assert/strict';
import {app} from '../dist/src/state.js';
import '../dist/src/domain.js';
import '../dist/src/repository.js';
import '../dist/src/navigation.js';
import '../dist/src/forms.js';
import '../dist/src/sync/engine.js';
let store,alerts,requests,confirmations;
const clone=structuredClone;
const snapshot=(at='remote')=>({t:{'lp:0':{e:'2026-11-01'}},qzl:[],cy:{},fc:{},ui:{},d:{concursos:[{id:'a',titulo:'Nuvem'}],materias:[{id:'lp',n:'Português',t:['Crase']}]},updatedAt:at});
const gist=o=>({id:'gist-test',files:{[app.GIST_FILE]:{content:JSON.stringify(o)}}});
const defer=()=>{let resolve;const promise=new Promise(r=>resolve=r);return {promise,resolve};};
beforeEach(()=>{
 store=new Map();alerts=[];requests=[];confirmations=0;
 globalThis.localStorage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)};
 globalThis.document={getElementById:()=>null,querySelector:()=>null,querySelectorAll:()=>[],body:{style:{}}};
 globalThis.alert=s=>alerts.push(s);globalThis.confirm=()=>{confirmations++;return true;};
 Object.assign(app,{SEED:{decks:[],cards:[],fontes:[],docs:[],metas:{alvo:70},ciclo:{modo:'auto',blocos:[]}},DADOS:clone(snapshot().d),S:{t:{'lp:0':{e:'2026-11-03'}},cy:{},fc:{},qzl:[],ui:{}},LSK:'ocdf-prep',SYNC_KEY:'ocdf:sync',GIST_FILE:'organizador-concursos.json',arranqueDuvidoso:false,arranqueCorrompido:false,arranqueVazio:false,syncState:'on',syncBusy:false,syncTimer:null,syncToken:'fixture-only',gistId:'gist-test',lastSyncedAt:'base',dataUpdatedAt:'base',syncMsg:'',ED:null,renderTudo(){},renderPill(){},syncModalMsg(){},abrirSync(){},salvarUI(){},agendarSync(){requests.push('schedule');}});
 app.gh=async(path,options)=>{requests.push(options?.method||'GET');return gist(snapshot('base'));};
});
afterEach(()=>{clearTimeout(app.syncTimer);});
for(const input of [{},[],{t:[]},{t:{},d:{concursos:[null],materias:[]}},{t:{},qzl:[{f:1,a:3}]}]){
 test('backup inválido não apaga progresso: '+JSON.stringify(input),()=>{
  globalThis.prompt=()=>JSON.stringify(input);const before=clone(app.S),data=clone(app.DADOS);
  app.bkImport();assert.deepEqual(app.S,before);assert.deepEqual(app.DADOS,data);assert.equal(store.has(app.LSK),false);
 });
}
test('backup válido restaura progresso antigo sem substituir matérias',()=>{
 globalThis.prompt=()=>JSON.stringify({t:{'lp:0':{q:true}},qz:{lp:{f:5,a:4}}});
 app.bkImport();assert.equal(app.S.t['lp:0'].q,true);assert.equal(app.S.qzl[0].a,4);assert.equal(app.DADOS.materias[0].id,'lp');
});
test('corrupção no arranque não é sobrescrita por gravação automática',()=>{
 store.set(app.LSK,'{"d":');app.carregarEstado(store.get(app.LSK));app.saveS({noSync:true});
 assert.equal(store.get(app.LSK),'{"d":');assert.equal(app.arranqueCorrompido,true);
});
test('falha de armazenamento ao baixar não troca estado nem confirma sincronização',()=>{
 const before=clone(app.S),data=clone(app.DADOS);localStorage.setItem=()=>{throw Error('quota');};
 assert.throws(()=>app.aplicarRemoto(snapshot('new')));assert.deepEqual(app.S,before);assert.deepEqual(app.DADOS,data);assert.equal(app.lastSyncedAt,'base');
});
test('editor preserva links e remapeia marcas após inserir e reordenar tópicos',()=>{
 app.DADOS.materias=[{id:'lp',n:'Português',t:[{n:'Crase',u:'https://example.test/crase'},'Verbos']}];
 app.S.t={'lp:0':{e:'2026-11-03'},'lp:1':{q:'2026-11-04'}};
 app.EM=[{id:'lp',n:'Português',t:'Novo\nVerbos\nCrase',mat:''}];app.emSalvar();
 assert.deepEqual(app.S.t,{'lp:1':{q:'2026-11-04'},'lp:2':{e:'2026-11-03'}});assert.deepEqual(app.DADOS.materias[0].t[2],{n:'Crase',u:'https://example.test/crase'});
});
test('matéria nova acima de existente não repete identificador nem herda marcas',()=>{
 app.EM=[{id:'',n:'lp',t:'Novo',mat:''},{id:'lp',n:'Português',t:'Crase',mat:''}];app.emSalvar();
 assert.deepEqual(app.DADOS.materias.map(m=>m.id),['lp-2','lp']);assert.equal(app.S.t['lp:0'].e,'2026-11-03');
});
test('alteração durante PATCH não é marcada como já enviada',async()=>{
 const pending=defer();app.dataUpdatedAt='sent';app.gh=async(path,options)=>{
  requests.push(options?.method||'GET');if(options?.method==='PATCH'){await pending.promise;return {};}
  return gist(snapshot('base'));
 };
 const upload=app.syncEnviar();await Promise.resolve();await Promise.resolve();
 app.dataUpdatedAt='new-local';app.S.t['lp:1']={q:true};pending.resolve();await upload;
 assert.equal(app.lastSyncedAt,'sent');assert.equal(app.dataUpdatedAt,'new-local');assert.ok(requests.includes('schedule'));
});
test('operações de sincronização simultâneas não duplicam upload',async()=>{
 const pending=defer();app.gh=async(path,options)=>{requests.push(options?.method||'GET');if(!options){await pending.promise;return gist(snapshot('base'));}return {};};
 const one=app.syncEnviar(),two=app.syncEnviar();pending.resolve();await Promise.all([one,two]);assert.equal(requests.filter(r=>r==='PATCH').length,1);
});
test('edição local enquanto download aguarda a rede impede substituição',async()=>{
 const pending=defer();app.gh=()=>pending.promise;const download=app.syncBaixar();
 app.dataUpdatedAt='local-new';app.DADOS.concursos[0].titulo='Minha edição';pending.resolve(gist(snapshot('remote-new')));await download;
 assert.equal(app.DADOS.concursos[0].titulo,'Minha edição');assert.equal(app.syncState,'conflito');
});
test('desconexão durante envio não é desfeita pela resposta atrasada',async()=>{
 const pending=defer();app.gh=()=>pending.promise;const upload=app.syncEnviar();app.esqueceSync();pending.resolve(gist(snapshot('base')));await upload;
 assert.equal(app.syncState,'off');assert.equal(app.gistId,'');assert.equal(store.has(app.SYNC_KEY),false);
});
test('envio forçado permite exclusão intencional e envio comum continua protegido',async()=>{
 app.DADOS.concursos=[];await app.syncEnviar(true);assert.ok(requests.includes('PATCH'));
});
test('cópia ilegível na nuvem não é substituída silenciosamente',async()=>{
 app.gh=async(path,options)=>{requests.push(options?.method||'GET');return {files:{}};};await app.syncEnviar();
 assert.equal(requests.includes('PATCH'),false);assert.equal(app.syncState,'erro');
});
test('conectar consulta conteúdo do gist e confirma antes de trocar dados locais',async()=>{
 document.getElementById=id=>id==='sync-token'?{value:'fixture-only'}:null;
 globalThis.confirm=()=>{confirmations++;return false;};
 app.gh=async(path)=>{requests.push(path);return path.startsWith('/gists?')?[{id:'gist-test',files:{[app.GIST_FILE]:{filename:app.GIST_FILE}}}]:gist(snapshot());};
 const before=clone(app.DADOS);await app.syncConectar();assert.equal(confirmations,1);assert.deepEqual(app.DADOS,before);
});
test('arranque vazio recupera concurso sem matérias liberado com atraso',()=>{
 app.arranqueVazio=true;app.DADOS={concursos:[],materias:[]};app.S.t={};
 store.set(app.LSK,JSON.stringify({t:{},d:{concursos:[{id:'recuperado'}],materias:[]}}));
 app.saveS({noSync:true});assert.equal(app.DADOS.concursos[0].id,'recuperado');
});
test('migração respeita exclusão de todas as fontes e documentos',()=>{
 app.SEED.fontes=[{id:'padrao'}];app.SEED.docs=[{id:'padrao'}];app.DADOS.fontes=[];app.DADOS.docs=[];
 app.migrarDados();assert.deepEqual(app.DADOS.fontes,[]);assert.deepEqual(app.DADOS.docs,[]);
});
test('tópicos repetidos preservam a marca da ocorrência correta',()=>{
 app.DADOS.materias=[{id:'lp',n:'Português',t:['Crase','Crase']}];app.S.t={'lp:1':{q:true}};
 app.EM=[{id:'lp',n:'Português',t:'Novo\nCrase\nCrase',mat:''}];app.emSalvar();assert.deepEqual(app.S.t,{'lp:2':{q:true}});
});
test('carga ao abrir não sobrescreve edição salva enquanto a rede aguardava',async()=>{
 const pending=defer();app.gh=()=>pending.promise;const opening=app.syncAoAbrir();
 app.dataUpdatedAt='edit';app.DADOS.concursos[0].titulo='Edição local';pending.resolve(gist(snapshot('new')));await opening;
 assert.equal(app.DADOS.concursos[0].titulo,'Edição local');assert.equal(app.syncState,'conflito');
});
test('carga automática espera resolução de um editor aberto',async()=>{
 app.ED={titulo:'Rascunho'};const before=clone(app.DADOS);app.gh=async()=>gist(snapshot('new'));await app.syncAoAbrir();
 assert.equal(app.syncState,'conflito');assert.deepEqual(app.DADOS,before);
});
test('conectar encontra backup depois dos primeiros cem gists sem criar duplicata',async()=>{
 document.getElementById=id=>id==='sync-token'?{value:'fixture-only'}:null;
 app.gh=async(path,options)=>{requests.push(options?.method||path);
 if(path.includes('page=2'))return [{id:'gist-test',files:{[app.GIST_FILE]:{}}}];
 if(path.includes('?'))return Array.from({length:100},(_,i)=>({id:'other-'+i,files:{}}));
 return gist(snapshot('base'));};
 await app.syncConectar();assert.ok(requests.some(x=>x.includes('page=2')));assert.ok(!requests.includes('POST'));assert.equal(confirmations,1);
});
test('conteúdo truncado da API não é tratado como um backup completo',async()=>{
 const data=gist(snapshot());data.files[app.GIST_FILE].truncated=true;app.gh=async()=>data;await app.syncBaixar();assert.equal(app.syncState,'erro');
});
test('falha de rede pode ser recuperada na próxima consulta sem reconectar a conta',async()=>{
 app.gh=async()=>{throw Error('offline');};await app.syncAoAbrir();assert.equal(app.syncState,'erro');
 app.gh=async()=>gist(snapshot('base'));await app.syncAoAbrir();assert.equal(app.syncState,'on');assert.equal(app.syncToken,'fixture-only');
});
test('criação da primeira cópia usa a mesma revisão no aparelho e na nuvem',async()=>{
 document.getElementById=id=>id==='sync-token'?{value:'fixture-only'}:null;
 app.dataUpdatedAt='';let posted;
 app.gh=async(path,options)=>{if(!options)return [];posted=JSON.parse(options.body.files[app.GIST_FILE].content);return {id:'new-gist'};};
 await app.syncConectar();assert.equal(app.dataUpdatedAt,posted.updatedAt);assert.equal(app.lastSyncedAt,posted.updatedAt);assert.equal(app.gistId,'new-gist');
});

test('versão futura de backup é recusada sem interpretar campos parcialmente',()=>{
 globalThis.prompt=()=>JSON.stringify({...snapshot(),v:999});const before=clone(app.S);app.bkImport();assert.deepEqual(app.S,before);assert.equal(store.has(app.LSK),false);
});
test('fechar ou ocultar o app descarrega anotações pendentes no armazenamento',()=>{
 app.DADOS.concursos[0].notas='Últimas palavras';app.notaTimer=setTimeout(()=>{},10000);app.uiTimer=setTimeout(()=>{},10000);
 app.flushPendingSaves();assert.equal(app.notaTimer,null);assert.equal(app.uiTimer,null);assert.equal(JSON.parse(store.get(app.LSK)).d.concursos[0].notas,'Últimas palavras');
});
test('links e cores de conteúdo externo não injetam ações no documento',()=>{
 assert.equal(app.href('javascript:alert(1)'),'#');assert.equal(app.href('data:text/html,test'),'#');
 assert.equal(app.href('https://example.test/?a=1&b=2'),'https://example.test/?a=1&amp;b=2');
 assert.equal(app.corVar('blue);" onmouseover="alert(1)'),'var(--primary)');
 assert.ok(!app.modalHead('<img src=x onerror=alert(1)>').includes('<img'));
});
test('cópia truncada é lida por inteiro sem enviar o token ao host de arquivos',async()=>{
 const originalFetch=globalThis.fetch;const data=gist(snapshot());data.files[app.GIST_FILE]={truncated:true,raw_url:'https://gist.githubusercontent.com/fixture/gist-test/raw/file.json'};
 app.gh=async()=>data;let request;
 globalThis.fetch=async(url,options)=>{request={url,options};return new Response(JSON.stringify(snapshot('complete')));};
 try {await app.syncBaixar();assert.equal(app.syncState,'on');assert.equal(app.lastSyncedAt,'complete');assert.equal(request.options.credentials,'omit');assert.equal(request.options.headers,undefined);}
 finally {globalThis.fetch=originalFetch;}
});
test('documento criado pelo próprio editor continua válido ao reabrir e sincronizar',async()=>{
 // doSalvar has always serialized documents as {n,ic,u}, without an ID.
 app.renderDocs=()=>{};app.DO=[{n:'Meu edital',ic:'i15',u:'https://example.test/edital.pdf'}];
 app.doSalvar();const stored=store.get(app.LSK);const saved=JSON.parse(stored);
 assert.deepEqual(saved.d.docs,[{n:'Meu edital',ic:'i15',u:'https://example.test/edital.pdf'}]);
 app.carregarEstado(stored);assert.equal(app.arranqueCorrompido,false);
 assert.equal(app.S.t['lp:0'].e,'2026-11-03');
 const remote={...saved,v:2,updatedAt:'base'};assert.equal(app.payloadCompleto(remote),true);
 app.gh=async(path,options)=>{requests.push(options?.method||'GET');return gist(remote);};
 app.dataUpdatedAt='base';app.lastSyncedAt='base';await app.syncEnviar();assert.ok(requests.includes('PATCH'));
 await app.syncBaixar();assert.equal(app.syncState,'on');assert.deepEqual(app.DADOS.docs,saved.d.docs);
});
test('cópia local protegida pode ser exportada integralmente sem virar backup vazio',()=>{
 const original='{"t":{"lp:0":{"e":true}},"d":';store.set(app.LSK,original);app.carregarEstado(original);
 assert.equal(app.bkTexto(),original);app.saveS({noSync:true});assert.equal(store.get(app.LSK),original);
});
test('baixar documentos legados recupera sessão bloqueada e libera gravação',async()=>{
 app.carregarEstado('{');const remote=snapshot('restored');remote.d.docs=[{n:'Edital',u:'https://example.test/edital',ic:'i15'}];
 app.gh=async()=>gist(remote);await app.syncBaixar();
 assert.equal(app.syncState,'on');assert.equal(app.arranqueCorrompido,false);assert.equal(app.estadoOriginal,null);
 assert.equal(app.S.t['lp:0'].e,'2026-11-01');assert.equal(app.DADOS.docs[0].n,'Edital');
 assert.deepEqual(JSON.parse(store.get(app.LSK)).d.docs,remote.d.docs);
});
test('incompatibilidade em identificador obrigatório informa o campo sem remover dados',()=>{
 const data=snapshot();data.d.materias=[{n:'Sem ID',t:[]}];app.carregarEstado(JSON.stringify(data));
 assert.equal(app.arranqueCorrompido,true);assert.match(app.erroDados,/d\.materias\.id/);
 assert.deepEqual(JSON.parse(app.bkTexto()),data);
});
test('envio de sessão protegida explica o bloqueio e não toca na nuvem',async()=>{
 app.arranqueCorrompido=true;await app.syncEnviar();assert.equal(requests.length,0);assert.match(app.syncMsg,/dados locais/);assert.equal(app.syncState,'erro');
});
