# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

The conventions below reflect established best practices and agreements adapted to this project's stack and domain (CNH scheduling). Treat them as proven agreements, not speculation — apply them from the first real feature onward instead of improvising fresh conventions per PR.

## Language

Always communicate with the user in Brazilian Portuguese (pt-BR) — both chat responses and any written output (commit messages, PR descriptions, docs generated for them) — unless the user explicitly asks for another language. Code identifiers, comments, and technical content should still follow the project's conventions (see Naming conventions below), not this rule.

**Explicit exception — commit messages**: the actual git commit message text (subject/body) is always written in English, matching common OSS/tooling convention (see Git commits below). Only the commit message content is English; chat responses about the commit stay in pt-BR.

## Precedence

When instructions from different sources could apply to the same task, resolve in this order:

1. The current task's explicit instruction.
2. A `.claude/rules/*.md` file whose `paths:` frontmatter matches the file being touched (none exist yet — if topic-specific conventions grow large enough to need path-scoping, split them out of this file instead of letting this file balloon).
3. This file's global conventions.
4. Auto-memory precedent (cross-session notes) — useful context, not an authoritative rule source; if it conflicts with 1–3, the instruction files win.

## Project state

This is a Vite + React 19 + TypeScript project (`auto_agenda_cnh`). The default Vite template markup/CSS/assets have been removed and TailwindCSS is installed; `src/App.tsx` currently only renders placeholder text — no real application features/routes/screens have been built yet. The sections below define the target architecture/conventions to build _toward_ as real features land.

## Commands

```bash
yarn dev       # start Vite dev server
yarn build     # tsc -b (project references) then vite build
yarn lint      # eslint .
yarn preview   # preview a production build
```

No test runner is configured yet. When adding one, prefer **Vitest** (Vite-native, and the natural fit for this project's build tool — see Testing conventions below).

This project uses `yarn` (yarn.lock is present, not npm/pnpm).

## TypeScript / build setup

- `tsconfig.json` is a references-only root pointing at `tsconfig.app.json` (src) and `tsconfig.node.json` (Vite config). `yarn build` type-checks via `tsc -b` across both before bundling.
- `tsconfig.app.json` targets `es2023`, uses bundler module resolution, and enables `verbatimModuleSyntax`, `noUnusedLocals`/`noUnusedParameters`, and `erasableSyntaxOnly` — write type-only imports as `import type { ... }` and avoid TS syntax that requires emit-time transformation (e.g. enums, parameter properties).
- `noEmit` is set; `@vitejs/plugin-react` handles transpilation, `tsc` is type-checking only.

## Git commits

A global slash command, `/git-commit`, is available (defined in `~/.claude/commands/git-commit.md`, works in any repo). When the user runs it: inspect `git status`/`git diff`/`git log` to learn this repo's real commit style, stage only the relevant changes, and create a single semantic commit with an English message matching that style. It never pushes — it always stops right after the local commit so the user can review and push themselves.

## Spec-driven workflow (OpenSpec)

This repo uses the `openspec` CLI plus the bundled `opsx` slash commands for a propose → apply → archive workflow, configured via `openspec/config.yaml`:

- `/opsx:propose` — describe a feature/fix, generates `proposal.md`, `design.md`, `tasks.md` for a new change (kebab-case name) under the OpenSpec planning home.
- `/opsx:explore` — open-ended thinking/investigation mode before or during a change, no artifacts required.
- `/opsx:apply` — implement the tasks from an existing change's `tasks.md`.
- `/opsx:archive` — finalize and archive a change once implementation is complete.

When adding a non-trivial feature, prefer creating an OpenSpec change (via `/opsx:propose` or the `openspec` CLI directly) before writing implementation code, rather than editing `src/` ad hoc. `openspec status --change "<name>" --json` reports which artifacts are required and their dependency order.

**`openspec/` and local Claude Code config are local-only tooling — never committed.** They're planning scaffolding for the person working on the machine, not project source. `.gitignore` excludes `/openspec` and `/.claude/*` (except `.claude/rules/`, once that directory exists — team-shared, path-scoped conventions belong in git even though the rest of `.claude/` doesn't).

