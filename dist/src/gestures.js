import { app } from './state.js';

export function gestureAxis(dx, dy) {
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 12) return null;
  return Math.abs(dx) > Math.abs(dy) * 1.4 ? 'horizontal' : 'vertical';
}

export function completesSwipe(distance, width, duration) {
  const delta = Math.abs(distance);
  return delta >= Math.min(110, width * .26) || (delta >= 48 && delta / Math.max(duration, 1) >= .5);
}

export function initializeGestures() {
  const main = document.querySelector('main');
  const drawer = document.getElementById('drawer');
  const backdrop = document.getElementById('drawerBackdrop');
  if (!main || !drawer || !backdrop) return;
  let drag = null;
  let settling = false;
  let suppressClickUntil = 0;
  const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const tabs = () => [...document.querySelectorAll('.tabs .tab')].filter(button => !button.hidden && getComputedStyle(button).display !== 'none').map(button => button.id.replace('tab-', ''));
  const resetDrawerStyle = () => {drawer.style.transform = ''; drawer.style.transition = ''; backdrop.style.opacity = '';};
  drawer.inert = true;
  drawer.setAttribute('aria-hidden', 'true');
  const toggle = app.toggleDrawer;
  app.toggleDrawer = function (force) {
    toggle(force);
    const open = drawer.classList.contains('open');
    drawer.inert = !open;
    drawer.setAttribute('aria-hidden', String(!open));
    if (open && !drag) drawer.querySelector('button')?.focus({preventScroll: true});
    else if (!open) document.getElementById('navToggle')?.focus({preventScroll: true});
  };
  document.addEventListener('pointerdown', event => {
    if (settling || event.pointerType !== 'touch' || !event.isPrimary || event.button !== 0 || !matchMedia('(max-width: 760px)').matches) return;
    if (document.querySelector('#modal-root .modal') || window.getSelection()?.toString()) return;
    const inDrawer = drawer.classList.contains('open') && drawer.contains(event.target);
    if (!inDrawer && !main.contains(event.target)) return;
    // Leave Android's screen-edge Back gesture to the system/browser.
    if (event.clientX < 24 || event.clientX > innerWidth - 24) return;
    if (!inDrawer && event.target.closest('input,textarea,select,button,a,[contenteditable="true"],.pnav,.cmp-matrix,.fc-study,.ck-body')) return;
    const current = document.querySelector('.view.active');
    if (!current) return;
    drag = {pointer: event.pointerId, x: event.clientX, y: event.clientY, time: performance.now(), dx: 0, axis: null, current, inDrawer, target: null, preview: null, mode: null};
  }, {passive: true});
  document.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.pointer) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    drag.axis ||= gestureAxis(dx, dy);
    if (drag.axis === 'vertical') {drag = null; return;}
    if (drag.axis !== 'horizontal') return;
    if (!drag.mode) {
      const names = tabs();
      const index = names.indexOf(drag.current.id.replace('view-', ''));
      drag.mode = drag.inDrawer ? 'drawer-close' : index === 0 && dx > 0 ? 'drawer-open' : 'tab';
      if (drag.mode === 'tab') {
        drag.direction = dx < 0 ? -1 : 1;
        drag.target = names[index + (dx < 0 ? 1 : -1)] || null;
        if (drag.target) {
          drag.preview = document.getElementById('view-' + drag.target);
          drag.preview.classList.add('gesture-preview');
          drag.preview.setAttribute('aria-hidden', 'true');
          drag.preview.inert = true;
          const top = Math.max(drag.current.offsetTop, document.querySelector('header.top').getBoundingClientRect().bottom + 16 - main.getBoundingClientRect().top);
          drag.preview.style.top = `${top}px`;
        }
        main.classList.add('gesture-active');
      } else {
        drawer.style.transition = 'none';
        backdrop.style.transition = 'none';
        if (drag.mode === 'drawer-open') {drawer.inert = false; backdrop.classList.add('open');}
      }
      drag.capture = drag.inDrawer ? drawer : main;
      drag.capture.setPointerCapture(event.pointerId);
    }
    event.preventDefault();
    drag.dx = dx;
    if (drag.mode === 'tab') {
      const distance = drag.target ? dx : dx * .18;
      drag.current.style.transform = `translate3d(${distance}px,0,0)`;
      if (drag.preview) drag.preview.style.transform = `translate3d(${dx - drag.direction * main.clientWidth}px,0,0)`;
    } else {
      const width = drawer.getBoundingClientRect().width;
      const position = drag.mode === 'drawer-open' ? Math.min(0, -width + Math.max(0, dx)) : Math.max(-width, Math.min(0, dx));
      drawer.style.transform = `translate3d(${position}px,0,0)`;
      backdrop.style.opacity = String(Math.max(0, 1 + position / width));
    }
  }, {passive: false});

  function finish(event, cancelled = false) {
    if (!drag || event.pointerId !== drag.pointer) return;
    const gesture = drag;
    drag = null;
    if (!gesture.mode) return;
    if (gesture.capture?.hasPointerCapture(event.pointerId)) gesture.capture.releasePointerCapture(event.pointerId);
    suppressClickUntil = performance.now() + 400;
    const committed = !cancelled && completesSwipe(gesture.dx, main.clientWidth, performance.now() - gesture.time);
    const duration = reducedMotion() ? 0 : 170;
    if (gesture.mode !== 'tab') {
      const open = gesture.mode === 'drawer-open' ? committed && gesture.dx > 0 : !(committed && gesture.dx < 0);
      resetDrawerStyle();
      backdrop.style.transition = '';
      app.toggleDrawer(open);
      return;
    }
    const go = committed && gesture.target && Math.sign(gesture.dx) === gesture.direction;
    const destination = go ? (gesture.dx < 0 ? -main.clientWidth : main.clientWidth) : 0;
    settling = true;
    const currentAnimation = gesture.current.animate([{transform: gesture.current.style.transform}, {transform: `translate3d(${destination}px,0,0)`}], {duration, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'forwards'});
    const previewAnimation = gesture.preview?.animate([{transform: gesture.preview.style.transform}, {transform: `translate3d(${go ? 0 : gesture.dx < 0 ? main.clientWidth : -main.clientWidth}px,0,0)`}], {duration, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'forwards'});
    currentAnimation.finished.catch(() => {}).then(() => {
      currentAnimation.cancel();previewAnimation?.cancel();
      gesture.current.style.transform = '';
      if (gesture.preview) {gesture.preview.style.transform = ''; gesture.preview.style.top = ''; gesture.preview.classList.remove('gesture-preview'); gesture.preview.removeAttribute('aria-hidden'); gesture.preview.inert = false;}
      main.classList.remove('gesture-active');
      if (go) app.showView(gesture.target);
      settling = false;
    });
  }
  document.addEventListener('pointerup', event => finish(event));
  document.addEventListener('pointercancel', event => finish(event, true));
  document.addEventListener('click', event => {if (performance.now() < suppressClickUntil) {event.preventDefault();event.stopImmediatePropagation();}}, true);
  window.addEventListener('blur', () => {if(drag)finish({pointerId:drag.pointer},true);});
}
