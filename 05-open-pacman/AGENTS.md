# AGENTS.md

## Project

Pac-Man clone (course project whose stated purpose is learning spec-driven development). HTML5 Canvas + vanilla JS/HTML/CSS. No framework, no build step, no dependencies, no tests, linter, or CI.

## Run & verify

- Entry point is `src/index.html` (not the project root). Open it in a browser, or `npx serve src` → `http://localhost:3000`
- No automated checks exist. CLI sanity check: `node --check src/js/<file>.js` (syntax only)
- In WSL, bare `node` is not on PATH — use `node.exe` (Windows Node under `/mnt/c/nodejs/`) or `npx`, which do resolve
- `node src/js/main.js` fails — it touches `document` at load and starts the loop immediately. Functional verification is manual, in a browser

## Workflow: spec-driven development

- New features go through the spec flow, not direct code changes. Two project-local OpenCode skills are installed in `.agents/skills/` (source: `klerith/fernando-skills` on GitHub, hash-locked in `skills-lock.json` — don't hand-edit the skill files):
  - `spec`: clarify requirements with the user and write a spec (no code). Saves `specs/NN-slug.md` (sequential, zero-padded), state `Draft`; the user flips it to `Approved` themselves. Seeds `specs/.spec-config.yml` if missing.
  - `spec-impl`: only implements a spec whose state means "Approved"; requires a clean working tree; creates/switches to branch `spec-NN-slug` (disable via `AutoCreateBranch: false` in `specs/.spec-config.yml`); sets state to `Implemented` when done.
- `specs/` doesn't exist yet; the first spec will be `specs/01-...`.

## Architecture

- Four plain classic scripts (no ES modules) loaded in order by `src/index.html`: `maze.js` → `game.js` → `render.js` → `main.js`. Cross-file contract is `window.*` globals assigned at the bottom of each file (`MAZE`, `TUNNEL_ROW`, `PACMAN_START`, `GHOST_STARTS`, `createGame`, `update`, `DIRS`, `draw`). Load order is load-bearing: `main.js` must stay last — it calls `createGame()` and enters the game loop at load time.
- The maze is authored as 31 strings × 28 chars in `maze.js`, parsed to numbers: `#`=1 wall, `.`=2 dot, ` `=0 empty, `-`=3 pen door. Every row must stay 28 chars and symmetric about the axis between cols 13/14.
- `MAZE` is pristine; each game copies it into `game.grid` where dots get eaten. Rendering reads `game.grid`, never `MAZE`.

## Gotchas

- Canvas size is derived by hand: 28 cols × `TILE` (20) = 560 wide, 31 rows × 20 = 620 high. The `width`/`height` attributes on `<canvas>` in `src/index.html` must be updated if the maze or `TILE` changes — `render.js` never reads them.
- Movement uses fractional cell coordinates. `PACMAN_SPEED` (1/8) and `GHOST_SPEED` (1/10) are chosen so actors land exactly on cell centers; turns, dot-eating, and ghost decisions only happen when aligned (±1e-3). Non-1/N speeds break turning and eating.
- Pen door (tile 3) blocks Pac-Man but not ghosts; ghosts spawn inside the pen (row 14). Tunnel row 14 wraps actors horizontally off both edges.
- Ghost `kind`s come from `GHOST_STARTS` in `maze.js`: `hunter` (greedy Manhattan chase) and `random`. Ghosts never reverse 180° except in dead ends.
- Lives = 3; on collision both Pac-Man and ghosts reset to their starts (no pause or invulnerability).

## Conventions

- Code style is unusual: spaces inside parens and index brackets — `foo( bar )`, `grid[ y ][ x ]`. Match it exactly when editing.
- Comments and user-facing text in Spanish (overlay `GANASTE`/`PERDISTE`, HUD `VIDAS`); identifiers in English.
- Git repo root is the parent folder `Curso_Open_Code`, shared with sibling projects `01-demo`, `02-weather`, `03-asteroids`, `04-mis-skills`; git commands run from this directory see the whole course repo.
