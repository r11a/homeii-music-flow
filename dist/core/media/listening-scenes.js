import { isPlayerAvailable } from "../state/players.js";

export async function renderListeningScenes(card, body) {
  const page=card._state.menuPage, t=(en,he)=>card._esc(card._m(en,he));
  const active=()=>body.isConnected && card._state.menuPage===page;
  body.innerHTML=`<p role="status">${t("Loading scenes…","טוען סצנות…")}</p>`;
  try {
    const scenes=await card._homeiiEngineCommand("scenes",{action:"list"});
    if(!active()) return;
    const players=(card._state.players || []).filter(isPlayerAvailable);
    const admin=card._hass?.user?.is_admin===true;
    const playerOptions=players.map(player=>`<option value="${card._esc(player.entity_id)}">${card._esc(card._playerDisplayName(player))}</option>`).join("");
    body.innerHTML=`<section class="smart-hub listening-scenes"><p>${t("Your music, rooms, volume and artwork lighting — one action, saved in the Engine.","המוזיקה, החדרים, הווליום ותאורת העטיפה — בפעולה אחת, שמורה במנוע.")}</p><div class="scene-list">${scenes.map(scene=>`<article class="scene-tile"><div><strong>${card._esc(scene.name)}</strong><p>${card._esc((players.some(p=>p.entity_id===scene.player) ? card._playerDisplayName(players.find(p=>p.entity_id===scene.player)) : scene.player))} · ${scene.members.length+1} ${t("players","נגנים")}${scene.volume==null?"":` · ${scene.volume}%`}</p><small>${t("Automation ID","מזהה לאוטומציה")}: <code>${card._esc(scene.id)}</code></small></div><div class="scene-actions"><button data-run-scene="${card._esc(scene.id)}">${card._iconSvg("play")} ${t("Start","הפעל")}</button>${admin?`<button data-edit-scene="${card._esc(scene.id)}">${t("Edit","עריכה")}</button><button data-delete-scene="${card._esc(scene.id)}">${t("Delete","מחיקה")}</button>`:""}</div></article>`).join("") || `<p>${t("No saved scenes yet.","אין עדיין סצנות שמורות.")}</p>`}</div><p role="status" data-scene-status></p>${admin?`<details class="scene-editor"><summary>${t("Create a scene","יצירת סצנה")}</summary><form class="smart-settings"><input type="hidden" name="scene_id"><label>${t("Name","שם")}<input name="scene_name" maxlength="120" required></label><label>${t("Lead player","נגן מוביל")}<select name="player" required>${playerOptions}</select></label><fieldset><legend>${t("Connect these players","חיבור הנגנים האלה")}</legend>${players.map(player=>`<label><input type="checkbox" name="member" value="${card._esc(player.entity_id)}">${card._esc(card._playerDisplayName(player))}</label>`).join("")}</fieldset><label>${t("Media URI","כתובת המדיה")}<input name="media" required placeholder="library://playlist/…"></label><button type="button" data-current-media>${t("Use current track","שימוש בשיר הנוכחי")}</button><label>${t("Starting volume (%) — empty keeps current volume","ווליום התחלתי (%) — ריק שומר על הווליום הקיים")}<input name="volume" type="number" min="0" max="100"></label><details class="scene-light-options"><summary>${t("Artwork lighting (optional)","תאורת עטיפה (אופציונלי)")}</summary><fieldset><legend>${t("Color lights","תאורה צבעונית")}</legend>${Object.values(card._hass?.states || {}).filter(entity=>entity.entity_id.startsWith("light.") && !["unavailable","unknown"].includes(entity.state) && (entity.attributes?.supported_color_modes || []).some(mode=>["hs","xy","rgb","rgbw","rgbww"].includes(mode))).map(entity=>`<label><input type="checkbox" name="light" value="${card._esc(entity.entity_id)}">${card._esc(entity.attributes?.friendly_name || entity.entity_id)}</label>`).join("")}</fieldset></details><button type="submit">${t("Save scene","שמירת סצנה")}</button><p role="status"></p></form></details>`:""}</section>`;
    const status=body.querySelector('[data-scene-status]');let busy=false;
    const run=async(id)=>{
      if(busy) return;busy=true;body.querySelectorAll('[data-run-scene]').forEach(b=>b.disabled=true);
      status.textContent=card._m("Starting scene…","מפעיל סצנה…");
      try {
        const result=await card._homeiiEngineCommand("scenes",{action:"run",scene_id:id});
        if(!active())return;
        const steps={group:card._m("group","קבוצה"),volume:card._m("volume","ווליום"),playback:card._m("playback","ניגון"),lighting:card._m("lighting","תאורה")};
        status.textContent=result.ok?card._m("Scene commands accepted","פקודות הסצנה התקבלו"):`${card._m("Stopped at","נעצר בשלב")}: ${steps[result.failed_step] || result.failed_step}. ${card._m("Completed","הושלם")}: ${(result.completed || []).map(step=>steps[step] || step).join(", ") || "—"}`;
      } catch(error){if(active())status.textContent=card._mediaControlFailureMessage(error);}
      finally{busy=false;if(active())body.querySelectorAll('[data-run-scene]').forEach(b=>b.disabled=false);}
    };
    body.querySelectorAll('[data-run-scene]').forEach(button=>button.onclick=()=>run(button.dataset.runScene));
    body.querySelectorAll('[data-delete-scene]').forEach(button=>button.onclick=async()=>{
      if(button.dataset.confirm!=="yes"){button.dataset.confirm="yes";button.textContent=card._m("Confirm delete","אישור מחיקה");return;}
      button.disabled=true;
      try{await card._homeiiEngineCommand("scenes",{action:"delete",scene_id:button.dataset.deleteScene});if(active())await renderListeningScenes(card,body);}
      catch(error){if(active()){status.textContent=card._mediaControlFailureMessage(error);button.disabled=false;}}
    });
    const form=body.querySelector("form");if(!form)return;
    const fields=form.elements;
    fields.player.value=players.some(p=>p.entity_id===card._state.selectedPlayer)?card._state.selectedPlayer:players[0]?.entity_id || "";
    body.querySelectorAll('[data-edit-scene]').forEach(button=>button.onclick=()=>{
      const scene=scenes.find(s=>s.id===button.dataset.editScene);body.querySelector('details').open=true;
      fields.scene_id.value=scene.id;fields.scene_name.value=scene.name;fields.player.value=scene.player;fields.media.value=scene.media_id;fields.volume.value=scene.volume??"";
      form.querySelectorAll('[name="member"]').forEach(input=>input.checked=scene.members.includes(input.value));
      form.querySelectorAll('[name="light"]').forEach(input=>input.checked=scene.lights.includes(input.value));
      fields.scene_name.focus();
    });
    form.querySelector('[data-current-media]').onclick=()=>{fields.media.value=card._getCurrentMediaUri?.() || "";};
    form.onsubmit=async event=>{
      event.preventDefault();event.stopPropagation();const button=form.querySelector('[type="submit"]');if(button.disabled)return;button.disabled=true;
      try{
        await card._homeiiEngineCommand("scenes",{action:"save",...(fields.scene_id.value?{scene_id:fields.scene_id.value}:{}),name:fields.scene_name.value,player:fields.player.value,media_id:fields.media.value,volume:fields.volume.value===""?null:Number(fields.volume.value),members:[...form.querySelectorAll('[name="member"]:checked')].map(input=>input.value),lights:[...form.querySelectorAll('[name="light"]:checked')].map(input=>input.value)});
        if(active())await renderListeningScenes(card,body);
      }catch(error){if(active()){form.querySelector('[role="status"]').textContent=card._mediaControlFailureMessage(error);button.disabled=false;}}
    };
  }catch(error){if(active())body.innerHTML=`<p role="alert">${card._esc(card._mediaControlFailureMessage(error))}</p>`;}
}
