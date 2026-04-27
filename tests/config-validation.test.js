import { describe, expect, it } from "vitest";

import {
  assertStringArrayIfDefined,
  validateBaseCardEditorConfig,
  validateMobileCardEditorConfig,
} from "../src/config/validators.js";

describe("config validators", () => {
  it("accepts a valid base editor config", () => {
    expect(() =>
      validateBaseCardEditorConfig({
        config_entry_id: "abc",
        ma_interface_target: "_self",
        height: 800,
        main_opacity: 0.9,
        popup_opacity: 0.75,
        cache_ttl: 1000,
        language: "he",
        theme_mode: "dark",
        rtl: true,
        show_ma_button: false,
        show_theme_toggle: true,
      })
    ).not.toThrow();
  });

  it("rejects invalid base config values", () => {
    expect(() =>
      validateBaseCardEditorConfig({
        language: "de",
      })
    ).toThrow("language must be one of: auto, he, en");
  });

  it("accepts a valid mobile-only config", () => {
    expect(() =>
      validateMobileCardEditorConfig({
        language: "auto",
        theme_mode: "light",
        layout_mode: "tablet",
        settings_source: "card",
        night_mode: "auto",
        mobile_dynamic_theme_mode: "strong",
        mobile_background_motion_mode: "subtle",
        mobile_custom_text_tone: "dark",
        mobile_volume_mode: "always",
        mobile_mic_mode: "smart",
        mobile_liked_mode: "local",
        mobile_swipe_mode: "browse",
        mobile_library_tabs: ["library", "queue"],
        mobile_main_bar_items: ["actions", "settings"],
        mobile_announcement_presets: ["hello"],
        mobile_compact_mode: true,
        mobile_show_up_next: false,
      })
    ).not.toThrow();
  });

  it("rejects invalid mobile control modes", () => {
    expect(() =>
      validateMobileCardEditorConfig({
        mobile_volume_mode: "slider-only",
      })
    ).toThrow("mobile_volume_mode must be one of: always, button");
  });

  it("rejects non-string array members", () => {
    expect(() => assertStringArrayIfDefined(["ok", 7], "mobile_library_tabs")).toThrow(
      "mobile_library_tabs must be an array of strings"
    );
  });
});
