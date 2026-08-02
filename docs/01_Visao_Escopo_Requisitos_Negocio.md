Documento: **DOC-01**

# AutoAgenda – Visão, escopo e requisitos de negócio

Definição completa do problema, objetivos, atores, regras e fronteiras do produto.

| **Produto** | AutoAgenda                                     |
|-------------|------------------------------------------------|
| **Versão**  | 1.0 - Especificação acadêmica                  |
| **Status**  | Base para planejamento, implementação e testes |
| **Data**    | Agosto de 2026                                 |

## 1. Contexto e problema

Autoescolas de pequeno e médio porte frequentemente organizam aulas práticas por planilhas, agendas em papel e mensagens. Esse processo fragmentado dificulta saber quais alunos, instrutores e veículos estão disponíveis, favorece marcações duplicadas e torna o histórico difícil de consultar. O AutoAgenda centraliza essas informações e aplica validações automáticas antes de confirmar uma aula.

## 2. Objetivo geral

Desenvolver uma aplicação web que permita planejar, confirmar, acompanhar, cancelar e concluir aulas práticas, preservando o histórico e impedindo conflitos de aluno, instrutor e veículo.

## 3. Objetivos específicos

- Reduzir conflitos de horários e retrabalho administrativo.

- Oferecer ao aluno uma visão simples de suas próximas aulas e do histórico.

- Permitir que instrutores consultem a agenda e registrem presença e conclusão.

- Manter dados de veículos e indisponibilidades para evitar agendamentos inviáveis.

- Produzir registros rastreáveis para auditoria acadêmica e operacional.

- Disponibilizar uma solução demonstrável, testável e documentada no Git.

## 4. Atores e responsabilidades

| **Ator**                | **Responsabilidades**                                                                                     | **Restrições**                                                                                     |
|---------------------------|---------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------|
| Administrador/atendente | Gerenciar cadastros, disponibilidade, veículos, agendamentos, cancelamentos e relatórios.                 | Não pode apagar histórico operacional já utilizado; deve justificar cancelamentos administrativos. |
| Instrutor               | Consultar a própria agenda, bloquear disponibilidade e registrar situação da aula.                        | Não pode alterar aulas de outro instrutor nem trocar aluno/veículo livremente.                     |
| Aluno                   | Consultar horários disponíveis, solicitar/agendar aula, cancelar dentro das regras e consultar histórico. | Acessa apenas seus próprios dados e não define instrutor indisponível.                             |
| Sistema                 | Validar regras, impedir conflitos, registrar auditoria e apresentar estados coerentes.                    | Nunca deve confirmar operação parcialmente concluída.                                              |

## 5. Escopo do MVP

- Autenticação e autorização por perfil.

- Cadastros de aluno, instrutor e veículo.

- Configuração de dias, horários, duração e antecedência de cancelamento.

- Disponibilidade recorrente e bloqueios pontuais de instrutores.

- Indisponibilidade de veículos.

- Busca de horários livres.

- Criação, reagendamento e cancelamento de aulas.

- Validação transacional contra conflitos.

- Agenda por dia, semana e lista.

- Registro de presença, ausência e conclusão.

- Histórico individual e trilha básica de auditoria.

- Dashboard com indicadores operacionais simples.

## 6. Fora do escopo do MVP

- Cobrança, conciliação, PIX, cartão ou emissão de nota fiscal.

- Integração oficial com DETRAN, RENACH ou biometria.

- Gestão completa de aulas teóricas e provas oficiais.

- Rastreamento de veículo por GPS.

- Aplicativo móvel nativo.

- Marketplace entre diferentes autoescolas.

- Otimização automática de rotas.

- Envio real de WhatsApp/SMS; pode ser simulado ou planejado como evolução.

## 7. Regras de negócio

