const GENERIC_PLAYER_TOKENS = new Set([
  "media",
  "player",
  "speaker",
  "room",
  "homeii",
  "browser",
  "music",
  "assistant",
  "\u05e8\u05de\u05e7\u05d5\u05dc\u05d9\u05dd",
  "\u05e0\u05d2\u05df",
]);

export const genericPlayerTokens = GENERIC_PLAYER_TOKENS;

const GENERIC_PLAYER_NAME_KEYS = new Set([
  "media player",
  "media players",
  "music player",
  "player",
  "speaker",
  "speakers",
  "renderer",
  "media renderer",
  "home assistant media player",
  "esphome media player",
  "\u05e0\u05d2\u05df",
  "\u05e0\u05d2\u05df \u05de\u05d3\u05d9\u05d4",
  "\u05e8\u05de\u05e7\u05d5\u05dc",
  "\u05e8\u05de\u05e7\u05d5\u05dc\u05d9\u05dd",
]);

function normalizedPlayerDisplayKey(value = "") {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/^media_player\./, "")
    .replace(/[_\-.]+/g, " ")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function playerEntityDisplayName(entityId = "") {
  const raw = String(entityId || "")
    .trim()
    .replace(/^media_player\./, "")
    .replace(/[_\-.]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!raw) return "";
  return raw.replace(/\b([a-z])([a-z0-9]*)/gi, (match, first, rest) => `${first.toUpperCase()}${rest}`);
}

export function isGenericPlayerDisplayName(name = "") {
  const key = normalizedPlayerDisplayKey(name);
  if (!key) return true;
  return GENERIC_PLAYER_NAME_KEYS.has(key)
    || /^media player \d+$/.test(key)
    || /^player \d+$/.test(key)
    || /^speaker \d+$/.test(key);
}

export function playerDisplayName(player = null, { players = [], includeEntityId = true } = {}) {
  const entityId = String(player?.entity_id || "").trim();
  const friendly = String(player?.attributes?.friendly_name || "").trim();
  const entityLabel = playerEntityDisplayName(entityId);
  const base = friendly || entityLabel || entityId;
  if (!base) return "";
  if (!includeEntityId || !entityId) return base;
  const sourcePlayers = Array.isArray(players) ? players : [];
  const friendlyKey = normalizedPlayerDisplayKey(friendly);
  const duplicateFriendly = !!friendlyKey && sourcePlayers
    .filter((entry) => normalizedPlayerDisplayKey(entry?.attributes?.friendly_name || "") === friendlyKey)
    .length > 1;
  const genericFriendly = friendly ? isGenericPlayerDisplayName(friendly) : false;
  const baseKey = normalizedPlayerDisplayKey(base);
  const entityKey = normalizedPlayerDisplayKey(entityLabel || entityId);
  const suffix = entityLabel && entityKey !== baseKey ? entityLabel : entityId;
  return (genericFriendly || duplicateFriendly) && suffix && normalizedPlayerDisplayKey(suffix) !== baseKey
    ? `${base} (${suffix})`
    : base;
}

export function entityMatchTokens(value = "") {
  return String(value || "")
    .toLowerCase()
    .replace(/^media_player\./, "")
    .replace(/^button\./, "")
    .replace(/[_\-.]+/g, " ")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token && token.length > 1);
}

export function isLikelyBrowserPlayer(player = null) {
  if (!player) return false;
  const attrs = player.attributes || {};
  const haystack = [
    player.entity_id,
    attrs.friendly_name,
    attrs.mass_player_type,
    attrs.mass_player_id,
    attrs.app_id,
    attrs.provider,
    attrs.provider_name,
    attrs.source,
    attrs.model,
  ].filter(Boolean).join(" ").toLowerCase();
  return haystack.includes("sendspin")
    || haystack.includes("browser")
    || haystack.includes("web player")
    || haystack.includes("this device");
}

