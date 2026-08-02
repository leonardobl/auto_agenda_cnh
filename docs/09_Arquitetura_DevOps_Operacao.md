Documento: **DOC-09**

# AutoAgenda – Arquitetura, DevOps e operação

Decisões técnicas, ambientes, configuração, CI/CD e execução reproduzível.

| **Produto** | AutoAgenda                                     |
|-------------|------------------------------------------------|
| **Versão**  | 1.0 - Especificação acadêmica                  |
| **Status**  | Base para planejamento, implementação e testes |
| **Data**    | Agosto de 2026                                 |

## 1. Visão arquitetural

A solução adota cliente web React, API REST Node.js/Express e PostgreSQL. O navegador nunca acessa o banco diretamente. A API centraliza regras, autorização e transações. O projeto pode ser organizado em monorepo para simplificar a entrega acadêmica.

## 2. Estrutura de repositório

| **Caminho**                       | **Conteúdo**                                               |
|--------------------------------------|------------------------------------------------------------------|
| /apps/web                         | Aplicação React.                                           |
| /apps/api                         | API Node.js/Express.                                       |
| /packages/contracts               | Schemas/constantes compartilháveis sem regra de segurança. |
| /docs                             | Documentos, UML, banco, testes e evidências.               |
| /infra                            | Docker, scripts e configuração de implantação.             |
| /.github/workflows ou equivalente | Integração contínua.                                       |
| /README.md                        | Como instalar, configurar, testar e demonstrar.            |

## 3. Ambientes

| **Ambiente**     | **Finalidade**                              | **Dados**                                    |
|--------------------|--------------------------------------------------|----------------------------------------------------|
| Local            | Desenvolvimento individual.                 | Seed fictício.                               |
| Test             | Testes automatizados isolados.              | Gerados e descartáveis.                      |
| Homologação/Demo | Avaliação pelos cinco usuários e professor. | Somente fictícios.                           |
| Produção futura  | Uso real, fora do escopo acadêmico inicial. | Exige privacidade, backup e operação formal. |

## 4. Configurações

| **Variável**                 | **Obrigatória** | **Descrição**                    |
|---------------------------------|--------------------|----------------------------------------|
| NODE_ENV                     | Sim             | development, test ou production. |
| PORT                         | Sim             | Porta da API.                    |
| DATABASE_URL                 | Sim             | Conexão PostgreSQL.              |
| APP_ORIGIN                   | Sim             | Origem permitida do front-end.   |
| SESSION_SECRET ou JWT_SECRET | Sim             | Segredo forte, nunca versionado. |
| TIMEZONE                     | Sim             | America/Fortaleza.               |
| LOG_LEVEL                    | Não             | Nível de log.                    |
| RATE_LIMIT\_\*               | Não             | Parâmetros de limitação.         |

## 5. Requisitos não funcionais

| **ID**  | **Atributo**             | **Critério**                                                                                    |
|-----------|-------------------------------|--------------------------------------------------------------------------------------------------------|
| RNF-001 | Desempenho               | Consultas comuns devem responder em até 2 s no ambiente de demonstração em condições normais.   |
| RNF-002 | Busca de slots           | Busca de até 30 dias deve responder em até 3 s no conjunto acadêmico.                           |
| RNF-003 | Disponibilidade          | Falha de dependência deve gerar erro controlado, sem página branca ou dados parciais.           |
| RNF-004 | Compatibilidade          | Suportar versões atuais de Chrome, Edge e Firefox; Safari recente quando disponível para teste. |
| RNF-005 | Responsividade           | Fluxos críticos utilizáveis entre 320 e 1440 px.                                                |
| RNF-006 | Acessibilidade           | Atender WCAG 2.2 AA nos critérios aplicáveis ao MVP.                                            |
| RNF-007 | Manutenibilidade         | Módulos com responsabilidades claras, lint e testes automatizados.                              |
| RNF-008 | Observabilidade          | Toda requisição recebe correlationId e métricas/logs básicos.                                   |
| RNF-009 | Confiabilidade           | Operações críticas são atômicas e idempotentes quando aplicável.                                |
| RNF-010 | Portabilidade            | Projeto sobe por instruções reproduzíveis, preferencialmente Docker Compose.                    |
| RNF-011 | Segurança                | Atender ao DOC-07 e não possuir segredos no repositório.                                        |
| RNF-012 | Qualidade de dados       | Constraints, FKs e validações protegem integridade.                                             |
| RNF-013 | Localização              | Interface em pt-BR, moeda não necessária no MVP, datas no fuso definido.                        |
| RNF-014 | Escalabilidade acadêmica | Paginação e índices evitam carregamento integral de tabelas.                                    |
| RNF-015 | Recuperação              | Banco de demonstração pode ser reconstruído por migração e seed.                                |

## 6. Pipeline de integração contínua

1.  Instalar dependências usando lockfile.

2.  Executar lint e verificação de formatação.

3.  Executar testes unitários do front e do back.

4.  Subir PostgreSQL temporário e executar migrações.

5.  Executar testes de integração.

6.  Construir front-end e validar inicialização da API.

7.  Opcionalmente executar E2E em branch principal.

8.  Publicar artefato/relatório sem segredos.

## 7. Docker Compose acadêmico

- Serviço db com PostgreSQL e healthcheck.

- Serviço api dependente da prontidão do banco.

- Serviço web configurado com URL pública da API.

- Volumes apenas onde necessários.

- Arquivo .env.example documentado; .env real ignorado.

- Comando único para iniciar e outro para migração/seed.

## 8. Operação e falhas

- Healthcheck de vida não depende de consulta complexa.

- Readiness confirma dependências mínimas antes de receber tráfego.

- Erros são correlacionáveis entre front e back.

- Alteração de banco usa migração; nunca mudança manual não documentada.

- Rollback de implantação e restauração devem ser planejados antes de uso real.

- Dados da demonstração podem ser recriados sem dados pessoais verdadeiros.
