// ====== Datos fijos de la app ======
// Ejercicio: id, n(nombre), g(grupo), s(subgrupo), k('c' compuesto | 'i' aislamiento),
// e(equipo: g=gimnasio, c=casa con mancuernas, b=peso corporal), m(máquina/polea),
// av(evitar si: r=rodilla, e=espalda baja, h=hombro, m=muñeca, n=cuello),
// t(prioridad 1-3: 3 = de los más efectivos según la evidencia), y(por qué), p(pasos)
const EX = [
// ---------- PECHO ----------
{id:'press_banca',n:'Press de banca con barra',g:'pecho',s:'h',k:'c',e:'g',av:'hm',t:3,y:'Compuesto base: permite cargas altas y progresar fácil.',p:['Escápulas juntas y abajo, pies firmes.','Baja la barra controlada a la parte baja del pecho.','Empuja hasta casi extender los codos.']},
{id:'press_mancuernas',n:'Press con mancuernas',g:'pecho',s:'h',k:'c',e:'gc',av:'h',t:3,y:'Mayor rango de movimiento y estiramiento del pecho que la barra.',p:['Acostado, mancuernas a la altura del pecho.','Baja hasta sentir estiramiento en el pecho.','Empuja juntando ligeramente las mancuernas arriba.']},
{id:'press_inclinado',n:'Press inclinado con mancuernas',g:'pecho',s:'s',k:'c',e:'gc',av:'h',t:3,y:'Enfatiza la parte superior del pecho (banco a 30°).',p:['Banco a unos 30 grados.','Baja las mancuernas a los lados del pecho alto.','Empuja hacia arriba sin bloquear los codos.']},
{id:'press_maquina',n:'Press de pecho en máquina',g:'pecho',s:'h',k:'c',e:'g',m:1,av:'',t:3,y:'Estable y seguro: puedes llegar cerca del fallo sin riesgo.',p:['Ajusta el asiento: agarres a la altura del pecho medio.','Empuja sin despegar la espalda.','Regresa lento hasta sentir estiramiento.']},
{id:'press_inclinado_maq',n:'Press inclinado en máquina o Smith',g:'pecho',s:'s',k:'c',e:'g',m:1,av:'',t:2,y:'Pecho superior con estabilidad.',p:['Banco o máquina a 30 grados.','Baja controlado al pecho alto.','Empuja fuerte sin rebotar.']},
{id:'aperturas_polea',n:'Aperturas en polea',g:'pecho',s:'i',k:'i',e:'g',m:1,av:'',t:3,y:'Tensión constante y buen estiramiento del pecho.',p:['Poleas a la altura del hombro, un paso adelante.','Abre los brazos con codos semiflexionados hasta sentir estiramiento.','Cierra abrazando un árbol.']},
{id:'pec_deck',n:'Pec deck (máquina de aperturas)',g:'pecho',s:'i',k:'i',e:'g',m:1,av:'',t:2,y:'Aislamiento de pecho muy estable.',p:['Espalda pegada al respaldo.','Abre hasta sentir estiramiento.','Junta los brazos apretando el pecho.']},
{id:'aperturas_manc',n:'Aperturas con mancuernas',g:'pecho',s:'i',k:'i',e:'gc',av:'h',t:2,y:'Estiramiento del pecho con poco equipo.',p:['Acostado, brazos arriba con codos semiflexionados.','Abre en arco hasta sentir estiramiento.','Vuelve arriba apretando el pecho.']},
{id:'flexiones',bw:1,n:'Flexiones de pecho',g:'pecho',s:'h',k:'c',e:'gcb',av:'m',t:3,y:'Tan efectivas como el press cuando se llevan cerca del fallo.',p:['Manos un poco más abiertas que los hombros.','Cuerpo recto, baja el pecho casi al piso.','Empuja hasta extender los brazos.']},
{id:'flexiones_incl',bw:1,n:'Flexiones con pies elevados',g:'pecho',s:'s',k:'c',e:'cb',av:'m',t:2,y:'Más difícil y enfatiza el pecho superior.',p:['Pies sobre una silla o banco.','Baja el pecho controlado.','Empuja manteniendo el core firme.']},
{id:'fondos',d:1,n:'Fondos en paralelas',g:'pecho',s:'h',k:'c',e:'gb',av:'hm',t:2,y:'Pecho bajo y tríceps con el propio peso.',p:['Inclina el torso un poco hacia adelante.','Baja hasta que el hombro quede a la altura del codo.','Empuja hasta extender.']},
// ---------- ESPALDA ----------
{id:'jalon_pecho',n:'Jalón al pecho',g:'espalda',s:'v',k:'c',e:'g',m:1,av:'',t:3,y:'Dorsal ancho con carga ajustable.',p:['Agarre algo más abierto que los hombros.','Lleva la barra al pecho alto sacando pecho.','Sube lento hasta estirar los dorsales.']},
{id:'dominadas',d:1,n:'Dominadas',g:'espalda',s:'v',k:'c',e:'gb',av:'h',t:3,y:'De los mejores ejercicios para espalda y bíceps.',p:['Cuélgate con agarre prono, brazos extendidos.','Sube llevando el pecho hacia la barra.','Baja completo y controlado.']},
{id:'remo_pecho_apoyado',n:'Remo con pecho apoyado',g:'espalda',s:'h',k:'c',e:'gc',av:'',t:3,y:'Trabaja la espalda sin cargar la zona lumbar.',p:['Pecho apoyado en un banco inclinado.','Lleva los codos hacia atrás y aprieta la espalda.','Baja estirando completamente.']},
{id:'remo_polea',n:'Remo sentado en polea',g:'espalda',s:'h',k:'c',e:'g',m:1,av:'',t:3,y:'Tensión constante y estiramiento completo de la espalda.',p:['Espalda recta, pies apoyados.','Tira hacia el abdomen juntando escápulas.','Estira los brazos dejando que la espalda se estire.']},
{id:'remo_barra',n:'Remo con barra',g:'espalda',s:'h',k:'c',e:'g',av:'e',t:2,y:'Compuesto pesado para grosor de espalda.',p:['Inclínate a 45° con espalda recta.','Lleva la barra al ombligo.','Baja controlado sin redondear la espalda.']},
{id:'remo_mancuerna',n:'Remo con mancuerna a una mano',g:'espalda',s:'h',k:'c',e:'gc',av:'',t:3,y:'Gran rango de movimiento y apoyo para la zona lumbar.',p:['Rodilla y mano apoyadas en el banco.','Lleva la mancuerna hacia la cadera.','Baja estirando el dorsal.']},
{id:'remo_maquina',n:'Remo en máquina',g:'espalda',s:'h',k:'c',e:'g',m:1,av:'',t:2,y:'Estable, fácil de llevar cerca del fallo.',p:['Pecho contra el apoyo.','Tira con los codos hacia atrás.','Regresa estirando.']},
{id:'pullover_polea',n:'Pullover en polea alta',g:'espalda',s:'i',k:'i',e:'g',m:1,av:'',t:2,y:'Aísla el dorsal sin que los bíceps limiten.',p:['De pie frente a la polea alta, brazos casi rectos.','Baja la barra en arco hasta los muslos.','Sube lento hasta estirar los dorsales.']},
{id:'remo_invertido',bw:1,n:'Remo invertido',g:'espalda',s:'h',k:'c',e:'gb',av:'',t:2,y:'Remo con peso corporal, ajustable inclinando el cuerpo.',p:['Bajo una barra o mesa firme, cuerpo recto.','Tira llevando el pecho a la barra.','Baja controlado.']},
{id:'remo_toalla',bw:1,n:'Remo con toalla en puerta',g:'espalda',s:'h',k:'c',e:'b',av:'',t:1,y:'Alternativa sin equipo para la espalda.',p:['Toalla atrapada en una puerta cerrada, sujeta los extremos.','Inclínate hacia atrás con el cuerpo recto.','Tira apretando la espalda.']},
// ---------- HOMBROS ----------
{id:'press_militar_manc',n:'Press de hombro con mancuernas',g:'hombros',s:'p',k:'c',e:'gc',av:'h',t:3,y:'Compuesto para el deltoide frontal y lateral.',p:['Sentado, mancuernas a la altura de las orejas.','Empuja hacia arriba sin arquear la espalda.','Baja controlado.']},
{id:'press_hombro_maq',n:'Press de hombro en máquina',g:'hombros',s:'p',k:'c',e:'g',m:1,av:'',t:2,y:'Más estable y amable con el hombro.',p:['Ajusta el asiento: agarres a la altura del hombro.','Empuja arriba.','Baja lento.']},
{id:'elev_lat_polea',n:'Elevaciones laterales en polea',g:'hombros',s:'l',k:'i',e:'g',m:1,av:'',t:3,y:'Tensión en todo el recorrido, incluido abajo, donde la mancuerna no carga.',p:['Polea baja al lado contrario del brazo que trabaja.','Sube el brazo de lado hasta la altura del hombro.','Baja lento.']},
{id:'elev_lat',n:'Elevaciones laterales con mancuernas',g:'hombros',s:'l',k:'i',e:'gc',av:'',t:3,y:'Clave para hombros anchos (deltoide lateral).',p:['De pie, codos ligeramente flexionados.','Sube los brazos de lado hasta la altura del hombro.','Baja controlado, sin balancearte.']},
{id:'face_pull',n:'Face pull en polea',g:'hombros',s:'r',k:'i',e:'g',m:1,av:'',t:3,y:'Deltoide posterior y salud del hombro.',p:['Polea a la altura de la cara, con cuerda.','Tira hacia la cara abriendo los codos.','Regresa controlado.']},
{id:'pajaros',n:'Pájaros (deltoide posterior)',g:'hombros',s:'r',k:'i',e:'gc',av:'',t:2,y:'Deltoide posterior con mancuernas.',p:['Inclinado o con pecho apoyado.','Abre los brazos hacia los lados.','Baja lento.']},
{id:'pike_pushup',d:1,bw:1,n:'Flexiones pike',g:'hombros',s:'p',k:'c',e:'b',av:'hm',t:2,y:'Press de hombro con peso corporal.',p:['Cadera arriba formando una V invertida.','Baja la cabeza hacia el piso entre las manos.','Empuja de vuelta.']},
// ---------- BÍCEPS ----------
{id:'curl_inclinado',n:'Curl inclinado con mancuernas',g:'biceps',s:'i',k:'i',e:'gc',av:'',t:3,y:'Trabaja el bíceps estirado; la evidencia muestra más crecimiento así.',p:['Banco a 45°, brazos colgando detrás del cuerpo.','Sube sin mover los codos.','Baja completo hasta estirar.']},
{id:'curl_bayesian',n:'Curl en polea detrás del cuerpo',g:'biceps',s:'i',k:'i',e:'g',m:1,av:'',t:3,y:'Bíceps en posición estirada con tensión constante.',p:['De espaldas a la polea baja, brazo atrás.','Flexiona el codo sin moverlo hacia adelante.','Baja lento hasta estirar.']},
{id:'curl_barra',n:'Curl con barra',g:'biceps',s:'i',k:'i',e:'g',av:'m',t:2,y:'Permite cargar pesado y progresar.',p:['De pie, agarre al ancho de hombros.','Sube sin balancear el cuerpo.','Baja controlado.']},
{id:'curl_martillo',n:'Curl martillo',g:'biceps',s:'i',k:'i',e:'gc',av:'',t:2,y:'Bíceps y braquial para brazos más gruesos.',p:['Mancuernas con palmas mirándose.','Sube sin mover los codos.','Baja lento.']},
{id:'curl_predicador',n:'Curl predicador',g:'biceps',s:'i',k:'i',e:'g',m:1,av:'',t:2,y:'Aísla el bíceps y carga la parte baja del movimiento.',p:['Brazos apoyados en el banco predicador.','Sube sin despegar los brazos.','Baja casi hasta extender.']},
{id:'curl_toalla',bw:1,n:'Curl isométrico con toalla',g:'biceps',s:'i',k:'i',e:'b',av:'',t:1,y:'Opción sin equipo para bíceps.',p:['Pisa el centro de una toalla.','Tira hacia arriba con fuerza flexionando los codos.','Mantén 3 s y repite.']},
// ---------- TRÍCEPS ----------
{id:'ext_tricep_cabeza',n:'Extensión de tríceps sobre la cabeza',g:'triceps',s:'o',k:'i',e:'gc',av:'h',t:3,y:'Estira la cabeza larga del tríceps: en estudios creció bastante más que con jalones.',p:['Mancuerna o polea detrás de la cabeza.','Extiende los codos hacia arriba.','Baja hasta sentir el estiramiento.']},
{id:'ext_tricep_polea_alta',n:'Extensión sobre la cabeza en polea',g:'triceps',s:'o',k:'i',e:'g',m:1,av:'h',t:3,y:'Tríceps estirado con tensión constante.',p:['De espaldas a la polea, cuerda detrás de la cabeza.','Extiende los brazos hacia adelante y arriba.','Regresa lento.']},
{id:'jalon_triceps',n:'Jalón de tríceps en polea',g:'triceps',s:'p',k:'i',e:'g',m:1,av:'',t:2,y:'Fácil de aprender y de progresar.',p:['Codos pegados al cuerpo.','Empuja hacia abajo hasta extender.','Sube controlado.']},
{id:'press_cerrado',n:'Press de banca agarre cerrado',g:'triceps',s:'c',k:'c',e:'g',av:'hm',t:2,y:'Compuesto que permite cargar pesado el tríceps.',p:['Agarre al ancho de los hombros.','Baja con los codos cerca del cuerpo.','Empuja extendiendo.']},
{id:'fondos_banco',bw:1,n:'Fondos en banco',g:'triceps',s:'c',k:'c',e:'cb',av:'hm',t:1,y:'Tríceps con el peso corporal.',p:['Manos en el borde de un banco o silla.','Baja flexionando los codos.','Empuja hasta extender.']},
{id:'flexiones_diamante',bw:1,n:'Flexiones diamante',g:'triceps',s:'c',k:'c',e:'cb',av:'m',t:2,y:'Flexión enfocada en tríceps.',p:['Manos juntas formando un diamante.','Baja el pecho hacia las manos.','Empuja.']},
// ---------- CUÁDRICEPS ----------
{id:'sentadilla',n:'Sentadilla con barra',g:'cuad',s:'c',k:'c',e:'g',av:'re',t:3,y:'Compuesto rey de la pierna; la sentadilla profunda trabaja más glúteo y aductores.',p:['Barra sobre la espalda alta, pies al ancho de hombros.','Baja hasta que el muslo quede paralelo o más abajo.','Sube empujando el piso.']},
{id:'sentadilla_hack',n:'Sentadilla hack o péndulo',g:'cuad',s:'c',k:'c',e:'g',m:1,av:'',t:3,y:'Cuádriceps a fondo con la espalda apoyada.',p:['Espalda contra el respaldo, pies a media plataforma.','Baja profundo y controlado.','Empuja hasta casi extender.']},
{id:'prensa',n:'Prensa de piernas',g:'cuad',s:'c',k:'c',e:'g',m:1,av:'',t:3,y:'Mucha carga para la pierna con poco riesgo para la espalda.',p:['Pies a la mitad de la plataforma.','Baja hasta que las rodillas pasen los 90°, sin despegar la cadera.','Empuja sin bloquear las rodillas.']},
{id:'bulgara',n:'Sentadilla búlgara',g:'cuad',s:'u',k:'c',e:'gcb',av:'',t:3,y:'Unilateral muy efectiva para cuádriceps y glúteo.',p:['Pie de atrás apoyado en un banco.','Baja la rodilla de atrás hacia el piso.','Sube empujando con la pierna de adelante.']},
{id:'sentadilla_goblet',n:'Sentadilla goblet',g:'cuad',s:'c',k:'c',e:'gc',av:'r',t:2,y:'Sentadilla con mancuerna, fácil de aprender.',p:['Mancuerna pegada al pecho.','Baja profundo con el torso erguido.','Sube empujando el piso.']},
{id:'ext_cuadriceps',n:'Extensión de cuádriceps',g:'cuad',s:'i',k:'i',e:'g',m:1,av:'r',t:3,y:'Trabaja el recto femoral, que la sentadilla casi no estimula.',p:['Ajusta el respaldo: rodilla alineada con el eje.','Extiende las piernas por completo.','Baja lento hasta flexionar bien.']},
{id:'zancadas',n:'Zancadas caminando',g:'cuad',s:'u',k:'c',e:'gcb',av:'r',t:2,y:'Cuádriceps y glúteo con equilibrio.',p:['Da un paso largo al frente.','Baja la rodilla de atrás casi al piso.','Avanza con la otra pierna.']},
{id:'sentadilla_corporal',bw:1,n:'Sentadilla con peso corporal',g:'cuad',s:'c',k:'c',e:'b',av:'r',t:1,y:'Base para principiantes en casa.',p:['Pies al ancho de los hombros.','Baja llevando la cadera atrás.','Sube.']},
{id:'step_up',n:'Subidas al cajón',g:'cuad',s:'u',k:'c',e:'gcb',av:'',t:2,y:'Unilateral de bajo impacto para la rodilla.',p:['Pie completo sobre un cajón o escalón.','Sube empujando con esa pierna.','Baja lento.']},
// ---------- FEMORAL ----------
{id:'peso_muerto_rumano',n:'Peso muerto rumano',g:'femoral',s:'h',k:'c',e:'gc',av:'e',t:3,y:'De los mejores para isquiotibiales y glúteo en estiramiento.',p:['Barra o mancuernas frente a los muslos.','Lleva la cadera atrás con la espalda recta hasta sentir estiramiento.','Sube apretando glúteos.']},
{id:'curl_femoral_sentado',n:'Curl femoral sentado',g:'femoral',s:'k',k:'i',e:'g',m:1,av:'',t:3,y:'En estudios hizo crecer más el femoral que el curl acostado.',p:['Ajusta la máquina con la rodilla en el eje.','Flexiona las rodillas por completo.','Regresa lento.']},
{id:'curl_femoral_acostado',n:'Curl femoral acostado',g:'femoral',s:'k',k:'i',e:'g',m:1,av:'',t:2,y:'Buena alternativa si no hay curl sentado.',p:['Boca abajo, rodillas en el eje.','Lleva los talones hacia los glúteos.','Baja controlado.']},
{id:'curl_nordico',d:1,n:'Curl nórdico',g:'femoral',s:'k',k:'i',e:'gb',av:'r',t:2,y:'Fortalece el femoral y previene lesiones.',p:['De rodillas con los tobillos sujetos.','Déjate caer adelante lo más lento posible.','Ayúdate con las manos para volver.']},
{id:'puente_una_pierna',bw:1,n:'Puente de glúteo a una pierna',g:'femoral',s:'h',k:'i',e:'cb',av:'',t:1,y:'Femoral y glúteo sin equipo.',p:['Acostado, un pie en el piso y la otra pierna arriba.','Sube la cadera apretando el glúteo.','Baja lento.']},
// ---------- GLÚTEOS ----------
{id:'hip_thrust',n:'Hip thrust',g:'gluteos',s:'h',k:'c',e:'gc',av:'',t:3,y:'Gran activación del glúteo con carga alta.',p:['Espalda alta apoyada en un banco, carga sobre la cadera.','Sube la cadera hasta alinear el torso.','Aprieta arriba 1 s y baja.']},
{id:'abduccion_maq',n:'Abducción de cadera en máquina',g:'gluteos',s:'a',k:'i',e:'g',m:1,av:'',t:2,y:'Glúteo medio y superior.',p:['Siéntate inclinado un poco hacia adelante.','Abre las piernas contra la resistencia.','Regresa lento.']},
{id:'patada_gluteo',n:'Patada de glúteo en polea',g:'gluteos',s:'a',k:'i',e:'g',m:1,av:'',t:2,y:'Aislamiento de glúteo.',p:['Tobillera en polea baja.','Lleva la pierna atrás apretando el glúteo.','Regresa controlado.']},
{id:'puente_gluteo',bw:1,n:'Puente de glúteo',g:'gluteos',s:'h',k:'c',e:'cb',av:'',t:2,y:'Glúteo en casa; agrega carga cuando sea fácil.',p:['Acostado, pies cerca de los glúteos.','Sube la cadera apretando.','Baja lento.']},
// ---------- PANTORRILLA ----------
{id:'gemelo_pie',n:'Elevación de talones de pie',g:'pantorrilla',s:'p',k:'i',e:'gcb',av:'',t:3,y:'Con pausa abajo en estiramiento: es lo que más hace crecer la pantorrilla.',p:['Puntas sobre un escalón.','Baja el talón al máximo y pausa 1 s.','Sube hasta la punta.']},
{id:'gemelo_prensa',n:'Gemelo en prensa',g:'pantorrilla',s:'p',k:'i',e:'g',m:1,av:'',t:2,y:'Permite cargar mucho la pantorrilla.',p:['Puntas en el borde de la plataforma.','Estira el talón al máximo.','Empuja con las puntas.']},
// ---------- ABDOMEN ----------
{id:'crunch_polea',n:'Crunch en polea',g:'abdomen',s:'f',k:'i',e:'g',m:1,av:'',t:3,y:'Abdomen con carga progresiva.',p:['De rodillas frente a la polea alta.','Flexiona el tronco llevando los codos a las rodillas.','Sube lento.']},
{id:'elev_piernas',d:1,n:'Elevación de piernas colgado',g:'abdomen',s:'f',k:'i',e:'gb',av:'h',t:3,y:'Abdomen completo, sobre todo la parte baja.',p:['Cuélgate de una barra.','Sube las piernas sin balancearte.','Baja controlado.']},
{id:'plancha',n:'Plancha',g:'abdomen',s:'e',k:'i',e:'gcb',av:'',t:2,y:'Estabilidad del core.',p:['Antebrazos en el piso, cuerpo recto.','Aprieta abdomen y glúteos.','Mantén el tiempo indicado.']},
{id:'crunch',bw:1,n:'Crunch abdominal',g:'abdomen',s:'f',k:'i',e:'cb',av:'n',t:1,y:'Abdomen básico en casa.',p:['Acostado, rodillas flexionadas.','Sube los hombros del piso contrayendo el abdomen.','Baja lento.']},
{id:'rueda',d:1,n:'Rueda abdominal',g:'abdomen',s:'e',k:'i',e:'gc',av:'e',t:2,y:'Core muy exigente.',p:['De rodillas con la rueda.','Rueda adelante manteniendo la espalda neutra.','Regresa contrayendo el abdomen.']},
];

