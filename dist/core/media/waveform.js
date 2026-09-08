import { parseMediaReference } from "../state/media-queue.js";

// MA audio_analysis/wave_form returns normalized RMS bins. Never invent missing analysis.
export function normalizeWaveform(value) {
  if (!Array.isArray(value) || value.length < 2 || value.length > 20000) return null;
  if (value.some((bin) => typeof bin !== "number" || !Number.isFinite(bin))) return null;
  return value.map((bin) => Math.max(0, Math.min(1, bin)));
}

export function waveformPath(bins, width) {
  const count = Math.max(24, Math.min(160, Math.floor(width / 5)));
  const step = 720 / count;
  return Array.from({ length: count }, (_, index) => {
    const start = Math.floor(index * bins.length / count);
    const end = Math.max(start + 1, Math.floor((index + 1) * bins.length / count));
    let peak = 0;
    for (let i = start; i < end; i++) peak = Math.max(peak, bins[i] || 0);
    const height = Math.max(1, peak * 19);
    const x = ((index + .5) * step).toFixed(2);
    return `M${x} ${(22 - height).toFixed(2)}V${(22 + height).toFixed(2)}`;
  }).join("");
}

export function syncWaveform(card, progress, percent) {
  const uri = card._getCurrentMediaUri?.() || "";
  const ref = parseMediaReference(uri);
  const key = `${card._config?.homeii_engine_instance_id || ""}:${uri}`;
  const valid = ref.media_type === "track" && ref.item_id && ref.provider && card._getCurrentDuration() > 0;
  const clear = () => { progress.classList.remove("has-waveform"); progress.querySelector(".immersive-waveform")?.remove(); delete progress.dataset.waveformRender; };
  if (!valid || !card._callEngineMaCommand) { clear(); return; }
  card._waveformCache ||= new Map();
  card._waveformPending ||= new Map();
  const cached = card._waveformCache.get(key);
  if (!cached || Date.now() - cached.ts > (cached.bins ? 3600000 : 300000)) {
    clear();
    if (!card._waveformPending.has(key) && card._waveformPending.size < 2) {
      const task = Promise.resolve().then(() => card._callEngineMaCommand("audio_analysis/wave_form", { item_id: ref.item_id, provider_instance_id_or_domain: ref.provider }))
        .then((value) => normalizeWaveform(value)).catch(() => null)
        .then((bins) => {
          card._waveformCache.set(key, { bins, ts: Date.now() });
          while (card._waveformCache.size > 24) card._waveformCache.delete(card._waveformCache.keys().next().value);
        }).finally(() => {
          card._waveformPending.delete(key);
          if (card.$("progressBar") === progress && card._getCurrentMediaUri?.() === uri) syncWaveform(card, progress, parseFloat(card.$("progressFill")?.style.width) || 0);
        });
      card._waveformPending.set(key, task);
    }
    return;
  }
  if (!cached.bins) { clear(); return; }
  const width = Math.round(progress.clientWidth || 300);
  const renderKey = `${key}:${width}:${cached.ts}`;
  if (progress.dataset.waveformRender !== renderKey) {
    clear();
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "immersive-waveform"); svg.setAttribute("viewBox", "0 0 720 44"); svg.setAttribute("preserveAspectRatio", "none"); svg.setAttribute("aria-hidden", "true");
    const d = waveformPath(cached.bins, width);
    for (const name of ["waveform-base", "waveform-played"]) {
      const path = document.createElementNS(svg.namespaceURI, "path"); path.setAttribute("class", name); path.setAttribute("d", d); svg.append(path);
    }
    progress.append(svg); progress.dataset.waveformRender = renderKey;
  }
  progress.classList.add("has-waveform");
  progress.querySelector(".waveform-played").style.clipPath = `inset(0 ${100 - Math.max(0, Math.min(100, percent))}% 0 0)`;
}
