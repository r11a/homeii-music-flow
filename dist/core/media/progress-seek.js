// Preview locally during a drag; submit only the position the listener releases.
export function bindProgressSeek(card, el) {
  if (!el || el.dataset.homeiiSeekBound === "1") return;
  el.dataset.homeiiSeekBound = "1";
  let pointer = null;
  let suppressClickUntil = 0;
  const usable = () => el.getAttribute("aria-disabled") !== "true" && card._getCurrentDuration() > 0;
  const preview = (event) => {
    const rect = el.getBoundingClientRect();
    if (!rect.width) return;
    card._progressSeekPreview = Math.round(card._getCurrentDuration() * Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)));
    card._applyProgressUi(card._progressSeekPreview, card._getCurrentDuration());
  };
  el.addEventListener("pointerdown", (event) => {
    if (!usable() || event.isPrimary === false || event.button > 0) return;
    event.preventDefault();
    pointer = event.pointerId;
    card._progressSeekDragging = true;
    try { el.setPointerCapture?.(pointer); } catch {}
    preview(event);
  });
  el.addEventListener("pointermove", (event) => {
    if (pointer === null || event.pointerId !== pointer) return;
    event.preventDefault(); preview(event);
  });
  const finish = (event, cancel) => {
    if (pointer === null || event.pointerId !== pointer) return;
    pointer = null; card._progressSeekDragging = false;
    suppressClickUntil = Date.now() + 400;
    try { el.releasePointerCapture?.(event.pointerId); } catch {}
    if (!cancel && usable()) card._seekFromProgress(event, { immediate: true });
  };
  el.addEventListener("pointerup", (event) => finish(event, false));
  el.addEventListener("pointercancel", (event) => finish(event, true));
  el.addEventListener("click", (event) => {
    if (Date.now() < suppressClickUntil || !usable()) return;
    card._seekFromProgress(event, { immediate: true });
  });
}
