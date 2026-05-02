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

export function mobileShowUpNextEnabled(state) {
  return state?.mobileShowUpNext === true;
}

export function mobileDynamicThemeMode(state) {
  const mode = String(state?.mobileDynamicThemeMode || "auto").toLowerCase();
  return ["off", "auto", "strong"].includes(mode) ? mode : "auto";
}

export function mobileBackgroundMotionMode(state) {
  const mode = String(state?.mobileBackgroundMotionMode || "subtle").toLowerCase();
  return ["off", "subtle", "strong", "extreme"].includes(mode) ? mode : "subtle";
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
