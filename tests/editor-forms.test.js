import { describe, expect, it } from "vitest";

import {
  configureHomeiiEditorForms,
  getBaseCardConfigForm,
  getMobileCardConfigForm,
  getMobileEditorTexts,
  getRadioBrowserCountrySelectorOptions,
} from "../src/config/editor-forms.js";
import { radioBrowserCountrySelectorOptions } from "../src/core/radio-browser-countries.js";

function configureTestEditorForms() {
  configureHomeiiEditorForms({
    homeiiEditorI18n: (key, params = {}, fallback = "") => {
      void params;
      return fallback || key;
    },
    homeiiEditorLabelFor: (schema = {}, labels = {}) => labels?.[schema?.name] || schema?.label || schema?.title || schema?.name || "",
    homeiiEditorHelperFor: (schema = {}, helpers = {}) => helpers?.[schema?.name] || schema?.helper || "",
    detectEditorHebrew: () => false,
    visibleLanguageOptions: [
      { value: "en", label: "English" },
      { value: "he", label: "Hebrew" },
    ],
    radioBrowserCountrySelectorOptions,
  });
}

describe("editor forms", () => {
  it("builds the base card form from injected editor dependencies", () => {
    configureTestEditorForms();
    const form = getBaseCardConfigForm();
    const generalGrid = form.schema[0].schema[0];
    const language = generalGrid.schema.find((entry) => entry.name === "language");

    expect(language.selector.select.options).toEqual([
      { value: "en", label: "English" },
      { value: "he", label: "Hebrew" },
    ]);
    const connectionSchema = JSON.stringify(form.schema.find((section) => section.name === "connection_section"));
    expect(connectionSchema).toContain("homeii_engine_mode");
    expect(connectionSchema).not.toContain("ma_url");
    expect(connectionSchema).not.toContain("ma_token");
    expect(connectionSchema).not.toContain("music_assistant_external_url");
    expect(connectionSchema).toContain("lrclib_lyrics_enabled");
    expect(form.computeHelper({ name: "lrclib_lyrics_enabled" })).toContain("https://lrclib.net");
    expect(form.computeLabel({ name: "homeii_engine_mode" })).toBe("HOMEii Flow Engine");
    expect(() => form.assertConfig(null)).toThrow("Card config must be an object");
  });

  it("builds mobile editor text bundles and form schema", () => {
    configureTestEditorForms();
    const texts = getMobileEditorTexts();
    const form = getMobileCardConfigForm();

    expect(texts.options.mobile_quick_action_slots[0]).toEqual({ value: "", label: "ui.none" });
    expect(texts.options.mobile_quick_actions.some((option) => option.value === "voice")).toBe(true);
    expect(texts.options.mobile_quick_actions.some((option) => option.value === "queue_flow")).toBe(true);
    expect(texts.options.homeii_engine_mode.map((option) => option.value)).toEqual(["required"]);
    expect(texts.options.mobile_layout_mode.map((option) => option.value)).toEqual(["auto", "full", "edge_to_edge"]);
    expect(texts.options.mobile_radio_source_mode.map((option) => option.value)).toEqual(["combined", "ma_first", "ma_only", "radiobrowser_only"]);
    expect(texts.options.screensaver_control_buttons.some((option) => option.value === "lyrics")).toBe(true);
    expect(texts.options.screensaver_control_buttons.map((option) => option.value)).toEqual([
      "previous",
      "play_pause",
      "next",
      "mute",
      "power",
      "like",
      "lyrics",
      "lyrics_sync",
      "lyrics_font_minus",
      "lyrics_font_plus",
      "voice",
    ]);
    expect(form.schema.some((section) => section.name === "voice_assistant_section")).toBe(true);
    expect(form.schema.some((section) => section.name === "screensaver_section")).toBe(true);
    expect(JSON.stringify(form.schema.find((section) => section.name === "screensaver_section"))).toContain("screensaver_auto_lyrics_when_playing");
    expect(JSON.stringify(form.schema)).toContain("lrclib_lyrics_enabled");
    expect(JSON.stringify(form.schema.find((section) => section.name === "smart_home_section"))).not.toContain("screensaver_enabled");
    expect(JSON.stringify(form.schema)).toContain("mobile_layout_mode");
    expect(JSON.stringify(form.schema)).toContain("homeii_engine_mode");
    expect(JSON.stringify(form.schema)).not.toContain("ma_url");
    expect(JSON.stringify(form.schema)).not.toContain("ma_token");
    expect(JSON.stringify(form.schema)).toContain("mobile_cover_flow");
    expect(JSON.stringify(form.schema)).toContain("mobile_radio_source_mode");
    expect(JSON.stringify(form.schema)).not.toContain('"mobile_queue_flow"');
    expect(form.computeHelper({ name: "voice_assistant_enabled" })).toBe("ui.show_a_push_to_talk_button_for_music_and_assist_commands");
    expect(form.computeHelper({ name: "mobile_layout_mode" })).toContain("Edge to edge opens");
    expect(form.computeHelper({ name: "mobile_cover_flow" })).toContain("main artwork area");
    expect(form.computeHelper({ name: "homeii_engine_mode" })).toContain("HOMEii Flow Engine");
    expect(form.computeHelper({ name: "lrclib_lyrics_enabled" })).toContain("Disabled by default");
  });

  it("builds radio browser country selector options through the shared country module", () => {
    configureTestEditorForms();
    const options = getRadioBrowserCountrySelectorOptions((key) => (key === "ui.all_countries" ? "All" : key), "en");

    expect(options[0]).toEqual({ value: "all", label: "All" });
    expect(options.some((option) => option.value === "IL")).toBe(true);
  });
});
