// ====== Motor de reglas: rutinas, progresión, XP y logros ======
// Basado en recomendaciones con evidencia (ver FUENTES.md):
// - 10 a 20 series semanales por músculo, cada músculo 2 veces por semana.
// - Hipertrofia en rangos amplios (6-15+) cerca del fallo (1-3 repeticiones en reserva).
// - Descansos largos (2 min) en compuestos rinden más que descansos cortos.
// - Ejercicios con énfasis en la posición estirada (curl inclinado, extensión sobre la cabeza,
//   curl femoral sentado, gemelo con pausa abajo).
// - Sobrecarga progresiva: subir carga cuando se completa el rango de repeticiones.
// - Descarga cada 4-6 semanas.

const EXD = {}; EX.forEach(e => EXD[e.id] = e);

const TEMPLATES = {
  fbA:{n:'Cuerpo completo A',f:['cuad','pecho','espalda'],s:[['cuad','c'],['pecho','h'],['espalda','v'],['femoral','h'],['hombros','l'],['triceps','o'],['biceps','i'],['abdomen']]},
  fbB:{n:'Cuerpo completo B',f:['femoral','pecho','espalda'],s:[['femoral','h'],['pecho','s'],['espalda','h'],['cuad','u'],['hombros','p'],['biceps','i'],['triceps'],['pantorrilla']]},
  fbC:{n:'Cuerpo completo C',f:['cuad','pecho','espalda'],s:[['cuad','c'],['espalda','v'],['pecho','h'],['gluteos','h'],['hombros','r'],['triceps','o'],['biceps'],['abdomen']]},
  push:{n:'Empuje',f:['pecho','hombros','triceps'],s:[['pecho','h'],['pecho','s'],['hombros','l'],['triceps','o'],['hombros','p'],['pecho','i'],['triceps','p'],['hombros','l']]},
  pull:{n:'Tirón',f:['espalda','biceps'],s:[['espalda','v'],['espalda','h'],['biceps','i'],['hombros','r'],['espalda','h'],['biceps'],['espalda','i'],['abdomen']]},
  legs:{n:'Pierna',f:['cuad','femoral','gluteos'],s:[['cuad','c'],['femoral','h'],['cuad','i'],['femoral','k'],['gluteos','h'],['pantorrilla'],['cuad','u'],['abdomen']]},
  upper:{n:'Torso',f:['pecho','espalda','hombros'],s:[['pecho','h'],['espalda','v'],['pecho','s'],['espalda','h'],['hombros','l'],['triceps','o'],['biceps','i'],['hombros','r']]},
  lower:{n:'Pierna',f:['cuad','femoral','gluteos'],s:[['cuad','c'],['femoral','h'],['cuad','i'],['femoral','k'],['gluteos','h'],['pantorrilla'],['cuad','u'],['abdomen']]},
  lowerB:{n:'Pierna y glúteo',f:['femoral','gluteos','cuad'],s:[['femoral','h'],['cuad','u'],['gluteos','h'],['femoral','k'],['cuad','i'],['pantorrilla'],['gluteos','a'],['abdomen']]},
  arms:{n:'Hombro y brazos',f:['hombros','biceps','triceps'],s:[['hombros','p'],['hombros','l'],['biceps','i'],['triceps','o'],['biceps'],['triceps','p'],['hombros','r'],['abdomen']]},
};
const SPLITS = {
  2:{p:['fbA','fbB'],i:['fbA','fbB'],a:['fbA','fbB']},
  3:{p:['fbA','fbB','fbC'],i:['fbA','fbB','fbC'],a:['push','pull','legs']},
  4:{p:['upper','lower','upper','lowerB'],i:['upper','lower','upper','lowerB'],a:['upper','lower','upper','lowerB']},
  5:{p:['upper','lower','push','pull','legs'],i:['upper','lower','push','pull','legs'],a:['push','pull','legs','upper','lowerB']},
  6:{p:['push','pull','legs','push','pull','lowerB'],i:['push','pull','legs','push','pull','lowerB'],a:['push','pull','legs','push','pull','lowerB']},
};
const DEFAULT_WD = {2:[1,4],3:[1,3,5],4:[1,2,4,5],5:[1,2,3,4,5],6:[1,2,3,4,5,6]};
const LOWER = ['cuad','femoral','gluteos','pantorrilla'];

