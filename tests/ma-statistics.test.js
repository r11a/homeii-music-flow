// @vitest-environment jsdom
import {it, expect, vi} from "vitest";
import {renderListeningTools} from "../src/core/media/listening-tools.js";
it("renders MA 2.11 nested ranking items in the Home Assistant timezone", async()=>{
 const body=globalThis.document.createElement("div");globalThis.document.body.append(body);
 const card={_state:{menuPage:"playback_stats"},_hass:{config:{time_zone:"Asia/Jerusalem"}},_m:a=>a,_esc:String,
 _homeiiEngineGetPlaybackStats:async()=>({today_minutes:10,today_sessions:1}),
 _homeiiEngineMaCommand:vi.fn(async command=>({data:command.endsWith("genre_distribution") ? [{name:"Jazz",value:3}] : [{item:{name:"Beautiful track"},play_count:7}]}))};
 await renderListeningTools(card,body,"playback_stats");
 await vi.waitFor(()=>expect(body.textContent).toContain("Beautiful track"));
 expect(card._homeiiEngineMaCommand).toHaveBeenCalledWith("statistics/top_items",{media_type:"track",period:"week",limit:5,timezone:"Asia/Jerusalem"});
 expect(body.textContent).toContain("7 plays");expect(body.textContent).toContain("Jazz");expect(body.querySelector("meter").value).toBe(3);body.remove();
});
