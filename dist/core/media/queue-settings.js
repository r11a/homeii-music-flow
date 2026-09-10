// Shared MA preferences. The Engine exposes only supported fields and confirms saves.
const groups = [
  ["Autoplay", "המשך ניגון", "radio", ["autoplay_enabled", "autoplay_mode", "autoplay_playlist"]],
  ["Smart Shuffle", "ערבוב חכם", "shuffle", ["smart_shuffle_enabled", "smart_shuffle_optimize_smart_fades"]],
  ["Transitions", "מעברים בין שירים", "crossfade", ["crossfade_enabled", "crossfade_mode", "crossfade_duration"]],
];
const labels = {
  autoplay_enabled: ["Autoplay by default", "המשך ניגון אוטומטי כברירת מחדל"],
  autoplay_mode: ["Continue playing from", "מקור להמשך הניגון"],
  autoplay_playlist: ["Playlist", "פלייליסט"],
  smart_shuffle_enabled: ["Use listening history when shuffling", "התחשבות בהיסטוריית ההאזנה בערבוב"],
  smart_shuffle_optimize_smart_fades: ["Optimize track order for Smart Fades", "התאמת סדר השירים למעברים חכמים"],
  crossfade_enabled: ["Crossfade by default", "מעבר חלק כברירת מחדל"],
  crossfade_mode: ["Transition style", "סגנון מעבר"],
  crossfade_duration: ["Standard transition duration (seconds)", "משך מעבר רגיל בשניות"],
};
const optionLabels = {
  enabled: ["Enabled", "פעיל"], disabled: ["Disabled", "כבוי"],
  auto: ["Similar music, then your library", "מוזיקה דומה, ובהיעדרה הספרייה שלך"],
  similar: ["Similar music", "מוזיקה דומה"], library: ["Your library", "הספרייה שלך"],
  playlist: ["A selected playlist", "פלייליסט לבחירה"],
  standard_crossfade: ["Standard crossfade", "מעבר חלק רגיל"],
  smart_crossfade: ["Smart Fades", "מעבר חכם — Smart Fades"],
};

export function queueSettingsHtml(card, view) {
  const { entries = {}, playlists = [], can_edit: editable = false } = view;
  const esc = (v) => card._esc(String(v ?? ""));
  const field = (key) => {
    const entry = entries[key];
    if (!entry) return "";
    const label = card._m(...labels[key]);
    const attrs = `data-queue-setting="${key}" aria-label="${esc(label)}" ${entry.read_only || (key === "autoplay_playlist" && view.playlistsUnavailable) ? "disabled" : ""}`;
    let input;
    if (entry.type === "boolean") {
      input = `<input type="checkbox" role="switch" ${attrs} ${entry.value ? "checked" : ""}>`;
    } else if (entry.options?.length || key === "autoplay_playlist") {
      const options = key === "autoplay_playlist"
        ? [{ value: "", title: card._m("Choose a playlist", "בחר פלייליסט") }, ...playlists.map((item) => ({ value: item.uri, title: item.name }))]
        : entry.options;
      if (entry.value && !options.some((option) => option.value === entry.value)) options.push({ value: entry.value, title: card._m("Current playlist", "הפלייליסט הנוכחי") });
      input = `<select class="settings-select" ${attrs}>${options.map((option) => `<option value="${esc(option.value)}" ${option.value === (entry.value ?? "") ? "selected" : ""} ${option.disabled ? "disabled" : ""}>${esc(optionLabels[option.value] ? card._m(...optionLabels[option.value]) : option.title)}</option>`).join("")}</select>`;
    } else {
      input = `<input class="settings-text-input" type="number" ${attrs} min="${entry.range?.[0] ?? 1}" max="${entry.range?.[1] ?? 15}" step="1" value="${esc(entry.value)}">`;
    }
    return `<label class="queue-setting-field ${entry.type === "boolean" ? "is-switch" : ""}" data-setting-row="${key}"><span>${esc(label)}</span>${input}</label>`;
  };
  return `<form class="queue-settings-form">
    <p class="action-hub-note">${esc(card._m("Shared Music Assistant preferences for all players. Per-queue Autoplay and Crossfade buttons remain independent.", "הגדרות Music Assistant משותפות לכל הנגנים. כפתורי המשך הניגון והמעבר החלק בתור מאפשרים שינוי לכל תור בנפרד."))}</p>
    ${!editable ? `<p role="status">${esc(card._m("An administrator can edit these preferences.", "שינוי ההגדרות זמין למנהל המערכת."))}</p>` : ""}
    ${view.playlistsUnavailable ? `<div class="notice open" role="status">${esc(card._m("Playlists could not be loaded. Your current playlist is preserved; other preferences can still be edited.", "הפלייליסטים לא נטענו. הפלייליסט הנוכחי נשמר; אפשר לערוך את שאר ההעדפות."))}<button type="button" class="action-btn" data-menu-action="reload_queue_settings">${esc(card._m("Reload playlists", "טען פלייליסטים מחדש"))}</button></div>` : ""}
    <fieldset ${editable ? "" : "disabled"}>${groups.map(([en, he, icon, keys]) => keys.some((key) => entries[key]) ? `<section class="action-hub-section"><h3>${card._iconSvg(icon)}${esc(card._m(en, he))}</h3><div class="queue-settings-fields">${keys.map(field).join("")}</div></section>` : "").join("")}</fieldset>
    <div class="queue-settings-footer"><button type="button" class="action-btn" data-menu-action="save_queue_settings" ${editable ? "" : "disabled"}>${card._iconSvg("check")}${esc(card._m("Save changes", "שמור שינויים"))}</button><span role="status" data-queue-settings-status></span></div>
  </form>`;
}

