# Entrada e transições — plano de implementação

> **Para agentes:** SUB-SKILL OBRIGATÓRIO: usar superpowers:subagent-driven-development (recomendado) ou superpowers:executing-plans para executar este plano tarefa a tarefa. Os passos usam caixas (`- [ ]`) para acompanhar.

**Objetivo:** o herói da página inicial constrói-se à chegada (linha do edifício → obra → STOA) e a troca de páginas passa por uma cortina onde uma linha desenha a folha do logótipo e o nome STOA MANAGEMENT.

**Arquitetura:** tudo em CSS (animações, `stroke-dashoffset`, `clip-path`), com o estado escrito no `<html>` (`data-movimento`, que já existe, e `data-cortina`, novo). A geometria sai de `src/data/heroi.ts`; a decisão "há cortina?" é uma função pura em `src/lib/movimento/cortina.ts`; um só componente cliente, montado no layout, liga o clique à cortina.

**Tecnologia:** Next.js 16 (App Router), React 19, TypeScript, CSS simples (`inicio.css`, `site.css`), testes com `node --test` (`npm run testes`).

**Spec:** `docs/superpowers/specs/2026-09-30-entrada-e-transicoes-design.md` (esboço da folha: `docs/superpowers/specs/2026-09-30-folha-esboco.svg`).

## Restrições globais

- Código, nomes e comentários em português; comentários dizem **porquê**.
- Nada de GSAP, Lenis ou bibliotecas novas: um só motor de movimento (CSS + `src/lib/movimento/progresso.ts`).
- Sem JavaScript ou com `prefers-reduced-motion`: nem construção nem cortina. Tudo depende de `html[data-movimento]`.
- O título e os botões do herói visíveis e clicáveis desde o primeiro instante.
- As animações da construção **não tocam** em `scale` do `<img>` do herói nem em `translate` do `<text>` da marca (são do `--p`).
- Os cartões de projeto mantêm o morph: sem cortina (`data-sem-cortina`).
- A folha é provisória: em publicação só com `validado` em `src/data/validacoes.ts`; sem isso a cortina desenha só o nome.
- Nenhum recurso de fora; a CSP (`src/lib/cabecalhos.ts`) não muda.
- Antes de dar por acabado: `npm run lint`, `npm run tipos`, `npm run mensagens`, `npm run testes`, `npm run build`, `npm run segredos` — e olhar para as páginas.

## Pontos a rever (o que nenhum teste unitário apanha)

1. **A cortina nunca fica presa**: navegação que falha, link para a mesma página com outra query, clique duplo — a cortina sai ao fim de 5 s no máximo. Teste: `deveCobrir` recusa o mesmo caminho (Tarefa 4); o limite de 5 s verifica-se à mão (Tarefa 6, passo 3).
2. **Links com Ctrl/⌘ ou botão do meio** abrem noutro separador e não podem deixar a página atual tapada. Teste na Tarefa 4.
3. **Mudar de língua** (`/` → `/pt`) é uma navegação com cortina e tem de sair na página nova (o caminho muda). Teste na Tarefa 4 (caminhos diferentes cobrem); verificação à mão na Tarefa 6.
4. **O contorno do herói fica colado ao edifício** em 320–2560 px, deitado e de pé. Teste: o contorno usa só pontos do `recorte` (Tarefa 1); o resto à vista (Tarefa 6).
5. **A construção não estraga a aproximação ao rolar**: rolar a meio da construção não pode fazer a fotografia saltar. Verificação à vista (Tarefa 6); a regra está nas restrições globais.

---

### Tarefa 1: o contorno do edifício em `heroi.ts`

**Ficheiros:**
- Modificar: `src/data/heroi.ts` (acrescentar `contorno` no fim)
- Criar: `testes/heroi.test.mjs`

**Interfaces:**
- Produz: `export function contorno(composicao: Composicao): string` — um `d` de `<path>` em píxeis do original, com os segmentos do `recorte` que não estão sobre a borda da imagem.

- [ ] **Passo 1: escrever o teste que falha**

`testes/heroi.test.mjs`:

```js
/*
  O contorno que a construção do herói desenha: só a linha do edifício, nunca
  as bordas da fotografia (que o recorte usa para fechar o polígono).
*/
import { test } from "node:test";
import assert from "node:assert/strict";
import { HEROI, contorno } from "../src/data/heroi.ts";

/** Lê "M1 2L3 4..." como troços de pontos. */
function trocos(d) {
  return d
    .split("M")
    .filter(Boolean)
    .map((troco) => troco.split("L").map((p) => p.trim().split(" ").map(Number)));
}

const naBorda = ([x1, y1], [x2, y2], { largura, altura }) =>
  (x1 === x2 && (x1 === 0 || x1 === largura)) || (y1 === y2 && (y1 === 0 || y1 === altura));

for (const [nome, composicao] of Object.entries(HEROI)) {
  test(`contorno (${nome}): nenhum segmento sobre a borda da imagem`, () => {
    for (const troco of trocos(contorno(composicao))) {
      for (let i = 1; i < troco.length; i++) {
        assert.ok(!naBorda(troco[i - 1], troco[i], composicao), `${troco[i - 1]} → ${troco[i]}`);
      }
    }
  });

  test(`contorno (${nome}): todos os outros segmentos do recorte estão lá`, () => {
    const { recorte } = composicao;
    const esperados = recorte
      .map((p, i) => [p, recorte[(i + 1) % recorte.length]])
      .filter(([a, b]) => !naBorda(a, b, composicao));
    const desenhados = trocos(contorno(composicao)).flatMap((troco) =>
      troco.slice(1).map((p, i) => [troco[i], p]),
    );
    assert.equal(desenhados.length, esperados.length);
    for (const [a, b] of esperados) {
      assert.ok(
        desenhados.some(([c, d]) => c[0] === a[0] && c[1] === a[1] && d[0] === b[0] && d[1] === b[1]),
        `${a} → ${b}`,
      );
    }
  });
}

test("contorno da paisagem: um só traço, da fachada esquerda à direita", () => {
  const d = contorno(HEROI.paisagem);
  assert.equal(trocos(d).length, 1);
  assert.ok(d.startsWith("M287 720L287 306.5"), d.slice(0, 40));
  assert.ok(d.endsWith("L923 720"), d.slice(-40));
});

test("contorno do retrato: um só traço, do topo ao fundo da fachada", () => {
  const d = contorno(HEROI.retrato);
  assert.equal(trocos(d).length, 1);
  assert.ok(d.startsWith("M1252 0L1252 22"), d.slice(0, 40));
  assert.ok(d.endsWith("L2780 4032"), d.slice(-40));
});
```

- [ ] **Passo 2: correr e ver falhar**

Correr: `npm run testes`
Esperado: FALHA em `heroi.test.mjs` (`contorno` não é exportado).

- [ ] **Passo 3: implementar**

No fim de `src/data/heroi.ts`:

```ts
/**
 * O traço que a construção do herói desenha: o `recorte` sem os segmentos que
 * assentam na borda da fotografia — esses só fecham o polígono, não são
 * edifício. Começa logo a seguir a um segmento de borda, para cada troço sair
 * inteiro e desenhar-se de uma ponta à outra.
 */
export function contorno({ recorte, largura, altura }: Composicao): string {
  const naBorda = ([x1, y1]: [number, number], [x2, y2]: [number, number]) =>
    (x1 === x2 && (x1 === 0 || x1 === largura)) || (y1 === y2 && (y1 === 0 || y1 === altura));

  const n = recorte.length;
  const segmentos = recorte.map((p, i) => [p, recorte[(i + 1) % n]] as const);
  const inicio = segmentos.findIndex(([a, b]) => naBorda(a, b));

  let d = "";
  let aberto = false;
  for (let k = 1; k <= n; k++) {
    const [a, b] = segmentos[(inicio + k + n) % n];
    if (naBorda(a, b)) {
      aberto = false;
      continue;
    }
    if (!aberto) {
      d += `M${a[0]} ${a[1]}`;
      aberto = true;
    }
    d += `L${b[0]} ${b[1]}`;
  }
  return d;
}
```

- [ ] **Passo 4: correr e ver passar**

Correr: `npm run testes`
Esperado: todos a passar (34 antigos + 6 novos).

- [ ] **Passo 5: commit**

```bash
git add src/data/heroi.ts testes/heroi.test.mjs
git commit -m "Herói: o contorno do edifício, para a construção à entrada"
```

---

### Tarefa 2: a construção do herói

**Ficheiros:**
- Modificar: `src/components/inicio/Heroi.tsx` (novo componente `Contorno`, dois usos)
- Modificar: `src/app/inicio.css` (secção do herói e bloco `@media (orientation: portrait)`)

**Interfaces:**
- Consome: `contorno(composicao: Composicao): string` (Tarefa 1).
- Produz: as classes `.heroi__contorno`, `.heroi__contorno--paisagem`, `.heroi__contorno--retrato`; a Tarefa 5 pausa as animações do herói com `html[data-cortina="entrar"] .heroi *`.

- [ ] **Passo 1: o SVG do contorno em `Heroi.tsx`**

Importar `contorno` (`import { HEROI, contorno, poligono, type Composicao } from "@/data/heroi";`). No `heroi__caixa`, logo a seguir à segunda `FotoDoHeroi` (o recorte) e antes de `heroi__aproximacao`:

```tsx
          {comFotografia && (
            <>
              <Contorno composicao={paisagem} className="heroi__contorno heroi__contorno--paisagem" />
              <Contorno composicao={retrato} className="heroi__contorno heroi__contorno--retrato" />
            </>
          )}
```

No fim do ficheiro:

```tsx
/**
 * A linha do edifício, como numa planta, desenhada à chegada antes de a obra
 * (a fotografia) aparecer. Mesmo `viewBox` da fotografia, como a marca: fica
 * presa ao edifício em qualquer ecrã. `pathLength="1"` deixa o CSS desenhá-la
 * de 1 a 0 sem saber o comprimento real.
 */
function Contorno({ composicao, className }: { composicao: Composicao; className: string }) {
  const { largura, altura } = composicao;
  return (
    <svg
      className={className}
      viewBox={`0 0 ${largura} ${altura}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <path d={contorno(composicao)} pathLength={1} />
    </svg>
  );
}
```

Acrescentar ao comentário do topo (`# O herói`), depois da lista de camadas:

