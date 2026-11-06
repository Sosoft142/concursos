# Concursos — desenvolvimento

- Leia `docs/CURRENT.md` e `docs/MAP.md`; use `rg -n` e leituras por trecho.
- Fonte pública em `dist/`; arquivos da raiz são gerados por `npm run build` para preservar o Pages existente.
- Preserve URL, identidade PWA, `ocdf-prep`, `ocdf:sync`, `organizador-concursos.json`, IDs e formato de backup.
- Novas funcionalidades usam módulos ES e eventos delegados. Mantenha a compatibilidade das ações antigas isolada em `legacy-actions.js`.
- Preserve dados, recuperação, funcionamento offline e confirmação de descarte. Gestos não podem interceptar rolagem vertical, campos, tabelas horizontais ou as bordas de Voltar do Android.
- Faça testes relacionados durante o trabalho; antes de integrar, execute `npm run verify`, confira mudanças geradas e a CI. Mudanças visuais exigem inspeção no navegador nas larguras afetadas.
- Consulte fontes atuais e editais oficiais para atualizar oportunidades; registre a data da verificação e diferencie concurso efetivo, seleção CLT e contratação temporária.
- Mantenha o estado atual e o mapa curtos. Atualize a documentação quando mudar comportamento ou versão.
