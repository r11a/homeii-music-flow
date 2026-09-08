import { actionIconSvg, actionSymbolHtml } from "./action-menu.js";
import { bindImmersivePlayer } from "./immersive-player.js";

// The same wheel interaction as the player, with screen-specific commands.
export function screenActions(card, page) {
  const nav = (id, icon, en, he) => ({ id, icon, label:card._m(en, he) });
  const visual = button => {
    if (button.hasAttribute("data-menu-player")) return { image:button.querySelector("img")?.getAttribute("src") || "", icon:"speaker", player:true, selected:button.getAttribute("aria-pressed") === "true" };
    const action = button.dataset.menuAction;
    const icon = ({apply_group:"group_add",clear_group:"group_remove",retry_library:"refresh",connect_this_device:"this_device",disconnect_this_device:"this_device",run_diagnostics:"settings",copy_diagnostics:"copy",open_app:"fullscreen"})[action];
    if (icon) return {icon};
    if (button.hasAttribute("data-start-schedule-new")) return {icon:"schedule_add"};
    if (button.hasAttribute("data-start-schedule-delete")) return {icon:"trash"};
    if (button.id === "lyricsRetryBtn") return {icon:"refresh"};
    const svg = button.querySelector("svg");
    if (svg) return {svg:svg.outerHTML,icon:svg.dataset.icon || ""};
    const value = button.textContent.trim();
    if (value && value.length <= 6) return {value};
    return {icon:page === "announcements" ? "announcement" : page === "sleep_timer" ? "timer" : "settings"};
  };
  const controls = (selector) => [...(card.$("mobileMenuBody")?.querySelectorAll(selector) || [])].flatMap((button,index)=>button.disabled ? [] : [{
    id:`control:${page}:${button.dataset.menuPlayer || button.id || index}`, ...visual(button),
    label:button.getAttribute("aria-label") || button.title || button.textContent.trim(), control:button,
  }]);
  if (page === "discovery") return [
    ...card._discoveryCategoryOptions().map(category=>({id:`genre:${category.key}`,genre:true,icon:category.icon || "music_note",label:category.label})),
  ];
  if (["players","players_active","transfer","group"].includes(page)) return [
    ...controls('[data-menu-player]'),
    nav("transfer","queue_transfer","Transfer queue","העברת תור"),nav("group","speaker_group","Group","קבוצה"),
    nav("local_device","this_device","Play on this device","נגן במכשיר זה"),
    nav("player_preferences","settings","Player settings","הגדרות נגנים"),
    ...controls('[data-menu-action="apply_group"], [data-menu-action="clear_group"]'),
  ];
  if (["media_actions","queue_actions","lyrics"].includes(page)) {
    const host = card.$(page === "lyrics" ? "lyricsBackdrop" : "mobileQueueActionSheet");
    const selector = page === "lyrics" ? ".lyrics-head-actions button" : page === "queue_actions" ? "[data-queue-popup]" : "[data-media-popup]";
    const buttons = [...(host?.querySelectorAll(selector) || [])]
      .filter(button => !button.disabled && button.dataset.mediaPopup !== "close" && button.dataset.queuePopup !== "close" && button.id !== "lyricsCloseBtn");
    if (buttons.length) return buttons.map((button,index) => ({
      id:`control:${page}:${page !== "lyrics" ? card._state.mobileQueueActionEntry?.uri : ""}:${button.dataset.mediaPopup || button.dataset.queuePopup || button.id || index}`,
      ...visual(button),
      value:({lyricsFontMinusBtn:"A−",lyricsFontResetBtn:"A",lyricsFontPlusBtn:"A+",lyricsOffsetMinusBtn:"−s",lyricsOffsetResetBtn:"0s",lyricsOffsetPlusBtn:"+s"})[button.id],
      label:button.getAttribute("aria-label") || button.title || button.textContent.trim(), control:button,
    }));
  }
  if (page === "queue") return [...controls('.queue-page-head-actions button'), nav("queue_settings","settings","Queue preferences","העדפות התור"), ...card._getNowPlayingQueueItems().map((item) => ({
    id:`queue:${card._state.selectedPlayer}:${card._getQueueItemKey(item)}`, icon:"music_note", label:item.media_item?.name || item.name || "—",
    image:card._queueItemImageUrl(item, 100), item,
  }))];
  if (page === "sleep_timer") return [15,30,45,60,90,120].map(minutes => ({ id:`timer:${minutes}`, icon:"timer", value:String(minutes), label:card._m(`${minutes} min`, `${minutes} דק׳`) }))
    .concat(card._sleepTimerRemainingMs() > 0 ? [nav("timer:cancel","close","Cancel timer","בטל טיימר")] : [], controls('[data-start-schedule-new]'));
  if (page.startsWith("library_") || page === "media_detail") return [
    ...controls('.library-toolbar-icons button'),
    nav("library_search","search","Search","חיפוש"), nav("library_playlists","queue","Playlists","פלייליסטים"),
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
      return dock._closeScreen ? dock._closeScreen() : card._backMobileMenu();
    };
    dock.querySelector("[data-screen-home]").onclick = () => { dock._closeScreen?.(); card._closeMobileMenu(); };
    dock.querySelector("[data-screen-player]").onclick = () => { dock._closeScreen?.(); card._openMobileMenu("players"); };
    bindImmersivePlayer(card, { fan:dock.querySelector(".immersive-fan"), toggle:dock.querySelector("[data-screen-wheel]"),
      pages:() => { const actions = screenActions(card,dock.dataset.page); return actions.length ? [actions] : [[{id:"main",icon:"queue",label:card._m("All actions","כל הפעולות")}]]; },
      onAction:async id => {
        if (id === "more") {
          sheet.querySelector(":scope > .screen-all-actions")?.remove();
          const panel = document.createElement("section"); panel.className = "screen-all-actions";
          panel.setAttribute("aria-label",card._m("Screen actions","פעולות המסך"));
          let actions = [];
          panel._refreshAvailableActions = () => {
            actions = screenActions(card,dock.dataset.page);
            const html = `<h2>${card._esc(card._m("Screen actions","פעולות המסך"))}</h2><div>${actions.map((action,index)=>`<button type="button" data-context-action="${index}">${actionSymbolHtml(card,action)}<span>${card._esc(action.label)}</span></button>`).join("")}</div>`;
            if (panel.innerHTML !== html) panel.innerHTML = html;
          };
          panel._refreshAvailableActions();
          panel.onclick = async event => {
            const button = event.target.closest("[data-context-action]"); if (!button) return;
            const action = actions[Number(button.dataset.contextAction)];
            if (!screenActions(card,dock.dataset.page).some(current=>current.id===action?.id)) return;
            panel.remove();
            try { await dock._dispatchAction(action.id); } catch(error) { card._toastError(card._mediaControlFailureMessage(error)); }
          };
          sheet.append(panel); return;
        }
        await dock._dispatchAction(id);
      },
    });
    dock._dispatchAction = async id => {
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
          if (action?.control?.isConnected && !action.control.disabled) action.control.click();
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
  const wheelLabel = page === "queue" ? card._m("Queue wheel","גלגל התור") : page === "sleep_timer" ? card._m("Timer wheel","גלגל הזמנים") : page.startsWith("library_") || page === "media_detail" ? card._m("Library wheel","גלגל הספרייה") : card._m("Screen wheel","גלגל המסך");
  const wheelToggle = dock.querySelector("[data-screen-wheel]");
  wheelToggle.setAttribute("aria-label",wheelLabel); wheelToggle.title = wheelLabel;
  dock.querySelector(".immersive-fan").setAttribute("aria-label",wheelLabel);
  dock.querySelector(".immersive-fan")._refreshAvailableActions?.();
  sheet.querySelector(":scope > .screen-all-actions")?._refreshAvailableActions?.();
  sheet.classList.add("has-screen-dock");
  sheet.dataset.dockPage = page;
}
