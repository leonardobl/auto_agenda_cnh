Documento: **DOC-07**

# AutoAgenda – Segurança, privacidade e auditoria

Controles técnicos e organizacionais para proteger contas e dados pessoais.

| **Produto** | AutoAgenda                                     |
|-------------|------------------------------------------------|
| **Versão**  | 1.0 - Especificação acadêmica                  |
| **Status**  | Base para planejamento, implementação e testes |
| **Data**    | Agosto de 2026                                 |

## 1. Objetivos

- Impedir acesso não autorizado.

- Limitar cada perfil ao mínimo necessário.

- Proteger credenciais e sessões.

- Reduzir coleta e exposição de dados pessoais.

- Preservar integridade dos agendamentos.

- Permitir investigação por logs e auditoria sem registrar segredos.

## 2. Requisitos de segurança

| **ID**  | **Controle**      | **Especificação**                                                                                                |
|-----------|----------------------|------------------------------------------------------------------------------------------------------------------|
| SEG-001 | Senha             | Armazenar apenas hash com algoritmo apropriado, como Argon2id ou bcrypt com custo seguro.                        |
| SEG-002 | Sessão            | Preferir cookie HttpOnly, Secure em produção e SameSite adequado; não armazenar token de acesso em localStorage. |
| SEG-003 | CSRF              | Se autenticação usar cookie, aplicar proteção CSRF conforme arquitetura e SameSite.                              |
| SEG-004 | Autorização       | Validar perfil e propriedade no servidor para toda ação e leitura.                                               |
| SEG-005 | Enumeração        | Login e recuperação não devem revelar se determinado e-mail existe.                                              |
| SEG-006 | Rate limit        | Limitar tentativas em autenticação, recuperação e endpoints abusáveis.                                           |
| SEG-007 | Validação         | Validar e normalizar toda entrada; consultas devem ser parametrizadas/ORM seguro.                                |
| SEG-008 | XSS               | Escapar saída, evitar HTML não confiável e aplicar CSP em produção.                                              |
| SEG-009 | CORS              | Permitir apenas origens necessárias por ambiente.                                                                |
| SEG-010 | Headers           | Configurar headers de segurança, HTTPS e política de conteúdo.                                                   |
| SEG-011 | Segredos          | Variáveis sensíveis não entram no Git; fornecer apenas .env.example.                                             |
| SEG-012 | Logs              | Não registrar senha, token, cookie, documento integral ou payload pessoal desnecessário.                         |
| SEG-013 | Erros             | Respostas não expõem stack, SQL, caminhos internos ou detalhes de infraestrutura.                                |
| SEG-014 | Auditoria         | Registrar login relevante, criação, reagendamento, cancelamento, conclusão, inativação e configuração.           |
| SEG-015 | Dependências      | Verificar vulnerabilidades e manter lockfile.                                                                    |
| SEG-016 | Privilégio mínimo | Usuário do banco e serviços possuem somente permissões necessárias.                                              |
| SEG-017 | Backup            | Backups, se usados, devem ser protegidos e testados quanto à restauração.                                        |
| SEG-018 | Arquivos          | MVP não deve aceitar upload; se incluído no futuro, validar tipo, tamanho e armazenamento.                       |
| SEG-019 | Expiração         | Sessões e tokens de redefinição possuem expiração e revogação.                                                   |
| SEG-020 | Concorrência      | Proteção contra dupla reserva é requisito de integridade e segurança operacional.                                |

## 3. Matriz de autorização

| **Recurso/Ação** | **Aluno**                            | **Instrutor**                   | **Administrador**  |
|---------------------|------------------------------------------|--------------------------------------|--------------------------|
| Próprio perfil   | Ler/editar limitado                  | Ler/editar limitado             | Ler/editar próprio |
| Alunos           | Somente próprio                      | Dados mínimos vinculados à aula | Gerenciar          |
| Instrutores      | Dados mínimos de aula                | Somente próprio                 | Gerenciar          |
| Veículos         | Dados mínimos de aula                | Ler vinculados                  | Gerenciar          |
| Aulas            | Próprias; agendar/cancelar por regra | Próprias; atualizar execução    | Gerenciar todas    |
| Configurações    | Não                                  | Não                             | Gerenciar          |
| Auditoria        | Não                                  | Não                             | Consultar          |

## 4. Privacidade

- Coletar apenas dados necessários para identificação, contato e operação da aula.

- Explicar finalidade dos dados em aviso de privacidade antes de uso real.

- Separar permissões de atendimento, instrução e administração quando a organização crescer.

- Mascarar documento e contato em listagens quando não forem necessários.

- Oferecer processo administrativo para correção e eventual anonimização conforme obrigações aplicáveis.

- Definir prazo de retenção com a autoescola e orientação jurídica antes de produção; o projeto acadêmico usa dados fictícios.

## 5. Ameaças e respostas

| **Ameaça**                       | **Controle principal**                       | **Teste**                                           |
|--------------------------------------|--------------------------------------------------|----------------------------------------------------------|
| Aluno acessa aula de outro aluno | Checagem de propriedade no serviço.          | IDOR com identificador alheio retorna 403/404.      |
| Dupla reserva concorrente        | Transação e restrição/bloqueio.              | Duas requisições simultâneas: somente uma confirma. |
| Força bruta no login             | Rate limit e resposta genérica.              | Excesso retorna 429 sem enumerar conta.             |
| Injeção                          | Schema, ORM/queries parametrizadas.          | Payloads maliciosos não alteram consulta.           |
| Roubo por XSS                    | HttpOnly, CSP, escape e sem HTML arbitrário. | Tentativas renderizam texto seguro.                 |
| Vazamento em logs                | Filtro de campos sensíveis.                  | Auditoria dos logs não encontra senha/token.        |
