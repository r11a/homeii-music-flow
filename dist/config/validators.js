export function assertStringIfDefined(value, key) {
  if (value == null) return;
  if (typeof value !== "string") throw new Error(`${key} must be a string`);
}

export function assertBooleanIfDefined(value, key) {
  if (value == null) return;
  if (typeof value !== "boolean") throw new Error(`${key} must be a boolean`);
}

export function assertNumberIfDefined(value, key) {
  if (value == null) return;
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new Error(`${key} must be a number`);
  }
}

export function assertStringArrayIfDefined(value, key) {
  if (value == null) return;
  if (!Array.isArray(value) || value.some((entry) => typeof entry !== "string")) {
    throw new Error(`${key} must be an array of strings`);
  }
}

export function assertValueInList(value, key, allowedValues) {
  if (value == null) return;
  if (!allowedValues.includes(value)) {
    throw new Error(`${key} must be one of: ${allowedValues.join(", ")}`);
  }
}

export function assertStringArrayValuesIfDefined(value, key, allowedValues) {
  assertStringArrayIfDefined(value, key);
  if (value == null) return;
  const invalid = value.find((entry) => !allowedValues.includes(entry));
  if (invalid !== undefined) {
    throw new Error(`${key} must contain only: ${allowedValues.join(", ")}`);
  }
}

export function validateBaseCardEditorConfig(config) {
  if (!config || typeof config !== "object" || Array.isArray(config)) {
    throw new Error("Card config must be an object");
  }

  assertStringIfDefined(config.config_entry_id, "config_entry_id");
  assertStringIfDefined(config.ma_url, "ma_url");
  assertStringIfDefined(config.music_assistant_external_url, "music_assistant_external_url");
  assertStringIfDefined(config.ma_token, "ma_token");
  assertStringIfDefined(config.active_player_helper_entity, "active_player_helper_entity");
  assertStringIfDefined(config.ma_interface_url, "ma_interface_url");
  assertValueInList(config.ma_interface_target, "ma_interface_target", ["_self", "_blank"]);
  assertNumberIfDefined(config.height, "height");
  assertNumberIfDefined(config.main_opacity, "main_opacity");
  assertNumberIfDefined(config.popup_opacity, "popup_opacity");
  assertNumberIfDefined(config.cache_ttl, "cache_ttl");
  assertNumberIfDefined(config.music_assistant_timeout_ms, "music_assistant_timeout_ms");
  assertStringIfDefined(config.language, "language");
  assertValueInList(config.theme_mode, "theme_mode", ["auto", "dark", "light", "custom"]);
  assertBooleanIfDefined(config.rtl, "rtl");
  assertBooleanIfDefined(config.hotel_mode, "hotel_mode");
  assertBooleanIfDefined(config.show_confirmation_toasts, "show_confirmation_toasts");
  assertBooleanIfDefined(config.performance_mode, "performance_mode");
  assertValueInList(config.performance_profile, "performance_profile", ["full", "high", "low", "ultra_lite"]);
  assertBooleanIfDefined(config.show_ma_button, "show_ma_button");
  assertBooleanIfDefined(config.show_theme_toggle, "show_theme_toggle");
  assertBooleanIfDefined(config.ambient_light_enabled, "ambient_light_enabled");
  assertStringArrayIfDefined(config.ambient_light_entities, "ambient_light_entities");
  assertStringArrayIfDefined(config.ambient_light_player_map, "ambient_light_player_map");
  assertNumberIfDefined(config.ambient_light_brightness, "ambient_light_brightness");
  assertNumberIfDefined(config.ambient_light_transition, "ambient_light_transition");
  assertNumberIfDefined(config.ambient_light_cooldown, "ambient_light_cooldown");
  assertBooleanIfDefined(config.screensaver_enabled, "screensaver_enabled");
  assertBooleanIfDefined(config.screensaver_controls_enabled, "screensaver_controls_enabled");
  assertStringArrayValuesIfDefined(config.screensaver_control_buttons, "screensaver_control_buttons", ["previous", "play_pause", "next", "mute", "power", "like", "lyrics", "voice"]);
  assertValueInList(config.screensaver_clock_mode, "screensaver_clock_mode", ["digital", "analog"]);
  assertNumberIfDefined(config.screensaver_timeout_seconds, "screensaver_timeout_seconds");
  assertStringIfDefined(config.screensaver_message, "screensaver_message");
  assertNumberIfDefined(config.screensaver_clock_size, "screensaver_clock_size");
  assertNumberIfDefined(config.screensaver_clock_x, "screensaver_clock_x");
  assertNumberIfDefined(config.screensaver_clock_y, "screensaver_clock_y");
  assertBooleanIfDefined(config.power_button_enabled, "power_button_enabled");
  assertStringIfDefined(config.power_button_name, "power_button_name");
  assertStringIfDefined(config.power_button_icon, "power_button_icon");
  assertValueInList(config.power_button_action, "power_button_action", ["stop_player", "toggle", "turn_on", "turn_off", "scene", "script"]);
  assertStringIfDefined(config.power_button_entity, "power_button_entity");
  for (let index = 2; index <= 4; index += 1) {
    assertBooleanIfDefined(config[`aux_button_${index}_enabled`], `aux_button_${index}_enabled`);
    assertStringIfDefined(config[`aux_button_${index}_name`], `aux_button_${index}_name`);
    assertStringIfDefined(config[`aux_button_${index}_icon`], `aux_button_${index}_icon`);
    assertValueInList(config[`aux_button_${index}_action`], `aux_button_${index}_action`, ["stop_player", "toggle", "turn_on", "turn_off", "scene", "script"]);
    assertStringIfDefined(config[`aux_button_${index}_entity`], `aux_button_${index}_entity`);
  }
  assertBooleanIfDefined(config.discovery_mode_enabled, "discovery_mode_enabled");
}

