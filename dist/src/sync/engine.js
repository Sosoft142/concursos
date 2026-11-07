import { app } from '../state.js';

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
  return !!o && typeof o === 'object' && Object.prototype.hasOwnProperty.call(o, 't') && o.d && Array.isArray(o.d.concursos) && Array.isArray(o.d.materias);
};
app.conteudoDoGist = function (g) {
  var f = g && g.files && g.files[app.GIST_FILE];
  if (!f || typeof f.content !== 'string') return null;
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
app.aplicarRemoto = function (o) {
  if (!app.payloadCompleto(o)) return false;
  app.S.t = o.t || {};
  app.S.qzl = app.qzlDe(o);
  app.S.cy = o.cy || {};
  app.S.fc = o.fc || {};
  app.S.ui = o.ui || {};
  app.DADOS = o.d;
  app.migrarDados();
  app.S.d = app.DADOS;
  app.dataUpdatedAt = o.updatedAt || app.nowISO();
  app.S.at = app.dataUpdatedAt;
  try {
    localStorage.setItem(app.LSK, JSON.stringify(app.S));
  } catch (e) {}
  app.lastSyncedAt = app.dataUpdatedAt;
  app.syncAt = app.nowISO();
  app.saveSync();
  return true;
};
app.syncFalhou = function (e) {
  app.syncState = 'erro';
  app.syncMsg = e && e.message || 'Falha ao sincronizar.';
  app.syncBusy = false;
  app.renderPill();
  app.syncModalMsg();
};
app.syncEnviar = function (forcar) {
  if (app.syncState === 'off' || !app.syncToken || !app.gistId) return Promise.resolve();
  if (app.arranqueDuvidoso) return Promise.resolve();
  app.syncBusy = true;
  app.renderPill();
  return app.gh('/gists/' + app.gistId).then(function (g) {
    var remoto = app.conteudoDoGist(g),
      remotoAt = remoto && remoto.updatedAt || '';
    /* trava de segurança: nunca substituir uma nuvem cheia por um aparelho
       vazio sem a pessoa mandar. É a última defesa contra um arranque que
       deu errado ou um "apagar tudo" sem querer. */
    var remotoTem = remoto && remoto.d && (remoto.d.concursos || []).length;
    if (remotoTem && !app.CCT().length) {
      app.syncState = 'conflito';
      app.syncBusy = false;
      app.syncMsg = 'Este aparelho está sem concursos e a nuvem tem ' + remotoTem + '. Não enviei nada. Use <b>Trazer da nuvem</b> para recuperar — ou envie mesmo assim, se foi você que apagou.';
      app.renderPill();
      app.syncModalMsg();
      return;
    }
    var desconhecido = !app.lastSyncedAt && remotoAt && remotoAt !== app.dataUpdatedAt;
    if (!forcar && remotoAt && (desconhecido || app.lastSyncedAt && remotoAt !== app.lastSyncedAt)) {
      app.syncState = 'conflito';
      app.syncBusy = false;
      app.syncMsg = 'Este aparelho e a nuvem têm versões diferentes.';
      app.renderPill();
      app.syncModalMsg();
      return;
    }
    return app.gh('/gists/' + app.gistId, {
      method: 'PATCH',
      body: app.corpoDoGist()
    }).then(function () {
      app.lastSyncedAt = app.dataUpdatedAt;
      app.syncAt = app.nowISO();
      app.saveSync();
      app.syncState = 'on';
      app.syncMsg = '';
      app.syncBusy = false;
      app.renderPill();
      app.syncModalMsg();
    });
  }).catch(app.syncFalhou);
};
app.syncBaixar = function () {
  if (!app.syncToken || !app.gistId) return Promise.resolve();
  app.syncBusy = true;
  app.renderPill();
  return app.gh('/gists/' + app.gistId).then(function (g) {
    var remoto = app.conteudoDoGist(g);
    if (!remoto) throw new Error('A cópia na nuvem está vazia ou ilegível.');
    if (!app.aplicarRemoto(remoto)) throw new Error('A cópia na nuvem está incompleta — nada foi baixado.');
    app.syncState = 'on';
    app.syncMsg = '';
    app.syncBusy = false;
    app.renderTudo();
    app.renderPill();
    if (document.getElementById('sync-msg')) app.abrirSync();
  }).catch(app.syncFalhou);
};
app.agendarSync = function () {
  if (app.syncState !== 'on' || app.arranqueDuvidoso) return;
  if (app.syncTimer) clearTimeout(app.syncTimer);
  app.syncTimer = setTimeout(function () {
    app.syncTimer = null;
    app.syncEnviar(false);
  }, 2500);
};
app.syncAoAbrir = function () {
  if (app.syncState !== 'on' || !app.syncToken || !app.gistId) return;
  if (app.arranqueDuvidoso) {
    setTimeout(app.syncAoAbrir, 600);
    return;
  }
  app.syncBusy = true;
  app.renderPill();
  app.gh('/gists/' + app.gistId).then(function (g) {
    var remoto = app.conteudoDoGist(g),
      remotoAt = remoto && remoto.updatedAt || '';
    var localMudou = app.dataUpdatedAt && app.lastSyncedAt && app.dataUpdatedAt !== app.lastSyncedAt;
    var remotoMudou = remotoAt && app.lastSyncedAt && remotoAt !== app.lastSyncedAt;
    app.syncBusy = false;
    if (remotoMudou && localMudou) {
      app.syncState = 'conflito';
      app.syncMsg = 'Este aparelho e a nuvem têm versões diferentes.';
      app.renderPill();
      return;
    }
    if (remotoMudou || !app.lastSyncedAt && remotoAt) {
      if (app.aplicarRemoto(remoto)) {
        app.renderTudo();
        app.renderPill();
        return;
      }
      app.syncState = 'erro';
      app.syncMsg = 'A cópia na nuvem está incompleta — nada foi baixado.';
      app.renderPill();
      return;
    }
    if (localMudou) return app.syncEnviar(false);
    app.syncAt = app.nowISO();
    app.saveSync();
    app.renderPill();
  }).catch(app.syncFalhou);
};
app.syncConectar = function () {
  var inp = document.getElementById('sync-token');
  var token = inp ? String(inp.value || '').trim() : '';
  if (!token) {
    app.syncMsg = 'Cole o token do GitHub para conectar.';
    app.syncModalMsg();
    return;
  }
  app.syncToken = token;
  app.syncBusy = true;
  app.syncMsg = '';
  app.renderPill();
  app.syncModalMsg();
  return app.gh('/gists?per_page=100').then(function (lista) {
    var achado = null;
    (lista || []).forEach(function (g) {
      if (!achado && g.files && g.files[app.GIST_FILE]) achado = g;
    });
    if (achado) {
      var remoto = app.conteudoDoGist(achado);
      if (app.payloadCompleto(remoto) && !confirm('Achei uma cópia deste organizador na sua conta do GitHub.\n\nVou baixá-la por cima do que está neste aparelho. Continuar?\n\n(Dica: cancele e use “Copiar backup” antes, se tiver algo aqui que não está na nuvem.)')) {
        app.syncToken = '';
        app.syncBusy = false;
        app.syncState = 'off';
        app.renderPill();
        app.syncModalMsg();
        return;
      }
      app.gistId = achado.id;
      app.lastSyncedAt = '';
      app.syncState = 'on';
      app.saveSync();
      return app.syncBaixar().then(function () {
        if (app.syncState === 'on') {
          app.syncMsg = 'Conectado! Os dados da nuvem foram baixados para este aparelho.';
          app.renderPill();
          app.abrirSync();
        }
      });
    }
    return app.gh('/gists', {
      method: 'POST',
      body: {
        public: false,
        description: app.gistDesc(),
        files: app.corpoDoGist().files
      }
    }).then(function (g) {
      app.gistId = g.id;
      app.lastSyncedAt = app.dataUpdatedAt;
      app.syncAt = app.nowISO();
      app.syncState = 'on';
      app.syncBusy = false;
      app.saveSync();
      app.syncMsg = 'Conectado! Este aparelho virou a cópia principal.';
      app.renderPill();
      app.abrirSync();
    });
  }).catch(function (e) {
    app.syncToken = '';
    app.gistId = '';
    app.syncState = 'off';
    app.syncBusy = false;
    app.syncMsg = e && e.message || 'Falha ao conectar.';
    app.renderPill();
    app.syncModalMsg();
  });
};
/* ---------- pílula no cabeçalho ---------- */
app.renderPill = function () {
  var p = document.getElementById('syncPill');
  if (!p) return;
  p.className = 'sync-pill' + (app.syncBusy ? ' busy' : app.syncState === 'on' ? ' on' : app.syncState === 'conflito' ? ' conflito' : app.syncState === 'erro' ? ' erro' : '');
  var l = p.querySelector('.slbl');
  const status = app.syncBusy ? 'Sincronizando…' : app.syncState === 'on' ? 'Sincronizado' : app.syncState === 'conflito' ? 'Conflito' : app.syncState === 'erro' ? 'Erro' : 'Sincronizar';
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
    h += '<p style="font-size:.88rem;color:var(--muted);margin-bottom:14px">O organizador guarda tudo <b>neste</b> aparelho. Para abrir no celular e no computador com o mesmo progresso, ele grava uma cópia particular num <b>Gist secreto</b> da sua conta do GitHub — igual ao seu tracker de leituras.</p>' + '<div class="sync-step"><span class="sn">1</span><span>Entre em <a href="https://github.com/settings/tokens?type=beta" target="_blank" rel="noopener">github.com/settings/tokens</a> e clique em <b>Generate new token</b>.</span></div>' + '<div class="sync-step"><span class="sn">2</span><span>Em <b>Account permissions → Gists</b>, escolha <b>Read and write</b>. Pode deixar o resto como está.</span></div>' + '<div class="sync-step"><span class="sn">3</span><span>Gere, copie o token (começa com <b>github_pat_</b>) e cole aqui embaixo.</span></div>' + '<div class="fld" style="margin-top:16px"><label>Token do GitHub</label><input type="text" id="sync-token" placeholder="github_pat_…" autocomplete="off" spellcheck="false"/><p class="hint">O token fica salvo <b>só neste aparelho</b> — nunca entra no backup nem no arquivo HTML.</p></div>' + '</div><div class="modal-f"><span class="sp"></span><button class="btn ghost" onclick="modalFechar()">Agora não</button><button class="btn primary" onclick="syncConectar()">' + app.ic('i31') + 'Conectar</button></div>';
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
