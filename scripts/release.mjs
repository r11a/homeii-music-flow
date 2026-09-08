import { createHash } from "node:crypto";
import { copyFile, cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { extractCardVersion } from "../src/core/version-utils.js";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, "..");
const preserveMain = process.argv.includes("--preserve-main");

const srcMainPath = path.join(rootDir, "src", "homeii-music-flow.js");
const distMainPath = path.join(rootDir, "dist", "homeii-music-flow.js");
const srcConfigPath = path.join(rootDir, "src", "config");
const distConfigPath = path.join(rootDir, "dist", "config");
const srcCorePath = path.join(rootDir, "src", "core");
const distCorePath = path.join(rootDir, "dist", "core");
const srcLocalizationPath = path.join(rootDir, "src", "localization");
const distLocalizationPath = path.join(rootDir, "dist", "localization");
const srcSendspinPath = path.join(rootDir, "src", "sendspin-js");
const distSendspinPath = path.join(rootDir, "dist", "sendspin-js");
const vendorEmblaPath = path.join(rootDir, "vendor", "embla-carousel.umd.js");
const distVendorDir = path.join(rootDir, "dist", "vendor");
const brandLogoPath = path.join(rootDir, "docs", "brand", "homeii-flow-logo.svg");
const distLogoPath = path.join(rootDir, "dist", "homeii-flow-logo.svg");
const brandLogoPngPath = path.join(rootDir, "docs", "brand", "homeii-flow-logo.png");
const distLogoPngPath = path.join(rootDir, "dist", "homeii-flow-logo.png");
const brandIconPngPath = path.join(rootDir, "docs", "brand", "homeii-flow-icon.png");
const distIconPngPath = path.join(rootDir, "dist", "homeii-flow-icon.png");

async function collectJavaScriptFiles(dir, prefix = "") {
  const entries = (await readdir(dir, { withFileTypes: true }))
    .sort((a, b) => a.name.localeCompare(b.name));
  const files = [];
  for (const entry of entries) {
    const relativePath = prefix ? path.posix.join(prefix, entry.name) : entry.name;
    const absolutePath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await collectJavaScriptFiles(absolutePath, relativePath));
    } else if (entry.isFile() && entry.name.endsWith(".js")) {
      files.push(relativePath);
    }
  }
  return files;
}

async function buildFileVersionMap(baseDir, files) {
  const fileVersions = new Map();
  for (const file of files) {
    const text = await readFile(path.join(baseDir, ...file.split("/")), "utf8");
    fileVersions.set(file, createHash("sha256").update(text).digest("hex").slice(0, 10));
  }
  return fileVersions;
}

function versionMainImport(text, folder, indexVersion) {
  return text.replace(
    `from "./${folder}/index.js";`,
    `from "./${folder}/index.js?v=${indexVersion}";`,
  );
}

function versionFolderImports(text, folder, version, fileVersions, fallback) {
  const pattern = new RegExp(`from "\\./${folder}/([^"]+\\.js)";`, "g");
  return text.replace(
    pattern,
    (match, file) => `from "./${folder}/${file}?v=${version}-${fileVersions.get(file) || fallback}";`,
  );
}

const sourceText = await readFile(srcMainPath, "utf8");
const version = extractCardVersion(sourceText);
const packageMetadata = JSON.parse(await readFile(path.join(rootDir, "package.json"), "utf8"));
if (packageMetadata.version !== version) throw new Error("Source and package versions must match before release");
if (preserveMain && extractCardVersion(await readFile(distMainPath, "utf8")) !== version) {
  throw new Error("Built bundle version must match the source before release");
}
const localizationFiles = (await readdir(srcLocalizationPath))
  .filter((file) => file.endsWith(".js"))
  .sort();
const localizationFileVersions = new Map();
const localizationHash = createHash("sha256");
for (const file of localizationFiles) {
  const text = await readFile(path.join(srcLocalizationPath, file), "utf8");
  const fileHash = createHash("sha256").update(text).digest("hex").slice(0, 10);
  localizationFileVersions.set(file, fileHash);
  localizationHash.update(file).update("\0").update(text).update("\0");
}
const localizationIndexVersion = `${version}-locales-${localizationHash.digest("hex").slice(0, 10)}`;
const configFiles = await collectJavaScriptFiles(srcConfigPath);
const configFileVersions = await buildFileVersionMap(srcConfigPath, configFiles);
const coreFiles = await collectJavaScriptFiles(srcCorePath);
const coreFileVersions = await buildFileVersionMap(srcCorePath, coreFiles);

await mkdir(path.dirname(distMainPath), { recursive: true });
if (preserveMain) {
  await readFile(distMainPath, "utf8");
} else {
  await copyFile(srcMainPath, distMainPath);
}
await rm(distCorePath, { recursive: true, force: true });
await cp(srcCorePath, distCorePath, { recursive: true });
await rm(distConfigPath, { recursive: true, force: true });
await cp(srcConfigPath, distConfigPath, { recursive: true });
await rm(distLocalizationPath, { recursive: true, force: true });
await cp(srcLocalizationPath, distLocalizationPath, { recursive: true });

const distMainText = await readFile(distMainPath, "utf8");
const versionedDistMainText = versionFolderImports(
  versionFolderImports(
    versionMainImport(distMainText, "localization", localizationIndexVersion),
    "config",
    version,
    configFileVersions,
    "config",
  ),
  "core",
  version,
  coreFileVersions,
  "core",
);
await writeFile(distMainPath, versionedDistMainText);

const distLocalizationIndexPath = path.join(distLocalizationPath, "index.js");
const distLocalizationIndexText = await readFile(distLocalizationIndexPath, "utf8");
const versionedLocalizationIndexText = distLocalizationIndexText.replace(
  /from "\.\/([^"]+\.js)";/g,
  (match, file) => `from "./${file}?v=${version}-${localizationFileVersions.get(file) || "locale"}";`,
);
await writeFile(
  distLocalizationIndexPath,
  versionedLocalizationIndexText,
);

await rm(distSendspinPath, { recursive: true, force: true });
await cp(srcSendspinPath, distSendspinPath, { recursive: true });

await mkdir(distVendorDir, { recursive: true });
await copyFile(vendorEmblaPath, path.join(distVendorDir, "embla-carousel.umd.js"));
await copyFile(brandLogoPath, distLogoPath);
await copyFile(brandLogoPngPath, distLogoPngPath);
await copyFile(brandIconPngPath, distIconPngPath);

console.log(`Synced Homeii release artifacts for ${version}`);
