import { describe, expect, it } from "vitest";

import {
  assertStringArrayIfDefined,
  validateBaseCardEditorConfig,
  validateMobileCardEditorConfig,
} from "../src/config/validators.js";

describe("config validators", () => {
  it("validates configurable search section ordering", () => {
    expect(()=>validateBaseCardEditorConfig({search_result_order:['artists','albums']})).not.toThrow();
    expect(()=>validateBaseCardEditorConfig({search_result_order:['invalid']})).toThrow('search_result_order');
    expect(()=>validateBaseCardEditorConfig({search_result_order:'artists'})).toThrow('array of strings');
  });
  it("accepts a valid base editor config", () => {
    expect(() =>
      validateBaseCardEditorConfig({
        config_entry_id: "abc",
        homeii_engine_mode: "required",
        homeii_engine_instance_id: "main",
        homeii_engine_profile_id: "living-room",
        homeii_engine_timeout_ms: 3500,
        ma_interface_target: "_self",
        height: 800,
        main_opacity: 0.9,
        popup_opacity: 0.75,
        cache_ttl: 1000,
        music_assistant_timeout_ms: 12000,
        language: "he",
        theme_mode: "dark",
        rtl: true,
        hotel_mode: true,
        performance_profile: "ultra_lite",
        performance_mode: true,
        show_ma_button: false,
        show_theme_toggle: true,
        lrclib_lyrics_enabled: true,
      })
    ).not.toThrow();
  });

  it("rejects invalid base config values", () => {
    expect(() =>
      validateBaseCardEditorConfig({
        performance_mode: "on",
      })
    ).toThrow("performance_mode must be a boolean");

    expect(() =>
      validateBaseCardEditorConfig({
        performance_profile: "turbo",
      })
    ).toThrow("performance_profile must be one of: full, high, low, ultra_lite");

    expect(() =>
      validateBaseCardEditorConfig({
        homeii_engine_mode: "always",
      })
    ).toThrow("homeii_engine_mode must be one of: required");

    expect(() =>
      validateBaseCardEditorConfig({
        homeii_engine_timeout_ms: "fast",
      })
    ).toThrow("homeii_engine_timeout_ms must be a number");

    expect(() =>
      validateBaseCardEditorConfig({
        lrclib_lyrics_enabled: "yes",
      })
    ).toThrow("lrclib_lyrics_enabled must be a boolean");
  });

  it("accepts a valid card_id and rejects malformed ones", () => {
    expect(() => validateBaseCardEditorConfig({ card_id: "ida-music" })).not.toThrow();
    expect(() => validateBaseCardEditorConfig({ card_id: "Toke_2" })).not.toThrow();
    expect(() => validateBaseCardEditorConfig({ card_id: "a".repeat(64) })).not.toThrow();
    // Undefined and empty-after-trim are explicitly allowed (no scoping applied).
    expect(() => validateBaseCardEditorConfig({})).not.toThrow();
    expect(() => validateBaseCardEditorConfig({ card_id: "" })).not.toThrow();
    expect(() => validateBaseCardEditorConfig({ card_id: "   " })).not.toThrow();

    expect(() => validateBaseCardEditorConfig({ card_id: 42 })).toThrow(
      "card_id must be a string"
    );
    expect(() => validateBaseCardEditorConfig({ card_id: "ida music" })).toThrow(
      "card_id must be 1-64 characters of letters, digits, '-' or '_'"
    );
    expect(() => validateBaseCardEditorConfig({ card_id: "ida/music" })).toThrow(
      "card_id must be 1-64 characters of letters, digits, '-' or '_'"
    );
    expect(() => validateBaseCardEditorConfig({ card_id: "a".repeat(65) })).toThrow(
      "card_id must be 1-64 characters of letters, digits, '-' or '_'"
    );
  });

  it("accepts future language codes and rejects non-string language values", () => {
    expect(() =>
      validateBaseCardEditorConfig({
        language: "fr",
      })
    ).not.toThrow();

    expect(() =>
      validateBaseCardEditorConfig({
        language: 7,
      })
    ).toThrow("language must be a string");

    expect(() =>
      validateBaseCardEditorConfig({
        music_assistant_timeout_ms: "slow",
      })
    ).toThrow("music_assistant_timeout_ms must be a number");

    expect(() =>
      validateBaseCardEditorConfig({
        hotel_mode: "yes",
      })
    ).toThrow("hotel_mode must be a boolean");
  });

  it("accepts a valid mobile-only config", () => {
    expect(() =>
      validateMobileCardEditorConfig({
        language: "auto",
        theme_mode: "light",
        layout_mode: "tablet",
        settings_source: "card",
        night_mode: "auto",
        performance_profile: "low",
        mobile_dynamic_theme_mode: "strong",
        mobile_background_motion_mode: "subtle",
        mobile_custom_text_tone: "dark",
        mobile_icon_scale: 1.1,
        mobile_volume_mode: "always",
        mobile_volume_step_buttons: true,
        mobile_volume_step_percent: 5,
        mobile_mic_mode: "smart",
        voice_assistant_enabled: true,
        voice_assistant_mode: "hybrid",
        voice_assistant_agent_id: "conversation.home_assistant",
        voice_assistant_speak_feedback: true,
        flow_assistant_response_timeout_ms: 18000,
        flow_assistant_listen_timeout_ms: 12000,
        flow_assistant_auto_close_ms: 4200,
        mobile_swipe_mode: "browse",
        mobile_library_tabs: ["library", "queue"],
        mobile_library_default_layout: "grid",
        mobile_main_bar_items: ["actions", "settings"],
        mobile_quick_actions: ["timer", "voice", "queue_flow"],
        mobile_quick_action_1: "voice",
        mobile_quick_action_2: "timer",
        mobile_announcement_presets: ["hello"],
        mobile_compact_mode: true,
        mobile_compact_widget_mode: "mini",
        mobile_compact_edge_to_edge: false,
        mobile_edge_to_edge: true,
        mobile_layout_mode: "edge_to_edge",
        mobile_cover_flow: true,
        mobile_queue_flow: true,
        mobile_show_up_next: false,
        ambient_light_enabled: true,
        ambient_light_entities: ["light.living_room", "light.tv"],
        ambient_light_player_map: ["media_player.kitchen = light.kitchen"],
        ambient_light_brightness: 35,
        ambient_light_transition: 3,
        ambient_light_cooldown: 8,
        screensaver_enabled: true,
        screensaver_auto_lyrics_when_playing: true,
        screensaver_controls_enabled: true,
        screensaver_control_buttons: ["previous", "play_pause", "next", "mute", "power", "like", "lyrics", "lyrics_sync", "lyrics_font_minus", "lyrics_font_plus", "voice"],
        screensaver_clock_mode: "analog",
        screensaver_timeout_seconds: 90,
        screensaver_message: "Dinner is ready",
        screensaver_clock_size: 1.15,
        screensaver_clock_x: 80,
        screensaver_clock_y: 24,
        power_button_enabled: true,
        power_button_name: "Movie",
        power_button_icon: "speaker",
        power_button_action: "script",
        power_button_entity: "script.movie_time",
        aux_button_2_enabled: true,
        aux_button_2_name: "Amp",
        aux_button_2_icon: "music_note",
        aux_button_2_action: "toggle",
        aux_button_2_entity: "switch.amp",
        excluded_player_entities: ["media_player.bedroom"],
        player_sort_mode: "custom",
        player_order_entities: ["media_player.kitchen"],
        player_order_entity_1: "media_player.living_room",
        discovery_mode_enabled: true,
      })
    ).not.toThrow();
  });

  it("rejects invalid mobile control modes", () => {
    expect(() =>
      validateMobileCardEditorConfig({
        mobile_volume_mode: "slider-only",
      })
    ).toThrow("mobile_volume_mode must be one of: always, button");

    expect(() =>
      validateMobileCardEditorConfig({
        performance_profile: "turbo",
      })
    ).toThrow("performance_profile must be one of: full, high, low, ultra_lite");

    expect(() =>
      validateMobileCardEditorConfig({
        voice_assistant_mode: "always-listen",
      })
    ).toThrow("voice_assistant_mode must be one of: hybrid, music, assist");

    expect(() =>
      validateMobileCardEditorConfig({
        flow_assistant_response_timeout_ms: "forever",
      })
    ).toThrow("flow_assistant_response_timeout_ms must be a number");

    expect(() =>
      validateMobileCardEditorConfig({
        mobile_volume_step_buttons: "yes",
      })
    ).toThrow("mobile_volume_step_buttons must be a boolean");

    expect(() =>
      validateMobileCardEditorConfig({
        mobile_volume_step_percent: "5",
      })
    ).toThrow("mobile_volume_step_percent must be a number");

    expect(() =>
      validateMobileCardEditorConfig({
        mobile_compact_widget_mode: "tiny",
      })
    ).toThrow("mobile_compact_widget_mode must be one of: auto, full, mini");

    expect(() =>
      validateMobileCardEditorConfig({
        mobile_compact_edge_to_edge: "off",
      })
    ).toThrow("mobile_compact_edge_to_edge must be a boolean");

    expect(() =>
      validateMobileCardEditorConfig({
        mobile_edge_to_edge: "on",
      })
    ).toThrow("mobile_edge_to_edge must be a boolean");

    expect(() =>
      validateMobileCardEditorConfig({
        mobile_cover_flow: "on",
      })
    ).toThrow("mobile_cover_flow must be a boolean");

    expect(() =>
      validateMobileCardEditorConfig({
        mobile_queue_flow: "on",
      })
    ).toThrow("mobile_queue_flow must be a boolean");

    expect(() =>
      validateMobileCardEditorConfig({
        mobile_layout_mode: "phone",
      })
    ).toThrow("mobile_layout_mode must be one of: auto, full, edge_to_edge, compact");

    expect(() =>
      validateMobileCardEditorConfig({
        mobile_announcement_volume: "loud",
      })
    ).toThrow("mobile_announcement_volume must be a number");

    expect(() =>
      validateMobileCardEditorConfig({
        mobile_library_default_layout: "cards",
      })
    ).toThrow("mobile_library_default_layout must be one of: grid, list");

    expect(() =>
      validateMobileCardEditorConfig({
        mobile_radio_source_mode: "spotify",
      })
    ).toThrow("mobile_radio_source_mode must be one of: combined, ma_first, ma_only, radiobrowser_only");

    expect(() =>
      validateMobileCardEditorConfig({
        mobile_quick_action_1: 7,
      })
    ).toThrow("mobile_quick_action_1 must be a string");

    expect(() =>
      validateMobileCardEditorConfig({
        excluded_player_entities: "media_player.kitchen",
      })
    ).toThrow("excluded_player_entities must be an array of strings");

    expect(() =>
      validateMobileCardEditorConfig({
        player_sort_mode: "random",
      })
    ).toThrow("player_sort_mode must be one of: default, alphabetical, custom");

    expect(() =>
      validateMobileCardEditorConfig({
        player_order_entity_1: 7,
      })
    ).toThrow("player_order_entity_1 must be a string");
  });

  it("rejects invalid smart-home config values", () => {
    expect(() =>
      validateMobileCardEditorConfig({
        screensaver_clock_mode: "binary",
      })
    ).toThrow("screensaver_clock_mode must be one of: digital, analog");

    expect(() =>
      validateMobileCardEditorConfig({
        screensaver_auto_lyrics_when_playing: "yes",
      })
    ).toThrow("screensaver_auto_lyrics_when_playing must be a boolean");

    expect(() =>
      validateMobileCardEditorConfig({
        screensaver_control_buttons: ["previous", "party"],
      })
    ).toThrow("screensaver_control_buttons must contain only: previous, play_pause, next, mute, power, like, lyrics, lyrics_sync, lyrics_font_minus, lyrics_font_plus, voice");

    expect(() =>
      validateMobileCardEditorConfig({
        power_button_action: "explode",
      })
    ).toThrow("power_button_action must be one of: stop_player, toggle, turn_on, turn_off, scene, script");

    expect(() =>
      validateMobileCardEditorConfig({
        power_button_icon: 4,
      })
    ).toThrow("power_button_icon must be a string");

    expect(() =>
      validateMobileCardEditorConfig({
        aux_button_2_enabled: "yes",
      })
    ).toThrow("aux_button_2_enabled must be a boolean");

    expect(() =>
      validateMobileCardEditorConfig({
        aux_button_2_action: "explode",
      })
    ).toThrow("aux_button_2_action must be one of: stop_player, toggle, turn_on, turn_off, scene, script");

    expect(() =>
      validateMobileCardEditorConfig({
        ambient_light_entities: "light.living_room",
      })
    ).toThrow("ambient_light_entities must be an array of strings");

    expect(() =>
      validateMobileCardEditorConfig({
        ambient_light_player_map: "media_player.kitchen = light.kitchen",
      })
    ).toThrow("ambient_light_player_map must be an array of strings");

    expect(() =>
      validateMobileCardEditorConfig({
        screensaver_clock_size: "large",
      })
    ).toThrow("screensaver_clock_size must be a number");
  });

  it("rejects non-string array members", () => {
    expect(() => assertStringArrayIfDefined(["ok", 7], "mobile_library_tabs")).toThrow(
      "mobile_library_tabs must be an array of strings"
    );
  });
});
