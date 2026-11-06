import { app } from './state.js';

app.modalAbrir = function (html, fechavel) {
  var r = document.getElementById('modal-root');
  if (!r) return;
  app.modalFechavel = fechavel !== false;
  var antes = r.querySelector('.modal-h h3'),
    antesT = antes ? antes.textContent : null;
  var antesB = r.querySelector('.modal-b'),
    antesS = antesB ? antesB.scrollTop : 0;
  r.innerHTML = '<div class="modal-bd"' + (app.modalFechavel ? ' onclick="modalFundo(event)"' : '') + '><div class="modal" role="dialog" aria-modal="true" tabindex="-1">' + html + '</div></div>';
  app.travarRolagem();
  /* redesenhar o mesmo modal (adicionar/remover uma linha) não pode jogar a
     pessoa de volta para o topo — só um modal novo começa do começo */
  var depois = r.querySelector('.modal-h h3'),
    corpo = r.querySelector('.modal-b');
  if (corpo) corpo.scrollTop = antesT && depois && antesT === depois.textContent ? antesS : 0;
  var m = r.querySelector('.modal');
  if (m) setTimeout(function () {
    m.focus({
      preventScroll: true
    });
  }, 20);
};
app.modalFechar = function () {
  var r = document.getElementById('modal-root');
  if (r) r.innerHTML = '';
  app.travarRolagem();
};
app.modalFundo = function (ev) {
  if (ev.target && ev.target.classList.contains('modal-bd')) app.modalFechar();
};
app.modalHead = function (titulo, icone, fechar) {
  return '<div class="modal-h"><span class="pn-ic" style="width:34px;height:34px;border-radius:10px">' + app.ic(icone || 'i28') + '</span><h3>' + titulo + '</h3>' + '<button class="icon-btn" onclick="' + (fechar || 'edFechar()') + '" aria-label="Fechar"><svg viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg></button></div>';
};
app.pget = function (o, p) {
  var a = p.split('.'),
    x = o;
  for (var i = 0; i < a.length; i++) {
    if (x[a[i]] == null) x[a[i]] = i === a.length - 1 ? [] : {};
    x = x[a[i]];
  }
  return x;
};
app.edSet = function (p, v) {
  var a = p.split('.'),
    o = app.ED;
  for (var i = 0; i < a.length - 1; i++) {
    if (!o[a[i]]) o[a[i]] = {};
    o = o[a[i]];
  }
  o[a[a.length - 1]] = v;
};
app.edAdd = function (p, tpl) {
  app.pget(app.ED, p).push(tpl);
  app.edRender();
};
app.edDel = function (p, i) {
  app.pget(app.ED, p).splice(i, 1);
  app.edRender();
};
app.edRow = function (p, i, k, v) {
  var a = app.pget(app.ED, p);
  if (a[i]) a[i][k] = v;
};
app.edToggle = function (k) {
  app.edOpen[k] = !app.edOpen[k];
  var el = document.getElementById('eds-' + k);
  if (el) el.classList.toggle('open', app.edOpen[k]);
};
app.edFechar = function () {
  if (app.ED && !confirm('Fechar sem salvar? As alterações desta janela serão perdidas.')) return;
  app.ED = null;
  app.modalFechar();
};
/* ---------- campos ---------- */
app.fT = function (lbl, val, h, ph) {
  const id = 'field-' + (app.fieldSequence = (app.fieldSequence || 0) + 1);
  return '<div class="fld"><label for="' + id + '">' + lbl + '</label><input id="' + id + '" type="text" value="' + app.ea(val || '') + '" placeholder="' + app.ea(ph || '') + '" oninput="' + h + '"/></div>';
};
app.fD = function (lbl, val, h) {
  const id = 'field-' + (app.fieldSequence = (app.fieldSequence || 0) + 1);
  return '<div class="fld"><label for="' + id + '">' + lbl + '</label><input id="' + id + '" type="date" value="' + app.ea(val || '') + '" oninput="' + h + '"/></div>';
};
app.fU = function (lbl, val, h, ph) {
  const id = 'field-' + (app.fieldSequence = (app.fieldSequence || 0) + 1);
  return '<div class="fld"><label for="' + id + '">' + lbl + '</label><input id="' + id + '" type="url" value="' + app.ea(val || '') + '" placeholder="' + app.ea(ph || 'https://') + '" oninput="' + h + '"/></div>';
};
app.fA = function (lbl, val, h, hint, min) {
  const id = 'field-' + (app.fieldSequence = (app.fieldSequence || 0) + 1);
  return '<div class="fld"><label for="' + id + '">' + lbl + '</label><textarea id="' + id + '"' + (min ? ' style="min-height:' + min + 'px"' : '') + ' oninput="' + h + '">' + app.tx(val || '') + '</textarea>' + (hint ? '<p class="hint">' + hint + '</p>' : '') + '</div>';
};
app.fmtBar = function (id) {
  return '<div class="fmt-bar" role="group" aria-label="Formatação">' + '<button type="button" class="fmt-b" onmousedown="return false" onclick="fmtAplica(\'' + id + '\',\'*\')" title="Negrito" aria-label="Negrito"><b>N</b></button>' + '<button type="button" class="fmt-b" onmousedown="return false" onclick="fmtAplica(\'' + id + '\',\'_\')" title="Itálico" aria-label="Itálico"><em>I</em></button>' + '<span class="fmt-d">selecione um trecho e toque em <b>N</b> ou <b>I</b></span>' + '</div>';
};
app.fFmt = function (lbl, val, setter, ph, min, semPrev) {
  var id = 'ff' + ++app.FFN,
    pv = id + '-p',
    v = app.desFmt(val);
  var acao = setter + (semPrev ? '' : ';fmtPrev(\'' + pv + '\',this.value)');
  var campo = min ? '<textarea id="' + id + '" style="min-height:' + min + 'px" placeholder="' + app.ea(ph || '') + '" oninput="' + acao + '">' + app.tx(v) + '</textarea>' : '<input type="text" id="' + id + '" value="' + app.ea(v) + '" placeholder="' + app.ea(ph || '') + '" oninput="' + acao + '"/>';
  return '<div class="fld fld-fmt"><label for="' + id + '">' + lbl + '</label>' + app.fmtBar(id) + campo + (semPrev ? '' : '<div class="fmt-prev' + (min ? '' : ' um') + '" id="' + pv + '-b"' + (app.fmtTem(v) ? '' : ' hidden') + '><span class="pl">como vai aparecer</span><div class="pv" id="' + pv + '">' + app.fmtPvHtml(v) + '</div></div>') + '</div>';
};
app.fmtPvHtml = function (v) {
  return app.fmt(v) || '<span class="vz">— vazio —</span>';
};
/* a prévia só aparece quando há formatação para mostrar — sem isso ela
   seria uma segunda cópia do campo em cada linha da ficha */
