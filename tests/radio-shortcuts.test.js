// @vitest-environment jsdom
import {it,expect,vi} from 'vitest';
import {pinnedRadios,radioShortcutsHtml,mountRadioPinEditor,bindRadioShortcuts} from '../src/core/media/radio-shortcuts.js';
const {document,localStorage,Event}=globalThis;
it('pins at most five stations per card and plays through the existing route',async()=>{
 localStorage.clear();const root=document.createElement('div');document.body.append(root);
 const card={_lsKey:k=>'card-a-'+k,_config:{},_esc:String,_m:a=>a,_iconSvg:()=>'',shadowRoot:root,$:()=>null,_playMedia:vi.fn(async()=>true)};
 const body=document.createElement('div');root.append(body);
 mountRadioPinEditor(card,body,Array.from({length:6},(_,i)=>({uri:`library://radio/${i}`,name:`Station ${i}`})));
 body.querySelectorAll('input').forEach(input=>{input.checked=true;input.dispatchEvent(new Event('change',{bubbles:true}));});
 expect(pinnedRadios(card)).toHaveLength(5);expect(body.querySelectorAll('input')[5].checked).toBe(false);
 expect(pinnedRadios({...card,_lsKey:k=>'other-'+k})).toEqual([]);
 root.innerHTML=radioShortcutsHtml(card);bindRadioShortcuts(card);root.querySelector('button').click();
 expect(card._playMedia).toHaveBeenCalledWith('library://radio/0','radio','play',expect.objectContaining({label:'Station 0'}));
 expect(radioShortcutsHtml({...card,_isCompactTileMode:()=>true})).toBe('');root.remove();localStorage.clear();
});
