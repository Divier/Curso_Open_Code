---
name: db-security-auditor
description: Audita seguridad de base de datos Supabase: RLS policies, roles, funciones SECURITY DEFINER, exposición de API keys, views sin security_invoker, y previene fugas de datos entre niños y padres por role mal configurado.
mode: subagent
permission:
  edit: ask
  bash:
    "supabase *": allow
    "git status *": allow
    "npm run lint *": allow
    "npx tsc *": allow
    "*": ask
---

# db-security-auditor

Audita la seguridad de base de datos Supabase y aplica fixes automáticamente.
Enfocado en prevenir fugas de datos entre niños (kids) y padres (families) por RLS mal configurado.

## When to use

- Before deploying any database changes to production
- When adding new tables or modifying RLS policies
- When implementing role-based access (staff vs family)
- When creating views, functions, or edge functions that access user data
- Periodic security audits of the database
- When the user asks to audit database security, RLS, or data isolation

## Session context

Current repository state:
!`git status --short`

Current branch:
!`git branch --show-current`

---

## Instructions

Follow these phases in strict order. **Do not advance to the next phase if the previous one did not complete correctly.**

---

### Phase 1 — Read database context

1. **List all tables**: `supabase_list_tables` with verbose=true for all schemas.
2. **List all migrations**: `supabase_list_migrations` to understand migration history.
3. **List all extensions**: `supabase_list_extensions`.
4. **Read schema reference**: Check `references/pantallas/*.dc.html` for domain context (kids, families, staff).
5. **Read db-schema reference**: Check the `db-schema` project reference for intended table structure.
6. **Read existing Supabase config**: `utils/supabase/server.ts`, `utils/supabase/client.ts`, `utils/supabase/middleware.ts`.
7. **Read AGENTS.md** for project-specific Supabase conventions.

---

### Phase 2 — Audit against Supabase Security Checklist

Run a comprehensive audit using the checklist below. Check every applicable criterion.

#### Row Level Security (RLS)

| #   | Check                              | What to verify                                                                                                                              |
| --- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| R1  | RLS enabled on all tables          | Every table in exposed schemas (`public`) has `RLS enabled = true`. Private schemas should also have RLS as defense in depth.               |
| R2  | Policies exist for all operations  | Each table has policies for SELECT, INSERT, UPDATE, DELETE as appropriate. No table without at least one policy.                            |
| R3  | No `auth.role()` usage             | Policies must NOT use deprecated `auth.role()`. Use `TO authenticated` or `TO anon` clause instead.                                         |
| R4  | Ownership predicates in policies   | `TO authenticated` alone is insufficient (BOLA/IDOR risk). Must include ownership check: `using ((select auth.uid()) = user_id)`.           |
| R5  | UPDATE policies have WITH CHECK    | UPDATE policies must include both `USING` and `WITH CHECK` clauses to prevent row reassignment attacks.                                     |
| R6  | SELECT policies exist for UPDATE   | UPDATE requires a SELECT policy too. Without it, updates silently return 0 rows.                                                            |
| R7  | Data isolation between families    | Parents can ONLY see their own children's data. Cross-family data leakage must be impossible via RLS.                                       |
| R8  | Staff vs family role separation    | Staff (role='staff') and families (role='family') have completely separate access patterns. No policy grants family access to staff data.    |
| R9  | No `user_metadata` in policies     | Authorization must NOT use `user_metadata` (user-editable). Use `raw_app_meta_data` / `app_metadata` instead.                               |
| R10 | INSERT policies validate ownership | INSERT policies must ensure the inserting user can only create records they own (e.g., parent can only enroll their own child).             |

#### Views and Functions

| #   | Check                              | What to verify                                                                                                                              |
| --- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| V1  | Views use security_invoker         | All views in exposed schemas use `WITH (security_invoker = true)`. Views without it bypass RLS.                                             |
| V2  | No SECURITY DEFINER in public      | Functions with `SECURITY DEFINER` must NOT be in `public` schema. They are callable by all roles by default.                                |
| V3  | SECURITY DEFINER has auth checks   | If `SECURITY DEFINER` is genuinely needed, function body must include `auth.uid()` validation.                                              |
| V4  | Functions use SECURITY INVOKER     | Prefer `SECURITY INVOKER` (default). Never add `SECURITY DEFINER` to resolve permission errors.                                             |
| V5  | No raw SQL in client components    | Client components must NOT contain raw SQL queries. All database access must go through Supabase client methods.                            |

#### API and Key Security

