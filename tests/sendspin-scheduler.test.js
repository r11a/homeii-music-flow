import { describe, it, expect, vi } from "vitest";
import { AudioScheduler } from "../src/sendspin-js/audio/scheduler.js";
import { SendspinPlayer } from "../src/sendspin-js/index.js";
describe("local playback scheduling", () => {
 it.each([true, false])("only recovers active playback (playing=%s)", async (isPlaying) => {
   const player = { isPlaying, scheduler: { resumeAudioContext: vi.fn(async () => {}) } };
   await SendspinPlayer.prototype.resumePlayback.call(player);
   expect(player.scheduler.resumeAudioContext).toHaveBeenCalledTimes(isPlaying ? 1 : 0);
 });
 it("batches incoming audio without depending on throttled background timers", async () => {
   const card={cancelScheduledRefill:vi.fn(),queueProcessScheduled:false,processAudioQueue:vi.fn()};
   AudioScheduler.prototype.scheduleQueueProcessing.call(card);
   AudioScheduler.prototype.scheduleQueueProcessing.call(card);
   expect(card.processAudioQueue).not.toHaveBeenCalled();
   await Promise.resolve();
   expect(card.processAudioQueue).toHaveBeenCalledOnce();
   expect(card.queueProcessScheduled).toBe(false);
 });
 it("resumes an interrupted audio route", async () => {
   const card={audioContext:{state:"interrupted",resume:vi.fn(async()=>{})},audioBufferQueue:[{}],scheduleQueueProcessing:vi.fn(),usesRecorrectionMonitor:false};
   await AudioScheduler.prototype.resumeAudioContext.call(card);
   expect(card.audioContext.resume).toHaveBeenCalledOnce();
   expect(card.scheduleQueueProcessing).toHaveBeenCalledOnce();
 });
});
