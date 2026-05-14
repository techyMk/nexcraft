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

// Bot icon: crop the bottom reflection so the bot fills the AI FAB cleanly.
{
  const inputPath = path.join(srcDir, "bot-icon.png");
  const outputPath = path.join(outDir, "bot-icon.webp");
  const meta = await sharp(inputPath).metadata();
  const w = meta.width ?? 0;
  const h = meta.height ?? 0;
  // Top 68% of the image — everything below is the soft shadow reflection.
  const cropHeight = Math.round(h * 0.68);
  await sharp(inputPath)
    .extract({ left: 0, top: 0, width: w, height: cropHeight })
    .resize(256, 256, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .webp({ quality: 92, alphaQuality: 100, effort: 6 })
    .toFile(outputPath);
  const out = await sharp(outputPath).metadata();
  console.log(`bot-icon.png → bot-icon.webp · ${out.width}×${out.height}`);
}
