import { describe, expect, it } from "vitest";

import {
  defaultMobileMediaLayout,
  detectKeyboardLikeResize,
  resolveLayoutMode,
  resolveResizeStrategy,
  resolveTabletAutoFitFlags,
  tabletAutoFitDense,
  tabletAutoFitEnabled,
  tabletStabilityModeEnabled,
} from "../src/core/layout/responsive.js";

describe("responsive layout foundation", () => {
  it("resolves layout mode from config and measured widths", () => {
    expect(resolveLayoutMode("tablet", { rectWidth: 200 })).toBe("tablet");
    expect(resolveLayoutMode("mobile", { rectWidth: 1200 })).toBe("mobile");
    expect(resolveLayoutMode("auto", { rectWidth: 860, hostWidth: 870, viewportWidth: 880 })).toBe("mobile");
    expect(resolveLayoutMode("auto", { rectWidth: 860, hostWidth: 920, viewportWidth: 880 })).toBe("tablet");
  });

  it("normalizes tablet auto-fit flags", () => {
    expect(tabletAutoFitEnabled("tablet")).toBe(true);
    expect(tabletAutoFitDense("tablet", { showNightRow: true, showUpNext: false })).toBe(true);
    expect(resolveTabletAutoFitFlags("mobile", { showNightRow: true, showUpNext: true })).toEqual({
      autoFit: false,
      showNight: false,
      showUpNext: false,
      dense: false,
    });
    expect(resolveTabletAutoFitFlags("tablet", { showNightRow: false, showUpNext: true })).toEqual({
      autoFit: true,
      showNight: false,
      showUpNext: true,
      dense: true,
    });
  });

  it("detects tablet stability mode and default media layout", () => {
    expect(tabletStabilityModeEnabled({
      layoutMode: "tablet",
      userAgent: "Mozilla Android 14",
      width: 1200,
      touchPoints: 5,
    })).toBe(true);
    expect(tabletStabilityModeEnabled({
      layoutMode: "mobile",
      userAgent: "Mozilla Android 14",
      width: 1200,
      touchPoints: 5,
    })).toBe(false);
    expect(defaultMobileMediaLayout("tablet")).toBe("grid");
    expect(defaultMobileMediaLayout("mobile")).toBe("list");
  });

  it("resolves resize strategy without UI coupling", () => {
    expect(detectKeyboardLikeResize({
      editingText: true,
      widthDelta: 2,
      heightDelta: 240,
    })).toBe(true);

    expect(resolveResizeStrategy({
      previousWidth: 1200,
      currentWidth: 1220,
      previousHeight: 800,
      currentHeight: 820,
      editingText: false,
      tabletStabilityMode: false,
    }).softSync).toBe(true);

    expect(resolveResizeStrategy({
      previousWidth: 1200,
      currentWidth: 1300,
      previousHeight: 800,
      currentHeight: 1050,
      editingText: false,
      tabletStabilityMode: true,
    })).toMatchObject({
      keyboardLikeResize: false,
      widthThreshold: 140,
      heightThreshold: 180,
      softSync: false,
    });
  });
});
