// Queue playback controls use authoritative MA state through the existing Engine.
import { actionIconSvg } from "./action-menu.js";

export function playbackSpeedHtml(card) {
  const queue = card._state.maQueueState;
  const type = queue?.current_item?.media_item?.media_type;
  if (!card._state.engineCapabilities?.queue_playback_speed || !queue?.queue_id || !["podcast_episode", "audiobook"].includes(type)) return "";
  const value = Number(queue.current_item?.playback_speed ?? queue.playback_speed ?? 1);
  const speeds = [...new Set([0.5,0.75,1,1.25,1.5,1.75,2,2.5,3,...(Number.isFinite(value) && value >= 0.5 && value <= 3 ? [value] : [])])].sort((a,b) => a-b);
  return `<label class="queue-playback-speed">${card._esc(card._m("Listening speed", "מהירות האזנה"))}<select class="settings-select" data-playback-speed ${card._playbackSpeedPending ? "disabled" : ""}>${speeds.map(speed => `<option value="${speed}" ${speed === value ? "selected" : ""}>${speed}×</option>`).join("")}</select></label>`;
}

export async function setPlaybackSpeed(card, input) {
  if (card._playbackSpeedPending) return;
  const player = card._state.selectedPlayer;
  const queue = card._state.maQueueState;
  const speed = Number(input.value);
  if (!playbackSpeedHtml(card) || !Number.isFinite(speed) || speed < 0.5 || speed > 3) return;
  card._playbackSpeedPending = true; input.disabled = true;
  try {
    await card._callHomeiiEnginePlayerCommand(player, "playback_speed", { speed });
    const confirmed = await card._callEngineMaCommand("player_queues/get", { queue_id: queue.queue_id });
    const actual = Number(confirmed?.current_item?.playback_speed ?? confirmed?.playback_speed);
    if (actual !== speed) throw new Error(card._m("The playback speed was not confirmed by Music Assistant.", "מהירות ההאזנה לא אושרה על ידי Music Assistant."));
    if (card._state.selectedPlayer === player) await card._ensureQueueSnapshot(true);
  } catch (error) {
    card._toastError(card._mediaControlFailureMessage(error));
  } finally {
    card._playbackSpeedPending = false;
    if (card._state.menuOpen) await card._renderMobileMenu();
  }
}

export function queuePlaybackOptionsHtml() {
    if (!this._state.engineCapabilities?.queue_autoplay || !this._state.maQueueState?.queue_id) return playbackSpeedHtml(this);
    const enabled = this._state.maQueueState.autoplay_enabled === true;
    const pending = this._autoplayPendingPlayer === this._state.selectedPlayer;
    const label = this._m("Autoplay: continue with similar music", "ניגון אוטומטי: המשך עם מוזיקה דומה");
    return `${playbackSpeedHtml(this)}<div class="queue-playback-options"><button class="chip-btn ${enabled ? "active" : ""}" data-menu-action="toggle_autoplay" aria-label="${this._esc(label)}" title="${this._esc(label)}" aria-pressed="${enabled}" aria-busy="${pending}" ${pending ? "disabled" : ""}>${actionIconSvg(this, "radio")}${this._mobileFooterMode() === "icon" ? "" : `<span>${this._esc(this._m("Autoplay", "ניגון אוטומטי"))}</span>`}</button>${crossfadeButton.call(this)}${this._state.engineCapabilities?.queue_settings ? `<button class="chip-btn" data-menu-nav="queue_settings" title="${this._esc(this._m("Playback preferences", "העדפות ניגון"))}" aria-label="${this._esc(this._m("Playback preferences", "העדפות ניגון"))}">${actionIconSvg(this, "settings")}${this._mobileFooterMode() === "icon" ? "" : `<span>${this._esc(this._m("Preferences", "העדפות"))}</span>`}</button>` : ""}</div>`;
  }

function crossfadeAvailable(card) {
  return card._state.engineCapabilities?.music_assistant_command_bridge
    && !!card._state.maQueueState?.queue_id
    && typeof card._state.maQueueState.crossfade_enabled === "boolean";
}

function crossfadeButton() {
  if (!crossfadeAvailable(this)) return "";
  const enabled = this._state.maQueueState.crossfade_enabled;
  const pending = this._crossfadePendingPlayer === this._state.selectedPlayer;
  const label = this._m("Crossfade: smooth transitions between tracks", "מעבר חלק בין שירים");
  return `<button class="chip-btn ${enabled ? "active" : ""}" data-menu-action="toggle_crossfade" aria-label="${this._esc(label)}" title="${this._esc(label)}" aria-pressed="${enabled}" aria-busy="${pending}" ${pending ? "disabled" : ""}>${actionIconSvg(this, "crossfade")}${this._mobileFooterMode() === "icon" ? "" : `<span>${this._esc(this._m("Crossfade", "מעבר חלק"))}</span>`}</button>`;
}

export async function toggleQueueCrossfade() {
  const playerId = this._state.selectedPlayer;
  const queueId = this._state.maQueueState?.queue_id;
  if (!playerId || this._crossfadePendingPlayer || !crossfadeAvailable(this)) return;
  const enabled = !this._state.maQueueState.crossfade_enabled;
  this._crossfadePendingPlayer = playerId;
  try {
    await this._renderMobileMenu();
    await this._callEngineMaCommand("player_queues/crossfade", { queue_id: queueId, crossfade_enabled: enabled });
    const confirmed = await this._callEngineMaCommand("player_queues/get", { queue_id: queueId });
    if (confirmed?.crossfade_enabled !== enabled) throw new Error(this._m("The transition setting was not confirmed. Refresh the queue before trying again.", "שינוי המעבר לא אושר. רענן את התור לפני ניסיון נוסף."));
    if (this._state.selectedPlayer === playerId) await this._ensureQueueSnapshot(true);
  } catch (error) {
    this._toastError(this._mediaControlFailureMessage(error));
  } finally {
    this._crossfadePendingPlayer = null;
    if (this._state.menuOpen) await this._renderMobileMenu();
  }
}

export async function toggleQueueAutoplay() {
    const playerId = this._state.selectedPlayer;
    if (!playerId || this._autoplayPendingPlayer || !this._state.engineCapabilities?.queue_autoplay) return;
    const enabled = this._state.maQueueState?.autoplay_enabled !== true;
    this._autoplayPendingPlayer = playerId;
    try {
      await this._renderMobileMenu();
      await this._callHomeiiEnginePlayerCommand(playerId, "autoplay", { autoplay_enabled: enabled });
      if (this._state.selectedPlayer === playerId) await this._ensureQueueSnapshot(true);
    } catch (error) {
      this._toastError(this._mediaControlFailureMessage(error));
    } finally {
      this._autoplayPendingPlayer = null;
      if (this._state.menuOpen) await this._renderMobileMenu();
    }
  }

