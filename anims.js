// Posturas de cada ejercicio para el avatar (ver anim.js). A = inicio, B = punto final del movimiento.
const BENCH = (x1, x2, y, fl = 164) => [['ln', x1, y, x2, y, 8], ['ln', x1 + 8, y, x1 + 8, fl, 4], ['ln', x2 - 8, y, x2 - 8, fl, 4]];
const SEAT = (x1, x2, y) => [['ln', x1, y, x2, y, 7], ['ln', (x1 + x2) / 2, y, (x1 + x2) / 2, 164, 4]];
const BACKREST = (dx = -7, dy = 0) => ['seg', 'hip', 'sh', dx, dy, 8, 4];
const STAND = { t: 180, H1: [4, 51], F1: [0, 75] };
const SIT = { t: 180, F1: [36, 38] };
const LIE = { anc: ['sh', 70, 104], base: { t: 270, F1: [30, 56] }, fl: ['an1'] };
const KNEEL = { F1: [-37, 38], ft1: -100 };
const PUSHUP = { anc: ['an1', 30, 146], fl: ['h1'], base: { ft1: 20 }, A: { t: 114, F1: [-68, 30], H1: [0, 50] }, B: { t: 97, F1: [-74, 9], H1: [-9, 15] } };

// Ejercicios donde ir de A a B es la fase de esfuerzo (concéntrica): se hace más rápido que la vuelta.
const ANIM_UP = new Set(['aperturas_polea', 'pec_deck', 'jalon_pecho', 'dominadas', 'remo_pecho_apoyado', 'remo_polea', 'remo_barra', 'remo_mancuerna',
  'remo_maquina', 'pullover_polea', 'remo_invertido', 'remo_toalla', 'elev_lat', 'elev_lat_polea', 'face_pull', 'pajaros', 'curl_barra', 'curl_martillo',
  'curl_inclinado', 'curl_bayesian', 'curl_predicador', 'ext_tricep_cabeza', 'ext_tricep_polea_alta', 'jalon_triceps', 'step_up', 'ext_cuadriceps',
  'curl_femoral_sentado', 'curl_femoral_acostado', 'hip_thrust', 'puente_gluteo', 'puente_una_pierna', 'abduccion_maq', 'patada_gluteo', 'gemelo_pie',
  'gemelo_prensa', 'crunch_polea', 'crunch', 'elev_piernas']);
