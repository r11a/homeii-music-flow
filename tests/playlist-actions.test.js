// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { openPlaylistDestination } from "../src/core/media/playlist-actions.js";
const { document } = globalThis;
afterEach(() => document.body.replaceChildren());
function fixture() {
  const sheet = document.createElement("div");
  sheet.innerHTML = '<div class="media-action-layout"></div>'; document.body.append(sheet);
  const entry = {name:"Track",uri:"spotify://track/123"};
  const card = {$:()=>sheet,_state:{mobileQueueActionEntry:entry},_m:a=>a,_esc:String,
    _callEngineMaCommand:vi.fn(async command=>command.endsWith("library_items") ? [{item_id:"1",name:"Read only",is_editable:false},{item_id:"2",name:"Mine",is_editable:true}] : {task_id:"accepted"}),
    _openMobileMediaActionMenu:vi.fn(),_toastError:vi.fn(),_mediaControlFailureMessage:String};
  return {sheet,card,entry};
}
describe("playlist destination",()=>{
  it("loads editable destinations without writing, then submits exactly the chosen playlist once",async()=>{
    const {sheet,card,entry}=fixture(); await openPlaylistDestination(card,entry);
    expect([...sheet.querySelectorAll("option")].map(item=>item.textContent)).toEqual(["Mine"]);
    expect(card._callEngineMaCommand).toHaveBeenCalledTimes(1);
    const save=sheet.querySelector("[data-playlist-save]"); save.click(); save.click(); await Promise.resolve();
    expect(card._callEngineMaCommand).toHaveBeenLastCalledWith("music/playlists/add_playlist_tracks",{db_playlist_id:"2",uris:[entry.uri]});
    expect(card._callEngineMaCommand).toHaveBeenCalledTimes(2);
    expect(sheet.querySelector('[role="status"]').textContent).toContain("accepted");
  });
  it("does not apply stale results after another entry is selected",async()=>{
    const {sheet,card,entry}=fixture(); let finish;
    card._callEngineMaCommand.mockImplementation(()=>new Promise(resolve=>{finish=resolve;}));
    const loading=openPlaylistDestination(card,entry); card._state.mobileQueueActionEntry={uri:"another"}; finish([]); await loading;
    expect(sheet.querySelector("[data-playlist-save]")).toBeNull();
  });
  it("does not submit an old dialog after the selection changes",async()=>{
    const {sheet,card,entry}=fixture(); await openPlaylistDestination(card,entry);
    card._state.mobileQueueActionEntry={uri:"another"}; sheet.querySelector("[data-playlist-save]").click();
    expect(card._callEngineMaCommand).toHaveBeenCalledTimes(1);
  });
});
