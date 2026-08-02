# docs/

Academic specification set for AutoAgenda (Projeto Integrador II), received and committed here as the durable source of truth for product, architecture, and quality decisions.

| Document | Title |
|---|---|
| `00_Indice_Geral_AutoAgenda.md` | Índice geral da documentação |
| `01_Visao_Escopo_Requisitos_Negocio.md` | Visão, escopo e requisitos de negócio |
| `02_Requisitos_Funcionais_Casos_de_Uso.md` | Requisitos funcionais e casos de uso |
| **DOC-03** | **Missing — never supplied.** See below. |
| `04_Especificacao_BackEnd_API.md` | Especificação do back-end e da API |
| `05_Banco_de_Dados_Dicionario.md` | Banco de dados e dicionário de dados |
| `06_UX_UI_Acessibilidade.md` | UX, UI, interface e acessibilidade |
| `07_Seguranca_Privacidade_Auditoria.md` | Segurança, privacidade e auditoria |
| `08_Plano_de_Testes_Qualidade.md` | Plano completo de testes e qualidade |
| `09_Arquitetura_DevOps_Operacao.md` | Arquitetura, DevOps e operação |
| `10_Plano_Academico_Rastreabilidade.md` | Plano acadêmico e matriz de rastreabilidade |

The subfolders (`01-planejamento/` … `08-video/`) mirror the artifact structure DOC-10 §3 defines for UML sources, wireframes, database decisions, API docs, test evidence, evaluator forms, and the demo video — they start empty and get populated as those artifacts are produced.

## DOC-03 is missing

The index (DOC-00 §2) references **DOC-03 — Especificação do front-end** (routes, screens, states, components, forms, integration), but it was never provided along with the other 10 documents. This is not expected to arrive later: front-end routing, screen structure, and visual/design conventions are owned by the project itself rather than derived from a missing document. See the root [CLAUDE.md](../CLAUDE.md) for the conventions that fill this gap (front-end best-practices skill usage, design-token consistency, componentization).

## Reconciling with the code

Where this spec set and what's actually implemented disagree, `CLAUDE.md`'s "Reconciling with the academic spec" section is authoritative — it records each deliberate deviation and why, since those decisions are still pending confirmation with the professor (DOC-10 §8).
