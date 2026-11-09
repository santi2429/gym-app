// ====== Progreso, fotos, logros, agua y sueño, configuración ======
SCREENS.progreso = {
  nav: 'progreso',
  html(p, a) {
    const tab = a.tab || 'fuerza', u = unitW(p);
    const tabs = [['fuerza', 'Fuerza'], ['peso', 'Peso'], ['medidas', 'Medidas'], ['fotos', 'Fotos'], ['historial', 'Historial']];
    let body = '';
    if (tab === 'fuerza') {
      const exs = [...new Set(p.history.flatMap(h => h.sets.map(s => s.ex)))];
      const sel = a.ex && exs.includes(a.ex) ? a.ex : exs[0];
      if (!exs.length) body = '<div class="card mu center" style="padding:30px 14px">Completa tu primer entreno y aquí verás cómo sube tu fuerza.</div>';
      else {
        const pts = p.history.filter(h => h.sets.some(s => s.ex === sel)).map(h => { const ss = h.sets.filter(s => s.ex === sel); const best = Math.max(...ss.map(s => s.w ? e1rm(s.w, s.r) : s.r)); return { x: shortDate(h.date), y: best }; });
        const first = pts[0].y, lastv = pts[pts.length - 1].y, isBW = !p.history.some(h => h.sets.some(s => s.ex === sel && s.w));
        body = `<div class="card"><select id="exSel" style="margin-bottom:10px">${exs.map(e => `<option value="${e}" ${e === sel ? 'selected' : ''}>${esc(EXD[e].n)}</option>`).join('')}</select>
          <div class="row sb"><span class="mu sm">${isBW ? 'Mejores repeticiones' : 'Fuerza estimada (1RM)'}</span><span class="ac b sm">${lastv >= first ? '+' : ''}${fmt(lastv - first)} ${isBW ? 'reps' : u}</span></div>${lineChart(pts, { fmt: v => fmt(v) + (isBW ? '' : ' ' + u) })}</div>`;
      }
      const prs = Object.entries(p.prs).sort((x, y) => (y[1].w ? e1rm(y[1].w, y[1].r) : 0) - (x[1].w ? e1rm(x[1].w, x[1].r) : 0)).slice(0, 8);
      body += `<div class="card"><div class="row sb" style="margin-bottom:4px"><span class="b">Récords personales</span><i class="ti ti-trophy ac"></i></div>${prs.map(([e, r]) => `<div class="li"><span class="f1">${esc(EXD[e].n)}</span><span class="b">${r.w ? fmt(r.w) + ' ' + u + ' × ' : ''}${r.r}${r.w ? '' : ' reps'}</span></div>`).join('') || '<p class="mu">Aún no hay récords.</p>'}</div>`;
      body += monthSummary(p);
    } else if (tab === 'peso') {
      const pts = p.body.filter(b => b.weight).map(b => ({ x: shortDate(b.date), y: b.weight }));
      body = `<div class="card"><div class="row sb"><span class="b">Peso corporal</span><span class="ac b sm">${pts.length > 1 ? (pts[pts.length - 1].y - pts[0].y >= 0 ? '+' : '') + fmt(pts[pts.length - 1].y - pts[0].y) + ' kg' : ''}</span></div>${lineChart(pts, { fmt: v => fmt(v) + ' kg' })}</div>
        <div class="card row"><input id="wIn" type="number" inputmode="decimal" step="0.1" placeholder="Peso de hoy (kg)" style="flex:1"><button class="btn pri" id="wSave">Guardar</button></div>`;
    } else if (tab === 'medidas') {
      const M = [['weight', 'Peso', 'kg'], ['arm', 'Brazo', 'cm'], ['chest', 'Pecho', 'cm'], ['waist', 'Cintura', 'cm'], ['hip', 'Cadera', 'cm'], ['thigh', 'Muslo', 'cm']];
      const lastOf = k => [...p.body].reverse().find(b => b[k]);
      const firstOf = k => p.body.find(b => b[k]);
      body = `<div class="card"><div class="row sb" style="margin-bottom:4px"><span class="b">Medidas</span><span class="mu sm">vs. la primera</span></div>${M.map(([k, n, un]) => { const l = lastOf(k), f = firstOf(k); const d = l && f ? l[k] - f[k] : 0; return `<div class="li"><span class="f1">${n}</span><span>${l ? fmt(l[k]) + ' ' + un : '—'}</span><span class="${d ? 'ac' : 'mu'} sm" style="width:56px;text-align:right">${l && f && l !== f ? (d > 0 ? '+' : '') + fmt(d) : ''}</span></div>`; }).join('')}</div>
        <div class="card"><div class="b" style="margin-bottom:8px">Registrar hoy</div><div class="grid2">${M.map(([k, n, un]) => `<label class="mu sm">${n} (${un})<input type="number" inputmode="decimal" step="0.1" data-m="${k}"></label>`).join('')}</div><button class="btn pri blk" id="mSave" style="margin-top:10px">Guardar medidas</button></div>`;
    } else if (tab === 'fotos') {
      body = `<div id="fotos"><div class="mu center" style="padding:30px">Cargando fotos…</div></div>`;
    } else {
      body = `<div class="card" style="padding:4px 14px">${[...p.history].reverse().slice(0, 60).map(h => `<div class="li" data-h="${h.id}" style="cursor:pointer"><div class="f1"><div>${esc(h.dayName)}</div><div class="mu sm">${niceDate(h.date)} · ${h.duration} min · ${fmt0(h.volume)} ${u}</div></div>${h.prs.length ? '<i class="ti ti-trophy ac"></i>' : ''}<i class="ti ti-chevron-right chev"></i></div>`).join('') || '<p class="mu" style="padding:14px 0">Aún no hay entrenos.</p>'}</div>`;
    }
    return `<h1 style="margin-bottom:12px">Progreso</h1><div class="tabs">${tabs.map(([k, n]) => `<span class="chip ${tab === k ? 'on' : ''}" data-tab="${k}">${n}</span>`).join('')}</div>${body}`;
  },
  mount(root, p, a) {
    $$('[data-tab]', root).forEach(t => t.onclick = () => go('progreso', { tab: t.dataset.tab }, true));
    const exSel = $('#exSel', root); if (exSel) exSel.onchange = () => go('progreso', { tab: 'fuerza', ex: exSel.value }, true);
    const wS = $('#wSave', root); if (wS) wS.onclick = () => { const v = +$('#wIn', root).value; if (!(v >= 30 && v <= 250)) return toast('Escribe un peso válido'); saveBody(p, { weight: v }); render(); };
    const mS = $('#mSave', root); if (mS) mS.onclick = () => { const d = {}; $$('[data-m]', root).forEach(i => { if (+i.value > 0) d[i.dataset.m] = +i.value; }); if (!Object.keys(d).length) return toast('Escribe al menos una medida'); saveBody(p, d); render(); };
    $$('[data-h]', root).forEach(r => r.onclick = () => historyDetail(p, r.dataset.h));
    if ((a.tab || 'fuerza') === 'fotos') mountPhotos(p);
  }
};
function saveBody(p, d) {
  let rec = p.body.find(b => b.date === today()); if (!rec) { rec = { date: today() }; p.body.push(rec); p.body.sort((x, y) => x.date < y.date ? -1 : 1); }
  Object.assign(rec, d); Store.save(); toast('Guardado'); checkAutoChallenge(p);
}
function monthSummary(p) {
  const m = today().slice(0, 7), hs = p.history.filter(h => h.date.startsWith(m));
  const pm = (() => { const d = parseD(today()); d.setMonth(d.getMonth() - 1); return ymd(d).slice(0, 7); })();
  const prevV = p.history.filter(h => h.date.startsWith(pm)).reduce((a, h) => a + h.volume, 0);
  const vol = hs.reduce((a, h) => a + h.volume, 0), u = unitW(p);
  return `<div class="card"><div class="b" style="margin-bottom:10px">Resumen de ${MON[+m.slice(5) - 1]}</div><div class="grid3 center"><div><div class="b" style="font-size:18px">${hs.length}</div><div class="mu sm">entrenos</div></div><div><div class="b" style="font-size:18px">${vol >= 1000 ? fmt(vol / 1000) + ' t' : fmt0(vol)}</div><div class="mu sm">${vol >= 1000 ? 'levantadas' : u}</div></div><div><div class="b ac" style="font-size:18px">${prevV ? (vol >= prevV ? '+' : '') + Math.round((vol - prevV) / prevV * 100) + '%' : hs.reduce((a, h) => a + h.prs.length, 0)}</div><div class="mu sm">${prevV ? 'vs. mes pasado' : 'récords'}</div></div></div></div>`;
}
function historyDetail(p, id) {
  const h = p.history.find(x => x.id === id), u = unitW(p);
  const by = {}; h.sets.forEach(s => (by[s.ex] = by[s.ex] || []).push(s));
  sheet(`<h2>${esc(h.dayName)}</h2><p class="mu" style="margin-bottom:10px">${niceDate(h.date)} · ${h.duration} min · ${fmt0(h.volume)} ${u}</p>
    ${Object.entries(by).map(([e, ss]) => `<div class="li" style="display:block"><div class="b">${esc(EXD[e].n)}</div><div class="mu sm">${ss.map(s => (s.w ? fmt(s.w) + ' × ' : '') + s.r).join(' · ')}</div></div>`).join('')}
    <button class="btn ghost blk" id="del" style="margin-top:12px;color:var(--ac-text)"><i class="ti ti-trash"></i> Borrar este entreno</button>`, (el, close) => {
    $('#del', el).onclick = () => { close(); confirmSheet('¿Borrar este entreno?', 'Se quita del historial. No se puede deshacer.', 'Borrar', () => { p.history = p.history.filter(x => x.id !== id); Store.save(); render(); }, true); };
  });
}

