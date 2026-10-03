# Jornadas por perfil

Cada jornada corresponde a telas e endpoints realmente implementados. Capturas em `capturas/`.

## Administrador

1. **Login** (`/login`) → painel (`/admin`) com contagens de alunos/instrutores/veículos/aulas e próximos agendamentos — `capturas/02-admin-dashboard.png`.
2. **Alunos** (`/admin/alunos`): listar/buscar/filtrar, cadastrar, editar, inativar, conceder acesso de login.
3. **Instrutores** (`/admin/instrutores`) e **Veículos** (`/admin/veiculos`): CRUD equivalente.
4. **Agenda** (`/admin/agenda`): escolhe aluno e categoria, busca horários (`GET /availability/slots`) e reserva (`POST /appointments`) — `capturas/03-admin-agenda.png`.
5. **Configurações / Auditoria / Relatórios**: telas mockadas na UI, sem endpoint real (ver "O que é real vs. simulado" no `README.md`).

## Instrutor

1. **Login** → início (`/instrutor`) — `capturas/04-instrutor-inicio.png`.
2. **Minha agenda**: lista as próprias aulas (`GET /appointments`, escopado no servidor).
3. **Disponibilidade** (`/instrutor/disponibilidade`): declara janelas semanais e bloqueios pontuais — `capturas/05-instrutor-disponibilidade.png`.
4. **Perfil**: edita apenas o telefone.

## Aluno

1. **Login** → início (`/aluno`) — `capturas/06-aluno-inicio.png`.
2. **Agendar aula** (`/aluno/agendar-aula`): busca horário (sem escolher aluno/categoria — sempre a própria conta) e reserva — `capturas/07-aluno-agendar.png`.
3. **Minha agenda / Histórico**: mesma fonte de dados, dividida por data.
4. **Perfil**: edita apenas o telefone.

## Visitante

1. **Página institucional** (`/`) — divulgação da autoescola, 100% front-end — `capturas/00-institucional.png`.
2. **Login** (`/login`) — `capturas/01-login.png`.
