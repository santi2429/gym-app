// ====== Entrenamiento en vivo y resumen ======
// p.live = { id, dayIdx, start(ms), cur, items:[{id, sets, lo, hi, rest, sug, rows:[{w,r,done}]}], restEnd(ms)|null, restTotal, warned }
function startWorkout(dayIdx) {
  const p = Store.p;
  if (p.live && p.live.dayIdx !== dayIdx) return confirmSheet('Tienes un entreno en curso', '¿Lo descartas y empiezas este?', 'Descartar y empezar', () => { p.live = null; startWorkout(dayIdx); }, true);
  if (!p.live) {
    const day = p.plan.days[dayIdx], dl = isDeload(p);
    p.live = {
      id: 'w' + Date.now().toString(36), dayIdx, start: Date.now(), cur: 0, restEnd: null, restTotal: 0,
      items: day.ex.map(e => {
        const sets = dl ? Math.max(2, e.sets - 1) : e.sets;
        const s = suggest(p, Object.assign({}, e, { sets }));
        return { id: e.id, sets, lo: e.lo, hi: e.hi, rest: p.settings.restMode === 'auto' ? e.rest : p.settings.restSec, sug: s, rows: Array.from({ length: sets }, () => ({ w: s.w, r: s.r, done: false })) };
      })
    };
    Store.save();
  }
  if (p.settings.wake) keepAwake(true);
  go('entreno');
}

