// @vitest-environment jsdom
import { afterAll, describe, expect, it, vi } from "vitest";
import "../src/homeii-music-flow.js";
vi.hoisted(() => { vi.useFakeTimers(); });
afterAll(() => { vi.clearAllTimers(); vi.useRealTimers(); });
const prototype = globalThis.customElements.get("homeii-music-flow").prototype;
function context() {
  const card = {
    _config: {}, _cache: { library: new Map() }, _libraryDetailLoadPromises: new Map(),
    _libraryMediaDetailCommandArgsList: () => [{ item_id: "7", provider: "library" }],
    _callEngineMaCommand: vi.fn(async () => [{ uri: "provider://podcast_episode/2", name: "Episode two", media_type: "podcast_episode" }]),
    _normalizeSearchItem: (item) => item, _artUrl: () => "", _m: (english) => english,
  };
  for (const key of ["_loadLibraryMediaDetailTracks", "_libraryMediaDetailTracksFromPayload", "_normalizeLibraryDetailTrack"]) card[key] = prototype[key];
  return card;
}
describe("podcast episode details", () => {
  it("opens details for podcasts and returns to the podcast library", () => {
    expect(prototype._mediaTypeCanOpenDetails("podcast")).toBe(true);
    expect(prototype._libraryDetailParentPageForType("podcast")).toBe("library_podcasts");
  });
  it("loads MA episodes using the installed API contract and preserves their media type", async () => {
    const card = context();
    const episodes = await card._loadLibraryMediaDetailTracks({ uri: "library://podcast/7", media_type: "podcast" });
    expect(card._callEngineMaCommand).toHaveBeenCalledExactlyOnceWith("music/podcasts/podcast_episodes", { item_id: "7", provider_instance_id_or_domain: "library" });
    expect(episodes[0]).toMatchObject({ media_type: "podcast_episode", uri: "provider://podcast_episode/2" });
  });
  it("coalesces requests and caches an authoritative empty episode list", async () => {
    const card = context();
    card._callEngineMaCommand.mockResolvedValue([]);
    const entry = { uri: "library://podcast/7", media_type: "podcast" };
    await Promise.all([card._loadLibraryMediaDetailTracks(entry), card._loadLibraryMediaDetailTracks(entry)]);
    await card._loadLibraryMediaDetailTracks(entry);
    expect(card._callEngineMaCommand).toHaveBeenCalledOnce();
  });
  it("surfaces an episode fetch failure instead of caching a fake empty list", async () => {
    const card = context();
    card._callEngineMaCommand.mockRejectedValue(new Error("MA offline"));
    await expect(card._loadLibraryMediaDetailTracks({ uri: "library://podcast/7", media_type: "podcast" })).rejects.toThrow("MA offline");
    expect(card._cache.library.size).toBe(0);
  });
});

describe("album and playlist detail reliability", () => {
  it("preserves MA order when track metadata is missing or partial", () => {
    const tracks=[{name:'Zebra',track_number:2},{name:'Alpha'},{name:'Middle',track_number:1}];
    expect(prototype._sortLibraryDetailTracks(tracks)).toEqual(tracks);
    expect(prototype._sortLibraryDetailTracks([{name:'Zebra'},{name:'Alpha'}]).map(item=>item.name)).toEqual(['Zebra','Alpha']);
  });
  it("sorts complete multi-disc metadata without mutating the source or sorting equal titles", () => {
    const tracks=[{name:'Disc 2',disc_number:2,track_number:1},{name:'Zebra',disc_number:1,track_number:2},{name:'Alpha',disc_number:1,track_number:2},{name:'First',disc_number:1,track_number:1}];
    expect(prototype._sortLibraryDetailTracks(tracks).map(item=>item.name)).toEqual(['First','Zebra','Alpha','Disc 2']);
    expect(tracks[0].name).toBe('Disc 2');
    expect(prototype._sortLibraryDetailTracks([{name:'Zebra',disc_number:2,track_number:1},{name:'Alpha',track_number:1}]).map(item=>item.name)).toEqual(['Zebra','Alpha']);
  });
  function libraryContext() {
    return { ...context(), _sortLibraryDetailTracks: (items) => items,
      _loadLibraryMediaDetailTracksViaHaBrowse: async () => [],
      _loadLibraryMediaDetailTracksViaLibrarySearch: async () => [] };
  }
  it("preserves the provider's playlist order instead of sorting by album track number or title", async () => {
    const card = libraryContext();
    card._sortLibraryDetailTracks = vi.fn((tracks) => [...tracks].reverse());
    card._callEngineMaCommand.mockResolvedValue([
      { uri: "spotify://track/z", name: "Zebra", media_type: "track", track_number: 7 },
      { uri: "spotify://track/a", name: "Alpha", media_type: "track", track_number: 1 },
    ]);
    const tracks = await card._loadLibraryMediaDetailTracks({ uri: "spotify://playlist/7", media_type: "playlist" });
    expect(tracks.map((track) => track.name)).toEqual(["Zebra", "Alpha"]);
    expect(card._sortLibraryDetailTracks).not.toHaveBeenCalled();
  });
  it("accepts a one-track album without duplicate provider lookups", async () => {
    const card = libraryContext();
    card._callEngineMaCommand.mockResolvedValue([{ uri: "provider://track/1", name: "Single", media_type: "track" }]);
    expect(await card._loadLibraryMediaDetailTracks({ uri: "library://album/7", media_type: "album" })).toHaveLength(1);
    expect(card._callEngineMaCommand).toHaveBeenCalledOnce();
  });
  it("caches a real empty playlist instead of retrying aliases", async () => {
    const card = libraryContext();
    card._callEngineMaCommand.mockResolvedValue([]);
    const entry = { uri: "library://playlist/7", media_type: "playlist" };
    await card._loadLibraryMediaDetailTracks(entry);
    await card._loadLibraryMediaDetailTracks(entry);
    expect(card._callEngineMaCommand).toHaveBeenCalledOnce();
  });
  it("does not present a failed playlist request as an empty playlist", async () => {
    const card = libraryContext();
    card._callEngineMaCommand.mockRejectedValue(new Error("MA unavailable"));
    await expect(card._loadLibraryMediaDetailTracks({ uri: "library://playlist/7", media_type: "playlist" })).rejects.toThrow("MA unavailable");
    expect(card._cache.library.size).toBe(0);
  });
});
