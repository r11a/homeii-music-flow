import { describe, expect, it } from "vitest";

import {
  clampHomeiiEngineTimeoutMs,
  homeiiEngineCommandType,
  homeiiEngineModeAllowsCalls,
  homeiiEngineModeRequiresEngine,
  normalizeHomeiiEngineCapabilities,
  normalizeHomeiiEngineContext,
  normalizeHomeiiEngineId,
  normalizeHomeiiEngineMode,
  summarizeHomeiiEngineCapabilities,
} from "../src/core/engine-client.js";

describe("HOMEii Flow Engine client foundation", () => {
  it("normalizes Engine modes with required defaults for HOMEii Flow 6", () => {
    expect(normalizeHomeiiEngineMode()).toBe("required");
    expect(normalizeHomeiiEngineMode("required")).toBe("required");
    expect(normalizeHomeiiEngineMode("OFF")).toBe("required");
    expect(normalizeHomeiiEngineMode("unknown")).toBe("required");
    expect(homeiiEngineModeAllowsCalls("off")).toBe(true);
    expect(homeiiEngineModeAllowsCalls("auto")).toBe(true);
    expect(homeiiEngineModeRequiresEngine("required")).toBe(true);
    expect(homeiiEngineModeRequiresEngine("auto")).toBe(true);
    expect(homeiiEngineModeRequiresEngine()).toBe(true);
  });

  it("builds stable Home Assistant WebSocket command types", () => {
    expect(homeiiEngineCommandType("get_context")).toBe("homeii_flow/get_context");
    expect(homeiiEngineCommandType("/queue/get/")).toBe("homeii_flow/queue/get");
    expect(homeiiEngineCommandType("stats get")).toBe("homeii_flow/stats_get");
  });

  it("normalizes Engine ids, timeouts, capabilities, and context", () => {
    expect(normalizeHomeiiEngineId("  kitchen-profile  ")).toBe("kitchen-profile");
    expect(clampHomeiiEngineTimeoutMs("slow", 3500)).toBe(3500);
    expect(clampHomeiiEngineTimeoutMs(50)).toBe(1000);
    expect(clampHomeiiEngineTimeoutMs(90000)).toBe(30000);
    expect(normalizeHomeiiEngineCapabilities(["queue", "stats"])).toEqual({ queue: true, stats: true });
    expect(summarizeHomeiiEngineCapabilities({ queue: true, stats: false, schedules: true })).toBe("queue, schedules");

    const context = normalizeHomeiiEngineContext({
      version: "6.0.0",
      instance_id: "main",
      profile_id: "living",
      capabilities: { queue: true },
    });

    expect(context.available).toBe(true);
    expect(context.version).toBe("6.0.0");
    expect(context.instanceId).toBe("main");
    expect(context.profileId).toBe("living");
    expect(context.capabilities).toEqual({ queue: true });
  });
});
