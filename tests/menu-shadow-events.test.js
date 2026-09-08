// @vitest-environment jsdom
import { afterAll, afterEach, describe, expect, it, vi } from "vitest";
import "../src/homeii-music-flow.js";
vi.hoisted(() => { vi.useFakeTimers(); });
afterAll(() => { vi.clearAllTimers(); vi.useRealTimers(); });

const { document, customElements, MouseEvent } = globalThis;

afterEach(() => document.body.replaceChildren());

describe("menu actions across a real shadow event boundary", () => {
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
});
