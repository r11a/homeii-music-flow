// @vitest-environment jsdom
/* global document */
import {describe, it, expect, vi} from "vitest";
import {renderListeningTools} from "../src/core/media/listening-tools.js";

function setup(page) {
  const body = document.createElement("div"); document.body.replaceChildren(body);
  const card = {_state:{menuPage:page}, _m:en=>en, _esc:value=>String(value).replaceAll("<","&lt;"), _mediaControlFailureMessage:error=>error.message};
  return {body,card};
}
describe("listening tools", () => {
  it("discards statistics arriving after navigation", async () => {
    const {body,card} = setup("playback_stats"); let resolve;
    card._homeiiEngineGetPlaybackStats = () => new Promise(done=>{resolve=done;});
    const pending = renderListeningTools(card,body,"playback_stats");
    card._state.menuPage="players"; body.textContent="Players";
    resolve({today_minutes:12}); await pending;
    expect(body.textContent).toBe("Players");
  });
  it("shows actual Engine totals and readable failures", async () => {
    const {body,card} = setup("playback_stats");
    card._homeiiEngineGetPlaybackStats = vi.fn().mockResolvedValue({today_minutes:12,today_sessions:2,players_today:[{friendly_name:"Kitchen",minutes:12}]});
    await renderListeningTools(card,body,"playback_stats");
    expect(body.querySelector(".listening-stats-row").textContent).toContain("Kitchen");
    card._homeiiEngineGetPlaybackStats.mockRejectedValue(new Error("Engine offline"));
    await renderListeningTools(card,body,"playback_stats");
    expect(body.querySelector('[role="alert"]').textContent).toBe("Engine offline");
  });
  it("requests favorite radios instead of all stations", async () => {
    const {body,card} = setup("favorite_radios");
    card._fetchLibrary=vi.fn().mockResolvedValue([]); card._mediaItemsListHtml=()=>"";
    await renderListeningTools(card,body,"favorite_radios");
    expect(card._fetchLibrary).toHaveBeenCalledWith("radio","sort_name",250,true);
    expect(body.textContent).toContain("No favorite");
  });
  it("reuses the existing group volume controls", async () => {
    const {body,card} = setup("group_volume");
    card._getSelectedPlayer=()=>({entity_id:"a"}); card._playerGroupMemberIds=()=>["a","b"];
    card._groupMenuHtml=()=>'<div>Members</div><details class="group-volume-card"><input data-group-volume></details>';
    await renderListeningTools(card,body,"group_volume");
    expect(body.querySelector("details").open).toBe(true);
    expect(body.textContent).not.toContain("Members");
    expect(body.querySelector("[data-group-volume]")).not.toBeNull();
  });
});

it("recommendations use MA folders and reject late navigation responses",async()=>{
 const {body,card}=setup("recommendations");let finish;
 card._loadRecommendationFolders=vi.fn(()=>new Promise(resolve=>{finish=resolve;}));
 card._flattenNativeRecommendations=vi.fn(()=>[]);
 const request=renderListeningTools(card,body,"recommendations");card._state.menuPage="players";body.textContent="Players";finish([]);await request;
 expect(body.textContent).toBe("Players");expect(card._flattenNativeRecommendations).not.toHaveBeenCalled();
});
it("system screensaver settings save directly to the Engine only on submit",async()=>{
 const {body,card}=setup("system_screensaver");
 card._homeiiEngineCommand=vi.fn().mockResolvedValue({config:{enabled:true,timeout_seconds:120,mode:"clock"}});
 await renderListeningTools(card,body,"system_screensaver");
 const form=body.querySelector('form');form.elements.timeout_seconds.value="180";
 expect(card._homeiiEngineCommand).toHaveBeenCalledTimes(1);
 form.dispatchEvent(new globalThis.Event("submit",{bubbles:true,cancelable:true}));await Promise.resolve();
 expect(card._homeiiEngineCommand).toHaveBeenLastCalledWith("screensaver/set",{enabled:true,timeout_seconds:180,mode:"clock",message:"",clock_mode:"digital",show_artwork:true,auto_lyrics_when_playing:true});
});
it("group volume retains disconnected members for reconnection but never leaks across owners",async()=>{
 const {body,card}=setup("group_volume");let owner="a",members=["a","b"];
 card._getSelectedPlayer=()=>({entity_id:owner});card._playerGroupMemberIds=()=>members;
 card._groupMenuHtml=()=>'<details class="group-volume-card"></details><div class="players-premium-grid"><div><input data-menu-group-player="a"></div><div><input data-menu-group-player="b"></div><div><input data-menu-group-player="c"></div></div>';
 await renderListeningTools(card,body,"group_volume");members=["a"];await renderListeningTools(card,body,"group_volume");expect(body.querySelectorAll('[data-menu-group-player]')).toHaveLength(2);
 owner="c";members=["c"];await renderListeningTools(card,body,"group_volume");expect(body.querySelectorAll('[data-menu-group-player]')).toHaveLength(1);expect(body.querySelector('[data-menu-group-player]').dataset.menuGroupPlayer).toBe("c");
});
