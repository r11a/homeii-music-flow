// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { screenActions, syncScreenDock } from "../src/core/media/screen-dock.js";
const { document } = globalThis;

describe("context screen wheel", () => {
  it('keeps queue playback preferences accessible and shows their confirmed state', () => {
    const body=document.createElement('div');
    body.innerHTML='<div class="queue-playback-options"><button data-menu-action="toggle_autoplay" aria-label="Autoplay" aria-pressed="true"><svg></svg></button><button data-menu-action="toggle_crossfade" aria-label="Crossfade" aria-pressed="false"><svg></svg></button></div>';
    const card={_m:a=>a,$:()=>body,_state:{},_getNowPlayingQueueItems:()=>[]};
    const actions=screenActions(card,'queue');
    expect(actions.find(a=>a.id==='control:queue:toggle_autoplay')).toMatchObject({label:'Autoplay',selected:true});
    expect(actions.find(a=>a.id==='control:queue:toggle_crossfade')).toMatchObject({label:'Crossfade',selected:false});
  });
  it("applies AI hosts through the existing command button and rejects stale queue choices", async () => {
    const sheet=document.createElement('div');document.body.append(sheet);
    sheet.innerHTML='<select data-ai-host><option value="">Off</option><option value="dj">My DJ</option></select><button data-ai-apply>Apply</button>';
    const card={_m:a=>a,_esc:String,_iconSvg:()=>'<svg></svg>',shadowRoot:sheet,$:()=>sheet,_state:{selectedPlayer:'computer',maQueueState:{queue_id:'q1'}}};
    const apply=vi.fn();sheet.querySelector('button').onclick=apply;
    syncScreenDock(card,sheet,'ai_radio');const id=screenActions(card,'ai_radio')[1].id;
    await sheet.querySelector('.screen-dock')._dispatchAction(id);expect(apply).toHaveBeenCalledOnce();expect(sheet.querySelector('select').value).toBe('dj');
    card._state.maQueueState.queue_id='q2';await sheet.querySelector('.screen-dock')._dispatchAction(id);expect(apply).toHaveBeenCalledOnce();sheet.remove();
  });
  it("toggles real group checkboxes and distinguishes the leader", async () => {
    const sheet=document.createElement('div');document.body.append(sheet);
    sheet.innerHTML='<div class="group-player-card"><span class="player-premium-name">Computer</span><input type="checkbox" data-menu-group-player="computer" data-group-owner="true" checked></div><div class="group-player-card"><span class="player-premium-name">Kitchen</span><input type="checkbox" data-menu-group-player="kitchen"></div><input data-menu-group-player="offline" disabled><button data-menu-action="apply_group">Connect</button>';
    const card={_m:a=>a,_esc:String,_iconSvg:()=>'<svg></svg>',shadowRoot:sheet,$:()=>sheet,_state:{}};
    const changed=vi.fn();sheet.querySelector('[data-menu-group-player="kitchen"]').onchange=changed;
    syncScreenDock(card,sheet,'group');
    expect(screenActions(card,'group').map(a=>a.label)).toEqual(['Computer','Kitchen','Connect']);
    expect(screenActions(card,'group')[0].leader).toBe(true);
    await sheet.querySelector('.screen-dock')._dispatchAction('control:group:kitchen');
    expect(changed).toHaveBeenCalledOnce();expect(screenActions(card,'group')[1].selected).toBe(true);
    sheet.remove();
  });
  it("shows only actual transfer destinations and uses their existing handler", async () => {
    const sheet=document.createElement('div');document.body.append(sheet);
    sheet.innerHTML='<button data-menu-transfer="kitchen"><span class="player-premium-name">Kitchen</span></button><button data-menu-player="computer">Computer</button>';
    const card={_m:a=>a,_esc:String,_iconSvg:()=>'<svg></svg>',shadowRoot:sheet,$:()=>sheet,_state:{}};
    const transfer=vi.fn();sheet.querySelector('[data-menu-transfer]').onclick=transfer;
    syncScreenDock(card,sheet,'transfer');expect(screenActions(card,'transfer')).toHaveLength(1);
    await sheet.querySelector('.screen-dock')._dispatchAction('control:transfer:kitchen');expect(transfer).toHaveBeenCalledOnce();sheet.remove();
  });
  it("uses drawer tabs and round media artwork without leaking other screen actions", async () => {
    const sheet=document.createElement("div"); document.body.append(sheet);
    sheet.innerHTML='<button data-history-tab="recent">Recent</button><button data-history-tab="recommendations">Recommendations</button><button data-history-index="0" data-history-key="recent:track1"><img src="cover.jpg"><span class="history-chip-title">Song name</span><span>Artist</span></button>';
    const card={_m:a=>a,_esc:String,_iconSvg:()=>"<svg></svg>",_imgHtml:src=>`<img src="${src}">`,shadowRoot:sheet,$:id=>id==="historyDrawer"?sheet:null,_state:{},_config:{action_menu_labels:false}};
    const select=vi.fn();sheet.querySelector('[data-history-index]').onclick=select;
    syncScreenDock(card,sheet,"history");sheet.querySelector('[data-screen-wheel]').click();
    expect(screenActions(card,"history").map(a=>a.label)).toEqual(['Recent','Recommendations','Song name']);
    const item=sheet.querySelector('[data-immersive-action="control:history:recent:track1"]');
    expect(item.querySelector('.fan-player-art img').getAttribute('src')).toBe('cover.jpg');
    expect(item.textContent).toBe('Song name');item.click();await Promise.resolve();expect(select).toHaveBeenCalledOnce();
    sheet.querySelector('[data-history-index]').remove();
    await sheet.querySelector('.screen-dock')._dispatchAction('control:history:recent:track1');expect(select).toHaveBeenCalledOnce();
    sheet.remove();
  });
  it("hides karaoke without timed lyrics and keeps its microphone symbol when available", () => {
    const sheet=document.createElement('div');sheet.innerHTML='<div class="lyrics-head-actions"><button id="lyricsSyncBtn" hidden title="Karaoke"><svg data-icon="karaoke"></svg></button></div>';
    const card={$:()=>sheet};expect(screenActions(card,'lyrics')).toHaveLength(0);
    sheet.querySelector('button').hidden=false;
    expect(screenActions(card,'lyrics')[0].icon).toBe('karaoke');
  });
  it("keeps all-actions focus across refreshes and returns focus when the action disappears", async () => {
    const sheet=document.createElement("div");document.body.append(sheet);
    sheet.innerHTML='<div id="body"><button id="a" title="First">First</button><button id="b" title="Second">Second</button></div>';
    const card={_m:a=>a,_esc:String,_iconSvg:()=>"<svg></svg>",shadowRoot:sheet,$:id=>id==="mobileMenuBody"?sheet.querySelector('#body'):null,_state:{}};
    syncScreenDock(card,sheet,"announcements");sheet.querySelector('[data-screen-wheel]').click();
    sheet.querySelector('[data-immersive-action="more"]').click();await Promise.resolve();
    const panel=sheet.querySelector('.screen-all-actions');const button=panel.querySelector('[data-catalogue-id="control:announcements:b"] [data-catalogue-action]');button.focus();
    syncScreenDock(card,sheet,"announcements");
    expect(panel.querySelector('[data-catalogue-id="control:announcements:b"] [data-catalogue-action]')).toBe(button);
    sheet.querySelector('#a').title='Changed';syncScreenDock(card,sheet,"announcements");
    expect(document.activeElement).toBe(panel.querySelector('[data-catalogue-id="control:announcements:b"] [data-catalogue-action]'));
    sheet.querySelector('#b').disabled=true;syncScreenDock(card,sheet,"announcements");
    expect(document.activeElement).toBe(panel.querySelector('[data-catalogue-back]'));
    sheet.remove();
  });
  it("does not retarget a studio wheel action when panel buttons reorder", async () => {
    const sheet=document.createElement("div");document.body.append(sheet);
    sheet.innerHTML='<div id="room"><button class="control-room-panel-action" data-room-transfer>Transfer</button><button class="control-room-panel-action" data-room-clear-queue="kitchen">Clear</button></div>';
    const card={_m:a=>a,_esc:String,_iconSvg:()=>"<svg></svg>",shadowRoot:sheet,$:id=>id==="controlRoomBody"?sheet.querySelector('#room'):null,_state:{}};
    syncScreenDock(card,sheet,"studio");sheet.querySelector('[data-screen-wheel]').click();
    const action=screenActions(card,"studio")[0];
    const original=action.control;const transfer=vi.fn();original.onclick=transfer;
    const room=sheet.querySelector('#room');room.append(original);
    await sheet.querySelector('.screen-dock')._dispatchAction(action.id);
    expect(transfer).toHaveBeenCalledOnce();
    original.remove();
    await sheet.querySelector('.screen-dock')._dispatchAction(action.id);
    expect(transfer).toHaveBeenCalledOnce();
    sheet.remove();
  });
  it("shows only the player name below its symbol even when action labels are off", () => {
    const sheet=document.createElement("div");
    sheet.innerHTML='<div id="body"><button data-menu-player="media_player.kitchen"><span class="player-choice-name">Kitchen</span><span>Playing · Long song title</span></button></div>';
    const card={_m:a=>a,_esc:String,_iconSvg:()=>"<svg></svg>",shadowRoot:sheet,$:id=>id==="mobileMenuBody"?sheet.querySelector('#body'):null,_state:{},_config:{action_menu_labels:false}};
    syncScreenDock(card,sheet,"players");
    sheet.querySelector('[data-screen-wheel]').click();
    const player=sheet.querySelector('[data-immersive-action="control:players:media_player.kitchen"]');
    expect(player.textContent).toBe("Kitchen");
    expect(player.getAttribute("aria-label")).toBe("Kitchen");
    expect(player.querySelector('.fan-player-art')).not.toBeNull();
  });
  it("hides unavailable actions and restores them in an already open wheel and action panel", async () => {
    const sheet=document.createElement("div"); document.body.append(sheet);
    sheet.innerHTML='<div id="body"><button title="Start">Start</button><button title="Stop">Stop</button></div>';
    const card={_m:a=>a,_esc:String,_iconSvg:()=>"<svg></svg>",shadowRoot:sheet,$:id=>id==="mobileMenuBody"?sheet.querySelector('#body'):null,_state:{}};
    syncScreenDock(card,sheet,"announcements");
    sheet.querySelector('[data-screen-wheel]').click();
    const start=sheet.querySelector('#body button');
    start.disabled=true; syncScreenDock(card,sheet,"announcements");
    expect(sheet.querySelector('[data-immersive-action="control:announcements:0"]')).toBeNull();
    expect(sheet.querySelector('[data-immersive-action="control:announcements:1"]').title).toBe('Stop');
    start.disabled=false; syncScreenDock(card,sheet,"announcements");
    expect(sheet.querySelector('[data-immersive-action="control:announcements:0"]').title).toBe('Start');
    sheet.querySelector('[data-immersive-action="more"]').click(); await Promise.resolve();
    start.disabled=true; syncScreenDock(card,sheet,"announcements");
    expect(sheet.querySelectorAll('.screen-all-actions [data-catalogue-action]')).toHaveLength(1);
    start.disabled=false; syncScreenDock(card,sheet,"announcements");
    expect(sheet.querySelectorAll('.screen-all-actions [data-catalogue-action]')).toHaveLength(2);
    sheet.remove();
  });
  it("uses the existing genre filter when selecting a discovery wheel style", async () => {
    const sheet=document.createElement("div");
    const card={_m:a=>a,_esc:String,_iconSvg:()=>"<svg></svg>",shadowRoot:sheet,$:()=>null,_state:{},_discoveryCategoryOptions:()=>[{key:"jazz",label:"Jazz",icon:"music_note"}],_selectDiscoveryCategory:vi.fn(async()=>{})};
    syncScreenDock(card,sheet,"discovery"); sheet.querySelector('[data-screen-wheel]').click();
    sheet.querySelector('[data-immersive-action="genre:jazz"]').click(); await Promise.resolve();
    expect(card._selectDiscoveryCategory).toHaveBeenCalledWith("jazz");
  });
  it("preserves distinct original action symbols and timer values in all actions", async () => {
    const sheet=document.createElement("div"); document.body.append(sheet);
    sheet.innerHTML='<div id="body"><button title="Start"><svg><path d="M1 2h3"/></svg></button><button title="Stop"><svg><rect width="10" height="10"/></svg></button></div>';
    const card={_m:a=>a,_esc:String,_iconSvg:()=>"<svg></svg>",shadowRoot:sheet,$:id=>id==="mobileMenuBody"?sheet.querySelector('#body'):null,_state:{}};
    syncScreenDock(card,sheet,"announcements");
    sheet.querySelector('[data-screen-wheel]').click();
    expect(sheet.querySelector('[data-immersive-action="control:announcements:0"] path').getAttribute('d')).toBe('M1 2h3');
    expect(sheet.querySelector('[data-immersive-action="control:announcements:1"] rect')).not.toBeNull();
    sheet.querySelector('[data-immersive-action="more"]').click(); await Promise.resolve();
    expect(sheet.querySelector('.screen-all-actions [data-catalogue-id="control:announcements:0"] path').getAttribute('d')).toBe('M1 2h3');
    expect(sheet.querySelector('.screen-all-actions rect')).not.toBeNull();
    sheet.remove();
  });
  it("selects a player through its existing handler with round cover artwork", async () => {
    const sheet=document.createElement("div"); document.body.append(sheet);
    sheet.innerHTML='<div id="body"><button data-menu-player="computer" aria-pressed="true"><img src="computer.jpg">Computer</button></div>';
    const select=vi.fn(); sheet.querySelector('button').onclick=select;
    const card={_m:a=>a,_esc:String,_iconSvg:()=>"<svg></svg>",_imgHtml:src=>`<img src="${src}">`,shadowRoot:sheet,$:id=>id==="mobileMenuBody"?sheet.querySelector('#body'):null,_state:{}};
    syncScreenDock(card,sheet,"players"); sheet.querySelector('[data-screen-wheel]').click();
    const choice=sheet.querySelector('[data-immersive-action="control:players:computer"]');
    expect(choice.querySelector('.fan-player-art.selected img').getAttribute('src')).toBe('computer.jpg');
    choice.click(); await Promise.resolve(); expect(select).toHaveBeenCalledOnce(); sheet.remove();
  });
  it("keeps player actions scoped and expands the same actions without navigating away", async () => {
    const sheet=document.createElement("div");
    const card={_m:a=>a,_esc:String,_iconSvg:()=>"<svg></svg>",shadowRoot:sheet,$:()=>null,
      _openMobileMenu:vi.fn(),_backMobileMenu:vi.fn(),_state:{}};
    expect(screenActions(card,"players").map(action=>action.id)).toEqual(["transfer","group","local_device","player_preferences","stop_all"]);
    syncScreenDock(card,sheet,"players");
    sheet.querySelector('[data-screen-wheel]').click();
    sheet.querySelector('[data-immersive-action="more"]').click(); await Promise.resolve();
    expect(card._openMobileMenu).not.toHaveBeenCalled();
    expect(sheet.querySelectorAll('.screen-all-actions [data-catalogue-action]')).toHaveLength(5);
    sheet.querySelector('[data-screen-back]').click();
    expect(sheet.querySelector('.screen-all-actions')).toBeNull();
    expect(card._backMobileMenu).not.toHaveBeenCalled();
  });
  it("shows timer durations and only schedules the duration explicitly tapped", async () => {
    const sheet = document.createElement("div");
    const card = { _m:(a)=>a, _esc:String, _iconSvg:()=>"<svg></svg>", _config:{action_menu_labels:true}, _state:{},
      _sleepTimerRemainingMs:()=>0, _setSleepTimerMinutes:vi.fn(async()=>{}), _renderMobileMenu:vi.fn(async()=>{}),
      shadowRoot:sheet, $:()=>null, _isHebrew:()=>false,
    };
    syncScreenDock(card,sheet,"sleep_timer");
    sheet.querySelector("[data-screen-wheel]").click();
    expect(card._setSleepTimerMinutes).not.toHaveBeenCalled();
    sheet.querySelector('[data-immersive-action="timer:30"]').click();
    await Promise.resolve();
    expect(card._setSleepTimerMinutes).toHaveBeenCalledWith(30);
    expect(sheet.querySelector("[data-fan-step]").disabled).toBe(false);
  });
  it("reuses one dock across menu renders and routes back without playing", () => {
    const sheet = document.createElement("div");
    const card = {_m:a=>a,_esc:String,_iconSvg:()=>"<svg></svg>",shadowRoot:sheet,$:()=>null,_backMobileMenu:vi.fn()};
    syncScreenDock(card,sheet,"library_albums"); syncScreenDock(card,sheet,"library_tracks");
    expect(sheet.querySelectorAll(".screen-dock")).toHaveLength(1);
    sheet.querySelector("[data-screen-back]").click();
    expect(card._backMobileMenu).toHaveBeenCalledOnce();
  });
  it("rejects an opened queue wheel after the selected player changes", async () => {
    const sheet=document.createElement("div");
    const item={queue_item_id:"same-id",name:"Track"};
    const card={_m:a=>a,_esc:String,_iconSvg:()=>"<svg></svg>",shadowRoot:sheet,$:()=>null,
      _state:{selectedPlayer:"computer"},_getNowPlayingQueueItems:()=>[item],_getQueueItemKey:item=>item.queue_item_id,_queueItemImageUrl:()=>"",_playQueueItem:vi.fn(),_toast:vi.fn()};
    syncScreenDock(card,sheet,"queue"); sheet.querySelector("[data-screen-wheel]").click();
    card._state.selectedPlayer="kitchen";
    sheet.querySelector('[data-immersive-action^="queue:"]').click(); await Promise.resolve();
    expect(card._playQueueItem).not.toHaveBeenCalled(); expect(card._toast).toHaveBeenCalledOnce();
  });
});