// ---- Fotos de progreso ----
function mountPhotos(p) {
  PhotoDB.all(p.id).then(list => {
    const box = $('#fotos'); if (!box) return;
    const a = list[0], b = list[list.length - 1];
    box.innerHTML = `<div class="card">${list.length >= 2 ? `<div class="cmp" id="cmp"><img src="${b.data}" alt="Después"><div class="a" id="ca" style="width:50%"><img src="${a.data}" alt="Antes" id="cai"></div><span class="lbl" style="left:8px">${shortDate(a.date)}</span><span class="lbl" style="right:8px">${shortDate(b.date)}</span></div><input type="range" min="0" max="100" value="50" step="1" id="cs" style="width:100%;margin-top:8px" aria-label="Comparar antes y después">`
      : list.length === 1 ? `<div class="cmp"><img src="${a.data}" alt="Foto"></div><p class="mu sm center" style="margin-top:8px">Toma otra foto en unas semanas para comparar.</p>` : `<div class="mu center" style="padding:30px 0"><i class="ti ti-camera ac" style="font-size:36px"></i><p style="margin-top:6px">Tómate la primera foto. Usa la misma luz y posición cada vez para comparar mejor.</p></div>`}
      <label class="btn out blk" style="margin-top:10px"><i class="ti ti-camera"></i> Tomar foto de hoy<input type="file" accept="image/*" capture="user" id="ph" hidden></label></div>
      ${list.length ? `<div class="grid3">${list.map(x => `<div style="position:relative"><img src="${x.data}" style="width:100%;aspect-ratio:3/4;object-fit:cover;border-radius:12px;display:block" alt=""><span class="mu sm">${shortDate(x.date)}</span><button class="btn ghost" data-del="${x.key}" style="position:absolute;top:2px;right:2px;background:rgba(0,0,0,.5);padding:4px" aria-label="Borrar"><i class="ti ti-trash" style="color:#fff"></i></button></div>`).join('')}</div>` : ''}
      <p class="mu sm center" style="margin:10px 0"><i class="ti ti-lock"></i> Las fotos solo se guardan en tu celular</p>`;
    const cs = $('#cs'); if (cs) { const sync = () => { $('#ca').style.width = cs.value + '%'; $('#cai').style.width = $('#cmp').offsetWidth + 'px'; }; cs.oninput = sync; sync(); }
    $('#ph').onchange = e => { const f = e.target.files[0]; if (f) compressImage(f).then(data => PhotoDB.put(p.id, { date: today(), ts: Date.now(), data })).then(() => { p.photoCount = (p.photoCount || 0) + 1; p.lastPhotoDate = today(); checkAchievements(p); Store.save(); toast('Foto guardada'); checkAutoChallenge(p); mountPhotos(p); }); };
    $$('[data-del]', box).forEach(btn => btn.onclick = () => confirmSheet('¿Borrar esta foto?', 'No se puede deshacer.', 'Borrar', () => PhotoDB.del(btn.dataset.del).then(() => mountPhotos(p)), true));
  });
}
function compressImage(file) {
  return new Promise(res => {
    const img = new Image(); img.onload = () => {
      const max = 900, s = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas'); c.width = img.width * s; c.height = img.height * s;
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); res(c.toDataURL('image/jpeg', .8)); URL.revokeObjectURL(img.src);
    }; img.src = URL.createObjectURL(file);
  });
}

