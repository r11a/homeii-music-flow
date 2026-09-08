import { actionIconSvg, actionLabelsEnabled, actionSymbolHtml } from "./action-menu.js";
import { syncWaveform } from "./waveform.js";
import { isPlayerAvailable } from "../state/players.js";

export const immersivePlayerEnabled = (card) => (card._state?.mobilePlayerDesign ?? card._config?.player_design ?? "immersive") === "immersive";

export function reconcileImmersiveCovers(host, html) {
  const template = document.createElement("template");
  template.innerHTML = html;
  const container = host.querySelector(".art-stack-container");
  const nextContainer = template.content.querySelector(".art-stack-container");
  if (!container || !nextContainer) { host.innerHTML = html; return; }
  const key = (slide) => slide.dataset.queueItemId || `${slide.dataset.uri || ""}:${slide.dataset.sortIndex || ""}`;
  const previous = new Map([...container.children].map((slide) => [key(slide), slide]));
  const slides = [...nextContainer.children].map((next) => {
    const existing = previous.get(key(next));
    if (!existing?.querySelector("img") || !next.dataset.uri) return next;
    previous.delete(key(next));
    existing.className = next.className;
    Object.assign(existing.dataset, next.dataset);
    existing.querySelector(".art-stack-card").className = next.querySelector(".art-stack-card").className;
    return existing;
  });
  container.replaceChildren(...slides);
}

export function commitImmersiveSwipe(card, direction, applyChange) {
  if (card._immersiveSwipePending) return;
  const art = card.$("npArt");
  if (!art) return applyChange?.();
  card._immersiveSwipePending = true;
  card._state.mobileArtJustSwipedAt = Date.now();
  art.setAttribute("aria-busy", "true");
  art.classList.remove("dragging");
  const width = (art.clientWidth || 280) + 12;
  card._setArtDragOffset(direction === "next" ? -width : width);
  // Settle the outgoing cover before changing its identity; never slide the new cover out.
  return new Promise((resolve) => setTimeout(resolve, 160)).then(() => {
    art.classList.add("resetting");
    card._immersiveSwipeApplying = true;
    return applyChange?.();
  }).catch((error) => card._toastError(card._mediaControlFailureMessage(error))).finally(() => {
    card._immersiveSwipePending = false;
    card._immersiveSwipeApplying = false;
    art.classList.add("resetting");
    card._clearArtDragOffset();
    art.removeAttribute("aria-busy");
    card.$("mobileArtShell")?.classList.remove("dragging");
    requestAnimationFrame(() => art.classList.remove("resetting"));
  });
}

function immersivePlayerChoice(card) {
  return `<button type="button" class="immersive-player-choice" id="activePlayerChip" aria-label="${card._esc(card._m("Choose player", "בחירת נגן"))}">
      ${actionIconSvg(card, "speaker")}
      <span class="immersive-player-copy"><span id="selectedPlayerTitle">${card._esc(card._i18n("ui.selected_player"))}</span><span id="selectedPlayerTags"></span></span>
      <span id="selectedPlayerThumb" hidden></span>
    </button>`;
}

export function immersivePlayerStage(card, bottomHtml, edgeHtml = "") {
  return `<div class="immersive-layout">
    <div class="immersive-art"><div class="mobile-art-shell" id="mobileArtShell"><div class="art-source-badges" data-art-source-badges hidden></div><div class="art-stack-view" id="npArt">${card._mobileArtworkStackHtml()}</div></div></div>
    <div class="immersive-metadata"><div id="npTitle" dir="auto">${card._esc(card._i18n("ui.nothing_playing"))}</div><div id="npSub" dir="auto">—</div></div>
    <div class="immersive-controls">${bottomHtml}</div>
    ${immersivePlayerDock(card, edgeHtml)}
  </div>`;
}

