import type { CSSProperties } from "react";
import { dadosDaImagem, srcDe, srcsetDe, type IdImagem } from "@/lib/medias";

/**
 * Uma fotografia do `npm run medias`: AVIF para quem o lê, WebP para os
 * outros, nas larguras que existem, com `width`/`height` do original (sem
 * saltos de layout) e a cor dominante por trás enquanto carrega.
 *
 * `<img>` e não `next/image`, de propósito: as versões já saíram otimizadas
 * do script, nas larguras certas, e o `next/image` só acrescentaria um pedido
 * ao `/_next/image` para refazer o mesmo trabalho (e uma fatura na Vercel).
 *
 * `sizes` é obrigatório: é o que deixa o browser escolher a largura certa em
 * vez da maior. Escrever o que a imagem ocupa **de facto** na página.
 */
export function Foto({
  id,
  alt,
  sizes,
  prioridade = false,
  foco,
  className,
  classNameImagem,
  style,
}: {
  id: IdImagem;
  alt: string;
  sizes: string;
  /* Só para a imagem do primeiro ecrã: carrega já, com prioridade alta. */
  prioridade?: boolean;
  /* `object-position`, para quando a imagem é cortada pelo contentor. */
  foco?: string;
  className?: string;
  classNameImagem?: string;
  style?: CSSProperties;
}) {
  const { largura, altura, cor } = dadosDaImagem(id);

  return (
    <picture className={className} style={style}>
      <source type="image/avif" srcSet={srcsetDe(id, "avif")} sizes={sizes} />
      <img
        src={srcDe(id)}
        srcSet={srcsetDe(id, "webp")}
        sizes={sizes}
        width={largura}
        height={altura}
        alt={alt}
        loading={prioridade ? "eager" : "lazy"}
        fetchPriority={prioridade ? "high" : undefined}
        decoding="async"
        className={classNameImagem}
        style={{ backgroundColor: cor, objectPosition: foco }}
      />
    </picture>
  );
}
