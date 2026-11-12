import { app } from './state.js';

app.renderDrawer = function () {
  var el = document.getElementById('drawer-nav');
  if (!el) return;
  function n1(v, ico, txt) {
    return '<a class="nv nv-1" data-v="' + v + '" onclick="goArea(\'' + v + '\')">' + app.ic(ico) + txt + '</a>';
  }
  function nAnc(v, id, txt) {
    return '<a class="nv nv-3" data-v="' + v + '" onclick="goAnchor(\'' + v + '\',\'' + id + '\')">' + txt + '</a>';
  }
  function n2(v, e, dot, txt) {
    return '<a class="nv nv-2" data-v="' + v + '" data-e="' + e + '" onclick="goPane(\'' + v + '\',\'' + e + '\')"><span class="dotc" style="background:' + dot + '"></span>' + txt + '</a>';
  }
  function n3(v, e, p, txt) {
    return '<a class="nv nv-3" data-v="' + v + '" data-e="' + e + '" data-p="' + p + '" onclick="goPane(\'' + v + '\',\'' + e + '\',\'' + p + '\')">' + txt + '</a>';
  }
  var h = n1('concursos', 'i36', 'Concursos') + nAnc('concursos', 'meus-concursos', 'Meus concursos') + (app.oculto('fontes') ? '' : nAnc('concursos', 'novos-concursos', 'Onde encontrar novos')) + '<button class="nv nv-2" data-ibge-action="calendar">' + app.ic('i11') + 'Cronograma IBGE</button>' + n1('estudo', 'i2', 'Estudos') + n2('estudo', 'pn', 'var(--blue)', 'Painel de preparação');
  app.pnVisiveis().forEach(function (s) {
    h += n3('estudo', 'pn', s.p, s.full);
  });
  app.CC().forEach(function (c) {
    h += n2('estudo', c.id, app.corVar(c.cor), app.tx(app.nomeCurto(c)));
    app.secsDe(c).forEach(function (s) {
      h += n3('estudo', c.id, s.k, app.SECINFO[s.k].full);
    });
  });
  if (!app.oculto('comparar')) {
    h += n1('comparar', 'i18', 'Comparar');
    app.CMPSECS.forEach(function (s) {
      h += n3('comparar', 'cmp', s.p, s.full);
    });
  }
  el.innerHTML = h;
};
/* quais seções o concurso tem (só as preenchidas aparecem) */
app.secsDe = function (c) {
  var s = [];
  if (c.raiox && ((c.raiox.linhas || []).length || (c.raiox.bar || []).length)) s.push({
    k: 'raiox'
  });
  if ((c.blocos || []).length) s.push({
    k: 'conteudo'
  });
  if ((c.etapas || []).length) s.push({
    k: 'provas'
  });
  if ((c.cronograma || []).length) s.push({
    k: 'cronograma'
  });
  if ((c.atribuicoes || []).length || c.requisito) s.push({
    k: 'atribuicoes'
  });
  if ((c.links || []).length) s.push({
    k: 'links'
  });
  s.push({
    k: 'notas'
  });
  return s;
};
/* ---------- diretório de fontes ---------- */
app.dominio = function (u) {
  try {
    return String(u).replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
  } catch (e) {
    return '';
  }
};
app.renderFontes = function () {
  var el = document.getElementById('fontes-list');
  if (!el) return;
  var h = '';
  (app.DADOS.fontes || []).forEach(function (g) {
    var cor = app.corVar(g.cor || 'primary');
    h += '<div class="card src-group"><div class="sg-head"><div class="sg-ic" style="background:color-mix(in srgb,' + cor + ' 16%,transparent);color:' + cor + '">' + app.ic(g.ic || 'i14') + '</div>' + '<div><h4>' + app.tx(g.n) + '</h4><p>' + app.tx(g.sub || '') + '</p></div></div><div class="src-list">';
    (g.itens || []).forEach(function (it) {
      h += '<a class="src-item" href="' + app.href(it.u) + '" target="_blank" rel="noopener"><div class="si-txt"><b>' + app.tx(it.b) + '</b><span>' + app.tx(it.s || app.dominio(it.u)) + '</span></div><span class="ext">' + app.ic('i5') + '</span></a>';
    });
    h += '</div></div>';
  });
  el.innerHTML = h || '<div class="pn-empty">Nenhuma fonte cadastrada — use <b>Editar fontes e grupos</b> logo abaixo para montar o seu diretório.</div>';
};
/* ---------- documentos do painel ---------- */
app.renderDocs = function () {
  var el = document.getElementById('pn-docs');
  if (!el) return;
  var h = '';
  (app.DADOS.docs || []).forEach(function (d) {
    h += '<a class="pn-doc" href="' + app.href(d.u) + '" target="_blank" rel="noopener">' + app.ic(d.ic || 'i15') + app.tx(d.n) + '</a>';
  });
  h += '<button class="pn-doc pn-doc-ed" onclick="edDocs()">' + app.ic('i28') + ((app.DADOS.docs || []).length ? 'Editar documentos' : 'Adicionar um documento seu') + '</button>';
  el.innerHTML = h;
};
/* ---------- ordem e arquivamento dos concursos ---------- */
app.ccMover = function (id, dir) {
  var a = app.CCT(),
    i = -1,
    k;
  for (k = 0; k < a.length; k++) if (a[k].id === id) i = k;
  if (i < 0) return;
  var j = i + dir;
  while (j >= 0 && j < a.length && a[j].arquivado) j += dir;
  if (j < 0 || j >= a.length) return;
  var t = a[i];
  a[i] = a[j];
  a[j] = t;
  app.DADOS.updatedAt = new Date().toISOString();
  app.saveS();
  app.renderTudo();
};
app.arqToggle = function (id) {
  var c = app.cById(id);
  if (!c) return;
  if (!c.arquivado && !confirm('Arquivar “' + (c.curto || c.titulo) + '”?\n\nEle sai dos cartões, da área de estudos e da comparação, mas continua guardado — dá para restaurar quando quiser, com todo o progresso.')) return;
  c.arquivado = !c.arquivado;
  app.DADOS.updatedAt = new Date().toISOString();
  app.saveS();
  app.renderTudo();
};
app.renderArquivados = function () {
  var el = document.getElementById('arq-box');
  if (!el) return;
  var arq = app.CCA();
  if (!arq.length) {
    el.hidden = true;
    el.innerHTML = '';
    return;
  }
  el.hidden = false;
  var h = '<div class="area-sep"><span class="ln"></span><span class="tx">' + app.ic('i34') + 'Arquivados (' + arq.length + ')</span><span class="ln"></span></div><div class="grid">';
  arq.forEach(function (c) {
    var cor = app.corVar(c.cor);
    h += '<article class="card cc arq" style="--ac:' + cor + '"><div class="cc-main"><div class="cc-heading"><span class="contest-symbol" aria-hidden="true">' + app.ic('i34') + '</span><div><div class="cc-kicker">Arquivado</div><h4>' + app.tx(c.titulo) + '</h4></div></div><p class="role">' + app.tx(c.cargo || '') + (c.prova ? ' · prova em ' + app.brDate(c.prova) : '') + '</p></div><div class="cc-cta"><button class="btn ghost sm" onclick="arqToggle(\'' + c.id + '\')">' + app.ic('i20') + 'Restaurar</button><button class="btn ghost sm" onclick="edRemover(\'' + c.id + '\')">' + app.ic('i29') + 'Apagar de vez</button></div></article>';
  });
  el.innerHTML = h + '</div>';
};
app.notaSet = function (id, v) {
  var c = app.cById(id);
  if (!c) return;
  c.notas = v;
  var st = document.getElementById('nota-st-' + id);
  if (st) st.textContent = 'digitando…';
  if (app.notaTimer) clearTimeout(app.notaTimer);
  app.notaTimer = setTimeout(function () {
    app.notaTimer = null;
    app.DADOS.updatedAt = new Date().toISOString();
    app.saveS();
    if (st) st.textContent = 'Anotações salvas neste aparelho' + (app.syncState === 'on' ? ' — sincronização agendada.' : '.');
  }, 700);
};
/* =====================================================================
   ABA 1 — CARTÕES DOS CONCURSOS
   ===================================================================== */
