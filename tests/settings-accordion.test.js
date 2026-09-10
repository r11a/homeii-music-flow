import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// These tests exercise the real `_settingsAccordionOpenSet` /
// `_persistSettingsAccordionOpen` / `_settingsLsKey` methods on a real
// `homeii-music-flow` card instance — they do NOT mirror the method bodies.
// Browser stubs mirror tests/runtime-baseline.test.js, plus an in-memory
// localStorage shim so the methods can exercise real I/O.

const STORAGE_KEY = "homeii_music_flow_settings_accordion_open";

const originalGlobals = {
  CustomEvent: globalThis.CustomEvent,
  customElements: globalThis.customElements,
  document: globalThis.document,
  HTMLElement: globalThis.HTMLElement,
  window: globalThis.window,
  localStorage: globalThis.localStorage,
};

function createLocalStorageStub() {
  const store = new Map();
  return {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => { store.set(key, String(value)); },
    removeItem: (key) => { store.delete(key); },
    clear: () => { store.clear(); },
    // Test-only helpers (not part of the Web Storage API).
    _has(key) { return store.has(key); },
    _keys() { return Array.from(store.keys()); },
  };
}

function installBrowserStubs() {
  globalThis.window = { customCards: [] };
  globalThis.CustomEvent = class CustomEvent extends Event {
    constructor(type, options = {}) {
      super(type, options);
      this.detail = options.detail;
    }
  };
  globalThis.document = {
    createElement(tagName) {
      return { tagName: String(tagName || "").toUpperCase() };
    },
    querySelector() {
      return null;
    },
  };
  globalThis.HTMLElement = class {
    constructor() {
      this.style = {
        setProperty() {},
        removeProperty() {},
      };
      this.offsetWidth = 0;
      this.classList = {
        add() {},
        remove() {},
        toggle() {},
        contains() { return false; },
      };
    }

    attachShadow() {
      const root = {
        innerHTML: "",
        addEventListener() {},
        getElementById() { return null; },
        querySelector() { return null; },
        querySelectorAll() { return []; },
      };
      this.shadowRoot = root;
      return root;
    }

    dispatchEvent() { return true; }
    getBoundingClientRect() { return { width: 0, height: 0 }; }
  };
  globalThis.customElements = {
    registry: new Map(),
    define(name, ctor) { this.registry.set(name, ctor); },
    get(name) { return this.registry.get(name); },
  };
  globalThis.localStorage = createLocalStorageStub();
}

async function settleModule() {
  await Promise.resolve();
  await vi.runAllTimersAsync();
}

function newCard() {
  const CardCtor = globalThis.customElements.get("homeii-music-flow");
  return new CardCtor();
}