// Parámetros por objetivo: [series, repMin, repMax, descanso s] para compuestos (c) y aislamientos (i)
function params(goal, kind, level, firstCompound) {
  const P = {
    musculo:{c:[3,6,10,120],i:[3,10,15,90]},
    fuerza:{c:[4,3,6,180],i:[3,8,12,90]},
    grasa:{c:[3,8,12,90],i:[3,12,15,60]},
    resis:{c:[3,12,15,60],i:[2,15,20,45]},
    salud:{c:[3,8,12,90],i:[2,10,15,60]},
  }[goal || 'musculo'];
  let [sets, lo, hi, rest] = P[kind] || P.i;
  if (goal === 'fuerza' && kind === 'c' && !firstCompound) { sets = 3; lo = 5; hi = 8; rest = 150; }
  if (level === 'a' && kind === 'c' && firstCompound) sets += 1;
  if (level === 'p') sets = Math.max(2, sets - 1);
  return { sets, lo, hi, rest };
}

// ---- Lectura del texto libre "Cuéntame lo que quieres" (por palabras clave) ----
const NOTE_RULES = {
  pri:[[/brazo|b[ií]ceps|tr[ií]ceps/,'Brazos'],[/pecho|pectoral/,'Pecho'],[/espalda(?! baja)|dorsal/,'Espalda'],[/hombro(?!.{0,25}(duele|dolor|molest|lesi))/,'Hombros'],[/pierna|cu[aá]dricep|muslo/,'Pierna'],[/gl[uú]te|cola|nalga/,'Glúteos'],[/abdom|six ?pack|cuadritos|core|barriga plana/,'Abdomen']],
  lim:[[/rodilla/,'r'],[/espalda baja|lumbar|ci[aá]tic|hernia/,'e'],[/hombro.{0,25}(duele|dolor|molest|lesi)|(duele|dolor|molest|lesi).{0,25}hombro/,'h'],[/mu[ñn]eca/,'m'],[/cuello|cervical/,'n']],
  ex:[[/sentadilla/,['sentadilla','sentadilla_goblet','sentadilla_corporal']],[/peso muerto/,['peso_muerto_rumano']],[/dominada/,['dominadas']],[/fondo/,['fondos','fondos_banco']],[/zancada|estocada/,['zancadas']],[/banca/,['press_banca']],[/b[uú]lgara/,['bulgara']],[/hip thrust|empuje de cadera/,['hip_thrust']],[/flexion|lagartija/,['flexiones','flexiones_incl','flexiones_diamante']],[/plancha/,['plancha']],[/prensa/,['prensa']],[/n[oó]rdico/,['curl_nordico']]],
};
function parseNotes(text) {
  const t = (text || '').toLowerCase();
  const out = { pri: [], lim: [], dislike: [], prefer: null, short: false, tags: [] };
  if (!t.trim()) return out;
  const clauses = t.split(/[.,;\n]| pero | y /);
  NOTE_RULES.lim.forEach(([re, c]) => { if (re.test(t)) { out.lim.push(c); out.tags.push(['ti-shield', 'Cuidar ' + LIM_LIST.find(l => l[0] === c)[1].toLowerCase()]); } });
  const neg = /no me gusta|odio|detesto|sin |evit|no quiero|no puedo|no hago|quita/;
  NOTE_RULES.ex.forEach(([re, ids]) => {
    clauses.forEach(cl => { if (re.test(cl) && neg.test(cl)) { ids.forEach(i => { if (!out.dislike.includes(i)) out.dislike.push(i); }); } });
  });
  if (out.dislike.length) out.tags.push(['ti-x', 'Quitar ' + [...new Set(out.dislike.map(i => EXD[i].n.split(' ')[0].toLowerCase()))].join(', ')]);
  NOTE_RULES.pri.forEach(([re, p]) => {
    clauses.forEach(cl => { if (re.test(cl) && /m[aá]s|grande|crecer|mejorar|quiero|priori|enfoc|marcad|tonific|fuerte|ancho/.test(cl) && !neg.test(cl) && !out.pri.includes(p)) out.pri.push(p); });
  });
  out.pri.forEach(p => out.tags.push(['ti-arrow-up', 'Prioridad: ' + p.toLowerCase()]));
  if (/m[aá]quina/.test(t) && !/no.{0,15}m[aá]quina/.test(t)) { out.prefer = 'm'; out.tags.push(['ti-check', 'Preferir máquinas']); }
  else if (/mancuerna|peso libre|barra/.test(t) && !/no.{0,15}(mancuerna|barra)/.test(t)) { out.prefer = 'l'; out.tags.push(['ti-check', 'Preferir peso libre']); }
  if (/poco tiempo|r[aá]pid|corto|sin tiempo|afán/.test(t)) { out.short = true; out.tags.push(['ti-clock', 'Sesiones más cortas']); }
  return out;
}

