// @vitest-environment jsdom
import { expect, it, vi } from "vitest";
import { createHomeiiBaseMusicCard } from "../src/core/base-music-card.js";

const proto = createHomeiiBaseMusicCard({}).prototype;

it("keeps provider IDs paired with their provider instead of inventing library IDs", () => {
  const card={_searchItemProviderMapping:()=>null,_parseMediaReference:()=>({item_id:"spotify-id",provider:"spotify"})};
  const result=proto._libraryMediaDetailCommandArgsList.call(card,{uri:"spotify://album/spotify-id",item_id:"spotify-id",provider:"spotify"},"album");
  expect(result).toEqual([{item_id:"spotify-id",provider:"spotify"}]);
});

it("uses the required MA provider parameter for every album fallback", async () => {
  const card={_config:{},_cache:{library:new Map()},_libraryDetailLoadPromises:new Map(),
    _libraryMediaDetailCommandArgsList:()=>[{item_id:"a",provider:"offline"},{item_id:"b",provider:"spotify"}],
    _callEngineMaCommand:vi.fn(async (_command,args)=>{
      expect(args.provider_instance_id_or_domain).toBeTruthy();
      expect(args).not.toHaveProperty("provider_instance_or_domain");
      if(args.provider_instance_id_or_domain==="offline")throw Error("Provider unavailable");
      return [{name:"Track",uri:"spotify://track/1"}];
    }),_libraryMediaDetailTracksFromPayload:x=>x,_sortLibraryDetailTracks:x=>x};
  card._loadLibraryMediaDetailTracks=entry=>proto._loadLibraryMediaDetailTracks.call(card,entry);
  expect(await card._loadLibraryMediaDetailTracks({uri:"spotify://album/a",media_type:"album"})).toHaveLength(1);
  expect(card._callEngineMaCommand).toHaveBeenCalledTimes(2);
});

it("reuses a larger fresh page without mixing favorites or sorting", async () => {
  const items = Array.from({length:100}, (_,id)=>({id}));
  const card = {_config:{}, _state:{}, _cache:{library:new Map([
    ["album:sort_name:250:false",{ts:Date.now(),items}],
  ])}, _libraryLoadPromises:new Map(), _fetchLibrary:vi.fn(async()=>[])};
  expect(await proto._getLibrary.call(card,"album","sort_name",60,false)).toEqual(items.slice(0,60));
  expect(card._fetchLibrary).not.toHaveBeenCalled();
  await proto._getLibrary.call(card,"album","sort_name",60,true);
  expect(card._fetchLibrary).toHaveBeenCalledWith("album","sort_name",60,true);
});

it("returns artist albums before slow recommendations and skips redundant fallbacks", async () => {
  let finish;
  const album={uri:"library://album/1",name:"Album",year:2024};
  const card={_config:{},_cache:{library:new Map()},_state:{},_artistDetailLoadPromises:new Map(),
    _artistName:()=>"Artist",_normalizeSearchItem:x=>x,
    _libraryMediaDetailCommandArgsList:()=>[{item_id:"1",provider:"library"}],
    _libraryMediaItemsFromPayload:raw=>Array.isArray(raw)?raw:[],
    _normalizeArtistAlbumCandidate:x=>x,_dedupeArtistAlbums:x=>x,_mediaYearValue:x=>x.year,
    _isHebrew:()=>false,_search:vi.fn(),_fetchLibrary:vi.fn(),
    _callEngineMaCommand:vi.fn(async command=>command==="music/item_by_uri"?{name:"Artist"}:[album]),
    _loadArtistPlaylistRecommendations:()=>new Promise(resolve=>{finish=resolve;})};
  card._loadLibraryArtistDetail=entry=>proto._loadLibraryArtistDetail.call(card,entry);
  const detail=await card._loadLibraryArtistDetail({uri:"library://artist/1",name:"Artist"});
  expect(detail.albums).toEqual([{...album,media_type:"album"}]);
  expect(detail.playlists).toEqual([]);
  expect(card._callEngineMaCommand).toHaveBeenCalledTimes(2);
  expect(card._search).not.toHaveBeenCalled(); expect(card._fetchLibrary).not.toHaveBeenCalled();
  finish([{uri:"library://playlist/1"}]); await Promise.resolve();
  expect(detail.playlists).toHaveLength(1);
});
