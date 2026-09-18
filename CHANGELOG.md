# Changelog

Todas as mudanças relevantes deste projeto são documentadas neste arquivo, organizadas por data (AAAA-MM-DD, da mais recente para a mais antiga), em português (pt-BR).

## 2026-09-11

### Adicionado

- Disponibilidade do instrutor: cada instrutor (ou o Admin em seu nome) pode declarar janelas semanais de disponibilidade e bloqueios pontuais (`GET/POST /instructors/:id/availability`, `GET/POST /instructors/:id/blocks`). Tela real em Instrutor > Disponibilidade.
- Os dois instrutores de demonstração já vêm com disponibilidade semanal semeada (segunda a sexta, 08:00–18:00).

### Alterado

- A busca e a reserva de aulas agora respeitam a disponibilidade declarada do instrutor: um instrutor sem nenhuma janela cadastrada nunca é oferecido, e um bloqueio exclui o instrutor no período correspondente — substituindo a simplificação anterior de que todo instrutor ativo estava sempre disponível.

## 2026-09-09

### Adicionado

- Conta de login para aluno: Admin pode conceder acesso a um aluno já cadastrado (`POST /students/:id/create-account`), revertendo a decisão anterior de que aluno não autentica neste projeto.
- Área do Aluno completa: perfil próprio (`GET/PATCH /students/me`, só telefone editável), Minha agenda e Histórico (mesma listagem de aulas, dividida por data), e agendamento self-service (busca de horários e reserva sem escolher aluno ou categoria — ambos resolvidos automaticamente a partir da conta logada).
- Um aluno de demonstração já vem com conta de login própria, documentado no README junto com as demais credenciais de teste.

### Alterado

- `GET /appointments`, `GET /availability/slots` e `POST /appointments` agora também aceitam o perfil Aluno, escopados server-side ao próprio aluno autenticado.

## 2026-09-08

### Adicionado

- Instrutor > Perfil: cada instrutor logado agora vê os próprios dados e pode editar o telefone de contato (`GET/PATCH /instructors/me`). Nome, documento, registro profissional e status continuam sendo alterados apenas pelo Admin.
- Documentação do critério de escopo do projeto: seção "O que é real vs. simulado" no README, explicando quais telas têm endpoint funcional e quais são simuladas apenas na interface.
- Admin > Início: painel com contagens reais de alunos, instrutores, veículos e aulas agendadas, além dos próximos agendamentos — sem endpoint novo, agregando dados já servidos pelas telas existentes.
- Admin > Configurações, Auditoria e Relatórios (esta última nova, com item no menu): últimas telas pendentes do Admin, implementadas como simulações de interface — sem endpoint novo em `apps/api`. Configurações exibe os valores reais do algoritmo de agendamento; Auditoria mostra eventos de exemplo; Relatórios simula uma exportação.

### Corrigido

- Botão "Sair" (Admin, Instrutor e Aluno): estava travado em um aviso de "ainda não disponível" mesmo com o back-end de logout já funcionando; agora encerra a sessão de verdade e volta para a tela de login.

## 2026-08-29

### Adicionado

- Recuperação de senha (`POST /auth/forgot-password`, `POST /auth/reset-password`): as telas "Esqueci minha senha" e "Redefinir senha" agora funcionam de ponta a ponta. Sem provedor de e-mail configurado, o link de redefinição é registrado no console da API em vez de enviado — ver README para como testar.
- Redefinir a senha agora encerra todas as sessões ativas do usuário, exigindo login novamente.

## 2026-08-25

### Adicionado

- Agenda própria do instrutor (`apps/web`, Instrutor > Minha agenda): cada instrutor logado vê somente as próprias aulas agendadas — primeiro fluxo autenticado fora do perfil Administrador.

### Alterado

- `GET /appointments` (`apps/api`) agora aceita também o perfil Instrutor, retornando apenas as aulas do próprio instrutor autenticado; a listagem passou a incluir os nomes de aluno, instrutor e veículo diretamente na resposta.
- Tela de Admin > Agenda simplificada para usar os nomes já vindos da API, removendo buscas extras que só existiam para resolver esses nomes.

