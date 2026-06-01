import path from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    target: "es2020",
    minify: false,
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
        inlineDynamicImports: false,
        // Emit lazy-loaded locale dictionaries as `localization/<name>.js`
        // so they sit alongside the source layout the release script copies
        // (and the runtime expects when resolving the dynamic import URL).
        entryFileNames: "homeii-music-flow.js",
        chunkFileNames: (chunkInfo) => {
          const id = chunkInfo.facadeModuleId || "";
          const localeMatch = id.match(/\/src\/localization\/([a-z-]+)\.js$/i);
          if (localeMatch) return `localization/${localeMatch[1]}.js`;
          return "chunks/[name]-[hash].js";
        },
      },
    },
  },
});
