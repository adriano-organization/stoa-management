# sources/

Material de origem que não veio na pasta `Photo pour site /`, guardado tal como
foi recolhido. **Nada aqui é servido ao browser**: o que o site usa sai daqui
pelo `npm run medias` para `public/medias/`.

| Pasta | O quê | Origem | Notas |
|---|---|---|---|
| `site-actuel/` | Imagens das quatro referências e a fotografia de equipa | Site atual, `https://stoa-management.ch/img/`, descarregadas a 2026-09-30 | PNG em paleta de 256 cores, ~820 px: servem para fichas compactas, não para imagens grandes. `team.jpg` tem o crédito "Photo: Fabio Da Silva" no site atual e **não é usada** enquanto a STOA não o autorizar. |
| `marque/` | Logótipo oficial (`logo.png`, `logo2.png`) e favicon (`fav.png`) | Idem | Só existem em PNG pequeno, com gradiente e sombra incorporados. Usados apenas para o ícone do separador. Falta o original vetorial — ver `docs/a-confirmer.md`. |
| `osm/` | Ruas, prédios e matas à volta do escritório (`farvagny.json`) | OpenStreetMap, pelo Overpass, descarregado a 2026-10-01 por `npm run mapa` | © contribuidores do OpenStreetMap, ODbL. Dá os dois SVG de `public/mapa/`; `npm run mapa -- --cache` redesenha sem descarregar. O ponto do escritório **não** vem daqui (ver `src/data/stoa.ts`). |

Os direitos de publicação destas imagens estão por confirmar com a STOA.
