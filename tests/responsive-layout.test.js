import { describe, expect, it } from "vitest";

import {
  defaultMobileMediaLayout,
  detectKeyboardLikeResize,
  autoCompactRecommended,
  panelViewportFillEnabled,
  resolveLayoutMode,
  resolveLayoutProfile,
  resolveResizeStrategy,
  resolveTabletAutoFitFlags,
  tabletAutoFitDense,
  tabletAutoFitEnabled,
  tabletStabilityModeEnabled,
} from "../src/core/layout/responsive.js";
import { interfaceStyles } from "../src/core/theme/interface.js";

describe("responsive layout foundation", () => {
  it("keeps library category navigation visible with the global screen dock", () => {
    expect(interfaceStyles).toContain(".card .has-screen-dock .library-nav { display:grid!important; }");
    expect(interfaceStyles).not.toContain(".card .has-screen-dock .library-nav { display:none!important; }");
  });

  it("resolves layout mode from config and measured widths", () => {
    expect(resolveLayoutMode("tablet", { rectWidth: 200 })).toBe("tablet");
    expect(resolveLayoutMode("mobile", { rectWidth: 1200 })).toBe("mobile");
    expect(resolveLayoutMode("auto", { rectWidth: 860, hostWidth: 870, viewportWidth: 880 })).toBe("mobile");
    expect(resolveLayoutMode("auto", { rectWidth: 860, hostWidth: 920, viewportWidth: 880 })).toBe("mobile");
    expect(resolveLayoutMode("auto", { rectWidth: 860, hostWidth: 1000, viewportWidth: 880 })).toBe("tablet");
    expect(resolveLayoutMode("auto", { rectWidth: 400, hostWidth: 0, viewportWidth: 1440 })).toBe("mobile");
    expect(resolveLayoutMode("auto", { rectWidth: 0, hostWidth: 0, viewportWidth: 920 })).toBe("mobile");
    expect(resolveLayoutMode("auto", { rectWidth: 0, hostWidth: 0, viewportWidth: 1000 })).toBe("tablet");
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

  it("resolves layout profile classes without changing layout mode", () => {
    expect(resolveLayoutProfile({ width: 360, height: 700, layoutMode: "mobile" })).toMatchObject({
      layoutMode: "mobile",
      size: "xs",
      heightSize: "normal",
      aspect: "portrait",
      compact: true,
      classes: ["size-xs", "height-normal", "aspect-portrait", "profile-compact"],
    });
    expect(resolveLayoutProfile({ width: 920, height: 580, layoutMode: "tablet" })).toMatchObject({
      layoutMode: "tablet",
      size: "lg",
      heightSize: "short",
      aspect: "wide",
      tight: false,
      compact: true,
    });
    expect(resolveLayoutProfile({ width: 920, height: 520, layoutMode: "tablet" })).toMatchObject({
      heightSize: "short",
      tight: true,
      classes: ["size-lg", "height-short", "aspect-wide", "height-tight", "profile-compact"],
    });
    expect(resolveLayoutProfile({ width: 1280, height: 940, layoutMode: "tablet" })).toMatchObject({
      size: "xl",
      heightSize: "tall",
      aspect: "wide",
      roomy: true,
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

  it("detects panel fill and automatic compact recommendations", () => {
    expect(panelViewportFillEnabled({
      viewportHeight: 812,
      hostTop: 0,
      parentHeights: [812],
    })).toBe(true);
    expect(panelViewportFillEnabled({
      viewportHeight: 812,
      hostTop: 64,
      parentHeights: [812],
    })).toBe(false);

    expect(autoCompactRecommended({ width: 320, height: 900 })).toBe(true);
    expect(autoCompactRecommended({ width: 390, height: 760 })).toBe(false);
    expect(autoCompactRecommended({ width: 560, height: 580 })).toBe(true);
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
