# AGENTS.md

Site da **STOA Management** (direção de obras, Farvagny-le-Grand, FR).
Next.js 16 · React 19 · TypeScript · Tailwind v4 · next-intl (`fr-CH`).

## Fluxo de trabalho: branches, nunca worktrees

**Não usar a ferramenta `EnterWorktree` nem criar git worktrees neste projeto.**
Para isolar trabalho, criar uma branch normal (`git checkout -b <nome>`) e
commitar aí: uma branch aparece em `git branch` e num PR; um worktree só
aparece a quem se lembra de o procurar.

## Antes de dizer que algo está pronto

```bash
npm run lint
npm run tipos
npm run mensagens
npm run testes
npm run build        # é aqui que o zod valida src/data/
npm run segredos     # depois do build
```

E **olhar para as páginas**: o movimento (herói, pilha de projetos, rodapé)
não é apanhado por nenhum teste. Ver `docs/direction-artistique.md`.

## Língua

- **Código, variáveis, funções e comentários em português** (a equipa que o
  mantém é portuguesa). Comentários explicam **porquê**, não o quê.
- **Tudo o que o público lê está em francês da Suíça** (`fr-CH`), em
  `messages/fr-CH.json`: curto, concreto, sem travessões visíveis, com espaço
  fino antes de `; ! ?` e apóstrofo tipográfico (`’`).

## As regras que dão erro visível

### Factos em `src/data/`, texto em `messages/`

O que é igual em qualquer língua (morada, contactos, locais, datas, ids de
imagens) vive em `src/data/`. O que muda com a língua (títulos, resumos,
rótulos, textos alternativos) vive em `messages/fr-CH.json`.

### `null` quer dizer "não confirmado"

Um campo a `null` **desaparece do site**, sem rótulo vazio. ⚠️ **Nunca
preencher por dedução**: nem o estado de uma obra pelo aspeto da fotografia,
nem o local pelas coordenadas GPS de um ficheiro, nem uma função de alguém pelo
que parece. Só entra o que a STOA confirmar. A lista do que falta está em
`docs/a-confirmer.md`.

### Não inventar

Nada de prémios, certificações, testemunhos, números de projetos, montantes,
áreas, prazos ou qualificações. Nada de pessoas, funções, biografias ou
retratos de banco de imagens na equipa. Nada de edifícios alterados ou
fictícios apresentados como obras reais.

### Provisório até ser validado

`src/lib/publicacao.ts` decide o modo:

- **aperçu** (desenvolvimento, pré-visualizações): tudo visível, com o selo
  "Provisoire" no que não está confirmado, e o site inteiro com `noindex`;
- **publicação** (`VERCEL_ENV=production` ou `STOA_PUBLICATION=1`): só o que
  está `validado` em `src/data/projetos.ts`; a equipa só com perfis completos;
  o método e as imagens institucionais (herói, apresentação, competências,
  contacto, partilha) só com `validado` em `src/data/validacoes.ts`.

Um projeto passa a `validado` com a STOA — nome, local, missão e direito de
publicar as imagens —, não porque o site já parece pronto.

### As referências são de colaboradores

As quatro referências vêm do site atual e foram **missões de colaboradores da
STOA, em colaboração com outras empresas**. Manter as atribuições tal como lá
estão (`realizadoPor: "colaborador"`, `colaboracao`, `pessoa`).

### As fotografias passam pelo `npm run medias`

Os originais (`Photo pour site /`, `sources/`) nunca mudam. O que o site usa
sai de `scripts/preparar-medias.mjs` para `public/medias/`, **sem metadados**
(as fotografias do iPhone trazem GPS). Uma imagem nova entra em
`src/data/medias.json`; o texto alternativo em `messages/fr-CH.json`
(`medias.<id>`). Nunca ampliar acima do original.

### O herói tem geometria medida

O recorte do edifício e a posição da marca estão em píxeis do original, em
`src/data/heroi.ts`. Trocar a fotografia do herói é medir outra vez.

### Um só mecanismo de movimento

`src/lib/movimento/progresso.ts` escreve `--p` (0 a 1) e o CSS faz o resto.
Nada de GSAP, Lenis ou outro motor por cima — dois motores a mexer nos mesmos
elementos é o erro que isto evita. Tudo tem de funcionar parado (sem
JavaScript e com `prefers-reduced-motion`).

### Nada de terceiros sem decisão explícita

Mapa embebido, vídeo do YouTube, estatísticas, widget de redes: **não entram
sem rever a CSP (`src/lib/cabecalhos.ts`) e o texto sobre dados da página de
contacto**. O CI falha se aparecer um recurso de fora no HTML.

### O formulário nunca finge

O formulário de contacto só diz "enviado" quando o serviço de email aceitou.
Sem configuração, diz que não está ligado e dá os contactos diretos — também em
desenvolvimento. Ver `docs/formulaire-contact.md`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
