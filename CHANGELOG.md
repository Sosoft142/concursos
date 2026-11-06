# Histórico

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
