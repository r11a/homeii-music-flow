import { copyFile, cp, mkdir, readFile, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { extractCardVersion } from "../src/core/version-utils.js";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, "..");

const srcMainPath = path.join(rootDir, "src", "homeii-music-flow.js");
const distMainPath = path.join(rootDir, "dist", "homeii-music-flow.js");
const srcSendspinPath = path.join(rootDir, "src", "sendspin-js");
const distSendspinPath = path.join(rootDir, "dist", "sendspin-js");
const vendorEmblaPath = path.join(rootDir, "vendor", "embla-carousel.umd.js");
const distVendorDir = path.join(rootDir, "dist", "vendor");
const brandLogoPath = path.join(rootDir, "docs", "brand", "homeii-flow-logo.svg");
const distLogoPath = path.join(rootDir, "dist", "homeii-flow-logo.svg");

const sourceText = await readFile(srcMainPath, "utf8");
const version = extractCardVersion(sourceText);

await mkdir(path.dirname(distMainPath), { recursive: true });
await rm(distSendspinPath, { recursive: true, force: true });
await cp(srcSendspinPath, distSendspinPath, { recursive: true });

await mkdir(distVendorDir, { recursive: true });
await copyFile(vendorEmblaPath, path.join(distVendorDir, "embla-carousel.umd.js"));
await copyFile(brandLogoPath, distLogoPath);

console.log(`Synced Homeii release artifacts for ${version}`);
