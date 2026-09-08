// @vitest-environment jsdom
import { afterAll, describe, expect, it, vi } from "vitest";
import "../src/homeii-music-flow.js";
import { toggleQueueCrossfade } from "../src/core/media/queue-options.js";
vi.hoisted(() => { vi.useFakeTimers(); });
afterAll(() => { vi.clearAllTimers(); vi.useRealTimers(); });
const prototype = globalThis.customElements.get("homeii-music-flow").prototype;
function context() {
  return {
    _state: { selectedPlayer: "computer", engineCapabilities: { queue_autoplay: true }, maQueueState: { queue_id: "queue", autoplay_enabled: false }, menuOpen: true },
    _renderMobileMenu: vi.fn(async () => {}), _callHomeiiEnginePlayerCommand: vi.fn(async () => {}),
    _ensureQueueSnapshot: vi.fn(async () => {}), _toastError: vi.fn(), _mediaControlFailureMessage: (e) => e.message,
    _esc: (v) => v, _m: (v) => v, _iconSvg: () => '<svg></svg>', _mobileFooterMode: () => "icon",
  };
}
describe("queue Autoplay", () => {
  it("mounts queue actions only for the expanded row and removes them on collapse", () => {
    const body = globalThis.document.createElement("div");
    body.innerHTML = '<div class="queue-row" data-queue-item-id="a" data-queue-position="1"><button data-queue-menu="a"></button></div>';
    const card = { _state: {}, $: () => body, _getNowPlayingQueueItems: () => [{ key: "a" }], _getQueueItemKey: (item) => item.key, _renderQueueInlineActions: () => '<div class="queue-inline-actions"><select><option>1</option></select></div>' };
    prototype._setQueueInlineActionsExpanded.call(card, "a");
    expect(body.querySelectorAll("select")).toHaveLength(1);
    prototype._setQueueInlineActionsExpanded.call(card, "a");
    expect(body.querySelectorAll("select")).toHaveLength(1);
    prototype._setQueueInlineActionsExpanded.call(card, "");
    expect(body.querySelector("select")).toBe(null);
    expect(body.querySelector("button").getAttribute("aria-expanded")).toBe("false");
  });
  it("confirms crossfade through the Engine before refreshing the selected queue", async () => {
    const card = context();
    card._state.engineCapabilities.music_assistant_command_bridge = true;
    card._state.maQueueState.crossfade_enabled = false;
    card._callEngineMaCommand = vi.fn(async (command) => command.endsWith("/get") ? { crossfade_enabled: true } : null);
    await toggleQueueCrossfade.call(card);
    expect(card._callEngineMaCommand).toHaveBeenCalledWith("player_queues/crossfade", { queue_id: "queue", crossfade_enabled: true });
    expect(card._ensureQueueSnapshot).toHaveBeenCalledWith(true);
    expect(card._state.maQueueState.crossfade_enabled).toBe(false);
    expect(card._crossfadePendingPlayer).toBe(null);
    expect(card._toastError).not.toHaveBeenCalled();
  });
  it("reports an unconfirmed crossfade and never retries the mutation", async () => {
    const card = context();
    card._state.engineCapabilities.music_assistant_command_bridge = true;
    card._state.maQueueState.crossfade_enabled = false;
    card._callEngineMaCommand = vi.fn(async () => null);
    await toggleQueueCrossfade.call(card);
    expect(card._toastError).toHaveBeenCalledOnce();
    expect(card._callEngineMaCommand.mock.calls.filter(([command]) => command.endsWith("/crossfade"))).toHaveLength(1);
    expect(card._state.maQueueState.crossfade_enabled).toBe(false);
  });
  it("requests the target value once and reads authoritative state without fabricating it", async () => {
    const card = context();
    await prototype._toggleQueueAutoplay.call(card);
    expect(card._callHomeiiEnginePlayerCommand).toHaveBeenCalledExactlyOnceWith("computer", "autoplay", { autoplay_enabled: true });
    expect(card._ensureQueueSnapshot).toHaveBeenCalledWith(true);
    expect(card._state.maQueueState.autoplay_enabled).toBe(false);
    expect(card._autoplayPendingPlayer).toBe(null);
  });
  it("keeps state unchanged and reports command failures", async () => {
    const card = context();
    card._callHomeiiEnginePlayerCommand.mockRejectedValue(new Error("offline"));
    await prototype._toggleQueueAutoplay.call(card);
    expect(card._toastError).toHaveBeenCalledWith("offline");
    expect(card._state.maQueueState.autoplay_enabled).toBe(false);
  });
  it("does not refresh a newly selected player's queue using the previous action", async () => {
    const card = context();
    card._callHomeiiEnginePlayerCommand.mockImplementation(async () => { card._state.selectedPlayer = "kitchen"; });
    await prototype._toggleQueueAutoplay.call(card);
    expect(card._ensureQueueSnapshot).not.toHaveBeenCalled();
  });
  it("renders an accessible icon by default and labels only when enabled", () => {
    const card = context();
    const html = prototype._queuePlaybackOptionsHtml.call(card);
    expect(html).toContain('aria-label="Autoplay: continue with similar music"');
    expect(html).not.toContain('<span>');
    card._mobileFooterMode = () => "both";
    expect(prototype._queuePlaybackOptionsHtml.call(card)).toContain('<span>Autoplay</span>');
    card._state.engineCapabilities.queue_autoplay = false;
    expect(prototype._queuePlaybackOptionsHtml.call(card)).toBe("");
  });
});
