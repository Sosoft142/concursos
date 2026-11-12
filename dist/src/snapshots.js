// Validate before replacing any saved state. Missing optional legacy fields are
// migrated later; malformed collections must never reach rendering or storage.
import {validDate} from './ibge-plan.js';
const record=value=>!!value&&typeof value==='object'&&!Array.isArray(value);
const own=(value,key)=>Object.prototype.hasOwnProperty.call(value,key);
function requireShape(ok, field='') {if(!ok)throw new Error('Os dados do arquivo estão incompletos ou em formato inválido. Nada foi substituído.'+(field?' Campo: '+field+'.':''));}
function rows(value,key) {
 if(value[key]==null)return;
 requireShape(Array.isArray(value[key])&&value[key].every(record));
}
function identified(values,key='id',path='') {
 const ids=new Set();
 for(const value of values||[]) {
  requireShape(record(value)&&typeof value[key]==='string'&&!!value[key]&&!/["'<>\\]/.test(value[key])&&!ids.has(value[key]),path?path+'.'+key:key);
  ids.add(value[key]);
 }
}
export function validateSnapshot(value,{complete=false}={}) {
 requireShape(record(value)&&['t','qzl','qz','cy','fc','d'].some(key=>own(value,key)));
 if(own(value,'v'))requireShape(value.v===1||value.v===2);
 for(const key of ['t','cy','fc','ui','qz'])if(own(value,key))requireShape(record(value[key]));
 if(complete)requireShape(record(value.t)&&record(value.d));
 for(const key of ['t','cy','fc'])if(value[key])requireShape(Object.values(value[key]).every(record));
 if(value.ui){for(const key of ['cfg','panes','expl'])if(value.ui[key]!=null)requireShape(record(value.ui[key]));
 if(value.ui.cfg?.oculto!=null)requireShape(record(value.ui.cfg.oculto));}
 if(own(value,'qzl')) {
  rows(value,'qzl');
  requireShape(Array.isArray(value.qzl));
  for(const row of value.qzl){requireShape(Number.isSafeInteger(row.f)&&row.f>0&&Number.isSafeInteger(row.a)&&row.a>=0&&row.a<=row.f);if(row.id!=null)identified([row]);}
 }
 if(own(value,'d')) {
  const data=value.d;requireShape(record(data)&&Array.isArray(data.concursos)&&Array.isArray(data.materias));
  for(const key of ['concursos','materias','decks','cards','fontes','docs']) {
   rows(data,key);
   // Documents have always been positional {n,ic,u} records. doSalvar()
   // deliberately stores no ID; do not reject the app's own saved format.
   if(key!=='docs')identified(data[key],key==='cards'?'i':'id','d.'+key);
  }
  for(const subject of data.materias) {
   if(subject.t!=null)requireShape(Array.isArray(subject.t)&&subject.t.every(topic=>typeof topic==='string'||record(topic)&&typeof topic.n==='string'));
   rows(subject,'mat');
  }
  for(const contest of data.concursos) {
   for(const key of ['prova','inscAte'])if(contest[key]){const date=contest[key];requireShape(typeof date==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(date)&&Number.isFinite(Date.parse(date))&&new Date(date).toISOString().slice(0,10)===date);}
   for(const key of ['ficha','blocos','etapas','cronograma','links'])rows(contest,key);
   if(contest.mats!=null)requireShape(Array.isArray(contest.mats)&&contest.mats.every(id=>typeof id==='string'));
   for(const block of contest.blocos||[])rows(block,'itens');
   if(contest.raiox!=null) {
    requireShape(record(contest.raiox));for(const key of ['leg','bar','linhas'])rows(contest.raiox,key);
   }
  }
  for(const key of ['metas','ciclo'])if(data[key]!=null)requireShape(record(data[key]));
  if(data.ciclo)rows(data.ciclo,'blocos');
  if(data.planoIBGE!=null){
   const plan=data.planoIBGE;
   requireShape(record(plan),'d.planoIBGE');
   if(plan.start!=null)requireShape(validDate(plan.start),'d.planoIBGE.start');
   if(plan.days!=null)requireShape(Array.isArray(plan.days)&&plan.days.length>0&&plan.days.length<=7&&plan.days.every(d=>Number.isInteger(d)&&d>=0&&d<=6),'d.planoIBGE.days');
   if(plan.minutes!=null)requireShape([30,45,60,90].includes(plan.minutes),'d.planoIBGE.minutes');
   if(plan.done!=null)requireShape(record(plan.done)&&Object.values(plan.done).every(s=>record(s)&&validDate(s.date)&&validDate(s.at)&&typeof s.label==='string'&&Number.isInteger(s.minutes)&&s.minutes>0),'d.planoIBGE.done');
  }
  for(const source of data.fontes||[])rows(source,'itens');
 }
 return value;
}
export function isFullSnapshot(value) {try{validateSnapshot(value,{complete:true});return true;}catch{return false;}}
