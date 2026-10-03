# UX/UI e protótipo

## Decisão de escopo: sem protótipo separado

O PDF do PI II pede para "revisar o protótipo" do Projeto Integrador I. Esse documento nunca existiu para este projeto — `docs/README.md` já registra que o DOC-03 (especificação de front-end, que incluiria o protótipo) nunca foi entregue, e que rotas/telas/componentes passaram a ser decisão própria do projeto (ver "Front-end conventions and design consistency" no `CLAUDE.md`).

Em vez de construir um protótipo Figma/no-code só para satisfazer o item do PDF, a decisão foi: **a aplicação React implementada é o próprio protótipo de alta fidelidade**, já com dados reais, navegação real e o design system definido em `apps/web/tailwind.config.js`. As capturas em `capturas/` são a evidência dessas telas rodando.

## Jornadas

Ver `jornadas.md` para o passo a passo de cada perfil.

## Design system

Paleta, tipografia, espaçamento e componentes seguem `docs/06_UX_UI_Acessibilidade.md` (base 16px, escala de espaçamento 4px, contraste AA) e as convenções Tailwind do `CLAUDE.md` ("Styling conventions") — sem valores arbitrários, tokens nomeados em `tailwind.config.js`.