// ---- Generar rutina ----
function generatePlan(p) {
  const notes = parseNotes(p.notes); notes.level = p.level;
  const lims = [...new Set([...(p.limits || []), ...notes.lim])];
  const pris =[...new Set([...(p.priorities || []), ...notes.pri])].slice(0, 4);
  const priGroups = pris.flatMap(x => PRI_MAP[x] || []);
  const days = Math.min(6, Math.max(2, p.days || 3));
  const keys = SPLITS[days][p.level || 'i'];
  let minutes = p.minutes || 60; if (notes.short) minutes = Math.max(25, minutes - 15);
  let nEx = Math.round((minutes - 8) / 8.5); nEx = Math.max(3, Math.min(8, nEx));
  const used = {}; // variedad: cuántas veces se ha usado cada ejercicio en la semana
  const wds = (p.wds && p.wds.length === days) ? p.wds.slice().sort() : DEFAULT_WD[days];
  const plan = { created: today(), cycleStart: (p.plan && p.plan.cycleStart) || today(), deloadEvery: 5, days: [] };
  keys.forEach((k, di) => {
    const T = TEMPLATES[k];
    // Base del día: los primeros slots del modelo (los básicos del día van primero y se protegen)
    let slots = T.s.slice(0, nEx).map(s => s.slice());
    const prot = new Set([0, 1]);
    T.f.forEach(g => { const i = slots.findIndex(s => s[0] === g); if (i >= 0) prot.add(i); });
    // Prioridades: como mucho 2 cambios por día, reemplazando slots secundarios (sin desbalancear el día)
    let budget = 2;
    priGroups.forEach(g => {
      if (budget <= 0 || !T.s.some(s => s[0] === g)) return;
      const have = slots.filter(s => s[0] === g).length;
      if (have === 0 || (have === 1 && nEx >= 5)) {
        let done = false;
        for (let i = slots.length - 1; i >= 3; i--) {
          if (!prot.has(i) && !priGroups.includes(slots[i][0]) && !T.f.includes(slots[i][0])) { slots[i] = [g]; prot.add(i); budget--; done = true; break; }
        }
        if (!done && slots.length <= nEx) { slots.push([g]); prot.add(slots.length - 1); budget--; }
      }
    });
    const dayEx = [];
    let firstC = true;
    slots.forEach(([g, sub]) => {
      const ex = pickExercise(g, sub, p.place || 'g', lims, notes, dayEx, used);
      if (!ex) return;
      used[ex.id] = (used[ex.id] || 0) + 1;
      const pr = params(p.goal, ex.k, p.level, ex.k === 'c' && firstC);
      if (ex.k === 'c') firstC = false;
      if (priGroups.includes(g)) pr.sets += 1;
      pr.sets = Math.min(5, pr.sets);
      dayEx.push({ id: ex.id, sets: pr.sets, lo: pr.lo, hi: pr.hi, rest: pr.rest });
    });
    let name = T.n;
    if (lims.includes('r') && LOWER.includes(TEMPLATES[k].f[0])) name += ' (cuidando rodilla)';
    plan.days.push({ key: k, name, wd: wds[di], focus: T.f, ex: dayEx });
  });
  plan.cardio = p.goal === 'grasa' ? 'Termina con 10-15 min de cardio (bici, elíptica o caminar inclinado).' : (p.goal === 'resis' ? 'Termina con 15-20 min de cardio a ritmo constante.' : '');
  plan.notesTags = notes.tags;
  return plan;
}

