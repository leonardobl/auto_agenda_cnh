Documento: **DOC-08**

# AutoAgenda – Plano completo de testes e qualidade

Estratégia automatizada, testes manuais, validação com cinco pessoas e evidências.

| **Produto** | AutoAgenda                                     |
|-------------|------------------------------------------------|
| **Versão**  | 1.0 - Especificação acadêmica                  |
| **Status**  | Base para planejamento, implementação e testes |
| **Data**    | Agosto de 2026                                 |

## 1. Objetivos de qualidade

- Confirmar aderência aos requisitos e regras de negócio.

- Impedir regressões nos fluxos críticos.

- Comprovar autorização e isolamento de dados.

- Validar usabilidade e acessibilidade com pessoas.

- Produzir evidências reproduzíveis para o Projeto Integrador.

## 2. Pirâmide de testes

| **Nível**            | **Escopo**                                                                    | **Ferramentas sugeridas**          |
|-------------------------|------------------------------------------------------------------------------------|------------------------------------------|
| Unitário             | Regras puras, schemas, cálculo de intervalo, estados e casos de uso isolados. | Vitest/Jest.                       |
| Integração back-end  | API + banco de teste; autenticação, constraints, transações e autorização.    | Supertest + PostgreSQL de teste.   |
| Componente front-end | Formulários, estados, acessibilidade e interações.                            | React Testing Library + Vitest.    |
| E2E                  | Fluxos completos nos três perfis.                                             | Cypress ou Playwright.             |
| Manual/usabilidade   | Execução por cinco avaliadores e registro de feedback.                        | Formulário padronizado + capturas. |

## 3. Casos de teste mínimos

| **ID**  | **Cenário**                | **Resultado esperado**                                                    |
|-----------|--------------------------------|----------------------------------------------------------------------------------|
| TST-001 | Login válido               | Usuário ativo entra e chega ao painel correto.                            |
| TST-002 | Login inválido             | Mensagem genérica; nenhuma sessão criada.                                 |
| TST-003 | Autorização aluno          | Aluno não consulta cadastro ou aula de terceiro.                          |
| TST-004 | Cadastro de aluno          | Dados válidos persistem e aparecem na lista.                              |
| TST-005 | E-mail duplicado           | API retorna conflito; front associa a mensagem.                           |
| TST-006 | Disponibilidade            | Busca retorna apenas slots dentro do expediente e da agenda do instrutor. |
| TST-007 | Conflito de aluno          | Aula sobreposta é rejeitada.                                              |
| TST-008 | Conflito de instrutor      | Aula sobreposta é rejeitada.                                              |
| TST-009 | Conflito de veículo        | Aula sobreposta é rejeitada.                                              |
| TST-010 | Concorrência               | Duas confirmações para o mesmo recurso resultam em apenas uma aula.       |
| TST-011 | Reagendamento válido       | Novo horário confirmado e histórico registrado.                           |
| TST-012 | Reagendamento inválido     | Original permanece intacto.                                               |
| TST-013 | Cancelamento no prazo      | Estado muda, horário é liberado e auditoria criada.                       |
| TST-014 | Cancelamento fora do prazo | Aluno é impedido; administrador segue com justificativa.                  |
| TST-015 | Bloqueio de instrutor      | Intervalo deixa de aparecer em novas buscas.                              |
| TST-016 | Manutenção de veículo      | Veículo não aparece; aulas existentes são sinalizadas.                    |
| TST-017 | Transição inválida         | Aula concluída não volta a agendada por endpoint comum.                   |
| TST-018 | Presença e conclusão       | Aula válida conclui com autor e data.                                     |
| TST-019 | Paginação e filtros        | Combinações retornam metadados e dados corretos.                          |
| TST-020 | Sessão expirada            | Cliente volta ao login sem exibir conteúdo protegido.                     |
| TST-021 | Teclado                    | Fluxo de agendar é concluído sem mouse.                                   |
| TST-022 | Responsividade             | Fluxos críticos funcionam em 320 px.                                      |
| TST-023 | Erros de servidor          | Interface exibe recuperação e correlationId quando disponível.            |
| TST-024 | Logs seguros               | Nenhuma credencial aparece nos logs.                                      |
| TST-025 | Migração limpa             | Banco vazio é criado e populado por migração/seed.                        |

## 4. Roteiros E2E obrigatórios

## E2E-01 – Aluno agenda e cancela

1.  Entrar como aluno.

2.  Buscar um horário.

3.  Selecionar e confirmar.

4.  Validar presença nas agendas.

5.  Cancelar dentro do prazo.

6.  Validar estado, liberação e histórico.

## E2E-02 – Administrador gerencia recurso

1.  Entrar como administrador.

2.  Cadastrar veículo.

3.  Criar indisponibilidade.

4.  Buscar horário afetado.

5.  Confirmar que veículo não é ofertado.

## E2E-03 – Instrutor conclui aula

1.  Entrar como instrutor.

2.  Abrir aula do dia.

3.  Registrar presença.

4.  Concluir com observação.

5.  Validar histórico e dashboard.

## E2E-04 – Proteção de acesso

1.  Entrar como aluno.

2.  Tentar acessar rota e endpoint administrativo.

3.  Confirmar bloqueio e ausência de dados.

## 5. Validação com cinco avaliadores

Cada avaliador deve receber o endereço do sistema, credenciais fictícias adequadas e um conjunto de tarefas. O desenvolvedor pode observar, mas não deve ensinar cada clique, pois o objetivo é avaliar a clareza da solução.

| **Campo obrigatório**      | **Orientação**                                            |
|--------------------------------|------------------------------------------------------------------|
| Nome de quem testou        | Nome completo ou identificação acordada.                  |
| Data do teste              | Data e horário aproximado.                                |
| Perfil utilizado           | Aluno, instrutor ou administrador.                        |
| Dispositivo/navegador      | Ex.: celular Android/Chrome.                              |
| O que testou e funcionou   | Funcionalidade e resultado observado.                     |
| O que não funcionou        | Passos, resultado obtido, resultado esperado e evidência. |
| Funcionalidade não testada | Indicar qual e justificar.                                |
| Facilidade de uso          | Nota e justificativa textual.                             |
| Sugestão de melhoria       | Proposta concreta.                                        |
| Evidência                  | Captura de tela sem dados pessoais reais.                 |

## 6. Gestão de defeitos

- Cada defeito recebe ID, resumo, ambiente, pré-condição, passos, esperado, obtido, evidência, severidade e estado.

- Severidade crítica: impede fluxo central, causa perda/inconsistência ou quebra autorização.

- Alta: fluxo importante indisponível sem alternativa.

- Média: problema funcional com alternativa.

- Baixa: problema visual/textual sem impedir tarefa.

- Após correção, executar reteste e regressão relacionada.

- Sugestão não aplicada deve possuir justificativa documentada.

## 7. Critérios de saída

- Todos os testes críticos aprovados.

- Nenhum defeito crítico ou alto aberto.

- Cinco avaliações coletadas em PDF.

- Correções pertinentes documentadas.

- Evidências vinculadas a requisitos.

- Vídeo demonstra solução funcional com dados fictícios.
