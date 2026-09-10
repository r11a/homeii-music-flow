// @vitest-environment jsdom
import {it, expect, vi} from 'vitest';
import {renderVolumeRules} from '../src/core/media/volume-rules.js';
const {document, Event}=globalThis;
function fixture() {
 const body=document.createElement('div');document.body.append(body);
 const card={_state:{menuPage:'volume_rules',players:[{entity_id:'office',state:'idle'}]},_m:a=>a,_esc:String,_playerDisplayName:p=>p.entity_id,_nightModeDayOptions:()=>[[1,'Monday']],_mediaControlFailureMessage:String,_homeiiEngineCommand:vi.fn(async()=>({volume_rules:[]}))};
 return {body,card};
}
it('requires a complete time range and suppresses duplicate saves',async()=>{
 const {body,card}=fixture();await renderVolumeRules(card,body);
 const form=body.querySelector('form');form.elements.start.value='22:00';
 form.dispatchEvent(new Event('submit',{cancelable:true}));expect(card._homeiiEngineCommand).toHaveBeenCalledTimes(1);
 form.elements.end.value='06:00';form.elements.volume.value='35';
 let finish;card._homeiiEngineCommand.mockImplementation(()=>new Promise(resolve=>finish=resolve));
 form.dispatchEvent(new Event('submit',{cancelable:true}));form.dispatchEvent(new Event('submit',{cancelable:true}));
 expect(card._homeiiEngineCommand).toHaveBeenCalledTimes(2);
 expect(card._homeiiEngineCommand.mock.lastCall).toEqual(['volume_rules/set',{player:'office',max_volume:35,start_time:'22:00',end_time:'06:00',enabled:true,days:[]}]);
 card._state.menuPage='players';body.textContent='Players';finish({});await Promise.resolve();await Promise.resolve();
 expect(body.textContent).toBe('Players');expect(card._homeiiEngineCommand).toHaveBeenCalledTimes(2);body.remove();
});
