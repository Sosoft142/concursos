# Preparação IBGE — versão 0.35.0

Conferência: 12/11/2026. Perfil: Recenseador do 12º Censo Agropecuário, Florestal e Aquícola, Edital 03/2026; contratação temporária. Prova prevista em 31/01/2027, das 13h às 17h, horário de Brasília.

## Acesso e organização

Meu plano mostra a próxima sessão, progresso da semana e botão Ver cronograma. Estudos começa com o calendário, fora do painel de ferramentas; o menu lateral abre diretamente essa região. A ficha, a lista do edital, revisões, questões, flashcards e ciclo continuam disponíveis. A nova preparação não interfere em outros concursos.

## Rotina sugerida

Sem horários fixos, com quatro sessões semanais de uma hora. A primeira semana começa em 12/11 e tem apenas quinta e sexta; o total exibido acompanha a semana parcial. Ajustar rotina permite mudar início, dias e duração (30/45/60/90 min).

| Dia | Matéria | Duração padrão |
| --- | --- | --- |
| Segunda | Conhecimentos Técnicos | 60 min |
| Terça | Língua Portuguesa | 60 min |
| Quinta | Conhecimentos Técnicos | 60 min |
| Sexta | Matemática | 60 min |

A distribuição padrão acompanha a participação nas 60 questões: Técnicos 30, Português 15, Matemática 15. Com outros dias selecionados, o algoritmo mantém a rotação ponderada no conjunto das sessões, podendo variar a divisão em uma semana isolada.

| Período padrão | Objetivo |
| --- | --- |
| 12/11 a 17/12/2026 | Base do edital: leitura e exercícios |
| 18/12/2026 a 16/01/2027 | Consolidação e correção de dificuldades |
| 17 a 28/01/2027 | Revisão final, questões e simulados |
| 29 e 30/01/2027 | Revisão leve, documentos e descanso |

Português e Matemática usam os tópicos efetivamente vinculados à ficha. O algoritmo distribui todos antes da revisão final no plano padrão. Técnicos usa uma divisão pedagógica da apostila atual em oito trechos semelhantes, com sessões de leitura, recuperação e aplicação. Essa divisão não inventa capítulos oficiais nem marca a apostila inteira como aprendida.

Simulados completos sugeridos em 17 e 24/01/2027, com até quatro horas adicionais cada, fora das quatro horas semanais. Utilizar material externo com 30/15/15 questões, incluindo o tempo de cartão-resposta. O app não gera uma prova oficial nem atribui acertos automaticamente. Os acertos reais continuam no registro de questões.

## Dados e comportamento

- O plano é derivado sem gravar nada durante a renderização. Rotina/conclusões persistem em `d.planoIBGE`, dentro do backup e do payload de sincronização já existentes.
- Gravação prepara e valida o próximo estado antes de persistir e adotá-lo. Falha de espaço não troca o estado em memória nem agenda envio. Erro aparece em todas as áreas.
- A chave de conclusão inclui data, matéria, conteúdo e duração. Alterar o conteúdo ou a duração não reaproveita indevidamente uma marca; o histórico anterior é preservado.
- Concluir uma sessão é separado dos estágios Estudei/Revisei/Questões. Não altera acertos, documentos ou marcas anteriores.
- Pacote incorporado acrescenta ficha/matérias apenas pela ação Preparar IBGE. A ficha existente é respeitada; uma ficha arquivada é restaurada com seu progresso.
- Nenhuma chave de armazenamento, nome de Gist, identidade PWA ou formato geral de backup foi trocado. A extensão do plano é opcional; backups anteriores continuam aceitos.

## Fontes e limites da conferência

- [Edital 03/2026 — documento integral do IBGE, cópia no Qconcursos](https://arquivos.qconcursos.com/regulamento/arquivo/102908/ibge-2027-03-2026-ibge3-manual-edital.pdf): itens 10.1–10.6 (PDF p. 31); conteúdo no Anexo III (PDF p. 138); datas no Anexo IV (PDF pp. 139–140). Consultado em 12/11/2026.
- [Cesgranrio — seleção 33](https://concursos.cesgranrio.org.br/portal/avaliacoes/33): canal oficial para inscrição, apostila, cartão e comunicados. O portal respondeu sem texto legível nesta conferência; não foi possível confirmar diretamente a lista mais recente de retificações. Por isso o app mantém as datas como previstas e aponta para a banca.
- [IBGE — notícia estadual da seleção](https://www.ibge.gov.br/meu-estado/es/noticia/21147-inscricoes-abertas-para-448-vagas-para-recenseador-do-12-censo-agropecuario-florestal-e-aquicola-no-es/): resultado indexado consultado, corroborando inscrição até 25/11 e prova prevista em 31/01.

Não foram acrescentadas disciplinas de outros cargos. O material técnico deve ser o da seleção atual de Recenseador, acessado na banca. As divisões de estudo e a carga semanal são sugestões do organizador, distintas do cronograma oficial.

## Revisão e testes

- `npm run verify`: 127 testes, sintaxe dos módulos, imports, preparação estática e diferenças. Regressões existentes de sync, documentos sem id, recuperação, importação, navegação, gestos e offline preservadas.
- Novos testes: distribuição 50/25/25, cobertura do edital, limites de datas/semanas, revisão final, simulados adicionais, rotina alternativa, configuração nula, IDs de conclusão, importação/reimportação e recuperação de arquivados.
- Persistência: backup e payload incluem a conclusão; ausência de alterações no aprendizado; documentos legados preservados; quota e estado protegido impedem mutação/envio.
- Navegador: preparação em estado isolado com concurso e marca anterior, reabertura após concluir sessão e salvar rotina 45/60 min, navegação por semanas, acesso à matéria correta, rejeição de dias vazios e cancelamento.
- Revisão visual em quadros de 320/390/760/1024 px; larguras úteis 305/375/745/1009 devido à barra de rolagem. Sem transbordamento horizontal observado. Console sem erros do app na sessão verificada.
- Limites: testes em navegador responsivo, sem aparelho Android físico; sincronização testada por payload e regressões automatizadas, sem credenciais pessoais nem alteração do Gist real durante a conferência.

## Capturas

- [Resumo no celular](screenshots/0.35.0-home.jpg)
- [Cronograma no celular](screenshots/0.35.0-calendar-mobile.jpg)
- [Semana completa no computador](screenshots/0.35.0-calendar-desktop.jpg)