const ANIMS = {
  _default: { base: STAND, A: {}, B: { t: 178 } },

  // ---------- PECHO ----------
  press_banca: { ...LIE, A: { H1: [0, -50] }, B: { H1: [6, -6] }, eq: [...BENCH(48, 135, 112), ['bb', 'h1']] },
  press_cerrado: { ...LIE, A: { H1: [0, -50] }, B: { H1: [10, -6] }, eq: [...BENCH(48, 135, 112), ['bb', 'h1']] },
  press_mancuernas: { ...LIE, A: { H1: [0, -50] }, B: { H1: [4, -4] }, eq: [...BENCH(48, 135, 112), ['db', 'h1']] },
  press_inclinado: { anc: ['hip', 120, 122], fl: ['an1'], base: { t: 240, F1: [32, 38] }, A: { H1: [-2, -50] }, B: { H1: [6, -6] },
    eq: [['seg', 'hip', 'sh', -3.5, 6, 8, 8], ['ln', 116, 129, 148, 129, 7], ['ln', 110, 130, 110, 164, 4], ['db', 'h1']] },
  press_maquina: { anc: ['hip', 90, 124], base: { ...SIT, t: 183 }, A: { H1: [50, 2] }, B: { H1: [14, 6] },
    eq: [BACKREST(), ...SEAT(70, 118, 131), ['ln', 158, 40, 158, 164, 5], ['grip', 'h1']] },
  press_inclinado_maq: { anc: ['hip', 90, 124], base: { ...SIT, t: 195 }, A: { H1: [38, -34] }, B: { H1: [10, -4] },
    eq: [['seg', 'hip', 'sh', -7, -2, 8, 4], ...SEAT(70, 118, 131), ['ln', 158, 20, 158, 164, 5], ['grip', 'h1']] },
  aperturas_polea: { v: 'f', anc: ['an1', 111, 160], base: { t: 180, F1: [4, 75] }, A: { H1: [48, -8] }, B: { H1: [-8, 30] },
    eq: [['cab', 192, 28, 'h1'], ['cab', 30, 28, 'h2'], ['grip', 'h1'], ['grip', 'h2']] },
  pec_deck: { v: 'f', anc: ['hip', 100, 120], base: { t: 180, F1: [8, 44] }, A: { H1: [46, -16] }, B: { H1: [-8, 4] },
    eq: [['ln', 80, 126, 120, 126, 7], ['ln', 40, 20, 40, 164, 4], ['ln', 160, 20, 160, 164, 4], ['ln', 40, 20, 160, 20, 4], ['pad', 'h1', 0, 0, 5], ['pad', 'h2', 0, 0, 5]] },
  aperturas_manc: { v: 'f', fl: 0, anc: ['hip', 100, 110], base: { t: 180, F1: [4, 75] }, A: { H1: [-8, 22] }, B: { H1: [50, 6] },
    eq: [['box', 86, 44, 28, 110], ['db', 'h1'], ['db', 'h2']] },
  flexiones: { ...PUSHUP },
  flexiones_incl: { anc: ['an1', 30, 118], fl: ['h1'], base: { ft1: 30 }, A: { t: 85, F1: [-75, -6], H1: [0, 50] }, B: { t: 77, F1: [-73, -17], H1: [3, 33] },
    eq: [['box', 8, 123, 40, 60]] },
  fondos: { anc: ['h1', 120, 90], fl: 0, base: { t: 172, F1: [-18, 62], kb: 1 }, A: { H1: [2, 50] }, B: { H1: [10, 22] },
    eq: [['ln', 95, 92, 150, 92, 6], ['ln', 140, 92, 140, 175, 4]] },

  // ---------- ESPALDA ----------
  jalon_pecho: { v: 'f', anc: ['hip', 100, 125], fl: ['an1'], base: { t: 180, F1: [8, 40] }, A: { H1: [22, -48] }, B: { H1: [26, -2] },
    eq: [['ln', 80, 131, 120, 131, 7], ['cab', 100, 0, 'hm'], ['bar', 'h1', 'h2', 14]] },
  dominadas: { v: 'f', anc: ['h1', 138, 30], fl: 0, A: { t: 180, H1: [24, -48], F1: [2, 74] }, B: { t: 180, H1: [24, -8], F1: [6, 70] },
    eq: [['ln', 50, 30, 152, 30, 5]] },
  remo_pecho_apoyado: { anc: ['hip', 95, 112], fl: ['an1'], base: { t: 130, F1: [-34, 62] }, A: { H1: [2, 50] }, B: { H1: [-20, 22] },
    eq: [['seg', 'hip', 'sh', 5, 8, 9, 6], ['ln', 108, 128, 104, 164, 4], ['db', 'h1']] },
  remo_polea: { anc: ['hip', 70, 140], fl: 152, base: { F1: [70, -6] }, A: { t: 160, H1: [50, 4] }, B: { t: 185, H1: [6, 22] },
    eq: [['ln', 45, 147, 95, 147, 7], ['ln', 150, 115, 150, 150, 5], ['cab', 192, 138, 'h1'], ['grip', 'h1']] },
  remo_barra: { base: { t: 130, F1: [14, 72] }, A: { H1: [2, 50] }, B: { H1: [-14, 28] }, eq: [['bb', 'h1']] },
  remo_mancuerna: { anc: ['an1', 88, 160], base: { t: 100, F1: [0, 70], F2: [-26, 48], H2: [4, 42] }, A: { H1: [0, 50] }, B: { H1: [-18, 22] },
    eq: [...BENCH(55, 165, 144), ['db', 'h1']] },
  remo_maquina: { anc: ['hip', 90, 124], base: { ...SIT, t: 185 }, A: { H1: [48, 4] }, B: { H1: [2, 14] },
    eq: [...SEAT(70, 118, 131), ['ln', 113, 74, 113, 104, 8], ['ln', 158, 40, 158, 164, 5], ['grip', 'h1']] },
  pullover_polea: { base: { t: 155, F1: [6, 75] }, A: { H1: [28, -42] }, B: { H1: [12, 48] }, eq: [['cab', 192, 10, 'h1'], ['grip', 'h1']] },
  remo_invertido: { anc: ['h1', 150, 90], fl: ['an1'], base: { ft1: 198 }, A: { t: 108, F1: [-71, 23], H1: [0, -50] }, B: { t: 123, F1: [-63, 41], H1: [6, -16] },
    eq: [['ln', 150, 94, 150, 180, 4], ['pad', [150, 90], 0, 0, 4]] },
  remo_toalla: { A: { t: 200, F1: [26, 70], H1: [50, -4] }, B: { t: 188, F1: [10, 74], H1: [12, 12] },
    eq: [['ln', 184, 15, 184, 164, 5], ['rope', 'h1', [184, 80]]] },

  // ---------- HOMBROS ----------
  press_militar_manc: { anc: ['hip', 95, 124], base: SIT, A: { H1: [2, -50] }, B: { H1: [8, -4] }, eq: [BACKREST(), ...SEAT(75, 115, 131), ['db', 'h1']] },
  press_hombro_maq: { anc: ['hip', 95, 124], base: SIT, A: { H1: [2, -50] }, B: { H1: [10, -2] }, eq: [BACKREST(), ...SEAT(75, 115, 131), ['ln', 150, 10, 150, 164, 5], ['grip', 'h1']] },
  elev_lat: { v: 'f', anc: ['an1', 111, 160], base: { t: 180, F1: [4, 75] }, A: { H1: [10, 50] }, B: { H1: [50, -4] }, eq: [['db', 'h1'], ['db', 'h2']] },
  elev_lat_polea: { v: 'f', anc: ['an1', 111, 160], base: { t: 180, F1: [4, 75], H2: [10, 50] }, A: { H1: [-8, 48] }, B: { H1: [50, -4] }, eq: [['cab', 30, 158, 'h1'], ['grip', 'h1']] },
  face_pull: { base: { t: 175, F1: [-4, 75], F2: [-20, 72] }, A: { H1: [48, -12] }, B: { H1: [10, -26] }, eq: [['cab', 192, 40, 'h1'], ['grip', 'h1']] },
  pajaros: { v: 'f', tl: 24, anc: ['an1', 111, 160], base: { t: 180, F1: [4, 74] }, A: { H1: [6, 48] }, B: { H1: [48, 6] }, eq: [['db', 'h1'], ['db', 'h2']] },

  // ---------- BÍCEPS ----------
  curl_barra: { base: STAND, A: { H1: [8, 50] }, B: { H1: [14, 4] }, eq: [['bb', 'h1']] },
  curl_martillo: { base: STAND, A: { H1: [8, 50] }, B: { H1: [14, 4] }, eq: [['db', 'h1']] },
  curl_inclinado: { anc: ['hip', 100, 124], base: { ...SIT, t: 215 }, A: { H1: [-2, 51] }, B: { H1: [10, 4] },
    eq: [['seg', 'hip', 'sh', -5.7, 4, 8, 6], ...SEAT(95, 135, 131), ['db', 'h1']] },
  curl_bayesian: { base: { t: 180, F1: [-12, 74], F2: [16, 73] }, A: { H1: [-18, 49] }, B: { H1: [3, 4] }, eq: [['cab', 15, 150, 'h1'], ['grip', 'h1']] },
  curl_predicador: { anc: ['hip', 85, 125], base: { t: 170, F1: [34, 40] }, A: { H1: [33, 40] }, B: { H1: [22, -4] },
    eq: [['ln', 97, 92, 118, 116, 8], ['ln', 112, 118, 112, 164, 4], ...SEAT(65, 100, 131), ['bb', 'h1']] },
  curl_toalla: { base: STAND, A: { H1: [12, 10] }, B: { H1: [10, 6] }, eq: [['rope', 'h1', 'toe1']] },

  // ---------- TRÍCEPS ----------
  ext_tricep_cabeza: { anc: ['hip', 95, 124], base: SIT, A: { H1: [-4, -4] }, B: { H1: [6, -51] }, eq: [BACKREST(), ...SEAT(75, 115, 131), ['db', 'h1']] },
  ext_tricep_polea_alta: { base: { t: 155, F1: [10, 74], F2: [-14, 74] }, A: { H1: [-2, -4] }, B: { H1: [26, -45] }, eq: [['cab', 30, 60, 'h1'], ['grip', 'h1']] },
  jalon_triceps: { base: { t: 174, F1: [0, 75] }, A: { H1: [10, 4] }, B: { H1: [8, 51] }, eq: [['cab', 135, 8, 'h1'], ['grip', 'h1']] },
  fondos_banco: { anc: ['h1', 90, 112], fl: ['an1'], base: { t: 180, ft1: 160 }, A: { H1: [-10, 50], F1: [70, 54] }, B: { H1: [-14, 22], F1: [66, 26] },
    eq: [['ln', 35, 114, 92, 114, 8], ['ln', 43, 114, 43, 175, 4]] },
  flexiones_diamante: { ...PUSHUP },

  // ---------- CUÁDRICEPS ----------
  sentadilla: { rel: 1, base: { H1: [-19, -10], eb: -1 }, A: { t: 178, F1: [2, 75] }, B: { t: 136, F1: [21, 34] }, eq: [['bbk', 'h1', -3, -2, 15]] },
  sentadilla_goblet: { A: { t: 180, F1: [0, 75], H1: [12, 14] }, B: { t: 150, F1: [19, 35], H1: [14, 16] }, eq: [['db', 'h1']] },
  sentadilla_corporal: { A: { t: 180, F1: [0, 75], H1: [4, 51] }, B: { t: 145, F1: [19, 35], H1: [50, 4] } },
  sentadilla_hack: { anc: ['an1', 110, 160], base: { t: 200, H1: [4, -8] }, A: { F1: [26, 70] }, B: { F1: [42, 22] },
    eq: [['seg', 'hip', 'sh', -7, -3, 9, 14], ['pad', 'sh', -2, -6, 5], ['grip', 'h1']] },
  prensa: { anc: ['hip', 70, 130], fl: 150, base: { t: 240, H1: [20, 22], ft1: 225 }, A: { F1: [53, -53] }, B: { F1: [32, -32] },
    eq: [['seg', 'hip', 'sh', -3.5, 6, 9, 8], ['ln', 55, 138, 85, 138, 8], ['ln', 70, 140, 70, 150, 5], ['seg', 'an1', 'toe1', 0, 0, 6, 10]] },
  bulgara: { anc: ['an1', 115, 160], base: { ft2: -90, H1: [4, 51] }, A: { t: 180, F1: [10, 74], F2: [-65, 31] }, B: { t: 168, F1: [22, 48], F2: [-53, 6] },
    eq: [...BENCH(22, 66, 126), ['db', 'h1']] },
  zancadas: { anc: ['an1', 130, 160], base: { ft2: 30, H1: [4, 51] }, A: { t: 180, F1: [26, 72], F2: [-38, 58] }, B: { t: 178, F1: [30, 42], F2: [-40, 32] },
    eq: [['db', 'h1']] },
  step_up: { anc: ['an1', 128, 124], fl: 164, base: { H1: [4, 51] }, A: { t: 172, F1: [28, 34], F2: [-5, 70] }, B: { t: 180, F1: [3, 72], F2: [-6, 60] },
    eq: [['box', 112, 127, 55, 37]] },
  ext_cuadriceps: { anc: ['hip', 85, 120], base: { t: 192, H1: [10, 20] }, A: { F1: [38, 37] }, B: { F1: [74, -8] },
    eq: [BACKREST(), ['ln', 70, 128, 125, 128, 8], ['ln', 110, 128, 110, 164, 4], ['pad', 'an1', 5, -5, 6]] },

  // ---------- FEMORAL ----------
  peso_muerto_rumano: { A: { t: 180, F1: [0, 75], H1: [4, 51] }, B: { t: 105, F1: [16, 73], H1: [0, 51] }, eq: [['bb', 'h1']] },
  curl_femoral_sentado: { anc: ['hip', 85, 120], base: { t: 188, H1: [10, 20] }, A: { F1: [74, -4] }, B: { F1: [25, 35] },
    eq: [BACKREST(), ['ln', 70, 128, 125, 128, 8], ['ln', 100, 128, 100, 164, 4], ['ln', 105, 108, 128, 108, 7], ['pad', 'an1', -2, 6, 6]] },
  curl_femoral_acostado: { anc: ['hip', 80, 110], base: { t: 90, hd: 90, H1: [24, 38] }, A: { F1: [-75, 2] }, B: { F1: [-25, -35] },
    eq: [...BENCH(30, 150, 118), ['pad', 'an1', 2, -7, 6]] },
  curl_nordico: { anc: ['k1', 80, 155], fl: 161, base: { ...KNEEL }, A: { t: 180, H1: [10, 14] }, B: { t: 128, F1: [-66, 24], H1: [24, 36] },
    eq: [['pad', 'an1', 0, -7, 5]] },

  // ---------- GLÚTEOS ----------
  hip_thrust: { anc: ['sh', 60, 110], fl: ['an1'], base: { H1: [-30, 8], eb: -1 }, A: { t: 235, F1: [35, 20] }, B: { t: 270, F1: [29, 48] },
    eq: [...BENCH(15, 64, 116), ['bb', 'hip', 0, -9]] },
  puente_gluteo: { anc: ['sh', 55, 150], fl: ['an1'], base: { H1: [50, 4] }, A: { t: 270, F1: [37, 6] }, B: { t: 304, F1: [45, 32] } },
  puente_una_pierna: { anc: ['sh', 55, 150], fl: ['an1'], base: { H1: [50, 4] }, A: { t: 270, F1: [37, 6], F2: [55, -45] }, B: { t: 304, F1: [45, 32], F2: [60, -40] } },
  abduccion_maq: { v: 'f', anc: ['hip', 100, 118], fl: ['an1'], base: { t: 180, H1: [14, 40] }, A: { F1: [4, 46] }, B: { F1: [26, 44] },
    eq: [['ln', 75, 124, 125, 124, 7], ['pad', 'k1', 6, 0, 5], ['pad', 'k2', -6, 0, 5]] },
  patada_gluteo: { anc: ['an2', 100, 160], base: { t: 160, F2: [0, 75], H1: [42, 18] }, A: { F1: [4, 72] }, B: { F1: [-60, 30] },
    eq: [['cab', 20, 158, 'an1'], ['ln', 152, 40, 152, 164, 5], ['grip', 'h1']] },

  // ---------- PANTORRILLA ----------
  gemelo_pie: { anc: ['toe1', 115, 150], fl: 164, base: { t: 180, F1: [0, 75], H1: [4, 51] }, A: { ft1: 110 }, B: { ft1: 55 },
    eq: [['box', 105, 152, 55, 12], ['db', 'h1']] },
  gemelo_prensa: { anc: ['hip', 70, 130], fl: 150, base: { t: 240, H1: [20, 22], F1: [53, -53] }, A: { ft1: 240 }, B: { ft1: 200 },
    eq: [['seg', 'hip', 'sh', -3.5, 6, 9, 8], ['ln', 55, 138, 85, 138, 8], ['ln', 70, 140, 70, 150, 5], ['seg', 'an1', 'toe1', 0, 0, 6, 10]] },

  // ---------- ABDOMEN ----------
  crunch_polea: { anc: ['k1', 100, 158], fl: 164, base: { ...KNEEL }, A: { t: 170, H1: [6, -12] }, B: { t: 100, H1: [14, 0] }, eq: [['cab', 150, 5, 'h1'], ['grip', 'h1']] },
  plancha: { anc: ['an1', 30, 152], fl: ['h1'], base: { ft1: 15, H1: [24, 27] }, A: { t: 102, F1: [-73, 16] }, B: { t: 100, F1: [-74, 13] }, dur: 4000 },
  crunch: { anc: ['hip', 100, 154], fl: 161, base: { F1: [40, 4] }, A: { t: 270, H1: [-10, -6] }, B: { t: 240, H1: [-10, -10] } },
  elev_piernas: { anc: ['h1', 100, 22], fl: 0, base: { t: 180, H1: [2, -51] }, A: { F1: [2, 75] }, B: { F1: [72, -6] }, eq: [['ln', 60, 22, 150, 22, 5]] },
  rueda: { anc: ['k1', 60, 155], fl: 162, base: { ft1: -100 }, A: { t: 120, F1: [-42, 36], H1: [5, 53] }, B: { t: 100, F1: [-66, 24], H1: [46, 26] }, eq: [['wheel', 'h1', 0, 4]] },
};
