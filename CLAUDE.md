# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

The conventions below reflect established best practices and agreements adapted to this project's stack and domain (AutoAgenda — CNH/driving-school scheduling). Treat them as proven agreements, not speculation — apply them from the first real feature onward instead of improvising fresh conventions per PR.

## Language

Always communicate with the user in Brazilian Portuguese (pt-BR) — both chat responses and any written output (commit messages, PR descriptions, docs generated for them) — unless the user explicitly asks for another language. Code identifiers, comments, and technical content should still follow the project's conventions (see Naming conventions below), not this rule.

**Explicit exception — commit messages**: the actual git commit message text (subject/body) is always written in English, matching common OSS/tooling convention (see Git commits below). Only the commit message content is English; chat responses about the commit stay in pt-BR.

## Precedence

When instructions from different sources could apply to the same task, resolve in this order:

1. The current task's explicit instruction.
2. A `.claude/rules/*.md` file whose `paths:` frontmatter matches the file being touched (none exist yet — if topic-specific conventions grow large enough to need path-scoping, e.g. `apps/web/**` vs `apps/api/**`, split them out of this file instead of letting this file balloon).
3. This file's global conventions.
4. `docs/` (the academic specification set, DOC-00 … DOC-10) for product/business/architecture requirements — authoritative for *what* the system must do, except where "Reconciling with the academic spec" below records a deliberate deviation.
5. Auto-memory precedent (cross-session notes) — useful context, not an authoritative rule source; if it conflicts with 1–4, the instruction files win.

## Academic scope & delivery philosophy

This is a Projeto Integrador II deliverable, not a production system — the professor will download it, run it locally, and check a handful of things. Every scoping decision (this change and future ones) should optimize for that reality, not for feature completeness:

- **The goal is demonstrated understanding, not a fully-built product.** A change earns its place by showing the student grasped the requirement and can make it work — not by covering every menu item, every CRUD operation, or every state transition `docs/` describes for a given feature.
- **Mocking/hardcoding a piece is a legitimate, deliberate choice — not a shortcut to apologize for.** When a sub-requirement exists mainly to make a larger flow *look* complete (e.g. a configuration table with no admin UI to edit it, an authorization matrix nobody has data to violate yet), prefer a hardcoded constant or a fixed seed value over building real CRUD/UI for it. Document the choice inline (a comment) and in the change's `design.md` Non-Goals — don't silently under-build without a trace of the decision.
- **Evaluate scope per case, the same judgment call recorded in `docs/README.md`'s per-project memory** (`[[scope_evaluate_per_case]]`): some flows genuinely warrant a full CRUD (student registration did — list/create/edit/deactivate are all real, distinct needs an autoescola has). Others don't (per-vehicle unavailability windows, instructor self-service, a settings-editing screen with a single seeded row nothing reads back). Ask "does building this teach/prove something the simpler version doesn't?" before adding scope, not "does `docs/04`'s endpoint table mention it?"
- **Keep the repo easy to clone-and-run.** Prefer fewer moving parts (fewer migrations, fewer services, fewer screens) that are genuinely solid over more moving parts that are each thinner. A reviewer should be able to `yarn install`, log in with a seeded account, and see the feature work within a couple of clicks — that experience matters more than endpoint-table completeness.
- **`README.md` is what orients that reviewer** — keep it current (see "Keeping README.md current" below) with an accurate, current picture of what the project actually is and does today, not an aspirational one.

**[CHECKLIST.md](CHECKLIST.md) is the standing, high-level tracker of what's implemented vs. pending, grouped by profile/area (Autenticação, Administrador, Instrutor, Aluno, Transversais) — not by individual endpoint or screen.** Consult it whenever scoping "what's next" (it's a faster read than re-deriving state from `git log` or the archived changes), and update it in the same session/commit whenever an item's status actually changes: a change gets applied, something is deliberately marked out of scope, or a gap is discovered that wasn't listed. Keep entries at the "feature per profile" altitude the file already uses — resist the urge to expand it into an endpoint-by-endpoint spec; that level of detail belongs in each change's own `design.md`/`tasks.md`, not here.

## Project state

This is a Yarn workspaces monorepo for **AutoAgenda**. `apps/web` (Vite + React 19 + TypeScript + TailwindCSS) has a working shell (routing, providers, per-profile navigation) and a real, working login flow (forgot/reset password screens remain UI-only, submission stubbed). `apps/api` (Node.js/Express) has its infrastructure (server, middleware, health checks, SQLite connection) plus its first domain feature: authentication (`POST /auth/login`, `POST /auth/logout`, `GET /me`) with a versioned migrations mechanism and a seeded demo user. `packages/contracts` (shared schemas/types) is still an empty placeholder. The sections below define the target architecture/conventions to build *toward* as further features land.

## Repository structure

```
apps/web/            # React/Vite frontend — implemented, see Target stack
apps/api/             # Node.js/Express backend — infrastructure implemented; first domain feature (auth) implemented
packages/contracts/   # Shared schemas/types between web and api — placeholder only
docs/                 # Academic specification set (DOC-00…DOC-10) — source of truth, see docs/README.md
infra/                # Docker/deployment config — placeholder, not built yet
openspec/             # Local-only planning tooling (gitignored, see Spec-driven workflow below)
```

Root `package.json` only declares the Yarn workspaces (`apps/*`, `packages/*`) — it has no scripts of its own. Run a package's scripts either with `yarn workspace <package-name> <script>` (e.g. `yarn workspace @auto-agenda-cnh/web dev`) or `yarn --cwd apps/web <script>` from the repo root. **Unless stated otherwise, every relative path mentioned elsewhere in this file (`src/`, `scripts/`, `data/`, `package.json`, `tsconfig*.json`, `tailwind.config.js`, etc.) is relative to `apps/web/`** for frontend conventions, and relative to `apps/api/` for backend conventions — each section makes clear which package it's about.

