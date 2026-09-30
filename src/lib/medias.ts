import gerado from "@/data/medias-gerado.json";

/**
 * O que o `npm run medias` produziu, com tipos: um `id` de imagem que não
 * exista em `medias-gerado.json` é um erro de compilação, e não uma imagem
 * partida em produção.
 */
export type IdImagem = keyof typeof gerado.imagens;
export type IdVideo = keyof typeof gerado.videos;
export type IdPartilha = keyof typeof gerado.partilhas;

export type DadosDaImagem = { largura: number; altura: number; larguras: number[]; cor: string };

export const eImagem = (id: string): id is IdImagem => id in gerado.imagens;
export const eVideo = (id: string): id is IdVideo => id in gerado.videos;
export const ePartilha = (id: string): id is IdPartilha => id in gerado.partilhas;

export function dadosDaImagem(id: IdImagem): DadosDaImagem {
  return gerado.imagens[id];
}

export function srcsetDe(id: IdImagem, formato: "avif" | "webp"): string {
  return dadosDaImagem(id)
    .larguras.map((l) => `/medias/${id}-${l}.${formato} ${l}w`)
    .join(", ");
}

/** A maior versão em WebP: o `src` de reserva, para quem não lê `srcset`. */
export function srcDe(id: IdImagem, largura?: number): string {
  const { larguras } = dadosDaImagem(id);
  const escolhida = largura
    ? (larguras.find((l) => l >= largura) ?? larguras[larguras.length - 1])
    : larguras[larguras.length - 1];
  return `/medias/${id}-${escolhida}.webp`;
}

export type DadosDoVideo = {
  largura: number;
  altura: number;
  duracao: number;
  variantes: { largura: number; altura: number }[];
  poster: IdImagem;
};

export function dadosDoVideo(id: IdVideo): DadosDoVideo {
  const v = gerado.videos[id];
  return { ...v, poster: v.poster as IdImagem };
}

export function dadosDaPartilha(id: IdPartilha) {
  return { url: `/medias/${id}.jpg`, ...gerado.partilhas[id] };
}
