const TABLET_BREAKPOINT = 900;

function normalizeLayoutMode(value) {
  const normalized = String(value || "auto").trim().toLowerCase();
  return normalized === "mobile" || normalized === "tablet" ? normalized : "auto";
}

export function resolveLayoutMode(layoutMode, {
  rectWidth = 0,
  hostWidth = 0,
  viewportWidth = 0,
} = {}, tabletBreakpoint = TABLET_BREAKPOINT) {
  const normalized = normalizeLayoutMode(layoutMode);
  if (normalized === "mobile" || normalized === "tablet") return normalized;
  const width = Math.max(
    Number(rectWidth || 0),
    Number(hostWidth || 0),
    Number(viewportWidth || 0),
  );
  return width >= tabletBreakpoint ? "tablet" : "mobile";
}

export function defaultMobileMediaLayout(layoutMode) {
  return layoutMode === "tablet" ? "grid" : "list";
}

export function tabletAutoFitEnabled(layoutMode) {
  return layoutMode === "tablet";
}

export function tabletAutoFitDense(layoutMode, {
  showNightRow = false,
  showUpNext = false,
} = {}) {
  return tabletAutoFitEnabled(layoutMode) && !!(showNightRow || showUpNext);
}

export function resolveTabletAutoFitFlags(layoutMode, {
  showNightRow = false,
  showUpNext = false,
} = {}) {
  const autoFit = tabletAutoFitEnabled(layoutMode);
  return {
    autoFit,
    showNight: autoFit && !!showNightRow,
    showUpNext: autoFit && !!showUpNext,
    dense: autoFit && !!(showNightRow || showUpNext),
  };
}

export function tabletStabilityModeEnabled({
  layoutMode = "mobile",
  userAgent = "",
  width = 0,
  touchPoints = 0,
} = {}, tabletBreakpoint = TABLET_BREAKPOINT) {
  return layoutMode === "tablet"
    && /Android/i.test(String(userAgent || ""))
    && Number(width || 0) >= tabletBreakpoint
    && Number(touchPoints || 0) > 0;
}

export function detectKeyboardLikeResize({
  editingText = false,
  widthDelta = 0,
  heightDelta = 0,
} = {}) {
  return !!editingText && (
    (Number(widthDelta || 0) < 120 && Number(heightDelta || 0) > 18)
    || (Number(widthDelta || 0) < 8 && Number(heightDelta || 0) > 0)
  );
}

export function resolveResizeStrategy({
  previousWidth = 0,
  currentWidth = 0,
  previousHeight = 0,
  currentHeight = 0,
  editingText = false,
  tabletStabilityMode = false,
} = {}, tabletBreakpoint = TABLET_BREAKPOINT) {
  const widthDelta = Math.abs(Number(currentWidth || 0) - Number(previousWidth || 0));
  const heightDelta = Math.abs(Number(currentHeight || 0) - Number(previousHeight || 0));
  const keyboardLikeResize = detectKeyboardLikeResize({
    editingText,
    widthDelta,
    heightDelta,
  });
  const previousTablet = Number(previousWidth || 0) >= tabletBreakpoint;
  const currentTablet = Number(currentWidth || 0) >= tabletBreakpoint;
  const widthThreshold = tabletStabilityMode ? 140 : 48;
  const heightThreshold = tabletStabilityMode ? 180 : 48;
  const softSync = !keyboardLikeResize
    && previousTablet === currentTablet
    && widthDelta < widthThreshold
    && heightDelta < heightThreshold;

  return {
    widthDelta,
    heightDelta,
    keyboardLikeResize,
    previousTablet,
    currentTablet,
    widthThreshold,
    heightThreshold,
    softSync,
  };
}
