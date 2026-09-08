import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

const readSource = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

describe("HOMEii Flow 6 Engine performance contract", () => {
  it("keeps authenticated Music Assistant commands on the Engine transport", async () => {
    const source = await readSource("src/core/base-music-card.js");
    const commandMethod = source.slice(
      source.indexOf("async _callEngineMaCommand"),
      source.indexOf("async _callHaServiceRaw"),
    );

    expect(commandMethod).toContain("_homeiiEngineMaCommand");
    expect(commandMethod).not.toContain("fetch(");
    expect(commandMethod).not.toContain("_wsSend");
    expect(source).not.toContain("new WebSocket(wsUrl)");
  });

  it("requires the MA 2.10 Engine 0.7 contract and healthy backend connections", async () => {
    const source = await readSource("src/homeii-music-flow.js");
    const validators = await readSource("src/config/validators.js");

    expect(source).toContain('_homeiiEngineVersionAtLeast("0.7.6")');
    expect(source).toContain('"music_assistant_schema_63"');
    expect(source).toContain('"music_assistant_websocket_commands"');
    expect(source).toContain('"typed_music_assistant_contract"');
    expect(source).toContain('"full_queue_snapshots"');
    expect(source).toContain("requiredConnections?.ok === true");
    expect(validators).toContain('["required"]');
    expect(validators).not.toContain("ma_token");
    expect(validators).not.toContain("ma_url");
  });

  it("keeps queue and library DOM work inside a recycled scroll window", async () => {
    const source = await readSource("src/homeii-music-flow.js");

    expect(source).toContain("this._queueVirtualStart = 0");
    expect(source).toContain("this._mediaVirtualStarts");
    expect(source).toContain("virtual-list-spacer");
    expect(source).toContain("data-virtual-row-height");
    expect(source).toContain("currentIndex - 12");
    expect(source).toContain("visibleStartIndex: virtualStart");
    expect(source).not.toContain("data-queue-virtual-remaining");
  });

  it("coalesces duplicate detail loads and records menu render cost", async () => {
    const baseSource = await readSource("src/core/base-music-card.js");
    const cardSource = await readSource("src/homeii-music-flow.js");

    expect(baseSource).toContain("this._libraryDetailLoadPromises");
    expect(baseSource).toContain("this._artistDetailLoadPromises");
    expect(cardSource).toContain("lastMenuRenderMs");
    expect(cardSource).toContain("_handleMobileMenuPointerDown");
  });

  it("orders Engine snapshots and preserves stale library rows during revalidation", async () => {
    const baseSource = await readSource("src/core/base-music-card.js");
    const cardSource = await readSource("src/homeii-music-flow.js");
    const revisionSource = await readSource("src/core/state/revisioned-snapshots.js");

    expect(baseSource).toContain("acceptEngineSnapshot");
    expect(baseSource).toContain("_scheduleQueueRefreshAfterMutation");
    expect(revisionSource).toContain("acceptedRevision > revision");
    expect(revisionSource).toContain("meta?.epoch");
    expect(cardSource).toContain("cached.ts = 0");
  });

  it("routes aggregated favorites and mutations through the Engine", async () => {
    const baseSource = await readSource("src/core/base-music-card.js");
    const cardSource = await readSource("src/homeii-music-flow.js");

    expect(baseSource).toContain("_homeiiEngineGetFavorites");
    expect(baseSource).toContain("_homeiiEngineSetFavorite");
    expect(baseSource).toContain("favorites_aggregate");
    expect(baseSource).toContain("favorite_mutation");
    expect(cardSource).toContain('data-library-liked-open="library_liked"');
    expect(cardSource).toContain("_scheduleFavoriteReconcile");
  });

  it("does not recover queue playback or transfer in the browser", async () => {
    const source = await readSource("src/core/base-music-card.js");
    const queuePlayback = source.slice(
      source.indexOf("async _playQueueItem"),
      source.indexOf("async _callService("),
    );
    const queueTransfer = source.slice(
      source.indexOf("async _transferQueueBetween"),
      source.indexOf("async _transferQueueTo"),
    );

    expect(queuePlayback).toContain('"player_queues/play_index"');
    expect(queuePlayback).not.toContain("_callMassQueueCommand");
    expect(queuePlayback).not.toContain("_callMassQueueService");
    expect(queuePlayback).not.toContain("_stepQueueByDelta");
    expect(queuePlayback).toContain("_clearPlayerPlaybackOptimistic");
    expect(queuePlayback).toContain("_ensureQueueSnapshot(true)");
    expect(queueTransfer).toContain("_callMusicAssistantTransferQueue");
    expect(queueTransfer).not.toContain("_rebuildQueue");
  });

  it("allows the Engine bootstrap enough time for authenticated contract probes", async () => {
    const source = await readSource("src/homeii-music-flow.js");
    const bootstrap = source.slice(
      source.indexOf("async _refreshHomeiiEngineContext"),
      source.indexOf("_subscribeHomeiiEngineMusicAssistantEvents"),
    );

    expect(bootstrap).toContain("Math.max(20000, this._homeiiEngineTimeoutMs())");
    expect(bootstrap).toContain("Math.max(10000, this._homeiiEngineTimeoutMs())");
  });
});
