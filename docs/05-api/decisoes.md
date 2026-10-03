# Decisões do back-end (API)

## Padrão de arquitetura: MVC

O enunciado do PI II pede explicitamente o padrão MVC. `apps/api/src` está organizado em `routes/` (Router), `controllers/` (Controller), `models/` (Model — `*Model.ts` de persistência + `*Service.ts` de regras de negócio) e `views/` (View — serializadores da resposta JSON, já que a API não renderiza HTML). Detalhes e diagrama de fluxo em `README.md` ("Arquitetura do back-end (MVC)") e na change arquivada `migrate-api-to-mvc`.

## Sem ORM

SQL puro via `pg`, sem Prisma/TypeORM/Knex — decisão mantida desde o bootstrap do back-end (`api-bootstrap`), para manter poucas peças móveis (ver "Academic scope & delivery philosophy" no CLAUDE.md).

## Autenticação: token no corpo + `sessionStorage`, não cookie HttpOnly

Desvio deliberado de SEG-002 (DOC-07 §2), documentado em `CLAUDE.md`. `POST /auth/login` devolve o token no corpo; o front envia `Authorization: Bearer <token>`. A sessão continua sendo revogável no servidor (tabela `session`).

## Autorização por perfil, escopada no próprio servidor

`requireRole` decide quem pode chamar cada rota; dentro dos services, Instrutor e Aluno só enxergam os próprios dados (ex.: `appointmentService.list` resolve o `instructor.id`/`student.id` a partir do usuário logado, nunca confia em um id vindo do cliente).

## Envelope de erro único

Todo erro (validação, autenticação, conflito, não encontrado) responde no mesmo formato (`code`, `message`, `correlationId`, `fieldErrors` opcional) — `docs/04_Especificacao_BackEnd_API.md` §6.3, implementado em `src/middlewares/errorHandler.ts` e `src/shared/ApiError.ts`. Nenhum stack trace é exposto ao cliente (SEG-013).

## Paginação e filtros consistentes

Toda listagem (`students`, `vehicles`, `instructors`, `appointments`) devolve `{ items, page, pageSize, total }`, com `pageSize` limitado a um máximo por endpoint, evitando que um cliente peça uma página arbitrariamente grande.

## Sem lifecycle de agendamento

Não há `PATCH`/`DELETE`/`cancel`/`confirm` para `appointment` — toda aula fica `AGENDADA` (Non-Goal registrado, ver `docs/02-uml/estados-appointment.md`). A OpenAPI (`openapi.yaml`) reflete isso: não existe nenhuma rota de transição de estado.
