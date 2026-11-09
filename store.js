// ====== Almacenamiento local (cada persona guarda sus datos en su celular) ======
const KEY = 'gym.v1';
const Store = {
  db: null,
  load() {
    try { this.db = JSON.parse(localStorage.getItem(KEY)) || null; } catch (e) { this.db = null; }
    if (!this.db) this.db = { active: null, profiles: {} };
    return this.db;
  },
  save() {
    try { localStorage.setItem(KEY, JSON.stringify(this.db)); }
    catch (e) { toast('No hay espacio para guardar. Haz un respaldo y libera espacio.'); }
  },
  get p() { return this.db.profiles[this.db.active] || null; },
  newProfile(data) {
    const id = 'p' + Date.now().toString(36);
    this.db.profiles[id] = Object.assign({
      id, created: today(),
      settings: {
        color: 0, bg: 'negro', tone: 'amable', quotes: [],
        vibRest: true, warn10: true, vibSet: false, sounds: true,
        units: 'kg', restMode: 'auto', restSec: 90, autoRest: true, wake: true,
        remindTime: '18:00', waterGoal: 3, sleepGoal: 7.5
      },
      plan: null, history: [], prs: {}, body: [], water: {}, sleep: {}, xp: 0,
      achievements: {}, challenges: {}, live: null, photoCount: 0
    }, data);
    this.db.active = id;
    this.save();
    return this.db.profiles[id];
  },
  remove(id) {
    delete this.db.profiles[id];
    PhotoDB.clear(id);
    const ids = Object.keys(this.db.profiles);
    this.db.active = ids[0] || null;
    this.save();
  },
  export() {
    return PhotoDB.all(this.db.active).then(photos => {
      const data = { app: 'gym', v: 1, date: new Date().toISOString(), profile: this.p, photos };
      return new Blob([JSON.stringify(data)], { type: 'application/json' });
    });
  },
  import(text) {
    const d = JSON.parse(text);
    if (d.app !== 'gym' || !d.profile) throw new Error('Archivo no válido');
    const p = d.profile;
    this.db.profiles[p.id] = p;
    this.db.active = p.id;
    this.save();
    return Promise.all((d.photos || []).map(ph => PhotoDB.put(p.id, ph)));
  }
};

// Fotos en IndexedDB (localStorage se queda corto para imágenes)
const PhotoDB = {
  _db: null,
  open() {
    if (this._db) return Promise.resolve(this._db);
    return new Promise((res, rej) => {
      const r = indexedDB.open('gym-photos', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('photos', { keyPath: 'key' });
      r.onsuccess = () => { this._db = r.result; res(this._db); };
      r.onerror = () => rej(r.error);
    });
  },
  tx(mode) { return this.open().then(db => db.transaction('photos', mode).objectStore('photos')); },
  put(pid, ph) {
    return this.tx('readwrite').then(s => new Promise(res => {
      const rec = Object.assign({}, ph, { key: pid + '|' + ph.date + '|' + (ph.ts || Date.now()), pid });
      s.put(rec).onsuccess = () => res(rec);
    }));
  },
  all(pid) {
    return this.tx('readonly').then(s => new Promise(res => {
      const out = [];
      s.openCursor().onsuccess = e => {
        const c = e.target.result;
        if (c) { if (c.value.pid === pid) out.push(c.value); c.continue(); }
        else res(out.sort((a, b) => a.key < b.key ? -1 : 1));
      };
    })).catch(() => []);
  },
  del(key) { return this.tx('readwrite').then(s => new Promise(res => { s.delete(key).onsuccess = res; })); },
  clear(pid) { return this.all(pid).then(list => Promise.all(list.map(p => this.del(p.key)))); }
};

// ---- utilidades de fecha ----
function ymd(d) { const z = n => String(n).padStart(2, '0'); return d.getFullYear() + '-' + z(d.getMonth() + 1) + '-' + z(d.getDate()); }
function today() { return ymd(new Date()); }
function parseD(s) { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); }
function addDays(s, n) { const d = parseD(s); d.setDate(d.getDate() + n); return ymd(d); }
function daysBetween(a, b) { return Math.round((parseD(b) - parseD(a)) / 864e5); }
const DOW = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const DOW_L = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const MON = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
function niceDate(s) { const d = parseD(s); return DOW_L[d.getDay()] + ', ' + d.getDate() + ' de ' + MON[d.getMonth()]; }
function shortDate(s) { const d = parseD(s); return d.getDate() + ' ' + MON[d.getMonth()].slice(0, 3); }
