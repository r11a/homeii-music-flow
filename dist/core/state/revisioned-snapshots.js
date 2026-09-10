export function engineSnapshotMeta(payload = null) {
  const candidates = [
    payload?.snapshot,
    payload?.normalized?.snapshot,
    payload?.data?.snapshot,
    payload?.data?.normalized?.snapshot,
  ];
  return candidates.find((candidate) => candidate && typeof candidate === "object") || null;
}

export function engineSnapshotRevision(payload = null) {
  const revision = Number(engineSnapshotMeta(payload)?.revision);
  return Number.isSafeInteger(revision) && revision > 0 ? revision : 0;
}

export function engineSnapshotKey(domain = "", payload = null, fallbackIdentity = "") {
  const meta = engineSnapshotMeta(payload);
  const cleanDomain = String(meta?.domain || domain || "state").trim().toLowerCase();
  const epoch = String(meta?.epoch || "legacy").trim().toLowerCase();
  const identity = String(meta?.identity || fallbackIdentity || "default").trim().toLowerCase();
  return `${cleanDomain}:${epoch}:${identity}`;
}

export function acceptEngineSnapshot(revisions, domain, payload, fallbackIdentity = "") {
  if (!(revisions instanceof Map)) return true;
  const revision = engineSnapshotRevision(payload);
  if (!revision) return true;
  const key = engineSnapshotKey(domain, payload, fallbackIdentity);
  const acceptedRevision = Number(revisions.get(key) || 0);
  if (acceptedRevision > revision) return false;
  revisions.set(key, revision);
  return true;
}

export function resetEngineSnapshotRevisions(revisions, domain = "") {
  if (!(revisions instanceof Map)) return;
  const prefix = String(domain || "").trim().toLowerCase();
  if (!prefix) {
    revisions.clear();
    return;
  }
  for (const key of revisions.keys()) {
    if (String(key).startsWith(`${prefix}:`)) revisions.delete(key);
  }
}
