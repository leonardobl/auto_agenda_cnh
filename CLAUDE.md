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

## Project state

This is a Yarn workspaces monorepo for **AutoAgenda**. `apps/web` (Vite + React 19 + TypeScript + TailwindCSS) is the only implemented package — the default Vite template markup/CSS/assets have been removed; `apps/web/src/App.tsx` currently only renders placeholder text, no real application features/routes/screens have been built yet. `apps/api` (backend) and `packages/contracts` (shared schemas/types) exist as empty placeholders — see Architecture: backend (planned) below. The sections below define the target architecture/conventions to build *toward* as real features land.

## Repository structure

```
apps/web/            # React/Vite frontend — implemented, see Target stack
apps/api/             # Node.js backend — placeholder only, not built yet
packages/contracts/   # Shared schemas/types between web and api — placeholder only
docs/                 # Academic specification set (DOC-00…DOC-10) — source of truth, see docs/README.md
infra/                # Docker/deployment config — placeholder, not built yet
openspec/             # Local-only planning tooling (gitignored, see Spec-driven workflow below)
```

Root `package.json` only declares the Yarn workspaces (`apps/*`, `packages/*`) — it has no scripts of its own. Run a package's scripts either with `yarn workspace <package-name> <script>` (e.g. `yarn workspace @auto-agenda-cnh/web dev`) or `yarn --cwd apps/web <script>` from the repo root. **Unless stated otherwise, every relative path mentioned elsewhere in this file (`src/`, `scripts/`, `data/`, `package.json`, `tsconfig*.json`, `tailwind.config.js`, etc.) is relative to `apps/web/`**, since that's the only implemented package so far — once `apps/api` is built, its own paths will be called out explicitly as `apps/api/...`.

## Reconciling with the academic spec

`docs/` (see Precedence above) is the academic specification set this project must satisfy for Projeto Integrador II. Two places where the actual implementation deliberately deviates from what those documents prescribe — **both pending confirmation with the professor per DOC-10 §8**, so they may change:

- **Database: local SQLite, not PostgreSQL.** DOC-04 §1, DOC-05 §1, and DOC-09 §4/§7 all specify PostgreSQL. This project keeps the already-working local SQLite setup (`node:sqlite`, see Local database below) instead. If/when this gets confirmed to need to change, treat it as a real migration (schema, queries, `DATABASE_URL`), not a config toggle.
- **Auth/session: HttpOnly cookie, not client-readable storage.** SEG-002 (DOC-07 §2) requires session state in an HttpOnly cookie and explicitly forbids an access token in `localStorage`. This supersedes an earlier project agreement to use `sessionStorage` for the auth token — that agreement is retired. See Auth & state below for what actually applies now. No backend exists yet, so this is the target for when auth is built, not a description of working code.
- **DOC-03 (front-end specification) was never supplied.** Routes, screens, and component conventions are therefore owned by this project itself rather than derived from that document — see Architecture: component structure and the front-end best-practices mandate below. Details in `docs/README.md`.

Everything else in `docs/` (business rules, data dictionary shape, security requirements beyond SEG-002, test plan, etc.) is still the target to build toward — these two items are the only recorded deviations.

## Commands

```bash
yarn install                          # from repo root — installs every workspace package + runs apps/web's postinstall (SQLite setup)
yarn workspace @auto-agenda-cnh/web dev       # start Vite dev server
yarn workspace @auto-agenda-cnh/web build     # tsc -b (project references) then vite build
yarn workspace @auto-agenda-cnh/web lint      # eslint .
yarn workspace @auto-agenda-cnh/web preview   # preview a production build
yarn workspace @auto-agenda-cnh/web db:setup  # (re-)create the local SQLite file, idempotent
```

Equivalently, `yarn --cwd apps/web <script>` works the same way and is shorter to type.

