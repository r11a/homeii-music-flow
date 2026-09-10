// @vitest-environment jsdom
import {it,expect,vi} from 'vitest';
import {renderSavedPlaylists} from '../src/core/media/playlist-actions.js';
const {document,Event}=globalThis;
it('saves a queue snapshot once and refreshes persisted entries',async()=>{
 const body=document.createElement('div');document.body.append(body);
 const card={_state:{menuPage:'saved_playlists'},_m:a=>a,_esc:String,_getNowPlayingQueueItems:()=>[{uri:'spotify://track/a'}],_getQueueItemUri:item=>item.uri,_mediaControlFailureMessage:String,_homeiiEngineCommand:vi.fn(async(_,args)=>args.action==='list'?[]:{id:'one'})};
 await renderSavedPlaylists(card,body);body.querySelector('input').value='My mix';
 const form=body.querySelector('form');form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
 await vi.waitFor(()=>expect(card._homeiiEngineCommand).toHaveBeenCalledTimes(3));
 expect(card._homeiiEngineCommand.mock.calls.filter(([,args])=>args.action==='save')).toEqual([['playlists',{action:'save',name:'My mix',uris:['spotify://track/a']}]]);body.remove();
});
it('ignores a playlist response when the user leaves the page',async()=>{
 const body=document.createElement('div');document.body.append(body);let finish;
 const card={_state:{menuPage:'saved_playlists'},_m:a=>a,_esc:String,_homeiiEngineCommand:()=>new Promise(resolve=>finish=resolve)};
 const pending=renderSavedPlaylists(card,body);card._state.menuPage='players';body.textContent='Players';finish([]);await pending;expect(body.textContent).toBe('Players');body.remove();
});
it('does not replace the next screen after an in-flight save completes',async()=>{
 const body=document.createElement('div');document.body.append(body);let finish;
 const card={_state:{menuPage:'saved_playlists'},_m:a=>a,_esc:String,_getNowPlayingQueueItems:()=>[{uri:'library://track/1'}],_getQueueItemUri:item=>item.uri,_mediaControlFailureMessage:String,_homeiiEngineCommand:vi.fn(async()=>[])};
 await renderSavedPlaylists(card,body);body.querySelector('input').value='Mix';
 card._homeiiEngineCommand.mockImplementation(()=>new Promise(resolve=>finish=resolve));
 body.querySelector('form').dispatchEvent(new Event('submit',{cancelable:true}));
 card._state.menuPage='players';body.textContent='Players';finish({});await Promise.resolve();await Promise.resolve();
 expect(body.textContent).toBe('Players');expect(card._homeiiEngineCommand).toHaveBeenCalledTimes(2);body.remove();
});
