import { app } from './state.js';
import {validateSnapshot} from './snapshots.js';

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
  app.S = app.prepararEstado(A, true);
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
  if (app.arranqueDuvidoso || app.arranqueCorrompido) {
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
    validateSnapshot(A, {complete:true});
    if (A.d.concursos.length || (A.qzl || []).length || ['t','fc','cy'].some(key => Object.keys(A[key] || {}).length)) {
      app.guardaAdotar(A);
      return true;
    }
  } catch (e) {app.arranqueCorrompido=true;app.persistOk=false;return true;}
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
      app.arranqueCorrompido=true;app.persistOk=false;app.arranqueDuvidoso=false;return;
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
app.semear = function (chave, data = app.DADOS) {
  if (!Array.isArray(data[chave])) data[chave] = JSON.parse(JSON.stringify(app.SEED[chave]));
};
app.migrarDados = function (data = app.DADOS) {
  if (!data || typeof data !== 'object') return;
  if (!Array.isArray(data.concursos)) data.concursos = [];
  if (!Array.isArray(data.materias)) data.materias = [];
  app.semear('decks', data);
  app.semear('cards', data);
  app.semear('fontes', data);
  app.semear('docs', data);
  if (!data.metas || typeof data.metas !== 'object') data.metas = {};
  Object.keys(app.SEED.metas).forEach(function (k) {
    if (data.metas[k] == null) data.metas[k] = JSON.parse(JSON.stringify(app.SEED.metas[k]));
  });
  if (!data.ciclo || typeof data.ciclo !== 'object') data.ciclo = JSON.parse(JSON.stringify(app.SEED.ciclo));
  if (!Array.isArray(data.ciclo.blocos)) data.ciclo.blocos = [];
  data.concursos.forEach(function (c) {
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
  // If loading was blocked, export the original rather than the empty fallback.
  if(app.arranqueCorrompido && typeof app.estadoOriginal==='string')return app.estadoOriginal;
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
    if(document.execCommand('copy'))alert('Backup copiado!');
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
// Preparing and persisting are separate so a validation/quota failure leaves
// both the in-memory state and the last synchronized revision intact.
app.prepararEstado = function (value, complete = false) {
  validateSnapshot(value, {complete});
  const next = JSON.parse(JSON.stringify({t:value.t||{}, qzl:app.qzlDe(value), cy:value.cy||{}, fc:value.fc||{}, ui:value.ui||{}, d:value.d||app.DADOS, at:value.updatedAt||value.at||''}));
  app.migrarDados(next.d);
  return next;
};
app.persistirEstado = function (next) {
  try {localStorage.setItem(app.LSK, JSON.stringify(next));}
  catch {app.persistOk=false;throw new Error('O navegador não conseguiu salvar os dados. Libere espaço e tente novamente. A cópia anterior foi mantida.');}
  app.S=next;app.DADOS=next.d;app.persistOk=true;
  app.estadoOriginal=null;app.erroDados='';
  app.arranqueCorrompido=false;app.arranqueDuvidoso=false;app.arranqueVazio=false;app.gravacaoPendente=false;
  app.dataUpdatedAt=next.at;
};
app.carregarEstado = function (raw) {
  try {
    app.S=raw==null?{}:app.prepararEstado(JSON.parse(raw));
    app.arranqueCorrompido=false;app.estadoOriginal=null;app.erroDados='';
    if(raw!=null)app.persistOk=true;
  } catch(error) {
    app.S={};app.persistOk=false;app.arranqueCorrompido=true;app.estadoOriginal=raw;
    app.erroDados=error instanceof SyntaxError?'O texto salvo não é um JSON completo.':error.message;
  }
};
app.bkImport = function () {
  const text=prompt('Cole aqui o backup salvo:');
  if(!text)return;
  try {
    const next=app.prepararEstado(JSON.parse(text));
    next.at=new Date().toISOString();
    app.persistirEstado(next);
    app.agendarSync?.();
    app.aplicarAcento?.();
    app.renderTudo();
    app.togglePainel(app.S.ui.pn3 !== 0);
    alert('Progresso restaurado!\n\n• '+app.CC().length+' concursos\n• '+Object.keys(app.S.fc).length+' flashcards com histórico\n• '+Object.keys(app.S.t).length+' tópicos marcados na lista do edital');
  } catch(error) {
    alert(error instanceof SyntaxError?'Não consegui ler esse backup — confira se colou o texto completo.':error.message);
  }
};

app.flushPendingSaves = function () {
  if(app.notaTimer){clearTimeout(app.notaTimer);app.notaTimer=null;app.DADOS.updatedAt=new Date().toISOString();app.saveS();}
  if(app.uiTimer){clearTimeout(app.uiTimer);app.uiTimer=null;app.saveS({noStamp:true,noSync:true});}
};
