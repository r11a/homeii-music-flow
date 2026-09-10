const MOBILE_DYNAMIC_THEME_MODES = ["off", "auto", "strong"];
const MOBILE_BACKGROUND_MOTION_MODES = ["off", "subtle", "strong", "extreme"];
const PERFORMANCE_PROFILE_MODES = ["full", "high", "low", "ultra_lite"];
const MOBILE_NIGHT_MODES = ["off", "auto", "on"];
const MOBILE_FOOTER_MODES = ["icon", "text", "both"];
const MOBILE_VOLUME_MODES = ["always", "button"];
const MOBILE_COMPACT_WIDGET_MODES = ["auto", "full", "mini"];
const MOBILE_LAYOUT_MODES = ["auto", "full", "edge_to_edge", "compact"];
const MOBILE_LIBRARY_LAYOUT_MODES = ["grid", "list"];
const MOBILE_MIC_MODES = ["on", "off", "smart"];
const MOBILE_SWIPE_MODES = ["play", "browse"];
const MOBILE_RADIO_SOURCE_MODES = ["combined", "ma_first", "ma_only", "radiobrowser_only"];
const VOICE_ASSISTANT_MODES = ["hybrid", "music", "assist"];
const SCREENSAVER_CLOCK_MODES = ["digital", "analog"];
const SCREENSAVER_CONTROL_BUTTONS = ["previous", "play_pause", "next", "mute", "power", "like", "lyrics", "lyrics_sync", "lyrics_font_minus", "lyrics_font_plus", "voice"];
const POWER_BUTTON_ACTIONS = ["stop_player", "toggle", "turn_on", "turn_off", "scene", "script"];
const AUXILIARY_BUTTON_ICONS = ["power", "home", "speaker", "music_note", "wand", "grid", "settings", "heart_outline", "play", "stop", "radio", "timer", "info"];
const PLAYER_SORT_MODES = ["default", "alphabetical", "custom"];
const MOBILE_MAIN_BAR_ITEMS = ["search", "library", "players", "actions", "settings", "theme"];
const MOBILE_QUICK_ACTIONS = ["home", "search", "timer", "like", "lyrics", "queue", "queue_flow", "radio", "voice", "history", "info", "disconnect_all"];
const MOBILE_LIBRARY_TABS = ["library_playlists", "library_artists", "library_albums", "library_tracks", "library_radio", "library_podcasts", "library_liked", "library_search"];
const COLOR_LIGHT_MODES = ["hs", "xy", "rgb", "rgbw", "rgbww"];

export function normalizeEnum(value, allowedValues, fallbackValue) {
  const normalized = String(value || "").trim().toLowerCase();
  return allowedValues.includes(normalized) ? normalized : fallbackValue;
}

export function normalizePerformanceProfile(value, legacyPerformanceMode = false) {
  const normalized = normalizeEnum(value, PERFORMANCE_PROFILE_MODES, "");
  if (normalized) return normalized;
  return legacyPerformanceMode === true ? "low" : "full";
}

export function normalizeStringArray(value) {
  return Array.isArray(value) ? value.map((entry) => String(entry || "").trim()).filter(Boolean) : [];
}

export function normalizeEntityList(value) {
  const source = Array.isArray(value)
    ? value
    : String(value || "").split(/[\s,]+/);
  const next = [];
  source.map((entry) => String(entry || "").trim()).filter(Boolean).forEach((entityId) => {
    if (!next.includes(entityId)) next.push(entityId);
  });
  return next;
}

export function parseAmbientLightPlayerMap(value) {
  const groups = [];
  const byPlayer = new Map();
  normalizeStringArray(value).forEach((mapping) => {
    const parts = String(mapping || "").split(/\s*(?:=>|=|:)\s*/);
    const player = String(parts[0] || "").trim();
    const lights = normalizeEntityList(parts.slice(1).join(",")).filter((entityId) => entityId.startsWith("light."));
    if (!player.startsWith("media_player.") || !lights.length) return;
    if (!byPlayer.has(player)) {
      const group = { player, lights: [] };
      byPlayer.set(player, group);
      groups.push(group);
    }
    const group = byPlayer.get(player);
    lights.forEach((entityId) => {
      if (!group.lights.includes(entityId)) group.lights.push(entityId);
    });
  });
  return groups;
}

export function formatAmbientLightPlayerMapEntry(player, lights = []) {
  const playerId = String(player || "").trim();
  const lightIds = normalizeEntityList(lights).filter((entityId) => entityId.startsWith("light."));
  return playerId && lightIds.length ? `${playerId} = ${lightIds.join(", ")}` : "";
}

