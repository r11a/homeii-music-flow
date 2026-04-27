export function buildCurrentTrackInfo({ player = null, queueItem = null } = {}) {
  const currentQueueItem = queueItem || null;
  const media = currentQueueItem?.media_item || {};
  const title = media?.name || player?.attributes?.media_title || "";
  const artists = Array.isArray(media?.artists) ? media.artists.map((artist) => artist?.name).filter(Boolean).join(", ") : "";
  const artist = artists || player?.attributes?.media_artist || "";
  const album = media?.album?.name || player?.attributes?.media_album_name || "";
  const duration = Number(currentQueueItem?.duration || player?.attributes?.media_duration || 0);
  const key = [title, artist, album].map((part) => String(part || "").trim().toLowerCase()).join("|");
  return { title, artist, album, duration, key };
}

export function sourceProviderMeta(value = "", { libraryLabel = "Library", radioLabel = "Radio" } = {}) {
  const raw = String(value || "").trim();
  const normalized = raw.toLowerCase();
  if (!normalized) return null;
  if (/(spotify)/.test(normalized)) return { key: "spotify", label: "Spotify" };
  if (/(tidal)/.test(normalized)) return { key: "tidal", label: "TIDAL" };
  if (/(youtube|ytmusic)/.test(normalized)) return { key: "youtube", label: "YouTube Music" };
  if (/(apple)/.test(normalized)) return { key: "apple", label: "Apple Music" };
  if (/(qobuz)/.test(normalized)) return { key: "qobuz", label: "Qobuz" };
  if (/(deezer)/.test(normalized)) return { key: "deezer", label: "Deezer" };
  if (/(filesystem|local|library|file)/.test(normalized)) return { key: "library", label: libraryLabel };
  if (/(radio_browser|radiobrowser|tunein|radio)/.test(normalized)) return { key: "radio", label: radioLabel };
  return {
    key: normalized.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 24) || "source",
    label: raw,
  };
}

export function qualityBadgeLabel(values = []) {
  const haystack = (Array.isArray(values) ? values : [values])
    .flatMap((value) => Array.isArray(value) ? value : [value])
    .map((value) => {
      if (typeof value !== "object" || value === null) return String(value || "");
      try {
        return JSON.stringify(value);
      } catch (_) {
        return String(value || "");
      }
    })
    .join(" | ")
    .toLowerCase();
  if (!haystack) return "";
  if (/(hi[\s-]?res|24[\s-]?bit|88\.2|96[\s-]?khz|96000|176\.4|192[\s-]?khz|192000)/.test(haystack)) return "Hi-Res";
  if (/(lossless|flac|alac|wav|aiff|pcm)/.test(haystack)) return "Lossless";
  return "";
}

export function stripLyricsTimestamps(text = "") {
  return String(text || "")
    .replace(/\r/g, "")
    .replace(/^\[[a-z]+:[^\]]*\]\s*$/gim, "")
    .replace(/\[\d{1,3}:\d{2}(?:[.:]\d{1,3})?\]\s*/g, "")
    .trim();
}

export function coerceLyricsRawText(value) {
  if (!value) return "";
  if (typeof value === "string") return String(value || "").replace(/\r/g, "").trim();
  if (typeof value === "object") {
    return String(
      value.syncedLyrics
      || value.synced_lyrics
      || value.plainLyrics
      || value.plain_lyrics
      || value.lyrics
      || value.text
      || "",
    ).replace(/\r/g, "").trim();
  }
  return "";
}

export function coerceLyricsText(value) {
  return stripLyricsTimestamps(coerceLyricsRawText(value));
}

export function parseLrcLyrics(text = "") {
  const rows = [];
  const raw = String(text || "").replace(/\r/g, "");
  const timeTag = /\[(\d{1,3}):(\d{2})(?:[.:](\d{1,3}))?\]/g;
  raw.split("\n").forEach((line) => {
    const tags = [...line.matchAll(timeTag)];
    if (!tags.length) return;
    const lyric = line.replace(/\[[^\]]+\]/g, "").trim();
    if (!lyric) return;
    tags.forEach((tag) => {
      const minutes = Number(tag[1]);
      const seconds = Number(tag[2]);
      const fraction = String(tag[3] || "0");
      const millis = Number(fraction.padEnd(3, "0").slice(0, 3));
      const time = minutes * 60 + seconds + millis / 1000;
      if (Number.isFinite(time)) rows.push({ time, text: lyric });
    });
  });
  return rows
    .sort((left, right) => left.time - right.time)
    .filter((row, index, list) => index === 0 || row.time !== list[index - 1].time || row.text !== list[index - 1].text);
}

