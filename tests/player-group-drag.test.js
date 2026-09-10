// @vitest-environment jsdom
import {it,expect,vi} from 'vitest';
import {bindPlayerGrouping} from '../src/core/media/player-choice.js';
const {document, Event} = globalThis;
it('preserves the target group and waits for confirmation before success',async()=>{
 const host=document.createElement('div');document.body.append(host);
 host.innerHTML='<div data-group-player="a"><button data-group-drag></button></div><div data-group-player="b"></div>';
 let finish;
 const card={_getAvailableGroupPlayers:()=>[{entity_id:'a'},{entity_id:'b'}],_currentSpeakerGroupMemberIds:id=>id==='a'?['a']:['b','c'],_applySpeakerGroupFor:vi.fn(()=>new Promise(resolve=>finish=resolve)),_m:a=>a,_toastSuccess:vi.fn(),_toastError:vi.fn(),_mediaControlFailureMessage:String};
 bindPlayerGrouping(card,host);
 const drag=new Event('dragstart',{bubbles:true});drag.dataTransfer={setData:vi.fn()};host.querySelector('button').dispatchEvent(drag);
 const target=host.querySelector('[data-group-player="b"]');target.dispatchEvent(new Event('dragover',{bubbles:true,cancelable:true}));target.dispatchEvent(new Event('drop',{bubbles:true,cancelable:true}));
 expect(card._applySpeakerGroupFor).toHaveBeenCalledWith('b',['b','c','a']);
 expect(card._toastSuccess).not.toHaveBeenCalled();expect(host.getAttribute('aria-busy')).toBe('true');
 finish(true);await Promise.resolve();await Promise.resolve();
 expect(card._toastSuccess).toHaveBeenCalledOnce();expect(host.hasAttribute('aria-busy')).toBe(false);host.remove();
});

it('keeps a stable touch target and cancels a gesture without grouping',()=>{
 const host=document.createElement('div');document.body.append(host);
 host.innerHTML='<div data-group-player="a"><button data-group-drag></button></div><div data-group-player="b"></div>';
 const rows=host.querySelectorAll('[data-group-player]');
 rows[0].getBoundingClientRect=()=>({left:0,right:100,top:0,bottom:100});
 rows[1].getBoundingClientRect=()=>({left:0,right:100,top:150,bottom:250});
 const card={_getAvailableGroupPlayers:()=>[{entity_id:'a'},{entity_id:'b'}],_applySpeakerGroupFor:vi.fn()};
 bindPlayerGrouping(card,host);
 const pointer=(type,x,y)=>Object.assign(new Event(type,{bubbles:true,cancelable:true}),{pointerType:'touch',pointerId:1,clientX:x,clientY:y});
 rows[0].querySelector('button').dispatchEvent(pointer('pointerdown',40,40));
 const add=vi.spyOn(rows[1].classList,'add');
 host.dispatchEvent(pointer('pointermove',40,180));host.dispatchEvent(pointer('pointermove',45,185));
 expect(add).toHaveBeenCalledTimes(1);
 host.dispatchEvent(pointer('pointercancel',45,185));host.dispatchEvent(pointer('pointerup',45,185));
 expect(card._applySpeakerGroupFor).not.toHaveBeenCalled();
 expect(host.querySelector('.player-group-preview')).toBeNull();host.remove();
});


it('connects and disconnects directly in the group screen while preserving other members',async()=>{
 const host=document.createElement('div');host.innerHTML='<button data-group-quick="c">Connect</button>';
 const card={_state:{selectedPlayer:'a',menuPage:'group'},_currentSpeakerGroupOwnerId:()=> 'a',_currentSpeakerGroupMemberIds:id=>id==='a'?['a','b']:['c'],_applySpeakerGroupFor:vi.fn(async()=>true),_renderMobileMenu:vi.fn()};
 bindPlayerGrouping(card,host);host.querySelector('button').click();await Promise.resolve();
 expect(card._applySpeakerGroupFor).toHaveBeenCalledWith('a',['a','b','c']);
 card._currentSpeakerGroupMemberIds=()=>['a','b','c'];host.querySelector('button').click();await Promise.resolve();
 expect(card._applySpeakerGroupFor).toHaveBeenLastCalledWith('a',['a','b']);
});

it.each(['mouse','touch'])('groups with a short %s pointer drag and preserves a tap',async(pointerType)=>{
 const host=document.createElement('div');document.body.append(host);host.innerHTML='<div data-group-player="a"><button data-group-drag></button></div><div data-group-player="b"></div>';
 const rows=host.querySelectorAll('[data-group-player]');rows[0].getBoundingClientRect=()=>({left:0,right:100,top:0,bottom:100});rows[1].getBoundingClientRect=()=>({left:0,right:100,top:110,bottom:210});
 const card={_getAvailableGroupPlayers:()=>[{entity_id:'a'},{entity_id:'b'}],_currentSpeakerGroupMemberIds:id=>[id],_applySpeakerGroupFor:vi.fn(async()=>true),_m:a=>a,_toastSuccess:vi.fn()};bindPlayerGrouping(card,host);
 const send=(node,type,x,y)=>node.dispatchEvent(Object.assign(new Event(type,{bubbles:true,cancelable:true}),{pointerType,pointerId:2,button:0,clientX:x,clientY:y}));
 send(rows[0].firstChild,'pointerdown',40,40);send(host,'pointerup',40,40);expect(card._applySpeakerGroupFor).not.toHaveBeenCalled();
 send(rows[0].firstChild,'pointerdown',40,40);send(host,'pointermove',40,47);expect(host.querySelector('.player-group-preview')).not.toBeNull();send(host,'pointermove',40,150);send(host,'pointerup',40,150);expect(card._applySpeakerGroupFor).toHaveBeenCalledWith('b',['b','a']);await Promise.resolve();host.remove();
});
