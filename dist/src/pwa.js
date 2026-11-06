import { app } from './state.js';

app.pwaInstalado = function () {
  try {
    return matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  } catch (e) {
    return false;
  }
};
app.pwaBotao = function () {
  var b = document.getElementById('btInstalar');
  if (b) b.hidden = app.pwaInstalado();
};
app.instalarApp = function () {
  if (app.pwaPrompt) {
    app.pwaPrompt.prompt();
    app.pwaPrompt.userChoice.then(function () {
      app.pwaPrompt = null;
      app.pwaBotao();
    });
    return;
  }
  app.comoInstalar();
};
app.comoInstalar = function () {
  var ua = navigator.userAgent || '';
  var ios = /iPhone|iPad|iPod/i.test(ua);
  var android = /Android/i.test(ua);
  var h = app.modalHead('Instalar no celular', 'i35', 'modalFechar()') + '<div class="modal-b">';
  h += app.edNota('Instalar deixa o organizador com <b>ícone na tela inicial</b>, abrindo em tela cheia, sem a barra do navegador. Seus dados continuam os mesmos — e se você já usa a sincronização, ela segue funcionando igual.');
  if (ios) {
    h += '<div class="sync-step"><span class="sn">1</span><span>No <b>Safari</b>, toque no botão <b>Compartilhar</b> (o quadrado com a seta para cima), na barra de baixo.</span></div>' + '<div class="sync-step"><span class="sn">2</span><span>Role a lista e escolha <b>Adicionar à Tela de Início</b>.</span></div>' + '<div class="sync-step"><span class="sn">3</span><span>Confirme em <b>Adicionar</b>. O ícone aparece junto dos seus outros apps.</span></div>' + '<p class="hint" style="margin-top:12px">No iPhone só o Safari instala — pelo Chrome não aparece a opção.</p>';
  } else if (android) {
    h += '<div class="sync-step"><span class="sn">1</span><span>No <b>Chrome</b>, toque nos <b>três pontinhos</b> no canto superior direito.</span></div>' + '<div class="sync-step"><span class="sn">2</span><span>Escolha <b>Adicionar à tela inicial</b> (ou <b>Instalar app</b>, se aparecer).</span></div>' + '<div class="sync-step"><span class="sn">3</span><span>Confirme. O ícone entra na tela inicial e o app abre em tela cheia.</span></div>';
  } else {
    h += '<div class="sync-step"><span class="sn">1</span><span>No <b>Chrome</b> do computador, procure o ícone de instalar na ponta direita da barra de endereço.</span></div>' + '<div class="sync-step"><span class="sn">2</span><span>Se ele não aparecer, abra os <b>três pontinhos</b> → <b>Transmitir, salvar e compartilhar</b> → <b>Instalar página como app</b>.</span></div>' + '<div class="sync-step"><span class="sn">3</span><span>No celular, abra este mesmo endereço no Chrome e use <b>Adicionar à tela inicial</b>.</span></div>';
  }
  h += '</div><div class="modal-f"><span class="sp"></span><button class="btn primary" onclick="modalFechar()">Entendi</button></div>';
  app.modalAbrir(h, true);
};