export function isMusicAssistantPlayer(player = null, registryEntry = null) {
  if (!player?.entity_id?.startsWith("media_player.")) return false;
  const attrs = player.attributes || {};
  const registry = registryEntry || {};
  const identity = [
    attrs.app_id,
    attrs.integration,
    attrs.platform,
    attrs.provider,
    attrs.provider_name,
    registry.integration,
    registry.platform,
    registry.device_class,
  ].filter(Boolean).join(" ").toLowerCase();
  return identity.includes("music_assistant")
    || identity.includes("music assistant")
    || !!attrs.mass_player_type
    || !!attrs.mass_player_id
    || !!attrs.active_queue;
}

export function getBrowserPlayers(players = []) {
  return (Array.isArray(players) ? players : []).filter((player) => isLikelyBrowserPlayer(player));
}

export function getThisDevicePlayer(players = [], rememberedId = "") {
  const target = String(rememberedId || "").trim();
  if (!target) return null;
  return (Array.isArray(players) ? players : []).find((player) => player?.entity_id === target) || null;
}

export function isPlayerAvailable(player = null) {
  return !!player && player.available !== false && player.attributes?.available !== false
    && !["unavailable", "unknown"].includes(String(player.state || "").toLowerCase());
}

export function resolvePinnedPlayerEntities(preferredIds = [], players = []) {
  const validIds = new Set((Array.isArray(players) ? players : []).map((player) => String(player?.entity_id || "").toLowerCase()));
  return (Array.isArray(preferredIds) ? preferredIds : [])
    .filter((entityId) => validIds.has(String(entityId || "").toLowerCase()));
}

export function resolvePreferredFrontPlayerEntity(players = [], {
  currentEntityId = "",
  frontPinnedEntityId = "",
  manualFrontEntityId = "",
  manualFrontUntil = 0,
  now = Date.now(),
  pinnedEntityIds = [],
  orderedEntityIds = [],
  defaultEntityId = "",
  isPlayerActiveFn = (player) => player?.state === "playing",
  isExternalBrowserPlayerFn = isLikelyBrowserPlayer,
} = {}) {
  const sourcePlayers = Array.isArray(players) ? players : [];
  const byId = new Map(sourcePlayers.map((player) => [player?.entity_id, player]).filter(([entityId]) => !!entityId));
  const sourceIndex = new Map(sourcePlayers.map((player, index) => [player?.entity_id, index]).filter(([entityId]) => !!entityId));
  const orderIndex = new Map((Array.isArray(orderedEntityIds) ? orderedEntityIds : [])
    .map((entityId, index) => [String(entityId || "").trim(), index])
    .filter(([entityId]) => !!entityId));
  const usable = (player) => !!player?.entity_id && isPlayerAvailable(player) && !isExternalBrowserPlayerFn(player);
  const usableById = (entityId) => {
    const player = byId.get(String(entityId || "").trim());
    return usable(player) ? player : null;
  };
  const rank = (player) => orderIndex.has(player?.entity_id)
    ? orderIndex.get(player.entity_id)
    : 100000 + (sourceIndex.get(player?.entity_id) ?? 100000);
  const pickPreferred = (candidates = []) => candidates
    .filter(usable)
    .sort((left, right) => rank(left) - rank(right))[0] || null;
  const manualFrontCandidate = usableById(manualFrontEntityId);
  const manualFront = manualFrontCandidate && (
    Number(manualFrontUntil || 0) > Number(now || 0)
    || manualFrontCandidate.state === "playing"
  )
    ? manualFrontCandidate
    : null;
  if (manualFront) return manualFront.entity_id;
  const frontPinned = usableById(frontPinnedEntityId);
  if (frontPinned) return frontPinned.entity_id;
  const playing = pickPreferred(sourcePlayers.filter((player) => player?.state === "playing"));
  if (playing) return playing.entity_id;
  const active = pickPreferred(sourcePlayers.filter((player) => isPlayerActiveFn(player)));
  if (active) return active.entity_id;
  const defaultPlayer = usableById(defaultEntityId);
  if (defaultPlayer) return defaultPlayer.entity_id;
  for (const entityId of Array.isArray(pinnedEntityIds) ? pinnedEntityIds : []) {
    const pinned = usableById(entityId);
    if (pinned) return pinned.entity_id;
  }
  for (const entityId of Array.isArray(orderedEntityIds) ? orderedEntityIds : []) {
    const ordered = usableById(entityId);
    if (ordered) return ordered.entity_id;
  }
  const current = usableById(currentEntityId);
  if (current) return current.entity_id;
  return (sourcePlayers.find(usable) || sourcePlayers[0])?.entity_id || "";
}