export function isColorCapableLightEntity(entity) {
  if (!entity?.entity_id?.startsWith?.("light.")) return false;
  const attributes = entity.attributes || {};
  const supportedModes = Array.isArray(attributes.supported_color_modes)
    ? attributes.supported_color_modes.map((mode) => String(mode || "").toLowerCase())
    : [];
  if (supportedModes.some((mode) => COLOR_LIGHT_MODES.includes(mode))) return true;
  if (COLOR_LIGHT_MODES.includes(String(attributes.color_mode || "").toLowerCase())) return true;
  const supportedFeatures = Number(attributes.supported_features);
  return Number.isFinite(supportedFeatures) && (supportedFeatures & 16) === 16;
}

export function clampPercent(value, fallback = 35, { min = 1, max = 100 } = {}) {
  const number = Number(value);
  const safe = Number.isFinite(number) ? number : fallback;
  return Math.max(min, Math.min(max, safe));
}

export function clampSeconds(value, fallback = 3, { min = 0, max = 300 } = {}) {
  const number = Number(value);
  const safe = Number.isFinite(number) ? number : fallback;
  return Math.max(min, Math.min(max, safe));
}

export function clampNumber(value, fallback = 1, { min = 0, max = 1 } = {}) {
  const number = Number(value);
  const safe = Number.isFinite(number) ? number : fallback;
  return Math.max(min, Math.min(max, safe));
}

export function normalizeScreensaverClockMode(value) {
  return normalizeEnum(value, SCREENSAVER_CLOCK_MODES, "digital");
}

export function normalizeScreensaverControlButtons(items, fallbackItems = []) {
  const allowed = new Set(SCREENSAVER_CONTROL_BUTTONS);
  const fallback = normalizeStringArray(fallbackItems).filter((item) => allowed.has(item));
  const hasExplicitItems = Array.isArray(items);
  const source = hasExplicitItems ? items : fallback;
  const cleaned = [];
  normalizeStringArray(source).forEach((item) => {
    if (allowed.has(item) && !cleaned.includes(item)) cleaned.push(item);
  });
  return cleaned.length ? cleaned : (hasExplicitItems ? [] : fallback);
}

export function normalizePowerButtonAction(value) {
  return normalizeEnum(value, POWER_BUTTON_ACTIONS, "stop_player");
}

export function normalizeAuxiliaryButtonIcon(value) {
  const icon = String(value || "").trim();
  if (/^[a-z0-9_-]+:[a-z0-9_-]+$/i.test(icon)) return icon;
  return normalizeEnum(icon, AUXILIARY_BUTTON_ICONS, "power");
}

export function normalizePlayerSortMode(value) {
  return normalizeEnum(value, PLAYER_SORT_MODES, "default");
}

export function normalizePlayerOrderEntities(config = {}, limit = 50) {
  const ordered = [];
  const dynamicLimit = Object.keys(config || {}).reduce((max, key) => {
    const match = /^player_order_entity_(\d+)$/.exec(key);
    return match ? Math.max(max, Number(match[1]) || 0) : max;
  }, limit);
  for (let index = 1; index <= dynamicLimit; index += 1) {
    const entityId = String(config?.[`player_order_entity_${index}`] || "").trim();
    if (entityId && !ordered.includes(entityId)) ordered.push(entityId);
  }
  normalizeStringArray(config?.player_order_entities).forEach((entityId) => {
    if (!ordered.includes(entityId)) ordered.push(entityId);
  });
  return ordered;
}

export function normalizeAuxiliaryButtons(config = {}, limit = 4) {
  const buttons = [{
    enabled: config.power_button_enabled === true,
    name: String(config.power_button_name || "").trim(),
    icon: normalizeAuxiliaryButtonIcon(config.power_button_icon || "power"),
    action: normalizePowerButtonAction(config.power_button_action),
    entity: String(config.power_button_entity || "").trim(),
  }];
  for (let index = 2; index <= limit; index += 1) {
    buttons.push({
      enabled: config[`aux_button_${index}_enabled`] === true,
      name: String(config[`aux_button_${index}_name`] || "").trim(),
      icon: normalizeAuxiliaryButtonIcon(config[`aux_button_${index}_icon`] || "power"),
      action: normalizePowerButtonAction(config[`aux_button_${index}_action`]),
      entity: String(config[`aux_button_${index}_entity`] || "").trim(),
    });
  }
  return buttons;
}

export function clampMobileFontScale(value) {
  return Math.max(0.5, Math.min(1.5, Number(value || 1) || 1));
}

