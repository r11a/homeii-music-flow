// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { immersiveActionPages, immersivePlayerEnabled, immersivePlayerDock, bindImmersivePlayer, syncImmersivePlayer, commitImmersiveSwipe, reconcileImmersiveCovers } from "../src/core/media/immersive-player.js";
import { validateMobileCardEditorConfig } from "../src/config/validators.js";
const { document, KeyboardEvent, MouseEvent, WheelEvent } = globalThis;

afterEach(() => document.body.replaceChildren());

function animatedClock() {
  vi.useFakeTimers();
  vi.stubGlobal("requestAnimationFrame", callback => setTimeout(() => callback(performance.now()), 16));
  vi.stubGlobal("cancelAnimationFrame", clearTimeout);
}

it("finishes consecutive keyboard steps at the intended action and restores focus", async () => {
  animatedClock();
  try {
    const {card,root,open}=fixture(); open();
    const fan=card.$("immersiveActionFan");
    const buttons=[...fan.querySelectorAll(".immersive-fan-actions button")];
    fan.dispatchEvent(new KeyboardEvent("keydown",{key:"ArrowRight",bubbles:true}));
    fan.dispatchEvent(new KeyboardEvent("keydown",{key:"ArrowRight",bubbles:true}));
    await vi.advanceTimersByTimeAsync(300);
    expect(root.activeElement).toBe(buttons[4]);
    expect(buttons[4].classList.contains("fan-center")).toBe(true);
    expect(fan.classList.contains("coasting")).toBe(false);
    expect(card._openMobileMenu).not.toHaveBeenCalled();
  } finally {vi.useRealTimers();vi.unstubAllGlobals();}
});

it("stops wheel animation when closed or disposed without dispatching a command", async () => {
  animatedClock();
  try {
    const {card,root,open}=fixture(); open();
    const fan=card.$("immersiveActionFan");
    fan.dispatchEvent(new KeyboardEvent("keydown",{key:"ArrowRight",bubbles:true}));
    expect(fan.classList.contains("coasting")).toBe(true);
    fan.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape",bubbles:true}));
    const x=root.querySelector('[data-immersive-action="queue"]').style.getPropertyValue("--fan-x");
    await vi.advanceTimersByTimeAsync(300);
    expect(fan.hidden).toBe(true);
    expect(root.activeElement).toBe(card.$("immersiveActionsToggle"));
    expect(root.querySelector('[data-immersive-action="queue"]').style.getPropertyValue("--fan-x")).toBe(x);
    open(); fan._disposeFan();
    expect(card._fanDisposers.has(fan)).toBe(false);
    expect(card._openMobileMenu).not.toHaveBeenCalled();
  } finally {vi.useRealTimers();vi.unstubAllGlobals();}
});

it("supports vertical movement around the wheel and cancels without activating an action", () => {
  const {card,root,open}=fixture(); open();
  const fan=card.$("immersiveActionFan");
  fan.getBoundingClientRect=()=>({left:0,top:0,width:360,height:228});
  const button=root.querySelector('[data-immersive-action="queue"]');
  const before=button.style.getPropertyValue("--fan-x");
  fan.dispatchEvent(new MouseEvent("pointerdown",{clientX:280,clientY:60,bubbles:true}));
  fan.dispatchEvent(new MouseEvent("pointermove",{clientX:280,clientY:110,bubbles:true,cancelable:true}));
  expect(button.style.getPropertyValue("--fan-x")).not.toBe(before);
  fan.dispatchEvent(new MouseEvent("pointercancel",{bubbles:true}));
  expect(fan.classList.contains("rotating")).toBe(false);
  expect(fan.classList.contains("coasting")).toBe(false);
  button.click(); expect(card._openMobileMenu).not.toHaveBeenCalled();
});

