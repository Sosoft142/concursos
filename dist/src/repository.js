import { app } from './state.js';

app.armazenamentoVivo = function () {
  try {
    localStorage.setItem('ocdf-sonda', '1');
    var ok = localStorage.getItem('ocdf-sonda') === '1';
    localStorage.removeItem('ocdf-sonda');
    return ok;
  } catch (e) {
    return false;
  }
};
app.marcarArranque = function (bruto) {
  app.arranqueVazio = bruto == null;
  if (bruto != null) return;
  /* leitura vazia: só a sonda diz se é aparelho novo ou loja quebrada */
  app.arranqueDuvidoso = !app.armazenamentoVivo();
};
/* nada dentro: nem concurso, nem tópico marcado, nem flashcard, nem questão */
app.estadoVirgem = function () {
  if ((app.DADOS.concursos || []).length) return false;
  if ((app.S.qzl || []).length) return false;
  if (Object.keys(app.S.t || {}).length) return false;
  if (Object.keys(app.S.fc || {}).length) return false;
  if (Object.keys(app.S.cy || {}).length) return false;
  return true;
};
/* a loja tinha dados que não estavam visíveis no arranque: adota, não apaga */
app.guardaAdotar = function (A) {
  app.S = A;
  app.S.t = app.S.t || {};
  app.S.cy = app.S.cy || {};
  app.S.fc = app.S.fc || {};
  app.S.ui = app.S.ui || {};
  if (!Array.isArray(app.S.qzl)) app.S.qzl = [];
  app.DADOS = app.S.d;
  app.migrarDados();
  app.S.d = app.DADOS;
  if (typeof app.dataUpdatedAt !== 'undefined' && app.S.at) app.dataUpdatedAt = app.S.at;
  app.arranqueDuvidoso = false;
  app.gravacaoPendente = false;
  app.renderTudo();
  if (!app.guardaAvisou) {
    app.guardaAvisou = true;
    alert('O navegador demorou a liberar o que estava salvo e o organizador abriu vazio por um instante.\n\nNada foi perdido — seus concursos já estão de volta na tela.');
  }
};
/* devolve true quando a gravação foi impedida para proteger os dados */
app.guardaBloqueia = function () {
  if (app.arranqueDuvidoso) {
    app.gravacaoPendente = true;
    return true;
  }
  /* só protege a sessão que ABRIU vazia. Quem abriu com dados e apagou tudo
     fez isso de propósito — apagar é um direito, e a trava não pode impedir. */
  if (!app.arranqueVazio) return false;
  if (!app.estadoVirgem()) return false;
  var atual = null;
  try {
    atual = localStorage.getItem(app.LSK);
  } catch (e) {
    return false;
  }
  if (!atual) return false;
  try {
    var A = JSON.parse(atual);
    if (A && A.d && (A.d.concursos || []).length && (A.d.materias || []).length) {
      app.guardaAdotar(A);
      return true;
    }
  } catch (e) {}
  return false;
};
/* loja quebrada: tenta de novo de vez em quando */
app.guardaResolver = function () {
  if (!app.arranqueDuvidoso) return;
  if (app.armazenamentoVivo()) {
    var v = null;
    try {
      v = localStorage.getItem(app.LSK);
    } catch (e) {}
    if (v) {
      try {
        var A = JSON.parse(v);
        if (A && A.d && A.d.concursos && A.d.materias) {
          app.guardaAdotar(A);
          return;
        }
      } catch (e) {}
    }
    app.arranqueDuvidoso = false;
    if (app.gravacaoPendente) {
      app.gravacaoPendente = false;
      app.saveS();
    }
    return;
  }
  setTimeout(app.guardaResolver, 2000);
};
/* =====================================================================
   MIGRACOES — precisam rodar em TODO caminho que troca o DADOS inteiro:
   ao abrir, ao restaurar do GitHub (aplicarRemoto) e ao colar um backup
   (bkImport). Antes rodavam só ao abrir, e um backup antigo restaurado
   entrava sem metas, sem decks e com a ficha no formato velho.
   Sao idempotentes: rodar duas vezes nao muda nada.
   ===================================================================== */
