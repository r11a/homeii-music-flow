import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("language option wiring", () => {
  const source = fs.readFileSync(
    path.resolve(process.cwd(), "src/homeii-music-flow.js"),
    "utf8"
  );

  it("includes zh-CN in runtime language settings", () => {
    expect(source).toContain('"zh-CN"');
    expect(source).toContain('data-setting-lang');
    expect(source).toContain('_languageShortLabel()');
  });

  it("keeps the editor height field and general language selector wired", () => {
    expect(source).toContain('{ name: "height", selector: { number: { min: 360, max: 1400, step: 10, mode: "box" } } }');
    expect(source).toContain('{ name: "height", selector: { number: { min: 480, max: 1400, step: 10, mode: "box" } } }');
    expect(source).toContain('height: he ? "גובה הכרטיס" : "Card height"');
    expect(source).toContain('{ value: "zh-CN", label: pickEditorText(language, "Simplified Chinese", "סינית פשוטה") }');
  });
});
