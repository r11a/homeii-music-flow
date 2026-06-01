import en from "./en.js";

// Eagerly loaded so synchronous `translate()` always has a fallback.
const eagerLocales = { en };

// Other locales are loaded on demand via these dynamic-import loaders.
// Adding a new locale: drop the file in this directory and register it
// here and in LANGUAGE_OPTIONS below. Nothing else needs to change.
const LOADERS = Object.freeze({
  da: () => import("./da.js"),
  es: () => import("./es.js"),
  fr: () => import("./fr.js"),
  he: () => import("./he.js"),
  it: () => import("./it.js"),
  lt: () => import("./lt.js"),
  zh: () => import("./zh.js"),
});

// Mutable cache. Other locale entries are added by ensureLanguageLoaded().
// Treat as read-only outside this module.
export const DICTIONARIES = eagerLocales;

const PENDING_LOAD = new Map();

export const DEFAULT_LANGUAGE = "en";

export const RTL_LANGUAGE_CODES = Object.freeze(["he"]);

export const LANGUAGE_OPTIONS = Object.freeze([
  { value: "auto", label: "Auto" },
  { value: "en", label: "English" },
  { value: "da", label: "Dansk" },
  { value: "es", label: "Espa\u00f1ol" },
  { value: "fr", label: "Fran\u00e7ais" },
  { value: "he", label: "\u05e2\u05d1\u05e8\u05d9\u05ea / Hebrew" },
  { value: "it-IT", label: "Italiano" },
  { value: "lt", label: "Lithuanian / Lietuvi\u0173" },
  { value: "zh-CN", label: "\u7b80\u4f53\u4e2d\u6587 / Simplified Chinese" },
]);

export const SUPPORTED_LANGUAGE_CODES = Object.freeze([
  ...Object.keys(eagerLocales),
  ...Object.keys(LOADERS),
]);

const ENGLISH_TEXT_TO_KEY = Object.freeze(
  Object.entries(en).reduce((acc, [key, value]) => {
    if (typeof value === "string" && acc[value] == null) acc[value] = key;
    return acc;
  }, {}),
);

function baseLanguageCode(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace("_", "-")
    .split("-")[0];
}

export function normalizeLanguageCode(value, fallback = DEFAULT_LANGUAGE) {
  const candidate = baseLanguageCode(value);
  if (!candidate || candidate === "auto") return fallback;
  return SUPPORTED_LANGUAGE_CODES.includes(candidate) ? candidate : fallback;
}

export function detectLanguage({
  configLanguage,
  hass,
  doc = globalThis.document,
  nav = globalThis.navigator,
} = {}) {
  const configured = String(configLanguage || "").trim().toLowerCase();
  if (configured && configured !== "auto") {
    return normalizeLanguageCode(configured, DEFAULT_LANGUAGE);
  }

  const candidates = [
    hass?.locale?.language,
    hass?.language,
    doc?.documentElement?.lang,
    nav?.language,
    ...(Array.isArray(nav?.languages) ? nav.languages : []),
  ];
  for (const candidate of candidates) {
    const normalized = normalizeLanguageCode(candidate, "");
    if (normalized) return normalized;
  }
  return DEFAULT_LANGUAGE;
}

export function isRtlLanguage(value) {
  return RTL_LANGUAGE_CODES.includes(baseLanguageCode(value));
}

export function keyForEnglishText(text) {
  return ENGLISH_TEXT_TO_KEY[String(text || "")] || "";
}

function interpolate(template, params = {}) {
  return String(template).replace(/\{([a-zA-Z0-9_]+)\}/g, (match, key) => (
    params[key] == null ? match : String(params[key])
  ));
}

export function translate(language, key, params = {}, fallback = "") {
  const normalized = normalizeLanguageCode(language, DEFAULT_LANGUAGE);
  const dictionary = DICTIONARIES[normalized] || en;
  const template = dictionary[key] ?? en[key] ?? fallback ?? key;
  return interpolate(template, params);
}

export function translateText(language, englishText, params = {}, fallback = englishText) {
  const key = keyForEnglishText(englishText);
  if (!key) return interpolate(fallback ?? englishText, params);
  return translate(language, key, params, fallback ?? englishText);
}

export function createTranslator(language) {
  return (key, params = {}, fallback = "") => translate(language, key, params, fallback);
}

/**
 * Ensures the dictionary for `code` is loaded into DICTIONARIES.
 * Returns a Promise that resolves to the dictionary (or English on failure).
 *
 * - Idempotent: repeated calls return the same resolved dictionary.
 * - De-duped: concurrent calls share a single in-flight Promise.
 * - Fail-safe: dynamic-import failures fall back to English and log a warning.
 */
export function ensureLanguageLoaded(code) {
  const normalized = baseLanguageCode(code);
  if (!normalized || normalized === "auto") return Promise.resolve(DICTIONARIES.en);
  if (DICTIONARIES[normalized]) return Promise.resolve(DICTIONARIES[normalized]);
  if (PENDING_LOAD.has(normalized)) return PENDING_LOAD.get(normalized);
  const loader = LOADERS[normalized];
  if (!loader) return Promise.resolve(DICTIONARIES.en);
  const promise = loader()
    .then((mod) => {
      DICTIONARIES[normalized] = mod && mod.default ? mod.default : mod;
      PENDING_LOAD.delete(normalized);
      return DICTIONARIES[normalized];
    })
    .catch((err) => {
      PENDING_LOAD.delete(normalized);
      console.warn(`[HOMEii Flow] Failed to load locale "${normalized}", falling back to English.`, err);
      return DICTIONARIES.en;
    });
  PENDING_LOAD.set(normalized, promise);
  return promise;
}
