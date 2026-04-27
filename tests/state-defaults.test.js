import { describe, expect, it } from "vitest";

import { createBaseBrowserState } from "../src/core/state/defaults.js";

describe("state defaults", () => {
  it("creates the expected browser state skeleton", () => {
    const state = createBaseBrowserState();

    expect(state.view).toBe("home");
    expect(state.queueItems).toEqual([]);
    expect(state.players).toEqual([]);
    expect(state.lang).toBe("auto");
    expect(state.cardTheme).toBe("auto");
    expect(state.controlRoomOpen).toBe(false);
    expect(state.controlRoomRenderSignature).toBe("");
  });

  it("returns a fresh object on every call", () => {
    const first = createBaseBrowserState();
    const second = createBaseBrowserState();

    first.players.push("media_player.office");

    expect(second.players).toEqual([]);
    expect(first).not.toBe(second);
  });
});
