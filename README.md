# STOA Management

Portefólio em francês da Suíça. Next.js 16, React 19, TypeScript, Tailwind v4 e next-intl. Trabalho na branch `nouveau-site`, sem ligação ao deployment do projeto que serviu de base.

## Desenvolvimento

```sh
npm ci
npm run dev
```

Usar Node 22.15 ou posterior (os testes usam `module.registerHooks`). Copiar `.env.example` para `.env.local` apenas se for configurar o envio. O site funciona sem serviço de email; nesse caso o formulário informa que não enviou.

## Verificação

```sh
npm run lint
npm run tipos
npm run mensagens
npm run testes
npm run build
npm run segredos
```

O build local é uma pré-visualização com `noindex`. `STOA_PUBLICATION=1 npm run build` gera a versão pública, excluindo projetos provisórios. A variável deve ter o mesmo valor ao construir e ao arrancar o servidor. Nunca promover projetos a validados por dedução.

## Organização

- `src/data/`: factos, projetos, equipa e manifesto de media.
- `messages/fr-CH.json`: textos públicos e textos alternativos.
- `src/lib/movimento/`: um único mecanismo de scroll, com desmontagem.
- `src/lib/contacto/`: validação, proteção contra spam e envio no servidor.
- `public/medias/`: derivados otimizados; originais preservados fora de public.

Documentação: [direção artística](docs/direction-artistique.md), [inventário](docs/inventaire-medias.md), [formulário](docs/formulaire-contact.md), [validações pendentes](docs/a-confirmer.md).

Nenhum envio real de email foi validado com credenciais STOA. A revisão visual e de acessibilidade final continua pendente; os resultados da sessão anterior não substituem uma nova verificação após alterações.