app.fmtTem = function (v) {
  v = String(v == null ? '' : v);
  return app.fmt(v) !== app.tx(v);
};
app.fmtPrev = function (id, v) {
  var el = document.getElementById(id);
  if (el) el.innerHTML = app.fmtPvHtml(v);
  var cx = document.getElementById(id + '-b');
  if (cx) cx.hidden = !app.fmtTem(v);
};
app.fmtAplica = function (id, ch) {
  var el = document.getElementById(id);
  if (!el) return;
  var v = el.value,
    a = el.selectionStart,
    b = el.selectionEnd;
  if (a == null) {
    a = v.length;
    b = v.length;
  }
  if (a === b) {
    /* nada selecionado: abre o par e deixa o cursor no meio */
    el.value = v.slice(0, a) + ch + ch + v.slice(b);
    el.focus();
    try {
      el.setSelectionRange(a + 1, a + 1);
    } catch (e) {}
  } else {
    var sel = v.slice(a, b),
      m = /^(\s*)([\s\S]*?)(\s*)$/.exec(sel),
      meio = m[2];
    if (meio) {
      /* toque de novo no mesmo trecho para tirar a formatação */
      var tem = meio.length > 1 && meio.charAt(0) === ch && meio.charAt(meio.length - 1) === ch;
      var novo = m[1] + (tem ? meio.slice(1, -1) : ch + meio + ch) + m[3];
      el.value = v.slice(0, a) + novo + v.slice(b);
      el.focus();
      try {
        el.setSelectionRange(a, a + novo.length);
      } catch (e) {}
    }
  }
  el.dispatchEvent(new Event('input', {
    bubbles: true
  }));
};
app.rm = function (p, i) {
  return '<button type="button" class="rm" onclick="edDel(\'' + p + '\',' + i + ')" title="Remover linha" aria-label="Remover linha">' + app.ic('i29') + '</button>';
};
app.addBtn = function (p, tpl, txt) {
  return '<button type="button" class="btn add-row" onclick=\'edAdd("' + p + '",' + JSON.stringify(tpl) + ')\'>' + app.ic('i30') + txt + '</button>';
};
app.edSec = function (key, titulo, sub, inner) {
  return '<div class="ed-sec' + (app.edOpen[key] ? ' open' : '') + '" id="eds-' + key + '"><button type="button" class="ed-h" onclick="edToggle(\'' + key + '\')">' + titulo + '<span class="n">' + sub + '</span><svg class="chev" viewBox="0 0 24 24"><use href="#i8"/></svg></button><div class="ed-b">' + inner + '</div></div>';
};
app.edNota = function (t) {
  return '<div class="ed-note">' + app.ic('i9') + '<span>' + t + '</span></div>';
};
/* ---------- conteúdo: achatar / remontar ---------- */
app.edFlat = function (blocos) {
  var r = [];
  (blocos || []).forEach(function (b) {
    (b.itens || []).forEach(function (it) {
      r.push({
        label: b.label || '',
        peso: b.peso || '',
        n: it.n || '',
        mid: it.mid || '',
        h: it.h || '',
        chip: it.chip || '',
        topicos: (it.topicos || []).join('\n'),
        prosa: (it.prosa || []).join('\n\n')
      });
    });
  });
  return r;
};
app.edUnflat = function (rows) {
  var out = [],
    cur = null;
  (rows || []).forEach(function (r) {
    if (!cur || cur.label !== r.label || cur.peso !== r.peso) {
      cur = {
        label: r.label || '',
        peso: r.peso || '',
        nota: '',
        itens: []
      };
      out.push(cur);
    }
    cur.itens.push({
      n: r.n || '',
      mid: r.mid || '',
      h: r.h || '',
      chip: r.chip || '',
      topicos: String(r.topicos || '').split('\n').map(function (s) {
        return s.trim();
      }).filter(Boolean),
      prosa: String(r.prosa || '').split(/\n{2,}/).map(function (s) {
        return s.trim();
      }).filter(Boolean)
    });
  });
  return out;
};
app.linhas = function (s) {
  return String(s || '').split('\n').map(function (x) {
    return x.trim();
  }).filter(Boolean);
};
/* ---------- abrir ---------- */
app.edVazio = function () {
  return {
    id: '',
    cor: 'blue',
    inscrita: false,
    titulo: '',
    cargo: '',
    nome: '',
    sub: '',
    badge: '',
    banca: '',
    bancaCurto: '',
    curto: '',
    prova: '',
    inscAte: '',
    nivel: '',
    vagasChip: '',
    urlBanca: '',
    formato: '',
    mats: [],
    ficha: [],
    raiox: {
      sub: '',
      leg: [],
      bar: [],
      linhas: [],
      nota: ''
    },
    conteudoSub: '',
    blocos: [],
    conteudoNota: '',
    etapasSub: '',
    etapas: [],
    etapasNota: '',
    cronogramaSub: '',
    cronograma: [],
    atribSub: '',
    atribuicoes: [],
    requisito: '',
    atribNota: '',
    linksSub: '',
    links: []
  };
};
app.edNovo = function () {
  app.ED = app.edVazio();
  app.EDnovo = true;
  app.edOpen = {
    basico: true
  };
  app.ED.__it = [];
  app.ED.__atr = '';
  app.edRender();
};
app.edEditar = function (id) {
  var c = app.cById(id);
  if (!c) return;
  app.ED = JSON.parse(JSON.stringify(c));
  app.EDnovo = false;
  app.edOpen = {
    basico: true
  };
  app.ED.__it = app.edFlat(app.ED.blocos);
  app.ED.__atr = (app.ED.atribuicoes || []).join('\n');
  app.edRender();
};
app.edMatToggle = function (mid, on) {
  app.ED.mats = app.ED.mats || [];
  var i = app.ED.mats.indexOf(mid);
  if (on && i < 0) app.ED.mats.push(mid);
  if (!on && i > -1) app.ED.mats.splice(i, 1);
};
app.edCor = function (k) {
  app.ED.cor = k;
  app.edRender();
};
/* ---------- render do editor ---------- */
app.edRender = function () {
  if (!app.ED) return;
  var h = app.modalHead(app.EDnovo ? 'Novo concurso' : 'Editar concurso', 'i28') + '<div class="modal-b">';
  /* Essential fields stay first; optional presentation fields are expandable. */
  const field = (label, key, placeholder = '') => app.fT(label, app.ED[key], "edSet('" + key + "',this.value)", placeholder);
  let basic = field('Título do concurso *', 'titulo', 'Ex.: Concurso Tribunal Regional 2026')
    + field('Cargo / especialidade', 'cargo', 'Ex.: Técnico Administrativo')
    + '<div class="fld-row">'
    + app.fD('Data da prova', app.ED.prova, "edSet('prova',this.value)")
    + app.fD('Inscrições até', app.ED.inscAte, "edSet('inscAte',this.value)") + '</div>'
    + field('Escolaridade', 'nivel', 'Fundamental, médio ou superior')
    + field('Banca organizadora', 'banca', 'Nome da banca')
    + app.fU('Página da banca ou edital', app.ED.urlBanca, "edSet('urlBanca',this.value)")
    + '<label class="chk"><input type="checkbox" ' + (app.ED.inscrita ? 'checked' : '') + ' onchange="edSet(\'inscrita\',this.checked)"/> Já fiz a inscrição</label>'
    + '<details class="editor-extras" ' + (app.edOpen.extras ? 'open' : '') + ' ontoggle="edOpen.extras=this.open"><summary>Informações adicionais e aparência</summary><div>'
    + field('Nome curto', 'curto', 'Usado nos menus e na comparação')
    + field('Banca — nome curto', 'bancaCurto', 'Ex.: FGV')
    + field('Resumo de vagas', 'vagasChip', 'Ex.: 20 vagas + cadastro reserva')
    + field('Título na área de estudos', 'nome', 'Se vazio, usa o título do concurso')
    + field('Subtítulo na área de estudos', 'sub')
    + app.fA('Etiqueta na área de estudos', app.ED.badge, "edSet('badge',this.value)", '', 44)
    + '<div class="fld"><label>Cor do concurso</label><div class="cor-pick">';
  app.CORES.forEach(function (color) {
    basic += '<button type="button" class="cor-sw" style="background:' + app.corVar(color.k) + '" aria-pressed="' + (app.ED.cor === color.k) + '" title="' + app.ea(color.n) + '" onclick="edCor(\'' + color.k + '\')"></button>';
  });
  basic += '</div></div>' + app.fFmt('Formato da prova', app.ED.formato, "edSet('formato',this.value)", 'Ex.: 60 questões + redação', 72) + '</div></details>';
  h += app.edSec('basico', 'Identificação e datas', 'o essencial', basic);
  /* matérias */
  var m = '<p class="hint" style="margin-bottom:10px">Marque as matérias que caem neste concurso. Elas alimentam a lista do edital, o ciclo de estudos e a comparação entre concursos.</p>';
  app.MT().forEach(function (x) {
    m += '<label class="chk"><input type="checkbox" ' + ((app.ED.mats || []).indexOf(x.id) > -1 ? 'checked' : '') + ' onchange="edMatToggle(\'' + x.id + '\',this.checked)"/> ' + app.tx(x.n) + ' <span class="hint" style="margin:0">· ' + (x.t || []).length + ' tópicos</span></label>';
  });
  m += '<button type="button" class="btn ghost sm" style="margin-top:10px" onclick="edMaterias()">' + app.ic('i28') + 'Criar / editar matérias</button>';
  h += app.edSec('mats', 'Matérias que caem', 'lista do edital e ciclo', m);
  /* ficha */
  var f = '';
  (app.ED.ficha || []).forEach(function (r, i) {
    f += '<div class="rowi">' + app.rm('ficha', i) + app.fT('Rótulo', r.l, 'edRow(\'ficha\',' + i + ',\'l\',this.value)', 'Vagas') + app.fFmt('Valor', r.v, 'edRow(\'ficha\',' + i + ',\'v\',this.value)', '3 imediatas + 9 CR') + app.fT('Complemento (menor, ao lado)', r.s, 'edRow(\'ficha\',' + i + ',\'s\',this.value)', 'bruto') + '</div>';
  });
  f += app.addBtn('ficha', {
    l: '',
    v: '',
    s: ''
  }, 'Adicionar item da ficha');
  h += app.edSec('ficha', 'Ficha do cargo', (app.ED.ficha || []).length + ' itens', f);
  /* onde focar */
  var r = '';
  r += app.fA('Texto de abertura', app.ED.raiox && app.ED.raiox.sub, 'edSet(\'raiox.sub\',this.value)');
  r += '<div class="fld"><label>Prioridades por matéria</label></div>';
  ((app.ED.raiox || {}).linhas || []).forEach(function (l, i) {
    r += '<div class="rowi">' + app.rm('raiox.linhas', i) + app.fT('Matéria / parte', l.b, 'edRow(\'raiox.linhas\',' + i + ',\'b\',this.value)') + app.fT('Como cai', l.s, 'edRow(\'raiox.linhas\',' + i + ',\'s\',this.value)') + '<div class="fld-row">' + app.fT('Peso / nº de questões', l.n, 'edRow(\'raiox.linhas\',' + i + ',\'n\',this.value)', '20q · 33%') + '<div class="fld"><label>Prioridade</label><select onchange="edRow(\'raiox.linhas\',' + i + ',\'p\',parseInt(this.value,10))">' + '<option value="1"' + (l.p === 1 ? ' selected' : '') + '>Máxima</option><option value="2"' + (l.p === 2 ? ' selected' : '') + '>Alta</option><option value="3"' + (l.p === 3 || !l.p ? ' selected' : '') + '>Média</option></select></div>' + '</div></div>';
  });
  r += app.addBtn('raiox.linhas', {
    b: '',
    s: '',
    n: '',
    p: 3
  }, 'Adicionar linha');
  r += '<div class="fld" style="margin-top:16px"><label>Barra de proporção (opcional)</label><p class="hint" style="margin:0 0 8px">Cada faixa: largura em % e uma cor. Ex.: largura <b>33.3%</b>, cor <b>var(--teal)</b>.</p></div>';
  ((app.ED.raiox || {}).bar || []).forEach(function (x, i) {
    r += '<div class="rowi">' + app.rm('raiox.bar', i) + '<div class="fld-row">' + app.fT('Largura', x.w, 'edRow(\'raiox.bar\',' + i + ',\'w\',this.value)', '33.3%') + app.fT('Cor', x.c, 'edRow(\'raiox.bar\',' + i + ',\'c\',this.value)', 'var(--teal)') + app.fT('Rótulo', x.t, 'edRow(\'raiox.bar\',' + i + ',\'t\',this.value)', '33%') + '</div></div>';
  });
  r += app.addBtn('raiox.bar', {
    w: '25%',
    c: 'var(--teal)',
    t: '25%'
  }, 'Adicionar faixa da barra');
  ((app.ED.raiox || {}).leg || []).forEach(function (x, i) {
    r += '<div class="rowi">' + app.rm('raiox.leg', i) + '<div class="fld-row">' + app.fT('Cor', x.c, 'edRow(\'raiox.leg\',' + i + ',\'c\',this.value)', 'var(--teal)') + app.fT('Legenda', x.t, 'edRow(\'raiox.leg\',' + i + ',\'t\',this.value)', 'Técnicos 20q') + '</div></div>';
  });
  r += app.addBtn('raiox.leg', {
    c: 'var(--teal)',
    t: ''
  }, 'Adicionar legenda da barra');
  r += app.fFmt('Observação final', app.ED.raiox && app.ED.raiox.nota, 'edSet(\'raiox.nota\',this.value)', '', 72);
  h += app.edSec('raiox', 'Onde focar', ((app.ED.raiox || {}).linhas || []).length + ' linhas', r);
  /* conteúdo */
  var ct = app.fA('Texto de abertura', app.ED.conteudoSub, 'edSet(\'conteudoSub\',this.value)');
  ct += app.edNota('Disciplinas seguidas com o <b>mesmo bloco</b> ficam agrupadas sob o mesmo cabeçalho. Deixe o bloco em branco se a prova não tem divisão.');
  (app.ED.__it || []).forEach(function (it, i) {
    ct += '<div class="rowi">' + app.rm('__it', i) + '<div class="fld-row">' + app.fT('Bloco', it.label, 'edRow(\'__it\',' + i + ',\'label\',this.value)', 'Conhecimentos Básicos') + app.fT('Peso do bloco', it.peso, 'edRow(\'__it\',' + i + ',\'peso\',this.value)', '20 questões · peso 1') + '</div>' + '<div class="fld-row">' + app.fT('Nº', it.n, 'edRow(\'__it\',' + i + ',\'n\',this.value)', '1') + app.fT('Disciplina', it.h, 'edRow(\'__it\',' + i + ',\'h\',this.value)', 'Língua Portuguesa') + app.fT('Etiqueta', it.chip, 'edRow(\'__it\',' + i + ',\'chip\',this.value)', '15 questões') + '</div>' + '<div class="fld"><label>Matéria vinculada (materiais de estudo)</label><select onchange="edRow(\'__it\',' + i + ',\'mid\',this.value)"><option value="">— nenhuma —</option>';
    app.MT().forEach(function (x) {
      ct += '<option value="' + x.id + '"' + (it.mid === x.id ? ' selected' : '') + '>' + app.tx(x.n) + '</option>';
    });
    ct += '</select></div>' + app.fA('Tópicos (um por linha)', it.topicos, 'edRow(\'__it\',' + i + ',\'topicos\',this.value)', '') + app.fFmt('Parágrafos (separe com uma linha em branco)', it.prosa, 'edRow(\'__it\',' + i + ',\'prosa\',this.value)', '', 90) + '</div>';
  });
  ct += app.addBtn('__it', {
    label: '',
    peso: '',
    n: '',
    mid: '',
    h: '',
    chip: '',
    topicos: '',
    prosa: ''
  }, 'Adicionar disciplina');
  ct += app.fFmt('Observação final', app.ED.conteudoNota, 'edSet(\'conteudoNota\',this.value)', '', 72);
  h += app.edSec('conteudo', 'Conteúdo programático', (app.ED.__it || []).length + ' disciplinas', ct);
  /* etapas */
  var et = app.fA('Texto de abertura', app.ED.etapasSub, 'edSet(\'etapasSub\',this.value)');
  (app.ED.etapas || []).forEach(function (e, i) {
    et += '<div class="rowi">' + app.rm('etapas', i) + '<div class="fld-row">' + app.fT('Etiqueta', e.en, 'edRow(\'etapas\',' + i + ',\'en\',this.value)', 'FASE 1') + app.fT('Título', e.h, 'edRow(\'etapas\',' + i + ',\'h\',this.value)', 'Prova Objetiva') + '</div>' + app.fA('Descrição', e.p, 'edRow(\'etapas\',' + i + ',\'p\',this.value)', '', 60) + app.fT('Etiquetas', (e.tags || []).map(function (t) {
      return t.t + (t.c ? ':' + t.c : '');
    }).join(', '), 'edRow(\'etapas\',' + i + ',\'tagsTxt\',this.value)', '60 questões, ≥ 18 pontos:teal') + '</div>';
  });
  et += app.addBtn('etapas', {
    en: '',
    h: '',
    p: '',
    tags: []
  }, 'Adicionar etapa');
  et += app.fFmt('Observação final', app.ED.etapasNota, 'edSet(\'etapasNota\',this.value)', '', 72);
  h += app.edSec('etapas', 'Etapas e provas', (app.ED.etapas || []).length + ' etapas', et);
  /* cronograma */
  var cr = app.fA('Texto de abertura', app.ED.cronogramaSub, 'edSet(\'cronogramaSub\',this.value)');
  (app.ED.cronograma || []).forEach(function (x, i) {
    cr += '<div class="rowi">' + app.rm('cronograma', i) + '<div class="fld-row">' + app.fT('Data (texto)', x.d, 'edRow(\'cronograma\',' + i + ',\'d\',this.value)', '30 ago 2026') + app.fD('Data real (ordena a linha do tempo)', x.end, 'edRow(\'cronograma\',' + i + ',\'end\',this.value)') + '</div>' + app.fT('Etapa', x.label, 'edRow(\'cronograma\',' + i + ',\'label\',this.value)', 'Aplicação da prova objetiva') + '<label class="chk"><input type="checkbox" ' + (x.exam ? 'checked' : '') + ' onchange="edRow(\'cronograma\',' + i + ',\'exam\',this.checked)"/> É o dia da prova</label>' + '</div>';
  });
  cr += app.addBtn('cronograma', {
    d: '',
    end: '',
    label: '',
    exam: false
  }, 'Adicionar data');
  h += app.edSec('cronograma', 'Cronograma', (app.ED.cronograma || []).length + ' datas', cr);
  /* atribuições */
  var at = app.fA('Texto de abertura', app.ED.atribSub, 'edSet(\'atribSub\',this.value)') + app.fA('Atribuições (uma por linha)', app.ED.__atr, 'edSet(\'__atr\',this.value)', '', 140) + app.fA('Requisito para assumir o cargo', app.ED.requisito, 'edSet(\'requisito\',this.value)') + app.fFmt('Observação final', app.ED.atribNota, 'edSet(\'atribNota\',this.value)', '', 72);
  h += app.edSec('atrib', 'Atribuições do cargo', app.linhas(app.ED.__atr).length + ' itens', at);
  /* links */
  var lk = app.fA('Texto de abertura', app.ED.linksSub, 'edSet(\'linksSub\',this.value)');
  (app.ED.links || []).forEach(function (l, i) {
    lk += '<div class="rowi">' + app.rm('links', i) + app.fT('Título', l.b, 'edRow(\'links\',' + i + ',\'b\',this.value)', 'Edital de abertura (PDF)') + app.fT('Descrição', l.s, 'edRow(\'links\',' + i + ',\'s\',this.value)', 'Documento oficial') + app.fU('Endereço', l.u, 'edRow(\'links\',' + i + ',\'u\',this.value)') + '<div class="fld"><label>Ícone</label><select onchange="edRow(\'links\',' + i + ',\'ic\',this.value)">';
    [['i14', 'Site / página'], ['i15', 'PDF / documento'], ['i16', 'Lista / índice'], ['i0', 'Apostila'], ['i6', 'Notícia'], ['i5', 'Link externo'], ['i4', 'Órgão oficial'], ['i11', 'Calendário'], ['i26', 'Vídeo']].forEach(function (o) {
      lk += '<option value="' + o[0] + '"' + ((l.ic || 'i14') === o[0] ? ' selected' : '') + '>' + o[1] + '</option>';
    });
    lk += '</select></div></div>';
  });
  lk += app.addBtn('links', {
    ic: 'i14',
    b: '',
    s: '',
    u: ''
  }, 'Adicionar link');
  h += app.edSec('links', 'Links do concurso', (app.ED.links || []).length + ' links', lk);
  h += '</div><div class="modal-f">' + (app.EDnovo ? '' : '<button class="btn danger" onclick="edRemover(ED.id,true)">' + app.ic('i29') + 'Remover concurso</button>') + '<span class="sp"></span><button class="btn ghost" onclick="edFechar()">Cancelar</button>' + '<button class="btn primary" onclick="edSalvar()">' + app.ic('i32') + 'Salvar</button></div>';
  app.modalAbrir(h, false);
};
/* ---------- salvar ---------- */
app.edSalvar = function () {
  if (!app.ED) return;
  if (!String(app.ED.titulo || '').trim()) {
    alert('Dê pelo menos um título ao concurso.');
    app.edOpen.basico = true;
    app.edRender();
    return;
  }
  (app.ED.etapas || []).forEach(function (e) {
    if (typeof e.tagsTxt === 'string') {
      e.tags = e.tagsTxt.split(',').map(function (s) {
        s = s.trim();
        if (!s) return null;
        var p = s.split(':');
        return {
          t: p[0].trim(),
          c: (p[1] || '').trim()
        };
      }).filter(Boolean);
      delete e.tagsTxt;
    }
  });
  app.ED.blocos = app.edUnflat(app.ED.__it);
  app.ED.atribuicoes = app.linhas(app.ED.__atr);
  delete app.ED.__it;
  delete app.ED.__atr;
  if (!app.ED.id) app.ED.id = app.idLivre(app.slug(app.ED.curto || app.ED.titulo), app.CCT());
  if (!app.ED.nome) app.ED.nome = app.ED.titulo;
  if (!app.ED.badge) app.ED.badge = (app.ED.curto || app.ED.titulo).slice(0, 10);
  var i = -1,
    a = app.CCT();
  for (var k = 0; k < a.length; k++) if (a[k].id === app.ED.id) i = k;
  if (i > -1) a[i] = app.ED;else a.push(app.ED);
  app.ED = null;
  app.DADOS.updatedAt = new Date().toISOString();
  app.saveS();
  app.modalFechar();
  app.renderTudo();
};
app.edRemover = function (id, doEditor) {
  var c = app.cById(id);
  if (!c) return;
  if (!confirm('Remover “' + (c.curto || c.titulo) + '” do organizador?\n\nO cartão, a área de estudos e a comparação deste concurso somem. Suas marcações na lista do edital continuam salvas.')) return;
  app.DADOS.concursos = app.CCT().filter(function (x) {
    return x.id !== id;
  });
  app.DADOS.updatedAt = new Date().toISOString();
  if (doEditor) app.ED = null;
  app.saveS();
  app.modalFechar();
  app.renderTudo();
};
app.emTxtMat = function (list) {
  return (list || []).map(function (o) {
    return (o.t || 'site') + ' | ' + (o.l || '') + ' | ' + (o.u || '');
  }).join('\n');
};
app.emParseMat = function (s) {
  return app.linhas(s).map(function (l) {
    var p = l.split('|');
    if (p.length < 2) return null;
    var t = p[0].trim().toLowerCase();
    if (!app.TIPOS[t]) t = 'site';
    var u = (p[2] || '').trim(),
      lb = (p[1] || '').trim();
    if (!u) return null;
    return {
      t: t,
      l: lb,
      u: u
    };
  }).filter(Boolean);
};
app.edMaterias = function () {
  app.EM = app.MT().map(function (m) {
    return {
      id: m.id,
      n: m.n,
      dica: m.dica || '',
      t: (m.t || []).map(app.topName).join('\n'),
      mat: app.emTxtMat(m.mat)
    };
  });
  app.emRender();
};
app.emSet = function (i, k, v) {
  if (app.EM[i]) app.EM[i][k] = v;
};
app.emAdd = function () {
  app.EM.push({
    id: '',
    n: '',
    dica: '',
    t: '',
    mat: ''
  });
  app.emRender();
};
app.emMover = function (i, dir) {
  if (app.arrMove(app.EM, i, dir)) app.emRender();
};
app.emDel = function (i) {
  var m = app.EM[i];
  if (m.id) {
    var usa = app.matDe(m.id);
    if (usa.length && !confirm('“' + m.n + '” está marcada em ' + usa.length + ' concurso(s). Remover mesmo assim?')) return;
  }
  app.EM.splice(i, 1);
  app.emRender();
};
app.emRender = function () {
  var h = app.modalHead('Matérias e tópicos', 'i0', 'emFechar()') + '<div class="modal-b">';
  h += app.edNota('As matérias alimentam a <b>lista do edital</b>, o <b>ciclo de estudos</b>, o <b>registro de questões</b> e a aba <b>Comparar</b>. Depois de criar uma matéria, marque-a dentro de cada concurso que a cobra. <b>A ordem daqui é a ordem da lista do edital</b> — use as setas para pôr na frente o que você quer ver primeiro.');
  app.EM.forEach(function (m, i) {
    h += '<div class="rowi"><div class="rowi-acts">' + app.ordBtns('emMover', i) + '<button type="button" class="mini-btn del" onclick="emDel(' + i + ')" title="Remover matéria" aria-label="Remover matéria">' + app.ic('i29') + '</button></div>' + app.fT('Nome da matéria', m.n, 'emSet(' + i + ',\'n\',this.value)', 'Ex.: Direito Constitucional') + app.fT('Dica do ciclo de estudos', m.dica, 'emSet(' + i + ',\'dica\',this.value)', 'Ex.: teoria 25 min + questões 25 min') + app.fA('Tópicos (um por linha)', m.t, 'emSet(' + i + ',\'t\',this.value)', '', 120) + app.fA('Materiais (um por linha: <b>tipo | rótulo | endereço</b>)', m.mat, 'emSet(' + i + ',\'mat\',this.value)', 'Tipos: lei, apostila, video, quest, resumo, site.', 100) + '</div>';
  });
  h += '<button type="button" class="btn add-row" onclick="emAdd()">' + app.ic('i30') + 'Adicionar matéria</button>';
  h += '</div><div class="modal-f"><span class="sp"></span><button class="btn ghost" onclick="emFechar()">Cancelar</button><button class="btn primary" onclick="emSalvar()">' + app.ic('i32') + 'Salvar matérias</button></div>';
  app.modalAbrir(h, false);
};
app.emFechar = function () {
  if (!confirm('Fechar sem salvar as matérias?')) return;
  app.EM = null;
  if (app.ED) app.edRender();else app.modalFechar();
};
app.emSalvar = function () {
  var nova = [],
    usados = [];
  app.EM.forEach(function (m) {
    var nome = String(m.n || '').trim();
    if (!nome) return;
    var id = m.id || app.idLivre(app.slug(nome), usados.map(function (x) {
      return {
        id: x
      };
    }));
    usados.push(id);
    nova.push({
      id: id,
      n: nome,
      dica: String(m.dica || '').trim(),
      t: app.linhas(m.t),
      mat: app.emParseMat(m.mat)
    });
  });
  var vivos = {};
  nova.forEach(function (m) {
    vivos[m.id] = 1;
  });
  app.CCT().forEach(function (c) {
    c.mats = (c.mats || []).filter(function (x) {
      return vivos[x];
    });
  });
  app.DADOS.materias = nova;
  app.DADOS.updatedAt = new Date().toISOString();
  app.EM = null;
  app.saveS();
  if (app.ED) {
    app.edRender();
  } else {
    app.modalFechar();
  }
  app.renderTudo();
};
/* ---------- importar e exportar UM concurso ----------
   O backup (bkImport) troca tudo o que está salvo. Aqui é o contrário:
   cola-se a ficha de um concurso só e ela ENTRA junto com as que já
   existem, sem encostar em nada. É por onde chega um edital pronto. */