// ---- Logros ----
SCREENS.logros = {
  nav: 'perfil',
  html(p) {
    const L = levelInfo(p.xp), got = Object.keys(p.achievements).length;
    return `<div class="top"><button class="btn ghost" data-back><i class="ti ti-arrow-left"></i></button><h2 style="margin:0" class="f1">Logros</h2><span class="mu">${got} de ${ACHIEVEMENTS.length}</span></div>
    <div class="card"><div class="row sb" style="margin-bottom:7px"><span class="b"><i class="ti ti-shield-half ac"></i> Nivel ${L.level} · ${L.name}</span><span class="mu sm">${fmt0(L.cur)} / ${fmt0(L.need)} XP</span></div><div class="bar"><div style="width:${L.cur / L.need * 100}%"></div></div><p class="mu sm" style="margin-top:8px">Ganas XP al entrenar (100 + 5 por serie), por cada récord (25) y por cumplir el reto del día (30).</p></div>
    <div class="card grid3" style="gap:14px 8px">${ACHIEVEMENTS.map(([id, n, i]) => `<div class="center"><div class="badge ${p.achievements[id] ? 'on' : ''}"><i class="ti ${i}"></i></div><div class="mu sm">${esc(n)}</div></div>`).join('')}</div>`;
  },
  mount() { }
};