it("settles immediately when reduced motion is requested", () => {
  vi.stubGlobal("matchMedia",()=>({matches:true}));
  const frame=vi.fn(); vi.stubGlobal("requestAnimationFrame",frame);
  try {
    const {card,root,open}=fixture();open();
    root.querySelector('[data-fan-step="1"]').click();
    expect(frame).not.toHaveBeenCalled();
    expect(card.$("immersiveActionFan").classList.contains("coasting")).toBe(false);
    expect(root.querySelectorAll('.fan-center')).toHaveLength(1);
  } finally {vi.unstubAllGlobals();}
});

it("opens the player/style/play wizard from Music Flow rather than queue covers", () => {
  const {card,root,open}=fixture();open();
  root.querySelector('[data-immersive-action="music_flow"]').click();
  expect(card._openMobileMenu).toHaveBeenCalledWith('simple_wizard');
  expect(root.querySelector('[data-immersive-action="queue_flow"]')).toBeNull();
});
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
    _toggleShuffle: vi.fn(), _toggleRepeat: vi.fn(),
    _toggleLikeCurrentMedia: vi.fn(async () => {}), _currentMediaLikeMeta: () => ({uri:"library://track/1",media_type:"track",name:"Current track"}), _openMobileMediaActionMenu: vi.fn(), _toast: vi.fn(), _toastError: vi.fn(), _mediaControlFailureMessage: (e) => e.message,
    _getCurrentDuration: () => 200, _fmtDur: (n) => `${n}s`, _seekFromProgress: vi.fn(),
    $: (id) => shadowRoot.getElementById(id),
  };
  shadowRoot.innerHTML = `<div class="card"><div><div id="progressBar"><div id="progressFill" style="width:25%"></div></div></div>${immersivePlayerDock(card)}<button id="outside">Outside</button></div>`;
  bindImmersivePlayer(card);
  return { card, player, root: shadowRoot, open: () => card.$("immersiveActionsToggle").click() };
}