app.nota = function (txt) {
  return txt ? '<div class="note">' + app.ic('i9') + '<span>' + app.fmt(txt) + '</span></div>' : '';
};

app.urgencia = function (d) {
  return d <= 7 ? 'u1' : d <= 30 ? 'u2' : 'u3';
};
/* ---------- prazo de inscrição ----------
   Só interessa em concurso que ela ainda NÃO se inscreveu: enquanto a
   inscrição não está feita, o prazo que manda é o da inscrição, não o da
   prova. Depois de inscrita, o aviso some — já cumpriu o papel.
   A data vem do campo próprio (inscAte) ou, se ele estiver vazio, da
   linha do cronograma que fala de inscrição — assim as fichas que já
   existem funcionam sem ninguém precisar preencher nada. */
app.inscFim = function (c) {
  if (!c) return '';
  if (c.inscAte) return c.inscAte;
  var achou = '';
  (c.cronograma || []).forEach(function (l) {
    if (achou) return;
    if (/inscri/i.test(String(l.label || ''))) {const date=l.end||l.d||'';if(/^\d{4}-\d{2}-\d{2}$/.test(date))achou=date;}
  });
  return achou;
};
/* prazo de inscrição aperta mais rápido que prova: escala mais curta */
app.urgenciaInsc = function (d) {
  return d <= 3 ? 'rose' : d <= 10 ? 'amber' : 'teal';
};
app.chipInscricao = function (c, curto) {
  if (!c || c.inscrita) return '';
  var f = app.inscFim(c);
  if (!f) return '';
  var d = app.dto(f);
  if (d < 0) return '<span class="chip">Inscrições encerradas</span>';
  var cor = app.urgenciaInsc(d);
  var txt = d === 0 ? 'Inscrição <b>fecha hoje</b>' : d === 1 ? 'Inscrição <b>fecha amanhã</b>' : curto ? 'Inscrição: <b>' + d + '</b> dias' : 'Faltam <b>' + d + '</b> dias para se inscrever';
  return '<span class="chip ' + cor + '"><span class="dot"></span>' + txt + '</span>';
};

