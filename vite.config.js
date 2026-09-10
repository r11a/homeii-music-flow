import path from "node:path";
import { readFileSync } from "node:fs";
import { defineConfig } from "vite";

const packageVersion = JSON.parse(
  readFileSync(new URL("./package.json", import.meta.url), "utf8"),
).version;

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
        banner: `/*! HOMEII_CARD_VERSION = "${packageVersion}"; */`,
      },
    },
  },
});
