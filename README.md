# AutoAgenda

Aplicação web para agendamento de aulas práticas de autoescola (CNH) — projeto acadêmico (Projeto Integrador II). Especificação completa em [docs/](docs/).

## Estrutura do repositório

Monorepo (Yarn workspaces):

```
apps/web/            # front-end (React/Vite) — implementado
apps/api/             # back-end (Node.js) — ainda não implementado
packages/contracts/   # schemas/tipos compartilhados entre web e api — ainda não implementado
docs/                 # especificação acadêmica (DOC-00 a DOC-10)
infra/                # configuração de deploy/Docker — ainda não implementado
```

## Stack

- [Vite](https://vite.dev/) + [React 19](https://react.dev/) + TypeScript (`apps/web`)
- [TailwindCSS](https://tailwindcss.com/) (v3) para estilização
- [React Router](https://reactrouter.com/) para roteamento
- [TanStack Query](https://tanstack.com/query/latest) para estado de servidor/requisições
- [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) para formulários e validação
- [Axios](https://axios-http.com/) para chamadas HTTP
- **Banco de dados**: SQLite local (arquivo em `apps/web/data/app.db`), via módulo nativo `node:sqlite` do Node.js — sem serviço externo/hospedado
- **Backend**: Node.js, no mesmo repositório do front-end (monorepo) — ainda não implementado

> A especificação acadêmica (`docs/04`, `docs/05`, `docs/09`) previa PostgreSQL como banco oficial. O projeto optou por manter SQLite local por enquanto — decisão pendente de confirmação com o professor. Veja a seção "Reconciling with the academic spec" em [CLAUDE.md](CLAUDE.md) para detalhes.

## Pré-requisitos

- Node.js >= 22.5 (necessário para o módulo nativo `node:sqlite`)
- Yarn (o projeto usa `yarn.lock` na raiz, não misture com `npm`/`pnpm`)

## Configuração

1. Instale as dependências a partir da raiz do repositório:
   ```bash
   yarn install
   ```
   Isso instala as dependências de todos os pacotes do monorepo e já cria/configura automaticamente o banco SQLite local em `apps/web/data/app.db` (script `postinstall` de `apps/web`, ver `apps/web/scripts/setup-db.js`). Não é necessário nenhum serviço externo. Para recriar/verificar o banco manualmente:
   ```bash
   yarn workspace @auto-agenda-cnh/web db:setup
   ```
2. (Opcional) Copie o arquivo de variáveis de ambiente de exemplo do front-end, caso precise sobrescrever alguma configuração local (ex.: caminho do banco):
   ```bash
   cp apps/web/.env.example apps/web/.env
   ```
   Atualmente não há nenhuma variável obrigatória — veja `apps/web/.env.example` para as opções disponíveis.

## Comandos

```bash
yarn install                                  # instala tudo + prepara o banco SQLite local (rodar a partir da raiz)
yarn workspace @auto-agenda-cnh/web dev       # inicia o servidor de desenvolvimento do front-end
yarn workspace @auto-agenda-cnh/web build     # gera o build de produção do front-end (type-check + build)
yarn workspace @auto-agenda-cnh/web lint      # roda o ESLint no front-end
yarn workspace @auto-agenda-cnh/web preview   # serve o build de produção do front-end localmente
yarn workspace @auto-agenda-cnh/web db:setup  # cria/verifica o banco SQLite local (roda automaticamente após yarn install)
```

Equivalente mais curto: `yarn --cwd apps/web <comando>`.

## Documentação

- [docs/](docs/) — especificação acadêmica completa (visão, requisitos, back-end, banco de dados, UX/UI, segurança, testes, arquitetura, rastreabilidade). `docs/README.md` explica a estrutura e observa que o DOC-03 (especificação de front-end) nunca foi entregue.
- [CLAUDE.md](CLAUDE.md) — convenções de código, arquitetura e fluxo de trabalho para quem (ou o que) for desenvolver neste repositório.