## Reconciling with the academic spec

`docs/` (see Precedence above) is the academic specification set this project must satisfy for Projeto Integrador II. Several places where the actual implementation deliberately deviates from what those documents prescribe — **all pending confirmation with the professor per DOC-10 §8**, so they may change:

- **Database: local SQLite, not PostgreSQL.** DOC-04 §1, DOC-05 §1, and DOC-09 §4/§7 all specify PostgreSQL. This project keeps the already-working local SQLite setup (`node:sqlite`, see Local database below) instead. If/when this gets confirmed to need to change, treat it as a real migration (schema, queries, `DATABASE_URL`), not a config toggle.
- **Backend: TypeScript, not plain JavaScript.** DOC-04 §1 says "Node.js LTS com Express e JavaScript ES Modules." `apps/api` uses TypeScript instead, for consistency with `apps/web` (also TypeScript) and the type-safety that implies. Runs natively on Node ≥22.5 via built-in type-stripping — no bundler/compiler needed at runtime, `tsc --noEmit` is a type-check-only CI gate (see Architecture: backend below).
- **Auth/session: token in the response body + `sessionStorage`, not an HttpOnly cookie.** SEG-002 (DOC-07 §2) requires session state in an HttpOnly cookie. This is an academic project that won't reach production and isn't being evaluated on security hardening (no CSRF protection, no `Secure`/`SameSite` tuning) — the user made a deliberate, informed call to prioritize implementation/testing simplicity (no cookie jar to manage when hitting the API directly) over this specific control. `POST /auth/login` returns the session token in the JSON body; the frontend stores it in `sessionStorage` and sends it back via a header on subsequent requests. This **retires the HttpOnly-cookie agreement** that had itself superseded an even earlier `sessionStorage` agreement — see Auth & state below for what actually applies now. The session itself is still stored server-side (SQLite `session` table, opaque ID, revocable per SEG-019) — only the transport mechanism deviates from SEG-002, not the "revocable server-side session" principle.
- **DOC-03 (front-end specification) was never supplied.** Routes, screens, and component conventions are therefore owned by this project itself rather than derived from that document — see Architecture: component structure and the front-end best-practices mandate below. Details in `docs/README.md`.

Everything else in `docs/` (business rules, data dictionary shape, security requirements beyond SEG-002, test plan, etc.) is still the target to build toward — these are the only recorded deviations.

## Commands

```bash
yarn install                          # from repo root — installs every workspace package + runs apps/api's postinstall (SQLite setup)

# apps/web
yarn workspace @auto-agenda-cnh/web dev       # start Vite dev server
yarn workspace @auto-agenda-cnh/web build     # tsc -b (project references) then vite build
yarn workspace @auto-agenda-cnh/web lint      # eslint .
yarn workspace @auto-agenda-cnh/web preview   # preview a production build
yarn workspace @auto-agenda-cnh/web test      # cypress run --component

# apps/api
yarn workspace @auto-agenda-cnh/api dev       # start the API with auto-restart (node --watch, runs .ts directly)
yarn workspace @auto-agenda-cnh/api start     # start the API (no auto-restart)
yarn workspace @auto-agenda-cnh/api build     # tsc --noEmit — type-check only, no bundler needed
yarn workspace @auto-agenda-cnh/api lint      # eslint .
yarn workspace @auto-agenda-cnh/api db:setup  # (re-)create the local SQLite file, idempotent
```

Equivalently, `yarn --cwd apps/web <script>` / `yarn --cwd apps/api <script>` work the same way and are shorter to type.

This project uses `yarn` (root `yarn.lock`, not npm/pnpm).

## TypeScript / build setup

- `apps/web/tsconfig.json` is a references-only root pointing at `tsconfig.app.json` (src) and `tsconfig.node.json` (Vite config). The build script type-checks via `tsc -b` across both before bundling.
- `apps/web/tsconfig.app.json` targets `es2023`, uses bundler module resolution, and enables `verbatimModuleSyntax`, `noUnusedLocals`/`noUnusedParameters`, and `erasableSyntaxOnly` — write type-only imports as `import type { ... }` and avoid TS syntax that requires emit-time transformation (e.g. enums, parameter properties).
- `noEmit` is set; `@vitejs/plugin-react` handles transpilation, `tsc` is type-checking only.

## Git commits

A global slash command, `/git-commit`, is available (defined in `~/.claude/commands/git-commit.md`, works in any repo). When the user runs it: inspect `git status`/`git diff`/`git log` to learn this repo's real commit style, stage only the relevant changes, and create a single semantic commit with an English message matching that style. It never pushes — it always stops right after the local commit so the user can review and push themselves.

**Every `/git-commit` run in this repo also updates [CHANGELOG.md](CHANGELOG.md)**, in the same commit, before creating it. This project uses a **date-based** changelog, not version-based:

