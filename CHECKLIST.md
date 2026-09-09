# Checklist de Funcionalidades — AutoAgenda

Visão de alto nível do que já está implementado (de verdade, funcionando) e do que ainda falta, organizada por perfil/área — não por endpoint ou tela individual. Este é um projeto acadêmico (Projeto Integrador II): o objetivo é demonstrar entendimento e um funcionamento real das partes centrais, não cobrir 100% da especificação em `docs/`. Ver "Sobre o escopo deste projeto" no [README.md](README.md) e "Academic scope & delivery philosophy" no [CLAUDE.md](CLAUDE.md) para o critério usado em cada decisão de escopo.

Legenda: `[x]` implementado e verificado · `[~]` em andamento (artefatos/planejamento já existem) · `[ ]` não iniciado.

## Autenticação

- [x] Login / logout
- [x] Sessão (token retornado no corpo da resposta, guardado em `sessionStorage`)
- [x] Esqueci a senha / redefinir senha — `auth-password-reset`. Sem provedor de e-mail: o link de redefinição é registrado no console da API em vez de enviado, decisão documentada em README.md/CLAUDE.md

## Administrador

- [x] Gerenciar alunos (cadastrar, listar/buscar/filtrar, editar, inativar)
- [x] Gerenciar veículos (cadastrar, listar/buscar/filtrar, editar — status incluso)
- [x] Gerenciar instrutores (cadastrar com conta de login própria, listar/buscar/filtrar, editar)
- [x] Agendar aulas (buscar disponibilidade + criar aula, com detecção real de conflito de aluno/instrutor/veículo) — `appointment-scheduling`. Sem reagendar/cancelar/confirmar/presença/concluir (toda aula fica em AGENDADA); disponibilidade de instrutor e autorização por categoria não são modeladas (todo instrutor ativo conta como sempre disponível/autorizado) — ver Non-Goals em `openspec/changes/archive/`
- [x] Configurações da autoescola — `admin-mocked-screens`. Mockado: exibe os valores reais do algoritmo de agendamento, "salvar" não persiste (ver "O que é real vs. simulado" no README)
- [x] Auditoria (consulta de eventos) — `admin-mocked-screens`. Mockado: tabela com eventos fictícios fixos, sem consulta real
- [x] Painel/dashboard — `admin-dashboard`. Real: contagens de alunos/instrutores/veículos/aulas e lista de próximos agendamentos, agregando dados já existentes via `/students`, `/instructors`, `/vehicles`, `/appointments`, sem endpoint novo
- [x] Relatórios (exportação) — `admin-mocked-screens`. Mockado: botão de exportação simula sucesso, nenhum arquivo é gerado

## Instrutor

- [x] Ver a própria agenda — `instructor-schedule`. Somente leitura (sem reagendar/cancelar/confirmar); `GET /appointments` escopado por instrutor no próprio servidor, reaproveitando o mesmo endpoint do Admin
- [ ] Disponibilidade semanal / bloqueios (deliberadamente fora de escopo — ver Non-Goals de `appointment-scheduling`)
- [x] Editar o próprio perfil — `instructor-edit-profile`. Real: `GET/PATCH /instructors/me`, escopo mínimo (só telefone editável; nome/documento/registro/status continuam só-Admin)

## Aluno

- [x] Conta de login própria — `student-self-service`. Decisão anterior revertida em 2026-09-09: Admin concede acesso a um aluno já cadastrado via "Criar acesso" (`POST /students/:id/create-account`), não é auto-cadastro
- [x] Agendar aula (self-service) — `student-self-service`. `GET /availability/slots`/`POST /appointments` escopados por aluno no próprio servidor (aluno nunca escolhe a si mesmo nem a categoria — sempre resolvidos a partir da própria conta), reaproveitando o mesmo motor de agendamento do Admin
- [x] Ver minha agenda / histórico — `student-self-service`. Mesma fonte (`GET /appointments`, escopada por aluno), dividida no cliente por data (futuro/passado), sem endpoint novo
- [x] Editar o próprio perfil — `student-self-service`. Real: `GET/PATCH /students/me`, escopo mínimo (só telefone editável; nome/documento/categoria/status continuam só-Admin), mesmo padrão de `instructor-edit-profile`

## Transversais

- [x] Testes de componente (Cypress) cobrindo tudo que foi implementado
- [x] Changelog (`CHANGELOG.md`) atualizado a cada commit
- [x] Migrations versionadas + seed de dados de demonstração

## Como manter este checklist

Atualize este arquivo na mesma sessão/commit em que um item mudar de estado — ao aplicar uma change (`/opsx:apply`) que a implementa, ao decidir deixar algo deliberadamente fora de escopo, ou ao descobrir um item que faltava listar. Mantenha os itens no nível de "funcionalidade por perfil", não desça a detalhe de endpoint — o objetivo é dar uma visão rápida do que já pode ser demonstrado.
