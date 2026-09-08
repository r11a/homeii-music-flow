// @vitest-environment jsdom
import { afterAll, describe, expect, it, vi } from "vitest";
import "../src/homeii-music-flow.js";
vi.hoisted(() => { vi.useFakeTimers(); });
afterAll(() => { vi.clearAllTimers(); vi.useRealTimers(); });
const prototype = globalThis.customElements.get("homeii-music-flow").prototype;
describe("screensaver inactivity delay", () => {
  it("uses the configured delay when no explicit override is supplied", async () => {
    const card={_screensaverSuppressedByEditor:()=>false,_screensaverEnabled:()=>true,isConnected:true,
      _screensaverTimeoutSeconds:()=>30,_showScreensaver:vi.fn()};
    prototype._resetScreensaverTimer.call(card);
    await vi.advanceTimersByTimeAsync(500);
    expect(card._showScreensaver).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(29500);
    expect(card._showScreensaver).toHaveBeenCalledOnce();
  });
});
describe("group disconnect failure", () => {
  it("retains cached players for display but rejects them as command confirmation", async () => {
    const card=new (globalThis.customElements.get("homeii-music-flow"))();
    const cached=[{entity_id:'media_player.computer',state:'idle'}];
    card._state.enginePlayers=cached; card._state.engineAvailable=true;
    card._homeiiEngineRequired=()=>true;
    card._homeiiEngineGetPlayers=vi.fn(async()=>{throw new Error('Offline');});
    expect(await card._refreshEnginePlayers()).toBe(cached);
    await expect(card._refreshEnginePlayers({requireFresh:true})).rejects.toThrow('Offline');
    expect(card._state.enginePlayers).toBe(cached);
  });
  it("hides disconnected players and restores choices when they become available", () => {
    const card = new (globalThis.customElements.get("homeii-music-flow"))();
    card._state.selectedPlayer="media_player.computer";
    card._state.players=[
      {entity_id:"media_player.computer",state:"idle",attributes:{friendly_name:"Computer",group_members:["media_player.computer","media_player.kitchen"]}},
      {entity_id:"media_player.kitchen",state:"unavailable",attributes:{friendly_name:"Kitchen"}},
      {entity_id:"media_player.offline",state:"unavailable",attributes:{friendly_name:"Offline"}},
    ];
    const host=globalThis.document.createElement("div"); host.innerHTML=card._groupMenuHtml();
    expect(host.querySelector('[data-menu-group-player="media_player.offline"]')).toBeNull();
    expect(host.querySelector('[data-menu-group-player="media_player.kitchen"]')).toBeNull();
    expect(card._currentSpeakerGroupMemberIds()).toContain("media_player.kitchen");
    card._state.players[1].state="idle";
    host.innerHTML=card._groupMenuHtml();
    expect(host.querySelector('[data-menu-group-player="media_player.kitchen"]').disabled).toBe(false);
  });
  it("fetches fresh Engine membership before confirming a group", async () => {
    let members=["leader"];
    const card={_hass:{states:{}},_homeiiEngineRequired:()=>true,_loadPlayers:vi.fn(),
      _refreshEnginePlayers:vi.fn(async()=>{members=["leader","child"];}),
      _currentSpeakerGroupMemberIds:()=>members,_sameSpeakerGroupMembers:prototype._sameSpeakerGroupMembers};
    const result=await prototype._waitForSpeakerGroupConfirmation.call(card,"leader",["leader","child"]);
    expect(card._refreshEnginePlayers).toHaveBeenCalledWith({force:true,requireFresh:true}); expect(result.ok).toBe(true);
  });
  it("does not confirm cached membership when the server refresh fails", async () => {
    const card={_hass:{states:{}},_homeiiEngineRequired:()=>true,_loadPlayers:vi.fn(),
      _refreshEnginePlayers:vi.fn(async()=>{throw new Error('Offline');}),
      _currentSpeakerGroupMemberIds:()=>['leader','child'],_sameSpeakerGroupMembers:prototype._sameSpeakerGroupMembers};
    const pending=prototype._waitForSpeakerGroupConfirmation.call(card,'leader',['leader','child'],{timeoutMs:700,intervalMs:350});
    await vi.advanceTimersByTimeAsync(700);
    expect((await pending).ok).toBe(false);
  });
  it("does not replay a failed Engine group mutation through a second command path", async () => {
    const card={_state:{engineAvailable:true},_groupSelectionDelta:()=>({owner:"leader",current:[],desired:["child"],added:["child"],removed:[]}),
      _homeiiEngineEnabled:()=>true,_homeiiEngineRequired:()=>true,_homeiiEngineApplyGroup:vi.fn(async()=>{throw new Error("Group rejected");}),_callHaMediaPlayerService:vi.fn()};
    await expect(prototype._applySpeakerGroupFor.call(card,"leader",["child"])).rejects.toThrow("Group rejected");
    expect(card._callHaMediaPlayerService).not.toHaveBeenCalled();
  });
  it.each([false, true])("does not erase confirmed group state after rejected unjoin (static=%s)", async (isStatic) => {
    const players = ["leader", "child"].map((entity_id) => ({ entity_id, attributes: { friendly_name: entity_id } }));
    const card = {
      _state: { players }, _currentSpeakerGroupOwnerId: () => "leader",
      _playerByEntityId: (id) => players.find((player) => player.entity_id === id),
      _isStaticGroupPlayer: (player) => isStatic && player.entity_id === "leader",
      _playerGroupMemberIds: () => ["leader", "child"],
      _currentSpeakerGroupChildIds: () => ["child"],
      _currentSpeakerGroupMemberIds: () => ["leader", "child"],
      _callHaMediaPlayerService: vi.fn(async () => { throw new Error("Offline"); }),
      _clearLocalGroupState: vi.fn(), _m: (text) => text,
    };
    await expect(prototype._clearSpeakerGroupFor.call(card, "leader")).rejects.toThrow("child");
    expect(card._clearLocalGroupState).not.toHaveBeenCalled();
  });
});
