# Critérios de interface — Concursos

A interface é exclusivamente clara. Referências: ícones lineares do Silhuetta e do Retomar, bases arredondadas, cores suaves em áreas amplas e controles proporcionais ao conteúdo. Esta aplicação mantém o próprio símbolo de formatura.

| Área ou função | Cor | Aplicação |
| --- | --- | --- |
| Concursos | Índigo como padrão | Navegação, busca e título da lista |
| Estudos | Verde | Cabeçalho e painel de preparação |
| Comparar | Ameixa | Cabeçalho e navegação da comparação |
| Prazos e inscrições | Âmbar | Resumo de datas e bloco de inscrição |
| Cada concurso | Cor cadastrada | Superfície, borda, símbolo e ação de abrir |
| Revisões, flashcards, ciclo, edital e questões | Cores das ferramentas | Abas e ícones coerentes dentro do painel |

- A cor de destaque personalizada continua aplicada a Concursos e às janelas gerais. Estudos e Comparar mantêm identidades próprias.
- Cor não é o único identificador: manter texto, ícones e datas. Erro, conflito e urgência continuam com rótulos.
- Busca em uma única linha, sem painel externo: campo e filtro compacto compartilham a borda. Contagem de resultados fica disponível para leitores de tela.
- Priorizar título, cargo e datas. Ações secundárias ficam separadas; área de toque suficiente não exige ícone gigante.
- SVG com traço de 1,75, extremidades arredondadas e nomes acessíveis nos controles. Preservar IDs históricos usados por dados e preferências.
- Nuvem em SVG, com descrição de estado e animação apenas durante sincronização. Não mudar os critérios que confirmam uma sincronização.
- `identity.css` organiza a identidade visual; estilos estruturais e responsivos continuam nos arquivos base. `npm run build` inclui essa camada na raiz compatível e no cache.
- Conferir visualmente lista preenchida, título longo, aba de estudos, comparação, editor e menor largura antes de publicar. Verificar contraste, rolagem, controles e ausência de transbordamento do documento.
- Preservar dados, backup, sincronização, histórico, gestos e confirmação de descarte.
- Cartões, botões e links permitem iniciar o deslize entre áreas. Só um arraste horizontal cancela o clique; campos, faixas de abas internas, tabelas horizontais e bordas do Android permanecem protegidos.
