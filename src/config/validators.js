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

export function validateBaseCardEditorConfig(config) {
  if (!config || typeof config !== "object" || Array.isArray(config)) {
    throw new Error("Card config must be an object");
  }

  assertStringIfDefined(config.config_entry_id, "config_entry_id");
  assertStringIfDefined(config.ma_url, "ma_url");
  assertStringIfDefined(config.ma_token, "ma_token");
  assertStringIfDefined(config.ma_interface_url, "ma_interface_url");
  assertValueInList(config.ma_interface_target, "ma_interface_target", ["_self", "_blank"]);
  assertNumberIfDefined(config.height, "height");
  assertNumberIfDefined(config.main_opacity, "main_opacity");
  assertNumberIfDefined(config.popup_opacity, "popup_opacity");
  assertNumberIfDefined(config.cache_ttl, "cache_ttl");
  assertValueInList(config.language, "language", ["auto", "he", "en"]);
  assertValueInList(config.theme_mode, "theme_mode", ["auto", "dark", "light"]);
  assertBooleanIfDefined(config.rtl, "rtl");
  assertBooleanIfDefined(config.show_ma_button, "show_ma_button");
  assertBooleanIfDefined(config.show_theme_toggle, "show_theme_toggle");
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
  assertBooleanIfDefined(config.mobile_footer_search_enabled, "mobile_footer_search_enabled");
  assertValueInList(config.mobile_footer_mode, "mobile_footer_mode", ["icon", "text", "both"]);
  assertBooleanIfDefined(config.mobile_studio_shortcut, "mobile_studio_shortcut");
  assertBooleanIfDefined(config.mobile_home_shortcut, "mobile_home_shortcut");
  assertStringIfDefined(config.mobile_home_shortcut_path, "mobile_home_shortcut_path");
  assertValueInList(config.mobile_volume_mode, "mobile_volume_mode", ["always", "button"]);
  assertValueInList(config.mobile_mic_mode, "mobile_mic_mode", ["on", "off", "smart"]);
  assertStringArrayIfDefined(config.mobile_library_tabs, "mobile_library_tabs");
  assertStringArrayIfDefined(config.mobile_main_bar_items, "mobile_main_bar_items");
  assertValueInList(config.mobile_liked_mode, "mobile_liked_mode", ["ma", "local"]);
  assertValueInList(config.mobile_swipe_mode, "mobile_swipe_mode", ["play", "browse"]);
  assertStringIfDefined(config.mobile_radio_browser_country, "mobile_radio_browser_country");
  assertStringArrayIfDefined(config.mobile_announcement_presets, "mobile_announcement_presets");
  assertStringIfDefined(config.announcement_tts_entity, "announcement_tts_entity");
  assertBooleanIfDefined(config.mobile_compact_mode, "mobile_compact_mode");
  assertBooleanIfDefined(config.mobile_show_up_next, "mobile_show_up_next");
  assertStringIfDefined(config.pinned_player_entity, "pinned_player_entity");
  assertStringArrayIfDefined(config.pinned_player_entities, "pinned_player_entities");
}
