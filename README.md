# AutoAgenda

Aplicação web para agendamento de aulas práticas de autoescola (CNH) — projeto acadêmico (Projeto Integrador II). Especificação completa em [docs/](docs/).

A raiz (`/`) é a página institucional pública da autoescola fictícia (Auto Escola Rota Certa) — sobre, serviços, galeria e contato. O botão "Entrar" no cabeçalho leva ao login de cada perfil (Admin, Instrutor, Aluno).

## Sobre o escopo deste projeto

Este é um entregável acadêmico, não um produto em produção — o objetivo é demonstrar entendimento dos requisitos e um funcionamento real das partes centrais, não implementar 100% do que a especificação (`docs/`) descreve. Algumas peças de apoio são deliberadamente simplificadas ou fixadas em código (ex.: configurações de horário/duração/antecedência do agendamento são constantes no código, não uma tela administrativa) em vez de ganharem CRUD/tela próprios — cada decisão desse tipo fica registrada no `design.md` da change correspondente (arquivado em `openspec/changes/archive/`, fora do controle de versão) e, quando relevante para quem só olha o código, também aqui e em [CLAUDE.md](CLAUDE.md). O critério é sempre o mesmo: o que está implementado deve funcionar de verdade (login, cadastros, o motor de agendamento), mesmo que nem toda tela/fluxo secundário da especificação exista.

### O que é real vs. simulado

Este projeto não implementa um back-end de verdade para toda tela/endpoint que a especificação (`docs/`) descreve — isso deixaria o projeto muito mais robusto do que um Projeto Integrador II precisa ser. Para as áreas ainda pendentes, a estratégia é: uma ou outra funcionalidade ganha endpoint real (quando ensina algo distinto), e o restante é simulado só na interface (toast de sucesso, dado fixo em tela), sem chamada real ao `apps/api`, deixado assim de propósito e não como algo "para terminar depois". Panorama atual:

**Real, com endpoint funcional em `apps/api`:**
- Autenticação (login/logout, recuperação de senha)
- Gestão de alunos, veículos e instrutores (Admin)
- Agendamento de aulas (busca de horários + reserva, com detecção real de conflito de aluno/instrutor/veículo, respeitando a disponibilidade declarada do instrutor)
- Agenda do instrutor (somente leitura, escopada por instrutor)
- Instrutor > Editar perfil (escopo mínimo: só telefone) e Disponibilidade (janelas semanais e bloqueios pontuais)
- Admin > Painel/dashboard (agrega dados já existentes via `/students`, `/instructors`, `/vehicles`, `/appointments`, sem endpoint novo)
- Conta de login do aluno (concedida pelo Admin) e área completa do Aluno: perfil próprio, agendamento self-service, minha agenda e histórico

**Simulado apenas na interface (sem endpoint em `apps/api`), o código sinaliza com um comentário `// mocked: ...` no ponto de chamada:**
- Admin > Configurações — exibe os valores reais do algoritmo de agendamento; "salvar" não persiste
- Admin > Auditoria — tabela com eventos fictícios fixos, sem consulta real
- Admin > Relatórios — botão de exportação simula sucesso, nenhum arquivo é gerado
- Página institucional (`/`) — site público de divulgação da autoescola: texto e dados de contato fictícios, galeria com ilustrações locais em vez de fotos reais, links de WhatsApp/redes sociais no formato real mas com número/handles fictícios; nenhum formulário é submetido a um back-end

## Estrutura do repositório

Monorepo (Yarn workspaces):

```
apps/web/            # front-end (React/Vite) — implementado
apps/api/             # back-end (Node.js/Express) — implementado (infraestrutura, autenticação, alunos, veículos, instrutores e agendamento)
packages/contracts/   # schemas/tipos compartilhados entre web e api — ainda não implementado
docs/                 # especificação acadêmica (DOC-00 a DOC-10)
infra/                # configuração de deploy/Docker — ainda não implementado
```

## Arquitetura do back-end (MVC)

`apps/api` segue o padrão **MVC** (Model – View – Controller, com um Router à frente do Controller). Como a API responde JSON e não HTML, a **View** é a camada que monta o corpo da resposta.

```
Usuário ──requisição HTTP──▶ Router ──▶ Controller ◀──dados──▶ Model ──▶ SQLite
   ▲                                        │
   └────────────── JSON ◀──── View ◀────────┘
```

