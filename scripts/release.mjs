import { copyFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  extractCardVersion,
  formatVersionedBuildFilename,
} from "../src/core/version-utils.js";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, "..");

const srcMainPath = path.join(rootDir, "src", "homeii-music-flow.js");
const distMainPath = path.join(rootDir, "dist", "homeii-music-flow.js");
const rootRuntimePath = path.join(rootDir, "homeii-music-flow.js");

const sourceText = await readFile(srcMainPath, "utf8");
const version = extractCardVersion(sourceText);
const versionedFile = formatVersionedBuildFilename(version);

const versionedSrcPath = path.join(rootDir, "src", versionedFile);
const versionedDistPath = path.join(rootDir, "dist", versionedFile);

await mkdir(path.dirname(versionedSrcPath), { recursive: true });
await mkdir(path.dirname(versionedDistPath), { recursive: true });

await copyFile(srcMainPath, versionedSrcPath);
await copyFile(distMainPath, versionedDistPath);
await copyFile(distMainPath, rootRuntimePath);

console.log(`Synced Homeii release artifacts for ${version}`);
