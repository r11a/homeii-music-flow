function normalizeComparableText(value = "") {
  return String(value || "").trim().toLowerCase();
}

function normalizeFiniteNumber(value) {
  return value !== "" && value !== null && value !== undefined ? Number(value) : NaN;
}

function queueItemMatchTitle(item = {}) {
  return normalizeComparableText(item?.media_item?.name || item?.media_title || item?.name || "");
}

function queueItemMatchArtist(item = {}) {
  return normalizeComparableText(
    item?.media_artist
      || (item?.media_item?.artists || []).map((artist) => artist?.name).filter(Boolean).join(", ")
      || "",
  );
}

function queueTitleArtistMatch(item, title = "", artist = "") {
  const normalizedTitle = normalizeComparableText(title);
  if (!item || !normalizedTitle) return false;
  const itemTitle = queueItemMatchTitle(item);
  const itemArtist = queueItemMatchArtist(item);
  const normalizedArtist = normalizeComparableText(artist);
  return itemTitle === normalizedTitle && (
    !normalizedArtist
    || itemArtist.includes(normalizedArtist)
    || normalizedArtist.includes(itemArtist)
  );
}

function findQueueItemIndex(queueItems = [], {
  queueItemId = "",
  uri = "",
  sortIndex = "",
  fallbackType = "track",
} = {}, compareMediaRefs = mediaRefsEquivalent) {
  const normalizedIndex = normalizeFiniteNumber(sortIndex);
  const key = String(queueItemId || "").trim();
  const targetUri = String(uri || "").trim();
  return queueItems.findIndex((item) =>
    (Number.isFinite(normalizedIndex) && Number(item?.sort_index) === normalizedIndex)
    || (key && getQueueItemKey(item) === key)
    || (
      targetUri
      && compareMediaRefs(
        getQueueItemUri(item),
        targetUri,
        item?.media_item?.media_type || item?.media_type || fallbackType,
      )
    )
  );
}

export function parseMediaReference(uri = "", fallbackType = "track") {
  const value = String(uri || "").trim();
  const fallback = {
    uri: value,
    media_type: String(fallbackType || "track").toLowerCase(),
    provider: "",
    item_id: "",
    media_id: value,
  };
  if (!value.includes("://")) return fallback;
  const [providerRaw, restRaw] = value.split("://");
  const provider = String(providerRaw || "").trim();
  const rest = String(restRaw || "").replace(/^\/+/, "");
  const segments = rest.split("/").filter(Boolean);
  if (!segments.length) return { ...fallback, provider };
  const mediaType = String(segments[0] || fallback.media_type).toLowerCase();
  const itemId = segments.slice(1).join("/") || rest;
  return {
    uri: value,
    provider,
    media_type: mediaType || fallback.media_type,
    item_id: itemId,
    media_id: itemId || value,
  };
}

export function mediaRefsEquivalent(uriA = "", uriB = "", fallbackType = "track") {
  const left = String(uriA || "").trim();
  const right = String(uriB || "").trim();
  if (!left || !right) return false;
  if (left === right) return true;
  const leftRef = parseMediaReference(left, fallbackType);
  const rightRef = parseMediaReference(right, fallbackType);
  return !!(
    leftRef.provider
    && rightRef.provider
    && leftRef.provider === rightRef.provider
    && leftRef.media_type === rightRef.media_type
    && leftRef.item_id
    && leftRef.item_id === rightRef.item_id
  );
}

export function getQueueItemKey(item) {
  return String(item?.queue_item_id || item?.item_id || item?.id || item?.sort_index || item?.media_item?.uri || item?.uri || "");
}

export function getQueueItemUri(item) {
  return item?.media_item?.uri || item?.uri || item?.streamdetails?.uri || "";
}

export function queueItemPrimaryArtist(item = {}) {
  return item?.media_artist
    || item?.artist
    || item?.media_item?.artist
    || (Array.isArray(item?.media_item?.artists) ? item.media_item.artists.map((artist) => artist?.name).filter(Boolean).join(", ") : "")
    || "";
}

export function queueItemPrimaryTitle(item = {}) {
  return item?.media_item?.name || item?.media_title || item?.name || "";
}

