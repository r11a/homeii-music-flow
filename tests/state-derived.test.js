import { describe, expect, it } from "vitest";

import {
  backgroundMotionAmount,
  backgroundMotionEnabled,
  isCompactTileMode,
  mobileBackgroundMotionMode,
  mobileCompactModeEnabled,
  mobileDynamicThemeMode,
  mobileShowUpNextEnabled,
  normalizeSettingsSource,
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
});
