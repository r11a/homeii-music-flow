import { describe, it, expect, vi } from "vitest";
import { playbackSpeedHtml, setPlaybackSpeed } from "../src/core/media/queue-options.js";
function fixture() {
  return { _state: { selectedPlayer:"computer", menuOpen:true, engineCapabilities:{queue_playback_speed:true}, maQueueState:{queue_id:"leader",current_item:{media_item:{media_type:"podcast_episode"}}}},
    _m:en=>en,_esc:String,_callHomeiiEnginePlayerCommand:vi.fn(async()=>true),_callEngineMaCommand:vi.fn(async()=>({playback_speed:1.25})),_ensureQueueSnapshot:vi.fn(),_toastError:vi.fn(),_mediaControlFailureMessage:e=>e.message,_renderMobileMenu:vi.fn() };
}
describe("listening speed",()=>{
  it("only offers the control for supported spoken audio",()=>{
    const card=fixture();expect(playbackSpeedHtml(card)).toContain("data-playback-speed");
    card._state.maQueueState.current_item.media_item.media_type="track";expect(playbackSpeedHtml(card)).toBe("");
  });
  it("uses Engine and confirms the owning queue speed",async()=>{
    const card=fixture();await setPlaybackSpeed(card,{value:"1.25"});
    expect(card._callHomeiiEnginePlayerCommand).toHaveBeenCalledWith("computer","playback_speed",{speed:1.25});
    expect(card._callEngineMaCommand).toHaveBeenCalledWith("player_queues/get",{queue_id:"leader"});
    expect(card._toastError).not.toHaveBeenCalled();
  });
  it("reports an unconfirmed change without claiming success",async()=>{
    const card=fixture();card._callEngineMaCommand.mockResolvedValue({playback_speed:1});
    await setPlaybackSpeed(card,{value:"1.25"});expect(card._toastError).toHaveBeenCalledOnce();
    expect(card._playbackSpeedPending).toBe(false);
  });
});
