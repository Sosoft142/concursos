# Concursos

Organizador de editais e estudos, com uso prioritário no celular.

Produção: https://sosoft142.github.io/concursos/

- [Estado atual](docs/CURRENT.md)
- [Mapa de código](docs/MAP.md)
- [Critérios de interface](docs/UI.md)
- [Pesquisa de concursos — 06/11/2026](docs/OPORTUNIDADES-2026-11-06.md)
- [Histórico de versões](CHANGELOG.md)

## Desenvolvimento

Sem framework, bundler ou dependências de produção. Requer Node.js 22 para os comandos de desenvolvimento.

```sh
npm test
npm run verify
npm run context -- status
npm run context -- read dist/src/navigation.js 1 100
```

A fonte pública é `dist/`. `npm run build` prepara os arquivos de compatibilidade na raiz, necessários ao GitHub Pages existente. Não edite `index.html`, `sw.js` ou `manifest.webmanifest` da raiz diretamente.

O caminho público, os ícones, as chaves de armazenamento e o formato do Gist foram preservados. Os dados pessoais continuam no aparelho e, quando conectado, no Gist configurado pela pessoa. Recuperar o código do GitHub não recupera automaticamente essas fichas pessoais.

As ações antigas têm uma camada de compatibilidade isolada em `legacy-actions.js`; os módulos acessam o estado compartilhado explicitamente. Funcionalidades novas usam eventos delegados. O formato atual de sincronização continua sendo o do Concursos, sem converter os dados para o formato do Retomar.

## Importar um concurso pronto

Na aba Concursos, escolha **Importar concurso**, selecione o arquivo `.json`, confira a prévia e toque em **Adicionar ao app**. Também é possível colar o texto de uma ficha existente. A importação acrescenta itens, preserva dados anteriores e usa a sincronização configurada no aparelho.

O pacote portátil tem `tipo: "concursos-pacote"`, `versao: 1`, `materias: [...]` e `concursos: [...]`. As matérias têm os campos `id`, `n`, `t`, `dica` e `mat`; concursos referenciam seus identificadores em `mats` e no conteúdo. Backups completos continuam no fluxo **Restaurar backup**.
