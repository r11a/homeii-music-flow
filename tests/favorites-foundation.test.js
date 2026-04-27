import { describe, expect, it } from "vitest";

import {
  applyOptimisticFavoriteCache,
  buildCurrentMediaLikeMeta,
  buildOptimisticFavoriteEntry,
  favoriteRemoveArgsFromItem,
  findFavoriteEntryMatch,
  isEntryLiked,
  matchFavoriteLibraryItem,
  resolveCachedFavoriteRemoveArgs,
  resolveCurrentMediaFavoriteState,
} from "../src/core/state/favorites.js";

describe("favorites foundation", () => {
  it("builds current media like metadata from player and queue state", () => {
    expect(buildCurrentMediaLikeMeta({
      player: {
        attributes: {
          media_content_id: "spotify://track/123",
          media_title: "Track A",
          media_artist: "Artist A",
          media_album_name: "Album A",
          entity_picture: "/art.jpg",
        },
      },
      queueItem: {
        media_item: {
          media_type: "track",
          name: "Fallback Name",
          artists: [{ name: "Queue Artist" }],
        },
      },
      resolvedUri: "spotify://track/fallback",
      queueItemImage: "",
      fallbackName: "Unknown",
    })).toMatchObject({
      uri: "spotify://track/123",
      provider: "spotify",
      media_type: "track",
      item_id: "123",
      name: "Track A",
      artist: "Queue Artist",
      album: "Album A",
      image: "/art.jpg",
    });
  });

  it("finds favorite matches and removal args from liked items", () => {
    const likedItems = [
      {
        uri: "spotify://track/123",
        media_type: "track",
        item_id: "123",
        provider: "spotify",
        library_item_id: "lib-123",
        name: "Track A",
        artist: "Artist A",
      },
    ];
    const entry = {
      uri: "spotify://track/123",
      media_type: "track",
      name: "Track A",
      artist: "Artist A",
    };
    expect(findFavoriteEntryMatch(entry, likedItems)).toEqual(likedItems[0]);
    expect(matchFavoriteLibraryItem(entry, likedItems, "track")).toEqual({
      media_type: "track",
      library_item_id: "lib-123",
    });
    expect(favoriteRemoveArgsFromItem(likedItems[0], "track")).toEqual({
      media_type: "track",
      library_item_id: "lib-123",
    });
  });

  it("resolves favorite state from override, queue flags, cache, and local likes", () => {
    expect(resolveCurrentMediaFavoriteState({
      currentUri: "spotify://track/123",
      override: { uri: "spotify://track/123", liked: true, ts: 1000 },
      now: 5000,
    })).toBe(true);

    expect(resolveCurrentMediaFavoriteState({
      currentUri: "spotify://track/123",
      queueItem: { media_item: { favorite: false } },
    })).toBe(false);

    expect(resolveCurrentMediaFavoriteState({
      currentUri: "spotify://track/123",
      currentEntry: { uri: "spotify://track/123", media_type: "track" },
      useMaLikedMode: true,
      likedItems: [{ uri: "spotify://track/123", media_type: "track" }],
    })).toBe(true);

    expect(resolveCurrentMediaFavoriteState({
      currentUri: "spotify://track/123",
      localLikedUris: new Set(["spotify://track/123"]),
    })).toBe(true);
  });

  it("normalizes entry liked state for MA and local modes", () => {
    expect(isEntryLiked(
      { uri: "spotify://track/123", media_type: "track" },
      { useMaLikedMode: true, likedItems: [{ uri: "spotify://track/123", media_type: "track" }] },
    )).toBe(true);

    expect(isEntryLiked(
      { uri: "spotify://track/999", favorite: true },
      { useMaLikedMode: false, localLikedUris: new Set() },
    )).toBe(true);

    expect(isEntryLiked(
      { uri: "spotify://track/123" },
      { useMaLikedMode: false, localLikedUris: new Set(["spotify://track/123"]) },
    )).toBe(true);
  });

  it("builds and applies optimistic favorite cache entries", () => {
    const nextEntry = buildOptimisticFavoriteEntry({
      uri: "spotify://track/123",
      media_type: "track",
      name: "Track A",
      artist: "Artist A",
    }, true);
    expect(nextEntry).toMatchObject({
      uri: "spotify://track/123",
      media_type: "track",
      favorite: true,
    });

    const added = applyOptimisticFavoriteCache([], nextEntry, true);
    expect(added).toHaveLength(1);
    expect(added[0].favorite).toBe(true);

    const removed = applyOptimisticFavoriteCache(added, nextEntry, false);
    expect(removed).toHaveLength(0);
  });

  it("resolves cached favorite remove args before remote fallback", () => {
    const entry = {
      uri: "spotify://track/123",
      media_type: "track",
      name: "Track A",
      artist: "Artist A",
    };
    const likedItems = [
      {
        uri: "spotify://track/123",
        media_type: "track",
        provider: "spotify",
        item_id: "123",
        library_item_id: "lib-123",
        name: "Track A",
        artist: "Artist A",
      },
    ];
    expect(resolveCachedFavoriteRemoveArgs({
      entry,
      mediaType: "track",
      likedItems,
      currentEntry: { uri: "spotify://track/999", media_type: "track" },
      currentEntryMatches: true,
    })).toEqual({
      media_type: "track",
      library_item_id: "lib-123",
    });
  });
});
