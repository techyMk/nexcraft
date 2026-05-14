import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const srcDir = path.join(root, "assets");
const outDir = path.join(root, "public", "brand");

await mkdir(outDir, { recursive: true });

const jobs = [
  { in: "nexcart-logo.png", out: "nexcart-logo.webp", maxW: 1200 },
  { in: "nexcart-icon.png", out: "nexcart-icon.webp", maxW: 512 },
];

for (const j of jobs) {
  const inputPath = path.join(srcDir, j.in);
  const outputPath = path.join(outDir, j.out);
  const meta = await sharp(inputPath).metadata();
  await sharp(inputPath)
    .resize({ width: Math.min(j.maxW, meta.width ?? j.maxW), withoutEnlargement: true })
    .webp({ quality: 92, alphaQuality: 100, effort: 6 })
    .toFile(outputPath);
  const out = await sharp(outputPath).metadata();
  console.log(`${j.in} → ${j.out} · ${out.width}×${out.height}`);
}

// Bot icon: take a SQUARE crop centered on the bot's body so it fills a
// 1:1 frame in the AI FAB without distortion. The bot fills roughly the
// top 75% of the source; the bottom is reflection shadow we discard.
{
  const inputPath = path.join(srcDir, "bot-icon.png");
  const outputPath = path.join(outDir, "bot-icon.webp");
  const meta = await sharp(inputPath).metadata();
  const w = meta.width ?? 0;
  const h = meta.height ?? 0;
  const side = Math.min(w, Math.round(h * 0.78)); // square edge length
  const left = Math.round((w - side) / 2);
  await sharp(inputPath)
    .extract({ left, top: 0, width: side, height: side })
    .resize(256, 256)
    .webp({ quality: 92, alphaQuality: 100, effort: 6 })
    .toFile(outputPath);
  const out = await sharp(outputPath).metadata();
  console.log(`bot-icon.png → bot-icon.webp · ${out.width}×${out.height}`);
}
