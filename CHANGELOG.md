# Changelog

Todas as mudanças relevantes deste projeto são documentadas neste arquivo, organizadas por data (AAAA-MM-DD, da mais recente para a mais antiga), em português (pt-BR).

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
