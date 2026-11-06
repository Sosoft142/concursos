import { app } from './state.js';
import { filterContests, nextDeadline } from './catalog.js';

app.ccQuery = '';
app.ccFilter = 'all';

app.renderCards = function () {
  const list = document.getElementById('cc-list');
  if (!list) return;
  const contests = app.CC();
  const visible = filterContests(contests, {query: app.ccQuery, filter: app.ccFilter});
  const toolbar = document.getElementById('contest-toolbar');
  if (toolbar) toolbar.hidden = !contests.length;
  const count = document.getElementById('contest-count');
  if (count) count.textContent = `${visible.length} de ${contests.length}`;
  list.innerHTML = visible.map(contest => {
    const color = app.corVar(contest.cor);
    const deadline = app.inscFim(contest);
    const days = contest.prova ? app.dto(contest.prova) : null;
    return `<article class="card cc" style="--ac:${color}">
      <div class="cc-main">
        <div class="cc-kicker">${app.tx(contest.bancaCurto || contest.curto || 'Concurso público')}${contest.nivel ? ` · ${app.tx(contest.nivel)}` : ''}</div>
        <h4>${app.tx(contest.titulo)}</h4>
        ${contest.cargo ? `<p class="role">${app.tx(contest.cargo)}</p>` : ''}
        <div class="cc-dates">
          <span>${app.ic('i11')}<span>${contest.prova ? `Prova <b>${app.brDate(contest.prova)}</b>${days < 0 ? ' · realizada' : days === 0 ? ' · hoje' : days === 1 ? ' · amanhã' : ` · em ${days} dias`}` : 'Prova com data a definir'}</span></span>
          ${deadline && !contest.inscrita ? `<span>Inscrições até <b>${app.brDate(deadline)}</b></span>` : ''}
        </div>
        <div class="cc-tags">
          <span class="chip ${contest.inscrita ? 'green' : ''}">${contest.inscrita ? 'Inscrição feita' : 'De olho'}</span>
          ${app.chipInscricao(contest, true)}
          ${contest.vagasChip ? `<span class="chip primary">${app.tx(contest.vagasChip)}</span>` : ''}
        </div>
      </div>
      <div class="cc-cta">
        <button class="btn primary" data-contest-action="open" data-id="${app.ea(contest.id)}">${app.ic('i2')}Ver concurso</button>
        ${contest.urlBanca ? `<a class="cc-source" href="${app.ea(contest.urlBanca)}" target="_blank" rel="noopener">Banca ${app.ic('i5')}</a>` : ''}
        <button class="cc-manage icon-btn" data-contest-action="manage" data-id="${app.ea(contest.id)}" aria-label="Gerenciar ${app.ea(contest.titulo)}" title="Gerenciar concurso"><svg viewBox="0 0 24 24"><path d="m9 3-.5 2.5-1.4.8-2.4-.8-2.4 4.2 1.9 1.7v1.6l-1.9 1.7 2.4 4.2 2.4-.8 1.4.8L9 21h6l.5-2.5 1.4-.8 2.4.8 2.4-4.2-1.9-1.7v-1.6l1.9-1.7-2.4-4.2-2.4.8-1.4-.8L15 3Z"/><circle cx="12" cy="12" r="3"/></svg></button>
      </div>
    </article>`;
  }).join('') || (contests.length
    ? '<p class="pn-empty">Nenhum concurso corresponde à busca ou ao filtro.</p>'
    : '<p class="pn-empty">Seus concursos aparecerão aqui.</p>');
  app.renderContagem();
  app.renderBoasVindas();
  const next = nextDeadline(contests, app.hoje(), app.inscFim);
  const summary = document.getElementById('next-deadline');
  if (summary) summary.innerHTML = next
    ? `${next.kind === 'registration' ? 'Próxima inscrição' : 'Próxima prova'}: <b>${app.tx(app.nomeCurto(next.contest))}</b> · ${app.brDate(next.date)}`
    : contests.length ? 'Acompanhe inscrições, provas e resultados em um só lugar.' : 'Organize os editais e sua preparação.';
};

app.renderBoasVindas = function () {
  const welcome = document.getElementById('bemvindo');
  const hero = document.getElementById('hero');
  if (!welcome) return;
  const empty = !app.CCT().length;
  if (hero) hero.hidden = empty;
  welcome.hidden = !empty;
  welcome.innerHTML = empty ? `<div class="bv-h"><span class="bv-ic">${app.ic('i24')}</span><div><h3>Seu próximo passo começa aqui</h3><p>Reúna editais, acompanhe prazos e organize seus estudos.</p></div></div>
    <div class="bv-acts"><button class="btn primary" onclick="edNovo()">${app.ic('i30')}Adicionar primeiro concurso</button><button class="btn ghost" onclick="abrirSync()">${app.ic('i31')}Recuperar meus dados</button></div>
    <details class="bv-help"><summary>Como funciona</summary><p>Cadastre um edital, selecione as matérias e acompanhe revisões, questões e flashcards na aba Estudos. Os dados ficam neste aparelho; a sincronização conecta seus dispositivos. Um backup também pode ser restaurado nas configurações.</p></details>` : '';
};

app.ccManage = function (id) {
  const contest = app.cById(id);
  if (!contest) return;
  const action = (name, icon, label) => `<button class="manage-action" data-contest-action="${name}" data-id="${app.ea(id)}">${app.ic(icon)}<span>${label}</span></button>`;
  app.modalAbrir(app.modalHead('Gerenciar concurso', 'i23', 'modalFechar()') + `<div class="modal-b"><p class="manage-title">${app.tx(contest.titulo)}</p><div class="manage-list">${action('edit', 'i28', 'Editar informações')}${action('register', 'i10', contest.inscrita ? 'Marcar como de olho' : 'Marcar inscrição feita')}${action('up', 'i8', 'Mover para cima')}${action('down', 'i8', 'Mover para baixo')}${action('export', 'i15', 'Copiar ficha')}${action('archive', 'i34', 'Arquivar concurso')}</div></div>`, true);
};

document.addEventListener('click', event => {
  const button = event.target.closest('[data-contest-action]');
  if (!button) return;
  const {contestAction: action, id} = button.dataset;
  if (action === 'open') app.openConcurso(id);
  else if (action === 'manage') app.ccManage(id);
  else if (action === 'edit') app.edEditar(id);
  else if (action === 'export') app.ccExportar(id);
  else if (action === 'up' || action === 'down') { app.ccMover(id, action === 'up' ? -1 : 1); app.modalFechar(); }
  else if (action === 'archive') { app.modalFechar(); app.arqToggle(id); }
  else if (action === 'register') {
    const contest = app.cById(id);
    if (contest) { contest.inscrita = !contest.inscrita; app.saveS(); app.modalFechar(); app.renderTudo(); }
  }
});

document.addEventListener('input', event => {
  if (event.target.id !== 'contest-search') return;
  app.ccQuery = event.target.value;
  app.renderCards();
});
document.addEventListener('change', event => {
  if (event.target.id !== 'contest-filter') return;
  app.ccFilter = event.target.value;
  app.renderCards();
});
