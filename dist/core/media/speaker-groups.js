// Group membership and commands. The existing card remains the state owner.
import { isPlayerAvailable } from "../state/players.js";
export function _getAvailableGroupPlayers() {
  return (this._state.players || [])
    .filter(isPlayerAvailable)
    .filter((p) => !(typeof this._isLikelyBrowserPlayer === "function" && this._isLikelyBrowserPlayer(p)))
    .filter((p) => !(typeof this._isStaticGroupPlayer === "function" && this._isStaticGroupPlayer(p)));
}

export function _currentSpeakerGroupMemberIds(entityId = this._state.selectedPlayer) {
  const primaryId = String(entityId || "").trim();
  if (!primaryId) return [];
  const players = Array.isArray(this._state.players) ? this._state.players : [];
  const primary = players.find((player) => player?.entity_id === primaryId) || this._playerByEntityId(primaryId);
  let ids = this._playerGroupMemberIds(primary).filter(Boolean);
  if (ids.length <= 1) {
    const owner = players.find((player) => {
      const members = this._playerGroupMemberIds(player);
      return members.length > 1 && members.includes(primaryId);
    });
    if (owner) ids = this._playerGroupMemberIds(owner).filter(Boolean);
  }
  if (!ids.includes(primaryId)) ids.unshift(primaryId);
  return [...new Set(ids)];
}

export function _currentSpeakerGroupOwnerId(entityId = this._state.selectedPlayer) {
  const primaryId = String(entityId || "").trim();
  if (!primaryId) return "";
  const players = Array.isArray(this._state.players) ? this._state.players : [];
  const primary = players.find((player) => player?.entity_id === primaryId) || this._playerByEntityId(primaryId);
  const primaryMembers = this._playerGroupMemberIds(primary);
  if (primaryMembers.length > 1) return primaryMembers[0] || primaryId;
  const owner = players.find((player) => {
    const members = this._playerGroupMemberIds(player);
    return members.length > 1 && members.includes(primaryId);
  });
  const ownerMembers = this._playerGroupMemberIds(owner);
  return ownerMembers[0] || owner?.entity_id || primaryId;
}

export function _selectedSpeakerGroupCount(player = this._getSelectedPlayer()) {
  const entityId = String(player?.entity_id || this._state.selectedPlayer || "").trim();
  if (!entityId) return 0;
  return this._currentSpeakerGroupMemberIds(entityId).length;
}

export function _syncGroupVolumeShortcut(player = this._getSelectedPlayer()) {
  const count = this._selectedSpeakerGroupCount(player);
  const show = count > 1;
  const label = this._i18n("ui.group_volume", {}, "Group volume");
  this.shadowRoot?.querySelectorAll?.(".group-volume-btn").forEach((btn) => {
    btn.hidden = !show;
    btn.classList.toggle("active", show);
    btn.dataset.groupCount = show ? String(count) : "";
    const title = show ? `${label} · ${count}` : label;
    btn.title = title;
    btn.setAttribute("aria-label", title);
  });
}

export function _openGroupVolumeShortcut() {
  const player = this._getSelectedPlayer();
  if (!player || this._selectedSpeakerGroupCount(player) <= 1) {
    this._toast?.(this._m("No active group for this player.", "אין קבוצה פעילה לנגן הזה."));
    return;
  }
  const layoutMode = typeof this._layoutModeConfig === "function" ? this._layoutModeConfig() : "";
  if (layoutMode && layoutMode !== "desktop" && typeof this._openMobileMenu === "function") {
    this._openMobileMenu("group");
    return;
  }
  this._openGroupModal();
}

export function _currentSpeakerGroupChildIds(entityId = this._state.selectedPlayer) {
  const primaryId = String(entityId || "").trim();
  return this._currentSpeakerGroupMemberIds(primaryId).filter((id) => id && id !== primaryId);
}

export function _normalizeGroupMemberSelection(ownerId, groupMembers = []) {
  const primaryId = String(ownerId || "").trim();
  return [...new Set((Array.isArray(groupMembers) ? groupMembers : [])
    .map((id) => String(id || "").trim())
    .filter((id) => id && id !== primaryId))];
}

