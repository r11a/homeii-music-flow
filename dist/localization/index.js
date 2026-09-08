import en from "./en.js?v=6.0.0-beta.1-596b7c35e5";
import da from "./da.js?v=6.0.0-beta.1-0fc47a3f33";
import de from "./de.js?v=6.0.0-beta.1-6f94c5734a";
import es from "./es.js?v=6.0.0-beta.1-57e2c6d6d4";
import fr from "./fr.js?v=6.0.0-beta.1-9e488ee7e3";
import he from "./he.js?v=6.0.0-beta.1-dac8635a55";
import it from "./it.js?v=6.0.0-beta.1-4c9ca67315";
import lt from "./lt.js?v=6.0.0-beta.1-f155c21923";
import zh from "./zh.js?v=6.0.0-beta.1-3cad56e9e5";

export const DEFAULT_LANGUAGE = "en";

export const DICTIONARIES = Object.freeze({
  en,
  da,
  de,
  es,
  fr,
  he,
  it,
  lt,
  zh,
});

export const RTL_LANGUAGE_CODES = Object.freeze(["he"]);

export const LANGUAGE_OPTIONS = Object.freeze([
  { value: "auto", label: "Auto" },
  { value: "en", label: "English" },
  { value: "da", label: "Dansk" },
  { value: "de", label: "Deutsch" },
  { value: "es", label: "Espa\u00f1ol" },
  { value: "fr", label: "Fran\u00e7ais" },
  { value: "he", label: "\u05e2\u05d1\u05e8\u05d9\u05ea / Hebrew" },
  { value: "it-IT", label: "Italiano" },
  { value: "lt", label: "Lithuanian / Lietuvi\u0173" },
  { value: "zh-CN", label: "\u7b80\u4f53\u4e2d\u6587 / Simplified Chinese" },
]);

export const SUPPORTED_LANGUAGE_CODES = Object.freeze(Object.keys(DICTIONARIES));

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
  return DICTIONARIES[candidate] ? candidate : fallback;
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
