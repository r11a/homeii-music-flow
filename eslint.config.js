import js from "@eslint/js";
import globals from "globals";

const browserGlobals = {
  ...globals.browser,
  ...globals.es2021,
  ResizeObserver: "readonly",
  SpeechRecognition: "readonly",
  webkitSpeechRecognition: "readonly",
  EmblaCarousel: "readonly",
};

export default [
  {
    ignores: [
      "BACKUP/**",
      "backups/**",
      "mobile/**",
      "vendor/**",
      "_editor_research/**",
      "dist/**",
      "src/ma-browser-card-mobile-v*.js",
      "homeii-browser-card*.js",
      "homeii-music-mobile*.js",
      "homeii-music-flow-full-v*.js",
      "homeii-music-flow-v*.js",
      "homeii-music-flow-clean.js",
      "homeii-music-flow.js",
      "ma-browser-card-mobile.js",
    ],
  },
  js.configs.recommended,
  {
    files: ["src/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: browserGlobals,
    },
    rules: {
      "no-unused-vars": ["warn", { args: "none", ignoreRestSiblings: true }],
    },
  },
  {
    files: ["scripts/**/*.mjs", "*.config.js", "tests/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
      },
    },
    rules: {
      "no-console": "off",
    },
  },
];