const GROUP_NAMES = {pecho:'Pecho',espalda:'Espalda',hombros:'Hombros',biceps:'Bíceps',triceps:'Tríceps',cuad:'Cuádriceps',femoral:'Femoral',gluteos:'Glúteos',pantorrilla:'Pantorrilla',abdomen:'Abdomen'};
// Prioridades que elige el usuario -> grupos
const PRI_MAP = {Brazos:['biceps','triceps'],Pecho:['pecho'],Espalda:['espalda'],Hombros:['hombros'],Pierna:['cuad','femoral'],'Glúteos':['gluteos'],Abdomen:['abdomen']};
const PRI_LIST = Object.keys(PRI_MAP);
const LIM_LIST = [['r','Rodilla'],['e','Espalda baja'],['h','Hombro'],['m','Muñeca'],['n','Cuello']];

const GOALS = {
  musculo:{n:'Ganar músculo',i:'ti-barbell'},
  grasa:{n:'Bajar grasa',i:'ti-flame'},
  resis:{n:'Resistencia',i:'ti-run'},
  fuerza:{n:'Fuerza',i:'ti-weight'},
  salud:{n:'Salud general',i:'ti-heart'}
};
const LEVELS = {p:['Principiante','Menos de 6 meses entrenando'],i:['Intermedio','De 6 meses a 2 años'],a:['Avanzado','Más de 2 años constante']};
const PLACES = {g:['Gimnasio completo','ti-building'],c:['Casa con mancuernas','ti-home'],b:['Solo peso corporal','ti-stretching']};