// ---- Agua y sueño ----
SCREENS.bienestar = {
  nav: 'perfil',
  html(p) {
    const w = p.water[today()] || 0, goal = Math.round(p.settings.waterGoal / .25);
    const days = Array.from({ length: 7 }, (_, i) => addDays(today(), i - 6));
    const sl = days.map(d => p.sleep[d] || 0), avg = sl.filter(Boolean).length ? sl.filter(Boolean).reduce((a, b) => a + b, 0) / sl.filter(Boolean).length : 0;
    const hm = v => Math.floor(v) + ' h ' + String(Math.round(v % 1 * 60)).padStart(2, '0');
    return `<div class="top"><button class="btn ghost" data-back><i class="ti ti-arrow-left"></i></button><h2 style="margin:0" class="f1">Agua y sueño</h2></div>
    <div class="card"><div class="row sb" style="margin-bottom:10px"><span class="b">Agua de hoy</span><span class="mu">${fmt(w * .25)} / ${p.settings.waterGoal} L</span></div>
      <div class="row" style="gap:5px;margin-bottom:10px">${Array.from({ length: goal }, (_, i) => `<div class="glass ${i < w ? 'on' : ''}" data-g="${i}"></div>`).join('')}</div>
      <div class="grid2"><button class="btn" id="wm"><i class="ti ti-minus"></i> Quitar</button><button class="btn pri" id="wp"><i class="ti ti-plus"></i> Vaso (250 ml)</button></div></div>
    <div class="card"><div class="row sb" style="margin-bottom:10px"><span class="b">Sueño</span><span class="mu">promedio ${avg ? hm(avg) : '—'}</span></div>
      <div class="sleepbars">${sl.map((v, i) => `<div class="${i === 6 ? 't' : ''}" style="height:${Math.min(100, v / 10 * 100)}%"></div>`).join('')}</div>
      <div class="row sb mu sm" style="margin-top:4px">${days.map(d => `<span>${DOW[parseD(d).getDay()][0]}</span>`).join('')}</div>
      <p class="mu sm" style="margin:12px 0 6px">¿Cuánto dormiste anoche?</p><div class="row"><input id="sh" type="number" min="0" max="16" step="0.5" inputmode="decimal" placeholder="7.5" value="${p.sleep[today()] || ''}" style="flex:1"><span class="mu">horas</span><button class="btn pri" id="ss">Guardar</button></div>
      <p class="mu sm" style="margin-top:8px">Dormir 7 a 9 horas mejora la recuperación y el rendimiento.</p></div>`;
  },
  mount(root, p) {
    $('#wp', root).onclick = () => { addWater(p, 1); render(); };
    $('#wm', root).onclick = () => { addWater(p, -1); render(); };
    $$('[data-g]', root).forEach(g => g.onclick = () => { p.water[today()] = +g.dataset.g + 1; Store.save(); checkAutoChallenge(p); render(); });
    $('#ss', root).onclick = () => { const v = +$('#sh', root).value; if (!(v > 0 && v <= 16)) return toast('Escribe las horas que dormiste'); p.sleep[today()] = v; Store.save(); toast('Sueño guardado'); checkAutoChallenge(p); render(); };
  }
};

