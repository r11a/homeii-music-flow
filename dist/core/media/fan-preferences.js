import { actionSymbolHtml, actionIconSvg } from "./action-menu.js";

const storageKey = card => card._lsKey?.("homeii_music_flow_fan_preferences") || "homeii_music_flow_fan_preferences";
const sharedKey = card => `${card._state?.engineInstanceId || ""}:${card._state?.engineProfileId || ""}:${card._hass?.user?.id || ""}`;
export function fanPreference(card, context) {
  const shared = card._fanSharedPreferences || {};
  let local = {};
  try { local = JSON.parse(localStorage.getItem(storageKey(card)) || "{}" ); } catch { /* Storage may be disabled. */ }
  return local[context] || shared.user?.[context] || shared.global?.[context] || {};
}
export async function loadFanPreferences(card) {
  const identity = sharedKey(card);
  if (card._fanPreferencesIdentity !== identity) {
    card._fanPreferencesIdentity = identity; card._fanSharedPreferences = {}; card._fanPreferencesLoadedAt = 0;
  }
  if (!card._state?.engineCapabilities?.wheel_preferences || card._fanPreferencesLoading || Date.now() - (card._fanPreferencesLoadedAt || 0) < 30000) return;
  card._fanPreferencesLoading = true;
  try {
    const result = await card._homeiiEngineCommand("wheels/get", {});
    if (sharedKey(card) !== identity) return;
    card._fanSharedPreferences = result;
    card._fanPreferencesLoadedAt = Date.now();
    card.shadowRoot?.querySelectorAll(".immersive-fan,.fan-catalogue").forEach(node => node._refreshAvailableActions?.());
  } catch { card._fanPreferencesLoadedAt = Date.now(); }
  finally { card._fanPreferencesLoading = false; }
}
export function fanActionCategory(action) {
  const context = String(action.id || "").startsWith("control:") ? action.id.split(":")[1] : "";
  if (["players","players_active","group","group_volume","transfer"].includes(context)) return "players";
  if (["sleep_timer","announcements","lighting","smart","playback_stats","volume_rules","night_preferences","system_screensaver"].includes(context)) return "smart";
  if (context.startsWith("library_") || ["discovery","recommendations","favorite_radios","saved_playlists"].includes(context)) return "library";
  if (action.player || /^(control:players:|players$|group$|group_volume$|transfer$|this_device$|local_device$|player_preferences$)/.test(action.id)) return "players";
  if (/^(timer(?::|$)|sleep_timer$|announcements$|lighting$|smart$|playback_stats$|volume_rules$|night_preferences$|system_screensaver$)/.test(action.id)) return "smart";
  if (action.genre || /^(genre:|library_|discovery$|favorite_radios$|quick_search$|recommendations$|history$|music_flow$|saved_playlists$)/.test(action.id)) return "library";
  if (/settings|preferences|edit|theme|diagnostics|studio|home/.test(action.id)) return "settings";
  return "playback";
}
const categoryLabels = {
  playback:["Playback & queue","ניגון ותור"], players:["Players & groups","נגנים וקבוצות"],
  library:["Browse music","ספריית מוזיקה"], smart:["Smart listening","האזנה חכמה"], settings:["Settings & display","הגדרות ותצוגה"],
};
const defaultOrder = ["play","pause","queue","lyrics","like","shuffle","repeat","track_radio","ai_radio",
  "players","group","group_volume","transfer","this_device","local_device","player_preferences",
  "quick_search","library_search","recommendations","history","discovery","music_flow","favorite_radios",
  "library_playlists","library_albums","library_artists","library_tracks","library_radio","library_podcasts","library_liked",
  "smart","announcements","timer","sleep_timer","lighting","playback_stats","studio","home","preferences","queue_settings","settings"];
