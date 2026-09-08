// @vitest-environment jsdom
import { afterAll, describe, expect, it, vi } from "vitest";
import "../src/homeii-music-flow.js";
vi.hoisted(() => { vi.useFakeTimers(); });
afterAll(() => { vi.clearAllTimers(); vi.useRealTimers(); });
const prototype = globalThis.customElements.get("homeii-music-flow").prototype;
const state = () => ({ mobileSleepTimerEndsAt: Date.now() + 600000, mobileSleepTimerPlayer: "media_player.computer", mobileSleepTimerOrigin: "night" });
function context() {
  return {
    _state: state(), _homeiiEngineRequired: () => true, _homeiiEngineEnabled: () => true,
    _homeiiEngineTimeoutMs: () => 5000, _syncSleepTimerToHomeiiEngine: vi.fn(async () => true),
    _syncNightModeUi: vi.fn(), _syncSleepTimerChip: vi.fn(), _persistMobileAppearance: vi.fn(),
    _toastError: vi.fn(), _toast: vi.fn(), _m: (text) => text,
  };
}
describe("confirmed sleep timer persistence", () => {
  it("does not resurrect a timer removed from the authoritative Engine", async () => {
    const card = context();
    card._state.selectedPlayer = "media_player.computer";
    card._homeiiEngineGetTimers = vi.fn(async () => ({ timers: [] }));
    await prototype._hydrateSleepTimerFromHomeiiEngine.call(card);
    expect(card._state.mobileSleepTimerEndsAt).toBe(0);
    expect(card._syncSleepTimerToHomeiiEngine).not.toHaveBeenCalled();
  });
  it("does not interpret a failed timer read as an empty server list", async () => {
    const card = context();
    const before = { ...card._state };
    card._homeiiEngineGetTimers = vi.fn(async () => undefined);
    await prototype._hydrateSleepTimerFromHomeiiEngine.call(card);
    expect(card._state).toEqual(before);
  });
  it("rolls back an unconfirmed timer without persisting a false active timer", async () => {
    const card = context();
    const before = { ...card._state };
    card._syncSleepTimerToHomeiiEngine.mockResolvedValue(false);
    expect(await prototype._saveSleepTimerState.call(card, { mobileSleepTimerEndsAt: Date.now() + 1800000 }, 30, "night")).toBe(false);
    expect(card._state).toEqual(before);
    expect(card._persistMobileAppearance).not.toHaveBeenCalled();
  });
  it("restores state and unlocks controls after an unexpected persistence exception", async () => {
    const card = context();
    const before = { ...card._state };
    card._syncSleepTimerToHomeiiEngine.mockRejectedValue(new Error("offline"));
    await prototype._saveSleepTimerState.call(card, { mobileSleepTimerEndsAt: Date.now() + 1800000 }, 30, "night");
    expect(card._state).toEqual(before);
    expect(card._sleepTimerSavePending).toBe(false);
    expect(card._toastError).toHaveBeenCalledWith("offline");
  });
  it("persists the confirmed target", async () => {
    const card = context();
    const target = Date.now() + 1800000;
    expect(await prototype._saveSleepTimerState.call(card, { mobileSleepTimerEndsAt: target }, 30, "night")).toEqual({ ok: true, engineSaved: true });
    expect(card._state.mobileSleepTimerEndsAt).toBe(target);
    expect(card._persistMobileAppearance).toHaveBeenCalledOnce();
  });
  it("does not accept the old timer as confirmation of a changed deadline", async () => {
    const card = context();
    card._homeiiEngineGetTimers = vi.fn(async () => ({ timers: [{ id: "sleep_computer", player: "media_player.computer", ends_at: new Date(Date.now() + 600000).toISOString() }] }));
    expect(await prototype._confirmSleepTimerInHomeiiEngine.call(card, "sleep_computer", "media_player.computer", Date.now() + 1800000)).toBe(false);
  });
  it("keeps the displayed timer when cancellation is not confirmed", async () => {
    const card = context();
    const before = { ...card._state };
    card._deleteSleepTimerFromHomeiiEngine = vi.fn(async () => false);
    expect(await prototype._clearSleepTimer.call(card, true)).toBe(false);
    expect(card._state).toEqual(before);
    expect(card._toast).not.toHaveBeenCalled();
  });
});
