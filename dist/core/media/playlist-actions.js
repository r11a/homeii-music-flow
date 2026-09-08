export async function openPlaylistDestination(card, entry) {
  const layout = card.$("mobileQueueActionSheet")?.querySelector(".media-action-layout");
  if (!layout) return;
  layout.innerHTML = `<p role="status">${card._esc(card._m("Loading editable playlists…","טוען פלייליסטים שניתן לערוך…"))}</p>`;
  const playlists = [];
  for (let offset = 0; ; offset += 500) {
    const result = await card._callEngineMaCommand("music/playlists/library_items", { limit:500, offset, summary:false });
    if (!layout.isConnected || card._state.mobileQueueActionEntry !== entry) return;
    const batch = Array.isArray(result) ? result : result?.items || [];
    playlists.push(...batch.filter(item=>item.is_editable === true));
    if (batch.length < 500) break;
  }
  layout.innerHTML = `<h3>${card._esc(card._m("Add to playlist","הוספה לפלייליסט"))}</h3><p>${card._esc(entry.name || "")}</p>
    <select aria-label="${card._esc(card._m("Playlist","פלייליסט"))}" class="playlist-destination">${playlists.map((item,index)=>`<option value="${index}">${card._esc(item.name)}</option>`).join("")}</select>
    <p role="status">${playlists.length ? "" : card._esc(card._m("No editable playlists found in the MA library.","לא נמצאו בספריית MA פלייליסטים שניתן לערוך."))}</p>
    <button type="button" class="queue-action-item" data-playlist-save ${playlists.length ? "" : "disabled"}>${card._esc(card._m("Add","הוסף"))}</button>
    <button type="button" class="queue-action-item" data-playlist-back>${card._esc(card._m("Back","חזרה"))}</button>`;
  layout.querySelector("[data-playlist-back]").onclick = ()=>card._openMobileMediaActionMenu(entry);
  let saving = false;
  layout.querySelector("[data-playlist-save]").onclick = async () => {
    const playlist = playlists[Number(layout.querySelector("select").value)];
    if (saving || !layout.isConnected || !playlist || card._state.mobileQueueActionEntry !== entry) return;
    saving = true;
    const controls = layout.querySelectorAll("button,select"); controls.forEach(button=>{button.disabled=true;});
    try {
      await card._callEngineMaCommand("music/playlists/add_playlist_tracks", { db_playlist_id:playlist.item_id, uris:[entry.uri] });
      layout.querySelector('[role="status"]').textContent = card._m("Music Assistant accepted the playlist update.","Music Assistant קיבל את הבקשה לעדכון הפלייליסט.");
      layout.querySelector("[data-playlist-back]").disabled=false;
    } catch (error) { saving = false; controls.forEach(button=>{button.disabled=false;}); card._toastError(card._mediaControlFailureMessage(error)); }
  };
}
