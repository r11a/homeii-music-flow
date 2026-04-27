import { describe, expect, it } from "vitest";

import {
  detectEditorHebrew,
  isHebrewLanguageTag,
  pickEditorLanguageCandidate,
} from "../src/core/editor-locale.js";

describe("editor locale helpers", () => {
  it("detects Hebrew language tags", () => {
    expect(isHebrewLanguageTag("he")).toBe(true);
    expect(isHebrewLanguageTag("he-IL")).toBe(true);
    expect(isHebrewLanguageTag("en-US")).toBe(false);
  });

  it("prefers hass locale over fallback candidates", () => {
    const lang = pickEditorLanguageCandidate({
      hassLocaleLanguage: "he-IL",
      hassLanguage: "en",
      documentLanguage: "fr",
    });
    expect(lang).toBe("he-IL");
  });

  it("detects Hebrew through a document-like object", () => {
    const doc = {
      querySelector: () => ({
        hass: {
          locale: { language: "he-IL" },
          language: "en",
        },
      }),
      documentElement: { lang: "en" },
    };
    expect(detectEditorHebrew(doc)).toBe(true);
  });
});
