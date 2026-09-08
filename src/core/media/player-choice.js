import { actionIconSvg } from "./action-menu.js";

// Selection stays separate from playback controls; use the existing selection handler.
export function playerChoiceHtml(card, player, { attrs, active, available, name, track, art, pinHtml }) {
  const state = card._playerStateLabel(player);
  return `<div class="player-choice-card ${active ? "selected" : ""} ${available ? "" : "unavailable"}">
    <button type="button" class="player-choice-button" ${attrs} aria-pressed="${active}" ${available ? "" : "disabled"}>
      <span class="player-choice-symbol">${art ? card._imgHtml(art, "", { fallbackIcon: "speaker" }) : actionIconSvg(card, "speaker")}</span>
      <span class="player-choice-details">
        <span class="player-choice-name" dir="auto">${card._esc(name)}</span>
        <span class="player-choice-state"><i class="${player.state === "playing" ? "playing" : ""}" aria-hidden="true"></i>${card._esc(state)}${active ? ` · ${card._esc(card._m("Selected", "נבחר"))}` : ""}</span>
        ${available && track ? `<span class="player-choice-track" dir="auto">${card._esc(track)}</span>` : ""}
      </span>
      ${active ? '<svg class="player-choice-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>' : ""}
    </button>
    ${pinHtml}
  </div>`;
}
