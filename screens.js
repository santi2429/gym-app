// ====== Pantallas: cuestionario, inicio, rutina, perfil ======
const SCREENS = {};

// ---------------- CUESTIONARIO INICIAL ----------------
let OB = null;
function obReset() { OB = { step: 0, d: { name: '', sex: '', age: '', weight: '', height: '', goal: '', level: '', days: 4, minutes: 60, place: '', limits: [], priorities: [] } }; }
SCREENS.onboarding = {
  full: true,
  html() {
    if (!OB) obReset();
    const s = OB.step, d = OB.d, N = 8;
    const top = `<div class="top"><button class="btn ghost" id="bk" aria-label="Atrás"><i class="ti ti-arrow-left"></i></button><div class="prog"><div style="width:${s / N * 100}%"></div></div><span class="mu">${s}/${N}</span></div>`;
    const opt = (obj, key, sub) => Object.entries(obj).map(([k, v]) => `<div class="opt ${d[key] === k ? 'on' : ''}" data-k="${key}" data-v="${k}">${sub ? '' : `<i class="ti ${v.i || v[1]}"></i>`}<div><div class="b">${esc(v.n || v[0])}</div>${sub ? `<div class="mu">${esc(v[1])}</div>` : ''}</div></div>`).join('');
    const chips = (list, key) => list.map(([v, l]) => `<span class="chip ${d[key].includes(v) ? 'on' : ''}" data-m="${key}" data-v="${v}">${esc(l)}</span>`).join('');
    const go = (label = 'Seguir') => `<div class="err" id="er"></div><button class="btn pri blk" id="nx" style="margin-top:12px">${label}</button>`;
    const V = [
      () => `<div class="center" style="padding-top:12vh"><img src="icon.svg" alt="" style="width:110px;height:110px;border-radius:26px;margin-bottom:22px"><div class="q" style="font-size:28px">Vamos a armar tu rutina</div><p class="mu" style="font-size:15px;margin:6px 0 34px">8 preguntas rápidas. Menos de un minuto.</p></div><button class="btn pri blk" id="nx">Empezar</button>${Object.keys(Store.db.profiles).length ? '<button class="btn ghost blk" id="cancel" style="margin-top:8px">Cancelar</button>' : ''}`,
      () => top + `<div class="q">¿Cómo te llamamos?</div><p class="mu" style="margin-bottom:14px">Así te saludará la app</p><input id="f_name" placeholder="Santi" value="${esc(d.name)}" autocomplete="given-name">
        <p class="mu" style="margin:14px 0 8px">Sexo</p>${[['H', 'Hombre'], ['M', 'Mujer']].map(([v, l]) => `<span class="chip ${d.sex === v ? 'on' : ''}" data-s="sex" data-v="${v}">${l}</span>`).join('')}
        <p class="mu" style="margin:8px 0 8px">Edad</p><input id="f_age" type="number" inputmode="numeric" placeholder="25" value="${esc(d.age)}">` + go(),
      () => top + `<div class="q">Tu cuerpo hoy</div><p class="mu" style="margin-bottom:14px">Para calcular tu punto de partida</p><p class="mu" style="margin-bottom:6px">Peso (kg)</p><input id="f_weight" type="number" inputmode="decimal" placeholder="72" value="${esc(d.weight)}"><p class="mu" style="margin:12px 0 6px">Estatura (cm)</p><input id="f_height" type="number" inputmode="numeric" placeholder="175" value="${esc(d.height)}">` + go(),
      () => top + `<div class="q">¿Qué quieres lograr?</div><p class="mu" style="margin-bottom:14px">Elige tu objetivo principal</p>${opt(GOALS, 'goal')}` + go(),
      () => top + `<div class="q">¿Cuánta experiencia tienes?</div><p class="mu" style="margin-bottom:14px">Sé honesto, así no te lesionas</p>${opt(LEVELS, 'level', 1)}` + go(),
      () => top + `<div class="q">¿Cuánto tiempo tienes?</div><div class="card" style="margin-top:14px"><div class="row sb"><span>Días por semana</span><b class="ac" id="dv">${d.days}</b></div><input type="range" min="2" max="6" step="1" value="${d.days}" id="f_days"></div><div class="card"><div class="row sb"><span>Minutos por sesión</span><b class="ac" id="mv">${d.minutes}</b></div><input type="range" min="30" max="120" step="5" value="${d.minutes}" id="f_minutes"></div><p class="mu">Para ganar músculo, lo ideal es trabajar cada músculo 2 veces por semana. Con 3 o más días lo logramos.</p>` + go(),
      () => top + `<div class="q">¿Dónde entrenas?</div><p class="mu" style="margin-bottom:14px">Elegimos ejercicios con lo que tienes</p>${opt(PLACES, 'place')}` + go(),
      () => top + `<div class="q">¿Algo que cuidar?</div><p class="mu" style="margin-bottom:14px">Quitamos ejercicios que te puedan hacer daño</p>${chips(LIM_LIST, 'limits')}<span class="chip ${d.limits.length === 0 && OB.noneLim ? 'on' : ''}" id="none">Ninguna</span>` + go(),
      () => top + `<div class="q">¿Qué quieres priorizar?</div><p class="mu" style="margin-bottom:14px">Hasta 3. Recibirán más trabajo.</p>${chips(PRI_LIST.map(x => [x, x]), 'priorities')}` + go('Crear mi rutina'),
      () => `<div class="center" style="padding-top:30vh"><i class="ti ti-loader-2 spin ac" style="font-size:44px"></i><div class="q">Armando tu rutina, ${esc(d.name)}…</div><p class="mu">Eligiendo los mejores ejercicios para tu objetivo</p></div>`
    ];
    return V[s]();
  },
  mount(root) {
    const d = OB.d;
    const err = m => { const e = $('#er', root); if (e) e.textContent = m; return false; };
    const val = () => {
      const s = OB.step;
      if (s === 1) { d.name = $('#f_name', root).value.trim(); d.age = $('#f_age', root).value; if (!d.name) return err('Escribe tu nombre'); if (!d.sex) return err('Elige una opción'); if (!(d.age >= 12 && d.age <= 90)) return err('Escribe una edad válida'); }
      if (s === 2) { d.weight = $('#f_weight', root).value; d.height = $('#f_height', root).value; if (!(d.weight >= 30 && d.weight <= 250)) return err('Escribe un peso válido en kg'); if (!(d.height >= 120 && d.height <= 230)) return err('Escribe tu estatura en cm'); }
      if (s === 3 && !d.goal) return err('Elige un objetivo');
      if (s === 4 && !d.level) return err('Elige tu nivel');
      if (s === 6 && !d.place) return err('Elige dónde entrenas');
      if (s === 7 && !d.limits.length && !OB.noneLim) return err('Elige una opción o "Ninguna"');
      if (s === 8 && !d.priorities.length) return err('Elige al menos una');
      return true;
    };
    const nx = $('#nx', root);
    if (nx) nx.onclick = () => {
      unlockAudio();
      if (!val()) return;
      OB.step++; render();
      if (OB.step === 9) setTimeout(finishOnboarding, 1300);
    };
    const bk = $('#bk', root); if (bk) bk.onclick = () => { if (OB.step === 1) d.name = $('#f_name', root).value.trim(); OB.step--; render(); };
    const cancel = $('#cancel', root); if (cancel) cancel.onclick = () => { OB = null; go('inicio'); };
    $$('[data-k]', root).forEach(o => o.onclick = () => { d[o.dataset.k] = o.dataset.v; $$(`[data-k="${o.dataset.k}"]`, root).forEach(x => x.classList.toggle('on', x === o)); err(''); });
    $$('[data-s]', root).forEach(o => o.onclick = () => { d[o.dataset.s] = o.dataset.v; $$(`[data-s="${o.dataset.s}"]`, root).forEach(x => x.classList.toggle('on', x === o)); err(''); });
    $$('[data-m]', root).forEach(o => o.onclick = () => {
      const k = o.dataset.m, v = o.dataset.v; let a = d[k];
      if (a.includes(v)) a = a.filter(x => x !== v); else { if (k === 'priorities' && a.length >= 3) return err('Máximo 3'); a = [...a, v]; }
      d[k] = a; if (k === 'limits') { OB.noneLim = false; const n = $('#none', root); if (n) n.classList.remove('on'); }
      o.classList.toggle('on', a.includes(v)); err('');
    });
    const none = $('#none', root); if (none) none.onclick = () => { OB.noneLim = !OB.noneLim; d.limits = []; $$('[data-m=limits]', root).forEach(x => x.classList.remove('on')); none.classList.toggle('on', OB.noneLim); err(''); };
    [['days', 'dv'], ['minutes', 'mv']].forEach(([k, o]) => { const el = $('#f_' + k, root); if (el) el.oninput = () => { d[k] = +el.value; $('#' + o, root).textContent = el.value; }; });
    $$('input', root).forEach(i => i.addEventListener('input', () => err('')));
  }
};
function finishOnboarding() {
  const d = OB.d;
  const p = Store.newProfile({ name: d.name, sex: d.sex, age: +d.age, weight: +d.weight, height: +d.height, goal: d.goal, level: d.level, days: d.days, minutes: d.minutes, place: d.place, limits: d.limits, priorities: d.priorities, notes: '' });
  p.body.push({ date: today(), weight: +d.weight });
  p.plan = generatePlan(p);
  Store.save(); OB = null; applyTheme(p);
  go('plan_listo');
}

