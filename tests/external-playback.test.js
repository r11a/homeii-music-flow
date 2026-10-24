// @vitest-environment jsdom
import {describe,it,expect,vi} from 'vitest';
import '../src/homeii-music-flow.js';
const p=globalThis.customElements.get('homeii-music-flow').prototype;
describe('external dashboard playback',()=>{
 it('runs an acknowledged playback refresh before an older delayed poll',async()=>{
  vi.useFakeTimers();
  try {
   const card={_refreshEnginePlayers:vi.fn(async()=>{}),_loadPlayers:vi.fn(),_syncNowPlayingUI:vi.fn()};
   p._schedulePlayerStateRefresh.call(card,500);
   p._schedulePlayerStateRefresh.call(card,0);
   await vi.runOnlyPendingTimersAsync();
   expect(card._refreshEnginePlayers).toHaveBeenCalledOnce();
   expect(card._syncNowPlayingUI).toHaveBeenCalledOnce();
  } finally { vi.useRealTimers(); }
 });
 it('coalesces full queue refreshes so slow transfers cannot starve newer state forever',async()=>{
  let finish;const card={_state:{selectedPlayer:'office',queueVisible:true},_readQueueSnapshot:vi.fn(()=>new Promise(r=>finish=r))};
  const first=p._ensureQueueSnapshot.call(card,true);const second=p._ensureQueueSnapshot.call(card,true);
  expect(card._readQueueSnapshot).toHaveBeenCalledOnce();finish();await Promise.all([first,second]);
  const next=p._ensureQueueSnapshot.call(card,true);expect(card._readQueueSnapshot).toHaveBeenCalledTimes(2);finish();await next;
 });
 it('keeps bulk queues off the playback command connection until the user opens the queue',async()=>{
  const card={_state:{selectedPlayer:'office',view:'now_playing'},_ensureNowPlayingSnapshot:vi.fn(async()=>{}),_readQueueSnapshot:vi.fn(async()=>{})};
  await p._ensureQueueSnapshot.call(card,true);
  expect(card._ensureNowPlayingSnapshot).toHaveBeenCalledOnce();expect(card._readQueueSnapshot).not.toHaveBeenCalled();
  await p._ensureQueueSnapshot.call(card,true,{full:true});expect(card._readQueueSnapshot).toHaveBeenCalledOnce();
 });
 it('never allows saving a partial queue when a full read fails',async()=>{
  const card={_state:{selectedPlayer:'office',queueItems:[{}],maQueueState:{items_count:563}},_readQueueSnapshot:vi.fn(async()=>{})};
  await expect(p._ensureQueueSnapshot.call(card,true,{full:true})).rejects.toThrow('complete queue');
 });
 it('requests compact queue payloads for all views without reducing queue coverage',()=>{
  const card={_homeiiEngineCommand:vi.fn(),_homeiiEngineTimeoutMs:()=>20000};
  p._homeiiEngineGetQueue.call(card,{entity_id:'media_player.office',limit_after:1000});
  expect(card._homeiiEngineCommand.mock.calls[0][1]).toEqual({compact:true,entity_id:'media_player.office',limit_after:1000});
 });
 it('selects the requested permitted player and clears pending without pretending playback',async()=>{
  const card={_state:{selectedPlayer:'old'},_config:{players:['media_player.office']},_selectPlayer:vi.fn(),_ensureNowPlayingSnapshot:vi.fn(async()=>{}),_schedulePlayerStateRefresh:vi.fn(),_syncNowPlayingUI:vi.fn()};
  card._selectPlayer.mockImplementation(player=>{card._state.selectedPlayer=player});
  await p.notifyExternalPlayback.call(card,{phase:'pending',player:'media_player.office'});
  expect(card._selectPlayer).toHaveBeenCalledWith('media_player.office',true);
  expect(card._ensureNowPlayingSnapshot).not.toHaveBeenCalled();
  await p.notifyExternalPlayback.call(card,{phase:'accepted',player:'media_player.office'});
  expect(card._ensureNowPlayingSnapshot).toHaveBeenCalledOnce();
  await p.notifyExternalPlayback.call(card,{phase:'accepted',player:'media_player.other'});
  expect(card._ensureNowPlayingSnapshot).toHaveBeenCalledOnce();
  await p.notifyExternalPlayback.call(card,{phase:'pending',player:'media_player.office'});
  expect(card._selectPlayer).toHaveBeenCalledOnce();
 });
 it('applies current track while a large queue is still loading, ignoring obsolete player results',async()=>{
  let finish;const card={_state:{selectedPlayer:'media_player.office',maQueueState:{current_item:{name:'old'}}},_homeiiEngineGetQueue:vi.fn(()=>new Promise(r=>finish=r)),_getQueueItemStableId:()=>'',_commitNowPlayingSnapshot:p._commitNowPlayingSnapshot,_syncNowPlayingUI:vi.fn()};
  const task=p._ensureNowPlayingSnapshot.call(card);
  finish({state_only:true,queue_state:{state:'playing',current_item:{name:'new'}}});await task;
  expect(card._state.maQueueState.current_item.name).toBe('new');
  expect(card._homeiiEngineGetQueue).toHaveBeenCalledWith({entity_id:'media_player.office',state_only:true});
  const old=p._ensureNowPlayingSnapshot.call(card);card._state.selectedPlayer='other';finish({queue_state:{current_item:{name:'stale'}}});await old;
  expect(card._state.maQueueState.current_item.name).toBe('new');
 });
});
