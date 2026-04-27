import { describe, expect, it } from "vitest";

import { extractCardVersion } from "../src/core/version-utils.js";

describe("version utils", () => {
  it("extracts the runtime version from source text", () => {
    const version = extractCardVersion('const HOMEII_CARD_VERSION = "4.9.0";');
    expect(version).toBe("4.9.0");
  });

  it("throws when the version constant is missing", () => {
    expect(() => extractCardVersion("const SOMETHING_ELSE = true;")).toThrow(
      "Unable to locate HOMEII_CARD_VERSION in source."
    );
  });
});