describe('pull a fan action upward', () => {
  const pointer = (target, type, x, y) => target.dispatchEvent(new MouseEvent(type, {clientX:x, clientY:y, bubbles:true, cancelable:true}));
  afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

  it('dissolves before dispatching exactly the action that was pulled', async () => {
    animatedClock();
    const {card,root,open}=fixture(); open();
    const fan=card.$('immersiveActionFan'), button=root.querySelector('[data-immersive-action="queue"]');
    const x=button.style.getPropertyValue('--fan-x');
    pointer(button,'pointerdown',80,150); pointer(fan,'pointermove',82,70);
    expect(button.classList.contains('fan-pull-ready')).toBe(true);
    expect(button.style.getPropertyValue('--fan-x')).toBe(x);
    expect(card._openMobileMenu).not.toHaveBeenCalled();
    pointer(fan,'pointerup',82,70);
    expect(fan.classList.contains('fan-closing')).toBe(true);
    expect(fan.hidden).toBe(false);
    button.click();
    await vi.advanceTimersByTimeAsync(240);
    expect(fan.hidden).toBe(true);
    expect(card._openMobileMenu).toHaveBeenCalledExactlyOnceWith('queue');
    expect(fan.classList.contains('fan-pulling')).toBe(false);
  });

  it.each(['short','return','cancel'])('does not activate a %s pull', async kind => {
    animatedClock();
    const {card,root,open}=fixture(); open();
    const fan=card.$('immersiveActionFan'), button=root.querySelector('[data-immersive-action="queue"]');
    pointer(button,'pointerdown',80,150);
    pointer(fan,'pointermove',80,kind==='short'?125:60);
    if(kind==='return') pointer(fan,'pointermove',80,140);
    pointer(fan,kind==='cancel'?'pointercancel':'pointerup',80,kind==='short'?125:kind==='return'?140:60);
    button.click(); await vi.advanceTimersByTimeAsync(450);
    expect(fan.hidden).toBe(false);
    expect(fan.classList.contains('fan-pulling')).toBe(false);
    expect(card._openMobileMenu).not.toHaveBeenCalled();
  });

  it('locks an arc gesture to rotation instead of selecting on its upward segment', async () => {
    animatedClock();
    const {card,root,open}=fixture(); open();
    const fan=card.$('immersiveActionFan'), button=root.querySelector('[data-immersive-action="queue"]');
    pointer(button,'pointerdown',80,150); pointer(fan,'pointermove',115,148); pointer(fan,'pointerup',140,70);
    await vi.advanceTimersByTimeAsync(450);
    expect(fan.hidden).toBe(false); expect(card._openMobileMenu).not.toHaveBeenCalled();
  });

  it.each(['player','unavailable','dispose','reopen'])('cancels a queued activation on %s', async change => {
    animatedClock();
    const {card,player,root,open}=fixture(); open();
    const fan=card.$('immersiveActionFan'), button=root.querySelector('[data-immersive-action="queue"]');
    pointer(button,'pointerdown',80,150); pointer(fan,'pointerup',80,60);
    if(change==='player') card._state.selectedPlayer='another-player';
    if(change==='unavailable') player.available=false;
    if(change==='dispose') fan._disposeFan();
    if(change==='reopen') open();
    await vi.advanceTimersByTimeAsync(450);
    expect(card._openMobileMenu).not.toHaveBeenCalled();
    if(change==='unavailable') expect(card._toast).toHaveBeenCalled();
  });

  it('closes after a pull even for repeat, while a normal tap keeps the wheel open', async () => {
    animatedClock();
    const {card,root,open}=fixture(); open();
    const fan=card.$('immersiveActionFan'), button=root.querySelector('[data-immersive-action="repeat"]');
    pointer(button,'pointerdown',260,150); pointer(fan,'pointerup',260,60);
    await vi.advanceTimersByTimeAsync(240);
    expect(card._toggleRepeat).toHaveBeenCalledOnce(); expect(fan.hidden).toBe(true);
  });

  it('supports immediate activation with reduced motion and animated closing from the toggle otherwise', async () => {
    animatedClock();
    const {card,root,open}=fixture(); open();
    const fan=card.$('immersiveActionFan');
    expect(fan.classList.contains('fan-opening')).toBe(true);
    open(); expect(fan.classList.contains('fan-closing')).toBe(true);
    await vi.advanceTimersByTimeAsync(240); expect(fan.hidden).toBe(true);
    vi.stubGlobal('matchMedia',()=>({matches:true})); open();
    expect(fan.classList.contains('fan-opening')).toBe(false);
    const button=root.querySelector('[data-immersive-action="queue"]');
    pointer(button,'pointerdown',80,150); pointer(fan,'pointerup',80,60);
    expect(fan.hidden).toBe(true); expect(card._openMobileMenu).toHaveBeenCalledExactlyOnceWith('queue');
  });
});

