# Histórico

## 0.32.0 — 06/11/2026

- Tema exclusivamente claro em páginas, campos, menu, janelas e instalação PWA; sem alternância automática pelo sistema.
- Nova paleta com contraste de texto e botões verificado; azul como padrão para novas configurações e compatibilidade com cores já escolhidas.
- Gradientes decorativos, brilho, transparência do cabeçalho e sombras dos cartões removidos; tipografia única e navegação mais discreta.
- Fontes para novos concursos recolhidas em uma seção que pode ser aberta também pelo menu lateral.
- Ícones de instalação atualizados para a nova identidade de cores, preservando o desenho e o endereço do app.
- Fechar configurações desfaz a prévia de cor que não foi salva.

## 0.31.0 — 06/11/2026

- Lista do edital monta tópicos sob demanda e libera os controles ao recolher a matéria, preservando o progresso.
- Busca reaproveita o índice textual e atualiza apenas a lista; próximo prazo calculado em uma passagem com empate estável.
- Caixas e formulários com rótulos maiores, foco visível e controles de remover/reordenar em uma faixa própria.
- Janelas no celular organizam Salvar e Cancelar na mesma linha e separam a remoção. Títulos de seções, textos longos e ficha do cargo têm melhor distribuição.
- Registro de questões com rótulos permanentes e campos uniformes.

## 0.30.1 — 06/11/2026

- Importação de concursos por arquivo JSON, com prévia e alternativa de colar texto.
- Pacotes podem incluir matérias e tópicos novos; colisões de IDs são remapeadas e reimportações não duplicam fichas.
- Importação preserva os demais concursos e progresso; ficha e matérias seguem juntas no payload de sincronização existente.
- Validação de formato, versão, referências de matérias e links antes de modificar os dados.

## 0.30.0 — 06/11/2026

- Código separado em módulos ES, estilos, dados de instalação, testes e documentação, seguindo a organização do Retomar.
- Cartões com informações legíveis e ações secundárias no gerenciamento; busca e filtros de inscrição.
- Navegação inferior e editores adaptados ao celular, com campos opcionais recolhidos.
- Gestos de toque com acompanhamento do arraste; histórico para Voltar em áreas, janelas e menu.
- Cache completo para uso offline e proteção dos caches de outros aplicativos.
- Preservados endereço, dados, backups, sincronização e identidade da instalação existente.
- Pesquisa inicial de novos editais com fontes e data de conferência.

## 0.29

Versão recuperada do repositório, com a aplicação concentrada em `index.html` e worker opcional.
