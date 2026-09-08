// Use configured MA hosts; model, voice and station authoring remain owned by MA.
export async function renderAiRadio(card, body) {
  const player = card._state.selectedPlayer;
  const queueId = card._state.maQueueState?.queue_id;
  const t = (en,he) => card._esc(card._m(en,he));
  body.innerHTML = `<div class="lyrics-state">${t("Loading AI Radio…", "טוען רדיו AI…")}</div>`;
  try {
    if (!queueId) throw new Error(card._m("Select a player with an active queue first.", "בחר תחילה נגן עם תור פעיל."));
    const [hosts, status] = await Promise.all([
      card._callEngineMaCommand("ai_radio/hosts/list"),
      card._callEngineMaCommand("ai_radio/queue_dj/status"),
    ]);
    if (card._state.menuPage !== "ai_radio" || card._state.selectedPlayer !== player) return;
    const current = status?.[queueId] || "";
    const available = Array.isArray(hosts) ? hosts.filter(host => host.id && host.name) : [];
    body.innerHTML = `<div class="announcements-shell ai-radio-shell"><h3>${t("Your queue, with a radio host", "התור שלך, עם שדרן רדיו")}</h3><p>${t("Choose a host configured in Music Assistant. MA generates the spoken segments using its AI and voice settings.", "בחר שדרן שמוגדר ב־Music Assistant. MA יוצר את קטעי ההגשה באמצעות הגדרות ה־AI והקול שלו.")}</p><label class="announcement-target">${t("Host", "שדרן")}<select class="settings-select" data-ai-host><option value="">${t("DJ off", "ללא שדרן")}</option>${available.map(host => `<option value="${card._esc(host.id)}" ${host.id === current ? "selected" : ""}>${card._esc(host.name)}</option>`).join("")}</select></label>${!available.length ? `<p>${t("Configure an AI Radio host in MA first.", "יש להגדיר תחילה שדרן AI Radio ב־MA.")}</p>` : ""}<button class="action-btn" data-ai-apply>${t("Apply to this queue", "החל על התור הזה")}</button><p role="status" data-ai-status></p></div>`;
    body.querySelector("[data-ai-apply]").addEventListener("click", async event => {
      const button = event.currentTarget;
      if (button.disabled) return;
      const host = body.querySelector("[data-ai-host]").value || null;
      if (card._state.selectedPlayer !== player || card._state.maQueueState?.queue_id !== queueId) return;
      button.disabled = true;
      const feedback = body.querySelector("[data-ai-status]");
      try {
        await card._callEngineMaCommand("ai_radio/queue_dj/set", { queue_id: queueId, host_id: host });
        const confirmed = await card._callEngineMaCommand("ai_radio/queue_dj/status");
        if ((confirmed?.[queueId] || null) !== host) throw new Error(card._m("MA has not confirmed the DJ change.", "MA לא אישר את שינוי השדרן."));
        feedback.textContent = card._m("DJ setting confirmed by MA.", "הגדרת השדרן אושרה על ידי MA.");
      } catch (error) { feedback.textContent = card._mediaControlFailureMessage(error); }
      finally { button.disabled = false; }
    });
  } catch (error) {
    if (card._state.menuPage === "ai_radio") body.innerHTML = `<div class="lyrics-state">${card._esc(card._mediaControlFailureMessage(error))}</div>`;
  }
}
