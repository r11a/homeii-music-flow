const MOBILE_DYNAMIC_THEME_MODES = ["off", "auto", "strong"];
const MOBILE_BACKGROUND_MOTION_MODES = ["off", "subtle", "strong", "extreme"];
const MOBILE_NIGHT_MODES = ["off", "auto", "on"];
const MOBILE_FOOTER_MODES = ["icon", "text", "both"];
const MOBILE_VOLUME_MODES = ["always", "button"];
const MOBILE_MIC_MODES = ["on", "off", "smart"];
const MOBILE_LIKED_MODES = ["ma", "local"];
const MOBILE_SWIPE_MODES = ["play", "browse"];
const MOBILE_MAIN_BAR_ITEMS = ["search", "library", "players", "actions", "settings", "theme"];
const MOBILE_LIBRARY_TABS = ["library_playlists", "library_artists", "library_albums", "library_tracks", "library_radio", "library_podcasts", "library_liked", "library_search"];

function normalizeEnum(value, allowedValues, fallbackValue) {
  const normalized = String(value || "").trim().toLowerCase();
  return allowedValues.includes(normalized) ? normalized : fallbackValue;
}

function normalizeStringArray(value) {
  return Array.isArray(value) ? value.map((entry) => String(entry || "").trim()).filter(Boolean) : [];
}

export function clampMobileFontScale(value) {
  return Math.max(0.5, Math.min(1.5, Number(value || 1) || 1));
}

export function normalizeHomeShortcutPath(value, { leadingSlash = false } = {}) {
  const normalized = String(value || "/").trim() || "/";
  if (!leadingSlash) return normalized;
  if (normalized.startsWith("/")) return normalized;
  return `/${normalized.replace(/^\/+/, "")}`;
}

export function normalizeMobileFooterMode(value) {
  return normalizeEnum(value, MOBILE_FOOTER_MODES, "both");
}

export function normalizeMobileMicMode(value) {
  return normalizeEnum(value, MOBILE_MIC_MODES, "smart");
}

export function normalizeMobileVolumeMode(value) {
  return normalizeEnum(value, MOBILE_VOLUME_MODES, "button");
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

export function normalizeVisualMobileState(config = {}, {
  normalizeClockTime = (value, fallback) => String(value || fallback || ""),
  normalizeNightModeDays = (value) => Array.isArray(value) ? value : [0, 1, 2, 3, 4, 5, 6],
  defaultLibraryTabs = [],
  defaultMainBarItems = [],
  defaultAnnouncementPresets = [],
} = {}) {
  return {
    lang: String(config.language || "auto"),
    cardTheme: String(config.theme_mode || "auto"),
    mobileCustomColor: String(config.mobile_custom_color || "#f5a623"),
    mobileDynamicThemeMode: normalizeEnum(config.mobile_dynamic_theme_mode, MOBILE_DYNAMIC_THEME_MODES, "auto"),
    mobileBackgroundMotionMode: normalizeEnum(config.mobile_background_motion_mode, MOBILE_BACKGROUND_MOTION_MODES, "subtle"),
    mobileCustomTextTone: String(config.mobile_custom_text_tone || "light") === "dark" ? "dark" : "light",
    mobileFontScale: clampMobileFontScale(config.mobile_font_scale),
    mobileNightMode: normalizeEnum(config.night_mode, MOBILE_NIGHT_MODES, "off"),
    mobileNightModeStart: normalizeClockTime(config.night_mode_auto_start || "22:00", "22:00"),
    mobileNightModeEnd: normalizeClockTime(config.night_mode_auto_end || "06:00", "06:00"),
    mobileNightModeDays: normalizeNightModeDays(config.night_mode_days),
    mobileCompactMode: !!config.mobile_compact_mode,
    mobileShowUpNext: config.mobile_show_up_next === true,
    mobileFooterSearchEnabled: !!config.mobile_footer_search_enabled,
    mobileStudioShortcutEnabled: config.mobile_studio_shortcut !== false,
    mobileFooterMode: normalizeMobileFooterMode(config.mobile_footer_mode),
    mobileHomeShortcutEnabled: !!config.mobile_home_shortcut,
    mobileHomeShortcutPath: normalizeHomeShortcutPath(config.mobile_home_shortcut_path),
    mobileVolumeMode: normalizeMobileVolumeMode(config.mobile_volume_mode),
    mobileMicMode: normalizeMobileMicMode(config.mobile_mic_mode),
    mobileLikedMode: normalizeEnum(config.mobile_liked_mode, MOBILE_LIKED_MODES, "ma"),
    mobileSwipeMode: normalizeEnum(config.mobile_swipe_mode, MOBILE_SWIPE_MODES, "browse"),
    mobileRadioBrowserCountry: String(config.mobile_radio_browser_country || "all"),
    mobileLibraryTabs: Array.isArray(config.mobile_library_tabs) && config.mobile_library_tabs.length
      ? config.mobile_library_tabs.slice()
      : normalizeStringArray(defaultLibraryTabs),
    mobileMainBarItems: Array.isArray(config.mobile_main_bar_items) && config.mobile_main_bar_items.length
      ? config.mobile_main_bar_items.slice()
      : normalizeStringArray(defaultMainBarItems),
    mobileAnnouncementPresets: Array.isArray(config.mobile_announcement_presets) && config.mobile_announcement_presets.length
      ? config.mobile_announcement_presets.slice(0, 3)
      : normalizeStringArray(defaultAnnouncementPresets).slice(0, 3),
    mobileAnnouncementTtsEntity: String(config.announcement_tts_entity || ""),
    pinnedPlayerEntities: normalizePinnedPlayerEntities(config),
  };
}
