/*
  Deixa o `node --test` carregar os módulos de `src/` tal como estão.

  Os ficheiros de `src/` foram escritos para o bundler do Next: importam
  `@/lib/…`, importam `./esquema` sem extensão, importam JSON sem atributos, e
  importam `server-only` e `next/headers`, que fora do Next não fazem sentido.
  Este carregador resolve os três primeiros para os ficheiros verdadeiros e
  troca os dois últimos por versões mínimas (`testes/apoio/`). O código testado
  é o de produção, sem cópias.

  Usa-se com `node --import ./testes/apoio/carregador.mjs` (ver o script
  `testes` do `package.json`).
*/
import { registerHooks } from "node:module";
import { resolve } from "./resolvedor.mjs";

/* `registerHooks` (síncrono, na própria thread) e não o `register` antigo,
   que o Node marcou como obsoleto. */
registerHooks({ resolve });