it('crossfades only changed covers and cleans up rapid replacements', async () => {
  const prototype=globalThis.Element.prototype, original=Object.getOwnPropertyDescriptor(prototype,'animate');
  const motions=[];
  Object.defineProperty(prototype,'animate',{configurable:true,value:function(){
    let finish; const motion={cancel:vi.fn(),finished:new Promise(resolve=>{finish=resolve;}),finish:()=>finish()};
    motions.push(motion); return motion;
  }});
  const host=document.createElement('div');document.body.append(host);
  const markup=(id)=>`<div class="art-stack-container"><div class="art-stack-slide center" data-uri="library://track/${id}" data-queue-item-id="${id}"><div class="art-stack-card center"><img src="cover-${id}.jpg" data-homeii-art-src="cover-${id}.jpg"></div></div></div>`;
  try {
    host.innerHTML=markup(1);
    reconcileImmersiveCovers(host,markup(1),{animate:true});expect(motions).toHaveLength(0);
    reconcileImmersiveCovers(host,markup(2),{animate:true});expect(motions).toHaveLength(2);
    reconcileImmersiveCovers(host,markup(2),{animate:true});expect(motions[0].cancel).not.toHaveBeenCalled();
    expect(host.querySelector('.immersive-cover-outgoing img').getAttribute('src')).toBe('cover-1.jpg');
    expect(host.querySelector('.immersive-cover-outgoing img').hasAttribute('data-homeii-art-src')).toBe(false);
    reconcileImmersiveCovers(host,markup(3),{animate:true});
    expect(motions[0].cancel).toHaveBeenCalled();expect(host.querySelectorAll('.immersive-cover-outgoing')).toHaveLength(1);
    motions[0].finish();motions[1].finish();await Promise.resolve();await Promise.resolve();
    expect(host.classList.contains('cover-crossfading')).toBe(true);
    motions[2].finish();motions[3].finish();await Promise.resolve();await Promise.resolve();
    expect(host.querySelector('.immersive-cover-outgoing')).toBeNull();expect(host.classList.contains('cover-crossfading')).toBe(false);
    host.classList.add('performance-lite');reconcileImmersiveCovers(host,markup(4),{animate:true});expect(motions).toHaveLength(4);
  } finally {
    if(original) Object.defineProperty(prototype,'animate',original);else delete prototype.animate;
  }
});
describe("optional immersive player", () => {
  it("shows confirmed shuffle and repeat states without closing the wheel", () => {
    const {card, player, root, open} = fixture();
    // Real legacy controls live outside the wheel; clicking them used to bubble
    // into the outside-click handler and silently dismiss the wheel.
    const legacy = document.createElement("button"); legacy.id = "mobileRepeatBtn";
    root.querySelector(".card").append(legacy);
    player.attributes.shuffle = true; player.attributes.repeat = "one";
    open();
    expect(root.querySelector('[data-immersive-action="shuffle"]').getAttribute("aria-pressed")).toBe("true");
    expect(root.querySelector('[data-immersive-action="repeat"]').getAttribute("aria-label")).toBe("Repeat track");
    root.querySelector('[data-immersive-action="repeat"]').click();
    expect(card._toggleRepeat).toHaveBeenCalledOnce();
    root.querySelector('[data-immersive-action="shuffle"]').click();
    expect(card._toggleShuffle).toHaveBeenCalledOnce();
    expect(card.$("immersiveActionFan").hidden).toBe(false);
    player.attributes.repeat="off"; player.attributes.shuffle=false;
    card.$("immersiveActionFan")._refreshAvailableActions();
    expect(root.querySelector('[data-immersive-action="shuffle"]').getAttribute("aria-pressed")).toBe("false");
    expect(root.querySelector('[data-immersive-action="repeat"]').getAttribute("aria-pressed")).toBe("false");
  });
  it("opens configured home and studio shortcuts through their existing handlers", () => {
    const {card,root,open}=fixture();
    expect(immersiveActionPages(card).flat().some(item=>item.id==='home')).toBe(false);
    card._mobileHomeShortcutEnabled=()=>true; card._goHomeAssistantDashboard=vi.fn();
    card._controlRoomEnabled=()=>true; card._openControlRoom=vi.fn();
    open(); root.querySelector('[data-immersive-action="home"]').click();
    expect(card._goHomeAssistantDashboard).toHaveBeenCalledOnce();
    open(); root.querySelector('[data-immersive-action="studio"]').click();
    expect(card._openControlRoom).toHaveBeenCalledOnce();
  });
  it("refreshes changed artwork for the same queue item without replacing the image node", () => {
    const host = document.createElement("div");
    const markup = (src, alt) => `<div class="art-stack-container"><div data-uri="library://track/1" data-queue-item-id="1"><div class="art-stack-card"><img src="${src}" alt="${alt}"></div></div></div>`;
    host.innerHTML = markup("old.jpg", "Old title");
    const image = host.querySelector("img");
    reconcileImmersiveCovers(host, markup("new.jpg", "New title"));
    expect(host.querySelector("img")).toBe(image);
    expect(image.getAttribute("src")).toBe("new.jpg");
    expect(image.alt).toBe("New title");
    const replace = vi.spyOn(host.querySelector(".art-stack-container"), "replaceChildren");
    reconcileImmersiveCovers(host, markup("new.jpg", "New title"));
    expect(replace).not.toHaveBeenCalled();
  });
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
      await vi.advanceTimersByTimeAsync(340); await task;
      expect(command).toHaveBeenCalledOnce();
      expect(card._immersiveSwipePending).toBe(false);
      expect(art.hasAttribute("aria-busy")).toBe(false);
      expect(card._toastError).toHaveBeenCalledWith("Offline");
    } finally { vi.useRealTimers(); vi.unstubAllGlobals(); }
  });
  it("does not apply a delayed cover swipe to a newly selected player", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("requestAnimationFrame", (callback) => callback());
    try {
      const {card,root}=fixture();
      const art=document.createElement("div");art.id="npArt";root.append(art);
      card._setArtDragOffset=vi.fn();card._clearArtDragOffset=vi.fn();
      card._state.selectedPlayer="computer";
      const command=vi.fn();const pending=commitImmersiveSwipe(card,"next",command);
      card._state.selectedPlayer="kitchen";
      await vi.advanceTimersByTimeAsync(340);await pending;
      expect(command).not.toHaveBeenCalled();
      expect(card._immersiveSwipePending).toBe(false);
    } finally {vi.useRealTimers();vi.unstubAllGlobals();}
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
    expect(root.querySelector(".fan-catalogue")).not.toBeNull();
    root.querySelector("[data-catalogue-back]").click();
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
  it("opens favorite and playlist choices from the wheel heart", async () => {
    const { card, root, open } = fixture();
    open(); const button = root.querySelector('[data-immersive-action="like"]');
    button.click();
    expect(card._toggleLikeCurrentMedia).not.toHaveBeenCalled();
    expect(card._openMobileMediaActionMenu).toHaveBeenCalledWith(expect.objectContaining({uri:"library://track/1"}));
    expect(card.$("immersiveActionFan").hidden).toBe(true);
  });
  it("shows an optional direct Home button in the bottom dock", () => {
    const {card}=fixture();
    card._mobileMainBarItems=()=>["home","actions","players","library"];
    const host=document.createElement("div");host.innerHTML=immersivePlayerDock(card);
    expect(host.querySelector('[data-mainbar-action="home"]')).not.toBeNull();
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
  it("keeps actions visible after more than a hundred full wheel rotations", () => {
    const { card, root, open } = fixture(); open();
    const fan = card.$("immersiveActionFan");
    const buttons = [...root.querySelectorAll(".immersive-fan-actions button")];
    const before = buttons.map(button => button.style.visibility);
    fan.dispatchEvent(new WheelEvent("wheel", { deltaY: buttons.length * 90 * 201, bubbles: true, cancelable: true }));
    expect(buttons.map(button => button.style.visibility)).toEqual(before);
    expect(buttons.some(button => button.style.visibility === "visible")).toBe(true);
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

it('rotation retains queue choices and never dispatches another toggle', () => {
 const {card,player,root,open}=fixture();player.attributes.shuffle=true;player.attributes.repeat='all';open();
 const fan=card.$('immersiveActionFan');
 fan.dispatchEvent(new WheelEvent('wheel',{deltaY:270,bubbles:true,cancelable:true}));
 fan._refreshAvailableActions();
 expect(root.querySelector('[data-immersive-action="shuffle"]').getAttribute('aria-pressed')).toBe('true');
 expect(root.querySelector('[data-immersive-action="repeat"]').getAttribute('aria-pressed')).toBe('true');
 expect(card._toggleShuffle).not.toHaveBeenCalled();expect(card._toggleRepeat).not.toHaveBeenCalled();
});

it("keeps wheel touch gestures inside the card instead of swiping dashboards", () => {
  const {root,open}=fixture(); open();
  const listener=vi.fn(); document.addEventListener("touchmove",listener);
  const event=new globalThis.Event("touchmove",{bubbles:true,composed:true,cancelable:true});
  root.querySelector(".immersive-fan-actions").dispatchEvent(event);
  expect(listener).not.toHaveBeenCalled();
  expect(event.defaultPrevented).toBe(false);
  document.removeEventListener("touchmove",listener);
});