function pickExercise(g, sub, place, lims, notes, dayEx, used, exclude) {
  let c = EX.filter(e => e.g === g && e.e.includes(place) && !lims.some(l => e.av.includes(l)) && !notes.dislike.includes(e.id) && !dayEx.some(d => d.id === e.id) && e.id !== exclude);
  if (!c.length) c = EX.filter(e => e.g === g && e.e.includes(place) && !dayEx.some(d => d.id === e.id) && e.id !== exclude && !lims.some(l => e.av.includes(l)));
  if (!c.length) return null;
  const score = e => e.t * 10 + (sub && e.s === sub ? 15 : 0) + (notes.prefer === 'm' && e.m ? 6 : 0) + (notes.prefer === 'l' && !e.m ? 6 : 0) - (used[e.id] || 0) * 12
    - (e.bw && place !== 'b' ? 20 : 0) - (e.d && notes.level === 'p' ? 18 : 0);
  c.sort((a, b) => score(b) - score(a));
  return c[0];
}

function alternatives(exId, p) {
  const e = EXD[exId]; const notes = parseNotes(p.notes);
  const lims = [...new Set([...(p.limits || []), ...notes.lim])];
  return EX.filter(x => x.g === e.g && x.id !== exId && x.e.includes(p.place || 'g') && !lims.some(l => x.av.includes(l)))
    .sort((a, b) => (b.s === e.s) - (a.s === e.s) || b.t - a.t);
}

// ---- Semana del ciclo y descarga ----
function cycleWeek(p) {
  if (!p.plan) return 1;
  const w = Math.floor(Math.max(0, daysBetween(p.plan.cycleStart, today())) / 7);
  return (w % p.plan.deloadEvery) + 1;
}
function isDeload(p) { return p.plan && cycleWeek(p) === p.plan.deloadEvery; }

// ---- Historial y progresión ----
function lastSessionFor(p, exId, beforeId) {
  for (let i = p.history.length - 1; i >= 0; i--) {
    const h = p.history[i]; if (h.id === beforeId) continue;
    const sets = h.sets.filter(s => s.ex === exId && s.done);
    if (sets.length) return { date: h.date, sets, mood: h.mood };
  }
  return null;
}
function weightInc(exId, units) {
  const e = EXD[exId]; const big = e.k === 'c' && LOWER.includes(e.g);
  if (units === 'lb') return big ? 10 : (e.k === 'c' ? 5 : 2.5);
  return big ? 5 : (e.k === 'c' ? 2.5 : 1);
}
function roundW(w, units) { const step = units === 'lb' ? 2.5 : 0.5; return Math.round(w / step) * step; }

