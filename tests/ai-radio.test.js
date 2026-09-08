// @vitest-environment jsdom
import { describe,it,expect,vi } from "vitest";
import { renderAiRadio } from "../src/core/media/ai-radio.js";
const { document } = globalThis;
describe("MA queue DJ",()=>{
  it("loads configured hosts without enabling a DJ, then confirms an explicit selection",async()=>{
    const body=document.createElement("div");
    let selected;
    const card={_state:{menuPage:"ai_radio",selectedPlayer:"computer",maQueueState:{queue_id:"q"}},_m:en=>en,_esc:s=>s,_mediaControlFailureMessage:e=>e.message,_callEngineMaCommand:vi.fn(async(name,args)=>{
      if(name==="ai_radio/hosts/list")return [{id:"host",name:"Morning"}];
      if(name==="ai_radio/queue_dj/set"){selected=args.host_id;return null;}
      return selected ? {q:selected}:{};
    })};
    await renderAiRadio(card,body);
    expect(card._callEngineMaCommand).toHaveBeenCalledTimes(2);
    body.querySelector("select").value="host";
    body.querySelector("button").click();
    await vi.waitFor(()=>expect(body.querySelector('[role="status"]').textContent).toContain("confirmed"));
    expect(card._callEngineMaCommand).toHaveBeenCalledWith("ai_radio/queue_dj/set",{queue_id:"q",host_id:"host"});
  });
  it("does not populate a stale screen after changing players",async()=>{
    const body=document.createElement("div");
    const card={_state:{menuPage:"ai_radio",selectedPlayer:"computer",maQueueState:{queue_id:"q"}},_m:en=>en,_esc:s=>s,_callEngineMaCommand:async()=>{card._state.selectedPlayer="kitchen";return []}};
    await renderAiRadio(card,body);
    expect(body.querySelector("select")).toBeNull();
  });
});
