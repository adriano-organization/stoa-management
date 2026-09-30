import { z } from "zod";
import { EM_PUBLICACAO } from "@/lib/publicacao";
import { eImagem, ePartilha, eVideo, type IdImagem, type IdPartilha, type IdVideo } from "@/lib/medias";

/**
 * # Os projetos
 *
 * Factos aqui; títulos e textos em `messages/fr-CH.json`, em
 * `projetos.<slug>.{titulo,resumo,intervencao}`. Validado pelo `zod` no build:
 * um `id` de imagem que não exista em `medias-gerado.json` rebenta a
 * compilação a dizer qual é o projeto.
 *
 * ## `provisorio` e `validado`
 *
 * Os projetos que saem das fotografias de `Photo pour site /` são
 * **provisórios**: foram agrupados por semelhança visual
 * (`docs/inventaire-medias.md`), e nada neles — nome, local, estado, missão —
 * está confirmado pela STOA. Aparecem no modo aperçu, com o selo, e ficam fora
 * da publicação até alguém os validar com a STOA. Ver `lib/publicacao.ts`.
 *
 * As **referências** vêm do site atual (consultado a 2026-09-30) e mantêm as
 * atribuições que lá estão: foram missões de colaboradores da STOA, feitas em
 * colaboração com as empresas indicadas. `realizadoPor: "colaborador"` é o
 * que faz o site dizer isso com todas as letras.
 *
 * ## `null` quer dizer "não confirmado"
 *
 * Um campo a `null` desaparece da página, sem rótulo vazio. **Nunca preencher
 * por dedução** — nem o estado a partir do aspeto de uma fotografia, nem o
 * local a partir das coordenadas GPS de um ficheiro.
 */

const Imagem = z.string().refine(eImagem, {
  error: (problema) =>
    `imagem "${String(problema.input)}" não existe em src/data/medias-gerado.json — correr \`npm run medias\``,
});
const Video = z.string().refine(eVideo, {
  error: (problema) =>
    `vídeo "${String(problema.input)}" não existe em src/data/medias-gerado.json — correr \`npm run medias\``,
});

const Bloco = z.discriminatedUnion("tipo", [
  /* Uma imagem a toda a largura da coluna. */
  z.object({ tipo: z.literal("largo"), imagem: Imagem }),
  /* Duas imagens lado a lado (uma por baixo da outra no telemóvel). */
  z.object({ tipo: z.literal("par"), imagens: z.tuple([Imagem, Imagem]) }),
  z.object({ tipo: z.literal("video"), video: Video }),
  /* Imagens do mesmo sítio em momentos diferentes. Sem datas: as dos nomes
     dos ficheiros são as da captura, e não estão confirmadas como datas da
     obra. */
  z.object({ tipo: z.literal("etapas"), imagens: z.array(Imagem).min(2).max(4) }),
]);

const Projeto = z.object({
  slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  publicacao: z.enum(["provisorio", "validado"]),
  /* De onde vem a informação. Não aparece no site; é para quem valida. */
  origem: z.string().min(1),
  realizadoPor: z.enum(["stoa", "colaborador"]),
  /* A pessoa a quem o site atual atribui a missão, quando atribui. */
  pessoa: z.string().nullable(),
  colaboracao: z.object({ empresa: z.string(), cidade: z.string() }).nullable(),
  local: z.string().nullable(),
  periodo: z.string().nullable(),
  estado: z.enum(["termine", "en-cours"]).nullable(),
  missao: z.enum(["direction-des-travaux", "assistant-direction-des-travaux"]).nullable(),
  capa: Imagem,
  /* O `object-position` da capa, quando o centro da fotografia não é o sítio
     certo para cortar. */
  foco: z.string().optional(),
  video: Video.nullable(),
  galeria: z.array(Bloco),
  /* A ordem na página inicial; `null` fica só no portefólio. */
  destaque: z.number().int().positive().nullable(),
  /* A imagem de partilha (1200×630) gerada para este projeto, se houver. */
  partilha: z
    .string()
    .refine(ePartilha, { error: (p) => `partilha "${String(p.input)}" não existe em medias-gerado.json` })
    .optional(),
});

