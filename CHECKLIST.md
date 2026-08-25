# Checklist de Funcionalidades — AutoAgenda

Visão de alto nível do que já está implementado (de verdade, funcionando) e do que ainda falta, organizada por perfil/área — não por endpoint ou tela individual. Este é um projeto acadêmico (Projeto Integrador II): o objetivo é demonstrar entendimento e um funcionamento real das partes centrais, não cobrir 100% da especificação em `docs/`. Ver "Sobre o escopo deste projeto" no [README.md](README.md) e "Academic scope & delivery philosophy" no [CLAUDE.md](CLAUDE.md) para o critério usado em cada decisão de escopo.

Legenda: `[x]` implementado e verificado · `[~]` em andamento (artefatos/planejamento já existem) · `[ ]` não iniciado.

## Autenticação

- [x] Login / logout
- [x] Sessão (token retornado no corpo da resposta, guardado em `sessionStorage`)
- [ ] Esqueci a senha / redefinir senha (telas existem no front-end, sem back-end por trás)

## Administrador

- [x] Gerenciar alunos (cadastrar, listar/buscar/filtrar, editar, inativar)
- [x] Gerenciar veículos (cadastrar, listar/buscar/filtrar, editar — status incluso)
- [x] Gerenciar instrutores (cadastrar com conta de login própria, listar/buscar/filtrar, editar)
- [x] Agendar aulas (buscar disponibilidade + criar aula, com detecção real de conflito de aluno/instrutor/veículo) — `appointment-scheduling`. Sem reagendar/cancelar/confirmar/presença/concluir (toda aula fica em AGENDADA); disponibilidade de instrutor e autorização por categoria não são modeladas (todo instrutor ativo conta como sempre disponível/autorizado) — ver Non-Goals em `openspec/changes/archive/`
- [ ] Configurações da autoescola (horário de funcionamento, duração, antecedência — hoje fixos em código, ver decisão em `appointment-scheduling`)
- [ ] Auditoria (consulta de eventos)
- [ ] Painel/dashboard
- [ ] Relatórios (exportação)

## Instrutor

- [x] Ver a própria agenda — `instructor-schedule`. Somente leitura (sem reagendar/cancelar/confirmar); `GET /appointments` escopado por instrutor no próprio servidor, reaproveitando o mesmo endpoint do Admin
- [ ] Disponibilidade semanal / bloqueios (deliberadamente fora de escopo — ver Non-Goals de `appointment-scheduling`)
- [ ] Editar o próprio perfil

## Aluno

- [ ] Conta de login própria (decisão registrada: Admin agenda em nome do aluno; aluno não autentica neste projeto)
- [ ] Agendar aula (self-service)
- [ ] Ver minha agenda / histórico
- [ ] Editar o próprio perfil

## Transversais

- [x] Testes de componente (Cypress) cobrindo tudo que foi implementado
- [x] Changelog (`CHANGELOG.md`) atualizado a cada commit
- [x] Migrations versionadas + seed de dados de demonstração

## Como manter este checklist

Atualize este arquivo na mesma sessão/commit em que um item mudar de estado — ao aplicar uma change (`/opsx:apply`) que a implementa, ao decidir deixar algo deliberadamente fora de escopo, ou ao descobrir um item que faltava listar. Mantenha os itens no nível de "funcionalidade por perfil", não desça a detalhe de endpoint — o objetivo é dar uma visão rápida do que já pode ser demonstrado.
