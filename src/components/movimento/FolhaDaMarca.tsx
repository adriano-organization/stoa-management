import type { CSSProperties } from "react";

/**
 * A folha do logótipo em linha, e o nome, para a cortina entre páginas.
 *
 * ⚠️ **Provisória**: redesenhada a partir do ícone (`src/app/apple-icon.png`),
 * porque não há vetor do logótipo. É parecida, não é a marca: em publicação só
 * entra com `folha` validada em `src/data/validacoes.ts`. Quando o vetor
 * chegar, trocam-se só os caminhos daqui.
 *
 * Os traços têm `pathLength="1"` para o CSS os desenhar de 1 a 0 sem saber o
 * comprimento de cada um; `--i` é a ordem: contorno, nervura, riscas de cima
 * para baixo, aba.
 */
const TRACOS = [
  "M60 4 C 34 30, 16 60, 18 88 C 20 112, 36 126, 54 126 C 74 126, 88 110, 88 86 C 88 58, 76 32, 60 4 Z",
  "M60 6 C 62 40, 62.5 75, 60 102",
  "M45.5 20 L 61 12.8",
  "M36.2 32.5 L 61.6 21",
  "M28.5 45.2 L 62 30.2",
  "M22.7 58.1 L 62.2 40.5",
  "M19.1 71 L 62.1 52",
  "M17.8 83.8 L 61.8 64.4",
  "M19.8 98.1 L 61.2 79.5",
  "M24.7 109.4 L 60.4 93.3",
  "M30 118 C 50 112, 72 96, 87 72",
];

export function FolhaDaMarca({ comFolha }: { comFolha: boolean }) {
  return (
    <svg
      className="folha-da-marca"
      viewBox={comFolha ? "0 -2 216 132" : "100 40 116 56"}
      aria-hidden="true"
      focusable="false"
    >
      {comFolha && (
        <g className="folha-da-marca__folha" transform="translate(4 0)">
          {TRACOS.map((d, i) => (
            <path key={i} d={d} pathLength={1} style={{ "--i": i } as CSSProperties} />
          ))}
        </g>
      )}
      {/* O nome é da marca e não se traduz, como em `Marca.tsx`. */}
      <text
        className="folha-da-marca__nome"
        x="104"
        y="68"
        textLength="104"
        lengthAdjust="spacingAndGlyphs"
      >
        STOA
      </text>
      <text
        className="folha-da-marca__segundo"
        x="105"
        y="86"
        textLength="102"
        lengthAdjust="spacing"
      >
        MANAGEMENT
      </text>
    </svg>
  );
}