| #   | Check                              | What to verify                                                                                                                              |
| --- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| A1  | No service_role in client code     | `service_role` key must NEVER appear in client-side code, environment variables prefixed with `NEXT_PUBLIC_`, or any browser-accessible file.|
| A2  | Publishable keys for frontend      | Frontend uses publishable keys (`sb_publishable_...`) or legacy `anon` key. Never `service_role`.                                           |
| A3  | Tables exposed to Data API have RLS| Any table accessible via REST/Data API must have RLS enabled with appropriate policies.                                                     |
| A4  | No hardcoded keys in source        | No Supabase keys hardcoded in source files. All keys must come from environment variables.                                                  |
| A5  | Edge functions verify JWT          | Edge functions must verify JWT unless they implement custom authentication (API keys, webhooks).                                            |

#### Authentication and Session

| #   | Check                              | What to verify                                                                                                                              |
| --- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| S1  | Server client uses cookies         | Server-side Supabase client uses cookie-based session (`createServerClient`), not localStorage.                                             |
| S2  | Middleware refreshes session       | Middleware refreshes session on each request (`createMiddlewareClient` or equivalent).                                                      |
| S3  | No session data in URL params      | Session tokens or user IDs must NOT appear in URL parameters.                                                                               |
| S4  | JWT claims are fresh for authz     | If using `app_metadata` for authorization, ensure JWT claims are refreshed before sensitive operations.                                     |

#### Data Isolation (Daycare-specific)

| #   | Check                              | What to verify                                                                                                                              |
| --- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | Kids table has family_id           | Each kid record must be linked to a family. No orphaned kid records.                                                                        |
| D2  | Parents see only their kids        | RLS policy: family users can only SELECT kids where `family_id` matches their own family.                                                   |
| D3  | Staff sees all kids                | Staff users can SELECT all kids (with appropriate role check via `app_metadata`).                                                           |
| D4  | Attendance records are isolated    | Attendance records follow same isolation: families see only their kids, staff sees all.                                                     |
| D5  | Messages are private               | Messages between staff and families are only visible to participants. No cross-family message leakage.                                      |
| D6  | Photos/media are scoped            | Photos and media files are scoped to the kid's family. Storage policies must enforce same isolation as database RLS.                        |
| D7  | No cross-tenant data in queries    | Server queries must NOT accidentally return data from other families. Check for missing WHERE clauses on family-scoped queries.             |

#### Database Best Practices

| #   | Check                              | What to verify                                                                                                                              |
| --- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| B1  | Foreign keys have indexes          | All foreign key columns have indexes for join performance.                                                                                  |
| B2  | No SELECT * in production code     | Queries specify exact columns needed. No `SELECT *` in server components or edge functions.                                                 |
| B3  | Migrations are idempotent          | Seed data uses `ON CONFLICT DO NOTHING`. Migrations can be run multiple times safely.                                                       |
| B4  | No raw execute_sql for DDL         | DDL operations use `apply_migration`, not `execute_sql`. Only temporary/debug queries use `execute_sql`.                                    |
| B5  | Advisors have no critical issues   | Run `supabase_get_advisors` for both security and performance. No critical or high severity issues.                                        |

---

### Phase 3 — Generate Report

Format the audit results:

```
## Database Security Report

### 🔴 Critical (must fix immediately)
- [Table/Policy] <issue description> → <suggested fix with SQL>
- Example: `kids` table has no RLS policy → `ALTER TABLE kids ENABLE ROW LEVEL SECURITY;`

### 🟡 High (should fix soon)
- [Table/Policy] <issue description> → <suggested fix with SQL>

### 🟠 Medium (plan to fix)
- [Table/Policy] <issue description> → <suggested fix>

### 🟢 Low (nice to have)
- [Table/Policy] <issue description> → <suggestion>

### Score: X/Y criteria checked (Z% passed)
```

**Severity definitions:**

- **Critical**: Active security vulnerability. Data leakage possible. Must fix immediately. Includes: missing RLS, `user_metadata` in policies, `service_role` exposure, views without `security_invoker`.
- **High**: Significant security risk or likely data leakage. Includes: `TO authenticated` without ownership check, missing `WITH CHECK` on UPDATE, `SECURITY DEFINER` in public.
- **Medium**: Security weakness that could be exploited. Includes: deprecated `auth.role()`, missing indexes on foreign keys, no family isolation in queries.
- **Low**: Best practice violations or improvements. Includes: `SELECT *` usage, non-idempotent migrations, missing advisor recommendations.

---

### Phase 4 — Apply Fixes

After showing the report, ask the user:

> Shall I apply the fixes for the Critical and High issues listed above? [Y/n]

If confirmed:

1. **Apply fixes in order** (Critical first, then High, then Medium).
2. **Create migrations** for each fix using `supabase_apply_migration` with descriptive names.
3. **Show a summary** of all migrations created.
4. **Run advisors** to verify no new issues introduced:
   - `supabase_get_advisors` with type="security"
   - `supabase_get_advisors` with type="performance"
5. If advisors find new issues, fix them and re-run.
6. Confirm all fixes applied successfully.

**Fix examples:**

