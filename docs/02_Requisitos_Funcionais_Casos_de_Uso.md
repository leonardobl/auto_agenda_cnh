Documento: **DOC-02**

# AutoAgenda – Requisitos funcionais e casos de uso

Comportamentos completos e verificáveis que o sistema deverá oferecer.

| **Produto** | AutoAgenda                                     |
|-------------|------------------------------------------------|
| **Versão**  | 1.0 - Especificação acadêmica                  |
| **Status**  | Base para planejamento, implementação e testes |
| **Data**    | Agosto de 2026                                 |

## 1. Critério de escrita

Cada requisito abaixo descreve uma capacidade observável, seus atores, regras e critérios de aceitação. Um requisito só será considerado implementado quando seus critérios puderem ser demonstrados e testados.

### RF-001 – Autenticar usuário

**Descrição:** Permitir acesso por e-mail e senha e criar uma sessão segura.

**Atores:** Todos

**Prioridade:** MVP - Obrigatório

**Regras e comportamentos:**

- Validar campos obrigatórios e formato do e-mail.

- Não revelar se o e-mail existe quando a credencial for inválida.

- Direcionar o usuário conforme o perfil após sucesso.

**Critérios de aceitação:**

- Credenciais válidas retornam usuário autenticado.

- Credenciais inválidas retornam mensagem genérica.

- Usuário inativo não acessa o sistema.

### RF-002 – Encerrar sessão

**Descrição:** Permitir que o usuário encerre sua sessão em qualquer área autenticada.

**Atores:** Todos

**Prioridade:** MVP - Obrigatório

**Regras e comportamentos:**

- Invalidar a sessão/credencial de renovação.

- Remover dados sensíveis mantidos no cliente.

**Critérios de aceitação:**

- Após sair, rotas protegidas exigem nova autenticação.

### RF-003 – Recuperar senha

**Descrição:** Iniciar redefinição de senha por token temporário.

**Atores:** Todos

**Prioridade:** MVP - Obrigatório

**Regras e comportamentos:**

- Resposta externa não confirma existência do e-mail.

- Token é de uso único e possui expiração.

**Critérios de aceitação:**

- Senha nova respeita política e invalida o token.

### RF-004 – Consultar perfil

**Descrição:** Exibir dados básicos e permissões do usuário autenticado.

**Atores:** Todos

**Prioridade:** MVP - Obrigatório

**Regras e comportamentos:**

- Cada perfil visualiza somente seus próprios dados pessoais.

**Critérios de aceitação:**

- Dados exibidos correspondem à sessão.

### RF-005 – Alterar dados próprios

**Descrição:** Permitir atualização dos campos pessoais autorizados.

**Atores:** Todos

**Prioridade:** MVP - Obrigatório

**Regras e comportamentos:**

- Mudança de e-mail exige unicidade.

- Perfil e status não podem ser alterados pelo próprio usuário.

**Critérios de aceitação:**

- Dados válidos persistem e inválidos geram erro por campo.

### RF-010 – Cadastrar aluno

**Descrição:** Criar aluno com dados pessoais, contato e categoria pretendida.

**Atores:** Administrador

**Prioridade:** MVP - Obrigatório

**Regras e comportamentos:**

- E-mail e documento, quando informados, devem ser únicos.

- Cadastro nasce ativo salvo decisão explícita do administrador.

**Critérios de aceitação:**

- Aluno válido aparece na listagem e pode ser vinculado a uma conta.

### RF-011 – Editar aluno

**Descrição:** Atualizar dados permitidos de um aluno.

**Atores:** Administrador

**Prioridade:** MVP - Obrigatório

**Regras e comportamentos:**

- Alterações não podem invalidar aulas históricas.

**Critérios de aceitação:**

- Auditoria registra mudanças críticas.

### RF-012 – Inativar aluno

**Descrição:** Impedir novos agendamentos mantendo o histórico.

**Atores:** Administrador

