import { describe, expect, it } from "vitest";

import {
  acceptEngineSnapshot,
  engineSnapshotKey,
  engineSnapshotRevision,
  resetEngineSnapshotRevisions,
} from "../src/core/state/revisioned-snapshots.js";

describe("revisioned Engine snapshots", () => {
  it("rejects a late older response for the same runtime and identity", () => {
    const revisions = new Map();
    const current = { snapshot: { domain: "queue", epoch: "boot-a", identity: "living-room", revision: 8 } };
    const late = { snapshot: { domain: "queue", epoch: "boot-a", identity: "living-room", revision: 7 } };

    expect(acceptEngineSnapshot(revisions, "queue", current)).toBe(true);
    expect(acceptEngineSnapshot(revisions, "queue", late)).toBe(false);
    expect(engineSnapshotRevision(current)).toBe(8);
  });

  it("accepts equal revisions and isolates players, queues, and identities", () => {
    const revisions = new Map();
    const queue = { snapshot: { domain: "queue", epoch: "boot-a", identity: "kitchen", revision: 4 } };
    const players = { snapshot: { domain: "players", epoch: "boot-a", identity: "music_assistant", revision: 2 } };
    const otherQueue = { snapshot: { domain: "queue", epoch: "boot-a", identity: "office", revision: 1 } };

    expect(acceptEngineSnapshot(revisions, "queue", queue)).toBe(true);
    expect(acceptEngineSnapshot(revisions, "queue", queue)).toBe(true);
    expect(acceptEngineSnapshot(revisions, "players", players)).toBe(true);
    expect(acceptEngineSnapshot(revisions, "queue", otherQueue)).toBe(true);
  });

  it("accepts revision one after an Engine restart because the epoch changes", () => {
    const revisions = new Map();
    const beforeRestart = { snapshot: { domain: "library", epoch: "boot-a", identity: "album", revision: 19 } };
    const afterRestart = { snapshot: { domain: "library", epoch: "boot-b", identity: "album", revision: 1 } };

    expect(acceptEngineSnapshot(revisions, "library", beforeRestart)).toBe(true);
    expect(acceptEngineSnapshot(revisions, "library", afterRestart)).toBe(true);
    expect(engineSnapshotKey("library", afterRestart)).toContain("boot-b");
  });

  it("keeps compatibility with Engine responses that predate revisions", () => {
    const revisions = new Map();
    expect(acceptEngineSnapshot(revisions, "queue", { normalized: { items: [] } }, "player")).toBe(true);
    expect(revisions.size).toBe(0);
  });

  it("can clear one snapshot domain without touching the others", () => {
    const revisions = new Map([
      ["queue:boot-a:kitchen", 4],
      ["players:boot-a:music_assistant", 2],
    ]);
    resetEngineSnapshotRevisions(revisions, "queue");
    expect(revisions.has("queue:boot-a:kitchen")).toBe(false);
    expect(revisions.has("players:boot-a:music_assistant")).toBe(true);
  });
});