- Entries are grouped under a `## AAAA-MM-DD` heading (ISO order: year, month, day) for the day the commit is made, newest date first. If today's date section already exists (an earlier commit today already added one), append to it instead of creating a duplicate heading.
- Within a date section, use category subheadings in **Portuguese** — `### Adicionado`, `### Alterado`, `### Corrigido`, `### Removido` (skip whichever don't apply) — mirroring [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)'s categories, translated.
- Keep entries short and user-facing (what changed, not how) — no restating the whole diff, no internal implementation detail that doesn't matter outside the codebase. Skip purely internal/no-op changes (formatting-only, comment-only) if they genuinely have nothing worth telling a reader.

**`CHANGELOG.md` content (headings and entries) is always written in Brazilian Portuguese (pt-BR)** — this is a deliberate exception to the "commit messages are English" rule above; the two are independent (commit subject/body stays English, the changelog entry describing that same commit is pt-BR).

## Spec-driven workflow (OpenSpec)

This repo uses the `openspec` CLI plus the bundled `opsx` slash commands for a propose → apply → archive workflow, configured via `openspec/config.yaml` at the repo root (unaffected by the monorepo layout — it plans changes across any package):

- `/opsx:propose` — describe a feature/fix, generates `proposal.md`, `design.md`, `tasks.md` for a new change (kebab-case name) under the OpenSpec planning home.
- `/opsx:explore` — open-ended thinking/investigation mode before or during a change, no artifacts required.
- `/opsx:apply` — implement the tasks from an existing change's `tasks.md`.
- `/opsx:archive` — finalize and archive a change once implementation is complete.

When adding a non-trivial feature, prefer creating an OpenSpec change (via `/opsx:propose` or the `openspec` CLI directly) before writing implementation code, rather than editing source ad hoc. `openspec status --change "<name>" --json` reports which artifacts are required and their dependency order. Per the user's own plan, changes are partitioned by scope/area (e.g. frontend changes first, then backend) rather than one giant change — keep proposing changes at that granularity.

**`openspec/` and local Claude Code config are local-only tooling — never committed.** They're planning scaffolding for the person working on the machine, not project source. `.gitignore` excludes `/openspec` and `/.claude/*` (except `.claude/rules/`, once that directory exists — team-shared, path-scoped conventions belong in git even though the rest of `.claude/` doesn't).

## Target stack

**`apps/web`** — actual routes/queries/forms/screens still need to be built on top of these, per the conventions below:

| Concern               | Library                                                                |
| ---------------------- | ----------------------------------------------------------------------- |
| Routing                | `react-router-dom` (v7)                                                |
| Server state           | `@tanstack/react-query`                                                |
| Forms                  | `react-hook-form` + `zod`                                              |
| Styling                | TailwindCSS **v3** (LTS — do not upgrade to v4 without an explicit decision to do so) |
| HTTP                   | `axios`                                                                |
| Toasts/notifications   | `react-toastify`                                                       |
| Testing                | Cypress component testing — see Testing conventions                    |
| Auth/session           | Implemented — token in response body + `sessionStorage`, see "Reconciling with the academic spec" above and Auth & state below |

Tailwind config lives in `apps/web/tailwind.config.js` (`content` already points at `index.html` + `src/**/*.{js,ts,jsx,tsx}`) and `apps/web/postcss.config.js`; global directives (`@tailwind base/components/utilities`) live in `apps/web/src/index.css`.

**`apps/api`** — infrastructure plus the auth domain feature; further domain features still to come:

| Concern               | Library                                                                |
| ---------------------- | ----------------------------------------------------------------------- |
| Language               | TypeScript, ES Modules — deviates from DOC-04 §1's "JavaScript", see "Reconciling with the academic spec" above. Runs natively on Node via type-stripping, no bundler |
| HTTP framework         | Express (v5)                                                           |
| Security headers       | `helmet`                                                                |
| CORS                   | `cors`, restricted to the configured `APP_ORIGIN`                       |
| Database               | SQLite, local file, via Node's built-in `node:sqlite` — plain SQL, no ORM/query builder (deliberate choice, see design notes in the archived `api-bootstrap` OpenSpec change) |

## Local database (SQLite)

`apps/api/scripts/setup-db.ts` creates the local SQLite database file (default `apps/api/data/app.db`, overridable via the `DB_PATH` env var) using Node's built-in `node:sqlite` module (`DatabaseSync`) — no extra dependency, no native build step. It's wired as `postinstall` in `apps/api/package.json`, so it runs automatically whenever `yarn install` runs at the repo root, and is also runnable manually via `yarn workspace @auto-agenda-cnh/api db:setup`. It's idempotent — safe to re-run, never wipes existing data.

`apps/api/data/*.db` (and its WAL/SHM sidecar files) are gitignored — this is a local, per-machine file, not something committed to the repo. Anyone cloning the repo gets a fresh empty database on their first `yarn install`.

**`apps/web` never owns or touches this file** — it belongs entirely to `apps/api` (see DOC-09 §1: the browser/frontend never accesses the database directly). This is a deliberate migration: `apps/web` briefly owned the SQLite setup script before a backend existed; that ownership moved to `apps/api` once it was bootstrapped, and shouldn't move back.

**Requires Node ≥ 22.5** (`node:sqlite` availability) — declared in `apps/api/package.json`'s `engines` field.

## Architecture: backend

`apps/api` is a Node.js/Express server living in the same repo as the frontend (see Repository structure above — **monorepo, not a separate-service split**), matching DOC-09 §1's architecture (React client, REST API, database — the browser never talks to the database directly).

What exists so far (see `docs/04_Especificacao_BackEnd_API.md` §2 for the fuller aspirational layout this follows):