export type Projeto = Omit<z.infer<typeof Projeto>, "capa" | "video" | "galeria" | "partilha"> & {
  capa: IdImagem;
  video: IdVideo | null;
  galeria: Bloco[];
  partilha?: IdPartilha;
};

export type Bloco =
  | { tipo: "largo"; imagem: IdImagem }
  | { tipo: "par"; imagens: [IdImagem, IdImagem] }
  | { tipo: "video"; video: IdVideo }
  | { tipo: "etapas"; imagens: IdImagem[] };

const ORIGEM_FOTOS =
  "Dossier « Photo pour site » (2026) — regroupement provisoire par ressemblance visuelle, rien de confirmé.";
const ORIGEM_SITE = "Site actuel stoa-management.ch, section Réalisations (consulté le 2026-09-30).";

const DADOS = [
  /* ------------------------------------------------ provisórios (fotos) -- */
  {
    slug: "immeuble-balcons-filants",
    publicacao: "provisorio",
    origem: `${ORIGEM_FOTOS} Groupe E.`,
    realizadoPor: "stoa",
    pessoa: null,
    colaboracao: null,
    local: null,
    periodo: null,
    estado: null,
    missao: null,
    capa: "immeuble-e-balcons",
    video: "approche-immeuble",
    galeria: [
      { tipo: "video", video: "approche-immeuble" },
      { tipo: "par", imagens: ["heroi-immeuble", "immeuble-e-grue"] },
      { tipo: "video", video: "orbite-immeuble" },
    ],
    destaque: 1,
    partilha: "partilha-immeuble-e",
  },
  {
    slug: "immeuble-village",
    publicacao: "provisorio",
    origem: `${ORIGEM_FOTOS} Groupe J2.`,
    realizadoPor: "stoa",
    pessoa: null,
    colaboracao: null,
    local: null,
    periodo: null,
    estado: null,
    missao: null,
    capa: "immeuble-j2-village",
    video: null,
    galeria: [{ tipo: "largo", imagem: "immeuble-j2-arbre" }],
    destaque: 2,
    partilha: "partilha-immeuble-j2",
  },
  {
    slug: "chantier-immeuble",
    publicacao: "provisorio",
    origem: `${ORIGEM_FOTOS} Groupe G : trois séries de vues qui semblent montrer le même chantier (silo jaune, voisin à toiture photovoltaïque).`,
    realizadoPor: "stoa",
    pessoa: null,
    colaboracao: null,
    local: null,
    periodo: null,
    estado: null,
    missao: null,
    capa: "chantier-g-etape3-a",
    video: null,
    galeria: [
      { tipo: "etapas", imagens: ["chantier-g-etape1-a", "chantier-g-etape2-b", "chantier-g-etape3-b"] },
      { tipo: "largo", imagem: "chantier-g-etape2-c" },
      { tipo: "par", imagens: ["chantier-g-etape1-b", "chantier-g-etape3-c"] },
    ],
    destaque: 3,
    partilha: "partilha-chantier-g",
  },
  {
    slug: "villas-mitoyennes",
    publicacao: "provisorio",
    origem: `${ORIGEM_FOTOS} Groupe D.`,
    realizadoPor: "stoa",
    pessoa: null,
    colaboracao: null,
    local: null,
    periodo: null,
    estado: null,
    missao: null,
    capa: "villas-d-prairie",
    video: "approche-villas",
    galeria: [
      { tipo: "video", video: "approche-villas" },
      { tipo: "largo", imagem: "villas-d-lisiere" },
    ],
    destaque: 4,
    partilha: "partilha-villas-d",
  },
  {
    slug: "immeuble-facades-panneaux",
    publicacao: "provisorio",
    origem: `${ORIGEM_FOTOS} Groupe J1 (peut-être le même bâtiment que J2, à confirmer).`,
    realizadoPor: "stoa",
    pessoa: null,
    colaboracao: null,
    local: null,
    periodo: null,
    estado: null,
    missao: null,
    capa: "immeuble-j1-toiture",
    video: "recul-immeuble-panneaux",
    galeria: [
      { tipo: "video", video: "recul-immeuble-panneaux" },
      { tipo: "par", imagens: ["facade-panneaux", "immeuble-j1-toiture"] },
    ],
    destaque: null,
  },
  {
    slug: "terrassement-fondations",
    publicacao: "provisorio",
    origem: `${ORIGEM_FOTOS} Groupe I : trois séries de vues qui semblent montrer le même terrain.`,
    realizadoPor: "stoa",
    pessoa: null,
    colaboracao: null,
    local: null,
    periodo: null,
    estado: null,
    missao: null,
    capa: "terrain-i-etape3-a",
    video: null,
    galeria: [
      { tipo: "etapas", imagens: ["terrain-i-etape1-b", "terrain-i-etape2-a", "terrain-i-etape3-b"] },
      { tipo: "largo", imagem: "terrain-i-etape1-c" },
    ],
    destaque: null,
  },
  {
    slug: "immeuble-facades-rosees",
    publicacao: "provisorio",
    origem: `${ORIGEM_FOTOS} Groupe A.`,
    realizadoPor: "stoa",
    pessoa: null,
    colaboracao: null,
    local: null,
    periodo: null,
    estado: null,
    missao: null,
    capa: "immeuble-a-aerien",
    video: null,
    galeria: [{ tipo: "largo", imagem: "immeuble-a-facade" }],
    destaque: null,
  },
  {
    slug: "immeuble-toiture-vegetalisee",
    publicacao: "provisorio",
    origem: `${ORIGEM_FOTOS} Groupe B.`,
    realizadoPor: "stoa",
    pessoa: null,
    colaboracao: null,
    local: null,
    periodo: null,
    estado: null,
    missao: null,
    capa: "immeuble-b-toiture",
    video: null,
    galeria: [{ tipo: "largo", imagem: "immeuble-b-terrasses" }],
    destaque: null,
  },
  {
    slug: "maison-toiture-tuiles",
    publicacao: "provisorio",
    origem: `${ORIGEM_FOTOS} Groupe F.`,
    realizadoPor: "stoa",
    pessoa: null,
    colaboracao: null,
    local: null,
    periodo: null,
    estado: null,
    missao: null,
    capa: "maison-f-toiture",
    video: null,
    galeria: [{ tipo: "largo", imagem: "maison-f-facade" }],
    destaque: null,
  },
  {
    slug: "batiment-activites",
    publicacao: "provisorio",
    origem: `${ORIGEM_FOTOS} Groupe H.`,
    realizadoPor: "stoa",
    pessoa: null,
    colaboracao: null,
    local: null,
    periodo: null,
    estado: null,
    missao: null,
    capa: "batiment-h-toiture",
    video: null,
    galeria: [{ tipo: "par", imagens: ["batiment-h-installation", "batiment-h-zone"] }],
    destaque: null,
  },

  /* --------------------------------------------- referências (site atual) -- */
  {
    slug: "transformation-arconciel",
    publicacao: "validado",
    origem: `${ORIGEM_SITE} Texte alternatif de l'image : « direction des travaux géré par Leandro Lopes ».`,
    realizadoPor: "colaborador",
    pessoa: "Leandro Lopes",
    colaboracao: { empresa: "Georges Hayoz", cidade: "Fribourg" },
    local: "Arconciel",
    periodo: "2020",
    estado: null,
    missao: "direction-des-travaux",
    capa: "ref-arconciel",
    video: null,
    galeria: [],
    destaque: null,
  },
  {
    slug: "quartier-villas-chesopelloz",
    publicacao: "validado",
    origem: ORIGEM_SITE,
    realizadoPor: "colaborador",
    pessoa: null,
    colaboracao: { empresa: "Formul’habitat", cidade: "Bulle" },
    local: "Chésopelloz",
    periodo: "2015",
    estado: null,
    missao: "direction-des-travaux",
    capa: "ref-chesopelloz",
    video: null,
    galeria: [],
    destaque: null,
  },
  {
    slug: "immeuble-ppe-noreaz",
    publicacao: "validado",
    origem: ORIGEM_SITE,
    realizadoPor: "colaborador",
    pessoa: null,
    colaboracao: { empresa: "Archi-Thèmes", cidade: "Vaulruz" },
    local: "Noréaz",
    periodo: "2017",
    estado: null,
    missao: "direction-des-travaux",
    capa: "ref-noreaz",
    video: null,
    galeria: [],
    destaque: null,
  },
  {
    slug: "quartier-villas-corminboeuf",
    publicacao: "validado",
    origem: `${ORIGEM_SITE} Texte alternatif de l'image : « Leandro Lopes a assisté la direction des travaux ».`,
    realizadoPor: "colaborador",
    pessoa: "Leandro Lopes",
    colaboracao: { empresa: "Roya Immobilier", cidade: "Villars-sur-Glâne" },
    local: "Corminboeuf",
    periodo: "2016–2021",
    estado: null,
    missao: "assistant-direction-des-travaux",
    capa: "ref-corminboeuf",
    video: null,
    galeria: [],
    destaque: null,
  },
];

