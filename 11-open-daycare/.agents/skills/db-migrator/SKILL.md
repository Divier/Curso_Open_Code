---
name: db-migrator
description: Detects, creates, and applies Supabase database migrations from specs. Scans specs/database/ and all specs for DB changes, compares against existing migrations, generates missing migration files, applies them via MCP, and validates the result.
disable-model-invocation: true
allowed-tools: Bash(git status:*), Bash(cat:*), Bash(ls:*), Bash(supabase:*), Bash(npm run:*), Bash(npx tsc:*)
---

# /db-migrate — Database Migration Agent

## Session context

Current repository state:
!`git status --short`

Current branch:
!`git branch --show-current`

Existing migrations:
!`ls supabase/migrations/ 2>/dev/null || echo "No migrations folder"`

Database specs:
!`ls specs/database/ 2>/dev/null || echo "No specs/database/ folder"`

All specs:
!`ls specs/*.md 2>/dev/null || echo "No specs in specs/"`

---

## Instructions

Follow these phases in strict order. **Do not advance to the next phase if the previous one did not complete correctly.**

---

### Phase 1 — Detect specs with database changes

Scan for specs that require database migrations:

1. **Always check** `specs/database/*.md` — these are explicitly database specs.
2. **Scan all** `specs/*.md` for database-related content. Look for:
   - SQL code blocks (`CREATE TABLE`, `CREATE TYPE`, `ALTER TABLE`, `CREATE POLICY`, `CREATE TRIGGER`, `CREATE FUNCTION`, `INSERT`)
   - Mentions of `apply_migration`, `RLS`, `Row Level Security`
   - Sections titled `Data model`, `Schema`, or similar
   - New table names, enum names, column definitions
3. For each spec found, check its **state** (look for `**Status:**` / `**Estado:**` near the top).
4. **Only process specs whose state means "Approved" / "Aprobado" / "Implemented" / "Implementado"**. Skip Draft, In review, etc.
5. Build a list of specs that need migrations, ordered by their `Depends on` / `Depende de` references.

If no specs with database changes are found, report:
```
No database changes detected in specs. All migrations appear to be up to date.
```
And stop.

---

### Phase 2 — Compare with existing migrations

1. List files in `supabase/migrations/` (local files).
2. Use MCP `list_migrations` to get applied migrations from the database.
3. For each spec from Phase 1, determine what database objects it defines:
   - Tables (from `CREATE TABLE` statements)
   - Enums (from `CREATE TYPE ... AS ENUM`)
   - Triggers, functions, policies
   - Seed data (INSERT statements)
4. Use MCP `list_tables` to check which tables already exist in the database.
5. Cross-reference:
   - If a table/enum/policy from a spec **already exists** in the database → mark as "already applied"
   - If it **does not exist** → mark as "needs migration"
   - If a local migration file exists but is **not applied** → mark as "pending apply"

Report the comparison:
```
## Migration status

| Spec | Object | Status |
|------|--------|--------|
| 07   | daycares table | Already applied |
| 08   | users table, enums | Already applied |
| 10   | rooms, children tables | Needs migration |
| 11   | invitations, parent_children | Needs migration |
```

---

### Phase 3 — Create missing migration files

For each spec that needs a migration:

1. **Generate the migration filename** following the convention:
   - Format: `YYYYMMDDHHMMSS_NN_description.sql`
   - Use the spec number as `NN`
   - Use the current timestamp (or the next sequential timestamp if multiple migrations)
   - Example: `20260710000000_10_create_rooms_and_children.sql`

2. **Extract the SQL** from the spec:
   - Use the `Data model` section as the primary source
   - Include `CREATE TYPE`, `CREATE TABLE`, `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`
   - Include `CREATE POLICY` statements
   - Include `CREATE TRIGGER` / `CREATE FUNCTION` if present
   - Include seed `INSERT` statements with `ON CONFLICT DO NOTHING` for idempotency

3. **Apply best practices**:
   - Wrap enum creation in `DO $$ BEGIN ... END $$` blocks to avoid "already exists" errors
   - Use `ON CONFLICT DO NOTHING` for seed data
   - Always enable RLS: `ALTER TABLE <table> ENABLE ROW LEVEL SECURITY`
   - Add comments referencing the spec: `-- SPEC NN: Description`
   - Ensure foreign key references point to tables that exist (respect dependency order)

4. **Write the migration file** to `supabase/migrations/<filename>.sql`

5. **Do NOT apply yet** — wait for user confirmation.