export function _groupSelectionDelta(entityId = this._state.selectedPlayer, groupMembers = this._state.pendingGroupSelections || []) {
  const primaryId = String(entityId || "").trim();
  const owner = this._currentSpeakerGroupOwnerId(primaryId) || primaryId;
  const groupAll = this._currentSpeakerGroupMemberIds(primaryId);
  const current = groupAll.filter((id) => id && id !== owner);
  const desired = this._normalizeGroupMemberSelection(owner, groupMembers);
  const currentSet = new Set(current);
  const desiredSet = new Set(desired);
  const desiredAll = [...new Set((Array.isArray(groupMembers) ? groupMembers : [])
    .map((id) => String(id || "").trim())
    .filter(Boolean))];
  const ownerRemoved = !!(
    owner
    && groupAll.length > 1
    && this._state.pendingGroupOwnerRemoval
    && !desiredAll.includes(owner)
  );
  return {
    owner,
    currentAll: groupAll,
    desiredAll,
    ownerRemoved,
    current,
    desired,
    added: desired.filter((id) => !currentSet.has(id)),
    removed: current.filter((id) => !desiredSet.has(id)),
  };
}

export function _sameSpeakerGroupMembers(left = [], right = []) {
  const leftSet = new Set((Array.isArray(left) ? left : []).map((id) => String(id || "").trim()).filter(Boolean));
  const rightSet = new Set((Array.isArray(right) ? right : []).map((id) => String(id || "").trim()).filter(Boolean));
  if (leftSet.size !== rightSet.size) return false;
  for (const id of leftSet) {
    if (!rightSet.has(id)) return false;
  }
  return true;
}

