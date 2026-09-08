// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { normalizeWaveform, waveformPath, syncWaveform } from "../src/core/media/waveform.js";
const { document } = globalThis;

describe("MA waveform", () => {
  it("uses only valid finite analysis bins", () => {
    expect(normalizeWaveform(null)).toBeNull();
    expect(normalizeWaveform([1, NaN])).toBeNull();
    expect(normalizeWaveform(["1", 0])).toBeNull();
    expect(normalizeWaveform([-1, .3, 2])).toEqual([0, .3, 1]);
  });
  it("adapts density to width and preserves peaks", () => {
    const bins = Array(1800).fill(0); bins[0] = 1;
    expect((waveformPath(bins, 300).match(/M/g) || []).length).toBe(60);
    expect((waveformPath(bins, 700).match(/M/g) || []).length).toBe(140);
    expect(waveformPath(bins, 300)).toContain("3.00V41.00");
  });
  it("deduplicates reads and ignores a stale result after a track change", async () => {
    const progress = document.createElement("div");
    let uri = "spotify://track/one", finish;
    const card = { _config:{}, _getCurrentMediaUri:()=>uri, _getCurrentDuration:()=>100, $:()=>progress,
      _callEngineMaCommand:vi.fn(()=>new Promise(r=>{finish=r;})) };
    syncWaveform(card,progress,25);syncWaveform(card,progress,25);
    await Promise.resolve();
    expect(card._callEngineMaCommand).toHaveBeenCalledOnce();
    expect(card._callEngineMaCommand).toHaveBeenCalledWith("audio_analysis/wave_form",{item_id:"one",provider_instance_id_or_domain:"spotify"});
    uri="spotify://track/two";finish([.1,.5]);
    await Promise.all(card._waveformPending.values());
    expect(progress.querySelector("svg")).toBeNull();
  });
  it("falls back quietly and caches an unavailable analysis", async () => {
    const progress=document.createElement("div");
    const card={_config:{},_getCurrentMediaUri:()=>"spotify://track/one",_getCurrentDuration:()=>100,$:()=>progress,_callEngineMaCommand:vi.fn(async()=>null)};
    syncWaveform(card,progress,25);await Promise.all(card._waveformPending.values());
    syncWaveform(card,progress,30);
    expect(card._callEngineMaCommand).toHaveBeenCalledOnce();
    expect(progress.classList.contains("has-waveform")).toBe(false);
  });
  it("renders the played fraction without refetching analysis", async () => {
    const progress=document.createElement("div");
    const card={_config:{},_getCurrentMediaUri:()=>"spotify://track/one",_getCurrentDuration:()=>100,$:()=>progress,_callEngineMaCommand:vi.fn(async()=>[.1,.7,.3])};
    syncWaveform(card,progress,25);await Promise.all(card._waveformPending.values());
    syncWaveform(card,progress,50);
    expect(progress.querySelector(".waveform-played").style.clipPath).toBe("inset(0 50% 0 0)");
    expect(card._callEngineMaCommand).toHaveBeenCalledOnce();
  });
});
