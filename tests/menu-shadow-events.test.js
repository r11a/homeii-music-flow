// @vitest-environment jsdom
import { afterAll, afterEach, describe, expect, it, vi } from "vitest";
import "../src/homeii-music-flow.js";
vi.hoisted(() => { vi.useFakeTimers(); });
afterAll(() => { vi.clearAllTimers(); vi.useRealTimers(); });

const { document, customElements, MouseEvent } = globalThis;

afterEach(() => document.body.replaceChildren());

describe("menu actions across a real shadow event boundary", () => {
  it("coalesces repeated library taps without sending playback twice", async () => {
    const card = document.createElement("homeii-music-flow");
    card._state.selectedPlayer = "media_player.kitchen";
    card._state.menuOpen = true;
    card._state.menuPage = "library_playlists";
    const wrap = document.createElement("div");
    card.$ = id => id === "toastWrap" ? wrap : null;
    card._closeMobileMenu = vi.fn(() => { card._state.menuOpen = false; });
    let finish;
    card._playMediaOnPlayer = vi.fn(() => new Promise(resolve => { finish = resolve; }));
    const first = card._playMedia("library://playlist/1", "playlist");
    const second = card._playMedia("library://playlist/1", "playlist");
    expect(card._playMediaOnPlayer).toHaveBeenCalledOnce();
    expect(card._closeMobileMenu).toHaveBeenCalledOnce();
    expect(card._state.menuOpen).toBe(false);
    expect(wrap.querySelector('[role="status"]')).not.toBeNull();
    finish(true);
    expect(await first).toBe(true);
    expect(await second).toBe(true);
    expect(card._libraryPlaybackRequest).toBe(null);
    expect(wrap.children).toHaveLength(0);
  });
  it("shows only the settled cover when MA emits intermediate queue states", async () => {
    const prototype = customElements.get("homeii-music-flow").prototype;
    const states = ["middle", "final"].map((id) => ({
      state_only: true,
      queue_state: { current_item: { queue_item_id: id }, items_count: 2 },
    }));
    const card = {
      _state: { selectedPlayer: "media_player.kitchen", maQueueState: { current_item: { queue_item_id: "old" } }, queueItems: [] },
      _homeiiEngineGetQueue: vi.fn().mockImplementation(async () => states.shift()),
      _getQueueItemStableId: (item) => item?.queue_item_id || "",
      _hasPendingMobileQueuePlay: () => false,
      _syncNowPlayingUI: vi.fn(),
      _commitNowPlayingSnapshot: prototype._commitNowPlayingSnapshot,
    };
    await prototype._ensureNowPlayingSnapshot.call(card);
    expect(card._state.maQueueState.current_item.queue_item_id).toBe("old");
    await prototype._ensureNowPlayingSnapshot.call(card);
    await vi.advanceTimersByTimeAsync(350);
    expect(card._state.maQueueState.current_item.queue_item_id).toBe("final");
    expect(card._syncNowPlayingUI).toHaveBeenCalledOnce();
  });
  it.each([['library_albums', 'mobileLibraryFlowPage', 'library_albums'], ['queue', 'mobileQueueFlowQuickOpen', true]])('returns from the %s wheel without leaving its screen', (page, key, value) => {
    const card = document.createElement('homeii-music-flow');
    card._state.menuPage = page;
    card._state.menuStack = ['main'];
    card._state[key] = value;
    card._renderMobileMenu = vi.fn();
    card._backMobileMenu();
    expect(card._state[key]).toBeFalsy();
    expect(card._state.menuPage).toBe(page);
    expect(card._state.menuStack).toEqual(['main']);
    expect(card._renderMobileMenu).toHaveBeenCalledOnce();
  });
  it("advances virtualization from the inner media scroller and remembers its position", () => {
    const card = document.createElement("homeii-music-flow");
    const body = document.createElement("div");
    body.innerHTML = '<div class="media-items-list" data-homeii-virtual-total="200" data-virtual-columns="2" data-virtual-row-height="250"></div>';
    const list = body.firstElementChild;
    card.$ = () => body;
    card._state.menuPage = "library_albums";
    card._mediaVirtualPageKey = () => "albums";
    card._renderMobileMenu = vi.fn().mockResolvedValue();
    body.addEventListener("scroll", card._handleMobileMenuScroll.bind(card), { capture: true });
    list.scrollTop = 2500;
    list.dispatchEvent(new globalThis.Event("scroll"));
    expect(card._mediaVirtualStarts.get("albums")).toBe(12);
    expect(card._captureMobileMenuScroll().positions.mediaList.top).toBe(2500);
    expect(body.scrollTop).toBe(0);
  });
  it("opens a populated media action sheet using the real card renderer", async () => {
    const card = document.createElement("homeii-music-flow");
    const host = document.createElement("div");
    document.body.append(host);
    const shadow = host.attachShadow({ mode: "open" });
    shadow.innerHTML = '<div id="mobileMenuBody"><button data-media-more="library://playlist/297" data-media-type="playlist" data-media-name="Test playlist"><span>Actions</span></button></div><div id="mobileQueueActionModal"><div id="mobileQueueActionSheet"></div></div>';
    card.$ = (id) => shadow.getElementById(id);
    card._rememberMobileMenuScroll = vi.fn();
    card._shouldHoldManualFrontForContentSelection = () => false;
    card._handleSimpleWizardClick = async () => false;
    card._hydrateImages = vi.fn();
    const outerClick = vi.fn();
    host.addEventListener("click", outerClick);
    let task;
    shadow.getElementById("mobileMenuBody").addEventListener("click", (event) => { task = card._handleMobileMenuClick(event); });
    shadow.querySelector("button span").dispatchEvent(new MouseEvent("click", { bubbles: true, composed: true }));
    await task;
    expect(outerClick).not.toHaveBeenCalled();
    expect(shadow.getElementById("mobileQueueActionModal").classList.contains("open")).toBe(true);
    expect(shadow.querySelector('[data-media-popup="next"]')).not.toBe(null);
    expect(shadow.querySelector(".queue-action-title").textContent).toBe("Test playlist");
  });
  it("retains the selected player after the async wizard handler yields", async () => {
    const host = document.createElement("div");
    document.body.append(host);
    const shadow = host.attachShadow({ mode: "open" });
    const body = document.createElement("div");
    shadow.append(body);
    body.innerHTML = '<button data-menu-player="media_player.computer"><span>Computer</span></button>';
    const card = {
      _state: { menuStack: [] },
      _rememberMobileMenuScroll: vi.fn(),
      _shouldHoldManualFrontForContentSelection: () => false,
      _handleSimpleWizardClick: async () => false,
      _selectPlayer: vi.fn(),
      _toast: vi.fn(),
      _i18n: (key) => key,
      _closeMobileMenu: vi.fn(),
    };
    let task;
    const handler = customElements.get("homeii-music-flow").prototype._handleMobileMenuClick;
    body.addEventListener("click", (event) => { task = handler.call(card, event); });
    const event = new MouseEvent("click", { bubbles: true, composed: true });
    body.querySelector("span").dispatchEvent(event);
    expect(event.target).toBe(host);
    await task;
    expect(card._selectPlayer).toHaveBeenCalledWith("media_player.computer", true);
    expect(card._closeMobileMenu).toHaveBeenCalledOnce();
  });
  it("does not close a screen opened while a playback request is pending", async () => {
    const button = document.createElement("button");
    button.dataset.mediaPlay = "library://playlist/297";
    button.dataset.mediaType = "playlist";
    button.dataset.mediaName = "Test playlist";
    let confirmPlayback;
    const playback = new Promise((resolve) => { confirmPlayback = resolve; });
    const sequence = [];
    const card = {
      _state: { selectedPlayer: "media_player.kitchen", menuPage: "library_playlists", menuOpen: true },
      _rememberMobileMenuScroll: vi.fn(),
      _shouldHoldManualFrontForContentSelection: () => false,
      _handleSimpleWizardClick: async () => false,
      _showLibraryInteractionFeedback: () => button,
      _clearLibraryInteractionFeedback: vi.fn(),
      _playMedia: vi.fn(() => { sequence.push("play"); return playback; }),
      _closeMobileMenu: vi.fn(() => { sequence.push("close"); card._state.menuOpen = false; }),
      _renderMobileMenu: vi.fn(),
    };
    const handler = customElements.get("homeii-music-flow").prototype._handleMobileMenuClick;
    const task = handler.call(card, {
      target: button,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    });
    await Promise.resolve();
    expect(sequence).toEqual(["play"]);
    confirmPlayback(true);
    await task;
    expect(sequence).toEqual(["play"]);
    expect(card._renderMobileMenu).not.toHaveBeenCalled();
  });
  it("keeps the library open after a failed playback request", async () => {
    const button = document.createElement("button");
    button.dataset.mediaUri = "library://playlist/297";
    button.dataset.mediaType = "playlist";
    const card = {
      _state: { selectedPlayer: "media_player.kitchen", menuPage: "library_playlists", menuOpen: true },
      _rememberMobileMenuScroll: vi.fn(),
      _shouldHoldManualFrontForContentSelection: () => false,
      _handleSimpleWizardClick: async () => false,
      _showLibraryInteractionFeedback: () => button,
      _clearLibraryInteractionFeedback: vi.fn(),
      _playMedia: vi.fn().mockResolvedValue(false),
      _closeMobileMenu: vi.fn(),
      _renderMobileMenu: vi.fn().mockResolvedValue(),
    };
    const handler = customElements.get("homeii-music-flow").prototype._handleMobileMenuClick;
    await handler.call(card, { target: button, preventDefault: vi.fn(), stopPropagation: vi.fn() });
    expect(card._closeMobileMenu).not.toHaveBeenCalled();
    expect(card._renderMobileMenu).toHaveBeenCalledOnce();
  });
});