export function syncImmersivePlayer(card) {
  card.$("immersiveActionFan")?._refreshAvailableActions?.();
  const progress = card.$("progressBar");
  if (!card.$("immersiveActionsToggle") || !progress) return;
  const duration = Math.max(0, Number(card._getCurrentDuration()) || 0);
  const type = card._state.maQueueState?.current_item?.media_item?.media_type || card._getSelectedPlayer()?.attributes?.media_content_type;
  progress.setAttribute("aria-disabled", String(!duration));
  progress.tabIndex = duration ? 0 : -1;
  progress.setAttribute("aria-valuemax", String(duration));
  const position = Math.round(duration * (parseFloat(card.$("progressFill")?.style.width) || 0) / 100);
  progress.setAttribute("aria-valuenow", String(position));
  progress.setAttribute("aria-valuetext", card._fmtDur(position));
  syncWaveform(card, progress, parseFloat(card.$("progressFill")?.style.width) || 0);
  progress.closest(".progress-line")?.classList.toggle("immersive-live", type === "radio" && !duration);
  progress.closest(".progress-line")?.classList.toggle("immersive-no-duration", !duration);
  const live = card.$("immersiveLiveStatus");
  if (live) live.hidden = type !== "radio" || duration > 0;
}

export function immersiveActionPages(card) {
  const player = card._getSelectedPlayer();
  const available = isPlayerAvailable(player);
  const current = card._state.maQueueState?.current_item?.media_item || {};
  const type = current.media_type || player?.attributes?.media_content_type;
  const uri = card._getCurrentMediaUri?.();
  const queue = available && (Number(card._state.maQueueState?.items || 0) > 0 || !!uri);
  const hotel = card._isHotelMode?.();
  const item = (id, icon, en, he) => ({ id, icon, label: card._m(en, he) });
  const primary = [
    queue && item("queue", "queue", "Queue", "תור"),
    available && type === "track" && item("lyrics", "lyrics", "Lyrics", "מילים"),
    available && uri && !hotel && item("like", card._currentMediaFavoriteState?.() ? "heart_filled" : "heart_outline", card._currentMediaFavoriteState?.() ? "Unlike" : "Like", card._currentMediaFavoriteState?.() ? "הסר לייק" : "אהבתי"),
    item("players", "speaker_group", "Players", "נגנים"),
    available && !hotel && item("timer", "timer", "Timer", "טיימר"),
  ].filter(Boolean);
  const secondary = [
    queue && !hotel && item("transfer", "queue_transfer", "Transfer", "העבר תור"),
    available && !hotel && item("group", "speaker_group", "Group", "קבוצת נגנים"),
    !hotel && card._state.engineCapabilities?.queue_settings && item("preferences", "settings", "Playback", "העדפות ניגון"),
    !hotel && card._discoveryModeEnabled?.() && item("discovery", "compass", "Discover", "גלה מוזיקה"),
    !hotel && item("history", "history", "Recent", "אחרונים"),
    !hotel && item("announcements", "announcement", "Announce", "כריזה"),
  ].filter(Boolean);
  const playback = [...(!hotel ? [item("this_device", "this_device", "This device", "מכשיר זה")] : []), ...(!hotel && card._state.engineCapabilities?.ai_radio_dj ? [item("ai_radio", "radio", "AI Radio", "רדיו AI")] : []), ...(queue ? [item("shuffle", "shuffle", "Shuffle", "ערבוב"), item("repeat", "repeat", "Repeat", "חזרה")] : []), ...(!hotel ? [item("settings", "settings", "Settings", "הגדרות")] : [])];
  return [primary, secondary, playback].filter((page) => page.length);
}

