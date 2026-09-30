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
 * ⚠️ Se a fotografia do herói mudar, estes números mudam com ela. Medir de novo
 * e verificar com uma sobreposição antes de publicar: um recorte que falha por
 * dois píxeis vê-se mais do que um recorte que não existe.
 */
export type Composicao = {
  imagem: IdImagem;
  largura: number;
  altura: number;
  /* O ponto da fotografia que fica no centro quando o ecrã a corta. */
  foco: { x: number; y: number };
  /* O contorno do que fica À FRENTE da marca, em píxeis do original. */
  recorte: [number, number][];
  /* Onde assenta a palavra: canto inferior esquerdo e largura total. */
  marca: { x: number; linhaDeBase: number; largura: number };
  /* O ponto para onde a câmara se aproxima durante a rolagem. */
  origemDoZoom: { x: number; y: number };
};

export const HEROI: { paisagem: Composicao; retrato: Composicao } = {
  paisagem: {
    imagem: "heroi-immeuble",
    largura: 1280,
    altura: 720,
    foco: { x: 0.5, y: 0.5 },
    recorte: [
      [287, 306.5], [300, 304.5], [344, 300.5], [384, 296.5], [416, 293.5], [448, 290.5],
      [480, 288], [512, 285.5], [544, 284], [570, 285.5], [600, 287.5], [650, 288],
      [700, 289.5], [720, 291], [744, 294], [770, 297.5], [800, 300], [850, 304.5],
      [872, 306.5], [904, 309.5], [930, 311.5], [937, 312.5],
      [934, 330], [923, 540], [923, 720], [287, 720],
    ],
    marca: { x: 306, linhaDeBase: 318, largura: 614 },
    origemDoZoom: { x: 610, y: 400 },
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
export function poligono({ recorte, largura, altura }: Composicao): string {
  const pct = (v: number, total: number) => `${((v / total) * 100).toFixed(3)}%`;
  return `polygon(${recorte.map(([x, y]) => `${pct(x, largura)} ${pct(y, altura)}`).join(", ")})`;
}

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
