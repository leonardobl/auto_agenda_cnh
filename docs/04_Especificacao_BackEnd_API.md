Documento: **DOC-04**

# AutoAgenda – Especificação completa do back-end e da API

Arquitetura Node.js, serviços, contratos REST, validações, erros e transações.

| **Produto** | AutoAgenda                                     |
|-------------|------------------------------------------------|
| **Versão**  | 1.0 - Especificação acadêmica                  |
| **Status**  | Base para planejamento, implementação e testes |
| **Data**    | Agosto de 2026                                 |

## 1. Stack e princípios

- Node.js LTS com Express e JavaScript ES Modules.

- PostgreSQL com ORM Prisma ou camada SQL equivalente.

- Arquitetura modular em rotas/controladores, casos de uso/serviços, repositórios e domínio.

- Controllers tratam HTTP; regras de negócio ficam em serviços/casos de uso.

- Validação de entrada ocorre antes da regra de negócio.

- Toda autorização é aplicada no servidor.

- Operações de agendamento usam transação e proteção contra concorrência.

## 2. Estrutura sugerida

| **Diretório**        | **Responsabilidade**                                      |
|------------------------|---------------------------------------------------------------|
| src/config           | Variáveis de ambiente, logger e configuração.             |
| src/http/routes      | Definição de endpoints e middlewares.                     |
| src/http/controllers | Conversão HTTP para comandos/consultas.                   |
| src/http/middlewares | Autenticação, autorização, validação, erros e rate limit. |
| src/modules          | Módulos de domínio e casos de uso.                        |
| src/repositories     | Acesso a dados por contratos.                             |
| src/database         | Cliente, migrações e seeds.                               |
| src/shared           | Erros, utilitários, relógio e identificadores.            |
| tests                | Unitários, integração, contratos e factories.             |

## 3. Requisitos internos

| **ID** | **Nome**     | **Especificação**                                                                                              |
|--------|--------------|--------------------------------------------------------------------------------------------------------------------|
| BE-001 | Validação    | Validar params, query e body por schema; rejeitar campos desconhecidos onde isso aumentar segurança.           |
| BE-002 | Autenticação | Resolver sessão/token e carregar identidade ativa antes das rotas protegidas.                                  |
| BE-003 | Autorização  | Verificar perfil, propriedade do recurso e ação solicitada em cada caso de uso.                                |
| BE-004 | Erros        | Converter falhas conhecidas em código HTTP e código de domínio estáveis.                                       |
| BE-005 | Transações   | Criação/reagendamento deve validar e gravar atomicamente.                                                      |
| BE-006 | Concorrência | Evitar dupla reserva usando isolamento, bloqueio/advisory lock ou restrição temporal equivalente.              |
| BE-007 | Idempotência | Endpoints críticos devem aceitar chave de idempotência ou impedir duplicação lógica por requisições repetidas. |
| BE-008 | Auditoria    | Registrar eventos críticos após sucesso, dentro da mesma unidade transacional quando necessário.               |
| BE-009 | Paginação    | Listagens aceitam page, pageSize limitado, sort permitido e filtros validados.                                 |
| BE-010 | Tempo        | Persistir timestamps em UTC e converter regras pelo fuso configurado.                                          |
| BE-011 | Logs         | Registrar método, rota, status, duração e correlationId sem senha/token.                                       |
| BE-012 | Healthcheck  | Expor verificação de processo e, separadamente, prontidão do banco.                                            |
| BE-013 | Configuração | Falhar ao iniciar se variáveis obrigatórias estiverem ausentes ou inválidas.                                   |
| BE-014 | Migrações    | Alterações de esquema são versionadas e reproduzíveis.                                                         |
| BE-015 | Documentação | Contrato OpenAPI deve acompanhar os endpoints implementados.                                                   |

## 4. Convenções REST

- Prefixo: /api/v1.

- JSON em requisições e respostas; UTF-8.

- Identificadores opacos UUID.

- Datas/horários em ISO 8601.

- Sucesso de criação: 201; consulta/alteração: 200; remoção sem corpo: 204.

- Erros: objeto com code, message, fieldErrors opcional e correlationId.

- Nunca retornar stack trace em produção.

## 5. Endpoints

