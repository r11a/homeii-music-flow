// @vitest-environment jsdom
import {it,expect,vi} from 'vitest';
import '../src/homeii-music-flow.js';
it('persists explicit collapse even when visual settings own appearance',()=>{
 const prototype=globalThis.customElements.get('homeii-music-flow').prototype;
 const key='edge-collapse-test';
 const card={_state:{mobileEdgeReturnAvailable:true},_lsKey:()=>key,_usesVisualSettings:()=>true,_writeOperationalMobileStateToLocalStorage:vi.fn(),_scheduleSystemMobileStatePersist:vi.fn()};
 prototype._persistMobileAppearance.call(card);
 expect(globalThis.localStorage.getItem(key)).toBe('true');
 card._state.mobileEdgeReturnAvailable=false;prototype._persistMobileAppearance.call(card);
 expect(globalThis.localStorage.getItem(key)).toBe('false');globalThis.localStorage.removeItem(key);
});
