import {app} from './state.js';
import {IBGE_PACKAGE} from './ibge-data.js';
import {applyContestImport, planContestImport} from './importing.js';
import {buildIbgePlan, findIbge, monday, nextSession, plusDays, daysBetween, validDate, weekSessions} from './ibge-plan.js';

let selectedWeek = '';
const context = () => {
  const contest=findIbge(app.CC());
  return contest ? {contest,plan:buildIbgePlan(contest,app.MT(),app.DADOS.planoIBGE)} : null;
};
const dateLabel = date => new Intl.DateTimeFormat('pt-BR',{weekday:'short',day:'2-digit',month:'2-digit',timeZone:'UTC'}).format(new Date(date));
const shortDate = date => app.brDate(date).slice(0,5);
const action = (type,label,extra='',css='ghost') => `<button class="btn ${css}" data-ibge-action="${type}" ${extra}>${label}</button>`;
const link = (url,label) => `<a href="${app.href(url)}" target="_blank" rel="noopener">${label} ${app.ic('i5')}</a>`;
function saveData(data) {
  if(app.arranqueCorrompido||app.arranqueDuvidoso)throw Error('Recupere a cópia salva antes de alterar a preparação. Seus dados foram preservados.');
  const next=app.prepararEstado({...app.S,d:data,updatedAt:new Date().toISOString()},true);
  app.persistirEstado(next);
  app.agendarSync();
  const error=document.getElementById('ibge-message');if(error)error.hidden=true;
}
function message(text) {
  const el=document.getElementById('ibge-message');if(el){el.textContent=text;el.hidden=false;el.scrollIntoView?.({block:'nearest'});}
}
function sessionCard(s, compact=false) {
  return `<article class="study-session lane-${s.lane}${s.done?' is-done':''}">
    <div class="session-date"><span>${app.tx(dateLabel(s.date))}</span><span>${s.minutes} min${s.optional?' · extra opcional':''}</span></div>
    <div class="session-content"><span class="session-subject">${app.tx(s.label)}</span><h4>${app.tx(s.title)}</h4>${compact?'':`<p>${app.tx(s.detail)}</p>`}</div>
    <div class="session-actions">${s.mid?action('subject','Abrir matéria',`data-mid="${app.ea(s.mid)}"`):''}<button class="btn ${s.done?'ghost':'primary'}" data-ibge-action="done" data-key="${app.ea(s.key)}" aria-pressed="${s.done}" aria-label="${app.ea((s.done?'Desmarcar':'Concluir')+' sessão de '+s.label+' em '+app.brDate(s.date))}">${s.done?'Concluída ✓':'Marcar feita'}</button></div>
  </article>`;
}
function deadlineSummary(contest,today) {
  const rows=(contest.cronograma?.length?contest.cronograma:IBGE_PACKAGE.concursos[0].cronograma).filter(r=>validDate(r.end)&&r.end>=today).sort((a,b)=>a.end.localeCompare(b.end));
  return rows.slice(0,3).map(r=>`<li><time datetime="${r.end}">${shortDate(r.end)}</time><span>${app.tx(r.label)}</span></li>`).join('')||'<li>Acompanhe os resultados e comunicados na banca.</li>';
}
app.renderIbgePlan = function () {
  const home=document.getElementById('ibge-home'),full=document.getElementById('ibge-calendar');
  if(!home||!full)return;
  const ctx=context(),today=app.hoje();
  document.body.classList.toggle('ibge-active',!!ctx);
  const label=document.getElementById('home-tab-label');if(label)label.textContent=ctx?'Meu plano':'Concursos';
  const hero=document.getElementById('hero');if(hero)hero.hidden=!!ctx;
  const welcome=document.getElementById('bemvindo');if(welcome&&!app.CC().length)welcome.hidden=true;
  if(!ctx){
    home.innerHTML=`<section class="ibge-setup"><span class="plan-eyebrow">Preparação direcionada</span><h2>Seu plano para o IBGE</h2><p>Recenseador · Edital 03/2026 · prova prevista para 31/01/2027. Prepare as três matérias e acompanhe as semanas até a prova.</p>${action('install','Preparar IBGE','','primary')}<p class="plan-caption">Adiciona a ficha e as matérias que faltam, preservando seus outros concursos.</p></section>`;
    full.innerHTML='<p class="pn-empty">Prepare o IBGE na tela inicial para abrir seu cronograma de estudos.</p>';return;
  }
  const {contest,plan}=ctx,left=daysBetween(today,plan.exam),next=nextSession(plan,today),current=weekSessions(plan,today),regular=current.filter(s=>!s.optional),completed=regular.filter(s=>s.done).length;
  const pending=plan.sessions.filter(s=>s.date<today&&!s.done&&!s.optional);
  const weekMinutes=regular.reduce((n,s)=>n+s.minutes,0);
  home.innerHTML=`<section class="ibge-overview" aria-labelledby="ibge-title"><div class="plan-heading"><div><span class="plan-eyebrow">Foco da preparação</span><h2 id="ibge-title">IBGE · Recenseador</h2><p>Cesgranrio · ${app.brDate(plan.exam)}${plan.exam==='2027-01-31'?' · 13h–17h':''}</p></div><div class="plan-countdown"><b>${left>0?left:left===0?'Hoje':'Fim'}</b><span>${left>0?'dias até a prova':left===0?'dia da prova':'prova realizada'}</span></div></div>
    <div class="plan-links">${action('calendar',app.ic('i11')+'Ver cronograma','','primary')}${action('settings',app.ic('i37')+'Ajustar rotina')}</div>
    <div class="plan-week-progress"><span><b>${completed}/${regular.length}</b> sessões nesta semana</span><span>${weekMinutes} min planejados${current.some(s=>s.optional)?' + simulado opcional':''}</span></div>
  </section>
  <section class="plan-next" aria-labelledby="next-session-title"><div class="plan-section-heading"><h3 id="next-session-title">${left===0?'Hoje é a prova':left<0?'Depois da prova':next?.date===today?'Seu estudo de hoje':'Próximo estudo'}</h3>${next?`<span>${app.tx(dateLabel(next.date))}</span>`:''}</div>
    ${left<=0?`<p>${left===0?'Confira o cartão de confirmação, documento, caneta e deslocamento. Os horários dos portões constam no cartão.':'Consulte o gabarito e acompanhe os recursos e o resultado na banca.'}</p>`:next?sessionCard(next,true):'<p>As sessões futuras estão concluídas. Use o cronograma para revisar as semanas anteriores.</p>'}
    ${pending.length&&left>0?`<p class="plan-caption">${pending.length} sessão(ões) anterior(es) sem marcação. ${action('pending','Ver pendências')}</p>`:''}
  </section>
  <div class="plan-home-bottom"><section class="plan-weights"><h3>O peso da prova</h3><div class="weight-bar" aria-hidden="true"><i></i><i></i><i></i></div><ul><li><b>50%</b> Técnicos · 30 questões</li><li><b>25%</b> Português · 15 questões</li><li><b>25%</b> Matemática · 15 questões</li></ul></section><details class="plan-deadlines"><summary>Prazos da seleção</summary><ul>${deadlineSummary(contest,today)}</ul>${link(contest.urlBanca||IBGE_PACKAGE.concursos[0].urlBanca,'Conferir na banca')}</details></div>`;
  const min=monday(plan.options.start),max=monday(plan.exam);
  if(!selectedWeek||selectedWeek<min||selectedWeek>max)selectedWeek=monday(today<plan.options.start?plan.options.start:today>plan.exam?plan.exam:today);
  const week=weekSessions(plan,selectedWeek),finish=plusDays(selectedWeek,6);
  const phases=[['Base do edital',plan.options.start,plusDays(plan.exam,-45),'Leitura e exercícios das três matérias.'],['Consolidação',plusDays(plan.exam,-44),plusDays(plan.exam,-15),'Repetir conceitos e corrigir dificuldades.'],['Revisão final',plusDays(plan.exam,-14),plusDays(plan.exam,-3),'Questões, erros e dois simulados sugeridos.'],['Revisão leve',plusDays(plan.exam,-2),plusDays(plan.exam,-1),'Revisar o essencial e preparar o dia da prova.']].filter(([,a,b])=>b>=plan.options.start&&a<plan.exam);
  const changedDate=plan.exam!=='2027-01-31';
  full.innerHTML=`<header class="calendar-title"><div><span class="plan-eyebrow">Cronograma de estudos</span><h2>Seu cronograma</h2><p>${plan.options.days.length} dias por semana · ${plan.options.minutes} min por sessão · horários livres</p></div>${action('settings','Ajustar rotina')}</header>
    <p class="plan-caption">Plano sugerido. ${changedDate?'A data foi alterada na sua ficha; confirme-a na banca.':'Prova prevista no Edital 03/2026; acompanhe retificações.'}</p>
    ${plan.missing.length?`<p class="plan-warning">Faltam matérias vinculadas: ${app.tx(plan.missing.join(', '))}. ${action('subjects','Revisar matérias')}</p>`:''}
    <div class="week-navigation"><button class="icon-btn" data-ibge-action="previous" aria-label="Semana anterior" ${selectedWeek<=min?'disabled':''}>←</button><div><h4>${shortDate(selectedWeek)} a ${shortDate(finish)}</h4><span>${selectedWeek===monday(today)?'Esta semana':selectedWeek.slice(0,4)}</span></div><button class="icon-btn" data-ibge-action="next" aria-label="Próxima semana" ${selectedWeek>=max?'disabled':''}>→</button>${action('today','Hoje')}</div>
    <div class="session-list">${week.map(s=>sessionCard(s)).join('')||`<p class="pn-empty">${plan.exam>=selectedWeek&&plan.exam<=finish?'Semana da prova: confira os documentos e o local.':'Nenhuma sessão nos dias selecionados nesta semana.'}</p>`}</div>
    <details class="plan-roadmap"><summary>Etapas até a prova</summary><ol>${phases.map(([n,a,b,d])=>`<li><span>${shortDate(a<plan.options.start?plan.options.start:a)} a ${shortDate(b)}</span><h4>${n}</h4><p>${d}</p></li>`).join('')}</ol></details>
    <details class="plan-method"><summary>Como usar o plano e o material</summary><p>Concluir uma sessão registra sua realização. Marque separadamente os tópicos estudados, as revisões e as questões na lista do edital.</p><p>Reserve cerca de 10 minutos para revisão, 30 para o conteúdo e 20 para prática em uma sessão de 60 minutos. Nos dias de Matemática, priorize resolver problemas. Ajuste essas proporções nos blocos mais curtos.</p><p>Os oito trechos de Técnicos são uma divisão de estudo da apostila atual, em partes semelhantes; não são capítulos oficiais. Se um trecho aparecer novamente, use a sessão para recuperar os conceitos e testar o que reteve.</p><p>Os simulados completos exigem até 4 horas adicionais, fora da rotina semanal. Use uma prova ou bateria externa na distribuição 30/15/15 e registre os acertos em Questões. A realização não estima sua nota.</p><p>Avance com a apostila da seleção de Recenseador. Materiais de outros cargos podem ter diferenças.</p>${link(contest.urlBanca||IBGE_PACKAGE.concursos[0].urlBanca,'Apostila e comunicados — Cesgranrio')} · ${link(IBGE_PACKAGE.concursos[0].links[1].u+'#page=138','Programa do edital')}</details>
    <details class="plan-deadlines"><summary>Datas oficiais da seleção</summary><p>Datas previstas na ficha. Recursos e pagamentos dependem da sua situação; confira a íntegra na banca.</p><ul>${(contest.cronograma||[]).map(r=>`<li><time>${app.tx(r.d||app.brDate(r.end))}</time><span>${app.tx(r.label)}</span></li>`).join('')}</ul>${link(contest.urlBanca||IBGE_PACKAGE.concursos[0].urlBanca,'Abrir a banca')}</details>`;
};
function openCalendar(date) {
  if(date)selectedWeek=monday(date);
  app.renderIbgePlan();app.goAnchor('estudo','ibge-calendar');
}
function settings() {
  const ctx=context();if(!ctx)return;
  const o=ctx.plan.options,days=['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
  app.modalAbrir(app.modalHead('Sua rotina de estudos','i11','modalFechar()')+`<form id="ibge-settings"><div class="modal-b"><p>Escolha os dias disponíveis. O plano distribui as três matérias até a prova, com maior frequência de Técnicos.</p><div class="fld"><label for="ibge-start">Início do plano</label><input id="ibge-start" type="date" min="2026-01-01" max="${plusDays(ctx.plan.exam,-1)}" value="${o.start}" required/></div><fieldset class="plan-day-options"><legend>Dias de estudo</legend>${[1,2,3,4,5,6,0].map(d=>`<label><input type="checkbox" name="ibge-day" value="${d}" ${o.days.includes(d)?'checked':''}/><span>${days[d]}</span></label>`).join('')}</fieldset><div class="fld"><label for="ibge-minutes">Duração de cada sessão</label><select id="ibge-minutes">${[30,45,60,90].map(n=>`<option value="${n}" ${n===o.minutes?'selected':''}>${n} minutos</option>`).join('')}</select></div><p class="plan-caption">Sugestão inicial: seg/ter/qui/sex, 60 minutos. Sem horários fixos. Alterações preservam o histórico; uma sessão com conteúdo ou duração diferente fica novamente por concluir.</p><p id="ibge-settings-error" class="plan-warning" role="alert" hidden></p></div><div class="modal-f"><button class="btn ghost" type="button" data-ibge-action="close">Cancelar</button><button class="btn primary" type="submit">Salvar rotina</button></div></form>`,true);
}
export function handleIbgeAction(event) {
  const button=event.target.closest('[data-ibge-action]');if(!button)return;
  const {ibgeAction:type}=button.dataset;
  try {
    if(type==='install'){
      const archived=findIbge(app.CCT().map(c=>({...c,arquivado:false})));
      if(archived){const data=structuredClone(app.DADOS);data.concursos.find(c=>c.id===archived.id).arquivado=false;saveData(data);app.renderTudo();return;}
      const plan=planContestImport(JSON.stringify(IBGE_PACKAGE),app.DADOS,app.ccNormalizar);
      saveData(applyContestImport(app.DADOS,plan));app.renderTudo();return;
    }
    if(type==='close'){app.modalFechar();return;}
    if(type==='calendar'){openCalendar();return;}
    if(type==='settings'){settings();return;}
    if(type==='subjects'){app.edMaterias();return;}
    const ctx=context();if(!ctx)return;
    if(type==='pending'){openCalendar(ctx.plan.sessions.find(s=>s.date<app.hoje()&&!s.done&&!s.optional)?.date);return;}
    if(type==='previous'||type==='next'){selectedWeek=plusDays(selectedWeek,type==='previous'?-7:7);app.renderIbgePlan();return;}
    if(type==='today'){selectedWeek='';app.renderIbgePlan();return;}
    if(type==='subject'){
      const mid=button.dataset.mid;
      if(!app.mById(mid))return;
      app.fltr=ctx.contest.id;app.renderFiltros();app.ckOpen[mid]=true;app.renderCheck();
      app.showView('estudo');app.togglePainel(true);app.paneSet('pn','check');app.toggleDrawer(false);
      setTimeout(()=>document.getElementById('ckm-'+mid)?.scrollIntoView({behavior:'smooth',block:'start'}),140);return;
    }
    if(type==='done'){
      const session=ctx.plan.sessions.find(s=>s.key===button.dataset.key);if(!session)return;
      const source=button.closest?.('#ibge-home')?'ibge-home':'ibge-calendar';
      const data=structuredClone(app.DADOS),o=ctx.plan.options;
      if(o.done[session.key])delete o.done[session.key];else o.done[session.key]={date:session.date,at:app.hoje(),label:session.title,minutes:session.minutes};
      data.planoIBGE=o;saveData(data);app.renderIbgePlan();
      document.getElementById(source)?.querySelector(`[data-ibge-action="done"][data-key="${session.key}"]`)?.focus({preventScroll:true});
    }
  } catch(error){message(error.message);}
}
if(typeof document!=='undefined'){
  document.addEventListener('click',handleIbgeAction);
  document.addEventListener('submit',event=>{
    if(event.target.id!=='ibge-settings')return;event.preventDefault();
    try {
      const days=[...document.querySelectorAll('input[name="ibge-day"]:checked')].map(el=>Number(el.value));
      const start=document.getElementById('ibge-start').value,minutes=Number(document.getElementById('ibge-minutes').value),ctx=context();
      if(!ctx)return;
      if(!days.length)throw Error('Selecione pelo menos um dia da semana.');
      if(!validDate(start)||start>=ctx.plan.exam||daysBetween(start,ctx.plan.exam)>730)throw Error('Escolha um início válido antes da prova (até dois anos de preparação).');
      const data=structuredClone(app.DADOS);data.planoIBGE={...ctx.plan.options,start,days,minutes};saveData(data);selectedWeek='';app.modalFechar();app.renderIbgePlan();
    } catch(error){const el=document.getElementById('ibge-settings-error');if(el){el.hidden=false;el.textContent=error.message;}}
  });
}
