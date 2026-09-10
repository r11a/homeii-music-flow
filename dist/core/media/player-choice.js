import { actionIconSvg } from "./action-menu.js";

// Selection stays separate from playback controls; use the existing selection handler.
export function playerChoiceHtml(card, player, { attrs, active, available, name, track, art, pinHtml }) {
  const state = card._playerStateLabel(player);
  const canGroup = card._getAvailableGroupPlayers?.().some(item => item.entity_id === player.entity_id) && !card._isHotelMode?.();
  return `<div data-group-player="${card._esc(player.entity_id)}" class="player-choice-card ${active ? "selected" : ""} ${available ? "" : "unavailable"}">
    <button type="button" class="player-choice-button" ${attrs} aria-pressed="${active}" ${available ? "" : "disabled"}>
      <span class="player-choice-symbol" ${canGroup ? 'data-group-drag-art draggable="true"' : ''} title="${card._esc(card._m("Drag onto another player to connect", "גרור לנגן אחר לחיבור"))}">${art ? card._imgHtml(art, "", { fallbackIcon: "speaker" }) : actionIconSvg(card, "speaker")}</span>
      <span class="player-choice-details">
        <span class="player-choice-name" dir="auto">${card._esc(name)}</span>
        <span class="player-choice-state"><i class="${player.state === "playing" ? "playing" : ""}" aria-hidden="true"></i>${card._esc(state)}${active ? ` · ${card._esc(card._m("Selected", "נבחר"))}` : ""}</span>
        ${available && track ? `<span class="player-choice-track" dir="auto">${card._esc(track)}</span>` : ""}
      </span>
      ${active ? '<svg class="player-choice-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>' : ""}
    </button>
    ${pinHtml}
    ${canGroup ? `<button class="player-group-drag" data-group-drag draggable="true" aria-label="${card._esc(card._m("Drag onto another player to group", "גרור לנגן אחר ליצירת קבוצה"))}">${actionIconSvg(card,"speaker_group")}</button>` : ""}
  </div>`;
}

