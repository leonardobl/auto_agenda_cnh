# Revisão do planejamento (Situação 1)

O planejamento original (visão, escopo, atores, MVP, regras de negócio) está em [`docs/01_Visao_Escopo_Requisitos_Negocio.md`](../01_Visao_Escopo_Requisitos_Negocio.md) — não duplicado aqui.

## O que mudou desde o planejamento original

Duas decisões de arquitetura foram revisadas e já aplicadas, ambas registradas como changes arquivadas em `openspec/changes/archive/`:

- **Back-end reorganizado em MVC explícito** (`migrate-api-to-mvc`, 2026-09-28): antes o back-end usava uma separação em camadas equivalente, mas com nomes diferentes (`http/routes`, `http/controllers`, `modules`, `repositories`). Passou a `routes/`, `controllers/`, `models/`, `views/`, atendendo à exigência explícita de MVC do PDF, sem mudar nenhum contrato de API.
- **Banco de dados trocado de SQLite para PostgreSQL** (`migrate-db-to-postgres`, 2026-09-28): alinhando com `docs/04`, `docs/05` e `docs/09`, que sempre especificaram PostgreSQL. Ambiente local via Docker Compose (`infra/docker-compose.yml`).

## O que permanece como decisão pendente de confirmação

Ver "Reconciling with the academic spec" no [`CLAUDE.md`](../../CLAUDE.md) e `docs/10` §8: linguagem (TypeScript em vez de JavaScript puro) e transporte de sessão (token no corpo + `sessionStorage` em vez de cookie HttpOnly). Ambos já foram informalmente aceitos pelo orientador durante o desenvolvimento, mas seguem listados aqui para confirmação formal.

## Escopo não revisado para baixo nem para cima

O MVP definido em `docs/01` continua o mesmo: os três perfis (Admin, Instrutor, Aluno), autenticação, cadastros base, disponibilidade e agendamento com detecção de conflito. O ciclo de vida completo de uma aula (reagendar, cancelar, presença, conclusão) continua fora de escopo, decisão tomada já na primeira versão do agendamento (`appointment-scheduling`) e mantida em todas as revisões seguintes — ver `docs/02-uml/estados-appointment.md`.
