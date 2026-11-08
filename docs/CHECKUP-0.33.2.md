# Check-up geral — 0.33.2

**Atualização de 08/11:** a validação desta versão introduziu uma regressão com documentos sem `id`. Corrigida em [0.33.3](RECUPERACAO-0.33.3.md), com teste do formato realmente salvo pelo editor.

Revisão de 07/11/2026. Base: versão 0.33.1. Repositório: Sosoft142/concursos.

## Correções

| Área | Falha encontrada | Comportamento corrigido |
| --- | --- | --- |
| Restauração | JSON como `{}` ou estruturas inválidas podiam apagar progresso ou falhar depois de alterar o estado | Validação antes da substituição; backups antigos de progresso continuam aceitos; versões futuras são recusadas |
| Gravação | Download atualizava a memória e a revisão sincronizada mesmo se o armazenamento falhasse | Cópia validada e migrada é gravada antes de substituir a sessão; falha mantém a cópia anterior |
| Arranque | Dados ilegíveis podiam ser sobrescritos pelo salvamento inicial; recuperação tardia dependia de haver matérias | Original ilegível fica protegido; recuperação reconhece também concursos sem matérias e progresso sem concursos |
| Anotações | Texto ainda no atraso de salvamento podia se perder ao sair imediatamente | Ao ocultar ou sair da página, o app descarrega gravações pendentes de notas e interface |
| Envio | Alterações durante PATCH podiam ser consideradas enviadas; requisições simultâneas se sobrepunham | Revisão enviada fica congelada, novas alterações continuam pendentes e só há uma operação ativa |
| Download | Resposta atrasada podia substituir edição local recém-salva ou ignorar um rascunho aberto | Confere a revisão local e os editores antes de aplicar a nuvem; divergências ficam para resolução explícita |
| Conexão | A lista de gists não continha o backup completo, pulando a confirmação; só os cem primeiros eram examinados | Busca o conteúdo antes da confirmação e percorre as páginas antes de criar outra cópia |
| Desconexão | Respostas em andamento podiam recolocar o estado conectado | Respostas de uma conexão encerrada são ignoradas |
| Recuperação de rede | Estado de erro interrompia as próximas tentativas automáticas | Novas alterações e o retorno da conexão permitem nova consulta; conflitos continuam exigindo escolha |
| Cópias grandes | Conteúdo truncado da API era ilegível | Lê `raw_url` HTTPS do host de gists, sem repassar token ou cookies; limite de leitura de 10 MB |
| Exclusão intencional | “Manter o deste aparelho” continuava impedido quando a lista estava vazia | Envio forçado respeita a escolha explícita; envio automático mantém a proteção contra esvaziar a nuvem |
| Matérias | Inserir/reordenar tópicos deslocava marcas; salvar removia URLs de tópicos | Tópicos mantidos levam suas marcas e URLs, inclusive ocorrências repetidas; tópicos novos começam sem marcas |
| Identificadores | Matéria nova antes de outra existente podia repetir seu ID | Reserva os IDs existentes e os que ainda têm histórico antes de gerar novos |
| Questões | Registros da mesma data apareciam com os antigos primeiro; os mais novos podiam sair dos doze visíveis | Empates de data respeitam a ordem de inclusão mais recente |
| Conteúdo externo | Alguns links, cores e nomes de flashcards ainda entravam sem proteção adequada | Links renderizados aceitam HTTP/HTTPS; cores de concurso usam a paleta; textos e atributos são escapados |
| Importação | Estruturas internas e datas inválidas podiam quebrar a renderização depois da gravação | São recusadas na prévia; mensagem de erro é trazida para a área visível |
| Migração | Apagar todas as fontes/documentos podia trazê-los de volta na próxima abertura | Lista vazia é preservada; padrões só preenchem campos ausentes |
| Cartões arquivados | Estrutura antiga de três blocos conflitava com o layout atual de duas colunas | Conteúdo e ações ficam nos mesmos dois blocos usados pelo restante da lista |
| Teclado e gesto | Abas ocultas entravam na navegação por setas; supressão após arraste bloqueava ativações de teclado | Teclado percorre apenas abas visíveis e sua ativação continua disponível após deslize |
| Mensagens | Notas diziam “enviadas” assim que o envio era agendado | Interface diferencia alterações pendentes de sincronização concluída; token fica em campo mascarado |

Ao alterar o nome de um tópico, ele passa a ser tratado como um tópico novo. A associação das marcas usa o texto mantido e a ordem de ocorrência, preservando o formato histórico dos dados.

## Validação

- `npm run verify`: 107 testes aprovados, sintaxe dos módulos, importações locais, geração estática e verificação de diferenças.
- Base anterior: 73 testes. Foram acrescentados 34 casos de regressão; os testes de cache passaram a resolver URLs absolutas como o navegador.
- Persistência e nuvem: cenários com rede atrasada, operações simultâneas, desconexão, falha de armazenamento, cópia incompleta, paginação e conteúdo truncado. Utilizam respostas controladas, sem acessar ou alterar o gist pessoal.
- Navegador em 320, 390 e 1024 px: cadastro, busca, importação válida/inválida, abertura do concurso importado, marcação e edição de tópicos, questões, preferências, arquivamento e restauração.
- Verificado na interface: inserir um tópico acima de outro marcado manteve Estudei/Revisei no texto original; registro novo na mesma data passou a aparecer primeiro; cancelar prévia de cor restaurou a cor salva; tecla End ignorou Comparar oculto.
- Gestos: seis cenários no navegador com eventos sintéticos, cobrindo deslize sobre botão/link/cabeçalho, rolagem vertical e exclusão de campos/tabela horizontal; aprovados.
- Offline: testes do worker cobrem instalação, módulos em cache, navegação sem rede, limpeza isolada de caches e ausência de HTML como resposta para um módulo inexistente.
- Conferência visual da proteção de importação: [captura em 390 px](screenshots/0.33.2-validation.jpg).

A identidade PWA, a URL, os nomes das chaves de armazenamento, o arquivo do gist e o formato de backup foram preservados. O worker inclui o novo módulo de validação no cache.

## Limites

Não foi realizado teste no Android físico nem sincronização entre dois aparelhos com credenciais reais. Instalação PWA e recuperação após encerramento pelo sistema operacional dependem dessa conferência. O funcionamento offline foi verificado por testes automatizados do worker; o ambiente de navegador não disponibilizou controle de rede para uma sessão offline real.

A prévia teve interrupções de carregamento; após sua retomada, os fluxos acima foram concluídos. Uma revisão com testes não permite afirmar ausência de todos os bugs.

Referência consultada para a API de gists: https://docs.github.com/en/rest/gists/gists.
