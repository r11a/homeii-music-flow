const DEFAULT_NIGHT_MODE = "auto";
const DEFAULT_NIGHT_START = "22:00";
const DEFAULT_NIGHT_END = "06:00";
const DEFAULT_NIGHT_DAYS = Object.freeze([0, 1, 2, 3, 4, 5, 6]);
const DEFAULT_SLEEP_TIMER_STEPS = Object.freeze([15, 30, 45, 60, 0]);

export function normalizeNightMode(value) {
  const mode = String(value || DEFAULT_NIGHT_MODE).toLowerCase();
  return ["off", "auto", "on"].includes(mode) ? mode : DEFAULT_NIGHT_MODE;
}

export function normalizeClockTime(value, fallback = DEFAULT_NIGHT_START) {
  const match = String(value || "").trim().match(/^(\d{1,2})(?::(\d{1,2}))?$/);
  if (!match) return fallback;
  const hours = Math.max(0, Math.min(23, Number(match[1]) || 0));
  const minutes = Math.max(0, Math.min(59, Number(match[2] ?? 0) || 0));
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function clockMinutesOfDay(value, fallback = DEFAULT_NIGHT_START) {
  const normalized = normalizeClockTime(value, fallback);
  const [hours, minutes] = normalized.split(":").map((part) => Number(part) || 0);
  return (hours * 60) + minutes;
}

export function defaultNightModeDays() {
  return [...DEFAULT_NIGHT_DAYS];
}

export function normalizeNightModeDays(value, fallbackDays = DEFAULT_NIGHT_DAYS) {
  let source = value;
  if (typeof source === "string") {
    const raw = source.trim();
    if (!raw) return [...fallbackDays];
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) source = parsed;
    } catch (_) {
      source = raw.split(/[,\s]+/);
    }
  }
  const normalized = Array.isArray(source)
    ? source
        .map((entry) => Number(entry))
        .filter((entry) => Number.isInteger(entry) && entry >= 0 && entry <= 6)
    : [];
  const unique = Array.from(new Set(normalized)).sort((a, b) => a - b);
  return unique.length ? unique : [...fallbackDays];
}

export function resolveNightModeWindow(start, end, defaults = {}) {
  const fallbackStart = defaults.start || DEFAULT_NIGHT_START;
  const fallbackEnd = defaults.end || DEFAULT_NIGHT_END;
  return {
    start: normalizeClockTime(start || fallbackStart, fallbackStart),
    end: normalizeClockTime(end || fallbackEnd, fallbackEnd),
  };
}

export function isMinutesInsideWindow(minutes, startMinutes, endMinutes) {
  if (startMinutes === endMinutes) return true;
  if (startMinutes < endMinutes) {
    return minutes >= startMinutes && minutes < endMinutes;
  }
  return minutes >= startMinutes || minutes < endMinutes;
}

export function isNightModeActive({
  mode = DEFAULT_NIGHT_MODE,
  start = DEFAULT_NIGHT_START,
  end = DEFAULT_NIGHT_END,
  days = DEFAULT_NIGHT_DAYS,
  date = new Date(),
} = {}) {
  const normalizedMode = normalizeNightMode(mode);
  if (normalizedMode === "off") return false;
  if (normalizedMode === "on") return true;
  const nowMinutes = (date.getHours() * 60) + date.getMinutes();
  const startMinutes = clockMinutesOfDay(start, DEFAULT_NIGHT_START);
  const endMinutes = clockMinutesOfDay(end, DEFAULT_NIGHT_END);
  if (!isMinutesInsideWindow(nowMinutes, startMinutes, endMinutes)) return false;
  const enabledDays = new Set(normalizeNightModeDays(days));
  const currentDay = Number(date.getDay());
  if (startMinutes === endMinutes || startMinutes < endMinutes) {
    return enabledDays.has(currentDay);
  }
  const windowOwnerDay = nowMinutes >= startMinutes ? currentDay : ((currentDay + 6) % 7);
  return enabledDays.has(windowOwnerDay);
}

export function sleepTimerRemainingMs(targetAt, now = Date.now()) {
  const target = Number(targetAt || 0);
  if (!target || target <= now) return 0;
  return target - now;
}

export function sleepTimerRemainingLabel(remainingMs) {
  const remaining = Number(remainingMs || 0);
  if (!remaining) return "";
  const totalMinutes = Math.max(1, Math.ceil(remaining / 60000));
  if (totalMinutes < 60) return `${totalMinutes}m`;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes ? `${hours}h ${minutes}m` : `${hours}h`;
}

export function sleepTimerFooterLabel(remainingMs) {
  const remaining = Number(remainingMs || 0);
  if (!remaining) return "";
  const totalSeconds = Math.max(0, Math.ceil(remaining / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
    : `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function normalizeSleepTimerOrigin(source = "") {
  return String(source || "").toLowerCase() === "night" ? "night" : "";
}

export function sleepTimerStartedFromNightMode(remainingMs, origin = "") {
  return Number(remainingMs || 0) > 0 && normalizeSleepTimerOrigin(origin) === "night";
}

export function sleepTimerChipVisible(remainingMs, origin = "") {
  return sleepTimerStartedFromNightMode(remainingMs, origin);
}

export function createSleepTimerTargetAt(minutes, now = Date.now()) {
  const amount = Math.max(1, Number(minutes) || 0);
  return Number(now || 0) + (amount * 60000);
}

export function extendSleepTimerTargetAt(existingTargetAt, minutes, now = Date.now()) {
  const amount = Math.max(1, Number(minutes) || 0);
  const base = sleepTimerRemainingMs(existingTargetAt, now) ? Number(existingTargetAt || 0) : Number(now || 0);
  return Math.max(base, Number(now || 0)) + (amount * 60000);
}

export function nextSleepTimerStep(currentRemainingMs, steps = DEFAULT_SLEEP_TIMER_STEPS) {
  const remaining = Number(currentRemainingMs || 0);
  if (!remaining) return Number(steps[0] || 15);
  const currentMinutes = Math.max(1, Math.ceil(remaining / 60000));
  return steps.find((value) => value > currentMinutes) ?? 0;
}
