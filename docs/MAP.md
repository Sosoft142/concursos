# Onde procurar

| Área | Fonte | Verificação |
| --- | --- | --- |
| Estrutura HTML | `dist/index.html` | navegador, larguras afetadas |
| Estilos e experiência móvel | `dist/concursos.css`, `dist/mobile.css` | navegador, 320/390/1024 px |
| Paletas do modo claro e preferências | `dist/src/appearance.js`, `settings.js` | `appearance.test.mjs`, navegador |
| Entrada e inicialização | `dist/src/app.js`, `bootstrap.js`, `state.js` | sintaxe, imports, regressão de dados |
| Dados, datas e formatação | `dist/src/domain.js` | `data.test.mjs` |
| Busca e próximo prazo | `dist/src/catalog.js` | `catalog.test.mjs` |
| Cartões e gerenciamento | `dist/src/contest-ui.js` | `contest-rendering.test.mjs`, navegador |
| Importação de arquivos e pacotes de matérias | `dist/src/importing.js`, `import-ui.js` | `importing.test.mjs`, navegador |
| Persistência, migração e backup | `dist/src/repository.js` | `data.test.mjs` |
| Navegação e abas | `dist/src/navigation.js`, `history.js` | `navigation.test.mjs` |
| Gestos | `dist/src/gestures.js` | `gestures.test.mjs`, `catalog.test.mjs`, Android |
| Renderização de estudos e comparação | `dist/src/rendering.js`, `study.js` | `study-rendering.test.mjs`, navegador |
| Editores e preferências | `dist/src/forms.js`, `settings.js` | `data.test.mjs`, navegador |
| Gist, conflitos e conexão | `dist/src/sync/engine.js` | `data.test.mjs` |
| Instalação e offline | `dist/src/pwa.js`, `dist/manifest.webmanifest`, `dist/sw.js` | `offline.test.mjs` |
| Compatibilidade das ações existentes | `dist/src/legacy-actions.js` | navegação, editores |
| Preparação e CI | `scripts/`, `.github/workflows/verify.yml` | `npm run verify` |

Todos os módulos de funcionalidades usam o contexto explícito `app` importado de `state.js`. A ponte de ações legadas existe para preservar os editores e templates atuais durante a migração; novos controles usam eventos delegados. `bootstrap.js` mantém a sequência de inicialização dos dados antigos.