| **ID** | **Nome**                 | **Especificação**                                                                                                   |
|--------|----------------------------|---------------------------------------------------------------------------------------------------------------------|
| RN-001 | Unicidade de conta       | Cada e-mail deve identificar no máximo um usuário ativo.                                                            |
| RN-002 | Perfis                   | Toda conta deve possuir um perfil autorizado; permissões são avaliadas no servidor.                                 |
| RN-003 | Vínculo de aluno         | Um usuário aluno deve estar associado a exatamente um cadastro de aluno.                                            |
| RN-004 | Vínculo de instrutor     | Um usuário instrutor deve estar associado a exatamente um cadastro de instrutor.                                    |
| RN-005 | Status cadastral         | Cadastros inativos não podem participar de novos agendamentos.                                                      |
| RN-006 | Habilitação do instrutor | O instrutor deve estar autorizado para a categoria solicitada no momento da aula.                                   |
| RN-007 | Categoria do veículo     | O veículo deve atender à categoria da aula e estar ativo.                                                           |
| RN-008 | Duração                  | A duração da aula deve respeitar uma opção configurada pela autoescola.                                             |
| RN-009 | Horário de funcionamento | A aula deve iniciar e terminar dentro do expediente configurado.                                                    |
| RN-010 | Antecedência mínima      | A aula só pode ser criada com a antecedência mínima configurada.                                                    |
| RN-011 | Conflito do aluno        | O aluno não pode possuir aulas com intervalos sobrepostos.                                                          |
| RN-012 | Conflito do instrutor    | O instrutor não pode possuir aulas com intervalos sobrepostos.                                                      |
| RN-013 | Conflito do veículo      | O veículo não pode possuir aulas com intervalos sobrepostos.                                                        |
| RN-014 | Disponibilidade          | O instrutor deve estar disponível durante todo o intervalo.                                                         |
| RN-015 | Bloqueios                | Nenhuma aula pode ocupar bloqueio do instrutor ou indisponibilidade do veículo.                                     |
| RN-016 | Concorrência             | Se duas pessoas tentarem reservar o mesmo recurso, somente a primeira transação confirmada terá sucesso.            |
| RN-017 | Reagendamento            | Reagendar equivale a validar integralmente o novo intervalo antes de liberar o anterior.                            |
| RN-018 | Cancelamento do aluno    | O aluno só pode cancelar antes do limite configurado; exceções são administrativas.                                 |
| RN-019 | Justificativa            | Cancelamento administrativo ou fora do prazo exige motivo.                                                          |
| RN-020 | Estados                  | Uma aula segue transições válidas; estados finais não retornam a agendada sem procedimento administrativo auditado. |
| RN-021 | Presença                 | Somente instrutor responsável ou administrador registra presença/ausência.                                          |
| RN-022 | Conclusão                | Uma aula só pode ser concluída após o horário de início e com presença registrada.                                  |
| RN-023 | Histórico                | Aulas utilizadas não são excluídas fisicamente; são canceladas ou inativadas conforme o caso.                       |
| RN-024 | Auditoria                | Alterações críticas devem registrar autor, data, ação, entidade e identificador.                                    |
| RN-025 | Fuso horário             | Datas operacionais serão interpretadas no fuso America/Fortaleza.                                                   |
| RN-026 | Dados pessoais           | Cada perfil só visualiza os dados necessários à sua função.                                                         |
| RN-027 | Paginação                | Listagens administrativas devem ser paginadas e filtráveis.                                                         |
| RN-028 | Integridade              | Uma operação que falhar em qualquer validação não pode produzir alteração parcial.                                  |
| RN-029 | Veículo em manutenção    | Veículo em manutenção não pode receber novas aulas e seus conflitos futuros devem ser sinalizados.                  |
| RN-030 | Edição retroativa        | Dados essenciais de aula concluída não podem ser alterados silenciosamente; correção exige auditoria.               |

## 8. Estados e transições da aula

| **Estado atual**                 | **Ação**                      | **Próximo estado** | **Condição**                                          |
|------------------------------------|----------------------------------|-----------------------|----------------------------------------------------------|
| AGENDADA                         | Confirmar                     | CONFIRMADA         | Ação administrativa ou política de confirmação.       |
| AGENDADA/CONFIRMADA              | Cancelar                      | CANCELADA          | Regra de antecedência e justificativa aplicadas.      |
| AGENDADA/CONFIRMADA              | Iniciar registro              | EM_ANDAMENTO       | Horário alcançado; ação do instrutor/admin.           |
| EM_ANDAMENTO                     | Registrar presença e concluir | CONCLUÍDA          | Presença confirmada e dados obrigatórios preenchidos. |
| AGENDADA/CONFIRMADA/EM_ANDAMENTO | Registrar ausência            | ALUNO_AUSENTE      | Responsável autorizado registra ocorrência.           |
| Qualquer não final               | Falha operacional             | NÃO_REALIZADA      | Justificativa administrativa obrigatória.             |

## 9. Indicadores de sucesso

- Nenhum conflito confirmado de aluno, instrutor ou veículo nos testes concorrentes.

- Todos os fluxos críticos cobertos por testes automatizados e evidências manuais.

- Cinco avaliadores conseguem executar as tarefas definidas e registrar feedback.

- Tempo de resposta percebido adequado nas operações principais, conforme RNFs.

- Rastreabilidade entre regra, requisito, implementação e teste.
