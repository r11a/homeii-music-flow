export function isHebrewLanguageTag(value) {
  return String(value || "").trim().toLowerCase().startsWith("he");
}

export function pickEditorLanguageCandidate({
  hassLocaleLanguage,
  hassLanguage,
  documentLanguage,
} = {}) {
  return hassLocaleLanguage || hassLanguage || documentLanguage || "";
}

export function detectEditorHebrew(doc = globalThis.document) {
  try {
    const homeAssistant = doc?.querySelector?.("home-assistant");
    const lang = pickEditorLanguageCandidate({
      hassLocaleLanguage: homeAssistant?.hass?.locale?.language,
      hassLanguage: homeAssistant?.hass?.language,
      documentLanguage: doc?.documentElement?.lang,
    });
    return isHebrewLanguageTag(lang);
  } catch (_) {
    return false;
  }
}
