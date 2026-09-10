import { actionIconSvg } from "./action-menu.js";
// Small views backed by the existing Engine and player controls.
export async function refreshArtworkLighting(card, force = false) {
  if (!card._state.engineCapabilities?.artwork_lighting) return null;
  if (card._lightingRead) return card._lightingRead;
  if (!force && Date.now() - (card._lightingReadAt || 0) < 5000) return card._state.artworkLighting;
  card._lightingRead = card._homeiiEngineCommand("lighting/get").then(snapshot => {
    card._state.artworkLighting = snapshot;
    card._lightingReadAt = Date.now();
    return snapshot;
  }).finally(() => { card._lightingRead = null; });
  return card._lightingRead;
}

export async function setArtworkLighting(card, enabled, {useLocalMapping = false} = {}) {
  const player = card._state.selectedPlayer;
  const snapshot = await refreshArtworkLighting(card, true);
  const rule = snapshot?.rules?.[player];
  const lights = useLocalMapping || !rule ? card._ambientLightEntitiesForPlayer({entity_id:player}) : rule.lights;
  const result = await card._homeiiEngineCommand("lighting/set", {
    player, lights, enabled,
    brightness:card._ambientLightBrightness(), transition:card._ambientLightTransition(), cooldown:Math.max(1,card._ambientLightCooldown()),
  });
  card._state.artworkLighting = result;
  card._lightingReadAt = Date.now();
  return result;
}

