# Entrada e transições: a construção do herói e a folha

Data: 2026-09-30 · Branch: `entrada-e-transicoes`

## O que se quer

1. **Quem abre a página inicial** vê o herói a construir-se depressa: primeiro
   a linha do edifício, como numa planta, depois a obra (a fotografia) e por
   fim o STOA a subir por trás.
2. **Quem muda de página** vê uma cortina onde uma linha desenha a folha do
   logótipo e o nome STOA MANAGEMENT.
3. **Os projetos ficam como estão**: cartão → página do projeto continua com o
   morph (`share="morph"`), sem cortina.

Decidido com o Tomás:

- Construção do herói: opção "planta → obra", **sempre** que a página inicial
  abre (não só uma vez por visita).
- Transição: a folha em **linha**, sem preenchimento, parecida com o
  logótipo (desenhada a partir de `src/app/apple-icon.png`), e o nome.
- A folha é provisória; em publicação só entra validada (ver abaixo).
- Afinações de tempo e forma fazem-se depois de ver.

## Regras que não mudam

- Um só motor: CSS (animações e `stroke-dashoffset`) + o `progresso.ts` que já
  existe. Nada de GSAP, Lenis ou bibliotecas novas.
- Sem JavaScript ou com `prefers-reduced-motion`: nem construção nem cortina.
  O herói aparece inteiro e as páginas trocam como hoje.
- O título e os botões do herói estão visíveis e clicáveis desde o primeiro
  instante.
- Nenhum recurso de terceiros (a CSP não muda).

---

## Parte 1 — A construção do herói

### Linha do tempo (ecrã deitado, ~1,6 s)

| Tempo | O quê |
| --- | --- |
| 0 – 0,6 s | Palco em carvão. Uma linha fina (calcário) desenha o contorno do edifício. |
| 0,4 – 1,1 s | O recorte (o edifício) enche-se de baixo para cima; a linha apaga-se. |
| 0,8 – 1,4 s | A fotografia inteira (a envolvente) aparece por baixo do recorte. |
| 1,0 – 1,6 s | O STOA sobe por trás do edifício (a `marca-sobe` que já existe, retemporizada). |

Ecrã de pé: a mesma sequência com o contorno da fachada (`retrato`).

### O contorno

`src/data/heroi.ts` ganha `contorno(composicao)`: os segmentos do `recorte`
**que não estão sobre a borda da imagem** (dois pontos com o mesmo `x = 0`,
`x = largura`, `y = 0` ou `y = altura` ficam de fora). Devolve um `d` de
`<path>` no sistema de coordenadas do original.

- Paisagem: fachada esquerda (x = 287), platibanda, fachada direita.
- Retrato: a aresta da fachada com as saliências.

O componente desenha-o num SVG com o mesmo `viewBox` da `Marca` do herói —
por isso fica preso ao edifício em qualquer ecrã, como a marca e o recorte. O
traço usa `pathLength="1"` e `vector-effect: non-scaling-stroke`.

### Camadas e CSS (`inicio.css`)

Tudo dentro de `[data-movimento]`, e **sem tocar nas propriedades que o `--p`
usa** (`scale` da imagem, `translate` do texto da marca): as animações da
construção vão para os contentores.

- `.heroi__contorno` (novo SVG): `stroke-dashoffset` 1 → 0, depois `opacity` → 0.
- `.heroi__recorte` (a `<picture>`): `clip-path: inset(100% 0 0 0)` → `inset(0)`.
  O polígono continua no `<img>`, por isso não há conflito de `clip-path`.
- `.heroi__foto:not(.heroi__recorte)`: `opacity` 0 → 1.
- `.heroi__marca`: a `marca-sobe` passa a começar a 1,0 s.

Sem fotografia validada (publicação): não há contorno nem recorte; só a marca
sobe, como hoje.

### Casos

- **Regresso com "anterior" já a meio da página**: não há tratamento especial.
  A animação corre fora do ecrã e acaba em 1,6 s; ninguém a vê a meio.
- **Chegada pela cortina**: `html[data-cortina] .heroi *` fica com
  `animation-play-state: paused`, e a construção começa quando a cortina sai.
- **Menos movimento pedido a meio da visita**: `data-movimento` sai do `<html>`
  (`Revelacoes.tsx`) e a construção desaparece com ele.

---

## Parte 2 — A cortina com a folha

### O desenho

`src/components/movimento/FolhaDaMarca.tsx`: um SVG só em linha, a verde
(`--color-verde-marca`), sem preenchimento:

1. o contorno da folha (gota com a ponta para cima);
2. a nervura central;
3. oito riscas na metade esquerda, da borda até à nervura;
4. a curva da aba dobrada, em baixo à direita.

Ao lado, **STOA** em contorno (Archivo) e **MANAGEMENT** espaçado, como a
`Marca` do cabeçalho. O nome é da marca e não se traduz: fica no componente,
como em `Marca.tsx`. Os caminhos exatos estão no esboço aprovado,
`docs/superpowers/specs/2026-09-30-folha-esboco.svg` (a folha ocupa
`0 0 100 130`; a cor e o tipo de letra do esboço são de substituição).

### Linha do tempo (~0,85 s + saída)

| Tempo | O quê |
| --- | --- |
| 0 – 0,2 s | A cortina (calcário) sobe e tapa a página, cabeçalho incluído. |
| 0,15 – 0,45 s | O contorno da folha desenha-se a partir da ponta. |
| 0,3 – 0,5 s | A nervura desce. |
| 0,4 – 0,65 s | As riscas, uma a uma, de cima para baixo. |
| 0,6 – 0,7 s | A aba fecha. |
| 0,55 – 0,85 s | STOA revela-se da esquerda para a direita; MANAGEMENT aparece. |
| ≥ 0,85 s | Quando a página nova já estiver montada, a cortina sai para cima (~0,3 s). |

Se a página nova demorar, a cortina fica com o desenho completo até ela
chegar. Ao fim de **5 s** sai de qualquer forma: nunca fica presa.

### Quando há cortina

`src/lib/movimento/cortina.ts` exporta uma função pura,
`deveCobrir(clique, ancora, localAtual)`. Há cortina só se **tudo** for verdade:

- `html[data-movimento]` presente (há JavaScript e não se pediu menos movimento);
- botão principal, sem Ctrl/⌘/Shift/Alt, `defaultPrevented` falso;
- `<a>` com `href` da mesma origem, sem `target` nem `download`;
- o caminho é diferente do atual (uma âncora na mesma página não conta);
- a ligação não está dentro de `[data-sem-cortina]`.

Levam `data-sem-cortina`: os cartões de projeto (`CartaoDeProjeto.tsx`) e os
projetos em destaque da página inicial (`ProjetosEmDestaque.tsx`), para
manter o morph.

Os botões "anterior" / "seguinte" do browser não passam por aqui (não há
clique): ficam com o fade atual.

### O componente

`src/components/movimento/CortinaDeNavegacao.tsx` (cliente), montado uma vez
em `src/app/[locale]/layout.tsx`:

- ouve `click` em `document` (fase de captura) e chama `deveCobrir`;
- estado em `html[data-cortina="entrar" | "sair"]`, lido pelo CSS;
- `usePathname()` marca a chegada da página nova; sai quando houver chegada
  **e** tiverem passado 0,85 s desde o clique;
- `aria-hidden="true"`, sem foco; o anúncio da página nova continua a ser do
  Next;
- `view-transition-name: cortina` com `animation: none`, como o cabeçalho, para
  que a View Transition que corre por baixo não a congele numa fotografia.

O fade de `root` que já existe mantém-se: fica escondido pela cortina quando
ela está lá, e é o que se vê nos casos sem cortina.

### Publicação

`src/data/validacoes.ts` ganha uma entrada para a folha (`folha-transicao`:
`"provisorio"`). Em publicação, enquanto não estiver `validado`, a cortina
desenha **só o nome**. Acrescentar a linha a `docs/a-confirmer.md`: "a folha
em linha na transição entre páginas, redesenhada a partir do ícone — a STOA
aprova ou manda o vetor".

---

## Testes

- `testes/heroi-contorno.test.mjs`: o `contorno` da paisagem e do retrato não
  tem segmentos sobre a borda da imagem e tem todos os outros.
- `testes/cortina.test.mjs`: `deveCobrir` para cada caso da lista (modificador,
  `target`, outra origem, mesmo caminho, âncora, `data-sem-cortina`, sem
  `data-movimento`).
- Os comandos do `AGENTS.md`: lint, tipos, mensagens, testes, build, segredos.
- **Olhar para as páginas** (nenhum teste apanha isto): a inicial a 320, 390,
  1440 e 2560 px, deitado e de pé; navegar entre as quatro secções, ir a um
  projeto e voltar (morph intacto), mudar de língua, "anterior" do browser;
  repetir com menos movimento e sem JavaScript.

## Fora deste trabalho

- A cortina na primeira chegada ao site (ecrã de carregamento): recusado.
- O vetor oficial do logótipo: pedido à STOA; quando chegar, troca-se só o
  desenho em `FolhaDaMarca.tsx`.
