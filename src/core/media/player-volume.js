import { playerVolumeValue, playerCanSetVolume } from "../state/players.js";

export function playerVolumeControlsHtml(card, player, { inline = false } = {}) {
  if (!playerCanSetVolume(player)) return `<div class="player-volume-unavailable" role="status">${card._esc(card._m("Independent volume control is unavailable", "שליטה עצמאית בעוצמה אינה זמינה"))}</div>`;
  const volume = Math.round(playerVolumeValue(player) * 100);
  const muted = card._isMuted(player);
  const label = card._m("Volume", "עוצמה");
  const muteLabel = card._m(muted ? "Unmute" : "Mute", muted ? "בטל השתקה" : "השתק");
  return `<div class="player-volume-row ${inline ? "group-inline-volume" : ""}">
    <button class="player-mini-mute ${muted ? "active" : ""}" data-player-mute="${card._esc(player.entity_id)}" aria-pressed="${muted}" title="${card._esc(muteLabel)}" aria-label="${card._esc(muteLabel)}">${card._iconSvg(card._volumeIconName(player))}</button>
    <input class="player-mini-volume" data-player-volume="${card._esc(player.entity_id)}" aria-label="${card._esc(`${label}: ${player.attributes?.friendly_name || player.entity_id}`)}" type="range" min="0" max="100" value="${volume}" style="--vol-pct:${volume}%">
    <button type="button" class="player-mini-value player-volume-percent" data-player-volume-wheel="${card._esc(player.entity_id)}" aria-label="${card._esc(`${label}: ${player.attributes?.friendly_name || player.entity_id}`)}">${volume}%</button>
  </div>`;
}

export function syncGroupVolumeReadouts(card) {
  card.shadowRoot?.querySelectorAll("[data-group-volume-wheel]").forEach(button=>{
    const player=card._playerByEntityId(button.dataset.groupVolumeWheel);
    const value=card._groupAverageVolume(player);
    if(value === null)return;
    button.textContent=`${value}%`;
    const slider=button.parentElement.querySelector('[data-group-volume]');
    if(slider && card.shadowRoot.activeElement !== slider){slider.value=String(value);slider.style.setProperty('--vol-pct',`${value}%`);}
  });
}

export function closeVolumeWheel(card) {
  card.shadowRoot?.querySelector(".volume-wheel-popover")?.remove();
}

export function openVolumeWheel(card, {entityId = null, group = false} = {}) {
  const host = card.shadowRoot.querySelector(".card");
  closeVolumeWheel(card);
  const currentPlayer = () => entityId ? card._playerByEntityId(entityId) : card._getSelectedPlayer();
  const player = currentPlayer();
  if (!playerCanSetVolume(player)) return;
  const playerId = player.entity_id;
  if (group && card._groupAverageVolume(player) === null) return;
  const currentVolume = player => group ? card._groupAverageVolume(player) : Math.round(playerVolumeValue(player) * 100);
  let value = currentVolume(player), start = null;
  const angle = event => { const rect = dial.getBoundingClientRect(); return Math.atan2(event.clientY - rect.top - rect.height / 2, event.clientX - rect.left - rect.width / 2); };
  const panel = document.createElement("section"); panel.className = "volume-wheel-popover";
  panel.setAttribute("role","dialog"); panel.setAttribute("aria-label",card._m("Volume","עוצמה"));
  panel.innerHTML = `<button data-volume-close aria-label="${card._esc(card._m("Close","סגור"))}">${card._iconSvg("close")}</button><div class="volume-wheel-dial" role="slider" tabindex="0" aria-label="${card._esc(card._m("Volume","עוצמה"))}" aria-valuemin="0" aria-valuemax="100"><output></output></div><button data-volume-mute aria-label="${card._esc(card._m("Mute","השתק"))}">${card._iconSvg("volume_mute")}</button>`;
  const dial = panel.querySelector("[role=slider]");
  const muteButton = panel.querySelector("[data-volume-mute]");
  const refreshMute = () => {
    const current = currentPlayer();
    if (current?.entity_id !== playerId) { panel.remove(); return; }
    if(group && card._playerGroupMemberIds(current).length < 2){panel.remove();return;}
    const muted = group ? card._isGroupMuted(current) : card._isMuted(current);
    muteButton.innerHTML = card._iconSvg(muted ? "volume_mute" : card._volumeIconName(current));
    muteButton.setAttribute("aria-pressed", String(muted));
    muteButton.setAttribute("aria-label", card._m(muted ? "Unmute" : "Mute", muted ? "בטל השתקה" : "השתק"));
    muteButton.classList.toggle("active", muted);
    if(start === null){value=currentVolume(current);draw();}
    fit();
  };
  panel._refreshVolumeState = refreshMute;
  const draw = () => {dial.setAttribute("aria-valuenow",String(value)); dial.querySelector("output").textContent = `${value}%`; dial.style.setProperty("--dial-value",`${value}%`);};
  const fit = () => {
    const height=host.clientHeight;
    if(!height)return;
    const compact=height < 440, size=compact ? Math.max(64,Math.min(160,height-180)) : 160;
    panel.style.bottom=compact ? "8px" : "";
    dial.style.width=dial.style.height=`${size}px`;
    const output=dial.querySelector("output");output.style.width=output.style.height=`${size-20}px`;
  };
  const set = delta => {
    if (currentPlayer()?.entity_id !== playerId) {panel.remove(); return;}
    value = Math.max(0,Math.min(100,value + delta)); draw();
    if(group) card._setGroupVolumeFor(playerId,value / 100);
    else if(entityId) card._setPlayerVolumeFor(playerId,value / 100);
    else card._setVolume(value / 100);
  };
  panel.querySelector("[data-volume-close]").onclick = () => panel.remove();
  muteButton.onclick = async () => {
    if (currentPlayer()?.entity_id !== playerId) { panel.remove(); return; }
    muteButton.setAttribute("aria-busy", "true");
    try { if(group) await card._toggleGroupMuteFor(playerId); else await card._toggleMuteFor(playerId); }
    finally { muteButton.removeAttribute("aria-busy"); refreshMute(); }
  };
  dial.onwheel = event => {event.preventDefault(); set(event.deltaY > 0 ? -2 : 2);};
  dial.onkeydown = event => {if(["ArrowUp","ArrowRight","ArrowDown","ArrowLeft"].includes(event.key)){event.preventDefault(); set(["ArrowUp","ArrowRight"].includes(event.key) ? 2 : -2);}};
  dial.onpointerdown = event => {event.preventDefault(); start = angle(event); dial.setPointerCapture(event.pointerId);};
  dial.onpointermove = event => {if(start === null)return; const position = angle(event); let delta = position - start; if(delta > Math.PI) delta -= Math.PI * 2; if(delta < -Math.PI) delta += Math.PI * 2; const steps = Math.trunc(delta * 100 / (Math.PI * 2)); if(steps){start = position; set(steps);}};
  dial.onpointerup = dial.onpointercancel = () => {start=null;};
  panel.onkeydown = event => {if(event.key === "Escape") panel.remove();};
  const heading=document.createElement("div");heading.className="volume-wheel-title";
  heading.textContent=group ? card._m("Group volume","ווליום קבוצה") : player.attributes?.friendly_name || card._m("Volume","עוצמה");
  panel.insertBefore(heading,dial);
  host.append(panel); draw(); refreshMute(); dial.focus({preventScroll:true});
}

