import { app } from './state.js';
import { DEFAULT_ACCENT } from './appearance.js';

app.CFG = function () {
  app.S.ui = app.S.ui || {};
  if (!app.S.ui.cfg || typeof app.S.ui.cfg !== 'object') app.S.ui.cfg = {};
  if (!app.S.ui.cfg.acento) app.S.ui.cfg.acento = DEFAULT_ACCENT;
  if (!app.S.ui.cfg.oculto || typeof app.S.ui.cfg.oculto !== 'object') app.S.ui.cfg.oculto = {};
  return app.S.ui.cfg;
};
app.acentoDe = function (id) {
  for (var i = 0; i < app.ACENTOS.length; i++) if (app.ACENTOS[i].id === id) return app.ACENTOS[i];
  return app.ACENTOS.find(accent => accent.id === DEFAULT_ACCENT);
};
app.oculto = function (id) {
  return !!app.CFG().oculto[id];
};
/* pinta o acento escolhido nas variáveis que o CSS inteiro já usa */
app.aplicarAcento = function () {
  var a = app.acentoDe(app.CFG().acento),
    r = document.documentElement.style;
  r.setProperty('--primary', a.cor);
  r.setProperty('--primary-soft', a.soft);
  r.setProperty('--primary-ink', a.ink);
  r.setProperty('--primary-on', app.ACENTO_TEXTO);
  /* o topo da página fica fora do acento de propósito: o logo e a barra do
     navegador com a cor forte atrapalhavam a leitura do cabeçalho */
};
app.edConfig = function () {
  app.CG = JSON.parse(JSON.stringify(app.CFG()));
  app.edOpen = {
    cor: true,
    some: true
  };
  app.cgRender();
};
app.cgFechar = function () {
  app.cgCancelar();
};
app.cgAcento = function (id) {
  app.CG.acento = id;
  app.cgRender();
  app.cgPrever();
};
app.cgToggle = function (id, on) {
  app.CG.oculto[id] = on ? 1 : 0;
};
/* deixa ver a cor antes de salvar */
app.cgPrever = function () {
  var a = app.acentoDe(app.CG.acento),
    r = document.documentElement.style;
  r.setProperty('--primary', a.cor);
  r.setProperty('--primary-soft', a.soft);
  r.setProperty('--primary-ink', a.ink);
  r.setProperty('--primary-on', app.ACENTO_TEXTO);
};
app.cgRender = function () {
  if (!app.CG) return;
  /* o estado das seções tem de valer ANTES de montar o HTML: edSec lê
     edOpen na hora em que constrói */
  if (app.edOpen.cor === undefined) app.edOpen.cor = true;
  if (app.edOpen.some === undefined) app.edOpen.some = true;
  var h = app.modalHead('Configurações', 'i23', 'cgFechar()') + '<div class="modal-b">';
  h += app.edNota('O que você escolher aqui vale para este aparelho e vai junto na sincronização. Nada some de verdade: esconder uma seção só tira ela da tela.');
  var c = '<div class="cor-grade">';
  app.ACENTOS.forEach(function (a) {
    c += '<button type="button" class="cor-op' + (app.CG.acento === a.id ? ' on' : '') + '" onclick="cgAcento(\'' + a.id + '\')"' + ' aria-pressed="' + (app.CG.acento === a.id ? 'true' : 'false') + '" title="' + app.ea(a.n) + '">' + '<span class="cor-bola" style="background:' + a.cor + '"></span><span class="cor-n">' + app.tx(a.n) + '</span></button>';
  });
  c += '</div>';
  h += app.edSec('cor', 'Cor de destaque', app.acentoDe(app.CG.acento).n, c);
  var o = '';
  o += '<p class="hint" style="margin:0 0 12px">Desmarque o que você não usa. A seção some da tela e do menu, e os dados continuam guardados — é só remarcar para ela voltar.</p>';
  app.OCULTAVEIS.forEach(function (s) {
    o += '<label class="chk cfg-l"><input type="checkbox" ' + (app.CG.oculto[s.id] ? '' : 'checked') + ' onchange="cgToggle(\'' + s.id + '\',!this.checked)"/> ' + '<span><b>' + app.tx(s.n) + '</b><span class="cfg-onde">' + app.tx(s.onde) + '</span></span></label>';
  });
  var n = app.OCULTAVEIS.filter(function (s) {
    return app.CG.oculto[s.id];
  }).length;
  h += app.edSec('some', 'O que aparece', n ? n + ' escondida' + (n > 1 ? 's' : '') : 'tudo visível', o);
  h += '</div><div class="modal-f"><span class="sp"></span>' + '<button class="btn ghost" onclick="cgCancelar()">Cancelar</button>' + '<button class="btn primary" onclick="cgSalvar()">' + app.ic('i32') + 'Salvar</button></div>';
  app.modalAbrir(h, false);
};
app.cgCancelar = function () {
  app.CG = null;
  app.modalFechar();
  app.aplicarAcento();
};
app.cgSalvar = function () {
  app.S.ui.cfg = app.CG;
  app.CG = null;
  app.aplicarAcento();
  app.saveS();
  app.modalFechar();
  app.renderTudo();
};
