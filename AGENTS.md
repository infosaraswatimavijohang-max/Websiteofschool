# AGENTS.md

Static school-management site (Shree Saraswati Secondary School, Gulmi, Nepal): vanilla HTML/CSS/JS + Supabase. **No build step, no bundler, no framework, no CI.**

## Run it

```bash
python -m http.server 8099     # or: npx serve . -p 8099
```

Serve from the **repo root** (relative paths assume it). Never open pages via `file://`. Key URLs: `/` homepage, `/html/admin-portal.html`, `/html/student-portal.html`, `/html/teacher-portal.html`.

## Verification: the browser is the test suite

There is no test runner, linter, or typechecker. `adms-api`'s `npm test` intentionally exits 1. Verification is manual: load the page, watch the console, exercise the feature. `scratch/*.js` has ad-hoc Playwright e2e scripts (e.g. `e2e_cud_tests.js`) that are not wired to any command — read one to learn how they drive the app.

## Architecture facts that are not obvious from filenames

- **No ES modules anywhere** (0 `import`/`export`, no `type="module"`). Every `js/*.js` is a classic `<script>` attaching `window.*` globals (214 top-level `window.` assignments). Load order is load-bearing. To trace a function, grep for its global name across `js/` and the inline `<script>` blocks — there is no import graph to follow.
- **`html/admin-portal.html` is ~17,500 lines with most logic inline in `<script>` blocks.** Its handlers are *not* `<script src>` tags; they are dynamically injected from the `scriptsToLoad` array at `html/admin-portal.html:613`. Adding a new handler means adding it to that array, and much admin behavior lives in the HTML, not in `js/`.
- **LocalStorage is a real data layer, not a cache** (~238 references in `js/` alone). `pullAllFromSupabase()` in `js/supabase-client.js` mirrors DB rows into LocalStorage and many read paths hit LocalStorage directly. Don't treat it as disposable.
- **`about-data.js` exports `*_REAL` shims** (`window.readAllAdminTeam_REAL` etc., `js/about-data.js:1399`) that the admin portal's early-defined fallbacks poll for (~5s). This indirection is intentional; preserve the `_REAL` suffix when renaming.

## Two Supabase projects — do not mix them

`js/supabase-client.js` hardcodes two anon clients:

- **DB1** `ohczlooperjqpyllmabo` — primary data (`supabaseDb`)
- **DB2** `xowlownqmnfffhnkxdpw` — media/pictures/gallery (`supabaseMedia`, ~33 uses)

`sql/setup/setup.sql` contains statements for **both**. SECTION 1 → DB1, **SECTION 2 starts at `sql/setup/setup.sql:548` and must be run in DB2's SQL editor**, not the same project. Pasting the whole file into one project is wrong — the README's "run setup.sql" instruction is incorrect. Other DB2-targeted file: `sql/setup/NOTICES_BUCKET_SETUP.sql`.

## SQL has no migration system

Schema is applied by hand in the Supabase SQL Editor, in whatever order the operator chooses. Additive scripts go in `sql/setup/`, patches in `sql/fixes/`, read-only queries in `sql/queries/`. There is no way to roll back or re-apply automatically, so assume a live database already has partial state.

## Agent tooling (see `opencode.json`)

MCP servers wired in `opencode.json` — **restart opencode after any config change**, it is not hot-reloaded:

- **supabase** (remote) — deliberately scoped: `?project_ref=ohczlooperjqpyllmabo&read_only=true`. Read-only is the default because the DB holds real student PII and plaintext passwords. To inspect the media DB2 (`xowlownqmnfffhnkxdpw`) or allow writes, edit that URL; to drop `project_ref` entirely grants access to *every* project in the account. Auth with `opencode mcp auth supabase` (OAuth, no PAT needed).
- **context7** (remote) — OAuth via `https://mcp.context7.com/mcp/oauth`; run `opencode mcp auth context7`.
- **playwright** (local) — `npx.cmd -y @playwright/mcp@0.0.83`. This is the practical replacement for the hand-rolled `scratch/e2e_*.js` scripts, and it beats "reload and watch the console" for verifying portal behavior.

Agent skills live in `.claude/skills/` (installed from `supabase/agent-skills` via the `skills` CLI; `skills-lock.json` pins them) and are registered through `skills.paths` because opencode does not auto-scan a project-level `.claude/`. The `supabase-postgres-best-practices` skill covers RLS and schema work — load it before writing SQL. Update with `npx.cmd -y skills update`.