app.renderContagem = function () {
  var f = app.futuros(),
    el = document.getElementById('hero-cd');
  var insc = app.CC().filter(function (c) {
      return c.inscrita;
    }).length,
    olho = app.CC().length - insc;
  var sub = '<span class="cd-sub"><b>' + insc + '</b> concurso' + (insc === 1 ? '' : 's') + ' com inscrição feita' + (olho ? ' · <b>' + olho + '</b> só de olho' : '') + '</span>';
  if (el) {
    if (!f.length) {
      el.innerHTML = '<div class="cd u3"><span class="cd-lbl">Próxima prova</span><div class="cd-n hoje"><b>—</b></div>' + '<span class="cd-c">' + (app.CC().length ? 'Falta cadastrar a data da prova' : 'Nenhum concurso cadastrado ainda') + '</span>' + sub + '</div>';
    } else {
      var c = f[0],
        d = app.dto(c.prova),
        u = app.urgencia(d);
      var n = d === 0 ? '<b>Hoje</b>' : d === 1 ? '<b>1</b><span>dia</span>' : '<b>' + d + '</b><span>dias</span>';
      el.innerHTML = '<div class="cd ' + u + '"><span class="cd-lbl">Próxima prova</span>' + '<div class="cd-n' + (d === 0 ? ' hoje' : '') + '">' + n + '</div>' + '<span class="cd-c">' + app.tx(app.nomeCurto(c)) + ' · ' + app.brDate(c.prova) + '</span>' + sub + '</div>';
    }
  }
  var b = document.getElementById('brandSub');
  if (b) {
    if (!f.length) {
      b.className = '';
      b.textContent = 'Preparação para concursos públicos';
    } else {
      var c2 = f[0],
        d2 = app.dto(c2.prova);
      b.className = 'bsub-cd ' + app.urgencia(d2);
      b.innerHTML = app.tx(app.nomeCurto(c2)) + (d2 === 0 ? ': <b>a prova é hoje</b>' : d2 === 1 ? ': <b>1</b> dia para a prova' : ': <b>' + d2 + '</b> dias para a prova');
    }
  }
};
/* =====================================================================
   ABA 2 — ÁREA DE CADA CONCURSO
   ===================================================================== */