Show the user:
```
## Migrations to create

1. `supabase/migrations/20260710000000_10_create_rooms_and_children.sql`
   - Tables: rooms, children
   - Enums: child_status, relationship_type
   - RLS policies: 4
   - Seed data: 3 rooms

2. `supabase/migrations/20260710000001_11_create_invitations_and_parent_children.sql`
   - Tables: invitations, parent_children
   - Enums: invitation_status
   - RLS policies: 4

Shall I apply these migrations? [Y/n]
```

Wait for confirmation before proceeding.

---

### Phase 4 — Apply migrations

For each migration file (in dependency order):

1. Read the SQL file content.
2. Use MCP `apply_migration` with:
   - `name`: the filename without extension (snake_case)
   - `query`: the full SQL content
3. If `apply_migration` fails:
   - Show the error to the user
   - Suggest fixes (missing dependency, syntax error, etc.)
   - **Do not continue** with subsequent migrations until the error is resolved
4. If successful, confirm:
   ```
   Applied: 20260710000000_10_create_rooms_and_children.sql
   ```

---

### Phase 5 — Validate

After all migrations are applied:

1. **Verify tables**: Use MCP `list_tables` with `verbose: true` to confirm:
   - All expected tables exist
   - Columns match the spec definitions
   - Foreign keys are correct

2. **Verify enums**: Run `execute_sql` to check enum values:
   ```sql
   SELECT typname, enumlabel FROM pg_type t
   JOIN pg_enum e ON t.oid = e.enumtypid
   WHERE typname IN ('child_status', 'relationship_type', ...);
   ```

3. **Verify RLS**: Run `execute_sql` to confirm RLS is enabled:
   ```sql
   SELECT tablename, rowsecurity FROM pg_tables
   WHERE schemaname = 'public' AND tablename IN ('rooms', 'children', ...);
   ```

4. **Verify seed data**: Run `execute_sql` to check seed rows exist:
   ```sql
   SELECT count(*) FROM rooms;
   SELECT name FROM rooms;
   ```

5. **Security audit**: Use MCP `get_advisors` with type `security` to check for:
   - Missing RLS policies
   - Overly permissive policies
   - Other security concerns

6. **Performance audit**: Use MCP `get_advisors` with type `performance` to check for:
   - Missing indexes
   - Query performance issues

Report validation results:
```
## Validation results

- Tables: rooms, children, invitations, parent_children — OK
- Enums: child_status, relationship_type, invitation_status — OK
- RLS: Enabled on all tables — OK
- Seed data: 3 rooms inserted — OK
- Security advisors: No issues found
- Performance advisors: No issues found
```

If any check fails, report the specific issue and suggest a fix.

---

### Phase 6 — Report

Provide a final summary:

```
## Migration complete

### Specs processed
- SPEC 10 (rooms and children) — Applied
- SPEC 11 (invitations and parent linking) — Applied

### Migrations created and applied
- 20260710000000_10_create_rooms_and_children.sql
- 20260710000001_11_create_invitations_and_parent_children.sql

### Database state
- Tables: 6 (daycares, users, rooms, children, invitations, parent_children)
- Enums: 5 (user_role, user_status, child_status, relationship_type, invitation_status)
- RLS: Enabled on all tables
- Seed data: 4 daycares, 3 rooms

### Next steps
- Run `supabase_generate_typescript_types` to update TypeScript types
- Run `npm run lint` and `npx tsc --noEmit` to verify no type errors
```

---

## Error handling

| Error | Action |
|-------|--------|
| `apply_migration` fails with dependency error | Check if referenced table/enum exists; fix migration order |
| `apply_migration` fails with syntax error | Show error, suggest fix, do not continue |
| Table already exists but spec not marked as applied | Mark as "already applied" and skip |
| RLS policy conflict (duplicate name) | Use `DROP POLICY IF EXISTS` before `CREATE POLICY` |
| Enum already exists | Wrap in `DO $$ BEGIN ... END $$` block |
| Seed data duplicate | Use `ON CONFLICT DO NOTHING` |

---

## Summary of expected behavior

```
/db-migrate

  Phase 1  →  Scans specs/database/ and specs/*.md for DB changes
              Finds SPEC 10, SPEC 11 with Approved state
  Phase 2  →  Compares with existing migrations and database state
              Rooms, children tables not found → needs migration
  Phase 3  →  Creates migration files from spec SQL
              Shows summary, asks for confirmation
  Phase 4  →  Applies migrations in dependency order via MCP
  Phase 5  →  Validates tables, enums, RLS, seed data, security
  Phase 6  →  Reports final status and next steps
```
