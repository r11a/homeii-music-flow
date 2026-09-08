// @vitest-environment jsdom
import { afterAll, describe, expect, it, vi } from "vitest";
import "../src/homeii-music-flow.js";
vi.hoisted(() => { vi.useFakeTimers(); });
afterAll(() => { vi.clearAllTimers(); vi.useRealTimers(); });

const prototype = globalThis.customElements.get("homeii-music-flow").prototype;
function context(command = vi.fn(async () => {})) {
  return {
    _playerByEntityId: () => ({ entity_id: "computer", attributes: { volume_level: 0.49 } }),
    _callHomeiiEnginePlayerCommand: command,
    _setPlayerVolumeOptimistic: vi.fn(), _optimisticMuteByPlayer: new Map(), _softMutedPlayers: new Set(),
    _schedulePlayerStateRefresh: vi.fn(), _toastError: vi.fn(), _mediaControlFailureMessage: (e) => e.message,
  };
}
describe("consistent player mute", () => {
  function volumeContext(failUnmute = false) {
    const player = { entity_id: "computer", attributes: { volume_level: .49, is_volume_muted: true } };
    const card = context();
    card._playerByEntityId = () => player;
    card._isMuted = (item) => item.attributes.is_volume_muted;
    card._optimisticVolumeByPlayer = new Map();
    card._loadPlayers = vi.fn(); card._syncNowPlayingUI = vi.fn();
    card._callHomeiiEnginePlayerCommand = vi.fn(async (_, command) => {
      if (command === "volume_mute" && failUnmute) throw new Error("unmute failed");
    });
    return card;
  }
  it("sets a positive volume before unmuting and only then updates the mute icon", async () => {
    const card = volumeContext();
    const result = prototype._setPlayerVolumeFor.call(card, "computer", .2);
    await vi.runAllTimersAsync();
    expect(await result).toBe(true);
    expect(card._callHomeiiEnginePlayerCommand.mock.calls).toEqual([
      ["computer", "volume", { volume_level: .2 }],
      ["computer", "volume_mute", { is_volume_muted: false }],
    ]);
    expect(card._setPlayerVolumeOptimistic).toHaveBeenLastCalledWith("computer", .2, false);
  });
  it("keeps zero-volume changes muted", async () => {
    const card = volumeContext();
    const result = prototype._setPlayerVolumeFor.call(card, "computer", 0);
    await vi.runAllTimersAsync();
    expect(await result).toBe(true);
    expect(card._callHomeiiEnginePlayerCommand).toHaveBeenCalledExactlyOnceWith("computer", "volume", { volume_level: 0 });
  });
  it("reports unmute failure without showing the player as unmuted", async () => {
    const card = volumeContext(true);
    const result = prototype._setPlayerVolumeFor.call(card, "computer", .2);
    await vi.runAllTimersAsync();
    expect(await result).toBe(false);
    expect(card._toastError).toHaveBeenCalledWith("unmute failed");
    expect(card._setPlayerVolumeOptimistic.mock.calls.some((args) => args[2] === false)).toBe(false);
  });
  it("reports partial batch failures without replaying successful actions", async () => {
    const card = context();
    card._controlRoomPlayerName = (id) => id;
    const action = vi.fn(async (id) => { if (id === "offline") throw new Error("offline"); return true; });
    card._m = (english) => english;
    await expect(prototype._runControlRoomPlayerBatch.call(card, ["computer", "offline"], action)).resolves.toBe(false);
    expect(action).toHaveBeenCalledTimes(2);
    expect(card._toastError).toHaveBeenCalledWith("The action failed for: offline");
  });
  it("sends one mute command and preserves the volume", async () => {
    const card = context();
    await expect(prototype._setPlayerMutedFor.call(card, "computer", true)).resolves.toBe(true);
    expect(card._callHomeiiEnginePlayerCommand).toHaveBeenCalledExactlyOnceWith("computer", "volume_mute", { is_volume_muted: true });
    expect(card._setPlayerVolumeOptimistic).toHaveBeenCalledWith("computer", 0.49, true);
  });
  it("does not fabricate muted state or zero the volume on failure", async () => {
    const card = context(vi.fn(async () => { throw new Error("unsupported"); }));
    await expect(prototype._setPlayerMutedFor.call(card, "computer", true)).resolves.toBe(false);
    expect(card._setPlayerVolumeOptimistic).not.toHaveBeenCalled();
    expect(card._toastError).toHaveBeenCalledWith("unsupported");
    expect(card._schedulePlayerStateRefresh).toHaveBeenCalledWith(0);
  });
  it("coalesces repeated activation while the first command is pending", async () => {
    let complete;
    const card = context(vi.fn(() => new Promise((resolve) => { complete = resolve; })));
    const first = prototype._setPlayerMutedFor.call(card, "computer", true);
    const second = prototype._setPlayerMutedFor.call(card, "computer", true);
    expect(card._callHomeiiEnginePlayerCommand).toHaveBeenCalledOnce();
    expect(card._setPlayerVolumeOptimistic).not.toHaveBeenCalled();
    complete();
    await Promise.all([first, second]);
    expect(card._muteRequestsByPlayer.size).toBe(0);
  });
});