export function mobileCurrentQueueIndex(value) {
  const currentIndex = normalizeFiniteNumber(value);
  return Number.isFinite(currentIndex) ? currentIndex : -1;
}

export function sortQueueItems(items = []) {
  return [...(Array.isArray(items) ? items : [])]
    .filter(Boolean)
    .sort((a, b) => Number(a?.sort_index ?? 0) - Number(b?.sort_index ?? 0));
}

export function queueItemsContainCurrent(items = [], queueState = null) {
  if (!Array.isArray(items) || !items.length || !queueState) return false;
  const currentIndex = normalizeFiniteNumber(queueState.current_index);
  const currentKey = getQueueItemKey(queueState.current_item);
  return items.some((item) =>
    (Number.isFinite(currentIndex) && Number(item?.sort_index) === currentIndex)
    || (currentKey && getQueueItemKey(item) === currentKey)
  );
}

export function queueItemMatchesPlayer(item, player, compareMediaRefs = mediaRefsEquivalent) {
  if (!item || !player) return false;
  const playerUri = String(player?.attributes?.media_content_id || "").trim();
  const itemUri = String(getQueueItemUri(item) || "").trim();
  if (playerUri && itemUri) {
    return compareMediaRefs(playerUri, itemUri, item?.media_item?.media_type || item?.media_type || "track");
  }
  const playerTitle = normalizeComparableText(player?.attributes?.media_title || "");
  if (!playerTitle) return false;
  const playerArtist = normalizeComparableText(player?.attributes?.media_artist || "");
  return queueTitleArtistMatch(item, playerTitle, playerArtist);
}

export function resolveMobileUpNextItem(queueState = {}, queueItems = []) {
  if (queueState?.next_item) return queueState.next_item;
  const items = Array.isArray(queueItems) ? queueItems : [];
  if (!items.length) return null;
  const currentIndex = normalizeFiniteNumber(queueState.current_index);
  if (Number.isFinite(currentIndex)) {
    return items.find((item) => Number(item?.sort_index) === currentIndex + 1)
      || items.find((item) => Number(item?.sort_index) > currentIndex)
      || null;
  }
  const currentKey = getQueueItemKey(queueState.current_item);
  if (currentKey) {
    const index = items.findIndex((item) => getQueueItemKey(item) === currentKey);
    if (index >= 0 && index < items.length - 1) return items[index + 1];
  }
  return items[1] || null;
}

export function entryTargetsCurrentMedia(entry = {}, current = {}, compareMediaRefs = mediaRefsEquivalent) {
  const currentUri = String(current?.uri || "").trim();
  const entryUri = String(entry?.uri || "").trim();
  if (currentUri && entryUri) {
    return compareMediaRefs(currentUri, entryUri, entry?.media_type || current?.media_type || "track");
  }
  const currentTitle = normalizeComparableText(current?.name || "");
  const entryTitle = normalizeComparableText(entry?.name || entry?.title || "");
  if (!currentTitle || !entryTitle || currentTitle !== entryTitle) return false;
  const currentArtist = normalizeComparableText(current?.artist || "");
  const entryArtist = normalizeComparableText(entry?.artist || "");
  return !currentArtist
    || !entryArtist
    || currentArtist === entryArtist
    || currentArtist.includes(entryArtist)
    || entryArtist.includes(currentArtist);
}

export function resolveQueuePlayIndex(queueItems = [], {
  queueItemId = "",
  fallbackUri = "",
  explicitSortIndex = "",
} = {}, compareMediaRefs = mediaRefsEquivalent) {
  const normalizedExplicit = normalizeFiniteNumber(explicitSortIndex);
  if (Number.isFinite(normalizedExplicit)) return normalizedExplicit;
  const match = (Array.isArray(queueItems) ? queueItems : []).find((item) =>
    (queueItemId && getQueueItemKey(item) === String(queueItemId).trim())
    || (
      fallbackUri
      && compareMediaRefs(
        getQueueItemUri(item),
        String(fallbackUri).trim(),
        item?.media_item?.media_type || item?.media_type || "track",
      )
    )
  );
  const resolved = Number(match?.sort_index);
  return Number.isFinite(resolved) ? resolved : null;
}

