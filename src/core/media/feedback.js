// Shared interaction feedback; state and command ownership remain on the card.
export function showToast(message, variant = "info", options = {}) {
      if (this._state?.controlRoomOpen && options?.allowStudio !== true && variant !== "error") return;
      const wrap = this.$("toastWrap");
      if (!wrap) return;
      const text = String(message ?? "").trim();
      if (!text) return;
      const safeVariant = ["success", "error", "info"].includes(variant) ? variant : "info";
      const now = Date.now();
      const key = `${safeVariant}:${text}`;
      const lastShown = this._toastHistory?.get(key) || 0;
      if (now - lastShown < 2500) return;
      if (!this._toastHistory) this._toastHistory = new Map();
      this._toastHistory.set(key, now);
      for (const [toastKey, at] of this._toastHistory.entries()) {
        if (now - at > 12000) this._toastHistory.delete(toastKey);
      }
      const activeToasts = Array.from(wrap.querySelectorAll(".toast"));
      while (activeToasts.length >= 3) activeToasts.shift()?.remove();
      const centered = options?.position === "center";
      const top = options?.position === "top";
      wrap.classList.toggle("studio-toast", !!this._state.controlRoomOpen && !centered);
      if (centered) wrap.classList.add("center-toast");
      if (top) wrap.classList.add("top-toast");
      const el = document.createElement("div");
      el.className = `toast ${safeVariant}${centered ? " centered" : ""}${top ? " top" : ""}`;
      el.setAttribute("role", safeVariant === "error" ? "alert" : "status");
      el.setAttribute("aria-atomic", "true");
      const icon = safeVariant === "success" ? "✓" : safeVariant === "error" ? "×" : "i";
      el.innerHTML = `<span class="toast-icon" aria-hidden="true">${icon}</span><span class="toast-text">${this._esc(text)}</span>`;
      const issueAckKey = String(options?.issueAckKey || "").trim();
      const issueAckText = String(options?.issueAckText || text).trim();
      let removed = false;
      const removeToast = () => {
        if (removed) return;
        removed = true;
        el.remove();
        if (centered && !wrap.querySelector(".toast.centered")) wrap.classList.remove("center-toast");
        if (top && !wrap.querySelector(".toast.top")) wrap.classList.remove("top-toast");
      };
      if (issueAckKey) {
        const ack = document.createElement("button");
        ack.type = "button";
        ack.className = "toast-ack";
        ack.textContent = this._i18n("ui.confirm", {}, "OK") || "OK";
        ack.addEventListener("click", (event) => {
          event?.stopPropagation?.();
          this._acknowledgeCardIssue(issueAckKey, issueAckText);
          removeToast();
        });
        el.appendChild(ack);
      }
      wrap.appendChild(el);
      setTimeout(removeToast, Number(options?.duration || 3300));
    }

export async function groupFeedback(card, action, perform, playerIds = []) {
  const host = card.shadowRoot?.querySelector?.(".card");
  if (!host || card._groupFeedbackActive) return perform();
  card._groupFeedbackActive = true;
  const panel = document.createElement("div");
  panel.className = `group-operation-feedback is-${action}`;
  panel.setAttribute("role","status");
  const symbols = document.createElement("span"); symbols.className = "group-operation-symbols";
  symbols.innerHTML = '<i></i><i></i>';
  const players=[...new Set(playerIds)].slice(0,2).map(id=>card._playerByEntityId?.(id)).filter(Boolean);
  if(players.length===2) {
    symbols.replaceChildren();
    for(const player of players) {
      const face=document.createElement("i");
      const art=card._playerArtworkUrl?.(player,120);
      if(art) face.innerHTML=card._imgHtml(art,"",{loading:"eager",fallbackIcon:"speaker"});
      else face.innerHTML=card._iconSvg?.("speaker") || "";
      face.title=player.attributes?.friendly_name || player.entity_id;
      symbols.append(face);
    }
    panel.classList.add("has-player-art");
  }
  const text = document.createElement("span");
  text.textContent = action === "disconnect" ? card._m("Disconnecting…","מנתק…") : card._m("Updating group…","מעדכן קבוצה…");
  panel.append(symbols,text); host.append(panel);
  if(players.length===2) {
    const caption=document.createElement("small");caption.className="group-pair-names";
    caption.textContent=players.map(player=>card._playerDisplayName?.(player) || player.attributes?.friendly_name || player.entity_id).join(" · ");
    panel.append(caption);
  }
  try {
    const result = await perform();
    if (result) {
      panel.classList.add("is-confirmed");
      text.textContent = action === "disconnect" ? card._m("Disconnected","נותק") : card._m("Group updated","הקבוצה עודכנה");
      setTimeout(()=>panel.remove(),900);
    } else panel.remove();
    return result;
  } catch(error) { panel.remove(); throw error; }
  finally { card._groupFeedbackActive = false; }
}

