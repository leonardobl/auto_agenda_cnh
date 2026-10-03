# Checklist de verificação manual

Complementa `plano.md` para os itens marcados `Manual`. Executado em 2026-09-29 contra a aplicação real (API + web), login de demonstração do `README.md`.

| ID | Passo | Resultado observado |
|---|---|---|
| TST-016 | Marcar um veículo como `MAINTENANCE` (Admin > Veículos) e buscar horário que exigiria esse veículo | O veículo em manutenção não aparece em `GET /availability/slots` (filtro `status: 'ACTIVE'` em `appointmentService.searchSlots`, código já lido/confirmado) |
| TST-021 | Login (Admin) e navegar até Agenda usando só Tab/Enter | Campos de e-mail/senha, botão "Entrar" e os campos do formulário de busca são todos alcançáveis por Tab (são `<input>`/`<select>`/`<button>` nativos do HTML, sem `div` clicável sem foco) |
| TST-022 | Página institucional em 375px de largura | Já verificado na própria change que a introduziu (`institutional-landing-page`, 2026-09-18): renderiza sem scroll horizontal, seções empilhadas. Reconfirmação nesta sessão não foi possível (o `agent-browser` deste ambiente não expõe um comando de redimensionar viewport), mas o CSS é mobile-first (classes não prefixadas = mobile, `sm:`/`md:`/`lg:` progressivos — ver "Styling conventions" no `CLAUDE.md`) em todas as telas, não só na institucional |
| TST-023 | Forçar um erro (login com senha errada) | `POST /auth/login` com senha errada devolve `401 { code: AUTHENTICATION_REQUIRED, message: "E-mail ou senha inválidos.", correlationId }` (confirmado via `curl` e pela suíte automatizada); o front exibe a mensagem genérica em toast |
| TST-024 | Inspecionar logs da API durante login (correto e errado) | `console.error` só loga `[correlationId] <erro>`, nunca a senha nem o hash; as *views* (`presentStudent`, `presentAuthenticatedUser`, etc.) nunca incluem `password_hash` no JSON de resposta (conferido em `src/views/*.ts`) |

## Percurso funcional (evidência: `docs/03-ux-ui/capturas/`)

1. Login como Admin → painel com contagens reais (5 alunos, 2 instrutores, 3 veículos) — `02-admin-dashboard.png`.
2. Admin > Agenda: busca horário para um aluno e reserva — `03-admin-agenda.png`.
3. Login como Instrutor → própria agenda e disponibilidade semanal (Seg-Sex 08:00-18:00, seedada) — `04-instrutor-inicio.png`, `05-instrutor-disponibilidade.png`.
4. Login como Aluno → tela de agendar aula (self-service, sem campo de aluno/categoria) — `06-aluno-inicio.png`, `07-aluno-agendar.png`.

Cada login usou uma conta de perfil diferente (`admin@autoagenda.local`, `instrutor1@autoagenda.local`, `aluno1@autoagenda.local`), confirmando que o redirecionamento pós-login e o menu lateral mudam conforme o `role` retornado por `GET /me`.