app.renderTimeline = function (elId, items) {
  var now = new Date();
  now.setHours(0, 0, 0, 0);
  var tl = document.getElementById(elId);
  if (!tl) return;
  var nextFound = false,
    html = '';
  (items || []).forEach(function (item) {
    var end = new Date((item.end || '2099-01-01') + 'T00:00:00');
    var isPast = end < now,
      cls = [],
      tag = '';
    if (isPast) cls.push('past');
    if (item.exam) {
      cls.push('exam');
      tag = isPast ? '<span class="tl-tag done">Realizada ✓</span>' : '<span class="tl-tag exam">Prova</span>';
    }
    if (!isPast && !nextFound) {
      cls.push('next');
      nextFound = true;
      tag = item.exam ? '<span class="tl-tag exam">Próxima · Prova</span>' : '<span class="tl-tag next">Próxima</span>';
    }
    html += '<div class="tl-item ' + cls.join(' ') + '"><div class="tl-date">' + app.tx(item.d) + tag + '</div><div class="tl-label">' + app.tx(item.label) + '</div></div>';
  });
  tl.innerHTML = html;
};
app.secHead = function (k, icone, titulo, sub) {
  return '<h3 class="bt"><span class="bic">' + app.ic(icone) + '</span>' + titulo + '</h3>' + (sub ? '<p class="bsub">' + app.fmt(sub) + '</p>' : '');
};
app.renderAccs = function () {
  var el = document.getElementById('acc-list');
  if (!el) return;
  var abertos = {};
  [].forEach.call(el.querySelectorAll('.acc.open'), function (a) {
    abertos[a.id.replace('acc-', '')] = 1;
  });
  var h = '';
  app.CC().forEach(function (c) {
    var cor = app.corVar(c.cor),
      secs = app.secsDe(c),
      d = c.prova ? app.dto(c.prova) : null;
    h += '<div class="card acc" id="acc-' + c.id + '" style="--ac:' + cor + ';border-top:2px solid color-mix(in srgb,' + cor + ' 55%,var(--border))">' + '<button class="acc-head" style="--ac:' + cor + '" aria-expanded="false" aria-controls="body-' + c.id + '" onclick="toggleConcurso(\'' + c.id + '\')">' + '<span class="acc-badge" style="background:color-mix(in srgb,' + cor + ' 16%,transparent);color:' + cor + '">' + app.tx(c.badge || app.nomeCurto(c)).replace(/\n/g, '<br/>') + '</span>' + '<span class="acc-titles"><h3>' + app.tx(c.nome || c.titulo) + '</h3><span class="role">' + app.tx(c.sub || '') + '</span><span class="acc-meta">' + (c.inscrita ? '<span class="chip green"><span class="dot"></span>Inscrição feita</span>' : '<span class="chip">Só de olho</span>') + app.chipInscricao(c, false) + (d === null ? '' : d > 0 ? '<span class="chip teal"><span class="dot"></span>Prova em <b>' + d + '</b> dias</span>' : d === 0 ? '<span class="chip teal"><span class="dot"></span>A prova <b>é hoje</b></span>' : '<span class="chip">Prova realizada</span>') + (c.prova ? '<span class="chip">' + app.brDate(c.prova) + '</span>' : '') + (c.nivel ? '<span class="chip">Nível ' + app.tx(c.nivel).toLowerCase() + '</span>' : '') + '</span></span><span class="acc-chev" aria-hidden="true">' + app.ic('i8') + '</span></button>' + '<div class="acc-body" id="body-' + c.id + '" role="region" aria-label="Conteúdo do concurso ' + app.ea(app.nomeCurto(c)) + '">' + (secs.length <= 1 ? '<div class="pn-empty" style="margin-top:14px">Este concurso ainda está vazio. Toque no <b>lápis</b> para preencher onde focar, conteúdo programático, etapas, cronograma, atribuições e links — cada parte que você preencher vira uma aba aqui.</div>' : '') + '<div class="pnav-row">' + app.pnavHtml(c.id, secs.map(function (s) {
      var si = app.SECINFO[s.k];
      return {
        p: s.k,
        n: si.n,
        i: si.i,
        c: si.c
      };
    })) + '<div class="acc-tools">' + '<button class="mini-btn up" onclick="ccMover(\'' + c.id + '\',-1)" title="Subir este concurso" aria-label="Subir este concurso">' + app.ic('i8') + '</button>' + '<button class="mini-btn" onclick="ccMover(\'' + c.id + '\',1)" title="Descer este concurso" aria-label="Descer este concurso">' + app.ic('i8') + '</button>' + '<button class="mini-btn" onclick="arqToggle(\'' + c.id + '\')" title="Arquivar este concurso" aria-label="Arquivar este concurso">' + app.ic('i34') + '</button>' + '<button class="mini-btn" onclick="edEditar(\'' + c.id + '\')" title="Editar este concurso" aria-label="Editar este concurso">' + app.ic('i28') + '</button>' + '<button class="mini-btn" onclick="edRemover(\'' + c.id + '\')" title="Remover este concurso" aria-label="Remover este concurso">' + app.ic('i29') + '</button>' + '</div></div>';
    /* --- ONDE FOCAR (peso de cada matéria) --- */
    if (secs.some(function (s) {
      return s.k === 'raiox';
    })) {
      var rx = c.raiox || {};
      h += '<div class="pane" data-e="' + c.id + '" data-p="raiox" role="tabpanel" hidden>' + '<div class="sec" id="' + c.id + '-raiox">' + app.secHead('raiox', 'i23', 'Onde focar — o peso de cada matéria', rx.sub || '');
      if ((rx.leg || []).length) {
        h += '<div class="rx-leg">';
        rx.leg.forEach(function (l) {
          h += '<span><i style="background:' + app.ea(l.c) + '"></i>' + app.tx(l.t) + '</span>';
        });
        h += '</div>';
      }
      if ((rx.bar || []).length) {
        h += '<div class="rx-bar" aria-hidden="true">';
        rx.bar.forEach(function (b) {
          h += '<i style="width:' + app.ea(b.w) + ';background:' + app.ea(b.c) + '">' + app.tx(b.t) + '</i>';
        });
        h += '</div>';
      }
      if ((rx.linhas || []).length) {
        h += '<div class="rx">';
        rx.linhas.forEach(function (l) {
          var p = l.p || 3,
            pn = p === 1 ? 'Máxima' : p === 2 ? 'Alta' : 'Média';
          h += '<div class="rx-r"><div class="rx-m"><b>' + app.tx(l.b) + '</b><span>' + app.tx(l.s) + '</span></div><div class="rx-n">' + app.tx(l.n) + '</div><span class="pr pr' + p + '">' + pn + '</span></div>';
        });
        h += '</div>';
      }
      h += app.nota(rx.nota) + '</div></div>';
    }
    /* --- CONTEÚDO --- */
    if (secs.some(function (s) {
      return s.k === 'conteudo';
    })) {
      h += '<div class="pane" data-e="' + c.id + '" data-p="conteudo" role="tabpanel" hidden>' + '<div class="sec" id="' + c.id + '-conteudo">' + app.secHead('conteudo', 'i0', 'Conteúdo programático', c.conteudoSub || '');
      (c.blocos || []).forEach(function (b) {
        if (b.label) h += '<div class="blk-label"><span>' + app.tx(b.label) + '</span><span class="ln"></span>' + (b.peso ? '<span class="wt">' + app.tx(b.peso) + '</span>' : '') + '</div>';
        if (b.nota) h += '<p class="bsub" style="margin-left:0">' + app.fmt(b.nota) + '</p>';
        (b.itens || []).forEach(function (it) {
          h += '<div class="disc"><div class="disc-h"><div class="disc-n">' + app.tx(it.n) + '</div><h5>' + app.tx(it.h) + '</h5>' + (it.chip ? '<span class="chip teal">' + app.tx(it.chip) + '</span>' : '') + '</div>' + '<div class="mtls">' + app.mtlHtml(it.mid) + '</div><div class="disc-body">';
          (it.prosa || []).forEach(function (p) {
            h += '<p>' + app.fmt(p) + '</p>';
          });
          if ((it.topicos || []).length) {
            h += '<div class="topic-flow">';
            it.topicos.forEach(function (t) {
              h += '<span class="topic">' + app.tx(t) + '</span>';
            });
            h += '</div>';
          }
          h += '</div></div>';
        });
      });
      h += app.nota(c.conteudoNota) + '</div></div>';
    }
    /* --- ETAPAS --- */
    if (secs.some(function (s) {
      return s.k === 'provas';
    })) {
      h += '<div class="pane" data-e="' + c.id + '" data-p="provas" role="tabpanel" hidden>' + '<div class="sec" id="' + c.id + '-provas">' + app.secHead('provas', 'i10', 'Etapas e provas', c.etapasSub || '') + '<div class="etapas">';
      (c.etapas || []).forEach(function (e) {
        h += '<div class="etapa"><div class="en">' + app.tx(e.en) + '</div><h5>' + app.tx(e.h) + '</h5><p>' + app.tx(e.p) + '</p>';
        if ((e.tags || []).length) {
          h += '<div class="pts">';
          e.tags.forEach(function (t) {
            h += '<span class="chip' + (t.c ? ' ' + app.ea(t.c) : '') + '">' + app.tx(t.t) + '</span>';
          });
          h += '</div>';
        }
        h += '</div>';
      });
      h += '</div>' + app.nota(c.etapasNota) + '</div></div>';
    }
    /* --- CRONOGRAMA --- */
    if (secs.some(function (s) {
      return s.k === 'cronograma';
    })) {
      h += '<div class="pane" data-e="' + c.id + '" data-p="cronograma" role="tabpanel" hidden>' + '<div class="sec" id="' + c.id + '-cronograma">' + app.secHead('cronograma', 'i11', 'Cronograma do concurso', c.cronogramaSub || '') + '<div class="tl" id="tl-' + c.id + '"></div></div></div>';
    }
    /* --- ATRIBUIÇÕES --- */
    if (secs.some(function (s) {
      return s.k === 'atribuicoes';
    })) {
      h += '<div class="pane" data-e="' + c.id + '" data-p="atribuicoes" role="tabpanel" hidden>' + '<div class="sec" id="' + c.id + '-atribuicoes">' + app.secHead('atribuicoes', 'i12', 'Atribuições do cargo', c.atribSub || '');
      if ((c.atribuicoes || []).length) {
        h += '<div class="attr-list">';
        c.atribuicoes.forEach(function (a) {
          h += '<div class="attr"><span class="mk">' + app.ic('i12') + '</span><span>' + app.tx(a) + '</span></div>';
        });
        h += '</div>';
      }
      if (c.requisito) h += '<div class="req-box"><h5>Requisito para assumir o cargo</h5><p>' + app.tx(c.requisito) + '</p></div>';
      h += app.nota(c.atribNota) + '</div></div>';
    }
    /* --- LINKS --- */
    if (secs.some(function (s) {
      return s.k === 'links';
    })) {
      h += '<div class="pane" data-e="' + c.id + '" data-p="links" role="tabpanel" hidden>' + '<div class="sec" id="' + c.id + '-links">' + app.secHead('links', 'i13', 'Links do edital e do concurso', c.linksSub || '') + '<div class="lk-grid">';
      (c.links || []).forEach(function (l) {
        h += '<a class="lk" href="' + app.href(l.u) + '" target="_blank" rel="noopener"><div class="lk-ic">' + app.ic(l.ic || 'i14') + '</div><div class="lk-t"><b>' + app.tx(l.b) + '</b><span>' + app.tx(l.s || '') + '</span></div></a>';
      });
      h += '</div></div></div>';
    }
    /* --- NOTAS --- */
    h += '<div class="pane" data-e="' + c.id + '" data-p="notas" role="tabpanel" hidden>' + '<div class="sec" id="' + c.id + '-notas">' + app.secHead('notas', 'i17', 'Minhas anotações', 'O que a banca costuma cobrar, o que falta providenciar, ideias para a discursiva — o que for seu sobre este concurso. Salva sozinho enquanto você digita e vai junto na sincronização.') + '<textarea class="notas" oninput="notaSet(\'' + c.id + '\',this.value)" placeholder="Escreva aqui…">' + app.tx(c.notas || '') + '</textarea>' + '<p class="hint" id="nota-st-' + c.id + '"></p></div></div>';
    /* --- FICHA --- */
    if ((c.ficha || []).length) {
      h += '<div class="ficha-sec"><div class="ficha-h">' + app.ic('i17') + 'Ficha do cargo</div><div class="ficha">';
      c.ficha.forEach(function (f) {
        h += '<div class="ficha-i"><span class="fl">' + app.tx(f.l) + '</span><span class="fv">' + app.fmt1(f.v) + (f.s ? ' <small>' + app.fmt1(f.s) + '</small>' : '') + '</span></div>';
      });
      h += '</div></div>';
    }
    h += '</div></div>';
  });
  el.innerHTML = h || '<div class="pn-empty">Nenhum concurso cadastrado. Use o botão abaixo para criar o primeiro — depois é só preencher.</div>';
  app.CC().forEach(function (c) {
    if ((c.cronograma || []).length) app.renderTimeline('tl-' + c.id, c.cronograma);
    var s = app.secsDe(c);
    if (s.length) app.paneInit(c.id, s[0].k);
    if (abertos[c.id]) app.toggleConcurso(c.id);
  });
};
/* abas do painel de preparação, com contadores do dia */
app.pnBadges = function () {
  var due = typeof app.revDue === 'function' ? app.revDue().length : 0;
  var fdue = typeof app.fcDueList === 'function' ? app.fcDueList(null).length : 0;
  var fk = typeof app.cicloKey === 'function' ? app.cicloKey() : null,
    rest = 0;
  if (fk && app.CICLOS[fk]) {
    var st = app.S.cy && app.S.cy[fk] || {
      done: {}
    };
    app.CICLOS[fk].b.forEach(function (_, i) {
      if (!(st.done || {})[i]) rest++;
    });
  }
  var m = {
    hoje: due,
    flash: fdue,
    ciclo: rest
  };
  [].forEach.call(document.querySelectorAll('.pnav-b[data-e="pn"]'), function (b) {
    var p = b.getAttribute('data-p'),
      ct = b.querySelector('.ct'),
      v = m[p];
    if (v == null) return;
    if (v > 0) {
      if (!ct) {
        ct = document.createElement('span');
        ct.className = 'ct';
        b.appendChild(ct);
      }
      ct.textContent = v;
    } else if (ct) ct.parentNode.removeChild(ct);
  });
};
app.renderPnNav = function () {
  var el = document.getElementById('pn-nav');
  if (!el) return;
  var vis = app.pnVisiveis(),
    chave = vis.map(function (s) {
      return s.p;
    }).join(',');
  /* refaz a fita quando ela ainda não existe OU quando o conjunto visível
     mudou nas Configurações — fora isso continua idempotente */
  if (!el.querySelector('.pnav-b') || el.getAttribute('data-set') !== chave) {
    el.outerHTML = app.pnavHtml('pn', vis.map(function (s) {
      return {
        p: s.p,
        n: s.n,
        i: s.i,
        c: s.c
      };
    })).replace('<div class="pnav" data-e="pn"', '<div class="pnav" data-e="pn" id="pn-nav" data-set="' + app.ea(chave) + '" aria-label="Seções do painel"');
    /* o painel escondido sai da tela; se era o aberto, abre o primeiro que restou */
    app.PNSECS.forEach(function (s) {
      var pane = document.querySelector('.pane[data-e="pn"][data-p="' + s.p + '"]');
      if (pane && app.oculto(s.p)) pane.hidden = true;
    });
    var atual = app.paneAtual('pn');
    if (vis.length) app.paneInit('pn', atual && !app.oculto(atual) ? atual : vis[0].p);
  }
  app.pnBadges();
};
/* mostra ou esconde os blocos que não são abas do painel */
app.aplicarOcultos = function () {
  var f = document.getElementById('bloco-fontes');
  if (f) f.hidden = app.oculto('fontes');
  var d = document.getElementById('pn-docs');
  if (d) d.hidden = app.oculto('docs');
  var tb = document.getElementById('tab-comparar');
  if (tb) tb.hidden = app.oculto('comparar');
  if (app.oculto('comparar')) {
    var v = document.getElementById('view-comparar');
    if (v && v.classList.contains('active')) app.showView('concursos');
  }
};
/* =====================================================================
   ABA 3 — COMPARAR (tudo derivado dos dados)
   ===================================================================== */
