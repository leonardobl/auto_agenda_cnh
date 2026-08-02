Documento: **DOC-00**

# AutoAgenda – Índice geral da documentação

Mapa dos documentos, decisões de escopo e convenções usadas em todo o projeto.

| **Produto** | AutoAgenda                                     |
|-------------|------------------------------------------------|
| **Versão**  | 1.0 - Especificação acadêmica                  |
| **Status**  | Base para planejamento, implementação e testes |
| **Data**    | Agosto de 2026                                 |

## 1. Finalidade deste conjunto

Este conjunto especifica, de forma separada e rastreável, o produto acadêmico AutoAgenda: uma aplicação web para organizar e automatizar aulas práticas de uma autoescola. Cada documento possui uma responsabilidade própria para impedir que decisões de negócio, interface, implementação e testes sejam misturadas ou interpretadas de formas diferentes.

## 2. Documentos

| **Código** | **Documento**                         | **Responsabilidade**                                               |
|------------|----------------------------------------|----------------------------------------------------------------------|
| DOC-01     | Visão, escopo e requisitos de negócio | Problema, objetivos, atores, limites, indicadores e regras gerais. |
| DOC-02     | Requisitos funcionais e casos de uso  | Comportamentos observáveis do sistema e fluxos completos.          |
| DOC-03     | Especificação do front-end            | Rotas, telas, estados, componentes, formulários e integração.      |
| DOC-04     | Especificação do back-end e API       | Arquitetura Node.js, contratos REST, validações, erros e serviços. |
| DOC-05     | Banco de dados e dicionário de dados  | Entidades, atributos, relacionamentos, integridade e índices.      |
| DOC-06     | UX, UI e acessibilidade               | Jornadas, arquitetura da informação, design system e WCAG.         |
| DOC-07     | Segurança, privacidade e auditoria    | Autenticação, autorização, proteção de dados e registros.          |
| DOC-08     | Testes e qualidade                    | Estratégia, casos de teste, cinco avaliadores e evidências.        |
| DOC-09     | Arquitetura, DevOps e operação        | Estrutura técnica, ambientes, configuração, CI e implantação.      |
| DOC-10     | Plano acadêmico e rastreabilidade     | Aderência ao PDF, entregáveis, Git, vídeo e checklist final.       |

## 3. Escopo oficial adotado

- Aplicação web responsiva, priorizando o uso em celular.

- Front-end em React com JavaScript; HTML semântico e CSS responsivo.

- Back-end em Node.js com Express e API REST.

- Banco de dados relacional PostgreSQL.

- Perfis: administrador/atendente, instrutor e aluno.

- Objeto central: agendamento de aula prática com aluno, instrutor, veículo, data, horário e situação.

## 4. Classificação de prioridade

| **Classe**            | **Significado**                                                                      |
|------------------------|----------------------------------------------------------------------------------------|
| MVP - Obrigatório     | Necessário para demonstrar a solução funcional e atender à entrega acadêmica.        |
| Evolução - Importante | Valioso, mas pode ser implementado após o MVP sem impedir a avaliação principal.     |
| Fora do escopo        | Não será construído nesta versão; fica registrado para evitar expectativa implícita. |

## 5. Convenções de requisitos

- RN: regra de negócio.

- RF: requisito funcional.

- RNF: requisito não funcional.

- FE: requisito específico do front-end.

- BE: requisito específico do back-end.

- BD: requisito de banco de dados.

- UX: requisito de experiência, interface ou acessibilidade.

- SEG: requisito de segurança ou privacidade.

- TST: requisito ou caso de teste.

## 6. Premissas que exigem validação

- A autoescola autoriza o administrador a cadastrar alunos, instrutores e veículos.

- O sistema gerencia aulas práticas, não substitui sistemas oficiais do órgão de trânsito.

- A duração padrão de uma aula será configurável, inicialmente em 50 minutos.

- Notificações externas por WhatsApp, SMS ou e-mail são evolução; o MVP exibe notificações dentro do sistema.

- Pagamentos, emissão fiscal, aulas teóricas, exames oficiais e integração com órgãos públicos estão fora do MVP.
