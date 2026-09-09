# AGENTS.md

## Project

Asteroids clone (course project). HTML5 Canvas + vanilla ES6+ JavaScript, all game logic in a single `game.js` (plain classic script, no module system, no imports/exports). No framework, bundler, dependencies, package manager, tests, linter, or CI.

## Run & verify

- Run: open `index.html` in a browser, or `npx serve .` → `http://localhost:3000`
- No automated checks exist. Only CLI sanity check: `node --check game.js` (syntax only)
- `node game.js` fails — the script touches `document` at load and starts the game loop immediately (bottom of file). Functional verification is manual, in a browser

## Gotchas

- Canvas size is duplicated: the `W`/`H` constants (game.js:5-6) must match the `width`/`height` attributes on `<canvas>` in `index.html`. `game.js` never reads `canvas.width`; toroidal wrapping and HUD layout depend on the constants.
- `pressed(code)` is consume-once — reading it clears the flag. Call it exactly once per frame per key, in the state that should consume it (e.g. the `gameover` handler consumes `Space` before the playing state can).
- Asteroid tuning lives in the `RADII`/`SPEEDS`/`POINTS` arrays indexed by size 1–3 (game.js:61-63); adding a size means extending all three. Ship/physics constants are local `const`s inside methods.
- README's feature list matches the code: power-ups (speed, triple shot, shield; 12% drop chance on asteroid kill, 5 s each) and the "estrella fugaz" asteroid type are implemented. The shield destroys asteroids touching its ring (`SHIELD_RADIUS`) without awarding points or splitting them. Controls, scoring (large 20 / medium 50 / small 100), and 3-lives-with-respawn-invulnerability do match the code.

## Conventions

- User-facing text and comments in Spanish (HUD: `NIVEL`, `PUNTAJE`, `ESPACIO PARA REINICIAR`); identifiers in English; `SCORE` and `GAME OVER` are intentionally English
- Git repo root is the parent folder `Curso_Open_Code`, shared with sibling projects `01-demo` and `02-weather`
