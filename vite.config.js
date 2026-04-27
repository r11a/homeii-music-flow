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
        inlineDynamicImports: true,
      },
    },
  },
});