SCREENS.plan_listo = {
  full: true,
  html(p) {
    const imc = p.weight / Math.pow(p.height / 100, 2);
    const ex0 = p.plan.days[0].ex[0], ex1 = p.plan.days[0].ex.find(e => EXD[e.id].k === 'i') || ex0;
    return `<div class="center" style="margin:10px 0 16px"><div class="mu" style="color:var(--ac-text)"><i class="ti ti-sparkles"></i> Lista</div><div class="q">Tu rutina, ${esc(p.name)}</div><p class="mu">${GOALS[p.goal].n} · ${p.days} días · ${p.minutes} min</p></div>
    <div class="grid3" style="margin-bottom:12px"><div class="stat"><div class="v">${fmt(imc)}</div><div class="mu sm">IMC</div></div><div class="stat"><div class="v">${ex0.sets}×${ex0.lo}-${ex0.hi}</div><div class="mu sm">series × reps</div></div><div class="stat"><div class="v">${ex0.rest >= 120 ? ex0.rest / 60 + ' min' : ex0.rest + ' s'}</div><div class="mu sm">descanso</div></div></div>
    <div class="card">${p.plan.days.map(d => `<div class="li"><span class="ac b" style="width:38px">${DOW[d.wd]}</span><span class="f1">${esc(d.name)}</span><span class="mu sm">${d.ex.length} ejercicios</span></div>`).join('')}</div>
    <div class="card mu" style="line-height:1.8">${p.priorities.length ? `<i class="ti ti-arrow-up ac"></i> Más volumen en ${esc(p.priorities.join(', ').toLowerCase())}<br>` : ''}${p.limits.length ? `<i class="ti ti-shield ac"></i> Sin ejercicios que carguen ${esc(p.limits.map(l => LIM_LIST.find(x => x[0] === l)[1]).join(', ').toLowerCase())}<br>` : ''}<i class="ti ti-map-pin ac"></i> ${PLACES[p.place][0]}${p.plan.cardio ? '<br><i class="ti ti-run ac"></i> ' + esc(p.plan.cardio) : ''}</div>
    <p class="mu center" style="margin:4px 0 16px">Puedes cambiar todo cuando quieras desde Perfil.</p>
    <button class="btn pri blk" id="go">Ir a mi inicio</button>`;
  },
  mount(root) { $('#go', root).onclick = () => { confetti(); go('inicio'); }; }
};

