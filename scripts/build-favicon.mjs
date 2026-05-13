import sharp from "sharp";
import { rm } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const src = path.join(root, "assets", "icon.webp");
const appDir = path.join(root, "src", "app");

// Next.js App Router auto-detects icon.{ico,jpg,jpeg,png,svg,gif} — not .webp.
// Emit icon.png + apple-icon.png so every browser resolves the favicon.
await sharp(src).resize(512, 512, { fit: "cover" }).png({ quality: 95 }).toFile(path.join(appDir, "icon.png"));
await sharp(src).resize(180, 180, { fit: "cover" }).png({ quality: 95 }).toFile(path.join(appDir, "apple-icon.png"));

// Drop the unused webp variant so Next doesn't bundle two competing icons.
await rm(path.join(appDir, "icon.webp"), { force: true });

console.log("Favicon built: icon.png (512), apple-icon.png (180)");