app.rotuloMat = function (c, mid) {
  var r = null;
  (c.blocos || []).forEach(function (b) {
    (b.itens || []).forEach(function (it) {
      if (it.mid !== mid || r) return;
      if (it.chip) {
        r = it.chip;
        return;
      }
      var lb = String(b.label || '');
      if (/specífic/i.test(lb)) r = 'Específico';else if (/ásic/i.test(lb)) r = 'Básicos';
    });
  });
  return r || 'Cai';
};
app.renderComparar = function () {
  var navEl = document.getElementById('cmp-nav');
  if (navEl) {
    navEl.outerHTML = app.pnavHtml('cmp', app.CMPSECS).replace('<div class="pnav" data-e="cmp"', '<div class="pnav" data-e="cmp" id="cmp-nav" aria-label="Seções da comparação"');
    app.paneInit('cmp', 'formato');
  }
  var lista = app.CC(),
    elF = document.getElementById('cmp-formato-list');
  if (elF) {
    var h = '';
    lista.forEach(function (c) {
      var cor = app.corVar(c.cor);
      h += '<div class="card uniq" style="--dk:' + cor + '"><div class="uniq-h"><span class="ub">' + app.tx(app.nomeCurto(c)) + '</span><span class="c">' + app.tx((c.banca ? 'banca ' + c.banca : '') + (c.nivel ? ' · nível ' + String(c.nivel).toLowerCase() : '')) + '</span></div>' + '<p style="font-size:.86rem;color:var(--muted)">' + (app.fmt(c.formato) || 'Formato ainda não preenchido — abra <b>Editar</b> neste concurso para descrever como é a prova.') + '</p></div>';
    });
    elF.innerHTML = h || '<div class="pn-empty">Cadastre concursos para comparar as provas.</div>';
  }
  var mats = app.MT().map(function (m) {
    return {
      m: m,
      cs: app.matDe(m.id)
    };
  }).filter(function (x) {
    return x.cs.length;
  });
  mats.sort(function (a, b) {
    return b.cs.length - a.cs.length;
  });
  var elM = document.getElementById('cmp-matriz-box');
  if (elM) {
    if (!lista.length || !mats.length) {
      elM.innerHTML = '<div class="pn-empty" style="margin:12px">Sem matérias cadastradas ainda.</div>';
    } else {
      var t = '<table class="cmp-table"><thead><tr><th>Matéria</th>';
      lista.forEach(function (c) {
        t += '<th class="ccol" style="color:' + app.corVar(c.cor) + '">' + app.tx(app.nomeCurto(c)) + '</th>';
      });
      t += '</tr></thead><tbody>';
      mats.forEach(function (x) {
        var comum = x.cs.length > 1;
        t += '<tr class="cmp-row' + (comum ? ' comum' : '') + '"><td class="subj">' + app.tx(x.m.n) + (comum ? '<span class="cm-pill">Comum</span>' : '') + '<small>' + app.tx((x.m.t || []).slice(0, 3).map(app.topName).join(' · ')) + '</small></td>';
        lista.forEach(function (c) {
          t += '<td class="cell">' + (x.cs.indexOf(c.id) > -1 ? '<span class="mk-yes" style="--dk:' + app.corVar(c.cor) + '">' + app.tx(app.rotuloMat(c, x.m.id)) + '</span>' : '<span class="mk-no">—</span>') + '</td>';
        });
        t += '</tr>';
      });
      elM.innerHTML = t + '</tbody></table>';
    }
  }
  var elC = document.getElementById('cmp-comum-list');
  if (elC) {
    var comuns = mats.filter(function (x) {
        return x.cs.length > 1;
      }),
      h2 = '';
    comuns.forEach(function (x) {
      var prog = 0;
      (x.m.t || []).forEach(function (_, i) {
        var st = app.S.t[x.m.id + ':' + i] || {};
        if (st.e) prog++;
      });
      h2 += '<div class="card shared"><div class="shared-h"><div class="shared-ic">' + app.ic('i0') + '</div>' + '<div class="st"><h4>' + app.tx(x.m.n) + '</h4><p>Cai em ' + x.cs.length + ' dos seus concursos — cada hora de estudo rende em todos</p></div><div class="stags">';
      x.cs.forEach(function (cid) {
        var c = app.cById(cid);
        h2 += '<span class="chip" style="color:' + app.corVar(c.cor) + ';background:color-mix(in srgb,' + app.corVar(c.cor) + ' 15%,transparent);border-color:transparent">' + app.tx(app.nomeCurto(c)) + '</span>';
      });
      if (prog) h2 += '<span class="chip green">Lista: ' + prog + '/' + (x.m.t || []).length + ' estudados</span>';
      h2 += '</div></div><div class="shared-body"><div class="lbl">Tópicos que servem para todos</div><div class="topic-flow">';
      (x.m.t || []).forEach(function (t) {
        h2 += '<span class="topic">' + app.tx(app.topName(t)) + '</span>';
      });
      h2 += '</div>';
      var mh = app.mtlHtml(x.m.id);
      if (mh) h2 += '<div class="mtls-row" style="margin-top:12px">' + mh + '</div>';
      h2 += '</div></div>';
    });
    elC.innerHTML = h2 || '<div class="pn-empty">Nenhuma matéria se repete entre os concursos cadastrados — por enquanto, cada um tem conteúdo próprio.</div>';
  }
  var elU = document.getElementById('cmp-exclusivo-list');
  if (elU) {
    var h3 = '';
    lista.forEach(function (c) {
      var ex = mats.filter(function (x) {
        return x.cs.length === 1 && x.cs[0] === c.id;
      });
      h3 += '<div class="card uniq" style="--dk:' + app.corVar(c.cor) + '"><div class="uniq-h"><span class="ub">' + app.tx(app.nomeCurto(c)) + '</span><span class="c">exclusivo · ' + ex.length + ' matéria' + (ex.length === 1 ? '' : 's') + '</span></div>';
      if (!ex.length) h3 += '<div class="uniq-item"><span>Nada exclusivo — todas as matérias deste concurso caem também em outro.</span></div>';
      ex.forEach(function (x) {
        h3 += '<div class="uniq-item"><b>' + app.tx(x.m.n) + '</b><span>' + app.tx((x.m.t || []).slice(0, 4).map(app.topName).join(', ')) + '</span></div>';
      });
      h3 += '</div>';
    });
    elU.innerHTML = h3 || '<div class="pn-empty">Cadastre concursos para ver o conteúdo exclusivo de cada um.</div>';
  }
};
/* filtros do checklist */
app.renderFiltros = function () {
  var el = document.getElementById('pn-filtros');
  if (!el) return;
  /* o filtro pode apontar para um concurso arquivado ou removido */
  if (app.fltr !== 'all' && app.fltr !== 'comum' && !app.CC().some(function (c) {
    return c.id === app.fltr;
  })) app.fltr = 'all';
  if (app.fltr === 'comum' && app.CC().length < 2) app.fltr = 'all';
  var h = '<button class="fbtn" aria-pressed="' + (app.fltr === 'all') + '" onclick="setFiltro(\'all\',this)">Tudo</button>';
  if (app.CC().length > 1) h += '<button class="fbtn" aria-pressed="' + (app.fltr === 'comum') + '" onclick="setFiltro(\'comum\',this)">Comum</button>';
  app.CC().forEach(function (c) {
    h += '<button class="fbtn" aria-pressed="' + (app.fltr === c.id) + '" onclick="setFiltro(\'' + c.id + '\',this)">' + app.tx(app.nomeCurto(c)) + '</button>';
  });
  el.innerHTML = h;
};
/* Onde o botão entra é o que decide o alinhamento.
   Pendurado direto no título (que é flex, align-items:center) ele fica
   centralizado na CAIXA DA LINHA — e essa caixa desce bem abaixo da base
   das letras para caber os descendentes, então o ícone aparece uns 5px
   baixo demais. A correção é pô-lo no MESMO fluxo de texto do título,
   dentro de um <span>, onde vertical-align:middle alinha o centro do
   ícone com o meio das letras minúsculas. Isso independe da fonte. */
