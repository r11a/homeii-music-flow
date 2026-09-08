import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { extractCardVersion } from "../src/core/version-utils.js";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function readProjectFile(...segments) {
  return readFile(path.join(rootDir, ...segments), "utf8");
}

async function readPackageVersion() {
  const pkg = JSON.parse(await readProjectFile("package.json"));
  return String(pkg.version || "");
}

const originalGlobals = {
  CustomEvent: globalThis.CustomEvent,
  customElements: globalThis.customElements,
  document: globalThis.document,
  fetch: globalThis.fetch,
  HTMLElement: globalThis.HTMLElement,
  Image: globalThis.Image,
  localStorage: globalThis.localStorage,
  navigator: globalThis.navigator,
  URLCreateObjectURL: globalThis.URL?.createObjectURL,
  URLRevokeObjectURL: globalThis.URL?.revokeObjectURL,
  window: globalThis.window,
};

function installBrowserStubs() {
  const storage = new Map();
  globalThis.localStorage = {
    getItem(key) {
      const cleanKey = String(key);
      return storage.has(cleanKey) ? storage.get(cleanKey) : null;
    },
    setItem(key, value) {
      storage.set(String(key), String(value));
    },
    removeItem(key) {
      storage.delete(String(key));
    },
    clear() {
      storage.clear();
    },
  };
  globalThis.window = {
    customCards: [],
    innerWidth: 1024,
    addEventListener() {},
    removeEventListener() {},
  };
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
      this.classList = createClassList();
      this.offsetWidth = 0;
    }

    attachShadow() {
      const formNode = {
        addEventListener() {},
      };
      const sponsorNode = {
        attributes: {},
        listeners: {},
        addEventListener(type, handler) {
          this.listeners[type] = handler;
        },
        dispatchEvent(event) {
          this.listeners[event.type]?.(event);
        },
        getAttribute(name) {
          return this.attributes[name];
        },
        setAttribute(name, value) {
          this.attributes[name] = String(value);
        },
      };
      const diagnosticsButtonNode = {
        attributes: {},
        disabled: false,
        listeners: {},
        textContent: "Diagnostics",
        addEventListener(type, handler) {
          this.listeners[type] = handler;
        },
        dispatchEvent(event) {
          this.listeners[event.type]?.(event);
        },
        setAttribute(name, value) {
          this.attributes[name] = String(value);
        },
      };
      const diagnosticsCloseNode = {
        attributes: {},
        listeners: {},
        addEventListener(type, handler) {
          this.listeners[type] = handler;
        },
        dispatchEvent(event) {
          this.listeners[event.type]?.(event);
        },
        setAttribute(name, value) {
          this.attributes[name] = String(value);
        },
      };
      const diagnosticsPanelNode = {
        hidden: true,
      };
      const diagnosticsSummaryNode = {
        textContent: "",
      };
      const diagnosticsListNode = {
        innerHTML: "",
      };
      const shellNode = {
        classList: {
          toggle() {},
        },
      };
      const root = {
        innerHTML: "",
        addEventListener() {},
        getElementById() { return null; },
        querySelector(selector) {
          if (selector === "#editorForm") return formNode;
          if (selector === ".editor-shell") return shellNode;
          if (selector === ".editor-sponsor") return sponsorNode;
          if (selector === ".editor-diagnostics") return diagnosticsButtonNode;
          if (selector === "#editorDiagnosticsClose") return diagnosticsCloseNode;
          if (selector === "#editorDiagnosticsPanel") return diagnosticsPanelNode;
          if (selector === "#editorDiagnosticsSummary") return diagnosticsSummaryNode;
          if (selector === "#editorDiagnosticsList") return diagnosticsListNode;
          return null;
        },
        querySelectorAll() { return []; },
      };
      this.shadowRoot = root;
      return root;
    }

    dispatchEvent(event) {
      this.__lastEvent = event;
      return true;
    }

    getBoundingClientRect() {
      return { width: 0, height: 0 };
    }
  };
  globalThis.customElements = {
    registry: new Map(),
    define(name, ctor) {
      this.registry.set(name, ctor);
    },
    get(name) {
      return this.registry.get(name);
    },
  };
}

function expectHomeiiRuntimeRegistered(packageVersion) {
  expect(globalThis.customElements.get("homeii-music-flow")).toBeTypeOf("function");
  expect(globalThis.customElements.get("homeii-music-mobile")).toBeTypeOf("function");
  expect(globalThis.customElements.get("homeii-music-flow-editor")).toBeTypeOf("function");
  expect(globalThis.customElements.get("homeii-music-mobile-editor")).toBeTypeOf("function");

  expect(globalThis.window.customCards).toEqual([
    expect.objectContaining({
      type: "homeii-music-flow",
      name: "HOMEii Flow",
      description: expect.stringContaining(`v${packageVersion}`),
    }),
  ]);
}

function createClassList() {
  const values = new Set();
  return {
    add(name) { values.add(name); },
    remove(name) { values.delete(name); },
    contains(name) { return values.has(name); },
    toggle(name, force) {
      const enabled = force === undefined ? !values.has(name) : !!force;
      if (enabled) values.add(name);
      else values.delete(name);
      return enabled;
    },
  };
}