export function updateQueueSettingVisibility(form) {
  const value = (key) => form.querySelector(`[data-queue-setting="${key}"]`)?.value;
  const playlist = form.querySelector('[data-setting-row="autoplay_playlist"]');
  const duration = form.querySelector('[data-setting-row="crossfade_duration"]');
  if (playlist) playlist.hidden = value("autoplay_mode") !== "playlist";
  if (duration) duration.hidden = value("crossfade_mode") !== "standard_crossfade";
}

export async function loadQueueSettings(card, body, isCurrent) {
  body.innerHTML = `<div class="notice open" role="status">${card._esc(card._m("Loading playback preferences…", "טוען העדפות ניגון…"))}</div>`;
  try {
    card._queueSettingsLoad ||= Promise.allSettled([
      card._homeiiEngineCommand("queue/settings", {}, { required: true, timeoutMs: 30000 }),
      card._callEngineMaCommand("music/playlists/library_items", { limit: 500 }),
    ]).finally(() => { card._queueSettingsLoad = null; });
    const [settings, library] = await card._queueSettingsLoad;
    if (!isCurrent()) return;
    if (settings.status !== "fulfilled") throw settings.reason;
    if (!settings.value?.entries) throw new Error(card._m("Playback preferences were not returned.", "העדפות הניגון לא התקבלו."));
    const playlistsUnavailable = library.status !== "fulfilled" || !Array.isArray(library.value);
    const view = { ...settings.value, playlistsUnavailable, playlists: playlistsUnavailable ? [] : library.value.filter((item) => item.uri) };
    card._queueSettingsView = view;
    body.innerHTML = queueSettingsHtml(card, view);
    body.querySelector("form")?.addEventListener("submit", (event) => event.preventDefault());
    updateQueueSettingVisibility(body);
  } catch (error) {
    if (isCurrent()) body.innerHTML = `<div class="notice open" role="alert">${card._esc(card._mediaControlFailureMessage(error))}</div><button class="action-btn" data-menu-action="reload_queue_settings">${card._esc(card._m("Retry", "נסה שוב"))}</button>`;
  }
}

export function queueSettingsChanges(form, entries) {
  const changes = {};
  for (const input of form.querySelectorAll("[data-queue-setting]")) {
    const key = input.dataset.queueSetting;
    if (input.disabled || !entries[key]) continue;
    const value = input.type === "checkbox" ? input.checked : input.type === "number" ? Number(input.value) : input.value;
    if (value !== (entries[key].value ?? "")) changes[key] = value;
  }
  return changes;
}

export async function saveQueueSettings(card) {
  if (card._queueSettingsSaving) return;
  const form = card.$("mobileMenuBody")?.querySelector(".queue-settings-form");
  const view = card._queueSettingsView;
  if (!form || !view?.can_edit || !form.reportValidity()) return;
  const values = queueSettingsChanges(form, view.entries);
  if (!Object.keys(values).length) return;
  card._queueSettingsSaving = true;
  const controls = [...form.querySelectorAll("input,select,button")];
  const disabled = controls.map((input) => input.disabled);
  controls.forEach((input) => { input.disabled = true; });
  const status = form.querySelector("[data-queue-settings-status]");
  status.textContent = card._m("Saving…", "שומר…");
  try {
    const result = await card._homeiiEngineCommand("queue/settings", { values }, { required: true, timeoutMs: 60000 });
    if (!result?.saved || Object.entries(values).some(([key, value]) => result.entries?.[key]?.value !== value)) throw new Error(card._m("The save was not confirmed. Reload to check the current values.", "השמירה לא אושרה. טען מחדש כדי לבדוק את הערכים הנוכחיים."));
    view.entries = result.entries;
    status.textContent = card._m("Saved in Music Assistant", "נשמר ב־Music Assistant");
  } catch (error) {
    status.textContent = card._mediaControlFailureMessage(error);
    card._toastError(status.textContent);
  } finally {
    card._queueSettingsSaving = false;
    controls.forEach((input, index) => { input.disabled = disabled[index]; });
  }
}
