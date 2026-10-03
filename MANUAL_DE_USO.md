# Manual de uso — AutoAgenda

Este manual explica como usar o sistema depois de instalado (ver "Configuração" no [README.md](README.md) para o passo a passo de instalação e as credenciais de demonstração).

## Login

Acesse `/login` e entre com um dos usuários de demonstração (ver README, seção "Login de demonstração"). O sistema identifica o perfil pelo usuário e leva você diretamente ao painel correspondente (`/admin`, `/instrutor` ou `/aluno`).

## Administrador

- **Início**: contagens gerais (alunos, instrutores, veículos, aulas agendadas) e os próximos agendamentos.
- **Alunos**: cadastrar um novo aluno, buscar/filtrar por nome ou documento, filtrar por status, editar dados, inativar (nunca é excluído) e, na tela de edição, conceder acesso de login a um aluno que ainda não tem conta.
- **Instrutores**: cadastrar um instrutor (já cria a conta de login dele), buscar/filtrar, editar dados de perfil.
- **Veículos**: cadastrar, buscar/filtrar, editar (inclusive mudar o status para `MAINTENANCE`/`INACTIVE`, o que tira o veículo das buscas de agendamento).
- **Agenda**: escolher um aluno e a categoria de CNH dele, buscar horários disponíveis (respeitando expediente, disponibilidade do instrutor e conflitos existentes) e reservar uma aula em nome desse aluno.
- **Configurações / Auditoria / Relatórios**: telas de demonstração — mostram dados fixos ou simulam uma ação (ex.: "salvar" ou "exportar"), sem back-end real por trás. Isso está sinalizado na própria tela e em "O que é real vs. simulado" no README.

## Instrutor

- **Início**.
- **Minha agenda**: lista só as suas próprias aulas.
- **Disponibilidade**: declare os dias e horários da semana em que você está disponível (ex.: segunda a sexta, 08:00–18:00) e registre bloqueios pontuais (ex.: uma consulta médica numa data/horário específico). Um instrutor sem nenhuma disponibilidade declarada nunca aparece nas buscas de horário — é assim de propósito.
- **Perfil**: você só pode alterar o seu telefone; os demais dados são mantidos pelo Administrador.

## Aluno

- **Início**.
- **Agendar aula**: busque um horário disponível (a categoria da sua CNH já é considerada automaticamente — você não escolhe a categoria nem agenda em nome de outro aluno) e confirme a reserva.
- **Minha agenda / Histórico**: suas aulas futuras e passadas.
- **Perfil**: só o telefone é editável.

## O que o sistema não faz (por decisão de escopo)

- Não há reagendar, cancelar, confirmar presença ou concluir uma aula — toda aula reservada permanece "Agendada". Essa é uma redução deliberada de escopo para o projeto acadêmico, documentada em `docs/02-uml/estados-appointment.md` e no `CHECKLIST.md`.
- As telas de Configurações, Auditoria e Relatórios do Administrador são simulações de interface, não conectadas a um back-end real.

## Esqueci minha senha

Na tela de login, use "Esqueci minha senha". Como este projeto não tem um provedor de e-mail configurado, o link de redefinição é escrito no console (terminal) onde a API está rodando, em vez de ser enviado por e-mail — copie esse link do terminal para continuar.
