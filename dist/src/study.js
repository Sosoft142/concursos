import { app } from './state.js';

app.fase = function () {
  var el = document.getElementById('pn-fase');
  if (!el) return;
  var f = app.futuros(),
    todos = app.CC();
  if (!todos.length) {
    el.className = 'pn-fase';
    el.innerHTML = '<b>Nenhum concurso ativo</b><small>Cadastre um na aba Concursos — o painel se monta a partir dele.</small>';
    return;
  }
  if (!f.length) {
    var comData = todos.filter(function (c) {
      return c.prova;
    }).length;
    el.className = 'pn-fase';
    if (!comData) el.innerHTML = '<b>Falta a data da prova</b><small>Abra o concurso no lápis e preencha a data: daí saem a contagem, a fase e o ciclo.</small>';else el.innerHTML = '<b>Provas realizadas!</b><small>Acompanhe gabaritos e resultados nos cronogramas.</small>';
    return;
  }
  var p = f[0],
    d = app.dto(p.prova);
  var resto = f.slice(1).map(function (c) {
    return app.nomeCurto(c) + ' ' + app.faltam(app.dto(c.prova));
  }).join(' · ');
  el.className = 'pn-fase ' + app.urgencia(d);
  el.innerHTML = '<span class="pf-n">' + (d === 0 ? '<b>Hoje</b>' : '<b>' + d + '</b><span>' + (d === 1 ? 'dia' : 'dias') + '</span>') + '</span>' + '<span class="pf-t"><b>Foco: ' + app.tx(app.nomeCurto(p)) + (f.length > 1 ? ' + matérias comuns' : '') + '</b>' + '<small>Prova em ' + app.brDate(p.prova) + '.' + (resto ? ' Depois: ' + app.tx(resto) + '.' : '') + '</small></span>';
};
app.stCount = function (cid) {
  var d = 0,
    tot = 0;
  app.MAT.forEach(function (m) {
    if (cid && m.cs.indexOf(cid) < 0) return;
    m.t.forEach(function (_, i) {
      tot += 3;
      var st = app.S.t[m.id + ':' + i] || {};
      if (st.e) d++;
      if (st.r) d++;
      if (st.q) d++;
    });
  });
  return {
    d: d,
    tot: tot,
    p: tot ? Math.round(100 * d / tot) : 0
  };
};
app.stats = function () {
  var el = document.getElementById('pn-stats');
  if (!el) return;
  var h = '';
  app.CC().forEach(function (c) {
    var s = app.stCount(c.id);
    h += '<div class="pn-stat"><span class="l"><span>' + app.tx(app.nomeCurto(c)) + (c.prova ? ' · ' + app.brDate(c.prova).slice(0, 5) : '') + '</span><span>' + s.p + '%</span></span><span class="pbar"><i style="width:' + s.p + '%;--pc:' + app.corVar(c.cor) + '"></i></span></div>';
  });
  var g = app.qzGeral(),
    alvo = app.MET().alvo || 70;
  h += '<div class="pn-stat ' + (g.f ? app.qzClasse(g.p) : '') + '"><span class="l"><span>Questões (alvo ≥' + alvo + '%)</span><span>' + (g.f ? g.p + '%' : '—') + '</span></span><span class="pbar"><i style="width:' + (g.f ? g.p : 0) + '%"></i></span></div>';
  el.innerHTML = h;
  var sub = document.getElementById('pn-sub');
  if (sub) sub.textContent = app.CC().length > 1 ? 'Um só painel para os ' + app.CC().length + ' concursos — reta final' : 'Seu painel de estudo — reta final';
};
/* ---- revisões espaçadas ---- */
app.revDue = function () {
  var due = [],
    iv = app.MET().revisao || [1, 7],
    i1 = iv[0],
    i2 = iv[1];
  app.MAT.forEach(function (m) {
    m.t.forEach(function (t, i) {
      var k = m.id + ':' + i,
        st = app.S.t[k] || {},
        nm = app.topName(t);
      if (st.e && !st.r && app.dsince(st.e) >= i1) due.push({
        k: k,
        tx: nm,
        m: m.n,
        tp: 'r',
        dias: app.dsince(st.e),
        why: 'estudado há ' + app.dsince(st.e) + 'd — revisão de ' + i1 + (i1 === 1 ? ' dia' : ' dias')
      });else if (st.r && !st.q && app.dsince(st.r) >= i2) due.push({
        k: k,
        tx: nm,
        m: m.n,
        tp: 'q',
        dias: app.dsince(st.r),
        why: 'revisado há ' + app.dsince(st.r) + 'd — feche com questões'
      });
    });
  });
  due.sort(function (a, b) {
    return b.dias - a.dias;
  });
  return due;
};
app.renderRev = function () {
  var el = document.getElementById('rev-list');
  if (!el) return;
  var due = app.revDue(),
    html = '',
    f = app.futuros();
  if (f.length) {
    var d = app.dto(f[0].prova);
    if (d <= 7) html += '<div class="rv rv-final"><div class="rt"><b>Semana final do ' + app.tx(app.nomeCurto(f[0])) + ' — a prova ' + app.faltam(d) + '</b><span class="why">repasse geral do que já estudou para este concurso — priorize o de maior peso</span></div></div>';
  }
  if (!due.length && !html) {
    var iv = app.MET().revisao || [1, 7];
    el.innerHTML = '<div class="pn-empty">Nada vencido por hoje. <span class="oq">Marque tópicos na lista do edital e eles voltam aqui em ' + iv[0] + (iv[0] === 1 ? ' dia' : ' dias') + '.</span></div>';
    return;
  }
  due.slice(0, 10).forEach(function (d) {
    var pk = d.k.split(':');
    html += '<div class="rv"><div class="rt"><b>' + app.tx(d.tx) + '</b><span class="why">' + app.tx(d.m) + ' · ' + d.why + '</span></div><button class="btn ghost sm" onclick="tg(\'' + pk[0] + '\',' + pk[1] + ',\'' + d.tp + '\')">' + (d.tp === 'r' ? 'Revisei ✓' : 'Fiz questões ✓') + '</button></div>';
  });
  if (due.length > 10) html += '<div class="pn-empty">+ ' + (due.length - 10) + ' tópicos vencidos — vá marcando que a lista anda.</div>';
  el.innerHTML = html;
};
/* ---- ciclo de estudos ---- */
app.renderCiclo = function () {
  var el = document.getElementById('ciclo-list');
  if (!el) return;
  var fk = app.cicloKey();
  if (!fk || !app.CICLOS[fk]) {
    el.innerHTML = '<div class="pn-empty">Sem ciclo para montar: cadastre um concurso com data de prova à frente, ou monte o seu ciclo na mão em <b>Editar ciclo</b>.</div>' + app.cicloBtn();
    return;
  }
  app.S.cy[fk] = app.S.cy[fk] || {
    done: {},
    v: 1
  };
  var st = app.S.cy[fk],
    c = app.CICLOS[fk],
    doneN = 0;
  c.b.forEach(function (_, i) {
    if (st.done[i]) doneN++;
  });
  var meta = app.MET().blocosDia || 0,
    feitos = (st.dias || {})[app.hoje()] || 0;
  var html = '<div class="cy-meta"><span class="chip teal">Volta nº ' + st.v + '</span><span class="chip">' + app.tx(c.lbl) + '</span><span>' + doneN + '/' + c.b.length + ' blocos nesta volta</span>' + (meta ? '<span class="cy-goal' + (feitos >= meta ? ' ok' : '') + '">hoje: ' + feitos + '/' + meta + ' blocos</span>' : '') + '</div>';
  if (doneN === c.b.length) html += '<div class="rv rv-final"><div class="rt"><b>Volta ' + st.v + ' completa! 🎉</b><span class="why">recomece a rotação — repetição é o que fixa</span></div><button class="btn primary" onclick="cyNova(\'' + fk + '\')">Começar volta ' + (st.v + 1) + '</button></div>';
  var now = true;
  c.b.forEach(function (b, i) {
    var dn = !!st.done[i],
      cls = 'cy' + (dn ? ' done' : '');
    if (!dn && now && doneN < c.b.length) {
      cls += ' now';
      now = false;
    }
    var min = b.min || app.MET().blocoMin || 45;
    html += '<div class="' + cls + '"><span class="n">' + (i + 1) + '</span><span class="ct"><b>' + app.tx(b.m) + '</b><span class="d">' + app.tx(b.d) + (min ? ' · ' + min + ' min' : '') + '</span></span><button class="btn ghost sm" onclick="cyMark(\'' + fk + '\',' + i + ')">' + (dn ? 'Desfazer' : 'Feito ✓') + '</button></div>';
  });
  el.innerHTML = html + app.cicloBtn();
};
app.cicloBtn = function () {
  return '<button class="btn ghost sm" style="margin-top:12px" onclick="edCiclo()">' + app.ic('i28') + 'Editar ciclo</button>';
};
app.cyMark = function (fk, i) {
  var st = app.S.cy[fk];
  if (!st) return;
  st.dias = st.dias || {};
  var h = app.hoje();
  if (st.done[i]) {
    delete st.done[i];
    st.dias[h] = Math.max(0, (st.dias[h] || 0) - 1);
  } else {
    st.done[i] = 1;
    st.dias[h] = (st.dias[h] || 0) + 1;
  }
  app.saveS();
  app.renderCiclo();
  app.pnBadges();
};
app.cyNova = function (fk) {
  var st = app.S.cy[fk];
  if (!st) return;
  st.done = {};
  st.v++;
  app.saveS();
  app.renderCiclo();
  app.pnBadges();
};
/* ---- checklist verticalizado ---- */
app.setFiltro = function (f, btn) {
  app.fltr = f;
  document.querySelectorAll('#pn-filtros .fbtn').forEach(function (b) {
    b.setAttribute('aria-pressed', 'false');
  });
  if (btn) btn.setAttribute('aria-pressed', 'true');
  app.renderCheck();
};
// Only expanded subjects need topic controls in the DOM. Progress lives in S.t.
function checklistBody(m) {
  const materials = app.mtlHtml(m.id);
  return (materials ? '<div class="mtls-row">' + materials + '</div>' : '') + m.t.map((topic, i) => {
    const state = app.S.t[m.id + ':' + i] || {};
    const url = app.topUrl(topic);
    const buttons = [['e', 'Estudei', 'E'], ['r', 'Revisei', 'R'], ['q', 'Questões', 'Q']].map(([stage, label, short]) =>
      `<button class="sd ${stage}${state[stage] ? ' on' : ''}" data-topic-subject="${app.ea(m.id)}" data-topic-index="${i}" data-topic-stage="${stage}" title="${label}" aria-pressed="${!!state[stage]}"><span class="sd-short">${short}</span><span class="sd-label">${label}</span></button>`
    ).join('');
    return `<div class="ck-t${state.e && state.r && state.q ? ' done' : ''}"><span class="tx">${app.tx(app.topName(topic))}${url ? ` <a href="${app.ea(url)}" target="_blank" rel="noopener" aria-label="abrir material do tópico">${app.ic('i5')}</a>` : ''}</span><span class="stg">${buttons}</span></div>`;
  }).join('');
}
export function handleTopicClick(event) {
  const button = event.target.closest('[data-topic-stage]');
  if (!button) return;
  const {topicSubject, topicIndex, topicStage} = button.dataset;
  if (['e', 'r', 'q'].includes(topicStage)) app.tg(topicSubject, Number(topicIndex), topicStage);
}
if (typeof document !== 'undefined') document.addEventListener('click', handleTopicClick);

