# Gym

App de entrenamiento personalizada (PWA) para iPhone. Sin servidor, sin cuentas: cada persona guarda sus datos en su celular.

## Publicar en GitHub Pages (una sola vez, unos 3 minutos)
1. En github.com: **New repository**, nombre `gym-app`, **Public**, crear.
2. En el repositorio: **uploading an existing file** y arrastra **todo el contenido** de esta carpeta (`index.html`, `styles.css`, `sw.js`, `manifest.webmanifest`, carpetas `js` e `icons`). Botón **Commit changes**.
3. **Settings → Pages → Branch: main / (root) → Save**. En 1-2 minutos queda en `https://santi2429.github.io/gym-app/`.

## Instalar en el iPhone
1. Abre el link en **Safari**.
2. Botón compartir → **Agregar a pantalla de inicio**.
3. Abre Gym desde el ícono (así funciona como app, a pantalla completa y sin internet).

## Actualizar
Sube los archivos cambiados al repositorio. La app toma la nueva versión la próxima vez que se abra con internet.

## Estructura
- `js/data.js`: ejercicios, frases, colores, logros.
- `js/engine.js`: motor de rutinas, progresión, XP, rachas (ver `FUENTES.md`).
- `js/screens.js`, `js/workout.js`, `js/more.js`: pantallas.
- `js/store.js`: datos locales (localStorage + fotos en IndexedDB).