export function immersivePlayerDock(card, edgeHtml = "") {
  const label = (en, he) => card._esc(card._m(en, he));
  return `<div class="immersive-dock">
    <div class="immersive-fan" id="immersiveActionFan" role="group" aria-label="${label("Quick actions", "פעולות מהירות")}" hidden>
      <div class="immersive-fan-actions"></div>
      <div class="immersive-fan-navigation">
        <button type="button" data-fan-step="-1" aria-label="${label("Previous actions", "פעולות קודמות")}">‹</button>
        <span class="immersive-page-status" aria-live="polite"></span>
        <button type="button" data-immersive-action="more">${label("All actions", "כל הפעולות")}</button>
        <button type="button" data-fan-step="1" aria-label="${label("More actions", "פעולות נוספות")}">›</button>
      </div>
    </div>
    <button type="button" data-mainbar-action="library" aria-label="${label("Library", "ספרייה")}" title="${label("Library", "ספרייה")}">${actionIconSvg(card, "queue")}</button>
    <button type="button" id="immersiveActionsToggle" aria-expanded="false" aria-controls="immersiveActionFan" aria-label="${label("Actions", "פעולות")}" title="${label("Actions", "פעולות")}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20 2.5 10.5a13.4 13.4 0 0 1 19 0L12 20Z"/><path d="m12 20-5-12.5M12 20V6.6M12 20l5-12.5"/></svg></button>
    ${immersivePlayerChoice(card)}
    ${edgeHtml}
  </div>`;
}