export function playerByEntityId(entityId = "", players = [], hassStates = {}) {
  const target = String(entityId || "").trim();
  if (!target) return null;
  return (Array.isArray(players) ? players : []).find((player) => player?.entity_id === target)
    || hassStates?.[target]
    || null;
}

export function favoriteButtonEntityForPlayer({
  player = null,
  hassStates = {},
  explicitEntity = "",
  fallbackEntity = "button.bathroom_favorite_current_song_2",
} = {}) {
  const configured = String(explicitEntity || "").trim();
  if (configured && hassStates?.[configured]) return configured;
  if (hassStates?.[fallbackEntity]) {
    const selectedName = `${player?.entity_id || ""} ${player?.attributes?.friendly_name || ""}`.toLowerCase();
    if (!selectedName || selectedName.includes("bathroom") || selectedName.includes("\u05de\u05e7\u05dc\u05d7\u05ea")) {
      return fallbackEntity;
    }
  }
  const buttons = Object.values(hassStates || {}).filter((entity) => {
    if (!entity?.entity_id?.startsWith("button.")) return false;
    const search = `${entity.entity_id} ${entity.attributes?.friendly_name || ""}`.toLowerCase();
    return search.includes("favorite") || search.includes("\u05d0\u05d4\u05d5\u05d1") || search.includes("\u05d0\u05d4\u05d1\u05ea\u05d9");
  });
  if (!buttons.length) return "";
  if (buttons.length === 1) return buttons[0]?.entity_id || "";
  const tokens = [
    ...entityMatchTokens(player?.entity_id || ""),
    ...entityMatchTokens(player?.attributes?.friendly_name || ""),
  ].filter((token) => !GENERIC_PLAYER_TOKENS.has(token));
  const scored = buttons
    .map((entity) => {
      const haystack = `${entity.entity_id} ${entity.attributes?.friendly_name || ""}`.toLowerCase();
      const score = tokens.reduce((sum, token) => sum + (haystack.includes(token) ? 1 : 0), 0);
      const currentSongBoost = /(current|song|track|playing|\u05e0\u05d5\u05db\u05d7\u05d9|\u05de\u05ea\u05e0\u05d2\u05df)/.test(haystack) ? 0.5 : 0;
      return { entity_id: entity.entity_id, score: score + currentSongBoost };
    })
    .sort((left, right) => right.score - left.score);
  if (scored[0]?.score > 0) return scored[0].entity_id;
  const genericCurrent = buttons.find((entity) => /(current|song|track|playing|\u05e0\u05d5\u05db\u05d7\u05d9|\u05de\u05ea\u05e0\u05d2\u05df)/.test(`${entity.entity_id} ${entity.attributes?.friendly_name || ""}`.toLowerCase()));
  if (genericCurrent?.entity_id) return genericCurrent.entity_id;
  return "";
}

export function favoriteButtonDeviceId(entityId = "", hassEntities = {}) {
  const target = String(entityId || "").trim();
  if (!target) return "";
  return String(hassEntities?.[target]?.device_id || "").trim();
}

export function announcementEligiblePlayers(players = []) {
  return (Array.isArray(players) ? players : [])
    .filter((player) => player?.entity_id)
    .filter((player) => !isLikelyBrowserPlayer(player));
}

