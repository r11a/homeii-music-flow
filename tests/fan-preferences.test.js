// @vitest-environment jsdom
import {afterEach,expect,it,vi} from "vitest";
import {orderedFanActions,openFanCatalogue,preferredFanPages,fanActionCategory} from "../src/core/media/fan-preferences.js";
const {document,localStorage,Event} = globalThis;
afterEach(()=>{document.body.replaceChildren();localStorage.clear();});
const actions=[{id:"a",label:"Alpha",icon:"play"},{id:"b",label:"Beta",icon:"stop"}];
function setup(){const host=document.createElement("div");document.body.append(host);const card={_lsKey:()=>"test-wheel",_m:a=>a,_esc:String,_iconSvg:()=>"<svg></svg>",_toastError:vi.fn(),_mediaControlFailureMessage:e=>e.message};return {host,card};}
it("hides only wheel shortcuts, keeps new capabilities and restores returning actions in order",()=>{
 const preference={hidden:["a"],order:["b","a"]};
 expect(orderedFanActions(actions,preference,true).map(a=>a.id)).toEqual(["b"]);
 expect(orderedFanActions(actions,preference).map(a=>a.id)).toEqual(["b","a"]);
 expect(orderedFanActions([...actions,{id:"c"}],preference,true).map(a=>a.id)).toEqual(["b","c"]);
});
it("saves checked shortcuts only on confirmation and complete catalogue still dispatches hidden actions",async()=>{
 const {host,card}=setup(),dispatch=vi.fn();
 const panel=openFanCatalogue(card,host,"main",()=>actions,dispatch);
 panel.querySelector('[data-catalogue-edit]').click();
 const input=panel.querySelector('[data-catalogue-check]');input.checked=false;input.dispatchEvent(new Event("change",{bubbles:true}));
 expect(preferredFanPages(card,"main",[actions]).flat()).toHaveLength(2);
 panel.querySelector('[data-catalogue-edit]').click();
 expect(preferredFanPages(card,"main",[actions]).flat().map(a=>a.id)).toEqual(["b"]);
 expect(panel.querySelectorAll('[data-catalogue-action]')).toHaveLength(2);
 panel.querySelector('[data-catalogue-action]').click();await Promise.resolve();expect(dispatch).toHaveBeenCalledWith("a");
});
it("cancel discards edits and keyboard reorder persists",()=>{
 const {host,card}=setup();let panel=openFanCatalogue(card,host,"main",()=>actions,vi.fn());
 panel.querySelector('[data-catalogue-edit]').click();panel.querySelector('[data-catalogue-move="1"]').click();panel.querySelector('[data-catalogue-back]').click();
 expect(preferredFanPages(card,"main",[actions]).flat().map(a=>a.id)).toEqual(["a","b"]);
 panel=openFanCatalogue(card,host,"main",()=>actions,vi.fn());panel.querySelector('[data-catalogue-edit]').click();panel.querySelector('[data-catalogue-move="1"]').click();panel.querySelector('[data-catalogue-edit]').click();
 expect(preferredFanPages(card,"main",[actions]).flat().map(a=>a.id)).toEqual(["b","a"]);
});

it("orders defaults logically while preserving saved ordering",()=>{
 const items=[{id:'settings'},{id:'repeat'},{id:'players'},{id:'queue'}];
 expect(orderedFanActions(items).map(a=>a.id)).toEqual(['queue','repeat','players','settings']);
 expect(orderedFanActions(items,{order:['settings','players']}).map(a=>a.id)).toEqual(['settings','players','queue','repeat']);
});
it("keeps player choices beside group commands and preserves an explicit custom order",()=>{
 const items=[{id:'settings'},{id:'group'},{id:'room',player:true},{id:'players'}];
 expect(orderedFanActions(items).map(a=>a.id)).toEqual(['players','room','group','settings']);
 expect(orderedFanActions(items,{order:['settings','group','room']}).map(a=>a.id)).toEqual(['settings','group','room','players']);
 expect(fanActionCategory({id:'control:group:disconnect'})).toBe('players');
 expect(fanActionCategory({id:'control:sleep_timer:cancel'})).toBe('smart');
 expect(fanActionCategory({id:'control:lighting:enable'})).toBe('smart');
 expect(fanActionCategory({id:'control:library_albums:filter'})).toBe('library');
});
it("persists user scope through Engine and removes the device override",async()=>{
 const {host,card}=setup();card._state={engineCapabilities:{wheel_preferences:true}};
 card._homeiiEngineCommand=vi.fn(async()=>({global:{},user:{main:{hidden:['a']}}}));
 localStorage.setItem('test-wheel',JSON.stringify({main:{hidden:[]}}));
 const panel=openFanCatalogue(card,host,'main',()=>actions,vi.fn());panel.querySelector('[data-catalogue-edit]').click();
 const select=panel.querySelector('select');select.value='user';select.dispatchEvent(new Event('change',{bubbles:true}));
 panel.querySelector('[data-catalogue-edit]').click();await Promise.resolve();await Promise.resolve();
 expect(card._homeiiEngineCommand).toHaveBeenCalledWith('wheels/set',expect.objectContaining({scope:'user',context:'main'}));
 expect(JSON.parse(localStorage.getItem('test-wheel')).main).toBeUndefined();
});