export async function _waitForSpeakerGroupConfirmation(ownerId, expectedMembers = [], options = {}) {
  if (!this._hass?.states || typeof this._loadPlayers !== "function") {
    return { ok: true, skipped: true, members: expectedMembers };
  }
  const leaderId = String(ownerId || "").trim();
  const expected = [...new Set((Array.isArray(expectedMembers) ? expectedMembers : [])
    .map((id) => String(id || "").trim())
    .filter(Boolean))];
  const timeoutMs = Math.max(700, Number(options.timeoutMs || 8000) || 8000);
  const intervalMs = Math.max(150, Number(options.intervalMs || 350) || 350);
  const deadline = Date.now() + timeoutMs;
  let latest = [];
  do {
    let refreshed = false;
    try {
      if (this._homeiiEngineRequired?.()) await this._refreshEnginePlayers({ force: true, requireFresh: true });
      await this._loadPlayers();
      refreshed = true;
    } catch (_) {}
    latest = this._currentSpeakerGroupMemberIds(leaderId);
    if (refreshed && expected.length <= 1) {
      if (latest.length <= 1) return { ok: true, skipped: false, members: latest };
    } else if (refreshed && this._sameSpeakerGroupMembers(latest, expected)) {
      return { ok: true, skipped: false, members: latest };
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  } while (Date.now() < deadline);
  return { ok: false, skipped: false, members: latest };
}

export function _refreshGroupingState(options = {}) {
  const player = this._getSelectedPlayer();
  if (!player) return;
  const members = this._currentSpeakerGroupMemberIds(player.entity_id);
  if (options.force || !this._state.pendingGroupSelectionsDirty) {
    this._state.pendingGroupSelections = [...members];
    this._state.pendingGroupOwnerRemoval = false;
  }
}

export function _openGroupModal() {
  this._refreshGroupingState({ force: true });
  this.shadowRoot.querySelector(".card")?.appendChild(this.$("groupModal"));
  const players = this._getAvailableGroupPlayers();
  const list = this.$("groupList");
  if (!list) return;
  const selected = this._getSelectedPlayer();
  const subtitle = this.$("groupModalSubtitle");
  const badge = this.$("groupCountBadge");
  const groupOwner = this._currentSpeakerGroupOwnerId(selected?.entity_id);
  const groupDelta = this._groupSelectionDelta(selected?.entity_id, this._state.pendingGroupSelections || []);
  const currentAllSet = new Set(groupDelta.currentAll || []);
  const desiredAllSet = new Set(groupDelta.desiredAll || []);
  if (subtitle) subtitle.textContent = this._playerDisplayName(selected) || this._i18n("ui.choose_player");
  if (badge) badge.textContent = String(players.length);
  list.innerHTML = players.length ? players.map((p) => {
    const checked = desiredAllSet.has(p.entity_id);
    const connected = currentAllSet.has(p.entity_id);
    const isOwner = p.entity_id === groupOwner;
    return `<label class="group-item ${checked ? "checked" : ""} ${connected ? "connected" : ""} ${isOwner ? "group-owner" : ""}"><span class="group-meta"><span class="group-name">${this._esc(this._playerDisplayName(p, players))}<span class="group-item-toggle ${checked ? "checked" : ""}" aria-hidden="true">${this._iconSvg(checked ? "check" : "plus")}</span></span><span class="group-sub">${isOwner ? this._esc(this._m("Master", "מוביל")) : ""}</span></span><input type="checkbox" data-group-player="${this._esc(p.entity_id)}" data-group-owner="${isOwner ? "true" : "false"}" ${checked ? "checked" : ""}></label>`;
  }).join("") : `<div class="state-box" style="min-height:80px;padding:8px 0;">${this._esc(this._i18n("ui.no_extra_ma_players"))}</div>`;
  this._syncGroupModalApplyButton();
  this.$("groupModal").classList.add("open");
}

export function _closeGroupModal() { this.$("groupModal").classList.remove("open"); }

export function _syncGroupModalApplyButton() {
  const applyButton = this.$("applyGroupBtn");
  if (!applyButton) return;
  const selected = this._getSelectedPlayer();
  const delta = this._groupSelectionDelta(selected?.entity_id, this._state.pendingGroupSelections || []);
  applyButton.textContent = this._m("Update group", "עדכן קבוצה");
  applyButton.disabled = !delta.ownerRemoved && !delta.added.length && !delta.removed.length;
}

export function _handleGroupChange(e) {
  const checkbox = e.target.closest("input[data-group-player]");
  if (!checkbox) return;
  const entityId = checkbox.dataset.groupPlayer;
  const isOwner = checkbox.dataset.groupOwner === "true";
  const next = new Set(this._state.pendingGroupSelections || []);
  if (checkbox.checked) next.add(entityId); else next.delete(entityId);
  this._state.pendingGroupSelections = Array.from(next);
  if (isOwner) this._state.pendingGroupOwnerRemoval = !checkbox.checked;
  this._state.pendingGroupSelectionsDirty = true;
  const groupItem = checkbox.closest(".group-item");
  groupItem?.classList.toggle("checked", checkbox.checked);
  const toggle = groupItem?.querySelector(".group-item-toggle");
  if (toggle) {
    toggle.classList.toggle("checked", checkbox.checked);
    toggle.innerHTML = this._iconSvg(checkbox.checked ? "check" : "plus");
  }
  this._syncGroupModalApplyButton();
}

export async function _applySpeakerGroupFor(entityId, groupMembers = []) {
  const primaryId = String(entityId || "").trim();
  if (!primaryId) return false;
  const { owner, current, desired: members, added, removed } = this._groupSelectionDelta(primaryId, groupMembers);
  const leaderId = owner || primaryId;
  if (!members.length && !current.length) return false;
  const ownerRemovedFromMemberView = !!(owner && owner !== primaryId && removed.includes(owner));
  const ownerRemovalRequested = !!(owner && this._state.pendingGroupOwnerRemoval);
  if (ownerRemovedFromMemberView || ownerRemovalRequested) {
    await this._clearSpeakerGroupFor(owner);
    this._state.pendingGroupSelections = [];
    this._state.pendingGroupOwnerRemoval = false;
    this._state.pendingGroupSelectionsDirty = false;
    return true;
  }
  if (!added.length && !removed.length) return false;
  const canUseHomeiiEngineGroup = typeof this._homeiiEngineApplyGroup === "function"
    && this._homeiiEngineEnabled?.()
    && (this._state?.engineAvailable || this._homeiiEngineRequired?.());
  if (canUseHomeiiEngineGroup) {
    try {
      await this._homeiiEngineApplyGroup({
        owner: leaderId,
        entity_id: leaderId,
        members,
        remove_members: removed,
      });
      const expectedMembers = [...new Set([leaderId, ...members])];
      const confirmed = await this._waitForSpeakerGroupConfirmation(leaderId, expectedMembers);
      if (!confirmed.ok) {
        throw new Error(this._m("Group command was sent, but Music Assistant did not confirm the new group state.", "פקודת הקבוצה נשלחה, אבל Music Assistant לא אישר שהקבוצה התעדכנה."));
      }
      this._state.pendingGroupSelections = expectedMembers;
      this._state.pendingGroupOwnerRemoval = false;
      this._state.pendingGroupSelectionsDirty = false;
      setTimeout(() => {
        this._loadPlayers();
        this._refreshGroupingState();
        if (this._state.menuOpen) this._renderMobileMenu();
        if (this._state.controlRoomOpen) this._syncControlRoomUi({ force: true });
      }, 650);
      return true;
    } catch (engineError) {
      this._debugLog?.("warn", "[HOMEii Flow] HOMEii Flow Engine group fallback failed", engineError);
      if (this._homeiiEngineRequired?.()) throw engineError;
    }
  }
  const removalResults = removed.length
    ? await Promise.allSettled(removed.map((id) => this._callHaMediaPlayerService(id, "unjoin")))
    : [];
  if (added.length && members.length) {
    await this._callHaMediaPlayerService(leaderId, "join", { group_members: members });
  }
  const failedRemoval = removalResults.find((result) => result.status === "rejected");
  if (failedRemoval && !added.length) throw failedRemoval.reason || new Error(this._i18n("ui.player_groups_could_not_be_disconnected"));
  const expectedMembers = [...new Set([leaderId, ...members])];
  const confirmed = await this._waitForSpeakerGroupConfirmation(leaderId, expectedMembers);
  if (!confirmed.ok) {
    throw new Error(this._m("Group command was sent, but Music Assistant did not confirm the new group state.", "פקודת הקבוצה נשלחה, אבל Music Assistant לא אישר שהקבוצה התעדכנה."));
  }
  this._state.pendingGroupSelections = expectedMembers;
  this._state.pendingGroupOwnerRemoval = false;
  this._state.pendingGroupSelectionsDirty = false;
  setTimeout(() => {
    this._loadPlayers();
    this._refreshGroupingState();
    if (this._state.menuOpen) this._renderMobileMenu();
    if (this._state.controlRoomOpen) this._syncControlRoomUi({ force: true });
  }, 650);
  return true;
}

export async function _applySpeakerGroup() {
  const player = this._getSelectedPlayer();
  if (!player) return false;
  const groupMembers = [...(this._state.pendingGroupSelections || [])];
  let ok = false;
  try {
    ok = await this._applySpeakerGroupFor(player.entity_id, groupMembers);
  } catch (error) {
    this._toastError(error?.message || this._i18n("ui.queue_action_failed"));
    return false;
  }
  if (!ok) {
    this._toastError(this._m("Choose at least one speaker to add or remove.", "בחר לפחות רמקול אחד לצירוף או להסרה."));
    return false;
  }
  this._toastSuccess(this._i18n("ui.group_updated"));
  this._closeGroupModal();
  setTimeout(() => { this._refreshGroupingState(); if (this._state.view === "now_playing") this._renderNowPlayingPage(); }, 500);
  return true;
}

export function _clearLocalGroupState(entityId) {
  const primaryId = String(entityId || "").trim();
  if (!primaryId) return;
  const sourcePlayers = Array.isArray(this._state.players) ? this._state.players : [];
  const selectedPlayer = sourcePlayers.find((player) => player?.entity_id === primaryId) || this._playerByEntityId(primaryId);
  const related = new Set([primaryId, ...this._playerGroupMemberIds(selectedPlayer).filter(Boolean)]);
  for (const player of sourcePlayers) {
    const members = this._playerGroupMemberIds(player);
    if (members.includes(primaryId)) members.forEach((id) => related.add(id));
  }
  this._state.players = sourcePlayers.map((player) => {
    if (!player?.entity_id) return player;
    const attrs = player.attributes || {};
    const rawMembers = Array.isArray(attrs.group_members) ? attrs.group_members.filter(Boolean) : [];
    const touchesGroup = related.has(player.entity_id) || rawMembers.some((id) => related.has(id));
    if (!touchesGroup && !rawMembers.length) return player;
    const nextAttrs = { ...attrs };
    if (rawMembers.length) {
      const nextMembers = rawMembers.filter((id) => id && !related.has(id));
      if (nextMembers.length > 1) nextAttrs.group_members = nextMembers;
      else delete nextAttrs.group_members;
    }
    if (related.has(player.entity_id)) {
      delete nextAttrs.group_members;
      delete nextAttrs.group_childs;
      delete nextAttrs.group_children;
      delete nextAttrs.group_leader;
      delete nextAttrs.group_parent;
      delete nextAttrs.group_master;
    }
    return { ...player, attributes: nextAttrs };
  });
  this._state.pendingGroupSelections = [];
  this._state.pendingGroupOwnerRemoval = false;
  this._state.pendingGroupSelectionsDirty = false;
  this._refreshGroupingState();
  this._syncNowPlayingUI();
  if (this._state.view === "now_playing") this._renderNowPlayingPage();
  if (this._state.menuOpen && this._state.menuPage === "group") this._renderMobileMenu().catch(() => {});
}

export async function _clearSpeakerGroupFor(entityId) {
  const requestedId = String(entityId || "").trim();
  const ownerId = this._currentSpeakerGroupOwnerId(requestedId) || requestedId;
  const player = this._playerByEntityId(ownerId) || this._playerByEntityId(requestedId);
  if (!player) return;
  const disconnect = async (targets) => {
    const results = await Promise.allSettled(targets.map((id) => this._callHaMediaPlayerService(id, "unjoin")));
    const failed = targets.filter((_, index) => results[index].status === "rejected");
    if (failed.length) throw new Error(`${this._m("Could not disconnect", "לא ניתן לנתק")}: ${failed.map((id) => this._playerByEntityId(id)?.attributes?.friendly_name || id).join(", ")}`);
  };
  if (typeof this._isStaticGroupPlayer === "function" && this._isStaticGroupPlayer(player)) {
    const targets = this._playerGroupMemberIds(player)
      .filter((id) => id && id !== player.entity_id)
      .filter((id) => {
        const target = (this._state.players || []).find((p) => p.entity_id === id) || this._hass?.states?.[id];
        return target && !this._isStaticGroupPlayer(target);
    });
    if (targets.length) {
      await disconnect(targets);
    }
    this._clearLocalGroupState(player.entity_id);
    setTimeout(() => {
      this._loadPlayers();
      this._refreshGroupingState();
      if (this._state.menuOpen) this._renderMobileMenu();
      if (this._state.view === "now_playing") this._renderNowPlayingPage();
    }, 500);
    return true;
  }
  const groupIds = this._currentSpeakerGroupMemberIds(ownerId);
  const targets = groupIds.length > 1
    ? groupIds.filter((id) => {
        const target = (this._state.players || []).find((p) => p.entity_id === id) || this._hass?.states?.[id];
        return target && !(typeof this._isStaticGroupPlayer === "function" && this._isStaticGroupPlayer(target));
      })
    : [player.entity_id];
  await disconnect(targets);
  const confirmed = await this._waitForSpeakerGroupConfirmation(ownerId, [ownerId], { timeoutMs: 2600 });
  if (!confirmed.ok) {
    throw new Error(this._m("Group disconnect was sent, but Home Assistant did not confirm the group is clear.", "פקודת ניתוק הקבוצה נשלחה, אבל Home Assistant לא אישר שהקבוצה התנתקה."));
  }
  this._clearLocalGroupState(ownerId);
  setTimeout(() => {
    this._loadPlayers();
    this._refreshGroupingState();
    if (this._state.menuOpen) this._renderMobileMenu();
    if (this._state.view === "now_playing") this._renderNowPlayingPage();
  }, 500);
  return true;
}

export async function _clearSpeakerGroup() {
  const player = this._getSelectedPlayer();
  if (!player) return false;
  await this._clearSpeakerGroupFor(this._currentSpeakerGroupOwnerId(player.entity_id) || player.entity_id);
  this._state.pendingGroupSelectionsDirty = false;
  this._toast(this._i18n("ui.group_cleared"));
  this._closeGroupModal();
  return true;
}

