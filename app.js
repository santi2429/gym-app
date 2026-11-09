// ====== Navegación e inicio de la app ======
let CUR = { name: null, params: {} };
const STACK = [];
function go(name, params = {}, replace) {
  if (!replace && CUR.name && CUR.name !== name) STACK.push(CUR);
  if (STACK.length > 30) STACK.shift();
  CUR = { name, params };
  render(); window.scrollTo(0, 0);
}
function back() { const prev = STACK.pop(); if (prev) { CUR = prev; render(); window.scrollTo(0, 0); } else go('inicio'); }
function render() {
  const p = Store.p;
  if (!p && CUR.name !== 'onboarding') { obReset(); CUR = { name: 'onboarding', params: {} }; }
  const S = SCREENS[CUR.name] || SCREENS.inicio;
  const root = $('#app');
  root.innerHTML = S.html(p, CUR.params);
  root.classList.toggle('full', !!S.full);
  const nav = $('#nav'); nav.classList.toggle('hidden', !!S.full || !S.nav);
  $$('#nav a').forEach(a => a.classList.toggle('on', a.dataset.go === S.nav));
  if (S.mount) S.mount(root, p, CUR.params);
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-back]'); if (b) { back(); return; }
  const g = e.target.closest('[data-go]');
  if (g && !e.target.closest('button:not([data-go]), input, .tg, .chip')) {
    const to = g.dataset.go;
    if (g.closest('#nav')) { STACK.length = 0; CUR = { name: null }; }
    go(to);
  }
});

(function init() {
  Store.load();
  applyTheme(Store.p);
  if (!Store.p) { obReset(); go('onboarding'); }
  else if (Store.p.live) { CUR = { name: 'inicio', params: {} }; render(); }
  else go('inicio');
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => { });
  document.addEventListener('touchstart', unlockAudio, { once: true, passive: true });
})();
