# Verificação — 30 de setembro de 2026

Retoma do trabalho na branch `nouveau-site`.

- Lint, TypeScript, mensagens e 28 testes: passaram.
- Build de pré-visualização: 23 páginas geradas; verificação de segredos passou (sem valores sentinela nesta execução).
- Build público: 13 páginas geradas, incluindo apenas quatro referências históricas; verificação de segredos passou.
- Verificação HTTP: inicial, portefólio, contacto, referência histórica, 404 e projeto provisório nos dois modos.
- Browser: hero revisto visualmente; largura 320 confirmada sem overflow horizontal; menu mobile abre com foco no botão de fechar e fecha com Escape.
- Tentativa de viewport 2560: browser reportou 1704 px efetivos. Não contabilizar como teste a 2560.

## Ainda pendente

- Revisão integral das animações, preferência de movimento reduzido e teste real a 2560 px.
- Confirmar o aviso de script na página 404 em produção.
- Revisão visual das páginas interiores após alterações futuras.
- Envio e receção reais com credenciais próprias da STOA.
- Execução do workflow em GitHub Actions: o ficheiro foi adaptado localmente, mas não foi enviado ao GitHub.

Nenhuma publicação, push ou alteração ao deployment foi feita nesta retoma.
