# Diagrama de casos de uso

Casos de uso reais dos três perfis, correspondentes às rotas implementadas em `apps/api/src/routes/`. Não inclui ações que o projeto não implementa (ver `docs/02-uml/estados-appointment.md` para o porquê de não haver reagendar/cancelar).

```mermaid
graph LR
  Aluno((Aluno))
  Instrutor((Instrutor))
  Admin((Administrador))

  Aluno --> UC1[Login/Logout]
  Aluno --> UC2[Editar o próprio perfil]
  Aluno --> UC3[Buscar horário disponível]
  Aluno --> UC4[Agendar aula própria]
  Aluno --> UC5[Ver minha agenda/histórico]

  Instrutor --> UC1
  Instrutor --> UC6[Editar o próprio perfil]
  Instrutor --> UC7[Ver a própria agenda]
  Instrutor --> UC8[Declarar disponibilidade semanal]
  Instrutor --> UC9[Registrar bloqueio pontual]

  Admin --> UC1
  Admin --> UC10[Gerenciar alunos - CRUD + inativar]
  Admin --> UC11[Gerenciar veículos - CRUD + status]
  Admin --> UC12[Gerenciar instrutores - CRUD]
  Admin --> UC13[Conceder acesso de login a um aluno]
  Admin --> UC3
  Admin --> UC14[Agendar aula para qualquer aluno]
  Admin --> UC15[Ver todas as agendas]
  Admin --> UC8
  Admin --> UC9
  Admin --> UC16["Configurações / Auditoria / Relatórios (mockados)"]
  Admin --> UC17[Ver painel com contagens]

  UC4 -.inclui.-> UC3
  UC14 -.inclui.-> UC3
```

**Fora de escopo (Non-Goals já registrados)**: reagendar, cancelar, confirmar presença e concluir aula — nenhum papel tem esses casos de uso hoje (`appointment-scheduling`'s design.md).
