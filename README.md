# BM Odontologia — landing page (rascunho v2)

Experiência imersiva para a **BM Odontologia** (lentes em resina, São Paulo), no espírito de
apple.com/airpods-pro, landonorris.com e activetheory.net.

**Stack:** React 19 · Vite 8 · TypeScript · Tailwind 4 · WebGL (shader próprio) · React Three Fiber + drei ·
GSAP ScrollTrigger · Lenis. Especificação e decisões de identidade em [`CLAUDE.md`](./CLAUDE.md).

## O que tem

1. **Abertura** — contador 0–100 enquanto o vídeo carrega; depois a cortina sobe.
2. **Hero em WebGL** — retrato em vídeo que se funde ao estúdio da página (sem bordas), com color grading,
   grão e uma "lente de resina" que refrata a imagem seguindo o cursor (no celular, flutua sobre o sorriso).
3. **Sequência estilo AirPods** — quadros do vídeo controlados pela rolagem: um cartão cresce até a tela
   cheia enquanto ela vira e sorri para a câmera.
4. **Lentes em resina** — dente + lente 3D em estúdio de porcelana (arraste para girar), simulador de
   tonalidade (BL1–A2) e formato (oval/quadrado/triangular), processo e técnicas.
5. **Resultados** (fotos e vídeos reais), **Doutores**, **Depoimentos** (5,0 no Google), **Localização + FAQ**
   e rodapé com os responsáveis técnicos.

## Rodar

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # gera dist/
npm start          # serve dist/ em $PORT (Railway)
```

`?3d=1` força o WebGL/3D em aparelhos sem GPU (útil para gravar ou testar em VM).

## Deploy (Railway)

O serviço do Railway publica a branch `main`: build `npm run build`, start `npm start` (ver `railway.json`).
Para a URL pública: **Settings → Networking → Generate Domain**.

## Desempenho

- Um único relógio (ticker do GSAP) para scroll suave, shader, sequência e 3D — sem loops concorrentes.
- Shader da abertura sem three.js (carrega rápido); cena 3D carregada sob demanda e renderizada só na tela.
- Sem GPU (WebGL emulado na CPU) a página usa vídeo direto e pôster estático no lugar do 3D.
- Quadros da sequência carregados progressivamente a partir da primeira rolagem.
- Lighthouse (build de produção): celular 95 · desktop 99 em desempenho; acessibilidade 100.

## Antes de publicar oficialmente

- [ ] Confirmar com a clínica o WhatsApp **(11) 97352-4548** (`src/content.ts`).
- [ ] Remover o `noindex` do `index.html` e liberar `public/robots.txt`.
- [ ] Idealmente, trocar o vídeo de banco da abertura por um filmado na clínica (mesmo enquadramento).

## Mídia

- Abertura e sequência: Pexels vídeo 5496767 (licença Pexels, uso comercial gratuito), processado com
  ffmpeg: loop sem emenda (xfade), recorte 4:5, H.264 sem áudio; quadros WebP extraídos do trecho 6,2–10,8 s.
- Fonte: Switzer (Fontshare, ITF Free Font License).
- Fotos e vídeos de casos: site atual da clínica (`npm run assets:extrair` + `npm run assets:otimizar`).

## Código de Ética Odontológica

Sem preços, descontos, parcelamento ou formas de pagamento; sem a expressão de comparação proibida;
sem promessa de resultado; CROs visíveis; imagens de banco marcadas como ilustrativas; casos clínicos com
a nota de autorização dos pacientes.
