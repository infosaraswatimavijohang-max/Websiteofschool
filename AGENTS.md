# AGENTS.md

Static school-management site (Shree Saraswati Secondary School, Gulmi, Nepal): vanilla HTML/CSS/JS + Supabase. **No build, bundler, framework, CI, test runner, linter, typechecker.** No root `package.json`.

## Run

```bash
python -m http.server 8099     # or: npx.cmd serve . -p 8099
```
Serve from **repo root** (relative paths assume it). Never use `file://`. Pages need internet access (Supabase/Chart.js/Font Awesome via CDN).

Key URLs: `/`, `/html/admin-portal.html`, `/html/about.html`, `/html/student-portal.html`, `/html/teacher-portal.html`.

Root `admin-portal.html` is a 300-byte meta-refresh to `html/admin-portal.html` — **never edit the stub**.

## Verification: the browser is the test suite

Load the page, watch the console, exercise the feature. `adms-api`'s `npm test` is the stock `echo "Error: no test specified" && exit 1` placeholder — that exit 1 is not a real failure. `scratch/e2e_cud_tests.js` and `scratch/e2e_phase1.js` are ad-hoc Playwright drivers wired to no command (`scratch/package.json` declares no scripts); read one to learn how they drive the app. Prefer the `playwright` MCP server.

## Architecture facts that are not obvious from filenames