app.ccModelo = function () {
  return {
    id: '',
    cor: 'blue',
    inscrita: false,
    titulo: '',
    cargo: '',
    nome: '',
    sub: '',
    badge: '',
    banca: '',
    bancaCurto: '',
    curto: '',
    prova: '',
    inscAte: '',
    nivel: '',
    vagasChip: '',
    urlBanca: '',
    formato: '',
    mats: [],
    ficha: [],
    raiox: {
      sub: '',
      leg: [],
      bar: [],
      linhas: [],
      nota: ''
    },
    conteudoSub: '',
    blocos: [],
    conteudoNota: '',
    etapasSub: '',
    etapas: [],
    etapasNota: '',
    cronogramaSub: '',
    cronograma: [],
    atribSub: '',
    atribuicoes: [],
    requisito: '',
    atribNota: '',
    linksSub: '',
    links: [],
    notas: '',
    arquivado: false
  };
};
/* completa o que faltar e joga fora o que não faz parte da ficha */
app.ccNormalizar = function (o, materias = app.MT()) {
  var base = app.ccModelo(),
    saida = {};
  Object.keys(base).forEach(function (k) {
    var v = o[k];
    if (v == null) {
      saida[k] = base[k];
      return;
    }
    if (Array.isArray(base[k])) {
      saida[k] = Array.isArray(v) ? v : base[k];
      return;
    }
    if (base[k] && typeof base[k] === 'object') {
      saida[k] = v && typeof v === 'object' ? v : base[k];
      return;
    }
    if (typeof base[k] === 'boolean') {
      saida[k] = !!v;
      return;
    }
    saida[k] = String(v);
  });
  saida.mats = (saida.mats || []).filter(function (m) {
    return materias.some(function (subject) { return subject.id === m; });
  });
  return saida;
};
app.ccImportar = function () { app.openContestImport(); };
app.ccExportar = function (id) {
  var c = app.cById(id);
  if (!c) return;
  var copia = JSON.parse(JSON.stringify(c));
  delete copia.notas; /* anotação pessoal não viaja junto */
  var txt = JSON.stringify(copia, null, 1);
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(txt).then(function () {
      alert('Ficha de “' + app.semFmt(c.titulo) + '” copiada.\n\nDá para colar em outro aparelho pelo botão “Colar um concurso pronto”.');
    }, function () {
      app.bkModal(txt);
    });
  } else app.bkModal(txt);
};
app.edCards = function () {
  app.FE = {
    decks: JSON.parse(JSON.stringify(app.DK())),
    cards: JSON.parse(JSON.stringify(app.FCS())),
    deck: null,
    busca: '',
    edit: null
  };
  app.feRender();
};
app.feFechar = function () {
  if (!confirm('Fechar sem salvar? As alterações nos flashcards serão perdidas.')) return;
  app.FE = null;
  app.modalFechar();
};
app.feNovoDeckId = function () {
  var n = 1,
    ids = {};
  app.FE.decks.forEach(function (d) {
    ids[d.id] = 1;
  });
  while (ids['dk' + n]) n++;
  return 'dk' + n;
};
app.feNovoId = function () {
  var max = 0;
  app.FE.cards.forEach(function (c) {
    var m = /^f(\d+)$/.exec(c.i || '');
    if (m) max = Math.max(max, +m[1]);
  });
  Object.keys(app.S.fc || {}).forEach(function (k) {
    var m = /^f(\d+)$/.exec(k);
    if (m) max = Math.max(max, +m[1]);
  });
  return 'f' + (max + 1);
};
app.feCorOpts = function (v) {
  var h = '',
    achou = false;
  app.CORES.forEach(function (k) {
    var val = 'var(--' + k.k + ')';
    if (val === v) achou = true;
    h += '<option value="' + val + '"' + (val === v ? ' selected' : '') + '>' + k.n + '</option>';
  });
  if (!achou && v) h += '<option value="' + app.ea(v) + '" selected>Cor própria</option>';
  return h;
};
app.feDeckSet = function (i, k, v) {
  if (app.FE.decks[i]) app.FE.decks[i][k] = v;
  if (k === 'c') app.feLista();
};
app.feDeckAdd = function () {
  app.FE.decks.push({
    id: app.feNovoDeckId(),
    n: '',
    c: 'var(--blue)'
  });
  app.feLista();
};
app.feDeckMover = function (i, dir) {
  if (app.arrMove(app.FE.decks, i, dir)) app.feLista();
};
app.feDeckDel = function (i) {
  var d = app.FE.decks[i];
  if (!d) return;
  var n = app.FE.cards.filter(function (c) {
    return c.d === d.id;
  }).length;
  if (!confirm(n ? 'Remover o deck “' + (d.n || 'sem nome') + '” e os ' + n + ' cards dele?' : 'Remover o deck “' + (d.n || 'sem nome') + '”?')) return;
  app.FE.cards = app.FE.cards.filter(function (c) {
    return c.d !== d.id;
  });
  app.FE.decks.splice(i, 1);
  app.feLista();
};
app.feAbrirDeck = function (id) {
  app.FE.deck = id;
  app.FE.edit = null;
  app.FE.busca = '';
  app.feRender();
};
app.feVoltar = function () {
  app.FE.deck = null;
  app.FE.edit = null;
  app.FE.busca = '';
  app.feRender();
};
app.feEdit = function (id) {
  app.FE.edit = app.FE.edit === id ? null : id;
  app.feLista();
};
app.feCardSet = function (i, k, v) {
  if (app.FE.cards[i]) app.FE.cards[i][k] = v;
};
app.fePrev = function (id, v) {
  var el = document.getElementById(id);
  if (el) el.innerHTML = app.fmt(v);
};
app.feCardDel = function (i) {
  var c = app.FE.cards[i];
  if (!c) return;
  if (!confirm('Apagar este card?\n\n' + app.semFmt(c.q || '(sem pergunta)').slice(0, 120))) return;
  app.FE.cards.splice(i, 1);
  app.feLista();
};
app.feCardAdd = function () {
  var id = app.feNovoId();
  app.FE.cards.push({
    i: id,
    d: app.FE.deck || app.FE.decks[0] && app.FE.decks[0].id || '',
    q: '',
    a: '',
    s: '',
    u: ''
  });
  app.FE.edit = id;
  app.feLista();
  setTimeout(function () {
    var el = document.getElementById('fe-novo');
    if (el) el.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
  }, 60);
};
app.feBuscaSet = function (v) {
  app.FE.busca = v;
  app.FE.edit = null;
  app.feLista();
};
/* ---------- listas ---------- */
app.feDecksHtml = function () {
  var h = '';
  app.FE.decks.forEach(function (d, i) {
    var n = app.FE.cards.filter(function (c) {
      return c.d === d.id;
    }).length;
    h += '<div class="fe-deck"><span class="sw" style="background:' + app.ea(d.c) + '"></span>' + '<span class="nm"><input type="text" value="' + app.ea(d.n) + '" placeholder="Nome do deck" oninput="feDeckSet(' + i + ',\'n\',this.value)"/></span>' + '<select class="fe-cor" onchange="feDeckSet(' + i + ',\'c\',this.value)">' + app.feCorOpts(d.c) + '</select>' + '<button class="btn ghost sm fe-open" onclick="feAbrirDeck(\'' + d.id + '\')">' + n + ' card' + (n === 1 ? '' : 's') + app.ic('i8') + '</button>' + app.ordBtns('feDeckMover', i) + '<button class="mini-btn" onclick="feDeckDel(' + i + ')" title="Remover deck" aria-label="Remover deck">' + app.ic('i29') + '</button></div>';
  });
  h += '<button type="button" class="btn add-row" onclick="feDeckAdd()">' + app.ic('i30') + 'Adicionar deck</button>';
  return h;
};
app.feCardsHtml = function (lista, mostrarDeck) {
  var h = '';
  if (!lista.length) h += '<div class="pn-empty">' + (app.FE.busca ? 'Nenhum card encontrado para esta busca.' : 'Este deck ainda não tem cards.') + '</div>';
  lista.forEach(function (x) {
    var c = x.c,
      i = x.i,
      dk = null;
    app.FE.decks.forEach(function (d) {
      if (d.id === c.d) dk = d;
    });
    if (app.FE.edit === c.i) {
      h += '<div class="rowi" id="fe-novo"><button type="button" class="rm" onclick="feCardDel(' + i + ')" title="Apagar card" aria-label="Apagar card">' + app.ic('i29') + '</button>' + '<div class="fld"><label>Deck</label><select onchange="feCardSet(' + i + ',\'d\',this.value);feLista()">';
      app.FE.decks.forEach(function (d) {
        h += '<option value="' + d.id + '"' + (c.d === d.id ? ' selected' : '') + '>' + app.tx(d.n || '(sem nome)') + '</option>';
      });
      h += '</select></div>' + app.fFmt('Pergunta', c.q, 'feCardSet(' + i + ',\'q\',this.value);fePrev(\'fe-pq\',this.value)', '', 70, true) + app.fFmt('Resposta', c.a, 'feCardSet(' + i + ',\'a\',this.value);fePrev(\'fe-pa\',this.value)', '', 90, true) + '<div class="fe-prev" style="--dk:' + app.ea(dk ? dk.c : 'var(--magenta)') + '"><span class="pl">Como o card vai aparecer</span><div class="pq" id="fe-pq">' + app.fmt(c.q) + '</div><div class="pa" id="fe-pa">' + app.fmt(c.a) + '</div></div>' + app.fFmt('Fonte', c.s, 'feCardSet(' + i + ',\'s\',this.value)', 'norma culta · lei, artigo…') + app.fT('Busca de aula (YouTube)', String(c.u || '').replace(/\+/g, ' '), 'feCardSet(' + i + ',\'u\',this.value)', 'crase regras aula') + '<div style="text-align:right"><button type="button" class="btn ghost sm fe-up" onclick="feEdit(null)">' + app.ic('i8') + 'Recolher</button></div>' + '</div>';
    } else {
      h += '<div class="fe-row">' + (mostrarDeck ? '<span class="fd" style="--dk:' + app.ea(dk ? dk.c : 'var(--magenta)') + '">' + app.tx(dk ? dk.n : 'sem deck') + '</span>' : '') + '<span class="fq">' + app.tx(app.semFmt(c.q || '(sem pergunta)')) + '</span>' + '<button class="mini-btn" onclick="feEdit(\'' + c.i + '\')" title="Editar card" aria-label="Editar card">' + app.ic('i28') + '</button>' + '<button class="mini-btn" onclick="feCardDel(' + i + ')" title="Apagar card" aria-label="Apagar card">' + app.ic('i29') + '</button></div>';
    }
  });
  if (app.FE.deck) h += '<button type="button" class="btn add-row" onclick="feCardAdd()">' + app.ic('i30') + 'Adicionar card neste deck</button>';
  return h;
};
app.feLista = function () {
  var el = document.getElementById('fe-lista');
  if (!el) return;
  var q = String(app.FE.busca || '').trim().toLowerCase();
  if (app.FE.deck === null && !q) {
    el.innerHTML = app.feDecksHtml();
    return;
  }
  var lista = [];
  app.FE.cards.forEach(function (c, i) {
    if (app.FE.deck && c.d !== app.FE.deck) return;
    if (q) {
      var t = app.semFmt((c.q || '') + ' ' + (c.a || '') + ' ' + (c.s || '')).toLowerCase();
      if (t.indexOf(q) < 0) return;
    }
    lista.push({
      c: c,
      i: i
    });
  });
  el.innerHTML = app.feCardsHtml(lista, app.FE.deck === null);
};
app.feRender = function () {
  var dk = null;
  app.FE.decks.forEach(function (d) {
    if (d.id === app.FE.deck) dk = d;
  });
  var titulo = dk ? 'Flashcards · ' + (dk.n || 'sem nome') : 'Flashcards';
  var h = app.modalHead(titulo, 'i27', 'feFechar()') + '<div class="modal-b">';
  if (dk) {
    h += '<button type="button" class="fe-back" onclick="feVoltar()">' + app.ic('i8') + 'Todos os decks</button>';
  } else {
    h += app.edNota('Cada deck é uma pilha de cards com <b>repetição espaçada</b> própria. Editar a pergunta ou a resposta <b>não zera</b> o histórico do card; apagar o card apaga também o histórico dele. Cards sem pergunta são descartados ao salvar.<br/>Para destacar um trecho, selecione e toque em <b>N</b> ou <b>I</b> — ou escreva *negrito* entre asteriscos e _itálico_ entre sublinhados.');
  }
  h += '<div class="fld"><label>Buscar</label><input type="text" id="fe-busca" value="' + app.ea(app.FE.busca) + '" placeholder="' + (dk ? 'buscar neste deck…' : 'buscar em todos os cards…') + '" oninput="feBuscaSet(this.value)" autocomplete="off"/></div>';
  h += '<div id="fe-lista"></div>';
  h += '</div><div class="modal-f"><span class="fe-ct" id="fe-ct"></span><span class="sp"></span><button class="btn ghost" onclick="feFechar()">Cancelar</button><button class="btn primary" onclick="feSalvar()">' + app.ic('i32') + 'Salvar flashcards</button></div>';
  app.modalAbrir(h, false);
  app.feLista();
  app.feContagem();
};
app.feContagem = function () {
  var el = document.getElementById('fe-ct');
  if (!el) return;
  el.textContent = app.FE.cards.length + ' cards em ' + app.FE.decks.length + ' decks';
};
app.feSalvar = function () {
  var semNome = app.FE.decks.filter(function (d) {
    return !String(d.n || '').trim();
  }).length;
  if (semNome) {
    alert('Dê um nome a todos os decks antes de salvar (' + semNome + ' sem nome).');
    return;
  }
  if (!app.FE.decks.length) {
    alert('Deixe pelo menos um deck — os cards precisam de uma pilha para viver.');
    return;
  }
  var decks = app.FE.decks.map(function (d) {
    return {
      id: d.id,
      n: String(d.n).trim(),
      c: d.c || 'var(--magenta)'
    };
  });
  var vivos = {};
  decks.forEach(function (d) {
    vivos[d.id] = 1;
  });
  var cards = [];
  app.FE.cards.forEach(function (c) {
    var q = String(c.q || '').trim();
    if (!q) return;
    var o = {
      i: c.i,
      d: vivos[c.d] ? c.d : decks[0].id,
      q: q,
      a: String(c.a || '').trim(),
      s: String(c.s || '').trim()
    };
    var u = String(c.u || '').trim().replace(/\s+/g, '+');
    if (u) o.u = u;
    cards.push(o);
  });
  var ids = {};
  cards.forEach(function (c) {
    ids[c.i] = 1;
  });
  Object.keys(app.S.fc || {}).forEach(function (k) {
    if (!ids[k]) delete app.S.fc[k];
  });
  app.DADOS.decks = decks;
  app.DADOS.cards = cards;
  app.DADOS.updatedAt = new Date().toISOString();
  app.FE = null;
  app.fcActive = false;
  app.fcQ = [];
  app.fcIdx = 0;
  app.fcRev = false;
  app.saveS();
  app.modalFechar();
  app.renderTudo();
};
/* =====================================================================
   EDITORES: fontes, documentos, metas e ciclo
   ===================================================================== */
