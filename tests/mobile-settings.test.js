import { describe, expect, it } from "vitest";

import {
  clampMobileFontScale,
  normalizeHomeShortcutPath,
  normalizeMobileFooterMode,
  normalizeMobileLibraryTabs,
  normalizeMobileMainBarItems,
  normalizeMobileMicMode,
  normalizeMobileVolumeMode,
  normalizePinnedPlayerEntities,
  normalizeVisualMobileState,
} from "../src/core/state/mobile-settings.js";

describe("mobile settings foundation", () => {
  it("normalizes the visual mobile state payload", () => {
    const state = normalizeVisualMobileState({
      language: "he",
      theme_mode: "light",
      mobile_dynamic_theme_mode: "STRONG",
      mobile_background_motion_mode: "wild",
      mobile_custom_text_tone: "dark",
      mobile_font_scale: 8,
      night_mode: "ON",
      night_mode_auto_start: "23:15",
      night_mode_auto_end: "05:45",
      night_mode_days: [1, 3, 5],
      mobile_compact_mode: true,
      mobile_show_up_next: false,
      mobile_footer_search_enabled: true,
      mobile_studio_shortcut: false,
      mobile_footer_mode: "text",
      mobile_home_shortcut: true,
      mobile_home_shortcut_path: "lovelace/media",
      mobile_volume_mode: "always",
      mobile_mic_mode: "SMART",
      mobile_liked_mode: "local",
      mobile_swipe_mode: "browse",
      mobile_radio_browser_country: "il",
      mobile_library_tabs: ["library_albums"],
      mobile_main_bar_items: ["theme", "settings"],
      mobile_announcement_presets: ["One", "Two", "Three", "Four"],
      announcement_tts_entity: "tts.living_room",
      pinned_player_entities: ["media_player.kitchen", " media_player.kitchen ", "media_player.office"],
    }, {
      normalizeClockTime: (value, fallback) => String(value || fallback),
      normalizeNightModeDays: (value) => Array.isArray(value) ? value : [],
      defaultLibraryTabs: ["library_search", "library_playlists"],
      defaultMainBarItems: ["actions", "players", "library", "settings"],
      defaultAnnouncementPresets: ["Default A", "Default B", "Default C"],
    });

    expect(state.lang).toBe("he");
    expect(state.cardTheme).toBe("light");
    expect(state.mobileDynamicThemeMode).toBe("strong");
    expect(state.mobileBackgroundMotionMode).toBe("subtle");
    expect(state.mobileCustomTextTone).toBe("dark");
    expect(state.mobileFontScale).toBe(1.5);
    expect(state.mobileNightMode).toBe("on");
    expect(state.mobileNightModeStart).toBe("23:15");
    expect(state.mobileNightModeEnd).toBe("05:45");
    expect(state.mobileNightModeDays).toEqual([1, 3, 5]);
    expect(state.mobileCompactMode).toBe(true);
    expect(state.mobileShowUpNext).toBe(false);
    expect(state.mobileFooterSearchEnabled).toBe(true);
    expect(state.mobileStudioShortcutEnabled).toBe(false);
    expect(state.mobileFooterMode).toBe("text");
    expect(state.mobileHomeShortcutEnabled).toBe(true);
    expect(state.mobileHomeShortcutPath).toBe("lovelace/media");
    expect(state.mobileVolumeMode).toBe("always");
    expect(state.mobileMicMode).toBe("smart");
    expect(state.mobileLikedMode).toBe("local");
    expect(state.mobileSwipeMode).toBe("browse");
    expect(state.mobileRadioBrowserCountry).toBe("il");
    expect(state.mobileLibraryTabs).toEqual(["library_albums"]);
    expect(state.mobileMainBarItems).toEqual(["theme", "settings"]);
    expect(state.mobileAnnouncementPresets).toEqual(["One", "Two", "Three"]);
    expect(state.mobileAnnouncementTtsEntity).toBe("tts.living_room");
    expect(state.pinnedPlayerEntities).toEqual(["media_player.kitchen", "media_player.office"]);
  });

  it("normalizes main bar and library tab selections", () => {
    expect(normalizeMobileMainBarItems(["settings", "players", "theme"], {
      usesVisualSettings: true,
      hidePlayers: true,
      fallbackItems: ["actions", "players", "library", "settings"],
    })).toEqual(["theme"]);

    expect(normalizeMobileMainBarItems(["actions"], {
      usesVisualSettings: false,
      hidePlayers: false,
      fallbackItems: ["actions"],
    })).toEqual(["actions", "settings"]);

    expect(normalizeMobileMainBarItems([], {
      usesVisualSettings: false,
      hidePlayers: true,
      fallbackItems: ["actions", "players", "library", "settings"],
    })).toEqual(["actions", "library", "settings"]);

    expect(normalizeMobileLibraryTabs(["library_albums", "library_search", "invalid"], [
      "library_search",
      "library_playlists",
    ])).toEqual(["library_search", "library_albums"]);
  });

  it("stabilizes home shortcut, footer, mic, and volume modes", () => {
    expect(normalizeHomeShortcutPath("lovelace/media", { leadingSlash: true })).toBe("/lovelace/media");
    expect(normalizeHomeShortcutPath(" /dashboard ", { leadingSlash: true })).toBe("/dashboard");
    expect(normalizeMobileFooterMode("invalid")).toBe("both");
    expect(normalizeMobileMicMode("OFF")).toBe("off");
    expect(normalizeMobileVolumeMode("invalid")).toBe("button");
    expect(clampMobileFontScale(0.2)).toBe(0.5);
  });

  it("normalizes pinned player inputs from single and multi-entity config", () => {
    expect(normalizePinnedPlayerEntities({
      pinned_player_entity: " media_player.office ",
    })).toEqual(["media_player.office"]);

    expect(normalizePinnedPlayerEntities({
      pinned_player_entities: ["media_player.office", "", "media_player.office", "media_player.kitchen"],
    })).toEqual(["media_player.office", "media_player.kitchen"]);
  });
});