export function mobileNavigableActivePlayers(players = [], pinnedEntityIds = [], isPlayerActiveFn = () => false) {
  const sourcePlayers = Array.isArray(players) ? players : [];
  const preferred = Array.isArray(pinnedEntityIds) ? pinnedEntityIds.filter(Boolean) : [];
  if (preferred.length) {
    return preferred
      .map((entityId) => sourcePlayers.find((player) => player?.entity_id === entityId))
      .filter(Boolean);
  }
  return sourcePlayers
    .filter((player) => isPlayerActiveFn(player))
    .filter((player) => !isLikelyBrowserPlayer(player));
}

export function playerGroupMemberIds(player = null) {
  const ids = Array.isArray(player?.attributes?.group_members)
    ? player.attributes.group_members.filter(Boolean)
    : [];
  if (player?.entity_id && ids.length && !ids.includes(player.entity_id)) ids.unshift(player.entity_id);
  return [...new Set(ids)];
}

export function isStaticGroupPlayer(player = null) {
  if (!player) return false;
  const attrs = player.attributes || {};
  const typeText = [
    player.entity_id,
    attrs.friendly_name,
    attrs.mass_player_type,
    attrs.player_type,
    attrs.type,
    attrs.grouping_type,
    attrs.group_type,
    attrs.device_class,
  ].map((value) => String(value || "").toLowerCase()).join(" ");
  const looksLikeGroup = !!(
    attrs.is_group
    || attrs.is_group_player
    || attrs.group_childs
    || attrs.group_children
    || attrs.group_members?.length > 1
  );
  return looksLikeGroup && /(sync|static|group|party|all speakers|whole home|everywhere)/.test(typeText);
}

export function playerGroupCount(player = null) {
  if (isStaticGroupPlayer(player)) return 0;
  const count = playerGroupMemberIds(player).length;
  return count > 1 ? count : 0;
}

export function playerGroupMemberNames(player = null, players = []) {
  const ids = playerGroupMemberIds(player);
  const byId = new Map((Array.isArray(players) ? players : []).map((entry) => [entry?.entity_id, entry]));
  return ids
    .map((entityId) => byId.get(entityId)?.attributes?.friendly_name || entityId)
    .filter(Boolean);
}

export function groupAverageVolume(player = null, players = []) {
  const ids = playerGroupMemberIds(player);
  const byId = new Map((Array.isArray(players) ? players : []).map((entry) => [entry?.entity_id, entry]));
  const volumes = ids.length ? ids.map((entityId) => playerVolumeValue(byId.get(entityId))) : [playerVolumeValue(player)];
  if (volumes.some((value) => value === null)) return null;
  return Math.round((volumes.reduce((sum, value) => sum + value, 0) / volumes.length) * 100);
}

export function playerVolumeValue(player = null) {
  const raw = player?.attributes?.volume_level;
  if (raw === null || raw === undefined || raw === "") return null;
  const value = Number(raw);
  return Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : null;
}

export function playerCanSetVolume(player = null) {
  if (playerVolumeValue(player) === null || player?.available === false || player?.attributes?.available === false) return false;
  const features = player?.attributes?.supported_features;
  return !Array.isArray(features) || features.includes("volume_set");
}

export function groupedPlayerIds(players = []) {
  const sourcePlayers = Array.isArray(players) ? players : [];
  const ids = new Set();
  const byId = new Map(sourcePlayers.map((player) => [player?.entity_id, player]));
  for (const player of sourcePlayers) {
    if (isLikelyBrowserPlayer(player)) continue;
    if (isStaticGroupPlayer(player)) continue;
    const members = playerGroupMemberIds(player);
    if (members.length > 1) {
      members
        .filter((entityId) => entityId && entityId !== player.entity_id)
        .filter((entityId) => !isLikelyBrowserPlayer(byId.get(entityId)))
        .filter((entityId) => !isStaticGroupPlayer(byId.get(entityId)))
        .forEach((entityId) => ids.add(entityId));
    }
  }
  return Array.from(ids);
}
