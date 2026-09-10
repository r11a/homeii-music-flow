// @vitest-environment jsdom
import { afterAll, describe, expect, it, vi } from "vitest";
import "../src/homeii-music-flow.js";
vi.hoisted(() => { vi.useFakeTimers(); });
afterAll(() => { vi.clearAllTimers(); vi.useRealTimers(); });
const prototype = globalThis.customElements.get("homeii-music-flow").prototype;
function context() {
  return {
    _state: { mobileAnnouncementText: "Test" },
    _announcementTargetValue: () => "all",
    _announcementEligiblePlayers: () => ["Computer", "Kitchen"].map((name) => ({ entity_id: name, attributes: { friendly_name: name } })),
    _hapticTap: vi.fn(), _i18n: (key, data) => `${key} ${JSON.stringify(data || {})}`,
    _m: (text) => text, _announcementLanguageCode: () => "en", _announcementTtsEntity: () => "tts.test",
    _announcementVolumePct: () => 20, _toast: vi.fn(), _toastError: vi.fn(), _toastSuccess: vi.fn(),
    _prepareAnnouncementVolumes: (targets) => targets.map((player) => ({ entityId: player.entity_id, targetVolumePct: 40 })),
    _scheduleAnnouncementVolumeRestore: vi.fn(),
    _homeiiEngineAnnounce: vi.fn(async () => ({ ok: true, results: [{ player: "Computer", ok: true }, { player: "Kitchen", ok: true }] })),
  };
}
describe("truthful announcement dispatch", () => {
  it("passes each player's boosted volume to MA without changing its normal volume", async () => {
    const card = context();
    card._prepareAnnouncementVolumes = () => [{ entityId: "Computer", targetVolumePct: 45 }, { entityId: "Kitchen", targetVolumePct: 70 }];
    await prototype._sendMobileAnnouncement.call(card);
    expect(card._homeiiEngineAnnounce).toHaveBeenCalledWith(expect.objectContaining({ players: ["Computer"], volume: 45 }));
    expect(card._homeiiEngineAnnounce).toHaveBeenCalledWith(expect.objectContaining({ players: ["Kitchen"], volume: 70 }));
    expect(card._scheduleAnnouncementVolumeRestore).not.toHaveBeenCalled();
  });
  it("lets MA restore audio without a browser volume timer", async () => {
    const card = context();
    await prototype._sendMobileAnnouncement.call(card);
    expect(card._toastSuccess).toHaveBeenCalledOnce();
    expect(card._scheduleAnnouncementVolumeRestore).not.toHaveBeenCalled();
    expect(card._announcementSendPending).toBe(false);
  });
  it("does not announce success when only one target accepted the request", async () => {
    const card = context();
    card._homeiiEngineAnnounce.mockResolvedValue({ ok: true, sent: true, results: [{ player: "Computer", ok: true }, { player: "Kitchen", ok: false }] });
    await prototype._sendMobileAnnouncement.call(card);
    expect(card._toastSuccess).not.toHaveBeenCalled();
    expect(card._toastError).toHaveBeenCalledWith(expect.stringContaining("Kitchen"));
  });
  it("rejects an empty acknowledgement", async () => {
    const card = context();
    card._homeiiEngineAnnounce.mockResolvedValue({});
    await prototype._sendMobileAnnouncement.call(card);
    expect(card._toastSuccess).not.toHaveBeenCalled();
    expect(card._toastError).toHaveBeenCalledOnce();
  });
  it("suppresses duplicate dispatch while a request is pending and allows retry after failure", async () => {
    const card = context();
    let reject;
    card._homeiiEngineAnnounce.mockImplementationOnce(() => new Promise((_, fail) => { reject = fail; }));
    const first = prototype._sendMobileAnnouncement.call(card);
    await prototype._sendMobileAnnouncement.call(card);
    expect(card._homeiiEngineAnnounce).toHaveBeenCalledOnce();
    reject(new Error("Connection lost"));
    await first;
    await prototype._sendMobileAnnouncement.call(card);
    expect(card._homeiiEngineAnnounce).toHaveBeenCalledTimes(2);
  });
});