Global CLIs (not repo dependencies, so they never appear in git): `supabase` (2.118), `strix` (1.6.2, via `uv tool`; needs Docker + its own `LLM_API_KEY`/`STRIX_LLM`, authorized targets only). Strix is **not** wired into `opencode.json` by design.

**PowerShell quirk:** this machine's execution policy blocks `.ps1` shims, so `npm`/`npx`/`supabase` fail with a `SecurityError` in PowerShell. Use the `.cmd` variants (`npx.cmd`, `supabase.cmd`) or run them from `cmd.exe`. This is why the playwright MCP `command` is pinned to `npx.cmd` — on Linux/macOS change it back to `npx`.

## Security posture (don't assume protections that aren't there)

- RLS policies gate on `auth.role() = 'authenticated'` (see `sql/fixes/FIX_RLS_POLICIES.sql`) — **any signed-in Supabase user is effectively an admin**; there is no real role separation.
- `student_credentials.student_password` / `teacher_credentials` store **plaintext** passwords (the SQL carries a "store as bcrypt in production" comment).
- Supabase anon keys are committed in `js/supabase-client.js` and `adms-api/index.js`. The README says to replace them, but real values are already in the tree — treat RLS as the only backend guard and never add a service-role key or other secret to the repo. `adms-api/index.js` loads `SUPABASE_KEY` from the environment, so a local `.env` is expected; it is gitignored, and the hardcoded anon key is only the fallback.

## Repo hygiene traps

- **`node_modules` is gitignored and untracked** (0 tracked files). A fresh clone has no dependencies installed — run `npm install` in `adms-api/` (Express server) and `scratch/` (Playwright) if you need them. Both directories keep a real `package.json` and `package-lock.json`, which *are* tracked, so installs are reproducible.
- **Two divergent copies of the homepage exist and are not in sync**: root `index.html` (8,672 lines) and `html/index.html` (7,656 lines) differ by ~2,000 lines. They exist because pages use different relative depths (`js/...` vs `../js/...`). Confirm which one you're editing and mirror the change deliberately; `scripts/dev-tools/copy_index_to_html.js` was the old one-off sync.
- **Broken leftovers at the repo root — do not try to run or fix them**: `test_syntax.js`, `test_syntax2.js`, `test_syntax_final.js`, `temp_script.js` are invalid JS fragments (bare `await`, literal `</script>` tags), and `schema.json` is 0 bytes despite the README calling it the schema reference.
- **`scratch/` (~55 files) and `scripts/dev-tools/` (~28 files) are archaeology**, not runtime. One-off migration/debug scripts, Playwright experiments, `.py`/`.ps1` variants of the same fix. Never wire them into the app; don't "clean them up" casually either (`scripts/dev-tools/README.md` calls them an audit trail).
- `js/admin-about-handler.js.restored` is a stray backup sitting next to the live file.

## Docs are unreliable — verify against code

`README.md` is stale: it lists 18 JS modules (27 exist, plus a stray `.restored` backup) and calls `adms-api` an "optional backend". `adms-api/` is actually a standalone ZKTeco **biometric attendance** receiver (Express, port 4370) that parses `ATTLOG` pushes into `attendance_logs`; the web app never calls it. Much of `docs/` is feature-marketing rather than technical — `docs/reference/SYSTEM_OVERVIEW.md` is a staff-hierarchy feature pitch, not a system overview. Trust `sql/`, `js/`, and the HTML over any doc.

## Conventions

- Single branch `main`, clean tree, work committed directly — don't commit unless asked.
- **History was reset to a single `Initial commit`; there is no `origin` remote yet**, so `git push` fails until one is added. Ask before adding a remote or pushing.
- **Git has no `user.name`/`user.email` configured**, so `git commit` errors with "unable to auto-detect email address". Pass `-c user.name=... -c user.email=...` per-commit rather than writing config unless asked.
- Commit messages use plain imperatives (`Fix admin-portal UI syntax errors...`), with occasional conventional prefixes (`chore:`, `feat:`). Match the imperative form.
- Files are UTF-8 **without BOM**; em-dashes render as `??` in PowerShell console output — that's a console artifact, not file corruption.
