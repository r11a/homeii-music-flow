import { mediaRefsEquivalent, parseMediaReference } from "./media-queue.js";

const CURRENT_MEDIA_FAVORITE_OVERRIDE_WINDOW_MS = 8000;

function normalizeComparableText(value = "") {
  return String(value || "").trim().toLowerCase();
}

function favoriteEntryArtist(entry = {}) {
  return String(
    entry?.artist
      || entry?.artists?.map?.((artist) => artist?.name).filter(Boolean).join(", ")
      || entry?.media_item?.artists?.map?.((artist) => artist?.name).filter(Boolean).join(", ")
      || entry?.media_artist
      || "",
  ).trim();
}

function favoriteEntryTitle(entry = {}) {
  return String(entry?.name || entry?.title || entry?.media_item?.name || "").trim();
}

export function buildCurrentMediaLikeMeta({
  player = null,
  queueItem = {},
  resolvedUri = "",
  queueItemImage = "",
  fallbackName = "Unknown",
} = {}, parseMediaReferenceFn = parseMediaReference) {
  const media = queueItem?.media_item || {};
  const playerUri = String(player?.attributes?.media_content_id || "").trim();
  const uri = playerUri || String(resolvedUri || "").trim();
  const artist = Array.isArray(media?.artists)
    ? media.artists.map((artistEntry) => artistEntry?.name).filter(Boolean).join(", ")
    : (player?.attributes?.media_artist || "");
  const parsed = parseMediaReferenceFn(
    uri,
    media?.media_type || queueItem?.media_type || player?.attributes?.media_content_type || "track",
  );
  return {
    uri,
    ...parsed,
    media_type: parsed.media_type || media?.media_type || queueItem?.media_type || "track",
    name: player?.attributes?.media_title || media?.name || uri || fallbackName,
    artist: artist || "",
    album: media?.album?.name || player?.attributes?.media_album_name || "",
    image: queueItemImage || media?.image || media?.album?.image || player?.attributes?.entity_picture_local || player?.attributes?.entity_picture || "",
  };
}

export function favoriteRemoveArgsFromItem(item = {}, fallbackType = "track", parseMediaReferenceFn = parseMediaReference) {
  if (!item || typeof item !== "object") return null;
  const mediaType = String(item.media_type || item.type || item.media_item?.media_type || fallbackType || "track").toLowerCase();
  const parsed = parseMediaReferenceFn(item.uri || item.media_item?.uri || "", mediaType);
  const explicitLibraryId = item.library_item_id
    || (String(item.provider || item.provider_domain || item.provider_instance || "").toLowerCase() === "library"
      ? (item.item_id || item.id || "")
      : "");
  const libraryItemId = String(parsed.provider === "library" ? parsed.item_id : explicitLibraryId || "").trim();
  if (!libraryItemId) return null;
  return { media_type: parsed.media_type || mediaType, library_item_id: libraryItemId };
}

