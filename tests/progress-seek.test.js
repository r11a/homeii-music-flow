// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { bindProgressSeek } from "../src/core/media/progress-seek.js";

const { document, MouseEvent } = globalThis;
function fixture() {
  const el = document.createElement("div");
  el.getBoundingClientRect = () => ({ left: 10, width: 200 });
  const card = { _getCurrentDuration: () => 100, _applyProgressUi: vi.fn(), _seekFromProgress: vi.fn() };
  bindProgressSeek(card, el);
  const emit = (name, x) => el.dispatchEvent(new MouseEvent(name, { clientX: x, bubbles: true, cancelable: true }));
  return { card, el, emit };
}
describe("timeline interaction", () => {
  it("previews a drag and sends exactly one command on release", () => {
    const { card, el, emit } = fixture();
    bindProgressSeek(card, el);
    emit("pointerdown", 20); emit("pointermove", 150);
    expect(card._seekFromProgress).not.toHaveBeenCalled();
    expect(card._applyProgressUi).toHaveBeenLastCalledWith(70,100);
    emit("pointerup", 170); emit("click",170);
    expect(card._seekFromProgress).toHaveBeenCalledOnce();
    expect(card._seekFromProgress.mock.calls[0][0].clientX).toBe(170);
    expect(card._progressSeekDragging).toBe(false);
  });
  it("does not send a command after cancellation or on live radio", () => {
    const { card, el, emit } = fixture();
    emit("pointerdown", 50); emit("pointercancel", 80); emit("click",80);
    expect(card._seekFromProgress).not.toHaveBeenCalled();
    el.setAttribute("aria-disabled","true"); emit("pointerdown",50); emit("pointerup",80);
    expect(card._seekFromProgress).not.toHaveBeenCalled();
  });
});