- `src/config/env.ts` — reads and validates required env vars (`NODE_ENV`, `PORT`, `APP_ORIGIN`; `DB_PATH` optional), fails fast (process exits) if any required var is missing or invalid (BE-013).
- `src/database/connection.ts` — opens the SQLite connection (see Local database above).
- `src/database/migrations/*.sql` — plain numbered SQL migrations (`0001_create_user.sql`, `0002_create_session.sql`, `0003_create_license_category.sql`, `0004_create_student.sql`, `0005_create_vehicle.sql`, `0006_create_instructor.sql`, `0007_create_appointment.sql`, `0008_create_password_reset_token.sql` so far), applied in filename order by `scripts/migrate.ts`, which tracks what's already applied in a `_migrations` bookkeeping table it creates itself. Not a migration framework — a small custom runner, consistent with the "plain SQL, no ORM" stance below.
- `scripts/setup-db.ts` — wires the migration runner and the demo-data seed (`scripts/seed.ts`: one demo user, five demo students) together after opening the DB connection; this is what `postinstall`/`db:setup` actually runs (see Local database above).
- `src/app.ts` — the Express app: `helmet`, `cors` (restricted to `APP_ORIGIN`), JSON body parsing, health routes, auth routes, 404 handler, centralized error handler.
- `src/http/routes/healthRoutes.ts` — `GET /health` (liveness) and `GET /health/db` (readiness, checks the SQLite connection).
- `src/http/routes/authRoutes.ts` + `src/http/controllers/authController.ts` — `POST /auth/login`, `POST /auth/logout` and `GET /me` (the latter two behind `requireAuth`), plus `POST /auth/forgot-password` and `POST /auth/reset-password` (both public — a user resetting a forgotten password isn't logged in). Backed by `src/modules/auth/authService.ts` (login/logout use-cases, the 7-day `SESSION_TTL_SECONDS` constant, the 30-minute `RESET_TOKEN_TTL_SECONDS` constant, SEG-005's single generic failure message for both wrong-password and no-such-user — reused for `forgot-password`'s always-identical response regardless of whether the email exists) and `src/repositories/{userRepository,sessionRepository,passwordResetTokenRepository}.ts` (plain SQL, no ORM). This project has no email-sending integration, so `requestPasswordReset` "sends" the reset link by logging it to the API server's console instead — a deliberate mock, not a stub to fill in later (see the archived `auth-password-reset` change's `design.md`). A successful `resetPassword` also calls `sessionRepository.deleteAllForUser`, invalidating every existing session for that user.
- `src/http/routes/studentRoutes.ts` + `src/http/controllers/studentController.ts` — `GET/POST /students`, `GET/PATCH /students/:id`, `POST /students/:id/deactivate`, and `GET /license-categories` (all behind `requireAuth` + `requireRole('ADMIN')`). Backed by `src/modules/students/studentService.ts` (pagination/filtering envelope, document-uniqueness conflict handling, category validation) and `src/repositories/{studentRepository,licenseCategoryRepository}.ts`. Students are inactivated, never deleted (`docs/05` §5) — there's no `DELETE /students/:id`.
- `src/http/routes/vehicleRoutes.ts` + `src/http/controllers/vehicleController.ts` — `GET/POST /vehicles`, `GET/PATCH /vehicles/:id` (all behind `requireAuth` + `requireRole('ADMIN')`; reuses the `GET /license-categories` route already registered by `studentRoutes.ts` rather than duplicating it). Backed by `src/modules/vehicles/vehicleService.ts` and `src/repositories/vehicleRepository.ts`. Unlike students, `status` (`ACTIVE`/`MAINTENANCE`/`INACTIVE`) is edited directly via `PATCH /vehicles/:id` — there's no dedicated deactivate endpoint, matching `docs/04` §5's actual endpoint list and the three-way (not binary) status lifecycle.
- `src/http/routes/instructorRoutes.ts` + `src/http/controllers/instructorController.ts` — `GET/POST /instructors`, `GET/PATCH /instructors/:id` (all behind `requireAuth` + `requireRole('ADMIN')`, same no-dedicated-deactivate reasoning as vehicles). Backed by `src/modules/instructors/instructorService.ts` and `src/repositories/instructorRepository.ts` (its `findMany`/`findById` `JOIN user` for the linked login `email`, read-only). Registering an instructor is the project's first cross-table write: `instructorService.register` receives the raw `db` handle alongside `userRepository`/`instructorRepository` and wraps a `user` insert (`role = 'INSTRUCTOR'`, Admin-set initial password) and the `instructor` insert in an explicit `db.exec('BEGIN'/'COMMIT'/'ROLLBACK')` transaction — a deliberate deviation from the pure repository-only service pattern `studentService`/`vehicleService` use, justified by needing atomicity a single repository call can't provide. `PATCH /instructors/:id` only ever touches profile fields (`full_name`/`document`/`credential_number`/`phone`/`status`) — `email`/password are silently ignored if present in the body, since no endpoint anywhere in this project changes login credentials yet.
- `src/http/middlewares/requireAuth.ts` — reads `Authorization: Bearer <token>`, validates the session (including expiry) and attaches the user to `req.user` via Express `Request` type augmentation (declaration merging, same pattern `apps/web` uses for Cypress's `cy.mount` typing).
- `src/http/middlewares/requireRole.ts` — takes a list of allowed roles, reads `req.user.role` (set by `requireAuth`, which must run first), throws `403 FORBIDDEN` if it doesn't match. Composed after `requireAuth` per route (e.g. `requireAuth(...), requireRole('ADMIN')`); the first per-resource permission check the project needed, added with the `student-management` change.
- `src/shared/ApiError.ts` — a small `Error` subclass (`status`/`code`/`expose`) thrown by services/middlewares for expected failure cases (e.g. `401 AUTHENTICATION_REQUIRED`); `errorHandler` already read these fields generically since the `api-bootstrap` change, this is its first concrete producer.
- `src/http/middlewares/errorHandler.ts` and `notFoundHandler.ts` — both respond with the `docs/04` §6.3 error envelope (`code`, `message`, optional `fieldErrors`, `correlationId`), never leaking stack traces (SEG-013). Unused Express handler params (e.g. `next` in an error handler) are prefixed `_` rather than dropped — Express detects middleware type by parameter *count*, so all 4 params must stay declared on an error handler even when unused.
- `src/http/routes/appointmentRoutes.ts` + `src/http/controllers/appointmentController.ts` — `GET /availability/slots` and `POST /appointments` stay behind `requireAuth` + `requireRole('ADMIN')` **narrowed from `docs/04` §5's "Aluno/Admin"/"Por perfil"**, since no student in this project ever gets a login account, so only Admin can actually reach these two routes. `GET /appointments` behind `requireAuth` + `requireRole('ADMIN', 'INSTRUCTOR')` — the one route that actually implements "Por perfil": Admin sees every appointment, an Instructor sees only their own, scoped server-side inside `appointmentService.list` (which resolves the caller's own `instructor.id` via `instructorRepository.findByUserId(req.user.id)` when `role === 'INSTRUCTOR'`, returning an empty list rather than erroring if no linked instructor is found). Every `GET /appointments` response — for either role — includes `student_full_name`/`instructor_full_name`/`vehicle_plate` resolved via a `JOIN` in `appointmentRepository`, since an Instructor has no access to `/students`/`/vehicles` (both still Admin-only) to resolve those names any other way. Backed by `src/modules/appointments/appointmentService.ts` — the scheduling algorithm, deliberately scoped down from `docs/04` §8's full 10-step version per the "Academic scope & delivery philosophy" above: `BUSINESS_HOURS_START/END_HOUR`, `DEFAULT_DURATION_MINUTES`, `MIN_ADVANCE_MINUTES`, `SLOT_STEP_MINUTES`, `MAX_SLOTS_RETURNED`, and `MAX_SEARCH_RANGE_DAYS` are hardcoded constants in that file standing in for a `system_setting` table this project doesn't have; instructor weekly-availability windows, instructor blocks, per-instructor category authorization, and per-vehicle unavailability windows are likewise not modeled (every `ACTIVE` instructor is treated as always available and authorized for every category; `vehicle.status = 'MAINTENANCE'` is the only unavailability mechanism relied on). `searchSlots` generates candidate times and resolves the first available instructor+vehicle pair per candidate; `book` re-validates everything and wraps the overlap check + insert in a synchronous (no `await`) `db.exec('BEGIN'/'COMMIT'/'ROLLBACK')` transaction — Node's single-threaded event loop, not a DB-level lock, is what makes that safe against concurrent requests here. No lifecycle actions (reschedule/cancel/confirm/attendance/complete/not-performed) exist yet — every appointment stays in `AGENDADA`. **Overlap-check gotcha already hit once**: `appointmentRepository.ts`'s per-resource overlap query binds `(resourceId, startAt, endAt)` in that exact order — swapping `startAt`/`endAt` silently inverts the whole conflict check (an identical double-booking would succeed instead of being rejected) with no type error to catch it; caught only by manually testing "book the same slot twice" during this change's own verification.
- `src/modules/` holds one subfolder per domain area (`auth/`, `students/`, `vehicles/`, `instructors/`, `appointments/` so far); further domain features add their own.
- **`node:sqlite` doesn't enforce declared `REFERENCES`/foreign-key constraints** (`PRAGMA foreign_keys` isn't turned on) — a service that inserts/updates a row with a foreign key column (e.g. `student.category_id`) must validate the referenced id exists itself (see `studentService.ts`'s `assertCategoryExists`), rather than relying on the database to reject an invalid reference.
- `src/server.ts` is the actual entrypoint: loads env, opens the DB connection, builds the app, starts listening.
- Relative imports between `.ts` files use the literal `.ts` extension (e.g. `import { loadEnv } from './config/env.ts'`) — required by Node's native type-stripping, which resolves the real file on disk (unlike the `tsc`/bundler convention of writing `.js` for a `.ts` source). `tsconfig.json` sets `allowImportingTsExtensions` + `noEmit` to match: no bundler, `tsc --noEmit` (`yarn build`) is a type-check-only CI gate, same split `apps/web` uses between type-checking and actual bundling.

Not built yet — don't assume any of this exists until it lands in its own change:
- No endpoints beyond auth, students, vehicles, instructors, and appointment booking/search (reschedule/cancel/confirm/attendance/complete/not-performed, settings, audit-event querying, dashboard, reports, and instructors' own `availability`/`blocks` sub-resources) — `docs/04` §5's full endpoint list, one focused change at a time, and several of these deliberately mocked/deferred per the "Academic scope & delivery philosophy" above rather than planned as upcoming work.
- No CSRF protection, login rate-limiting, account lockout, or email verification — all explicitly deferred (see the archived `auth-api` change's `design.md`), not oversights.

## Front-end conventions and design consistency

DOC-03 (which would otherwise define front-end routes, screens, and component conventions) was never supplied — see "Reconciling with the academic spec" above. This project owns those decisions itself, which makes visual/structural consistency a standing responsibility, not something a spec document enforces for us:

- **Before building or substantially changing any screen/component, consult the project's front-end best-practices skills** (`vercel-react-best-practices` for React/Next.js performance and correctness patterns, `vercel-composition-patterns` for component composition/API design) — load them via the Skill tool rather than guessing at conventions from scratch.
- **Keep one consistent design language across every screen**: the same color palette, typography scale, spacing scale, and button/input styles everywhere — a page should never look like it was styled by a different rule set than the one next to it. See Styling conventions below for the concrete Tailwind rules this implies (no arbitrary values, no per-page one-off tokens).
- **Componentize instead of duplicating markup** across pages — if the same visual pattern shows up on a second screen, it becomes a shared component (see Architecture: component structure below), not a copy-pasted block with minor tweaks.
- Route structure, URL parameters, query strings, and navigation patterns follow standard React Router best practices (see Naming conventions' "Route path segments" below for the language/casing convention specifically) — again, project-owned, not spec-derived.

## Environment variables

Required variables are declared in each package's own `.env.example` (committed) — copy it to that package's `.env` (gitignored, never committed) and fill in real values. Vite only exposes vars prefixed `VITE_` to client code; `apps/api` (Node-side) reads any env var directly and fails fast at startup if a required one is missing/invalid (see Architecture: backend above).

- `apps/web` currently requires `VITE_API_BASE_URL` (the base URL of `apps/api`, consumed by the axios instance in `apps/web/src/Apis/api.ts`) — its first required variable, added alongside the auth integration.
- `apps/api` currently requires `NODE_ENV`, `PORT`, `APP_ORIGIN`; `DB_PATH` is optional (defaults to `data/app.db`).

**Whenever a new required env var is introduced, add it to the relevant package's `.env.example` (with an empty/placeholder value, never a real secret) in the same change**, and update the table in [README.md](README.md#configuração) — that's what a new setup follows, not this file.

## Keeping README.md current

`README.md` is the project's market-facing setup doc — what someone installing/running this project for the first time reads, not what an AI agent reads. **Whenever a change is significant enough to affect how the project is set up, run, or understood from the outside** — a new required dependency, a new env var, a new script, a changed command, a new external service being integrated (database, API, auth provider) — update `README.md` in the same change, following normal market conventions for what a README documents (stack, prerequisites, setup steps, env vars, available scripts). Remove sections that stop being accurate rather than letting them go stale. This file (`CLAUDE.md`) covers *how to work in the codebase*; `README.md` covers *what the project is and how to run it* — keep the update in the right one (often both).

## Architecture: component structure (Atomic Design)

```
apps/web/src/components/
  Atoms/       # primitives: Button, Input, Select, Modal, Status, etc.
  Molecules/   # form groups and composed widgets
  Templates/   # page layouts, only when reused by more than one Page
  Pages/       # thin wrappers — or the logic itself, when there's no Template
```

**Only create a Template when it's actually reused by more than one Page.** For a page that only one route will ever render, skip the Template entirely: put the markup directly in `apps/web/src/components/Pages/<Name>/index.tsx` with a co-located `use<Name>.ts` hook holding the logic — same shape as `use[Template]`, just one level up.

When a Template does exist, it delegates to a `use[Template]` hook (e.g. `useDashboardTemplate`) co-located in the same directory.

**Reuse-first applies to Molecules too**: before building a new form/group inside a Page or Template, check whether an existing Molecule already covers it, rather than rebuilding fields from scratch.

**Never delete a prior version's files when a new version replaces it.** Stop referencing the old version (swap routes/imports to the new one) and leave the old files in the repo — don't "clean up" by deleting them.

## Naming conventions

- **Component/Page/Template folders and exports**: `PascalCase`, always English — even when the feature/route it renders is Portuguese-named.
- **Hooks**: `camelCase`, `use`-prefixed, English (e.g. `useDashboard.ts`, `useUserProfile.ts`).
- **Test files**: `camelCase` version of the component name + `.test.tsx`, English (e.g. `button.test.tsx` for `Button`) — lowercase first letter even though the component itself is `PascalCase`. Test *descriptions* inside are Portuguese (see Testing conventions).
- **Utility functions** (`src/utils/`): `camelCase`, English, verb-first (e.g. `formatDate`, `removeEmpty`) — even when the noun they operate on is a Portuguese domain term.
- **Constants files** (`src/constants/`): `snake_case`, named in Portuguese when they hold a Portuguese business/domain concept (e.g. `tipo_veiculo.ts`, `categoria_cnh.ts`) — these mirror backend/domain vocabulary (see `docs/05_Banco_de_Dados_Dicionario.md` for the canonical entity/field names), don't translate them to English.
- **Route path segments**: `kebab-case`, Portuguese, matching end-user-facing language (e.g. `/agendar-aula`, `/minha-agenda`) — this is the one place Portuguese is expected even though the component rendering it has an English name.

The pattern in short: **structural/generic programming vocabulary (component names, hook verbs, folder roles) stays English; end-user-facing or business-domain vocabulary (routes, UI copy, domain enums/constants) stays Portuguese**, matching whatever the backend/product already calls it. When adding a new file, check an existing sibling of the same kind first and match its casing and language — don't introduce a third convention.

**Only suffix a name with `V2` when an actual `V1` counterpart already exists** — a component/page/hook this one is explicitly replacing or running alongside. If you're creating something brand new that never had a prior version, it gets a plain name, even if consumed by something already suffixed `V2`. The suffix signals "there's an older version of this specific thing," not "this belongs to a relayout effort."

**Name conditional values instead of inlining them.** Wherever a condition's meaning isn't obvious from the expression itself (e.g. picking a `navigate()` target, an API param, a class name), compute it into a semantically-named variable first, then use that variable — don't pass a bare ternary/inline expression:

```ts
// Not this:
navigate(isAdmin ? "/a" : "/b");

// This:
const destino = isAdmin ? "/admin/painel" : "/inicio";
navigate(destino);
```

## Data & server state

`apps/api` now has real endpoints to call (auth so far — see Architecture: backend above); services live in `apps/web/src/services/` as static-method classes (e.g. `AuthService`), calling through the shared axios instance in `apps/web/src/Apis/api.ts` (driven by the `VITE_API_BASE_URL` env var).

**Every request — query or mutation — goes through a React Query hook.** Never call a service method directly from a component or page-level hook, and never reach for a raw `useEffect` + `useState` fetch, even for a one-off call. Service-backed query hooks live in `apps/web/src/hooks/queries/<domain>/use<Name>/`, one folder per domain — kept separate from component/template hooks (`use[Template]`), which stay co-located with the component.

Query hooks have a single responsibility: fetch and return the raw service response. They must not shape/map data for a specific consumer (e.g. formatting into `{ value, label }` select options) — that mapping belongs in the page/component-level hook that calls them.

- **Reactive fetch** (component subscribes to loading/data/error): use `useQuery` directly.
- **Imperative/on-demand fetch** (e.g. a `loadOptions` callback triggered per keystroke): call `useQueryClient().fetchQuery(...)` inside the hook instead, so it still shares the query cache without forcing a component-level subscription.

**Error toast lives in the query/mutation hook, not in whatever page calls it.** Every consumer of a given query/mutation wants the same generic failure toast — centralize it in the hook (`onError` for mutations; a `useEffect` watching `isError` for queries, since `useQuery` has no hook-level `onError`). A caller can still pass its own page-specific `onError` at call time for extra follow-up — both fire, hook-level first.

The error response shape follows `docs/04_Especificacao_BackEnd_API.md` §6.3 (`code`, `message`, optional `fieldErrors`, `correlationId`) — this is already what `apps/api`'s error/404 middleware returns, confirmed working. Destructure it directly in the catch/error callback rather than reading it via optional chaining on a loosely-typed `error`; a malformed error response is itself worth surfacing, not silently swallowed behind `undefined`.

**Paginated listings should default to a single, centralized page size constant**: `DEFAULT_PAGE_SIZE` (currently `10`) in `apps/web/src/constants/pagination.ts`, matching `BE-009`/`RN-027` (listings are paginated and filterable) — picked when Admin > Alunos became the first paginated listing (`student-management` change); reuse this constant rather than introducing a new page-size value per screen.

## Auth & state

Per "Reconciling with the academic spec" above, this project deliberately deviates from **SEG-002 (DOC-07)**: session state is a token returned in the login response body, stored client-side in `sessionStorage` — not an HttpOnly cookie. This is now implemented (`apps/api`'s auth endpoints, `apps/web`'s `Login` page — see Architecture: backend above):

- On successful login, the returned session token is stored in `sessionStorage` (`apps/web/src/utils/sessionToken.ts` — never `localStorage`, it should not outlive the browser session) and attached to subsequent API requests via an `Authorization: Bearer` header (an axios request interceptor in `apps/web/src/Apis/api.ts`, not repeated per-call boilerplate).
- A response interceptor in the same file reacts to 401s (see `docs/04_Especificacao_BackEnd_API.md` §7) by clearing the stored token and redirecting to `/login`.
- For non-auth client state that only needs to survive one flow/session and doesn't need to survive a page reload, prefer an in-memory React Context over any Web Storage.
- **Centralize role/permission checks in one hook** (e.g. `useUserPermissions.ts` exposing `hasRole`, `isAdmin`, `hasPermission`, etc., mirroring the profile matrix in `docs/07_Seguranca_Privacidade_Auditoria.md` §3) instead of re-deriving the same check inline in every component that needs it — not built yet, the `Login` page currently does one inline role→route lookup for its own post-login redirect; build the shared hook once a second consumer needs role/permission checks rather than extracting it speculatively now. Search for an existing hook/util before writing a fresh inline check for any repeated concern (permissions, formatting, validation).
- For data that needs to survive across steps of a multi-step flow (e.g. the scheduling wizard), prefer a React Context whose `Provider` wraps only the relevant route subtree — never an app-wide provider that stays mounted across unrelated areas. Context state lives only in memory, so it never touches disk.
- If a storage hook is ever added and named `useSessionStorage`/`useLocalStorage`, it must actually wrap the storage type its name says — a mismatch is a bug worth fixing at the source, not a pattern to replicate.

## Sensitive data (LGPD)

This app handles personal data regulated by Brazil's LGPD (Lei Geral de Proteção de Dados) — student/instructor name, CPF-equivalent document, email, phone, and vehicle data (see `docs/05_Banco_de_Dados_Dicionario.md` for the exact fields) and DOC-07's privacy/security requirements more broadly. Keep this in mind whenever a task touches user data, not just when it's called out explicitly.

- **Never persist personal/sensitive data client-side** — not in `sessionStorage`, not in `localStorage` (which shouldn't be used for anything, see Auth & state), not even transiently beyond what a single render cycle needs. The session token itself (an opaque identifier, not personal data) is the one deliberate exception — see Auth & state above for why this project stores it in `sessionStorage` instead of an HttpOnly cookie.
- If a flow genuinely needs an identifier to survive across steps (e.g. a selected student's UUID between wizard steps), an opaque ID in `sessionStorage` — removed immediately once consumed — is an acceptable, narrow exception, same reasoning as the session token above. Full personal-data objects are not; use a scoped React Context (see Auth & state) for those instead.
- **Don't log full personal-data payloads** to `console.*` or any external service — pass status codes or generic messages, not raw sensitive fields (SEG-012).
- Mask document/contact fields in listings when the full value isn't needed for the task at hand (DOC-07 §4).
- If you spot personal data already sitting somewhere it shouldn't (e.g. `localStorage`), flag it to the user rather than silently rewriting unrelated code.
- No event/analytics tracking utility is used in this project — don't add one unless the user explicitly asks for it.

## Figma workflow

If this project gets a Figma MCP server configured, treat it as a **hard gate, not a best-effort step** before implementing any layout/component work referencing a Figma design:

1. Try to reach the MCP first — read the real node tree, styles, spacing, and assets instead of guessing from a screenshot or verbal description.
2. If it's unreachable, **stop before writing implementation code.** Tell the user exactly what failed, then ask via `AskUserQuestion` whether to proceed without it.
3. **Do not proceed without Figma access unless the user explicitly says yes** — every time this comes up, even if a prior session already agreed to proceed without it once.
4. If the user declines, wait — don't fall back to building from memory/description alone.

Never reference images via remote URLs (Figma URLs, CDN links). Export assets locally first: raster images into `apps/web/public/assets/img/`, vector icons/logos into `apps/web/public/assets/svg/` (prefer SVG whenever the node supports it).

## Styling conventions

- **TailwindCSS-first**: prefer utility classes over hand-rolled CSS/styled-components. Only reach for something else when it genuinely can't be expressed in Tailwind (complex keyframe animations, 3rd-party component style overrides).
- **Avoid arbitrary-value classes (`[...]`) as much as possible — spacing, margin, sizing, colors, anything with a Tailwind-predefined scale.** Don't write `bg-[#8ac9bc]`, `gap-[15px]`, `p-[14px]`, `text-[#333]`, etc. Use only what's already predefined in the Tailwind scale/theme (`gap-4`, `p-3.5`, `bg-slate-600`, ...). If a design measurement or color doesn't land exactly on the scale, round to the nearest predefined value rather than reaching for an arbitrary-value class to match it pixel/hex-perfect. If a color genuinely isn't covered by the default palette (e.g. the semantic colors DOC-06 §4 calls for — primária azul, sucesso verde, alerta âmbar, erro vermelho), add it as a named token in `apps/web/tailwind.config.js` (theme extension) instead of inlining a one-off arbitrary hex — that keeps it reusable and named instead of a magic value scattered across files, and is exactly the mechanism that makes "Front-end conventions and design consistency" above achievable in practice. Treat arbitrary-value classes as a last resort for something that truly cannot be expressed any other way, not a convenience.
- **Don't bake placement/spacing concerns into shared component variants.** Things like `text-center`, `margin-*`, or `mb-*` are call-site decisions, not properties of the component itself — a shared `Typography`/heading variant should own what's intrinsic to that style (size, weight, line height, color), not how it's positioned wherever it's dropped. Add placement classes at the call site (they merge with the variant's own classes), don't add a prop/variant for it.
- **Build mobile-first** — DOC-01 §5 and RNF-005 both call out responsiveness as MVP-required (320–1440 px). Unprefixed classes are the mobile layout; add `sm:`/`md:`/`lg:` to progressively enhance. Don't ship desktop measurements unprefixed and call it done — make a deliberate mobile layout (stack multi-column content, let fixed-width elements shrink).
- Follow DOC-06 §4/§5 for the concrete design-system requirements this maps onto: minimum 16px base font, 4px spacing scale (4/8/12/16/24/32/48), 8–12px border radius, 44×44px minimum touch targets, and WCAG 2.2 AA contrast — encode these as Tailwind theme tokens rather than re-deriving them per component.
- **Combine/conditionally apply classes with `mergeClassNames` (`apps/web/src/utils/mergeClassNames.ts`, a `clsx` + `tailwind-merge` wrapper) — never with a template literal.** Don't write `` `base-classes ${condition ? 'a' : 'b'}` `` or `` `${className}` ``; write `mergeClassNames('base-classes', condition && 'a', className)` instead. A template literal can't resolve conflicting Tailwind utilities (e.g. a caller passing `p-2` to override a component's own `p-4` leaves both classes in the string, and whichever CSS rule happens to be defined later in the stylesheet wins — not the one the caller intended); `tailwind-merge` resolves that conflict correctly by dropping the earlier, overridden utility. This applies everywhere a class list is assembled dynamically: component `className` props merging with a caller-supplied `className`, and conditional classes like React Router's `NavLink` active-state styling.

## Forms

Use `react-hook-form` + `zod` for all forms. If the project ends up needing both RHF-controlled and generic uncontrolled/manually-controlled inputs, keep the two variants in separate folders (e.g. `Atoms/InputsRHF/` vs `Atoms/Inputs/`) rather than mixing both concerns into one component.

## Testing conventions

**Every new component and page needs a test, written in the same pass it's created, not as a follow-up.** This has been skipped more than once already — treat it as a hard rule, not a nice-to-have: a component/page PR-equivalent isn't done until its test exists alongside it.

- **Unit/integration tests use Cypress component testing** (`cypress`, configured in `apps/web/cypress.config.ts`) — **not** Vitest/Jest/React Testing Library, a deliberate deviation from `docs/08_Plano_de_Testes_Qualidade.md` §2's suggested "Vitest/Jest" + "React Testing Library + Vitest" tooling for the unit/component rows of the test pyramid (E2E in that same table still points to Cypress/Playwright, which lines up). Record this the same way as the other academic-spec deviations if it ever needs revisiting.
- Tests live in a `__tests__/` folder inside the component's own directory, not loose next to `index.tsx` (e.g. `Button/__tests__/button.cy.tsx` for `Button/index.tsx`) — filename is the `camelCase` version of the component name + `.cy.tsx` (Cypress's own convention, not `.test.tsx`).
- Mount components via the custom `cy.mount` command (`apps/web/cypress/support/component.tsx`), which already wraps every mount in the app's real provider tree (`QueryClientProvider`, `MemoryRouter`) — don't reach for a raw `mount()` from `cypress/react` directly, and don't re-wrap providers per test.
- **One behavior per test** — avoid asserting multiple unrelated things in a single `it()` block. Test descriptions are written in Portuguese (e.g. `it('Deve renderizar...')`), matching UI copy language, even though component/prop names stay in English.
- For presentational logic that doesn't need React state, prefer a small pure function file (e.g. `formatCurrency.ts`) co-located with the component instead of a `use*` hook — it's trivially unit-testable in isolation and keeps `index.tsx` focused on rendering.
- `docs/08_Plano_de_Testes_Qualidade.md` has the fuller test plan (test pyramid, minimum test cases TST-001…TST-025, required E2E scripts) — consult it as more testing infrastructure (backend integration, E2E) gets set up.
- Run tests with `yarn --cwd apps/web test` (headless, CI-style) or `yarn --cwd apps/web test:open` (interactive runner).

**Known environment caveat**: in this sandboxed dev environment, `cypress install`'s binary download appears to resolve to the wrong artifact — the extracted `Cypress` executable turns out to be a plain Node.js binary instead of the real Electron-based Cypress app (confirmed by running it with `--help`, which prints Node's own CLI help instead of Cypress's), so `cypress run`/`cypress open` fail with cryptic "bad option: --no-sandbox" errors. This is a network/download restriction in this specific sandbox, not a config or code problem — tests are still written correctly and should run normally in an unrestricted environment (the user's own machine, CI). If this comes up again, tell the user rather than trying to work around it blindly, and suggest re-running `npx cypress install --force` outside the sandbox.

## Browser verification

For visual/manual verification of UI changes, use **`agent-browser`** (https://github.com/vercel-labs/agent-browser) if installed globally (`npm i -g agent-browser && agent-browser install`) — start with `agent-browser skills get core --full` for the command reference. Prefer it over Playwright for this kind of exploratory/visual check.

**Known environment caveat**: some sandboxed dev environments are missing system libraries the underlying Chrome binary needs (`libnss3`, `libnspr4`, etc.) with no root access to install them. If launching fails with a "shared libraries" error, that's an environment limitation, not a tool problem — tell the user and ask them to run the suggested `apt-get install ...` command in their own terminal, then try again.