describe("settings accordion open-set persistence (real methods on real card)", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();
    installBrowserStubs();
  });

  afterEach(() => {
    vi.useRealTimers();
    globalThis.customElements = originalGlobals.customElements;
    globalThis.CustomEvent = originalGlobals.CustomEvent;
    globalThis.document = originalGlobals.document;
    globalThis.HTMLElement = originalGlobals.HTMLElement;
    globalThis.window = originalGlobals.window;
    if (originalGlobals.localStorage === undefined) {
      delete globalThis.localStorage;
    } else {
      globalThis.localStorage = originalGlobals.localStorage;
    }
  });

  it("returns empty Set when localStorage is empty", async () => {
    await import("../src/homeii-music-flow.js?settings-accordion-empty");
    await settleModule();
    const card = newCard();
    const result = card._settingsAccordionOpenSet();
    expect(result).toBeInstanceOf(Set);
    expect(result.size).toBe(0);
  });

  it("hydrates a Set from a JSON array in localStorage", async () => {
    await import("../src/homeii-music-flow.js?settings-accordion-hydrate");
    await settleModule();
    const card = newCard();
    globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify(["display", "players_library"]));
    const result = card._settingsAccordionOpenSet();
    expect(result.has("display")).toBe(true);
    expect(result.has("players_library")).toBe(true);
    expect(result.has("voice_assistant")).toBe(false);
  });

  it("persists the set as a JSON array under the expected key", async () => {
    await import("../src/homeii-music-flow.js?settings-accordion-persist");
    await settleModule();
    const card = newCard();
    card._persistSettingsAccordionOpen(new Set(["voice_assistant"]));
    expect(globalThis.localStorage.getItem(STORAGE_KEY)).toBe(JSON.stringify(["voice_assistant"]));
  });

  it("returns an empty Set without throwing when localStorage holds malformed JSON", async () => {
    await import("../src/homeii-music-flow.js?settings-accordion-malformed");
    await settleModule();
    const card = newCard();
    globalThis.localStorage.setItem(STORAGE_KEY, "not json");
    let result;
    expect(() => { result = card._settingsAccordionOpenSet(); }).not.toThrow();
    expect(result).toBeInstanceOf(Set);
    expect(result.size).toBe(0);
  });

  // New tests for the card_id namespacing (_settingsLsKey added at ~28273).

  it("namespaces the localStorage key with card_id when present", async () => {
    await import("../src/homeii-music-flow.js?settings-accordion-cardid-namespaced");
    await settleModule();
    const card = newCard();
    card._config = { ...(card._config || {}), card_id: "kitchen" };
    const expectedKey = `${STORAGE_KEY}__kitchen`;

    card._persistSettingsAccordionOpen(new Set(["display", "voice_assistant"]));

    expect(globalThis.localStorage.getItem(expectedKey)).toBe(
      JSON.stringify(["display", "voice_assistant"]),
    );
    // The unsuffixed key must remain untouched so other cards (or the
    // no-card_id default) don't inherit this card's open state.
    expect(globalThis.localStorage.getItem(STORAGE_KEY)).toBeNull();

    // Read path uses the same namespaced key.
    const result = card._settingsAccordionOpenSet();
    expect(result.has("display")).toBe(true);
    expect(result.has("voice_assistant")).toBe(true);
  });

  it("uses the unsuffixed key when card_id is absent (no migration)", async () => {
    await import("../src/homeii-music-flow.js?settings-accordion-cardid-absent");
    await settleModule();
    const card = newCard();
    card._config = { ...(card._config || {}) };
    delete card._config.card_id;

    card._persistSettingsAccordionOpen(new Set(["smart_home"]));

    expect(globalThis.localStorage.getItem(STORAGE_KEY)).toBe(JSON.stringify(["smart_home"]));
    // No suffixed key should have been written.
    expect(globalThis.localStorage._keys().every((key) => !key.includes("__"))).toBe(true);

    const result = card._settingsAccordionOpenSet();
    expect(result.has("smart_home")).toBe(true);
  });

  it("renders the in-card settings menu with announcements and diagnostics", async () => {
    await import("../src/homeii-music-flow.js?settings-menu-announcements-diagnostics");
    await settleModule();
    const card = newCard();
    card._loadPlayers = vi.fn();
    card._settingsSectionDisplay = vi.fn(() => "display");
    card._settingsSectionPlayersLibrary = vi.fn(() => "players");
    card._settingsSectionQuickActionsBar = vi.fn(() => "quick actions");
    card._settingsSectionVoiceAssistant = vi.fn(() => "voice");
    card._settingsSectionSmartHome = vi.fn(() => "smart home");

    let html = "";
    expect(() => { html = card._settingsMenuHtml(); }).not.toThrow();

    expect(html).toContain('id="mobileAnnouncementVolumeInput"');
    expect(html).toContain('id="mobileAnnouncementTtsEntity"');
    expect(html).toContain('data-menu-nav="diagnostics"');
  });

  it("explains that HOMEii Flow 6 requires the Engine before direct browser settings", async () => {
    await import("../src/homeii-music-flow.js?settings-direct-ma-without-ha-integration");
    await settleModule();
    const card = newCard();
    card.setConfig({
      type: "custom:homeii-music-flow",
      ma_url: "http://192.168.1.50:8095",
      ma_token: "token",
    });
    card.hass = { services: {}, states: {} };

    const message = card._musicAssistantRequiredMessage();

    expect(message).toContain("HOMEii Flow 6 requires HOMEii Flow Engine");
    expect(message).toContain("required connection snapshot");
  });
});
