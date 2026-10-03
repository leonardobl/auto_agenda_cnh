# Decisões do projeto físico do banco

## SGBD: PostgreSQL

`docs/04`, `docs/05` e `docs/09` já especificavam PostgreSQL; o projeto usava SQLite localmente (desvio documentado) e migrou para PostgreSQL na change `migrate-db-to-postgres` — ver `openspec/changes/archive/2026-09-28-migrate-db-to-postgres/` para o design completo. Driver `pg`, SQL puro, sem ORM (decisão mantida desde `api-bootstrap`).

## Ids como `TEXT`, não `uuid` nativo

Os ids são gerados em aplicação (`crypto.randomUUID()`) e armazenados como `TEXT`, não como o tipo `uuid` do PostgreSQL. Isso preserva o comportamento de `404` para um id malformado numa URL (ex.: `GET /students/does-not-exist`) — um `uuid` nativo rejeitaria isso com erro de sintaxe (`22P02`), virando `500` em vez de `404`.

## Timestamps: `TIMESTAMPTZ`

Todas as colunas de data/hora (exceto `birth_date`, que é `DATE`) são `TIMESTAMPTZ`, comparáveis diretamente e usáveis em `tstzrange` (ver abaixo). A API serializa esses valores como string ISO 8601.

## Conflito de horário garantido pelo banco: exclusion constraints

A tabela `appointment` (migration `0007`) usa a extensão `btree_gist` e três `EXCLUDE USING gist`:

```sql
CONSTRAINT appointment_instructor_no_overlap
  EXCLUDE USING gist (instructor_id WITH =, tstzrange(start_at, end_at) WITH &&),
CONSTRAINT appointment_vehicle_no_overlap
  EXCLUDE USING gist (vehicle_id WITH =, tstzrange(start_at, end_at) WITH &&),
CONSTRAINT appointment_student_no_overlap
  EXCLUDE USING gist (student_id WITH =, tstzrange(start_at, end_at) WITH &&)
```

Isso impede duas aulas sobrepostas do mesmo aluno, instrutor ou veículo mesmo sob concorrência real (duas requisições simultâneas) — a aplicação também checa antes de inserir (mensagem de erro amigável), mas quem garante a exclusão mútua é o banco. `tstzrange` é um intervalo semiaberto (`[início, fim)`), então aulas encostadas (fim de uma = início da outra) continuam permitidas. Coberto por `apps/api/tests/concurrency.test.ts`.

## Foreign keys reais

Diferente do SQLite usado antes (que não impunha `REFERENCES`), o PostgreSQL impõe as FKs de verdade. Os services continuam validando a existência da referência antes de inserir (ex.: `studentService.assertCategoryExists`), para devolver um `400` amigável em vez de deixar o erro de FK (`23503`) vazar.

## Migrations versionadas, sem framework

`apps/api/src/database/migrations/*.sql`, numeradas, aplicadas por um runner próprio (`scripts/migrate.ts`) que registra o que já rodou em `_migrations`. Sem Prisma/Knex/TypeORM — decisão mantida desde o bootstrap do back-end.
