// @vitest-environment jsdom
import {it,expect,vi} from "vitest";
import {renderListeningScenes} from "../src/core/media/listening-scenes.js";
const {document,Event}=globalThis;
function fixture(admin=true){
 const body=document.createElement("div");document.body.append(body);
 const card={_state:{menuPage:"listening_scenes",selectedPlayer:"media_player.kitchen",players:[{entity_id:"media_player.kitchen",state:"idle",attributes:{friendly_name:"Kitchen"}}]},_hass:{user:{is_admin:admin},states:{}},_m:a=>a,_esc:String,_iconSvg:()=>"",_playerDisplayName:p=>p?.attributes?.friendly_name,_mediaControlFailureMessage:String,_homeiiEngineCommand:vi.fn(async()=>[])};
 return {card,body};
}
it("saves one scene with selected player and a 1 percent volume",async()=>{
 const {card,body}=fixture();await renderListeningScenes(card,body);
 const form=body.querySelector("form");form.elements.scene_name.value="Morning";form.elements.media.value="library://playlist/one";form.elements.volume.value="1";
 form.dispatchEvent(new Event("submit",{cancelable:true}));form.dispatchEvent(new Event("submit",{cancelable:true}));
 await vi.waitFor(()=>expect(card._homeiiEngineCommand).toHaveBeenCalledTimes(3));
 expect(card._homeiiEngineCommand.mock.calls[1]).toEqual(["scenes",{action:"save",name:"Morning",player:"media_player.kitchen",media_id:"library://playlist/one",volume:1,members:[],lights:[]}]);body.remove();
});
it("does not offer shared editing to a non-admin",async()=>{
 const {card,body}=fixture(false);await renderListeningScenes(card,body);expect(body.querySelector("form")).toBeNull();body.remove();
});
it("ignores responses after leaving the scene screen",async()=>{
 const {card,body}=fixture();let finish;card._homeiiEngineCommand.mockImplementation(()=>new Promise(resolve=>finish=resolve));
 const pending=renderListeningScenes(card,body);card._state.menuPage="players";body.textContent="Players";finish([]);await pending;expect(body.textContent).toBe("Players");body.remove();
});
