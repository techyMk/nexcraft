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

// Bot icon: trim → drop reflection → pad to square → resize. This way the
// bot's actual visible mass ends up dead-centre in a 256² canvas, even
// though the source has a slight head tilt + uneven shoulder/reflection
// that throws off a fixed-coordinate crop.
{
  const inputPath = path.join(srcDir, "bot-icon.png");
  const outputPath = path.join(outDir, "bot-icon.webp");

  // 1) Trim transparent borders so we know the bot's true bounding box.
  const trimmed = await sharp(inputPath)
    .trim()
    .toBuffer({ resolveWithObject: true });

  // 2) Drop the bottom ~30% (soft reflection shadow under the bot).
  const cropH = Math.round(trimmed.info.height * 0.7);
  const botOnly = await sharp(trimmed.data)
    .extract({
      left: 0,
      top: 0,
      width: trimmed.info.width,
      height: cropH,
    })
    .toBuffer({ resolveWithObject: true });

  // 3) Pad to a perfect square, content centred.
  const side = Math.max(botOnly.info.width, botOnly.info.height);
  const padTop = Math.floor((side - botOnly.info.height) / 2);
  const padBottom = side - botOnly.info.height - padTop;
  const padLeft = Math.floor((side - botOnly.info.width) / 2);
  const padRight = side - botOnly.info.width - padLeft;
  const squared = await sharp(botOnly.data)
    .extend({
      top: padTop,
      bottom: padBottom,
      left: padLeft,
      right: padRight,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .toBuffer({ resolveWithObject: true });

  // 4) Final resize.
  await sharp(squared.data)
    .resize(256, 256)
    .webp({ quality: 92, alphaQuality: 100, effort: 6 })
    .toFile(outputPath);

  const out = await sharp(outputPath).metadata();
  console.log(
    `bot-icon.png → bot-icon.webp · ${out.width}×${out.height} (trimmed ${trimmed.info.width}×${trimmed.info.height} → bot ${botOnly.info.width}×${botOnly.info.height} → square ${side}×${side})`,
  );
}