export function findFavoriteEntryMatch(
  entry = {},
  likedItems = [],
  {
    parseMediaReferenceFn = parseMediaReference,
  } = {},
) {
  if (!Array.isArray(likedItems) || !likedItems.length) return null;
  const targetUri = String(entry?.uri || "").trim();
  const targetType = String(entry?.media_type || entry?.type || "track").toLowerCase();
  const targetLibraryId = String(entry?.library_item_id || "").trim();
  const targetItemId = String(entry?.item_id || entry?.id || "").trim();
  const targetProvider = String(entry?.provider || entry?.provider_domain || entry?.provider_instance || "").trim().toLowerCase();
  const targetTitle = normalizeComparableText(favoriteEntryTitle(entry));
  const targetArtist = normalizeComparableText(favoriteEntryArtist(entry));

  for (const item of likedItems) {
    const candidateLibraryId = String(item?.library_item_id || "").trim();
    const candidateItemId = String(item?.item_id || item?.id || "").trim();
    const candidateProvider = String(item?.provider || item?.provider_domain || item?.provider_instance || "").trim().toLowerCase();
    const candidateUri = String(item?.uri || "").trim();
    const candidateType = String(item?.media_type || item?.type || "").toLowerCase();
    if (targetLibraryId && candidateLibraryId && targetLibraryId === candidateLibraryId) {
      return item;
    }
    if (targetItemId && candidateItemId && targetProvider && candidateProvider && targetItemId === candidateItemId && targetProvider === candidateProvider) {
      return item;
    }
    if (candidateUri && targetUri && candidateUri === targetUri) {
      return item;
    }
    const parsedTarget = parseMediaReferenceFn(targetUri, targetType || "track");
    const parsedCandidate = parseMediaReferenceFn(candidateUri, candidateType || targetType || "track");
    if (parsedTarget.provider && parsedCandidate.provider && parsedTarget.provider === parsedCandidate.provider && parsedTarget.item_id && parsedTarget.item_id === parsedCandidate.item_id) {
      return item;
    }
    const candidateTitle = normalizeComparableText(favoriteEntryTitle(item));
    const candidateArtist = normalizeComparableText(favoriteEntryArtist(item));
    if (
      targetTitle
      && candidateTitle === targetTitle
      && (
        !targetArtist
        || !candidateArtist
        || candidateArtist === targetArtist
        || candidateArtist.includes(targetArtist)
        || targetArtist.includes(candidateArtist)
      )
    ) {
      return item;
    }
  }
  return null;
}

export function matchFavoriteLibraryItem(
  entry = {},
  likedItems = [],
  fallbackType = "",
  {
    parseMediaReferenceFn = parseMediaReference,
    favoriteRemoveArgsFromItemFn = favoriteRemoveArgsFromItem,
    findFavoriteEntryMatchFn = findFavoriteEntryMatch,
  } = {},
) {
  const effectiveFallbackType = fallbackType || entry?.media_type || entry?.type || "track";
  const match = findFavoriteEntryMatchFn(entry, likedItems, { parseMediaReferenceFn });
  return match ? favoriteRemoveArgsFromItemFn(match, effectiveFallbackType, parseMediaReferenceFn) : null;
}

export function buildOptimisticFavoriteEntry(entry = {}, liked = false) {
  return {
    uri: String(entry?.uri || "").trim(),
    media_type: entry?.media_type || entry?.type || "track",
    item_id: entry?.item_id || "",
    provider: entry?.provider || "",
    library_item_id: entry?.library_item_id || "",
    name: entry?.name || entry?.title || entry?.media_item?.name || "",
    artist: favoriteEntryArtist(entry),
    album: entry?.album || entry?.media_item?.album?.name || "",
    image: entry?.image || entry?.media_item?.image || entry?.media_item?.album?.image || "",
    favorite: !!liked,
  };
}

export function applyOptimisticFavoriteCache(
  likedItems = [],
  nextEntry = {},
  liked = false,
  {
    compareMediaRefsFn = mediaRefsEquivalent,
    matchFavoriteLibraryItemFn = matchFavoriteLibraryItem,
  } = {},
) {
  const items = Array.isArray(likedItems) ? [...likedItems] : [];
  const idx = items.findIndex((item) =>
    compareMediaRefsFn(String(item?.uri || "").trim(), nextEntry.uri, item?.media_type || nextEntry.media_type || "track")
    || !!matchFavoriteLibraryItemFn(nextEntry, [item], nextEntry.media_type || "track")
  );
  if (liked) {
    if (idx >= 0) items[idx] = { ...items[idx], ...nextEntry, favorite: true };
    else items.unshift(nextEntry);
  } else if (idx >= 0) {
    items.splice(idx, 1);
  }
  return items;
}