let _tick = null;
SCREENS.entreno = {
  full: true,
  html(p) {
    const L = p.live; if (!L) return '';
    const it = L.items[L.cur], x = EXD[it.id], last = lastSessionFor(p, it.id), u = unitW(p);
    const elapsed = Math.floor((Date.now() - L.start) / 60000);
    const isLast = L.cur === L.items.length - 1;
    return `<div class="top"><button class="btn ghost" id="quit" aria-label="Salir"><i class="ti ti-x"></i></button><div class="f1 center mu">Ejercicio ${L.cur + 1} de ${L.items.length} · <span id="el">${elapsed} min</span></div><button class="btn ghost" id="list" aria-label="Lista"><i class="ti ti-list"></i></button></div>
    <div class="prog" style="margin-bottom:14px"><div style="width:${(L.cur + 1) / L.items.length * 100}%"></div></div>
    <div class="vid" id="tec"><i class="ti ti-player-play"></i><span class="mu sm">Ver técnica</span></div>
    <h1 style="font-size:22px">${esc(x.n)}</h1>
    <p class="mu" style="margin-bottom:10px">${it.sets} × ${it.lo}-${it.hi} reps · ${last ? 'Última vez: ' + last.sets.map(s => (+s.w ? fmt(s.w) + ' × ' : '') + s.r).join(', ') + (+last.sets[0].w ? ' ' + u : '') : 'Primera vez'}</p>
    <div class="card soft row" style="padding:11px 14px"><i class="ti ${it.sug.kind === 'up' ? 'ti-trending-up' : it.sug.kind === 'deload' ? 'ti-battery-charging' : it.sug.kind === 'new' ? 'ti-info-circle' : 'ti-target'} ac" style="font-size:20px"></i><span class="sm f1">${esc(it.sug.msg)}</span></div>
    <div class="card sets" style="padding:6px 14px"><div class="sr mu sm"><span>Serie</span><span class="center">${u === 'lb' ? 'Libras' : 'Kilos'}</span><span class="center">Reps</span><span></span></div>
      ${it.rows.map((r, j) => `<div class="sr"><span class="ac b">${j + 1}</span><input type="number" inputmode="decimal" step="0.5" value="${r.w}" placeholder="${x.e === 'b' || p.place === 'b' ? 'peso corp.' : '0'}" data-w="${j}"><input type="number" inputmode="numeric" value="${r.r}" data-r="${j}"><div class="ck ${r.done ? 'on' : ''}" data-ck="${j}" role="button" aria-label="Serie hecha"><i class="ti ti-check"></i></div></div>`).join('')}
      <div class="row" style="justify-content:center;gap:16px;padding:6px 0"><button class="btn ghost sm" id="addset"><i class="ti ti-plus"></i> Serie</button>${it.rows.length > 1 ? '<button class="btn ghost sm" id="rmset"><i class="ti ti-minus"></i> Serie</button>' : ''}</div></div>
    <div class="card center" id="restBox"><div class="mu sm">Descanso</div><div class="timer" id="tm">${fmtT(it.rest)}</div><div class="row" style="justify-content:center;gap:8px;margin-top:4px"><button class="btn sm" id="m15">−15 s</button><button class="btn sm" id="restBtn">Iniciar</button><button class="btn sm" id="p15">+15 s</button></div></div>
    <div class="grid2"><button class="btn out" id="swap"><i class="ti ti-arrows-exchange"></i> Cambiar</button><button class="btn pri" id="next">${isLast ? 'Terminar <i class="ti ti-flag"></i>' : 'Siguiente <i class="ti ti-arrow-right"></i>'}</button></div>
    ${L.cur > 0 ? '<button class="btn ghost blk" id="prev" style="margin-top:6px"><i class="ti ti-arrow-left"></i> Anterior</button>' : ''}`;
  },
  mount(root, p) {
    const L = p.live; if (!L) return go('inicio');
    const it = L.items[L.cur];
    if (p.settings.wake) keepAwake(true);
    $('#tec', root).onclick = () => exerciseInfo(it.id);
    $$('[data-w]', root).forEach(i => i.oninput = () => { const j = +i.dataset.w; it.rows[j].w = i.value; for (let k = j + 1; k < it.rows.length; k++) if (!it.rows[k].done) { it.rows[k].w = i.value; const o = $(`[data-w="${k}"]`, root); if (o) o.value = i.value; } Store.save(); });
    $$('[data-r]', root).forEach(i => i.oninput = () => { it.rows[+i.dataset.r].r = i.value; Store.save(); });
    $$('[data-ck]', root).forEach(c => c.onclick = () => {
      unlockAudio();
      const j = +c.dataset.ck, row = it.rows[j]; row.done = !row.done; c.classList.toggle('on', row.done);
      if (row.done) {
        if (!row.r) row.r = it.lo;
        if (p.settings.vibSet) vibrate(40);
        const allDone = it.rows.every(r => r.done);
        if (p.settings.autoRest && !(allDone && L.cur === L.items.length - 1)) startRest(it.rest);
        if (allDone) toast(L.cur === L.items.length - 1 ? 'Último ejercicio completado' : 'Ejercicio completado. Al terminar el descanso, pasa al siguiente.');
      }
      Store.save();
    });
    $('#addset', root).onclick = () => { const l = it.rows[it.rows.length - 1]; it.rows.push({ w: l.w, r: l.r, done: false }); Store.save(); render(); };
    const rm = $('#rmset', root); if (rm) rm.onclick = () => { it.rows.pop(); Store.save(); render(); };
    $('#restBtn', root).onclick = () => { unlockAudio(); if (L.restEnd) { L.restEnd = null; Store.save(); paintRest(); } else startRest(it.rest); };
    $('#m15', root).onclick = () => { if (L.restEnd) { L.restEnd -= 15000; } else { it.rest = Math.max(15, it.rest - 15); } Store.save(); paintRest(); };
    $('#p15', root).onclick = () => { if (L.restEnd) { L.restEnd += 15000; } else { it.rest += 15; } Store.save(); paintRest(); };
    $('#swap', root).onclick = () => swapSheet(p, it.id, id => {
      it.id = id; it.sug = suggest(p, Object.assign({}, it)); it.rows = it.rows.map(r => r.done ? r : { w: it.sug.w, r: it.sug.r, done: false });
      Store.save(); render();
    });
    $('#next', root).onclick = () => {
      if (L.cur < L.items.length - 1) { L.cur++; Store.save(); render(); window.scrollTo(0, 0); }
      else {
        const pending = L.items.reduce((a, i) => a + i.rows.filter(r => !r.done).length, 0);
        if (pending) confirmSheet('¿Terminar el entreno?', 'Te quedan ' + pending + ' series sin marcar. Se guardan solo las que marcaste como hechas.', 'Terminar', finishWorkout);
        else finishWorkout();
      }
    };
    const prev = $('#prev', root); if (prev) prev.onclick = () => { L.cur--; Store.save(); render(); };
    $('#quit', root).onclick = () => sheet(`<h2>¿Salir del entreno?</h2><p class="mu" style="margin-bottom:14px">Puedes pausarlo y continuarlo luego desde Inicio.</p><button class="btn pri blk" id="pause">Pausar y salir</button><button class="btn out blk" id="end" style="margin-top:8px">Terminar y guardar</button><button class="btn ghost blk" id="disc" style="margin-top:8px;color:var(--ac-text)">Descartar entreno</button>`, (el, close) => {
      $('#pause', el).onclick = () => { close(); keepAwake(false); go('inicio'); };
      $('#end', el).onclick = () => { close(); finishWorkout(); };
      $('#disc', el).onclick = () => { close(); confirmSheet('¿Descartar el entreno?', 'No se guardará nada de esta sesión.', 'Descartar', () => { p.live = null; Store.save(); keepAwake(false); go('inicio'); }, true); };
    });
    $('#list', root).onclick = () => sheet(`<h2>Ejercicios de hoy</h2>${L.items.map((i, k) => `<div class="li" data-k="${k}" style="cursor:pointer"><span class="ac b" style="width:20px">${k + 1}</span><span class="f1">${esc(EXD[i.id].n)}</span><span class="mu sm">${i.rows.filter(r => r.done).length}/${i.rows.length}</span>${i.rows.every(r => r.done) ? '<i class="ti ti-circle-check ac"></i>' : ''}</div>`).join('')}`, (el, close) => {
      $$('[data-k]', el).forEach(r => r.onclick = () => { L.cur = +r.dataset.k; Store.save(); close(); render(); });
    });
    clearInterval(_tick); _tick = setInterval(tick, 250); paintRest();
  }
};
function fmtT(s) { s = Math.max(0, Math.ceil(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
function startRest(sec) { const L = Store.p.live; L.restEnd = Date.now() + sec * 1000; L.restTotal = sec; L.warned = false; Store.save(); paintRest(); }
function paintRest() {
  const p = Store.p, L = p && p.live; const tm = $('#tm'), b = $('#restBtn'); if (!L || !tm) return;
  if (L.restEnd) { const left = (L.restEnd - Date.now()) / 1000; tm.textContent = fmtT(left); if (b) b.textContent = 'Saltar'; }
  else { tm.textContent = fmtT(L.items[L.cur].rest); if (b) b.textContent = 'Iniciar'; }
}
function tick() {
  const p = Store.p, L = p && p.live;
  if (!L || CUR.name !== 'entreno') { clearInterval(_tick); return; }
  const el = $('#el'); if (el) el.textContent = Math.floor((Date.now() - L.start) / 60000) + ' min';
  if (L.restEnd) {
    const left = (L.restEnd - Date.now()) / 1000;
    if (left <= 10.2 && left > 9 && !L.warned) { L.warned = true; if (p.settings.warn10) { beep([[660, .12]]); if (p.settings.vibRest) vibrate(80); } }
    if (left <= 0) {
      L.restEnd = null; Store.save();
      beep(); flash(); if (p.settings.vibRest) vibrate([200, 100, 200, 100, 200]);
      const tm = $('#tm'); if (tm) { tm.textContent = tone(p).restEnd; const rb = $('#restBox'); if (rb) { rb.classList.remove('pop'); void rb.offsetWidth; rb.classList.add('pop'); } }
      const b = $('#restBtn'); if (b) b.textContent = 'Iniciar';
      return;
    }
    paintRest();
  }
}

function finishWorkout() {
  const p = Store.p, L = p.live; if (!L) return;
  const day = p.plan.days[L.dayIdx];
  const sets = []; L.items.forEach(it => it.rows.forEach((r, j) => { if (r.done) sets.push({ ex: it.id, set: j + 1, w: +r.w || 0, r: +r.r || 0, done: true }); }));
  if (!sets.length) { p.live = null; Store.save(); keepAwake(false); toast('No marcaste ninguna serie, no se guardó el entreno'); return go('inicio'); }
  const volume = sets.reduce((a, s) => a + s.w * s.r, 0);
  // Récords: mejor 1RM estimado (o más repeticiones si es peso corporal)
  const prs = [];
  const byEx = {}; sets.forEach(s => { (byEx[s.ex] = byEx[s.ex] || []).push(s); });
  Object.entries(byEx).forEach(([ex, ss]) => {
    const best = ss.reduce((b, s) => (s.w ? e1rm(s.w, s.r) : s.r / 1000) > (b.w ? e1rm(b.w, b.r) : b.r / 1000) ? s : b, ss[0]);
    const prev = p.prs[ex]; const score = best.w ? e1rm(best.w, best.r) : best.r / 1000;
    const prevScore = prev ? (prev.w ? e1rm(prev.w, prev.r) : prev.r / 1000) : 0;
    if (prev && score > prevScore + 1e-9) prs.push({ ex, w: best.w, r: best.r, prev: prev.w ? prev.w : prev.r });
    if (!prev || score > prevScore) p.prs[ex] = { w: best.w, r: best.r, date: today() };
  });
  const prevSame = [...p.history].reverse().find(h => h.dayIdx === L.dayIdx && h.dayName === day.name);
  const xp = 100 + sets.length * 5 + prs.length * 25;
  const levelBefore = levelInfo(p.xp);
  const h = { id: L.id, date: today(), dayIdx: L.dayIdx, dayName: day.name, duration: Math.max(1, Math.round((Date.now() - L.start) / 60000)), startHour: new Date(L.start).getHours(), sets, volume, prs, xp, mood: null };
  p.history.push(h); p.live = null; p.xp += xp;
  const fresh = checkAchievements(p);
  Store.save(); keepAwake(false);
  go('resumen', { id: h.id, prevSame: prevSame ? prevSame.id : null, levelBefore, fresh });
}

SCREENS.resumen = {
  full: true,
  html(p, a) {
    const h = p.history.find(x => x.id === a.id); if (!h) return '';
    const prev = a.prevSame ? p.history.find(x => x.id === a.prevSame) : null, u = unitW(p);
    const L0 = a.levelBefore, L1 = levelInfo(p.xp), up = L1.level > L0.level;
    const moods = [['fatal', 'ti-mood-sad', 'Fatal'], ['normal', 'ti-mood-neutral', 'Normal'], ['bien', 'ti-mood-smile', 'Bien'], ['brutal', 'ti-mood-crazy-happy', 'Brutal']];
    return `<div class="center" style="margin:8px 0 16px"><div class="avatar" style="width:72px;height:72px;margin:0 auto 10px;font-size:34px"><i class="ti ti-trophy"></i></div><h1>Entreno completado</h1><p class="mu">${esc(h.dayName)} · ${niceDate(h.date)}</p></div>
    <div class="grid3" style="margin-bottom:12px"><div class="stat"><i class="ti ti-clock"></i><div class="v">${h.duration} min</div><div class="mu sm">duración</div></div><div class="stat"><i class="ti ti-weight"></i><div class="v">${fmt0(h.volume)}</div><div class="mu sm">${u} levantados</div></div><div class="stat"><i class="ti ti-stack-2"></i><div class="v">${h.sets.length}</div><div class="mu sm">series</div></div></div>
    <div class="card"><div class="row sb" style="margin-bottom:7px"><span class="b">+<span id="xp">0</span> XP</span><span class="mu sm" id="lv">Nivel ${L0.level} · ${L0.name}</span></div><div class="bar"><div id="xbar" style="width:${L0.cur / L0.need * 100}%"></div></div><div class="mu sm" id="lvm" style="margin-top:6px">Entreno 100 · ${h.sets.length} series × 5${h.prs.length ? ' · ' + h.prs.length + ' récord' + (h.prs.length > 1 ? 's' : '') + ' × 25' : ''}</div></div>
    ${h.prs.length ? `<div class="card"><div class="b" style="margin-bottom:4px"><i class="ti ti-flame ac"></i> ${h.prs.length} récord${h.prs.length > 1 ? 's' : ''} nuevo${h.prs.length > 1 ? 's' : ''}</div>${h.prs.map(r => `<div class="li"><span class="f1">${esc(EXD[r.ex].n)}</span><span class="b">${r.w ? fmt(r.w) + ' ' + u + ' × ' : ''}${r.r}${r.w ? '' : ' reps'}</span></div>`).join('')}</div>` : ''}
    ${prev ? `<div class="card"><div class="b" style="margin-bottom:4px">Vs. la sesión anterior</div><div class="li">Volumen total<span class="b" style="margin-left:auto;color:${h.volume >= prev.volume ? 'var(--ac)' : 'var(--mu)'}">${prev.volume ? (h.volume >= prev.volume ? '+' : '') + Math.round((h.volume - prev.volume) / prev.volume * 100) + ' %' : '—'}</span></div><div class="li">Duración<span class="mu" style="margin-left:auto">${h.duration - prev.duration >= 0 ? '+' : '−'}${Math.abs(h.duration - prev.duration)} min</span></div></div>` : ''}
    ${a.fresh && a.fresh.length ? `<div class="card soft">${a.fresh.map(f => `<div class="row" style="padding:4px 0"><i class="ti ${f[2]} ac" style="font-size:22px"></i><span><b>Logro desbloqueado:</b> ${esc(f[1])}</span></div>`).join('')}</div>` : ''}
    <div class="card"><div class="b" style="margin-bottom:8px">¿Cómo te sentiste?</div><div class="row" style="gap:6px">${moods.map(m => `<div class="opt f1 ${h.mood === m[0] ? 'on' : ''}" data-mood="${m[0]}" style="flex-direction:column;gap:2px;margin:0;padding:10px 0"><i class="ti ${m[1]}" style="font-size:26px"></i><span class="mu sm">${m[2]}</span></div>`).join('')}</div><div class="mu sm" id="mdt" style="margin-top:8px">Esto ajusta la intensidad de tu próxima sesión.</div></div>
    <button class="btn out blk" id="share" style="margin-bottom:8px"><i class="ti ti-share"></i> Compartir</button>
    <button class="btn pri blk" id="fin">Listo</button>`;
  },
  mount(root, p, a) {
    const h = p.history.find(x => x.id === a.id); if (!h) return go('inicio');
    const L0 = a.levelBefore, L1 = levelInfo(p.xp);
    confetti(26);
    if (!a.animated) {
      a.animated = true;
      let n = 0; const xpEl = $('#xp', root); const t = setInterval(() => { n = Math.min(h.xp, n + Math.ceil(h.xp / 40)); xpEl.textContent = n; if (n >= h.xp) clearInterval(t); }, 20);
      const bar = $('#xbar', root);
      if (L1.level > L0.level) {
        setTimeout(() => bar.style.width = '100%', 150);
        setTimeout(() => { bar.style.transition = 'none'; bar.style.width = '0%'; $('#lv', root).innerHTML = `<span class="ac">Nivel ${L1.level} · ${L1.name}</span>`; $('#lvm', root).innerHTML = `<span class="ac">Subiste de nivel</span> · ${fmt0(L1.cur)} / ${fmt0(L1.need)} XP`; confetti(30); beep([[660, .1], [880, .1], [1320, .3]]); setTimeout(() => { bar.style.transition = ''; bar.style.width = (L1.cur / L1.need * 100) + '%'; }, 60); }, 1000);
      } else setTimeout(() => bar.style.width = (L1.cur / L1.need * 100) + '%', 150);
    } else { $('#xp', root).textContent = h.xp; }
    const msgs = { fatal: 'Anotado. La próxima vez mantenemos el peso.', normal: 'Anotado. Seguimos con lo planeado.', bien: 'Bien. Seguimos subiendo.', brutal: 'Te sobró energía: la próxima subimos más.' };
    $$('[data-mood]', root).forEach(m => m.onclick = () => { h.mood = m.dataset.mood; Store.save(); $$('[data-mood]', root).forEach(x => x.classList.toggle('on', x === m)); $('#mdt', root).textContent = msgs[h.mood]; });
    $('#share', root).onclick = () => shareCard(p, h);
    $('#fin', root).onclick = () => go('inicio');
  }
};

// Tarjeta para compartir como imagen
function shareCard(p, h) {
  const c = document.createElement('canvas'); const W = 1080, H = 1350; c.width = W; c.height = H;
  const x = c.getContext('2d'), col = COLORS[p.settings.color] || COLORS[0], u = unitW(p);
  x.fillStyle = '#0d0b0b'; x.fillRect(0, 0, W, H);
  x.fillStyle = col.ac; x.fillRect(0, 0, W, 14);
  const F = (w, s) => w + ' ' + s + 'px -apple-system, "Segoe UI", Roboto, sans-serif';
  x.fillStyle = '#f5eeee'; x.font = F(700, 52); x.fillText(p.name, 90, 150);
  x.fillStyle = '#a08f8f'; x.font = F(400, 40); x.textAlign = 'right'; x.fillText(shortDate(h.date) + ' ' + h.date.slice(0, 4), W - 90, 150); x.textAlign = 'left';
  x.fillStyle = '#a08f8f'; x.font = F(400, 44); x.fillText('Hoy entrené', 90, 300);
  x.fillStyle = '#f5eeee'; x.font = F(700, 96);
  const words = h.dayName.split(' '); let line = '', y = 410;
  words.forEach(w => { const t = line ? line + ' ' + w : w; if (x.measureText(t).width > W - 180) { x.fillText(line, 90, y); y += 110; line = w; } else line = t; }); x.fillText(line, 90, y);
  const stats = [[fmt0(h.volume), u + ' levantados'], [h.duration, 'minutos'], [h.prs.length, 'récords'], [streak(p), 'días de racha']];
  stats.forEach((s, i) => { const cx = 90 + (i % 2) * 460, cy = y + 170 + Math.floor(i / 2) * 210; x.fillStyle = col.ac; x.font = F(700, 96); x.fillText(String(s[0]), cx, cy); x.fillStyle = '#a08f8f'; x.font = F(400, 38); x.fillText(s[1], cx, cy + 56); });
  x.strokeStyle = '#2a2424'; x.lineWidth = 2; x.beginPath(); x.moveTo(90, H - 230); x.lineTo(W - 90, H - 230); x.stroke();
  x.fillStyle = '#d8c8c8'; x.font = 'italic 40px Georgia, serif';
  const q = '"' + quoteOfDay(p) + '"'; let ql = '', qy = H - 160;
  q.split(' ').forEach(w => { const t = ql ? ql + ' ' + w : w; if (x.measureText(t).width > W - 180) { x.fillText(ql, 90, qy); qy += 52; ql = w; } else ql = t; }); x.fillText(ql, 90, qy);
  c.toBlob(async blob => {
    const file = new File([blob], 'gym-' + h.date + '.png', { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) { try { await navigator.share({ files: [file], text: 'Hoy entrené ' + h.dayName }); } catch (e) { } }
    else download(blob, file.name);
  }, 'image/png');
}
