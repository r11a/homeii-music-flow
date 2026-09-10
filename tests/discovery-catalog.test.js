// @vitest-environment jsdom
import { afterAll, describe, expect, it, vi } from "vitest";
import "../src/homeii-music-flow.js";
vi.hoisted(() => { vi.useFakeTimers(); });
afterAll(() => { vi.clearAllTimers(); vi.useRealTimers(); });
const prototype = globalThis.customElements.get("homeii-music-flow").prototype;
const spotify = { name: "Spotify", media_type: "folder", path: "spotify--one://" };
const tidal = { name: "Tidal", media_type: "folder", path: "tidal--two://" };
function context(state = {}) {
  return {
    _state: state, _cache: { library: new Map() }, _m: (text) => text,
    _discoveryCategoryOptions: () => [{ key: "pop", label: "Pop" }],
    _discoveryCategory: () => ({ key: "pop", label: "Pop" }),
    _discoveryPopularGenreProfiles: () => [{ key: "pop", query: "pop", aliases: ["pop"] }],
    _discoveryGenreKey: (value) => String(value).toLowerCase(), _discoveryUniqueItems: (items) => items,
    _normalizeSearchResponse: (items) => ({ playlists: [], albums: [], ...items }),
    _fetchRadioBrowserStations: vi.fn(async () => [{ name: "Pop Radio", media_type: "radio", uri: "https://radio.test/pop" }]),
    _callEngineMaCommand: vi.fn(async (command) => {
      if (command === "music/browse") return [spotify, tidal];
      if (command === "music/genres/library_items") return [{ item_id: "4", name: "Pop" }];
      if (command === "music/search") return { playlists: [{ name: "Pop Hits", uri: "spotify://playlist/a" }] };
      return [];
    }),
  };
}
describe("genre discovery across sources", () => {
  it("uses returned Spotify genre paths and avoids title search when a real category exists", async () => {
    const card = context({ discoveryProviderPath: spotify.path });
    const fallback = card._callEngineMaCommand;
    card._callEngineMaCommand = vi.fn(async (command, args) => {
      if (command === "music/browse" && args.path === spotify.path) return [{ media_type: "folder", path: "spotify--one://categories" }];
      if (command === "music/browse" && args.path === "spotify--one://categories") return [{ name: "Pop", media_type: "folder", path: "spotify--one://categories/real-id" }];
      if (command === "music/browse" && args.path === "spotify--one://categories/real-id") return [{ name: "Today’s Top Hits", media_type: "playlist", uri: "spotify://playlist/curated" }];
      return fallback(command, args);
    });
    const result = await prototype._loadDiscoverySections.call(card);
    expect(result.sections[0].items[0].uri).toBe("spotify://playlist/curated");
    expect(card._callEngineMaCommand.mock.calls.some(([command]) => command === "music/search")).toBe(false);
    expect(result.sections[0].description).toBe("");
  });
  it("keeps mounted controls and images across identical refreshes", () => {
    const body = globalThis.document.createElement("div");
    const card = { _discoveryMenuHtml: (view) => `<div class="discovery-catalog"><select><option>${view.name}</option></select></div>` };
    prototype._updateDiscoveryMenuBody.call(card, body, { name: "Pop" });
    const select = body.querySelector("select");
    prototype._updateDiscoveryMenuBody.call(card, body, { name: "Pop" });
    expect(body.querySelector("select")).toBe(select);
    prototype._updateDiscoveryMenuBody.call(card, body, { name: "Rock" });
    expect(body.querySelector("select")).not.toBe(select);
    expect(body.textContent).toBe("Rock");
  });
  it("shares an in-flight load and reuses results across player refreshes", async () => {
    const card = context();
    const [first, second] = await Promise.all([
      prototype._loadDiscoverySections.call(card), prototype._loadDiscoverySections.call(card),
    ]);
    expect(second).toBe(first);
    expect(await prototype._loadDiscoverySections.call(card)).toBe(first);
    expect(card._callEngineMaCommand.mock.calls.filter(([command]) => command === "music/search")).toHaveLength(1);
    expect(card._fetchRadioBrowserStations).toHaveBeenCalledTimes(1);
  });
  it("searches connected providers and filters the library with real MA genre IDs", async () => {
    const card = context();
    const result = await prototype._loadDiscoverySections.call(card);
    expect(card._callEngineMaCommand).toHaveBeenCalledWith("music/search", { search_query: "pop", media_types: ["playlist"], limit: 16, providers: ["spotify--one", "tidal--two"] });
    expect(card._callEngineMaCommand).toHaveBeenCalledWith("music/albums/library_items", { genre: [4], limit: 12 });
    expect(card._fetchRadioBrowserStations).toHaveBeenCalledWith("", 16, { tag: "pop" });
    expect(result.sections.map((section) => section.items.length)).toEqual([1, 0, 1]);
  });
  it("respects the selected provider without changing the MA library scope", async () => {
    const card = context({ discoveryProviderPath: tidal.path });
    await prototype._loadDiscoverySections.call(card);
    expect(card._callEngineMaCommand).toHaveBeenCalledWith("music/search", expect.objectContaining({ providers: ["tidal--two"] }));
    expect(card._callEngineMaCommand).toHaveBeenCalledWith("music/tracks/library_items", { genre: [4], limit: 12 });
  });
  it("retains healthy sections when a source fails", async () => {
    const card = context();
    card._fetchRadioBrowserStations.mockRejectedValue(new Error("offline"));
    const result = await prototype._loadDiscoverySections.call(card);
    expect(result.sections[0].items).toHaveLength(1);
    expect(result.sections[2].error).toBeTruthy();
  });
  it("does not invent library recommendations when the genre has no mapping", async () => {
    const card = context();
    card._cache.library.set("discovery:library-genres", { ts: Date.now(), items: [{ item_id: "8", name: "Jazz" }] });
    const result = await prototype._loadDiscoverySections.call(card);
    expect(result.sections[1].items).toEqual([]);
    expect(card._callEngineMaCommand.mock.calls.some(([command]) => command === "music/albums/library_items")).toBe(false);
  });
  it("uses radio genre tags instead of filtering station names", async () => {
    const fetch = vi.fn(async () => ({ ok: true, json: async () => [] }));
    vi.stubGlobal("fetch", fetch);
    try {
      await prototype._fetchRadioBrowserStations.call({}, "", 16, { tag: "pop" });
      const url = new URL(fetch.mock.calls[0][0]);
      expect(url.searchParams.get("tag")).toBe("pop");
      expect(url.searchParams.get("tagExact")).toBe("true");
      expect(url.searchParams.has("name")).toBe(false);
    } finally { vi.unstubAllGlobals(); }
  });
});
