# Fuentes científicas de Gym

Qué evidencia respalda cada regla del motor de rutinas (`js/engine.js`) y la selección de ejercicios (`js/data.js`).

| Regla en la app | Evidencia |
|---|---|
| 10 a 20 series semanales por músculo; los músculos prioritarios reciben +1 serie | Schoenfeld, Ogborn y Krieger (2017), *J Sports Sci*: relación dosis-respuesta entre series semanales e hipertrofia. |
| Cada músculo se entrena 2 veces por semana (cuerpo completo, torso/pierna, PPL) | Schoenfeld, Ogborn y Krieger (2016), *Sports Med*: frecuencia de 2 veces por semana mejor que 1. |
| Hipertrofia en rangos amplios: compuestos 6-10, aislamientos 10-15, cerca del fallo | Schoenfeld et al. (2021), *Sports*, "Loading recommendations…": se crece entre ~6 y 30 reps si se llega cerca del fallo. |
| Fuerza: compuesto principal 3-6 reps, descanso 3 min | Mismo consenso de cargas: la fuerza máxima mejora más con cargas altas. |
| Descansos de 2 min en compuestos (no 1 min) | Schoenfeld et al. (2016), *J Strength Cond Res*: 3 min > 1 min en hipertrofia y fuerza. Singer et al. (2024), metaanálisis: descansos > 60 s ligeramente mejores. |
| Curl femoral **sentado** antes que acostado | Maeo et al. (2021), *Med Sci Sports Exerc*: el sentado (femoral más estirado) hizo crecer más los isquiotibiales. |
| Extensión de tríceps **sobre la cabeza** | Maeo et al. (2023), *Eur J Sport Sci*: ~40 % más crecimiento del tríceps que con jalones. |
| Curl inclinado, curl detrás del cuerpo, gemelo con pausa abajo | Principio de entrenar en la posición estirada (Pedrosa et al., 2022; Kassiano et al., 2023, en pantorrilla). |
| Extensión de cuádriceps incluida | La sentadilla casi no estimula el recto femoral (Zabaleta-Korta et al., 2021). |
| Sentadilla profunda | Kubo et al. (2019), *Eur J Appl Physiol*: más crecimiento de glúteo y aductores que la media sentadilla. |
| Flexiones como equivalente del press | Kikuchi y Nakazato (2017): flexiones con carga similar dan hipertrofia comparable al press de banca. |
| Sobrecarga progresiva: subir peso al completar el rango; si no, buscar +1 rep | Plotkin et al. (2022), *PeerJ*: progresar por carga o por repeticiones da resultados similares. |
| Semana de descarga cada 5 semanas (65 % del peso, una serie menos) | Bell et al. (2023), consenso Delphi sobre descargas: cada 4-6 semanas, reduciendo volumen e intensidad. |
| Ajuste por "¿cómo te sentiste?" | Autorregulación por esfuerzo percibido (RPE/RIR), Helms et al. (2016). |
| Sueño de 7-9 h | Recomendación de la National Sleep Foundation; la falta de sueño reduce la recuperación y la síntesis de proteína. |

Notas:
- Los ejercicios con ⭐ (prioridad 3 en `data.js`) son los que mejor respaldo tienen para su músculo.
- El motor evita ejercicios según las zonas a cuidar (rodilla, espalda baja, hombro, muñeca, cuello), pero no reemplaza a un médico o fisioterapeuta.
