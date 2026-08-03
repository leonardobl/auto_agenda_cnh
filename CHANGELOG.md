# Changelog

Todas as mudanças relevantes deste projeto são documentadas neste arquivo, organizadas por data (AAAA-MM-DD, da mais recente para a mais antiga), em português (pt-BR).

## 2026-08-03

### Adicionado

- Back-end inicial (`apps/api`): servidor Express, health checks (liveness/readiness), tratamento de erros centralizado e validação obrigatória de variáveis de ambiente na inicialização.
- TypeScript no back-end (antes era JavaScript puro), por consistência com o front-end.

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