// Sugerencia de carga para hoy
function suggest(p, item) {
  const units = p.settings.units; const last = lastSessionFor(p, item.id);
  const deload = isDeload(p);
  if (!last) return { w: '', r: item.hi, msg: 'Primera vez: elige un peso con el que llegues a ' + item.hi + ' repeticiones dejando 2 en reserva.', kind: 'new' };
  const maxW = Math.max(...last.sets.map(s => +s.w || 0));
  const top = last.sets.filter(s => (+s.w || 0) === maxW);
  const allHit = top.length >= Math.min(item.sets, last.sets.length) && top.every(s => +s.r >= item.hi);
  const avg = top.reduce((a, s) => a + (+s.r), 0) / top.length;
  const missed = top.some(s => +s.r < item.lo);
  if (deload) return { w: maxW ? roundW(maxW * 0.65, units) : '', r: item.lo, msg: 'Semana de descarga: usa ' + (maxW ? roundW(maxW * 0.65, units) + ' ' + units : 'menos repeticiones') + ' y no llegues al fallo.', kind: 'deload' };
  if (!maxW) { // peso corporal
    if (allHit) return { w: '', r: item.hi + 2, msg: 'Llegaste al tope. Intenta ' + (item.hi + 2) + ' reps o baja más lento (3 s).', kind: 'up' };
    return { w: '', r: Math.min(item.hi, Math.round(avg) + 1), msg: 'Intenta ' + Math.min(item.hi, Math.round(avg) + 1) + ' repeticiones por serie.', kind: 'same' };
  }
  if (last.mood === 'fatal' && !allHit) return { w: maxW, r: item.lo, msg: 'La última vez fue muy dura: mantén ' + maxW + ' ' + units + ' y enfócate en la técnica.', kind: 'same' };
  if (allHit || (last.mood === 'brutal' && avg >= (item.lo + item.hi) / 2)) {
    const nw = roundW(maxW + weightInc(item.id, units), units);
    return { w: nw, r: item.lo, msg: 'Completaste todo. Hoy sube a ' + nw + ' ' + units + '.', kind: 'up' };
  }
  if (missed) return { w: maxW, r: item.lo, msg: 'Mantén ' + maxW + ' ' + units + ' hasta llegar a ' + item.lo + ' reps en todas las series.', kind: 'same' };
  return { w: maxW, r: Math.min(item.hi, Math.round(avg) + 1), msg: 'Mismo peso (' + maxW + ' ' + units + '), busca 1 repetición más por serie.', kind: 'same' };
}

function e1rm(w, r) { return (+w || 0) * (1 + (+r || 0) / 30); }

// ---- XP y niveles ----
function needXP(level) { return 300 + 100 * level; }
function levelInfo(xp) {
  let L = 1, rest = xp;
  while (rest >= needXP(L)) { rest -= needXP(L); L++; }
  return { level: L, cur: rest, need: needXP(L), name: LEVEL_NAMES[Math.min(LEVEL_NAMES.length - 1, L - 1)], next: LEVEL_NAMES[Math.min(LEVEL_NAMES.length - 1, L)] };
}

// ---- Rachas ----
function trainedSet(p) { const s = new Set(); p.history.forEach(h => s.add(h.date)); return s; }
function plannedWd(p) { return new Set((p.plan ? p.plan.days : []).map(d => d.wd)); }
function streak(p) {
  if (!p.history.length) return 0;
  const tr = trainedSet(p), pw = plannedWd(p), start = p.history[0].date, t = today();
  let n = 0, d = t;
  while (d >= start) {
    const planned = pw.has(parseD(d).getDay());
    if (planned && !tr.has(d) && d !== t) break;
    n++; d = addDays(d, -1);
  }
  return n;
}
function bestStreak(p) {
  if (!p.history.length) return 0;
  const tr = trainedSet(p), pw = plannedWd(p), t = today();
  let d = p.history[0].date, cur = 0, best = 0;
  while (d <= t) {
    const planned = pw.has(parseD(d).getDay());
    if (planned && !tr.has(d) && d !== t) cur = 0; else cur++;
    best = Math.max(best, cur); d = addDays(d, 1);
  }
  return best;
}
function weekStart(s) { const d = parseD(s); const k = (d.getDay() + 6) % 7; return addDays(s, -k); }
function weekDone(p, ref) { const ws = weekStart(ref || today()); return p.history.filter(h => h.date >= ws && h.date <= addDays(ws, 6)).length; }
function perfectWeeks(p) {
  if (!p.history.length || !p.plan) return 0;
  let n = 0, ws = weekStart(p.history[0].date); const cur = weekStart(today());
  while (ws < cur) { if (weekDone(p, ws) >= p.plan.days.length) n++; ws = addDays(ws, 7); }
  return n;
}

