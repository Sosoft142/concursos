import { app } from './state.js';
import { ACCENTS, ACCENT_TEXT } from './appearance.js';

export function start() {
  app.APP_VERSAO = '0.34.0';
  app.SEED = {
    materias: [{
      id: 'lp',
      n: 'Língua Portuguesa',
      dica: 'teoria 25 min + questões da banca 25 min',
      mat: [],
      t: ['Interpretação e compreensão de texto', 'Ortografia e acentuação', 'Classes de palavras', 'Concordância nominal e verbal', 'Regência nominal e verbal', 'Crase', 'Pontuação', 'Coesão e coerência', 'Emprego dos pronomes', 'Sintaxe da oração', 'Redação oficial e reescrita']
    }, {
      id: 'rlm',
      n: 'Raciocínio Lógico e Matemática',
      dica: 'só questões — aprende-se resolvendo, não lendo teoria',
      mat: [],
      t: ['Estruturas lógicas', 'Lógica de argumentação', 'Diagramas lógicos', 'Porcentagem e regra de três', 'Razão e proporção', 'Análise combinatória e probabilidade', 'Aritmética básica']
    }, {
      id: 'dconst',
      n: 'Direito Constitucional',
      dica: 'letra de lei — leia a Constituição junto com o resumo',
      mat: [],
      t: ['Princípios fundamentais', 'Direitos e garantias fundamentais', 'Direitos sociais', 'Organização do Estado', 'Organização dos Poderes', 'Administração Pública (arts. 37 a 41)', 'Controle de constitucionalidade']
    }, {
      id: 'dadm',
      n: 'Direito Administrativo',
      dica: 'letra de lei + jurisprudência básica',
      mat: [],
      t: ['Princípios da Administração Pública', 'Atos administrativos', 'Poderes administrativos', 'Licitações e contratos', 'Agentes públicos', 'Improbidade administrativa', 'Processo administrativo']
    }, {
      id: 'info',
      n: 'Informática',
      dica: 'questões de prova — a banca repete muito',
      mat: [],
      t: ['Sistemas operacionais', 'Editores de texto e planilhas', 'Internet e navegadores', 'Correio eletrônico', 'Segurança da informação', 'Backup e armazenamento em nuvem']
    }, {
      id: 'atual',
      n: 'Atualidades e Legislação',
      dica: 'leitura de notícias + resumo semanal',
      mat: [],
      t: ['Atualidades nacionais', 'Atualidades internacionais', 'Meio ambiente e sustentabilidade', 'Legislação específica do órgão', 'Ética no serviço público']
    }],
    concursos: []
  };
  app.CORES = [{
    k: 'violet',
    n: 'Roxo'
  }, {
    k: 'teal',
    n: 'Verde-água'
  }, {
    k: 'blue',
    n: 'Azul'
  }, {
    k: 'amber',
    n: 'Âmbar'
  }, {
    k: 'green',
    n: 'Verde'
  }, {
    k: 'orange',
    n: 'Laranja'
  }, {
    k: 'magenta',
    n: 'Magenta'
  }, {
    k: 'rose',
    n: 'Vermelho'
  }];
  /* Sem flashcards de fábrica: os decks e os cards são criados por quem usa. */
  app.SEED.decks = [];
  app.SEED.cards = [];
  /* =====================================================================
     DADOS DE FÁBRICA que também passam a ser editáveis
     ===================================================================== */
  app.SEED.fontes = [{
    id: 'oficiais',
    n: 'Fontes oficiais',
    sub: 'publicações e portais do governo',
    ic: 'i4',
    cor: 'green',
    itens: [{
      b: 'Diário Oficial da União',
      s: 'in.gov.br',
      u: 'https://www.in.gov.br/'
    }, {
      b: 'gov.br — Concursos e seleções',
      s: 'gov.br',
      u: 'https://www.gov.br/pt-br/servicos/inscrever-se-em-concurso-publico'
    }, {
      b: 'Portal da Transparência',
      s: 'portaldatransparencia.gov.br',
      u: 'https://portaldatransparencia.gov.br/'
    }]
  }, {
    id: 'bancas',
    n: 'Bancas examinadoras',
    sub: 'quem organiza e aplica as provas',
    ic: 'i33',
    cor: 'violet',
    itens: [{
      b: 'Cebraspe (Cespe)',
      s: 'cebraspe.org.br',
      u: 'https://www.cebraspe.org.br/concursos/'
    }, {
      b: 'FGV Conhecimento',
      s: 'conhecimento.fgv.br',
      u: 'https://conhecimento.fgv.br/concursos'
    }, {
      b: 'FCC — Fundação Carlos Chagas',
      s: 'concursosfcc.com.br',
      u: 'https://www.concursosfcc.com.br/'
    }, {
      b: 'Cesgranrio',
      s: 'cesgranrio.org.br',
      u: 'https://www.cesgranrio.org.br/'
    }]
  }, {
    id: 'portais',
    n: 'Portais & agregadores',
    sub: 'listas, previstos e notícias',
    ic: 'i6',
    cor: 'amber',
    itens: [{
      b: 'PCI Concursos',
      s: 'pciconcursos.com.br',
      u: 'https://www.pciconcursos.com.br/'
    }, {
      b: 'Folha Dirigida',
      s: 'folhadirigida.com.br',
      u: 'https://folhadirigida.com.br/concursos'
    }, {
      b: 'Estratégia Concursos',
      s: 'estrategiaconcursos.com.br',
      u: 'https://www.estrategiaconcursos.com.br/blog/'
    }, {
      b: 'Gran Cursos — Notícias',
      s: 'grancursosonline.com.br',
      u: 'https://www.grancursosonline.com.br/noticias-concursos'
    }]
  }];
  app.SEED.docs = [];
  app.SEED.metas = {
    alvo: 70,
    blocosDia: 2,
    blocoMin: 45,
    revisao: [1, 7],
    fciv: [1, 3, 7, 16, 35],
    fcDia: 0
  };
  app.SEED.ciclo = {
    modo: 'auto',
    blocos: []
  };
  /* =====================================================================
     ESTADO — tudo o que você marca e tudo o que você cadastra
     ===================================================================== */
  app.LSK = 'ocdf-prep';
  app.persistOk = true;
  app.S = {};
  app.arranqueDuvidoso = false;
  app.arranqueCorrompido = false;
  app.arranqueVazio = false;
  app.gravacaoPendente = false;
  app.guardaAvisou = false;
  (function () {
    var bruto = null;
    try {
      bruto = localStorage.getItem(app.LSK);
    } catch (e) {
      app.persistOk = false;
    }
    app.marcarArranque(bruto);
    app.carregarEstado(bruto);
  })();
  if (!app.S || typeof app.S !== 'object') app.S = {};
  app.S.t = app.S.t || {};
  app.S.cy = app.S.cy || {};
  app.S.fc = app.S.fc || {};
  app.S.ui = app.S.ui || {};
  app.DADOS = app.S.d && app.S.d.concursos && app.S.d.materias ? app.S.d : JSON.parse(JSON.stringify(app.SEED));
  app.migrarDados();
  /* registro de questões: totais por matéria viram lançamentos com data */
  if (!Array.isArray(app.S.qzl)) {
    app.S.qzl = [];
    Object.keys(app.S.qz || {}).forEach(function (id) {
      var q = app.S.qz[id];
      if (q && q.f > 0) app.S.qzl.push({
        id: 'q' + app.S.qzl.length + '-' + id,
        d: '',
        m: id,
        f: q.f,
        a: q.a
      });
    });
  }
  delete app.S.qz;
  app.S.d = app.DADOS;
  app.FMT_A = String.fromCharCode(1);
  app.FMT_B = String.fromCharCode(2);
  app.FMT_OK = {
    b: 'b',
    strong: 'b',
    i: 'i',
    em: 'i',
    small: 'small',
    u: 'u',
    br: 'br'
  };
  app.MAT = [];
  app.CICLOS = {};
  app.TIPOS = {
    lei: {
      i: 'i15',
      l: 'Lei seca'
    },
    apostila: {
      i: 'i0',
      l: 'Apostila'
    },
    video: {
      i: 'i26',
      l: 'Videoaulas'
    },
    quest: {
      i: 'i10',
      l: 'Questões'
    },
    resumo: {
      i: 'i17',
      l: 'Resumo'
    },
    site: {
      i: 'i14',
      l: 'Site'
    }
  };
  app.uiTimer = null;
  window.addEventListener('resize', app.pnavHintAll);
  /* setas do teclado percorrem as abas, como manda o padrão de tablist */
  document.addEventListener('keydown', function (e) {
    if (['ArrowRight', 'ArrowLeft', 'Home', 'End'].indexOf(e.key) < 0) return;
    var el = document.activeElement;
    if (!el || !el.classList) return;
    var grupo = null;
    if (el.classList.contains('pnav-b')) grupo = [].slice.call(document.querySelectorAll('.pnav-b[data-e="' + el.getAttribute('data-e') + '"]'));else if (el.classList.contains('tab')) grupo = [].slice.call(document.querySelectorAll('.tabs .tab'));
    if (grupo) grupo = grupo.filter(button => !button.hidden && getComputedStyle(button).display !== 'none');
    if (!grupo || grupo.length < 2) return;
    e.preventDefault();
    var i = grupo.indexOf(el),
      n = grupo.length;
    var j = e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : e.key === 'ArrowRight' ? (i + 1) % n : (i - 1 + n) % n;
    grupo[j].focus();
    grupo[j].click();
  });
  /* ---------- destaque no menu lateral ---------- */
  app.SECINFO = {
    raiox: {
      n: 'Onde focar',
      full: 'Onde focar',
      i: 'i23',
      c: 'var(--rose)'
    },
    conteudo: {
      n: 'Conteúdo',
      full: 'Conteúdo programático',
      i: 'i0',
      c: 'var(--amber)'
    },
    provas: {
      n: 'Provas',
      full: 'Etapas e provas',
      i: 'i10',
      c: 'var(--blue)'
    },
    cronograma: {
      n: 'Cronograma',
      full: 'Cronograma',
      i: 'i11',
      c: 'var(--orange)'
    },
    atribuicoes: {
      n: 'Atribuições',
      full: 'Atribuições do cargo',
      i: 'i12',
      c: 'var(--green)'
    },
    links: {
      n: 'Links',
      full: 'Links do concurso',
      i: 'i13',
      c: 'var(--magenta)'
    },
    notas: {
      n: 'Notas',
      full: 'Minhas anotações',
      i: 'i17',
      c: 'var(--teal)'
    }
  };
  app.PNSECS = [{
    p: 'hoje',
    n: 'Revisões',
    full: 'Revisões de hoje',
    i: 'i21',
    c: 'var(--amber)'
  }, {
    p: 'flash',
    n: 'Flashcards',
    full: 'Flashcards',
    i: 'i27',
    c: 'var(--magenta)'
  }, {
    p: 'ciclo',
    n: 'Ciclo',
    full: 'Ciclo de estudos',
    i: 'i20',
    c: 'var(--teal)'
  }, {
    p: 'check',
    n: 'Lista do edital',
    full: 'Lista do edital',
    i: 'i10',
    c: 'var(--violet)'
  }, {
    p: 'quiz',
    n: 'Questões',
    full: 'Registro de questões',
    i: 'i22',
    c: 'var(--green)'
  }];
  app.CMPSECS = [{
    p: 'formato',
    n: 'Como é cada prova',
    full: 'Como é cada prova',
    i: 'i18',
    c: 'var(--orange)'
  }, {
    p: 'matriz',
    n: 'Matérias × concursos',
    full: 'Matérias × concursos',
    i: 'i14',
    c: 'var(--blue)'
  }, {
    p: 'comum',
    n: 'Estude uma vez',
    full: 'Estude uma vez',
    i: 'i12',
    c: 'var(--teal)'
  }, {
    p: 'exclusivo',
    n: 'Só de cada',
    full: 'Só de cada concurso',
    i: 'i15',
    c: 'var(--violet)'
  }];
  app.notaTimer = null;
  app.modalFechavel = true;
  /* o foco fica preso dentro do modal enquanto ele estiver aberto */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab') return;
    var m = document.querySelector('#modal-root .modal');
    if (!m) return;
    var f = [].slice.call(m.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select,textarea')).filter(function (x) {
      return x.offsetParent !== null;
    });
    if (!f.length) return;
    var pri = f[0],
      ult = f[f.length - 1];
    if (!m.contains(document.activeElement)) {
      e.preventDefault();
      pri.focus();
      return;
    }
    if (e.shiftKey && document.activeElement === pri) {
      e.preventDefault();
      ult.focus();
    } else if (!e.shiftKey && document.activeElement === ult) {
      e.preventDefault();
      pri.focus();
    }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && app.modalFechavel) app.modalFechar();
  });
  app.ED = null;
  app.EDnovo = false;
  app.edOpen = {};
  app.FFN = 0;
  app.EM = null;
  app.FE = null;
  app.ICONES_GRUPO = [['i4', 'Órgão oficial'], ['i33', 'Bancas'], ['i6', 'Portais e notícias'], ['i1', 'Busca'], ['i16', 'Lista'], ['i11', 'Calendário'], ['i15', 'Documento'], ['i14', 'Site']];
  app.ICONES_DOC = [['i16', 'Lista / índice'], ['i11', 'Calendário'], ['i15', 'Documento'], ['i17', 'Caderno'], ['i0', 'Apostila'], ['i14', 'Site'], ['i22', 'Planilha']];
  app.FO = null;
  app.DO = null;
  app.ME = null;
  app.CI = null;
  app.ACENTOS = ACCENTS;
  app.ACENTO_TEXTO = ACCENT_TEXT;
  app.OCULTAVEIS = [{
    id: 'flash',
    n: 'Flashcards',
    onde: 'aba do painel de estudos'
  }, {
    id: 'ciclo',
    n: 'Ciclo',
    onde: 'aba do painel de estudos'
  }, {
    id: 'quiz',
    n: 'Questões',
    onde: 'aba do painel de estudos'
  }, {
    id: 'check',
    n: 'Lista do edital',
    onde: 'aba do painel de estudos'
  }, {
    id: 'comparar',
    n: 'Comparar',
    onde: 'aba do topo'
  }, {
    id: 'fontes',
    n: 'Onde encontrar novos concursos',
    onde: 'seção da aba Concursos'
  }, {
    id: 'docs',
    n: 'Meus documentos',
    onde: 'bloco dentro do painel'
  }];
  app.CG = null;
  app.SYNC_KEY = 'ocdf:sync';
  app.GIST_FILE = 'organizador-concursos.json';
  app.syncToken = '';
  app.gistId = '';
  app.lastSyncedAt = '';
  app.dataUpdatedAt = '';
  app.syncState = 'off';
  app.syncMsg = '';
  app.syncBusy = false;
  app.syncTimer = null;
  app.syncAt = '';
  window.addEventListener('online', () => app.syncAoAbrir());
  window.addEventListener('pagehide', () => app.flushPendingSaves());
  document.addEventListener('visibilitychange', () => {if(document.hidden)app.flushPendingSaves();});
  app.fltr = 'all';
  app.ckOpen = {};
  app.qzEditando = null;
  app.fcQ = [];
  app.fcIdx = 0;
  app.fcRev = false;
  app.fcHits = 0;
  app.fcMiss = 0;
  app.fcActive = false;
  (function stamp() {
    try {
      var d = new Date();
      var s = '08/11/2026';
      var el = document.getElementById('upd');
      if (el) el.textContent = s;
      var v = document.getElementById('appver');
      if (v) v.textContent = 'V' + app.APP_VERSAO;
    } catch (e) {}
  })();
  app.aplicarAcento();
  app.loadSync();
  app.renderTudo();
  app.explInit();
  setTimeout(app.guardaResolver, 120);
  app.saveS({
    noStamp: true,
    noSync: true
  });
  if (app.arranqueCorrompido) alert('Não consegui abrir os dados salvos neste aparelho. A cópia original foi preservada. Você pode copiar um backup ou baixar sua cópia da nuvem.\n\n'+(app.erroDados||''));
  app.renderPill();
  app.togglePainel(app.S.ui.pn3 !== 0);
  if (app.syncState === 'on') setTimeout(app.syncAoAbrir, 400);
  /* a contagem se corrige sozinha ao virar o dia ou ao voltar para o app */
  (function relogio() {
    var dia = app.hoje();
    function conferir() {
      if (app.hoje() === dia) return;
      dia = app.hoje();
      app.rebuildCiclos();
      app.renderCards();
      app.renderAccs();
      app.fase();
      app.renderRev();
      app.renderFlash();
      app.renderCiclo();
      app.pnBadges();
    }
    setInterval(conferir, 300000);
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) conferir();
    });
  })();
  /* ---------- Cabeçalho auto-oculto (mobile) + voltar ao topo ---------- */
  (function () {
    var h = document.querySelector('header.top');
    if (!h) return;
    var last = window.scrollY || 0,
      tick = false;
    function upd() {
      var y = window.scrollY || 0;
      if (y <= 60) h.classList.remove('nav-hidden');else if (y > last + 4) h.classList.add('nav-hidden');else if (y < last - 4) h.classList.remove('nav-hidden');
      var tt = document.getElementById('toTop');
      if (tt) tt.classList.toggle('show', y > 900);
      last = y;
      tick = false;
    }
    window.addEventListener('scroll', function () {
      if (!tick) {
        requestAnimationFrame(upd);
        tick = true;
      }
    }, {
      passive: true
    });
  })();
  /* =====================================================================
     APP INSTALÁVEL (PWA) — ícone na tela inicial, na aba e nos favoritos
     O manifesto está em manifest.webmanifest. O mesmo endereço sw.js
     preserva o escopo das instalações anteriores e prepara o uso offline.
     ===================================================================== */

  /* Falha de registro não impede acesso on-line nem altera dados salvos. */
  if ('serviceWorker' in navigator && window.isSecureContext) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () {});
    });
  }
  app.pwaPrompt = null;
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    app.pwaPrompt = e;
    app.pwaBotao();
  });
  window.addEventListener('appinstalled', function () {
    app.pwaPrompt = null;
    app.pwaBotao();
  });
  app.pwaBotao();
}