describe("runtime baseline", () => {
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
    globalThis.fetch = originalGlobals.fetch;
    globalThis.HTMLElement = originalGlobals.HTMLElement;
    globalThis.Image = originalGlobals.Image;
    globalThis.localStorage = originalGlobals.localStorage;
    if (globalThis.URL) {
      globalThis.URL.createObjectURL = originalGlobals.URLCreateObjectURL;
      globalThis.URL.revokeObjectURL = originalGlobals.URLRevokeObjectURL;
    }
    Object.defineProperty(globalThis, "navigator", {
      value: originalGlobals.navigator,
      configurable: true,
      writable: true,
    });
    globalThis.window = originalGlobals.window;
  });

  it("keeps package, source, and dist runtime versions aligned", async () => {
    const packageVersion = await readPackageVersion();
    const sourceVersion = extractCardVersion(await readProjectFile("src", "homeii-music-flow.js"));
    const distVersion = extractCardVersion(await readProjectFile("dist", "homeii-music-flow.js"));

    expect(sourceVersion).toBe(packageVersion);
    expect(distVersion).toBe(packageVersion);
  });

  it("keeps versioned editor tags aligned with the runtime version", async () => {
    const packageVersion = await readPackageVersion();
    const expectedSuffix = packageVersion.replace(/\D/g, "");
    const sourceText = await readProjectFile("src", "homeii-music-flow.js");
    const distText = await readProjectFile("dist", "homeii-music-flow.js");

    expect(sourceText).toContain(`homeii-music-flow-browser-editor-v${expectedSuffix}`);
    expect(sourceText).toContain(`homeii-music-flow-editor-v${expectedSuffix}`);
    expect(distText).toContain(`homeii-music-flow-browser-editor-v${expectedSuffix}`);
    expect(distText).toContain(`homeii-music-flow-editor-v${expectedSuffix}`);
  });

  it("registers the card, mobile card, editors, and dashboard picker metadata", async () => {
    const packageVersion = await readPackageVersion();

    await import("../src/homeii-music-flow.js?runtime-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    expectHomeiiRuntimeRegistered(packageVersion);
  });

  it("suppresses phone edge-to-edge while the card is rendered in the visual editor", async () => {
    await import("../src/homeii-music-flow.js?runtime-mobile-edge-editor-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    card._state.mobileLayoutMode = "edge_to_edge";

    expect(card._mobileEdgeToEdgeEnabled()).toBe(true);

    card.classList.add("mobile-edge-to-edge-open");
    card.editMode = true;

    expect(card._mobileEdgeToEdgeEnabled()).toBe(false);
    expect(card.classList.contains("mobile-edge-to-edge-open")).toBe(false);

    card.editMode = false;
    const renderBuild = card._build.bind(card);
    card._build = vi.fn();
    card._init = vi.fn();
    card._closeMobileMenu = vi.fn();
    card._closeMobileQueueActionMenu = vi.fn();
    card._closeMobileVolumePresets = vi.fn();
    card._closeSmartVoiceConfirm = vi.fn();
    card._closeControlRoom = vi.fn();
    card._persistMobileAppearance = vi.fn();
    card._state.mobileLayoutMode = "edge_to_edge";

    card._exitMobileEdgeToEdge();

    expect(card._state.mobileLayoutMode).toBe("full");
    expect(card._state.mobileEdgeReturnAvailable).toBe(true);

    card._config = { ...(card._config || {}), settings_source: "visual", mobile_layout_mode: "edge_to_edge" };
    card._applyConfiguredMobileSettings();
    expect(card._state.mobileLayoutMode).toBe("full");
    expect(card._state.mobileEdgeReturnAvailable).toBe(true);

    card._layoutModeConfig = vi.fn(() => "mobile");
    card._getAllocatedCardHeight = vi.fn(() => 760);
    card._getViewportHeight = vi.fn(() => 900);
    renderBuild();
    expect(card.shadowRoot.innerHTML).toContain('id="mobileEdgeEnterBtn"');
    expect(card.shadowRoot.innerHTML).toContain("mobile-edge-return");

    card._state.menuOpen = true;
    renderBuild();
    expect(card.shadowRoot.innerHTML).not.toContain('id="mobileEdgeEnterBtn"');

    card._state.menuOpen = false;
    card._state.mobileLayoutMode = "edge_to_edge";
    card._state.mobileEdgeReturnAvailable = false;
    renderBuild();
    expect(card.shadowRoot.innerHTML).toContain('id="mobileEdgeExitBtn"');

    card._state.menuOpen = true;
    renderBuild();
    expect(card.shadowRoot.innerHTML).not.toContain('id="mobileEdgeExitBtn"');

    card._state.menuOpen = false;
    card._build = vi.fn();
    card._enterMobileEdgeToEdge();

    expect(card._state.mobileLayoutMode).toBe("edge_to_edge");
    expect(card._state.mobileEdgeReturnAvailable).toBe(false);
  });

  it("treats the phone actions page as a fullscreen menu", async () => {
    await import("../src/homeii-music-flow.js?runtime-actions-fullscreen-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();

    expect(card._isPhoneActionFullscreenMenuPage("main")).toBe(true);
    expect(card._isPhoneActionFullscreenMenuPage("players")).toBe(true);
  });

  it("routes Engine persistence through the resolved context profile", async () => {
    await import("../src/homeii-music-flow.js?runtime-engine-routing-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    card.setConfig({ type: "custom:homeii-music-flow", homeii_engine_mode: "auto" });
    card._state.engineContext = { instanceId: "main", profileId: "kitchen" };
    card._state.engineInstanceId = "main";
    card._state.engineProfileId = "kitchen";
    card._state.players = [{
      entity_id: "media_player.kitchen",
      attributes: { app_id: "music_assistant", mass_player_type: "player" },
    }];

    expect(card._homeiiEngineMessage("timers/set", { player: "media_player.kitchen" })).toEqual(expect.objectContaining({
      type: "homeii_flow/timers/set",
      instance_id: "main",
      profile_id: "kitchen",
      player: "media_player.kitchen",
    }));
    expect(card._scheduledStartEnginePayload({ id: 488, player: "media_player.kitchen", playlist: "library://playlist/1" })).toEqual(expect.objectContaining({
      kind: "wake_playback",
      schedule_id: "488",
      player: "media_player.kitchen",
      media_id: "library://playlist/1",
      playlist: "library://playlist/1",
      media_mode: "selected",
      fallback_action: "media_play",
    }));
    expect(card._scheduledStartEnginePayload({ id: 488, player: "media_player.kitchen", playlist: "library://playlist/1" })).not.toHaveProperty("id");
    expect(card._scheduledStartEnginePayload({ id: "wake_random", player: "media_player.kitchen", playlist: "" })).toEqual(expect.objectContaining({
      schedule_id: "wake_random",
      player: "media_player.kitchen",
      media_id: "",
      media_mode: "random_playlist",
      selection_mode: "random_playlist",
      media_type: "playlist",
    }));
    expect(card._homeiiEngineMessage("timers/set", {
      timer_id: "sleep_media_player_kitchen",
      player: "media_player.kitchen",
    })).not.toHaveProperty("id");
    expect(card._homeiiEngineMessage("get_context")).not.toHaveProperty("profile_id");
  });

  it("records successful announcements in Engine without taking over playback", async () => {
    await import("../src/homeii-music-flow.js?runtime-engine-announcement-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    card.setConfig({ type: "custom:homeii-music-flow", homeii_engine_mode: "auto" });
    card._homeiiEngineEnabled = vi.fn(() => true);
    card._homeiiEngineReadyForPersistence = vi.fn(async () => true);
    card._homeiiEngineAnnounce = vi.fn(async () => ({ accepted: true }));

    await expect(card._recordAnnouncementInHomeiiEngine("Dinner is ready", [
      { entity_id: "media_player.kitchen" },
      "media_player.living_room",
    ], { language: "en-US", target: "all" })).resolves.toBe(true);

    expect(card._homeiiEngineAnnounce).toHaveBeenCalledWith(expect.objectContaining({
      message: "Dinner is ready",
      player: "",
      players: ["media_player.kitchen", "media_player.living_room"],
      language: "en-US",
      target: "all",
      sent: true,
    }));
  });

  it("keeps operational timers and schedules persisted while visual settings own appearance", async () => {
    await import("../src/homeii-music-flow.js?runtime-operational-persistence-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    card.setConfig({
      type: "custom:homeii-music-flow",
      card_id: "engine-persistence",
      settings_source: "visual",
    });

    const sleepTimerEndsAt = Date.now() + 30 * 60 * 1000;
    const schedule = card._normalizeScheduledStartSchedule({
      id: "wake_kitchen",
      enabled: true,
      time: "07:30",
      player: "media_player.kitchen",
      playlist: "library://playlist/1",
      playlistName: "Morning",
      volume: 35,
      days: [0, 1, 2, 3, 4],
    });
    card._state.mobileSleepTimerEndsAt = sleepTimerEndsAt;
    card._state.mobileSleepTimerPlayer = "media_player.kitchen";
    card._state.mobileSleepTimerOrigin = "general";
    card._state.mobileStartSchedules = [schedule];
    card._state.mobileStartTimerEnabled = true;

    card._persistMobileAppearance();

    expect(globalThis.localStorage.getItem(card._lsKey("homeii_music_flow_mobile_sleep_timer_at"))).toBe(String(sleepTimerEndsAt));
    expect(globalThis.localStorage.getItem(card._lsKey("homeii_music_flow_mobile_sleep_timer_player"))).toBe("media_player.kitchen");
    const storedSchedules = JSON.parse(globalThis.localStorage.getItem(card._lsKey("homeii_music_flow_mobile_start_schedules")));
    expect(storedSchedules).toEqual([expect.objectContaining({ id: "wake_kitchen", player: "media_player.kitchen" })]);

    const payload = card._systemMobileStatePayload();
    expect(payload.sleepTimerEndsAt).toBe(sleepTimerEndsAt);
    expect(payload.sleepTimerPlayer).toBe("media_player.kitchen");
    expect(payload.startSchedules).toEqual([expect.objectContaining({ id: "wake_kitchen" })]);
  });

  it("keeps the clean-all confirmation as a compact dedicated dialog", async () => {
    const source = await readProjectFile("src", "homeii-music-flow.js");

    expect(source).toContain("clean-all-confirm-btn danger-confirm-action");
    expect(source).toContain("queue-action-backdrop.clean-all-confirm-backdrop.open .clean-all-confirm-sheet");
    expect(source).toContain("compact-expanded .queue-action-backdrop.clean-all-confirm-backdrop.open .clean-all-confirm-sheet");
    expect(source).not.toContain('class="menu-item danger-confirm-action" id="cleanAllConfirmContinueBtn"');
  });

  it("instantiates the visual editor shell and accepts config updates", async () => {
    await import("../src/homeii-music-flow.js?runtime-editor-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const EditorCtor = globalThis.customElements.get("homeii-music-flow-editor");
    const editor = new EditorCtor();
    editor.connectedCallback();
    editor.setConfig({
      type: "custom:homeii-music-flow",
      mobile_quick_actions: ["voice", "search"],
    });

    expect(editor._editorForm).toBeTruthy();
    expect(editor.shadowRoot.innerHTML).toContain('class="editor-sponsor"');
    expect(editor.shadowRoot.innerHTML).toContain('class="editor-diagnostics"');
    expect(editor.shadowRoot.innerHTML).toContain('id="editorDiagnosticsPanel"');
    expect(editor.shadowRoot.innerHTML).toContain('href="https://github.com/sponsors/r11a"');
    expect(editor.shadowRoot.innerHTML).toContain('rel="noopener noreferrer"');
    globalThis.window.confirm = vi.fn(() => false);
    const preventDefault = vi.fn();
    editor._editorSponsorLink.dispatchEvent({ type: "click", preventDefault });
    expect(globalThis.window.confirm).toHaveBeenCalledWith("Open the GitHub Sponsors page?");
    expect(preventDefault).toHaveBeenCalled();
    expect(Array.isArray(editor._editorForm.schema)).toBe(true);
    expect(editor._editorForm.data.mobile_quick_actions).toEqual(["voice", "search"]);
  });

  it("keeps generic Home Assistant media players out of visual editor player settings", async () => {
    await import("../src/homeii-music-flow.js?runtime-editor-ma-player-options-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const EditorCtor = globalThis.customElements.get("homeii-music-flow-editor");
    const editor = new EditorCtor();
    editor.connectedCallback();
    editor.setConfig({
      type: "custom:homeii-music-flow",
      pinned_player_entities: ["media_player.legacy_configured"],
    });
    editor.hass = {
      services: {
        music_assistant: {
          play_media: {},
        },
      },
      states: {
        "media_player.office": {
          entity_id: "media_player.office",
          state: "idle",
          attributes: {
            friendly_name: "Office",
            app_id: "music_assistant",
            mass_player_type: "player",
          },
        },
        "media_player.alexa": {
          entity_id: "media_player.alexa",
          state: "idle",
          attributes: { friendly_name: "Alexa" },
        },
        "media_player.legacy_configured": {
          entity_id: "media_player.legacy_configured",
          state: "idle",
          attributes: { friendly_name: "Legacy configured" },
        },
      },
      entities: {
        "media_player.office": { platform: "music_assistant" },
        "media_player.alexa": { platform: "alexa_media" },
      },
    };

    const options = editor._editorPinnedPlayerOptions();
    const values = options.map((option) => option.value);

    expect(values).toContain("media_player.office");
    expect(values).toContain("media_player.legacy_configured");
    expect(values).not.toContain("media_player.alexa");
    expect(options.find((option) => option.value === "media_player.office")?.label)
      .toBe("Office (media_player.office)");
    expect(options.find((option) => option.value === "media_player.legacy_configured")?.label)
      .toBe("Legacy configured (media_player.legacy_configured)");

    const findSchemaItem = (items, name) => {
      for (const item of items || []) {
        if (item?.name === name) return item;
        const found = findSchemaItem(item?.schema, name);
        if (found) return found;
      }
      return null;
    };
    const schema = editor._withDynamicEditorSchema(editor._currentBaseEditorSchema());
    const pinnedSelector = findSchemaItem(schema, "pinned_player_entities")?.selector;
    const excludedSelector = findSchemaItem(schema, "excluded_player_entities")?.selector;

    expect(pinnedSelector?.select?.options).toContainEqual(
      expect.objectContaining({ value: "media_player.office", label: "Office (media_player.office)" }),
    );
    expect(excludedSelector?.select?.options).toContainEqual(
      expect.objectContaining({ value: "media_player.office", label: "Office (media_player.office)" }),
    );
  });

  it("builds a visual editor diagnostics v7 report with visible status rows", async () => {
    await import("../src/homeii-music-flow.js?runtime-editor-diagnostics-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const EditorCtor = globalThis.customElements.get("homeii-music-flow-editor");
    const editor = new EditorCtor();
    editor.connectedCallback();
    editor.setConfig({
      type: "custom:homeii-music-flow",
      ma_url: "",
    });
    editor.hass = {
      services: {
        music_assistant: {
          play_media: {},
          get_library: {},
        },
      },
      states: {
        "media_player.office": {
          entity_id: "media_player.office",
          state: "playing",
          attributes: {
            app_id: "music_assistant",
            friendly_name: "Office",
            mass_player_type: "player",
          },
        },
      },
      entities: {},
      connection: {
        sendMessagePromise: vi.fn(async () => [
          { entry_id: "ma-entry", domain: "music_assistant", state: "loaded" },
        ]),
      },
    };

    const report = await editor._runEditorDiagnostics();

    expect(report).toContain("HOMEii Music Flow Editor Diagnostics");
    expect(report).toContain("Diagnostics: v7");
    expect(report).toContain("Integration mode");
    expect(report).toContain("Sendspin endpoint");
    expect(report).toContain("Integration signal");
    expect(editor._editorDiagnosticsItems.length).toBeGreaterThan(0);
    expect(editor._editorDiagnosticsPanel.hidden).toBe(false);
    expect(editor._editorDiagnosticsList.innerHTML).toContain("editor-diagnostic-row");
    expect(editor._editorDiagnosticsList.innerHTML).toContain("status-ok");
    expect(editor._editorDiagnosticsList.innerHTML).toContain("status-info");
  });

  it("redacts external diagnostic URLs and closes the visual editor diagnostics panel", async () => {
    await import("../src/homeii-music-flow.js?runtime-editor-diagnostics-privacy-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    globalThis.window.location = {
      href: "https://abc123.ui.nabu.casa/lovelace/music",
      origin: "https://abc123.ui.nabu.casa",
      protocol: "https:",
      hostname: "abc123.ui.nabu.casa",
    };
    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      writable: true,
      value: {
      userAgent: "Mozilla/5.0 Edg/148.0.0.0",
      platform: "Win32",
      language: "en-US",
      maxTouchPoints: 10,
      },
    });

    const EditorCtor = globalThis.customElements.get("homeii-music-flow-editor");
    const editor = new EditorCtor();
    editor.connectedCallback();
    editor.setConfig({
      type: "custom:homeii-music-flow",
      ma_url: "https://mass.546866031.xyz",
      ma_token: "secret-token",
    });
    editor.hass = {
      services: {
        music_assistant: {
          play_media: {},
          get_library: {},
        },
      },
      states: {},
      entities: {},
      connection: {
        sendMessagePromise: vi.fn(async () => [
          { entry_id: "ma-entry", domain: "music_assistant", state: "loaded" },
        ]),
      },
    };
    globalThis.fetch = vi.fn(async () => {
      throw new TypeError("Failed to fetch");
    });

    const report = await editor._runEditorDiagnostics();

    expect(report).not.toContain("abc123.ui.nabu.casa");
    expect(report).not.toContain("mass.546866031.xyz");
    expect(report).not.toContain("secret-token");
    expect(report).toContain("https://<redacted-nabu-casa>");
    expect(report).toContain("https://<external-host>");
    expect(report).toContain("host_type=external-host");
    expect(editor._editorDiagnosticsList.innerHTML).not.toContain("mass.546866031.xyz");
    expect(editor._editorDiagnosticsPanel.hidden).toBe(false);

    editor._editorDiagnosticsCloseBtn.dispatchEvent({ type: "click" });
    expect(editor._editorDiagnosticsPanel.hidden).toBe(true);
  });

  it("reports queue artwork samples without leaking artwork hostnames", async () => {
    await import("../src/homeii-music-flow.js?runtime-queue-diagnostics-privacy-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    globalThis.window.location = {
      href: "https://abc123.ui.nabu.casa/lovelace/music",
      origin: "https://abc123.ui.nabu.casa",
      protocol: "https:",
      hostname: "abc123.ui.nabu.casa",
    };

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    card._maUrl = "https://mass.546866031.xyz";
    card._hass = {
      states: {},
      services: {
        music_assistant: {
          get_queue: {},
        },
      },
    };
    card._hasMassQueueService = vi.fn(() => false);
    card._hasDirectMAConnection = vi.fn(() => false);
    card._fetchMusicAssistantQueueSnapshot = vi.fn(async () => ({
      state: {
        current_index: 0,
        items: 1,
      },
      items: [
        card._normalizeQueueItem({
          queue_item_id: "queue-1",
          media_item: {
            name: "Queue Track",
            metadata: {
              images: [{ path: "spotify/cover.jpg", provider: "spotify" }],
            },
          },
        }, 0),
      ],
    }));

    const items = [];
    await card._diagnosticQueueRows((status, title, detail = "", value = "") => {
      items.push(card._diagnosticItem(status, title, detail, value));
    }, {
      entity_id: "media_player.office",
      attributes: {
        active_queue: "ma_queue",
      },
    });

    const queueArtwork = items.find((item) => item.title === "Queue artwork sample");
    expect(queueArtwork?.status).toBe("ok");
    expect(queueArtwork?.value).toContain("https://<external-host>");
    expect(queueArtwork?.value).not.toContain("mass.546866031.xyz");
  });

  it("uses direct image loading for cross-origin hydrated artwork when no token is available", async () => {
    await import("../src/homeii-music-flow.js?runtime-cross-origin-artwork-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    globalThis.window.location = {
      href: "https://abc123.ui.nabu.casa/lovelace/music",
      origin: "https://abc123.ui.nabu.casa",
    };
    globalThis.fetch = vi.fn(async () => {
      throw new Error("CORS should not be used for cross-origin artwork");
    });
    const appended = [];
    const doc = {
      createElement(tagName) {
        return {
          tagName: String(tagName || "").toUpperCase(),
          alt: "",
          loading: "",
          decoding: "",
          onload: null,
          onerror: null,
          set src(value) { this._src = value; },
          get src() { return this._src; },
        };
      },
    };
    const el = {
      isConnected: true,
      ownerDocument: doc,
      innerHTML: "placeholder",
      appendChild(node) {
        appended.push(node);
      },
    };

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    await card._loadImgInto("https://mass.example.com/imageproxy?path=cover", el, "music_note");

    expect(globalThis.fetch).not.toHaveBeenCalled();
    expect(appended).toHaveLength(1);
    expect(appended[0].src).toBe("https://mass.example.com/imageproxy?path=cover");
  });

  it("uses authenticated fetch for cross-origin Music Assistant imageproxy artwork", async () => {
    await import("../src/homeii-music-flow.js?runtime-authenticated-cross-origin-artwork-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    globalThis.window.location = {
      href: "https://abc123.ui.nabu.casa/lovelace/music",
      origin: "https://abc123.ui.nabu.casa",
    };
    globalThis.URL.createObjectURL = vi.fn(() => "blob:homeii-cover");
    globalThis.fetch = vi.fn(async () => ({
      ok: true,
      blob: async () => new Blob(["cover"], { type: "image/jpeg" }),
    }));
    const appended = [];
    const doc = {
      createElement(tagName) {
        return {
          tagName: String(tagName || "").toUpperCase(),
          alt: "",
          loading: "",
          decoding: "",
          onload: null,
          onerror: null,
          set src(value) { this._src = value; },
          get src() { return this._src; },
        };
      },
    };
    const el = {
      isConnected: true,
      ownerDocument: doc,
      innerHTML: "placeholder",
      appendChild(node) {
        appended.push(node);
      },
    };

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    card._maUrl = "https://mass.example.com";
    card._maToken = "secret-token";
    await card._loadImgInto("https://mass.example.com/imageproxy?path=cover", el, "music_note");

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "https://mass.example.com/imageproxy?path=cover",
      expect.objectContaining({
        credentials: "omit",
        headers: expect.objectContaining({ Authorization: "Bearer secret-token" }),
      }),
    );
    expect(appended).toHaveLength(1);
    expect(appended[0].src).toBe("blob:homeii-cover");
  });

  it("uses authenticated artwork blobs for decoded mobile artwork", async () => {
    await import("../src/homeii-music-flow.js?runtime-authenticated-decoded-artwork-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    globalThis.window.location = {
      href: "https://abc123.ui.nabu.casa/lovelace/music",
      origin: "https://abc123.ui.nabu.casa",
    };
    globalThis.URL.createObjectURL = vi.fn(() => "blob:decoded-cover");
    globalThis.fetch = vi.fn(async () => ({
      ok: true,
      blob: async () => new Blob(["cover"], { type: "image/jpeg" }),
    }));
    globalThis.Image = class FakeImage {
      constructor() {
        this.onload = null;
        this.onerror = null;
        this.complete = false;
        this.naturalWidth = 0;
      }

      set src(value) {
        this._src = value;
        this.complete = true;
        this.naturalWidth = 640;
        Promise.resolve().then(() => this.onload?.());
      }

      get src() {
        return this._src;
      }
    };

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    card._maUrl = "https://mass.example.com";
    card._maToken = "secret-token";
    const artworkUrl = "https://mass.example.com/imageproxy?path=cover";

    await expect(card._decodeArtworkUrl(artworkUrl)).resolves.toBe(true);

    expect(card._artworkDisplayUrl(artworkUrl)).toBe("blob:decoded-cover");
    expect(card._decodedArtworkImgHtml(artworkUrl, "Cover", { current: true })).toContain('src="blob:decoded-cover"');
    expect(card._decodedArtworkImgHtml(artworkUrl, "Cover", { current: true })).toContain(`data-homeii-applied-art-src="${artworkUrl}"`);
  });

  it("reports browser image loading for queue artwork diagnostics", async () => {
    await import("../src/homeii-music-flow.js?runtime-diagnostics-artwork-load-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    globalThis.Image = class FakeImage {
      constructor() {
        this.onload = null;
        this.onerror = null;
        this.complete = false;
        this.naturalWidth = 0;
        this.naturalHeight = 0;
      }

      set src(value) {
        this._src = value;
        this.complete = true;
        this.naturalWidth = 640;
        this.naturalHeight = 640;
        Promise.resolve().then(() => this.onload?.());
      }

      get src() {
        return this._src;
      }
    };

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    card._maUrl = "https://mass.example.com";
    card._hass = {
      states: {},
      services: {
        music_assistant: {
          get_queue: {},
        },
      },
    };
    card._hasMassQueueService = vi.fn(() => false);
    card._hasDirectMAConnection = vi.fn(() => false);
    card._fetchMusicAssistantQueueSnapshot = vi.fn(async () => ({
      state: {
        current_index: 0,
        items: 1,
      },
      items: [
        card._normalizeQueueItem({
          queue_item_id: "queue-1",
          media_item: {
            name: "Browser Art",
            metadata: {
              images: [{ path: "spotify/browser-art.jpg", provider: "spotify" }],
            },
          },
        }, 0),
      ],
    }));

    const rows = [];
    await card._diagnosticQueueRows((status, title, detail = "", value = "") => {
      rows.push({ status, title, detail, value });
    }, {
      entity_id: "media_player.office",
      attributes: {
        active_queue: "ma_queue",
      },
    });

    const browserLoad = rows.find((row) => row.title === "Queue artwork browser load");
    expect(browserLoad?.status).toBe("ok");
    expect(browserLoad?.detail).toContain("loaded");
    expect(browserLoad?.value).toContain("(640x640)");
  });

  it("reports authenticated artwork fetch when direct browser image loading fails", async () => {
    await import("../src/homeii-music-flow.js?runtime-diagnostics-auth-artwork-fetch-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    globalThis.window.location = {
      href: "https://abc123.ui.nabu.casa/lovelace/music",
      origin: "https://abc123.ui.nabu.casa",
    };
    globalThis.URL.createObjectURL = vi.fn(() => "blob:diagnostic-cover");
    globalThis.fetch = vi.fn(async () => ({
      ok: true,
      blob: async () => new Blob(["cover"], { type: "image/jpeg" }),
    }));
    globalThis.Image = class FakeImage {
      constructor() {
        this.onload = null;
        this.onerror = null;
        this.complete = false;
        this.naturalWidth = 0;
        this.naturalHeight = 0;
      }

      set src(value) {
        this._src = value;
        if (String(value).startsWith("blob:")) {
          this.complete = true;
          this.naturalWidth = 640;
          this.naturalHeight = 640;
          Promise.resolve().then(() => this.onload?.());
          return;
        }
        Promise.resolve().then(() => this.onerror?.());
      }

      get src() {
        return this._src;
      }
    };

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    card._maUrl = "https://mass.example.com";
    card._maToken = "secret-token";

    const result = await card._diagnosticProbeArtworkLoad("https://mass.example.com/imageproxy?path=cover");

    expect(result.ok).toBe(true);
    expect(result.reason).toContain("authenticated artwork fetch succeeded");
    expect(result.width).toBe(640);
  });

  it("reports rendered artwork DOM health in diagnostics", async () => {
    await import("../src/homeii-music-flow.js?runtime-rendered-artwork-diagnostics-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    const artworkImage = {
      currentSrc: "https://mass.example.com/imageproxy?path=ok",
      complete: true,
      naturalWidth: 640,
      dataset: {},
      getAttribute: () => "",
      closest: () => null,
    };
    const brokenImage = {
      currentSrc: "https://mass.example.com/imageproxy?path=broken",
      complete: true,
      naturalWidth: 0,
      dataset: {},
      getAttribute: () => "",
      closest: () => null,
    };
    card.shadowRoot = {
      querySelectorAll(selector) {
        if (selector === "img") return [artworkImage, brokenImage];
        if (selector === "[data-img]") return [{}];
        if (selector === ".media-placeholder,.homeii-art-fallback,.art-stack-fallback,.static-fallback") return [{}, {}];
        return [];
      },
    };
    card._state.menuOpen = true;
    card._state.menuPage = "library_albums";

    const rows = [];
    card._diagnosticRenderedArtworkRows((status, title, detail = "", value = "") => {
      rows.push({ status, title, detail, value });
    });

    const rendered = rows.find((row) => row.title === "Rendered artwork DOM");
    expect(rendered?.status).toBe("warn");
    expect(rendered?.detail).toContain("2 artwork image(s)");
    expect(rendered?.detail).toContain("1 broken/pending image(s)");
    expect(rendered?.detail).toContain("1 lazy placeholder(s)");
    expect(rendered?.value).toBe("menu=library_albums");
  });

  it("applies a diagnostic queue snapshot when the UI state is empty", async () => {
    await import("../src/homeii-music-flow.js?runtime-queue-diagnostics-repair-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    card._hass = {
      states: {},
      services: {
        music_assistant: {
          get_queue: {},
        },
      },
    };
    card._hasMassQueueService = vi.fn(() => false);
    card._hasDirectMAConnection = vi.fn(() => false);
    card._fetchMusicAssistantQueueSnapshot = vi.fn(async () => ({
      state: {
        current_index: 0,
        items: 2,
      },
      items: [
        card._normalizeQueueItem({ queue_item_id: "one", media_item: { name: "One", uri: "library://track/1" } }, 0),
        card._normalizeQueueItem({ queue_item_id: "two", media_item: { name: "Two", uri: "library://track/2" } }, 1),
      ],
    }));

    const rows = [];
    await card._diagnosticQueueRows((status, title, detail = "", value = "") => {
      rows.push({ status, title, detail, value });
    }, {
      entity_id: "media_player.office",
      attributes: {
        active_queue: "ma_queue",
      },
    });

    const queueSnapshot = rows.find((row) => row.title === "Queue snapshot");
    expect(queueSnapshot?.status).toBe("ok");
    expect(queueSnapshot?.detail).toContain("Diagnostics applied the queue snapshot");
    expect(card._state.queueItems).toHaveLength(2);
  });

  it("resolves Music Assistant 2.9 queue artwork payloads", async () => {
    await import("../src/homeii-music-flow.js?runtime-queue-art-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    card._maUrl = "https://ma.local";

    const normalized = card._normalizeQueueItem({
      queue_item_id: "queue-1",
      media_item: {
        uri: "spotify://track/1",
        name: "Track A",
        metadata: {
          images: [{ path: "spotify/cover.jpg", provider: "spotify" }],
        },
      },
    }, 0);

    expect(card._queueItemImageUrl(normalized, 120)).toBe(
      "https://ma.local/imageproxy?path=spotify%2Fcover.jpg&provider=spotify&size=160",
    );
  });

  it("does not treat relative Music Assistant imageproxy paths as Home Assistant artwork in integration-only mode", async () => {
    await import("../src/homeii-music-flow.js?runtime-integration-only-art-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    card._maUrl = "";
    card._maExternalUrl = "";

    expect(card._artUrl({ image: "/imageproxy?path=spotify%2Fcover.jpg" })).toBe("");
    expect(card._artUrl({ image: "imageproxy?path=spotify%2Fcover.jpg" })).toBe("");
    expect(card._artUrl({ image: "/api/media_player_proxy/media_player.office?token=abc" })).toContain("/api/media_player_proxy/media_player.office");
  });

  it("loads selected-player queue snapshots through Home Assistant before direct Music Assistant", async () => {
    await import("../src/homeii-music-flow.js?runtime-queue-ha-first-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    const player = {
      entity_id: "media_player.main",
      state: "playing",
      attributes: {
        active_queue: "queue-main",
        media_content_id: "spotify://track/1",
        media_title: "Track A",
        media_artist: "Artist A",
      },
    };
    const queueItem = {
      queue_item_id: "queue-1",
      sort_index: 0,
      media_item: {
        uri: "spotify://track/1",
        name: "Track A",
        media_type: "track",
        artists: [{ name: "Artist A" }],
      },
    };
    card._state.selectedPlayer = player.entity_id;
    card._state.players = [player];
    card._hasDirectMAConnection = vi.fn(() => true);
    card._callDirectMaCommand = vi.fn(async () => ({ items: [] }));
    card._fetchMassQueueItemsSnapshot = vi.fn(async () => null);
    card._prefetchQueueArtworkWindow = vi.fn();
    card._callService = vi.fn(async (service, payload, options) => {
      expect(service).toBe("get_queue");
      expect(payload).toMatchObject({ entity_id: player.entity_id });
      expect(payload).not.toHaveProperty("limit");
      expect(payload).not.toHaveProperty("queue_id");
      expect(options).toEqual({ includeConfigEntryId: false });
      return {
        queue_state: { queue_id: "queue-main", current_index: 0, items: 1, current_item: queueItem },
        items: [queueItem],
      };
    });

    await card._ensureQueueSnapshot(true);

    expect(card._callService).toHaveBeenCalledTimes(1);
    expect(card._callDirectMaCommand).not.toHaveBeenCalled();
    expect(card._fetchMassQueueItemsSnapshot).not.toHaveBeenCalled();
    expect(card._state.maQueueState.queue_id).toBe("queue-main");
    expect(card._state.queueItems).toHaveLength(1);
    expect(card._state.queueItems[0].media_item.name).toBe("Track A");
  });

  it("uses a scoped Home Assistant queue lookup when the unscoped queue snapshot is partial", async () => {
    await import("../src/homeii-music-flow.js?runtime-queue-ha-scoped-partial-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    const player = {
      entity_id: "media_player.main",
      state: "playing",
      attributes: {
        active_queue: "queue-main",
        media_content_id: "spotify://track/1",
        media_title: "Track A",
      },
    };
    const makeItem = (index) => ({
      queue_item_id: `queue-${index}`,
      sort_index: index,
      media_item: {
        uri: `spotify://track/${index}`,
        name: `Track ${index}`,
        media_type: "track",
      },
    });
    const fullItems = Array.from({ length: 4 }, (_, index) => makeItem(index));
    card._callService = vi.fn(async (service, payload, options) => {
      expect(service).toBe("get_queue");
      expect(options).toEqual({ includeConfigEntryId: false });
      if (payload.queue_id) {
        return {
          queue_state: { queue_id: "queue-main", current_index: 0, items: 4 },
          items: fullItems,
        };
      }
      return {
        queue_state: { queue_id: "queue-main", current_index: 0, items: 4 },
        items: fullItems.slice(0, 1),
      };
    });

    const snapshot = await card._fetchMusicAssistantQueueSnapshot(player);

    expect(card._callService).toHaveBeenCalledTimes(2);
    expect(card._callService).toHaveBeenNthCalledWith(1, "get_queue", { entity_id: player.entity_id }, { includeConfigEntryId: false });
    expect(card._callService).toHaveBeenNthCalledWith(2, "get_queue", { entity_id: player.entity_id, queue_id: "queue-main" }, { includeConfigEntryId: false });
    expect(snapshot.items).toHaveLength(4);
  });

  it("keeps the unscoped Home Assistant queue snapshot when scoped queue_id is rejected", async () => {
    await import("../src/homeii-music-flow.js?runtime-queue-ha-scoped-rejected-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    const player = {
      entity_id: "media_player.main",
      state: "playing",
      attributes: {
        active_queue: "queue-main",
        media_content_id: "spotify://track/1",
        media_title: "Track A",
      },
    };
    const queueItem = {
      queue_item_id: "queue-1",
      sort_index: 0,
      media_item: {
        uri: "spotify://track/1",
        name: "Track A",
        media_type: "track",
      },
    };
    card._callService = vi.fn(async (service, payload) => {
      if (payload.queue_id) throw new Error("extra keys not allowed @ data['queue_id']");
      return {
        queue_state: { queue_id: "queue-main", current_index: 0, items: 12 },
        items: [queueItem],
      };
    });

    const snapshot = await card._fetchMusicAssistantQueueSnapshot(player);

    expect(card._callService).toHaveBeenCalledTimes(2);
    expect(snapshot.items).toHaveLength(1);
    expect(snapshot.items[0].media_item.name).toBe("Track A");
  });

  it("loads and displays large Queue Actions snapshots without the previous 100-item cap", async () => {
    await import("../src/homeii-music-flow.js?runtime-mass-queue-large-snapshot-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    const player = {
      entity_id: "media_player.office",
      attributes: {
        media_title: "Track 101",
        media_artist: "Artist 101",
      },
    };
    const items = Array.from({ length: 691 }, (_, index) => ({
      queue_item_id: `queue-${index}`,
      sort_index: index,
      media_item: {
        uri: `spotify://track/${index}`,
        name: `Track ${index}`,
        media_type: "track",
        artists: [{ name: `Artist ${index}` }],
      },
    }));
    const sendMessagePromise = vi.fn(async () => ({
      response: {
        queue_state: { current_index: 101, items: items.length },
        items,
      },
    }));
    card._hass = { connection: { sendMessagePromise } };
    card._hasMassQueueService = vi.fn(() => true);

    const snapshot = await card._fetchMassQueueItemsSnapshot(player);

    expect(sendMessagePromise).toHaveBeenCalledWith({
      type: "call_service",
      domain: "mass_queue",
      service: "get_queue_items",
      service_data: {
        entity: player.entity_id,
        limit: 1000,
        offset: 0,
      },
      return_response: true,
    });
    expect(snapshot.items).toHaveLength(691);

    card._state.queueItems = snapshot.items;
    card._state.maQueueState = snapshot.state;
    expect(card._getNowPlayingQueueItems()).toHaveLength(590);
    expect(card._getNowPlayingQueueItems()[0].sort_index).toBe(101);
  });

  it("uses direct Music Assistant queue snapshots only after Home Assistant queue lookups fail", async () => {
    await import("../src/homeii-music-flow.js?runtime-queue-direct-fallback-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    const player = {
      entity_id: "media_player.main",
      state: "playing",
      attributes: {
        active_queue: "queue-main",
        media_content_id: "spotify://track/2",
        media_title: "Track B",
      },
    };
    card._state.selectedPlayer = player.entity_id;
    card._state.players = [player];
    card._hasDirectMAConnection = vi.fn(() => true);
    card._callService = vi.fn(async () => { throw new Error("HA queue unavailable"); });
    card._fetchMassQueueItemsSnapshot = vi.fn(async () => null);
    card._prefetchQueueArtworkWindow = vi.fn();
    card._callDirectMaCommand = vi.fn(async (command) => {
      if (command === "player_queues/get") return { queue_id: "queue-main", current_index: 1, items: 2 };
      if (command === "player_queues/items") {
        return {
          items: [{
            queue_item_id: "queue-2",
            sort_index: 1,
            media_item: { uri: "spotify://track/2", name: "Track B", media_type: "track" },
          }],
        };
      }
      return null;
    });

    await card._ensureQueueSnapshot(true);

    expect(card._callService).toHaveBeenCalledTimes(1);
    expect(card._fetchMassQueueItemsSnapshot).toHaveBeenCalledTimes(1);
    expect(card._callDirectMaCommand).toHaveBeenCalledWith("player_queues/get", { queue_id: "queue-main" });
    expect(card._callDirectMaCommand).toHaveBeenCalledWith("player_queues/items", { queue_id: "queue-main", limit: 50, offset: 0 });
    expect(card._state.queueItems).toHaveLength(1);
    expect(card._state.queueItems[0].media_item.name).toBe("Track B");
  });

  it("does not use a not_loaded Music Assistant config entry for service calls", async () => {
    await import("../src/homeii-music-flow.js?runtime-ma-not-loaded-config-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    card._hass = {
      connection: {
        sendMessagePromise: vi.fn(async () => [
          { entry_id: "ma-entry", domain: "music_assistant", state: "not_loaded" },
        ]),
      },
    };

    await expect(card._ensureConfigEntryId(true)).resolves.toBe("");
    expect(card._resolvedConfigEntryId).toBe("ma-entry");
    expect(card._resolvedConfigEntryState).toBe("not_loaded");
    expect(card._hasUsableMusicAssistantConfigEntry()).toBe(false);
  });

  it("passes discovered config_entry_id to Home Assistant Music Assistant services even when the entry lookup is not_loaded", async () => {
    await import("../src/homeii-music-flow.js?runtime-ma-service-signal-fallback-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    const sendMessagePromise = vi.fn(async (message) => {
      if (message.type === "config_entries/get") {
        return [{ entry_id: "ma-entry", domain: "music_assistant", state: "not_loaded" }];
      }
      return { items: [] };
    });
    card._hass = {
      services: {
        music_assistant: {
          get_library: {},
        },
      },
      connection: { sendMessagePromise },
    };

    await expect(card._callService("get_library", { media_type: "album" })).resolves.toEqual({ items: [] });

    expect(sendMessagePromise).toHaveBeenCalledWith(expect.objectContaining({
      type: "call_service",
      domain: "music_assistant",
      service: "get_library",
      service_data: { config_entry_id: "ma-entry", media_type: "album" },
    }));
    expect(card._resolvedConfigEntryId).toBe("ma-entry");
    expect(card._resolvedConfigEntryState).toBe("not_loaded");
    expect(card._state.musicAssistantIssueMessage).toBe("");
  });

  it("uses generic HA media_player fallback when Music Assistant services exist but player markers are missing", async () => {
    await import("../src/homeii-music-flow.js?runtime-ma-generic-player-fallback-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    const player = {
      entity_id: "media_player.master_bath",
      state: "playing",
      attributes: {
        friendly_name: "Master Bath",
        media_title: "Introduction",
      },
    };
    card._hass = {
      services: {
        music_assistant: {
          get_library: {},
          play_media: {},
        },
      },
      states: {
        [player.entity_id]: player,
      },
      entities: {
        [player.entity_id]: { platform: "alexa_media" },
      },
    };

    card._loadPlayers();
    card._selectPlayer(player.entity_id, true);

    expect(card._state.players.map((entity) => entity.entity_id)).toContain(player.entity_id);
    expect(card._playerByEntityId(player.entity_id)).toBe(player);
    expect(card._state.selectedPlayer).toBe(player.entity_id);
    expect(card._state.musicAssistantIssueMessage).toBe("");
    expect(card._diagnosticIsStrictMusicAssistantPlayer(player, card._hass.entities)).toBe(false);
    expect(card._diagnosticPlayerMarkerSummary(player, card._hass.entities)).toContain("registry_platform=alexa_media");
  });

  it("disambiguates generic and duplicate player labels at runtime", async () => {
    await import("../src/homeii-music-flow.js?runtime-player-label-disambiguation-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    const players = [
      {
        entity_id: "media_player.kitchen_speaker",
        state: "idle",
        attributes: { friendly_name: "Media Player", app_id: "music_assistant" },
      },
      {
        entity_id: "media_player.bedroom_speaker",
        state: "idle",
        attributes: { friendly_name: "Media Player", app_id: "music_assistant" },
      },
      {
        entity_id: "media_player.living_room",
        state: "idle",
        attributes: { friendly_name: "Living Room", app_id: "music_assistant" },
      },
    ];

    card._state.players = players;

    expect(card._playerDisplayName(players[0], players)).toBe("Media Player (Kitchen Speaker)");
    expect(card._playerDisplayName(players[1], players)).toBe("Media Player (Bedroom Speaker)");
    expect(card._playerDisplayName(players[2], players)).toBe("Living Room");
  });

  it("lets repeated card issue notices be acknowledged without hiding new issue text", async () => {
    await import("../src/homeii-music-flow.js?runtime-card-issue-ack-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    const notices = [];
    card._config = { card_id: "issue-ack-test" };
    card._toastError = (message, options = {}) => notices.push({ message, options });

    card._notifyCardIssue("music-assistant-not-ready", "Music Assistant is not ready", "error", 0);
    expect(notices).toHaveLength(1);
    expect(notices[0].options.issueAckKey).toBe("music-assistant-not-ready");
    expect(notices[0].options.issueAckText).toBe("Music Assistant is not ready");

    card._acknowledgeCardIssue(notices[0].options.issueAckKey, notices[0].options.issueAckText);
    card._notifyCardIssue("music-assistant-not-ready", "Music Assistant is not ready", "error", 0);
    expect(notices).toHaveLength(1);

    card._notifyCardIssue("music-assistant-not-ready", "Music Assistant timed out", "error", 0);
    expect(notices).toHaveLength(2);
    expect(notices[1].message).toBe("Music Assistant timed out");
  });

  it("selects a player from the dashboard query string", async () => {
    await import("../src/homeii-music-flow.js?runtime-query-string-player-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const previousLocation = globalThis.window.location;
    globalThis.window.location = {
      href: "http://home.local/lovelace/music?player=kitchen_sonos",
      search: "?player=kitchen_sonos",
      hash: "",
      origin: "http://home.local",
      hostname: "home.local",
      protocol: "http:",
    };
    try {
      const CardCtor = globalThis.customElements.get("homeii-music-flow");
      const card = new CardCtor();
      const kitchen = {
        entity_id: "media_player.kitchen_sonos",
        state: "idle",
        attributes: { friendly_name: "Kitchen Sonos", app_id: "music_assistant", mass_player_type: "player" },
      };
      const office = {
        entity_id: "media_player.office",
        state: "playing",
        attributes: { friendly_name: "Office", app_id: "music_assistant", mass_player_type: "player" },
      };
      card._hass = {
        services: { music_assistant: { play_media: {} } },
        states: {
          [office.entity_id]: office,
          [kitchen.entity_id]: kitchen,
        },
        entities: {},
      };

      card._loadPlayers();

      expect(card._state.selectedPlayer).toBe(kitchen.entity_id);
    } finally {
      globalThis.window.location = previousLocation;
    }
  });

  it("keeps an explicitly configured player visible even when pinned players are set", async () => {
    await import("../src/homeii-music-flow.js?runtime-configured-player-pinned-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    card.setConfig({
      type: "custom:homeii-music-flow",
      entity: "media_player.office",
      pinned_player_entities: ["media_player.living_room"],
    });
    const office = {
      entity_id: "media_player.office",
      state: "idle",
      attributes: { friendly_name: "Office", app_id: "music_assistant", mass_player_type: "player" },
    };
    const livingRoom = {
      entity_id: "media_player.living_room",
      state: "idle",
      attributes: { friendly_name: "Living Room", app_id: "music_assistant", mass_player_type: "player" },
    };
    card._hass = {
      services: { music_assistant: { play_media: {} } },
      states: {
        [office.entity_id]: office,
        [livingRoom.entity_id]: livingRoom,
      },
      entities: {},
    };

    card._loadPlayers();

    expect(card._state.players.map((entity) => entity.entity_id)).toContain(office.entity_id);
    expect(card._state.players.map((entity) => entity.entity_id)).toContain(livingRoom.entity_id);
    expect(card._state.selectedPlayer).toBe(office.entity_id);
  });

  it("does not let the configured player override a manual player selection", async () => {
    await import("../src/homeii-music-flow.js?runtime-configured-player-manual-selection-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    card.setConfig({
      type: "custom:homeii-music-flow",
      entity: "media_player.office",
    });
    const office = {
      entity_id: "media_player.office",
      state: "idle",
      attributes: { friendly_name: "Office", app_id: "music_assistant", mass_player_type: "player" },
    };
    const kitchen = {
      entity_id: "media_player.kitchen",
      state: "idle",
      attributes: { friendly_name: "Kitchen", app_id: "music_assistant", mass_player_type: "player" },
    };
    card._hass = {
      services: { music_assistant: { play_media: {} } },
      states: {
        [office.entity_id]: office,
        [kitchen.entity_id]: kitchen,
      },
      entities: {},
    };

    card._loadPlayers();
    expect(card._state.selectedPlayer).toBe(office.entity_id);

    card._selectPlayer(kitchen.entity_id, true);
    card._loadPlayers();

    expect(card._state.selectedPlayer).toBe(kitchen.entity_id);
  });

  it("reports browser-blocked Direct API as optional when the HA Music Assistant integration is available", async () => {
    await import("../src/homeii-music-flow.js?runtime-direct-ma-cors-integration-fallback-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    card.setConfig({
      type: "custom:homeii-music-flow",
      ma_url: "http://192.168.2.61:8095",
    });
    card._hass = {
      services: {
        music_assistant: {
          get_library: {},
        },
      },
    };

    const originalFetch = globalThis.fetch;
    const fetchMock = vi.fn(async () => {
      throw new TypeError("Failed to fetch");
    });
    globalThis.fetch = fetchMock;
    try {
      await expect(card._callDirectMaCommand("players/all")).rejects.toThrow(/blocked by the browser/i);
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(card._state.musicAssistantIssueMessage).toBe("");
      await expect(card._callDirectMaCommand("players/all")).rejects.toThrow(/blocked by the browser/i);
      expect(fetchMock).toHaveBeenCalledTimes(1);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("loads library items through direct Music Assistant when the HA entry is not loaded", async () => {
    await import("../src/homeii-music-flow.js?runtime-library-direct-entry-fallback-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    card._hasDirectMAConnection = vi.fn(() => true);
    card._callService = vi.fn(async () => {
      throw new Error("Music Assistant entry not_loaded");
    });
    card._callDirectMaCommand = vi.fn(async () => ({
      items: [{
        item_id: "playlist-1",
        provider: "library",
        media_type: "playlist",
        name: "Morning Flow",
      }],
    }));

    const items = await card._fetchLibrary("playlist", "sort_name", 50, false);

    expect(card._callService).toHaveBeenCalledWith("get_library", {
      media_type: "playlist",
      order_by: "sort_name",
      limit: 50,
    });
    expect(card._callDirectMaCommand).toHaveBeenCalledWith("music/playlists/library_items", {
      limit: 50,
      offset: 0,
      order_by: "sort_name",
    });
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      media_type: "playlist",
      name: "Morning Flow",
    });
    expect(card._state.musicAssistantIssueMessage).toBe("");
  });

  it("does not treat the Home Assistant Music Assistant ingress URL as a direct MA API URL", async () => {
    await import("../src/homeii-music-flow.js?runtime-direct-ma-ingress-guard-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    card.classList = createClassList();
    card.setConfig({
      type: "custom:homeii-music-flow",
      ma_url: "http://homeassistant.local:8123/d5369777_music_assistant",
    });

    expect(card._isLikelyHomeAssistantIngressMaUrl(card._maBrowserUrl())).toBe(true);
    expect(card._hasDirectMAConnection()).toBe(false);
    await expect(card._callDirectMaCommand("players/all")).rejects.toThrow(/ingress/i);
  });

  it("backs off direct Music Assistant API retries after an invalid ma_url returns 405", async () => {
    await import("../src/homeii-music-flow.js?runtime-direct-ma-405-backoff-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    card.classList = createClassList();
    card.setConfig({
      type: "custom:homeii-music-flow",
      ma_url: "http://192.168.2.61:8095",
    });

    const originalFetch = globalThis.fetch;
    const fetchMock = vi.fn(async () => ({
      ok: false,
      status: 405,
      text: async () => "Method Not Allowed",
    }));
    globalThis.fetch = fetchMock;
    try {
      await expect(card._callDirectMaCommand("players/all")).rejects.toThrow(/direct api/i);
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(card._hasDirectMAConnection()).toBe(false);
      await expect(card._callDirectMaCommand("players/all")).rejects.toThrow(/direct api/i);
      expect(fetchMock).toHaveBeenCalledTimes(1);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("falls back to direct Music Assistant playback when HA reports the MA entry is not loaded", async () => {
    await import("../src/homeii-music-flow.js?runtime-play-direct-entry-fallback-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    const player = {
      entity_id: "media_player.ceiling",
      state: "playing",
      attributes: {
        friendly_name: "Ceiling",
        active_queue: "queue-ceiling",
      },
    };
    card._state.players = [player];
    card._hasDirectMAConnection = vi.fn(() => true);
    card._callHaServiceRaw = vi.fn(async () => {
      throw new Error("Music Assistant entry not_loaded");
    });
    card._callHaServiceTargeted = vi.fn(async () => ({}));
    card._callDirectMaCommand = vi.fn(async () => ({}));
    card._toastMediaQueued = vi.fn();

    const ok = await card._playMediaOnPlayer(player.entity_id, "library://playlist/1", "playlist", "play", {
      label: "Morning Flow",
    });

    expect(ok).toBe(true);
    expect(card._callHaServiceTargeted).not.toHaveBeenCalled();
    expect(card._callDirectMaCommand).toHaveBeenCalledWith("player_queues/play_media", {
      queue_id: "queue-ceiling",
      media: "library://playlist/1",
      option: "replace",
      radio_mode: false,
    });
    expect(card._toastMediaQueued).toHaveBeenCalledWith("Morning Flow", "Ceiling");
  });

  it("sends music_assistant.play_media with entity_id in service data first", async () => {
    await import("../src/homeii-music-flow.js?runtime-play-media-target-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    const player = {
      entity_id: "media_player.kitchen",
      state: "idle",
      attributes: { friendly_name: "Kitchen", app_id: "music_assistant" },
    };
    card._state.players = [player];
    card._callHaServiceTargeted = vi.fn(async () => ({}));
    card._callHaServiceRaw = vi.fn(async () => ({}));
    card._toastMediaQueued = vi.fn();

    const ok = await card._playMediaOnPlayer(player.entity_id, "library://playlist/1", "playlist", "play", {
      label: "Kitchen Mix",
    });

    expect(ok).toBe(true);
    expect(card._callHaServiceRaw).toHaveBeenCalledWith("music_assistant", "play_media", {
      entity_id: player.entity_id,
      media_id: "library://playlist/1",
      media_type: "playlist",
      enqueue: "play",
    });
    expect(card._callHaServiceTargeted).not.toHaveBeenCalled();
    expect(card._toastMediaQueued).toHaveBeenCalledWith("Kitchen Mix", "Kitchen");
  });

  it("keeps music_assistant.play_media as the primary playback path when media_player.play_media exists", async () => {
    await import("../src/homeii-music-flow.js?runtime-play-media-primary-path-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    const player = {
      entity_id: "media_player.kitchen",
      state: "idle",
      attributes: { friendly_name: "Kitchen", app_id: "music_assistant", mass_player_type: "player" },
    };
    card._hass = {
      services: {
        media_player: { play_media: {} },
        music_assistant: { play_media: {} },
      },
      states: { [player.entity_id]: player },
    };
    card._state.players = [player];
    card._callHaServiceTargeted = vi.fn(async () => ({}));
    card._callHaServiceRaw = vi.fn(async () => ({}));
    card._toastMediaQueued = vi.fn();

    const ok = await card._playMediaOnPlayer(player.entity_id, "library://playlist/1", "playlist", "play", {
      label: "Kitchen Mix",
    });

    expect(ok).toBe(true);
    expect(card._callHaServiceRaw).toHaveBeenNthCalledWith(1, "music_assistant", "play_media", {
      entity_id: player.entity_id,
      media_id: "library://playlist/1",
      media_type: "playlist",
      enqueue: "play",
    });
    expect(card._callHaServiceRaw).not.toHaveBeenCalledWith(
      "media_player",
      "play_media",
      expect.anything(),
    );
    expect(card._callHaServiceTargeted).not.toHaveBeenCalled();
  });

  it("keeps pending queue artwork and title atomic while the player still reports the previous track", async () => {
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    await import("../src/homeii-music-flow.js?runtime-pending-display-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    const player = {
      entity_id: "media_player.main",
      state: "idle",
      attributes: {
        active_queue: "queue-main",
        media_content_id: "spotify://track/old",
        media_title: "Old Track",
        media_artist: "Old Artist",
        entity_picture: "https://ha.local/old.jpg",
      },
    };
    const nextItem = {
      queue_item_id: "queue-item-new",
      sort_index: 4,
      media_item: {
        uri: "spotify://track/new",
        name: "New Track",
        media_type: "track",
        image: "https://ha.local/new.jpg",
        artists: [{ name: "New Artist" }],
        album: { name: "New Album" },
      },
    };
    card._state.selectedPlayer = player.entity_id;
    card._state.players = [player];
    card._state.queueItems = [nextItem];
    card._state.maQueueState = { current_index: 4, current_item: nextItem };
    card._state.mobileQueuePlayPendingUntil = Date.now() + 8500;
    card._state.mobileQueuePlayPendingKey = card._getQueueItemPlaybackId(nextItem) || card._getQueueItemStableId(nextItem) || card._getQueueItemKey(nextItem);
    card._state.mobileQueuePlayPendingUri = card._getQueueItemUri(nextItem);
    card._state.mobileQueuePlayPendingIndex = 4;

    const source = card._mobileNowPlayingDisplaySource(card._getSelectedPlayer(), nextItem, { current: nextItem });
    const caughtUpPlayer = {
      ...player,
      state: "playing",
      attributes: {
        ...player.attributes,
        media_content_id: "spotify://track/new",
        media_title: "New Track",
        media_artist: "New Artist",
        entity_picture: "https://ha.local/new.jpg",
      },
    };
    const stableSource = card._mobileNowPlayingDisplaySource(caughtUpPlayer, nextItem, { current: nextItem });

    expect(source.title).toBe("New Track");
    expect(source.artist).toBe("New Artist");
    expect(source.album).toBe("New Album");
    expect(source.art).toContain("new.jpg");
    expect(source.art).not.toContain("old.jpg");
    expect(stableSource.art).toBe(source.art);
  });

  it("prefers Home Assistant player artwork for current now playing outside pending transitions", async () => {
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    await import("../src/homeii-music-flow.js?runtime-current-player-art-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    card._maUrl = "http://192.168.1.20:8095";
    const player = {
      entity_id: "media_player.main",
      state: "playing",
      attributes: {
        active_queue: "queue-main",
        media_content_id: "spotify://track/current",
        media_title: "Current Track",
        media_artist: "Current Artist",
        entity_picture: "https://ha.local/api/media_player_proxy/media_player.main?token=abc",
      },
    };
    const currentItem = {
      queue_item_id: "queue-item-current",
      sort_index: 2,
      media_item: {
        uri: "spotify://track/current",
        name: "Current Track",
        media_type: "track",
        image: { path: "spotify/current.jpg", provider: "spotify" },
        artists: [{ name: "Current Artist" }],
      },
    };
    card._state.selectedPlayer = player.entity_id;
    card._state.players = [player];
    card._state.queueItems = [currentItem];
    card._state.maQueueState = { current_index: 2, current_item: currentItem };

    const source = card._mobileNowPlayingDisplaySource(player, currentItem, { current: currentItem });
    expect(source.art).toContain("/api/media_player_proxy/media_player.main");
    expect(source.art).not.toContain("/imageproxy");

    card._state.mobileQueuePlayPendingUntil = Date.now() + 8500;
    card._state.mobileQueuePlayPendingKey = card._getQueueItemPlaybackId(currentItem) || card._getQueueItemStableId(currentItem) || card._getQueueItemKey(currentItem);
    card._state.mobileQueuePlayPendingUri = card._getQueueItemUri(currentItem);
    card._state.mobileQueuePlayPendingIndex = 2;

    const pendingSource = card._mobileNowPlayingDisplaySource(player, currentItem, { current: currentItem });
    expect(pendingSource.art).toContain("/imageproxy");
  });

  it("uses player artwork in the mobile stack when queue artwork is unavailable", async () => {
    await import("../src/homeii-music-flow.js?runtime-mobile-stack-player-art-fallback");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    const player = {
      entity_id: "media_player.music_assistant_edge_on_windows",
      state: "playing",
      attributes: {
        app_id: "music_assistant",
        source: "Music Assistant Queue",
        mass_player_type: "player",
        active_queue: "ma_9en0v94t93",
        media_content_id: "library://track/1874",
        media_title: "Introduction",
        media_artist: "B.B. King",
        media_album_name: "Kansas City 1972",
        entity_picture: "/api/media_player_proxy/media_player.music_assistant_edge_on_windows?token=abc&cache=5e5e1249decbcfcf",
      },
    };
    card._state.selectedPlayer = player.entity_id;
    card._state.players = [player];
    card._state.queueItems = [];
    card._state.maQueueState = { current_index: null, current_item: null };

    const art = card._mobileStackItemArtwork(null, "center");
    expect(art).toContain("/api/media_player_proxy/media_player.music_assistant_edge_on_windows");

    const html = card._mobileArtworkStackHtml();
    expect(html).toContain("<img");
    expect(html).toContain("Introduction");
    expect(html).not.toContain("art-stack-card center placeholder");
    expect(html).not.toContain("queue-flow-picker");
  });

  it("renders the opt-in vertical queue flow inside the queue menu without changing the main artwork stack", async () => {
    await import("../src/homeii-music-flow.js?runtime-mobile-vertical-queue-flow");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    const queueItems = Array.from({ length: 5 }, (_, index) => ({
      queue_item_id: `queue-${index}`,
      sort_index: index,
      media_item: {
        uri: `spotify://track/${index}`,
        name: `Track ${index}`,
        media_type: "track",
        image: `https://ha.local/art-${index}.jpg`,
      },
    }));
    const player = {
      entity_id: "media_player.main",
      state: "playing",
      attributes: {
        media_content_id: "spotify://track/2",
        media_title: "Track 2",
        media_artist: "Artist 2",
      },
    };
    card._config = { ...(card._config || {}), settings_source: "visual", mobile_queue_flow: false };
    card._state.mobileQueueFlow = false;
    card._state.mobileQuickActions = ["queue", "queue_flow"];
    card._state.mobileQueueFlowQuickOpen = true;
    card._state.selectedPlayer = player.entity_id;
    card._state.players = [player];
    card._state.queueItems = queueItems;
    card._state.maQueueState = { current_index: 2, current_item: queueItems[2] };

    const artworkHtml = card._mobileArtworkStackHtml();
    const queueHtml = card._queueMenuHtml();

    expect(card._mobileQueueFlowEnabled()).toBe(true);
    expect(artworkHtml).not.toContain("queue-flow-picker");
    expect(artworkHtml.match(/art-stack-slide/g)).toHaveLength(3);
    expect(queueHtml).toContain("queue-flow-picker");
    expect(queueHtml).not.toContain("queue-list");
    expect(queueHtml).toContain("queue-flow-art");
    expect(queueHtml).not.toContain("queue-flow-copy");
    expect(queueHtml).toContain("queue-flow-caption");
    expect(queueHtml.match(/data-queue-flow-item/g)).toHaveLength(5);
    expect(queueHtml).toContain("queue-flow-item active centered");
    expect(queueHtml).toContain("Track 2");
    expect(queueHtml).toContain("Artist 2");
    expect(queueHtml).not.toContain("Track 0");
    expect(queueHtml).not.toContain("Track 4");
    expect(card._mobileVisibleQuickActions(["queue", "queue_flow"])).toContain("queue_flow");

    card._state.queueItems = [];
    card._state.maQueueState = { current_index: 2, current_item: null };
    const fallbackQueueHtml = card._queueMenuHtml();
    expect(fallbackQueueHtml).toContain("queue-flow-static");
    expect(fallbackQueueHtml).toContain("Track 2");

    card._state.queueItems = queueItems;
    card._state.maQueueState = { current_index: 2, current_item: queueItems[2] };
    card._build();
    expect(card.shadowRoot.innerHTML).not.toContain('id="mobileQueueFlowTopBtn"');
    card._state.mobileQueueFlow = false;
    card._config.mobile_queue_flow = false;
    card._state.mobileQueueFlow = true;
    card._config.mobile_queue_flow = true;

    const largeQueueItems = Array.from({ length: 120 }, (_, index) => ({
      queue_item_id: `large-${index}`,
      sort_index: index,
      media_item: {
        uri: `spotify://large/${index}`,
        name: `Large Track ${index}`,
        media_type: "track",
        image: `https://ha.local/large-${index}.jpg`,
      },
    }));
    card._state.queueItems = largeQueueItems;
    card._state.maQueueState = { current_index: 80, current_item: largeQueueItems[80] };
    const largeQueueHtml = card._queueMenuHtml();
    expect(largeQueueHtml.match(/data-queue-flow-item/g)).toHaveLength(72);
    expect(largeQueueHtml).toContain('data-queue-flow-total="120"');

    const playSpy = vi.fn().mockResolvedValue(true);
    const closeSpy = vi.fn();
    card._playQueueItem = playSpy;
    card._closeMobileMenu = closeSpy;
    card._showLibraryInteractionFeedback = vi.fn();
    await card._handleMobileMenuClick({
      target: {
        closest: (selector) => selector === "[data-queue-flow-item]" ? {
          dataset: {
            queueItemId: "queue-4",
            uri: "spotify://track/4",
            type: "track",
            sortIndex: "4",
          },
        } : null,
      },
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    });
    expect(playSpy).toHaveBeenCalledWith("queue-4", "spotify://track/4", "track", "4");
    expect(closeSpy).toHaveBeenCalled();

    card._state.mobileQueueFlowQuickOpen = false;
    expect(card._queueMenuHtml()).not.toContain("queue-flow-picker");
    expect(card._mobileVisibleQuickActions(["queue", "queue_flow"])).toContain("queue_flow");
    card._state.mobileQueueFlow = false;
    card._config.mobile_queue_flow = false;
    card._state.mobileQuickActions = ["queue"];
    expect(card._mobileVisibleQuickActions(["queue", "queue_flow"])).not.toContain("queue_flow");
  });

  it("renders library pages and artist albums with the queue-flow style browser", async () => {
    await import("../src/homeii-music-flow.js?runtime-library-flow-browser");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    const albums = [
      {
        uri: "library://album/1",
        media_type: "album",
        name: "Album One",
        artist: "Artist One",
        year: 1999,
        image: "https://ha.local/album-one.jpg",
      },
      {
        uri: "library://album/2",
        media_type: "album",
        name: "Album Two",
        artist: "Artist Two",
      },
    ];

    card._state.menuPage = "library_albums";
    card._state.mobileLibraryFlowPage = "library_albums";
    const toolbarHtml = card._mediaLayoutToolbarHtml();
    const libraryFlowHtml = card._libraryFlowPickerHtml(albums, "album");

    expect(toolbarHtml).toContain('data-library-flow-toggle="library_albums"');
    expect(toolbarHtml).toContain("Library wheel");
    expect(libraryFlowHtml).toContain("queue-flow-picker");
    expect(libraryFlowHtml).toContain("data-library-flow-item");
    expect(libraryFlowHtml).toContain('data-media-open="library://album/1"');
    expect(libraryFlowHtml).toContain('data-flow-caption-title="Album One"');
    expect(libraryFlowHtml).not.toContain("data-queue-flow-item");

    card._state.mobileLibraryDetail = {
      media_type: "artist",
      name: "Artist One",
      albums,
      playlists: [],
    };
    const artistHtml = card._libraryArtistDetailHtml({
      media_type: "artist",
      name: "Artist One",
      albums,
      playlists: [],
    });
    const artistAlbumFlowHtml = card._artistAlbumFlowMenuHtml();
    expect(artistHtml).toContain("data-artist-album-flow-open");
    expect(artistHtml).toContain("Album wheel");
    expect(artistHtml).not.toContain("artist-album-flow-page");
    expect(artistHtml).not.toContain("queue-flow-picker");
    expect(artistAlbumFlowHtml).toContain("artist-album-flow-page");
    expect(artistAlbumFlowHtml).toContain("library-flow-full-stage");
    expect(artistAlbumFlowHtml).toContain("queue-flow-picker");
    expect(artistAlbumFlowHtml).not.toContain("library-flow-panel");
    expect(artistAlbumFlowHtml).toContain('data-flow-caption-title="Album One"');
    expect(artistAlbumFlowHtml).toContain('data-flow-caption-artist="1999"');

    const radioFlowHtml = card._libraryFlowPickerHtml([
      {
        uri: "radio://station/1",
        media_type: "radio",
        name: "Station One",
      },
    ], "radio", { className: "library-radio-flow", captionMode: "radio_station" });
    expect(radioFlowHtml).toContain("queue-flow-picker");
    expect(radioFlowHtml).toContain('data-flow-caption-title="Station One"');
    expect(radioFlowHtml).toContain('data-flow-caption-artist=""');
  });

  it("adds a favorites-only filter to library tabs", async () => {
    await import("../src/homeii-music-flow.js?runtime-library-favorites-filter-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    card._state.menuPage = "library_albums";

    expect(card._mediaLayoutToolbarHtml()).toContain('data-library-favorites-toggle="library_albums"');
    expect(card._mediaLayoutToolbarHtml()).not.toContain("subtle-heart");
    expect(card._mediaLayoutToolbarHtml()).not.toContain("Favorites only</span>");

    card._setLibraryFavoritesOnly("library_albums", true);
    expect(card._libraryFavoritesOnlyEnabled("library_albums")).toBe(true);
    expect(card._mediaLayoutToolbarHtml()).toContain("library-favorites-toggle active");
    expect(card._mediaLayoutToolbarHtml()).not.toContain("Favorites only</span>");

    card._getLibrary = vi.fn(async () => []);
    await card._getLibraryTabItems({ type: "album" }, "sort_name", 25, "", true);

    expect(card._getLibrary).toHaveBeenCalledWith("album", "sort_name", 25, true);
  });

  it("favorites library radio items by item identity instead of current media", async () => {
    await import("../src/homeii-music-flow.js?runtime-library-radio-favorite-item-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    const calls = [];
    const entry = {
      uri: "radio://station/one",
      media_type: "radio",
      name: "Station One",
      favorite_scope: "library",
    };

    card._useMaLikedMode = () => true;
    card._hasDirectMAConnection = () => true;
    card._getSelectedPlayer = () => ({
      entity_id: "media_player.kitchen",
      attributes: {
        media_content_id: "radio://station/one",
        media_title: "Station One",
      },
    });
    card._currentMediaLikeMeta = () => ({
      uri: "radio://station/one",
      media_type: "radio",
      name: "Station One",
    });
    card._callDirectMaCommand = vi.fn(async (command, args) => {
      calls.push({ command, args });
      return {};
    });
    card._waitForFavoriteState = vi.fn(async () => true);
    card._toggleLikeViaMassQueue = vi.fn(async () => true);
    card._pressFavoriteButtonEntity = vi.fn(async () => true);
    card._toast = vi.fn();
    card._toastError = vi.fn();

    expect(card._entryTargetsCurrentMedia(entry)).toBe(false);
    await expect(card._toggleLikeEntry(entry)).resolves.toBe(true);

    expect(card._callDirectMaCommand).toHaveBeenCalledWith("music/favorites/add_item", { item: "radio://station/one" });
    expect(calls[0]).toEqual({ command: "music/favorites/add_item", args: { item: "radio://station/one" } });
    expect(card._toggleLikeViaMassQueue).not.toHaveBeenCalled();
    expect(card._pressFavoriteButtonEntity).not.toHaveBeenCalled();
    expect(card._toastError).not.toHaveBeenCalled();
  });

  it("reports a failed media action favorite without treating it as success", async () => {
    await import("../src/homeii-music-flow.js?runtime-library-radio-favorite-failure-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    const entry = {
      uri: "radio://station/one",
      media_type: "radio",
      name: "Station One",
      favorite_scope: "library",
    };
    card._toggleLikeEntry = vi.fn(async () => false);
    card._toastSuccess = vi.fn();

    await expect(card._handleMobileMediaAction("like", entry)).resolves.toBe(false);
    expect(card._toggleLikeEntry).toHaveBeenCalledWith(entry);
    expect(card._toastSuccess).not.toHaveBeenCalled();
  });

  it("keeps the library toolbar icon-only and removes decorative question marks", async () => {
    await import("../src/homeii-music-flow.js?runtime-library-toolbar-icon-only-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    card._state.menuPage = "library_playlists";

    const toolbarHtml = card._mediaLayoutToolbarHtml();

    expect(toolbarHtml).toContain('data-library-flow-toggle="library_playlists"');
    expect(toolbarHtml).toContain('data-library-favorites-toggle="library_playlists"');
    expect(toolbarHtml).not.toContain("subtle-heart");
    expect(toolbarHtml).not.toContain("Favorites only</span>");
    expect(toolbarHtml).not.toContain("Wheel</span>");
    expect(card._mobileSortOptions().map((opt) => opt.label).join(" ")).not.toContain("?");
  });

  it("keeps the configured library list layout instead of forcing grid", async () => {
    await import("../src/homeii-music-flow.js?runtime-library-list-layout-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    card._state.mobileMediaLayout = "list";
    const items = [
      {
        uri: "library://album/1",
        media_type: "album",
        name: "Album One",
        artist: "Artist One",
        image: "https://ha.local/album-one.jpg",
      },
    ];

    const libraryHtml = card._mediaItemsListHtml(items, "album", { librarySkin: true });
    const likedHtml = card._likedMediaEntriesHtml(items);
    const searchHtml = card._libraryTabSearchResultsHtml(items, "album");
    const artistHtml = card._libraryArtistDetailHtml({ name: "Artist One", albums: items, playlists: [] });

    expect(libraryHtml).toContain("layout-list");
    expect(likedHtml).toContain("layout-list");
    expect(searchHtml).toContain("layout-list");
    expect(searchHtml).not.toContain("layout-grid");
    expect(artistHtml).toContain("layout-list");
  });

  it("toggles library flow and opens artist album flow from mobile menu buttons", async () => {
    await import("../src/homeii-music-flow.js?runtime-library-flow-toggle");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    card._state.menuPage = "library_albums";
    card._renderMobileMenu = vi.fn();
    card._pushMobileMenu = vi.fn();
    card._showLibraryInteractionFeedback = vi.fn();

    const eventForSelector = (selector, element) => ({
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      target: {
        closest: vi.fn((candidate) => (candidate === selector ? element : null)),
      },
    });

    await card._handleMobileMenuClick(eventForSelector("[data-library-flow-toggle]", {
      dataset: { libraryFlowToggle: "library_albums" },
    }));
    expect(card._state.mobileLibraryFlowPage).toBe("library_albums");
    expect(card._renderMobileMenu).toHaveBeenCalledTimes(1);

    await card._handleMobileMenuClick(eventForSelector("[data-artist-album-flow-open]", {
      dataset: { artistAlbumFlowOpen: "1" },
    }));
    expect(card._pushMobileMenu).toHaveBeenCalledWith("artist_album_flow");
    expect(card._renderMobileMenu).toHaveBeenCalledTimes(1);
  });

  it("renders the opt-in vertical cover flow on the main artwork without changing the queue menu flag", async () => {
    await import("../src/homeii-music-flow.js?runtime-mobile-cover-flow");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    const queueItems = Array.from({ length: 5 }, (_, index) => ({
      queue_item_id: `cover-${index}`,
      sort_index: index,
      media_item: {
        uri: `spotify://cover/${index}`,
        name: `Cover Track ${index}`,
        media_type: "track",
        image: `https://ha.local/cover-${index}.jpg`,
      },
    }));
    const player = {
      entity_id: "media_player.main",
      state: "playing",
      attributes: {
        media_content_id: "spotify://cover/2",
        media_title: "Cover Track 2",
        media_artist: "Artist 2",
      },
    };
    card._config = { ...(card._config || {}), settings_source: "visual", mobile_cover_flow: true, mobile_queue_flow: false };
    card._state.mobileCoverFlow = true;
    card._state.mobileQueueFlow = false;
    card._state.selectedPlayer = player.entity_id;
    card._state.players = [player];
    card._state.queueItems = queueItems;
    card._state.maQueueState = { current_index: 2, current_item: queueItems[2] };

    const artworkHtml = card._mobileArtworkStackHtml();
    const queueHtml = card._queueMenuHtml();

    expect(card._mobileCoverFlowEnabled()).toBe(true);
    expect(artworkHtml).toContain("cover-flow-viewport");
    expect(artworkHtml.match(/cover-flow-slide/g)).toHaveLength(5);
    expect(artworkHtml).toContain('data-cover-flow-offset="-2"');
    expect(artworkHtml).toContain('data-cover-flow-offset="2"');
    expect(artworkHtml).toContain("Cover Track 2");
    expect(artworkHtml).not.toContain("queue-flow-picker");
    expect(queueHtml).not.toContain("queue-flow-picker");
    expect(card._mobileBrowsePreviewActive({ offset: 1 })).toBe(true);

    const playSpy = vi.fn().mockResolvedValue(true);
    card._playQueueItem = playSpy;
    await card._handleMobileArtTap({
      target: {
        closest: (selector) => selector === ".art-stack-slide" ? {
          dataset: {
            artPosition: "next",
            coverFlowOffset: "1",
            queueItemId: "cover-3",
            uri: "spotify://cover/3",
            type: "track",
            sortIndex: "3",
          },
        } : null,
      },
    });
    expect(playSpy).toHaveBeenCalled();
    expect(playSpy.mock.calls[0][1]).toBe("spotify://cover/3");
  });

  it("renders pending artwork with an immediate image src before decode completes", async () => {
    await import("../src/homeii-music-flow.js?runtime-immediate-art-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    const html = card._decodedArtworkImgHtml("https://ha.local/art.jpg", "Artwork", { current: true });

    expect(html).toContain('src="https://ha.local/art.jpg"');
    expect(html).toContain('data-homeii-art-ready="0"');
    expect(html).toContain('fetchpriority="high"');
  });

  it("prefetches the visible queue window and nearby full-size artwork", async () => {
    await import("../src/homeii-music-flow.js?runtime-art-prefetch-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    const queueItems = Array.from({ length: 8 }, (_, index) => ({
      queue_item_id: `queue-${index}`,
      sort_index: index,
      media_item: {
        uri: `spotify://track/${index}`,
        name: `Track ${index}`,
        image: `https://ha.local/art-${index}.jpg`,
      },
    }));
    card._state.queueItems = queueItems;
    card._state.maQueueState = { current_index: 3, current_item: queueItems[3] };

    const urls = card._queueArtworkPrefetchUrls(queueItems, { before: 1, after: 2, visibleCount: 2 });

    expect(urls.some((url) => url.includes("art-3.jpg"))).toBe(true);
    expect(urls.some((url) => url.includes("art-0.jpg"))).toBe(true);
    expect(urls.some((url) => url.includes("art-5.jpg"))).toBe(true);
    expect(urls.some((url) => url.includes("art-7.jpg"))).toBe(false);
  });

  it("resolves visible queue rows for scroll-aware artwork prefetch", async () => {
    await import("../src/homeii-music-flow.js?runtime-visible-queue-prefetch-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    card._state.menuPage = "queue";
    const body = {
      getBoundingClientRect: () => ({ top: 0, bottom: 300 }),
      querySelectorAll: () => [
        { dataset: { queuePosition: "4" }, getBoundingClientRect: () => ({ top: -240, bottom: -180 }) },
        { dataset: { queuePosition: "10" }, getBoundingClientRect: () => ({ top: 20, bottom: 110 }) },
        { dataset: { queuePosition: "11" }, getBoundingClientRect: () => ({ top: 130, bottom: 220 }) },
        { dataset: { queuePosition: "16" }, getBoundingClientRect: () => ({ top: 520, bottom: 610 }) },
      ],
    };

    expect(card._queueVisibleArtworkWindowFromMenuBody(body)).toMatchObject({
      visibleStartIndex: 9,
    });
  });

  it("does not switch to another playing player during a pending queue transition", async () => {
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    await import("../src/homeii-music-flow.js?runtime-player-lock-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    const mainPlayer = {
      entity_id: "media_player.main",
      state: "idle",
      attributes: { friendly_name: "Main", active_queue: "queue-main", mass_player_id: "main" },
    };
    const otherPlayer = {
      entity_id: "media_player.other",
      state: "playing",
      attributes: { friendly_name: "Other", active_queue: "queue-other", mass_player_id: "other", media_title: "Other Track" },
    };
    card._hass = {
      states: {
        [mainPlayer.entity_id]: mainPlayer,
        [otherPlayer.entity_id]: otherPlayer,
      },
      entities: {},
    };
    card._state.selectedPlayer = mainPlayer.entity_id;
    card._state.mobileQueuePlayPendingUntil = Date.now() + 8500;

    card._loadPlayers();

    expect(card._state.selectedPlayer).toBe(mainPlayer.entity_id);
  });

  it("stores the pending queue transition target player for stronger player locking", async () => {
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    await import("../src/homeii-music-flow.js?runtime-pending-player-id-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    const item = {
      queue_item_id: "queue-item-new",
      sort_index: 4,
      media_item: { uri: "spotify://track/new", name: "New Track" },
    };
    card._state.selectedPlayer = "media_player.main";

    card._markMobileQueuePlayPending(item, 4);

    expect(card._state.mobileQueuePlayPendingPlayerId).toBe("media_player.main");
  });

  it("lets the screensaver enter while lyrics are open", async () => {
    await import("../src/homeii-music-flow.js?runtime-lyrics-screensaver-block-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    card._state.lyricsOpen = true;

    expect(card._screensaverBlocked()).toBe(false);
  });

  it("suppresses the screensaver while the card is open in the visual editor", async () => {
    await import("../src/homeii-music-flow.js?runtime-screensaver-edit-mode-block-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    card.classList = createClassList();
    card.shadowRoot = {
      querySelector: () => ({ classList: createClassList() }),
    };
    card.$ = () => null;
    card.offsetWidth = 900;
    card.getBoundingClientRect = () => ({ width: 900, height: 700 });
    card._state.screensaverEnabled = true;

    expect(card._screensaverEnabled()).toBe(true);

    card.editMode = true;

    expect(card._screensaverEnabled()).toBe(true);
    expect(card._screensaverBlocked()).toBe(true);
    card._showScreensaver({ force: true });
    expect(card._state.screensaverOpen).toBe(false);
  });

  it("moves an open lyrics modal into screensaver lyrics without leaving the modal behind", async () => {
    await import("../src/homeii-music-flow.js?runtime-lyrics-screensaver-close-modal-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    const overlay = {
      classList: createClassList(),
      dataset: {},
      setAttribute(name, value) {
        this[name] = value;
      },
    };
    const lyricsBackdrop = {
      classList: createClassList(),
      innerHTML: "modal",
      onclick: () => {},
    };
    const cardEl = { classList: createClassList() };
    lyricsBackdrop.classList.add("open");
    card.classList = createClassList();
    card.shadowRoot = {
      querySelector: (selector) => (selector === ".card" ? cardEl : null),
    };
    card.$ = (id) => ({
      screensaverBackdrop: overlay,
      lyricsBackdrop,
    }[id] || null);
    card._screensaverEnabled = () => true;
    card._screensaverBlocked = () => false;
    card._ensureQueueSnapshot = async () => {};
    card._syncScreensaverUi = () => {};
    card._syncLyricsForCurrentTrack = () => {};
    card._state.lyricsOpen = true;
    card._state.lyricsText = "Current lyric";

    card._showScreensaver();

    expect(card._state.screensaverOpen).toBe(true);
    expect(card._state.lyricsOpen).toBe(false);
    expect(card._state.screensaverLyricsOpen).toBe(true);
    expect(card._state.lyricsText).toBe("Current lyric");
    expect(lyricsBackdrop.classList.contains("open")).toBe(false);
    expect(lyricsBackdrop.innerHTML).toBe("");
  });

  it("auto-opens screensaver lyrics only while music is playing when enabled", async () => {
    await import("../src/homeii-music-flow.js?runtime-screensaver-auto-lyrics-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    const overlay = {
      classList: createClassList(),
      dataset: {},
      setAttribute(name, value) {
        this[name] = value;
      },
    };
    const cardEl = { classList: createClassList() };
    card.classList = createClassList();
    card.shadowRoot = {
      querySelector: (selector) => (selector === ".card" ? cardEl : null),
    };
    card.$ = (id) => ({ screensaverBackdrop: overlay }[id] || null);
    card._screensaverEnabled = () => true;
    card._screensaverBlocked = () => false;
    card._ensureQueueSnapshot = async () => {};
    card._syncScreensaverUi = () => {};
    card._syncLyricsForCurrentTrack = vi.fn();
    card._state.screensaverAutoLyricsWhenPlaying = true;
    card._getSelectedPlayer = () => ({ entity_id: "media_player.office", state: "playing", attributes: {} });

    card._showScreensaver();

    expect(card._state.screensaverOpen).toBe(true);
    expect(card._state.screensaverLyricsOpen).toBe(true);
    expect(card._syncLyricsForCurrentTrack).toHaveBeenCalled();

    card._hideScreensaver();
    card._syncLyricsForCurrentTrack.mockClear();
    card._getSelectedPlayer = () => ({ entity_id: "media_player.office", state: "idle", attributes: {} });

    card._showScreensaver();

    expect(card._state.screensaverOpen).toBe(true);
    expect(card._state.screensaverLyricsOpen).toBe(false);
    expect(card._syncLyricsForCurrentTrack).not.toHaveBeenCalled();
  });

  it("opens tablet lyrics directly in screensaver mode without keeping the modal open", async () => {
    await import("../src/homeii-music-flow.js?runtime-tablet-lyrics-direct-screensaver-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    const overlay = {
      classList: createClassList(),
      dataset: {},
      setAttribute(name, value) {
        this[name] = value;
      },
    };
    const lyricsBackdrop = {
      classList: createClassList(),
      innerHTML: "modal",
      onclick: () => {},
    };
    const cardEl = { classList: createClassList() };
    card.classList = createClassList();
    card.shadowRoot = {
      querySelector: (selector) => (selector === ".card" ? cardEl : null),
    };
    card.$ = (id) => ({
      screensaverBackdrop: overlay,
      lyricsBackdrop,
    }[id] || null);
    card._layoutModeConfig = () => "tablet";
    card._getSelectedPlayer = () => ({ entity_id: "media_player.main", state: "playing", attributes: {} });
    card._ensureQueueSnapshot = async () => {};
    card._syncScreensaverUi = vi.fn();
    card._syncLyricsForCurrentTrack = vi.fn();
    card._screensaverSuppressUntil = Date.now() + 60000;
    card._state.lyricsOpen = true;

    expect(card._openTabletLyricsScreensaver()).toBe(true);

    expect(card._state.screensaverOpen).toBe(true);
    expect(card._state.lyricsOpen).toBe(false);
    expect(card._state.screensaverLyricsOpen).toBe(true);
    expect(lyricsBackdrop.classList.contains("open")).toBe(false);
    expect(card._syncLyricsForCurrentTrack).toHaveBeenCalled();
  });

  it("refreshes lyrics when the current track changes without user interaction", async () => {
    await import("../src/homeii-music-flow.js?runtime-lyrics-track-refresh-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    let renders = 0;
    card._state.lyricsOpen = true;
    card._state.lyricsTrackKey = "old";
    card._currentLyricsTrackKey = () => "new";
    card._renderLyricsModalForCurrentTrack = async () => {
      renders += 1;
      card._state.lyricsTrackKey = "new";
    };

    card._syncLyricsForCurrentTrack();
    await card._lyricsRefreshPromise;

    expect(renders).toBe(1);
    expect(card._state.lyricsTrackKey).toBe("new");
  });

  it("shows lyrics beside artwork in screensaver only while playback is active or freshly paused", async () => {
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    await import("../src/homeii-music-flow.js?runtime-lyrics-screensaver-mode-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    const overlay = { classList: createClassList(), dataset: {} };
    const host = { dataset: {}, innerHTML: "" };
    card.$ = (id) => ({ screensaverBackdrop: overlay, screensaverLyrics: host }[id] || null);
    card._state.screensaverOpen = true;
    card._state.lyricsOpen = true;
    card._state.lyricsLines = [
      { time: 0, text: "Before" },
      { time: 10, text: "Current line" },
      { time: 20, text: "Next line" },
    ];
    card._getCurrentPosition = () => 11;

    card._syncScreensaverLyricsUi({ state: "playing", attributes: {} });
    expect(overlay.classList.contains("lyrics-mode")).toBe(true);
    expect(host.innerHTML).toContain("Current line");

    card._syncScreensaverLyricsUi({ state: "paused", attributes: {} });
    vi.advanceTimersByTime(31000);
    card._syncScreensaverLyricsUi({ state: "paused", attributes: {} });

    expect(overlay.classList.contains("lyrics-mode")).toBe(false);
    expect(host.innerHTML).toBe("");
  });

  it("renders optional screensaver lyrics sync and font control buttons", async () => {
    await import("../src/homeii-music-flow.js?runtime-screensaver-lyrics-button-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    card._state.screensaverControlsEnabled = true;
    card._state.screensaverControlButtons = ["lyrics", "lyrics_sync", "lyrics_font_minus", "lyrics_font_plus"];
    const html = card._screensaverControlButtons()
      .map((value) => card._screensaverControlButtonHtml(value))
      .join("");
    const source = await readProjectFile("src", "homeii-music-flow.js");

    expect(html).toContain('id="screensaverLyricsBtn"');
    expect(html).toContain('data-screensaver-control="lyrics"');
    expect(html).toContain('id="screensaverLyricsSyncBtn"');
    expect(html).toContain('data-screensaver-control="lyrics_sync"');
    expect(html).toContain('id="screensaverLyricsFontMinusBtn"');
    expect(html).toContain('data-screensaver-control="lyrics_font_minus"');
    expect(html).toContain('id="screensaverLyricsFontPlusBtn"');
    expect(html).toContain('data-screensaver-control="lyrics_font_plus"');
    expect(source).toContain("screensaverLyricsFontMinusBtn");
    expect(source).toContain("screensaverLyricsFontPlusBtn");
    expect(source).toContain("--lyrics-font-scale");
    expect(source).toContain("flex-wrap:nowrap;");
    expect(source).toContain("max-width:min(92vw, 860px);");
    expect(source).toContain(".screensaver-voice-btn.pressed,");
    expect(source).not.toContain(".screensaver-voice-btn.active,\n.screensaver-voice-btn.listening");
  });

  it("keeps lyrics sync and font controls available in the normal lyrics modal", async () => {
    const source = await readProjectFile("src", "core", "base-music-card.js");
    const styleSource = await readProjectFile("src", "homeii-music-flow.js");

    expect(source).toContain('id="lyricsFontMinusBtn"');
    expect(source).toContain('id="lyricsFontResetBtn"');
    expect(source).toContain('id="lyricsFontPlusBtn"');
    expect(source).toContain('id="lyricsOffsetMinusBtn"');
    expect(source).toContain('id="lyricsOffsetResetBtn"');
    expect(source).toContain('id="lyricsOffsetPlusBtn"');
    expect(source).toContain('id="lyricsSyncBtn"');
    expect(styleSource).toContain(".lyrics-head-actions { display:flex;");
    expect(styleSource).not.toContain(".card:not(.layout-tablet) .lyrics-head-actions { display:none");
  });

  it("removes one grouped speaker without rejoining or clearing the remaining group", async () => {
    await import("../src/homeii-music-flow.js?runtime-group-remove-delta-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    card._state.selectedPlayer = "media_player.living_room";
    card._state.players = [
      {
        entity_id: "media_player.living_room",
        state: "playing",
        attributes: {
          friendly_name: "Living Room",
          group_members: ["media_player.living_room", "media_player.kitchen", "media_player.terrace"],
        },
      },
      {
        entity_id: "media_player.kitchen",
        state: "playing",
        attributes: { friendly_name: "Kitchen" },
      },
      {
        entity_id: "media_player.terrace",
        state: "playing",
        attributes: { friendly_name: "Terrace" },
      },
    ];
    const serviceCalls = [];
    card._callHaMediaPlayerService = vi.fn(async (entityId, service, serviceData = {}) => {
      serviceCalls.push({ entityId, service, serviceData });
      return {};
    });
    card._loadPlayers = vi.fn(async () => {});
    card._renderMobileMenu = vi.fn(async () => {});
    card._syncControlRoomUi = vi.fn();

    const ok = await card._applySpeakerGroupFor("media_player.living_room", ["media_player.kitchen"]);

    expect(ok).toBe(true);
    expect(serviceCalls).toEqual([
      { entityId: "media_player.terrace", service: "unjoin", serviceData: {} },
    ]);
  });

  it("shows the group master in the group screen", async () => {
    await import("../src/homeii-music-flow.js?runtime-group-master-visible-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    card._state.selectedPlayer = "media_player.kitchen";
    card._state.players = [
      {
        entity_id: "media_player.living_room",
        state: "playing",
        attributes: {
          friendly_name: "Living Room",
          group_members: ["media_player.living_room", "media_player.kitchen", "media_player.terrace"],
        },
      },
      {
        entity_id: "media_player.kitchen",
        state: "playing",
        attributes: { friendly_name: "Kitchen" },
      },
      {
        entity_id: "media_player.terrace",
        state: "playing",
        attributes: { friendly_name: "Terrace" },
      },
    ];

    const html = card._groupMenuHtml();

    expect(html).toContain("Living Room");
    expect(html).toContain('data-group-owner="true"');
    expect(html).toContain("group-player-status master");
    expect(html).toContain("Master");
    expect(html).toContain("Kitchen");
  });

  it("removes the selected member from a master-owned group without clearing the group", async () => {
    await import("../src/homeii-music-flow.js?runtime-group-remove-leader-rebase-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    card._state.selectedPlayer = "media_player.kitchen";
    card._state.players = [
      {
        entity_id: "media_player.living_room",
        state: "playing",
        attributes: {
          friendly_name: "Living Room",
          group_members: ["media_player.living_room", "media_player.kitchen", "media_player.terrace"],
        },
      },
      {
        entity_id: "media_player.kitchen",
        state: "playing",
        attributes: { friendly_name: "Kitchen" },
      },
      {
        entity_id: "media_player.terrace",
        state: "playing",
        attributes: { friendly_name: "Terrace" },
      },
    ];
    const serviceCalls = [];
    card._callHaMediaPlayerService = vi.fn(async (entityId, service, serviceData = {}) => {
      serviceCalls.push({ entityId, service, serviceData });
      return {};
    });
    card._loadPlayers = vi.fn(async () => {});
    card._renderMobileMenu = vi.fn(async () => {});
    card._syncControlRoomUi = vi.fn();

    const ok = await card._applySpeakerGroupFor("media_player.kitchen", ["media_player.living_room", "media_player.terrace"]);

    expect(ok).toBe(true);
    expect(serviceCalls).toEqual([
      { entityId: "media_player.kitchen", service: "unjoin", serviceData: {} },
    ]);
  });

  it("rebases member-view group additions onto the current master", async () => {
    await import("../src/homeii-music-flow.js?runtime-group-member-add-rebase-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    card._state.selectedPlayer = "media_player.kitchen";
    card._state.players = [
      {
        entity_id: "media_player.living_room",
        state: "playing",
        attributes: {
          friendly_name: "Living Room",
          group_members: ["media_player.living_room", "media_player.kitchen"],
        },
      },
      {
        entity_id: "media_player.kitchen",
        state: "playing",
        attributes: { friendly_name: "Kitchen" },
      },
      {
        entity_id: "media_player.terrace",
        state: "idle",
        attributes: { friendly_name: "Terrace" },
      },
    ];
    const serviceCalls = [];
    card._callHaMediaPlayerService = vi.fn(async (entityId, service, serviceData = {}) => {
      serviceCalls.push({ entityId, service, serviceData });
      return {};
    });
    card._loadPlayers = vi.fn(async () => {});
    card._renderMobileMenu = vi.fn(async () => {});
    card._syncControlRoomUi = vi.fn();

    const ok = await card._applySpeakerGroupFor("media_player.kitchen", [
      "media_player.living_room",
      "media_player.kitchen",
      "media_player.terrace",
    ]);

    expect(ok).toBe(true);
    expect(serviceCalls).toEqual([
      {
        entityId: "media_player.living_room",
        service: "join",
        serviceData: { group_members: ["media_player.kitchen", "media_player.terrace"] },
      },
    ]);
  });

  it("disconnects the group when the master is explicitly unchecked from a member view", async () => {
    await import("../src/homeii-music-flow.js?runtime-group-member-unchecks-master-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    card._state.selectedPlayer = "media_player.kitchen";
    card._state.players = [
      {
        entity_id: "media_player.living_room",
        state: "playing",
        attributes: {
          friendly_name: "Living Room",
          group_members: ["media_player.living_room", "media_player.kitchen", "media_player.terrace"],
        },
      },
      {
        entity_id: "media_player.kitchen",
        state: "playing",
        attributes: { friendly_name: "Kitchen" },
      },
      {
        entity_id: "media_player.terrace",
        state: "playing",
        attributes: { friendly_name: "Terrace" },
      },
    ];
    const serviceCalls = [];
    card._callHaMediaPlayerService = vi.fn(async (entityId, service, serviceData = {}) => {
      serviceCalls.push({ entityId, service, serviceData });
      return {};
    });
    card._loadPlayers = vi.fn(async () => {});
    card._renderMobileMenu = vi.fn(async () => {});
    card._syncControlRoomUi = vi.fn();
    card._state.pendingGroupSelections = ["media_player.kitchen", "media_player.terrace"];
    card._state.pendingGroupOwnerRemoval = true;

    const ok = await card._applySpeakerGroupFor("media_player.kitchen", card._state.pendingGroupSelections);

    expect(ok).toBe(true);
    expect(serviceCalls).toEqual([
      { entityId: "media_player.living_room", service: "unjoin", serviceData: {} },
      { entityId: "media_player.kitchen", service: "unjoin", serviceData: {} },
      { entityId: "media_player.terrace", service: "unjoin", serviceData: {} },
    ]);
  });

  it("disconnects the group when the selected master is unchecked", async () => {
    await import("../src/homeii-music-flow.js?runtime-group-selected-master-removal-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    card._state.selectedPlayer = "media_player.living_room";
    card._state.players = [
      {
        entity_id: "media_player.living_room",
        state: "playing",
        attributes: {
          friendly_name: "Living Room",
          group_members: ["media_player.living_room", "media_player.kitchen", "media_player.terrace"],
        },
      },
      {
        entity_id: "media_player.kitchen",
        state: "playing",
        attributes: { friendly_name: "Kitchen" },
      },
      {
        entity_id: "media_player.terrace",
        state: "playing",
        attributes: { friendly_name: "Terrace" },
      },
    ];
    const serviceCalls = [];
    card._callHaMediaPlayerService = vi.fn(async (entityId, service, serviceData = {}) => {
      serviceCalls.push({ entityId, service, serviceData });
      return {};
    });
    card._loadPlayers = vi.fn(async () => {});
    card._renderMobileMenu = vi.fn(async () => {});
    card._syncControlRoomUi = vi.fn();
    card._refreshGroupingState({ force: true });
    card._state.pendingGroupSelections = ["media_player.kitchen", "media_player.terrace"];
    card._state.pendingGroupOwnerRemoval = true;

    const ok = await card._applySpeakerGroupFor("media_player.living_room", card._state.pendingGroupSelections);

    expect(ok).toBe(true);
    expect(serviceCalls).toEqual([
      { entityId: "media_player.living_room", service: "unjoin", serviceData: {} },
      { entityId: "media_player.kitchen", service: "unjoin", serviceData: {} },
      { entityId: "media_player.terrace", service: "unjoin", serviceData: {} },
    ]);
  });

  it("keeps group update and disconnect-all actions paired", async () => {
    const source = await readProjectFile("src", "homeii-music-flow.js");

    expect(source).toContain(".menu-body.sheet-group .group-actions { width:min(100%, 460px); margin:22px auto 0; display:grid; grid-template-columns:repeat(2, minmax(0, 1fr));");
    expect(source).toContain(".menu-body.sheet-group .group-disconnect-all-btn");
    expect(source).toContain("min-height:58px;");
    expect(source).toContain(".group-actions { grid-template-columns:repeat(2, minmax(0, 1fr)); }");
  });

  it("shows the group volume shortcut only for grouped players", async () => {
    await import("../src/homeii-music-flow.js?runtime-group-volume-shortcut-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    const CardCtor = globalThis.customElements.get("homeii-music-flow");
    const card = new CardCtor();
    const buttonClasses = new Set();
    const button = {
      hidden: true,
      dataset: {},
      title: "",
      classList: {
        toggle: (className, enabled) => {
          if (enabled) buttonClasses.add(className);
          else buttonClasses.delete(className);
        },
      },
      setAttribute: vi.fn((name, value) => {
        button[name] = value;
      }),
    };
    Object.defineProperty(card, "shadowRoot", {
      configurable: true,
      value: { querySelectorAll: () => [button] },
    });
    card._state.selectedPlayer = "media_player.living_room";
    card._state.players = [
      {
        entity_id: "media_player.living_room",
        state: "playing",
        attributes: {
          friendly_name: "Living Room",
          group_members: ["media_player.living_room", "media_player.kitchen"],
        },
      },
      {
        entity_id: "media_player.kitchen",
        state: "playing",
        attributes: { friendly_name: "Kitchen" },
      },
    ];

    card._syncGroupVolumeShortcut();
    expect(button.hidden).toBe(false);
    expect(buttonClasses.has("active")).toBe(true);
    expect(button.dataset.groupCount).toBe("2");

    card._state.players[0].attributes.group_members = [];
    card._syncGroupVolumeShortcut();
    expect(button.hidden).toBe(true);
    expect(buttonClasses.has("active")).toBe(false);
  });

  it("keeps the built dist runtime bundled and registerable", async () => {
    const packageVersion = await readPackageVersion();
    const distText = await readProjectFile("dist", "homeii-music-flow.js");

    expect(distText).not.toContain('from "./core/');
    expect(distText).not.toContain('from "./localization/index.js');
    expect(distText).toContain("./sendspin-js/index.js");
    expect(distText).not.toContain("data:text/javascript");

    await import("../dist/homeii-music-flow.js?runtime-dist-baseline");
    await Promise.resolve();
    await vi.runAllTimersAsync();

    expectHomeiiRuntimeRegistered(packageVersion);
  });
});
