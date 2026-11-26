# BM Odontologia — rascunho de landing page

Landing page de altíssimo nível (padrão Awwwards) para a BM Odontologia, clínica de lentes em resina em São Paulo. É um RASCUNHO para apresentar à clínica por um vídeo de ~20s gravado no celular: prioridade total para impacto visual no celular nos primeiros 5 segundos.

## Primeiro passo (obrigatório)

1. Rode `node scripts/extrair-assets.mjs`. Ele baixa do site atual da clínica as fotos reais (logo, foto principal, 14 resultados, Dra. Alexia, Dr. Israel, ilustração da região) e 3 vídeos para `public/assets/`.
2. Otimize as imagens com `sharp`: WebP, largura máxima de 1600px (fotos de resultado, 1200px), qualidade 80. Mantenha os nomes dos arquivos. O logo original é um PNG grande: gere `logo.webp` com 512px e use-o.
3. Use SOMENTE essas fotos reais. Nada de banco de imagens.

Arquivos esperados em `public/assets/`:
- `logo.png`: monograma "BM" dourado em círculo creme
- `hero-sorriso.jpg`: mulher sorrindo
- `resultados/resultado-01.jpg` … `resultado-14.jpg`: casos clínicos
- `dra-alexia.png`, `dr-israel.png`: fotos dos doutores
- `mapa-paulista.png`: ilustração da região (opcional, preferir o mapa real)
- `videos/video_1.mp4` … `video_3.mp4`: vídeos de resultado

Se a extensão vier diferente (jpg/png), ajuste os caminhos no código conforme o que o script listou.

## Stack

React + Vite + TypeScript + Tailwind + React Three Fiber + @react-three/drei + GSAP (ScrollTrigger) + Lenis (scroll suave). Página única, mobile-first: valide em 390x844 retrato antes de tudo.

## Identidade (versão 2, aprovada pelo dono do projeto em 26/11/2026)

A primeira versão (marrom/dourado/creme + Cormorant) foi considerada "cafona" e descartada. Direção atual: editorial, premium, no espírito de apple.com/airpods-pro, landonorris.com e activetheory.net.

- Paleta: porcelana e grafite. `#ecebe8` (papel), `#e3e1dd`, `#d6d4cf` (estúdio), `#0e0e0f` (tinta), cinzas quentes para texto secundário. Sem dourado, sem azul clínico.
- Tipografia: Switzer (Fontshare, variável, auto-hospedada em `public/fonts`), títulos 500 com tracking bem apertado. Sem serifas decorativas, sem itálicos dourados, sem rótulos com tracinho, sem brilhinhos.
- Logo: monograma BM real da clínica em versão monocromática (`public/assets/mark-light.webp` / `mark-dark.webp`).
- Imagens: abertura e sequência com vídeo de banco (Pexels 5496767, licença gratuita, marcado como ilustrativo). Casos clínicos SOMENTE com as fotos/vídeos reais da clínica.
- Movimento: um relógio só (ticker do GSAP move Lenis, WebGL, sequência e 3D). Revelações por máscara de linha, nada de efeitos empilhados.

## Hero 3D (a estrela do vídeo)

- Dente incisivo central modelado proceduralmente (sem arquivo externo), com uma lente de resina ultrafina flutuando à frente
- Material da lente: MeshPhysicalMaterial com transmission ~0.9, thickness, clearcoat 1, ior 1.5 e iridescência leve, com aparência de resina polida
- Luz de estúdio suave + rim light dourado + Environment preset "studio"
- Animação idle automática: rotação lenta, a lente "respira" e encaixa no dente em loop suave de ~4s. Tem que parecer viva no vídeo mesmo sem toque.
- Arrastar para girar (sem zoom). Partículas douradas finíssimas ao redor.
- Header: logo real + menu (Tratamentos, Técnicas, Doutores, Depoimentos, Localização) + botão "Agendar avaliação"
- Texto: rótulo "ESTÉTICA QUE REALÇA O QUE TE FAZ ÚNICO", título "Um sorriso que combina com você.", botão "Agendar avaliação"
- 3 selos: "Em uma única sessão (casos indicados)" · "Até 4 horas" · "12 meses de garantia em contrato"

## Scroll story (pinned)

A lente se aproxima e encaixa no dente em 3 etapas, com texto ao lado: Avaliação → Planejamento individual → Aplicação.