**Prioridade:** MVP - Obrigatório

**Regras e comportamentos:**

- Aulas futuras devem ser listadas para decisão antes da inativação.

**Critérios de aceitação:**

- Aluno inativo não aparece como opção de novo agendamento.

### RF-013 – Listar e pesquisar alunos

**Descrição:** Consultar alunos por nome, e-mail, telefone, categoria e status.

**Atores:** Administrador

**Prioridade:** MVP - Obrigatório

**Regras e comportamentos:**

- Pesquisa parcial e paginação.

**Critérios de aceitação:**

- Filtros podem ser combinados e limpos.

### RF-020 – Cadastrar instrutor

**Descrição:** Criar instrutor e informar categorias autorizadas.

**Atores:** Administrador

**Prioridade:** MVP - Obrigatório

**Regras e comportamentos:**

- Deve existir ao menos uma categoria.

**Critérios de aceitação:**

- Instrutor ativo pode receber disponibilidade e aulas.

### RF-021 – Gerenciar disponibilidade do instrutor

**Descrição:** Cadastrar janelas recorrentes por dia da semana.

**Atores:** Administrador/Instrutor

**Prioridade:** MVP - Obrigatório

**Regras e comportamentos:**

- Início deve ser anterior ao fim.

- Janelas sobrepostas do mesmo instrutor devem ser rejeitadas ou consolidadas.

**Critérios de aceitação:**

- Busca de horários considera as janelas ativas.

### RF-022 – Bloquear horário do instrutor

**Descrição:** Criar indisponibilidade pontual com intervalo e motivo.

**Atores:** Administrador/Instrutor

**Prioridade:** MVP - Obrigatório

**Regras e comportamentos:**

- Bloqueio com aula futura deve alertar conflito e não pode cancelá-la silenciosamente.

**Critérios de aceitação:**

- Intervalo bloqueado deixa de ser ofertado.

### RF-023 – Consultar agenda do instrutor

**Descrição:** Exibir aulas do instrutor por período.

**Atores:** Administrador/Instrutor

**Prioridade:** MVP - Obrigatório

**Regras e comportamentos:**

- Instrutor acessa somente a própria agenda; administrador pode selecionar qualquer instrutor.

**Critérios de aceitação:**

- Filtros por data e estado funcionam.

### RF-030 – Cadastrar veículo

**Descrição:** Registrar placa, modelo, categoria, ano e status.

**Atores:** Administrador

**Prioridade:** MVP - Obrigatório

**Regras e comportamentos:**

- Placa deve ser normalizada e única.

**Critérios de aceitação:**

- Veículo ativo aparece nas opções compatíveis.

### RF-031 – Registrar indisponibilidade de veículo

**Descrição:** Bloquear veículo por manutenção ou outro motivo.

**Atores:** Administrador

**Prioridade:** MVP - Obrigatório

**Regras e comportamentos:**

- Período deve ser válido; conflitos futuros devem ser sinalizados.

**Critérios de aceitação:**

- Veículo não é ofertado no intervalo.

### RF-032 – Listar e editar veículos

**Descrição:** Pesquisar e atualizar dados e situação dos veículos.

**Atores:** Administrador

**Prioridade:** MVP - Obrigatório

**Regras e comportamentos:**

- Não apagar veículo com histórico.

**Critérios de aceitação:**

- Alterações válidas são persistidas e auditadas.

### RF-040 – Buscar horários disponíveis

**Descrição:** Calcular opções livres para aluno, categoria, período e duração.

**Atores:** Administrador/Aluno

**Prioridade:** MVP - Obrigatório

**Regras e comportamentos:**

- Cruzar expediente, disponibilidade, bloqueios, aulas e veículos.

- Não apresentar horário passado ou sem recurso completo.

**Critérios de aceitação:**

- Cada opção retornada possui instrutor e veículo disponíveis no intervalo.

### RF-041 – Criar agendamento