const COLORS = [
  {n:'Rojo',ac:'#ff4d4d',on:'#1a0505',soft:'#2a1212',line:'#5c1414',tx:'#ff9a9a'},
  {n:'Verde',ac:'#3ddc84',on:'#04210f',soft:'#0f2a1a',line:'#1b5c36',tx:'#8ff0b8'},
  {n:'Azul',ac:'#4d9fff',on:'#04142b',soft:'#0f1e33',line:'#1d3f6b',tx:'#9cc8ff'},
  {n:'Rosado',ac:'#ff5fa2',on:'#2b0416',soft:'#2e1020',line:'#6b1d42',tx:'#ffa3c9'},
  {n:'Naranja',ac:'#ff8a3d',on:'#2b1204',soft:'#2e1a0c',line:'#6b3a17',tx:'#ffbb8f'},
  {n:'Morado',ac:'#a77bff',on:'#160a2e',soft:'#1e1430',line:'#45307a',tx:'#cbb3ff'},
  {n:'Amarillo',ac:'#ffd23d',on:'#2b2204',soft:'#2e260c',line:'#6b5a17',tx:'#ffe48f'},
  {n:'Plateado',ac:'#c9ced4',on:'#111316',soft:'#23262a',line:'#4a4f56',tx:'#e4e7ea'}
];

