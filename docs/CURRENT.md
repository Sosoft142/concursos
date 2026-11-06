# Estado atual — Concursos

- Versão: **0.31.0**. Produção: https://sosoft142.github.io/concursos/.
- Repositório: `Sosoft142/concursos`, branch principal `main`.
- PWA sem framework ou bundler; fonte pública em `dist/`, com módulos ES e CSS separado. Organização inspirada no Retomar.
- Raiz do Pages preservada por arquivos gerados. `npm run build` prepara shell, manifesto e workers compatíveis.
- Cartões priorizam título, cargo, prova, inscrição e vagas; engrenagem abre gerenciamento. Busca sem acentos e filtros de inscrição.
- Importação por arquivo JSON ou texto, com prévia antes de adicionar. Pacotes `concursos-pacote`, versão 1, incluem concursos e matérias; IDs em colisão são remapeados sem alterar marcações existentes. Reimportação mantém fichas já cadastradas. A gravação usa o fluxo normal de sincronização.
- Navegação inferior no celular; editor com campos essenciais primeiro, informações opcionais recolhidas e rótulos associados aos campos.
- Gestos de toque: arraste com acompanhamento entre abas, abertura do menu pela primeira aba e fechamento lateral. Intenção horizontal e distância/velocidade mínimas; exclusão de campos, controles, áreas horizontais e bordas do sistema.
- Voltar percorre áreas e fecha menus/janelas; usa a ação real do editor, preservando confirmação de descarte.
- Chaves `ocdf-prep` e `ocdf:sync`, arquivo Gist `organizador-concursos.json`, esquema e identidade PWA mantidos.
- Worker prepara módulos para offline, limita limpeza aos caches do Concursos e não devolve HTML para módulos ausentes.
- Pesquisa datada em [OPORTUNIDADES-2026-11-06.md](OPORTUNIDADES-2026-11-06.md). Critérios pessoais de região/escolaridade ainda não constam do repositório; pesquisa inicial com foco no DF.
- Otimização: tópicos são montados só nas matérias abertas; busca indexada atualiza apenas a lista, e próximo prazo usa uma passagem. Marcações continuam em `S.t`, sem mudar o formato dos dados.
- Revisão das caixas: rótulos e campos legíveis, controles de linha separados, rodapé dos modais organizado e ficha com textos de apoio. Registro de questões tem rótulos persistentes.
- Validação e medição desta revisão: [REVISAO-0.31.0.md](REVISAO-0.31.0.md).
- Verificação: `npm run verify`; resultados completos em `.work/verification.log`. Testes de domínio, persistência, migração, sync, navegação, gestos e offline.
- Limite da validação: testes de eventos de toque e revisão responsiva em navegador; a sensação e a integração com o gesto nativo devem ser conferidas também no aparelho Android físico.