export function isEntryLiked(
  entry = {},
  {
    useMaLikedMode = false,
    likedItems = null,
    localLikedUris = null,
  } = {},
  {
    compareMediaRefsFn = mediaRefsEquivalent,
    matchFavoriteLibraryItemFn = matchFavoriteLibraryItem,
  } = {},
) {
  const uri = String(entry?.uri || "").trim();
  if (useMaLikedMode) {
    if (Array.isArray(likedItems)) {
      return uri
        ? likedItems.some((item) => compareMediaRefsFn(String(item?.uri || "").trim(), uri, item?.media_type || entry?.media_type || "track"))
          || !!matchFavoriteLibraryItemFn(entry, likedItems, entry?.media_type || entry?.type || "track")
        : !!matchFavoriteLibraryItemFn(entry, likedItems, entry?.media_type || entry?.type || "track");
    }
    return !!entry?.favorite || !!entry?.media_item?.favorite;
  }
  if (entry?.favorite || entry?.media_item?.favorite) return true;
  if (!uri) return false;
  if (localLikedUris instanceof Set) return localLikedUris.has(uri);
  if (Array.isArray(localLikedUris)) return localLikedUris.includes(uri);
  return false;
}

export function resolveCurrentMediaFavoriteState(
  {
    currentUri = "",
    override = null,
    queueItem = {},
    currentEntry = null,
    useMaLikedMode = false,
    likedItems = null,
    localLikedUris = null,
    now = Date.now(),
  } = {},
  {
    compareMediaRefsFn = mediaRefsEquivalent,
    matchFavoriteLibraryItemFn = matchFavoriteLibraryItem,
  } = {},
) {
  const uri = String(currentUri || "").trim();
  if (!uri) return false;
  if (override?.uri === uri && Number(now || 0) - Number(override?.ts || 0) < CURRENT_MEDIA_FAVORITE_OVERRIDE_WINDOW_MS) {
    return !!override.liked;
  }
  const queueFavorite = queueItem?.media_item?.favorite;
  if (typeof queueFavorite === "boolean") return queueFavorite;
  if (typeof queueItem?.favorite === "boolean") return queueItem.favorite;
  if (useMaLikedMode) {
    if (Array.isArray(likedItems)) {
      return likedItems.some((item) => compareMediaRefsFn(String(item?.uri || "").trim(), uri, item?.media_type || "track"))
        || !!matchFavoriteLibraryItemFn(currentEntry || {}, likedItems, currentEntry?.media_type || "track");
    }
    return false;
  }
  if (localLikedUris instanceof Set) return localLikedUris.has(uri);
  if (Array.isArray(localLikedUris)) return localLikedUris.includes(uri);
  return false;
}

export function resolveCachedFavoriteRemoveArgs(
  {
    entry = {},
    mediaType = "track",
    likedItems = [],
    currentEntry = null,
    currentEntryMatches = false,
  } = {},
  {
    parseMediaReferenceFn = parseMediaReference,
    favoriteRemoveArgsFromItemFn = favoriteRemoveArgsFromItem,
    findFavoriteEntryMatchFn = findFavoriteEntryMatch,
    matchFavoriteLibraryItemFn = matchFavoriteLibraryItem,
  } = {},
) {
  const uri = String(entry?.uri || "").trim();
  const ref = parseMediaReferenceFn(uri, mediaType);
  if (ref.provider === "library" && ref.item_id) {
    return { media_type: ref.media_type || mediaType, library_item_id: ref.item_id };
  }
  const canonicalEntry = findFavoriteEntryMatchFn(entry, likedItems, { parseMediaReferenceFn });
  if (canonicalEntry) {
    const canonicalArgs = favoriteRemoveArgsFromItemFn(canonicalEntry, mediaType, parseMediaReferenceFn);
    if (canonicalArgs) return canonicalArgs;
  }
  const resolvedFromCache = matchFavoriteLibraryItemFn(entry, likedItems, mediaType, {
    parseMediaReferenceFn,
    favoriteRemoveArgsFromItemFn,
    findFavoriteEntryMatchFn,
  });
  if (resolvedFromCache) return resolvedFromCache;
  if (currentEntryMatches && currentEntry?.uri && currentEntry.uri !== uri) {
    return matchFavoriteLibraryItemFn(currentEntry, likedItems, mediaType, {
      parseMediaReferenceFn,
      favoriteRemoveArgsFromItemFn,
      findFavoriteEntryMatchFn,
    });
  }
  return null;
}