| **Método** | **Endpoint**                    | **Acesso**             | **Finalidade**                       |
|--------------|-----------------------------------|---------------------------|------------------------------------------|
| POST       | /auth/login                     | Público                | Autenticar e iniciar sessão.         |
| POST       | /auth/logout                    | Autenticado            | Encerrar sessão.                     |
| POST       | /auth/forgot-password           | Público                | Solicitar redefinição.               |
| POST       | /auth/reset-password            | Público                | Trocar senha com token.              |
| GET        | /me                             | Autenticado            | Consultar identidade e permissões.   |
| PATCH      | /me                             | Autenticado            | Atualizar dados próprios permitidos. |
| GET/POST   | /students                       | Admin                  | Listar/criar alunos.                 |
| GET/PATCH  | /students/:id                   | Admin                  | Consultar/editar aluno.              |
| POST       | /students/:id/deactivate        | Admin                  | Inativar aluno.                      |
| GET/POST   | /instructors                    | Admin                  | Listar/criar instrutores.            |
| GET/PATCH  | /instructors/:id                | Admin/Próprio limitado | Consultar/editar.                    |
| GET/POST   | /instructors/:id/availability   | Admin/Próprio          | Gerenciar disponibilidade.           |
| GET/POST   | /instructors/:id/blocks         | Admin/Próprio          | Gerenciar bloqueios.                 |
| GET/POST   | /vehicles                       | Admin                  | Listar/criar veículos.               |
| GET/PATCH  | /vehicles/:id                   | Admin                  | Consultar/editar veículo.            |
| GET/POST   | /vehicles/:id/unavailability    | Admin                  | Gerenciar indisponibilidade.         |
| GET        | /availability/slots             | Aluno/Admin            | Calcular horários livres.            |
| GET/POST   | /appointments                   | Por perfil             | Listar/criar aulas.                  |
| GET/PATCH  | /appointments/:id               | Relacionado/Admin      | Detalhar/alterar campos permitidos.  |
| POST       | /appointments/:id/reschedule    | Aluno/Admin            | Reagendar.                           |
| POST       | /appointments/:id/cancel        | Por regra              | Cancelar.                            |
| POST       | /appointments/:id/confirm       | Instrutor/Admin        | Confirmar.                           |
| POST       | /appointments/:id/attendance    | Instrutor/Admin        | Presença/ausência.                   |
| POST       | /appointments/:id/complete      | Instrutor/Admin        | Concluir.                            |
| POST       | /appointments/:id/not-performed | Instrutor/Admin        | Registrar não realização.            |
| GET/PATCH  | /settings                       | Admin                  | Consultar/alterar configurações.     |
| GET        | /audit-events                   | Admin                  | Pesquisar auditoria.                 |
| GET        | /dashboard                      | Autenticado            | Painel conforme perfil.              |
| GET        | /reports/appointments.csv       | Admin                  | Exportar relatório.                  |

## 6. Contratos críticos

## 6.1 Buscar disponibilidade

Entrada: studentId, categoryId, dateFrom, dateTo, durationMinutes e preferências opcionais de instrutor. A API deve validar intervalo máximo de busca, elegibilidade do aluno e categoria. A resposta deve conter slotId temporário ou dados suficientes para revalidação, startAt, endAt, instructor e vehicle resumidos.

A busca não reserva recursos. A confirmação sempre repete as validações dentro da transação.

## 6.2 Criar agendamento

Entrada: studentId quando administrativo, categoryId, startAt, durationMinutes, instructorId, vehicleId e idempotencyKey. O serviço valida identidades ativas, compatibilidade, expediente, antecedência, disponibilidade e sobreposição. Em sucesso, cria a aula, auditoria e notificações internas.

## 6.3 Formato de erro

| **Campo**     | **Tipo**        | **Uso**                                    |
|-----------------|-------------------|-------------------------------------------------|
| code          | string          | Código estável, como APPOINTMENT_CONFLICT. |
| message       | string          | Mensagem segura e compreensível.           |
| fieldErrors   | object opcional | Mapa campo → mensagens.                    |
| correlationId | string          | Identificador para rastrear logs.          |

## 7. Códigos de erro mínimos

| **HTTP** | **Código**              | **Situação**                                            |
|----------|----------------------------|--------------------------------------------------------------|
| 400      | VALIDATION_ERROR        | Formato ou campo inválido.                              |
| 401      | AUTHENTICATION_REQUIRED | Sessão ausente/expirada.                                |
| 403      | FORBIDDEN               | Usuário sem permissão.                                  |
| 404      | RESOURCE_NOT_FOUND      | Entidade inexistente ou não visível.                    |
| 409      | APPOINTMENT_CONFLICT    | Aluno, instrutor ou veículo ocupado.                    |
| 409      | EMAIL_ALREADY_EXISTS    | E-mail duplicado.                                       |
| 409      | PLATE_ALREADY_EXISTS    | Placa duplicada.                                        |
| 422      | BUSINESS_RULE_VIOLATION | Regra válida sintaticamente, mas impossível no domínio. |
| 429      | RATE_LIMITED            | Excesso de tentativas.                                  |
| 500      | INTERNAL_ERROR          | Falha inesperada sem detalhes internos.                 |

## 8. Algoritmo de agendamento

1.  Normalizar e validar a entrada.

2.  Carregar configurações e entidades necessárias.

3.  Verificar status e compatibilidade de aluno, instrutor, veículo e categoria.

4.  Calcular endAt de modo determinístico.

5.  Verificar expediente, antecedência, disponibilidade e bloqueios.

6.  Abrir transação com estratégia de concorrência definida.

7.  Reconsultar sobreposições dos três recursos.

8.  Criar aula e auditoria ou abortar integralmente.

9.  Confirmar transação.

10. Publicar/registrar notificação sem comprometer consistência da aula.

## 9. Critérios de pronto do back-end

- Endpoint documentado e validado.

- Autorização testada para perfis permitidos e proibidos.

- Regra implementada no serviço, não apenas no controller.

- Operações críticas transacionais.

- Erros estáveis e sem vazamento.

- Testes unitários e de integração passam.

- Migração e seed reproduzem o ambiente.

- Logs permitem rastrear a operação por correlationId.
