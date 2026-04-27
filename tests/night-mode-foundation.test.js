import { describe, expect, it } from "vitest";

import {
  clockMinutesOfDay,
  createSleepTimerTargetAt,
  defaultNightModeDays,
  extendSleepTimerTargetAt,
  isMinutesInsideWindow,
  isNightModeActive,
  nextSleepTimerStep,
  normalizeClockTime,
  normalizeNightMode,
  normalizeNightModeDays,
  normalizeSleepTimerOrigin,
  resolveNightModeWindow,
  sleepTimerChipVisible,
  sleepTimerFooterLabel,
  sleepTimerRemainingLabel,
  sleepTimerRemainingMs,
  sleepTimerStartedFromNightMode,
} from "../src/core/state/night-mode.js";

describe("night mode foundation", () => {
  it("normalizes night mode values and clock times", () => {
    expect(normalizeNightMode("ON")).toBe("on");
    expect(normalizeNightMode("wild")).toBe("auto");
    expect(normalizeClockTime("7:5", "22:00")).toBe("07:05");
    expect(normalizeClockTime("bad", "22:00")).toBe("22:00");
    expect(clockMinutesOfDay("01:30")).toBe(90);
  });

  it("normalizes night mode days and windows", () => {
    expect(defaultNightModeDays()).toEqual([0, 1, 2, 3, 4, 5, 6]);
    expect(normalizeNightModeDays("[1,3,5]")).toEqual([1, 3, 5]);
    expect(normalizeNightModeDays("1, 1, 7, 3")).toEqual([1, 3]);
    expect(resolveNightModeWindow("23:15", "05:45")).toEqual({
      start: "23:15",
      end: "05:45",
    });
    expect(isMinutesInsideWindow(30, 1380, 360)).toBe(true);
    expect(isMinutesInsideWindow(900, 1380, 360)).toBe(false);
  });

  it("detects active night mode for regular and overnight windows", () => {
    expect(isNightModeActive({
      mode: "off",
      date: new Date("2026-04-26T23:00:00"),
    })).toBe(false);

    expect(isNightModeActive({
      mode: "on",
      date: new Date("2026-04-26T11:00:00"),
    })).toBe(true);

    expect(isNightModeActive({
      mode: "auto",
      start: "22:00",
      end: "06:00",
      days: [0],
      date: new Date("2026-04-26T23:30:00"),
    })).toBe(true);

    expect(isNightModeActive({
      mode: "auto",
      start: "22:00",
      end: "06:00",
      days: [0],
      date: new Date("2026-04-27T02:00:00"),
    })).toBe(true);

    expect(isNightModeActive({
      mode: "auto",
      start: "09:00",
      end: "17:00",
      days: [1],
      date: new Date("2026-04-27T18:00:00"),
    })).toBe(false);
  });

  it("formats and tracks sleep timer state consistently", () => {
    expect(sleepTimerRemainingMs(5000, 4000)).toBe(1000);
    expect(sleepTimerRemainingMs(4000, 5000)).toBe(0);
    expect(sleepTimerRemainingLabel(15 * 60000)).toBe("15m");
    expect(sleepTimerRemainingLabel(90 * 60000)).toBe("1h 30m");
    expect(sleepTimerFooterLabel((2 * 3600 + 5 * 60 + 9) * 1000)).toBe("2:05:09");
    expect(sleepTimerFooterLabel((5 * 60 + 9) * 1000)).toBe("5:09");
    expect(normalizeSleepTimerOrigin("NIGHT")).toBe("night");
    expect(sleepTimerStartedFromNightMode(60000, "night")).toBe(true);
    expect(sleepTimerChipVisible(60000, "night")).toBe(true);
    expect(sleepTimerChipVisible(0, "night")).toBe(false);
  });

  it("computes sleep timer targets and cycle steps", () => {
    expect(createSleepTimerTargetAt(15, 1000)).toBe(901000);
    expect(extendSleepTimerTargetAt(0, 15, 1000)).toBe(901000);
    expect(extendSleepTimerTargetAt(901000, 30, 1000)).toBe(2701000);
    expect(nextSleepTimerStep(0)).toBe(15);
    expect(nextSleepTimerStep(16 * 60000)).toBe(30);
    expect(nextSleepTimerStep(61 * 60000)).toBe(0);
  });
});
