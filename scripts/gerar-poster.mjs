// Gera public/assets/dente-3d.webp: um quadro da própria cena 3D, usado como
// fallback quando o aparelho não tem WebGL acelerado.
// Uso: npm run dev   (em outro terminal)   e depois   node scripts/gerar-poster.mjs [url]
// Requer Playwright com Chromium instalado (npx playwright install chromium).

import { chromium } from "playwright";
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const base = process.argv[2] || "http://localhost:5173/";

const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3 });
await page.goto(`${base}?3d=1&capture=1`, { waitUntil: "networkidle" });
await page.waitForTimeout(5000);
const r = await page.evaluate(() => {
  const b = document.querySelector("#inicio .min-h-\\[230px\\] > div").getBoundingClientRect();
  return { x: b.x, y: b.y, w: b.width, h: b.height };
});
const h = r.h * 1.12;
const w = (h * 640) / 900;
const clip = { x: r.x + r.w / 2 - w / 2, y: Math.max(0, r.y + r.h / 2 - h / 2), width: w, height: h };
const png = await page.screenshot({ clip });
await sharp(png).resize(640, 900).webp({ quality: 82, effort: 6 }).toFile(join(ROOT, "public/assets/dente-3d.webp"));
await browser.close();
console.log("OK: public/assets/dente-3d.webp", clip);
