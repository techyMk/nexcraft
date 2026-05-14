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

// Bot icon: keep the full bot, just centre it. Pipeline is
// trim → pad-to-square → resize. No crop, no aspect distortion.
{
  const inputPath = path.join(srcDir, "bot-icon.png");
  const outputPath = path.join(outDir, "bot-icon.webp");

  // 1) Trim transparent borders so we get the bot's true bounding box.
  const trimmed = await sharp(inputPath)
    .trim()
    .toBuffer({ resolveWithObject: true });

  // 2) Pad with equal transparent pixels on each side to make a square
  //    canvas — guarantees the bot lands dead-centre regardless of any
  //    asymmetry in the source.
  const side = Math.max(trimmed.info.width, trimmed.info.height);
  const padTop = Math.floor((side - trimmed.info.height) / 2);
  const padBottom = side - trimmed.info.height - padTop;
  const padLeft = Math.floor((side - trimmed.info.width) / 2);
  const padRight = side - trimmed.info.width - padLeft;
  const squared = await sharp(trimmed.data)
    .extend({
      top: padTop,
      bottom: padBottom,
      left: padLeft,
      right: padRight,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .toBuffer({ resolveWithObject: true });

  // 3) Final resize.
  await sharp(squared.data)
    .resize(256, 256)
    .webp({ quality: 92, alphaQuality: 100, effort: 6 })
    .toFile(outputPath);

  const out = await sharp(outputPath).metadata();
  console.log(
    `bot-icon.png → bot-icon.webp · ${out.width}×${out.height} (trimmed ${trimmed.info.width}×${trimmed.info.height} → square ${side}×${side})`,
  );
}
