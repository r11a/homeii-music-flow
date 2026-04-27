import { describe, expect, it } from "vitest";

import {
  buildDynamicThemePalette,
  clampRgbByte,
  dynamicThemeStrengthValue,
  hexToRgbTuple,
  hslToRgb,
  isRgbTupleDark,
  mixRgb,
  normalizeRgbTuple,
  resolveActiveAccentColor,
  resolveActiveAccentRgb,
  rgbToHsl,
  rgbTupleToHex,
  rgbTupleToString,
  tunePaletteColor,
} from "../src/core/theme/palette.js";

describe("palette foundation", () => {
  it("normalizes rgb and hex values safely", () => {
    expect(clampRgbByte(300)).toBe(255);
    expect(normalizeRgbTuple("12 34 56")).toEqual([12, 34, 56]);
    expect(hexToRgbTuple("#f5a623")).toEqual([245, 166, 35]);
    expect(rgbTupleToString([245, 166, 35])).toBe("245 166 35");
    expect(rgbTupleToHex([245, 166, 35])).toBe("#f5a623");
  });

  it("converts between rgb and hsl while preserving shape", () => {
    const hsl = rgbToHsl([245, 166, 35]);
    const rgb = hslToRgb(...hsl);

    expect(hsl[0]).toBeGreaterThanOrEqual(0);
    expect(hsl[1]).toBeGreaterThan(0);
    expect(rgb).toEqual([245, 166, 35]);
  });

  it("mixes and tunes palette colors predictably", () => {
    expect(mixRgb([0, 0, 0], [255, 255, 255], 0.5)).toEqual([128, 128, 128]);
    expect(tunePaletteColor([120, 140, 150], {
      minSaturation: 0.5,
      minLightness: 0.45,
      maxLightness: 0.55,
    })).toHaveLength(3);
    expect(isRgbTupleDark([20, 30, 40])).toBe(true);
    expect(isRgbTupleDark([240, 240, 240])).toBe(false);
  });

  it("builds a stable dynamic theme palette for auto and strong modes", () => {
    const autoPalette = buildDynamicThemePalette({
      baseTuple: [90, 110, 130],
      vividTuple: [140, 190, 240],
      mode: "auto",
    });
    const strongPalette = buildDynamicThemePalette({
      baseTuple: [90, 110, 130],
      vividTuple: [140, 190, 240],
      mode: "strong",
    });

    expect(autoPalette).toMatchObject({
      accent: expect.stringMatching(/^#/),
      accent_rgb: expect.any(String),
      surface_rgb: expect.any(String),
      glow_rgb: expect.any(String),
    });
    expect(strongPalette.accent_rgb).not.toBe("");
    expect(dynamicThemeStrengthValue("strong")).toBe("1.35");
    expect(dynamicThemeStrengthValue("auto")).toBe("1");
  });

  it("resolves active accent color and rgb from palette or fallback custom color", () => {
    expect(resolveActiveAccentColor({ accent: "#123456" }, "#abcdef")).toBe("#123456");
    expect(resolveActiveAccentColor(null, "#abcdef")).toBe("#abcdef");
    expect(resolveActiveAccentRgb({ accent_rgb: "1 2 3" }, "#abcdef")).toBe("1 2 3");
    expect(resolveActiveAccentRgb(null, "#abcdef")).toBe("171 205 239");
  });
});