export function validateMobileCardEditorConfig(config) {
  validateBaseCardEditorConfig(config);

  assertValueInList(config.layout_mode, "layout_mode", ["auto", "mobile", "tablet"]);
  assertValueInList(config.settings_source, "settings_source", ["device", "visual", "ui", "card"]);
  assertValueInList(config.night_mode, "night_mode", ["off", "auto", "on"]);
  assertStringIfDefined(config.night_mode_auto_start, "night_mode_auto_start");
  assertStringIfDefined(config.night_mode_auto_end, "night_mode_auto_end");
  assertStringIfDefined(config.favorite_button_entity, "favorite_button_entity");
  assertBooleanIfDefined(config.allow_local_likes, "allow_local_likes");
  assertBooleanIfDefined(config.use_mass_queue_send_command, "use_mass_queue_send_command");
  assertStringIfDefined(config.mobile_custom_color, "mobile_custom_color");
  assertValueInList(config.mobile_dynamic_theme_mode, "mobile_dynamic_theme_mode", ["off", "auto", "strong"]);
  assertValueInList(config.mobile_background_motion_mode, "mobile_background_motion_mode", ["off", "subtle", "strong", "extreme"]);
  assertValueInList(config.mobile_custom_text_tone, "mobile_custom_text_tone", ["light", "dark"]);
  assertNumberIfDefined(config.mobile_font_scale, "mobile_font_scale");
  assertNumberIfDefined(config.mobile_icon_scale, "mobile_icon_scale");
  assertBooleanIfDefined(config.mobile_footer_search_enabled, "mobile_footer_search_enabled");
  assertValueInList(config.mobile_footer_mode, "mobile_footer_mode", ["icon", "text", "both"]);
  assertBooleanIfDefined(config.mobile_studio_shortcut, "mobile_studio_shortcut");
  assertBooleanIfDefined(config.mobile_home_shortcut, "mobile_home_shortcut");
  assertStringIfDefined(config.mobile_home_shortcut_path, "mobile_home_shortcut_path");
  assertValueInList(config.mobile_volume_mode, "mobile_volume_mode", ["always", "button"]);
  assertBooleanIfDefined(config.mobile_volume_step_buttons, "mobile_volume_step_buttons");
  assertNumberIfDefined(config.mobile_volume_step_percent, "mobile_volume_step_percent");
  assertValueInList(config.mobile_mic_mode, "mobile_mic_mode", ["on", "off", "smart"]);
  assertBooleanIfDefined(config.voice_assistant_enabled, "voice_assistant_enabled");
  assertValueInList(config.voice_assistant_mode, "voice_assistant_mode", ["hybrid", "music", "assist"]);
  assertStringIfDefined(config.voice_assistant_agent_id, "voice_assistant_agent_id");
  assertBooleanIfDefined(config.voice_assistant_speak_feedback, "voice_assistant_speak_feedback");
  assertNumberIfDefined(config.flow_assistant_response_timeout_ms, "flow_assistant_response_timeout_ms");
  assertNumberIfDefined(config.flow_assistant_listen_timeout_ms, "flow_assistant_listen_timeout_ms");
  assertNumberIfDefined(config.flow_assistant_auto_close_ms, "flow_assistant_auto_close_ms");
  assertStringArrayIfDefined(config.mobile_library_tabs, "mobile_library_tabs");
  assertValueInList(config.mobile_library_default_layout, "mobile_library_default_layout", ["grid", "list"]);
  assertStringArrayIfDefined(config.mobile_main_bar_items, "mobile_main_bar_items");
  assertStringArrayIfDefined(config.mobile_quick_actions, "mobile_quick_actions");
  for (let index = 1; index <= 10; index += 1) {
    assertStringIfDefined(config[`mobile_quick_action_${index}`], `mobile_quick_action_${index}`);
  }
  assertValueInList(config.mobile_liked_mode, "mobile_liked_mode", ["ma", "local"]);
  assertValueInList(config.mobile_swipe_mode, "mobile_swipe_mode", ["play", "browse"]);
  assertStringIfDefined(config.mobile_radio_browser_country, "mobile_radio_browser_country");
  assertStringArrayIfDefined(config.mobile_announcement_presets, "mobile_announcement_presets");
  assertNumberIfDefined(config.mobile_announcement_volume, "mobile_announcement_volume");
  assertStringIfDefined(config.announcement_tts_entity, "announcement_tts_entity");
  assertStringIfDefined(config.announcement_tts_language, "announcement_tts_language");
  assertBooleanIfDefined(config.mobile_compact_mode, "mobile_compact_mode");
  assertValueInList(config.mobile_compact_widget_mode, "mobile_compact_widget_mode", ["auto", "full", "mini"]);
  assertBooleanIfDefined(config.mobile_compact_edge_to_edge, "mobile_compact_edge_to_edge");
  assertValueInList(config.mobile_layout_mode, "mobile_layout_mode", ["auto", "full", "compact"]);
  assertBooleanIfDefined(config.mobile_show_up_next, "mobile_show_up_next");
  assertStringIfDefined(config.pinned_player_entity, "pinned_player_entity");
  assertStringArrayIfDefined(config.pinned_player_entities, "pinned_player_entities");
  assertStringArrayIfDefined(config.excluded_player_entities, "excluded_player_entities");
  assertValueInList(config.player_sort_mode, "player_sort_mode", ["default", "alphabetical", "custom"]);
  assertStringArrayIfDefined(config.player_order_entities, "player_order_entities");
  for (let index = 1; index <= 20; index += 1) {
    assertStringIfDefined(config[`player_order_entity_${index}`], `player_order_entity_${index}`);
  }
}
