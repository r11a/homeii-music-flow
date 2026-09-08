// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { immersiveActionPages, immersivePlayerEnabled, immersivePlayerDock, bindImmersivePlayer, syncImmersivePlayer, commitImmersiveSwipe, reconcileImmersiveCovers } from "../src/core/media/immersive-player.js";
import { validateMobileCardEditorConfig } from "../src/config/validators.js";
const { document, KeyboardEvent, MouseEvent, WheelEvent } = globalThis;

afterEach(() => document.body.replaceChildren());
function fixture() {
  const host = document.createElement("div"); document.body.append(host);
  const shadowRoot = host.attachShadow({ mode: "open" });
  const player = { state: "playing", attributes: { media_content_type: "track" } };
  const card = {
    shadowRoot, _config: { player_design: "immersive", action_menu_labels: true },
    _state: { maQueueState: { items: 3, current_item: { media_item: { media_type: "track" } } }, engineCapabilities: { queue_settings: true } },
    _m: (en) => en, _i18n: (s) => s, _esc: (s) => String(s), _iconSvg: () => "<svg></svg>", _isHebrew: () => false,
    _getSelectedPlayer: () => player, _getCurrentMediaUri: () => "library://track/1", _currentMediaFavoriteState: () => false,
    _isHotelMode: () => false, _discoveryModeEnabled: () => true,
    _openMobileMenu: vi.fn(), _openTabletLyricsScreensaver: () => false, _openLyricsModal: vi.fn(),
    _toggleLikeCurrentMedia: vi.fn(async () => {}), _toast: vi.fn(), _toastError: vi.fn(), _mediaControlFailureMessage: (e) => e.message,
    _getCurrentDuration: () => 200, _fmtDur: (n) => `${n}s`, _seekFromProgress: vi.fn(),
    $: (id) => shadowRoot.getElementById(id),
  };
  shadowRoot.innerHTML = `<div class="card"><div><div id="progressBar"><div id="progressFill" style="width:25%"></div></div></div>${immersivePlayerDock(card)}<button id="outside">Outside</button></div>`;
  bindImmersivePlayer(card);
  return { card, player, root: shadowRoot, open: () => card.$("immersiveActionsToggle").click() };
}
describe("optional immersive player", () => {
  it("restores player actions automatically when availability returns", () => {
    const {card,player,root,open}=fixture(); open();
    expect(root.querySelector('[data-immersive-action="queue"]')).not.toBeNull();
    player.available=false; syncImmersivePlayer(card);
    expect(root.querySelector('[data-immersive-action="queue"]')).toBeNull();
    player.available=true; syncImmersivePlayer(card);
    expect(root.querySelector('[data-immersive-action="queue"]')).not.toBeNull();
    expect(card.$('immersiveActionFan').hidden).toBe(false);
  });
  it("opens announcements directly from the main wheel", () => {
    const {card,root,open}=fixture(); open();
    root.querySelector('[data-immersive-action="announcements"]').click();
    expect(card._openMobileMenu).toHaveBeenCalledWith("announcements");
  });
  it("keeps the decoded neighboring cover when it becomes the selected cover", () => {
    const host = document.createElement("div");
    const slide = (id, position) => `<div class="art-stack-slide ${position}" data-uri="library://track/${id}" data-queue-item-id="${id}" data-art-position="${position}"><div class="art-stack-card ${position}"><img src="cover-${id}.jpg"></div></div>`;
    host.innerHTML = `<div class="art-stack-container">${slide("1", "center")}${slide("2", "next")}</div>`;
    const image = host.querySelector('[data-queue-item-id="2"] img');
    reconcileImmersiveCovers(host, `<div class="art-stack-container">${slide("1", "prev")}${slide("2", "center")}${slide("3", "next")}</div>`);
    expect(host.querySelector('.center img')).toBe(image);
    expect(host.querySelectorAll('.art-stack-slide')).toHaveLength(3);
    expect(host.querySelector('.center').dataset.artPosition).toBe("center");
  });
  it("sends one swipe command and releases the pending state after a failure", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("requestAnimationFrame", (callback) => callback());
    try {
      const { card, root } = fixture();
      const art = document.createElement("div"); art.id = "npArt"; root.append(art);
      card._setArtDragOffset = vi.fn(); card._clearArtDragOffset = vi.fn();
      const command = vi.fn(async () => { throw new Error("Offline"); });
      const task = commitImmersiveSwipe(card, "next", command);
      commitImmersiveSwipe(card, "next", command);
      await vi.advanceTimersByTimeAsync(230); await task;
      expect(command).toHaveBeenCalledOnce();
      expect(card._immersiveSwipePending).toBe(false);
      expect(art.hasAttribute("aria-busy")).toBe(false);
      expect(card._toastError).toHaveBeenCalledWith("Offline");
    } finally { vi.useRealTimers(); vi.unstubAllGlobals(); }
  });
  it("defaults to immersive and preserves an explicit classic choice", () => {
    expect(immersivePlayerEnabled({ _config: {} })).toBe(true);
    expect(immersivePlayerEnabled({ _config: { player_design: "classic" } })).toBe(false);
    expect(() => validateMobileCardEditorConfig({ player_design: "immersive" })).not.toThrow();
    expect(() => validateMobileCardEditorConfig({ player_design: "invalid" })).toThrow();
  });
  it("removes lyrics for radio and playback actions for unavailable players", () => {
    const { card, player } = fixture();
    expect(immersiveActionPages(card).flat().some((a) => a.id === "lyrics")).toBe(true);
    card._state.maQueueState.current_item.media_item.media_type = "radio";
    expect(immersiveActionPages(card).flat().some((a) => a.id === "lyrics")).toBe(false);
    player.state = "unavailable";
    expect(immersiveActionPages(card).flat().map((a) => a.id)).not.toContain("transfer");
    expect(immersiveActionPages(card)[0].map((a) => a.id)).toEqual(["players"]);
  });
  it("keeps all actions reachable and supports pager buttons and Escape", () => {
    const { card, root, open } = fixture(); open();
    expect(card.$("immersiveActionsToggle").getAttribute("aria-expanded")).toBe("true");
    root.querySelector('[data-fan-step="1"]').click();
    expect(root.querySelector('[data-immersive-action="transfer"]')).not.toBeNull();
    root.querySelector('[data-immersive-action="more"]').click();
    expect(card._openMobileMenu).toHaveBeenCalledWith("main");
    open();
    root.querySelector(".immersive-dock").dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(card.$("immersiveActionFan").hidden).toBe(true);
    expect(root.activeElement).toBe(card.$("immersiveActionsToggle"));
  });
  it("revalidates a stale action without reshuffling open targets", () => {
    const { card, player, root, open } = fixture(); open();
    player.state = "unavailable";
    root.querySelector('[data-immersive-action="queue"]').click();
    expect(card._openMobileMenu).not.toHaveBeenCalled();
    expect(card._toast).toHaveBeenCalledOnce();
  });
  it("prevents duplicate favorite commands while a request is pending", async () => {
    const { card, root, open } = fixture();
    let finish; card._toggleLikeCurrentMedia = vi.fn(() => new Promise((r) => { finish = r; }));
    open(); const button = root.querySelector('[data-immersive-action="like"]');
    button.click(); button.click();
    expect(card._toggleLikeCurrentMedia).toHaveBeenCalledOnce();
    finish(); await Promise.resolve();
  });
  it("suppresses the synthetic click after a horizontal swipe", () => {
    const { card, root, open } = fixture(); open();
    const fan = card.$("immersiveActionFan");
    fan.dispatchEvent(new MouseEvent("pointerdown", { clientX: 150, clientY: 20, bubbles: true }));
    fan.dispatchEvent(new MouseEvent("pointerup", { clientX: 70, clientY: 24, bubbles: true }));
    expect(root.querySelector('[data-immersive-action="transfer"]')).not.toBeNull();
    root.querySelector('[data-immersive-action="transfer"]').click();
    expect(card._openMobileMenu).not.toHaveBeenCalled();
  });
  it("pages inside the fan with the wheel and contains native scrolling", () => {
    const { card, root, open } = fixture(); open();
    const event = new WheelEvent("wheel", { deltaY: 60, bubbles: true, cancelable: true });
    card.$("immersiveActionFan").dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(root.querySelector('[data-immersive-action="transfer"]')).not.toBeNull();
    expect(card._openMobileMenu).not.toHaveBeenCalled();
  });
  it("moves the same buttons along the arc before pointer release without triggering actions", () => {
    const { card, root, open } = fixture(); open();
    const button = root.querySelector('[data-immersive-action="queue"]');
    const before = button.style.getPropertyValue("--fan-x");
    button.dispatchEvent(new MouseEvent("pointerdown", { clientX:150, clientY:80, bubbles:true }));
    card.$("immersiveActionFan").dispatchEvent(new MouseEvent("pointermove", { clientX:105, clientY:80, bubbles:true, cancelable:true }));
    expect(root.querySelector('[data-immersive-action="queue"]')).toBe(button);
    expect(button.style.getPropertyValue("--fan-x")).not.toBe(before);
    button.click();
    expect(card._openMobileMenu).not.toHaveBeenCalled();
  });
  it("continues touch dragging after implicit capture transfers from a button", () => {
    const { card, root, open } = fixture(); open();
    const fan = card.$("immersiveActionFan");
    const button = root.querySelector('[data-immersive-action="like"]');
    const dispatch = (target, type, x) => target.dispatchEvent(new MouseEvent(type, { clientX:x, clientY:80, bubbles:true, cancelable:true }));
    dispatch(button, "pointerdown", 200);
    dispatch(fan, "pointermove", 190);
    dispatch(button, "lostpointercapture", 190);
    const before = button.style.getPropertyValue("--fan-x");
    dispatch(fan, "pointermove", 120);
    expect(button.style.getPropertyValue("--fan-x")).not.toBe(before);
    expect(fan.classList.contains("rotating")).toBe(true);
    dispatch(fan, "pointerup", 100);
    expect(fan.classList.contains("rotating")).toBe(false);
    button.click();
    expect(card._toggleLikeCurrentMedia).not.toHaveBeenCalled();
  });
  it("opens AI radio from the fan only with Engine capability", () => {
    const { card, root, open } = fixture();
    expect(immersiveActionPages(card).flat().some((item) => item.id === "ai_radio")).toBe(false);
    card._state.engineCapabilities.ai_radio_dj = true; open();
    root.querySelector('[data-immersive-action="ai_radio"]').click();
    expect(card._openMobileMenu).toHaveBeenCalledWith("ai_radio");
  });
  it("preserves the real seek command and disables seeking without duration", () => {
    const { card } = fixture();
    const bar = card.$("progressBar");
    bar.getBoundingClientRect = () => ({ left: 0, width: 200 });
    bar.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    expect(card._seekFromProgress).toHaveBeenCalledWith(expect.objectContaining({ clientX: 55 }), { immediate: true });
    card._getCurrentDuration = () => 0;
    card._state.maQueueState.current_item.media_item.media_type = "radio";
    syncImmersivePlayer(card);
    expect(bar.getAttribute("aria-disabled")).toBe("true");
    expect(card.$("immersiveLiveStatus").hidden).toBe(false);
  });
});