export function clampMobileIconScale(value) {
  return Math.max(0.8, Math.min(1.25, Number(value || 1) || 1));
}

export function clampMobileVolumeStepPercent(value) {
  const number = Number(value);
  return Math.round(Math.max(1, Math.min(10, Number.isFinite(number) ? number : 5)));
}

export function normalizeHomeShortcutPath(value, { leadingSlash = false } = {}) {
  const normalized = String(value || "/").trim() || "/";
  if (!leadingSlash) return normalized;
  if (normalized.startsWith("/")) return normalized;
  return `/${normalized.replace(/^\/+/, "")}`;
}

export function normalizeMobileFooterMode(value) {
  return normalizeEnum(value, MOBILE_FOOTER_MODES, "icon");
}

export function normalizeMobileMicMode(value) {
  return normalizeEnum(value, MOBILE_MIC_MODES, "smart");
}

export function normalizeVoiceAssistantMode(value) {
  return normalizeEnum(value, VOICE_ASSISTANT_MODES, "hybrid");
}

export function normalizeMobileVolumeMode(value) {
  return normalizeEnum(value, MOBILE_VOLUME_MODES, "button");
}

export function normalizeMobileCompactWidgetMode(value) {
  return normalizeEnum(value, MOBILE_COMPACT_WIDGET_MODES, "auto");
}

export function normalizeMobileLayoutMode(value) {
  return normalizeEnum(value, MOBILE_LAYOUT_MODES, "auto");
}

export function normalizeMobileLibraryDefaultLayout(value, fallback = "list") {
  return normalizeEnum(value, MOBILE_LIBRARY_LAYOUT_MODES, normalizeEnum(fallback, MOBILE_LIBRARY_LAYOUT_MODES, "list"));
}

export function normalizeMobileRadioSourceMode(value) {
  return normalizeEnum(value, MOBILE_RADIO_SOURCE_MODES, "combined");
}

export function normalizePinnedPlayerEntityList(value) {
  const next = [];
  normalizeStringArray(value).forEach((entityId) => {
    if (!next.includes(entityId)) next.push(entityId);
  });
  return next;
}

export function normalizePinnedPlayerEntities(config = {}) {
  const explicitEntities = normalizeStringArray(config?.pinned_player_entities);
  if (explicitEntities.length) return normalizePinnedPlayerEntityList(explicitEntities);
  const singleEntity = String(config?.pinned_player_entity || "").trim();
  return normalizePinnedPlayerEntityList(singleEntity ? [singleEntity] : []);
}

export function normalizeExcludedPlayerEntities(config = {}) {
  return normalizePinnedPlayerEntityList(config?.excluded_player_entities);
}

export function normalizeMobileMainBarItems(items, {
  usesVisualSettings = false,
  hidePlayers = false,
  fallbackItems = [],
} = {}) {
  const allowed = new Set(MOBILE_MAIN_BAR_ITEMS);
  const baseFallback = normalizeStringArray(fallbackItems);
  const fallback = usesVisualSettings
    ? baseFallback.filter((item) => item !== "settings")
    : baseFallback;
  const source = Array.isArray(items) && items.length ? items : fallback;
  const cleaned = normalizeStringArray(source)
    .filter((item) => allowed.has(item))
    .filter((item) => !(usesVisualSettings && item === "settings"))
    .filter((item) => !(hidePlayers && item === "players"));
  const normalizedFallback = fallback.filter((item) => !(hidePlayers && item === "players"));
  const normalized = cleaned.length ? cleaned : normalizedFallback;
  if (!usesVisualSettings && !normalized.includes("settings")) normalized.push("settings");
  return normalized;
}

export function normalizeMobileLibraryTabs(tabs, fallbackTabs = []) {
  const allowed = new Set(MOBILE_LIBRARY_TABS);
  const fallback = normalizeStringArray(fallbackTabs);
  const source = Array.isArray(tabs) && tabs.length ? tabs : fallback;
  const cleaned = normalizeStringArray(source).filter((tab) => allowed.has(tab));
  const normalized = cleaned.length ? cleaned : fallback;
  return normalized.includes("library_search")
    ? ["library_search", ...normalized.filter((tab) => tab !== "library_search")]
    : normalized;
}

export function normalizeMobileQuickActions(items, fallbackItems = []) {
  const allowed = new Set(MOBILE_QUICK_ACTIONS);
  const fallback = normalizeStringArray(fallbackItems).filter((item) => allowed.has(item));
  const hasExplicitItems = Array.isArray(items);
  const source = hasExplicitItems ? items : fallback;
  const cleaned = [];
  normalizeStringArray(source).forEach((item) => {
    if (allowed.has(item) && !cleaned.includes(item)) cleaned.push(item);
  });
  return cleaned.length ? cleaned : (hasExplicitItems ? [] : fallback);
}

