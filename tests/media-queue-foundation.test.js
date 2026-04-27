import { describe, expect, it } from "vitest";

import {
  entryTargetsCurrentMedia,
  getQueueItemByIndexOrKey,
  getQueueItemKey,
  getQueueItemUri,
  mediaRefsEquivalent,
  mobileCurrentQueueIndex,
  parseMediaReference,
  queueItemMatchesPlayer,
  queueItemPrimaryArtist,
  queueItemPrimaryTitle,
  queueItemsContainCurrent,
  resolveMobileArtStackContext,
  resolveMobileUpNextItem,
  resolveQueuePlayIndex,
  sortQueueItems,
} from "../src/core/state/media-queue.js";

describe("media queue foundation", () => {
  it("parses and compares media references", () => {
    expect(parseMediaReference("spotify://track/123", "album")).toEqual({
      uri: "spotify://track/123",
      provider: "spotify",
      media_type: "track",
      item_id: "123",
      media_id: "123",
    });
    expect(mediaRefsEquivalent("spotify://track/123", "spotify://track/123")).toBe(true);
    expect(mediaRefsEquivalent("spotify://track/123", "spotify://track/999")).toBe(false);
    expect(mediaRefsEquivalent("spotify://track/123", "spotify://album/123")).toBe(false);
  });

  it("normalizes queue item identity helpers", () => {
    const item = {
      queue_item_id: "q1",
      media_item: {
        uri: "spotify://track/123",
        name: "Track A",
        artists: [{ name: "Artist A" }],
      },
    };
    expect(getQueueItemKey(item)).toBe("q1");
    expect(getQueueItemUri(item)).toBe("spotify://track/123");
    expect(queueItemPrimaryTitle(item)).toBe("Track A");
    expect(queueItemPrimaryArtist(item)).toBe("Artist A");
    expect(mobileCurrentQueueIndex("4")).toBe(4);
    expect(mobileCurrentQueueIndex("")).toBe(-1);
  });

  it("resolves queue matching and up-next state", () => {
    const items = [
      { sort_index: 2, queue_item_id: "b", media_item: { uri: "spotify://track/b", name: "B" } },
      { sort_index: 0, queue_item_id: "a", media_item: { uri: "spotify://track/a", name: "A" } },
      { sort_index: 1, queue_item_id: "c", media_item: { uri: "spotify://track/c", name: "C" } },
    ];
    expect(sortQueueItems(items).map((item) => item.queue_item_id)).toEqual(["a", "c", "b"]);
    expect(resolveMobileUpNextItem({ current_index: 0 }, items)?.queue_item_id).toBe("c");
    expect(queueItemsContainCurrent(items, { current_index: 1, current_item: null })).toBe(true);
    expect(resolveQueuePlayIndex(items, { queueItemId: "b" })).toBe(2);
    expect(getQueueItemByIndexOrKey(items, { fallbackUri: "spotify://track/c" })?.queue_item_id).toBe("c");
  });

  it("matches entries against current media and active player", () => {
    expect(entryTargetsCurrentMedia(
      { uri: "spotify://track/123", media_type: "track" },
      { uri: "spotify://track/123", media_type: "track" },
    )).toBe(true);

    expect(entryTargetsCurrentMedia(
      { name: "Track A", artist: "Artist A" },
      { name: "Track A", artist: "Artist Alpha" },
    )).toBe(true);

    expect(queueItemMatchesPlayer(
      {
        media_item: {
          uri: "spotify://track/123",
          name: "Track A",
          artists: [{ name: "Artist A" }],
        },
      },
      {
        attributes: {
          media_content_id: "spotify://track/123",
          media_title: "Track A",
          media_artist: "Artist A",
        },
      },
    )).toBe(true);
  });

  it("resolves art stack context from pending and current state", () => {
    const queueItems = [
      { sort_index: 0, queue_item_id: "a", media_item: { uri: "spotify://track/a", name: "A", artists: [{ name: "Artist A" }] } },
      { sort_index: 1, queue_item_id: "b", media_item: { uri: "spotify://track/b", name: "B", artists: [{ name: "Artist B" }] } },
      { sort_index: 2, queue_item_id: "c", media_item: { uri: "spotify://track/c", name: "C", artists: [{ name: "Artist C" }] } },
    ];
    expect(resolveMobileArtStackContext({
      queueItems,
      currentIndexValue: 0,
      player: { attributes: { media_content_id: "spotify://track/b", media_title: "B", media_artist: "Artist B" } },
      currentItem: queueItems[1],
      browseOffset: 0,
    })).toMatchObject({
      baseIndex: 1,
      displayIndex: 1,
      offset: 0,
    });

    expect(resolveMobileArtStackContext({
      queueItems,
      currentIndexValue: 0,
      player: { attributes: { media_content_id: "spotify://track/a", media_title: "A", media_artist: "Artist A" } },
      currentItem: queueItems[0],
      hasPendingPlay: true,
      pendingKey: "c",
      browseOffset: 0,
    })).toMatchObject({
      baseIndex: 2,
      displayIndex: 2,
      offset: 0,
    });
  });
});