No test runner is configured yet. When adding one, prefer **Vitest** (Vite-native, and the natural fit for `apps/web`'s build tool — see Testing conventions below).

This project uses `yarn` (root `yarn.lock`, not npm/pnpm).

## TypeScript / build setup

- `apps/web/tsconfig.json` is a references-only root pointing at `tsconfig.app.json` (src) and `tsconfig.node.json` (Vite config). The build script type-checks via `tsc -b` across both before bundling.
- `apps/web/tsconfig.app.json` targets `es2023`, uses bundler module resolution, and enables `verbatimModuleSyntax`, `noUnusedLocals`/`noUnusedParameters`, and `erasableSyntaxOnly` — write type-only imports as `import type { ... }` and avoid TS syntax that requires emit-time transformation (e.g. enums, parameter properties).
- `noEmit` is set; `@vitejs/plugin-react` handles transpilation, `tsc` is type-checking only.

## Git commits

A global slash command, `/git-commit`, is available (defined in `~/.claude/commands/git-commit.md`, works in any repo). When the user runs it: inspect `git status`/`git diff`/`git log` to learn this repo's real commit style, stage only the relevant changes, and create a single semantic commit with an English message matching that style. It never pushes — it always stops right after the local commit so the user can review and push themselves.

## Spec-driven workflow (OpenSpec)

This repo uses the `openspec` CLI plus the bundled `opsx` slash commands for a propose → apply → archive workflow, configured via `openspec/config.yaml` at the repo root (unaffected by the monorepo layout — it plans changes across any package):

- `/opsx:propose` — describe a feature/fix, generates `proposal.md`, `design.md`, `tasks.md` for a new change (kebab-case name) under the OpenSpec planning home.
- `/opsx:explore` — open-ended thinking/investigation mode before or during a change, no artifacts required.
- `/opsx:apply` — implement the tasks from an existing change's `tasks.md`.
- `/opsx:archive` — finalize and archive a change once implementation is complete.

When adding a non-trivial feature, prefer creating an OpenSpec change (via `/opsx:propose` or the `openspec` CLI directly) before writing implementation code, rather than editing source ad hoc. `openspec status --change "<name>" --json` reports which artifacts are required and their dependency order. Per the user's own plan, changes are partitioned by scope/area (e.g. frontend changes first, then backend) rather than one giant change — keep proposing changes at that granularity.

**`openspec/` and local Claude Code config are local-only tooling — never committed.** They're planning scaffolding for the person working on the machine, not project source. `.gitignore` excludes `/openspec` and `/.claude/*` (except `.claude/rules/`, once that directory exists — team-shared, path-scoped conventions belong in git even though the rest of `.claude/` doesn't).

## Target stack

Installed and ready to use in `apps/web` — actual routes/queries/forms/screens still need to be built on top of these, per the conventions below:

| Concern               | Library                                                                |
| ---------------------- | ----------------------------------------------------------------------- |
| Routing                | `react-router-dom` (v7)                                                |
| Server state           | `@tanstack/react-query`                                                |
| Forms                  | `react-hook-form` + `zod`                                              |
| Styling                | TailwindCSS **v3** (LTS — do not upgrade to v4 without an explicit decision to do so) |
| HTTP                   | `axios`                                                                |
| Toasts/notifications   | `react-toastify`                                                       |
| Database               | SQLite, local file, via Node's built-in `node:sqlite` — see "Reconciling with the academic spec" above for why not PostgreSQL |
| Backend                | Node.js, `apps/api` — not built yet, see Architecture: backend (planned) |
| Auth/session           | Not built yet — target is HttpOnly cookie sessions, see "Reconciling with the academic spec" above |
| Testing                | not set up yet — see Testing conventions                               |

Tailwind config lives in `apps/web/tailwind.config.js` (`content` already points at `index.html` + `src/**/*.{js,ts,jsx,tsx}`) and `apps/web/postcss.config.js`; global directives (`@tailwind base/components/utilities`) live in `apps/web/src/index.css`.

## Local database (SQLite)

