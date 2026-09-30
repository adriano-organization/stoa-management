import { notFound } from "next/navigation";

/**
 * Apanha qualquer caminho que não seja uma página, dentro de uma língua.
 *
 * Sem isto, `/nao-existe` (que o proxy reescreve para `/fr-CH/nao-existe`)
 * não encontrava rota nenhuma e caía no 404 da raiz — sem cabeçalho nem
 * rodapé. Com isto chama o `[locale]/not-found.tsx`, que tem a cara do site.
 */
export default function Resto() {
  notFound();
}