// ---------------- INICIO ----------------
SCREENS.inicio = {
  nav: 'inicio',
  html(p) {
    const T = tone(p), L = levelInfo(p.xp), st = streak(p), tp = todayPlan(p), done = weekDone(p), planned = p.plan.days.length;
    const trainedToday = p.history.some(h => h.date === today());
    const ch = challengeOf(today()), chDone = p.challenges[today()] || challengeAutoDone(p, ch, today());
    const water = p.water[today()] || 0, wg = Math.round(p.settings.waterGoal / .25);
    const sleepT = p.sleep[today()];
    const ring = Math.min(1, done / planned), C = 2 * Math.PI * 31;
    const sub = T.sub[new Date().getDate() % T.sub.length];
    let hero;
    if (p.live) {
      hero = `<div class="card hero"><div class="sm" style="opacity:.8">Entreno en curso</div><div style="font-size:21px;font-weight:700;margin:2px 0 10px">${esc(p.plan.days[p.live.dayIdx].name)}</div><button class="btn dark blk" data-go="entreno"><i class="ti ti-player-play"></i> Continuar</button></div>`;
    } else if (tp && !trainedToday) {
      hero = `<div class="card hero" id="hero"><div class="sm" style="opacity:.8">Hoy te toca${isDeload(p) ? ' · semana de descarga' : ''}</div><div style="font-size:21px;font-weight:700;margin:2px 0">${esc(tp.day.name)}</div><div class="sm" style="opacity:.8;margin-bottom:12px">${estMinutes(tp.day)} min · ${tp.day.ex.length} ejercicios · +${100 + tp.day.ex.reduce((a, e) => a + e.sets * 5, 0)} XP</div><button class="btn dark blk" id="start">${T.start} <i class="ti ti-arrow-right"></i></button></div>`;
    } else {
      const nx = nextPlan(p);
      hero = `<div class="card soft"><div class="row"><i class="ti ${trainedToday ? 'ti-circle-check' : 'ti-zzz'} ac" style="font-size:28px"></i><div class="f1"><div class="b">${trainedToday ? 'Entreno de hoy completado' : 'Día de descanso'}</div><div class="mu">${trainedToday ? 'Buen trabajo. Recupera bien.' : T.rest}</div></div></div>${nx ? `<div class="li" style="margin-top:8px;border-top:.5px solid var(--ac-line)"><span class="mu f1">Próximo: <b style="color:var(--tx)">${esc(nx.day.name)}</b></span><span class="mu">${nx.inDays === 1 ? 'mañana' : DOW_L[nx.day.wd].toLowerCase()}</span></div>` : ''}<button class="btn out blk sm" id="extra" style="margin-top:8px">Entrenar igual hoy</button></div>`;
    }
    const sleepTxt = sleepT ? Math.floor(sleepT) + 'h' + (Math.round(sleepT % 1 * 60) ? String(Math.round(sleepT % 1 * 60)).padStart(2, '0') : '') : '—';
    const stat = (v, l, go) => `<div ${go ? `data-go="${go}"` : ''} style="text-align:center;cursor:pointer"><div style="font-size:19px;font-weight:700">${v}</div><div class="mu sm">${l}</div></div>`;
    return `
    <div class="row sb" style="margin:4px 0 22px"><span class="mu sm">${niceDate(today())}</span><span class="row" style="gap:6px"><button class="btn ghost" data-go="config" aria-label="Configuración" style="padding:4px"><i class="ti ti-settings mu" style="font-size:21px"></i></button><div class="avatar" data-go="perfil" style="width:30px;height:30px;font-size:13px">${esc(p.name[0].toUpperCase())}</div></span></div>
    <div class="quote" id="quote" style="font-size:24px;line-height:1.28;font-weight:700;margin-bottom:6px">“${esc(quoteOfDay(p))}”</div>
    <button class="btn ghost sm mu" id="otra" style="padding:2px 0;margin-bottom:24px"><i class="ti ti-refresh"></i> otra</button>
    ${hero}
    <div class="row" style="justify-content:space-around;margin:20px 0 18px">
      ${stat(done + '/' + planned, 'semana', 'rutina')}
      ${stat(st + ' <i class="ti ti-flame ac" style="font-size:17px"></i>', st ? 'racha' : 'sin racha', 'logros')}
      ${stat('Nv ' + L.level, Math.round(L.cur / L.need * 100) + ' %', 'logros')}
    </div>
    <div class="row sb" style="border:.5px solid var(--line);border-radius:12px;padding:10px 12px;gap:10px">
      <span class="row f1" style="gap:7px;min-width:0" id="reto"><i class="ti ${ch.i} ac" style="font-size:19px"></i><span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;${chDone ? 'text-decoration:line-through;opacity:.6' : ''}">${esc(ch.n)}</span>${chDone || ch.auto ? '' : '<button class="btn ghost sm" id="retoOk" aria-label="Reto hecho" style="padding:2px"><i class="ti ti-circle-check ac" style="font-size:20px"></i></button>'}</span>
      <span class="mu sm row" data-go="bienestar" style="gap:8px;cursor:pointer;white-space:nowrap"><span><i class="ti ti-droplet"></i> ${fmt(water * .25)}/${p.settings.waterGoal}</span><span><i class="ti ti-moon"></i> ${sleepTxt}</span></span>
    </div>
    `;
  },
  mount(root, p) {
    let off = 0; $('#otra', root).onclick = () => { off++; const q = $('#quote', root); q.textContent = '“' + quoteOfDay(p, off) + '”'; q.classList.remove('pop'); void q.offsetWidth; q.classList.add('pop'); };
    const start = $('#start', root); if (start) start.onclick = e => { unlockAudio(); const r = e.target.getBoundingClientRect(); confetti(16, { x: r.left + r.width / 2, y: r.top }); setTimeout(() => startWorkout(todayPlan(p).idx), 350); };
    const extra = $('#extra', root); if (extra) extra.onclick = () => pickDaySheet(p);
    const ok = $('#retoOk', root); if (ok) ok.onclick = () => { p.challenges[today()] = true; addXP(p, 30); Store.save(); confetti(14); toast('Reto cumplido · +30 XP'); render(); };
    checkAutoChallenge(p);
  }
};
function addWater(p, n) {
  const before = p.water[today()] || 0; p.water[today()] = Math.max(0, before + n);
  const goal = p.settings.waterGoal / .25;
  if (before < goal && p.water[today()] >= goal) { toast('Meta de agua cumplida'); }
  Store.save(); checkAutoChallenge(p);
}
function checkAutoChallenge(p) {
  const ch = challengeOf(today());
  if (ch.auto && !p.challenges[today()] && challengeAutoDone(p, ch, today())) {
    p.challenges[today()] = true; addXP(p, 30); Store.save(); toast('Reto del día cumplido · +30 XP'); confetti(12);
    setTimeout(render, 50);
  }
}
function addXP(p, n) {
  const before = levelInfo(p.xp).level; p.xp += n; const after = levelInfo(p.xp);
  if (after.level > before) setTimeout(() => { confetti(30); toast('Subiste a nivel ' + after.level + ' · ' + after.name, 3200); }, 400);
  const fresh = checkAchievements(p);
  fresh.forEach((a, i) => setTimeout(() => toast('Logro desbloqueado: ' + a[1], 3000), 900 + i * 3100));
}
function pickDaySheet(p) {
  sheet(`<h2>¿Qué entrenas hoy?</h2>${p.plan.days.map((d, i) => `<div class="li" data-i="${i}" style="cursor:pointer"><span class="ac b" style="width:38px">${DOW[d.wd]}</span><span class="f1">${esc(d.name)}</span><i class="ti ti-player-play ac"></i></div>`).join('')}`, (el, close) => {
    $$('[data-i]', el).forEach(r => r.onclick = () => { close(); unlockAudio(); startWorkout(+r.dataset.i); });
  });
}