export function bindPlayerGrouping(card, host) {
  if (host._playerGroupingBound) return;
  host._playerGroupingBound = true;
  let source = "", pointer = null, target = null, busy = false, preview = null;
  let suppressClickUntil = 0;
  let origin = null;
  const movePreview = event => {
    if (!preview) return;
    const box = host.getBoundingClientRect();
    preview.style.left = `${event.clientX - box.left + host.scrollLeft}px`;
    preview.style.top = `${event.clientY - box.top + host.scrollTop - 42}px`;
  };
  const startPreview = (row, event) => {
    preview?.remove(); preview = document.createElement("div");
    preview.className = "player-group-preview";
    preview.setAttribute("aria-hidden","true");
    const symbol = row.querySelector(".player-choice-symbol,.player-premium-art")?.cloneNode(true);
    if (symbol) preview.append(symbol);
    const name = document.createElement("span"); name.textContent = row.querySelector(".player-choice-name,.player-premium-name")?.textContent || "";
    preview.append(name); host.append(preview); movePreview(event);
  };
  const clear = () => {
    if (pointer !== null && host.hasPointerCapture?.(pointer)) host.releasePointerCapture(pointer);
    host.querySelectorAll(".group-drop-target,.group-drag-source").forEach(node => node.classList.remove("group-drop-target","group-drag-source"));
    preview?.remove(); preview = null;
    source = ""; pointer = null; target = null; origin = null;
  };
  const mark = row => {
    if (target === row) return;
    target?.classList.remove("group-drop-target");
    target = row?.dataset.groupPlayer !== source ? row : null;
    target?.classList.add("group-drop-target");
  };
  const apply = async () => {
    const from = source, to = target?.dataset.groupPlayer;
    const targetRow = target;
    clear();
    const allowed = card._getAvailableGroupPlayers().map(player => player.entity_id);
    if (busy || !to || to === from || !allowed.includes(from) || !allowed.includes(to)) return;
    if (card._currentSpeakerGroupMemberIds(from).length > 1) {
      card._toastError(card._m("Disconnect this player from its group first.", "יש לנתק תחילה את הנגן מהקבוצה שלו.")); return;
    }
    busy = true; host.setAttribute("aria-busy","true");
    targetRow?.classList.add("group-connecting");
    const status = document.createElement("div"); status.className = "player-group-status";
    status.setAttribute("role","status"); status.textContent = card._m("Connecting players…", "מחבר נגנים…");
    targetRow?.append(status);
    try {
      const members = [...new Set([...card._currentSpeakerGroupMemberIds(to),from])];
      if (card._state) card._state.pendingGroupOwnerRemoval = false;
      const ok = await card._applySpeakerGroupFor(to, members);
      if (ok) {
        targetRow?.classList.add("group-connected");
        card._toastSuccess(card._m("Players connected", "הנגנים חוברו"));
        setTimeout(() => targetRow?.classList.remove("group-connected"), 700);
        setTimeout(() => {
          if (!["players","players_active","group"].includes(card._state?.menuPage)) return;
          card._selectPlayer?.(card._currentSpeakerGroupOwnerId?.(to) || to, true);
          card._openMobileMenu?.("group");
        }, 350);
      }
    } catch(error) { card._toastError(card._mediaControlFailureMessage(error)); }
    finally { busy = false; host.removeAttribute("aria-busy"); status.remove(); targetRow?.classList.remove("group-connecting"); }
  };
  host.addEventListener("dragstart", event => {
    if (pointer !== null) { event.preventDefault(); return; }
    if (busy || !event.target.closest("[data-group-drag],[data-group-drag-art]")) return;
    const row=event.target.closest("[data-group-player]");source = row.dataset.groupPlayer;
    event.dataTransfer.setData("text/plain",source);
    startPreview(row,event);
    event.dataTransfer.setDragImage?.(preview,110,32);
    const image=preview;setTimeout(()=>{if(image)image.hidden=true;},0);
  });
  host.addEventListener("dragover", event => { if (source) { event.preventDefault(); mark(event.target.closest("[data-group-player]")); } });
  host.addEventListener("drop", event => { if (source) { event.preventDefault(); void apply(); } });
  host.addEventListener("dragend", () => {suppressClickUntil=Date.now()+400;clear();});
  host.addEventListener("pointerdown", event => {
    if (busy || pointer !== null || (event.button != null && event.button !== 0) || !event.target.closest("[data-group-drag],[data-group-drag-art]")) return;
    const row = event.target.closest("[data-group-player]"); source = row.dataset.groupPlayer;
    origin = { x:event.clientX, y:event.clientY, row };
    pointer = event.pointerId;
    host.setPointerCapture?.(pointer); event.preventDefault();
  });
  host.addEventListener("pointermove", event => {
    if (pointer !== event.pointerId) return;
    if (!preview) {
      if (Math.hypot(event.clientX-origin.x,event.clientY-origin.y) < 6) return;
      startPreview(origin.row,event);
      origin.row.classList.add("group-drag-source");
    }
    suppressClickUntil=Date.now()+400;
    movePreview(event);
    mark([...host.querySelectorAll("[data-group-player]")].find(row => { const r=row.getBoundingClientRect(); return event.clientX >= r.left && event.clientX <= r.right && event.clientY >= r.top && event.clientY <= r.bottom; }));
  });
  host.addEventListener("pointerup", event => {
    if (pointer !== event.pointerId) return;
    if (!preview) { clear(); return; }
    suppressClickUntil=Date.now()+400;
    event.preventDefault();
    void apply();
  });
  host.addEventListener("pointercancel", clear);
  host.addEventListener("click", async event => {
    if(Date.now()<suppressClickUntil){event.preventDefault();event.stopPropagation();return;}
    const quick = event.target.closest("[data-group-quick]");
    if (quick) {
      event.preventDefault(); event.stopPropagation();
      if (busy) return;
      const id=quick.dataset.groupQuick;
      const selected=card._state.selectedPlayer;
      const owner=card._currentSpeakerGroupOwnerId(selected) || selected;
      const members=card._currentSpeakerGroupMemberIds(owner);
      if (!owner || id===owner) return;
      if (!members.includes(id) && card._currentSpeakerGroupMemberIds(id).length > 1) {
        card._toastError(card._m("Disconnect this player from its group first.", "יש לנתק תחילה את הנגן מהקבוצה שלו.")); return;
      }
      busy=true; quick.disabled=true; quick.setAttribute("aria-busy","true");
      try {
        card._state.pendingGroupOwnerRemoval=false;
        await card._applySpeakerGroupFor(owner, members.includes(id) ? members.filter(member=>member!==id) : [...members,id]);
        if (["group","group_volume"].includes(card._state.menuPage)) card._renderMobileMenu();
      } catch(error) { card._toastError(card._mediaControlFailureMessage(error)); }
      finally {busy=false;quick.disabled=false;quick.removeAttribute("aria-busy");}
      return;
    }
    if (event.target.closest("[data-group-drag]")) { event.preventDefault(); event.stopPropagation(); }
  }, true);
}
