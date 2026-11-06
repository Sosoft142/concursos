# Revisão 0.31.0 — 06/11/2026

## Desempenho

Comparação em Chrome de teste, no mesmo ambiente, usando 12 matérias com 100 tópicos cada e todas recolhidas. Medida de `renderCheck()` com `performance.now()`: 11 execuções, duas de aquecimento e mediana das nove seguintes. A lista é medida no painel oculto, como na montagem inicial do app; não é um teste de inicialização completa nem uma medição no celular físico.

| Medida | 0.30.1 | 0.31.0 |
| --- | ---: | ---: |
| Tempo mediano de montar a lista | 37,9 ms | 0,4 ms |
| Elementos dentro da lista | 14.520 | 132 |
| Tópicos montados enquanto recolhidos | 1.200 | 0 |

Ao expandir uma matéria, os seus controles são montados com o progresso atual. Ao recolher, o conteúdo é liberado. A contagem e a barra de progresso ficam sempre disponíveis. Não há alteração de IDs, chaves de armazenamento, backup ou payload de sincronização.

Busca: normalização textual guardada em WeakMap, invalidada quando os campos pesquisáveis mudam. Busca vazia dispensa o índice. Digitar e filtrar não reconstroem o resumo e as boas-vindas. Próximo prazo usa uma passagem, com prioridade da inscrição nos empates e ordem estável entre concursos.

## Visual e interação

Revisão em quadros de 320, 390, 760 e 1024 px, com ficha IBGE e concurso de teste com título e cargo longos. Larguras efetivas sem modal: 305, 375, 745 e 1009 px, devido à barra de rolagem do navegador de teste. Sem transbordamento horizontal do documento nas telas inspecionadas.

- Cartões, busca, filtros, comparação, matérias recolhidas e expandidas, editor e registro de questões inspecionados.
- Formulário de 320 px: Salvar e Cancelar lado a lado; remoção em linha própria; caixas sem transbordamento.
- Controles de remover e ordenar separados dos rótulos e campos; textos de apoio e foco mais legíveis.
- Registro de questões: campos de 46 px no celular, com rótulos que permanecem após digitar. Registro de 20 questões e 14 acertos confirmado como 70% no histórico.
- Marcação de estudo confirmada após fechar e reabrir a matéria.
- Busca por “pesquisa social” mostrou uma de duas fichas sem modificar o resumo geral.

Dados de teste em armazenamento isolado, sem credenciais ou sincronização real com Gist. Gestos e sensação de fluidez em aparelho físico não foram medidos nesta revisão.

## Regressão

`npm run verify`: testes de dados, recuperação, importação, sincronização, navegação, gestos, busca, montagem sob demanda e offline; sintaxe dos módulos, imports locais, artefatos gerados e whitespace. A integração depende também da CI do repositório.