## Target stack

Installed and ready to use — actual routes/queries/forms/screens still need to be built on top of these, per the conventions below:

| Concern               | Library                                                                |
| ---------------------- | ----------------------------------------------------------------------- |
| Routing                | `react-router-dom` (v7)                                                |
| Server state           | `@tanstack/react-query`                                                |
| Forms                  | `react-hook-form` + `zod`                                              |
| Styling                | TailwindCSS **v3** (LTS — do not upgrade to v4 without an explicit decision to do so) |
| HTTP                   | `axios`                                                                |
| Toasts/notifications   | `react-toastify`                                                       |
| Database               | SQLite, local file, via Node's built-in `node:sqlite` — no external/hosted DB |
| Backend                | Node.js, same project as the frontend (monolith) — not built yet, see Architecture: backend (planned) |
| Testing                | not set up yet — see Testing conventions                               |

Tailwind config lives in `tailwind.config.js` (`content` already points at `index.html` + `src/**/*.{js,ts,jsx,tsx}`) and `postcss.config.js`; global directives (`@tailwind base/components/utilities`) live in `src/index.css`.

This project does **not** use a hosted/external database or BaaS (no Supabase, no Firebase, etc.) — the database is a local SQLite file, created and owned by this same repo.

## Local database (SQLite)

`scripts/setup-db.js` creates the local SQLite database file (default `data/app.db`, overridable via the `DB_PATH` env var) using Node's built-in `node:sqlite` module (`DatabaseSync`) — no extra dependency, no native build step. It's wired as `postinstall` in `package.json`, so it runs automatically on `yarn install`, and is also runnable manually via `yarn db:setup`. It's idempotent — safe to re-run, never wipes existing data.

`data/*.db` (and its WAL/SHM sidecar files) are gitignored — this is a local, per-machine file, not something committed to the repo. Anyone cloning the repo gets a fresh empty database on their first `yarn install`.

**Requires Node ≥ 22.5** (`node:sqlite` availability) — declared in `package.json`'s `engines` field.

## Architecture: backend (planned)

The backend hasn't been built yet — this project is meant to be a **monolith**: Node.js backend and the Vite/React frontend living in the same repo, not a separate service. When the backend is built:

- It talks to the local SQLite database (see Local database above) — no ORM/query-builder/framework choice has been made yet; don't assume Express, Fastify, Prisma, Drizzle, etc. until that decision is actually made.
- Don't build ahead of instructions here — wait for direction on the actual API shape/framework before scaffolding server code.

## Environment variables

Required variables are declared in `.env.example` (committed) — copy it to `.env` (gitignored, never committed) and fill in real values. Vite only exposes vars prefixed `VITE_` to client code (a Node-side backend, once built, can read any env var directly). There are currently no required variables — `.env.example` only documents the optional `DB_PATH` override for the local SQLite file.

