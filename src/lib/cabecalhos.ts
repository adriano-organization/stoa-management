/**
 * # Os cabeçalhos de segurança, num sítio só
 *
 * Lidos pelo `next.config.ts`, que os aplica a todas as respostas. Este ficheiro
 * não importa `server-only`, e não é esquecimento: o `next.config.ts` é
 * carregado pelo Next fora do grafo da aplicação, e um `server-only` aqui
 * rebentava o arranque. Também não lê nada de fora além do `NODE_ENV`.
 *
 * **A CSP consegue ser tão apertada porque o site não carrega nada de fora.**
 * As fontes são servidas pelo próprio domínio (`next/font` descarrega-as no
 * build), as fotografias e os vídeos vivem em `public/medias/`, e não há mapa
 * embebido, estatísticas nem widgets de redes sociais. O botão da morada é um
 * link normal para o mapa, e não um `<iframe>`, exatamente por isto.
 *
 * ⚠️ **O dia em que alguém quiser um mapa embebido ou estatísticas**: abre-se
 * `frame-src`/`script-src`/`img-src` a domínios de terceiros, passa a haver
 * alguém a ver quem visita o site, e o texto sobre dados pessoais da página de
 * contacto deixa de dizer a verdade. Decisão a tomar com a STOA, não por
 * distração — o CI falha se aparecer um recurso de fora no HTML.
 *
 * ## `'unsafe-inline'` no `script-src`
 *
 * ⚠️ Tira à CSP quase toda a proteção contra XSS, e é preciso porque o Next
 * injeta os scripts de arranque e o payload de hidratação inline. Apertá-lo a
 * sério exigia um *nonce* por pedido, e isso tornava dinâmicas todas as
 * páginas, que hoje saem estáticas do CDN. Para um site de montra é trocar a
 * coisa errada: não há texto de visitante a chegar ao HTML. O único
 * `dangerouslySetInnerHTML` é o JSON-LD (dados de `src/data/`, escapados por
 * `jsonParaScript`) e a linha que marca o `<html>` com a preferência de
 * movimento (`src/app/[locale]/layout.tsx`), que é texto fixo.
 *
 * ## O que estes cabeçalhos dão a sério
 *
 * - `frame-ancestors 'none'` — ninguém põe o site dentro de um iframe para lhe
 *   roubar cliques.
 * - `form-action 'self'` — o formulário de contacto não pode ser reapontado
 *   para outro servidor por conteúdo injetado.
 * - `connect-src 'self'` — nada sai do browser para terceiros. O envio do
 *   formulário fala com o serviço de email **no servidor**. Se alguém alguma
 *   vez precisar de acrescentar aqui o domínio de uma API com chave, é sinal de
 *   que um segredo está a passar pelo cliente. Não acrescentar — corrigir.
 * - `object-src 'none'` e `base-uri 'self'` — fecham plugins e o sequestro de
 *   URLs relativos.
 *
 * `img-src` precisa de `data:` e `blob:` para as imagens de partilha geradas e
 * os placeholders; `style-src` de `'unsafe-inline'` por causa dos estilos que o
 * React escreve em atributos `style` (as variáveis de movimento, os pontos
 * focais das fotografias).
 *
 * ## `'unsafe-eval'` só em desenvolvimento
 *
 * No `npm run dev`, o cliente RSC do React usa `eval()` para reconstruir as
 * pilhas de chamadas que vêm do servidor. Em produção nunca o usa, e por isso a
 * diretiva não vai lá parar. O `ws:` é o HMR, pela mesma razão.
 *
 * ⚠️ **Não tirar isto de dentro do `NODE_ENV`.** O CI verifica que a CSP de
 * produção não traz `'unsafe-eval'`.
 */
const DESENVOLVIMENTO = process.env.NODE_ENV !== "production";

export function politicaDeConteudo(): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${DESENVOLVIMENTO ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "media-src 'self'",
    "font-src 'self'",
    `connect-src 'self'${DESENVOLVIMENTO ? " ws:" : ""}`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
}

export const cabecalhosDoSite = [
  { key: "Content-Security-Policy", value: politicaDeConteudo() },
  /* O `frame-ancestors 'none'` da CSP já cobre isto nos browsers modernos; este
     fica para os que ainda não leem CSP. */
  { key: "X-Frame-Options", value: "DENY" },
  /* Impede o browser de adivinhar o tipo de um ficheiro em vez de acreditar no
     `Content-Type`. */
  { key: "X-Content-Type-Options", value: "nosniff" },
  /* Um link para fora (mapa, redes) leva o domínio, nunca o caminho. */
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  /* O site não usa nenhuma destas APIs; negá-las à cabeça evita que um script
     futuro (ou injetado) as peça em nome dele. */
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
  /* Dois anos de HTTPS obrigatório.

     ⚠️ Sem `preload`: entrar na lista dos browsers é fácil, sair demora meses.
     Só ligar quando o domínio final estiver a servir este site e todos os
     subdomínios de stoa-management.ch servirem HTTPS. */
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];