```
 * **À chegada** o herói constrói-se (~1,6 s, só CSS, só com `data-movimento`):
 * a linha do edifício desenha-se, o edifício enche-se de baixo para cima, a
 * envolvente aparece e a marca sobe. O título e os botões estão lá desde o
 * início.
```

- [ ] **Passo 2: CSS da construção em `inicio.css`**

Logo a seguir ao bloco `.heroi__marca--retrato text { … }`, **substituir** o bloco `[data-movimento] .heroi__marca { animation: marca-sobe 1300ms var(--curva-saida) 120ms both; }` e o seu comentário por:

```css
/* O contorno: só existe para a construção, por isso está escondido em
   repouso (sem JavaScript, com menos movimento, depois de acabar). */
.heroi__contorno {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  pointer-events: none;
  opacity: 0;
  fill: none;
  stroke: var(--color-calcario);
  stroke-linejoin: round;
  stroke-linecap: round;
}

/* A espessura está em píxeis do original (não há `vector-effect`, que no
   Safari se dá mal com `pathLength`): ~1,5 px no ecrã em cada composição. */
.heroi__contorno--paisagem {
  stroke-width: 1.4;
}

.heroi__contorno--retrato {
  display: none;
  stroke-width: 7;
}

/* À chegada, o herói constrói-se: a linha do edifício como numa planta, a
   obra a subir dentro dela, a envolvente à volta e, por fim, a marca por
   trás. Sempre que a página abre — se a página abrir já a meio, corre fora
   do ecrã e acaba sem ninguém a ver. As animações vão para os contentores:
   o `scale` do `<img>` e o `translate` do texto da marca são do `--p`. */
[data-movimento] .heroi__contorno {
  animation: contorno-aparece 1100ms linear both;
}

[data-movimento] .heroi__contorno path {
  stroke-dasharray: 1;
  animation: contorno-desenha 600ms var(--curva-saida) both;
}

[data-movimento] .heroi__recorte {
  animation: obra-sobe 700ms var(--curva-saida) 400ms both;
}

[data-movimento] .heroi__foto:not(.heroi__recorte) {
  animation: envolvente-aparece 600ms ease 800ms both;
}

[data-movimento] .heroi__marca {
  animation: marca-sobe 650ms var(--curva-saida) 1000ms both;
}

@keyframes contorno-aparece {
  0%,
  70% {
    opacity: 1;
  }
}

@keyframes contorno-desenha {
  from {
    stroke-dashoffset: 1;
  }
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes obra-sobe {
  from {
    clip-path: inset(100% 0 0 0);
  }
  to {
    clip-path: inset(0 0 0 0);
  }
}

@keyframes envolvente-aparece {
  from {
    opacity: 0;
  }
}

@keyframes marca-sobe {
  from {
    translate: 0 7%;
    opacity: 0;
  }
}
```

(Remover o `@keyframes marca-sobe` antigo, que ficava logo abaixo do bloco substituído — não pode haver dois.)

No bloco `@media (orientation: portrait)`, a seguir a `.heroi__marca--retrato { display: block; }`:

```css
  .heroi__contorno--paisagem {
    display: none;
  }

  .heroi__contorno--retrato {
    display: block;
  }
```

- [ ] **Passo 3: verificar**

Correr: `npm run lint && npm run tipos && npm run testes`
Esperado: sem erros.

Correr `npm run dev` e abrir `http://localhost:3000/` a 1440×900 e a 390×844 (de pé). Recarregar várias vezes. Esperado: carvão → linha clara do edifício → o edifício sobe dentro da linha → a envolvente aparece → STOA sobe por trás; título e botões visíveis desde o início; a linha coincide com a platibanda e as fachadas. Rolar logo depois: a aproximação continua suave. Ativar "reduzir movimento" no sistema e recarregar: o herói aparece inteiro, sem linha.

- [ ] **Passo 4: commit**

```bash
git add src/components/inicio/Heroi.tsx src/app/inicio.css
git commit -m "Herói: construção à entrada — linha do edifício, obra, envolvente e marca"
```

---

### Tarefa 3: a folha como marca por validar

**Ficheiros:**
- Modificar: `src/data/validacoes.ts`
- Modificar: `testes/validacoes.test.mjs`
- Modificar: `docs/a-confirmer.md`

**Interfaces:**
- Produz: `export const MARCAS_INSTITUCIONAIS = { folha: "provisorio" }` e `export const marcaPublicavel = (chave: keyof typeof MARCAS_INSTITUCIONAIS) => boolean`.

- [ ] **Passo 1: estender o teste**

Em `testes/validacoes.test.mjs`, acrescentar `MARCAS_INSTITUCIONAIS` e `marcaPublicavel` ao `import` de `../src/data/validacoes.ts`, e mudar o primeiro teste para incluir as marcas:

