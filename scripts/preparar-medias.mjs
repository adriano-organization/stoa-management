/**
 * Prepara as fotografias e os vídeos da STOA para a web.
 *
 *   npm run medias            # gera o que falta ou mudou no manifesto
 *   npm run medias -- --tudo  # refaz tudo
 *
 * Lê `src/data/medias.json` e escreve:
 * - `public/medias/<id>-<largura>.avif|webp` — cada imagem nas larguras pedidas,
 *   **nunca acima da largura do original** (ampliar uma captura de 1280 px só
 *   a faria pesar mais e parecer pior);
 * - `public/medias/<id>-<largura>.mp4` — vídeos cortados, sem som, sem
 *   metadados, com `faststart`, mais o poster como imagem normal (`<id>-poster`);
 * - `public/medias/partilha-*.jpg` — imagens de partilha 1200×630, recortadas
 *   sem ampliação;
 * - `src/app/icon.png` e `src/app/apple-icon.png` — a partir do logótipo
 *   oficial (`sources/marque/logo.png`);
 * - `src/data/medias-gerado.json` — dimensões, larguras e cor dominante, que o
 *   componente `Foto` lê para escrever `srcset`, `width`/`height` e o fundo
 *   enquanto a imagem carrega.
 *
 * ## Os originais nunca mudam
 *
 * `Photo pour site /` é o material que a STOA mandou, e fica exatamente como
 * chegou. Tudo o que este script escreve é derivado e refaz-se a qualquer
 * momento.
 *
 * ## Sem metadados, de propósito
 *
 * As fotografias do iPhone trazem as coordenadas GPS de onde foram tiradas — e
 * algumas foram tiradas em obras de clientes. O sharp tira todos os metadados
 * por omissão (não se chama `withMetadata`), e o ffmpeg leva `-map_metadata -1`.
 * Não mudar isto sem pensar em quem mora na morada que o GPS aponta.
 *
 * ## HEIC
 *
 * O sharp que vem pré-compilado só lê HEIF em AV1 (AVIF); o HEIC do iPhone é
 * HEVC, e por isso passa primeiro pelo `sips` do macOS para um PNG em
 * `.cache/medias/` (fora do git). Noutro sistema é preciso converter os HEIC à
 * mão para PNG com o mesmo nome e pô-los nessa pasta.
 */
import sharp from "sharp";
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";

const RAIZ = new URL("..", import.meta.url).pathname;
const MANIFESTO = join(RAIZ, "src/data/medias.json");
const GERADO = join(RAIZ, "src/data/medias-gerado.json");
const DESTINO = join(RAIZ, "public/medias");
const CACHE = join(RAIZ, ".cache/medias");
const TUDO = process.argv.includes("--tudo");

/* O calcário do site: é a cor que fica por trás de uma transparência
   eventual, e não o preto que o sharp usaria por omissão. */
const FUNDO = "#f2eee7";

/* Qualidade por omissão. O AVIF a 58 e o WebP a 80 ficam visualmente iguais ao
   original nas capturas do drone; abaixo disso as nuvens e a relva começam a
   fazer blocos. Uma entrada pode pedir mais (`qualidade`). */
const QUALIDADE = { avif: 58, webp: 80 };

/* Duas variantes de cada vídeo: a do ecrã grande e uma mais leve para ecrãs
   estreitos. O CRF mais alto na pequena compensa o tamanho, não a qualidade. */
const VIDEO_VARIANTES = [
  { largura: 1280, crf: 23 },
  { largura: 854, crf: 26 },
];

const manifesto = JSON.parse(await readFile(MANIFESTO, "utf8"));
const anterior = existsSync(GERADO)
  ? JSON.parse(await readFile(GERADO, "utf8"))
  : { imagens: {}, videos: {}, partilhas: {} };

await mkdir(DESTINO, { recursive: true });
await mkdir(CACHE, { recursive: true });

const gerado = { imagens: {}, videos: {}, partilhas: {} };
let feitos = 0;
let saltados = 0;

/* ------------------------------------------------------------- origens -- */

function caminhoDaFonte(fonte) {
  const [pasta, ...resto] = fonte.split("/");
  const base = manifesto.pastas[pasta];
  if (base === undefined) {
    throw new Error(`Pasta desconhecida no manifesto: "${pasta}" (em ${fonte}).`);
  }
  const caminho = join(RAIZ, base, ...resto);
  if (!existsSync(caminho)) throw new Error(`Original em falta: ${caminho}`);
  return caminho;
}

