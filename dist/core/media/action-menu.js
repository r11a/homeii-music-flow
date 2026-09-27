import { interfaceIconSvg } from "../ui-icons.js";
import { openPlaylistDestination } from "./playlist-actions.js";
// The action hub reuses the existing navigation and command handlers.
export function actionLabelsEnabled(card) {
  return card._config?.action_menu_labels ?? card._mobileFooterMode?.() !== "icon";
}

export function actionSymbolHtml(card, action) {
  if (action.genre) return `<strong class="fan-genre-name" dir="auto">${card._esc(action.label)}</strong>`;
  if (action.player || action.artwork) return `<span class="fan-player-art ${action.selected ? "selected" : ""} ${action.leader ? "leader" : ""}">${action.image ? card._imgHtml(action.image, "", {fallbackIcon:action.icon || "speaker"}) : actionIconSvg(card,action.icon || "speaker")}</span>`;
  if (action.value) return `<strong class="fan-value">${card._esc(action.value)}</strong>`;
  if (action.image) return card._imgHtml(action.image, "", { fallbackIcon:"music_note" });
  return action.svg || actionIconSvg(card, action.icon);
}

// Main player, screen actions and wheels share one local icon registry.
export function actionIconSvg(card, name) {
  return interfaceIconSvg(name) || card._iconSvg(name);
}

export function contextActionHtml(card, attribute, action, icon, label, className = "queue-action-item") {
  return `<button type="button" class="${className}" ${attribute}="${action}" title="${card._esc(label)}" aria-label="${card._esc(label)}">${actionIconSvg(card, icon)}${actionLabelsEnabled(card) ? `<span>${card._esc(label)}</span>` : ""}</button>`;
}

export function mediaActionSheetHtml(card, entry, queue = false) {
  const t = (key) => card._i18n(key);
  const liked = card._isEntryLiked(entry);
  const type = entry.media_type || entry.type || "album";
  const collection = ["album","artist","playlist"].includes(type);
  const attribute = queue ? "data-queue-popup" : "data-media-popup";
  const button = (action, icon, label) => contextActionHtml(card, attribute, action, icon, label);
  const art = card._imageUrl(entry.image || "", 160);
  let move = "";
  if (queue) {
    const count = Math.max(1, card._getNowPlayingQueueItems().length || card._state.queueItems?.length || Number(card._state.maQueueState?.items || 1));
    const position = Math.max(1, Math.min(count, card._queueDisplayPositionForEntry(entry, Math.round(Number(entry.sort_index || 0)) + 1 || 1)));
    move = `<div class="queue-move-control"><label><span>${card._esc(t("ui.move_to_position"))}</span>${card._queueMoveSelectHtml(count, position, entry)}</label></div>`;
  }
  return `<div class="media-action-layout ${actionLabelsEnabled(card) ? "with-labels" : "icons-only"}" dir="${card._m("ltr", "rtl")}">
    <div class="media-action-heading"><div class="media-action-art">${art ? card._imgHtml(art, "", { fallbackIcon: "music_note" }) : card._iconSvg("music_note")}</div><div class="media-action-copy"><div class="queue-action-player">${card._esc(card._selectedPlayerName())}</div><div class="queue-action-title">${card._esc(entry.name || t(queue ? "ui.queue_actions" : "ui.media_actions"))}</div></div>${button("close", "close", t("ui.close"))}</div>
    ${!queue ? `<button class="media-library-back" type="button" data-media-popup="close">${actionIconSvg(card,"back")}<span>${card._esc(card._m("Back to library","חזרה לספרייה"))}</span></button>` : ""}
    ${move}
    <div class="media-action-grid">${queue ? `${button("next", "queue_next", t("ui.play_next"))}${button("remove", "trash", t("ui.remove"))}` : `${button("play", "play", t("ui.play"))}${button("next", "queue_next", t("ui.play_next"))}${button("add", "queue_add", t("ui.add_to_queue"))}${card._supportsMusicAssistantRadioMode(type) ? button("radio_mode", "radio", t("ui.start_radio_mode")) : ""}`}${button("like", liked ? "heart_filled" : "heart_outline", card._m(liked ? "Remove like" : "Like", liked ? "הסר לייק" : "הוסף לייק"))}</div>
    ${!queue ? `<div class="media-action-grid media-action-tools">${card._state.engineCapabilities?.playlist_editing && ["track","album","playlist"].includes(type) ? button("playlist_add","playlist_add",card._m("Add to playlist","הוסף לפלייליסט")) : ""}${collection ? button("shuffle","shuffle",card._m("Shuffle play","ניגון בערבוב")) : ""}${!String(entry.uri || "").startsWith("library://") ? button("library_add","library_add",card._m("Save to library","הוסף לספריית MA")) : ""}${["album","artist","playlist","podcast","audiobook"].includes(type) ? button("details","info",card._m("Open details","פרטי המדיה")) : ""}</div>` : ""}
    ${!queue ? `<div class="media-action-secondary"><p>${card._esc(card._m("Replace the queue", "החלפת התור הקיים"))}</p><div class="media-action-grid">${button("play_clear", "queue_replace", t("ui.play_now_and_clear_queue"))}${button("next_clear", "queue_next_replace", t("ui.play_next_and_clear_queue"))}</div></div>` : ""}
  </div>`;
}

