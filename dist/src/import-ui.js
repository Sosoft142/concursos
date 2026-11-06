import {app} from './state.js';
import {MAX_IMPORT_BYTES, planContestImport, applyContestImport} from './importing.js';

let prepared = null;
let importText = '';
let readVersion = 0;

app.openContestImport = function () {
  prepared = null;
  importText = '';
  readVersion++;
  app.modalAbrir(app.modalHead('Importar concurso', 'i15', 'modalFechar()') + `<div class="modal-b import-dialog">
    <p>Adicione uma ficha pronta. Pacotes também podem trazer as matérias e os tópicos do edital.</p>
    <div class="fld"><label for="contest-import-file">Arquivo JSON</label><input id="contest-import-file" type="file" accept=".json,application/json"/></div>
    <details><summary>Colar o texto da ficha</summary><div class="fld"><label for="contest-import-text">Conteúdo JSON</label><textarea id="contest-import-text" spellcheck="false" placeholder="Cole aqui o conteúdo completo da ficha"></textarea></div><button class="btn ghost" data-import-action="preview">Conferir texto</button></details>
    <p id="contest-import-error" role="alert" hidden></p><div id="contest-import-preview" aria-live="polite"></div>
    </div><div class="modal-f"><button class="btn ghost" onclick="modalFechar()">Cancelar</button><button class="btn primary" data-import-action="apply" disabled>Adicionar ao app</button></div>`, true);
};

function showError(error) {
  prepared = null;
  const message = document.getElementById('contest-import-error');
  if (message) {message.hidden = false; message.textContent = error.message || 'Não foi possível ler o arquivo.';}
  const button = document.querySelector('[data-import-action="apply"]');
  if (button) button.disabled = true;
  const preview = document.getElementById('contest-import-preview');
  if (preview) preview.innerHTML = '';
}
function preview(text) {
  importText = text;
  try {
    prepared = planContestImport(text, app.DADOS, app.ccNormalizar);
    const error = document.getElementById('contest-import-error');
    if (error) {error.hidden = true; error.textContent = '';}
    const target = document.getElementById('contest-import-preview');
    const topics = prepared.materias.reduce((total, subject) => total + subject.t.length, 0);
    if (target) target.innerHTML = `<div class="import-preview"><h4>${prepared.concursos.length ? 'Pronto para adicionar' : 'Este concurso já está no app'}</h4>${prepared.concursos.length ? `<ul>${prepared.concursos.map(contest => `<li>${app.tx(contest.titulo)}</li>`).join('')}</ul><p>${prepared.materias.length} matérias novas · ${topics} tópicos</p>` : ''}${prepared.skipped.length ? `<p>${prepared.skipped.length} ficha(s) já existente(s) serão mantidas, com suas anotações e progresso.</p>` : ''}</div>`;
    const button = document.querySelector('[data-import-action="apply"]');
    if (button) button.disabled = !prepared.concursos.length;
  } catch (error) {showError(error);}
}
document.addEventListener('change', async event => {
  if (event.target.id !== 'contest-import-file') return;
  const file = event.target.files?.[0];
  if (!file) return;
  const version = ++readVersion;
  prepared = null;
  const button = document.querySelector('[data-import-action="apply"]');
  if (button) button.disabled = true;
  try {
    if (file.size > MAX_IMPORT_BYTES) throw new Error('O arquivo excede o limite de 5 MB.');
    const text = await file.text();
    if (version !== readVersion || !document.getElementById('contest-import-file')) return;
    preview(text);
  } catch (error) {if (version === readVersion) showError(error);}
});
document.addEventListener('input', event => {
  if (event.target.id !== 'contest-import-text') return;
  readVersion++;
  prepared = null;
  const button = document.querySelector('[data-import-action="apply"]');
  if (button) button.disabled = true;
});
document.addEventListener('click', event => {
  const action = event.target.closest('[data-import-action]')?.dataset.importAction;
  if (action === 'preview') {readVersion++; preview(document.getElementById('contest-import-text')?.value || '');}
  if (action !== 'apply' || !prepared?.concursos.length) return;
  try {
    // Revalidate against current state in case synchronization completed during review.
    const plan = planContestImport(importText, app.DADOS, app.ccNormalizar);
    if (!plan.concursos.length) {preview(importText); return;}
    if (app.guardaBloqueia()) throw new Error('O app está verificando ou recuperando os dados salvos. Confira sua lista e tente importar novamente.');
    app.DADOS = applyContestImport(app.DADOS, plan);
    app.DADOS.updatedAt = new Date().toISOString();
    app.migrarDados();
    app.saveS();
    app.renderTudo();
    if (!app.persistOk) {showError(new Error('A ficha está nesta sessão, mas o navegador não conseguiu salvá-la. Libere espaço e faça um backup.')); return;}
    prepared = null;
    const first = plan.concursos[0];
    const sync = app.syncState === 'on' ? 'A sincronização conectada enviará a ficha e as matérias para os outros aparelhos.' : 'Para levar a ficha a outro aparelho, conecte a sincronização na nuvem do cabeçalho.';
    app.modalAbrir(app.modalHead('Concurso importado', 'i12', 'modalFechar()') + `<div class="modal-b"><p><b>${app.tx(first.titulo)}</b> foi adicionado com suas matérias.</p><p style="margin-top:12px">${sync}</p></div><div class="modal-f"><button class="btn primary" data-import-action="open" data-contest-id="${app.ea(first.id)}">Abrir concurso</button></div>`, true);
  } catch (error) {showError(error);}
});
document.addEventListener('click', event => {
  const button = event.target.closest('[data-import-action="open"]');
  if (!button) return;
  const id = button.dataset.contestId;
  app.modalFechar();
  // Let the modal's history entry close before recording the new area.
  setTimeout(() => app.goPane('estudo', id, 'cronograma'), 80);
});