**Descrição:** Confirmar uma aula a partir de uma opção válida.

**Atores:** Administrador/Aluno

**Prioridade:** MVP - Obrigatório

**Regras e comportamentos:**

- Revalidar disponibilidade no servidor dentro de transação.

- Gerar identificador e registrar autor.

**Critérios de aceitação:**

- Aula confirmada aparece nas agendas relacionadas.

- Conflito concorrente retorna erro sem duplicidade.

### RF-042 – Reagendar aula

**Descrição:** Alterar data/horário e, se necessário, instrutor ou veículo.

**Atores:** Administrador/Aluno

**Prioridade:** MVP - Obrigatório

**Regras e comportamentos:**

- Validar novo intervalo antes de confirmar a troca.

- Preservar registro do valor anterior na auditoria.

**Critérios de aceitação:**

- Falha mantém o agendamento original intacto.

### RF-043 – Cancelar aula

**Descrição:** Mudar a situação para cancelada e registrar motivo.

**Atores:** Administrador/Aluno/Instrutor

**Prioridade:** MVP - Obrigatório

**Regras e comportamentos:**

- Aplicar antecedência conforme ator.

- Não excluir fisicamente o registro.

**Critérios de aceitação:**

- Horário liberado volta à busca quando aplicável.

### RF-044 – Consultar detalhes da aula

**Descrição:** Exibir aluno, instrutor, veículo, intervalo, categoria, estado e histórico permitido.

**Atores:** Todos

**Prioridade:** MVP - Obrigatório

**Regras e comportamentos:**

- Aluno vê informações pessoais mínimas do instrutor.

**Critérios de aceitação:**

- Acesso indevido retorna proibição/ocultação.

### RF-045 – Listar agenda

**Descrição:** Exibir aulas em lista, dia e semana.

**Atores:** Todos

**Prioridade:** MVP - Obrigatório

**Regras e comportamentos:**

- Permitir período, estado, aluno e instrutor conforme permissão.

**Critérios de aceitação:**

- Mudança de filtro atualiza resultados e estados vazios.

### RF-046 – Confirmar aula

**Descrição:** Permitir confirmação administrativa ou pelo instrutor.

**Atores:** Administrador/Instrutor

**Prioridade:** MVP - Obrigatório

**Regras e comportamentos:**

- Somente aulas agendadas podem ser confirmadas.

**Critérios de aceitação:**

- Transição inválida é rejeitada.

### RF-047 – Registrar presença ou ausência

**Descrição:** Registrar resultado de comparecimento do aluno.

**Atores:** Administrador/Instrutor

**Prioridade:** MVP - Obrigatório

**Regras e comportamentos:**

- Ação disponível somente ao instrutor responsável ou administrador.

- Ausência exige observação opcional/configurável.

**Critérios de aceitação:**

- Estado e autor ficam registrados.

### RF-048 – Concluir aula

**Descrição:** Finalizar aula e registrar observações de execução.

**Atores:** Administrador/Instrutor

**Prioridade:** MVP - Obrigatório

**Regras e comportamentos:**

- Exigir presença e horário compatível.

**Critérios de aceitação:**

- Aula concluída integra histórico e não pode ser removida.

### RF-049 – Registrar aula não realizada

**Descrição:** Encerrar sem realização por motivo operacional.

**Atores:** Administrador/Instrutor

**Prioridade:** MVP - Obrigatório

**Regras e comportamentos:**

- Motivo obrigatório.

**Critérios de aceitação:**

- Estado final e motivo aparecem no histórico.

### RF-050 – Dashboard administrativo

**Descrição:** Apresentar aulas de hoje, próximas, canceladas e conflitos pendentes.

**Atores:** Administrador

**Prioridade:** MVP - Obrigatório

**Regras e comportamentos:**

- Indicadores respeitam período e dados reais.

**Critérios de aceitação:**

- Cada cartão leva à listagem correspondente.

### RF-051 – Dashboard do instrutor

