# Direção artística

Grelha assimétrica, calcário, carvão e verde derivado da identidade existente. Archivo e IBM Plex Mono; fotografias em primeiro plano e linhas discretas. Marca tipográfica provisória enquanto falta o original vetorial.

## Três momentos

1. Hero: fotografia real, marca atrás do edifício e aproximação curta. Geometria em píxeis do original em `src/data/heroi.ts`. Desktop usa a imagem aérea; mobile usa a fachada de maior resolução. Na primeira visita da sessão, uma entrada de ~2,7 s passa do desenho técnico do edifício e dos principais contornos do envolvente (`plantaDe`) à fotografia inteira, numa dissolução coordenada sem fase do prédio isolado; no mobile é só a aresta da fachada. Qualquer gesto a acaba; menos movimento e sem JavaScript mostram o estado final.
2. Projetos: sequência de imagens amplas com sobreposição temporária em desktop; leitura vertical no mobile.
3. Fecho: entrada da marca de grande escala.

A **página de cada projeto** lê-se como a obra andou: os capítulos do relato (número gigante em contorno, rótulo em mono, fio verde que se desenha ao rolar; os pares trocam de lado) intercalados com os blocos da galeria. Cada imagem vive num quadro de proporção fixa preso à grelha, com legenda numerada ("Fig. 01"); os blocos largos alternam de lado como os capítulos e ficam até 1280 px (o tamanho dos originais do drone). Ao entrar, o quadro abre-se de um recorte e a fotografia desliza lá dentro; o par sobrepõe a segunda imagem ao canto da primeira, e a sobreposição muda ao rolar. No telemóvel o par não se sobrepõe (tapava a legenda).

O motor anterior não tinha desmontagem adequada à navegação entre páginas. Foi substituído por `src/lib/movimento/progresso.ts`, que escreve `--p`; não adicionar outro motor sobre os mesmos elementos.

## Revisão visual obrigatória

Ver a inicial a 320, 390, 1440 e 2560 px, incluindo a transição completa do hero, empilhamento dos projetos e rodapé. Confirmar botões no primeiro ecrã, recorte sem deslocamentos e ausência de overflow. Navegar do portefólio a um projeto e voltar; abrir âncoras da inicial a partir de páginas interiores. Testar teclado, menu, foco, movimento reduzido e ausência de JavaScript. Verificar que o vídeo mantém poster e controlo de pausa.

As capturas da sessão inicial estão em `lab/`, não versionadas. Não são evidência de verificações posteriores.
