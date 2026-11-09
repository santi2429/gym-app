// Avatar animado de ejercicios: figura 2D con cinemática inversa.
// Ángulos: 0 = abajo, 90 = adelante (derecha), 180 = arriba, 270 = atrás.
// Cada postura: t (torso), H1/H2 (mano respecto al hombro), F1/F2 (tobillo respecto a la cadera),
// eb/kb (lado al que se doblan codo/rodilla), ft1/ft2 (ángulo del pie). v:'f' = vista de frente.
const BL = { t: 46, n: 6, hr: 8.5, ua: 27, fa: 25, th: 38, sh: 37, ft: 13 };
const dv = a => [Math.sin(a * Math.PI / 180), Math.cos(a * Math.PI / 180)];
const ad = (p, v, s = 1) => [p[0] + v[0] * s, p[1] + v[1] * s];
function ik(s, t, l1, l2, b) {
  const dx = t[0] - s[0], dy = t[1] - s[1], d = Math.hypot(dx, dy) || .001;
  const dd = Math.min(l1 + l2 - .01, Math.max(Math.abs(l1 - l2) + .01, d));
  const ux = dx / d, uy = dy / d;
  const a = Math.acos((l1 * l1 + dd * dd - l2 * l2) / (2 * l1 * dd)) * b, c = Math.cos(a), si = Math.sin(a);
  return [[s[0] + (ux * c - uy * si) * l1, s[1] + (ux * si + uy * c) * l1], [s[0] + ux * dd, s[1] + uy * dd]];
}
function rigPose(P, sp) {
  const fr = sp.v === 'f', hip = [0, 0], sh = ad(hip, dv(P.t), sp.tl || BL.t), hd = ad(sh, dv(P.hd ?? P.t), BL.n + BL.hr);
  const S1 = fr ? ad(sh, [13, 0]) : sh, S2 = fr ? ad(sh, [-13, 0]) : sh, P1 = fr ? [7, 0] : hip, P2 = fr ? [-7, 0] : hip;
  const H2 = P.H2 || P.H1, F2 = P.F2 || P.F1, mx = v => fr ? [-v[0], v[1]] : v;
  const eb = P.eb ?? 1, kb = P.kb ?? -1, eb2 = P.eb2 ?? eb, kb2 = P.kb2 ?? kb;
  const [e1, h1] = ik(S1, ad(S1, P.H1), BL.ua, BL.fa, eb), [e2, h2] = ik(S2, ad(S2, mx(H2)), BL.ua, BL.fa, fr ? -eb2 : eb2);
  const [k1, an1] = ik(P1, ad(P1, P.F1), BL.th, BL.sh, kb), [k2, an2] = ik(P2, ad(P2, mx(F2)), BL.th, BL.sh, fr ? -kb2 : kb2);
  const f1 = P.ft1 ?? 90, f2 = P.ft2 ?? f1;
  const toe1 = ad(an1, dv(fr ? 150 : f1), fr ? 7 : BL.ft), toe2 = ad(an2, dv(fr ? -150 : f2), fr ? 7 : BL.ft);
  return { hip, sh, hd, S1, S2, P1, P2, e1, h1, e2, h2, k1, an1, k2, an2, toe1, toe2, hm: [(h1[0] + h2[0]) / 2, (h1[1] + h2[1]) / 2] };
}
function placePose(P, sp) {
  const J = rigPose(P, sp), [k, x, y] = sp.anc || ['an1', 100, 160], o = J[k], dx = x - o[0], dy = y - o[1];
  for (const n in J) J[n] = [J[n][0] + dx, J[n][1] + dy];
  return J;
}
function lerpPose(A, B, u) {
  const o = {};
  for (const k of new Set([...Object.keys(A), ...Object.keys(B)])) {
    const a = A[k] ?? B[k], b = B[k] ?? A[k];
    o[k] = Array.isArray(a) ? a.map((v, i) => v + (b[i] - v) * u) : typeof a === 'number' ? a + (b - a) * u : a;
  }
  return o;
}
const AV = { body: '#d9dde2', far: '#7d848d', eq: '#4b5058', floor: '#2e2828' };
function ln(a, b, w, c, op = '') { return `<line x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"${op}/>`; }
function cir(p, r, f, s = '', sw = 0) { return `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${r}" fill="${f}"${s ? ` stroke="${s}" stroke-width="${sw}"` : ''}/>`; }
function eqPt(J, r, dx = 0, dy = 0) { const p = typeof r === 'string' ? J[r] : r; return [p[0] + dx, p[1] + dy]; }
const FRONT_EQ = new Set(['bb', 'db', 'grip', 'wheel', 'pad']);
function drawEq(J, eq, front) {
  let s = '';
  for (const e of eq || []) {
    if (FRONT_EQ.has(e[0]) !== front) continue;
    switch (e[0]) {
      case 'ln': s += ln([e[1], e[2]], [e[3], e[4]], e[5] || 5, AV.eq); break;
      case 'box': s += `<rect x="${e[1]}" y="${e[2]}" width="${e[3]}" height="${e[4]}" rx="3" fill="${AV.eq}"/>`; break;
      case 'seg': { const a = eqPt(J, e[1], e[3], e[4]), b = eqPt(J, e[2], e[3], e[4]), L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, u = [(b[0] - a[0]) / L, (b[1] - a[1]) / L], x = e[6] || 0; s += ln(ad(a, u, -x), ad(b, u, x), e[5] || 8, AV.eq); break; }
      case 'cab': { const p = [e[1], e[2]]; s += ln(p, eqPt(J, e[3]), 1.6, '#8a9099') + cir(p, 5, 'none', AV.eq, 3); break; }
      case 'rope': s += ln(eqPt(J, e[1]), eqPt(J, e[2]), 2.2, '#8a9099'); break;
      case 'bar': { const a = J[e[1]], b = J[e[2]], x = e[3] || 0, d = a[0] > b[0] ? 1 : -1; s += ln([a[0] + x * d, a[1]], [b[0] - x * d, b[1]], 4, AV.eq); break; }
      case 'bb': case 'bbk': { const p = eqPt(J, e[1], e[2], e[3]); s += cir(p, 11.5, '#33373e', 'var(--ac)', 2.5) + cir(p, 3, 'var(--ac)'); break; }
      case 'db': { const p = eqPt(J, e[1], e[2], e[3]); s += cir(p, 6.5, '#33373e', 'var(--ac)', 2.2); break; }
      case 'wheel': { const p = eqPt(J, e[1], e[2], e[3]); s += cir(p, 9, 'none', 'var(--ac)', 3.5) + cir(p, 2.5, 'var(--ac)'); break; }
      case 'grip': s += cir(eqPt(J, e[1]), 4, AV.eq, '#0d0b0b', 1); break;
      case 'pad': s += cir(eqPt(J, e[1], e[2], e[3]), e[4] || 6, AV.eq); break;
    }
  }
  return s;
}
function drawBody(J, sp) {
  const fr = sp.v === 'f', B = AV.body, F = AV.far;
  let s = '';
  // extremidades del fondo
  s += ln(J.P2, J.k2, 10, F) + ln(J.k2, J.an2, 8.5, F) + ln(J.an2, J.toe2, 5.5, F);
  s += ln(J.S2, J.e2, 8, F) + ln(J.e2, J.h2, 7, F);
  // tronco y cabeza
  if (fr) s += ln(J.P2, J.P1, 12, B) + ln(ad(J.hip, [0, -2]), ad(J.sh, [0, 4]), 22, B) + ln(J.S2, J.S1, 10, B);
  else s += ln(J.hip, J.sh, 14, B);
  s += ln(J.sh, ad(J.sh, [(J.hd[0] - J.sh[0]) * .35, (J.hd[1] - J.sh[1]) * .35]), 6, B) + cir(J.hd, BL.hr, B);
  // extremidades del frente
  s += ln(J.P1, J.k1, 11, B) + ln(J.k1, J.an1, 9, B) + ln(J.an1, J.toe1, 6, B);
  s += ln(J.S1, J.e1, 8.5, B) + ln(J.e1, J.h1, 7.5, B);
  return s;
}
function animBox(sp) {
  const pts = [];
  [0, .5, 1].forEach(u => { const J = placePose(lerpPose(sp.A, sp.B, u), sp); for (const k in J) pts.push(J[k]); });
  (sp.eq || []).forEach(e => { if (e[0] === 'ln') pts.push([e[1], e[2]], [e[3], e[4]]); if (e[0] === 'box') pts.push([e[1], e[2]], [e[1] + e[3], e[2] + e[4]]); if (e[0] === 'cab') pts.push([e[1], e[2]]); });
  let x0 = Math.min(...pts.map(p => p[0])) - 16, x1 = Math.max(...pts.map(p => p[0])) + 16, y0 = Math.min(...pts.map(p => p[1])) - 16, y1 = Math.max(...pts.map(p => p[1])) + 14;
  const fl = floorY(sp); if (fl) y1 = Math.max(y1, fl + 8);
  const w = x1 - x0, h = y1 - y0, W = Math.max(w, h * 1.25), H = Math.max(h, W / 1.9);
  return [x0 - (W - w) / 2, y0 - (H - h) / 2, W, H];
}
function floorY(sp) {
  if (sp.fl === 0) return 0;
  if (typeof sp.fl === 'number') return sp.fl;
  const keys = sp.fl || ['toe1', 'an1'];
  let m = -1e9;
  [0, 1].forEach(u => { const J = placePose(u ? sp.B : sp.A, sp); keys.forEach(k => m = Math.max(m, J[k][1])); });
  return m + 4;
}
function animFrame(sp, u, box) {
  const J = placePose(lerpPose(sp.A, sp.B, u), sp), fl = sp._fl;
  return (fl ? ln([box[0] - 20, fl], [box[0] + box[2] + 20, fl], 2, AV.floor) : '') + drawEq(J, sp.eq, false) + drawBody(J, sp) + drawEq(J, sp.eq, true);
}
function animSpec(id) {
  const raw = (typeof ANIMS !== 'undefined' && ANIMS[id]) || ANIMS._default;
  const sp = Object.assign({}, raw);
  sp.A = Object.assign({}, raw.base || {}, raw.A); sp.B = Object.assign({}, raw.base || {}, raw.B || raw.A);
  sp._fl = floorY(sp);
  return sp;
}
function animSVG(id, u = 0) {
  const sp = animSpec(id), box = animBox(sp);
  return `<svg viewBox="${box.map(v => v.toFixed(1)).join(' ')}" preserveAspectRatio="xMidYMid meet" style="width:100%;height:100%;display:block">${animFrame(sp, u, box)}</svg>`;
}
function playAnim(el, id) {
  if (!el) return;
  const sp = animSpec(id), box = animBox(sp), dur = sp.dur || 2600, t0 = performance.now();
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', box.map(v => v.toFixed(1)).join(' '));
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  svg.style.cssText = 'width:100%;height:100%;display:block';
  el.innerHTML = ''; el.appendChild(svg);
  let last = 0;
  const step = now => {
    if (!el.isConnected) return;
    if (now - last > 30) {
      last = now;
      const ph = ((now - t0) % dur) / dur;
      // ida (40 %), pausa (10 %), vuelta (40 %), pausa (10 %)
      const x = ph < .4 ? ph / .4 : ph < .5 ? 1 : ph < .9 ? 1 - (ph - .5) / .4 : 0;
      svg.innerHTML = animFrame(sp, (1 - Math.cos(Math.PI * x)) / 2, box);
    }
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
