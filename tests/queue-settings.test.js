// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { queueSettingsHtml, updateQueueSettingVisibility, queueSettingsChanges, saveQueueSettings, loadQueueSettings } from "../src/core/media/queue-settings.js";
import { actionMenuHtml, contextActionHtml, handleMediaActionClick, actionLabelsEnabled, actionIconSvg } from "../src/core/media/action-menu.js";
import { playerVolumeControlsHtml } from "../src/core/media/player-volume.js";

const entries = {
  autoplay_enabled: { type: "boolean", value: true },
  autoplay_mode: { type: "string", value: "auto", options: [{ value: "auto", title: "Automatic" }, { value: "playlist", title: "Playlist" }] },
  autoplay_playlist: { type: "string", value: null },
  smart_shuffle_enabled: { type: "string", value: "disabled", options: [{ value: "disabled", title: "Off" }, { value: "enabled", title: "On" }] },
};
function setup() {
  const body = globalThis.document.createElement("div");
  const card = { _m: (en) => en, _esc: (s) => String(s).replaceAll('"', "&quot;"), _iconSvg: (name) => `<svg data-icon="${name}"></svg>`,
    $: () => body, _mediaControlFailureMessage: (e) => e.message, _toastError: vi.fn(),
    _queueSettingsView: { can_edit: true, entries: structuredClone(entries), playlists: [{ uri: "library://playlist/1", name: "Evening" }] },
  };
  body.innerHTML = queueSettingsHtml(card, card._queueSettingsView);
  return { card, body, form: body.querySelector("form") };
}
describe("shared MA queue preferences", () => {
  it("only submits changed fields and preserves false", () => {
    const { form } = setup();
    expect(queueSettingsChanges(form, entries)).toEqual({});
    form.querySelector('[data-queue-setting="autoplay_enabled"]').checked = false;
    expect(queueSettingsChanges(form, entries)).toEqual({ autoplay_enabled: false });
  });
  it("shows the playlist selector only for playlist mode without replacing the draft", () => {
    const { form } = setup();
    updateQueueSettingVisibility(form);
    const row = form.querySelector('[data-setting-row="autoplay_playlist"]');
    expect(row.hidden).toBe(true);
    form.querySelector('[data-queue-setting="autoplay_mode"]').value = "playlist";
    updateQueueSettingVisibility(form);
    expect(row.hidden).toBe(false);
  });
  it("confirms a saved patch and preserves untouched server values", async () => {
    const { card, form } = setup();
    form.querySelector('[data-queue-setting="autoplay_enabled"]').checked = false;
    card._homeiiEngineCommand = vi.fn(async () => ({ saved: true, entries: { ...entries, autoplay_enabled: { type: "boolean", value: false } } }));
    await saveQueueSettings(card);
    expect(card._homeiiEngineCommand).toHaveBeenCalledWith("queue/settings", { values: { autoplay_enabled: false } }, expect.any(Object));
    expect(form.textContent).toContain("Saved in Music Assistant");
    expect(card._queueSettingsSaving).toBe(false);
  });
  it("does not fabricate success or replay when the saved value is not confirmed", async () => {
    const { card, form } = setup();
    form.querySelector('[data-queue-setting="autoplay_enabled"]').checked = false;
    card._homeiiEngineCommand = vi.fn(async () => ({ saved: true, entries }));
    await saveQueueSettings(card);
    expect(card._homeiiEngineCommand).toHaveBeenCalledOnce();
    expect(card._toastError).toHaveBeenCalledOnce();
    expect(card._queueSettingsView.entries.autoplay_enabled.value).toBe(true);
    expect(form.querySelector("button").disabled).toBe(false);
  });
  it("does not dispatch concurrent saves", async () => {
    const { card, form } = setup();
    form.querySelector('[data-queue-setting="autoplay_enabled"]').checked = false;
    let finish;
    card._homeiiEngineCommand = vi.fn(() => new Promise((resolve) => { finish = resolve; }));
    const first = saveQueueSettings(card);
    await saveQueueSettings(card);
    expect(card._homeiiEngineCommand).toHaveBeenCalledOnce();
    finish({ saved: true, entries: { ...entries, autoplay_enabled: { value: false } } });
    await first;
  });
  it("does not overwrite a different screen after a delayed read", async () => {
    const { card, body } = setup();
    card._homeiiEngineCommand = vi.fn(async () => ({ entries, can_edit: true }));
    card._callEngineMaCommand = vi.fn(async () => []);
    await loadQueueSettings(card, body, () => false);
    expect(body.querySelector("form")).toBe(null);
  });
  it("keeps unsupported controls out and read-only users cannot save", async () => {
    const { card, body } = setup();
    card._queueSettingsView.can_edit = false;
    body.innerHTML = queueSettingsHtml(card, card._queueSettingsView);
    expect(body.querySelector('[data-queue-setting="crossfade_mode"]')).toBe(null);
    expect(body.querySelector("fieldset").disabled).toBe(true);
    card._homeiiEngineCommand = vi.fn();
    await saveQueueSettings(card);
    expect(card._homeiiEngineCommand).not.toHaveBeenCalled();
  });
});
describe("action hub", () => {
  it("controls action labels independently of the navigation bar", () => {
    const { card, body } = setup();
    card._mobileFooterMode = () => "icon";
    card._config = { action_menu_labels: true };
    body.innerHTML = contextActionHtml(card, "data-media-popup", "next", "queue_next", "Play next");
    expect(body.querySelector("button span").textContent).toBe("Play next");
    expect(card._mobileFooterMode()).toBe("icon");
    card._config.action_menu_labels = false;
    expect(actionLabelsEnabled(card)).toBe(false);
    body.innerHTML = contextActionHtml(card, "data-media-popup", "next", "queue_next", "Play next");
    expect(body.querySelector("button span")).toBe(null);
    expect(body.querySelector("button").getAttribute("aria-label")).toBe("Play next");
  });
  it("uses consistent outline icons and retains the existing fallback", () => {
    const { card, body } = setup();
    body.innerHTML = actionIconSvg(card, "speaker_group");
    expect(body.querySelector("svg").getAttribute("stroke-width")).toBe("1.7");
    expect(body.querySelector("svg").getAttribute("aria-hidden")).toBe("true");
    expect(actionIconSvg(card, "queue_replace")).toContain('data-icon="queue_replace"');
  });
  it("preserves the selected playlist when its catalog fails to load", async () => {
    const { card, body } = setup();
    card._homeiiEngineCommand = vi.fn(async () => ({ can_edit: true, entries: { ...entries, autoplay_playlist: { type: "string", value: "library://playlist/99" } } }));
    card._callEngineMaCommand = vi.fn(async () => { throw new Error("offline"); });
    await loadQueueSettings(card, body, () => true);
    const form = body.querySelector("form");
    expect(form.querySelector('[data-queue-setting="autoplay_playlist"]').disabled).toBe(true);
    expect(form.querySelector('[data-queue-setting="autoplay_playlist"]').value).toBe("library://playlist/99");
    expect(form.querySelector('[data-menu-action="reload_queue_settings"]')).not.toBe(null);
    form.querySelector('[data-queue-setting="autoplay_enabled"]').checked = false;
    expect(queueSettingsChanges(form, card._queueSettingsView.entries)).toEqual({ autoplay_enabled: false });
  });
  it("does not render an actionable zero-volume slider for an unknown grouped member", () => {
    const { card, body } = setup();
    Object.assign(card, { _i18n: (key) => key, _isMuted: () => false, _volumeIconName: () => "volume_low" });
    const player = { entity_id: "kitchen", attributes: { volume_level: null, supported_features: ["set_members"] } };
    body.innerHTML = playerVolumeControlsHtml(card, player);
    expect(body.querySelector("input")).toBe(null);
    expect(body.textContent).toContain("Independent volume control is unavailable");
    player.attributes = { volume_level: 0, supported_features: ["volume_set", "volume_mute"] };
    body.innerHTML = playerVolumeControlsHtml(card, player);
    expect(body.querySelector("input").value).toBe("0");
  });
  it("keeps icon-only actions named and uses real keyboard-operable buttons", () => {
    const { card, body } = setup();
    card._mobileFooterMode = () => "icon";
    body.innerHTML = contextActionHtml(card, "data-media-popup", "next", "queue_next", "Play next");
    expect(body.querySelector("button").getAttribute("aria-label")).toBe("Play next");
    expect(body.querySelector("span")).toBe(null);
    card._mobileFooterMode = () => "both";
    expect(contextActionHtml(card, "data-media-popup", "next", "queue_next", "Play next")).toContain("<span>Play next</span>");
  });
  it("keeps a failed action open and prevents a duplicate while the first is pending", async () => {
    const { card, body } = setup();
    body.className = "queue-action-sheet";
    body.innerHTML = '<button data-media-popup="add">Add</button>';
    card._state = { mobileQueueActionEntry: { uri: "test" }, mobileActionContext: "media" };
    let finish;
    card._handleMobileMediaAction = vi.fn(() => new Promise((resolve) => { finish = resolve; }));
    card._closeMobileQueueActionMenu = vi.fn();
    const event = { target: body.querySelector("button") };
    const first = handleMediaActionClick(card, event);
    await handleMediaActionClick(card, event);
    expect(card._handleMobileMediaAction).toHaveBeenCalledOnce();
    expect(event.target.disabled).toBe(true);
    finish(false);
    await first;
    expect(card._closeMobileQueueActionMenu).not.toHaveBeenCalled();
    expect(event.target.disabled).toBe(false);
  });
  it("does not close a newly opened item when an older action completes", async () => {
    const { card, body } = setup();
    body.className = "queue-action-sheet";
    body.innerHTML = '<button data-media-popup="add">Add</button>';
    card._state = { mobileQueueActionEntry: { uri: "old" }, mobileActionContext: "media" };
    card._handleMobileMediaAction = vi.fn(async () => { card._state.mobileQueueActionEntry = { uri: "new" }; return true; });
    card._closeMobileQueueActionMenu = vi.fn();
    await handleMediaActionClick(card, { target: body.querySelector("button") });
    expect(card._closeMobileQueueActionMenu).not.toHaveBeenCalled();
  });
  it("uses distinct icons and exposes new preferences only when the Engine supports them", () => {
    const { card } = setup();
    Object.assign(card, { _isHotelMode: () => false, _mobileFooterMode: () => "icon", _discoveryModeEnabled: () => true, _i18n: (key) => key,
      _state: { engineCapabilities: {} }, _navMenuItem: (page, icon) => `<button data-page="${page}">${icon}</button>` });
    let html = actionMenuHtml.call(card);
    expect(html).toContain('icons-only');
    expect(html).toContain('data-icon="queue_transfer"');
    expect(html).toContain('data-icon="speaker_group"');
    expect(html).not.toContain('data-page="queue_settings"');
    card._state.engineCapabilities.queue_settings = true;
    html = actionMenuHtml.call(card);
    expect(html).toContain('data-page="queue_settings"');
    expect(html).toContain('data-menu-action="connect_this_device"');
  });
});
