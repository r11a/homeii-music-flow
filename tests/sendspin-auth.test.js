// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import "../src/homeii-music-flow.js";
vi.hoisted(() => { vi.useFakeTimers(); });

const prototype = globalThis.customElements.get("homeii-music-flow").prototype;
const originalSocket = globalThis.window.WebSocket;
let socket;
class FakeSocket {
  constructor(url) { this.url = url; this.send = vi.fn(); this.close = vi.fn(); socket = this; }
}
afterEach(() => { globalThis.window.WebSocket = originalSocket; vi.clearAllTimers(); vi.useRealTimers(); });

function context(bridge = true) {
  globalThis.window.WebSocket = FakeSocket;
  return {
    _state: { engineCapabilities: { sendspin_bridge: bridge } },
    _hass: { hassUrl: () => "https://home.example/" },
    _callHomeAssistantWs: vi.fn(async () => ({ path: "/api/homeii_flow/sendspin/device?authSig=short-lived" })),
    _localSendspinWsUrl: () => "ws://ma.example/sendspin",
    _maToken: "test-ma-token",
    _debugLog: vi.fn(), _localText: (english) => english,
  };
}

describe("Sendspin authenticated transport", () => {
  it("uses the signed HA path and waits for explicit auth_ok without sending MA credentials", async () => {
    const card = context();
    const pending = prototype._openAuthenticatedSendspinSocket.call(card, "device");
    await Promise.resolve();
    socket.onopen();
    expect(socket.url).toBe("wss://home.example/api/homeii_flow/sendspin/device?authSig=short-lived");
    expect(card._callHomeAssistantWs).toHaveBeenCalledWith({ type: "auth/sign_path", path: "/api/homeii_flow/sendspin/device", expires: 30 });
    expect(socket.send).not.toHaveBeenCalled();
    let resolved = false;
    pending.then(() => { resolved = true; });
    socket.onmessage({ data: '{"type":"unrelated"}' });
    await Promise.resolve();
    expect(resolved).toBe(false);
    socket.onmessage({ data: '{"type":"auth_ok"}' });
    await expect(pending).resolves.toBe(socket);
    expect(JSON.stringify(card._debugLog.mock.calls)).not.toContain("short-lived");
  });

  it("rejects failed authentication and closes the socket", async () => {
    const pending = prototype._openAuthenticatedSendspinSocket.call(context(), "device");
    const rejected = expect(pending).rejects.toThrow("rejected");
    await Promise.resolve();
    socket.onmessage({ data: '{"type":"auth_invalid"}' });
    await rejected;
    expect(socket.close).toHaveBeenCalledOnce();
  });

  it("preserves direct MA authentication when the Engine has no bridge", async () => {
    const pending = prototype._openAuthenticatedSendspinSocket.call(context(false), "device");
    socket.onopen();
    expect(JSON.parse(socket.send.mock.calls[0][0])).toEqual({ type: "auth", token: "test-ma-token", client_id: "device" });
    socket.onmessage({ data: '{"type":"auth_ok"}' });
    await pending;
  });

  it("closes an unacknowledged connection on timeout", async () => {
    vi.useFakeTimers();
    const pending = prototype._openAuthenticatedSendspinSocket.call(context(), "device");
    const rejected = expect(pending).rejects.toThrow("Timed out");
    await Promise.resolve();
    await vi.advanceTimersByTimeAsync(10000);
    await rejected;
    expect(socket.close).toHaveBeenCalledOnce();
  });
});

describe("this-device foreground selection", () => {
  it("selects the connected local player manually and closes the menu", () => {
    const player = { entity_id: "media_player.local" };
    const card = {
      _state: { players: [player], selectedPlayer: "media_player.computer" },
      _adoptLocalSendspinGlobalSession: vi.fn(), _localSendspinConnected: true,
      _getThisDevicePlayer: () => player, _isLocalSendspinPlayer: () => true,
      _isAvailableThisDevicePlayer: () => true,
      _selectPlayer: vi.fn((id) => { card._state.selectedPlayer = id; }),
      _revealControlRoomThisDevicePlayer: vi.fn(), _closeMobileMenu: vi.fn(),
    };
    expect(prototype._focusConnectedThisDevicePlayer.call(card)).toBe(true);
    expect(card._selectPlayer).toHaveBeenCalledWith(player.entity_id, true);
    expect(card._closeMobileMenu).toHaveBeenCalledOnce();
  });
  it("does not change selection before the local connection is ready", () => {
    const card = { _adoptLocalSendspinGlobalSession: vi.fn(), _localSendspinConnected:false, _selectPlayer:vi.fn() };
    expect(prototype._focusConnectedThisDevicePlayer.call(card)).toBe(false);
    expect(card._selectPlayer).not.toHaveBeenCalled();
  });
});
