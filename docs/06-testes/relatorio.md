# Relatório de execução dos testes automatizados

Execução real de `yarn workspace @auto-agenda-cnh/api test` em 2026-09-29, contra um PostgreSQL 18 limpo (schema temporário criado e derrubado pela própria suíte — ver `apps/api/tests/helpers.ts`). Rodada duas vezes seguidas para confirmar que o resultado é estável (nenhum teste dependente de ordem ou de estado deixado por uma execução anterior).

## Resultado

```
ℹ tests 27
ℹ suites 0
ℹ pass 27
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
```

27/27 testes passando, nas duas execuções.

## Por arquivo

- **`characterization.test.ts`** (23 testes) — suíte de caracterização: sobe a API real, chama todos os endpoints implementados (auth, students, vehicles, instructors, disponibilidade/bloqueios, appointments) e compara a resposta normalizada com um snapshot gravado (`characterization.test.ts.snapshot`). Cobre o caminho feliz e pelo menos um erro representativo (401/403/404/409/422) por grupo de rota.
- **`concurrency.test.ts`** (4 testes) — RN-016 sob concorrência real:
  - `two identical bookings fired at once` — duas reservas idênticas disparadas juntas: exatamente uma `201`, a outra `409`.
  - `eight identical bookings fired at once` — o mesmo teste com 8 requisições simultâneas, para descartar coincidência.
  - `the database itself rejects an overlapping instructor booking that bypasses the app check` — um `INSERT` direto por SQL, sem passar pelo `appointmentService`, é rejeitado pela *exclusion constraint* do banco (`23P01`).
  - `back-to-back lessons` — duas aulas em sequência exata (fim de uma = início da outra) são aceitas, confirmando que o intervalo é semiaberto.

## Como reproduzir

```bash
docker compose -f infra/docker-compose.yml up -d   # ou outro PostgreSQL via DATABASE_URL
yarn workspace @auto-agenda-cnh/api db:setup
yarn workspace @auto-agenda-cnh/api test
```

## Build e lint

`yarn workspace @auto-agenda-cnh/api build` (type-check) e `yarn workspace @auto-agenda-cnh/api lint` também rodaram sem erros durante esta verificação (incluindo a regra `@typescript-eslint/no-floating-promises`, que garante que nenhum `await` da camada assíncrona de banco foi esquecido).
