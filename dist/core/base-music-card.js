export function createHomeiiBaseMusicCard({
  HOMEII_CARD_VERSION,
  HOMEII_VISIBLE_LANGUAGE_OPTIONS,
  HomeiiStateFoundation,
  HomeiiConfigValidators,
  HomeiiResponsiveFoundation,
  HomeiiMediaQueueFoundation,
  HomeiiMediaPresentationFoundation,
  HomeiiMediaHistoryFoundation,
  HomeiiNowPlayingFoundation,
  HomeiiFavoritesFoundation,
  HomeiiPlayersFoundation,
  getBaseCardConfigForm,
  getRadioBrowserCountrySelectorOptions,
  homeiiRadioBrowserCountryLabel,
  homeiiCountryFlagEmoji,
  homeiiDetectLanguage,
  homeiiEnsureLanguageLoaded,
  homeiiIsRtlLanguage,
  homeiiTranslate,
  homeiiTranslateText,
}) {
  return class HomeiiBaseMusicCard extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });

      this._hass = null;
      this._config = {};
      this._built = false;
      this._resolvedConfigEntryId = "";

      this._state = HomeiiStateFoundation.createBaseBrowserState();

      this._pollTimer = null;
      this._progressTimer = null;
      this._searchTimer = null;
      this._nowPlayingSearchTimer = null;
      this._volumeTimer = null;
      this._bigVolumeTimer = null;
      this._controlRoomVolumeTimer = null;
      this._seekTimer = null;
      this._resizeTimer = null;
      this._resizeObserver = null;
      this._visualViewportResizeListening = false;

      this._ws = null;
      this._wsPending = new Map();
      this._wsMsgId = 100;
      this._maReconnectTimer = null;

      this._imgObserver = null;
      this._imgObserverRoot = null;
      this._ctxMenu = null;
      this._ctxMenuOpenedAt = 0;
      this._lastVolumeByPlayer = new Map();
      this._softMutedPlayers = new Set();
      this._optimisticVolumeByPlayer = new Map();
      this._optimisticMuteByPlayer = new Map();
      this._optimisticPlaybackByPlayer = new Map();
      this._localSendspinPlayer = null;
      this._localSendspinSocket = null;
      this._localSendspinModule = null;
      this._localSendspinConnecting = false;
      this._localSendspinConnected = false;
      this._localSendspinPlayerId = "";
      this._localSendspinState = null;
      this._localSendspinDiscoveryTimers = [];
      this._localSendspinDisconnectTimer = null;
      this._localSendspinReconnectTimer = null;
      this._localSendspinDesired = false;
      this._localSendspinLifecycleListening = false;
      this._localSendspinSuppressClose = false;
      this._toastHistory = new Map();
      this._directMaPlayers = [];
      this._directMaPlayersRefreshPromise = null;

      this._cache = {
        library: new Map(),
        lyrics: new Map(),
      };

      this._boundDocClick = this._handleDocumentClick.bind(this);
      this._boundContentClick = this._handleContentClick.bind(this);
      this._boundContentContext = this._handleContentContext.bind(this);
      this._boundQueuePanelClick = this._handleQueuePanelClick.bind(this);
      this._boundWindowResize = this._handleWindowResize.bind(this);
      this._boundBrandLogoError = this._handleBrandLogoError.bind(this);
      this._boundLocalSendspinLifecycle = this._handleLocalSendspinLifecycle.bind(this);
      this._boundManualFrontRouteChange = this._handleManualFrontRouteChange.bind(this);
      this.shadowRoot.addEventListener("error", this._boundBrandLogoError, true);
      this._imageBlobCache = new Map();
      this._imageFailed = new Set();
      this._resizeListening = false;
      this._lastViewportWidth = typeof window !== "undefined" ? window.innerWidth : 0;
      this._lastViewportHeight = typeof window !== "undefined" ? window.innerHeight : 0;
      this._lastCardWidth = 0;
      this._lastCardHeight = 0;
      this._renderedLayoutMode = "";
      this._layoutRecoveryTimer = null;
      this._layoutRecoveryFrame = null;
      this._layoutResizeHoldUntil = 0;
      this._screensaverVisibilityObserver = null;
      this._screensaverVisibilityKnown = false;
      this._screensaverVisible = true;
      this._screensaverPageEntryPending = false;
      this._screensaverPageEntryReason = "";
      this._screensaverExitTimer = null;
      this._compactTransitionTimer = null;
      this._mobileMenuRenderToken = 0;
      this._manualFrontPlayerTimer = null;
      this._manualFrontLocationKey = "";
      this._manualFrontRouteListening = false;
      this._updateNowPlayingInFlight = false;
      this._updateNowPlayingQueued = false;
      this._queueSnapshotToken = 0;
      this._cardIssueNoticeTimes = new Map();
      this._voiceAssistantRecognitionTimer = null;
      this._lyricsRefreshPromise = null;
      this._lyricsRefreshQueued = false;
    }

    setConfig(config) {
      const nextConfig = {
        rtl: true,
        language: "en",
        cache_ttl: 300000,
        music_assistant_timeout_ms: 12000,
        active_player_helper_entity: "",
        music_assistant_external_url: "",
        show_ma_button: true,
        ma_interface_url: "/music-assistant",
        ma_interface_target: "_self",
        theme_mode: "auto",
        show_theme_toggle: true,
        hotel_mode: false,
        performance_profile: "full",
        performance_mode: false,
        main_opacity: 0.66,
        popup_opacity: 0.92,
        ...config,
      };
      const validator = this._getConfigValidator?.();
      if (typeof validator === "function") {
        validator(nextConfig);
      }
      this._config = nextConfig;
      this._homeiiBrandLogoUrl = "";
      this._homeiiBrandLogoCandidates = null;

      try {
        const configuredLanguage = this._config.language || "en";
        const storedLanguage = localStorage.getItem("homeii_music_flow_lang");
        const configControlsLanguage = typeof this._usesVisualSettings === "function" && this._usesVisualSettings();
        const configuredLanguageBase = String(configuredLanguage || "")
          .trim()
          .toLowerCase()
          .replace("_", "-")
          .split("-")[0];
        const hasExplicitNonDefaultLanguage = configuredLanguageBase && configuredLanguageBase !== "en" && configuredLanguageBase !== "auto";
        this._state.lang = configControlsLanguage || hasExplicitNonDefaultLanguage
          ? configuredLanguage
          : (storedLanguage || configuredLanguage);
      } catch (_) {
        this._state.lang = this._config.language || "en";
      }

      try {
        this._state.cardTheme = localStorage.getItem("homeii_music_flow_theme") || this._config.theme_mode || "auto";
      } catch (_) {
        this._state.cardTheme = this._config.theme_mode || "auto";
      }
      try {
        this._state.tracksLayout = localStorage.getItem("homeii_music_flow_tracks_layout") || "list";
      } catch (_) {
        this._state.tracksLayout = "list";
      }

      this._maUrl = this._normalizeMaConfigUrl(this._config.ma_url);
      this._maExternalUrl = this._normalizeMaConfigUrl(this._config.music_assistant_external_url || this._config.ma_external_url);
      this._maToken = this._config.ma_token || "";
      this._resolvedConfigEntryId = String(this._config.config_entry_id || "").trim();
      this._resetMeasuredLayoutState();
      this._closeTransientEditorLayoutState();
      this._scheduleLayoutRecovery("config");
    }

    _getConfigValidator() {
      return HomeiiConfigValidators.validateBaseCardEditorConfig;
    }

    _getCardWidth(fallback = 0) {
      const card = this.shadowRoot?.querySelector(".card") || null;
      const widths = [
        this.getBoundingClientRect?.().width,
        this.offsetWidth,
        card?.getBoundingClientRect?.().width,
        card?.offsetWidth,
      ]
        .map((value) => Number(value || 0))
        .filter((value) => Number.isFinite(value) && value > 0);
      if (widths.length) return Math.max(...widths);
      const fallbackWidth = Number(fallback || 0);
      return Number.isFinite(fallbackWidth) && fallbackWidth > 0 ? fallbackWidth : 0;
    }

    _getCardHeight(fallback = 0) {
      const card = this.shadowRoot?.querySelector(".card") || null;
      const heights = [
        this.getBoundingClientRect?.().height,
        this.offsetHeight,
        card?.getBoundingClientRect?.().height,
        card?.offsetHeight,
      ]
        .map((value) => Number(value || 0))
        .filter((value) => Number.isFinite(value) && value > 0);
      if (heights.length) return Math.max(...heights);
      const fallbackHeight = Number(fallback || 0);
      return Number.isFinite(fallbackHeight) && fallbackHeight > 0 ? fallbackHeight : 0;
    }

    _getViewportHeight(fallback = 0) {
      const fallbackHeight = Number(fallback || 0);
      const visualHeight = typeof window !== "undefined" ? Number(window.visualViewport?.height || 0) : 0;
      const innerHeight = typeof window !== "undefined" ? Number(window.innerHeight || 0) : 0;
      const height = visualHeight > 0 ? visualHeight : innerHeight;
      if (Number.isFinite(height) && height > 0) return height;
      return Number.isFinite(fallbackHeight) && fallbackHeight > 0 ? fallbackHeight : 0;
    }

    _configuredCardHeightFallback(defaultHeight = 760) {
      const configuredHeight = Number(this._config?.height);
      if (Number.isFinite(configuredHeight) && configuredHeight > 0) {
        return Math.max(280, Math.min(1800, configuredHeight));
      }
      const fallbackHeight = Number(defaultHeight || 0);
      return Number.isFinite(fallbackHeight) && fallbackHeight > 0 ? fallbackHeight : 0;
    }

    _getAllocatedCardHeight(fallback = 0) {
      const fallbackHeight = Number(fallback || 0);
      const configuredHeight = Number(this._config?.height);
      const manualHeight = Number.isFinite(configuredHeight) && configuredHeight > 0
        ? Math.round(Math.max(280, Math.min(1800, configuredHeight)))
        : 0;
      const viewportHeight = this._getViewportHeight(fallbackHeight);
      const hostRect = this.getBoundingClientRect?.() || null;
      const top = Number(hostRect?.top || 0);
      const parentHeights = [
        this.parentElement?.getBoundingClientRect?.().height,
        this.parentElement?.parentElement?.getBoundingClientRect?.().height,
      ]
        .map((value) => Number(value || 0))
        .filter((value) => Number.isFinite(value) && value > 240);
      const panelViewportFill = HomeiiResponsiveFoundation.panelViewportFillEnabled?.({
        viewportHeight,
        hostTop: top,
        parentHeights,
      }) === true;
      const shellTopOffset = !panelViewportFill && top > 0 && top <= 160 ? top : 0;
      const viewportSafety = panelViewportFill ? 0 : viewportHeight >= 900 ? 28 : viewportHeight >= 700 ? 20 : 12;
      const viewportAvailable = viewportHeight > 0
        ? Math.max(0, viewportHeight - shellTopOffset - Math.max(0, -top) - viewportSafety)
        : 0;
      const viewportLimit = viewportAvailable > 240 ? viewportAvailable : viewportHeight;
      const boundedParentHeights = parentHeights.filter((value) => !viewportLimit || value <= viewportLimit + 4);
      const parentHeight = boundedParentHeights.length ? Math.max(...boundedParentHeights) : 0;
      if (viewportLimit > 0) {
        if (manualHeight > 0) {
          return Math.round(Math.max(Math.min(280, viewportLimit), Math.min(manualHeight, viewportLimit)));
        }
        const shouldFillViewport = parentHeight <= 0 || viewportLimit > parentHeight + 96;
        const targetHeight = shouldFillViewport ? viewportLimit : Math.min(parentHeight, viewportLimit);
        const resolvedHeight = Math.round(Math.max(Math.min(280, viewportLimit), targetHeight));
        return resolvedHeight;
      }
      if (parentHeight > 0) return Math.round(Math.max(280, parentHeight));
      if (manualHeight > 0) return manualHeight;
      return Number.isFinite(fallbackHeight) && fallbackHeight > 0 ? Math.round(fallbackHeight) : 0;
    }

    _startResizeTracking() {
      if (typeof window !== "undefined" && !this._resizeListening) {
        window.addEventListener("resize", this._boundWindowResize);
        this._resizeListening = true;
      }
      if (typeof window !== "undefined" && window.visualViewport && !this._visualViewportResizeListening) {
        window.visualViewport.addEventListener("resize", this._boundWindowResize);
        this._visualViewportResizeListening = true;
      }
      if (this._resizeObserver || typeof ResizeObserver === "undefined") return;
      this._resizeObserver = new ResizeObserver(() => this._boundWindowResize());
      this._resizeObserver.observe(this);
      if (this.parentElement) this._resizeObserver.observe(this.parentElement);
      if (this.parentElement?.parentElement) this._resizeObserver.observe(this.parentElement.parentElement);
    }

    _stopResizeTracking() {
      if (typeof window !== "undefined" && this._resizeListening) {
        window.removeEventListener("resize", this._boundWindowResize);
        this._resizeListening = false;
      }
      if (typeof window !== "undefined" && window.visualViewport && this._visualViewportResizeListening) {
        window.visualViewport.removeEventListener("resize", this._boundWindowResize);
        this._visualViewportResizeListening = false;
      }
      if (this._resizeObserver) {
        this._resizeObserver.disconnect();
        this._resizeObserver = null;
      }
    }

    _resetMeasuredLayoutState() {
      this._lastCardWidth = 0;
      this._lastCardHeight = 0;
      this._renderedLayoutMode = "";
    }

    _closeTransientEditorLayoutState() {
      if (this._state?.screensaverOpen) this._state.screensaverOpen = false;
      const overlay = this.shadowRoot?.querySelector?.("#screensaverBackdrop");
      overlay?.classList?.remove("open", "closing");
      overlay?.setAttribute?.("aria-hidden", "true");
      this.shadowRoot?.querySelector?.(".card")?.classList?.remove("screensaver-active");
      this.classList.remove("screensaver-page-open");
      clearTimeout(this._screensaverExitTimer);
      this._screensaverExitTimer = null;
      clearInterval(this._screensaverClockTimer);
      this._screensaverClockTimer = null;
    }

    _scheduleLayoutRecovery(reason = "layout") {
      clearTimeout(this._layoutRecoveryTimer);
      if (this._layoutRecoveryFrame && typeof cancelAnimationFrame === "function") {
        cancelAnimationFrame(this._layoutRecoveryFrame);
        this._layoutRecoveryFrame = null;
      }
      const run = (attempt = 0) => {
        this._layoutRecoveryFrame = null;
        if (!this.isConnected || !this._built) return;
        this._recoverLayoutAfterHostChange(reason, attempt);
        if (attempt < 3) {
          const delay = attempt === 0 ? 80 : attempt === 1 ? 220 : 520;
          this._layoutRecoveryTimer = setTimeout(() => run(attempt + 1), delay);
        }
      };
      if (typeof requestAnimationFrame === "function") {
        this._layoutRecoveryFrame = requestAnimationFrame(() => run(0));
      } else {
        this._layoutRecoveryTimer = setTimeout(() => run(0), 0);
      }
    }

    _recoverLayoutAfterHostChange(reason = "layout", attempt = 0) {
      const viewportWidth = typeof window !== "undefined" ? Number(window.innerWidth || 0) : 0;
      const viewportHeight = this._getViewportHeight(760);
      const compactExpanded = !!(this._state?.mobileCompactExpanded && this._mobileCompactModeEnabled?.());
      const compactEdgeToEdge = compactExpanded && this._mobileCompactEdgeToEdgeEnabled?.() && this._compactEdgeToEdgeAllowed?.();
      const compactWindow = compactExpanded && !compactEdgeToEdge;
      const compactWindowChrome = viewportWidth > 0 && viewportWidth < 760 ? 156 : 112;
      const width = compactWindow
        ? Math.max(320, Math.min(720, Number(viewportWidth || 0) - 32))
        : this._getCardWidth(viewportWidth);
      const height = compactEdgeToEdge
        ? viewportHeight
        : compactWindow
          ? Math.max(340, Math.min(860, Number(viewportHeight || 0) - compactWindowChrome || viewportHeight))
          : this._getAllocatedCardHeight(viewportHeight);
      if (width <= 0 || height <= 0) return;
      const layoutMode = this._layoutModeConfig({ width, compactPopup: compactExpanded });
      const profile = this._layoutProfileConfig(layoutMode, { width, height, compactPopup: compactExpanded });
      const card = this.shadowRoot?.querySelector?.(".card");
      const renderedLayoutMode = this._renderedLayoutMode
        || (card?.classList?.contains("layout-tablet") ? "tablet" : card?.classList?.contains("layout-mobile") ? "mobile" : "");
      const expectedClasses = [`layout-${layoutMode}`, ...(Array.isArray(profile?.classes) ? profile.classes : [])];
      const profileMismatch = !!card && expectedClasses.some((className) => !card.classList.contains(className));
      const widthDelta = Math.abs(width - Number(this._lastCardWidth || 0));
      const heightDelta = Math.abs(height - Number(this._lastCardHeight || 0));
      const layoutStale = !!renderedLayoutMode && renderedLayoutMode !== layoutMode;
      const screensaverStale = !!this._state?.screensaverOpen || !!this.shadowRoot?.querySelector?.("#screensaverBackdrop.open");
      const shouldRebuild = attempt === 0 || layoutStale || profileMismatch || widthDelta > 80 || heightDelta > 80 || screensaverStale;

      this._lastCardWidth = Math.round(width);
      this._lastCardHeight = Math.round(height);
      this._lastViewportWidth = viewportWidth;
      this._lastViewportHeight = viewportHeight;
      this._renderedLayoutMode = layoutMode;

      if (!shouldRebuild) return;
      this._closeTransientEditorLayoutState();
      const reopenPage = this._state?.menuOpen ? (this._state.menuPage || "settings") : "";
      const reopenStudio = !!this._state?.controlRoomOpen;
      if (typeof this._rebuildMobileUi === "function") {
        this._rebuildMobileUi({ force: true, reopenPage, reopenStudio });
        return;
      }
      this._build();
      if (typeof this._init === "function") this._init();
    }

    _layoutProfileConfig(layoutMode = this._layoutModeConfig?.() || "mobile", options = {}) {
      const viewportWidth = typeof window !== "undefined" ? Number(window.innerWidth || 0) : 0;
      const viewportHeight = this._getViewportHeight(this._configuredCardHeightFallback(0));
      const optionWidth = Number(options?.width || 0);
      const optionHeight = Number(options?.height || 0);
      const compactPopup = options?.compactPopup === true || !!(this._state?.mobileCompactExpanded && this._mobileCompactModeEnabled?.());
      const width = optionWidth > 0
        ? optionWidth
        : compactPopup
          ? this._getCardWidth(viewportWidth)
          : this._getCardWidth(this._lastCardWidth || viewportWidth);
      const height = optionHeight > 0
        ? optionHeight
        : compactPopup
          ? viewportHeight
          : this._getAllocatedCardHeight(this._lastCardHeight || this._configuredCardHeightFallback(viewportHeight) || viewportHeight);
      return HomeiiResponsiveFoundation.resolveLayoutProfile({
        width,
        height,
        layoutMode,
      });
    }

    _layoutProfileClassNames(profile = null) {
      return (Array.isArray(profile?.classes) ? profile.classes : [])
        .map((className) => String(className || "").trim())
        .filter(Boolean)
        .join(" ");
    }

    _layoutProfileStyleVars(profile = null) {
      const width = Math.max(0, Math.round(Number(profile?.width || 0)));
      const height = Math.max(0, Math.round(Number(profile?.height || 0)));
      const aspect = String(profile?.aspect || "");
      const mobileArtBudget = Math.max(120, Math.round(height * (aspect === "wide" ? 0.34 : 0.36)));
      const mobileShortArtBudget = Math.max(112, Math.round(height * 0.3));
      const mobileTightArtBudget = Math.max(104, Math.round(height * 0.25));
      const tabletArtBudget = Math.max(220, Math.round(height * 0.5));
      const tabletDenseArtBudget = Math.max(180, Math.round(height * 0.42));
      return [
        `--flow-measured-width:${width}px`,
        `--flow-measured-height:${height}px`,
        `--flow-available-height:${height}px`,
        `--flow-mobile-art-budget:${mobileArtBudget}px`,
        `--flow-mobile-short-art-budget:${mobileShortArtBudget}px`,
        `--flow-mobile-tight-art-budget:${mobileTightArtBudget}px`,
        `--flow-tablet-art-budget:${tabletArtBudget}px`,
        `--flow-tablet-dense-art-budget:${tabletDenseArtBudget}px`,
      ].join(";") + ";";
    }

    set hass(hass) {
      this._hass = hass;
      if (typeof this._onHassReady === "function") this._onHassReady();
      this._handleManualFrontRouteChange();

      if (!this._built) {
        this._built = true;
        const initialLang = homeiiDetectLanguage({
          configLanguage: this._state?.lang || this._config?.language || "en",
          hass: this._hass,
        });
        const finishInitialBuild = () => {
          this._build();
          this._init();
          this._scheduleLayoutRecovery("initial-build");
        };
        if (typeof homeiiEnsureLanguageLoaded === "function") {
          homeiiEnsureLanguageLoaded(initialLang).finally(finishInitialBuild);
        } else {
          finishInitialBuild();
        }
        return;
      }

      this._loadPlayers();
      const selectedPlayer = this._getSelectedPlayer();
      const selectedPlaybackSignature = selectedPlayer ? [
        selectedPlayer.entity_id,
        selectedPlayer.state,
        selectedPlayer.attributes?.active_queue,
        selectedPlayer.attributes?.media_content_id,
        selectedPlayer.attributes?.media_content_type,
        selectedPlayer.attributes?.media_title,
        selectedPlayer.attributes?.media_artist,
        selectedPlayer.attributes?.media_album_name,
        selectedPlayer.attributes?.entity_picture_local,
        selectedPlayer.attributes?.entity_picture,
        selectedPlayer.attributes?.media_image_url,
        selectedPlayer.attributes?.media_image,
        selectedPlayer.attributes?.media_position,
        selectedPlayer.attributes?.media_position_updated_at,
      ].map((value) => String(value ?? "")).join("||") : "";
      const selectedPlaybackChanged = !!(
        selectedPlaybackSignature
        && this._lastSelectedPlaybackSignature
        && selectedPlaybackSignature !== this._lastSelectedPlaybackSignature
      );
      if (selectedPlaybackChanged) {
        clearTimeout(this._externalPlaybackSyncTimer);
        this._externalPlaybackSyncTimer = setTimeout(() => {
          this._ensureQueueSnapshot(true).catch(() => {});
        }, 120);
      }
      this._lastSelectedPlaybackSignature = selectedPlaybackSignature;
      this._syncActivePlayerHelper(selectedPlayer);
      if (selectedPlaybackChanged) this._syncAmbientLightForCurrentMedia("playback-change");
      if (this._state?.screensaverOpen) {
        this._syncScreensaverDynamicArtwork();
        this._syncScreensaverUi();
        this._syncAmbientLightForCurrentMedia("screensaver");
        return;
      }
      this._renderPlayerSummary();
      this._syncBrandPlayingState();
      this._syncNowPlayingUI();
      if (this._state?.voiceAssistantDialogOpen) this._syncVoiceAssistantDialog();
    }

    getCardSize() {
      const fallbackHeight = this._configuredCardHeightFallback(this._getViewportHeight(760) || 760);
      const preferredFullHeight = Number(this._fullMobileInlineTargetHeight?.() || 0);
      const height = this._isCompactTileMode()
        ? this._compactTileReservedHeight()
        : this._preferFullMobileGridRows?.() && preferredFullHeight > 0
          ? Math.max(preferredFullHeight, this._getAllocatedCardHeight(fallbackHeight) || fallbackHeight)
          : (this._getAllocatedCardHeight(fallbackHeight) || fallbackHeight);
      return Math.max(4, Math.ceil(height / 50));
    }

    getGridOptions() {
      const fallbackHeight = this._configuredCardHeightFallback(this._getViewportHeight(760) || 760);
      const preferFullRows = this._preferFullMobileGridRows?.() === true;
      const compactTileMode = !preferFullRows && this._isCompactTileMode();
      const compactWidth = this._getCardWidth(this._lastCardWidth || (typeof window !== "undefined" ? Number(window.innerWidth || 0) : 0) || 390);
      const compactMiniWidget = compactTileMode && this._compactMiniWidgetMode({ width: compactWidth });
      const preferredFullHeight = Number(this._fullMobileInlineTargetHeight?.() || 0);
      const height = compactTileMode
        ? this._compactTileReservedHeight()
        : preferFullRows && preferredFullHeight > 0
          ? Math.max(preferredFullHeight, this._getAllocatedCardHeight(fallbackHeight) || fallbackHeight)
          : (this._getAllocatedCardHeight(fallbackHeight) || fallbackHeight);
      const compactMiniRows = 5;
      const fullRows = preferFullRows
        ? Math.max(6, this._sectionGridRowsForHeight(preferredFullHeight || 760))
        : 0;
      const options = {
        columns: compactTileMode ? (compactMiniWidget ? 6 : 8) : 12,
        rows: Math.max(compactMiniWidget ? compactMiniRows : 6, fullRows, this._sectionGridRowsForHeight(height)),
        min_columns: compactTileMode ? (compactMiniWidget ? 3 : 4) : 4,
        min_rows: compactMiniWidget ? compactMiniRows : (preferFullRows ? fullRows : 4),
        max_columns: 12,
      };
      if (compactMiniWidget) options.max_rows = compactMiniRows;
      return options;
    }

    _sectionGridRowsForHeight(height) {
      const target = Math.max(56, Number(height) || 56);
      return Math.max(1, Math.ceil((target + 8) / 64));
    }

    _sectionGridHeightForRows(rows) {
      const safeRows = Math.max(1, Math.round(Number(rows) || 1));
      return (safeRows * 56) + ((safeRows - 1) * 8);
    }

    static getStubConfig() {
      return {
        config_entry_id: "",
        ma_url: "",
        music_assistant_external_url: "",
        ma_token: "",
        active_player_helper_entity: "",
        rtl: true,
        language: "en",
        show_ma_button: true,
        ma_interface_url: "/music-assistant",
        ma_interface_target: "_self",
        music_assistant_timeout_ms: 12000,
        theme_mode: "auto",
        show_theme_toggle: true,
        hotel_mode: false,
        performance_profile: "full",
        performance_mode: false,
        main_opacity: 0.66,
        popup_opacity: 0.92,
      };
    }


    static getConfigForm() {
      return getBaseCardConfigForm();
    }

    static assertConfig(config) {
      if (!config || typeof config !== "object" || Array.isArray(config)) {
        throw new Error("Card config must be an object");
      }
    }

    _language() {
      return homeiiDetectLanguage({
        configLanguage: this._state?.lang || this._config?.language || "en",
        hass: this._hass,
      });
    }

    _isHebrew() {
      return homeiiIsRtlLanguage(this._language());
    }

    _i18n(key, params = {}, fallback = "") {
      return homeiiTranslate(this._language(), key, params, fallback);
    }

    _m(en, he, params = {}) {
      return homeiiTranslateText(
        this._language(),
        en,
        params,
        this._isHebrew() ? he : en,
      );
    }

    _effectiveTheme() {
      if (this._state.cardTheme === "dark") return "dark";
      if (this._state.cardTheme === "light") return "light";
      return this._hass?.themes?.darkMode ? "dark" : "light";
    }

    _hasDirectMAConnection() {
      return !!this._maBrowserUrl();
    }

    _hasRealtimeDirectMA() {
      return !!(this._maBrowserUrl() && this._maToken);
    }

    _normalizeMaConfigUrl(value = "") {
      return String(value || "").trim().replace(/\/$/, "");
    }

    _maBrowserUrl() {
      const internalUrl = this._normalizeMaConfigUrl(this._maUrl);
      const externalUrl = this._normalizeMaConfigUrl(this._maExternalUrl);
      const pageIsHttps = typeof window !== "undefined" && window.location?.protocol === "https:";
      if (pageIsHttps && externalUrl) return externalUrl;
      return internalUrl || externalUrl;
    }

    _maArtworkBaseUrl() {
      return this._maBrowserUrl() || this._maUrl;
    }

    _maMixedContentMessage() {
      return this._localText(
        "The dashboard is HTTPS but Music Assistant is configured with HTTP only. Add music_assistant_external_url with an HTTPS Music Assistant URL, or open Home Assistant over HTTP on the local network.",
        "הדשבורד פתוח ב-HTTPS אבל Music Assistant מוגדר רק ב-HTTP. הוסף music_assistant_external_url עם כתובת HTTPS של Music Assistant, או פתח את Home Assistant ב-HTTP ברשת המקומית."
      );
    }

    _assertMaBrowserUrlSecure(url = this._maBrowserUrl()) {
      if (!url) return;
      if (typeof window === "undefined" || window.location?.protocol !== "https:") return;
      const base = new URL(url, window.location.href);
      if (base.protocol !== "https:") throw new Error(this._maMixedContentMessage());
    }

    _debugLog(level = "info", ...args) {
      if (!this._config?.debug) return;
      try {
        const fn = console?.[level] || console?.log;
        if (typeof fn === "function") fn.call(console, ...args);
      } catch (_) {}
    }

    _clampedConfigNumber(key, fallback, { min = 0, max = 60000 } = {}) {
      const value = Number(this._config?.[key]);
      const safe = Number.isFinite(value) ? value : fallback;
      return Math.max(min, Math.min(max, safe));
    }

    _musicAssistantTimeoutMs() {
      return this._clampedConfigNumber("music_assistant_timeout_ms", 12000, { min: 3000, max: 60000 });
    }

    _flowAssistantResponseTimeoutMs() {
      return this._clampedConfigNumber("flow_assistant_response_timeout_ms", 18000, { min: 5000, max: 60000 });
    }

    _flowAssistantListenTimeoutMs() {
      return this._clampedConfigNumber("flow_assistant_listen_timeout_ms", 12000, { min: 5000, max: 30000 });
    }

    _flowAssistantAutoCloseMs(status = "success") {
      const fallback = String(status || "").toLowerCase() === "error" ? 7000 : 4200;
      return this._clampedConfigNumber("flow_assistant_auto_close_ms", fallback, { min: 0, max: 30000 });
    }

    _timeoutMessage(label = "Request") {
      return this._m(
        `${label} did not respond in time. Check Music Assistant and try again.`,
        `${label} לא החזיר תשובה בזמן. בדוק את Music Assistant ונסה שוב.`,
      );
    }

    _withTimeout(promise, timeoutMs = 0, message = "") {
      const ms = Number(timeoutMs || 0);
      if (!Number.isFinite(ms) || ms <= 0) return Promise.resolve(promise);
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          const error = new Error(message || this._timeoutMessage());
          error.code = "HOMEII_TIMEOUT";
          reject(error);
        }, ms);
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

    _mediaRefsEquivalent(uriA = "", uriB = "", fallbackType = "track") {
      return HomeiiMediaQueueFoundation.mediaRefsEquivalent(uriA, uriB, fallbackType);
    }

    _currentWindowOrigin() {
      try {
        return typeof window !== "undefined" ? (window.location?.origin || "") : "";
      } catch (_) {
        return "";
      }
    }

    _currentWindowHostname() {
      try {
        return typeof window !== "undefined" ? (window.location?.hostname || "") : "";
      } catch (_) {
        return "";
      }
    }

    _isPrivateNetworkHost(hostname = "") {
      const host = String(hostname || "").trim().toLowerCase().replace(/^\[|\]$/g, "");
      if (!host) return false;
      if (host === "localhost" || host.endsWith(".local") || host.endsWith(".lan")) return true;
      if (host === "::1" || host.startsWith("fe80:") || host.startsWith("fc") || host.startsWith("fd")) return true;
      if (/^127\./.test(host) || /^10\./.test(host) || /^192\.168\./.test(host) || /^169\.254\./.test(host)) return true;
      const match = host.match(/^172\.(\d{1,2})\./);
      return !!(match && Number(match[1]) >= 16 && Number(match[1]) <= 31);
    }

    _isRemoteUnsafeArtworkUrl(url = "") {
      const raw = String(url || "").trim();
      if (!/^https?:\/\//i.test(raw)) return false;
      try {
        const currentHost = this._currentWindowHostname();
        const currentProtocol = typeof window !== "undefined" ? window.location?.protocol : "";
        const target = new URL(raw);
        if (target.hostname === currentHost) return false;
        if (!this._isPrivateNetworkHost(currentHost) && this._isPrivateNetworkHost(target.hostname)) return true;
        return currentProtocol === "https:" && target.protocol === "http:" && this._isPrivateNetworkHost(target.hostname);
      } catch (_) {
        return false;
      }
    }

    _artworkCacheToken(cacheKey = "") {
      const key = String(cacheKey || "").trim();
      if (!key) return "";
      let hash = 2166136261;
      for (let index = 0; index < key.length; index += 1) {
        hash ^= key.charCodeAt(index);
        hash = Math.imul(hash, 16777619) >>> 0;
      }
      return `${hash.toString(36)}-${key.length.toString(36)}`;
    }

    _cacheBustedArtworkUrl(url = "", cacheKey = "") {
      const raw = String(url || "").trim();
      const token = this._artworkCacheToken(cacheKey);
      if (!raw || !token || /^(data:|blob:)/i.test(raw)) return raw;
      if (this._isOpaqueMaImageProxyUrl(raw)) return raw;
      try {
        const parsed = new URL(raw, this._currentWindowOrigin() || undefined);
        parsed.searchParams.set("_homeii_art", token);
        return parsed.toString();
      } catch {
        const separator = raw.includes("?") ? "&" : "?";
        return `${raw}${separator}_homeii_art=${encodeURIComponent(token)}`;
      }
    }

    _isOpaqueMaImageProxyUrl(url = "") {
      const raw = String(url || "").trim();
      if (!raw || raw.includes("/imageproxy?")) return false;
      try {
        const parsed = new URL(raw, this._maArtworkBaseUrl() || this._currentWindowOrigin() || undefined);
        return /\/imageproxy\/[^/]+/.test(parsed.pathname);
      } catch {
        return /^\/?imageproxy\/[^/]+/.test(raw);
      }
    }

    _normalizeArtworkUrl(value = "", { size = 300, cacheKey = "" } = {}) {
      const raw = String(value || "").trim();
      if (!raw) return "";
      if (/^(data:|blob:)/i.test(raw)) return raw;
      let resolved = raw;
      const maArtworkBaseUrl = this._maArtworkBaseUrl();
      if (!/^https?:\/\//i.test(resolved)) {
        if (resolved.startsWith("//")) {
          const protocol = typeof window !== "undefined" ? (window.location?.protocol || "https:") : "https:";
          resolved = `${protocol}${resolved}`;
        } else if (resolved.startsWith("/api/") || resolved.startsWith("/local/") || resolved.startsWith("/hacsfiles/")) {
          const origin = this._currentWindowOrigin();
          resolved = origin ? new URL(resolved, origin).toString() : resolved;
        } else if (resolved.startsWith("/imageproxy")) {
          resolved = maArtworkBaseUrl ? new URL(resolved, maArtworkBaseUrl).toString() : resolved;
        } else if (resolved.startsWith("imageproxy?") || resolved.startsWith("imageproxy/")) {
          resolved = maArtworkBaseUrl ? new URL(`/${resolved}`, maArtworkBaseUrl).toString() : `/${resolved}`;
        } else if (resolved.startsWith("/")) {
          const origin = this._currentWindowOrigin();
          resolved = origin ? new URL(resolved, origin).toString() : resolved;
        } else {
          resolved = HomeiiMediaPresentationFoundation.imageProxyUrl(resolved, "", size, maArtworkBaseUrl) || "";
        }
      }
      if (resolved.includes("/imageproxy?") || resolved.includes("/imageproxy/")) {
        resolved = HomeiiMediaPresentationFoundation.normalizeImageProxyUrl(resolved, size, maArtworkBaseUrl);
      }
      return this._cacheBustedArtworkUrl(resolved, cacheKey);
    }

    _bestArtworkUrl(candidates = [], options = {}) {
      const resolved = (Array.isArray(candidates) ? candidates : [candidates])
        .map((candidate) => this._normalizeArtworkUrl(candidate, options))
        .filter(Boolean)
        .filter((url, index, list) => list.indexOf(url) === index);
      if (!resolved.length) return "";
      return resolved.find((url) => !this._isRemoteUnsafeArtworkUrl(url)) || resolved[0];
    }

    _currentArtworkCacheKey(player = null, queueItem = null) {
      const media = queueItem?.media_item || {};
      return [
        player?.entity_id,
        player?.attributes?.media_content_id,
        player?.attributes?.media_title,
        player?.attributes?.media_artist,
        player?.attributes?.media_album_name,
        player?.attributes?.current_media?.image_url,
        player?.attributes?.currentMedia?.image_url,
        player?.attributes?.entity_picture_local,
        player?.attributes?.entity_picture,
        player?.attributes?.media_image_url,
        player?.attributes?.media_image,
        this._getQueueItemStableId?.(queueItem),
        this._getQueueItemUri?.(queueItem),
        queueItem?.streamdetails?.stream_metadata?.image_url,
        media?.name,
        media?.image_url,
        media?.image,
        media?.album?.name,
        media?.album?.image_url,
        media?.album?.image,
      ].map((value) => String(value || "").trim()).filter(Boolean).join("|");
    }

    _currentArtworkUrl(player = null, queueItem = null, size = 420, options = {}) {
      const attrs = player?.attributes || {};
      const media = queueItem?.media_item || {};
      const cacheKey = this._currentArtworkCacheKey(player, queueItem);
      const playerArtwork = [
        attrs.current_media?.image_url,
        attrs.currentMedia?.image_url,
        attrs.media_image_url,
        attrs.media_image,
        attrs.entity_picture_local,
        attrs.entity_picture,
        attrs.thumbnail,
      ];
      const queueArtwork = [
        this._queueItemImageUrl?.(queueItem, size),
        queueItem?.streamdetails?.stream_metadata?.image_url,
        queueItem?.media_image,
        queueItem?.image_url,
        queueItem?.image,
        media?.image_url,
        media?.image,
        media?.album?.image_url,
        media?.album?.image,
      ];
      const queueMatchesPlayer = !queueItem || typeof this._queueItemMatchesPlayer !== "function" || this._queueItemMatchesPlayer(queueItem, player);
      const explicitQueueArtwork = options?.preferPlayerArtwork === false;
      const preferPlayerArtwork = options?.preferPlayerArtwork === true || (!explicitQueueArtwork && !queueMatchesPlayer && playerArtwork.some(Boolean));
      return this._bestArtworkUrl(preferPlayerArtwork
        ? [...playerArtwork, ...queueArtwork]
        : [...queueArtwork, ...playerArtwork], { size, cacheKey });
    }

    _artPlaceholderHtml(icon = "music_note") {
      return `
        <span class="homeii-art-fallback" aria-hidden="true">
          <span class="homeii-art-fallback-disc">${this._iconSvg(icon || "music_note")}</span>
        </span>
      `;
    }

    _t(text, params = {}) {
      return homeiiTranslateText(this._language(), text, params, text);
    }

    _iconSvg(name) {
      const requestedIcon = String(name || "").trim();
      const icons = {
        play: `<svg class="ui-ic" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M8 5.5v13l10-6.5z"/></svg>`,
        pause: `<svg class="ui-ic" viewBox="0 0 24 24" aria-hidden="true"><rect x="6.5" y="5" width="4" height="14" rx="1.2" fill="currentColor"></rect><rect x="13.5" y="5" width="4" height="14" rx="1.2" fill="currentColor"></rect></svg>`,
        previous: `<svg class="ui-ic" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 6h2v12H7zM18 6.5v11L10.5 12z"/></svg>`,
        next: `<svg class="ui-ic" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M15 6h2v12h-2zM6 6.5v11L13.5 12z"/></svg>`,
        shuffle: `<svg class="ui-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M16 5h3v3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path><path d="M4 7h5l7 10h3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path><path d="M16 19h3v-3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path><path d="M4 17h5l2-3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path><path d="M13 10l3-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>`,
        repeat: `<svg class="ui-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7h10l-2-2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path><path d="M17 17H7l2 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path><path d="M17 7l2 2-2 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path><path d="M7 17l-2-2 2-2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>`,
        repeat_one: `<svg class="ui-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7h10l-2-2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path><path d="M17 17H7l2 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path><path d="M17 7l2 2-2 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path><path d="M7 17l-2-2 2-2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path><path fill="currentColor" d="M11.2 9.8h1.5v4.9h-1.5z"></path><path fill="currentColor" d="M10.4 10.7l1.8-1.3v1.7z"></path></svg>`,
        pin: `<svg class="ui-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="m14 4 6 6-3.2 1.2-3.1 5.6-2.4-2.4L6 20l3.6-6.6-2.4-2.4 5.6-3.1z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"></path><path d="m4 20 5-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>`,
        speaker: `<svg class="ui-ic" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2M10 4.5A1.5 1.5 0 1 1 10 7.5 1.5 1.5 0 0 1 10 4.5M10 19a4 4 0 1 1 0-8 4 4 0 0 1 0 8M10 13a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"></path></svg>`,
        speaker_group: `<svg class="ui-ic" viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3.5" width="6" height="17" rx="1.8" fill="none" stroke="currentColor" stroke-width="2"></rect><circle cx="12" cy="8" r="1.1" fill="currentColor"></circle><circle cx="12" cy="15.5" r="2.5" fill="none" stroke="currentColor" stroke-width="2"></circle><path d="M5.5 7.5v9M18.5 7.5v9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path><path d="M4 10.5v3M20 10.5v3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>`,
        volume_mute: `<svg class="ui-ic" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M14 4.5 9.5 8H6.8A1.8 1.8 0 0 0 5 9.8v4.4A1.8 1.8 0 0 0 6.8 16h2.7l4.5 3.5c.6.4 1.4 0 1.4-.8V5.3c0-.8-.8-1.2-1.4-.8Z"></path><path d="m18 9 4 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path><path d="m22 9-4 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>`,
        volume_low: `<svg class="ui-ic" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M14 4.5 9.5 8H6.8A1.8 1.8 0 0 0 5 9.8v4.4A1.8 1.8 0 0 0 6.8 16h2.7l4.5 3.5c.6.4 1.4 0 1.4-.8V5.3c0-.8-.8-1.2-1.4-.8Z"></path><path d="M18 10.2a2.6 2.6 0 0 1 0 3.6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>`,
        volume_high: `<svg class="ui-ic" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M14 4.5 9.5 8H6.8A1.8 1.8 0 0 0 5 9.8v4.4A1.8 1.8 0 0 0 6.8 16h2.7l4.5 3.5c.6.4 1.4 0 1.4-.8V5.3c0-.8-.8-1.2-1.4-.8Z"></path><path d="M17.5 9.2a4 4 0 0 1 0 5.6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path><path d="M19.6 6.8a7 7 0 0 1 0 10.4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>`,
        library_music: `<svg class="ui-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h7.5M5 12h6.2M5 17h4.6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path><path d="M16.8 5.4v9.3a2.5 2.5 0 1 1-1.45-2.27V7.05l4.35-1v2.4l-4.35 1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>`,
        media: `<svg class="ui-ic" viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="7" height="7" rx="2" fill="none" stroke="currentColor" stroke-width="2"></rect><rect x="13" y="4" width="7" height="7" rx="2" fill="none" stroke="currentColor" stroke-width="2"></rect><rect x="4" y="13" width="7" height="7" rx="2" fill="none" stroke="currentColor" stroke-width="2"></rect><rect x="13" y="13" width="7" height="7" rx="2" fill="none" stroke="currentColor" stroke-width="2"></rect></svg>`,
        menu: `<svg class="ui-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 7h12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path><path d="M6 12h12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path><path d="M6 17h12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>`,
        drawer_handle: `<svg class="ui-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5.5 13.4 12 7 18.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"></path><path d="M13 5.5 19.4 12 13 18.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" opacity=".55"></path></svg>`,
        language: `<svg class="ui-ic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.2" fill="none" stroke="currentColor" stroke-width="2"></circle><path d="M4.8 12h14.4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path><path d="M12 3.8c2.1 2.2 3.2 4.9 3.2 8.2s-1.1 6-3.2 8.2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path><path d="M12 3.8C9.9 6 8.8 8.7 8.8 12s1.1 6 3.2 8.2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path></svg>`,
        settings: `<svg class="ui-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 8.2A3.8 3.8 0 1 0 12 15.8 3.8 3.8 0 0 0 12 8.2Z" fill="none" stroke="currentColor" stroke-width="2"></path><path d="M4 13.4v-2.8l2.1-.5a6.2 6.2 0 0 1 .8-1.8L5.8 6.6l2-2 1.7 1.1c.6-.3 1.2-.6 1.8-.8L11.8 3h2.8l.5 2.1c.6.2 1.2.5 1.8.8l1.7-1.1 2 2-1.1 1.7c.3.6.6 1.2.8 1.8l2.1.5v2.8l-2.1.5a6.2 6.2 0 0 1-.8 1.8l1.1 1.7-2 2-1.7-1.1c-.6.3-1.2.6-1.8.8l-.5 2.1h-2.8l-.5-2.1a6.2 6.2 0 0 1-1.8-.8l-1.7 1.1-2-2 1.1-1.7a6.2 6.2 0 0 1-.8-1.8Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"></path></svg>`,
        home: `<svg class="ui-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M4.8 11.1 12 5l7.2 6.1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path><path d="M7.2 10.2v8.3h9.6v-8.3" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"></path><path d="M10.2 18.5v-4.7h3.6v4.7" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"></path></svg>`,
        stats: `<svg class="ui-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 18.5V13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path><path d="M10 18.5V9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path><path d="M15 18.5V5.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path><path d="M20 18.5V11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>`,
        sort_asc: `<svg class="ui-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 18V6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path><path d="m4.5 8.5 2.5-2.5 2.5 2.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path><path d="M12 8h7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path><path d="M12 13h5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path><path d="M12 18h3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>`,
        sort_desc: `<svg class="ui-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 6v12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path><path d="m4.5 15.5 2.5 2.5 2.5-2.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path><path d="M12 8h3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path><path d="M12 13h5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path><path d="M12 18h7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>`,
        search: `<svg class="ui-ic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" stroke-width="2"></circle><path d="m16 16 4 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>`,
        album: `<svg class="ui-ic" viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="3" fill="none" stroke="currentColor" stroke-width="2"></rect><circle cx="12" cy="12" r="3.1" fill="none" stroke="currentColor" stroke-width="2"></circle><circle cx="12" cy="12" r="1" fill="currentColor"></circle></svg>`,
        playlist: `<svg class="ui-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path><path d="M5 12h10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path><path d="M5 17h6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path><path d="M18 15.4a2.2 2.2 0 1 1-1.2-2V8.2l3.2-.9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>`,
        artist: `<svg class="ui-ic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.2" fill="none" stroke="currentColor" stroke-width="2"></circle><path d="M6 18.5a6 6 0 0 1 12 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>`,
        podcast: `<svg class="ui-ic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="11" r="2.2" fill="none" stroke="currentColor" stroke-width="2"></circle><path d="M12 14.2v3.8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path><path d="M8.3 15.2a5 5 0 1 1 7.4 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path><path d="M5.8 17.2a8.2 8.2 0 1 1 12.4 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>`,
        queue: `<svg class="ui-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path><path d="M5 12h9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path><path d="M5 17h6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path><path d="M17 9.5 20 12l-3 2.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>`,
        history: `<svg class="ui-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path><path d="M5 12h5.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path><path d="M5 17h4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path><path d="M18.5 8.5a5.5 5.5 0 1 0 1.6 3.9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path><path d="M18.5 5.8v3.2h-3.2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path><path d="M16.5 12v2.6l2 1.1" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path></svg>`,
        lyrics: `<svg class="ui-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7.5h9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path><path d="M5 11.5h9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path><path d="M5 15.5h6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path><path d="M18 6v8.5a2.5 2.5 0 1 1-1.4-2.25V7.4l3.4-.9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>`,
        heart_outline: `<svg class="ui-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5 5.7 14.6A4.7 4.7 0 0 1 12 7.8a4.7 4.7 0 0 1 6.3-.1 4.8 4.8 0 0 1 0 6.9Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"></path></svg>`,
        heart_filled: `<svg class="ui-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5 5.7 14.6A4.7 4.7 0 0 1 12 7.8a4.7 4.7 0 0 1 6.3-.1 4.8 4.8 0 0 1 0 6.9Z" fill="currentColor" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"></path></svg>`,
        music_note: `<svg class="ui-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M14 5v9.1a3.3 3.3 0 1 1-1.9-3V7.1l6-1.6v6.6a3.3 3.3 0 1 1-1.9-3V4z" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"></path></svg>`,
        moon: `<svg class="ui-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.2 14.6A7.8 7.8 0 0 1 9.4 5.8a7.8 7.8 0 1 0 8.8 8.8Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path><path d="M16.7 4.8v2.1M21 9.1h-2.1M18.9 7l-1.5-1.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path></svg>`,
        timer: `<svg class="ui-ic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="13" r="7" fill="none" stroke="currentColor" stroke-width="2"></circle><path d="M12 13V9.6M12 13l2.3 1.5M9 3.8h6M15.4 5.4l1.4-1.4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>`,
        wand: `<svg class="ui-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="m5 19 10-10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path><path d="m14.2 5.8 1.3-1.3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path><path d="m18 9.5 1.5-1.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path><path d="m15.2 3.5.3 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path><path d="m18.9 7.2.3 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path><path d="m16.9 8.8 2 .3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path><path d="m7.2 16.8 2 .3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>`,
        radio: `<svg class="ui-ic" viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="7" width="16" height="11" rx="3" fill="none" stroke="currentColor" stroke-width="2"></rect><path d="M8 12h5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path><path d="M8 15h3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path><circle cx="16.5" cy="13" r="2" fill="none" stroke="currentColor" stroke-width="2"></circle><path d="M9 7 16.5 4.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>`,
        tracks: `<svg class="ui-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 6.5v10.2a2.6 2.6 0 1 1-1.5-2.35V8.2l9-2.2v8.7a2.6 2.6 0 1 1-1.5-2.35V7.2Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>`,
        grid: `<svg class="ui-ic" viewBox="0 0 24 24" aria-hidden="true"><rect x="4.5" y="4.5" width="6" height="6" rx="1.5" fill="none" stroke="currentColor" stroke-width="2"></rect><rect x="13.5" y="4.5" width="6" height="6" rx="1.5" fill="none" stroke="currentColor" stroke-width="2"></rect><rect x="4.5" y="13.5" width="6" height="6" rx="1.5" fill="none" stroke="currentColor" stroke-width="2"></rect><rect x="13.5" y="13.5" width="6" height="6" rx="1.5" fill="none" stroke="currentColor" stroke-width="2"></rect></svg>`,
        list: `<svg class="ui-ic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="6.5" cy="7" r="1.2" fill="currentColor"></circle><circle cx="6.5" cy="12" r="1.2" fill="currentColor"></circle><circle cx="6.5" cy="17" r="1.2" fill="currentColor"></circle><path d="M10 7h8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path><path d="M10 12h8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path><path d="M10 17h8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>`,
        info: `<svg class="ui-ic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.2" fill="none" stroke="currentColor" stroke-width="2"></circle><path d="M12 10.8v5.6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"></path><circle cx="12" cy="7.6" r="1.25" fill="currentColor"></circle></svg>`,
        more: `<svg class="ui-ic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="6.5" cy="12" r="1.6" fill="currentColor"></circle><circle cx="12" cy="12" r="1.6" fill="currentColor"></circle><circle cx="17.5" cy="12" r="1.6" fill="currentColor"></circle></svg>`,
        mic: `<svg class="ui-ic" viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="4" width="6" height="10" rx="3" fill="none" stroke="currentColor" stroke-width="2"></rect><path d="M6 11.5a6 6 0 0 0 12 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path><path d="M12 17.5V21" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path><path d="M9 21h6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>`,
        announcement: `<svg class="ui-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 10v4a2 2 0 0 0 2 2h2l5 3V5L9 8H7a2 2 0 0 0-2 2Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"></path><path d="M17 9.5a3.5 3.5 0 0 1 0 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path><path d="M19.5 7a7 7 0 0 1 0 10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>`,
        stop: `<svg class="ui-ic" viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="7" width="10" height="10" rx="1.8" fill="currentColor"></rect></svg>`,
        power: `<svg class="ui-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.8v8.1" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"></path><path d="M7.1 7.5a7 7 0 1 0 9.8 0" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"></path></svg>`,
        up: `<svg class="ui-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 18V7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path><path d="m7.5 11.5 4.5-4.5 4.5 4.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>`,
        down: `<svg class="ui-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 6v11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path><path d="m7.5 12.5 4.5 4.5 4.5-4.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>`,
        trash: `<svg class="ui-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path><path d="M9 7V5.8A1.8 1.8 0 0 1 10.8 4h2.4A1.8 1.8 0 0 1 15 5.8V7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path><path d="M8 7.5v9.2A2.3 2.3 0 0 0 10.3 19h3.4A2.3 2.3 0 0 0 16 16.7V7.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path><path d="M10.5 10.5v5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path><path d="M13.5 10.5v5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>`,
        plus: `<svg class="ui-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5.5v13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"></path><path d="M5.5 12h13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"></path></svg>`,
        minus: `<svg class="ui-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M5.5 12h13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"></path></svg>`,
        check: `<svg class="ui-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 12.5 4 4L18 8.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"></path></svg>`,
        close: `<svg class="ui-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="m7 7 10 10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path><path d="m17 7-10 10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>`,
        fullscreen: `<svg class="ui-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.5 4.8H5.2v3.3" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"></path><path d="M5.4 5.4 10 10" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"></path><path d="M15.5 4.8h3.3v3.3" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"></path><path d="M18.6 5.4 14 10" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"></path><path d="M8.5 19.2H5.2v-3.3" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"></path><path d="M5.4 18.6 10 14" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"></path><path d="M15.5 19.2h3.3v-3.3" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"></path><path d="M18.6 18.6 14 14" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"></path></svg>`,
      };
      if (icons[requestedIcon]) return icons[requestedIcon];
      if (/^[a-z0-9_-]+:[a-z0-9_-]+$/i.test(requestedIcon)) {
        return `<ha-icon class="ui-ic ha-ui-ic" icon="${this._esc(requestedIcon)}"></ha-icon>`;
      }
      return "";
    }

    _versionedAssetUrl(url) {
      const value = String(url || "").trim();
      if (!value || /^data:/i.test(value) || /[?&]v=/.test(value)) return value;
      const version = typeof HOMEII_CARD_VERSION === "string" ? HOMEII_CARD_VERSION : "5.8.1";
      return `${value}${value.includes("?") ? "&" : "?"}v=${encodeURIComponent(version)}`;
    }

    _brandLogoCandidates() {
      if (Array.isArray(this._homeiiBrandLogoCandidates)) return this._homeiiBrandLogoCandidates;
      const urls = [];
      const push = (url, versioned = false) => {
        const value = String(url || "").trim();
        if (!value) return;
        const next = versioned ? this._versionedAssetUrl(value) : value;
        if (!urls.includes(next)) urls.push(next);
      };
      const configured = String(this._config?.brand_logo_url || this._config?.logo_url || "").trim();
      push(configured);
      try {
        push(new URL("../homeii-flow-logo.svg", import.meta.url).href, true);
      } catch (_) {}
      push("/local/community/homeii-music-flow/homeii-flow-logo.svg", true);
      push("/hacsfiles/homeii-music-flow/homeii-flow-logo.svg", true);
      push("/local/homeii-flow-logo.svg", true);
      this._homeiiBrandLogoCandidates = urls.length ? urls : ["/local/community/homeii-music-flow/homeii-flow-logo.svg"];
      return this._homeiiBrandLogoCandidates;
    }

    _brandLogoUrl() {
      if (typeof this._homeiiBrandLogoUrl === "string" && this._homeiiBrandLogoUrl) return this._homeiiBrandLogoUrl;
      this._homeiiBrandLogoUrl = this._brandLogoCandidates()[0] || "/local/community/homeii-music-flow/homeii-flow-logo.svg";
      return this._homeiiBrandLogoUrl;
    }

    _brandLogoImgHtml(className = "homeii-logo-fallback") {
      const candidates = this._brandLogoCandidates();
      const primary = candidates[0] || this._brandLogoUrl();
      const fallbacks = candidates.slice(1).join("|");
      return `<img class="${this._esc(className)}" data-homeii-brand-logo="1" data-homeii-logo-fallbacks="${this._esc(fallbacks)}" src="${this._esc(primary)}" alt="HOMEii Flow" loading="lazy" decoding="async">`;
    }

    _tabletBrandSignatureHtml(className = "tablet-brand-logo") {
      return `
        <svg class="brand-signature-logo ${this._esc(className)}" viewBox="0 0 360 86" role="img" aria-label="HOMEii Flow">
          <path class="tablet-brand-wave" d="M8 50 C42 34 72 34 106 50 C142 67 173 65 206 45 C241 24 274 28 352 48" fill="none" pathLength="1"/>
          <text class="tablet-brand-home" x="180" y="42" text-anchor="middle">HOMEii</text>
          <text class="tablet-brand-flow" x="180" y="70" text-anchor="middle">FLOW</text>
          <line class="tablet-brand-rule" x1="110" y1="52" x2="250" y2="52" pathLength="1"/>
        </svg>
      `;
    }

    _handleBrandLogoError(event) {
      const img = event?.target;
      if (!img?.dataset) return;
      if (img.dataset.homeiiArtFallback === "1") {
        const current = img.getAttribute("src") || "";
        if (current) this._imageFailed?.add?.(current);
        const fallback = img.dataset.homeiiArtFallbackIcon || "music_note";
        const host = img.closest?.(".art-stack-card");
        if (host) {
          host.classList.add("placeholder");
          host.innerHTML = this._mobileArtFallbackHtml(fallback);
        }
        return;
      }
      if (img.dataset.homeiiBrandLogo !== "1") return;
      const current = img.getAttribute("src") || "";
      const fallbacks = String(img.dataset.homeiiLogoFallbacks || "")
        .split("|")
        .map((url) => url.trim())
        .filter(Boolean);
      while (fallbacks.length) {
        const next = fallbacks.shift();
        if (!next || next === current) continue;
        img.dataset.homeiiLogoFallbacks = fallbacks.join("|");
        img.setAttribute("src", next);
        return;
      }
      img.classList.add("logo-load-failed");
    }

    _setButtonIcon(el, name) {
      if (!el) return;
      el.innerHTML = this._iconSvg(name);
    }

    _syncQueueLikeActionButton(el, liked = false) {
      if (!el) return;
      const nextLiked = !!liked;
      el.classList.toggle("active", nextLiked);
      el.dataset.queueLiked = nextLiked ? "true" : "false";
      el.setAttribute("aria-pressed", nextLiked ? "true" : "false");
      this._setButtonIcon(el, nextLiked ? "heart_filled" : "heart_outline");
    }

    _volumeIconName(player) {
      const vol = Math.round((player?.attributes?.volume_level || 0) * 100);
      if (this._isMuted(player) || vol === 0) return "volume_mute";
      if (vol < 40) return "volume_low";
      return "volume_high";
    }

    _playPauseIconName(player) {
      return player?.state === "playing" ? "pause" : "play";
    }

    _build() {
      if (this._imgObserver) {
        this._imgObserver.disconnect();
        this._imgObserver = null;
        this._imgObserverRoot = null;
      }
      this._cache.library.clear();
      this._imageBlobCache.clear();
      const rtl = this._isHebrew();
      const theme = this._effectiveTheme();
      const visualTheme = theme;
      const configuredHeight = Math.max(420, this._configuredCardHeightFallback(760));
      const viewportHeight = this._getViewportHeight(configuredHeight);
      const allocatedHeight = this._getAllocatedCardHeight(configuredHeight);
      const layoutProfile = this._layoutProfileConfig("browser", { height: allocatedHeight });
      const layoutProfileClass = this._layoutProfileClassNames(layoutProfile);
      const layoutProfileStyle = this._layoutProfileStyleVars(layoutProfile);
      const effectiveHeight = Math.max(360, Math.min(allocatedHeight || configuredHeight, viewportHeight - 24));
      const uiScale = Math.max(0.72, Math.min(1.02, effectiveHeight / 820));
      const mainOpacity = Math.max(0.3, Math.min(0.98, Number(this._config.main_opacity ?? 0.66)));
      const popupOpacity = Math.max(0.4, Math.min(0.98, Number(this._config.popup_opacity ?? 0.92)));
      const darkBgAlpha = Math.max(0.34, Math.min(0.9, mainOpacity * 0.92));
      const darkSidebarAlpha = Math.max(0.4, Math.min(0.95, mainOpacity * 0.98));
      const darkPanelAlpha = Math.max(0.42, Math.min(0.97, mainOpacity + 0.02));
      const lightBgAlpha = Math.max(0.46, Math.min(0.96, mainOpacity));
      const lightPanelAlpha = Math.max(0.56, Math.min(0.98, mainOpacity + 0.06));
      const modalOverlayAlpha = theme === "dark"
        ? Math.max(0.32, Math.min(0.7, popupOpacity * 0.62))
        : Math.max(0.18, Math.min(0.42, popupOpacity * 0.28));

      this.shadowRoot.innerHTML = `
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;700;800;900&family=Rubik:wght@400;500;700;800;900&display=swap');
          :host {
            display:block;
            container-type:inline-size;
            container-name:homeii-browser-host;
            margin:0 !important;
            padding:0 !important;
            background:transparent !important;
            border:none !important;
            box-shadow:none !important;
            --ma-accent: var(--accent-color, #e0a11b);
            --ma-radius-xl: 22px;
            overflow:hidden !important;
            border-radius:var(--ma-radius-xl);
            --ma-card-height: ${Math.round(allocatedHeight || effectiveHeight)}px;
            --ma-effective-height: ${effectiveHeight}px;
            --ma-ui-scale: ${uiScale.toFixed(3)};
            --ma-main-opacity: ${mainOpacity.toFixed(2)};
            --ma-popup-opacity: ${popupOpacity.toFixed(2)};
            --ma-shell-pad: calc(16px * var(--ma-ui-scale));
            --ma-shell-gap: calc(14px * var(--ma-ui-scale));
            --ma-control-size: calc(42px * var(--ma-ui-scale));
            --ma-chip-height: calc(44px * var(--ma-ui-scale));
            --ma-np-art-size: calc(96px * var(--ma-ui-scale));
            --ma-now-button-size: calc(58px * var(--ma-ui-scale));
            --ma-now-main-button-size: calc(82px * var(--ma-ui-scale));
            --ma-track-title-size: calc(24px * var(--ma-ui-scale));
            --ma-blur: blur(18px);
            font-family:'Outfit','Segoe UI',system-ui,sans-serif;
          }
          ha-card {
            background:transparent !important;
            border:none !important;
            box-shadow:none !important;
            overflow:hidden !important;
            border-radius:var(--ma-radius-xl);
          }
          .card.rtl,
          .card.rtl button,
          .card.rtl input,
          .card.rtl textarea,
          .card.rtl select {
            font-family:'Heebo','Outfit','Segoe UI',system-ui,sans-serif;
          }
          .theme-dark {
            --ma-bg: rgba(18,20,26,${darkBgAlpha.toFixed(2)});
            --ma-sidebar: rgba(14,16,22,${darkSidebarAlpha.toFixed(2)});
            --ma-topbar: rgba(20,22,29,${Math.max(0.36, Math.min(0.94, mainOpacity * 0.92)).toFixed(2)});
            --ma-panel: rgba(24,26,33,${darkPanelAlpha.toFixed(2)});
            --ma-soft: rgba(255,255,255,0.07);
            --ma-soft-2: rgba(255,255,255,0.10);
            --ma-border: rgba(255,255,255,0.10);
            --ma-text-1: var(--primary-text-color, #f1f3f8);
            --ma-text-2: var(--secondary-text-color, #b7bccb);
            --ma-text-3: rgba(200,205,220,0.65);
            --ma-shadow: 0 18px 44px rgba(0,0,0,0.34);
            --ma-modal-bg: rgba(18,22,30,${Math.max(0.68, popupOpacity).toFixed(2)});
            --ma-modal-soft: rgba(255,255,255,0.06);
            --ma-modal-border: rgba(255,255,255,0.14);
          }
          .theme-light {
            --ma-bg: rgba(248,250,253,${Math.max(0.84, lightBgAlpha + 0.16).toFixed(2)});
            --ma-sidebar: rgba(236,241,247,${Math.max(0.88, mainOpacity + 0.12).toFixed(2)});
            --ma-topbar: rgba(242,246,251,${Math.max(0.9, mainOpacity + 0.16).toFixed(2)});
            --ma-panel: rgba(255,255,255,${Math.max(0.9, lightPanelAlpha + 0.18).toFixed(2)});
            --ma-soft: rgba(18,25,36,0.055);
            --ma-soft-2: rgba(18,25,36,0.12);
            --ma-border: rgba(18,25,36,0.14);
            --ma-text-1: #16202d;
            --ma-text-2: #445166;
            --ma-text-3: rgba(22,32,45,0.72);
            --ma-shadow: 0 18px 44px rgba(28,35,45,0.10);
            --ma-modal-bg: rgba(255,255,255,${Math.max(0.82, popupOpacity).toFixed(2)});
            --ma-modal-soft: rgba(20,24,32,0.04);
            --ma-modal-border: rgba(20,24,32,0.12);
          }
          * { box-sizing:border-box; }
          *::before,*::after { box-sizing:border-box; }
          .card {
            display:grid;
            grid-template-columns:220px minmax(0,1fr);
            container-type:inline-size;
            container-name:homeii-browser-card;
            position:relative;
            width:100%;
            height:min(var(--ma-card-height), calc(100dvh - 24px));
            min-height:min(520px, var(--ma-effective-height));
            max-height:calc(100dvh - 24px);
            overflow:hidden;
            border-radius:var(--ma-radius-xl);
            background:linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01)), var(--ma-bg);
            color:var(--ma-text-1);
            border:1px solid var(--ma-border);
            box-shadow:var(--ma-shadow);
            backdrop-filter: var(--ma-blur);
            -webkit-backdrop-filter: var(--ma-blur);
          }
          .card.rtl { direction:rtl; }
          .sidebar {
            min-width:0;
            display:flex;
            flex-direction:column;
            background:var(--ma-sidebar);
            border-inline-end:1px solid var(--ma-border);
            backdrop-filter:blur(16px);
            -webkit-backdrop-filter:blur(16px);
          }
          .brand {
            display:flex;
            align-items:center;
            gap:12px;
            padding:18px 16px 16px;
            border-bottom:1px solid var(--ma-border);
          }
          .brand-icon {
            width:38px;
            height:38px;
            border-radius:12px;
            display:grid;
            place-items:center;
            background:linear-gradient(135deg, var(--ma-accent), color-mix(in srgb, var(--ma-accent) 74%, white 26%));
            color:#111;
            font-weight:700;
            flex-shrink:0;
            box-shadow:0 10px 24px rgba(224,161,27,0.22);
            cursor:pointer;
            transition:transform 180ms ease, box-shadow 180ms ease, opacity 180ms ease;
          }
          .brand-icon:hover {
            transform:translateY(-1px) scale(1.02);
            box-shadow:0 14px 30px rgba(224,161,27,0.28);
          }
          .brand-icon.playing {
            animation:brandPulseFade 2.8s ease-in-out infinite;
          }
          @keyframes brandPulseFade {
            0% { opacity:1; transform:scale(1); }
            50% { opacity:.72; transform:scale(1.045); }
            100% { opacity:1; transform:scale(1); }
          }
          .brand-title { font-size:15px; font-weight:700; }
          .brand-sub { font-size:11px; color:var(--ma-text-3); }
          .nav { flex:1; overflow-y:auto; padding:12px 10px; }
          .nav-label { font-size:10px; text-transform:uppercase; letter-spacing:.12em; color:var(--ma-text-3); padding:10px 10px 6px; }
          .nav-btn {
            width:100%;
            display:flex;
            align-items:center;
            gap:10px;
            border:1px solid transparent;
            background:transparent;
            color:var(--ma-text-2);
            padding:10px 12px;
            border-radius:13px;
            cursor:pointer;
            margin-bottom:4px;
            text-align:start;
            font:inherit;
            transition:180ms ease;
          }
          .nav-btn:hover { background:var(--ma-soft); color:var(--ma-text-1); }
          .nav-btn.active {
            color:var(--ma-accent);
            background:color-mix(in srgb, var(--ma-accent) 14%, transparent);
            border-color:color-mix(in srgb, var(--ma-accent) 28%, transparent);
          }
          .nav-ico { width:18px; text-align:center; flex-shrink:0; }
          .player-panel {
            padding:16px 14px 14px;
            border-top:1px solid var(--ma-border);
            background:color-mix(in srgb, var(--ma-sidebar) 88%, black 12%);
            display:flex;
            flex-direction:column;
            gap:14px;
          }
          .np-row {
            display:flex;
            flex-direction:column;
            align-items:center;
            gap:12px;
            margin-bottom:0;
            min-width:0;
            cursor:pointer;
            text-align:center;
          }
          .np-art,.track-art,.queue-thumb,.queue-art,.mini-queue-thumb { background:var(--ma-soft); display:grid; place-items:center; overflow:hidden; }
          .np-art {
            width:104px;
            height:104px;
            border-radius:28px;
            flex-shrink:0;
            border:1px solid color-mix(in srgb, var(--ma-border) 96%, transparent);
            box-shadow:0 16px 30px rgba(0,0,0,0.14);
          }
          .np-art img,.track-art img,.queue-thumb img,.queue-art img,.mini-queue-thumb img,.media-art img,.now-art img {
            width:100%;
            height:100%;
            object-fit:cover;
            display:block;
          }
          .np-art img,.media-art img,.now-art img {
            object-fit:contain;
            object-position:center;
          }
          .np-meta {
            width:100%;
            min-width:0;
          }
          .np-title,.media-title,.track-name,.queue-name,.mini-queue-name { white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
          .np-title {
            font-size:15px;
            font-weight:800;
            line-height:1.15;
          }
          .np-sub,.media-sub,.track-sub,.queue-artist,.mini-queue-artist { font-size:11px; color:var(--ma-text-3); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
          .controls,.now-controls-main { display:flex; align-items:center; justify-content:center; gap:8px; }
          .card.rtl .controls,.card.rtl .now-controls-main { direction:ltr; }
          .card.rtl .volume-row,.card.rtl .now-volume { direction:ltr; }
          .controls {
            margin-bottom:0;
            gap:14px;
          }
          .icon-btn,.play-btn,.lang-btn,.close-btn,.big-round-btn,.big-main-btn,.theme-btn {
            border:none;
            cursor:pointer;
            font:inherit;
            transition:180ms ease;
            display:grid;
            place-items:center;
          }
          .ui-ic {
            width:60%;
            height:60%;
            display:block;
            flex-shrink:0;
            pointer-events:none;
            overflow:visible;
            shape-rendering:geometricPrecision;
          }
          .ui-ic * {
            vector-effect:non-scaling-stroke;
          }
          ha-icon.ui-ic {
            --mdc-icon-size:100%;
            width:60%;
            height:60%;
            display:inline-flex;
            align-items:center;
            justify-content:center;
          }
          .play-btn .ui-ic,
          .big-main-btn .ui-ic {
            width:58%;
            height:58%;
          }
          .immersive-btn.small .ui-ic {
            width:48%;
            height:48%;
          }
          .immersive-btn.primary .ui-ic {
            width:54%;
            height:54%;
          }
          .icon-btn,.lang-btn,.close-btn,.theme-btn {
            width:42px;
            height:42px;
            border-radius:14px;
            background:color-mix(in srgb, var(--ma-soft) 92%, transparent);
            color:var(--ma-text-2);
            border:1px solid color-mix(in srgb, var(--ma-border) 96%, transparent);
            box-shadow:0 6px 16px rgba(0,0,0,0.06);
          }
          .theme-light .icon-btn,
          .theme-light .lang-btn,
          .theme-light .close-btn,
          .theme-light .theme-btn {
            background:rgba(255,255,255,0.44);
          }
          .icon-btn:hover,.lang-btn:hover,.close-btn:hover,.theme-btn:hover { background:var(--ma-soft); color:var(--ma-text-1); }
          .icon-btn.active,.big-round-btn.active,.theme-btn.active {
            color:var(--ma-accent);
            background:color-mix(in srgb, var(--ma-accent) 14%, transparent);
            border-color:color-mix(in srgb, var(--ma-accent) 28%, transparent);
          }
          .play-btn,.big-main-btn {
            width:94px;
            height:94px;
            border-radius:28px;
            font-size:32px;
            box-shadow:0 18px 34px rgba(224,161,27,0.24);
          }
          .play-btn {
            width:64px;
            height:64px;
            border-radius:22px;
            box-shadow:0 14px 30px rgba(224,161,27,0.24);
            font-size:22px;
          }
          .progress,.now-progress { position:relative; height:8px; border-radius:999px; background:var(--ma-soft-2); overflow:hidden; cursor:pointer; touch-action:none; }
          .progress::before,.now-progress::before,.immersive-progress::before {
            content:"";
            position:absolute;
            inset:-12px 0;
          }
          .progress { display:none; }
          .progress-fill,.now-progress-fill {
            height:100%;
            width:0%;
            background:linear-gradient(90deg, var(--ma-accent), color-mix(in srgb, var(--ma-accent) 72%, white 28%));
          }
          .player-label { display:none; }
          .player-select { display:none; }
          .volume-row,.now-volume { display:flex; align-items:center; gap:12px; }
          .volume-range,.now-volume input {
            width:100%;
            appearance:none;
            height:8px;
            border-radius:999px;
            outline:none;
            background:linear-gradient(to right, var(--ma-accent) 0%, var(--ma-accent) var(--vol-pct, 50%), var(--ma-soft-2) var(--vol-pct, 50%), var(--ma-soft-2) 100%);
          }
          .volume-range::-webkit-slider-thumb,.now-volume input::-webkit-slider-thumb {
            appearance:none;
            width:18px;
            height:18px;
            border-radius:50%;
            background:var(--ma-accent);
            border:none;
          }
          .volume-range::-moz-range-thumb,.now-volume input::-moz-range-thumb {
            width:18px;
            height:18px;
            border-radius:50%;
            background:var(--ma-accent);
            border:none;
          }
          .main {
            min-width:0;
            min-height:0;
            display:flex;
            flex-direction:column;
            overflow:hidden;
            position:relative;
            backdrop-filter:blur(14px);
            -webkit-backdrop-filter:blur(14px);
            box-shadow:0 18px 44px rgba(0,0,0,0.24);
          }
          .topbar {
            display:flex;
            flex-direction:column;
            gap:10px;
            padding:14px 18px 14px;
            border-bottom:1px solid var(--ma-border);
            background:linear-gradient(180deg, color-mix(in srgb, var(--ma-topbar) 94%, transparent), color-mix(in srgb, var(--ma-topbar) 80%, transparent));
            backdrop-filter:blur(16px);
            -webkit-backdrop-filter:blur(16px);
            overflow-x:auto;
            overflow-y:hidden;
          }
          .topbar-row,.player-summary-row {
            display:flex;
            align-items:center;
            gap:10px;
            flex-wrap:nowrap !important;
            width:max-content;
            min-width:100%;
          }
          .player-summary-row {
            display:none;
          }
          .search {
            flex:1 1 320px;
            min-width:180px;
            display:flex;
            align-items:center;
            gap:10px;
            min-height:48px;
            padding:0 16px;
            border-radius:18px;
            background:color-mix(in srgb, var(--ma-soft) 92%, transparent);
            border:1px solid color-mix(in srgb, var(--ma-border) 96%, transparent);
            box-shadow:inset 0 1px 0 rgba(255,255,255,0.04);
          }
          .theme-light .search {
            background:rgba(255,255,255,0.92);
            box-shadow:inset 0 1px 0 rgba(255,255,255,0.75);
          }
          .search input {
            flex:1;
            min-width:0;
            border:none;
            background:transparent;
            color:var(--ma-text-1);
            outline:none;
            font:inherit;
          }
          .search input::placeholder { color:var(--ma-text-3); }
          .topbar-actions,.summary-actions {
            display:flex;
            gap:10px;
            align-items:center;
            flex-wrap:nowrap;
            flex:0 0 auto;
            margin-inline-start:auto;
          }
          .status-pill {
            display:inline-flex;
            align-items:center;
            gap:10px;
            min-height:46px;
            padding:0 16px;
            border-radius:999px;
            border:1px solid color-mix(in srgb, var(--ma-border) 96%, transparent);
            background:color-mix(in srgb, var(--ma-soft) 90%, transparent);
            color:var(--ma-text-2);
            font-size:13px;
            font-weight:600;
            white-space:nowrap;
            box-shadow:0 6px 16px rgba(0,0,0,0.06);
          }
          .theme-light .status-pill {
            background:rgba(255,255,255,0.9);
          }
          .status-dot { width:8px; height:8px; border-radius:50%; background:#46c16f; box-shadow:0 0 10px rgba(70,193,111,0.4); }
          .status-pill.offline .status-dot { background:#d66; box-shadow:0 0 10px rgba(214,102,102,0.35); }
          .selected-player-box {
            display:flex;
            align-items:center;
            gap:12px;
            min-width:220px;
            max-width:340px;
            flex:0 0 clamp(220px, 24cqi, 340px);
            min-height:48px;
            padding:0 16px;
            border-radius:18px;
            border:1px solid color-mix(in srgb, var(--ma-border) 96%, transparent);
            background:color-mix(in srgb, var(--ma-soft) 94%, transparent);
            box-shadow:0 8px 20px rgba(0,0,0,0.06);
          }
          .theme-light .selected-player-box {
            background:rgba(255,255,255,0.92);
          }
          .selected-player-meta { min-width:0; flex:1; }
          .selected-player-title {
            font-size:12px;
            font-weight:800;
            color:var(--ma-text-1);
            letter-spacing:-0.01em;
            white-space:nowrap;
            overflow:hidden;
            text-overflow:ellipsis;
          }
          .selected-player-sub {
            font-size:11px;
            color:var(--ma-text-3);
            white-space:nowrap;
            overflow:hidden;
            text-overflow:ellipsis;
            margin-top:1px;
          }
          .chip-dot {
            width:10px;
            height:10px;
            border-radius:50%;
            background:rgba(255,255,255,0.32);
            flex-shrink:0;
            box-shadow:0 0 0 5px rgba(255,255,255,0.04);
          }
          .theme-light .chip-dot { background:rgba(20,24,32,0.22); }
          .content { flex:1; min-height:0; overflow-y:auto; padding:16px; }
          .content.now-playing-mode { overflow:hidden; }
          .brand {
            padding:calc(16px * var(--ma-ui-scale));
            gap:calc(12px * var(--ma-ui-scale));
          }
          .brand-icon {
            width:calc(38px * var(--ma-ui-scale));
            height:calc(38px * var(--ma-ui-scale));
            border-radius:calc(12px * var(--ma-ui-scale));
          }
          .brand-title { font-size:calc(15px * var(--ma-ui-scale)); }
          .brand-sub { font-size:calc(11px * var(--ma-ui-scale)); }
          .player-panel { padding:var(--ma-shell-pad); gap:calc(14px * var(--ma-ui-scale)); }
          .np-art {
            width:var(--ma-np-art-size);
            height:var(--ma-np-art-size);
            border-radius:calc(26px * var(--ma-ui-scale));
            cursor:pointer;
            transition:transform 180ms ease, box-shadow 180ms ease;
          }
          .np-art:hover {
            transform:translateY(-1px) scale(1.015);
            box-shadow:0 18px 34px rgba(0,0,0,0.16);
          }
          .np-title { font-size:calc(15px * var(--ma-ui-scale)); }
          .topbar { padding:calc(14px * var(--ma-ui-scale)); }
          .topbar-row,.player-summary-row,.topbar-actions,.summary-actions { gap:calc(10px * var(--ma-ui-scale)); }
          .search {
            min-height:calc(46px * var(--ma-ui-scale));
            padding:0 calc(14px * var(--ma-ui-scale));
            border-radius:calc(18px * var(--ma-ui-scale));
          }
          .content { padding:var(--ma-shell-pad); }
          .chip-btn {
            min-height:var(--ma-chip-height);
            padding:0 calc(14px * var(--ma-ui-scale));
            border-radius:calc(16px * var(--ma-ui-scale));
          }
          .icon-btn,.lang-btn,.close-btn,.theme-btn {
            width:var(--ma-control-size);
            height:var(--ma-control-size);
            border-radius:calc(14px * var(--ma-ui-scale));
          }
          .selected-player-box,.status-pill {
            min-height:calc(46px * var(--ma-ui-scale));
            padding:0 calc(15px * var(--ma-ui-scale));
            border-radius:calc(18px * var(--ma-ui-scale));
          }
          .section { margin-bottom:calc(24px * var(--ma-ui-scale)); }
          .section { margin-bottom:28px; }
          .section-header { display:flex; align-items:center; gap:10px; flex-wrap:wrap; margin-bottom:12px; }
          .section-title { font-size:15px; font-weight:700; }
          .section-badge,.now-queue-count {
            padding:3px 9px;
            border-radius:999px;
            background:var(--ma-soft);
            border:1px solid var(--ma-border);
            color:var(--ma-text-3);
            font-size:11px;
          }
          .section-actions { margin-inline-start:auto; display:flex; gap:6px; flex-wrap:wrap; }
          .chip-btn {
            border:1px solid color-mix(in srgb, var(--ma-border) 96%, transparent);
            background:color-mix(in srgb, var(--ma-soft) 92%, transparent);
            color:var(--ma-text-2);
            border-radius:16px;
            min-height:44px;
            padding:0 14px;
            font:inherit;
            font-size:12px;
            font-weight:700;
            cursor:pointer;
            display:inline-flex;
            align-items:center;
            justify-content:center;
            gap:8px;
            backdrop-filter:blur(10px);
            -webkit-backdrop-filter:blur(10px);
            transition:180ms ease;
            box-shadow:0 6px 16px rgba(0,0,0,0.06);
          }
          .theme-light .chip-btn {
            background:rgba(255,255,255,0.92);
          }
          .chip-btn:hover {
            color:var(--ma-accent);
            background:color-mix(in srgb, var(--ma-accent) 14%, transparent);
            border-color:color-mix(in srgb, var(--ma-accent) 28%, transparent);
          }
          .chip-btn.warn { color:#ffcf7a; border-color:rgba(255,207,122,0.18); }
          .chip-btn.active {
            color:var(--ma-accent);
            border-color:color-mix(in srgb, var(--ma-accent) 30%, transparent);
            background:color-mix(in srgb, var(--ma-accent) 12%, transparent);
          }
          .grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(126px, 1fr)); gap:14px; }
          .media-card { cursor:pointer; min-width:0; transition:transform 180ms ease; }
          .media-card:hover { transform:translateY(-3px); }
          .media-card.playing .media-art {
            border-color:color-mix(in srgb, var(--ma-accent) 28%, transparent);
            box-shadow:0 0 0 1px color-mix(in srgb, var(--ma-accent) 40%, transparent);
          }
          .media-art {
            position:relative;
            aspect-ratio:1/1;
            border-radius:18px;
            border:1px solid var(--ma-border);
            margin-bottom:8px;
            background:var(--ma-soft);
            overflow:hidden;
          }
          .media-placeholder {
            position:absolute;
            inset:0;
            display:grid;
            place-items:center;
            font-size:28px;
            color:var(--ma-text-3);
          }
          .homeii-art-fallback {
            width:100%;
            height:100%;
            display:grid;
            place-items:center;
            border-radius:inherit;
            background:
              radial-gradient(circle at 50% 36%, color-mix(in srgb, var(--ma-accent) 28%, transparent), transparent 52%),
              linear-gradient(145deg, rgba(255,255,255,.09), rgba(255,255,255,.025));
            color:rgba(255,255,255,.78);
            box-shadow:inset 0 0 0 1px rgba(255,255,255,.08);
          }
          .homeii-art-fallback-disc {
            width:46%;
            height:46%;
            min-width:34px;
            min-height:34px;
            display:grid;
            place-items:center;
            border-radius:50%;
            background:rgba(0,0,0,.2);
            border:1px solid rgba(255,255,255,.12);
            box-shadow:0 12px 28px rgba(0,0,0,.18);
          }
          .homeii-art-fallback svg {
            width:48%;
            height:48%;
            color:currentColor;
            opacity:.92;
          }
          .theme-light .homeii-art-fallback {
            color:rgba(48,55,68,.7);
            background:
              radial-gradient(circle at 50% 36%, color-mix(in srgb, var(--ma-accent) 18%, transparent), transparent 54%),
              linear-gradient(145deg, rgba(255,255,255,.86), rgba(238,242,247,.56));
            box-shadow:inset 0 0 0 1px rgba(90,105,125,.12);
          }
          .theme-light .homeii-art-fallback-disc {
            background:rgba(255,255,255,.48);
            border-color:rgba(82,96,118,.12);
          }
          .media-overlay {
            position:absolute;
            inset:0;
            display:grid;
            place-items:center;
            background:linear-gradient(180deg, transparent, rgba(0,0,0,0.18), rgba(0,0,0,0.54));
            opacity:0;
            transition:opacity 180ms ease;
          }
          .theme-light .media-overlay { background:linear-gradient(180deg, transparent, rgba(255,255,255,0.04), rgba(0,0,0,0.16)); }
          .media-card:hover .media-overlay { opacity:1; }
          .play-bubble {
            width:42px;
            height:42px;
            border-radius:50%;
            display:grid;
            place-items:center;
            background:linear-gradient(135deg, var(--ma-accent), color-mix(in srgb, var(--ma-accent) 72%, white 28%));
            color:#111;
          }
          .playing-badge {
            position:absolute;
            bottom:6px;
            left:6px;
            padding:3px 6px;
            border-radius:8px;
            font-size:10px;
            font-weight:700;
            color:#111;
            background:linear-gradient(135deg, var(--ma-accent), color-mix(in srgb, var(--ma-accent) 72%, white 28%));
            display:none;
          }
          .media-card.playing .playing-badge { display:inline-flex; }
          .media-title { font-size:12.5px; font-weight:600; }
          .track-list { display:flex; flex-direction:column; gap:6px; }
          .track-row {
            display:flex;
            align-items:center;
            gap:12px;
            min-width:0;
            padding:10px 12px;
            border-radius:14px;
            background:transparent;
            border:1px solid transparent;
            cursor:pointer;
          }
          .track-row:hover { background:var(--ma-soft); }
          .track-row.playing {
            background:color-mix(in srgb, var(--ma-accent) 14%, transparent);
            border-color:color-mix(in srgb, var(--ma-accent) 28%, transparent);
          }
          .track-num { width:24px; text-align:center; color:var(--ma-text-3); font-size:11px; flex-shrink:0; }
          .track-row.playing .track-num { color:var(--ma-accent); }
          .track-art { width:42px; height:42px; border-radius:12px; flex-shrink:0; }
          .track-meta { flex:1; min-width:0; }
          .track-name { font-size:12.5px; font-weight:600; }
          .track-row.playing .track-name { color:var(--ma-accent); }
          .track-dur { font-size:11px; color:var(--ma-text-3); flex-shrink:0; }
          .state-box {
            min-height:240px;
            display:grid;
            place-items:center;
            text-align:center;
            padding:24px;
            color:var(--ma-text-3);
          }
          .spinner {
            width:24px;
            height:24px;
            border:2px solid color-mix(in srgb, var(--ma-text-3) 25%, transparent);
            border-top-color:var(--ma-accent);
            border-radius:50%;
            animation:spin .8s linear infinite;
            margin:0 auto 10px;
          }
          @keyframes spin { to { transform:rotate(360deg); } }
          .homeii-loading-state {
            min-height:240px;
            display:grid;
            place-items:center;
            text-align:center;
            padding:24px;
            color:var(--ma-text-2);
          }
          .homeii-loading-content {
            display:grid;
            justify-items:center;
            gap:12px;
          }
          .homeii-loading-mark {
            position:relative;
            width:70px;
            height:70px;
            display:grid;
            place-items:center;
          }
          .homeii-loading-ring {
            position:absolute;
            inset:8px;
            border-radius:999px;
            border:2px solid color-mix(in srgb, var(--ma-text-3) 16%, transparent);
            border-top-color:color-mix(in srgb, var(--ma-accent) 88%, #fff 8%);
            animation:homeiiLoadingSpin 1.4s linear infinite;
          }
          .homeii-loading-ring.secondary {
            inset:17px;
            opacity:.58;
            animation-duration:2.1s;
            animation-direction:reverse;
          }
          .homeii-loading-core {
            width:15px;
            height:15px;
            border-radius:999px;
            background:var(--ma-accent);
            box-shadow:0 0 24px color-mix(in srgb, var(--ma-accent) 56%, transparent);
            animation:homeiiLoadingPulse 1.2s ease-in-out infinite;
          }
          .homeii-loading-text {
            color:var(--ma-text-2);
            font-size:13px;
            font-weight:850;
          }
          @keyframes homeiiLoadingSpin { to { transform:rotate(360deg); } }
          @keyframes homeiiLoadingPulse {
            0%,100% { transform:scale(.86); opacity:.62; }
            50% { transform:scale(1.08); opacity:1; }
          }
          @media (prefers-reduced-motion: reduce) {
            .homeii-loading-ring,
            .homeii-loading-core {
              animation:none;
            }
          }
          .queue-panel {
            position:absolute;
            inset:0;
            z-index:210;
            display:flex;
            flex-direction:column;
            background:rgba(8,12,18,0.42);
            backdrop-filter:blur(18px);
            -webkit-backdrop-filter:blur(18px);
          }
          .theme-light .queue-panel {
            background:rgba(236,241,247,0.58);
            backdrop-filter:blur(20px);
            -webkit-backdrop-filter:blur(20px);
          }
          .queue-shell {
            width:min(1100px, calc(100% - 20px));
            height:min(calc(100% - 20px), var(--ma-effective-height));
            margin:auto;
            display:flex;
            flex-direction:column;
            border-radius:26px;
            border:1px solid var(--ma-modal-border);
            background:
              linear-gradient(180deg, color-mix(in srgb, var(--ma-accent) 6%, transparent), transparent 20%),
              linear-gradient(180deg, color-mix(in srgb, var(--ma-modal-bg) 96%, transparent), color-mix(in srgb, var(--ma-modal-bg) 90%, black 10%));
            box-shadow:0 24px 60px rgba(0,0,0,0.22);
            overflow:hidden;
          }
          .theme-light .queue-shell {
            background:linear-gradient(180deg, rgba(255,255,255,0.94), rgba(247,250,255,0.92));
            box-shadow:0 22px 50px rgba(31,41,55,0.14);
          }
          .queue-header {
            display:flex;
            align-items:center;
            gap:14px;
            padding:18px 20px;
            border-bottom:1px solid var(--ma-border);
            background:color-mix(in srgb, var(--ma-modal-soft) 92%, transparent);
            backdrop-filter:blur(12px);
            -webkit-backdrop-filter:blur(12px);
          }
          .queue-art {
            width:58px;
            height:58px;
            border-radius:16px;
            flex-shrink:0;
            border:1px solid var(--ma-border);
            overflow:hidden;
            box-shadow:0 8px 18px rgba(0,0,0,0.12);
          }
          .queue-meta { min-width:0; flex:1; }
          .queue-title {
            font-size:18px;
            font-weight:800;
            white-space:nowrap;
            overflow:hidden;
            text-overflow:ellipsis;
          }
          .queue-sub {
            margin-top:3px;
            font-size:12px;
            color:var(--ma-text-3);
            white-space:nowrap;
            overflow:hidden;
            text-overflow:ellipsis;
          }
          .queue-scroll {
            flex:1;
            overflow-y:auto;
            padding:16px;
            background:linear-gradient(180deg, rgba(255,255,255,0.02), transparent 18%);
          }
          .queue-item {
            display:flex;
            align-items:center;
            gap:12px;
            padding:12px 14px;
            border-radius:16px;
            cursor:pointer;
            border:1px solid transparent;
            background:transparent;
            transition:180ms ease;
            margin-bottom:8px;
          }
          .queue-item:hover {
            background:color-mix(in srgb, var(--ma-soft) 82%, transparent);
            border-color:color-mix(in srgb, var(--ma-border) 78%, transparent);
          }
          .queue-item.active {
            background:linear-gradient(90deg, color-mix(in srgb, var(--ma-accent) 16%, transparent), transparent 72%), color-mix(in srgb, var(--ma-soft) 88%, transparent);
            border-color:color-mix(in srgb, var(--ma-accent) 26%, transparent);
            box-shadow:0 8px 20px rgba(0,0,0,0.08);
          }
          .queue-item.past { opacity:.44; }
          .queue-num {
            width:28px;
            text-align:center;
            font-size:12px;
            font-weight:700;
            color:var(--ma-text-3);
            flex-shrink:0;
          }
          .queue-item.active .queue-num,.queue-item.active .queue-name { color:var(--ma-accent); }
          .queue-thumb {
            width:46px;
            height:46px;
            border-radius:13px;
            flex-shrink:0;
            border:1px solid var(--ma-border);
            overflow:hidden;
          }
          .queue-item-meta { flex:1; min-width:0; }
          .queue-name { font-size:13px; font-weight:700; }
          .queue-artist { font-size:11.5px; color:var(--ma-text-3); margin-top:2px; }
          .queue-dur { font-size:11px; color:var(--ma-text-3); flex-shrink:0; }
          .queue-actions,.mini-queue-actions {
            display:flex;
            gap:10px;
            align-items:center;
            flex-wrap:wrap;
            direction:ltr;
          }
          .mini-queue-actions .chip-btn,.queue-actions .chip-btn {
            padding:10px 14px;
            min-width:46px;
            min-height:42px;
            font-size:14px;
            font-weight:800;
            border-radius:12px;
            background:color-mix(in srgb, var(--ma-panel) 82%, transparent);
            box-shadow:0 6px 18px rgba(0,0,0,0.12);
          }
          .mini-queue-actions .chip-btn:disabled,.queue-actions .chip-btn:disabled {
            opacity:.52;
            cursor:progress;
          }
          .queue-item-meta {
            flex:1;
            min-width:0;
          }
          .queue-actions {
            margin-inline-start:auto;
          }
          .theme-light .queue-item,
          .theme-light .queue-header {
            box-shadow:none;
          }
          .immersive-backdrop {
            position:absolute;
            inset:0;
            z-index:120;
            display:none;
            overflow:hidden;
            border-radius:inherit;
            background:rgba(8,12,18,0.38);
          }
          .immersive-backdrop.open { display:block; }
          .immersive-shell {
            position:relative;
            width:100%;
            height:100%;
            overflow:hidden;
            display:grid;
            grid-template-rows:auto minmax(0,1fr) auto;
            gap:clamp(14px, 2.2vw, 24px);
            padding:clamp(16px, 2.2vw, 28px);
            color:#f7f8fc;
            direction:ltr;
          }
          .immersive-shell.rtl { direction:rtl; }
          .immersive-bg,
          .immersive-cover-glow,
          .immersive-frost,
          .immersive-vignette {
            position:absolute;
            inset:0;
            pointer-events:none;
          }
          .immersive-bg,
          .immersive-cover-glow {
            background-position:center;
            background-size:cover;
            transform:scale(1.12);
            filter:blur(34px) saturate(1.08);
            opacity:0.9;
          }
          .immersive-cover-glow::after {
            content:"";
            position:absolute;
            inset:0;
            background:
              radial-gradient(circle at center, transparent 18%, rgba(8,12,18,0.34) 62%, rgba(8,12,18,0.72) 100%),
              linear-gradient(180deg, rgba(8,12,18,0.22), rgba(8,12,18,0.52));
          }
          .immersive-frost {
            background:
              radial-gradient(circle at top, rgba(224,161,27,0.14), transparent 34%),
              linear-gradient(180deg, rgba(16,18,26,0.26), rgba(12,14,20,0.58));
            backdrop-filter:blur(18px);
            -webkit-backdrop-filter:blur(18px);
          }
          .immersive-vignette {
            background:
              radial-gradient(circle at center, transparent 18%, rgba(8,12,18,0.34) 62%, rgba(8,12,18,0.72) 100%),
              linear-gradient(180deg, rgba(8,12,18,0.22), rgba(8,12,18,0.52));
          }
          .immersive-topbar,
          .immersive-stage,
          .immersive-footer,
          .immersive-header,
          .immersive-body,
          .immersive-panel {
            position:relative;
            z-index:1;
          }
          .immersive-topbar {
            display:flex;
            align-items:flex-start;
            justify-content:space-between;
            gap:16px;
          }
          .immersive-shell.rtl .immersive-topbar {
            flex-direction:row-reverse;
          }
          .immersive-header {
            display:flex;
            align-items:flex-start;
            justify-content:space-between;
            gap:16px;
          }
          .immersive-shell.rtl .immersive-header {
            flex-direction:row-reverse;
          }
          .immersive-backdrop .close-btn {
            width:58px;
            height:58px;
            border-radius:999px;
            background:rgba(255,255,255,0.18);
            color:#121212;
            border-color:rgba(255,255,255,0.22);
            box-shadow:0 12px 24px rgba(0,0,0,0.18);
            backdrop-filter:blur(10px);
            -webkit-backdrop-filter:blur(10px);
            flex:0 0 auto;
          }
          .immersive-meta {
            display:grid;
            gap:8px;
            min-width:0;
            text-align:start;
            max-width:min(44vw, 520px);
          }
          .immersive-shell.rtl .immersive-meta { text-align:right; }
          .immersive-kicker {
            font-size:12px;
            letter-spacing:.16em;
            text-transform:uppercase;
            color:rgba(255,255,255,0.72);
          }
          .immersive-title {
            font-size:clamp(24px, 3.4vw, 40px);
            line-height:1.04;
            font-weight:900;
            letter-spacing:-0.03em;
            text-shadow:0 10px 24px rgba(0,0,0,0.28);
            word-break:break-word;
          }
          .immersive-subtitle {
            font-size:clamp(14px, 1.35vw, 18px);
            color:rgba(255,255,255,0.84);
            text-shadow:0 8px 22px rgba(0,0,0,0.24);
            word-break:break-word;
          }
          .immersive-player-pill {
            display:inline-flex;
            align-items:center;
            gap:8px;
            width:fit-content;
            max-width:100%;
            min-height:38px;
            padding:0 14px;
            border-radius:999px;
            background:rgba(18,20,28,0.34);
            border:1px solid rgba(255,255,255,0.14);
            color:rgba(255,255,255,0.88);
            font-size:12px;
            font-weight:700;
            backdrop-filter:blur(12px);
            -webkit-backdrop-filter:blur(12px);
            white-space:nowrap;
            overflow:hidden;
            text-overflow:ellipsis;
          }
          .immersive-stage,
          .immersive-body {
            min-height:0;
            display:grid;
            place-items:center;
            align-content:center;
            gap:clamp(20px, 3vw, 36px);
          }
          .immersive-art-wrap {
            width:min(100%, 620px);
            display:grid;
            place-items:center;
          }
          .immersive-art {
            width:min(100%, min(54vh, 620px));
            max-width:min(86vw, 620px);
            max-height:min(54vh, 620px);
            aspect-ratio:1/1;
            border-radius:32px;
            overflow:hidden;
            border:1px solid rgba(255,255,255,0.18);
            background:rgba(255,255,255,0.08);
            box-shadow:0 28px 80px rgba(0,0,0,0.34);
            display:grid;
            place-items:center;
            font-size:72px;
            color:rgba(255,255,255,0.5);
          }
          .immersive-art img {
            width:100%;
            height:100%;
            object-fit:contain;
            object-position:center;
            display:block;
          }
          .immersive-body {
            grid-template-rows:minmax(0,1fr) auto;
            gap:clamp(28px, 3.6vw, 44px);
          }
          .immersive-body > .immersive-art-wrap {
            align-self:center;
          }
          .immersive-track-pill {
            display:inline-flex;
            align-items:center;
            justify-content:center;
            gap:10px;
            max-width:min(92%, 720px);
            padding:12px 18px;
            border-radius:18px;
            background:rgba(18,20,28,0.36);
            border:1px solid rgba(255,255,255,0.14);
            backdrop-filter:blur(14px);
            -webkit-backdrop-filter:blur(14px);
            box-shadow:0 12px 28px rgba(0,0,0,0.18);
            text-align:center;
          }
          .immersive-track-pill .immersive-title,
          .immersive-track-pill .immersive-subtitle {
            font-size:inherit;
            line-height:1.2;
            text-shadow:none;
          }
          .immersive-track-pill-text {
            display:grid;
            gap:4px;
            min-width:0;
          }
          .immersive-track-pill-title {
            font-size:clamp(16px, 1.5vw, 22px);
            font-weight:800;
            white-space:nowrap;
            overflow:hidden;
            text-overflow:ellipsis;
          }
          .immersive-track-pill-sub {
            font-size:clamp(12px, 1vw, 15px);
            color:rgba(255,255,255,0.78);
            white-space:nowrap;
            overflow:hidden;
            text-overflow:ellipsis;
          }
          .immersive-footer,
          .immersive-panel {
            display:grid;
            gap:clamp(12px, 1.8vw, 18px);
            align-self:end;
          }
          .immersive-panel {
            width:min(100%, 1180px);
            margin:0 auto;
            padding-top:clamp(10px, 2vh, 24px);
            background:transparent;
            border:none;
            box-shadow:none;
            grid-template-columns:minmax(210px, 320px) minmax(0, 1fr);
            align-items:end;
          }
          .immersive-panel > .immersive-time-row,
          .immersive-panel > .immersive-progress,
          .immersive-panel > .immersive-controls {
            grid-column:1 / -1;
          }
          .immersive-time-row {
            display:flex;
            align-items:center;
            justify-content:space-between;
            gap:12px;
            color:rgba(255,255,255,0.82);
            font-size:14px;
            padding:0 6px;
            direction:ltr;
          }
          .immersive-progress {
            position:relative;
            width:min(100%, 1180px);
            margin:0 auto;
            height:14px;
            border-radius:999px;
            background:rgba(255,255,255,0.16);
            overflow:hidden;
            cursor:pointer;
            touch-action:none;
            box-shadow:inset 0 1px 0 rgba(255,255,255,0.1);
          }
          .immersive-progress-fill {
            height:100%;
            width:0%;
            border-radius:inherit;
            background:linear-gradient(90deg, var(--ma-accent), color-mix(in srgb, var(--ma-accent) 76%, white 24%));
          }
          .immersive-controls {
            display:flex;
            align-items:center;
            justify-content:center;
            gap:clamp(12px, 1.8vw, 20px);
            flex-wrap:nowrap;
            direction:ltr;
          }
          .immersive-btn {
            width:86px;
            height:86px;
            border-radius:999px;
            border:1px solid rgba(255,255,255,0.15);
            background:rgba(255,255,255,0.12);
            color:#fff;
            display:grid;
            place-items:center;
            font-size:32px;
            box-shadow:0 16px 32px rgba(0,0,0,0.22);
            backdrop-filter:blur(12px);
            -webkit-backdrop-filter:blur(12px);
            display:grid;
            place-items:center;
          }
          .immersive-btn.primary {
            width:126px;
            height:126px;
            font-size:48px;
            background:rgba(255,255,255,0.18);
          }
          .immersive-btn.small {
            width:72px;
            height:72px;
            font-size:26px;
            background:rgba(255,255,255,0.1);
          }
          .immersive-btn.active {
            border-color:rgba(255,220,140,0.74);
            box-shadow:0 0 0 2px rgba(255,220,140,0.24), 0 16px 32px rgba(0,0,0,0.22);
          }
          .immersive-bottom-row {
            width:min(100%, 1180px);
            margin:0 auto;
            display:grid;
            grid-template-columns:minmax(0, 1fr) minmax(220px, 360px);
            gap:18px;
            align-items:center;
          }
          .immersive-actions {
            display:flex;
            align-items:center;
            justify-content:flex-end;
            gap:10px;
            flex-wrap:wrap;
          }
          .immersive-actions .chip-btn {
            background:rgba(18,20,28,0.34);
            color:#fff;
            border-color:rgba(255,255,255,0.16);
            backdrop-filter:blur(10px);
            -webkit-backdrop-filter:blur(10px);
            min-height:40px;
            padding:0 12px;
          }
          .immersive-player-picker-btn,
          .now-player-picker-btn {
            width:calc(46px * var(--ma-ui-scale));
            min-width:calc(46px * var(--ma-ui-scale));
            min-height:calc(46px * var(--ma-ui-scale));
            padding:0;
            border-radius:calc(16px * var(--ma-ui-scale));
            flex:0 0 auto;
          }
          .immersive-player-picker-btn .ui-ic,
          .now-player-picker-btn .ui-ic {
            width:18px;
            height:18px;
          }
          .immersive-volume {
            display:grid;
            grid-template-columns:auto minmax(0,1fr);
            align-items:center;
            gap:12px;
            direction:ltr;
            max-width:300px;
            padding:6px 12px;
            border-radius:999px;
            background:rgba(18,20,28,0.34);
            border:1px solid rgba(255,255,255,0.14);
            backdrop-filter:blur(12px);
            -webkit-backdrop-filter:blur(12px);
          }
          .immersive-volume input {
            width:100%;
            appearance:none;
            height:8px;
            border-radius:999px;
            outline:none;
            background:linear-gradient(to right, var(--ma-accent) 0%, var(--ma-accent) var(--vol-pct, 50%), rgba(255,255,255,0.28) var(--vol-pct, 50%), rgba(255,255,255,0.28) 100%);
          }
          .immersive-volume input::-webkit-slider-thumb {
            appearance:none;
            width:18px;
            height:18px;
            border-radius:50%;
            background:var(--ma-accent);
            border:none;
          }
          .immersive-volume input::-moz-range-thumb {
            width:18px;
            height:18px;
            border-radius:50%;
            background:var(--ma-accent);
            border:none;
          }
          .immersive-panel .immersive-actions,
          .immersive-panel .immersive-volume {
            margin:0;
          }
          .immersive-panel > .immersive-volume {
            grid-column:1;
            width:100%;
            justify-self:stretch;
          }
          .immersive-panel .immersive-actions {
            grid-column:2;
            width:auto;
            justify-self:end;
          }
          @media (max-width:1024px) {
            .immersive-art {
              width:min(100%, min(50vh, 560px));
              max-width:min(86vw, 560px);
              max-height:min(50vh, 560px);
            }
            .immersive-btn {
              width:78px;
              height:78px;
              font-size:29px;
            }
            .immersive-btn.primary {
              width:112px;
              height:112px;
              font-size:42px;
            }
          }
          @media (max-width:760px) {
            .immersive-shell {
              padding:14px;
              grid-template-rows:auto minmax(0,1fr) auto;
            }
            .immersive-art {
              width:min(100%, min(42vh, 420px));
              max-width:min(88vw, 420px);
              max-height:min(42vh, 420px);
              border-radius:24px;
            }
            .immersive-body {
              gap:12px;
            }
            .immersive-topbar {
              gap:12px;
            }
            .immersive-header {
              gap:12px;
            }
            .immersive-bottom-row {
              grid-template-columns:1fr;
              gap:12px;
            }
            .immersive-panel {
              grid-template-columns:1fr;
            }
            .immersive-actions {
              order:2;
              justify-content:center;
            }
            .immersive-volume {
              order:1;
              max-width:none;
            }
            .immersive-panel .immersive-actions,
            .immersive-panel .immersive-volume {
              width:100%;
            }
            .immersive-panel > .immersive-volume,
            .immersive-panel .immersive-actions {
              grid-column:1;
              justify-self:stretch;
            }
            .immersive-btn {
              width:64px;
              height:64px;
              font-size:24px;
            }
            .immersive-btn.small {
              width:56px;
              height:56px;
              font-size:21px;
            }
            .immersive-btn.primary {
              width:86px;
              height:86px;
              font-size:34px;
            }
          }
          .ctx-menu {
            position:absolute;
            z-index:80;
            min-width:214px;
            max-width:min(268px, calc(100% - 24px));
            max-height:min(56vh, 360px);
            overflow:auto;
            padding:8px;
            border-radius:18px;
            border:1px solid var(--ma-border);
            background:var(--ma-panel);
            backdrop-filter:blur(14px);
            -webkit-backdrop-filter:blur(14px);
            box-shadow:0 18px 44px rgba(0,0,0,0.24);
            display:grid;
            gap:6px;
          }
          .ctx-item { display:flex; align-items:center; gap:10px; min-height:42px; padding:10px 12px; border-radius:14px; color:var(--ma-text-1); cursor:pointer; font-size:13px; font-weight:800; }
          .ctx-item:hover { background:var(--ma-soft); }
          .ctx-ico { width:18px; height:18px; text-align:center; color:var(--ma-text-2); flex-shrink:0; display:grid; place-items:center; }
          .ctx-ico .ui-ic { width:15px; height:15px; }
          .queue-ctx-menu {
            min-width:186px;
            max-width:min(220px, calc(100% - 24px));
            padding:6px;
            gap:4px;
            border-radius:16px;
          }
          .queue-ctx-menu .ctx-item {
            min-height:38px;
            padding:8px 10px;
            border-radius:12px;
            font-size:12px;
            font-weight:800;
          }
          .queue-ctx-menu .ctx-ico {
            width:16px;
            height:16px;
          }
          .queue-ctx-menu .ctx-ico .ui-ic {
            width:14px;
            height:14px;
          }
          .ctx-sep { height:1px; margin:6px 4px; background:rgba(255,255,255,.12); }
          .ctx-caption { padding:4px 8px 2px; font-size:11px; font-weight:800; letter-spacing:.08em; text-transform:uppercase; color:var(--ma-text-3); }
          .toast-wrap {
            position:absolute;
            inset-inline-end:16px;
            bottom:16px;
            z-index:60;
            display:flex;
            flex-direction:column;
            gap:8px;
            pointer-events:none;
          }
          .toast-wrap.center-toast {
            inset:0;
            bottom:auto;
            align-items:center;
            justify-content:center;
            padding:18px;
          }
          .toast {
            padding:10px 14px;
            border-radius:12px;
            border:1px solid var(--ma-border);
            background:var(--ma-panel);
            color:var(--ma-text-1);
            font-size:12px;
            backdrop-filter:blur(12px);
            -webkit-backdrop-filter:blur(12px);
          }
          .toast.centered {
            max-width:min(420px, calc(100% - 48px));
            padding:14px 18px;
            border-radius:18px;
            font-size:14px;
            font-weight:850;
            text-align:center;
            box-shadow:0 22px 54px rgba(0,0,0,.28), inset 0 1px 0 rgba(255,255,255,.12);
          }
          .modal-backdrop {
            position:absolute;
            inset:0;
            z-index:220;
            display:none;
            align-items:center;
            justify-content:center;
            background:rgba(10,14,22,${modalOverlayAlpha.toFixed(2)});
            backdrop-filter:blur(10px);
            -webkit-backdrop-filter:blur(10px);
            padding:20px;
          }
          .modal-backdrop.open { display:flex; }
          .modal {
            width:min(760px,100%);
            max-height:min(84vh,760px);
            overflow:auto;
            border-radius:26px;
            border:1px solid var(--ma-modal-border);
            background:
              linear-gradient(180deg, color-mix(in srgb, var(--ma-accent) 7%, transparent), transparent 22%),
              linear-gradient(180deg, color-mix(in srgb, var(--ma-modal-bg) 96%, transparent), color-mix(in srgb, var(--ma-modal-bg) 88%, black 12%));
            backdrop-filter:blur(22px);
            -webkit-backdrop-filter:blur(22px);
            box-shadow:0 28px 70px rgba(0,0,0,0.26);
            overflow-x:hidden;
            color:var(--ma-text-1);
          }
          .theme-light .modal {
            background:
              linear-gradient(180deg, rgba(255,255,255,0.92), rgba(247,250,255,0.88));
            box-shadow:0 24px 60px rgba(31,41,55,0.16);
          }
          .theme-light .modal-header,
          .theme-light .queue-header {
            background:rgba(255,255,255,0.9);
          }
          .theme-light .modal-title,
          .theme-light .modal-section-title,
          .theme-light .player-card-title,
          .theme-light .group-name,
          .theme-light .queue-title,
          .theme-light .media-title,
          .theme-light .track-name,
          .theme-light .selected-player-title,
          .theme-light .now-track-title {
            color:var(--ma-text-1);
          }
          .theme-light .modal-subtitle,
          .theme-light .player-card-sub,
          .theme-light .player-card-track,
          .theme-light .queue-sub,
          .theme-light .selected-player-sub,
          .theme-light .now-track-subtitle,
          .theme-light .track-sub,
          .theme-light .media-sub {
            color:var(--ma-text-2);
          }
          .modal-header {
            display:flex;
            align-items:center;
            gap:12px;
            padding:18px 20px;
            border-bottom:1px solid color-mix(in srgb, var(--ma-border) 96%, transparent);
            background:linear-gradient(180deg, color-mix(in srgb, var(--ma-modal-soft) 96%, transparent), transparent);
            position:sticky;
            top:0;
            z-index:2;
            backdrop-filter:blur(16px);
            -webkit-backdrop-filter:blur(16px);
          }
          .modal-header-icon {
            width:42px;
            height:42px;
            border-radius:14px;
            display:grid;
            place-items:center;
            background:color-mix(in srgb, var(--ma-accent) 16%, transparent);
            border:1px solid color-mix(in srgb, var(--ma-accent) 26%, transparent);
            color:var(--ma-accent);
            font-size:18px;
            flex-shrink:0;
          }
          .modal-header-meta { min-width:0; flex:1; }
          .modal-title { font-size:16px; font-weight:800; letter-spacing:-0.01em; }
          .modal-subtitle {
            margin-top:2px;
            font-size:11.5px;
            color:var(--ma-text-3);
            white-space:nowrap;
            overflow:hidden;
            text-overflow:ellipsis;
          }
          .modal-body { padding:18px 20px 20px; }
          .modal-section {
            border:1px solid color-mix(in srgb, var(--ma-modal-border) 92%, transparent);
            background:color-mix(in srgb, var(--ma-modal-soft) 72%, transparent);
            border-radius:20px;
            padding:14px;
            margin-bottom:14px;
            box-shadow:0 10px 24px rgba(0,0,0,0.06);
          }
          .theme-light .modal-section {
            background:rgba(255,255,255,0.72);
            box-shadow:0 10px 24px rgba(31,41,55,0.08);
          }
          .modal-section:last-child { margin-bottom:0; }
          .modal-section-top {
            display:flex;
            align-items:center;
            gap:10px;
            flex-wrap:wrap;
            margin-bottom:12px;
          }
          .modal-section-title { font-size:12px; font-weight:800; color:var(--ma-text-1); }
          .modal-section-badge {
            padding:4px 9px;
            border-radius:999px;
            background:color-mix(in srgb, var(--ma-soft) 94%, transparent);
            border:1px solid color-mix(in srgb, var(--ma-border) 96%, transparent);
            color:var(--ma-text-3);
            font-size:11px;
            font-weight:700;
          }
          .group-list { display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:10px; margin-bottom:14px; }
          .group-item,.player-card {
            display:flex;
            align-items:center;
            gap:12px;
            padding:12px 12px;
            border-radius:16px;
            border:1px solid color-mix(in srgb, var(--ma-border) 96%, transparent);
            background:color-mix(in srgb, var(--ma-panel) 78%, transparent);
            cursor:pointer;
            min-width:0;
            transition:180ms ease;
            box-shadow:0 8px 18px rgba(0,0,0,0.08);
          }
          .theme-light .group-item,
          .theme-light .player-card {
            background:rgba(255,255,255,0.88);
            box-shadow:0 8px 18px rgba(31,41,55,0.07);
          }
          .group-item:hover,.player-card:hover {
            transform:translateY(-1px);
            border-color:color-mix(in srgb, var(--ma-accent) 28%, transparent);
            background:color-mix(in srgb, var(--ma-accent) 8%, transparent);
          }
          .group-item.checked,.player-card.active {
            border-color:color-mix(in srgb, var(--ma-accent) 32%, transparent);
            background:linear-gradient(90deg, color-mix(in srgb, var(--ma-accent) 12%, transparent), transparent 68%), color-mix(in srgb, var(--ma-accent) 12%, transparent);
            box-shadow:0 10px 22px rgba(224,161,27,0.10);
          }
          .group-item input { margin:0; accent-color:var(--ma-accent); flex-shrink:0; }
          .group-icon,
          .player-card-icon {
            width:42px;
            height:42px;
            border-radius:14px;
            display:grid;
            place-items:center;
            background:color-mix(in srgb, var(--ma-soft) 92%, transparent);
            border:1px solid color-mix(in srgb, var(--ma-border) 96%, transparent);
            font-size:18px;
            flex-shrink:0;
          }
          .group-meta { min-width:0; flex:1; }
          .group-name { min-width:0; font-size:13px; font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
          .group-sub { min-width:0; font-size:11px; color:var(--ma-text-3); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-top:2px; }
          .group-actions { display:flex; gap:8px; flex-wrap:wrap; }
          .player-modal-grid { display:grid; grid-template-columns:1fr; gap:14px; }
          .player-group-title { font-size:12px; font-weight:800; color:var(--ma-text-2); margin-bottom:10px; }
          .player-list { display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:10px; }
          .player-card { align-items:flex-start; text-align:start; width:100%; }
          .player-card-dot { width:10px; height:10px; border-radius:50%; background:var(--ma-text-3); margin-top:6px; flex-shrink:0; box-shadow:0 0 0 5px rgba(255,255,255,0.03); }
          .player-card.playing .player-card-dot { background:#46c16f; box-shadow:0 0 10px rgba(70,193,111,0.35); }
          .player-card.paused .player-card-dot { background:#d9a441; }
          .player-card-meta { min-width:0; flex:1; }
          .player-card-top {
            display:flex;
            align-items:center;
            gap:8px;
            justify-content:space-between;
            margin-bottom:4px;
          }
          .player-card-title { font-size:13px; font-weight:800; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
          .player-card-badge {
            padding:3px 8px;
            border-radius:999px;
            background:color-mix(in srgb, var(--ma-soft) 94%, transparent);
            border:1px solid color-mix(in srgb, var(--ma-border) 96%, transparent);
            color:var(--ma-text-3);
            font-size:10px;
            font-weight:800;
            flex-shrink:0;
          }
          .player-card.active .player-card-badge {
            color:var(--ma-accent);
            border-color:color-mix(in srgb, var(--ma-accent) 28%, transparent);
            background:color-mix(in srgb, var(--ma-accent) 10%, transparent);
          }
          .player-card-sub,.player-card-track { font-size:11px; color:var(--ma-text-3); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
          .player-card-art,
          .group-art {
            width:52px;
            height:52px;
            border-radius:16px;
            overflow:hidden;
            border:1px solid color-mix(in srgb, var(--ma-border) 94%, transparent);
            background:color-mix(in srgb, var(--ma-soft) 92%, transparent);
            display:grid;
            place-items:center;
            flex-shrink:0;
            font-size:22px;
            color:var(--ma-text-3);
            box-shadow:0 8px 18px rgba(0,0,0,0.10);
          }
          .player-card-art img,
          .group-art img {
            width:100%;
            height:100%;
            object-fit:cover;
            display:block;
          }
          .group-item {
            justify-content:flex-start;
            align-items:center;
            gap:12px;
          }
          .group-item input {
            order:2;
            width:24px;
            height:24px;
            margin-inline-start:auto;
          }
          .group-item .group-meta {
            order:1;
            min-width:0;
            flex:1;
          }
          .group-item .group-name {
            font-size:16px;
            font-weight:800;
            color:var(--ma-text-1);
            white-space:nowrap;
            overflow:hidden;
            text-overflow:ellipsis;
          }
          .group-item .group-sub {
            display:none;
          }
          .now-layout {
            height:100%;
            display:grid;
            grid-template-columns:minmax(320px,42%) minmax(0,58%);
            gap:calc(16px * var(--ma-ui-scale));
            min-height:0;
          }
          .now-left,.now-right { min-height:0; display:flex; flex-direction:column; gap:calc(14px * var(--ma-ui-scale)); overflow:hidden; }
          .now-right > .now-card { flex:1; }
          .now-card {
            border:1px solid var(--ma-border);
            background:var(--ma-panel);
            border-radius:calc(24px * var(--ma-ui-scale));
            backdrop-filter:blur(16px);
            -webkit-backdrop-filter:blur(16px);
            box-shadow:0 10px 28px rgba(0,0,0,0.16);
          }
          .now-art-card {
            padding:calc(18px * var(--ma-ui-scale));
            min-height:0;
            display:flex;
            flex-direction:column;
            justify-content:center;
            box-shadow:0 16px 34px rgba(0,0,0,0.12);
            flex:1 1 auto;
          }
          .now-art {
            width:min(100%, clamp(200px, 34vh, 420px));
            aspect-ratio:1/1;
            max-width:100%;
            border-radius:24px;
            overflow:hidden;
            background:var(--ma-soft);
            display:grid;
            place-items:center;
            font-size:54px;
            color:var(--ma-text-3);
            border:1px solid var(--ma-border);
            box-shadow:0 16px 34px rgba(0,0,0,0.14);
            margin-inline:auto;
          }
          .now-track-meta { padding-top:12px; min-width:0; }
          .now-track-title {
            font-size:var(--ma-track-title-size);
            font-weight:900;
            line-height:1.06;
            margin-bottom:6px;
            letter-spacing:-0.02em;
            word-break:break-word;
          }
          .now-track-subtitle {
            font-size:14px;
            color:var(--ma-text-2);
            word-break:break-word;
            line-height:1.45;
          }
          .now-controls-card {
            padding:calc(18px * var(--ma-ui-scale));
            box-shadow:0 16px 34px rgba(0,0,0,0.10);
            display:grid;
            gap:calc(14px * var(--ma-ui-scale));
            align-content:start;
            overflow:hidden;
            flex:0 0 auto;
          }
          .now-time-row { display:flex; justify-content:space-between; gap:10px; font-size:12px; color:var(--ma-text-3); }
          .now-progress {
            height:12px;
            border-radius:999px;
            box-shadow:inset 0 1px 2px rgba(0,0,0,0.08);
          }
          .now-controls-main { gap:calc(10px * var(--ma-ui-scale)); flex-wrap:nowrap; justify-content:center; }
          .big-round-btn {
            width:var(--ma-now-button-size);
            height:var(--ma-now-button-size);
            border-radius:calc(20px * var(--ma-ui-scale));
            background:color-mix(in srgb, var(--ma-soft) 96%, transparent);
            color:var(--ma-text-1);
            border:1px solid color-mix(in srgb, var(--ma-border) 96%, transparent);
            box-shadow:0 12px 24px rgba(0,0,0,0.10);
          }
          .big-main-btn {
            width:var(--ma-now-main-button-size);
            height:var(--ma-now-main-button-size);
            border-radius:50%;
            font-size:calc(28px * var(--ma-ui-scale));
            box-shadow:0 14px 32px rgba(224,161,27,0.22);
          }
          .now-controls-bottom { display:grid; grid-template-columns:minmax(0,1fr) auto; gap:calc(12px * var(--ma-ui-scale)); align-items:center; }
          .now-volume {
            width:100%;
            display:grid;
            grid-template-columns:auto minmax(0,1fr);
            align-items:center;
            gap:calc(12px * var(--ma-ui-scale));
          }
          .now-volume input {
            width:100%;
            flex:unset;
            min-width:0;
          }
          .now-actions {
            display:flex;
            gap:8px;
            flex-wrap:wrap;
            justify-content:flex-end;
            align-items:center;
          }
          .now-player-picker-btn { font-size:12px; }
          .now-queue-card { padding:calc(16px * var(--ma-ui-scale)); min-height:0; display:flex; flex-direction:column; overflow:hidden; }
          .now-queue-toolbar { display:grid; gap:calc(12px * var(--ma-ui-scale)); margin-bottom:calc(12px * var(--ma-ui-scale)); }
          .now-queue-toolbar .now-queue-header { margin-bottom:0; }
          .now-queue-header { display:flex; align-items:center; gap:10px; margin-bottom:12px; flex-wrap:wrap; }
          .now-queue-title { font-size:15px; font-weight:700; }
          .now-queue-body { flex:1; min-height:0; overflow:hidden; display:flex; flex-direction:column; }
          .now-side-scroll {
            min-height:0;
            flex:1;
            overflow:auto;
            padding-inline-end:4px;
          }
          .now-queue-list {
            min-height:0;
            flex:1;
            overflow-y:visible;
            overflow-x:hidden;
            display:flex;
            flex-direction:column;
            gap:8px;
          }
          .now-queue-search {
            width:100%;
            min-width:0;
            flex:unset;
          }
          .side-search-summary {
            display:flex;
            align-items:center;
            justify-content:space-between;
            gap:10px;
            flex-wrap:wrap;
            margin-bottom:12px;
          }
          .side-search-summary-text {
            font-size:12px;
            color:var(--ma-text-3);
          }
          .mini-queue-item {
            display:flex;
            align-items:center;
            gap:10px;
            min-width:0;
            padding:10px 10px;
            border-radius:14px;
            background:transparent;
            border:1px solid transparent;
            cursor:pointer;
            position:relative;
          }
          .mini-queue-item:hover { background:var(--ma-soft); }
          .mini-queue-item.active {
            background:linear-gradient(90deg, color-mix(in srgb, var(--ma-accent) 18%, transparent), transparent 70%), var(--ma-soft);
            border-color:color-mix(in srgb, var(--ma-accent) 34%, transparent);
          }
          .mini-queue-item.active::before {
            content:'';
            position:absolute;
            inset-inline-start:0;
            top:8px;
            bottom:8px;
            width:3px;
            border-radius:999px;
            background:linear-gradient(180deg, var(--ma-accent), color-mix(in srgb, var(--ma-accent) 70%, white 30%));
          }
          .mini-queue-thumb { width:40px; height:40px; border-radius:11px; flex-shrink:0; }
          .mini-queue-meta { flex:1; min-width:0; }
          .mini-queue-name { font-size:12px; font-weight:600; }
          .mini-queue-item.active .mini-queue-name { color:var(--ma-text-1); font-weight:700; }
          .mini-queue-item.active .mini-queue-artist,.mini-queue-item.active .mini-queue-index { color:color-mix(in srgb, var(--ma-accent) 68%, white 32%); }
          .mini-queue-index { width:22px; text-align:center; font-size:11px; color:var(--ma-text-3); flex-shrink:0; }
          .group-inline { display:flex; align-items:center; gap:8px; margin-inline-start:auto; flex-wrap:wrap; }
          @media (max-width:1280px) {
            .now-controls-bottom { grid-template-columns:minmax(0,1fr) auto; }
            .now-actions { justify-content:flex-start; }
            .now-volume { width:100%; }
            .now-volume input { flex:1; min-width:0; }
            .now-controls-main { justify-content:center; }
          }
          @media (max-width:1100px) { .now-layout { grid-template-columns:1fr; grid-template-rows:auto minmax(0,1fr); } }
          @media (max-width:920px) {
            .card { grid-template-columns:1fr; height:min(var(--ma-card-height), calc(100dvh - 24px)); min-height:min(620px, var(--ma-effective-height)); }
            .sidebar {
              border-inline-end:none;
              border-bottom:1px solid var(--ma-border);
              display:grid;
              grid-template-columns:minmax(0,1fr);
            }
            .brand {
              padding:12px;
              border-bottom:1px solid color-mix(in srgb, var(--ma-border) 92%, transparent);
            }
            .nav { display:flex; gap:8px; overflow-x:auto; overflow-y:hidden; flex:unset; padding:10px; }
            .nav-label { display:none; }
            .nav-btn { width:auto; margin-bottom:0; white-space:nowrap; }
            .player-panel {
              display:grid;
              grid-template-columns:minmax(0,1fr) auto;
              gap:10px 12px;
              padding:12px;
              border-top:1px solid color-mix(in srgb, var(--ma-border) 92%, transparent);
            }
            .np-row {
              flex-direction:row;
              align-items:center;
              text-align:start;
              gap:10px;
            }
            .np-art {
              width:72px;
              height:72px;
              border-radius:20px;
            }
            .np-meta { flex:1; }
            .controls {
              margin-inline-start:auto;
              gap:10px;
            }
            .volume-row {
              grid-column:1 / -1;
            }
            .topbar {
              overflow-x:visible;
              overflow-y:visible;
            }
            .topbar-row,.player-summary-row {
              width:100%;
              min-width:0;
              display:grid;
              grid-template-columns:minmax(0,1fr) auto;
              grid-template-areas:
                "player actions"
                "search search";
              align-items:center;
              gap:10px;
            }
            .search {
              grid-area:search;
              width:100%;
              min-width:0;
            }
            .selected-player-box {
              grid-area:player;
              width:100%;
              min-width:0;
              max-width:none;
              flex:none;
            }
            .topbar-actions {
              grid-area:actions;
              margin-inline-start:0;
              justify-self:end;
              max-width:100%;
              overflow-x:auto;
              overflow-y:hidden;
              padding-bottom:2px;
            }
            .status-pill { width:auto; justify-content:center; }
            .now-controls-bottom { grid-template-columns:1fr; }
            .now-actions { justify-content:flex-start; }
            .group-list,.player-list { grid-template-columns:1fr; }
            .modal-backdrop {
              padding:
                max(12px, env(safe-area-inset-top))
                max(12px, env(safe-area-inset-right))
                max(12px, env(safe-area-inset-bottom))
                max(12px, env(safe-area-inset-left));
            }
          }
          @media (max-width:720px) {
            :host { --ma-radius-xl: 18px; }
            .card {
              height:min(var(--ma-card-height), calc(100dvh - 12px));
              max-height:calc(100dvh - 12px);
              border-radius:20px;
            }
            .brand {
              padding:10px 12px;
              gap:10px;
            }
            .brand-sub { display:none; }
            .player-panel {
              grid-template-columns:minmax(0,1fr);
              padding:10px 12px 12px;
            }
            .np-row {
              gap:10px;
            }
            .np-art {
              width:64px;
              height:64px;
              border-radius:18px;
            }
            .np-title { font-size:14px; }
            .controls {
              margin-inline-start:0;
              justify-content:flex-start;
            }
            .play-btn {
              width:58px;
              height:58px;
              border-radius:20px;
            }
            .topbar { padding:12px; }
            .content { padding:12px; }
            .topbar-row,.player-summary-row {
              grid-template-columns:1fr;
              grid-template-areas:
                "actions"
                "player"
                "search";
            }
            .topbar-actions {
              justify-self:stretch;
              width:100%;
              justify-content:flex-start;
              flex-wrap:nowrap;
            }
            .search,
            .selected-player-box {
              width:100%;
              min-width:0;
            }
            .selected-player-box {
              min-height:44px;
            }
            .icon-btn,.lang-btn,.close-btn,.theme-btn {
              width:40px;
              height:40px;
            }
            .status-pill {
              min-height:40px;
              padding:0 12px;
            }
            .now-layout {
              height:auto;
              min-height:0;
              gap:12px;
            }
            .now-left,.now-right {
              gap:12px;
            }
            .now-art-card {
              padding:16px;
            }
            .now-art {
              width:min(100%, 280px);
              border-radius:20px;
            }
            .now-track-meta {
              padding-top:10px;
              text-align:center;
            }
            .now-track-title { font-size:22px; }
            .now-track-subtitle { font-size:13px; }
            .now-controls-card { padding:16px; gap:12px; }
            .now-time-row { font-size:11px; }
            .now-progress { height:10px; }
            .big-round-btn { width:54px; height:54px; border-radius:18px; }
            .big-main-btn { width:76px; height:76px; font-size:26px; }
            .now-controls-main {
              flex-wrap:nowrap;
              gap:8px;
            }
            .now-controls-bottom {
              grid-template-columns:1fr;
              gap:10px;
            }
            .now-volume {
              grid-template-columns:auto minmax(0,1fr);
              gap:10px;
            }
            .now-actions {
              width:100%;
              justify-content:flex-start;
            }
            .now-actions .chip-btn {
              width:100%;
            }
            .now-queue-card {
              padding:14px;
            }
            .now-queue-header {
              gap:8px;
            }
            .group-inline {
              width:100%;
              margin-inline-start:0;
              gap:8px;
            }
            .group-inline .chip-btn {
              flex:1 1 calc(50% - 4px);
            }
            .mini-queue-item {
              padding:10px 8px;
              gap:8px;
            }
            .mini-queue-actions .chip-btn,.queue-actions .chip-btn {
              min-width:40px;
              min-height:38px;
              padding:8px 10px;
              font-size:13px;
            }
            .modal {
              width:min(100%, calc(100cqi - 16px));
              max-height:calc(100dvh - 16px);
              border-radius:20px;
            }
            .immersive-shell {
              padding:
                max(12px, env(safe-area-inset-top))
                max(12px, env(safe-area-inset-right))
                max(12px, env(safe-area-inset-bottom))
                max(12px, env(safe-area-inset-left));
            }
          }
          @media (max-width:480px) {
            .card {
              min-height:min(560px, var(--ma-card-height));
              border-radius:18px;
            }
            .brand-title { font-size:14px; }
            .brand-sub { font-size:10px; }
            .nav { padding:8px; gap:6px; }
            .nav-btn { width:auto; min-height:40px; padding:0 12px; }
            .topbar-row { gap:8px; width:100%; min-width:0; }
            .topbar-actions { gap:8px; }
            .status-pill,.selected-player-box { width:auto; }
            .now-layout { gap:12px; }
            .now-art-card,.now-controls-card,.now-queue-card { border-radius:20px; }
            .now-track-title { font-size:20px; }
            .now-track-subtitle { font-size:13px; }
            .big-round-btn { width:48px; height:48px; border-radius:16px; }
            .big-main-btn { width:68px; height:68px; font-size:24px; }
            .play-btn {
              width:54px;
              height:54px;
              border-radius:18px;
            }
            .np-art {
              width:58px;
              height:58px;
              border-radius:16px;
            }
            .selected-player-title {
              font-size:11px;
            }
            .selected-player-sub {
              font-size:10px;
            }
            .group-inline .chip-btn {
              flex:1 1 100%;
            }
            .now-controls-main {
              gap:6px;
            }
            .mini-queue-actions .chip-btn,.queue-actions .chip-btn {
              min-width:36px;
              min-height:36px;
              padding:8px;
            }
            .modal-body { padding:14px; }
          }
        .mobile-volume-inline .volume-btn .ui-ic{width:20px;height:20px;}
  .card:not(.layout-tablet) .mobile-volume-inline{grid-template-columns:auto minmax(0,1fr) auto;gap:10px;align-items:center;}
  .card:not(.layout-tablet) .mobile-volume-inline .volume-value{order:1;min-width:46px;text-align:center;}
  .card:not(.layout-tablet) .mobile-volume-inline .tablet-volume-track{order:2;}
  .card:not(.layout-tablet) .mobile-volume-inline .volume-btn{order:3;width:38px;height:38px;border-radius:999px;}
  .card:not(.layout-tablet) .mobile-volume-inline.has-volume-step-buttons{grid-template-columns:auto auto minmax(0,1fr) auto auto;gap:8px;}
  .card:not(.layout-tablet) .mobile-volume-inline.has-volume-step-buttons .volume-value{order:1;}
  .card:not(.layout-tablet) .mobile-volume-inline.has-volume-step-buttons .volume-step-minus{order:2;}
  .card:not(.layout-tablet) .mobile-volume-inline.has-volume-step-buttons .tablet-volume-track{order:3;}
  .card:not(.layout-tablet) .mobile-volume-inline.has-volume-step-buttons .volume-step-plus{order:4;}
  .card:not(.layout-tablet) .mobile-volume-inline.has-volume-step-buttons .volume-btn{order:5;}
  .card:not(.layout-tablet) .mobile-volume-inline .volume-btn.active{background:rgba(170,38,38,.28)!important;border-color:rgba(255,98,98,.36)!important;color:#fff!important;box-shadow:0 10px 24px rgba(120,22,22,.22)!important;}
  .card:not(.layout-tablet) .queue-action-item{min-height:58px;margin-bottom:10px;}
  .mobile-art-actions{left:50%!important;right:auto!important;transform:translateX(-50%)!important;inset-inline:auto!important;inset-block-end:16px!important;display:flex!important;align-items:center!important;justify-content:center!important;gap:10px!important;padding:0!important;border-radius:0!important;background:transparent!important;border:none!important;box-shadow:none!important;backdrop-filter:none!important;}
  .card.layout-tablet .mobile-art-actions{left:50%!important;right:auto!important;transform:translateX(-50%)!important;inset-inline:auto!important;inset-block-end:18px!important;}
  .theme-light .mobile-art-actions{background:transparent!important;border-color:transparent!important;box-shadow:none!important;}
  .mobile-art-fab{width:46px;min-width:46px;height:46px;border-radius:999px;}
  @media (max-width: 600px){.mobile-art-actions{left:50%!important;right:auto!important;transform:translateX(-50%)!important;inset-inline:auto!important;inset-block-end:12px!important;gap:8px!important;}.mobile-art-fab{width:42px;min-width:42px;height:42px;}}
  .card.layout-tablet .menu-backdrop{justify-content:center!important;align-items:stretch!important;padding:var(--flow-sheet-pad-block) var(--flow-sheet-pad-inline)!important;}
  .card.layout-tablet .menu-sheet{width:min(calc(100% - var(--flow-sheet-gutter)), 920px)!important;max-width:min(calc(100% - var(--flow-sheet-gutter)), 920px)!important;max-height:calc(100% - 26px)!important;height:calc(100% - 26px)!important;margin-inline:auto!important;}
  .card.layout-tablet .menu-sheet.sheet-library,.card.layout-tablet .menu-sheet.sheet-search{width:min(calc(100% - var(--flow-sheet-gutter)), 1120px)!important;max-width:min(calc(100% - var(--flow-sheet-gutter)), 1120px)!important;}
  .card.layout-tablet .menu-sheet.sheet-queue{width:min(calc(100% - var(--flow-sheet-queue-gutter)), 980px)!important;max-width:min(calc(100% - var(--flow-sheet-queue-gutter)), 980px)!important;}
  .card.layout-tablet .menu-sheet.sheet-actions,.card.layout-tablet .menu-sheet.sheet-simple,.card.layout-tablet .menu-sheet.sheet-schedules,.card.layout-tablet .menu-sheet.sheet-players,.card.layout-tablet .menu-sheet.sheet-groupplayers,.card.layout-tablet .menu-sheet.sheet-settings{width:min(calc(100% - var(--flow-sheet-narrow-gutter)), 860px)!important;max-width:min(calc(100% - var(--flow-sheet-narrow-gutter)), 860px)!important;}
  .card.layout-tablet .menu-sheet.sheet-schedules{width:min(calc(100% - var(--flow-sheet-gutter)), 1080px)!important;max-width:min(calc(100% - var(--flow-sheet-gutter)), 1080px)!important;}
  .card.layout-tablet .menu-body.sheet-schedules{justify-items:stretch!important;align-content:start!important;overflow:auto!important;}
  .card.layout-tablet .menu-body.sheet-schedules .settings-shell{height:auto!important;min-height:100%!important;grid-template-rows:auto auto!important;overflow:visible!important;}
  .card.layout-tablet .wake-schedule-layout{height:auto!important;display:grid!important;grid-template-columns:minmax(0,1fr)!important;align-items:stretch!important;overflow:visible!important;}
  .card.layout-tablet .wake-schedule-list-card{max-height:none!important;overflow:visible!important;}
  .card.layout-tablet .wake-schedule-editor-card{overflow:visible!important;}
  .card.layout-tablet .scheduled-start-grid{grid-template-columns:minmax(0,1fr)!important;}
  .card.layout-tablet .sleep-timer-corner{inset-block-end:22px!important;inset-block-start:auto!important;transform:none!important;justify-items:end!important;z-index:8!important;}
  .card.layout-tablet.rtl .sleep-timer-corner{inset-inline-end:76px!important;inset-inline-start:auto!important;}
  .card.layout-tablet:not(.rtl) .sleep-timer-corner{inset-inline-start:76px!important;inset-inline-end:auto!important;}
  .card.layout-tablet .queue-list{max-width:920px;margin-inline:auto;}
  .card.layout-tablet .queue-row{min-height:88px!important;}
  .card.layout-tablet .active-player-chip .bars,.card.layout-tablet .active-player-card .bars{display:none!important;}
  .menu-backdrop{overflow:hidden;isolation:isolate;}
  .menu-backdrop::before{content:"";position:absolute;inset:-42px;background:var(--menu-dynamic-art, var(--dynamic-art-url, none)) center/cover no-repeat;filter:blur(42px) saturate(1.12) brightness(.86);transform:scale(1.12);opacity:0;pointer-events:none;z-index:0;transition:opacity .22s ease;}
  .menu-backdrop.has-menu-art::before{opacity:.58;}
  .menu-backdrop::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(5,7,12,.46),rgba(8,10,16,.72));pointer-events:none;z-index:0;}
  .theme-light .menu-backdrop::after{background:linear-gradient(180deg,rgba(238,243,250,.34),rgba(222,229,240,.68));}
  .menu-backdrop>.menu-sheet{position:relative;z-index:1;isolation:isolate;}
  .menu-sheet::before{content:"";position:absolute;inset:-24px;background:var(--menu-dynamic-art, var(--dynamic-art-url, none)) center/cover no-repeat;filter:blur(30px) saturate(1.08);transform:scale(1.08);opacity:0;pointer-events:none;z-index:0;}
  .menu-backdrop.has-menu-art .menu-sheet::before{opacity:.22;}
  .menu-sheet::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(20,22,31,.82),rgba(12,14,22,.94));pointer-events:none;z-index:0;}
  .theme-light .menu-sheet::after{background:linear-gradient(180deg,rgba(255,255,255,.86),rgba(245,248,253,.94));}
  .menu-sheet>*,.menu-head,.menu-body{position:relative;z-index:1;}
  .card.dynamic-theme .modal{position:relative;overflow:hidden;isolation:isolate;}
  .card.dynamic-theme .modal::before{content:"";position:absolute;inset:-24px;background:var(--dynamic-art-url, none) center/cover no-repeat;filter:blur(34px) saturate(1.08);transform:scale(1.08);opacity:.22;pointer-events:none;z-index:0;}
  .card.dynamic-theme .modal::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(20,22,31,.8),rgba(12,14,22,.92));pointer-events:none;z-index:0;}
  .theme-light.card.dynamic-theme .modal::after{background:linear-gradient(180deg,rgba(255,255,255,.84),rgba(245,248,253,.94));}
  .card.dynamic-theme .modal>*{position:relative;z-index:1;}
  .group-player-card{position:relative;}
  .group-player-card.checked,.group-player-row.checked{border-color:rgba(var(--dynamic-accent-rgb,245 166 35) / .42)!important;background:linear-gradient(180deg,rgba(var(--dynamic-accent-rgb,245 166 35) / .13),rgba(255,255,255,.06))!important;}
  .group-player-card .player-premium-head{position:relative;padding:10px 50px 0 0!important;}
  .group-player-title-row{gap:8px;}
  .group-player-toggle{position:absolute;top:6px;right:7px;left:auto;bottom:auto;width:29px;height:29px;border-radius:0;display:inline-grid;place-items:center;flex:0 0 auto;border:0;background:transparent;color:rgba(210,216,226,.62);box-shadow:none;opacity:.9;z-index:2;pointer-events:none;transition:transform .15s ease,opacity .15s ease,color .15s ease,filter .15s ease;}
  .group-player-toggle.checked{color:rgb(var(--dynamic-accent-rgb,245 166 35));filter:drop-shadow(0 0 8px rgba(var(--dynamic-accent-rgb,245 166 35) / .34));opacity:1;}
  .group-item-toggle{width:28px;height:28px;border-radius:999px;display:inline-grid;place-items:center;flex:0 0 auto;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.08);color:var(--ma-text-1);box-shadow:inset 0 1px 0 rgba(255,255,255,.12);}
  .group-item-toggle.checked{border-color:rgba(var(--dynamic-accent-rgb,245 166 35) / .42);background:rgba(var(--dynamic-accent-rgb,245 166 35) / .18);color:var(--ma-accent);}
  .theme-light .group-player-toggle{color:rgba(74,84,100,.62);}
  .theme-light .group-player-toggle.checked{color:rgb(var(--dynamic-accent-rgb,245 166 35));}
  .theme-light .group-item-toggle{border-color:rgba(26,39,61,.14);background:rgba(255,255,255,.74);color:#263247;}
  .group-player-toggle .ui-ic{width:18px;height:18px;}
  .group-item-toggle .ui-ic{width:15px;height:15px;}
  .group-player-check,.group-player-card .group-player-check,.group-item input[type="checkbox"]{position:absolute!important;width:1px!important;height:1px!important;opacity:0!important;pointer-events:none!important;margin:0!important;}
  .group-item .group-name{display:flex;align-items:center;gap:10px;min-width:0;}
  .group-item .group-name .group-item-toggle{margin-inline-start:auto;}
  .action-btn.busy{position:relative;display:inline-flex!important;align-items:center;justify-content:center;gap:8px;cursor:progress!important;pointer-events:none;color:var(--ma-accent);border-color:rgba(var(--dynamic-accent-rgb,245 166 35) / .34);background:linear-gradient(180deg,rgba(var(--dynamic-accent-rgb,245 166 35) / .2),rgba(255,255,255,.07));}
  .action-btn.busy::before{content:"";width:14px;height:14px;border-radius:999px;border:2px solid currentColor;border-inline-end-color:transparent;animation:spin .72s linear infinite;}
  .action-btn.busy::after{content:"";position:absolute;inset:-4px;border-radius:inherit;border:1px solid rgba(var(--dynamic-accent-rgb,245 166 35) / .28);animation:voiceAssistantListenPulse 1s ease-out infinite;pointer-events:none;}

  </style>

        <div class="card ${rtl ? "rtl" : ""} theme-${visualTheme}${theme === "custom" ? " theme-custom" : ""}${this._isHotelMode() ? " hotel-mode" : ""}${layoutProfileClass ? ` ${layoutProfileClass}` : ""}" style="${layoutProfileStyle}--v2-custom-text:${this._state.mobileCustomTextTone === "dark" ? "#1f2633" : "#ffffff"};">
          <aside class="sidebar">
            <div class="brand">
              <button class="brand-icon" id="brandPlayersBtn" title="${this._i18n("ui.open_music_assistant")}">▶</button>
              <div>
        <div class="brand-title">homeii-music-flow</div>
                <div class="brand-sub">Music Assistant</div>
              </div>
            </div>

            <nav class="nav">
              <button class="nav-btn active" data-view="home"><span class="nav-ico">⌂</span><span>${this._i18n("ui.home")}</span></button>
              <button class="nav-btn" data-view="now_playing"><span class="nav-ico">▶</span><span>${this._i18n("ui.now_playing")}</span></button>
              <button class="nav-btn" data-view="radio"><span class="nav-ico">📻</span><span>${this._i18n("ui.radio")}</span></button>
              <button class="nav-btn" data-view="podcasts"><span class="nav-ico">🎙</span><span>${this._i18n("ui.podcasts")}</span></button>
              <button class="nav-btn" data-view="albums"><span class="nav-ico">◉</span><span>${this._i18n("ui.albums")}</span></button>
              <button class="nav-btn" data-view="artists"><span class="nav-ico">♪</span><span>${this._i18n("ui.artists")}</span></button>
              <button class="nav-btn" data-view="tracks"><span class="nav-ico">♫</span><span>${this._i18n("ui.tracks")}</span></button>
              <button class="nav-btn" data-view="playlists"><span class="nav-ico">☰</span><span>${this._i18n("ui.playlists")}</span></button>
            </nav>

            <div class="player-panel">
              <div class="np-row" id="npRow" title="${this._i18n("ui.now_playing")}">
                <div class="np-art" id="npArt">${this._artPlaceholderHtml("music_note")}</div>
                <div class="np-meta">
                  <div class="np-title" id="npTitle">${this._i18n("ui.nothing_playing")}</div>
                  <div class="np-sub" id="npSub">—</div>
                </div>
              </div>

              <div class="controls">
                <button class="icon-btn" id="btnPrev" title="${this._i18n("ui.previous")}">${this._iconSvg("previous")}</button>
                <button class="play-btn" id="btnPlay" title="${this._i18n("ui.play_pause")}">${this._iconSvg("play")}</button>
                <button class="icon-btn" id="btnNext" title="${this._i18n("ui.next")}">${this._iconSvg("next")}</button>
              </div>

              <div class="volume-row">
                <button class="icon-btn" id="btnMute" title="${this._i18n("ui.mute")}">${this._iconSvg("volume_high")}</button>
                <input class="volume-range" id="volSlider" type="range" min="0" max="100" value="50" style="--vol-pct:50%">
              </div>

              <select class="player-select" id="playerSel" aria-hidden="true" tabindex="-1">
                <option value="">${this._i18n("ui.loading_players")}</option>
              </select>
            </div>
          </aside>

          <section class="main">
            <div class="topbar">
              <div class="topbar-row">
                <div class="search" id="searchWrap">
                  <span>🔍</span>
                  <input id="searchInp" type="text" placeholder="${this._i18n("ui.search_everything")}">
                  <button class="icon-btn" id="searchClear" style="display:none;" title="${this._i18n("ui.clear")}">✕</button>
                </div>

                <div class="selected-player-box" id="selectedPlayerBox">
                  <div class="chip-dot"></div>
                  <div class="selected-player-meta">
                    <div class="selected-player-title" id="selectedPlayerTitle">${this._i18n("ui.selected_player")}</div>
                    <div class="selected-player-sub" id="selectedPlayerSub">—</div>
                  </div>
                </div>

                <div class="topbar-actions">
                  <button class="chip-btn" id="choosePlayerBtn">${this._i18n("ui.choose_player")}</button>
                  <button class="theme-btn" id="themeToggleBtn" style="display:${this._config.show_theme_toggle && !this._isHotelMode() ? "" : "none"};">${theme === "dark" ? "☀" : "🌙"}</button>
                  <button class="chip-btn" id="maOpenBtn" style="display:none;">MA</button>
                  <button class="lang-btn" id="langBtn" title="${this._i18n("ui.language")}">${this._languageShortcutLabel()}</button>
                  <div class="status-pill offline" id="statusPill"><span class="status-dot"></span><span id="statusText">${this._i18n("ui.connecting")}</span></div>
                </div>
              </div>
            </div>

            <div class="content" id="content">
              <div class="state-box"><div><div class="spinner"></div><div>${this._i18n("ui.connecting_2")}</div></div></div>
            </div>

            <div class="modal-backdrop" id="groupModal">
              <div class="modal">
                <div class="modal-header">
                  <div class="modal-header-icon">🔗</div>
                  <div class="modal-header-meta">
                    <div class="modal-title">${this._i18n("ui.group_speakers")}</div>
                    <div class="modal-subtitle" id="groupModalSubtitle">${this._i18n("ui.choose_target_player")}</div>
                  </div>
                  <button class="close-btn" id="groupModalClose">✕</button>
                </div>
                <div class="modal-body">
                  <div class="modal-section">
                    <div class="modal-section-top">
                      <div class="modal-section-title">${this._i18n("ui.group_speakers")}</div>
                      <div class="modal-section-badge" id="groupCountBadge">0</div>
                    </div>
                    <div class="group-list" id="groupList"></div>
                  </div>
                  <div class="group-actions">
                    <button class="chip-btn" id="applyGroupBtn">${this._i18n("ui.apply_group")}</button>
                    <button class="chip-btn warn" id="unGroupBtn">${this._i18n("ui.ungroup")}</button>
                  </div>
                </div>
              </div>
            </div>

            <div class="modal-backdrop" id="playerModal">
              <div class="modal">
                <div class="modal-header">
                  <div class="modal-header-icon" id="playerModalIcon">🎵</div>
                  <div class="modal-header-meta">
                    <div class="modal-title" id="playerModalTitle">${this._i18n("ui.choose_player")}</div>
                    <div class="modal-subtitle" id="playerModalSubtitle">—</div>
                  </div>
                  <button class="close-btn" id="playerModalClose">✕</button>
                </div>
                <div class="modal-body" id="playerModalBody"></div>
              </div>
            </div>

            <div class="toast-wrap" id="toastWrap"></div>
          </section>

          <div class="immersive-backdrop" id="immersiveNowPlaying"></div>
        </div>
      `;

      this.shadowRoot.querySelectorAll(".nav-btn").forEach((btn) => btn.addEventListener("click", () => this._setView(btn.dataset.view, btn)));
      this._startResizeTracking();
      this.$("playerSel")?.addEventListener("change", (e) => this._selectPlayer(e.target.value || null, true));
      this.$("btnPlay").addEventListener("click", () => this._togglePlay());
      this.$("btnPrev").addEventListener("click", () => this._playerCmd("previous"));
      this.$("btnNext").addEventListener("click", () => this._playerCmd("next"));

      this.$("btnMute").addEventListener("click", () => this._toggleMute());
      this.$("npRow").addEventListener("click", () => { if (!this._isHotelMode()) this._toggleQueue(); });
      this.$("npArt").addEventListener("click", (e) => {
        e.stopPropagation();
        this._openNowPlayingView();
      });
      this.$("langBtn").addEventListener("click", () => this._toggleLanguage());
      this.$("choosePlayerBtn").addEventListener("click", () => this._openPlayerModal());
      this.$("brandPlayersBtn").addEventListener("click", () => this._openMusicAssistant());
      this.$("selectedPlayerBox").addEventListener("click", () => this._openPlayerModal());
      this.$("themeToggleBtn").addEventListener("click", () => this._toggleCardTheme());
      this.$("maOpenBtn").addEventListener("click", () => this._openMusicAssistant());

      this.$("volSlider").addEventListener("input", (e) => {
        const pct = Number(e.target.value || 0);
        e.target.style.setProperty("--vol-pct", `${pct}%`);
        this._setButtonIcon(this.$("btnMute"), pct === 0 ? "volume_mute" : pct < 40 ? "volume_low" : "volume_high");
        clearTimeout(this._volumeTimer);
        this._volumeTimer = setTimeout(() => this._setVolume(pct / 100), 120);
        this._syncBigVolumeMirror(pct);
      });

      this._bindProgressSeekBar(this.$("progressBar"));

      const searchInput = this.$("searchInp");
      const searchClear = this.$("searchClear");
      searchInput.addEventListener("input", () => {
        const q = searchInput.value.trim();
        this._state.query = q;
        searchClear.style.display = q ? "" : "none";
        clearTimeout(this._searchTimer);
        this._searchTimer = setTimeout(() => q ? this._renderGlobalSearch(q) : this._renderCurrentView(), 300);
      });
      searchInput.addEventListener("keydown", (e) => e.stopPropagation());
      searchClear.addEventListener("click", () => {
        searchInput.value = "";
        this._state.query = "";
        searchClear.style.display = "none";
        this._renderCurrentView();
      });

      this.$("content").addEventListener("click", this._boundContentClick);
      this.$("content").addEventListener("change", (e) => this._handleQueueMoveAutoChange(e));
      this.$("content").addEventListener("contextmenu", this._boundContentContext);
      this.$("groupList").addEventListener("change", (e) => this._handleGroupChange(e));
      this.$("applyGroupBtn").addEventListener("click", (event) => this._runMenuButtonLoading(event.currentTarget, this._i18n("ui.connecting_2"), () => this._applySpeakerGroup(), { kind: "connect" }));
      this.$("unGroupBtn").addEventListener("click", (event) => this._runMenuButtonLoading(event.currentTarget, this._i18n("ui.disconnecting"), () => this._clearSpeakerGroup(), { kind: "disconnect" }));
      this.$("groupModalClose").addEventListener("click", () => this._closeGroupModal());
      this.$("groupModal").addEventListener("click", (e) => { if (e.target === this.$("groupModal")) this._closeGroupModal(); });
      this.$("playerModalClose").addEventListener("click", () => this._closePlayerModal());
      this.$("playerModal").addEventListener("click", (e) => { if (e.target === this.$("playerModal")) this._closePlayerModal(); });
      document.addEventListener("click", this._boundDocClick);
    }

    async _init() {
      try {
        await this._ensureConfigEntryId();
        this._loadPlayers();
        this._connectMA();
        this._refreshGroupingState();
        this._renderPlayerSummary();
        this._syncMaButtonVisibility();
        if (this._state.view === "now_playing") await this._renderNowPlayingPage();
        else if (this._state.query) await this._renderGlobalSearch(this._state.query);
        else await this._renderCurrentView();
        this._startLoops();
        setTimeout(() => { if (this._state.view === "home" && !this._state.query) this._renderHome(); }, 2500);
      } catch (e) {
        this._renderError(e);
      }
    }

    $(id) { return this.shadowRoot.getElementById(id); }

    _languageBaseCode(value = "") {
      return String(value || "")
        .trim()
        .toLowerCase()
        .replace("_", "-")
        .split("-")[0];
    }

    _languageOptions(includeAuto = false) {
      return HOMEII_VISIBLE_LANGUAGE_OPTIONS.filter((option) => includeAuto || option.value !== "auto");
    }

    _languageShortLabel(value = "") {
      const code = this._languageBaseCode(value);
      if (code === "he") return "עב";
      return code ? code.slice(0, 2).toUpperCase() : "EN";
    }

    _nextLanguageCode() {
      const options = this._languageOptions(false).map((option) => this._languageBaseCode(option.value)).filter(Boolean);
      if (!options.length) return "en";
      const current = this._languageBaseCode(this._language() || this._state.lang || this._config?.language || "en");
      const index = options.indexOf(current);
      return options[(index + 1) % options.length] || options[0] || "en";
    }

    _languageShortcutLabel() {
      return this._languageShortLabel(this._nextLanguageCode());
    }

    _settingsLanguageSelectHtml() {
      const current = this._languageBaseCode(this._state.lang || this._config?.language || this._language() || "en");
      return `
        <label class="settings-select-card language-select-card">
          <span class="settings-select-card-icon">${this._iconSvg("language")}</span>
          <select class="media-sort-select settings-select language-select" id="mobileLanguageSelect" aria-label="${this._esc(this._i18n("ui.language"))}">
            ${this._languageOptions(true).map((option) => {
              const value = this._languageBaseCode(option.value);
              return `<option value="${this._esc(option.value)}" ${value === current ? "selected" : ""}>${this._esc(option.label || option.value)}</option>`;
            }).join("")}
          </select>
        </label>
      `;
    }

    _toggleLanguage() {
      this._state.lang = this._nextLanguageCode();
      try { localStorage.setItem("homeii_music_flow_lang", this._state.lang); } catch (_) {}

      const currentTheme = this._state.cardTheme;
      const currentPlayer = this._state.selectedPlayer;
      const hadAutoSelected = this._state.hasAutoSelectedPlayer;
      const currentView = this._state.view;
      const currentQuery = this._state.query;
      const currentNowPlayingQuery = this._state.nowPlayingQuery;
      const currentImmersive = this._state.immersiveNowPlayingOpen;

      if (this._imgObserver) {
        this._imgObserver.disconnect();
        this._imgObserver = null;
        this._imgObserverRoot = null;
      }
      if (this._ws) {
        try { this._ws.close(); } catch (_) {}
        this._ws = null;
      }
      clearInterval(this._pollTimer);
      clearInterval(this._progressTimer);
      clearTimeout(this._searchTimer);
      clearTimeout(this._nowPlayingSearchTimer);
      clearTimeout(this._volumeTimer);
      clearTimeout(this._bigVolumeTimer);
      clearTimeout(this._seekTimer);
      clearTimeout(this._systemMobileStatePersistTimer);
      clearTimeout(this._resizeTimer);

      this._built = false;
      this._state.view = currentView;
      this._state.query = currentQuery;
      this._state.nowPlayingQuery = currentNowPlayingQuery;
      this._state.queueVisible = false;
      this._state.playerModalOpen = false;
      this._state.maQueueState = null;
      this._state.queueItems = [];
      this._state.queueMutationPendingUntil = 0;
      this._state.queueMutationExpectedSignature = "";
      this._state.nowPlayingUri = "";
      this._state.selectedPlayer = currentPlayer;
      this._state.hasAutoSelectedPlayer = hadAutoSelected;
      this._state.cardTheme = currentTheme;
      this._state.immersiveNowPlayingOpen = false;
      this._imageBlobCache.clear();

      this._build();
      this._init().then(() => {
        if (currentImmersive && this._state.view === "now_playing") this._openImmersiveNowPlaying();
      });
    }

    _toggleCardTheme() {
      const effective = this._effectiveTheme();
      this._state.cardTheme = effective === "dark" ? "light" : "dark";
      try { localStorage.setItem("homeii_music_flow_theme", this._state.cardTheme); } catch (_) {}
      const card = this.shadowRoot.querySelector(".card");
      if (card) {
        card.classList.remove("theme-dark", "theme-light");
        card.classList.add(`theme-${this._effectiveTheme()}`);
      }
      this._updateThemeButton();
    }

    _playerStateLabel(player) {
      if (!player) return this._i18n("ui.idle");
      if (player.state === "playing") return this._i18n("ui.playing");
      if (player.state === "paused") return this._i18n("ui.paused");
      return this._i18n("ui.idle");
    }

    _isPlayerActive(player) {
      if (!player) return false;
      const attrs = player.attributes || {};
      return player.state === "playing" || player.state === "paused" || !!attrs.media_title || !!attrs.active_queue;
    }

    _thisDeviceStorageKey() {
      return `homeii-this-device-player::${this._maBrowserUrl() || this._config?.ma_url || location.origin || "default"}`;
    }

    _getRememberedThisDevicePlayerId() {
      try {
        return localStorage.getItem(this._thisDeviceStorageKey()) || "";
      } catch (_) {
        return "";
      }
    }

    _rememberThisDevicePlayer(entityId) {
      try {
        if (!entityId) localStorage.removeItem(this._thisDeviceStorageKey());
        else localStorage.setItem(this._thisDeviceStorageKey(), entityId);
      } catch (_) {}
    }

    _localText(en, he) {
      return typeof this._m === "function" ? this._m(en, he) : (this._isHebrew() ? he : en);
    }

    _localSendspinIdStorageKey() {
      return "homeii_sendspin_webplayer_id";
    }

    _legacySendspinIdStorageKey() {
      return "sendspin_webplayer_id";
    }

    _localSendspinDesiredStorageKey() {
      return "homeii_local_sendspin_desired";
    }

    _isLocalSendspinDesired() {
      const session = this._localSendspinGlobalSession(false);
      if (session?.desired) return true;
      if (this._localSendspinDesired) return true;
      try {
        return sessionStorage.getItem(this._localSendspinDesiredStorageKey()) === "1";
      } catch (_) {
        return false;
      }
    }

    _setLocalSendspinDesired(enabled) {
      this._localSendspinDesired = !!enabled;
      const session = this._localSendspinGlobalSession();
      if (session) session.desired = !!enabled;
      try {
        if (enabled) sessionStorage.setItem(this._localSendspinDesiredStorageKey(), "1");
        else sessionStorage.removeItem(this._localSendspinDesiredStorageKey());
      } catch (_) {}
    }

    _clearLocalSendspinReconnectTimer() {
      if (this._localSendspinReconnectTimer) {
        clearTimeout(this._localSendspinReconnectTimer);
        this._localSendspinReconnectTimer = null;
      }
    }

    _localSendspinGlobalSession(create = true) {
      if (typeof window === "undefined") return null;
      const key = "__homeiiLocalSendspinSessionV1";
      if (!window[key] && create) {
        window[key] = {
          player: null,
          socket: null,
          audioElement: null,
          connected: false,
          connecting: false,
          playerId: "",
          state: null,
          desired: false,
          controller: null,
          lifecycleListening: false,
          lifecycleHandler: null,
        };
      }
      return window[key] || null;
    }

    _adoptLocalSendspinGlobalSession() {
      const session = this._localSendspinGlobalSession(false);
      if (!session) return null;
      this._localSendspinPlayer = session.player || null;
      this._localSendspinSocket = session.socket || null;
      this._localSendspinConnected = !!session.connected;
      this._localSendspinConnecting = !!session.connecting;
      this._localSendspinPlayerId = session.playerId || this._localSendspinPlayerId || "";
      this._localSendspinState = session.state || this._localSendspinState || null;
      this._localSendspinDesired = !!session.desired || this._localSendspinDesired;
      const desired = session.desired || this._isLocalSendspinDesired();
      if (desired) {
        this._state.localSendspinStatus = session.connected ? "connected" : (session.connecting ? "connecting" : "reconnecting");
        if (session.connected) this._state.awaitingThisDevicePlayer = false;
      }
      return session;
    }

    _syncLocalSendspinGlobalSession() {
      const session = this._localSendspinGlobalSession();
      if (!session) return null;
      session.player = this._localSendspinPlayer || null;
      session.socket = this._localSendspinSocket || null;
      session.connected = !!this._localSendspinConnected;
      session.connecting = !!this._localSendspinConnecting;
      session.playerId = this._localSendspinPlayerId || session.playerId || "";
      session.state = this._localSendspinState || null;
      session.desired = !!this._isLocalSendspinDesired();
      if (!session.controller || session.controller === this || this.isConnected) session.controller = this;
      return session;
    }

    _clearLocalSendspinGlobalRuntime() {
      const session = this._localSendspinGlobalSession(false);
      if (!session) return;
      session.player = null;
      session.socket = null;
      session.connected = false;
      session.connecting = false;
      session.state = null;
      if (!session.desired) session.playerId = "";
      if (session.controller === this) session.controller = null;
    }

    _sanitizeLocalSendspinPlayerId(value) {
      return String(value || "").trim().replace(/[^\w.-]/g, "_");
    }

    _isHomeiiSendspinPlayerId(value) {
      const playerId = this._sanitizeLocalSendspinPlayerId(value);
      return /^ma_homeii_[\w.-]+$/i.test(playerId) || /^homeii_[\w.-]+$/i.test(playerId);
    }

    _peekLocalSendspinPlayerId() {
      if (this._localSendspinPlayerId) {
        const playerId = this._sanitizeLocalSendspinPlayerId(this._localSendspinPlayerId);
        return this._isHomeiiSendspinPlayerId(playerId) ? playerId : "";
      }
      try {
        const playerId = this._sanitizeLocalSendspinPlayerId(localStorage.getItem(this._localSendspinIdStorageKey()) || "");
        return this._isHomeiiSendspinPlayerId(playerId) ? playerId : "";
      } catch (_) {
        return "";
      }
    }

    _getLocalSendspinPlayerId() {
      if (this._localSendspinPlayerId) return this._localSendspinPlayerId;
      let playerId = "";
      try {
        playerId = this._sanitizeLocalSendspinPlayerId(localStorage.getItem(this._localSendspinIdStorageKey()) || "");
      } catch (_) {}
      if (playerId && !this._isHomeiiSendspinPlayerId(playerId)) playerId = "";
      if (!playerId) {
        const randomPart = Math.random().toString(36).slice(2, 12);
        playerId = `ma_homeii_${randomPart}`;
      }
      try { localStorage.setItem(this._localSendspinIdStorageKey(), playerId); } catch (_) {}
      this._localSendspinPlayerId = playerId;
      return playerId;
    }

    _localSendspinModuleUrl() {
      return new URL(/* @vite-ignore */ "./sendspin-js/index.js", import.meta.url).href;
    }

    async _loadLocalSendspinModule() {
      if (!this._localSendspinModule) {
        this._localSendspinModule = import(this._localSendspinModuleUrl()).catch((error) => {
          this._localSendspinModule = null;
          const detail = error?.message ? `: ${error.message}` : "";
          throw new Error(`${this._localText("Could not load the local Sendspin player files", "לא הצלחתי לטעון את קבצי נגן Sendspin המקומי")}${detail}`);
        });
      }
      return this._localSendspinModule;
    }

    _localSendspinSyncDelayStorageKey() {
      return "homeii_local_sendspin_sync_delay_ms";
    }

    _localSendspinWsUrl() {
      const baseUrl = this._maBrowserUrl();
      const base = new URL(baseUrl, typeof window !== "undefined" ? window.location.href : undefined);
      const protocol = base.protocol === "https:" ? "wss:" : "ws:";
      const path = base.pathname.replace(/\/$/, "");
      return `${protocol}//${base.host}${path}/sendspin`;
    }

    _assertLocalSendspinConfig() {
      const baseUrl = this._maBrowserUrl();
      if (!baseUrl || !this._maToken) {
        throw new Error(this._localText(
          "Set a direct Music Assistant URL and token in the card settings before connecting this device.",
          "כדי לחבר את המכשיר מתוך הכרטיס צריך להגדיר בכרטיס כתובת Music Assistant ישירה וגם token."
        ));
      }
      if (typeof WebSocket === "undefined") {
        throw new Error(this._localText("This browser does not support WebSocket.", "הדפדפן הזה לא תומך ב-WebSocket."));
      }
      this._assertMaBrowserUrlSecure(baseUrl);
    }

    _openAuthenticatedSendspinSocket(playerId) {
      const wsUrl = this._localSendspinWsUrl();
      return new Promise((resolve, reject) => {
        let settled = false;
        let ws = null;
        let timeout = null;
        const WebSocketCtor = window.__homeiiSendspinInterceptorV1?.original || window.WebSocket;
        const cleanup = () => {
          if (timeout) clearTimeout(timeout);
          if (ws) {
            ws.onopen = null;
            ws.onmessage = null;
            ws.onerror = null;
            ws.onclose = null;
          }
        };
        const fail = (error) => {
          if (settled) return;
          settled = true;
          cleanup();
          try { ws?.close?.(); } catch (_) {}
          reject(error instanceof Error ? error : new Error(String(error || "Sendspin connection failed")));
        };
        try {
          this._debugLog("info", "[Homeii Sendspin] opening proxy socket", wsUrl);
          ws = new WebSocketCtor(wsUrl);
          ws.binaryType = "arraybuffer";
        } catch (error) {
          fail(error);
          return;
        }
        timeout = setTimeout(() => fail(new Error(this._localText("Timed out connecting to Sendspin.", "החיבור ל-Sendspin לקח יותר מדי זמן."))), 10000);
        ws.onopen = () => {
          try {
            this._debugLog("info", "[Homeii Sendspin] sending auth to proxy");
            ws.send(JSON.stringify({ type: "auth", token: this._maToken, client_id: playerId }));
          } catch (error) {
            fail(error);
          }
        };
        ws.onmessage = (event) => {
          if (settled) return;
          if (typeof event?.data === "string") {
            try {
              const message = JSON.parse(event.data);
              this._debugLog("info", "[Homeii Sendspin] proxy auth response", message?.type || message);
              if (message?.type === "auth_invalid" || message?.type === "auth_failed" || message?.error) {
                fail(new Error(this._localText("Music Assistant rejected the Sendspin token.", "Music Assistant דחה את ה-token של Sendspin.")));
                return;
              }
            } catch (_) {
              this._debugLog("info", "[Homeii Sendspin] proxy auth response", event.data);
            }
          } else {
            this._debugLog("info", "[Homeii Sendspin] proxy auth response", "binary");
          }
          settled = true;
          cleanup();
          resolve(ws);
        };
        ws.onerror = () => fail(new Error(this._localText("Could not open the Sendspin WebSocket.", "לא הצלחתי לפתוח חיבור WebSocket ל-Sendspin.")));
        ws.onclose = () => fail(new Error(this._localText("Sendspin closed the connection before the player was ready.", "Sendspin סגר את החיבור לפני שהנגן היה מוכן.")));
      });
    }

    _createLocalSendspinBridge(ws) {
      const listeners = { open: new Set(), message: new Set(), error: new Set(), close: new Set() };
      const handlers = { open: null, message: null, error: null, close: null };
      const dispatch = (type, event) => {
        const handler = handlers[type];
        if (typeof handler === "function") handler.call(bridge, event);
        listeners[type]?.forEach((listener) => {
          if (typeof listener === "function") listener.call(bridge, event);
          else if (listener && typeof listener.handleEvent === "function") listener.handleEvent(event);
        });
      };
      const emitLateOpenIfNeeded = (handler) => {
        if (handler && bridge._isOpen) {
          setTimeout(() => handler.call(bridge, new Event("open")), 0);
        }
      };
      const bridge = {
        CONNECTING: 0,
        OPEN: 1,
        CLOSING: 2,
        CLOSED: 3,
        _isOpen: ws.readyState === WebSocket.OPEN,
        get onopen() { return handlers.open; },
        set onopen(handler) {
          handlers.open = handler;
          emitLateOpenIfNeeded(handler);
        },
        get onmessage() { return handlers.message; },
        set onmessage(handler) { handlers.message = handler; },
        get onerror() { return handlers.error; },
        set onerror(handler) { handlers.error = handler; },
        get onclose() { return handlers.close; },
        set onclose(handler) { handlers.close = handler; },
        get readyState() { return ws.readyState; },
        get binaryType() { return ws.binaryType || "arraybuffer"; },
        set binaryType(value) { try { ws.binaryType = value; } catch (_) {} },
        get bufferedAmount() { return ws.bufferedAmount || 0; },
        get extensions() { return ws.extensions || ""; },
        get protocol() { return ws.protocol || ""; },
        get url() { return ws.url || ""; },
        send: (data) => {
          if (ws.readyState !== WebSocket.OPEN) {
            this._debugLog("warn", "[Homeii Sendspin] bridge send ignored, socket not open");
            return;
          }
          if (data instanceof Blob) {
            data.arrayBuffer().then((buffer) => ws.send(buffer));
          } else {
            if (typeof data === "string") {
              try {
                const message = JSON.parse(data);
                this._debugLog("info", "[Homeii Sendspin] client message", message?.type || message);
              } catch (_) {}
            }
            ws.send(data);
          }
        },
        close: (code, reason) => ws.close(code, reason),
        addEventListener: (type, listener) => {
          if (listeners[type]) listeners[type].add(listener);
          if (type === "open" && bridge._isOpen && typeof listener === "function") {
            setTimeout(() => listener.call(bridge, new Event("open")), 0);
          }
        },
        removeEventListener: (type, listener) => {
          if (listeners[type]) listeners[type].delete(listener);
        },
        dispatchEvent: () => false,
      };
      ws.onopen = (event) => {
        bridge._isOpen = true;
        dispatch("open", event || new Event("open"));
      };
      ws.onmessage = (event) => {
        if (typeof event?.data === "string") {
          try {
            const message = JSON.parse(event.data);
            this._debugLog("info", "[Homeii Sendspin] server message", message?.type || message);
          } catch (_) {}
        }
        dispatch("message", event);
      };
      ws.onerror = (event) => {
        this._debugLog("error", "[Homeii Sendspin] bridge socket error", event);
        dispatch("error", event || new Event("error"));
      };
      ws.onclose = (event) => {
        bridge._isOpen = false;
        this._debugLog("warn", "[Homeii Sendspin] bridge socket closed", event?.code, event?.reason);
        dispatch("close", event || new CloseEvent("close"));
        this._handleLocalSendspinSocketClosed(event || new Event("close"));
      };
      return bridge;
    }

    _installLocalSendspinInterceptor() {
      if (typeof window === "undefined" || !window.WebSocket) return null;
      if (window.__homeiiSendspinInterceptorV1?.installed) {
        return window.__homeiiSendspinInterceptorV1.original;
      }
      const OriginalWebSocket = window.WebSocket;
      const WrappedWebSocket = function(url, protocols) {
        const urlText = String(url || "");
        const pendingBridge = window.__homeiiSendspinPendingBridgeV1;
        if (urlText.includes("/sendspin") && pendingBridge) {
          this._debugLog("info", "[Homeii Sendspin] using prepared bridge for", urlText);
          window.__homeiiSendspinPendingBridgeV1 = null;
          return pendingBridge;
        }
        return protocols === undefined ? new OriginalWebSocket(url) : new OriginalWebSocket(url, protocols);
      };
      WrappedWebSocket.CONNECTING = OriginalWebSocket.CONNECTING;
      WrappedWebSocket.OPEN = OriginalWebSocket.OPEN;
      WrappedWebSocket.CLOSING = OriginalWebSocket.CLOSING;
      WrappedWebSocket.CLOSED = OriginalWebSocket.CLOSED;
      WrappedWebSocket.prototype = OriginalWebSocket.prototype;
      window.WebSocket = WrappedWebSocket;
      window.__homeiiSendspinInterceptorV1 = { installed: true, original: OriginalWebSocket };
      this._debugLog("info", "[Homeii Sendspin] WebSocket interceptor installed");
      return OriginalWebSocket;
    }

    _restoreLocalSendspinInterceptor() {
      if (typeof window === "undefined") return;
      const installed = window.__homeiiSendspinInterceptorV1;
      if (installed?.installed && installed.original) {
        try { window.WebSocket = installed.original; } catch (_) {}
      }
      try { window.__homeiiSendspinPendingBridgeV1 = null; } catch (_) {}
      try { delete window.__homeiiSendspinInterceptorV1; } catch (_) {
        window.__homeiiSendspinInterceptorV1 = null;
      }
    }

    _prepareLocalSendspinSession(ws) {
      const bridge = this._createLocalSendspinBridge(ws);
      this._installLocalSendspinInterceptor();
      window.__homeiiSendspinPendingBridgeV1 = bridge;
      return bridge;
    }

    _ensureLocalSendspinAudioElement() {
      const session = this._localSendspinGlobalSession();
      let audio = session?.audioElement || null;
      if (audio && !audio.isConnected) audio = null;
      if (!audio && typeof document !== "undefined") audio = document.getElementById("homeiiLocalAudio");
      if (!audio) {
        audio = document.createElement("audio");
        audio.id = "homeiiLocalAudio";
        audio.className = "homeii-local-audio";
        audio.setAttribute("playsinline", "");
        audio.setAttribute("webkit-playsinline", "");
        audio.setAttribute("aria-hidden", "true");
        document.body?.appendChild(audio);
      }
      audio.controls = false;
      audio.preload = "auto";
      audio.autoplay = true;
      if (session) session.audioElement = audio;
      return audio;
    }

    _supportsMediaSession() {
      return typeof navigator !== "undefined" && !!navigator.mediaSession;
    }

    _resetLocalSendspinMediaSession() {
      if (!this._supportsMediaSession()) return;
      const mediaSession = navigator.mediaSession;
      try { mediaSession.metadata = null; } catch (_) {}
      try { mediaSession.playbackState = "none"; } catch (_) {}
      ["play", "pause", "stop", "previoustrack", "nexttrack", "seekbackward", "seekforward", "seekto"].forEach((action) => {
        try { mediaSession.setActionHandler(action, null); } catch (_) {}
      });
    }

    _syncLocalSendspinMediaSession(player = this._getSelectedPlayer(), queueItem = this._state.maQueueState?.current_item || null) {
      if (!this._supportsMediaSession()) return;
      const mediaSession = navigator.mediaSession;
      if (!player || !this._isLocalSendspinPlayer(player)) {
        this._resetLocalSendspinMediaSession();
        return;
      }
      const media = queueItem?.media_item || {};
      const title = media?.name || queueItem?.name || player.attributes?.media_title || this._i18n("ui.nothing_playing");
      const artist = Array.isArray(media?.artists)
        ? media.artists.map((entry) => entry?.name).filter(Boolean).join(", ")
        : (queueItem?.media_artist || player.attributes?.media_artist || "");
      const album = media?.album?.name || queueItem?.album || player.attributes?.media_album_name || "";
      const art = this._currentArtworkUrl(player, queueItem, 512) || "";
      try {
        if (typeof window.MediaMetadata === "function") {
          mediaSession.metadata = new window.MediaMetadata({
            title,
            artist,
            album,
            artwork: art ? [
              { src: art, sizes: "96x96", type: "image/png" },
              { src: art, sizes: "192x192", type: "image/png" },
              { src: art, sizes: "256x256", type: "image/png" },
              { src: art, sizes: "512x512", type: "image/png" },
            ] : [],
          });
        }
      } catch (_) {}
      try {
        mediaSession.playbackState = player.state === "playing" ? "playing" : (player.state === "paused" ? "paused" : "none");
      } catch (_) {}
      const bind = (action, handler) => {
        try { mediaSession.setActionHandler(action, handler); } catch (_) {}
      };
      bind("play", () => this._handleLocalSendspinMediaAction("play"));
      bind("pause", () => this._handleLocalSendspinMediaAction("pause"));
      bind("stop", () => this._handleLocalSendspinMediaAction("stop"));
      bind("previoustrack", () => this._handleLocalSendspinMediaAction("previous"));
      bind("nexttrack", () => this._handleLocalSendspinMediaAction("next"));
      bind("seekbackward", null);
      bind("seekforward", null);
      bind("seekto", null);
    }

    async _handleLocalSendspinMediaAction(action = "") {
      const player = this._getSelectedPlayer();
      if (!player || !this._isLocalSendspinPlayer(player)) return;
      const command = String(action || "").toLowerCase();
      try {
        if (command === "next" || command === "previous") {
          await this._playerCmdFor(player.entity_id, command);
        } else if (command === "stop") {
          await this._stopPlayer(player.entity_id);
        } else if (command === "play" || command === "pause") {
          const directCommand = command === "play" ? "players/cmd/play" : "players/cmd/pause";
          if (this._isDirectMaPlayer(player)) {
            await this._callDirectMaPlayerCommand(player, directCommand);
          } else {
            await this._hass?.callService?.("media_player", command === "play" ? "media_play" : "media_pause", { entity_id: player.entity_id });
          }
        }
        await this._refreshDirectMaPlayers().catch(() => {});
        setTimeout(() => this._ensureQueueSnapshot(true), 450);
      } catch (error) {
        this._debugLog("warn", "[Homeii Sendspin] media session action failed", command, error);
      }
    }

    _clearLocalSendspinDiscoveryTimers() {
      (this._localSendspinDiscoveryTimers || []).forEach((timer) => clearTimeout(timer));
      this._localSendspinDiscoveryTimers = [];
    }

    _scheduleThisDevicePlayerDiscovery() {
      this._clearLocalSendspinDiscoveryTimers();
      const delays = [500, 1500, 3000, 6000, 10000];
      this._localSendspinDiscoveryTimers = delays.map((delay) => setTimeout(() => {
        this._loadPlayers();
        this._refreshDirectMaPlayers({ renderMenu: true }).catch(() => {});
        if (this._state.menuOpen && typeof this._renderMobileMenu === "function") {
          this._renderMobileMenu().catch(() => {});
        }
      }, delay));
    }

    _scheduleLocalSendspinReconnect(reason = "lifecycle", delayMs = 900) {
      this._adoptLocalSendspinGlobalSession();
      if (!this._isLocalSendspinDesired()) return;
      if (!this._maBrowserUrl() || !this._maToken) return;
      if (this._localSendspinConnecting || this._localSendspinConnected) return;
      if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
      this._clearLocalSendspinReconnectTimer();
      this._localSendspinReconnectTimer = setTimeout(() => {
        this._localSendspinReconnectTimer = null;
        this._adoptLocalSendspinGlobalSession();
        if (!this._isLocalSendspinDesired() || this._localSendspinConnecting || this._localSendspinConnected) return;
        if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
        this._debugLog("info", "[Homeii Sendspin] reconnecting local player", reason);
        this._startLocalSendspinPlayer({ automatic: true }).catch((error) => {
          this._debugLog("warn", "[Homeii Sendspin] automatic reconnect failed", error);
        });
      }, Math.max(0, Number(delayMs) || 0));
    }

    _handleLocalSendspinLifecycle(event = null) {
      if (!this._isLocalSendspinDesired()) return;
      this._cancelLocalSendspinDisconnect();
      const type = event?.type || "lifecycle";
      if (typeof document !== "undefined" && document.visibilityState === "hidden") {
        this._state.localSendspinStatus = this._localSendspinConnected ? "connected" : "suspended";
        return;
      }
      this._scheduleLocalSendspinReconnect(type, type === "pageshow" ? 350 : 800);
    }

    _attachLocalSendspinLifecycleListeners() {
      if (typeof window === "undefined" || typeof document === "undefined") return;
      const session = this._localSendspinGlobalSession();
      if (!session) return;
      session.controller = this;
      if (session.lifecycleListening) {
        this._localSendspinLifecycleListening = true;
        return;
      }
      session.lifecycleHandler = (event) => {
        const activeSession = this._localSendspinGlobalSession(false);
        const controller = activeSession?.controller || this;
        if (controller && typeof controller._handleLocalSendspinLifecycle === "function") {
          controller._handleLocalSendspinLifecycle(event);
        }
      };
      document.addEventListener("visibilitychange", session.lifecycleHandler);
      window.addEventListener("pageshow", session.lifecycleHandler);
      window.addEventListener("focus", session.lifecycleHandler);
      window.addEventListener("online", session.lifecycleHandler);
      session.lifecycleListening = true;
      this._localSendspinLifecycleListening = true;
    }

    _detachLocalSendspinLifecycleListeners() {
      if (typeof window === "undefined" || typeof document === "undefined") return;
      const session = this._localSendspinGlobalSession(false);
      if (!session?.lifecycleListening || !session.lifecycleHandler) {
        this._localSendspinLifecycleListening = false;
        return;
      }
      if (this._isLocalSendspinDesired() || session.desired) {
        this._localSendspinLifecycleListening = false;
        return;
      }
      document.removeEventListener("visibilitychange", session.lifecycleHandler);
      window.removeEventListener("pageshow", session.lifecycleHandler);
      window.removeEventListener("focus", session.lifecycleHandler);
      window.removeEventListener("online", session.lifecycleHandler);
      session.lifecycleListening = false;
      session.lifecycleHandler = null;
      if (session.controller === this) session.controller = null;
      this._localSendspinLifecycleListening = false;
    }

    _handleLocalSendspinSocketClosed(event = null) {
      if (this._localSendspinSuppressClose) return;
      if (this._localSendspinConnecting) return;
      if (!this._localSendspinConnected && !this._localSendspinPlayer && !this._localSendspinSocket) return;
      const desired = this._isLocalSendspinDesired();
      this._localSendspinConnected = false;
      this._localSendspinSocket = null;
      this._state.localSendspinStatus = desired ? "reconnecting" : "idle";
      const session = this._syncLocalSendspinGlobalSession();
      const controller = session?.controller && typeof session.controller._scheduleLocalSendspinReconnect === "function"
        ? session.controller
        : this;
      if (desired) {
        controller._scheduleLocalSendspinReconnect(event?.type || "socket_close", 1200);
      }
    }

    _cancelLocalSendspinDisconnect() {
      if (this._localSendspinDisconnectTimer) {
        clearTimeout(this._localSendspinDisconnectTimer);
        this._localSendspinDisconnectTimer = null;
      }
    }

    _scheduleLocalSendspinStop(reason = "shutdown", delayMs = 30000) {
      this._cancelLocalSendspinDisconnect();
      if (!this._localSendspinPlayer && !this._localSendspinSocket) return;
      this._localSendspinDisconnectTimer = setTimeout(() => {
        this._localSendspinDisconnectTimer = null;
        if (this.isConnected) return;
        this._stopLocalSendspinPlayer(reason);
      }, Math.max(0, Number(delayMs) || 0));
    }

    _stopLocalSendspinPlayer(reason = "shutdown") {
      this._cancelLocalSendspinDisconnect();
      if (reason === "user_request") {
        this._setLocalSendspinDesired(false);
        this._clearLocalSendspinReconnectTimer();
      }
      this._clearLocalSendspinDiscoveryTimers();
      if (typeof window !== "undefined") window.__homeiiSendspinPendingBridgeV1 = null;
      const suppressClose = ["another_server", "shutdown", "restart", "user_request"].includes(reason);
      if (suppressClose) this._localSendspinSuppressClose = true;
      if (this._localSendspinPlayer) {
        const safeReason = ["another_server", "shutdown", "restart", "user_request"].includes(reason) ? reason : "shutdown";
        try { this._localSendspinPlayer.disconnect?.(safeReason); } catch (_) {}
      }
      if (this._localSendspinSocket) {
        try {
          if (this._localSendspinSocket.readyState === WebSocket.OPEN || this._localSendspinSocket.readyState === WebSocket.CONNECTING) {
            this._localSendspinSocket.close();
          }
        } catch (_) {}
      }
      this._localSendspinPlayer = null;
      this._localSendspinSocket = null;
      this._localSendspinConnected = false;
      this._localSendspinState = null;
      this._state.localSendspinStatus = this._isLocalSendspinDesired() ? "reconnecting" : "idle";
      this._syncLocalSendspinGlobalSession();
      if (reason === "user_request") {
        this._clearLocalSendspinGlobalRuntime();
        this._detachLocalSendspinLifecycleListeners();
      }
      if (suppressClose) setTimeout(() => { this._localSendspinSuppressClose = false; }, 1000);
    }

    async _startLocalSendspinPlayer(options = {}) {
      const automatic = !!options.automatic;
      this._adoptLocalSendspinGlobalSession();
      if (!automatic) this._setLocalSendspinDesired(true);
      if (this._localSendspinConnecting) {
        if (!automatic) this._toast(this._localText("Local player is already connecting.", "הנגן המקומי כבר בתהליך התחברות."));
        return;
      }
      if (this._localSendspinPlayer && this._localSendspinConnected) {
        this._state.awaitingThisDevicePlayer = true;
        this._scheduleThisDevicePlayerDiscovery();
        if (!automatic) this._toastSuccess(this._localText("Local Sendspin player is connected.", "נגן Sendspin המקומי מחובר."));
        return;
      }
      this._clearLocalSendspinReconnectTimer();
      this._localSendspinConnecting = true;
      this._state.localSendspinStatus = "connecting";
      this._syncLocalSendspinGlobalSession();
      if (this._state.menuOpen && typeof this._renderMobileMenu === "function") this._renderMobileMenu().catch(() => {});
      try {
        this._assertLocalSendspinConfig();
        const knownBrowserPlayerIds = Array.isArray(this._state.knownBrowserPlayerIds) && this._state.knownBrowserPlayerIds.length
          ? [...this._state.knownBrowserPlayerIds]
          : this._getBrowserPlayers().map((p) => p.entity_id);
        const playerId = this._getLocalSendspinPlayerId();
        const module = await this._loadLocalSendspinModule();
        const SendspinPlayer = module?.SendspinPlayer;
        if (typeof SendspinPlayer !== "function") {
          throw new Error(this._localText("The local Sendspin module is missing SendspinPlayer.", "מודול Sendspin המקומי לא כולל את SendspinPlayer."));
        }
        this._stopLocalSendspinPlayer("restart");
        this._restoreLocalSendspinInterceptor();
        const webSocket = await this._openAuthenticatedSendspinSocket(playerId);
        this._localSendspinSocket = webSocket;
        const audioElement = this._ensureLocalSendspinAudioElement();
        let syncDelay = 0;
        try { syncDelay = Number(localStorage.getItem(this._localSendspinSyncDelayStorageKey()) || 0) || 0; } catch (_) {}
        this._localSendspinPlayer = new SendspinPlayer({
          playerId,
          webSocket,
          audioElement,
          clientName: "HOMEii Flow",
          codecs: ["flac", "pcm"],
          syncDelay: syncDelay || undefined,
          correctionMode: "quality-local",
          onStateChange: (state) => {
            this._localSendspinState = state;
            this._syncLocalSendspinGlobalSession();
          },
          onDelayCommand: (delayMs) => {
            try { localStorage.setItem(this._localSendspinSyncDelayStorageKey(), String(delayMs)); } catch (_) {}
          },
        });
        await Promise.race([
          this._localSendspinPlayer.connect(),
          new Promise((_, reject) => setTimeout(() => reject(new Error(this._localText(
            "Timed out waiting for the local Sendspin player to start.",
            "ההפעלה של נגן Sendspin המקומי לקחה יותר מדי זמן."
          ))), 15000)),
        ]);
        this._localSendspinConnected = true;
        this._state.localSendspinStatus = "connected";
        this._state.localSendspinDisconnecting = false;
        this._state.awaitingThisDevicePlayer = true;
        this._state.knownBrowserPlayerIds = knownBrowserPlayerIds;
        this._syncLocalSendspinGlobalSession();
        if (!automatic) this._toastSuccess(this._localText("Local Sendspin player connected from this card.", "נגן Sendspin המקומי חובר מתוך הכרטיס."));
        this._scheduleThisDevicePlayerDiscovery();
        this._refreshDirectMaPlayers({ renderMenu: true }).catch(() => {});
      } catch (error) {
        this._stopLocalSendspinPlayer("shutdown");
        this._state.localSendspinDisconnecting = false;
        this._state.awaitingThisDevicePlayer = false;
        this._state.controlRoomRevealThisDevicePending = false;
        this._state.localSendspinStatus = "error";
        if (automatic) this._debugLog("warn", "[Homeii Sendspin] automatic local reconnect failed", error);
        else this._toastError(error?.message || this._localText("Local Sendspin connection failed.", "חיבור Sendspin המקומי נכשל."));
      } finally {
        this._localSendspinConnecting = false;
        this._syncLocalSendspinGlobalSession();
        if (this._state.menuOpen && typeof this._renderMobileMenu === "function") this._renderMobileMenu().catch(() => {});
      }
    }

    _isLikelyBrowserPlayer(player) {
      return HomeiiPlayersFoundation.isLikelyBrowserPlayer(player);
    }

    _isMusicAssistantPlayer(player = null) {
      const entityId = String(player?.entity_id || "").trim();
      const knownPlayablePlayer = !!entityId && (this._state.players || []).some((entry) => entry?.entity_id === entityId);
      return !!(player && (
        this._isDirectMaPlayer(player)
        || knownPlayablePlayer
        || HomeiiPlayersFoundation.isMusicAssistantPlayer(player, this._hass?.entities?.[player.entity_id])
      ));
    }

    _getBrowserPlayers(players = this._state.players || []) {
      return HomeiiPlayersFoundation.getBrowserPlayers(players);
    }

    _isLocalSendspinPlayer(player = null) {
      if (!player) return false;
      const attrs = player.attributes || {};
      const raw = player.__homeiiRawPlayer || {};
      const localPlayerId = this._peekLocalSendspinPlayerId();
      if (!localPlayerId) return false;
      const localId = localPlayerId.toLowerCase();
      const identityValues = [
        player.entity_id,
        attrs.mass_player_id,
        attrs.player_id,
        attrs.player_id_short,
        attrs.id,
      ].filter(Boolean).map((value) => String(value || "").trim().toLowerCase());
      const displayHaystack = [
        attrs.friendly_name,
        attrs.name,
        attrs.display_name,
        attrs.client_name,
        raw.name,
        raw.display_name,
        raw.friendly_name,
      ].filter(Boolean).join(" ").toLowerCase();
      const isHomeiiSendspin = displayHaystack.includes("homeii sendspin") || (displayHaystack.includes("homeii") && displayHaystack.includes("sendspin"));
      const isHomeiiFlow = displayHaystack.includes("homeii flow") || (displayHaystack.includes("homeii") && displayHaystack.includes("flow"));
      return identityValues.some((value) => value === localId || value.endsWith(`_${localId}`) || value.endsWith(`.${localId}`))
        && (isHomeiiSendspin || isHomeiiFlow);
    }

    _isAvailableThisDevicePlayer(player = null) {
      if (!player) return false;
      if (this._isLocalSendspinPlayer(player)) {
        this._adoptLocalSendspinGlobalSession();
        if (!this._isLocalSendspinDesired() && !this._localSendspinConnected && !this._localSendspinConnecting) return false;
      }
      const state = String(player.state || "").toLowerCase();
      const attrs = player.attributes || {};
      const raw = player.__homeiiRawPlayer || {};
      if (state === "unavailable" || state === "off") return false;
      if (attrs.available === false || raw.available === false || raw.powered === false) return false;
      return true;
    }

    _isRememberableThisDevicePlayer(player = null) {
      if (!this._isAvailableThisDevicePlayer(player)) return false;
      return this._isLocalSendspinPlayer(player);
    }

    _isExternalBrowserPlayer(player = null) {
      return !!(player && this._isLikelyBrowserPlayer(player) && !this._isLocalSendspinPlayer(player));
    }

    _getThisDevicePlayer(players = this._state.players || []) {
      const sourcePlayers = Array.isArray(players) ? players : [];
      const localPlayer = sourcePlayers.find((player) => this._isLocalSendspinPlayer(player) && this._isAvailableThisDevicePlayer(player));
      if (localPlayer) return localPlayer;
      const rememberedPlayer = HomeiiPlayersFoundation.getThisDevicePlayer(sourcePlayers, this._getRememberedThisDevicePlayerId());
      if (this._isRememberableThisDevicePlayer(rememberedPlayer)) return rememberedPlayer;
      if (rememberedPlayer) this._rememberThisDevicePlayer("");
      return null;
    }

    _directMaEntityId(playerId = "") {
      const slug = String(playerId || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_]+/g, "_")
        .replace(/^_+|_+$/g, "")
        || "player";
      return `media_player.homeii_direct_${slug}`;
    }

    _isDirectMaEntityId(entityId = "") {
      return String(entityId || "").startsWith("media_player.homeii_direct_");
    }

    _directMaPlayerId(playerOrEntityId = null) {
      if (!playerOrEntityId) return "";
      if (typeof playerOrEntityId === "string") {
        const directPlayer = (this._directMaPlayers || []).find((player) => player?.entity_id === playerOrEntityId)
          || (this._state.players || []).find((player) => player?.entity_id === playerOrEntityId && this._isDirectMaPlayer(player));
        return String(directPlayer?.attributes?.mass_player_id || directPlayer?.attributes?.player_id || directPlayer?.__homeiiDirectMaPlayerId || "").trim();
      }
      const attrs = playerOrEntityId.attributes || {};
      return String(attrs.mass_player_id || attrs.player_id || attrs.id || playerOrEntityId.__homeiiDirectMaPlayerId || "").trim();
    }

    _directMaQueueId(playerOrEntityId = null) {
      const player = typeof playerOrEntityId === "string" ? this._playerByEntityId(playerOrEntityId) : playerOrEntityId;
      const attrs = player?.attributes || {};
      return String(attrs.active_queue || attrs.queue_id || attrs.mass_player_id || attrs.player_id || this._directMaPlayerId(playerOrEntityId)).trim();
    }

    _isDirectMaPlayer(playerOrEntityId = null) {
      if (!playerOrEntityId) return false;
      if (typeof playerOrEntityId === "string") {
        if (this._isDirectMaEntityId(playerOrEntityId)) return true;
        return this._isDirectMaPlayer(this._playerByEntityId(playerOrEntityId));
      }
      return !!playerOrEntityId.__homeiiDirectMa
        || !!playerOrEntityId.attributes?.homeii_direct_ma
        || this._isDirectMaEntityId(playerOrEntityId.entity_id);
    }

    _normalizeDirectMaPlaybackState(state = "", available = true, powered = true) {
      if (available === false) return "unavailable";
      if (powered === false) return "off";
      const value = String(state || "").trim().toLowerCase();
      if (value === "playing" || value === "paused" || value === "idle" || value === "off") return value;
      return "idle";
    }

    _normalizeDirectMaPlayer(rawPlayer = null) {
      const raw = rawPlayer?.state && rawPlayer.state.player_id ? rawPlayer.state : rawPlayer;
      if (!raw || typeof raw !== "object") return null;
      const playerId = String(raw.player_id || raw.id || raw.playerId || "").trim();
      if (!playerId) return null;
      const currentMedia = raw.current_media || raw.media || {};
      const deviceInfo = raw.device_info || {};
      const volumeLevel = Number(raw.volume_level ?? raw.group_volume);
      const normalizedVolume = Number.isFinite(volumeLevel)
        ? (volumeLevel > 1 ? volumeLevel / 100 : volumeLevel)
        : 0;
      const updatedAt = Number(raw.elapsed_time_last_updated || currentMedia.elapsed_time_last_updated || 0);
      const mediaUpdatedAt = updatedAt > 0 ? new Date(updatedAt * 1000).toISOString() : undefined;
      const activeQueue = String(raw.active_queue || raw.queue_id || currentMedia.source_id || playerId).trim();
      const name = raw.name || raw.display_name || raw.friendly_name || currentMedia.title || playerId;
      const attrs = {
        ...(raw.extra_attributes || {}),
        friendly_name: name,
        app_id: "music_assistant",
        source: raw.provider || "music_assistant",
        provider: raw.provider || "",
        provider_name: raw.provider || "",
        mass_player_id: playerId,
        player_id: playerId,
        active_queue: activeQueue,
        queue_id: activeQueue,
        mass_player_type: raw.type || "",
        player_type: raw.type || "",
        model: deviceInfo.model || "",
        manufacturer: deviceInfo.manufacturer || "",
        volume_level: Math.max(0, Math.min(1, normalizedVolume || 0)),
        is_volume_muted: !!(raw.volume_muted || raw.group_volume_muted),
        shuffle: !!raw.shuffle_enabled,
        repeat: raw.repeat_mode || raw.repeat || "off",
        media_content_id: currentMedia.uri || "",
        media_content_type: currentMedia.media_type || "track",
        media_title: currentMedia.title || currentMedia.name || "",
        media_artist: currentMedia.artist || "",
        media_album_name: currentMedia.album || "",
        media_duration: currentMedia.duration || 0,
        media_position: raw.elapsed_time ?? currentMedia.elapsed_time ?? 0,
        media_position_updated_at: mediaUpdatedAt,
        entity_picture: currentMedia.image_url || "",
        entity_picture_local: currentMedia.image_url || "",
        media_image_url: currentMedia.image_url || "",
        media_image: currentMedia.image_url || "",
        media_palette: currentMedia.palette || null,
        current_media_palette: currentMedia.palette || null,
        current_media: currentMedia,
        supported_features: raw.supported_features || [],
        available: raw.available !== false,
        powered: raw.powered !== false,
        homeii_direct_ma: true,
      };
      return {
        entity_id: this._directMaEntityId(playerId),
        state: this._normalizeDirectMaPlaybackState(raw.playback_state || raw.state, raw.available, raw.powered),
        attributes: attrs,
        __homeiiDirectMa: true,
        __homeiiDirectMaPlayerId: playerId,
        __homeiiRawPlayer: raw,
      };
    }

    _haHasDirectMaPlayer(player = null, haEntities = []) {
      const playerId = this._directMaPlayerId(player);
      if (!playerId) return false;
      return (Array.isArray(haEntities) ? haEntities : []).some((entity) => {
        const attrs = entity?.attributes || {};
        return [attrs.mass_player_id, attrs.player_id, attrs.id]
          .map((value) => String(value || "").trim())
          .some((value) => value === playerId);
      });
    }

    _mergeDirectMaPlayers(haEntities = []) {
      const source = Array.isArray(this._directMaPlayers) ? this._directMaPlayers : [];
      return source.filter((player) => {
        if (!player?.entity_id) return false;
        if (haEntities.some((entity) => entity?.entity_id === player.entity_id)) return false;
        return !this._haHasDirectMaPlayer(player, haEntities);
      });
    }

    _directMaQueueOption(enqueue = "play") {
      const value = String(enqueue || "play").toLowerCase();
      if (value === "add") return "add";
      if (value === "next") return "next";
      if (value === "replace_next") return "replace_next";
      return "replace";
    }

    async _refreshDirectMaPlayers(options = {}) {
      if (this._directMaPlayersRefreshPromise) return this._directMaPlayersRefreshPromise;
      this._directMaPlayersRefreshPromise = (async () => {
        try {
          const rawPlayers = await this._callDirectMaCommand("players/all", {
            return_unavailable: true,
            return_disabled: false,
            return_protocol_players: true,
          });
          const normalized = (Array.isArray(rawPlayers) ? rawPlayers : [])
            .map((player) => this._normalizeDirectMaPlayer(player))
            .filter(Boolean)
            .filter((player) => this._isLocalSendspinPlayer(player) && this._isAvailableThisDevicePlayer(player));
          this._directMaPlayers = normalized;
          this._loadPlayers();
          const thisDevicePlayer = this._getThisDevicePlayer(this._state.players || []);
          if (this._state.controlRoomRevealThisDevicePending && thisDevicePlayer?.entity_id) {
            this._revealControlRoomThisDevicePlayer(thisDevicePlayer.entity_id, { sync: false });
          }
          if (options.renderMenu && this._state.menuOpen && typeof this._renderMobileMenu === "function") {
            this._renderMobileMenu().catch(() => {});
          }
          if (this._state.controlRoomOpen) this._syncControlRoomUi({ force: true });
          this._renderPlayerSummary();
          this._syncBrandPlayingState();
          this._syncNowPlayingUI();
          return normalized;
        } catch (error) {
          this._debugLog("warn", "[Homeii Sendspin] direct MA player refresh failed", error);
          return this._directMaPlayers || [];
        } finally {
          this._directMaPlayersRefreshPromise = null;
        }
      })();
      return this._directMaPlayersRefreshPromise;
    }

    async _callDirectMaPlayerCommand(playerOrEntityId, command, args = {}) {
      const playerId = this._directMaPlayerId(playerOrEntityId);
      if (!playerId) throw new Error("Direct Music Assistant player was not found");
      return this._callDirectMaCommand(command, { player_id: playerId, ...args });
    }

    async _playMediaOnDirectMaPlayer(entityId, uri, mediaType = "album", enqueue = "play", options = {}) {
      const player = this._playerByEntityId(entityId);
      const queueId = this._directMaQueueId(player || entityId);
      if (!queueId) throw new Error("Direct Music Assistant player is not ready");
      if (enqueue === "shuffle") {
        await this._callDirectMaCommand("player_queues/shuffle", { queue_id: queueId, shuffle_enabled: true });
      }
      await this._callDirectMaCommand("player_queues/play_media", {
        queue_id: queueId,
        media: uri,
        option: this._directMaQueueOption(enqueue),
        radio_mode: !!options.radioMode,
      });
      if (!options.silent) {
        const label = this._mediaFeedbackLabel(uri, options.label || "");
        this._toastMediaQueued(label, player?.attributes?.friendly_name || entityId);
      }
      if (entityId === this._state.selectedPlayer) {
        this._refreshDirectMaPlayers().catch(() => {});
        setTimeout(() => this._ensureQueueSnapshot(true), 600);
        setTimeout(() => this._ensureQueueSnapshot(true), 1600);
      }
      return true;
    }

    _connectThisDevicePlayer() {
      this._state.localSendspinDisconnecting = false;
      this._state.localSendspinStatus = "connecting";
      if (this._state.menuOpen && typeof this._renderMobileMenu === "function") this._renderMobileMenu().catch(() => {});
      this._attachLocalSendspinLifecycleListeners();
      const selectedPlayer = this._getSelectedPlayer();
      if (this._isExternalBrowserPlayer(selectedPlayer)) {
        this._state.selectedPlayer = null;
        this._state.hasAutoSelectedPlayer = false;
      }
      this._rememberThisDevicePlayer("");
      this._state.awaitingThisDevicePlayer = true;
      this._state.controlRoomRevealThisDevicePending = true;
      this._state.knownBrowserPlayerIds = this._getBrowserPlayers().map((p) => p.entity_id);
      this._startLocalSendspinPlayer().catch((error) => {
        this._state.localSendspinDisconnecting = false;
        this._state.awaitingThisDevicePlayer = false;
        this._state.controlRoomRevealThisDevicePending = false;
        this._toastError(error?.message || this._localText("Local Sendspin connection failed.", "חיבור Sendspin המקומי נכשל."));
      });
    }

    _disconnectThisDevicePlayer() {
      this._adoptLocalSendspinGlobalSession();
      this._state.localSendspinDisconnecting = true;
      this._state.localSendspinStatus = "disconnecting";
      if (this._state.menuOpen && typeof this._renderMobileMenu === "function") this._renderMobileMenu().catch(() => {});
      const selectedPlayer = this._getSelectedPlayer();
      if (this._isLocalSendspinPlayer(selectedPlayer)) {
        this._state.selectedPlayer = null;
        this._state.hasAutoSelectedPlayer = false;
      }
      this._rememberThisDevicePlayer("");
      this._state.awaitingThisDevicePlayer = false;
      this._state.controlRoomRevealThisDevicePending = false;
      this._state.knownBrowserPlayerIds = [];
      this._directMaPlayers = [];
      this._stopLocalSendspinPlayer("user_request");
      this._state.localSendspinDisconnecting = false;
      this._state.localSendspinStatus = "disconnected";
      this._refreshDirectMaPlayers({ renderMenu: true }).catch(() => {});
      this._loadPlayers();
      if (this._state.controlRoomOpen) this._syncControlRoomUi({ force: true });
      if (this._state.menuOpen && typeof this._renderMobileMenu === "function") this._renderMobileMenu().catch(() => {});
      this._toastSuccess(this._i18n("ui.this_device_player_disconnected"));
    }

    _selectPlayer(entityId, manual = false) {
      const pinnedEntities = typeof this._resolvedPinnedPlayerEntities === "function" ? this._resolvedPinnedPlayerEntities() : [];
      const requestedEntityId = String(entityId || "").trim();
      const nextEntityId = manual ? requestedEntityId : (pinnedEntities.length
        ? (pinnedEntities.includes(requestedEntityId) ? requestedEntityId : pinnedEntities[0])
        : requestedEntityId);
      if (!nextEntityId) return;
      const selectedPlayer = this._playerByEntityId(nextEntityId);
      if (!selectedPlayer || !this._isMusicAssistantPlayer(selectedPlayer)) {
        this._handleMusicAssistantIssue(this._musicAssistantRequiredMessage());
        if (manual) this._toastError(this._musicAssistantRequiredTitle());
        return;
      }
      this._state.selectedPlayer = nextEntityId;
      if (manual) {
        this._setManualFrontPlayer(nextEntityId, this._manualFrontHoldMsForSelection());
      }
      this._syncActivePlayerHelper(selectedPlayer);
      if (manual && this._isRememberableThisDevicePlayer(selectedPlayer)) {
        this._rememberThisDevicePlayer(nextEntityId);
      } else if (manual && selectedPlayer && this._isDirectMaPlayer(selectedPlayer) && !this._isLocalSendspinPlayer(selectedPlayer)) {
        this._rememberThisDevicePlayer("");
      }
      if (manual) this._state.hasAutoSelectedPlayer = true;
      const sel = this.$("playerSel");
      if (sel) sel.value = nextEntityId;
      this._state.maQueueState = null;
      this._state.queueItems = [];
      this._syncNowPlayingUI();
      this._renderPlayerSummary();
      this._syncBrandPlayingState();
      if (this._state.view === "now_playing") this._renderNowPlayingPage();
    }

    _renderPlayerSummary() {
      const selected = this._getSelectedPlayer();
      const title = this.$("selectedPlayerTitle");
      const sub = this.$("selectedPlayerSub");
      if (!selected) {
        if (title) title.textContent = this._musicAssistantRequiredTitle();
        if (sub) sub.textContent = this._state.musicAssistantIssueMessage || this._musicAssistantRequiredMessage();
        this._updateThemeButton();
        return;
      }
      if (title) title.textContent = selected?.attributes?.friendly_name || this._i18n("ui.selected_player");
      if (sub) {
        const label = this._playerStateLabel(selected);
        const track = selected?.attributes?.media_title || "";
        sub.textContent = track ? `${label} · ${track}` : label;
      }
      this._updateThemeButton();
    }

    _updateThemeButton() {
      const themeBtn = this.$("themeToggleBtn");
      if (!themeBtn) return;
      const effective = this._effectiveTheme();
      themeBtn.textContent = effective === "dark" ? "☀" : "🌙";
      themeBtn.title = `${this._i18n("ui.theme")}: ${this._t(effective === "dark" ? "Dark" : "Light")}`;
    }

    _syncBrandPlayingState() {
      const btn = this.$("brandPlayersBtn");
      const player = this._getSelectedPlayer();
      if (!btn) return;
      const isPlaying = player?.state === "playing";
      btn.classList.toggle("playing", !!isPlaying);
      btn.title = this._i18n("ui.open_music_assistant");
    }

    _setPlayerModalHeader(mode = "players") {
      const icon = this.$("playerModalIcon");
      const subtitle = this.$("playerModalSubtitle");
      const selected = this._getSelectedPlayer();
      if (icon) icon.textContent = mode === "transfer" ? "⇆" : "🎵";
      if (!subtitle) return;
      if (mode === "transfer") {
        subtitle.textContent = selected?.attributes?.friendly_name || this._i18n("ui.choose_target_player");
        return;
      }
      const count = (this._state.players || []).length;
      subtitle.textContent = `${count} ${this._i18n("ui.items")}`;
    }

    _renderPlayerModal() {
      this._state.modalMode = "players";
      this.$("playerModalTitle").textContent = this._i18n("ui.choose_player");
      this._setPlayerModalHeader("players");
      const body = this.$("playerModalBody");
      if (!body) return;
      const players = this._state.players || [];
      const activePlayers = players.filter((p) => this._isPlayerActive(p));
      const others = players.filter((p) => !this._isPlayerActive(p));
      const renderGroup = (title, list) => {
        if (!list.length) return "";
        return `
          <div class="modal-section">
            <div class="modal-section-top">
              <div class="modal-section-title">${this._esc(title)}</div>
              <div class="modal-section-badge">${list.length}</div>
            </div>
            <div class="player-list">
              ${list.map((p) => {
                const selected = p.entity_id === this._state.selectedPlayer;
                const stateCls = p.state === "playing" ? "playing" : p.state === "paused" ? "paused" : "idle";
                const name = p.attributes?.friendly_name || p.entity_id;
                const track = p.attributes?.media_title || "";
                const art = this._bestArtworkUrl([p.attributes?.entity_picture_local, p.attributes?.entity_picture], {
                  size: 120,
                  cacheKey: this._currentArtworkCacheKey(p),
                });
                return `
                  <button class="player-card ${stateCls} ${selected ? "active" : ""}" data-modal-player="${this._esc(p.entity_id)}">
                    <span class="player-card-dot"></span>
                    <span class="player-card-art">${art ? `<img src="${this._esc(art)}" alt="">` : this._artPlaceholderHtml("speaker")}</span>
                    <span class="player-card-meta">
                      <span class="player-card-top">
                        <span class="player-card-title">${this._esc(name)}</span>
                        <span class="player-card-badge">${selected ? this._esc(this._i18n("ui.selected_player")) : this._esc(this._playerStateLabel(p))}</span>
                      </span>
                      <span class="player-card-sub">${this._esc(this._playerStateLabel(p))}</span>
                      <span class="player-card-track">${this._esc(track || "—")}</span>
                    </span>
                  </button>
                `;
              }).join("")}
            </div>
          </div>
        `;
      };
      body.innerHTML = `<div class="player-modal-grid">${renderGroup(this._i18n("ui.playing"), activePlayers)}${renderGroup(this._i18n("ui.other_players"), others)}</div>`;
      body.querySelectorAll("[data-modal-player]").forEach((btn) => btn.addEventListener("click", () => {
        this._selectPlayer(btn.dataset.modalPlayer, true);
        this._closePlayerModal();
      }));
    }

    _openPlayerModal() {
      this.shadowRoot.querySelector(".card")?.appendChild(this.$("playerModal"));
      this._renderPlayerModal();
      this.$("playerModal").classList.add("open");
      this._state.playerModalOpen = true;
    }

    _closePlayerModal() {
      this.$("playerModal").classList.remove("open");
      this._state.playerModalOpen = false;
      this._state.modalMode = "players";
    }

    _syncMaButtonVisibility() {
      this.$("maOpenBtn").style.display = this._config.show_ma_button ? "" : "none";
    }

    _openMusicAssistant() {
      this.$("maConfirmModal")?.classList.add("open");
    }

    _closeMaConfirm() {
      this.$("maConfirmModal")?.classList.remove("open");
    }

    _confirmMusicAssistantOpen() {
      this._closeMaConfirm();
      this._launchMusicAssistant();
    }

    _flowAssistantLabel() {
      return this._i18n("ui.flow_assistant", {}, "FLOW ASSISTANT") || "FLOW ASSISTANT";
    }

    _cleanAllLabel() {
      return this._i18n("ui.clean_all", {}, this._m("Clean all", "נקה הכל")) || this._m("Clean all", "נקה הכל");
    }

    _cleanAllConfirmTitle() {
      return this._i18n("ui.clean_all_confirm_title", {}, this._m("Clean all players?", "לנקות את כל הנגנים?"));
    }

    _cleanAllConfirmCopy() {
      return this._i18n(
        "ui.clean_all_confirm_copy",
        {},
        this._m(
          "This will disconnect all active players, stop playback and clear their queues. Continue?",
          "הפעולה תנתק את כל הנגנים הפעילים, תעצור נגינה ותנקה את התורים שלהם. להמשיך?",
        ),
      );
    }

    _openCleanAllConfirm() {
      this.$("cleanAllConfirmModal")?.classList.add("open");
    }

    _closeCleanAllConfirm() {
      this.$("cleanAllConfirmModal")?.classList.remove("open");
    }

    async _confirmCleanAllPlayers() {
      this._closeCleanAllConfirm();
      this._closeMobileMenu();
      await this._stopAllPlayers();
      setTimeout(() => this._updateNowPlayingState(), 350);
    }

    _launchMusicAssistant() {
      window.open(this._config.ma_interface_url || "/music-assistant", this._config.ma_interface_target || "_self");
    }

    _openNowPlayingView() {
      const btn = this.shadowRoot.querySelector('.nav-btn[data-view="now_playing"]');
      this._setView("now_playing", btn || null);
    }

    _openImmersiveNowPlaying() {
      const backdrop = this.$("immersiveNowPlaying");
      if (!backdrop) return;
      this.shadowRoot.querySelector(".card")?.appendChild(backdrop);
      this._state.immersiveNowPlayingOpen = true;
      this._renderImmersiveNowPlaying();
      backdrop.classList.add("open");
    }

    _closeImmersiveNowPlaying() {
      const backdrop = this.$("immersiveNowPlaying");
      if (!backdrop) return;
      backdrop.classList.remove("open");
      backdrop.classList.remove("has-lyrics-art");
      backdrop.style.removeProperty("--lyrics-dynamic-art");
      backdrop.onclick = null;
      backdrop.innerHTML = "";
      this._state.immersiveNowPlayingOpen = false;
    }

    _currentTrackInfo() {
      return HomeiiMediaPresentationFoundation.buildCurrentTrackInfo({
        player: this._getSelectedPlayer(),
        queueItem: this._state.maQueueState?.current_item || null,
      });
    }

    _currentLyricsTrackKey() {
      const info = this._currentTrackInfo();
      const queueItem = this._state.maQueueState?.current_item || null;
      const player = this._getSelectedPlayer();
      return [
        this._getQueueItemStableId?.(queueItem),
        this._getQueueItemUri?.(queueItem),
        player?.attributes?.media_content_id,
        info.key,
        Math.round(Number(info.duration || 0) || 0),
      ].map((value) => String(value || "").trim().toLowerCase()).filter(Boolean).join("|");
    }

    _saveMobileRecentHistory() {
      try {
        localStorage.setItem("homeii_music_flow_mobile_recent_history", JSON.stringify((this._state.mobileRecentHistory || []).slice(0, 10)));
      } catch (_) {}
    }

    _sourceProviderMeta(value = "") {
      return HomeiiMediaPresentationFoundation.sourceProviderMeta(value, {
        libraryLabel: this._i18n("ui.library"),
        radioLabel: this._i18n("ui.radio"),
      });
    }

    _qualityBadgeLabel(values = []) {
      return HomeiiMediaPresentationFoundation.qualityBadgeLabel(values);
    }

    _currentSourceBadgeMeta(player = this._getSelectedPlayer(), queueItem = this._state.maQueueState?.current_item || null) {
      return HomeiiMediaHistoryFoundation.buildCurrentSourceBadgeMeta(
        { player, queueItem: queueItem || this._state.maQueueState?.current_item || null },
        {
          parseMediaReferenceFn: (uri, mediaType) => this._parseMediaReference(uri, mediaType),
          sourceProviderMetaFn: (value, labels) => HomeiiMediaPresentationFoundation.sourceProviderMeta(value, labels),
          qualityBadgeLabelFn: (values) => HomeiiMediaPresentationFoundation.qualityBadgeLabel(values),
          libraryLabel: this._i18n("ui.library"),
          radioLabel: this._i18n("ui.radio"),
        },
      );
    }

    _currentHistorySnapshot(player = this._getSelectedPlayer(), queueItem = this._state.maQueueState?.current_item || null) {
      return HomeiiMediaHistoryFoundation.buildCurrentHistorySnapshot(
        { player, queueItem: queueItem || this._state.maQueueState?.current_item || null },
        {
          getQueueItemUriFn: (item) => this._getQueueItemUri(item),
          queueItemImageUrlFn: (item, size) => this._queueItemImageUrl(item, size),
          artUrlFn: (item) => this._artUrl(item),
          buildCurrentSourceBadgeMetaFn: ({ player: historyPlayer, queueItem: historyQueueItem }) => this._currentSourceBadgeMeta(historyPlayer, historyQueueItem),
        },
      );
    }

    _rememberRecentPlayback(player = this._getSelectedPlayer(), queueItem = this._state.maQueueState?.current_item || null) {
      const snapshot = this._currentHistorySnapshot(player, queueItem);
      const resolved = HomeiiMediaHistoryFoundation.applyRecentPlaybackSnapshot(
        snapshot,
        this._state.mobileCurrentHistoryEntry || null,
        this._state.mobileRecentHistory || [],
        10,
      );
      this._state.mobileCurrentHistoryEntry = resolved.currentEntry;
      this._state.mobileRecentHistory = resolved.recentHistory;
      if (resolved.historyChanged) {
        this._saveMobileRecentHistory();
      }
    }

    _visibleRecentHistoryItems() {
      return HomeiiMediaHistoryFoundation.visibleRecentHistoryItems(
        this._state.mobileCurrentHistoryEntry || null,
        this._state.mobileRecentHistory || [],
        10,
      );
    }

    _historyRecommendationPlaylistItems(limit = 5) {
      const playlists = Array.isArray(this._state.mobileRecommendationPlaylists)
        ? this._state.mobileRecommendationPlaylists
        : [];
      const seen = new Set();
      return playlists
        .filter((item) => {
          const uri = String(item?.uri || "").trim();
          if (!uri || seen.has(uri)) return false;
          seen.add(uri);
          return String(item?.media_type || "playlist").toLowerCase() === "playlist";
        })
        .slice(0, limit)
        .map((item) => ({
          uri: String(item.uri || "").trim(),
          media_type: "playlist",
          title: item.name || item.title || this._i18n("ui.recommended_playlist"),
          artist: this._i18n("ui.playlist"),
          album: item.provider_label || item.provider || "",
          image: this._artUrl(item) || item.image || "",
          provider_label: item.provider_label || item.provider || "",
        }));
    }

    async _loadHistoryRecommendationPlaylists(force = false) {
      const now = Date.now();
      const cached = Array.isArray(this._state.mobileRecommendationPlaylists)
        ? this._state.mobileRecommendationPlaylists
        : [];
      const fresh = cached.length && !force && (now - Number(this._state.mobileRecommendationPlaylistsFetchedAt || 0) < 10 * 60 * 1000);
      if (fresh || this._state.mobileRecommendationPlaylistsLoading) return cached;
      this._state.mobileRecommendationPlaylistsLoading = true;
      try {
        const playlists = await this._loadScheduledStartPlaylists(force);
        this._state.mobileRecommendationPlaylists = Array.isArray(playlists) ? playlists.slice(0, 24) : [];
        this._state.mobileRecommendationPlaylistsFetchedAt = Date.now();
        this._state.mobileHistoryRenderedHtml = "";
        if (this._state.mobileHistoryDrawerTab === "recommendations") this._syncRecentHistoryUi();
        return this._state.mobileRecommendationPlaylists;
      } catch (_) {
        return cached;
      } finally {
        this._state.mobileRecommendationPlaylistsLoading = false;
      }
    }

    _historyRecommendationItems(limit = 10) {
      const currentIndex = this._state.maQueueState?.current_index ?? -1;
      const seen = new Set();
      const pushUnique = (items = [], output = []) => {
        (Array.isArray(items) ? items : []).forEach((item) => {
          const uri = String(item?.uri || "").trim();
          if (!uri || seen.has(uri) || output.length >= limit) return;
          seen.add(uri);
          output.push(item);
        });
        return output;
      };
      const queueItems = this._getNowPlayingQueueItems()
        .filter((item) => (item?.sort_index ?? -1) !== currentIndex)
        .map((item) => {
          const media = item.media_item || {};
          return {
            uri: String(media.uri || "").trim(),
            media_type: media.media_type || item.media_type || "track",
            title: media.name || item.name || this._i18n("ui.recommended_track"),
            artist: media.artists?.map((artist) => artist.name).join(", ") || media.album?.name || "",
            album: media.album?.name || "",
            image: this._queueItemImageUrl(item, 120) || this._artUrl(media) || "",
          };
        })
        .filter((item) => item.uri)
        .slice(0, 4);
      const recentItems = (this._state.mobileRecentHistory || [])
        .filter((item) => item?.uri)
        .map((item) => ({
          ...item,
          title: item.title || item.name || this._i18n("ui.recommended_track"),
        }));
      const recommendations = [];
      pushUnique(this._state.quickMixRecommendationItems || [], recommendations);
      pushUnique(queueItems, recommendations);
      pushUnique(this._historyRecommendationPlaylistItems(5), recommendations);
      pushUnique(recentItems, recommendations);
      return recommendations.slice(0, limit);
    }

    _historyPlayableItems(items = []) {
      return (Array.isArray(items) ? items : [])
        .map((item) => ({
          uri: String(item?.uri || "").trim(),
          media_type: item?.media_type || "track",
          name: item?.name || item?.title || "",
        }))
        .filter((item) => item.uri);
    }

    _setHistoryDrawerOpen(open = false) {
      this._state.mobileHistoryDrawerOpen = !!open;
      const drawer = this.$("historyDrawer");
      const button = this.$("historyToggleFab");
      drawer?.classList.toggle("open", this._state.mobileHistoryDrawerOpen);
      button?.classList.toggle("active", this._state.mobileHistoryDrawerOpen);
      if (button) button.setAttribute("aria-expanded", this._state.mobileHistoryDrawerOpen ? "true" : "false");
    }

    _toggleHistoryDrawer(force) {
      const next = typeof force === "boolean" ? force : !this._state.mobileHistoryDrawerOpen;
      if (next) {
        this._rememberRecentPlayback();
        this._state.mobileHistoryDrawerTab = "recent";
        this._state.mobileHistoryRenderedHtml = "";
      }
      this._setHistoryDrawerOpen(next);
      if (next) this._syncRecentHistoryUi(true);
    }

    _syncRecentHistoryUi(force = false) {
      const host = this.$("historyDrawerBody");
      const drawer = this.$("historyDrawer");
      const button = this.$("historyToggleFab");
      if (!host) return;
      if (!this._getSelectedPlayer()) {
        if (force || this._state.mobileHistoryRenderedHtml !== "") {
          host.innerHTML = "";
          this._state.mobileHistoryRenderedHtml = "";
        }
        drawer?.setAttribute("hidden", "");
        button?.setAttribute("hidden", "");
        this._setHistoryDrawerOpen(false);
        return;
      }
      drawer?.removeAttribute("hidden");
      button?.removeAttribute("hidden");
      const tab = this._state.mobileHistoryDrawerTab === "recommendations" ? "recommendations" : "recent";
      this.shadowRoot?.querySelectorAll("[data-history-tab]")?.forEach((btn) => {
        const active = btn.dataset.historyTab === tab;
        btn.classList.toggle("active", active);
        btn.setAttribute("aria-selected", active ? "true" : "false");
      });
      if (tab === "recommendations") this._loadHistoryRecommendationPlaylists().catch(() => {});
      const items = tab === "recommendations" ? this._historyRecommendationItems() : this._visibleRecentHistoryItems();
      if (!items.length) {
        const emptyText = tab === "recommendations"
          ? this._i18n("ui.recommendations_will_appear_once_homeii_flow_sees_your_queue_or_recent_l")
          : this._i18n("ui.play_a_few_tracks_and_they_will_appear_here");
        const emptyHtml = `<div class="history-empty">${this._esc(emptyText)}</div>`;
        if (force || this._state.mobileHistoryRenderedHtml !== emptyHtml) {
          host.innerHTML = emptyHtml;
          this._state.mobileHistoryRenderedHtml = emptyHtml;
        }
        return;
      }
      const nextHtml = `
        <div class="history-actions">
          <button class="chip-btn history-play-all-btn" data-history-play-all title="${this._esc(this._i18n("ui.play_all"))}" aria-label="${this._esc(this._i18n("ui.play_all"))}">
            ${this._iconSvg("play")}
            <span>${this._esc(this._i18n("ui.play_all"))}</span>
          </button>
        </div>
        ${items.map((item, index) => `
          <button class="history-chip" data-history-index="${this._esc(String(index))}" title="${this._esc(item.title || "")}">
            <span class="history-chip-art">${item.image ? `<img src="${this._esc(item.image)}" alt="">` : this._iconSvg("music_note")}</span>
            <span class="history-chip-copy">
              <span class="history-chip-title">${this._esc(item.title || this._i18n("ui.recent_track"))}</span>
              <span class="history-chip-sub">${this._esc(item.artist || item.album || item.provider_label || "—")}</span>
            </span>
          </button>
        `).join("")}
      `;
      const changed = force || this._state.mobileHistoryRenderedHtml !== nextHtml;
      if (changed) {
        host.innerHTML = nextHtml;
        this._state.mobileHistoryRenderedHtml = nextHtml;
      }
      if (changed) {
        host.querySelectorAll("[data-history-index]").forEach((btn) => btn.addEventListener("click", async (e) => {
          const trigger = e.currentTarget;
          const index = Number(trigger.dataset.historyIndex);
          const currentTab = this._state.mobileHistoryDrawerTab === "recommendations" ? "recommendations" : "recent";
          const item = (currentTab === "recommendations" ? this._historyRecommendationItems() : this._visibleRecentHistoryItems())[index];
          if (!item?.uri) return;
          this._pressUiButton(trigger);
          await this._playMedia(item.uri, item.media_type || "track", "play", {
            label: item.title || "",
            sourceEl: trigger,
          });
          this._setHistoryDrawerOpen(false);
        }));
      }
    }

    _controlRoomEnabled() {
      return this._layoutModeConfig() === "tablet" && !this._isCompactTileMode();
    }

    _controlRoomLabel() {
      return this._i18n("ui.studio");
    }

    _controlRoomPlayerName(entityOrPlayer = "") {
      const player = entityOrPlayer && typeof entityOrPlayer === "object"
        ? entityOrPlayer
        : this._playerByEntityId(String(entityOrPlayer || ""));
      return player?.attributes?.friendly_name || String(entityOrPlayer || "") || this._i18n("ui.player");
    }

    _controlRoomPlayerCountLabel(count = 0) {
      const amount = Math.max(0, Number(count) || 0);
      if (amount === 1) return this._i18n("ui.player_count_one");
      return this._i18n("ui.player_count_many", { count: amount });
    }

    _controlRoomPanelLabel(panel = "") {
      const labels = {
        selection: this._i18n("ui.connected_players"),
        visible: this._i18n("ui.visible_tiles"),
        music: this._i18n("ui.music_hub"),
        actions: this._i18n("ui.actions"),
        library: this._i18n("ui.studio_search"),
        transfer: this._i18n("ui.queue_cockpit"),
        mix: this._i18n("ui.smart_mix"),
        recent: this._i18n("ui.recent_listening"),
        favorites: this._i18n("ui.favorite_center"),
        scenes: this._i18n("ui.scene_presets"),
        announce: this._i18n("ui.announcement_studio"),
        pro: this._i18n("ui.studio_pro"),
      };
      return labels[String(panel || "")] || this._controlRoomLabel();
    }

    _controlRoomActionTargetIds() {
      const selectedIds = this._controlRoomSelectedPlayerIds();
      if (selectedIds.length) return selectedIds;
      const primaryId = this._controlRoomPrimaryPlayerId();
      return primaryId ? [primaryId] : [];
    }

    _controlRoomFocusTarget() {
      const selectedIds = this._controlRoomSelectedPlayerIds();
      const selectedPlayers = selectedIds.map((entityId) => this._playerByEntityId(entityId)).filter(Boolean);
      const primary = this._controlRoomPrimaryPlayer();
      const players = selectedPlayers.length ? selectedPlayers : (primary ? [primary] : []);
      const first = players[0] || null;
      const art = this._bestArtworkUrl([first?.attributes?.entity_picture_local, first?.attributes?.entity_picture], {
        size: 160,
        cacheKey: this._currentArtworkCacheKey(first),
      });
      if (players.length > 1) {
        const names = players.map((player) => player.attributes?.friendly_name || player.entity_id).filter(Boolean);
        return {
          art,
          count: players.length,
          kicker: this._i18n("ui.controlling"),
          name: this._controlRoomPlayerCountLabel(players.length),
          track: names.slice(0, 3).join(" · ") + (names.length > 3 ? "..." : ""),
        };
      }
      const name = first?.attributes?.friendly_name || this._i18n("ui.selected_player_2");
      return {
        art,
        count: first ? 1 : 0,
        kicker: selectedIds.length ? this._i18n("ui.controlling") : this._i18n("ui.primary_target"),
        name,
        track: first?.attributes?.media_title || first?.attributes?.media_artist || this._playerStateLabel(first) || this._i18n("ui.idle_2"),
      };
    }

    _controlRoomContextChipHtml() {
      const target = this._controlRoomFocusTarget();
      return `
        <div class="control-room-context-chip">
          <span class="control-room-context-art">${target.art ? `<img src="${this._esc(target.art)}" alt="">` : this._iconSvg("speaker")}</span>
          <span class="control-room-context-copy">
            <span class="control-room-context-kicker">${this._esc(target.kicker)}</span>
            <span class="control-room-context-name">${this._esc(target.name)}</span>
          </span>
        </div>
      `;
    }

    _tabletStabilityModeEnabled() {
      try {
        const ua = String(window.navigator?.userAgent || "");
        const width = this._getCardWidth(Number(window.innerWidth || 0));
        const touchPoints = Number(window.navigator?.maxTouchPoints || 0);
        return HomeiiResponsiveFoundation.tabletStabilityModeEnabled({
          layoutMode: this._layoutModeConfig(),
          userAgent: ua,
          width,
          touchPoints,
        });
      } catch (_) {
        return false;
      }
    }

    _controlRoomAllPlayers() {
      this._loadPlayers();
      const players = Array.isArray(this._state.players) ? this._state.players : [];
      const visible = players.filter((player) => !this._isLikelyBrowserPlayer(player) || this._isLocalSendspinPlayer(player));
      return visible.length ? visible : players;
    }

    _controlRoomVisiblePlayerIds() {
      const players = this._controlRoomAllPlayers();
      const validIds = new Set(players.map((player) => player.entity_id));
      let visibleIds = (Array.isArray(this._state.controlRoomVisiblePlayers) ? this._state.controlRoomVisiblePlayers : [])
        .filter((entityId) => validIds.has(entityId));
      const thisDevicePlayer = players.find((player) => this._isLocalSendspinPlayer(player) && this._isAvailableThisDevicePlayer(player));
      if (this._state.controlRoomRevealThisDevicePending && thisDevicePlayer?.entity_id) {
        if (!visibleIds.length && this._state.controlRoomVisiblePlayers?.length) visibleIds = [thisDevicePlayer.entity_id];
        else if (!visibleIds.includes(thisDevicePlayer.entity_id)) visibleIds.push(thisDevicePlayer.entity_id);
        this._state.controlRoomRevealThisDevicePending = false;
      }
      if (!visibleIds.length) visibleIds = players.map((player) => player.entity_id);
      if (!visibleIds.length && players[0]?.entity_id) visibleIds = [players[0].entity_id];
      this._state.controlRoomVisiblePlayers = visibleIds;
      return visibleIds;
    }

    _revealControlRoomThisDevicePlayer(entityId = "", options = {}) {
      const id = String(entityId || "").trim();
      if (!id) return false;
      const visible = Array.isArray(this._state.controlRoomVisiblePlayers)
        ? this._state.controlRoomVisiblePlayers.filter(Boolean)
        : [];
      if (visible.length && !visible.includes(id)) this._state.controlRoomVisiblePlayers = [...visible, id];
      const selected = Array.isArray(this._state.controlRoomSelectedPlayers)
        ? this._state.controlRoomSelectedPlayers.filter(Boolean)
        : [];
      this._state.controlRoomSelectedPlayers = [id, ...selected.filter((value) => value !== id)];
      this._state.controlRoomRevealThisDevicePending = false;
      if (options.sync !== false && this._state.controlRoomOpen) {
        this._syncControlRoomTransferDefaults();
        this._syncControlRoomUi({ force: true });
      }
      return true;
    }

    _controlRoomPlayers() {
      const players = this._controlRoomAllPlayers();
      const visibleIds = new Set(this._controlRoomVisiblePlayerIds());
      const filtered = players.filter((player) => visibleIds.has(player.entity_id));
      return filtered.length ? filtered : players;
    }

    _playerByEntityId(entityId = "") {
      const target = String(entityId || "").trim();
      if (!target) return null;
      if (typeof this._isPlayerExcluded === "function" && this._isPlayerExcluded(target)) return null;
      const knownPlayer = HomeiiPlayersFoundation.playerByEntityId(
        target,
        [...(this._state.players || []), ...(this._directMaPlayers || [])],
        {},
      );
      if (knownPlayer) return knownPlayer;
      const hassPlayer = this._hass?.states?.[target] || null;
      return this._isMusicAssistantPlayer(hassPlayer) ? hassPlayer : null;
    }

    _controlRoomGroupKey(player = null) {
      const attrs = player?.attributes || {};
      const candidates = [
        attrs.group_id,
        attrs.group,
        attrs.group_leader,
        attrs.group_parent,
        attrs.group_master,
        attrs.group_entity_id,
        attrs.sync_group,
        attrs.active_group,
        attrs.synced_to,
      ];
      const key = candidates
        .map((value) => String(value || "").trim())
        .find((value) => value && !/^(false|true|none|null|unknown|unavailable)$/i.test(value));
      return key || "";
    }

    _controlRoomGroupInfo(player = null) {
      if (!player?.entity_id || HomeiiPlayersFoundation.isLikelyBrowserPlayer(player)) return { ids: [], count: 0, label: "" };
      const allPlayers = this._controlRoomAllPlayers();
      const byId = new Map(allPlayers.map((entry) => [entry?.entity_id, entry]).filter(([entityId]) => !!entityId));
      let ids = this._playerGroupMemberIds(player);
      if (ids.length <= 1) {
        const owner = allPlayers.find((candidate) => {
          const members = this._playerGroupMemberIds(candidate);
          return members.length > 1 && members.includes(player.entity_id);
        });
        if (owner) ids = this._playerGroupMemberIds(owner);
      }
      if (ids.length <= 1) {
        const key = this._controlRoomGroupKey(player);
        if (key) {
          ids = allPlayers
            .filter((candidate) => this._controlRoomGroupKey(candidate) === key)
            .map((candidate) => candidate.entity_id);
        }
      }
      ids = [...new Set(ids)]
        .filter((entityId) => entityId && byId.has(entityId))
        .filter((entityId) => !HomeiiPlayersFoundation.isLikelyBrowserPlayer(byId.get(entityId)));
      const names = ids
        .map((entityId) => byId.get(entityId)?.attributes?.friendly_name || entityId)
        .filter(Boolean);
      return {
        ids,
        count: ids.length > 1 ? ids.length : 0,
        label: names.length > 1 ? names.join(" · ") : "",
      };
    }

    _controlRoomGroupSummaries(players = []) {
      const visible = Array.isArray(players) ? players : [];
      const byKey = new Map();
      visible.forEach((player) => {
        const info = this._controlRoomGroupInfo(player);
        if (!info.count) return;
        const ids = [...info.ids].sort();
        const key = ids.join("|");
        if (!key || byKey.has(key)) return;
        const names = ids.map((entityId) => this._controlRoomPlayerName(entityId)).filter(Boolean);
        const primaryId = ids[0] || player.entity_id;
        const primary = this._playerByEntityId(primaryId) || player;
        byKey.set(key, {
          ids,
          count: ids.length,
          label: names.join(" · "),
          art: this._bestArtworkUrl([primary?.attributes?.entity_picture_local, primary?.attributes?.entity_picture], {
            size: 120,
            cacheKey: this._currentArtworkCacheKey(primary),
          }),
        });
      });
      return [...byKey.values()];
    }

    _controlRoomGroupSummaryHtml(players = []) {
      const groups = this._controlRoomGroupSummaries(players);
      if (!groups.length) return "";
      return `
        <div class="control-room-group-summary" data-control-room-scroll="groups">
          ${groups.map((group) => `
            <div class="control-room-group-chip" title="${this._esc(group.label)}">
              <span class="control-room-group-art">${group.art ? `<img src="${this._esc(group.art)}" alt="">` : this._iconSvg("speaker")}</span>
              <span class="control-room-group-copy">
                <span class="control-room-group-title">${this._esc(this._m(`${group.count} grouped players`, `${group.count} נגנים בקבוצה`))}</span>
                <span class="control-room-group-members">${this._esc(group.label)}</span>
              </span>
            </div>
          `).join("")}
        </div>
      `;
    }

    _controlRoomSelectedPlayerIds() {
      const players = this._controlRoomPlayers();
      const validIds = new Set(players.map((player) => player.entity_id));
      let selected = (Array.isArray(this._state.controlRoomSelectedPlayers) ? this._state.controlRoomSelectedPlayers : [])
        .filter((entityId) => validIds.has(entityId));
      if (!selected.length) {
        const preferred = this._state.selectedPlayer;
        if (preferred && validIds.has(preferred)) selected = [preferred];
        else if (players[0]?.entity_id) selected = [players[0].entity_id];
      }
      this._state.controlRoomSelectedPlayers = selected;
      return selected;
    }

    _controlRoomPrimaryPlayerId() {
      const selectedIds = this._controlRoomSelectedPlayerIds();
      if (selectedIds[0]) return selectedIds[0];
      const players = this._controlRoomPlayers();
      const validIds = new Set(players.map((player) => player.entity_id));
      const preferred = this._state.selectedPlayer;
      if (preferred && validIds.has(preferred)) return preferred;
      return players[0]?.entity_id || "";
    }

    _controlRoomPrimaryPlayer() {
      return this._playerByEntityId(this._controlRoomPrimaryPlayerId());
    }

    _setControlRoomSelection(entityIds = []) {
      const players = this._controlRoomPlayers();
      const validIds = new Set(players.map((player) => player.entity_id));
      const next = [];
      (Array.isArray(entityIds) ? entityIds : []).forEach((entityId) => {
        if (entityId && validIds.has(entityId) && !next.includes(entityId)) next.push(entityId);
      });
      if (!next.length) {
        const preferred = this._state.selectedPlayer;
        if (preferred && validIds.has(preferred)) next.push(preferred);
        else if (players[0]?.entity_id) next.push(players[0].entity_id);
      }
      this._state.controlRoomSelectedPlayers = next;
      this._syncControlRoomTransferDefaults();
      this._syncControlRoomUi();
    }

    _toggleControlRoomPlayerSelection(entityId) {
      if (!entityId) return "kept";
      const current = this._controlRoomSelectedPlayerIds();
      const isSelected = current.includes(entityId);
      if (isSelected && current.length <= 1) {
        this._setControlRoomSelection(current);
        return "kept";
      }
      const next = isSelected
        ? current.filter((id) => id !== entityId)
        : [...current, entityId];
      this._setControlRoomSelection(next);
      return isSelected ? "removed" : "added";
    }

    _setControlRoomPrimary(entityId, options = {}) {
      if (!entityId) return;
      const current = this._controlRoomSelectedPlayerIds().filter((id) => id !== entityId);
      const exclusive = !!options.exclusive;
      this._state.controlRoomSelectedPlayers = [entityId, ...(exclusive ? [] : current)];
      this._syncControlRoomTransferDefaults();
      if (options.selectPlayer !== false) this._selectPlayer(entityId, true);
      else this._syncControlRoomUi();
    }

    _setControlRoomVisiblePlayers(entityIds = []) {
      const players = this._controlRoomAllPlayers();
      const validIds = new Set(players.map((player) => player.entity_id));
      const next = [];
      (Array.isArray(entityIds) ? entityIds : []).forEach((entityId) => {
        if (entityId && validIds.has(entityId) && !next.includes(entityId)) next.push(entityId);
      });
      if (!next.length && players[0]?.entity_id) next.push(players[0].entity_id);
      this._state.controlRoomVisiblePlayers = next;
      this._state.controlRoomSelectedPlayers = this._controlRoomSelectedPlayerIds().filter((entityId) => next.includes(entityId));
      const primaryId = this._controlRoomPrimaryPlayerId();
      if (!next.includes(primaryId) && next[0]) this._setControlRoomPrimary(next[0], { exclusive: false, selectPlayer: true });
      else {
        this._syncControlRoomTransferDefaults();
        this._syncControlRoomUi();
      }
    }

    _toggleControlRoomVisiblePlayer(entityId) {
      if (!entityId) return;
      const current = this._controlRoomVisiblePlayerIds();
      const next = current.includes(entityId)
        ? current.filter((id) => id !== entityId)
        : [...current, entityId];
      this._setControlRoomVisiblePlayers(next);
    }

    _controlRoomPlayerChoiceRows(kind = "selection") {
      const allPlayers = kind === "visible" ? this._controlRoomAllPlayers() : this._controlRoomPlayers();
      const activeIds = new Set(
        kind === "visible"
          ? this._controlRoomVisiblePlayerIds()
          : this._controlRoomSelectedPlayerIds()
      );
      return `
        <div class="control-room-picker-list" data-control-room-scroll="${this._esc(kind)}">
          ${allPlayers.map((player) => {
            const entityId = player.entity_id;
            const active = activeIds.has(entityId);
            const art = this._bestArtworkUrl([player.attributes?.entity_picture_local, player.attributes?.entity_picture], {
              size: 120,
              cacheKey: this._currentArtworkCacheKey(player),
            });
            const name = player.attributes?.friendly_name || entityId;
            const subtitle = player.attributes?.media_title || this._playerStateLabel(player);
            const attr = kind === "visible" ? "data-room-visible-toggle" : "data-room-selection-toggle";
            return `
              <button class="control-room-picker-row ${active ? "active" : ""}" ${attr}="${this._esc(entityId)}">
                <span class="control-room-picker-art">${art ? `<img src="${this._esc(art)}" alt="">` : this._iconSvg("speaker")}</span>
                <span class="control-room-picker-copy">
                  <span class="control-room-picker-title">${this._esc(name)}</span>
                  <span class="control-room-picker-sub">${this._esc(subtitle || "")}</span>
                </span>
                <span class="control-room-picker-check">${this._iconSvg(active ? "check" : "plus")}</span>
              </button>
            `;
          }).join("")}
        </div>
      `;
    }

    _syncControlRoomTransferDefaults() {
      const players = this._controlRoomPlayers();
      const ids = players.map((player) => player.entity_id);
      const primaryId = this._controlRoomPrimaryPlayerId();
      if (!ids.includes(this._state.controlRoomTransferSource)) {
        this._state.controlRoomTransferSource = this._state.selectedPlayer && ids.includes(this._state.selectedPlayer)
          ? this._state.selectedPlayer
          : (ids[0] || "");
      }
      if (!ids.includes(this._state.controlRoomTransferTarget) || this._state.controlRoomTransferTarget === this._state.controlRoomTransferSource) {
        this._state.controlRoomTransferTarget = primaryId && primaryId !== this._state.controlRoomTransferSource
          ? primaryId
          : (ids.find((id) => id !== this._state.controlRoomTransferSource) || primaryId || "");
      }
    }

    _syncControlRoomChrome() {
      const open = !!this._state.controlRoomOpen && this._controlRoomEnabled();
      this.$("controlRoomBackdrop")?.classList.toggle("open", open);
      this.shadowRoot?.querySelector(".card")?.classList.toggle("control-room-open", open);
    }

    _openControlRoom() {
      if (!this._controlRoomEnabled()) return;
      this._state.controlRoomOpen = true;
      this._state.controlRoomPanel = "";
      this._controlRoomSelectedPlayerIds();
      this._syncControlRoomTransferDefaults();
      this._syncControlRoomChrome();
      this._syncControlRoomUi({ force: true });
      this._loadControlRoomQueues(this._controlRoomPlayers().map((player) => player.entity_id)).catch(() => {});
      this._toastSuccess(this._i18n("ui.studio_opened"));
    }

    _closeControlRoom(options = {}) {
      this._suppressHomeShortcutNavigation();
      this._state.controlRoomOpen = false;
      this._state.controlRoomPanel = "";
      this._state.controlRoomRestoreAfterMenu = false;
      this._syncControlRoomChrome();
      if (!options.silent) this._toast(this._i18n("ui.studio_closed"));
    }

    _isScheduleFormControl(target) {
      const el = target?.closest?.("input, select, textarea");
      if (!el) return false;
      const id = el.id || "";
      if ([
        "scheduledStartTimeInput",
        "scheduledStartPlayerSelect",
        "scheduledStartPlaylistSelect",
        "scheduledStartAfterRunSelect",
        "scheduledStartVolumeInput",
        "mobileNightStartInput",
        "mobileNightEndInput",
      ].includes(id)) return true;
      return el.dataset?.startTimerDay !== undefined || el.dataset?.settingNightDay !== undefined;
    }

    _markScheduleFormControlActive(target = null) {
      if (!this._isScheduleFormControl(target)) return false;
      this._state.mobileScheduleControlActiveUntil = Date.now() + 2500;
      return true;
    }

    _isScheduleFormEditing() {
      if (!this._state.menuOpen || this._state.menuPage !== "sleep_timer") return false;
      const active = this.shadowRoot?.activeElement;
      return this._isScheduleFormControl(active)
        || Date.now() < Number(this._state.mobileScheduleControlActiveUntil || 0);
    }

    _rebuildMobileUi(options = {}) {
      const reopenPage = typeof options.reopenPage === "string"
        ? options.reopenPage
        : (this._state.menuOpen ? this._state.menuPage || "main" : "");
      const reopenStudio = typeof options.reopenStudio === "boolean"
        ? options.reopenStudio
        : !!this._state.controlRoomOpen;
      if (!options.force && reopenPage === "sleep_timer" && this._isScheduleFormEditing()) return;
      const previousMenuPage = this._state.menuPage || "main";
      const previousMenuScrollTop = reopenPage && reopenPage === previousMenuPage
        ? (this.$("mobileMenuBody")?.scrollTop || 0)
        : null;
      this._build();
      this._init();
      if (reopenPage) this._openMobileMenu(reopenPage, { scrollTop: previousMenuScrollTop });
      if (reopenStudio && this._controlRoomEnabled()) {
        this._state.controlRoomOpen = true;
        this._syncControlRoomChrome();
        this._syncControlRoomUi({ force: true });
      }
    }

    _openControlRoomLibrary(page = "library_playlists") {
      this._state.controlRoomRestoreAfterMenu = true;
      this._state.controlRoomOpen = true;
      this._openMobileMenu(page);
    }

    _toggleControlRoomPanel(panel = "") {
      const next = String(panel || "");
      this._state.controlRoomPanel = this._state.controlRoomPanel === next ? "" : next;
      this._syncControlRoomUi();
      this._primeControlRoomPanelData(this._state.controlRoomPanel);
    }

    _primeControlRoomPanelData(panel = "") {
      const activePanel = String(panel || "");
      if (!activePanel) return;
      if (activePanel === "transfer") {
        const ids = [
          this._state.controlRoomTransferSource,
          this._state.controlRoomTransferTarget,
          ...this._controlRoomSelectedPlayerIds(),
        ].filter(Boolean);
        this._loadControlRoomQueues(ids).catch(() => {});
        return;
      }
      if (activePanel === "recent") {
        this._loadControlRoomRecent().catch(() => {});
        return;
      }
      if (activePanel === "favorites") {
        this._loadControlRoomFavorites().catch(() => {});
      }
    }

    _controlRoomMediaTypeIcon(mediaType = "") {
      const type = String(mediaType || "").toLowerCase();
      if (type === "playlist") return "playlist";
      if (type === "artist") return "artist";
      if (type === "track") return "tracks";
      if (type === "radio") return "radio";
      if (type === "podcast") return "podcast";
      return "album";
    }

    _controlRoomMediaTypeLabel(mediaType = "") {
      const type = String(mediaType || "").toLowerCase();
      const labels = {
        track: this._i18n("ui.track"),
        album: this._i18n("ui.album"),
        artist: this._i18n("ui.artist"),
        playlist: this._i18n("ui.playlist"),
        radio: this._i18n("ui.radio"),
        podcast: this._i18n("ui.podcast"),
      };
      return labels[type] || this._i18n("ui.media");
    }

    _controlRoomNormalizeMediaEntry(item = {}, fallbackType = "album", options = {}) {
      const mediaType = String(item?.media_type || item?.type || item?.media_item?.media_type || fallbackType || "album").toLowerCase();
      const artists = Array.isArray(item?.artists)
        ? item.artists.map((artist) => artist?.name).filter(Boolean).join(", ")
        : "";
      const uri = item?.uri || item?.media_item?.uri || item?.media_content_id || "";
      return {
        uri,
        media_type: mediaType,
        name: item?.name || item?.title || item?.media_item?.name || uri || this._controlRoomMediaTypeLabel(mediaType),
        subtitle: options.subtitle || artists || item?.artist || item?.album?.name || item?.metadata?.description || item?.provider_label || this._controlRoomMediaTypeLabel(mediaType),
        artist: artists || item?.artist || "",
        album: item?.album?.name || item?.album || "",
        image: this._artUrl(item) || item?.image || item?.image_url || item?.media_item?.image || item?.media_image || "",
        favorite: !!item?.favorite,
      };
    }

    _controlRoomEntryDataAttrs(entry = {}) {
      return [
        `data-room-library-uri="${this._esc(entry.uri || "")}"`,
        `data-room-library-type="${this._esc(entry.media_type || "album")}"`,
        `data-room-library-name="${this._esc(entry.name || "")}"`,
        `data-room-library-subtitle="${this._esc(entry.subtitle || "")}"`,
        `data-room-library-image="${this._esc(entry.image || "")}"`,
      ].join(" ");
    }

    _controlRoomProtocolLabel(player = null) {
      const attrs = player?.attributes || {};
      return String(
        attrs.mass_player_type
        || attrs.player_type
        || attrs.provider
        || attrs.provider_name
        || attrs.source
        || attrs.app_name
        || "MA"
      ).replace(/_/g, " ").trim();
    }

    _controlRoomQueueCount(player = null, snapshot = null) {
      const attrs = player?.attributes || {};
      const candidates = [
        snapshot?.state?.items,
        attrs.queue_items,
        attrs.queue_size,
        attrs.queue_length,
        attrs.media_playlist_length,
        attrs.items_in_queue,
        attrs.active_queue_items,
      ];
      const value = candidates.map((item) => Number(item)).find((item) => Number.isFinite(item) && item >= 0);
      return Number.isFinite(value) ? Math.round(value) : 0;
    }

    _controlRoomQueueCache(entityId = "") {
      const cache = this._state.controlRoomQueueSnapshots || {};
      const entry = cache[String(entityId || "")];
      return entry?.snapshot || null;
    }

    async _fetchDirectControlRoomQueueSnapshot(player = null) {
      const queueId = this._directMaQueueId(player);
      if (!queueId || !this._hasDirectMAConnection()) return null;
      let queueState = null;
      let items = [];
      try {
        queueState = await this._callDirectMaCommand("player_queues/get", { queue_id: queueId });
      } catch (_) {}
      try {
        const fullSnapshot = await this._callDirectMaCommand("player_queues/items", { queue_id: queueId, limit: 120, offset: 0 });
        items = Array.isArray(fullSnapshot?.items)
          ? fullSnapshot.items
          : (Array.isArray(fullSnapshot) ? fullSnapshot : []);
      } catch (_) {}
      if (!queueState && !items.length) return null;
      return this._normalizeQueueSnapshot({ queue_state: queueState || {}, items }, player?.entity_id || "");
    }

    async _fetchControlRoomQueueSnapshot(entityId = "") {
      const player = this._playerByEntityId(entityId);
      if (!player) return null;
      if (entityId === this._state.selectedPlayer) {
        await this._ensureQueueSnapshot(true);
        const items = Array.isArray(this._state.queueItems) ? this._state.queueItems : [];
        if (items.length || this._state.maQueueState) {
          return {
            state: this._state.maQueueState || { items: items.length, current_index: 0 },
            items,
          };
        }
      }
      let snapshot = null;
      try { snapshot = await this._fetchMassQueueItemsSnapshot(player); } catch (_) { snapshot = null; }
      if (!snapshot) {
        try { snapshot = await this._fetchDirectControlRoomQueueSnapshot(player); } catch (_) { snapshot = null; }
      }
      return snapshot;
    }

    async _loadControlRoomQueues(entityIds = []) {
      const ids = [...new Set((Array.isArray(entityIds) ? entityIds : []).filter(Boolean))];
      if (!ids.length) return;
      this._state.controlRoomQueueLoading = true;
      this._syncControlRoomUi();
      const nextCache = { ...(this._state.controlRoomQueueSnapshots || {}) };
      const results = await Promise.allSettled(ids.map(async (entityId) => {
        const snapshot = await this._fetchControlRoomQueueSnapshot(entityId);
        return { entityId, snapshot };
      }));
      results.forEach((result) => {
        if (result.status !== "fulfilled") return;
        nextCache[result.value.entityId] = {
          ts: Date.now(),
          snapshot: result.value.snapshot,
        };
      });
      this._state.controlRoomQueueSnapshots = nextCache;
      this._state.controlRoomQueueLoading = false;
      this._syncControlRoomUi({ force: true });
    }

    _controlRoomQueuePreviewHtml(entityId = "") {
      const player = this._playerByEntityId(entityId);
      const snapshot = this._controlRoomQueueCache(entityId);
      const items = HomeiiMediaQueueFoundation.sortQueueItems(snapshot?.items || []);
      const currentIndex = Number(snapshot?.state?.current_index);
      const currentItem = Number.isFinite(currentIndex)
        ? items.find((item) => Number(item?.sort_index) === currentIndex) || items[0]
        : items[0];
      const queueCount = this._controlRoomQueueCount(player, snapshot);
      const previewItems = (currentItem ? [currentItem, ...items.filter((item) => item !== currentItem)] : items).slice(0, 4);
      const title = player?.attributes?.friendly_name || entityId || this._i18n("ui.player_2");
      return `
        <div class="control-room-queue-preview" data-control-room-scroll="queue-${this._esc(entityId)}">
          <div class="control-room-queue-preview-head">
            <span class="control-room-queue-player">${this._esc(title)}</span>
            <span class="control-room-queue-count">${this._esc(queueCount ? `${queueCount}` : this._i18n("ui.no_queue"))}</span>
          </div>
          ${previewItems.length ? previewItems.map((item, index) => {
            const media = item.media_item || {};
            const art = this._queueItemImageUrl(item, 96) || this._artUrl(media) || "";
            const itemTitle = media.name || item.name || item.media_title || this._i18n("ui.queue_item");
            const artist = item.media_artist || (media.artists || []).map((artistEntry) => artistEntry?.name).filter(Boolean).join(", ") || media.album?.name || "";
            return `
              <div class="control-room-queue-row ${index === 0 ? "current" : ""}">
                <span class="control-room-queue-art">${art ? `<img src="${this._esc(art)}" alt="">` : this._iconSvg("music_note")}</span>
                <span class="control-room-queue-copy">
                  <span class="control-room-queue-title">${this._esc(itemTitle)}</span>
                  <span class="control-room-queue-sub">${this._esc(index === 0 ? this._i18n("ui.now_playing_2") : (artist || this._i18n("ui.up_next_2")))}</span>
                </span>
              </div>
            `;
          }).join("") : `<div class="control-room-empty subtle">${this._esc(this._state.controlRoomQueueLoading ? this._i18n("ui.loading_queue") : this._i18n("ui.queue_is_unavailable_for_this_player"))}</div>`}
        </div>
      `;
    }

    _controlRoomMixPresets() {
      return [
        { id: "calm", icon: "moon", label: this._i18n("ui.calm"), subtitle: this._i18n("ui.soft_relaxed_music"), queries: ["relax chill playlist", "calm music", "acoustic chill"] },
        { id: "party", icon: "radio", label: this._i18n("ui.party"), subtitle: this._i18n("ui.energy_and_rhythm"), queries: ["party hits playlist", "dance playlist", "upbeat music"] },
        { id: "morning", icon: "music_note", label: this._i18n("ui.morning"), subtitle: this._i18n("ui.fresh_start"), queries: ["morning playlist", "coffee music", "feel good morning"] },
        { id: "night", icon: "moon", label: this._i18n("ui.night"), subtitle: this._i18n("ui.lower_volume_mood"), queries: ["night chill playlist", "sleep music", "quiet jazz"] },
        { id: "kids", icon: "speaker", label: this._i18n("ui.kids"), subtitle: this._i18n("ui.family_friendly"), queries: ["kids music playlist", "children songs", "family music"] },
        { id: "israeli", icon: "music_note", label: this._i18n("ui.israeli"), subtitle: this._i18n("ui.local_favorites"), queries: ["ישראלי עברית פלייליסט", "israeli music hebrew"] },
        { id: "favorites", icon: "heart_filled", label: this._i18n("ui.liked"), subtitle: this._i18n("ui.shuffle_favorites"), favorite: true },
        { id: "random", icon: "shuffle", label: this._i18n("ui.random"), subtitle: this._i18n("ui.library_surprise"), random: true },
      ];
    }

    async _controlRoomFindMixEntries(presetId = "", customQuery = "") {
      const preset = this._controlRoomMixPresets().find((item) => item.id === presetId) || null;
      const query = String(customQuery || "").trim();
      if (preset?.favorite) {
        const favorites = this._useMaLikedMode() ? await this._loadMaLikedEntries(true) : this._likedEntries();
        return favorites.filter((item) => item?.uri).slice(0, 24);
      }
      if (preset?.random) {
        const tracks = await this._fetchLibrary("track", "random", 24, false);
        return tracks.map((item) => this._controlRoomNormalizeMediaEntry(item, "track")).filter((item) => item.uri);
      }
      const queries = query ? [query] : (preset?.queries || ["music playlist"]);
      const entries = [];
      for (const currentQuery of queries) {
        try {
          const results = await this._search(currentQuery);
          entries.push(...this._controlRoomSearchEntries(results));
        } catch (_) {}
        if (entries.length >= 12) break;
      }
      return this._controlRoomUniqueEntries(entries).slice(0, 12);
    }

    _controlRoomUniqueEntries(entries = []) {
      const seen = new Set();
      return (Array.isArray(entries) ? entries : []).filter((entry) => {
        const key = String(entry?.uri || entry?.name || "").trim().toLowerCase();
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }

    async _loadControlRoomRecent() {
      this._state.controlRoomRecentLoading = true;
      this._syncControlRoomUi();
      const items = [];
      try {
        items.push(...(await this._fetchRecentlyPlayed(18)).map((item) => this._controlRoomNormalizeMediaEntry(item, item.media_type || "album")));
      } catch (_) {}
      if (this._hasDirectMAConnection()) {
        try {
          const inProgress = await this._callDirectMaCommand("music/in_progress_items", { limit: 12 });
          const rawItems = Array.isArray(inProgress?.items) ? inProgress.items : (Array.isArray(inProgress) ? inProgress : []);
          items.push(...rawItems.map((item) => this._controlRoomNormalizeMediaEntry(item, item.media_type || "podcast", {
            subtitle: this._i18n("ui.continue_listening"),
          })));
        } catch (_) {}
      }
      this._state.controlRoomRecentItems = this._controlRoomUniqueEntries(items).slice(0, 24);
      this._state.controlRoomRecentLoading = false;
      this._syncControlRoomUi({ force: true });
    }

    async _loadControlRoomFavorites() {
      this._state.controlRoomFavoritesLoading = true;
      this._syncControlRoomUi();
      let items = [];
      try {
        items = this._useMaLikedMode() ? await this._loadMaLikedEntries(true) : this._likedEntries();
      } catch (_) {
        items = this._likedEntries();
      }
      this._state.controlRoomFavoritesItems = this._controlRoomUniqueEntries(
        items.map((item) => this._controlRoomNormalizeMediaEntry(item, item.media_type || "track", {
          subtitle: this._i18n("ui.favorite"),
        }))
      ).slice(0, 36);
      this._state.controlRoomFavoritesLoading = false;
      this._syncControlRoomUi({ force: true });
    }

    _controlRoomMediaGridHtml(entries = [], options = {}) {
      const list = Array.isArray(entries) ? entries.filter((entry) => entry?.uri) : [];
      const empty = options.empty || this._i18n("ui.no_media_found");
      if (!list.length) return `<div class="control-room-empty subtle">${this._esc(empty)}</div>`;
      return `
        <div class="control-room-media-grid ${options.large ? "large" : ""}">
          ${list.map((entry) => {
            const liked = this._isEntryLiked(entry) || !!entry.favorite;
            const radioSupported = this._supportsMusicAssistantRadioMode(entry.media_type);
            const attrs = this._controlRoomEntryDataAttrs(entry);
            return `
              <article class="control-room-media-card ${liked ? "liked" : ""}">
                <button class="control-room-media-main" data-room-library-action="play" ${attrs} title="${this._esc(this._i18n("ui.play_now"))}">
                  <span class="control-room-media-art">${entry.image ? `<img src="${this._esc(entry.image)}" alt="">` : this._iconSvg(this._controlRoomMediaTypeIcon(entry.media_type))}</span>
                  <span class="control-room-media-copy">
                    <span class="control-room-media-kicker">${this._esc(this._controlRoomMediaTypeLabel(entry.media_type))}</span>
                    <span class="control-room-media-title">${this._esc(entry.name || this._i18n("ui.media"))}</span>
                    <span class="control-room-media-sub">${this._esc(entry.subtitle || entry.media_type || "")}</span>
                  </span>
                </button>
                <span class="control-room-media-actions">
                  <button type="button" class="control-room-media-action primary" data-room-library-action="play" ${attrs}>${this._esc(this._i18n("ui.play"))}</button>
                  <button type="button" class="control-room-media-action" data-room-library-action="next" ${attrs}>${this._esc(this._i18n("ui.next"))}</button>
                  <button type="button" class="control-room-media-action" data-room-library-action="add" ${attrs}>${this._esc(this._i18n("ui.add"))}</button>
                  ${radioSupported ? `<button type="button" class="control-room-media-action" data-room-library-action="radio_mode" ${attrs}>${this._esc(this._i18n("ui.radio"))}</button>` : ``}
                  <button type="button" class="control-room-media-action icon ${liked ? "active" : ""}" data-room-library-action="like" ${attrs} title="${this._esc(this._i18n("ui.like_2"))}">${this._iconSvg(liked ? "heart_filled" : "heart_outline")}</button>
                </span>
              </article>
            `;
          }).join("")}
        </div>
      `;
    }

    async _prepareControlRoomPlaybackTargets() {
      const selectedIds = this._controlRoomSelectedPlayerIds();
      const primaryId = selectedIds[0] || this._controlRoomPrimaryPlayerId();
      if (!primaryId) return "";
      const groupMembers = selectedIds.slice(1);
      if (groupMembers.length) {
        await this._applySpeakerGroupFor(primaryId, groupMembers);
      }
      return primaryId;
    }

    async _playControlRoomEntries(entries = [], options = {}) {
      const playable = (Array.isArray(entries) ? entries : []).filter((entry) => entry?.uri);
      const primaryId = await this._prepareControlRoomPlaybackTargets();
      if (!primaryId || !playable.length) return false;
      const first = playable[0];
      const firstOk = await this._playMediaOnPlayer(primaryId, first.uri, first.media_type || "track", options.shuffle ? "shuffle" : "play", {
        label: first.name || "",
        silent: true,
        radioMode: !!options.radioMode,
      });
      if (!firstOk) return false;
      for (const entry of playable.slice(1, 40)) {
        await this._playMediaOnPlayer(primaryId, entry.uri, entry.media_type || "track", "add", {
          label: entry.name || "",
          silent: true,
        });
      }
      if (!options.silent) {
        this._toastSuccess(this._m(
          `Started ${playable.length} items in Studio`,
          `${playable.length} פריטים הופעלו בסטודיו`
        ));
      }
      setTimeout(() => this._updateNowPlayingState(), 500);
      return true;
    }

    async _startControlRoomMix(presetId = "", sourceEl = null) {
      const customInput = this.$("controlRoomSmartQueryInput");
      const customQuery = customInput?.value || this._state.controlRoomSmartQuery || "";
      if (sourceEl) this._pressUiButton(sourceEl);
      this._toast(this._i18n("ui.building_studio_mix"));
      try {
        const entries = await this._controlRoomFindMixEntries(presetId, customQuery);
        if (!entries.length) {
          this._toastError(this._i18n("ui.no_mix_content_found"));
          return false;
        }
        const ok = await this._playControlRoomEntries(entries, { shuffle: presetId === "favorites" || presetId === "random" });
        if (ok) {
          this._state.controlRoomPanel = "";
          this._toastSuccess(this._i18n("ui.studio_mix_started"));
        }
        return ok;
      } catch (error) {
        this._toastError(error?.message || this._i18n("ui.could_not_build_studio_mix"));
        return false;
      }
    }

    async _cloneQueueBetween(sourcePlayerEntityId, targetPlayerEntityId, options = {}) {
      const sourcePlayer = this._playerByEntityId(sourcePlayerEntityId);
      if (!sourcePlayer || !targetPlayerEntityId || sourcePlayer.entity_id === targetPlayerEntityId) return false;
      try {
        const snapshot = await this._fetchControlRoomQueueSnapshot(sourcePlayer.entity_id);
        const items = HomeiiMediaQueueFoundation.sortQueueItems(snapshot?.items || []);
        if (!items.length) throw new Error(this._i18n("ui.no_queue_to_clone"));
        const currentPos = sourcePlayer.entity_id === this._state.selectedPlayer ? this._getCurrentPosition() : 0;
        await this._rebuildQueue(targetPlayerEntityId, items, currentPos);
        if (options.selectTarget !== false) this._selectPlayer(targetPlayerEntityId, true);
        if (!options.silent) this._toastSuccess(this._i18n("ui.queue_cloned"));
        this._loadControlRoomQueues([sourcePlayer.entity_id, targetPlayerEntityId]).catch(() => {});
        return true;
      } catch (error) {
        if (!options.silent) this._toastError(error?.message || this._i18n("ui.could_not_clone_the_queue"));
        return false;
      }
    }

    async _sendControlRoomAnnouncement(sourceEl = null) {
      const input = this.$("controlRoomAnnouncementText");
      const volumeInput = this.$("controlRoomAnnouncementVolumeInput");
      const message = String(input?.value || this._state.controlRoomAnnouncementText || "").trim();
      if (!message) {
        this._toastError(this._i18n("ui.enter_an_announcement_first"));
        return false;
      }
      const selectedIds = this._controlRoomSelectedPlayerIds();
      const targets = selectedIds.length ? selectedIds : [this._controlRoomPrimaryPlayerId()].filter(Boolean);
      if (!targets.length) {
        this._toastError(this._i18n("ui.select_at_least_one_studio_player"));
        return false;
      }
      if (sourceEl) this._pressUiButton(sourceEl);
      const previousText = this._state.mobileAnnouncementText;
      const previousTarget = this._state.mobileAnnouncementTarget;
      const previousVolume = this._state.mobileAnnouncementVolume;
      this._state.mobileAnnouncementText = message;
      this._state.mobileAnnouncementTarget = targets.length === this._announcementEligiblePlayers().length ? "all" : targets[0];
      this._state.mobileAnnouncementVolume = Math.max(20, Math.min(50, Number(volumeInput?.value || this._state.controlRoomAnnouncementVolume || 20) || 20));
      try {
        if (targets.length === 1) {
          await this._sendMobileAnnouncement();
        } else {
          const eligibleMap = new Map(this._announcementEligiblePlayers().map((player) => [player.entity_id, player]));
          const volumeSnapshots = this._prepareAnnouncementVolumes(targets.map((entityId) => eligibleMap.get(entityId)).filter(Boolean));
          for (const entityId of targets) {
            this._state.mobileAnnouncementTarget = entityId;
            await this._sendMobileAnnouncement();
          }
          this._scheduleAnnouncementVolumeRestore(volumeSnapshots, this._announcementRestoreDelayMs(message));
        }
        return true;
      } finally {
        this._state.mobileAnnouncementText = previousText;
        this._state.mobileAnnouncementTarget = previousTarget;
        this._state.mobileAnnouncementVolume = previousVolume;
      }
    }

    _controlRoomScenesStorageKey() {
      return "homeii_music_flow_control_room_scenes_v1";
    }

    _normalizeControlRoomScene(scene = {}, index = 0) {
      const rawId = String(scene?.id || `custom:${Date.now()}_${index}`).trim();
      const id = rawId.startsWith("custom:") ? rawId : `custom:${rawId}`;
      const playerIds = Array.isArray(scene?.playerIds)
        ? scene.playerIds.map((entityId) => String(entityId || "").trim()).filter(Boolean)
        : [];
      const visibleIds = Array.isArray(scene?.visibleIds)
        ? scene.visibleIds.map((entityId) => String(entityId || "").trim()).filter(Boolean)
        : [];
      const volumes = {};
      if (scene?.volumes && typeof scene.volumes === "object") {
        Object.entries(scene.volumes).forEach(([entityId, value]) => {
          const pct = Math.max(0, Math.min(1, Number(value)));
          if (entityId && Number.isFinite(pct)) volumes[String(entityId)] = pct;
        });
      }
      const media = scene?.media && typeof scene.media === "object"
        ? {
            uri: String(scene.media.uri || "").trim(),
            media_type: String(scene.media.media_type || scene.media.type || "track").trim() || "track",
            name: String(scene.media.name || "").trim(),
          }
        : { uri: "", media_type: "track", name: "" };
      return {
        id,
        name: String(scene?.name || "").trim() || this._i18n("ui.studio_scene"),
        primaryId: String(scene?.primaryId || playerIds[0] || "").trim(),
        playerIds: [...new Set(playerIds)],
        visibleIds: [...new Set(visibleIds)],
        volumes,
        group: scene?.group !== false,
        media,
        createdAt: Number(scene?.createdAt || Date.now()) || Date.now(),
      };
    }

    _loadControlRoomScenesFromStorage() {
      try {
        const raw = JSON.parse(localStorage.getItem(this._controlRoomScenesStorageKey()) || "[]");
        this._state.controlRoomCustomScenes = Array.isArray(raw)
          ? raw.map((scene, index) => this._normalizeControlRoomScene(scene, index)).filter((scene) => scene.playerIds.length).slice(0, 12)
          : [];
      } catch (_) {
        this._state.controlRoomCustomScenes = [];
      }
    }

    _persistControlRoomScenes() {
      try {
        localStorage.setItem(this._controlRoomScenesStorageKey(), JSON.stringify(this._controlRoomCustomScenes()));
      } catch (_) {}
    }

    _controlRoomCustomScenes() {
      return (Array.isArray(this._state.controlRoomCustomScenes) ? this._state.controlRoomCustomScenes : [])
        .map((scene, index) => this._normalizeControlRoomScene(scene, index))
        .filter((scene) => scene.playerIds.length)
        .slice(0, 12);
    }

    _captureControlRoomScene(name = "") {
      const selectedIds = this._controlRoomSelectedPlayerIds();
      const primaryId = this._controlRoomPrimaryPlayerId();
      const targets = selectedIds.length ? selectedIds : [primaryId].filter(Boolean);
      if (!targets.length) return null;
      const primary = this._playerByEntityId(primaryId || targets[0]);
      const attrs = primary?.attributes || {};
      const volumes = {};
      targets.forEach((entityId) => {
        const player = this._playerByEntityId(entityId);
        const volume = Number(player?.attributes?.volume_level);
        if (Number.isFinite(volume)) volumes[entityId] = Math.max(0, Math.min(1, volume));
      });
      const mediaUri = String(attrs.media_content_id || attrs.media_uri || attrs.uri || "").trim();
      const mediaType = String(attrs.media_content_type || attrs.media_type || "track").trim() || "track";
      return this._normalizeControlRoomScene({
        id: `custom:${Date.now().toString(36)}`,
        name: String(name || "").trim() || this._i18n("ui.my_studio_scene"),
        primaryId: primaryId || targets[0],
        playerIds: targets,
        visibleIds: this._controlRoomVisiblePlayerIds(),
        volumes,
        group: targets.length > 1,
        media: {
          uri: mediaUri,
          media_type: mediaType,
          name: attrs.media_title || "",
        },
        createdAt: Date.now(),
      });
    }

    _saveControlRoomSceneFromStudio(sourceEl = null) {
      if (sourceEl) this._pressUiButton(sourceEl);
      const input = this.$("controlRoomSceneNameInput");
      const scene = this._captureControlRoomScene(input?.value || this._state.controlRoomSceneName || "");
      if (!scene) {
        this._toastError(this._i18n("ui.select_at_least_one_studio_player"));
        return false;
      }
      this._state.controlRoomCustomScenes = [scene, ...this._controlRoomCustomScenes()].slice(0, 12);
      this._state.controlRoomSceneName = "";
      if (input) input.value = "";
      this._persistControlRoomScenes();
      this._syncControlRoomUi({ force: true });
      this._toastSuccess(this._i18n("ui.studio_scene_saved"));
      return true;
    }

    _deleteControlRoomScene(sceneId = "", sourceEl = null) {
      if (sourceEl) this._pressUiButton(sourceEl);
      const id = String(sceneId || "").trim();
      if (!id) return false;
      this._state.controlRoomCustomScenes = this._controlRoomCustomScenes().filter((scene) => scene.id !== id);
      this._persistControlRoomScenes();
      this._syncControlRoomUi({ force: true });
      this._toastSuccess(this._i18n("ui.studio_scene_deleted"));
      return true;
    }

    async _applySavedControlRoomScene(scene = null, sourceEl = null) {
      const saved = scene ? this._normalizeControlRoomScene(scene) : null;
      if (!saved) return false;
      const allPlayers = this._controlRoomAllPlayers();
      const validIds = new Set(allPlayers.map((player) => player.entity_id));
      const selected = saved.playerIds.filter((entityId) => validIds.has(entityId));
      if (!selected.length) {
        this._toastError(this._i18n("ui.scene_players_are_not_available"));
        return false;
      }
      const primaryId = selected.includes(saved.primaryId) ? saved.primaryId : selected[0];
      const ordered = [primaryId, ...selected.filter((entityId) => entityId !== primaryId)];
      const visible = [...new Set([
        ...this._controlRoomVisiblePlayerIds(),
        ...ordered,
        ...saved.visibleIds.filter((entityId) => validIds.has(entityId)),
      ])];
      this._state.controlRoomVisiblePlayers = visible;
      this._state.controlRoomSelectedPlayers = ordered;
      this._syncControlRoomTransferDefaults();
      if (sourceEl) this._pressUiButton(sourceEl);
      if (ordered.length > 1 && saved.group) {
        await this._applySpeakerGroupFor(primaryId, ordered.slice(1));
      }
      await Promise.allSettled(ordered.map((entityId) => {
        const volume = saved.volumes?.[entityId];
        return Number.isFinite(volume) ? this._setPlayerVolumeFor(entityId, volume) : Promise.resolve();
      }));
      if (saved.media?.uri) {
        await this._playMediaOnPlayer(primaryId, saved.media.uri, saved.media.media_type || "track", "play", {
          label: saved.media.name || saved.name,
          silent: true,
        });
      }
      this._syncControlRoomUi({ force: true });
      this._toastSuccess(this._m(`Scene "${saved.name}" applied`, `הסצנה "${saved.name}" הופעלה`));
      setTimeout(() => this._updateNowPlayingState(), 350);
      return true;
    }

    async _applyControlRoomScene(sceneId = "", sourceEl = null) {
      if (sourceEl) this._pressUiButton(sourceEl);
      const scene = String(sceneId || "home");
      if (scene.startsWith("custom:")) {
        const saved = this._controlRoomCustomScenes().find((item) => item.id === scene);
        if (!saved) {
          this._toastError(this._i18n("ui.studio_scene_was_not_found"));
          return false;
        }
        return this._applySavedControlRoomScene(saved, sourceEl);
      }
      const selectedIds = this._controlRoomSelectedPlayerIds();
      const primaryId = selectedIds[0] || this._controlRoomPrimaryPlayerId();
      if (!primaryId) {
        this._toastError(this._i18n("ui.select_at_least_one_studio_player"));
        return false;
      }
      const targets = selectedIds.length ? selectedIds : [primaryId];
      if (targets.length > 1) await this._applySpeakerGroupFor(primaryId, targets.slice(1));
      const volume = scene === "night" ? 0.18 : scene === "party" ? 0.55 : 0.35;
      await Promise.allSettled(targets.map((entityId) => this._setPlayerVolumeFor(entityId, volume)));
      if (scene === "home") {
        this._toastSuccess(this._i18n("ui.home_scene_prepared"));
        return true;
      }
      const mixId = scene === "party" ? "party" : "night";
      return this._startControlRoomMix(mixId, sourceEl);
    }

    _controlRoomSearchEntries(results = {}) {
      const groups = [
        ["playlists", "playlist"],
        ["albums", "album"],
        ["tracks", "track"],
        ["artists", "artist"],
        ["radio", "radio"],
        ["podcasts", "podcast"],
      ];
      const entries = [];
      groups.forEach(([bucket, mediaType]) => {
        (Array.isArray(results?.[bucket]) ? results[bucket] : []).slice(0, 4).forEach((item) => {
          entries.push(this._controlRoomNormalizeMediaEntry(item, mediaType));
        });
      });
      return entries.filter((entry) => entry.uri).slice(0, 14);
    }

    async _searchControlRoomLibrary(query = "") {
      const rawQuery = String(query || "");
      const normalizedQuery = rawQuery.trim();
      this._state.controlRoomLibraryQuery = rawQuery;
      if (!normalizedQuery) {
        this._state.controlRoomLibraryLoading = false;
        this._state.controlRoomLibraryResults = [];
        this._syncControlRoomLibraryResultsUi();
        return;
      }
      const token = Date.now();
      this._state.controlRoomLibraryToken = token;
      this._state.controlRoomLibraryLoading = true;
      this._syncControlRoomLibraryResultsUi();
      try {
        const results = await this._search(normalizedQuery);
        if (this._state.controlRoomLibraryToken !== token) return;
        this._state.controlRoomLibraryResults = this._controlRoomSearchEntries(results);
      } catch (_) {
        if (this._state.controlRoomLibraryToken !== token) return;
        this._state.controlRoomLibraryResults = [];
      }
      if (this._state.controlRoomLibraryToken !== token) return;
      this._state.controlRoomLibraryLoading = false;
      this._syncControlRoomLibraryResultsUi();
    }

    _syncControlRoomLibraryResultsUi() {
      const host = this.$("controlRoomLibraryResults");
      if (host && this._state.controlRoomPanel === "library") {
        host.innerHTML = this._controlRoomLibraryResultsHtml();
        return;
      }
      this._syncControlRoomUi();
    }

    async _startControlRoomLibraryVoice() {
      const SpeechRecognition = this._speechRecognitionCtor();
      if (!SpeechRecognition) {
        this._toastError(this._i18n("ui.voice_input_is_not_supported_on_this_device"));
        return;
      }
      try { this._voiceRecognition?.abort?.(); } catch {}
      const recognition = new SpeechRecognition();
      this._voiceRecognition = recognition;
      recognition.lang = this._isHebrew() ? "he-IL" : "en-US";
      recognition.interimResults = true;
      recognition.continuous = false;
      recognition.maxAlternatives = 1;
      this._toast(this._i18n("ui.listening"));
      recognition.onresult = (event) => {
        const transcript = Array.from(event.results || [])
          .map((result) => result?.[0]?.transcript || "")
          .join(" ")
          .trim();
        if (!transcript) return;
        this._state.controlRoomLibraryQuery = transcript;
        this._state.controlRoomPanel = "library";
        this._syncControlRoomUi();
        const input = this.$("controlRoomLibraryInput");
        if (input) {
          input.value = transcript;
          input.focus({ preventScroll: true });
          input.setSelectionRange(transcript.length, transcript.length);
        }
        clearTimeout(this._searchTimer);
        this._searchTimer = setTimeout(() => this._searchControlRoomLibrary(transcript), 120);
      };
      recognition.onerror = () => this._toastError(this._i18n("ui.voice_input_failed"));
      recognition.onend = () => {
        if (this._voiceRecognition === recognition) this._voiceRecognition = null;
      };
      try { recognition.start(); } catch (_) { this._toastError(this._i18n("ui.voice_input_failed")); }
    }

    async _playControlRoomLibraryEntry(entry, mode = "play") {
      const action = String(mode || "play");
      if (!entry?.uri) return false;
      if (action === "like") {
        await this._toggleLikeEntry(entry);
        return true;
      }
      const primaryId = await this._prepareControlRoomPlaybackTargets();
      if (!primaryId) return false;
      const mediaType = entry.media_type || "album";
      if (action === "radio_mode" && !this._supportsMusicAssistantRadioMode(mediaType)) {
        this._toastError(this._i18n("ui.radio_mode_is_not_available_for_this_media_type"));
        return false;
      }
      const enqueue = action === "next" ? "next" : action === "add" ? "add" : action === "shuffle" ? "shuffle" : "play";
      return this._playMediaOnPlayer(primaryId, entry.uri, mediaType, enqueue, {
        label: entry.name || "",
        silent: action !== "play",
        radioMode: action === "radio_mode",
      });
    }

    _controlRoomPlayerTileHtml(player) {
      const selectedIds = this._controlRoomSelectedPlayerIds();
      const primaryId = this._controlRoomPrimaryPlayerId();
      const isSelected = selectedIds.includes(player.entity_id);
      const isPrimary = primaryId === player.entity_id;
      const playing = player.state === "playing";
      const art = this._playerArtworkUrl(player, 320);
      const name = player.attributes?.friendly_name || player.entity_id;
      const track = player.attributes?.media_title || this._i18n("ui.idle_2");
      const volume = Math.round((player.attributes?.volume_level || 0) * 100);
      const groupInfo = this._controlRoomGroupInfo(player);
      const groupCount = groupInfo.count;
      const stateLabel = this._playerStateLabel(player);
      const snapshot = this._controlRoomQueueCache(player.entity_id);
      const queueCount = this._controlRoomQueueCount(player, snapshot);
      const protocolLabel = this._controlRoomProtocolLabel(player);
      const muted = this._isMuted(player);
      const tileStyle = art ? `style="--control-room-tile-art:url('${this._esc(art)}')"` : "";
      return `
        <article class="control-room-tile ${art ? "has-art" : "no-art"} ${isSelected ? "selected" : ""} ${isPrimary ? "primary" : ""} ${playing ? "is-playing" : ""} ${groupCount ? "grouped" : ""}" data-room-tile="${this._esc(player.entity_id)}" ${tileStyle}>
          <div class="control-room-tile-bg"></div>
          <div class="control-room-tile-shade"></div>
          <button class="control-room-select-fab ${isSelected ? "active" : ""} ${isSelected && selectedIds.length > 1 ? "removable" : ""}" data-room-select="${this._esc(player.entity_id)}" title="${this._esc(isSelected && selectedIds.length > 1 ? this._i18n("ui.remove_from_selection") : isSelected ? this._i18n("ui.selected_player_2") : this._i18n("ui.add_to_selection"))}">
            ${this._iconSvg(isSelected && selectedIds.length > 1 ? "close" : isSelected ? "check" : "grid")}
            <span class="control-room-select-label">${this._esc(isSelected && selectedIds.length > 1 ? this._i18n("ui.remove") : isSelected ? this._i18n("ui.selected") : this._i18n("ui.select"))}</span>
          </button>
          <button class="control-room-tile-main" data-room-primary="${this._esc(player.entity_id)}" title="${this._esc(name)}">
            <span class="control-room-tile-copy">
              <span class="control-room-tile-pills">
                ${isPrimary ? `<span class="control-room-primary-pill">${this._esc(this._i18n("ui.primary"))}</span>` : ``}
                ${groupCount ? `<span class="control-room-float-pill grouped" title="${this._esc(groupInfo.label || this._i18n("ui.grouped_players"))}">${this._iconSvg("speaker")}${this._esc(this._m(`${groupCount} grouped`, `${groupCount} בקבוצה`))}</span>` : ``}
                ${queueCount ? `<span class="control-room-float-pill">${this._iconSvg("queue")}${this._esc(`${queueCount}`)}</span>` : ``}
                ${protocolLabel ? `<span class="control-room-float-pill protocol">${this._esc(protocolLabel)}</span>` : ``}
                ${playing ? `<span class="control-room-float-pill live">${this._esc(this._i18n("ui.playing"))}</span>` : ``}
              </span>
              <span class="control-room-tile-track">${this._esc(track)}</span>
              <span class="control-room-tile-name">${this._esc(name)}</span>
              <span class="control-room-tile-state">${this._esc(stateLabel)}</span>
            </span>
          </button>
          <div class="control-room-tile-actions">
            <button type="button" data-room-toggle-play="${this._esc(player.entity_id)}" title="${this._esc(this._i18n("ui.play_pause"))}">${this._iconSvg(playing ? "pause" : "play")}</button>
            <button type="button" data-room-next="${this._esc(player.entity_id)}" title="${this._esc(this._i18n("ui.next"))}">${this._iconSvg("next")}</button>
            <button type="button" class="${muted ? "active" : ""}" data-room-mute="${this._esc(player.entity_id)}" title="${this._esc(this._i18n("ui.mute"))}">${this._iconSvg(muted ? "volume_mute" : this._volumeIconName(player))}</button>
          </div>
          <label class="control-room-volume-row">
            <input class="control-room-volume" data-room-volume="${this._esc(player.entity_id)}" type="range" min="0" max="100" value="${volume}" style="--vol-pct:${volume}%">
            <span class="control-room-volume-value" data-room-volume-value="${this._esc(player.entity_id)}">${this._esc(String(volume))}%</span>
          </label>
        </article>
      `;
    }

    _controlRoomLibraryResultsHtml() {
      const loading = !!this._state.controlRoomLibraryLoading;
      const results = Array.isArray(this._state.controlRoomLibraryResults) ? this._state.controlRoomLibraryResults : [];
      const query = String(this._state.controlRoomLibraryQuery || "").trim();
      if (loading) return `<div class="control-room-empty subtle">${this._esc(this._i18n("ui.searching_library"))}</div>`;
      if (!query) return `<div class="control-room-empty subtle">${this._esc(this._i18n("ui.search_and_choose_play_next_add_radio_or_like"))}</div>`;
      return this._controlRoomMediaGridHtml(results, {
        empty: this._i18n("ui.no_media_found_for_this_search"),
        large: true,
      });
    }

    _controlRoomPanelHtml(players = []) {
      const panel = String(this._state.controlRoomPanel || "");
      if (!panel) return ``;
      const context = this._controlRoomContextChipHtml();
      if (panel === "selection") {
        return `
          <div class="control-room-tray open compact">
            <div class="control-room-tray-head">
              <div class="control-room-tray-title">${this._esc(this._i18n("ui.connected_players_2"))}</div>
              <div class="control-room-tray-sub">${this._esc(this._i18n("ui.choose_which_players_stay_in_the_current_control_selection"))}</div>
            </div>
            ${this._controlRoomPlayerChoiceRows("selection")}
          </div>
        `;
      }
      if (panel === "visible") {
        return `
          <div class="control-room-tray open compact">
            <div class="control-room-tray-head">
              <div class="control-room-tray-title">${this._esc(this._i18n("ui.visible_tiles_2"))}</div>
              <div class="control-room-tray-sub">${this._esc(this._i18n("ui.choose_which_players_appear_as_tiles_in_the_room"))}</div>
            </div>
            ${this._controlRoomPlayerChoiceRows("visible")}
          </div>
        `;
      }
      if (panel === "music") {
        return `
          <div class="control-room-tray open wide control-room-hub-panel">
            <div class="control-room-tray-head">
              <div class="control-room-tray-title">${this._esc(this._i18n("ui.music_hub_2"))}</div>
              <div class="control-room-tray-sub">${this._esc(this._i18n("ui.choose_the_source_first_playback_will_use_the_current_target"))}</div>
            </div>
            ${context}
            <div class="control-room-library-shortcuts">
              <button data-room-selection-action="browse_library">${this._iconSvg("playlist")}<span>${this._esc(this._i18n("ui.playlists"))}</span></button>
              <button data-room-selection-action="browse_artists">${this._iconSvg("artist")}<span>${this._esc(this._i18n("ui.artists"))}</span></button>
              <button data-room-selection-action="browse_albums">${this._iconSvg("album")}<span>${this._esc(this._i18n("ui.albums"))}</span></button>
              <button data-room-selection-action="browse_tracks">${this._iconSvg("tracks")}<span>${this._esc(this._i18n("ui.tracks"))}</span></button>
              <button data-room-selection-action="browse_radio">${this._iconSvg("radio")}<span>${this._esc(this._i18n("ui.radio"))}</span></button>
            </div>
            <div class="control-room-hub-grid">
              <button class="control-room-hub-card primary" data-room-selection-action="browse_library">${this._iconSvg("library_music")}<span>${this._esc(this._i18n("ui.library"))}</span><small>${this._esc(this._i18n("ui.browse_playlists_artists_albums_and_radio"))}</small></button>
              <button class="control-room-hub-card" data-room-selection-action="library">${this._iconSvg("search")}<span>${this._esc(this._i18n("ui.search"))}</span><small>${this._esc(this._i18n("ui.search_tracks_albums_artists_and_playlists"))}</small></button>
              <button class="control-room-hub-card" data-room-selection-action="mix">${this._iconSvg("wand")}<span>${this._esc(this._i18n("ui.flow_mix"))}</span><small>${this._esc(this._i18n("ui.mood_style_or_free_text"))}</small></button>
              <button class="control-room-hub-card" data-room-selection-action="recent">${this._iconSvg("history")}<span>${this._esc(this._i18n("ui.recent"))}</span><small>${this._esc(this._i18n("ui.continue_what_was_played_recently"))}</small></button>
              <button class="control-room-hub-card" data-room-selection-action="favorites">${this._iconSvg("heart_filled")}<span>${this._esc(this._i18n("ui.liked"))}</span><small>${this._esc(this._i18n("ui.favorites_and_liked_music"))}</small></button>
              <button class="control-room-hub-card" data-room-selection-action="scenes">${this._iconSvg("home")}<span>${this._esc(this._i18n("ui.scenes"))}</span><small>${this._esc(this._i18n("ui.home_party_night_presets"))}</small></button>
            </div>
          </div>
        `;
      }
      if (panel === "actions") {
        const targetIds = this._controlRoomActionTargetIds();
        const targetCount = targetIds.length;
        const actionTarget = this._controlRoomFocusTarget();
        const actionArt = actionTarget.art || "";
        const primary = this._controlRoomPrimaryPlayer();
        const primaryPlaying = primary?.state === "playing";
        const primaryMuted = primary ? this._isMuted(primary) : false;
        return `
          <div class="control-room-tray open wide control-room-hub-panel">
            <div class="control-room-tray-head">
              <div class="control-room-tray-title">${this._esc(this._i18n("ui.actions_2"))}</div>
              <div class="control-room-tray-sub">${this._esc(this._i18n("ui.only_actions_for_the_current_target_are_shown_here"))}</div>
            </div>
            <div class="control-room-action-console">
              <div class="control-room-action-now">
                <span class="control-room-action-art">${actionArt ? `<img src="${this._esc(actionArt)}" alt="">` : this._iconSvg("speaker")}</span>
                <span class="control-room-action-copy">
                  <span class="control-room-action-kicker">${this._esc(actionTarget.kicker)}</span>
                  <span class="control-room-action-name">${this._esc(actionTarget.name)}</span>
                  <span class="control-room-action-track">${this._esc(actionTarget.track)}</span>
                </span>
              </div>
              <div class="control-room-media-controls">
                <button class="control-room-media-control primary" data-room-selection-action="playpause" ${targetCount ? "" : "disabled"}>${this._iconSvg(primaryPlaying ? "pause" : "play")}<span>${this._esc(primaryPlaying ? this._i18n("ui.pause") : this._i18n("ui.play"))}</span></button>
                <button class="control-room-media-control" data-room-selection-action="next" ${targetCount ? "" : "disabled"}>${this._iconSvg("next")}<span>${this._esc(this._i18n("ui.next"))}</span></button>
                <button class="control-room-media-control ${primaryMuted ? "active" : ""}" data-room-selection-action="mute" ${targetCount ? "" : "disabled"}>${this._iconSvg(primaryMuted ? "volume_mute" : (primary ? this._volumeIconName(primary) : "speaker"))}<span>${this._esc(this._i18n("ui.mute"))}</span></button>
                <button class="control-room-media-control danger" data-room-selection-action="clear" ${targetCount ? "" : "disabled"}>${this._iconSvg("trash")}<span>${this._esc(this._i18n("ui.clear_queue"))}</span></button>
              </div>
            </div>
            <div class="control-room-action-grid management">
              <button class="control-room-hub-card" data-room-selection-action="selection">${this._iconSvg("grid")}<span>${this._esc(this._i18n("ui.target_players"))}</span><small>${this._esc(this._i18n("ui.choose_who_is_controlled"))}</small></button>
              <button class="control-room-hub-card" data-room-selection-action="visible">${this._iconSvg("grid")}<span>${this._esc(this._i18n("ui.visible_tiles_2"))}</span><small>${this._esc(this._i18n("ui.clean_the_studio_wall"))}</small></button>
              <button class="control-room-hub-card" data-room-selection-action="group" ${targetCount > 1 ? "" : "disabled"}>${this._iconSvg("speaker")}<span>${this._esc(this._i18n("ui.group"))}</span><small>${this._esc(this._i18n("ui.join_selected_players"))}</small></button>
              <button class="control-room-hub-card" data-room-selection-action="ungroup" ${targetCount ? "" : "disabled"}>${this._iconSvg("close")}<span>${this._esc(this._i18n("ui.ungroup_2"))}</span><small>${this._esc(this._i18n("ui.disconnect_groups"))}</small></button>
              <button class="control-room-hub-card danger" data-room-selection-action="stop_all">${this._iconSvg("stop")}<span>${this._esc(this._i18n("ui.stop_all"))}</span><small>${this._esc(this._i18n("ui.stop_playback_clear_queues_and_disconnect_groups"))}</small></button>
              <button class="control-room-hub-card" data-room-selection-action="announce">${this._iconSvg("announcement")}<span>${this._esc(this._i18n("ui.announcement"))}</span><small>${this._esc(this._i18n("ui.speak_to_target_players"))}</small></button>
              <button class="control-room-hub-card" data-room-selection-action="timers">${this._iconSvg("timer")}<span>${this._esc(this._i18n("ui.timers"))}</span><small>${this._esc(this._i18n("ui.sleep_timer_and_scheduled_playback"))}</small></button>
              <button class="control-room-hub-card" data-room-selection-action="open_ma">${this._iconSvg("library_music")}<span>${this._esc(this._i18n("ui.open_ma"))}</span><small>${this._esc(this._i18n("ui.open_the_full_music_assistant_interface_2"))}</small></button>
              <button class="control-room-hub-card" data-room-selection-action="pro">${this._iconSvg("settings")}<span>${this._esc(this._i18n("ui.pro_tools"))}</span><small>${this._esc(this._i18n("ui.sendspin_and_diagnostics"))}</small></button>
            </div>
          </div>
        `;
      }
      if (panel === "transfer") {
        const source = this._state.controlRoomTransferSource || "";
        const target = this._state.controlRoomTransferTarget || "";
        const sourcePlayer = this._playerByEntityId(source);
        const targetPlayer = this._playerByEntityId(target);
        const sourceName = sourcePlayer?.attributes?.friendly_name || source || this._i18n("ui.choose_source");
        const targetName = targetPlayer?.attributes?.friendly_name || target || this._i18n("ui.choose_target");
        const targetPlayers = players.filter((player) => player.entity_id !== source);
        const transferChoiceRows = (role, options, selectedId) => `
          <div class="control-room-transfer-list" data-control-room-scroll="transfer-${this._esc(role)}">
            ${options.length ? options.map((player) => {
              const art = this._playerArtworkUrl(player, 120);
              const isActive = player.entity_id === selectedId;
              return `
                <button class="control-room-transfer-choice ${isActive ? "active" : ""}" data-room-transfer-${role}="${this._esc(player.entity_id)}">
                  <span class="control-room-transfer-art">${art ? `<img src="${this._esc(art)}" alt="">` : this._iconSvg("speaker")}</span>
                  <span class="control-room-transfer-copy">
                    <span class="control-room-transfer-title">${this._esc(player.attributes?.friendly_name || player.entity_id)}</span>
                    <span class="control-room-transfer-sub">${this._esc(player.attributes?.media_title || this._playerStateLabel(player))}</span>
                  </span>
                  <span class="control-room-transfer-check">${isActive ? this._iconSvg("check") : ""}</span>
                </button>
              `;
            }).join("") : `<div class="control-room-empty subtle">${this._esc(this._i18n("ui.no_available_players"))}</div>`}
          </div>
        `;
        return `
          <div class="control-room-tray open transfer-panel">
            <div class="control-room-tray-head">
              <div class="control-room-tray-title">${this._esc(this._i18n("ui.queue_cockpit_2"))}</div>
              <div class="control-room-tray-sub">${this._esc(this._i18n("ui.transfer_clone_inspect_or_clear_queues_without_hiding_the_studio"))}</div>
            </div>
            <div class="control-room-queue-layout">
              <div class="control-room-queue-lanes">
                <section class="control-room-queue-lane source">
                  <div class="control-room-queue-lane-head">
                    <span>${this._esc(this._i18n("ui.from"))}</span>
                    <strong>${this._esc(sourceName)}</strong>
                  </div>
                  ${transferChoiceRows("source", players, source)}
                  <div class="control-room-transfer-label">${this._esc(this._i18n("ui.source_queue"))}</div>
                  ${source ? this._controlRoomQueuePreviewHtml(source) : `<div class="control-room-empty subtle">${this._esc(this._i18n("ui.choose_a_source_player"))}</div>`}
                </section>
                <section class="control-room-queue-lane target">
                  <div class="control-room-queue-lane-head">
                    <span>${this._esc(this._i18n("ui.to"))}</span>
                    <strong>${this._esc(targetName)}</strong>
                  </div>
                  ${transferChoiceRows("target", targetPlayers, target)}
                  <div class="control-room-transfer-label">${this._esc(this._i18n("ui.target_queue"))}</div>
                  ${target ? this._controlRoomQueuePreviewHtml(target) : `<div class="control-room-empty subtle">${this._esc(this._i18n("ui.choose_a_target_player"))}</div>`}
                </section>
              </div>
              <div class="control-room-queue-actions">
                <button class="control-room-panel-action primary" data-room-transfer ${source && target ? "" : "disabled"}>${this._iconSvg("queue")}<span>${this._esc(this._i18n("ui.transfer_queue_2"))}</span></button>
                <button class="control-room-panel-action" data-room-clone ${source && target ? "" : "disabled"}>${this._iconSvg("repeat")}<span>${this._esc(this._i18n("ui.clone_queue"))}</span></button>
                <button class="control-room-panel-action" data-room-refresh-queues>${this._iconSvg("sync")}<span>${this._esc(this._i18n("ui.refresh"))}</span></button>
                <button class="control-room-panel-action danger" data-room-clear-queue="${this._esc(target || source || "")}" ${source || target ? "" : "disabled"}>${this._iconSvg("trash")}<span>${this._esc(this._i18n("ui.clear_queue"))}</span></button>
              </div>
            </div>
          </div>
        `;
      }
      if (panel === "library") {
        return `
          <div class="control-room-tray open wide">
            <label class="control-room-search">
              ${this._iconSvg("search")}
              <input id="controlRoomLibraryInput" type="search" placeholder="${this._esc(this._i18n("ui.search_the_library"))}" value="${this._esc(this._state.controlRoomLibraryQuery || "")}" autocomplete="off" spellcheck="false">
              <button type="button" class="control-room-search-mic" data-room-library-mic title="${this._esc(this._i18n("ui.voice_search"))}">
                ${this._iconSvg("mic")}
              </button>
            </label>
            <div class="control-room-library-results" id="controlRoomLibraryResults" data-control-room-scroll="library">${this._controlRoomLibraryResultsHtml()}</div>
          </div>
        `;
      }
      if (panel === "mix") {
        return `
          <div class="control-room-tray open wide">
            <div class="control-room-tray-head">
              <div class="control-room-tray-title">${this._esc(this._i18n("ui.smart_mix_builder"))}</div>
              <div class="control-room-tray-sub">${this._esc(this._i18n("ui.pick_a_mood_or_type_your_own_style_studio_will_search_music_assistant_an"))}</div>
            </div>
            <div class="control-room-mix-panel">
              <label class="control-room-search">
                ${this._iconSvg("wand")}
                <input id="controlRoomSmartQueryInput" type="search" placeholder="${this._esc(this._i18n("ui.free_style_quiet_jazz_greek_music_workout"))}" value="${this._esc(this._state.controlRoomSmartQuery || "")}" autocomplete="off" spellcheck="false">
                <button type="button" class="control-room-search-mic" data-room-smart-custom title="${this._esc(this._i18n("ui.build_custom_mix"))}">${this._iconSvg("play")}</button>
              </label>
              <div class="control-room-mix-grid">
                ${this._controlRoomMixPresets().map((preset) => `
                  <button class="control-room-mix-card" data-room-smart-mix="${this._esc(preset.id)}">
                    <span class="control-room-mix-icon">${this._iconSvg(preset.icon || "music_note")}</span>
                    <span class="control-room-mix-title">${this._esc(preset.label)}</span>
                    <span class="control-room-mix-sub">${this._esc(preset.subtitle || "")}</span>
                  </button>
                `).join("")}
              </div>
            </div>
          </div>
        `;
      }
      if (panel === "recent") {
        const loading = !!this._state.controlRoomRecentLoading;
        const items = Array.isArray(this._state.controlRoomRecentItems) ? this._state.controlRoomRecentItems : [];
        return `
          <div class="control-room-tray open wide">
            <div class="control-room-tray-head">
              <div class="control-room-tray-title">${this._esc(this._i18n("ui.recent_continue"))}</div>
              <div class="control-room-tray-sub">${this._esc(this._i18n("ui.continue_from_recent_music_assistant_activity"))}</div>
            </div>
            <div class="control-room-library-results" data-control-room-scroll="recent">
              ${loading ? `<div class="control-room-empty subtle">${this._esc(this._i18n("ui.loading_recent_items"))}</div>` : this._controlRoomMediaGridHtml(items, { empty: this._i18n("ui.no_recent_listening_yet"), large: true })}
            </div>
          </div>
        `;
      }
      if (panel === "favorites") {
        const loading = !!this._state.controlRoomFavoritesLoading;
        const items = Array.isArray(this._state.controlRoomFavoritesItems) ? this._state.controlRoomFavoritesItems : [];
        return `
          <div class="control-room-tray open wide">
            <div class="control-room-tray-head">
              <div class="control-room-tray-title">${this._esc(this._i18n("ui.favorite_center_2"))}</div>
              <div class="control-room-tray-sub">${this._esc(this._i18n("ui.play_queue_radio_or_remove_favorites_directly_from_studio"))}</div>
            </div>
            <div class="control-room-library-results" data-control-room-scroll="favorites">
              ${loading ? `<div class="control-room-empty subtle">${this._esc(this._i18n("ui.loading_favorites"))}</div>` : this._controlRoomMediaGridHtml(items, { empty: this._i18n("ui.no_favorites_found"), large: true })}
            </div>
          </div>
        `;
      }
      if (panel === "scenes") {
        const customScenes = this._controlRoomCustomScenes();
        return `
          <div class="control-room-tray open wide">
            <div class="control-room-tray-head">
              <div class="control-room-tray-title">${this._esc(this._i18n("ui.scene_presets_2"))}</div>
              <div class="control-room-tray-sub">${this._esc(this._i18n("ui.one_tap_prepares_players_grouping_volume_and_content_save_your_own_curre"))}</div>
            </div>
            <div class="control-room-scenes-grid">
              <button class="control-room-scene-card" data-room-scene="home">${this._iconSvg("home")}<span>${this._esc(this._i18n("ui.home"))}</span><small>${this._esc(this._i18n("ui.selected_players_at_comfortable_volume"))}</small></button>
              <button class="control-room-scene-card" data-room-scene="party">${this._iconSvg("radio")}<span>${this._esc(this._i18n("ui.party"))}</span><small>${this._esc(this._i18n("ui.group_volume_up_energetic_mix"))}</small></button>
              <button class="control-room-scene-card" data-room-scene="night">${this._iconSvg("moon")}<span>${this._esc(this._i18n("ui.night"))}</span><small>${this._esc(this._i18n("ui.low_volume_and_quiet_mix"))}</small></button>
            </div>
            <div class="control-room-scene-save">
              <label class="control-room-search">
                ${this._iconSvg("home")}
                <input id="controlRoomSceneNameInput" type="text" placeholder="${this._esc(this._i18n("ui.name_this_studio_scene"))}" value="${this._esc(this._state.controlRoomSceneName || "")}" autocomplete="off" spellcheck="false">
              </label>
              <button class="control-room-panel-action primary" data-room-save-scene>${this._iconSvg("plus")}<span>${this._esc(this._i18n("ui.save_current_target"))}</span></button>
            </div>
            <div class="control-room-saved-scenes" data-control-room-scroll="saved-scenes">
              ${customScenes.length ? customScenes.map((scene) => {
                const count = scene.playerIds.length;
                const mediaName = scene.media?.name || this._i18n("ui.volume_and_player_target");
                return `
                  <article class="control-room-saved-scene-card">
                    <button class="control-room-saved-scene-main" data-room-scene="${this._esc(scene.id)}">
                      ${this._iconSvg(count > 1 ? "speaker" : "home")}
                      <span>
                        <strong>${this._esc(scene.name)}</strong>
                        <small>${this._esc(`${this._controlRoomPlayerCountLabel(count)} · ${mediaName}`)}</small>
                      </span>
                    </button>
                    <button class="control-room-saved-scene-delete" data-room-delete-scene="${this._esc(scene.id)}" title="${this._esc(this._i18n("ui.delete_scene"))}">${this._iconSvg("trash")}</button>
                  </article>
                `;
              }).join("") : `<div class="control-room-empty subtle">${this._esc(this._i18n("ui.no_saved_studio_scenes_yet"))}</div>`}
            </div>
          </div>
        `;
      }
      if (panel === "announce") {
        const volume = Math.max(20, Math.min(50, Number(this._state.controlRoomAnnouncementVolume || 20) || 20));
        return `
          <div class="control-room-tray open compact control-room-announcement-tray">
            <div class="control-room-announce-hero">
              <span class="control-room-announce-icon">${this._iconSvg("announcement")}</span>
              <span class="control-room-announce-copy">
                <span class="control-room-tray-title">${this._esc(this._i18n("ui.announcement_studio_2"))}</span>
                <span class="control-room-tray-sub">${this._esc(this._i18n("ui.send_a_short_voice_message_or_announcement_url"))}</span>
              </span>
            </div>
            ${context}
            <div class="control-room-announce-panel">
              <label class="control-room-announce-compose">
                <span>${this._esc(this._i18n("ui.message"))}</span>
                <textarea id="controlRoomAnnouncementText" class="announcement-textarea" rows="3" placeholder="${this._esc(this._i18n("ui.type_what_should_be_announced"))}">${this._esc(this._state.controlRoomAnnouncementText || "")}</textarea>
              </label>
              <div class="control-room-announce-controls">
                <div class="control-room-announce-volume-card announcement-volume-field">
                  <div class="control-room-announce-volume-head">
                    <span>${this._esc(this._i18n("ui.volume_boost"))}</span>
                    <strong class="settings-value">+${this._esc(String(volume))}%</strong>
                  </div>
                  <input id="controlRoomAnnouncementVolumeInput" type="range" min="20" max="50" step="1" value="${this._esc(String(volume))}">
                </div>
                <button class="control-room-panel-action primary wide control-room-announce-send" data-room-announce-send>
                  ${this._iconSvg("announcement")}
                  <span>${this._esc(this._i18n("ui.send_announcement"))}</span>
                </button>
              </div>
            </div>
          </div>
        `;
      }
      if (panel === "pro") {
        const directReady = this._hasDirectMAConnection();
        const realtimeReady = this._hasRealtimeDirectMA();
        const sendspinState = this._localSendspinConnected ? this._i18n("ui.connected") : (this._localSendspinConnecting ? this._i18n("ui.connecting") : this._i18n("ui.idle_2"));
        const primary = this._controlRoomPrimaryPlayer();
        const protocol = primary ? this._controlRoomProtocolLabel(primary) : "";
        return `
          <div class="control-room-tray open compact">
            <div class="control-room-tray-head">
              <div class="control-room-tray-title">${this._esc(this._i18n("ui.studio_pro_2"))}</div>
              <div class="control-room-tray-sub">${this._esc(this._i18n("ui.feature_detection_player_context_and_this_device_playback_tools"))}</div>
            </div>
            <div class="control-room-diagnostics">
              <div class="control-room-diagnostic-row"><span>Target player</span><strong>${this._esc(primary?.attributes?.friendly_name || this._i18n("ui.none"))}</strong></div>
              <div class="control-room-diagnostic-row"><span>Protocol</span><strong>${this._esc(protocol || this._i18n("ui.unknown"))}</strong></div>
              <div class="control-room-diagnostic-row"><span>Direct API</span><strong>${this._esc(directReady ? this._i18n("ui.available") : this._i18n("ui.missing_url"))}</strong></div>
              <div class="control-room-diagnostic-row"><span>Realtime token</span><strong>${this._esc(realtimeReady ? this._i18n("ui.ready") : this._i18n("ui.optional"))}</strong></div>
              <div class="control-room-diagnostic-row"><span>Sendspin</span><strong>${this._esc(sendspinState)}</strong></div>
              <div class="control-room-diagnostic-row"><span>Players</span><strong>${this._esc(String(players.length))}</strong></div>
              <div class="control-room-pro-actions">
                <button class="control-room-panel-action" data-room-this-device="connect">${this._iconSvg("speaker")}<span>${this._esc(this._i18n("ui.connect_this_device_2"))}</span></button>
                <button class="control-room-panel-action danger" data-room-this-device="disconnect">${this._iconSvg("close")}<span>${this._esc(this._i18n("ui.disconnect"))}</span></button>
                <button class="control-room-panel-action" data-room-selection-action="open_ma">${this._iconSvg("library_music")}<span>${this._esc(this._i18n("ui.open_music_assistant"))}</span></button>
              </div>
              <div class="control-room-empty subtle">${this._esc(this._i18n("ui.player_settings_and_dsp_presets_stay_read_only_until_music_assistant_exp"))}</div>
            </div>
          </div>
        `;
      }
      return ``;
    }

    _controlRoomViewportSize() {
      const viewportWidth = typeof window !== "undefined" ? Number(window.innerWidth || 0) : 0;
      const viewportHeight = this._getViewportHeight(this._config?.height || 0);
      return {
        width: Math.max(320, Math.round(this._getCardWidth(this._lastCardWidth || viewportWidth || 1600))),
        height: Math.max(280, Math.round(this._getAllocatedCardHeight(this._lastCardHeight || this._config?.height || viewportHeight || 760))),
      };
    }

    _controlRoomGridStyle(playerCount = 0) {
      const count = Math.max(1, Number(playerCount) || 0);
      const { width, height } = this._controlRoomViewportSize();
      const compactViewport = width <= 1280;
      const narrowViewport = width <= 980;
      const shortViewport = height <= 640;
      const gap = narrowViewport ? 10 : (compactViewport ? 12 : 16);
      const minTileWidth = narrowViewport ? 78 : (compactViewport ? 86 : 96);
      const preferredMaxCols = width >= 1560 ? 6 : width >= 1060 ? 5 : width >= 720 ? 5 : 3;
      const dockReserve = shortViewport ? 82 : (narrowViewport ? 92 : (compactViewport ? 104 : 116));
      const headReserve = shortViewport ? 54 : (narrowViewport ? 64 : 74);
      const verticalReserve = dockReserve + headReserve + (shortViewport ? 10 : 18);
      const availableWidth = Math.max(220, width - (narrowViewport ? 20 : (compactViewport ? 34 : 56)));
      const availableHeight = Math.max(180, height - verticalReserve);
      const maxColsByWidth = Math.max(1, Math.floor((availableWidth + gap) / (minTileWidth + gap)));
      const maxCols = Math.max(1, Math.min(count, Math.max(preferredMaxCols, maxColsByWidth)));
      let best = { cols: 1, tileWidth: Math.min(availableWidth, availableHeight * 16 / 9), rows: count, score: 0 };
      for (let cols = 1; cols <= maxCols; cols += 1) {
        const rows = Math.ceil(count / cols);
        const widthLimited = (availableWidth - gap * (cols - 1)) / cols;
        const heightLimited = ((availableHeight - gap * (rows - 1)) / rows) * 16 / 9;
        const tileWidth = Math.max(minTileWidth, Math.min(widthLimited, heightLimited));
        const score = tileWidth * tileWidth * cols - rows * 22 + cols * 6;
        if (score > best.score) best = { cols, tileWidth, rows, score };
      }
      const gridMaxWidth = Math.max(240, Math.floor((best.tileWidth * best.cols) + gap * (best.cols - 1)));
      const gridMaxHeight = Math.max(160, Math.floor((best.tileWidth * 9 / 16 * best.rows) + gap * (best.rows - 1)));
      const tileScale = Math.max(0.72, Math.min(1, best.tileWidth / 300));
      return [
        `--control-room-cols:${best.cols}`,
        `--control-room-rows:${best.rows}`,
        `--control-room-gap:${gap}px`,
        `--control-room-player-count:${count}`,
        `--control-room-grid-max-width:${gridMaxWidth}px`,
        `--control-room-grid-max-height:${gridMaxHeight}px`,
        `--control-room-grid-available-height:${availableHeight}px`,
        `--control-room-dock-reserve:${dockReserve}px`,
        `--control-room-head-reserve:${headReserve}px`,
        `--control-room-viewport-width:${width}px`,
        `--control-room-viewport-height:${height}px`,
        `--control-room-tile-scale:${tileScale.toFixed(3)}`,
      ].join(";");
    }

    _controlRoomRenderSignature() {
      const players = this._controlRoomPlayers().map((player) => ({
        id: player.entity_id,
        groupCount: this._controlRoomGroupInfo(player).count,
      }));
      const results = Array.isArray(this._state.controlRoomLibraryResults)
        ? this._state.controlRoomLibraryResults.slice(0, 10).map((entry) => ({
            name: entry?.name || "",
            subtitle: entry?.subtitle || "",
            type: entry?.media_type || "",
            image: entry?.image || "",
        }))
        : [];
      const queueCache = this._state.controlRoomQueueSnapshots || {};
      const queues = Object.fromEntries(Object.entries(queueCache).map(([entityId, entry]) => [
        entityId,
        {
          count: Number(entry?.snapshot?.state?.items || 0) || (Array.isArray(entry?.snapshot?.items) ? entry.snapshot.items.length : 0),
          current: entry?.snapshot?.state?.current_index ?? "",
        },
      ]));
      const viewport = this._controlRoomViewportSize();
      return JSON.stringify({
        open: !!this._state.controlRoomOpen,
        panel: this._state.controlRoomPanel || "",
        viewport,
        selected: this._controlRoomSelectedPlayerIds(),
        visible: this._controlRoomVisiblePlayerIds(),
        query: this._state.controlRoomLibraryQuery || "",
        loading: !!this._state.controlRoomLibraryLoading,
        source: this._state.controlRoomTransferSource || "",
        target: this._state.controlRoomTransferTarget || "",
        results,
        queues,
        queueLoading: !!this._state.controlRoomQueueLoading,
        recentLoading: !!this._state.controlRoomRecentLoading,
        recent: (this._state.controlRoomRecentItems || []).slice(0, 12).map((entry) => entry?.uri || entry?.name || ""),
        favoritesLoading: !!this._state.controlRoomFavoritesLoading,
        favorites: (this._state.controlRoomFavoritesItems || []).slice(0, 12).map((entry) => entry?.uri || entry?.name || ""),
        smartQuery: this._state.controlRoomSmartQuery || "",
        announcementText: this._state.controlRoomAnnouncementText || "",
        announcementVolume: this._state.controlRoomAnnouncementVolume || 20,
        sceneName: this._state.controlRoomSceneName || "",
        customScenes: this._controlRoomCustomScenes().map((scene) => ({
          id: scene.id,
          name: scene.name,
          players: scene.playerIds,
          media: scene.media?.uri || "",
        })),
        players,
      });
    }

    _controlRoomHtml() {
      if (!this._controlRoomEnabled()) return "";
      const players = this._controlRoomPlayers();
      const primary = this._controlRoomPrimaryPlayer();
      const primaryArt = this._playerArtworkUrl(primary, 320);
      const roomStyleVars = this._controlRoomGridStyle(players.length);
      const sceneStyle = `style="${primaryArt ? `--control-room-scene-art:url('${this._esc(primaryArt)}');` : ""}${roomStyleVars}"`;
      const focusTarget = this._controlRoomFocusTarget();
      const focusArt = focusTarget.art || primaryArt;
      const targetIds = this._controlRoomActionTargetIds();
      const primaryPlaying = primary?.state === "playing";
      const primaryMuted = primary ? this._isMuted(primary) : false;
      const panelOpen = !!this._state.controlRoomPanel;
      const musicPanelActive = ["music", "mix", "library", "recent", "favorites", "scenes"].includes(this._state.controlRoomPanel);
      const actionsPanelActive = ["actions", "selection", "visible", "announce", "pro"].includes(this._state.controlRoomPanel);
      return `
        <div class="control-room-scene ${primaryArt ? "has-art" : ""} ${panelOpen ? "panel-open" : ""}" ${sceneStyle}>
          <div class="control-room-scene-bg"></div>
          <div class="control-room-scene-glow"></div>
          <div class="control-room-layout">
            <div class="control-room-grid-wrap">
              ${this._controlRoomGroupSummaryHtml(players)}
              <div class="control-room-grid">
                ${players.map((player) => this._controlRoomPlayerTileHtml(player)).join("")}
              </div>
            </div>
            ${this._controlRoomPanelHtml(players)}
            <div class="control-room-dock focus-mode">
              <div class="control-room-player-console">
                <div class="control-room-now-pill focus-target">
                  <span class="control-room-now-art">${focusArt ? `<img src="${this._esc(focusArt)}" alt="">` : this._iconSvg("speaker")}</span>
                  <span class="control-room-now-copy">
                    <span class="control-room-now-kicker">${this._esc(focusTarget.kicker)}</span>
                    <span class="control-room-now-name">${this._esc(focusTarget.name)}</span>
                    <span class="control-room-now-track">${this._esc(focusTarget.track)}</span>
                  </span>
                </div>
                <div class="control-room-dock-section player primary-actions">
                  <button class="control-room-dock-btn" data-room-selection-action="player_playpause" title="${this._esc(this._i18n("ui.play_pause"))}">
                    ${this._iconSvg(primaryPlaying ? "pause" : "play")}
                    <span class="control-room-dock-label">${this._esc(primaryPlaying ? this._i18n("ui.pause") : this._i18n("ui.play"))}</span>
                  </button>
                  <button class="control-room-dock-btn" data-room-selection-action="player_next" title="${this._esc(this._i18n("ui.next"))}">
                    ${this._iconSvg("next")}
                    <span class="control-room-dock-label">${this._esc(this._i18n("ui.next"))}</span>
                  </button>
                  <button class="control-room-dock-btn ${primaryMuted ? "active" : ""}" data-room-selection-action="player_mute" title="${this._esc(this._i18n("ui.mute"))}">
                    ${this._iconSvg(primary ? this._volumeIconName(primary) : "speaker")}
                    <span class="control-room-dock-label">${this._esc(this._i18n("ui.mute"))}</span>
                  </button>
                </div>
              </div>
              <span class="control-room-dock-divider" aria-hidden="true"></span>
              <div class="control-room-dock-section room focus-nav">
                <button class="control-room-selection-pill ${this._state.controlRoomPanel === "selection" ? "active" : ""}" data-room-selection-action="selection" title="${this._esc(this._i18n("ui.connected_players_2"))}">
                  <span class="control-room-selection-count">${this._esc(String(targetIds.length))}</span>
                  <span class="control-room-dock-label">${this._esc(this._i18n("ui.players"))}</span>
                </button>
                <button class="control-room-dock-btn ${musicPanelActive ? "active" : ""}" data-room-selection-action="music" title="${this._esc(this._i18n("ui.music_hub_2"))}">
                  ${this._iconSvg("wand")}
                  <span class="control-room-dock-label">${this._esc(this._i18n("ui.music"))}</span>
                </button>
                <button class="control-room-dock-btn ${this._state.controlRoomPanel === "transfer" ? "active" : ""}" data-room-selection-action="transfer" title="${this._esc(this._i18n("ui.transfer_queue_2"))}">
                  ${this._iconSvg("queue")}
                  <span class="control-room-dock-label">${this._esc(this._i18n("ui.queue_2"))}</span>
                </button>
                <button class="control-room-dock-btn ${actionsPanelActive ? "active" : ""}" data-room-selection-action="actions" title="${this._esc(this._i18n("ui.actions_2"))}">
                  ${this._iconSvg("settings")}
                  <span class="control-room-dock-label">${this._esc(this._i18n("ui.actions_2"))}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    _syncControlRoomLiveFields() {
      if (!this._state.controlRoomOpen || !this.shadowRoot) return;
      const host = this.$("controlRoomBody");
      if (!host) return;
      const players = this._controlRoomPlayers();
      const playerMap = new Map(players.map((player) => [player.entity_id, player]));
      const selectedIds = this._controlRoomSelectedPlayerIds();
      const primaryId = this._controlRoomPrimaryPlayerId();
      const primary = this._controlRoomPrimaryPlayer();
      const setText = (el, text) => {
        if (el && el.textContent !== String(text ?? "")) el.textContent = String(text ?? "");
      };
      const setHtml = (el, html) => {
        if (el && el.dataset.liveHtml !== html) {
          el.innerHTML = html;
          el.dataset.liveHtml = html;
        }
      };
      const cssUrl = (url) => `url("${String(url || "").replace(/\\/g, "\\\\").replace(/"/g, '\\"')}")`;
      host.querySelectorAll("[data-room-tile]").forEach((tile) => {
        const entityId = tile.dataset.roomTile || "";
        const player = playerMap.get(entityId);
        if (!player) return;
        const art = this._playerArtworkUrl(player, 320);
        const playing = player.state === "playing";
        const isSelected = selectedIds.includes(entityId);
        const isPrimary = primaryId === entityId;
        const volume = Math.round((player.attributes?.volume_level || 0) * 100);
        const groupInfo = this._controlRoomGroupInfo(player);
        tile.classList.toggle("has-art", !!art);
        tile.classList.toggle("no-art", !art);
        tile.classList.toggle("is-playing", playing);
        tile.classList.toggle("selected", isSelected);
        tile.classList.toggle("primary", isPrimary);
        tile.classList.toggle("grouped", !!groupInfo.count);
        const selectFab = tile.querySelector("[data-room-select]");
        if (selectFab) {
          const removable = isSelected && selectedIds.length > 1;
          selectFab.classList.toggle("active", isSelected);
          selectFab.classList.toggle("removable", removable);
          selectFab.title = removable
            ? this._i18n("ui.remove_from_selection")
            : isSelected ? this._i18n("ui.selected_player_2") : this._i18n("ui.add_to_selection");
          setHtml(selectFab, `${this._iconSvg(removable ? "close" : isSelected ? "check" : "grid")}<span class="control-room-select-label">${this._esc(removable ? this._i18n("ui.remove") : isSelected ? this._i18n("ui.selected") : this._i18n("ui.select"))}</span>`);
        }
        if (art) tile.style.setProperty("--control-room-tile-art", cssUrl(art));
        else tile.style.removeProperty("--control-room-tile-art");
        const pills = tile.querySelector(".control-room-tile-pills");
        const groupCount = groupInfo.count;
        const snapshot = this._controlRoomQueueCache(entityId);
        const queueCount = this._controlRoomQueueCount(player, snapshot);
        const protocolLabel = this._controlRoomProtocolLabel(player);
        const pillsHtml = [
          isPrimary ? `<span class="control-room-primary-pill">${this._esc(this._i18n("ui.primary"))}</span>` : ``,
          groupCount ? `<span class="control-room-float-pill grouped" title="${this._esc(groupInfo.label || this._i18n("ui.grouped_players"))}">${this._iconSvg("speaker")}${this._esc(this._m(`${groupCount} grouped`, `${groupCount} בקבוצה`))}</span>` : ``,
          queueCount ? `<span class="control-room-float-pill">${this._iconSvg("queue")}${this._esc(String(queueCount))}</span>` : ``,
          protocolLabel ? `<span class="control-room-float-pill protocol">${this._esc(protocolLabel)}</span>` : ``,
          playing ? `<span class="control-room-float-pill live">${this._esc(this._i18n("ui.playing"))}</span>` : ``,
        ].filter(Boolean).join("");
        setHtml(pills, pillsHtml);
        setText(tile.querySelector(".control-room-tile-track"), player.attributes?.media_title || this._i18n("ui.idle_2"));
        setText(tile.querySelector(".control-room-tile-name"), player.attributes?.friendly_name || player.entity_id);
        setText(tile.querySelector(".control-room-tile-state"), this._playerStateLabel(player));
        setHtml(tile.querySelector("[data-room-toggle-play]"), this._iconSvg(playing ? "pause" : "play"));
        const tileMute = tile.querySelector("[data-room-mute]");
        if (tileMute) {
          const muted = this._isMuted(player);
          tileMute.classList.toggle("active", muted);
          setHtml(tileMute, this._iconSvg(muted ? "volume_mute" : this._volumeIconName(player)));
        }
        const input = tile.querySelector(".control-room-volume");
        if (input && this.shadowRoot.activeElement !== input && String(input.value) !== String(volume)) {
          input.value = String(volume);
          input.style.setProperty("--vol-pct", `${volume}%`);
        }
        setText(tile.querySelector("[data-room-volume-value]"), `${volume}%`);
      });
      const primaryArt = this._playerArtworkUrl(primary, 320);
      const scene = host.querySelector(".control-room-scene");
      if (scene) {
        scene.classList.toggle("has-art", !!primaryArt);
        if (primaryArt) scene.style.setProperty("--control-room-scene-art", cssUrl(primaryArt));
        else scene.style.removeProperty("--control-room-scene-art");
      }
      const focusTarget = this._controlRoomFocusTarget();
      const focusArt = focusTarget.art || primaryArt;
      setHtml(host.querySelector(".control-room-now-art"), focusArt ? `<img src="${this._esc(focusArt)}" alt="">` : this._iconSvg("speaker"));
      setText(host.querySelector(".control-room-now-kicker"), focusTarget.kicker);
      setText(host.querySelector(".control-room-now-name"), focusTarget.name);
      setText(host.querySelector(".control-room-now-track"), focusTarget.track);
      const playPauseBtn = host.querySelector('[data-room-selection-action="player_playpause"]');
      if (playPauseBtn) {
        const primaryPlaying = primary?.state === "playing";
        setHtml(playPauseBtn, `${this._iconSvg(primaryPlaying ? "pause" : "play")}<span class="control-room-dock-label">${this._esc(primaryPlaying ? this._i18n("ui.pause") : this._i18n("ui.play"))}</span>`);
      }
      const actionPlayPauseBtn = host.querySelector('.control-room-action-console [data-room-selection-action="playpause"]');
      if (actionPlayPauseBtn) {
        const primaryPlaying = primary?.state === "playing";
        setHtml(actionPlayPauseBtn, `${this._iconSvg(primaryPlaying ? "pause" : "play")}<span>${this._esc(primaryPlaying ? this._i18n("ui.pause") : this._i18n("ui.play"))}</span>`);
      }
      const muteBtn = host.querySelector('[data-room-selection-action="player_mute"]');
      if (muteBtn) {
        const muted = primary ? this._isMuted(primary) : false;
        muteBtn.classList.toggle("active", muted);
        setHtml(muteBtn, `${this._iconSvg(primary ? this._volumeIconName(primary) : "speaker")}<span class="control-room-dock-label">${this._esc(this._i18n("ui.mute"))}</span>`);
      }
      const actionMuteBtn = host.querySelector('.control-room-action-console [data-room-selection-action="mute"]');
      if (actionMuteBtn) {
        const muted = primary ? this._isMuted(primary) : false;
        actionMuteBtn.classList.toggle("active", muted);
        setHtml(actionMuteBtn, `${this._iconSvg(muted ? "volume_mute" : (primary ? this._volumeIconName(primary) : "speaker"))}<span>${this._esc(this._i18n("ui.mute"))}</span>`);
      }
    }

    _syncControlRoomUi(options = {}) {
      this._syncControlRoomChrome();
      if (!this._controlRoomEnabled()) return;
      const host = this.$("controlRoomBody");
      if (!host) return;
      const force = !!options.force;
      if (!this._state.controlRoomOpen && !force) return;
      const activeEl = this.shadowRoot?.activeElement;
      const restorableInputIds = new Set(["controlRoomLibraryInput", "controlRoomSmartQueryInput", "controlRoomAnnouncementText", "controlRoomSceneNameInput"]);
      const activeControlRoomInputId = restorableInputIds.has(activeEl?.id) ? activeEl.id : "";
      const selectionStart = activeControlRoomInputId ? activeEl.selectionStart : null;
      const selectionEnd = activeControlRoomInputId ? activeEl.selectionEnd : null;
      const nextSignature = this._controlRoomRenderSignature();
      const needsRender = force
        || this._state.controlRoomRenderSignature !== nextSignature
        || !host.firstElementChild;
      if (needsRender) {
        const nextHtml = this._controlRoomHtml();
        const scrollSnapshot = {};
        host.querySelectorAll?.("[data-control-room-scroll]")?.forEach((el) => {
          const key = el.dataset.controlRoomScroll || "";
          if (key) scrollSnapshot[key] = { top: el.scrollTop || 0, left: el.scrollLeft || 0 };
        });
        const restoreScroll = () => {
          host.querySelectorAll?.("[data-control-room-scroll]")?.forEach((el) => {
            const key = el.dataset.controlRoomScroll || "";
            const pos = scrollSnapshot[key];
            if (!pos) return;
            el.scrollTop = pos.top;
            el.scrollLeft = pos.left;
          });
        };
        if (
          force
          || this._state.controlRoomRenderedHtml !== nextHtml
          || !host.firstElementChild
        ) {
          host.innerHTML = nextHtml;
          this._state.controlRoomRenderedHtml = nextHtml;
          restoreScroll();
          requestAnimationFrame(() => restoreScroll());
        }
        this._state.controlRoomRenderSignature = nextSignature;
      }
      this._syncControlRoomLiveFields();
      const input = this.$("controlRoomLibraryInput");
      if (input) {
        input.value = this._state.controlRoomLibraryQuery || "";
      }
      const smartInput = this.$("controlRoomSmartQueryInput");
      if (smartInput) smartInput.value = this._state.controlRoomSmartQuery || "";
      const announceInput = this.$("controlRoomAnnouncementText");
      if (announceInput) announceInput.value = this._state.controlRoomAnnouncementText || "";
      const sceneNameInput = this.$("controlRoomSceneNameInput");
      if (sceneNameInput) sceneNameInput.value = this._state.controlRoomSceneName || "";
      if (activeControlRoomInputId) {
        const targetInput = this.$(activeControlRoomInputId);
        targetInput?.focus?.({ preventScroll: true });
        if (targetInput && typeof selectionStart === "number" && typeof selectionEnd === "number") {
          try { targetInput.setSelectionRange(selectionStart, selectionEnd); } catch (_) {}
        }
      }
    }

    _syncSourceBadgesUi(player = this._getSelectedPlayer(), queueItem = this._state.maQueueState?.current_item || null) {
      if (this._isHotelMode()) {
        this.shadowRoot?.querySelectorAll("[data-art-source-badges]")?.forEach((host) => {
          host.innerHTML = "";
          host.dataset.renderedBadgesHtml = "";
          host.hidden = true;
        });
        return;
      }
      const meta = player ? this._currentSourceBadgeMeta(player, queueItem) : null;
      this.shadowRoot?.querySelectorAll("[data-art-source-badges]")?.forEach((host) => {
        if (!meta?.providerLabel && !meta?.qualityLabel) {
          if (host.dataset.renderedBadgesHtml !== "") {
            host.innerHTML = "";
            host.dataset.renderedBadgesHtml = "";
          }
          host.hidden = true;
          return;
        }
        const nextHtml = [
          meta.providerLabel
            ? `<span class="source-badge provider ${this._esc(`provider-${meta.providerKey || "source"}`)}">${this._esc(meta.providerLabel)}</span>`
            : ``,
          meta.qualityLabel
            ? `<span class="source-badge quality">${this._esc(meta.qualityLabel)}</span>`
            : ``,
        ].filter(Boolean).join("");
        if (host.dataset.renderedBadgesHtml !== nextHtml) {
          host.innerHTML = nextHtml;
          host.dataset.renderedBadgesHtml = nextHtml;
        }
        host.hidden = false;
      });
    }

    _stripLyricsTimestamps(text = "") {
      return HomeiiMediaPresentationFoundation.stripLyricsTimestamps(text);
    }

    _coerceLyricsRawText(value) {
      return HomeiiMediaPresentationFoundation.coerceLyricsRawText(value);
    }

    _coerceLyricsText(value) {
      return HomeiiMediaPresentationFoundation.coerceLyricsText(value);
    }

    _parseLrcLyrics(text = "") {
      return HomeiiMediaPresentationFoundation.parseLrcLyrics(text);
    }

    _extractCurrentLyricsRawText() {
      return HomeiiMediaPresentationFoundation.extractCurrentLyricsRawText(this._state.maQueueState?.current_item || {});
    }

    _extractCurrentLyricsText() {
      return HomeiiMediaPresentationFoundation.extractCurrentLyricsText(this._state.maQueueState?.current_item || {});
    }

    async _fetchLyricsForCurrentTrack() {
      const info = this._currentTrackInfo();
      if (!info.title) return { text: "", source: "" };
      const cacheKey = info.key || info.title;
      const cached = this._cache.lyrics.get(cacheKey);
      if (cached) return cached;

      const embeddedRaw = this._extractCurrentLyricsRawText();
      if (embeddedRaw) {
        const payload = {
          text: this._stripLyricsTimestamps(embeddedRaw),
          rawText: embeddedRaw,
          lrc: this._parseLrcLyrics(embeddedRaw),
          source: "metadata",
        };
        this._cache.lyrics.set(cacheKey, payload);
        return payload;
      }

      const params = new URLSearchParams();
      params.set("track_name", info.title);
      if (info.artist) params.set("artist_name", info.artist);
      if (info.album) params.set("album_name", info.album);
      if (info.duration) params.set("duration", String(Math.round(info.duration)));

      const parseLyrics = async (url) => {
        const response = await fetch(url, { headers: { Accept: "application/json" } });
        if (!response.ok) return "";
        const data = await response.json();
        if (Array.isArray(data)) {
          return data.map((item) => this._coerceLyricsRawText(item)).find(Boolean) || "";
        }
        return this._coerceLyricsRawText(data);
      };

      const rawText = await parseLyrics(`https://lrclib.net/api/get?${params.toString()}`)
        || await parseLyrics(`https://lrclib.net/api/search?${params.toString()}`);
      const payload = {
        text: rawText ? this._stripLyricsTimestamps(rawText) : "",
        rawText: rawText || "",
        lrc: this._parseLrcLyrics(rawText),
        source: rawText ? "lrclib" : "",
      };
      this._cache.lyrics.set(cacheKey, payload);
      return payload;
    }

    _lyricsSessionActive() {
      return !!(this._state.lyricsOpen || this._state.screensaverLyricsOpen);
    }

    _clearLyricsState() {
      this._state.lyricsTrackKey = "";
      this._state.lyricsText = "";
      this._state.lyricsLoading = false;
      this._state.lyricsLines = [];
      this._state.lyricsActiveIndex = -1;
      this._lyricsRequestToken = "";
      this._lyricsRefreshQueued = false;
    }

    _closeLyricsModal(options = {}) {
      const backdrop = this.$("lyricsBackdrop");
      const card = this.shadowRoot?.querySelector(".card");
      const preserveLyrics = options.preserveLyrics === true || this._state.screensaverLyricsOpen === true;
      if (backdrop) {
        backdrop.classList.remove("open");
        backdrop.onclick = null;
        backdrop.innerHTML = "";
      }
      card?.classList.remove("lyrics-modal-open");
      this._state.lyricsOpen = false;
      if (!preserveLyrics) this._clearLyricsState();
      if (options.sync === false) return;
      const restoreFrame = () => {
        const currentCard = this.shadowRoot?.querySelector(".card");
        [currentCard, this.shadowRoot?.querySelector(".stage"), this.shadowRoot?.querySelector(".tablet-shell"), this.shadowRoot?.querySelector(".tablet-main")]
          .filter(Boolean)
          .forEach((el) => { try { el.scrollTop = 0; } catch (_) {} });
        void currentCard?.offsetHeight;
      };
      requestAnimationFrame(() => {
        this._syncNowPlayingUI();
        this._syncTabletAutoFitUi();
        if (typeof this._refreshMobileArtStack === "function") this._refreshMobileArtStack(true);
        restoreFrame();
        requestAnimationFrame(restoreFrame);
      });
    }

    _renderLyricsModalShell(title, subtitle, bodyHtml) {
      const backdrop = this.$("lyricsBackdrop");
      if (!backdrop) return;
      const offsetLabel = this._lyricsSyncOffsetLabel();
      const lyricsArt = this._currentArtworkUrl(this._getSelectedPlayer(), this._state.maQueueState?.current_item || null, 920, { preferPlayerArtwork: true });
      if (lyricsArt) {
        backdrop.style.setProperty("--lyrics-dynamic-art", `url(${JSON.stringify(lyricsArt)})`);
        backdrop.classList.add("has-lyrics-art");
      } else {
        backdrop.style.removeProperty("--lyrics-dynamic-art");
        backdrop.classList.remove("has-lyrics-art");
      }
      backdrop.innerHTML = `
        <div class="lyrics-sheet" style="--lyrics-font-scale:${this._esc(this._lyricsFontScale().toFixed(2))}">
          <div class="lyrics-head">
            <div class="lyrics-title-wrap">
              <div class="lyrics-title-brand" aria-hidden="true">${this._tabletBrandSignatureHtml("lyrics-title-logo")}</div>
              <div class="lyrics-title">${this._esc(title || this._i18n("ui.track_lyrics"))}</div>
              <div class="lyrics-sub">${this._esc(subtitle || "")}</div>
            </div>
            <div class="lyrics-head-actions">
              <div class="lyrics-font-controls" title="${this._esc(this._i18n("ui.lyrics_font_size"))}">
                <button class="lyrics-offset-btn" id="lyricsFontMinusBtn" title="${this._esc(this._i18n("ui.smaller_lyrics"))}">−</button>
                <button class="lyrics-offset-label" id="lyricsFontResetBtn" title="${this._esc(this._i18n("ui.reset_lyrics_font_size"))}">${this._esc(this._lyricsFontScaleLabel())}</button>
                <button class="lyrics-offset-btn" id="lyricsFontPlusBtn" title="${this._esc(this._i18n("ui.larger_lyrics"))}">+</button>
              </div>
              <div class="lyrics-offset-controls" title="${this._esc(this._i18n("ui.lyrics_timing"))}">
                <button class="lyrics-offset-btn" id="lyricsOffsetMinusBtn" title="${this._esc(this._i18n("ui.lyrics_earlier"))}">−</button>
                <button class="lyrics-offset-label" id="lyricsOffsetResetBtn" title="${this._esc(this._i18n("ui.reset_lyrics_timing"))}">${this._esc(offsetLabel)}</button>
                <button class="lyrics-offset-btn" id="lyricsOffsetPlusBtn" title="${this._esc(this._i18n("ui.lyrics_later"))}">+</button>
              </div>
              <button class="lyrics-sync-btn ${this._state.mobileLyricsSyncEnabled !== false ? "active" : ""}" id="lyricsSyncBtn" title="${this._esc(this._i18n("ui.sync_lyrics"))}">
                ${this._iconSvg("sync")}
                <span>${this._esc(this._i18n("ui.sync"))}</span>
              </button>
              <button class="close-btn" id="lyricsCloseBtn">✕</button>
            </div>
          </div>
          <div class="lyrics-body">${bodyHtml}</div>
        </div>`;
      backdrop.classList.add("open");
      this.shadowRoot?.querySelector(".card")?.classList.add("lyrics-modal-open");
      backdrop.onclick = (e) => { if (e.target === backdrop) this._closeLyricsModal(); };
      backdrop.querySelector("#lyricsCloseBtn")?.addEventListener("click", () => this._closeLyricsModal());
      backdrop.querySelector("#lyricsSyncBtn")?.addEventListener("click", () => this._toggleLyricsSyncEnabled());
      backdrop.querySelector("#lyricsOffsetMinusBtn")?.addEventListener("click", () => this._nudgeLyricsSyncOffset(-500));
      backdrop.querySelector("#lyricsOffsetPlusBtn")?.addEventListener("click", () => this._nudgeLyricsSyncOffset(500));
      backdrop.querySelector("#lyricsOffsetResetBtn")?.addEventListener("click", () => this._setLyricsSyncOffset(0));
      backdrop.querySelector("#lyricsFontMinusBtn")?.addEventListener("click", () => this._nudgeLyricsFontScale(-0.08));
      backdrop.querySelector("#lyricsFontPlusBtn")?.addEventListener("click", () => this._nudgeLyricsFontScale(0.08));
      backdrop.querySelector("#lyricsFontResetBtn")?.addEventListener("click", () => this._setLyricsFontScale(1));
    }

    _lyricsTimelineHtml(lines = []) {
      return `
        <div class="lyrics-timeline" id="lyricsTimeline">
          ${lines.map((line, index) => `
            <div class="lyrics-line" data-lyrics-index="${index}" data-lyrics-time="${Number(line.time) || 0}">
              ${this._esc(line.text || "")}
            </div>
          `).join("")}
        </div>`;
    }

    _currentLyricsActiveIndex(lines = []) {
      const list = Array.isArray(lines) ? lines : [];
      if (!list.length) return -1;
      if (this._state.mobileLyricsSyncEnabled === false) return -1;
      const position = this._getCurrentPosition() + (this._lyricsSyncOffsetMs() / 1000);
      let activeIndex = 0;
      for (let i = 0; i < list.length; i += 1) {
        if (Number(list[i]?.time || 0) <= position + 0.15) activeIndex = i;
        else break;
      }
      return activeIndex;
    }

    _syncLyricsHighlight(force = false) {
      if (!this._state.lyricsOpen) return;
      const lines = Array.isArray(this._state.lyricsLines) ? this._state.lyricsLines : [];
      if (!lines.length) return;
      const timeline = this.shadowRoot?.querySelector("#lyricsTimeline");
      if (!timeline) return;
      if (this._state.mobileLyricsSyncEnabled === false) {
        this._state.lyricsActiveIndex = -1;
        timeline.querySelectorAll(".lyrics-line").forEach((row) => row.classList.remove("active"));
        return;
      }
      const activeIndex = this._currentLyricsActiveIndex(lines);
      if (activeIndex < 0) return;
      if (!force && activeIndex === this._state.lyricsActiveIndex) return;
      this._state.lyricsActiveIndex = activeIndex;
      this._syncScreensaverLyricsUi?.();
      timeline.querySelectorAll(".lyrics-line").forEach((row, index) => {
        row.classList.toggle("active", index === activeIndex);
      });
      const activeRow = timeline.querySelector(`.lyrics-line[data-lyrics-index="${activeIndex}"]`);
      const body = timeline.closest(".lyrics-body");
      if (activeRow && body) {
        const bodyRect = body.getBoundingClientRect();
        const rowRect = activeRow.getBoundingClientRect();
        const targetTop = body.scrollTop + rowRect.top - bodyRect.top - (body.clientHeight / 2) + (rowRect.height / 2);
        const maxTop = Math.max(0, body.scrollHeight - body.clientHeight);
        const nextTop = Math.max(0, Math.min(maxTop, targetTop));
        try {
          body.scrollTo({ top: nextTop, behavior: force ? "auto" : "smooth" });
        } catch (_) {
          body.scrollTop = nextTop;
        }
      }
    }

    _toggleLyricsSyncEnabled() {
      this._state.mobileLyricsSyncEnabled = this._state.mobileLyricsSyncEnabled === false;
      this._persistMobileAppearance();
      const syncBtn = this.shadowRoot?.querySelector("#lyricsSyncBtn");
      if (syncBtn) syncBtn.classList.toggle("active", this._state.mobileLyricsSyncEnabled !== false);
      this._syncLyricsHighlight(true);
    }

    _lyricsSyncOffsetMs() {
      return Math.max(-10000, Math.min(10000, Number(this._state.mobileLyricsSyncOffsetMs || 0) || 0));
    }

    _lyricsSyncOffsetLabel() {
      const seconds = this._lyricsSyncOffsetMs() / 1000;
      return `${seconds > 0 ? "+" : ""}${seconds.toFixed(1)}s`;
    }

    _setLyricsSyncOffset(offsetMs = 0) {
      this._state.mobileLyricsSyncOffsetMs = Math.max(-10000, Math.min(10000, Number(offsetMs || 0) || 0));
      this._persistMobileAppearance();
      const label = this.shadowRoot?.querySelector("#lyricsOffsetResetBtn");
      if (label) label.textContent = this._lyricsSyncOffsetLabel();
      this._syncLyricsHighlight(true);
    }

    _nudgeLyricsSyncOffset(deltaMs = 0) {
      this._setLyricsSyncOffset(this._lyricsSyncOffsetMs() + (Number(deltaMs || 0) || 0));
    }

    _lyricsFontScale() {
      return Math.max(0.75, Math.min(1.4, Number(this._state.mobileLyricsFontScale || 1) || 1));
    }

    _lyricsFontScaleLabel() {
      return `${Math.round(this._lyricsFontScale() * 100)}%`;
    }

    _setLyricsFontScale(value = 1) {
      this._state.mobileLyricsFontScale = Math.max(0.75, Math.min(1.4, Number(value || 1) || 1));
      this._persistMobileAppearance();
      const sheet = this.shadowRoot?.querySelector(".lyrics-sheet");
      if (sheet) sheet.style.setProperty("--lyrics-font-scale", this._lyricsFontScale().toFixed(2));
      const label = this.shadowRoot?.querySelector("#lyricsFontResetBtn");
      if (label) label.textContent = this._lyricsFontScaleLabel();
      this._syncLyricsHighlight(true);
    }

    _nudgeLyricsFontScale(delta = 0) {
      this._setLyricsFontScale(this._lyricsFontScale() + (Number(delta || 0) || 0));
    }

    async _renderLyricsModalForCurrentTrack({ force = false } = {}) {
      if (!this._lyricsSessionActive()) return;
      const info = this._currentTrackInfo();
      const trackKey = this._currentLyricsTrackKey() || info.key || info.title || "";
      if (!force && trackKey && this._state.lyricsTrackKey === trackKey) {
        this._syncLyricsHighlight();
        this._syncScreensaverLyricsUi?.();
        return;
      }
      const subtitle = [info.artist, info.album].filter(Boolean).join(" Â· ");
      this._state.lyricsTrackKey = trackKey;
      const lyricsSubtitle = subtitle.replace(/\u00c3\u201a\u00c2\u00b7|\u00c2\u00b7/g, "\u00b7");
      this._state.lyricsText = "";
      this._state.lyricsLines = [];
      this._state.lyricsActiveIndex = -1;
      this._state.lyricsLoading = true;
      const token = `${trackKey || Date.now()}-${Math.random()}`;
      this._lyricsRequestToken = token;
      if (this._state.lyricsOpen) {
        this._renderLyricsModalShell(
          info.title || this._i18n("ui.track_lyrics"),
          lyricsSubtitle,
          `<div class="lyrics-state">${this._esc(this._i18n("ui.loading_lyrics"))}</div>`,
        );
      }
      this._syncScreensaverLyricsUi?.();
      try {
        const payload = await this._fetchLyricsForCurrentTrack();
        if (!this._lyricsSessionActive() || this._lyricsRequestToken !== token) return;
        const text = payload?.text || "";
        const lines = Array.isArray(payload?.lrc) ? payload.lrc : [];
        this._state.lyricsText = text;
        this._state.lyricsLoading = false;
        this._state.lyricsLines = lines;
        this._state.lyricsActiveIndex = -1;
        if (this._state.lyricsOpen) {
          this._renderLyricsModalShell(
            info.title || this._i18n("ui.track_lyrics"),
            lyricsSubtitle,
            lines.length
              ? this._lyricsTimelineHtml(lines)
              : text
              ? `<pre class="lyrics-pre">${this._esc(text)}</pre>`
              : `<div class="lyrics-state">${this._esc(this._i18n("ui.no_lyrics_found"))}</div>`,
          );
        }
        this._syncScreensaverLyricsUi?.();
        if (lines.length) requestAnimationFrame(() => this._syncLyricsHighlight(true));
      } catch (_) {
        if (!this._lyricsSessionActive() || this._lyricsRequestToken !== token) return;
        this._state.lyricsText = "";
        this._state.lyricsLoading = false;
        this._state.lyricsLines = [];
        this._state.lyricsActiveIndex = -1;
        if (this._state.lyricsOpen) {
          this._renderLyricsModalShell(
            info.title || this._i18n("ui.track_lyrics"),
            lyricsSubtitle,
            `<div class="lyrics-state">${this._esc(this._i18n("ui.lyrics_unavailable_right_now"))}</div>`,
          );
        }
        this._syncScreensaverLyricsUi?.();
      }
    }

    async _openLyricsModal() {
      const backdrop = this.$("lyricsBackdrop");
      if (!backdrop) return;
      this.shadowRoot.querySelector(".card")?.appendChild(backdrop);
      const info = this._currentTrackInfo();
      const trackKey = this._currentLyricsTrackKey() || info.key || info.title || "";
      const subtitle = [info.artist, info.album].filter(Boolean).join(" · ");
      this._state.lyricsOpen = true;
      this._state.lyricsTrackKey = trackKey;
      const lyricsSubtitle = subtitle.replace(/\u00c3\u201a\u00c2\u00b7|\u00c2\u00b7/g, "\u00b7");
      this._state.lyricsText = "";
      this._state.lyricsLines = [];
      this._state.lyricsActiveIndex = -1;
      this._state.lyricsLoading = true;
      const token = `${trackKey || Date.now()}-${Math.random()}`;
      this._lyricsRequestToken = token;
      this._renderLyricsModalShell(
        info.title || this._i18n("ui.track_lyrics"),
        lyricsSubtitle,
        `<div class="lyrics-state">${this._esc(this._i18n("ui.loading_lyrics"))}</div>`,
      );
      this._syncScreensaverLyricsUi?.();
      try {
        const payload = await this._fetchLyricsForCurrentTrack();
        if (!this._lyricsSessionActive() || this._lyricsRequestToken !== token) return;
        const text = payload?.text || "";
        const lines = Array.isArray(payload?.lrc) ? payload.lrc : [];
        this._state.lyricsText = text;
        this._state.lyricsLoading = false;
        this._state.lyricsLines = lines;
        this._state.lyricsActiveIndex = -1;
        if (this._state.lyricsOpen) {
          this._renderLyricsModalShell(
            info.title || this._i18n("ui.track_lyrics"),
            lyricsSubtitle,
            lines.length
              ? this._lyricsTimelineHtml(lines)
              : text
              ? `<pre class="lyrics-pre">${this._esc(text)}</pre>`
              : `<div class="lyrics-state">${this._esc(this._i18n("ui.no_lyrics_found"))}</div>`,
          );
        }
        this._syncScreensaverLyricsUi?.();
        if (lines.length) requestAnimationFrame(() => this._syncLyricsHighlight(true));
      } catch (_) {
        if (!this._lyricsSessionActive() || this._lyricsRequestToken !== token) return;
        this._state.lyricsText = "";
        this._state.lyricsLoading = false;
        this._state.lyricsLines = [];
        this._state.lyricsActiveIndex = -1;
        if (this._state.lyricsOpen) {
          this._renderLyricsModalShell(
            info.title || this._i18n("ui.track_lyrics"),
            lyricsSubtitle,
            `<div class="lyrics-state">${this._esc(this._i18n("ui.lyrics_unavailable_right_now"))}</div>`,
          );
        }
        this._syncScreensaverLyricsUi?.();
      }
    }

    _syncLyricsForCurrentTrack({ force = false } = {}) {
      if (!this._lyricsSessionActive()) return;
      const trackKey = this._currentLyricsTrackKey();
      if (!force && trackKey && this._state.lyricsTrackKey === trackKey) {
        this._syncLyricsHighlight();
        this._syncScreensaverLyricsUi?.();
        return;
      }
      if (this._lyricsRefreshPromise) {
        this._lyricsRefreshQueued = true;
        return;
      }
      this._lyricsRefreshPromise = this._renderLyricsModalForCurrentTrack({ force: true })
        .catch(() => {})
        .finally(() => {
          this._lyricsRefreshPromise = null;
          if (this._lyricsRefreshQueued && this._lyricsSessionActive()) {
            this._lyricsRefreshQueued = false;
            this._syncLyricsForCurrentTrack({ force: true });
          }
        });
    }

    _likedStorageKey() {
      return "homeii_music_flow_likes_v2";
    }

    _likedMetaStorageKey() {
      return "homeii_music_flow_like_meta_v2";
    }

    _loadLikedUris() {
      if (!this._likedUris) {
        const liked = new Set();
        try {
          const raw = JSON.parse(localStorage.getItem(this._likedStorageKey()) || "[]");
          if (Array.isArray(raw)) raw.filter(Boolean).forEach((uri) => liked.add(String(uri)));
        } catch (_) {}
        ["homeii_music_flow_likes", "homeii_music_flow_mobile_likes"].forEach((key) => {
          try {
            const raw = JSON.parse(localStorage.getItem(key) || "[]");
            if (Array.isArray(raw)) raw.filter(Boolean).forEach((uri) => liked.add(String(uri)));
          } catch (_) {}
        });
        this._likedUris = liked;
        this._saveLikedUris();
      }
      return this._likedUris;
    }

    _loadLikedMetaMap() {
      if (!this._likedMeta) {
        try {
          const raw = JSON.parse(localStorage.getItem(this._likedMetaStorageKey()) || "{}");
          this._likedMeta = raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
        } catch (_) {
          this._likedMeta = {};
        }
      }
      return this._likedMeta;
    }

    _saveLikedUris() {
      try {
        localStorage.setItem(this._likedStorageKey(), JSON.stringify(Array.from(this._loadLikedUris())));
      } catch (_) {}
    }

    _saveLikedMetaMap() {
      try {
        localStorage.setItem(this._likedMetaStorageKey(), JSON.stringify(this._loadLikedMetaMap()));
      } catch (_) {}
    }

    _removeLikedUri(uri) {
      const normalized = String(uri || "").trim();
      if (!normalized) return;
      const likedUris = this._loadLikedUris();
      const likedMeta = this._loadLikedMetaMap();
      likedUris.delete(normalized);
      delete likedMeta[normalized];
      this._saveLikedUris();
      this._saveLikedMetaMap();
      this._syncLikeButtons();
    }

    _getCurrentMediaUri() {
      const queueItem = this._state.maQueueState?.current_item || {};
      const playerUri = String(this._getSelectedPlayer()?.attributes?.media_content_id || "").trim();
      const queueUri = String(queueItem?.media_item?.uri || queueItem?.uri || "").trim();
      return playerUri || this._state.nowPlayingUri || queueUri || "";
    }

    _currentMediaLikeMeta() {
      return HomeiiFavoritesFoundation.buildCurrentMediaLikeMeta({
        player: this._getSelectedPlayer(),
        queueItem: this._state.maQueueState?.current_item || {},
        resolvedUri: this._getCurrentMediaUri(),
        queueItemImage: this._queueItemImageUrl(this._state.maQueueState?.current_item || {}, 240),
        fallbackName: this._i18n("ui.unknown"),
      }, (uri, fallbackType) => this._parseMediaReference(uri, fallbackType));
    }

    _setCurrentMediaFavoriteOverride(liked, entry = null) {
      const uri = String(entry?.uri || this._getCurrentMediaUri() || "").trim();
      if (!uri) return;
      this._state.currentMediaFavoriteOverride = {
        uri,
        liked: !!liked,
        ts: Date.now(),
      };
      const currentItem = this._state.maQueueState?.current_item;
      if (currentItem) {
        currentItem.favorite = !!liked;
        if (currentItem.media_item && typeof currentItem.media_item === "object") {
          currentItem.media_item.favorite = !!liked;
        }
      }
    }

    _clearCurrentMediaFavoriteOverride() {
      this._state.currentMediaFavoriteOverride = null;
    }

    _likedEntries() {
      if (this._useMaLikedMode()) {
        const cache = this._cache.library.get("liked:ma");
        return Array.isArray(cache?.items) ? cache.items : [];
      }
      const likedUris = Array.from(this._loadLikedUris());
      const meta = this._loadLikedMetaMap();
      return likedUris.map((uri) => {
        const item = meta?.[uri] || {};
        return {
          uri,
          media_type: item.media_type || "track",
          name: item.name || uri,
          artist: item.artist || "",
          album: item.album || "",
          image: item.image || "",
        };
      });
    }

    async _loadMaLikedEntries(force = false) {
      if (!this._useMaLikedMode()) return [];
      if (!force) {
        const cached = this._cache.library.get("liked:ma");
        if (Array.isArray(cached?.items)) return cached.items;
      }
      const types = [
        ["track", 160],
        ["album", 80],
        ["playlist", 80],
        ["radio", 80],
        ["podcast", 80],
        ["artist", 80],
      ];
      const results = await Promise.allSettled(
        types.map(([type, limit]) => this._fetchLibrary(type, "sort_name", limit, true))
      );
      const items = [];
      results.forEach((result, idx) => {
        if (result.status !== "fulfilled" || !Array.isArray(result.value)) return;
        const mediaType = types[idx][0];
        result.value.forEach((item) => {
          items.push({
            uri: item.uri || "",
            media_type: item.media_type || mediaType,
            item_id: item.item_id || item.id || "",
            provider: item.provider || item.provider_domain || item.provider_instance || "",
            library_item_id: item.library_item_id || "",
            name: item.name || "",
            artist: this._artistName(item) || "",
            album: item.album?.name || "",
            image: this._artUrl(item) || "",
            favorite: true,
          });
        });
      });
      this._cache.library.set("liked:ma", { items });
      return items;
    }

    _currentMediaFavoriteState() {
      const cache = this._cache.library.get("liked:ma");
      return HomeiiFavoritesFoundation.resolveCurrentMediaFavoriteState({
        currentUri: this._getCurrentMediaUri(),
        override: this._state.currentMediaFavoriteOverride || null,
        queueItem: this._state.maQueueState?.current_item || {},
        currentEntry: this._currentMediaLikeMeta(),
        useMaLikedMode: this._useMaLikedMode(),
        likedItems: Array.isArray(cache?.items) ? cache.items : null,
        localLikedUris: this._loadLikedUris(),
        now: Date.now(),
      }, {
        compareMediaRefsFn: (uriA, uriB, fallbackType) => this._mediaRefsEquivalent(uriA, uriB, fallbackType),
        matchFavoriteLibraryItemFn: (entry, likedItems, fallbackType) => this._matchFavoriteLibraryItem(entry, likedItems, fallbackType),
      });
    }

    _syncLikeButtons() {
      const liked = this._currentMediaFavoriteState();
      ["mobileLikeBtn"].forEach((id) => {
        const btn = this.$(id);
        if (!btn) return;
        btn.classList.toggle("active", liked);
        this._setButtonIcon(btn, liked ? "heart_filled" : "heart_outline");
        if (liked) btn.style.color = "#f5a623";
        else btn.style.removeProperty("color");
      });
    }

    _resolveFavoriteButtonEntity(player = this._getSelectedPlayer()) {
      if (!this._hass?.states || !player) return "";
      const configured = String(this._config.favorite_button_entity || "").trim();
      if (configured && this._hass.states[configured]) return configured;
      const fallback = "button.bathroom_favorite_current_song_2";
      const playerEntity = String(player.entity_id || "").toLowerCase();
      const playerName = String(player.attributes?.friendly_name || "").toLowerCase();
      const playerTokens = [
        ...playerEntity.split(".").pop().split(/[_\s-]+/),
        ...playerName.split(/[_\s-]+/),
      ].filter(Boolean);
      const buttons = Object.keys(this._hass.states).filter((entityId) =>
        entityId.startsWith("button.") && /(favorite|אהב|אהבתי)/i.test(entityId)
      );
      const matched = buttons.find((entityId) => {
        const lower = entityId.toLowerCase();
        return playerTokens.some((token) => token && lower.includes(token));
      });
      if (matched) return matched;
      return this._hass.states[fallback] ? fallback : "";
    }

    async _toggleLikeViaFavoriteButton(sourceEl = null) {
      const entityId = this._resolveFavoriteButtonEntity();
      if (!entityId) return false;
      await this._hass.callService("button", "press", {}, { entity_id: entityId });
      if (sourceEl) this._flashInteraction(sourceEl);
      setTimeout(() => {
        this._cache.library.delete("liked:ma");
        this._syncLikeButtons();
        this._renderMobileMenu();
      }, 500);
      return true;
    }

    async _toggleLikeViaMassQueue() {
      const player = this._getSelectedPlayer();
      const entityId = player?.entity_id || this._config?.entity || this.config?.entity;
      if (this._config?.use_mass_queue_send_command !== true) return false;
      if (!entityId || !this._hass?.services?.mass_queue?.send_command) return false;
      const configEntryId = await this._ensureConfigEntryId();
      const queueId = String(player?.attributes?.active_queue || this._state?.maQueueState?.queue_id || "").trim();
      const currentUri = String(this._getCurrentMediaUri() || "").trim();
      const parsed = this._parseMediaReference(currentUri, this._state?.maQueueState?.current_item?.media_type || "track");
      const attempts = [
        { command: "favorite_current", payload: { entity_id: entityId, queue_id: queueId || undefined } },
        { command: "favorite_current", payload: { player_id: entityId, queue_id: queueId || undefined } },
        { command: "toggle_favorite", payload: { entity_id: entityId, uri: currentUri || undefined, media_type: parsed.media_type || undefined } },
        { command: "toggle_favorite", payload: { player_id: entityId, uri: currentUri || undefined, media_type: parsed.media_type || undefined } },
        { command: "add_to_library", payload: { entity_id: entityId, uri: currentUri || undefined, media_type: parsed.media_type || undefined, item_id: parsed.item_id || undefined, provider: parsed.provider || undefined } },
        { command: "add_to_library", payload: { player_id: entityId, uri: currentUri || undefined, media_type: parsed.media_type || undefined, item_id: parsed.item_id || undefined, provider: parsed.provider || undefined } },
      ];
      for (const attempt of attempts) {
        const payload = Object.fromEntries(Object.entries(attempt.payload).filter(([, value]) => value !== undefined && value !== ""));
        const variants = [
          { command: attempt.command, ...payload },
          { command: attempt.command, data: payload },
        ].map((entry) => (configEntryId ? { config_entry_id: configEntryId, ...entry } : entry));
        for (const data of variants) {
          try {
            await this._hass.callService("mass_queue", "send_command", data);
            return true;
          } catch (_) {}
        }
      }
      return false;
    }

    async _toggleLikeCurrentMedia(sourceEl = null) {
      const uri = this._getCurrentMediaUri();
      if (!uri) return;
      if (this._useMaLikedMode()) {
        const entry = this._currentMediaLikeMeta();
        await this._toggleMaLikeEntry(entry, sourceEl);
        return;
      }
      const likedUris = this._loadLikedUris();
      const likedMeta = this._loadLikedMetaMap();
      if (likedUris.has(uri)) {
        likedUris.delete(uri);
        delete likedMeta[uri];
      } else {
        likedUris.add(uri);
        likedMeta[uri] = this._currentMediaLikeMeta();
      }
      this._saveLikedUris();
      this._saveLikedMetaMap();
      if (sourceEl) this._flashInteraction(sourceEl);
      this._syncLikeButtons();
      if (this._state.menuOpen && this._state.menuPage === "library_liked") this._renderMobileMenu();
    }

    async _toggleLikeEntry(entry = {}, sourceEl = null) {
      const uri = String(entry?.uri || "").trim();
      if (!uri) return;
      if (this._useMaLikedMode()) {
        await this._toggleMaLikeEntry(entry, sourceEl);
        return;
      }
      const likedUris = this._loadLikedUris();
      const likedMeta = this._loadLikedMetaMap();
      if (likedUris.has(uri)) {
        likedUris.delete(uri);
        delete likedMeta[uri];
      } else {
        likedUris.add(uri);
        likedMeta[uri] = {
          uri,
          media_type: entry.media_type || "track",
          name: entry.name || uri,
          artist: entry.artist || "",
          album: entry.album || "",
          image: entry.image || "",
        };
      }
      this._saveLikedUris();
      this._saveLikedMetaMap();
      if (sourceEl) this._flashInteraction(sourceEl);
      this._syncLikeButtons();
    }

    async _toggleMaLikeEntry(entry = {}, sourceEl = null) {
      const targetsCurrentMedia = this._entryTargetsCurrentMedia(entry);
      const likedNow = targetsCurrentMedia ? this._currentMediaFavoriteState() : this._isEntryLiked(entry);
      if (targetsCurrentMedia) {
        const player = this._getSelectedPlayer();
        const playerEntityId = String(player?.entity_id || this._state.selectedPlayer || "").trim();
        const fallbackFavoriteEntity = this._favoriteButtonEntityForPlayer(player);
        const uri = String(entry?.uri || this._getCurrentMediaUri() || "").trim();
        const mediaType = entry.media_type || entry.type || this._parseMediaReference(uri, entry.media_type || entry.type || "track").media_type || "track";
        const nextLiked = !likedNow;
        this._setCurrentMediaFavoriteOverride(nextLiked, entry);
        this._applyMaFavoriteOptimisticState(entry, nextLiked);
        if (sourceEl) this._flashInteraction(sourceEl);
        entry.favorite = nextLiked;
        if (entry.media_item) entry.media_item.favorite = nextLiked;
        try {
          let actionOk = false;
          if (likedNow) {
            actionOk = await this._unfavoriteCurrentViaMassQueue();
            if (!actionOk) {
              try { actionOk = await this._toggleMaLikeEntryDirect(entry, true, mediaType); } catch (_) {}
            }
            if (!actionOk) throw new Error("Music Assistant favorite action was not available");
            this._toast(this._i18n("ui.removed_from_music_assistant_liked"));
          } else {
            try { actionOk = await this._toggleMaLikeEntryDirect(entry, false, mediaType); } catch (_) {}
            if (!actionOk) {
              try { actionOk = await this._toggleLikeViaMassQueue(); } catch (_) {}
            }
            if (!actionOk && fallbackFavoriteEntity) {
              await this._pressFavoriteButtonEntity(fallbackFavoriteEntity);
              actionOk = true;
            }
            if (!actionOk && playerEntityId && !this._isDirectMaPlayer(playerEntityId)) {
              await this._pressFavoriteButtonEntity(playerEntityId);
              actionOk = true;
            }
            if (!actionOk) throw new Error("Music Assistant favorite action was not available");
            this._toast(this._i18n("ui.added_to_music_assistant_liked"));
          }
          [140, 520, 1400, 3000].forEach((delay) => setTimeout(() => this._refreshFavoriteState(true).catch(() => {}), delay));
          return true;
        } catch (error) {
          this._clearCurrentMediaFavoriteOverride();
          this._applyMaFavoriteOptimisticState(entry, likedNow);
          entry.favorite = likedNow;
          if (entry.media_item) entry.media_item.favorite = likedNow;
          this._toastError(this._i18n("ui.ma_favorite_action_failed_with_error", {
            error: error?.message ? `: ${error.message}` : "",
          }));
          return false;
        }
      }
      const canonicalLikedEntry = likedNow ? await this._resolveCanonicalMaLikedEntry(entry, true) : null;
      const effectiveEntry = canonicalLikedEntry || entry;
      const uri = String(entry?.uri || "").trim();
      if (!uri) return false;
      const mediaType = entry.media_type || entry.type || this._parseMediaReference(uri, entry.media_type || entry.type || "track").media_type || "track";
      try {
        let verified = false;
        const usedHaFavoriteService = await this._toggleMaLikeViaHaService(effectiveEntry, likedNow, mediaType);
        if (usedHaFavoriteService) {
          this._applyMaFavoriteOptimisticState(entry, !likedNow);
          verified = await this._waitForFavoriteState(effectiveEntry, !likedNow, [400, 1100, 2200, 4200, 5800]);
          if (!verified) this._applyMaFavoriteOptimisticState(entry, !likedNow);
          this._toast(likedNow ? this._i18n("ui.removed_from_music_assistant_liked") : this._i18n("ui.added_to_music_assistant_liked"));
          if (sourceEl) this._flashInteraction(sourceEl);
          entry.favorite = !likedNow;
          if (entry.media_item) entry.media_item.favorite = !likedNow;
          [500, 1500, 3200, 5200].forEach((delay) => setTimeout(() => this._refreshFavoriteState(true).catch(() => {}), delay));
          return true;
        }
        const usedDirectApi = await this._toggleMaLikeEntryDirect(effectiveEntry, likedNow, mediaType);
        if (!usedDirectApi && targetsCurrentMedia) {
          const massQueueUsed = await this._toggleLikeViaMassQueue();
          if (massQueueUsed) {
            this._applyMaFavoriteOptimisticState(entry, !likedNow);
            verified = await this._waitForFavoriteState(effectiveEntry, !likedNow, [450, 1200, 2600, 4200, 5800]);
            if (!verified) this._applyMaFavoriteOptimisticState(entry, !likedNow);
            this._toast(likedNow ? this._i18n("ui.removed_from_music_assistant_liked") : this._i18n("ui.added_to_music_assistant_liked"));
            if (sourceEl) this._flashInteraction(sourceEl);
            entry.favorite = !likedNow;
            if (entry.media_item) entry.media_item.favorite = !likedNow;
            [500, 1500, 3200, 5200].forEach((delay) => setTimeout(() => this._refreshFavoriteState(true).catch(() => {}), delay));
            return true;
          }
        }
        if (!usedDirectApi) {
          throw new Error("Music Assistant Direct API is not available");
        }
        this._applyMaFavoriteOptimisticState(entry, !likedNow);
        verified = await this._waitForFavoriteState(effectiveEntry, !likedNow, [350, 900, 1800, 3200, 5200]);
        if (!verified) this._applyMaFavoriteOptimisticState(entry, !likedNow);
        this._toast(likedNow ? this._i18n("ui.removed_from_music_assistant_liked") : this._i18n("ui.added_to_music_assistant_liked"));
        if (sourceEl) this._flashInteraction(sourceEl);
        [300, 900, 1800].forEach((delay) => setTimeout(() => this._refreshFavoriteState(true).catch(() => {}), delay));
        entry.favorite = !likedNow;
        if (entry.media_item) entry.media_item.favorite = !likedNow;
        return true;
      } catch (error) {
        this._toastError(this._i18n("ui.ma_favorite_action_failed_with_error", {
          error: error?.message ? `: ${error.message}` : "",
        }));
        return false;
      }
    }

    async _toggleMaLikeEntryDirect(entry = {}, likedNow = false, mediaType = "track") {
      if (!this._hasDirectMAConnection()) return false;
      const uri = String(entry?.uri || "").trim();
      if (!uri) return false;
      if (!likedNow) {
        const playerUri = this._entryTargetsCurrentMedia(entry)
          ? String(this._getSelectedPlayer()?.attributes?.media_content_id || "").trim()
          : "";
        const bestUri = playerUri || uri;
        const bestRef = this._parseMediaReference(bestUri, mediaType);
        let lastError = null;
        const attempts = [
          { item: bestUri },
          { item: bestRef.item_id || bestUri },
          { item: { uri: bestUri, media_type: bestRef.media_type || mediaType, item_id: bestRef.item_id || "", provider: bestRef.provider || "" } },
          { uri: bestUri, media_type: bestRef.media_type || mediaType, item_id: bestRef.item_id || "", provider: bestRef.provider || "" },
        ];
        for (const args of attempts) {
          try {
            await this._callDirectMaCommand("music/favorites/add_item", args);
            return true;
          } catch (error) {
            lastError = error;
          }
        }
        if (lastError) throw lastError;
        return true;
      }
      const removeArgs = await this._resolveMaFavoriteRemoveArgs(entry, mediaType);
      if (!removeArgs) return false;
      const attempts = [
        removeArgs,
        { media_type: removeArgs.media_type || mediaType, library_item_id: removeArgs.library_item_id },
      ].filter((candidate) => candidate?.library_item_id);
      let lastError = null;
      for (const args of attempts) {
        try {
          await this._callDirectMaCommand("music/favorites/remove_item", args);
          return true;
        } catch (error) {
          lastError = error;
        }
      }
      if (lastError) throw lastError;
      return false;
    }

    async _toggleMaLikeViaHaService(entry = {}, likedNow = false, mediaType = "track") {
      const uri = String(entry?.uri || "").trim();
      if (!uri) return false;
      const parsed = this._parseMediaReference(uri, mediaType);
      const removeArgs = likedNow ? await this._resolveMaFavoriteRemoveArgs(entry, mediaType) : null;
      const base = {
        entity_id: this._state.selectedPlayer || this._getSelectedPlayer()?.entity_id || "",
        media_id: uri,
        uri,
        media_type: parsed.media_type || mediaType || "track",
        item_id: parsed.item_id || "",
        provider: parsed.provider || "",
        favorite: !likedNow,
      };
      const attempts = likedNow
        ? [
            { service: "remove_from_library", data: { entity_id: base.entity_id, media_type: removeArgs?.media_type || base.media_type, library_item_id: removeArgs?.library_item_id || "" } },
            { service: "remove_favorite", data: { entity_id: base.entity_id, media_type: removeArgs?.media_type || base.media_type, library_item_id: removeArgs?.library_item_id || "" } },
            { service: "favorite_item", data: { entity_id: base.entity_id, media_type: removeArgs?.media_type || base.media_type, library_item_id: removeArgs?.library_item_id || "", favorite: false } },
            { service: "set_favorite", data: { entity_id: base.entity_id, media_type: removeArgs?.media_type || base.media_type, library_item_id: removeArgs?.library_item_id || "", favorite: false } },
            { service: "remove_from_library", data: { ...base, ...(removeArgs || {}) } },
          ]
        : [
            { service: "add_to_library", data: base },
            { service: "add_favorite", data: base },
            { service: "favorite_item", data: { ...base, favorite: true } },
            { service: "set_favorite", data: { ...base, favorite: true } },
          ];
      for (const attempt of attempts) {
        if (!this._hasService("music_assistant", attempt.service)) continue;
        try {
          await this._callService(attempt.service, Object.fromEntries(Object.entries(attempt.data).filter(([, value]) => value !== "" && value !== undefined && value !== null)));
          return true;
        } catch (_) {}
      }
      return false;
    }

    async _resolveCanonicalMaLikedEntry(entry = {}, force = true) {
      if (!this._useMaLikedMode()) return null;
      let likedItems = Array.isArray(this._cache.library.get("liked:ma")?.items)
        ? this._cache.library.get("liked:ma").items
        : [];
      if (force || !likedItems.length) {
        try {
          likedItems = await this._loadMaLikedEntries(true);
        } catch (_) {
          likedItems = Array.isArray(likedItems) ? likedItems : [];
        }
      }
      return this._findMaLikedEntryMatch(entry, likedItems);
    }

    _applyMaFavoriteOptimisticState(entry = {}, liked = false) {
      const nextEntry = HomeiiFavoritesFoundation.buildOptimisticFavoriteEntry(entry, liked);
      const cache = this._cache.library.get("liked:ma");
      const items = HomeiiFavoritesFoundation.applyOptimisticFavoriteCache(
        Array.isArray(cache?.items) ? cache.items : [],
        nextEntry,
        liked,
        {
          compareMediaRefsFn: (uriA, uriB, fallbackType) => this._mediaRefsEquivalent(uriA, uriB, fallbackType),
          matchFavoriteLibraryItemFn: (candidateEntry, likedEntries, fallbackType) =>
            this._matchFavoriteLibraryItem(candidateEntry, likedEntries, fallbackType),
        },
      );
      this._cache.library.set("liked:ma", { items });
      entry.favorite = !!liked;
      if (entry.media_item) entry.media_item.favorite = !!liked;
      this._syncLikeButtons();
      if (this._state.menuOpen && this._state.menuPage === "library_liked") {
        this._renderMobileMenu().catch(() => {});
      }
    }

    async _resolveMaFavoriteRemoveArgs(entry = {}, mediaType = "track") {
      const uri = String(entry?.uri || "").trim();
      let likedItems = Array.isArray(this._cache.library.get("liked:ma")?.items)
        ? this._cache.library.get("liked:ma").items
        : [];
      if (!likedItems.length) {
        try {
          likedItems = await this._loadMaLikedEntries(true);
        } catch (_) {
          likedItems = [];
        }
      }
      const currentEntryMatches = this._entryTargetsCurrentMedia(entry);
      const currentEntry = currentEntryMatches ? this._currentMediaLikeMeta() : null;
      const resolvedFromKnownState = HomeiiFavoritesFoundation.resolveCachedFavoriteRemoveArgs({
        entry,
        mediaType,
        likedItems,
        currentEntry,
        currentEntryMatches,
      }, {
        parseMediaReferenceFn: (targetUri, fallbackType) => this._parseMediaReference(targetUri, fallbackType),
        favoriteRemoveArgsFromItemFn: (item, fallbackType) => this._favoriteRemoveArgsFromItem(item, fallbackType),
        findFavoriteEntryMatchFn: (targetEntry, entries) => this._findMaLikedEntryMatch(targetEntry, entries),
        matchFavoriteLibraryItemFn: (targetEntry, entries, fallbackType) => this._matchFavoriteLibraryItem(targetEntry, entries, fallbackType),
      });
      if (resolvedFromKnownState) return resolvedFromKnownState;
      try {
        const remote = await this._callDirectMaCommand("music/item_by_uri", { uri });
        const remoteArgs = this._favoriteRemoveArgsFromItem(remote, mediaType);
        if (remoteArgs) return remoteArgs;
      } catch (_) {}
      return null;
    }

    _findMaLikedEntryMatch(entry = {}, likedItems = []) {
      return HomeiiFavoritesFoundation.findFavoriteEntryMatch(entry, likedItems, {
        parseMediaReferenceFn: (uri, fallbackType) => this._parseMediaReference(uri, fallbackType),
      });
    }

    _matchFavoriteLibraryItem(entry = {}, likedItems = [], fallbackType = "") {
      return HomeiiFavoritesFoundation.matchFavoriteLibraryItem(
        entry,
        likedItems,
        fallbackType || entry?.media_type || entry?.type || "track",
        {
          parseMediaReferenceFn: (uri, mediaType) => this._parseMediaReference(uri, mediaType),
          favoriteRemoveArgsFromItemFn: (item, mediaType) => this._favoriteRemoveArgsFromItem(item, mediaType),
          findFavoriteEntryMatchFn: (targetEntry, entries) => this._findMaLikedEntryMatch(targetEntry, entries),
        },
      );
    }

    _favoriteRemoveArgsFromItem(item = {}, fallbackType = "track") {
      return HomeiiFavoritesFoundation.favoriteRemoveArgsFromItem(
        item,
        fallbackType,
        (uri, mediaType) => this._parseMediaReference(uri, mediaType),
      );
    }

    _isEntryLiked(entry = {}) {
      const cache = this._cache.library.get("liked:ma");
      return HomeiiFavoritesFoundation.isEntryLiked(
        entry,
        {
          useMaLikedMode: this._useMaLikedMode(),
          likedItems: Array.isArray(cache?.items) ? cache.items : null,
          localLikedUris: this._loadLikedUris(),
        },
        {
          compareMediaRefsFn: (uriA, uriB, fallbackType) => this._mediaRefsEquivalent(uriA, uriB, fallbackType),
          matchFavoriteLibraryItemFn: (targetEntry, likedItems, fallbackType) =>
            this._matchFavoriteLibraryItem(targetEntry, likedItems, fallbackType),
        },
      );
    }

    _parseMediaReference(uri = "", fallbackType = "track") {
      return HomeiiMediaQueueFoundation.parseMediaReference(uri, fallbackType);
    }

    _showQueueItemMenu(clientX, clientY, entry = {}) {
      this._dismissCtx();
      const mount = this.$("mobileMenu")?.classList.contains("open")
        ? (this.$("mobileMenu")?.querySelector(".menu-body") || this.$("mobileMenu")?.querySelector(".menu-sheet") || this.$("mobileMenu"))
        : this.shadowRoot.querySelector(".card");
      if (!mount) return;
      const liked = this._isEntryLiked(entry);
      const queueCount = Math.max(1, this._getNowPlayingQueueItems().length || (this._state.queueItems || []).length || Number(this._state.maQueueState?.items || 1));
      const currentPosition = Math.max(1, Math.min(queueCount, this._queueDisplayPositionForEntry(entry, Math.round(Number(entry.sort_index || 0)) + 1 || 1)));
      const menu = document.createElement("div");
      menu.className = "ctx-menu queue-ctx-menu";
      menu.innerHTML = `
        <div class="queue-move-control ctx-move-control">
          <label>
            <span>${this._esc(this._i18n("ui.move_to_position"))}</span>
            ${this._queueMoveSelectHtml(queueCount, currentPosition, entry)}
          </label>
        </div>
        <div class="ctx-item" data-queue-popup="next"><span class="ctx-ico">${this._iconSvg("next")}</span><span>${this._esc(this._i18n("ui.move_to_next"))}</span></div>
        <div class="ctx-item" data-queue-popup="like"><span class="ctx-ico">${this._iconSvg(liked ? "heart_filled" : "heart_outline")}</span><span>${this._esc(this._i18n("ui.like_2"))}</span></div>
        <div class="ctx-item" data-queue-popup="remove"><span class="ctx-ico">${this._iconSvg("menu")}</span><span>${this._esc(this._i18n("ui.remove"))}</span></div>
        <div class="ctx-item" data-queue-popup="close"><span class="ctx-ico">×</span><span>${this._esc(this._i18n("ui.close"))}</span></div>`;
      menu.addEventListener("click", (e) => e.stopPropagation());
      menu.querySelectorAll("[data-queue-popup]").forEach((item) => item.addEventListener("click", async (e) => {
        e.stopPropagation();
        const action = item.dataset.queuePopup;
        if (action === "close") {
          this._dismissCtx();
          return;
        }
        if (action === "like") {
          this._toggleLikeEntry(entry, item);
          if (this._state.menuOpen && this._state.menuPage === "queue") await this._renderMobileMenu();
        } else {
          const targetPosition = action === "move_to" ? this._queueMoveTargetFromElement(item) : null;
          if (action === "move_to" && !targetPosition) return;
          await this._handleQueueAction(action, entry.queue_item_id, entry.uri || "", entry.sort_index || "", targetPosition);
        }
        this._dismissCtx();
      }));
      menu.addEventListener("change", async (e) => {
        if (await this._handleQueueMoveAutoChange(e)) this._dismissCtx();
      });
      mount.appendChild(menu);
      this._ctxMenu = menu;
      this._ctxMenuOpenedAt = Date.now();
      const cardRect = mount.getBoundingClientRect();
      const fallbackRect = entry.anchorRect || null;
      const pointerX = Number.isFinite(clientX) && clientX > 0 ? clientX : null;
      const pointerY = Number.isFinite(clientY) && clientY > 0 ? clientY : null;
      let left = ((pointerX ?? fallbackRect?.left ?? (cardRect.left + 20))) - cardRect.left;
      let top = ((pointerY ?? fallbackRect?.bottom ?? (cardRect.top + 20))) - cardRect.top;
      menu.style.left = `${left}px`;
      menu.style.top = `${top}px`;
      requestAnimationFrame(() => {
        const mr = menu.getBoundingClientRect();
        const cr = mount.getBoundingClientRect();
        if (mr.right > cr.right) left = Math.max(12, left - (mr.right - cr.right) - 12);
        if (mr.bottom > cr.bottom) top = Math.max(12, top - mr.height - (fallbackRect?.height || 0) - 8);
        menu.style.left = `${Math.max(12, Math.min(left, cr.width - mr.width - 12))}px`;
        menu.style.top = `${Math.max(12, Math.min(top, cr.height - mr.height - 12))}px`;
      });
    }

    _renderImmersiveNowPlaying() {
      const backdrop = this.$("immersiveNowPlaying");
      const player = this._getSelectedPlayer();
      if (!backdrop || !player) return;

      const title = player.attributes.media_title || this._i18n("ui.no_active_media");
      const artist = player.attributes.media_artist || this._i18n("ui.unknown");
      const album = player.attributes.media_album_name || "";
      const playerName = player.attributes.friendly_name || player.entity_id;
      const art = this._currentArtworkUrl(player, this._state.maQueueState?.current_item || null, 180);
      const duration = this._getCurrentDuration();
      const position = this._getCurrentPosition();
      const progressPct = duration ? Math.min(100, (position / duration) * 100) : 0;
      const volumePct = Math.round((player.attributes.volume_level || 0) * 100);
      const shuffle = !!player.attributes.shuffle;
      const repeat = player.attributes.repeat || "off";
      const rtl = this._isHebrew();

      backdrop.innerHTML = `
        <div class="immersive-shell ${rtl ? "rtl" : ""}">
          <div class="immersive-bg" ${art ? `style="background-image:url('${this._esc(art)}')"` : ""}></div>
          <div class="immersive-cover-glow" ${art ? `style="background-image:url('${this._esc(art)}')"` : ""}></div>
          <div class="immersive-frost"></div>
          <div class="immersive-vignette"></div>
          <div class="immersive-header">
            <button class="close-btn" id="immersiveCloseBtn">✕</button>
            <div class="immersive-meta">
        <div class="immersive-kicker">homeii-music-flow</div>
              <div class="immersive-title">${this._esc(title)}</div>
              <div class="immersive-subtitle">${this._esc([artist, album].filter(Boolean).join(" · "))}</div>
              <div class="immersive-player-pill" id="immersivePlayerName">${this._esc(`${this._i18n("ui.playing_on")}: ${playerName}`)}</div>
            </div>
          </div>
          <div class="immersive-body">
            <div class="immersive-art-wrap">
              <div class="immersive-art" id="immersiveArt">${art ? `<img src="${this._esc(art)}" alt="">` : this._artPlaceholderHtml("music_note")}</div>
            </div>
            <div class="immersive-panel">
              <div class="immersive-time-row"><span id="immersiveCurTime">${this._esc(this._fmtDur(position))}</span><span id="immersiveTotalTime">${this._esc(this._fmtDur(duration))}</span></div>
              <div class="immersive-progress" id="immersiveProgressBar"><div class="immersive-progress-fill" id="immersiveProgressFill" style="width:${progressPct}%"></div></div>
              <div class="immersive-controls">
                <button class="immersive-btn ${shuffle ? "active" : ""}" id="immersiveShuffleBtn">${this._iconSvg("shuffle")}</button>
                <button class="immersive-btn" id="immersivePrevBtn">${this._iconSvg("previous")}</button>
                <button class="immersive-btn primary" id="immersivePlayBtn">${this._iconSvg(this._playPauseIconName(player))}</button>
                <button class="immersive-btn" id="immersiveNextBtn">${this._iconSvg("next")}</button>
                <button class="immersive-btn ${repeat !== "off" ? "active" : ""}" id="immersiveRepeatBtn">${this._iconSvg(repeat === "one" ? "repeat_one" : "repeat")}</button>
              </div>
              <div class="immersive-volume">
                <button class="immersive-btn small" id="immersiveMuteBtn">${this._iconSvg(this._volumeIconName(player))}</button>
                <input id="immersiveVolumeSlider" type="range" min="0" max="100" value="${volumePct}" style="--vol-pct:${volumePct}%">
              </div>
              <div class="immersive-actions">
                <button class="chip-btn immersive-player-picker-btn" id="immersiveChoosePlayerBtn" title="${this._i18n("ui.open_player_picker")}">${this._iconSvg("speaker")}</button>
                <button class="chip-btn" id="immersiveQueueBtn">${this._i18n("ui.open_full_queue")}</button>
                <button class="chip-btn" id="immersiveTransferBtn">${this._i18n("ui.transfer_queue")}</button>
              </div>
            </div>
          </div>
        </div>`;

      backdrop.querySelector("#immersiveCloseBtn")?.addEventListener("click", () => this._closeImmersiveNowPlaying());
      backdrop.onclick = (e) => { if (e.target === backdrop) this._closeImmersiveNowPlaying(); };
      this._bindProgressSeekBar(backdrop.querySelector("#immersiveProgressBar"));
      backdrop.querySelector("#immersivePlayBtn")?.addEventListener("click", () => this._togglePlay());
      backdrop.querySelector("#immersivePrevBtn")?.addEventListener("click", () => this._playerCmd("previous"));
      backdrop.querySelector("#immersiveNextBtn")?.addEventListener("click", () => this._playerCmd("next"));
      backdrop.querySelector("#immersiveShuffleBtn")?.addEventListener("click", () => this._toggleShuffle());
      backdrop.querySelector("#immersiveRepeatBtn")?.addEventListener("click", () => this._toggleRepeat());
      backdrop.querySelector("#immersiveMuteBtn")?.addEventListener("click", () => this._toggleMute());
      backdrop.querySelector("#immersiveChoosePlayerBtn")?.addEventListener("click", () => this._openPlayerModal());
      backdrop.querySelector("#immersiveQueueBtn")?.addEventListener("click", () => this._showQueue());
      backdrop.querySelector("#immersiveTransferBtn")?.addEventListener("click", () => this._openTransferQueuePicker());
      backdrop.querySelector("#immersiveVolumeSlider")?.addEventListener("input", (e) => {
        const pct = Number(e.target.value || 0);
        e.target.style.setProperty("--vol-pct", `${pct}%`);
        this._syncBigVolumeMirror(pct);
        const small = this.$("volSlider");
        if (small) {
          small.value = pct;
          small.style.setProperty("--vol-pct", `${pct}%`);
        }
        this._setButtonIcon(this.$("btnMute"), pct === 0 ? "volume_mute" : pct < 40 ? "volume_low" : "volume_high");
        this._setButtonIcon(this.$("bigMuteBtn"), pct === 0 ? "volume_mute" : pct < 40 ? "volume_low" : "volume_high");
        this._setButtonIcon(backdrop.querySelector("#immersiveMuteBtn"), pct === 0 ? "volume_mute" : pct < 40 ? "volume_low" : "volume_high");
        clearTimeout(this._bigVolumeTimer);
        this._bigVolumeTimer = setTimeout(() => this._setVolume(pct / 100), 120);
      });
    }

    _syncImmersiveNowPlaying() {
      if (!this._state.immersiveNowPlayingOpen) return;
      const player = this._getSelectedPlayer();
      const backdrop = this.$("immersiveNowPlaying");
      if (!player || !backdrop?.classList.contains("open")) return;
      const duration = this._getCurrentDuration();
      const position = this._getCurrentPosition();
      const pct = duration ? Math.min(100, (position / duration) * 100) : 0;
      const vol = Math.round((player.attributes.volume_level || 0) * 100);
      const art = this._currentArtworkUrl(player, this._state.maQueueState?.current_item || null, 180);
      const repeat = player.attributes.repeat || "off";
      const title = player.attributes.media_title || this._i18n("ui.no_active_media");
      const artist = player.attributes.media_artist || this._i18n("ui.unknown");
      const album = player.attributes.media_album_name || "";
      const playerName = player.attributes.friendly_name || player.entity_id;
      backdrop.querySelector(".immersive-title")?.replaceChildren(document.createTextNode(title));
      backdrop.querySelector(".immersive-subtitle")?.replaceChildren(document.createTextNode([artist, album].filter(Boolean).join(" · ")));
      backdrop.querySelector("#immersivePlayerName")?.replaceChildren(document.createTextNode(`${this._i18n("ui.playing_on")}: ${playerName}`));
      const play = backdrop.querySelector("#immersivePlayBtn");
      this._setButtonIcon(play, this._playPauseIconName(player));
      const shuffle = backdrop.querySelector("#immersiveShuffleBtn");
      if (shuffle) shuffle.classList.toggle("active", !!player.attributes.shuffle);
      const repeatBtn = backdrop.querySelector("#immersiveRepeatBtn");
      if (repeatBtn) {
        repeatBtn.classList.toggle("active", repeat !== "off");
        repeatBtn.dataset.repeatMode = repeat;
        repeatBtn.title = this._repeatModeLabel(repeat);
        repeatBtn.setAttribute("aria-label", this._repeatModeLabel(repeat));
      }
      const mute = backdrop.querySelector("#immersiveMuteBtn");
      this._setButtonIcon(repeatBtn, repeat === "one" ? "repeat_one" : "repeat");
      this._setButtonIcon(mute, this._volumeIconName(player));
      const slider = backdrop.querySelector("#immersiveVolumeSlider");
      if (slider) {
        slider.value = vol;
        slider.style.setProperty("--vol-pct", `${vol}%`);
      }
      const progress = backdrop.querySelector("#immersiveProgressFill");
      if (progress) progress.style.width = `${pct}%`;
      const cur = backdrop.querySelector("#immersiveCurTime");
      if (cur) cur.textContent = this._fmtDur(position);
      const total = backdrop.querySelector("#immersiveTotalTime");
      if (total) total.textContent = this._fmtDur(duration);
      const artBox = backdrop.querySelector("#immersiveArt");
      if (artBox) artBox.innerHTML = art ? `<img src="${this._esc(art)}" alt="">` : this._artPlaceholderHtml("music_note");
      const bg = backdrop.querySelector(".immersive-bg");
      if (bg) bg.style.backgroundImage = art ? `url("${art}")` : "";
      const glow = backdrop.querySelector(".immersive-cover-glow");
      if (glow) glow.style.backgroundImage = art ? `url("${art}")` : "";
    }

    _handleWindowResize() {
      clearTimeout(this._resizeTimer);
      this._resizeTimer = setTimeout(() => {
        if (!this.isConnected || !this._built) return;
        if (Date.now() < Number(this._layoutResizeHoldUntil || 0)) return;
        const reopenImmersive = this._state.immersiveNowPlayingOpen;
        const viewportWidth = typeof window !== "undefined" ? Number(window.innerWidth || 0) : 0;
        const viewportHeight = typeof window !== "undefined" ? Number(window.innerHeight || 0) : 0;
        const currentWidth = this._getCardWidth(viewportWidth);
        const currentHeight = this._getAllocatedCardHeight(viewportHeight);
        const previousWidth = this._lastCardWidth || this._lastViewportWidth || 0;
        const previousHeight = this._lastCardHeight || this._lastViewportHeight || 0;
        const currentLayoutMode = this._layoutModeConfig({ width: currentWidth });
        const card = this.shadowRoot?.querySelector(".card") || null;
        const renderedLayoutMode = this._renderedLayoutMode
          || (card?.classList.contains("layout-tablet") ? "tablet" : card?.classList.contains("layout-mobile") ? "mobile" : "");
        const layoutModeStale = !!(renderedLayoutMode && currentLayoutMode && renderedLayoutMode !== currentLayoutMode);
        const active = this.shadowRoot?.activeElement || document.activeElement;
        const activeTag = active?.tagName?.toLowerCase?.() || "";
        const editingText = active && (activeTag === "input" || activeTag === "textarea" || active?.isContentEditable);
        const tabletStabilityMode = this._tabletStabilityModeEnabled();
        const resizeStrategy = HomeiiResponsiveFoundation.resolveResizeStrategy({
          previousWidth,
          currentWidth,
          previousHeight,
          currentHeight,
          editingText,
          tabletStabilityMode,
        });
        this._lastCardWidth = currentWidth;
        this._lastCardHeight = currentHeight;
        this._lastViewportWidth = viewportWidth;
        this._lastViewportHeight = viewportHeight;
        if (resizeStrategy.keyboardLikeResize && !layoutModeStale) return;
        if (resizeStrategy.softSync && !layoutModeStale) {
          this._syncTabletAutoFitUi();
          this._syncSleepTimerChip();
          this._syncSourceBadgesUi();
          this._syncRecentHistoryUi();
          this._syncControlRoomUi();
          return;
        }
        this._build();
        this._loadPlayers();
        this._renderPlayerSummary();
        this._syncMaButtonVisibility();
        this._syncBrandPlayingState();
        this._updateThemeButton();
        if (this._state.view === "now_playing") this._renderNowPlayingPage();
        else if (this._state.query) this._renderGlobalSearch(this._state.query);
        else this._renderCurrentView();
        this._syncNowPlayingUI();
        if (reopenImmersive && this._state.view === "now_playing") this._openImmersiveNowPlaying();
      }, 120);
    }

    _setView(view, btn = null) {
      if (view !== "now_playing" && this._state.immersiveNowPlayingOpen) this._closeImmersiveNowPlaying();
      this._state.view = view;
      this.shadowRoot.querySelectorAll(".nav-btn").forEach((b) => b.classList.toggle("active", b === btn || b.dataset.view === view));
      const isNowPlaying = view === "now_playing";
      this.$("searchWrap").style.display = isNowPlaying ? "none" : "";
      if (isNowPlaying) {
        this.$("searchInp").value = "";
        this._state.query = "";
        this.$("searchClear").style.display = "none";
      }
      if (this._state.queueVisible) this._hideQueue();
      this._renderCurrentView();
    }

    async _renderCurrentView() {
      switch (this._state.view) {
        case "now_playing": return this._renderNowPlayingPage();
        case "radio": return this._renderRadio();
        case "podcasts": return this._renderPodcasts();
        case "albums": return this._renderAlbums();
        case "artists": return this._renderArtists();
        case "tracks": return this._renderTracks();
        case "playlists": return this._renderPlaylists();
        default: return this._renderHome();
      }
    }

    _nextRenderToken() {
      this._state.renderToken += 1;
      return this._state.renderToken;
    }

    _isValidRender(token) {
      return token === this._state.renderToken;
    }

    _loadingStateHtml(text = this._i18n("ui.loading"), { notice = false, compact = false } = {}) {
      const className = notice ? "notice open homeii-loading-notice" : `homeii-loading-state${compact ? " compact" : ""}`;
      return `
        <div class="${className}" role="status" aria-live="polite">
          <div class="homeii-loading-content">
            <span class="homeii-loading-mark" aria-hidden="true">
              <span class="homeii-loading-ring"></span>
              <span class="homeii-loading-ring secondary"></span>
              <span class="homeii-loading-core"></span>
            </span>
            <span class="homeii-loading-text">${this._esc(text)}</span>
          </div>
        </div>
      `;
    }

    _renderLoading(text = this._i18n("ui.loading")) {
      this.$("content").classList.remove("now-playing-mode");
      this.$("content").innerHTML = this._loadingStateHtml(text);
    }

    _renderEmpty(text = this._i18n("ui.no_content_found")) {
      this.$("content").classList.remove("now-playing-mode");
      this.$("content").innerHTML = `<div class="state-box">${this._esc(text)}</div>`;
    }

    _renderError(error, retryFn = null) {
      const msg = error?.message || String(error || "Unknown error");
      this.$("content").classList.remove("now-playing-mode");
      this.$("content").innerHTML = `
        <div class="state-box">
          <div>
            <div style="font-size:20px;margin-bottom:8px;">⚠</div>
            <div>${this._esc(msg)}</div>
            ${retryFn ? `<div style="margin-top:12px;"><button class="chip-btn" id="retryBtn">${this._i18n("ui.try_again")}</button></div>` : ""}
          </div>
        </div>`;
      if (retryFn) this.$("retryBtn")?.addEventListener("click", retryFn, { once: true });
    }

    async _renderHome() {
      const token = this._nextRenderToken();
      this._renderLoading(this._i18n("ui.loading_library"));
      try {
        const results = await Promise.allSettled([
          this._getLibrary("radio", "sort_name", 24, true),
          this._fetchRecentlyPlayed(18),
          this._fetchLibrary("album", "last_modified", 18, false),
          this._fetchLibrary("album", "random", 18, false),
        ]);
        if (!this._isValidRender(token)) return;
        const [radio, recentlyPlayed, recentAlbums, randomAlbums] = results.map((r) => r.value ?? []);
        let html = "";
        if (radio.length) html += this._sectionHtml(this._i18n("ui.favorite_radio"), radio, "radio", true);
        if (recentlyPlayed.length) html += this._sectionHtml(this._i18n("ui.recently_played"), recentlyPlayed, "album", true);
        if (recentAlbums.length) html += this._sectionHtml(this._i18n("ui.recently_added"), recentAlbums, "album", true);
        if (randomAlbums.length) html += this._sectionHtml(this._i18n("ui.discover"), randomAlbums, "album", true);
        const availabilityError = results.find((result) => result.status === "rejected" && this._isMusicAssistantAvailabilityError(result.reason));
        const issueMessage = this._state.musicAssistantIssueMessage || (availabilityError ? this._handleMusicAssistantIssue(availabilityError.reason) : "");
        this.$("content").classList.remove("now-playing-mode");
        this.$("content").innerHTML = html || `<div class="state-box">${this._esc(issueMessage || this._i18n("ui.no_content_found"))}</div>`;
        this._hydrateImages();
        this._highlightNowPlaying();
      } catch (e) {
        if (!this._isValidRender(token)) return;
        this._renderError(e, () => this._renderHome());
      }
    }

    async _renderRadio() { return this._renderGridCollection("radio", this._i18n("ui.radio_stations"), 5000, false); }
    async _renderPodcasts() { return this._renderGridCollection("podcast", this._i18n("ui.all_podcasts"), 500, false); }
    async _renderAlbums() { return this._renderGridCollection("album", this._i18n("ui.all_albums"), 500, false); }
    async _renderArtists() { return this._renderGridCollection("artist", this._i18n("ui.all_artists"), 500, false); }
    async _renderPlaylists() { return this._renderGridCollection("playlist", this._i18n("ui.playlists"), 500, false); }

    _setTracksLayout(layout) {
      this._state.tracksLayout = layout === "grid" ? "grid" : "list";
      try { localStorage.setItem("homeii_music_flow_tracks_layout", this._state.tracksLayout); } catch (_) {}
      if (this._state.view === "tracks") this._renderTracks();
    }

    async _renderTracks() {
      const token = this._nextRenderToken();
      this._renderLoading(this._i18n("ui.loading"));
      try {
        const items = await this._getLibrary("track", "sort_name", 500);
        if (!this._isValidRender(token)) return;
        const isGrid = this._state.tracksLayout === "grid";
        this.$("content").classList.remove("now-playing-mode");
        this.$("content").innerHTML = `
          <div class="section">
            <div class="section-header">
              <div class="section-title">${this._esc(this._i18n("ui.all_tracks"))}</div>
              <div class="section-badge">${items.length}</div>
              <div class="section-actions">
                <button class="chip-btn ${isGrid ? "active" : ""}" id="tracksGridBtn">${this._i18n("ui.grid")}</button>
                <button class="chip-btn ${!isGrid ? "active" : ""}" id="tracksListBtn">${this._i18n("ui.list")}</button>
                ${this._sectionActionButtons(items)}
              </div>
            </div>
            <div class="${isGrid ? "grid" : "track-list"}">${isGrid ? items.map((item) => this._mediaCardHtml(item, "track")).join("") : items.map((item, i) => this._trackRowHtml(item, i + 1)).join("")}</div>
          </div>`;
        this.$("tracksGridBtn")?.addEventListener("click", () => this._setTracksLayout("grid"));
        this.$("tracksListBtn")?.addEventListener("click", () => this._setTracksLayout("list"));
        this._hydrateImages();
        this._highlightNowPlaying();
      } catch (e) {
        if (!this._isValidRender(token)) return;
        this._renderError(e, () => this._renderTracks());
      }
    }

    async _renderGridCollection(mediaType, title, limit = 500, favoritesOnly = false) {
      const token = this._nextRenderToken();
      this._renderLoading(this._i18n("ui.loading"));
      try {
        const items = await this._getLibrary(mediaType, "sort_name", limit, favoritesOnly);
        if (!this._isValidRender(token)) return;
        this.$("content").classList.remove("now-playing-mode");
        this.$("content").innerHTML = this._sectionHtml(title, items, mediaType, true);
        this._hydrateImages();
        this._highlightNowPlaying();
      } catch (e) {
        if (!this._isValidRender(token)) return;
        this._renderError(e, () => this._renderGridCollection(mediaType, title, limit, favoritesOnly));
      }
    }

    async _renderGlobalSearch(query) {
      const token = this._nextRenderToken();
      this._renderLoading(`${this._i18n("ui.search")}: ${query}`);
      try {
        const res = await this._search(query);
        if (!this._isValidRender(token)) return;
        const { radio = [], podcasts = [], albums = [], artists = [], tracks = [], playlists = [] } = res;
        let html = `<div class="section"><div class="section-header"><div class="section-title">${this._esc(this._i18n("ui.search"))}: ${this._esc(query)}</div></div></div>`;
        if (radio.length) html += this._sectionHtml(this._i18n("ui.radio"), radio, "radio", false);
        if (podcasts.length) html += this._sectionHtml(this._i18n("ui.podcasts"), podcasts, "podcast", false);
        if (albums.length) html += this._sectionHtml(this._i18n("ui.albums"), albums, "album", false);
        if (artists.length) html += this._sectionHtml(this._i18n("ui.artists"), artists, "artist", false);
        if (tracks.length) {
          html += `<div class="section"><div class="section-header"><div class="section-title">${this._esc(this._i18n("ui.tracks"))}</div><div class="section-badge">${tracks.length}</div><div class="section-actions">${this._sectionActionButtons(tracks)}</div></div><div class="track-list">${tracks.map((item, i) => this._trackRowHtml(item, i + 1)).join("")}</div></div>`;
        }
        if (playlists.length) html += this._sectionHtml(this._i18n("ui.playlists"), playlists, "playlist", false);
        if (!radio.length && !podcasts.length && !albums.length && !artists.length && !tracks.length && !playlists.length) html = `<div class="state-box">${this._esc(this._i18n("ui.no_results"))}: "${this._esc(query)}"</div>`;
        this.$("content").classList.remove("now-playing-mode");
        this.$("content").innerHTML = html;
        this._hydrateImages();
        this._highlightNowPlaying();
      } catch (e) {
        if (!this._isValidRender(token)) return;
        this._renderError(e, () => this._renderGlobalSearch(query));
      }
    }

    async _renderNowPlayingPage() {
      const token = this._nextRenderToken();
      this._renderLoading(this._i18n("ui.loading"));
      try {
        await this._ensureQueueSnapshot();
        this._refreshGroupingState();
        if (!this._isValidRender(token)) return;
        const player = this._getSelectedPlayer();
        if (!player) return this._renderEmpty(this._i18n("ui.no_active_media"));

        const title = player.attributes.media_title || this._i18n("ui.no_active_media");
        const artist = player.attributes.media_artist || this._i18n("ui.unknown");
        const album = player.attributes.media_album_name || "";
        const state = player.state || "idle";
        const queueItem = this._state.maQueueState?.current_item || null;
        const art = this._currentArtworkUrl(player, queueItem, 520);
        const duration = this._getCurrentDuration();
        const position = this._getCurrentPosition();
        const progressPct = duration ? Math.min(100, (position / duration) * 100) : 0;
        const volumePct = Math.round((player.attributes.volume_level || 0) * 100);
        const shuffle = !!player.attributes.shuffle;
        const repeat = player.attributes.repeat || "off";
        const queueItems = this._getNowPlayingQueueItems();
        const nowPlayingQuery = this._state.nowPlayingQuery || "";

        this.$("content").classList.add("now-playing-mode");
        this.$("content").innerHTML = `
          <div class="now-layout">
            <div class="now-left">
              <div class="now-card now-art-card">
                <div class="now-art" id="nowHeroArt">${art ? `<img src="${this._esc(art)}" alt="">` : this._artPlaceholderHtml("music_note")}</div>
                <div class="now-track-meta">
                  <div class="now-track-title">${this._esc(title)}</div>
                  <div class="now-track-subtitle">${this._esc([artist, album].filter(Boolean).join(" · "))}</div>
                </div>
              </div>

              <div class="now-card now-controls-card">
                <div class="now-time-row"><span id="bigCurTime">${this._esc(this._fmtDur(position))}</span><span id="bigTotalTime">${this._esc(this._fmtDur(duration))}</span></div>
                <div class="now-progress" id="bigProgressBar"><div class="now-progress-fill" id="bigProgressFill" style="width:${progressPct}%"></div></div>
                <div class="now-controls-main">
                  <button class="big-round-btn ${shuffle ? "active" : ""}" id="bigShuffleBtn">${this._iconSvg("shuffle")}</button>
                  <button class="big-round-btn" id="bigPrevBtn">${this._iconSvg("previous")}</button>
                  <button class="big-main-btn" id="bigPlayBtn">${this._iconSvg(state === "playing" ? "pause" : "play")}</button>
                  <button class="big-round-btn" id="bigNextBtn">${this._iconSvg("next")}</button>
                  <button class="big-round-btn ${repeat !== "off" ? "active" : ""}" id="bigRepeatBtn">${this._iconSvg(repeat === "one" ? "repeat_one" : "repeat")}</button>
                </div>
                <div class="now-controls-bottom">
                  <div class="now-volume">
                    <button class="big-round-btn" id="bigMuteBtn">${this._iconSvg(this._volumeIconName(player))}</button>
                    <input id="bigVolumeSlider" type="range" min="0" max="100" value="${volumePct}" style="--vol-pct:${volumePct}%">
                  </div>
                  <div class="now-actions">
                    <button class="chip-btn now-player-picker-btn" id="choosePlayerInlineBtn" title="${this._i18n("ui.open_player_picker")}">${this._iconSvg("speaker")}</button>
                  </div>
                </div>
              </div>
            </div>

            <div class="now-right">
              <div class="now-card now-queue-card">
                <div class="now-queue-toolbar">
                  <div class="now-queue-header">
                    <div class="now-queue-title" id="nowQueuePanelTitle">${this._i18n("ui.up_next")}</div>
                    <div class="now-queue-count" id="nowQueuePanelCount">${queueItems.length}</div>
                    <div class="group-inline">
                      <button class="chip-btn" id="openQueueBtn">${this._i18n("ui.open_full_queue")}</button>
                      <button class="chip-btn" id="transferQueueBtn">${this._i18n("ui.transfer_queue")}</button>
                      <button class="chip-btn" id="groupBtn">${this._i18n("ui.group_speakers")}</button>
                    </div>
                  </div>
                  <div class="search now-queue-search">
                    <span>🔍</span>
                    <input id="nowQueueSearchInput" type="text" value="${this._esc(nowPlayingQuery)}" placeholder="${this._i18n("ui.search_queue_and_library")}">
                    <button class="icon-btn" id="nowQueueSearchClear" style="display:${nowPlayingQuery.trim() ? "" : "none"};" title="${this._i18n("ui.clear_search")}">✕</button>
                  </div>
                </div>
                <div class="now-queue-body" id="nowQueuePanelBody">${this._queuePanelHtml(queueItems)}</div>
              </div>
            </div>
          </div>`;
        this._bindNowPlayingPage();
        this._updateNowPlayingSidePanel();
        this._highlightNowPlaying();
      } catch (e) {
        if (!this._isValidRender(token)) return;
        this._renderError(e, () => this._renderNowPlayingPage());
      }
    }

    _getNowPlayingQueueItems() {
      const currentIndex = this._state.maQueueState?.current_index ?? -1;
      return (this._state.queueItems || []).filter((item) => (item.sort_index ?? 0) >= currentIndex).slice(0, 100);
    }

    _queuePanelHtml(queueItems = []) {
      if (!queueItems.length) {
        return `<div class="now-side-scroll"><div class="state-box" style="min-height:120px;">${this._esc(this._i18n("ui.queue_is_empty"))}</div></div>`;
      }
      return `<div class="now-side-scroll"><div class="now-queue-list">${queueItems.map((item) => this._miniQueueItemHtml(item)).join("")}</div></div>`;
    }

    _nowPlayingSearchResultsHtml(query, results) {
      const { radio = [], podcasts = [], albums = [], artists = [], tracks = [], playlists = [] } = results || {};
      const total = radio.length + podcasts.length + albums.length + artists.length + tracks.length + playlists.length;
      if (!total) {
        return `<div class="now-side-scroll"><div class="state-box">${this._esc(this._i18n("ui.no_results"))}: "${this._esc(query)}"</div></div>`;
      }

      let html = `
        <div class="now-side-scroll">
          <div class="side-search-summary">
            <div class="side-search-summary-text">${this._esc(this._i18n("ui.queue_results"))}: "${this._esc(query)}"</div>
            <button class="chip-btn" id="backToQueueBtn">${this._esc(this._i18n("ui.back_to_queue"))}</button>
          </div>`;
      if (radio.length) html += this._sectionHtml(this._i18n("ui.radio"), radio, "radio", false);
      if (podcasts.length) html += this._sectionHtml(this._i18n("ui.podcasts"), podcasts, "podcast", false);
      if (albums.length) html += this._sectionHtml(this._i18n("ui.albums"), albums, "album", false);
      if (artists.length) html += this._sectionHtml(this._i18n("ui.artists"), artists, "artist", false);
      if (tracks.length) {
        html += `<div class="section"><div class="section-header"><div class="section-title">${this._esc(this._i18n("ui.tracks"))}</div><div class="section-badge">${tracks.length}</div></div><div class="track-list">${tracks.map((item, i) => this._trackRowHtml(item, i + 1)).join("")}</div></div>`;
      }
      if (playlists.length) html += this._sectionHtml(this._i18n("ui.playlists"), playlists, "playlist", false);
      html += `</div>`;
      return html;
    }

    async _updateNowPlayingSidePanel() {
      if (this._state.view !== "now_playing") return;
      const body = this.$("nowQueuePanelBody");
      const title = this.$("nowQueuePanelTitle");
      const count = this.$("nowQueuePanelCount");
      const clear = this.$("nowQueueSearchClear");
      if (!body || !title || !count) return;

      const query = String(this._state.nowPlayingQuery || "").trim();
      if (clear) clear.style.display = query ? "" : "none";

      const token = ++this._state.sidePanelToken;
      if (!query) {
        const queueItems = this._getNowPlayingQueueItems();
        title.textContent = this._i18n("ui.up_next");
        count.textContent = String(queueItems.length);
        body.innerHTML = this._queuePanelHtml(queueItems);
        this._hydrateImages();
        this._highlightNowPlaying();
        return;
      }

      title.textContent = this._i18n("ui.search");
      count.textContent = "…";
      body.innerHTML = `<div class="now-side-scroll">${this._loadingStateHtml(this._i18n("ui.loading"), { compact: true })}</div>`;

      try {
        const results = await this._search(query);
        if (token !== this._state.sidePanelToken || !body.isConnected) return;
        const total = Object.values(results || {}).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0);
        count.textContent = String(total);
        body.innerHTML = this._nowPlayingSearchResultsHtml(query, results);
        this.$("backToQueueBtn")?.addEventListener("click", () => {
          const input = this.$("nowQueueSearchInput");
          if (input) input.value = "";
          this._state.nowPlayingQuery = "";
          this._updateNowPlayingSidePanel();
        });
        this._hydrateImages();
        this._highlightNowPlaying();
      } catch (e) {
        if (token !== this._state.sidePanelToken || !body.isConnected) return;
        count.textContent = "!";
        body.innerHTML = `<div class="now-side-scroll"><div class="state-box">${this._esc(e?.message || this._i18n("ui.try_again"))}</div></div>`;
      }
    }

    _bindNowPlayingPage() {
      const bind = (id, fn) => {
        const el = this.$(id);
        if (el) el.addEventListener("click", fn);
      };
      bind("bigPlayBtn", () => this._togglePlay());
      bind("bigPrevBtn", () => this._playerCmd("previous"));
      bind("bigNextBtn", () => this._playerCmd("next"));
      bind("bigShuffleBtn", () => this._toggleShuffle());
      bind("bigRepeatBtn", () => this._toggleRepeat());
      bind("bigMuteBtn", () => this._toggleMute());
      bind("openQueueBtn", () => this._showQueue());
      bind("transferQueueBtn", () => this._openTransferQueuePicker());
      bind("groupBtn", () => this._openGroupModal());
      bind("choosePlayerInlineBtn", () => this._openPlayerModal());
      bind("nowHeroArt", () => this._openImmersiveNowPlaying());
      this._bindProgressSeekBar(this.$("bigProgressBar"));
      const queueSearch = this.$("nowQueueSearchInput");
      if (queueSearch) {
        queueSearch.addEventListener("input", () => {
          this._state.nowPlayingQuery = queueSearch.value || "";
          clearTimeout(this._nowPlayingSearchTimer);
          this._nowPlayingSearchTimer = setTimeout(() => this._updateNowPlayingSidePanel(), 220);
        });
        queueSearch.addEventListener("keydown", (e) => e.stopPropagation());
      }
      bind("nowQueueSearchClear", () => {
        const input = this.$("nowQueueSearchInput");
        if (input) input.value = "";
        this._state.nowPlayingQuery = "";
        this._updateNowPlayingSidePanel();
      });
      const bigVolume = this.$("bigVolumeSlider");
      if (bigVolume) {
        bigVolume.addEventListener("input", (e) => {
          const pct = Number(e.target.value || 0);
          e.target.style.setProperty("--vol-pct", `${pct}%`);
          const small = this.$("volSlider");
          if (small) {
            small.value = pct;
            small.style.setProperty("--vol-pct", `${pct}%`);
          }
          this._setButtonIcon(this.$("btnMute"), pct === 0 ? "volume_mute" : pct < 40 ? "volume_low" : "volume_high");
          this._setButtonIcon(this.$("bigMuteBtn"), pct === 0 ? "volume_mute" : pct < 40 ? "volume_low" : "volume_high");
          clearTimeout(this._bigVolumeTimer);
          this._bigVolumeTimer = setTimeout(() => this._setVolume(pct / 100), 120);
        });
      }
    }

    _sectionHtml(title, items, mediaType, withActions = true) {
      const count = items.length || 0;
      const actions = withActions ? `<div class="section-actions">${this._sectionActionButtons(items)}</div>` : "";
      return `<div class="section"><div class="section-header"><div class="section-title">${this._esc(title)}</div><div class="section-badge">${count}</div>${actions}</div><div class="grid">${items.map((item) => this._mediaCardHtml(item, mediaType)).join("")}</div></div>`;
    }

    _sectionActionButtons(items) {
      if (!items?.length) return "";
      const encoded = this._esc(JSON.stringify(items.map((i) => ({ uri: i.uri, media_type: i.media_type || "album" }))));
      return `<button class="chip-btn" data-action="play-all" data-items="${encoded}">${this._esc(this._i18n("ui.play_all"))}</button><button class="chip-btn" data-action="shuffle-all" data-items="${encoded}">${this._esc(this._i18n("ui.shuffle_all"))}</button>`;
    }

    _mediaCardHtml(item, forcedType = null) {
      const mediaType = forcedType || item.media_type || "album";
      const uri = item.uri || "";
      const name = item.name || "";
      const artUrl = this._artUrl(item);
      const artist = mediaType === "artist" ? this._i18n("ui.artist") : mediaType === "radio" ? (item.metadata?.description || "") : this._artistName(item) || item.album?.name || "";
      const placeholder = mediaType === "radio" ? "radio" : mediaType === "artist" ? "artist" : mediaType === "podcast" ? "podcast" : "music_note";
      const imgAttrs = artUrl ? `data-img="${this._esc(artUrl)}" data-placeholder="${placeholder}"` : "";
      return `<div class="media-card" data-uri="${this._esc(uri)}" data-type="${this._esc(mediaType)}"><div class="media-art" ${imgAttrs}><div class="media-placeholder">${this._artPlaceholderHtml(placeholder)}</div><div class="media-overlay"><div class="play-bubble">▶</div></div><div class="playing-badge">▶</div></div><div class="media-title">${this._esc(name)}</div><div class="media-sub">${this._esc(artist)}</div></div>`;
    }

    _trackRowHtml(item, index = 1) {
      const artUrl = this._artUrl(item);
      const name = item.name || "";
      const artist = this._artistName(item);
      const sub = [artist, item.album?.name].filter(Boolean).join(" · ");
      const imgAttrs = artUrl ? `data-img="${this._esc(artUrl)}" data-placeholder="music_note"` : "";
      return `<div class="track-row" data-uri="${this._esc(item.uri || "")}" data-type="track"><div class="track-num">${index}</div><div class="track-art" ${imgAttrs}>${this._artPlaceholderHtml("music_note")}</div><div class="track-meta"><div class="track-name">${this._esc(name)}</div><div class="track-sub">${this._esc(sub)}</div></div><div class="track-dur">${this._fmtDur(item.duration)}</div></div>`;
    }

    _getQueueItemKey(item) {
      return HomeiiMediaQueueFoundation.getQueueItemKey(item);
    }

    _getQueueItemStableId(item) {
      return HomeiiMediaQueueFoundation.getQueueItemStableId(item);
    }

    _getQueueItemPlaybackId(item) {
      return HomeiiMediaQueueFoundation.getQueueItemPlaybackId(item);
    }

    _getQueueItemUri(item) {
      return HomeiiMediaQueueFoundation.getQueueItemUri(item);
    }

    _queueItemOrderIdentity(item = {}, index = 0) {
      const stableId = this._getQueueItemStableId(item);
      const uri = this._getQueueItemUri(item);
      const title = this._queueItemPrimaryTitle(item);
      const artist = this._queueItemPrimaryArtist(item);
      const sortIndex = Number.isFinite(Number(item?.sort_index)) ? `sort:${item.sort_index}` : "";
      return stableId || uri || [title, artist].filter(Boolean).join("::") || sortIndex || `idx:${index}`;
    }

    _queueOrderSignature(items = []) {
      return (Array.isArray(items) ? items : [])
        .map((item, index) => this._queueItemOrderIdentity(item, index))
        .join("|");
    }

    _queueRenderSignature() {
      return [
        this._queueOrderSignature(this._state.queueItems || []),
        this._state.maQueueState?.current_index ?? "",
        this._getQueueItemStableId(this._state.maQueueState?.current_item || {}) || this._getQueueItemUri(this._state.maQueueState?.current_item || ""),
      ].join("::");
    }

    _queueItemsWithSequentialSortIndexes(items = []) {
      return (Array.isArray(items) ? items : [])
        .filter(Boolean)
        .map((item, index) => ({
          ...item,
          sort_index: index,
        }));
    }

    _queueVisibleItemsForMove(items = []) {
      const allItems = Array.isArray(items) ? items.filter(Boolean) : [];
      const currentIndex = HomeiiMediaQueueFoundation.normalizeFiniteNumber(this._state.maQueueState?.current_index);
      if (!Number.isFinite(currentIndex)) return allItems;
      const visibleItems = allItems.filter((item) => Number(item?.sort_index ?? -1) >= currentIndex);
      return visibleItems.length ? visibleItems : allItems;
    }

    _queueFirstMovableIndex(items = []) {
      const allItems = Array.isArray(items) ? items : [];
      const currentIndex = HomeiiMediaQueueFoundation.normalizeFiniteNumber(this._state.maQueueState?.current_index);
      if (!Number.isFinite(currentIndex)) return 0;
      const currentArrayIndex = allItems.findIndex((item) => Number(item?.sort_index) === currentIndex);
      return Math.max(0, currentArrayIndex + 1);
    }

    _queueMoveGlobalIndexForDisplayPosition(items = [], targetPosition = 1) {
      const allItems = Array.isArray(items) ? items.filter(Boolean) : [];
      if (!allItems.length) return -1;
      const visibleItems = this._queueVisibleItemsForMove(allItems);
      const displayIndex = Math.max(0, Math.min(visibleItems.length - 1, Math.round(Number(targetPosition)) - 1 || 0));
      const targetItem = visibleItems[displayIndex] || null;
      if (!targetItem) return -1;
      const targetKey = this._getQueueItemKey(targetItem);
      const targetStableId = this._getQueueItemStableId(targetItem);
      const targetUri = this._getQueueItemUri(targetItem);
      const targetSortIndex = HomeiiMediaQueueFoundation.normalizeFiniteNumber(targetItem?.sort_index);
      const targetGlobalIndex = allItems.findIndex((item) =>
        item === targetItem
        || (targetKey && this._getQueueItemKey(item) === targetKey)
        || (targetStableId && this._getQueueItemStableId(item) === targetStableId)
        || (targetUri && this._mediaRefsEquivalent(this._getQueueItemUri(item), targetUri, item?.media_item?.media_type || item?.media_type || "track"))
        || (Number.isFinite(targetSortIndex) && Number(item?.sort_index) === targetSortIndex)
      );
      if (targetGlobalIndex < 0) return -1;
      return Math.max(this._queueFirstMovableIndex(allItems), targetGlobalIndex);
    }

    _queueDisplayPositionForEntry(entry = {}, fallbackPosition = 1) {
      const visibleItems = this._getNowPlayingQueueItems();
      const entryKey = this._getQueueItemKey(entry) || String(entry?.queue_item_id || entry?.queueItemId || entry?.key || "").trim();
      const entryStableId = this._getQueueItemStableId(entry);
      const entryUri = this._getQueueItemUri(entry) || String(entry?.uri || entry?.media_item?.uri || "").trim();
      const entrySortIndex = HomeiiMediaQueueFoundation.normalizeFiniteNumber(entry?.sort_index);
      const index = visibleItems.findIndex((item) =>
        (entryKey && this._getQueueItemKey(item) === entryKey)
        || (entryStableId && this._getQueueItemStableId(item) === entryStableId)
        || (entryUri && this._mediaRefsEquivalent(this._getQueueItemUri(item), entryUri, item?.media_item?.media_type || item?.media_type || "track"))
        || (Number.isFinite(entrySortIndex) && Number(item?.sort_index) === entrySortIndex)
      );
      if (index >= 0) return index + 1;
      const fallback = Math.round(Number(fallbackPosition || entry?.position));
      return Math.max(1, fallback || 1);
    }

    _resolveQueueActionTarget(items = [], queueItemId = "", fallbackUri = "", sortIndex = "") {
      const allItems = Array.isArray(items) ? items : [];
      const rawKey = String(queueItemId || "").trim();
      const uri = String(fallbackUri || "").trim();
      const numericSortIndex = HomeiiMediaQueueFoundation.normalizeFiniteNumber(sortIndex);
      return (rawKey ? allItems.find((item) =>
        this._getQueueItemKey(item) === rawKey
        || this._getQueueItemStableId(item) === rawKey
        || this._getQueueItemUri(item) === rawKey
      ) : null)
        || (uri ? allItems.find((item) =>
          this._mediaRefsEquivalent(
            this._getQueueItemUri(item),
            uri,
            item?.media_item?.media_type || item?.media_type || "track",
          )
        ) : null)
        || allItems.find((item) => Number.isFinite(numericSortIndex) && Number(item?.sort_index) === numericSortIndex)
        || null;
    }

    _queueItemPrimaryArtist(item = {}) {
      return HomeiiMediaQueueFoundation.queueItemPrimaryArtist(item);
    }

    _queueItemPrimaryTitle(item = {}) {
      return HomeiiMediaQueueFoundation.queueItemPrimaryTitle(item);
    }

    _isQueueItemCurrent(item = {}) {
      if (!item) return false;
      const currentItem = this._state.maQueueState?.current_item || null;
      const currentIndex = Number(this._state.maQueueState?.current_index);
      const itemIndex = Number(item?.sort_index);
      if (Number.isFinite(currentIndex) && Number.isFinite(itemIndex) && currentIndex === itemIndex) return true;
      const currentKey = this._getQueueItemKey(currentItem);
      const itemKey = this._getQueueItemKey(item);
      if (currentKey && itemKey && currentKey === itemKey) return true;
      const currentUri = this._getQueueItemUri(currentItem);
      const itemUri = this._getQueueItemUri(item);
      if (currentUri && itemUri && this._mediaRefsEquivalent(itemUri, currentUri, item?.media_item?.media_type || item?.media_type || "track")) return true;
      return this._queueItemMatchesPlayer(item);
    }

    _mobileUpNextItem() {
      return HomeiiMediaQueueFoundation.resolveMobileUpNextItem(
        this._state.maQueueState || {},
        this._state.queueItems || [],
      );
    }

    _syncMobileUpNextUi(item = null) {
      const buttons = Array.from(this.shadowRoot?.querySelectorAll?.("[data-up-next-inline]") || []);
      const enabled = this._mobileShowUpNextEnabled();
      this._syncTabletAutoFitUi(!!(enabled && item));
      buttons.forEach((button) => {
        const artEl = button.querySelector(".up-next-art");
        const prefixEl = button.querySelector(".up-next-prefix");
        const titleEl = button.querySelector(".up-next-title");
        if (!enabled || !item) {
          button.hidden = true;
          button.dataset.queueItemId = "";
          button.dataset.uri = "";
          button.dataset.type = "";
          button.dataset.sortIndex = "";
          button.title = "";
          if (artEl) artEl.innerHTML = "";
          if (prefixEl) prefixEl.textContent = "";
          if (titleEl) titleEl.textContent = "";
          return;
        }
        const title = this._queueItemPrimaryTitle(item) || this._i18n("ui.up_next_2");
        const art = this._queueItemImageUrl(item, 72);
        button.hidden = false;
        button.dataset.queueItemId = this._getQueueItemKey(item);
        button.dataset.uri = this._getQueueItemUri(item);
        button.dataset.type = item?.media_item?.media_type || item?.media_type || "track";
        button.dataset.sortIndex = Number.isFinite(Number(item?.sort_index)) ? String(item.sort_index) : "";
        button.title = this._i18n("ui.up_next_title", { title });
        if (artEl) {
          const artKey = art || "";
          if (artEl.dataset.artSrc !== artKey) {
            artEl.dataset.artSrc = artKey;
            artEl.innerHTML = art
              ? this._imgHtml(art, "", { loading: "eager", fetchpriority: "high" })
              : `<span class="up-next-art-fallback">${this._iconSvg("tracks")}</span>`;
          }
        }
        if (prefixEl) prefixEl.textContent = this._i18n("ui.up_next_2");
        if (titleEl) titleEl.textContent = title;
      });
    }

    async _playMobileUpNext() {
      const item = this._mobileUpNextItem();
      if (!item) {
        this._toast(this._i18n("ui.no_next_track_in_queue"));
        return;
      }
      const queueItemId = this._getQueueItemKey(item);
      const uri = this._getQueueItemUri(item);
      const mediaType = item?.media_item?.media_type || item?.media_type || "track";
      const sortIndex = Number.isFinite(Number(item?.sort_index)) ? Number(item.sort_index) : "";
      const played = await this._playQueueItem(queueItemId, uri, mediaType, sortIndex);
      if (played) this._toastSuccess(this._i18n("ui.skipped_to_up_next"));
    }

    _miniQueueItemHtml(item) {
      const img = this._queueItemImageUrl(item, 120);
      const artist = item.media_item?.artists?.map((a) => a.name).join(", ") || "";
      const isActive = this._isQueueItemCurrent(item);
      const key = this._getQueueItemKey(item);
      const priority = isActive ? "high" : "low";
      return `
        <div class="mini-queue-item ${isActive ? "active" : ""}" data-uri="${this._esc(item.media_item?.uri || "")}" data-type="track" data-sort-index="${this._esc(item.sort_index ?? "")}" data-queue-item-id="${this._esc(key)}">
          <div class="mini-queue-index">${isActive ? "▶" : (item.sort_index ?? "")}</div>
          <div class="mini-queue-thumb">${img ? this._imgHtml(img, "", { loading: isActive ? "eager" : "lazy", fetchpriority: priority }) : "♫"}</div>
          <div class="mini-queue-meta">
            <div class="mini-queue-name">${this._esc(item.media_item?.name || item.name || "")}</div>
            <div class="mini-queue-artist">${this._esc(artist)}</div>
          </div>
          <div class="mini-queue-actions">
            <button class="chip-btn" data-queue-action="up" data-queue-item-id="${this._esc(key)}">↑</button>
            <button class="chip-btn" data-queue-action="next" data-queue-item-id="${this._esc(key)}">⏭</button>
            <button class="chip-btn" data-queue-action="down" data-queue-item-id="${this._esc(key)}">↓</button>
            <button class="chip-btn warn" data-queue-action="remove" data-queue-item-id="${this._esc(key)}">✕</button>
          </div>
        </div>`;
    }

    async _handleContentClick(e) {
      this._dismissCtx();

      const queueActionBtn = e.target.closest("[data-queue-action]");
      if (queueActionBtn) {
        e.stopPropagation();
        const queueRow = queueActionBtn.closest("[data-queue-item-id]");
        const action = queueActionBtn.dataset.queueAction;
        const targetPosition = action === "move_to" ? this._queueMoveTargetFromElement(queueActionBtn) : null;
        if (action === "move_to" && !targetPosition) return;
        await this._handleQueueAction(
          action,
          queueActionBtn.dataset.queueItemId || queueRow?.dataset.queueItemId || "",
          queueRow?.dataset.uri || "",
          queueRow?.dataset.sortIndex || "",
          targetPosition,
        );
        return;
      }

      const secBtn = e.target.closest('[data-action="play-all"], [data-action="shuffle-all"]');
      if (secBtn) {
        let items = [];
        try { items = JSON.parse(secBtn.dataset.items || "[]"); } catch (_) { items = []; }
        if (!Array.isArray(items) || !items.length) {
          this._toastError(this._i18n("ui.no_content_found"));
          return;
        }
        const shuffle = secBtn.dataset.action === "shuffle-all";
        await this._playAll(items, shuffle);
        return;
      }

      const mediaCard = e.target.closest(".media-card");
      if (mediaCard?.dataset.uri) {
        await this._playMedia(mediaCard.dataset.uri, mediaCard.dataset.type || "album");
        return;
      }

      const trackRow = e.target.closest(".track-row");
      if (trackRow?.dataset.uri) {
        await this._playMedia(trackRow.dataset.uri, "track");
        return;
      }

      const miniQueueItem = e.target.closest(".mini-queue-item");
      if (miniQueueItem?.dataset.queueItemId || miniQueueItem?.dataset.uri) {
        await this._playQueueItem(
          miniQueueItem.dataset.queueItemId,
          miniQueueItem.dataset.uri,
          miniQueueItem.dataset.type || "track",
          miniQueueItem.dataset.sortIndex || ""
        );
      }
    }

    async _handleQueuePanelClick(e) {
      const queueActionBtn = e.target.closest("[data-queue-action]");
      if (queueActionBtn) {
        e.preventDefault();
        e.stopPropagation();
        const queueRow = queueActionBtn.closest("[data-queue-item-id]");
        const action = queueActionBtn.dataset.queueAction;
        const targetPosition = action === "move_to" ? this._queueMoveTargetFromElement(queueActionBtn) : null;
        if (action === "move_to" && !targetPosition) return;
        await this._handleQueueAction(
          action,
          queueActionBtn.dataset.queueItemId || queueRow?.dataset.queueItemId || "",
          queueRow?.dataset.uri || "",
          queueRow?.dataset.sortIndex || "",
          targetPosition,
        );
        return;
      }

      const queueItem = e.target.closest(".queue-item");
      if (queueItem?.dataset.queueItemId || queueItem?.dataset.uri) {
        await this._playQueueItem(
          queueItem.dataset.queueItemId,
          queueItem.dataset.uri,
          queueItem.dataset.type || "track",
          queueItem.dataset.sortIndex || ""
        );
      }
    }

    _handleContentContext(e) {
      if (this._isHotelMode()) return;
      const mediaCard = e.target.closest(".media-card");
      const trackRow = e.target.closest(".track-row");
      const el = mediaCard || trackRow;
      if (!el || !el.dataset.uri) return;
      e.preventDefault();
      this._showCtxMenu(e.clientX, e.clientY, el.dataset.uri, el.dataset.type || "album");
    }

    _handleDocumentClick(event) {
      if (!this._ctxMenu) return;
      if (Date.now() - (this._ctxMenuOpenedAt || 0) < 180) return;
      const path = event.composedPath ? event.composedPath() : [];
      if (!path.includes(this._ctxMenu)) this._dismissCtx();
    }

    _showCtxMenu(clientX, clientY, uri, type) {
      if (this._isHotelMode()) return;
      this._dismissCtx();
      const card = this.shadowRoot.querySelector(".card");
      const menu = document.createElement("div");
      menu.className = "ctx-menu";
      menu.innerHTML = `
        <div class="ctx-item" data-enqueue="play"><span class="ctx-ico">▶</span><span>${this._esc(this._i18n("ui.play_now"))}</span></div>
        <div class="ctx-item" data-enqueue="shuffle"><span class="ctx-ico">⇄</span><span>${this._esc(this._i18n("ui.shuffle_play"))}</span></div>
        <div class="ctx-item" data-enqueue="next"><span class="ctx-ico">⏭</span><span>${this._esc(this._i18n("ui.play_next"))}</span></div>
        <div class="ctx-item" data-enqueue="add"><span class="ctx-ico">＋</span><span>${this._esc(this._i18n("ui.add_to_queue"))}</span></div>`;
      menu.querySelectorAll(".ctx-item").forEach((item) => item.addEventListener("click", async (e) => {
        e.stopPropagation();
        await this._playMedia(uri, type, item.dataset.enqueue);
        this._dismissCtx();
      }));
      card.appendChild(menu);
      this._ctxMenu = menu;
      const cardRect = card.getBoundingClientRect();
      let left = clientX - cardRect.left;
      let top = clientY - cardRect.top;
      menu.style.left = `${left}px`;
      menu.style.top = `${top}px`;
      requestAnimationFrame(() => {
        const mr = menu.getBoundingClientRect();
        const cr = card.getBoundingClientRect();
        if (mr.right > cr.right) left -= mr.width;
        if (mr.bottom > cr.bottom) top -= mr.height;
        menu.style.left = `${Math.max(8, left)}px`;
        menu.style.top = `${Math.max(8, top)}px`;
      });
    }

    _dismissCtx() {
      if (this._ctxMenu) {
        this._ctxMenu.remove();
        this._ctxMenu = null;
      }
    }

    _hasService(domain, service) {
      return !!this._hass?.services?.[domain]?.[service];
    }

    _hasMusicAssistantBackend() {
      return this._hasService("music_assistant", "play_media")
        || this._hasDirectMAConnection()
        || !!String(this._resolvedConfigEntryId || this._config?.config_entry_id || "").trim();
    }

    _hasMassQueueService(service) {
      return this._hasService("mass_queue", service);
    }

    _setQueueBusy(isBusy) {
      const busy = !!isBusy;
      this._state.queueActionPending = busy;
      this.shadowRoot.querySelectorAll("[data-queue-action]").forEach((btn) => {
        btn.disabled = busy;
      });
    }

    _isQueueUiVisible() {
      return !!(
        this._state.queueVisible
        || this._state.view === "now_playing"
        || (this._state.menuOpen && this._state.menuPage === "queue")
      );
    }

    async _refreshQueueAfterMutation(delay = 160) {
      if (delay > 0) {
        await new Promise((resolve) => window.setTimeout(resolve, delay));
      }
      if (!this.isConnected) return;
      const previousQueueSignature = this._queueRenderSignature();
      await this._ensureQueueSnapshot(true);
      if (!this.isConnected) return;
      const nextQueueSignature = this._queueRenderSignature();
      if (this._state.view === "now_playing") this._renderNowPlayingPage();
      if (this._state.queueVisible) await this._renderQueueItems();
      if (this._state.menuOpen && this._state.menuPage === "queue" && nextQueueSignature !== previousQueueSignature) {
        await this._renderMobileMenu();
      }
    }

    _queueItemsContainCurrent(items = [], queueState = this._state.maQueueState) {
      return HomeiiMediaQueueFoundation.queueItemsContainCurrent(items, queueState);
    }

    _queueItemMatchesPlayer(item, player = this._getSelectedPlayer()) {
      return HomeiiMediaQueueFoundation.queueItemMatchesPlayer(
        item,
        player,
        (uriA, uriB, fallbackType) => this._mediaRefsEquivalent(uriA, uriB, fallbackType),
      );
    }

    _applyQueueSnapshot(queueState, items = [], force = false) {
      if (!queueState) return;
      const normalizedState = { ...queueState };
      const pendingState = HomeiiNowPlayingFoundation.pendingQueuePlayState(this._state, Date.now());
      const { hasPendingPlay, pendingKey, pendingUri, pendingIndex } = pendingState;
      const shouldConsiderReplace = force || !this._state.queueItems.length || this._isQueueUiVisible();
      const nextItems = this._queueItemsWithSequentialSortIndexes(Array.isArray(items) ? items : []);
      let freezeQueueItemsForPendingPlay = false;
      if (nextItems.length) {
        const currentIndex = Number(normalizedState.current_index);
        const currentKey = this._getQueueItemKey(normalizedState.current_item);
        const currentUri = this._getQueueItemUri(normalizedState.current_item);
        const currentFromItems = nextItems.find((item) =>
          (Number.isFinite(currentIndex) && Number(item?.sort_index) === currentIndex)
          || (currentKey && this._getQueueItemKey(item) === currentKey)
          || (currentUri && this._mediaRefsEquivalent(this._getQueueItemUri(item), currentUri, item?.media_item?.media_type || item?.media_type || "track"))
        );
        if (currentFromItems) normalizedState.current_item = currentFromItems;
        const normalizedIndex = Number(normalizedState.current_index);
        if (Number.isFinite(normalizedIndex)) {
          const nextFromItems = nextItems.find((item) => Number(item?.sort_index) === normalizedIndex + 1);
          if (nextFromItems) normalizedState.next_item = nextFromItems;
        }
      }
      if (nextItems.length) {
        const player = this._getSelectedPlayer();
        const playerUri = String(player?.attributes?.media_content_id || "").trim();
        const playerTitle = String(player?.attributes?.media_title || "").trim().toLowerCase();
        const playerArtist = String(player?.attributes?.media_artist || "").trim().toLowerCase();
        let playerMatch = null;
        if (playerUri) {
          playerMatch = nextItems.find((item) => this._mediaRefsEquivalent(this._getQueueItemUri(item), playerUri, item?.media_item?.media_type || item?.media_type || "track"));
        }
        if (!playerMatch && playerTitle) {
          playerMatch = nextItems.find((item) => {
            const title = String(item?.media_item?.name || item?.media_title || item?.name || "").trim().toLowerCase();
            const artists = String(item?.media_artist || (item?.media_item?.artists || []).map((artist) => artist?.name).filter(Boolean).join(", ") || "").trim().toLowerCase();
            return title === playerTitle && (!playerArtist || artists.includes(playerArtist) || playerArtist.includes(artists));
          });
        }
        if (playerMatch) {
          const incomingTitle = String(normalizedState.current_item?.media_item?.name || normalizedState.current_item?.media_title || normalizedState.current_item?.name || "").trim().toLowerCase();
          const incomingUri = String(this._getQueueItemUri(normalizedState.current_item) || "").trim();
          const playerAligned = playerUri
            ? this._mediaRefsEquivalent(incomingUri, playerUri, normalizedState.current_item?.media_item?.media_type || normalizedState.current_item?.media_type || "track")
            : incomingTitle === playerTitle;
          if (!playerAligned) {
            const matchedIndex = Number(playerMatch.sort_index);
            normalizedState.current_item = playerMatch;
            if (Number.isFinite(matchedIndex)) {
              normalizedState.current_index = matchedIndex;
              normalizedState.next_item = nextItems.find((item) => Number(item?.sort_index) === matchedIndex + 1) || normalizedState.next_item || null;
            }
          }
        }
      }
      if (hasPendingPlay) {
        const incomingKey = this._getQueueItemKey(normalizedState.current_item);
        const incomingUri = this._getQueueItemUri(normalizedState.current_item);
        const incomingIndex = Number(normalizedState.current_index);
        const hasPendingPosition = !!pendingKey || Number.isFinite(pendingIndex);
        const matchesPending = (pendingKey && incomingKey === pendingKey)
          || (Number.isFinite(pendingIndex) && Number.isFinite(incomingIndex) && pendingIndex === incomingIndex)
          || (!hasPendingPosition && pendingUri && this._mediaRefsEquivalent(incomingUri, pendingUri, normalizedState.current_item?.media_item?.media_type || normalizedState.current_item?.media_type || "track"));
        if (!matchesPending && this._state.maQueueState?.current_item) {
          normalizedState.current_index = this._state.maQueueState.current_index;
          normalizedState.current_item = this._state.maQueueState.current_item;
          normalizedState.next_item = this._state.maQueueState.next_item;
          freezeQueueItemsForPendingPlay = true;
        } else if (matchesPending) {
          const playerCaughtUp = this._queueItemMatchesPlayer(normalizedState.current_item);
          if (playerCaughtUp) {
            Object.assign(this._state, HomeiiNowPlayingFoundation.clearPendingQueuePlayPatch());
          }
        }
      }
      this._state.maQueueState = normalizedState;
      if (!shouldConsiderReplace || !nextItems.length) return;
      if (freezeQueueItemsForPendingPlay) return;
      const existingItems = Array.isArray(this._state.queueItems) ? this._state.queueItems : [];
      const pendingMutationUntil = Number(this._state.queueMutationPendingUntil || 0);
      const pendingMutationSignature = String(this._state.queueMutationExpectedSignature || "");
      if (pendingMutationUntil > Date.now() && pendingMutationSignature) {
        const incomingSignature = this._queueOrderSignature(nextItems);
        if (incomingSignature !== pendingMutationSignature) return;
        this._state.queueMutationPendingUntil = 0;
        this._state.queueMutationExpectedSignature = "";
      }
      const totalItems = Number(queueState?.items);
      const looksPartial = Number.isFinite(totalItems) && totalItems > 0 && nextItems.length < Math.min(totalItems, 25);
      const existingLooksBetter = existingItems.length > nextItems.length && this._queueItemsContainCurrent(existingItems, normalizedState);
      if (looksPartial && existingLooksBetter) return;
      this._state.queueItems = nextItems;
      if (typeof this._prefetchQueueArtworkWindow === "function") {
        this._prefetchQueueArtworkWindow(nextItems, { immediate: false, before: 2, after: 14 });
      }
    }

    async _callMassQueueService(service, queueItemId) {
      const player = this._getSelectedPlayer();
      if (!player || !queueItemId || !this._hasMassQueueService(service)) return false;
      const itemId = String(queueItemId);
      const playerId = this._directMaPlayerId(player) || player.attributes?.mass_player_id || player.attributes?.player_id || player.entity_id;
      const queueId = player.attributes?.active_queue || player.attributes?.queue_id || this._state.maQueueState?.queue_id || this._directMaQueueId(player);
      const attempts = [
        { entity: player.entity_id, queue_item_id: itemId },
        { entity_id: player.entity_id, queue_item_id: itemId },
        { player_id: playerId, queue_item_id: itemId },
        { queue_id: queueId, queue_item_id: itemId },
        { entity: player.entity_id, item_id: itemId },
        { entity_id: player.entity_id, item_id: itemId },
        { player_id: playerId, item_id: itemId },
        { queue_id: queueId, item_id: itemId },
      ]
        .map((payload) => Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined && value !== null && value !== "")))
        .filter((payload, index, all) => all.findIndex((entry) => JSON.stringify(entry) === JSON.stringify(payload)) === index);
      for (const payload of attempts) {
        try {
          await this._hass.callService("mass_queue", service, payload);
          return true;
        } catch (_) {}
      }
      return false;
    }

    async _callMassQueueCommand(command, data = {}) {
      // Some mass_queue versions expose send_command but fail internally for MA queue
      // actions. Keep it opt-in so queue selection does not surface HA service errors.
      if (String(command || "").startsWith("player_queues/")) return false;
      if (this._config?.use_mass_queue_send_command !== true) return false;
      if (!command || !this._hasMassQueueService("send_command")) return false;
      const configEntryId = await this._ensureConfigEntryId();
      if (!configEntryId) return false;
      try {
        await this._hass.callService("mass_queue", "send_command", {
          config_entry_id: configEntryId,
          command,
          data,
        });
        return true;
      } catch (_) {
        return false;
      }
    }

    _queueIdForPlayer(player) {
      return String(
        player?.attributes?.active_queue
        || player?.attributes?.queue_id
        || this._state.maQueueState?.queue_id
        || this._directMaQueueId(player)
        || ""
      ).trim();
    }

    async _callDirectMaQueueAction(action, queueId, queueItemIdOrIndex, explicitPosShift = null) {
      if (!queueId || queueItemIdOrIndex === "" || queueItemIdOrIndex === null || queueItemIdOrIndex === undefined || !this._hasDirectMAConnection()) return false;
      if (action === "remove") {
        await this._callDirectMaCommand("player_queues/delete_item", {
          queue_id: queueId,
          item_id_or_index: queueItemIdOrIndex,
        });
        return true;
      }
      const posShiftByAction = {
        up: -1,
        down: 1,
        next: 0,
      };
      if (action === "move_to") {
        const posShift = Math.round(Number(explicitPosShift));
        if (!Number.isFinite(posShift)) return false;
        if (posShift === 0) return true;
        if (typeof queueItemIdOrIndex !== "string" || !queueItemIdOrIndex.trim()) return false;
        await this._callDirectMaCommand("player_queues/move_item", {
          queue_id: queueId,
          queue_item_id: queueItemIdOrIndex,
          pos_shift: posShift,
        });
        return true;
      }
      if (!(action in posShiftByAction) || typeof queueItemIdOrIndex !== "string" || !queueItemIdOrIndex.trim()) return false;
      await this._callDirectMaCommand("player_queues/move_item", {
        queue_id: queueId,
        queue_item_id: queueItemIdOrIndex,
        pos_shift: posShiftByAction[action],
      });
      return true;
    }

    _markMobileQueuePlayPending(item, playIndex) {
      const patch = HomeiiNowPlayingFoundation.buildPendingQueuePlayPatch({
        item,
        playIndex,
        selectedPlayerId: this._state.selectedPlayer || this._getSelectedPlayer()?.entity_id || "",
        accessors: {
          getQueueItemPlaybackId: (entry) => this._getQueueItemPlaybackId(entry),
          getQueueItemStableId: (entry) => this._getQueueItemStableId(entry),
          getQueueItemKey: (entry) => this._getQueueItemKey(entry),
          getQueueItemUri: (entry) => this._getQueueItemUri(entry),
        },
      });
      if (patch) Object.assign(this._state, patch);
    }

    _clearMobileQueuePlayPending() {
      Object.assign(this._state, HomeiiNowPlayingFoundation.clearPendingQueuePlayPatch());
    }

    _resolveQueuePlayIndex(queueItemId = "", fallbackUri = "", explicitSortIndex = "") {
      return HomeiiMediaQueueFoundation.resolveQueuePlayIndex(
        this._state.queueItems || [],
        { queueItemId, fallbackUri, explicitSortIndex },
        (uriA, uriB, fallbackType) => this._mediaRefsEquivalent(uriA, uriB, fallbackType),
      );
    }

    _getQueueItemByIndexOrKey(sortIndex = "", queueItemId = "", fallbackUri = "") {
      return HomeiiMediaQueueFoundation.getQueueItemByIndexOrKey(
        this._state.queueItems || [],
        { sortIndex, queueItemId, fallbackUri },
        (uriA, uriB, fallbackType) => this._mediaRefsEquivalent(uriA, uriB, fallbackType),
      );
    }

    async _playQueueItem(queueItemId, fallbackUri = "", mediaType = "track", sortIndex = "") {
      if ((!queueItemId && !fallbackUri) || this._state.queueActionPending) return false;
      this._setQueueBusy(true);
      try {
        const player = this._getSelectedPlayer();
        const playIndex = this._resolveQueuePlayIndex(queueItemId, fallbackUri, sortIndex);
        const currentContextBeforePlay = this._mobileArtStackContext();
        const currentSortIndexBeforePlay = Number(currentContextBeforePlay.queueItems?.[currentContextBeforePlay.baseIndex]?.sort_index);
        const currentForStepBeforePlay = Number.isFinite(currentSortIndexBeforePlay) ? currentSortIndexBeforePlay : currentContextBeforePlay.baseIndex;
        const optimisticItem = this._getQueueItemByIndexOrKey(playIndex, queueItemId, fallbackUri);
        if (optimisticItem && Number.isFinite(playIndex)) {
          const optimisticUntil = Date.now() + 8500;
          this._markMobileQueuePlayPending(optimisticItem, playIndex);
          this._state.maQueueState = {
            ...(this._state.maQueueState || {}),
            current_index: playIndex,
            current_item: optimisticItem,
            next_item: (this._state.queueItems || []).find((item) => Number(item?.sort_index) === playIndex + 1) || null,
            elapsed_time: 0,
            elapsed_time_last_updated: new Date().toISOString(),
          };
          this._state.mobileArtBrowseOffset = 0;
          if (typeof this._preloadPendingMobileQueueItemArtwork === "function") this._preloadPendingMobileQueueItemArtwork(optimisticItem);
          if (player?.entity_id) this._setPlayerPlaybackOptimistic(player.entity_id, { state: "playing", until: optimisticUntil });
          else this._syncNowPlayingUI();
        }
        const queueId = player?.attributes?.active_queue || player?.attributes?.queue_id || this._state.maQueueState?.queue_id || this._directMaQueueId(player);
        const queueItemPlaybackId = optimisticItem ? this._getQueueItemPlaybackId(optimisticItem) : "";
        const directPlayTarget = queueItemPlaybackId || (Number.isFinite(playIndex) ? playIndex : null);
        this._debugLog("info", "[Homeii Queue] play item", {
          queueId,
          queueItemId,
          fallbackUri,
          sortIndex,
          playIndex,
          directPlayTarget,
          title: optimisticItem ? this._queueItemPrimaryTitle(optimisticItem) : "",
        });
        if (queueId && directPlayTarget !== null && this._hasDirectMAConnection()) {
          try {
            await this._callDirectMaCommand("player_queues/play_index", { queue_id: queueId, index: directPlayTarget });
            this._refreshQueueAfterMutation(700).catch(() => {});
            this._refreshQueueAfterMutation(1450).catch(() => {});
            this._refreshQueueAfterMutation(2850).catch(() => {});
            return true;
          } catch (_) {
            // Keep falling through to Home Assistant service fallbacks.
          }
        }
        if (queueId && directPlayTarget !== null) {
          const usedMassCommand = await this._callMassQueueCommand("player_queues/play_index", { queue_id: queueId, index: directPlayTarget });
          if (usedMassCommand) {
            this._refreshQueueAfterMutation(700).catch(() => {});
            this._refreshQueueAfterMutation(1450).catch(() => {});
            this._refreshQueueAfterMutation(2850).catch(() => {});
            return true;
          }
        }
        const queueItemServiceId = optimisticItem ? (this._getQueueItemPlaybackId(optimisticItem) || this._getQueueItemStableId(optimisticItem)) : "";
        const usedMassQueue = queueItemServiceId ? await this._callMassQueueService("play_queue_item", queueItemServiceId) : false;
        if (usedMassQueue) {
          this._refreshQueueAfterMutation(700).catch(() => {});
          this._refreshQueueAfterMutation(1450).catch(() => {});
          this._refreshQueueAfterMutation(2850).catch(() => {});
          return true;
        }

        const stepDelta = Number.isFinite(playIndex) && Number.isFinite(currentForStepBeforePlay) ? playIndex - currentForStepBeforePlay : NaN;
        if (Number.isFinite(stepDelta) && stepDelta !== 0) {
          const stepped = await this._stepQueueByDelta(stepDelta);
          if (stepped) {
            this._refreshQueueAfterMutation(700).catch(() => {});
            this._refreshQueueAfterMutation(1450).catch(() => {});
            this._refreshQueueAfterMutation(2850).catch(() => {});
            return true;
          }
        }

        if (fallbackUri && !queueItemId && !Number.isFinite(playIndex)) {
          if (!player?.entity_id && !this._state.selectedPlayer) return false;
          await this._hass.callService("media_player", "play_media", {
            entity_id: player?.entity_id || this._state.selectedPlayer,
            media_content_id: fallbackUri,
            media_content_type: mediaType,
          });
          this._refreshQueueAfterMutation(900).catch(() => {});
          this._refreshQueueAfterMutation(2850).catch(() => {});
          return true;
        }
        if (optimisticItem) {
          this._clearMobileQueuePlayPending();
          this._ensureQueueSnapshot(true).catch(() => {});
        }
      } catch (e) {
        this._clearMobileQueuePlayPending();
        this._toast(e?.message || this._i18n("ui.queue_action_failed"));
        return false;
      } finally {
        this._setQueueBusy(false);
      }
      return false;
    }

    async _callService(service, data, options = {}) {
      const includeConfigEntryId = options.includeConfigEntryId !== false;
      let serviceData = { ...data };
      if (includeConfigEntryId) {
        const configEntryId = await this._ensureConfigEntryId();
        if (!configEntryId) {
          const error = new Error(this._musicAssistantSetupMessage());
          error.code = "HOMEII_MA_NOT_READY";
          throw error;
        }
        serviceData = { config_entry_id: configEntryId, ...serviceData };
      }
      const request = this._hass.connection.sendMessagePromise({
        type: "call_service",
        domain: "music_assistant",
        service,
        service_data: serviceData,
        return_response: true,
      });
      return this._withTimeout(request, this._musicAssistantTimeoutMs(), this._timeoutMessage(`Music Assistant ${service}`));
    }

    async _ensureConfigEntryId(force = false) {
      if (!this._hass) return "";
      const explicit = String(this._config?.config_entry_id || "").trim();
      if (explicit && !force) {
        this._resolvedConfigEntryId = explicit;
        return explicit;
      }
      if (this._resolvedConfigEntryId && !force) return this._resolvedConfigEntryId;
      try {
        const entries = await this._withTimeout(this._hass.connection.sendMessagePromise({
          type: "config_entries/get",
          domain: "music_assistant",
        }), this._musicAssistantTimeoutMs(), this._timeoutMessage("Music Assistant config lookup"));
        const list = Array.isArray(entries) ? entries : [];
        const preferred = list.find((entry) => entry?.state === "loaded")
          || list.find((entry) => entry?.state === "setup_retry")
          || list.find((entry) => entry?.state === "not_loaded")
          || list[0];
        this._resolvedConfigEntryId = preferred?.entry_id || "";
        if (!this._resolvedConfigEntryId || preferred?.state && preferred.state !== "loaded") {
          this._handleMusicAssistantIssue(preferred?.state ? `Music Assistant entry ${preferred.state}` : this._musicAssistantSetupMessage());
        }
        return this._resolvedConfigEntryId;
      } catch (error) {
        this._resolvedConfigEntryId = explicit || "";
        if (!explicit) this._handleMusicAssistantIssue(error);
        return this._resolvedConfigEntryId;
      }
    }

    _normalizeQueueItem(item, fallbackIndex = 0) {
      if (!item || typeof item !== "object") return null;
      const mediaItem = item.media_item || item.media || item.item || item;
      const flatArtist = String(item.media_artist || item.artist || "").trim();
      const artists = Array.isArray(mediaItem?.artists)
        ? mediaItem.artists
        : (Array.isArray(item.artists)
          ? item.artists
          : (flatArtist ? flatArtist.split(",").map((name) => ({ name: String(name).trim() })).filter((artist) => artist.name) : []));
      const flatAlbumName = String(item.media_album_name || item.album_name || "").trim();
      const album = mediaItem?.album || item.album || (flatAlbumName ? { name: flatAlbumName } : null);
      const flatImage = item.media_image
        || item.media_image_url
        || item.image_url
        || item.image
        || item.thumbnail
        || item.thumb
        || item.local_image_url
        || item.local_image
        || item.local_image_encoded
        || "";
      const resolvedImage = this._artUrl(item, { size: 420 })
        || this._artUrl(mediaItem, { size: 420 })
        || this._artUrl(album, { size: 420 })
        || this._imageUrl(flatImage, 420)
        || "";
      const sortIndex = Number(item.sort_index);
      const positionIndex = Number(item.position);
      const mediaUri = mediaItem?.uri || item.uri || item.media_content_id || item.media_id || "";
      const rawQueueItemId = String(item.queue_item_id || item.queueItemId || item.queue_item?.queue_item_id || item.queueItem?.queue_item_id || "").trim();
      const rawItemId = String(item.item_id || item.id || "").trim();
      const parsedMediaRef = HomeiiMediaQueueFoundation.parseMediaReference(mediaUri, mediaItem?.media_type || item.media_type || "track");
      const rawItemLooksLikeMediaId = !!(
        rawItemId
        && (
          rawItemId === mediaUri
          || rawItemId === parsedMediaRef.item_id
          || mediaUri.endsWith(`/${rawItemId}`)
          || mediaUri.endsWith(`:${rawItemId}`)
        )
      );
      const queueServiceId = rawQueueItemId || (rawItemId && !rawItemLooksLikeMediaId ? rawItemId : "");
      return {
        ...item,
        media_item: {
          ...mediaItem,
          uri: mediaUri || (rawItemLooksLikeMediaId ? rawItemId : ""),
          name: mediaItem?.name || item.name || item.media_title || "",
          artists,
          album,
        },
        image: resolvedImage || item.image || flatImage || mediaItem?.image || album?.image || null,
        image_url: resolvedImage || item.image_url || flatImage || mediaItem?.image_url || mediaItem?.image || album?.image_url || album?.image || null,
        sort_index: Number.isFinite(sortIndex) ? sortIndex : (Number.isFinite(positionIndex) ? positionIndex : fallbackIndex),
        queue_item_id: queueServiceId || rawItemId || mediaUri || String(fallbackIndex),
        queue_item_id_trusted: !!queueServiceId,
        queue_service_id: queueServiceId,
      };
    }

    _normalizeQueueSnapshot(raw, entityId = "") {
      let src = raw?.response ?? raw;
      if (!src || typeof src !== "object") return null;
      if (entityId && src[entityId] && typeof src[entityId] === "object") {
        src = src[entityId];
      } else if (!src.queue_state && !src.queue && !Array.isArray(src.items) && !src.current_item) {
        const firstEntry = Object.values(src).find((value) => value && typeof value === "object");
        if (firstEntry) src = firstEntry;
      }
      if (!src || typeof src !== "object") return null;

      const queueState = src.queue_state || src.queue || src;
      const previousItems = Array.isArray(src.previous_items)
        ? src.previous_items
        : (Array.isArray(queueState?.previous_items) ? queueState.previous_items : []);
      const currentItem = src.current_item || queueState?.current_item || null;
      const singleNextItem = src.next_item || queueState?.next_item || null;
      const nextItems = Array.isArray(src.next_items)
        ? src.next_items
        : (Array.isArray(queueState?.next_items) ? queueState.next_items : []);
      const combinedNextItems = [...nextItems, ...(singleNextItem ? [singleNextItem] : [])];

      let items = [];
      if (Array.isArray(src.items)) items = src.items;
      else if (Array.isArray(queueState?.items)) items = queueState.items;
      else if (Array.isArray(src.queue_items)) items = src.queue_items;
      else items = [...previousItems, ...(currentItem ? [currentItem] : []), ...combinedNextItems];

      const guessedCurrentIndex = Number.isFinite(queueState?.current_index)
        ? queueState.current_index
        : (Number.isFinite(src.current_index) ? src.current_index : previousItems.length);

      const baseSortIndex = Math.max(0, guessedCurrentIndex - previousItems.length);
      const normalizedItems = items
        .map((item, index) => this._normalizeQueueItem(item, baseSortIndex + index))
        .filter(Boolean)
        .map((item, index) => ({
          ...item,
          sort_index: Number.isFinite(item.sort_index) ? item.sort_index : (baseSortIndex + index),
        }));

      const totalItems = Number.isFinite(queueState?.items)
        ? queueState.items
        : (Number.isFinite(src.items_count) ? src.items_count : normalizedItems.length);

      return {
        state: {
          ...queueState,
          current_index: guessedCurrentIndex,
          items: totalItems,
        },
        items: normalizedItems,
      };
    }

    _guessCurrentQueueIndexFromItems(items = [], player = null) {
      if (!Array.isArray(items) || !items.length) return 0;
      const currentTitle = String(player?.attributes?.media_title || "").trim().toLowerCase();
      const currentArtist = String(player?.attributes?.media_artist || "").trim().toLowerCase();
      const idx = items.findIndex((item) => {
        const title = String(item?.media_item?.name || item?.name || "").trim().toLowerCase();
        const artist = String(item?.media_item?.artists?.map((a) => a.name).join(", ") || "").trim().toLowerCase();
        return (!!currentTitle && title === currentTitle) && (!currentArtist || !artist || artist.includes(currentArtist));
      });
      return idx >= 0 ? (items[idx]?.sort_index ?? idx) : (items[0]?.sort_index ?? 0);
    }

    async _fetchMassQueueItemsSnapshot(player) {
      if (!player || !this._hasMassQueueService("get_queue_items")) return null;
      try {
        const res = await this._hass.connection.sendMessagePromise({
          type: "call_service",
          domain: "mass_queue",
          service: "get_queue_items",
          service_data: {
            entity: player.entity_id,
            limit_before: 20,
            limit_after: 120,
          },
          return_response: true,
        });
        const raw = res?.response ?? res;
        let items = raw?.items ?? raw?.queue_items ?? raw;
        if (raw?.[player.entity_id]) {
          const scoped = raw[player.entity_id];
          items = scoped?.items ?? scoped?.queue_items ?? scoped;
        }
        if (!Array.isArray(items)) return null;
        const queueState = raw?.queue_state || raw?.queue || raw;
        const rawCurrentIndex = Number(queueState?.current_index ?? raw?.current_index);
        const currentTitle = String(player?.attributes?.media_title || "").trim().toLowerCase();
        const currentArtist = String(player?.attributes?.media_artist || "").trim().toLowerCase();
        const currentOffset = items.findIndex((item) => {
          const mediaItem = item?.media_item || item?.media || item?.item || item;
          const title = String(mediaItem?.name || item?.media_title || item?.name || "").trim().toLowerCase();
          const artist = String(item?.media_artist || (mediaItem?.artists || []).map((a) => a?.name).filter(Boolean).join(", ") || "").trim().toLowerCase();
          return !!currentTitle && title === currentTitle && (!currentArtist || !artist || artist.includes(currentArtist) || currentArtist.includes(artist));
        });
        const baseSortIndex = Number.isFinite(rawCurrentIndex) && currentOffset >= 0
          ? Math.max(0, rawCurrentIndex - currentOffset)
          : 0;
        const normalizedItems = items
          .map((item, index) => this._normalizeQueueItem(item, baseSortIndex + index))
          .filter(Boolean)
          .map((item, index) => ({
            ...item,
            sort_index: Number.isFinite(item.sort_index) ? item.sort_index : (baseSortIndex + index),
          }));
        if (!normalizedItems.length) return null;
        const guessedCurrentIndex = Number.isFinite(rawCurrentIndex)
          ? rawCurrentIndex
          : this._guessCurrentQueueIndexFromItems(normalizedItems, player);
        return {
          state: {
            ...queueState,
            current_index: guessedCurrentIndex,
            items: Number.isFinite(Number(queueState?.items)) ? Number(queueState.items) : normalizedItems.length,
          },
          items: normalizedItems,
        };
      } catch (_) {
        return null;
      }
    }

    async _fetchLibrary(mediaType, orderBy = "sort_name", limit = 500, favoritesOnly = false, search = "") {
      const data = { media_type: mediaType, order_by: orderBy, limit };
      if (favoritesOnly) data.favorite = true;
      if (search) data.search = search;
      try {
        const res = await this._callService("get_library", data);
        const raw = res?.response ?? res;
        this._state.musicAssistantIssueMessage = "";
        return raw?.items ?? (Array.isArray(raw) ? raw : []);
      } catch (error) {
        if (this._isMusicAssistantAvailabilityError(error)) {
          this._handleMusicAssistantIssue(error);
          return [];
        }
        throw error;
      }
    }

    async _getLibrary(mediaType, orderBy = "sort_name", limit = 500, favoritesOnly = false) {
      const key = `${mediaType}:${orderBy}:${limit}:${favoritesOnly}`;
      const ttl = Number(this._config.cache_ttl || 300000);
      const cached = this._cache.library.get(key);
      if (cached && Date.now() - cached.ts < ttl) return cached.items;
      let items;
      try {
        items = await this._fetchLibrary(mediaType, orderBy, limit, favoritesOnly);
      } catch (error) {
        if (this._isMusicAssistantAvailabilityError(error)) {
          this._handleMusicAssistantIssue(error);
          items = [];
        } else if (orderBy !== "sort_name") items = await this._fetchLibrary(mediaType, "sort_name", limit, favoritesOnly);
        else throw error;
      }
      this._cache.library.set(key, { ts: Date.now(), items });
      return items;
    }

    _mediaTypeCanOpenDetails(mediaType = "") {
      return ["album", "artist", "playlist"].includes(String(mediaType || "").toLowerCase());
    }

    _libraryDetailParentPageForType(mediaType = "") {
      const type = String(mediaType || "").toLowerCase();
      if (type === "album") return "library_albums";
      if (type === "artist") return "library_artists";
      if (type === "playlist") return "library_playlists";
      return "library_playlists";
    }

    _libraryDetailMediaType(detail = this._state?.mobileLibraryDetail || {}) {
      return String(detail?.media_type || detail?.type || "").toLowerCase();
    }

    _isArtistLibraryDetailPage(page = this._state?.menuPage || "") {
      return String(page || "") === "media_detail" && this._libraryDetailMediaType() === "artist";
    }

    _captureCurrentLibraryDetailForStack() {
      const current = this._state?.mobileLibraryDetail;
      if (!current || typeof current !== "object") return null;
      const scrollSnapshot = this._captureMobileMenuScroll?.("media_detail") || current._homeiiScrollSnapshot || null;
      return {
        ...current,
        _homeiiParentPage: this._state.mobileLibraryDetailParentPage || "",
        _homeiiScrollSnapshot: scrollSnapshot,
      };
    }

    _pushCurrentLibraryDetailStack() {
      const current = this._captureCurrentLibraryDetailForStack();
      if (!current) return;
      const stack = Array.isArray(this._state.mobileLibraryDetailStack) ? this._state.mobileLibraryDetailStack.slice() : [];
      stack.push(current);
      this._state.mobileLibraryDetailStack = stack.slice(-8);
    }

    _clearLibraryDetailStack() {
      this._state.mobileLibraryDetailStack = [];
    }

    _findAlbumBrowseIndex(albums = [], entry = {}) {
      const entryUri = String(entry?.uri || entry?.media_item?.uri || "").trim().toLowerCase();
      const entryName = HomeiiMediaQueueFoundation.normalizeComparableText(entry?.name || entry?.title || entry?.media_item?.name || "");
      const entryYear = this._mediaYearValue(entry) || "";
      const uriIndex = entryUri
        ? albums.findIndex((album) => String(album?.uri || album?.media_item?.uri || "").trim().toLowerCase() === entryUri)
        : -1;
      if (uriIndex >= 0) return uriIndex;
      return albums.findIndex((album) => {
        const albumName = HomeiiMediaQueueFoundation.normalizeComparableText(album?.name || album?.title || album?.media_item?.name || "");
        const albumYear = this._mediaYearValue(album) || "";
        return albumName && albumName === entryName && (!entryYear || !albumYear || entryYear === albumYear);
      });
    }

    _albumBrowseContextFromDetail(detail = {}, entry = {}) {
      if (this._libraryDetailMediaType(detail) !== "artist") return null;
      const albums = Array.isArray(detail?.albums) ? detail.albums.filter(Boolean) : [];
      if (!albums.length) return null;
      const index = this._findAlbumBrowseIndex(albums, entry);
      const artistInfo = detail.artistInfo || detail;
      return {
        source: "artist",
        artistName: artistInfo?.name || detail?.name || "",
        artistUri: artistInfo?.uri || detail?.uri || "",
        albums,
        index: index >= 0 ? index : 0,
      };
    }

    _albumBrowseState(detail = {}) {
      const context = detail?.albumBrowseContext || null;
      const albums = Array.isArray(context?.albums) ? context.albums.filter(Boolean) : [];
      if (!albums.length) return null;
      let index = Number(context?.index);
      if (!Number.isInteger(index) || index < 0 || index >= albums.length) {
        index = this._findAlbumBrowseIndex(albums, detail);
      }
      if (!Number.isInteger(index) || index < 0) index = 0;
      return {
        ...context,
        albums,
        index,
        total: albums.length,
        canPrev: index > 0,
        canNext: index < albums.length - 1,
      };
    }

    _libraryMediaDetailCommandArgs(entry = {}, mediaType = "album") {
      return this._libraryMediaDetailCommandArgsList(entry, mediaType)[0] || null;
    }

    _libraryMediaDetailCommandArgsList(entry = {}, mediaType = "album") {
      const type = String(mediaType || entry?.media_type || entry?.type || "album").toLowerCase();
      const mediaItem = entry?.media_item || {};
      const mapping = this._searchItemProviderMapping(entry);
      const uri = String(entry?.uri || mediaItem?.uri || "").trim();
      const parsed = this._parseMediaReference(uri, type);
      const mappings = []
        .concat(Array.isArray(entry?.provider_mappings) ? entry.provider_mappings : [])
        .concat(Array.isArray(mediaItem?.provider_mappings) ? mediaItem.provider_mappings : [])
        .concat(mapping && typeof mapping === "object" ? [mapping] : []);
      const candidates = [];
      const add = (itemIdValue, providerValue) => {
        const itemId = String(itemIdValue || "").trim();
        const provider = String(providerValue || "").trim();
        if (!itemId || !provider) return;
        const key = `${provider}::${itemId}`.toLowerCase();
        if (candidates.some((candidate) => candidate.key === key)) return;
        candidates.push({ key, item_id: itemId, provider });
      };
      add(entry?.item_id || entry?.id || mediaItem?.item_id || mediaItem?.id, entry?.provider_instance || mediaItem?.provider_instance || entry?.provider_domain || mediaItem?.provider_domain || entry?.provider || mediaItem?.provider);
      add(entry?.item_id || entry?.id || mediaItem?.item_id || mediaItem?.id, "library");
      add(parsed?.item_id, parsed?.provider);
      add(parsed?.item_id, "library");
      add(mapping?.item_id || mapping?.provider_item_id, mapping?.provider_instance || mapping?.provider_domain || mapping?.provider || mapping?.provider_id);
      mappings.forEach((mapping) => {
        const itemId = mapping?.item_id || mapping?.provider_item_id || mapping?.media_item?.item_id || "";
        const mappedRef = this._parseMediaReference(mapping?.uri || mapping?.media_item?.uri || "", type);
        add(itemId, mapping?.provider_instance);
        add(itemId, mapping?.provider_domain);
        add(itemId, mapping?.provider);
        add(itemId, mapping?.provider_id);
        add(mappedRef?.item_id, mappedRef?.provider);
        add(mappedRef?.item_id, mapping?.provider_instance || mapping?.provider_domain || mapping?.provider || mapping?.provider_id);
      });
      return candidates.map(({ item_id, provider }) => ({ item_id, provider }));
    }

    _normalizeLibraryDetailTrack(raw = {}, forceTrack = false) {
      if (!raw || typeof raw !== "object") return null;
      const mediaItem = raw.media_item || raw.item || raw;
      if (!mediaItem || typeof mediaItem !== "object") return null;
      const rawType = String(
        mediaItem.media_type
        || mediaItem.type
        || mediaItem.media_content_type
        || mediaItem.media_class
        || raw.media_type
        || raw.type
        || raw.media_content_type
        || raw.media_class
        || ""
      ).toLowerCase();
      if (rawType && !["track", "song", "music", "album_track", "albumtrack"].includes(rawType)) return null;
      if (!forceTrack && !rawType && !mediaItem.uri && !mediaItem.media_content_id && !mediaItem.item_id) return null;
      const normalized = this._normalizeSearchItem(mediaItem, "track");
      const uri = String(normalized?.uri || mediaItem.uri || mediaItem.media_content_id || raw.uri || raw.media_content_id || "").trim();
      const name = normalized?.name || mediaItem.name || mediaItem.title || raw.name || raw.title || raw.media_title || "";
      if (!uri && !name) return null;
      const artists = Array.isArray(normalized?.artists)
        ? normalized.artists
        : (Array.isArray(mediaItem.artists) ? mediaItem.artists : (Array.isArray(raw.artists) ? raw.artists : []));
      const artistStr = normalized?.artist_str
        || mediaItem.artist_str
        || mediaItem.artist
        || raw.artist_str
        || raw.artist
        || raw.media_artist
        || artists.map((artist) => artist?.name || artist).filter(Boolean).join(", ");
      const albumValue = normalized?.album || mediaItem.album || raw.album || {};
      const album = typeof albumValue === "string" ? { name: albumValue } : albumValue;
      const image = this._artUrl(normalized) || this._artUrl(mediaItem) || this._artUrl(raw) || "";
      return {
        ...normalized,
        media_type: "track",
        uri,
        name,
        artists,
        artist_str: artistStr,
        album,
        image: normalized?.image || normalized?.image_url || mediaItem.image || mediaItem.image_url || mediaItem.thumbnail || raw.image || raw.image_url || raw.thumbnail || image,
        image_url: normalized?.image_url || normalized?.image || mediaItem.image_url || mediaItem.image || mediaItem.thumbnail || raw.image_url || raw.image || raw.thumbnail || image,
      };
    }

    _libraryMediaDetailTracksFromPayload(payload, options = {}) {
      const tracks = [];
      const seen = new Set();
      const addTrack = (raw, forceTrack = false) => {
        const track = this._normalizeLibraryDetailTrack(raw, forceTrack);
        if (!track) return false;
        const key = String(track.uri || `${track.name}:${track.artist_str || ""}`).trim().toLowerCase();
        if (!key || seen.has(key)) return true;
        seen.add(key);
        tracks.push(track);
        return true;
      };
      const collect = (value, forceTrack = false, depth = 0) => {
        if (value === null || value === undefined || depth > 5) return;
        if (Array.isArray(value)) {
          value.forEach((item) => {
            if (!addTrack(item, forceTrack)) collect(item, forceTrack, depth + 1);
          });
          return;
        }
        if (typeof value !== "object") return;
        if (addTrack(value, forceTrack)) return;
        ["tracks", "playlist_tracks", "album_tracks", "items", "media_items", "children", "contents", "result", "response"].forEach((key) => {
          if (!(key in value)) return;
          collect(value[key], forceTrack || key.includes("track"), depth + 1);
        });
      };
      collect(payload?.result ?? payload?.response ?? payload, !!options.forceTrackItems, 0);
      return tracks;
    }

    _sortLibraryDetailTracks(tracks = []) {
      return (Array.isArray(tracks) ? [...tracks] : []).sort((left, right) => {
        const leftDisc = Number(left?.disc_number ?? left?.discNumber ?? left?.media_item?.disc_number ?? 0);
        const rightDisc = Number(right?.disc_number ?? right?.discNumber ?? right?.media_item?.disc_number ?? 0);
        if (Number.isFinite(leftDisc) && Number.isFinite(rightDisc) && leftDisc !== rightDisc) return leftDisc - rightDisc;
        const leftTrack = Number(left?.track_number ?? left?.trackNumber ?? left?.media_item?.track_number ?? left?.sort_index ?? 0);
        const rightTrack = Number(right?.track_number ?? right?.trackNumber ?? right?.media_item?.track_number ?? right?.sort_index ?? 0);
        if (Number.isFinite(leftTrack) && Number.isFinite(rightTrack) && leftTrack !== rightTrack) return leftTrack - rightTrack;
        return String(left?.name || "").localeCompare(String(right?.name || ""), this._isHebrew() ? "he" : "en", { sensitivity: "base", numeric: true });
      });
    }

    _libraryTrackMatchesAlbum(track = {}, entry = {}) {
      const albumName = HomeiiMediaQueueFoundation.normalizeComparableText(entry?.name || entry?.title || "");
      if (!albumName) return true;
      const albumValue = track?.album || track?.media_item?.album || {};
      const trackAlbumName = HomeiiMediaQueueFoundation.normalizeComparableText(
        typeof albumValue === "string" ? albumValue : (albumValue?.name || track?.album_name || track?.media_album_name || "")
      );
      if (!trackAlbumName) return false;
      if (trackAlbumName === albumName) return true;
      return albumName.length >= 5 && (trackAlbumName.includes(albumName) || albumName.includes(trackAlbumName));
    }

    _libraryTrackMatchesArtist(track = {}, entry = {}) {
      const artistName = HomeiiMediaQueueFoundation.normalizeComparableText(entry?.artist || entry?.artist_str || this._artistName(entry) || "");
      if (!artistName) return true;
      const artists = [
        this._artistName(track),
        track?.artist,
        track?.artist_str,
        track?.media_artist,
        ...(Array.isArray(track?.artists) ? track.artists.map((artist) => artist?.name || artist) : []),
        ...(Array.isArray(track?.media_item?.artists) ? track.media_item.artists.map((artist) => artist?.name || artist) : []),
      ];
      return artists.some((artist) => {
        const normalized = HomeiiMediaQueueFoundation.normalizeComparableText(artist);
        return normalized && (normalized === artistName || normalized.includes(artistName) || artistName.includes(normalized));
      });
    }

    async _loadLibraryMediaDetailTracksViaLibrarySearch(entry = {}) {
      const queries = [
        entry?.name,
        [entry?.artist || entry?.artist_str || this._artistName(entry), entry?.name].filter(Boolean).join(" "),
      ].map((query) => String(query || "").trim()).filter(Boolean);
      const uniqueQueries = [...new Set(queries)];
      const collected = [];
      for (const query of uniqueQueries) {
        try {
          const rawTracks = await this._fetchLibrary("track", "sort_name", 1000, false, query);
          collected.push(...(Array.isArray(rawTracks) ? rawTracks : []));
        } catch (_) {}
      }
      const tracks = collected
        .map((item) => this._normalizeLibraryDetailTrack(item, true))
        .filter((track) => track?.uri && this._libraryTrackMatchesAlbum(track, entry) && this._libraryTrackMatchesArtist(track, entry));
      return this._sortLibraryDetailTracks(tracks);
    }

    _libraryMediaItemsFromPayload(payload, fallbackType = "album") {
      const mediaType = String(fallbackType || "album").toLowerCase();
      const items = [];
      const seen = new Set();
      const addItem = (raw) => {
        if (!raw || typeof raw !== "object") return false;
        const mediaItem = raw.media_item || raw.item || raw;
        if (!mediaItem || typeof mediaItem !== "object") return false;
        const rawType = String(
          mediaItem.media_type
          || mediaItem.type
          || mediaItem.media_content_type
          || mediaItem.media_class
          || raw.media_type
          || raw.type
          || raw.media_content_type
          || raw.media_class
          || ""
        ).toLowerCase();
        if (rawType && rawType !== mediaType) return false;
        const normalized = this._normalizeSearchItem(mediaItem, mediaType);
        const resolvedType = String(normalized?.media_type || mediaType).toLowerCase();
        if (resolvedType !== mediaType) return false;
        const uri = String(normalized?.uri || mediaItem.uri || mediaItem.media_content_id || raw.uri || raw.media_content_id || "").trim();
        const name = String(normalized?.name || normalized?.title || mediaItem.name || mediaItem.title || raw.name || raw.title || "").trim();
        if (!uri && !name) return false;
        const key = String(uri || `${name}:${normalized?.provider || mediaItem.provider || ""}`).toLowerCase();
        if (seen.has(key)) return true;
        seen.add(key);
        items.push({
          ...normalized,
          media_type: mediaType,
          uri,
          name,
          image: normalized?.image || normalized?.image_url || mediaItem.image || mediaItem.image_url || raw.image || raw.image_url || "",
          image_url: normalized?.image_url || normalized?.image || mediaItem.image_url || mediaItem.image || raw.image_url || raw.image || "",
        });
        return true;
      };
      const collect = (value, forceItems = false, depth = 0) => {
        if (value === null || value === undefined || depth > 5) return;
        if (Array.isArray(value)) {
          value.forEach((item) => {
            if (!addItem(item)) collect(item, forceItems, depth + 1);
          });
          return;
        }
        if (typeof value !== "object") return;
        if (forceItems && addItem(value)) return;
        const keys = mediaType === "album"
          ? ["albums", "album", "items", "media_items", "children", "contents", "result", "response"]
          : ["playlists", "playlist", "items", "media_items", "children", "contents", "result", "response"];
        keys.forEach((key) => {
          if (key in value) collect(value[key], ["albums", "album", "playlists", "playlist", "items", "media_items"].includes(key), depth + 1);
        });
      };
      collect(payload?.result ?? payload?.response ?? payload, false, 0);
      return items;
    }

    _mediaYearValue(item = {}) {
      const metadata = item?.metadata || item?.media_item?.metadata || {};
      const album = item?.album || item?.media_item?.album || {};
      const candidates = [
        item.year,
        item.release_year,
        item.releaseYear,
        item.date,
        item.release_date,
        item.original_date,
        album.year,
        album.release_year,
        album.release_date,
        metadata.year,
        metadata.release_year,
        metadata.releaseYear,
        metadata.release_date,
        metadata.original_date,
      ];
      for (const candidate of candidates) {
        const text = String(candidate ?? "").trim();
        const match = text.match(/\b(19|20)\d{2}\b/);
        const year = match ? Number(match[0]) : Number(candidate);
        if (Number.isInteger(year) && year >= 1900 && year <= 2100) return year;
      }
      return 0;
    }

    _mediaDateLabel(item = {}) {
      const metadata = item?.metadata || item?.media_item?.metadata || {};
      const album = item?.album || item?.media_item?.album || {};
      const candidates = [
        item.release_date,
        item.original_date,
        item.date,
        item.year,
        item.release_year,
        album.release_date,
        album.original_date,
        album.date,
        album.year,
        metadata.release_date,
        metadata.original_date,
        metadata.date,
        metadata.year,
      ];
      for (const candidate of candidates) {
        const text = String(candidate ?? "").trim();
        if (!text) continue;
        const dateMatch = text.match(/\b(19|20)\d{2}[-/.]\d{1,2}[-/.]\d{1,2}\b/);
        if (dateMatch) return dateMatch[0].replace(/[/.]/g, "-");
        const yearMatch = text.match(/\b(19|20)\d{2}\b/);
        if (yearMatch) return yearMatch[0];
      }
      return "";
    }

    _albumKindLabel(item = {}) {
      const metadata = item?.metadata || item?.media_item?.metadata || {};
      const name = HomeiiMediaQueueFoundation.normalizeComparableText(item?.name || item?.title || item?.media_item?.name || "");
      const rawValues = [
        item.album_type,
        item.albumType,
        item.release_type,
        item.releaseType,
        item.type,
        metadata.album_type,
        metadata.release_type,
        metadata.type,
        metadata.musicbrainz_albumtype,
        ...(Array.isArray(metadata.release_group_types) ? metadata.release_group_types : []),
      ].map((value) => HomeiiMediaQueueFoundation.normalizeComparableText(value)).filter(Boolean);
      const haystack = `${rawValues.join(" ")} ${name}`;
      if (/(^| )(single|סינגל)( |$)/.test(haystack)) return this._m("Single", "סינגל");
      if (/(^| )(live|concert|הופעה|חיה)( |$)/.test(haystack)) return this._m("Live", "הופעה חיה");
      if (/(^| )(ep|mini album|מיני)( |$)/.test(haystack)) return "EP";
      return this._m("Studio", "אולפן");
    }

    _albumSelectLabel(album = {}, index = 0) {
      const date = this._mediaDateLabel(album);
      const kind = this._albumKindLabel(album);
      const name = String(album?.name || album?.title || album?.media_item?.name || this._i18n("ui.album")).trim();
      return [date, name, kind].filter(Boolean).join(" · ") || `${index + 1}. ${this._i18n("ui.album")}`;
    }

    _artistDescriptionText(item = {}) {
      const metadata = item?.metadata || item?.media_item?.metadata || {};
      const readText = (value) => {
        if (!value) return "";
        if (typeof value === "string") return value.trim();
        if (typeof value !== "object") return "";
        return String(value.he || value.en || value.text || value.description || value.summary || "").trim();
      };
      const candidates = [
        item.description,
        item.biography,
        item.bio,
        item.summary,
        metadata.description,
        metadata.biography,
        metadata.bio,
        metadata.summary,
        metadata.review,
        metadata.wikipedia,
        metadata.wiki,
      ];
      for (const candidate of candidates) {
        const text = readText(candidate);
        if (text) return text;
      }
      return "";
    }

    _artistAlbumMatches(album = {}, artistName = "") {
      const target = HomeiiMediaQueueFoundation.normalizeComparableText(artistName);
      if (!target) return true;
      const artistValues = [
        this._artistName(album),
        album.artist,
        album.artist_str,
        album.album_artist,
        album.albumArtist,
        ...(Array.isArray(album.artists) ? album.artists.map((artist) => artist?.name || artist) : []),
        ...(Array.isArray(album.album_artists) ? album.album_artists.map((artist) => artist?.name || artist) : []),
        ...(Array.isArray(album.media_item?.artists) ? album.media_item.artists.map((artist) => artist?.name || artist) : []),
        ...(Array.isArray(album.media_item?.album_artists) ? album.media_item.album_artists.map((artist) => artist?.name || artist) : []),
      ];
      return artistValues.some((value) => {
        const normalized = HomeiiMediaQueueFoundation.normalizeComparableText(value);
        return normalized && (normalized === target || normalized.includes(target) || target.includes(normalized));
      });
    }

    _normalizeArtistAlbumCandidate(item = {}, artistName = "") {
      if (!item) return null;
      const mediaItem = item?.media_item || item?.item || item;
      const albumSource = mediaItem?.album && typeof mediaItem.album === "object"
        ? mediaItem.album
        : (item?.album && typeof item.album === "object" ? item.album : mediaItem);
        const albumValue = typeof mediaItem?.album === "string"
          ? mediaItem.album
          : (typeof item?.album === "string" ? item.album : "");
        const normalized = this._normalizeSearchItem(albumValue ? { name: albumValue, media_type: "album" } : albumSource, "album");
      if (!normalized || typeof normalized !== "object") return null;
      const name = String(normalized.name || normalized.title || albumSource?.name || albumSource?.title || albumValue || "").trim();
      const uri = String(normalized.uri || albumSource?.uri || item?.uri || "").trim();
      if (!uri && !name) return null;
      const image = this._artUrl(normalized, { size: 300 })
        || this._artUrl(albumSource, { size: 300 })
        || this._artUrl(item, { size: 300 })
        || normalized.image
        || normalized.image_url
        || albumSource?.image
        || albumSource?.image_url
        || "";
      return {
        ...normalized,
        media_type: "album",
        uri,
        name,
        artist: normalized.artist || normalized.artist_str || this._artistName(item) || item?.artist || item?.artist_str || artistName || "",
        artist_str: normalized.artist_str || normalized.artist || this._artistName(item) || item?.artist_str || item?.artist || artistName || "",
        image: normalized.image || normalized.image_url || image,
        image_url: normalized.image_url || normalized.image || image,
      };
    }

    _dedupeArtistAlbums(albums = []) {
      const byUri = new Set();
      const byIdentity = new Map();
      const titleKeyForAlbum = (album = {}) => {
        const name = HomeiiMediaQueueFoundation.normalizeComparableText(album?.name || album?.title || album?.media_item?.name || "");
        if (!name) return "";
        const year = this._mediaYearValue(album) || "";
        return year ? `${name}::${year}` : name;
      };
      const identityForAlbum = (album = {}) => {
        const titleKey = titleKeyForAlbum(album);
        const name = titleKey.split("::")[0] || "";
        if (!name) return "";
        const year = this._mediaYearValue(album) || "";
        const artist = HomeiiMediaQueueFoundation.normalizeComparableText(this._artistName(album) || album?.artist_str || album?.artist || "");
        return [name, year, artist].filter((part) => part !== "").join("::");
      };
      const scoreAlbum = (album = {}) => {
        let score = 0;
        if (album.uri) score += 4;
        if (this._mediaYearValue(album)) score += 2;
        if (this._artUrl(album) || album.image || album.image_url) score += 2;
        if (album.provider_instance === "library" || album.provider === "library") score += 3;
        if (Array.isArray(album.provider_mappings) && album.provider_mappings.length) score += album.provider_mappings.length;
        return score;
      };
      const deduped = [];
      (Array.isArray(albums) ? albums : []).forEach((album) => {
        const uri = String(album?.uri || album?.media_item?.uri || "").trim().toLowerCase();
        const identity = identityForAlbum(album);
        const titleKey = titleKeyForAlbum(album);
        if (uri && byUri.has(uri)) return;
        const existingIndex = identity && byIdentity.has(identity)
          ? byIdentity.get(identity)
          : (titleKey && byIdentity.has(`title:${titleKey}`) ? byIdentity.get(`title:${titleKey}`) : -1);
        if (existingIndex >= 0) {
          if (scoreAlbum(album) > scoreAlbum(deduped[existingIndex])) {
            deduped[existingIndex] = album;
            if (uri) byUri.add(uri);
          }
          return;
        }
        if (!uri && !identity && !titleKey) return;
        const index = deduped.length;
        if (uri) byUri.add(uri);
        if (identity) byIdentity.set(identity, index);
        if (titleKey) byIdentity.set(`title:${titleKey}`, index);
        deduped.push(album);
      });
      return deduped;
    }

    _artistAlbumsFromTracksPayload(payload, artistName = "") {
      const tracks = this._libraryMediaDetailTracksFromPayload(payload, { forceTrackItems: true });
      const albums = tracks
        .map((track) => {
          const album = track?.album;
          return this._normalizeArtistAlbumCandidate(album && typeof album === "object" ? { ...album, media_type: "album" } : track, artistName);
        })
        .filter(Boolean);
      return this._dedupeArtistAlbums(albums);
    }

    async _loadArtistPlaylistRecommendations(artistName = "") {
      const name = String(artistName || "").trim();
      if (!name) return [];
      const normalizedArtist = HomeiiMediaQueueFoundation.normalizeComparableText(name);
      const seen = new Set();
      const playlists = [];
      const addPlaylist = (item = {}) => {
        const normalized = this._normalizeSearchItem(item, "playlist");
        const uri = String(normalized?.uri || "").trim();
        const title = String(normalized?.name || normalized?.title || "").trim();
        if (!uri && !title) return;
        const key = String(uri || title).toLowerCase();
        if (seen.has(key)) return;
        const haystack = HomeiiMediaQueueFoundation.normalizeComparableText([
          title,
          normalized?.description,
          normalized?.metadata?.description,
          normalized?.provider_label,
          normalized?.provider,
        ].filter(Boolean).join(" "));
        seen.add(key);
        playlists.push({
          ...normalized,
          media_type: "playlist",
          _homeiiArtistPlaylistScore: haystack.includes(normalizedArtist) ? 4 : 1,
        });
      };
      for (const query of [`${name} playlist`, `${name} playlists`, name]) {
        try {
          const results = await this._search(query);
          (results.playlists || []).forEach(addPlaylist);
        } catch (_) {}
        if (playlists.length >= 12) break;
      }
      return playlists
        .sort((a, b) => Number(b._homeiiArtistPlaylistScore || 0) - Number(a._homeiiArtistPlaylistScore || 0))
        .slice(0, 12)
        .map(({ _homeiiArtistPlaylistScore, ...item }) => item);
    }

    async _loadLibraryMediaDetailTracksViaHaBrowse(entry = {}) {
      const player = this._getSelectedPlayer();
      const entityId = this._selectedPlayerMoreInfoEntityId?.(player) || player?.entity_id || this._state.selectedPlayer || "";
      const uri = String(entry?.uri || "").trim();
      if (!this._hass?.connection || !entityId || !uri || this._isDirectMaEntityId?.(entityId)) return [];
      const raw = await this._hass.connection.sendMessagePromise({
        type: "media_player/browse_media",
        entity_id: entityId,
        media_content_id: uri,
        media_content_type: entry.media_type || entry.type || "album",
      });
      return this._libraryMediaDetailTracksFromPayload(raw, { forceTrackItems: false });
    }

    async _loadLibraryMediaDetailTracks(entry = {}) {
      const type = String(entry?.media_type || entry?.type || "album").toLowerCase();
      const uri = String(entry?.uri || "").trim();
      const cacheKey = `media-detail:${type}:${uri}`;
      const ttl = Number(this._config.cache_ttl || 300000);
      const cached = this._cache.library.get(cacheKey);
      if (cached && Date.now() - cached.ts < ttl) return cached.items;
      const attempts = [];
      const commandArgsList = this._libraryMediaDetailCommandArgsList(entry, type);
      if (commandArgsList.length) {
        if (type === "album") {
          commandArgsList.forEach((commandArgs) => {
            attempts.push({
              command: "music/albums/album_tracks",
              args: { item_id: commandArgs.item_id, provider_instance_id_or_domain: commandArgs.provider, in_library_only: false },
              forceTrackItems: true,
            });
            attempts.push({
              command: "music/albums/album_tracks",
              args: { item_id: commandArgs.item_id, provider_instance_or_domain: commandArgs.provider, in_library_only: false },
              forceTrackItems: true,
            });
          });
        } else if (type === "playlist") {
          commandArgsList.forEach((commandArgs) => {
            attempts.push({
              command: "music/playlists/playlist_tracks",
              args: { item_id: commandArgs.item_id, provider_instance_or_domain: commandArgs.provider, force_refresh: false },
              forceTrackItems: true,
            });
            attempts.push({
              command: "music/playlists/playlist_tracks",
              args: { item_id: commandArgs.item_id, provider_instance_id_or_domain: commandArgs.provider, force_refresh: false },
              forceTrackItems: true,
            });
          });
        }
      }
      if (uri) attempts.push({ command: "music/item_by_uri", args: { uri }, forceTrackItems: false });
      let lastError = null;
      let bestTracks = [];
      for (const attempt of attempts) {
        try {
          const raw = await this._callDirectMaCommand(attempt.command, attempt.args);
          const tracks = this._sortLibraryDetailTracks(this._libraryMediaDetailTracksFromPayload(raw, { forceTrackItems: attempt.forceTrackItems }));
          if (tracks.length > bestTracks.length) bestTracks = tracks;
          if (tracks.length > 1 && attempt.command.includes("album_tracks")) break;
        } catch (error) {
          lastError = error;
        }
      }
      if (bestTracks.length > 1 || (bestTracks.length && type !== "album")) {
        this._cache.library.set(cacheKey, { ts: Date.now(), items: bestTracks });
        return bestTracks;
      }
      try {
        const tracks = await this._loadLibraryMediaDetailTracksViaHaBrowse(entry);
        const sortedTracks = this._sortLibraryDetailTracks(tracks);
        if (sortedTracks.length > bestTracks.length) bestTracks = sortedTracks;
      } catch (_) {}
      if (type === "album" && entry?.name) {
        try {
          const tracks = await this._loadLibraryMediaDetailTracksViaLibrarySearch(entry);
          if (tracks.length > bestTracks.length) bestTracks = tracks;
        } catch (_) {}
      }
      if (bestTracks.length) {
        this._cache.library.set(cacheKey, { ts: Date.now(), items: bestTracks });
        return bestTracks;
      }
      if (lastError && !attempts.length) throw lastError;
      this._cache.library.set(cacheKey, { ts: Date.now(), items: [] });
      return [];
    }

    async _loadLibraryArtistDetail(entry = {}) {
      const uri = String(entry?.uri || "").trim();
      const artistName = String(entry?.name || this._artistName(entry) || "").trim();
      const cacheKey = `artist-detail:${uri || artistName.toLowerCase()}`;
      const ttl = Number(this._config.cache_ttl || 300000);
      const cached = this._cache.library.get(cacheKey);
      if (cached && Date.now() - cached.ts < ttl && cached.detail) return cached.detail;
      let artistInfo = { ...entry, media_type: "artist", uri };
      let rawArtistPayload = null;
      if (uri) {
        try {
          const rawArtist = await this._callDirectMaCommand("music/item_by_uri", { uri });
          rawArtistPayload = rawArtist;
          const rawItem = rawArtist?.media_item || rawArtist?.item || rawArtist;
          if (rawItem && typeof rawItem === "object") {
            artistInfo = {
              ...artistInfo,
              ...this._normalizeSearchItem(rawItem, "artist"),
              media_type: "artist",
              uri: String(rawItem.uri || uri).trim() || uri,
            };
          }
        } catch (_) {}
      }
      const name = String(artistInfo?.name || artistName || "").trim();
      const commandArgsList = [];
      const addCommandArgs = (args) => {
        if (!args?.item_id || !args?.provider) return;
        const key = `${args.provider}::${args.item_id}`.toLowerCase();
        if (commandArgsList.some((candidate) => candidate.key === key)) return;
        commandArgsList.push({ key, item_id: args.item_id, provider: args.provider });
      };
      this._libraryMediaDetailCommandArgsList(artistInfo, "artist").forEach(addCommandArgs);
      this._libraryMediaDetailCommandArgsList(entry, "artist").forEach(addCommandArgs);
      const attempts = [];
      commandArgsList.forEach((commandArgs) => {
        attempts.push({
          command: "music/artists/artist_albums",
          args: { item_id: commandArgs.item_id, provider_instance_id_or_domain: commandArgs.provider, in_library_only: false },
          type: "albums",
        });
        attempts.push({
          command: "music/artists/artist_albums",
          args: { item_id: commandArgs.item_id, provider_instance_or_domain: commandArgs.provider, in_library_only: false },
          type: "albums",
        });
        attempts.push({
          command: "music/artists/artist_tracks",
          args: { item_id: commandArgs.item_id, provider_instance_id_or_domain: commandArgs.provider, in_library_only: false },
          type: "tracks",
        });
        attempts.push({
          command: "music/artists/artist_tracks",
          args: { item_id: commandArgs.item_id, provider_instance_or_domain: commandArgs.provider, in_library_only: false },
          type: "tracks",
        });
      });
      let albums = [];
      const addAlbums = (items = [], { trusted = false } = {}) => {
        const normalized = (Array.isArray(items) ? items : [])
          .map((item) => this._normalizeArtistAlbumCandidate(item, name))
          .filter((album) => album?.uri || album?.name)
          .filter((album) => trusted || this._artistAlbumMatches(album, name));
        if (!normalized.length) return;
        albums = this._dedupeArtistAlbums([...albums, ...normalized]);
      };
      if (rawArtistPayload) {
        addAlbums(this._libraryMediaItemsFromPayload(rawArtistPayload, "album"), { trusted: true });
      }
      for (const attempt of attempts) {
        try {
          const raw = await this._callDirectMaCommand(attempt.command, attempt.args);
          const attemptAlbums = attempt.type === "tracks"
            ? this._artistAlbumsFromTracksPayload(raw, name)
            : this._libraryMediaItemsFromPayload(raw, "album");
          addAlbums(attemptAlbums, { trusted: true });
        } catch (_) {}
      }
      if (name) {
        try {
          const searchResults = await this._search(name);
          const searchAlbums = (Array.isArray(searchResults?.albums) ? searchResults.albums : [])
            .map((item) => this._normalizeArtistAlbumCandidate(item, name))
            .filter(Boolean);
          const artistMatches = searchAlbums.filter((album) => this._artistAlbumMatches(album, name));
          addAlbums(artistMatches.length ? artistMatches : searchAlbums.slice(0, 60), { trusted: !artistMatches.length });
        } catch (_) {}
      }
      if (name) {
        const libraryAlbumQueries = [
          ["artist_name", 2000, ""],
          ["sort_name", 1000, name],
          ["artist_name", 1000, name],
        ];
        for (const [orderBy, limit, search] of libraryAlbumQueries) {
          try {
            const rawAlbums = await this._fetchLibrary("album", orderBy, limit, false, search);
            addAlbums(rawAlbums);
          } catch (_) {}
        }
      }
      albums = this._dedupeArtistAlbums(albums)
        .map((album) => ({ ...album, media_type: "album" }))
        .sort((left, right) => {
          const leftYear = this._mediaYearValue(left);
          const rightYear = this._mediaYearValue(right);
          if (leftYear !== rightYear) return rightYear - leftYear;
          return String(left?.name || "").localeCompare(String(right?.name || ""), this._isHebrew() ? "he" : "en", { sensitivity: "base", numeric: true });
        });
      const playlists = await this._loadArtistPlaylistRecommendations(name);
      const detail = { artistInfo, albums, playlists };
      this._cache.library.set(cacheKey, { ts: Date.now(), detail });
      return detail;
    }

    _openLibraryMediaDetail(entry = {}, sourceEl = null, options = {}) {
      const mediaType = String(entry?.media_type || entry?.type || "album").toLowerCase();
      const uri = String(entry?.uri || "").trim();
      if (!uri || !this._mediaTypeCanOpenDetails(mediaType)) return false;
      if (sourceEl) this._flashInteraction(sourceEl);
      const token = `${mediaType}:${uri}:${Date.now()}`;
      const previousDetail = this._state.menuPage === "media_detail" ? this._state.mobileLibraryDetail : null;
      const replaceCurrentDetail = options?.replaceCurrentDetail === true;
      const shouldStackCurrent = !!(
        previousDetail
        && !replaceCurrentDetail
        && previousDetail.token
        && String(previousDetail.uri || "") !== uri
      );
      if (shouldStackCurrent) this._pushCurrentLibraryDetailStack();
      else if (!previousDetail) this._clearLibraryDetailStack();
      const albumBrowseContext = options?.albumBrowseContext
        || (mediaType === "album" ? this._albumBrowseContextFromDetail(previousDetail, entry) : null);
      const parentPage = String(this._state.menuPage || "").startsWith("library_")
        ? this._state.menuPage
        : this._libraryDetailParentPageForType(mediaType);
      this._state.mobileLibraryDetailParentPage = parentPage;
      this._state.mobileLibraryDetail = {
        ...entry,
        uri,
        media_type: mediaType,
        name: entry.name || "",
        artist: entry.artist || "",
        album: entry.album || "",
        image: entry.image || entry.image_url || "",
        tracks: [],
        albums: [],
        playlists: [],
        artistInfo: null,
        artistSearchQuery: "",
        artistDescriptionExpanded: !!entry.artistDescriptionExpanded,
        albumBrowseContext: albumBrowseContext || null,
        loading: true,
        error: "",
        token,
      };
      if (this._state.menuPage === "media_detail") this._renderMobileMenu().catch(() => {});
      else this._pushMobileMenu("media_detail");
      if (mediaType === "artist") {
        this._loadLibraryArtistDetail(this._state.mobileLibraryDetail)
          .then((artistDetail) => {
            const current = this._state.mobileLibraryDetail;
            if (!current || current.token !== token) return;
            current.artistInfo = artistDetail?.artistInfo || null;
            current.albums = Array.isArray(artistDetail?.albums) ? artistDetail.albums : [];
            current.playlists = Array.isArray(artistDetail?.playlists) ? artistDetail.playlists : [];
            current.loading = false;
            current.error = current.albums.length
              ? ""
              : this._m("No albums were returned for this artist.", "לא נטענו אלבומים לאמן הזה.");
            if (this._state.menuOpen && this._state.menuPage === "media_detail") this._renderMobileMenu().catch(() => {});
          })
          .catch((error) => {
            const current = this._state.mobileLibraryDetail;
            if (!current || current.token !== token) return;
            current.albums = [];
            current.playlists = [];
            current.loading = false;
            current.error = error?.message || this._m("Could not load this artist.", "לא הצלחתי לטעון את האמן.");
            if (this._state.menuOpen && this._state.menuPage === "media_detail") this._renderMobileMenu().catch(() => {});
          });
        return true;
      }
      this._loadLibraryMediaDetailTracks(this._state.mobileLibraryDetail)
        .then((tracks) => {
          const current = this._state.mobileLibraryDetail;
          if (!current || current.token !== token) return;
          current.tracks = tracks;
          current.loading = false;
          current.error = tracks.length ? "" : this._m("No tracks were returned. You can still play it.", "לא נטענו שירים. עדיין אפשר לנגן.");
          if (this._state.menuOpen && this._state.menuPage === "media_detail") this._renderMobileMenu().catch(() => {});
        })
        .catch((error) => {
          const current = this._state.mobileLibraryDetail;
          if (!current || current.token !== token) return;
          current.tracks = [];
          current.loading = false;
          current.error = error?.message || this._m("Could not load tracks. You can still play it.", "לא הצלחתי לטעון שירים. עדיין אפשר לנגן.");
          if (this._state.menuOpen && this._state.menuPage === "media_detail") this._renderMobileMenu().catch(() => {});
        });
      return true;
    }

    async _openLibraryAdjacentAlbum(direction = 0, sourceEl = null) {
      const current = this._state.mobileLibraryDetail || {};
      if (this._libraryDetailMediaType(current) !== "album") return false;
      const browse = this._albumBrowseState(current);
      const step = Number(direction) < 0 ? -1 : 1;
      const nextIndex = Number(browse?.index ?? -1) + step;
      return this._openLibraryBrowseAlbumAtIndex(nextIndex, sourceEl);
    }

    async _openLibraryBrowseAlbumAtIndex(index = 0, sourceEl = null) {
      const current = this._state.mobileLibraryDetail || {};
      if (this._libraryDetailMediaType(current) !== "album") return false;
      const browse = this._albumBrowseState(current);
      const nextIndex = Number(index);
      if (!browse || nextIndex < 0 || nextIndex >= browse.total) return false;
      const nextAlbum = browse.albums[nextIndex];
      if (!nextAlbum) return false;
      const opened = this._openLibraryMediaDetail({ ...nextAlbum, media_type: "album" }, sourceEl, {
        replaceCurrentDetail: true,
        albumBrowseContext: {
          ...browse,
          index: nextIndex,
        },
      });
      if (!opened) return false;
      await Promise.resolve();
      return true;
    }

    _radioBrowserCountryOptions() {
      const language = this._language?.() || this._state.lang || this._config?.language || "en";
      const base = getRadioBrowserCountrySelectorOptions(
        (key, params = {}, fallback = "") => this._i18n(key, params, fallback),
        language,
      ).map((option) => [option.value, option.label]);
      const current = this._mobileRadioBrowserCountry();
      if (current !== "all" && !base.some(([code]) => code === current)) {
        base.push([current, homeiiRadioBrowserCountryLabel(current, (key) => this._i18n(key), language)]);
      }
      return base;
    }

    _mobileRadioBrowserCountry() {
      const value = String(this._state.mobileRadioBrowserCountry || "all").trim().toUpperCase();
      return value && value !== "ALL" ? value : "all";
    }

    _radioBrowserCountryLabel(code = "") {
      const normalized = String(code || "").trim().toUpperCase();
      if (!normalized || normalized === "ALL") return this._i18n("ui.all_countries");
      const found = this._radioBrowserCountryOptions().find(([value]) => value === normalized);
      return found?.[1] || this._state.mobileRadioBrowseCountryName || normalized;
    }

    async _fetchRadioBrowserCountries(limit = 260) {
      const safeLimit = Math.max(20, Math.min(400, Number(limit) || 260));
      const key = "radio-browser:countries";
      const ttl = Number(this._config.cache_ttl || 300000);
      const cached = this._cache.library.get(key);
      if (cached && Date.now() - cached.ts < ttl) return cached.items;
      const res = await fetch("https://de1.api.radio-browser.info/json/countries", {
        headers: { "Accept": "application/json" },
      });
      if (!res.ok) throw new Error(`Radio Browser countries ${res.status}`);
      const raw = await res.json();
      const countries = (Array.isArray(raw) ? raw : [])
        .map((country) => ({
          code: String(country.iso_3166_1 || country.countrycode || "").trim().toUpperCase(),
          name: country.name || country.country || "",
          stationcount: Number(country.stationcount || 0) || 0,
        }))
        .filter((country) => country.code && country.name && country.stationcount > 0)
        .sort((a, b) => a.name.localeCompare(b.name))
        .slice(0, safeLimit);
      this._cache.library.set(key, { ts: Date.now(), items: countries });
      return countries;
    }

    async _fetchRadioBrowserStations(query = "", limit = 40, options = {}) {
      const safeLimit = Math.max(8, Math.min(80, Number(limit) || 40));
      const q = String(query || "").trim();
      const countryCode = String(options.countryCode || "").trim().toUpperCase();
      const hasCountry = countryCode && countryCode !== "ALL";
      let endpoint;
      if (q) {
        const params = new URLSearchParams({
          hidebroken: "true",
          limit: String(safeLimit),
          name: q,
        });
        if (hasCountry) params.set("countrycode", countryCode);
        endpoint = `https://de1.api.radio-browser.info/json/stations/search?${params.toString()}`;
      } else if (hasCountry) {
        endpoint = `https://de1.api.radio-browser.info/json/stations/bycountrycodeexact/${encodeURIComponent(countryCode)}?hidebroken=true&limit=${safeLimit}&order=votes&reverse=true`;
      } else {
        endpoint = `https://de1.api.radio-browser.info/json/stations/topvote/${safeLimit}`;
      }
      const res = await fetch(endpoint, {
        headers: {
          "Accept": "application/json",
        },
      });
      if (!res.ok) throw new Error(`Radio Browser ${res.status}`);
      const raw = await res.json();
      return (Array.isArray(raw) ? raw : []).map((station) => ({
        uri: station.url_resolved || station.url || "",
        media_type: "radio",
        name: station.name || station.stationuuid || "Radio Browser",
        image: station.favicon || "",
        image_url: station.favicon || "",
        metadata: {
          description: [station.country, station.tags].filter(Boolean).join(" · "),
        },
        artist_str: station.country || "Radio Browser",
        radio_browser_id: station.stationuuid || "",
        radio_browser: true,
        radio_browser_country: station.countrycode || station.country || "",
      })).filter((item) => item.uri);
    }

    _currentRadioIdentity() {
      const player = this._getSelectedPlayer();
      const queueItem = this._state.maQueueState?.current_item || {};
      const media = queueItem.media_item || queueItem || {};
      const uri = media.uri || queueItem.media_content_id || player?.attributes?.media_content_id || "";
      const name = media.name || queueItem.name || queueItem.media_title || player?.attributes?.media_title || "";
      const mediaType = String(media.media_type || queueItem.media_type || player?.attributes?.media_content_type || "").toLowerCase();
      return { uri: String(uri || ""), name: String(name || ""), mediaType };
    }

    _isLikelyRadioPlayback(player, queueItem = null, media = null) {
      const currentQueueItem = queueItem || this._state.maQueueState?.current_item || {};
      const currentMedia = media || currentQueueItem?.media_item || currentQueueItem || {};
      const mediaType = String(
        currentMedia?.media_type
        || currentQueueItem?.media_type
        || player?.attributes?.media_content_type
        || player?.attributes?.media_channel
        || ""
      ).toLowerCase();
      if (mediaType === "radio") return true;
      const haystack = [
        currentMedia?.uri,
        currentQueueItem?.uri,
        currentQueueItem?.media_content_id,
        player?.attributes?.media_content_id,
        player?.attributes?.media_channel,
        currentMedia?.provider,
        currentMedia?.provider_id,
        currentMedia?.provider_domain,
        currentQueueItem?.provider,
        currentQueueItem?.provider_id,
        currentMedia?.radio_browser_id,
        currentQueueItem?.radio_browser_id,
        currentMedia?.stationuuid,
        currentQueueItem?.stationuuid,
        currentMedia?.metadata?.radio_browser_id,
        currentQueueItem?.metadata?.radio_browser_id,
        currentMedia?.metadata?.stationuuid,
        currentQueueItem?.metadata?.stationuuid,
        currentMedia?.metadata?.stream_url,
        currentQueueItem?.metadata?.stream_url,
      ]
        .map((value) => String(value || "").toLowerCase())
        .filter(Boolean)
        .join(" | ");
      if (/(radiobrowser|radio_browser|stationuuid|tunein|streamurl|stream url|icy|webradio)/.test(haystack)) return true;
      if (["track", "song", "album", "playlist", "artist"].includes(mediaType)) return false;
      return /(^|[/:._-])radio([/:._-]|$)/.test(haystack);
    }

    async _playAdjacentRadioStation(direction = "next") {
      const current = this._currentRadioIdentity();
      if (current.mediaType && current.mediaType !== "radio") return false;
      const country = this._mobileRadioBrowserCountry();
      let stations = [];
      try {
        const maStations = await this._getLibrary("radio", "sort_name", 250);
        const browserStations = await this._fetchRadioBrowserStations("", 80, { countryCode: country === "all" ? "all" : country });
        stations = [...(maStations || []), ...(browserStations || [])]
          .filter((station) => station?.uri)
          .filter((station, index, arr) => arr.findIndex((candidate) => candidate.uri === station.uri) === index);
      } catch (_) {
        try { stations = await this._getLibrary("radio", "sort_name", 250); } catch (__) { stations = []; }
      }
      if (!stations.length) return false;
      const currentUri = current.uri.toLowerCase();
      const currentName = current.name.toLowerCase();
      let index = stations.findIndex((station) => String(station.uri || "").toLowerCase() === currentUri);
      if (index < 0 && currentName) {
        index = stations.findIndex((station) => String(station.name || "").toLowerCase() === currentName);
      }
      const fallbackIndex = direction === "next" ? -1 : 0;
      const base = index >= 0 ? index : fallbackIndex;
      const nextIndex = direction === "next"
        ? (base + 1) % stations.length
        : (base - 1 + stations.length) % stations.length;
      const next = stations[nextIndex];
      if (!next?.uri) return false;
      await this._playMedia(next.uri, "radio", "play", { label: next.name || "Radio", silent: true });
      this._toastSuccess(this._i18n("ui.radio_station_changed"));
      return true;
    }

    _searchItemProviderMapping(item = {}) {
      const mappings = []
        .concat(Array.isArray(item?.provider_mappings) ? item.provider_mappings : [])
        .concat(Array.isArray(item?.media_item?.provider_mappings) ? item.media_item.provider_mappings : []);
      return mappings.find((mapping) => mapping?.uri || mapping?.item_id || mapping?.provider_instance || mapping?.provider_domain || mapping?.provider)
        || {};
    }

    _searchItemUri(item = {}, fallbackType = "track") {
      const directUri = String(item?.uri || item?.media_item?.uri || item?.media_id || "").trim();
      if (directUri) return directUri;
      const mapping = this._searchItemProviderMapping(item);
      const mappingUri = String(mapping?.uri || mapping?.media_item?.uri || "").trim();
      if (mappingUri) return mappingUri;
      const itemId = String(item?.item_id || item?.id || mapping?.item_id || mapping?.provider_item_id || "").trim();
      const provider = String(
        item?.provider
        || item?.provider_domain
        || item?.provider_instance
        || item?.provider_id
        || mapping?.provider_domain
        || mapping?.provider_instance
        || mapping?.provider
        || mapping?.provider_id
        || ""
      ).trim();
      const mediaType = String(item?.media_type || item?.type || item?.media_item?.media_type || fallbackType || "track").toLowerCase();
      return provider && itemId ? `${provider}://${mediaType}/${itemId}` : "";
    }

    _normalizeSearchItem(item = {}, fallbackType = "track") {
      if (!item || typeof item !== "object") return item;
      const mapping = this._searchItemProviderMapping(item);
      const mediaType = String(item.media_type || item.type || item.media_item?.media_type || fallbackType || "track").toLowerCase();
      const uri = this._searchItemUri(item, mediaType);
      const provider = String(
        item.provider
        || item.provider_instance
        || item.provider_domain
        || item.provider_id
        || mapping.provider_instance
        || mapping.provider_domain
        || mapping.provider
        || mapping.provider_id
        || ""
      ).trim();
      return {
        ...item,
        media_type: mediaType,
        uri: uri || item.uri || "",
        provider: item.provider || provider,
        provider_instance: item.provider_instance || mapping.provider_instance || "",
        provider_domain: item.provider_domain || mapping.provider_domain || "",
        provider_id: item.provider_id || mapping.provider_id || "",
      };
    }

    _normalizeSearchResponse(raw) {
      const out = { radio: [], podcasts: [], albums: [], artists: [], tracks: [], playlists: [], genres: [] };
      if (!raw) return out;
      const readGroup = (value) => Array.isArray(value) ? value : (value?.items && Array.isArray(value.items) ? value.items : []);
      const groupForItem = (item = {}) => {
        const type = String(item?.media_type || item?.type || item?.item_type || item?.media_item?.media_type || "").toLowerCase();
        if (type === "radio") return "radio";
        if (type === "podcast") return "podcasts";
        if (type === "album") return "albums";
        if (type === "artist") return "artists";
        if (type === "track") return "tracks";
        if (type === "playlist") return "playlists";
        if (type === "genre") return "genres";
        return "";
      };
      const addFlatItems = (items = []) => {
        (Array.isArray(items) ? items : []).forEach((item) => {
          const group = groupForItem(item);
          if (group) out[group].push(this._normalizeSearchItem(item, group === "podcasts" ? "podcast" : group.replace(/s$/, "")));
        });
      };
      const addGroupedItems = (source = {}) => {
        out.radio.push(...readGroup(source.radio || source.radios).map((item) => this._normalizeSearchItem(item, "radio")));
        out.podcasts.push(...readGroup(source.podcast || source.podcasts).map((item) => this._normalizeSearchItem(item, "podcast")));
        out.albums.push(...readGroup(source.album || source.albums).map((item) => this._normalizeSearchItem(item, "album")));
        out.artists.push(...readGroup(source.artist || source.artists).map((item) => this._normalizeSearchItem(item, "artist")));
        out.tracks.push(...readGroup(source.track || source.tracks).map((item) => this._normalizeSearchItem(item, "track")));
        out.playlists.push(...readGroup(source.playlist || source.playlists).map((item) => this._normalizeSearchItem(item, "playlist")));
        out.genres.push(...readGroup(source.genre || source.genres).map((item) => this._normalizeSearchItem(item, "genre")));
      };
      const src = raw.response ?? raw.result ?? raw;
      const sources = [src];
      if (src?.response) sources.push(src.response);
      if (src?.result) sources.push(src.result);
      if (src && typeof src === "object" && !Array.isArray(src)) {
        Object.values(src).forEach((value) => {
          if (!value || typeof value !== "object" || Array.isArray(value)) return;
          const nested = value.response ?? value.result ?? value;
          if (nested && typeof nested === "object") sources.push(nested);
        });
      }
      sources.forEach((source) => {
        addGroupedItems(source);
        addFlatItems(Array.isArray(source) ? source : []);
        addFlatItems(source?.items);
        addFlatItems(source?.results);
      });
      return out;
    }

    _emptySearchResults() {
      return { radio: [], podcasts: [], albums: [], artists: [], tracks: [], playlists: [], genres: [] };
    }

    _hasSearchResults(results = {}) {
      return Object.entries(results || {}).some(([group, arr]) => group !== "genres" && Array.isArray(arr) && arr.length);
    }

    _mergeSearchResults(...sets) {
      const out = this._emptySearchResults();
      const groups = ["radio", "podcasts", "albums", "artists", "tracks", "playlists", "genres"];
      const seen = new Set();
      sets.forEach((results) => {
        groups.forEach((group) => {
          const items = Array.isArray(results?.[group]) ? results[group] : [];
          items.forEach((item) => {
            const uri = String(item?.uri || item?.media_item?.uri || "").trim();
            const name = String(item?.name || item?.title || item?.media_item?.name || "").trim().toLowerCase();
            const provider = String(item?.provider || item?.provider_id || item?.provider_domain || item?.media_item?.provider || "").trim().toLowerCase();
            const key = `${group}:${uri || `${provider}:${name}`}`;
            if (!key || seen.has(key)) return;
            seen.add(key);
            out[group].push(item);
          });
        });
      });
      return out;
    }

    _cachedLibrarySearchResults(query = "", limit = 8) {
      const q = String(query || "").trim().toLowerCase();
      const out = this._emptySearchResults();
      if (!q || !this._cache?.library) return out;
      const typeMap = {
        radio: "radio",
        podcast: "podcasts",
        album: "albums",
        artist: "artists",
        track: "tracks",
        playlist: "playlists",
        genre: "genres",
      };
      const seen = new Set();
      const scoreItem = (item, mediaType) => {
        const title = String(item?.name || item?.title || item?.media_item?.name || "").toLowerCase();
        const artist = String(this._artistName?.(item) || item?.artist || item?.artist_str || "").toLowerCase();
        const album = String(item?.album?.name || item?.media_item?.album?.name || "").toLowerCase();
        const haystack = [title, artist, album, item?.metadata?.description, item?.description].filter(Boolean).join(" ").toLowerCase();
        if (!haystack.includes(q)) return 0;
        let score = 1;
        if (title.startsWith(q)) score += 6;
        if (title === q) score += 4;
        if (artist.startsWith(q)) score += 3;
        if (mediaType === "track") score += 1;
        return score;
      };
      for (const [key, cached] of this._cache.library.entries()) {
        const mediaType = String(key || "").split(":")[0];
        const group = typeMap[mediaType];
        if (!group || !Array.isArray(cached?.items)) continue;
        cached.items.forEach((item) => {
          const uri = String(item?.uri || item?.media_item?.uri || "").trim();
          const stableKey = `${group}:${uri || item?.item_id || item?.name || ""}`;
          if (!stableKey || seen.has(stableKey)) return;
          const score = scoreItem(item, mediaType);
          if (!score) return;
          seen.add(stableKey);
          out[group].push({ ...item, media_type: item?.media_type || mediaType, _homeiiSearchScore: score });
        });
      }
      Object.keys(out).forEach((group) => {
        out[group] = out[group]
          .sort((a, b) => (Number(b._homeiiSearchScore || 0) - Number(a._homeiiSearchScore || 0)))
          .slice(0, limit)
          .map(({ _homeiiSearchScore, ...item }) => item);
      });
      return out;
    }

    async _searchPreviewResults(query = "", limit = 8) {
      const q = String(query || "").trim();
      const cached = this._cachedLibrarySearchResults(q, limit);
      if (this._hasSearchResults(cached)) return cached;
      if (!q) return this._emptySearchResults();
      const previewLimit = Math.max(4, Math.min(20, Number(limit || 8) || 8));
      const [radioRes, podcastRes, albumRes, artistRes, trackRes, playlistRes] = await Promise.allSettled([
        this._fetchLibrary("radio", "sort_name", previewLimit, false, q),
        this._fetchLibrary("podcast", "sort_name", previewLimit, false, q),
        this._fetchLibrary("album", "sort_name", previewLimit, false, q),
        this._fetchLibrary("artist", "sort_name", previewLimit, false, q),
        this._fetchLibrary("track", "sort_name", previewLimit, false, q),
        this._fetchLibrary("playlist", "sort_name", previewLimit, false, q),
      ]);
      return {
        radio: radioRes.status === "fulfilled" ? radioRes.value : [],
        podcasts: podcastRes.status === "fulfilled" ? podcastRes.value : [],
        albums: albumRes.status === "fulfilled" ? albumRes.value : [],
        artists: artistRes.status === "fulfilled" ? artistRes.value : [],
        tracks: trackRes.status === "fulfilled" ? trackRes.value : [],
        playlists: playlistRes.status === "fulfilled" ? playlistRes.value : [],
      };
    }

    async _search(query) {
      const q = String(query || "").trim();
      if (!q) return this._emptySearchResults();
      let globalResults = this._emptySearchResults();
      try {
        const raw = await this._callService("search", { query: q, limit: 25 });
        globalResults = this._normalizeSearchResponse(raw);
      } catch (_) {
        try {
          const raw2 = await this._callService("search", { name: q, limit: 25, media_type: ["radio", "podcast", "album", "artist", "track", "playlist", "genre"] });
          globalResults = this._normalizeSearchResponse(raw2);
        } catch (_) {}
      }
      if (!this._hasSearchResults(globalResults)) {
        try {
          const raw3 = await this._callService("search", { name: q, limit: 25 });
          globalResults = this._normalizeSearchResponse(raw3);
        } catch (_) {}
      }
      if (this._hasSearchResults(globalResults)) return globalResults;
      const [radioRes, podcastRes, albumRes, artistRes, trackRes, playlistRes] = await Promise.allSettled([
        this._fetchLibrary("radio", "sort_name", 50, false, q),
        this._fetchLibrary("podcast", "sort_name", 50, false, q),
        this._fetchLibrary("album", "sort_name", 50, false, q),
        this._fetchLibrary("artist", "sort_name", 50, false, q),
        this._fetchLibrary("track", "sort_name", 50, false, q),
        this._fetchLibrary("playlist", "sort_name", 50, false, q),
      ]);
      return {
        radio: radioRes.status === "fulfilled" ? radioRes.value : [],
        podcasts: podcastRes.status === "fulfilled" ? podcastRes.value : [],
        albums: albumRes.status === "fulfilled" ? albumRes.value : [],
        artists: artistRes.status === "fulfilled" ? artistRes.value : [],
        tracks: trackRes.status === "fulfilled" ? trackRes.value : [],
        playlists: playlistRes.status === "fulfilled" ? playlistRes.value : [],
      };
    }

    _rejectWsPending(error = new Error("MA WS disconnected")) {
      this._wsPending.forEach((pending) => {
        if (pending?.timer) clearTimeout(pending.timer);
        try { pending.reject(error); } catch (_) {}
      });
      this._wsPending.clear();
    }

    _scheduleMaReconnect(delay = 8000) {
      clearTimeout(this._maReconnectTimer);
      this._maReconnectTimer = setTimeout(() => {
        this._maReconnectTimer = null;
        if (this.isConnected && this._hasRealtimeDirectMA()) this._connectMA();
      }, Math.max(500, Number(delay) || 8000));
    }

    _connectMA() {
      clearTimeout(this._maReconnectTimer);
      this._maReconnectTimer = null;
      if (!this._hasRealtimeDirectMA()) {
        this._rejectWsPending(new Error("MA WS disabled"));
        this._state.wsReady = false;
        this._syncStatus();
        return;
      }
      if (this._ws) {
        this._rejectWsPending(new Error("MA WS reconnecting"));
        try {
          this._ws.onclose = null;
          this._ws.close();
        } catch (_) {}
        this._ws = null;
      }
      const maUrl = this._maBrowserUrl();
      try {
        this._assertMaBrowserUrlSecure(maUrl);
      } catch (error) {
        this._state.wsReady = false;
        this._syncStatus();
        this._handleMusicAssistantIssue(error?.message || this._maMixedContentMessage());
        this._notifyCardIssue("ma-mixed-content", error?.message || this._maMixedContentMessage(), "error", 45000);
        return;
      }
      if (!maUrl) {
        this._state.wsReady = false;
        this._syncStatus();
        return;
      }
      const wsUrl = maUrl.replace(/^http:\/\//, "ws://").replace(/^https:\/\//, "wss://") + "/ws";
      try {
        const ws = new WebSocket(wsUrl);
        this._ws = ws;
        this._state.wsReady = false;
        this._syncStatus();
        ws.onmessage = (e) => {
          let msg;
          try { msg = JSON.parse(e.data); } catch (_) { return; }
          if (msg.server_version && !msg.message_id) {
            try {
              ws.send(JSON.stringify({ message_id: "auth", command: "auth", args: { token: this._maToken } }));
            } catch (_) {
              try { ws.close(); } catch (_) {}
            }
            return;
          }
          const messageId = String(msg.message_id ?? "");
          if (messageId === "auth") {
            this._state.wsReady = !!msg.result?.authenticated;
            this._syncStatus();
            if (this._state.wsReady) {
              this._refreshDirectMaPlayers({ renderMenu: true }).catch(() => {});
            }
            return;
          }
          const pending = this._wsPending.get(messageId);
          if (pending) {
            this._wsPending.delete(messageId);
            if (pending.timer) clearTimeout(pending.timer);
            if (msg.error_code) pending.reject(new Error(msg.details || `MA error ${msg.error_code}`));
            else pending.resolve(msg.result);
          }
        };
        ws.onerror = () => { this._state.wsReady = false; this._syncStatus(); };
        ws.onclose = () => {
          if (this._ws === ws) this._ws = null;
          this._rejectWsPending(new Error("MA WS closed"));
          this._state.wsReady = false;
          this._syncStatus();
          this._scheduleMaReconnect(8000);
        };
      } catch (_) {
        this._rejectWsPending(new Error("MA WS connection failed"));
        this._state.wsReady = false;
        this._syncStatus();
        this._scheduleMaReconnect(8000);
      }
    }

    _wsSend(command, args = {}) {
      return new Promise((resolve, reject) => {
        if (!this._ws || !this._state.wsReady) return reject(new Error("MA WS not ready"));
        const id = String(++this._wsMsgId);
        const timer = setTimeout(() => {
          if (this._wsPending.has(id)) {
            this._wsPending.delete(id);
            reject(new Error("MA WS timeout"));
          }
        }, 10000);
        this._wsPending.set(id, { resolve, reject, timer });
        try {
          this._ws.send(JSON.stringify({ message_id: id, command, args }));
        } catch (error) {
          clearTimeout(timer);
          this._wsPending.delete(id);
          reject(error);
        }
      });
    }

    async _callDirectMaCommand(command, args = {}) {
      if (this._state.wsReady && this._ws) {
        return this._wsSend(command, args);
      }
      const maUrl = this._maBrowserUrl();
      if (!maUrl) {
        throw new Error("Direct Music Assistant API is not configured");
      }
      this._assertMaBrowserUrlSecure(maUrl);
      const headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
      };
      if (this._maToken) headers.Authorization = `Bearer ${this._maToken}`;
      const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
      const timeout = controller ? setTimeout(() => controller.abort(), 12000) : null;
      let response;
      try {
        response = await fetch(`${maUrl}/api`, {
          method: "POST",
          credentials: "include",
          mode: "cors",
          headers,
          signal: controller?.signal,
          body: JSON.stringify({
            message_id: `rest_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            command,
            args,
          }),
        });
      } finally {
        if (timeout) clearTimeout(timeout);
      }
      const rawText = await response.text().catch(() => "");
      let raw = {};
      try {
        raw = rawText ? JSON.parse(rawText) : {};
      } catch (_) {
        raw = { error: rawText || `${command} failed` };
      }
      if (!response.ok || raw?.error_code) {
        throw new Error(raw?.details || raw?.error || `${command} failed`);
      }
      return raw?.result ?? raw;
    }

    async _callHaServiceRaw(domain, service, serviceData = {}, returnResponse = false) {
      const request = this._hass.connection.sendMessagePromise({
        type: "call_service",
        domain,
        service,
        service_data: { ...serviceData },
        return_response: !!returnResponse,
      });
      return this._withTimeout(request, this._musicAssistantTimeoutMs(), this._timeoutMessage(`${domain}.${service}`));
    }

    async _callHaServiceTargeted(domain, service, serviceData = {}, target = {}, returnResponse = false) {
      const payload = {
        type: "call_service",
        domain,
        service,
        service_data: { ...serviceData },
        return_response: !!returnResponse,
      };
      if (target && typeof target === "object" && Object.keys(target).length) {
        payload.target = { ...target };
      }
      return this._withTimeout(
        this._hass.connection.sendMessagePromise(payload),
        this._musicAssistantTimeoutMs(),
        this._timeoutMessage(`${domain}.${service}`),
      );
    }

    async _callHaMediaPlayerService(entityId, service, serviceData = {}) {
      const targetId = String(entityId || "").trim();
      if (!targetId) return null;
      const data = { ...(serviceData || {}) };
      try {
        return await this._callHaServiceTargeted("media_player", service, data, { entity_id: targetId });
      } catch (targetError) {
        try {
          return await this._callHaServiceRaw("media_player", service, { entity_id: targetId, ...data });
        } catch (rawError) {
          throw rawError || targetError;
        }
      }
    }

    async _callMusicAssistantTransferQueue(sourcePlayerEntityId, targetPlayerEntityId) {
      const sourceId = String(sourcePlayerEntityId || "").trim();
      const targetId = String(targetPlayerEntityId || "").trim();
      if (!sourceId || !targetId || sourceId === targetId) return false;
      const data = { source_player: sourceId, auto_play: true };
      try {
        await this._callHaServiceTargeted("music_assistant", "transfer_queue", data, { entity_id: targetId });
        return true;
      } catch (targetError) {
        try {
          await this._callHaServiceRaw("music_assistant", "transfer_queue", { entity_id: targetId, ...data });
          return true;
        } catch (rawError) {
          throw rawError || targetError;
        }
      }
    }

    _activePlayerHelperEntity() {
      return String(this._config?.active_player_helper_entity || "").trim();
    }

    _syncActivePlayerHelper(player = this._getSelectedPlayer()) {
      const helperEntity = this._activePlayerHelperEntity();
      if (!helperEntity || !this._hass?.callService) return;
      if (!helperEntity.startsWith("input_text.")) {
        this._notifyCardIssue(
          "active-player-helper-domain",
          this._i18n("ui.active_player_helper_must_be_an_input_text_entity"),
          "error",
          60000,
        );
        return;
      }
      const value = String(player?.entity_id || this._state.selectedPlayer || "").trim();
      if (this._state.activePlayerHelperLastValue === value) return;
      this._state.activePlayerHelperLastValue = value;
      this._hass.callService("input_text", "set_value", {
        entity_id: helperEntity,
        value,
      }).catch((error) => {
        this._state.activePlayerHelperLastValue = undefined;
        this._notifyCardIssue(
          "active-player-helper-update",
          error?.message || this._i18n("ui.could_not_update_active_player_helper"),
          "error",
          60000,
        );
      });
    }

    _notifyCardIssue(key = "issue", message = "", variant = "error", cooldown = 30000) {
      const text = String(message || "").trim();
      if (!text) return;
      if (!this._cardIssueNoticeTimes) this._cardIssueNoticeTimes = new Map();
      const now = Date.now();
      const noticeKey = String(key || text);
      const last = this._cardIssueNoticeTimes.get(noticeKey) || 0;
      if (now - last < cooldown) return;
      this._cardIssueNoticeTimes.set(noticeKey, now);
      if (variant === "success") this._toastSuccess(text);
      else if (variant === "info") this._toast(text);
      else this._toastError(text);
    }

    _isMissingMusicAssistantConfigError(error = null) {
      const message = String(error?.message || error || "").toLowerCase();
      return (
        message.includes("homeii_ma_not_ready")
        || (message.includes("config entry") && message.includes("music assistant"))
        || message.includes("entry not loaded")
        || message.includes("music assistant entry")
        || message.includes("music assistant is not ready")
      );
    }

    _isMusicAssistantAvailabilityError(error = null) {
      const message = String(error?.message || error || "").toLowerCase();
      return this._isMissingMusicAssistantConfigError(error)
        || error?.code === "HOMEII_TIMEOUT"
        || error?.code === "HOMEII_MA_NOT_READY"
        || (message.includes("music assistant") && message.includes("timeout"))
        || (message.includes("music_assistant") && (message.includes("not found") || message.includes("not loaded")))
        || (message.includes("service") && message.includes("music_assistant") && message.includes("not found"));
    }

    _handleMusicAssistantIssue(error = null) {
      const rawMessage = String(error?.message || error || "").trim();
      const message = this._isMusicAssistantAvailabilityError(error)
        ? this._musicAssistantSetupMessage(rawMessage)
        : (rawMessage || this._musicAssistantSetupMessage());
      this._state.musicAssistantIssueMessage = message;
      this._notifyCardIssue("music-assistant-not-ready", message, "error", 45000);
      return message;
    }

    _musicAssistantRequiredTitle() {
      return this._i18n(
        "ui.music_assistant_required",
        {},
        this._m("Music Assistant required", "נדרשת אינטגרציית Music Assistant"),
      );
    }

    _musicAssistantRequiredMessage() {
      return this._i18n(
        "ui.no_music_assistant_players_were_found_check_music_assistant_and_media_pl",
        {},
        this._m(
          "Enable the Music Assistant integration in Home Assistant and expose at least one Music Assistant media_player for this card to work. Other Home Assistant media players are intentionally hidden.",
          "צריך להפעיל את אינטגרציית Music Assistant ב-Home Assistant ולחשוף לפחות נגן Music Assistant אחד כדי שהכרטיס יפעל. נגני Home Assistant רגילים מוסתרים בכוונה.",
        ),
      );
    }

    _musicAssistantSetupMessage(detail = "") {
      const suffix = String(detail || "").trim();
      const base = this._musicAssistantRequiredMessage();
      return suffix && !suffix.toLowerCase().includes(base.toLowerCase()) ? `${base} ${suffix}` : base;
    }

    async _fetchRecentlyPlayed(limit = 18) {
      if (!this._state.wsReady) {
        try {
          return this._normalizeMediaItems(await this._fetchLibrary("album", "last_played", limit, false));
        } catch (_) {
          return [];
        }
      }
      try {
        const items = await this._wsSend("music/recently_played_items", { limit, media_types: ["album"] });
        return this._normalizeMediaItems(Array.isArray(items) ? items : []);
      } catch (_) {
        return [];
      }
    }

    _loadPlayers() {
      const sel = this.$("playerSel");
      const hassStates = this._hass?.states || {};
      const hassEntities = this._hass?.entities || {};
      const musicAssistantEntities = Object.values(hassStates)
        .filter((entity) => HomeiiPlayersFoundation.isMusicAssistantPlayer(entity, hassEntities?.[entity.entity_id]));
      const genericMediaPlayerEntities = Object.values(hassStates)
        .filter((entity) => entity?.entity_id?.startsWith("media_player."));
      let entities = musicAssistantEntities.length
        ? musicAssistantEntities
        : (this._hasMusicAssistantBackend() ? genericMediaPlayerEntities : []);
      if (!entities.length) {
        const message = this._handleMusicAssistantIssue(this._musicAssistantRequiredMessage());
        this._state.players = [];
        this._state.selectedPlayer = null;
        this._state.hasAutoSelectedPlayer = false;
        this._state.maQueueState = null;
        this._state.queueItems = [];
        if (sel) sel.innerHTML = `<option value="">${this._esc(this._musicAssistantRequiredTitle())}</option>`;
        this._syncActivePlayerHelper(null);
        this._notifyCardIssue("no-music-assistant-players", message, "error", 45000);
        return;
      }
      this._state.musicAssistantIssueMessage = "";
      const directPlayers = this._mergeDirectMaPlayers(entities);
      if (directPlayers.length) entities = [...entities, ...directPlayers];
      entities = entities.filter((entity) => !this._isLocalSendspinPlayer(entity) || this._isAvailableThisDevicePlayer(entity));
      this._state.configurableMusicAssistantPlayers = entities.slice();
      const excludedPrefs = typeof this._excludedPlayerPreferences === "function" ? this._excludedPlayerPreferences() : [];
      if (excludedPrefs.length) {
        const excludedSet = new Set(excludedPrefs);
        entities = entities.filter((entity) => !excludedSet.has(entity.entity_id));
      }
      const pinnedPrefs = typeof this._pinnedPlayerPreferences === "function" ? this._pinnedPlayerPreferences() : [];
      if (pinnedPrefs.length) {
        const pinnedSet = new Set(pinnedPrefs);
        const frontPinnedEntityId = String(this._state.frontPinnedPlayerEntity || "").trim();
        const manualFrontEntityId = String(this._state.manualFrontPlayerEntity || "").trim();
        const manualFrontActive = manualFrontEntityId && Number(this._state.manualFrontPlayerUntil || 0) > Date.now();
        entities = entities.filter((entity) => (
          pinnedSet.has(entity.entity_id)
          || entity.entity_id === frontPinnedEntityId
          || (manualFrontActive && entity.entity_id === manualFrontEntityId)
          || entity.state === "playing"
          || this._isLocalSendspinPlayer(entity)
        ));
      }
      entities = entities.map((entity) => this._applyOptimisticPlayerVolumeState(entity));
      entities = typeof this._sortPlayerList === "function" ? this._sortPlayerList(entities) : entities;
      this._state.players = entities;
      if (!entities.length) {
        const message = excludedPrefs.length
          ? this._i18n("ui.no_visible_music_assistant_players_after_exclusions", {}, this._m(
            "All Music Assistant players are hidden by the excluded players setting.",
            "כל נגני Music Assistant מוסתרים בהגדרת החרגת נגנים.",
          ))
          : this._handleMusicAssistantIssue(this._musicAssistantRequiredMessage());
        if (excludedPrefs.length) this._state.musicAssistantIssueMessage = message;
        this._state.selectedPlayer = null;
        this._state.hasAutoSelectedPlayer = false;
        this._state.maQueueState = null;
        this._state.queueItems = [];
        if (sel) sel.innerHTML = `<option value="">${this._esc(this._musicAssistantRequiredTitle())}</option>`;
        this._syncActivePlayerHelper(null);
        this._notifyCardIssue("no-music-assistant-players", message, excludedPrefs.length ? "warning" : "error", 45000);
        return;
      }
      const rememberedThisDevice = this._getThisDevicePlayer(entities);
      const pinnedEntities = typeof this._resolvedPinnedPlayerEntities === "function" ? this._resolvedPinnedPlayerEntities(entities) : [];
      if (this._state.awaitingThisDevicePlayer) {
        const localThisDevice = this._getThisDevicePlayer(entities);
        const newcomer = localThisDevice;
        if (newcomer) {
          this._rememberThisDevicePlayer(newcomer.entity_id);
          this._state.awaitingThisDevicePlayer = false;
          this._state.knownBrowserPlayerIds = [];
          this._state.selectedPlayer = newcomer.entity_id;
          this._state.hasAutoSelectedPlayer = true;
          this._revealControlRoomThisDevicePlayer(newcomer.entity_id, { sync: false });
        }
      }
      const selectedPlayer = this._playerByEntityId(this._state.selectedPlayer);
      if (this._state.awaitingThisDevicePlayer && this._isExternalBrowserPlayer(selectedPlayer)) {
        this._state.selectedPlayer = null;
        this._state.hasAutoSelectedPlayer = false;
      }
      const pendingPlayerLock = HomeiiNowPlayingFoundation.pendingPlayerLockState(this._state, entities, Date.now());
      if (pendingPlayerLock.lockedPlayerId && this._state.selectedPlayer !== pendingPlayerLock.lockedPlayerId) {
        this._state.selectedPlayer = pendingPlayerLock.lockedPlayerId;
      }
      const holdSelectedPlayerDuringTransition = pendingPlayerLock.shouldHoldSelectedPlayer;
      const preferredFrontPlayerEntity = holdSelectedPlayerDuringTransition ? "" : HomeiiPlayersFoundation.resolvePreferredFrontPlayerEntity(entities, {
        currentEntityId: this._state.selectedPlayer,
        frontPinnedEntityId: this._frontPinnedPlayerEntity(entities),
        manualFrontEntityId: this._manualFrontPlayerEntity(entities),
        manualFrontUntil: this._state.manualFrontPlayerUntil,
        now: Date.now(),
        pinnedEntityIds: pinnedEntities,
        orderedEntityIds: typeof this._playerOrderPreferences === "function" && this._playerSortMode?.() === "custom"
          ? this._playerOrderPreferences()
          : [],
        isPlayerActiveFn: (player) => this._isPlayerActive(player),
        isExternalBrowserPlayerFn: (player) => this._isExternalBrowserPlayer(player),
      });
      if (preferredFrontPlayerEntity) {
        if (this._state.selectedPlayer !== preferredFrontPlayerEntity) this._state.selectedPlayer = preferredFrontPlayerEntity;
        this._state.hasAutoSelectedPlayer = true;
      }
      const currentStillExists = this._state.selectedPlayer && entities.some((p) => p.entity_id === this._state.selectedPlayer);
      if (!currentStillExists) this._state.selectedPlayer = null;
      if (!this._state.selectedPlayer) {
        const fallbackPlayer = rememberedThisDevice || entities.find((p) => !this._isExternalBrowserPlayer(p)) || entities[0];
        if (fallbackPlayer) this._state.selectedPlayer = fallbackPlayer.entity_id;
      }
      if (sel) {
        sel.innerHTML = entities.map((entity) => {
          const active = this._isPlayerActive(entity) ? "● " : "";
          const name = entity.attributes.friendly_name || entity.entity_id;
          return `<option value="${this._esc(entity.entity_id)}">${this._esc(active + name)}</option>`;
        }).join("");
        sel.value = this._state.selectedPlayer || "";
      }
      this._syncActivePlayerHelper();
    }

    _getSelectedPlayer() {
      if (!this._state.selectedPlayer) return null;
      return this._playerByEntityId(this._state.selectedPlayer);
    }

    _selectedPlayerMoreInfoEntityId(player = this._getSelectedPlayer()) {
      const entityId = String(player?.entity_id || "").trim();
      if (!entityId) return "";
      if (this._hass?.states?.[entityId]) return entityId;
      const attrs = player?.attributes || {};
      const directIds = [
        this._directMaPlayerId(player),
        attrs.mass_player_id,
        attrs.player_id,
        attrs.id,
        attrs.active_queue,
        attrs.queue_id,
      ].map((value) => String(value || "").trim()).filter(Boolean);
      if (directIds.length && this._hass?.states) {
        const match = Object.values(this._hass.states).find((stateObj) => {
          if (!stateObj?.entity_id?.startsWith?.("media_player.")) return false;
          const stateAttrs = stateObj.attributes || {};
          return [
            stateAttrs.mass_player_id,
            stateAttrs.player_id,
            stateAttrs.id,
            stateAttrs.active_queue,
            stateAttrs.queue_id,
          ].some((value) => directIds.includes(String(value || "").trim()));
        });
        if (match?.entity_id) return match.entity_id;
      }
      return this._isDirectMaEntityId(entityId) ? "" : entityId;
    }

    _openSelectedPlayerMoreInfo() {
      const player = this._getSelectedPlayer();
      const entityId = this._selectedPlayerMoreInfoEntityId(player);
      if (!entityId) {
        this._toast(this._i18n("ui.more_info_is_unavailable_for_this_player"));
        return;
      }
      this.dispatchEvent(new CustomEvent("hass-more-info", {
        detail: { entityId },
        bubbles: true,
        composed: true,
      }));
    }

    async _playMediaOnPlayer(entityId, uri, mediaType = "album", enqueue = "play", options = {}) {
      if (!entityId) return false;
      const label = this._mediaFeedbackLabel(uri, options.label || "");
      try {
        if (this._isDirectMaPlayer(entityId)) {
          return await this._playMediaOnDirectMaPlayer(entityId, uri, mediaType, enqueue, options);
        }
        if (enqueue === "shuffle") {
          await this._callHaServiceRaw("media_player", "shuffle_set", { entity_id: entityId, shuffle: true });
        }
        const serviceData = {
          entity_id: entityId,
          media_id: uri,
          media_type: mediaType,
          enqueue: enqueue === "shuffle" ? "play" : enqueue,
        };
        if (options.radioMode) serviceData.radio_mode = true;
        await this._callHaServiceRaw("music_assistant", "play_media", serviceData);
        if (!options.silent) {
          const targetPlayer = this._playerByEntityId(entityId);
          this._toastMediaQueued(label, targetPlayer?.attributes?.friendly_name || entityId);
        }
        if (entityId === this._state.selectedPlayer) setTimeout(() => this._ensureQueueSnapshot(true), 600);
        return true;
      } catch (error) {
        if (!options.silent) {
          if (this._isMusicAssistantAvailabilityError(error)) this._handleMusicAssistantIssue(error);
          else this._toastError(this._i18n("ui.could_not_play_label", { label }));
        }
        return false;
      }
    }

    async _playMediaOnPlayers(entityIds = [], uri, mediaType = "album", enqueue = "play", options = {}) {
      const targets = [...new Set((Array.isArray(entityIds) ? entityIds : []).filter(Boolean))];
      if (!targets.length) return false;
      const results = await Promise.allSettled(targets.map((entityId) => this._playMediaOnPlayer(entityId, uri, mediaType, enqueue, { ...options, silent: true })));
      const successCount = results.filter((result) => result.status === "fulfilled" && result.value).length;
      if (!options.silent) {
        const successMessage = successCount > 1
          ? this._m(`Started on ${successCount} players`, `הופעל על ${successCount} נגנים`)
          : this._i18n("ui.started_on_selected_player");
        (successCount ? this._toastSuccess : this._toastError).call(this, successCount ? successMessage : this._i18n("ui.could_not_start_playback"));
      }
      return successCount > 0;
    }

    async _playMedia(uri, mediaType = "album", enqueue = "play", options = {}) {
      if (!this._state.selectedPlayer) {
        this._toastError(this._i18n("ui.select_a_player_first"));
        return false;
      }
      this._state.forceRadioHero = !!options.forceRadioHero || String(mediaType || "").toLowerCase() === "radio";
      if (options.sourceEl) this._flashInteraction(options.sourceEl);
      return this._playMediaOnPlayer(this._state.selectedPlayer, uri, mediaType, enqueue, options);
    }

    _supportsMusicAssistantRadioMode(mediaType = "") {
      return ["track", "album", "artist", "playlist"].includes(String(mediaType || "").toLowerCase());
    }

    async _playAll(items = [], shuffle = false) {
      if (!items.length) return;
      if (!this._state.selectedPlayer) return this._toast(this._i18n("ui.select_a_player_first"));
      if (this._isDirectMaPlayer(this._state.selectedPlayer)) {
        const playable = items.map((item) => item?.uri).filter(Boolean);
        if (!playable.length) return;
        await this._playMediaOnPlayer(this._state.selectedPlayer, playable, items[0]?.media_type || "track", shuffle ? "shuffle" : "play", {
          label: items[0]?.name || "",
          silent: true,
        });
        setTimeout(() => this._ensureQueueSnapshot(true), 600);
        return;
      }
      if (shuffle) {
        await this._callHaServiceRaw("media_player", "shuffle_set", { entity_id: this._state.selectedPlayer, shuffle: true });
      }
      await this._callHaServiceRaw("music_assistant", "play_media", {
        entity_id: this._state.selectedPlayer,
        media_id: items[0].uri,
        media_type: items[0].media_type || "album",
        enqueue: "play",
      });
      for (let i = 1; i < items.length; i++) {
        await this._callHaServiceRaw("music_assistant", "play_media", {
          entity_id: this._state.selectedPlayer,
          media_id: items[i].uri,
          media_type: items[i].media_type || "album",
          enqueue: "add",
        });
      }
      setTimeout(() => this._ensureQueueSnapshot(true), 600);
    }

    _likedPlayableEntries(entries = [], selectedOnly = false) {
      const source = Array.isArray(entries) ? entries.filter((entry) => String(entry?.uri || "").trim()) : [];
      const selectedSet = new Set(Array.isArray(this._state.likedSelectedUris) ? this._state.likedSelectedUris : []);
      const scoped = selectedOnly ? source.filter((entry) => selectedSet.has(String(entry?.uri || "").trim())) : source;
      const tracks = scoped.filter((entry) => String(entry?.media_type || "").toLowerCase() === "track");
      return (tracks.length ? tracks : scoped).map((entry) => ({
        uri: String(entry.uri || "").trim(),
        media_type: entry.media_type || "track",
        name: entry.name || "",
      })).filter((entry) => entry.uri);
    }

    _togglePlay() {
      const player = this._getSelectedPlayer();
      if (!player) return;
      const nextState = player.state === "playing" ? "paused" : "playing";
      this._setPlayerPlaybackOptimistic(player.entity_id, { state: nextState });
      if (this._isDirectMaPlayer(player)) {
        this._callDirectMaPlayerCommand(player, player.state === "playing" ? "players/cmd/pause" : "players/cmd/play")
          .then(() => this._refreshDirectMaPlayers().catch(() => {}))
          .catch((error) => {
            this._clearPlayerPlaybackOptimistic(player.entity_id);
            this._toastError(this._mediaControlFailureMessage(error));
            this._refreshDirectMaPlayers().catch(() => {});
          });
        return;
      }
      const service = player.state === "playing" ? "media_pause" : "media_play";
      this._callHaServiceRaw("media_player", service, { entity_id: player.entity_id })
        .catch((error) => {
          this._clearPlayerPlaybackOptimistic(player.entity_id);
          this._toastError(this._mediaControlFailureMessage(error));
          this._loadPlayers();
          this._syncNowPlayingUI();
        });
    }

    _playerCmd(cmd) {
      const player = this._getSelectedPlayer();
      if (!player) return;
      let queueItems = HomeiiMediaQueueFoundation.sortQueueItems(this._state.queueItems || []);
      const currentQueueIndex = Number(this._state.maQueueState?.current_index);
      let baseIndex = Number.isFinite(currentQueueIndex)
        ? queueItems.findIndex((item) => Number(item?.sort_index) === currentQueueIndex)
        : -1;
      if (baseIndex < 0 && typeof this._mobileArtStackContext === "function") {
        const context = this._mobileArtStackContext();
        queueItems = Array.isArray(context.queueItems) ? context.queueItems : queueItems;
        baseIndex = Number(context.baseIndex);
      }
      const targetIndex = cmd === "previous" ? baseIndex - 1 : baseIndex + 1;
      const targetItem = Array.isArray(queueItems) ? queueItems[targetIndex] : null;
      if (targetItem) {
        this._setOptimisticMobileQueueItem(targetItem);
        this._setPlayerPlaybackOptimistic(player.entity_id, { state: "playing", until: Date.now() + 8500 });
        this._refreshMobileArtStack(true);
        this._syncNowPlayingUI();
      }
      if (this._isDirectMaPlayer(player)) {
        this._callDirectMaPlayerCommand(player, cmd === "previous" ? "players/cmd/previous" : "players/cmd/next")
          .then(() => {
            setTimeout(() => this._ensureQueueSnapshot(true), 700);
            setTimeout(() => this._ensureQueueSnapshot(true), 1500);
            setTimeout(() => this._ensureQueueSnapshot(true), 2850);
          })
          .catch((error) => this._toastError(error?.message || this._i18n("ui.playback_command_failed")));
        return;
      }
      this._callHaServiceRaw("media_player", cmd === "previous" ? "media_previous_track" : "media_next_track", { entity_id: player.entity_id })
        .catch((error) => this._toastError(this._mediaControlFailureMessage(error)));
      setTimeout(() => this._ensureQueueSnapshot(true), 700);
      setTimeout(() => this._ensureQueueSnapshot(true), 1500);
      setTimeout(() => this._ensureQueueSnapshot(true), 2850);
    }

    async _playerCmdFor(entityId, cmd = "next") {
      const player = this._playerByEntityId(entityId);
      if (!player) return;
      if (this._isDirectMaPlayer(player)) {
        await this._callDirectMaPlayerCommand(player, cmd === "previous" ? "players/cmd/previous" : "players/cmd/next");
        if (entityId === this._state.selectedPlayer) {
          setTimeout(() => this._ensureQueueSnapshot(true), 700);
          setTimeout(() => this._ensureQueueSnapshot(true), 1500);
        }
        return;
      }
      const service = cmd === "previous" ? "media_previous_track" : "media_next_track";
      await this._callHaServiceRaw("media_player", service, { entity_id: player.entity_id });
      if (entityId === this._state.selectedPlayer) {
        setTimeout(() => this._ensureQueueSnapshot(true), 700);
        setTimeout(() => this._ensureQueueSnapshot(true), 1500);
      }
    }

    async _togglePlayFor(entityId) {
      if (!entityId) return;
      if (this._isDirectMaPlayer(entityId)) {
        await this._callDirectMaPlayerCommand(entityId, "players/cmd/play_pause");
        return;
      }
      const player = this._playerByEntityId(entityId);
      if (player) {
        this._setPlayerPlaybackOptimistic(entityId, { state: player.state === "playing" ? "paused" : "playing" });
      }
      await this._callHaServiceRaw("media_player", "media_play_pause", { entity_id: entityId });
    }

    async _stepQueueByDelta(delta) {
      const player = this._getSelectedPlayer();
      const steps = Math.abs(Math.trunc(Number(delta) || 0));
      if (!player || !steps) return !steps;
      const service = delta > 0 ? "media_next_track" : "media_previous_track";
      for (let i = 0; i < steps; i += 1) {
        await this._callHaServiceRaw("media_player", service, { entity_id: player.entity_id });
        if (i < steps - 1) {
          await new Promise((resolve) => window.setTimeout(resolve, 85));
        }
      }
      return true;
    }

    _toggleShuffle() {
      const player = this._getSelectedPlayer();
      if (!player) return;
      const nextShuffle = !player.attributes.shuffle;
      this._setPlayerPlaybackOptimistic(player.entity_id, { shuffle: nextShuffle });
      if (this._isDirectMaPlayer(player)) {
        const queueId = this._directMaQueueId(player);
        if (!queueId) {
          this._clearPlayerPlaybackOptimistic(player.entity_id);
          this._syncNowPlayingUI();
          return;
        }
        this._callDirectMaCommand("player_queues/shuffle", { queue_id: queueId, shuffle_enabled: nextShuffle })
          .then(() => this._refreshDirectMaPlayers().catch(() => {}))
          .catch((error) => {
            this._clearPlayerPlaybackOptimistic(player.entity_id);
            this._toastError(this._mediaControlFailureMessage(error));
            this._refreshDirectMaPlayers().catch(() => {});
            this._syncNowPlayingUI();
          });
        return;
      }
      this._callHaServiceRaw("media_player", "shuffle_set", { entity_id: player.entity_id, shuffle: nextShuffle })
        .catch((error) => {
          this._clearPlayerPlaybackOptimistic(player.entity_id);
          this._toastError(this._mediaControlFailureMessage(error));
          this._loadPlayers();
          this._syncNowPlayingUI();
        });
    }

    _repeatModeLabel(mode = "off") {
      const normalized = String(mode || "off").toLowerCase();
      if (normalized === "one") return this._i18n("ui.repeat_one");
      if (normalized === "all") return this._i18n("ui.repeat_all");
      return this._i18n("ui.repeat_off");
    }

    _toggleRepeat() {
      const player = this._getSelectedPlayer();
      if (!player) return;
      const modes = ["off", "one", "all"];
      const current = player.attributes.repeat || "off";
      const next = modes[(modes.indexOf(current) + 1) % modes.length];
      this._setPlayerPlaybackOptimistic(player.entity_id, { repeat: next });
      if (this._isDirectMaPlayer(player)) {
        const queueId = this._directMaQueueId(player);
        if (!queueId) {
          this._clearPlayerPlaybackOptimistic(player.entity_id);
          this._syncNowPlayingUI();
          return;
        }
        this._callDirectMaCommand("player_queues/repeat", { queue_id: queueId, repeat_mode: next })
          .then(() => this._refreshDirectMaPlayers().catch(() => {}))
          .catch((error) => {
            this._clearPlayerPlaybackOptimistic(player.entity_id);
            this._toastError(this._mediaControlFailureMessage(error));
            this._refreshDirectMaPlayers().catch(() => {});
            this._syncNowPlayingUI();
          });
        return;
      }
      this._callHaServiceRaw("media_player", "repeat_set", { entity_id: player.entity_id, repeat: next })
        .catch((error) => {
          this._clearPlayerPlaybackOptimistic(player.entity_id);
          this._toastError(this._mediaControlFailureMessage(error));
          this._loadPlayers();
          this._syncNowPlayingUI();
        });
    }

    _setVolume(level) {
      const player = this._getSelectedPlayer();
      if (!player) return;
      const normalized = Math.max(0, Math.min(1, Number(level) || 0));
      this._setPlayerVolumeOptimistic(player.entity_id, normalized, normalized <= 0 ? true : false);
      if (this._isDirectMaPlayer(player)) {
        this._callDirectMaPlayerCommand(player, "players/cmd/volume_set", { volume_level: Math.round(normalized * 100) })
          .then(() => this._refreshDirectMaPlayers().catch(() => {}))
          .catch((error) => this._toastError(this._mediaControlFailureMessage(error)));
        return;
      }
      this._callHaServiceRaw("media_player", "volume_set", { entity_id: player.entity_id, volume_level: normalized })
        .catch((error) => this._toastError(this._mediaControlFailureMessage(error)));
    }

    _stepSelectedVolume(direction = 0) {
      const player = this._getSelectedPlayer();
      if (!player) return;
      const currentPct = Math.round(this._effectivePlayerVolumeLevel(player) * 100);
      const stepPct = this._mobileVolumeStepPercent();
      const nextPct = Math.max(0, Math.min(100, currentPct + (direction < 0 ? -stepPct : stepPct)));
      const slider = this.$("volSlider");
      if (slider) {
        slider.value = String(nextPct);
        slider.style.setProperty("--vol-pct", `${nextPct}%`);
      }
      const label = this.$("mobileVolPctLabel");
      if (label) label.textContent = `${nextPct}%`;
      this._setButtonIcon(this.$("btnMute"), nextPct === 0 ? "volume_mute" : nextPct < 40 ? "volume_low" : "volume_high");
      this.$("btnMute")?.classList.toggle("muted", nextPct === 0);
      this._setVolume(nextPct / 100);
      this._syncNowPlayingUI();
    }

    _applyOptimisticPlayerVolumeState(player = null) {
      const entityId = String(player?.entity_id || "").trim();
      if (!entityId) return player;
      const now = Date.now();
      const volumeState = this._optimisticVolumeByPlayer.get(entityId);
      const muteState = this._optimisticMuteByPlayer.get(entityId);
      const playbackState = this._optimisticPlaybackByPlayer.get(entityId);
      const patch = {};
      let statePatch = "";
      if (volumeState && now - Number(volumeState.ts || 0) < 5000) {
        patch.volume_level = volumeState.level;
      } else if (volumeState) {
        this._optimisticVolumeByPlayer.delete(entityId);
      }
      if (muteState && now - Number(muteState.ts || 0) < 5000) {
        patch.is_volume_muted = !!muteState.muted;
      } else if (muteState) {
        this._optimisticMuteByPlayer.delete(entityId);
      }
      const playbackStateStillFresh = playbackState && (
        Number(playbackState.until || 0) > now
        || now - Number(playbackState.ts || 0) < 5000
      );
      if (playbackStateStillFresh) {
        if (playbackState.state) statePatch = playbackState.state;
        if (playbackState.shuffle !== undefined) patch.shuffle = !!playbackState.shuffle;
        if (playbackState.repeat !== undefined) patch.repeat = playbackState.repeat;
      } else if (playbackState) {
        this._optimisticPlaybackByPlayer.delete(entityId);
      }
      if (!Object.keys(patch).length && !statePatch) return player;
      return {
        ...player,
        ...(statePatch ? { state: statePatch } : {}),
        attributes: {
          ...(player.attributes || {}),
          ...patch,
        },
      };
    }

    _setPlayerPlaybackOptimistic(entityId, patch = {}) {
      const playerId = String(entityId || "").trim();
      if (!playerId) return;
      const current = this._optimisticPlaybackByPlayer.get(playerId) || {};
      this._optimisticPlaybackByPlayer.set(playerId, {
        ...current,
        ...patch,
        ts: Date.now(),
      });
      const updatePlayer = (player) => {
        if (!player || player.entity_id !== playerId) return player;
        return this._applyOptimisticPlayerVolumeState(player);
      };
      this._state.players = (this._state.players || []).map(updatePlayer);
      this._directMaPlayers = (this._directMaPlayers || []).map(updatePlayer);
      this._syncNowPlayingUI();
    }

    _clearPlayerPlaybackOptimistic(entityId) {
      const playerId = String(entityId || "").trim();
      if (!playerId) return;
      this._optimisticPlaybackByPlayer.delete(playerId);
    }

    _mediaControlFailureMessage(error = null) {
      const message = String(error?.message || error || "").trim();
      if (/does not support action|unsupported|not supported/i.test(message)) {
        return this._m(
          "This player does not support that media control through Home Assistant.",
          "הנגן הזה לא תומך בפקד המדיה הזה דרך Home Assistant.",
        );
      }
      if (this._isMusicAssistantAvailabilityError(error)) return this._handleMusicAssistantIssue(error);
      return message || this._i18n("ui.playback_command_failed");
    }

    _setPlayerVolumeOptimistic(entityId, level, muted = null) {
      const normalized = Math.max(0, Math.min(1, Number(level) || 0));
      const playerId = String(entityId || "").trim();
      if (!playerId) return;
      const now = Date.now();
      this._optimisticVolumeByPlayer.set(playerId, { level: normalized, ts: now });
      if (muted !== null) this._optimisticMuteByPlayer.set(playerId, { muted: !!muted, ts: now });
      if (muted === true) this._softMutedPlayers.add(playerId);
      if (muted === false) this._softMutedPlayers.delete(playerId);
      const updatePlayer = (player) => {
        if (!player || player.entity_id !== playerId) return player;
        return this._applyOptimisticPlayerVolumeState(player);
      };
      this._state.players = (this._state.players || []).map(updatePlayer);
      this._directMaPlayers = (this._directMaPlayers || []).map(updatePlayer);
      this._syncPlayerVolumeControls(playerId, Math.round(normalized * 100), { muted });
    }

    _syncPlayerVolumeControls(entityId, pct, options = {}) {
      const playerId = String(entityId || "").trim();
      if (!playerId) return;
      const value = Math.max(0, Math.min(100, Math.round(Number(pct) || 0)));
      const muted = options.muted !== undefined ? !!options.muted : value === 0;
      const icon = muted || value === 0 ? "volume_mute" : value < 40 ? "volume_low" : "volume_high";
      if (playerId === String(this._state.selectedPlayer || "")) {
        const slider = this.$("volSlider");
        if (slider) {
          if (String(slider.value) !== String(value)) slider.value = String(value);
          slider.style.setProperty("--vol-pct", `${value}%`);
        }
        const label = this.$("mobileVolPctLabel");
        if (label) label.textContent = `${value}%`;
        const muteBtn = this.$("btnMute");
        if (muteBtn) {
          muteBtn.classList.toggle("active", muted);
          muteBtn.classList.toggle("muted", muted);
          this._setButtonIcon(muteBtn, icon);
        }
        const controlVolumeBtn = this.$("controlVolumeBtn");
        if (controlVolumeBtn) {
          controlVolumeBtn.classList.toggle("muted", muted);
          this._setButtonIcon(controlVolumeBtn, icon);
        }
        const popupSlider = this.$("tabletPopupVolSlider");
        if (popupSlider) {
          if (String(popupSlider.value) !== String(value)) popupSlider.value = String(value);
          popupSlider.style.setProperty("--vol-pct", `${value}%`);
        }
        const popupValue = this.$("tabletPopupVolPct");
        if (popupValue) popupValue.textContent = `${value}%`;
        const popupMuteBtn = this.$("tabletPopupMuteBtn");
        if (popupMuteBtn) this._setButtonIcon(popupMuteBtn, icon);
      }
      this.shadowRoot?.querySelectorAll("[data-player-volume]")?.forEach((input) => {
        if (input.dataset.playerVolume !== playerId) return;
        if (String(input.value) !== String(value)) input.value = String(value);
        input.style.setProperty("--vol-pct", `${value}%`);
        const row = input.closest(".player-volume-row");
        const valueEl = row?.querySelector(".player-mini-value");
        if (valueEl) valueEl.textContent = `${value}%`;
        const muteBtn = row?.querySelector("[data-player-mute]");
        if (muteBtn) {
          muteBtn.classList.toggle("active", muted);
          this._setButtonIcon(muteBtn, icon);
        }
      });
      this.shadowRoot?.querySelectorAll("[data-player-mute]")?.forEach((button) => {
        if (button.dataset.playerMute !== playerId) return;
        button.classList.toggle("active", muted);
        this._setButtonIcon(button, icon);
      });
    }

    _isMuted(player) {
      if (!player) return false;
      return !!player.attributes?.is_volume_muted || this._softMutedPlayers.has(player.entity_id);
    }

    async _toggleMute() {
      const player = this._getSelectedPlayer();
      if (!player) return;
      const entityId = player.entity_id;
      const currentlyMuted = this._isMuted(player);
      const currentVolume = Number(player.attributes.volume_level ?? 0);
      if (!currentlyMuted && currentVolume > 0) this._lastVolumeByPlayer.set(entityId, currentVolume);
      const restoreVolume = this._lastVolumeByPlayer.get(entityId) ?? 0.35;
      const targetVolume = currentlyMuted ? (currentVolume === 0 ? restoreVolume : currentVolume) : 0;
      if (this._isDirectMaPlayer(player)) {
        this._setPlayerVolumeOptimistic(entityId, currentVolume, !currentlyMuted);
        try {
          await this._callDirectMaPlayerCommand(player, "players/cmd/volume_mute", { muted: !currentlyMuted });
        } catch (error) {
          this._toastError(this._mediaControlFailureMessage(error));
        }
        this._refreshDirectMaPlayers().catch(() => {});
        setTimeout(() => this._syncNowPlayingUI(), 120);
        return;
      }
      this._setPlayerVolumeOptimistic(entityId, targetVolume, !currentlyMuted);
      try {
        await this._callHaServiceRaw("media_player", "volume_mute", { entity_id: entityId, is_volume_muted: !currentlyMuted });
      } catch (error) {
        this._toastError(this._mediaControlFailureMessage(error));
      }
      if (!currentlyMuted) {
        if (currentVolume > 0) {
          this._callHaServiceRaw("media_player", "volume_set", { entity_id: entityId, volume_level: 0 })
            .catch((error) => this._toastError(this._mediaControlFailureMessage(error)));
        }
      } else {
        if (currentVolume === 0) {
          this._callHaServiceRaw("media_player", "volume_set", { entity_id: entityId, volume_level: restoreVolume })
            .catch((error) => this._toastError(this._mediaControlFailureMessage(error)));
        }
        try {
          await this._callHaServiceRaw("media_player", "volume_mute", { entity_id: entityId, is_volume_muted: false });
        } catch (error) {
          this._toastError(this._mediaControlFailureMessage(error));
        }
      }
      setTimeout(() => this._syncNowPlayingUI(), 120);
    }

    _syncStatus() {
      const pill = this.$("statusPill");
      const text = this.$("statusText");
      if (!pill || !text) return;
      if (this._maToken && this._maBrowserUrl()) {
        if (this._state.wsReady) {
          pill.classList.remove("offline");
          text.textContent = this._i18n("ui.connected");
        } else {
          pill.classList.add("offline");
          text.textContent = this._i18n("ui.connecting");
        }
      } else {
        pill.classList.remove("offline");
        text.textContent = this._i18n("ui.connected");
      }
    }

    _getCurrentDuration() {
      const player = this._getSelectedPlayer();
      return HomeiiMediaPresentationFoundation.coercePlaybackSeconds(
        this._state.maQueueState?.current_item?.duration
        || this._state.maQueueState?.current_item?.media_item?.duration
        || player?.attributes?.media_duration
        || player?.attributes?.current_media?.duration
        || player?.attributes?.currentMedia?.duration
        || 0
      );
    }

    _getCurrentPosition() {
      const player = this._getSelectedPlayer();
      const hasQueuePosition = this._state.maQueueState?.elapsed_time !== undefined
        && this._state.maQueueState?.elapsed_time !== null
        && this._state.maQueueState?.elapsed_time !== "";
      let position = hasQueuePosition
        ? HomeiiMediaPresentationFoundation.coercePlaybackSeconds(this._state.maQueueState?.elapsed_time)
        : HomeiiMediaPresentationFoundation.coercePlaybackSeconds(player?.attributes?.media_position || 0);
      if (this._state.maQueueState && player?.state === "playing" && this._state.maQueueState.elapsed_time_last_updated) {
        const updatedAt = HomeiiMediaPresentationFoundation.parsePlaybackTimestampMs(this._state.maQueueState.elapsed_time_last_updated);
        if (updatedAt) position += Math.max(0, (Date.now() - updatedAt) / 1000);
      } else if (player?.state === "playing" && player?.attributes?.media_position_updated_at) {
        const updatedAt = HomeiiMediaPresentationFoundation.parsePlaybackTimestampMs(player.attributes.media_position_updated_at);
        if (updatedAt) position += Math.max(0, (Date.now() - updatedAt) / 1000);
      }
      const duration = this._getCurrentDuration();
      if (duration && position > duration + 2) return duration;
      return Math.max(0, position || 0);
    }

    _applyProgressUi(position = this._getCurrentPosition(), duration = this._getCurrentDuration()) {
      const safeDuration = HomeiiMediaPresentationFoundation.coercePlaybackSeconds(duration);
      const safePosition = safeDuration
        ? Math.max(0, Math.min(safeDuration, HomeiiMediaPresentationFoundation.coercePlaybackSeconds(position)))
        : Math.max(0, HomeiiMediaPresentationFoundation.coercePlaybackSeconds(position));
      const pct = safeDuration ? Math.min(100, (safePosition / safeDuration) * 100) : 0;
      ["progressFill", "bigProgressFill", "immersiveProgressFill"].forEach((id) => {
        const el = this.$(id) || this.shadowRoot?.querySelector?.(`#${id}`);
        if (el) el.style.width = `${pct}%`;
      });
      ["bigCurTime", "immersiveCurTime"].forEach((id) => {
        const el = this.$(id) || this.shadowRoot?.querySelector?.(`#${id}`);
        if (el) el.textContent = this._fmtDur(safePosition);
      });
      ["bigTotalTime", "immersiveTotalTime"].forEach((id) => {
        const el = this.$(id) || this.shadowRoot?.querySelector?.(`#${id}`);
        if (el) el.textContent = this._fmtDur(safeDuration);
      });
    }

    _bindProgressSeekBar(el) {
      if (!el || el.dataset.homeiiSeekBound === "1") return;
      el.dataset.homeiiSeekBound = "1";
      let dragging = false;
      const seek = (event, immediate = false) => this._seekFromProgress(event, { immediate });
      el.addEventListener("pointerdown", (event) => {
        if (event.button !== undefined && event.button > 0) return;
        event.preventDefault();
        dragging = true;
        this._lastProgressPointerSeekAt = Date.now();
        try { el.setPointerCapture?.(event.pointerId); } catch {}
        seek(event, true);
      });
      el.addEventListener("pointermove", (event) => {
        if (!dragging) return;
        event.preventDefault();
        seek(event, false);
      });
      const finish = (event) => {
        if (!dragging) return;
        dragging = false;
        try { el.releasePointerCapture?.(event.pointerId); } catch {}
        seek(event, true);
      };
      el.addEventListener("pointerup", finish);
      el.addEventListener("pointercancel", finish);
      el.addEventListener("click", (event) => {
        if (Date.now() - Number(this._lastProgressPointerSeekAt || 0) < 240) return;
        seek(event, true);
      });
    }

    async _seekFromProgress(e, options = {}) {
      const player = this._getSelectedPlayer();
      if (!player) return;
      const duration = this._getCurrentDuration();
      if (!duration) return;
      const rect = e.currentTarget.getBoundingClientRect();
      if (!rect.width) return;
      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const newPos = Math.floor(duration * pct);
      this._applyProgressUi(newPos, duration);
      if (this._state.maQueueState) {
        this._state.maQueueState.elapsed_time = newPos;
        this._state.maQueueState.elapsed_time_last_updated = Date.now() / 1000;
      }
      clearTimeout(this._seekTimer);
      const runSeek = () => {
        if (this._isDirectMaPlayer(player)) {
          this._callDirectMaPlayerCommand(player, "players/cmd/seek", { position: newPos }).catch(() => {});
          return;
        }
        this._hass.callService("media_player", "media_seek", { entity_id: player.entity_id, seek_position: newPos });
      };
      if (options.immediate) runSeek();
      else this._seekTimer = setTimeout(runSeek, 20);
    }

    _setNowPlayingSubtitle(value, { scrollWhenOverflow = false } = {}) {
      const el = this.$("npSub");
      if (!el) return;
      const text = String(value || "—");
      const shouldScroll = this._nowPlayingSubtitleShouldScroll(scrollWhenOverflow);
      const existingInner = el.querySelector?.(".scrolling-text-inner");
      const unchanged = el.dataset.homeiiSubtitleText === text
        && el.dataset.homeiiSubtitleScroll === String(shouldScroll)
        && existingInner;

      el.title = text;
      el.classList.toggle("scroll-when-overflow", shouldScroll);
      if (unchanged) {
        if (shouldScroll) this._queueNowPlayingSubtitleOverflowSync(el);
        return;
      }

      el.dataset.homeiiSubtitleText = text;
      el.dataset.homeiiSubtitleScroll = String(shouldScroll);
      el.classList.remove("is-overflowing");
      el.style.removeProperty("--scroll-distance");
      el.style.removeProperty("--scroll-duration");
      el.textContent = "";
      const inner = document.createElement("span");
      inner.className = "scrolling-text-inner";
      const primary = document.createElement("span");
      primary.className = "scrolling-text-item";
      primary.textContent = text;
      inner.appendChild(primary);
      if (shouldScroll) {
        const duplicate = document.createElement("span");
        duplicate.className = "scrolling-text-item";
        duplicate.setAttribute("aria-hidden", "true");
        duplicate.textContent = text;
        inner.appendChild(duplicate);
      }
      el.appendChild(inner);
      if (shouldScroll) this._queueNowPlayingSubtitleOverflowSync(el);
    }

    _nowPlayingSubtitleShouldScroll(scrollWhenOverflow = false) {
      return !!scrollWhenOverflow && !this._isHebrew() && !this._performanceUltraLiteEnabled();
    }

    _queueNowPlayingSubtitleOverflowSync(el) {
      if (typeof requestAnimationFrame === "function") requestAnimationFrame(() => this._syncNowPlayingSubtitleOverflow(el));
      else this._syncNowPlayingSubtitleOverflow(el);
    }

    _syncNowPlayingSubtitleOverflow(el) {
      const inner = el?.querySelector?.(".scrolling-text-inner");
      const item = inner?.querySelector?.(".scrolling-text-item");
      if (!el || !inner || !item) return;
      const gap = Math.max(24, Math.round(el.clientWidth * 0.18));
      const itemWidth = item.scrollWidth;
      const distance = itemWidth + gap;
      const overflow = itemWidth > el.clientWidth + 1;
      el.classList.toggle("is-overflowing", overflow);
      el.style.setProperty("--scroll-gap", gap + "px");
      el.style.setProperty("--scroll-distance", distance + "px");
      el.style.setProperty("--scroll-duration", Math.max(9, Math.min(24, distance / 24)).toFixed(2) + "s");
    }

    _syncNowPlayingUI() {
      const player = this._getSelectedPlayer();
      if (!player) {
        const issue = this._state.musicAssistantIssueMessage || this._musicAssistantRequiredMessage();
        this._setButtonIcon(this.$("btnPlay"), "play");
        if (this.$("npTitle")) this.$("npTitle").textContent = this._musicAssistantRequiredTitle();
        this._setNowPlayingSubtitle(issue);
        if (this.$("npArt")) this.$("npArt").innerHTML = this._artPlaceholderHtml("speaker");
        if (this.$("progressFill")) this.$("progressFill").style.width = "0%";
        const slider = this.$("volSlider");
        if (slider) {
          slider.value = 0;
          slider.style.setProperty("--vol-pct", "0%");
        }
        this._renderPlayerSummary();
        this._syncBrandPlayingState();
        this._syncStatus();
        return;
      }
      const queueItem = this._state.maQueueState?.current_item || null;
      const media = queueItem?.media_item || {};
      const queueTitle = media?.name || queueItem?.media_title || queueItem?.name || "";
      const queueArtist = Array.isArray(media?.artists)
        ? media.artists.map((artist) => artist?.name).filter(Boolean).join(", ")
        : (queueItem?.media_artist || "");
      const queueArt = this._queueItemImageUrl(queueItem, 420)
        || queueItem?.media_image
        || queueItem?.image
        || queueItem?.image_url
        || media?.image
        || media?.image_url
        || media?.album?.image
        || media?.album?.image_url
        || "";
      this._setButtonIcon(this.$("btnPlay"), this._playPauseIconName(player));
      this.$("npTitle").textContent = queueTitle || player.attributes.media_title || this._i18n("ui.nothing_playing");
      this._setNowPlayingSubtitle(queueArtist || player.attributes.media_artist || "—");
      const art = this._currentArtworkUrl(player, queueItem, 420, { preferPlayerArtwork: true }) || queueArt || this._bestArtworkUrl([
        player.attributes.entity_picture_local,
        player.attributes.entity_picture,
      ], { size: 420, cacheKey: this._currentArtworkCacheKey(player, queueItem) });
      const artBox = this.$("npArt");
      if (art && artBox?.querySelector("img")?.getAttribute("src") !== art) artBox.innerHTML = `<img src="${this._esc(art)}" alt="">`;
      else if (!art) artBox.innerHTML = this._artPlaceholderHtml("music_note");
      const vol = Math.round((player.attributes.volume_level || 0) * 100);
      const slider = this.$("volSlider");
      if (slider) {
        slider.value = vol;
        slider.style.setProperty("--vol-pct", `${vol}%`);
      }
      this._setButtonIcon(this.$("btnMute"), this._volumeIconName(player));
      const duration = this._getCurrentDuration();
      const position = this._getCurrentPosition();
      this.$("progressFill") && (this.$("progressFill").style.width = duration ? `${Math.min(100, (position / duration) * 100)}%` : "0%");
      const nowPlayingUri = String(player.attributes.media_content_id || "").trim() || String(this._getQueueItemUri(queueItem) || "").trim() || "";
      if (nowPlayingUri !== this._state.nowPlayingUri) {
        this._state.nowPlayingUri = nowPlayingUri;
        this._highlightNowPlaying();
      }
      this._renderPlayerSummary();
      this._syncBrandPlayingState();
      this._syncStatus();
      this._syncNowPlayingPageLive();
      if (this._state.screensaverOpen) this._syncScreensaverUi();
    }

    _syncNowPlayingPageLive() {
      if (this._state.view !== "now_playing") return;
      const player = this._getSelectedPlayer();
      if (!player) return;
      const title = player.attributes.media_title || this._i18n("ui.no_active_media");
      const artist = player.attributes.media_artist || this._i18n("ui.unknown");
      const album = player.attributes.media_album_name || "";
      const duration = this._getCurrentDuration();
      const position = this._getCurrentPosition();
      const pct = duration ? Math.min(100, (position / duration) * 100) : 0;
      const vol = Math.round((player.attributes.volume_level || 0) * 100);
      const queueItem = this._state.maQueueState?.current_item || null;
      const art = this._currentArtworkUrl(player, queueItem, 620, { preferPlayerArtwork: true });
      const repeat = player.attributes.repeat || "off";
      const bigPlay = this.$("bigPlayBtn");
      this._setButtonIcon(bigPlay, this._playPauseIconName(player));
      const bigShuffle = this.$("bigShuffleBtn");
      if (bigShuffle) bigShuffle.classList.toggle("active", !!player.attributes.shuffle);
      const bigRepeat = this.$("bigRepeatBtn");
      if (bigRepeat) {
        bigRepeat.classList.toggle("active", repeat !== "off");
        bigRepeat.dataset.repeatMode = repeat;
        bigRepeat.title = this._repeatModeLabel(repeat);
        bigRepeat.setAttribute("aria-label", this._repeatModeLabel(repeat));
      }
      this._setButtonIcon(bigRepeat, repeat === "one" ? "repeat_one" : "repeat");
      const bigMute = this.$("bigMuteBtn");
      this._setButtonIcon(bigMute, this._volumeIconName(player));
      const bigVolume = this.$("bigVolumeSlider");
      if (bigVolume) { bigVolume.value = vol; bigVolume.style.setProperty("--vol-pct", `${vol}%`); }
      const bigProgress = this.$("bigProgressFill");
      if (bigProgress) bigProgress.style.width = `${pct}%`;
      this.$("bigCurTime") && (this.$("bigCurTime").textContent = this._fmtDur(position));
      this.$("bigTotalTime") && (this.$("bigTotalTime").textContent = this._fmtDur(duration));
      const heroArt = this.$("nowHeroArt");
      if (heroArt) heroArt.innerHTML = art ? `<img src="${this._esc(art)}" alt="">` : this._artPlaceholderHtml("music_note");
      const trackTitle = this.shadowRoot.querySelector(".now-track-title");
      if (trackTitle) trackTitle.textContent = title;
      const trackSubtitle = this.shadowRoot.querySelector(".now-track-subtitle");
      if (trackSubtitle) trackSubtitle.textContent = [artist, album].filter(Boolean).join(" · ");
      this._syncImmersiveNowPlaying();
    }

    _syncBigVolumeMirror(pct) {
      const big = this.$("bigVolumeSlider");
      if (big) {
        big.value = pct;
        big.style.setProperty("--vol-pct", `${pct}%`);
      }
    }

    _highlightNowPlaying() {
      const nowUri = this._state.nowPlayingUri;
      const currentIndex = this._state.maQueueState?.current_index;
      this.shadowRoot.querySelectorAll(".media-card[data-uri], .track-row[data-uri], .mini-queue-item[data-uri]").forEach((el) => {
        const uriMatch = !!nowUri && el.dataset.uri === nowUri;
        el.classList.toggle("playing", uriMatch);
        if (el.classList.contains("mini-queue-item")) {
          const sortIndex = el.dataset.sortIndex !== undefined ? Number(el.dataset.sortIndex) : null;
          const indexMatch = currentIndex != null && sortIndex === currentIndex;
          el.classList.toggle("active", uriMatch || indexMatch);
        }
      });
    }

    _startLoops() {
      this._syncNowPlayingUI();
      clearInterval(this._pollTimer);
      clearInterval(this._progressTimer);
      this._pollTimer = setInterval(() => this._updateNowPlayingState(), 2000);
      this._progressTimer = setInterval(() => this._tickProgress(), 700);
    }

    _tickProgress() {
      this._syncSleepTimerState();
      this._syncScheduledStartState();
      this._syncNightModeUi();
      this._syncSleepTimerChip();
      if (this._lyricsSessionActive()) this._syncLyricsForCurrentTrack();
      if (this._state.screensaverOpen) {
        this._syncScreensaverUi();
        return;
      }
      const player = this._getSelectedPlayer();
      if (!player) return;
      const duration = this._getCurrentDuration();
      if (!duration) return;
      const position = this._getCurrentPosition();
      const pct = Math.min(100, (position / duration) * 100);
      this.$("progressFill") && (this.$("progressFill").style.width = `${pct}%`);
      this.$("bigProgressFill") && (this.$("bigProgressFill").style.width = `${pct}%`);
      this.$("bigCurTime") && (this.$("bigCurTime").textContent = this._fmtDur(position));
      this.$("bigTotalTime") && (this.$("bigTotalTime").textContent = this._fmtDur(duration));
    }

    async _updateNowPlayingState() {
      if (this._updateNowPlayingInFlight) {
        this._updateNowPlayingQueued = true;
        return;
      }
      this._updateNowPlayingInFlight = true;
      try {
        this._syncSleepTimerState();
        this._syncScheduledStartState();
        if (this._state.selectedPlayer && this._isDirectMaPlayer(this._state.selectedPlayer)) {
          await this._refreshDirectMaPlayers();
        }
        const player = this._getSelectedPlayer();
        if (!player) return;
        this._syncActivePlayerHelper(player);
        const previousQueueSignature = this._queueRenderSignature();
        await this._ensureQueueSnapshot();
        const nextQueueSignature = this._queueRenderSignature();
        this._refreshGroupingState();
        this._loadPlayers();
        this._syncNowPlayingUI();
        if (this._state.queueVisible) this._renderQueueItems();
        if (this._state.menuOpen && this._state.menuPage === "queue" && nextQueueSignature !== previousQueueSignature) this._renderMobileMenu();
        if (this._state.playerModalOpen) {
          if (this._state.modalMode === "transfer") this._openTransferQueuePicker(true);
          else this._renderPlayerModal();
        }
      } finally {
        this._updateNowPlayingInFlight = false;
        if (this._updateNowPlayingQueued && this.isConnected) {
          this._updateNowPlayingQueued = false;
          this._updateNowPlayingState().catch(() => {});
        }
      }
    }

    async _ensureQueueSnapshot(force = false) {
      const snapshotToken = ++this._queueSnapshotToken;
      const selectedEntityId = String(this._state.selectedPlayer || "");
      const isCurrentSnapshot = () => (
        snapshotToken === this._queueSnapshotToken
        && String(this._state.selectedPlayer || "") === selectedEntityId
      );
      const player = this._getSelectedPlayer();
      if (!player) return;
      const queueId = this._queueIdForPlayer(player);
      if (queueId && this._hasDirectMAConnection()) {
        try {
          const queueState = await this._callDirectMaCommand("player_queues/get", { queue_id: queueId });
          if (!isCurrentSnapshot()) return;
          let queueItems = [];
          if (force || !this._state.queueItems.length || this._isQueueUiVisible()) {
            const totalItems = Math.max(1, Number(queueState.items) || 0);
            const limit = Math.min(1000, Math.max(50, totalItems));
            const fullSnapshot = await this._callDirectMaCommand("player_queues/items", { queue_id: queueId, limit, offset: 0 });
            if (!isCurrentSnapshot()) return;
            const snapshotItems = Array.isArray(fullSnapshot?.items)
              ? fullSnapshot.items
              : (Array.isArray(fullSnapshot?.queue_items)
                ? fullSnapshot.queue_items
                : (Array.isArray(fullSnapshot) ? fullSnapshot : []));
            queueItems = snapshotItems.map((item, index) => this._normalizeQueueItem(item, index)).filter(Boolean);
          }
          if (!isCurrentSnapshot()) return;
          this._applyQueueSnapshot(queueState, queueItems, force);
          return;
        } catch (_) {}
      }

      try {
        const payload = { entity_id: player.entity_id, limit: 250 };
        if (queueId) payload.queue_id = queueId;
        const snapshot = await this._callService("get_queue", payload, { includeConfigEntryId: false });
        if (!isCurrentSnapshot()) return;
        const normalized = this._normalizeQueueSnapshot(snapshot, player.entity_id);
        const queueData = normalized?.items?.length ? normalized : await this._fetchMassQueueItemsSnapshot(player);
        if (!isCurrentSnapshot()) return;
        if (!queueData) return;
        this._applyQueueSnapshot(queueData.state, queueData.items, force);
      } catch (_) {
        const queueData = await this._fetchMassQueueItemsSnapshot(player);
        if (!isCurrentSnapshot()) return;
        if (!queueData) return;
        this._applyQueueSnapshot(queueData.state, queueData.items, force);
      }
    }

    _queueItemImageUrl(item, size = 120) {
      return this._imageUrl(item?.streamdetails?.stream_metadata?.image_url, size)
        || this._imageUrl(item?.local_image_encoded, size)
        || this._imageUrl(item?.local_image_url, size)
        || this._imageUrl(item?.local_image, size)
        || this._imageUrl(item?.media_image, size)
        || this._imageUrl(item?.media_image_url, size)
        || this._imageUrl(item?.image_url, size)
        || this._imageUrl(item?.image, size)
        || this._artUrl(item, { size })
        || this._artUrl(item?.media_item || item, { size })
        || this._imageUrl(item?.media_item?.image_url, size)
        || this._imageUrl(item?.media_item?.image, size)
        || this._imageUrl(item?.media_item?.metadata?.images, size)
        || this._imageUrl(item?.media_item?.album?.image_url, size)
        || this._imageUrl(item?.media_item?.album?.image, size)
        || this._imageUrl(item?.media_item?.album?.metadata?.images, size)
        || null;
    }

    _getAvailableGroupPlayers() {
      const current = this._state.selectedPlayer;
      return (this._state.players || [])
        .filter((p) => p.entity_id !== current)
        .filter((p) => !(typeof this._isLikelyBrowserPlayer === "function" && this._isLikelyBrowserPlayer(p)))
        .filter((p) => !(typeof this._isStaticGroupPlayer === "function" && this._isStaticGroupPlayer(p)));
    }

    _refreshGroupingState() {
      const player = this._getSelectedPlayer();
      if (!player) return;
      const attrs = player.attributes || {};
      const children = Array.isArray(attrs.group_members) ? attrs.group_members.filter((id) => id !== player.entity_id) : [];
      if (!this._state.pendingGroupSelections.length) this._state.pendingGroupSelections = [...children];
    }

    _openGroupModal() {
      this.shadowRoot.querySelector(".card")?.appendChild(this.$("groupModal"));
      const players = this._getAvailableGroupPlayers();
      const list = this.$("groupList");
      if (!list) return;
      const selected = this._getSelectedPlayer();
      const subtitle = this.$("groupModalSubtitle");
      const badge = this.$("groupCountBadge");
      if (subtitle) subtitle.textContent = selected?.attributes?.friendly_name || this._i18n("ui.choose_player");
      if (badge) badge.textContent = String(players.length);
      list.innerHTML = players.length ? players.map((p) => {
        const checked = (this._state.pendingGroupSelections || []).includes(p.entity_id);
        return `<label class="group-item ${checked ? "checked" : ""}"><span class="group-meta"><span class="group-name">${this._esc(p.attributes.friendly_name || p.entity_id)}<span class="group-item-toggle ${checked ? "checked" : ""}" aria-hidden="true">${this._iconSvg(checked ? "check" : "plus")}</span></span><span class="group-sub"></span></span><input type="checkbox" data-group-player="${this._esc(p.entity_id)}" ${checked ? "checked" : ""}></label>`;
      }).join("") : `<div class="state-box" style="min-height:80px;padding:8px 0;">${this._esc(this._i18n("ui.no_extra_ma_players"))}</div>`;
      this.$("groupModal").classList.add("open");
    }

    _closeGroupModal() { this.$("groupModal").classList.remove("open"); }

    _handleGroupChange(e) {
      const checkbox = e.target.closest("input[data-group-player]");
      if (!checkbox) return;
      const entityId = checkbox.dataset.groupPlayer;
      const next = new Set(this._state.pendingGroupSelections || []);
      if (checkbox.checked) next.add(entityId); else next.delete(entityId);
      this._state.pendingGroupSelections = Array.from(next);
      const groupItem = checkbox.closest(".group-item");
      groupItem?.classList.toggle("checked", checkbox.checked);
      const toggle = groupItem?.querySelector(".group-item-toggle");
      if (toggle) {
        toggle.classList.toggle("checked", checkbox.checked);
        toggle.innerHTML = this._iconSvg(checkbox.checked ? "check" : "plus");
      }
    }

    async _applySpeakerGroupFor(entityId, groupMembers = []) {
      const primaryId = String(entityId || "").trim();
      if (!primaryId) return false;
      const members = [...new Set((Array.isArray(groupMembers) ? groupMembers : [])
        .map((id) => String(id || "").trim())
        .filter((id) => id && id !== primaryId))];
      if (!members.length) return false;
      await this._callHaMediaPlayerService(primaryId, "join", { group_members: members });
      setTimeout(() => {
        this._loadPlayers();
        this._refreshGroupingState();
        if (this._state.menuOpen) this._renderMobileMenu();
        if (this._state.controlRoomOpen) this._syncControlRoomUi({ force: true });
      }, 650);
      return true;
    }

    async _applySpeakerGroup() {
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
        this._toastError(this._i18n("ui.select_at_least_two_players_to_create_a_group"));
        return false;
      }
      this._toastSuccess(this._i18n("ui.group_updated"));
      this._closeGroupModal();
      setTimeout(() => { this._refreshGroupingState(); if (this._state.view === "now_playing") this._renderNowPlayingPage(); }, 500);
      return true;
    }

    _clearLocalGroupState(entityId) {
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
      this._refreshGroupingState();
      this._syncNowPlayingUI();
      if (this._state.view === "now_playing") this._renderNowPlayingPage();
      if (this._state.menuOpen && this._state.menuPage === "group") this._renderMobileMenu().catch(() => {});
    }

    async _clearSpeakerGroupFor(entityId) {
      const player = this._playerByEntityId(entityId);
      if (!player) return;
      if (typeof this._isStaticGroupPlayer === "function" && this._isStaticGroupPlayer(player)) {
        const targets = this._playerGroupMemberIds(player)
          .filter((id) => id && id !== player.entity_id)
          .filter((id) => {
            const target = (this._state.players || []).find((p) => p.entity_id === id) || this._hass?.states?.[id];
            return target && !this._isStaticGroupPlayer(target);
        });
        if (targets.length) {
          await Promise.allSettled(targets.map((id) => this._callHaMediaPlayerService(id, "unjoin")));
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
      try {
        await this._callHaMediaPlayerService(player.entity_id, "unjoin");
      } catch (_) {}
      this._clearLocalGroupState(player.entity_id);
      setTimeout(() => {
        this._loadPlayers();
        this._refreshGroupingState();
        if (this._state.menuOpen) this._renderMobileMenu();
        if (this._state.view === "now_playing") this._renderNowPlayingPage();
      }, 500);
      return true;
    }

    async _clearSpeakerGroup() {
      const player = this._getSelectedPlayer();
      if (!player) return false;
      await this._clearSpeakerGroupFor(player.entity_id);
      this._toast(this._i18n("ui.group_cleared"));
      this._closeGroupModal();
      return true;
    }

    _toggleQueue() {
      if (this._isHotelMode()) return;
      if (this._state.queueVisible) this._hideQueue();
      else this._showQueue();
    }

    async _showQueue() {
      if (this._isHotelMode()) return;
      const player = this._getSelectedPlayer();
      if (!player) return;
      this._state.queueVisible = true;
      this._hideQueue();
      const panel = document.createElement("div");
      panel.className = "queue-panel";
      panel.id = "queuePanel";
      const art = this._currentArtworkUrl(player, this._state.maQueueState?.current_item || null, 180);
      panel.innerHTML = `
        <div class="queue-shell">
        <div class="queue-header">
          <div class="queue-art">${art ? `<img src="${this._esc(art)}" alt="">` : this._artPlaceholderHtml("music_note")}</div>
          <div class="queue-meta"><div class="queue-title">${this._esc(player.attributes.media_title || this._i18n("ui.queue"))}</div><div class="queue-sub" id="queueSub">${this._esc(player.attributes.media_artist || "")}</div></div>
          <button class="close-btn" id="queueClose">✕</button>
        </div>
        <div class="queue-scroll" id="queueScroll">${this._loadingStateHtml(this._i18n("ui.loading_queue"))}</div>
        </div>`;
      this.shadowRoot.querySelector(".card")?.appendChild(panel);
      panel.querySelector("#queueClose").addEventListener("click", () => this._hideQueue());
      panel.addEventListener("click", this._boundQueuePanelClick);
      panel.addEventListener("change", (e) => this._handleQueueMoveAutoChange(e));
      await this._renderQueueItems();
    }

    _renderQueueRowActions(item) {
      const key = this._getQueueItemKey(item);
      return `
        <div class="queue-actions">
          <button class="chip-btn" data-queue-action="up" data-queue-item-id="${this._esc(key)}">↑</button>
          <button class="chip-btn" data-queue-action="next" data-queue-item-id="${this._esc(key)}">⏭</button>
          <button class="chip-btn" data-queue-action="down" data-queue-item-id="${this._esc(key)}">↓</button>
          <button class="chip-btn warn" data-queue-action="remove" data-queue-item-id="${this._esc(key)}">✕</button>
        </div>`;
    }

    async _renderQueueItems() {
      const panel = this.shadowRoot.getElementById("queuePanel");
      if (!panel) return;
      const player = this._getSelectedPlayer();
      if (!player) return;
      const queueScroll = panel.querySelector("#queueScroll");
      const queueSub = panel.querySelector("#queueSub");
      try {
        await this._ensureQueueSnapshot(true);
        const queueState = this._state.maQueueState;
        if (!queueState) {
          queueScroll.innerHTML = `<div class="state-box">${this._esc(this._i18n("ui.queue_is_empty"))}</div>`;
          return;
        }
        const currentIndex = queueState.current_index ?? 0;
        const totalItems = queueState.items ?? 0;
        const queueItems = this._state.queueItems || [];
        queueSub.textContent = `${player.attributes.media_artist || ""}${player.attributes.media_artist ? " · " : ""}${totalItems} ${this._i18n("ui.items")}`;
        if (!Array.isArray(queueItems) || !queueItems.length) {
          queueScroll.innerHTML = `<div class="state-box">${this._esc(this._i18n("ui.queue_is_empty"))}</div>`;
          return;
        }
        queueScroll.innerHTML = queueItems.map((item, idx) => {
          const current = item.sort_index === currentIndex;
          const past = item.sort_index < currentIndex;
          const img = this._queueItemImageUrl(item, 120);
          const artist = item.media_item?.artists?.map((a) => a.name).join(", ") || "";
          const key = this._getQueueItemKey(item);
          const eager = current || idx < 24;
          return `
            <div class="queue-item ${current ? "active" : ""} ${past ? "past" : ""}" data-uri="${this._esc(item.media_item?.uri || "")}" data-type="track" data-queue-item-id="${this._esc(key)}" data-sort-index="${this._esc(item.sort_index ?? "")}">
              <div class="queue-num">${current ? "▶" : (item.sort_index ?? idx + 1)}</div>
              <div class="queue-thumb">${img ? this._imgHtml(img, "", { loading: eager ? "eager" : "lazy", fetchpriority: eager ? "high" : "low" }) : "♫"}</div>
              <div class="queue-item-meta">
                <div class="queue-name">${this._esc(item.media_item?.name || item.name || "")}</div>
                <div class="queue-artist">${this._esc(artist)}</div>
              </div>
              ${this._renderQueueRowActions(item)}
            </div>`;
        }).join("");
      } catch (e) {
        queueScroll.innerHTML = `<div class="state-box">${this._esc(e.message || String(e))}</div>`;
      }
    }

    _hideQueue() {
      this._state.queueVisible = false;
      this.shadowRoot.getElementById("queuePanel")?.remove();
    }

    _queueItemsAfterLocalAction(action, queueItemId, items = this._state.queueItems || [], targetPosition = null) {
      const allItems = [...(Array.isArray(items) ? items : [])];
      const targetKey = String(queueItemId || "").trim();
      const idx = allItems.findIndex((i) =>
        this._getQueueItemKey(i) === targetKey
        || this._getQueueItemStableId(i) === targetKey
        || this._getQueueItemUri(i) === targetKey
      );
      if (idx === -1) return null;
      const reordered = [...allItems];
      if (action === "remove") {
        reordered.splice(idx, 1);
        return this._queueItemsWithSequentialSortIndexes(reordered);
      }
      const firstMovableIdx = this._queueFirstMovableIndex(reordered);
      if (action === "up") {
        if (idx > firstMovableIdx) {
          [reordered[idx - 1], reordered[idx]] = [reordered[idx], reordered[idx - 1]];
          return this._queueItemsWithSequentialSortIndexes(reordered);
        }
        return null;
      }
      if (action === "down") {
        if (idx >= firstMovableIdx && idx < reordered.length - 1) {
          [reordered[idx + 1], reordered[idx]] = [reordered[idx], reordered[idx + 1]];
          return this._queueItemsWithSequentialSortIndexes(reordered);
        }
        return null;
      }
      if (action === "next") {
        const item = reordered[idx];
        const targetIdx = Math.max(0, firstMovableIdx);
        if (item && idx > targetIdx) {
          reordered.splice(idx, 1);
          reordered.splice(targetIdx, 0, item);
          return this._queueItemsWithSequentialSortIndexes(reordered);
        }
        return null;
      }
      if (action === "move_to") {
        const item = reordered[idx];
        const requestedPosition = Math.round(Number(targetPosition));
        if (!item || !Number.isFinite(requestedPosition)) return null;
        const targetIdx = this._queueMoveGlobalIndexForDisplayPosition(reordered, requestedPosition);
        if (targetIdx < 0) return null;
        if (idx === targetIdx) return reordered;
        reordered.splice(idx, 1);
        reordered.splice(Math.max(firstMovableIdx, Math.min(reordered.length, targetIdx)), 0, item);
        return this._queueItemsWithSequentialSortIndexes(reordered);
      }
      return null;
    }

    async _handleQueueAction(action, queueItemId, fallbackUri = "", sortIndex = "", targetPosition = null) {
      const player = this._getSelectedPlayer();
      if (!player || !queueItemId || this._state.queueActionPending) return;

      const allItems = [...(this._state.queueItems || [])];
      const targetItem = this._resolveQueueActionTarget(allItems, queueItemId, fallbackUri, sortIndex);
      const targetKey = targetItem ? this._getQueueItemKey(targetItem) : String(queueItemId || "").trim();
      const idx = targetItem ? allItems.indexOf(targetItem) : allItems.findIndex((i) => this._getQueueItemKey(i) === targetKey);
      if (idx === -1) return;

      try {
        this._setQueueBusy(true);
        const numericTargetPosition = Math.round(Number(targetPosition));
        const moveToIndex = action === "move_to" && Number.isFinite(numericTargetPosition) ? this._queueMoveGlobalIndexForDisplayPosition(allItems, numericTargetPosition) : null;
        const posShift = action === "move_to" && Number.isFinite(moveToIndex) && moveToIndex >= 0 ? moveToIndex - idx : null;
        const optimisticItems = this._queueItemsAfterLocalAction(action, targetKey, allItems, numericTargetPosition);
        const queueId = this._queueIdForPlayer(player);
        const massQueueServiceByAction = {
          up: "move_queue_item_up",
          down: "move_queue_item_down",
          next: "move_queue_item_next",
          remove: "remove_queue_item",
        };
        const serviceQueueItemId = targetItem
          ? String(targetItem.queue_service_id || (targetItem.queue_item_id_trusted !== false ? targetItem.queue_item_id : "") || this._getQueueItemPlaybackId(targetItem) || "").trim()
          : "";
        const numericSortIndex = HomeiiMediaQueueFoundation.normalizeFiniteNumber(targetItem?.sort_index ?? sortIndex);
        const directTarget = serviceQueueItemId || (action === "remove" && Number.isFinite(numericSortIndex) ? numericSortIndex : null);
        this._debugLog("info", "[Homeii Queue] action", {
          action,
          queueId,
          queueItemId,
          serviceQueueItemId,
          sortIndex: numericSortIndex,
          targetPosition: Number.isFinite(numericTargetPosition) ? numericTargetPosition : "",
          title: targetItem ? this._queueItemPrimaryTitle(targetItem) : "",
        });

        let acted = false;
        try {
          acted = await this._callDirectMaQueueAction(action, queueId, directTarget, posShift);
        } catch (error) {
          this._debugLog("warn", "[Homeii Queue] direct action failed", error);
        }
        if (!acted && serviceQueueItemId && massQueueServiceByAction[action]) {
          acted = await this._callMassQueueService(massQueueServiceByAction[action], serviceQueueItemId);
        }
        if (!acted && optimisticItems && this._config?.queue_rebuild_fallback === true) {
          await this._rebuildQueue(player.entity_id, optimisticItems, this._getCurrentPosition());
          acted = true;
        }
        if (!acted) {
          await this._ensureQueueSnapshot(true).catch(() => {});
          const message = serviceQueueItemId
            ? this._i18n("ui.queue_action_is_not_available_for_this_player")
            : this._i18n("ui.queue_item_id_is_not_ready_yet_refresh_the_queue_and_try_again");
          this._toast(message);
          return;
        }

        if (optimisticItems) {
          this._state.queueMutationPendingUntil = Date.now() + 4000;
          this._state.queueMutationExpectedSignature = this._queueOrderSignature(optimisticItems);
          this._state.queueItems = optimisticItems;
          if (this._state.menuOpen && this._state.menuPage === "queue") {
            await this._renderMobileMenu();
            this._setQueueBusy(true);
          }
          else this._syncNowPlayingUI();
        }
        await this._refreshQueueAfterMutation(220);
        this._refreshQueueAfterMutation(900).catch(() => {});
        this._refreshQueueAfterMutation(1800).catch(() => {});
      } catch (e) {
        this._toast(e?.message || this._i18n("ui.queue_action_failed"));
      } finally {
        this._setQueueBusy(false);
      }
    }

    async _clearQueueForPlayer(entityId) {
      if (this._isDirectMaPlayer(entityId)) {
        const queueId = this._directMaQueueId(entityId);
        if (queueId) {
          try {
            await this._callDirectMaCommand("player_queues/clear", { queue_id: queueId });
            this._refreshDirectMaPlayers().catch(() => {});
          } catch (_) {}
        }
        return;
      }
      try {
        await this._callHaMediaPlayerService(entityId, "clear_playlist");
      } catch (_) {}
      try {
        await this._callHaMediaPlayerService(entityId, "media_stop");
      } catch (_) {}
    }

    async _stopPlayer(entityId) {
      if (!entityId) return;
      if (this._isDirectMaPlayer(entityId)) {
        try {
          await this._callDirectMaPlayerCommand(entityId, "players/cmd/stop");
          this._refreshDirectMaPlayers().catch(() => {});
          return;
        } catch (_) {
          await this._clearQueueForPlayer(entityId);
          return;
        }
      }
      await this._callHaMediaPlayerService(entityId, "media_stop");
    }

    async _rebuildQueue(targetEntityId, orderedItems, seekPosition = 0) {
      const currentIndex = this._state.maQueueState?.current_index ?? 0;
      const currentItem = orderedItems.find((i) => (i.sort_index ?? -1) === currentIndex) || orderedItems[0];
      const currentArrayIndex = orderedItems.indexOf(currentItem);
      const itemsAfterCurrent = currentArrayIndex >= 0
        ? orderedItems.slice(currentArrayIndex + 1)
        : orderedItems.filter((i) => Number(i?.sort_index ?? -1) > Number(currentIndex));

      const currentUri = this._getQueueItemUri(currentItem);
      if (!currentUri) throw new Error(this._i18n("ui.no_queue_item_to_rebuild"));

      const uriList = [currentUri, ...itemsAfterCurrent.map((i) => this._getQueueItemUri(i)).filter(Boolean)];

      if (this._isDirectMaPlayer(targetEntityId)) {
        const queueId = this._directMaQueueId(targetEntityId);
        if (!queueId) throw new Error("Direct Music Assistant player is not ready");
        await this._clearQueueForPlayer(targetEntityId);
        try {
          await this._callDirectMaCommand("player_queues/play_media", {
            queue_id: queueId,
            media: uriList,
            option: "replace",
          });
        } catch (error) {
          await this._callDirectMaCommand("player_queues/play_media", {
            queue_id: queueId,
            media: currentUri,
            option: "replace",
          });
          const rest = uriList.slice(1);
          if (rest.length) {
            await this._callDirectMaCommand("player_queues/play_media", {
              queue_id: queueId,
              media: rest,
              option: "add",
            }).catch(async () => {
              for (const uri of rest) {
                await this._callDirectMaCommand("player_queues/play_media", {
                  queue_id: queueId,
                  media: uri,
                  option: "add",
                });
              }
            });
          }
        }
        if (seekPosition > 0) {
          setTimeout(() => {
            this._callDirectMaPlayerCommand(targetEntityId, "players/cmd/seek", {
              position: Math.floor(seekPosition),
            }).catch(() => {});
          }, 900);
        }
        this._refreshDirectMaPlayers().catch(() => {});
        return;
      }

      await this._clearQueueForPlayer(targetEntityId);

      await this._hass.callService("music_assistant", "play_media", {
        entity_id: targetEntityId,
        media_id: uriList,
        enqueue: "play",
      });

      if (seekPosition > 0) {
        setTimeout(() => {
          this._hass.callService("media_player", "media_seek", {
            entity_id: targetEntityId,
            seek_position: Math.floor(seekPosition),
          });
        }, 900);
      }
    }

    async _openTransferQueuePicker(refreshOnly = false) {
      this.shadowRoot.querySelector(".card")?.appendChild(this.$("playerModal"));
      this._state.modalMode = "transfer";
      this.$("playerModalTitle").textContent = this._i18n("ui.transfer_queue");
      this._setPlayerModalHeader("transfer");
      const player = this._getSelectedPlayer();
      if (!player) return;
      const others = (this._state.players || []).filter((p) => p.entity_id !== player.entity_id);
      const body = this.$("playerModalBody");
      if (!body) return;
      if (!others.length) {
        body.innerHTML = `<div class="modal-section"><div class="state-box" style="min-height:120px;">${this._esc(this._i18n("ui.no_target_players_available"))}</div></div>`;
        if (!refreshOnly) {
          this.$("playerModal").classList.add("open");
          this._state.playerModalOpen = true;
        }
        return;
      }
      body.innerHTML = `
        <div class="player-modal-grid">
          <div class="modal-section">
            <div class="modal-section-top">
              <div class="modal-section-title">${this._i18n("ui.choose_target_player")}</div>
              <div class="modal-section-badge">${others.length}</div>
            </div>
            <div class="player-list">
              ${others.map((p) => {
                const art = this._playerArtworkUrl(p, 120);
                return `
                  <button class="player-card ${p.state === "playing" ? "playing" : p.state === "paused" ? "paused" : "idle"}" data-transfer-player="${this._esc(p.entity_id)}">
                    <span class="player-card-dot"></span>
                    <span class="player-card-art">${art ? `<img src="${this._esc(art)}" alt="">` : this._artPlaceholderHtml("speaker")}</span>
                    <span class="player-card-meta">
                      <span class="player-card-top">
                        <span class="player-card-title">${this._esc(p.attributes?.friendly_name || p.entity_id)}</span>
                        <span class="player-card-badge">${this._esc(this._playerStateLabel(p))}</span>
                      </span>
                      <span class="player-card-sub">${this._esc(this._playerStateLabel(p))}</span>
                      <span class="player-card-track">${this._esc(p.attributes?.media_title || "—")}</span>
                    </span>
                  </button>`;
              }).join("")}
            </div>
          </div>
        </div>`;
      body.querySelectorAll("[data-transfer-player]").forEach((btn) => btn.addEventListener("click", async () => {
        await this._transferQueueTo(btn.dataset.transferPlayer);
        this._closePlayerModal();
      }));
      if (!refreshOnly) {
        this.$("playerModal").classList.add("open");
        this._state.playerModalOpen = true;
      }
    }

    async _transferQueueBetween(sourcePlayerEntityId, targetPlayerEntityId, options = {}) {
      const sourcePlayer = this._playerByEntityId(sourcePlayerEntityId);
      if (!sourcePlayer || !targetPlayerEntityId || sourcePlayer.entity_id === targetPlayerEntityId) return false;
      try {
        let items = [];
        let currentPos = 0;
        const usingSelectedSource = sourcePlayer.entity_id === this._state.selectedPlayer;
        if (usingSelectedSource) {
          await this._ensureQueueSnapshot(true);
          items = [...(this._state.queueItems || [])];
          currentPos = this._getCurrentPosition();
        }

        try {
          await this._callMusicAssistantTransferQueue(sourcePlayer.entity_id, targetPlayerEntityId);
        } catch (transferError) {
          if (!usingSelectedSource || !items.length) throw transferError;
          await this._rebuildQueue(targetPlayerEntityId, items, currentPos);
          try {
            await this._callHaMediaPlayerService(sourcePlayer.entity_id, "media_stop");
          } catch (_) {}
        }

        if (options.selectTarget !== false) this._selectPlayer(targetPlayerEntityId, true);
        if (!options.silent) this._toast(this._i18n("ui.queue_transferred"));
        setTimeout(() => this._ensureQueueSnapshot(true), 1200);
        return true;
      } catch (e) {
        if (!options.silent) this._toast(e?.message || this._i18n("ui.queue_action_failed"));
        return false;
      }
    }

    async _transferQueueTo(targetPlayerEntityId) {
      const sourcePlayer = this._getSelectedPlayer();
      if (!sourcePlayer || !targetPlayerEntityId) return;
      await this._transferQueueBetween(sourcePlayer.entity_id, targetPlayerEntityId);
    }

    _normalizeMediaItems(items = []) {
      return (Array.isArray(items) ? items : []).map((item) => this._normalizeMediaItem(item));
    }

    _normalizeMediaItem(item) {
      return HomeiiMediaPresentationFoundation.normalizeMediaItem(item, this._maArtworkBaseUrl());
    }

    _imageProxyUrl(path, provider = "", size = 300) {
      return HomeiiMediaPresentationFoundation.imageProxyUrl(path, provider, size, this._maArtworkBaseUrl());
    }

    _imageUrl(value, size = 300, seen = new Set(), depth = 0) {
      const raw = HomeiiMediaPresentationFoundation.imageUrl(value, size, {
        maUrl: this._maArtworkBaseUrl(),
        seen,
        depth,
      });
      return this._normalizeArtworkUrl(raw, { size });
    }

    _artUrl(item, options = {}) {
      const size = Number(options?.size || 300) || 300;
      const raw = HomeiiMediaPresentationFoundation.artUrl(item, this._maArtworkBaseUrl(), size);
      return this._normalizeArtworkUrl(raw, { size, cacheKey: options?.cacheKey || "" });
    }
    _artistName(item) { return HomeiiMediaPresentationFoundation.artistName(item); }
    _fmtDur(sec) {
      return HomeiiMediaPresentationFoundation.formatDuration(sec);
    }
    _esc(value) {
      return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    }

    _imgHtml(src = "", alt = "", options = {}) {
      const url = String(src || "").trim();
      if (!url) return "";
      const loading = options.loading || "lazy";
      const decoding = options.decoding || "async";
      const className = options.className ? ` class="${this._esc(options.className)}"` : "";
      const fetchPriority = options.fetchpriority || options.fetchPriority || "low";
      const fetchPriorityAttr = fetchPriority ? ` fetchpriority="${this._esc(fetchPriority)}"` : "";
      return `<img${className} src="${this._esc(url)}" alt="${this._esc(alt)}" loading="${this._esc(loading)}" decoding="${this._esc(decoding)}"${fetchPriorityAttr}>`;
    }

    _toast(message, variant = "info", options = {}) {
      if (this._state?.controlRoomOpen && options?.allowStudio !== true) return;
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
      wrap.classList.toggle("studio-toast", !!this._state.controlRoomOpen && !centered);
      if (centered) wrap.classList.add("center-toast");
      const el = document.createElement("div");
      el.className = `toast ${safeVariant}${centered ? " centered" : ""}`;
      const icon = safeVariant === "success" ? "✓" : safeVariant === "error" ? "×" : "i";
      el.innerHTML = `<span class="toast-icon">${icon}</span><span class="toast-text">${this._esc(text)}</span>`;
      wrap.appendChild(el);
      setTimeout(() => {
        el.remove();
        if (centered && !wrap.querySelector(".toast.centered")) wrap.classList.remove("center-toast");
      }, Number(options?.duration || 3300));
    }

    _toastSuccess(message, options = {}) {
      this._toast(message, "success", options);
    }

    _toastError(message, options = {}) {
      this._toast(message, "error", options);
    }

    _showSurprisePopup(item = {}) {
      const host = this.$("surprisePopup");
      if (!host) return;
      const playerName = this._selectedPlayerName();
      const art = this._artUrl(item) || item?.image || item?.media_item?.image || item?.media_item?.album?.image || "";
      const title = item?.name || this._i18n("ui.random_playlist");
      host.innerHTML = `
        <div class="surprise-popup-card">
          <div class="surprise-popup-player">${this._esc(playerName)}</div>
          <div class="surprise-popup-art">${art ? `<img src="${this._esc(art)}" alt="">` : this._iconSvg("wand")}</div>
          <div class="surprise-popup-title">${this._esc(title)}</div>
        </div>
      `;
      host.classList.add("open");
      clearTimeout(this._surprisePopupTimer);
      this._surprisePopupTimer = setTimeout(() => host.classList.remove("open"), 3200);
    }

    _hapticTap(pattern = 10) {
      try {
        if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
        if (typeof window !== "undefined" && window.matchMedia && !window.matchMedia("(pointer: coarse)").matches) return;
        navigator.vibrate(pattern);
      } catch (_) {}
    }

    _flashInteraction(el) {
      if (!el?.classList) return;
      this._hapticTap(12);
      el.classList.add("tap-feedback");
      setTimeout(() => {
        if (el?.classList) el.classList.remove("tap-feedback");
      }, 260);
    }

    _selectedPlayerName() {
      const player = this._getSelectedPlayer();
      return player?.attributes?.friendly_name || player?.entity_id || this._i18n("ui.choose_player");
    }

    _mediaFeedbackLabel(uri = "", fallback = "") {
      return HomeiiMediaHistoryFoundation.mediaFeedbackLabel(
        uri,
        fallback,
        this._state.queueItems || [],
        {
          getQueueItemUriFn: (item) => this._getQueueItemUri(item),
          defaultLabel: this._i18n("ui.media_2"),
        },
      );
    }

    _toastMediaQueued(label, targetName) {
      const mediaLabel = this._mediaFeedbackLabel("", label);
      const target = String(targetName || "").trim() || this._selectedPlayerName();
      const message = this._i18n("ui.media_selected_target", {
        media: mediaLabel,
        target,
      });
      this._toastSuccess(message);
    }

    _hydrateImages(rootOverride = null) {
      const root = rootOverride || this.$("content");
      if (!root) return;
      if (rootOverride) {
        root.querySelectorAll("[data-img]").forEach((el) => {
          const url = el.dataset.img;
          const placeholder = el.dataset.placeholder || "music_note";
          delete el.dataset.img;
          this._loadImgInto(url, el, placeholder);
        });
        return;
      }
      if (this._imgObserver && this._imgObserverRoot !== root) {
        this._imgObserver.disconnect();
        this._imgObserver = null;
        this._imgObserverRoot = null;
      }
      if (!this._imgObserver) {
        this._imgObserver = new IntersectionObserver((entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            const el = entry.target;
            this._imgObserver.unobserve(el);
            const url = el.dataset.img;
            const placeholder = el.dataset.placeholder || "💿";
            delete el.dataset.img;
            this._loadImgInto(url, el, placeholder);
          }
        }, { root, rootMargin: "120px" });
        this._imgObserverRoot = root;
      }
      root.querySelectorAll("[data-img]").forEach((el) => this._imgObserver.observe(el));
    }

    async _loadImgInto(url, el, fallback = "💿") {
      const supportedFallbacks = ["artist", "radio", "podcast", "music_note", "album", "playlist", "tracks", "speaker", "repeat"];
      const fallbackIcon = supportedFallbacks.includes(String(fallback || "")) ? fallback : (fallback === "🎤" ? "artist" : fallback === "📻" ? "radio" : "music_note");
      if (!url || !el?.isConnected) {
        if (el?.isConnected) el.innerHTML = `<div class="media-placeholder">${this._artPlaceholderHtml(fallbackIcon)}</div>`;
        return;
      }
      if (this._imageFailed.has(url)) {
        if (el.isConnected) el.innerHTML = `<div class="media-placeholder">${this._artPlaceholderHtml(fallbackIcon)}</div>`;
        return;
      }
      const existing = this._imageBlobCache.get(url);
      if (existing) {
        el.innerHTML = `<img src="${existing}" alt="">`;
        return;
      }
      try {
        const response = await fetch(url, { cache: "force-cache", credentials: "same-origin" });
        if (!response.ok) throw new Error(`Image load failed: ${response.status}`);
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        this._imageBlobCache.set(url, objectUrl);
        if (el.isConnected) el.innerHTML = `<img src="${objectUrl}" alt="">`;
      } catch (_) {
        this._imageFailed.add(url);
        if (el.isConnected) el.innerHTML = `<div class="media-placeholder">${this._artPlaceholderHtml(fallbackIcon)}</div>`;
      }
    }

    connectedCallback() {
      this._startResizeTracking();
      this._startScreensaverVisibilityTracking();
      this._markScreensaverPageEntry("connected");
      this._lastCardWidth = this._getCardWidth(this._lastCardWidth);
      this._lastCardHeight = this._getAllocatedCardHeight(this._lastCardHeight || this._configuredCardHeightFallback(0));
      this._scheduleLayoutRecovery("connected");
      this._adoptLocalSendspinGlobalSession();
      this._cancelLocalSendspinDisconnect();
      this._attachLocalSendspinLifecycleListeners();
      this._scheduleLocalSendspinReconnect("connected", 600);
    }

    disconnectedCallback() {
      clearInterval(this._pollTimer);
      clearInterval(this._progressTimer);
      clearTimeout(this._searchTimer);
      clearTimeout(this._nowPlayingSearchTimer);
      clearTimeout(this._volumeTimer);
      clearTimeout(this._bigVolumeTimer);
      clearTimeout(this._controlRoomVolumeTimer);
      clearTimeout(this._seekTimer);
      clearTimeout(this._resizeTimer);
      clearTimeout(this._layoutRecoveryTimer);
      if (this._layoutRecoveryFrame && typeof cancelAnimationFrame === "function") {
        cancelAnimationFrame(this._layoutRecoveryFrame);
        this._layoutRecoveryFrame = null;
      }
      clearTimeout(this._externalPlaybackSyncTimer);
      clearTimeout(this._systemMobileStatePersistTimer);
      clearTimeout(this._compactTransitionTimer);
      clearTimeout(this._mobileArtBrowseResetTimer);
      clearTimeout(this._surprisePopupTimer);
      clearTimeout(this._simpleWizardPopupTimer);
      clearTimeout(this._maReconnectTimer);
      clearTimeout(this._voiceAssistantDialogCloseTimer);
      clearTimeout(this._screensaverTimer);
      clearTimeout(this._screensaverExitTimer);
      clearInterval(this._screensaverClockTimer);
      this._screensaverTimer = null;
      this._screensaverExitTimer = null;
      this._screensaverClockTimer = null;
      this._state.screensaverOpen = false;
      this.classList.remove("compact-popup-open", "compact-window-popup-open", "compact-inline-popup-open", "compact-tile-open", "screensaver-page-open", "volume-preset-open");
      this._stopVoiceAssistantRecognition();
      this._state.voiceAssistantDialogOpen = false;
      this._state.voiceAssistantKeepScreensaver = false;
      this._clearManualFrontPlayer({ sync: false });
      try { this._voiceRecognition?.abort?.(); } catch {}
      this._voiceRecognition = null;
      this._stopScreensaverVisibilityTracking();
      this._maReconnectTimer = null;
      clearInterval(this._mobileSmartVoiceTimer);
      this._mobileSmartVoiceTimer = null;
      if (this._imgObserver) {
        this._imgObserver.disconnect();
        this._imgObserver = null;
      }
      if (this._ws) {
        this._rejectWsPending(new Error("MA WS disconnected"));
        try { this._ws.onclose = null; this._ws.close(); } catch (_) {}
        this._ws = null;
      } else {
        this._rejectWsPending(new Error("MA WS disconnected"));
      }
      if (this._ctxMenu) {
        this._ctxMenu.remove();
        this._ctxMenu = null;
      }
      const keepLocalSendspinAlive = this._isLocalSendspinDesired();
      this._syncLocalSendspinGlobalSession();
      if (keepLocalSendspinAlive) {
        const session = this._localSendspinGlobalSession();
        if (session && !session.controller) session.controller = this;
      } else {
        this._detachLocalSendspinLifecycleListeners();
        this._scheduleLocalSendspinStop("shutdown", 5 * 60 * 1000);
      }
      document.removeEventListener("click", this._boundDocClick);
      this._stopResizeTracking();
      this._imageBlobCache.forEach((url) => {
        try { URL.revokeObjectURL(url); } catch (_) {}
      });
      this._imageBlobCache.clear();
      this._imageFailed.clear();
    }
  };
}