**Descrição:** Apresentar agenda do dia e próximas ações.

**Atores:** Instrutor

**Prioridade:** MVP - Obrigatório

**Regras e comportamentos:**

- Somente aulas do próprio instrutor.

**Critérios de aceitação:**

- Ações disponíveis dependem do estado e horário.

### RF-052 – Dashboard do aluno

**Descrição:** Apresentar próxima aula, histórico e acesso ao agendamento.

**Atores:** Aluno

**Prioridade:** MVP - Obrigatório

**Regras e comportamentos:**

- Somente dados do aluno autenticado.

**Critérios de aceitação:**

- Estado vazio orienta como agendar.

### RF-060 – Gerenciar configurações

**Descrição:** Definir expediente, duração, antecedências e categorias.

**Atores:** Administrador

**Prioridade:** MVP - Obrigatório

**Regras e comportamentos:**

- Valores devem ser validados e versionados/auditados.

**Critérios de aceitação:**

- Novas buscas usam a configuração atual sem alterar histórico.

### RF-061 – Consultar auditoria

**Descrição:** Pesquisar ações críticas por entidade, autor, período e ação.

**Atores:** Administrador

**Prioridade:** MVP - Obrigatório

**Regras e comportamentos:**

- Somente administrador.

- Valores sensíveis devem ser mascarados.

**Critérios de aceitação:**

- Filtro retorna eventos ordenados do mais recente.

### RF-062 – Exportar relatório

**Descrição:** Gerar CSV de aulas filtradas.

**Atores:** Administrador

**Prioridade:** Evolução - Importante

**Regras e comportamentos:**

- Exportação respeita permissões e filtros.

**Critérios de aceitação:**

- Arquivo contém cabeçalho e dados coerentes.

### RF-063 – Notificar eventos

**Descrição:** Criar notificação interna em agendamento, reagendamento e cancelamento.

**Atores:** Todos

**Prioridade:** Evolução - Importante

**Regras e comportamentos:**

- Não impedir a transação principal se a notificação falhar; registrar tentativa.

**Critérios de aceitação:**

- Destinatários visualizam evento com link para a aula.

## 2. Casos de uso críticos

## UC-01 – Agendar aula

Pré-condições: Aluno/Admin autenticado; cadastros ativos.

1.  Selecionar aluno/categoria.

2.  Informar período desejado.

3.  Sistema calcula opções livres.

4.  Usuário escolhe uma opção.

5.  Sistema revalida recursos em transação.

6.  Sistema cria a aula e apresenta confirmação.

Fluxo alternativo/exceção: Se outro usuário reservar o recurso antes da confirmação, a operação é recusada e novas opções são apresentadas.

## UC-02 – Reagendar aula

Pré-condições: Aula futura em estado permitido.

1.  Abrir detalhes e escolher reagendar.

2.  Buscar novo horário.

3.  Selecionar opção.

4.  Confirmar alteração.

5.  Sistema valida, registra auditoria e atualiza agendas.

Fluxo alternativo/exceção: Se o novo horário falhar, a aula original permanece inalterada.

## UC-03 – Registrar conclusão

Pré-condições: Instrutor responsável/Admin; aula iniciada.

1.  Abrir aula.

2.  Registrar presença.

3.  Adicionar observação, se necessário.

4.  Confirmar conclusão.

5.  Sistema altera estado e preserva o histórico.

Fluxo alternativo/exceção: Se o aluno faltou, usar o fluxo de ausência em vez de conclusão.

## UC-04 – Bloquear recurso

Pré-condições: Instrutor/Admin autenticado.

1.  Selecionar instrutor ou veículo.

2.  Informar intervalo e motivo.

3.  Sistema verifica aulas afetadas.

4.  Usuário resolve/aceita alerta conforme permissão.

5.  Sistema grava indisponibilidade.

Fluxo alternativo/exceção: O sistema não cancela aulas existentes automaticamente.
