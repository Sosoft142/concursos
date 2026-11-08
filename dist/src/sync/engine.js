import { app } from '../state.js';
import {isFullSnapshot,validateSnapshot} from '../snapshots.js';

let connectionEpoch = 0;
function contentRevision() {return JSON.stringify([app.S.t,app.S.qzl,app.S.cy,app.S.fc,app.DADOS]);}
function revision() {return {at:app.dataUpdatedAt,content:contentRevision()};}
function changed(before) {return before.at!==app.dataUpdatedAt||before.content!==contentRevision();}
function current(operation) {return operation.epoch===connectionEpoch&&operation.token===app.syncToken;}
function begin() {
  if(app.syncBusy)return null;
  clearTimeout(app.syncTimer);app.syncTimer=null;app.syncBusy=true;app.renderPill();
  return {epoch:connectionEpoch,token:app.syncToken,gist:app.gistId,revision:revision()};
}
function finish(operation) {if(current(operation)){app.syncBusy=false;app.renderPill();app.syncModalMsg();}}
function conflict(message='Este aparelho e a nuvem têm versões diferentes. Nenhuma alteração local foi substituída.') {app.syncState='conflito';app.syncMsg=message;}
async function remoteFrom(gist) {
  let value=app.conteudoDoGist(gist);
  const file=gist?.files?.[app.GIST_FILE];
  if(file?.truncated) {
    // GitHub documents raw_url for content omitted from the API response.
    // Never forward the token or browser cookies to the raw-content host.
    const url=new URL(file.raw_url);
    if(url.protocol!=='https:'||url.hostname!=='gist.githubusercontent.com')throw new Error('O endereço da cópia completa não é válido. Nenhum dado foi substituído.');
    const response=await fetch(url.href,{credentials:'omit',referrerPolicy:'no-referrer'});
    if(!response.ok)throw new Error('Não consegui ler a cópia completa na nuvem. Tente novamente.');
    const text=await response.text();
    if(new TextEncoder().encode(text).byteLength>10*1024*1024)throw new Error('A cópia excede o limite de leitura de 10 MB. Use um backup manual para recuperá-la.');
    value=JSON.parse(text);
  }
  if(!value||typeof value!=='object')throw new Error('A cópia na nuvem está incompleta ou ilegível. Nenhum dado foi substituído.');
  validateSnapshot(value,{complete:true});
  return value;
}
function hasDraft() {return ['ED','EM','FE','FO','DO','ME','CI','CG'].some(key=>app[key]);}
function renderRemote() {app.aplicarAcento?.();app.renderTudo();app.togglePainel?.(app.S.ui.pn3!==0);}