```js
test("nada institucional está marcado como aprovado sem confirmação da STOA", () => {
  for (const [chave, estado] of Object.entries({
    ...TEXTOS_INSTITUCIONAIS,
    ...IMAGENS_INSTITUCIONAIS,
    ...MARCAS_INSTITUCIONAIS,
  })) {
    assert.equal(estado, "provisorio", chave);
  }
});
```

No teste `"em aperçu (o modo destes testes), tudo sai"`, acrescentar a última linha:

```js
  assert.equal(marcaPublicavel("folha"), true);
```

No teste `"em publicação, o provisório não sai — nem uma imagem fora da lista"` (o que corre um processo filho com `STOA_PUBLICATION=1`), acrescentar `folha: v.marcaPublicavel("folha"),` ao objeto do `JSON.stringify` do `codigo`, `folha` à desestruturação do `JSON.parse`, e no fim:

```js
  assert.equal(folha, false);
```

- [ ] **Passo 2: correr e ver falhar**

Correr: `npm run testes`
Esperado: FALHA (`MARCAS_INSTITUCIONAIS` não existe).

- [ ] **Passo 3: implementar**

Em `src/data/validacoes.ts`, a seguir a `IMAGENS_INSTITUCIONAIS`:

```ts
export const MARCAS_INSTITUCIONAIS = {
  /* A folha em linha da transição entre páginas, redesenhada a partir do
     ícone (não há vetor do logótipo). Parecida não é igual: a STOA aprova-a
     ou manda o original. */
  folha: "provisorio",
} as const satisfies Record<string, Estado>;
```

E a seguir a `textoPublicavel`:

```ts
export const marcaPublicavel = (chave: keyof typeof MARCAS_INSTITUCIONAIS) =>
  publicavel(MARCAS_INSTITUCIONAIS[chave]);
```

Em `docs/a-confirmer.md`, a seguir à linha "Logótipo vetorial e versões de contraste adequadas.":

```
- A folha em linha da transição entre páginas (`src/components/movimento/FolhaDaMarca.tsx`), redesenhada a partir do ícone: aprovação da STOA ou o vetor original. Até lá, em publicação, a transição desenha só o nome.
```

E na frase final, depois de "imagem de partilha do site", acrescentar "; a folha da transição".

- [ ] **Passo 4: correr e ver passar**

Correr: `npm run testes`
Esperado: todos a passar.

- [ ] **Passo 5: commit**

```bash
git add src/data/validacoes.ts testes/validacoes.test.mjs docs/a-confirmer.md
git commit -m "Validações: a folha da transição é provisória até a STOA a aprovar"
```

---

### Tarefa 4: quando há cortina (`deveCobrir`)

**Ficheiros:**
- Criar: `src/lib/movimento/cortina.ts`
- Criar: `testes/cortina.test.mjs`

**Interfaces:**
- Produz:

```ts
export type Clique = { botao: number; modificador: boolean; prevenido: boolean };
export type Ligacao = { href: string; target: string | null; download: boolean; semCortina: boolean };
export type Local = { href: string; movimento: boolean };
export function deveCobrir(clique: Clique, ligacao: Ligacao, local: Local): boolean;
export const TEMPO_MINIMO_MS = 850;
export const TEMPO_DE_SAIDA_MS = 300;
export const TEMPO_MAXIMO_MS = 5000;
```

- [ ] **Passo 1: escrever o teste que falha**

`testes/cortina.test.mjs`:

