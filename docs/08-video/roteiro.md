# Roteiro do vídeo demonstrativo

`docs/10_Plano_Academico_Rastreabilidade.md` §6 registra a divergência do PDF: um trecho pede "até cinco minutos", outro "pelo menos cinco minutos". Este roteiro mira ~5 minutos; **confirme a duração exata com o tutor antes de gravar** (ver `docs/10` §8).

Adaptado aos fluxos reais do sistema — não inclui presença/conclusão de aula nem reagendamento (Non-Goals, ver `docs/02-uml/estados-appointment.md`).

| Tempo | Conteúdo | Onde mostrar |
|---|---|---|
| 0:00–0:30 | Problema (agendamento manual em autoescola), objetivo e stack (React/Vite, Node/Express em MVC, PostgreSQL) | Slide ou fala sobre o README |
| 0:30–1:10 | Arquitetura: monorepo, MVC no back-end, 3 perfis | `docs/02-uml/componentes.md`, README "Arquitetura do back-end (MVC)" |
| 1:10–2:10 | Aluno faz login, busca e agenda uma aula (self-service, sem escolher aluno/categoria) | `/login` → `/aluno/agendar-aula` |
| 2:10–3:00 | Administrador: gerencia um aluno (cadastro/edição), um instrutor e um veículo; agenda uma aula em nome de um aluno | `/admin/alunos`, `/admin/instrutores`, `/admin/veiculos`, `/admin/agenda` |
| 3:00–3:40 | Instrutor: própria agenda e disponibilidade semanal/bloqueios | `/instrutor`, `/instrutor/disponibilidade` |
| 3:40–4:20 | Demonstração de conflito impedido: tentar reservar o mesmo horário duas vezes → segunda tentativa recebe erro | `/admin/agenda`, reservando duas vezes o mesmo slot |
| 4:20–5:00 | Testes automatizados rodando (`yarn workspace @auto-agenda-cnh/api test`, 27/27), estrutura no Git, próximos passos (5 avaliações) | Terminal + `openspec/changes/archive/` |

## Segundo vídeo (pós-avaliações)

Depois de coletar o feedback dos 5 avaliadores e aplicar as correções pertinentes (`docs/07-avaliacoes`), gravar um segundo vídeo curto mostrando especificamente o que mudou — não precisa repetir a demonstração completa.

## Status

- [ ] Vídeo 1 gravado (demonstração da solução funcionando)
- [ ] Link/arquivo do vídeo 1 salvo aqui
- [ ] Vídeo 2 gravado (mudanças pós-feedback)
- [ ] Link/arquivo do vídeo 2 salvo aqui