**Whenever a new required env var is introduced, add it to `.env.example` (with an empty/placeholder value, never a real secret) in the same change**, and update the table in [README.md](README.md#configuração) — that's what a new setup follows, not this file.

## Keeping README.md current

`README.md` is the project's market-facing setup doc — what someone installing/running this project for the first time reads, not what an AI agent reads. **Whenever a change is significant enough to affect how the project is set up, run, or understood from the outside** — a new required dependency, a new env var, a new script, a changed command, a new external service being integrated (database, API, auth provider) — update `README.md` in the same change, following normal market conventions for what a README documents (stack, prerequisites, setup steps, env vars, available scripts). Remove sections that stop being accurate rather than letting them go stale. This file (`CLAUDE.md`) covers *how to work in the codebase*; `README.md` covers *what the project is and how to run it* — keep the update in the right one (often both).

## Architecture: component structure (Atomic Design)

```
src/components/
  Atoms/       # primitives: Button, Input, Select, Modal, Status, etc.
  Molecules/   # form groups and composed widgets
  Templates/   # page layouts, only when reused by more than one Page
  Pages/       # thin wrappers — or the logic itself, when there's no Template
```

**Only create a Template when it's actually reused by more than one Page.** For a page that only one route will ever render, skip the Template entirely: put the markup directly in `src/components/Pages/<Name>/index.tsx` with a co-located `use<Name>.ts` hook holding the logic — same shape as `use[Template]`, just one level up.

When a Template does exist, it delegates to a `use[Template]` hook (e.g. `useDashboardTemplate`) co-located in the same directory.

**Reuse-first applies to Molecules too**: before building a new form/group inside a Page or Template, check whether an existing Molecule already covers it, rather than rebuilding fields from scratch.

**Never delete a prior version's files when a new version replaces it.** Stop referencing the old version (swap routes/imports to the new one) and leave the old files in the repo — don't "clean up" by deleting them.

## Naming conventions

- **Component/Page/Template folders and exports**: `PascalCase`, always English — even when the feature/route it renders is Portuguese-named.
- **Hooks**: `camelCase`, `use`-prefixed, English (e.g. `useDashboard.ts`, `useUserProfile.ts`).
- **Test files**: `camelCase` version of the component name + `.test.tsx`, English (e.g. `button.test.tsx` for `Button`) — lowercase first letter even though the component itself is `PascalCase`. Test _descriptions_ inside are Portuguese (see Testing conventions).
- **Utility functions** (`src/utils/`): `camelCase`, English, verb-first (e.g. `formatDate`, `removeEmpty`) — even when the noun they operate on is a Portuguese domain term.
- **Constants files** (`src/constants/`): `snake_case`, named in Portuguese when they hold a Portuguese business/domain concept (e.g. `tipo_veiculo.ts`, `categoria_cnh.ts`) — these mirror backend/domain vocabulary, don't translate them to English.
- **Route path segments**: `kebab-case`, Portuguese, matching end-user-facing language (e.g. `/agendar-exame`, `/meus-agendamentos`) — this is the one place Portuguese is expected even though the component rendering it has an English name.

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

Once an API layer exists, put services in `src/services/` as static-method classes, calling through axios instances in `src/Apis/` (one instance per backend/API, each driven by an env var).

**Every request — query or mutation — goes through a React Query hook.** Never call a service method directly from a component or page-level hook, and never reach for a raw `useEffect` + `useState` fetch, even for a one-off call. Service-backed query hooks live in `src/hooks/queries/<domain>/use<Name>/`, one folder per domain — kept separate from component/template hooks (`use[Template]`), which stay co-located with the component.

Query hooks have a single responsibility: fetch and return the raw service response. They must not shape/map data for a specific consumer (e.g. formatting into `{ value, label }` select options) — that mapping belongs in the page/component-level hook that calls them.

- **Reactive fetch** (component subscribes to loading/data/error): use `useQuery` directly.
- **Imperative/on-demand fetch** (e.g. a `loadOptions` callback triggered per keystroke): call `useQueryClient().fetchQuery(...)` inside the hook instead, so it still shares the query cache without forcing a component-level subscription.

**Error toast lives in the query/mutation hook, not in whatever page calls it.** Every consumer of a given query/mutation wants the same generic failure toast — centralize it in the hook (`onError` for mutations; a `useEffect` watching `isError` for queries, since `useQuery` has no hook-level `onError`). A caller can still pass its own page-specific `onError` at call time for extra follow-up — both fire, hook-level first.

If the backend shapes error responses with a consistent message field (confirm the actual contract once a backend exists), destructure it directly in the catch/error callback rather than reading it via optional chaining on a loosely-typed `error` — a malformed error response is itself worth surfacing, not silently swallowed behind `undefined`.

**Paginated listings should default to a single, centralized page size constant** (e.g. `DEFAULT_PAGE_SIZE` in `src/constants/pagination.ts`) rather than scattering magic numbers per listing. Pick the actual value when the first paginated listing is built; don't guess one now.

## Auth & state

- **Use `sessionStorage`, not `localStorage`, whenever browser storage is actually needed** (auth token, logged-in user, anything else that would otherwise go to disk) — this project's deliberate choice, not just a fallback for single-flow data. `localStorage` persists indefinitely across browser restarts even after the user is done with the app; `sessionStorage` clears when the tab/session ends, which is the safer default here. Reach for `localStorage` only if a specific requirement explicitly needs data to survive a full browser restart — don't default to it out of habit.
- Prefer an in-memory Context over any Web Storage for anything that only needs to survive one flow/session and doesn't need to survive a page reload at all.
- If a hook is named `useSessionStorage` but actually wraps `localStorage` (or vice versa), that's a naming bug worth fixing at the source — name storage hooks after what they actually use.
- **Centralize role/permission checks in one hook** (e.g. `useUserPermissions.ts` exposing `hasRole`, `isAdmin`, `hasPermission`, etc.) instead of re-deriving the same `.includes(...)`/`===` check inline in every component that needs it. Search for an existing hook/util before writing a fresh inline check for any repeated concern (permissions, formatting, validation).
- For data that needs to survive across steps of a multi-step flow, prefer a React Context whose `Provider` wraps only the relevant route subtree — never an app-wide provider that stays mounted across unrelated areas. Context state lives only in memory, so it never touches disk.

## Sensitive data (LGPD)

This app will handle personal data regulated by Brazil's LGPD (Lei Geral de Proteção de Dados) — CNH/scheduling naturally involves name, CPF, email, phone, and possibly address. Keep this in mind whenever a task touches user/client data, not just when it's called out explicitly.

- **Never persist personal/sensitive data in `sessionStorage` (or `localStorage`, which shouldn't be used at all — see Auth & state).** Both survive reloads and are trivially readable via DevTools or an XSS payload. An auth token and minimal logged-in-user info are the normal exception — don't extend that exception to name/CPF/address/etc.
- If a flow genuinely needs an identifier to survive across steps (e.g. a client UUID selected in one step, needed by a later step), a bare opaque ID in `sessionStorage` — removed immediately once consumed — is an acceptable, deliberate tradeoff. Full personal-data objects are not; use a scoped React Context (see Auth & state) for those instead.
- **Don't log full personal-data payloads** to `console.*` or any external service — pass status codes or generic messages, not raw sensitive fields.
- If you spot personal data already sitting somewhere it shouldn't (e.g. `localStorage`) while working on something else, flag it to the user rather than silently rewriting unrelated code.
- No event/analytics tracking utility is used in this project — don't add one unless the user explicitly asks for it.

## Figma workflow

If this project gets a Figma MCP server configured, treat it as a **hard gate, not a best-effort step** before implementing any layout/component work referencing a Figma design:

1. Try to reach the MCP first — read the real node tree, styles, spacing, and assets instead of guessing from a screenshot or verbal description.
2. If it's unreachable, **stop before writing implementation code.** Tell the user exactly what failed, then ask via `AskUserQuestion` whether to proceed without it.
3. **Do not proceed without Figma access unless the user explicitly says yes** — every time this comes up, even if a prior session already agreed to proceed without it once.
4. If the user declines, wait — don't fall back to building from memory/description alone.

Never reference images via remote URLs (Figma URLs, CDN links). Export assets locally first: raster images into `public/assets/img/`, vector icons/logos into `public/assets/svg/` (prefer SVG whenever the node supports it).

## Styling conventions

- **TailwindCSS-first**: prefer utility classes over hand-rolled CSS/styled-components. Only reach for something else when it genuinely can't be expressed in Tailwind (complex keyframe animations, 3rd-party component style overrides).
- **Avoid arbitrary-value classes (`[...]`) as much as possible — spacing, margin, sizing, colors, anything with a Tailwind-predefined scale.** Don't write `bg-[#8ac9bc]`, `gap-[15px]`, `p-[14px]`, `text-[#333]`, etc. Use only what's already predefined in the Tailwind scale/theme (`gap-4`, `p-3.5`, `bg-slate-600`, ...). If a Figma/design measurement or color doesn't land exactly on the scale, round to the nearest predefined value rather than reaching for an arbitrary-value class to match it pixel/hex-perfect. If a color genuinely isn't covered by the default palette, add it as a named token in `tailwind.config` (theme extension) instead of inlining a one-off arbitrary hex — that keeps it reusable and named instead of a magic value scattered across files. Treat arbitrary-value classes as a last resort for something that truly cannot be expressed any other way, not a convenience.
- **Don't bake placement/spacing concerns into shared component variants.** Things like `text-center`, `margin-*`, or `mb-*` are call-site decisions, not properties of the component itself — a shared `Typography`/heading variant should own what's intrinsic to that style (size, weight, line height, color), not how it's positioned wherever it's dropped. Add placement classes at the call site (they merge with the variant's own classes), don't add a prop/variant for it.
- **Build mobile-first, even when the Figma you're given only covers desktop.** Unprefixed classes are the mobile layout; add `sm:`/`md:`/`lg:` to progressively enhance. Don't ship desktop measurements unprefixed and call it done — make a deliberate mobile layout (stack multi-column content, let fixed-width elements shrink).

## Forms

Use `react-hook-form` + `zod` for all forms. If the project ends up needing both RHF-controlled and generic uncontrolled/manually-controlled inputs, keep the two variants in separate folders (e.g. `Atoms/InputsRHF/` vs `Atoms/Inputs/`) rather than mixing both concerns into one component.

## Testing conventions

- **Every new component and page needs a unit test**, written in the same pass it's created, not as a follow-up.
- Tests live in a `__tests__/` folder inside the component's own directory, not loose next to `index.tsx` (e.g. `Button/__tests__/button.test.tsx` for `Button/index.tsx`) — filename is the `camelCase` version of the component name + `.test.tsx`.
- Once the provider tree (Query client, router, any Context) exists, build a shared render helper (e.g. `src/utils/renderWithProviders.tsx`) that wraps `render()` with all of them, matching the app's real provider tree — any component using a data-fetching hook needs this wrapper or its own `QueryClientProvider` to avoid a "no QueryClient set" error.
- Write with `@testing-library/react` + `@testing-library/user-event`, run via Vitest.
- **One behavior per test** — avoid asserting multiple unrelated things in a single test block. Test descriptions are written in Portuguese (e.g. `test("Deve renderizar...")`), matching UI copy language, even though component/prop names stay in English.
- For presentational logic that doesn't need React state, prefer a small pure function file (e.g. `formatCurrency.ts`) co-located with the component instead of a `use*` hook — it's trivially unit-testable in isolation and keeps `index.tsx` focused on rendering.

## Browser verification

For visual/manual verification of UI changes, use **`agent-browser`** (https://github.com/vercel-labs/agent-browser) if installed globally (`npm i -g agent-browser && agent-browser install`) — start with `agent-browser skills get core --full` for the command reference. Prefer it over Playwright for this kind of exploratory/visual check.

**Known environment caveat**: some sandboxed dev environments are missing system libraries the underlying Chrome binary needs (`libnss3`, `libnspr4`, etc.) with no root access to install them. If launching fails with a "shared libraries" error, that's an environment limitation, not a tool problem — tell the user and ask them to run the suggested `apt-get install ...` command in their own terminal, then try again.
