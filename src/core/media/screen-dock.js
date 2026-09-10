import { actionIconSvg } from "./action-menu.js";
import { bindImmersivePlayer } from "./immersive-player.js";

// The same wheel interaction as the player, with screen-specific commands.
export function screenActions(card, page) {
  const nav = (id, icon, en, he) => ({ id, icon, label:card._m(en, he) });
  const visual = button => {
    if (button.hasAttribute("data-history-tab")) return {icon:button.dataset.historyTab === "recent" ? "history" : "compass", selected:button.getAttribute("aria-selected") === "true"};
    if (button.hasAttribute("data-history-play-all")) return {icon:"play"};
    if (button.hasAttribute("data-history-index")) return {image:button.querySelector("img")?.getAttribute("src") || "", artwork:true, icon:"album"};
    if (page === "favorite_radios" && button.hasAttribute("data-media-uri")) return {image:button.dataset.mediaImage || "", artwork:true, icon:"radio"};
    const roomIcon = {music:"library",transfer:"queue_transfer",selection:"speaker_group",actions:"settings",group:"group_add",ungroup:"group_remove",announce:"announcement",timers:"timer"}[button.dataset.roomSelectionAction];
    if (roomIcon) return {icon:roomIcon};
    if (button.dataset.menuNav === "transfer") return {icon:"queue_transfer"};
    if (button.hasAttribute("data-menu-group-player")) return {image:button.closest(".group-player-card")?.querySelector("img")?.getAttribute("src") || "", icon:"speaker", player:true, selected:button.checked, leader:button.dataset.groupOwner === "true"};
    if (button.hasAttribute("data-menu-transfer")) return {image:button.querySelector("img")?.getAttribute("src") || "", icon:"speaker", player:true};
    if (button.hasAttribute("data-menu-player")) return { image:button.querySelector("img")?.getAttribute("src") || "", icon:"speaker", player:true, selected:button.getAttribute("aria-pressed") === "true" };
    const action = button.dataset.menuAction;
    const icon = ({apply_group:"group_add",clear_group:"group_remove",retry_library:"refresh",connect_this_device:"this_device",disconnect_this_device:"this_device",run_diagnostics:"settings",copy_diagnostics:"copy",open_app:"fullscreen"})[action];
    if (icon) return {icon};
    if (button.hasAttribute("data-start-schedule-new")) return {icon:"schedule_add"};
    if (button.hasAttribute("data-start-schedule-delete")) return {icon:"trash"};
    if (button.id === "lyricsRetryBtn") return {icon:"refresh"};
    if (button.id === "lyricsSyncBtn") return {icon:"karaoke", selected:button.getAttribute("aria-pressed") === "true"};
    const svg = button.querySelector("svg");
    if (svg) return {svg:svg.outerHTML,icon:svg.dataset.icon || ""};
    const value = button.textContent.trim();
    if (value && value.length <= 6) return {value};
    return {icon:page === "announcements" ? "announcement" : page === "sleep_timer" ? "timer" : "settings"};
  };
  const controlKey = (button, index) => {
    if (page === "history") return button.dataset.historyTab || button.dataset.historyKey || (button.hasAttribute("data-history-play-all") ? "play-all" : index);
    if (page === "studio") {
      const attribute = button.getAttributeNames().find(name => name.startsWith("data-room-"));
      if (attribute) return `${attribute}:${button.getAttribute(attribute)}`;
    }
    return button.dataset.mediaUri || button.dataset.menuAction || button.dataset.menuPlayer || button.dataset.menuGroupPlayer || button.dataset.menuTransfer || button.id || index;
  };
  const controls = (selector) => [...(card.$(page === "studio" ? "controlRoomBody" : page === "history" ? "historyDrawer" : "mobileMenuBody")?.querySelectorAll(selector) || [])].flatMap((button,index)=>button.disabled ? [] : [{
    id:`control:${page}:${controlKey(button,index)}`, selected:button.getAttribute("aria-pressed") === "true", ...visual(button),
    label:(page === "favorite_radios" ? button.dataset.mediaName : "") || (button.hasAttribute("data-menu-group-player") ? button.closest(".group-player-card")?.querySelector(".player-premium-name")?.textContent.trim() : "") || button.querySelector(".history-chip-title")?.textContent.trim() || ((button.hasAttribute("data-menu-player") || button.hasAttribute("data-menu-transfer")) ? button.querySelector(".player-choice-name,.player-premium-name")?.textContent.trim() : "") || button.getAttribute("aria-label") || button.title || button.textContent.trim(), control:button,
  }]);
  if (page === "favorite_radios") return controls("[data-media-uri]");
  if (page === "group_volume") return controls("[data-group-mute]");
  if (page === "playback_stats") return [nav("refresh_stats", "refresh", "Refresh statistics", "רענון נתוני האזנה")];
  if (page === "lighting") return controls("[data-setting-ambient-light]");
  if (page === "history") return controls("[data-history-tab],[data-history-play-all],[data-history-index]");
  if (page === "studio") return [
    ...(card._state.controlRoomPanel ? [nav("studio_back","back","Back to studio","חזרה לסטודיו")] : []),
    ...controls('.control-room-dock-btn,.control-room-panel-action'),
  ];
  if (page === "ai_radio") {
    const host = card.$("mobileMenuBody");
    const apply = host?.querySelector("[data-ai-apply]");
    if (!apply || apply.disabled) return [];
    return [...(host.querySelector("[data-ai-host]")?.options || [])].filter(option => !option.disabled).map(option => ({
      id:`ai-host:${card._state.selectedPlayer}:${card._state.maQueueState?.queue_id}:${option.value}`, icon:option.value ? "radio" : "stop", label:option.textContent.trim(), hostId:option.value,
    }));
  }
  if (page === "discovery") return [
    ...card._discoveryCategoryOptions().map(category=>({id:`genre:${category.key}`,genre:true,icon:category.icon || "music_note",label:category.label})),
  ];
  if (page === "transfer") return controls('[data-menu-transfer]');
  if (page === "group") return [...controls('[data-menu-group-player]'), ...controls('[data-menu-action="apply_group"],[data-menu-action="clear_group"]')];
  if (["players","players_active"].includes(page)) return [
    ...controls('[data-menu-player]'),
    nav("transfer","queue_transfer","Transfer queue","העברת תור"),nav("group","speaker_group","Group","קבוצה"),
    nav("local_device","this_device","Play on this device","נגן במכשיר זה"),
    nav("player_preferences","settings","Player settings","הגדרות נגנים"),
    ...((card._state.artworkLighting?.rules?.[card._state.selectedPlayer]?.lights?.length || card._ambientLightEntitiesForPlayer?.().length) ? [{...nav("lighting","lightbulb",card._ambientLightEnabled?.() ? "Lighting follow on" : "Lighting follow off",card._ambientLightEnabled?.() ? "מעקב תאורה פעיל" : "מעקב תאורה כבוי"),selected:card._ambientLightEnabled?.() === true}] : []),
    ...(!card._isHotelMode?.() ? [nav("stop_all","close","Disconnect","ניתוק")] : []),
    ...controls('[data-menu-action="apply_group"], [data-menu-action="clear_group"]'),
  ];
  if (["media_actions","queue_actions","lyrics"].includes(page)) {
    const host = card.$(page === "lyrics" ? "lyricsBackdrop" : "mobileQueueActionSheet");
    const selector = page === "lyrics" ? ".lyrics-head-actions button" : page === "queue_actions" ? "[data-queue-popup]" : "[data-media-popup]";
    const buttons = [...(host?.querySelectorAll(selector) || [])]
      .filter(button => !button.disabled && !button.hidden && button.dataset.mediaPopup !== "close" && button.dataset.queuePopup !== "close" && button.id !== "lyricsCloseBtn");
    return buttons.map((button,index) => ({
      id:`control:${page}:${page !== "lyrics" ? card._state.mobileQueueActionEntry?.uri : ""}:${button.dataset.mediaPopup || button.dataset.queuePopup || button.id || index}`,
      ...visual(button),
      value:({lyricsFontMinusBtn:"A−",lyricsFontResetBtn:"A",lyricsFontPlusBtn:"A+",lyricsOffsetMinusBtn:"−s",lyricsOffsetResetBtn:"0s",lyricsOffsetPlusBtn:"+s"})[button.id],
      label:button.getAttribute("aria-label") || button.title || button.textContent.trim(), control:button,
    }));
  }
  if (page === "queue") return [...controls('.queue-page-head-actions button, .queue-playback-options [data-menu-action]'), ...(card._state.engineCapabilities?.saved_playlists ? [nav("saved_playlists","playlist_add","Save queue / playlists","שמירת תור ורשימות")] : []), nav("queue_settings","settings","Queue preferences","העדפות התור"), ...card._getNowPlayingQueueItems().map((item) => ({
    id:`queue:${card._state.selectedPlayer}:${card._getQueueItemKey(item)}`, icon:"music_note", label:item.media_item?.name || item.name || "—",
    image:card._queueItemImageUrl(item, 100), item,
  }))];
  if (page === "sleep_timer") return [15,30,45,60,90,120].map(minutes => ({ id:`timer:${minutes}`, icon:"timer", value:String(minutes), label:card._m(`${minutes} min`, `${minutes} דק׳`) }))
    .concat(card._sleepTimerRemainingMs() > 0 ? [nav("timer:cancel","close","Cancel timer","בטל טיימר")] : [], controls('[data-start-schedule-new]'));
  if (page.startsWith("library_") || page === "media_detail") return [
    ...(page === "media_detail" ? controls('.media-detail-hero-actions button') : []),
    ...(page === "library_radio" ? [nav("favorite_radios","heart_outline","Favorite stations","תחנות מועדפות")] : []),
    ...controls('.library-toolbar-icons button'),
    nav("library_search","search","Search","חיפוש"), nav("library_playlists","playlist","Playlists","פלייליסטים"),
    nav("library_artists","artist","Artists","אמנים"), nav("library_albums","album","Albums","אלבומים"),
    nav("library_tracks","music_note","Tracks","שירים"), nav("library_radio","radio","Radio","רדיו"),
    nav("library_podcasts","podcast","Podcasts","פודקאסטים"), nav("library_liked","heart_outline","Favorites","אהבתי"),
  ];
  if (page !== "main") return controls('button:not([data-screen-back]):not([data-screen-home]):not([data-screen-wheel]):not([data-screen-player])');
  return [nav("queue","queue","Queue","תור"),nav("players","speaker_group","Players","נגנים"),nav("group","speaker_group","Group","קבוצה"),
    nav("sleep_timer","timer","Timers","טיימרים"),nav("announcements","announcement","Announce","כריזה"),
    nav("queue_settings","settings","Playback","העדפות ניגון"),nav("library_search","search","Search","חיפוש"),nav("main","compass","All actions","כל הפעולות")];
}