const LEVEL_NAMES = ['Novato','Aprendiz','Constante','Decidido','Atleta','Fuerte','Guerrero','Titán','Espartano','Leyenda','Imparable','Inmortal'];

const QUOTES = [
'No tienes que ser extremo, solo constante.',
'La disciplina es elegir entre lo que quieres ahora y lo que más quieres.',
'Un mal entrenamiento siempre es mejor que ninguno.',
'Tu único rival es quien eras ayer.',
'La motivación te arranca; el hábito te mantiene.',
'Hazlo cansado, hazlo sin ganas, pero hazlo.',
'El cuerpo logra lo que la mente cree.',
'Cada repetición cuenta, incluso las que nadie ve.',
'No pares cuando estés cansado. Para cuando hayas terminado.',
'Los resultados llegan a los que no se rinden.',
'Hoy duele, mañana es fuerza.',
'Pequeños avances todos los días se vuelven grandes cambios.',
'Entrena por cómo te vas a sentir, no por cómo te sientes ahora.',
'Si fuera fácil, todos lo harían.',
'Suda hoy, sonríe mañana.',
'Tu futuro yo te va a agradecer este esfuerzo.',
'La constancia le gana al talento cuando el talento no es constante.',
'No cuentes los días, haz que los días cuenten.',
'El progreso, no la perfección.',
'Lo difícil de hoy será tu calentamiento de mañana.',
'Nadie se arrepiente de haber entrenado.',
'Gana la mañana, gana el día.',
'La excusa más cómoda es la que más caro sale.',
'Más fuerte que ayer, menos que mañana.',
'El dolor de la disciplina pesa menos que el del arrepentimiento.',
'Empieza donde estás. Usa lo que tienes. Haz lo que puedas.',
'Una hora de entreno es el 4 % de tu día. Sin excusas.',
'Las metas grandes se logran con hábitos pequeños.',
'Tu cuerpo escucha todo lo que tu mente dice.',
'Los campeones entrenan, los demás se quejan.',
'Hoy es un buen día para romper un récord.',
'Disciplina es hacerlo aunque no tengas ganas.',
'El esfuerzo de hoy es el orgullo de mañana.',
'Lo que no te reta no te cambia.',
'Primero te lo propones, luego te lo crees, después lo logras.',
'La fuerza no viene de lo que puedes hacer, sino de superar lo que creías que no.',
'No busques motivación, construye disciplina.',
'Cada gota de sudor es una inversión.',
'Aparecer ya es la mitad de la victoria.',
'Haz que tu yo de hace un año no te reconozca.',
'Un día más, un paso más.',
'Rendirse no está en la rutina.',
'Confía en el proceso.',
'Duro por fuera, constante por dentro.',
'El que madruga para entrenar, ya le ganó a la pereza.',
'No es suerte, es trabajo.',
'Si te cansas, aprende a descansar, no a rendirte.',
'La mejor versión de ti está al otro lado de la incomodidad.',
'Hoy no se negocia.',
'Una serie más. Siempre una serie más.'
];

