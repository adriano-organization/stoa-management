import { EM_PUBLICACAO } from "@/lib/publicacao";

/**
 * O selo do que ainda não está confirmado. Só existe no modo aperçu — em
 * publicação o componente não desenha nada, e o que ele marcaria também não
 * chega a sair (ver `lib/publicacao.ts`).
 */
export function SeloProvisorio({ texto, className }: { texto: string; className?: string }) {
  if (EM_PUBLICACAO) return null;
  return (
    <span className={`selo-provisorio ${className ?? ""}`}>
      <span aria-hidden="true">◌</span>
      {texto}
    </span>
  );
}