```js
/*
  A cortina com a folha só cobre uma navegação que vai mesmo acontecer nesta
  aba, para outra página do site. Tudo o resto — outro separador, outro site,
  uma âncora, um projeto (que tem o morph) — passa sem cortina, porque uma
  cortina que tapa uma página que não muda fica presa.
*/
import { test } from "node:test";
import assert from "node:assert/strict";
import { deveCobrir } from "../src/lib/movimento/cortina.ts";

const CLIQUE = { botao: 0, modificador: false, prevenido: false };
const LIGACAO = { href: "/contact", target: null, download: false, semCortina: false };
const LOCAL = { href: "https://stoa.ch/realisations", movimento: true };

test("um link interno para outra página cobre", () => {
  assert.equal(deveCobrir(CLIQUE, LIGACAO, LOCAL), true);
});

test("mudar de língua cobre (o caminho muda)", () => {
  assert.equal(deveCobrir(CLIQUE, { ...LIGACAO, href: "/pt/realisations" }, LOCAL), true);
});

test("sem movimento (sem JavaScript no arranque ou menos movimento) não cobre", () => {
  assert.equal(deveCobrir(CLIQUE, LIGACAO, { ...LOCAL, movimento: false }), false);
});

test("botão do meio ou com Ctrl/⌘/Shift/Alt não cobre (abre noutro sítio)", () => {
  assert.equal(deveCobrir({ ...CLIQUE, botao: 1 }, LIGACAO, LOCAL), false);
  assert.equal(deveCobrir({ ...CLIQUE, modificador: true }, LIGACAO, LOCAL), false);
});

test("um clique já tratado por outro código não cobre", () => {
  assert.equal(deveCobrir({ ...CLIQUE, prevenido: true }, LIGACAO, LOCAL), false);
});

test("target e download não cobrem; target _self cobre", () => {
  assert.equal(deveCobrir(CLIQUE, { ...LIGACAO, target: "_blank" }, LOCAL), false);
  assert.equal(deveCobrir(CLIQUE, { ...LIGACAO, download: true }, LOCAL), false);
  assert.equal(deveCobrir(CLIQUE, { ...LIGACAO, target: "_self" }, LOCAL), true);
});

test("outro site, mailto e tel não cobrem", () => {
  assert.equal(deveCobrir(CLIQUE, { ...LIGACAO, href: "https://exemplo.ch/" }, LOCAL), false);
  assert.equal(deveCobrir(CLIQUE, { ...LIGACAO, href: "mailto:info@stoa.ch" }, LOCAL), false);
  assert.equal(deveCobrir(CLIQUE, { ...LIGACAO, href: "tel:+41260000000" }, LOCAL), false);
});

test("a mesma página (âncora ou outra query) não cobre", () => {
  assert.equal(deveCobrir(CLIQUE, { ...LIGACAO, href: "/realisations#lista" }, LOCAL), false);
  assert.equal(deveCobrir(CLIQUE, { ...LIGACAO, href: "#conteudo" }, LOCAL), false);
  assert.equal(deveCobrir(CLIQUE, { ...LIGACAO, href: "/realisations?p=2" }, LOCAL), false);
});

test("a âncora de uma secção da inicial, vinda de outra página, cobre", () => {
  assert.equal(deveCobrir(CLIQUE, { ...LIGACAO, href: "/#expertises" }, LOCAL), true);
});

test("um projeto (data-sem-cortina) não cobre: fica o morph", () => {
  assert.equal(deveCobrir(CLIQUE, { ...LIGACAO, semCortina: true }, LOCAL), false);
});

test("um href que não é URL não cobre e não rebenta", () => {
  assert.equal(deveCobrir(CLIQUE, { ...LIGACAO, href: "http://[" }, LOCAL), false);
});
```

- [ ] **Passo 2: correr e ver falhar**

Correr: `npm run testes`
Esperado: FALHA (módulo `cortina.ts` não existe).

- [ ] **Passo 3: implementar**

`src/lib/movimento/cortina.ts`:

```ts
/**
 * # Quando é que a troca de página passa pela cortina
 *
 * A cortina tapa a página e só sai quando o caminho muda. Por isso só pode
 * cobrir uma navegação que vai mesmo acontecer **nesta aba** e **para outra
 * página do site** — senão fica a tapar uma página que não mudou até ao
 * limite de segurança. Os projetos ficam de fora (`data-sem-cortina`): o
 * cartão já tem o morph da fotografia, e a cortina escondia-o.
 *
 * É uma função pura para se poder testar sem browser; quem lê o evento e o
 * `<a>` é `CortinaDeNavegacao.tsx`.
 */
export type Clique = { botao: number; modificador: boolean; prevenido: boolean };
export type Ligacao = { href: string; target: string | null; download: boolean; semCortina: boolean };
export type Local = { href: string; movimento: boolean };

/** O desenho da folha e do nome leva isto; a cortina não sai antes. */
export const TEMPO_MINIMO_MS = 850;
/** O que a cortina leva a sair (tem de bater com `cortina-sai` em `site.css`). */
export const TEMPO_DE_SAIDA_MS = 300;
/** Se a página nova não chegar, a cortina sai na mesma: nunca fica presa. */
export const TEMPO_MAXIMO_MS = 5000;

export function deveCobrir(clique: Clique, ligacao: Ligacao, local: Local): boolean {
  if (!local.movimento) return false;
  if (clique.botao !== 0 || clique.modificador || clique.prevenido) return false;
  if (ligacao.semCortina || ligacao.download) return false;
  if (ligacao.target && ligacao.target !== "_self") return false;

  let destino: URL;
  let atual: URL;
  try {
    atual = new URL(local.href);
    destino = new URL(ligacao.href, atual);
  } catch {
    return false;
  }

  if (destino.origin !== atual.origin) return false;
  return destino.pathname !== atual.pathname;
}
```

- [ ] **Passo 4: correr e ver passar**

Correr: `npm run testes`
Esperado: todos a passar.

- [ ] **Passo 5: commit**

```bash
git add src/lib/movimento/cortina.ts testes/cortina.test.mjs
git commit -m "Movimento: a regra de quando a troca de página passa pela cortina"
```

---

### Tarefa 5: a cortina com a folha

**Ficheiros:**
- Criar: `src/components/movimento/FolhaDaMarca.tsx`
- Criar: `src/components/movimento/CortinaDeNavegacao.tsx`
- Modificar: `src/app/site.css` (secção nova "cortina", antes de `/* ---…--- rodapé */`)
- Modificar: `src/app/inicio.css` (pausa da construção)
- Modificar: `src/app/[locale]/layout.tsx`
- Modificar: `src/components/projetos/CartaoDeProjeto.tsx`, `src/components/inicio/ProjetosEmDestaque.tsx`

