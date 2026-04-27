import { parseMediaReference } from "../state/media-queue.js";
import { qualityBadgeLabel, sourceProviderMeta } from "./presentation.js";

export function buildCurrentSourceBadgeMeta(
  {
    player = null,
    queueItem = null,
  } = {},
  {
    parseMediaReferenceFn = parseMediaReference,
    sourceProviderMetaFn = sourceProviderMeta,
    qualityBadgeLabelFn = qualityBadgeLabel,
    libraryLabel = "Library",
    radioLabel = "Radio",
  } = {},
) {
  const currentQueueItem = queueItem || null;
  const media = currentQueueItem?.media_item || currentQueueItem || {};
  const parsed = parseMediaReferenceFn(
    media?.uri || currentQueueItem?.uri || currentQueueItem?.media_content_id || player?.attributes?.media_content_id || "",
    media?.media_type || currentQueueItem?.media_type || player?.attributes?.media_content_type || "track",
  );
  const mappings = []
    .concat(Array.isArray(media?.provider_mappings) ? media.provider_mappings : [])
    .concat(Array.isArray(currentQueueItem?.provider_mappings) ? currentQueueItem.provider_mappings : []);
  const providerCandidates = [
    media?.provider,
    media?.provider_name,
    media?.provider_domain,
    media?.provider_instance,
    currentQueueItem?.provider,
    currentQueueItem?.provider_name,
    currentQueueItem?.provider_domain,
    currentQueueItem?.provider_instance,
    player?.attributes?.provider,
    player?.attributes?.provider_name,
    parsed.provider,
    ...mappings.flatMap((mapping) => [mapping?.provider, mapping?.provider_domain, mapping?.provider_instance, mapping?.provider_name]),
  ].filter(Boolean);
  const providerMeta = providerCandidates
    .map((value) => sourceProviderMetaFn(value, { libraryLabel, radioLabel }))
    .find(Boolean) || null;
  const qualityLabel = qualityBadgeLabelFn([
    media?.audio_format,
    media?.quality,
    media?.streamdetails,
    media?.metadata,
    currentQueueItem?.audio_format,
    currentQueueItem?.quality,
    currentQueueItem?.streamdetails,
    currentQueueItem?.metadata,
    player?.attributes?.media_codec,
    player?.attributes?.media_format,
    ...mappings.map((mapping) => mapping?.details),
    ...mappings.map((mapping) => mapping?.quality),
    ...mappings.map((mapping) => mapping?.audio_format),
  ]);
  return {
    providerKey: providerMeta?.key || "",
    providerLabel: providerMeta?.label || "",
    qualityLabel,
  };
}

export function buildCurrentHistorySnapshot(
  {
    player = null,
    queueItem = null,
  } = {},
  {
    getQueueItemUriFn,
    queueItemImageUrlFn,
    artUrlFn,
    buildCurrentSourceBadgeMetaFn = buildCurrentSourceBadgeMeta,
  } = {},
) {
  const currentQueueItem = queueItem || null;
  const media = currentQueueItem?.media_item || currentQueueItem || {};
  const title = media?.name || currentQueueItem?.name || player?.attributes?.media_title || "";
  const artist = Array.isArray(media?.artists)
    ? media.artists.map((entry) => entry?.name).filter(Boolean).join(", ")
    : (media?.artist_str || player?.attributes?.media_artist || "");
  const album = media?.album?.name || currentQueueItem?.album || player?.attributes?.media_album_name || "";
  const uri = String(getQueueItemUriFn?.(currentQueueItem) || media?.uri || player?.attributes?.media_content_id || "").trim();
  const mediaType = String(media?.media_type || currentQueueItem?.media_type || player?.attributes?.media_content_type || "track").toLowerCase();
  const key = [title, artist, album].map((part) => String(part || "").trim().toLowerCase()).join("|");
  if (!key || !uri || mediaType === "radio") return null;
  const sourceMeta = buildCurrentSourceBadgeMetaFn({ player, queueItem: currentQueueItem });
  return {
    key,
    uri,
    media_type: mediaType || "track",
    title,
    artist,
    album,
    image: queueItemImageUrlFn?.(currentQueueItem, 180) || artUrlFn?.(media) || artUrlFn?.(currentQueueItem) || "",
    provider_label: sourceMeta.providerLabel || "",
    quality_label: sourceMeta.qualityLabel || "",
  };
}

export function applyRecentPlaybackSnapshot(
  snapshot = null,
  previousEntry = null,
  recentHistory = [],
  maxItems = 10,
) {
  if (!snapshot) {
    return {
      currentEntry: previousEntry || null,
      recentHistory: Array.isArray(recentHistory) ? recentHistory : [],
      historyChanged: false,
    };
  }
  if (previousEntry?.key === snapshot.key && previousEntry?.uri === snapshot.uri) {
    return {
      currentEntry: snapshot,
      recentHistory: Array.isArray(recentHistory) ? recentHistory : [],
      historyChanged: false,
    };
  }
  if (previousEntry?.uri && previousEntry?.key && previousEntry.key !== snapshot.key) {
    const next = [
      previousEntry,
      ...((Array.isArray(recentHistory) ? recentHistory : []).filter((entry) => entry?.uri && entry.uri !== previousEntry.uri && entry.key !== snapshot.key)),
    ].slice(0, maxItems);
    return {
      currentEntry: snapshot,
      recentHistory: next,
      historyChanged: true,
    };
  }
  return {
    currentEntry: snapshot,
    recentHistory: Array.isArray(recentHistory) ? recentHistory : [],
    historyChanged: false,
  };
}

export function visibleRecentHistoryItems(currentEntry = null, recentHistory = [], limit = 5) {
  const currentKey = currentEntry?.key || "";
  return (Array.isArray(recentHistory) ? recentHistory : [])
    .filter((entry) => entry?.uri && entry?.key && entry.key !== currentKey)
    .slice(0, limit);
}

export function mediaFeedbackLabel(
  uri = "",
  fallback = "",
  queueItems = [],
  {
    getQueueItemUriFn,
    defaultLabel = "Media",
  } = {},
) {
  const text = String(fallback || "").trim();
  if (text) return text;
  const normalizedUri = String(uri || "").trim();
  if (!normalizedUri) return defaultLabel;
  const queueHit = (Array.isArray(queueItems) ? queueItems : []).find((item) => getQueueItemUriFn?.(item) === normalizedUri);
  if (queueHit?.media_item?.name) return queueHit.media_item.name;
  const separator = normalizedUri.lastIndexOf("/");
  if (separator >= 0 && separator < normalizedUri.length - 1) return decodeURIComponent(normalizedUri.slice(separator + 1));
  return normalizedUri;
}