`apps/web/scripts/setup-db.js` creates the local SQLite database file (default `apps/web/data/app.db`, overridable via the `DB_PATH` env var) using Node's built-in `node:sqlite` module (`DatabaseSync`) — no extra dependency, no native build step. It's wired as `postinstall` in `apps/web/package.json`, so it runs automatically whenever `yarn install` runs at the repo root (Yarn workspaces execute each package's own lifecycle scripts), and is also runnable manually via `yarn workspace @auto-agenda-cnh/web db:setup`. It's idempotent — safe to re-run, never wipes existing data.

`apps/web/data/*.db` (and its WAL/SHM sidecar files) are gitignored — this is a local, per-machine file, not something committed to the repo. Anyone cloning the repo gets a fresh empty database on their first `yarn install`.

**Requires Node ≥ 22.5** (`node:sqlite` availability) — declared in `apps/web/package.json`'s `engines` field. Once `apps/api` is built and becomes the actual owner of the database connection, this section moves/expands there — for now `apps/web`'s script is only what exists.

## Architecture: backend (planned)

The backend (`apps/api`) hasn't been built yet — this project is a **monorepo, not a separate-service split**: the Node.js backend and the Vite/React frontend live in the same repo (see Repository structure above), matching DOC-09 §1's architecture (React client, REST API, database — the browser never talks to the database directly).

When the backend is built:

- It talks to the local SQLite database (see Local database above) — no ORM/query-builder/framework choice has been made yet; don't assume Express, Fastify, Prisma, Drizzle, etc. until that decision is actually made. `docs/04_Especificacao_BackEnd_API.md` describes the aspirational architecture (Node.js/Express, modular routes/controllers/services/repositories) — useful as a reference shape, but its PostgreSQL assumption doesn't apply (see "Reconciling with the academic spec").
- Auth/session is HttpOnly-cookie-based per SEG-002 — no access token should ever be readable from `apps/web`'s client-side JS.
- Don't build ahead of instructions here — wait for direction on the actual API shape/framework before scaffolding server code.

## Front-end conventions and design consistency

DOC-03 (which would otherwise define front-end routes, screens, and component conventions) was never supplied — see "Reconciling with the academic spec" above. This project owns those decisions itself, which makes visual/structural consistency a standing responsibility, not something a spec document enforces for us:

- **Before building or substantially changing any screen/component, consult the project's front-end best-practices skills** (`vercel-react-best-practices` for React/Next.js performance and correctness patterns, `vercel-composition-patterns` for component composition/API design) — load them via the Skill tool rather than guessing at conventions from scratch.
- **Keep one consistent design language across every screen**: the same color palette, typography scale, spacing scale, and button/input styles everywhere — a page should never look like it was styled by a different rule set than the one next to it. See Styling conventions below for the concrete Tailwind rules this implies (no arbitrary values, no per-page one-off tokens).
- **Componentize instead of duplicating markup** across pages — if the same visual pattern shows up on a second screen, it becomes a shared component (see Architecture: component structure below), not a copy-pasted block with minor tweaks.
- Route structure, URL parameters, query strings, and navigation patterns follow standard React Router best practices (see Naming conventions' "Route path segments" below for the language/casing convention specifically) — again, project-owned, not spec-derived.

## Environment variables

Required variables are declared in `apps/web/.env.example` (committed) — copy it to `apps/web/.env` (gitignored, never committed) and fill in real values. Vite only exposes vars prefixed `VITE_` to client code (a Node-side backend, once built, can read any env var directly — it will likely get its own `.env`/`.env.example` under `apps/api/` rather than sharing `apps/web`'s). There are currently no required variables — `apps/web/.env.example` only documents the optional `DB_PATH` override for the local SQLite file.

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

Once an API layer exists (`apps/api`), put services in `apps/web/src/services/` as static-method classes, calling through an axios instance in `apps/web/src/Apis/` (driven by an env var for the API's base URL).

**Every request — query or mutation — goes through a React Query hook.** Never call a service method directly from a component or page-level hook, and never reach for a raw `useEffect` + `useState` fetch, even for a one-off call. Service-backed query hooks live in `apps/web/src/hooks/queries/<domain>/use<Name>/`, one folder per domain — kept separate from component/template hooks (`use[Template]`), which stay co-located with the component.

Query hooks have a single responsibility: fetch and return the raw service response. They must not shape/map data for a specific consumer (e.g. formatting into `{ value, label }` select options) — that mapping belongs in the page/component-level hook that calls them.

- **Reactive fetch** (component subscribes to loading/data/error): use `useQuery` directly.
- **Imperative/on-demand fetch** (e.g. a `loadOptions` callback triggered per keystroke): call `useQueryClient().fetchQuery(...)` inside the hook instead, so it still shares the query cache without forcing a component-level subscription.

**Error toast lives in the query/mutation hook, not in whatever page calls it.** Every consumer of a given query/mutation wants the same generic failure toast — centralize it in the hook (`onError` for mutations; a `useEffect` watching `isError` for queries, since `useQuery` has no hook-level `onError`). A caller can still pass its own page-specific `onError` at call time for extra follow-up — both fire, hook-level first.

The error response shape should follow `docs/04_Especificacao_BackEnd_API.md` §6.3 once the backend exists (`code`, `message`, optional `fieldErrors`, `correlationId`) — destructure it directly in the catch/error callback rather than reading it via optional chaining on a loosely-typed `error`; a malformed error response is itself worth surfacing, not silently swallowed behind `undefined`.

**Paginated listings should default to a single, centralized page size constant** (e.g. `DEFAULT_PAGE_SIZE` in `apps/web/src/constants/pagination.ts`), matching `BE-009`/`RN-027` (listings are paginated and filterable) — pick the actual value when the first paginated listing is built; don't guess one now.

## Auth & state

Per "Reconciling with the academic spec" above, this project follows **SEG-002 (DOC-07)**: session state lives in an **HttpOnly cookie** set by the backend, not in any client-JS-readable storage. This supersedes an earlier, now-retired agreement to use `sessionStorage` for the auth token. No backend/auth exists yet — this section describes the target, to apply once it's built:

- The frontend never reads or stores an access token directly — it relies on the browser sending the HttpOnly cookie automatically on requests to the API (`credentials: "include"` / axios `withCredentials: true`) and reacts to 401 responses (see `docs/04_Especificacao_BackEnd_API.md` §7) by redirecting to login.
- If CSRF protection is needed alongside the cookie (SEG-003), that's a backend concern (double-submit token, `SameSite` policy) — the frontend just needs to send whatever token/header the backend's auth flow requires.
- For non-auth client state that only needs to survive one flow/session and doesn't need to survive a page reload, prefer an in-memory React Context over any Web Storage.
- **Centralize role/permission checks in one hook** (e.g. `useUserPermissions.ts` exposing `hasRole`, `isAdmin`, `hasPermission`, etc., mirroring the profile matrix in `docs/07_Seguranca_Privacidade_Auditoria.md` §3) instead of re-deriving the same check inline in every component that needs it. Search for an existing hook/util before writing a fresh inline check for any repeated concern (permissions, formatting, validation).
- For data that needs to survive across steps of a multi-step flow (e.g. the scheduling wizard), prefer a React Context whose `Provider` wraps only the relevant route subtree — never an app-wide provider that stays mounted across unrelated areas. Context state lives only in memory, so it never touches disk.
- If a storage hook is ever added and named `useSessionStorage`/`useLocalStorage`, it must actually wrap the storage type its name says — a mismatch is a bug worth fixing at the source, not a pattern to replicate.

## Sensitive data (LGPD)

This app handles personal data regulated by Brazil's LGPD (Lei Geral de Proteção de Dados) — student/instructor name, CPF-equivalent document, email, phone, and vehicle data (see `docs/05_Banco_de_Dados_Dicionario.md` for the exact fields) and DOC-07's privacy/security requirements more broadly. Keep this in mind whenever a task touches user data, not just when it's called out explicitly.

- **Never persist personal/sensitive data client-side** — not in `sessionStorage`, not in `localStorage` (which shouldn't be used for anything, see Auth & state), not even transiently beyond what a single render cycle needs. The auth/session cookie itself is HttpOnly and therefore not something frontend code ever touches directly.
- If a flow genuinely needs an identifier to survive across steps (e.g. a selected student's UUID between wizard steps), an opaque ID in `sessionStorage` — removed immediately once consumed — is an acceptable, narrow exception. Full personal-data objects are not; use a scoped React Context (see Auth & state) for those instead.
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

## Forms

Use `react-hook-form` + `zod` for all forms. If the project ends up needing both RHF-controlled and generic uncontrolled/manually-controlled inputs, keep the two variants in separate folders (e.g. `Atoms/InputsRHF/` vs `Atoms/Inputs/`) rather than mixing both concerns into one component.

## Testing conventions

- **Every new component and page needs a unit test**, written in the same pass it's created, not as a follow-up.
- Tests live in a `__tests__/` folder inside the component's own directory, not loose next to `index.tsx` (e.g. `Button/__tests__/button.test.tsx` for `Button/index.tsx`) — filename is the `camelCase` version of the component name + `.test.tsx`.
- Once the provider tree (Query client, router, any Context) exists, build a shared render helper (e.g. `apps/web/src/utils/renderWithProviders.tsx`) that wraps `render()` with all of them, matching the app's real provider tree — any component using a data-fetching hook needs this wrapper or its own `QueryClientProvider` to avoid a "no QueryClient set" error.
- Write with `@testing-library/react` + `@testing-library/user-event`, run via Vitest.
- **One behavior per test** — avoid asserting multiple unrelated things in a single test block. Test descriptions are written in Portuguese (e.g. `test("Deve renderizar...")`), matching UI copy language, even though component/prop names stay in English.
- For presentational logic that doesn't need React state, prefer a small pure function file (e.g. `formatCurrency.ts`) co-located with the component instead of a `use*` hook — it's trivially unit-testable in isolation and keeps `index.tsx` focused on rendering.
- `docs/08_Plano_de_Testes_Qualidade.md` has the fuller test plan (unit/integration/component/E2E pyramid, minimum test cases TST-001…TST-025, required E2E scripts) — consult it once testing infrastructure is actually being set up.

## Browser verification

For visual/manual verification of UI changes, use **`agent-browser`** (https://github.com/vercel-labs/agent-browser) if installed globally (`npm i -g agent-browser && agent-browser install`) — start with `agent-browser skills get core --full` for the command reference. Prefer it over Playwright for this kind of exploratory/visual check.

**Known environment caveat**: some sandboxed dev environments are missing system libraries the underlying Chrome binary needs (`libnss3`, `libnspr4`, etc.) with no root access to install them. If launching fails with a "shared libraries" error, that's an environment limitation, not a tool problem — tell the user and ask them to run the suggested `apt-get install ...` command in their own terminal, then try again.
