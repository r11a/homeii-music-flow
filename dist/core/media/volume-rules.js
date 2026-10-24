import { isPlayerAvailable } from "../state/players.js";

export async function renderVolumeRules(card, body) {
  const t=(en,he)=>card._esc(card._m(en,he));
  const page=card._state.menuPage;
  body.innerHTML=`<p role="status">${t("Loading volume limits…","טוען מגבלות ווליום…")}</p>`;
  const result=await card._homeiiEngineCommand("volume_rules/get");
  if (!body.isConnected || card._state.menuPage!==page) return;
  const players=(card._state.players || []).filter(isPlayerAvailable);
  if (!players.length) { body.innerHTML=`<p>${t("No available players","אין נגנים זמינים")}</p>`;return; }
  const rules=result.volume_rules || [];
  body.innerHTML=`<form class="smart-settings"><h2>${t("Volume limits","מגבלות ווליום")}</h2><p>${t("The Engine enforces these limits even when the card is closed.","המנוע אוכף את המגבלות גם כשהכרטיס סגור.")}</p><label>${t("Player","נגן")}<select name="player">${players.map(player=>`<option value="${card._esc(player.entity_id)}">${card._esc(card._playerDisplayName(player))}</option>`).join("")}</select></label><label>${t("Maximum volume (%)","ווליום מרבי (%)")}<input name="volume" type="number" min="0" max="100" required></label><label>${t("Start (optional)","התחלה (אופציונלי)")}<input name="start" type="time"></label><label>${t("End (optional)","סיום (אופציונלי)")}<input name="end" type="time"></label><p>${t("Leave both times empty for an all-day limit. No selected days means every day.","השאר את שתי השעות ריקות למגבלה לאורך כל היום. ללא בחירת ימים — בכל יום.")}</p><div>${card._nightModeDayOptions().map(([day,name])=>`<label>${card._esc(name)}<input type="checkbox" name="day" value="${day}"></label>`).join("")}</div><label>${t("Enabled","פעיל")}<input name="enabled" type="checkbox"></label><label>${t("Temporarily pause limit","השהיה זמנית של המגבלה")}<select name="suspend"><option value="">${t("Keep current state","ללא שינוי")}</option><option value="0">${t("Resume now","חידוש עכשיו")}</option><option value="30">${t("30 minutes","30 דקות")}</option><option value="60">${t("1 hour","שעה")}</option><option value="120">${t("2 hours","שעתיים")}</option></select></label><p data-suspension></p><button type="submit">${t("Save to Engine","שמירה במנוע")}</button><button type="button" data-delete-rule>${t("Remove limit","הסרת מגבלה")}</button><p role="status"></p></form>`;
  const form=body.querySelector("form"), fields=form.elements, status=form.querySelector('[role="status"]');
  const supportsSuspension=card._state.engineCapabilities?.volume_rule_suspension===true;
  fields.suspend.disabled=!supportsSuspension;
  fields.suspend.closest("label").hidden=!supportsSuspension;
  if (players.some(player=>player.entity_id===card._state.selectedPlayer)) fields.player.value=card._state.selectedPlayer;
  const populate=()=>{
    const rule=rules.find(item=>item.player===fields.player.value);
    fields.volume.value=rule?.max_volume ?? 100;fields.start.value=rule?.start_time || "";fields.end.value=rule?.end_time || "";fields.enabled.checked=rule?.enabled ?? true;
    form.querySelectorAll('[name="day"]').forEach(input=>input.checked=rule?.days?.includes(Number(input.value)) || false);
    form.querySelector('[data-delete-rule]').disabled=!rule;
    fields.suspend.value="";
    const until=Date.parse(rule?.suspended_until || "");
    form.querySelector('[data-suspension]').textContent=until>Date.now() ? card._m("Paused until ","מושהה עד ")+new Date(until).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"}) : "";
  };
  populate();fields.player.onchange=populate;
  let busy=false;
  const submit=async(remove=false)=>{
    if (busy || !body.isConnected || card._state.menuPage!==page) return;
    if (!remove && Boolean(fields.start.value)!==Boolean(fields.end.value)) { status.textContent=card._m("Set both times or leave both empty.","בחר שתי שעות או השאר את שתיהן ריקות.");return; }
    const player=fields.player.value;
    busy=true;form.querySelectorAll('button').forEach(button=>button.disabled=true);
    try {
      if (remove) await card._homeiiEngineCommand("volume_rules/delete",{player});
      else await card._homeiiEngineCommand("volume_rules/set",{player,max_volume:Number(fields.volume.value),start_time:fields.start.value,end_time:fields.end.value,enabled:fields.enabled.checked,...(supportsSuspension && fields.suspend.value!=="" ? {suspend_minutes:Number(fields.suspend.value)} : {}),days:[...form.querySelectorAll('[name="day"]:checked')].map(input=>Number(input.value))});
      if (body.isConnected && card._state.menuPage===page) await renderVolumeRules(card,body);
    } catch(error) {status.textContent=card._mediaControlFailureMessage(error);form.querySelectorAll('button').forEach(button=>button.disabled=false);}
    finally {busy=false;}
  };
  form.onsubmit=event=>{event.preventDefault();event.stopPropagation();void submit();};
  form.querySelector('[data-delete-rule]').onclick=()=>submit(true);
}