export function getQueueItemByIndexOrKey(queueItems = [], {
  sortIndex = "",
  queueItemId = "",
  fallbackUri = "",
} = {}, compareMediaRefs = mediaRefsEquivalent) {
  const normalizedIndex = normalizeFiniteNumber(sortIndex);
  const key = String(queueItemId || "").trim();
  const uri = String(fallbackUri || "").trim();
  return (Array.isArray(queueItems) ? queueItems : []).find((item) =>
    (Number.isFinite(normalizedIndex) && Number(item?.sort_index) === normalizedIndex)
    || (key && getQueueItemKey(item) === key)
    || (
      uri
      && compareMediaRefs(
        getQueueItemUri(item),
        uri,
        item?.media_item?.media_type || item?.media_type || "track",
      )
    )
  ) || null;
}

export function resolveMobileArtStackContext({
  queueItems = [],
  currentIndexValue = "",
  player = null,
  currentItem = null,
  hasPendingPlay = false,
  pendingKey = "",
  pendingUri = "",
  pendingIndexValue = "",
  browseOffset = 0,
} = {}, compareMediaRefs = mediaRefsEquivalent) {
  const sortedQueueItems = sortQueueItems(queueItems);
  const currentIndex = mobileCurrentQueueIndex(currentIndexValue);
  const playerUri = String(player?.attributes?.media_content_id || "").trim();
  const currentItemTitle = currentItem?.media_item?.name || currentItem?.media_title || currentItem?.name || "";
  const currentItemArtist = currentItem?.media_artist || (currentItem?.media_item?.artists || []).map((artist) => artist?.name).filter(Boolean).join(", ") || "";
  const playerTitle = normalizeComparableText(
    hasPendingPlay
      ? (currentItemTitle || player?.attributes?.media_title || "")
      : (player?.attributes?.media_title || currentItemTitle || ""),
  );
  const playerArtist = normalizeComparableText(
    hasPendingPlay
      ? (currentItemArtist || player?.attributes?.media_artist || "")
      : (player?.attributes?.media_artist || currentItemArtist || ""),
  );

  let baseIndex = -1;
  const titleMatches = (item) => queueTitleArtistMatch(item, playerTitle, playerArtist);

  if (hasPendingPlay) {
    const pendingMatch = findQueueItemIndex(sortedQueueItems, {
      queueItemId: pendingKey,
      uri: pendingUri,
      sortIndex: pendingIndexValue,
    }, compareMediaRefs);
    if (pendingMatch >= 0) baseIndex = pendingMatch;
  }

  if (currentItem) {
    const currentKey = getQueueItemKey(currentItem);
    const currentUri = getQueueItemUri(currentItem);
    const keyIndex = findQueueItemIndex(sortedQueueItems, {
      queueItemId: currentKey,
      uri: currentUri,
    }, compareMediaRefs);
    if (keyIndex >= 0 && (hasPendingPlay || !playerTitle || titleMatches(sortedQueueItems[keyIndex]))) {
      baseIndex = keyIndex;
    }
  }

  if (baseIndex < 0 && playerUri) {
    baseIndex = findQueueItemIndex(sortedQueueItems, { uri: playerUri }, compareMediaRefs);
  }
  if (baseIndex < 0 && !playerUri && playerTitle) {
    baseIndex = sortedQueueItems.findIndex((item) => titleMatches(item));
  }
  if (baseIndex < 0 && Number.isFinite(currentIndex)) {
    baseIndex = sortedQueueItems.findIndex((item) => Number(item?.sort_index) === currentIndex);
  }
  if (baseIndex < 0 && Number.isFinite(currentIndex) && currentIndex >= 0 && currentIndex < sortedQueueItems.length) {
    baseIndex = currentIndex;
  }
  if (baseIndex < 0) baseIndex = 0;

  const minOffset = sortedQueueItems.length ? -baseIndex : 0;
  const maxOffset = sortedQueueItems.length ? (sortedQueueItems.length - 1 - baseIndex) : 0;
  const offset = Math.max(minOffset, Math.min(maxOffset, Number(browseOffset || 0)));
  const displayIndex = Math.max(0, Math.min(sortedQueueItems.length - 1, baseIndex + offset));

  return {
    queueItems: sortedQueueItems,
    baseIndex,
    displayIndex,
    offset,
  };
}
