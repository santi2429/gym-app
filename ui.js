// ====== Utilidades de interfaz ======
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = n => (Math.round(n * 10) / 10).toLocaleString('es-CO');
const fmt0 = n => Math.round(n).toLocaleString('es-CO');

function toast(msg, ms = 2400) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('on');
  clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('on'), ms);
}

function applyTheme(p) {
  const s = p ? p.settings : { color: 0, bg: 'negro' };
  const c = COLORS[s.color] || COLORS[0], r = document.documentElement.style;
  r.setProperty('--ac', c.ac); r.setProperty('--on-ac', c.on); r.setProperty('--ac-soft', c.soft);
  r.setProperty('--ac-line', c.line); r.setProperty('--ac-text', c.tx);
  document.body.classList.toggle('gris', s.bg === 'gris');
  const meta = $('meta[name=theme-color]'); if (meta) meta.content = s.bg === 'gris' ? '#18181b' : '#0d0b0b';
}

function confetti(n = 22, from) {
  const colors = [getComputedStyle(document.documentElement).getPropertyValue('--ac'), '#ffffff', getComputedStyle(document.documentElement).getPropertyValue('--ac-text')];
  for (let i = 0; i < n; i++) {
    const s = document.createElement('i');
    s.className = 'ti ' + (i % 3 ? 'ti-star' : 'ti-flame') + ' cf';
    const x = from ? from.x + (Math.random() - .5) * 200 : Math.random() * innerWidth;
    const y = from ? from.y + (Math.random() - .5) * 60 : innerHeight * (.3 + Math.random() * .3);
    s.style.left = x + 'px'; s.style.top = y + 'px'; s.style.color = colors[i % 3];
    s.style.animationDelay = (Math.random() * .35) + 's';
    document.body.appendChild(s); setTimeout(() => s.remove(), 2200);
  }
}

// ---- Sonido, vibración y parpadeo (en iPhone no hay vibración web: usamos sonido + parpadeo) ----
let _actx = null;
function audioCtx() {
  if (!_actx) { try { _actx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { } }
  if (_actx && _actx.state === 'suspended') _actx.resume();
  return _actx;
}
function unlockAudio() { // iOS exige un toque del usuario para habilitar el audio
  const a = audioCtx(); if (!a) return;
  const o = a.createOscillator(), g = a.createGain(); g.gain.value = 0; o.connect(g).connect(a.destination); o.start(); o.stop(a.currentTime + .01);
  try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) { }
}
function beep(pattern = [[880, .15], [0, .08], [880, .15], [0, .08], [1320, .3]]) {
  const p = Store.p; if (p && !p.settings.sounds) return;
  const a = audioCtx(); if (!a) return;
  let t = a.currentTime;
  pattern.forEach(([f, d]) => {
    if (f) {
      const o = a.createOscillator(), g = a.createGain();
      o.type = 'sine'; o.frequency.value = f; g.gain.setValueAtTime(.0001, t);
      g.gain.exponentialRampToValueAtTime(.5, t + .02); g.gain.exponentialRampToValueAtTime(.0001, t + d);
      o.connect(g).connect(a.destination); o.start(t); o.stop(t + d + .02);
    }
    t += d;
  });
}
function vibrate(pattern) {
  if (navigator.vibrate) { try { navigator.vibrate(pattern); return; } catch (e) { } }
  // Safari iOS 18+: el interruptor nativo da un toque háptico (mejor esfuerzo)
  try { const l = $('#hapticLbl'); if (l) l.click(); } catch (e) { }
}
function flash() { const f = $('#flash'); f.classList.remove('go'); void f.offsetWidth; f.classList.add('go'); }

// ---- Mantener pantalla encendida durante el entreno ----
let _wake = null;
async function keepAwake(on) {
  try {
    if (on && 'wakeLock' in navigator) { if (!_wake) { _wake = await navigator.wakeLock.request('screen'); _wake.addEventListener('release', () => _wake = null); } }
    else if (!on && _wake) { await _wake.release(); _wake = null; }
  } catch (e) { }
}
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && Store.p && Store.p.live && Store.p.settings.wake) keepAwake(true); });

// ---- Hoja inferior (modal) ----
function sheet(html, onMount) {
  const bg = document.createElement('div'); bg.className = 'sheet-bg';
  bg.innerHTML = '<div class="sheet">' + html + '</div>';
  bg.addEventListener('click', e => { if (e.target === bg) close(); });
  document.body.appendChild(bg);
  function close() { bg.remove(); }
  if (onMount) onMount(bg.firstChild, close);
  return close;
}
function confirmSheet(title, text, okLabel, onOk, danger) {
  sheet(`<h2>${esc(title)}</h2><p class="mu" style="margin-bottom:16px">${esc(text)}</p>
    <button class="btn blk ${danger ? 'out' : 'pri'}" id="ok" style="${danger ? 'color:var(--ac-text);border-color:var(--ac-line)' : ''}">${esc(okLabel)}</button>
    <button class="btn blk ghost" id="no" style="margin-top:6px">Cancelar</button>`, (el, close) => {
    $('#ok', el).onclick = () => { close(); onOk(); }; $('#no', el).onclick = close;
  });
}

// ---- Gráfica de línea simple en SVG ----
function lineChart(points, opts = {}) {
  if (points.length < 2) return '<div class="mu center" style="padding:30px 0">Aún no hay suficientes datos. Sigue registrando y aquí verás tu progreso.</div>';
  const W = 320, H = 140, pad = 8;
  const ys = points.map(p => p.y), min = Math.min(...ys), max = Math.max(...ys), span = (max - min) || 1;
  const X = i => pad + i * (W - pad * 2) / (points.length - 1);
  const Y = v => H - 18 - (v - min) / span * (H - 40);
  const pts = points.map((p, i) => X(i) + ',' + Y(p.y)).join(' ');
  const last = points[points.length - 1];
  const lbls = [0, Math.floor((points.length - 1) / 2), points.length - 1].filter((v, i, a) => a.indexOf(v) === i);
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
    <line x1="0" y1="${H - 18}" x2="${W}" y2="${H - 18}" stroke="var(--line)"/>
    <polyline fill="none" stroke="var(--ac)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" points="${pts}" vector-effect="non-scaling-stroke"/>
    <circle cx="${X(points.length - 1)}" cy="${Y(last.y)}" r="4.5" fill="var(--ac)"/>
    ${lbls.map(i => `<text x="${X(i)}" y="${H - 3}" fill="var(--mu)" font-size="10" text-anchor="${i === 0 ? 'start' : i === points.length - 1 ? 'end' : 'middle'}">${esc(points[i].x)}</text>`).join('')}
    <text x="${W - 4}" y="${Math.max(12, Y(last.y) - 9)}" fill="var(--tx)" font-size="11" text-anchor="end" font-weight="600">${esc(opts.fmt ? opts.fmt(last.y) : fmt(last.y))}</text>
  </svg>`;
}

// ---- Tono de los mensajes ----
function tone(p) { return TONE[p.settings.tone] || TONE.amable; }
function greeting(p) {
  const h = new Date().getHours(), T = tone(p);
  const g = p.settings.tone === 'sargento' ? T.hello[new Date().getDate() % 3] : T.hello[h < 12 ? 0 : h < 19 ? 1 : 2];
  return g + ', ' + p.name;
}
function quoteOfDay(p, offset = 0) {
  const list = QUOTES.concat(p.settings.quotes || []);
  const day = Math.floor(Date.now() / 864e5);
  return list[(day + offset) % list.length];
}
function download(blob, name) {
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}
function unitW(p) { return p.settings.units; }