function legivel(caminho) {
  if (!/\.heic$/i.test(caminho)) return caminho;
  const saida = join(CACHE, basename(caminho).replace(/\.heic$/i, ".png"));
  if (!existsSync(saida)) {
    try {
      execFileSync("sips", ["-s", "format", "png", caminho, "--out", saida], { stdio: "ignore" });
    } catch {
      throw new Error(
        `Não consegui converter ${basename(caminho)}: o HEIC do iPhone precisa do \`sips\` (macOS). ` +
          `Noutro sistema, converter à mão para ${saida}.`,
      );
    }
  }
  return saida;
}

/**
 * O original já orientado (a orientação EXIF aplicada), em sRGB e sem
 * transparência, como PNG em memória. O recorte do manifesto é em píxeis deste
 * resultado — é o que se vê ao abrir a fotografia, e não o que está gravado.
 */
async function carregar(caminho, recorte) {
  let buffer = await sharp(legivel(caminho))
    .rotate()
    .flatten({ background: FUNDO })
    .withIccProfile("srgb")
    .png({ compressionLevel: 1 })
    .toBuffer();

  if (recorte) {
    buffer = await sharp(buffer)
      .extract({ left: recorte.x, top: recorte.y, width: recorte.largura, height: recorte.altura })
      .png({ compressionLevel: 1 })
      .toBuffer();
  }

  const { width, height } = await sharp(buffer).metadata();
  return { buffer, largura: width, altura: height };
}

const hex = ({ r, g, b }) =>
  `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`;

/* ------------------------------------------------------------- imagens -- */

async function prepararImagem({ id, caminho, recorte, larguras, qualidade }) {
  const assinatura = JSON.stringify({ caminho: caminho.slice(RAIZ.length), recorte, larguras, qualidade });
  const antes = anterior.imagens[id];

  const ficheirosDe = (lista) =>
    lista.flatMap((l) => [`${id}-${l}.avif`, `${id}-${l}.webp`].map((f) => join(DESTINO, f)));

  if (!TUDO && antes?.assinatura === assinatura && ficheirosDe(antes.larguras).every(existsSync)) {
    gerado.imagens[id] = antes;
    saltados++;
    return;
  }

  const { buffer, largura, altura } = await carregar(caminho, recorte);
  /* As larguras acima do original saem da lista; se sobrar nenhuma, fica a do
     próprio original. */
  let alvo = larguras.filter((l) => l <= largura);
  if (alvo.length === 0 || (Math.max(...larguras) > largura && !alvo.includes(largura))) {
    alvo = [...alvo, largura];
  }
  alvo = [...new Set(alvo)].sort((a, b) => a - b);

  const q = { ...QUALIDADE, ...qualidade };
  for (const l of alvo) {
    const redimensionada = sharp(buffer).resize({ width: l, kernel: "lanczos3" });
    await redimensionada
      .clone()
      .avif({ quality: q.avif, effort: 6 })
      .toFile(join(DESTINO, `${id}-${l}.avif`));
    await redimensionada
      .clone()
      .webp({ quality: q.webp, effort: 6 })
      .toFile(join(DESTINO, `${id}-${l}.webp`));
  }

  const { dominant } = await sharp(buffer).stats();
  gerado.imagens[id] = { largura, altura, larguras: alvo, cor: hex(dominant), assinatura };
  feitos++;
  console.log(`  ✓ ${id} (${largura}×${altura} → ${alvo.join(", ")})`);
}

/* -------------------------------------------------------------- vídeos -- */

function ffmpeg(argumentos) {
  execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...argumentos], {
    stdio: "inherit",
  });
}

function dimensoesDoVideo(caminho) {
  const saida = execFileSync("ffprobe", [
    "-v", "error",
    "-select_streams", "v:0",
    "-show_entries", "stream=width,height",
    "-of", "csv=p=0",
    caminho,
  ]).toString().trim();
  const [largura, altura] = saida.split(",").map(Number);
  return { largura, altura };
}

