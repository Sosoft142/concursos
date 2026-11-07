import { app } from './state.js';

/* =====================================================================
   NAVEGAÇÃO
   ===================================================================== */
app.travarRolagem = function () {
  var m = document.querySelector('#modal-root .modal');
  var d = document.getElementById('drawer');
  document.body.style.overflow = m || d && d.classList.contains('open') ? 'hidden' : '';
};
app.toggleDrawer = function (force) {
  var d = document.getElementById('drawer'),
    bk = document.getElementById('drawerBackdrop'),
    t = document.getElementById('navToggle');
  if (!d) return;
  var open = typeof force === 'boolean' ? force : !d.classList.contains('open');
  d.classList.toggle('open', open);
  bk.classList.toggle('open', open);
  if (t) t.setAttribute('aria-expanded', open ? 'true' : 'false');
  app.travarRolagem();
  if (open) app.updSpy();
};
app.salvarUI = function () {
  if (app.uiTimer) clearTimeout(app.uiTimer);
  app.uiTimer = setTimeout(function () {
    app.uiTimer = null;
    app.saveS({
      noStamp: true,
      noSync: true
    });
  }, 500);
};
app.paneAtual = function (e) {
  app.S.ui.panes = app.S.ui.panes || {};
  return app.S.ui.panes[e] || null;
};
app.pnavHtml = function (esc, itens) {
  var h = '<div class="pnav" data-e="' + esc + '" role="tablist">';
  itens.forEach(function (it) {
    h += '<button class="pnav-b" data-e="' + esc + '" data-p="' + it.p + '" role="tab" aria-selected="false" style="--pc:' + it.c + '" onclick="paneSet(\'' + esc + '\',\'' + it.p + '\')">' + app.ic(it.i) + '<span>' + it.n + '</span>' + (it.b ? '<span class="ct">' + it.b + '</span>' : '') + '</button>';
  });
  return h + '</div>';
};
app.paneSet = function (esc, p, rolar) {
  var btns = [].slice.call(document.querySelectorAll('.pnav-b[data-e="' + esc + '"]'));
  if (!btns.length) return;
  var existe = btns.some(function (b) {
    return b.getAttribute('data-p') === p;
  });
  if (!existe) p = btns[0].getAttribute('data-p');
  app.S.ui.panes = app.S.ui.panes || {};
  app.S.ui.panes[esc] = p;
  btns.forEach(function (b) {
    b.setAttribute('aria-selected', b.getAttribute('data-p') === p ? 'true' : 'false');
  });
  [].forEach.call(document.querySelectorAll('.pane[data-e="' + esc + '"]'), function (el) {
    el.hidden = el.getAttribute('data-p') !== p;
  });
  app.salvarUI();
  app.updSpy();
  if (rolar) {
    var host = document.querySelector('.pnav[data-e="' + esc + '"]');
    if (host) setTimeout(function () {
      host.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }, 80);
  }
};
app.paneInit = function (esc, padrao) {
  app.paneSet(esc, app.paneAtual(esc) || padrao);
  app.pnavWatch(esc);
};
/* dica visual de que a fita de abas rola para o lado */
app.pnavHint = function (el) {
  if (!el) return;
  el.classList.toggle('sc-r', el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  el.classList.toggle('sc-l', el.scrollLeft > 2);
};
app.pnavWatch = function (esc) {
  var el = document.querySelector('.pnav[data-e="' + esc + '"]');
  if (!el) return;
  if (!el.__w) {
    el.__w = 1;
    el.addEventListener('scroll', function () {
      app.pnavHint(el);
    }, {
      passive: true
    });
  }
  app.pnavHint(el);
  setTimeout(function () {
    app.pnavHint(el);
  }, 150);
};
app.pnavHintAll = function () {
  [].forEach.call(document.querySelectorAll('.pnav'), app.pnavHint);
};
/* ---------- destaque no menu lateral ---------- */
app.updSpy = function () {
  var view = document.querySelector('.view.active');
  if (!view) return;
  var vname = view.id.replace('view-', '');
  [].forEach.call(document.querySelectorAll('.drawer .nv'), function (a) {
    a.classList.remove('act');
    var v = a.getAttribute('data-v'),
      e = a.getAttribute('data-e'),
      p = a.getAttribute('data-p');
    if (v !== vname) return;
    if (!e) {
      a.classList.add('act');
      return;
    }
    var aberto = true;
    if (e === 'pn') {
      aberto = !!(document.getElementById('painel') || {
        classList: {
          contains: function () {
            return false;
          }
        }
      }).classList.contains('open');
    } else if (e !== 'cmp') {
      var acc = document.getElementById('acc-' + e);
      aberto = !!(acc && acc.classList.contains('open'));
    }
    if (!aberto) return;
    if (!p) {
      a.classList.add('act');
      return;
    }
    if (app.paneAtual(e) === p) a.classList.add('act');
  });
};
app.goArea = function (v) {
  app.showView(v);
  app.toggleDrawer(false);
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};
app.goAnchor = function (v, id) {
  app.showView(v);
  app.toggleDrawer(false);
  setTimeout(function () {
    var el = document.getElementById(id);
    if (el) {
      const disclosure = el.closest('details');
      if (disclosure) disclosure.open = true;
      el.scrollIntoView({behavior: 'smooth', block: 'start'});
    }
  }, 120);
};
app.goPane = function (v, esc, p) {
  app.showView(v);
  if (esc === 'pn') app.togglePainel(true);else if (esc !== 'cmp') {
    var acc = document.getElementById('acc-' + esc);
    if (acc && !acc.classList.contains('open')) app.toggleConcurso(esc);
  }
  if (p) app.paneSet(esc, p);
  app.toggleDrawer(false);
  setTimeout(function () {
    var alvo = esc === 'pn' ? document.getElementById('painel') : esc === 'cmp' ? document.querySelector('.pnav[data-e="cmp"]') : document.getElementById('acc-' + esc);
    if (alvo) alvo.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }, 130);
};
app.showView = function (name) {
  document.querySelectorAll('.view').forEach(function (v) {
    v.classList.remove('active');
  });
  var el = document.getElementById('view-' + name);
  if (el) el.classList.add('active');
  document.querySelectorAll('.tab').forEach(function (t) {
    t.setAttribute('aria-selected', 'false');
  });
  var tb = document.getElementById('tab-' + name);
  if (tb) tb.setAttribute('aria-selected', 'true');
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
  setTimeout(app.pnavHintAll, 80);
  app.updSpy();
};
app.toggleConcurso = function (id) {
  var acc = document.getElementById('acc-' + id);
  if (!acc) return;
  var open = acc.classList.toggle('open');
  var head = acc.querySelector('.acc-head');
  if (head) head.setAttribute('aria-expanded', open ? 'true' : 'false');
  if (open) setTimeout(function () {
    app.pnavWatch(id);
  }, 60);
  app.updSpy();
};
app.togglePainel = function (force) {
  var p = document.getElementById('painel');
  if (!p) return;
  var open = typeof force === 'boolean' ? force : !p.classList.contains('open');
  if (open === p.classList.contains('open') && typeof force === 'boolean') return;
  p.classList.toggle('open', open);
  var t = document.getElementById('pn-top');
  if (t) t.setAttribute('aria-expanded', open ? 'true' : 'false');
  if (typeof app.S !== 'undefined' && app.S) {
    app.S.ui = app.S.ui || {};
    app.S.ui.pn3 = open ? 1 : 0;
    app.salvarUI();
  }
  if (open) setTimeout(function () {
    app.pnavWatch('pn');
  }, 60);
  app.updSpy();
};
app.openConcurso = function (id) {
  app.showView('estudo');
  var acc = document.getElementById('acc-' + id);
  if (acc && !acc.classList.contains('open')) app.toggleConcurso(id);
  setTimeout(function () {
    if (acc) acc.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }, 120);
};
app.pnVisiveis = function () {
  return app.PNSECS.filter(function (s) {
    return !app.oculto(s.p);
  });
};