app.explColocar = function (cab, botao) {
  var cx = cab.querySelector('.btx');
  if (!cx) {
    cx = document.createElement('span');
    cx.className = 'btx';
    var nos = [].slice.call(cab.childNodes);
    nos.forEach(function (n) {
      /* o ícone decorativo do título continua sendo item flex, fora do span */
      if (n.nodeType === 1 && (n.tagName === 'SVG' || n.tagName === 'svg' || String(n.className.baseVal || n.className).indexOf('bic') > -1)) return;
      cx.appendChild(n);
    });
    cab.appendChild(cx);
  }
  cx.appendChild(document.createTextNode(' '));
  cx.appendChild(botao);
};
/* ---------- explicações a um toque ----------
   Cada aba do painel trazia um parágrafo fixo explicando o método. São
   ~95px de tela, toda vez, para um texto que se lê uma vez e já se sabe.
   Agora o título ganha um botãozinho: o texto continua inteiro no
   arquivo, só aparece quando ela pedir — e a escolha fica lembrada.
   Só mexe nos parágrafos que o app escreveu (título .bt ou .area-intro
   seguido de .bsub/p): nota de bloco e texto da usuária não são tocados. */
app.explPares = function () {
  var r = [],
    vistos = {};
  function juntar(cab, par, id) {
    if (cab && par && !vistos[id]) {
      vistos[id] = 1;
      r.push({
        h: cab,
        p: par,
        id: id
      });
    }
  }
  var pn = document.getElementById('painel');
  if (pn) {
    var hs = pn.querySelectorAll('h3.bt');
    for (var i = 0; i < hs.length; i++) {
      var p = hs[i].nextElementSibling;
      if (p && p.className && p.className.indexOf('bsub') > -1) juntar(hs[i], p, hs[i].parentNode && hs[i].parentNode.id || 'pn-x' + i);
    }
  }
  var ai = document.querySelector('#view-estudo .area-intro');
  if (ai) {
    var h2 = ai.querySelector('h2'),
      p2 = ai.querySelector('p');
    juntar(h2, p2, 'area-estudo');
  }
  return r;
};
app.explInit = function () {
  app.S.ui.expl = app.S.ui.expl || {};
  app.explPares().forEach(function (par) {
    var aberto = !!app.S.ui.expl[par.id];
    if (!par.p.id) par.p.id = 'expl-' + par.id;
    par.p.hidden = !aberto;
    /* chamar de novo (depois de restaurar um backup, por exemplo) só
       re-sincroniza o estado; o botão não é duplicado */
    var ja = par.h.querySelector('.expl-b');
    if (ja) {
      ja.className = 'expl-b' + (aberto ? ' on' : '');
      ja.setAttribute('aria-expanded', aberto ? 'true' : 'false');
      return;
    }
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'expl-b' + (aberto ? ' on' : '');
    b.title = 'Como funciona';
    b.setAttribute('aria-label', 'Como funciona');
    b.setAttribute('aria-expanded', aberto ? 'true' : 'false');
    b.setAttribute('aria-controls', par.p.id);
    b.innerHTML = '<svg viewBox="0 0 24 24"><use href="#i9"/></svg>';
    b.onclick = function () {
      app.explAlterna(par.id, b, par.p);
    };
    app.explColocar(par.h, b);
  });
};
app.explAlterna = function (id, b, p) {
  var abrir = !!p.hidden;
  p.hidden = !abrir;
  b.className = 'expl-b' + (abrir ? ' on' : '');
  b.setAttribute('aria-expanded', abrir ? 'true' : 'false');
  app.S.ui.expl = app.S.ui.expl || {};
  app.S.ui.expl[id] = abrir ? 1 : 0;
  app.salvarUI();
};
/* =====================================================================
   INIT
   ===================================================================== */
app.renderAll = function () {
  app.fase();
  app.stats();
  app.renderRev();
  app.renderFlash();
  app.renderCiclo();
  app.renderCheck();
  app.renderQuiz();
  app.renderPnNav();
};
app.renderTudo = function () {
  app.rebuildMAT();
  app.rebuildCiclos();
  app.renderDrawer();
  app.renderCards();
  app.renderArquivados();
  app.renderFontes();
  app.renderAccs();
  app.renderComparar();
  app.renderFiltros();
  app.renderDocs();
  app.initQuiz();
  app.renderAll();
  app.aplicarOcultos();
  app.renderIbgePlan?.();
  if (typeof app.explInit === 'function') app.explInit();
};
