import Link from "next/link";
import { routing } from "@/i18n/routing";
import "./globals.css";

/**
 * O 404 dos pedidos que nem chegam a ter língua — um caminho que o `proxy.ts`
 * não reconheceu de todo.
 *
 * Traz o seu próprio `<html>` porque **não há layout de raiz**: os layouts
 * vivem todos dentro de `[locale]`, e aqui ainda não se sabe qual é. Pela
 * mesma razão o texto está escrito à mão em vez de vir das mensagens.
 */
export default function NaoEncontradaGlobal() {
  return (
    <html lang={routing.defaultLocale}>
      <body>
        <main className="envelope" style={{ paddingBlock: "8rem" }}>
          <p className="legenda">Erreur 404</p>
          <h1 className="titulo-display" style={{ marginTop: "1rem" }}>
            Page introuvable.
          </h1>
          <p style={{ marginTop: "1.5rem" }}>Cette page n’existe pas ou a changé d’adresse.</p>
          <Link href="/" className="botao" style={{ marginTop: "2rem" }}>
            Retour à l’accueil
          </Link>
        </main>
      </body>
    </html>
  );
}
