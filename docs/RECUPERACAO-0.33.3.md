# Correção de recuperação e sincronização — 0.33.3

08/11/2026. Corrige a regressão introduzida na validação da versão 0.33.2.

O editor de documentos (`doSalvar`) grava entradas `{n, ic, u}`, sem identificador. O validador novo exigia `id` também nessas entradas, classificando uma cópia produzida pelo próprio app como inválida. A mesma regra era aplicada ao armazenamento local e à cópia do gist, bloqueando abertura, envio e download.

A validação dos documentos agora respeita o formato histórico. Permanecem as verificações de estrutura e dos identificadores que são necessários em concursos, matérias, decks, cards e grupos de fontes. Não há remoção de documentos nem recriação de seus dados para contornar a falha.

Dados que tenham sido protegidos pela versão anterior são lidos novamente na próxima abertura da versão corrigida. Não é necessário apagar o armazenamento nem desconectar a conta. Caso outro formato não possa ser aberto, a exportação manual conserva o texto original em vez de gerar um backup vazio; as mensagens passam a indicar o campo incompatível quando identificado. Um envio bloqueado por proteção local informa esse motivo sem alterar a nuvem.

Verificação: `npm run verify`, 112 testes. Inclui o ciclo real de serialização pelo editor de documentos, reabertura local, upload e download com respostas controladas, recuperação de sessão protegida e preservação integral do original. O teste adicionado reproduziu a falha na versão 0.33.2 antes da correção.

No navegador em 390 px: documento legado carregado, marcação de estudo mantida, três consultas e um envio concluído com uma nuvem simulada; [captura](screenshots/0.33.3-sync.jpg). Não foram usadas credenciais ou cópias reais da conta pessoal.
