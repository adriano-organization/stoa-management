import type { IdImagem } from "@/lib/medias";

/**
 * # A geometria do herói
 *
 * O herói empilha, de trás para a frente: a fotografia, a palavra STOA, e **a
 * mesma fotografia recortada pelo contorno do edifício** — é isso que põe a
 * marca atrás do edifício sem inventar um píxel. As duas camadas de
 * fotografia são o mesmo ficheiro (um só download) e mexem-se sempre juntas.
 *
 * Tudo aqui está em **píxeis do original**: o componente converte para
 * percentagens da caixa da imagem, e o recorte e a marca ficam presos ao
 * edifício em qualquer tamanho de ecrã.
 *
 * ## Como foram medidos
 *
 * - **Paisagem** (`2026-03-24-11-03-13-263.PNG`, 1280×720): a platibanda do
 *   fundo do telhado lida coluna a coluna (o traço escuro entre o prado e o
 *   gravilhão), 1–2 px acima do traço, e verificada sobreposta à fotografia a
 *   5×. É um arco suave — a distorção da lente do drone —, por isso tem
 *   tantos pontos.
 * - **Retrato** (`IMG_2860.HEIC`, 3024×4032 depois de orientada): a aresta da
 *   fachada é uma reta (x = 1159 + 0,64·y), 18 px para o lado do céu para
 *   incluir o rufo; a caixa de esgoto, o candeeiro e a peça do topo entram
 *   como saliências.
 *
 * ## A planta da entrada (só paisagem)
 *
 * As arestas que a entrada desenha foram lidas na mesma fotografia, coluna a
 * coluna (o salto de claro para escuro de cada laje sobre o vidro; o traço
 * escuro do rufo no telhado; o branco da parede contra a loggia), ajustadas a
 * uma curva suave — a lente curva-as um pouco — e verificadas sobrepostas a
 * 2×. Só entram arestas que se veem: o telhado, as verticais, o beirado e as
 * três lajes com o retorno nas loggias, a base da parede lateral. O rés-do-chão
 * da frente fica de fora (o que se vê é o terraço e as floreiras, não uma
 * aresta), e a silhueta usa aí uma aproximação — é só uma máscara, e a
 * fotografia inteira chega logo a seguir.
 *
 * No retrato não há desenho da fachada: a fotografia é de perto e só a aresta
 * contra o céu é segura. A entrada aí é mais simples (`plantaDe`).
 *
 * ⚠️ Se a fotografia do herói mudar, estes números mudam com ela. Medir de novo
 * e verificar com uma sobreposição antes de publicar: um recorte que falha por
 * dois píxeis vê-se mais do que um recorte que não existe.
 */
export type Ponto = [number, number];

export type Planta = {
  /* Linhas de construção: prolongamentos de arestas reais, de borda a borda. */
  guias: Ponto[][];
  /* As arestas, pela ordem em que se desenham. */
  tracos: Ponto[][];
  /* As superfícies que dão corpo aos volumes; `tom` é o quanto escurecem. */
  superficies: { pontos: Ponto[]; tom: number }[];
  /* O contorno do edifício, onde a fotografia se revela primeiro. */
  silhueta: Ponto[];
};

export type Composicao = {
  imagem: IdImagem;
  largura: number;
  altura: number;
  /* O ponto da fotografia que fica no centro quando o ecrã a corta. */
  foco: { x: number; y: number };
  /* O contorno do que fica À FRENTE da marca, em píxeis do original. */
  recorte: Ponto[];
  /* Onde assenta a palavra: canto inferior esquerdo e largura total. */
  marca: { x: number; linhaDeBase: number; largura: number };
  /* O ponto para onde a câmara se aproxima durante a rolagem. */
  origemDoZoom: { x: number; y: number };
  /* O desenho da entrada; sem ele, `plantaDe` usa só o contorno. */
  planta?: Planta;
};

/* A platibanda do fundo: o topo do recorte e o primeiro traço da planta. É a
   mesma lista nos dois, para a linha desenhada acabar exatamente onde a marca
   se esconde. */
