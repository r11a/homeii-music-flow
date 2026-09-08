import * as HomeiiEngineFoundation from "../core/engine-client.js";
import { ensureInterfaceFont, interfaceStyles } from "../core/theme/interface.js";

export function createHomeiiBaseMusicEditor(deps = {}) {
  const {
    HomeiiBaseMusicCard,
    ensureHaEditorComponents,
    homeiiIsRtlLanguage,
    homeiiDetectLanguage,
    HomeiiConfigValidators,
    HomeiiPlayersFoundation,
    HomeiiMobileSettingsFoundation,
    homeiiEditorI18n,
    homeiiEditorLabelFor,
    homeiiEditorHelperFor,
    HOMEII_CARD_VERSION,
    AMBIENT_LIGHT_PAIR_PLAYER_PREFIX,
    AMBIENT_LIGHT_PAIR_LIGHTS_PREFIX,
  } = deps;

return class HomeiiBaseMusicEditor extends HTMLElement {
  constructor() {
    super();
    ensureInterfaceFont();
    this._config = HomeiiBaseMusicCard.getStubConfig();
    this._hass = null;
    this._editorRoot = null;
    this._editorForm = null;
    this._editorUsePathBtn = null;
    this._editorPathHint = null;
    this._editorSponsorLink = null;
    this._editorDiagnosticsBtn = null;
    this._editorDiagnosticsCloseBtn = null;
    this._editorDiagnosticsPanel = null;
    this._editorDiagnosticsSummaryNode = null;
    this._editorDiagnosticsList = null;
    this._editorDiagnosticsItems = [];
    this._editorDiagnosticsReport = "";
    this._editorDiagnosticsRunning = false;
    this._editorAmbientLightDraft = { player: "", lights: [] };
    this._editorBound = false;
    this._editorLastConfigKey = "";
    this._editorLastSchemaKey = "";
  }

  connectedCallback() {
    this.style.display = "block";
    ensureHaEditorComponents();
    this._ensureEditorShell();
    this._render();
  }

  set hass(hass) {
    const previousLang = String(this._hass?.locale?.language || this._hass?.language || "");
    const previousPinnedOptionsKey = this._editorPinnedPlayerOptionsKey();
    this._hass = hass;
    this._ensureEditorShell();
    const nextLang = String(this._hass?.locale?.language || this._hass?.language || "");
    const nextPinnedOptionsKey = this._editorPinnedPlayerOptionsKey();
    if (previousLang !== nextLang || previousPinnedOptionsKey !== nextPinnedOptionsKey || !this._editorRoot || !this._editorForm) {
      this._render();
      return;
    }
    this._syncEditorLiveContext();
  }

  setConfig(config) {
    const nextConfig = {
      ...this._getCardCtor().getStubConfig(),
      ...config,
    };
    const validator = this._getConfigValidator?.();
    if (typeof validator === "function") {
      validator(nextConfig);
    }
    this._config = nextConfig;
    this._ensureEditorShell();
    this._render();
  }

  _getCardCtor() {
    return HomeiiBaseMusicCard;
  }

  _isHebrew() {
    return homeiiIsRtlLanguage(homeiiDetectLanguage({
      configLanguage: this._config?.language || "en",
      hass: this._hass,
    }));
  }

  _esc(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  _getConfigValidator() {
    return HomeiiConfigValidators.validateBaseCardEditorConfig;
  }

  _dispatchConfig() {
    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config: this._config },
      bubbles: true,
      composed: true,
    }));
  }

  _currentUiPath() {
    try {
      const pathname = window.location?.pathname || "/";
      const search = window.location?.search || "";
      const hash = window.location?.hash || "";
      return `${pathname}${search}${hash}` || "/";
    } catch (_) {
      return "/";
    }
  }

  _editorSponsorTitle() {
    return this._isHebrew() ? "תמיכה ב-homeii-music-flow" : "Sponsor homeii-music-flow";
  }

  _editorSponsorConfirmMessage() {
    return this._isHebrew()
      ? "לפתוח את עמוד התמיכה ב-GitHub Sponsors?"
      : "Open the GitHub Sponsors page?";
  }

  _syncEditorSponsorLabels() {
    if (!this._editorSponsorLink) return;
    const label = this._editorSponsorTitle();
    this._editorSponsorLink.setAttribute("title", label);
    this._editorSponsorLink.setAttribute("aria-label", label);
  }

  _editorSanitizeDiagnosticUrl(value = "") {
    const raw = String(value || "").trim();
    if (!raw) return "";
    if (/(https?|wss?):\/\/<[^>]+>/i.test(raw)) {
      return raw.replace(/(token|access_token|auth)=([^&\s]+)/gi, "$1=<redacted>");
    }
    try {
      const parsed = new URL(raw, typeof window !== "undefined" ? window.location.href : "http://homeii.local");
      const port = parsed.port ? `:${parsed.port}` : "";
      return `${parsed.protocol}//${this._editorDiagnosticHostPrivacyLabel(parsed.hostname)}${port}${this._editorDiagnosticPathPrivacyLabel(parsed.pathname)}`;
    } catch (_) {
      return raw
        .replace(/(https?|wss?):\/\/[^\s]+/gi, (match) => this._editorSanitizeDiagnosticUrl(match))
        .replace(/(token|access_token|auth)=([^&\s]+)/gi, "$1=<redacted>");
    }
  }

  _editorDiagnosticHostPrivacyLabel(hostname = "") {
    const host = String(hostname || "").trim().toLowerCase().replace(/^\[|\]$/g, "");
    if (!host) return "<host-redacted>";
    if (host === "localhost") return "<localhost>";
    if (host.endsWith(".ui.nabu.casa")) return "<redacted-nabu-casa>";
    const currentHost = typeof window !== "undefined" ? String(window.location?.hostname || "").toLowerCase() : "";
    if (currentHost && host === currentHost) return "<home-assistant-host>";
    if (this._editorIsPrivateNetworkHost(host)) return "<private-host>";
    return "<external-host>";
  }

  _editorDiagnosticPathPrivacyLabel(pathname = "") {
    const path = String(pathname || "").trim();
    if (!path || path === "/") return "";
    const lower = path.toLowerCase();
    if (lower.includes("_music_assistant")) return "/<ha-ingress-music-assistant>";
    if (lower === "/sendspin") return "/sendspin";
    if (lower.endsWith("/sendspin")) return "/<path-redacted>/sendspin";
    if (lower.includes("/api/media_player_proxy/")) return "/api/media_player_proxy/<entity>";
    if (lower.includes("/imageproxy")) return "/imageproxy";
    if (lower === "/api") return "/api";
    if (lower.endsWith("/api")) return "/<path-redacted>/api";
    return "/<path-redacted>";
  }

  _editorDiagnosticUrlDescription(value = "") {
    const raw = String(value || "").trim();
    if (!raw) return "(empty)";
    try {
      const parsed = new URL(raw, typeof window !== "undefined" ? window.location.href : "http://homeii.local");
      const protocol = parsed.protocol.replace(/:$/, "") || "unknown";
      const hostLabel = this._editorDiagnosticHostPrivacyLabel(parsed.hostname);
      const hostType = hostLabel
        .replace(/[<>]/g, "")
        .replace("redacted-", "");
      const pathLabel = this._editorDiagnosticPathPrivacyLabel(parsed.pathname) || "/";
      return `protocol=${protocol}, host_type=${hostType}, port=${parsed.port || "default"}, path=${pathLabel}`;
    } catch (_) {
      return "invalid or unparseable URL";
    }
  }

  _editorRedactDiagnosticText(text = "") {
    let output = String(text || "").replace(/Bearer\s+[A-Za-z0-9._-]+/g, "Bearer <redacted>");
    [
      this._editorCurrentOrigin(),
    ].filter(Boolean).forEach((url) => {
      output = output.split(String(url)).join(this._editorSanitizeDiagnosticUrl(url));
    });
    return output.replace(/(https?|wss?):\/\/[^\s]+/gi, (match) => this._editorSanitizeDiagnosticUrl(match));
  }

  _editorCurrentOrigin() {
    try {
      return typeof window !== "undefined" ? (window.location?.origin || window.location?.href || "") : "";
    } catch (_) {
      return "";
    }
  }

  _editorBrowserSummary() {
    const nav = typeof navigator !== "undefined" ? navigator : (typeof window !== "undefined" ? window.navigator : {});
    const ua = String(nav?.userAgent || "");
    const matchers = [
      ["Edge", /Edg\/([\d.]+)/i],
      ["Chrome iOS", /CriOS\/([\d.]+)/i],
      ["Firefox iOS", /FxiOS\/([\d.]+)/i],
      ["Firefox", /Firefox\/([\d.]+)/i],
      ["Samsung Internet", /SamsungBrowser\/([\d.]+)/i],
      ["Chrome", /Chrome\/([\d.]+)/i],
      ["Safari", /Version\/([\d.]+).*Safari/i],
    ];
    const found = matchers.map(([name, pattern]) => {
      const match = ua.match(pattern);
      return match ? `${name} ${match[1]}` : "";
    }).find(Boolean) || (ua ? "Unknown browser" : "Browser unavailable");
    const hints = [];
    if (/Home Assistant|HomeAssistant|io\.homeassistant|HA Companion/i.test(ua)) hints.push("HA Companion");
    if (/\bwv\b|Android.*Version\/[\d.]+.*Chrome/i.test(ua)) hints.push("Android WebView");
    if (/iPhone|iPad|iPod/i.test(ua) && /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS/i.test(ua)) hints.push("iOS WebKit");
    const platform = String(nav?.platform || nav?.userAgentData?.platform || "").trim();
    return [found, platform, ...hints].filter(Boolean).join(" / ");
  }

  _editorViewportSummary() {
    const win = typeof window !== "undefined" ? window : {};
    const nav = typeof navigator !== "undefined" ? navigator : win.navigator;
    const width = Number(win.innerWidth || this.getBoundingClientRect?.().width || this.offsetWidth || 0);
    const height = Number(win.innerHeight || this.getBoundingClientRect?.().height || this.offsetHeight || 0);
    const dpr = Number(win.devicePixelRatio || 1);
    const touch = Number(nav?.maxTouchPoints || 0);
    const language = String(nav?.language || this._hass?.locale?.language || this._hass?.language || "").trim();
    return `${Math.round(width)}x${Math.round(height)}, DPR ${Number.isFinite(dpr) ? dpr.toFixed(2).replace(/\.00$/, "") : "?"}, touch ${touch}${language ? `, lang ${language}` : ""}`;
  }

  _editorIsPrivateNetworkHost(hostname = "") {
    const host = String(hostname || "").trim().toLowerCase().replace(/^\[|\]$/g, "");
    if (!host) return false;
    if (host === "localhost" || host.endsWith(".local") || host.endsWith(".lan")) return true;
    if (host === "::1" || host.startsWith("fe80:") || host.startsWith("fc") || host.startsWith("fd")) return true;
    if (/^127\./.test(host) || /^10\./.test(host) || /^192\.168\./.test(host) || /^169\.254\./.test(host)) return true;
    const match = host.match(/^172\.(\d{1,2})\./);
    return !!(match && Number(match[1]) >= 16 && Number(match[1]) <= 31);
  }

  _editorDiagnosticItem(status, title, detail = "", value = "") {
    return {
      status: ["ok", "fail", "warn", "info"].includes(String(status || "").toLowerCase()) ? String(status).toLowerCase() : "info",
      title: String(title || "").trim(),
      detail: String(detail || "").trim(),
      value: String(value || "").trim(),
    };
  }

  _editorWithTimeout(promise, timeoutMs = 8000, message = "Request timed out") {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(message)), Math.max(1000, Number(timeoutMs) || 8000));
      Promise.resolve(promise)
        .then((value) => {
          clearTimeout(timer);
          resolve(value);
        })
        .catch((error) => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }

  _editorHomeiiEngineMode() {
    return HomeiiEngineFoundation.normalizeHomeiiEngineMode(this._config?.homeii_engine_mode);
  }

  _editorHomeiiEngineTimeoutMs() {
    return HomeiiEngineFoundation.clampHomeiiEngineTimeoutMs(this._config?.homeii_engine_timeout_ms, 3500);
  }

  _editorHomeiiEngineMessage(command = "get_context", payload = {}) {
    const message = {
      ...(payload && typeof payload === "object" && !Array.isArray(payload) ? payload : { payload }),
      type: HomeiiEngineFoundation.homeiiEngineCommandType(command),
      card_id: String(this._config?.card_id || "").trim(),
      instance_id: HomeiiEngineFoundation.normalizeHomeiiEngineId(this._config?.homeii_engine_instance_id),
      profile_id: HomeiiEngineFoundation.normalizeHomeiiEngineId(this._config?.homeii_engine_profile_id),
    };
    ["card_id", "instance_id", "profile_id"].forEach((key) => {
      if (message[key] === "") delete message[key];
    });
    return message;
  }

  async _editorCallHomeiiEngine(command = "get_context", payload = {}) {
    if (!HomeiiEngineFoundation.homeiiEngineModeAllowsCalls(this._editorHomeiiEngineMode())) return null;
    const message = this._editorHomeiiEngineMessage(command, payload);
    if (typeof this._hass?.callWS === "function") {
      return this._editorWithTimeout(this._hass.callWS(message), this._editorHomeiiEngineTimeoutMs(), "HOMEii Flow Engine timed out.");
    }
    if (typeof this._hass?.connection?.sendMessagePromise === "function") {
      return this._editorWithTimeout(this._hass.connection.sendMessagePromise(message), this._editorHomeiiEngineTimeoutMs(), "HOMEii Flow Engine timed out.");
    }
    throw new Error("Home Assistant WebSocket API is unavailable in the visual editor.");
  }

  async _editorDiagnosticEngineRow(add) {
    const mode = this._editorHomeiiEngineMode();
    if (!HomeiiEngineFoundation.homeiiEngineModeAllowsCalls(mode)) {
      add("fail", "HOMEii Flow Engine", "HOMEii Flow 6 requires the HOMEii Flow Engine integration. There is no frontend-only compatibility path.", mode);
      return;
    }
    try {
      const result = await this._editorCallHomeiiEngine("get_context", {
        card_version: HOMEII_CARD_VERSION,
        source: "visual_editor",
      });
      if (!result) throw new Error("HOMEii Flow Engine returned an empty response.");
      const context = HomeiiEngineFoundation.normalizeHomeiiEngineContext(result);
      add("ok", "HOMEii Flow Engine", `Connected to HOMEii Flow Engine ${context.version || "unknown version"}. Capabilities: ${HomeiiEngineFoundation.summarizeHomeiiEngineCapabilities(context.capabilities)}.`, mode);
      const [playersResult, statsResult] = await Promise.allSettled([
        this._editorCallHomeiiEngine("players/get", { source: "visual_editor" }),
        this._editorCallHomeiiEngine("stats/get", { source: "visual_editor" }),
      ]);
      const playerCount = Number(playersResult.value?.music_assistant_count ?? statsResult.value?.music_assistant_players ?? 0);
      if (playersResult.status === "fulfilled" || statsResult.status === "fulfilled") {
        const playingCount = Number(statsResult.value?.players_playing ?? 0);
        const groupedCount = Number(statsResult.value?.players_grouped ?? 0);
        add(playerCount ? "ok" : "warn", "Engine player state", `${playerCount} Music Assistant player(s), ${playingCount} playing, ${groupedCount} grouped.`);
      }
    } catch (error) {
      const detail = "Engine mode is Required, but the Home Assistant integration did not answer. HOMEii Flow 6 will not run until the integration is installed, loaded, and refreshed.";
      const suffix = error?.message ? ` Last error: ${error.message}` : "";
      add("fail", "HOMEii Flow Engine", `${detail}${suffix}`, mode);
    }
  }

  _editorDiagnosticsReportText(items = []) {
    const lines = [
      "HOMEii Music Flow Editor Diagnostics",
      "Diagnostics: v7",
      `Version: ${HOMEII_CARD_VERSION}`,
      `Generated: ${new Date().toISOString()}`,
      "Source: visual editor",
      `Browser: ${this._editorBrowserSummary()}`,
      `Viewport: ${this._editorViewportSummary()}`,
      "Privacy: external/private hostnames are redacted by default.",
      `HA URL: ${this._editorCurrentOrigin() ? this._editorSanitizeDiagnosticUrl(this._editorCurrentOrigin()) : ""}`,
      `HA URL detail: ${this._editorDiagnosticUrlDescription(this._editorCurrentOrigin())}`,
      "music_assistant_transport: HOMEii Flow Engine",
      `config_entry_id configured: ${String(this._config?.config_entry_id || "").trim() ? "yes" : "no"}`,
      `homeii_engine_mode: ${this._editorHomeiiEngineMode()}`,
      `homeii_engine_instance_id configured: ${this._config?.homeii_engine_instance_id ? "yes" : "no"}`,
      `homeii_engine_profile_id configured: ${this._config?.homeii_engine_profile_id ? "yes" : "no"}`,
      "",
      "Checks:",
      ...items.map((item) => `- [${String(item.status || "info").toUpperCase()}] ${item.title}${item.value ? `: ${item.value}` : ""}${item.detail ? ` - ${item.detail}` : ""}`),
    ];
    return this._editorRedactDiagnosticText(lines.join("\n"));
  }

  _editorDiagnosticsSummary(items = this._editorDiagnosticsItems || []) {
    const list = Array.isArray(items) ? items : [];
    const failures = list.filter((item) => item.status === "fail").length;
    const warnings = list.filter((item) => item.status === "warn").length;
    if (!list.length) return "Run diagnostics to check the current browser, Home Assistant integration, and HOMEii Flow Engine readiness.";
    if (failures) return `${failures} check${failures === 1 ? "" : "s"} need attention.`;
    if (warnings) return `${warnings} check${warnings === 1 ? "" : "s"} need review.`;
    return "All visible setup checks passed.";
  }

  _editorDiagnosticStatusLabel(status = "info") {
    const normalized = String(status || "info").toLowerCase();
    if (normalized === "ok") return "V";
    if (normalized === "fail") return "X";
    if (normalized === "warn") return "!";
    return "i";
  }

  _editorDiagnosticRowHtml(item = {}) {
    const status = ["ok", "fail", "warn", "info"].includes(String(item.status || "").toLowerCase())
      ? String(item.status || "info").toLowerCase()
      : "info";
    return `
      <div class="editor-diagnostic-row status-${this._esc(status)}">
        <div class="editor-diagnostic-status" aria-label="${this._esc(status)}">${this._esc(this._editorDiagnosticStatusLabel(status))}</div>
        <div class="editor-diagnostic-copy">
          <div class="editor-diagnostic-title">${this._esc(item.title || "")}</div>
          ${item.value ? `<div class="editor-diagnostic-value">${this._esc(item.value)}</div>` : ""}
          ${item.detail ? `<div class="editor-diagnostic-detail">${this._esc(item.detail)}</div>` : ""}
        </div>
      </div>`;
  }

  _renderEditorDiagnosticsResults() {
    if (!this._editorDiagnosticsPanel || !this._editorDiagnosticsSummaryNode || !this._editorDiagnosticsList) return;
    const items = Array.isArray(this._editorDiagnosticsItems) ? this._editorDiagnosticsItems : [];
    this._editorDiagnosticsPanel.hidden = !items.length;
    this._editorDiagnosticsSummaryNode.textContent = this._editorDiagnosticsSummary(items);
    this._editorDiagnosticsList.innerHTML = items.map((item) => this._editorDiagnosticRowHtml(item)).join("");
  }

  async _runEditorDiagnostics() {
    const items = [];
    const add = (status, title, detail = "", value = "") => items.push(this._editorDiagnosticItem(status, title, detail, value));
    const services = Object.keys(this._hass?.services?.music_assistant || {});
    const states = this._hass?.states || {};
    const entities = this._hass?.entities || {};
    const players = Object.values(states)
      .filter((entity) => HomeiiPlayersFoundation.isMusicAssistantPlayer(entity, entities?.[entity.entity_id]));
    const genericPlayers = Object.values(states)
      .filter((entity) => entity?.entity_id?.startsWith?.("media_player."));
    const pinned = HomeiiMobileSettingsFoundation.normalizePinnedPlayerEntityList(this._config?.pinned_player_entities);
    const excluded = HomeiiMobileSettingsFoundation.normalizePinnedPlayerEntityList(this._config?.excluded_player_entities);

    add("ok", "Editor version", "Visual editor runtime is loaded.", HOMEII_CARD_VERSION);
    add("ok", "Diagnostics version", "Diagnostic v7 is active.", "v7");
    add("info", "Browser", this._editorBrowserSummary());
    add("info", "Viewport", this._editorViewportSummary());
    add("info", "Diagnostic privacy", "External/private hostnames are redacted in visible and copied diagnostic output.");
    add(this._hass ? "ok" : "fail", "Home Assistant frontend", this._hass ? "Editor has a Home Assistant frontend object." : "Editor does not have a Home Assistant frontend object.");
    add(services.length ? "ok" : "fail", "Music Assistant services", services.length ? `${services.length} service(s) are exposed by Home Assistant.` : "No music_assistant services are exposed by Home Assistant.");
    add(services.length ? "ok" : "warn", "Engine backend mode", services.length ? "HOMEii Flow 6 uses HOMEii Flow Engine as the required backend. Browser-direct Music Assistant access is not used for core card routing." : "Home Assistant does not expose music_assistant services for HOMEii Flow Engine.");
    await this._editorDiagnosticEngineRow(add);
    add(services.length ? "ok" : "fail", "Integration signal", `services ${services.length ? "yes" : "no"}, authenticated transport HOMEii Flow Engine`);
    add(players.length ? "ok" : (services.length && genericPlayers.length ? "warn" : "fail"), "Music Assistant players", players.length ? `${players.length} strict MA player(s), ${genericPlayers.length} generic HA media_player(s).` : `${genericPlayers.length} generic HA media_player(s), but no strict Music Assistant player markers were detected.`);
    add("info", "Player filters", `${pinned.length} pinned, ${excluded.length} excluded.`);

    if (this._hass?.connection?.sendMessagePromise) {
      try {
        const entries = await this._editorWithTimeout(this._hass.connection.sendMessagePromise({
          type: "config_entries/get",
          domain: "music_assistant",
        }), 8000, "Music Assistant config lookup timed out.");
        const list = Array.isArray(entries) ? entries : [];
        const preferred = list.find((entry) => entry?.state === "loaded")
          || list.find((entry) => entry?.state === "setup_retry")
          || list.find((entry) => entry?.state === "not_loaded")
          || list[0];
        add(preferred?.state === "loaded" ? "ok" : (preferred ? "warn" : "fail"), "Music Assistant config entry", preferred ? "Home Assistant returned a Music Assistant config entry." : "No Music Assistant config entry was returned.", preferred?.state || "none");
      } catch (error) {
        add("warn", "Music Assistant config entry", error?.message || "Could not read Home Assistant config entries.");
      }
    } else {
      add("warn", "Music Assistant config entry", "Home Assistant connection API is not available in this editor context.");
    }

    add("ok", "Music Assistant transport", "URL selection, authentication, event streaming, caching, and artwork proxying are owned by HOMEii Flow Engine. No MA token or server URL is stored in the card.");

    this._editorDiagnosticsItems = items;
    this._editorDiagnosticsReport = this._editorDiagnosticsReportText(items);
    this._renderEditorDiagnosticsResults();
    return this._editorDiagnosticsReport;
  }

  async _copyEditorDiagnosticsReport() {
    if (this._editorDiagnosticsRunning) return;
    this._editorDiagnosticsRunning = true;
    const button = this._editorDiagnosticsBtn;
    const previousText = button?.textContent || "Diagnostics";
    if (button) {
      button.disabled = true;
      button.textContent = "Running...";
    }
    try {
      const report = await this._runEditorDiagnostics();
      let copied = false;
      let copyError = "";
      try {
        if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(report);
          copied = true;
        } else if (typeof document !== "undefined" && document.createElement) {
          const textarea = document.createElement("textarea");
          textarea.value = report;
          textarea.setAttribute?.("readonly", "");
          if (textarea.style) {
            textarea.style.position = "fixed";
            textarea.style.left = "-9999px";
          }
          document.body?.appendChild?.(textarea);
          textarea.select?.();
          copied = document.execCommand?.("copy") !== false;
          textarea.remove?.();
        }
      } catch (error) {
        copyError = error?.message || "Automatic copy is not allowed in this editor context.";
      }
      if (copyError || !copied) {
        this._editorDiagnosticsItems = [
          ...(Array.isArray(this._editorDiagnosticsItems) ? this._editorDiagnosticsItems : []),
          this._editorDiagnosticItem("warn", "Copy diagnostics", copyError || "Automatic copy was not available. The report is still visible here."),
        ];
        this._editorDiagnosticsReport = this._editorDiagnosticsReportText(this._editorDiagnosticsItems);
        this._renderEditorDiagnosticsResults();
      }
      if (button) button.textContent = copied ? "Copied" : "Ready";
    } catch (error) {
      this._editorDiagnosticsReport = error?.message || "Editor diagnostics failed.";
      this._editorDiagnosticsItems = [this._editorDiagnosticItem("fail", "Editor diagnostics", this._editorDiagnosticsReport)];
      this._renderEditorDiagnosticsResults();
      if (button) button.textContent = "Failed";
    } finally {
      this._editorDiagnosticsRunning = false;
      if (button) {
        button.disabled = false;
        setTimeout(() => {
          if (!this._editorDiagnosticsRunning && this._editorDiagnosticsBtn) {
            this._editorDiagnosticsBtn.textContent = previousText || "Diagnostics";
          }
        }, 1600);
      }
    }
  }

  _ensureEditorShell() {
    if (this._editorRoot) return;
    const root = this.attachShadow({ mode: "open" });
    root.innerHTML = `
      <style>
        ${interfaceStyles}
        :host {
          display:block;
          direction:${this._isHebrew() ? "rtl" : "ltr"};
        }
        .editor-shell {
          display:grid;
          gap:14px;
          padding:16px;
          border-radius:20px;
          border:1px solid rgba(146,161,183,.18);
          background:rgba(18,24,34,.04);
          contain:style;
          position:relative;
        }
        .editor-header {
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:12px;
          min-height:40px;
          padding:0 2px 2px;
        }
        .editor-title {
          min-width:0;
          font-size:16px;
          line-height:1.2;
          font-weight:800;
          color:var(--primary-text-color, #1f2633);
          white-space:nowrap;
          overflow:hidden;
          text-overflow:ellipsis;
        }
        .editor-actions {
          flex:0 0 auto;
          display:flex;
          align-items:center;
          gap:8px;
        }
        .editor-sponsor {
          width:30px;
          height:30px;
          display:inline-grid;
          place-items:center;
          border-radius:999px;
          color:var(--secondary-text-color, rgba(31,38,51,.62));
          background:rgba(146,161,183,.08);
          border:1px solid rgba(146,161,183,.14);
          text-decoration:none;
          transition:background .16s ease, border-color .16s ease, color .16s ease, transform .16s ease;
        }
        .editor-sponsor:hover {
          color:#d14d72;
          background:rgba(209,77,114,.09);
          border-color:rgba(209,77,114,.22);
          transform:translateY(-1px);
        }
        .editor-sponsor:focus-visible {
          outline:2px solid color-mix(in srgb, var(--primary-color, #d14d72) 56%, transparent);
          outline-offset:2px;
        }
        .editor-sponsor svg {
          width:16px;
          height:16px;
          display:block;
        }
        .editor-diagnostics {
          flex:0 0 auto;
          min-height:30px;
          border-radius:999px;
          padding:0 11px;
          font:inherit;
          font-size:12px;
          line-height:1;
          font-weight:800;
          color:var(--primary-color, #3566d6);
          background:color-mix(in srgb, var(--primary-color, #3566d6) 9%, transparent);
          border:1px solid color-mix(in srgb, var(--primary-color, #3566d6) 18%, transparent);
          cursor:pointer;
        }
        .editor-diagnostics:hover {
          background:color-mix(in srgb, var(--primary-color, #3566d6) 14%, transparent);
        }
        .editor-diagnostics:disabled {
          opacity:.64;
          cursor:progress;
        }
        .editor-version {
          flex:0 0 auto;
          border-radius:999px;
          padding:5px 10px;
          font-size:12px;
          line-height:1;
          font-weight:800;
          color:var(--secondary-text-color, rgba(31,38,51,.68));
          background:rgba(146,161,183,.12);
          border:1px solid rgba(146,161,183,.18);
        }
        .editor-shell.tablet-stable {
          background:rgba(18,24,34,.08);
          border-color:rgba(146,161,183,.12);
        }
        .editor-diagnostics-panel {
          display:grid;
          gap:10px;
          padding:12px;
          border-radius:16px;
          background:#f8fafc;
          border:1px solid rgba(123,139,164,.2);
          color:#172033;
        }
        .editor-diagnostics-panel[hidden] {
          display:none;
        }
        .editor-diagnostics-head {
          display:flex;
          align-items:flex-start;
          justify-content:space-between;
          gap:10px;
        }
        .editor-diagnostics-summary {
          flex:1 1 auto;
          padding:9px 11px;
          border-radius:12px;
          font-size:13px;
          font-weight:850;
          line-height:1.35;
          color:#172033;
          background:#eef3f8;
          border:1px solid rgba(146,161,183,.18);
        }
        .editor-diagnostics-close {
          flex:0 0 auto;
          width:32px;
          height:32px;
          display:inline-grid;
          place-items:center;
          border-radius:999px;
          border:1px solid rgba(146,161,183,.22);
          background:#ffffff;
          color:#475569;
          font:inherit;
          font-size:13px;
          line-height:1;
          font-weight:900;
          cursor:pointer;
        }
        .editor-diagnostics-close:hover {
          background:rgba(255,255,255,.94);
          color:#172033;
        }
        .editor-diagnostics-list {
          display:grid;
          gap:8px;
        }
        .editor-diagnostic-row {
          display:grid;
          grid-template-columns:32px minmax(0,1fr);
          gap:10px;
          align-items:start;
          padding:10px;
          border-radius:14px;
          background:#ffffff;
          border:1px solid rgba(123,139,164,.18);
          color:#172033;
        }
        .editor-diagnostic-status {
          width:28px;
          height:28px;
          border-radius:10px;
          display:grid;
          place-items:center;
          font-size:13px;
          font-weight:950;
          background:rgba(238,243,248,.9);
          color:#546172;
        }
        .editor-diagnostic-row.status-ok .editor-diagnostic-status {
          color:#188850;
          background:rgba(24,136,80,.12);
        }
        .editor-diagnostic-row.status-fail .editor-diagnostic-status {
          color:#c93445;
          background:rgba(201,52,69,.12);
        }
        .editor-diagnostic-row.status-warn .editor-diagnostic-status {
          color:#a66b00;
          background:rgba(255,188,74,.18);
        }
        .editor-diagnostic-row.status-info .editor-diagnostic-status {
          color:#236bd1;
          background:rgba(35,107,209,.12);
        }
        .editor-diagnostic-copy {
          min-width:0;
          display:grid;
          gap:3px;
        }
        .editor-diagnostic-title {
          font-size:13px;
          font-weight:900;
          color:#172033;
        }
        .editor-diagnostic-value {
          font-size:12px;
          font-weight:800;
          color:#334155;
          overflow-wrap:anywhere;
        }
        .editor-diagnostic-detail {
          font-size:12px;
          line-height:1.38;
          color:#64748b;
          overflow-wrap:anywhere;
        }
        ha-form {
          display:block;
        }
      </style>
      <div class="editor-shell">
        <div class="editor-header">
          <div class="editor-title">homeii-music-flow</div>
          <div class="editor-actions">
            <a
              class="editor-sponsor"
              href="https://github.com/sponsors/r11a"
              target="_blank"
              rel="noopener noreferrer"
              title="${this._esc(this._editorSponsorTitle())}"
              aria-label="${this._esc(this._editorSponsorTitle())}"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path
                  d="M20.8 4.6c-1.8-1.7-4.7-1.6-6.4.2L12 7.3 9.6 4.8C7.9 3 5 2.9 3.2 4.6 1.2 6.5 1.1 9.6 3 11.6l8.2 8.5c.4.4 1.1.4 1.5 0l8.2-8.5c2-2 1.9-5.1-.1-7Z"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                ></path>
              </svg>
            </a>
            <button class="editor-diagnostics" type="button" title="Run and copy diagnostics report" aria-label="Run and copy diagnostics report">Diagnostics</button>
            <div class="editor-version">v${HOMEII_CARD_VERSION}</div>
          </div>
        </div>
        <div class="editor-diagnostics-panel" id="editorDiagnosticsPanel" hidden>
          <div class="editor-diagnostics-head">
            <div class="editor-diagnostics-summary" id="editorDiagnosticsSummary"></div>
            <button class="editor-diagnostics-close" id="editorDiagnosticsClose" type="button" title="Close diagnostics" aria-label="Close diagnostics">X</button>
          </div>
          <div class="editor-diagnostics-list" id="editorDiagnosticsList"></div>
        </div>
        <ha-form id="editorForm"></ha-form>
      </div>
    `;
    this._editorRoot = root;
    this._editorForm = root.querySelector("#editorForm");
    this._editorUsePathBtn = root.querySelector("#editorUseCurrentPath");
    this._editorPathHint = root.querySelector("#editorPathHint");
    this._editorSponsorLink = root.querySelector(".editor-sponsor");
    this._editorDiagnosticsBtn = root.querySelector(".editor-diagnostics");
    this._editorDiagnosticsCloseBtn = root.querySelector("#editorDiagnosticsClose");
    this._editorDiagnosticsPanel = root.querySelector("#editorDiagnosticsPanel");
    this._editorDiagnosticsSummaryNode = root.querySelector("#editorDiagnosticsSummary");
    this._editorDiagnosticsList = root.querySelector("#editorDiagnosticsList");
    this._syncEditorSponsorLabels();
    this._refreshEditorShellClasses();
    if (!this._editorBound) {
      this._editorBound = true;
      this._editorSponsorLink?.addEventListener("click", (event) => {
        let confirmed = true;
        try {
          if (typeof window.confirm === "function") {
            confirmed = window.confirm(this._editorSponsorConfirmMessage());
          }
        } catch (_) {}
        if (!confirmed) event.preventDefault?.();
      });
      this._editorDiagnosticsBtn?.addEventListener("click", () => {
        this._copyEditorDiagnosticsReport();
      });
      this._editorDiagnosticsCloseBtn?.addEventListener("click", () => {
        if (this._editorDiagnosticsPanel) this._editorDiagnosticsPanel.hidden = true;
      });
      this._editorUsePathBtn?.addEventListener("click", () => {
        const currentPath = this._currentUiPath();
        this._config = {
          ...this._getCardCtor().getStubConfig(),
          ...this._config,
          mobile_home_shortcut_path: currentPath,
        };
        this._render();
        this._dispatchConfig();
      });
      this._editorForm?.addEventListener("value-changed", (event) => {
        const nextValue = event.detail?.value;
        if (!nextValue || typeof nextValue !== "object") return;
        const nextConfigValue = this._normalizeEditorFormValue(nextValue);
        const previousSchemaKey = this._editorLastSchemaKey;
        this._config = {
          ...this._getCardCtor().getStubConfig(),
          ...this._config,
          ...nextConfigValue,
        };
        this._dispatchConfig();
        const nextSchemaKey = JSON.stringify(this._withDynamicEditorSchema(this._currentBaseEditorSchema()));
        if (previousSchemaKey !== nextSchemaKey) queueMicrotask(() => this._render());
      });
    }
  }

  _isTabletStabilityMode() {
    try {
      const ua = String(window.navigator?.userAgent || "");
      const width = Math.max(
        Number(window.innerWidth || 0),
        Number(this.getBoundingClientRect?.().width || 0),
        Number(this.offsetWidth || 0),
      );
      const touchPoints = Number(window.navigator?.maxTouchPoints || 0);
      return /Android/i.test(ua) && width >= 980 && touchPoints > 0;
    } catch (_) {
      return false;
    }
  }

  _refreshEditorShellClasses() {
    const shell = this._editorRoot?.querySelector(".editor-shell");
    if (!shell) return;
    shell.classList.toggle("tablet-stable", this._isTabletStabilityMode());
  }

  _syncEditorLiveContext() {
    this._ensureEditorShell();
    this.style.direction = this._isHebrew() ? "rtl" : "ltr";
    this._refreshEditorShellClasses();
    this._syncEditorSponsorLabels();
    if (this._editorUsePathBtn) {
      this._editorUsePathBtn.textContent = homeiiEditorI18n("ui.use_current_view_for_home_button");
    }
    if (this._editorPathHint) {
      this._editorPathHint.textContent = `${homeiiEditorI18n("ui.current_path")}: ${this._currentUiPath()}`;
    }
    if (this._editorForm) {
      this._editorForm.hass = this._hass;
    }
  }

  _editorPlayerOptionLabel(entity = null, players = []) {
    const entityId = String(entity?.entity_id || "").trim();
    const name = HomeiiPlayersFoundation.playerDisplayName(entity, { players }) || entityId;
    if (!name || !entityId || name === entityId || String(name).includes(entityId)) return name || entityId;
    return `${name} (${entityId})`;
  }

  _editorPinnedPlayerOptions() {
    const states = this._hass?.states || {};
    const entities = this._hass?.entities || {};
    const mediaPlayers = Object.values(states)
      .filter((entity) => entity?.entity_id?.startsWith("media_player."));
    const configuredIds = new Set([
      ...HomeiiMobileSettingsFoundation.normalizePinnedPlayerEntityList(this._config?.pinned_player_entities),
      ...HomeiiMobileSettingsFoundation.normalizePinnedPlayerEntityList(this._config?.excluded_player_entities),
      ...HomeiiMobileSettingsFoundation.normalizePlayerOrderEntities(this._config || {}),
    ]);
    const musicAssistantPlayers = mediaPlayers
      .filter((entity) => {
        const registry = entities?.[entity.entity_id] || {};
        const registryText = [
          registry.platform,
          registry.integration,
          registry.device_class,
        ].filter(Boolean).join(" ").toLowerCase();
        return HomeiiPlayersFoundation.isMusicAssistantPlayer(entity, registry)
          || registryText.includes("music_assistant")
          || registryText.includes("music assistant");
      });
    const configuredFallbackPlayers = mediaPlayers.filter((entity) => configuredIds.has(entity.entity_id));
    const sourcePlayers = Array.from(new Map(
      [...musicAssistantPlayers, ...configuredFallbackPlayers].map((entity) => [entity.entity_id, entity])
    ).values());
    const options = sourcePlayers
      .filter((entity) => !HomeiiPlayersFoundation.isLikelyBrowserPlayer(entity))
      .map((entity) => ({
        value: entity.entity_id,
        label: this._editorPlayerOptionLabel(entity, sourcePlayers),
      }))
      .sort((left, right) => String(left.label).localeCompare(String(right.label), undefined, { sensitivity: "base" }));
    return options;
  }

  _editorPinnedPlayerOptionsKey() {
    return JSON.stringify({
      players: this._editorPinnedPlayerOptions(),
      lights: this._editorColorLightOptions(),
      mappings: HomeiiMobileSettingsFoundation.normalizeStringArray(this._config?.ambient_light_player_map),
      draft: this._editorAmbientLightDraft,
      excludedPlayers: HomeiiMobileSettingsFoundation.normalizePinnedPlayerEntityList(this._config?.excluded_player_entities),
    });
  }

  _editorPlayerOrderOptions() {
    const excluded = new Set(HomeiiMobileSettingsFoundation.normalizePinnedPlayerEntityList(this._config?.excluded_player_entities));
    return this._editorPinnedPlayerOptions().filter((option) => !excluded.has(option.value));
  }

  _playerOrderEntitySelector({ entities = [] } = {}) {
    const selector = {
      entity: {
        multiple: false,
        filter: [{ integration: "music_assistant", domain: "media_player" }],
      },
    };
    if (entities.length) selector.entity.include_entities = entities.map((option) => option.value);
    return selector;
  }

  _editorColorLightOptions() {
    const states = this._hass?.states || {};
    return Object.values(states)
      .filter((entity) => entity?.entity_id?.startsWith("light."))
      .filter((entity) => HomeiiMobileSettingsFoundation.isColorCapableLightEntity(entity))
      .map((entity) => ({
        value: entity.entity_id,
        label: entity.attributes?.friendly_name || entity.entity_id,
      }))
      .sort((left, right) => String(left.label).localeCompare(String(right.label), undefined, { sensitivity: "base" }));
  }

  _ambientLightPairPlayerKey(index) {
    return `${AMBIENT_LIGHT_PAIR_PLAYER_PREFIX}${index}`;
  }

  _ambientLightPairLightsKey(index) {
    return `${AMBIENT_LIGHT_PAIR_LIGHTS_PREFIX}${index}`;
  }

  _ambientLightPairDisplayKey(type = "player", index = 0) {
    const pairIndex = Math.max(0, Number(index) || 0);
    const internalName = type === "lights"
      ? this._ambientLightPairLightsKey(pairIndex)
      : this._ambientLightPairPlayerKey(pairIndex);
    const label = this._editorDynamicLabel({ name: internalName });
    if (label) return label;
    const number = pairIndex + 1;
    return type === "lights" ? `Color lights ${number}` : `Music Assistant player ${number}`;
  }

  _ambientLightPairFieldInfo(source = "") {
    const candidates = [];
    const addCandidate = (value) => {
      if (value == null) return;
      if (Array.isArray(value)) {
        value.forEach(addCandidate);
        candidates.push(value.join("."));
        return;
      }
      if (typeof value === "object") {
        addCandidate(value.name);
        addCandidate(value.key);
        addCandidate(value.path);
        addCandidate(value.schema?.name);
        return;
      }
      candidates.push(String(value));
    };
    addCandidate(source);

    const matchPairField = (value, prefix, type) => {
      const offset = String(value || "").indexOf(prefix);
      if (offset < 0) return null;
      const match = String(value || "").slice(offset + prefix.length).match(/^\d+/);
      if (!match) return null;
      const index = Number(match[0]);
      return Number.isInteger(index) ? { type, index } : null;
    };

    for (const value of candidates) {
      const playerInfo = matchPairField(value, AMBIENT_LIGHT_PAIR_PLAYER_PREFIX, "player");
      if (playerInfo) return playerInfo;
      const lightsInfo = matchPairField(value, AMBIENT_LIGHT_PAIR_LIGHTS_PREFIX, "lights");
      if (lightsInfo) return lightsInfo;
      const displayValue = String(value || "").trim();
      const displayMatch = displayValue.match(/(\d+)\s*$/);
      if (displayMatch) {
        const index = Number(displayMatch[1]) - 1;
        if (Number.isInteger(index) && index >= 0) {
          const lower = displayValue.toLowerCase();
          if (lower.includes("player") || lower.includes("נגן")) return { type: "player", index };
          if (lower.includes("light") || lower.includes("licht") || lower.includes("תאור")) return { type: "lights", index };
        }
      }
    }
    return null;
  }

  _editorSchemaItem(item = {}) {
    if (typeof item === "string") return { name: item };
    if (Array.isArray(item)) return { name: item[item.length - 1] || item.join(".") };
    return item && typeof item === "object" ? item : {};
  }

  _ambientLightPlayerMapConfigFromGroups(groups = []) {
    return groups
      .map((group) => HomeiiMobileSettingsFoundation.formatAmbientLightPlayerMapEntry(group.player, group.lights))
      .filter(Boolean);
  }

  _ambientLightPairSelectorData(config = this._config) {
    const data = {};
    const groups = HomeiiMobileSettingsFoundation.parseAmbientLightPlayerMap(config?.ambient_light_player_map);
    groups.forEach((group, index) => {
      data[this._ambientLightPairDisplayKey("player", index)] = group.player;
      data[this._ambientLightPairDisplayKey("lights", index)] = group.lights;
    });
    const draftIndex = groups.length;
    data[this._ambientLightPairDisplayKey("player", draftIndex)] = this._editorAmbientLightDraft?.player || "";
    data[this._ambientLightPairDisplayKey("lights", draftIndex)] = this._editorAmbientLightDraft?.lights || [];
    return data;
  }

  _editorFormData(config = this._config) {
    return {
      ...config,
      ...this._ambientLightPairSelectorData(config),
    };
  }

  _normalizeEditorFormValue(value = {}) {
    const next = { ...value };
    this._normalizeEditorQuickActionsValue(next);
    this._normalizeEditorPlayerOrderValue(next);
    const pairIndices = new Set();
    Object.keys(next).forEach((key) => {
      const info = this._ambientLightPairFieldInfo(key);
      if (info) pairIndices.add(info.index);
    });
    if (!pairIndices.size) return next;

    const currentPairCount = HomeiiMobileSettingsFoundation.parseAmbientLightPlayerMap(this._config?.ambient_light_player_map).length;
    const groups = [];
    let draft = { player: "", lights: [] };
    Array.from(pairIndices).sort((left, right) => left - right).forEach((index) => {
      const playerKey = this._ambientLightPairPlayerKey(index);
      const lightsKey = this._ambientLightPairLightsKey(index);
      const playerDisplayKey = this._ambientLightPairDisplayKey("player", index);
      const lightsDisplayKey = this._ambientLightPairDisplayKey("lights", index);
      const player = String((next[playerDisplayKey] ?? next[playerKey]) || "").trim();
      const lights = HomeiiMobileSettingsFoundation.normalizeEntityList(next[lightsDisplayKey] ?? next[lightsKey]);
      delete next[playerDisplayKey];
      delete next[lightsDisplayKey];
      delete next[playerKey];
      delete next[lightsKey];
      if (player && lights.length) {
        groups.push({ player, lights });
      } else if (index >= currentPairCount && (player || lights.length)) {
        draft = { player, lights };
      }
    });
    this._editorAmbientLightDraft = draft;
    next.ambient_light_player_map = this._ambientLightPlayerMapConfigFromGroups(groups);
    return next;
  }

  _normalizeEditorQuickActionsValue(next = {}) {
    if (!Object.prototype.hasOwnProperty.call(next, "mobile_quick_actions")) return next;
    const selected = HomeiiMobileSettingsFoundation.normalizeMobileQuickActions(next.mobile_quick_actions, []);
    next.mobile_quick_actions = selected;
    const selectedSet = new Set(selected);
    for (let index = 1; index <= 10; index += 1) {
      const key = `mobile_quick_action_${index}`;
      if (!Object.prototype.hasOwnProperty.call(next, key)) continue;
      const value = String(next[key] || "").trim();
      if (value && !selectedSet.has(value)) next[key] = "";
    }
    return next;
  }

  _normalizeEditorPlayerOrderValue(next = {}) {
    const hasPlayerOrderFields = Object.keys(next).some((key) => /^player_order_entity_\d+$/.test(key));
    if (!hasPlayerOrderFields) return next;
    const rowCount = this._playerOrderSchema()?.schema?.length || 0;
    const ordered = [];
    Object.keys(next).forEach((key) => {
      const match = /^player_order_entity_(\d+)$/.exec(key);
      if (!match) return;
      const index = Number(match[1]) || 0;
      if (!rowCount || index > rowCount) {
        delete next[key];
        return;
      }
      const entityId = String(next[key] || "").trim();
      if (entityId && !ordered.includes(entityId)) ordered.push(entityId);
    });
    next.player_order_entities = ordered;
    return next;
  }

  _ambientLightEntitySelector({ multiple = false, entities = [], fallbackFilter = [] } = {}) {
    const selector = {
      entity: {
        multiple,
        filter: fallbackFilter,
      },
    };
    selector.entity.include_entities = entities.map((option) => option.value);
    return selector;
  }

  _playerOrderSchema() {
    const options = this._editorPlayerOrderOptions();
    const configuredOrder = HomeiiMobileSettingsFoundation.normalizePlayerOrderEntities(this._config || {});
    const rowCount = Math.max(options.length, Math.min(configuredOrder.length, options.length || configuredOrder.length));
    if (!rowCount) return null;
    return {
      type: "grid",
      name: "player_order_grid",
      flatten: true,
      column_min_width: "220px",
      schema: Array.from({ length: rowCount }, (_, index) => ({
        name: `player_order_entity_${index + 1}`,
        selector: this._playerOrderEntitySelector({ entities: options }),
      })),
    };
  }

  _ambientLightPlayerPairSchema() {
    const groups = HomeiiMobileSettingsFoundation.parseAmbientLightPlayerMap(this._config?.ambient_light_player_map);
    const pairCount = Math.max(1, groups.length + 1);
    const players = this._editorPinnedPlayerOptions();
    const lights = this._editorColorLightOptions();
    const schema = [];
    for (let index = 0; index < pairCount; index += 1) {
      const playerName = this._ambientLightPairDisplayKey("player", index);
      const lightsName = this._ambientLightPairDisplayKey("lights", index);
      schema.push({
        name: playerName,
        label: this._editorDynamicLabel({ name: playerName }),
        helper: this._editorDynamicHelper({ name: playerName }),
        selector: this._ambientLightEntitySelector({
          multiple: false,
          entities: players,
          fallbackFilter: [{ integration: "music_assistant", domain: "media_player" }],
        }),
      });
      schema.push({
        name: lightsName,
        label: this._editorDynamicLabel({ name: lightsName }),
        helper: this._editorDynamicHelper({ name: lightsName }),
        selector: this._ambientLightEntitySelector({
          multiple: true,
          entities: lights,
          fallbackFilter: [{ domain: "light" }],
        }),
      });
    }
    return {
      type: "grid",
      name: "ambient_light_player_pair_grid",
      flatten: true,
      column_min_width: "220px",
      schema,
    };
  }

  _editorDynamicLabel(item = {}) {
    const info = this._ambientLightPairFieldInfo(item);
    if (!info) {
      const name = this._editorSchemaItem(item)?.name || "";
      const match = /^player_order_entity_(\d+)$/.exec(String(name || ""));
      return match ? `${homeiiEditorI18n("ui.player_order")} ${match[1]}` : "";
    }
    const key = info.type === "player" ? "ui.player_light_pair_player" : "ui.player_light_pair_lights";
    return homeiiEditorI18n(key, { number: info.index + 1 });
  }

  _editorDynamicHelper(item = {}) {
    const info = this._ambientLightPairFieldInfo(item);
    if (!info) {
      const name = this._editorSchemaItem(item)?.name || "";
      return /^player_order_entity_\d+$/.test(String(name || "")) ? homeiiEditorI18n("ui.set_custom_player_order") : "";
    }
    const key = info.type === "player" ? "ui.player_light_pair_player_helper" : "ui.player_light_pair_lights_helper";
    return homeiiEditorI18n(key);
  }

  _currentBaseEditorSchema() {
    const formDef = this._getCardCtor().getConfigForm?.() || {};
    return Array.isArray(formDef) ? formDef : (Array.isArray(formDef.schema) ? formDef.schema : []);
  }

  _withDynamicEditorSchema(schema = []) {
    const pinnedOptions = this._editorPinnedPlayerOptions();
    const colorLightOptions = this._editorColorLightOptions();
    const cloneItem = (item) => {
      if (!item || typeof item !== "object") return item;
      if (item.name === "ambient_light_player_map") return this._ambientLightPlayerPairSchema();
      if (item.name === "player_order_grid") return this._playerOrderSchema();
      const next = { ...item };
      if (Array.isArray(item.schema)) next.schema = item.schema.map(cloneItem).filter(Boolean);
      if (item.name === "pinned_player_entities" || item.name === "excluded_player_entities") {
        next.selector = {
          select: {
            multiple: true,
            mode: "dropdown",
            options: pinnedOptions,
          },
        };
      }
      if (item.name === "ambient_light_entities") {
        next.selector = this._ambientLightEntitySelector({
          multiple: true,
          entities: colorLightOptions,
          fallbackFilter: [{ domain: "light" }],
        });
      }
      return next;
    };
    return (Array.isArray(schema) ? schema : []).map(cloneItem).filter(Boolean);
  }

  _render() {
    this._ensureEditorShell();
    const cardCtor = this._getCardCtor();
    const config = {
      ...cardCtor.getStubConfig(),
      ...this._config,
    };
    const formDef = cardCtor.getConfigForm?.() || {};
    const baseSchema = this._currentBaseEditorSchema();
    const schema = this._withDynamicEditorSchema(baseSchema);
    const formData = this._editorFormData(config);
    const labels = formDef.labels || {};
    const helpers = formDef.helpers || {};
    const computeLabel = typeof formDef.computeLabel === "function"
      ? formDef.computeLabel
      : (item) => labels?.[item?.name];
    const computeHelper = typeof formDef.computeHelper === "function"
      ? formDef.computeHelper
      : (item) => helpers?.[item?.name];
    this._syncEditorLiveContext();
    if (this._editorForm) {
      const computeEditorLabel = (item) => {
        const schemaItem = this._editorSchemaItem(item);
        return this._editorDynamicLabel(item) || computeLabel(schemaItem) || homeiiEditorLabelFor(schemaItem, labels);
      };
      const computeEditorHelper = (item) => {
        const schemaItem = this._editorSchemaItem(item);
        return this._editorDynamicHelper(item) || computeHelper(schemaItem) || homeiiEditorHelperFor(schemaItem, helpers);
      };
      this._editorForm.computeLabel = computeEditorLabel;
      this._editorForm.computeHelper = computeEditorHelper;
      const schemaKey = JSON.stringify(schema);
      if (this._editorLastSchemaKey !== schemaKey) {
        this._editorForm.schema = schema;
        this._editorLastSchemaKey = schemaKey;
      }
      const configKey = JSON.stringify(formData);
      if (this._editorLastConfigKey !== configKey) {
        this._editorForm.data = formData;
        this._editorLastConfigKey = configKey;
      }
    }
  }
}
}
