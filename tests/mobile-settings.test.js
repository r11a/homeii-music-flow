import { describe, expect, it } from "vitest";

import {
  clampPercent,
  clampMobileIconScale,
  clampMobileFontScale,
  clampMobileVolumeStepPercent,
  clampSeconds,
  formatAmbientLightPlayerMapEntry,
  isColorCapableLightEntity,
  normalizeAuxiliaryButtonIcon,
  normalizeExcludedPlayerEntities,
  normalizeEntityList,
  normalizeHomeShortcutPath,
  normalizeMobileFooterMode,
  normalizeMobileCompactWidgetMode,
  normalizeMobileLayoutMode,
  normalizeMobileLibraryDefaultLayout,
  normalizeMobileLibraryTabs,
  normalizeMobileMainBarItems,
  normalizeMobileMicMode,
  normalizeMobileQuickActions,
  normalizeMobileQuickActionSlots,
  normalizeMobileRadioSourceMode,
  normalizeMobileVolumeMode,
  normalizePinnedPlayerEntities,
  normalizePlayerOrderEntities,
  normalizePlayerSortMode,
  normalizePowerButtonAction,
  normalizeScreensaverClockMode,
  normalizeVoiceAssistantMode,
  normalizeVisualMobileState,
  parseAmbientLightPlayerMap,
} from "../src/core/state/mobile-settings.js";

