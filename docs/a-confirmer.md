# A confirmar antes de publicar

- Nome, localização, missão, estado e direito de publicar imagens de cada projeto provisório. Grupos visuais não comprovam identidade ou cronologia.
- Atribuições das quatro referências históricas: conservar empresas parceiras e autoria dos colaboradores.
- Contactos, morada e afirmação sobre experiência recolhidos no site existente.
- Aprovação do texto de método: proposta editorial, sem garantias implícitas.
- Três retratos, nomes, funções e apresentações individuais; nunca preencher por dedução.
- Logótipo vetorial e versões de contraste adequadas.
- A folha em linha da transição entre páginas (`src/components/movimento/FolhaDaMarca.tsx`), redesenhada a partir do ícone: aprovação da STOA ou o vetor original. Até lá, em publicação, a transição desenha só o nome.
- Originais do drone com maior resolução; as capturas atuais têm maioritariamente 1280 × 720.
- Direito de publicação das imagens de escritório, pessoas identificáveis e marcas de terceiros. Não associar fotos novas a referências antigas.
- Conta Resend, domínio remetente, destinatário, Redis e teste de receção real.
- Validação do texto sobre dados pessoais, retenção e prestadores pela empresa.

`STOA_PUBLICATION=1` exclui projetos provisórios, perfis incompletos e o que está `provisorio` em `src/data/validacoes.ts` (texto do método; fotografias do herói, da apresentação, das competências e do contacto; imagem de partilha do site; a folha da transição). Nesse modo o herói fica sem fotografia e a secção do método desaparece até à aprovação. Marcar `validado` só com a confirmação da STOA; o modo de publicação não substitui essa aprovação.