export async function handleMediaActionClick(card, event) {
  const button = event.target.closest("[data-queue-popup],[data-media-popup]");
  if (!button) return;
  const action = button.dataset.queuePopup || button.dataset.mediaPopup;
  if (action === "close") return card._closeMobileQueueActionMenu();
  const entry = card._state.mobileQueueActionEntry;
  const context = card._state.mobileActionContext;
  if (!entry || card._mobileQueueActionPending) return;
  if (action === "playlist_add") {
    card._mobileQueueActionPending = true;
    const feedback = card._showLibraryInteractionFeedback?.(button, {loading:true,hold:true});
    try { await openPlaylistDestination(card,entry); }
    catch (error) { if (card._state.mobileQueueActionEntry === entry) card._openMobileMediaActionMenu(entry); card._toastError(card._mediaControlFailureMessage(error)); }
    finally { card._mobileQueueActionPending = false; if (feedback) card._clearLibraryInteractionFeedback?.(feedback); }
    return;
  }
  card._mobileQueueActionPending = true;
  const controls = [...button.closest(".queue-action-sheet").querySelectorAll("button:not([data-queue-popup='close']):not([data-media-popup='close']),select")];
  const disabledBefore = controls.map(control => control.disabled);
  controls.forEach((control) => { control.disabled = true; });
  const feedback = card._showLibraryInteractionFeedback?.(button, {loading:true,hold:true});
  button.setAttribute("aria-busy", "true");
  try {
    let result;
    if (context === "media") result = await card._handleMobileMediaAction(action, entry);
    else if (action === "like") result = await card._toggleLikeEntry(entry, button);
    else result = await card._handleQueueAction(action, entry.queue_item_id, entry.uri || "", entry.sort_index ?? "", action === "move_to" ? card._queueMoveTargetFromElement(button) : null);
    if (result === false || card._state.mobileQueueActionEntry !== entry) return;
    card._closeMobileQueueActionMenu();
    if (card._state.menuOpen && (context === "media" || action === "like" || String(card._state.menuPage || "").startsWith("library_"))) await card._renderMobileMenu();
  } catch (error) {
    card._toastError(card._mediaControlFailureMessage(error));
  } finally {
    card._mobileQueueActionPending = false;
    if (feedback) card._clearLibraryInteractionFeedback?.(feedback);
    button.removeAttribute("aria-busy");
    controls.forEach((control,index) => { control.disabled = disabledBefore[index]; });
  }
}

export function actionMenuHtml() {
  const text = (en, he) => this._m(en, he);
  const labels = actionLabelsEnabled(this);
  const nav = (page, icon, title, subtitle) => this._navMenuItem(page, actionIconSvg(this, icon), title, subtitle);
  const section = (title, items) => `<section class="action-hub-section"><h3>${this._esc(title)}</h3><div class="action-hub-grid">${items.filter(Boolean).join("")}</div></section>`;
  if (this._isHotelMode()) return `<div class="action-hub ${labels ? "with-labels" : "icons-only"}">${section(text("Listen", "האזנה"), [nav("players", "speaker", this._i18n("ui.players"), text("Choose a room", "בחירת חדר")), nav("quick_search", "search", this._i18n("ui.search"), text("Find music", "חיפוש מוזיקה"))])}</div>`;
  return `<div class="action-hub ${labels ? "with-labels" : "icons-only"}" dir="${text("ltr", "rtl")}">
    ${section(text("Music", "מוזיקה"), [
      nav("quick_search", "search", this._i18n("ui.search"), text("Search your providers and library", "חיפוש בספקים ובספרייה")),
      this._discoveryModeEnabled() && nav("discovery", "compass", this._i18n("ui.discover_music"), text("Genres, playlists and radio", "ז׳אנרים, פלייליסטים ורדיו")),
      nav("library_liked", "heart_filled", this._i18n("ui.liked"), this._i18n("ui.open_saved_songs")),
      nav("simple_wizard", "wand", text("Guided mix", "מיקס מודרך"), this._i18n("ui.a_guided_music_wizard")),
    ])}
    ${section(text("Players and queue", "נגנים ותור"), [
      nav("players", "speaker", this._i18n("ui.players"), text("Choose a player", "בחירת נגן")),
      nav("queue", "queue", this._i18n("ui.queue_2"), text("Manage what plays next", "ניהול השירים הבאים")),
      nav("group", "speaker_group", this._i18n("ui.group_speakers_2"), text("Listen together in several rooms", "ניגון משותף בכמה חדרים")),
      nav("transfer", "queue_transfer", this._i18n("ui.transfer_queue_2"), text("Move the current queue to another player", "העברת התור לנגן אחר")),
    ])}
    ${section(text("Listening tools", "כלי האזנה"), [
      nav("sleep_timer", "timer", this._i18n("ui.schedules"), this._i18n("ui.sleep_timer_and_morning_playback")),
      nav("announcements", "announcement", this._i18n("ui.announcements"), this._i18n("ui.send_a_voice_message")),
      this._state.engineCapabilities?.ai_radio_dj && nav("ai_radio", "radio", text("AI Radio", "רדיו AI"), text("A DJ for your current queue", "שדרן לתור הניגון")),
      this._state.engineCapabilities?.queue_settings && nav("queue_settings", "settings", text("Playback preferences", "העדפות ניגון"), text("Autoplay, Smart Shuffle and transitions", "המשך ניגון, ערבוב חכם ומעברים")),
      `<button class="menu-item action-tile" data-menu-action="connect_this_device" title="${this._esc(text("Play on this device", "ניגון במכשיר הזה"))}" aria-label="${this._esc(text("Play on this device", "ניגון במכשיר הזה"))}"><span class="menu-item-main"><span class="menu-item-ico">${actionIconSvg(this, "this_device")}</span><span class="menu-item-copy"><span class="menu-item-title">${this._esc(text("This device", "המכשיר הזה"))}</span><span class="menu-item-sub">Sendspin</span></span></span></button>`,
    ])}
  </div>`;
}
