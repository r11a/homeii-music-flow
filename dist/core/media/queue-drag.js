// Drag only from the handle; normal queue scrolling and row actions stay native.
export function bindQueueDrag(card, body) {
  if (!body || body.dataset.queueDragBound) return;
  body.dataset.queueDragBound = "1";
  let drag;
  const clear = () => {
    body.querySelectorAll(".queue-drop-target,.queue-dragging").forEach(el => el.classList.remove("queue-drop-target", "queue-dragging"));
    drag = null;
    card._queueDragActive = false;
  };
  body.addEventListener("pointerdown", event => {
    const handle = event.target.closest?.("[data-queue-drag]");
    if (!handle || event.button > 0 || event.isPrimary === false || card._queueDragPending) return;
    const row = handle.closest(".queue-row");
    drag = { row, id: event.pointerId, y: event.clientY, player: card._state.selectedPlayer, queue: card._state.maQueueState?.queue_id };
    card._queueDragActive = true;
    event.preventDefault(); event.stopPropagation();
    try { handle.setPointerCapture(event.pointerId); } catch {}
  });
  body.addEventListener("pointermove", event => {
    if (!drag || drag.id !== event.pointerId || Math.abs(event.clientY - drag.y) < 6) return;
    event.preventDefault(); drag.row.classList.add("queue-dragging");
    const target = [...body.querySelectorAll(".queue-row")].find(row => {
      const rect = row.getBoundingClientRect();
      return event.clientY >= rect.top && event.clientY <= rect.bottom && event.clientX >= rect.left && event.clientX <= rect.right;
    });
    body.querySelectorAll(".queue-drop-target").forEach(row => row.classList.remove("queue-drop-target"));
    drag.target = target;
    if (target && target !== drag.row) target.classList.add("queue-drop-target");
  });
  body.addEventListener("pointerup", async event => {
    if (!drag || drag.id !== event.pointerId) return;
    const current = drag; clear();
    if (!current.target || current.target === current.row || !current.row.isConnected || !current.target.isConnected || current.player !== card._state.selectedPlayer || current.queue !== card._state.maQueueState?.queue_id) return;
    card._queueDragPending = true;
    try { await card._handleQueueAction("move_to", current.row.dataset.queueItemId, current.row.dataset.uri || "", current.row.dataset.sortIndex || "", Number(current.target.dataset.queuePosition)); }
    catch (error) { card._toastError(card._mediaControlFailureMessage(error)); }
    finally { card._queueDragPending = false; }
  });
  body.addEventListener("pointercancel", clear);
  body.addEventListener("lostpointercapture", clear);
  body.addEventListener("click", event => { if (event.target.closest?.("[data-queue-drag]")) { event.preventDefault(); event.stopImmediatePropagation(); } }, true);
}