**Interfaces:**
- Consome: `deveCobrir`, `TEMPO_MINIMO_MS`, `TEMPO_DE_SAIDA_MS`, `TEMPO_MAXIMO_MS` (Tarefa 4); `marcaPublicavel("folha")` (Tarefa 3); as classes `.heroi__*` da Tarefa 2.
- Produz: `html[data-cortina="entrar" | "sair"]`; `<CortinaDeNavegacao comFolha={boolean} />`; `<FolhaDaMarca comFolha={boolean} />`.

- [ ] **Passo 1: `FolhaDaMarca.tsx`**

Os caminhos vêm do esboço aprovado (`docs/superpowers/specs/2026-09-30-folha-esboco.svg`). Cada traço leva `--i` (a ordem em que se desenha); o CSS transforma-o em atraso.

```tsx
import type { CSSProperties } from "react";

/**
 * A folha do logótipo em linha, e o nome, para a cortina entre páginas.
 *
 * ⚠️ **Provisória**: redesenhada a partir do ícone (`src/app/apple-icon.png`),
 * porque não há vetor do logótipo. É parecida, não é a marca: em publicação só
 * entra com `folha` validada em `src/data/validacoes.ts`. Quando o vetor
 * chegar, trocam-se só os caminhos daqui.
 *
 * Os traços têm `pathLength="1"` para o CSS os desenhar de 1 a 0 sem saber o
 * comprimento de cada um; `--i` é a ordem: contorno, nervura, riscas de cima
 * para baixo, aba.
 */
const TRACOS = [
  "M60 4 C 34 30, 16 60, 18 88 C 20 112, 36 126, 54 126 C 74 126, 88 110, 88 86 C 88 58, 76 32, 60 4 Z",
  "M60 6 C 62 40, 62.5 75, 60 102",
  "M45.5 20 L 61 12.8",
  "M36.2 32.5 L 61.6 21",
  "M28.5 45.2 L 62 30.2",
  "M22.7 58.1 L 62.2 40.5",
  "M19.1 71 L 62.1 52",
  "M17.8 83.8 L 61.8 64.4",
  "M19.8 98.1 L 61.2 79.5",
  "M24.7 109.4 L 60.4 93.3",
  "M30 118 C 50 112, 72 96, 87 72",
];

export function FolhaDaMarca({ comFolha }: { comFolha: boolean }) {
  return (
    <svg
      className="folha-da-marca"
      viewBox={comFolha ? "0 -2 216 132" : "100 40 116 56"}
      aria-hidden="true"
      focusable="false"
    >
      {comFolha && (
        <g className="folha-da-marca__folha" transform="translate(4 0)">
          {TRACOS.map((d, i) => (
            <path key={i} d={d} pathLength={1} style={{ "--i": i } as CSSProperties} />
          ))}
        </g>
      )}
      {/* O nome é da marca e não se traduz, como em `Marca.tsx`. */}
      <text className="folha-da-marca__nome" x="104" y="68" textLength="104" lengthAdjust="spacingAndGlyphs">
        STOA
      </text>
      <text className="folha-da-marca__segundo" x="105" y="86" textLength="102" lengthAdjust="spacing">
        MANAGEMENT
      </text>
    </svg>
  );
}
```

- [ ] **Passo 2: `CortinaDeNavegacao.tsx`**

