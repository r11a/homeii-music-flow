import { describe, expect, it } from "vitest";

import {
  artUrl,
  artistName,
  buildCurrentTrackInfo,
  coerceLyricsRawText,
  coerceLyricsText,
  extractCurrentLyricsRawText,
  extractCurrentLyricsText,
  formatDuration,
  imageProxyUrl,
  imageUrl,
  normalizeMediaItem,
  parseLrcLyrics,
  qualityBadgeLabel,
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
    expect(imageProxyUrl("cover/path.jpg", "spotify", 400, "https://ma.local")).toBe(
      "https://ma.local/imageproxy?path=cover%2Fpath.jpg&provider=spotify&size=400",
    );
    expect(imageUrl("imageproxy?path=x")).toBe("/imageproxy?path=x");
    expect(imageUrl({ path: "cover/path.jpg", provider: "spotify" }, 300, { maUrl: "https://ma.local" })).toBe(
      "https://ma.local/imageproxy?path=cover%2Fpath.jpg&provider=spotify&size=300",
    );
    expect(artUrl({
      album: { metadata: { images: [{ path: "album/path.png", provider: "library" }] } },
    }, "https://ma.local")).toBe(
      "https://ma.local/imageproxy?path=album%2Fpath.png&provider=library&size=300",
    );
  });

  it("formats artists, durations, and normalized media items", () => {
    expect(artistName({ artists: [{ name: "A" }, { name: "B" }] })).toBe("A, B");
    expect(formatDuration(245)).toBe("4:05");
    expect(formatDuration(0)).toBe("0:00");
    expect(normalizeMediaItem({
      album: { image: { path: "folder/art.jpg", provider: "spotify" } },
    }, "https://ma.local")).toMatchObject({
      image_url: "https://ma.local/imageproxy?path=folder%2Fart.jpg&provider=spotify&size=300",
    });
  });
});
