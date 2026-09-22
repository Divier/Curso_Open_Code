<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## MCPs

- Playwright: screenshots y cualquier cosa relacionada a Playwright tienen que estar en la carpeta `.playwright-mcp/` (ya está en `.gitignore`).
- Context7: usar este MCP para traer la documentación actualizada del framework (Next 16 y Tailwind 4 difieren de los datos de entrenamiento).

## Spec Driven Development - Skills

- /spec Usaremos esta habilidad para crear las especificaciones.
- /spec-impl Usaremos esta habilidad para implementar las especificaciones aprobadas.

## Proyecto

- App de guardería ("OpenDayCare"): Next.js 16 (App Router) + React 19 + Tailwind CSS 4 + TypeScript.
- No hay carpeta `src/`: el App Router está en `app/` a nivel raíz, y el alias `@/*` apunta a la raíz del proyecto (`./*`), no a `src/*`.
- Tailwind 4: no existe `tailwind.config.*`; la configuración vive en CSS (`app/globals.css`, `@theme inline`).
- Texto de UI en español rioplatense (voseo), ej.: "Ingresá", "Publicá".

## Diseño — fuente de verdad

- `references/pantallas/*.dc.html`: mockups interactivos HTML (inline styles + runtime `support.js`) de las 16 pantallas del app (login, feed, niños, avisos, resumen del día, cuentas de familia, etc.). Replicar estos diseños al construir la UI en Next.js.
- `references/screenshots/*.png`: capturas estáticas de las mismas pantallas.
- Tokens del diseño: Fredoka (títulos), Nunito (cuerpo), fondo `#FBF4EC`, texto `#3F362E`.

## Comandos y verificación

- `npm run dev` — dev server en http://localhost:3000.
- `npm run lint` — ESLint 9 flat config (`eslint` directo; `next lint` ya no existe en Next 16).
- `npx tsc --noEmit` — typecheck (no hay script dedicado).
- `npm run build` — verificación completa.
- No hay framework de tests: verificar con lint + typecheck + build o el dev server; no inventar suites de tests.

## Entorno (WSL)

- Node y npm son binarios de Windows (`/mnt/c/nodejs/`) invocados desde WSL: esperá lentitud en operaciones sobre `/mnt/c` y rutas mixtas Windows/WSL (ej. `opencode.json`).

## Workflow de specs

- Este proyecto usa el método spec-driven con los skills `/spec` y `/spec-impl` (`.agents/skills/`).
- Las specs viven en `specs/NN-slug.md` de este directorio (la carpeta aún no existe; la crea `/spec` arrancando en `01-`).
- Flujo: `/spec` crea la spec en `Draft` → el usuario la marca `Approved` → `/spec-impl` la implementa en la rama `spec-NN-slug`.

## Git

- La raíz del repo es la carpeta del curso (`Curso_Open_Code`), un nivel arriba — la historia mezcla todos los proyectos del curso y este directorio aún está untracked.
- Commits en español, minúsculas y cortos, ej.: "spec 02: salida de los fantasmas de la pen", "seccion 5 power pellets".
