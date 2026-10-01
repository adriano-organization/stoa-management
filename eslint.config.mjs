import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

/**
 * `eslint-config-next` 16 já exporta *flat config* nativo. A receita antiga, com
 * `FlatCompat` a traduzir o formato `.eslintrc`, rebenta com esta versão
 * ("Converting circular structure to JSON").
 */
const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      ".cache/**",
      /* Capturas e scripts de verificação visual, fora do git. */
      "lab/**",
    ],
  },
  ...coreWebVitals,
  ...typescript,
  {
    /**
     * As fotografias servem `<img>` dentro de `<picture>` em vez de
     * `next/image`, e é uma decisão: as versões já saíram otimizadas do
     * `npm run medias` (AVIF + WebP, nas larguras que as páginas pedem). O
     * `next/image` só acrescentaria um pedido ao `/_next/image` para refazer
     * o mesmo trabalho — e o herói precisa de duas camadas da mesma
     * `<picture>`, com o recorte e a escala controlados por CSS, que os
     * invólucros do `next/image` estragariam.
     *
     * O mapa do contacto também: é um SVG, e o `next/image` não otimiza SVG
     * (serve-o tal e qual, por um pedido a mais).
     *
     * ⚠️ Os padrões são literais de propósito: nos globos, `[locale]` seria uma
     * classe de caracteres e a exceção deixava de se aplicar sem aviso.
     */
    files: [
      "src/components/Foto.tsx",
      "src/components/inicio/Heroi.tsx",
      "src/components/contacto/PlanoDoEscritorio.tsx",
    ],
    rules: { "@next/next/no-img-element": "off" },
  },
];

export default eslintConfig;
