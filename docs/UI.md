# Critérios de interface — Concursos

A interface é exclusivamente clara, com composição editorial: formas retas, cantos discretos de 3–6 px, divisórias e áreas de cor bem delimitadas. A identidade da versão 0.34.0 usa IBM Plex Sans para leitura, Space Grotesk para títulos e numerais e ícones Material Sharp. Fontes locais fazem parte do cache offline; o símbolo de formatura continua identificando a instalação.

| Área ou função | Cor | Aplicação |
| --- | --- | --- |
| Concursos | Azul-petróleo como padrão | Navegação, busca e título da lista |
| Estudos | Verde | Cabeçalho e painel de preparação |
| Comparar | Terracota | Cabeçalho e navegação da comparação |
| Prazos e inscrições | Ocre | Resumo de datas e bloco de inscrição |
| Cada concurso | Cor cadastrada | Superfície, borda, símbolo e ação de abrir |
| Revisões, flashcards, ciclo, edital e questões | Cores das ferramentas | Abas e ícones coerentes dentro do painel |

- Preparação IBGE: Meu plano prioriza próxima sessão e acesso ao cronograma. Estudos começa com a semana; revisões, ciclo e edital ficam abaixo. Sessões e prazos da seleção são grupos distintos. Conclusões de sessões não estimam domínio nem acertos.
- A cor de destaque personalizada continua aplicada a Concursos e às janelas gerais. Estudos e Comparar mantêm identidades próprias.
- Cor não é o único identificador: manter texto, ícones e datas. Erro, conflito e urgência continuam com rótulos.
- Busca em uma única linha, sem painel externo: campo e filtro compacto compartilham a borda. Contagem de resultados fica disponível para leitores de tela.
- Priorizar título, cargo e datas. Ações secundárias ficam separadas; área de toque suficiente não exige ícone gigante.
- SVGs Material Sharp preenchidos, alinhados na mesma caixa; controles mantêm nomes acessíveis. Preservar IDs históricos usados por dados e preferências. Créditos e licenças em `dist/THIRD-PARTY-NOTICES.txt`.
- Navegação por faixas e linhas de seleção; cartões com bordas discretas, cabeçalhos sólidos por área e campos brancos. Evitar bases arredondadas aninhadas.
- Nuvem em SVG, com descrição de estado e animação apenas durante sincronização. Não mudar os critérios que confirmam uma sincronização.
- `identity.css` organiza a identidade visual; estilos estruturais e responsivos continuam nos arquivos base. `npm run build` inclui essa camada na raiz compatível e no cache.
- Conferir visualmente lista preenchida, título longo, aba de estudos, comparação, editor e menor largura antes de publicar. Verificar contraste, rolagem, controles e ausência de transbordamento do documento.
- Preservar dados, backup, sincronização, histórico, gestos e confirmação de descarte.
- Cartões, botões e links permitem iniciar o deslize entre áreas. Só um arraste horizontal cancela o clique; campos, faixas de abas internas, tabelas horizontais e bordas do Android permanecem protegidos.
