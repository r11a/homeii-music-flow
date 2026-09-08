// @vitest-environment jsdom
import { afterAll, afterEach, describe, expect, it, vi } from 'vitest';
import '../src/homeii-music-flow.js';
vi.hoisted(()=>{vi.useFakeTimers();});
afterEach(()=>vi.clearAllTimers());
afterAll(()=>vi.useRealTimers());
const prototype=globalThis.customElements.get('homeii-music-flow').prototype;
const results=name=>({tracks:name ? [{name,uri:`library://track/${name}`}]:[]});
function fixture(search) {
  const body=globalThis.document.createElement('div');
  body.innerHTML='<div id="mobileMediaSearchResults"></div>';
  const card={_state:{menuOpen:true,menuPage:'library_search',mediaQuery:'music'},
    $:id=>id==='mobileMenuBody'?body:null,_isMobileSearchPage:()=>true,
    _cachedLibrarySearchResults:()=>results(),_hasSearchResults:r=>!!r.tracks?.length,
    _mediaSearchSectionsHtml:r=>r.tracks.map(item=>item.name).join(' ') || 'No results',
    _loadingStateHtml:()=>'<span>Loading</span>',_hydrateImages:vi.fn(),_searchPreviewResults:async()=>results(),
    _withTimeout:promise=>promise,_musicAssistantTimeoutMs:()=>20000,_timeoutMessage:String,
    _emptySearchResults:()=>results(),_mergeSearchResults:(a,b)=>({tracks:[...a.tracks,...b.tracks]}),
    _search:vi.fn(search),_debugLog:vi.fn(),_i18n:String,_esc:String,_m:text=>text};
  return {card,body,render:()=>prototype._renderMobileMediaResults.call(card)};
}
describe('search failure and late response handling',()=>{
  it('propagates provider failures from a library tab instead of returning an empty list',async()=>{
    const card={_libraryTabSearchResultGroup:()=> 'albums',_search:vi.fn(async()=>{throw new Error('Provider offline');}),_dedupeLibraryItems:items=>items};
    await expect(prototype._searchLibraryTabProviderItems.call(card,{type:'album'},'music',60)).rejects.toThrow('Provider offline');
    expect(card._search).toHaveBeenCalledExactlyOnceWith('music',{providerOnly:true,strict:true,limit:60});
  });
  it('allows a preferred section order without hiding unspecified sections or changing defaults',()=>{
    const card={_config:{},_i18n:String,_esc:String,_mediaItemsListHtml:(items,type)=>`<p>${type}</p>`};
    const input={radio:[{}],artists:[{}],tracks:[{}]};
    const html=()=>prototype._mediaSearchSectionsHtml.call(card,input);
    expect(html().indexOf('<p>radio')).toBeLessThan(html().indexOf('<p>artist'));
    card._config.search_result_order=['tracks','tracks','artists'];
    expect(html().indexOf('<p>track')).toBeLessThan(html().indexOf('<p>artist'));
    expect(html().indexOf('<p>artist')).toBeLessThan(html().indexOf('<p>radio'));
    expect(html().match(/<p>track/g)).toHaveLength(1);
  });
  it('shows a retryable failure instead of an authoritative empty result',async()=>{
    const {body,render}=fixture(async()=>{throw new Error('Offline');});
    const pending=render(); await vi.advanceTimersByTimeAsync(650); await pending;
    expect(body.textContent).toContain('Search could not be completed');
    expect(body.textContent).not.toContain('No results');
    expect(body.querySelector('[data-menu-action="retry_library"]')).not.toBeNull();
  });
  it('keeps provider results when library search fails',async()=>{
    const {body,render}=fixture(async(query,options)=>{if(options.fastOnly)throw new Error('Library failed');return results('Provider track');});
    const pending=render();await vi.advanceTimersByTimeAsync(650);await pending;
    expect(body.textContent).toContain('Provider track');
    expect(body.textContent).toContain('Some search sources');
  });
  it('does not let an older request for the same query replace a retry',async()=>{
    let resolveOld;
    let providers=0;
    const {body,render}=fixture(async(query,options)=>options.fastOnly?results():++providers===1?new Promise(resolve=>{resolveOld=resolve;}):results('New result'));
    const old=render();await vi.advanceTimersByTimeAsync(650);
    const next=render();await vi.advanceTimersByTimeAsync(650);await next;
    resolveOld(results('Old result'));await old;
    expect(body.textContent).toBe('New result');
  });
  it('preserves an authoritative successful empty result',async()=>{
    const {body,render}=fixture(async()=>results());
    const pending=render();await vi.advanceTimersByTimeAsync(650);await pending;
    expect(body.textContent).toBe('No results');
    expect(body.querySelector('[role="alert"]')).toBeNull();
  });
  it('propagates Engine failures in strict interactive search',async()=>{
    const card={_homeiiEngineEnabled:()=>true,_ensureHomeiiEngineReadyForAction:async()=>true,
      _homeiiEngineSearch:async()=>{throw new Error('Offline');},_state:{},_debugLog:vi.fn(),_handleMusicAssistantIssue:vi.fn(),_emptySearchResults:()=>results()};
    await expect(prototype._search.call(card,'music',{strict:true})).rejects.toThrow('Offline');
  });
});
describe('large library paging',()=>{
  function libraryFixture(command) {
    const card={_state:{engineCapabilities:{library_pagination:true}},_cache:{library:new Map()},
      _homeiiEngineEnabled:()=>true,_ensureHomeiiEngineReadyForAction:async()=>true,
      _homeiiEngineGetLibrary:vi.fn(command),_normalizeSearchItem:item=>item,
      _debugLog:vi.fn(),_handleMusicAssistantIssue:vi.fn(),_m:text=>text};
    card._fetchLibrary=prototype._fetchLibrary;
    return card;
  }
  it('loads 691 items with offsets and preserves their order',async()=>{
    const items=Array.from({length:691},(_,index)=>({uri:`library://playlist/${index}`}));
    const card=libraryFixture(async({offset,limit})=>({items:items.slice(offset,offset+limit)}));
    expect(await card._fetchLibrary('playlist','sort_name',750)).toEqual(items);
    expect(card._homeiiEngineGetLibrary.mock.calls.map(([args])=>[args.offset,args.limit])).toEqual([[0,500],[500,250]]);
  });
  it('rejects a failed later page without reporting a partial library as complete',async()=>{
    const card=libraryFixture(async({offset})=>{if(offset)throw new Error('Page failed');return {items:Array.from({length:500},(_,index)=>({uri:`library://playlist/${index}`}))};});
    await expect(card._fetchLibrary('playlist','sort_name',750)).rejects.toThrow('Page failed');
  });
  it('rejects repeated pages and a revision change across pages',async()=>{
    const items=Array.from({length:500},(_,index)=>({uri:`library://playlist/${index}`}));
    const repeat=libraryFixture(async()=>({items}));
    await expect(repeat._fetchLibrary('playlist','sort_name',750)).rejects.toThrow('Library changed');
    const changed=libraryFixture(async({offset})=>({items,snapshot:{epoch:'server',revision:offset?2:1}}));
    await expect(changed._fetchLibrary('playlist','sort_name',750)).rejects.toThrow('Library changed');
  });
  it('does not send an unsupported offset to an older Engine',async()=>{
    const card=libraryFixture(async()=>({items:[]}));card._state.engineCapabilities={};
    await card._fetchLibrary('playlist','sort_name',250);
    expect(card._homeiiEngineGetLibrary.mock.calls[0][0]).not.toHaveProperty('offset');
  });
});
