export const HOMEII_ENGINE_COMMAND_PREFIX = "homeii_flow";
export const HOMEII_ENGINE_MODES = Object.freeze(["required"]);

export function normalizeHomeiiEngineMode(value = "required") {
  const mode = String(value || "").trim().toLowerCase();
  return HOMEII_ENGINE_MODES.includes(mode) ? mode : "required";
}

export function homeiiEngineModeAllowsCalls(value = "required") {
  return normalizeHomeiiEngineMode(value) !== "off";
}

export function homeiiEngineModeRequiresEngine(value = "required") {
  return normalizeHomeiiEngineMode(value) === "required";
}

export function clampHomeiiEngineTimeoutMs(value, fallback = 3500) {
  const numeric = Number(value);
  const safe = Number.isFinite(numeric) ? numeric : fallback;
  return Math.max(1000, Math.min(30000, safe));
}

export function normalizeHomeiiEngineId(value = "") {
  return String(value || "").trim().slice(0, 128);
}

export function homeiiEngineCommandType(command = "get_context") {
  const clean = String(command || "get_context")
    .trim()
    .replace(/^\/+|\/+$/g, "")
    .replace(/[^a-zA-Z0-9_/-]+/g, "_")
    || "get_context";
  return `${HOMEII_ENGINE_COMMAND_PREFIX}/${clean}`;
}

export function normalizeHomeiiEngineCapabilities(payload = null) {
  const source = payload?.capabilities || payload?.data?.capabilities || payload;
  if (Array.isArray(source)) {
    return source.reduce((acc, capability) => {
      const key = String(capability || "").trim();
      if (key) acc[key] = true;
      return acc;
    }, {});
  }
  if (source && typeof source === "object") return { ...source };
  return {};
}

export function normalizeHomeiiEngineContext(payload = null) {
  const context = payload?.context && typeof payload.context === "object" ? payload.context : payload;
  const data = context && typeof context === "object" ? context : {};
  return {
    available: !!payload,
    version: String(data.version || data.engine_version || payload?.version || "").trim(),
    instanceId: normalizeHomeiiEngineId(data.instance_id || data.instanceId || payload?.instance_id || ""),
    profileId: normalizeHomeiiEngineId(data.profile_id || data.profileId || payload?.profile_id || ""),
    capabilities: normalizeHomeiiEngineCapabilities(data.capabilities || payload?.capabilities),
    raw: payload || null,
  };
}

export function summarizeHomeiiEngineCapabilities(capabilities = {}) {
  const keys = Object.entries(capabilities || {})
    .filter(([, enabled]) => enabled !== false && enabled != null)
    .map(([key]) => key)
    .filter(Boolean)
    .slice(0, 8);
  return keys.length ? keys.join(", ") : "none reported";
}
