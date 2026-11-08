# Revisão visual 0.34.0 — 08/11/2026

A nova identidade utiliza cantos de 3–6 px, navegação por faixas, divisórias e regiões de cor. Azul-petróleo identifica Concursos, verde profundo Estudos, terracota Comparar e ocre os prazos. O modo claro permanece exclusivo.

IBM Plex Sans atende textos e campos; Space Grotesk atende títulos e numerais. Ambas são locais, com cache offline. Os ícones Material Sharp substituem a família anterior mantendo os identificadores usados nas fichas. As licenças acompanham os arquivos publicados.

## Conferência

- Navegador nas larguras 320, 390, 760 e 1024 px: cartões, título longo, busca, datas e navegação; sem transbordamento horizontal do documento.
- Estudos: cabeçalho, painel de preparação, abas internas, matéria expandida e controles de progresso.
- Comparar: cabeçalho e fichas lado a lado em navegação horizontal interna.
- Editor em 320 px: cabeçalho, rótulos, campos e ações fixas; confirmação de descarte preservada.
- Fontes carregadas e família calculada confirmadas no navegador; console sem erros do app na sessão verificada.
- `npm run verify`: 112 testes aprovados, incluindo cache das duas fontes, contraste, referências SVG e regressões de persistência/sincronização.
- Dados públicos de teste e um concurso explicitamente fictício em ambiente isolado. Nenhum dado ou credencial pessoal foi enviado pela prévia. Datas da ficha IBGE não foram pesquisadas novamente nesta alteração visual.

A validação responsiva foi feita em navegador, sem aparelho Android físico. A implementação de gestos e sincronização não foi alterada.

## Capturas

- [Celular — 390 px](screenshots/0.34.0-mobile.jpg)
- [Estudos e lista do edital](screenshots/0.34.0-studies.jpg)
- [Editor — 320 px](screenshots/0.34.0-editor-320.jpg)
- [Computador — 1024 px](screenshots/0.34.0-desktop.jpg)