const PLATIBANDA_PAISAGEM: Ponto[] = [
  [287, 306.5], [300, 304.5], [344, 300.5], [384, 296.5], [416, 293.5], [448, 290.5],
  [480, 288], [512, 285.5], [544, 284], [570, 285.5], [600, 287.5], [650, 288],
  [700, 289.5], [720, 291], [744, 294], [770, 297.5], [800, 300], [850, 304.5],
  [872, 306.5], [904, 309.5], [930, 311.5], [937, 312.5],
];

const TELHADO_FRENTE: Ponto[] = [
  [288, 307], [347.4, 313.8], [402.8, 320.2], [458.1, 326.5], [513.5, 332.9],
  [568.9, 339.3], [624.2, 345.6], [679.6, 352], [735, 358.4],
];
const TELHADO_LADO: Ponto[] = [[735, 358.4], [803.3, 342.7], [866.7, 327.4], [937, 312.5]];
const ARESTA_TRASEIRA: Ponto[] = [[937, 312.5], [934, 330], [928, 440], [923, 548]];
const CANTO: Ponto[] = [[735, 358.4], [733, 382.2], [733, 458.6], [733, 537.6], [731, 603]];
const ESQUERDA: Ponto[] = [[288, 307], [294, 323.1], [300, 374.3], [304, 427.2], [306, 478.2]];
const LAJE1_FRENTE: Ponto[] = [
  [306, 478.2], [366.7, 498.6], [427.4, 518.2], [488.1, 536.9], [548.9, 554.7],
  [609.6, 571.7], [670.3, 587.8], [731, 603],
];

const PLANTA_PAISAGEM: Planta = {
  guias: [
    [[0, 273.9], [1280, 421.1]], // o rufo da frente
    [[0, 525.4], [1280, 234.6]], // o rufo lateral
    [[740.9, 0], [729.1, 720]], // o canto das loggias
    [[955.6, 0], [912.8, 720]], // a aresta traseira
    [[255.7, 0], [331.4, 720]], // a ponta esquerda
  ],
  tracos: [
    PLATIBANDA_PAISAGEM,
    TELHADO_FRENTE,
    TELHADO_LADO,
    ESQUERDA,
    CANTO,
    [[819, 364], [817, 430], [816, 490], [814, 555], [812, 617]], // a parede branca
    ARESTA_TRASEIRA,
    [
      [294, 323.1], [356.7, 331.7], [419.4, 340.2], [482.1, 348.7], [544.9, 357.1],
      [607.6, 365.5], [670.3, 373.9], [733, 382.2], [819, 366],
    ], // o beirado, e o retorno na loggia
    [
      [300, 374.3], [361.9, 386.5], [423.7, 398.6], [485.6, 410.7], [547.4, 422.8],
      [609.3, 434.8], [671.1, 446.7], [733, 458.6], [776, 444], [817, 429],
    ],
    [
      [304, 427.2], [365.3, 443.2], [426.6, 459.1], [487.9, 474.9], [549.1, 490.7],
      [610.4, 506.4], [671.7, 522], [733, 537.6], [776, 518], [816, 498],
    ],
    [...LAJE1_FRENTE, [776, 588], [815, 566]],
    [[812, 619], [867, 585], [923, 550]], // a base da parede lateral
  ],
  superficies: [
    {
      tom: 0.05,
      pontos: [...PLATIBANDA_PAISAGEM, ...TELHADO_LADO.slice(0, -1).reverse(), ...TELHADO_FRENTE.slice(0, -1).reverse()],
    },
    {
      tom: 0.16,
      pontos: [...TELHADO_FRENTE, ...CANTO.slice(1), ...LAJE1_FRENTE.slice(0, -1).reverse(), ...ESQUERDA.slice(1, -1).reverse()],
    },
    {
      tom: 0.07,
      pontos: [...TELHADO_LADO, ...ARESTA_TRASEIRA.slice(1), [867, 585], [812, 619], [815, 566], [776, 588], ...CANTO.slice(1).reverse()],
    },
  ],
  silhueta: [
    ...PLATIBANDA_PAISAGEM,
    ...ARESTA_TRASEIRA.slice(1),
    [867, 585], [812, 619],
    [733, 668], [306, 528], // o rés-do-chão: aproximado, só máscara
    ...ESQUERDA.slice(1).reverse(),
    [288, 307],
  ],
};

