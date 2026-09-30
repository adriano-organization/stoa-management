import { redesConfirmadas, stoa } from "@/data/stoa";
import { imagemPublicavel } from "@/data/validacoes";
import { jsonParaScript } from "@/lib/json-em-script";
import { PARTILHA_DO_SITE } from "@/lib/metadata";
import { URL_SITE } from "@/lib/site";

/**
 * `schema.org/ProfessionalService` — um bureau de direção de obras.
 *
 * ## Só entra o que está confirmado
 *
 * Nome, endereço do site, email, morada e redes — tudo do site atual (ver
 * `src/data/stoa.ts`). Sem telefone da empresa (o site só dá os telemóveis de
 * duas pessoas, e um `telephone` da organização diria outra coisa), sem
 * horário, sem área servida, sem avaliações: o que aqui se escreve passa a ser
 * o que os motores de busca mostram, mesmo a quem nunca abre o site.
 *
 * ## Um objeto, não um array
 *
 * Um array não tem `@context`, e há leitores de dados estruturados que fazem
 * `JSON.parse(bloco)["@context"]` e rebentam. Se um dia houver outro bloco, é
 * outro `<script>`.
 */
export function DadosEstruturados({ descricao }: { descricao: string }) {
  const dados = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: stoa.nome,
    description: descricao,
    url: URL_SITE,
    email: stoa.email,
    /* A mesma regra da imagem de partilha (`lib/metadata.ts`). */
    ...(imagemPublicavel(PARTILHA_DO_SITE.de) ? { image: `${URL_SITE}${PARTILHA_DO_SITE.url}` } : {}),
    address: {
      "@type": "PostalAddress",
      streetAddress: stoa.morada.rua,
      postalCode: stoa.morada.codigoPostal,
      addressLocality: stoa.morada.localidade,
      addressRegion: stoa.morada.cantao,
      addressCountry: stoa.morada.pais,
    },
    ...(redesConfirmadas.length > 0 ? { sameAs: redesConfirmadas.map((r) => r.url) } : {}),
  };

  return (
    <script
      type="application/ld+json"
      /* Alimentado por `src/data/stoa.ts`, validado pelo `zod`, e escapado por
         `jsonParaScript` — ver o comentário da CSP em `src/lib/cabecalhos.ts`. */
      dangerouslySetInnerHTML={{ __html: jsonParaScript(dados) }}
    />
  );
}