export function normalizeMobileQuickActionSlots(config = {}, selectedItems = []) {
  const allowed = new Set(MOBILE_QUICK_ACTIONS);
  const selected = normalizeStringArray(selectedItems).filter((item) => allowed.has(item));
  const ordered = [];
  for (let index = 1; index <= 10; index += 1) {
    const item = String(config?.[`mobile_quick_action_${index}`] || "").trim();
    if (!allowed.has(item) || !selected.includes(item) || ordered.includes(item)) continue;
    ordered.push(item);
  }
  selected.forEach((item) => {
    if (!ordered.includes(item)) ordered.push(item);
  });
  return ordered;
}

export function normalizeVisualMobileState(config = {}, {
  normalizeClockTime = (value, fallback) => String(value || fallback || ""),
  normalizeNightModeDays = (value) => Array.isArray(value) ? value : [0, 1, 2, 3, 4, 5, 6],
  defaultLibraryTabs = [],
  defaultMainBarItems = [],
  defaultQuickActions = [],
  defaultAnnouncementPresets = [],
} = {}) {
  const screensaverControlFallback = config.screensaver_controls_enabled === true ? ["previous", "next"] : [];
  const performanceProfile = normalizePerformanceProfile(config.performance_profile, config.performance_mode);
  return {
    lang: String(config.language || "en"),
    cardTheme: String(config.theme_mode || "auto"),
    performanceProfile,
    performanceMode: ["low", "ultra_lite"].includes(performanceProfile),
    mobileCustomColor: String(config.mobile_custom_color || "#f5a623"),
    mobileDynamicThemeMode: normalizeEnum(config.mobile_dynamic_theme_mode, MOBILE_DYNAMIC_THEME_MODES, "auto"),
    mobileBackgroundMotionMode: normalizeEnum(config.mobile_background_motion_mode, MOBILE_BACKGROUND_MOTION_MODES, "subtle"),
    mobileCustomTextTone: String(config.mobile_custom_text_tone || "light") === "dark" ? "dark" : "light",
    hotelMode: config.hotel_mode === true,
    mobileFontScale: clampMobileFontScale(config.mobile_font_scale),
    mobileIconScale: clampMobileIconScale(config.mobile_icon_scale),
    mobileNightMode: normalizeEnum(config.night_mode, MOBILE_NIGHT_MODES, "off"),
    mobileNightModeStart: normalizeClockTime(config.night_mode_auto_start || "22:00", "22:00"),
    mobileNightModeEnd: normalizeClockTime(config.night_mode_auto_end || "06:00", "06:00"),
    mobileNightModeDays: normalizeNightModeDays(config.night_mode_days),
    mobileCompactMode: !!config.mobile_compact_mode,
    mobileCompactWidgetMode: normalizeMobileCompactWidgetMode(config.mobile_compact_widget_mode),
    mobileCompactEdgeToEdge: config.mobile_compact_edge_to_edge !== false,
    mobileEdgeToEdge: config.mobile_edge_to_edge === true,
    mobileLayoutMode: normalizeMobileLayoutMode(config.mobile_layout_mode || (config.mobile_edge_to_edge === true ? "edge_to_edge" : "")),
    mobileCoverFlow: config.mobile_cover_flow === true,
    mobileQueueFlow: config.mobile_queue_flow !== false,
    mobileLibraryDefaultLayout: normalizeMobileLibraryDefaultLayout(config.mobile_library_default_layout, "list"),
    mobileShowUpNext: config.mobile_show_up_next === true,
    mobileFooterSearchEnabled: !!config.mobile_footer_search_enabled,
    mobileStudioShortcutEnabled: config.mobile_studio_shortcut !== false,
    mobileFooterMode: normalizeMobileFooterMode(config.mobile_footer_mode),
    mobilePlayerDesign: config.player_design === "classic" ? "classic" : "immersive",
    mobileHomeShortcutEnabled: !!config.mobile_home_shortcut,
    mobileHomeShortcutPath: normalizeHomeShortcutPath(config.mobile_home_shortcut_path),
    mobileVolumeMode: normalizeMobileVolumeMode(config.mobile_volume_mode),
    mobileVolumeStepButtonsEnabled: config.mobile_volume_step_buttons === true,
    mobileVolumeStepPercent: clampMobileVolumeStepPercent(config.mobile_volume_step_percent),
    mobileMicMode: normalizeMobileMicMode(config.mobile_mic_mode),
    voiceAssistantEnabled: config.voice_assistant_enabled === true,
    voiceAssistantMode: normalizeVoiceAssistantMode(config.voice_assistant_mode),
    voiceAssistantAgentId: String(config.voice_assistant_agent_id || "").trim(),
    voiceAssistantSpeakFeedback: config.voice_assistant_speak_feedback === true,
    mobileLikedMode: "ma",
    mobileSwipeMode: normalizeEnum(config.mobile_swipe_mode, MOBILE_SWIPE_MODES, "browse"),
    mobileRadioSourceMode: normalizeMobileRadioSourceMode(config.mobile_radio_source_mode),
    mobileRadioBrowserCountry: String(config.mobile_radio_browser_country || "all"),
    mobileLibraryTabs: Array.isArray(config.mobile_library_tabs) && config.mobile_library_tabs.length
      ? config.mobile_library_tabs.slice()
      : normalizeStringArray(defaultLibraryTabs),
    mobileMainBarItems: Array.isArray(config.mobile_main_bar_items) && config.mobile_main_bar_items.length
      ? config.mobile_main_bar_items.slice()
      : normalizeStringArray(defaultMainBarItems),
    mobileQuickActions: normalizeMobileQuickActionSlots(config, normalizeMobileQuickActions(
      config.mobile_quick_actions,
      defaultQuickActions,
    )),
    mobileAnnouncementPresets: Array.isArray(config.mobile_announcement_presets) && config.mobile_announcement_presets.length
      ? config.mobile_announcement_presets.slice(0, 3)
      : normalizeStringArray(defaultAnnouncementPresets).slice(0, 3),
    mobileAnnouncementVolume: Number.isFinite(Number(config.mobile_announcement_volume))
      ? Math.max(20, Math.min(50, Number(config.mobile_announcement_volume)))
      : 20,
    mobileAnnouncementTtsEntity: String(config.announcement_tts_entity || ""),
    mobileAnnouncementTtsLanguage: String(config.announcement_tts_language || "auto"),
    pinnedPlayerEntities: normalizePinnedPlayerEntities(config),
    ambientLightEnabled: config.ambient_light_enabled === true,
    ambientLightEntities: normalizeEntityList(config.ambient_light_entities),
    ambientLightPlayerMap: normalizeStringArray(config.ambient_light_player_map),
    ambientLightBrightness: clampPercent(config.ambient_light_brightness, 35, { min: 1, max: 100 }),
    ambientLightTransition: clampSeconds(config.ambient_light_transition, 3, { min: 0, max: 120 }),
    ambientLightCooldown: clampSeconds(config.ambient_light_cooldown, 8, { min: 0, max: 120 }),
    screensaverEnabled: config.screensaver_enabled === true,
    screensaverAutoLyricsWhenPlaying: config.screensaver_auto_lyrics_when_playing === true || config.screensaver_auto_lyrics === true,
    screensaverControlsEnabled: config.screensaver_controls_enabled === true,
    screensaverControlButtons: normalizeScreensaverControlButtons(config.screensaver_control_buttons, screensaverControlFallback),
    screensaverClockMode: normalizeScreensaverClockMode(config.screensaver_clock_mode),
    screensaverTimeoutSeconds: clampSeconds(config.screensaver_timeout_seconds, 90, { min: 15, max: 3600 }),
    screensaverMessage: String(config.screensaver_message || ""),
    screensaverClockSize: clampNumber(config.screensaver_clock_size, 1, { min: 0.75, max: 1.45 }),
    screensaverClockX: clampNumber(config.screensaver_clock_x, 82, { min: 8, max: 92 }),
    screensaverClockY: clampNumber(config.screensaver_clock_y, 24, { min: 8, max: 70 }),
    powerButtonEnabled: config.power_button_enabled === true,
    powerButtonName: String(config.power_button_name || "").trim(),
    powerButtonIcon: normalizeAuxiliaryButtonIcon(config.power_button_icon || "power"),
    powerButtonAction: normalizePowerButtonAction(config.power_button_action),
    powerButtonEntity: String(config.power_button_entity || "").trim(),
    auxiliaryButtons: normalizeAuxiliaryButtons(config).slice(1),
    excludedPlayerEntities: normalizeExcludedPlayerEntities(config),
    playerSortMode: normalizePlayerSortMode(config.player_sort_mode),
    playerOrderEntities: normalizePlayerOrderEntities(config),
    discoveryModeEnabled: config.discovery_mode_enabled !== false,
  };
}
