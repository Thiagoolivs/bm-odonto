// Extrai as fotos e vídeos reais do site atual da BM Odontologia
// (as imagens estão embutidas no HTML como data URI) e salva em public/assets.
// Uso: node scripts/extrair-assets.mjs   (Node 18+)

import { mkdir, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const SITE = process.env.BM_SITE || "https://bmodontologia.netlify.app/";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public", "assets");

const extOf = (mime) =>
  ({ "image/jpeg": "jpg", "image/jpg": "jpg", "image/png": "png", "image/webp": "webp", "image/svg+xml": "svg", "image/gif": "gif" }[mime] || "bin");

const attr = (tag, name) => {
  const m = tag.match(new RegExp(`\\s${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, "i"));
  return m ? (m[2] ?? m[3] ?? "") : "";
};

export function parseImages(html) {
  const tags = html.match(/<img\b[^>]*>/gi) || [];
  return tags.map((tag) => ({ alt: attr(tag, "alt"), src: attr(tag, "src") || attr(tag, "data-src") }));
}

export function nameFor(alt, counters) {
  const a = alt.toLowerCase();
  if (a.includes("logo")) return counters.logo++ ? null : "logo";
  if (a.includes("mulher sorrindo")) return "hero-sorriso";
  if (a.includes("alexia")) return "dra-alexia";
  if (a.includes("israel")) return "dr-israel";
  if (a.includes("paulista") || a.includes("mapa")) return "mapa-paulista";
  if (a.includes("resultado")) return `resultados/resultado-${String(++counters.res).padStart(2, "0")}`;
  return `outros/imagem-${String(++counters.other).padStart(2, "0")}`;
}

async function main() {
  console.log(`Baixando ${SITE} ...`);
  const html = await (await fetch(SITE)).text();
  await mkdir(join(OUT, "resultados"), { recursive: true });
  await mkdir(join(OUT, "videos"), { recursive: true });

  const counters = { logo: 0, res: 0, other: 0 };
  const saved = [];
  for (const { alt, src } of parseImages(html)) {
    const name = nameFor(alt, counters);
    if (!name || !src) continue;
    let buf, ext;
    const m = src.match(/^data:([^;,]+)(;base64)?,(.*)$/s);
    if (m) {
      ext = extOf(m[1]);
      buf = m[2] ? Buffer.from(m[3], "base64") : Buffer.from(decodeURIComponent(m[3]));
    } else {
      const url = new URL(src, SITE);
      const res = await fetch(url);
      if (!res.ok) { console.warn(`  pulei ${url} (${res.status})`); continue; }
      ext = extOf((res.headers.get("content-type") || "").split(";")[0]) || url.pathname.split(".").pop();
      buf = Buffer.from(await res.arrayBuffer());
    }
    const file = join(OUT, `${name}.${ext}`);
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, buf);
    saved.push(`${name}.${ext}`);
  }

  const videos = [...new Set((html.match(/videos\/[\w\-]+\.mp4/g) || []))];
  for (const v of videos) {
    const res = await fetch(new URL(v, SITE));
    if (!res.ok) { console.warn(`  pulei ${v} (${res.status})`); continue; }
    await writeFile(join(OUT, v), Buffer.from(await res.arrayBuffer()));
    saved.push(v);
  }

  console.log(`OK: ${saved.length} arquivos em public/assets`);
  saved.forEach((s) => console.log("  -", s));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((e) => { console.error(e); process.exit(1); });
}
