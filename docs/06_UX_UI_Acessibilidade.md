Documento: **DOC-06**

# AutoAgenda – UX, UI, interface e acessibilidade

Jornadas, arquitetura da informação, design system, responsividade e critérios WCAG.

| **Produto** | AutoAgenda                                     |
|-------------|------------------------------------------------|
| **Versão**  | 1.0 - Especificação acadêmica                  |
| **Status**  | Base para planejamento, implementação e testes |
| **Data**    | Agosto de 2026                                 |

## 1. Princípios de experiência

- Clareza: cada tela deve responder onde estou, o que posso fazer e o que aconteceu.

- Consistência: mesmos termos, estados, cores e posições para ações equivalentes.

- Prevenção: conflitos devem ser impedidos antes de o usuário concluir a operação.

- Recuperação: erros devem explicar como corrigir e preservar dados preenchidos.

- Controle: nenhuma ação destrutiva ocorre sem confirmação e consequência visível.

- Progressividade: fluxos complexos, como agendamento, são divididos em etapas curtas.

- Acessibilidade: sem depender apenas de cor, mouse ou visão perfeita.

## 2. Jornadas principais

| **Jornada**                    | **Fluxo esperado**                                                                                |
|-----------------------------------|--------------------------------------------------------------------------------------------------------|
| Aluno agenda aula              | Entrar → painel → nova aula → preferências → opções → revisão → confirmação → detalhe.            |
| Aluno cancela                  | Painel/agenda → detalhe → cancelar → ler regra → informar motivo quando solicitado → confirmar.   |
| Instrutor encerra aula         | Agenda do dia → detalhe → presença → observação → concluir → confirmação.                         |
| Administrador cria aluno       | Alunos → novo → preencher → validar → salvar → detalhe.                                           |
| Administrador bloqueia veículo | Veículos → detalhe → indisponibilidade → período/motivo → verificar impacto → confirmar.          |
| Administrador reage a conflito | Dashboard/alerta → aulas afetadas → reagendar/cancelar individualmente → registrar justificativa. |

## 3. Arquitetura da informação

| **Perfil**    | **Navegação principal**                                                  |
|-----------------|--------------------------------------------------------------------------|
| Aluno         | Início, Minha agenda, Agendar aula, Histórico, Perfil.                   |
| Instrutor     | Início, Minha agenda, Disponibilidade, Perfil.                           |
| Administrador | Início, Agenda, Alunos, Instrutores, Veículos, Configurações, Auditoria. |

## 4. Design system

| **Token/elemento** | **Especificação**                                                                                       |
|-----------------------|----------------------------------------------------------------------------------------------------------|
| Cores semânticas   | Primária azul; sucesso verde; alerta âmbar; erro vermelho; neutros. Contraste deve ser medido.          |
| Tipografia         | Fonte sem serifa; base mínima 16 px no produto; escala consistente para título, seção, corpo e legenda. |
| Espaçamento        | Escala de 4 px: 4, 8, 12, 16, 24, 32 e 48.                                                              |
| Bordas             | Raio consistente, preferencialmente 8–12 px; foco não pode ser confundido com borda comum.              |
| Alvos de toque     | Área interativa mínima recomendada de 44 × 44 px.                                                       |
| Ícones             | Sempre acompanhados de rótulo ou nome acessível quando a função não for óbvia.                          |
| Estados            | Default, hover, focus-visible, active, disabled, loading, error e success.                              |
| Status de aula     | Rótulo textual obrigatório; cor apenas como reforço.                                                    |

## 5. Requisitos de interface e acessibilidade

| **ID** | **Princípio**        | **Requisito**                                                                                                   |
|--------|--------------------------|----------------------------------------------------------------------------------------------------------------------|
| UX-001 | Hierarquia           | Uma ação primária claramente identificada por tela; ações secundárias não competem visualmente.                 |
| UX-002 | Linguagem            | Usar português brasileiro simples e termos consistentes: aula, aluno, instrutor, veículo, reagendar e cancelar. |
| UX-003 | Formulários          | Todo campo possui label persistente, instrução quando necessária e erro associado programaticamente.            |
| UX-004 | Foco                 | Foco visível; ao abrir modal, foco entra nele; ao fechar, retorna ao acionador.                                 |
| UX-005 | Teclado              | Ordem de tabulação acompanha a leitura; nenhum elemento depende somente de arrastar.                            |
| UX-006 | Semântica            | Usar landmarks, headings hierárquicos, button para ações e link para navegação.                                 |
| UX-007 | Contraste            | Texto e controles atendem, no mínimo, WCAG 2.2 nível AA.                                                        |
| UX-008 | Cor                  | Informação nunca é comunicada somente por cor.                                                                  |
| UX-009 | Erros                | Resumo de erros no topo para formulários longos e mensagem junto ao campo.                                      |
| UX-010 | Atualizações         | Mensagens de sucesso/erro dinâmicas são anunciadas por região apropriada.                                       |
| UX-011 | Responsividade       | Navegação se adapta sem esconder funções; tabelas densas viram cartões ou permitem rolagem interna rotulada.    |
| UX-012 | Datas                | Exibir dia da semana, data e horário de forma inequívoca.                                                       |
| UX-013 | Confirmação          | Resumo de agendamento repete aluno, data, intervalo, instrutor, veículo e regra de cancelamento.                |
| UX-014 | Vazios               | Estado vazio explica por que não há dados e oferece próxima ação possível.                                      |
| UX-015 | Carregamento         | Skeleton ou indicador não deve causar mudança brusca de layout.                                                 |
| UX-016 | Redução de movimento | Animações respeitam preferência de movimento reduzido.                                                          |
| UX-017 | Zoom                 | Conteúdo permanece utilizável com zoom de 200%.                                                                 |
| UX-018 | Leitores de tela     | Calendário e seletores de data possuem alternativa textual e nomes acessíveis.                                  |
| UX-019 | Mensagens            | Não usar códigos técnicos como mensagem principal; correlationId pode aparecer como referência secundária.      |
| UX-020 | Teste humano         | Os cinco avaliadores devem executar tarefas sem instrução passo a passo do desenvolvedor.                       |

## 6. Wireframes textuais mínimos

## Dashboard do aluno

- Cabeçalho com saudação e perfil.

- Cartão destacado da próxima aula.

- Ações Agendar aula e Ver agenda.

- Lista curta do histórico recente.

## Agenda

- Título e seletor de período.

- Filtros recolhíveis no celular.

- Lista cronológica com status textual.

- Botão de nova aula conforme permissão.

## Assistente de agendamento

- Indicador Etapa 1 de 3.

- Preferências e botão Buscar horários.

- Opções em cartões selecionáveis.

- Resumo final antes de confirmar.

## Detalhe da aula

- Status e data como informação dominante.

- Blocos de aluno, instrutor e veículo.

- Histórico de mudanças.

- Ações condicionais no final ou barra fixa móvel.

## 7. Checklist de revisão visual

- Nenhum texto cortado em 320 px.

- Não existe rolagem horizontal global.

- Foco é visível em todos os controles.

- Estados disabled e loading são diferentes e compreensíveis.

- Mensagens não dependem de cor.

- Modal não perde foco e pode ser fechado de modo previsível.

- Tamanhos, cores e espaçamentos usam tokens.

- Ações destrutivas não são a opção visual padrão.