describe("mobile settings foundation", () => {
  it("normalizes the visual mobile state payload", () => {
    const state = normalizeVisualMobileState({
      language: "he",
      theme_mode: "light",
      performance_mode: true,
      mobile_dynamic_theme_mode: "STRONG",
      mobile_background_motion_mode: "wild",
      mobile_custom_text_tone: "dark",
      hotel_mode: true,
      mobile_font_scale: 8,
      mobile_icon_scale: 2,
      night_mode: "ON",
      night_mode_auto_start: "23:15",
      night_mode_auto_end: "05:45",
      night_mode_days: [1, 3, 5],
      mobile_compact_mode: true,
      mobile_compact_widget_mode: "MINI",
      mobile_compact_edge_to_edge: false,
      mobile_layout_mode: "FULL",
      mobile_cover_flow: true,
      mobile_queue_flow: true,
      mobile_library_default_layout: "GRID",
      mobile_show_up_next: false,
      mobile_footer_search_enabled: true,
      mobile_studio_shortcut: false,
      mobile_footer_mode: "text",
      mobile_home_shortcut: true,
      mobile_home_shortcut_path: "lovelace/media",
      mobile_volume_mode: "always",
      mobile_volume_step_buttons: true,
      mobile_volume_step_percent: 7,
      mobile_mic_mode: "SMART",
      voice_assistant_enabled: true,
      voice_assistant_mode: "ASSIST",
      voice_assistant_agent_id: " conversation.home_assistant ",
      voice_assistant_speak_feedback: true,
      mobile_liked_mode: "local",
      mobile_swipe_mode: "browse",
      mobile_radio_source_mode: "MA_FIRST",
      mobile_radio_browser_country: "il",
      mobile_library_tabs: ["library_albums"],
      mobile_main_bar_items: ["theme", "settings"],
      mobile_quick_actions: ["voice", "timer", "queue_flow", "disconnect_all", "voice"],
      mobile_quick_action_1: "timer",
      mobile_quick_action_2: "queue_flow",
      mobile_quick_action_3: "voice",
      mobile_quick_action_4: "disconnect_all",
      mobile_announcement_presets: ["One", "Two", "Three", "Four"],
      announcement_tts_entity: "tts.living_room",
      announcement_tts_language: "en-GB",
      pinned_player_entities: ["media_player.kitchen", " media_player.kitchen ", "media_player.office"],
      excluded_player_entities: ["media_player.bedroom", " media_player.bedroom ", "media_player.garden"],
      player_sort_mode: "CUSTOM",
      player_order_entity_1: "media_player.office",
      player_order_entity_2: "media_player.kitchen",
      player_order_entities: ["media_player.office", "media_player.garden"],
      ambient_light_enabled: true,
      ambient_light_entities: ["light.living_room", " light.living_room ", "light.tv"],
      ambient_light_player_map: ["media_player.kitchen = light.kitchen", " media_player.office: light.office "],
      ambient_light_brightness: 150,
      ambient_light_transition: -4,
      ambient_light_cooldown: "soon",
      screensaver_enabled: true,
      screensaver_auto_lyrics_when_playing: true,
      screensaver_controls_enabled: true,
      screensaver_control_buttons: ["next", "lyrics", "lyrics_sync", "lyrics_font_minus", "lyrics_font_plus", "voice", "bogus", "next"],
      screensaver_clock_mode: "ANALOG",
      screensaver_timeout_seconds: 4,
      screensaver_message: "Enjoy the music",
      screensaver_clock_size: 3,
      screensaver_clock_x: 120,
      screensaver_clock_y: -10,
      power_button_enabled: true,
      power_button_name: "Movie",
      power_button_icon: "mdi:movie-open",
      power_button_action: "SCENE",
      power_button_entity: " scene.movie_time ",
      aux_button_2_enabled: true,
      aux_button_2_name: "Amp",
      aux_button_2_icon: "mdi:amplifier",
      aux_button_2_action: "toggle",
      aux_button_2_entity: "switch.amp",
      discovery_mode_enabled: false,
    }, {
      normalizeClockTime: (value, fallback) => String(value || fallback),
      normalizeNightModeDays: (value) => Array.isArray(value) ? value : [],
      defaultLibraryTabs: ["library_search", "library_playlists"],
      defaultMainBarItems: ["actions", "players", "library", "settings"],
      defaultQuickActions: ["timer", "like", "lyrics"],
      defaultAnnouncementPresets: ["Default A", "Default B", "Default C"],
    });

    expect(state.lang).toBe("he");
    expect(state.cardTheme).toBe("light");
    expect(state.performanceProfile).toBe("low");
    expect(state.performanceMode).toBe(true);
    expect(state.mobileDynamicThemeMode).toBe("strong");
    expect(state.mobileBackgroundMotionMode).toBe("subtle");
    expect(state.mobileCustomTextTone).toBe("dark");
    expect(state.hotelMode).toBe(true);
    expect(state.mobileFontScale).toBe(1.5);
    expect(state.mobileIconScale).toBe(1.25);
    expect(state.mobileNightMode).toBe("on");
    expect(state.mobileNightModeStart).toBe("23:15");
    expect(state.mobileNightModeEnd).toBe("05:45");
    expect(state.mobileNightModeDays).toEqual([1, 3, 5]);
    expect(state.mobileCompactMode).toBe(true);
    expect(state.mobileCompactWidgetMode).toBe("mini");
    expect(state.mobileCompactEdgeToEdge).toBe(false);
    expect(state.mobileEdgeToEdge).toBe(false);
    expect(state.mobileLayoutMode).toBe("full");
    expect(state.mobileCoverFlow).toBe(true);
    expect(state.mobileQueueFlow).toBe(true);
    expect(state.mobileLibraryDefaultLayout).toBe("grid");
    expect(state.mobileShowUpNext).toBe(false);
    expect(state.mobileFooterSearchEnabled).toBe(true);
    expect(state.mobileStudioShortcutEnabled).toBe(false);
    expect(state.mobileFooterMode).toBe("text");
    expect(state.mobileHomeShortcutEnabled).toBe(true);
    expect(state.mobileHomeShortcutPath).toBe("lovelace/media");
    expect(state.mobileVolumeMode).toBe("always");
    expect(state.mobileVolumeStepButtonsEnabled).toBe(true);
    expect(state.mobileVolumeStepPercent).toBe(7);
    expect(state.mobileMicMode).toBe("smart");
    expect(state.voiceAssistantEnabled).toBe(true);
    expect(state.voiceAssistantMode).toBe("assist");
    expect(state.voiceAssistantAgentId).toBe("conversation.home_assistant");
    expect(state.voiceAssistantSpeakFeedback).toBe(true);
    expect(state.mobileLikedMode).toBe("ma");
    expect(state.mobileSwipeMode).toBe("browse");
    expect(state.mobileRadioSourceMode).toBe("ma_first");
    expect(state.mobileRadioBrowserCountry).toBe("il");
    expect(state.mobileLibraryTabs).toEqual(["library_albums"]);
    expect(state.mobileMainBarItems).toEqual(["theme", "settings"]);
    expect(state.mobileQuickActions).toEqual(["timer", "queue_flow", "voice", "disconnect_all"]);
    expect(state.mobileAnnouncementPresets).toEqual(["One", "Two", "Three"]);
    expect(state.mobileAnnouncementVolume).toBe(20);
    expect(state.mobileAnnouncementTtsEntity).toBe("tts.living_room");
    expect(state.mobileAnnouncementTtsLanguage).toBe("en-GB");
    expect(state.pinnedPlayerEntities).toEqual(["media_player.kitchen", "media_player.office"]);
    expect(state.ambientLightEnabled).toBe(true);
    expect(state.ambientLightEntities).toEqual(["light.living_room", "light.tv"]);
    expect(state.ambientLightPlayerMap).toEqual(["media_player.kitchen = light.kitchen", "media_player.office: light.office"]);
    expect(state.ambientLightBrightness).toBe(100);
    expect(state.ambientLightTransition).toBe(0);
    expect(state.ambientLightCooldown).toBe(8);
    expect(state.screensaverEnabled).toBe(true);
    expect(state.screensaverAutoLyricsWhenPlaying).toBe(true);
    expect(state.screensaverControlsEnabled).toBe(true);
    expect(state.screensaverControlButtons).toEqual(["next", "lyrics", "lyrics_sync", "lyrics_font_minus", "lyrics_font_plus", "voice"]);
    expect(state.screensaverClockMode).toBe("analog");
    expect(state.screensaverTimeoutSeconds).toBe(15);
    expect(state.screensaverMessage).toBe("Enjoy the music");
    expect(state.screensaverClockSize).toBe(1.45);
    expect(state.screensaverClockX).toBe(92);
    expect(state.screensaverClockY).toBe(8);
    expect(state.powerButtonEnabled).toBe(true);
    expect(state.powerButtonName).toBe("Movie");
    expect(state.powerButtonIcon).toBe("mdi:movie-open");
    expect(state.powerButtonAction).toBe("scene");
    expect(state.powerButtonEntity).toBe("scene.movie_time");
    expect(state.auxiliaryButtons[0]).toEqual({
      enabled: true,
      name: "Amp",
      icon: "mdi:amplifier",
      action: "toggle",
      entity: "switch.amp",
    });
    expect(state.excludedPlayerEntities).toEqual(["media_player.bedroom", "media_player.garden"]);
    expect(state.playerSortMode).toBe("custom");
    expect(state.playerOrderEntities).toEqual(["media_player.office", "media_player.kitchen", "media_player.garden"]);
    expect(state.discoveryModeEnabled).toBe(false);
  });

  it("normalizes main bar and library tab selections", () => {
    expect(normalizeVisualMobileState({}).lang).toBe("en");

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

    expect(normalizeMobileQuickActions(["voice", "bad", "timer", "disconnect_all", "voice"], ["timer"])).toEqual(["voice", "timer", "disconnect_all"]);
    expect(normalizeMobileQuickActions([], ["timer"])).toEqual([]);
    expect(normalizeMobileQuickActionSlots({
      mobile_quick_action_1: "timer",
      mobile_quick_action_2: "bad",
      mobile_quick_action_3: "home",
    }, ["home", "timer", "lyrics"])).toEqual(["timer", "home", "lyrics"]);

    expect(normalizeVisualMobileState({ mobile_quick_actions: [] }, {
      defaultQuickActions: ["timer", "like"],
    }).mobileQuickActions).toEqual([]);
  });

  it("normalizes performance profiles while keeping legacy performance mode", () => {
    expect(normalizeVisualMobileState({ performance_profile: "ultra_lite" }).performanceProfile).toBe("ultra_lite");
    expect(normalizeVisualMobileState({ performance_profile: "ultra_lite" }).performanceMode).toBe(true);
    expect(normalizeVisualMobileState({ performance_profile: "high", performance_mode: true }).performanceProfile).toBe("high");
    expect(normalizeVisualMobileState({ performance_profile: "high", performance_mode: true }).performanceMode).toBe(false);
    expect(normalizeVisualMobileState({ performance_profile: "turbo", performance_mode: true }).performanceProfile).toBe("low");
  });

  it("stabilizes home shortcut, footer, mic, and volume modes", () => {
    expect(normalizeHomeShortcutPath("lovelace/media", { leadingSlash: true })).toBe("/lovelace/media");
    expect(normalizeHomeShortcutPath(" /dashboard ", { leadingSlash: true })).toBe("/dashboard");
    expect(normalizeMobileFooterMode("invalid")).toBe("icon");
    expect(normalizeMobileFooterMode("both")).toBe("both");
    expect(normalizeMobileMicMode("OFF")).toBe("off");
    expect(normalizeVoiceAssistantMode("music")).toBe("music");
    expect(normalizeVoiceAssistantMode("bad")).toBe("hybrid");
    expect(normalizeMobileVolumeMode("invalid")).toBe("button");
    expect(normalizeMobileCompactWidgetMode("bad")).toBe("auto");
    expect(normalizeMobileLayoutMode("COMPACT")).toBe("compact");
    expect(normalizeMobileLayoutMode("EDGE_TO_EDGE")).toBe("edge_to_edge");
    expect(normalizeMobileLayoutMode("bad")).toBe("auto");
    expect(normalizeMobileLibraryDefaultLayout("GRID")).toBe("grid");
    expect(normalizeMobileLibraryDefaultLayout("bad", "grid")).toBe("grid");
    expect(clampMobileFontScale(0.2)).toBe(0.5);
    expect(clampMobileIconScale(0.2)).toBe(0.8);
    expect(clampMobileVolumeStepPercent(99)).toBe(10);
  });

  it("normalizes pinned player inputs from single and multi-entity config", () => {
    expect(normalizePinnedPlayerEntities({
      pinned_player_entity: " media_player.office ",
    })).toEqual(["media_player.office"]);

    expect(normalizePinnedPlayerEntities({
      pinned_player_entities: ["media_player.office", "", "media_player.office", "media_player.kitchen"],
    })).toEqual(["media_player.office", "media_player.kitchen"]);
  });

  it("normalizes radio source mode", () => {
    expect(normalizeMobileRadioSourceMode("MA_ONLY")).toBe("ma_only");
    expect(normalizeMobileRadioSourceMode("radiobrowser_only")).toBe("radiobrowser_only");
    expect(normalizeMobileRadioSourceMode("unknown")).toBe("combined");
  });

  it("normalizes smart-home controls", () => {
    expect(normalizeEntityList(" light.a, light.b  light.a ")).toEqual(["light.a", "light.b"]);
    expect(clampPercent(0, 35, { min: 1, max: 100 })).toBe(1);
    expect(clampSeconds(999, 3, { min: 0, max: 120 })).toBe(120);
    expect(normalizeScreensaverClockMode("clock")).toBe("digital");
    expect(normalizePowerButtonAction("scene")).toBe("scene");
    expect(normalizePowerButtonAction("bad")).toBe("stop_player");
    expect(normalizeAuxiliaryButtonIcon("wand")).toBe("wand");
    expect(normalizeAuxiliaryButtonIcon("mdi:lightbulb")).toBe("mdi:lightbulb");
    expect(normalizeAuxiliaryButtonIcon("bad")).toBe("power");
    expect(normalizePlayerSortMode("alphabetical")).toBe("alphabetical");
    expect(normalizePlayerSortMode("bad")).toBe("default");
    expect(normalizeExcludedPlayerEntities({
      excluded_player_entities: ["media_player.kitchen", " media_player.kitchen ", "media_player.office"],
    })).toEqual(["media_player.kitchen", "media_player.office"]);
    expect(normalizePlayerOrderEntities({
      player_order_entity_1: "media_player.office",
      player_order_entity_2: "media_player.kitchen",
      player_order_entity_21: "media_player.patio",
      player_order_entities: ["media_player.kitchen", "media_player.bedroom"],
    })).toEqual(["media_player.office", "media_player.kitchen", "media_player.patio", "media_player.bedroom"]);
  });

  it("parses player to light mappings with multiple lights", () => {
    expect(parseAmbientLightPlayerMap([
      "media_player.kitchen = light.kitchen, light.counter",
      "media_player.kitchen = light.table",
      "bad = light.ignored",
    ])).toEqual([
      { player: "media_player.kitchen", lights: ["light.kitchen", "light.counter", "light.table"] },
    ]);
    expect(formatAmbientLightPlayerMapEntry("media_player.kitchen", ["light.kitchen", " light.counter "]))
      .toBe("media_player.kitchen = light.kitchen, light.counter");
  });

  it("detects color capable light entities", () => {
    expect(isColorCapableLightEntity({
      entity_id: "light.rgb_strip",
      attributes: { supported_color_modes: ["brightness", "rgb"] },
    })).toBe(true);
    expect(isColorCapableLightEntity({
      entity_id: "light.legacy_color",
      attributes: { supported_features: 16 },
    })).toBe(true);
    expect(isColorCapableLightEntity({
      entity_id: "light.dimmer",
      attributes: { supported_color_modes: ["brightness"] },
    })).toBe(false);
  });
});
