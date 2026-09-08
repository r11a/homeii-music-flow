import { describe, expect, it } from "vitest";

import {
  DICTIONARIES,
  LANGUAGE_OPTIONS,
  detectLanguage,
  isRtlLanguage,
  translate,
  translateText,
} from "../src/localization/index.js";

describe("localization", () => {
  it("translates by key with English fallback", () => {
    expect(translate("he", "ui.home")).toBe("בית");
    expect(translate("da", "ui.home")).toBe("Hjem");
    expect(translate("fr", "ui.home")).toBe("Accueil");
    expect(translate("it", "ui.now_playing")).toBe("In riproduzione");
    expect(translate("zh-CN", "ui.home")).toBe("首页");
    expect(translate("de", "ui.home")).toBe("Startseite");
    expect(translate("nl", "ui.home")).toBe("Home");
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
    expect(detectLanguage({ configLanguage: "de" })).toBe("de");
    expect(detectLanguage({ configLanguage: "nl" })).toBe("en");
    expect(detectLanguage({ configLanguage: "auto", hass: { locale: { language: "de-DE" } } })).toBe("de");
    expect(detectLanguage({ configLanguage: "auto", hass: { locale: { language: "he-IL" } } })).toBe("he");
  });

  it("offers community languages in the language picker options", () => {
    expect(LANGUAGE_OPTIONS).toContainEqual({
      value: "da",
      label: "Dansk",
    });
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
    const englishKeys = Object.keys(DICTIONARIES.en).sort();
    for (const [language, dictionary] of Object.entries(DICTIONARIES)) {
      expect(Object.keys(dictionary).sort(), language).toEqual(englishKeys);
    }
  });
});
