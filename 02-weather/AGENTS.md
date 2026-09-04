# AGENTS.md

## Project

Weather CLI app (course project). Interactive console menu: current weather for a default city, list of saved cities, add/remove cities, set default, unit settings. End deliverable is a compiled standalone executable via `bun build --compile`.

## Environment gotchas (WSL)

- Bun is installed on Windows only: plain `bun` is not found in the Linux shell. Use `bun.exe run index.ts` (on PATH) or `cmd.exe /c "bun ..."`.
- Package manager is Bun (`bun.lock`): use `bun.exe install` / `bun.exe add`, not npm.

## Commands

- Run app: `bun.exe run src/index.ts`
- Run tests: `bun.exe run test` (Bun test runner, suite in `tests/`)
- Build binary: `bun.exe run build` (runs the tests first; the build fails if any test fails)
- Typecheck: `bun.exe x tsc` (TypeScript 7, `noEmit` already set in tsconfig; also typechecks `tests/`)
- No linter is configured; verification = tests + typecheck + run
- The app is an interactive menu that blocks on stdin; pipe input or use a timeout when verifying

## Testing constraints (bun 1.4.1)

- `mock.module()` mocks are NOT restored between test files (all files share one process). Only `src/presentation/input.ts` is module-mocked (in `tests/actions.test.ts`), since no other test file needs the real one; everything else uses real modules with `globalThis.fetch` mocked per test and `process.chdir` into a temp dir (see `tests/helpers/`).
- Storage tests and `actions.test.ts` chdir into a temp dir so the real `cities.json`/`settings.json` are never touched.
- `src/index.ts` (bootstrap glue) and real stdin handling in `input.ts` are not covered by the suite; `actions.test.ts` covers `runMenu` and all actions with the input module mocked.

## TypeScript constraints that affect code

- `verbatimModuleSyntax`: type-only imports must use `import type`
- `noUncheckedIndexedAccess` + `strict`: indexed access returns `T | undefined`
- Bun globals come from `types: ["bun"]`; do not add `@types/node`
- `allowImportingTsExtensions`: imports may include the `.ts` extension

## Data source

OpenMeteo APIs, no API key or auth required. Two-step flow:
1. Geocoding: `https://geocoding-api.open-meteo.com/v1/search?name=<city>&count=1&language=es&format=json`
2. Forecast: `https://api.open-meteo.com/v1/forecast?latitude=<lat>&longitude=<lon>&current=temperature_2m`

## Conventions

- User-facing text (menus, messages) in Spanish, matching the README
- Git repo root is the parent folder `Curso_Open_Code`, shared with sibling project `01-demo`
