# auto_agenda_cnh

Aplicação web para agendamento automático de exames/serviços de CNH.

## Stack

- [Vite](https://vite.dev/) + [React 19](https://react.dev/) + TypeScript
- [TailwindCSS](https://tailwindcss.com/) (v3) para estilização
- [React Router](https://reactrouter.com/) para roteamento
- [TanStack Query](https://tanstack.com/query/latest) para estado de servidor/requisições
- [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) para formulários e validação
- [Axios](https://axios-http.com/) para chamadas HTTP
- **Banco de dados**: SQLite local (arquivo em `data/app.db`), via módulo nativo `node:sqlite` do Node.js — sem serviço externo/hospedado
- **Backend**: Node.js, no mesmo projeto do front-end (monolito) — ainda não implementado

## Pré-requisitos

- Node.js >= 22.5 (necessário para o módulo nativo `node:sqlite`)
- Yarn (o projeto usa `yarn.lock`, não misture com `npm`/`pnpm`)

## Configuração

1. Instale as dependências:
   ```bash
   yarn install
   ```
   Isso já cria e configura automaticamente o banco SQLite local em `data/app.db` (script `postinstall`, ver `scripts/setup-db.js`). Não é necessário nenhum serviço externo. Para recriar/verificar o banco manualmente:
   ```bash
   yarn db:setup
   ```
2. (Opcional) Copie o arquivo de variáveis de ambiente de exemplo, caso precise sobrescrever alguma configuração local (ex.: caminho do banco):
   ```bash
   cp .env.example .env
   ```
   Atualmente não há nenhuma variável obrigatória — veja `.env.example` para as opções disponíveis.

## Comandos

```bash
yarn dev       # inicia o servidor de desenvolvimento
yarn build     # gera o build de produção (type-check + build)
yarn lint      # roda o ESLint
yarn preview   # serve o build de produção localmente
yarn db:setup  # cria/verifica o banco SQLite local (roda automaticamente após yarn install)
```

## Contribuindo

Convenções de código, arquitetura e fluxo de trabalho estão documentados em [CLAUDE.md](CLAUDE.md).
