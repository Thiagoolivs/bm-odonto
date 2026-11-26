# BM Odontologia — landing page (rascunho)

Landing page para apresentar à **BM Odontologia** (lentes em resina, São Paulo).
Foco: impacto visual no celular nos primeiros 5 segundos — dente 3D procedural com
uma lente de resina que "respira" e encaixa, partículas douradas e uma história
guiada pelo scroll até o simulador de cor e formato.

**Stack:** React 19 + Vite 8 + TypeScript + Tailwind 4 + React Three Fiber + drei +
GSAP (ScrollTrigger) + Lenis. A especificação completa está em [`CLAUDE.md`](./CLAUDE.md).

## Rodar

```bash
npm install
npm run dev            # http://localhost:5173 (use --host para abrir no celular)
npm run build          # gera dist/
npm start              # serve dist/ em $PORT (o que o Railway usa)
```

## Deploy no Railway

1. Suba o repositório no GitHub e, no Railway, **New Project → Deploy from GitHub repo**.
2. Nada a configurar: o `railway.json` já define `npm run build` e `npm start`
   (servidor estático `serve`, ouvindo em `0.0.0.0:$PORT`, com gzip/brotli e cache).
3. Em **Settings → Networking → Generate Domain** para ter a URL pública.

Node 22 (definido em `engines` e `.nvmrc`). Também funciona na Vercel sem configuração
(`npx vercel --prod`), como pede o `CLAUDE.md`.

## Antes de publicar oficialmente

- [ ] Confirmar com a clínica o WhatsApp **(11) 97352-4548** (`src/content.ts`).
- [ ] É um rascunho: `index.html` tem `noindex` e `public/robots.txt` bloqueia buscadores.
      Remova os dois quando a clínica aprovar.
- [ ] Revisar os textos em `src/content.ts` (todo o conteúdo está lá).

## Gravar o vídeo (~20 s, retrato)

Celular em modo não perturbe → ~5 s no hero (o dente gira e a lente encaixa sozinha)
→ rolar pela história (Avaliação → Planejamento → Aplicação) → no simulador, trocar
duas cores e um formato.

## Como o 3D funciona

- `src/three/geometry.ts` — incisivo central modelado proceduralmente (anéis de
  superelipse da borda incisal ao ápice). A lente é uma casca fina gerada da face
  vestibular da própria coroa, por isso encaixa com precisão. Oval/Quadrado/Triangular
  são *morph targets* da mesma malha.
- `src/three/Scene.tsx` — materiais (lente em `MeshPhysicalMaterial` com transmission
  0.9, clearcoat 1, ior 1.5, iridescência leve), luz de estúdio + rim light dourado,
  Environment "studio" (HDR do preset do drei servido localmente, reduzido para 512 px)
  e a coreografia: hero → história → simulador lendo a posição dos "slots" no DOM.
- Um único canvas fixo atrás das três primeiras seções; ele é carregado sob demanda,
  pausa quando sai da tela e usa DPR máx. 1.5 no celular.
- **Fallback:** sem WebGL — ou com WebGL emulado por software (SwiftShader/llvmpipe),
  que travaria a rolagem — mostramos um pôster estático da própria cena
  (`public/assets/dente-3d.webp`). Para forçar o 3D em qualquer aparelho: `?3d=1`.
- `prefers-reduced-motion`: sem rotação automática, sem scroll suave e sem animações
  de entrada; a lente fica parada à frente do dente.

## Assets

As fotos e vídeos reais vêm do site atual da clínica:

```bash
npm run assets:extrair    # baixa para public/assets
npm run assets:otimizar   # WebP q80 (máx. 1600/1200 px), logo 512 px, vídeos leves + pôsteres, HDR 512 px
npm run assets:poster     # (com o dev server rodando) regenera o pôster do fallback — requer Playwright
```

## Regras do Código de Ética Odontológica

Sem preços, descontos, parcelamento ou formas de pagamento; sem a expressão de
comparação proibida; sem promessa de resultado; responsáveis técnicos e CROs visíveis
no rodapé. O simulador traz a legenda "Simulação ilustrativa. A indicação final é feita
na avaliação." e os resultados, "Imagens publicadas com autorização dos pacientes".
