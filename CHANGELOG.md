# Histórico

## 0.33.3 — 08/11/2026

- Corrige regressão da 0.33.2: documentos salvos sem `id` pelo próprio editor deixavam de ser aceitos na abertura e na sincronização. O formato histórico volta a ser aceito, mantendo documentos e progresso.
- Sessões protegidas exportam a cópia local original; mensagens identificam campos incompatíveis e explicam bloqueio de envio sem sobrescrever a nuvem.
- Testes reproduzem salvar/reabrir/enviar/baixar com documentos legados; 112 testes e verificação em navegador com nuvem simulada.

## 0.33.2 — 07/11/2026

- Restauração e carga remota validadas antes de substituir dados; armazenamento ilegível e falhas de gravação preservam a cópia anterior.
- Sincronização com operação exclusiva, revisão de envio congelada, proteção de edições durante download e descarte de respostas após desconexão. Reconexão de rede tenta novamente.
- Conexão lê o gist completo antes de confirmar a substituição, percorre páginas e recupera conteúdo truncado sem repassar credenciais ao host de arquivos.
- Editor mantém URLs e marcações dos tópicos preservados após inserção/reordenação; novos IDs não colidem com matérias existentes ou históricas.
- Histórico de questões mostra primeiro o registro mais novo na mesma data; notas pendentes são gravadas ao ocultar/sair do app.
- Importação recusa estrutura e datas inválidas; renderização protege links, cores e textos de conteúdo externo. Fontes e documentos vazios permanecem vazios após migração.
- Cartões arquivados alinhados; teclado ignora abas ocultas e continua disponível depois de deslizar. Mensagens distinguem envio pendente de concluído.
- Check-up documentado em `docs/CHECKUP-0.33.2.md`; 107 testes automatizados.

## 0.33.1 — 07/11/2026

- Busca em uma barra única, com filtro compacto na mesma linha; removidas as caixas sobrepostas e o contador visual.
- Campo com rótulo curto, foco visível e contagem acessível de resultados; busca por cargo/banca e filtros mantidos.
- Deslize entre abas funciona também sobre botões, links e caixas de estudo; o arraste evita cliques acidentais, mantendo toques simples, rolagem vertical e edição dos campos.

## 0.33.0 — 07/11/2026

- Identidade visual por área: índigo em Concursos, verde em Estudos, ameixa em Comparar e âmbar em prazos, com fundos e cabeçalhos coloridos.
- Cartões incorporam a cor do concurso em toda a superfície; inscrições, provas e ações ficam delimitadas em grupos próprios.
- Ícones lineares e arredondados alinhados às referências Silhuetta e Retomar; engrenagem, nuvem, calendário e comparação mais reconhecíveis.
- Nuvem SVG com estado acessível; os identificadores históricos dos ícones e os estados de sincronização são mantidos.
- Nova camada de estilo incluída nos arquivos da raiz e no cache offline.

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