const TONE = {
  amable:{
    hello:['Buenos días','Buenas tardes','Buenas noches'],
    sub:['Hoy es buen día para romper un récord','Vas muy bien, sigue así','Paso a paso se llega lejos','Tu constancia está dando frutos'],
    rest:'Hoy toca descansar. Recuperarse también es entrenar.',
    half:'Vas por la mitad de la semana',
    done:'Semana completada. Eres una máquina.',
    start:'Vamos con toda',
    streak:'no la sueltes',
    restEnd:'A darle',
  },
  sargento:{
    hello:['Arriba','Despierta','Sin excusas'],
    sub:['Las pesas no se levantan solas','Hoy no se negocia','El sofá puede esperar','Menos pensar, más hacer'],
    rest:'Descansa hoy. Mañana no hay piedad.',
    half:'Apenas vas por la mitad. Nada de relajarse',
    done:'Semana cumplida. Ni se te ocurra aflojar.',
    start:'Muévete',
    streak:'ni se te ocurra romperla',
    restEnd:'Se acabó el descanso',
  }
};

const CHALLENGES = [
  {id:'agua',n:'Cumple tu meta de agua',i:'ti-droplet',auto:'agua'},
  {id:'sueno',n:'Registra 7 h o más de sueño',i:'ti-moon',auto:'sueno'},
  {id:'estira',n:'10 minutos de estiramiento',i:'ti-stretching'},
  {id:'caminar',n:'Camina 30 minutos',i:'ti-walk'},
  {id:'flex',n:'Haz 30 flexiones a lo largo del día',i:'ti-hand-finger'},
  {id:'plancha',n:'Aguanta 2 minutos de plancha en total',i:'ti-clock'},
  {id:'proteina',n:'Come proteína en cada comida',i:'ti-meat'},
  {id:'escaleras',n:'Usa las escaleras todo el día',i:'ti-stairs-up'},
  {id:'sinazucar',n:'Un día sin bebidas azucaradas',i:'ti-bottle'},
  {id:'foto',n:'Tómate una foto de progreso',i:'ti-camera',auto:'foto'},
  {id:'medidas',n:'Registra tu peso de hoy',i:'ti-scale',auto:'peso'}
];