```tsx
"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import {
  TEMPO_DE_SAIDA_MS,
  TEMPO_MAXIMO_MS,
  TEMPO_MINIMO_MS,
  deveCobrir,
} from "@/lib/movimento/cortina";
import { FolhaDaMarca } from "./FolhaDaMarca";

/**
 * # A cortina entre páginas
 *
 * Ao clicar num link do site, uma cortina tapa a página e uma linha desenha a
 * folha e o nome. Sai quando a página nova já está montada (o caminho mudou)
 * **e** o desenho acabou — ou, se a página nova nunca chegar, ao fim de
 * `TEMPO_MAXIMO_MS`. A regra de quando há cortina está em
 * `lib/movimento/cortina.ts`.
 *
 * O estado vive no `<html>` (`data-cortina="entrar" | "sair"`) e o CSS faz o
 * resto (`site.css`); a construção do herói espera por ele (`inicio.css`).
 * Os botões "anterior"/"seguinte" do browser não passam por aqui — não há
 * clique — e ficam com o fade das View Transitions.
 */
export function CortinaDeNavegacao({ comFolha }: { comFolha: boolean }) {
  const caminho = usePathname();
  const caminhoAtual = useRef(caminho);
  const pedido = useRef<{ inicio: number; caminho: string } | null>(null);
  const relogios = useRef<number[]>([]);
  /* O `sair` nasce no primeiro efeito (precisa do `<html>`) e o segundo efeito
     chama-o quando o caminho muda. */
  const sairRef = useRef<() => void>(() => {});

  useEffect(() => {
    const raiz = document.documentElement;

    const limpar = () => {
      relogios.current.forEach((id) => window.clearTimeout(id));
      relogios.current = [];
    };

    const sair = () => {
      limpar();
      pedido.current = null;
      raiz.setAttribute("data-cortina", "sair");
      relogios.current.push(
        window.setTimeout(() => raiz.removeAttribute("data-cortina"), TEMPO_DE_SAIDA_MS),
      );
    };

    const aoClicar = (evento: MouseEvent) => {
      const ancora = (evento.target as Element | null)?.closest?.("a[href]");
      if (!(ancora instanceof HTMLAnchorElement)) return;
      const cobre = deveCobrir(
        {
          botao: evento.button,
          modificador: evento.metaKey || evento.ctrlKey || evento.shiftKey || evento.altKey,
          prevenido: evento.defaultPrevented,
        },
        {
          href: ancora.getAttribute("href") ?? "",
          target: ancora.getAttribute("target"),
          download: ancora.hasAttribute("download"),
          semCortina: ancora.closest("[data-sem-cortina]") !== null,
        },
        { href: window.location.href, movimento: raiz.hasAttribute("data-movimento") },
      );
      if (!cobre) return;

      limpar();
      pedido.current = { inicio: performance.now(), caminho: caminhoAtual.current };
      raiz.setAttribute("data-cortina", "entrar");
      relogios.current.push(window.setTimeout(sair, TEMPO_MAXIMO_MS));
    };

    /* Na fase de captura, antes do `Link` do Next: se ele depois cancelar a
       navegação, o limite de segurança tira a cortina. */
    document.addEventListener("click", aoClicar, true);
    sairRef.current = sair;
    return () => {
      document.removeEventListener("click", aoClicar, true);
      limpar();
      raiz.removeAttribute("data-cortina");
    };
  }, []);

  /* A página nova chegou: sai quando o desenho tiver tido o seu tempo. */
  useEffect(() => {
    caminhoAtual.current = caminho;
    const atual = pedido.current;
    if (!atual || atual.caminho === caminho) return;
    const falta = Math.max(0, TEMPO_MINIMO_MS - (performance.now() - atual.inicio));
    const id = window.setTimeout(() => sairRef.current(), falta);
    relogios.current.push(id);
  }, [caminho]);

  return (
    <div className="cortina" aria-hidden="true">
      <FolhaDaMarca comFolha={comFolha} />
    </div>
  );
}
```

- [ ] **Passo 3: CSS da cortina em `site.css`**

Antes de `/* ---------------------------------------------------------------- rodapé */`:

```css
/* -------------------------------------------------------------- cortina */

/* A cortina entre páginas (`CortinaDeNavegacao.tsx`). Só existe enquanto o
   `<html>` tem `data-cortina`; sem JavaScript ou com menos movimento nunca o
   tem. Fica por cima do cabeçalho (50) e por baixo do "saltar para o
   conteúdo" (200). O nome de View Transition, com a animação desligada, tira-a
   da fotografia da página antiga: a View Transition que corre por baixo não a
   congela a meio do desenho. */
.cortina {
  display: none;
  position: fixed;
  inset: 0;
  z-index: 150;
  place-items: center;
  background: var(--color-calcario);
  view-transition-name: cortina;
}

html[data-cortina] .cortina {
  display: grid;
}

html[data-cortina="entrar"] .cortina {
  animation: cortina-entra 200ms var(--curva-suave) both;
}

html[data-cortina="sair"] .cortina {
  animation: cortina-sai 300ms var(--curva-suave) both;
}

::view-transition-group(cortina) {
  animation: none;
  z-index: 150;
}

::view-transition-old(cortina) {
  display: none;
}

::view-transition-new(cortina) {
  animation: none;
}

@keyframes cortina-entra {
  from {
    translate: 0 100%;
  }
}

@keyframes cortina-sai {
  to {
    translate: 0 -100%;
  }
}

.folha-da-marca {
  width: min(22rem, 72vw);
  height: auto;
  overflow: visible;
}

.folha-da-marca__folha path {
  fill: none;
  stroke: var(--color-verde-marca);
  stroke-width: 1.4;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
}

/* A ordem: o contorno (0) a partir da ponta, a nervura (1), as oito riscas
   (2–9) de cima para baixo, a aba (10). */
html[data-cortina] .folha-da-marca__folha path {
  animation: traco-desenha 300ms var(--curva-saida) calc(150ms + var(--i) * 45ms) forwards;
}

html[data-cortina] .folha-da-marca__folha path:first-child {
  animation-duration: 450ms;
}

.folha-da-marca__nome {
  font-family: var(--font-sans);
  font-size: 30px;
  font-weight: 620;
  font-stretch: 125%;
  fill: none;
  stroke: var(--color-grafite);
  stroke-width: 0.7;
  clip-path: inset(0 100% 0 0);
}

.folha-da-marca__segundo {
  font-family: var(--font-sans);
  font-size: 9.5px;
  font-weight: 500;
  fill: var(--color-grafite);
  opacity: 0;
}

html[data-cortina] .folha-da-marca__nome {
  animation: nome-revela 300ms var(--curva-saida) 550ms forwards;
}

html[data-cortina] .folha-da-marca__segundo {
  animation: segundo-aparece 250ms ease 650ms forwards;
}

@keyframes traco-desenha {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes nome-revela {
  to {
    clip-path: inset(0 0 0 0);
  }
}

@keyframes segundo-aparece {
  to {
    opacity: 1;
  }
}
```

