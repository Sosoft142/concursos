import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import vm from 'node:vm';
function worker({online=true}={}) {
  const events={};const stores=new Map();const removed=[];
  const key=req=>new URL(typeof req==='string'?req:req.url,'https://example.test/concursos/').href;
  const open=async name=>{if(!stores.has(name))stores.set(name,new Map());const store=stores.get(name);return {addAll:async urls=>{for(const url of urls)store.set(key(url),new Response('cached:'+url));},put:async(req,res)=>store.set(key(req),res),match:async req=>store.get(key(req))};};
  const context={self:{registration:{scope:'https://example.test/concursos/'},location:{origin:'https://example.test'},addEventListener:(name,fn)=>events[name]=fn,skipWaiting:async()=>{},clients:{claim:async()=>{}}},caches:{open,keys:async()=>['retomar-other-app','organizador','concursos:https://example.test/concursos/:old'],delete:async key=>removed.push(key)},fetch:async()=>{if(!online)throw Error('offline');return new Response('network');},URL,Response,Promise};
  vm.runInNewContext(readFileSync('sw.js','utf8'),context);
  return {events,stores,removed};
}
test('manifesto offline inclui todos os módulos e arquivos existem',()=>{
  const source=readFileSync('sw.js','utf8');const list=JSON.parse(source.match(/const ASSETS = (\[[\s\S]*?\]);/)[1]);
  assert.ok(list.includes('./dist/identity.css'));assert.ok(list.includes('./dist/src/app.js'));assert.ok(list.includes('./dist/src/gestures.js'));
  for(const file of ['plan.css','src/ibge-ui.js','src/ibge-plan.js','src/ibge-data.js'])assert.ok(list.includes('./dist/'+file),`preparação IBGE offline: ${file}`);
  for(const font of ['ibm-plex-sans','space-grotesk'])assert.ok(list.includes(`./dist/fonts/${font}.woff2`),`fonte offline: ${font}`);
  for(const file of list.filter(file=>file!=='./'))assert.ok(existsSync(file),file);
});
test('instalação prepara conteúdo completo e limpeza preserva outros apps',async()=>{
  const {events,stores,removed}=worker();let pending;events.install({waitUntil:p=>pending=p});await pending;
  assert.ok([...stores.values()][0].has('https://example.test/concursos/dist/src/repository.js'));
  events.activate({waitUntil:p=>pending=p});await pending;
  assert.ok(removed.includes('organizador'));assert.ok(!removed.includes('retomar-other-app'));
});
test('offline devolve navegação em cache e nunca HTML como JavaScript ausente',async()=>{
  const {events}=worker({online:false});let pending;events.install({waitUntil:p=>pending=p});await pending;
  function request(mode,url){let response;events.fetch({request:{method:'GET',mode,url},respondWith:p=>response=p,waitUntil(){}});return response;}
  const navigation=await request('navigate','https://example.test/concursos/?new=1');assert.match(await navigation.text(),/cached/);
  const module=await request('cors','https://example.test/concursos/dist/src/app.js');assert.equal(await module.text(),'cached:./dist/src/app.js');
  const missing=await request('cors','https://example.test/concursos/missing.js');assert.equal(missing.type,'error');
  assert.equal(request('cors','https://api.github.com/gists/test'),undefined);
});
