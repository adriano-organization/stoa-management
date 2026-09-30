import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const base = process.argv[2] ?? 'http://localhost:3000';
const publico = process.env.STOA_PUBLICATION === '1';
/* Em publicação, o que não está validado não pode estar no HTML — nem
   visível, nem no que vai para o browser (o catálogo de mensagens já foi
   serializado inteiro por engano). */
const catalogos = ['fr-CH', 'pt', 'en'].map((l) =>
  JSON.parse(readFileSync(new URL(`../messages/${l}.json`, import.meta.url), 'utf8')),
);
const proibidosEmPublicacao = catalogos.flatMap((mensagens) => [
  mensagens.metodo.intro,
  ...Object.values(mensagens.metodo.etapas).map((e) => e.texto),
  mensagens.projetos['immeuble-balcons-filants'].titulo,
]);
const rotas = [
  '/', '/realisations', '/contact', '/realisations/transformation-arconciel',
  '/pt', '/pt/realisations', '/en', '/en/contact', '/en/realisations/transformation-arconciel',
];
for (const rota of rotas) {
  const resposta = await fetch(base + rota);
  assert.equal(resposta.status, 200, rota);
  assert.equal(resposta.headers.get('set-cookie'), null, `${rota}: cookie inesperado`);
  assert.ok(resposta.headers.get('content-security-policy'), `${rota}: falta CSP`);
  assert.ok(!resposta.headers.get('content-security-policy').includes('unsafe-eval'));
  const html = await resposta.text();
  assert.ok(!/\bsrc=["'](?:https?:)?\/\//i.test(html), `${rota}: recurso externo`);
  assert.ok(!/<link\b[^>]*href=["'](?:https?:)?\/\/[^>]*rel=["'](?:stylesheet|preload|preconnect)/i.test(html));
  assert.ok(!/Café Preguiça|cafepreguica|preguica_sessao/i.test(html), `${rota}: conteúdo residual`);
  if (!publico) assert.match(html, /noindex/);
  if (publico) for (const texto of proibidosEmPublicacao) assert.ok(!html.includes(texto), `${rota}: por validar no HTML: ${texto}`);
  console.log(`✓ ${rota}`);
}
for (const rota of ['/rota-inexistente', '/realisations/inexistente', '/pt/rota-inexistente', '/de/realisations']) {
  assert.equal((await fetch(base + rota)).status, 404, rota);
}
const provisoria = await fetch(base + '/realisations/immeuble-balcons-filants');
assert.equal(provisoria.status, publico ? 404 : 200);
const mapa = await (await fetch(base + '/sitemap.xml')).text();
if (publico) assert.ok(!mapa.includes('immeuble-balcons-filants'));
console.log(`✓ modo ${publico ? 'público' : 'pré-visualização'}`);