// ---------------- RUTINA ----------------
SCREENS.rutina = {
  nav: 'rutina',
  html(p) {
    const wk = cycleWeek(p), dl = isDeload(p), until = p.plan.deloadEvery - wk;
    const ws = weekStart(today()), tp = todayPlan(p);
    const doneThisWeek = new Set(p.history.filter(h => h.date >= ws).map(h => h.dayIdx));
    const day = tp ? tp.day : (nextPlan(p) || {}).day;
    return `<h1>Mi rutina <span class="mu" style="font-weight:400;font-size:15px">· Semana ${wk} de ${p.plan.deloadEvery}</span></h1><p class="mu" style="margin-bottom:14px">${GOALS[p.goal].n} · ${LEVELS[p.level][0]} · ${PLACES[p.place][0]}</p>
    <div class="card soft row"><i class="ti ${dl ? 'ti-battery-charging' : 'ti-battery-2'} ac" style="font-size:24px"></i><div class="f1"><div class="b">${dl ? 'Semana de descarga' : until === 1 ? 'Descarga la próxima semana' : 'Descarga en ' + until + ' semanas'}</div><div class="mu">${dl ? 'Menos series y 65 % del peso. Tu cuerpo se recupera y vuelves más fuerte.' : 'Cada ' + p.plan.deloadEvery + ' semanas bajamos la intensidad para recuperarte.'}</div></div></div>
    <div class="card" style="padding:4px 14px">${p.plan.days.map((d, i) => `<div class="li" data-day="${i}" style="cursor:pointer"><span class="ac b" style="width:38px">${DOW[d.wd]}</span><div class="f1"><div>${esc(d.name)}</div><div class="mu sm">${d.ex.length} ejercicios · ${estMinutes(d)} min${tp && tp.idx === i ? ' · <span class="ac">hoy</span>' : ''}</div></div>${doneThisWeek.has(i) ? '<i class="ti ti-circle-check ac" style="font-size:22px"></i>' : '<i class="ti ti-chevron-right chev"></i>'}</div>`).join('')}</div>
    ${day ? `<div class="card"><div class="row sb" style="margin-bottom:4px"><span class="b">Calentamiento ${tp ? 'de hoy' : 'del próximo día'}</span><span class="mu sm">8 min</span></div>${warmup(day).map(w => `<div class="li"><i class="ti ${w[0]}"></i><span class="f1">${esc(w[1])}</span><span class="mu sm">${w[2]}</span></div>`).join('')}</div>` : ''}
    ${p.plan.cardio ? `<div class="card row"><i class="ti ti-run ac" style="font-size:22px"></i><div class="f1 mu">${esc(p.plan.cardio)}</div></div>` : ''}
    <div class="card"><div class="row"><i class="ti ti-bell ac" style="font-size:22px"></i><div class="f1"><div class="b">Recordatorios</div><div class="mu">${p.plan.days.map(d => DOW[d.wd]).join(', ')} · ${p.settings.remindTime}</div></div></div>
      <p class="mu sm" style="margin:8px 0">En iPhone, la forma más confiable es agregar los entrenos a tu calendario con alarma.</p><button class="btn out blk sm" id="ics"><i class="ti ti-calendar-plus"></i> Agregar a mi calendario</button></div>
    <button class="btn out blk" data-go="perfil"><i class="ti ti-adjustments"></i> Cambiar mi rutina</button>`;
  },
  mount(root, p) {
    $$('[data-day]', root).forEach(r => r.onclick = () => go('dia', { i: +r.dataset.day }));
    $('#ics', root).onclick = () => downloadICS(p);
  }
};