function validar(): Projeto[] {
  const lido = z.array(Projeto).safeParse(DADOS);
  if (!lido.success) {
    const linhas = lido.error.issues.map((i) => {
      const [indice, ...resto] = i.path;
      const slug = typeof indice === "number" ? DADOS[indice]?.slug : "?";
      return `  ✖ ${slug} → ${resto.join(".")}: ${i.message}`;
    });
    throw new Error(`src/data/projetos.ts inválido:\n${linhas.join("\n")}`);
  }

  const slugs = lido.data.map((p) => p.slug);
  const repetidos = slugs.filter((s, i) => slugs.indexOf(s) !== i);
  if (repetidos.length) throw new Error(`src/data/projetos.ts: slugs repetidos: ${repetidos.join(", ")}`);

  return lido.data as Projeto[];
}

export const TODOS_OS_PROJETOS: Projeto[] = validar();

/** O que o modo atual deixa mostrar: tudo em aperçu, só o validado em publicação. */
export const projetosVisiveis = (): Projeto[] =>
  EM_PUBLICACAO ? TODOS_OS_PROJETOS.filter((p) => p.publicacao === "validado") : TODOS_OS_PROJETOS;

export const realizacoesStoa = () => projetosVisiveis().filter((p) => p.realizadoPor === "stoa");

export const referencias = () => projetosVisiveis().filter((p) => p.realizadoPor === "colaborador");

export function projetoPorSlug(slug: string): Projeto | undefined {
  return projetosVisiveis().find((p) => p.slug === slug);
}

/**
 * Os da página inicial, pela ordem de `destaque`. Se nenhum dos destacados
 * puder sair (em publicação, antes de haver projetos validados), ficam os
 * primeiros visíveis — hoje, as referências.
 */
export function projetosEmDestaque(maximo = 4): Projeto[] {
  const visiveis = projetosVisiveis();
  const destacados = visiveis
    .filter((p) => p.destaque !== null)
    .sort((a, b) => (a.destaque ?? 0) - (b.destaque ?? 0));
  return (destacados.length ? destacados : visiveis).slice(0, maximo);
}

/** O seguinte na ordem do portefólio, e o primeiro depois do último. */
export function projetoSeguinte(slug: string): Projeto | undefined {
  const lista = [...realizacoesStoa(), ...referencias()];
  const i = lista.findIndex((p) => p.slug === slug);
  if (i === -1 || lista.length < 2) return undefined;
  return lista[(i + 1) % lista.length];
}