export function extractCurrentLyricsRawText(queueItem = null) {
  const currentQueueItem = queueItem || {};
  const media = currentQueueItem.media_item || {};
  const metadata = media.metadata || currentQueueItem.metadata || {};
  const candidates = [
    currentQueueItem.lyrics,
    currentQueueItem.plainLyrics,
    currentQueueItem.plain_lyrics,
    currentQueueItem.syncedLyrics,
    currentQueueItem.synced_lyrics,
    media.lyrics,
    media.plainLyrics,
    media.plain_lyrics,
    media.syncedLyrics,
    media.synced_lyrics,
    metadata.lyrics,
    metadata.plainLyrics,
    metadata.plain_lyrics,
    metadata.syncedLyrics,
    metadata.synced_lyrics,
  ];
  for (const candidate of candidates) {
    const text = coerceLyricsRawText(candidate);
    if (text) return text;
  }
  return "";
}

export function extractCurrentLyricsText(queueItem = null) {
  return stripLyricsTimestamps(extractCurrentLyricsRawText(queueItem));
}

export function imageProxyUrl(path, provider = "", size = 300, maUrl = "") {
  if (!path) return null;
  if (/^(https?:|data:|blob:)/i.test(path)) return path;
  if (String(path).startsWith("/")) return String(path);
  if (!maUrl) return null;
  const providerKey = provider || "";
  return `${maUrl}/imageproxy?path=${encodeURIComponent(path)}${providerKey ? `&provider=${encodeURIComponent(providerKey)}` : ""}&size=${size}`;
}

export function imageUrl(value, size = 300, { maUrl = "", seen = new Set(), depth = 0 } = {}) {
  if (!value || depth > 5) return null;
  if (typeof value === "string") {
    const raw = String(value).trim();
    if (!raw) return null;
    if (/^(https?:|data:|blob:)/i.test(raw)) return raw;
    if (raw.startsWith("/")) return raw;
    if (raw.startsWith("imageproxy?")) return `/${raw}`;
    if (raw.startsWith("imageproxy/")) return `/${raw}`;
    if (raw.includes("/imageproxy?")) return raw;
    return imageProxyUrl(raw, "", size, maUrl);
  }
  if (typeof value !== "object") return null;
  if (seen.has(value)) return null;
  seen.add(value);

  if (Array.isArray(value)) {
    for (const entry of value) {
      const resolved = imageUrl(entry, size, { maUrl, seen, depth: depth + 1 });
      if (resolved) return resolved;
    }
    return null;
  }

  if (value.url) return value.url;

  const rawPath = value.path || value.image_path || value.thumb_path || value.cover_path;
  if (rawPath) {
    return imageProxyUrl(
      rawPath,
      value.provider || value.provider_id || value.provider_instance || value.provider_domain || value.provider_name || "",
      size,
      maUrl,
    );
  }

  const priorityKeys = [
    "image",
    "images",
    "image_url",
    "imageUrl",
    "thumb",
    "thumbnail",
    "small",
    "medium",
    "large",
    "cover",
    "cover_image",
    "artwork",
    "picture",
    "fanart",
    "square",
    "album",
    "media_item",
    "metadata",
  ];

  for (const key of priorityKeys) {
    const resolved = imageUrl(value[key], size, { maUrl, seen, depth: depth + 1 });
    if (resolved) return resolved;
  }

  for (const entry of Object.values(value)) {
    if (!entry || typeof entry !== "object") continue;
    const resolved = imageUrl(entry, size, { maUrl, seen, depth: depth + 1 });
    if (resolved) return resolved;
  }

  return null;
}

export function artUrl(item = null, maUrl = "") {
  return imageUrl(item?.image_url, 300, { maUrl })
    || imageUrl(item?.image, 300, { maUrl })
    || imageUrl(item?.album?.image_url, 300, { maUrl })
    || imageUrl(item?.album?.image, 300, { maUrl })
    || imageUrl(item?.metadata?.images, 300, { maUrl })
    || imageUrl(item?.album?.metadata?.images, 300, { maUrl })
    || null;
}

export function artistName(item = null) {
  return Array.isArray(item?.artists) ? item.artists.map((artist) => artist?.name).join(", ") : "";
}

export function formatDuration(sec) {
  if (!sec || Number.isNaN(sec)) return "0:00";
  const total = Math.floor(sec);
  const minutes = Math.floor(total / 60);
  const seconds = String(total % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function normalizeMediaItem(item, maUrl = "") {
  if (!item || typeof item !== "object") return item;
  const resolvedArt = artUrl(item, maUrl);
  return resolvedArt && item.image_url !== resolvedArt ? { ...item, image_url: resolvedArt } : item;
}
