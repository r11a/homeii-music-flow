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
  it("stops, disconnects and clears all queues through the existing clean-all action", async () => {
    const player={entity_id:'computer'};
    const card={_state:{players:[player],selectedPlayer:'computer'},_activePlaybackPlayers:()=>[player],_groupedPlayerIds:()=>[],_isStopClearTarget:()=>true,_isLocalSendspinDesired:()=>false,
      _hapticTap:vi.fn(),_disconnectPlayerGroups:vi.fn(async()=>({ok:true,failed:false})),_stopPlayer:vi.fn(async()=>{}),_clearQueueForPlayer:vi.fn(async()=>{}),_clearLocalPlaybackStateForPlayers:vi.fn(),
      _toastError:vi.fn(),_toastSuccess:vi.fn(),_i18n:s=>s,_m:s=>s,_syncNowPlayingUI:vi.fn(),_updateNowPlayingState:vi.fn()};
    await prototype._stopAllPlayers.call(card);
    expect(card._stopPlayer).toHaveBeenCalledWith('computer');
    expect(card._disconnectPlayerGroups).toHaveBeenCalledOnce();
    expect(card._clearQueueForPlayer).toHaveBeenCalledOnce();
    expect(card._clearLocalPlaybackStateForPlayers).toHaveBeenCalledOnce();
  });
  it("honors a second toggle while the first mute command is waiting", async () => {
    let resolveFirst;
    const command=vi.fn().mockImplementationOnce(()=>new Promise(resolve=>{resolveFirst=resolve;})).mockResolvedValue(undefined);
    const card=context(command);
    card._getSelectedPlayer=()=>card._playerByEntityId();card._isMuted=()=>false;
    card._setPlayerMutedFor=(...args)=>prototype._setPlayerMutedFor.apply(card,args);
    const first=prototype._toggleMute.call(card);
    const second=prototype._toggleMute.call(card);
    expect(command).toHaveBeenCalledTimes(1);
    resolveFirst();await Promise.all([first,second]);
    expect(command.mock.calls.map(args=>args[2].is_volume_muted)).toEqual([true,false]);
    expect(card._muteTargetsByPlayer.size).toBe(0);
  });
  it("does not restore an outdated volume when mute completes", async () => {
    let finish;const card=context(vi.fn(()=>new Promise(resolve=>{finish=resolve;})));
    const player={entity_id:'computer',attributes:{volume_level:.49}};card._playerByEntityId=()=>player;
    const pending=prototype._setPlayerMutedFor.call(card,'computer',true);
    player.attributes.volume_level=.2;finish();await pending;
    expect(card._setPlayerVolumeOptimistic).toHaveBeenLastCalledWith('computer',.2,true);
  });
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

it('keeps confirmed queue modes when player fields are stale', () => {
 const card={_state:{selectedPlayer:'center',maQueueState:{queue_id:'q',shuffle_enabled:true,repeat_mode:'all'}},_playerByEntityId:()=>({entity_id:'center',attributes:{active_queue:'q',shuffle:false,repeat:'off'}}),_applyOptimisticPlayerVolumeState:p=>p};
 const player=prototype._getSelectedPlayer.call(card);
 expect(player.attributes.shuffle).toBe(true);expect(player.attributes.repeat).toBe('all');
 card._state.maQueueState.queue_id='another-player';
 expect(prototype._getSelectedPlayer.call(card).attributes.shuffle).toBe(false);
});