## Simulador interativo

- Botões de tonalidade (BL1, BL2, B1, A1, A2) que mudam a cor da lente em tempo real com transição suave
- Botões de formato (Oval, Quadrado, Triangular) que fazem morph da geometria
- Legenda fixa: "Simulação ilustrativa. A indicação final é feita na avaliação."

## Demais seções

- **Sorriso real:** seção editorial com `hero-sorriso` em tela cheia, máscara arredondada e parallax
- **Técnicas:** 3 cards (Tradicional, Estratificada, Realista), cada um com mini animação de camadas de resina
- **Resultados:** carrossel com as 14 fotos de `resultados/`, arrastável, com a nota "Imagens publicadas com autorização dos pacientes". Abaixo, os 3 vídeos em cards verticais (autoplay mudo, loop, playsInline)
- **Doutores:** Dra. Alexia Mayara (CRO-SP 134840) e Dr. Israel Marcos (CRO-SP 150317), "Estética odontológica e lentes em resina", com fotos reais e efeito parallax. Links: https://www.instagram.com/dra.alexiamorais/ e https://www.instagram.com/dr.israael/
- **Depoimentos:** "5,0 no Google · 32 avaliações" em destaque, link para https://maps.app.goo.gl/6D25dwDvtskqCVMZ7, e 4 cards:
  - "Profissional excelente, extremamente competente e cuidadosa." (Gessica S.)
  - "Clínica excelente e atendimento impecável." (André S.)
  - "Super cuidadosos desde o primeiro contato." (Carla P.)
  - "Conheci a clínica pelo Instagram e estou feliz e realizada." (Luz M.)
- **Jornada:** Contato → Avaliação → Plano individual → Acompanhamento
- **Outros tratamentos:** limpeza, restaurações, implantes, extrações, cirurgias
- **FAQ em acordeão:** duração média de 5 a 8 anos · manutenção a cada 6 meses (limpeza, polimento e blindagem) · técnicas tradicional, estratificada e realista · dá para escolher a cor · aplicação confortável e minimamente invasiva · não causa mau hálito com higiene adequada
- **Formulário de pré-avaliação** em 3 passos animados: (1) nome + WhatsApp, (2) o que incomoda no sorriso (chips: cor, formato, espaços, desgaste, outro), (3) como conheceu a BM (Instagram, anúncio, Google, indicação, outro). No envio, abre `https://wa.me/5511973524548?text=` com mensagem pré-preenchida (URL-encoded) com as respostas.
- **Botão flutuante de WhatsApp:** `https://wa.me/5511973524548?text=` + "Olá, tudo bem? Quero saber mais das lentes em resina ultra realistas da BM Odontologia 😄"
- **Localização:** Av. Brigadeiro Luís Antônio, 2050, sala 41, São Paulo/SP · ~200 m do Metrô Brigadeiro, perto da Av. Paulista · atendimento com agendamento. Mapa real embutido: `https://www.google.com/maps?q=Av.+Brigadeiro+Lu%C3%ADs+Ant%C3%B4nio,+2050,+S%C3%A3o+Paulo&output=embed` (iframe com filtro grayscale + sépia leve para combinar com a paleta). Botão "Ver no Google Maps" → https://maps.app.goo.gl/6D25dwDvtskqCVMZ7
- **Rodapé:** logo, "Dr. Israel Marcos · CRO-SP 150317 | Dra. Alexia Mayara · CRO-SP 134840", Instagram https://www.instagram.com/bmodonto/ e WhatsApp

## Regras obrigatórias (Código de Ética Odontológica)

Não mostrar preços, descontos, parcelamento nem formas de pagamento. Não usar a expressão "antes e depois". Não prometer resultado. Manter nomes e CROs dos responsáveis técnicos visíveis.

## Performance

Lazy-load do canvas, DPR máximo 1.5 no mobile, fallback estático se o WebGL falhar, respeitar prefers-reduced-motion, imagens com `loading="lazy"` (exceto as do hero). Rolagem fluida a 60fps. Meta: Lighthouse mobile ≥ 85 em performance.

## Pronto quando

- `npm run build` passa sem erros
- Em 390x844 o hero 3D aparece em < 2s, gira sozinho e o simulador troca cor e formato
- Todos os links de WhatsApp abrem com o número 5511973524548
- Deploy no Railway a partir da `main` (`railway.json`); também funciona na Vercel