SCREENS.dia = {
  nav: 'rutina',
  html(p, a) {
    const d = p.plan.days[a.i]; const dl = isDeload(p);
    return `<div class="top"><button class="btn ghost" data-go="rutina"><i class="ti ti-arrow-left"></i></button><h2 style="margin:0" class="f1">${esc(d.name)}</h2><span class="mu">${DOW_L[d.wd]}</span></div>
    <p class="mu" style="margin-bottom:12px">${d.ex.length} ejercicios · ${estMinutes(d)} min${dl ? ' · <span class="ac">descarga</span>' : ''}</p>
    <div class="card" style="padding:4px 14px">${d.ex.map((e, j) => { const x = EXD[e.id]; return `<div class="li" data-ex="${j}" style="cursor:pointer"><span class="ac b" style="width:20px">${j + 1}</span><div class="f1"><div>${esc(x.n)}</div><div class="mu sm">${fmtTarget(e, dl ? Math.max(2, e.sets - 1) : e.sets)} · descanso ${e.rest >= 120 ? e.rest / 60 + ' min' : e.rest + ' s'}</div></div><i class="ti ti-info-circle chev"></i></div>`; }).join('')}</div>
    <div class="card"><div class="b" style="margin-bottom:4px">Calentamiento</div>${warmup(d).map(w => `<div class="li"><i class="ti ${w[0]}"></i><span class="f1">${esc(w[1])}</span><span class="mu sm">${w[2]}</span></div>`).join('')}</div>
    <button class="btn pri blk" id="start"><i class="ti ti-player-play"></i> Empezar este entreno</button>`;
  },
  mount(root, p, a) {
    $('#start', root).onclick = () => { unlockAudio(); startWorkout(a.i); };
    $$('[data-ex]', root).forEach(r => r.onclick = () => exerciseInfo(p.plan.days[a.i].ex[+r.dataset.ex].id));
  }
};
function exerciseInfo(id) {
  const x = EXD[id];
  sheet(`<h2>${esc(x.n)}</h2><p class="mu" style="margin-bottom:8px">${GROUP_NAMES[x.g]} · ${x.k === 'c' ? 'Compuesto' : 'Aislamiento'}</p>
    <div class="card" id="anim" style="height:210px;padding:6px;margin-bottom:10px"></div>
    <div class="card soft" style="margin-bottom:10px"><div class="mu sm" style="color:var(--ac-text)"><i class="ti ti-flask"></i> Por qué está en tu rutina</div><div style="margin-top:3px">${esc(x.y)}</div></div>
    <div class="b">Cómo hacerlo</div><ol class="steps">${x.p.map(s => `<li>${esc(s)}</li>`).join('')}</ol>
    <a class="btn ghost blk sm mu" style="margin-top:10px;text-decoration:none" target="_blank" rel="noopener" href="https://www.youtube.com/results?search_query=${encodeURIComponent(x.n + ' técnica correcta')}"><i class="ti ti-brand-youtube"></i> Ver un video en YouTube</a>`, el => playAnim($('#anim', el), id));
}
function downloadICS(p) {
  const [hh, mm] = p.settings.remindTime.split(':');
  const BY = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
  const z = n => String(n).padStart(2, '0');
  let ics = 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Gym//ES\r\nCALSCALE:GREGORIAN\r\n';
  p.plan.days.forEach((d, i) => {
    let dt = today(); while (parseD(dt).getDay() !== d.wd) dt = addDays(dt, 1);
    const ds = dt.replace(/-/g, '');
    const end = String(+hh + 1).padStart(2, '0');
    ics += `BEGIN:VEVENT\r\nUID:gym-${p.id}-${i}@gym\r\nDTSTAMP:${ds}T000000\r\nDTSTART:${ds}T${z(hh)}${z(mm)}00\r\nDTEND:${ds}T${end}${z(mm)}00\r\nRRULE:FREQ=WEEKLY;BYDAY=${BY[d.wd]}\r\nSUMMARY:Gym · ${d.name}\r\nDESCRIPTION:${d.ex.map(e => EXD[e.id].n).join(', ')}\r\nBEGIN:VALARM\r\nTRIGGER:-PT15M\r\nACTION:DISPLAY\r\nDESCRIPTION:Hora de entrenar\r\nEND:VALARM\r\nEND:VEVENT\r\n`;
  });
  ics += 'END:VCALENDAR\r\n';
  download(new Blob([ics], { type: 'text/calendar' }), 'gym-entrenos.ics');
  toast('Abre el archivo para agregarlo a tu calendario');
}

