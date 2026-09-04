# AGENTS.md

## Project

Weather CLI app (course project). Interactive console menu: current weather for a default city, list of saved cities, add/remove cities, set default, unit settings. End deliverable is a compiled standalone executable via `bun build --compile`.

## Environment gotchas (WSL)

- Bun is installed on Windows only: plain `bun` is not found in the Linux shell. Use `bun.exe run index.ts` (on PATH) or `cmd.exe /c "bun ..."`.
- Package manager is Bun (`bun.lock`): use `bun.exe install` / `bun.exe add`, not npm.

## Commands

- Run app: `bun.exe run index.ts`
- Typecheck: `bun.exe x tsc` (TypeScript 7, `noEmit` already set in tsconfig)
- No test framework or linter is configured; verification = typecheck + run
- The app is an interactive menu that blocks on stdin; pipe input or use a timeout when verifying

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
