// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { screenActions, syncScreenDock } from "../src/core/media/screen-dock.js";
const { document } = globalThis;

describe("context screen wheel", () => {
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
    expect(sheet.querySelectorAll('.screen-all-actions button')).toHaveLength(1);
    start.disabled=false; syncScreenDock(card,sheet,"announcements");
    expect(sheet.querySelectorAll('.screen-all-actions button')).toHaveLength(2);
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
    expect(sheet.querySelector('.screen-all-actions path').getAttribute('d')).toBe('M1 2h3');
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
    expect(screenActions(card,"players").map(action=>action.id)).toEqual(["transfer","group","local_device","player_preferences"]);
    syncScreenDock(card,sheet,"players");
    sheet.querySelector('[data-screen-wheel]').click();
    sheet.querySelector('[data-immersive-action="more"]').click(); await Promise.resolve();
    expect(card._openMobileMenu).not.toHaveBeenCalled();
    expect(sheet.querySelectorAll('.screen-all-actions button')).toHaveLength(4);
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
