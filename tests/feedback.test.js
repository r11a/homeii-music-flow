// @vitest-environment jsdom
import {afterEach, expect, it, vi} from "vitest";
import {showToast, groupFeedback} from "../src/core/media/feedback.js";
const {document} = globalThis;
afterEach(() => { vi.useRealTimers(); document.body.replaceChildren(); });

function fixture() {
  const host = document.createElement("div"); document.body.append(host);
  host.innerHTML = '<div class="card"><div id="toastWrap"></div></div>';
  return {_state: {}, shadowRoot: host, $: id => host.querySelector(`#${id}`), _m: en => en,
    _esc: text => String(text).replaceAll("<", "&lt;"), _acknowledgeCardIssue: vi.fn(), _i18n: () => "OK"};
}
it("shows an error during Studio and suppresses repeated messages", () => {
  const card = fixture(); card._state.controlRoomOpen = true;
  showToast.call(card, "Disconnected", "error"); showToast.call(card, "Disconnected", "error");
  expect(card.$("toastWrap").querySelectorAll('[role="alert"]')).toHaveLength(1);
  showToast.call(card, "Normal update", "info");
  expect(card.$("toastWrap").textContent).not.toContain("Normal update");
});
it("acknowledges an issue and removes only that notification", () => {
  const card = fixture();
  showToast.call(card, "Connection lost", "error", {issueAckKey:"connection"});
  showToast.call(card, "Another message");
  card.$("toastWrap").querySelector("button").click();
  expect(card._acknowledgeCardIssue).toHaveBeenCalledWith("connection", "Connection lost");
  expect(card.$("toastWrap").querySelectorAll(".toast")).toHaveLength(1);
});
it("shows group confirmation only after the command succeeds", async () => {
  vi.useFakeTimers(); const card = fixture(); let finish;
  const pending = groupFeedback(card, "connect", () => new Promise(resolve => {finish=resolve;}));
  const panel = card.shadowRoot.querySelector(".group-operation-feedback");
  expect(panel.textContent).toBe("Updating group…");
  expect(panel.classList.contains("is-confirmed")).toBe(false);
  finish(true); await pending;
  expect(panel.classList.contains("is-confirmed")).toBe(true);
  await vi.advanceTimersByTimeAsync(900);
  expect(panel.isConnected).toBe(false);
});
it("clears pending group feedback when the command fails", async () => {
  const card=fixture();
  await expect(groupFeedback(card,"disconnect",async()=>{throw Error("Offline");})).rejects.toThrow("Offline");
  expect(card.shadowRoot.querySelector(".group-operation-feedback")).toBeNull();
  expect(card._groupFeedbackActive).toBe(false);
});
