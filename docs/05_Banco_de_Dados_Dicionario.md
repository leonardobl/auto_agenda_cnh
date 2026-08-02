Documento: **DOC-05**

# AutoAgenda – Banco de dados e dicionário de dados

Modelo relacional, entidades, integridade, índices e política de histórico.

| **Produto** | AutoAgenda                                     |
|-------------|------------------------------------------------|
| **Versão**  | 1.0 - Especificação acadêmica                  |
| **Status**  | Base para planejamento, implementação e testes |
| **Data**    | Agosto de 2026                                 |

## 1. Diretrizes

- PostgreSQL como SGBD relacional.

- Nomes físicos em snake_case e no singular ou plural de forma consistente.

- Chaves primárias UUID.

- Timestamps created_at e updated_at nas entidades mutáveis.

- Exclusão lógica para cadastros; preservação de registros operacionais.

- Migrações versionadas no repositório.

- Constraints e índices complementam, mas não substituem, regras do serviço.

## 2. Entidades e relacionamentos

| **Entidade**               | **Relacionamentos principais**                                 |
|-------------------------------|----------------------------------------------------------------|
| user                       | Possui um role e pode vincular-se a student ou instructor.     |
| role                       | Classifica permissões administrativas, de instrutor ou aluno.  |
| student                    | Possui muitas appointments e uma categoria pretendida.         |
| instructor                 | Possui categorias, disponibilidades, bloqueios e appointments. |
| vehicle                    | Possui categoria, indisponibilidades e appointments.           |
| license_category           | Relaciona alunos, instrutores, veículos e aulas.               |
| instructor_availability    | Janela semanal pertencente ao instrutor.                       |
| instructor_block           | Intervalo pontual indisponível.                                |
| vehicle_unavailability     | Intervalo de manutenção/indisponibilidade.                     |
| appointment                | Une aluno, instrutor, veículo e categoria em um intervalo.     |
| appointment_status_history | Registra transições da aula.                                   |
| audit_event                | Registra ações críticas e metadados seguros.                   |
| system_setting             | Armazena configuração operacional versionável.                 |
| notification               | Notificação interna de um usuário.                             |

## 3. Dicionário de dados

## user

| **Campo**     | **Tipo**     | **Restrições**     | **Descrição**                 |
|-----------------|----------------|------------------------|------------------------------------|
| id            | uuid         | PK, obrigatório    | Identificador.                |
| email         | varchar(254) | único, obrigatório | E-mail normalizado.           |
| password_hash | text         | obrigatório        | Hash seguro; nunca senha.     |
| role          | varchar(30)  | obrigatório        | ADMIN, INSTRUCTOR ou STUDENT. |
| status        | varchar(20)  | obrigatório        | ACTIVE, INACTIVE ou BLOCKED.  |
| last_login_at | timestamptz  | nulo               | Último login.                 |
| created_at    | timestamptz  | obrigatório        | Criação.                      |
| updated_at    | timestamptz  | obrigatório        | Atualização.                  |

## student

| **Campo**   | **Tipo**     | **Restrições**       | **Descrição**          |
|---------------|----------------|--------------------------|-----------------------------|
| id          | uuid         | PK                   | Identificador.         |
| user_id     | uuid         | FK user, único, nulo | Conta associada.       |
| full_name   | varchar(150) | obrigatório          | Nome completo.         |
| document    | varchar(20)  | único, nulo          | Documento normalizado. |
| phone       | varchar(20)  | obrigatório          | Contato.               |
| birth_date  | date         | nulo                 | Data de nascimento.    |
| category_id | uuid         | FK                   | Categoria pretendida.  |
| status      | varchar(20)  | obrigatório          | ACTIVE/INACTIVE.       |
| created_at  | timestamptz  | obrigatório          | Criação.               |
| updated_at  | timestamptz  | obrigatório          | Atualização.           |

## instructor

| **Campo**         | **Tipo**     | **Restrições**     | **Descrição**                          |
|---------------------|----------------|------------------------|----------------------------------------------|
| id                | uuid         | PK                 | Identificador.                         |
| user_id           | uuid         | FK user, único     | Conta.                                 |
| full_name         | varchar(150) | obrigatório        | Nome.                                  |
| document          | varchar(20)  | único, nulo        | Documento.                             |
| credential_number | varchar(50)  | único, obrigatório | Registro profissional interno/externo. |
| phone             | varchar(20)  | obrigatório        | Contato.                               |
| status            | varchar(20)  | obrigatório        | ACTIVE/INACTIVE.                       |
| created_at        | timestamptz  | obrigatório        | Criação.                               |
| updated_at        | timestamptz  | obrigatório        | Atualização.                           |

## vehicle

| **Campo**   | **Tipo**    | **Restrições**     | **Descrição**                    |
|---------------|---------------|------------------------|----------------------------------------|
| id          | uuid        | PK                 | Identificador.                   |
| plate       | varchar(10) | único, obrigatório | Placa normalizada.               |
| brand       | varchar(60) | obrigatório        | Marca.                           |
| model       | varchar(80) | obrigatório        | Modelo.                          |
| year        | smallint    | obrigatório        | Ano válido.                      |
| category_id | uuid        | FK                 | Categoria.                       |
| status      | varchar(20) | obrigatório        | ACTIVE, MAINTENANCE ou INACTIVE. |
| created_at  | timestamptz | obrigatório        | Criação.                         |
| updated_at  | timestamptz | obrigatório        | Atualização.                     |

