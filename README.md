# Gym

App de entrenamiento personalizada (PWA) para iPhone. Sin servidor, sin cuentas: cada persona guarda sus datos en su celular.

## Publicada
- Repositorio: https://github.com/santi2429/gym-app (público, GitHub Pages desde main / root).
- App: **https://santi2429.github.io/gym-app/**
- Todos los archivos van sueltos en la raíz (sin subcarpetas), igual que en el repositorio.

## Instalar en el iPhone
1. Abre el link en **Safari**.
2. Botón compartir → **Agregar a pantalla de inicio**.
3. Abre Gym desde el ícono (así funciona como app, a pantalla completa y sin internet).

## Actualizar
Sube los archivos cambiados al repositorio (Add file → Upload files) y cambia `CACHE` en `sw.js` (gym-v2 → gym-v3…). La app toma la nueva versión la próxima vez que se abra con internet.

## Estructura
- `data.js`: ejercicios, frases, colores, logros.
- `engine.js`: motor de rutinas, progresión, XP, rachas (ver `FUENTES.md`).
- `screens.js`, `workout.js`, `more.js`: pantallas.
- `store.js`: datos locales (localStorage + fotos en IndexedDB).
- `icon-*.png`, `icon.svg`: ícono de la app.