- **No ES modules anywhere** (0 top-level `import`/`export`, 0 `type="module"` in `js/`, `html/`, or `index.html`). Every `js/*.js` is a classic `<script>` attaching `window.*` globals. Load order is load-bearing. To trace a function, grep its global name across `js/` and the inline `<script>` blocks — there is no import graph.
- **`html/admin-portal.html` is ~17.5k lines, 877 KB, with most logic inline in `<script>` blocks.** Handlers load two different ways; use the right one. (Line numbers drift as the file is edited — grep the anchors, don't trust the numbers.)
  - 16 files come from the `scriptsToLoad` array (~line 616), appended to `document.head` by an async IIFE (~line 654). **Adding a new admin handler means adding it to that array.**
  - 6 more `<script src=>` tags (~lines 21–24, ~611–612): `admin-hero-slider.js`, `admin-hero-video.js`, `admin-popup-ad.js`, `@supabase/supabase-js`, Chart.js. Only the three local handlers carry `defer`; Chart.js and supabase-js are **blocking** and load before the async IIFE. Chart.js is loaded **twice** — a known duplicate.
  - `admin-hero-slider.js` is in **both** lists — a known double-load.
- **7 of the 28 `js/*.js` files are loaded by no page at all**: `admin-about-handler.js`, `admin-academic-handler.js`, `biometric-attendance.js`, `exam-portal-admin.js`, `fee-handler.js`, `student-directory-handler.js`, `student-fee-portal.js`. Editing them changes nothing that runs; the live equivalents are inline in the portals. `html/admin-about-panel.html` likewise loads **zero** external scripts — it is fully inline. Confirm a file is actually wired in before "fixing" it.
- **LocalStorage is a real data layer, not a cache** (238 references in `js/` alone). `pullAllFromSupabase()` (`js/supabase-client.js:60`) mirrors DB rows into LocalStorage and many read paths hit LocalStorage directly. Don't treat it as disposable.
- **The `*_REAL` indirection is intentional — preserve the suffix.** `js/about-data.js:1408-1410` exports `window.createAdminMember_REAL` / `readAllAdminTeam_REAL` / `deleteAdminMember_REAL`. `html/admin-portal.html` (lines 673–704) defines early fallback wrappers for the *unsuffixed* names that poll for the `_REAL` globals (100 × 100 ms ≈ 10 s, then give up with a console warning). Renaming either side silently breaks the about-team admin CRUD.

## Two Supabase projects — do not mix them

`js/supabase-client.js:14-18` hardcodes two anon clients:

- **DB1** `ohczlooperjqpyllmabo` — primary data (`supabaseDb`)
- **DB2** `xowlownqmnfffhnkxdpw` — media/pictures/gallery (`supabaseMedia`, 33 uses in `js/`)

`sql/setup/setup.sql` covers **both**. SECTION 1 → DB1; **SECTION 2 (line 548, header names the DB2 URL at 549) must be run in DB2's SQL editor**. Pasting the whole file into one project is wrong — the README's "run setup.sql" instruction is incomplete. Some scripts are *split* across both and must be run piecewise: `sql/setup/NOTICES_BUCKET_SETUP.sql` has a DB1 `alter table public.school_announcements` plus a DB2 `storage.buckets` insert and policies.

## SQL has no migration system

Schema applied by hand in Supabase SQL Editor in arbitrary order. Additive: `sql/setup/` (40), patches: `sql/fixes/` (3), queries: `sql/queries/` (1). No rollbacks/auto-apply — assume partial state. Never run `supabase init` (no `supabase/` dir; `.gitignore` has `supabase/.temp/` and `supabase/.branches/`).

## Agent tooling (see `opencode.json`)

MCP servers — **restart opencode after any config change**, it is not hot-reloaded:

- **supabase** (remote) — deliberately scoped: `?project_ref=ohczlooperjqpyllmabo&read_only=true`. Read-only because the DB holds real student PII and plaintext passwords. To inspect media DB2 or allow writes, edit that URL; dropping `project_ref` entirely grants access to *every* project in the account. Auth: `opencode mcp auth supabase` (OAuth, no PAT).
- **context7** (remote) — uses a `CONTEXT7_API_KEY` env var as a bearer token with `oauth: false`. There is no OAuth flow to run; if it 401s, the env var is missing.
- **playwright** (local) — `npx.cmd -y @playwright/mcp@0.0.83`. Practical replacement for "reload and watch the console". Writes `.playwright-mcp/` directory (logs, snapshots, screenshots) at repo root; **untracked and not in `.gitignore`**, so never `git add` it — stage paths explicitly.

Agent skills live in `.claude/skills/` (from `supabase/agent-skills`, pinned by `skills-lock.json`) and are registered through `skills.paths` because opencode does not auto-scan a project-level `.claude/`. Load `supabase-postgres-best-practices` before writing SQL or RLS. Update with `npx.cmd -y skills update`.

**graphify is installed** (v0.9.76; `pip install --user "graphifyy[mcp]"` — the `[mcp]` extra is required or `graphify.serve` fails with `ModuleNotFoundError: No module named 'mcp'`). Invoked as `python -m graphify`, since its scripts dir is not on `PATH`. It is also registered as a **local MCP server** (`graphify` in `opencode.json`) giving native `query_graph`, `get_node`, `get_neighbors`, `get_community`, `god_nodes`, `graph_stats`, `shortest_path`. Verified working: 610 nodes / 1018 edges / 45 communities.

Graph and HTML visualizers live **outside the repo** at `C:\Users\saras\.graphify\school-website\` (`graph.json`, `graph.html`, `CALLFLOW.html`, `GRAPH_REPORT.md`) — deliberately not in the repo and not in `%TEMP%`, which Windows cleans. `graphify-out/` is **not** gitignored, so never let one be committed at the repo root. CLI equivalents against that graph: `python -m graphify query "..."`, `explain "X"`, `god-nodes`, `path "A" "B"`, `affected "X"`. To rebuild after edits, re-stage the runtime dirs and re-run `extract --code-only` (AST is local, no API key, nothing sent anywhere).

**Critical caveat: the graph does not know which files are wired in.** AST extraction parses every `js/*.js` file regardless of whether any page loads it, so **3 of its top 4 god-nodes are dead files** — `StaffHierarchyHandler` (1st), `StudentFeePortal` (2nd), `StudentDirectoryHandler` (4th) all live in the never-loaded set above. Community 4 (`fee-management-crud`) is entirely `fee-handler.js`, which never runs. The graph tells you *what a file does*; only the wiring facts above tell you *what runs*. Cross-check any god-node or community against the dead-files list before acting on it.

**PowerShell quirk (this machine):** execution policy blocks `.ps1` shims, so bare `npm`/`npx`/`supabase` fail with a `SecurityError`. Always use the `.cmd` variants (`npm.cmd`, `npx.cmd`, `supabase.cmd`) or run from `cmd.exe`. This is why the playwright MCP `command` is pinned to `npx.cmd` — change it back to `npx` on Linux/macOS.

## Security posture (don't assume protections that aren't there)

- RLS policies gate on `auth.role() = 'authenticated'` (`sql/fixes/FIX_RLS_POLICIES.sql`) — **any signed-in Supabase user is effectively an admin**; there is no role separation. The file's own NOTES block admits this and suggests `ALTER ROLE authenticated WITH BYPASSRLS` as a debugging shortcut; don't ship that.
- `student_credentials.student_password` (`sql/setup/setup.sql:25`, "Store as bcrypt hash in production") and `teacher_credentials.teacher_password` (line 366, "Plain text for ease of prototype sync") hold **plaintext** passwords.
- Supabase **anon** keys are committed in `js/supabase-client.js:15`/`:18` and as the `SUPABASE_KEY` fallback at `adms-api/index.js:14`. Treat RLS as the only backend guard and **never add a service-role key or other secret to the repo**. `adms-api/index.js` reads `PORT`/`SUPABASE_URL`/`SUPABASE_KEY` from a `.env` via dotenv; `.env` is gitignored and `.gitignore` explicitly says to keep a `.env.example` instead — but **no `.env.example` is committed**, so create one if you add env config.

## Repo hygiene traps

- **`node_modules` is gitignored and untracked** (0 tracked files). A fresh clone has no dependencies — run `npm install` in `adms-api/` (Express 5, port 4370) and `scratch/` (Playwright + supabase-js) as needed. Both keep tracked `package.json` + `package-lock.json`, so installs are reproducible.
- **Two divergent copies of the homepage exist and are not in sync**: root `index.html` (~8.7k lines) and `html/index.html` (~7.7k lines). Both load the same four handlers and both are reachable (`/` and `/html/index.html`); neither is linked as canonical — both nav bars use `href="#"` for Home. They differ partly because of relative depth (`js/...` vs `../js/...`). Confirm which one you're editing and mirror the change deliberately; `scripts/dev-tools/copy_index_to_html.js` was the old one-off sync.
- **Broken leftovers at the repo root — do not run or fix them**: `test_syntax.js`, `test_syntax2.js`, `test_syntax_final.js` (~411 KB each) and `temp_script.js` (278 KB) are invalid JS fragments (bare `await`, literal `</script>` tags), and `schema.json` is 0 bytes despite the README calling it the schema reference.
- **`scratch/` (56 top-level files + its own `node_modules`) and `scripts/dev-tools/` (28 files) are archaeology, not runtime.** One-off migration/debug scripts, Playwright experiments, `.py`/`.ps1` variants of the same fix. Never wire them into the app; don't "clean them up" either — `scripts/dev-tools/README.md:39` calls them an audit trail.
- `js/admin-about-handler.js.restored` (49 KB) is a stray backup sitting next to `js/admin-about-handler.js` (103 KB) — **neither** is loaded by any page (see the dead-files bullet above).
- Root `improve.pdf`, `notices_error.png`, `students_error.png`, `teachers_error.png` are **committed debug captures**, not assets — they should never be linked from a page.

## Docs are unreliable — verify against code

`README.md` is stale: its module table lists 17 JS files (28 exist, plus the stray `.restored`) — and **6 of those 17 are dead files** listed as if live: `admin-about-handler`, `biometric-attendance`, `exam-portal-admin`, `fee-handler`, `student-directory-handler`, `student-fee-portal`. It never mentions the DB1/DB2 split. `adms-api/` is not a "Backend Node.js API server (optional)" — it is a standalone ZKTeco **biometric attendance** receiver that serves `/iclock/*` and parses `ATTLOG` pushes into `attendance_logs`; the web app never calls it (0 references to `adms-api`, `4370`, or `iclock` in `js/` or `html/`). Much of `docs/` is feature-marketing — `docs/reference/SYSTEM_OVERVIEW.md:3` is a staff-hierarchy feature pitch marked "READY FOR IMPLEMENTATION", not a system overview. Trust `sql/`, `js/`, and the HTML over any doc.

## Conventions

- Single branch `main`, tracking `origin/main` (266 tracked files; local may run ahead). Run `git status` before committing — tree not guaranteed clean.
- **Git has no `user.name`/`user.email` configured** — pass `-c user.name=... -c user.email=...` per commit; don't write config unless asked.
- Don't commit, add remotes, or push unless asked.
- Commit messages use plain imperatives (`Fix admin-portal UI syntax errors...`), occasionally `chore:`/`feat:`; match the form.
- UTF-8 without BOM. PS 5.1 ANSI rendering can misdisplay non-ASCII (artifact); `LF will be replaced by CRLF` is `core.autocrlf` (not corruption).
