export function normalizeSettingsSource(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (["card", "visual", "config", "card_config", "editor"].includes(normalized)) return "card";
  if (["ui", "device", "local", "in_card"].includes(normalized)) return "ui";
  return "ui";
}

export function usesVisualSettings(config) {
  return normalizeSettingsSource(config?.settings_source) === "card";
}

export function mobileCompactModeEnabled(state) {
  return !!state?.mobileCompactMode;
}

export function mobileCompactEdgeToEdgeEnabled(state) {
  return state?.mobileCompactEdgeToEdge !== false;
}

export function mobileCompactWidgetMode(state) {
  const mode = String(state?.mobileCompactWidgetMode || "auto").trim().toLowerCase();
  return ["auto", "full", "mini"].includes(mode) ? mode : "auto";
}

export function mobileShowUpNextEnabled(state) {
  return state?.mobileShowUpNext === true;
}

export function performanceProfile(state) {
  const profile = String(state?.performanceProfile || "").trim().toLowerCase();
  if (["full", "high", "low", "ultra_lite"].includes(profile)) return profile;
  return state?.performanceMode === true ? "low" : "full";
}

export function performanceModeEnabled(state) {
  return ["low", "ultra_lite"].includes(performanceProfile(state));
}

export function performanceUltraLiteEnabled(state) {
  return performanceProfile(state) === "ultra_lite";
}

// Decoded artwork bitmap cache size by performance profile. Each entry pins
// a Blob/Image of roughly 50-100 KB in memory, so the cap is the dominant
// knob for the card's idle artwork-memory footprint on memory-constrained
// devices (kitchen kiosks, low-RAM phones, embedded HA dashboards).
// The "full" profile is intentionally left at today's value so existing
// users see no change unless they explicitly opt into a lighter profile.
const DECODED_ARTWORK_CACHE_CAPS = Object.freeze({
  full: 180,
  high: 120,
  low: 60,
  ultra_lite: 30,
});

export function maxDecodedArtworkCache(profile) {
  const normalized = String(profile || "").trim().toLowerCase();
  return DECODED_ARTWORK_CACHE_CAPS[normalized] ?? DECODED_ARTWORK_CACHE_CAPS.full;
}

export function mobileDynamicThemeMode(state) {
  const profile = performanceProfile(state);
  if (profile === "low" || profile === "ultra_lite") return "off";
  const mode = String(state?.mobileDynamicThemeMode || "auto").toLowerCase();
  const normalized = ["off", "auto", "strong"].includes(mode) ? mode : "auto";
  return profile === "high" && normalized === "strong" ? "auto" : normalized;
}

export function mobileBackgroundMotionMode(state) {
  const profile = performanceProfile(state);
  if (profile === "low" || profile === "ultra_lite") return "off";
  const mode = String(state?.mobileBackgroundMotionMode || "subtle").toLowerCase();
  const normalized = ["off", "subtle", "strong", "extreme"].includes(mode) ? mode : "subtle";
  return profile === "high" && ["strong", "extreme"].includes(normalized) ? "subtle" : normalized;
}

export function backgroundMotionEnabled(state) {
  return mobileBackgroundMotionMode(state) !== "off";
}

export function backgroundMotionAmount(state) {
  const mode = mobileBackgroundMotionMode(state);
  if (mode === "extreme") return "1.85";
  if (mode === "strong") return "1.35";
  return "1";
}

export function isCompactTileMode(state) {
  return mobileCompactModeEnabled(state) && !state?.mobileCompactExpanded;
}