## 2026-08-21

### Adicionado

- Agendamento de aulas (`apps/api`): buscar horários disponíveis e reservar uma aula (`GET /availability/slots`, `POST /appointments`, `GET /appointments`), restrito ao perfil Admin, com detecção real de conflito de horário para aluno, instrutor e veículo.
- Uma aula fictícia semeada automaticamente para demonstração.
- Tela real de Admin > Agenda: busca de horários disponíveis (com categoria preenchida automaticamente a partir do aluno selecionado), reserva e listagem das aulas já agendadas.
- Documento `CHECKLIST.md` com a visão geral do que já foi implementado por perfil (Aluno/Instrutor/Administrador) e do que ainda falta.

## 2026-08-11

### Adicionado

- Gestão de instrutores (`apps/api`): cadastrar (cria conta de login e perfil juntos, numa operação atômica), listar (com paginação, busca e filtro por status), consultar e editar instrutores (`/instructors`), restrito ao perfil Admin.
- Dois instrutores fictícios semeados automaticamente para demonstração, cada um com sua própria conta de login.
- Tela real de Admin > Instrutores: listagem (com e-mail vinculado), cadastro e edição em modal.

## 2026-08-05

### Adicionado

- Gestão de veículos (`apps/api`): cadastrar, listar (com paginação, busca e filtro por status), consultar e editar veículos (`/vehicles`), restrito ao perfil Admin. Diferente de alunos, o status (Ativo/Manutenção/Inativo) é alterado diretamente pela edição, sem ação separada de inativação.
- Três veículos fictícios semeados automaticamente para demonstração, um deles em manutenção.
- Tela real de Admin > Veículos: listagem, cadastro e edição em modal.

## 2026-08-04

### Adicionado

- Gestão de alunos (`apps/api`): cadastrar, listar (com paginação, busca e filtro por status), consultar, editar e inativar alunos (`/students`), restrito ao perfil Admin.
- Categorias de CNH (A, B, AB, C, D, E) semeadas automaticamente e consultáveis via `/license-categories`, usadas no cadastro de aluno.
- Cinco alunos fictícios semeados automaticamente para demonstração.
- Tela real de Admin > Alunos: listagem, cadastro e edição em modal, e inativação com confirmação.

## 2026-08-03

### Adicionado

- Back-end inicial (`apps/api`): servidor Express, health checks (liveness/readiness), tratamento de erros centralizado e validação obrigatória de variáveis de ambiente na inicialização.
- TypeScript no back-end (antes era JavaScript puro), por consistência com o front-end.
- Autenticação de verdade (`POST /auth/login`, `POST /auth/logout`, `GET /me`): sessão em token retornado no corpo da resposta, guardado no `sessionStorage` do front-end e enviado via cabeçalho `Authorization`.
- Mecanismo de migrations versionadas do banco de dados (tabelas `user` e `session`) e um usuário de demonstração semeado automaticamente (`admin@autoagenda.local`), documentado no `README.md`.
- Tela de login integrada ao back-end de verdade (antes só exibia um aviso de "em breve"), com redirecionamento para a área do perfil autenticado.

### Alterado

- Banco de dados SQLite migrado de `apps/web` para `apps/api` — o front-end não cria nem acessa mais o banco diretamente.

## 2026-08-02

### Adicionado

- Setup inicial do projeto: Vite + React + TypeScript, TailwindCSS v3, banco SQLite local.
- Reestruturação em monorepo (`apps/web`, `apps/api`, `packages/contracts`) e inclusão da especificação acadêmica (`docs/`).
- Shell da aplicação web: roteamento, providers globais (React Query, toasts) e navegação por perfil (Aluno/Instrutor/Administrador).
- Telas de autenticação: login, esqueci minha senha e redefinir senha, com validação (react-hook-form + zod) e controle de logout nos layouts de perfil.
- Primitivos de formulário reutilizáveis (`Button`, `TextField`).
- Utilitário `mergeClassNames` (clsx + tailwind-merge) para composição segura de classes Tailwind.
- Configuração de testes de componente com Cypress (unitário/integração) e primeiros testes.
- Changelog do projeto.
