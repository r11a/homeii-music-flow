const key=card=>card._lsKey("homeii_radio_shortcuts");
export function pinnedRadios(card) {
  try { return JSON.parse(globalThis.localStorage.getItem(key(card)) || "[]").filter(item=>item && typeof item.uri==="string" && item.uri && typeof item.name==="string").slice(0,5); }
  catch (_) { return []; }
}
export function radioShortcutsHtml(card) {
  if (card._config?.radio_shortcuts_enabled===false || card._isCompactTileMode?.()) return "";
  const items=pinnedRadios(card);
  return items.length?`<nav class="radio-shortcuts" aria-label="${card._esc(card._m("Pinned radio stations","תחנות רדיו מוצמדות"))}">${items.map((item,index)=>`<button type="button" data-radio-shortcut="${index}" title="${card._esc(item.name)}">${card._iconSvg("radio")}<span>${card._esc(item.name)}</span></button>`).join("")}</nav>`:"";
}
export function bindRadioShortcuts(card) {
  const items=pinnedRadios(card);
  card.shadowRoot.querySelectorAll('[data-radio-shortcut]').forEach(button=>button.onclick=async event=>{
    event.preventDefault();event.stopPropagation();const item=items[Number(button.dataset.radioShortcut)];if(!item)return;
    try { await card._playMedia(item.uri,"radio","play",{label:item.name,sourceEl:button}); }
    catch(error){card._toastError(card._mediaControlFailureMessage(error));}
  });
}
export function mountRadioPinEditor(card,body,stations) {
  const section=globalThis.document.createElement('details');section.className='radio-pin-editor';
  const items=stations.filter(item=>item.uri && item.name);
  const selected=pinnedRadios(card);
  section.innerHTML=`<summary>${card._esc(card._m("Pin up to 5 stations on the player","הצמד עד 5 תחנות לנגן"))}</summary><p>${card._esc(card._m("Saved for this card on this device.","נשמר לכרטיס הזה במכשיר הזה."))}</p><div>${items.map((item,index)=>`<label><input type="checkbox" data-radio-pin="${index}" ${selected.some(s=>s.uri===item.uri)?"checked":""}><span>${card._esc(item.name)}</span></label>`).join("")}</div><p role="status"></p>`;
  section.onchange=event=>{
    const input=event.target.closest('[data-radio-pin]');if(!input)return;event.stopPropagation();
    const item=items[Number(input.dataset.radioPin)];let next=pinnedRadios(card).filter(s=>s.uri!==item.uri);
    if(input.checked){if(next.length>=5){input.checked=false;section.querySelector('[role="status"]').textContent=card._m("Choose up to 5 stations","אפשר לבחור עד 5 תחנות");return;}next.push({uri:item.uri,name:item.name});}
    try {
      globalThis.localStorage.setItem(key(card),JSON.stringify(next));
      section.querySelector('[role="status"]').textContent=card._m("Saved — shown when you return to the player","נשמר — יופיע בחזרה לנגן");
      const dock=card.$("immersiveActionsToggle")?.closest('.immersive-dock');
      if(dock){dock.previousElementSibling?.classList.contains('radio-shortcuts') && dock.previousElementSibling.remove();dock.insertAdjacentHTML('beforebegin',radioShortcutsHtml(card));bindRadioShortcuts(card);}
    }catch(_){input.checked=!input.checked;section.querySelector('[role="status"]').textContent=card._m("Could not save on this device","לא ניתן לשמור במכשיר הזה");}
  };
  body.prepend(section);
}
