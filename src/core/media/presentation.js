export function buildCurrentTrackInfo({ player = null, queueItem = null } = {}) {
  const currentQueueItem = queueItem || null;
  const media = currentQueueItem?.media_item || {};
  const title = media?.name || player?.attributes?.media_title || "";
  const artists = Array.isArray(media?.artists) ? media.artists.map((artist) => artist?.name).filter(Boolean).join(", ") : "";
  const artist = artists || player?.attributes?.media_artist || "";
  const album = media?.album?.name || player?.attributes?.media_album_name || "";
  const duration = coercePlaybackSeconds(currentQueueItem?.duration || player?.attributes?.media_duration || 0);
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
    currentQueueItem.lrc_lyrics,
    media.lrc_lyrics,
    metadata.lrc_lyrics,
    currentQueueItem.syncedLyrics,
    currentQueueItem.synced_lyrics,
    media.syncedLyrics,
    media.synced_lyrics,
    metadata.syncedLyrics,
    metadata.synced_lyrics,
    currentQueueItem.lyrics,
    currentQueueItem.plainLyrics,
    currentQueueItem.plain_lyrics,
    media.lyrics,
    media.plainLyrics,
    media.plain_lyrics,
    metadata.lyrics,
    metadata.plainLyrics,
    metadata.plain_lyrics,
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
  const raw = String(path || "").trim();
  if (!raw) return null;
  if (/^(data:|blob:)/i.test(raw)) return raw;
  if (raw.includes("/imageproxy?") || raw.includes("/imageproxy/")) return normalizeImageProxyUrl(raw, size, maUrl);
  if (raw.startsWith("imageproxy?") || raw.startsWith("imageproxy/")) return normalizeImageProxyUrl(`/${raw}`, size, maUrl);
  if (raw.startsWith("/") && !/^\/\//.test(raw)) return raw;
  if (!maUrl) return /^https?:/i.test(raw) ? raw : null;
  const providerKey = provider || "";
  const baseUrl = String(maUrl || "").replace(/\/$/, "");
  return `${baseUrl}/imageproxy?path=${encodeURIComponent(raw)}${providerKey ? `&provider=${encodeURIComponent(providerKey)}` : ""}&size=${normalizeImageProxySize(size)}`;
}

export function normalizeImageProxySize(size = 300) {
  const numeric = Number(size);
  if (Number.isFinite(numeric) && numeric <= 0) return 0;
  const requested = Number.isFinite(numeric) ? Math.ceil(numeric) : 300;
  for (const allowed of [80, 160, 256, 512, 1024]) {
    if (requested <= allowed) return allowed;
  }
  return 1024;
}

export function imageProxyIdUrl(proxyId = "", size = 300, maUrl = "", format = "") {
  const raw = String(proxyId || "").trim();
  if (!raw || !maUrl) return null;
  if (!/^[0-9a-f]{64}$/i.test(raw)) return null;
  const baseUrl = String(maUrl || "").replace(/\/$/, "");
  const normalizedId = raw.toLowerCase();
  const normalizedFormat = String(format || "").trim().toLowerCase();
  const params = new URLSearchParams({ size: String(normalizeImageProxySize(size)) });
  if (normalizedFormat) params.set("fmt", normalizedFormat);
  return `${baseUrl}/imageproxy/${encodeURIComponent(normalizedId)}?${params.toString()}`;
}

function imageDataUrlFromEncoded(value = "") {
  const raw = String(value || "").trim();
  if (!raw || raw.length < 80 || raw.includes("://") || /\s/.test(raw)) return "";
  if (raw.startsWith("/") && !raw.startsWith("/9j/")) return "";
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(raw)) return "";
  let mime = "image/jpeg";
  if (raw.startsWith("iVBOR")) mime = "image/png";
  else if (raw.startsWith("R0lG")) mime = "image/gif";
  else if (raw.startsWith("UklGR")) mime = "image/webp";
  return `data:${mime};base64,${raw}`;
}

export function normalizeImageProxyUrl(value = "", size = 300, maUrl = "") {
  const raw = String(value || "").trim();
  if (!raw || /^(data:|blob:)/i.test(raw)) return raw;
  const isAbsolute = /^https?:\/\//i.test(raw);
  const baseUrl = maUrl || "http://homeii.local";
  try {
    const parsed = new URL(raw, baseUrl);
    if (!parsed.pathname.toLowerCase().includes("/imageproxy")) return raw;
    parsed.searchParams.set("size", String(normalizeImageProxySize(size)));
    if (isAbsolute || maUrl) return parsed.toString();
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return raw;
  }
}

