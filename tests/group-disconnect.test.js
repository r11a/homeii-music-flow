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
  it("removes the child volume wheel when leaving its group screen", () => {
    const root = globalThis.document.createElement("div");
    root.innerHTML = '<section class="volume-wheel-popover"></section>';
    const card = {_state: {menuOpen:true, menuPage:"group_volume"}, shadowRoot:root,
      $:()=>null, _shortenManualFrontPlayerHold:()=>{}, _manualFrontDefaultHoldMs:()=>0,
      _closeMobileQueueActionMenu:()=>{}, _closeSmartVoiceConfirm:()=>{}, _syncCompactMenuOverlayState:()=>{}};
    prototype._closeMobileMenu.call(card);
    expect(root.querySelector(".volume-wheel-popover")).toBeNull();
    expect(card._state.menuOpen).toBe(false);
  });
  it("settles all group volume writes and reports only failed players", async () => {
    const players=[{entity_id:'leader'},{entity_id:'child'}];
    let finish;
    const card={_state:{players},_playerGroupMemberIds:()=>['leader','child','child'],
      _isStaticGroupPlayer:()=>false,
      _setPlayerVolumeFor:vi.fn(id=>id==='leader'?new Promise(resolve=>{finish=resolve;}):Promise.reject(new Error('Offline'))),
      _controlRoomPlayerName:id=>id,_toastError:vi.fn(),_m:en=>en,_schedulePlayerStateRefresh:vi.fn()};
    card._runControlRoomPlayerBatch=(ids,action)=>prototype._runControlRoomPlayerBatch.call(card,ids,action);
    const pending=prototype._setGroupVolumeFor.call(card,'leader',0.3);
    expect(card._setPlayerVolumeFor).toHaveBeenCalledTimes(2);
    expect(card._toastError).not.toHaveBeenCalled();
    finish(true);
    expect(await pending).toBe(false);
    expect(card._toastError).toHaveBeenCalledWith('The action failed for: child');
    expect(card._schedulePlayerStateRefresh).toHaveBeenCalledWith(0);
  });
  it("opens group volume directly rather than group membership", () => {
    const card={_getSelectedPlayer:()=>({entity_id:'leader'}),_selectedSpeakerGroupCount:()=>2,_openMobileMenu:vi.fn()};
    prototype._openGroupVolumeShortcut.call(card);
    expect(card._openMobileMenu).toHaveBeenCalledWith('group_volume');
  });
  it("disconnects an unavailable follower through its reachable leader", async () => {
    const leader={entity_id:'leader'},child={entity_id:'child',state:'unavailable'};
    const card={_state:{players:[leader,child]},_currentSpeakerGroupOwnerId:()=> 'leader',
      _playerByEntityId:id=>id==='leader'?leader:child,_isStaticGroupPlayer:()=>false,
      _currentSpeakerGroupMemberIds:()=>['leader','child'],_homeiiEngineEnabled:()=>true,
      _homeiiEngineApplyGroup:vi.fn(async()=>{}),_callHaMediaPlayerService:vi.fn(),
      _waitForSpeakerGroupConfirmation:vi.fn(async()=>({ok:true})),_clearLocalGroupState:vi.fn(),
      _loadPlayers:vi.fn(),_refreshGroupingState:vi.fn()};
    expect(await prototype._clearSpeakerGroupFor.call(card,'leader')).toBe(true);
    expect(card._homeiiEngineApplyGroup).toHaveBeenCalledWith({owner:'leader',entity_id:'leader',members:[],remove_members:['child']});
    expect(card._callHaMediaPlayerService).not.toHaveBeenCalled();
  });
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
    const pending=prototype._waitForSpeakerGroupConfirmation.call(card,"leader",["leader","child"]);
    await vi.advanceTimersByTimeAsync(5600);
    const result=await pending;
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
  it("rejects a group that disappears at the next device poll", async () => {
    const start=Date.now();
    const card={_hass:{states:{}},_loadPlayers:vi.fn(),
      _currentSpeakerGroupMemberIds:()=>Date.now()-start<5000?['leader','child']:['leader'],
      _sameSpeakerGroupMembers:prototype._sameSpeakerGroupMembers};
    const pending=prototype._waitForSpeakerGroupConfirmation.call(card,'leader',['leader','child']);
    await vi.advanceTimersByTimeAsync(8400);
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
