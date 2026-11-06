import { app } from './state.js';

export function initializeHistory() {
  let navigating = false;
  let returnFocus = null;
  const modal = () => document.querySelector('#modal-root .modal');
  const view = () => document.querySelector('.view.active')?.id.replace('view-', '') || 'concursos';
  const snapshot = (isModal = false, isDrawer = false) => ({concursos: true, view: view(), modal: isModal, drawer: isDrawer});
  history.replaceState(snapshot(), '', location.href);

  const openModal = app.modalAbrir;
  app.modalAbrir = function (...args) {
    const wasOpen = !!modal();
    if (!wasOpen) returnFocus = document.activeElement;
    openModal(...args);
    if (!wasOpen && !navigating && modal()) {
      if (history.state?.drawer) history.replaceState(snapshot(true), '', location.href);
      else history.pushState(snapshot(true), '', location.href);
    }
  };
  const closeModal = app.modalFechar;
  app.modalFechar = function () {
    const wasOpen = !!modal();
    closeModal();
    if (wasOpen && !navigating && history.state?.concursos && history.state.modal) history.back();
    if (returnFocus?.isConnected) returnFocus.focus({preventScroll: true});
  };
  const showView = app.showView;
  app.showView = function (name) {
    if (!document.getElementById('view-' + name)) return;
    const before = view();
    showView(name);
    if (before !== name && !navigating) {
      if (history.state?.drawer) history.replaceState(snapshot(), '', location.href);
      else history.pushState(snapshot(), '', location.href);
    }
    app.S.ui.view = name;
    app.salvarUI();
  };
  const toggleDrawer = app.toggleDrawer;
  app.toggleDrawer = function (force) {
    const drawer = document.getElementById('drawer');
    const before = drawer?.classList.contains('open');
    toggleDrawer(force);
    const open = drawer?.classList.contains('open');
    if (!navigating && before !== open) {
      if (open) history.pushState(snapshot(false, true), '', location.href);
      else queueMicrotask(() => {if (history.state?.drawer && !modal()) history.back();});
    }
  };
  window.addEventListener('popstate', event => {
    if (!event.state?.concursos) return;
    navigating = true;
    try {
      if (modal()) {
        // Use the actual editor's close action to retain its discard confirmation.
        const closeButton = modal().querySelector('.modal-h button[aria-label="Fechar"]');
        if (closeButton) closeButton.click(); else app.modalFechar();
        if (modal()) {
          history.pushState(snapshot(true), '', location.href);
          return;
        }
      }
      const drawer = document.getElementById('drawer');
      if (drawer?.classList.contains('open')) app.toggleDrawer(false);
      showView(event.state.view || 'concursos');
      app.S.ui.view = event.state.view || 'concursos';
    } finally { navigating = false; }
  });
  if (app.S.ui.view && document.getElementById('view-' + app.S.ui.view) && !(app.S.ui.view === 'comparar' && app.oculto('comparar'))) {
    showView(app.S.ui.view);
    history.replaceState(snapshot(), '', location.href);
  }
}