app.nowISO = function () {
  return new Date().toISOString();
};
app.gistDesc = function () {
  return 'Organizador de Concursos — progresso e concursos sincronizados';
};
app.loadSync = function () {
  try {
    var o = JSON.parse(localStorage.getItem(app.SYNC_KEY) || '{}');
    app.syncToken = o.token || '';
    app.gistId = o.gist || '';
    app.lastSyncedAt = o.at || '';
    app.syncAt = o.when || '';
  } catch (e) {}
  if (app.syncToken && app.gistId) app.syncState = 'on';
  app.dataUpdatedAt = app.S.at || '';
};
app.saveSync = function () {
  try {
    localStorage.setItem(app.SYNC_KEY, JSON.stringify({
      token: app.syncToken,
      gist: app.gistId,
      at: app.lastSyncedAt,
      when: app.syncAt
    }));
  } catch (e) {}
};
app.esqueceSync = function () {
  connectionEpoch++;clearTimeout(app.syncTimer);app.syncTimer=null;app.syncBusy=false;
  app.syncToken = '';
  app.gistId = '';
  app.lastSyncedAt = '';
  app.syncAt = '';
  app.syncState = 'off';
  app.syncMsg = '';
  try {
    localStorage.removeItem(app.SYNC_KEY);
  } catch (e) {}
  app.renderPill();
};
app.gh = function (caminho, opts) {
  opts = opts || {};
  var req = {
    method: opts.method || 'GET',
    headers: {
      'Authorization': 'Bearer ' + app.syncToken,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    }
  };
  if (opts.body) {
    req.body = JSON.stringify(opts.body);
    req.headers['Content-Type'] = 'application/json';
  }
  return fetch('https://api.github.com' + caminho, req).then(function (r) {
    if (r.status === 401) throw new Error('Token inválido ou expirado. Gere um novo no GitHub.');
    if (r.status === 403) throw new Error('O GitHub recusou (limite de uso ou permissão de gist faltando).');
    if (r.status === 404) throw new Error('O arquivo de sincronização não foi encontrado nesta conta.');
    if (!r.ok) throw new Error('O GitHub respondeu com erro ' + r.status + '.');
    return r.json();
  });
};
app.payload = function () {
  return {
    v: 2,
    updatedAt: app.dataUpdatedAt || app.nowISO(),
    t: app.S.t,
    qzl: app.S.qzl,
    cy: app.S.cy,
    fc: app.S.fc,
    ui: app.S.ui,
    d: app.DADOS
  };
};
app.payloadCompleto = function (o) {
  return isFullSnapshot(o);
};
app.conteudoDoGist = function (g) {
  var f = g && g.files && g.files[app.GIST_FILE];
  if (!f || f.truncated || typeof f.content !== 'string') return null;
  try {
    return JSON.parse(f.content);
  } catch (e) {
    return null;
  }
};
app.corpoDoGist = function () {
  var files = {};
  files[app.GIST_FILE] = {
    content: JSON.stringify(app.payload(), null, 2)
  };
  return {
    description: app.gistDesc(),
    files: files
  };
};
app.aplicarRemoto = function (value) {
  if(!app.payloadCompleto(value))return false;
  const next=app.prepararEstado(value,true);
  next.at=value.updatedAt||app.nowISO();
  app.persistirEstado(next);
  app.lastSyncedAt=next.at;app.syncAt=app.nowISO();app.saveSync();
  return true;
};
app.syncFalhou = function (error) {
  app.syncState='erro';app.syncMsg=error?.message||'Falha ao sincronizar.';app.syncBusy=false;
  app.renderPill();app.syncModalMsg();
};
app.syncEnviar = async function (force=false) {
  if(app.syncState==='off'||!app.syncToken||!app.gistId)return;
  if(app.arranqueDuvidoso||app.arranqueCorrompido){
    app.syncState='erro';app.syncMsg='O envio está bloqueado porque os dados locais ainda não foram abertos. A cópia da nuvem foi preservada. Baixe a cópia da nuvem ou copie um backup dos dados locais.';
    app.renderPill();app.syncModalMsg();return;
  }
  const operation=begin();if(!operation)return;
  try {
    const gist=await app.gh('/gists/'+operation.gist);if(!current(operation))return;
    const remote=await remoteFrom(gist);if(!current(operation))return;
    const remoteAt=remote.updatedAt||'';
    if(!force&&remote.d.concursos.length&&!app.CCT().length) {
      conflict('Este aparelho está sem concursos e a nuvem tem '+remote.d.concursos.length+'. Não enviei nada. Use Baixar para recuperar ou Manter o deste aparelho para confirmar a exclusão.');return;
    }
    const unknown=!app.lastSyncedAt&&remoteAt!==app.dataUpdatedAt;
    if(!force&&(!remoteAt||unknown||app.lastSyncedAt&&remoteAt!==app.lastSyncedAt)) {conflict();return;}
    // Freeze both the payload and its revision before starting PATCH. Edits made
    // while it is in flight remain pending and get their own subsequent upload.
    const before=revision(),body=app.corpoDoGist();
    const sentAt=JSON.parse(body.files[app.GIST_FILE].content).updatedAt;
    await app.gh('/gists/'+operation.gist,{method:'PATCH',body});if(!current(operation))return;
    app.lastSyncedAt=sentAt;app.syncAt=app.nowISO();app.syncState='on';app.syncMsg='';app.saveSync();
    finish(operation);
    if(changed(before))app.agendarSync();
  } catch(error) {if(current(operation))app.syncFalhou(error);}
  finally {finish(operation);}
};
app.syncBaixar = async function () {
  if(!app.syncToken||!app.gistId)return;
  const operation=begin();if(!operation)return;
  try {
    const gist=await app.gh('/gists/'+operation.gist);if(!current(operation))return;
    const remote=await remoteFrom(gist);if(!current(operation))return;
    if(changed(operation.revision)||hasDraft()) {conflict('Há alterações feitas neste aparelho durante a consulta à nuvem. Nenhum dado foi substituído. Confira seu backup antes de escolher uma versão.');return;}
    app.aplicarRemoto(remote);app.syncState='on';app.syncMsg='';
    renderRemote();if(document.getElementById('sync-msg'))app.abrirSync();
  } catch(error) {if(current(operation))app.syncFalhou(error);}
  finally {finish(operation);}
};
app.agendarSync = function () {
  if(!['on','erro'].includes(app.syncState)||!app.syncToken||!app.gistId||app.arranqueDuvidoso||app.arranqueCorrompido)return;
  clearTimeout(app.syncTimer);
  app.syncTimer=setTimeout(()=>{app.syncTimer=null;app.syncEnviar(false);},2500);
  app.renderPill();
};
app.syncAoAbrir = async function () {
  if(!['on','erro'].includes(app.syncState)||!app.syncToken||!app.gistId)return;
  if(app.arranqueDuvidoso) {setTimeout(app.syncAoAbrir,600);return;}
  const operation=begin();if(!operation)return;
  try {
    const gist=await app.gh('/gists/'+operation.gist);if(!current(operation))return;
    const remote=await remoteFrom(gist);if(!current(operation))return;
    const remoteAt=remote.updatedAt||'';
    const localChanged=!!(app.dataUpdatedAt&&app.dataUpdatedAt!==app.lastSyncedAt)||!app.lastSyncedAt&&!app.estadoVirgem();
    const remoteChanged=!app.lastSyncedAt||remoteAt!==app.lastSyncedAt;
    if(remoteChanged&&(localChanged||changed(operation.revision)||hasDraft())&&!app.arranqueCorrompido) {conflict();return;}
    if(remoteChanged||app.arranqueCorrompido) {
      app.aplicarRemoto(remote);app.syncState='on';app.syncMsg='';renderRemote();return;
    }
    if(localChanged) {finish(operation);return await app.syncEnviar(false);}
    app.syncState='on';app.syncMsg='';app.syncAt=app.nowISO();app.saveSync();
  } catch(error) {if(current(operation))app.syncFalhou(error);}
  finally {finish(operation);}
};
app.syncConectar = async function () {
  if(app.syncBusy)return;
  const token=String(document.getElementById('sync-token')?.value||'').trim();
  if(!token) {app.syncMsg='Cole o token do GitHub para conectar.';app.syncModalMsg();return;}
  connectionEpoch++;app.syncToken=token;app.syncMsg='';
  const operation=begin();app.syncModalMsg();
  try {
    let page=1,list=await app.gh('/gists?per_page=100');if(!current(operation))return;
    let found=(list||[]).find(gist=>gist.files?.[app.GIST_FILE]);
    while(!found&&list.length===100){
      if(++page>100)throw new Error('Não consegui conferir todos os arquivos da conta. Nenhuma cópia nova foi criada.');
      list=await app.gh('/gists?per_page=100&page='+page);if(!current(operation))return;
      found=list.find(gist=>gist.files?.[app.GIST_FILE]);
    }
    if(found) {
      // The listing contains file metadata, not the complete backup content.
      const gist=await app.gh('/gists/'+found.id);if(!current(operation))return;
      const remote=await remoteFrom(gist);if(!current(operation))return;
      app.gistId=found.id;app.lastSyncedAt='';app.saveSync();
      if(changed(operation.revision)||hasDraft()) {conflict();return;}
      if(!confirm('Achei uma cópia deste organizador na sua conta do GitHub.\n\nVou baixá-la por cima do que está neste aparelho. Continuar?\n\nCancele e use Copiar backup antes se tiver algo aqui que não está na nuvem.')) {app.esqueceSync();return;}
      app.aplicarRemoto(remote);app.gistId=found.id;app.saveSync();renderRemote();
      app.syncMsg='Conectado! Os dados da nuvem foram baixados para este aparelho.';
    } else {
      if(app.arranqueDuvidoso||app.arranqueCorrompido)throw new Error('Recupere os dados deste aparelho antes de criar uma cópia na nuvem.');
      const before=revision(),body={public:false,description:app.gistDesc(),files:app.corpoDoGist().files};
      const sentAt=JSON.parse(body.files[app.GIST_FILE].content).updatedAt;
      const gist=await app.gh('/gists',{method:'POST',body});if(!current(operation))return;
      app.gistId=gist.id;app.lastSyncedAt=sentAt;app.syncAt=app.nowISO();
      if(!changed(before)) {app.dataUpdatedAt=sentAt;app.S.at=sentAt;app.saveS({noStamp:true,noSync:true});}
      app.saveSync();app.syncMsg='Conectado! A cópia deste aparelho foi enviada.';
    }
    app.syncState='on';finish(operation);app.abrirSync();
    if(app.dataUpdatedAt!==app.lastSyncedAt)app.agendarSync();
  } catch(error) {
    if(current(operation)) {app.esqueceSync();app.syncMsg=error?.message||'Falha ao conectar.';app.renderPill();app.syncModalMsg();}
  } finally {finish(operation);}
};
/* ---------- pílula no cabeçalho ---------- */
app.renderPill = function () {
  var p = document.getElementById('syncPill');
  if (!p) return;
  p.className = 'sync-pill' + (app.syncBusy ? ' busy' : app.syncState === 'on' ? ' on' : app.syncState === 'conflito' ? ' conflito' : app.syncState === 'erro' ? ' erro' : '');
  var l = p.querySelector('.slbl');
  const status = app.syncBusy ? 'Sincronizando…' : app.syncState === 'on' ? (app.dataUpdatedAt && app.dataUpdatedAt !== app.lastSyncedAt ? 'Alterações pendentes' : 'Sincronizado') : app.syncState === 'conflito' ? 'Conflito' : app.syncState === 'erro' ? 'Erro' : 'Sincronizar';
  if (l) l.textContent = status;
  p.setAttribute('aria-label', 'Sincronização: ' + status);
  p.setAttribute('title', app.syncMsg || (app.syncState === 'on' ? 'Última sincronização: ' + (app.syncAt ? new Date(app.syncAt).toLocaleString('pt-BR') : '—') : 'Sincronizar entre aparelhos'));
};
app.syncModalMsg = function () {
  var el = document.getElementById('sync-msg');
  if (!el) return;
  if (!app.syncMsg) {
    el.innerHTML = '';
    return;
  }
  var cls = app.syncState === 'erro' ? 'err' : app.syncState === 'conflito' ? 'warn' : 'ok';
  el.innerHTML = '<div class="sync-msg ' + cls + '">' + app.tx(app.syncMsg) + '</div>';
};
app.abrirSync = function () {
  var h = app.modalHead('Sincronizar entre aparelhos', 'i31', 'modalFechar()') + '<div class="modal-b"><div id="sync-msg"></div>';
  if (app.syncState === 'off') {
    h += '<p style="font-size:.88rem;color:var(--muted);margin-bottom:14px">O organizador guarda tudo <b>neste</b> aparelho. Para abrir no celular e no computador com o mesmo progresso, ele grava uma cópia particular num <b>Gist secreto</b> da sua conta do GitHub — igual ao seu tracker de leituras.</p>' + '<div class="sync-step"><span class="sn">1</span><span>Entre em <a href="https://github.com/settings/tokens?type=beta" target="_blank" rel="noopener">github.com/settings/tokens</a> e clique em <b>Generate new token</b>.</span></div>' + '<div class="sync-step"><span class="sn">2</span><span>Em <b>Account permissions → Gists</b>, escolha <b>Read and write</b>. Pode deixar o resto como está.</span></div>' + '<div class="sync-step"><span class="sn">3</span><span>Gere, copie o token (começa com <b>github_pat_</b>) e cole aqui embaixo.</span></div>' + '<div class="fld" style="margin-top:16px"><label for="sync-token">Token do GitHub</label><input type="password" id="sync-token" placeholder="github_pat_…" autocomplete="off" spellcheck="false"/><p class="hint">O token fica salvo <b>só neste aparelho</b> — nunca entra no backup nem no arquivo HTML.</p></div>' + '</div><div class="modal-f"><span class="sp"></span><button class="btn ghost" onclick="modalFechar()">Agora não</button><button class="btn primary" onclick="syncConectar()">' + app.ic('i31') + 'Conectar</button></div>';
  } else {
    h += '<div class="pn-stat" style="margin-bottom:14px"><span class="l"><span>Estado</span><span>' + (app.syncState === 'on' ? 'em dia' : app.syncState === 'conflito' ? 'conflito' : 'erro') + '</span></span>' + '<b>' + (app.syncAt ? 'Última sincronização: ' + new Date(app.syncAt).toLocaleString('pt-BR') : 'ainda não sincronizado') + '</b></div>';
    if (app.syncState === 'conflito') {
      h += '<p style="font-size:.88rem;color:var(--muted);margin-bottom:12px">Você alterou coisas aqui <b>e</b> em outro aparelho desde a última sincronização. Escolha qual versão fica valendo — a outra é substituída.</p>' + '<div class="fc-btns" style="margin-bottom:14px"><button class="btn ghost" onclick="syncBaixar()">' + app.ic('i20') + 'Usar o da nuvem</button><button class="btn primary" onclick="syncEnviar(true)">' + app.ic('i31') + 'Manter o deste aparelho</button></div>';
    }
    h += '<div class="sync-step"><span class="sn">' + app.ic('i9') + '</span><span>Tudo o que você marca e cadastra sobe sozinho poucos segundos depois de mudar. Ao abrir o organizador em outro aparelho, ele baixa a versão mais nova.</span></div>' + '</div><div class="modal-f"><button class="btn danger" onclick="if(confirm(\'Desconectar este aparelho? O progresso continua salvo aqui e na nuvem.\')){esqueceSync();abrirSync()}">Desconectar</button>' + '<span class="sp"></span><button class="btn ghost" onclick="syncBaixar()">' + app.ic('i20') + 'Baixar</button><button class="btn primary" onclick="syncEnviar(false)">' + app.ic('i31') + 'Enviar agora</button></div>';
  }
  app.modalAbrir(h, true);
  app.syncModalMsg();
};
