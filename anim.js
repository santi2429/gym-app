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
  const sj = ad(sh, dv(P.t), fr ? -5 : -7);
  const S1 = fr ? ad(sj, [14, 0]) : sj, S2 = fr ? ad(sj, [-14, 0]) : sj, P1 = fr ? [7, 0] : hip, P2 = fr ? [-7, 0] : hip;
  // rel: manos medidas respecto al tronco (giran con él), p. ej. barra apoyada en la espalda
  const rot = v => { if (!(P.rel || sp.rel)) return v; const d = (P.t - 180) * Math.PI / 180, c = Math.cos(d), s = Math.sin(d); return [v[0] * c + v[1] * s, v[1] * c - v[0] * s]; };
  const H2 = rot(P.H2 || P.H1), F2 = P.F2 || P.F1, mx = v => fr ? [-v[0], v[1]] : v;
  P = Object.assign({}, P, { H1: rot(P.H1) });
  const eb = P.eb ?? 1, kb = P.kb ?? -1, eb2 = P.eb2 ?? eb, kb2 = P.kb2 ?? kb;
  const [e1, h1] = ik(S1, ad(S1, P.H1), BL.ua, BL.fa, eb), [e2, h2] = ik(S2, ad(S2, mx(H2)), BL.ua, BL.fa, fr ? -eb2 : eb2);
  const [k1, an1] = ik(P1, ad(P1, P.F1), BL.th, BL.sh, kb), [k2, an2] = ik(P2, ad(P2, mx(F2)), BL.th, BL.sh, fr ? -kb2 : kb2);
  const f1 = P.ft1 ?? 90, f2 = P.ft2 ?? f1;
  const toe1 = ad(an1, dv(fr ? 150 : f1), fr ? 7 : BL.ft), toe2 = ad(an2, dv(fr ? -150 : f2), fr ? 7 : BL.ft);
  return { hip, sh, hd, S1, S2, P1, P2, e1, h1, e2, h2, k1, an1, k2, an2, toe1, toe2, hm: [(h1[0] + h2[0]) / 2, (h1[1] + h2[1]) / 2] };
}
function anchorJ(J, sp) {
  const [k, x, y] = sp.anc || ['an1', 100, 160], o = J[k], dx = x - o[0], dy = y - o[1];
  for (const n in J) J[n] = [J[n][0] + dx, J[n][1] + dy];
  return J;
}
function placePose(P, sp) { return anchorJ(rigPose(P, sp), sp); }
// Postura intermedia natural: se interpolan los ÁNGULOS de cada articulación (los huesos giran, no se deslizan)
const angOf = (a, b) => Math.atan2(b[0] - a[0], b[1] - a[1]);
const lerpAng = (a, b, u) => { let d = b - a; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return a + d * u; };
function poseAt(sp, u) {
  if (!sp._JA) { sp._JA = rigPose(sp.A, sp); sp._JB = rigPose(sp.B, sp); }
  const A = sp._JA, B = sp._JB, fr = sp.v === 'f', L = (a, b) => a + (b - a) * u;
  const t = L(sp.A.t ?? 180, sp.B.t ?? 180), hdA = L(sp.A.hd ?? sp.A.t ?? 180, sp.B.hd ?? sp.B.t ?? 180);
  const hip = [0, 0], sh = ad(hip, dv(t), sp.tl || BL.t), hd = ad(sh, dv(hdA), BL.n + BL.hr), sj = ad(sh, dv(t), fr ? -5 : -7);
  const J = { hip, sh, hd, S1: fr ? ad(sj, [14, 0]) : sj, S2: fr ? ad(sj, [-14, 0]) : sj, P1: fr ? [7, 0] : hip, P2: fr ? [-7, 0] : hip };
  const chain = (root, mid, end, l1, l2) => {
    const a1 = lerpAng(angOf(A[root], A[mid]), angOf(B[root], B[mid]), u), a2 = lerpAng(angOf(A[mid], A[end]), angOf(B[mid], B[end]), u);
    J[mid] = [J[root][0] + Math.sin(a1) * l1, J[root][1] + Math.cos(a1) * l1];
    J[end] = [J[mid][0] + Math.sin(a2) * l2, J[mid][1] + Math.cos(a2) * l2];
  };
  chain('S1', 'e1', 'h1', BL.ua, BL.fa); chain('S2', 'e2', 'h2', BL.ua, BL.fa);
  chain('P1', 'k1', 'an1', BL.th, BL.sh); chain('P2', 'k2', 'an2', BL.th, BL.sh);
  const fl = fr ? 7 : BL.ft;
  [['an1', 'toe1'], ['an2', 'toe2']].forEach(([a, b]) => { const g = lerpAng(angOf(A[a], A[b]), angOf(B[a], B[b]), u); J[b] = [J[a][0] + Math.sin(g) * fl, J[a][1] + Math.cos(g) * fl]; });
  J.hm = [(J.h1[0] + J.h2[0]) / 2, (J.h1[1] + J.h2[1]) / 2];
  return anchorJ(J, sp);
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
      case 'bb': case 'bbk': { const p = eqPt(J, e[1], e[2], e[3]); s += cir(p, e[4] || 14, '#33373e', 'var(--ac)', 2.5) + cir(p, (e[4] || 14) * .62, 'none', 'rgba(255,255,255,.12)', 1.2) + cir(p, 3, 'var(--ac)'); break; }
      case 'db': { const p = eqPt(J, e[1], e[2], e[3]); s += cir(p, 6.5, '#33373e', 'var(--ac)', 2.2); break; }
      case 'wheel': { const p = eqPt(J, e[1], e[2], e[3]); s += cir(p, 9, 'none', 'var(--ac)', 3.5) + cir(p, 2.5, 'var(--ac)'); break; }
      case 'grip': s += cir(eqPt(J, e[1]), 4, AV.eq, '#0d0b0b', 1); break;
      case 'pad': s += cir(eqPt(J, e[1], e[2], e[3]), e[4] || 6, AV.eq); break;
    }
  }
  return s;
}
// ---- Figura atlética: extremidades con músculo (forma de huso) y contorno para definir cada parte ----
const SK = { body: '#e2e5e9', far: '#8e959e', line: '#0d0b0b', hair: '#3b4048', sh: 'rgba(0,0,0,.13)' };
const f1 = v => v.toFixed(1);
function nrm(a, b) { const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1; return [-dy / L, dx / L]; }
// a→b con radio r0 al inicio, rm en el vientre del músculo (posición t) y r1 al final
function limb(a, b, r0, rm, r1, t, fill) {
  const n = nrm(a, b), P = (c, r, s) => [c[0] + n[0] * r * s, c[1] + n[1] * r * s];
  const m = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  const ctl = s => { const p0 = P(a, r0, s), p1 = P(b, r1, s), pm = P(m, rm, s); return [2 * pm[0] - (p0[0] + p1[0]) / 2, 2 * pm[1] - (p0[1] + p1[1]) / 2]; };
  const A0 = P(a, r0, 1), B0 = P(b, r1, 1), B1 = P(b, r1, -1), A1 = P(a, r0, -1), c1 = ctl(1), c2 = ctl(-1);
  return `<path d="M${f1(A0[0])} ${f1(A0[1])}Q${f1(c1[0])} ${f1(c1[1])} ${f1(B0[0])} ${f1(B0[1])}A${r1} ${r1} 0 0 0 ${f1(B1[0])} ${f1(B1[1])}Q${f1(c2[0])} ${f1(c2[1])} ${f1(A1[0])} ${f1(A1[1])}A${r0} ${r0} 0 0 0 ${f1(A0[0])} ${f1(A0[1])}Z" fill="${fill}" stroke="${SK.line}" stroke-width="1.5" stroke-linejoin="round"/>`;
}
// contorno suave cerrado (Catmull-Rom) a partir de puntos
function smoothPath(pts, fill) {
  const n = pts.length; let d = `M${f1(pts[0][0])} ${f1(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    d += `C${f1(p1[0] + (p2[0] - p0[0]) / 6)} ${f1(p1[1] + (p2[1] - p0[1]) / 6)} ${f1(p2[0] - (p3[0] - p1[0]) / 6)} ${f1(p2[1] - (p3[1] - p1[1]) / 6)} ${f1(p2[0])} ${f1(p2[1])}`;
  }
  return `<path d="${d}Z" fill="${fill}" stroke="${SK.line}" stroke-width="1.5" stroke-linejoin="round"/>`;
}
function torsoPts(J, fr, tl) {
  const L = Math.hypot(J.sh[0] - J.hip[0], J.sh[1] - J.hip[1]) || 1, u = [(J.sh[0] - J.hip[0]) / L, (J.sh[1] - J.hip[1]) / L], nf = [-u[1], u[0]];
  const at = (s, o) => [J.hip[0] + u[0] * L * s + nf[0] * o, J.hip[1] + u[1] * L * s + nf[1] * o];
  const k = (tl || BL.t) / BL.t;
  // perfil: [posición a lo largo del tronco, distancia al eje]; positivo = pecho/abdomen, negativo = espalda/glúteo
  const prof = fr
    ? [[-.1, 0], [-.04, 11], [.3, 10], [.55, 12], [.82, 16.5], [1, 16], [1.08, 9], [1.08, -9], [1, -16], [.82, -16.5], [.55, -12], [.3, -10], [-.04, -11]]
    : [[-.12, -2], [-.02, 9.5], [.3, 9.5], [.6, 11.5], [.8, 13.5], [.98, 9], [1.06, 2], [1.02, -8], [.8, -12], [.5, -9], [.22, -10.5], [.02, -13.5]];
  return prof.map(([s, o]) => at(s / (fr ? 1 : 1) , o * (fr ? 1 : 1) * (k < 1 ? 1 : 1)));
}
function drawBody(J, sp) {
  const fr = sp.v === 'f', B = SK.body, F = fr ? '#c9cdd2' : SK.far;
  let s = '';
  const leg = (P, k, an, toe, c) =>
    limb(P, k, 9.5, 10.5, 6.5, .38, c) + limb(an, toe, 4.2, 4.6, 3.6, .5, c) + limb(k, an, 6, 7.6, 3.8, .3, c);
  const arm = (S, e, h, c) =>
    limb(S, e, 7, 7.2, 4.8, .45, c) + limb(e, h, 5, 5.6, 3.4, .28, c) + cir(h, 4.3, c, SK.line, 1.5) + cir(S, 7.6, c, SK.line, 1.5);
  // extremidades del fondo
  s += leg(J.P2, J.k2, J.an2, J.toe2, F) + arm(J.S2, J.e2, J.h2, F);
  // cuello, tronco y cabeza
  const L = Math.hypot(J.hd[0] - J.sh[0], J.hd[1] - J.sh[1]) || 1, hu = [(J.hd[0] - J.sh[0]) / L, (J.hd[1] - J.sh[1]) / L];
  s += limb(ad(J.sh, hu, -2), ad(J.sh, hu, 9), 5, 4.8, 4.5, .5, B);
  s += smoothPath(torsoPts(J, fr, sp.tl), B);
  if (fr) {
    const at = (x, y) => [J.hip[0] + x, J.hip[1] + (J.sh[1] - J.hip[1]) * y];
    s += `<path d="M${f1(at(0, .18)[0])} ${f1(at(0, .18)[1])}L${f1(at(0, .66)[0])} ${f1(at(0, .66)[1])}M${f1(at(-12, .74)[0])} ${f1(at(-12, .7)[1])}Q${f1(at(0, .64)[0])} ${f1(at(0, .64)[1])} ${f1(at(12, .7)[0])} ${f1(at(12, .7)[1])}" fill="none" stroke="${SK.sh}" stroke-width="1.4" stroke-linecap="round"/>`;
  }
  const nf = fr ? [0, 0] : [-(J.sh[1] - J.hip[1]), J.sh[0] - J.hip[0]], nl = Math.hypot(nf[0], nf[1]) || 1;
  const hairC = fr ? ad(J.hd, hu, 1.6) : [J.hd[0] - nf[0] / nl * 1.8 + hu[0] * 1.2, J.hd[1] - nf[1] / nl * 1.8 + hu[1] * 1.2];
  s += cir(hairC, 9.4, SK.hair, SK.line, 1.5) + cir(J.hd, 8.8, B, SK.line, 1.5);
  // extremidades del frente
  s += leg(J.P1, J.k1, J.an1, J.toe1, B) + arm(J.S1, J.e1, J.h1, B);
  return s;
}
function animBox(sp) {
  const pts = [];
  [0, .5, 1].forEach(u => { const J = poseAt(sp, u); for (const k in J) pts.push(J[k]); });
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
  const J = poseAt(sp, u), fl = sp._fl;
  return (fl ? ln([box[0] - 20, fl], [box[0] + box[2] + 20, fl], 2, AV.floor) : '') + drawEq(J, sp.eq, false) + drawBody(J, sp) + drawEq(J, sp.eq, true);
}
function animSpec(id) {
  const raw = (typeof ANIMS !== 'undefined' && ANIMS[id]) || ANIMS._default;
  const sp = Object.assign({ id }, raw);
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
  const sp = animSpec(id), box = animBox(sp), t0 = performance.now();
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
      svg.innerHTML = animFrame(sp, animPhase(sp, now - t0), box);
    }
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// Ritmo natural: la fase de bajada (excéntrica) es lenta y la de subida (concéntrica) más rápida,
// con una pausa breve en cada extremo. Curva de mínimo tirón (como se mueve una persona).
const smooth5 = x => x * x * x * (10 + x * (6 * x - 15));
function animPhase(sp, ms) {
  const up = sp.up || (typeof ANIM_UP !== 'undefined' && ANIM_UP.has(sp.id));
  const slow = 1500, fast = 950, holdB = up ? 380 : 250, holdA = 450;
  const dAB = sp.dur ? sp.dur / 2 : up ? fast : slow, dBA = sp.dur ? sp.dur / 2 : up ? slow : fast;
  const T = dAB + holdB + dBA + holdA, m = ms % T;
  if (m < dAB) return smooth5(m / dAB);
  if (m < dAB + holdB) return 1;
  if (m < dAB + holdB + dBA) return 1 - smooth5((m - dAB - holdB) / dBA);
  return 0;
}