// Logros: id, nombre, icono, condición (recibe stats)
const ACHIEVEMENTS = [
  ['primer','Primer entreno','ti-player-play',s=>s.workouts>=1],
  ['e10','10 entrenos','ti-barbell',s=>s.workouts>=10],
  ['e25','25 entrenos','ti-barbell',s=>s.workouts>=25],
  ['e50','50 entrenos','ti-medal',s=>s.workouts>=50],
  ['e100','100 entrenos','ti-crown',s=>s.workouts>=100],
  ['r7','Racha 7 días','ti-flame',s=>s.bestStreak>=7],
  ['r30','Racha 30 días','ti-flame',s=>s.bestStreak>=30],
  ['r100','Racha 100 días','ti-flame',s=>s.bestStreak>=100],
  ['pr1','Primer récord','ti-trophy',s=>s.prs>=1],
  ['pr10','10 récords','ti-trophy',s=>s.prs>=10],
  ['t10','10 toneladas','ti-weight',s=>s.tonnage>=10000],
  ['t50','50 toneladas','ti-weight',s=>s.tonnage>=50000],
  ['t100','100 toneladas','ti-weight',s=>s.tonnage>=100000],
  ['sem','Semana perfecta','ti-calendar-check',s=>s.perfectWeeks>=1],
  ['sem4','4 semanas perfectas','ti-calendar-star',s=>s.perfectWeeks>=4],
  ['foto1','Primera foto','ti-camera',s=>s.photos>=1],
  ['foto4','4 fotos de progreso','ti-photo',s=>s.photos>=4],
  ['agua7','7 días hidratado','ti-droplet',s=>s.waterDays>=7],
  ['reto10','10 retos cumplidos','ti-target-arrow',s=>s.challenges>=10],
  ['nivel5','Nivel 5','ti-shield-half',s=>s.level>=5],
  ['nivel10','Nivel 10','ti-shield-check',s=>s.level>=10],
  ['madruga','Madrugador','ti-sunrise',s=>s.early>=1],
];
