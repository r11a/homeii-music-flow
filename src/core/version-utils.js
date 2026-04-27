const VERSION_PATTERN = /const HOMEII_CARD_VERSION = "([^"]+)";/;

export function extractCardVersion(sourceText) {
  const match = VERSION_PATTERN.exec(String(sourceText || ""));
  if (!match?.[1]) {
    throw new Error("Unable to locate HOMEII_CARD_VERSION in source.");
  }
  return match[1];
}
