// Calendar arithmetic uses UTC dates, independent of DST and device timezone.
export const IBGE_START = '2026-11-12';
export const IBGE_EXAM = '2027-01-31';
const DAY = 86400000;
export function validDate(date) {
  return typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date) && Number.isFinite(Date.parse(date)) && new Date(date).toISOString().slice(0,10) === date;
}
export function plusDays(date, days) { return new Date(Date.parse(date) + days * DAY).toISOString().slice(0,10); }
export function daysBetween(a, b) { return Math.round((Date.parse(b) - Date.parse(a)) / DAY); }
export function monday(date) { return plusDays(date, -((new Date(date).getUTCDay() + 6) % 7)); }
export function findIbge(contests) {
  return contests.find(c => !c.arquivado && (/^ibge-recenseador-2026(?:-|$)/.test(c.id || '') || /ibge/i.test([c.titulo,c.nome,c.curto,c.badge].join(' ')) && /recenseador/i.test([c.titulo,c.cargo,c.nome].join(' ')))) || null;
}
export function planOptions(data = {}) {
  if(!data||typeof data!=='object'||Array.isArray(data))data={};
  return {
    start: validDate(data.start) ? data.start : IBGE_START,
    days: Array.isArray(data.days) && data.days.length && data.days.every(d => Number.isInteger(d) && d>=0 && d<=6) ? [...new Set(data.days)].sort((a,b)=>(a+6)%7-(b+6)%7) : [1,2,4,5],
    minutes: [30,45,60,90].includes(data.minutes) ? data.minutes : 60,
    done: data.done && typeof data.done === 'object' && !Array.isArray(data.done) ? {...data.done} : {}
  };
}
function hash(text) { let h=2166136261;for(const c of text)h=Math.imul(h^c.charCodeAt(0),16777619);return (h>>>0).toString(36); }
function topicName(t) { return typeof t === 'string' ? t : t.n; }
export function buildIbgePlan(contest, subjects, settings = {}) {
  const options=planOptions(settings), exam=validDate(contest?.prova) ? contest.prova : IBGE_EXAM;
  const linked=subjects.filter(m=>(contest?.mats||[]).includes(m.id));
  const lanes=[{id:'tech',label:'Conhecimentos Técnicos',share:50,subject:linked.find(m=>/t[eé]cnic/i.test(m.n))}, {id:'port',label:'Língua Portuguesa',share:25,subject:linked.find(m=>/portugu[eê]s/i.test(m.n))}, {id:'math',label:'Matemática',share:25,subject:linked.find(m=>/matem[aá]tic/i.test(m.n))}];
  const dates=[];
  // Bound malformed or very distant configurations without creating an unbounded DOM.
  const limit=Math.min(730,Math.max(0,daysBetween(options.start,exam)));
  for(let i=0;i<limit;i++){const date=plusDays(options.start,i);if(options.days.includes(new Date(date).getUTCDay()))dates.push(date);}
  const cycle=['tech','port','tech','math'];
  const offset=dates.length ? options.days.indexOf(new Date(dates[0]).getUTCDay())%4 : 0;
  const counts={tech:0,port:0,math:0};
  dates.forEach((date,i)=>{if(daysBetween(date,exam)>14)counts[cycle[(i+offset)%4]]++;});
  const used={tech:0,port:0,math:0};
  const sessions=dates.map((date,i)=>{
    const lane=lanes.find(l=>l.id===cycle[(i+offset)%4]), left=daysBetween(date,exam);
    let title,detail,topicIndices=[],phase;
    if(left<=2){phase='Revisão leve';title='Rever erros e pontos essenciais';detail='Sem conteúdo novo. Revisão breve, documentos e descanso.';}
    else if(left<=14){phase='Revisão final';title='Questões e revisão dos erros';detail='Retome suas dificuldades nesta matéria; use o resultado dos simulados para escolher os tópicos.';}
    else {
      phase=left>44 ? 'Base do edital' : 'Consolidação';
      const index=used[lane.id]++, topics=lane.id==='tech' ? Array.from({length:8},(_,n)=>`Apostila oficial · trecho ${n+1} de 8`) : (lane.subject?.t||[]).map(topicName);
      if(topics.length){
        const from=Math.floor(index*topics.length/counts[lane.id]);
        const to=Math.max(from+1,Math.floor((index+1)*topics.length/counts[lane.id]));
        title=topics.slice(from,to).join(' + ');
        if(lane.id==='tech'){
          const visit=index-Math.ceil(from*counts[lane.id]/topics.length);
          const goal=['Ler e resumir','Recuperar conceitos','Treinar aplicação'][Math.min(2,visit)];
          title=`${goal} · ${to-from>1?'trechos '+(from+1)+' a '+to:'trecho '+(from+1)} de 8`;
        } else if(index&&Math.floor((index-1)*topics.length/counts[lane.id])===from)title='Fixação · '+title;
        if(lane.id!=='tech')topicIndices=Array.from({length:to-from},(_,j)=>from+j);
      } else title='Selecionar conteúdo desta matéria';
      detail=lane.id==='tech' ? 'Divida a apostila atual da Cesgranrio em 8 trechos semelhantes. Leia, recupere os conceitos sem consultar e confira suas respostas.' : 'Revise o encontro anterior, estude o conteúdo e resolva questões da Cesgranrio; registre os erros.';
    }
    return {date,lane:lane.id,label:lane.label,mid:lane.subject?.id||'',title,detail,phase,topicIndices,minutes:options.minutes,optional:false};
  });
  // Two optional full rehearsals; their four hours are additional to the weekly routine.
  const sundays=[];for(let date=plusDays(exam,-1);date>=options.start&&daysBetween(date,exam)<=21;date=plusDays(date,-1)){if(new Date(date).getUTCDay()===0)sundays.push(date);}
  sundays.slice(0,2).reverse().forEach((date,i)=>sessions.push({date,lane:'sim',label:'Simulado completo',title:`Simulado ${i+1} · 60 questões`,detail:'30 de Técnicos, 15 de Português e 15 de Matemática, em até 4 horas com cartão-resposta. Use material externo; o app registra a realização e os resultados.',phase:'Revisão final',minutes:240,optional:true,mid:'',topicIndices:[]}));
  sessions.sort((a,b)=>a.date.localeCompare(b.date)||Number(a.optional)-Number(b.optional));
  for(const s of sessions){s.key=`${s.date}|${s.lane}|${hash([contest?.id,s.title,s.mid,s.minutes].join('|'))}`;s.done=!!options.done[s.key];}
  return {exam,options,lanes,sessions,missing:lanes.filter(l=>!l.subject).map(l=>l.label)};
}
export function weekSessions(plan, date) { const start=monday(date),end=plusDays(start,6);return plan.sessions.filter(s=>s.date>=start&&s.date<=end); }
export function nextSession(plan,today) { return plan.sessions.find(s=>s.date>=today&&!s.done&&!s.optional)||plan.sessions.find(s=>s.date>=today&&!s.done)||null; }