// ---- Estadísticas y logros ----
function stats(p) {
  const L = levelInfo(p.xp);
  return {
    workouts: p.history.length, bestStreak: bestStreak(p),
    prs: p.history.reduce((a, h) => a + (h.prs ? h.prs.length : 0), 0),
    tonnage: p.history.reduce((a, h) => a + (h.volume || 0), 0) * (p.settings.units === 'lb' ? 0.4536 : 1),
    perfectWeeks: perfectWeeks(p), photos: p.photoCount || 0,
    waterDays: Object.values(p.water).filter(v => v * 0.25 >= p.settings.waterGoal).length,
    challenges: Object.values(p.challenges).filter(Boolean).length, level: L.level,
    early: p.history.filter(h => h.startHour !== undefined && h.startHour < 7).length
  };
}
function checkAchievements(p) {
  const s = stats(p), fresh = [];
  ACHIEVEMENTS.forEach(([id, n, i, f]) => { if (!p.achievements[id] && f(s)) { p.achievements[id] = today(); fresh.push([id, n, i]); } });
  return fresh;
}

// ---- Calentamiento según el día ----
function warmup(day) {
  const lower = day.focus.some(g => LOWER.includes(g));
  const upper = day.focus.some(g => ['pecho', 'espalda', 'hombros', 'biceps', 'triceps'].includes(g));
  const w = [['ti-bike', 'Cardio suave (bici o caminadora)', '4 min']];
  if (upper) w.push(['ti-rotate-clockwise', 'Círculos y rotaciones de hombro', '2 × 15'], ['ti-arrows-horizontal', 'Aperturas con banda o sin peso', '2 × 15']);
  if (lower) w.push(['ti-stretching', 'Movilidad de cadera y tobillo', '1 min'], ['ti-arrow-down', 'Sentadilla sin peso', '2 × 10']);
  const first = day.ex[0] ? EXD[day.ex[0].id].n : 'primer ejercicio';
  w.push(['ti-barbell', 'Series de aproximación en ' + first.toLowerCase() + ' (50 % y 75 % del peso)', '2 series']);
  return w;
}

// ---- Reto del día ----
function challengeOf(date) {
  let h = 0; for (const ch of date) h = (h * 31 + ch.charCodeAt(0)) % 9973;
  return CHALLENGES[h % CHALLENGES.length];
}
function challengeAutoDone(p, ch, date) {
  if (ch.auto === 'agua') return (p.water[date] || 0) * 0.25 >= p.settings.waterGoal;
  if (ch.auto === 'sueno') return (p.sleep[date] || 0) >= 7;
  if (ch.auto === 'peso') return p.body.some(b => b.date === date && b.weight);
  if (ch.auto === 'foto') return !!p.lastPhotoDate && p.lastPhotoDate === date;
  return false;
}

// ---- Día de hoy ----
function todayPlan(p) {
  if (!p.plan) return null;
  const wd = new Date().getDay();
  const i = p.plan.days.findIndex(d => d.wd === wd);
  return i >= 0 ? { idx: i, day: p.plan.days[i] } : null;
}
function nextPlan(p) {
  if (!p.plan) return null;
  for (let k = 1; k <= 7; k++) {
    const wd = (new Date().getDay() + k) % 7; const i = p.plan.days.findIndex(d => d.wd === wd);
    if (i >= 0) return { idx: i, day: p.plan.days[i], inDays: k };
  }
  return null;
}
function estMinutes(day) { return Math.round(day.ex.reduce((a, e) => a + e.sets * (0.75 + e.rest / 60), 0) + 6); }
