import { beforeAll, describe, expect, it } from "vitest";

import {
  DICTIONARIES,
  LANGUAGE_OPTIONS,
  detectLanguage,
  ensureLanguageLoaded,
  isRtlLanguage,
  translate,
  translateText,
} from "../src/localization/index.js";
import enDict from "../src/localization/en.js";
import daDict from "../src/localization/da.js";
import esDict from "../src/localization/es.js";
import frDict from "../src/localization/fr.js";
import heDict from "../src/localization/he.js";
import itDict from "../src/localization/it.js";
import ltDict from "../src/localization/lt.js";
import zhDict from "../src/localization/zh.js";

const SOURCE_DICTS = {
  en: enDict,
  da: daDict,
  es: esDict,
  fr: frDict,
  he: heDict,
  it: itDict,
  lt: ltDict,
  zh: zhDict,
};

describe("localization", () => {
  beforeAll(async () => {
    // Synchronous translate() requires dictionaries to be loaded first. In
    // production the card awaits ensureLanguageLoaded() at the relevant seams;
    // in tests we preload every locale once so the translate-by-key assertions
    // below see real translations instead of the English fallback.
    await Promise.all(
      Object.keys(SOURCE_DICTS)
        .filter((code) => code !== "en")
        .map((code) => ensureLanguageLoaded(code)),
    );
  });

  it("translates by key with English fallback", () => {
    expect(translate("he", "ui.home")).toBe("בית");
    expect(translate("fr", "ui.home")).toBe("Accueil");
    expect(translate("it", "ui.now_playing")).toBe("In riproduzione");
    expect(translate("zh-CN", "ui.home")).toBe("首页");
    expect(translate("de", "ui.home")).toBe("Home");
    expect(translate("he", "missing.key", {}, "Fallback")).toBe("Fallback");
  });

  it("translates legacy English text through the catalog", () => {
    expect(translateText("he", "Now Playing")).toBe("מתנגן עכשיו");
    expect(translateText("zh-CN", "Now Playing")).toBe("正在播放");
    expect(translateText("en", "Now Playing")).toBe("Now Playing");
    expect(translateText("he", "Not in catalog", {}, "Not in catalog")).toBe("Not in catalog");
  });

  it("detects configured languages and falls back to English", () => {
    expect(detectLanguage({ configLanguage: "es" })).toBe("es");
    expect(detectLanguage({ configLanguage: "fr" })).toBe("fr");
    expect(detectLanguage({ configLanguage: "he" })).toBe("he");
    expect(detectLanguage({ configLanguage: "it-IT" })).toBe("it");
    expect(detectLanguage({ configLanguage: "lt" })).toBe("lt");
    expect(detectLanguage({ configLanguage: "zh-CN" })).toBe("zh");
    expect(detectLanguage({ configLanguage: "de" })).toBe("en");
    expect(detectLanguage({ configLanguage: "auto", hass: { locale: { language: "he-IL" } } })).toBe("he");
  });

  it("offers community languages in the language picker options", () => {
    expect(LANGUAGE_OPTIONS).toContainEqual({
      value: "es",
      label: "Español",
    });
    expect(LANGUAGE_OPTIONS).toContainEqual({
      value: "fr",
      label: "Français",
    });
    expect(LANGUAGE_OPTIONS).toContainEqual({
      value: "it-IT",
      label: "Italiano",
    });
    expect(LANGUAGE_OPTIONS).toContainEqual({
      value: "lt",
      label: "Lithuanian / Lietuvių",
    });
    expect(LANGUAGE_OPTIONS).toContainEqual({
      value: "zh-CN",
      label: "简体中文 / Simplified Chinese",
    });
  });

  it("marks Hebrew as RTL", () => {
    expect(isRtlLanguage("he")).toBe(true);
    expect(isRtlLanguage("en")).toBe(false);
    expect(isRtlLanguage("fr")).toBe(false);
    expect(isRtlLanguage("it")).toBe(false);
  });

  it("keeps localized dictionaries aligned with English keys", () => {
    const englishKeys = Object.keys(SOURCE_DICTS.en).sort();
    for (const [language, dictionary] of Object.entries(SOURCE_DICTS)) {
      expect(Object.keys(dictionary).sort(), language).toEqual(englishKeys);
    }
  });
});

describe("ensureLanguageLoaded", () => {
  it("resolves immediately for English (eager)", async () => {
    const dict = await ensureLanguageLoaded("en");
    expect(dict).toBe(DICTIONARIES.en);
  });

  it("loads non-English dictionaries on demand", async () => {
    const dict = await ensureLanguageLoaded("da");
    expect(dict).toBeTruthy();
    expect(DICTIONARIES.da).toBe(dict);
  });

  it("falls back to English for unknown codes without throwing", async () => {
    const dict = await ensureLanguageLoaded("xx-not-a-locale");
    expect(dict).toBe(DICTIONARIES.en);
  });
});