// ---------------- PERFIL ----------------
SCREENS.perfil = {
  nav: 'perfil',
  html(p) {
    const tags = parseNotes(p.notes).tags;
    return `<div class="row" style="margin-bottom:16px"><div class="avatar">${esc(p.name[0].toUpperCase())}</div><div class="f1"><h2 style="margin:0">${esc(p.name)}</h2><div class="mu">${fmt(lastWeight(p))} kg · ${(p.height / 100).toFixed(2)} m · ${LEVELS[p.level][0]}</div></div><button class="btn ghost" data-go="config" aria-label="Configuración"><i class="ti ti-settings" style="font-size:22px"></i></button></div>
    <div class="grid3" style="margin-bottom:12px"><div class="stat" data-go="logros"><i class="ti ti-medal"></i><div class="v">${Object.keys(p.achievements).length}</div><div class="mu sm">logros</div></div><div class="stat" data-go="bienestar"><i class="ti ti-droplet"></i><div class="v">Agua</div><div class="mu sm">y sueño</div></div><div class="stat" data-go="progreso"><i class="ti ti-barbell"></i><div class="v">${p.history.length}</div><div class="mu sm">entrenos</div></div></div>
    <div class="card"><div class="b" style="margin-bottom:10px">Mi objetivo</div>${Object.entries(GOALS).map(([k, v]) => `<span class="chip ${p.goal === k ? 'on' : ''}" data-goal="${k}">${v.n}</span>`).join('')}
      <div class="li" id="datos" style="cursor:pointer;margin-top:4px"><i class="ti ti-adjustments"></i><span class="f1">${p.days} días · ${p.minutes} min · ${PLACES[p.place][0]}</span><i class="ti ti-pencil chev"></i></div></div>
    <div class="card"><div class="row sb" style="margin-bottom:8px"><span class="b">Mis prioridades</span><span class="mu sm">Ordena con las flechas</span></div>
      <div id="prs">${p.priorities.map((x, i) => `<div class="li"><span class="ac b" style="width:18px">${i + 1}</span><span class="f1">${esc(x)}</span><button class="btn ghost" data-up="${i}" aria-label="Subir"><i class="ti ti-chevron-up"></i></button><button class="btn ghost" data-dn="${i}" aria-label="Bajar"><i class="ti ti-chevron-down"></i></button><button class="btn ghost" data-rm="${i}" aria-label="Quitar"><i class="ti ti-x"></i></button></div>`).join('') || '<p class="mu">Sin prioridades: todo se trabaja por igual.</p>'}</div>
      <div style="margin-top:8px">${PRI_LIST.filter(x => !p.priorities.includes(x)).map(x => `<span class="chip" data-add="${x}"><i class="ti ti-plus"></i>${x}</span>`).join('')}</div></div>
    <div class="card"><div class="b" style="margin-bottom:8px">Zonas a cuidar</div>${LIM_LIST.map(([v, l]) => `<span class="chip ${p.limits.includes(v) ? 'on' : ''}" data-lim="${v}">${l}</span>`).join('')}</div>
    <div class="card"><div class="b" style="margin-bottom:8px">Cuéntame lo que quieres</div>
      <textarea id="notes" rows="3" placeholder="Quiero brazos más grandes, me molesta la rodilla y no me gustan las sentadillas. Prefiero máquinas.">${esc(p.notes || '')}</textarea>
      <div class="mu sm" style="margin:8px 0 6px">La app entendió:</div><div id="tags">${tagsHTML(tags)}</div></div>
    <div class="card"><div class="row sb" style="margin-bottom:4px"><span class="b">Mi rutina</span><span class="mu sm">Toca un día para editarlo</span></div>
      ${p.plan.days.map((d, i) => `<div class="li" data-ed="${i}" style="cursor:pointer"><span class="ac b" style="width:38px">${DOW[d.wd]}</span><span class="f1">${esc(d.name)}</span><i class="ti ti-chevron-right chev"></i></div>`).join('')}
      <button class="btn pri blk" id="regen" style="margin-top:10px"><i class="ti ti-refresh"></i> Regenerar con mis cambios</button></div>`;
  },
  mount(root, p) {
    const dirty = () => { Store.save(); $('#regen', root).classList.add('pop'); };
    $$('[data-goal]', root).forEach(c => c.onclick = () => { p.goal = c.dataset.goal; $$('[data-goal]', root).forEach(x => x.classList.toggle('on', x === c)); dirty(); toast('Objetivo cambiado. Regenera tu rutina para aplicarlo.'); });
    $$('[data-up]', root).forEach(b => b.onclick = () => { const i = +b.dataset.up; if (i > 0) { [p.priorities[i - 1], p.priorities[i]] = [p.priorities[i], p.priorities[i - 1]]; Store.save(); render(); } });
    $$('[data-dn]', root).forEach(b => b.onclick = () => { const i = +b.dataset.dn; if (i < p.priorities.length - 1) { [p.priorities[i + 1], p.priorities[i]] = [p.priorities[i], p.priorities[i + 1]]; Store.save(); render(); } });
    $$('[data-rm]', root).forEach(b => b.onclick = () => { p.priorities.splice(+b.dataset.rm, 1); Store.save(); render(); });
    $$('[data-add]', root).forEach(b => b.onclick = () => { if (p.priorities.length >= 3) return toast('Máximo 3 prioridades'); p.priorities.push(b.dataset.add); Store.save(); render(); });
    $$('[data-lim]', root).forEach(c => c.onclick = () => { const v = c.dataset.lim; p.limits = p.limits.includes(v) ? p.limits.filter(x => x !== v) : [...p.limits, v]; c.classList.toggle('on'); dirty(); });
    const n = $('#notes', root); n.oninput = () => { p.notes = n.value; $('#tags', root).innerHTML = tagsHTML(parseNotes(n.value).tags); clearTimeout(n._t); n._t = setTimeout(() => Store.save(), 400); };
    $('#datos', root).onclick = () => editDataSheet(p);
    $$('[data-ed]', root).forEach(r => r.onclick = () => go('editar_dia', { i: +r.dataset.ed }));
    $('#regen', root).onclick = () => confirmSheet('¿Regenerar tu rutina?', 'Se arma de nuevo con tu objetivo, prioridades, zonas a cuidar y lo que escribiste. Tu historial y récords se mantienen.', 'Regenerar', () => {
      p.wds = p.plan.days.length === p.days ? p.plan.days.map(d => d.wd) : null;
      p.plan = generatePlan(p); Store.save(); confetti(16); toast('Rutina actualizada'); go('rutina');
    });
  }
};
function tagsHTML(tags) { return tags.length ? tags.map(t => `<span class="tag"><i class="ti ${t[0]}"></i>${esc(t[1])}</span>`).join('') : '<span class="mu sm">Escribe qué quieres, qué te duele o qué no te gusta.</span>'; }
function lastWeight(p) { const b = [...p.body].reverse().find(x => x.weight); return b ? b.weight : p.weight; }