// ---- Configuración ----
SCREENS.config = {
  nav: 'perfil',
  html(p) {
    const s = p.settings, ids = Object.keys(Store.db.profiles);
    const tg = (k, lbl, sub, icon) => `<div class="li"><i class="ti ${icon}"></i><div class="f1"><div>${lbl}</div>${sub ? `<div class="mu sm">${sub}</div>` : ''}</div><div class="tg ${s[k] ? 'on' : ''}" data-tg="${k}" role="switch" aria-checked="${!!s[k]}"></div></div>`;
    const seg = (k, opts) => `<div class="seg" data-seg="${k}">${opts.map(([v, l]) => `<span class="${s[k] === v ? 'on' : ''}" data-v="${v}">${l}</span>`).join('')}</div>`;
    return `<div class="top"><button class="btn ghost" data-back><i class="ti ti-arrow-left"></i></button><h2 style="margin:0" class="f1">Configuración</h2></div>
    <div class="sec">Tú</div><div class="card" style="padding:2px 14px">
      <div class="li"><i class="ti ti-user"></i><div class="f1"><div class="mu sm">Cómo te llamo</div><input id="nm" value="${esc(p.name)}" style="border:none;padding:2px 0;background:transparent"></div><i class="ti ti-pencil chev"></i></div>
      <div class="li" id="prof" style="cursor:pointer"><i class="ti ti-users"></i><div class="f1"><div>Cambiar de perfil</div><div class="mu sm">${ids.map(i => esc(Store.db.profiles[i].name)).join(', ')}</div></div><i class="ti ti-chevron-right chev"></i></div></div>
    <div class="sec">Apariencia</div><div class="card" style="padding:2px 14px">
      <div class="li" style="flex-wrap:wrap"><i class="ti ti-palette"></i><span>Color</span><div class="row" style="gap:6px;width:100%;justify-content:space-between;margin-top:8px">${COLORS.map((c, i) => `<div class="sw ${s.color === i ? 'on' : ''}" data-col="${i}" style="background:${c.ac}" title="${c.n}" role="button" aria-label="${c.n}"></div>`).join('')}</div></div>
      <div class="li"><i class="ti ti-moon"></i><span>Fondo</span>${seg('bg', [['negro', 'Negro'], ['gris', 'Gris oscuro']])}</div></div>
    <div class="sec">Personalidad</div><div class="card" style="padding:2px 14px">
      <div class="li"><i class="ti ti-message-circle"></i><div class="f1"><div>Tono</div><div class="mu sm">${s.tone === 'sargento' ? '"Arriba, ' + esc(p.name) + '. Hoy no se negocia."' : '"Vas muy bien, ' + esc(p.name) + '."'}</div></div>${seg('tone', [['amable', 'Amable'], ['sargento', 'Sargento']])}</div>
      <div class="li" id="quotes" style="cursor:pointer"><i class="ti ti-quote"></i><div class="f1"><div>Mis frases</div><div class="mu sm">${s.quotes.length ? s.quotes.length + ' frases propias' : 'Agrega frases propias a la rotación'}</div></div><i class="ti ti-chevron-right chev"></i></div></div>
    <div class="sec">Avisos del descanso</div><div class="card" style="padding:2px 14px">
      ${tg('sounds', 'Sonido al acabar el descanso', 'Pon el celular con volumen', 'ti-volume')}
      ${tg('warn10', 'Aviso 10 s antes', 'Un pitido suave', 'ti-hourglass')}
      ${tg('vibRest', 'Vibración', 'En iPhone las apps web no pueden vibrar: verás un destello de pantalla', 'ti-device-mobile-vibration')}
      ${tg('vibSet', 'Toque al completar serie', '', 'ti-check')}
      <div class="li"><i class="ti ti-player-play"></i><span class="f1">Probar aviso</span><button class="btn pri sm" id="test">Probar</button></div></div>
    <div class="sec">Entrenamiento</div><div class="card" style="padding:2px 14px">
      <div class="li"><i class="ti ti-scale"></i><span class="f1">Unidades</span>${seg('units', [['kg', 'kg'], ['lb', 'lb']])}</div>
      <div class="li"><i class="ti ti-clock"></i><div class="f1"><div>Descanso</div><div class="mu sm">${s.restMode === 'auto' ? 'Según tu objetivo y el ejercicio' : 'Siempre ' + s.restSec + ' s'}</div></div>${seg('restMode', [['auto', 'Auto'], ['fijo', 'Fijo']])}</div>
      ${s.restMode === 'fijo' ? `<div class="li"><span class="f1 mu">Segundos de descanso</span><input id="rs" type="number" step="15" min="15" max="600" value="${s.restSec}" style="width:90px;padding:8px"></div>` : ''}
      ${tg('autoRest', 'Iniciar descanso solo', 'Al marcar la serie como hecha', 'ti-player-play')}
      ${tg('wake', 'Pantalla siempre encendida', 'Mientras entrenas', 'ti-sun')}</div>
    <div class="sec">Recordatorios y metas</div><div class="card" style="padding:2px 14px">
      <div class="li"><i class="ti ti-bell"></i><span class="f1">Hora de entrenar</span><input id="rt" type="time" value="${s.remindTime}" style="width:120px;padding:8px"></div>
      <div class="li" id="ics" style="cursor:pointer"><i class="ti ti-calendar-plus"></i><div class="f1"><div>Agregar entrenos a mi calendario</div><div class="mu sm">Con alarma 15 min antes</div></div><i class="ti ti-chevron-right chev"></i></div>
      <div class="li"><i class="ti ti-droplet"></i><span class="f1">Meta de agua (L)</span><input id="wg" type="number" step="0.25" min="1" max="6" value="${s.waterGoal}" style="width:90px;padding:8px"></div>
      <div class="li"><i class="ti ti-moon-stars"></i><span class="f1">Meta de sueño (h)</span><input id="sg" type="number" step="0.5" min="5" max="10" value="${s.sleepGoal}" style="width:90px;padding:8px"></div></div>
    <div class="sec">Tus datos</div><div class="card" style="padding:2px 14px">
      <div class="li" id="exp" style="cursor:pointer"><i class="ti ti-download"></i><div class="f1"><div>Hacer respaldo</div><div class="mu sm">${s.lastBackup ? 'Último: ' + niceDate(s.lastBackup) : 'Guárdalo en Archivos o iCloud'}</div></div><i class="ti ti-chevron-right chev"></i></div>
      <label class="li" style="cursor:pointer"><i class="ti ti-upload"></i><span class="f1">Restaurar respaldo</span><i class="ti ti-chevron-right chev"></i><input type="file" accept=".json,application/json" id="imp" hidden></label>
      <div class="li" id="reset" style="cursor:pointer"><i class="ti ti-trash" style="color:var(--mu)"></i><span class="mu">Borrar este perfil y empezar de cero</span></div></div>
    <p class="mu sm center" style="margin:16px 0 4px">Gym · v1.0</p>`;
  },
  mount(root, p) {
    const s = p.settings;
    const nm = $('#nm', root); nm.onchange = () => { const v = nm.value.trim(); if (v) { p.name = v; Store.save(); toast('Nombre guardado'); } };
    $$('[data-col]', root).forEach(c => c.onclick = () => { s.color = +c.dataset.col; Store.save(); applyTheme(p); render(); });
    $$('[data-seg]', root).forEach(g => $$('span', g).forEach(o => o.onclick = () => { s[g.dataset.seg] = o.dataset.v; Store.save(); applyTheme(p); render(); }));
    $$('[data-tg]', root).forEach(t => t.onclick = () => { s[t.dataset.tg] = !s[t.dataset.tg]; t.classList.toggle('on'); Store.save(); });
    $('#test', root).onclick = () => { unlockAudio(); beep(); flash(); vibrate([200, 100, 200, 100, 200]); };
    const rs = $('#rs', root); if (rs) rs.onchange = () => { s.restSec = Math.max(15, +rs.value || 90); Store.save(); };
    $('#rt', root).onchange = e => { s.remindTime = e.target.value || '18:00'; Store.save(); };
    $('#wg', root).onchange = e => { s.waterGoal = Math.max(1, +e.target.value || 3); Store.save(); };
    $('#sg', root).onchange = e => { s.sleepGoal = Math.max(5, +e.target.value || 7.5); Store.save(); };
    $('#ics', root).onclick = () => downloadICS(p);
    $('#quotes', root).onclick = () => quotesSheet(p);
    $('#prof', root).onclick = () => profilesSheet();
    $('#exp', root).onclick = () => Store.export().then(blob => {
      const name = 'gym-respaldo-' + p.name.toLowerCase().replace(/\s+/g, '-') + '-' + today() + '.json';
      const file = new File([blob], name, { type: 'application/json' });
      const done = () => { s.lastBackup = today(); Store.save(); render(); };
      if (navigator.canShare && navigator.canShare({ files: [file] })) navigator.share({ files: [file] }).then(done).catch(() => { });
      else { download(blob, name); done(); }
    });
    $('#imp', root).onchange = e => { const f = e.target.files[0]; if (!f) return; f.text().then(t => Store.import(t)).then(() => { applyTheme(Store.p); toast('Respaldo restaurado'); go('inicio'); }).catch(() => toast('Ese archivo no es un respaldo válido')); };
    $('#reset', root).onclick = () => confirmSheet('¿Borrar el perfil de ' + p.name + '?', 'Se borran su rutina, historial, récords y fotos de este celular. No se puede deshacer. Haz un respaldo antes si lo quieres conservar.', 'Borrar todo', () => { Store.remove(p.id); if (Store.p) { applyTheme(Store.p); go('inicio'); } else { applyTheme(null); obReset(); go('onboarding'); } }, true);
  }
};
function quotesSheet(p) {
  const draw = () => `<h2>Mis frases</h2><p class="mu" style="margin-bottom:10px">Se mezclan con las frases del día.</p>
    ${p.settings.quotes.map((q, i) => `<div class="li"><span class="f1 quote" style="font-size:15px">${esc(q)}</span><button class="btn ghost" data-rq="${i}" aria-label="Quitar"><i class="ti ti-x"></i></button></div>`).join('')}
    <textarea id="nq" rows="2" placeholder="Escribe una frase que te motive" style="margin-top:10px;min-height:60px"></textarea><button class="btn pri blk" id="aq" style="margin-top:8px">Agregar frase</button>`;
  sheet(draw(), function bind(el, close) {
    $('#aq', el).onclick = () => { const v = $('#nq', el).value.trim(); if (!v) return; p.settings.quotes.push(v); Store.save(); el.innerHTML = draw(); bind(el, close); };
    $$('[data-rq]', el).forEach(b => b.onclick = () => { p.settings.quotes.splice(+b.dataset.rq, 1); Store.save(); el.innerHTML = draw(); bind(el, close); });
  });
}
function profilesSheet() {
  const ids = Object.keys(Store.db.profiles);
  sheet(`<h2>Perfiles</h2><p class="mu" style="margin-bottom:8px">Cada persona tiene su propia rutina e historial.</p>
    ${ids.map(i => { const q = Store.db.profiles[i]; return `<div class="li" data-pid="${i}" style="cursor:pointer"><div class="avatar" style="width:36px;height:36px;font-size:15px;background:${(COLORS[q.settings.color] || COLORS[0]).ac};color:${(COLORS[q.settings.color] || COLORS[0]).on}">${esc(q.name[0].toUpperCase())}</div><span class="f1">${esc(q.name)}</span>${i === Store.db.active ? '<i class="ti ti-check ac"></i>' : ''}</div>`; }).join('')}
    <button class="btn out blk" id="np" style="margin-top:12px"><i class="ti ti-user-plus"></i> Agregar persona</button>`, (el, close) => {
    $$('[data-pid]', el).forEach(r => r.onclick = () => { Store.db.active = r.dataset.pid; Store.save(); applyTheme(Store.p); close(); go('inicio'); });
    $('#np', el).onclick = () => { close(); obReset(); go('onboarding'); };
  });
}