export function defaultFanRank(action) {
  if (action.player) return defaultOrder.indexOf("players") + 0.5;
  const index = defaultOrder.indexOf(action.id);
  return index < 0 ? 50 : index;
}
export function orderedFanActions(actions, preference = {}, selectedOnly = false) {
  const unique = [...new Map(actions.map(action => [action.id, action])).values()];
  const order = Array.isArray(preference.order) ? preference.order : [];
  const rank = new Map(order.map((id, index) => [id, index]));
  const hidden = new Set(Array.isArray(preference.hidden) ? preference.hidden : []);
  return unique.filter(action => !selectedOnly || !hidden.has(action.id)).sort((a,b) =>
    (rank.get(a.id) ?? order.length) - (rank.get(b.id) ?? order.length) ||
    (rank.has(a.id) || rank.has(b.id) ? 0 : defaultFanRank(a) - defaultFanRank(b)));
}
export function preferredFanPages(card, context, pages) {
  void loadFanPreferences(card);
  return [orderedFanActions(pages.flat(), fanPreference(card, context), true)];
}

// One catalogue serves both the complete action screen and the configurable wheel.
export function openFanCatalogue(card, host, context, getActions, dispatch, onSave = () => {}) {
  host.querySelector(":scope > .fan-catalogue")?.remove();
  const panel = document.createElement("section");
  panel.className = "screen-all-actions fan-catalogue";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-label", card._m("All actions", "כל האפשרויות"));
  let editing = false, draft = null, dragged = null, rendered = "", scope = "device", saving = false;
  const esc = value => card._esc(value);
  const label = (en,he) => esc(card._m(en,he));
  const close = () => panel.remove();
  const render = () => {
    const preference = draft || fanPreference(card, context);
    const ordered = orderedFanActions(getActions(), preference);
    const actions = editing ? ordered : Object.keys(categoryLabels).flatMap(category => ordered.filter(action => fanActionCategory(action) === category));
    let lastCategory = null;
    const categoryHeading = action => {
      if (editing) return "";
      const category = fanActionCategory(action);
      if (lastCategory === category) return "";
      lastCategory = category;
      return `<h3 class="fan-catalogue-category">${label(...categoryLabels[category])}</h3>`;
    };
    const focused = panel.querySelector("[data-catalogue-action]:focus")?.closest("[data-catalogue-id]")?.dataset.catalogueId;
    const html = `<header><button data-catalogue-back aria-label="${label("Back","חזרה")}">${actionIconSvg(card,"back")}</button><h2>${label("All actions","כל האפשרויות")}</h2><button data-catalogue-edit>${editing ? label("Save","אישור") : label("Edit wheel","עריכת המניפה")}</button></header>${editing ? `<p>${label("Choose wheel shortcuts. Drag the handle to reorder, or use the arrow buttons.","בחר מה יופיע במניפה. גרור את הידית לסידור, או השתמש בכפתורי החצים.")}</p>` : ""}<div class="fan-catalogue-list">${actions.map(action => `${categoryHeading(action)}<article data-catalogue-id="${esc(action.id)}">${editing ? `<input type="checkbox" data-catalogue-check aria-label="${esc(action.label)}" ${preference.hidden?.includes(action.id) ? "" : "checked"}>` : ""}<button data-catalogue-action ${editing ? "disabled" : ""}>${actionSymbolHtml(card,action)}<span>${esc(action.label)}</span></button>${editing ? `<button draggable="true" data-catalogue-drag aria-label="${label("Drag","גרירה")}: ${esc(action.label)}">⠿</button><button data-catalogue-move="-1" aria-label="${label("Move up","העבר למעלה")}">↑</button><button data-catalogue-move="1" aria-label="${label("Move down","העבר למטה")}">↓</button>` : ""}</article>`).join("")}</div>`;
    if (html !== rendered) {
      panel.innerHTML = html; rendered = html;
      if (editing && card._state?.engineCapabilities?.wheel_preferences) {
        const control = document.createElement("label");
        control.className = "fan-preference-scope";
        control.innerHTML = `${label("Save for", "שמירה עבור")} <select data-catalogue-scope><option value="device">${label("This device", "מכשיר זה")}</option><option value="user">${label("My user on all devices", "המשתמש שלי בכל המכשירים")}</option>${card._hass?.user?.is_admin ? `<option value="global">${label("Everyone (default)", "כולם (ברירת מחדל)")}</option>` : ""}</select>`;
        panel.querySelector("header").after(control);
        control.querySelector("select").value = scope;
      }
      if (focused) {
        const target = [...panel.querySelectorAll("[data-catalogue-id]")].find(row => row.dataset.catalogueId === focused)?.querySelector("[data-catalogue-action]");
        (target || panel.querySelector("[data-catalogue-back]"))?.focus({preventScroll:true});
      }
    }
    panel.classList.toggle("is-editing",editing);
  };
  const move = (from, to) => {
    const order = orderedFanActions(getActions(), draft).map(a => a.id);
    const source = order.indexOf(from), target = order.indexOf(to);
    if (source < 0 || target < 0 || source === target) return;
    order.splice(source,1); order.splice(target,0,from); draft.order = [...order,...(draft.order || []).filter(id=>!order.includes(id))]; render();
  };
  panel.onclick = async event => {
    if (event.target.closest("[data-catalogue-back]")) { close(); return; }
    if (event.target.closest("[data-catalogue-edit]")) {
      if (saving) return;
      if (!editing) { draft = { ...fanPreference(card,context) }; draft.hidden = [...(draft.hidden || [])]; editing = true; render(); return; }
      try {
        saving = true;
        panel.querySelector("[data-catalogue-edit]").disabled = true;
        const stored = JSON.parse(localStorage.getItem(storageKey(card)) || "{}");
        if (scope === "device") stored[context] = draft;
        else {
          card._fanSharedPreferences = await card._homeiiEngineCommand("wheels/set", {scope, context, preference:draft});
          delete stored[context];
        }
        localStorage.setItem(storageKey(card),JSON.stringify(stored));
        editing = false; draft = null; onSave(); render();
      } catch { card._toastError(card._m("Could not save wheel settings.","לא ניתן לשמור את הגדרות המניפה.")); }
      finally { saving = false; const button = panel.querySelector("[data-catalogue-edit]"); if (button) button.disabled = false; }
      return;
    }
    const row = event.target.closest("[data-catalogue-id]"); if (!row) return;
    const id = row.dataset.catalogueId;
    const direction = event.target.closest("[data-catalogue-move]");
    if (direction) { const order = orderedFanActions(getActions(),draft); move(id,order[order.findIndex(a => a.id === id) + Number(direction.dataset.catalogueMove)]?.id); return; }
    if (!editing && event.target.closest("[data-catalogue-action]")) {
      if (!getActions().some(a => a.id === id)) { render(); return; }
      close(); try { await dispatch(id); } catch(error) { card._toastError(card._mediaControlFailureMessage(error)); }
    }
  };
  panel.onchange = event => {
    if (event.target.matches("[data-catalogue-scope]")) { scope = event.target.value; return; }
    if (!event.target.matches("[data-catalogue-check]")) return;
    const id = event.target.closest("[data-catalogue-id]").dataset.catalogueId;
    draft.hidden = [...new Set(event.target.checked ? draft.hidden.filter(key => key !== id) : [...draft.hidden,id])];
  };
  panel.ondragstart = event => { dragged = event.target.closest("[data-catalogue-id]")?.dataset.catalogueId; event.dataTransfer?.setData("text/plain",dragged || ""); };
  panel.ondragover = event => { if (editing && dragged) event.preventDefault(); };
  panel.ondrop = event => { event.preventDefault(); if (editing && dragged) move(dragged,event.target.closest("[data-catalogue-id]")?.dataset.catalogueId); dragged = null; };
  panel.ondragend = () => { dragged = null; };
  let touchDrag = null;
  panel.onpointerdown = event => {
    if (event.pointerType === "mouse" || !event.target.closest("[data-catalogue-drag]")) return;
    touchDrag = {id:event.target.closest("[data-catalogue-id]").dataset.catalogueId,pointer:event.pointerId};
    panel.setPointerCapture?.(event.pointerId); event.preventDefault();
  };
  panel.onpointerup = event => {
    if (!touchDrag || touchDrag.pointer !== event.pointerId) return;
    const row = [...panel.querySelectorAll("[data-catalogue-id]")].find(node => {const box=node.getBoundingClientRect(); return event.clientY >= box.top && event.clientY <= box.bottom;});
    if (row) move(touchDrag.id,row.dataset.catalogueId);
    touchDrag = null;
  };
  panel.onpointercancel = () => { touchDrag = null; };

  panel._refreshAvailableActions = () => { if (!editing) render(); };
  host.append(panel); render();
  return panel;
}