// Presentation only: all actions use the same card commands as the classic player.
export function bindImmersivePlayer(card, options = {}) {
  const toggle = options.toggle || card.$("immersiveActionsToggle");
  const fan = options.fan || card.$("immersiveActionFan");
  if (!toggle || !fan) return;
  if (!options.fan) card.shadowRoot.querySelector(".card")?.classList.add("player-design-immersive");
  const getPages = () => options.pages ? options.pages() : immersiveActionPages(card);
  const progress = options.fan ? null : card.$("progressBar");
  if (progress) {
    progress.setAttribute("role", "slider");
    progress.setAttribute("aria-label", card._m("Song position", "מיקום בשיר"));
    progress.setAttribute("aria-valuemin", "0");
    const preview = document.createElement("output");
    preview.className = "immersive-seek-preview";
    preview.hidden = true;
    progress.append(preview);
    const live = document.createElement("span");
    live.id = "immersiveLiveStatus"; live.textContent = "LIVE"; live.hidden = true;
    progress.parentElement.append(live);
    const showPreview = (event) => {
      const duration = card._getCurrentDuration();
      if (!duration) { preview.hidden = true; return; }
      const rect = progress.getBoundingClientRect();
      if (!rect.width) return;
      const fraction = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
      preview.textContent = card._fmtDur(Math.round(duration * fraction));
      preview.style.left = `${Math.max(8, Math.min(92, fraction * 100))}%`;
      preview.hidden = false;
    };
    progress.addEventListener("pointermove", showPreview);
    progress.addEventListener("pointerdown", (event) => { progress.classList.add("immersive-seeking"); showPreview(event); });
    for (const name of ["pointerleave", "pointerup", "pointercancel"]) progress.addEventListener(name, () => { preview.hidden = true; progress.classList.remove("immersive-seeking"); });
    progress.addEventListener("keydown", (event) => {
      const delta = { ArrowLeft: -5, ArrowRight: 5, Home: -Infinity, End: Infinity }[event.key];
      const duration = card._getCurrentDuration();
      if (delta === undefined || !duration) return;
      event.preventDefault(); event.stopPropagation();
      const current = duration * (parseFloat(card.$("progressFill")?.style.width) || 0) / 100;
      const target = Math.max(0, Math.min(duration, current + delta));
      const rect = progress.getBoundingClientRect();
      card._seekFromProgress({ currentTarget: progress, clientX: rect.left + rect.width * target / duration }, { immediate: true });
    });
    syncImmersivePlayer(card);
  }
  let pages = [];
  let page = 0;
  let suppressClickUntil = 0;
  let wheelPosition = 2;
  let pointerStart;
  const positionWheel = (position) => {
    const buttons = [...fan.querySelectorAll(".immersive-fan-actions button")];
    const count = buttons.length;
    buttons.forEach((button, index) => {
      const distance = ((index - position + count * 100 + count / 2) % count) - count / 2;
      const angle = distance * Math.PI / 5;
      const visible = Math.abs(distance) < 2.65;
      button.style.setProperty("--fan-x", `${50 + 43 * Math.sin(angle)}%`);
      button.style.setProperty("--fan-y", `${112 - 100 * Math.cos(angle)}px`);
      button.style.opacity = visible ? String(Math.min(1, (2.65 - Math.abs(distance)) * 3)) : "0";
      button.style.visibility = visible ? "visible" : "hidden";
      button.tabIndex = visible ? 0 : -1;
    });
  };
  const rotateWheel = (delta) => {
    const before = Math.round(wheelPosition);
    wheelPosition += delta;
    positionWheel(wheelPosition);
    if (Math.round(wheelPosition) !== before) { try { globalThis.navigator?.vibrate?.(8); } catch {} }
    fan.querySelector(".immersive-page-status").textContent = `${((Math.round(wheelPosition) % pages.flat().length) + pages.flat().length) % pages.flat().length + 1} / ${pages.flat().length}`;
  };
  const renderPage = (focus = false) => {
    fan.style.setProperty("--fan-count", String((pages[page] || []).length));
    fan.querySelector(".immersive-fan-actions").innerHTML = pages.flat().map((item) => `<button type="button" data-immersive-action="${card._esc(item.id)}" aria-label="${card._esc(item.label)}" title="${card._esc(item.label)}">${actionSymbolHtml(card,item)}${!item.genre && actionLabelsEnabled(card) ? `<span>${card._esc(item.label)}</span>` : ""}</button>`).join("");
    wheelPosition = pages.slice(0, page).flat().length + Math.min(2, Math.floor(pages[page].length / 2));
    positionWheel(wheelPosition);
    fan.querySelector(".immersive-page-status").textContent = `${Math.round(wheelPosition) + 1} / ${pages.flat().length}`;
    fan.querySelectorAll("[data-fan-step]").forEach((button) => { button.disabled = pages.flat().length < 2; });
    if (focus) fan.querySelector(".immersive-fan-actions button")?.focus({ preventScroll: true });
  };
  const step = (direction, focus = false) => {
    rotateWheel(direction);
    if (focus) {
      const buttons = [...fan.querySelectorAll(".immersive-fan-actions button")];
      const index = ((Math.round(wheelPosition) % buttons.length) + buttons.length) % buttons.length;
      buttons[index]?.focus({ preventScroll:true });
    }
  };
  const close = (restoreFocus = false) => {
    fan.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
    if (restoreFocus) toggle.focus({ preventScroll: true });
  };
  fan._refreshAvailableActions = () => {
    if (fan.hidden || pointerStart) return;
    const next = getPages();
    const signature = entries => JSON.stringify(entries.flat().map(({id,label,icon,image,selected,value}) => [id,label,icon,image,selected,value]));
    if (signature(next) === signature(pages)) return;
    const previous = pages.flat();
    const anchor = previous[((Math.round(wheelPosition) % previous.length) + previous.length) % previous.length]?.id;
    const focused = fan.querySelector(".immersive-fan-actions button:focus")?.dataset.immersiveAction;
    pages = next; page = 0;
    if (!pages.flat().length) { close(); return; }
    renderPage();
    const index = pages.flat().findIndex(item => item.id === anchor);
    if (index >= 0) { wheelPosition = index; rotateWheel(0); }
    if (focused) {
      const target = [...fan.querySelectorAll(".immersive-fan-actions button")].find(button => button.dataset.immersiveAction === focused);
      (target || toggle).focus({preventScroll:true});
    }
  };
  toggle.addEventListener("click", (event) => {
    fan.hidden = !fan.hidden;
    toggle.setAttribute("aria-expanded", String(!fan.hidden));
    if (!fan.hidden) { pages = getPages(); page = 0; renderPage(event.detail === 0); }
  });
  (options.fan ? fan.parentElement : card.shadowRoot.querySelector(".card"))?.addEventListener("click", (event) => {
    if (!event.target.closest(".immersive-dock")) close();
  });
  fan.parentElement?.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !fan.hidden) { event.stopPropagation(); close(true); }
    if (!fan.hidden && ["ArrowLeft", "ArrowRight"].includes(event.key)) {
      event.preventDefault(); event.stopPropagation();
      step((event.key === "ArrowRight" ? 1 : -1) * (card._isHebrew?.() ? -1 : 1), true);
    }
  });
  fan.addEventListener("wheel", (event) => {
    if (fan.hidden || event.ctrlKey) return;
    event.preventDefault(); event.stopPropagation();
    const delta = (Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY) * (event.deltaMode === 1 ? 16 : 1);
    rotateWheel(delta / 90);
    suppressClickUntil = Date.now() + 300;
  }, { passive: false });
  const resetWheel = () => {
    pointerStart = null; fan.classList.remove("rotating");
    wheelPosition = Math.round(wheelPosition); positionWheel(wheelPosition);
    fan._refreshAvailableActions();
  };
  fan.addEventListener("pointerdown", (event) => {
    if (event.isPrimary === false || event.button > 0 || event.target.closest(".immersive-fan-navigation")) return;
    pointerStart = { x: event.clientX, lastX: event.clientX, id: event.pointerId, moved: false };
  });
  const moveWheel = (event) => {
    if (!pointerStart || pointerStart.id !== event.pointerId) return;
    if (!pointerStart.moved && Math.abs(event.clientX - pointerStart.x) < 6) return;
    event.preventDefault(); event.stopPropagation();
    if (!pointerStart.moved) {
      try { fan.setPointerCapture(event.pointerId); } catch {}
    }
    pointerStart.moved = true; fan.classList.add("rotating");
    rotateWheel((pointerStart.lastX - event.clientX) / 65);
    pointerStart.lastX = event.clientX;
    suppressClickUntil = Date.now() + 400;
  };
  fan.addEventListener("pointermove", moveWheel);
  fan.addEventListener("pointercancel", resetWheel);
  fan.addEventListener("lostpointercapture", (event) => {
    // Touch starts with implicit capture on the button. Its loss bubbles when
    // capture moves to the fan; that transfer must not cancel the gesture.
    if (event.target === fan && pointerStart?.id === event.pointerId) resetWheel();
  });
  fan.addEventListener("pointerup", (event) => { moveWheel(event); resetWheel(); });
  fan.addEventListener("click", async (event) => {
    event.stopPropagation();
    if (Date.now() < suppressClickUntil) { event.preventDefault(); return; }
    const pager = event.target.closest("[data-fan-step]");
    if (pager && !pager.disabled) { step(Number(pager.dataset.fanStep)); return; }
    const button = event.target.closest("[data-immersive-action]");
    if (!button || button.disabled) return;
    event.stopPropagation();
    const action = button.dataset.immersiveAction;
    // Revalidate at dispatch without moving targets while the fan is open.
    if (action !== "more" && !getPages().flat().some((item) => item.id === action)) {
      button.disabled = true;
      card._toast(card._m("This action is no longer available for this player.", "הפעולה אינה זמינה כרגע לנגן הזה."));
      return;
    }
    if (options.onAction) { close(); try { await options.onAction(action); } catch (error) { card._toastError(card._mediaControlFailureMessage(error)); } return; }
    if (action === "like") {
      button.disabled = true;
      try { await card._toggleLikeCurrentMedia(button); pages = getPages(); page = Math.min(page, pages.length - 1); renderPage(true); }
      catch (error) { card._toastError(card._mediaControlFailureMessage(error)); }
      finally { button.disabled = false; }
      return;
    }
    close();
    if (action === "shuffle" || action === "repeat") {
      card.$(action === "shuffle" ? "mobileShuffleBtn" : "mobileRepeatBtn")?.click();
      return;
    }
    if (action === "this_device") { card._connectThisDevicePlayer(); return; }
    if (action === "history") { card._toggleHistoryDrawer(); return; }
    if (action === "lyrics") {
      card._openLyricsModal();
    } else card._openMobileMenu({ announcements:"announcements", ai_radio: "ai_radio", queue: "queue", players: "players", timer: "sleep_timer", more: "main", transfer: "transfer", group: "group", preferences: "queue_settings", discovery: "discovery", settings: "settings" }[action]);
  });
}