app.ckToggle = function (id) {
  app.ckOpen[id] = !app.ckOpen[id];
  const el = document.getElementById('ckm-' + id);
  if (!el) return;
  const subject = app.MAT.find(m => m.id === id);
  const body = el.querySelector('.ck-body');
  if (body) body.innerHTML = app.ckOpen[id] && subject ? checklistBody(subject) : '';
  el.classList.toggle('open', app.ckOpen[id]);
  el.querySelector('.ck-h')?.setAttribute('aria-expanded', String(app.ckOpen[id]));
};
app.renderCheck = function () {
  var el = document.getElementById('check-list');
  if (!el) return;
  var html = '';
  app.MAT.forEach(function (m) {
    if (app.fltr === 'comum' && m.cs.length < 2) return;
    if (app.fltr !== 'all' && app.fltr !== 'comum' && m.cs.indexOf(app.fltr) < 0) return;
    var done = 0,
      stg = 0;
    m.t.forEach(function (_, i) {
      var st = app.S.t[m.id + ':' + i] || {};
      if (st.e) stg++;
      if (st.r) stg++;
      if (st.q) stg++;
      if (st.e && st.r && st.q) done++;
    });
    var pct = m.t.length ? Math.round(100 * stg / (m.t.length * 3)) : 0;
    var dots = '';
    m.cs.forEach(function (cid, k) {
      dots += '<span class="dotc" style="background:' + app.corDe(cid) + (k ? ';margin-left:-4px' : '') + '"></span>';
    });
    if (!dots) dots = '<span class="dotc" style="background:var(--border-strong)"></span>';
    html += '<div class="ck-mat' + (app.ckOpen[m.id] ? ' open' : '') + '" id="ckm-' + m.id + '"><button class="ck-h" onclick="ckToggle(\'' + m.id + '\')" aria-expanded="' + !!app.ckOpen[m.id] + '"><span class="ck-dots">' + dots + '</span><b>' + app.tx(m.n) + '</b><span class="ck-ct">' + done + '/' + m.t.length + '</span><span class="pbar"><i style="width:' + pct + '%;--pc:var(--violet)"></i></span><svg class="chev" viewBox="0 0 24 24"><use href="#i8"/></svg></button><div class="ck-body">' + (app.ckOpen[m.id] ? checklistBody(m) : '');
    html += '</div></div>';
  });
  el.innerHTML = html || '<div class="pn-empty">Nenhuma matéria neste filtro. Use <b>Editar matérias e tópicos</b> logo abaixo para cadastrar.</div>';
};
app.tgPaint = function (mid, i) {
  var m = null;
  for (var x = 0; x < app.MAT.length; x++) {
    if (app.MAT[x].id === mid) {
      m = app.MAT[x];
      break;
    }
  }
  if (!m) return false;
  var wrap = document.getElementById('ckm-' + m.id);
  if (!wrap) return false;
  var row = wrap.querySelectorAll('.ck-body .ck-t')[i];
  if (!row) return false;
  var st = app.S.t[mid + ':' + i] || {};
  ['e', 'r', 'q'].forEach(function (tp) {
    var btn = row.querySelector('.sd.' + tp);
    if (btn) {
      btn.classList.toggle('on', !!st[tp]);
      btn.setAttribute('aria-pressed', st[tp] ? 'true' : 'false');
    }
  });
  row.classList.toggle('done', !!(st.e && st.r && st.q));
  var done = 0,
    stg = 0;
  m.t.forEach(function (_, k) {
    var s2 = app.S.t[m.id + ':' + k] || {};
    if (s2.e) stg++;
    if (s2.r) stg++;
    if (s2.q) stg++;
    if (s2.e && s2.r && s2.q) done++;
  });
  var ct = wrap.querySelector('.ck-ct');
  if (ct) ct.textContent = done + '/' + m.t.length;
  var bar = wrap.querySelector('.ck-h .pbar i');
  if (bar) bar.style.width = Math.round(100 * stg / (m.t.length * 3)) + '%';
  return true;
};
app.tg = function (mid, i, tp) {
  var k = mid + ':' + i;
  app.S.t[k] = app.S.t[k] || {};
  if (app.S.t[k][tp]) delete app.S.t[k][tp];else app.S.t[k][tp] = app.hoje();
  app.saveS();
  if (!app.tgPaint(mid, i)) app.renderCheck();
  app.renderRev();
  app.stats();
  app.pnBadges();
  app.cmpProg();
};
/* ---- registro de questões ---- */
app.qzTotais = function () {
  var t = {};
  app.S.qzl.forEach(function (r) {
    var o = t[r.m] || (t[r.m] = {
      f: 0,
      a: 0
    });
    o.f += r.f;
    o.a += r.a;
  });
  return t;
};
app.qzGeral = function () {
  var f = 0,
    a = 0;
  app.S.qzl.forEach(function (r) {
    f += r.f;
    a += r.a;
  });
  return {
    f: f,
    a: a,
    p: f ? Math.round(100 * a / f) : 0
  };
};
app.qzClasse = function (p) {
  var alvo = app.MET().alvo || 70;
  return p >= alvo ? 'pc-ok' : p >= alvo - 20 ? 'pc-mid' : 'pc-low';
};
app.qzName = function (id) {
  if (id === 'sim') return 'Simulado misto';
  var m = app.mById(id);
  return m ? m.n : 'Matéria removida';
};
app.segunda = function (iso) {
  var d = new Date(iso + 'T00:00:00'),
    w = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - w);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
};
app.initQuiz = function () {
  var sel = document.getElementById('qz-mat');
  if (!sel) return;
  var html = '';
  app.MAT.forEach(function (m) {
    html += '<option value="' + m.id + '">' + app.tx(m.n) + '</option>';
  });
  html += '<option value="sim">Simulado misto</option>';
  sel.innerHTML = html;
};
app.addQuiz = function (ev) {
  ev.preventDefault();
  var id = document.getElementById('qz-mat').value,
    f = parseInt(document.getElementById('qz-f').value, 10),
    a = parseInt(document.getElementById('qz-a').value, 10);
  if (!(f >= 1) || !(a >= 0) || a > f) {
    alert('Confira os números: acertos não pode passar do total de questões.');
    return false;
  }
  app.S.qzl.push({
    id: 'q' + Date.now(),
    d: app.hoje(),
    m: id,
    f: f,
    a: a
  });
  document.getElementById('qz-f').value = '';
  document.getElementById('qz-a').value = '';
  app.saveS();
  app.renderQuiz();
  app.stats();
  return false;
};
app.qzEdit = function (id) {
  app.qzEditando = app.qzEditando === id ? null : id;
  app.renderQuiz();
};
app.qzSalvar = function (id) {
  var r = null;
  app.S.qzl.forEach(function (x) {
    if (x.id === id) r = x;
  });
  if (!r) return;
  var f = parseInt(document.getElementById('qze-f').value, 10),
    a = parseInt(document.getElementById('qze-a').value, 10),
    d = document.getElementById('qze-d').value;
  if (!(f >= 1) || !(a >= 0) || a > f) {
    alert('Confira os números: acertos não pode passar do total de questões.');
    return;
  }
  r.f = f;
  r.a = a;
  r.d = d || '';
  app.qzEditando = null;
  app.saveS();
  app.renderQuiz();
  app.stats();
};
app.qzApagar = function (id) {
  if (!confirm('Apagar este lançamento? O total da matéria é recalculado na hora.')) return;
  app.S.qzl = app.S.qzl.filter(function (x) {
    return x.id !== id;
  });
  app.qzEditando = null;
  app.saveS();
  app.renderQuiz();
  app.stats();
};
app.renderQuiz = function () {
  var el = document.getElementById('quiz-list');
  if (!el) return;
  if (!app.S.qzl.length) {
    el.innerHTML = '<div class="pn-empty">Nenhuma bateria registrada ainda. Fez 20 questões de Português e acertou 14? Registre aí em cima — eu acumulo, mostro onde reforçar e guardo o histórico com data.</div>';
    return;
  }
  var alvo = app.MET().alvo || 70,
    html = '',
    tot = app.qzTotais();
  var ids = Object.keys(tot).sort(function (x, y) {
    return tot[x].a / tot[x].f - tot[y].a / tot[y].f;
  });
  html += '<div class="qz-sub"><h4>Por matéria</h4></div>';
  ids.forEach(function (id) {
    var q = tot[id],
      p = Math.round(100 * q.a / q.f),
      c = app.qzClasse(p);
    html += '<div class="qz-r ' + c + '"><div class="qr1"><b>' + app.tx(app.qzName(id)) + '</b><span class="pct">' + p + '%</span></div><span class="pbar"><i style="width:' + p + '%"></i></span><small>' + q.a + ' acertos em ' + q.f + ' questões' + (p < alvo ? ' · reforçar' : '') + '</small></div>';
  });
  /* semana a semana */
  var sem = {},
    semData = 0;
  app.S.qzl.forEach(function (r) {
    if (!r.d) {
      semData++;
      return;
    }
    var k = app.segunda(r.d),
      o = sem[k] || (sem[k] = {
        f: 0,
        a: 0
      });
    o.f += r.f;
    o.a += r.a;
  });
  var semanas = Object.keys(sem).sort().slice(-8);
  if (semanas.length) {
    html += '<div class="qz-sub"><h4>Semana a semana</h4><span class="hint" style="margin:0">alvo ≥' + alvo + '%</span></div>';
    semanas.forEach(function (k) {
      var o = sem[k],
        p = Math.round(100 * o.a / o.f),
        c = app.qzClasse(p);
      html += '<div class="wk ' + c + '"><span class="lb">' + app.brDate(k).slice(0, 5) + '</span><span class="pbar"><i style="width:' + p + '%"></i></span><span class="vl">' + p + '% <small style="color:var(--faint);font-weight:600">(' + o.f + ')</small></span></div>';
    });
  }
  /* lançamentos */
  html += '<div class="qz-sub"><h4>Últimos lançamentos</h4><span class="hint" style="margin:0">' + app.S.qzl.length + ' no total' + (semData ? ' · ' + semData + ' sem data (vieram do formato antigo)' : '') + '</span></div>';
  var ultimos = app.S.qzl.slice().sort(function (x, y) {
    return (y.d || '') < (x.d || '') ? -1 : 1;
  }).slice(0, 12);
  ultimos.forEach(function (r) {
    if (app.qzEditando === r.id) {
      html += '<div class="rowi"><div class="fld-row">' + '<div class="fld"><label>Data</label><input type="date" id="qze-d" value="' + app.ea(r.d) + '"/></div>' + '<div class="fld"><label>Questões</label><input type="text" inputmode="numeric" id="qze-f" value="' + r.f + '"/></div>' + '<div class="fld"><label>Acertos</label><input type="text" inputmode="numeric" id="qze-a" value="' + r.a + '"/></div></div>' + '<div style="display:flex;gap:8px;justify-content:flex-end">' + '<button class="btn danger sm" onclick="qzApagar(\'' + r.id + '\')">' + app.ic('i29') + 'Apagar</button>' + '<button class="btn ghost sm" onclick="qzEdit(\'' + r.id + '\')">Cancelar</button>' + '<button class="btn primary sm" onclick="qzSalvar(\'' + r.id + '\')">' + app.ic('i32') + 'Salvar</button></div></div>';
    } else {
      var p = Math.round(100 * r.a / r.f),
        c = app.qzClasse(p);
      html += '<div class="qz-h ' + c + '"><span class="dt">' + (r.d ? app.brDate(r.d).slice(0, 5) : '—') + '</span><span class="nm">' + app.tx(app.qzName(r.m)) + '</span>' + '<span class="sc">' + r.a + '/' + r.f + ' · ' + p + '%</span>' + '<button class="mini-btn" onclick="qzEdit(\'' + r.id + '\')" title="Corrigir lançamento" aria-label="Corrigir lançamento">' + app.ic('i28') + '</button></div>';
    }
  });
  el.innerHTML = html;
};
app.fcIv = function () {
  var v = app.MET().fciv;
  return Array.isArray(v) && v.length ? v : [1, 3, 7, 16, 35];
};
app.fcDueList = function (d) {
  var t = app.hoje();
  return app.FCS().filter(function (c) {
    if (d && c.d !== d) return false;
    var st = app.S.fc[c.i];
    return !st || st.due <= t;
  });
};
app.fcNext = function () {
  var m = null;
  app.FCS().forEach(function (c) {
    var st = app.S.fc[c.i];
    if (st && st.due > app.hoje() && (!m || st.due < m)) m = st.due;
  });
  return m;
};
app.renderFlash = function () {
  var el = document.getElementById('fc-area');
  if (!el || app.fcActive) return;
  if (!app.FCS().length) {
    el.innerHTML = '<div class="pn-empty">Nenhum flashcard cadastrado ainda. Use <b>Editar flashcards</b> logo abaixo para criar o primeiro deck e os primeiros cards.</div>';
    return;
  }
  var tot = app.fcDueList(null).length,
    html = '<div class="fc-decks">';
  app.DK().forEach(function (dk) {
    var n = app.fcDueList(dk.id).length;
    html += '<button class="fc-deck' + (n ? '' : ' fc-zero') + '" style="--dk:' + dk.c + '" onclick="fcStart(\'' + dk.id + '\')"' + (n ? '' : ' disabled') + '><b>' + app.tx(dk.n) + '</b><span class="n">' + n + '</span><span class="s">' + (n ? 'para hoje' : 'em dia ✓') + '</span></button>';
  });
  html += '</div>';
  if (tot) {
    var lim = app.fcLimite(),
      n = lim && tot > lim ? lim : tot;
    html += '<button class="btn fc-all" onclick="fcStart(null)">' + app.ic('i27') + (lim && tot > lim ? 'Estudar ' + n + ' de ' + tot + ' hoje' : 'Revisar tudo (' + tot + ')') + '</button>';
  } else {
    var nx = app.fcNext();
    html += '<div class="pn-empty">Todos os ' + app.FCS().length + ' cards em dia! 🎉' + (nx ? ' Próxima revisão: <b>' + nx.split('-').reverse().join('/') + '</b>.' : '') + '</div>';
  }
  el.innerHTML = html;
};
app.fcLimite = function () {
  var n = parseInt(app.MET().fcDia, 10);
  return n > 0 ? n : 0;
};
app.fcStart = function (d) {
  app.fcQ = app.fcDueList(d);
  if (!app.fcQ.length) return;
  if (!d) {
    for (var k = app.fcQ.length - 1; k > 0; k--) {
      var j = Math.floor(Math.random() * (k + 1)),
        tmp = app.fcQ[k];
      app.fcQ[k] = app.fcQ[j];
      app.fcQ[j] = tmp;
    }
  }
  var lim = app.fcLimite();
  if (lim && app.fcQ.length > lim) app.fcQ = app.fcQ.slice(0, lim);
  app.fcIdx = 0;
  app.fcRev = false;
  app.fcHits = 0;
  app.fcMiss = 0;
  app.fcActive = true;
  app.fcShow();
};
app.fcShow = function () {
  var el = document.getElementById('fc-area');
  if (!el) return;
  if (!app.fcQ.length || app.fcIdx >= app.fcQ.length) {
    app.fcEnd();
    return;
  }
  var c = app.fcQ[app.fcIdx],
    dk = app.dkById(c.d) || {
      n: 'Cards',
      c: 'var(--magenta)'
    };
  var html = '<div class="fc-meta"><span class="fc-tag" style="--dk:' + dk.c + '">' + dk.n + '</span><span class="ct">' + (app.fcIdx + 1) + ' / ' + app.fcQ.length + '</span><button class="fc-x" onclick="fcClose()" aria-label="Fechar">✕</button></div>';
  html += '<div class="fc-card" style="--dk:' + dk.c + '" onclick="fcReveal()"><div class="fc-q">' + app.fmt(c.q) + '</div>' + (app.fcRev ? '<div class="fc-a">' + app.fmt(c.a) + '</div><div class="fc-foot"><span class="fc-src">' + app.fmt1(c.s) + '</span>' + (c.u ? '<a class="fc-aula" href="https://www.youtube.com/results?search_query=' + c.u + '" target="_blank" rel="noopener" onclick="event.stopPropagation()">' + app.ic('i26') + 'Aula sobre o tema</a>' : '') + '</div>' : '<div class="fc-hint">toque para ver a resposta</div>') + '</div>';
  html += '<div class="fc-btns">' + (app.fcRev ? '<button class="btn rose" onclick="fcAns(0)">✗ Errei</button><button class="btn green" onclick="fcAns(1)">✓ Acertei</button>' : '<button class="btn ghost" style="flex:1;justify-content:center;padding:13px" onclick="fcReveal()">Mostrar resposta</button>') + '</div>';
  el.innerHTML = html;
};
app.fcReveal = function () {
  if (!app.fcActive || !app.fcQ.length) return;
  if (!app.fcRev) {
    app.fcRev = true;
    app.fcShow();
  }
};
app.fcAns = function (ok) {
  var c = app.fcQ[app.fcIdx];
  if (!c) {
    app.fcEnd();
    return;
  }
  var st = app.S.fc[c.i] || {
    n: 0,
    lap: 0
  };
  if (ok) {
    app.fcHits++;
    st.n = (st.n || 0) + 1;
    var tab = app.fcIv(),
      iv = tab[Math.min(st.n - 1, tab.length - 1)];
    var dt = new Date();
    dt.setDate(dt.getDate() + iv);
    st.due = dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0') + '-' + String(dt.getDate()).padStart(2, '0');
    st.iv = iv;
  } else {
    app.fcMiss++;
    st.n = 0;
    st.lap = (st.lap || 0) + 1;
    st.due = app.hoje();
    st.iv = 0;
    app.fcQ.push(c);
  }
  app.S.fc[c.i] = st;
  app.saveS();
  app.pnBadges();
  app.fcIdx++;
  app.fcRev = false;
  app.fcShow();
};
app.fcEnd = function () {
  var el = document.getElementById('fc-area');
  app.fcActive = false;
  var tot = app.fcHits + app.fcMiss,
    p = tot ? Math.round(100 * app.fcHits / tot) : 0;
  el.innerHTML = '<div class="fc-end"><b>Sessão concluída! 🎉</b><p>' + tot + ' respostas · <b>' + app.fcHits + ' acertos</b> (' + p + '%)' + (app.fcMiss ? ' · ' + app.fcMiss + ' para rever' : '') + '</p><p>Os cards acertados voltam mais espaçados; os errados, amanhã.</p><button class="btn ghost sm" onclick="renderFlash()">voltar aos decks</button></div>';
};
app.fcClose = function () {
  app.fcActive = false;
  app.renderFlash();
};
/* ---- Estudar agora ---- */
app.hjFechar = function () {
  var b = document.getElementById('hoje-box');
  if (b) b.hidden = true;
};
app.estudarAgora = function () {
  var box = document.getElementById('hoje-box');
  if (!box) return;
  function step(i, t, d, extra) {
    return '<div class="hj-step"><span class="hj-n">' + i + '</span><span class="hj-t"><b>' + t + '</b><span class="d">' + d + '</span>' + (extra || '') + '</span></div>';
  }
  function act(on, txt) {
    return '<button type="button" class="hj-a" onclick="' + on + '">' + txt + '</button>';
  }
  var fk = app.cicloKey(),
    html = '',
    hj = '';
  try {
    hj = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    });
  } catch (e) {}
  html += '<div class="hj-h"><span>Sessão de hoje' + (hj ? ' · ' + hj : '') + '</span><button type="button" class="x" onclick="hjFechar()" aria-label="Fechar sessão de hoje">✕</button></div>';
  if (!fk || !app.CICLOS[fk]) {
    box.innerHTML = html + '<div class="pn-empty">Sem prova futura cadastrada — sem sessões para montar. 🎓</div>';
    box.hidden = false;
    return;
  }
  var n = 1,
    due = app.revDue();
  if (due.length) html += step(n++, 'Revisões vencidas (' + due.length + ')', '10–15 min — comece por elas para fixar', act("paneSet('pn','hoje',1)", 'abrir revisões'));else html += step(n++, 'Revisões em dia ✓', 'nenhum tópico vencido hoje', '');
  var fdue = app.fcDueList(null).length,
    flim = app.fcLimite();
  if (fdue) html += step(n++, 'Flashcards para hoje (' + (flim && fdue > flim ? flim + ' de ' + fdue : fdue) + ')', '~10 min de recuperação ativa — o que mais fixa', act("paneSet('pn','flash',1)", 'abrir flashcards'));
  app.S.cy[fk] = app.S.cy[fk] || {
    done: {},
    v: 1
  };
  var st = app.S.cy[fk],
    c = app.CICLOS[fk],
    idx = -1,
    metaB = app.MET().blocosDia || 0,
    feitosB = (st.dias || {})[app.hoje()] || 0;
  if (metaB) html += step(n++, 'Meta do dia: ' + feitosB + ' de ' + metaB + ' blocos' + (feitosB >= metaB ? ' ✓' : ''), feitosB >= metaB ? 'meta batida — o que vier agora é lucro' : 'cada bloco tem ~' + (app.MET().blocoMin || 45) + ' min', act("paneSet('pn','ciclo',1)", 'ver o ciclo'));
  for (var i = 0; i < c.b.length; i++) {
    if (!st.done[i]) {
      idx = i;
      break;
    }
  }
  if (idx === -1) {
    html += step(n++, 'Volta ' + st.v + ' completa! 🎉', 'recomece a rotação — repetição é o que fixa', act("cyNova('" + fk + "');estudarAgora();renderCiclo()", 'começar volta ' + (st.v + 1)));
  } else {
    var b = c.b[idx],
      mats = b.id ? app.mtlHtml(b.id) : '';
    html += step(n++, 'Bloco ' + (idx + 1) + ' de ' + c.b.length + ' · ' + app.tx(b.m), app.tx(b.d) + ' · ' + (b.min || app.MET().blocoMin || 45) + ' min (≈metade teoria, ≈metade questões)', (mats ? '<span class="mtls-row" style="margin:8px 0 0">' + mats + '</span>' : '') + act("cyMark('" + fk + "'," + idx + ");estudarAgora()", 'concluir bloco ✓') + ' &nbsp;·&nbsp; ' + act("paneSet('pn','ciclo',1)", 'ver o ciclo'));
  }
  var worst = null,
    wp = 101,
    alvo = app.MET().alvo || 70,
    tot2 = app.qzTotais();
  Object.keys(tot2).forEach(function (id) {
    if (id === 'sim') return;
    var q = tot2[id],
      p = Math.round(100 * q.a / q.f);
    if (p < alvo && p < wp) {
      wp = p;
      worst = id;
    }
  });
  if (worst) html += step(n++, 'Reforço: ' + app.tx(app.qzName(worst)) + ' (' + wp + '%)', 'abaixo do alvo de ' + alvo + '% — inclua uma bateria de 10–20 questões dela', '');
  html += step(n++, 'Registrar a bateria de hoje', 'anote questões feitas e acertos para eu apontar onde reforçar', act("paneSet('pn','quiz',1)", 'ir ao registro'));
  box.innerHTML = html;
  box.hidden = false;
};
/* ---- aba Comparar reage às marcações ---- */
app.cmpProg = function () {
  var v = document.getElementById('view-comparar');
  if (v && v.classList.contains('active')) app.renderComparar();
};
