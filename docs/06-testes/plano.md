# Plano de testes

Adaptação de `docs/08_Plano_de_Testes_Qualidade.md` §3 ao que este projeto efetivamente implementa. Coluna **Cobertura**: `Auto` = testado por `apps/api/tests/*.test.ts`; `Manual` = verificado à mão (ver `checklist-manual.md`); `Non-Goal` = funcionalidade que este projeto não implementa (documentado, não esquecido).

| ID | Cenário | Cobertura | Onde |
|---|---|---|---|
| TST-001 | Login válido | Auto | `characterization.test.ts` → "auth: login failures…" (caminho inverso) e "auth: GET /me" |
| TST-002 | Login inválido | Auto | `characterization.test.ts` → "auth: login failures share one generic message" |
| TST-003 | Autorização aluno (não vê dado de terceiro) | Auto | `characterization.test.ts` → "appointments: Student books only for themselves" |
| TST-004 | Cadastro de aluno | Auto | `characterization.test.ts` → "students: register, duplicate document, validation" |
| TST-005 | E-mail duplicado | Auto | `characterization.test.ts` → "students: create login account, second attempt conflicts" e "instructors: … duplicate" |
| TST-006 | Disponibilidade respeita expediente e agenda do instrutor | Auto | `characterization.test.ts` → "appointments: slot search…"; `instructor-availability`'s Non-Goal de instrutor sem janela |
| TST-007 | Conflito de aluno | Auto | `concurrency.test.ts` + `characterization.test.ts` (booking do mesmo aluno) |
| TST-008 | Conflito de instrutor | Auto | `concurrency.test.ts` → "eight identical bookings…", "…bypasses the app check" |
| TST-009 | Conflito de veículo | Auto | `characterization.test.ts` → "Admin searches and books a slot; the same slot cannot be booked twice" |
| TST-010 | Concorrência (duas confirmações simultâneas) | Auto | `concurrency.test.ts` → "two identical bookings fired at once" e "eight identical…" |
| TST-011 | Reagendamento válido | Non-Goal | Não há reagendamento neste projeto (ver `docs/02-uml/estados-appointment.md`) |
| TST-012 | Reagendamento inválido | Non-Goal | idem |
| TST-013 | Cancelamento no prazo | Non-Goal | Não há cancelamento |
| TST-014 | Cancelamento fora do prazo | Non-Goal | idem |
| TST-015 | Bloqueio de instrutor remove da busca | Auto | `characterization.test.ts` → "an instructor block removes their slots" |
| TST-016 | Manutenção de veículo remove da busca | Manual | `vehicle.status = MAINTENANCE` filtrado em `searchSlots`; ver checklist manual |
| TST-017 | Transição inválida de estado | Non-Goal | Só existe um estado (`AGENDADA`) |
| TST-018 | Presença e conclusão | Non-Goal | Não implementado |
| TST-019 | Paginação e filtros | Auto | `characterization.test.ts` → "students: list, pagination, search and status filter" |
| TST-020 | Sessão expirada | Auto | `characterization.test.ts` → "auth: GET /me and unauthenticated access", "auth: logout revokes the session" |
| TST-021 | Navegação por teclado | Manual | Ver checklist manual |
| TST-022 | Responsividade 320px | Manual | Ver checklist manual; `institutional-landing-page` e telas gerais são mobile-first |
| TST-023 | Erros de servidor exibem `correlationId` | Manual | Envelope padrão sempre inclui `correlationId` (ver `docs/05-api/decisoes.md`) |
| TST-024 | Logs seguros (sem credencial) | Manual | `errorHandler` nunca expõe stack trace; `password_hash` nunca sai nas views |
| TST-025 | Migração limpa (banco vazio → migração + seed) | Auto | `docs/06-testes/relatorio.md` (execução real de `db:setup`) |

## Pirâmide de testes real

Diferente da sugestão de `docs/08` §2 (Vitest/RTL), este projeto usa:

| Nível | Ferramenta real |
|---|---|
| Back-end (unitário + integração) | `node:test` puro, sem mocks — sobe a API real sobre PostgreSQL (schema temporário) |
| Front-end (componente) | Cypress component testing |
| Manual/usabilidade | Checklist manual (este diretório) + os 5 avaliadores (`docs/07-avaliacoes`) |

Não há testes E2E cross-stack (Cypress/Playwright abrindo o navegador contra a API real) — decisão de escopo, coberta pelo checklist manual e pelas capturas de `docs/03-ux-ui`.
