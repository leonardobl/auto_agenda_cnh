# apps/api

Back-end (Node.js/Express, TypeScript, PostgreSQL) organized as **MVC**: `src/routes` (Router), `src/controllers` (Controller), `src/models` (Model — SQL persistence + business rules) and `src/views` (View — JSON response serializers). See "Arquitetura do back-end (MVC)" in the root [README.md](../../README.md) and "Architecture: backend" in [CLAUDE.md](../../CLAUDE.md).

```bash
yarn workspace @auto-agenda-cnh/api db:up      # local PostgreSQL (Docker Compose)
yarn workspace @auto-agenda-cnh/api db:setup   # migrations + demo seed
yarn workspace @auto-agenda-cnh/api dev        # API with auto-restart
yarn workspace @auto-agenda-cnh/api test       # node:test suites (throwaway schema in the DATABASE_URL database)
```
