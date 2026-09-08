import { playerVolumeValue, playerCanSetVolume } from "../state/players.js";

export function playerVolumeControlsHtml(card, player, { inline = false } = {}) {
  if (!playerCanSetVolume(player)) return `<div class="player-volume-unavailable" role="status">${card._esc(card._m("Independent volume control is unavailable", "שליטה עצמאית בעוצמה אינה זמינה"))}</div>`;
  const volume = Math.round(playerVolumeValue(player) * 100);
  const muted = card._isMuted(player);
  const label = card._m("Volume", "עוצמה");
  const muteLabel = card._i18n("ui.mute");
  return `<div class="player-volume-row ${inline ? "group-inline-volume" : ""}">
    <button class="player-mini-mute ${muted ? "active" : ""}" data-player-mute="${card._esc(player.entity_id)}" title="${card._esc(muteLabel)}" aria-label="${card._esc(muteLabel)}">${card._iconSvg(card._volumeIconName(player))}</button>
    <input class="player-mini-volume" data-player-volume="${card._esc(player.entity_id)}" aria-label="${card._esc(`${label}: ${player.attributes?.friendly_name || player.entity_id}`)}" type="range" min="0" max="100" value="${volume}" style="--vol-pct:${volume}%">
    ${inline ? "" : `<span class="player-mini-value">${volume}%</span>`}
  </div>`;
}
