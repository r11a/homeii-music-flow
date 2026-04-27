const DEFAULT_ACCENT_TUPLE = [245, 166, 35];
const DEFAULT_ACCENT_HEX = "#f5a623";

export function clampRgbByte(value) {
  return Math.max(0, Math.min(255, Math.round(Number(value) || 0)));
}

export function normalizeRgbTuple(value, fallback = DEFAULT_ACCENT_TUPLE) {
  if (Array.isArray(value) && value.length >= 3) {
    return value.slice(0, 3).map((entry) => clampRgbByte(entry));
  }
  if (typeof value === "string") {
    const parts = value.trim().split(/[,\s]+/).map((entry) => Number(entry));
    if (parts.length >= 3 && parts.every((entry) => Number.isFinite(entry))) {
      return parts.slice(0, 3).map((entry) => clampRgbByte(entry));
    }
  }
  return fallback.map((entry) => clampRgbByte(entry));
}

export function hexToRgbTuple(value, fallback = DEFAULT_ACCENT_TUPLE) {
  const hex = String(value || DEFAULT_ACCENT_HEX).replace("#", "").trim();
  const normalized = hex.length === 3
    ? hex.split("").map((char) => char + char).join("")
    : hex.padEnd(6, "0").slice(0, 6);
  const tuple = [
    parseInt(normalized.slice(0, 2), 16),
    parseInt(normalized.slice(2, 4), 16),
    parseInt(normalized.slice(4, 6), 16),
  ];
  if (tuple.every((entry) => Number.isFinite(entry))) {
    return tuple.map((entry) => clampRgbByte(entry));
  }
  return normalizeRgbTuple(fallback);
}

export function rgbTupleToString(tuple = DEFAULT_ACCENT_TUPLE) {
  const [r, g, b] = normalizeRgbTuple(tuple);
  return `${r} ${g} ${b}`;
}

export function rgbTupleToHex(tuple = DEFAULT_ACCENT_TUPLE) {
  return `#${normalizeRgbTuple(tuple)
    .map((entry) => clampRgbByte(entry).toString(16).padStart(2, "0"))
    .join("")}`;
}

export function mixRgb(left = DEFAULT_ACCENT_TUPLE, right = [255, 255, 255], ratio = 0.5) {
  const weight = Math.max(0, Math.min(1, Number(ratio) || 0));
  const from = normalizeRgbTuple(left);
  const to = normalizeRgbTuple(right);
  return from.map((entry, index) => clampRgbByte(entry + ((to[index] - entry) * weight)));
}

export function rgbToHsl(tuple = DEFAULT_ACCENT_TUPLE) {
  let [r, g, b] = normalizeRgbTuple(tuple).map((entry) => entry / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lightness = (max + min) / 2;
  if (max === min) return [0, 0, lightness];
  const delta = max - min;
  const saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);
  let hue = 0;
  switch (max) {
    case r: hue = ((g - b) / delta) + (g < b ? 6 : 0); break;
    case g: hue = ((b - r) / delta) + 2; break;
    default: hue = ((r - g) / delta) + 4; break;
  }
  return [hue / 6, saturation, lightness];
}

export function hslToRgb(hue = 0, saturation = 0, lightness = 0.5) {
  const h = ((Number(hue) % 1) + 1) % 1;
  const s = Math.max(0, Math.min(1, Number(saturation) || 0));
  const l = Math.max(0, Math.min(1, Number(lightness) || 0));
  if (s === 0) {
    const value = clampRgbByte(l * 255);
    return [value, value, value];
  }
  const hueToRgb = (p, q, t) => {
    let value = t;
    if (value < 0) value += 1;
    if (value > 1) value -= 1;
    if (value < 1 / 6) return p + ((q - p) * 6 * value);
    if (value < 1 / 2) return q;
    if (value < 2 / 3) return p + ((q - p) * (2 / 3 - value) * 6);
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : (l + s - (l * s));
  const p = (2 * l) - q;
  return [
    clampRgbByte(hueToRgb(p, q, h + (1 / 3)) * 255),
    clampRgbByte(hueToRgb(p, q, h) * 255),
    clampRgbByte(hueToRgb(p, q, h - (1 / 3)) * 255),
  ];
}

export function tunePaletteColor(tuple = DEFAULT_ACCENT_TUPLE, options = {}) {
  const [hue, saturation, lightness] = rgbToHsl(tuple);
  const minSat = Number(options.minSaturation ?? 0.42);
  const minLight = Number(options.minLightness ?? 0.42);
  const maxLight = Number(options.maxLightness ?? 0.6);
  const sat = Math.max(minSat, saturation);
  const light = Math.max(minLight, Math.min(maxLight, lightness));
  return hslToRgb(hue, sat, light);
}

export function isRgbTupleDark(tuple = DEFAULT_ACCENT_TUPLE, threshold = 0.58) {
  const [r, g, b] = normalizeRgbTuple(tuple);
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance < Number(threshold || 0.58);
}

export function dynamicThemeStrengthValue(mode = "auto") {
  return String(mode || "").toLowerCase() === "strong" ? "1.35" : "1";
}

export function buildDynamicThemePalette({
  baseTuple = DEFAULT_ACCENT_TUPLE,
  vividTuple = DEFAULT_ACCENT_TUPLE,
  mode = "auto",
} = {}) {
  const normalizedMode = String(mode || "auto").toLowerCase();
  const strong = normalizedMode === "strong";
  const base = normalizeRgbTuple(baseTuple);
  const accent = tunePaletteColor(vividTuple, {
    minSaturation: strong ? 0.58 : 0.46,
    minLightness: 0.42,
    maxLightness: strong ? 0.56 : 0.6,
  });
  const surface = mixRgb(base, accent, strong ? 0.32 : 0.2);
  const glow = mixRgb(accent, [255, 255, 255], strong ? 0.12 : 0.2);
  return {
    accent: rgbTupleToHex(accent),
    accent_rgb: rgbTupleToString(accent),
    surface_rgb: rgbTupleToString(surface),
    glow_rgb: rgbTupleToString(glow),
  };
}

export function resolveActiveAccentColor(palette = null, customColor = DEFAULT_ACCENT_HEX) {
  return palette?.accent || String(customColor || DEFAULT_ACCENT_HEX);
}

export function resolveActiveAccentRgb(palette = null, customColor = DEFAULT_ACCENT_HEX) {
  return palette?.accent_rgb || rgbTupleToString(hexToRgbTuple(customColor));
}