app.semear = function (chave) {
  if (!Array.isArray(app.DADOS[chave]) || !app.DADOS[chave].length) app.DADOS[chave] = JSON.parse(JSON.stringify(app.SEED[chave]));
};
app.migrarDados = function () {
  if (!app.DADOS || typeof app.DADOS !== 'object') return;
  if (!Array.isArray(app.DADOS.concursos)) app.DADOS.concursos = [];
  if (!Array.isArray(app.DADOS.materias)) app.DADOS.materias = [];
  app.semear('decks');
  app.semear('cards');
  app.semear('fontes');
  app.semear('docs');
  if (!app.DADOS.metas || typeof app.DADOS.metas !== 'object') app.DADOS.metas = {};
  Object.keys(app.SEED.metas).forEach(function (k) {
    if (app.DADOS.metas[k] == null) app.DADOS.metas[k] = JSON.parse(JSON.stringify(app.SEED.metas[k]));
  });
  if (!app.DADOS.ciclo || typeof app.DADOS.ciclo !== 'object') app.DADOS.ciclo = JSON.parse(JSON.stringify(app.SEED.ciclo));
  if (!Array.isArray(app.DADOS.ciclo.blocos)) app.DADOS.ciclo.blocos = [];
  app.DADOS.concursos.forEach(function (c) {
    if (c.notas == null) c.notas = '';
    if (c.arquivado == null) c.arquivado = false;
    /* ficha do cargo: o que estava como <small>…</small> dentro do valor vira
       o campo "Complemento", que agora tem lugar proprio no editor */
    (c.ficha || []).forEach(function (f) {
      if (f.s == null) f.s = '';
      if (!f.s && f.v && /<\s*small\s*>/i.test(f.v)) {
        var m = /<\s*small\s*>([\s\S]*?)<\s*\/\s*small\s*>/i.exec(f.v);
        if (m) {
          f.s = app.desFmt(m[1]).replace(/^\s+|\s+$/g, '');
          f.v = f.v.replace(m[0], '');
        }
      }
      f.v = app.desFmt(f.v).replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '');
    });
  });
};
app.saveS = function (o) {
  o = o || {};
  app.S.d = app.DADOS;
  /* arranque duvidoso: segura a gravação até saber se a loja está mesmo
     vazia. Gravar agora apagaria tudo. */
  if (app.guardaBloqueia()) return;
  if (!o.noStamp) {
    app.S.at = new Date().toISOString();
    if (typeof app.dataUpdatedAt !== 'undefined') app.dataUpdatedAt = app.S.at;
  }
  try {
    localStorage.setItem(app.LSK, JSON.stringify(app.S));
    app.persistOk = true;
  } catch (e) {
    app.persistOk = false;
  }
  /* a partir do momento em que existe conteúdo gravado, a sessão deixa de
     ser "aberta vazia" e apagar tudo volta a ser permitido */
  if (app.persistOk && !app.estadoVirgem()) app.arranqueVazio = false;
  /* quando está tudo certo a frase não precisa ocupar a tela: só o aviso
     de falha é notícia */
  var el = document.getElementById('pn-save');
  if (el) {
    el.textContent = app.persistOk ? '' : 'Não deu para salvar neste navegador — copie um backup para não perder o progresso.';
    el.hidden = app.persistOk;
    el.className = 'pn-save' + (app.persistOk ? '' : ' erro');
  }
  if (!o.noSync && typeof app.agendarSync === 'function') app.agendarSync();
};
/* ---- backup manual ---- */
app.qzlDe = function (o) {
  if (Array.isArray(o.qzl)) return o.qzl;
  var l = [];
  Object.keys(o.qz || {}).forEach(function (id) {
    var q = o.qz[id];
    if (q && q.f > 0) l.push({
      id: 'q' + l.length + '-' + id,
      d: '',
      m: id,
      f: q.f,
      a: q.a
    });
  });
  return l;
};
app.bkTexto = function () {
  return JSON.stringify({
    v: 2,
    updatedAt: app.S.at || app.nowISO(),
    t: app.S.t,
    qzl: app.S.qzl,
    cy: app.S.cy,
    fc: app.S.fc,
    ui: app.S.ui,
    d: app.DADOS
  });
};
app.bkModal = function (s, titulo, aviso) {
  var h = app.modalHead(titulo || 'Backup do organizador', 'i15', 'modalFechar()') + '<div class="modal-b">' + app.edNota(aviso || 'Selecione tudo (Ctrl/⌘ + A) e copie. Guarde em uma nota — este texto tem seus concursos, matérias, flashcards e todo o progresso. O token do GitHub <b>não</b> vai junto.') + '<div class="fld"><label>' + (titulo ? 'Texto para copiar' : 'Backup') + '</label><textarea id="bk-txt" style="min-height:180px;font-size:.72rem" spellcheck="false"></textarea></div>' + '</div><div class="modal-f"><span class="sp"></span><button class="btn ghost" onclick="modalFechar()">Fechar</button><button class="btn primary" onclick="bkSelecionar()">Selecionar tudo</button></div>';
  app.modalAbrir(h, true);
  var el = document.getElementById('bk-txt');
  if (el) el.value = s;
};
app.bkSelecionar = function () {
  var el = document.getElementById('bk-txt');
  if (!el) return;
  el.focus();
  el.select();
  try {
    document.execCommand('copy');
    alert('Backup copiado!');
  } catch (e) {}
};
app.bkExport = function () {
  var s = app.bkTexto();
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(s).then(function () {
      alert('Backup copiado! Cole em uma nota (Keep, Notas etc.) para guardar.\n\nEle inclui seus concursos, matérias, flashcards e todo o progresso — e nunca inclui o token do GitHub.');
    }, function () {
      app.bkModal(s);
    });
  } else app.bkModal(s);
};
app.bkImport = function () {
  var s = prompt('Cole aqui o backup salvo:');
  if (!s) return;
  try {
    var o = JSON.parse(s);
    if (!o || typeof o !== 'object') throw new Error('formato');
    app.S.t = o.t || {};
    app.S.qzl = app.qzlDe(o);
    app.S.cy = o.cy || {};
    app.S.fc = o.fc || {};
    app.S.ui = o.ui || {};
    if (o.d && Array.isArray(o.d.concursos) && Array.isArray(o.d.materias)) {
      app.DADOS = o.d;
      app.migrarDados();
      app.S.d = app.DADOS;
    }
    app.saveS();
    app.renderTudo();
    app.togglePainel(app.S.ui.pn3 !== 0);
    var nfc = Object.keys(app.S.fc).length,
      ntp = Object.keys(app.S.t).length,
      ncc = app.CC().length;
    alert('Progresso restaurado!\n\n• ' + ncc + ' concursos\n• ' + nfc + ' flashcards com histórico\n• ' + ntp + ' tópicos marcados na lista do edital');
  } catch (e) {
    alert('Não consegui ler esse backup — confira se colou o texto completo.');
  }
};
