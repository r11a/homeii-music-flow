import { describe, expect, it } from "vitest";

import {
  applyRecentPlaybackSnapshot,
  buildCurrentHistorySnapshot,
  buildCurrentSourceBadgeMeta,
  mediaFeedbackLabel,
  visibleRecentHistoryItems,
} from "../src/core/media/history.js";

describe("media history foundation", () => {
  it("builds current source badge metadata", () => {
    expect(buildCurrentSourceBadgeMeta({
      player: {
        attributes: {
          media_content_id: "spotify://track/123",
          provider_name: "Spotify",
          media_codec: "flac 24-bit 96kHz",
        },
      },
      queueItem: {
        media_type: "track",
        media_item: {
          provider: "spotify",
        },
      },
    }, {
      libraryLabel: "Library",
      radioLabel: "Radio",
    })).toEqual({
      providerKey: "spotify",
      providerLabel: "Spotify",
      qualityLabel: "Hi-Res",
    });
  });

  it("builds current history snapshots and excludes radio", () => {
    const snapshot = buildCurrentHistorySnapshot({
      player: {
        attributes: {
          media_title: "Fallback",
          media_artist: "Fallback Artist",
          media_album_name: "Fallback Album",
          media_content_id: "spotify://track/123",
        },
      },
      queueItem: {
        media_type: "track",
        media_item: {
          name: "Track A",
          artists: [{ name: "Artist A" }],
          album: { name: "Album A" },
        },
      },
    }, {
      getQueueItemUriFn: () => "spotify://track/123",
      queueItemImageUrlFn: () => "/queue.jpg",
      artUrlFn: () => "/art.jpg",
      buildCurrentSourceBadgeMetaFn: () => ({ providerLabel: "Spotify", qualityLabel: "Lossless" }),
    });
    expect(snapshot).toEqual({
      key: "track a|artist a|album a",
      uri: "spotify://track/123",
      media_type: "track",
      title: "Track A",
      artist: "Artist A",
      album: "Album A",
      image: "/queue.jpg",
      provider_label: "Spotify",
      quality_label: "Lossless",
    });

    expect(buildCurrentHistorySnapshot({
      player: { attributes: { media_content_type: "radio" } },
      queueItem: { media_type: "radio", media_item: { name: "Station" } },
    }, {
      getQueueItemUriFn: () => "radio://station/1",
      queueItemImageUrlFn: () => "",
      artUrlFn: () => "",
    })).toBeNull();
  });

  it("updates recent playback snapshots deterministically", () => {
    const previous = { key: "a|b|c", uri: "spotify://track/1" };
    const next = { key: "d|e|f", uri: "spotify://track/2" };
    expect(applyRecentPlaybackSnapshot(next, previous, [{ key: "x", uri: "spotify://track/9" }], 10)).toEqual({
      currentEntry: next,
      recentHistory: [previous, { key: "x", uri: "spotify://track/9" }],
      historyChanged: true,
    });
    expect(applyRecentPlaybackSnapshot(next, next, [{ key: "x", uri: "spotify://track/9" }], 10)).toEqual({
      currentEntry: next,
      recentHistory: [{ key: "x", uri: "spotify://track/9" }],
      historyChanged: false,
    });
  });

  it("filters visible history items and resolves media feedback labels", () => {
    expect(visibleRecentHistoryItems(
      { key: "current" },
      [
        { key: "current", uri: "spotify://track/current" },
        { key: "older", uri: "spotify://track/older" },
        { key: "older-2", uri: "spotify://track/older-2" },
      ],
      5,
    )).toEqual([
      { key: "older", uri: "spotify://track/older" },
      { key: "older-2", uri: "spotify://track/older-2" },
    ]);

    expect(mediaFeedbackLabel(
      "spotify://track/123",
      "",
      [{ uri: "spotify://track/123", media_item: { name: "Track A" } }],
      {
        getQueueItemUriFn: (item) => item.uri,
        defaultLabel: "Media",
      },
    )).toBe("Track A");

    expect(mediaFeedbackLabel("spotify://track/abc", "", [], { getQueueItemUriFn: () => "", defaultLabel: "Media" })).toBe("abc");
  });
});
