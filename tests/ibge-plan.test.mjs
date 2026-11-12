import test from 'node:test';
import assert from 'node:assert/strict';
import {IBGE_PACKAGE as pkg} from '../dist/src/ibge-data.js';
import {buildIbgePlan,findIbge,monday,nextSession,planOptions,weekSessions,daysBetween} from '../dist/src/ibge-plan.js';
import {validateSnapshot} from '../dist/src/snapshots.js';
import {planContestImport,applyContestImport} from '../dist/src/importing.js';
const contest=pkg.concursos[0],subjects=pkg.materias;
const make=options=>buildIbgePlan(contest,subjects,options);
test('semana completa distribui quatro horas em 50/25/25 sem incluir extras',()=>{
 const week=weekSessions(make(),'2026-11-16').filter(s=>!s.optional);
 assert.deepEqual(week.map(s=>s.lane),['tech','port','tech','math']);
 assert.equal(week.reduce((n,s)=>n+s.minutes,0),240);
 assert.ok(week.every(s=>[1,2,4,5].includes(new Date(s.date).getUTCDay())));
});
test('cronograma cobre todos os tópicos de Português e Matemática antes da revisão final',()=>{
 const p=make();
 for(const [lane,len] of [['port',9],['math',8]])assert.deepEqual([...new Set(p.sessions.filter(s=>s.lane===lane&&daysBetween(s.date,p.exam)>14).flatMap(s=>s.topicIndices))].sort((a,b)=>a-b),Array.from({length:len},(_,i)=>i));
 assert.ok(p.sessions.some(s=>s.title.includes('trecho 8 de 8')));
 assert.ok(p.sessions.every(s=>s.date<p.exam));
});
test('simulados completos são opcionais e adicionais; revisão leve não abre conteúdo novo',()=>{
 const p=make(),sim=p.sessions.filter(s=>s.optional);
 assert.deepEqual(sim.map(s=>[s.date,s.minutes]),[['2027-01-17',240],['2027-01-24',240]]);
 assert.ok(p.sessions.filter(s=>daysBetween(s.date,p.exam)<=2).every(s=>s.phase==='Revisão leve'&&!s.topicIndices.length));
});
test('datas e semanas não variam com DST; prova realizada não produz sessões futuras',()=>{
 assert.equal(monday('2027-01-03'),'2026-12-28');
 assert.equal(nextSession(make(),'2027-02-01'),null);
 assert.equal(make({start:'2027-02-01'}).sessions.length,0);
});
test('configuração opcional nula e matérias ausentes continuam abrindo o plano',()=>{
 assert.equal(make(null).options.minutes,60);
 const p=buildIbgePlan(contest,[],null);assert.equal(p.missing.length,3);assert.ok(p.sessions.length);
});
test('rotina alternativa respeita dias, duração e início, sem perder as três matérias',()=>{
 const p=make({start:'2026-12-01',days:[3,6],minutes:30});
 assert.ok(p.sessions.filter(s=>!s.optional).every(s=>[3,6].includes(new Date(s.date).getUTCDay())&&s.minutes===30&&s.date>='2026-12-01'));
 assert.equal(new Set(p.sessions.filter(s=>!s.optional).map(s=>s.lane)).size,3);
});
test('completar preserva dados de origem e não reaproveita marcações após mudar conteúdo ou duração',()=>{
 const first=make().sessions[0],state={start:'2026-11-12',done:{[first.key]:{date:first.date,at:first.date,label:first.title,minutes:first.minutes}}};
 assert.equal(make(state).sessions[0].done,true);
 assert.equal(make({...state,minutes:45}).sessions[0].done,false);
 const o=planOptions(state);delete o.done[first.key];assert.ok(state.done[first.key]);
 const changed=structuredClone(subjects);changed[1].t[0]='Outro conteúdo';
 const math=make().sessions.find(s=>s.lane==='math');
 assert.notEqual(buildIbgePlan(contest,changed).sessions.find(s=>s.date===math.date).key,math.key);
});
test('perfil identifica Recenseador sem capturar outro cargo do IBGE ou um arquivado',()=>{
 assert.equal(findIbge([{...contest,arquivado:true}]),null);
 assert.equal(findIbge([{id:'outro',titulo:'IBGE — APM',cargo:'Agente'}]),null);
 assert.equal(findIbge([{id:'novo',titulo:'IBGE Recenseador'}]).id,'novo');
});
test('pacote incorporado é importável, reimportação não duplica e progresso antigo fica separado',()=>{
 const current={concursos:[],materias:[{id:'lp',n:'Existente',t:['Crase']}]};
 const normalize=c=>c;
 const first=planContestImport(JSON.stringify(pkg),current,normalize),next=applyContestImport(current,first);
 assert.equal(first.concursos.length,1);assert.equal(first.materias.length,3);assert.equal(current.concursos.length,0);
 assert.equal(next.materias[0].id,'lp');assert.equal(planContestImport(JSON.stringify(pkg),next,normalize).concursos.length,0);
 validateSnapshot({t:{'lp:0':{e:'2026-11-12'}},d:next},{complete:true});
});
test('backup aceita plano e histórico completo e recusa rotina malformada antes de substituir dados',()=>{
 const s=make().sessions[0],plan={start:'2026-11-12',days:[1,2,4,5],minutes:60,done:{[s.key]:{date:s.date,at:'2026-11-12',label:s.title,minutes:s.minutes}}};
 const snap={t:{},d:{concursos:[contest],materias:subjects,planoIBGE:plan}};
 validateSnapshot(JSON.parse(JSON.stringify(snap)),{complete:true});
 for(const bad of [{days:[]},{days:[8]},{minutes:1},{start:'2026-02-30'},{done:{x:true}}])assert.throws(()=>validateSnapshot({...snap,d:{...snap.d,planoIBGE:bad}}),/planoIBGE/);
});