## appointment

| **Campo**           | **Tipo**    | **Restrições**            | **Descrição**               |
|-----------------------|---------------|--------------------------------|-----------------------------------|
| id                  | uuid        | PK                        | Identificador.              |
| student_id          | uuid        | FK, obrigatório           | Aluno.                      |
| instructor_id       | uuid        | FK, obrigatório           | Instrutor.                  |
| vehicle_id          | uuid        | FK, obrigatório           | Veículo.                    |
| category_id         | uuid        | FK, obrigatório           | Categoria.                  |
| start_at            | timestamptz | obrigatório               | Início.                     |
| end_at              | timestamptz | obrigatório; end \> start | Fim.                        |
| status              | varchar(30) | obrigatório               | Estado da aula.             |
| cancellation_reason | text        | nulo                      | Motivo quando aplicável.    |
| notes               | text        | nulo                      | Observação operacional.     |
| created_by          | uuid        | FK user                   | Autor da criação.           |
| created_at          | timestamptz | obrigatório               | Criação.                    |
| updated_at          | timestamptz | obrigatório               | Atualização.                |
| version             | integer     | obrigatório, default 1    | Controle otimista opcional. |

## instructor_availability

| **Campo**     | **Tipo** | **Restrições** | **Descrição**  |
|-----------------|------------|-------------------|---------------------|
| id            | uuid     | PK             | Identificador. |
| instructor_id | uuid     | FK             | Instrutor.     |
| weekday       | smallint | 0..6           | Dia da semana. |
| start_time    | time     | obrigatório    | Início local.  |
| end_time      | time     | end \> start   | Fim local.     |
| active        | boolean  | default true   | Vigência.      |

## instructor_block

| **Campo**     | **Tipo**     | **Restrições** | **Descrição**  |
|-----------------|----------------|-------------------|---------------------|
| id            | uuid         | PK             | Identificador. |
| instructor_id | uuid         | FK             | Instrutor.     |
| start_at      | timestamptz  | obrigatório    | Início.        |
| end_at        | timestamptz  | end \> start   | Fim.           |
| reason        | varchar(255) | obrigatório    | Motivo.        |
| created_by    | uuid         | FK user        | Autor.         |

## vehicle_unavailability

| **Campo**  | **Tipo**     | **Restrições** | **Descrição**  |
|--------------|----------------|-------------------|---------------------|
| id         | uuid         | PK             | Identificador. |
| vehicle_id | uuid         | FK             | Veículo.       |
| start_at   | timestamptz  | obrigatório    | Início.        |
| end_at     | timestamptz  | end \> start   | Fim.           |
| reason     | varchar(255) | obrigatório    | Motivo.        |
| created_by | uuid         | FK user        | Autor.         |

## audit_event

| **Campo**      | **Tipo**    | **Restrições**        | **Descrição**              |
|------------------|---------------|---------------------------|----------------------------------|
| id             | uuid        | PK                    | Identificador.             |
| actor_user_id  | uuid        | FK, nulo              | Autor ou sistema.           |
| action         | varchar(80) | obrigatório           | Ação estável.              |
| entity_type    | varchar(80) | obrigatório           | Tipo da entidade.          |
| entity_id      | uuid        | nulo                  | Identificador relacionado. |
| metadata       | jsonb       | obrigatório, filtrado | Mudanças seguras.          |
| correlation_id | varchar(80) | obrigatório           | Rastreio.                  |
| created_at     | timestamptz | obrigatório           | Ocorrência.                |

## 4. Integridade e índices

- Índice único em lower(user.email).

- Índices únicos em student.document, instructor.document, instructor.credential_number e vehicle.plate quando preenchidos.

- Índices em appointment(start_at), appointment(student_id,start_at), appointment(instructor_id,start_at), appointment(vehicle_id,start_at) e appointment(status,start_at).

- Índices por intervalo em bloqueios e indisponibilidades.

- Foreign keys impedem referências inexistentes; exclusão em cascata não deve apagar histórico de aulas.

- Check constraints para intervalos válidos, weekday e estados enumerados quando aplicável.

- A prevenção definitiva de sobreposição pode usar constraint de exclusão do PostgreSQL por recurso e intervalo para estados ativos, ou bloqueio transacional equivalente documentado.

## 5. Retenção e histórico

- Usuários, alunos, instrutores e veículos utilizados são inativados, não removidos.

- Aulas canceladas, concluídas, ausentes ou não realizadas permanecem consultáveis conforme permissão.

- Auditoria não armazena senha, token ou conteúdo sensível desnecessário.

- Política de retenção e anonimização deve ser validada com a instituição/autoescola antes de uso real.

## 6. Seed acadêmico

- Um usuário administrador.

- Dois instrutores com categorias e disponibilidades diferentes.

- Cinco alunos.

- Três veículos, incluindo um indisponível por manutenção.

- Configurações de funcionamento e duração.

- Aulas em diferentes estados para demonstrar telas e testes.

- Credenciais de demonstração fora do repositório público ou claramente fictícias e alteráveis.