function editDataSheet(p) {
  sheet(`<h2>Mis datos</h2>
    <div class="grid2"><div><p class="mu sm" style="margin-bottom:4px">Nombre</p><input id="e_name" value="${esc(p.name)}"></div><div><p class="mu sm" style="margin-bottom:4px">Edad</p><input id="e_age" type="number" value="${p.age}"></div>
    <div><p class="mu sm" style="margin-bottom:4px">Estatura (cm)</p><input id="e_h" type="number" value="${p.height}"></div><div><p class="mu sm" style="margin-bottom:4px">Minutos</p><input id="e_min" type="number" step="5" value="${p.minutes}"></div></div>
    <p class="mu sm" style="margin:12px 0 6px">Días por semana</p><div>${[2, 3, 4, 5, 6].map(n => `<span class="chip ${p.days === n ? 'on' : ''}" data-days="${n}">${n}</span>`).join('')}</div>
    <p class="mu sm" style="margin:6px 0 6px">Qué días</p><div id="wds">${[1, 2, 3, 4, 5, 6, 0].map(w => `<span class="chip ${p.plan.days.some(d => d.wd === w) ? 'on' : ''}" data-wd="${w}">${DOW[w]}</span>`).join('')}</div>
    <p class="mu sm" style="margin:6px 0 6px">Nivel</p><div>${Object.entries(LEVELS).map(([k, v]) => `<span class="chip ${p.level === k ? 'on' : ''}" data-lv="${k}">${v[0]}</span>`).join('')}</div>
    <p class="mu sm" style="margin:6px 0 6px">Dónde entrenas</p><div>${Object.entries(PLACES).map(([k, v]) => `<span class="chip ${p.place === k ? 'on' : ''}" data-pl="${k}">${v[0]}</span>`).join('')}</div>
    <div class="err" id="er"></div><button class="btn pri blk" id="save">Guardar y regenerar rutina</button>`, (el, close) => {
    let days = p.days, lv = p.level, pl = p.place, wds = p.plan.days.map(d => d.wd);
    const sel = (attr, cb) => $$(`[data-${attr}]`, el).forEach(c => c.onclick = () => { $$(`[data-${attr}]`, el).forEach(x => x.classList.toggle('on', x === c)); cb(c.dataset[attr]); });
    sel('days', v => { days = +v; wds = DEFAULT_WD[days].slice(); $$('[data-wd]', el).forEach(c => c.classList.toggle('on', wds.includes(+c.dataset.wd))); });
    sel('lv', v => lv = v); sel('pl', v => pl = v);
    $$('[data-wd]', el).forEach(c => c.onclick = () => { const w = +c.dataset.wd; wds = wds.includes(w) ? wds.filter(x => x !== w) : [...wds, w]; c.classList.toggle('on'); });
    $('#save', el).onclick = () => {
      if (wds.length !== days) { $('#er', el).textContent = 'Elige exactamente ' + days + ' días'; return; }
      const name = $('#e_name', el).value.trim(); if (!name) { $('#er', el).textContent = 'Escribe tu nombre'; return; }
      Object.assign(p, { name, age: +$('#e_age', el).value || p.age, height: +$('#e_h', el).value || p.height, minutes: Math.max(20, Math.min(150, +$('#e_min', el).value || p.minutes)), days, level: lv, place: pl, wds: wds.slice().sort() });
      p.plan = generatePlan(p); Store.save(); close(); toast('Rutina actualizada'); render();
    };
  });
}