export function syncPlayerVolumeControls(entityId, pct, options = {}) {
      const playerId = String(entityId || "").trim();
      if (!playerId) return;
      const value = Math.max(0, Math.min(100, Math.round(Number(pct) || 0)));
      const muted = options.muted !== undefined ? !!options.muted : value === 0;
      const icon = muted || value === 0 ? "volume_mute" : value < 40 ? "volume_low" : "volume_high";
      if (playerId === String(this._state.selectedPlayer || "")) {
        const slider = this.$("volSlider");
        if (slider) {
          if (String(slider.value) !== String(value)) slider.value = String(value);
          slider.style.setProperty("--vol-pct", `${value}%`);
        }
        const label = this.$("mobileVolPctLabel");
        if (label) label.textContent = `${value}%`;
        const muteBtn = this.$("btnMute");
        if (muteBtn) {
          muteBtn.classList.toggle("active", muted);
          muteBtn.classList.toggle("muted", muted);
          this._setButtonIcon(muteBtn, icon);
        }
        const controlVolumeBtn = this.$("controlVolumeBtn");
        if (controlVolumeBtn) {
          controlVolumeBtn.classList.toggle("muted", muted);
          this._setButtonIcon(controlVolumeBtn, icon);
        }
        const popupSlider = this.$("tabletPopupVolSlider");
        if (popupSlider) {
          if (String(popupSlider.value) !== String(value)) popupSlider.value = String(value);
          popupSlider.style.setProperty("--vol-pct", `${value}%`);
        }
        const popupValue = this.$("tabletPopupVolPct");
        if (popupValue) popupValue.textContent = `${value}%`;
        const popupMuteBtn = this.$("tabletPopupMuteBtn");
        if (popupMuteBtn) this._setButtonIcon(popupMuteBtn, icon);
      }
      this.shadowRoot?.querySelectorAll("[data-player-volume]")?.forEach((input) => {
        if (input.dataset.playerVolume !== playerId) return;
        if (String(input.value) !== String(value)) input.value = String(value);
        input.style.setProperty("--vol-pct", `${value}%`);
        const row = input.closest(".player-volume-row");
        const valueEl = row?.querySelector(".player-mini-value");
        if (valueEl) valueEl.textContent = `${value}%`;
        const muteBtn = row?.querySelector("[data-player-mute]");
        if (muteBtn) {
          muteBtn.classList.toggle("active", muted);
          this._setButtonIcon(muteBtn, icon);
        }
      });
      this.shadowRoot?.querySelectorAll("[data-player-mute]")?.forEach((button) => {
        if (button.dataset.playerMute !== playerId) return;
        button.classList.toggle("active", muted);
        const label = this._m(muted ? "Unmute" : "Mute", muted ? "בטל השתקה" : "השתק");
        button.setAttribute("aria-pressed", String(muted));
        button.setAttribute("aria-label", label);
        button.title = label;
        this._setButtonIcon(button, icon);
      });
      syncGroupVolumeReadouts(this);
    }
