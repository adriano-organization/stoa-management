import { Archivo, IBM_Plex_Mono } from "next/font/google";

/**
 * Duas famílias, e porquê estas.
 *
 * A **Archivo** faz tudo o que é título e texto, porque tem um eixo de largura
 * (`wdth`, de 62 a 125) além do de peso. É o que deixa uma só família cobrir
 * a marca **STOA** em largura expandida — uma grotesca larga, assente, com a
 * presença de uma inscrição num frontão — e os títulos e o texto corrido em
 * largura normal. Uma família com dois registos em vez de duas famílias.
 *
 * A **IBM Plex Mono** fica com a numeração, as legendas e as fichas técnicas:
 * o registo das cotas e dos cartouches de uma planta, que é o papel que esta
 * empresa produz. Só no tamanho pequeno, e só em 400/500.
 *
 * ⚠️ Nenhuma das duas é a letra do logótipo oficial (uma Titillium, no site
 * antigo). O logótipo só existe em PNG pequeno e por isso a marca é, por agora,
 * uma composição tipográfica — ver `components/Marca.tsx`. Quando chegar o
 * original vetorial, é lá que se troca.
 *
 * `next/font` descarrega-as no build e serve-as do próprio domínio: é o que
 * deixa o `font-src 'self'` da CSP tão fechado e evita um pedido ao Google com
 * o IP de cada visitante.
 */
export const display = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--fonte-archivo",
  display: "swap",
});

export const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--fonte-mono",
  display: "swap",
});

export const fontes = `${display.variable} ${mono.variable}`;
