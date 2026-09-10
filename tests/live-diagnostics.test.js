// @vitest-environment jsdom
import {it,expect,vi} from 'vitest';
import {liveDiagnosticRows,mountLiveDiagnostics} from '../src/core/media/live-diagnostics.js';
const {document}=globalThis;
it('does not report stale MA health as healthy when Engine is unavailable',()=>{
 const card={_state:{engineRequiredConnections:{music_assistant:{ok:true}}},_m:a=>a};
 const rows=liveDiagnosticRows(card,{available:false},true);
 expect(rows.find(row=>row.title==='Flow Engine').status).toBe('fail');
 expect(rows.find(row=>row.title==='Music Assistant').status).toBe('info');
});
it('loads on entry without a run button and stops polling after navigation',async()=>{
 vi.useFakeTimers();const body=document.createElement('div');document.body.append(body);
 const card={_state:{menuPage:'diagnostics'},_m:a=>a,_esc:String,_diagnosticRowHtml:row=>`<p>${row.title}</p>`,_refreshHomeiiEngineContext:vi.fn(async()=>({available:true}))};
 mountLiveDiagnostics(card,body);await Promise.resolve();await Promise.resolve();
 expect(card._refreshHomeiiEngineContext).toHaveBeenCalledOnce();expect(body.querySelector('[data-menu-action="run_diagnostics"]')).toBeNull();
 card._state.menuPage='players';await vi.advanceTimersByTimeAsync(16000);
 expect(card._refreshHomeiiEngineContext).toHaveBeenCalledOnce();card._stopLiveDiagnostics();body.remove();vi.useRealTimers();
});
