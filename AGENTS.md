# AGENTS.md

Static school-management site (Shree Saraswati Secondary School, Gulmi, Nepal): vanilla HTML/CSS/JS + Supabase. **No build, bundler, framework, CI, test runner, linter, typechecker, `.editorconfig`, or root `package.json`.** 167 tracked files. The only editor config is `.vscode/settings.json` (a color theme).

## Run

```bash
python -m http.server 8099     # or: npx.cmd serve . -p 8099
```

Serve from **repo root** (relative paths assume it). Never use `file://`. Pages need internet access (Supabase/Chart.js via CDN).

Key URLs: `/`, `/html/admin-portal.html`, `/html/about.html`, `/html/student-portal.html`, `/html/teacher-portal.html`.

Two files are meta-refresh stubs — **never edit either**: root `admin-portal.html` → `html/admin-portal.html`, and `html/student-login.html` (51 lines) → `html/index.html`. The latter is self-inconsistent and easy to misread: its meta refresh says `url=index.html` (the `html/` copy) while the "click here" fallback anchor says `../index.html` (the root copy). Sibling pages such as `html/about.html` treat the root homepage as canonical — don't assume the stub's two targets are the same file.

## Verification: the browser is the test suite

Load the page, watch the console, exercise the feature. There is **no test file anywhere** (the ad-hoc `scratch/e2e_*.js` Playwright drivers were deleted in commit `b2eb9bd`; deleted files are *not* in HEAD — recover with `git show b2eb9bd^:<path>`). `adms-api`'s `npm test` is the stock `echo "Error: no test specified" && exit 1` placeholder — that exit 1 is not a real failure. Use the `playwright` MCP server.

**`ripgrep` is not installed on this machine** — use the grep tool or `Select-String`, not `rg`.

## Architecture facts that are not obvious from filenames

