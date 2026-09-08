import { openPlaylistDestination } from "./playlist-actions.js";
// The action hub reuses the existing navigation and command handlers.
export function actionLabelsEnabled(card) {
  return card._config?.action_menu_labels ?? card._mobileFooterMode?.() !== "icon";
}

export function actionSymbolHtml(card, action) {
  if (action.genre) return `<strong class="fan-genre-name" dir="auto">${card._esc(action.label)}</strong>`;
  if (action.player) return `<span class="fan-player-art ${action.selected ? "selected" : ""}">${action.image ? card._imgHtml(action.image, "", {fallbackIcon:"speaker"}) : actionIconSvg(card,"speaker")}</span>`;
  if (action.value) return `<strong class="fan-value">${card._esc(action.value)}</strong>`;
  if (action.image) return card._imgHtml(action.image, "", { fallbackIcon:"music_note" });
  return action.svg || actionIconSvg(card, action.icon);
}

// One optical weight for navigation and media actions; existing icons remain the fallback.
export function actionIconSvg(card, name) {
  const paths = {
    copy: '<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V3H3v13h5"/>',
    refresh: '<path d="M20 7v5h-5M4 17v-5h5M5 8a8 8 0 0 1 13-3l2 3M4 16l2 3a8 8 0 0 0 13-3"/>',
    group_add: '<rect x="3" y="4" width="9" height="16" rx="2"/><circle cx="7.5" cy="15" r="2"/><path d="M7 8h1M18 8v8m-4-4h8"/>',
    group_remove: '<rect x="3" y="4" width="9" height="16" rx="2"/><circle cx="7.5" cy="15" r="2"/><path d="M7 8h1m6 4h8"/>',
    schedule_add: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18m-9 3v5m-3-2.5h6"/>',
    minimize: '<path d="m21 3-7 7m0-6v6h6M3 21l7-7m-6 0h6v6"/>',
    maximize: '<path d="M14 3h7v7m0-7-7 7M10 21H3v-7m0 7 7-7"/>',
    back: '<path d="m14 5-7 7 7 7"/>',
    fan: '<path d="M12 21 2 11a14 14 0 0 1 20 0L12 21ZM12 21V7m0 14L7 8m5 13 5-13"/>',
    shuffle: '<path d="M3 6h3c5 0 7 12 12 12h3M3 18h3c5 0 7-12 12-12h3M18 3l3 3-3 3M18 15l3 3-3 3"/>',
    library_add: '<path d="M4 3v18M9 3v18M14 3v8M18 14v8m-4-4h8"/>',
    crossfade: '<path d="M3 6h3c5 0 7 12 12 12h3M3 18h3c5 0 7-12 12-12h3M18 3l3 3-3 3M18 15l3 3-3 3"/>',
    lyrics: '<path d="M5 4h14v16H5Z M8 8h8M8 12h8M8 16h5"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="m16 8-2.5 5.5L8 16l2.5-5.5Z"/>',
    heart_filled: '<path d="M12 20S3 14.7 3 8.5a4.5 4.5 0 0 1 9-1 4.5 4.5 0 0 1 9 1C21 14.7 12 20 12 20Z" fill="currentColor" stroke="none"/>',
    heart_outline: '<path d="M12 20S3 14.7 3 8.5a4.5 4.5 0 0 1 9-1 4.5 4.5 0 0 1 9 1C21 14.7 12 20 12 20Z"/>',
    wand: '<path d="m4 20 12-12 4 4L8 24M14 10l4 4" transform="translate(0 -3)"/><path d="M5 3v4M3 5h4M19 2v4M17 4h4"/>',
    speaker: '<rect x="6" y="2" width="12" height="20" rx="3"/><circle cx="12" cy="15" r="3.5"/><circle cx="12" cy="7" r="1"/>',
    speaker_group: '<rect x="8" y="3" width="8" height="18" rx="2"/><circle cx="12" cy="15" r="2"/><path d="M11 7h2M4 6H2v12h2M20 6h2v12h-2"/>',
    queue: '<path d="M4 5h16M4 10h16M4 15h7M4 20h7"/><path d="m16 14 5 3-5 3Z"/>',
    queue_transfer: '<path d="M3 4h12M3 8h9M3 12h6M8 17h13m-4-4 4 4-4 4"/><rect x="2" y="16" width="3" height="5" rx="1"/>',
    timer: '<circle cx="12" cy="13" r="8"/><path d="M9 2h6M12 9v5l3 2M18 5l2-2"/>',
    announcement: '<path d="M4 9h4l8-5v16l-8-5H4Z M8 15l1 5H6l-1-5M20 8a7 7 0 0 1 0 8"/>',
    settings: '<path d="M4 6h16M4 12h16M4 18h16"/><circle cx="8" cy="6" r="2" fill="var(--homeii-surface,#18191c)"/><circle cx="16" cy="12" r="2" fill="var(--homeii-surface,#18191c)"/><circle cx="10" cy="18" r="2" fill="var(--homeii-surface,#18191c)"/>',
    this_device: '<rect x="3" y="3" width="18" height="13" rx="2"/><path d="M8 21h8M12 16v5m-2-14 5 3-5 3Z"/>',
    play: '<path d="m8 5 11 7-11 7Z" fill="currentColor" stroke="none"/>',
    queue_next: '<path d="m4 6 9 6-9 6Z M17 6v12M21 9v6"/>',
    queue_add: '<path d="M3 5h15M3 10h10M3 15h7M17 13v8M13 17h8"/>',
    radio: '<rect x="3" y="7" width="18" height="14" rx="3"/><path d="m5 7 13-5M14 12h4M14 16h4"/><circle cx="8" cy="14" r="2.5"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    trash: '<path d="M4 6h16M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7M14 10v7"/>',
  };
  return paths[name] ? `<svg class="ui-ic" data-icon="${name}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>` : card._iconSvg(name);
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
    ${!queue ? `<div class="media-action-grid media-action-tools">${card._state.engineCapabilities?.playlist_editing && ["track","album","playlist"].includes(type) ? button("playlist_add","queue_add",card._m("Add to playlist","הוסף לפלייליסט")) : ""}${collection ? button("shuffle","shuffle",card._m("Shuffle play","ניגון בערבוב")) : ""}${!String(entry.uri || "").startsWith("library://") ? button("library_add","library_add",card._m("Save to library","הוסף לספריית MA")) : ""}${["album","artist","playlist","podcast","audiobook"].includes(type) ? button("details","album",card._m("Open details","פרטי המדיה")) : ""}</div>` : ""}
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
    try { await openPlaylistDestination(card,entry); }
    catch (error) { if (card._state.mobileQueueActionEntry === entry) card._openMobileMediaActionMenu(entry); card._toastError(card._mediaControlFailureMessage(error)); }
    finally { card._mobileQueueActionPending = false; }
    return;
  }
  card._mobileQueueActionPending = true;
  const controls = [...button.closest(".queue-action-sheet").querySelectorAll("button:not([data-queue-popup='close']):not([data-media-popup='close']),select")];
  controls.forEach((control) => { control.disabled = true; });
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
    button.removeAttribute("aria-busy");
    controls.forEach((control) => { control.disabled = false; });
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