app.fN = function (lbl, val, h, hint) {
  return '<div class="fld"><label>' + lbl + '</label><input type="text" inputmode="numeric" value="' + app.ea(val) + '" oninput="' + h + '"/>' + (hint ? '<p class="hint">' + hint + '</p>' : '') + '</div>';
};
app.num = function (v, pad, min, max) {
  var n = parseInt(String(v).replace(/[^0-9]/g, ''), 10);
  if (isNaN(n)) n = pad;
  if (min != null && n < min) n = min;
  if (max != null && n > max) n = max;
  return n;
};
app.selIc = function (opts, atual, h) {
  var s = '<select onchange="' + h + '">';
  opts.forEach(function (o) {
    s += '<option value="' + o[0] + '"' + (atual === o[0] ? ' selected' : '') + '>' + o[1] + '</option>';
  });
  return s + '</select>';
};
app.selCor = function (atual, h) {
  var s = '<select onchange="' + h + '">';
  app.CORES.forEach(function (k) {
    s += '<option value="' + k.k + '"' + (atual === k.k ? ' selected' : '') + '>' + k.n + '</option>';
  });
  return s + '</select>';
};
app.edFontes = function () {
  app.FO = JSON.parse(JSON.stringify(app.DADOS.fontes || []));
  app.foRender();
};
app.foFechar = function () {
  if (!confirm('Fechar sem salvar as fontes?')) return;
  app.FO = null;
  app.modalFechar();
};
app.foSet = function (gi, k, v) {
  if (app.FO[gi]) app.FO[gi][k] = v;
  if (k === 'cor' || k === 'ic') app.foRender();
};
app.foIt = function (gi, ii, k, v) {
  if (app.FO[gi] && app.FO[gi].itens[ii]) app.FO[gi].itens[ii][k] = v;
};
app.foAddG = function () {
  app.FO.push({
    id: 'g' + Date.now(),
    n: '',
    sub: '',
    ic: 'i14',
    cor: 'blue',
    itens: [{
      b: '',
      s: '',
      u: ''
    }]
  });
  app.foRender();
};
app.foDelG = function (gi) {
  var g = app.FO[gi];
  if (!g) return;
  if (!confirm('Remover o grupo “' + (g.n || 'sem nome') + '” e os ' + (g.itens || []).length + ' links dele?')) return;
  app.FO.splice(gi, 1);
  app.foRender();
};
app.foAddI = function (gi) {
  app.FO[gi].itens.push({
    b: '',
    s: '',
    u: ''
  });
  app.foRender();
};
app.foMoverG = function (i, dir) {
  if (app.arrMove(app.FO, i, dir)) app.foRender();
};
app.foMoverI = function (gi, ii, dir) {
  if (app.arrMove(app.FO[gi].itens, ii, dir)) app.foRender();
};
app.foDelI = function (gi, ii) {
  app.FO[gi].itens.splice(ii, 1);
  app.foRender();
};
app.foRender = function () {
  var h = app.modalHead('Fontes de concursos', 'i1', 'foFechar()') + '<div class="modal-b">';
  h += app.edNota('Este é o diretório da aba <b>Concursos</b>. Monte-o do seu jeito: crie grupos (por exemplo “Concursos federais” ou “Blogs que sigo”) e coloque neles os sites que você realmente consulta. Se a descrição de um link ficar vazia, eu mostro o endereço do site.');
  app.FO.forEach(function (g, gi) {
    h += '<div class="rowi"><div class="rowi-acts">' + app.ordBtns('foMoverG', gi) + '<button type="button" class="mini-btn del" onclick="foDelG(' + gi + ')" title="Remover grupo" aria-label="Remover grupo">' + app.ic('i29') + '</button></div>' + app.fT('Nome do grupo', g.n, 'foSet(' + gi + ',\'n\',this.value)', 'Ex.: Fontes oficiais') + app.fT('Descrição curta', g.sub, 'foSet(' + gi + ',\'sub\',this.value)', 'Ex.: publicações e órgãos do governo') + '<div class="fld-row">' + '<div class="fld"><label>Ícone</label>' + app.selIc(app.ICONES_GRUPO, g.ic || 'i14', 'foSet(' + gi + ',\'ic\',this.value)') + '</div>' + '<div class="fld"><label>Cor</label>' + app.selCor(g.cor || 'blue', 'foSet(' + gi + ',\'cor\',this.value)') + '</div>' + '</div>';
    (g.itens || []).forEach(function (it, ii) {
      h += '<div class="rowi" style="background:var(--surface-2)"><div class="rowi-acts">' + '<button type="button" class="mini-btn up" onclick="foMoverI(' + gi + ',' + ii + ',-1)" title="Subir" aria-label="Subir na lista">' + app.ic('i8') + '</button>' + '<button type="button" class="mini-btn" onclick="foMoverI(' + gi + ',' + ii + ',1)" title="Descer" aria-label="Descer na lista">' + app.ic('i8') + '</button>' + '<button type="button" class="mini-btn del" onclick="foDelI(' + gi + ',' + ii + ')" title="Remover link" aria-label="Remover link">' + app.ic('i29') + '</button></div>' + app.fT('Nome do site', it.b, 'foIt(' + gi + ',' + ii + ',\'b\',this.value)', 'Ex.: PCI Concursos') + app.fT('Descrição', it.s, 'foIt(' + gi + ',' + ii + ',\'s\',this.value)', 'deixe vazio para mostrar o endereço') + app.fU('Endereço', it.u, 'foIt(' + gi + ',' + ii + ',\'u\',this.value)') + '</div>';
    });
    h += '<button type="button" class="btn add-row" onclick="foAddI(' + gi + ')">' + app.ic('i30') + 'Adicionar link neste grupo</button></div>';
  });
  h += '<button type="button" class="btn add-row" onclick="foAddG()">' + app.ic('i30') + 'Adicionar grupo</button>';
  h += '</div><div class="modal-f"><span class="sp"></span><button class="btn ghost" onclick="foFechar()">Cancelar</button><button class="btn primary" onclick="foSalvar()">' + app.ic('i32') + 'Salvar fontes</button></div>';
  app.modalAbrir(h, false);
};
app.foSalvar = function () {
  var novas = [];
  app.FO.forEach(function (g) {
    var n = String(g.n || '').trim();
    if (!n) return;
    var itens = (g.itens || []).filter(function (it) {
      return String(it.u || '').trim();
    }).map(function (it) {
      return {
        b: String(it.b || '').trim() || app.dominio(it.u),
        s: String(it.s || '').trim(),
        u: String(it.u).trim()
      };
    });
    novas.push({
      id: g.id || 'g' + novas.length,
      n: n,
      sub: String(g.sub || '').trim(),
      ic: g.ic || 'i14',
      cor: g.cor || 'blue',
      itens: itens
    });
  });
  app.DADOS.fontes = novas;
  app.DADOS.updatedAt = new Date().toISOString();
  app.FO = null;
  app.saveS();
  app.modalFechar();
  app.renderFontes();
};
app.edDocs = function () {
  app.DO = JSON.parse(JSON.stringify(app.DADOS.docs || []));
  app.doRender();
};
app.doFechar = function () {
  if (!confirm('Fechar sem salvar os documentos?')) return;
  app.DO = null;
  app.modalFechar();
};
app.doSet = function (i, k, v) {
  if (app.DO[i]) app.DO[i][k] = v;
  if (k === 'ic') app.doRender();
};
app.doAdd = function () {
  app.DO.push({
    n: '',
    ic: 'i15',
    u: ''
  });
  app.doRender();
};
app.doMover = function (i, dir) {
  if (app.arrMove(app.DO, i, dir)) app.doRender();
};
app.doDel = function (i) {
  app.DO.splice(i, 1);
  app.doRender();
};
app.doRender = function () {
  var h = app.modalHead('Meus documentos', 'i16', 'doFechar()') + '<div class="modal-b">';
  h += app.edNota('Atalhos que ficam no alto do painel, na aba <b>Hoje</b>. Servem para o que você abre toda hora: um índice de resumos no Drive, o cronograma, uma planilha de erros, o edital em PDF.');
  app.DO.forEach(function (d, i) {
    h += '<div class="rowi"><div class="rowi-acts">' + app.ordBtns('doMover', i) + '<button type="button" class="mini-btn del" onclick="doDel(' + i + ')" title="Remover documento" aria-label="Remover documento">' + app.ic('i29') + '</button></div>' + app.fT('Nome', d.n, 'doSet(' + i + ',\'n\',this.value)', 'Ex.: Cronograma de estudos') + app.fU('Endereço', d.u, 'doSet(' + i + ',\'u\',this.value)') + '<div class="fld"><label>Ícone</label>' + app.selIc(app.ICONES_DOC, d.ic || 'i15', 'doSet(' + i + ',\'ic\',this.value)') + '</div></div>';
  });
  h += '<button type="button" class="btn add-row" onclick="doAdd()">' + app.ic('i30') + 'Adicionar documento</button>';
  h += '</div><div class="modal-f"><span class="sp"></span><button class="btn ghost" onclick="doFechar()">Cancelar</button><button class="btn primary" onclick="doSalvar()">' + app.ic('i32') + 'Salvar documentos</button></div>';
  app.modalAbrir(h, false);
};
app.doSalvar = function () {
  app.DADOS.docs = app.DO.filter(function (d) {
    return String(d.u || '').trim() && String(d.n || '').trim();
  }).map(function (d) {
    return {
      n: String(d.n).trim(),
      ic: d.ic || 'i15',
      u: String(d.u).trim()
    };
  });
  app.DADOS.updatedAt = new Date().toISOString();
  app.DO = null;
  app.saveS();
  app.modalFechar();
  app.renderDocs();
};
app.edMetas = function () {
  app.ME = JSON.parse(JSON.stringify(app.MET()));
  app.meRender();
};
app.meFechar = function () {
  if (!confirm('Fechar sem salvar as metas?')) return;
  app.ME = null;
  app.modalFechar();
};
app.meSet = function (k, v) {
  app.ME[k] = v;
};
app.meIv = function (i, v) {
  app.ME.revisao = app.ME.revisao || [1, 7];
  app.ME.revisao[i] = v;
};
app.meRender = function () {
  var h = app.modalHead('Metas e ritmo', 'i23', 'meFechar()') + '<div class="modal-b">';
  h += app.edNota('Estes números comandam o painel inteiro: o alvo pinta as barras de questões, a meta de blocos aparece no ciclo e na sessão do dia, e os intervalos definem quando cada coisa volta para você.');
  h += '<div class="ed-sec open"><button type="button" class="ed-h" onclick="edToggleSec(this)">Metas' + '<span class="n">alvo e ritmo diário</span><svg class="chev" viewBox="0 0 24 24"><use href="#i8"/></svg></button><div class="ed-b"><div class="meta-g">' + app.fN('Alvo de acertos (%)', app.ME.alvo, 'meSet(\'alvo\',this.value)', 'Abaixo disso a matéria fica marcada como “reforçar”.') + app.fN('Blocos por dia', app.ME.blocosDia, 'meSet(\'blocosDia\',this.value)', '0 desliga a meta diária.') + app.fN('Minutos por bloco', app.ME.blocoMin, 'meSet(\'blocoMin\',this.value)', 'Padrão dos blocos do ciclo automático.') + '</div></div></div>';
  h += '<div class="ed-sec open"><button type="button" class="ed-h" onclick="edToggleSec(this)">Ritmo das revisões' + '<span class="n">lista do edital e flashcards</span><svg class="chev" viewBox="0 0 24 24"><use href="#i8"/></svg></button><div class="ed-b">' + '<div class="meta-g">' + app.fN('Dias até revisar', (app.ME.revisao || [1, 7])[0], 'meIv(0,this.value)', 'Depois de marcar <b class="ce">E</b>studei, o tópico volta em quantos dias.') + app.fN('Dias até as questões', (app.ME.revisao || [1, 7])[1], 'meIv(1,this.value)', 'Depois de marcar <b class="cr">R</b>evisei, quando fechar com <b class="cq">Q</b>uestões.') + '</div>' + '<div class="fld"><label>Intervalos dos flashcards (dias)</label><div class="iv-row" id="me-iv"></div><p class="hint">Cada acerto seguido empurra o card para o próximo número da fila. Errou, ele volta para o começo. Padrão: 1, 3, 7, 16, 35.</p></div>' + app.fN('Limite de flashcards por sessão', app.ME.fcDia, 'meSet(\'fcDia\',this.value)', '0 = sem limite (aparecem todos os vencidos de uma vez).') + '</div></div>';
  h += '</div><div class="modal-f"><button class="btn ghost sm" onclick="meRestaurar()">Voltar ao padrão</button><span class="sp"></span><button class="btn ghost" onclick="meFechar()">Cancelar</button><button class="btn primary" onclick="meSalvar()">' + app.ic('i32') + 'Salvar</button></div>';
  app.modalAbrir(h, false);
  app.meIvRender();
};
app.edToggleSec = function (btn) {
  var s = btn.parentNode;
  s.classList.toggle('open');
};
app.meIvRender = function () {
  var el = document.getElementById('me-iv');
  if (!el) return;
  var v = Array.isArray(app.ME.fciv) && app.ME.fciv.length ? app.ME.fciv : [1, 3, 7, 16, 35];
  app.ME.fciv = v;
  var h = '';
  v.forEach(function (x, i) {
    h += '<input type="text" inputmode="numeric" value="' + app.ea(x) + '" oninput="ME.fciv[' + i + ']=this.value" aria-label="Intervalo ' + (i + 1) + '"/>';
  });
  h += '<button type="button" class="mini-btn" onclick="meIvAdd()" title="Adicionar intervalo" aria-label="Adicionar intervalo">' + app.ic('i30') + '</button>';
  if (v.length > 1) h += '<button type="button" class="mini-btn" onclick="meIvDel()" title="Remover o último" aria-label="Remover o último intervalo">' + app.ic('i29') + '</button>';
  el.innerHTML = h;
};
app.meIvAdd = function () {
  var v = app.ME.fciv;
  v.push(app.num(v[v.length - 1], 7, 1, 3650) * 2);
  app.meIvRender();
};
app.meIvDel = function () {
  if (app.ME.fciv.length > 1) app.ME.fciv.pop();
  app.meIvRender();
};
app.meRestaurar = function () {
  if (!confirm('Voltar todas as metas e intervalos ao padrão?')) return;
  app.ME = JSON.parse(JSON.stringify(app.SEED.metas));
  app.meRender();
};
app.meSalvar = function () {
  var m = app.MET();
  m.alvo = app.num(app.ME.alvo, 70, 1, 100);
  m.blocosDia = app.num(app.ME.blocosDia, 0, 0, 12);
  m.blocoMin = app.num(app.ME.blocoMin, 45, 5, 240);
  m.revisao = [app.num((app.ME.revisao || [])[0], 1, 1, 60), app.num((app.ME.revisao || [])[1], 7, 1, 120)];
  m.fciv = (app.ME.fciv || []).map(function (x) {
    return app.num(x, 1, 1, 3650);
  }).filter(function (x, i, a) {
    return i === 0 || x > a[i - 1];
  });
  if (!m.fciv.length) m.fciv = [1, 3, 7, 16, 35];
  m.fcDia = app.num(app.ME.fcDia, 0, 0, 500);
  app.DADOS.updatedAt = new Date().toISOString();
  app.ME = null;
  app.saveS();
  app.modalFechar();
  app.renderTudo();
};
app.edCiclo = function () {
  app.CI = JSON.parse(JSON.stringify(app.DADOS.ciclo || {
    modo: 'auto',
    blocos: []
  }));
  if (!Array.isArray(app.CI.blocos)) app.CI.blocos = [];
  app.ciRender();
};
app.ciFechar = function () {
  if (!confirm('Fechar sem salvar o ciclo?')) return;
  app.CI = null;
  app.modalFechar();
};
app.ciModo = function (m) {
  app.CI.modo = m;
  if (m === 'manual' && !app.CI.blocos.length) app.ciCopiar(true);
  app.ciRender();
};
app.ciSet = function (i, k, v) {
  if (app.CI.blocos[i]) app.CI.blocos[i][k] = v;
};
app.ciMid = function (i, v) {
  app.CI.blocos[i].mid = v;
  var m = app.mById(v);
  if (m) {
    if (!String(app.CI.blocos[i].m || '').trim()) app.CI.blocos[i].m = m.n;
    if (!String(app.CI.blocos[i].d || '').trim()) app.CI.blocos[i].d = m.dica || '';
  }
  app.ciRender();
};
app.ciAdd = function () {
  app.CI.blocos.push({
    mid: '',
    m: '',
    d: '',
    min: app.MET().blocoMin
  });
  app.ciRender();
};
app.ciDel = function (i) {
  app.CI.blocos.splice(i, 1);
  app.ciRender();
};
app.ciMover = function (i, dir) {
  if (app.arrMove(app.CI.blocos, i, dir)) app.ciRender();
};
app.ciCopiar = function (silencioso) {
  var fk = app.faseKey();
  if (!fk || !app.CICLOS[fk]) {
    if (!silencioso) alert('Não há ciclo automático para copiar — cadastre um concurso com data de prova.');
    return;
  }
  if (!silencioso && app.CI.blocos.length && !confirm('Substituir os blocos atuais pelo ciclo automático?')) return;
  app.CI.blocos = app.CICLOS[fk].b.map(function (b) {
    return {
      mid: b.id || '',
      m: b.m,
      d: b.d,
      min: b.min || app.MET().blocoMin
    };
  });
  if (!silencioso) app.ciRender();
};
app.ciRender = function () {
  var manual = app.CI.modo === 'manual';
  var h = app.modalHead('Ciclo de estudos', 'i20', 'ciFechar()') + '<div class="modal-b">';
  h += app.edNota('No modo <b>automático</b> o ciclo se monta sozinho a partir das matérias do próximo concurso, e se refaz quando você cadastra ou arquiva algo. No <b>meu ciclo</b> a lista é sua: a ordem, os nomes e a duração de cada bloco — inclusive blocos que não são matéria, como “Redação” ou “Simulado cronometrado”.');
  h += '<div class="pnav" style="margin-top:0">' + '<button type="button" class="pnav-b" aria-selected="' + !manual + '" style="--pc:var(--teal)" onclick="ciModo(\'auto\')">' + app.ic('i20') + '<span>Automático</span></button>' + '<button type="button" class="pnav-b" aria-selected="' + manual + '" style="--pc:var(--violet)" onclick="ciModo(\'manual\')">' + app.ic('i28') + '<span>Meu ciclo</span></button>' + '</div>';
  if (!manual) {
    var fk = app.faseKey();
    h += '<p class="hint" style="margin-bottom:10px">Blocos que o automático monta hoje:</p>';
    if (fk && app.CICLOS[fk]) {
      app.CICLOS[fk].b.forEach(function (b, i) {
        h += '<div class="fe-row"><span class="fd" style="--dk:var(--teal)">' + (i + 1) + '</span><span class="fq">' + app.tx(b.m) + '</span><span class="hint" style="margin:0">' + (b.min || app.MET().blocoMin) + ' min</span></div>';
      });
    } else h += '<div class="pn-empty">Nenhum concurso com prova à frente — sem ciclo automático por enquanto.</div>';
  } else {
    app.CI.blocos.forEach(function (b, i) {
      h += '<div class="rowi"><div class="rowi-acts">' + app.ordBtns('ciMover', i) + '<button type="button" class="mini-btn del" onclick="ciDel(' + i + ')" title="Remover bloco" aria-label="Remover bloco">' + app.ic('i29') + '</button>' + '</div>' + '<div class="fld"><label>Matéria</label><select onchange="ciMid(' + i + ',this.value)"><option value="">— bloco livre —</option>';
      app.MT().forEach(function (m) {
        h += '<option value="' + m.id + '"' + (b.mid === m.id ? ' selected' : '') + '>' + app.tx(m.n) + '</option>';
      });
      h += '</select><p class="hint">Ligando a uma matéria, os materiais de estudo dela aparecem no bloco.</p></div>' + '<div class="fld-row">' + app.fT('Nome do bloco', b.m, 'ciSet(' + i + ',\'m\',this.value)', 'Ex.: Redação técnica') + app.fN('Minutos', b.min, 'ciSet(' + i + ',\'min\',this.value)') + '</div>' + app.fT('O que fazer nele', b.d, 'ciSet(' + i + ',\'d\',this.value)', 'Ex.: 1 redação cronometrada + correção') + '</div>';
    });
    h += '<button type="button" class="btn add-row" onclick="ciAdd()">' + app.ic('i30') + 'Adicionar bloco</button>' + '<button type="button" class="btn ghost sm" style="margin-top:10px" onclick="ciCopiar()">' + app.ic('i20') + 'Copiar o ciclo automático para cá</button>';
  }
  h += '</div><div class="modal-f"><span class="sp"></span><button class="btn ghost" onclick="ciFechar()">Cancelar</button><button class="btn primary" onclick="ciSalvar()">' + app.ic('i32') + 'Salvar ciclo</button></div>';
  app.modalAbrir(h, false);
};
app.ciSalvar = function () {
  var blocos = app.CI.blocos.filter(function (b) {
    return String(b.m || '').trim() || b.mid;
  }).map(function (b) {
    var m = b.mid ? app.mById(b.mid) : null;
    return {
      mid: b.mid || '',
      m: String(b.m || '').trim() || (m ? m.n : 'Bloco'),
      d: String(b.d || '').trim(),
      min: app.num(b.min, app.MET().blocoMin, 5, 240)
    };
  });
  if (app.CI.modo === 'manual' && !blocos.length) {
    alert('Adicione pelo menos um bloco, ou volte para o modo automático.');
    return;
  }
  app.DADOS.ciclo = {
    modo: app.CI.modo === 'manual' ? 'manual' : 'auto',
    blocos: blocos
  };
  app.DADOS.updatedAt = new Date().toISOString();
  app.CI = null;
  app.saveS();
  app.modalFechar();
  app.renderTudo();
};
