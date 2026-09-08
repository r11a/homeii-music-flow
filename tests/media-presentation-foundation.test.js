import { describe, expect, it } from "vitest";

import {
  artUrl,
  artistName,
  buildCurrentTrackInfo,
  coercePlaybackSeconds,
  coerceLyricsRawText,
  coerceLyricsText,
  extractCurrentLyricsRawText,
  extractCurrentLyricsText,
  formatDuration,
  imageProxyUrl,
  imageProxyIdUrl,
  imageUrl,
  legacyImageProxyFallbackUrl,
  normalizeImageProxySize,
  normalizeImageProxyUrl,
  normalizeMediaItem,
  parsePlaybackTimestampMs,
  parseLrcLyrics,
  qualityBadgeLabel,
  rebaseImageProxyUrl,
  sourceProviderMeta,
  stripLyricsTimestamps,
} from "../src/core/media/presentation.js";

describe("media presentation foundation", () => {
  it("builds track info from player and queue item", () => {
    expect(buildCurrentTrackInfo({
      player: {
        attributes: {
          media_title: "Fallback Track",
          media_artist: "Fallback Artist",
          media_album_name: "Fallback Album",
          media_duration: 120,
        },
      },
      queueItem: {
        duration: 245,
        media_item: {
          name: "Track A",
          artists: [{ name: "Artist A" }],
          album: { name: "Album A" },
        },
      },
    })).toEqual({
      title: "Track A",
      artist: "Artist A",
      album: "Album A",
      duration: 245,
      key: "track a|artist a|album a",
    });
  });

  it("normalizes provider and quality badges", () => {
    expect(sourceProviderMeta("spotify")).toEqual({ key: "spotify", label: "Spotify" });
    expect(sourceProviderMeta("library", { libraryLabel: "My Library" })).toEqual({ key: "library", label: "My Library" });
    expect(qualityBadgeLabel(["24-bit 96kHz FLAC"])).toBe("Hi-Res");
    expect(qualityBadgeLabel(["lossless alac"])).toBe("Lossless");
  });

  it("normalizes and parses lyrics payloads", () => {
    expect(stripLyricsTimestamps("[00:12.00] Hello\n[ar:artist]")).toBe("Hello");
    expect(coerceLyricsRawText({ plainLyrics: "Hi\r\nThere" })).toBe("Hi\nThere");
    expect(coerceLyricsText({ plainLyrics: "[00:01.00]Hi" })).toBe("Hi");
    expect(parseLrcLyrics("[00:01.00]Line 1\n[00:02.50]Line 2")).toEqual([
      { time: 1, text: "Line 1" },
      { time: 2.5, text: "Line 2" },
    ]);
    const queueItem = {
      media_item: {
        metadata: {
          plainLyrics: "[00:03.00]Embedded lyric",
        },
      },
    };
    expect(extractCurrentLyricsRawText(queueItem)).toBe("[00:03.00]Embedded lyric");
    expect(extractCurrentLyricsText(queueItem)).toBe("Embedded lyric");
  });

  it("resolves image urls and art urls consistently", () => {
    expect(normalizeImageProxySize(72)).toBe(80);
    expect(normalizeImageProxySize(300)).toBe(512);
    expect(normalizeImageProxySize(920)).toBe(1024);
    expect(imageProxyUrl("cover/path.jpg", "spotify", 400, "https://ma.local")).toBe(
      "https://ma.local/imageproxy?path=cover%2Fpath.jpg&provider=spotify&size=512",
    );
    expect(imageProxyUrl("https://covers.example/album.jpg", "", 400, "https://ma.local")).toBe(
      "https://ma.local/imageproxy?path=https%3A%2F%2Fcovers.example%2Falbum.jpg&size=512",
    );
    expect(imageUrl("imageproxy?path=x")).toBe("/imageproxy?path=x&size=512");
    expect(imageUrl("https://covers.example/album.jpg", 300, { maUrl: "https://ma.local" })).toBe(
      "https://ma.local/imageproxy?path=https%3A%2F%2Fcovers.example%2Falbum.jpg&size=512",
    );
    expect(imageUrl({ path: "cover/path.jpg", provider: "spotify" }, 300, { maUrl: "https://ma.local" })).toBe(
      "https://ma.local/imageproxy?path=cover%2Fpath.jpg&provider=spotify&size=512",
    );
    expect(imageUrl({ url: "https://covers.example/artist.jpg" }, 300, { maUrl: "https://ma.local" })).toBe(
      "https://ma.local/imageproxy?path=https%3A%2F%2Fcovers.example%2Fartist.jpg&size=512",
    );
    expect(imageProxyIdUrl("a".repeat(64), 300, "https://ma.local")).toBe(
      `https://ma.local/imageproxy/${"a".repeat(64)}?size=512`,
    );
    expect(imageProxyIdUrl("not-a-proxy-id", 300, "https://ma.local")).toBe(null);
    expect(imageUrl({ proxy_id: "b".repeat(64), path: "legacy/path.jpg", provider: "spotify" }, 120, { maUrl: "https://ma.local" })).toBe(
      `https://ma.local/imageproxy/${"b".repeat(64)}?size=160`,
    );
    expect(legacyImageProxyFallbackUrl(
      { proxy_id: "b".repeat(64), path: "legacy/path.jpg", provider: "spotify" },
      120,
      { maUrl: "https://ma.local" },
    )).toBe("https://ma.local/imageproxy?path=legacy%2Fpath.jpg&provider=spotify&size=160");
    expect(normalizeImageProxyUrl(
      `http://192.168.1.20:8097/imageproxy/${"d".repeat(64)}?size=500`,
      300,
      "https://music.example.com/ma",
    )).toBe(`http://192.168.1.20:8097/imageproxy/${"d".repeat(64)}?size=512`);
    expect(rebaseImageProxyUrl(
      `http://192.168.1.20:8097/imageproxy/${"d".repeat(64)}?size=500`,
      300,
      "https://music.example.com/ma",
    )).toBe(`https://music.example.com/ma/imageproxy/${"d".repeat(64)}?size=512`);
    expect(imageUrl({ proxy_id: "short", path: "legacy/path.jpg", provider: "spotify" }, 120, { maUrl: "https://ma.local" })).toBe(
      "https://ma.local/imageproxy?path=legacy%2Fpath.jpg&provider=spotify&size=160",
    );
    expect(imageUrl({
      local_image_encoded: `${"/9j/"}${"a".repeat(96)}`,
    }, 120, { maUrl: "https://ma.local" })).toBe(
      `data:image/jpeg;base64,${"/9j/"}${"a".repeat(96)}`,
    );
    expect(artUrl({
      album: { metadata: { images: [{ path: "album/path.png", provider: "library" }] } },
    }, "https://ma.local")).toBe(
      "https://ma.local/imageproxy?path=album%2Fpath.png&provider=library&size=512",
    );
    expect(artUrl({
      media_item: {
        metadata: {
          images: [{ image_proxy_id: "c".repeat(64), fmt: "png" }],
        },
      },
    }, "https://ma.local", 120)).toBe(
      `https://ma.local/imageproxy/${"c".repeat(64)}?size=160&fmt=png`,
    );
    expect(artUrl({
      media_item: { image: { path: "queue/path.png", provider: "library" } },
    }, "https://ma.local")).toBe(
      "https://ma.local/imageproxy?path=queue%2Fpath.png&provider=library&size=512",
    );
    expect(artUrl({
      homeii_artwork_url: "/api/homeii_flow/artwork/item/opaque-token",
      image: "https://ma.local/imageproxy?path=legacy.jpg",
    }, "https://ma.local")).toBe(
      "/api/homeii_flow/artwork/item/opaque-token",
    );
    expect(artUrl({
      media_item: {
        homeii_artwork_url: "/api/homeii_flow/artwork/item/nested-token",
        image: "https://ma.local/imageproxy/old",
      },
    }, "https://ma.local")).toBe(
      "/api/homeii_flow/artwork/item/nested-token",
    );
    expect(artUrl({
      thumbnail: { path: "thumb/path.png", provider: "library" },
    }, "https://ma.local")).toBe(
      "https://ma.local/imageproxy?path=thumb%2Fpath.png&provider=library&size=512",
    );
  });

  it("formats artists, durations, and normalized media items", () => {
    expect(artistName({ artists: [{ name: "A" }, { name: "B" }] })).toBe("A, B");
    expect(formatDuration(245)).toBe("4:05");
    expect(formatDuration("4:05")).toBe("4:05");
    expect(coercePlaybackSeconds("PT4M05S")).toBe(245);
    expect(coercePlaybackSeconds(245000)).toBe(245);
    expect(formatDuration(0)).toBe("0:00");
    expect(normalizeMediaItem({
      album: { image: { path: "folder/art.jpg", provider: "spotify" } },
    }, "https://ma.local")).toMatchObject({
      image_url: "https://ma.local/imageproxy?path=folder%2Fart.jpg&provider=spotify&size=512",
    });
  });

  it("parses playback timestamps consistently across browser formats", () => {
    const now = Date.UTC(2026, 4, 27, 12, 0, 5);
    const explicitUtc = parsePlaybackTimestampMs("2026-05-27T12:00:00.123456+00:00");
    const spaceSeparatedUtc = parsePlaybackTimestampMs("2026-05-27 12:00:00.123456", { now });
    expect(explicitUtc).toBe(Date.UTC(2026, 4, 27, 12, 0, 0, 123));
    expect(spaceSeparatedUtc).toBe(Date.UTC(2026, 4, 27, 12, 0, 0, 123));
    expect(parsePlaybackTimestampMs(1800000000)).toBe(1800000000000);
  });
});
