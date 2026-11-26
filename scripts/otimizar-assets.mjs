// Otimiza os assets extraídos por scripts/extrair-assets.mjs.
//  - Imagens -> WebP q80 (máx. 1600px; resultados 1200px), mantendo o nome.
//  - logo.png -> logo.webp 512px (recortado no círculo creme).
//  - Vídeos -> H.264 leve, sem áudio, faststart + pôster WebP (requer ffmpeg).
//  - HDR de estúdio (preset "studio" do drei) -> 512x256 para carregar rápido no celular.
// Uso: node scripts/otimizar-assets.mjs        (apaga os originais pesados de public/assets)

import { readdir, readFile, writeFile, rm, stat, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname, extname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import sharp from "sharp";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ASSETS = join(ROOT, "public", "assets");
const kb = (n) => `${(n / 1024).toFixed(0)} KB`;

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else out.push(p);
  }
  return out;
}

async function images() {
  const files = (await walk(ASSETS)).filter((f) => /\.(jpe?g|png)$/i.test(f));
  for (const file of files) {
    const name = basename(file, extname(file));
    const out = join(dirname(file), `${name}.webp`);
    const before = (await stat(file)).size;
    let img = sharp(file).rotate();

    if (name === "logo") {
      // recorta no círculo (área opaca) e gera 512px
      img = sharp(await sharp(file).trim({ threshold: 0 }).toBuffer()).resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } });
    } else if (name === "mapa-paulista") {
      // opcional: usamos o mapa real do Google; mantemos uma versão leve
      img = img.resize({ width: 900, withoutEnlargement: true });
    } else {
      const max = file.includes(`${"resultados"}`) ? 1200 : 1600;
      img = img.resize({ width: max, height: max, fit: "inside", withoutEnlargement: true });
    }

    await img.webp({ quality: 80, effort: 6 }).toFile(out);
    const after = (await stat(out)).size;
    await rm(file);
    console.log(`  ${basename(file)} ${kb(before)} -> ${basename(out)} ${kb(after)}`);
  }
}

function hasFfmpeg() {
  try {
    execFileSync("ffmpeg", ["-version"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

async function videos() {
  const dir = join(ASSETS, "videos");
  if (!existsSync(dir)) return;
  if (!hasFfmpeg()) {
    console.warn("  ffmpeg não encontrado: vídeos mantidos como estão");
    return;
  }
  for (const f of (await readdir(dir)).filter((f) => f.endsWith(".mp4") && !f.includes(".opt"))) {
    const src = join(dir, f);
    const tmp = join(dir, f.replace(".mp4", ".opt.mp4"));
    const before = (await stat(src)).size;
    execFileSync("ffmpeg", [
      "-y", "-loglevel", "error", "-i", src,
      "-an", "-c:v", "libx264", "-preset", "slow", "-crf", "27",
      "-profile:v", "high", "-pix_fmt", "yuv420p",
      "-vf", "scale=480:-2", "-movflags", "+faststart", tmp,
    ]);
    const poster = join(dir, f.replace(".mp4", "-poster.jpg"));
    execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-ss", "0.6", "-i", tmp, "-frames:v", "1", "-q:v", "3", poster]);
    await sharp(poster).webp({ quality: 72 }).toFile(poster.replace(".jpg", ".webp"));
    await rm(poster);
    await rm(src);
    await writeFile(src, await readFile(tmp));
    await rm(tmp);
    console.log(`  ${f} ${kb(before)} -> ${kb((await stat(src)).size)}`);
  }
}

// ---------- HDR (Radiance RGBE) downscale ----------
function readHDR(buf) {
  let pos = 0;
  const line = () => {
    let s = "";
    while (buf[pos] !== 0x0a) s += String.fromCharCode(buf[pos++]);
    pos++;
    return s;
  };
  const header = [];
  let l;
  while ((l = line()) !== "") header.push(l);
  const dims = line().match(/-Y (\d+) \+X (\d+)/);
  const h = +dims[1];
  const w = +dims[2];
  const data = new Float32Array(w * h * 3);
  const scan = new Uint8Array(w * 4);
  for (let y = 0; y < h; y++) {
    if (buf[pos] === 2 && buf[pos + 1] === 2 && !(buf[pos + 2] & 0x80)) {
      pos += 4;
      for (let c = 0; c < 4; c++) {
        let x = 0;
        while (x < w) {
          let count = buf[pos++];
          if (count > 128) {
            count -= 128;
            const v = buf[pos++];
            while (count--) scan[(x++) * 4 + c] = v;
          } else {
            while (count--) scan[(x++) * 4 + c] = buf[pos++];
          }
        }
      }
    } else {
      for (let i = 0; i < w * 4; i++) scan[i] = buf[pos++];
    }
    for (let x = 0; x < w; x++) {
      const e = scan[x * 4 + 3];
      const f = e ? Math.pow(2, e - 136) : 0;
      const o = (y * w + x) * 3;
      data[o] = scan[x * 4] * f;
      data[o + 1] = scan[x * 4 + 1] * f;
      data[o + 2] = scan[x * 4 + 2] * f;
    }
  }
  return { w, h, data };
}

function writeHDR({ w, h, data }) {
  const head = Buffer.from(`#?RADIANCE\nFORMAT=32-bit_rle_rgbe\n\n-Y ${h} +X ${w}\n`, "ascii");
  const px = Buffer.alloc(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    const r = data[i * 3], g = data[i * 3 + 1], b = data[i * 3 + 2];
    const m = Math.max(r, g, b);
    if (m < 1e-32) continue;
    const e = Math.ceil(Math.log2(m) + 1e-9);
    const s = 256 / Math.pow(2, e);
    px[i * 4] = Math.min(255, Math.floor(r * s));
    px[i * 4 + 1] = Math.min(255, Math.floor(g * s));
    px[i * 4 + 2] = Math.min(255, Math.floor(b * s));
    px[i * 4 + 3] = e + 128;
  }
  return Buffer.concat([head, px]);
}

async function hdr() {
  const src = join(ROOT, "public", "hdr", "studio_small_03_1k.hdr");
  if (!existsSync(src)) return;
  const img = readHDR(await readFile(src));
  const f = img.w / 512;
  const w = 512, h = Math.round(img.h / f);
  const data = new Float32Array(w * h * 3);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++)
      for (let c = 0; c < 3; c++) {
        let sum = 0;
        for (let dy = 0; dy < f; dy++)
          for (let dx = 0; dx < f; dx++) sum += img.data[((y * f + dy) * img.w + (x * f + dx)) * 3 + c];
        data[(y * w + x) * 3 + c] = sum / (f * f);
      }
  const out = join(ROOT, "public", "hdr", "studio.hdr");
  await mkdir(dirname(out), { recursive: true });
  await writeFile(out, writeHDR({ w, h, data }));
  await rm(src);
  console.log(`  studio HDR ${img.w}x${img.h} -> ${w}x${h} (${kb((await stat(out)).size)})`);
}

console.log("Imagens:");
await images();
console.log("Vídeos:");
await videos();
console.log("HDR:");
await hdr();
console.log("OK");