export async function renderListeningTools(card, body, page) {
  const t = (en, he) => card._esc(card._m(en, he));
  if (page === "group_volume") {
    const template = document.createElement("template");
    template.innerHTML = card._groupMenuHtml();
    const volume = template.content.querySelector(".group-volume-card");
    body.replaceChildren();
    if (volume) { volume.open = true; body.append(volume); }
    const selected = card._getSelectedPlayer();
    if (card._groupVolumeSessionOwner !== selected?.entity_id) {
      card._groupVolumeSessionOwner = selected?.entity_id; card._groupVolumeSessionMembers = new Set();
    }
    card._playerGroupMemberIds(selected).forEach(id => card._groupVolumeSessionMembers.add(id));
    const grid = template.content.querySelector(".players-premium-grid");
    if (grid) {
      [...grid.children].forEach(row => {
        const input = row.querySelector("[data-menu-group-player]");
        if (!card._groupVolumeSessionMembers.has(input?.dataset.menuGroupPlayer)) row.remove();
        else if (input.dataset.groupOwner === "true") input.disabled = true;
      });
      body.append(grid);
    }
    if (!volume && !grid?.children.length) body.innerHTML = `<div class="state-box">${t("No active group", "אין קבוצה פעילה")}</div>`;
    return;
  }
  if (page === "smart") {
    const entries = [
      ["announcements","announcement","Announce","כריזה"],
      ["sleep_timer","timer","Timers","טיימרים"],
      ["sleep_timer","schedule_add","Schedules","תזמונים"],
      ["playback_stats","stats","Insights","נתוני האזנה"],
      ["lighting","lightbulb","Lighting","תאורה"],
      ["night_preferences","moon","Night","לילה"],
      ["system_screensaver","clock","Screensaver","שומר מסך"],
      ["diagnostics","info","Diagnostics","אבחון"],
      ...(card._state.engineCapabilities?.volume_rules ? [["volume_rules","volume","Volume limits","מגבלות ווליום"]] : []),
      ...(card._state.engineCapabilities?.saved_playlists ? [["saved_playlists","playlist","Engine playlists","רשימות במנוע"]] : []),
    ].filter(([id]) => {
      const capability={lighting:"artwork_lighting",night_preferences:"interface_preferences",announcements:"announcements",sleep_timer:"timers",playback_stats:"playback_statistics",system_screensaver:"system_screensaver",volume_rules:"volume_rules",saved_playlists:"saved_playlists"}[id];
      return !capability || card._state.engineCapabilities?.[capability] === true;
    });
    body.innerHTML = `<section class="smart-hub"><div class="smart-hub-grid">${entries.map(([id,icon,en,he]) => `<button data-menu-nav="${id}">${actionIconSvg(card,icon)}<span>${t(en,he)}</span></button>`).join("")}</div></section>`;
    return;
  }
  if (page === "night_preferences") {
    body.innerHTML = `<div role="status">${t("Loading…","טוען…")}</div>`;
    try {
      const values=await card._homeiiEngineCommand("interface/get");
      if(card._state.menuPage !== page || !body.isConnected) return;
      applyInterfacePreferences(card,values);card._state.engineInterfacePreferences=values;
      const mode=card._mobileNightMode();
      body.innerHTML=`<form class="smart-settings"><h2>${t("Night display","תצוגת לילה")}</h2><label>${t("Mode","מצב")}<select name="mode">${["off","on","auto"].map(value=>`<option value="${value}" ${mode===value?"selected":""}>${t({off:"Off",on:"On",auto:"Automatic"}[value],{off:"כבוי",on:"פעיל",auto:"אוטומטי"}[value])}</option>`).join("")}</select></label><label>${t("Start","התחלה")}<input name="start" type="time" value="${card._esc(card._state.mobileNightModeStart || "22:00")}" required></label><label>${t("End","סיום")}<input name="end" type="time" value="${card._esc(card._state.mobileNightModeEnd || "06:00")}" required></label>${card._nightModeDayOptions().map(([day,name])=>`<label>${card._esc(name)}<input name="day" type="checkbox" value="${day}" ${card._nightModeDays().includes(day)?"checked":""}></label>`).join("")}<button type="submit">${t("Save to Engine","שמירה במנוע")}</button><p role="status"></p></form>`;
      const form=body.querySelector("form");form.onsubmit=async event=>{
        event.preventDefault();event.stopPropagation();const button=form.querySelector('[type="submit"]');button.disabled=true;
        try {
          const result=await card._homeiiEngineCommand("interface/set",{night_mode:form.elements.mode.value,night_start:form.elements.start.value,night_end:form.elements.end.value,night_days:[...form.querySelectorAll('[name="day"]:checked')].map(input=>Number(input.value))});
          applyInterfacePreferences(card,result);card._state.engineInterfacePreferences=result;card._persistMobileAppearance();form.querySelector('[role="status"]').textContent=card._m("Saved in the Engine","נשמר במנוע");
        } catch(error){form.querySelector('[role="status"]').textContent=card._mediaControlFailureMessage(error);}
        finally{button.disabled=false;}
      };
    } catch(error){if(card._state.menuPage === page && body.isConnected) body.innerHTML=`<div role="alert">${card._esc(card._mediaControlFailureMessage(error))}</div>`;}
    return;
  }
  if (page === "system_screensaver") {
    body.innerHTML = `<div role="status">${t("Loading…","טוען…")}</div>`;
    try {
      const result = await card._homeiiEngineCommand("screensaver/get");
      if (card._state.menuPage !== page || !body.isConnected) return;
      const config = result.config || {};
      body.innerHTML = `<form class="smart-settings"><h2>${t("System screensaver","שומר מסך מערכתי")}</h2><label><input name="enabled" type="checkbox" ${config.enabled ? "checked" : ""}>${t("Enabled","פעיל")}</label><label>${t("Idle timeout (seconds)","זמן המתנה בשניות")}<input name="timeout_seconds" type="number" min="15" max="3600" value="${Number(config.timeout_seconds) || 90}" required></label><label>${t("Mode","תצוגה")}<select name="mode">${["auto","clock","lyrics"].map(mode=>`<option value="${mode}" ${config.mode === mode ? "selected" : ""}>${t({auto:"Automatic",clock:"Clock",lyrics:"Lyrics"}[mode],{auto:"אוטומטי",clock:"שעון",lyrics:"מילים"}[mode])}</option>`).join("")}</select></label><label>${t("Message","הודעה")}<input name="message" maxlength="120" value="${card._esc(config.message || "")}"></label><button type="submit">${t("Save to Engine","שמירה במנוע")}</button><p role="status"></p></form>`;
      const form = body.querySelector("form");
      const saveButton=form.querySelector('[type="submit"]');
      saveButton.insertAdjacentHTML("beforebegin", `<label>${t("Clock style","סגנון שעון")}<select name="clock_mode"><option value="digital" ${config.clock_mode!=="analog"?"selected":""}>${t("Digital","דיגיטלי")}</option><option value="analog" ${config.clock_mode==="analog"?"selected":""}>${t("Analog","אנלוגי")}</option></select></label><label>${t("Show artwork","הצגת עטיפה")}<input name="show_artwork" type="checkbox" ${config.show_artwork!==false?"checked":""}></label><label>${t("Show lyrics automatically while playing","מילים אוטומטית בזמן ניגון")}<input name="auto_lyrics_when_playing" type="checkbox" ${config.auto_lyrics_when_playing!==false?"checked":""}></label>`);
      if(card._state.engineCapabilities?.system_screensaver_show) {
        const show=document.createElement("button");show.type="button";
        show.textContent=card._m("Show on connected screens","הצגה במסכים המחוברים");
        show.onclick=async()=>{
          if(show.disabled)return;show.disabled=true;
          try {await card._homeiiEngineCommand("screensaver/show");form.querySelector('[role="status"]').textContent=card._m("Request sent to connected screens","הבקשה נשלחה למסכים המחוברים");}
          catch(error){form.querySelector('[role="status"]').textContent=card._mediaControlFailureMessage(error);}
          finally{show.disabled=false;}
        };
        form.append(show);
      }
      form.onsubmit = async event => {
        event.preventDefault(); event.stopPropagation();
        const button=form.querySelector('[type="submit"]'); if(button.disabled)return;button.disabled=true;
        try { await card._homeiiEngineCommand("screensaver/set",{enabled:form.elements.enabled.checked,timeout_seconds:Number(form.elements.timeout_seconds.value),mode:form.elements.mode.value,message:form.elements.message.value,clock_mode:form.elements.clock_mode.value,show_artwork:form.elements.show_artwork.checked,auto_lyrics_when_playing:form.elements.auto_lyrics_when_playing.checked}); form.querySelector('[role="status"]').textContent=card._m("Saved in the Engine","נשמר במנוע"); }
        catch(error){ form.querySelector('[role="status"]').textContent=card._mediaControlFailureMessage(error); }
        finally {button.disabled=false;}
      };
    } catch(error){if(card._state.menuPage === page && body.isConnected) body.innerHTML=`<div role="alert">${card._esc(card._mediaControlFailureMessage(error))}</div>`;}
    return;
  }
  if (page === "recommendations") {
    body.innerHTML = `<div class="state-box" role="status">${t("Loading recommendations…","טוען המלצות…")}</div>`;
    try {
      const raw = await card._loadRecommendationFolders();
      if (card._state.menuPage !== page || !body.isConnected) return;
      const entries = card._flattenNativeRecommendations(raw,100);
      const sections = new Map();
      for (const item of entries) { const key = item.folder_name || card._m("For you","בשבילך"); if (!sections.has(key)) sections.set(key,[]); sections.get(key).push(item); }
      body.innerHTML = `<section class="recommendation-home"><h2>${t("Made for your listening","המוזיקה שלך, מחדש")}</h2>${[...sections].map(([name,items]) => `<section><h3>${card._esc(name)}</h3><div class="recommendation-shelf">${items.map(item => `<button data-media-uri="${card._esc(item.uri)}" data-media-type="${card._esc(item.media_type)}" data-media-name="${card._esc(item.name)}" data-media-image="${card._esc(item.image || "")}"><span class="recommendation-art">${item.image ? card._imgHtml(item.image,"",{loading:"lazy",fallbackIcon:"album"}) : actionIconSvg(card,"album")}</span><strong>${card._esc(item.name)}</strong><span>${card._esc(item.artist || item.provider_label || "")}</span></button>`).join("")}</div></section>`).join("") || `<p>${t("No recommendations returned by Music Assistant yet.","Music Assistant עדיין לא החזיר המלצות.")}</p>`}</section>`;
    } catch(error) { if (card._state.menuPage === page && body.isConnected) body.innerHTML = `<div role="alert">${card._esc(card._mediaControlFailureMessage(error))}</div>`; }
    return;
  }
  if (page === "lighting") {
    if (card._state.engineCapabilities?.artwork_lighting) {
      body.innerHTML = `<div class="state-box" role="status">${t("Loading lighting settings…", "טוען הגדרות תאורה…")}</div>`;
      try { await refreshArtworkLighting(card, true); }
      catch (error) { if (card._state.menuPage === page && body.isConnected) body.innerHTML = `<div role="alert">${card._esc(card._mediaControlFailureMessage(error))}</div>`; return; }
      if (card._state.menuPage !== page || !body.isConnected) return;
    }
    const enabled = card._ambientLightEnabled() ? "on" : "off";
    const rule = card._state.artworkLighting?.rules?.[card._state.selectedPlayer];
    const lights = rule?.lights || card._ambientLightEntitiesForPlayer();
    body.innerHTML = `<section class="settings-group listening-lighting"><h2>${t("Follow the music", "תאורה בעקבות המוזיקה")}</h2><p>${card._state.engineCapabilities?.artwork_lighting ? t("The Engine follows artwork colors even when this card is closed.", "המנוע עוקב אחר צבעי העטיפה גם כשהכרטיס סגור.") : t("Your configured lights follow artwork colors while this card is open.", "התאורה עוקבת אחר צבעי העטיפה כשהכרטיס פתוח.")}</p><p>${lights.map(light=>card._esc(card._hass?.states?.[light]?.attributes?.friendly_name || light)).join(" · ")}</p><div class="settings-pills">${card._settingsPill(card._m("Enabled", "פעיל"), "on", enabled, "data-setting-ambient-light")}${card._settingsPill(card._m("Disabled", "כבוי"), "off", enabled, "data-setting-ambient-light")}</div></section>`;
    if (card._state.engineCapabilities?.artwork_lighting) {
      const player = card._state.selectedPlayer;
      const status = card._state.artworkLighting?.status?.[player];
      const availableLights = Object.entries(card._hass?.states || {}).filter(([id,state]) => id.startsWith("light.") && (state.attributes?.supported_color_modes || []).some(mode=>["rgb","rgbw","rgbww","hs","xy"].includes(mode)));
      const form = document.createElement("form"); form.className="smart-settings";
      form.innerHTML = `<h3>${t("Lights assigned to this player","תאורה המשויכת לנגן")}</h3>${availableLights.map(([id,state])=>`<label><span>${card._esc(state.attributes.friendly_name || id)}</span><input type="checkbox" name="light" value="${card._esc(id)}" ${lights.includes(id)?"checked":""}></label>`).join("")}<label>${t("Maximum brightness (%)","עוצמת תאורה מרבית (%)")}<input name="brightness" type="number" min="1" max="100" value="${Number(rule?.brightness) || card._ambientLightBrightness()}" required></label><label>${t("Transition (seconds)","מעבר בשניות")}<input name="transition" type="number" min="0" max="120" value="${Number(rule?.transition ?? card._ambientLightTransition())}" required></label><button type="submit">${t("Save mapping to Engine","שמירת שיוך במנוע")}</button><p role="status">${status?.updated_at ? `${t("Last update","עדכון אחרון")}: ${card._esc(status.updated_at)} · ${card._esc(status.media_title || "")} · ${card._esc(status.state)}` : t("No confirmed lighting update yet","אין עדיין עדכון תאורה מאומת")}</p>`;
      body.append(form);
      form.onsubmit = async event => {
        event.preventDefault(); event.stopPropagation();
        const button=form.querySelector('[type="submit"]');button.disabled=true;
        try {
          const nextLights=[...form.querySelectorAll('[name="light"]:checked')].map(input=>input.value);
          const result=await card._homeiiEngineCommand("lighting/set",{player,lights:nextLights,enabled:!!rule?.enabled && nextLights.length>0,brightness:Number(form.elements.brightness.value),transition:Number(form.elements.transition.value),cooldown:rule?.cooldown || 8});
          card._state.artworkLighting=result;card._lightingReadAt=Date.now();
          form.querySelector('[role="status"]').textContent=card._m("Mapping saved in the Engine","השיוך נשמר במנוע");
        } catch(error){form.querySelector('[role="status"]').textContent=card._mediaControlFailureMessage(error);}
        finally{button.disabled=false;}
      };
    }
    return;
  }
  if (page === "favorite_radios") {
    body.innerHTML = `<div class="state-box" role="status">${t("Loading favorite stations…", "טוען תחנות מועדפות…")}</div>`;
    try {
      const stations = await card._fetchLibrary("radio", "sort_name", 250, true);
      if (card._state.menuPage !== page || !body.isConnected) return;
      body.innerHTML = card._mediaItemsListHtml(stations, "radio", {librarySkin:true}) || `<div class="state-box">${t("No favorite radio stations yet", "אין עדיין תחנות רדיו מועדפות")}</div>`;
    } catch (error) {
      if (card._state.menuPage === page && body.isConnected) body.innerHTML = `<div class="state-box" role="alert">${card._esc(card._mediaControlFailureMessage(error))}</div>`;
    }
    return;
  }
  body.innerHTML = `<div class="state-box" role="status">${t("Loading listening statistics…", "טוען סטטיסטיקות האזנה…")}</div>`;
  try {
    const stats = await card._homeiiEngineGetPlaybackStats();
    if (card._state.menuPage !== page || !body.isConnected) return;
    if (!stats || !Number.isFinite(Number(stats.today_minutes))) throw new Error(card._m("Listening statistics are unavailable.", "סטטיסטיקות האזנה אינן זמינות."));
    const number = value => card._esc(Number.isFinite(Number(value)) ? Math.max(0, Number(value)).toLocaleString(undefined, {maximumFractionDigits:1}) : "—");
    const top = stats.top_player_today;
    const leader = top?.friendly_name || top?.entity_id;
    body.innerHTML = `<section class="listening-stats"><h2>${t("Listening today", "ההאזנה היום")}</h2><p>${card._esc(stats.day || "")}</p><div class="listening-stats-summary"><div><strong>${number(stats.today_minutes)}</strong><span>${t("Minutes", "דקות")}</span></div><div><strong>${number(stats.today_sessions)}</strong><span>${t("Sessions", "הפעלות")}</span></div></div>${leader ? `<div class="listening-stats-leader"><span>${t("Most active player today", "הנגן הפעיל ביותר היום")}</span><strong>${card._esc(leader)}</strong></div>` : ""}${(Array.isArray(stats.players_today) ? stats.players_today : []).map(player => `<div class="listening-stats-row"><span>${card._esc(player.friendly_name || player.entity_id)}</span><strong>${number(player.minutes)} ${t("min", "דק׳")}</strong></div>`).join("")}<p>${t("Totals are measured across players and may include simultaneous playback.", "הסיכום נמדד על פני הנגנים ועשוי לכלול ניגון מקביל.")}</p></section>`;
  } catch (error) {
    if (card._state.menuPage === page && body.isConnected) body.innerHTML = `<div class="state-box" role="alert">${card._esc(card._mediaControlFailureMessage(error))}</div>`;
  }
}

export function applyInterfacePreferences(card, values = {}) {
  if (values.night_mode !== undefined) card._state.mobileNightMode = values.night_mode;
  if (values.night_start !== undefined) card._state.mobileNightModeStart = values.night_start;
  if (values.night_end !== undefined) card._state.mobileNightModeEnd = values.night_end;
  if (Array.isArray(values.night_days)) card._state.mobileNightModeDays = [...values.night_days];
}
export async function saveNightPreferences(card, previous = {}) {
  if (!card._state.engineCapabilities?.interface_preferences) return true;
  try {
    const result = await card._homeiiEngineCommand("interface/set", {night_mode:card._mobileNightMode(),night_start:card._state.mobileNightModeStart,night_end:card._state.mobileNightModeEnd,night_days:card._nightModeDays()});
    card._state.engineInterfacePreferences = result;
    return true;
  } catch(error) {
    applyInterfacePreferences(card,previous);
    card._toastError(card._mediaControlFailureMessage(error)); return false;
  }
}