SCREENS.editar_dia = {
  nav: 'perfil',
  html(p, a) {
    const d = p.plan.days[a.i];
    return `<div class="top"><button class="btn ghost" data-go="perfil"><i class="ti ti-arrow-left"></i></button><h2 style="margin:0" class="f1">${esc(d.name)}</h2><span class="mu">${DOW_L[d.wd]}</span></div>
    <p class="mu" style="margin-bottom:12px">Cambia ejercicios, series o repeticiones. Los cambios se guardan solos.</p>
    ${d.ex.map((e, j) => { const x = EXD[e.id]; return `<div class="card"><div class="row"><span class="ac b">${j + 1}</span><div class="f1 b">${esc(x.n)}</div><button class="btn ghost" data-swap="${j}" aria-label="Cambiar"><i class="ti ti-arrows-exchange"></i></button><button class="btn ghost" data-del="${j}" aria-label="Quitar"><i class="ti ti-trash"></i></button></div>
      <div class="grid3" style="margin-top:8px"><label class="mu sm">Series<input type="number" min="1" max="8" value="${e.sets}" data-f="sets" data-j="${j}"></label><label class="mu sm">${exMode(e.id) === 't' ? 'Seg. mín' : 'Reps mín'}<input type="number" min="1" max="300" value="${e.lo}" data-f="lo" data-j="${j}"></label><label class="mu sm">${exMode(e.id) === 't' ? 'Seg. máx' : 'Reps máx'}<input type="number" min="1" max="300" value="${e.hi}" data-f="hi" data-j="${j}"></label></div></div>`; }).join('')}
    <button class="btn out blk" id="add"><i class="ti ti-plus"></i> Agregar ejercicio</button>`;
  },
  mount(root, p, a) {
    const d = p.plan.days[a.i];
    $$('[data-f]', root).forEach(i => i.onchange = () => { const v = Math.max(1, +i.value || 1); d.ex[+i.dataset.j][i.dataset.f] = v; Store.save(); toast('Guardado', 1000); });
    $$('[data-del]', root).forEach(b => b.onclick = () => { if (d.ex.length <= 1) return toast('Deja al menos un ejercicio'); d.ex.splice(+b.dataset.del, 1); Store.save(); render(); });
    $$('[data-swap]', root).forEach(b => b.onclick = () => swapSheet(p, d.ex[+b.dataset.swap].id, id => { retarget(p, d.ex[+b.dataset.swap], id); Store.save(); render(); }));
    $('#add', root).onclick = () => {
      sheet(`<h2>Agregar ejercicio</h2>${Object.entries(GROUP_NAMES).map(([g, n]) => `<div class="sec">${n}</div>` + EX.filter(x => x.g === g && x.e.includes(p.place)).map(x => `<div class="li" data-id="${x.id}" style="cursor:pointer"><span class="f1">${esc(x.n)}</span>${x.t === 3 ? '<i class="ti ti-star ac" title="De los más efectivos"></i>' : ''}</div>`).join('')).join('')}`, (el, close) => {
        $$('[data-id]', el).forEach(r => r.onclick = () => { const x = EXD[r.dataset.id]; const pr = exTarget(x.id, p.level, params(p.goal, x.k, p.level, false)); d.ex.push({ id: x.id, sets: pr.sets, lo: pr.lo, hi: pr.hi, rest: pr.rest }); Store.save(); close(); render(); });
      });
    };
  }
};
function swapSheet(p, exId, onPick) {
  const alts = alternatives(exId, p);
  sheet(`<h2>Cambiar ${esc(EXD[exId].n.toLowerCase())}</h2><p class="mu" style="margin-bottom:8px">Trabajan el mismo músculo. <i class="ti ti-star ac"></i> = de los más efectivos.</p>
    ${alts.map(x => `<div class="li" data-id="${x.id}" style="cursor:pointer"><div class="f1"><div>${esc(x.n)}</div><div class="mu sm">${esc(x.y)}</div></div>${x.t === 3 ? '<i class="ti ti-star ac"></i>' : ''}</div>`).join('') || '<p class="mu">No hay alternativas con tu equipo y zonas a cuidar.</p>'}`, (el, close) => {
    $$('[data-id]', el).forEach(r => r.onclick = () => { close(); onPick(r.dataset.id); });
  });
}
