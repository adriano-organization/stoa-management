import { z } from "zod";

/**
 * # Os factos da empresa
 *
 * Tudo o que é igual em qualquer língua: nome, morada, contactos, redes. O
 * texto que muda com a língua vive em `messages/`.
 *
 * **Fonte:** o site atual, https://stoa-management.ch, consultado a
 * 2026-09-30. Nada aqui foi deduzido de outro sítio (Google, agregadores,
 * registo comercial) — e nada deve ser, sem a STOA confirmar. A lista do que
 * falta confirmar está em `docs/a-confirmer.md`.
 *
 * ⚠️ `null` quer dizer "não confirmado", e faz o campo **desaparecer do site**.
 * É o comportamento certo: mais vale não mostrar um número do que mostrar um
 * errado.
 */
const Pessoa = z.object({
  nome: z.string().min(1),
  /* Em formato internacional, com espaços — é assim que se escreve e se lê na
     Suíça. O `href` do `tel:` tira os espaços sozinho. */
  telefone: z.string().regex(/^\+41( \d{2,3}){3,4}$/).nullable(),
  email: z.email().nullable(),
});

const EsquemaStoa = z.object({
  nome: z.string().min(1),
  morada: z.object({
    rua: z.string().min(1),
    codigoPostal: z.string().regex(/^\d{4}$/),
    localidade: z.string().min(1),
    /* O cantão por extenso vive nas mensagens; aqui fica o código oficial. */
    cantao: z.literal("FR"),
    pais: z.literal("CH"),
  }),
  /* Link normal para o mapa, e não um `<iframe>`: ver `src/lib/cabecalhos.ts`. */
  mapa: z.url().nullable(),
  /* O ponto do escritório no mapa da página de contacto
     (`scripts/desenhar-mapa.mjs`) e nos dados estruturados. */
  coordenadas: z.object({ lat: z.number().min(45.8).max(47.9), lon: z.number().min(5.9).max(10.5) }).nullable(),
  email: z.email(),
  contactos: z.array(Pessoa),
  redes: z.object({
    instagram: z.url().nullable(),
    linkedin: z.url().nullable(),
    facebook: z.url().nullable(),
  }),
});

export type Stoa = z.infer<typeof EsquemaStoa>;

export const stoa: Stoa = EsquemaStoa.parse({
  nome: "STOA Management",
  morada: {
    /* No site atual: "Chem. de la Longivue 31". */
    rua: "Chemin de la Longivue 31",
    codigoPostal: "1726",
    localidade: "Farvagny-le-Grand",
    cantao: "FR",
    pais: "CH",
  },
  mapa: "https://maps.app.goo.gl/THxUNvDjqhRdPUPNA",
  /* Do registo oficial de endereços de edifícios (swisstopo, "Chemin de la
     Longivue 31, 1726 Farvagny-le-Grand", EGID 192067001), consultado a
     2026-10-01. Bate a 14 m com o ponto do link `mapa` acima, que é o do site
     atual. ⚠️ O OpenStreetMap não tem este número: não o ir buscar lá. */
  coordenadas: { lat: 46.725418, lon: 7.081749 },
  email: "dt@stoa-management.ch",
  contactos: [
    { nome: "Leandro Lopes", telefone: "+41 76 512 88 83", email: "l.lopes@stoa-management.ch" },
    { nome: "Cristiano Lopes", telefone: "+41 76 516 88 83", email: "c.lopes@stoa-management.ch" },
  ],
  redes: {
    instagram: "https://www.instagram.com/stoa_management/",
    linkedin: "https://www.linkedin.com/company/stoamanagement/",
    facebook: "https://www.facebook.com/profile.php?id=100081869361131",
  },
});

/** As redes confirmadas, pela ordem em que aparecem no rodapé. */
export const redesConfirmadas = (
  [
    ["Instagram", stoa.redes.instagram],
    ["LinkedIn", stoa.redes.linkedin],
    ["Facebook", stoa.redes.facebook],
  ] as const
).flatMap(([nome, url]) => (url ? [{ nome, url }] : []));

/** `+41 76 512 88 83` → `tel:+41765128883`. */
export const hrefTelefone = (telefone: string) => `tel:${telefone.replace(/\s+/g, "")}`;
