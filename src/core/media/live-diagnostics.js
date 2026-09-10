import { isPlayerAvailable } from "../state/players.js";

export function liveDiagnosticRows(card, context = null, refreshed = false) {
  const rows = [];
  const add = (status, en, he, detail = "") => rows.push({status,title:card._m(en,he),detail});
  const status = value => value === true ? "ok" : value === false ? "fail" : "info";
  add(status(card._hass?.connection?.connected),"Home Assistant","Home Assistant");
  add(refreshed ? status(context?.available === true) : "info","Flow Engine","מנוע Flow", context?.version || "");
  const connections = context?.raw?.required_connections || context?.raw?.connections || card._state.engineRequiredConnections || {};
  for (const [key,en,he] of [["music_assistant","Music Assistant","Music Assistant"],["queue_provider","Queue service","שירות התור"],["library_provider","Music library","ספריית המוזיקה"],["search_provider","Music search","חיפוש מוזיקה"]]) {
    const value = connections[key] || connections.connections?.[key];
    add(refreshed && context?.available ? status(value?.ok) : "info",en,he,card._redactDiagnosticText?.(value?.message || "") || "");
  }
  const player = card._getSelectedPlayer?.();
  add(player ? isPlayerAvailable(player) ? "ok" : "fail" : "warn", "Selected player", "הנגן הנבחר", player ? card._playerDisplayName?.(player) || "" : card._m("Choose a player","יש לבחור נגן"));
  const queue = card._state.maQueueState;
  add(queue?.queue_id ? "ok" : "info", "Queue snapshot", "תמונת מצב התור", queue?.queue_id ? `${Number(queue.items) || 0} ${card._m("items","פריטים")}` : card._m("No queue information yet","טרם התקבל מידע על התור"));
  const images=[...(card.shadowRoot?.querySelectorAll("#npArt img") || [])].filter(image=>image.getAttribute("src"));
  const loaded=images.filter(image=>image.complete && image.naturalWidth>0).length;
  add(!images.length ? "info" : loaded === images.length ? "ok" : "warn","Artwork","עטיפות",`${loaded}/${images.length} ${card._m("loaded artwork images","תמונות עטיפה נטענו")}`);
  const uri = card._getCurrentMediaUri?.();
  const wave = [...(card._waveformCache || new Map()).entries()].find(([key])=>uri && key.endsWith(`:${uri}`))?.[1];
  add(wave?.bins ? "ok" : "warn","Audio waveform","גל עוצמת השיר",wave?.bins ? card._m("MA analysis available","ניתוח MA זמין") : card._m("MA has not supplied analysis for this item. Seeking remains available when supported.","MA טרם סיפק ניתוח לפריט הזה. מעבר בזמן זמין כשהנגן תומך בו."));
  const renderMs=card._performanceMetrics?.lastMenuRenderMs;
  add(Number.isFinite(renderMs) ? renderMs > 200 ? "warn" : "ok" : "info","Interface performance","ביצועי הממשק",Number.isFinite(renderMs) ? `${renderMs} ms · ${card._performanceProfile?.() || ""}` : "");
  add(card._localSendspinConnected ? "ok" : card._isLocalSendspinDesired?.() ? "warn" : "info","This device","מכשיר זה",card._localSendspinConnected ? card._m("Connected; this does not verify physical audio output.","מחובר; אין בכך אימות לשמע בפועל.") : card._m("Local player is not connected","הנגן המקומי אינו מחובר"));
  return rows;
}

export function mountLiveDiagnostics(card, body) {
  card._stopLiveDiagnostics?.();
  let stopped=false, timer=null, context=null, refreshed=false;
  const active=()=>!stopped && body.isConnected && card._state.menuPage === "diagnostics";
  const render=()=>{
    if (!active()) return;
    const rows=liveDiagnosticRows(card,context,refreshed);
    card._state.diagnosticsItems=rows;
    body.innerHTML=`<section class="diagnostics-shell"><h2>${card._esc(card._m("System health","מצב המערכת"))}</h2><p role="status">${card._esc(refreshed ? card._m("Updates automatically while this screen is open.","מתעדכן אוטומטית כל עוד המסך פתוח.") : card._m("Checking current connection status…","בודק את מצב החיבורים…"))}</p><button class="settings-pill" data-menu-action="copy_diagnostics">${card._esc(card._m("Copy report","העתק דוח"))}</button><div class="diagnostics-list">${rows.map(row=>card._diagnosticRowHtml(row)).join("")}</div><small>${card._esc(card._m("Green: ready · Yellow: limited · Red: failed · Gray: not verified","ירוק: תקין · צהוב: מוגבל · אדום: תקלה · אפור: לא אומת"))}</small></section>`;
  };
  const update=async()=>{
    if (!active()) return;
    if (globalThis.document?.visibilityState !== "hidden") {
      try { context=await card._refreshHomeiiEngineContext({force:true}); }
      catch { context={available:false}; }
      if (!active()) return;
      refreshed=true;card._state.diagnosticsRunAt=Date.now();render();
    }
    if (active()) timer=setTimeout(update,15000);
  };
  card._stopLiveDiagnostics=()=>{stopped=true;clearTimeout(timer);};
  render();void update();
}