(O bloco `@media (prefers-reduced-motion: reduce)` de `globals.css` já anula durações; e sem `data-movimento` a cortina nunca abre.)

- [ ] **Passo 4: a construção do herói espera pela cortina (`inicio.css`)**

A seguir às regras `[data-movimento] .heroi__marca { … }` da Tarefa 2:

```css
/* Chegar à inicial pela cortina: a construção fica parada por baixo e começa
   quando a cortina começa a sair — senão acabava tapada. */
html[data-cortina="entrar"] .heroi__contorno,
html[data-cortina="entrar"] .heroi__contorno path,
html[data-cortina="entrar"] .heroi__recorte,
html[data-cortina="entrar"] .heroi__foto,
html[data-cortina="entrar"] .heroi__marca {
  animation-play-state: paused;
}
```

- [ ] **Passo 5: montar no layout e marcar os projetos**

`src/app/[locale]/layout.tsx`: importar

```tsx
import { CortinaDeNavegacao } from "@/components/movimento/CortinaDeNavegacao";
import { marcaPublicavel } from "@/data/validacoes";
```

e a seguir a `<Revelacoes />`:

```tsx
          <CortinaDeNavegacao comFolha={marcaPublicavel("folha")} />
```

`src/components/projetos/CartaoDeProjeto.tsx`: no `<article>` acrescentar `data-sem-cortina=""`, com o porquê num comentário antes do `<Link>`:

```tsx
    <article className="cartao-projeto" data-revelar="" data-sem-cortina="">
      {/* Sem cortina (`data-sem-cortina`): a fotografia do cartão faz o morph
          até à abertura do projeto, e a cortina escondia-o. */}
      <Link href={`/realisations/${projeto.slug}`} className="cartao-projeto__ligacao">
```

`src/components/inicio/ProjetosEmDestaque.tsx`, na função `Cartao`: no `<div className="destaque__interior">` acrescentar `data-sem-cortina=""` e o mesmo comentário por cima do `<div className="destaque__media">`. O link "Voir toutes les réalisations" (`destaque__todos`) fica fora do cartão e **leva** cortina.

- [ ] **Passo 6: verificar**

Correr: `npm run lint && npm run tipos && npm run testes`
Esperado: sem erros.

Com `npm run dev`, em `http://localhost:3000/`:
- clicar em "Réalisations" no cabeçalho: cortina sobe, folha desenha-se (contorno, nervura, riscas, aba), STOA e MANAGEMENT aparecem, cortina sai para cima e mostra a página;
- voltar à inicial pelo logótipo: cortina, e **depois** a construção do herói;
- clicar num cartão de projeto: sem cortina, o morph como antes;
- ⌘-clique num link: abre noutro separador, a página atual fica destapada;
- mudar para PT no seletor de língua: cortina e página em português;
- botão "anterior" do browser: sem cortina, o fade de sempre;
- "reduzir movimento" ligado: sem cortina.

- [ ] **Passo 7: commit**

```bash
git add src/components/movimento/FolhaDaMarca.tsx src/components/movimento/CortinaDeNavegacao.tsx src/app/site.css src/app/inicio.css "src/app/[locale]/layout.tsx" src/components/projetos/CartaoDeProjeto.tsx src/components/inicio/ProjetosEmDestaque.tsx
git commit -m "Transição entre páginas: cortina com a folha e o nome desenhados em linha"
```

---

### Tarefa 6: verificação completa

**Ficheiros:** nenhum (salvo correções que a verificação peça).

- [ ] **Passo 1: os comandos do `AGENTS.md`**

Correr: `npm run lint && npm run tipos && npm run mensagens && npm run testes && npm run build && npm run segredos`
Esperado: tudo verde; o `build` valida `src/data/` com o zod.

- [ ] **Passo 2: publicação**

Correr: `STOA_PUBLICATION=1 npm run build` e depois `STOA_PUBLICATION=1 npm run start`; clicar num link: a cortina desenha **só o nome** (a folha é provisória); o herói fica no carvão com a marca a subir (sem fotografia validada, sem contorno).

- [ ] **Passo 3: olhar para as páginas**

Com `npm run dev`, nas larguras 320, 390, 1440 e 2560 px, deitado e de pé:
- a construção do herói: a linha coincide com o edifício; título e botões clicáveis durante a construção; rolar a meio não faz a fotografia saltar;
- navegar entre inicial, réalisations, um projeto (morph), contacto, `/#expertises` a partir de uma página interior (cortina e depois a descida à secção);
- limite de segurança: nas DevTools, rede "Offline", clicar num link interno — a cortina sai sozinha em ≤ 5 s;
- sem JavaScript (DevTools → desativar JavaScript): herói inteiro, páginas trocam normalmente;
- teclado: Tab até um link, Enter — a cortina aparece e o foco não se perde.

- [ ] **Passo 4: commit das correções (se houver)**

```bash
git add -A src docs testes
git commit -m "Entrada e transições: correções da verificação"
```