| Camada MVC | Diretório (`apps/api/src/`) | O que faz |
| ---------- | --------------------------- | --------- |
| **Router** | `routes/` (+ `middlewares/`) | Associa método + caminho a middlewares de autenticação/perfil (`requireAuth`, `requireRole`) e a um método do controller. |
| **Controller** | `controllers/` | Lê a requisição (params, query, body, usuário logado), chama o Model e escolhe a View que monta a resposta. Não contém regra de negócio nem SQL. |
| **Model** | `models/` | `*Model.ts`: acesso ao banco (SQL puro, um por tabela). `*Service.ts`: regras de negócio, validações e transações de cada caso de uso (ex.: detecção de conflito de horário no agendamento). |
| **View** | `views/` | Funções puras que definem o JSON devolvido (`presentStudent`, `presentPage`, `presentError`…), listando cada campo explicitamente — nada sai da API sem estar nomeado aqui. |

Exemplo (`GET /students/:id`): `routes/studentRoutes.ts` → `controllers/studentController.ts` → `models/studentService.ts` (valida) → `models/studentModel.ts` (SQL) → `views/studentView.ts` (JSON).

Os testes do back-end (`yarn workspace @auto-agenda-cnh/api test`) sobem a aplicação real sobre um SQLite em memória, chamam cada endpoint e comparam a resposta com um *snapshot* — qualquer mudança de comportamento HTTP faz o teste falhar.

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

O seed também cadastra cinco alunos fictícios (visíveis em Admin > Alunos após o login), três veículos fictícios — um deles em manutenção (visíveis em Admin > Veículos) —, dois instrutores fictícios, cada um com sua própria conta de login (visíveis em Admin > Instrutores), e as seis categorias de CNH (A, B, AB, C, D, E), usadas nos seletores de categoria dos cadastros:

| E-mail | Senha | Perfil |
|---|---|---|
| `instrutor1@autoagenda.local` | `Demo@123` | `INSTRUCTOR` |
| `instrutor2@autoagenda.local` | `Demo@123` | `INSTRUCTOR` |

Uma aula de demonstração já vem agendada (Ana Beatriz Souza / Fábio Ramos Teixeira / ABC1D23), visível em Admin > Agenda. Dos cinco alunos fictícios, um já vem com conta de login própria — os demais podem ganhar acesso pelo Admin (ver "Testando o self-service do aluno" abaixo):

| E-mail | Senha | Perfil |
|---|---|---|
| `aluno1@autoagenda.local` | `Demo@123` | `STUDENT` |

### Testando o self-service do aluno

Aluno agenda a própria aula, sem escolher aluno ou categoria — ambos são resolvidos automaticamente a partir da conta logada. Faça login com a conta de demonstração acima (ou crie uma nova em Admin > Alunos > "Criar acesso", para qualquer aluno que ainda não tenha conta) e acesse:

- **Perfil**: dados cadastrais (somente leitura) e edição do telefone de contato.
- **Agendar aula**: busca de horários (só data/duração, sem seletor de aluno/categoria) e reserva.
- **Minha agenda** / **Histórico**: mesma listagem de aulas do aluno, dividida por data (futuras / passadas).

### Testando a recuperação de senha

Este projeto não tem integração com nenhum provedor de e-mail. Ao solicitar "Esqueci minha senha" (`/esqueci-senha`) para um e-mail existente, o link de redefinição não é enviado por e-mail — ele é registrado no console/terminal onde a API (`apps/api`) está rodando, no formato:

```
Password reset link for admin@autoagenda.local: http://localhost:5173/redefinir-senha?token=...
```

Copie esse link para o navegador para concluir a redefinição de senha. A resposta da API é sempre a mesma mensagem genérica, exista ou não o e-mail informado (SEG-005) — só o console revela se um link foi de fato gerado.

### Testando o agendamento (Admin > Agenda)

Depois de logar como Admin, acesse **Agenda** no menu: selecione um aluno (a categoria é preenchida automaticamente a partir do cadastro dele), ajuste o período e a duração, clique em **Buscar horários** e depois em **Reservar** em qualquer horário da lista — a busca já considera horário de funcionamento, antecedência mínima, disponibilidade declarada do instrutor e conflitos reais de aluno/instrutor/veículo. Configurações como horário de funcionamento e antecedência são constantes fixas no back-end (`apps/api/src/modules/appointments/appointmentService.ts`) nesta versão, não uma tela administrativa — ver "Sobre o escopo deste projeto" acima.

Os dois instrutores de demonstração já vêm com disponibilidade semanal semeada (segunda a sexta, 08:00–18:00 UTC — sem provedor de fuso horário, os horários exibidos na interface seguem o fuso do navegador). Um instrutor sem nenhuma janela cadastrada nunca é oferecido para agendamento. Para testar isso: faça login como instrutor (`instrutor1@autoagenda.local` / `Demo@123`), acesse **Disponibilidade** no menu, cadastre uma nova janela semanal ou um bloqueio pontual (com motivo) e volte para Admin > Agenda para ver a busca refletir a mudança.

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
yarn workspace @auto-agenda-cnh/api test      # roda os testes do back-end (node:test, SQLite em memória)
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
