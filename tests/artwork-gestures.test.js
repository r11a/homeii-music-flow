// @vitest-environment jsdom
import {describe,it,expect,vi} from 'vitest';
import '../src/homeii-music-flow.js';
const proto=globalThis.customElements.get('homeii-music-flow').prototype;
describe('artwork browsing idle reset',()=>{
 it('does not reset during a touch and restarts the idle period after release',()=>{
  vi.useFakeTimers();
  try {
   const art=globalThis.document.createElement('div');
   const card={_state:{mobileArtBrowseOffset:1},$:()=>art,_setArtDragOffset:vi.fn(),_clearArtDragOffset:vi.fn(),_refreshMobileArtStack:vi.fn(),_mobileCoverFlowEnabled:()=>false,_ensureArtworkBrowseQueue:async()=>{}};
   card._scheduleMobileArtBrowseReset=()=>proto._scheduleMobileArtBrowseReset.call(card);
   card._scheduleMobileArtBrowseReset();
   vi.advanceTimersByTime(9000);
   proto._onArtTouchStart.call(card,{touches:[{clientX:100,clientY:100}]});
   vi.advanceTimersByTime(12000);
   expect(card._state.mobileArtBrowseOffset).toBe(1);
   proto._onArtTouchEnd.call(card,{changedTouches:[{clientX:100,clientY:100}]});
   vi.advanceTimersByTime(9999);
   expect(card._state.mobileArtBrowseOffset).toBe(1);
   vi.advanceTimersByTime(1);
   expect(card._state.mobileArtBrowseOffset).toBe(0);
  }finally{vi.useRealTimers();}
 });
});


it('loads the full queue on demand when artwork browsing only has a now-playing window', async()=>{
 const card={_state:{queueItems:[{queue_item_id:'a'},{queue_item_id:'b'}],maQueueState:{items:100}},_ensureQueueSnapshot:vi.fn(async()=>{})};
 await proto._ensureArtworkBrowseQueue.call(card);
 expect(card._ensureQueueSnapshot).toHaveBeenCalledWith(true,{full:true});
 card._state.maQueueState.items=2;card._ensureQueueSnapshot.mockClear();
 await proto._ensureArtworkBrowseQueue.call(card);
 expect(card._ensureQueueSnapshot).not.toHaveBeenCalled();
});

it('browses beyond the next cover repeatedly without sending playback commands', async()=>{
 const art=globalThis.document.createElement('div');
 const items=Array.from({length:6},(_,index)=>({queue_item_id:String(index)}));
 const card={
  _state:{selectedPlayer:'bathroom',queueItems:items.slice(0,2),maQueueState:{items:6},mobileArtBrowseOffset:0},
  $:()=>art,_mobileCoverFlowEnabled:()=>false,_mobileSwipeMode:()=> 'browse',
  _scheduleMobileArtBrowseReset:vi.fn(),_clearArtDragOffset:vi.fn(),_refreshMobileArtStack:vi.fn(),_hapticTap:vi.fn(),
  _commitArtSwipe:(_direction,apply)=>apply(),_playMedia:vi.fn(),
  _ensureQueueSnapshot:vi.fn(async()=>{card._state.queueItems=items;}),
  _mobileArtStackContext:()=>({queueItems:card._state.queueItems,displayIndex:card._state.mobileArtBrowseOffset}),
 };
 card._ensureArtworkBrowseQueue=()=>proto._ensureArtworkBrowseQueue.call(card);
 for(let index=1;index<=5;index++){
  card._state.activeArtworkTouch={x:200,y:100,t:Date.now()};
  await proto._onArtTouchEnd.call(card,{changedTouches:[{clientX:100,clientY:100}]});
  expect(card._state.mobileArtBrowseOffset).toBe(index);
 }
 expect(card._ensureQueueSnapshot).toHaveBeenCalledTimes(1);
 expect(card._playMedia).not.toHaveBeenCalled();
});
