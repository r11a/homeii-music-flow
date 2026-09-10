import { describe, expect, it } from "vitest";

import {
  queueArtworkPrefetchIndexes,
  queueArtworkPrefetchUrls,
  queueItemArtworkCacheKey,
} from "../src/core/media/artwork.js";

function queueItems(count = 8) {
  return Array.from({ length: count }, (_, index) => ({
    queue_item_id: `queue-${index}`,
    sort_index: index,
    media_item: {
      uri: `spotify://track/${index}`,
      name: `Track ${index}`,
      image: `https://ha.local/art-${index}.jpg`,
      album: { name: `Album ${index}` },
    },
  }));
}

describe("media artwork foundation", () => {
  it("invalidates radio artwork when stream artwork changes without changing the station URI", () => {
    const station={media_item:{uri:'radio://station',name:'Station'},streamdetails:{stream_metadata:{image_url:'https://radio.example/first.jpg'}}};
    const accessors={getQueueItemUri:item=>item.media_item.uri};
    const first=queueItemArtworkCacheKey(station,accessors);
    station.streamdetails.stream_metadata.image_url='https://radio.example/second.jpg';
    const second=queueItemArtworkCacheKey(station,accessors);
    expect(second).not.toBe(first);
    expect(second).not.toContain('first.jpg');
    delete station.streamdetails.stream_metadata.image_url;
    expect(queueItemArtworkCacheKey(station,accessors)).not.toBe(second);
  });
  it("builds queue artwork cache keys from stable item artwork identity", () => {
    const item = queueItems(1)[0];
    const key = queueItemArtworkCacheKey(item, {
      getQueueItemPlaybackId: (entry) => entry.queue_item_id,
      getQueueItemStableId: () => "",
      getQueueItemKey: () => "",
      getQueueItemUri: (entry) => entry.media_item.uri,
    });

    expect(key).toContain("queue-0");
    expect(key).toContain("spotify://track/0");
    expect(key).toContain("https://ha.local/art-0.jpg");
  });

  it("orders prefetch indexes by current, next, previous, then nearby and visible rows", () => {
    const items = queueItems(8);
    const indexes = queueArtworkPrefetchIndexes(items, {
      currentIndex: 3,
      before: 2,
      after: 3,
      visibleCount: 2,
    });

    expect(indexes).toEqual([3, 4, 2, 5, 1, 6, 0]);
  });

  it("can prioritize the currently visible queue rows instead of only the top rows", () => {
    const items = queueItems(12);
    const indexes = queueArtworkPrefetchIndexes(items, {
      currentIndex: 2,
      before: 0,
      after: 0,
      visibleStartIndex: 7,
      visibleCount: 3,
    });

    expect(indexes).toEqual([2, 7, 8, 9]);
  });

  it("returns deduplicated thumbnail and nearby full-size prefetch urls", () => {
    const items = queueItems(6);
    const urls = queueArtworkPrefetchUrls(items, {
      currentIndex: 2,
      before: 1,
      after: 1,
      visibleCount: 1,
    }, (item, size) => `https://ha.local/${item.queue_item_id}-${size}.jpg`);

    expect(urls).toEqual([
      "https://ha.local/queue-2-160.jpg",
      "https://ha.local/queue-2-420.jpg",
      "https://ha.local/queue-3-160.jpg",
      "https://ha.local/queue-3-420.jpg",
      "https://ha.local/queue-1-160.jpg",
      "https://ha.local/queue-1-420.jpg",
      "https://ha.local/queue-0-160.jpg",
      "https://ha.local/queue-0-420.jpg",
    ]);
  });
});