export function syncScreenDock(card, sheet, page, closeScreen) {
  if (!sheet) return;
  let dock = sheet.querySelector(":scope > .screen-dock");
  if (!dock) {
    dock = document.createElement("nav"); dock.className = "immersive-dock screen-dock";
    dock.setAttribute("aria-label",card._m("Screen navigation","ניווט במסך"));
    const label = (en,he) => card._esc(card._m(en,he));
    dock.innerHTML = `<button type="button" data-screen-back aria-label="${label("Back","חזרה")}">${actionIconSvg(card,"back")}</button>
      <div class="immersive-fan" role="group" aria-label="${label("Screen wheel","גלגל המסך")}" hidden><div class="immersive-fan-actions"></div><div class="immersive-fan-navigation"><button data-fan-step="-1" aria-label="${label("Previous","הקודם")}">‹</button><span class="immersive-page-status" aria-live="polite"></span><button data-immersive-action="more">${label("All actions","כל הפעולות")}</button><button data-fan-step="1" aria-label="${label("Next","הבא")}">›</button></div></div>
      <button type="button" data-screen-wheel aria-expanded="false" aria-label="${label("Screen wheel","גלגל המסך")}">${actionIconSvg(card,"fan")}</button>
      <button type="button" data-screen-player aria-label="${label("Choose player","בחירת נגן")}">${actionIconSvg(card,"speaker")}</button>
      <button type="button" data-screen-home aria-label="${label("Now playing","לנגן הראשי")}">${actionIconSvg(card,"play")}</button>`;
    sheet.append(dock);
    dock.querySelector("[data-screen-back]").onclick = () => {
      const panel = sheet.querySelector(":scope > .screen-all-actions");
      if (panel) { panel.remove(); return; }
      if (dock.dataset.page === "studio" && card._state.controlRoomPanel) {
        card._toggleControlRoomPanel(card._state.controlRoomPanel);
        return;
      }
      return dock._closeScreen ? dock._closeScreen() : card._backMobileMenu();
    };
    dock.querySelector("[data-screen-home]").onclick = () => { dock._closeScreen?.(); card._closeMobileMenu(); };
    dock.querySelector("[data-screen-player]").onclick = () => {
      const origin = dock.dataset.page;
      if (["players","players_active"].includes(origin)) return;
      const entry = card._state.mobileQueueActionEntry;
      const panel = card._state.controlRoomPanel;
      const overlay = !!dock._closeScreen;
      const stack = [...(card._state.menuStack || [])];
      dock._closeScreen?.();
      card._openMobileMenu("players");
      card._screenPlayerReturn = async () => {
        if (!overlay) {
          card._state.menuPage = origin;
          card._state.menuStack = stack;
          return card._renderMobileMenu();
        }
        card._closeMobileMenu();
        if (origin === "history") return card._setHistoryDrawerOpen(true);
        if (origin === "lyrics") return card._openLyricsModal();
        if (origin === "studio") { card._openControlRoom(); if (panel) card._toggleControlRoomPanel(panel); return; }
        if (origin === "queue_actions") return card._openMobileQueueActionMenu(entry);
        if (origin === "media_actions") return card._openMobileMediaActionMenu(entry);
      };
    };
    bindImmersivePlayer(card, { fan:dock.querySelector(".immersive-fan"), toggle:dock.querySelector("[data-screen-wheel]"),
      host:sheet, context:() => ["players","players_active"].includes(dock.dataset.page) ? "player_picker" : dock.dataset.page,
      pages:() => { const actions = screenActions(card,dock.dataset.page); return [actions]; },
      keepOpen:id => {
        const control = screenActions(card,dock.dataset.page).find(action => action.id === id)?.control;
        return !!control && (control.hasAttribute("data-menu-group-player") || (dock.dataset.page === "lyrics" && control.id !== "lyricsRetryBtn"));
      },
      onAction:async id => {
        await dock._dispatchAction(id);
      },
    });
    dock._dispatchAction = async id => {
        if (id === "refresh_stats") { await card._renderMobileMenu(); return; }
        if (id.startsWith("ai-host:")) {
          const action = screenActions(card, "ai_radio").find(item => item.id === id);
          const body = card.$("mobileMenuBody");
          if (!action || !body) return;
          body.querySelector("[data-ai-host]").value = action.hostId;
          body.querySelector("[data-ai-apply]").click();
          return;
        }
        if (id === "studio_back") { card._toggleControlRoomPanel(card._state.controlRoomPanel); return; }
        if (id === "local_device") { dock._closeScreen?.(); await card._connectThisDevicePlayer(); return; }
        if (id === "player_preferences") {
          const open = card._settingsAccordionOpenSet(); open.add("players_library"); card._persistSettingsAccordionOpen(open);
          dock._closeScreen?.(); card._openMobileMenu("settings"); return;
        }
        if (id.startsWith("genre:")) {
          const key=id.slice(6);
          if (card._discoveryCategoryOptions().some(category=>category.key===key)) await card._selectDiscoveryCategory(key);
        } else if (id.startsWith("control:")) {
          const action = screenActions(card,dock.dataset.page).find(item=>item.id===id);
          if (action?.control?.isConnected && !action.control.disabled) {
            action.control.click();
            dock.querySelector(".immersive-fan")._refreshAvailableActions?.();
          }
        } else if (id.startsWith("queue:")) {
          const action = screenActions(card,"queue").find(item=>item.id===id);
          if (!action) throw new Error(card._m("Queue changed. Try again.","התור השתנה. נסה שוב."));
          await card._playQueueItem(card._getQueueItemKey(action.item),card._getQueueItemUri(action.item),action.item.media_item?.media_type || "track",action.item.sort_index);
        } else if (id.startsWith("timer:")) {
          if (id === "timer:cancel") await card._clearSleepTimer(true);
          else await card._setSleepTimerMinutes(Number(id.split(":")[1]));
          await card._renderMobileMenu();
        } else { dock._closeScreen?.(); card._openMobileMenu(id); }
    };
  }
  if (dock.dataset.page !== page) { sheet.querySelector(":scope > .screen-all-actions")?.remove(); dock.querySelector(".immersive-fan").hidden = true; dock.querySelector("[data-screen-wheel]").setAttribute("aria-expanded","false"); }
  dock.dataset.page = page; dock._closeScreen = closeScreen;
  const selected = card._getSelectedPlayer?.();
  const playerName = selected ? (card._playerDisplayName?.(selected,card._state.players) || selected.attributes?.friendly_name || selected.entity_id) : card._m("Choose player","בחירת נגן");
  const playerButton = dock.querySelector("[data-screen-player]");
  playerButton.innerHTML = `${actionIconSvg(card,"speaker")}<span class="screen-player-name" dir="auto">${card._esc(playerName)}</span>`;
  playerButton.title = playerName;
  playerButton.setAttribute("aria-label",`${card._m("Choose player","בחירת נגן")}: ${playerName}`);
  const wheelLabel = page === "queue" ? card._m("Queue wheel","גלגל התור") : page === "sleep_timer" ? card._m("Timer wheel","גלגל הזמנים") : page.startsWith("library_") || page === "media_detail" ? card._m("Library wheel","גלגל הספרייה") : card._m("Screen wheel","גלגל המסך");
  const wheelToggle = dock.querySelector("[data-screen-wheel]");
  wheelToggle.setAttribute("aria-label",wheelLabel); wheelToggle.title = wheelLabel;
  dock.querySelector(".immersive-fan").setAttribute("aria-label",wheelLabel);
  dock.querySelector(".immersive-fan")._refreshAvailableActions?.();
  sheet.querySelector(":scope > .screen-all-actions")?._refreshAvailableActions?.();
  sheet.classList.add("has-screen-dock");
  sheet.dataset.dockPage = page;
}
