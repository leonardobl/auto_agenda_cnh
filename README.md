# AutoAgenda

Aplicação web para agendamento de aulas práticas de autoescola (CNH) — projeto acadêmico (Projeto Integrador II). Especificação completa em [docs/](docs/).

## Estrutura do repositório

Monorepo (Yarn workspaces):

```
apps/web/            # front-end (React/Vite) — implementado
apps/api/             # back-end (Node.js/Express) — implementado (infraestrutura + autenticação: login/logout/perfil)
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
- [Cypress](https://www.cypress.io/) (component testing) para testes unitários/integração do front-end
- [Express](https://expressjs.com/) + TypeScript (`apps/api`) — roda nativamente no Node (type-stripping), sem bundler
- **Banco de dados**: SQLite local (arquivo em `apps/api/data/app.db`), via módulo nativo `node:sqlite` do Node.js — SQL puro, sem ORM/query builder, sem serviço externo/hospedado
- **Backend**: Node.js/Express, no mesmo repositório do front-end (monorepo)

> A especificação acadêmica (`docs/04`, `docs/05`, `docs/09`) previa PostgreSQL como banco oficial e JavaScript puro no back-end. O projeto optou por manter SQLite local e usar TypeScript no back-end (consistência com o front-end) — decisões pendentes de confirmação com o professor. Veja a seção "Reconciling with the academic spec" em [CLAUDE.md](CLAUDE.md) para detalhes.

## Pré-requisitos

- Node.js >= 22.5 (necessário para o módulo nativo `node:sqlite` e para `--env-file-if-exists`)
- Yarn (o projeto usa `yarn.lock` na raiz, não misture com `npm`/`pnpm`)

## Configuração

1. Instale as dependências a partir da raiz do repositório:
   ```bash
   yarn install
   ```
   Isso instala as dependências de todos os pacotes do monorepo e já cria/configura automaticamente o banco SQLite local em `apps/api/data/app.db` (script `postinstall` de `apps/api`, ver `apps/api/scripts/setup-db.ts`): aplica as migrations versionadas em `apps/api/src/database/migrations/` e semeia um usuário de demonstração (ver abaixo). Não é necessário nenhum serviço externo. Para recriar/verificar o banco manualmente (idempotente — seguro rodar de novo):
   ```bash
   yarn workspace @auto-agenda-cnh/api db:setup
   ```
2. Copie o arquivo de variáveis de ambiente de exemplo do back-end e ajuste se necessário:
   ```bash
   cp apps/api/.env.example apps/api/.env
   ```
   | Variável | Obrigatória | Descrição |
   |---|---|---|
   | `NODE_ENV` | Sim | `development`, `test` ou `production`. |
   | `PORT` | Sim | Porta em que a API escuta. |
   | `APP_ORIGIN` | Sim | Origem do front-end permitida via CORS. |
   | `DB_PATH` | Não | Sobrescreve o caminho do arquivo SQLite (padrão: `data/app.db`). |

   O servidor recusa iniciar (fail-fast) se `NODE_ENV`, `PORT` ou `APP_ORIGIN` estiverem ausentes ou inválidos.
3. Copie o arquivo de variáveis de ambiente de exemplo do front-end e ajuste se necessário:
   ```bash
   cp apps/web/.env.example apps/web/.env
   ```
   | Variável | Obrigatória | Descrição |
   |---|---|---|
   | `VITE_API_BASE_URL` | Sim | URL base da API (`apps/api`) que o front-end consome. |

### Login de demonstração

O seed cria um usuário fictício para testar o login sem precisar inserir dados manualmente no banco:

| E-mail | Senha | Perfil |
|---|---|---|
| `admin@autoagenda.local` | `Demo@123` | `ADMIN` |

## Comandos

```bash
yarn install                                  # instala tudo + prepara o banco SQLite local (rodar a partir da raiz)

# Front-end
yarn workspace @auto-agenda-cnh/web dev       # inicia o servidor de desenvolvimento do front-end
yarn workspace @auto-agenda-cnh/web build     # gera o build de produção do front-end (type-check + build)
yarn workspace @auto-agenda-cnh/web lint      # roda o ESLint no front-end
yarn workspace @auto-agenda-cnh/web preview   # serve o build de produção do front-end localmente
yarn workspace @auto-agenda-cnh/web test      # roda os testes de componente (Cypress, headless)
yarn workspace @auto-agenda-cnh/web test:open # roda os testes de componente (Cypress, interativo)

# Back-end
yarn workspace @auto-agenda-cnh/api dev       # inicia a API em modo desenvolvimento (auto-restart, roda .ts nativamente)
yarn workspace @auto-agenda-cnh/api start     # inicia a API em modo produção
yarn workspace @auto-agenda-cnh/api build     # type-check (tsc --noEmit) — sem bundler, não gera nada
yarn workspace @auto-agenda-cnh/api lint      # roda o ESLint no back-end
yarn workspace @auto-agenda-cnh/api db:setup  # cria/verifica o banco SQLite local (roda automaticamente após yarn install)
```

Equivalente mais curto: `yarn --cwd apps/web <comando>` ou `yarn --cwd apps/api <comando>`.

Com a API rodando (`yarn workspace @auto-agenda-cnh/api dev`), verifique com:
```bash
curl http://localhost:3333/health      # liveness
curl http://localhost:3333/health/db   # readiness (banco de dados)

# Login com o usuário de demonstração (ver acima) — retorna um token de sessão
curl -X POST http://localhost:3333/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@autoagenda.local","password":"Demo@123"}'

# Perfil do usuário autenticado (substitua <token> pelo token retornado acima)
curl http://localhost:3333/me -H 'Authorization: Bearer <token>'

# Encerra a sessão
curl -X POST http://localhost:3333/auth/logout -H 'Authorization: Bearer <token>'
```

## Documentação

- [docs/](docs/) — especificação acadêmica completa (visão, requisitos, back-end, banco de dados, UX/UI, segurança, testes, arquitetura, rastreabilidade). `docs/README.md` explica a estrutura e observa que o DOC-03 (especificação de front-end) nunca foi entregue.
- [CLAUDE.md](CLAUDE.md) — convenções de código, arquitetura e fluxo de trabalho para quem (ou o que) for desenvolver neste repositório.
