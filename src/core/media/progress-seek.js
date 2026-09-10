// Preview locally during a drag; submit only the position the listener releases.
export function bindProgressSeek(card, el) {
  if (!el || el.dataset.homeiiSeekBound === "1") return;
  el.dataset.homeiiSeekBound = "1";
  let pointer = null;
  let context;
  let suppressClickUntil = 0;
  const currentContext = () => JSON.stringify([
    card._state?.selectedPlayer,
    card._state?.maQueueState?.queue_id,
    card._state?.maQueueState?.current_item?.queue_item_id,
    card._getCurrentMediaUri?.(),
  ]);
  const usable = () => el.getAttribute("aria-disabled") !== "true" && card._getCurrentDuration() > 0;
  const preview = (event) => {
    const rect = el.getBoundingClientRect();
    if (!rect.width) return;
    card._progressSeekPreview = Math.round(card._getCurrentDuration() * Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)));
    card._applyProgressUi(card._progressSeekPreview, card._getCurrentDuration());
  };
  el.addEventListener("pointerdown", (event) => {
    if (pointer !== null || !usable() || event.isPrimary === false || event.button > 0) return;
    event.preventDefault();
    pointer = event.pointerId;
    context = currentContext();
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
    const canSeek = !cancel && usable() && context === currentContext();
    pointer = null; card._progressSeekDragging = false;
    delete card._progressSeekPreview;
    suppressClickUntil = Date.now() + 400;
    try { el.releasePointerCapture?.(event.pointerId); } catch {}
    if (canSeek) card._seekFromProgress(event, { immediate: true });
    else card._applyProgressUi(card._getCurrentPosition?.() || 0, card._getCurrentDuration());
  };
  el.addEventListener("pointerup", (event) => finish(event, false));
  el.addEventListener("pointercancel", (event) => finish(event, true));
  el.addEventListener("lostpointercapture", (event) => finish(event, true));
  el.addEventListener("click", (event) => {
    if (Date.now() < suppressClickUntil || !usable()) return;
    card._seekFromProgress(event, { immediate: true });
  });
}