async function prepararVideo(video) {
  const caminho = caminhoDaFonte(video.fonte);
  const { largura, altura } = dimensoesDoVideo(caminho);
  const assinatura = JSON.stringify({ fonte: video.fonte, inicio: video.inicio, duracao: video.duracao });
  const antes = anterior.videos[video.id];

  const variantes = VIDEO_VARIANTES.filter((v) => v.largura <= largura);
  const saidas = variantes.map((v) => join(DESTINO, `${video.id}-${v.largura}.mp4`));

  if (TUDO || antes?.assinatura !== assinatura || !saidas.every(existsSync)) {
    for (const [i, v] of variantes.entries()) {
      ffmpeg([
        "-ss", String(video.inicio),
        "-t", String(video.duracao),
        "-i", caminho,
        "-map", "0:v:0",
        "-an",
        "-map_metadata", "-1",
        "-vf", `scale=${v.largura}:-2:flags=lanczos,fps=30,format=yuv420p`,
        "-c:v", "libx264",
        "-preset", "slow",
        "-crf", String(v.crf),
        "-profile:v", "high",
        "-movflags", "+faststart",
        saidas[i],
      ]);
    }
    feitos++;
    console.log(`  ✓ vídeo ${video.id} (${video.duracao}s, ${variantes.map((v) => v.largura).join(" e ")})`);
  } else {
    saltados++;
  }

  /* O poster é a primeira imagem do corte: é o que está no ecrã antes de o
     vídeo arrancar, e tem de coincidir com ela para não haver salto. */
  const poster = join(CACHE, `${video.id}-poster.png`);
  if (TUDO || antes?.assinatura !== assinatura || !existsSync(poster)) {
    ffmpeg(["-ss", String(video.inicio), "-i", caminho, "-frames:v", "1", poster]);
  }
  await prepararImagem({ id: `${video.id}-poster`, caminho: poster, larguras: [640, 960, 1280] });

  const alturaFinal = (l) => Math.round((altura * l) / largura / 2) * 2;
  gerado.videos[video.id] = {
    largura,
    altura,
    duracao: video.duracao,
    variantes: variantes.map((v) => ({ largura: v.largura, altura: alturaFinal(v.largura) })),
    poster: `${video.id}-poster`,
    assinatura,
  };
}

/* ----------------------------------------------------------- partilhas -- */

async function prepararPartilha(partilha) {
  const origem = manifesto.imagens.find((i) => i.id === partilha.de);
  if (!origem) throw new Error(`Partilha ${partilha.id}: a imagem "${partilha.de}" não está no manifesto.`);

  const { buffer } = await carregar(caminhoDaFonte(origem.fonte), origem.recorte);
  const { x, y, largura, altura } = partilha.recorte;
  await sharp(buffer)
    .extract({ left: x, top: y, width: largura, height: altura })
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile(join(DESTINO, `${partilha.id}.jpg`));
  gerado.partilhas[partilha.id] = { largura, altura };
}

/* -------------------------------------------------------------- ícones -- */

/**
 * O ícone do separador e o do ecrã de início do iPhone, a partir da folha do
 * logótipo oficial. É o único sítio onde o PNG oficial entra no site: a estes
 * tamanhos ele é nítido, e a folha é o que as pessoas já reconhecem.
 */
async function prepararIcones() {
  const logotipo = join(RAIZ, "sources/marque/logo.png");
  const folha = (altura) => sharp(logotipo).resize({ height: altura, kernel: "lanczos3" }).toBuffer();

  await sharp({ create: { width: 64, height: 64, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: await folha(60), gravity: "center" }])
    .png()
    .toFile(join(RAIZ, "src/app/icon.png"));

  await sharp({ create: { width: 180, height: 180, channels: 4, background: FUNDO } })
    .composite([{ input: await folha(140), gravity: "center" }])
    .png()
    .toFile(join(RAIZ, "src/app/apple-icon.png"));
}

/* ------------------------------------------------------------ correr -- */

console.log("Imagens:");
for (const imagem of manifesto.imagens) {
  await prepararImagem({
    id: imagem.id,
    caminho: caminhoDaFonte(imagem.fonte),
    recorte: imagem.recorte,
    larguras: imagem.larguras,
    qualidade: imagem.qualidade,
  });
}

console.log("Vídeos:");
for (const video of manifesto.videos) await prepararVideo(video);

console.log("Partilhas e ícones:");
for (const partilha of manifesto.partilhas) await prepararPartilha(partilha);
await prepararIcones();

/* Ordenado por id, para o diff do JSON gerado ser legível quando uma só
   fotografia muda. */
const ordenar = (objeto) => Object.fromEntries(Object.entries(objeto).sort(([a], [b]) => a.localeCompare(b)));
await writeFile(
  GERADO,
  `${JSON.stringify(
    {
      _comentario: "Gerado por `npm run medias` a partir de src/data/medias.json. Não editar à mão.",
      imagens: ordenar(gerado.imagens),
      videos: ordenar(gerado.videos),
      partilhas: ordenar(gerado.partilhas),
    },
    null,
    2,
  )}\n`,
);

console.log(`\n✓ ${feitos} preparados, ${saltados} sem mudanças. Manifesto gerado em src/data/medias-gerado.json.`);