export const HEROI: { paisagem: Composicao; retrato: Composicao } = {
  paisagem: {
    imagem: "heroi-immeuble",
    largura: 1280,
    altura: 720,
    foco: { x: 0.5, y: 0.5 },
    recorte: [...PLATIBANDA_PAISAGEM, [934, 330], [923, 540], [923, 720], [287, 720]],
    marca: { x: 306, linhaDeBase: 318, largura: 614 },
    origemDoZoom: { x: 610, y: 400 },
    planta: PLANTA_PAISAGEM,
  },
  retrato: {
    imagem: "facade-panneaux",
    largura: 3024,
    altura: 4032,
    foco: { x: 0.64, y: 0.3 },
    recorte: [
      [0, 0], [1252, 0], [1252, 22], [1216, 52], [1753, 900], [1760, 904], [1828, 904],
      [1828, 986], [1808, 986], [2003, 1290], [2072, 1290], [2072, 1324], [2046, 1340],
      [2035, 1340], [2362, 1852], [2420, 2200], [2480, 2500], [2540, 2800], [2600, 3100],
      [2680, 3400], [2740, 3700], [2780, 4032], [0, 4032],
    ],
    marca: { x: 1330, linhaDeBase: 700, largura: 1400 },
    origemDoZoom: { x: 1700, y: 1200 },
  },
};

/** `clip-path: polygon(...)` em percentagens da caixa da imagem. */
export function poligono({ recorte, largura, altura }: Composicao, pontos: Ponto[] = recorte): string {
  const pct = (v: number, total: number) => `${((v / total) * 100).toFixed(3)}%`;
  return `polygon(${pontos.map(([x, y]) => `${pct(x, largura)} ${pct(y, altura)}`).join(", ")})`;
}

/** Um `d` de `<path>` a partir de troços de pontos. */
export const caminho = (trocos: Ponto[][]) =>
  trocos.map((troco) => `M${troco.map(([x, y]) => `${x} ${y}`).join("L")}`).join("");

/**
 * O desenho da entrada. Sem planta medida (o retrato), é só a aresta do
 * edifício, com a fachada como superfície e o recorte como silhueta: a entrada
 * simples, sem desenho que a fotografia não confirme.
 */
export function plantaDe(composicao: Composicao): Planta {
  if (composicao.planta) return composicao.planta;
  return {
    guias: [],
    tracos: trocosDoContorno(composicao),
    superficies: [{ pontos: composicao.recorte, tom: 0.08 }],
    silhueta: composicao.recorte,
  };
}

/**
 * O traço que a construção do herói desenha: o `recorte` sem os segmentos que
 * assentam na borda da fotografia — esses só fecham o polígono, não são
 * edifício. Começa logo a seguir a um segmento de borda, para cada troço sair
 * inteiro e desenhar-se de uma ponta à outra.
 */
export function contorno(composicao: Composicao): string {
  return caminho(trocosDoContorno(composicao));
}

function trocosDoContorno({ recorte, largura, altura }: Composicao): Ponto[][] {
  const naBorda = ([x1, y1]: [number, number], [x2, y2]: [number, number]) =>
    (x1 === x2 && (x1 === 0 || x1 === largura)) || (y1 === y2 && (y1 === 0 || y1 === altura));

  const n = recorte.length;
  const segmentos = recorte.map((p, i) => [p, recorte[(i + 1) % n]] as const);
  const inicio = segmentos.findIndex(([a, b]) => naBorda(a, b));

  const trocos: Ponto[][] = [];
  let aberto = false;
  for (let k = 1; k <= n; k++) {
    const [a, b] = segmentos[(inicio + k + n) % n];
    if (naBorda(a, b)) {
      aberto = false;
      continue;
    }
    if (!aberto) {
      trocos.push([a]);
      aberto = true;
    }
    trocos[trocos.length - 1].push(b);
  }
  return trocos;
}
