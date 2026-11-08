import { app } from './state.js';

app.corVar = function (c) {
  const colors=['primary','violet','teal','blue','amber','green','orange','magenta','rose'];
  return 'var(--' + (colors.includes(c) ? c : 'primary') + ')';
};
/* =====================================================================
   HELPERS
   ===================================================================== */
app.ic = function (id) {
  return '<svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#' + app.ea(id) + '"/></svg>';
};
/* par de botões subir/descer — mesmo controle em toda lista ordenável */
app.ordBtns = function (fn, i) {
  return '<button type="button" class="mini-btn up" onclick="' + fn + '(' + i + ',-1)" title="Subir" aria-label="Subir na lista">' + app.ic('i8') + '</button>' + '<button type="button" class="mini-btn" onclick="' + fn + '(' + i + ',1)" title="Descer" aria-label="Descer na lista">' + app.ic('i8') + '</button>';
};
app.arrMove = function (a, i, dir) {
  var j = i + dir;
  if (j < 0 || j >= a.length) return false;
  var t = a[i];
  a[i] = a[j];
  a[j] = t;
  return true;
};
app.ea = function (s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
};
// Only web links can be opened from editable/imported content. Escape the
// resulting attribute as well; escaping quotes alone does not block javascript:.
app.href = function (value) {
  try {const url=new URL(String(value));if(['http:','https:'].includes(url.protocol))return app.ea(url.href);}catch{}
  return '#';
};
app.tx = function (s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
};
app.fmtM = function (t) {
  return app.FMT_A + t + app.FMT_B;
};
app.fmt = function (s) {
  s = String(s == null ? '' : s);
  /* 1. etiquetas antigas viram marcadores que a escapada nao toca */
  s = s.replace(/<\s*(\/?)\s*([a-zA-Z]+)\s*\/?\s*>/g, function (todo, fecha, nome) {
    var t = app.FMT_OK[nome.toLowerCase()];
    return t ? app.fmtM(fecha + t) : todo;
  });
  /* 2. escapa o resto: o que a pessoa digitou nunca vira codigo */
  s = app.tx(s);
  /* 3. marcacao: *negrito* e _italico_, sempre dentro da mesma linha */
  s = s.replace(/(^|[\s(\[>—-])\*([^\s*](?:[^*\n]*[^\s*])?)\*(?=$|[\s.,;:!?)\]—-])/g, '$1' + app.fmtM('b') + '$2' + app.fmtM('/b'));
  s = s.replace(/(^|[\s(\[>—-])_([^\s_](?:[^_\n]*[^\s_])?)_(?=$|[\s.,;:!?)\]—-])/g, '$1' + app.fmtM('i') + '$2' + app.fmtM('/i'));
  /* 4. marcadores viram etiquetas de verdade */
  s = s.replace(new RegExp(app.FMT_A + '(\\/?)(b|i|small|u|br)' + app.FMT_B, 'g'), function (t, fecha, nome) {
    return nome === 'br' ? '<br/>' : '<' + fecha + nome + '>';
  });
  /* 5. quebra de linha digitada aparece como quebra de linha */
  return s.replace(/\r?\n/g, '<br/>');
};
/* fmt() para campo de uma linha so */
app.fmt1 = function (s) {
  return app.fmt(String(s == null ? '' : s).replace(/\s*\n+\s*/g, ' '));
};
app.desFmt = function (s) {
  s = String(s == null ? '' : s);
  if (s.indexOf('<') < 0) return s;
  s = s.replace(/<\s*br\s*\/?\s*>/gi, '\n');
  s = s.replace(/<\s*(b|strong)\s*>([\s\S]*?)<\s*\/\s*(b|strong)\s*>/gi, '*$2*');
  s = s.replace(/<\s*(i|em)\s*>([\s\S]*?)<\s*\/\s*(i|em)\s*>/gi, '_$2_');
  s = s.replace(/<\s*(small|u)\s*>([\s\S]*?)<\s*\/\s*(small|u)\s*>/gi, '$2');
  return s.replace(/<\s*\/?\s*(b|strong|i|em|small|u)\s*\/?\s*>/gi, '');
};
/* texto puro: para buscas, resumos, confirmacoes e o menu lateral */
app.semFmt = function (s) {
  return app.desFmt(s).replace(/[*_]/g, '');
};
app.CCT = function () {
  return app.DADOS.concursos || [];
};
app.CC = function () {
  return app.CCT().filter(function (c) {
    return !c.arquivado;
  });
};
app.CCA = function () {
  return app.CCT().filter(function (c) {
    return c.arquivado;
  });
};
app.MT = function () {
  return app.DADOS.materias || [];
};
app.DK = function () {
  return app.DADOS.decks || [];
};
app.FCS = function () {
  return app.DADOS.cards || [];
};
app.MET = function () {
  return app.DADOS.metas;
};
app.dkById = function (id) {
  var a = app.DK();
  for (var i = 0; i < a.length; i++) if (a[i].id === id) return a[i];
  return null;
};
app.cById = function (id) {
  var a = app.CCT();
  for (var i = 0; i < a.length; i++) if (a[i].id === id) return a[i];
  return null;
};
app.mById = function (id) {
  var a = app.MT();
  for (var i = 0; i < a.length; i++) if (a[i].id === id) return a[i];
  return null;
};
app.corDe = function (id) {
  var c = app.cById(id);
  return app.corVar(c ? c.cor : 'primary');
};
app.nomeCurto = function (c) {
  return c.curto || (c.badge ? String(c.badge).replace(/\n/g, ' ') : String(c.titulo || '').split(' ')[0]);
};
app.matDe = function (mid) {
  var r = [];
  app.CC().forEach(function (c) {
    if ((c.mats || []).indexOf(mid) > -1) r.push(c.id);
  });
  return r;
};
app.faltam = function (d) {
  return d === 0 ? 'é hoje' : d === 1 ? 'é amanhã' : 'em ' + d + ' dias';
};
app.brDate = function (iso) {
  if (!iso) return '';
  var p = String(iso).split('-');
  return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : iso;
};
app.hoje = function () {
  var d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
};
app.dsince = function (iso) {
  var t = new Date();
  t.setHours(0, 0, 0, 0);
  return Math.round((t - new Date(iso + 'T00:00:00')) / 864e5);
};
app.dto = function (iso) {
  return -app.dsince(iso);
};
app.slug = function (s) {
  return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 22) || 'novo';
};
app.idLivre = function (base, lista) {
  var id = base,
    n = 2;
  while (lista.some(function (x) {
    return x.id === id;
  })) {
    id = base + '-' + n;
    n++;
  }
  return id;
};
/* concursos cuja prova ainda não passou, do mais próximo ao mais distante */
app.futuros = function () {
  return app.CC().filter(function (c) {
    return c.prova && app.dto(c.prova) >= 0;
  }).sort(function (a, b) {
    return a.prova < b.prova ? -1 : 1;
  });
};
app.proximo = function () {
  var f = app.futuros();
  return f.length ? f[0] : null;
};
app.rebuildMAT = function () {
  app.MAT = app.MT().map(function (m) {
    return {
      id: m.id,
      n: m.n,
      t: m.t || [],
      dica: m.dica || 'teoria + questões da banca',
      cs: app.matDe(m.id)
    };
  });
};
app.cicloManual = function () {
  var c = app.DADOS.ciclo;
  return !!(c && c.modo === 'manual' && (c.blocos || []).length);
};
app.cicloKey = function () {
  return app.cicloManual() ? 'manual' : app.faseKey();
};
app.rebuildCiclos = function () {
  app.CICLOS = {};
  if (app.cicloManual()) {
    app.CICLOS.manual = {
      lbl: 'meu ciclo',
      b: app.DADOS.ciclo.blocos.map(function (b) {
        return {
          id: b.mid || null,
          m: b.m || (b.mid && app.mById(b.mid) ? app.mById(b.mid).n : 'Bloco'),
          d: b.d || '',
          min: b.min || app.MET().blocoMin
        };
      })
    };
    return;
  }
  var f = app.futuros();
  f.forEach(function (c, idx) {
    var b = [],
      usados = {};
    (c.mats || []).forEach(function (mid) {
      var m = app.mById(mid);
      if (!m) return;
      usados[mid] = 1;
      b.push({
        id: mid,
        m: m.n,
        d: m.dica || 'teoria + questões da banca'
      });
    });
    var extra = 0;
    f.forEach(function (o) {
      if (o.id === c.id) return;
      (o.mats || []).forEach(function (mid) {
        if (usados[mid] || extra >= 2) return;
        var m = app.mById(mid);
        if (!m) return;
        usados[mid] = 1;
        extra++;
        b.push({
          id: mid,
          m: m.n,
          d: 'manter contato — cai no ' + app.nomeCurto(o)
        });
      });
    });
    b.push({
      id: null,
      m: 'Revisão + simulado parcial',
      d: 'revisões vencidas + ~20 questões mistas'
    });
    b.forEach(function (x) {
      x.min = app.MET().blocoMin;
    });
    app.CICLOS[c.id] = {
      lbl: (idx === 0 ? 'foco ' : '') + app.nomeCurto(c) + (f.length > 1 && idx === 0 ? ' + comuns' : ''),
      b: b
    };
  });
};
app.faseKey = function () {
  var p = app.proximo();
  return p ? p.id : null;
};
app.mtlHtml = function (mid) {
  var m = app.mById(mid);
  if (!m || !m.mat || !m.mat.length) return '';
  var h = '';
  m.mat.forEach(function (o) {
    if (!o || !o.u) return;
    var tp = app.TIPOS[o.t] || app.TIPOS.site;
    h += '<a class="mtl mtl-' + app.ea(o.t || 'site') + '" href="' + app.href(o.u) + '" target="_blank" rel="noopener">' + app.ic(tp.i) + app.tx(o.l || tp.l) + '</a>';
  });
  return h;
};
app.topName = function (x) {
  return typeof x === 'string' ? x : x.n;
};
app.topUrl = function (x) {
  return typeof x === 'string' ? null : x.u || null;
};
