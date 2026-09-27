import path from "node:path";
import { readFileSync } from "node:fs";
import { defineConfig } from "vite";

const packageVersion = JSON.parse(
  readFileSync(new URL("./package.json", import.meta.url), "utf8"),
).version;

const lucideLicense = readFileSync(new URL("./src/core/Lucide-LICENSE.txt", import.meta.url), "utf8").replace(/\r\n?/g, "\n").replace(/[ \t]+$/gm, "");

const heeboLicense = readFileSync(new URL("./src/core/theme/Heebo-OFL.txt", import.meta.url), "utf8").replace(/\r\n?/g, "\n").replace(/[ \t]+$/gm, "");

export default defineConfig({
  build: {
    target: "es2020",
    minify: "esbuild",
    sourcemap: false,
    emptyOutDir: false,
    outDir: "dist",
    lib: {
      entry: path.resolve("src/index.js"),
      formats: ["es"],
      fileName: () => "homeii-music-flow.js",
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
        banner: `/*! HOMEII_CARD_VERSION = "${packageVersion}"; */\n/*! Lucide / Feather icon license\n${lucideLicense}\n*/\n/*! Heebo font license\n${heeboLicense}\n*/`,
      },
    },
  },
});
