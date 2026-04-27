const VERSION_PATTERN = /const HOMEII_CARD_VERSION = "([^"]+)";/;

export function extractCardVersion(sourceText) {
  const match = VERSION_PATTERN.exec(String(sourceText || ""));
  if (!match?.[1]) {
    throw new Error("Unable to locate HOMEII_CARD_VERSION in source.");
  }
  return match[1];
}

export function formatVersionedBuildFilename(version) {
  if (!version || typeof version !== "string") {
    throw new Error("version must be a non-empty string");
  }
  return `ma-browser-card-mobile-v${version}.js`;
}