- **No ES modules anywhere** (0 top-level `import`/`export`, 0 `type="module"` in `js/`, `html/`, or `index.html`). Every `js/*.js` is a classic `<script>` attaching `window.*` globals, so load order is load-bearing. To trace a function, grep its global name across `js/` and the inline `<script>` blocks — there is no import graph.
- **`html/admin-portal.html` is 17.5k lines / 856 KB with most logic inline in `<script>` blocks.** Handlers load two different ways; use the right one. (Line numbers drift as the file is edited — grep the anchors, don't trust the numbers.)
  - 15 files come from the `scriptsToLoad` array (line 615), appended to `document.head` sequentially by an async IIFE (line 651) that ends by calling `waitForAboutDataFunctions()`. **Adding a new admin handler means adding it to that array.**
  - 5 more `<script src=>` tags: `admin-hero-slider.js`, `admin-hero-video.js`, `admin-popup-ad.js` (all `defer`, head lines 21–23), Chart.js (line 24) and `@supabase/supabase-js` (line 611). Chart.js and supabase-js are **blocking** and execute before the async IIFE, so anything in `scriptsToLoad` may assume both exist.
  - **The hero slider must load exactly once, via the head tag**: it wraps its work in `DOMContentLoaded` and binds a click handler on `[onclick*="hero-slider"]`, so loading it twice double-binds the save button (double-posted hero slides) and loading it late risks never binding at all. (Chart.js and the hero slider used to be duplicated; de-duplicated during the cleanup — don't reintroduce.)
- **Wiring map — all 21 `js/*.js` files are loaded by at least one page** (verified by grepping every filename against every `.html`; zero orphans):

  | Page | loads |
  |---|---|
  | `index.html` (root) | supabase-client, class-handler, admission-handler, document-handler |
  | `html/index.html` | same four (`../js/...`) |
  | `html/admin-portal.html` | hero-slider/video/popup-ad (head) + 15 in `scriptsToLoad` |
  | `html/about.html` | supabase-client, about-data |
  | `html/teacher-portal.html` | supabase-client, timetable-handler, subject-handler, exam-result-handler, notification-handler |
  | `html/student-portal.html` | supabase-client, notification-handler |
  | `html/staff-management-admin.html`, `html/organizational-tree.html` | supabase-client, staff-handler |
  | `html/student-directory.html` | supabase-client **only** (handler logic is inline) |
  | `html/faculty-showcase.html` | faculty-showcase **only** |

  Seven never-loaded orphans — `admin-about-handler`, `admin-academic-handler`, `biometric-attendance`, `exam-portal-admin`, `fee-handler`, `student-directory-handler`, `student-fee-portal` — were deleted; their live logic is inline in the portals, and `html/admin-about-panel.html` went with them. `docs/` still documents them (see docs caveat).
- **`html/faculty-showcase.html` never gets a Supabase client** — its CDN `<script>` tag is commented out (line 58) and it does not load `supabase-client.js`, so `js/faculty-showcase.js` always takes its mock-data path (`window.supabaseDb` is undefined). This is by design, not a bug to fix.
- **LocalStorage is a real data layer, not a cache** (228 references in `js/` alone). `pullAllFromSupabase()` (`js/supabase-client.js:60`) mirrors DB rows into LocalStorage and many read paths hit LocalStorage directly. Don't treat it as disposable.
- **House & club membership** uses `student_group_memberships` (`sql/setup/HOUSE_CLUB_MEMBERSHIP_SETUP.sql`): one row per student per group (`group_type` `house`/`club`, `position` leader/co-leader/member, `position_rank` 1/2/3). The Admin Portal's Create Student Account form + Houses & Clubs Roster (`html/admin-portal.html`) drive it via `createStudentGroupMembership` / `deleteStudentGroupMembership` / `syncStudentGroupMemberships` (`js/supabase-client.js`, mirrored into the `student_group_memberships` localStorage key). The group catalog is derived dynamically: houses = `school_clubs` titles ending in "House" (Resunga/Thapla/Satyawati/Ruru), clubs = the rest — don't hardcode a second list.
- **The `*_REAL` indirection is intentional — preserve the suffix.** `js/about-data.js:1408-1410` exports `window.createAdminMember_REAL` / `readAllAdminTeam_REAL` / `deleteAdminMember_REAL`. `html/admin-portal.html` (665–706) defines early fallback wrappers for the *unsuffixed* names that poll for the `_REAL` globals — 100 × 50 ms ≈ 5 s, then return `[]` or throw. A separate `waitForAboutDataFunctions()` (711–732) polls 100 × 100 ms ≈ 10 s. Renaming either side silently breaks the about-team admin CRUD.

## Two Supabase projects — do not mix them

`js/supabase-client.js:14-18` hardcodes two anon clients:

- **DB1** `ohczlooperjqpyllmabo` — primary data (`supabaseDb`)
- **DB2** `xowlownqmnfffhnkxdpw` — media/pictures/gallery (`supabaseMedia`, 33 uses in `js/`)

`sql/setup/setup.sql` has 9 sections and spans **both** databases. SECTION 1 → DB1; **SECTION 2 only (line 548, header names the DB2 URL at 549) → DB2**; SECTIONS 3–9 are DB1 example queries. Pasting the whole file into one project is wrong — the README's "run setup.sql" instruction is incomplete. Some scripts are *split* across both and must be run piecewise: `sql/setup/NOTICES_BUCKET_SETUP.sql` has a DB1 `alter table public.school_announcements` (line 7) plus a DB2 `storage.buckets` insert and policies (lines 10-19).

## SQL has no migration system

Schema applied by hand in the Supabase SQL Editor in arbitrary order. Additive: `sql/setup/` (41 files), patches: `sql/fixes/` (3), queries: `sql/queries/` (1). No rollbacks, no auto-apply — assume partial state. Never run `supabase init` (no `supabase/` dir; `.gitignore` keeps `supabase/.temp/` and `supabase/.branches/` out).

## Agent tooling (see `opencode.json`)

MCP servers — **restart opencode after any config change**, it is not hot-reloaded:

- **supabase** (remote) — scoped: `?project_ref=ohczlooperjqpyllmabo&read_only=false`. Currently **write-enabled** (flipped from the original `read_only=true`; that edit lives uncommitted in `opencode.json` — `git status` will show it). The DB holds real student PII and plaintext passwords, so write only deliberately; the read-only URL was the safer default. To inspect media DB2, edit that URL; dropping `project_ref` entirely grants access to *every* project in the account. Auth: `opencode mcp auth supabase` (OAuth, no PAT).
- **context7** (remote) — uses a `CONTEXT7_API_KEY` env var as a bearer token with `oauth: false`. There is no OAuth flow to run; if it 401s, the env var is missing.
- **playwright** (local) — `npx.cmd -y @playwright/mcp@0.0.83`. Practical replacement for "reload and watch the console". Writes a `.playwright-mcp/` directory at repo root — gitignored, but still stage paths explicitly rather than `git add -A`.
- **graphify** (local) — `python -m graphify.serve C:\Users\saras\.graphify\school-website\graph.json`. **Call these tools with `project_path` omitted.** Omitting it works because the server defaults to the graph path passed in `opencode.json`; passing *any* `project_path` makes the tool append `graphify-out/graph.json` to it and fail with `graph file not found: ...\graphify-out\graph.json` (that directory does not exist in the repo). Unlike the other servers, this one re-reads `graph.json` per call, so swapping the file needs no restart.

Agent skills live in `.claude/skills/` (40 tracked files, from `supabase/agent-skills`, pinned by `skills-lock.json`) and are registered through `skills.paths` because opencode does not auto-scan a project-level `.claude/`. Load `supabase-postgres-best-practices` before writing SQL or RLS. Update with `npx.cmd -y skills update`.

**graphify CLI** is installed (v0.9.76; `pip install --user "graphifyy[mcp]"` — the `[mcp]` extra is required or `graphify.serve` fails with `ModuleNotFoundError: No module named 'mcp'`). Its scripts dir is not on `PATH`, so invoke as `python -m graphify` and pass the graph explicitly:

```powershell
$G = "C:\Users\saras\.graphify\school-website\graph.json"
python -m graphify god-nodes --graph $G
python -m graphify query "fee management" --graph $G
python -m graphify explain "X" --graph $G
python -m graphify path "A" "B" --graph $G
python -m graphify affected "X" --graph $G
```

The graph and its HTML visualizers live **outside** the repo at `C:\Users\saras\.graphify\school-website\` (`graph.json`, `manifest.json`, `graph.html`, `CALLFLOW.html`, `GRAPH_REPORT.md`), deliberately not in the repo and not in `%TEMP%`, which Windows cleans. The MCP server re-reads `graph.json` per call, so replacing that file updates the tools with no restart.

**Rebuilding the graph — `--code-only` is mandatory, and it must be a clean run.** `extract`/`update` always write to `<path>/graphify-out/` *inside* the target dir, never to the external dir, so copy `graph.json` + `manifest.json` + `graph.html` + `GRAPH_REPORT.md` over afterwards or the MCP tools keep serving the old graph. Two traps:

- **Without `--code-only`, `docs/` swamps the graph.** A full extract produced 1665 nodes / 143 communities whose top hubs were markdown headings (`✅ DYNAMIC CLASS SETUP - PROJECT COMPLETE`, `🎉 ADVANCED STAFF HIERARCHY SYSTEM`) rather than code symbols. The current graph is code-only: **450 nodes / 701 edges / 32 communities**, hubs are all live code (`StaffHierarchyHandler` `js/staff-handler.js:17` 21 edges, `TimetableHandler` 16, `fallbackDeleteFromCache()` / `getFromDbOrCache()` 14, `loadAllAboutData()` 14, `ClassHandler`/`DocumentHandler` 13).
- **`update --force` and `extract --force` do *not* drop previously-indexed nodes.** `--force` skips the manifest gate but keeps "existing semantic layer preserved", so a `--code-only` run over a non-code-only graph keeps all the doc nodes. To actually go code-only, `Remove-Item -Recurse -Force graphify-out` first, then extract, then `cluster-only --no-label` (regenerates `GRAPH_REPORT.md`/`graph.html` to match).

```powershell
Remove-Item -Recurse -Force graphify-out
python -m graphify extract "C:\Users\saras\OneDrive\Desktop\web school\school-website" --code-only
python -m graphify cluster-only "C:\Users\saras\OneDrive\Desktop\web school\school-website" --no-label
```

Coverage gaps, both benign: the 45 `.sql` files are skipped for a missing `tree_sitter_sql` dep (`pip install "graphifyy[sql]"` adds them), and `js/faculty-showcase.js` yields no symbols. So **the graph cannot answer SQL-schema or faculty-showcase questions** — grep for those.

Still true: AST extraction indexes every `js/*.js` whether or not a page loads it, so the graph does not know the wiring. Cross-check hub/community output against the wiring map above.

**PowerShell quirk (this machine):** execution policy blocks `.ps1` shims, so bare `npm`/`npx`/`supabase` fail with a `SecurityError`. Always use the `.cmd` variants (`npm.cmd`, `npx.cmd`, `supabase.cmd`) or run from `cmd.exe`. This is why the playwright MCP `command` is pinned to `npx.cmd` — change it back to `npx` on Linux/macOS.

## Security posture (don't assume protections that aren't there)

- RLS policies gate on `auth.role() = 'authenticated'` (~30 occurrences in `sql/fixes/FIX_RLS_POLICIES.sql`) — **any signed-in Supabase user is effectively an admin**; there is no role separation. The file's own NOTES block (line 298) suggests `ALTER ROLE authenticated WITH BYPASSRLS` as a debugging shortcut; don't ship that.
- `student_credentials.student_password` (`sql/setup/setup.sql:25`, "Store as bcrypt hash in production") and `teacher_credentials.teacher_password` (line 366, "Plain text for ease of prototype sync") hold **plaintext** passwords.
- Supabase **anon** keys are committed in `js/supabase-client.js:15`/`:18` and as the `SUPABASE_KEY` fallback at `adms-api/index.js:14`. Treat RLS as the only backend guard and **never add a service-role key or other secret to the repo**. `adms-api/index.js` reads `PORT`/`SUPABASE_URL`/`SUPABASE_KEY` from a `.env` via dotenv; `.env` is gitignored and `.gitignore` explicitly says to keep a `.env.example` instead — but **no `.env.example` is committed**, so create one if you add env config.

## Repo hygiene traps

- **A ~102-file cleanup was committed as `b2eb9bd`** (HEAD is now `9b347d2`), so the working tree is clean — but the deleted files are *gone from HEAD*: `git show HEAD:<path>` fails for them. Deleted: root `test_syntax*.js`/`temp_script.js`/empty `schema.json`, debug captures (`improve.pdf`, `*_error.png`), the stray `js/admin-about-handler.js.restored`, the never-loaded `js/*.js` orphans, and the `scratch/` + `scripts/dev-tools/` archaeology directories. Recover with `git show b2eb9bd^:<path>` rather than recreating it.
- **`node_modules` is gitignored and untracked** (0 tracked files). A fresh clone has no dependencies — run `npm install` in `adms-api/` (Express 5, port 4370) as needed; its `package.json` + `package-lock.json` are tracked, so installs are reproducible. **Nothing in the web app calls it**: 0 references to `adms-api`, `4370`, or `iclock` in `js/` or `html/`.
- **Two divergent copies of the homepage exist and are not in sync**: root `index.html` (8.7k lines) and `html/index.html` (7.7k lines). Both load the same four handlers, both are reachable (`/` and `/html/index.html`), and neither is canonical — both nav bars use `href="#"` for Home. They differ partly because of relative depth (`js/...` vs `../js/...`, `html/about.html` vs `about.html`). Confirm which one you're editing and mirror the change deliberately.

## Docs are unreliable — verify against code

`README.md` is partly fixed and partly stale. Still wrong: its module table lists **11 of the 21** JS files (10 wired-in handlers unlisted) and its file tree omits `html/faculty-showcase.html` entirely; it never mentions the DB1/DB2 split; it tells you to replace `const SUPABASE_URL` / `SUPABASE_ANON_KEY` in `js/supabase-client.js` (README:131-132) — **those names no longer exist** (they are `DB1_URL`/`DB1_KEY`/`DB2_URL`/`DB2_KEY`); and it describes `html/student-login.html` as "Student auth entry" when it is a redirect stub. (It *has* been corrected to call `adms-api/` a ZKTeco biometric receiver — it is indeed a standalone `/iclock/*` receiver parsing `ATTLOG` pushes into `attendance_logs`.)

**`docs/` still documents the 7 deleted orphan files** (`fee-handler.js`, `student-fee-portal.js`, `admin-about-handler.js`, `student-directory-handler.js` and friends) with copy-paste `<script src>` snippets — following those guides would reintroduce dead code. 8 guides now open with a **"STALE GUIDE"** banner naming the deleted files, so read the banner first. Much of `docs/` is feature-marketing: `docs/reference/SYSTEM_OVERVIEW.md` is a staff-hierarchy feature pitch marked "READY FOR IMPLEMENTATION", not a system overview. Trust `sql/`, `js/`, and the HTML over any doc.

## Conventions

- Single branch `main`, tracking `origin/main`. Run `git status` before committing — the tree is normally clean; recurring exceptions are `opencode.json` (MCP URL edits) and `.playwright-mcp/`/`graphify-out/` noise (both gitignored).
- **Git has no `user.name`/`user.email` configured** — pass `-c user.name=... -c user.email=...` per commit; don't write config unless asked.
- Don't commit, add remotes, or push unless asked.
- Commit messages use plain imperatives (`Fix admin-portal UI syntax errors...`), occasionally `chore:`/`feat:`; match the form.
- UTF-8 without BOM. PS 5.1 ANSI rendering can misdisplay non-ASCII (artifact); `LF will be replaced by CRLF` is `core.autocrlf` (not corruption).
