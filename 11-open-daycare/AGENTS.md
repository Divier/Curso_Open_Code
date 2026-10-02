<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## Commands

- `npm run dev` — dev server at http://localhost:3000
- `npm run lint` — runs `eslint` (flat config, ESLint 9). This is **not** `next lint`; don't run `next lint`.
- Typecheck: `npx tsc --noEmit` (there is no `typecheck` script).
- No test framework is configured — don't invent test commands.

## Stack notes

- Next.js 16.2.10 (App Router) + React 19.2.4. TypeScript strict, `noEmit`, `moduleResolution: bundler`.
- Path alias `@/*` maps to the repo root (`./*`), not `src/`.
- Tailwind CSS v4: configured inline via `@import "tailwindcss"` + `@theme` in `app/globals.css` and the `@tailwindcss/postcss` plugin. There is **no** `tailwind.config.ts`; do not create one.

## Project context

- `open-daycare`: a Spanish-language daycare management app (staff + family/parent flows). UI copy is in Spanish.
- `app/page.tsx` is still the default create-next-app scaffold — the real UI has not been built yet.
- `references/pantallas/*.dc.html` are the design source of truth for each screen; open `references/pantallas/index.dc.html` for the catalog of 15 screens. `references/screenshots/*.png` are rendered previews. Implement against these: fonts are Fredoka (headings) + Nunito (body) on a warm palette (background `#f6ecdf`, accent `#d9583c`/`#f2937a`, staff blue `#2e89a6`, family purple `#7b5fc0`).

## MCPs

- Playwright: screenshots and any Playwright output go in `.playwright-mcp/` (gitignored).
- Context7: use it to fetch current framework docs instead of relying on training data.
- Supabase: database, auth, edge functions, storage, and more. Use MCP tools for SQL execution, migrations, advisors, and logs.

## Supabase

- Project uses Supabase for database, authentication, and backend services.
- **Client helpers**: Use `@supabase/ssr` + `@supabase/supabase-js` packages for all database interactions from the Next.js app.
  - Server components: import `createClient` from `@/utils/supabase/server` (uses `createServerClient` with cookie-based session handling).
  - Client components: import `createClient` from `@/utils/supabase/client` (uses `createBrowserClient`).
  - Middleware: import `createClient` from `@/utils/supabase/middleware` (session refresh on each request).
- **Migrations are mandatory**: Every database manipulation (DDL or DML) MUST be applied via `apply_migration`. Never use `execute_sql` for permanent changes — only for temporary queries or debugging.
- **Schema changes**: iterate with `execute_sql` if needed, then commit via `apply_migration` with a clean migration file.
- **Seed data**: insert via migration, not raw SQL. Use `ON CONFLICT DO NOTHING` for idempotency.
- **RLS**: enable Row Level Security on every table in exposed schemas. Never use `user_metadata` for authorization — use `raw_app_meta_data` / `app_metadata` instead.
- **Security**: never expose `service_role` key in client code. Use publishable keys for frontend. Views bypass RLS by default — use `security_invoker = true`.
- **CLI**: use `supabase migration new <name>` to create migration files. Check CLI version with `supabase --version`.

## Agents

- `spec-verifier`: Verifies acceptance criteria of a spec file. Reviews implementation against each criterion, fixes code/spec issues found, and marks checkboxes. Uses Playwright MCP with vision to compare screenshots against references, and Context7 MCP to validate Next.js best practices.
- `db-migrator`: Detects, creates, and applies Supabase database migrations from specs. Scans `specs/database/` and all specs for DB changes, compares against existing migrations, generates missing migration files, applies them via MCP, and validates the result. Trigger with `/db-migrate`.
- `accessibility-checker`: Audita accesibilidad WCAG 2.2 AA de componentes TSX/HTML/CSS y aplica fixes automáticamente. Incluye verificación de contraste del design system. Trigger with `/a11y`.

## Spec Driven Development - Skills

- /spec Usaremos esta habilidad para crear las especificaciones.
- /spec-impl Usaremos esta skill para hacer las implementaciones.
- /verify-spec Usaremos este comando para verificar los criterios de aceptación de una spec.
- **Database specs**: Cualquier archivo de especificación relacionado con la base de datos debe guardarse en la carpeta `specs/database/`.

## Installed Skills

- **supabase**: Use for any Supabase-related task (database, auth, edge functions, realtime, storage, RLS, migrations, security audits). Loads comprehensive security guidelines, CLI/MCP usage, and best practices.
- **supabase-postgres-best-practices**: Use when writing, reviewing, or optimizing Postgres queries, schema designs, or database configurations. Covers query performance, connection management, security & RLS, schema design, concurrency, and advanced features.

## Reglas de código

- Usar código limpio, nombres, funciones, variables, etc. en inglés.
- **React DOM attributes use camelCase**: Always use React's camelCase versions of HTML attributes (e.g., `autoComplete`, `tabIndex`, `htmlFor`, `className`, `strokeWidth`, `aria-*` stays as-is). Never use lowercase HTML attribute names like `autocomplete`, `tabindex`, `for`, `class`, `strokewidth`.
