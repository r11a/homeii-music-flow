import { describe, expect, it } from "vitest";

import {
  backgroundMotionAmount,
  backgroundMotionEnabled,
  isCompactTileMode,
  maxDecodedArtworkCache,
  mobileBackgroundMotionMode,
  mobileCompactModeEnabled,
  mobileCompactWidgetMode,
  mobileDynamicThemeMode,
  mobileShowUpNextEnabled,
  normalizeSettingsSource,
  performanceModeEnabled,
  performanceProfile,
  performanceUltraLiteEnabled,
  usesVisualSettings,
} from "../src/core/state/derived.js";

describe("state derived helpers", () => {
  it("normalizes settings source values", () => {
    expect(normalizeSettingsSource("card_config")).toBe("card");
    expect(normalizeSettingsSource("device")).toBe("ui");
    expect(normalizeSettingsSource("")).toBe("ui");
  });

  it("detects visual settings mode", () => {
    expect(usesVisualSettings({ settings_source: "visual" })).toBe(true);
    expect(usesVisualSettings({ settings_source: "ui" })).toBe(false);
  });

  it("stabilizes compact and up-next toggles", () => {
    expect(mobileCompactModeEnabled({ mobileCompactMode: true })).toBe(true);
    expect(mobileCompactWidgetMode({ mobileCompactWidgetMode: "MINI" })).toBe("mini");
    expect(mobileCompactWidgetMode({ mobileCompactWidgetMode: "tiny" })).toBe("auto");
    expect(mobileShowUpNextEnabled({ mobileShowUpNext: false })).toBe(false);
    expect(isCompactTileMode({ mobileCompactMode: true, mobileCompactExpanded: false })).toBe(true);
  });

  it("stabilizes dynamic theme and motion modes", () => {
    expect(mobileDynamicThemeMode({ mobileDynamicThemeMode: "STRONG" })).toBe("strong");
    expect(mobileDynamicThemeMode({ mobileDynamicThemeMode: "wild" })).toBe("auto");
    expect(mobileBackgroundMotionMode({ mobileBackgroundMotionMode: "EXTREME" })).toBe("extreme");
    expect(backgroundMotionEnabled({ mobileBackgroundMotionMode: "off" })).toBe(false);
    expect(backgroundMotionAmount({ mobileBackgroundMotionMode: "strong" })).toBe("1.35");
  });

  it("forces heavy visuals off in performance mode", () => {
    const state = {
      performanceMode: true,
      mobileDynamicThemeMode: "strong",
      mobileBackgroundMotionMode: "extreme",
    };

    expect(performanceModeEnabled(state)).toBe(true);
    expect(mobileDynamicThemeMode(state)).toBe("off");
    expect(mobileBackgroundMotionMode(state)).toBe("off");
    expect(backgroundMotionEnabled(state)).toBe(false);
  });

  it("normalizes performance profiles with legacy fallback", () => {
    expect(performanceProfile({ performanceMode: true })).toBe("low");
    expect(performanceProfile({ performanceProfile: "HIGH" })).toBe("high");
    expect(performanceProfile({ performanceProfile: "ultra_lite" })).toBe("ultra_lite");
    expect(performanceModeEnabled({ performanceProfile: "high" })).toBe(false);
    expect(performanceModeEnabled({ performanceProfile: "low" })).toBe(true);
    expect(performanceUltraLiteEnabled({ performanceProfile: "ultra_lite" })).toBe(true);
  });

  it("caps visual intensity by performance profile", () => {
    expect(mobileDynamicThemeMode({ performanceProfile: "high", mobileDynamicThemeMode: "strong" })).toBe("auto");
    expect(mobileBackgroundMotionMode({ performanceProfile: "high", mobileBackgroundMotionMode: "extreme" })).toBe("subtle");
    expect(mobileDynamicThemeMode({ performanceProfile: "ultra_lite", mobileDynamicThemeMode: "strong" })).toBe("off");
    expect(mobileBackgroundMotionMode({ performanceProfile: "ultra_lite", mobileBackgroundMotionMode: "strong" })).toBe("off");
  });

  it("scales decoded-artwork cache cap by performance profile", () => {
    // full is intentionally unchanged at 180 to preserve existing behavior
    // for default users. Lighter profiles get tighter caps to recover memory
    // on kiosk / low-RAM devices.
    expect(maxDecodedArtworkCache("full")).toBe(180);
    expect(maxDecodedArtworkCache("high")).toBe(120);
    expect(maxDecodedArtworkCache("low")).toBe(60);
    expect(maxDecodedArtworkCache("ultra_lite")).toBe(30);
    // Robust to whitespace and case
    expect(maxDecodedArtworkCache(" Ultra_Lite ")).toBe(30);
    // Unknown / empty / null fall back to the full cap (no surprise reductions)
    expect(maxDecodedArtworkCache("")).toBe(180);
    expect(maxDecodedArtworkCache(null)).toBe(180);
    expect(maxDecodedArtworkCache("nonsense")).toBe(180);
  });
});
