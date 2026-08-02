Documento: **DOC-10**

# AutoAgenda – Plano acadêmico e matriz de rastreabilidade

Correspondência entre as exigências do Projeto Integrador II e os artefatos do AutoAgenda.

| **Produto** | AutoAgenda                                     |
|-------------|------------------------------------------------|
| **Versão**  | 1.0 - Especificação acadêmica                  |
| **Status**  | Base para planejamento, implementação e testes |
| **Data**    | Agosto de 2026                                 |

## 1. Correspondência com as situações-problema

| **Exigência**                | **Artefato previsto**                                     | **Documento de referência** |
|----------------------------------|------------------------------------------------------------------|----------------------------------|
| Revisar escopo/ideia         | Visão, objetivos, atores, MVP e limites.                  | DOC-01                      |
| Revisar UML                  | Casos de uso, classes, sequência e atividades a produzir. | DOC-02, DOC-05              |
| Revisar IHC e protótipo      | Jornadas, telas, estados e design system.                 | DOC-03, DOC-06              |
| Projeto conceitual e lógico  | Entidades, relacionamentos e normalização.                | DOC-05                      |
| Projeto físico e dicionário  | Migrações SQL/ORM e dicionário.                           | DOC-05                      |
| Git                          | Monorepo, histórico e organização.                        | DOC-09                      |
| Front-end funcional          | React, telas, integração e testes.                        | DOC-03                      |
| Back-end em design pattern   | Node.js modular com separação semelhante a MVC/camadas.   | DOC-04                      |
| Testes e tratamento de erros | Plano automatizado e manual.                              | DOC-08                      |
| Cinco avaliadores            | Formulário, evidências e consolidação.                    | DOC-08                      |
| Documentação completa        | Conjunto DOC-00 a DOC-10 e README.                        | Todos                       |
| Vídeo demonstrativo          | Roteiro e checklist.                                      | Este documento               |

## 2. Diagramas UML a produzir

- Diagrama de casos de uso com aluno, instrutor e administrador.

- Diagrama de classes de domínio e persistência.

- Diagrama de sequência para criar agendamento.

- Diagrama de sequência para reagendar com conflito.

- Diagrama de atividades do fluxo de aula.

- Diagrama de estados de appointment.

- Diagrama de componentes com web, API e banco.

- DER lógico e físico.

## 3. Estrutura documental no Git

| **Diretório**         | **Conteúdo**                             |
|--------------------------|------------------------------------------------|
| /docs/01-planejamento | Visão, escopo, requisitos e premissas.   |
| /docs/02-uml          | Fontes e imagens dos diagramas.          |
| /docs/03-ux-ui        | Jornadas, wireframes e protótipo.        |
| /docs/04-banco        | DER, dicionário e decisões.              |
| /docs/05-api          | OpenAPI e decisões do back-end.          |
| /docs/06-testes       | Plano, relatórios e evidências.          |
| /docs/07-avaliacoes   | Cinco formulários e consolidação em PDF. |
| /docs/08-video        | Roteiro, link e versão final.            |

## 4. Matriz de rastreabilidade modelo

| **Regra** | **Requisito** | **API/Tela**                  | **Banco**                             | **Teste**           |
|-------------|------------------|------------------------------------|--------------------------------------------|----------------------------|
| RN-011    | RF-041        | POST /appointments; Nova aula | appointment(student_id, intervalo)    | TST-007             |
| RN-012    | RF-041        | POST /appointments            | appointment(instructor_id, intervalo) | TST-008             |
| RN-013    | RF-041        | POST /appointments            | appointment(vehicle_id, intervalo)    | TST-009             |
| RN-016    | RF-041        | POST /appointments            | Transação/constraint                  | TST-010             |
| RN-018    | RF-043        | POST /appointments/:id/cancel | appointment + audit_event             | TST-013/014         |
| RN-024    | RF-061        | GET /audit-events             | audit_event                           | Testes de auditoria |

## 5. Plano de execução

1.  Validar tema e tecnologias com o professor.

2.  Fechar escopo do MVP e premissas.

3.  Criar repositório e estrutura documental.

4.  Produzir UML, protótipo e modelo de dados.

5.  Implementar autenticação e cadastros base.

6.  Implementar disponibilidade e agendamento transacional.

7.  Implementar agendas e execução da aula.

8.  Implementar testes automatizados e tratamento de erros.

9.  Publicar ambiente de demonstração.

10. Coletar avaliações de cinco pessoas.

11. Corrigir problemas pertinentes e atualizar documentos.

12. Gerar PDF de avaliações e gravar vídeo final.

## 6. Roteiro do vídeo

Como o material apresenta “até cinco minutos” em um trecho e “pelo menos cinco minutos” em outro, o roteiro deve mirar aproximadamente cinco minutos e a duração deve ser confirmada com o tutor.

| **Tempo aproximado** | **Conteúdo**                                       |
|--------------------------|-----------------------------------------------------------|
| 0:00–0:30            | Problema, objetivo e stack.                        |
| 0:30–1:10            | Arquitetura e perfis.                              |
| 1:10–2:20            | Aluno busca e agenda aula.                         |
| 2:20–3:10            | Administrador gerencia aluno, instrutor e veículo. |
| 3:10–3:50            | Instrutor registra presença e conclusão.           |
| 3:50–4:25            | Demonstração de conflito impedido.                 |
| 4:25–5:00            | Testes, cinco avaliações, melhorias e repositório. |

## 7. Checklist final de entrega

- Link do Git acessível ao tutor.

- README com instalação e credenciais fictícias.

- Código do front-end e back-end.

- Migrações, seed e dicionário de dados.

- UML e protótipo atualizados.

- Testes automatizados executáveis.

- Tratamento de erros demonstrável.

- Cinco avaliações com todos os campos mínimos.

- PDF consolidado das avaliações.

- Registro das correções realizadas e justificativas das não aplicadas.

- Vídeo narrado com a solução funcionando.

- Nenhum dado real, segredo ou arquivo .env versionado.

## 8. Pontos para confirmação com o professor

- Autorização para iniciar novo projeto no lugar do Projeto Integrador I não localizado.

- Autorização para usar React/JavaScript no front-end e Node.js/JavaScript no back-end.

- Duração exata esperada do vídeo diante da divergência no material.

- Formato e local oficial de envio, além do link Git.

- Necessidade de implementar todos os módulos ou apenas o MVP documentado.
