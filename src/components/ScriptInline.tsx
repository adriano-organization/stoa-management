/**
 * Um `<script>` que corre enquanto o browser lê o HTML, antes da primeira
 * pintura — e que o React não tenta voltar a correr no cliente.
 *
 * É a receita de `node_modules/next/dist/docs/01-app/02-guides/
 * preventing-flash-before-hydration.md`: no servidor sai como
 * `text/javascript` (corre), no cliente como `text/plain` (o React não avisa
 * de um script que nunca executaria). O `suppressHydrationWarning` cobre a
 * diferença do atributo.
 */
export function ScriptInline({ codigo }: { codigo: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: codigo }}
    />
  );
}