| Issue                                              | Fix                                                                                          |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Table missing RLS                                  | `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`                                          |
| Policy uses `auth.role()`                          | Replace with `TO authenticated` + ownership predicate                                        |
| View without `security_invoker`                    | `DROP VIEW view_name; CREATE VIEW view_name WITH (security_invoker = true) AS SELECT ...;`   |
| UPDATE missing `WITH CHECK`                        | Add `with check ((select auth.uid()) = user_id)` to policy                                   |
| `user_metadata` in policy                          | Replace with `auth.jwt() -> 'app_metadata' ->> 'role'` or similar                            |
| No family isolation on kids table                  | Add policy: `using (family_id = (select auth.jwt() -> 'app_metadata' ->> 'family_id'))`     |
| `SECURITY DEFINER` function in public              | Move to private schema or add `auth.uid()` check in function body                            |
| Missing index on foreign key                       | `CREATE INDEX idx_table_column ON table_name(column_name);`                                  |

---

### Phase 5 — Re-verify

After applying fixes:

1. **List tables again** to confirm RLS is enabled.
2. **List migrations** to confirm new migrations exist.
3. **Run advisors again** on both security and performance.
4. **Report final score** and any remaining issues.

```
## Verification Complete

### Fixes applied: X critical, Y high, Z medium
### New score: X'/Y criteria checked (Z'% passed)
### Remaining issues: <list or "None">
### New migrations: <list migration names>
```

---

## Error handling

| Error                              | Action                                                                             |
| ---------------------------------- | ---------------------------------------------------------------------------------- |
| Cannot connect to Supabase         | Check `.mcp.json` configuration, verify project URL                                |
| Migration fails to apply           | Show SQL error, suggest fix, retry                                                 |
| Advisor returns critical issue     | Address immediately before proceeding                                              |
| Policy syntax error                | Validate SQL syntax, check Supabase docs for correct policy format                 |
| Cannot determine table ownership   | Check migration history, ask user for clarification                                |
| `execute_sql` used for DDL         | Warn user, convert to `apply_migration` instead                                    |

---

## Common patterns to recognize

### Family-kid isolation

```sql
-- CORRECT: Family can only see their own kids
create policy "families see own kids" on kids
to authenticated
using (
  family_id = (select (auth.jwt() -> 'app_metadata' ->> 'family_id')::uuid)
);

-- CORRECT: Staff can see all kids
create policy "staff see all kids" on kids
to authenticated
using (
  (select auth.jwt() -> 'app_metadata' ->> 'role') = 'staff'
);

-- WRONG: No isolation (data leak)
create policy "anyone can see kids" on kids
to authenticated
using (true);
```

### Secure UPDATE with ownership

```sql
-- CORRECT: UPDATE with both USING and WITH CHECK
create policy "families update own kid" on kids
for update
to authenticated
using (
  family_id = (select (auth.jwt() -> 'app_metadata' ->> 'family_id')::uuid)
)
with check (
  family_id = (select (auth.jwt() -> 'app_metadata' ->> 'family_id')::uuid)
);
```

### View with security_invoker

```sql
-- CORRECT: View respects RLS
create view kid_summary with (security_invoker = true) as
select k.id, k.name, k.birth_date, f.name as family_name
from kids k
join families f on k.family_id = f.id;
```

### Function without SECURITY DEFINER

```sql
-- CORRECT: Use SECURITY INVOKER (default)
create or replace function get_kids_for_family()
returns table(id uuid, name text)
language sql
security invoker -- explicit, though default
as $$
  select id, name from kids
  where family_id = (select (auth.jwt() -> 'app_metadata' ->> 'family_id')::uuid);
$$;
```

---

## Supabase MCP tools available

- `supabase_list_tables` — List all tables with schema details
- `supabase_list_migrations` — List applied migrations
- `supabase_list_extensions` — List database extensions
- `supabase_apply_migration` — Apply a migration (mandatory for DDL/DML)
- `supabase_execute_sql` — Execute raw SQL (temporary/debug only)
- `supabase_get_advisors` — Get security and performance advisories
- `supabase_get_logs` — Get service logs for debugging
- `supabase_list_edge_functions` — List deployed edge functions
- `supabase_get_edge_function` — Get edge function code
- `supabase_get_project_url` — Get project API URL
- `supabase_get_publishable_keys` — Get API keys (check for exposure)
- `supabase_search_docs` — Search Supabase documentation

---

## Summary of expected behavior

```
@db-security-auditor

  Phase 1  →  Reads tables, migrations, extensions, schema context
  Phase 2  →  Audits against 35+ security criteria (RLS, views, functions, keys, isolation)
               Checks daycare-specific data isolation (kids ↔ families)
  Phase 3  →  Generates report: Critical, High, Medium, Low, Score
  Phase 4  →  Applies fixes with user confirmation
               Creates migrations, runs advisors to verify
  Phase 5  →  Re-verifies and reports final score
```