export function rebaseImageProxyUrl(value = "", size = 300, maUrl = "") {
  const raw = String(value || "").trim();
  const configuredRaw = String(maUrl || "").trim();
  if (!raw || !configuredRaw || !/^https?:\/\//i.test(configuredRaw)) return raw;
  try {
    const parsed = new URL(raw, configuredRaw);
    const proxyIndex = parsed.pathname.toLowerCase().indexOf("/imageproxy");
    if (proxyIndex < 0) return raw;
    const configured = new URL(configuredRaw);
    const basePath = configured.pathname.replace(/\/$/, "");
    const proxyPath = parsed.pathname.slice(proxyIndex);
    const resolved = new URL(`${basePath}${proxyPath}`, configured);
    resolved.search = parsed.search;
    resolved.hash = parsed.hash;
    resolved.searchParams.set("size", String(normalizeImageProxySize(size)));
    return resolved.toString();
  } catch {
    return raw;
  }
}

export function imageUrl(value, size = 300, { maUrl = "", seen = new Set(), depth = 0 } = {}) {
  if (!value || depth > 5) return null;
  if (typeof value === "string") {
    const raw = String(value).trim();
    if (!raw) return null;
    if (/^(data:|blob:)/i.test(raw)) return raw;
    const encodedImage = imageDataUrlFromEncoded(raw);
    if (encodedImage) return encodedImage;
    if (raw.includes("/imageproxy?") || raw.includes("/imageproxy/")) return normalizeImageProxyUrl(raw, size, maUrl);
    if (raw.startsWith("imageproxy?") || raw.startsWith("imageproxy/")) return normalizeImageProxyUrl(`/${raw}`, size, maUrl);
    if (raw.startsWith("/")) return raw;
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

  if (value.url) return imageUrl(value.url, size, { maUrl, seen, depth: depth + 1 });

  const proxyId = value.proxy_id || value.proxyId || value.image_id || value.imageId || value.image_proxy_id || value.imageProxyId;
  const proxyResolved = proxyId ? imageProxyIdUrl(proxyId, size, maUrl, value.format || value.fmt || "") : null;
  if (proxyResolved) return proxyResolved;

  const rawPath = value.path || value.image_path || value.imagePath || value.thumb_path || value.thumbnail_path || value.cover_path || value.coverPath;
  if (rawPath) {
    return imageProxyUrl(
      rawPath,
      value.provider || value.provider_id || value.provider_instance || value.provider_domain || value.provider_name || "",
      size,
      maUrl,
    );
  }

  const priorityKeys = [
    "homeii_artwork_url",
    "image",
    "images",
    "image_url",
    "imageUrl",
    "media_image",
    "media_image_url",
    "local_image",
    "local_image_url",
    "local_image_encoded",
    "preview_image",
    "preview_image_url",
    "external_image_url",
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

export function legacyImageProxyFallbackUrl(value, size = 300, { maUrl = "", seen = new Set(), depth = 0 } = {}) {
  if (!value || depth > 5 || typeof value !== "object") return null;
  if (seen.has(value)) return null;
  seen.add(value);

  if (Array.isArray(value)) {
    for (const entry of value) {
      const resolved = legacyImageProxyFallbackUrl(entry, size, { maUrl, seen, depth: depth + 1 });
      if (resolved) return resolved;
    }
    return null;
  }

  const proxyId = value.proxy_id || value.proxyId || value.image_id || value.imageId || value.image_proxy_id || value.imageProxyId;
  const rawPath = value.path || value.image_path || value.imagePath || value.thumb_path || value.thumbnail_path || value.cover_path || value.coverPath;
  if (/^[0-9a-f]{64}$/i.test(String(proxyId || "").trim()) && rawPath) {
    return imageProxyUrl(
      rawPath,
      value.provider || value.provider_id || value.provider_instance || value.provider_domain || value.provider_name || "",
      size,
      maUrl,
    );
  }

  const priorityKeys = [
    "homeii_artwork_url", "image", "images", "image_url", "imageUrl", "media_image", "media_image_url",
    "local_image", "local_image_url", "preview_image", "preview_image_url",
    "thumb", "thumbnail", "cover", "cover_image", "artwork", "picture",
    "album", "media_item", "metadata",
  ];
  for (const key of priorityKeys) {
    const resolved = legacyImageProxyFallbackUrl(value[key], size, { maUrl, seen, depth: depth + 1 });
    if (resolved) return resolved;
  }
  return null;
}

export function artUrl(item = null, maUrl = "", size = 300) {
  return imageUrl(item?.homeii_artwork_url, size, { maUrl })
    || imageUrl(item?.media_item?.homeii_artwork_url, size, { maUrl })
    || imageUrl(item?.album?.homeii_artwork_url, size, { maUrl })
    || imageUrl(item?.image_url, size, { maUrl })
    || imageUrl(item?.image, size, { maUrl })
    || imageUrl(item?.thumbnail, size, { maUrl })
    || imageUrl(item?.thumb, size, { maUrl })
    || imageUrl(item?.cover, size, { maUrl })
    || imageUrl(item?.media_image, size, { maUrl })
    || imageUrl(item?.media_item?.image_url, size, { maUrl })
    || imageUrl(item?.media_item?.image, size, { maUrl })
    || imageUrl(item?.media_item?.metadata?.images, size, { maUrl })
    || imageUrl(item?.album?.image_url, size, { maUrl })
    || imageUrl(item?.album?.image, size, { maUrl })
    || imageUrl(item?.metadata?.images, size, { maUrl })
    || imageUrl(item?.album?.metadata?.images, size, { maUrl })
    || imageUrl(item, size, { maUrl })
    || null;
}

export function artistName(item = null) {
  return Array.isArray(item?.artists) ? item.artists.map((artist) => artist?.name).join(", ") : "";
}

export function coercePlaybackSeconds(value, { allowMilliseconds = true } = {}) {
  if (value === undefined || value === null || value === "") return 0;
  if (typeof value === "string") {
    const raw = value.trim();
    if (!raw) return 0;
    const parts = raw.match(/^(\d{1,2}:)?\d{1,3}:\d{2}(?:\.\d+)?$/) ? raw.split(":") : null;
    if (parts) {
      const nums = parts.map((part) => Number(part));
      if (nums.every(Number.isFinite)) {
        if (nums.length === 3) return Math.max(0, nums[0] * 3600 + nums[1] * 60 + nums[2]);
        return Math.max(0, nums[0] * 60 + nums[1]);
      }
    }
    const iso = raw.match(/^PT(?:(\d+(?:\.\d+)?)H)?(?:(\d+(?:\.\d+)?)M)?(?:(\d+(?:\.\d+)?)S)?$/i);
    if (iso) {
      return Math.max(0, Number(iso[1] || 0) * 3600 + Number(iso[2] || 0) * 60 + Number(iso[3] || 0));
    }
  }
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return 0;
  if (allowMilliseconds && numeric > 86400 && numeric % 1000 === 0) return numeric / 1000;
  return numeric;
}

export function parsePlaybackTimestampMs(value, { now = Date.now() } = {}) {
  if (value === undefined || value === null || value === "") return 0;
  if (typeof value === "number") {
    if (!Number.isFinite(value) || value <= 0) return 0;
    return value > 1000000000000 ? value : value * 1000;
  }
  const raw = String(value || "").trim();
  if (!raw) return 0;
  const numeric = Number(raw);
  if (Number.isFinite(numeric) && numeric > 0) return numeric > 1000000000000 ? numeric : numeric * 1000;
  let normalized = raw.replace(/^(\d{4}-\d{2}-\d{2})\s+/, "$1T");
  normalized = normalized.replace(/(\.\d{3})\d+/, "$1");
  normalized = normalized.replace(/([+-]\d{2})(\d{2})$/, "$1:$2");
  if (/(?:z|[+-]\d{2}:?\d{2})$/i.test(normalized)) {
    const parsed = Date.parse(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  const candidates = [Date.parse(`${normalized}Z`), Date.parse(normalized)]
    .filter((candidate) => Number.isFinite(candidate));
  if (!candidates.length) return 0;
  const parsed = candidates.reduce((best, candidate) => (
    Math.abs(candidate - now) < Math.abs(best - now) ? candidate : best
  ), candidates[0]);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatDuration(sec) {
  const normalized = coercePlaybackSeconds(sec);
  if (!normalized) return "0:00";
  const total = Math.floor(normalized);
  const minutes = Math.floor(total / 60);
  const seconds = String(total % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function normalizeMediaItem(item, maUrl = "") {
  if (!item || typeof item !== "object") return item;
  const resolvedArt = artUrl(item, maUrl);
  return resolvedArt && item.image_url !== resolvedArt ? { ...item, image_url: resolvedArt } : item;
}
