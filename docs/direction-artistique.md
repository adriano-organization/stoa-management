# Direção artística

Grelha assimétrica, calcário, carvão e verde derivado da identidade existente. Archivo e IBM Plex Mono; fotografias em primeiro plano e linhas discretas. Marca tipográfica provisória enquanto falta o original vetorial.

## Três momentos

1. Hero: fotografia real, marca atrás do edifício e aproximação curta. Geometria em píxeis do original em `src/data/heroi.ts`. Desktop usa a imagem aérea; mobile usa a fachada de maior resolução. Na primeira visita da sessão, uma entrada de ~2,7 s passa do desenho técnico do edifício e dos principais contornos do envolvente (`plantaDe`) à fotografia inteira, numa dissolução coordenada sem fase do prédio isolado; no mobile é só a aresta da fachada. Qualquer gesto a acaba; menos movimento e sem JavaScript mostram o estado final.
2. Projetos: sequência de imagens amplas com sobreposição temporária em desktop; leitura vertical no mobile.
3. Fecho: entrada da marca de grande escala.

## Portefólio

`/realisations` segue o mesmo registo, em três tempos: a **abertura** (o projeto em destaque de ponta a ponta, com o vídeo do drone quando o há, "Réalisations" em letras que sobem uma a uma, e a imagem a escurecer até ao carvão ao rolar); o **trilho** (os outros projetos numa fila que anda de lado enquanto a página desce, com número gigante em contorno, paralaxe na fotografia e barra de progresso verde; modo `lateral` do motor); e as **referências** num índice tipográfico, com a fotografia a subir em cortina ao passar o rato. Parado (telemóvel, menos movimento, sem JavaScript) o trilho é uma coluna vertical assimétrica. Em publicação, sem projetos da STOA validados, a abertura é a primeira referência, com a nota do colaborador, e não há trilho.

A **página de cada projeto** lê-se como a obra andou: os capítulos do relato (número gigante em contorno, rótulo em mono, fio verde que se desenha ao rolar; os pares trocam de lado) intercalados com os blocos da galeria. Cada imagem vive num quadro de proporção fixa preso à grelha, com legenda numerada ("Fig. 01"); os blocos largos alternam de lado como os capítulos e ficam até 1280 px (o tamanho dos originais do drone). Ao entrar, o quadro abre-se de um recorte e a fotografia desliza lá dentro; o par sobrepõe a segunda imagem ao canto da primeira, e a sobreposição muda ao rolar. No telemóvel o par não se sobrepõe (tapava a legenda).

## Contacto

`/contact` em três tempos. À **cabeça**, o título e as três vias diretas (e-mail, telefones, morada) numeradas em contorno como os capítulos dos projetos, com o fio verde a desenhar-se ao entrar. Depois, o **formulário**, com o título, as redes e a fotografia do escritório (só em aperçu) presos ao lado. A **fechar**, o mapa do escritório de ponta a ponta, com a morada num cartão por cima (no telemóvel, por baixo).

O mapa não é um `<iframe>`: são dois SVG desenhados do OpenStreetMap por `npm run mapa` (`scripts/desenhar-mapa.mjs`), nas cores do site, sem pedidos a terceiros. Primeiro vê-se o traço, como uma planta; ao rolar, o mapa pintado abre-se em círculo a partir do escritório. Parado, o mapa está inteiro. É mostrado a escala fixa (`--escala`), e não esticado: um ecrã maior vê mais terreno. O crédito do OpenStreetMap fica sempre visível (licença ODbL).

O motor anterior não tinha desmontagem adequada à navegação entre páginas. Foi substituído por `src/lib/movimento/progresso.ts`, que escreve `--p`; não adicionar outro motor sobre os mesmos elementos.

## Revisão visual obrigatória

Ver a inicial a 320, 390, 1440 e 2560 px, incluindo a transição completa do hero, empilhamento dos projetos e rodapé. Confirmar botões no primeiro ecrã, recorte sem deslocamentos e ausência de overflow. No portefólio, percorrer o trilho até ao fim (1280×720 e 2560×1440 incluídos) e passar o rato nas referências. Navegar do portefólio a um projeto e voltar; abrir âncoras da inicial a partir de páginas interiores. Testar teclado, menu, foco, movimento reduzido e ausência de JavaScript. Verificar que o vídeo mantém poster e controlo de pausa. No contacto, rolar até ao mapa e ver o traço a dar lugar ao mapa pintado, com o alfinete em cima do escritório a 390, 1440 e 2560 px.

As capturas da sessão inicial estão em `lab/`, não versionadas. Não são evidência de verificações posteriores.
