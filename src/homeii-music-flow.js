import { syncScreenDock } from "./core/media/screen-dock.js";
import { playerVolumeControlsHtml } from "./core/media/player-volume.js";
import { bindQueueDrag } from "./core/media/queue-drag.js";
import { renderAiRadio } from "./core/media/ai-radio.js";
import { playerChoiceHtml } from "./core/media/player-choice.js";
import { actionIconSvg, actionMenuHtml, mediaActionSheetHtml, handleMediaActionClick } from "./core/media/action-menu.js";
import { immersivePlayerEnabled, immersivePlayerStage, bindImmersivePlayer, syncImmersivePlayer, commitImmersiveSwipe, reconcileImmersiveCovers } from "./core/media/immersive-player.js";
import { loadQueueSettings, saveQueueSettings, updateQueueSettingVisibility } from "./core/media/queue-settings.js";
import { queuePlaybackOptionsHtml, toggleQueueAutoplay, toggleQueueCrossfade, setPlaybackSpeed } from "./core/media/queue-options.js";
import { loadDiscoverySections, discoveryPlayerFocusHtml, updateDiscoveryMenuBody, discoveryMenuHtml } from "./core/media/discovery.js";
import {
  LANGUAGE_OPTIONS as HOMEII_LANGUAGE_OPTIONS,
  detectLanguage as homeiiDetectLanguage,
  isRtlLanguage as homeiiIsRtlLanguage,
  translate as homeiiTranslate,
  translateText as homeiiTranslateText,
} from "./localization/index.js";
import HomeiiEmblaCarousel from "./vendor/embla-carousel.js";
import { buildCardStyles } from "./core/theme/card-styles.js";
import {
  detectEditorHebrew as homeiiDetectEditorHebrew,
  isHebrewLanguageTag as homeiiIsHebrewLanguageTag,
  pickEditorLanguageCandidate as homeiiPickEditorLanguageCandidate,
} from "./core/editor-locale.js";
import {
  assertBooleanIfDefined as homeiiAssertBooleanIfDefined,
  assertNumberIfDefined as homeiiAssertNumberIfDefined,
  assertStringArrayIfDefined as homeiiAssertStringArrayIfDefined,
  assertStringArrayValuesIfDefined as homeiiAssertStringArrayValuesIfDefined,
  assertStringIfDefined as homeiiAssertStringIfDefined,
  assertValueInList as homeiiAssertValueInList,
  validateBaseCardEditorConfig as homeiiValidateBaseCardEditorConfig,
  validateMobileCardEditorConfig as homeiiValidateMobileCardEditorConfig,
} from "./config/validators.js";
import {
  configureHomeiiEditorForms,
  getBaseCardConfigForm as getBaseCardConfigFormSource,
  getMobileCardConfigForm as getMobileCardConfigFormSource,
  getRadioBrowserCountrySelectorOptions as getRadioBrowserCountrySelectorOptionsSource,
} from "./config/editor-forms.js";
import {
  createHomeiiBaseMusicEditor,
} from "./config/editor-element.js";
import { createHomeiiBaseMusicCard } from "./core/base-music-card.js";
import {
  createBaseBrowserState as homeiiCreateBaseBrowserState,
} from "./core/state/defaults.js";
import {
  backgroundMotionAmount as homeiiBackgroundMotionAmount,
  backgroundMotionEnabled as homeiiBackgroundMotionEnabled,
  isCompactTileMode as homeiiIsCompactTileMode,
  mobileBackgroundMotionMode as homeiiMobileBackgroundMotionMode,
  mobileCompactEdgeToEdgeEnabled as homeiiMobileCompactEdgeToEdgeEnabled,
  mobileCompactModeEnabled as homeiiMobileCompactModeEnabled,
  mobileCompactWidgetMode as homeiiMobileCompactWidgetMode,
  mobileDynamicThemeMode as homeiiMobileDynamicThemeMode,
  maxDecodedArtworkCache as homeiiMaxDecodedArtworkCache,
  mobileShowUpNextEnabled as homeiiMobileShowUpNextEnabled,
  normalizeSettingsSource as homeiiNormalizeSettingsSource,
  performanceModeEnabled as homeiiPerformanceModeEnabled,
  performanceProfile as homeiiPerformanceProfile,
  performanceUltraLiteEnabled as homeiiPerformanceUltraLiteEnabled,
  usesVisualSettings as homeiiUsesVisualSettings,
} from "./core/state/derived.js";
import * as HomeiiMobileSettingsFoundationSource from "./core/state/mobile-settings.js";
import * as HomeiiResponsiveFoundationSource from "./core/layout/responsive.js";
import * as HomeiiPaletteFoundationSource from "./core/theme/palette.js";
import * as HomeiiNightFoundationSource from "./core/state/night-mode.js";
import * as HomeiiPlayersFoundationSource from "./core/state/players.js";
import * as HomeiiMediaQueueFoundationSource from "./core/state/media-queue.js";
import * as HomeiiFavoritesFoundationSource from "./core/state/favorites.js";
import * as HomeiiArtworkFoundationSource from "./core/media/artwork.js";
import * as HomeiiCardIdFoundationSource from "./core/state/card-id.js";
import * as HomeiiNowPlayingFoundationSource from "./core/media/now-playing.js";
import * as HomeiiMediaPresentationFoundationSource from "./core/media/presentation.js";
import * as HomeiiMediaHistoryFoundationSource from "./core/media/history.js";
import * as HomeiiEngineFoundationSource from "./core/engine-client.js";
import * as HomeiiRevisionedSnapshotsFoundationSource from "./core/state/revisioned-snapshots.js";
import * as HomeiiVoiceMatchingFoundation from "./core/voice-assistant-matching.js";
import {
  countryFlagEmoji as homeiiCountryFlagEmoji,
  radioBrowserCountryLabel as homeiiRadioBrowserCountryLabel,
  radioBrowserCountrySelectorOptions as homeiiRadioBrowserCountrySelectorOptions,
} from "./core/radio-browser-countries.js";

const HOMEII_VISIBLE_LANGUAGE_OPTIONS = Object.freeze([
  ...HOMEII_LANGUAGE_OPTIONS,
  ...[
    { value: "es", label: "Spanish" },
    { value: "fr", label: "French" },
    { value: "lt", label: "Lithuanian" },
  ].filter((option) => !HOMEII_LANGUAGE_OPTIONS.some((entry) => String(entry?.value || "").toLowerCase() === option.value)),
]);

function ensureHaEditorComponents() {
  try {
    if (
      !customElements.get("ha-form")
      || !customElements.get("hui-card-features-editor")
    ) {
      customElements.get("hui-tile-card")?.getConfigElement?.();
    }
    if (!customElements.get("ha-entity-picker")) {
      customElements.get("hui-entities-card")?.getConfigElement?.();
    }
    if (!customElements.get("ha-card-conditions-editor")) {
      customElements.get("hui-conditional-card")?.getConfigElement?.();
    }
  } catch (_) {}
}

const HOMEII_CARD_VERSION = "6.0.0-beta.1";
const HOMEII_BROWSER_EDITOR_TAG = "homeii-music-flow-browser-editor-v6001";
const HOMEII_MOBILE_EDITOR_TAG = "homeii-music-flow-editor-v6001";
const AMBIENT_LIGHT_PAIR_PLAYER_PREFIX = "__homeii_ambient_light_pair_player_";
const AMBIENT_LIGHT_PAIR_LIGHTS_PREFIX = "__homeii_ambient_light_pair_lights_";

const HomeiiEditorLocale = Object.freeze({
  isHebrewLanguageTag: homeiiIsHebrewLanguageTag,
  pickEditorLanguageCandidate: homeiiPickEditorLanguageCandidate,
  detectEditorHebrew: homeiiDetectEditorHebrew,
});

const HomeiiRevisionedSnapshotsFoundation = Object.freeze({
  ...HomeiiRevisionedSnapshotsFoundationSource,
});

function homeiiEditorI18n(key, params = {}, fallback = "") {
  const language = HomeiiEditorLocale.detectEditorHebrew() ? "he" : "en";
  return homeiiTranslate(language, key, params, fallback);
}

function homeiiEditorSchemaName(schema = {}) {
  if (typeof schema === "string") return schema;
  if (Array.isArray(schema)) return String(schema[schema.length - 1] || schema.join(".") || "");
  if (schema && typeof schema === "object") {
    return String(schema.name || schema.key || schema.path || "");
  }
  return "";
}

function homeiiHumanizeEditorName(name = "") {
  const text = String(name || "").trim().replace(/_/g, " ").replace(/\s+/g, " ");
  if (!text) return "";
  return text.replace(/\b[a-z]/g, (match) => match.toUpperCase());
}

function homeiiEditorLabelFor(schema = {}, labels = {}) {
  const name = homeiiEditorSchemaName(schema);
  return labels?.[name] || schema?.label || schema?.title || homeiiHumanizeEditorName(name);
}

function homeiiEditorHelperFor(schema = {}, helpers = {}) {
  const name = homeiiEditorSchemaName(schema);
  return helpers?.[name] || schema?.helper || "";
}

const HomeiiConfigValidators = Object.freeze({
  assertStringIfDefined: homeiiAssertStringIfDefined,
  assertBooleanIfDefined: homeiiAssertBooleanIfDefined,
  assertNumberIfDefined: homeiiAssertNumberIfDefined,
  assertStringArrayIfDefined: homeiiAssertStringArrayIfDefined,
  assertValueInList: homeiiAssertValueInList,
  assertStringArrayValuesIfDefined: homeiiAssertStringArrayValuesIfDefined,
  validateBaseCardEditorConfig: homeiiValidateBaseCardEditorConfig,
  validateMobileCardEditorConfig: homeiiValidateMobileCardEditorConfig,
});

const HomeiiStateFoundation = Object.freeze({
  createBaseBrowserState: homeiiCreateBaseBrowserState,
  normalizeSettingsSource: homeiiNormalizeSettingsSource,
  usesVisualSettings: homeiiUsesVisualSettings,
  mobileCompactModeEnabled: homeiiMobileCompactModeEnabled,
  mobileCompactEdgeToEdgeEnabled: homeiiMobileCompactEdgeToEdgeEnabled,
  mobileCompactWidgetMode: homeiiMobileCompactWidgetMode,
  mobileShowUpNextEnabled: homeiiMobileShowUpNextEnabled,
  performanceProfile: homeiiPerformanceProfile,
  performanceModeEnabled: homeiiPerformanceModeEnabled,
  performanceUltraLiteEnabled: homeiiPerformanceUltraLiteEnabled,
  mobileDynamicThemeMode: homeiiMobileDynamicThemeMode,
  mobileBackgroundMotionMode: homeiiMobileBackgroundMotionMode,
  backgroundMotionEnabled: homeiiBackgroundMotionEnabled,
  backgroundMotionAmount: homeiiBackgroundMotionAmount,
  isCompactTileMode: homeiiIsCompactTileMode,
});

const HomeiiMobileSettingsFoundation = Object.freeze({
  ...HomeiiMobileSettingsFoundationSource,
});

const HomeiiResponsiveFoundation = Object.freeze({
  ...HomeiiResponsiveFoundationSource,
});

const HomeiiPaletteFoundation = Object.freeze({
  ...HomeiiPaletteFoundationSource,
});

const HomeiiNightFoundation = Object.freeze({
  ...HomeiiNightFoundationSource,
});

const HomeiiMediaQueueFoundation = Object.freeze({
  ...HomeiiMediaQueueFoundationSource,
});

const HomeiiFavoritesFoundation = Object.freeze({
  ...HomeiiFavoritesFoundationSource,
});

const HomeiiPlayersFoundation = Object.freeze({
  ...HomeiiPlayersFoundationSource,
});

const HomeiiMediaPresentationFoundation = Object.freeze({
  ...HomeiiMediaPresentationFoundationSource,
});

const HomeiiMediaHistoryFoundation = Object.freeze({
  ...HomeiiMediaHistoryFoundationSource,
});

const HomeiiArtworkFoundation = Object.freeze({
  ...HomeiiArtworkFoundationSource,
});

const HomeiiNowPlayingFoundation = Object.freeze({
  ...HomeiiNowPlayingFoundationSource,
});

const HomeiiCardIdFoundation = Object.freeze({
  ...HomeiiCardIdFoundationSource,
});

const HomeiiEngineFoundation = Object.freeze({
  ...HomeiiEngineFoundationSource,
});

configureHomeiiEditorForms({
  homeiiEditorI18n,
  homeiiEditorLabelFor,
  homeiiEditorHelperFor,
  detectEditorHebrew: HomeiiEditorLocale.detectEditorHebrew,
  visibleLanguageOptions: HOMEII_VISIBLE_LANGUAGE_OPTIONS,
  radioBrowserCountrySelectorOptions: homeiiRadioBrowserCountrySelectorOptions,
});

function getBaseCardConfigForm() {
  return getBaseCardConfigFormSource();
}

function getRadioBrowserCountrySelectorOptions(translateFn = homeiiEditorI18n, language = "") {
  return getRadioBrowserCountrySelectorOptionsSource(translateFn, language);
}

function getMobileCardConfigForm() {
  return getMobileCardConfigFormSource();
}

const HomeiiBaseMusicCard = createHomeiiBaseMusicCard({
  HOMEII_CARD_VERSION,
  HOMEII_VISIBLE_LANGUAGE_OPTIONS,
  HomeiiStateFoundation,
  HomeiiConfigValidators,
  HomeiiCardIdFoundation,
  HomeiiResponsiveFoundation,
  HomeiiMediaQueueFoundation,
  HomeiiMediaPresentationFoundation,
  HomeiiMediaHistoryFoundation,
  HomeiiNowPlayingFoundation,
  HomeiiFavoritesFoundation,
  HomeiiPlayersFoundation,
  HomeiiRevisionedSnapshotsFoundation,
  getBaseCardConfigForm,
  getRadioBrowserCountrySelectorOptions,
  homeiiRadioBrowserCountryLabel,
  homeiiCountryFlagEmoji,
  homeiiDetectLanguage,
  homeiiIsRtlLanguage,
  homeiiTranslate,
  homeiiTranslateText,
});

const HomeiiBaseMusicEditor = createHomeiiBaseMusicEditor({
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
});

if (!customElements.get(HOMEII_BROWSER_EDITOR_TAG)) {
  customElements.define(HOMEII_BROWSER_EDITOR_TAG, HomeiiBaseMusicEditor);
}

if (!Array.isArray(window.customCards)) window.customCards = [];

class HomeiiMusicFlowBaseCard extends HomeiiBaseMusicCard {
  constructor() {
    super();
    this._editMode = false;
    this._state.menuOpen = false;
    this._state.menuPage = "main";
    this._state.menuStack = [];
    this._state.mediaQuery = "";
    this._state.libraryTabSearchQueries = {};
    this._state.libraryTabSearchDrafts = {};
    this._state.libraryTabSearchOpen = false;
    this._state.libraryTabSearchFocusId = "";
    this._state.mobileMediaLayout = this._defaultMobileMediaLayout();
    this._state.mobileMediaDetailLayout = "grid";
    this._state.mobileLibrarySort = "name_asc";
    this._state.mediaSearchToken = 0;
    this._state.mobileQueueActionEntry = null;
    this._state.mobileCustomColor = "#f5a623";
    this._state.mobileDynamicThemeMode = "auto";
    this._state.mobileCustomTextTone = "light";
    this._state.hotelMode = false;
    this._state.mobileFontScale = 1;
    this._state.mobileIconScale = 1;
    this._state.mobileNightMode = "off";
    this._state.mobileNightModeStart = "22:00";
    this._state.mobileNightModeEnd = "06:00";
    this._state.mobileNightModeDays = [0, 1, 2, 3, 4, 5, 6];
    this._state.mobileSleepTimerEndsAt = 0;
    this._state.mobileSleepTimerPlayer = "";
    this._state.mobileSleepTimerOrigin = "";
    this._state.mobileSleepTimerMenuOpen = false;
    this._state.mobileStartTimerEnabled = false;
    this._state.mobileStartTimerTime = "07:00";
    this._state.mobileStartTimerPlayer = "";
    this._state.mobileStartTimerPlaylist = "";
    this._state.mobileStartTimerPlaylistName = "";
    this._state.mobileStartTimerPlaylists = [];
    this._state.mobileStartTimerPlaylistsFetchedAt = 0;
    this._state.mobileStartTimerPlaylistsLoading = false;
    this._state.mobileStartTimerVolume = 35;
    this._state.mobileStartTimerDays = [0, 1, 2, 3, 4, 5, 6];
    this._state.mobileStartTimerLastRunKey = "";
    this._state.mobileStartTimerRunPending = false;
    this._state.mobileStartSchedules = [];
    this._state.mobileStartScheduleEditId = "";
    this._state.mobileStartTimerAfterRun = "keep";
    this._state.mobileSchedulesTab = "timers";
    this._state.mobileScheduleControlActiveUntil = 0;
    this._state.localSendspinDisconnecting = false;
    this._state.controlRoomRevealThisDevicePending = false;
    this._state.mobileLyricsSyncEnabled = true;
    this._state.mobileLyricsSyncOffsetMs = 0;
    this._state.mobileLyricsFontScale = 1;
    this._state.mobileCompactMode = false;
    this._state.mobileCompactWidgetMode = "auto";
    this._state.mobileCompactEdgeToEdge = true;
    this._state.mobileEdgeToEdge = false;
    this._state.mobileEdgeReturnAvailable = false;
    this._state.mobileLayoutMode = "auto";
    this._state.mobileCoverFlow = false;
    this._state.mobileQueueFlow = true;
    this._state.mobileQueueFlowQuickOpen = false;
    this._state.mobileLibraryFlowPage = "";
    this._state.mobileLibraryDefaultLayout = this._defaultMobileMediaLayout();
    this._state.mobileMediaLayoutManual = false;
    this._state.mobileShowUpNext = false;
    this._state.mobileRecentHistory = [];
    this._state.mobileRecommendationPlaylists = [];
    this._state.mobileRecommendationPlaylistsFetchedAt = 0;
    this._state.mobileHistoryRenderedHtml = "";
    this._state.mobileCurrentHistoryEntry = null;
    this._state.mobileHistoryDrawerOpen = false;
    this._state.mobileHistoryDrawerTab = "recent";
    this._state.mobileSettingsScrollTop = 0;
    this._state.diagnosticsStatus = "idle";
    this._state.diagnosticsItems = [];
    this._state.diagnosticsRunAt = 0;
    this._state.engineStatus = "unknown";
    this._state.engineAvailable = false;
    this._state.engineVersion = "";
    this._state.engineCapabilities = {};
    this._state.engineContext = null;
    this._state.engineInstanceId = "";
    this._state.engineProfileId = "";
    this._state.engineLastChecked = 0;
    this._state.engineLastError = "";
    this._state.engineLastGoodAt = 0;
    this._state.engineConsecutiveFailures = 0;
    this._state.controlRoomRestoreAfterMenu = false;
    this._state.controlRoomRenderedHtml = "";
    this._state.controlRoomRenderSignature = "";
    this._state.controlRoomQueueSnapshots = {};
    this._state.controlRoomQueueLoading = false;
    this._state.controlRoomRecentItems = [];
    this._state.controlRoomRecentLoading = false;
    this._state.controlRoomFavoritesItems = [];
    this._state.controlRoomFavoritesLoading = false;
    this._state.controlRoomSmartQuery = "";
    this._state.controlRoomAnnouncementText = "";
    this._state.controlRoomAnnouncementVolume = 20;
    this._state.controlRoomCustomScenes = [];
    this._state.controlRoomSceneName = "";
    this._state.mobileCompactExpanded = false;
    this._state.mobileFooterSearchEnabled = false;
    this._state.mobileStudioShortcutEnabled = true;
    this._state.mobileFooterMode = "icon";
    this._state.mobileHomeShortcutEnabled = false;
    this._state.mobileHomeShortcutPath = "/";
    this._state.mobileVolumeMode = "button";
    this._state.mobileVolumeStepButtonsEnabled = false;
    this._state.mobileVolumeStepPercent = 5;
    this._state.mobileMicMode = "smart";
    this._state.voiceAssistantEnabled = false;
    this._state.voiceAssistantMode = "hybrid";
    this._state.voiceAssistantAgentId = "";
    this._state.voiceAssistantSpeakFeedback = false;
    this._state.voiceAssistantListening = false;
    this._state.voiceAssistantDialogOpen = false;
    this._state.voiceAssistantDialogStatus = "";
    this._state.voiceAssistantTranscript = "";
    this._state.voiceAssistantResponse = "";
    this._state.voiceAssistantKeepScreensaver = false;
    this._state.mobileLibraryTabs = ["library_search", "library_liked", "library_playlists", "library_artists", "library_albums", "library_tracks", "library_radio", "library_podcasts"];
    this._state.mobileLibraryFavoritesOnlyTabs = [];
    this._state.mobileMainBarItems = ["actions", "players", "library", "settings"];
    this._state.mobileQuickActions = ["timer", "like", "lyrics", "queue", "queue_flow", "radio", "history"];
    this._state.mobileLikedMode = "ma";
    this._state.mobileSwipeMode = "browse";
    this._state.mobileRadioSourceMode = "combined";
    this._state.mobileRadioBrowserCountry = "all";
    this._state.mobileRadioBrowseCountry = "";
    this._state.mobileRadioBrowseCountryName = "";
    this._state.mobileAnnouncementText = "";
    this._state.mobileAnnouncementPresets = this._defaultAnnouncementPresets();
    this._state.mobileAnnouncementVolume = 20;
    this._state.mobileAnnouncementTtsEntity = "";
    this._state.mobileAnnouncementTtsLanguage = "auto";
    this._state.ambientLightEnabled = false;
    this._state.ambientLightEntities = [];
    this._state.ambientLightPlayerMap = [];
    this._state.ambientLightBrightness = 35;
    this._state.ambientLightTransition = 3;
    this._state.ambientLightCooldown = 8;
    this._state.screensaverEnabled = false;
    this._state.screensaverAutoLyricsWhenPlaying = false;
    this._state.screensaverControlsEnabled = false;
    this._state.screensaverControlButtons = ["previous", "next"];
    this._state.screensaverClockMode = "digital";
    this._state.screensaverTimeoutSeconds = 90;
    this._state.screensaverMessage = "";
    this._state.screensaverClockSize = 1;
    this._state.screensaverClockX = 82;
    this._state.screensaverClockY = 24;
    this._state.screensaverOpen = false;
    this._state.powerButtonEnabled = false;
    this._state.powerButtonName = "";
    this._state.powerButtonIcon = "power";
    this._state.powerButtonAction = "stop_player";
    this._state.powerButtonEntity = "";
    this._state.auxiliaryButtons = [];
    this._state.discoveryModeEnabled = true;
    this._state.discoveryCategoryKey = "pop";
    this._state.discoveryGenreKey = "all";
    this._state.discoveryExpandedUri = "";
    this._state.discoverySessionSeed = Date.now();
    this._state.pinnedPlayerEntities = [];
    this._state.excludedPlayerEntities = [];
    this._state.configurableMusicAssistantPlayers = [];
    this._state.playerSortMode = "default";
    this._state.playerOrderEntities = [];
    this._state.mobileArtBrowseOffset = 0;
    this._state.mobileArtAnchorKey = "";
    this._state.activeArtworkTouch = null;
    this._state.mobileCoverFlowWheelAt = 0;
    this._state.mobileArtBrowseOffset = 0;
    this._state.mobileArtBrowseAnchorIndex = -1;
    this._state.mobileArtRenderKey = "";
    this._state.mobileQueuePlayPendingUntil = 0;
    this._state.mobileQueuePlayPendingKey = "";
    this._state.mobileQueuePlayPendingIndex = null;
    this._state.mobileQueuePlayPendingUri = "";
    this._state.mobileQueuePlayPendingPlayerId = "";
    this._mobileEmbla = null;
    this._mobileEmblaLoadPromise = null;
    this._mobileEmblaSyncing = false;
    this._systemMobileStateHydrateKey = "";
    this._systemMobileStateHydratePromise = null;
    this._systemMobileStatePersistTimer = null;
    this._mobileArtBrowseResetTimer = null;
    this._emptyPlaybackLoaderTimer = null;
    this._mobileSmartVoiceTimer = null;
    this._libraryTabSearchTimer = null;
    this._simpleWizardPopupTimer = null;
    this._simpleWizardToken = 0;
    this._mobileDynamicThemePaletteCache = new Map();
    this._mobileDynamicThemeToken = 0;
    this._mobileDynamicThemeAppliedSignature = "";
    this._decodedArtworkUrls = new Set();
    this._decodedArtworkImages = new Map();
    this._artworkDecodePromises = new Map();
    this._artworkPrefetchQueue = [];
    this._artworkPrefetchQueuedUrls = new Set();
    this._artworkPrefetchActive = 0;
    this._artworkPrefetchTimer = null;
    this._mobileQueueArtworkPrefetchTimer = null;
    this._queueVirtualStart = 0;
    this._mediaVirtualStarts = new Map();
    this._virtualExpandPending = false;
    this._libraryDetailPrefetches = new Map();
    this._performanceMetrics = {
      menuRenders: 0,
      lastMenuRenderMs: 0,
      slowestMenuRenderMs: 0,
      lastMenuPage: "",
      lastMenuDomNodes: 0,
    };
    this._currentArtworkBackgroundToken = 0;
    this._backgroundCrossfadeTimers = new WeakMap();
    this._menuDetailThemeToken = 0;
    this._ambientLightLastSignature = "";
    this._ambientLightLastCallAt = 0;
    this._ambientLightLastBrightness = null;
    this._screensaverTimer = null;
    this._screensaverClockTimer = null;
    this._screensaverSuppressUntil = 0;
    this._screensaverLyricsInactiveSince = 0;
    this._state.mobileSmartVoice = null;
    this._state.simpleWizard = null;
    this._boundMobileMenuClick = this._handleMobileMenuClick.bind(this);
    this._boundMobileMenuChange = this._handleMobileMenuChange.bind(this);
    this._boundMobileMenuKeydown = this._handleMobileMenuKeydown.bind(this);
    this._boundMobileMenuScroll = this._handleMobileMenuScroll.bind(this);
    this._boundMobileMenuPointerDown = this._handleMobileMenuPointerDown.bind(this);
    this._boundMobileMediaInput = this._handleMobileMediaInput.bind(this);
    this._boundScreensaverActivity = this._handleScreensaverActivity.bind(this);
    this._loadStoredState();
  }

  _loadStoredState() {
    try { this._state.mobileCustomColor = localStorage.getItem(this._lsKey("homeii_music_flow_mobile_custom_color")) || "#f5a623"; } catch (_) {}
    try {
      const storedPerformanceProfile = localStorage.getItem(this._lsKey("homeii_music_flow_mobile_performance_profile"));
      const storedPerformanceMode = localStorage.getItem(this._lsKey("homeii_music_flow_mobile_performance_mode"));
      if (storedPerformanceProfile !== null || storedPerformanceMode !== null) {
        const legacyPerformanceMode = storedPerformanceMode !== null ? JSON.parse(storedPerformanceMode) : false;
        const performanceProfile = HomeiiMobileSettingsFoundation.normalizePerformanceProfile(storedPerformanceProfile, legacyPerformanceMode);
        this._state.performanceProfile = performanceProfile;
        this._state.performanceMode = ["low", "ultra_lite"].includes(performanceProfile);
        this._state.performanceModeLocalOverride = true;
      }
    } catch (_) {}
    try { this._state.mobileDynamicThemeMode = localStorage.getItem(this._lsKey("homeii_music_flow_mobile_dynamic_theme_mode")) || "auto"; } catch (_) {}
    try { this._state.mobileBackgroundMotionMode = localStorage.getItem(this._lsKey("homeii_music_flow_mobile_background_motion_mode")) || "subtle"; } catch (_) {}
    try { this._state.mobileCustomTextTone = localStorage.getItem(this._lsKey("homeii_music_flow_mobile_custom_text")) || "light"; } catch (_) {}
    try { this._state.frontPinnedPlayerEntity = localStorage.getItem(this._lsKey("homeii_music_flow_front_pinned_player")) || ""; } catch (_) {}
    try { this._state.mobileFontScale = Math.max(0.5, Math.min(1.5, Number(localStorage.getItem(this._lsKey("homeii_music_flow_mobile_font_scale")) || 1) || 1)); } catch (_) {}
    try { this._state.mobileIconScale = HomeiiMobileSettingsFoundation.clampMobileIconScale(localStorage.getItem(this._lsKey("homeii_music_flow_mobile_icon_scale")) || 1); } catch (_) {}
    this._loadControlRoomScenesFromStorage();
    try { this._state.mobileNightMode = localStorage.getItem(this._lsKey("homeii_music_flow_mobile_night_mode")) || "off"; } catch (_) {}
    try { this._state.mobileNightModeStart = localStorage.getItem(this._lsKey("homeii_music_flow_mobile_night_start")) || "22:00"; } catch (_) {}
    try { this._state.mobileNightModeEnd = localStorage.getItem(this._lsKey("homeii_music_flow_mobile_night_end")) || "06:00"; } catch (_) {}
    try { this._state.mobileNightModeDays = this._normalizeNightModeDays(localStorage.getItem(this._lsKey("homeii_music_flow_mobile_night_days"))); } catch (_) {}
    try { this._state.mobileSleepTimerEndsAt = Number(localStorage.getItem(this._lsKey("homeii_music_flow_mobile_sleep_timer_at")) || 0) || 0; } catch (_) {}
    try { this._state.mobileSleepTimerPlayer = localStorage.getItem(this._lsKey("homeii_music_flow_mobile_sleep_timer_player")) || ""; } catch (_) {}
    try { this._state.mobileSleepTimerOrigin = localStorage.getItem(this._lsKey("homeii_music_flow_mobile_sleep_timer_origin")) || ""; } catch (_) {}
    try { this._state.mobileStartTimerEnabled = JSON.parse(localStorage.getItem(this._lsKey("homeii_music_flow_mobile_start_timer_enabled")) ?? "false"); } catch (_) {}
    try { this._state.mobileStartTimerTime = this._normalizeClockTime(localStorage.getItem(this._lsKey("homeii_music_flow_mobile_start_timer_time")) || "07:00", "07:00"); } catch (_) {}
    try { this._state.mobileStartTimerPlayer = localStorage.getItem(this._lsKey("homeii_music_flow_mobile_start_timer_player")) || ""; } catch (_) {}
    try { this._state.mobileStartTimerPlaylist = localStorage.getItem(this._lsKey("homeii_music_flow_mobile_start_timer_playlist")) || ""; } catch (_) {}
    try { this._state.mobileStartTimerPlaylistName = localStorage.getItem(this._lsKey("homeii_music_flow_mobile_start_timer_playlist_name")) || ""; } catch (_) {}
    try { this._state.mobileStartTimerVolume = Math.max(0, Math.min(100, Number(localStorage.getItem(this._lsKey("homeii_music_flow_mobile_start_timer_volume")) || 35) || 35)); } catch (_) {}
    try { this._state.mobileStartTimerDays = this._normalizeNightModeDays(localStorage.getItem(this._lsKey("homeii_music_flow_mobile_start_timer_days"))); } catch (_) {}
    try { this._state.mobileStartTimerLastRunKey = localStorage.getItem(this._lsKey("homeii_music_flow_mobile_start_timer_last_run")) || ""; } catch (_) {}
    try { this._state.mobileSchedulesTab = localStorage.getItem(this._lsKey("homeii_music_flow_mobile_schedules_tab")) || "timers"; } catch (_) {}
    try {
      const schedules = JSON.parse(localStorage.getItem(this._lsKey("homeii_music_flow_mobile_start_schedules")) || "[]");
      if (Array.isArray(schedules)) this._state.mobileStartSchedules = schedules.map((schedule, index) => this._normalizeScheduledStartSchedule(schedule, index));
    } catch (_) {}
    if (!this._state.mobileStartSchedules.length && this._state.mobileStartTimerEnabled) {
      this._state.mobileStartSchedules = [this._normalizeScheduledStartSchedule({
        id: "schedule_legacy",
        enabled: true,
        time: this._state.mobileStartTimerTime,
        player: this._state.mobileStartTimerPlayer,
        playlist: this._state.mobileStartTimerPlaylist,
        playlistName: this._state.mobileStartTimerPlaylistName,
        volume: this._state.mobileStartTimerVolume,
        days: this._state.mobileStartTimerDays,
        lastRunKey: this._state.mobileStartTimerLastRunKey,
      })];
      this._state.mobileStartScheduleEditId = "schedule_legacy";
    }
    try { this._state.mobileLyricsSyncEnabled = JSON.parse(localStorage.getItem(this._lsKey("homeii_music_flow_mobile_lyrics_sync")) ?? "true"); } catch (_) {}
    try { this._state.mobileLyricsSyncOffsetMs = Math.max(-10000, Math.min(10000, Number(localStorage.getItem(this._lsKey("homeii_music_flow_mobile_lyrics_offset_ms")) || 0) || 0)); } catch (_) {}
    try { this._state.mobileLyricsFontScale = Math.max(0.75, Math.min(1.4, Number(localStorage.getItem(this._lsKey("homeii_music_flow_mobile_lyrics_font_scale")) || 1) || 1)); } catch (_) {}
    try { this._state.mobileCompactMode = JSON.parse(localStorage.getItem(this._lsKey("homeii_music_flow_mobile_compact_mode")) ?? "false"); } catch (_) {}
    try { this._state.mobileCompactWidgetMode = HomeiiMobileSettingsFoundation.normalizeMobileCompactWidgetMode(localStorage.getItem(this._lsKey("homeii_music_flow_mobile_compact_widget_mode")) || "auto"); } catch (_) {}
    try { this._state.mobileCompactEdgeToEdge = JSON.parse(localStorage.getItem(this._lsKey("homeii_music_flow_mobile_compact_edge_to_edge")) ?? "true"); } catch (_) {}
    try { this._state.mobileEdgeToEdge = JSON.parse(localStorage.getItem(this._lsKey("homeii_music_flow_mobile_edge_to_edge")) ?? "false"); } catch (_) {}
    try { this._state.mobileLayoutMode = HomeiiMobileSettingsFoundation.normalizeMobileLayoutMode(localStorage.getItem(this._lsKey("homeii_music_flow_mobile_layout_mode")) || "auto"); } catch (_) {}
    try { this._state.mobileCoverFlow = JSON.parse(localStorage.getItem(this._lsKey("homeii_music_flow_mobile_cover_flow")) ?? "false"); } catch (_) {}
    try { this._state.mobileQueueFlow = JSON.parse(localStorage.getItem(this._lsKey("homeii_music_flow_mobile_queue_flow")) ?? "true"); } catch (_) {}
    try {
      this._state.mobileLibraryDefaultLayout = HomeiiMobileSettingsFoundation.normalizeMobileLibraryDefaultLayout(
        localStorage.getItem(this._lsKey("homeii_music_flow_mobile_library_default_layout")) || "",
        this._defaultMobileMediaLayout()
      );
      this._state.mobileMediaLayout = this._state.mobileLibraryDefaultLayout;
    } catch (_) {}
    try { this._state.mobileShowUpNext = JSON.parse(localStorage.getItem(this._lsKey("homeii_music_flow_mobile_show_up_next")) ?? "false"); } catch (_) {}
    try {
      const rawHistory = JSON.parse(localStorage.getItem(this._lsKey("homeii_music_flow_mobile_recent_history")) || "[]");
      if (Array.isArray(rawHistory)) this._state.mobileRecentHistory = rawHistory.slice(0, 10);
    } catch (_) {}
    try { this._state.mobileLibrarySort = localStorage.getItem(this._lsKey("homeii_music_flow_mobile_library_sort")) || "name_asc"; } catch (_) {}
    try { this._state.mobileFooterSearchEnabled = JSON.parse(localStorage.getItem(this._lsKey("homeii_music_flow_mobile_footer_search")) ?? "false"); } catch (_) {}
    try { this._state.mobileStudioShortcutEnabled = JSON.parse(localStorage.getItem(this._lsKey("homeii_music_flow_mobile_studio_shortcut")) ?? "true"); } catch (_) {}
    try { this._state.mobileFooterMode = localStorage.getItem(this._lsKey("homeii_music_flow_mobile_footer_mode")) || "icon"; } catch (_) {}
    try { this._state.mobilePlayerDesign = localStorage.getItem(this._lsKey("homeii_music_flow_player_design")) || this._config?.player_design || "immersive"; } catch (_) { this._state.mobilePlayerDesign = this._config?.player_design || "immersive"; }
    try { this._state.mobileHomeShortcutEnabled = JSON.parse(localStorage.getItem(this._lsKey("homeii_music_flow_mobile_home_shortcut")) ?? "false"); } catch (_) {}
    try { this._state.mobileHomeShortcutPath = localStorage.getItem(this._lsKey("homeii_music_flow_mobile_home_shortcut_path")) || "/"; } catch (_) {}
    try { this._state.mobileVolumeMode = localStorage.getItem(this._lsKey("homeii_music_flow_mobile_volume_mode")) || "button"; } catch (_) {}
    try { this._state.mobileVolumeStepButtonsEnabled = JSON.parse(localStorage.getItem(this._lsKey("homeii_music_flow_mobile_volume_step_buttons")) ?? "false"); } catch (_) {}
    try { this._state.mobileVolumeStepPercent = HomeiiMobileSettingsFoundation.clampMobileVolumeStepPercent(localStorage.getItem(this._lsKey("homeii_music_flow_mobile_volume_step_percent")) || 5); } catch (_) {}
    try { this._state.mobileMicMode = localStorage.getItem(this._lsKey("homeii_music_flow_mobile_mic_mode")) || "smart"; } catch (_) {}
    try { this._state.voiceAssistantEnabled = JSON.parse(localStorage.getItem(this._lsKey("homeii_music_flow_voice_assistant_enabled")) ?? "false"); } catch {}
    try { this._state.voiceAssistantMode = HomeiiMobileSettingsFoundation.normalizeVoiceAssistantMode(localStorage.getItem(this._lsKey("homeii_music_flow_voice_assistant_mode")) || "hybrid"); } catch {}
    try { this._state.voiceAssistantAgentId = localStorage.getItem(this._lsKey("homeii_music_flow_voice_assistant_agent_id")) || ""; } catch {}
    try { this._state.voiceAssistantSpeakFeedback = JSON.parse(localStorage.getItem(this._lsKey("homeii_music_flow_voice_assistant_speak_feedback")) ?? "false"); } catch {}
    try { this._state.mobileSwipeMode = localStorage.getItem(this._lsKey("homeii_music_flow_mobile_swipe_mode")) || "browse"; } catch (_) {}
    try { this._state.mobileRadioSourceMode = HomeiiMobileSettingsFoundation.normalizeMobileRadioSourceMode(localStorage.getItem(this._lsKey("homeii_music_flow_mobile_radio_source_mode")) || "combined"); } catch (_) {}
    try { this._state.mobileRadioBrowserCountry = localStorage.getItem(this._lsKey("homeii_music_flow_mobile_radio_country")) || "all"; } catch (_) {}
    try {
      const rawTabs = JSON.parse(localStorage.getItem(this._lsKey("homeii_music_flow_mobile_library_tabs")) || "[]");
      if (Array.isArray(rawTabs) && rawTabs.length) this._state.mobileLibraryTabs = rawTabs;
    } catch (_) {}
    try {
      const rawFavoriteTabs = JSON.parse(localStorage.getItem(this._lsKey("homeii_music_flow_mobile_library_favorites_tabs")) || "[]");
      if (Array.isArray(rawFavoriteTabs)) this._state.mobileLibraryFavoritesOnlyTabs = rawFavoriteTabs.filter((page) => this._libraryFavoritesPageKey(page));
    } catch (_) {}
    try {
      const rawMainBar = JSON.parse(localStorage.getItem(this._lsKey("homeii_music_flow_mobile_main_bar_items")) || "[]");
      if (Array.isArray(rawMainBar) && rawMainBar.length) this._state.mobileMainBarItems = rawMainBar;
    } catch (_) {}
    try {
      const storedQuickActions = localStorage.getItem(this._lsKey("homeii_music_flow_mobile_quick_actions"));
      if (storedQuickActions !== null) {
        const rawQuickActions = JSON.parse(storedQuickActions);
        if (Array.isArray(rawQuickActions)) this._state.mobileQuickActions = rawQuickActions;
      }
    } catch (_) {}
    try {
      const rawPinned = JSON.parse(localStorage.getItem(this._lsKey("homeii_music_flow_mobile_pinned_players")) || "[]");
      if (Array.isArray(rawPinned)) this._state.pinnedPlayerEntities = rawPinned.filter(Boolean);
    } catch (_) {}
    if (!Array.isArray(this._state.pinnedPlayerEntities) || !this._state.pinnedPlayerEntities.length) {
      try {
        const legacyPinned = localStorage.getItem(this._lsKey("homeii_music_flow_mobile_pinned_player")) || "";
        this._state.pinnedPlayerEntities = legacyPinned ? [legacyPinned] : [];
      } catch (_) {}
    }
    this._state.mobileLikedMode = "ma";
    try {
      const presets = JSON.parse(localStorage.getItem(this._lsKey("homeii_music_flow_mobile_announcement_presets")) || "[]");
      if (Array.isArray(presets) && presets.length) {
        this._state.mobileAnnouncementPresets = this._isDefaultAnnouncementPresetSet(presets)
          ? this._defaultAnnouncementPresets()
          : presets.slice(0, 3);
      }
    } catch (_) {}
    try {
      const announcementVolume = Number(localStorage.getItem(this._lsKey("homeii_music_flow_mobile_announcement_volume")));
      if (Number.isFinite(announcementVolume)) this._state.mobileAnnouncementVolume = Math.max(20, Math.min(50, announcementVolume));
    } catch (_) {}
    try { this._state.mobileAnnouncementTtsEntity = localStorage.getItem(this._lsKey("homeii_music_flow_mobile_announcement_tts_entity")) || this._config?.announcement_tts_entity || ""; } catch (_) {}
    try { this._state.mobileAnnouncementTtsLanguage = this._normalizeAnnouncementLanguage(localStorage.getItem(this._lsKey("homeii_music_flow_mobile_announcement_tts_language")) || this._config?.announcement_tts_language || "auto"); } catch (_) {}
    try { this._state.ambientLightEnabled = JSON.parse(localStorage.getItem(this._lsKey("homeii_music_flow_ambient_light_enabled")) ?? "false"); } catch {}
    try { this._state.ambientLightEntities = HomeiiMobileSettingsFoundation.normalizeEntityList(JSON.parse(localStorage.getItem(this._lsKey("homeii_music_flow_ambient_light_entities")) || "[]")); } catch {}
    try { this._state.ambientLightPlayerMap = HomeiiMobileSettingsFoundation.normalizeStringArray(JSON.parse(localStorage.getItem(this._lsKey("homeii_music_flow_ambient_light_player_map")) || "[]")); } catch {}
    try { this._state.ambientLightBrightness = HomeiiMobileSettingsFoundation.clampPercent(localStorage.getItem(this._lsKey("homeii_music_flow_ambient_light_brightness")) || 35, 35, { min: 1, max: 100 }); } catch {}
    try { this._state.ambientLightTransition = HomeiiMobileSettingsFoundation.clampSeconds(localStorage.getItem(this._lsKey("homeii_music_flow_ambient_light_transition")) || 3, 3, { min: 0, max: 120 }); } catch {}
    try { this._state.ambientLightCooldown = HomeiiMobileSettingsFoundation.clampSeconds(localStorage.getItem(this._lsKey("homeii_music_flow_ambient_light_cooldown")) || 8, 8, { min: 0, max: 120 }); } catch {}
    try { this._state.screensaverEnabled = JSON.parse(localStorage.getItem(this._lsKey("homeii_music_flow_screensaver_enabled")) ?? "false"); } catch {}
    try {
      const storedAutoLyrics = localStorage.getItem(this._lsKey("homeii_music_flow_screensaver_auto_lyrics_when_playing"))
        ?? localStorage.getItem(this._lsKey("homeii_music_flow_screensaver_auto_lyrics"));
      this._state.screensaverAutoLyricsWhenPlaying = JSON.parse(storedAutoLyrics ?? "false");
    } catch {}
    try {
      const storedScreensaverButtons = localStorage.getItem(this._lsKey("homeii_music_flow_screensaver_control_buttons"));
      if (storedScreensaverButtons !== null) {
        this._state.screensaverControlButtons = HomeiiMobileSettingsFoundation.normalizeScreensaverControlButtons(JSON.parse(storedScreensaverButtons), ["previous", "next"]);
      }
    } catch {}
    try { this._state.screensaverClockMode = HomeiiMobileSettingsFoundation.normalizeScreensaverClockMode(localStorage.getItem(this._lsKey("homeii_music_flow_screensaver_clock_mode")) || "digital"); } catch {}
    try { this._state.screensaverTimeoutSeconds = HomeiiMobileSettingsFoundation.clampSeconds(localStorage.getItem(this._lsKey("homeii_music_flow_screensaver_timeout_seconds")) || 90, 90, { min: 15, max: 3600 }); } catch {}
    try { this._state.screensaverMessage = localStorage.getItem(this._lsKey("homeii_music_flow_screensaver_message")) || ""; } catch {}
    try { this._state.screensaverClockSize = HomeiiMobileSettingsFoundation.clampNumber(localStorage.getItem(this._lsKey("homeii_music_flow_screensaver_clock_size")) || 1, 1, { min: 0.75, max: 1.45 }); } catch {}
    try { this._state.screensaverClockX = HomeiiMobileSettingsFoundation.clampNumber(localStorage.getItem(this._lsKey("homeii_music_flow_screensaver_clock_x")) || 82, 82, { min: 0, max: 100 }); } catch {}
    try { this._state.screensaverClockY = HomeiiMobileSettingsFoundation.clampNumber(localStorage.getItem(this._lsKey("homeii_music_flow_screensaver_clock_y")) || 24, 24, { min: 0, max: 100 }); } catch {}
    try { this._state.powerButtonEnabled = JSON.parse(localStorage.getItem(this._lsKey("homeii_music_flow_power_button_enabled")) ?? "false"); } catch {}
    try { this._state.powerButtonName = localStorage.getItem(this._lsKey("homeii_music_flow_power_button_name")) || ""; } catch {}
    try { this._state.powerButtonIcon = HomeiiMobileSettingsFoundation.normalizeAuxiliaryButtonIcon(localStorage.getItem(this._lsKey("homeii_music_flow_power_button_icon")) || "power"); } catch {}
    try { this._state.powerButtonAction = HomeiiMobileSettingsFoundation.normalizePowerButtonAction(localStorage.getItem(this._lsKey("homeii_music_flow_power_button_action")) || "stop_player"); } catch {}
    try { this._state.powerButtonEntity = localStorage.getItem(this._lsKey("homeii_music_flow_power_button_entity")) || ""; } catch {}
    try { this._state.auxiliaryButtons = HomeiiMobileSettingsFoundation.normalizeAuxiliaryButtons(JSON.parse(localStorage.getItem(this._lsKey("homeii_music_flow_auxiliary_buttons")) || "{}")).slice(1); } catch {}
    try { this._state.discoveryModeEnabled = JSON.parse(localStorage.getItem(this._lsKey("homeii_music_flow_discovery_mode_enabled")) ?? "true"); } catch {}
    try { this._state.discoveryCategoryKey = localStorage.getItem(this._lsKey("homeii_music_flow_discovery_category_key")) || "pop"; } catch {}
    try { this._state.discoveryGenreKey = localStorage.getItem(this._lsKey("homeii_music_flow_discovery_genre_key")) || "all"; } catch {}
    try { this._state.excludedPlayerEntities = HomeiiMobileSettingsFoundation.normalizePinnedPlayerEntityList(JSON.parse(localStorage.getItem(this._lsKey("homeii_music_flow_excluded_players")) || "[]")); } catch {}
    try { this._state.playerSortMode = HomeiiMobileSettingsFoundation.normalizePlayerSortMode(localStorage.getItem(this._lsKey("homeii_music_flow_player_sort_mode")) || "default"); } catch {}
    try { this._state.playerOrderEntities = HomeiiMobileSettingsFoundation.normalizePinnedPlayerEntityList(JSON.parse(localStorage.getItem(this._lsKey("homeii_music_flow_player_order")) || "[]")); } catch {}
  }

  _defaultMobileMediaLayout() {
    return HomeiiMobileSettingsFoundation.normalizeMobileLibraryDefaultLayout(
      this._state?.mobileLibraryDefaultLayout,
      HomeiiResponsiveFoundation.defaultMobileMediaLayout(this._layoutModeConfig())
    );
  }

  static getStubConfig() {
    return {
      ...HomeiiBaseMusicCard.getStubConfig(),
      show_ma_button: false,
      layout_mode: "auto",
      settings_source: "visual",
      night_mode: "off",
      night_mode_auto_start: "22:00",
      night_mode_auto_end: "06:00",
      night_mode_days: [0, 1, 2, 3, 4, 5, 6],
      mobile_show_up_next: false,
      active_player_helper_entity: "",
      performance_profile: "full",
      performance_mode: false,
      mobile_custom_color: "#f5a623",
      mobile_dynamic_theme_mode: "auto",
      mobile_background_motion_mode: "subtle",
      mobile_custom_text_tone: "light",
      mobile_font_scale: 1,
      mobile_icon_scale: 1,
      mobile_compact_mode: false,
      mobile_compact_widget_mode: "auto",
      mobile_compact_edge_to_edge: true,
      mobile_edge_to_edge: false,
      mobile_layout_mode: "auto",
      mobile_cover_flow: false,
      mobile_queue_flow: true,
      mobile_library_default_layout: "list",
      mobile_footer_search_enabled: false,
      mobile_footer_mode: "icon",
      action_menu_labels: true,
      player_design: "immersive",
      mobile_studio_shortcut: true,
      mobile_home_shortcut: false,
      mobile_home_shortcut_path: "/",
      mobile_volume_mode: "button",
      mobile_volume_step_buttons: false,
      mobile_volume_step_percent: 5,
      mobile_mic_mode: "smart",
      voice_assistant_enabled: false,
      voice_assistant_mode: "hybrid",
      voice_assistant_agent_id: "",
      voice_assistant_speak_feedback: false,
      flow_assistant_response_timeout_ms: 18000,
      flow_assistant_listen_timeout_ms: 12000,
      flow_assistant_auto_close_ms: 4200,
      mobile_library_tabs: ["library_search", "library_liked", "library_playlists", "library_artists", "library_albums", "library_tracks", "library_radio", "library_podcasts"],
      mobile_main_bar_items: ["actions", "players", "library", "settings"],
      mobile_quick_actions: ["timer", "like", "lyrics", "queue", "queue_flow", "radio", "history"],
      mobile_quick_action_1: "timer",
      mobile_quick_action_2: "like",
      mobile_quick_action_3: "lyrics",
      mobile_quick_action_4: "queue",
      mobile_quick_action_5: "queue_flow",
      mobile_quick_action_6: "radio",
      mobile_quick_action_7: "history",
      mobile_quick_action_8: "",
      mobile_quick_action_9: "",
      mobile_quick_action_10: "",
      mobile_swipe_mode: "browse",
      mobile_radio_source_mode: "combined",
      mobile_radio_browser_country: "all",
      mobile_announcement_presets: [],
      mobile_announcement_volume: 20,
      announcement_tts_entity: "",
      announcement_tts_language: "auto",
      ambient_light_enabled: false,
      ambient_light_entities: [],
      ambient_light_player_map: [],
      ambient_light_brightness: 35,
      ambient_light_transition: 3,
      ambient_light_cooldown: 8,
      screensaver_enabled: false,
      lrclib_lyrics_enabled: false,
      screensaver_auto_lyrics_when_playing: false,
      screensaver_control_buttons: ["previous", "next"],
      screensaver_clock_mode: "digital",
      screensaver_timeout_seconds: 90,
      screensaver_message: "",
      screensaver_clock_size: 1,
      screensaver_clock_x: 82,
      screensaver_clock_y: 24,
      power_button_enabled: false,
      power_button_name: "",
      power_button_icon: "power",
      power_button_action: "stop_player",
      power_button_entity: "",
      aux_button_2_enabled: false,
      aux_button_2_name: "",
      aux_button_2_icon: "power",
      aux_button_2_action: "toggle",
      aux_button_2_entity: "",
      aux_button_3_enabled: false,
      aux_button_3_name: "",
      aux_button_3_icon: "power",
      aux_button_3_action: "toggle",
      aux_button_3_entity: "",
      aux_button_4_enabled: false,
      aux_button_4_name: "",
      aux_button_4_icon: "power",
      aux_button_4_action: "toggle",
      aux_button_4_entity: "",
      discovery_mode_enabled: true,
      pinned_player_entity: "",
      pinned_player_entities: [],
      excluded_player_entities: [],
      player_sort_mode: "default",
      player_order_entities: [],
      ...Object.fromEntries(Array.from({ length: 20 }, (_, index) => [`player_order_entity_${index + 1}`, ""])),
    };
  }

  static getConfigForm() {
    return getMobileCardConfigForm();
  }

  static assertConfig(config) {
    if (!config || typeof config !== "object" || Array.isArray(config)) {
      throw new Error("Card config must be an object");
    }
  }

  setConfig(config) {
    super.setConfig({
      ...HomeiiMusicFlowBaseCard.getStubConfig(),
      ...config,
      settings_source: HomeiiStateFoundation.normalizeSettingsSource(config?.settings_source),
    });
    // Re-hydrate stored state now that _config.card_id is available so any
    // scoped localStorage keys are read with the correct namespace. The
    // constructor's initial _loadStoredState() ran before setConfig and
    // therefore used the unsuffixed keys.
    this._loadStoredState();
    this._applyConfiguredMobileSettings();
    this._syncScreensaverClockVars();
    if (this._state.screensaverOpen) this._syncScreensaverUi();
    this._hydrateSystemMobileState().catch(() => {});
  }

  set editMode(value) {
    const enabled = value === true || String(value || "").toLowerCase() === "true";
    if (this._editMode === enabled) return;
    this._editMode = enabled;
    if (!enabled) return;
    this.classList.remove("mobile-edge-to-edge-open");
    this.shadowRoot?.querySelector?.(".card")?.classList?.remove("mobile-edge-to-edge");
    clearTimeout(this._screensaverTimer);
    this._screensaverTimer = null;
    this._hideScreensaver?.();
  }

  get editMode() {
    return this._editMode === true;
  }

  _getConfigValidator() {
    return HomeiiConfigValidators.validateMobileCardEditorConfig;
  }

  _usesVisualSettings() {
    return HomeiiStateFoundation.usesVisualSettings(this._config);
  }

  _performanceProfile() {
    return HomeiiStateFoundation.performanceProfile(this._state);
  }

  _performanceModeEnabled() {
    return HomeiiStateFoundation.performanceModeEnabled(this._state);
  }

  _performanceUltraLiteEnabled() {
    return HomeiiStateFoundation.performanceUltraLiteEnabled(this._state);
  }

  _mobileLayoutMode() {
    const mode = HomeiiMobileSettingsFoundation.normalizeMobileLayoutMode(this._state.mobileLayoutMode);
    this._state.mobileLayoutMode = mode;
    return mode;
  }

  _fullMobileInlineTargetHeight() {
    return 760;
  }

  _preferFullMobileGridRows() {
    const mode = this._mobileLayoutMode();
    return mode === "full" || mode === "edge_to_edge" || (mode === "auto" && !HomeiiStateFoundation.mobileCompactModeEnabled(this._state));
  }

  _autoCompactModeRecommended(options = {}) {
    const mode = this._mobileLayoutMode();
    if (mode === "full" || mode === "edge_to_edge") return false;
    if (mode === "compact") return true;
    const viewportWidth = typeof window !== "undefined" ? Number(window.innerWidth || 0) : 0;
    const viewportHeight = this._getViewportHeight(0);
    const width = Number(options?.width || 0) > 0
      ? Number(options.width)
      : this._getCardWidth(this._lastCardWidth || viewportWidth || 0);
    const height = Number(options?.height || 0) > 0
      ? Number(options.height)
      : this._getAllocatedCardHeight(viewportHeight) || viewportHeight;
    return HomeiiResponsiveFoundation.autoCompactRecommended({ width, height });
  }

  _mobileCompactModeEnabled() {
    const mode = this._mobileLayoutMode();
    if (mode === "full" || mode === "edge_to_edge") return false;
    if (mode === "compact") return true;
    return HomeiiStateFoundation.mobileCompactModeEnabled(this._state) || this._autoCompactModeRecommended();
  }

  _mobileCompactWidgetMode() {
    return HomeiiStateFoundation.mobileCompactWidgetMode(this._state);
  }

  _mobileCompactEdgeToEdgeEnabled() {
    return true;
  }

  _mobileEdgeToEdgeEnabled() {
    if (this._isVisualEditorContext()) return false;
    if (this._mobileLayoutMode() === "edge_to_edge") return true;
    if (!this._usesVisualSettings()) return this._state?.mobileEdgeToEdge === true;
    return this._state?.mobileEdgeToEdge === true || this._config?.mobile_edge_to_edge === true;
  }

  _exitMobileEdgeToEdge() {
    if (!this._mobileEdgeToEdgeEnabled()) return;
    this._closeMobileMenu?.();
    this._closeMobileQueueActionMenu?.();
    this._closeMobileVolumePresets?.();
    this._closeSmartVoiceConfirm?.();
    this._closeControlRoom?.({ silent: true });
    this._state.mobileLayoutMode = "full";
    this._state.mobileEdgeToEdge = false;
    this._state.mobileEdgeReturnAvailable = true;
    this._state.mobileCompactExpanded = false;
    this.classList.remove("mobile-edge-to-edge-open");
    this._persistMobileAppearance();
    this._build();
    this._init();
  }

  _enterMobileEdgeToEdge() {
    this._closeMobileMenu?.();
    this._closeMobileQueueActionMenu?.();
    this._closeMobileVolumePresets?.();
    this._closeSmartVoiceConfirm?.();
    this._closeControlRoom?.({ silent: true });
    this._state.mobileLayoutMode = "edge_to_edge";
    this._state.mobileEdgeToEdge = false;
    this._state.mobileEdgeReturnAvailable = false;
    this._state.mobileCompactExpanded = false;
    this._persistMobileAppearance();
    this._build();
    this._init();
  }

  _compactEdgeToEdgeAllowed() {
    return true;
  }

  _compactEdgeToEdgeExpanded() {
    return !!(
      this._state?.mobileCompactExpanded
      && this._mobileCompactModeEnabled?.()
      && this._mobileCompactEdgeToEdgeEnabled?.()
      && this._compactEdgeToEdgeAllowed?.()
    );
  }

  _compactMiniWidgetRecommended(options = {}) {
    const viewportWidth = typeof window !== "undefined" ? Number(window.innerWidth || 0) : 0;
    const width = Number(options?.width || 0) > 0
      ? Number(options.width)
      : this._getCardWidth(this._lastCardWidth || viewportWidth || 0);
    const height = Number(options?.height || 0);
    if (!Number.isFinite(width) || width <= 0) return false;
    if (width <= 430) return true;
    return Number.isFinite(height) && height > 0 && height <= 210;
  }

  _compactMiniWidgetMode(options = {}) {
    const mode = this._mobileCompactWidgetMode();
    if (mode === "mini") return true;
    if (mode === "full") return false;
    return this._compactMiniWidgetRecommended(options);
  }

  _mobileShowUpNextEnabled() {
    return HomeiiStateFoundation.mobileShowUpNextEnabled(this._state);
  }

  _mobileDynamicThemeMode() {
    if (this._performanceModeEnabled()) return "off";
    return HomeiiStateFoundation.mobileDynamicThemeMode(this._state);
  }

  _mobileBackgroundMotionMode() {
    if (this._performanceModeEnabled()) return "off";
    return HomeiiStateFoundation.mobileBackgroundMotionMode(this._state);
  }

  _backgroundMotionEnabled() {
    if (this._performanceModeEnabled()) return false;
    return HomeiiStateFoundation.backgroundMotionEnabled(this._state);
  }

  _backgroundMotionAmount() {
    if (this._performanceModeEnabled()) return "0";
    return HomeiiStateFoundation.backgroundMotionAmount(this._state);
  }

  _isCompactTileMode() {
    return this._mobileCompactModeEnabled() && !this._state?.mobileCompactExpanded;
  }

  _compactTileReservedHeight() {
    const viewportWidth = typeof window !== "undefined" ? Number(window.innerWidth || 0) : 0;
    const cardWidth = this._getCardWidth(this._lastCardWidth || viewportWidth || 390);
    const width = Number.isFinite(cardWidth) && cardWidth > 0 ? cardWidth : 390;
    if (this._compactMiniWidgetMode({ width })) {
      return this._sectionGridHeightForRows(5);
    }
    const targetRows = width < 430 ? 8 : width < 560 ? 8 : width < 760 ? 7 : 6;
    return this._sectionGridHeightForRows(targetRows);
  }

  _setCompactExpanded(expanded) {
    const nextExpanded = !!expanded && this._mobileCompactModeEnabled();
    const previousExpanded = !!this._state.mobileCompactExpanded;
    this._state.mobileCompactTransition = nextExpanded ? "expand" : previousExpanded ? "collapse" : "";
    this._state.mobileCompactExpanded = nextExpanded;
    this._layoutResizeHoldUntil = Date.now() + 720;
    const edgeToEdge = nextExpanded && this._compactEdgeToEdgeAllowed();
    const windowPopup = nextExpanded && !edgeToEdge;
    this.classList.toggle("compact-popup-open", edgeToEdge);
    this.classList.toggle("compact-window-popup-open", windowPopup);
    this.classList.remove("compact-inline-popup-open");
    this.classList.toggle("compact-tile-open", !nextExpanded && this._mobileCompactModeEnabled());
    if (!nextExpanded && this._state.controlRoomOpen) {
      this._state.controlRoomOpen = false;
      this._state.controlRoomPanel = "";
      this._state.controlRoomRestoreAfterMenu = false;
      this._syncControlRoomChrome();
    }
    this._build();
    this._init();
    clearTimeout(this._compactTransitionTimer);
    this._compactTransitionTimer = setTimeout(() => {
      this.shadowRoot?.querySelector(".card")?.classList.remove("compact-transition-expand", "compact-transition-collapse");
      if (this._state.mobileCompactTransition === "expand" || this._state.mobileCompactTransition === "collapse") {
        this._state.mobileCompactTransition = "";
      }
    }, 460);
  }

  _applyConfiguredMobileSettings() {
    if (!this._config) return;
    const cfg = this._config;
    if (this._usesVisualSettings()) {
      const visualCfg = this._isDefaultAnnouncementPresetSet(cfg.mobile_announcement_presets)
        ? { ...cfg, mobile_announcement_presets: [] }
        : cfg;
      const previousLibraryDefaultLayout = this._state.mobileLibraryDefaultLayout || this._defaultMobileMediaLayout();
      const previousLibraryManual = this._state.mobileMediaLayoutManual === true;
      const previousEdgeReturnAvailable = this._state.mobileEdgeReturnAvailable === true;
      Object.assign(this._state, HomeiiMobileSettingsFoundation.normalizeVisualMobileState(visualCfg, {
        normalizeClockTime: (value, fallback) => this._normalizeClockTime(value, fallback),
        normalizeNightModeDays: (value) => this._normalizeNightModeDays(value),
        defaultLibraryTabs: this._defaultMobileLibraryTabs(),
        defaultMainBarItems: this._defaultMobileMainBarItems(),
        defaultQuickActions: this._defaultMobileQuickActions(),
        defaultAnnouncementPresets: this._defaultAnnouncementPresets(visualCfg.language || this._state.lang),
      }));
      if (previousEdgeReturnAvailable && this._state.mobileLayoutMode === "edge_to_edge") {
        this._state.mobileLayoutMode = "full";
        this._state.mobileEdgeToEdge = false;
        this._state.mobileEdgeReturnAvailable = true;
      } else if (this._state.mobileLayoutMode !== "full") {
        this._state.mobileEdgeReturnAvailable = false;
      }
      if (this._state.mobileLibraryDefaultLayout !== previousLibraryDefaultLayout) this._state.mobileMediaLayoutManual = false;
      else this._state.mobileMediaLayoutManual = previousLibraryManual;
      if (!this._state.mobileMediaLayoutManual) this._state.mobileMediaLayout = this._defaultMobileMediaLayout();
      if (!this._mobileCompactModeEnabled()) this._state.mobileCompactExpanded = false;
    } else if (String(cfg.announcement_tts_entity || "").trim() && !String(this._state.mobileAnnouncementTtsEntity || "").trim()) {
      this._state.mobileAnnouncementTtsEntity = String(cfg.announcement_tts_entity || "").trim();
    }
    if (!this._usesVisualSettings() && String(cfg.announcement_tts_language || "").trim()) {
      this._state.mobileAnnouncementTtsLanguage = this._normalizeAnnouncementLanguage(cfg.announcement_tts_language);
    }
    if (!this._usesVisualSettings() && !this._state.performanceModeLocalOverride) {
      const performanceProfile = HomeiiMobileSettingsFoundation.normalizePerformanceProfile(cfg.performance_profile, cfg.performance_mode);
      this._state.performanceProfile = performanceProfile;
      this._state.performanceMode = ["low", "ultra_lite"].includes(performanceProfile);
    }
  }

  _layoutModeConfig(options = {}) {
    const viewportWidth = typeof window !== "undefined" ? Number(window.innerWidth || 0) : 0;
    const viewportHeight = this._getViewportHeight(0);
    const compactPopup = options?.compactPopup === true || !!(this._state?.mobileCompactExpanded && this._mobileCompactModeEnabled?.());
    if (compactPopup) {
      const shortestSide = Math.min(
        Number(viewportWidth || 0) || Infinity,
        Number(viewportHeight || 0) || Infinity,
      );
      const longestSide = Math.max(Number(viewportWidth || 0), Number(viewportHeight || 0));
      if (shortestSide < 760 && longestSide < 1180) return "mobile";
    }
    const optionWidth = Number(options?.width || 0);
    const cardWidth = optionWidth > 0
      ? optionWidth
      : compactPopup
        ? this._getCardWidth(viewportWidth)
        : this._getCardWidth(this._lastCardWidth || viewportWidth);
    return HomeiiResponsiveFoundation.resolveLayoutMode(this._config?.layout_mode, {
      rectWidth: cardWidth,
      hostWidth: 0,
      viewportWidth: cardWidth > 0 ? 0 : viewportWidth,
    });
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
    if (this._isNightModeActive()) return "dark";
    if (this._state.cardTheme === "dark" || this._state.cardTheme === "light") return this._state.cardTheme;
    if (this._state.cardTheme === "custom") return this._customIsDark() ? "dark" : "light";
    return super._effectiveTheme();
  }

  _visualTheme() {
    if (this._isNightModeActive()) return "dark";
    if (this._state.cardTheme === "custom") return "custom";
    return this._effectiveTheme();
  }

  _customIsDark() {
    return HomeiiPaletteFoundation.isRgbTupleDark(
      HomeiiPaletteFoundation.hexToRgbTuple(this._state.mobileCustomColor || "#f5a623"),
      0.58,
    );
  }

  _customTextColor() {
    return "#ffffff";
  }

  _customRgb() {
    return HomeiiPaletteFoundation.rgbTupleToString(
      HomeiiPaletteFoundation.hexToRgbTuple(this._state.mobileCustomColor || "#f5a623"),
    );
  }

  _clampByte(value) {
    return HomeiiPaletteFoundation.clampRgbByte(value);
  }

  _normalizeRgbTuple(value, fallback = [245, 166, 35]) {
    return HomeiiPaletteFoundation.normalizeRgbTuple(value, fallback);
  }

  _rgbTupleToString(tuple = [245, 166, 35]) {
    return HomeiiPaletteFoundation.rgbTupleToString(tuple);
  }

  _rgbTupleToHex(tuple = [245, 166, 35]) {
    return HomeiiPaletteFoundation.rgbTupleToHex(tuple);
  }

  _mixRgb(left = [245, 166, 35], right = [255, 255, 255], ratio = 0.5) {
    return HomeiiPaletteFoundation.mixRgb(left, right, ratio);
  }

  _rgbToHsl(tuple = [245, 166, 35]) {
    return HomeiiPaletteFoundation.rgbToHsl(tuple);
  }

  _hslToRgb(hue = 0, saturation = 0, lightness = 0.5) {
    return HomeiiPaletteFoundation.hslToRgb(hue, saturation, lightness);
  }

  _tunePaletteColor(tuple = [245, 166, 35], options = {}) {
    return HomeiiPaletteFoundation.tunePaletteColor(tuple, options);
  }

  _dynamicThemePalette() {
    return this._mobileDynamicThemeMode() === "off" ? null : (this._state.mobileDynamicThemePalette || null);
  }

  _dynamicThemeActive() {
    return !!this._dynamicThemePalette()?.accent;
  }

  _activeAccentColor() {
    return HomeiiPaletteFoundation.resolveActiveAccentColor(
      this._dynamicThemePalette(),
      this._state.mobileCustomColor || "#f5a623",
    );
  }

  _activeAccentRgb() {
    return HomeiiPaletteFoundation.resolveActiveAccentRgb(
      this._dynamicThemePalette(),
      this._state.mobileCustomColor || "#f5a623",
    );
  }

  _dynamicThemeStrengthValue() {
    return HomeiiPaletteFoundation.dynamicThemeStrengthValue(this._mobileDynamicThemeMode());
  }

  _dynamicThemeStyleSignature(artworkKey = "", artUrl = "") {
    const palette = this._dynamicThemePalette();
    const paletteKey = palette
      ? [
          palette.accent || "",
          palette.accent_rgb || "",
          palette.surface || "",
          palette.surface_rgb || "",
          palette.glow || "",
          palette.glow_rgb || "",
          palette.text || "",
        ].join(",")
      : "";
    return [
      artworkKey,
      artUrl,
      this._mobileDynamicThemeMode(),
      this._effectiveTheme(),
      this._activeAccentColor(),
      this._dynamicThemeStrengthValue(),
      this._isHotelMode() ? "hotel" : "normal",
      paletteKey,
    ].join("||");
  }

  _applyDynamicThemeRenderState(artworkKey = "", artUrl = "") {
    const signature = this._dynamicThemeStyleSignature(artworkKey, artUrl);
    if (signature === this._mobileDynamicThemeAppliedSignature) return false;
    this._mobileDynamicThemeAppliedSignature = signature;
    this._applyDynamicThemeStyles();
    this._applyBackgroundMotionStyles();
    this._syncCurrentArtworkBackgrounds(artUrl);
    return true;
  }

  _mobileBackdropOverlay(theme = this._effectiveTheme()) {
    const palette = this._dynamicThemePalette();
    if (!palette) {
      return theme === "light"
        ? `radial-gradient(circle at 18% 18%, rgba(255,187,88,.16), transparent 26%), radial-gradient(circle at 82% 14%, rgba(255,150,108,.1), transparent 18%), linear-gradient(180deg, rgba(255,255,255,.08), rgba(224,232,242,.3) 22%, rgba(197,208,222,.58) 62%, rgba(183,195,210,.74))`
        : `radial-gradient(circle at 18% 20%, rgba(255,181,64,.24), transparent 32%), radial-gradient(circle at 82% 16%, rgba(255,128,76,.12), transparent 20%), linear-gradient(180deg, rgba(9,12,19,.26), rgba(9,12,19,.82), rgba(9,12,19,.98))`;
    }
    const accent = palette.accent_rgb || this._activeAccentRgb();
    const surface = palette.surface_rgb || accent;
    const glow = palette.glow_rgb || accent;
    return theme === "light"
      ? `radial-gradient(circle at 18% 18%, rgba(${accent} / .16), transparent 28%), radial-gradient(circle at 82% 14%, rgba(${glow} / .1), transparent 20%), linear-gradient(180deg, rgba(255,255,255,.08), rgba(${surface} / .24) 22%, rgba(${surface} / .42) 60%, rgba(${surface} / .54))`
      : `radial-gradient(circle at 18% 20%, rgba(${accent} / .24), transparent 32%), radial-gradient(circle at 82% 16%, rgba(${glow} / .14), transparent 20%), linear-gradient(180deg, rgba(${surface} / .18), rgba(9,12,19,.82), rgba(9,12,19,.98))`;
  }

  _applyDynamicThemeStyles() {
    const host = this;
    const card = this.shadowRoot?.querySelector(".card");
    const accent = this._activeAccentColor();
    const palette = this._dynamicThemePalette();
    const artworkUrl = String(this._state.mobileDynamicThemeArtworkUrl || "").trim();
    const artworkCssUrl = artworkUrl ? `url(${JSON.stringify(artworkUrl)})` : "";
    host.style?.setProperty("--accent-color", accent);
    host.style?.setProperty("--ma-accent", accent);
    if (artworkCssUrl) {
      host.style?.setProperty("--dynamic-art-url", artworkCssUrl);
      card?.style?.setProperty("--dynamic-art-url", artworkCssUrl);
    } else {
      host.style?.removeProperty("--dynamic-art-url");
      card?.style?.removeProperty("--dynamic-art-url");
    }
    if (card) {
      card.style?.setProperty("--accent-color", accent);
      card.style?.setProperty("--ma-accent", accent);
      card.classList.toggle("dynamic-theme", !!palette);
    }
    if (!palette) {
      host.style?.removeProperty("--dynamic-accent-rgb");
      host.style?.removeProperty("--dynamic-surface-rgb");
      host.style?.removeProperty("--dynamic-glow-rgb");
      host.style?.removeProperty("--dynamic-theme-strength");
      card?.style?.removeProperty("--dynamic-accent-rgb");
      card?.style?.removeProperty("--dynamic-surface-rgb");
      card?.style?.removeProperty("--dynamic-glow-rgb");
      card?.style?.removeProperty("--dynamic-theme-strength");
      return;
    }
    const pairs = {
      "--dynamic-accent-rgb": palette.accent_rgb || this._activeAccentRgb(),
      "--dynamic-surface-rgb": palette.surface_rgb || this._activeAccentRgb(),
      "--dynamic-glow-rgb": palette.glow_rgb || this._activeAccentRgb(),
      "--dynamic-theme-strength": this._dynamicThemeStrengthValue(),
    };
    Object.entries(pairs).forEach(([key, value]) => {
      host.style?.setProperty(key, value);
      card?.style?.setProperty(key, value);
    });
  }

  _applyBackgroundMotionStyles() {
    const host = this;
    const card = this.shadowRoot?.querySelector(".card");
    const mode = this._mobileBackgroundMotionMode();
    const vars = mode === "extreme"
      ? {
          "--bg-motion-strength": "1.85",
          "--bg-motion-shift": "78px",
          "--bg-motion-scale": "1.24",
          "--bg-motion-duration": "12s",
          "--glow-motion-duration": "8s",
          "--aura-motion-duration": "11s",
          "--shade-motion-duration": "9s",
        }
      : mode === "strong"
      ? {
          "--bg-motion-strength": "1.35",
          "--bg-motion-shift": "46px",
          "--bg-motion-scale": "1.18",
          "--bg-motion-duration": "20s",
          "--glow-motion-duration": "14s",
          "--aura-motion-duration": "18s",
          "--shade-motion-duration": "16s",
        }
      : {
          "--bg-motion-strength": "1",
          "--bg-motion-shift": "28px",
          "--bg-motion-scale": "1.13",
          "--bg-motion-duration": "24s",
          "--glow-motion-duration": "18s",
          "--aura-motion-duration": "22s",
          "--shade-motion-duration": "20s",
        };
    Object.entries(vars).forEach(([key, value]) => {
      host.style?.setProperty(key, value);
      card?.style?.setProperty(key, value);
    });
    card?.classList.toggle("background-motion", mode !== "off");
    card?.classList.toggle("motion-subtle", mode === "subtle");
    card?.classList.toggle("motion-strong", mode === "strong");
    card?.classList.toggle("motion-extreme", mode === "extreme");
  }

  _currentServerDynamicThemePalette() {
    const player = this._getSelectedPlayer?.() || null;
    const attrs = player?.attributes || {};
    const currentQueueItem = this._state.maQueueState?.current_item || null;
    const currentMedia = currentQueueItem?.media_item || {};
    const rawCurrentMedia = player?.__homeiiRawPlayer?.current_media || attrs.current_media || attrs.currentMedia || {};
    const candidates = [
      attrs.media_palette,
      attrs.current_media_palette,
      rawCurrentMedia?.palette,
      currentQueueItem?.palette,
      currentQueueItem?.media_palette,
      currentQueueItem?.streamdetails?.stream_metadata?.palette,
      currentMedia?.palette,
      currentMedia?.metadata?.palette,
    ];
    for (const candidate of candidates) {
      const palette = HomeiiPaletteFoundation.normalizeMaPalette(candidate, {
        mode: this._mobileDynamicThemeMode(),
      });
      if (palette) return palette;
    }
    return null;
  }

  _libraryDetailArtworkUrl(detail = {}, size = 960) {
    const mediaType = String(detail?.media_type || detail?.type || "").toLowerCase();
    const artistInfo = detail?.artistInfo || null;
    const candidates = mediaType === "artist"
      ? [artistInfo, detail, detail?.media_item, detail?.metadata]
      : [detail, detail?.media_item, detail?.album, detail?.metadata, artistInfo];
    for (const candidate of candidates) {
      const art = this._artUrl(candidate, { size });
      if (art) return art;
    }
    return "";
  }

  _libraryDetailServerPalette(detail = {}) {
    if (this._mobileDynamicThemeMode() === "off") return null;
    const mediaType = String(detail?.media_type || detail?.type || "").toLowerCase();
    const browse = mediaType === "album" ? this._albumBrowseState(detail) : null;
    const selectedAlbum = browse?.albums?.[browse.index] || null;
    const artistInfo = detail?.artistInfo || null;
    const candidates = [
      detail?.palette,
      detail?.media_palette,
      detail?.image_palette,
      detail?.color_palette,
      detail?.metadata?.palette,
      detail?.metadata?.media_palette,
      detail?.metadata?.image_palette,
      detail?.media_item?.palette,
      detail?.media_item?.media_palette,
      detail?.media_item?.metadata?.palette,
      detail?.album?.palette,
      detail?.album?.metadata?.palette,
      selectedAlbum?.palette,
      selectedAlbum?.media_palette,
      selectedAlbum?.metadata?.palette,
      artistInfo?.palette,
      artistInfo?.media_palette,
      artistInfo?.metadata?.palette,
    ];
    for (const candidate of candidates) {
      const palette = HomeiiPaletteFoundation.normalizeMaPalette(candidate, {
        mode: this._mobileDynamicThemeMode(),
      });
      if (palette) return palette;
    }
    return null;
  }

  _setMenuDetailPalette(menu = null, palette = null) {
    if (!menu) return;
    const keys = [
      "--menu-detail-accent-rgb",
      "--menu-detail-surface-rgb",
      "--menu-detail-glow-rgb",
      "--ma-accent",
      "--accent-color",
    ];
    if (!palette) {
      keys.forEach((key) => menu.style.removeProperty(key));
      menu.classList.remove("has-menu-detail-palette");
      return;
    }
    const accentRgb = palette.accent_rgb || this._activeAccentRgb();
    const pairs = {
      "--menu-detail-accent-rgb": accentRgb,
      "--menu-detail-surface-rgb": palette.surface_rgb || accentRgb,
      "--menu-detail-glow-rgb": palette.glow_rgb || accentRgb,
      "--ma-accent": palette.accent || this._activeAccentColor(),
      "--accent-color": palette.accent || this._activeAccentColor(),
    };
    Object.entries(pairs).forEach(([key, value]) => menu.style.setProperty(key, value));
    menu.classList.add("has-menu-detail-palette");
  }

  _clearMenuDetailTheme(menu = null) {
    if (!menu) return;
    this._menuDetailThemeToken += 1;
    menu.classList.remove("has-menu-detail-theme");
    this._setMenuDetailPalette(menu, null);
  }

  _applyMenuDetailTheme(menu = null, detailArt = "", detail = {}) {
    if (!menu) return;
    const serverPalette = this._libraryDetailServerPalette(detail);
    menu.classList.toggle("has-menu-detail-theme", !!(detailArt || serverPalette));
    this._setMenuDetailPalette(menu, serverPalette);
    const token = ++this._menuDetailThemeToken;
    if (serverPalette || this._mobileDynamicThemeMode() === "off" || !detailArt) return;
    this._extractDynamicThemePalette(detailArt).then((palette) => {
      if (!palette || token !== this._menuDetailThemeToken) return;
      const currentMenu = this.$("mobileMenu");
      if (currentMenu !== menu || this._state.menuPage !== "media_detail") return;
      this._setMenuDetailPalette(menu, palette);
    }).catch(() => {});
  }

  _applyMenuLibraryThemeFromItems(menu = null, items = [], mediaType = "") {
    if (!menu) return;
    const playingArt = this._currentArtworkUrl(this._getSelectedPlayer(), this._state.maQueueState?.current_item || null, 960);
    if (playingArt) {
      menu.style.setProperty("--menu-dynamic-art", `url(${JSON.stringify(playingArt)})`);
      menu.classList.add("has-menu-art");
      this._clearMenuDetailTheme(menu);
      return;
    }
    const item = (Array.isArray(items) ? items : []).find((entry) => this._artUrl(entry, { size: 960 }));
    const art = item ? this._artUrl(item, { size: 960 }) : "";
    if (!item || !art) return;
    menu.style.setProperty("--menu-dynamic-art", `url(${JSON.stringify(art)})`);
    menu.classList.add("has-menu-art");
    this._applyMenuDetailTheme(menu, art, { ...item, media_type: item.media_type || item.type || mediaType });
  }

  async _extractDynamicThemePalette(artUrl = "") {
    const normalizedArt = String(artUrl || "").trim();
    const cacheKey = `${this._mobileDynamicThemeMode()}:${normalizedArt}`;
    if (!normalizedArt) return null;
    if (this._mobileDynamicThemePaletteCache.has(cacheKey)) {
      return this._mobileDynamicThemePaletteCache.get(cacheKey);
    }
    const promise = new Promise((resolve) => {
      try {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.referrerPolicy = "no-referrer";
        img.decoding = "async";
        img.onload = () => {
          try {
            const canvas = document.createElement("canvas");
            const size = 40;
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext("2d", { willReadFrequently: true });
            if (!ctx) {
              resolve(null);
              return;
            }
            ctx.drawImage(img, 0, 0, size, size);
            const { data } = ctx.getImageData(0, 0, size, size);
            let sum = [0, 0, 0];
            let sumWeight = 0;
            let vivid = [0, 0, 0];
            let vividWeight = 0;
            for (let index = 0; index < data.length; index += 16) {
              const alpha = (data[index + 3] || 0) / 255;
              if (alpha < 0.08) continue;
              const rgb = [data[index], data[index + 1], data[index + 2]];
              const [hue, saturation, lightness] = this._rgbToHsl(rgb);
              const balancedLight = 1 - Math.abs(lightness - 0.52);
              const weight = alpha * (0.35 + (saturation * 0.9) + (balancedLight * 0.55));
              sum = sum.map((entry, rgbIndex) => entry + (rgb[rgbIndex] * weight));
              sumWeight += weight;
              const vividSample = this._tunePaletteColor(rgb, { minSaturation: 0.48, minLightness: 0.4, maxLightness: 0.58 });
              const vividSampleWeight = alpha * (0.2 + (saturation * 1.9) + (balancedLight * 0.85) + (hue * 0.05));
              vivid = vivid.map((entry, rgbIndex) => entry + (vividSample[rgbIndex] * vividSampleWeight));
              vividWeight += vividSampleWeight;
            }
            if (!sumWeight || !vividWeight) {
              resolve(null);
              return;
            }
            const base = sum.map((entry) => this._clampByte(entry / sumWeight));
            const vividTuple = vivid.map((entry) => this._clampByte(entry / vividWeight));
            resolve(HomeiiPaletteFoundation.buildDynamicThemePalette({
              baseTuple: base,
              vividTuple,
              mode: this._mobileDynamicThemeMode(),
            }));
          } catch (_) {
            resolve(null);
          }
        };
        img.onerror = () => resolve(null);
        img.src = normalizedArt;
      } catch (_) {
        resolve(null);
      }
    });
    this._mobileDynamicThemePaletteCache.set(cacheKey, promise);
    const resolved = await promise;
    this._mobileDynamicThemePaletteCache.set(cacheKey, resolved);
    return resolved;
  }

  async _syncDynamicThemeArtwork(artUrl = "") {
    const normalizedArt = String(artUrl || "").trim();
    const mode = this._mobileDynamicThemeMode();
    const artworkKey = normalizedArt ? `${mode}:${normalizedArt}` : "";
    if (mode === "off" || !normalizedArt) {
      this._mobileDynamicThemeToken += 1;
      this._state.mobileDynamicThemeArtwork = "";
      this._state.mobileDynamicThemeArtworkUrl = "";
      this._state.mobileDynamicThemePalette = null;
      this._applyDynamicThemeRenderState(`off:${normalizedArt}`, normalizedArt);
      this._syncAmbientLightForCurrentMedia("theme-off");
      return;
    }
    if (this._state.mobileDynamicThemeArtwork === artworkKey) {
      this._state.mobileDynamicThemeArtworkUrl = normalizedArt;
      const serverPalette = this._currentServerDynamicThemePalette();
      if (serverPalette) {
        this._state.mobileDynamicThemePalette = serverPalette;
        this._state.controlRoomRenderedHtml = "";
        this._state.controlRoomRenderSignature = "";
      }
      this._applyDynamicThemeRenderState(artworkKey, normalizedArt);
      this._syncAmbientLightForCurrentMedia("theme-cache");
      return;
    }
    this._state.mobileDynamicThemeArtwork = artworkKey;
    this._state.mobileDynamicThemeArtworkUrl = normalizedArt;
    const token = ++this._mobileDynamicThemeToken;
    const serverPalette = this._currentServerDynamicThemePalette();
    const palette = serverPalette || await this._extractDynamicThemePalette(normalizedArt);
    if (token !== this._mobileDynamicThemeToken) return;
    this._state.mobileDynamicThemePalette = palette;
    this._state.controlRoomRenderedHtml = "";
    this._state.controlRoomRenderSignature = "";
    this._applyDynamicThemeRenderState(artworkKey, normalizedArt);
    this._syncAmbientLightForCurrentMedia("theme-palette");
    if (this._state.controlRoomOpen) this._syncControlRoomUi();
  }

  _mobileNightMode() {
    return HomeiiNightFoundation.normalizeNightMode(this._state.mobileNightMode);
  }

  _normalizeClockTime(value, fallback = "22:00") {
    return HomeiiNightFoundation.normalizeClockTime(value, fallback);
  }

  _clockMinutesOfDay(value, fallback = "22:00") {
    return HomeiiNightFoundation.clockMinutesOfDay(value, fallback);
  }

  _defaultNightModeDays() {
    return HomeiiNightFoundation.defaultNightModeDays();
  }

  _normalizeNightModeDays(value) {
    return HomeiiNightFoundation.normalizeNightModeDays(value, this._defaultNightModeDays());
  }

  _nightModeDays() {
    return this._normalizeNightModeDays(this._state.mobileNightModeDays);
  }

  _nightModeDayOptions() {
    return [
      [0, this._i18n("ui.sun")],
      [1, this._i18n("ui.mon")],
      [2, this._i18n("ui.tue")],
      [3, this._i18n("ui.wed")],
      [4, this._i18n("ui.thu")],
      [5, this._i18n("ui.fri")],
      [6, this._i18n("ui.sat")],
    ];
  }

  _nightModeWindow() {
    return HomeiiNightFoundation.resolveNightModeWindow(
      this._state.mobileNightModeStart || "22:00",
      this._state.mobileNightModeEnd || "06:00",
      { start: "22:00", end: "06:00" },
    );
  }

  _isMinutesInsideWindow(minutes, startMinutes, endMinutes) {
    return HomeiiNightFoundation.isMinutesInsideWindow(minutes, startMinutes, endMinutes);
  }

  _isNightModeActive(date = new Date()) {
    const windowRange = this._nightModeWindow();
    return HomeiiNightFoundation.isNightModeActive({
      mode: this._mobileNightMode(),
      start: windowRange.start,
      end: windowRange.end,
      days: this._nightModeDays(),
      date,
    });
  }

  _sleepTimerRemainingMs(now = Date.now()) {
    return HomeiiNightFoundation.sleepTimerRemainingMs(this._state.mobileSleepTimerEndsAt || 0, now);
  }

  _sleepTimerRemainingLabel() {
    return HomeiiNightFoundation.sleepTimerRemainingLabel(this._sleepTimerRemainingMs());
  }

  _sleepTimerFooterLabel() {
    return HomeiiNightFoundation.sleepTimerFooterLabel(this._sleepTimerRemainingMs());
  }

  _sleepTimerStartedFromNightMode() {
    return HomeiiNightFoundation.sleepTimerStartedFromNightMode(
      this._sleepTimerRemainingMs(),
      this._state.mobileSleepTimerOrigin || "",
    );
  }

  _sleepTimerChipVisible() {
    return HomeiiNightFoundation.sleepTimerChipVisible(
      this._sleepTimerRemainingMs(),
      this._state.mobileSleepTimerOrigin || "",
    );
  }

  _sleepTimerCornerInnerHtml() {
    const label = this._sleepTimerFooterLabel();
    const active = !!label && this._sleepTimerChipVisible();
    if (!active) return "";
    const menuOpen = !!this._state.mobileSleepTimerMenuOpen;
    return `
      <div class="sleep-timer-menu" id="sleepTimerMenu"${menuOpen ? `` : ` hidden`}>
        <button class="sleep-timer-menu-btn" data-sleep-timer-add="15">+15</button>
        <button class="sleep-timer-menu-btn" data-sleep-timer-add="30">+30</button>
        <button class="sleep-timer-menu-btn" data-sleep-timer-add="60">+60</button>
        <button class="sleep-timer-menu-btn danger" data-sleep-timer-clear>${this._esc(this._i18n("ui.cancel_2"))}</button>
        <button class="sleep-timer-menu-btn ghost" data-sleep-timer-close>${this._esc(this._i18n("ui.close"))}</button>
      </div>
      <button class="sleep-timer-chip active" id="sleepTimerChip" title="${this._esc(this._i18n("ui.sleep_timer"))}">
        ${this._iconSvg("timer")}
        <span id="sleepTimerChipLabel">${this._esc(label)}</span>
      </button>
    `;
  }

  _scheduledStartDays() {
    return this._normalizeNightModeDays(this._state.mobileStartTimerDays);
  }

  _newScheduledStartId() {
    return `schedule_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  }

  _normalizeScheduledStartSchedule(schedule = {}, index = 0) {
    const id = String(schedule?.id || "").trim() || `schedule_${index + 1}`;
    const volume = Math.max(0, Math.min(100, Number(schedule?.volume ?? schedule?.mobileStartTimerVolume ?? 35) || 35));
    const afterRun = ["disable", "off"].includes(String(schedule?.afterRun || schedule?.after_run || "").trim())
      ? "disable"
      : "keep";
    return {
      id,
      enabled: schedule?.enabled !== false,
      time: this._normalizeClockTime(schedule?.time || "07:00", "07:00"),
      player: String(schedule?.player || "").trim(),
      playlist: String(schedule?.playlist || "").trim(),
      playlistName: String(schedule?.playlistName || "").trim(),
      volume,
      days: this._normalizeNightModeDays(schedule?.days),
      lastRunKey: String(schedule?.lastRunKey || "").trim(),
      afterRun,
    };
  }

  _scheduledStartSchedules() {
    const raw = Array.isArray(this._state.mobileStartSchedules) ? this._state.mobileStartSchedules : [];
    const schedules = raw
      .map((schedule, index) => this._normalizeScheduledStartSchedule(schedule, index))
      .filter((schedule, index, list) => schedule.id && list.findIndex((candidate) => candidate.id === schedule.id) === index);
    this._state.mobileStartSchedules = schedules;
    return schedules;
  }

  _engineScheduleToScheduledStartSchedule(schedule = {}, index = 0) {
    const mediaId = String(schedule?.media_id || schedule?.media_content_id || schedule?.playlist || "").trim();
    return this._normalizeScheduledStartSchedule({
      id: schedule?.id || schedule?.schedule_id || `engine_schedule_${index + 1}`,
      enabled: schedule?.enabled !== false,
      time: schedule?.time || "07:00",
      player: schedule?.player || schedule?.entity_id || "",
      playlist: mediaId,
      playlistName: schedule?.playlistName || schedule?.playlist_name || schedule?.media_name || schedule?.name || "",
      volume: schedule?.volume ?? 35,
      days: schedule?.days,
      lastRunKey: schedule?.lastRunKey || schedule?.last_run_key || "",
      afterRun: schedule?.afterRun || schedule?.after_run || "keep",
    }, index);
  }

  _scheduledStartEnginePayload(schedule = {}) {
    const normalized = this._normalizeScheduledStartSchedule(schedule);
    const playlistLabel = normalized.playlistName || this._scheduledStartPlaylistLabel(normalized) || "";
    const mediaMode = normalized.playlist ? "selected" : "random_playlist";
    return {
      kind: "wake_playback",
      action: "wake_playback",
      schedule_id: String(normalized.id || "").trim(),
      name: playlistLabel || this._i18n("ui.scheduled_start"),
      player: this._scheduledStartPlayerId(normalized),
      media_id: normalized.playlist,
      playlist: normalized.playlist,
      media_type: "playlist",
      media_name: playlistLabel,
      playlist_name: playlistLabel,
      media_mode: mediaMode,
      selection_mode: mediaMode,
      enqueue: "play",
      time: normalized.time,
      days: this._normalizeNightModeDays(normalized.days),
      volume: Math.max(0, Math.min(100, Number(normalized.volume || 35) || 35)),
      enabled: normalized.enabled !== false,
      after_run: normalized.afterRun || "keep",
    };
  }

  _strictSchedulePlayers() {
    const seen = new Set();
    const players = [
      ...(Array.isArray(this._state.configurableMusicAssistantPlayers) ? this._state.configurableMusicAssistantPlayers : []),
      ...(Array.isArray(this._state.players) ? this._state.players : []),
    ];
    return players.filter((player) => {
      const entityId = String(player?.entity_id || "").trim();
      if (!entityId || seen.has(entityId)) return false;
      const strict = this._isDirectMaPlayer?.(player)
        || HomeiiPlayersFoundation.isMusicAssistantPlayer(player, this._hass?.entities?.[entityId]);
      if (!strict) return false;
      seen.add(entityId);
      return true;
    });
  }

  async _homeiiEngineReadyForPersistence() {
    if (!this._homeiiEngineEnabled()) return false;
    const context = await this._refreshHomeiiEngineContext({ force: true }).catch(() => null);
    return !!(context?.available || this._state.engineAvailable);
  }

  async _syncScheduleToHomeiiEngine(schedule = {}, options = {}) {
    if (!this._homeiiEngineEnabled()) return false;
    const payload = this._scheduledStartEnginePayload(schedule);
    if (!payload.player) return false;
    const ready = await this._homeiiEngineReadyForPersistence();
    if (!ready) {
      if (this._homeiiEngineRequired() || options.toast) {
        this._toastError(this._m("Saved locally, but HOMEii Flow Engine did not confirm the schedule.", "נשמר מקומית, אבל HOMEii Flow Engine לא אישר את התזמון."));
      }
      return false;
    }
    try {
      const result = await this._homeiiEngineSetSchedule(payload, { required: true });
      if (!result) return false;
      const confirmed = await this._confirmScheduleInHomeiiEngine(payload.schedule_id);
      if (!confirmed && (this._homeiiEngineRequired() || options.toast)) {
        this._toastError("HOMEii Flow Engine accepted the schedule write, but it was not found when reading it back.");
      }
      return confirmed;
    } catch (error) {
      if (this._homeiiEngineRequired() || options.toast) this._toastError(error?.message || "HOMEii Flow Engine schedule sync failed");
      return false;
    }
  }

  async _confirmScheduleInHomeiiEngine(scheduleId = "") {
    const id = String(scheduleId || "").trim();
    if (!id || !this._homeiiEngineEnabled()) return false;
    try {
      const result = await this._homeiiEngineGetSchedules({}, { required: true, timeoutMs: this._homeiiEngineTimeoutMs() });
      const schedules = Array.isArray(result?.schedules) ? result.schedules : [];
      return schedules.some((schedule) => String(schedule?.id || schedule?.schedule_id || "").trim() === id);
    } catch (_) {
      return false;
    }
  }

  async _deleteScheduleFromHomeiiEngine(id = "", options = {}) {
    const scheduleId = String(id || "").trim();
    if (!scheduleId || !this._homeiiEngineEnabled()) return false;
    const ready = await this._homeiiEngineReadyForPersistence();
    if (!ready) return false;
    try {
      const result = await this._homeiiEngineDeleteSchedule({ schedule_id: scheduleId }, { required: true });
      return !!result;
    } catch (error) {
      if (this._homeiiEngineRequired() || options.toast) this._toastError(error?.message || "HOMEii Flow Engine schedule delete failed");
      return false;
    }
  }

  async _hydrateSchedulesFromHomeiiEngine() {
    if (!this._homeiiEngineEnabled()) return false;
    const result = await this._homeiiEngineGetSchedules();
    const engineSchedules = Array.isArray(result?.schedules) ? result.schedules : [];
    if (!engineSchedules.length) {
      this._scheduledStartSchedules().forEach((schedule) => this._syncScheduleToHomeiiEngine(schedule).catch(() => {}));
      return false;
    }
    const schedules = engineSchedules.map((schedule, index) => this._engineScheduleToScheduledStartSchedule(schedule, index));
    this._state.mobileStartSchedules = schedules;
    this._state.mobileStartTimerEnabled = schedules.some((schedule) => schedule.enabled !== false);
    const editId = String(this._state.mobileStartScheduleEditId || "").trim();
    if (editId && !schedules.some((schedule) => schedule.id === editId)) this._state.mobileStartScheduleEditId = "";
    this._writeSchedulesToLocalStorage();
    return true;
  }

  _activeScheduledStartSchedules() {
    return this._scheduledStartSchedules().filter((schedule) => schedule.enabled !== false);
  }

  _scheduledStartPlayerId(schedule = null) {
    const configured = String(schedule?.player || this._state.mobileStartTimerPlayer || "").trim();
    if (configured && this._playerByEntityId(configured)) return configured;
    return String(this._state.selectedPlayer || this._getSelectedPlayer()?.entity_id || "").trim();
  }

  _scheduledStartMorningKeywords() {
    return [
      "morning", "sunrise", "coffee", "breakfast", "wake", "wakeup", "wake up",
      "calm", "soft", "easy", "acoustic", "chill", "lofi", "lo-fi", "pleasant",
      "בוקר", "זריחה", "קפה", "ארוחת בוקר", "יקיצה", "רגוע", "רך", "נעים", "אקוסטי", "צ׳יל", "שקט",
    ];
  }

  async _loadScheduledStartPlaylists(force = false) {
    const now = Date.now();
    const cached = Array.isArray(this._state.mobileStartTimerPlaylists)
      ? this._state.mobileStartTimerPlaylists
      : [];
    const fresh = cached.length && !force && (now - Number(this._state.mobileStartTimerPlaylistsFetchedAt || 0) < 10 * 60 * 1000);
    if (fresh || this._state.mobileStartTimerPlaylistsLoading) return cached;
    this._state.mobileStartTimerPlaylistsLoading = true;
    try {
      const [allPlaylists, likedPlaylists, randomPlaylists] = await Promise.allSettled([
        this._fetchLibrary("playlist", "sort_name", 500, false),
        this._fetchLibrary("playlist", "sort_name", 220, true),
        this._fetchLibrary("playlist", "random", 80, false),
      ]);
      const playlists = [
        ...(Array.isArray(allPlaylists.value) ? allPlaylists.value : []),
        ...(Array.isArray(likedPlaylists.value) ? likedPlaylists.value : []),
        ...(Array.isArray(randomPlaylists.value) ? randomPlaylists.value : []),
      ]
        .map((item) => this._normalizeMediaItem(item))
        .filter((item) => String(item?.uri || "").trim())
        .filter((item) => String(item?.media_type || "playlist").toLowerCase() === "playlist")
        .filter((item, index, list) => list.findIndex((candidate) => String(candidate?.uri || "").trim() === String(item?.uri || "").trim()) === index);
      this._state.mobileStartTimerPlaylists = playlists;
      this._state.mobileStartTimerPlaylistsFetchedAt = Date.now();
      if (!Array.isArray(this._state.mobileRecommendationPlaylists) || !this._state.mobileRecommendationPlaylists.length) {
        this._state.mobileRecommendationPlaylists = playlists.slice(0, 24);
        this._state.mobileRecommendationPlaylistsFetchedAt = Date.now();
      }
      return playlists;
    } catch (_) {
      return cached;
    } finally {
      this._state.mobileStartTimerPlaylistsLoading = false;
    }
  }

  _scheduledStartPlaylistLabel(schedule = null) {
    const selected = String(schedule?.playlist || this._state.mobileStartTimerPlaylist || "").trim();
    if (!selected) return this._i18n("ui.random_gentle_morning_mix");
    const playlists = Array.isArray(this._state.mobileStartTimerPlaylists) ? this._state.mobileStartTimerPlaylists : [];
    const match = playlists.find((item) => String(item?.uri || "").trim() === selected);
    return match?.name || match?.title || schedule?.playlistName || this._state.mobileStartTimerPlaylistName || this._i18n("ui.selected_playlist");
  }

  _scheduledStartPlaylistOptionsHtml(schedule = null) {
    const selected = String(schedule?.playlist || this._state.mobileStartTimerPlaylist || "").trim();
    const playlists = Array.isArray(this._state.mobileStartTimerPlaylists) ? this._state.mobileStartTimerPlaylists : [];
    const selectedKnown = selected && playlists.some((item) => String(item?.uri || "").trim() === selected);
    const options = [
      `<option value="" ${selected ? "" : "selected"}>${this._esc(this._i18n("ui.random_gentle_morning_mix"))}</option>`,
    ];
    if (selected && !selectedKnown) {
      options.push(`<option value="${this._esc(selected)}" selected>${this._esc(schedule?.playlistName || this._state.mobileStartTimerPlaylistName || this._i18n("ui.selected_playlist"))}</option>`);
    }
    playlists.forEach((item) => {
      const uri = String(item?.uri || "").trim();
      if (!uri) return;
      const name = item.name || item.title || uri;
      options.push(`<option value="${this._esc(uri)}" ${uri === selected ? "selected" : ""}>${this._esc(name)}</option>`);
    });
    return options.join("");
  }

  _pickScheduledStartPlaylist(playlists = [], schedule = null) {
    const selected = String(schedule?.playlist || this._state.mobileStartTimerPlaylist || "").trim();
    const candidates = (Array.isArray(playlists) ? playlists : [])
      .map((item) => this._normalizeMediaItem(item))
      .filter((item) => String(item?.uri || "").trim())
      .filter((item) => String(item?.media_type || "playlist").toLowerCase() === "playlist");
    if (!candidates.length) return null;
    if (selected) {
      const match = candidates.find((item) => String(item?.uri || "").trim() === selected);
      if (match) return match;
    }
    const keywords = this._scheduledStartMorningKeywords();
    const morningMatches = candidates.filter((item) => {
      const haystack = [
        item?.name,
        item?.title,
        item?.metadata?.description,
        item?.description,
        item?.provider_label,
      ].filter(Boolean).join(" ").toLowerCase();
      return keywords.some((keyword) => haystack.includes(keyword));
    });
    const pool = morningMatches.length ? morningMatches : candidates;
    return pool[Math.floor(Math.random() * pool.length)] || null;
  }

  _scheduledStartStatusLabel() {
    const schedules = this._scheduledStartSchedules();
    const activeSchedules = schedules.filter((schedule) => schedule.enabled !== false);
    if (!activeSchedules.length) {
      return this._i18n("ui.no_scheduled_start_is_active");
    }
    if (activeSchedules.length > 1) {
      return this._i18n("ui.scheduled_starts_active_count", { count: activeSchedules.length });
    }
    const schedule = activeSchedules[0];
    const player = this._playerByEntityId(this._scheduledStartPlayerId(schedule));
    const playerName = player?.attributes?.friendly_name || this._i18n("ui.selected_player_3");
    const dayLabels = this._nightModeDayOptions()
      .filter(([value]) => this._normalizeNightModeDays(schedule.days).includes(value))
      .map(([, label]) => label)
      .join(" ");
    const time = this._normalizeClockTime(schedule.time || "07:00", "07:00");
    const volume = Math.max(0, Math.min(100, Number(schedule.volume || 35) || 35));
    const playlist = this._scheduledStartPlaylistLabel(schedule);
    return `${time} · ${playerName} · ${playlist} · ${volume}% · ${dayLabels}`;
  }

  async _setScheduledStartFromMenu() {
    const timeInput = this.$("scheduledStartTimeInput");
    const playerSelect = this.$("scheduledStartPlayerSelect");
    const playlistSelect = this.$("scheduledStartPlaylistSelect");
    const volumeInput = this.$("scheduledStartVolumeInput");
    const afterRunSelect = this.$("scheduledStartAfterRunSelect");
    const checkedDays = Array.from(this.shadowRoot?.querySelectorAll("input[data-start-timer-day]:checked") || [])
      .map((input) => Number(input.dataset.startTimerDay))
      .filter((value) => Number.isInteger(value) && value >= 0 && value <= 6);
    const playerId = String(playerSelect?.value || this._state.selectedPlayer || "").trim();
    if (!playerId) {
      this._toastError(this._i18n("ui.select_a_player_first"));
      return false;
    }
    const editId = String(this._state.mobileStartScheduleEditId || "").trim();
    const schedule = this._normalizeScheduledStartSchedule({
      id: editId && editId !== "__new__" ? editId : this._newScheduledStartId(),
      enabled: true,
      time: this._normalizeClockTime(timeInput?.value || "07:00", "07:00"),
      player: playerId,
      playlist: String(playlistSelect?.value || "").trim(),
      playlistName: String(playlistSelect?.value || "").trim()
      ? String(playlistSelect?.selectedOptions?.[0]?.textContent || "").trim()
      : "",
      volume: Math.max(0, Math.min(100, Number(volumeInput?.value || 35) || 35)),
      days: this._normalizeNightModeDays(checkedDays),
      lastRunKey: "",
      afterRun: String(afterRunSelect?.value || "keep") === "disable" ? "disable" : "keep",
    });
    const schedules = this._scheduledStartSchedules();
    const existingIndex = schedules.findIndex((item) => item.id === schedule.id);
    if (existingIndex >= 0) schedules[existingIndex] = schedule;
    else schedules.push(schedule);
    this._state.mobileStartSchedules = schedules;
    this._state.mobileStartScheduleEditId = "";
    this._state.mobileStartTimerEnabled = schedules.some((item) => item.enabled !== false);
    this._state.mobileStartTimerTime = schedule.time;
    this._state.mobileStartTimerPlayer = schedule.player;
    this._state.mobileStartTimerPlaylist = schedule.playlist;
    this._state.mobileStartTimerPlaylistName = schedule.playlistName;
    this._state.mobileStartTimerVolume = schedule.volume;
    this._state.mobileStartTimerDays = schedule.days;
    this._state.mobileStartTimerLastRunKey = schedule.lastRunKey;
    this._state.mobileStartTimerAfterRun = schedule.afterRun || "keep";
    this._persistMobileAppearance();
    const engineSaved = await this._syncScheduleToHomeiiEngine(schedule, { toast: true });
    this._toastSuccess(engineSaved
      ? this._m("Schedule saved to HOMEii Flow Engine", "התזמון נשמר ב-HOMEii Flow Engine")
      : this._i18n("ui.scheduled_start_saved"));
    return true;
  }

  async _clearScheduledStart(showToast = false) {
    const editId = String(this._state.mobileStartScheduleEditId || "").trim();
    if (editId && editId !== "__new__") {
      this._state.mobileStartSchedules = this._scheduledStartSchedules().filter((schedule) => schedule.id !== editId);
      await this._deleteScheduleFromHomeiiEngine(editId, { toast: showToast });
    } else if (!editId) {
      await Promise.allSettled(this._scheduledStartSchedules().map((schedule) => this._deleteScheduleFromHomeiiEngine(schedule.id, { toast: false })));
      this._state.mobileStartSchedules = [];
    }
    this._state.mobileStartScheduleEditId = "";
    this._state.mobileStartTimerEnabled = this._activeScheduledStartSchedules().length > 0;
    this._state.mobileStartTimerLastRunKey = "";
    this._persistMobileAppearance();
    if (showToast) this._toast(this._i18n("ui.scheduled_start_cleared"));
  }

  _editScheduledStart(id = "") {
    const schedule = this._scheduledStartSchedules().find((item) => item.id === id);
    if (!schedule) return false;
    this._state.mobileStartScheduleEditId = schedule.id;
    this._state.mobileStartTimerEnabled = schedule.enabled !== false;
    this._state.mobileStartTimerTime = schedule.time;
    this._state.mobileStartTimerPlayer = schedule.player;
    this._state.mobileStartTimerPlaylist = schedule.playlist;
    this._state.mobileStartTimerPlaylistName = schedule.playlistName;
    this._state.mobileStartTimerVolume = schedule.volume;
    this._state.mobileStartTimerDays = schedule.days;
    this._state.mobileStartTimerLastRunKey = schedule.lastRunKey || "";
    this._state.mobileStartTimerAfterRun = schedule.afterRun || "keep";
    return true;
  }

  _newScheduledStartDraft() {
    this._state.mobileStartScheduleEditId = "__new__";
    this._state.mobileStartTimerEnabled = false;
    this._state.mobileStartTimerTime = "07:00";
    this._state.mobileStartTimerPlayer = this._state.selectedPlayer || "";
    this._state.mobileStartTimerPlaylist = "";
    this._state.mobileStartTimerPlaylistName = "";
    this._state.mobileStartTimerVolume = 35;
    this._state.mobileStartTimerDays = [0, 1, 2, 3, 4, 5, 6];
    this._state.mobileStartTimerLastRunKey = "";
    this._state.mobileStartTimerAfterRun = "keep";
  }

  async _toggleScheduledStart(id = "") {
    const schedules = this._scheduledStartSchedules();
    const index = schedules.findIndex((schedule) => schedule.id === id);
    if (index < 0) return false;
    schedules[index] = { ...schedules[index], enabled: schedules[index].enabled === false };
    this._state.mobileStartSchedules = schedules;
    this._state.mobileStartTimerEnabled = schedules.some((item) => item.enabled !== false);
    this._persistMobileAppearance();
    await this._syncScheduleToHomeiiEngine(schedules[index], { toast: true });
    return true;
  }

  async _deleteScheduledStart(id = "") {
    const schedules = this._scheduledStartSchedules().filter((schedule) => schedule.id !== id);
    this._state.mobileStartSchedules = schedules;
    if (this._state.mobileStartScheduleEditId === id) this._state.mobileStartScheduleEditId = "";
    this._state.mobileStartTimerEnabled = schedules.some((item) => item.enabled !== false);
    this._persistMobileAppearance();
    await this._deleteScheduleFromHomeiiEngine(id, { toast: true });
    return true;
  }

  async _runScheduledStart(entityId, schedule = null) {
    if (!entityId || this._state.mobileStartTimerRunPending) return;
    this._state.mobileStartTimerRunPending = true;
    try {
      const activeSchedule = schedule ? this._normalizeScheduledStartSchedule(schedule) : null;
      const volume = Math.max(0, Math.min(100, Number(activeSchedule?.volume ?? this._state.mobileStartTimerVolume ?? 35) || 35));
      await this._setPlayerVolumeFor(entityId, volume / 100);
      const playlists = await this._loadScheduledStartPlaylists();
      const pick = this._pickScheduledStartPlaylist(playlists, activeSchedule);
      let ok = false;
      if (pick?.uri) {
        ok = await this._playMediaOnPlayer(entityId, pick.uri, pick.media_type || "playlist", "play", {
          label: pick.name || pick.title || this._i18n("ui.morning_mix"),
          silent: true,
        });
      }
      if (!ok) {
        await this._callHomeiiEnginePlayerCommand(entityId, "play");
      }
      const label = pick?.name || pick?.title || this._i18n("ui.scheduled_start");
      this._toastSuccess(this._i18n("ui.scheduled_start_activated_label", { label }));
    } catch (error) {
      this._toastError(error?.message || this._i18n("ui.scheduled_start_failed"));
    } finally {
      this._state.mobileStartTimerRunPending = false;
    }
  }

  _syncScheduledStartState(date = new Date()) {
    const schedules = this._activeScheduledStartSchedules();
    if (!schedules.length) return;
    if (this._homeiiEngineEnabled() && this._state.engineAvailable) return;
    let changed = false;
    schedules.forEach((schedule) => {
      const time = this._normalizeClockTime(schedule.time || "07:00", "07:00");
      const [hours, minutes] = time.split(":").map((part) => Number(part) || 0);
      if (date.getHours() !== hours || date.getMinutes() !== minutes) return;
      const enabledDays = new Set(this._normalizeNightModeDays(schedule.days));
      if (!enabledDays.has(Number(date.getDay()))) return;
      const runKey = `${schedule.id}-${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}-${time}`;
      if (schedule.lastRunKey === runKey) return;
      const entityId = this._scheduledStartPlayerId(schedule);
      if (!entityId) return;
      schedule.lastRunKey = runKey;
      if (schedule.afterRun === "disable") schedule.enabled = false;
      changed = true;
      this._runScheduledStart(entityId, schedule).catch((error) => {
        this._toastError(error?.message || this._i18n("ui.scheduled_start_failed"));
      });
    });
    if (changed) {
      const byId = new Map(this._state.mobileStartSchedules.map((schedule) => [schedule.id, schedule]));
      schedules.forEach((schedule) => byId.set(schedule.id, schedule));
      this._state.mobileStartSchedules = Array.from(byId.values());
      this._state.mobileStartTimerEnabled = this._state.mobileStartSchedules.some((schedule) => schedule.enabled !== false);
      this._persistMobileAppearance();
    }
  }

  _tabletAutoFitEnabled() {
    return HomeiiResponsiveFoundation.tabletAutoFitEnabled(this._layoutModeConfig());
  }

  _tabletAutoFitDense(showNightRow = this._mobileNightMode() !== "off", showUpNext = false) {
    return HomeiiResponsiveFoundation.tabletAutoFitDense(this._layoutModeConfig(), {
      showNightRow,
      showUpNext,
    });
  }

  _mobileContentDense(layoutMode = this._layoutModeConfig(), layoutProfile = null, options = {}) {
    if (layoutMode === "tablet") return false;
    const profile = layoutProfile || this._layoutProfileConfig(layoutMode);
    const width = Number(profile?.width || this._getCardWidth(this._lastCardWidth || 0));
    const height = Number(profile?.height || this._lastCardHeight || 0);
    const showNightRow = typeof options.showNightRow === "boolean"
      ? options.showNightRow
      : this._mobileNightMode() !== "off";
    const showUpNextInline = typeof options.showUpNextInline === "boolean"
      ? options.showUpNextInline
      : (this._mobileShowUpNextEnabled() && !!this._mobileUpNextItem());
    const narrowPhone = width > 0 && width <= 620;
    const kioskLikePortrait = narrowPhone && profile?.aspect === "portrait";
    const shortHeight = profile?.heightSize === "short" || profile?.tight || (height > 0 && height < 780);
    const denseContent = showNightRow || showUpNextInline;
    return !!(denseContent || shortHeight || kioskLikePortrait || profile?.size === "xs");
  }

  _syncTabletAutoFitUi(hasUpNext = null) {
    const card = this.shadowRoot?.querySelector(".card");
    if (!card) return;
    const showNightRow = this._mobileNightMode() !== "off";
    const upNextVisible = typeof hasUpNext === "boolean"
      ? hasUpNext
      : (this._mobileShowUpNextEnabled() && !!this._mobileUpNextItem());
    const layoutMode = this._layoutModeConfig();
    const flags = HomeiiResponsiveFoundation.resolveTabletAutoFitFlags(layoutMode, {
      showNightRow,
      showUpNext: upNextVisible,
    });
    const layoutProfile = this._layoutProfileConfig(layoutMode);
    card.classList.toggle("tablet-auto-fit", flags.autoFit);
    card.classList.toggle("tablet-fit-night", flags.showNight);
    card.classList.toggle("tablet-fit-up-next", flags.showUpNext);
    card.classList.toggle("tablet-fit-dense", flags.dense);
    card.classList.toggle("mobile-content-dense", this._mobileContentDense(layoutMode, layoutProfile, {
      showNightRow,
      showUpNextInline: upNextVisible,
    }));
  }

  _homeiiSleepTimerId(playerId = "") {
    const safePlayer = String(playerId || "player").trim().toLowerCase().replace(/[^a-z0-9_]+/g, "_").replace(/^_+|_+$/g, "") || "player";
    return `sleep_${safePlayer}`;
  }

  async _syncSleepTimerToHomeiiEngine(minutes = 15, source = "general", options = {}) {
    if (!this._homeiiEngineEnabled()) return false;
    const playerId = String(this._state.mobileSleepTimerPlayer || this._state.selectedPlayer || this._getSelectedPlayer()?.entity_id || "").trim();
    const target = Number(this._state.mobileSleepTimerEndsAt || 0);
    if (!playerId || !target) return false;
    const ready = await this._homeiiEngineReadyForPersistence();
    if (!ready) {
      if (this._homeiiEngineRequired() || options.toast) {
        this._toastError(this._m("The Engine did not confirm the sleep timer.", "ה־Engine לא אישר את שמירת הטיימר."));
      }
      return false;
    }
    try {
      const result = await this._homeiiEngineSetTimer({
        timer_id: this._homeiiSleepTimerId(playerId),
        timer_type: "sleep",
        player: playerId,
        action: "pause",
        minutes: Math.max(1, Number(minutes) || Math.ceil(this._sleepTimerRemainingMs() / 60000) || 1),
        ends_at: new Date(target).toISOString(),
        origin: HomeiiNightFoundation.normalizeSleepTimerOrigin(source),
        enabled: true,
      }, { required: true });
      if (!result) {
        this._toastError(this._m("The Engine did not confirm the sleep timer.", "ה־Engine לא אישר את שמירת הטיימר."));
        return false;
      }
      const confirmed = await this._confirmSleepTimerInHomeiiEngine(this._homeiiSleepTimerId(playerId), playerId, target);
      if (!confirmed && (this._homeiiEngineRequired() || options.toast)) {
        this._toastError("HOMEii Flow Engine accepted the timer write, but it was not found when reading it back.");
      }
      return confirmed;
    } catch (error) {
      if (this._homeiiEngineRequired() || options.toast) this._toastError(error?.message || "HOMEii Flow Engine timer sync failed");
      return false;
    }
  }

  async _confirmSleepTimerInHomeiiEngine(timerId = "", playerId = "", expectedTarget = 0) {
    const id = String(timerId || "").trim();
    const player = String(playerId || "").trim();
    if ((!id && !player) || !this._homeiiEngineEnabled()) return false;
    try {
      const result = await this._homeiiEngineGetTimers({}, { required: true, timeoutMs: this._homeiiEngineTimeoutMs() });
      const timers = Array.isArray(result?.timers) ? result.timers : [];
      const now = Date.now();
      return timers.some((timer) => {
        const timerType = String(timer?.type || timer?.timer_type || "sleep");
        const targetMs = Date.parse(timer?.ends_at || timer?.target_at || "");
        const matchesId = id && String(timer?.id || timer?.timer_id || "").trim() === id;
        const matchesPlayer = player && String(timer?.player || timer?.entity_id || "").trim() === player;
        return timerType === "sleep" && timer.enabled !== false && (matchesId || matchesPlayer)
          && Number.isFinite(targetMs) && targetMs > now
          && (!expectedTarget || Math.abs(targetMs - expectedTarget) < 1000);
      });
    } catch (_) {
      return false;
    }
  }

  async _deleteSleepTimerFromHomeiiEngine(playerId = "", options = {}) {
    if (!this._homeiiEngineEnabled()) return false;
    const player = String(playerId || this._state.mobileSleepTimerPlayer || this._state.selectedPlayer || this._getSelectedPlayer()?.entity_id || "").trim();
    if (!player) return false;
    const ready = await this._homeiiEngineReadyForPersistence();
    if (!ready) {
      if (options.toast) this._toastError(this._m("The Engine could not confirm timer cancellation.", "ה־Engine לא אישר את ביטול הטיימר."));
      return false;
    }
    try {
      const result = await this._homeiiEngineDeleteTimer({
        timer_id: this._homeiiSleepTimerId(player),
        player,
      }, { required: true });
      if (!result) return false;
      const confirmation = await this._homeiiEngineGetTimers({}, { required: true, timeoutMs: this._homeiiEngineTimeoutMs() });
      if (!Array.isArray(confirmation?.timers)) throw new Error("Unable to confirm timer cancellation");
      const remains = confirmation.timers.some((timer) => String(timer.id || timer.timer_id || "") === this._homeiiSleepTimerId(player));
      if (remains) throw new Error("The timer is still present in the Engine");
      return true;
    } catch (error) {
      if (this._homeiiEngineRequired() || options.toast) this._toastError(error?.message || "HOMEii Flow Engine timer delete failed");
      return false;
    }
  }

  async _hydrateSleepTimerFromHomeiiEngine() {
    if (!this._homeiiEngineEnabled()) return false;
    const result = await this._homeiiEngineGetTimers();
    if (!Array.isArray(result?.timers)) return false;
    const timers = result.timers;
    const now = Date.now();
    const selectedPlayer = String(this._state.selectedPlayer || this._getSelectedPlayer()?.entity_id || "").trim();
    const activeSleepTimers = timers
      .filter((timer) => String(timer?.type || timer?.timer_type || "sleep") === "sleep")
      .map((timer) => ({ ...timer, targetMs: Date.parse(timer?.ends_at || "") }))
      .filter((timer) => timer.enabled !== false && Number.isFinite(timer.targetMs) && timer.targetMs > now)
      .sort((a, b) => a.targetMs - b.targetMs);
    const timer = (selectedPlayer ? activeSleepTimers.find((item) => String(item?.player || "") === selectedPlayer) : activeSleepTimers[0]) || null;
    if (!timer) {
      this._state.mobileSleepTimerEndsAt = 0;
      this._state.mobileSleepTimerPlayer = "";
      this._state.mobileSleepTimerOrigin = "";
      this._persistMobileAppearance();
      this._syncSleepTimerChip();
      return false;
    }
    this._state.mobileSleepTimerEndsAt = timer.targetMs;
    this._state.mobileSleepTimerPlayer = String(timer.player || selectedPlayer || "").trim();
    this._state.mobileSleepTimerOrigin = HomeiiNightFoundation.normalizeSleepTimerOrigin(timer.origin || "general");
    this._persistMobileAppearance();
    this._syncSleepTimerChip();
    return true;
  }

  async _setSleepTimerMinutes(minutes = 15, source = "general") {
    const amount = Math.max(1, Number(minutes) || 0);
    const player = this._getSelectedPlayer();
    if (!player?.entity_id) {
      this._toastError(this._i18n("ui.select_a_player_first"));
      return false;
    }
    const saved = await this._saveSleepTimerState({
      mobileSleepTimerEndsAt: HomeiiNightFoundation.createSleepTimerTargetAt(amount, Date.now()),
      mobileSleepTimerPlayer: player.entity_id,
      mobileSleepTimerOrigin: HomeiiNightFoundation.normalizeSleepTimerOrigin(source),
      mobileSleepTimerMenuOpen: false,
    }, amount, source);
    if (!saved) return false;
    this._toastSuccess(this._i18n("ui.sleep_timer_set_minutes", { minutes: amount }));
    return saved;
  }

  async _saveSleepTimerState(nextState, minutes, source) {
    if (this._sleepTimerSavePending) {
      this._toastError(this._m("A timer update is still in progress.", "עדכון הטיימר עדיין מתבצע."));
      return false;
    }
    this._sleepTimerSavePending = true;
    const previous = Object.fromEntries(Object.keys(nextState).map((key) => [key, this._state[key]]));
    Object.assign(this._state, nextState);
    try {
      const engineSaved = await this._syncSleepTimerToHomeiiEngine(minutes, source, { toast: true });
      if (!engineSaved && this._homeiiEngineRequired()) {
        Object.assign(this._state, previous);
        return false;
      }
      this._persistMobileAppearance();
      return { ok: true, engineSaved };
    } catch (error) {
      Object.assign(this._state, previous);
      this._toastError(error?.message || this._m("Timer update failed.", "עדכון הטיימר נכשל."));
      return false;
    } finally {
      this._sleepTimerSavePending = false;
      this._syncNightModeUi();
      this._syncSleepTimerChip();
    }
  }

  async _addSleepTimerMinutes(minutes = 15) {
    const amount = Math.max(1, Number(minutes) || 0);
    const player = this._getSelectedPlayer();
    const target = HomeiiNightFoundation.extendSleepTimerTargetAt(
      this._state.mobileSleepTimerEndsAt || 0,
      amount,
      Date.now(),
    );
    const saved = await this._saveSleepTimerState({
      mobileSleepTimerEndsAt: target,
      mobileSleepTimerPlayer: player?.entity_id || this._state.mobileSleepTimerPlayer || this._state.selectedPlayer || "",
    }, Math.ceil((target - Date.now()) / 60000), this._state.mobileSleepTimerOrigin || "general");
    if (!saved) return false;
    this._toastSuccess(this._i18n("ui.sleep_timer_added_minutes", { minutes: amount }));
  }

  _toggleSleepTimerMenu(force = null) {
    const next = typeof force === "boolean" ? force : !this._state.mobileSleepTimerMenuOpen;
    this._state.mobileSleepTimerMenuOpen = !!next && this._sleepTimerChipVisible();
    this._syncSleepTimerChip();
  }

  _cycleNightMode() {
    const order = ["auto", "on", "off"];
    const current = this._mobileNightMode();
    const next = order[(order.indexOf(current) + 1) % order.length];
    this._state.mobileNightMode = next;
    this._persistMobileAppearance();
    this._rebuildMobileUi({ reopenPage: this._state.menuOpen ? (this._state.menuPage || "settings") : "", reopenStudio: this._state.controlRoomOpen });
  }

  async _clearSleepTimer(showToast = false) {
    if (this._sleepTimerSavePending) {
      if (showToast) this._toastError(this._m("A timer update is still in progress.", "עדכון הטיימר עדיין מתבצע."));
      return false;
    }
    const timerPlayer = String(this._state.mobileSleepTimerPlayer || this._state.selectedPlayer || this._getSelectedPlayer()?.entity_id || "").trim();
    const deleted = await this._deleteSleepTimerFromHomeiiEngine(timerPlayer, { toast: showToast });
    if (!deleted && this._homeiiEngineRequired()) return false;
    this._state.mobileSleepTimerEndsAt = 0;
    this._state.mobileSleepTimerPlayer = "";
    this._state.mobileSleepTimerOrigin = "";
    this._state.mobileSleepTimerMenuOpen = false;
    this._persistMobileAppearance();
    this._syncNightModeUi();
    this._syncSleepTimerChip();
    if (showToast) {
      this._toast(this._i18n("ui.sleep_timer_cleared"));
    }
  }

  async _cycleSleepTimer(source = "general") {
    const currentRemaining = this._sleepTimerRemainingMs();
    const steps = [15, 30, 45, 60, 0];
    const normalizedSource = HomeiiNightFoundation.normalizeSleepTimerOrigin(source);
    if (!currentRemaining) {
      return this._setSleepTimerMinutes(steps[0], normalizedSource);
    }
    const nextStep = HomeiiNightFoundation.nextSleepTimerStep(currentRemaining, steps);
    if (!nextStep) {
      await this._clearSleepTimer(true);
      return;
    }
    return this._setSleepTimerMinutes(nextStep, normalizedSource === "night" ? normalizedSource : this._state.mobileSleepTimerOrigin || normalizedSource);
  }

  async _playNightMix() {
    try {
      const [allPlaylists, likedPlaylists] = await Promise.allSettled([
        this._fetchLibrary("playlist", "sort_name", 500, false),
        this._fetchLibrary("playlist", "sort_name", 220, true),
      ]);
      const playlists = [
        ...(Array.isArray(allPlaylists.value) ? allPlaylists.value : []),
        ...(Array.isArray(likedPlaylists.value) ? likedPlaylists.value : []),
      ]
        .filter((item) => item?.uri)
        .filter((item, index, list) => list.findIndex((candidate) => candidate?.uri === item?.uri) === index);
      if (!playlists.length) {
        await this._playRandomFromPlaylists();
        return;
      }
      const keywords = ["sleep", "night", "chill", "calm", "relax", "ambient", "meditation", "dream", "lofi", "lo-fi", "soft"];
      const matches = playlists.filter((item) => {
        const haystack = [
          item?.name,
          item?.metadata?.description,
          item?.description,
        ].filter(Boolean).join(" ").toLowerCase();
        return keywords.some((keyword) => haystack.includes(keyword));
      });
      const pool = matches.length ? matches : playlists;
      const pick = pool[Math.floor(Math.random() * pool.length)];
      const ok = await this._playMedia(pick.uri, pick.media_type || "playlist", "play", {
        label: pick.name || this._i18n("ui.chill_mix"),
        silent: true,
      });
      if (ok) {
        this._toastSuccess(this._i18n("ui.starting_a_chill_mix"));
      }
    } catch (error) {
      this._toastError(error?.message || this._i18n("ui.could_not_start_chill_mix"));
    }
  }

  async _resolveQuickMixEntry() {
    const currentQueueItem = this._state.maQueueState?.current_item || null;
    const currentMedia = currentQueueItem?.media_item || {};
    const player = this._getSelectedPlayer();
    const image = this._currentArtworkUrl(player, currentQueueItem, 420, { preferPlayerArtwork: true });
    const uri = String(
      this._getQueueItemUri(currentQueueItem)
      || currentMedia?.uri
      || player?.attributes?.media_content_id
      || ""
    ).trim();
    const rawMediaType = String(
      currentMedia?.media_type
      || currentQueueItem?.media_type
      || player?.attributes?.media_content_type
      || ""
    ).toLowerCase();
    const parsedRef = this._parseMediaReference(uri, rawMediaType || "track");
    const parsedType = String(parsedRef?.media_type || rawMediaType || "").toLowerCase();
    const normalizedType = this._supportsMusicAssistantRadioMode(parsedType)
      ? parsedType
      : (this._supportsMusicAssistantRadioMode(rawMediaType) ? rawMediaType : "");
    const title = this._queueItemPrimaryTitle(currentQueueItem) || player?.attributes?.media_title || "";
    const artist = this._queueItemPrimaryArtist(currentQueueItem) || player?.attributes?.media_artist || "";
    if (uri && normalizedType) {
      return {
        uri,
        media_type: normalizedType,
        name: title || this._i18n("ui.quick_mix"),
        image,
      };
    }
    const query = [title, artist].filter(Boolean).join(" ").trim();
    if (!query) return null;
    const results = await this._searchEverything(query);
    const candidates = [
      ...(Array.isArray(results?.tracks) ? results.tracks.map((item) => ({ ...item, media_type: item?.media_type || "track" })) : []),
      ...(Array.isArray(results?.albums) ? results.albums.map((item) => ({ ...item, media_type: item?.media_type || "album" })) : []),
      ...(Array.isArray(results?.artists) ? results.artists.map((item) => ({ ...item, media_type: item?.media_type || "artist" })) : []),
      ...(Array.isArray(results?.playlists) ? results.playlists.map((item) => ({ ...item, media_type: item?.media_type || "playlist" })) : []),
    ]
      .filter((item) => String(item?.uri || "").trim())
      .filter((item) => this._supportsMusicAssistantRadioMode(String(item?.media_type || "").toLowerCase()));
    if (!candidates.length) return null;
    const titleNeedle = String(title || "").trim().toLowerCase();
    const artistNeedle = String(artist || "").trim().toLowerCase();
    const scoreOf = (item) => {
      const itemTitle = String(item?.name || item?.title || "").trim().toLowerCase();
      const itemArtist = String(item?.artist || item?.artist_str || this._artistName(item) || "").trim().toLowerCase();
      let score = 0;
      if (titleNeedle && itemTitle === titleNeedle) score += 6;
      else if (titleNeedle && itemTitle.includes(titleNeedle)) score += 3;
      if (artistNeedle && itemArtist === artistNeedle) score += 4;
      else if (artistNeedle && itemArtist.includes(artistNeedle)) score += 2;
      if (String(item?.media_type || "").toLowerCase() === "track") score += 2;
      return score;
    };
    const best = [...candidates].sort((a, b) => scoreOf(b) - scoreOf(a))[0];
    return best
      ? {
          uri: String(best.uri || "").trim(),
          media_type: String(best.media_type || "track").toLowerCase(),
          name: best.name || title || this._i18n("ui.quick_mix"),
          image: this._artUrl(best) || image,
        }
      : null;
  }

  _rememberQuickMixRecommendationSeed(limit = 10) {
    const currentItem = this._state.maQueueState?.current_item || null;
    const currentKey = currentItem ? this._getQueueItemKey(currentItem) : "";
    const queueItems = this._getNowPlayingQueueItems();
    const ordered = [
      currentItem,
      ...queueItems.filter((item) => this._getQueueItemKey(item) !== currentKey),
    ].filter(Boolean);
    const seen = new Set();
    this._state.quickMixRecommendationItems = ordered.map((item) => {
      const media = item.media_item || {};
      const uri = String(media.uri || this._getQueueItemUri(item) || "").trim();
      if (!uri || seen.has(uri)) return null;
      seen.add(uri);
      return {
        uri,
        media_type: media.media_type || item.media_type || "track",
        title: media.name || item.name || this._i18n("ui.recommended_track"),
        artist: media.artists?.map((artist) => artist?.name).filter(Boolean).join(", ") || item.media_artist || media.album?.name || "",
        album: media.album?.name || item.album || "",
        image: this._queueItemImageUrl(item, 120) || this._artUrl(media) || "",
      };
    }).filter(Boolean).slice(0, limit);
  }

  async _primeQuickMixNativeRecommendations(entry = null, limit = 10) {
    const similar = await this._nativeSimilarTrackEntries(entry, limit);
    if (!similar.length) return;
    const seen = new Set();
    const next = [
      ...similar.map((item) => ({
        uri: item.uri,
        media_type: item.media_type || "track",
        title: item.title || item.name || this._i18n("ui.recommended_track"),
        artist: item.artist || item.subtitle || "",
        album: item.album || item.folder_name || "",
        image: item.image || this._artUrl(item, { size: 120 }) || "",
      })),
      ...(Array.isArray(this._state.quickMixRecommendationItems) ? this._state.quickMixRecommendationItems : []),
    ].filter((item) => {
      const uri = String(item?.uri || "").trim();
      if (!uri || seen.has(uri)) return false;
      seen.add(uri);
      return true;
    });
    this._state.quickMixRecommendationItems = next.slice(0, limit);
    this._syncRecentHistoryUi();
  }

  async _startQuickMix() {
    try {
      const entry = await this._resolveQuickMixEntry();
      if (!entry?.uri || !this._supportsMusicAssistantRadioMode(entry.media_type || "")) {
        this._toastError(this._i18n("ui.could_not_build_quick_mix_from_the_current_song"));
        return;
      }
      this._rememberQuickMixRecommendationSeed();
      this._primeQuickMixNativeRecommendations(entry).catch(() => {});
      this._state.quickMixPendingUntil = Date.now() + 6500;
      this._state.quickMixPendingEntry = entry;
      this._syncNowPlayingUI();
      const ok = await this._playMedia(entry.uri, entry.media_type || "track", "play", {
        label: entry.name || this._i18n("ui.quick_mix"),
        radioMode: true,
        silent: true,
      });
      if (ok) {
        this._toastSuccess(this._i18n("ui.quick_mix_started"), { position: "center", duration: 5000 });
        this._syncRecentHistoryUi();
        return;
      }
      this._state.quickMixPendingUntil = 0;
      this._state.quickMixPendingEntry = null;
      this._toastError(this._i18n("ui.could_not_start_quick_mix"));
    } catch (error) {
      this._state.quickMixPendingUntil = 0;
      this._state.quickMixPendingEntry = null;
      this._toastError(error?.message || this._i18n("ui.could_not_start_quick_mix"));
    }
  }

  _syncSleepTimerState() {
    const target = Number(this._state.mobileSleepTimerEndsAt || 0);
    if (!target) return;
    if (target > Date.now()) return;
    const entityId = String(this._state.mobileSleepTimerPlayer || this._state.selectedPlayer || "").trim();
    this._state.mobileSleepTimerEndsAt = 0;
    this._state.mobileSleepTimerPlayer = "";
    this._state.mobileSleepTimerOrigin = "";
    this._state.mobileSleepTimerMenuOpen = false;
    this._persistMobileAppearance();
    this._syncSleepTimerChip();
    this._syncNightModeUi();
    if (entityId) {
      this._callHomeiiEnginePlayerCommand(entityId, "pause").catch(() => {});
    }
    this._toastSuccess(this._i18n("ui.sleep_timer_finished"));
  }

  _syncNightModeUi() {
    const card = this.shadowRoot?.querySelector(".card");
    const active = this._isNightModeActive();
    const mode = this._mobileNightMode();
    const sleepActive = this._sleepTimerRemainingMs() > 0;
    if (this._state.mobileNightRenderedActive !== active || this._state.mobileNightRenderedMode !== mode) {
      this._state.mobileNightRenderedActive = active;
      this._state.mobileNightRenderedMode = mode;
      if (this._isScheduleFormEditing()) {
        if (card) {
          card.classList.toggle("night-mode", active);
          card.classList.toggle("night-mode-enabled", mode !== "off");
        }
        return;
      }
      const reopenMenu = this._state.menuOpen ? (this._state.menuPage || "settings") : "";
      this._rebuildMobileUi({ reopenPage: reopenMenu, reopenStudio: this._state.controlRoomOpen });
      return;
    }
    if (card) {
      card.classList.toggle("night-mode", active);
      card.classList.toggle("night-mode-enabled", mode !== "off");
    }
    this._syncTabletAutoFitUi();
    const row = this.$("nightQuickRow");
    if (row) {
      row.hidden = mode === "off";
      row.classList.toggle("auto-mode", mode === "auto");
      row.classList.toggle("on-mode", mode === "on");
    }
    const modeBtn = this.$("nightModeQuickBtn");
    if (modeBtn) {
      modeBtn.hidden = mode === "off";
      modeBtn.classList.toggle("active", active || mode === "on");
      modeBtn.classList.toggle("soft", mode === "auto" && !active);
      modeBtn.title = mode === "auto"
        ? this._i18n("ui.night_mode_auto_window", {
          start: this._nightModeWindow().start,
          end: this._nightModeWindow().end,
        })
        : mode === "on"
          ? this._i18n("ui.night_mode_is_always_on")
          : this._i18n("ui.night_mode_is_off");
    }
    const sleepBtn = this.$("nightSleepBtn");
    if (sleepBtn) {
      sleepBtn.hidden = mode !== "on";
      sleepBtn.classList.toggle("active", sleepActive);
      sleepBtn.title = sleepActive
        ? this._i18n("ui.sleep_timer_active_remaining", { remaining: this._sleepTimerRemainingLabel() })
        : this._i18n("ui.tap_to_start_a_sleep_timer");
    }
    const chillBtn = this.$("nightChillBtn");
    if (chillBtn) {
      chillBtn.hidden = mode !== "on";
    }
  }

  _syncMobileTimerAction() {
    const btn = this.$("mobileTimerBtn");
    if (!btn) return;
    const remainingLabel = this._sleepTimerFooterLabel();
    const active = !!remainingLabel && this._sleepTimerChipVisible();
    const configured = this._mobileQuickActions().includes("timer");
    if (!active && !configured) {
      btn.hidden = true;
      btn.classList.add("hidden");
      return;
    }
    const label = btn.querySelector(".mobile-timer-label");
    btn.hidden = false;
    btn.classList.remove("hidden");
    btn.classList.toggle("active", active);
    btn.title = active
      ? this._i18n("ui.timer_active_remaining", { remaining: remainingLabel })
      : this._i18n("ui.schedules");
    if (label) {
      label.hidden = !active;
      label.textContent = active ? remainingLabel : "";
    }
  }

  _onHassReady() {
    this._hydrateSystemMobileState().catch(() => {});
  }

  _systemMobileStateKey() {
    const instanceId = String(this._state.engineInstanceId || this._config?.homeii_engine_instance_id || "").trim();
    const profileId = String(this._state.engineProfileId || this._config?.homeii_engine_profile_id || "").trim();
    const base = [instanceId || "default", profileId || "default"].join(":");
    const safeBase = base.replace(/[^a-zA-Z0-9._:-]+/g, "_").slice(0, 96) || "default";
    return `homeii_music_flow_mobile_state_v1_${safeBase}`;
  }

  _callHomeAssistantWs(message = {}, options = {}) {
    const timeoutMs = Number(options?.timeoutMs || this._musicAssistantTimeoutMs());
    if (typeof this._hass?.callWS === "function") {
      return this._withTimeout(this._hass.callWS(message), timeoutMs, this._timeoutMessage("Home Assistant"));
    }
    if (typeof this._hass?.connection?.sendMessagePromise === "function") {
      return this._withTimeout(this._hass.connection.sendMessagePromise(message), timeoutMs, this._timeoutMessage("Home Assistant"));
    }
    return Promise.reject(new Error("Home Assistant WebSocket API is unavailable"));
  }

  _homeiiEngineMode() {
    return HomeiiEngineFoundation.normalizeHomeiiEngineMode(this._config?.homeii_engine_mode);
  }

  _homeiiEngineEnabled() {
    return HomeiiEngineFoundation.homeiiEngineModeAllowsCalls(this._homeiiEngineMode());
  }

  _homeiiEngineRequired() {
    return HomeiiEngineFoundation.homeiiEngineModeRequiresEngine(this._homeiiEngineMode());
  }

  _homeiiEngineTimeoutMs() {
    return HomeiiEngineFoundation.clampHomeiiEngineTimeoutMs(this._config?.homeii_engine_timeout_ms, 3500);
  }

  _homeiiEngineVersionAtLeast(minimum = "0.1.30") {
    const currentParts = String(this._state.engineVersion || "")
      .split(".")
      .map((part) => Number(part) || 0);
    const minimumParts = String(minimum || "")
      .split(".")
      .map((part) => Number(part) || 0);
    const length = Math.max(currentParts.length, minimumParts.length);
    for (let index = 0; index < length; index += 1) {
      const current = currentParts[index] || 0;
      const required = minimumParts[index] || 0;
      if (current > required) return true;
      if (current < required) return false;
    }
    return true;
  }

  _requiredHomeiiEngineCapabilities() {
    return [
      "context",
      "players",
      "playback_proxy",
      "queue_proxy",
      "queue_source_of_truth",
      "queue_action",
      "library_proxy",
      "compatible_library_shelves",
      "compact_library_responses",
      "search_proxy",
      "search_source_of_truth",
      "music_assistant_command_bridge",
      "music_assistant_authenticated_api",
      "music_assistant_realtime_events",
      "music_assistant_queue_resolution",
      "music_assistant_schema_63",
      "music_assistant_websocket_commands",
      "music_assistant_2_10",
      "typed_music_assistant_contract",
      "direct_player_catalog",
      "direct_library_catalog",
      "direct_provider_search",
      "full_queue_snapshots",
      "announcement_dispatch",
      "item_artwork_proxy",
      "player_commands",
      "group_apply",
    ];
  }

  _homeiiEngineHandshakeMissingCapabilities() {
    const capabilities = this._state?.engineCapabilities || {};
    return this._requiredHomeiiEngineCapabilities()
      .filter((capability) => capabilities?.[capability] !== true);
  }

  async _ensureHomeiiEngineHandshake() {
    if (!this._homeiiEngineRequired()) return true;
    const context = await this._refreshHomeiiEngineContext({ force: true }).catch((error) => {
      this._state.engineLastError = error?.message || String(error || "HOMEii Flow Engine is not available.");
      return null;
    });
    const missingCapabilities = this._homeiiEngineHandshakeMissingCapabilities();
    const requiredConnections = this._state?.engineRequiredConnections;
    const connectionsReady = requiredConnections?.ok === true;
    const ready = !!(
      context
      && this._state.engineAvailable
      && this._homeiiEngineVersionAtLeast("0.7.6")
      && missingCapabilities.length === 0
      && connectionsReady
    );
    if (ready) return true;
    this._renderHomeiiEngineRequiredScreen({
      version: this._state.engineVersion || "",
      missingCapabilities,
      error: this._state.engineLastError || "",
      requiredConnections,
    });
    return false;
  }

  _renderHomeiiEngineRequiredScreen(details = {}) {
    const version = String(details?.version || "").trim();
    const missingCapabilities = Array.isArray(details?.missingCapabilities) ? details.missingCapabilities : [];
    const error = String(details?.error || "").trim();
    const requiredConnections = details?.requiredConnections && typeof details.requiredConnections === "object"
      ? details.requiredConnections
      : null;
    const status = this._state?.engineStatus || "missing";
    const subtitle = version
      ? `Detected Engine ${version}, but it is missing required HOMEii Flow 6 capabilities.`
      : "HOMEii Flow Engine was not detected by Home Assistant.";
    const missingHtml = missingCapabilities.length
      ? `<div class="engine-gate-list"><strong>Missing capabilities</strong><span>${this._esc(missingCapabilities.join(", "))}</span></div>`
      : "";
    const connectionsHtml = requiredConnections && requiredConnections.ok !== true
      ? `<div class="engine-gate-list"><strong>Required connections</strong><span>${this._esc(requiredConnections.summary || "Music Assistant 2.10 API is not ready. Open HOMEii Flow Engine diagnostics for details.")}</span></div>`
      : "";
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display:block;
          width:100%;
          min-height:420px;
          margin:0 !important;
          padding:0 !important;
          background:transparent !important;
          --ma-accent: var(--accent-color, #e0a11b);
          font-family:var(--homeii-font-family, var(--primary-font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif));
        }
        * { box-sizing:border-box; }
        ha-card {
          display:block;
          min-height:420px;
          border:0;
          box-shadow:none;
          background:transparent;
        }
        .engine-gate {
          position:relative;
          min-height:420px;
          overflow:hidden;
          border-radius:28px;
          color:#fff;
          background:
            radial-gradient(circle at 18% 12%, rgba(224,161,27,.28), transparent 28%),
            radial-gradient(circle at 82% 20%, rgba(112,155,255,.16), transparent 30%),
            linear-gradient(145deg, rgba(10,13,21,.98), rgba(20,24,34,.94));
          border:1px solid rgba(255,255,255,.12);
          box-shadow:0 24px 60px rgba(0,0,0,.38);
          display:grid;
          place-items:center;
          padding:32px;
          text-align:center;
        }
        .engine-gate::before {
          content:"";
          position:absolute;
          inset:-28%;
          background:radial-gradient(circle at 50% 50%, rgba(255,255,255,.16), transparent 34%);
          filter:blur(34px);
          opacity:.38;
          pointer-events:none;
        }
        .engine-gate-panel {
          position:relative;
          width:min(760px, 100%);
          display:grid;
          gap:18px;
          justify-items:center;
        }
        .engine-gate-icon {
          width:76px;
          height:76px;
          display:grid;
          place-items:center;
          border-radius:24px;
          background:rgba(255,255,255,.08);
          border:1px solid rgba(255,255,255,.14);
          color:var(--ma-accent);
        }
        .engine-gate-icon .ui-ic { width:34px; height:34px; }
        .engine-gate h2 {
          margin:0;
          font-size:clamp(28px, 5vw, 52px);
          line-height:1.02;
          letter-spacing:0;
          font-weight:900;
        }
        .engine-gate p {
          margin:0;
          max-width:620px;
          color:rgba(255,255,255,.72);
          font-size:clamp(15px, 2vw, 19px);
          line-height:1.55;
        }
        .engine-gate-list {
          display:grid;
          gap:6px;
          width:min(620px, 100%);
          padding:14px 16px;
          border-radius:18px;
          background:rgba(255,255,255,.07);
          border:1px solid rgba(255,255,255,.12);
          color:rgba(255,255,255,.8);
          text-align:start;
        }
        .engine-gate-list strong {
          color:#fff;
          font-size:13px;
          text-transform:uppercase;
          letter-spacing:.12em;
        }
        .engine-gate-list span {
          overflow-wrap:anywhere;
          line-height:1.45;
        }
        .engine-gate-actions {
          display:flex;
          flex-wrap:wrap;
          justify-content:center;
          gap:10px;
        }
        .engine-gate-btn {
          border:0;
          border-radius:999px;
          padding:12px 18px;
          font:inherit;
          font-weight:800;
          color:#111620;
          background:linear-gradient(135deg, #f1c45b, var(--ma-accent));
          cursor:pointer;
          box-shadow:0 12px 28px rgba(224,161,27,.25);
        }
        .engine-gate-btn.secondary {
          color:#fff;
          background:rgba(255,255,255,.08);
          border:1px solid rgba(255,255,255,.14);
          box-shadow:none;
        }
        .engine-gate-meta {
          color:rgba(255,255,255,.54);
          font-size:13px;
          overflow-wrap:anywhere;
        }
      </style>
      <ha-card>
        <div class="engine-gate">
          <div class="engine-gate-panel">
            <div class="engine-gate-icon">${this._iconSvg("settings")}</div>
            <h2>HOMEii Flow 6 requires HOMEii Flow Engine</h2>
            <p>${this._esc(subtitle)} Install or update the HOMEii Flow Engine integration, reload Home Assistant, then refresh this dashboard.</p>
            ${missingHtml}
            ${connectionsHtml}
            ${error ? `<div class="engine-gate-list"><strong>Last error</strong><span>${this._esc(error)}</span></div>` : ""}
            <div class="engine-gate-actions">
              <button class="engine-gate-btn" id="engineGateRetry">Run handshake again</button>
              <button class="engine-gate-btn secondary" id="engineGateDiagnostics">Copy status</button>
            </div>
            <div class="engine-gate-meta">Status: ${this._esc(status)}${version ? ` · Engine: ${this._esc(version)}` : ""}</div>
          </div>
        </div>
      </ha-card>
    `;
    this.$("engineGateRetry")?.addEventListener("click", async () => {
      this._state.engineLastChecked = 0;
      const ok = await this._ensureHomeiiEngineHandshake();
      if (ok) {
        this._build();
        this._init();
      }
    });
    this.$("engineGateDiagnostics")?.addEventListener("click", () => {
      const text = [
        "HOMEii Flow 6 Engine handshake",
        `Card: ${HOMEII_CARD_VERSION}`,
        `Status: ${status}`,
        `Engine version: ${version || "(none)"}`,
        `Missing capabilities: ${missingCapabilities.join(", ") || "(none)"}`,
        `Last error: ${error || "(none)"}`,
      ].join("\n");
      try { navigator?.clipboard?.writeText?.(text); } catch (_) {}
      this._toast?.("Engine status copied", "success", { position: "center" });
    });
  }

  _homeiiEngineConfiguredInstanceId() {
    return HomeiiEngineFoundation.normalizeHomeiiEngineId(this._config?.homeii_engine_instance_id);
  }

  _homeiiEngineConfiguredProfileId() {
    return HomeiiEngineFoundation.normalizeHomeiiEngineId(this._config?.homeii_engine_profile_id);
  }

  _homeiiEngineResolvedInstanceId(command = "") {
    const configured = this._homeiiEngineConfiguredInstanceId();
    if (configured) return configured;
    if (String(command || "") === "get_context") return "";
    return HomeiiEngineFoundation.normalizeHomeiiEngineId(this._state.engineInstanceId || this._state.engineContext?.instanceId);
  }

  _homeiiEngineResolvedProfileId(command = "") {
    const configured = this._homeiiEngineConfiguredProfileId();
    if (configured) return configured;
    if (String(command || "") === "get_context") return "";
    return HomeiiEngineFoundation.normalizeHomeiiEngineId(this._state.engineProfileId || this._state.engineContext?.profileId);
  }

  _homeiiEngineMessage(command = "get_context", payload = {}) {
    const message = {
      ...(payload && typeof payload === "object" && !Array.isArray(payload) ? payload : { payload }),
      type: HomeiiEngineFoundation.homeiiEngineCommandType(command),
      card_id: String(this._config?.card_id || "").trim(),
      instance_id: this._homeiiEngineResolvedInstanceId(command),
      profile_id: this._homeiiEngineResolvedProfileId(command),
    };
    ["card_id", "instance_id", "profile_id"].forEach((key) => {
      if (message[key] === "") delete message[key];
    });
    return message;
  }

  _homeiiEngineHttpPath(command = "get_context") {
    const clean = String(command || "get_context")
      .trim()
      .replace(/^\/+|\/+$/g, "")
      .replace(/[^a-zA-Z0-9_/-]+/g, "_")
      || "get_context";
    return `homeii_flow/command/${clean}`;
  }

  _homeiiEngineHttpFallbackAllowed(command = "get_context") {
    // A lost response does not cancel the original request. Never replay mutations.
    return ["get_context", "bootstrap/get", "queue/get", "library/get", "favorites/get", "search/get"].includes(String(command || "get_context").trim().replace(/^\/+|\/+$/g, ""));
  }

  _homeiiEngineAuthToken() {
    return this._hass?.auth?.data?.access_token
      || this._hass?.connection?.options?.auth?.accessToken
      || this._hass?.connection?.options?.auth?.data?.access_token
      || "";
  }

  _clearEngineArtworkDependentCaches() {
    this._cache?.library?.clear?.();
    this._clearImageBlobCache?.();
    this._artworkFallbackUrls?.clear?.();
    this._imageFailed?.clear?.();
    this._imageFailedAt?.clear?.();
    this._imageRetryTimers?.forEach?.((timer) => clearTimeout(timer));
    this._imageRetryTimers?.clear?.();
    try {
      const basePrefix = "homeii_music_flow_queue_snapshot_v1::";
      const scopedSuffix = String(this._config?.card_id || "").trim().match(/^[A-Za-z0-9_-]{1,64}$/)
        ? `__${String(this._config.card_id).trim()}`
        : "";
      for (let index = sessionStorage.length - 1; index >= 0; index -= 1) {
        const key = sessionStorage.key(index);
        if (key && key.startsWith(basePrefix) && (!scopedSuffix || key.endsWith(scopedSuffix))) {
          sessionStorage.removeItem(key);
        }
      }
    } catch (_) {}
  }

  async _homeiiEngineHttpCommand(command = "get_context", payload = {}, options = {}) {
    if (!this._homeiiEngineHttpFallbackAllowed(command)) {
      throw new Error(`HOMEii Flow Engine HTTP fallback does not support ${command}`);
    }
    const timeoutMs = HomeiiEngineFoundation.clampHomeiiEngineTimeoutMs(options?.timeoutMs, this._homeiiEngineTimeoutMs());
    const message = this._homeiiEngineMessage(command, payload);
    const path = this._homeiiEngineHttpPath(command);
    if (typeof this._hass?.callApi === "function") {
      return this._withTimeout(
        this._hass.callApi("POST", path, message),
        timeoutMs,
        this._timeoutMessage("HOMEii Flow Engine HTTP"),
      );
    }
    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };
    const token = this._homeiiEngineAuthToken();
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await this._withTimeout(
      fetch(`/api/${path}`, {
        method: "POST",
        credentials: "same-origin",
        headers,
        body: JSON.stringify(message),
      }),
      timeoutMs,
      this._timeoutMessage("HOMEii Flow Engine HTTP"),
    );
    if (!response.ok) throw new Error(`HOMEii Flow Engine HTTP ${response.status}`);
    return response.json();
  }

  async _homeiiEngineCommand(command = "get_context", payload = {}, options = {}) {
    const mode = this._homeiiEngineMode();
    if (!HomeiiEngineFoundation.homeiiEngineModeAllowsCalls(mode)) {
      this._state.engineStatus = "off";
      this._state.engineAvailable = false;
      this._state.engineLastError = "";
      return null;
    }
    const required = options?.required === true
      || (options?.respectRequiredMode !== false && HomeiiEngineFoundation.homeiiEngineModeRequiresEngine(mode));
    const timeoutMs = HomeiiEngineFoundation.clampHomeiiEngineTimeoutMs(options?.timeoutMs, this._homeiiEngineTimeoutMs());
    try {
      const result = await this._callHomeAssistantWs(this._homeiiEngineMessage(command, payload), { timeoutMs });
      this._state.engineLastTransport = "websocket";
      this._state.engineStatus = "connected";
      this._state.engineAvailable = true;
      this._state.engineLastError = "";
      return result;
    } catch (error) {
      if (this._homeiiEngineHttpFallbackAllowed(command)) {
        try {
          const result = await this._homeiiEngineHttpCommand(command, payload, { timeoutMs });
          this._state.engineLastTransport = "http";
          this._state.engineStatus = "connected";
          this._state.engineAvailable = true;
          this._state.engineLastError = "";
          return result;
        } catch (httpError) {
          this._debugLog?.("debug", "HOMEii Flow Engine HTTP fallback failed", command, httpError?.message || httpError);
        }
      }
      const message = error?.message || "HOMEii Flow Engine is not available.";
      if ((command !== "get_context" && this._state.engineAvailable) || this._state.engineContext) {
        this._state.engineStatus = "degraded";
        this._state.engineAvailable = true;
      } else {
        this._state.engineStatus = "missing";
        this._state.engineAvailable = false;
      }
      this._state.engineLastError = message;
      this._debugLog?.("debug", "HOMEii Flow Engine command failed", command, message);
      if (required) throw error;
      return null;
    }
  }

  async _refreshHomeiiEngineContext({ force = false } = {}) {
    const mode = this._homeiiEngineMode();
    if (!HomeiiEngineFoundation.homeiiEngineModeAllowsCalls(mode)) {
      this._state.engineStatus = "off";
      this._state.engineAvailable = false;
      this._state.engineVersion = "";
      this._state.engineCapabilities = {};
      this._state.engineContext = null;
      this._state.engineRequiredConnections = null;
      this._state.engineInstanceId = "";
      this._state.engineProfileId = "";
      this._state.engineLastError = "";
      this._state.engineLastChecked = Date.now();
      return null;
    }
    const now = Date.now();
    if (!force && this._state.engineLastChecked && now - this._state.engineLastChecked < 30000) {
      return this._state.engineContext;
    }
    this._state.engineStatus = "checking";
    this._state.engineLastChecked = now;
    let result = await this._homeiiEngineCommand("bootstrap/get", {
      card_version: HOMEII_CARD_VERSION,
      selected_player: this._state?.selectedPlayer || "",
    }, {
      required: false,
      respectRequiredMode: false,
      timeoutMs: Math.max(20000, this._homeiiEngineTimeoutMs()),
    });
    if (!result) {
      result = await this._homeiiEngineCommand("get_context", {
        card_version: HOMEII_CARD_VERSION,
        selected_player: this._state?.selectedPlayer || "",
      }, {
        required: false,
        respectRequiredMode: false,
        timeoutMs: Math.max(10000, this._homeiiEngineTimeoutMs()),
      });
    }
    if (!result) {
      if (this._state.engineContext && this._state.engineVersion) {
        this._state.engineStatus = "degraded";
        this._state.engineAvailable = true;
        this._state.engineConsecutiveFailures = Number(this._state.engineConsecutiveFailures || 0) + 1;
        return this._state.engineContext;
      }
      this._state.engineStatus = this._homeiiEngineRequired() ? "required_missing" : "missing";
      this._state.engineAvailable = false;
      this._state.engineVersion = "";
      this._state.engineCapabilities = {};
      this._state.engineContext = null;
      this._state.engineRequiredConnections = null;
      this._state.engineInstanceId = "";
      this._state.engineProfileId = "";
      return null;
    }
    const hadItemArtworkProxy = this._state.engineCapabilities?.item_artwork_proxy === true;
    const previousEngineVersion = String(this._state.engineVersion || "").trim();
    const context = HomeiiEngineFoundation.normalizeHomeiiEngineContext(result);
    this._state.engineStatus = "connected";
    this._state.engineAvailable = true;
    this._state.engineLastGoodAt = Date.now();
    this._state.engineConsecutiveFailures = 0;
    this._state.engineVersion = context.version;
    this._state.engineCapabilities = context.capabilities;
    this._state.engineContext = context;
    this._state.engineRequiredConnections = context.raw?.required_connections || context.raw?.connections || null;
    this._state.engineInstanceId = context.instanceId;
    this._state.engineProfileId = context.profileId;
    this._state.engineLastError = "";
    const bootstrapPlayers = context.raw?.player_snapshot;
    const bootstrapPlayerSource = Array.isArray(bootstrapPlayers?.music_assistant_players)
      ? bootstrapPlayers.music_assistant_players
      : (Array.isArray(bootstrapPlayers?.players) ? bootstrapPlayers.players : []);
    const bootstrapPlayersAccepted = HomeiiRevisionedSnapshotsFoundation.acceptEngineSnapshot(
      this._engineSnapshotRevisions,
      "players",
      bootstrapPlayers,
      "music_assistant",
    );
    if (bootstrapPlayersAccepted && bootstrapPlayerSource.length && typeof this._normalizeEnginePlayerEntity === "function") {
      this._state.enginePlayers = bootstrapPlayerSource
        .map((player) => this._normalizeEnginePlayerEntity(player))
        .filter(Boolean);
      this._state.enginePlayersLastGoodAt = Date.now();
    }
    const musicAssistant = context.raw?.music_assistant
      || context.raw?.required_connections?.realtime_events
      || null;
    if (musicAssistant) {
      this._state.maServerVersion = String(musicAssistant.server_version || "").trim();
      this._state.maSchemaVersion = String(musicAssistant.schema_version ?? "").trim();
    }
    this._subscribeHomeiiEngineMusicAssistantEvents();
    if (
      (!hadItemArtworkProxy && context.capabilities?.item_artwork_proxy === true)
      || (previousEngineVersion && previousEngineVersion !== context.version)
    ) {
      this._clearEngineArtworkDependentCaches();
    }
    return context;
  }

  _subscribeHomeiiEngineMusicAssistantEvents() {
    const connection = this._hass?.connection;
    if (!connection?.subscribeEvents || !this.isConnected) return;
    if (this._homeiiMaEventConnection === connection && this._homeiiMaEventSubscription) return;
    this._unsubscribeHomeiiEngineMusicAssistantEvents();
    this._homeiiMaEventConnection = connection;
    const generation = (this._homeiiMaEventGeneration || 0) + 1;
    this._homeiiMaEventGeneration = generation;
    const subscription = connection.subscribeEvents(
      (event) => this._handleHomeiiEngineMusicAssistantEvent(event?.data || event || {}),
      "homeii_flow_music_assistant_event",
    );
    this._homeiiMaEventSubscription = Promise.resolve(subscription)
      .then((unsubscribe) => {
        if (generation !== this._homeiiMaEventGeneration || !this.isConnected) {
          try { unsubscribe?.(); } catch (_) {}
          return null;
        }
        return typeof unsubscribe === "function" ? unsubscribe : null;
      })
      .catch((error) => {
        this._debugLog?.("debug", "HOMEii Flow Engine MA event subscription failed", error?.message || error);
        return null;
      });
  }

  _unsubscribeHomeiiEngineMusicAssistantEvents() {
    this._homeiiMaEventGeneration = (this._homeiiMaEventGeneration || 0) + 1;
    const subscription = this._homeiiMaEventSubscription;
    this._homeiiMaEventSubscription = null;
    this._homeiiMaEventConnection = null;
    Promise.resolve(subscription).then((unsubscribe) => {
      try { unsubscribe?.(); } catch (_) {}
    }).catch(() => {});
    clearTimeout(this._homeiiMaQueueEventTimer);
    clearTimeout(this._homeiiMaPlayerEventTimer);
    this._homeiiMaQueueEventTimer = null;
    this._homeiiMaPlayerEventTimer = null;
    clearTimeout(this._homeiiMaLibraryEventTimer);
  }

  _handleHomeiiEngineMusicAssistantEvent(message = {}) {
    if (!this.isConnected || !this._homeiiEngineRequired?.()) return;
    const kind = String(message.kind || "").toLowerCase();
    const eventName = String(message.event || "").toLowerCase();
    if (kind === "connection") {
      const connection = message.connection && typeof message.connection === "object" ? message.connection : {};
      if (connection.connected !== true || connection.authenticated !== true) {
        if (this._state.engineContext) {
          this._state.engineStatus = "degraded";
          this._state.engineAvailable = true;
        }
        return;
      }
      clearTimeout(this._homeiiMaContextEventTimer);
      const contextDelay = Math.max(1200, 5000 - (Date.now() - Number(this._state.engineLastGoodAt || 0)));
      this._homeiiMaContextEventTimer = setTimeout(
        () => this._refreshHomeiiEngineContext({ force: false }).catch(() => {}),
        contextDelay,
      );
      return;
    }
    const progressOnly = /elapsed|progress|position|time_updated|queue_time|player_time/.test(eventName);
    if (progressOnly) {
      this._syncNowPlayingUI?.();
      return;
    }
    const affectsQueue = !eventName || /queue|media_item_played/.test(eventName);
    const affectsPlayers = !eventName || /player/.test(eventName);
    const affectsLibrary = !eventName || /media|library|favorite|provider|playlist|album|artist|track|podcast|audiobook|radio|genre/.test(eventName);
    const now = Date.now();
    if (affectsQueue && !this._homeiiMaQueueEventTimer) {
      const queueDelay = Math.max(180, 1000 - (now - Number(this._homeiiMaLastQueueRefreshAt || 0)));
      this._homeiiMaQueueEventTimer = setTimeout(
        () => {
          this._homeiiMaQueueEventTimer = null;
          this._homeiiMaLastQueueRefreshAt = Date.now();
          this._ensureQueueSnapshot(true).catch(() => {});
        },
        queueDelay,
      );
    }
    if (affectsPlayers || affectsQueue) {
      const playerDelay = Math.max(260, 1200 - (now - Number(this._homeiiMaLastPlayerRefreshAt || 0)));
      this._schedulePlayerStateRefresh(playerDelay);
    }
    if (affectsLibrary) {
      const favoriteMediaType = /favorite/.test(eventName)
        ? String(message.media_type || message.data?.media_type || "").trim().toLowerCase()
        : "";
      for (const [key, cached] of this._cache?.library?.entries?.() || []) {
        if (
          favoriteMediaType
          && key !== "liked:ma"
          && !String(key).startsWith(`${favoriteMediaType}:`)
          && !String(key).startsWith(`tab-search:${favoriteMediaType}:`)
        ) {
          continue;
        }
        if (cached && typeof cached === "object") cached.ts = 0;
      }
      clearTimeout(this._homeiiMaLibraryEventTimer);
      this._homeiiMaLibraryEventTimer = setTimeout(() => {
        if (this._state?.menuOpen && /^(library_|media_detail|discovery|quick_search)/.test(String(this._state.menuPage || ""))) {
          this._renderMobileMenu?.().catch(() => {});
        }
      }, 900);
    }
  }

  async _syncHomeiiEngineScreensaverConnection() {
    return false;
  }

  _homeiiEngineGetQueue(payload = {}) {
    return this._homeiiEngineCommand("queue/get", payload, { timeoutMs: Math.max(12000, this._homeiiEngineTimeoutMs()) });
  }

  _homeiiEngineQueueAction(payload = {}) {
    return this._homeiiEngineCommand("queue/action", payload, { timeoutMs: Math.max(12000, this._homeiiEngineTimeoutMs()) });
  }

  _homeiiEngineGetLibrary(payload = {}) {
    return this._homeiiEngineCommand("library/get", payload, { timeoutMs: Math.max(15000, this._homeiiEngineTimeoutMs()) });
  }

  _homeiiEngineGetFavorites(payload = {}) {
    if (this._homeiiFavoritesLoadPromise) return this._homeiiFavoritesLoadPromise;
    const promise = this._homeiiEngineCommand("favorites/get", payload, {
      timeoutMs: Math.max(18000, this._homeiiEngineTimeoutMs()),
    }).finally(() => {
      if (this._homeiiFavoritesLoadPromise === promise) this._homeiiFavoritesLoadPromise = null;
    });
    this._homeiiFavoritesLoadPromise = promise;
    return promise;
  }

  _homeiiEngineSetFavorite(payload = {}) {
    const mutationKey = String(payload?.uri || payload?.library_item_id || payload?.entry?.uri || "favorite").trim();
    const existing = this._homeiiFavoriteMutationPromises.get(mutationKey);
    if (existing) return existing;
    const promise = this._homeiiEngineCommand("favorites/set", payload, {
      timeoutMs: Math.max(12000, this._homeiiEngineTimeoutMs()),
    }).finally(() => {
      if (this._homeiiFavoriteMutationPromises.get(mutationKey) === promise) {
        this._homeiiFavoriteMutationPromises.delete(mutationKey);
      }
    });
    this._homeiiFavoriteMutationPromises.set(mutationKey, promise);
    return promise;
  }

  _homeiiEngineSearch(payload = {}) {
    return this._homeiiEngineCommand("search/get", payload, { timeoutMs: Math.max(22000, this._homeiiEngineTimeoutMs()) });
  }

  _homeiiEngineMaCommand(command = "", args = {}) {
    return this._homeiiEngineCommand("ma/command", {
      command,
      args: args && typeof args === "object" && !Array.isArray(args) ? args : {},
    }, { timeoutMs: Math.max(command === "metadata/get_track_lyrics" ? 35000 : 18000, this._homeiiEngineTimeoutMs()) });
  }

  _homeiiEngineRunDiagnostics(payload = {}) {
    return this._homeiiEngineCommand("diagnostics/run", payload, { timeoutMs: Math.max(20000, this._homeiiEngineTimeoutMs()) });
  }

  _homeiiEngineApplyGroup(payload = {}) {
    return this._homeiiEngineCommand("group/apply", payload, { timeoutMs: Math.max(15000, this._homeiiEngineTimeoutMs()) });
  }

  _homeiiEngineGetStats(payload = {}) {
    return this._homeiiEngineCommand("stats/get", payload, { timeoutMs: Math.max(10000, this._homeiiEngineTimeoutMs()) });
  }

  _homeiiEngineGetPlayers(payload = {}) {
    return this._homeiiEngineCommand("players/get", payload, { timeoutMs: Math.max(10000, this._homeiiEngineTimeoutMs()) });
  }

  _homeiiEnginePlayMedia(payload = {}) {
    return this._homeiiEngineCommand("playback/play_media", payload, { timeoutMs: Math.max(20000, this._homeiiEngineTimeoutMs()) });
  }

  _homeiiEnginePlayerCommand(payload = {}) {
    return this._homeiiEngineCommand("player/command", payload, { timeoutMs: Math.max(12000, this._homeiiEngineTimeoutMs()) });
  }

  _homeiiEngineTransferQueue(payload = {}) {
    return this._homeiiEngineCommand("queue/transfer", payload, { timeoutMs: Math.max(20000, this._homeiiEngineTimeoutMs()) });
  }

  _homeiiEngineGetSchedules(payload = {}, options = {}) {
    return this._homeiiEngineCommand("schedules/get", payload, options);
  }

  _homeiiEngineSetSchedule(payload = {}, options = {}) {
    return this._homeiiEngineCommand("schedules/set", payload, options);
  }

  _homeiiEngineDeleteSchedule(payload = {}, options = {}) {
    return this._homeiiEngineCommand("schedules/delete", payload, options);
  }

  _homeiiEngineGetTimers(payload = {}, options = {}) {
    return this._homeiiEngineCommand("timers/get", payload, options);
  }

  _homeiiEngineSetTimer(payload = {}, options = {}) {
    return this._homeiiEngineCommand("timers/set", payload, options);
  }

  _homeiiEngineDeleteTimer(payload = {}, options = {}) {
    return this._homeiiEngineCommand("timers/delete", payload, options);
  }

  _homeiiEngineSetVolumeRule(payload = {}) {
    return this._homeiiEngineCommand("volume_rules/set", payload);
  }

  _homeiiEngineGetAnnouncements(payload = {}) {
    return this._homeiiEngineCommand("announcements/get", payload);
  }

  _homeiiEngineGetActivity(payload = {}) {
    return this._homeiiEngineCommand("activity/get", payload);
  }

  _homeiiEngineGetPlaybackStats(payload = {}) {
    return this._homeiiEngineCommand("playback_stats/get", payload);
  }

  _homeiiEngineGetScreensaver(payload = {}) {
    return this._homeiiEngineCommand("screensaver/get", payload);
  }

  _homeiiEngineSetScreensaver(payload = {}, options = {}) {
    return this._homeiiEngineCommand("screensaver/set", payload, options);
  }

  _homeiiEngineAnnounce(payload = {}) {
    return this._homeiiEngineCommand("announce", payload);
  }

  _homeiiEngineSendspinStatus(payload = {}) {
    return this._homeiiEngineCommand("sendspin/status", payload);
  }

  async _getHomeAssistantUserData(key = "") {
    const result = await this._callHomeAssistantWs({ type: "frontend/get_user_data", key });
    if (result && typeof result === "object" && Object.prototype.hasOwnProperty.call(result, "value")) return result.value;
    return result;
  }

  async _setHomeAssistantUserData(key = "", value = {}) {
    await this._callHomeAssistantWs({ type: "frontend/set_user_data", key, value });
  }

  _systemMobileStatePayload() {
    const schedules = this._scheduledStartSchedules();
    const nightWindow = this._nightModeWindow();
    const sleepTimerEndsAt = Number(this._state.mobileSleepTimerEndsAt || 0) || 0;
    const payload = {
      version: 1,
      updatedAt: Date.now(),
      schedulesTab: this._state.mobileSchedulesTab || "timers",
      startScheduleEditId: this._state.mobileStartScheduleEditId || "",
      startSchedules: schedules,
      startTimerEnabled: schedules.some((schedule) => schedule.enabled !== false),
      startTimerLastRunKey: this._state.mobileStartTimerLastRunKey || "",
      nightMode: this._mobileNightMode(),
      nightModeStart: nightWindow.start,
      nightModeEnd: nightWindow.end,
      nightModeDays: this._nightModeDays(),
    };
    if (sleepTimerEndsAt > Date.now()) {
      payload.sleepTimerEndsAt = sleepTimerEndsAt;
      payload.sleepTimerPlayer = this._state.mobileSleepTimerPlayer || "";
      payload.sleepTimerOrigin = this._state.mobileSleepTimerOrigin || "";
    }
    return payload;
  }

  _applySystemMobileStatePayload(payload = null) {
    if (!payload || typeof payload !== "object") return false;
    const rawSchedules = Array.isArray(payload.startSchedules)
      ? payload.startSchedules
      : Array.isArray(payload.mobileStartSchedules)
        ? payload.mobileStartSchedules
        : null;
    const rawNightMode = String(payload.nightMode || payload.mobileNightMode || "").trim();
    const hasNightPayload = ["off", "auto", "on"].includes(rawNightMode)
      || Object.prototype.hasOwnProperty.call(payload, "nightModeStart")
      || Object.prototype.hasOwnProperty.call(payload, "nightModeEnd")
      || Object.prototype.hasOwnProperty.call(payload, "nightModeDays")
      || Object.prototype.hasOwnProperty.call(payload, "mobileNightModeStart")
      || Object.prototype.hasOwnProperty.call(payload, "mobileNightModeEnd")
      || Object.prototype.hasOwnProperty.call(payload, "mobileNightModeDays");
    const hasSleepTimerPayload = Object.prototype.hasOwnProperty.call(payload, "sleepTimerEndsAt")
      || Object.prototype.hasOwnProperty.call(payload, "mobileSleepTimerEndsAt");
    if (!rawSchedules && !hasNightPayload && !hasSleepTimerPayload) return false;
    if (rawSchedules) {
      const schedules = rawSchedules.map((schedule, index) => this._normalizeScheduledStartSchedule(schedule, index));
      this._state.mobileStartSchedules = schedules;
      this._state.mobileStartTimerEnabled = schedules.some((schedule) => schedule.enabled !== false);
      const editId = String(payload.startScheduleEditId || "").trim();
      this._state.mobileStartScheduleEditId = schedules.some((schedule) => schedule.id === editId)
        ? editId
        : "";
      const activeTab = String(payload.schedulesTab || "").trim();
      if (["timers", "wake", "night"].includes(activeTab)) this._state.mobileSchedulesTab = activeTab;
      const reference = schedules.find((schedule) => schedule.id === this._state.mobileStartScheduleEditId) || schedules[0] || null;
      if (reference) {
        this._state.mobileStartTimerTime = reference.time;
        this._state.mobileStartTimerPlayer = reference.player;
        this._state.mobileStartTimerPlaylist = reference.playlist;
        this._state.mobileStartTimerPlaylistName = reference.playlistName;
        this._state.mobileStartTimerVolume = reference.volume;
        this._state.mobileStartTimerDays = reference.days;
        this._state.mobileStartTimerLastRunKey = reference.lastRunKey || "";
      } else {
        this._state.mobileStartTimerLastRunKey = "";
      }
    }
    if (hasNightPayload) {
      this._state.mobileNightMode = ["off", "auto", "on"].includes(rawNightMode) ? rawNightMode : this._mobileNightMode();
      this._state.mobileNightModeStart = this._normalizeClockTime(payload.nightModeStart || payload.mobileNightModeStart || this._state.mobileNightModeStart || "22:00", "22:00");
      this._state.mobileNightModeEnd = this._normalizeClockTime(payload.nightModeEnd || payload.mobileNightModeEnd || this._state.mobileNightModeEnd || "06:00", "06:00");
      this._state.mobileNightModeDays = this._normalizeNightModeDays(payload.nightModeDays || payload.mobileNightModeDays || this._state.mobileNightModeDays);
    }
    if (hasSleepTimerPayload) {
      const sleepTimerEndsAt = Number(payload.sleepTimerEndsAt ?? payload.mobileSleepTimerEndsAt ?? 0) || 0;
      if (sleepTimerEndsAt > Date.now()) {
        this._state.mobileSleepTimerEndsAt = sleepTimerEndsAt;
        this._state.mobileSleepTimerPlayer = String(payload.sleepTimerPlayer || payload.mobileSleepTimerPlayer || this._state.mobileSleepTimerPlayer || this._state.selectedPlayer || "").trim();
        this._state.mobileSleepTimerOrigin = HomeiiNightFoundation.normalizeSleepTimerOrigin(payload.sleepTimerOrigin || payload.mobileSleepTimerOrigin || "general");
      }
    }
    return true;
  }

  async _hydrateSystemMobileState() {
    if (!this._hass) return false;
    const key = this._systemMobileStateKey();
    if (this._systemMobileStateHydrateKey === key && this._systemMobileStateHydratePromise) {
      return this._systemMobileStateHydratePromise;
    }
    this._systemMobileStateHydrateKey = key;
    this._systemMobileStateHydratePromise = (async () => {
      try {
        const payload = await this._getHomeAssistantUserData(key);
        const applied = this._applySystemMobileStatePayload(payload);
        if (applied) {
          this._writeSchedulesToLocalStorage();
          if (this._built) {
            if (this._state.menuOpen && this._state.menuPage === "sleep_timer") await this._renderMobileMenu();
            this._syncSleepTimerChip();
          }
          return true;
        }
        if (this._scheduledStartSchedules().length) this._scheduleSystemMobileStatePersist(250);
      } catch (_) {
        return false;
      }
      return false;
    })();
    return this._systemMobileStateHydratePromise;
  }

  _writeSchedulesToLocalStorage() {
    try { localStorage.setItem(this._lsKey("homeii_music_flow_mobile_start_timer_enabled"), JSON.stringify(!!this._state.mobileStartTimerEnabled)); } catch (_) {}
    try { localStorage.setItem(this._lsKey("homeii_music_flow_mobile_start_timer_time"), this._normalizeClockTime(this._state.mobileStartTimerTime || "07:00", "07:00")); } catch (_) {}
    try { localStorage.setItem(this._lsKey("homeii_music_flow_mobile_start_timer_player"), this._state.mobileStartTimerPlayer || ""); } catch (_) {}
    try { localStorage.setItem(this._lsKey("homeii_music_flow_mobile_start_timer_playlist"), this._state.mobileStartTimerPlaylist || ""); } catch (_) {}
    try { localStorage.setItem(this._lsKey("homeii_music_flow_mobile_start_timer_playlist_name"), this._state.mobileStartTimerPlaylistName || ""); } catch (_) {}
    try { localStorage.setItem(this._lsKey("homeii_music_flow_mobile_start_timer_volume"), String(Math.max(0, Math.min(100, Number(this._state.mobileStartTimerVolume || 35) || 35)))); } catch (_) {}
    try { localStorage.setItem(this._lsKey("homeii_music_flow_mobile_start_timer_days"), JSON.stringify(this._scheduledStartDays())); } catch (_) {}
    try { localStorage.setItem(this._lsKey("homeii_music_flow_mobile_start_timer_last_run"), this._state.mobileStartTimerLastRunKey || ""); } catch (_) {}
    try { localStorage.setItem(this._lsKey("homeii_music_flow_mobile_start_schedules"), JSON.stringify(this._scheduledStartSchedules())); } catch (_) {}
    try { localStorage.setItem(this._lsKey("homeii_music_flow_mobile_schedules_tab"), this._state.mobileSchedulesTab || "timers"); } catch (_) {}
    try { localStorage.setItem(this._lsKey("homeii_music_flow_mobile_night_mode"), this._mobileNightMode()); } catch (_) {}
    try { localStorage.setItem(this._lsKey("homeii_music_flow_mobile_night_start"), this._normalizeClockTime(this._state.mobileNightModeStart || "22:00", "22:00")); } catch (_) {}
    try { localStorage.setItem(this._lsKey("homeii_music_flow_mobile_night_end"), this._normalizeClockTime(this._state.mobileNightModeEnd || "06:00", "06:00")); } catch (_) {}
    try { localStorage.setItem(this._lsKey("homeii_music_flow_mobile_night_days"), JSON.stringify(this._nightModeDays())); } catch (_) {}
  }

  _writeSleepTimerToLocalStorage() {
    try { localStorage.setItem(this._lsKey("homeii_music_flow_mobile_sleep_timer_at"), String(Number(this._state.mobileSleepTimerEndsAt || 0) || 0)); } catch (_) {}
    try { localStorage.setItem(this._lsKey("homeii_music_flow_mobile_sleep_timer_player"), this._state.mobileSleepTimerPlayer || ""); } catch (_) {}
    try { localStorage.setItem(this._lsKey("homeii_music_flow_mobile_sleep_timer_origin"), this._state.mobileSleepTimerOrigin || ""); } catch (_) {}
  }

  _writeOperationalMobileStateToLocalStorage() {
    this._writeSleepTimerToLocalStorage();
    this._writeSchedulesToLocalStorage();
  }

  _scheduleSystemMobileStatePersist(delayMs = 450) {
    if (!this._hass) return;
    clearTimeout(this._systemMobileStatePersistTimer);
    this._systemMobileStatePersistTimer = setTimeout(() => {
      this._systemMobileStatePersistTimer = null;
      this._persistSystemMobileState().catch(() => {});
    }, Math.max(0, Number(delayMs) || 0));
  }

  async _persistSystemMobileState() {
    if (!this._hass) return false;
    await this._setHomeAssistantUserData(this._systemMobileStateKey(), this._systemMobileStatePayload());
    return true;
  }

  _syncSleepTimerChip() {
    const card = this.shadowRoot?.querySelector(".card");
    const remainingLabel = this._sleepTimerFooterLabel();
    const active = !!remainingLabel && this._sleepTimerChipVisible();
    const timerConfigured = this._mobileQuickActions().includes("timer");
    const needsTemporaryTimerUi = active && !timerConfigured && (
      (card?.classList.contains("layout-tablet") && !this.$("sleepTimerCorner"))
      || (!card?.classList.contains("layout-tablet") && !this.$("mobileTimerBtn"))
    );
    if (needsTemporaryTimerUi) {
      const reopenPage = this._state.menuOpen ? (this._state.menuPage || "sleep_timer") : "";
      this._rebuildMobileUi({ reopenPage, reopenStudio: this._state.controlRoomOpen });
      return;
    }
    card?.classList.toggle("has-sleep-timer", active);
    this._syncMobileTimerAction();
    const corner = this.$("sleepTimerCorner");
    if (!corner) return;
    if (!active) {
      this._state.mobileSleepTimerMenuOpen = false;
      if (corner.innerHTML !== "") corner.innerHTML = "";
      corner.hidden = true;
      return;
    }
    const nextHtml = this._sleepTimerCornerInnerHtml();
    if (corner.innerHTML !== nextHtml) corner.innerHTML = nextHtml;
    corner.hidden = false;
  }

  _persistMobileAppearance() {
    this._writeOperationalMobileStateToLocalStorage();
    this._scheduleSystemMobileStatePersist();
    if (this._usesVisualSettings()) return;
    const storedDynamicThemeMode = ["off", "auto", "strong"].includes(String(this._state.mobileDynamicThemeMode || "auto").toLowerCase())
      ? String(this._state.mobileDynamicThemeMode || "auto").toLowerCase()
      : "auto";
    const storedBackgroundMotionMode = ["off", "subtle", "strong", "extreme"].includes(String(this._state.mobileBackgroundMotionMode || "subtle").toLowerCase())
      ? String(this._state.mobileBackgroundMotionMode || "subtle").toLowerCase()
      : "subtle";
    const storedPerformanceProfile = HomeiiMobileSettingsFoundation.normalizePerformanceProfile(this._state.performanceProfile, this._state.performanceMode);
    try { localStorage.setItem(this._lsKey("homeii_music_flow_mobile_custom_color"), this._state.mobileCustomColor || "#f5a623"); } catch (_) {}
    try { localStorage.setItem(this._lsKey("homeii_music_flow_mobile_performance_profile"), storedPerformanceProfile); } catch (_) {}
    try { localStorage.setItem(this._lsKey("homeii_music_flow_mobile_performance_mode"), JSON.stringify(!!this._state.performanceMode)); } catch (_) {}
    try { localStorage.setItem(this._lsKey("homeii_music_flow_mobile_dynamic_theme_mode"), storedDynamicThemeMode); } catch (_) {}
    try { localStorage.setItem(this._lsKey("homeii_music_flow_mobile_background_motion_mode"), storedBackgroundMotionMode); } catch (_) {}
    try { localStorage.setItem(this._lsKey("homeii_music_flow_mobile_custom_text"), this._state.mobileCustomTextTone || "light"); } catch (_) {}
    try { localStorage.setItem(this._lsKey("homeii_music_flow_mobile_font_scale"), String(this._state.mobileFontScale || 1)); } catch (_) {}
    try { localStorage.setItem(this._lsKey("homeii_music_flow_mobile_icon_scale"), String(this._mobileIconScale())); } catch (_) {}
    try { localStorage.setItem(this._lsKey("homeii_music_flow_mobile_lyrics_sync"), JSON.stringify(this._state.mobileLyricsSyncEnabled !== false)); } catch (_) {}
    try { localStorage.setItem(this._lsKey("homeii_music_flow_mobile_lyrics_offset_ms"), String(this._lyricsSyncOffsetMs())); } catch (_) {}
    try { localStorage.setItem(this._lsKey("homeii_music_flow_mobile_lyrics_font_scale"), String(this._lyricsFontScale())); } catch (_) {}
    try { localStorage.setItem(this._lsKey("homeii_music_flow_mobile_compact_mode"), JSON.stringify(!!this._state.mobileCompactMode)); } catch (_) {}
    try { localStorage.setItem(this._lsKey("homeii_music_flow_mobile_compact_widget_mode"), this._mobileCompactWidgetMode()); } catch (_) {}
    try { localStorage.setItem(this._lsKey("homeii_music_flow_mobile_compact_edge_to_edge"), JSON.stringify(this._mobileCompactEdgeToEdgeEnabled())); } catch (_) {}
    try { localStorage.setItem(this._lsKey("homeii_music_flow_mobile_edge_to_edge"), JSON.stringify(this._state.mobileEdgeToEdge === true || this._config?.mobile_edge_to_edge === true)); } catch (_) {}
    try { localStorage.setItem(this._lsKey("homeii_music_flow_mobile_layout_mode"), this._mobileLayoutMode()); } catch (_) {}
    try { localStorage.setItem(this._lsKey("homeii_music_flow_mobile_cover_flow"), JSON.stringify(this._mobileCoverFlowEnabled())); } catch (_) {}
    try { localStorage.setItem(this._lsKey("homeii_music_flow_mobile_queue_flow"), JSON.stringify(this._mobileQueueFlowEnabled())); } catch (_) {}
    try { localStorage.setItem(this._lsKey("homeii_music_flow_mobile_library_default_layout"), this._defaultMobileMediaLayout()); } catch (_) {}
    try { localStorage.setItem(this._lsKey("homeii_music_flow_mobile_show_up_next"), JSON.stringify(this._mobileShowUpNextEnabled())); } catch (_) {}
    try { localStorage.setItem(this._lsKey("homeii_music_flow_mobile_footer_search"), JSON.stringify(!!this._state.mobileFooterSearchEnabled)); } catch (_) {}
    try { localStorage.setItem(this._lsKey("homeii_music_flow_mobile_studio_shortcut"), JSON.stringify(this._mobileStudioShortcutEnabled())); } catch (_) {}
    try { localStorage.setItem(this._lsKey("homeii_music_flow_mobile_footer_mode"), this._state.mobileFooterMode || "icon"); } catch (_) {}
    try { localStorage.setItem(this._lsKey("homeii_music_flow_player_design"), this._state.mobilePlayerDesign || "immersive"); } catch (_) {}
    try { localStorage.setItem(this._lsKey("homeii_music_flow_mobile_home_shortcut"), JSON.stringify(!!this._state.mobileHomeShortcutEnabled)); } catch (_) {}
    try { localStorage.setItem(this._lsKey("homeii_music_flow_mobile_home_shortcut_path"), this._mobileHomeShortcutPath()); } catch (_) {}
    try { localStorage.setItem(this._lsKey("homeii_music_flow_mobile_volume_mode"), this._mobileVolumeMode()); } catch (_) {}
    try { localStorage.setItem(this._lsKey("homeii_music_flow_mobile_volume_step_buttons"), JSON.stringify(this._mobileVolumeStepButtonsEnabled())); } catch (_) {}
    try { localStorage.setItem(this._lsKey("homeii_music_flow_mobile_volume_step_percent"), String(this._mobileVolumeStepPercent())); } catch (_) {}
    try { localStorage.setItem(this._lsKey("homeii_music_flow_mobile_mic_mode"), this._mobileMicMode()); } catch (_) {}
    try { localStorage.setItem(this._lsKey("homeii_music_flow_voice_assistant_enabled"), JSON.stringify(this._voiceAssistantEnabled())); } catch {}
    try { localStorage.setItem(this._lsKey("homeii_music_flow_voice_assistant_mode"), this._voiceAssistantMode()); } catch {}
    try { localStorage.setItem(this._lsKey("homeii_music_flow_voice_assistant_agent_id"), this._voiceAssistantAgentId()); } catch {}
    try { localStorage.setItem(this._lsKey("homeii_music_flow_voice_assistant_speak_feedback"), JSON.stringify(this._voiceAssistantSpeakFeedbackEnabled())); } catch {}
    try { localStorage.setItem(this._lsKey("homeii_music_flow_mobile_library_tabs"), JSON.stringify(this._mobileLibraryTabs())); } catch (_) {}
    try { localStorage.setItem(this._lsKey("homeii_music_flow_mobile_library_favorites_tabs"), JSON.stringify(this._libraryFavoritesOnlyTabs())); } catch (_) {}
    try {
      const storedMainBarItems = HomeiiMobileSettingsFoundation.normalizeMobileMainBarItems(this._state.mobileMainBarItems, {
        usesVisualSettings: this._usesVisualSettings(),
        hidePlayers: false,
        fallbackItems: this._defaultMobileMainBarItems(),
      });
      localStorage.setItem(this._lsKey("homeii_music_flow_mobile_main_bar_items"), JSON.stringify(storedMainBarItems));
    } catch (_) {}
    try { localStorage.setItem(this._lsKey("homeii_music_flow_mobile_quick_actions"), JSON.stringify(this._mobileQuickActions())); } catch (_) {}
    this._state.mobileLikedMode = "ma";
    try { localStorage.setItem(this._lsKey("homeii_music_flow_mobile_swipe_mode"), this._state.mobileSwipeMode || "play"); } catch (_) {}
    try { localStorage.setItem(this._lsKey("homeii_music_flow_mobile_radio_source_mode"), this._mobileRadioSourceMode()); } catch (_) {}
    try { localStorage.setItem(this._lsKey("homeii_music_flow_mobile_radio_country"), this._mobileRadioBrowserCountry()); } catch (_) {}
    try { localStorage.setItem(this._lsKey("homeii_music_flow_mobile_announcement_presets"), JSON.stringify(this._state.mobileAnnouncementPresets || [])); } catch (_) {}
    try { localStorage.setItem(this._lsKey("homeii_music_flow_mobile_announcement_volume"), String(this._announcementVolumePct())); } catch (_) {}
    try { localStorage.setItem(this._lsKey("homeii_music_flow_mobile_announcement_tts_entity"), this._state.mobileAnnouncementTtsEntity || ""); } catch (_) {}
    try { localStorage.setItem(this._lsKey("homeii_music_flow_mobile_announcement_tts_language"), this._announcementLanguageSetting()); } catch (_) {}
    try { localStorage.setItem(this._lsKey("homeii_music_flow_ambient_light_enabled"), JSON.stringify(!!this._state.ambientLightEnabled)); } catch {}
    try { localStorage.setItem(this._lsKey("homeii_music_flow_ambient_light_entities"), JSON.stringify(this._ambientLightEntities())); } catch {}
    try { localStorage.setItem(this._lsKey("homeii_music_flow_ambient_light_player_map"), JSON.stringify(this._ambientLightPlayerMap())); } catch {}
    try { localStorage.setItem(this._lsKey("homeii_music_flow_ambient_light_brightness"), String(this._ambientLightBrightness())); } catch {}
    try { localStorage.setItem(this._lsKey("homeii_music_flow_ambient_light_transition"), String(this._ambientLightTransition())); } catch {}
    try { localStorage.setItem(this._lsKey("homeii_music_flow_ambient_light_cooldown"), String(this._ambientLightCooldown())); } catch {}
    try { localStorage.setItem(this._lsKey("homeii_music_flow_screensaver_enabled"), JSON.stringify(!!this._state.screensaverEnabled)); } catch {}
    try { localStorage.setItem(this._lsKey("homeii_music_flow_screensaver_auto_lyrics_when_playing"), JSON.stringify(!!this._state.screensaverAutoLyricsWhenPlaying)); } catch {}
    try { localStorage.setItem(this._lsKey("homeii_music_flow_screensaver_control_buttons"), JSON.stringify(this._screensaverControlButtons({ includeDisabled: true }))); } catch {}
    try { localStorage.setItem(this._lsKey("homeii_music_flow_screensaver_clock_mode"), this._screensaverClockMode()); } catch {}
    try { localStorage.setItem(this._lsKey("homeii_music_flow_screensaver_timeout_seconds"), String(this._screensaverTimeoutSeconds())); } catch {}
    try { localStorage.setItem(this._lsKey("homeii_music_flow_screensaver_message"), this._screensaverMessage()); } catch {}
    try { localStorage.setItem(this._lsKey("homeii_music_flow_screensaver_clock_size"), String(this._screensaverClockSize())); } catch {}
    try { localStorage.setItem(this._lsKey("homeii_music_flow_screensaver_clock_x"), String(this._screensaverClockX())); } catch {}
    try { localStorage.setItem(this._lsKey("homeii_music_flow_screensaver_clock_y"), String(this._screensaverClockY())); } catch {}
    try { localStorage.setItem(this._lsKey("homeii_music_flow_power_button_enabled"), JSON.stringify(!!this._state.powerButtonEnabled)); } catch {}
    try { localStorage.setItem(this._lsKey("homeii_music_flow_power_button_name"), this._state.powerButtonName || ""); } catch {}
    try { localStorage.setItem(this._lsKey("homeii_music_flow_power_button_icon"), this._powerButtonIcon()); } catch {}
    try { localStorage.setItem(this._lsKey("homeii_music_flow_power_button_action"), this._powerButtonAction()); } catch {}
    try { localStorage.setItem(this._lsKey("homeii_music_flow_power_button_entity"), this._powerButtonEntity()); } catch {}
    try { localStorage.setItem(this._lsKey("homeii_music_flow_auxiliary_buttons"), JSON.stringify(this._auxiliaryButtonsConfigPayload())); } catch {}
    try { localStorage.setItem(this._lsKey("homeii_music_flow_discovery_mode_enabled"), JSON.stringify(this._discoveryModeEnabled())); } catch {}
    try { localStorage.setItem(this._lsKey("homeii_music_flow_discovery_category_key"), this._state.discoveryCategoryKey || "pop"); } catch {}
    try { localStorage.setItem(this._lsKey("homeii_music_flow_discovery_genre_key"), this._state.discoveryGenreKey || "all"); } catch {}
    try { localStorage.setItem(this._lsKey("homeii_music_flow_mobile_pinned_players"), JSON.stringify(this._pinnedPlayerPreferences())); } catch (_) {}
    try { localStorage.setItem(this._lsKey("homeii_music_flow_mobile_pinned_player"), this._pinnedPlayerPreference()); } catch (_) {}
    try { localStorage.setItem(this._lsKey("homeii_music_flow_excluded_players"), JSON.stringify(this._excludedPlayerPreferences())); } catch (_) {}
    try { localStorage.setItem(this._lsKey("homeii_music_flow_player_sort_mode"), this._playerSortMode()); } catch (_) {}
    try { localStorage.setItem(this._lsKey("homeii_music_flow_player_order"), JSON.stringify(this._playerOrderPreferences())); } catch (_) {}
  }

  _defaultMobileLibraryTabs() {
    return ["library_search", "library_liked", "library_playlists", "library_artists", "library_albums", "library_tracks", "library_radio", "library_podcasts"];
  }

  _defaultMobileMainBarItems() {
    return ["actions", "players", "library", "settings"];
  }

  _defaultMobileQuickActions() {
    return ["timer", "like", "lyrics", "queue", "queue_flow", "radio", "history"];
  }

  _defaultAnnouncementPresets(lang = this._state?.lang || this._config?.language || "en") {
    return HomeiiEditorLocale.isHebrewLanguageTag(lang)
      ? ["ארוחת הערב מוכנה", "נא להגיע לסלון", "יוצאים בעוד חמש דקות"]
      : ["Dinner is ready", "Please come to the living room", "Leaving in five minutes"];
  }

  _isDefaultAnnouncementPresetSet(presets = []) {
    if (!Array.isArray(presets) || !presets.length) return false;
    const normalize = (items) => items.slice(0, 3).map((item) => String(item || "").trim()).join("\n");
    const current = normalize(presets);
    return current === normalize(this._defaultAnnouncementPresets("he"))
      || current === normalize(this._defaultAnnouncementPresets("en"));
  }

  _mobileHomeShortcutEnabled() {
    return !!this._state.mobileHomeShortcutEnabled;
  }

  _mobileHomeShortcutPath() {
    return HomeiiMobileSettingsFoundation.normalizeHomeShortcutPath(this._state.mobileHomeShortcutPath, { leadingSlash: true });
  }

  _voiceAssistantEnabled() {
    return this._state.voiceAssistantEnabled === true;
  }

  _voiceAssistantMode() {
    return HomeiiMobileSettingsFoundation.normalizeVoiceAssistantMode(this._state.voiceAssistantMode);
  }

  _voiceAssistantAgentId() {
    return String(this._state.voiceAssistantAgentId || "").trim();
  }

  _voiceAssistantSpeakFeedbackEnabled() {
    return this._state.voiceAssistantSpeakFeedback === true;
  }

  _voiceAssistantAgentOptions() {
    const options = [{
      value: "",
      label: this._i18n("ui.default_assist_agent"),
    }];
    const current = this._voiceAssistantAgentId();
    const states = Object.values(this._hass?.states || {})
      .filter((entity) => entity?.entity_id?.startsWith?.("conversation."))
      .map((entity) => ({
        value: entity.entity_id,
        label: entity.attributes?.friendly_name || entity.entity_id,
      }))
      .sort((left, right) => String(left.label).localeCompare(String(right.label), undefined, { sensitivity: "base" }));
    states.forEach((option) => {
      if (!options.some((item) => item.value === option.value)) options.push(option);
    });
    if (current && !options.some((item) => item.value === current)) {
      options.push({ value: current, label: current });
    }
    return options;
  }

  _ambientLightEnabled() {
    return this._state.ambientLightEnabled === true;
  }

  _ambientLightEntities() {
    const entities = HomeiiMobileSettingsFoundation.normalizeEntityList(this._state.ambientLightEntities);
    this._state.ambientLightEntities = entities;
    return entities;
  }

  _ambientLightPlayerMap() {
    const mappings = HomeiiMobileSettingsFoundation.normalizeStringArray(this._state.ambientLightPlayerMap);
    this._state.ambientLightPlayerMap = mappings;
    return mappings;
  }

  _ambientLightPlayerMapEntries() {
    return HomeiiMobileSettingsFoundation.parseAmbientLightPlayerMap(this._ambientLightPlayerMap());
  }

  _ambientLightEntitiesForPlayer(player = this._getSelectedPlayer()) {
    const playerId = String(player?.entity_id || this._state.selectedPlayer || "").trim();
    const mapped = this._ambientLightPlayerMapEntries()
      .find((entry) => entry.player === playerId);
    const entities = mapped ? mapped.lights : this._ambientLightEntities();
    return HomeiiMobileSettingsFoundation.normalizeEntityList(entities)
      .filter((entityId) => entityId.startsWith("light."));
  }

  _ambientLightBrightnessForPlayer(player = this._getSelectedPlayer()) {
    const maxBrightness = this._ambientLightBrightness();
    const volumeLevel = Number(player?.attributes?.volume_level);
    if (!Number.isFinite(volumeLevel)) return maxBrightness;
    const ratio = Math.max(0, Math.min(1, volumeLevel));
    return Math.max(1, Math.min(maxBrightness, Math.round(maxBrightness * ratio)));
  }

  _ambientLightBrightness() {
    const brightness = HomeiiMobileSettingsFoundation.clampPercent(this._state.ambientLightBrightness, 35, { min: 1, max: 100 });
    this._state.ambientLightBrightness = brightness;
    return brightness;
  }

  _ambientLightTransition() {
    const transition = HomeiiMobileSettingsFoundation.clampSeconds(this._state.ambientLightTransition, 3, { min: 0, max: 120 });
    this._state.ambientLightTransition = transition;
    return transition;
  }

  _ambientLightCooldown() {
    const cooldown = HomeiiMobileSettingsFoundation.clampSeconds(this._state.ambientLightCooldown, 8, { min: 0, max: 120 });
    this._state.ambientLightCooldown = cooldown;
    return cooldown;
  }

  _isVisualEditorContext() {
    if (this._editMode === true) return true;
    const attr = String(this.getAttribute?.("edit-mode") || this.getAttribute?.("data-edit-mode") || "").toLowerCase();
    if (attr === "true" || attr === "1") return true;
    let node = this;
    for (let depth = 0; node && depth < 14; depth += 1) {
      const signature = [
        node.localName,
        node.tagName,
        node.id,
        node.className,
        node.getAttribute?.("id"),
        node.getAttribute?.("class"),
      ].map((value) => String(value || "").toLowerCase()).join(" ");
      if (
        signature.includes("hui-card-preview")
        || signature.includes("hui-card-editor")
        || signature.includes("hui-dialog-edit-card")
        || signature.includes("hui-card-options")
        || signature.includes("lovelace-card-editor")
      ) {
        return true;
      }
      const root = node.getRootNode?.();
      node = node.parentElement || node.parentNode || (root?.host && root.host !== node ? root.host : null);
    }
    return false;
  }

  _screensaverSuppressedByEditor() {
    return this._isVisualEditorContext();
  }

  _screensaverEnabled() {
    if (this._state.screensaverEnabled !== true) return false;
    const rect = this.getBoundingClientRect?.();
    const width = Math.max(
      Number(rect?.width || 0),
      Number(this.offsetWidth || 0),
      typeof window !== "undefined" ? Number(window.innerWidth || 0) : 0,
    );
    const height = Math.max(
      Number(rect?.height || 0),
      typeof window !== "undefined" ? Number(window.innerHeight || 0) : 0,
    );
    return width >= 760 && height >= 620;
  }

  _screensaverControlsEnabled() {
    return this._state.screensaverControlsEnabled === true;
  }

  _screensaverAutoLyricsWhenPlaying() {
    return this._state.screensaverAutoLyricsWhenPlaying === true;
  }

  _maybeOpenScreensaverLyricsForPlayback(player = this._getSelectedPlayer()) {
    if (!this._screensaverAutoLyricsWhenPlaying()) return false;
    if (this._state.lyricsOpen || this._state.screensaverLyricsOpen) return false;
    if (player?.state !== "playing") return false;
    this._state.screensaverLyricsOpen = true;
    return true;
  }

  _defaultScreensaverControlButtons() {
    return ["previous", "next"];
  }

  _screensaverControlButtons(options = {}) {
    const buttons = HomeiiMobileSettingsFoundation.normalizeScreensaverControlButtons(
      this._state.screensaverControlButtons,
      this._defaultScreensaverControlButtons(),
    );
    this._state.screensaverControlButtons = buttons;
    if (options.includeDisabled === true) return buttons;
    return this._screensaverControlsEnabled() ? buttons : [];
  }

  _screensaverControlButtonOptions() {
    return [
      { value: "previous", icon: "previous", label: this._i18n("ui.previous") },
      { value: "play_pause", icon: this._playPauseIconName(this._getSelectedPlayer()), label: this._i18n("ui.play_pause") },
      { value: "next", icon: "next", label: this._i18n("ui.next") },
      { value: "mute", icon: this._volumeIconName(this._getSelectedPlayer()), label: this._i18n("ui.mute") },
      { value: "power", icon: this._powerButtonIcon(), label: this._i18n("ui.auxiliary_button") },
      { value: "like", icon: this._currentMediaFavoriteState() ? "heart_filled" : "heart_outline", label: this._i18n("ui.like_2") },
      { value: "lyrics", icon: "lyrics", label: this._i18n("ui.lyrics") },
      { value: "lyrics_sync", icon: "sync", label: this._i18n("ui.sync_lyrics") },
      { value: "lyrics_font_minus", icon: "minus", label: this._i18n("ui.smaller_lyrics") },
      { value: "lyrics_font_plus", icon: "plus", label: this._i18n("ui.larger_lyrics") },
      { value: "voice", icon: "mic", label: this._flowAssistantLabel() },
    ];
  }

  _screensaverControlButtonHtml(value = "") {
    const option = this._screensaverControlButtonOptions().find((item) => item.value === value);
    if (!option) return "";
    if (value === "voice" && !this._voiceAssistantEnabled()) return "";
    const idMap = {
      previous: "screensaverPrevBtn",
      play_pause: "screensaverPlayPauseBtn",
      next: "screensaverNextBtn",
      mute: "screensaverMuteBtn",
      power: "screensaverPowerBtn",
      lyrics: "screensaverLyricsBtn",
      lyrics_sync: "screensaverLyricsSyncBtn",
      lyrics_font_minus: "screensaverLyricsFontMinusBtn",
      lyrics_font_plus: "screensaverLyricsFontPlusBtn",
      voice: "screensaverVoiceBtn",
    };
    const id = idMap[value];
    if (!id) return "";
    const voiceAttrs = value === "voice" ? " data-screensaver-voice" : "";
    const pressedClass = value === "voice" && this._state.voiceAssistantListening ? " listening" : "";
    const activeClass = value === "lyrics_sync" && this._state.mobileLyricsSyncEnabled !== false ? " active" : "";
    const primaryClass = value === "play_pause" ? " primary" : "";
    return `<button class="screensaver-voice-btn screensaver-control-btn${primaryClass}${pressedClass}${activeClass}" id="${id}" data-screensaver-control="${this._esc(value)}"${voiceAttrs} title="${this._esc(option.label)}" aria-label="${this._esc(option.label)}">${this._iconSvg(option.icon)}</button>`;
  }

  _screensaverClockMode() {
    const mode = HomeiiMobileSettingsFoundation.normalizeScreensaverClockMode(this._state.screensaverClockMode);
    this._state.screensaverClockMode = mode;
    return mode;
  }

  _screensaverClockSize() {
    const size = HomeiiMobileSettingsFoundation.clampNumber(this._state.screensaverClockSize, 1, { min: 0.75, max: 1.45 });
    this._state.screensaverClockSize = size;
    return size;
  }

  _screensaverClockX() {
    const x = HomeiiMobileSettingsFoundation.clampNumber(this._state.screensaverClockX, 82, { min: 8, max: 92 });
    this._state.screensaverClockX = x;
    return x;
  }

  _screensaverClockY() {
    const y = HomeiiMobileSettingsFoundation.clampNumber(this._state.screensaverClockY, 24, { min: 8, max: 70 });
    this._state.screensaverClockY = y;
    return y;
  }

  _syncScreensaverClockVars() {
    const card = this.shadowRoot?.querySelector?.(".card");
    if (!card) return;
    card.style.setProperty("--screensaver-clock-scale", this._screensaverClockSize().toFixed(2));
    card.style.setProperty("--screensaver-clock-x", `${this._screensaverClockX().toFixed(1)}%`);
    card.style.setProperty("--screensaver-clock-y", `${this._screensaverClockY().toFixed(1)}%`);
  }

  _screensaverTimeoutSeconds() {
    const seconds = HomeiiMobileSettingsFoundation.clampSeconds(this._state.screensaverTimeoutSeconds, 90, { min: 15, max: 3600 });
    this._state.screensaverTimeoutSeconds = seconds;
    return seconds;
  }

  _screensaverMessage() {
    return String(this._state.screensaverMessage || "").trim();
  }
  _powerButtonEnabled() {
    return this._state.powerButtonEnabled === true;
  }

  _powerButtonAction() {
    const action = HomeiiMobileSettingsFoundation.normalizePowerButtonAction(this._state.powerButtonAction);
    this._state.powerButtonAction = action;
    return action;
  }

  _powerButtonIcon() {
    const icon = HomeiiMobileSettingsFoundation.normalizeAuxiliaryButtonIcon(this._state.powerButtonIcon || "power");
    this._state.powerButtonIcon = icon;
    return icon;
  }

  _powerButtonEntity() {
    return String(this._state.powerButtonEntity || "").trim();
  }

  _auxiliaryButtonsConfigPayload() {
    const payload = {};
    (this._state.auxiliaryButtons || []).forEach((button, offset) => {
      const index = offset + 2;
      payload[`aux_button_${index}_enabled`] = button?.enabled === true;
      payload[`aux_button_${index}_name`] = String(button?.name || "").trim();
      payload[`aux_button_${index}_icon`] = HomeiiMobileSettingsFoundation.normalizeAuxiliaryButtonIcon(button?.icon || "power");
      payload[`aux_button_${index}_action`] = HomeiiMobileSettingsFoundation.normalizePowerButtonAction(button?.action);
      payload[`aux_button_${index}_entity`] = String(button?.entity || "").trim();
    });
    return payload;
  }

  _auxiliaryButtonConfigs() {
    const first = {
      enabled: this._powerButtonEnabled(),
      name: String(this._state.powerButtonName || "").trim() || this._i18n("ui.auxiliary_button"),
      icon: this._powerButtonIcon(),
      action: this._powerButtonAction(),
      entity: this._powerButtonEntity(),
    };
    const extras = HomeiiMobileSettingsFoundation.normalizeAuxiliaryButtons({
      power_button_enabled: false,
      ...this._auxiliaryButtonsConfigPayload(),
    }).slice(1);
    this._state.auxiliaryButtons = extras;
    return [first, ...extras].slice(0, 4);
  }

  _enabledAuxiliaryButtons() {
    return this._auxiliaryButtonConfigs()
      .map((button, index) => ({ ...button, index }))
      .filter((button) => button.enabled === true);
  }

  _discoveryModeEnabled() {
    return this._state.discoveryModeEnabled !== false;
  }

  _activeAccentRgbTuple() {
    const parts = String(this._activeAccentRgb() || "")
      .split(/[\s,]+/)
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value));
    if (parts.length >= 3) return parts.slice(0, 3).map((value) => this._clampByte(value));
    return HomeiiPaletteFoundation.hexToRgbTuple(this._activeAccentColor() || "#f5a623");
  }

  _ambientLightTrackSignature(player = this._getSelectedPlayer()) {
    const queueItem = this._state.maQueueState?.current_item || null;
    return [
      player?.entity_id,
      player?.attributes?.media_content_id,
      player?.attributes?.media_title,
      player?.attributes?.media_artist,
      this._getQueueItemStableId?.(queueItem),
      this._getQueueItemUri?.(queueItem),
      this._state.mobileDynamicThemeArtwork || "",
    ].map((value) => String(value || "").trim()).filter(Boolean).join("|");
  }

  _syncAmbientLightForCurrentMedia(reason = "") {
    if (!this._ambientLightEnabled() || !this._hass?.callService) return;
    const player = this._getSelectedPlayer();
    if (!player || player.state !== "playing") return;
    const entities = this._ambientLightEntitiesForPlayer(player);
    if (!entities.length) return;
    const rgb = this._activeAccentRgbTuple();
    const brightness = this._ambientLightBrightnessForPlayer(player);
    const trackSignature = this._ambientLightTrackSignature(player);
    const signature = [
      trackSignature,
      entities.join(","),
      rgb.join(","),
      brightness,
      this._ambientLightTransition(),
    ].join("|");
    if (signature === this._ambientLightLastSignature) return;
    const now = Date.now();
    const trackChanged = trackSignature && trackSignature !== this._ambientLightLastTrackSignature;
    const brightnessChanged = Math.abs(brightness - Number(this._ambientLightLastBrightness || 0)) >= 3;
    const settingsUpdate = reason === "settings";
    const cooldownMs = this._ambientLightCooldown() * 1000;
    if (!trackChanged && !brightnessChanged && !settingsUpdate && cooldownMs > 0 && now - Number(this._ambientLightLastCallAt || 0) < cooldownMs) return;
    this._ambientLightLastSignature = signature;
    this._ambientLightLastTrackSignature = trackSignature;
    this._ambientLightLastCallAt = now;
    this._ambientLightLastBrightness = brightness;
    const serviceCall = this._hass.callService("light", "turn_on", {
      entity_id: entities,
      rgb_color: rgb,
      brightness_pct: brightness,
      transition: this._ambientLightTransition(),
    });
    serviceCall?.catch?.(() => {});
  }

  async _runAuxiliaryButtonAction(index = 0, options = {}) {
    const button = this._auxiliaryButtonConfigs()[Math.max(0, Number(index) || 0)];
    if (!button?.enabled && options.force !== true) return;
    const action = HomeiiMobileSettingsFoundation.normalizePowerButtonAction(button.action);
    const entityId = String(button.entity || "").trim();
    try {
      if (action === "stop_player" || !entityId) {
        const target = entityId && entityId.startsWith("media_player.") ? entityId : this._state.selectedPlayer;
        await this._stopPlayer(target);
        this._toastSuccess(this._i18n("ui.power_action_sent"));
        return;
      }
      const domain = String(entityId).split(".")[0] || "homeassistant";
      const service = action === "script"
        ? "turn_on"
        : action === "scene"
          ? "turn_on"
          : action;
      const serviceDomain = action === "script"
        ? "script"
        : action === "scene"
          ? "scene"
          : domain;
      await this._hass?.callService?.(serviceDomain, service, { entity_id: entityId });
      this._toastSuccess(this._i18n("ui.power_action_sent"));
    } catch (error) {
      this._toastError(this._i18n("ui.power_action_failed") + (error?.message ? `: ${error.message}` : ""));
    }
  }

  async _runPowerButtonAction() {
    await this._runAuxiliaryButtonAction(0);
  }

  _handleScreensaverActivity(event = null) {
    if (event && event.isTrusted === false) return;
    if (event?.target?.closest?.("[data-screensaver-control], [data-screensaver-voice]")) return;
    if (
      this._state.voiceAssistantKeepScreensaver === true
      && event?.target?.closest?.("#voiceAssistantDialog, .voice-assistant-panel")
    ) {
      return;
    }
    if (event?.target?.closest?.("#screensaverBackdrop")) {
      event.preventDefault?.();
      event.stopPropagation?.();
    }
    this._resetScreensaverTimer({ hide: true, activity: true });
  }

  _startScreensaverVisibilityTracking() {
    if (this._screensaverVisibilityObserver || typeof IntersectionObserver === "undefined") {
      this._markScreensaverPageEntry("connected");
      return;
    }
    this._screensaverVisibilityObserver = new IntersectionObserver((entries = []) => {
      const visible = entries.some((entry) => entry.isIntersecting && Number(entry.intersectionRatio || 0) > 0);
      const wasVisible = this._screensaverVisible !== false;
      this._screensaverVisibilityKnown = true;
      this._screensaverVisible = visible;
      if (visible && !wasVisible) {
        this._markScreensaverPageEntry("visible");
      } else if (!visible && wasVisible) {
        this._pauseScreensaverWhileHidden();
      } else if (visible && this._screensaverPageEntryPending) {
        this._markScreensaverPageEntry("visible");
      }
    }, { threshold: 0.01 });
    this._screensaverVisibilityObserver.observe(this);
  }

  _stopScreensaverVisibilityTracking() {
    if (this._screensaverVisibilityObserver) {
      this._screensaverVisibilityObserver.disconnect();
      this._screensaverVisibilityObserver = null;
    }
    this._screensaverVisibilityKnown = false;
    this._screensaverVisible = true;
  }

  _pauseScreensaverWhileHidden() {
    clearTimeout(this._screensaverTimer);
    this._screensaverTimer = null;
    this._hideScreensaver();
  }

  _markScreensaverPageEntry(reason = "entry") {
    this._screensaverPageEntryPending = true;
    this._screensaverPageEntryReason = reason;
    this._screensaverSuppressUntil = Date.now() + (this._screensaverTimeoutSeconds() * 1000);
    this._resetScreensaverTimer({ hide: true, activity: true });
  }

  _resetScreensaverTimer({ hide = false, delayMs = null, activity = false } = {}) {
    clearTimeout(this._screensaverTimer);
    this._screensaverTimer = null;
    if (hide) this._hideScreensaver();
    if (this._screensaverSuppressedByEditor()) {
      this._hideScreensaver();
      return;
    }
    if (!this._screensaverEnabled() || !this.isConnected) return;
    if (this._screensaverVisibilityKnown && this._screensaverVisible === false) return;
    const defaultDelayMs = this._screensaverTimeoutSeconds() * 1000;
    if (activity || hide) {
      this._screensaverSuppressUntil = Date.now() + defaultDelayMs;
    }
    const timeoutMs = delayMs !== null && Number.isFinite(Number(delayMs))
      ? Math.max(500, Number(delayMs))
      : defaultDelayMs;
    this._screensaverTimer = setTimeout(() => {
      this._showScreensaver();
    }, timeoutMs);
  }

  _screensaverBlocked() {
    return !!(
      this._screensaverSuppressedByEditor()
      || this._state.menuOpen
      || this._state.lyricsOpen
      || this.$("immersiveActionsToggle")?.getAttribute("aria-expanded") === "true"
      || this._state.controlRoomOpen
      || this._state.mobileHistoryDrawerOpen
      || (this._state.voiceAssistantDialogOpen && this._state.voiceAssistantKeepScreensaver !== true)
      || this.$("mobileQueueActionModal")?.classList?.contains("open")
      || this.$("mobileVolumePresetModal")?.classList?.contains("open")
      || this.$("mobileSmartVoiceModal")?.classList?.contains("open")
    );
  }

  _showScreensaver(options = {}) {
    const force = options?.force === true;
    if (this._screensaverSuppressedByEditor()) {
      this._hideScreensaver();
      return;
    }
    if (!force && !this._screensaverEnabled()) return;
    const now = Date.now();
    const suppressUntil = Number(this._screensaverSuppressUntil || 0);
    if (!force && suppressUntil > now) {
      this._resetScreensaverTimer({ delayMs: suppressUntil - now });
      return;
    }
    if (!force && this._screensaverBlocked()) {
      this._resetScreensaverTimer({ delayMs: 2000 });
      return;
    }
    this._state.screensaverOpen = true;
    const overlay = this.$("screensaverBackdrop");
    if (!overlay) return;
    clearTimeout(this._screensaverExitTimer);
    this._screensaverExitTimer = null;
    this.classList.add("screensaver-page-open");
    this.shadowRoot?.querySelector?.(".card")?.classList?.add("screensaver-active");
    overlay.classList.remove("closing");
    overlay.classList.add("open");
    overlay.setAttribute("aria-hidden", "false");
    if (this._state.lyricsOpen) {
      this._state.screensaverLyricsOpen = true;
      this._closeLyricsModal?.({ preserveLyrics: true, sync: false });
    } else {
      this._maybeOpenScreensaverLyricsForPlayback(this._getSelectedPlayer());
    }
    if (this._lyricsSessionActive?.()) this._syncLyricsForCurrentTrack();
    this._ensureQueueSnapshot(true)
      .then(() => { if (this._state.screensaverOpen) this._syncScreensaverUi(); })
      .catch(() => {});
    this._syncScreensaverUi();
    clearInterval(this._screensaverClockTimer);
    this._screensaverClockTimer = setInterval(() => this._syncScreensaverUi(), 1000);
  }

  _hideScreensaver() {
    const overlay = this.$("screensaverBackdrop");
    const wasVisible = !!(this._state.screensaverOpen || overlay?.classList?.contains("open") || overlay?.classList?.contains("closing"));
    if (!wasVisible) {
      this.classList.remove("screensaver-page-open");
      this.shadowRoot?.querySelector?.(".card")?.classList?.remove("screensaver-active");
      return;
    }
    this._state.screensaverOpen = false;
    this._screensaverLyricsInactiveSince = 0;
    this._state.screensaverLyricsOpen = false;
    if (!this._state.lyricsOpen) this._clearLyricsState?.();
    overlay?.classList.remove("open");
    overlay?.classList.add("closing");
    overlay?.setAttribute("aria-hidden", "true");
    if (this._state.voiceAssistantKeepScreensaver) {
      this._state.voiceAssistantKeepScreensaver = false;
      this._syncVoiceAssistantDialog();
    }
    clearInterval(this._screensaverClockTimer);
    this._screensaverClockTimer = null;
    clearTimeout(this._screensaverExitTimer);
    const finishHide = () => {
      if (this._state.screensaverOpen) return;
      overlay?.classList.remove("closing");
      this.classList.remove("screensaver-page-open");
      this.shadowRoot?.querySelector?.(".card")?.classList?.remove("screensaver-active");
      this._screensaverExitTimer = null;
      this._syncNowPlayingUI();
    };
    const reduceMotion = (() => {
      try { return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true; } catch { return false; }
    })();
    this._screensaverExitTimer = setTimeout(finishHide, reduceMotion ? 0 : 520);
  }

  _restoreScreensaverIfOpen() {
    if (!this._state.screensaverOpen) return;
    const overlay = this.$("screensaverBackdrop");
    if (!overlay) return;
    clearTimeout(this._screensaverExitTimer);
    this._screensaverExitTimer = null;
    this.classList.add("screensaver-page-open");
    this.shadowRoot?.querySelector?.(".card")?.classList?.add("screensaver-active");
    overlay.classList.remove("closing");
    overlay.classList.add("open");
    overlay.setAttribute("aria-hidden", "false");
    this._syncScreensaverUi();
    if (!this._screensaverClockTimer) {
      this._screensaverClockTimer = setInterval(() => this._syncScreensaverUi(), 1000);
    }
  }

  _setScreensaverImageHost(host, url = "", fallbackHtml = "") {
    if (!host) return;
    const nextUrl = String(url || "").trim();
    if (host.dataset.artUrl === nextUrl) return;
    host.dataset.artUrl = nextUrl;
    host.dataset.artReady = nextUrl ? "0" : "1";
    if (!nextUrl) {
      host.innerHTML = fallbackHtml;
      return;
    }
    const img = document.createElement("img");
    img.alt = "";
    img.decoding = "async";
    img.loading = "eager";
    const applyImage = () => {
      if (!host.isConnected || host.dataset.artUrl !== nextUrl) return;
      host.dataset.artReady = "1";
      host.replaceChildren(img);
    };
    img.addEventListener("load", applyImage, { once: true });
    img.addEventListener("error", () => {
      if (!host.isConnected || host.dataset.artUrl !== nextUrl) return;
      host.dataset.artReady = "1";
      host.innerHTML = fallbackHtml;
    }, { once: true });
    img.src = nextUrl;
    if (img.complete) applyImage();
  }

  _setScreensaverBackgroundArt(overlay, url = "") {
    if (!overlay) return;
    const nextUrl = String(url || "").trim();
    if (overlay.dataset.bgArtUrl === nextUrl) return;
    overlay.dataset.bgArtUrl = nextUrl;
    if (!nextUrl) {
      overlay.style.setProperty("--screensaver-art-url", "none");
      return;
    }
    const img = new Image();
    img.decoding = "async";
    const applyImage = () => {
      if (!overlay.isConnected || overlay.dataset.bgArtUrl !== nextUrl) return;
      overlay.style.setProperty("--screensaver-art-url", `url(${JSON.stringify(nextUrl)})`);
    };
    img.addEventListener("load", applyImage, { once: true });
    img.addEventListener("error", () => {
      if (!overlay.isConnected || overlay.dataset.bgArtUrl !== nextUrl) return;
      if (!overlay.style.getPropertyValue("--screensaver-art-url")) {
        overlay.style.setProperty("--screensaver-art-url", "none");
      }
    }, { once: true });
    img.src = nextUrl;
    if (img.complete) applyImage();
  }

  _screensaverLyricsModeActive(player = null) {
    if (!(this._state.lyricsOpen || this._state.screensaverLyricsOpen) || !this._state.screensaverOpen) {
      this._screensaverLyricsInactiveSince = 0;
      return false;
    }
    if (player?.state === "playing") {
      this._screensaverLyricsInactiveSince = 0;
      return true;
    }
    const now = Date.now();
    if (!this._screensaverLyricsInactiveSince) this._screensaverLyricsInactiveSince = now;
    const active = now - this._screensaverLyricsInactiveSince < 30000;
    if (!active) {
      this._state.screensaverLyricsOpen = false;
      if (!this._state.lyricsOpen) this._clearLyricsState?.();
    }
    return active;
  }

  _screensaverLyricsRows() {
    const lines = Array.isArray(this._state.lyricsLines) ? this._state.lyricsLines : [];
    if (lines.length) {
      const activeIndex = Math.max(0, this._currentLyricsActiveIndex(lines));
      return [
        { kind: "muted", text: lines[activeIndex - 1]?.text || "" },
        { kind: "current", text: lines[activeIndex]?.text || "" },
        { kind: "muted", text: lines[activeIndex + 1]?.text || "" },
      ].filter((row) => String(row.text || "").trim());
    }
    if (this._state.lyricsLoading) {
      return [{ kind: "current", text: this._i18n("ui.loading_lyrics") }];
    }
    const textRows = String(this._state.lyricsText || "")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, 4);
    if (textRows.length) {
      return textRows.map((text, index) => ({ kind: index === 0 ? "current" : "muted", text }));
    }
    return [{ kind: "current", text: this._i18n("ui.no_lyrics_found") }];
  }

  _syncScreensaverLyricsUi(player = null) {
    const overlay = this.$("screensaverBackdrop");
    const host = this.$("screensaverLyrics");
    if (!overlay || !host) return;
    host.style?.setProperty("--lyrics-font-scale", this._lyricsFontScale().toFixed(2));
    const active = this._screensaverLyricsModeActive(player);
    overlay.classList.toggle("lyrics-mode", active);
    if (!active) {
      host.dataset.lyricsSignature = "";
      host.innerHTML = "";
      return;
    }
    const rows = this._screensaverLyricsRows();
    const signature = rows.map((row) => `${row.kind}:${row.text}`).join("\n");
    if (host.dataset.lyricsSignature === signature) return;
    host.dataset.lyricsSignature = signature;
    host.innerHTML = rows.map((row) => `
      <div class="screensaver-lyric-line ${this._esc(row.kind)}">${this._esc(row.text)}</div>
    `).join("");
  }
  _openTabletLyricsScreensaver() {
    if (this._layoutModeConfig() !== "tablet") return false;
    if (!this._getSelectedPlayer()) return false;
    if (this._screensaverSuppressedByEditor()) return false;
    this._screensaverSuppressUntil = 0;
    this._state.lyricsOpen = false;
    this._state.screensaverLyricsOpen = true;
    this._closeLyricsModal?.({ preserveLyrics: true, sync: false });
    this._showScreensaver({ force: true });
    this._syncScreensaverUi();
    return true;
  }

  _syncScreensaverUi() {
    const overlay = this.$("screensaverBackdrop");
    if (!overlay) return;
    const mode = this._screensaverClockMode();
    const now = new Date();
    const player = this._getSelectedPlayer();
    const queueItem = this._state.maQueueState?.current_item || null;
    this._syncLocalSendspinMediaSession(player, queueItem);
    const art = this._currentArtworkUrl(player, queueItem, 720, { preferPlayerArtwork: true });
    const mediaTitle = player?.attributes?.media_title || queueItem?.media_item?.name || "";
    const mediaArtist = player?.attributes?.media_artist || (queueItem?.media_item?.artists || []).map((artistEntry) => artistEntry?.name).filter(Boolean).join(", ") || "";
    const hasMedia = !!(mediaTitle || mediaArtist || art);
    ["screensaverPrevBtn", "screensaverPlayPauseBtn", "screensaverNextBtn", "screensaverMuteBtn", "screensaverPowerBtn", "screensaverLyricsBtn", "screensaverLyricsSyncBtn", "screensaverLyricsFontMinusBtn", "screensaverLyricsFontPlusBtn"].forEach((id) => {
      const btn = this.$(id);
      if (!btn) return;
      const available = id === "screensaverPowerBtn" ? !!this._hass : !!player;
      btn.disabled = !available;
      btn.setAttribute("aria-disabled", available ? "false" : "true");
    });
    this._setButtonIcon(this.$("screensaverPlayPauseBtn"), this._playPauseIconName(player));
    this._setButtonIcon(this.$("screensaverMuteBtn"), this._volumeIconName(player));
    const muteBtn = this.$("screensaverMuteBtn");
    if (muteBtn) muteBtn.classList.toggle("active", this._isMuted(player));
    const likeBtn = this.$("screensaverLikeBtn");
    if (likeBtn) {
      likeBtn.hidden = !hasMedia;
      likeBtn.disabled = !hasMedia;
      likeBtn.setAttribute("aria-disabled", hasMedia ? "false" : "true");
      const liked = this._currentMediaFavoriteState();
      likeBtn.classList.toggle("active", liked);
      this._setButtonIcon(likeBtn, liked ? "heart_filled" : "heart_outline");
    }
    const title = mediaTitle || this._i18n("ui.nothing_playing");
    const nextItem = this._mobileUpNextItem();
    const nextTitle = nextItem ? this._queueItemPrimaryTitle(nextItem) : "";
    const nextArtist = nextItem ? this._queueItemPrimaryArtist(nextItem) : "";
    const nextArt = nextItem ? this._queueItemImageUrl(nextItem, 96) : "";
    const message = this._screensaverMessage();
    overlay.classList.toggle("analog-mode", mode === "analog");
    overlay.classList.toggle("digital-mode", mode !== "analog");
    overlay.classList.toggle("empty-mode", !hasMedia);
    this._setScreensaverBackgroundArt(overlay, art);
    this._syncScreensaverLyricsUi(player);
    const lyricsBtn = this.$("screensaverLyricsBtn");
    const lyricsActive = overlay.classList.contains("lyrics-mode");
    if (lyricsBtn) {
      lyricsBtn.classList.toggle("active", lyricsActive);
      lyricsBtn.setAttribute("aria-pressed", lyricsActive ? "true" : "false");
    }
    ["screensaverLyricsSyncBtn", "screensaverLyricsFontMinusBtn", "screensaverLyricsFontPlusBtn"].forEach((id) => {
      const btn = this.$(id);
      if (!btn) return;
      btn.disabled = !lyricsActive;
      btn.setAttribute("aria-disabled", lyricsActive ? "false" : "true");
    });
    const lyricsSyncBtn = this.$("screensaverLyricsSyncBtn");
    if (lyricsSyncBtn) {
      const syncActive = lyricsActive && this._state.mobileLyricsSyncEnabled !== false;
      lyricsSyncBtn.classList.toggle("active", syncActive);
      lyricsSyncBtn.setAttribute("aria-pressed", syncActive ? "true" : "false");
    }
    const clock = this.$("screensaverClock");
    if (clock) {
      clock.textContent = new Intl.DateTimeFormat(this._language(), {
        hour: "2-digit",
        minute: "2-digit",
      }).format(now);
    }
    this._setScreensaverImageHost(this.$("screensaverArt"), art, this._tabletBrandSignatureHtml("screensaver-empty-logo"));
    if (this.$("screensaverTitle")) this.$("screensaverTitle").textContent = title;
    if (this.$("screensaverArtist")) this.$("screensaverArtist").textContent = hasMedia ? (mediaArtist || this._selectedPlayerName()) : "";
    const messageEl = this.$("screensaverMessage");
    if (messageEl) {
      messageEl.hidden = !message;
      messageEl.textContent = message;
    }
    const nextEl = this.$("screensaverNext");
    if (nextEl) {
      nextEl.hidden = !nextTitle;
      if (nextTitle) {
        this._setScreensaverImageHost(this.$("screensaverNextArt"), nextArt, this._iconSvg("tracks"));
        if (this.$("screensaverNextLabel")) this.$("screensaverNextLabel").textContent = this._i18n("ui.up_next_2");
        if (this.$("screensaverNextTitle")) this.$("screensaverNextTitle").textContent = nextTitle;
        if (this.$("screensaverNextArtist")) this.$("screensaverNextArtist").textContent = nextArtist;
      }
    }
    const seconds = now.getSeconds();
    const minutes = now.getMinutes() + (seconds / 60);
    const hours = (now.getHours() % 12) + (minutes / 60);
    this.$("screensaverHour")?.style?.setProperty("--hand-rotation", `${hours * 30}deg`);
    this.$("screensaverMinute")?.style?.setProperty("--hand-rotation", `${minutes * 6}deg`);
    this.$("screensaverSecond")?.style?.setProperty("--hand-rotation", `${seconds * 6}deg`);
  }

  _mobileStudioShortcutEnabled() {
    return this._state.mobileStudioShortcutEnabled !== false;
  }

  _suppressHomeShortcutNavigation(durationMs = 900) {
    this._homeShortcutSuppressUntil = Date.now() + Math.max(0, Number(durationMs) || 0);
  }

  _homeShortcutNavigationSuppressed() {
    return Date.now() < Number(this._homeShortcutSuppressUntil || 0);
  }

  _bindMobileHomeQuickButton() {
    const btn = this.$("mobileHomeQuickBtn");
    if (!btn || btn.dataset.homeiiHomeBound === "1") return;
    btn.dataset.homeiiHomeBound = "1";
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (this._state.controlRoomOpen || this._homeShortcutNavigationSuppressed()) return;
      if (!this._pressUiButton(e.currentTarget)) return;
      this._goHomeAssistantDashboard();
    });
  }

  _bindMobileQuickActionButtons() {
    const bindButton = (id, handler) => {
      const btn = this.$(id);
      if (!btn || btn.dataset.homeiiQuickBound === "1") return;
      btn.dataset.homeiiQuickBound = "1";
      btn.addEventListener("click", handler);
    };
    bindButton("mobileLyricsBtn", (e) => {
      this._pressUiButton(e.currentTarget);
      if (this._openTabletLyricsScreensaver()) return;
      this._openLyricsModal();
    });
    bindButton("mobileLikeBtn", (e) => {
      this._pressUiButton(e.currentTarget);
      this._toggleLikeCurrentMedia(e.currentTarget);
    });
    bindButton("mobileQueueBtn", (e) => {
      if (!this._pressUiButton(e.currentTarget)) return;
      this._state.mobileQueueFlowQuickOpen = false;
      this._openMobileMenu("queue");
    });
    bindButton("mobileQueueFlowBtn", (e) => {
      if (!this._pressUiButton(e.currentTarget)) return;
      this._openMobileMenu("queue", { queueFlow: true });
    });
    bindButton("mobileQuickSearchBtn", (e) => {
      if (!this._pressUiButton(e.currentTarget)) return;
      this._openMobileMenu("quick_search");
    });
    bindButton("mobileRandomBtn", (e) => {
      if (!this._pressUiButton(e.currentTarget)) return;
      this._startQuickMix();
    });
    bindButton("mobileTimerBtn", (e) => {
      if (!this._pressUiButton(e.currentTarget)) return;
      this._openMobileMenu("sleep_timer");
    });
    bindButton("mobileInfoBtn", (e) => {
      if (!this._pressUiButton(e.currentTarget)) return;
      this._openSelectedPlayerMoreInfo();
    });
    bindButton("mobileVoiceAssistantBtn", (e) => {
      if (!this._pressUiButton(e.currentTarget, [8, 18, 8])) return;
      this._startVoiceAssistantCommand();
    });
    bindButton("mobileDisconnectAllBtn", (e) => {
      if (!this._pressUiButton(e.currentTarget, [12, 18])) return;
      this._openCleanAllConfirm();
    });
    this.shadowRoot?.querySelectorAll?.("[data-auxiliary-index]")?.forEach((btn) => {
      if (!btn || btn.dataset.homeiiQuickBound === "1") return;
      btn.dataset.homeiiQuickBound = "1";
      btn.addEventListener("click", async (e) => {
        if (!this._pressUiButton(e.currentTarget, [12, 18])) return;
        await this._runAuxiliaryButtonAction(Number(e.currentTarget.dataset.auxiliaryIndex || 0));
      });
    });
    bindButton("historyToggleFab", (e) => {
      if (!this._pressUiButton(e.currentTarget)) return;
      this._toggleHistoryDrawer();
    });
    this._bindMobileHomeQuickButton();
  }

  _goHomeAssistantDashboard() {
    if (this._homeShortcutNavigationSuppressed()) return;
    if (this._state.controlRoomOpen) return;
    const path = this._mobileHomeShortcutPath();
    const emitLocationChanged = () => {
      try { window.dispatchEvent(new Event("location-changed")); } catch (_) {}
      try { window.dispatchEvent(new CustomEvent("location-changed", { detail: { replace: false } })); } catch (_) {}
    };
    try {
      const targetUrl = new URL(path, window.location.origin);
      const nextPath = `${targetUrl.pathname}${targetUrl.search}${targetUrl.hash}`;
      const currentPath = `${window.location.pathname || ""}${window.location.search || ""}${window.location.hash || ""}`;
      if (targetUrl.origin === window.location.origin && nextPath !== currentPath) {
        window.history.pushState(null, "", nextPath);
        emitLocationChanged();
        return;
      }
    } catch (_) {
      // Fall through to full navigation.
    }
    try {
      window.location.assign(path);
    } catch (_) {
      try { window.location.href = path; } catch (_) {}
    }
  }

  _mobileMainBarItems() {
    if (this._isHotelMode()) return [];
    const hidePlayers = false;
    return HomeiiMobileSettingsFoundation.normalizeMobileMainBarItems(this._state.mobileMainBarItems, {
      usesVisualSettings: this._usesVisualSettings(),
      hidePlayers,
      fallbackItems: this._defaultMobileMainBarItems(),
    });
  }

  _mobileLibraryTabs() {
    return HomeiiMobileSettingsFoundation.normalizeMobileLibraryTabs(
      this._state.mobileLibraryTabs,
      this._defaultMobileLibraryTabs(),
    );
  }

  _mobileFooterMode() {
    return HomeiiMobileSettingsFoundation.normalizeMobileFooterMode(this._state.mobileFooterMode);
  }

  _mobileIconScale() {
    const scale = HomeiiMobileSettingsFoundation.clampMobileIconScale(this._state.mobileIconScale);
    this._state.mobileIconScale = scale;
    return scale;
  }

  _mobileMicMode() {
    return HomeiiMobileSettingsFoundation.normalizeMobileMicMode(this._state.mobileMicMode);
  }

  _pinnedPlayerPreferences() {
    const next = HomeiiMobileSettingsFoundation.normalizePinnedPlayerEntityList(this._state.pinnedPlayerEntities);
    this._state.pinnedPlayerEntities = next;
    return next;
  }

  _pinnedPlayerPreference() {
    return this._pinnedPlayerPreferences()[0] || "";
  }

  _excludedPlayerPreferences() {
    const next = HomeiiMobileSettingsFoundation.normalizePinnedPlayerEntityList(this._state.excludedPlayerEntities);
    this._state.excludedPlayerEntities = next;
    return next;
  }

  _isPlayerExcluded(playerOrEntityId = "") {
    const entityId = typeof playerOrEntityId === "string" ? playerOrEntityId : playerOrEntityId?.entity_id;
    return !!entityId && this._excludedPlayerPreferences().includes(entityId);
  }

  _playerSortMode() {
    const mode = HomeiiMobileSettingsFoundation.normalizePlayerSortMode(this._state.playerSortMode);
    this._state.playerSortMode = mode;
    return mode;
  }

  _playerOrderPreferences() {
    const next = HomeiiMobileSettingsFoundation.normalizePinnedPlayerEntityList(this._state.playerOrderEntities);
    this._state.playerOrderEntities = next;
    return next;
  }

  _playerDisplayName(player = null, players = this._state.players || []) {
    return HomeiiPlayersFoundation.playerDisplayName(player, { players });
  }

  _sortPlayerList(players = []) {
    const list = Array.isArray(players) ? players.slice() : [];
    const locale = this._state.lang === "he" || this._state.lang === "en" ? this._state.lang : undefined;
    const byName = (left, right) => this._playerDisplayName(left, list).localeCompare(this._playerDisplayName(right, list), locale, { sensitivity: "base", numeric: true });
    const mode = this._playerSortMode();
    if (mode === "alphabetical") return list.sort(byName);
    if (mode !== "custom") return list;
    const order = this._playerOrderPreferences();
    const orderIndex = new Map(order.map((entityId, index) => [entityId, index]));
    return list.sort((left, right) => {
      const leftIndex = orderIndex.has(left?.entity_id) ? orderIndex.get(left.entity_id) : Number.MAX_SAFE_INTEGER;
      const rightIndex = orderIndex.has(right?.entity_id) ? orderIndex.get(right.entity_id) : Number.MAX_SAFE_INTEGER;
      if (leftIndex !== rightIndex) return leftIndex - rightIndex;
      return byName(left, right);
    });
  }

  _pinnedPlayerOptionPlayers(extraPlayers = [], options = {}) {
    const includeExcluded = options?.includeExcluded === true;
    const byId = new Map();
    const configuredIds = new Set([
      ...this._pinnedPlayerPreferences(),
      ...this._excludedPlayerPreferences(),
      ...this._playerOrderPreferences(),
    ]);
    const isStrictMusicAssistantPlayer = (player) => {
      if (!player?.entity_id) return false;
      return this._isDirectMaPlayer(player)
        || HomeiiPlayersFoundation.isMusicAssistantPlayer(player, this._hass?.entities?.[player.entity_id]);
    };
    const add = (player) => {
      if (!player?.entity_id) return;
      if (!isStrictMusicAssistantPlayer(player) && !configuredIds.has(player.entity_id)) return;
      if (this._isLikelyBrowserPlayer(player) || this._isLocalSendspinPlayer(player)) return;
      if (!includeExcluded && this._isPlayerExcluded(player)) return;
      byId.set(player.entity_id, player);
    };
    Object.values(this._hass?.states || {}).forEach(add);
    (Array.isArray(extraPlayers) ? extraPlayers : []).forEach(add);
    (this._state.configurableMusicAssistantPlayers || []).forEach(add);
    (this._state.players || []).forEach(add);
    return this._sortPlayerList(Array.from(byId.values()));
  }

  _resolvedPinnedPlayerEntities(players = this._state.players || []) {
    const next = HomeiiPlayersFoundation.resolvePinnedPlayerEntities(this._pinnedPlayerPreferences(), players);
    this._state.pinnedPlayerEntities = next;
    return next;
  }

  _resolvedPinnedPlayerEntity(players = this._state.players || []) {
    return this._resolvedPinnedPlayerEntities(players)[0] || "";
  }

  _pinnedPlayerCount(players = this._state.players || []) {
    return this._resolvedPinnedPlayerEntities(players).length;
  }

  _hasPinnedPlayer() {
    return this._pinnedPlayerCount() > 0;
  }

  _isHotelMode() {
    return this._config?.hotel_mode === true || this._state.hotelMode === true;
  }

  _frontPinnedPlayerEntity(players = this._state.players || []) {
    const entityId = String(this._state.frontPinnedPlayerEntity || "").trim();
    if (!entityId) return "";
    const exists = (Array.isArray(players) ? players : []).some((player) => player?.entity_id === entityId);
    if (exists && !this._isPlayerExcluded(entityId)) return entityId;
    this._state.frontPinnedPlayerEntity = "";
    try { localStorage.removeItem(this._lsKey("homeii_music_flow_front_pinned_player")); } catch (_) {}
    return "";
  }

  _manualFrontPlayerEntity(players = this._state.players || []) {
    const entityId = String(this._state.manualFrontPlayerEntity || "").trim();
    const until = Number(this._state.manualFrontPlayerUntil || 0);
    if (!entityId || !until || until <= Date.now()) {
      const player = this._playerByEntityId(entityId);
      if (player?.state === "playing" && !this._isPlayerExcluded(entityId)) {
        this._setManualFrontPlayer(entityId, this._manualFrontDefaultHoldMs());
        return entityId;
      }
      this._state.manualFrontPlayerEntity = "";
      this._state.manualFrontPlayerUntil = 0;
      return "";
    }
    const exists = (Array.isArray(players) ? players : []).some((player) => player?.entity_id === entityId);
    if (exists && !this._isPlayerExcluded(entityId)) return entityId;
    this._state.manualFrontPlayerEntity = "";
    this._state.manualFrontPlayerUntil = 0;
    return "";
  }

  _manualFrontDefaultHoldMs() {
    return 5 * 60 * 1000;
  }

  _manualFrontContentHoldMs() {
    return 5 * 60 * 1000;
  }

  _isManualFrontContentSelectionPage(page = this._state?.menuPage || "") {
    const value = String(page || "").trim().toLowerCase();
    return value === "media_detail"
      || value === "discovery"
      || value === "quick_search"
      || value === "simple_wizard"
      || value.startsWith("library_");
  }

  _shouldHoldManualFrontForContentSelection() {
    if (!this._state?.menuOpen) return false;
    if (this._isManualFrontContentSelectionPage(this._state.menuPage)) return true;
    if (String(this._state.menuPage || "") !== "players") return false;
    const previousPage = Array.isArray(this._state.menuStack)
      ? this._state.menuStack[this._state.menuStack.length - 1]
      : "";
    return this._isManualFrontContentSelectionPage(previousPage);
  }

  _manualFrontHoldMsForSelection() {
    return this._shouldHoldManualFrontForContentSelection()
      ? this._manualFrontContentHoldMs()
      : this._manualFrontDefaultHoldMs();
  }

  _refreshManualFrontPlayerHold(durationMs = this._manualFrontHoldMsForSelection()) {
    const entityId = String(this._state.manualFrontPlayerEntity || "").trim();
    const until = Number(this._state.manualFrontPlayerUntil || 0);
    if (!entityId || until <= Date.now() || !this._playerByEntityId(entityId)) return false;
    this._setManualFrontPlayer(entityId, durationMs);
    return true;
  }

  _shortenManualFrontPlayerHold(durationMs = this._manualFrontDefaultHoldMs()) {
    const entityId = String(this._state.manualFrontPlayerEntity || "").trim();
    const until = Number(this._state.manualFrontPlayerUntil || 0);
    if (!entityId || until <= Date.now() || !this._playerByEntityId(entityId)) return false;
    const duration = Math.max(1000, Number(durationMs || this._manualFrontDefaultHoldMs()));
    if (until <= Date.now() + duration) return false;
    this._setManualFrontPlayer(entityId, duration);
    return true;
  }

  _setManualFrontPlayer(entityId = "", durationMs = 0) {
    const nextEntityId = String(entityId || "").trim();
    if (!nextEntityId) {
      this._clearManualFrontPlayer({ sync: false });
      return;
    }
    const duration = Math.max(1000, Number(durationMs || this._manualFrontDefaultHoldMs()));
    this._state.manualFrontPlayerEntity = nextEntityId;
    this._state.manualFrontPlayerUntil = Date.now() + duration;
    this._manualFrontLocationKey = this._currentWindowLocationKey();
    this._startManualFrontRouteTracking();
    clearTimeout(this._manualFrontPlayerTimer);
    const scheduledEntityId = nextEntityId;
    this._manualFrontPlayerTimer = setTimeout(() => {
      if (String(this._state.manualFrontPlayerEntity || "") !== scheduledEntityId) return;
      if (Number(this._state.manualFrontPlayerUntil || 0) > Date.now()) return;
      const scheduledPlayer = this._playerByEntityId(scheduledEntityId);
      if (scheduledPlayer?.state === "playing") {
        this._setManualFrontPlayer(scheduledEntityId, this._manualFrontDefaultHoldMs());
        return;
      }
      if (this._shouldHoldManualFrontForContentSelection() && this._playerByEntityId(scheduledEntityId)) {
        this._setManualFrontPlayer(scheduledEntityId, this._manualFrontContentHoldMs());
        return;
      }
      this._clearManualFrontPlayer();
    }, duration + 80);
  }

  _clearManualFrontPlayer(options = {}) {
    const hadManualFront = !!(this._state.manualFrontPlayerEntity || this._state.manualFrontPlayerUntil);
    clearTimeout(this._manualFrontPlayerTimer);
    this._manualFrontPlayerTimer = null;
    this._state.manualFrontPlayerEntity = "";
    this._state.manualFrontPlayerUntil = 0;
    this._manualFrontLocationKey = "";
    this._stopManualFrontRouteTracking();
    if (!hadManualFront || options.sync === false) return;
    this._loadPlayers();
    this._syncNowPlayingUI();
    this._renderPlayerSummary();
    if (this._state.menuOpen && this._state.menuPage === "players") this._renderMobileMenu().catch(() => {});
  }

  _currentWindowLocationKey() {
    try {
      return `${window.location?.pathname || "/"}${window.location?.search || ""}${window.location?.hash || ""}`;
    } catch {
      return "/";
    }
  }

  _startManualFrontRouteTracking() {
    if (this._manualFrontRouteListening || typeof window === "undefined" || typeof window.addEventListener !== "function") return;
    window.addEventListener("location-changed", this._boundManualFrontRouteChange);
    window.addEventListener("popstate", this._boundManualFrontRouteChange);
    this._manualFrontRouteListening = true;
  }

  _stopManualFrontRouteTracking() {
    if (!this._manualFrontRouteListening || typeof window === "undefined" || typeof window.removeEventListener !== "function") return;
    window.removeEventListener("location-changed", this._boundManualFrontRouteChange);
    window.removeEventListener("popstate", this._boundManualFrontRouteChange);
    this._manualFrontRouteListening = false;
  }

  _handleManualFrontRouteChange() {
    if (!this._state?.manualFrontPlayerEntity || !this._manualFrontLocationKey) return;
    if (this._currentWindowLocationKey() !== this._manualFrontLocationKey) this._clearManualFrontPlayer();
  }

  _setFrontPinnedPlayer(entityId = "") {
    const nextEntityId = String(entityId || "").trim();
    this._state.frontPinnedPlayerEntity = nextEntityId;
    try {
      if (nextEntityId) localStorage.setItem(this._lsKey("homeii_music_flow_front_pinned_player"), nextEntityId);
      else localStorage.removeItem(this._lsKey("homeii_music_flow_front_pinned_player"));
    } catch (_) {}
  }

  _toggleFrontPinnedPlayer(entityId = "") {
    const target = String(entityId || "").trim();
    if (!target) return;
    const next = this._frontPinnedPlayerEntity() === target ? "" : target;
    this._setFrontPinnedPlayer(next);
    if (next) this._selectPlayer(next, true);
    this._loadPlayers();
    this._syncNowPlayingUI();
    this._toast(next ? this._m("Player pinned to front", "הנגן ננעץ בחזית") : this._m("Front pin cleared", "הנעיצה בחזית בוטלה"));
  }

  _mobileVolumeMode() {
    return HomeiiMobileSettingsFoundation.normalizeMobileVolumeMode(this._state.mobileVolumeMode);
  }

  _mobileVolumeStepButtonsEnabled() {
    return this._state.mobileVolumeStepButtonsEnabled === true;
  }

  _mobileVolumeStepPercent() {
    const step = HomeiiMobileSettingsFoundation.clampMobileVolumeStepPercent(this._state.mobileVolumeStepPercent);
    this._state.mobileVolumeStepPercent = step;
    return step;
  }

  _mobileRadioSourceMode() {
    const mode = HomeiiMobileSettingsFoundation.normalizeMobileRadioSourceMode(this._state.mobileRadioSourceMode || this._config?.mobile_radio_source_mode);
    this._state.mobileRadioSourceMode = mode;
    return mode;
  }

  _entityMatchTokens(value = "") {
    return HomeiiPlayersFoundation.entityMatchTokens(value);
  }

  _favoriteButtonEntityForPlayer(player = null) {
    if (this._homeiiEngineRequired?.() !== false) return "";
    return HomeiiPlayersFoundation.favoriteButtonEntityForPlayer({
      player: player || this._getSelectedPlayer(),
      hassStates: this._hass?.states || {},
      explicitEntity: "",
      fallbackEntity: "button.bathroom_favorite_current_song_2",
    });
  }

  _favoriteButtonDeviceId(entityId = "") {
    if (this._homeiiEngineRequired?.() !== false) return "";
    return HomeiiPlayersFoundation.favoriteButtonDeviceId(entityId, this._hass?.entities || {});
  }

  _favoriteButtonEntity() {
    return this._favoriteButtonEntityForPlayer(this._getSelectedPlayer());
  }

  _entryTargetsCurrentMedia(entry = {}) {
    const favoriteScope = String(
      entry?.favorite_scope
      || entry?.favoriteScope
      || entry?.favorite_target
      || entry?.favoriteTarget
      || entry?.source_context
      || entry?.sourceContext
      || "",
    ).trim().toLowerCase();
    if (
      entry?.targets_current_media === false
      || ["item", "library", "search", "radio", "media", "local", "browser", "radio_browser", "external_radio"].includes(favoriteScope)
    ) {
      return false;
    }
    return HomeiiMediaQueueFoundation.entryTargetsCurrentMedia(
      entry,
      this._currentMediaLikeMeta(),
      (uriA, uriB, fallbackType) => this._mediaRefsEquivalent(uriA, uriB, fallbackType),
    );
  }

  async _pressFavoriteButtonEntity(entityId = "") {
    return false;
  }

  async _unfavoriteCurrentViaMassQueue() {
    return false;
  }

  async _refreshFavoriteState(force = true) {
    this._cache.library.delete("liked:ma");
    await Promise.allSettled([
      this._loadMaLikedEntries(force),
      this._ensureQueueSnapshot(force),
    ]);
    const override = this._state.currentMediaFavoriteOverride || null;
    if (override) {
      const currentUri = String(this._getCurrentMediaUri() || "").trim();
      const queueFavorite = this._state.maQueueState?.current_item?.media_item?.favorite;
      if (!currentUri || currentUri !== override.uri || Date.now() - Number(override.ts || 0) > 8000) {
        this._clearCurrentMediaFavoriteOverride();
      } else if (typeof queueFavorite === "boolean" && queueFavorite === !!override.liked) {
        this._clearCurrentMediaFavoriteOverride();
      }
    }
    this._syncNowPlayingUI();
    this._syncLikeButtons();
    if (this._state.menuOpen && this._state.menuPage === "library_liked") {
      this._renderMobileMenu().catch(() => {});
    }
  }

  _scheduleFavoriteReconcile(delay = 700) {
    window.clearTimeout(this._favoriteReconcileTimer);
    this._favoriteReconcileTimer = window.setTimeout(() => {
      this._favoriteReconcileTimer = null;
      this._refreshFavoriteState(true).catch(() => {});
    }, Math.max(0, Number(delay) || 0));
  }

  async _waitForFavoriteState(entry = {}, expected = true, delays = [500, 1500, 3200]) {
    for (const delay of delays) {
      await new Promise((resolve) => window.setTimeout(resolve, delay));
      await this._refreshFavoriteState(true);
      if (!!this._isEntryLiked(entry) === !!expected) return true;
    }
    return !!this._isEntryLiked(entry) === !!expected;
  }

  _useMaLikedMode() {
    return true;
  }

  _mobileSwipeMode() {
    if (immersivePlayerEnabled(this) && !this._isCompactTileMode()) return "browse";
    return String(this._state.mobileSwipeMode || "play") === "browse" ? "browse" : "play";
  }

  _mobileQueueFlowEnabled() {
    const quickActions = Array.isArray(this._state?.mobileQuickActions) ? this._state.mobileQuickActions : [];
    return quickActions.includes("queue_flow");
  }

  _mobileQueueFlowMenuActive() {
    return this._mobileQueueFlowEnabled() && this._state?.mobileQueueFlowQuickOpen === true;
  }

  _queueFlowLabel() {
    return this._m("Queue wheel", "גלגל תור");
  }

  _libraryFlowLabel(short = false) {
    return short ? this._m("Wheel", "גלגל") : this._m("Library wheel", "גלגל ספריה");
  }

  _artistAlbumFlowLabel(short = false) {
    return short ? this._m("Album wheel", "גלגל אלבומים") : this._m("Artist album wheel", "גלגל אלבומי אמן");
  }

  _libraryFlowPageActive(page = this._state?.menuPage || "") {
    const current = String(page || "").trim();
    return !!current && String(this._state?.mobileLibraryFlowPage || "") === current;
  }

  _mobileCoverFlowEnabled() {
    if (immersivePlayerEnabled(this) && !this._isCompactTileMode()) return false;
    if (!this._usesVisualSettings()) return this._state?.mobileCoverFlow === true;
    return this._state?.mobileCoverFlow === true || this._config?.mobile_cover_flow === true;
  }

  _mobileBrowsePreviewActive(stack = null) {
    return (this._mobileSwipeMode() === "browse" || this._mobileCoverFlowEnabled()) && Number(stack?.offset || 0) !== 0;
  }

  _activePlayingPlayers() {
    return (this._state.players || []).filter((p) => p?.state === "playing");
  }

  _activePlaybackPlayers() {
    return [
      ...(Array.isArray(this._state.players) ? this._state.players : []),
      ...(Array.isArray(this._directMaPlayers) ? this._directMaPlayers : []),
    ].filter((player) => {
      const state = String(player?.state || "").toLowerCase();
      return state === "playing" || state === "paused" || state === "buffering";
    });
  }

  _isStopClearTarget(entityId, groupedIds = []) {
    const targetId = String(entityId || "").trim();
    if (!targetId) return false;
    const player = this._playerByEntityId(targetId);
    if (!player) return false;
    if (this._isLocalSendspinPlayer(player)) return false;
    if (this._isExternalBrowserPlayer(player)) return false;
    const state = String(player.state || "").toLowerCase();
    if (state === "unavailable" || state === "unknown" || state === "off") return false;
    if (this._isDirectMaPlayer(player)) return true;
    if (groupedIds.includes(targetId)) return true;
    return true;
  }

  _clearLocalPlaybackStateForPlayers(entityIds = []) {
    const ids = new Set((Array.isArray(entityIds) ? entityIds : [])
      .map((id) => String(id || "").trim())
      .filter(Boolean));
    if (!ids.size) return;
    const mediaKeys = [
      "media_content_id",
      "media_content_type",
      "media_title",
      "media_artist",
      "media_album_name",
      "media_album_artist",
      "media_duration",
      "media_position",
      "media_position_updated_at",
      "media_image",
      "media_image_url",
      "entity_picture",
      "entity_picture_local",
      "active_queue",
      "active_queue_items",
    ];
    const cleanPlayer = (player) => {
      if (!player?.entity_id || !ids.has(player.entity_id)) return player;
      const attrs = { ...(player.attributes || {}) };
      mediaKeys.forEach((key) => { delete attrs[key]; });
      return { ...player, state: "idle", attributes: attrs };
    };
    if (Array.isArray(this._state.players)) this._state.players = this._state.players.map(cleanPlayer);
    if (Array.isArray(this._directMaPlayers)) this._directMaPlayers = this._directMaPlayers.map(cleanPlayer);
    if (ids.has(this._state.selectedPlayer)) {
      this._state.maQueueState = null;
      this._state.queueItems = [];
      this._state.forceRadioHero = false;
      this._state.mobileDynamicThemeArtwork = "";
      this._state.mobileDynamicThemeArtworkUrl = "";
    }
  }

  _announcementEligiblePlayers() {
    return HomeiiPlayersFoundation.announcementEligiblePlayers(this._state.players || []);
  }

  _announcementTargetValue() {
    const raw = String(this._state.mobileAnnouncementTarget || "").trim();
    if (raw === "all") return "all";
    const eligible = this._announcementEligiblePlayers();
    if (eligible.some((player) => player.entity_id === raw)) return raw;
    return this._state.selectedPlayer || eligible[0]?.entity_id || "";
  }

  _announcementVolumePct() {
    const raw = Number(this._state.mobileAnnouncementVolume ?? this._config?.mobile_announcement_volume ?? 20);
    return Number.isFinite(raw) ? Math.max(20, Math.min(50, raw)) : 20;
  }

  _mobileNavigableActivePlayers() {
    return HomeiiPlayersFoundation.mobileNavigableActivePlayers(
      this._state.players || [],
      this._resolvedPinnedPlayerEntities(),
      (player) => this._isPlayerActive(player),
    );
  }

  _syncMobilePlayerNavButtons() {
    const enabled = this._mobileNavigableActivePlayers().length > 1;
    ["activePlayerPrevBtn", "activePlayerNextBtn"].forEach((id) => {
      const btn = this.$(id);
      if (!btn) return;
      btn.disabled = !enabled;
      btn.setAttribute("aria-disabled", enabled ? "false" : "true");
    });
  }

  _setMobileRandomFabDisabled(disabled) {
    const btn = this.$("mobileRandomBtn");
    if (!btn) return;
    btn.disabled = !!disabled;
    btn.classList.toggle("disabled", !!disabled);
    btn.setAttribute("aria-disabled", disabled ? "true" : "false");
  }

  _setMobileRandomFabVisible(visible) {
    const btn = this.$("mobileRandomBtn");
    if (!btn) return;
    btn.hidden = !visible;
    btn.classList.toggle("hidden", !visible);
  }

  _mobileQuickActionOptions() {
    return [
      { value: "home", icon: "home", label: this._i18n("ui.home") },
      { value: "search", icon: "search", label: this._i18n("ui.search") },
      { value: "timer", icon: "timer", label: this._i18n("ui.timer") },
      { value: "like", icon: "heart_outline", label: this._i18n("ui.liked") },
      { value: "lyrics", icon: "lyrics", label: this._i18n("ui.lyrics") },
      { value: "queue", icon: "queue", label: this._i18n("ui.queue_2") },
      { value: "queue_flow", icon: "queue_flow", label: this._queueFlowLabel() },
      { value: "radio", icon: "radio", label: this._i18n("ui.quick_mix") },
      { value: "voice", icon: "mic", label: this._flowAssistantLabel() },
      { value: "history", icon: "history", label: this._i18n("ui.history") },
      { value: "info", icon: "info", label: this._i18n("ui.info") },
      { value: "disconnect_all", icon: "close", label: this._cleanAllLabel(), tone: "danger" },
    ];
  }

  _mobileQuickActionButtonHtml(action = "", historyToggleButtonHtml = "") {
    const auxiliaryMatch = /^auxiliary:(\d+)$/.exec(String(action || ""));
    if (auxiliaryMatch) {
      const index = Math.max(0, Number(auxiliaryMatch[1]) || 0);
      const button = this._auxiliaryButtonConfigs()[index];
      if (!button?.enabled) return "";
      const label = String(button.name || "").trim() || this._i18n("ui.auxiliary_button");
      const icon = HomeiiMobileSettingsFoundation.normalizeAuxiliaryButtonIcon(button.icon || "power");
      return `<button class="mobile-art-fab power-fab auxiliary-fab" data-auxiliary-index="${this._esc(index)}" title="${this._esc(label)}" aria-label="${this._esc(label)}">${this._iconSvg(icon)}</button>`;
    }
    switch (action) {
      case "timer": {
        const label = this._sleepTimerFooterLabel();
        const active = !!label && this._sleepTimerChipVisible();
        return `
          <button class="mobile-art-fab mobile-timer-fab ${active ? "active" : ""}" id="mobileTimerBtn" title="${this._esc(this._i18n("ui.schedules"))}">
            ${this._iconSvg("timer")}
            <span class="mobile-timer-label" ${active ? "" : "hidden"}>${this._esc(active ? label : "")}</span>
          </button>
        `;
      }
      case "home":
        return `<button class="mobile-art-fab" id="mobileHomeQuickBtn" title="${this._i18n("ui.home")}">${this._iconSvg("home")}</button>`;
      case "search":
        return `<button class="mobile-art-fab" id="mobileQuickSearchBtn" title="${this._i18n("ui.search")}" aria-label="${this._i18n("ui.search")}">${this._iconSvg("search")}</button>`;
      case "like":
        return `<button class="mobile-art-fab" id="mobileLikeBtn" title="${this._i18n("ui.like")}">${this._iconSvg(this._currentMediaFavoriteState() ? "heart_filled" : "heart_outline")}</button>`;
      case "lyrics":
        return `<button class="mobile-art-fab" id="mobileLyricsBtn" title="${this._i18n("ui.lyrics")}">${this._iconSvg("lyrics")}</button>`;
      case "queue":
        return `<button class="mobile-art-fab" id="mobileQueueBtn" title="${this._i18n("ui.open_queue")}">${this._iconSvg("queue")}</button>`;
      case "queue_flow":
        return `<button class="mobile-art-fab queue-flow-fab" id="mobileQueueFlowBtn" title="${this._esc(this._queueFlowLabel())}" aria-label="${this._esc(this._queueFlowLabel())}">${this._iconSvg("queue_flow")}</button>`;
      case "radio":
        return `<button class="mobile-art-fab" id="mobileRandomBtn" title="${this._i18n("ui.quick_mix")}">${this._iconSvg("radio")}</button>`;
      case "voice":
        return `<button class="mobile-art-fab voice-assistant-fab ${this._state.voiceAssistantListening ? "listening" : ""}" id="mobileVoiceAssistantBtn" title="${this._esc(this._flowAssistantLabel())}" aria-label="${this._esc(this._flowAssistantLabel())}">${this._iconSvg("mic")}</button>`;
      case "history":
        return historyToggleButtonHtml || `<button class="mobile-art-fab history-toggle-fab empty-history-fab" id="historyToggleFab" title="${this._i18n("ui.recently_played_2")}" aria-expanded="false">${this._iconSvg("history")}</button>`;
      case "info":
        return `<button class="mobile-art-fab" id="mobileInfoBtn" title="${this._i18n("ui.more_info")}">${this._iconSvg("info")}</button>`;
      case "disconnect_all":
        return `<button class="mobile-art-fab danger-fab" id="mobileDisconnectAllBtn" title="${this._esc(this._cleanAllLabel())}" aria-label="${this._esc(this._cleanAllLabel())}">${this._iconSvg("close")}</button>`;
      case "power":
        return this._mobileQuickActionButtonHtml("auxiliary:0", historyToggleButtonHtml);
      default:
        return "";
    }
  }

  _mobileActionsWithAuxiliary(actions = []) {
    if (this._isHotelMode()) return (Array.isArray(actions) ? actions : []).filter((action) => action === "search");
    const next = Array.isArray(actions) ? actions.slice() : [];
    this._enabledAuxiliaryButtons().forEach((button) => {
      const id = `auxiliary:${button.index}`;
      if (!next.includes(id)) next.push(id);
    });
    return next;
  }

  _mobileVisibleQuickActions(actions = this._mobileQuickActions(), player = this._getSelectedPlayer()) {
    if (this._isHotelMode()) return ["search"];
    const blocked = this._isLocalSendspinPlayer(player) ? new Set(["like", "radio"]) : null;
    return (Array.isArray(actions) ? actions : this._mobileQuickActions())
      .filter((action) => action !== "voice" || this._voiceAssistantEnabled())
      .filter((action) => action !== "queue_flow" || this._mobileQueueFlowEnabled())
      .filter((action) => !blocked?.has(action));
  }

  _mobileEmptyVisibleQuickActions(actions = this._mobileQuickActions(), player = this._getSelectedPlayer()) {
    const relevant = new Set(["home", "search", "timer", "queue_flow", "radio", "voice", "history"]);
    if (this._activePlayingPlayers().length) relevant.add("disconnect_all");
    return this._mobileVisibleQuickActions(actions, player)
      .filter((action) => relevant.has(action));
  }

  _mobileQuickActionButtonsHtml(historyToggleButtonHtml = "", actions = this._mobileQuickActions()) {
    return this._mobileVisibleQuickActions(actions)
      .map((action) => this._mobileQuickActionButtonHtml(action, historyToggleButtonHtml))
      .filter(Boolean)
      .join("");
  }

  _activeQuickActionRowState() {
    const layoutMode = this._layoutModeConfig();
    const actions = this._mobileActionsWithAuxiliary(
      this._mobileVisibleQuickActions(this._mobileQuickActions()),
    );
    const rowActions = layoutMode === "tablet"
      ? actions.filter((action) => action !== "history" && action !== "timer")
      : actions;
    const historyEdgeClass = this._isHebrew() ? "left-edge" : "right-edge";
    const historyToggleButtonHtml = layoutMode !== "tablet" && actions.includes("history")
      ? `<button class="history-toggle-fab ${historyEdgeClass}" id="historyToggleFab" title="${this._i18n("ui.recently_played_2")}" aria-expanded="false" hidden>${this._iconSvg("history")}</button>`
      : "";
    return { layoutMode, actions, rowActions, historyToggleButtonHtml };
  }

  _syncActiveQuickActionRow(options = {}) {
    if (this._isCompactTileMode()) return;
    const host = this.$("mobileArtActions");
    if (!host) return;
    const { layoutMode, rowActions, historyToggleButtonHtml } = this._activeQuickActionRowState();
    const signature = [
      layoutMode,
      rowActions.join(","),
      historyToggleButtonHtml ? "history-inline" : "history-floating",
      this._enabledAuxiliaryButtons().map((button) => `${button.index}:${button.icon}:${button.name}`).join("|"),
      this._voiceAssistantEnabled() ? "voice-on" : "voice-off",
    ].join(";");
    const needsRefresh = options.force === true
      || host.dataset.homeiiActionSignature !== signature
      || host.classList.contains("empty-quick-actions")
      || host.querySelector?.(".empty-history-fab");
    if (!needsRefresh) {
      host.removeAttribute("hidden");
      return;
    }
    const html = this._mobileQuickActionButtonsHtml(historyToggleButtonHtml, rowActions);
    host.className = `mobile-art-actions count-${Math.max(1, rowActions.length)}`;
    host.dataset.homeiiActionSignature = signature;
    host.innerHTML = html;
    if (html) host.removeAttribute("hidden");
    else host.setAttribute("hidden", "");
    this._bindMobileQuickActionButtons();
  }

  _pressUiButton(btn, pattern = [6]) {
    if (!btn || btn.disabled) return false;
    this._hapticTap(pattern);
    btn.classList.remove("pressed");
    void btn.offsetWidth;
    btn.classList.add("pressed");
    clearTimeout(btn._pressUiTimer);
    btn._pressUiTimer = setTimeout(() => btn.classList.remove("pressed"), 180);
    return true;
  }

  _libraryInteractionTarget(target = null) {
    const selector = [
      ".media-entry",
      ".discovery-orb",
      ".library-nav-btn",
      ".media-layout-btn",
      ".media-detail-play-btn",
      ".media-detail-action-btn",
      ".media-detail-nav-btn",
      ".artist-hero-icon-btn",
      ".radio-stage-fab",
      ".library-tab-search-submit",
      ".library-tab-search-clear",
      ".radio-country-entry",
      ".media-category-row",
      ".media-detail-hero",
      ".library-player-focus",
    ].join(",");
    const el = target?.closest?.(selector) || target;
    return el?.classList ? el : null;
  }

  _showLibraryInteractionFeedback(target = null, options = {}) {
    const el = this._libraryInteractionTarget(target);
    if (!el) return null;
    const loading = options.loading === true;
    if (options.press !== false) this._flashInteraction(el);
    el.classList.add("library-action-feedback");
    clearTimeout(el._homeiiLibraryFeedbackTimer);
    el._homeiiLibraryFeedbackTimer = setTimeout(() => {
      el?.classList?.remove("library-action-feedback");
    }, Math.max(140, Number(options.pressMs || 220) || 220));
    if (loading) {
      el.classList.add("library-action-loading");
      el.dataset.homeiiLibraryActionBusy = "1";
      el.setAttribute("aria-busy", "true");
      clearTimeout(el._homeiiLibraryLoadingTimer);
      const loadingMs = Math.max(0, Number(options.loadingMs || 0) || 0);
      if (loadingMs && options.hold !== true) {
        el._homeiiLibraryLoadingTimer = setTimeout(() => this._clearLibraryInteractionFeedback(el), loadingMs);
      }
    }
    return el;
  }

  _clearLibraryInteractionFeedback(target = null) {
    const el = this._libraryInteractionTarget(target);
    if (!el) return;
    clearTimeout(el._homeiiLibraryFeedbackTimer);
    clearTimeout(el._homeiiLibraryLoadingTimer);
    el._homeiiLibraryFeedbackTimer = null;
    el._homeiiLibraryLoadingTimer = null;
    el.classList.remove("library-action-feedback", "library-action-loading");
    if (el.dataset?.homeiiLibraryActionBusy === "1") {
      delete el.dataset.homeiiLibraryActionBusy;
      el.removeAttribute("aria-busy");
    }
  }

  _lockUiButton(btn, pattern = [6], options = {}) {
    if (!btn || btn.disabled || btn.dataset.homeiiActionLocked === "1") return false;
    const lockMs = Math.max(350, Number(options.lockMs || 900) || 900);
    if (!this._pressUiButton(btn, pattern)) return false;
    btn.dataset.homeiiActionLocked = "1";
    btn.disabled = options.disabled !== false;
    btn.classList.add("busy");
    btn.setAttribute("aria-busy", "true");
    clearTimeout(btn._homeiiActionLockTimer);
    btn._homeiiActionLockTimer = setTimeout(() => this._unlockUiButton(btn), lockMs);
    return true;
  }

  _unlockUiButton(btn) {
    if (!btn) return;
    clearTimeout(btn._homeiiActionLockTimer);
    btn._homeiiActionLockTimer = null;
    delete btn.dataset.homeiiActionLocked;
    btn.disabled = false;
    btn.classList.remove("busy");
    btn.removeAttribute("aria-busy");
  }

  async _runLockedUiAction(btn, action, options = {}) {
    if (!this._lockUiButton(btn, options.pattern || [6], options)) return null;
    try {
      return await action();
    } finally {
      if (options.hold !== true) this._unlockUiButton(btn);
    }
  }

  async _runMenuButtonLoading(btn, loadingText, action, options = {}) {
    if (!btn || btn.disabled || btn.dataset.homeiiActionLocked === "1") return false;
    const originalHtml = btn.innerHTML;
    const loadingKind = String(options.kind || "").trim();
    btn.dataset.homeiiActionLocked = "1";
    btn.disabled = true;
    btn.classList.add("busy");
    if (loadingKind) btn.classList.add(`busy-${loadingKind}`);
    btn.setAttribute("aria-busy", "true");
    btn.innerHTML = `<span>${this._esc(loadingText || this._i18n("ui.loading"))}</span>`;
    try {
      return await action();
    } finally {
      btn.innerHTML = originalHtml;
      btn.disabled = false;
      btn.classList.remove("busy");
      if (loadingKind) btn.classList.remove(`busy-${loadingKind}`);
      btn.removeAttribute("aria-busy");
      delete btn.dataset.homeiiActionLocked;
    }
  }

  _showEmptyMagicRipple(sourceEl = null) {
    const card = this.shadowRoot?.querySelector?.(".card.empty-media");
    if (!card) return;
    const rect = card.getBoundingClientRect?.();
    const sourceRect = sourceEl?.getBoundingClientRect?.();
    if (!rect) return;
    const x = sourceRect
      ? sourceRect.left + (sourceRect.width / 2) - rect.left
      : rect.width / 2;
    const y = sourceRect
      ? sourceRect.top + (sourceRect.height / 2) - rect.top
      : rect.height / 2;
    const ripple = document.createElement("span");
    ripple.className = "empty-magic-screen-ripple";
    ripple.style.setProperty("--empty-ripple-x", `${Math.round(x)}px`);
    ripple.style.setProperty("--empty-ripple-y", `${Math.round(y)}px`);
    card.appendChild(ripple);
    setTimeout(() => ripple.remove(), 1100);
  }

  _showEmptyPlaybackLoading(sourceEl = null) {
    const card = this.shadowRoot?.querySelector?.(".card.empty-media");
    if (!card) return;
    this._hideEmptyPlaybackLoading();
    const rect = card.getBoundingClientRect?.();
    const sourceRect = sourceEl?.getBoundingClientRect?.();
    const loader = document.createElement("span");
    loader.className = "empty-playback-loader";
    if (rect && sourceRect) {
      loader.style.setProperty("--empty-loader-x", `${Math.round(sourceRect.left + (sourceRect.width / 2) - rect.left)}px`);
      loader.style.setProperty("--empty-loader-y", `${Math.round(sourceRect.top + (sourceRect.height / 2) - rect.top)}px`);
    }
    loader.innerHTML = `<span></span><span></span><span></span>`;
    card.appendChild(loader);
    clearTimeout(this._emptyPlaybackLoaderTimer);
    this._emptyPlaybackLoaderTimer = setTimeout(() => this._hideEmptyPlaybackLoading(), 6500);
  }

  _hideEmptyPlaybackLoading() {
    clearTimeout(this._emptyPlaybackLoaderTimer);
    this._emptyPlaybackLoaderTimer = null;
    this.shadowRoot?.querySelectorAll?.(".empty-playback-loader")?.forEach((loader) => loader.remove());
  }

  _cycleActivePlayer(step = 1) {
    const players = this._mobileNavigableActivePlayers();
    if (players.length < 2) {
      this._syncMobilePlayerNavButtons();
      return;
    }
    const currentId = this._state.selectedPlayer;
    const currentIndex = players.findIndex((player) => player.entity_id === currentId);
    const baseIndex = currentIndex >= 0 ? currentIndex : 0;
    const nextIndex = (baseIndex + step + players.length) % players.length;
    this._selectPlayer(players[nextIndex]?.entity_id, true);
  }

  _playerGroupMemberIds(player) {
    return HomeiiPlayersFoundation.playerGroupMemberIds(player);
  }

  _playerGroupCount(player) {
    return HomeiiPlayersFoundation.playerGroupCount(player);
  }

  _playerGroupMemberNames(player) {
    return HomeiiPlayersFoundation.playerGroupMemberNames(player, this._state.players || []);
  }

  _isStaticGroupPlayer(player) {
    return HomeiiPlayersFoundation.isStaticGroupPlayer(player);
  }

  _groupAverageVolume(player) {
    return HomeiiPlayersFoundation.groupAverageVolume(player, this._state.players || []);
  }

  _groupedPlayerIds() {
    return HomeiiPlayersFoundation.groupedPlayerIds(this._state.players || []);
  }

  async _disconnectPlayerGroups(options = {}) {
    const ids = this._groupedPlayerIds();
    if (!ids.length) {
      if (!options.silent) this._toastSuccess(this._i18n("ui.no_player_groups_to_disconnect"));
      return { ok: true, count: 0, failed: false };
    }
    const dynamicIds = ids.filter((id) => {
      const target = (this._state.players || []).find((p) => p.entity_id === id) || this._hass?.states?.[id];
      return target && !this._isStaticGroupPlayer(target) && !this._isLocalSendspinPlayer(target);
    });
    if (!dynamicIds.length) {
      if (!options.silent) this._toastSuccess(this._i18n("ui.no_dynamic_player_groups_to_disconnect"));
      return { ok: true, count: 0, failed: false };
    }
    const results = await Promise.allSettled(dynamicIds.map((id) => this._callHaMediaPlayerService(id, "unjoin")));
    const succeeded = results.filter((result) => result.status === "fulfilled").length;
    const failed = succeeded === 0;
    setTimeout(() => {
      this._loadPlayers();
      this._refreshGroupingState();
      if (this._state.menuOpen) this._renderMobileMenu();
    }, 550);
    if (!options.silent) {
      (failed ? this._toastError : this._toastSuccess).call(this, failed
        ? this._i18n("ui.player_groups_could_not_be_disconnected")
        : this._i18n("ui.all_player_groups_disconnected"));
    }
    return { ok: !failed, count: dynamicIds.length, failed };
  }

  async _stopAllPlayers() {
    const activePlayers = this._activePlaybackPlayers();
    const groupedIds = this._groupedPlayerIds();
    const knownPlayers = [
      ...(Array.isArray(this._state.players) ? this._state.players : []),
      ...(Array.isArray(this._directMaPlayers) ? this._directMaPlayers : []),
      ...activePlayers,
    ];
    const targetIds = [...new Set([
      ...knownPlayers.map((player) => player?.entity_id).filter(Boolean),
      ...groupedIds,
      this._state.selectedPlayer,
    ].filter(Boolean))].filter((entityId) => this._isStopClearTarget(entityId, groupedIds));
    const hasLocalSendspin = this._isLocalSendspinDesired() || this._localSendspinConnected || this._localSendspinConnecting || !!this._localSendspinPlayer || !!this._localSendspinSocket;
    if (!targetIds.length && !hasLocalSendspin) {
      this._toastError(this._i18n("ui.no_active_players"));
      return;
    }
    this._hapticTap([18, 24, 18]);
    const groupResult = await this._disconnectPlayerGroups({ silent: true });
    if (groupResult.ok) groupedIds.forEach((entityId) => this._clearLocalGroupState(entityId));
    const results = await Promise.allSettled(targetIds.map(async (entityId) => {
      const errors = [];
      try { await this._stopPlayer(entityId); } catch (error) { errors.push(error); }
      try { await this._clearQueueForPlayer(entityId); } catch (error) { errors.push(error); }
      if (errors.length) throw errors[0];
    }));
    const locallyClearedIds = targetIds.filter((entityId, index) => results[index]?.status === "fulfilled");
    this._clearLocalPlaybackStateForPlayers(locallyClearedIds);
    if (hasLocalSendspin) {
      this._adoptLocalSendspinGlobalSession();
      const selectedPlayer = this._getSelectedPlayer();
      if (this._isLocalSendspinPlayer(selectedPlayer)) {
        this._state.selectedPlayer = null;
        this._state.hasAutoSelectedPlayer = false;
      }
      this._state.localSendspinDisconnecting = true;
      this._setLocalSendspinDesired(false);
      this._rememberThisDevicePlayer("");
      this._state.awaitingThisDevicePlayer = false;
      this._state.controlRoomRevealThisDevicePending = false;
      this._state.knownBrowserPlayerIds = [];
      this._directMaPlayers = [];
      this._stopLocalSendspinPlayer("stop_all");
      this._state.localSendspinDisconnecting = false;
      this._state.localSendspinStatus = "disconnected";
      this._syncLocalSendspinGlobalSession();
    }
    const failed = results.some((result) => result.status === "rejected") || groupResult.failed;
    (failed ? this._toastError : this._toastSuccess).call(this, failed
      ? this._i18n("ui.some_players_could_not_be_stopped_or_cleared")
      : this._i18n("ui.stopped_all_players_cleared_playlists_and_disconnected_groups"));
    this._syncNowPlayingUI();
    if (this._state.menuOpen) this._renderMobileMenu();
    if (this._state.controlRoomOpen) this._syncControlRoomUi({ force: true });
    setTimeout(() => this._updateNowPlayingState(), 500);
  }

  async _ungroupAllPlayers() {
    this._hapticTap([14, 18, 14]);
    await this._disconnectPlayerGroups();
  }

  _menuPageIcon(page) {
    const map = {
      main: "menu",
      discovery: "compass",
      settings: "settings",
      diagnostics: "info",
      queue: "queue",
      queue_settings: "settings",
      players: "speaker",
      players_active: "stats",
      transfer: "queue_transfer",
      group: "speaker_group",
      ungroup_all: "speaker",
      stop_all: "stop",
      simple_wizard: "wand",
      sleep_timer: "timer",
      announcements: "announcement",
      library_liked: "heart_filled",
      library_playlists: "playlist",
      library_artists: "artist",
      library_albums: "album",
      library_tracks: "tracks",
      library_radio: "radio",
      library_podcasts: "podcast",
      library_search: "search",
      quick_search: "search",
      media_detail: this._state.mobileLibraryDetail?.media_type === "playlist" ? "playlist" : this._state.mobileLibraryDetail?.media_type === "artist" ? "artist" : "album",
    };
    return map[page] || "menu";
  }

  _setMobileMenuHeader(label, iconName, titleAction = "") {
    const title = this.$("mobileMenuTitle");
    if (!title) return;
    title.innerHTML = `<span class="menu-title-brand" aria-hidden="true">${this._tabletBrandSignatureHtml("menu-title-logo")}</span><span class="menu-title-main"><span class="menu-title-icon">${this._iconSvg(iconName)}</span><span class="menu-title-text">${this._esc(label)}</span></span>`;
    if (titleAction) {
      title.dataset.menuTitleAction = titleAction;
      title.classList.add("clickable");
    } else {
      delete title.dataset.menuTitleAction;
      title.classList.remove("clickable");
    }
  }

  _updateActivePlayersBubble() {
    const bubble = this.$("activePlayersBubble");
    if (!bubble) return;
    const activePlayers = this._activePlayingPlayers();
    if (!activePlayers.length) {
      bubble.hidden = true;
      bubble.classList.remove("open");
      return;
    }
    const countEl = this.$("activePlayersCount");
    bubble.style.color = "var(--ma-accent)";
    if (countEl) {
      countEl.textContent = String(activePlayers.length);
      countEl.style.color = "var(--ma-accent)";
    }
    bubble.hidden = false;
    bubble.classList.add("open");
  }

  _effectivePlayerVolumeLevel(playerOrEntityId = null) {
    const entityId = String(typeof playerOrEntityId === "string" ? playerOrEntityId : playerOrEntityId?.entity_id || "").trim();
    const optimistic = entityId ? this._optimisticVolumeByPlayer.get(entityId) : null;
    if (optimistic && Date.now() - Number(optimistic.ts || 0) < 5000) {
      return Math.max(0, Math.min(1, Number(optimistic.level) || 0));
    }
    const player = typeof playerOrEntityId === "string"
      ? (this._state.players || []).find((candidate) => candidate.entity_id === entityId) || this._hass?.states?.[entityId]
      : playerOrEntityId;
    const value = Number(player?.attributes?.volume_level);
    return Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0;
  }

  async _setPlayerVolumeForAnnouncement(entityId, level) {
    const normalized = Math.max(0, Math.min(1, Number(level) || 0));
    if (!entityId) return false;
    await this._callHomeiiEnginePlayerCommand(entityId, "volume", { volume_level: normalized });
    return true;
  }

  _playerVolumeLevel(entityId) {
    const player = (this._state.players || []).find((p) => p.entity_id === entityId) || this._hass?.states?.[entityId];
    return HomeiiPlayersFoundation.playerVolumeValue(player);
  }

  _setGroupVolumeFor(entityId, level) {
    const player = (this._state.players || []).find((p) => p.entity_id === entityId) || this._hass?.states?.[entityId];
    const ids = this._playerGroupMemberIds(player).filter(Boolean);
    const targets = ids.length
      ? ids.filter((id) => {
        const target = (this._state.players || []).find((p) => p.entity_id === id) || this._hass?.states?.[id];
        return !this._isStaticGroupPlayer(target);
      })
      : [entityId];
    targets.forEach((id) => this._setPlayerVolumeFor(id, level));
  }

  async _toggleMuteFor(entityId) {
    const player = this._playerByEntityId(entityId);
    if (!player) return;
    return this._setPlayerMutedFor(entityId, !this._isMuted(player));
  }

  async _runControlRoomPlayerBatch(playerIds, action) {
    const results = await Promise.allSettled(playerIds.map(action));
    const failed = playerIds.filter((_, index) => results[index].status === "rejected" || results[index].value === false);
    if (!failed.length) return true;
    const names = failed.map((id) => this._controlRoomPlayerName(id)).join(", ");
    this._toastError(this._m(`The action failed for: ${names}`, `הפעולה נכשלה עבור: ${names}`));
    this._schedulePlayerStateRefresh(0);
    return false;
  }

  async _toggleGroupMuteFor(entityId) {
    if (!entityId) return;
    const player = (this._state.players || []).find((p) => p.entity_id === entityId) || this._hass?.states?.[entityId];
    const ids = this._playerGroupMemberIds(player).filter(Boolean);
    const targets = (ids.length ? ids : [entityId]).filter((id) => {
      const target = (this._state.players || []).find((p) => p.entity_id === id) || this._hass?.states?.[id];
      return !this._isStaticGroupPlayer(target);
    });
    const shouldMute = targets.some((id) => {
      const target = (this._state.players || []).find((p) => p.entity_id === id) || this._hass?.states?.[id];
      return !this._isMuted(target);
    });
    await Promise.all(targets.map((id) => this._setPlayerMutedFor(id, shouldMute)));
    setTimeout(() => this._renderMobileMenu(), 120);
  }

  _isGroupMuted(player) {
    const ids = this._playerGroupMemberIds(player).filter(Boolean);
    if (!ids.length) return this._isMuted(player);
    return ids.every((id) => {
      const target = (this._state.players || []).find((p) => p.entity_id === id) || this._hass?.states?.[id];
      return this._isMuted(target);
    });
  }

  _mobileLibraryOrderBy() {
    const sort = String(this._state.mobileLibrarySort || "name_asc");
    if (sort === "date_desc" || sort === "date_asc") return "last_modified";
    return "sort_name";
  }

  _mobileFooterButtonInner(iconName, label) {
    const mode = this._mobileFooterMode();
    const icon = this._iconSvg(iconName);
    const text = `<span class="footer-btn-label">${this._esc(label)}</span>`;
    if (mode === "icon") return icon;
    if (mode === "text") return text;
    return `${icon}${text}`;
  }

  _mobileThemeFooterInner() {
    const mode = this._mobileFooterMode();
    const effective = this._effectiveTheme();
    const icon = this._iconSvg(effective === "dark" ? "sun" : "moon");
    const label = `<span class="footer-btn-label">${this._esc(this._i18n("ui.theme_2"))}</span>`;
    if (mode === "icon") return icon;
    if (mode === "text") return label;
    return `${icon}${label}`;
  }

  _mobileCurrentQueueIndex() {
    return HomeiiMediaQueueFoundation.mobileCurrentQueueIndex(this._state.maQueueState?.current_index);
  }

  _mobileQueueItemsSorted() {
    return HomeiiMediaQueueFoundation.sortQueueItems(this._state.queueItems || []);
  }

  _mobileArtStackContext() {
    return HomeiiMediaQueueFoundation.resolveMobileArtStackContext({
      queueItems: this._state.queueItems || [],
      currentIndexValue: this._state.maQueueState?.current_index,
      player: this._getSelectedPlayer(),
      currentItem: this._state.maQueueState?.current_item || null,
      hasPendingPlay: Number(this._state.mobileQueuePlayPendingUntil || 0) > Date.now(),
      pendingKey: String(this._state.mobileQueuePlayPendingKey || "").trim(),
      pendingUri: String(this._state.mobileQueuePlayPendingUri || "").trim(),
      pendingIndexValue: this._state.mobileQueuePlayPendingIndex,
      browseOffset: this._state.mobileArtBrowseOffset || 0,
    }, (uriA, uriB, fallbackType) => this._mediaRefsEquivalent(uriA, uriB, fallbackType));
  }

  _mobileArtStackItems() {
    const { queueItems, displayIndex, offset } = this._mobileArtStackContext();
    const current = queueItems[displayIndex] || this._state.maQueueState?.current_item || null;
    const previous = displayIndex > 0 ? queueItems[displayIndex - 1] : null;
    const next = displayIndex < queueItems.length - 1 ? queueItems[displayIndex + 1] : this._state.maQueueState?.next_item || null;
    return { previous, current, next, offset };
  }

  _hasPendingMobileQueuePlay(now = Date.now()) {
    return HomeiiNowPlayingFoundation.hasPendingQueuePlay(this._state, now);
  }

  _queueItemIdentityAccessors() {
    return {
      getQueueItemPlaybackId: (entry) => this._getQueueItemPlaybackId(entry),
      getQueueItemStableId: (entry) => this._getQueueItemStableId(entry),
      getQueueItemKey: (entry) => this._getQueueItemKey(entry),
      getQueueItemUri: (entry) => this._getQueueItemUri(entry),
    };
  }

  _queueItemMatchesPendingMobilePlay(item = null) {
    return HomeiiNowPlayingFoundation.queueItemMatchesPendingPlay(
      item,
      HomeiiNowPlayingFoundation.pendingQueuePlayState(this._state),
      this._queueItemIdentityAccessors(),
      (uriA, uriB, fallbackType) => this._mediaRefsEquivalent(uriA, uriB, fallbackType),
    );
  }

  _pendingMobileQueueItem(stack = null) {
    return HomeiiNowPlayingFoundation.resolvePendingQueueItem({
      state: this._state,
      currentQueueItem: this._state.maQueueState?.current_item || null,
      stack,
      queueItems: this._mobileQueueItemsSorted(),
      accessors: this._queueItemIdentityAccessors(),
      compareMediaRefs: (uriA, uriB, fallbackType) => this._mediaRefsEquivalent(uriA, uriB, fallbackType),
    });
  }

  _queueItemArtworkCacheKey(item = null) {
    return HomeiiArtworkFoundation.queueItemArtworkCacheKey(item, {
      ...this._queueItemIdentityAccessors(),
    });
  }

  _queueItemArtworkUrl(item = null, size = 420, player = this._getSelectedPlayer()) {
    if (!item) return "";
    const cacheKey = this._queueItemArtworkCacheKey(item);
    return this._bestArtworkUrl([
      this._queueItemImageUrl(item, size),
      item?.streamdetails?.stream_metadata?.image_url,
      item?.media_image,
      item?.image,
      item?.image_url,
      item?.media_item?.image,
      item?.media_item?.image_url,
      item?.media_item?.metadata?.image,
      item?.media_item?.metadata?.image_url,
      item?.media_item?.album?.image,
      item?.media_item?.album?.image_url,
    ], {
      size,
      cacheKey,
    });
  }

  _displayArtworkForQueueItem(player = null, item = null, { pending = false, size = 420 } = {}) {
    const playerArt = this._currentArtworkUrl(player, item || null, size, { preferPlayerArtwork: true });
    if (!item) return playerArt;
    if (!pending && playerArt) return playerArt;
    const queueArt = this._queueItemArtworkUrl(item, size, player);
    if (queueArt) return queueArt;
    return playerArt || this._currentArtworkUrl(player, item, size, { preferPlayerArtwork: !pending });
  }

  _mobileNowPlayingDisplaySource(player = null, currentQueueItem = null, stack = null) {
    return HomeiiNowPlayingFoundation.nowPlayingDisplaySource({
      player,
      currentQueueItem,
      stack,
      queueItems: this._mobileQueueItemsSorted(),
      state: this._state,
      fallbackTitle: this._i18n("ui.nothing_playing"),
      accessors: this._queueItemIdentityAccessors(),
      compareMediaRefs: (uriA, uriB, fallbackType) => this._mediaRefsEquivalent(uriA, uriB, fallbackType),
      artworkUrlFn: (displayPlayer, queueItem, { pending, size } = {}) =>
        this._displayArtworkForQueueItem(displayPlayer, queueItem, { pending, size }),
      size: 420,
    });
  }

  _preloadPendingMobileQueueItemArtwork(item = null) {
    const art = this._displayArtworkForQueueItem(this._getSelectedPlayer(), item, { pending: true, size: 420 });
    if (art) this._decodeArtworkUrl(art).catch(() => {});
  }

  _queueArtworkPrefetchUrls(items = this._mobileQueueItemsSorted(), options = {}) {
    const queueItems = Array.isArray(items) ? items.filter(Boolean) : [];
    if (!queueItems.length) return [];
    return HomeiiArtworkFoundation.queueArtworkPrefetchUrls(queueItems, {
      ...options,
      currentIndex: this._state.maQueueState?.current_index,
      isCurrentItemFn: (item) => this._isQueueItemCurrent(item),
    }, (item, size) => {
      return this._queueItemArtworkUrl(item, size);
    });
  }

  _scheduleArtworkPrefetchDrain(immediate = false) {
    if (this._artworkPrefetchTimer) return;
    const run = () => {
      this._artworkPrefetchTimer = null;
      this._drainArtworkPrefetchQueue();
    };
    if (!immediate && typeof requestIdleCallback === "function") {
      this._artworkPrefetchTimer = requestIdleCallback(run, { timeout: 900 });
      return;
    }
    this._artworkPrefetchTimer = setTimeout(run, immediate ? 0 : 120);
  }

  _enqueueArtworkPrefetch(urls = [], options = {}) {
    const uniqueUrls = (Array.isArray(urls) ? urls : [urls])
      .map((url) => String(url || "").trim())
      .filter(Boolean);
    if (!uniqueUrls.length) return;
    const immediate = options.immediate === true;
    const pendingUrls = [];
    uniqueUrls.forEach((url) => {
      if (this._decodedArtworkUrls.has(url) || this._artworkDecodePromises.has(url) || this._artworkPrefetchQueuedUrls.has(url)) return;
      pendingUrls.push(url);
      this._artworkPrefetchQueuedUrls.add(url);
    });
    if (immediate) this._artworkPrefetchQueue.unshift(...pendingUrls);
    else this._artworkPrefetchQueue.push(...pendingUrls);
    while (this._artworkPrefetchQueue.length > 96) {
      const dropped = this._artworkPrefetchQueue.pop();
      if (dropped) this._artworkPrefetchQueuedUrls.delete(dropped);
    }
    this._scheduleArtworkPrefetchDrain(immediate);
  }

  _drainArtworkPrefetchQueue() {
    const maxConcurrent = 3;
    while (this._artworkPrefetchActive < maxConcurrent && this._artworkPrefetchQueue.length) {
      const url = this._artworkPrefetchQueue.shift();
      this._artworkPrefetchQueuedUrls.delete(url);
      if (!url || this._decodedArtworkUrls.has(url)) continue;
      this._artworkPrefetchActive += 1;
      this._decodeArtworkUrl(url)
        .catch(() => {})
        .finally(() => {
          this._artworkPrefetchActive = Math.max(0, this._artworkPrefetchActive - 1);
          if (this._artworkPrefetchQueue.length) this._scheduleArtworkPrefetchDrain(false);
        });
    }
  }

  _prefetchQueueArtworkWindow(items = this._mobileQueueItemsSorted(), options = {}) {
    const urls = this._queueArtworkPrefetchUrls(items, options);
    this._enqueueArtworkPrefetch(urls, { immediate: options.immediate === true });
  }

  _queueVisibleArtworkWindowFromMenuBody(body = this.$("mobileMenuBody")) {
    if (!body || this._state.menuPage !== "queue") return null;
    const rows = Array.from(body.querySelectorAll?.(".queue-row[data-queue-position]") || []);
    if (!rows.length || typeof body.getBoundingClientRect !== "function") return null;
    const bodyRect = body.getBoundingClientRect();
    let firstIndex = Infinity;
    let lastIndex = -1;
    rows.forEach((row) => {
      const rect = row.getBoundingClientRect?.();
      if (!rect || rect.bottom < bodyRect.top - 160 || rect.top > bodyRect.bottom + 160) return;
      const index = Number(row.dataset.queuePosition || 0) - 1;
      if (!Number.isFinite(index) || index < 0) return;
      firstIndex = Math.min(firstIndex, index);
      lastIndex = Math.max(lastIndex, index);
    });
    if (!Number.isFinite(firstIndex) || lastIndex < firstIndex) return null;
    return {
      visibleStartIndex: Math.max(0, firstIndex),
      visibleCount: Math.min(40, Math.max(12, lastIndex - firstIndex + 1 + 8)),
    };
  }

  _handleMobileMenuScroll(e) {
    const body = e?.currentTarget || this.$("mobileMenuBody");
    if (!body) return;
    const scroller = e?.target?.matches?.(".media-items-list,.queue-list,.library-body,#mobileMediaSearchResults") ? e.target : body;
    const virtualList = scroller.matches?.("[data-homeii-virtual-total]") ? scroller : scroller.querySelector?.("[data-homeii-virtual-total]");
    if (virtualList && !this._virtualExpandPending) {
      const total = Math.max(0, Number(virtualList.dataset.homeiiVirtualTotal || 0));
      const columns = Math.max(1, Number(virtualList.dataset.virtualColumns || 1));
      const rowHeight = Math.max(48, Number(virtualList.dataset.virtualRowHeight || 88));
      const listTop = virtualList === scroller ? 0 : virtualList.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop;
      const firstVisibleRow = Math.max(0, Math.floor((Number(scroller.scrollTop || 0) - listTop) / rowHeight));
      const nextStart = Math.max(0, Math.min(total, Math.max(0, firstVisibleRow - 4) * columns));
      const page = this._state.menuPage;
      const currentStart = page === "queue"
        ? Number(this._queueVirtualStart || 0)
        : Number(this._mediaVirtualStarts.get(this._mediaVirtualPageKey()) || 0);
      if (total > 0 && Math.abs(nextStart - currentStart) >= columns * 2) {
        if (page === "queue") this._queueVirtualStart = nextStart;
        else this._mediaVirtualStarts.set(this._mediaVirtualPageKey(), nextStart);
        this._virtualExpandPending = true;
        requestAnimationFrame(() => {
          this._renderMobileMenu()
            .catch(() => {})
            .finally(() => { this._virtualExpandPending = false; });
        });
      }
    }
    if (this._state.menuPage !== "queue") return;
    clearTimeout(this._mobileQueueArtworkPrefetchTimer);
    this._mobileQueueArtworkPrefetchTimer = setTimeout(() => {
      const windowOptions = this._queueVisibleArtworkWindowFromMenuBody(body);
      if (!windowOptions) return;
      this._prefetchQueueArtworkWindow(this._getNowPlayingQueueItems(), {
        ...windowOptions,
        before: 2,
        after: 14,
      });
    }, 80);
  }

  _setOptimisticMobileQueueItem(item) {
    if (!item) return;
    const queueItems = this._mobileQueueItemsSorted();
    const stableKey = this._getQueueItemStableId(item);
    const uri = this._getQueueItemUri(item);
    const key = this._getQueueItemKey(item) || stableKey || uri;
    const itemIndex = HomeiiMediaQueueFoundation.findQueueItemIndex(
      queueItems,
      { queueItemId: key, uri, sortIndex: item?.sort_index },
      (uriA, uriB, fallbackType) => this._mediaRefsEquivalent(uriA, uriB, fallbackType),
    );
    const sortIndex = Number(item?.sort_index);
    const currentIndex = Number.isFinite(sortIndex) ? sortIndex : (itemIndex >= 0 ? itemIndex : this._state.maQueueState?.current_index);
    this._markMobileQueuePlayPending(item, Number(currentIndex));
    this._state.maQueueState = {
      ...(this._state.maQueueState || {}),
      current_index: currentIndex,
      current_item: item,
      next_item: itemIndex >= 0 ? (queueItems[itemIndex + 1] || null) : (this._state.maQueueState?.next_item || null),
      elapsed_time: 0,
      elapsed_time_last_updated: new Date().toISOString(),
    };
    this._state.mobileArtAnchorKey = key || "";
    this._state.mobileArtBrowseOffset = 0;
    this._preloadPendingMobileQueueItemArtwork(item);
    this._prefetchQueueArtworkWindow(queueItems, { immediate: true, before: 2, after: 16 });
  }

  _mobileArtStackRenderKey() {
    const stack = this._mobileArtStackItems();
    return [
      this._getQueueItemStableId(stack.previous) || this._getQueueItemUri(stack.previous) || this._getQueueItemKey(stack.previous) || "p0",
      this._mobileStackItemArtwork(stack.previous, "prev"),
      this._getQueueItemStableId(stack.current) || this._getQueueItemUri(stack.current) || this._getQueueItemKey(stack.current) || "c0",
      this._mobileStackItemArtwork(stack.current, "center"),
      this._getQueueItemStableId(stack.next) || this._getQueueItemUri(stack.next) || this._getQueueItemKey(stack.next) || "n0",
      this._mobileStackItemArtwork(stack.next, "next"),
      this._hasPendingMobileQueuePlay() ? this._state.mobileQueuePlayPendingKey || "" : "",
      this._hasPendingMobileQueuePlay() ? this._state.mobileQueuePlayPendingUri || "" : "",
      this._mobileSwipeMode(),
      this._mobileCoverFlowEnabled() ? "cover-flow" : "stack",
    ].join("|");
  }

  _mobileArtFallbackHtml() {
    const fallbackIcon = "brand";
    return `
      <div class="art-stack-fallback static-fallback ${fallbackIcon === "brand" ? "brand-fallback" : ""}">
        <div class="fallback-aura"></div>
        <div class="fallback-disc">${fallbackIcon === "brand" ? this._tabletBrandSignatureHtml("art-stack-brand-logo") : this._iconSvg(fallbackIcon)}</div>
      </div>
    `;
  }

  _mobileQuickActions() {
    const actions = HomeiiMobileSettingsFoundation.normalizeMobileQuickActions(
      this._state.mobileQuickActions,
      this._defaultMobileQuickActions(),
    );
    this._state.mobileQuickActions = actions;
    return actions;
  }

  _decodeArtworkUrl(url = "") {
    const normalized = String(url || "").trim();
    if (!normalized) return Promise.resolve(false);
    if (this._decodedArtworkUrls.has(normalized)) return Promise.resolve(true);
    if (this._artworkDecodePromises.has(normalized)) return this._artworkDecodePromises.get(normalized);
    const loadImage = (src) => new Promise((resolve) => {
      let settled = false;
      let timeout = null;
      const img = new Image();
      const markReady = () => {
        this._decodedArtworkUrls.add(normalized);
        this._decodedArtworkImages.set(normalized, img);
        const cap = homeiiMaxDecodedArtworkCache(this._performanceProfile());
        while (this._decodedArtworkUrls.size > cap) {
          const oldest = this._decodedArtworkUrls.values().next().value;
          if (!oldest) break;
          this._decodedArtworkUrls.delete(oldest);
          this._decodedArtworkImages.delete(oldest);
        }
        this._artworkDecodePromises.delete(normalized);
        resolve(true);
      };
      const finish = (ok) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        img.onload = null;
        img.onerror = null;
        if (!ok) {
          this._artworkDecodePromises.delete(normalized);
          resolve(false);
          return;
        }
        if (typeof img.decode === "function") {
          Promise.race([
            img.decode(),
            new Promise((resolveRace) => setTimeout(resolveRace, 240)),
          ]).catch(() => {}).finally(markReady);
          return;
        }
        markReady();
      };
      try {
        img.decoding = "async";
        img.loading = "eager";
        if ("fetchPriority" in img) img.fetchPriority = "high";
        img.onload = () => finish(true);
        img.onerror = () => finish(false);
        timeout = setTimeout(() => finish(false), 5200);
        img.src = src;
        if (img.complete && img.naturalWidth > 0) finish(true);
      } catch (_) {
        finish(false);
      }
    });
    const promise = (async () => {
      const isCrossOrigin = (() => {
        try {
          const currentOrigin = typeof window !== "undefined" ? window.location?.origin : "";
          const parsed = new URL(normalized, typeof window !== "undefined" ? window.location?.href : "http://homeii.local");
          return !!(currentOrigin && parsed.origin && parsed.origin !== currentOrigin);
        } catch (_) {
          return false;
        }
      })();
      if (this._shouldFetchArtworkUrl?.(normalized, { crossOrigin: isCrossOrigin })) {
        try {
          const objectUrl = await this._fetchArtworkBlobUrl(normalized, { crossOrigin: isCrossOrigin });
          if (objectUrl && await loadImage(objectUrl)) return true;
        } catch (_) {}
      }
      const directCandidates = [normalized, ...(this._artworkFallbackCandidates?.(normalized) || [])]
        .filter((candidate, index, list) => candidate && list.indexOf(candidate) === index);
      for (const candidate of directCandidates) {
        if (!await loadImage(candidate)) continue;
        if (candidate !== normalized) this._rememberImageBlobUrl?.([normalized], candidate);
        return true;
      }
      return false;
    })();
    this._artworkDecodePromises.set(normalized, promise);
    return promise;
  }

  _decodedArtworkImgHtml(art = "", alt = "", { current = false, fallbackIcon = "album" } = {}) {
    const normalized = String(art || "").trim();
    if (!normalized) return this._mobileArtFallbackHtml(fallbackIcon);
    const ready = this._decodedArtworkUrls.has(normalized);
    const displayUrl = ready ? this._artworkDisplayUrl?.(normalized) || normalized : normalized;
    const priority = current ? "high" : "low";
    return ready
      ? `<img src="${this._esc(displayUrl)}" alt="${this._esc(alt)}" decoding="async" loading="eager" fetchpriority="${priority}" data-homeii-art-ready="1" data-homeii-art-src="${this._esc(normalized)}" data-homeii-applied-art-src="${this._esc(normalized)}" data-homeii-art-display-src="${this._esc(displayUrl)}" data-homeii-art-fallback="1" data-homeii-art-fallback-icon="${this._esc(fallbackIcon)}">`
      : `<img src="${this._esc(normalized)}" alt="${this._esc(alt)}" decoding="async" loading="eager" fetchpriority="${priority}" data-homeii-art-src="${this._esc(normalized)}" data-homeii-art-ready="0" data-homeii-art-fallback="1" data-homeii-art-fallback-icon="${this._esc(fallbackIcon)}">`;
  }

  _setDecodedArtworkImage(img, url = "", alt = "") {
    if (!img) return;
    const nextUrl = String(url || "").trim();
    if (alt !== undefined) img.alt = String(alt || "");
    const currentSrc = img.getAttribute("src") || "";
    const displayUrl = () => this._artworkDisplayUrl?.(nextUrl) || nextUrl;
    if (!nextUrl) {
      img.removeAttribute("src");
      img.dataset.homeiiArtSrc = "";
      img.dataset.homeiiAppliedArtSrc = "";
      img.dataset.homeiiArtLoadToken = "";
      img.dataset.homeiiArtPendingAt = "";
      img.dataset.homeiiArtReady = "0";
      return;
    }
    if ((currentSrc === nextUrl || currentSrc === displayUrl()) && img.dataset.homeiiArtReady === "1") return;
    if (this._decodedArtworkUrls.has(nextUrl)) {
      img.src = displayUrl();
      img.dataset.homeiiArtSrc = nextUrl;
      img.dataset.homeiiAppliedArtSrc = nextUrl;
      img.dataset.homeiiArtDisplaySrc = displayUrl();
      img.dataset.homeiiArtLoadToken = "";
      img.dataset.homeiiArtPendingAt = "";
      img.dataset.homeiiArtReady = "1";
      return;
    }
    if (currentSrc === nextUrl) {
      img.dataset.homeiiArtSrc = nextUrl;
      this._decodeArtworkUrl(nextUrl).then((ok) => {
        if (!ok || !img.isConnected || img.dataset.homeiiArtSrc !== nextUrl) return;
        img.src = displayUrl();
        img.dataset.homeiiAppliedArtSrc = nextUrl;
        img.dataset.homeiiArtDisplaySrc = displayUrl();
        img.dataset.homeiiArtLoadToken = "";
        img.dataset.homeiiArtPendingAt = "";
        img.dataset.homeiiArtReady = "1";
      }).catch(() => {});
      return;
    }
    const pendingAt = Number(img.dataset.homeiiArtPendingAt || 0);
    if (
      img.dataset.homeiiArtSrc === nextUrl
      && img.dataset.homeiiAppliedArtSrc !== nextUrl
      && pendingAt > 0
      && Date.now() - pendingAt < 1800
    ) {
      return;
    }
    img.dataset.homeiiArtSrc = nextUrl;
    const token = `${Date.now()}:${Math.random().toString(36).slice(2)}`;
    img.dataset.homeiiArtLoadToken = token;
    img.dataset.homeiiArtPendingAt = String(Date.now());
    img.dataset.homeiiArtReady = "0";
    const applyImage = () => {
      if (!img.isConnected || img.dataset.homeiiArtSrc !== nextUrl || img.dataset.homeiiArtLoadToken !== token) return;
      img.src = displayUrl();
      img.dataset.homeiiAppliedArtSrc = nextUrl;
      img.dataset.homeiiArtDisplaySrc = displayUrl();
      img.dataset.homeiiArtLoadToken = "";
      img.dataset.homeiiArtPendingAt = "";
      img.dataset.homeiiArtReady = "1";
    };
    this._decodeArtworkUrl(nextUrl).then((ok) => {
      if (!ok && currentSrc) {
        if (img.dataset.homeiiArtLoadToken === token) {
          img.dataset.homeiiArtLoadToken = "";
          img.dataset.homeiiArtPendingAt = "";
        }
        return;
      }
      applyImage();
    }).catch(() => {});
  }

  _hydrateDecodedArtworkImages(root = this.shadowRoot) {
    root?.querySelectorAll?.("img[data-homeii-art-src]")?.forEach((img) => {
      this._setDecodedArtworkImage(img, img.dataset.homeiiArtSrc || "", img.getAttribute("alt") || "");
    });
  }

  _setDecodedBackgroundImage(el, url = "", valueForUrl = null) {
    if (!el) return;
    const nextUrl = String(url || "").trim();
    if (!nextUrl) {
      el.dataset.homeiiBgArtSrc = "";
      el.dataset.homeiiBgArtValue = "";
      el.style.backgroundImage = "";
      return;
    }
    const displayValue = () => {
      const displayUrl = this._artworkDisplayUrl?.(nextUrl) || nextUrl;
      return typeof valueForUrl === "function"
        ? valueForUrl(displayUrl)
        : `url(${JSON.stringify(displayUrl)})`;
    };
    const nextValue = displayValue();
    if (el.dataset.homeiiBgArtSrc === nextUrl && el.dataset.homeiiBgArtValue === nextValue) return;
    el.dataset.homeiiBgArtSrc = nextUrl;
    el.dataset.homeiiBgArtValue = nextValue;
    if (this._decodedArtworkUrls.has(nextUrl)) {
      el.style.backgroundImage = nextValue;
      return;
    }
    const applyBackground = () => {
      if (!el.isConnected || el.dataset.homeiiBgArtSrc !== nextUrl) return;
      el.style.backgroundImage = displayValue();
    };
    const fallbackTimer = setTimeout(applyBackground, el.style.backgroundImage ? 5200 : 2400);
    this._decodeArtworkUrl(nextUrl).then((ok) => {
      clearTimeout(fallbackTimer);
      if (!ok) {
        if (el.isConnected && el.dataset.homeiiBgArtSrc === nextUrl) el.dataset.homeiiBgArtSrc = "";
        return;
      }
      applyBackground();
    }).catch(() => {});
  }

  _setDecodedBackgroundCrossfade(el, url = "", overlay = "") {
    if (!el) return;
    const nextUrl = String(url || "").trim();
    const overlayValue = String(overlay || "").trim();
    el.style.backgroundImage = overlayValue || "";
    if (!nextUrl) {
      const timer = this._backgroundCrossfadeTimers?.get(el);
      if (timer) clearTimeout(timer);
      this._backgroundCrossfadeTimers?.delete(el);
      el.dataset.homeiiBgArtSrc = "";
      el.dataset.homeiiBgArtValue = "";
      el.dataset.homeiiBgArtReady = "0";
      el.classList.remove("bg-art-transitioning");
      el.style.removeProperty("--homeii-bg-art-current");
      el.style.removeProperty("--homeii-bg-art-next");
      return;
    }
    const displayValue = () => `url(${JSON.stringify(this._artworkDisplayUrl?.(nextUrl) || nextUrl)})`;
    const nextValue = displayValue();
    if (el.dataset.homeiiBgArtSrc === nextUrl && el.dataset.homeiiBgArtValue === nextValue) return;
    el.dataset.homeiiBgArtSrc = nextUrl;
    el.dataset.homeiiBgArtValue = nextValue;
    const applyCrossfade = () => {
      if (!el.isConnected || el.dataset.homeiiBgArtSrc !== nextUrl) return;
      const currentValue = String(el.style.getPropertyValue("--homeii-bg-art-current") || "").trim();
      const existingTimer = this._backgroundCrossfadeTimers?.get(el);
      if (existingTimer) clearTimeout(existingTimer);
      this._backgroundCrossfadeTimers?.delete(el);
      if (!currentValue || currentValue === "none" || el.dataset.homeiiBgArtReady !== "1") {
        el.classList.remove("bg-art-transitioning");
        el.style.setProperty("--homeii-bg-art-current", displayValue());
        el.style.removeProperty("--homeii-bg-art-next");
        el.dataset.homeiiBgArtReady = "1";
        return;
      }
      el.style.setProperty("--homeii-bg-art-next", displayValue());
      el.classList.remove("bg-art-transitioning");
      const raf = typeof requestAnimationFrame === "function"
        ? requestAnimationFrame
        : (callback) => setTimeout(callback, 0);
      raf(() => {
        if (!el.isConnected || el.dataset.homeiiBgArtSrc !== nextUrl) return;
        el.classList.add("bg-art-transitioning");
        const settleTimer = setTimeout(() => {
          if (!el.isConnected || el.dataset.homeiiBgArtSrc !== nextUrl) return;
          el.style.setProperty("--homeii-bg-art-current", displayValue());
          el.style.removeProperty("--homeii-bg-art-next");
          el.classList.remove("bg-art-transitioning");
          el.dataset.homeiiBgArtReady = "1";
          this._backgroundCrossfadeTimers?.delete(el);
        }, 560);
        this._backgroundCrossfadeTimers?.set(el, settleTimer);
      });
    };
    if (this._decodedArtworkUrls.has(nextUrl)) {
      applyCrossfade();
      return;
    }
    this._decodeArtworkUrl(nextUrl).then((ok) => {
      if (!ok) return;
      applyCrossfade();
    }).catch(() => {});
  }

  _syncCurrentArtworkBackgrounds(artUrl = "") {
    const art = String(artUrl || this._state.mobileDynamicThemeArtworkUrl || "").trim();
    const effectiveArt = !this._isHotelMode() ? art : "";
    const overlay = this._mobileBackdropOverlay(this._effectiveTheme());
    const token = ++this._currentArtworkBackgroundToken;
    const applyBackgrounds = () => {
      if (token !== this._currentArtworkBackgroundToken) return;
      this._setDecodedBackgroundImage(this.$("mobileArtAura"), effectiveArt);
      this._setDecodedBackgroundImage(this.$("mobileHeroAura"), effectiveArt);
      this._setDecodedBackgroundImage(this.$("compactBackdropArt"), effectiveArt);
      this._setDecodedBackgroundImage(this.$("compactCoverAura"), effectiveArt);
      this._setDecodedBackgroundCrossfade(this.$("mobileBg"), effectiveArt, overlay);
    };
    if (!effectiveArt || this._decodedArtworkUrls.has(effectiveArt)) {
      applyBackgrounds();
      return;
    }
    this._decodeArtworkUrl(effectiveArt).then((ok) => {
      if (ok) applyBackgrounds();
    }).catch(() => {});
  }

  _mobileStackItemArtwork(item, position = "center") {
    const isCenter = position === "center";
    const isPlayingItem = !!item && this._isQueueItemCurrent(item);
    const size = 420;
    const selectedPlayer = this._getSelectedPlayer();
    if (!item) {
      return isCenter
        ? this._currentArtworkUrl(selectedPlayer, null, size, { preferPlayerArtwork: true })
        : "";
    }
    if (isCenter && this._queueItemMatchesPendingMobilePlay(item)) {
      return this._displayArtworkForQueueItem(selectedPlayer, item, { pending: true, size });
    }
    const currentArtwork = isCenter && isPlayingItem
      ? this._currentArtworkUrl(selectedPlayer, item, size, { preferPlayerArtwork: true })
      : "";
    return this._bestArtworkUrl([
      currentArtwork,
      this._queueItemArtworkUrl(item, size, selectedPlayer),
    ], {
      size,
      cacheKey: this._queueItemArtworkCacheKey(item) || this._currentArtworkCacheKey(selectedPlayer, item),
    });
  }

  _mobileStackCardHtml(item, position = "center") {
    const isCurrent = position === "center";
    const art = this._mobileStackItemArtwork(item, position);
    const label = item?.media_item?.name || item?.name || (isCurrent ? (this._getSelectedPlayer()?.attributes?.media_title || "") : "");
    const selectedPlayer = this._getSelectedPlayer();
    const isRadioItem = this._isLikelyRadioPlayback(selectedPlayer, item, item?.media_item);
    const fallbackIcon = isRadioItem ? "brand" : "album";
    return `
      <div class="art-stack-card ${position} ${!art ? "placeholder" : ""}">
        ${this._decodedArtworkImgHtml(art, label, { current: isCurrent, fallbackIcon })}
      </div>
    `;
  }

  _mobileStackSlideHtml(item, position = "center") {
    const queueItemId = this._getQueueItemStableId(item) || this._getQueueItemKey(item);
    const uri = this._getQueueItemUri(item);
    const mediaType = item?.media_item?.media_type || item?.media_type || "track";
    const sortIndex = Number.isFinite(Number(item?.sort_index)) ? Number(item.sort_index) : "";
    return `
      <div class="art-stack-slide ${position}" data-art-position="${position}" data-queue-item-id="${this._esc(queueItemId || "")}" data-uri="${this._esc(uri)}" data-type="${this._esc(mediaType)}" data-sort-index="${this._esc(sortIndex)}">
        ${this._mobileStackCardHtml(item, position)}
      </div>
    `;
  }

  _mobileCoverFlowWindow() {
    const context = this._mobileArtStackContext();
    const stack = this._mobileArtStackItems();
    const queueItems = Array.isArray(context.queueItems) ? context.queueItems : [];
    const displayIndex = Math.max(0, Math.min(queueItems.length - 1, Number(context.displayIndex || 0) || 0));
    return [-2, -1, 0, 1, 2].map((offset) => ({
      offset,
      item: offset === 0 ? (stack.current || null) : (queueItems[displayIndex + offset] || null),
    }));
  }

  _mobileCoverFlowSlideHtml(entry = {}) {
    const offset = Number(entry.offset || 0);
    const item = entry.item || null;
    const depth = Math.min(2, Math.abs(offset));
    const position = offset === 0 ? "center" : offset < 0 ? "prev" : "next";
    const flowClass = offset === 0 ? "flow-center" : `${offset < 0 ? "flow-before" : "flow-after"} flow-depth-${depth}`;
    if (!item && offset !== 0) {
      return `<div class="art-stack-slide cover-flow-slide ${position} ${flowClass} ghost" data-art-position="${position}" data-cover-flow-offset="${this._esc(String(offset))}"><div class="art-stack-card ${position} ghost"></div></div>`;
    }
    const queueItemId = this._getQueueItemStableId(item) || this._getQueueItemKey(item);
    const uri = this._getQueueItemUri(item);
    const mediaType = item?.media_item?.media_type || item?.media_type || "track";
    const sortIndex = Number.isFinite(Number(item?.sort_index)) ? Number(item.sort_index) : "";
    return `
      <div class="art-stack-slide cover-flow-slide ${position} ${flowClass}" data-art-position="${position}" data-cover-flow-offset="${this._esc(String(offset))}" data-queue-item-id="${this._esc(queueItemId || "")}" data-uri="${this._esc(uri)}" data-type="${this._esc(mediaType)}" data-sort-index="${this._esc(sortIndex)}">
        ${this._mobileStackCardHtml(item, position)}
      </div>
    `;
  }

  _mobileCoverFlowHtml() {
    return `
      <div class="art-stack-viewport cover-flow-viewport">
        <div class="art-stack-container cover-flow-container">
          ${this._mobileCoverFlowWindow().map((entry) => this._mobileCoverFlowSlideHtml(entry)).join("")}
        </div>
      </div>
    `;
  }

  _mobileArtworkStackHtml() {
    if (this._mobileCoverFlowEnabled()) return this._mobileCoverFlowHtml();
    const { previous, current, next } = this._mobileArtStackItems();
    return `
      <div class="art-stack-viewport">
        <div class="art-stack-container">
          ${previous ? this._mobileStackSlideHtml(previous, "prev") : `<div class="art-stack-slide prev"><div class="art-stack-card prev ghost"></div></div>`}
          ${this._mobileStackSlideHtml(current, "center")}
          ${next ? this._mobileStackSlideHtml(next, "next") : `<div class="art-stack-slide next"><div class="art-stack-card next ghost"></div></div>`}
        </div>
      </div>
    `;
  }

  _preloadMobileArtImages(stack = this._mobileArtStackItems()) {
    const urls = [
      this._mobileStackItemArtwork(stack.previous, "prev"),
      this._mobileStackItemArtwork(stack.current, "center"),
      this._mobileStackItemArtwork(stack.next, "next"),
    ].filter(Boolean);
    for (const src of urls) {
      this._decodeArtworkUrl(src).catch(() => {});
    }
    this._prefetchQueueArtworkWindow(this._mobileQueueItemsSorted(), { immediate: false, before: 2, after: 12 });
  }

  async _ensureEmblaLoaded() {
    const embla = HomeiiEmblaCarousel || globalThis.EmblaCarousel;
    if (typeof embla !== "function") {
      throw new Error("The bundled Embla carousel runtime is unavailable.");
    }
    if (window.EmblaCarousel) return window.EmblaCarousel;
    if (this._mobileEmblaLoadPromise) return this._mobileEmblaLoadPromise;
    this._mobileEmblaLoadPromise = Promise.resolve(embla);
    return this._mobileEmblaLoadPromise;
  }

  _destroyMobileEmbla() {
    if (!this._mobileEmbla) return;
    try { this._mobileEmbla.destroy(); } catch (_) {}
    this._mobileEmbla = null;
  }

  _scheduleMobileArtBrowseReset() {
    clearTimeout(this._mobileArtBrowseResetTimer);
    this._mobileArtBrowseResetTimer = null;
    // Browsing is a user selection, not a temporary animation. Keep the chosen
    // cover until playback, a player change or an actual queue anchor change.
  }

  _bindMobileArtFallbackGestures() {
    const root = this.$("npArt");
    if (!root || root.dataset.fallbackBound === "1") return;
    root.dataset.fallbackBound = "1";
    root.addEventListener("touchstart", (e) => {
      this._onArtTouchStart(e);
    }, { passive: true });
    root.addEventListener("touchmove", (e) => {
      this._onArtTouchMove(e);
    }, { passive: false });
    root.addEventListener("touchend", (e) => {
      this._onArtTouchEnd(e);
    }, { passive: true });
    root.addEventListener("touchcancel", () => {
      this._state.activeArtworkTouch = null;
      this._clearArtDragOffset();
      this.$("mobileArtShell")?.classList.remove("dragging");
    }, { passive: true });
    root.addEventListener("wheel", (e) => {
      this._onArtWheel(e);
    }, { passive: false });
  }

  async _initMobileArtCarousel() {
    this._destroyMobileEmbla();
    this._bindMobileArtFallbackGestures();
  }

  _bindActivePlayerChipSwipe() {
    const chip = this.$("activePlayerChip");
    if (!chip || chip.dataset.swipeBound === "1" || this._layoutModeConfig() === "tablet") return;
    chip.dataset.swipeBound = "1";
    chip.addEventListener("touchstart", (e) => this._onActivePlayerChipTouchStart(e), { passive: true });
    chip.addEventListener("touchend", (e) => this._onActivePlayerChipTouchEnd(e), { passive: true });
    chip.addEventListener("touchcancel", () => {
      this._state.activePlayerChipTouch = null;
    }, { passive: true });
  }

  _onActivePlayerChipTouchStart(e) {
    const touch = e.touches?.[0];
    if (!touch) return;
    this._state.activePlayerChipTouch = { x: touch.clientX, y: touch.clientY, t: Date.now() };
  }

  _onActivePlayerChipTouchEnd(e) {
    const start = this._state.activePlayerChipTouch;
    this._state.activePlayerChipTouch = null;
    const touch = e.changedTouches?.[0];
    if (!start || !touch) return;
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    const dt = Date.now() - start.t;
    if (Math.abs(dx) < 36 || Math.abs(dx) <= Math.abs(dy) || dt > 650) return;
    this._state.activePlayerSwipeLockUntil = Date.now() + 280;
    this._hapticTap([8]);
    this._cycleActivePlayer(dx < 0 ? 1 : -1);
  }

  _onArtTouchStart(e) {
    if (this._immersiveSwipePending) return;
    const touch = e.touches?.[0];
    if (!touch) return;
    this._state.activeArtworkTouch = { x: touch.clientX, y: touch.clientY, t: Date.now(), dx: 0, dy: 0, active: true };
    const artShell = this.$("mobileArtShell");
    const artHost = this.$("npArt");
    if (artShell) {
      artShell.classList.remove("commit-next", "commit-prev");
      artShell.classList.add("dragging");
    }
    artHost?.classList.remove("resetting");
    artHost?.classList.add("dragging");
    this._setArtDragOffset(0);
  }

  _onArtTouchMove(e) {
    const start = this._state.activeArtworkTouch;
    const touch = e.touches?.[0];
    if (!start || !touch) return;
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    start.dx = dx;
    start.dy = dy;
    if (this._mobileCoverFlowEnabled()) {
      if (Math.abs(dy) <= Math.abs(dx)) return;
      if (e.cancelable) e.preventDefault();
      const limited = Math.max(-118, Math.min(118, dy * 0.68));
      this._setArtDragYOffset(limited);
      return;
    }
    if (Math.abs(dx) <= Math.abs(dy)) return;
    if (e.cancelable) e.preventDefault();
    const limit = immersivePlayerEnabled(this) ? Math.max(92, this.$("npArt")?.clientWidth || 280) : 92;
    const limited = Math.max(-limit, Math.min(limit, dx * (immersivePlayerEnabled(this) ? 1 : 0.72)));
    this._setArtDragOffset(limited);
  }

  _setArtDragOffset(px = 0) {
    const artHost = this.$("npArt");
    if (!artHost) return;
    const value = Number.isFinite(Number(px)) ? Number(px) : 0;
    artHost.style.setProperty("--art-drag-x", `${value.toFixed(2)}px`);
  }

  _setArtDragYOffset(px = 0) {
    const artHost = this.$("npArt");
    if (!artHost) return;
    const value = Number.isFinite(Number(px)) ? Number(px) : 0;
    artHost.style.setProperty("--art-drag-y", `${value.toFixed(2)}px`);
  }

  _clearArtDragOffset() {
    const artHost = this.$("npArt");
    if (!artHost) return;
    artHost.style.setProperty("--art-drag-x", "0px");
    artHost.style.setProperty("--art-drag-y", "0px");
  }

  _moveMobileCoverFlow(delta = 0, options = {}) {
    const step = Math.round(Number(delta) || 0);
    if (!step) return false;
    const { queueItems, displayIndex } = this._mobileArtStackContext();
    if (!Array.isArray(queueItems) || queueItems.length < 2) {
      this._clearArtDragOffset();
      return false;
    }
    const targetIndex = Math.max(0, Math.min(queueItems.length - 1, displayIndex + step));
    const appliedStep = targetIndex - displayIndex;
    if (!appliedStep) {
      this._clearArtDragOffset();
      return false;
    }
    this._state.mobileArtJustSwipedAt = Date.now();
    this._state.mobileArtBrowseOffset += appliedStep;
    if (options?.keepDragOffset !== true) this._clearArtDragOffset();
    this._refreshMobileArtStack(true);
    this._scheduleMobileArtBrowseReset();
    this._hapticTap([8]);
    return true;
  }

  _commitMobileCoverFlowSwipe(step = 0) {
    const appliedStep = Math.round(Number(step) || 0);
    if (!appliedStep) return false;
    const artHost = this.$("npArt");
    const artShell = this.$("mobileArtShell");
    if (!artHost) return this._moveMobileCoverFlow(appliedStep);
    artShell?.classList.remove("dragging", "commit-next", "commit-prev");
    artHost.classList.remove("dragging", "resetting");
    this._setArtDragYOffset(appliedStep > 0 ? -168 : 168);
    const scheduleFrame = typeof requestAnimationFrame === "function" ? requestAnimationFrame : (callback) => setTimeout(callback, 0);
    setTimeout(() => {
      const moved = this._moveMobileCoverFlow(appliedStep, { keepDragOffset: true });
      if (!moved) {
        this._clearArtDragOffset();
        return;
      }
      const settle = () => {
        scheduleFrame(() => {
          this._clearArtDragOffset();
          scheduleFrame(() => {
            artHost.classList.remove("resetting", "dragging");
            artShell?.classList.remove("commit-next", "commit-prev", "swipe-next", "swipe-prev");
          });
        });
      };
      scheduleFrame(settle);
    }, 105);
    return true;
  }

  _onArtWheel(e) {
    if (!this._mobileCoverFlowEnabled()) return;
    const deltaY = Number(e?.deltaY || 0);
    const deltaX = Number(e?.deltaX || 0);
    if (!deltaY || Math.abs(deltaY) <= Math.abs(deltaX)) return;
    if (e.cancelable) e.preventDefault();
    const now = Date.now();
    if (now - Number(this._state.mobileCoverFlowWheelAt || 0) < 130) return;
    this._state.mobileCoverFlowWheelAt = now;
    const step = Math.max(1, Math.min(4, Math.round(Math.abs(deltaY) / 90) || 1));
    this._commitMobileCoverFlowSwipe(deltaY > 0 ? step : -step);
  }

  _commitArtSwipe(direction, applyChange) {
    if (immersivePlayerEnabled(this) && !this._isCompactTileMode()) return commitImmersiveSwipe(this, direction, applyChange);
    const artShell = this.$("mobileArtShell");
    const artHost = this.$("npArt");
    if (!artShell) {
      applyChange?.();
      return;
    }
    artShell.classList.remove("dragging", "commit-next", "commit-prev");
    artHost?.classList.remove("dragging", "resetting");
    this._setArtDragOffset(direction === "next" ? -132 : 132);
    const scheduleFrame = typeof requestAnimationFrame === "function" ? requestAnimationFrame : (callback) => setTimeout(callback, 0);
    setTimeout(() => {
      artHost?.classList.add("resetting");
      applyChange?.();
      const settle = () => {
        scheduleFrame(() => {
          this._clearArtDragOffset();
          scheduleFrame(() => {
            artHost?.classList.remove("resetting", "dragging");
            artShell.classList.remove("commit-next", "commit-prev", "swipe-next", "swipe-prev");
          });
        });
      };
      scheduleFrame(settle);
    }, 105);
  }

  _onArtTouchEnd(e) {
    const start = this._state.activeArtworkTouch;
    this._state.activeArtworkTouch = null;
    const touch = e.changedTouches?.[0];
    if (!start || !touch) return;
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    const dt = Date.now() - start.t;
    const artShell = this.$("mobileArtShell");
    const artHost = this.$("npArt");
    if (artShell) artShell.classList.remove("dragging");
    artHost?.classList.remove("dragging");
    if (this._mobileCoverFlowEnabled() && Math.abs(dy) >= 28 && Math.abs(dy) > Math.abs(dx)) {
      const step = Math.max(1, Math.min(4, Math.round(Math.abs(dy) / 82) || 1));
      if (!this._commitMobileCoverFlowSwipe(dy < 0 ? step : -step)) this._clearArtDragOffset();
      return;
    }
    if (Math.abs(dx) < 34 || Math.abs(dx) < Math.abs(dy) || (!immersivePlayerEnabled(this) && dt > 650)) {
      this._clearArtDragOffset();
      return;
    }
    if (this._mobileSwipeMode() === "browse") {
      const { queueItems, displayIndex } = this._mobileArtStackContext();
      if (!queueItems.length) return;
      const canMove = dx < 0 ? displayIndex < queueItems.length - 1 : displayIndex > 0;
      if (!canMove) {
        this._clearArtDragOffset();
        return;
      }
      this._state.mobileArtJustSwipedAt = Date.now();
      this._commitArtSwipe(dx < 0 ? "next" : "prev", () => {
        this._state.mobileArtBrowseOffset += dx < 0 ? 1 : -1;
        this._refreshMobileArtStack();
      });
      this._scheduleMobileArtBrowseReset();
      this._hapticTap([8]);
      return;
    }
    const { queueItems, displayIndex } = this._mobileArtStackContext();
    const targetIndex = dx < 0 ? displayIndex + 1 : displayIndex - 1;
    const targetItem = queueItems[targetIndex] || null;
    const targetQueueItemId = targetItem ? this._getQueueItemKey(targetItem) : "";
    const targetUri = targetItem?.media_item?.uri || targetItem?.uri || "";
    const targetType = targetItem?.media_item?.media_type || targetItem?.media_type || "track";
    const targetSortIndex = Number.isFinite(Number(targetItem?.sort_index)) ? Number(targetItem.sort_index) : "";
    this._commitArtSwipe(dx < 0 ? "next" : "prev", () => {
      if (targetItem) {
        return this._playQueueItem(targetQueueItemId, targetUri, targetType, targetSortIndex)
          .then((ok) => { if (!ok) this._ensureQueueSnapshot(true); })
          .catch(() => this._ensureQueueSnapshot(true));
      } else {
        return this._playAdjacentRadioStation(dx < 0 ? "next" : "previous").then((playedRadio) => {
          if (playedRadio) return;
          this._state.mobileArtBrowseOffset = dx < 0 ? 1 : -1;
          this._refreshMobileArtStack(true);
          return this._playerCmd(dx < 0 ? "next" : "previous");
        });
      }
    });
  }

  _refreshMobileArtStack(force = false) {
    if (immersivePlayerEnabled(this) && !this._immersiveSwipeApplying && (this._immersiveSwipePending || this._state.activeArtworkTouch)) return;
    if (this._isCompactTileMode()) {
      this._syncNowPlayingUI();
      return;
    }
    const artHost = this.$("npArt");
    const artAura = this.$("mobileArtAura");
    const heroAura = this.$("mobileHeroAura");
    const player = this._getSelectedPlayer();
    const stack = this._mobileArtStackItems();
    this._preloadMobileArtImages(stack);
    const renderKey = this._mobileArtStackRenderKey();
    if (artHost && (force || this._state.mobileArtRenderKey !== renderKey)) {
      if (this._immersiveSwipeApplying) reconcileImmersiveCovers(artHost, this._mobileArtworkStackHtml());
      else artHost.innerHTML = this._mobileArtworkStackHtml();
      this._state.mobileArtRenderKey = renderKey;
      queueMicrotask(() => {
        this._initMobileArtCarousel();
      });
    }
    if (artHost) this._hydrateDecodedArtworkImages(artHost);
    const currentQueueItem = this._state.maQueueState?.current_item || null;
    const displaySource = this._mobileNowPlayingDisplaySource(player, currentQueueItem, stack);
    const playingArt = displaySource.art || this._displayArtworkForQueueItem(player, displaySource.queueItem || currentQueueItem, { pending: displaySource.hasPendingPlay, size: 420 });
    const previewArt = this._queueItemArtworkUrl(stack.current, 420, player) || playingArt;
    const art = this._mobileBrowsePreviewActive(stack)
      ? playingArt
      : (displaySource.hasPendingPlay ? playingArt : previewArt);
    this._setDecodedBackgroundImage(artAura, !this._isHotelMode() ? art : "");
    this._setDecodedBackgroundImage(heroAura, !this._isHotelMode() ? art : "");
    if (this._mobileBrowsePreviewActive(stack)) {
      const browseTitle = stack.current?.media_item?.name || stack.current?.name || player?.attributes?.media_title || this._i18n("ui.nothing_playing");
      const browseArtist = stack.current?.media_item?.artists?.map((a) => a.name).join(", ")
        || stack.current?.artist_str
        || player?.attributes?.media_artist
        || "";
      const browseAlbum = stack.current?.media_item?.album?.name || player?.attributes?.media_album_name || "";
      if (this.$("npTitle")) this.$("npTitle").textContent = browseTitle;
      this._setNowPlayingSubtitle([browseArtist, browseAlbum].filter(Boolean).join(" · ") || "—");
      this._scheduleMobileArtBrowseReset();
    } else {
      if (this.$("npTitle")) this.$("npTitle").textContent = displaySource.title || this._i18n("ui.nothing_playing");
      this._setNowPlayingSubtitle([displaySource.artist, displaySource.album].filter(Boolean).join(" · ") || "—");
      clearTimeout(this._mobileArtBrowseResetTimer);
      this._mobileArtBrowseResetTimer = null;
    }
  }

  async _handleMobileArtTap(e) {
    if (Date.now() - Number(this._state.mobileArtJustSwipedAt || 0) < 260) return;
    const slide = e.target.closest(".art-stack-slide");
    if (!slide) return;
    const position = slide.dataset.artPosition || "center";
    if (this._mobileCoverFlowEnabled()) {
      const flowOffset = Number(slide.dataset.coverFlowOffset || 0);
      const context = this._mobileArtStackContext();
      const targetIndex = Math.max(0, Math.min((context.queueItems?.length || 1) - 1, Number(context.displayIndex || 0) + (Number.isFinite(flowOffset) ? flowOffset : 0)));
      const selectedItem = context.queueItems?.[targetIndex] || null;
      const queueItemId = selectedItem
        ? (this._getQueueItemStableId(selectedItem) || this._getQueueItemKey(selectedItem))
        : (slide.dataset.queueItemId || "");
      const uri = selectedItem ? this._getQueueItemUri(selectedItem) : (slide.dataset.uri || "");
      const mediaType = selectedItem?.media_item?.media_type || selectedItem?.media_type || slide.dataset.type || "track";
      const sortIndex = selectedItem && Number.isFinite(Number(selectedItem?.sort_index))
        ? Number(selectedItem.sort_index)
        : (slide.dataset.sortIndex || "");
      if (!queueItemId && !uri) return;
      const played = await this._playQueueItem(queueItemId, uri, mediaType, sortIndex);
      if (!played) return;
      this._state.mobileArtBrowseOffset = 0;
      clearTimeout(this._mobileArtBrowseResetTimer);
      this._mobileArtBrowseResetTimer = null;
      this._refreshMobileArtStack(true);
      return;
    }
    if (!this._mobileCoverFlowEnabled() && this._mobileSwipeMode() !== "browse") {
      if (position === "center") this._hapticTap([6]);
      return;
    }
    if (position === "prev" || position === "next") {
      const { queueItems, displayIndex } = this._mobileArtStackContext();
      if (!queueItems.length) return;
      const nextIndex = position === "prev" ? displayIndex - 1 : displayIndex + 1;
      if (nextIndex < 0 || nextIndex >= queueItems.length) return;
      this._state.mobileArtBrowseOffset += position === "prev" ? -1 : 1;
      this._refreshMobileArtStack(true);
      this._scheduleMobileArtBrowseReset();
      this._hapticTap([8]);
      return;
    }
    const context = this._mobileArtStackContext();
    const selectedItem = context.queueItems?.[context.displayIndex] || null;
    const queueItemId = selectedItem
      ? (this._getQueueItemStableId(selectedItem) || this._getQueueItemKey(selectedItem))
      : (slide.dataset.queueItemId || "");
    const uri = selectedItem ? this._getQueueItemUri(selectedItem) : (slide.dataset.uri || "");
    const mediaType = selectedItem?.media_item?.media_type || selectedItem?.media_type || slide.dataset.type || "track";
    const sortIndex = selectedItem && Number.isFinite(Number(selectedItem?.sort_index))
      ? Number(selectedItem.sort_index)
      : (slide.dataset.sortIndex || "");
    if (!queueItemId && !uri) return;
    const played = await this._playQueueItem(queueItemId, uri, mediaType, sortIndex);
    if (!played) return;
    this._state.mobileArtBrowseOffset = 0;
    clearTimeout(this._mobileArtBrowseResetTimer);
    this._mobileArtBrowseResetTimer = null;
    this._refreshMobileArtStack(true);
  }

  async _handleCompactCoverTap(e) {
    if (Date.now() - Number(this._state.mobileArtJustSwipedAt || 0) < 260) return;
    const artHost = this.$("npArt");
    if (artHost?.dataset.emptyAction === "random") {
      this._pressUiButton(artHost);
      await this._playRandomFromPlaylists();
      return;
    }
    if (this._mobileSwipeMode() !== "browse" || !Number(this._state.mobileArtBrowseOffset || 0)) {
      this._hapticTap([6]);
      return;
    }
    const context = this._mobileArtStackContext();
    const selectedItem = context.queueItems?.[context.displayIndex] || null;
    const queueItemId = selectedItem
      ? (this._getQueueItemStableId(selectedItem) || this._getQueueItemKey(selectedItem))
      : (artHost?.dataset.queueItemId || "");
    const uri = selectedItem ? this._getQueueItemUri(selectedItem) : (artHost?.dataset.uri || "");
    const mediaType = selectedItem?.media_item?.media_type || selectedItem?.media_type || artHost?.dataset.type || "track";
    const sortIndex = selectedItem && Number.isFinite(Number(selectedItem?.sort_index))
      ? Number(selectedItem.sort_index)
      : (artHost?.dataset.sortIndex || "");
    if (!queueItemId && !uri) return;
    this._pressUiButton(artHost);
    const played = await this._playQueueItem(queueItemId, uri, mediaType, sortIndex);
    if (!played) return;
    this._state.mobileArtBrowseOffset = 0;
    clearTimeout(this._mobileArtBrowseResetTimer);
    this._mobileArtBrowseResetTimer = null;
    this._refreshMobileArtStack(true);
  }

  _build() {
    this.classList.toggle("action-labels", this._mobileFooterMode() !== "icon");
    const rtl = this._isHebrew();
    const visualTheme = this._visualTheme();
    const mobileLayoutMode = this._mobileLayoutMode();
    const compactMode = this._mobileCompactModeEnabled();
    const compactTileMode = this._isCompactTileMode();
    const immersiveDesign = immersivePlayerEnabled(this) && !compactTileMode;
    const coverFlowMode = this._mobileCoverFlowEnabled();
    const compactPopupMode = compactMode && !compactTileMode;
    const compactEdgeToEdgePopupMode = compactPopupMode && this._compactEdgeToEdgeAllowed();
    const compactWindowPopupMode = compactPopupMode && !compactEdgeToEdgePopupMode;
    const compactPopupLayoutMode = compactEdgeToEdgePopupMode || compactWindowPopupMode;
    const compactLayoutWidth = this._getCardWidth(this._lastCardWidth || (typeof window !== "undefined" ? Number(window.innerWidth || 0) : 0) || 390);
    const compactMiniWidget = compactTileMode && this._compactMiniWidgetMode({ width: compactLayoutWidth });
    const compactTileReservedHeight = this._compactTileReservedHeight();
    this.style?.setProperty("--homeii-compact-tile-height", `${compactTileReservedHeight}px`);
    const viewportWidth = typeof window !== "undefined" ? Number(window.innerWidth || 0) : 0;
    const fallbackHeight = this._configuredCardHeightFallback(760) || 760;
    const viewportHeight = this._getViewportHeight(fallbackHeight);
    const compactWindowChrome = viewportWidth > 0 && viewportWidth < 760 ? 156 : 112;
    const compactWindowWidth = compactWindowPopupMode
      ? Math.max(320, Math.min(720, Math.max(0, viewportWidth || compactLayoutWidth || 390) - 32))
      : 0;
    const compactWindowHeight = compactWindowPopupMode
      ? Math.max(340, Math.min(860, Math.max(0, viewportHeight - compactWindowChrome), fallbackHeight || 760))
      : 0;
    if (compactWindowPopupMode) {
      this.style?.setProperty("--homeii-compact-window-width", `${Math.round(compactWindowWidth)}px`);
      this.style?.setProperty("--homeii-compact-window-height", `${Math.round(compactWindowHeight)}px`);
    } else {
      this.style?.removeProperty("--homeii-compact-window-width");
      this.style?.removeProperty("--homeii-compact-window-height");
    }
    const layoutMode = this._layoutModeConfig({ compactPopup: compactPopupLayoutMode, width: compactWindowPopupMode ? compactWindowWidth : 0 });
    const visualEditorContext = this._isVisualEditorContext();
    const mobileEdgeToEdgeMode = !visualEditorContext && !compactPopupLayoutMode && !compactTileMode && layoutMode === "mobile" && this._mobileEdgeToEdgeEnabled();
    const mobileIconScale = this._mobileIconScale();
    const allocatedHeight = compactEdgeToEdgePopupMode
      ? viewportHeight
      : compactWindowPopupMode
        ? compactWindowHeight
        : mobileEdgeToEdgeMode
          ? viewportHeight
          : compactTileMode
            ? compactTileReservedHeight
            : this._getAllocatedCardHeight(fallbackHeight);
    const layoutProfile = this._layoutProfileConfig(layoutMode, {
      width: compactEdgeToEdgePopupMode || mobileEdgeToEdgeMode
        ? this._getCardWidth(viewportWidth)
        : compactWindowPopupMode
          ? compactWindowWidth
          : 0,
      height: allocatedHeight,
      compactPopup: compactPopupLayoutMode,
    });
    const layoutProfileClass = this._layoutProfileClassNames(layoutProfile);
    const layoutProfileStyle = this._layoutProfileStyleVars(layoutProfile);
    const performanceProfile = this._performanceProfile();
    const performanceMode = this._performanceModeEnabled();
    const performanceUltraLite = this._performanceUltraLiteEnabled();
    this.classList.toggle("compact-popup-open", compactEdgeToEdgePopupMode);
    this.classList.toggle("compact-window-popup-open", compactWindowPopupMode);
    this.classList.toggle("mobile-edge-to-edge-open", mobileEdgeToEdgeMode);
    this.classList.remove("compact-inline-popup-open");
    this.classList.toggle("compact-tile-open", compactMode && compactTileMode);
    this.classList.toggle("compact-menu-open", this._compactMenuOverlayOpen());
    const nightMode = this._mobileNightMode();
    const nightActive = this._isNightModeActive();
    const sleepTimerActive = this._sleepTimerRemainingMs() > 0;
    const showUpNext = this._mobileShowUpNextEnabled();
    const hasUpNextItem = !!this._mobileUpNextItem();
    const showUpNextInline = showUpNext && hasUpNextItem;
    const showNightRow = nightMode !== "off";
    const tabletAutoFit = this._tabletAutoFitEnabled();
    const tabletDenseUi = this._tabletAutoFitDense(showNightRow, showUpNextInline)
      || (layoutMode === "tablet" && layoutProfile.heightSize === "short");
    const mobileDenseContent = this._mobileContentDense(layoutMode, layoutProfile, {
      showNightRow,
      showUpNextInline,
    });
    const fullInlineTargetHeight = this._fullMobileInlineTargetHeight();
    const height = Math.max(280, Math.min(2200, Math.round(allocatedHeight || (mobileLayoutMode === "full" ? fullInlineTargetHeight : fallbackHeight))));
    const minCardHeight = layoutProfile.heightSize === "short" ? 280 : (layoutMode === "tablet" ? 420 : 360);
    const hostMinWidth = layoutMode === "tablet" ? "min(calc(100vw - 32px), 720px)" : "0px";
    const screensaverClockSize = this._screensaverClockSize();
    const screensaverClockX = this._screensaverClockX();
    const screensaverClockY = this._screensaverClockY();
    const screensaverControlButtons = this._screensaverControlButtons();
    const screensaverActionButtonsHtml = screensaverControlButtons
      .filter((value) => value !== "like")
      .map((value) => this._screensaverControlButtonHtml(value))
      .filter(Boolean)
      .join("");
    const screensaverLikeButtonHtml = screensaverControlButtons.includes("like")
      ? `<button class="screensaver-voice-btn screensaver-control-btn screensaver-like-btn ${this._currentMediaFavoriteState() ? "active" : ""}" id="screensaverLikeBtn" data-screensaver-control="like" title="${this._esc(this._i18n("ui.like_2"))}" aria-label="${this._esc(this._i18n("ui.like_2"))}">${this._iconSvg(this._currentMediaFavoriteState() ? "heart_filled" : "heart_outline")}</button>`
      : "";
    const compactTransition = String(this._state.mobileCompactTransition || "");
    const compactTransitionClass = compactTransition === "expand"
      ? " compact-transition-expand"
      : compactTransition === "collapse"
        ? " compact-transition-collapse"
        : "";
    this._renderedLayoutMode = layoutMode;
    this._lastCardWidth = Math.max(0, Math.round(layoutProfile.width || this._lastCardWidth || 0));
    this._lastCardHeight = Math.max(0, Math.round(height || this._lastCardHeight || 0));
    this._state.mobileNightRenderedActive = nightActive;
    this._state.mobileNightRenderedMode = nightMode;
    const nightQuickRowHtml = showNightRow ? `
      <div class="night-quick-row ${nightMode === "auto" ? "auto-mode" : "on-mode"}" id="nightQuickRow" ${showNightRow ? "" : "hidden"}>
        <button class="night-quick-btn icon-only ${nightActive || nightMode === "on" ? "active" : "soft"}" id="nightModeQuickBtn" title="${this._esc(this._i18n("ui.night_mode"))}">
          ${this._iconSvg("moon")}
        </button>
        <button class="night-quick-btn icon-only ${sleepTimerActive ? "active" : ""}" id="nightSleepBtn" title="${this._esc(this._i18n("ui.sleep_timer"))}" ${nightMode === "on" ? "" : "hidden"}>
          ${this._iconSvg("timer")}
        </button>
        <button class="night-quick-btn icon-only soft" id="nightChillBtn" title="${this._esc(this._i18n("ui.chill_mix"))}" ${nightMode === "on" ? "" : "hidden"}>
          ${this._iconSvg("wand")}
        </button>
      </div>` : ``;
    const playerFocusCoreHtml = `
        <button class="player-focus" id="activePlayerChip" title="${this._i18n("ui.choose_player")}">
          ${immersiveDesign ? `<span class="immersive-player-symbol" aria-hidden="true">${this._iconSvg("speaker")}</span>` : ""}
          <span class="player-focus-copy">
            <span class="player-focus-name" id="selectedPlayerTitle">${this._i18n("ui.selected_player")}</span>
            <span class="player-focus-tags" id="selectedPlayerTags"></span>
          </span>
          <span class="player-focus-art-wrap" aria-hidden="true">
            <span class="player-focus-art" id="selectedPlayerThumb"></span>
          </span>
          ${immersiveDesign ? `<span class="immersive-player-chevron" aria-hidden="true">${this._iconSvg("down")}</span>` : ""}
        </button>
      `;
    const playerFocusHtml = playerFocusCoreHtml;
    const hotelMode = this._isHotelMode();
    const volumeMode = hotelMode || immersiveDesign ? "always" : (layoutMode === "tablet" ? this._mobileVolumeMode() : "always");
    const mainBarItems = this._mobileMainBarItems();
    const configuredQuickActions = this._mobileVisibleQuickActions(this._mobileQuickActions());
    const quickActions = configuredQuickActions;
    const quickActionsWithVoice = quickActions;
    const quickActionsWithHome = quickActionsWithVoice;
    const quickActionsWithPower = this._mobileActionsWithAuxiliary(quickActionsWithHome);
    const controlRoomEnabled = this._controlRoomEnabled();
    const studioShortcutEnabled = this._mobileStudioShortcutEnabled();
    const mainBarButtons = [];
    if (!hotelMode && controlRoomEnabled && studioShortcutEnabled) {
      mainBarButtons.push(`<button class="footer-btn control-room-entry" data-mainbar-action="control_room" title="${this._controlRoomLabel()}">${this._mobileFooterButtonInner("grid", this._controlRoomLabel())}</button>`);
    }
    if (mainBarItems.includes("actions")) {
      mainBarButtons.push(`<button class="footer-btn" data-mainbar-action="actions" title="${this._i18n("ui.actions_2")}">${this._mobileFooterButtonInner("menu", this._i18n("ui.actions_2"))}</button>`);
    }
    if (mainBarItems.includes("players")) {
      mainBarButtons.push(`<button class="footer-btn" data-mainbar-action="players" title="${this._i18n("ui.players")}">${this._mobileFooterButtonInner("speaker", this._i18n("ui.players"))}</button>`);
    }
    if (mainBarItems.includes("library")) {
      mainBarButtons.push(`<button class="footer-btn soft-accent" data-mainbar-action="library" title="${this._i18n("ui.library")}">${this._mobileFooterButtonInner("library_music", this._i18n("ui.library"))}</button>`);
    }
    if (mainBarItems.includes("search")) {
      mainBarButtons.push(`<button class="footer-btn" data-mainbar-action="search" title="${this._i18n("ui.search")}">${this._mobileFooterButtonInner("search", this._i18n("ui.search"))}</button>`);
    }
    if (mainBarItems.includes("settings")) {
      mainBarButtons.push(`<button class="footer-btn accent" data-mainbar-action="settings" title="${this._i18n("ui.settings")}">${this._mobileFooterButtonInner("settings", this._i18n("ui.settings"))}</button>`);
    }
    if (mainBarItems.includes("theme")) {
      mainBarButtons.push(`<button class="footer-btn" data-mainbar-action="theme" title="${this._i18n("ui.theme_2")}">${this._mobileThemeFooterInner()}</button>`);
    }
    const volumeStepButtonsEnabled = hotelMode || this._mobileVolumeStepButtonsEnabled();
    const volumeStepPercent = this._mobileVolumeStepPercent();
    const volumeDownButtonHtml = volumeStepButtonsEnabled
      ? `<button class="volume-step-btn volume-step-minus" id="mobileVolumeDownBtn" title="${this._esc(this._i18n("ui.volume_down"))}" aria-label="${this._esc(this._i18n("ui.volume_down"))}" data-volume-step="-1">${this._iconSvg("minus")}</button>`
      : ``;
    const volumeUpButtonHtml = volumeStepButtonsEnabled
      ? `<button class="volume-step-btn volume-step-plus" id="mobileVolumeUpBtn" title="${this._esc(this._i18n("ui.volume_up"))}" aria-label="${this._esc(this._i18n("ui.volume_up"))}" data-volume-step="1">${this._iconSvg("plus")}</button>`
      : ``;
    const volumeInlineClass = volumeStepButtonsEnabled ? " has-volume-step-buttons" : "";
    const volumeHtml = `
      <div class="mobile-volume-inline${layoutMode === "tablet" ? " tablet-volume-inline" : ""}${volumeInlineClass}" data-volume-step-percent="${this._esc(String(volumeStepPercent))}">
        <button class="volume-value" id="mobileVolPctLabel" title="${this._i18n("ui.volume_presets")}">50%</button>
        ${volumeDownButtonHtml}
        <div class="tablet-volume-track">
          <input class="volume-slider" id="volSlider" type="range" min="0" max="100" value="50" style="--vol-pct:50%">
        </div>
        ${volumeUpButtonHtml}
        <button class="volume-btn group-volume-btn" id="mobileGroupVolumeBtn" hidden title="${this._esc(this._i18n("ui.group_volume", {}, "Group volume"))}" aria-label="${this._esc(this._i18n("ui.group_volume", {}, "Group volume"))}">${this._iconSvg("speaker_group")}</button>
        <button class="volume-btn" id="btnMute" title="${this._i18n("ui.mute")}" aria-label="${this._i18n("ui.mute")}">${this._iconSvg("volume_high")}</button>
      </div>`;
    const compactCollapseFabHtml = compactPopupMode
      ? `<button class="compact-collapse-fab ${rtl ? "rtl" : "ltr"}" id="compactCollapseBtn" title="${this._i18n("ui.collapse_compact_player")}">${this._iconSvg("close")}</button>`
      : ``;
    const mobileEdgeCornerClass = rtl ? "rtl" : "ltr";
    const mobileEdgeOverlayOpen = !!(
      this._state.menuOpen
      || this._state.controlRoomOpen
      || this._state.screensaverOpen
      || this._state.mobileQueueActionEntry
      || this._state.mobileSmartVoice
    );
    const mobileEdgeExitHtml = mobileEdgeToEdgeMode && !mobileEdgeOverlayOpen
      ? `<button class="mobile-edge-corner-btn mobile-edge-exit ${mobileEdgeCornerClass}" id="mobileEdgeExitBtn" title="${this._esc(this._m("Exit edge-to-edge", "יציאה מקצה לקצה"))}" aria-label="${this._esc(this._m("Exit edge-to-edge", "יציאה מקצה לקצה"))}">${actionIconSvg(this, "minimize")}</button>`
      : ``;
    const mobileEdgeReturnHtml = !mobileEdgeOverlayOpen && !visualEditorContext && !compactPopupLayoutMode && !compactTileMode && layoutMode === "mobile" && !mobileEdgeToEdgeMode && this._mobileLayoutMode() === "full" && this._state.mobileEdgeReturnAvailable === true
      ? `<button class="mobile-edge-corner-btn mobile-edge-return ${mobileEdgeCornerClass}" id="mobileEdgeEnterBtn" title="${this._esc(this._m("Back to edge-to-edge", "חזרה לקצה לקצה"))}" aria-label="${this._esc(this._m("Back to edge-to-edge", "חזרה לקצה לקצה"))}">${actionIconSvg(this, "maximize")}</button>`
      : ``;
    const homeShortcutFabHtml = ``;
    const historyEdgeClass = rtl ? "left-edge" : "right-edge";
    const footerButtons = [...mainBarButtons, mobileEdgeExitHtml || mobileEdgeReturnHtml].filter(Boolean);
    const footerHtml = footerButtons.length
      ? `<div class="footer-nav count-${footerButtons.length}">${footerButtons.join("")}</div>`
      : "";
    const historyToggleButtonHtml = !compactTileMode
      ? `<button class="history-toggle-fab ${layoutMode === "tablet" ? "tablet-history-fab history-drawer-fab" : ""} ${historyEdgeClass}" id="historyToggleFab" title="${this._i18n("ui.recently_played_2")}" aria-expanded="false" hidden>${this._iconSvg(layoutMode === "tablet" ? "drawer_handle" : "history")}</button>`
      : ``;
    const floatingHistoryToggleFabHtml = layoutMode === "tablet" && quickActionsWithPower.includes("history") ? historyToggleButtonHtml : ``;
    const mobileHistoryToggleButtonHtml = layoutMode !== "tablet" && quickActionsWithPower.includes("history") ? historyToggleButtonHtml : ``;
    const sleepTimerCornerMarkup = !compactTileMode ? `
      <div class="sleep-timer-corner ${rtl ? "left" : "right"}" id="sleepTimerCorner" hidden></div>
    ` : ``;
    const floatingSleepTimerCornerHtml = layoutMode === "tablet" && (quickActionsWithPower.includes("timer") || sleepTimerActive) ? sleepTimerCornerMarkup : ``;
    const tabletBrandWatermarkHtml = layoutMode === "tablet" && !compactTileMode
      ? `<div class="tablet-brand-watermark" aria-hidden="true">${this._tabletBrandSignatureHtml()}</div>`
      : ``;
    const mobileBrandSignatureHtml = layoutMode !== "tablet" && !compactTileMode
      ? `<div class="mobile-brand-signature" aria-hidden="true">${this._tabletBrandSignatureHtml("mobile-brand-logo")}</div>`
      : ``;
    const quickActionsInArtRow = layoutMode === "tablet"
      ? quickActionsWithPower.filter((action) => action !== "history" && action !== "timer")
      : quickActionsWithPower;
    const mobileQuickActionsHtml = this._mobileQuickActionButtonsHtml(mobileHistoryToggleButtonHtml, quickActionsInArtRow);
    const controlRoomBackdropHtml = !hotelMode && controlRoomEnabled ? `
      <div class="control-room-backdrop" id="controlRoomBackdrop">
        <div class="control-room-shell">
          <div class="control-room-head">
            <div class="control-room-head-brand" aria-hidden="true">${this._tabletBrandSignatureHtml("control-room-head-logo")}</div>
            <button class="control-room-close" id="controlRoomCloseBtn" title="${this._esc(this._i18n("ui.close"))}">${this._iconSvg("close")}</button>
          </div>
          <div class="control-room-body-host" id="controlRoomBody"></div>
        </div>
      </div>
    ` : ``;
    const compactTileHtml = `
      <div class="compact-shell premium-player-tile">
        <div class="compact-backdrop-art" id="compactBackdropArt"></div>
        <div class="compact-backdrop-shade"></div>
        <div class="compact-sheen"></div>
        <div class="compact-content">
          <div class="compact-header">
            <button class="compact-expand-btn compact-expand-ref" id="compactExpandBtn" title="${this._i18n("ui.expand_player")}">
              ${this._iconSvg("fullscreen")}
            </button>
            <button class="compact-player-chip" id="activePlayerChip" title="${this._i18n("ui.choose_player")}">
              <span class="compact-player-copy">
                <span class="compact-player-label" id="selectedPlayerTitle">${this._i18n("ui.selected_player")}</span>
              </span>
            </button>
          </div>
          <div class="compact-stage">
            <div class="compact-cover-wrap">
              <div class="compact-brand-signature" aria-hidden="true">${this._tabletBrandSignatureHtml("compact-brand-logo")}</div>
              <div class="art-source-badges compact-source-badges" data-art-source-badges hidden></div>
              <div class="compact-cover-echo" id="compactCoverAura"></div>
              <button class="compact-cover" id="npArt" title="${this._i18n("ui.play_artwork_action")}">
                <img class="compact-cover-image" id="compactCoverImage" alt="">
                <span class="compact-cover-placeholder">${this._artPlaceholderHtml("album")}</span>
              </button>
            </div>
            <div class="compact-main">
              <div class="compact-copy">
                <div class="compact-title np-title" id="npTitle">${this._i18n("ui.nothing_playing")}</div>
                <div class="compact-sub np-sub" id="npSub">—</div>
                <button class="up-next-inline compact-up-next" data-up-next-inline hidden>
                  <span class="up-next-art"></span>
                  <span class="up-next-line">
                    <span class="up-next-prefix">${this._i18n("ui.up_next_2")}</span>
                    <span class="up-next-title"></span>
                  </span>
                </button>
                ${nightQuickRowHtml}
              </div>
            </div>
          </div>
          <div class="compact-controls">
            <button class="side-btn compact-control-btn" id="btnPrev" title="${this._i18n("ui.previous")}" aria-label="${this._i18n("ui.previous")}">${this._iconSvg("previous")}</button>
            <button class="main-btn compact-main-btn" id="btnPlay">${this._iconSvg("play")}</button>
            <button class="side-btn compact-control-btn" id="btnNext" title="${this._i18n("ui.next")}" aria-label="${this._i18n("ui.next")}">${this._iconSvg("next")}</button>
          </div>
          <div class="compact-progress-row">
            <span class="compact-progress-time" id="bigCurTime">0:00</span>
            <div class="progress compact-progress-track" id="progressBar"><div class="progress-fill" id="progressFill"></div></div>
            <span class="compact-progress-time" id="bigTotalTime">0:00</span>
          </div>
          <div class="compact-volume-inline${volumeInlineClass}" data-volume-step-percent="${this._esc(String(volumeStepPercent))}">
            <button class="volume-btn compact-mute-btn" id="btnMute" title="${this._i18n("ui.mute")}" aria-label="${this._i18n("ui.mute")}">${this._iconSvg("volume_high")}</button>
            <button class="volume-btn group-volume-btn compact-group-volume-btn" id="compactGroupVolumeBtn" hidden title="${this._esc(this._i18n("ui.group_volume", {}, "Group volume"))}" aria-label="${this._esc(this._i18n("ui.group_volume", {}, "Group volume"))}">${this._iconSvg("speaker_group")}</button>
            ${volumeDownButtonHtml}
            <div class="tablet-volume-track compact-volume-track">
              <input class="volume-slider compact-volume-slider" id="volSlider" type="range" min="0" max="100" value="50" style="--vol-pct:50%">
            </div>
            ${volumeUpButtonHtml}
            <button class="volume-value compact-volume-value" id="mobileVolPctLabel" title="${this._i18n("ui.volume_presets")}">50%</button>
          </div>
        </div>
      </div>`;
    const centerHtml = `
      <div class="center">
        <div class="hero-aura" id="mobileHeroAura"></div>
        ${layoutMode === "tablet" && !immersiveDesign ? `` : `<div class="hero-mobile-top">${playerFocusHtml}</div>`}
        <div class="hero-split-shell">
          <div class="hero-visual">
            <div class="art-stage">
              <div class="art-aura" id="mobileArtAura"></div>
              <div class="mobile-art-shell" id="mobileArtShell">
                <div class="art-source-badges" data-art-source-badges hidden></div>
                <div class="art-stack-view${coverFlowMode ? " cover-flow-mode" : ""}" id="npArt">
                  ${this._mobileArtworkStackHtml()}
                </div>
              </div>
            </div>
          </div>
          <div class="hero-info">
            <div class="hero-copy">
              <div class="hero-title np-title" id="npTitle">${this._i18n("ui.nothing_playing")}</div>
              <div class="hero-sub np-sub" id="npSub">—</div>
              <button class="up-next-inline hero-up-next" data-up-next-inline hidden>
                <span class="up-next-art"></span>
                <span class="up-next-line">
                  <span class="up-next-prefix">${this._i18n("ui.up_next_2")}</span>
                  <span class="up-next-title"></span>
                </span>
              </button>
            </div>
            <div class="mobile-action-row-wrap">
              <div class="mobile-art-actions count-${Math.max(1, quickActionsInArtRow.length)}" id="mobileArtActions">
                ${mobileQuickActionsHtml}
              </div>
            </div>
            ${nightQuickRowHtml}
          </div>
        </div>
      </div>`;
    const bottomHtml = `
        <div class="bottom">
        <div class="notice" id="mobileNotice"></div>
        <div class="empty-quick-shelf" id="emptyQuickShelf" hidden></div>
        <div class="progress-line">
          <span class="progress-time" id="bigCurTime">0:00</span>
          <div class="progress" id="progressBar"><div class="progress-fill" id="progressFill"></div></div>
          <span class="progress-time" id="bigTotalTime">0:00</span>
        </div>
        <div class="controls">
          <button class="side-btn minor-btn" id="mobileShuffleBtn">${this._iconSvg("shuffle")}</button>
          <button class="side-btn" id="btnPrev" title="${this._i18n("ui.previous")}" aria-label="${this._i18n("ui.previous")}">${this._iconSvg("previous")}</button>
          <button class="main-btn" id="btnPlay">${this._iconSvg("play")}</button>
          <button class="side-btn" id="btnNext" title="${this._i18n("ui.next")}" aria-label="${this._i18n("ui.next")}">${this._iconSvg("next")}</button>
          ${volumeMode === "button" ? `<button class="side-btn" id="controlVolumeBtn">${this._iconSvg("volume_high")}</button>` : ``}
          <button class="side-btn minor-btn" id="mobileRepeatBtn">${this._iconSvg("repeat")}</button>
        </div>
        ${volumeMode === "always" ? volumeHtml : ``}
      </div>`;
    const tabletNavRailHtml = `<aside class="tablet-rail">${playerFocusHtml}${footerHtml}</aside>`;
    const tabletStageHtml = rtl
      ? `<div class="tablet-shell"><div class="tablet-main">${centerHtml}${bottomHtml}</div>${tabletNavRailHtml}</div>`
      : `<div class="tablet-shell">${tabletNavRailHtml}<div class="tablet-main">${centerHtml}${bottomHtml}</div></div>`;

    this.shadowRoot.innerHTML = `
      <style>${buildCardStyles({ hostMinWidth, height, minCardHeight, fontScale: this._state.mobileFontScale || 1, iconScale: mobileIconScale.toFixed(2), customRgb: this._customRgb(), customText: this._customTextColor(), customColor: this._state.mobileCustomColor || "#e0a11b", fullInlineTargetHeight })}</style>
      <div class="card ${rtl ? "rtl" : ""} theme-${visualTheme} layout-${layoutMode}${layoutProfileClass ? ` ${layoutProfileClass}` : ""} mobile-layout-${mobileLayoutMode}${mobileLayoutMode === "full" ? " mobile-layout-forced-full" : ""}${mobileLayoutMode === "compact" ? " mobile-layout-forced-compact" : ""}${mobileEdgeToEdgeMode ? " mobile-edge-to-edge" : ""} performance-profile-${performanceProfile}${performanceMode ? " performance-lite" : ""}${performanceUltraLite ? " performance-ultra-lite" : ""}${hotelMode ? " hotel-mode" : ""}${compactTileMode ? " compact-mode compact-collapsed" : compactMode ? " compact-expanded" : ""}${compactMiniWidget ? " compact-mini-widget" : ""}${this._compactMenuOverlayOpen() ? " compact-menu-open" : ""}${compactTransitionClass}${nightActive ? " night-mode" : ""}${showNightRow ? " night-mode-enabled" : ""}${tabletAutoFit ? " tablet-auto-fit" : ""}${tabletDenseUi ? " tablet-fit-dense" : ""}${showNightRow ? " tablet-fit-night" : ""}${showUpNextInline ? " tablet-fit-up-next" : ""}${mobileDenseContent ? " mobile-content-dense" : ""}${this._tabletStabilityModeEnabled() ? " tablet-stable" : ""}${!hotelMode && this._state.controlRoomOpen ? " control-room-open" : ""}${this._state.screensaverOpen ? " screensaver-active" : ""}" style="${layoutProfileStyle}--screensaver-clock-scale:${this._esc(screensaverClockSize.toFixed(2))};--screensaver-clock-x:${this._esc(screensaverClockX.toFixed(1))}%;--screensaver-clock-y:${this._esc(screensaverClockY.toFixed(1))}%;">
        <div class="bg" id="mobileBg"></div><div class="shade"></div><div class="glow"></div>
        ${compactCollapseFabHtml}
        ${homeShortcutFabHtml}
        ${immersiveDesign ? "" : mobileBrandSignatureHtml}
        ${floatingHistoryToggleFabHtml}
        ${floatingSleepTimerCornerHtml}
        ${immersiveDesign ? "" : tabletBrandWatermarkHtml}
        <div class="stage">
          ${compactTileMode ? compactTileHtml : immersiveDesign ? immersivePlayerStage(this, bottomHtml, mobileEdgeExitHtml + mobileEdgeReturnHtml) : (layoutMode === "tablet" ? tabletStageHtml : `${centerHtml}${bottomHtml}${footerHtml}`)}
        </div>
        <aside class="history-drawer ${historyEdgeClass}" id="historyDrawer" hidden>
          <div class="history-drawer-head">
            <div class="history-drawer-title-row">
              <div class="history-drawer-title-main">
                <div class="history-drawer-brand" aria-hidden="true">${this._tabletBrandSignatureHtml("queue-action-logo")}</div>
                <div class="history-drawer-title">${this._esc(this._i18n("ui.recently_played_2"))}</div>
              </div>
              <button class="history-drawer-close" id="historyDrawerCloseBtn" title="${this._esc(this._i18n("ui.close"))}">${this._iconSvg("close")}</button>
            </div>
            <div class="history-drawer-tabs" role="tablist" aria-label="${this._esc(this._i18n("ui.history_tabs"))}">
              <button class="history-tab active" data-history-tab="recent" role="tab" aria-selected="true">${this._esc(this._i18n("ui.recent"))}</button>
              <button class="history-tab" data-history-tab="recommendations" role="tab" aria-selected="false">${this._esc(this._i18n("ui.recommended"))}</button>
            </div>
          </div>
          <div class="history-drawer-body" id="historyDrawerBody"></div>
        </aside>
        ${controlRoomBackdropHtml}
        <div class="menu-backdrop${this._state.menuOpen ? " open" : ""}" id="mobileMenu">
          <div class="menu-sheet">
            <div class="menu-head">
              <button id="mobileMenuBackBtn" hidden title="${this._i18n("ui.back_2")}" aria-label="${this._i18n("ui.back_2")}">${this._iconSvg("back")}</button>
              <div class="menu-title" id="mobileMenuTitle"><span class="menu-title-brand" aria-hidden="true">${this._tabletBrandSignatureHtml("menu-title-logo")}</span><span class="menu-title-main"><span class="menu-title-text">${this._i18n("ui.menu")}</span></span></div>
              <button id="mobileMenuAuxBtn" class="menu-aux-btn" hidden title="${this._i18n("ui.liked")}">${this._iconSvg("heart_outline")}</button>
              <button id="mobileMenuCloseBtn" title="${this._i18n("ui.close")}" aria-label="${this._i18n("ui.close")}">${this._iconSvg("close")}</button>
            </div>
            <div class="menu-body" id="mobileMenuBody"></div>
          </div>
        </div>
        <div class="menu-backdrop" id="maConfirmModal">
          <div class="menu-sheet confirm-sheet">
            <div class="menu-head">
              <div></div>
              <div class="menu-title"><span class="menu-title-brand" aria-hidden="true">${this._tabletBrandSignatureHtml("menu-title-logo")}</span><span class="menu-title-main"><span class="menu-title-text">${this._i18n("ui.open_music_assistant_2")}</span></span></div>
              <button id="maConfirmCloseBtn" title="${this._i18n("ui.close")}">×</button>
            </div>
            <div class="menu-body">
              <div class="confirm-copy">${this._i18n("ui.open_the_full_music_assistant_interface")}</div>
              <div class="confirm-actions">
                <button class="menu-item" id="maConfirmContinueBtn">${this._i18n("ui.continue")}</button>
                <button class="menu-item" id="maConfirmCancelBtn">${this._i18n("ui.cancel")}</button>
              </div>
            </div>
          </div>
        </div>
        <div class="queue-action-backdrop" id="mobileQueueActionModal">
          <div class="queue-action-sheet" id="mobileQueueActionSheet"></div>
        </div>
        <div class="queue-action-backdrop" id="mobileVolumePresetModal">
          <div class="queue-action-sheet" id="mobileVolumePresetSheet"></div>
        </div>
        <div class="queue-action-backdrop clean-all-confirm-backdrop" id="cleanAllConfirmModal">
          <div class="queue-action-sheet clean-all-confirm-sheet" role="dialog" aria-modal="true" aria-labelledby="cleanAllConfirmTitle">
            <button class="clean-all-confirm-close" id="cleanAllConfirmCloseBtn" title="${this._esc(this._i18n("ui.close"))}" aria-label="${this._esc(this._i18n("ui.close"))}">×</button>
            <div class="clean-all-confirm-head">
              <span class="clean-all-confirm-icon danger-confirm-icon" aria-hidden="true">${this._iconSvg("close")}</span>
              <div class="clean-all-confirm-copy">
                <div class="clean-all-confirm-title" id="cleanAllConfirmTitle">${this._esc(this._cleanAllConfirmTitle())}</div>
                <div class="confirm-copy">${this._esc(this._cleanAllConfirmCopy())}</div>
              </div>
            </div>
            <div class="confirm-actions clean-all-confirm-actions">
              <button class="clean-all-confirm-btn danger-confirm-action" id="cleanAllConfirmContinueBtn">${this._esc(this._cleanAllLabel())}</button>
              <button class="clean-all-confirm-btn" id="cleanAllConfirmCancelBtn">${this._esc(this._i18n("ui.cancel"))}</button>
            </div>
          </div>
        </div>
        <div class="menu-backdrop" id="mobileSmartVoiceModal">
          <div class="menu-sheet confirm-sheet smart-voice-sheet" id="mobileSmartVoiceSheet"></div>
        </div>
        <div class="voice-assistant-dialog" id="voiceAssistantDialog" aria-live="polite"></div>
        <div class="hidden-tools"><select id="playerSel"></select><button id="themeToggleBtn"></button><button id="langBtn"></button><button id="maOpenBtn"></button><div id="content"></div></div>
        <audio id="homeiiLocalAudio" class="homeii-local-audio" playsinline aria-hidden="true"></audio>
        <div class="lyrics-backdrop" id="lyricsBackdrop"></div>
        <div class="screensaver-backdrop digital-mode" id="screensaverBackdrop" aria-hidden="true">
          <div class="screensaver-bg"></div>
          <div class="screensaver-brand" aria-hidden="true">${this._tabletBrandSignatureHtml("screensaver-brand-logo")}</div>
          ${screensaverActionButtonsHtml ? `<div class="screensaver-action-cluster" aria-hidden="false">${screensaverActionButtonsHtml}</div>` : ""}
          <div class="screensaver-shell">
            <div class="screensaver-art-wrap">
              <div class="screensaver-art" id="screensaverArt"></div>
              ${screensaverLikeButtonHtml}
            </div>
            <div class="screensaver-info">
              <div class="screensaver-clock" id="screensaverClock">00:00</div>
              <div class="screensaver-analog-clock" aria-hidden="true">
                <span class="screensaver-hand hour" id="screensaverHour"></span>
                <span class="screensaver-hand minute" id="screensaverMinute"></span>
                <span class="screensaver-hand second" id="screensaverSecond"></span>
                <span class="screensaver-pin"></span>
              </div>
              <div class="screensaver-track">
                <div class="screensaver-title" id="screensaverTitle">${this._esc(this._i18n("ui.nothing_playing"))}</div>
                <div class="screensaver-artist" id="screensaverArtist"></div>
              </div>
              <div class="screensaver-lyrics" id="screensaverLyrics" aria-live="polite"></div>
              <div class="screensaver-next" id="screensaverNext" hidden>
                <span class="screensaver-next-label" id="screensaverNextLabel">${this._esc(this._i18n("ui.up_next_2"))}</span>
                <span class="screensaver-next-main">
                  <span class="screensaver-next-art" id="screensaverNextArt"></span>
                  <span class="screensaver-next-copy">
                    <span class="screensaver-next-title" id="screensaverNextTitle"></span>
                    <span class="screensaver-next-artist" id="screensaverNextArtist"></span>
                  </span>
                </span>
              </div>
              <div class="screensaver-message" id="screensaverMessage" hidden></div>
            </div>
          </div>
        </div>
        <div class="toast-wrap" id="toastWrap"></div>
        <div class="surprise-popup" id="surprisePopup"></div>
      </div>
    `;

    this._applyDynamicThemeStyles();
    this._applyBackgroundMotionStyles();
    this._setHistoryDrawerOpen(this._state.mobileHistoryDrawerOpen);
    this._syncRecentHistoryUi(true);
    this._syncSleepTimerChip();
    this._syncControlRoomUi();
    this._syncVoiceAssistantDialog();
    this._restoreMobileMenuAfterBuild("build");
    const cardEl = this.shadowRoot.querySelector(".card");
    cardEl?.addEventListener("pointerdown", this._boundScreensaverActivity, { passive: false });
    cardEl?.addEventListener("keydown", this._boundScreensaverActivity);
    this.$("screensaverBackdrop")?.addEventListener("click", this._boundScreensaverActivity);
    this.$("screensaverVoiceBtn")?.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      e.stopPropagation();
    }, { passive: false });
    this.$("screensaverVoiceBtn")?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!this._pressUiButton(e.currentTarget, [8, 18, 8])) return;
      this._startVoiceAssistantCommand({ keepScreensaver: true, ignoreWhenListening: true });
    });
    ["screensaverPrevBtn", "screensaverPlayPauseBtn", "screensaverNextBtn", "screensaverMuteBtn", "screensaverPowerBtn", "screensaverLikeBtn", "screensaverLyricsBtn", "screensaverLyricsSyncBtn", "screensaverLyricsFontMinusBtn", "screensaverLyricsFontPlusBtn"].forEach((id) => {
      this.$(id)?.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        e.stopPropagation();
      }, { passive: false });
    });
    this.$("screensaverPrevBtn")?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!this._pressUiButton(e.currentTarget)) return;
      this._playerCmd("previous");
    });
    this.$("screensaverPlayPauseBtn")?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!this._pressUiButton(e.currentTarget)) return;
      this._togglePlay();
    });
    this.$("screensaverNextBtn")?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!this._pressUiButton(e.currentTarget)) return;
      this._playerCmd("next");
    });
    this.$("screensaverMuteBtn")?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!this._pressUiButton(e.currentTarget)) return;
      this._toggleMute();
    });
    this.$("screensaverPowerBtn")?.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!this._pressUiButton(e.currentTarget, [12, 18])) return;
      await this._runAuxiliaryButtonAction(0, { force: true });
    });
    this.$("screensaverLyricsBtn")?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!this._pressUiButton(e.currentTarget)) return;
      const overlay = this.$("screensaverBackdrop");
      if (overlay?.classList?.contains("lyrics-mode")) {
        this._state.screensaverLyricsOpen = false;
        if (!this._state.lyricsOpen) this._clearLyricsState?.();
        this._syncScreensaverUi();
        return;
      }
      if (!this._getSelectedPlayer()) return;
      this._state.screensaverLyricsOpen = true;
      this._syncLyricsForCurrentTrack?.();
      this._syncScreensaverUi();
    });
    this.$("screensaverLyricsSyncBtn")?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!this._pressUiButton(e.currentTarget)) return;
      this._toggleLyricsSyncEnabled();
      this._syncScreensaverUi();
    });
    this.$("screensaverLyricsFontMinusBtn")?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!this._pressUiButton(e.currentTarget)) return;
      this._nudgeLyricsFontScale(-0.08);
      this._syncScreensaverUi();
    });
    this.$("screensaverLyricsFontPlusBtn")?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!this._pressUiButton(e.currentTarget)) return;
      this._nudgeLyricsFontScale(0.08);
      this._syncScreensaverUi();
    });
    this.$("screensaverLikeBtn")?.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!this._pressUiButton(e.currentTarget)) return;
      await this._toggleLikeCurrentMedia(e.currentTarget);
    });
    if (this._screensaverPageEntryPending) {
      this._screensaverPageEntryPending = false;
      this._resetScreensaverTimer({ hide: true, activity: true });
    } else {
      this._resetScreensaverTimer();
      this._restoreScreensaverIfOpen();
    }
    this.$("btnPlay")?.addEventListener("click", () => this._togglePlay());
    this.$("btnPrev")?.addEventListener("click", () => this._playerCmd("previous"));
    this.$("btnNext")?.addEventListener("click", () => this._playerCmd("next"));
    this.$("mobileShuffleBtn")?.addEventListener("click", () => this._toggleShuffle());
    this.$("mobileRepeatBtn")?.addEventListener("click", () => this._toggleRepeat());
    this.$("btnMute")?.addEventListener("click", () => this._toggleMute());
    this.shadowRoot.querySelectorAll(".group-volume-btn").forEach((btn) => btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!this._pressUiButton(e.currentTarget)) return;
      this._openGroupVolumeShortcut();
    }));
    this.shadowRoot.querySelectorAll("[data-volume-step]").forEach((btn) => btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!this._pressUiButton(e.currentTarget)) return;
      this._stepSelectedVolume(Number(e.currentTarget.dataset.volumeStep || 0));
    }));
    this.$("controlVolumeBtn")?.addEventListener("click", () => this._openTabletVolumePopup());
    this.$("compactExpandBtn")?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!this._pressUiButton(e.currentTarget)) return;
      this._setCompactExpanded(true);
    });
    this.$("compactCollapseBtn")?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!this._pressUiButton(e.currentTarget)) return;
      this._setCompactExpanded(false);
    });
    this.$("mobileEdgeExitBtn")?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!this._pressUiButton(e.currentTarget)) return;
      this._exitMobileEdgeToEdge();
    });
    this.$("mobileEdgeEnterBtn")?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!this._pressUiButton(e.currentTarget)) return;
      this._enterMobileEdgeToEdge();
    });
    this._bindMobileQuickActionButtons();
    this.shadowRoot.querySelectorAll("[data-up-next-inline]").forEach((btn) => btn.addEventListener("click", async (e) => {
      if (!this._pressUiButton(e.currentTarget)) return;
      await this._playMobileUpNext();
    }));
    this.$("nightModeQuickBtn")?.addEventListener("click", (e) => {
      if (!this._pressUiButton(e.currentTarget)) return;
      this._cycleNightMode();
    });
    this.$("nightSleepBtn")?.addEventListener("click", async (e) => {
      if (!this._pressUiButton(e.currentTarget)) return;
      await this._cycleSleepTimer("night");
    });
    this.$("nightChillBtn")?.addEventListener("click", async (e) => {
      if (!this._pressUiButton(e.currentTarget)) return;
      await this._playNightMix();
    });
    this.$("homeShortcutFab")?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (this._state.controlRoomOpen || this._homeShortcutNavigationSuppressed()) return;
      if (!this._pressUiButton(e.currentTarget)) return;
      this._goHomeAssistantDashboard();
    });
    this.$("historyDrawer")?.addEventListener("click", async (e) => {
      const closeBtn = e.target.closest("#historyDrawerCloseBtn");
      if (closeBtn) {
        e.preventDefault();
        e.stopPropagation();
        this._setHistoryDrawerOpen(false);
        return;
      }
      const playAllBtn = e.target.closest("[data-history-play-all]");
      if (playAllBtn) {
        e.preventDefault();
        e.stopPropagation();
        if (!this._pressUiButton(playAllBtn)) return;
        const tab = this._state.mobileHistoryDrawerTab === "recommendations" ? "recommendations" : "recent";
        const items = tab === "recommendations" ? this._historyRecommendationItems() : this._visibleRecentHistoryItems();
        const playable = this._historyPlayableItems(items);
        if (!playable.length) {
          this._toastError(this._i18n("ui.no_results_found"));
          return;
        }
        await this._playAll(playable, false);
        this._setHistoryDrawerOpen(false);
        return;
      }
      const tabBtn = e.target.closest("[data-history-tab]");
      if (!tabBtn) return;
      e.preventDefault();
      e.stopPropagation();
      this._state.mobileHistoryDrawerTab = tabBtn.dataset.historyTab === "recommendations" ? "recommendations" : "recent";
      this._state.mobileHistoryRenderedHtml = "";
      this._syncRecentHistoryUi();
    });
    this.$("sleepTimerCorner")?.addEventListener("click", async (e) => {
      const chipBtn = e.target.closest("#sleepTimerChip");
      if (chipBtn) {
        if (!this._pressUiButton(chipBtn)) return;
        this._toggleSleepTimerMenu();
        return;
      }
      const addBtn = e.target.closest("[data-sleep-timer-add]");
      if (addBtn) {
        await this._addSleepTimerMinutes(Number(addBtn.dataset.sleepTimerAdd || 15));
        this._toggleSleepTimerMenu(false);
        return;
      }
      const clearBtn = e.target.closest("[data-sleep-timer-clear]");
      if (clearBtn) {
        await this._clearSleepTimer(true);
        return;
      }
      const closeBtn = e.target.closest("[data-sleep-timer-close]");
      if (closeBtn) {
        this._toggleSleepTimerMenu(false);
      }
    });
    this.$("controlRoomCloseBtn")?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopImmediatePropagation?.();
      e.stopPropagation();
      this._suppressHomeShortcutNavigation();
      if (!this._pressUiButton(e.currentTarget)) return;
      this._closeControlRoom();
    });
    const keepControlRoomScroll = (e) => {
      if (e.target?.closest?.("[data-control-room-scroll]")) e.stopPropagation();
    };
    this.$("controlRoomBackdrop")?.addEventListener("wheel", keepControlRoomScroll, { passive: true });
    this.$("controlRoomBackdrop")?.addEventListener("touchmove", keepControlRoomScroll, { passive: true });
    this.$("controlRoomBackdrop")?.addEventListener("click", async (e) => {
      if (e.target?.id === "controlRoomBackdrop") {
        e.preventDefault();
        e.stopPropagation();
        if (!this._state.controlRoomOpen) {
          this._syncControlRoomChrome();
          return;
        }
        this._closeControlRoom();
        return;
      }
      const selectBtn = e.target.closest("[data-room-select]");
      if (selectBtn) {
        e.preventDefault();
        e.stopPropagation();
        this._pressUiButton(selectBtn);
        const entityId = selectBtn.dataset.roomSelect;
        const result = this._toggleControlRoomPlayerSelection(entityId);
        const name = this._controlRoomPlayerName(entityId);
        if (result === "kept") {
          this._toast(this._i18n("ui.at_least_one_player_must_stay_selected"));
        } else {
          this._toastSuccess(result === "removed"
            ? this._m(`${name} removed from studio selection`, `${name} הוסר מבחירת הסטודיו`)
            : this._m(`${name} added to studio selection`, `${name} נוסף לבחירת הסטודיו`));
        }
        return;
      }
      const primaryBtn = e.target.closest("[data-room-primary]");
      if (primaryBtn) {
        e.preventDefault();
        e.stopPropagation();
        this._pressUiButton(primaryBtn);
        const entityId = primaryBtn.dataset.roomPrimary;
        this._setControlRoomPrimary(entityId);
        this._toastSuccess(this._m(
          `Studio is now controlling ${this._controlRoomPlayerName(entityId)}`,
          `הסטודיו שולט כעת בנגן ${this._controlRoomPlayerName(entityId)}`
        ));
        return;
      }
      const playBtn = e.target.closest("[data-room-toggle-play]");
      if (playBtn) {
        e.preventDefault();
        e.stopPropagation();
        this._pressUiButton(playBtn);
        const entityId = playBtn.dataset.roomTogglePlay;
        const player = this._playerByEntityId(entityId);
        try {
          await this._togglePlayFor(entityId);
          this._toastSuccess(player?.state === "playing"
            ? this._m(`${this._controlRoomPlayerName(entityId)} paused`, `${this._controlRoomPlayerName(entityId)} הושהה`)
            : this._m(`${this._controlRoomPlayerName(entityId)} started playing`, `${this._controlRoomPlayerName(entityId)} התחיל לנגן`));
          setTimeout(() => this._updateNowPlayingState(), 250);
        } catch (error) {
          this._toastError(error?.message || this._i18n("ui.playback_command_failed_2"));
        }
        return;
      }
      const nextBtn = e.target.closest("[data-room-next]");
      if (nextBtn) {
        e.preventDefault();
        e.stopPropagation();
        this._pressUiButton(nextBtn);
        const entityId = nextBtn.dataset.roomNext;
        try {
          await this._playerCmdFor(entityId, "next");
          this._toastSuccess(this._m(`${this._controlRoomPlayerName(entityId)} skipped to next`, `${this._controlRoomPlayerName(entityId)} עבר לרצועה הבאה`));
          setTimeout(() => this._updateNowPlayingState(), 250);
        } catch (error) {
          this._toastError(error?.message || this._i18n("ui.next_track_failed"));
        }
        return;
      }
      const muteBtn = e.target.closest("[data-room-mute]");
      if (muteBtn) {
        e.preventDefault();
        e.stopPropagation();
        this._pressUiButton(muteBtn);
        const entityId = muteBtn.dataset.roomMute;
        const wasMuted = this._isMuted(this._playerByEntityId(entityId));
        try {
          if (!await this._toggleMuteFor(entityId)) return;
          this._toastSuccess(wasMuted
            ? this._m(`${this._controlRoomPlayerName(entityId)} unmuted`, `${this._controlRoomPlayerName(entityId)} בוטלה ההשתקה`)
            : this._m(`${this._controlRoomPlayerName(entityId)} muted`, `${this._controlRoomPlayerName(entityId)} הושתק`));
          setTimeout(() => this._updateNowPlayingState(), 160);
        } catch (error) {
          this._toastError(error?.message || this._i18n("ui.mute_command_failed"));
        }
        return;
      }
      const transferSourceBtn = e.target.closest("[data-room-transfer-source]");
      if (transferSourceBtn) {
        e.preventDefault();
        e.stopPropagation();
        this._pressUiButton(transferSourceBtn);
        this._state.controlRoomTransferSource = transferSourceBtn.dataset.roomTransferSource || "";
        this._syncControlRoomTransferDefaults();
        this._syncControlRoomUi();
        this._toast(this._m(
          `Transfer source: ${this._controlRoomPlayerName(this._state.controlRoomTransferSource)}`,
          `מקור להעברה: ${this._controlRoomPlayerName(this._state.controlRoomTransferSource)}`
        ));
        return;
      }
      const transferTargetBtn = e.target.closest("[data-room-transfer-target]");
      if (transferTargetBtn) {
        e.preventDefault();
        e.stopPropagation();
        this._pressUiButton(transferTargetBtn);
        const targetId = transferTargetBtn.dataset.roomTransferTarget || "";
        if (targetId && targetId !== this._state.controlRoomTransferSource) {
          this._state.controlRoomTransferTarget = targetId;
          this._syncControlRoomUi();
          this._toast(this._m(
            `Transfer target: ${this._controlRoomPlayerName(targetId)}`,
            `יעד להעברה: ${this._controlRoomPlayerName(targetId)}`
          ));
        }
        return;
      }
      const transferBtn = e.target.closest("[data-room-transfer]");
      if (transferBtn) {
        e.preventDefault();
        e.stopPropagation();
        this._pressUiButton(transferBtn);
        const ok = await this._transferQueueBetween(this._state.controlRoomTransferSource, this._state.controlRoomTransferTarget, { silent: true });
        if (ok) this._state.controlRoomPanel = "";
        if (ok) this._toastSuccess(this._i18n("ui.queue_transferred"));
        else this._toastError(this._i18n("ui.could_not_transfer_the_queue"));
        setTimeout(() => this._updateNowPlayingState(), 300);
        return;
      }
      const cloneBtn = e.target.closest("[data-room-clone]");
      if (cloneBtn) {
        e.preventDefault();
        e.stopPropagation();
        this._pressUiButton(cloneBtn);
        const ok = await this._cloneQueueBetween(this._state.controlRoomTransferSource, this._state.controlRoomTransferTarget, { silent: true });
        if (ok) this._toastSuccess(this._i18n("ui.queue_cloned"));
        else this._toastError(this._i18n("ui.could_not_clone_the_queue"));
        setTimeout(() => this._updateNowPlayingState(), 300);
        return;
      }
      const refreshQueuesBtn = e.target.closest("[data-room-refresh-queues]");
      if (refreshQueuesBtn) {
        e.preventDefault();
        e.stopPropagation();
        this._pressUiButton(refreshQueuesBtn);
        await this._loadControlRoomQueues([
          this._state.controlRoomTransferSource,
          this._state.controlRoomTransferTarget,
          ...this._controlRoomSelectedPlayerIds(),
        ].filter(Boolean));
        this._toastSuccess(this._i18n("ui.queues_refreshed"));
        return;
      }
      const clearQueueBtn = e.target.closest("[data-room-clear-queue]");
      if (clearQueueBtn) {
        e.preventDefault();
        e.stopPropagation();
        this._pressUiButton(clearQueueBtn);
        const entityId = clearQueueBtn.dataset.roomClearQueue || "";
        if (!entityId) return;
        await this._clearQueueForPlayer(entityId);
        await this._loadControlRoomQueues([entityId]);
        this._toastSuccess(this._i18n("ui.queue_cleared"));
        return;
      }
      const libraryActionBtn = e.target.closest("[data-room-library-action]");
      if (libraryActionBtn) {
        e.preventDefault();
        e.stopPropagation();
        this._pressUiButton(libraryActionBtn);
        const action = libraryActionBtn.dataset.roomLibraryAction || "play";
        const entry = {
          uri: libraryActionBtn.dataset.roomLibraryUri || "",
          media_type: libraryActionBtn.dataset.roomLibraryType || "album",
          name: libraryActionBtn.dataset.roomLibraryName || "",
          subtitle: libraryActionBtn.dataset.roomLibrarySubtitle || "",
          image: libraryActionBtn.dataset.roomLibraryImage || "",
          favorite_scope: libraryActionBtn.dataset.roomLibraryFavoriteScope || "library",
        };
        if (!entry?.uri) return;
        const played = await this._playControlRoomLibraryEntry(entry, action);
        if (played) {
          if (action !== "like") this._state.controlRoomPanel = "";
          if (action === "like") {
            if (this._state.controlRoomPanel === "favorites") this._loadControlRoomFavorites().catch(() => {});
            else this._syncControlRoomUi({ force: true });
          }
          const messages = {
            play: this._m(`Started ${entry.name || "media"} in Studio`, `${entry.name || "media"} התחיל לנגן בסטודיו`),
            next: this._i18n("ui.will_play_next_in_studio"),
            add: this._i18n("ui.added_to_studio_queue"),
            radio_mode: this._i18n("ui.radio_mode_started"),
            like: this._i18n("ui.favorite_updated"),
          };
          this._toastSuccess(messages[action] || messages.play);
          setTimeout(() => this._updateNowPlayingState(), 350);
        } else {
          this._toastError(this._i18n("ui.studio_media_action_failed"));
        }
        return;
      }
      const libraryPlayBtn = e.target.closest("[data-room-library-play]");
      if (libraryPlayBtn) {
        e.preventDefault();
        e.stopPropagation();
        this._pressUiButton(libraryPlayBtn);
        const entry = {
          uri: libraryPlayBtn.dataset.roomLibraryUri || "",
          media_type: libraryPlayBtn.dataset.roomLibraryType || "album",
          name: libraryPlayBtn.dataset.roomLibraryName || "",
          subtitle: libraryPlayBtn.dataset.roomLibrarySubtitle || "",
          image: libraryPlayBtn.dataset.roomLibraryImage || "",
          favorite_scope: libraryPlayBtn.dataset.roomLibraryFavoriteScope || "library",
        };
        if (!entry?.uri) return;
        const played = await this._playControlRoomLibraryEntry(entry);
        if (played) {
          this._state.controlRoomPanel = "";
          this._toastSuccess(this._m(`Started ${entry.name || "media"} in Studio`, `${entry.name || "media"} התחיל לנגן בסטודיו`));
          setTimeout(() => this._updateNowPlayingState(), 350);
        } else {
          this._toastError(this._i18n("ui.could_not_start_playback_in_studio"));
        }
        return;
      }
      const smartMixBtn = e.target.closest("[data-room-smart-mix]");
      if (smartMixBtn) {
        e.preventDefault();
        e.stopPropagation();
        await this._startControlRoomMix(smartMixBtn.dataset.roomSmartMix || "", smartMixBtn);
        return;
      }
      const smartCustomBtn = e.target.closest("[data-room-smart-custom]");
      if (smartCustomBtn) {
        e.preventDefault();
        e.stopPropagation();
        await this._startControlRoomMix("custom", smartCustomBtn);
        return;
      }
      const saveSceneBtn = e.target.closest("[data-room-save-scene]");
      if (saveSceneBtn) {
        e.preventDefault();
        e.stopPropagation();
        this._saveControlRoomSceneFromStudio(saveSceneBtn);
        return;
      }
      const deleteSceneBtn = e.target.closest("[data-room-delete-scene]");
      if (deleteSceneBtn) {
        e.preventDefault();
        e.stopPropagation();
        this._deleteControlRoomScene(deleteSceneBtn.dataset.roomDeleteScene || "", deleteSceneBtn);
        return;
      }
      const sceneBtn = e.target.closest("[data-room-scene]");
      if (sceneBtn) {
        e.preventDefault();
        e.stopPropagation();
        await this._applyControlRoomScene(sceneBtn.dataset.roomScene || "home", sceneBtn);
        return;
      }
      const announceBtn = e.target.closest("[data-room-announce-send]");
      if (announceBtn) {
        e.preventDefault();
        e.stopPropagation();
        await this._sendControlRoomAnnouncement(announceBtn);
        return;
      }
      const thisDeviceBtn = e.target.closest("[data-room-this-device]");
      if (thisDeviceBtn) {
        e.preventDefault();
        e.stopPropagation();
        this._pressUiButton(thisDeviceBtn);
        const action = thisDeviceBtn.dataset.roomThisDevice;
        if (action === "disconnect") this._disconnectThisDevicePlayer();
        else this._connectThisDevicePlayer();
        this._syncControlRoomUi({ force: true });
        return;
      }
      const libraryMicBtn = e.target.closest("[data-room-library-mic]");
      if (libraryMicBtn) {
        e.preventDefault();
        e.stopPropagation();
        this._pressUiButton(libraryMicBtn);
        this._startControlRoomLibraryVoice();
        return;
      }
      const selectionToggleBtn = e.target.closest("[data-room-selection-toggle]");
      if (selectionToggleBtn) {
        e.preventDefault();
        e.stopPropagation();
        this._pressUiButton(selectionToggleBtn);
        const entityId = selectionToggleBtn.dataset.roomSelectionToggle;
        const result = this._toggleControlRoomPlayerSelection(entityId);
        if (result === "kept") {
          this._toast(this._i18n("ui.at_least_one_player_must_stay_selected"));
        } else {
          this._toastSuccess(result === "removed"
            ? this._m(`${this._controlRoomPlayerName(entityId)} removed from selection`, `${this._controlRoomPlayerName(entityId)} הוסר מהבחירה`)
            : this._m(`${this._controlRoomPlayerName(entityId)} selected`, `${this._controlRoomPlayerName(entityId)} נבחר`));
        }
        return;
      }
      const visibleToggleBtn = e.target.closest("[data-room-visible-toggle]");
      if (visibleToggleBtn) {
        e.preventDefault();
        e.stopPropagation();
        this._pressUiButton(visibleToggleBtn);
        const entityId = visibleToggleBtn.dataset.roomVisibleToggle;
        const wasVisible = this._controlRoomVisiblePlayerIds().includes(entityId);
        this._toggleControlRoomVisiblePlayer(entityId);
        this._toastSuccess(wasVisible
          ? this._m(`${this._controlRoomPlayerName(entityId)} hidden from Studio`, `${this._controlRoomPlayerName(entityId)} הוסתר מהסטודיו`)
          : this._m(`${this._controlRoomPlayerName(entityId)} shown in Studio`, `${this._controlRoomPlayerName(entityId)} shown התחיל לנגן בסטודיו`));
        return;
      }
      const dockBtn = e.target.closest("[data-room-selection-action]");
      if (dockBtn) {
        e.preventDefault();
        e.stopPropagation();
        const action = dockBtn.dataset.roomSelectionAction;
        const selectedIds = this._controlRoomActionTargetIds();
        if (action === "browse_library") {
          this._pressUiButton(dockBtn);
          this._toast(this._i18n("ui.opening_studio_library"));
          this._openControlRoomLibrary("library_playlists");
          return;
        }
        if (action === "browse_artists" || action === "browse_albums" || action === "browse_tracks" || action === "browse_radio") {
          this._pressUiButton(dockBtn);
          const pageMap = {
            browse_artists: "library_artists",
            browse_albums: "library_albums",
            browse_tracks: "library_tracks",
            browse_radio: "library_radio",
          };
          this._toast(this._i18n("ui.opening_studio_library"));
          this._openControlRoomLibrary(pageMap[action] || "library_playlists");
          return;
        }
        if (action === "timers") {
          this._pressUiButton(dockBtn);
          this._toast(this._i18n("ui.opening_timers"));
          this._openControlRoomLibrary("sleep_timer");
          return;
        }
        if (action === "open_ma") {
          this._pressUiButton(dockBtn);
          this._launchMusicAssistant();
          return;
        }
        if (["music", "actions", "library", "transfer", "selection", "visible", "mix", "recent", "favorites", "scenes", "announce", "pro"].includes(action)) {
          this._pressUiButton(dockBtn);
          const wasOpen = this._state.controlRoomPanel === action;
          this._toggleControlRoomPanel(action);
          this._toast(wasOpen
            ? this._m(`${this._controlRoomPanelLabel(action)} closed`, `${this._controlRoomPanelLabel(action)} נסגר`)
            : this._m(`${this._controlRoomPanelLabel(action)} opened`, `${this._controlRoomPanelLabel(action)} נפתח`));
          return;
        }
        const primaryId = this._controlRoomPrimaryPlayerId();
        if (action === "player_playpause") {
          if (!primaryId) return;
          this._pressUiButton(dockBtn);
          const player = this._playerByEntityId(primaryId);
          try {
            await this._togglePlayFor(primaryId);
            this._toastSuccess(player?.state === "playing"
              ? this._m(`${this._controlRoomPlayerName(primaryId)} paused`, `${this._controlRoomPlayerName(primaryId)} הושהה`)
              : this._m(`${this._controlRoomPlayerName(primaryId)} started playing`, `${this._controlRoomPlayerName(primaryId)} התחיל לנגן`));
            setTimeout(() => this._updateNowPlayingState(), 250);
          } catch (error) {
            this._toastError(error?.message || this._i18n("ui.playback_command_failed_2"));
          }
          return;
        }
        if (action === "player_next") {
          if (!primaryId) return;
          this._pressUiButton(dockBtn);
          try {
            await this._playerCmdFor(primaryId, "next");
            this._toastSuccess(this._m(`${this._controlRoomPlayerName(primaryId)} skipped to next`, `${this._controlRoomPlayerName(primaryId)} עבר לרצועה הבאה`));
            setTimeout(() => this._updateNowPlayingState(), 250);
          } catch (error) {
            this._toastError(error?.message || this._i18n("ui.next_track_failed"));
          }
          return;
        }
        if (action === "player_mute") {
          if (!primaryId) return;
          this._pressUiButton(dockBtn);
          const wasMuted = this._isMuted(this._playerByEntityId(primaryId));
          try {
            if (!await this._toggleMuteFor(primaryId)) return;
            this._toastSuccess(wasMuted
              ? this._m(`${this._controlRoomPlayerName(primaryId)} unmuted`, `${this._controlRoomPlayerName(primaryId)} בוטלה ההשתקה`)
              : this._m(`${this._controlRoomPlayerName(primaryId)} muted`, `${this._controlRoomPlayerName(primaryId)} הושתק`));
            setTimeout(() => this._updateNowPlayingState(), 160);
          } catch (error) {
            this._toastError(error?.message || this._i18n("ui.mute_command_failed"));
          }
          return;
        }
        if (action === "player_stop") {
          if (!primaryId) return;
          this._pressUiButton(dockBtn);
          try {
            await this._stopPlayer(primaryId);
            this._toastSuccess(this._m(`${this._controlRoomPlayerName(primaryId)} stopped`, `${this._controlRoomPlayerName(primaryId)} נעצר`));
            setTimeout(() => this._updateNowPlayingState(), 250);
          } catch (error) {
            this._toastError(error?.message || this._i18n("ui.stop_command_failed"));
          }
          return;
        }
        if (!selectedIds.length) {
          this._toastError(this._i18n("ui.select_at_least_one_studio_player"));
          return;
        }
        if (action === "playpause") {
          this._pressUiButton(dockBtn);
          if (!await this._runControlRoomPlayerBatch(selectedIds, (entityId) => this._togglePlayFor(entityId))) return;
          this._toastSuccess(this._m(
            `Play / pause sent to ${this._controlRoomPlayerCountLabel(selectedIds.length)}`,
            `ניגון / השהיה נשלחו אל ${this._controlRoomPlayerCountLabel(selectedIds.length)}`
          ));
          setTimeout(() => this._updateNowPlayingState(), 250);
          return;
        }
        if (action === "next") {
          this._pressUiButton(dockBtn);
          if (!await this._runControlRoomPlayerBatch(selectedIds, (entityId) => this._playerCmdFor(entityId, "next"))) return;
          this._toastSuccess(this._m(
            `Next sent to ${this._controlRoomPlayerCountLabel(selectedIds.length)}`,
            `מעבר לשיר הבא נשלח אל ${this._controlRoomPlayerCountLabel(selectedIds.length)}`
          ));
          setTimeout(() => this._updateNowPlayingState(), 250);
          return;
        }
        if (action === "mute") {
          this._pressUiButton(dockBtn);
          if (!await this._runControlRoomPlayerBatch(selectedIds, (entityId) => this._toggleMuteFor(entityId))) return;
          this._toastSuccess(this._m(
            `Mute sent to ${this._controlRoomPlayerCountLabel(selectedIds.length)}`,
            `השתקה נשלחה אל ${this._controlRoomPlayerCountLabel(selectedIds.length)}`
          ));
          setTimeout(() => this._updateNowPlayingState(), 250);
          return;
        }
        if (action === "clear") {
          this._pressUiButton(dockBtn);
          if (!await this._runControlRoomPlayerBatch(selectedIds, (entityId) => this._clearQueueForPlayer(entityId))) return;
          this._toastSuccess(this._m(
            `Queues cleared for ${this._controlRoomPlayerCountLabel(selectedIds.length)}`,
            `התורים נוקו עבור ${this._controlRoomPlayerCountLabel(selectedIds.length)}`
          ));
          this._loadControlRoomQueues(selectedIds).catch(() => {});
          setTimeout(() => this._updateNowPlayingState(), 250);
          return;
        }
        if (action === "stop_all") {
          this._pressUiButton(dockBtn);
          await this._stopAllPlayers();
          setTimeout(() => this._updateNowPlayingState(), 350);
          return;
        }
        if (action === "group") {
          this._pressUiButton(dockBtn);
          const groupPrimaryId = selectedIds[0];
          const members = selectedIds.slice(1);
          if (members.length < 1) {
            this._toastError(this._i18n("ui.select_at_least_two_players_to_create_a_group"));
            return;
          }
          try {
            const ok = await this._applySpeakerGroupFor(groupPrimaryId, members);
            if (!ok) throw new Error(this._i18n("ui.select_at_least_two_players_to_create_a_group"));
            this._toastSuccess(this._i18n("ui.group_updated"));
          } catch (error) {
            this._toastError(error?.message || this._i18n("ui.player_groups_could_not_be_disconnected"));
          }
          setTimeout(() => this._updateNowPlayingState(), 350);
          return;
        }
        if (action === "ungroup") {
          this._pressUiButton(dockBtn);
          await Promise.allSettled(selectedIds.map((entityId) => this._clearSpeakerGroupFor(entityId)));
          this._toastSuccess(this._i18n("ui.group_cleared_2"));
          setTimeout(() => this._updateNowPlayingState(), 350);
        }
      }
    });
    this.$("controlRoomBackdrop")?.addEventListener("input", (e) => {
      const volumeInput = e.target.closest?.("[data-room-volume]");
      if (volumeInput) {
        const pct = Math.max(0, Math.min(100, Number(volumeInput.value || 0)));
        volumeInput.style.setProperty("--vol-pct", `${pct}%`);
        const label = volumeInput.closest(".control-room-volume-row")?.querySelector("[data-room-volume-value]");
        if (label) label.textContent = `${pct}%`;
        clearTimeout(this._controlRoomVolumeTimer);
        this._controlRoomVolumeTimer = setTimeout(() => this._setPlayerVolumeFor(volumeInput.dataset.roomVolume, pct / 100), 90);
        return;
      }
      const smartInput = e.target.closest?.("#controlRoomSmartQueryInput");
      if (smartInput) {
        this._state.controlRoomSmartQuery = smartInput.value || "";
        return;
      }
      const announceText = e.target.closest?.("#controlRoomAnnouncementText");
      if (announceText) {
        this._state.controlRoomAnnouncementText = announceText.value || "";
        return;
      }
      const sceneNameInput = e.target.closest?.("#controlRoomSceneNameInput");
      if (sceneNameInput) {
        this._state.controlRoomSceneName = sceneNameInput.value || "";
        return;
      }
      const announceVolume = e.target.closest?.("#controlRoomAnnouncementVolumeInput");
      if (announceVolume) {
        const pct = Math.max(20, Math.min(50, Number(announceVolume.value || 20)));
        this._state.controlRoomAnnouncementVolume = pct;
        const label = announceVolume.closest(".announcement-volume-field")?.querySelector(".settings-value");
        if (label) label.textContent = `+${pct}%`;
        return;
      }
      const sourceSelect = e.target.closest?.("#controlRoomTransferSource");
      if (sourceSelect) {
        this._state.controlRoomTransferSource = sourceSelect.value || "";
        this._syncControlRoomTransferDefaults();
        this._syncControlRoomUi();
        return;
      }
      const targetSelect = e.target.closest?.("#controlRoomTransferTarget");
      if (targetSelect) {
        this._state.controlRoomTransferTarget = targetSelect.value || "";
      }
    });
    this.$("controlRoomBackdrop")?.addEventListener("input", (e) => {
      const libraryInput = e.target.closest?.("#controlRoomLibraryInput");
      if (!libraryInput) return;
      this._state.controlRoomLibraryQuery = libraryInput.value || "";
      clearTimeout(this._searchTimer);
      this._searchTimer = setTimeout(() => this._searchControlRoomLibrary(libraryInput.value || ""), 180);
    });
    this.$("controlRoomBackdrop")?.addEventListener("keydown", (e) => {
      const libraryInput = e.target.closest?.("#controlRoomLibraryInput");
      if (!libraryInput) return;
      e.stopPropagation();
    });
    this.shadowRoot.querySelector(".card")?.addEventListener("click", (e) => {
      const chip = e.target.closest?.("#sleepTimerChip");
      const menu = e.target.closest?.("#sleepTimerMenu");
      if (chip || menu) return;
      if (this._state.mobileSleepTimerMenuOpen) this._toggleSleepTimerMenu(false);
    });
    this.shadowRoot.querySelectorAll("[data-mainbar-action]").forEach((btn) => btn.addEventListener("click", () => {
      const action = btn.dataset.mainbarAction;
      this._pressUiButton(btn);
      if (action === "library") this._openMobileMenu("library_playlists");
      else if (action === "search") this._openMobileMenu("library_search");
      else if (action === "settings") this._openMobileMenu("settings");
      else if (action === "actions") this._openMobileMenu("main");
      else if (action === "players") this._openMobileMenu("players");
      else if (action === "control_room") this._openControlRoom();
      else if (action === "home") this._goHomeAssistantDashboard();
      else if (action === "theme") {
        const reopenPage = this._state.menuOpen ? this._state.menuPage : "";
        this._toggleCardTheme();
        this._rebuildMobileUi({ reopenPage, reopenStudio: this._state.controlRoomOpen });
      }
    }));
    this.$("activePlayerChip")?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopImmediatePropagation?.();
      e.stopPropagation();
      if (Number(this._state.activePlayerSwipeLockUntil || 0) > Date.now()) return;
      if (!this._isHotelMode() && this._hasPinnedPlayer() && this._pinnedPlayerCount() <= 1) {
        this._toast(this._i18n("ui.player_is_pinned_from_settings"));
        return;
      }
      this._openMobileMenu("players");
    });
    this.$("activePlayerPrevBtn")?.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!this._pressUiButton(e.currentTarget)) return;
      this._cycleActivePlayer(-1);
    });
    this.$("activePlayerNextBtn")?.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!this._pressUiButton(e.currentTarget)) return;
      this._cycleActivePlayer(1);
    });
    this.$("activePlayersBubble")?.addEventListener("click", () => this._openMobileMenu("players_active"));
    this.$("npArt")?.addEventListener("click", async (e) => {
      if (this._isCompactTileMode()) {
        e.preventDefault();
        e.stopPropagation();
        await this._handleCompactCoverTap(e);
        return;
      }
      this._handleMobileArtTap(e);
    });
    queueMicrotask(() => {
      this._initMobileArtCarousel();
      this._bindActivePlayerChipSwipe();
    });
    this.$("mobileMenuTitle")?.addEventListener("click", (e) => {
      if (e.currentTarget?.dataset?.menuTitleAction === "players") this._pushMobileMenu("players");
    });
    this.$("mobileMenuAuxBtn")?.addEventListener("click", () => {
      if (this._state.menuPage?.startsWith("library_")) this._pushMobileMenu("library_liked");
    });
    this.$("mobileMenuCloseBtn")?.addEventListener("click", () => this._closeMobileMenu());
    this.$("mobileMenuBackBtn")?.addEventListener("click", () => this._backMobileMenu());
    this.$("mobileMenu")?.addEventListener("click", (e) => { if (e.target === this.$("mobileMenu")) this._closeMobileMenu(); });
    this.$("mobileMenu")?.addEventListener("input", this._boundMobileMenuChange);
    this.$("mobileQueueActionModal")?.addEventListener("click", (e) => {
      if (e.target === this.$("mobileQueueActionModal")) this._closeMobileQueueActionMenu();
    });
    this.$("mobileVolumePresetModal")?.addEventListener("click", (e) => {
      if (e.target === this.$("mobileVolumePresetModal")) this._closeMobileVolumePresets();
    });
    this.$("mobileSmartVoiceModal")?.addEventListener("click", (e) => {
      if (e.target === this.$("mobileSmartVoiceModal")) this._closeSmartVoiceConfirm();
    });
    this.$("mobileVolumePresetSheet")?.addEventListener("click", this._boundMobileMenuClick);
    this.$("mobileQueueActionSheet")?.addEventListener("click", (event) => handleMediaActionClick(this, event));
    this.$("mobileQueueActionSheet")?.addEventListener("change", async (e) => {
      if (!(await this._handleQueueMoveAutoChange(e))) return;
      this._closeMobileQueueActionMenu();
      if (this._state.menuOpen && this._state.menuPage === "queue") await this._renderMobileMenu();
    });
    this.$("maConfirmCloseBtn")?.addEventListener("click", () => this._closeMaConfirm());
    this.$("maConfirmCancelBtn")?.addEventListener("click", () => this._closeMaConfirm());
    this.$("maConfirmContinueBtn")?.addEventListener("click", () => this._confirmMusicAssistantOpen());
    this.$("maConfirmModal")?.addEventListener("click", (e) => { if (e.target === this.$("maConfirmModal")) this._closeMaConfirm(); });
    this.$("cleanAllConfirmCloseBtn")?.addEventListener("click", () => this._closeCleanAllConfirm());
    this.$("cleanAllConfirmCancelBtn")?.addEventListener("click", () => this._closeCleanAllConfirm());
    this.$("cleanAllConfirmContinueBtn")?.addEventListener("click", async (e) => {
      await this._runLockedUiAction(e.currentTarget, () => this._confirmCleanAllPlayers(), { pattern: [18, 24, 18], lockMs: 1600 });
    });
    this.$("cleanAllConfirmModal")?.addEventListener("click", (e) => { if (e.target === this.$("cleanAllConfirmModal")) this._closeCleanAllConfirm(); });
    this.$("mobileMenuBody")?.addEventListener("click", this._boundMobileMenuClick);
    this.$("mobileMenuBody")?.addEventListener("change", this._boundMobileMenuChange);
    this.$("mobileMenuBody")?.addEventListener("keydown", this._boundMobileMenuKeydown);
    this.$("mobileMenuBody")?.addEventListener("scroll", this._boundMobileMenuScroll, { passive: true, capture: true });
    bindQueueDrag(this, this.$("mobileMenuBody"));
    this.$("mobileMenuBody")?.addEventListener("pointerdown", this._boundMobileMenuPointerDown, { passive: true });
    this.$("mobileMenuBody")?.addEventListener("toggle", (e) => {
      const det = e.target?.closest?.("details.settings-accordion");
      if (!det) return;
      const id = det.dataset.settingsAccordion;
      if (!id) return;
      const set = this._settingsAccordionOpenSet();
      if (det.open) set.add(id); else set.delete(id);
      this._persistSettingsAccordionOpen(set);
    }, true);
    this._bindProgressSeekBar(this.$("progressBar"));
    bindImmersivePlayer(this);
    this.$("mobileVolPctLabel")?.addEventListener("click", () => this._openMobileVolumePresets());
    this.$("volSlider")?.addEventListener("input", (e) => {
      const pct = Number(e.target.value || 0);
      e.target.style.setProperty("--vol-pct", `${pct}%`);
      const player = this._getSelectedPlayer();
      if (player?.entity_id) this._setPlayerVolumeOptimistic(player.entity_id, pct / 100);
      this._setButtonIcon(this.$("btnMute"), pct === 0 ? "volume_mute" : pct < 40 ? "volume_low" : "volume_high");
      this.$("btnMute")?.classList.toggle("muted", pct === 0);
      const volLabel = this.$("mobileVolPctLabel");
      if (volLabel) volLabel.textContent = `${pct}%`;
      this._setVolume(pct / 100);
    });
  }

  async _init() {
    try {
      if (typeof this._ensureHomeiiEngineHandshake === "function") {
        const ready = await this._ensureHomeiiEngineHandshake();
        if (!ready) return;
      }
      if (typeof this._refreshEnginePlayers === "function") {
        await this._refreshEnginePlayers({ force: true });
      }
      this._state.view = "now_playing";
      this._loadPlayers();
      this._connectMA();
      this._refreshGroupingState();
      await this._ensureQueueSnapshot();
      this._renderCurrentView();
      this._startLoops();
      if (!this._screensaverPageEntryPending) this._restoreScreensaverIfOpen();
      this._restoreMobileMenuAfterBuild("init");
    } catch (e) {
      this._renderError(e);
    }
  }

  _renderCurrentView() {
    this._state.view = "now_playing";
    this._syncNowPlayingUI();
  }

  async _renderNowPlayingPage() {
    this._state.view = "now_playing";
    await this._ensureQueueSnapshot();
    this._syncNowPlayingUI();
  }

  _updateThemeButton() {}

  _renderPlayerSummary() {
    const player = this._getSelectedPlayer();
    const chip = this.$("activePlayerChip");
    const title = this.$("selectedPlayerTitle");
    const sub = this.$("selectedPlayerSub");
    const thumb = this.$("selectedPlayerThumb");
    const tags = this.$("selectedPlayerTags");
    if (chip) chip.classList.toggle("is-playing", player?.state === "playing");
    if (!player) {
      if (title) title.textContent = this._musicAssistantRequiredTitle();
      if (sub) sub.textContent = this._state.musicAssistantIssueMessage || this._musicAssistantRequiredMessage();
      if (tags) tags.innerHTML = "";
      if (thumb) {
        thumb.classList.add("placeholder");
        thumb.classList.remove("brand-logo");
        thumb.style.backgroundImage = "";
        thumb.innerHTML = this._iconSvg("speaker");
      }
      this._syncMobilePlayerNavButtons();
      this._setMobileRandomFabVisible(false);
      return;
    }
    if (title) title.textContent = this._playerDisplayName(player) || this._i18n("ui.selected_player");
    if (sub) sub.textContent = "";
    if (tags) {
      const groupCount = this._playerGroupCount(player);
      const pinned = this._hasPinnedPlayer() || this._frontPinnedPlayerEntity() === player?.entity_id;
      const nightMode = this._mobileNightMode();
      const nightActive = this._isNightModeActive();
      tags.innerHTML = [
        pinned
          ? `<span class="player-focus-pill pinned"><span>${this._esc(this._i18n("ui.pinned"))}</span></span>`
          : ``,
        nightMode !== "off"
          ? `<span class="player-focus-pill ${nightActive ? "night active" : "night"}"><span>${this._esc(this._i18n("ui.night"))}</span></span>`
          : ``,
        player?.state === "playing"
          ? `<span class="player-focus-pill playing"><span class="eq-icon" aria-hidden="true"><span></span><span></span><span></span></span><span>${this._esc(this._i18n("ui.playing"))}</span></span>`
          : ``,
        groupCount
          ? `<span class="player-group-badge player-focus-badge">${this._esc(groupCount)}</span>`
          : ``,
      ].filter(Boolean).join("");
    }
    if (thumb) {
      const queueItem = this._state.maQueueState?.current_item || null;
      const art = this._queueItemImageUrl(queueItem, 180)
        || this._imageUrl(player?.attributes?.entity_picture_local, 180)
        || this._imageUrl(player?.attributes?.entity_picture, 180)
        || this._imageUrl(player?.attributes?.media_image_url, 180)
        || "";
      thumb.classList.toggle("placeholder", !art);
      thumb.classList.remove("brand-logo");
      if (art) {
        thumb.style.backgroundImage = `url("${art}")`;
        thumb.innerHTML = "";
      } else {
        thumb.style.backgroundImage = "";
        thumb.innerHTML = this._iconSvg("speaker");
      }
    }
    this._syncMobilePlayerNavButtons();
    this._setMobileRandomFabVisible(true);
  }

  _queueMoveSelectHtml(queueCount = 1, currentPosition = 1, entry = {}) {
    const total = Math.max(1, Math.round(Number(queueCount)) || 1);
    const current = Math.max(1, Math.min(total, Math.round(Number(currentPosition ?? entry?.position)) || 1));
    const queueItemId = String(entry?.queue_item_id || entry?.queueItemId || entry?.key || "").trim();
    const uri = String(entry?.uri || entry?.media_item?.uri || "").trim();
    const sortIndex = String(entry?.sort_index ?? "").trim();
    const options = Array.from({ length: total }, (_, index) => index + 1)
      .map((pos) => `<option value="${this._esc(String(pos))}" ${pos === current ? "selected" : ""}>${this._esc(String(pos))}</option>`)
      .join("");
    return `
      <select class="queue-move-select" data-queue-move-target data-queue-move-auto
        data-current-position="${this._esc(String(current))}"
        data-queue-item-id="${this._esc(queueItemId)}"
        data-queue-uri="${this._esc(uri)}"
        data-queue-sort-index="${this._esc(sortIndex)}"
        aria-label="${this._esc(this._i18n("ui.move_to_position"))}">
        ${options}
      </select>
    `;
  }

  _queueMoveTargetFromElement(sourceEl = null) {
    const container = sourceEl?.closest?.(".queue-inline-actions, .queue-action-sheet, .queue-ctx-menu");
    const input = container?.querySelector?.("[data-queue-move-target]");
    const value = Math.round(Number(input?.value));
    const total = Math.max(1, this._getNowPlayingQueueItems().length || (this._state.queueItems || []).length || Number(this._state.maQueueState?.items || 1));
    if (!Number.isFinite(value) || value < 1) {
      this._toastError(this._i18n("ui.choose_a_queue_position"));
      input?.focus?.();
      return null;
    }
    return Math.max(1, Math.min(total, value));
  }

  async _handleQueueMoveAutoChange(e) {
    const select = e.target?.closest?.("[data-queue-move-auto]");
    if (!select) return false;
    e.preventDefault?.();
    e.stopPropagation?.();
    const targetPosition = this._queueMoveTargetFromElement(select);
    if (!targetPosition) return true;
    const currentPosition = Math.round(Number(select.dataset.currentPosition || 0));
    if (targetPosition === currentPosition) return true;
    const queueRow = select.closest?.("[data-queue-item-id]");
    const queueItemId = select.dataset.queueItemId || queueRow?.dataset.queueItemId || "";
    const fallbackUri = select.dataset.queueUri || queueRow?.dataset.uri || "";
    const sortIndex = select.dataset.queueSortIndex || queueRow?.dataset.sortIndex || "";
    this._state.expandedQueueItemId = "";
    this._setQueueInlineActionsExpanded("");
    await this._handleQueueAction("move_to", queueItemId, fallbackUri, sortIndex, targetPosition);
    return true;
  }

  _openMobileQueueActionMenu(entry = {}) {
    this._state.mobileActionContext = "queue";
    this._state.mobileQueueActionEntry = entry;
    const host = this.$("mobileQueueActionSheet");
    if (host) {
      host.innerHTML = mediaActionSheetHtml(this, entry, true);
      syncScreenDock(this, host, "queue_actions", () => this._closeMobileQueueActionMenu());
      this._hydrateImages(host);
    }
    this.$("mobileQueueActionModal")?.classList.add("open");
  }

  _openMobileMediaActionMenu(entry = {}) {
    if (!entry.favorite_scope && !entry.favoriteScope) entry.favorite_scope = "library";
    this._state.mobileActionContext = "media";
    this._state.mobileQueueActionEntry = entry;
    const host = this.$("mobileQueueActionSheet");
    if (host) {
      host.innerHTML = mediaActionSheetHtml(this, entry);
      syncScreenDock(this, host, "media_actions", () => this._closeMobileQueueActionMenu());
      this._hydrateImages(host);
    }
    this.$("mobileQueueActionModal")?.classList.add("open");
  }

  _closeMobileQueueActionMenu() {
    this._state.mobileActionContext = "";
    this._state.mobileQueueActionEntry = null;
    this.$("mobileQueueActionModal")?.classList.remove("open");
  }

  _mediaEntryFromDataset(dataset = {}) {
    return {
      uri: String(dataset.mediaUri || dataset.mediaPlay || dataset.mediaMore || dataset.mediaLike || "").trim(),
      media_type: String(dataset.mediaType || "track").trim() || "track",
      name: String(dataset.mediaName || "").trim(),
      artist: String(dataset.mediaArtist || "").trim(),
      album: String(dataset.mediaAlbum || "").trim(),
      image: String(dataset.mediaImage || "").trim(),
      favorite_scope: String(dataset.mediaFavoriteScope || dataset.mediaScope || "library").trim() || "library",
    };
  }

  async _handleMediaDetailActionButton(button = null) {
    if (!button?.dataset) return false;
    const action = String(button.dataset.mediaDetailAction || "").trim();
    const entry = this._mediaEntryFromDataset(button.dataset);
    if (!action || !entry.uri) return false;
    const scrollSnapshot = this._captureMobileMenuScroll(this._state.menuPage || "media_detail");
    const loadingAction = action === "add" || action === "play";
    const feedbackEl = this._showLibraryInteractionFeedback(button, {
      loading: loadingAction,
      hold: loadingAction,
      press: !loadingAction,
    });
    if (action === "like") {
      const wasLiked = this._isEntryLiked(entry);
      const ok = await this._toggleLikeEntry(entry, button);
      if (!ok) return false;
      if (!this._useMaLikedMode()) this._toastSuccess(wasLiked ? this._i18n("ui.removed_from_liked") : this._i18n("ui.added_to_liked"));
      await this._renderMobileMenu();
      if (scrollSnapshot) this._restoreMobileMenuScrollSnapshot(scrollSnapshot, scrollSnapshot.page);
      return true;
    }
    if (action === "add") {
      try {
        const ok = await this._playMedia(entry.uri, entry.media_type || "track", "add", { label: entry.name, sourceEl: button, silent: true });
        if (ok) this._toastSuccess(this._i18n("ui.added_to_queue"));
        return ok;
      } finally {
        this._clearLibraryInteractionFeedback(feedbackEl);
      }
    }
    if (action === "play") {
      try {
        const ok = await this._playMedia(entry.uri, entry.media_type || "track", "play", { label: entry.name, sourceEl: button, silent: true });
        if (ok) this._toastSuccess(this._i18n("ui.started_on_selected_player"));
        return ok;
      } finally {
        this._clearLibraryInteractionFeedback(feedbackEl);
      }
    }
    return false;
  }

  async _handleMobileMediaAction(action, entry = {}) {
    if (!entry?.uri) return false;
    const label = String(entry.name || "").trim();
    if (action === "shuffle") return this._playMedia(entry.uri, entry.media_type || "album", "shuffle", { label });
    if (action === "library_add") {
      await this._callEngineMaCommand("music/library/add_item", { item:entry.uri });
      this._toastSuccess(this._m("Saved to Music Assistant library", "נוסף לספריית Music Assistant"));
      return true;
    }
    if (action === "details") {
      this._closeMobileQueueActionMenu();
      this._openLibraryMediaDetail(entry);
      return true;
    }
    if (action === "like") {
      const wasLiked = this._isEntryLiked(entry);
      const ok = await this._toggleLikeEntry(entry);
      if (!ok) return false;
      if (!this._useMaLikedMode()) {
        this._toastSuccess(wasLiked ? this._i18n("ui.removed_from_liked") : this._i18n("ui.added_to_liked"));
      }
      return true;
    }
    if (action === "play" || action === "play_clear") {
      return this._playMedia(entry.uri, entry.media_type || "album", "play", { label });
    }
    if (action === "next") {
      const ok = await this._playMedia(entry.uri, entry.media_type || "album", "next", { label, silent: true });
      if (ok) this._toastSuccess(this._i18n("ui.will_play_next"));
      return ok;
    }
    if (action === "next_clear") {
      await this._clearQueueForPlayer(this._state.selectedPlayer);
      const ok = await this._playMedia(entry.uri, entry.media_type || "album", "next", { label, silent: true });
      if (ok) this._toastSuccess(this._i18n("ui.queue_cleared_and_item_moved_next"));
      return ok;
    }
    if (action === "add") {
      const ok = await this._playMedia(entry.uri, entry.media_type || "album", "add", { label, silent: true });
      if (ok) this._toastSuccess(this._i18n("ui.added_to_queue"));
      return ok;
    }
    if (action === "radio_mode") {
      const mediaType = entry.media_type || "album";
      if (!this._supportsMusicAssistantRadioMode(mediaType)) {
        this._toastError(this._i18n("ui.radio_mode_is_not_available_for_this_media_type"));
        return false;
      }
      const ok = await this._playMedia(entry.uri, mediaType, "play", { label, radioMode: true, silent: true });
      if (ok) this._toastSuccess(this._i18n("ui.radio_mode_started"));
      return ok;
    }
    return false;
  }

  _openMobileVolumePresets() {
    const host = this.$("mobileVolumePresetSheet");
    if (!host) return;
    host.classList.remove("tablet-volume-sheet-host");
    const selectedPlayer = this._getSelectedPlayer();
    const current = Math.round(this._effectivePlayerVolumeLevel(selectedPlayer) * 100);
    const values = Array.from({ length: 11 }, (_, index) => 100 - (index * 10));
    host.innerHTML = `
      <div class="queue-action-header">
        <div class="queue-action-brand" aria-hidden="true">${this._tabletBrandSignatureHtml("queue-action-logo")}</div>
        <div class="queue-action-title">${this._esc(this._i18n("ui.volume_presets"))}</div>
      </div>
      ${values.map((value) => `
      <button class="queue-action-item ${value === current ? "active" : ""}" data-volume-preset="${value}">
        <span>${value}%</span>
      </button>
    `).join("")}`;
    this.classList.add("volume-preset-open");
    this.$("mobileVolumePresetModal")?.classList.add("open");
  }

  _openTabletVolumePopup() {
    const host = this.$("mobileVolumePresetSheet");
    const player = this._getSelectedPlayer();
    if (!host || !player) return;
    host.classList.add("tablet-volume-sheet-host");
    const pct = Math.max(0, Math.min(100, Math.round(this._effectivePlayerVolumeLevel(player) * 100)));
    host.innerHTML = `
        <div class="tablet-volume-popup">
        <button class="volume-btn" id="tabletPopupMuteBtn">${this._iconSvg(this._volumeIconName(player))}</button>
        <input class="volume-slider tablet-volume-popup-slider" id="tabletPopupVolSlider" type="range" min="0" max="100" value="${pct}" style="--vol-pct:${pct}%">
        <div class="tablet-volume-popup-value" id="tabletPopupVolPct">${pct}%</div>
      </div>
    `;
    const slider = this.$("tabletPopupVolSlider");
    const muteBtn = this.$("tabletPopupMuteBtn");
    const pctLabel = this.$("tabletPopupVolPct");
    slider?.addEventListener("input", (e) => {
      const nextPct = Math.max(0, Math.min(100, Number(e.target.value || 0)));
      e.target.style.setProperty("--vol-pct", `${nextPct}%`);
      if (player?.entity_id) this._setPlayerVolumeOptimistic(player.entity_id, nextPct / 100);
      if (pctLabel) pctLabel.textContent = `${nextPct}%`;
      if (muteBtn) this._setButtonIcon(muteBtn, nextPct === 0 ? "volume_mute" : nextPct < 40 ? "volume_low" : "volume_high");
      this._setPlayerVolumeFor(player.entity_id, nextPct / 100);
    });
    muteBtn?.addEventListener("click", () => this._toggleMute());
    this.classList.add("volume-preset-open");
    this.$("mobileVolumePresetModal")?.classList.add("open");
  }

  _closeMobileVolumePresets() {
    this.$("mobileVolumePresetSheet")?.classList.remove("tablet-volume-sheet-host");
    this.$("mobileVolumePresetModal")?.classList.remove("open");
    this.classList.remove("volume-preset-open");
  }

  _emptyQuickSuggestionLabel(mediaType = "album") {
    const type = String(mediaType || "album").toLowerCase();
    if (type === "playlist") return this._i18n("ui.playlist");
    if (type === "radio") return this._i18n("ui.radio");
    if (type === "track") return this._i18n("ui.track");
    return this._i18n("ui.album");
  }

  _pickRandomItems(items = [], limit = 5) {
    const pool = Array.isArray(items) ? [...items] : [];
    const out = [];
    while (pool.length && out.length < limit) {
      const idx = Math.floor(Math.random() * pool.length);
      out.push(pool.splice(idx, 1)[0]);
    }
    return out;
  }

  _emptyQuickShelfPlayableItems(mediaTypes = []) {
    const allowed = new Set((Array.isArray(mediaTypes) ? mediaTypes : [])
      .map((type) => String(type || "").toLowerCase())
      .filter(Boolean));
    return (Array.isArray(this._state.emptyQuickShelfItems) ? this._state.emptyQuickShelfItems : [])
      .map((item) => this._normalizeMediaItem(item))
      .filter((item) => String(item?.uri || "").trim())
      .filter((item) => !allowed.size || allowed.has(String(item?.media_type || "album").toLowerCase()));
  }

  async _playEmptyQuickShelfPick(mediaTypes = [], toastKey = "", fallbackLabelKey = "ui.quick_play") {
    const pick = this._pickRandomItems(this._emptyQuickShelfPlayableItems(mediaTypes), 1)[0];
    if (!pick?.uri) return false;
    const mediaType = String(pick.media_type || "album").toLowerCase();
    const ok = await this._playMedia(pick.uri, mediaType, "play", {
      label: pick.name || pick.title || this._i18n(fallbackLabelKey),
      silent: true,
    });
    if (!ok) return false;
    if (mediaType !== "radio") this._showSurprisePopup(pick);
    const resolvedToastKey = toastKey === "ui.playing_a_random_playlist" && mediaType !== "playlist"
      ? "ui.playback_started"
      : toastKey;
    if (resolvedToastKey) this._toastSuccess(this._i18n(resolvedToastKey));
    return true;
  }

  _bindEmptyQuickShelfButtons(host = null) {
    host?.querySelectorAll("[data-empty-media-uri]").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const mediaBtn = e.currentTarget;
        await this._runLockedUiAction(mediaBtn, async () => {
          const uri = mediaBtn.dataset.emptyMediaUri || "";
          const mediaType = mediaBtn.dataset.emptyMediaType || "album";
          if (!uri) return;
          this._showEmptyPlaybackLoading(mediaBtn);
          const ok = await this._playMedia(uri, mediaType, "play", {
            label: mediaBtn.getAttribute("title") || "",
            sourceEl: mediaBtn,
          });
          if (!ok) this._hideEmptyPlaybackLoading();
        }, { lockMs: 1200 });
      });
    });
  }

  async _renderEmptyQuickShelf() {
    const host = this.$("emptyQuickShelf");
    if (!host) return;
    if (this._state.musicAssistantIssueMessage && !(this._state.players || []).length) {
      this._state.emptyQuickShelfItems = [];
      host.hidden = true;
      host.innerHTML = "";
      return;
    }
    const shelfMode = String(this._state.emptyQuickShelfMode || "default");
    const fixedItems = Array.isArray(this._state.emptyQuickShelfItems) ? this._state.emptyQuickShelfItems : [];
    if (fixedItems.length) {
      host.innerHTML = fixedItems.map((item) => {
        const art = this._artUrl(item) || item?.image || item?.media_item?.image || item?.media_item?.album?.image || "";
        const title = item?.name || item?.title || this._i18n("ui.quick_play");
        const mediaType = item?.media_type || "album";
        return `
          <button class="empty-quick-card" data-empty-media-uri="${this._esc(item.uri)}" data-empty-media-type="${this._esc(mediaType)}" title="${this._esc(title)}">
            <span class="empty-quick-art">${art ? this._imgHtml(art, "", { fallbackIcon: mediaType === "radio" ? "radio" : mediaType === "playlist" ? "queue" : "music" }) : this._iconSvg(mediaType === "radio" ? "radio" : mediaType === "playlist" ? "queue" : "music")}</span>
            <span class="empty-quick-copy">
              <span class="empty-quick-kicker">${this._esc(this._emptyQuickSuggestionLabel(mediaType))}</span>
              <span class="empty-quick-title">${this._esc(title)}</span>
            </span>
          </button>
        `;
      }).join("");
      host.hidden = false;
      this._bindEmptyQuickShelfButtons(host);
      return;
    }
    const token = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    this._emptyQuickShelfToken = token;
    if (!host.children.length) host.hidden = true;
    try {
      const results = await Promise.allSettled(
        shelfMode === "radio"
          ? [
            this._fetchLibrary("radio", "sort_name", 14, true),
            this._fetchLibrary("radio", "sort_name", 40, false),
            this._fetchRadioBrowserStations("", 30, { countryCode: this._mobileRadioBrowserCountry() || "all" }),
            this._fetchLibrary("radio", "random", 18, false),
          ]
          : [
            this._fetchLibrary("playlist", "sort_name", 14, true),
            this._fetchLibrary("playlist", "sort_name", 40, false),
            this._fetchLibrary("album", "random", 18, false),
            this._fetchLibrary("radio", "sort_name", 8, true),
          ]
      );
      if (this._emptyQuickShelfToken !== token) return;
      if (!this.shadowRoot.querySelector(".card")?.classList.contains("empty-media")) return;
      const [likedPlaylistsRaw, playlistsRaw, albumsRaw, radiosRaw] = results.map((result) =>
        result.status === "fulfilled" && Array.isArray(result.value) ? result.value : []
      );
      const likedPlaylists = likedPlaylistsRaw.map((item) => this._normalizeMediaItem(item));
      const playlists = playlistsRaw.map((item) => this._normalizeMediaItem(item));
      const albums = albumsRaw.map((item) => this._normalizeMediaItem(item));
      const radios = radiosRaw.map((item) => this._normalizeMediaItem(item));
      const unique = [];
      const seenUris = new Set();
      const pushUnique = (items = []) => {
        (Array.isArray(items) ? items : []).forEach((item) => {
          const uri = String(item?.uri || "").trim();
          if (!uri || seenUris.has(uri)) return;
          seenUris.add(uri);
          unique.push(item);
        });
      };
      const targetCount = this._layoutModeConfig() === "tablet" ? 10 : 7;
      if (shelfMode === "radio") {
        pushUnique(this._pickRandomItems(likedPlaylists.filter((item) => (item?.media_type || "") === "radio"), Math.min(4, targetCount)));
        pushUnique(this._pickRandomItems(playlists.filter((item) => (item?.media_type || "") === "radio"), Math.min(4, Math.max(1, targetCount - unique.length))));
        pushUnique(this._pickRandomItems(albums.filter((item) => (item?.media_type || "") === "radio"), Math.min(4, Math.max(1, targetCount - unique.length))));
        pushUnique(this._pickRandomItems(radios.filter((item) => (item?.media_type || "") === "radio"), Math.min(4, Math.max(1, targetCount - unique.length))));
        if (unique.length < targetCount) {
          pushUnique(this._pickRandomItems([...likedPlaylists, ...playlists, ...albums, ...radios].filter((item) => (item?.media_type || "") === "radio"), targetCount - unique.length));
        }
      } else {
        pushUnique(this._pickRandomItems(likedPlaylists, Math.min(3, targetCount)));
        pushUnique(this._pickRandomItems(playlists.filter((item) => (item?.media_type || "") === "playlist"), Math.min(3, Math.max(1, targetCount - unique.length))));
        pushUnique(this._pickRandomItems(albums, Math.min(2, Math.max(1, targetCount - unique.length))));
        pushUnique(this._pickRandomItems(radios, Math.min(2, Math.max(0, targetCount - unique.length))));
        if (unique.length < targetCount) {
          pushUnique(this._pickRandomItems([...playlists, ...albums, ...radios], targetCount - unique.length));
        }
      }
      const picks = unique.slice(0, targetCount);
      if (!picks.length) {
        this._state.emptyQuickShelfItems = [];
        host.hidden = true;
        host.innerHTML = "";
        return;
      }
      this._state.emptyQuickShelfItems = picks;
      host.innerHTML = picks.map((item) => {
        const art = this._artUrl(item) || item?.image || item?.media_item?.image || item?.media_item?.album?.image || "";
        const title = item?.name || item?.title || this._i18n("ui.quick_play");
        const mediaType = item?.media_type || "album";
        return `
          <button class="empty-quick-card" data-empty-media-uri="${this._esc(item.uri)}" data-empty-media-type="${this._esc(mediaType)}" title="${this._esc(title)}">
            <span class="empty-quick-art">${art ? this._imgHtml(art, "", { fallbackIcon: mediaType === "radio" ? "radio" : mediaType === "playlist" ? "queue" : "music" }) : this._iconSvg(mediaType === "radio" ? "radio" : mediaType === "playlist" ? "queue" : "music")}</span>
            <span class="empty-quick-copy">
              <span class="empty-quick-kicker">${this._esc(this._emptyQuickSuggestionLabel(mediaType))}</span>
              <span class="empty-quick-title">${this._esc(title)}</span>
            </span>
          </button>
        `;
      }).join("");
      host.hidden = false;
      this._bindEmptyQuickShelfButtons(host);
    } catch (_) {
      if (this._emptyQuickShelfToken !== token) return;
      this._state.emptyQuickShelfItems = [];
      host.hidden = true;
      host.innerHTML = "";
    }
  }

  _renderEmpty(text = this._i18n("ui.no_active_media"), options = {}) {
    const notice = this.$("mobileNotice");
    if (notice) {
      notice.classList.remove("open");
      notice.textContent = "";
    }
    const card = this.shadowRoot.querySelector(".card");
    const wasEmpty = options.wasEmptyMedia === true || card?.classList.contains("empty-media");
    const disableEmptyAction = options.disableEmptyAction === true;
    const disableShelf = options.disableShelf === true;
    card?.classList.add("empty-media");
    const nextShelfMode = String(options.shelfMode || "default");
    card?.classList.toggle("radio-media", nextShelfMode === "radio");
    const displayArt = this._normalizeArtworkUrl(options.art || "", {
      size: 420,
      cacheKey: options.artCacheKey || `empty:${nextShelfMode}:${text}`,
    });
    if (!wasEmpty || this._state.emptyQuickShelfMode !== nextShelfMode) {
      this._state.emptyQuickShelfMode = nextShelfMode;
      this._state.emptyQuickShelfItems = [];
    }
    const emptyActions = this.$("mobileArtActions");
    const configuredEmptyActions = this._mobileEmptyVisibleQuickActions(this._mobileQuickActions());
    const emptyQuickActionsBase = configuredEmptyActions;
    const emptyQuickActionsWithVoice = emptyQuickActionsBase;
    const emptyQuickActions = this._mobileActionsWithAuxiliary(emptyQuickActionsWithVoice)
      .filter((action) => this._layoutModeConfig() !== "tablet" || action !== "history");
    if (emptyActions && emptyQuickActions.length) {
      const emptyClassName = `mobile-art-actions empty-quick-actions count-${Math.max(1, emptyQuickActions.length)}${emptyQuickActions.length === 1 && emptyQuickActions[0] === "home" ? " empty-home-actions" : ""}`;
      const emptySignature = [
        this._layoutModeConfig(),
        emptyQuickActions.join(","),
        this._enabledAuxiliaryButtons().map((button) => `${button.index}:${button.icon}:${button.name}`).join("|"),
        this._voiceAssistantEnabled() ? "voice-on" : "voice-off",
      ].join(";");
      if (emptyActions.className !== emptyClassName) emptyActions.className = emptyClassName;
      if (emptyActions.dataset.homeiiEmptyActionSignature !== emptySignature) {
        emptyActions.dataset.homeiiEmptyActionSignature = emptySignature;
        emptyActions.innerHTML = this._mobileQuickActionButtonsHtml("", emptyQuickActions);
        this._bindMobileQuickActionButtons();
      }
      emptyActions.removeAttribute("hidden");
    } else if (emptyActions) {
      emptyActions.classList.remove("empty-quick-actions");
      emptyActions.classList.remove("empty-home-actions");
      delete emptyActions.dataset.homeiiEmptyActionSignature;
      emptyActions.setAttribute("hidden", "");
    }
    if (this.$("npTitle")) this.$("npTitle").textContent = text;
    this._setNowPlayingSubtitle(options.subtitle || this._i18n("ui.choose_something_from_the_quick_shelf_or_tap_the_wand_for_a_random_playl"), { scrollWhenOverflow: true });
    if (this.$("bigCurTime")) this.$("bigCurTime").textContent = "0:00";
    if (this.$("bigTotalTime")) this.$("bigTotalTime").textContent = "0:00";
    if (this.$("progressFill")) this.$("progressFill").style.width = "0%";
    if (!wasEmpty || !this.$("surpriseMeBtn") || displayArt || disableEmptyAction) {
      const voiceButtonHtml = !disableEmptyAction && this._voiceAssistantEnabled()
        ? `<button class="empty-voice-btn ${this._state.voiceAssistantListening ? "listening" : ""}" id="emptyVoiceAssistantBtn" title="${this._esc(this._flowAssistantLabel())}" aria-label="${this._esc(this._flowAssistantLabel())}">${this._iconSvg("mic")}</button>`
        : "";
      const magicVisualHtml = disableEmptyAction
        ? `<div class="surprise-me-card compact magic-empty disabled ${displayArt ? "has-art" : ""}" id="surpriseMeBtn" aria-hidden="true">
            ${displayArt
              ? `${this._imgHtml(displayArt, text, { loading: "eager", fetchpriority: "high", fallbackIcon: options.artIcon || "radio" })}<span class="surprise-me-wand art-overlay">${this._iconSvg(options.artIcon || "radio")}</span>`
              : `<span class="surprise-me-glow"></span><span class="surprise-me-wand">${this._iconSvg(options.artIcon || "speaker")}</span>`}
          </div>`
        : `<button class="surprise-me-card compact magic-empty ${displayArt ? "has-art" : ""}" id="surpriseMeBtn" aria-label="${this._esc(options.artLabel || this._i18n("ui.surprise_me"))}">
            ${displayArt
              ? `${this._imgHtml(displayArt, text, { loading: "eager", fetchpriority: "high", fallbackIcon: options.artIcon || "radio" })}<span class="surprise-me-wand art-overlay">${this._iconSvg(options.artIcon || "radio")}</span>`
              : `<span class="surprise-me-glow"></span><span class="surprise-me-wand">${this._iconSvg(options.artIcon || "wand")}</span>`}
          </button>`;
      if (this.$("npArt")) this.$("npArt").innerHTML = `
        <div class="empty-magic-stack ${voiceButtonHtml ? "has-voice" : ""}">
          ${magicVisualHtml}
          ${voiceButtonHtml}
        </div>
      `;
      if (!disableEmptyAction) this.$("surpriseMeBtn")?.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopPropagation();
        this._showEmptyMagicRipple(e.currentTarget);
        await this._runLockedUiAction(e.currentTarget, async () => {
          this._showEmptyPlaybackLoading(e.currentTarget);
          const ok = options.artAction === "radio"
            ? await this._playRandomRadioStation()
            : await this._playRandomFromPlaylists();
          if (!ok) this._hideEmptyPlaybackLoading();
        }, { lockMs: 1600 });
      });
      if (!disableEmptyAction) this.$("emptyVoiceAssistantBtn")?.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!this._lockUiButton(e.currentTarget, [8, 18, 8], { lockMs: 1200, disabled: false })) return;
        this._startVoiceAssistantCommand({ ignoreWhenListening: true });
      });
    }
    if (!emptyActions?.classList.contains("empty-quick-actions")) this._setMobileRandomFabVisible(false);
    this._setMobileRandomFabDisabled(false);
    this._destroyMobileEmbla();
    this._state.mobileArtRenderKey = "";
    if (displayArt) {
      this._syncDynamicThemeArtwork(displayArt).catch(() => {});
    } else {
      this._mobileDynamicThemeToken += 1;
      this._state.mobileDynamicThemeArtwork = "";
      this._state.mobileDynamicThemeArtworkUrl = "";
      this._state.mobileDynamicThemePalette = null;
      this._applyDynamicThemeStyles();
    }
    this._syncSourceBadgesUi(null, null);
    this._syncRecentHistoryUi();
    this._setDecodedBackgroundImage(this.$("mobileArtAura"), !this._isHotelMode() ? displayArt : "");
    this._setDecodedBackgroundImage(this.$("mobileHeroAura"), !this._isHotelMode() ? displayArt : "");
    this._setDecodedBackgroundImage(this.$("compactBackdropArt"), !this._isHotelMode() ? displayArt : "");
    this._setDecodedBackgroundImage(this.$("compactCoverAura"), !this._isHotelMode() ? displayArt : "");
    if (disableShelf) {
      this._state.emptyQuickShelfItems = [];
      const shelf = this.$("emptyQuickShelf");
      if (shelf) {
        shelf.hidden = true;
        shelf.innerHTML = "";
      }
    } else if (!wasEmpty || !this.$("emptyQuickShelf")?.children?.length) {
      this._renderEmptyQuickShelf().catch(() => {});
    }
    this._updateActivePlayersBubble();
  }

  async _playRandomFromPlaylists() {
    try {
      const inEmptyScreen = !!this.shadowRoot?.querySelector(".card")?.classList.contains("empty-media");
      if (inEmptyScreen && await this._playEmptyQuickShelfPick(["playlist", "album"], "ui.playing_a_random_playlist", "ui.random_playlist")) {
        return true;
      }
      const [allPlaylists, likedPlaylists] = await Promise.allSettled([
        this._fetchLibrary("playlist", "sort_name", 500, false),
        this._fetchLibrary("playlist", "sort_name", 180, true),
      ]);
      const playlists = [
        ...(Array.isArray(allPlaylists.value) ? allPlaylists.value : []),
        ...(Array.isArray(likedPlaylists.value) ? likedPlaylists.value : []),
      ]
        .filter((item) => item?.uri)
        .filter((item, index, list) => list.findIndex((candidate) => candidate?.uri === item?.uri) === index);
      if (!playlists.length) {
        this._toastError(this._i18n("ui.no_playlists_found"));
        return false;
      }
      const pick = playlists[Math.floor(Math.random() * playlists.length)];
      if (!pick?.uri) {
        this._toastError(this._i18n("ui.could_not_choose_media"));
        return false;
      }
      const ok = await this._playMedia(pick.uri, pick.media_type || "playlist", "play", {
        label: pick.name || this._i18n("ui.random_playlist"),
        silent: true,
      });
      if (ok) {
        this._showSurprisePopup(pick);
        this._toastSuccess(this._i18n("ui.playing_a_random_playlist"));
      }
      return !!ok;
    } catch (error) {
      this._toastError(error?.message || this._i18n("ui.could_not_start_playback_2"));
      return false;
    }
  }

  async _playRandomRadioStation() {
    try {
      const inEmptyScreen = !!this.shadowRoot?.querySelector(".card")?.classList.contains("empty-media");
      if (inEmptyScreen && await this._playEmptyQuickShelfPick(["radio"], "ui.playing_a_random_radio_station", "ui.random_radio")) {
        return true;
      }
      const [likedRadios, radios, browserRadios] = await Promise.allSettled([
        this._fetchLibrary("radio", "sort_name", 200, true),
        this._fetchLibrary("radio", "sort_name", 400, false),
        this._fetchRadioBrowserStations("", 60, { countryCode: this._mobileRadioBrowserCountry() || "all" }),
      ]);
      const stations = [
        ...(Array.isArray(likedRadios.value) ? likedRadios.value : []),
        ...(Array.isArray(radios.value) ? radios.value : []),
        ...(Array.isArray(browserRadios.value) ? browserRadios.value : []),
      ]
        .map((item) => this._normalizeMediaItem(item))
        .filter((item) => String(item?.uri || "").trim() && String(item?.media_type || "radio").toLowerCase() === "radio")
        .filter((item, index, list) => list.findIndex((candidate) => String(candidate?.uri || "").trim() === String(item?.uri || "").trim()) === index);
      if (!stations.length) {
        this._toastError(this._i18n("ui.no_radio_stations_found"));
        return false;
      }
      const pick = stations[Math.floor(Math.random() * stations.length)];
      const ok = await this._playMedia(pick.uri, "radio", "play", {
        label: pick.name || this._i18n("ui.random_radio"),
        silent: true,
      });
      if (ok) this._toastSuccess(this._i18n("ui.playing_a_random_radio_station"));
      return !!ok;
    } catch (error) {
      this._toastError(error?.message || this._i18n("ui.could_not_start_radio_playback"));
      return false;
    }
  }

  _renderRadioHero() {
    const artHost = this.$("npArt");
    if (!artHost) return;
    artHost.innerHTML = `
      <div class="radio-stage">
        <span class="radio-stage-card radio-stage-card-side"></span>
        <span class="radio-stage-card radio-stage-card-main"></span>
        <span class="radio-stage-card radio-stage-card-side radio-stage-card-side-end"></span>
        <button class="radio-stage-fab" id="radioHeroBtn" aria-label="${this._esc(this._i18n("ui.random_radio"))}">
          ${this._iconSvg("radio")}
        </button>
      </div>
    `;
    this.$("radioHeroBtn")?.addEventListener("click", async (e) => {
      const feedbackEl = this._showLibraryInteractionFeedback(e.currentTarget, { loading: true, hold: true });
      try {
        await this._playRandomRadioStation();
      } finally {
        this._clearLibraryInteractionFeedback(feedbackEl);
      }
    });
  }

  _renderError(error) {
    const notice = this.$("mobileNotice");
    if (notice) {
      notice.classList.add("open");
      notice.textContent = error?.message || String(error || "Unknown error");
    }
  }

  _clearNotice() {
    const notice = this.$("mobileNotice");
    if (!notice) return;
    notice.textContent = "";
    notice.classList.remove("open");
  }

  _syncScreensaverDynamicArtwork() {
    const player = this._getSelectedPlayer();
    const art = this._currentArtworkUrl(player, this._state.maQueueState?.current_item || null, 720, { preferPlayerArtwork: true });
    this._syncDynamicThemeArtwork(art || "").catch(() => {});
  }

  _syncNowPlayingUI() {
    if (this.$("immersiveActionsToggle")) queueMicrotask(() => syncImmersivePlayer(this));
    this._syncSleepTimerState();
    this._syncNightModeUi();
    const player = this._getSelectedPlayer();
    const currentQueueItem = this._state.maQueueState?.current_item || null;
    if (this._lyricsSessionActive?.()) this._syncLyricsForCurrentTrack();
    if (this._state.screensaverOpen) {
      this._syncScreensaverDynamicArtwork();
      this._syncScreensaverUi();
      this._syncAmbientLightForCurrentMedia("screensaver");
      this._syncLocalSendspinMediaSession(player, currentQueueItem);
      return;
    }
    if (!player) {
      this._syncGroupVolumeShortcut(null);
      this._syncControlRoomUi();
      this._resetLocalSendspinMediaSession();
    }
    const compactTileMode = this._isCompactTileMode();
    const syncMobileVolumeControls = () => {
      const volumePct = Math.max(0, Math.min(100, Math.round(this._effectivePlayerVolumeLevel(player) * 100)));
      const slider = this.$("volSlider");
      if (slider) {
        slider.value = volumePct;
        slider.style.setProperty("--vol-pct", `${volumePct}%`);
      }
      const label = this.$("mobileVolPctLabel");
      if (label) label.textContent = `${volumePct}%`;
      this._setButtonIcon(this.$("btnMute"), this._volumeIconName(player));
      this.$("btnMute")?.classList.toggle("active", this._isMuted(player));
      this.$("btnMute")?.classList.toggle("muted", this._isMuted(player));
      return volumePct;
    };
    const renderCompactTile = ({ title = "", subtitle = "", art = "", icon = "album", duration = 0, position = 0, emptyAction = "", upNextItem = null, sourceQueueItem = null }) => {
      if (!compactTileMode) return false;
      const artHost = this.$("npArt");
      const artImage = this.$("compactCoverImage");
      const compactBackdrop = this.$("compactBackdropArt");
      const compactCoverAura = this.$("compactCoverAura");
      const bg = this.$("mobileBg");
      const browseStack = this._mobileArtStackItems();
      const browseOffset = Number(browseStack.offset || 0);
      const compactBrowsePreview = this._mobileSwipeMode() === "browse" && browseOffset !== 0;
      const browseArtists = Array.isArray(browseStack.current?.media_item?.artists)
        ? browseStack.current.media_item.artists.map((artist) => artist?.name).filter(Boolean).join(", ")
        : "";
      const browseTitle = browseStack.current?.media_item?.name || browseStack.current?.media_title || browseStack.current?.name || title;
      const browseArtist = browseStack.current?.media_artist || browseStack.current?.artist_str || browseArtists || browseStack.current?.artist || "";
      const browseAlbum = browseStack.current?.media_item?.album?.name || browseStack.current?.media_album_name || browseStack.current?.album || "";
      const displayTitle = compactBrowsePreview ? (browseTitle || title) : title;
      const displaySubtitle = compactBrowsePreview ? ([browseArtist, browseAlbum].filter(Boolean).join(" · ") || subtitle) : subtitle;
      const displayQueueItem = compactBrowsePreview ? (browseStack.current || sourceQueueItem) : sourceQueueItem;
      const browsePreviewArt = this._queueItemArtworkUrl(browseStack.current, 420, player);
      const effectiveArt = compactBrowsePreview
        ? (browsePreviewArt || art)
        : art;
      const displayArt = this._normalizeArtworkUrl(effectiveArt || "", {
        size: 420,
        cacheKey: this._queueItemArtworkCacheKey(displayQueueItem) || this._currentArtworkCacheKey(player, displayQueueItem),
      });
      const overlay = this._mobileBackdropOverlay(this._effectiveTheme());
      if (artHost) {
        const displayQueueItemId = displayQueueItem
          ? (this._getQueueItemStableId(displayQueueItem) || this._getQueueItemKey(displayQueueItem))
          : "";
        const displayQueueUri = displayQueueItem ? this._getQueueItemUri(displayQueueItem) : "";
        const displaySortIndex = displayQueueItem && Number.isFinite(Number(displayQueueItem?.sort_index))
          ? String(displayQueueItem.sort_index)
          : "";
        artHost.classList.toggle("placeholder", !displayArt);
        artHost.classList.remove("brand-fallback");
        artHost.style.backgroundImage = "";
        artHost.dataset.emptyAction = compactBrowsePreview ? "" : (emptyAction || "");
        artHost.dataset.compactBrowseOffset = compactBrowsePreview ? String(browseOffset) : "0";
        artHost.dataset.queueItemId = compactBrowsePreview ? displayQueueItemId : "";
        artHost.dataset.uri = compactBrowsePreview ? displayQueueUri : "";
        artHost.dataset.type = compactBrowsePreview ? (displayQueueItem?.media_item?.media_type || displayQueueItem?.media_type || "track") : "";
        artHost.dataset.sortIndex = compactBrowsePreview ? displaySortIndex : "";
      }
      if (artImage) {
        this._setDecodedArtworkImage(artImage, displayArt, displayTitle || this._i18n("ui.artwork"));
      }
      this._syncDynamicThemeArtwork(displayArt || effectiveArt || "").catch(() => {});
      this._setDecodedBackgroundImage(compactBackdrop, !this._isHotelMode() ? displayArt : "");
      this._setDecodedBackgroundImage(compactCoverAura, !this._isHotelMode() ? displayArt : "");
      this._setDecodedBackgroundCrossfade(bg, !this._isHotelMode() ? displayArt : "", overlay);
      if (this.$("npTitle")) this.$("npTitle").textContent = displayTitle || this._i18n("ui.nothing_playing");
      this._setNowPlayingSubtitle(displaySubtitle || "—");
      this._syncMobileUpNextUi(upNextItem);
      this._syncSourceBadgesUi(player, displayQueueItem);
      if (this.$("progressFill")) this.$("progressFill").style.width = duration ? `${Math.min(100, (position / duration) * 100)}%` : "0%";
      if (this.$("bigCurTime")) this.$("bigCurTime").textContent = this._fmtDur(position);
      if (this.$("bigTotalTime")) this.$("bigTotalTime").textContent = this._fmtDur(duration);
      this._renderPlayerSummary();
      this._syncStatus();
      this._syncLikeButtons();
      this._updateActivePlayersBubble();
      return true;
    };
    if (!player) {
      this._syncMobileUpNextUi(null);
      this._syncSourceBadgesUi(null, null);
      this._syncRecentHistoryUi();
      const issue = this._state.musicAssistantIssueMessage || this._musicAssistantRequiredMessage();
      const shelf = this.$("emptyQuickShelf");
      if (shelf) {
        shelf.hidden = true;
        shelf.innerHTML = "";
      }
      if (renderCompactTile({
        title: this._musicAssistantRequiredTitle(),
        subtitle: issue,
        art: "",
        icon: "speaker",
        emptyAction: "",
      })) return;
      this._renderEmpty(this._musicAssistantRequiredTitle(), {
        subtitle: issue,
        artIcon: "speaker",
        disableEmptyAction: true,
        disableShelf: true,
      });
      this._syncStatus();
      this._updateActivePlayersBubble();
      this._resetLocalSendspinMediaSession();
      return;
    }
    const cardRoot = this.shadowRoot.querySelector(".card");
    const wasEmptyMedia = !!cardRoot?.classList.contains("empty-media");
    this._syncGroupVolumeShortcut(player);
    cardRoot?.classList.remove("empty-media");
    cardRoot?.classList.remove("radio-media");
    this._hideEmptyPlaybackLoading();
    this.$("activePlayerChip")?.classList.toggle("playing", player.state === "playing");
    this._clearNotice();
    this._setButtonIcon(this.$("btnPlay"), this._playPauseIconName(player));
    this.$("btnPlay")?.classList.toggle("is-playing", player.state === "playing");
    this._setButtonIcon(this.$("btnMute"), this._volumeIconName(player));
    this._setButtonIcon(this.$("controlVolumeBtn"), this._volumeIconName(player));
    this.$("controlVolumeBtn")?.classList.toggle("muted", this._isMuted(player));
    this._setButtonIcon(this.$("mobileShuffleBtn"), "shuffle");
    const repeatMode = player.attributes.repeat || "off";
    const repeatLabel = this._repeatModeLabel(repeatMode);
    this._setButtonIcon(this.$("mobileRepeatBtn"), repeatMode === "one" ? "repeat_one" : "repeat");
    this.$("mobileShuffleBtn")?.classList.toggle("active", !!player.attributes.shuffle);
    const mobileRepeat = this.$("mobileRepeatBtn");
    if (mobileRepeat) {
      mobileRepeat.classList.toggle("active", repeatMode !== "off");
      mobileRepeat.dataset.repeatMode = repeatMode;
      mobileRepeat.title = repeatLabel;
      mobileRepeat.setAttribute("aria-label", repeatLabel);
    }
    const tabletPopupSlider = this.$("tabletPopupVolSlider");
    const tabletPopupMuteBtn = this.$("tabletPopupMuteBtn");
    const tabletPopupVolPct = this.$("tabletPopupVolPct");
    const tabletVol = Math.max(0, Math.min(100, Math.round(this._effectivePlayerVolumeLevel(player) * 100)));
    if (tabletPopupSlider) {
      tabletPopupSlider.value = tabletVol;
      tabletPopupSlider.style.setProperty("--vol-pct", `${tabletVol}%`);
    }
    if (tabletPopupVolPct) tabletPopupVolPct.textContent = `${tabletVol}%`;
    if (tabletPopupMuteBtn) this._setButtonIcon(tabletPopupMuteBtn, this._volumeIconName(player));
    const currentAnchorItem = this._state.maQueueState?.current_item || null;
    const currentAnchorKey = this._getQueueItemStableId(currentAnchorItem)
      || this._getQueueItemUri(currentAnchorItem)
      || `${player.entity_id}:${player.attributes.media_content_id || player.attributes.media_title || ""}`;
    if (this._state.mobileArtAnchorKey !== currentAnchorKey) {
      this._state.mobileArtAnchorKey = currentAnchorKey;
      this._state.mobileArtBrowseOffset = 0;
    }
    const stack = this._mobileArtStackItems();
    const displaySource = this._mobileNowPlayingDisplaySource(player, currentQueueItem, stack);
    const displayQueueItem = displaySource.queueItem || currentQueueItem;
    const currentMedia = displaySource.media || {};
    const hasPendingPlay = displaySource.hasPendingPlay;
    const playerUri = String(player.attributes.media_content_id || "").trim();
    const queueUri = String(displaySource.uri || this._getQueueItemUri(displayQueueItem) || "").trim();
    const currentTitle = displaySource.title;
    const currentArtist = displaySource.artist;
    const currentAlbum = displaySource.album;
    const currentMediaType = displaySource.mediaType;
    const upNextItem = this._mobileUpNextItem();
    const forceRadioHero = !!this._state.forceRadioHero;
    const likelyRadioPlayback = this._isLikelyRadioPlayback(player, displayQueueItem, currentMedia);
    const hasPlayableMedia = !!(player.attributes.media_title || player.attributes.media_content_id || displayQueueItem?.name || currentMedia?.name);
    const quickMixPending = Number(this._state.quickMixPendingUntil || 0) > Date.now() ? this._state.quickMixPendingEntry : null;
    if (hasPlayableMedia && this._state.quickMixPendingUntil) {
      this._state.quickMixPendingUntil = 0;
      this._state.quickMixPendingEntry = null;
    }
    if (!hasPlayableMedia && quickMixPending) {
      const pendingTitle = quickMixPending.name || this._i18n("ui.quick_mix");
      const pendingArt = this._normalizeArtworkUrl(quickMixPending.image || this._currentArtworkUrl(player, currentQueueItem, 420, { preferPlayerArtwork: true }), {
        size: 420,
        cacheKey: `quick-mix:${quickMixPending.uri || pendingTitle}`,
      });
      this.$("mobileArtActions")?.removeAttribute("hidden");
      this._setMobileRandomFabVisible(true);
      this._setMobileRandomFabDisabled(true);
      if (renderCompactTile({
        title: pendingTitle,
        subtitle: this._i18n("ui.starting_quick_mix"),
        art: pendingArt,
        icon: "radio",
        duration: 0,
        position: 0,
        upNextItem: null,
        sourceQueueItem: displayQueueItem,
      })) {
        syncMobileVolumeControls();
        return;
      }
      if (this.$("npTitle")) this.$("npTitle").textContent = pendingTitle;
      this._setNowPlayingSubtitle(this._i18n("ui.starting_quick_mix"));
      if (this.$("npArt")) {
        this.$("npArt").innerHTML = this._decodedArtworkImgHtml(pendingArt, pendingTitle, { current: true, fallbackIcon: "radio" });
        this._hydrateDecodedArtworkImages(this.$("npArt"));
      }
      if (this.$("progressFill")) this.$("progressFill").style.width = "0%";
      this._syncDynamicThemeArtwork(pendingArt || "").catch(() => {});
      syncMobileVolumeControls();
      this._syncControlRoomUi();
      return;
    }
    if (!hasPlayableMedia) {
      this._state.forceRadioHero = false;
      this._syncSourceBadgesUi(null, null);
      this._syncRecentHistoryUi();
      if (renderCompactTile({
        title: this._i18n("ui.player_is_ready"),
        subtitle: player.attributes?.friendly_name || this._i18n("ui.nothing_is_playing_right_now"),
        art: displaySource.art || this._displayArtworkForQueueItem(player, displayQueueItem, { pending: hasPendingPlay, size: 420 }),
        duration: 0,
        position: 0,
        emptyAction: "random",
        upNextItem: null,
        sourceQueueItem: displayQueueItem,
      })) {
        this.$("btnPlay")?.classList.remove("is-playing");
        syncMobileVolumeControls();
        return;
      }
      this._renderEmpty(HomeiiPlayersFoundation.isPlayerAvailable(player)
        ? this._i18n("ui.player_is_ready_nothing_is_playing_right_now")
        : this._m("This player is offline. Choose an available player.", "הנגן אינו מחובר. בחר נגן זמין."), { wasEmptyMedia });
      this._syncMobileUpNextUi(null);
      this.$("btnPlay")?.classList.remove("is-playing");
      this._renderPlayerSummary();
      this._syncStatus();
      this._syncLikeButtons();
      this._updateActivePlayersBubble();
      this._syncControlRoomUi();
      this._syncLocalSendspinMediaSession(player, displayQueueItem);
      return;
    }
    this._syncActiveQuickActionRow();
    const isRadioNowPlaying = currentMediaType === "radio" || forceRadioHero || likelyRadioPlayback;
    if (isRadioNowPlaying) {
      cardRoot?.classList.add("radio-media");
    }
    this._state.forceRadioHero = false;
    const emptyShelf = this.$("emptyQuickShelf");
    if (emptyShelf) {
      emptyShelf.hidden = true;
      emptyShelf.innerHTML = "";
    }
    this.$("mobileArtActions")?.removeAttribute("hidden");
    this._setMobileRandomFabVisible(true);
    this._setMobileRandomFabDisabled(false);
    if (this.$("npTitle")) this.$("npTitle").textContent = currentTitle;
    this._setNowPlayingSubtitle([currentArtist || player.attributes.media_artist || "", currentAlbum].filter(Boolean).join(" · ") || "—");
    this._rememberRecentPlayback(player, displayQueueItem);
    this._syncRecentHistoryUi();
    this._syncSourceBadgesUi(player, displayQueueItem);
    this._syncMobileUpNextUi(upNextItem);
    const playingArt = displaySource.art || this._displayArtworkForQueueItem(player, displayQueueItem, { pending: hasPendingPlay, size: 420 });
    const previewArt = this._queueItemArtworkUrl(stack.current, 420, player) || playingArt;
    const art = this._mobileBrowsePreviewActive(stack)
      ? playingArt
      : (hasPendingPlay ? playingArt : ((Number(stack.offset || 0) !== 0 && previewArt) ? previewArt : playingArt));
    const duration = this._getCurrentDuration();
    const position = this._getCurrentPosition();
    if (renderCompactTile({
      title: currentTitle,
      subtitle: [currentArtist || player.attributes.media_artist || "", currentAlbum].filter(Boolean).join(" · ") || "—",
      art,
      duration,
      position,
      upNextItem,
      sourceQueueItem: displayQueueItem,
    })) {
      syncMobileVolumeControls();
      this._syncControlRoomUi();
      return;
    }
    this._refreshMobileArtStack();
    const bg = this.$("mobileBg");
    if (bg) {
      const overlay = this._mobileBackdropOverlay(this._effectiveTheme());
      this._setDecodedBackgroundCrossfade(bg, !this._isHotelMode() ? art : "", overlay);
    }
    this._syncDynamicThemeArtwork(art || "").catch(() => {});
    const vol = Math.round(this._effectivePlayerVolumeLevel(player) * 100);
    if (this.$("volSlider")) {
      this.$("volSlider").value = vol;
      this.$("volSlider").style.setProperty("--vol-pct", `${vol}%`);
    }
    this.$("btnMute")?.classList.toggle("active", this._isMuted(player));
    this.$("btnMute")?.classList.toggle("muted", this._isMuted(player));
    const volLabel = this.$("mobileVolPctLabel");
    if (volLabel) volLabel.textContent = `${vol}%`;
    if (this.$("progressFill")) this.$("progressFill").style.width = duration ? `${Math.min(100, (position / duration) * 100)}%` : "0%";
    if (this.$("bigCurTime")) this.$("bigCurTime").textContent = this._fmtDur(position);
    if (this.$("bigTotalTime")) this.$("bigTotalTime").textContent = this._fmtDur(duration);
    const nowPlayingUri = hasPendingPlay ? (queueUri || playerUri || "") : (playerUri || queueUri || "");
    if (nowPlayingUri !== this._state.nowPlayingUri) {
      this._state.nowPlayingUri = nowPlayingUri;
      this._highlightNowPlaying();
    }
    this._renderPlayerSummary();
    this._syncStatus();
    this._syncLikeButtons();
    this._updateActivePlayersBubble();
    this._syncControlRoomUi();
    if (this._state.screensaverOpen) this._syncScreensaverUi();
    this._syncLocalSendspinMediaSession(player, displayQueueItem);
  }

  _syncNowPlayingPageLive() {
    this._syncNowPlayingUI();
  }

  _mobileMenuScrollTargets(body = this.$("mobileMenuBody")) {
    if (!body) return [];
    const candidates = [
      ["body", body],
      ["libraryBody", body.querySelector?.(".library-body")],
      ["mediaResults", body.querySelector?.("#mobileMediaSearchResults")],
      ["mediaList", body.querySelector?.(".media-items-list")],
      ["queueFlow", body.querySelector?.("[data-queue-flow-picker]")],
      ["queueList", body.querySelector?.(".queue-list")],
    ];
    const seen = new Set();
    return candidates.filter(([, el]) => {
      if (!el || seen.has(el)) return false;
      seen.add(el);
      return true;
    });
  }

  _captureMobileMenuScroll(page = this._state.menuPage || "main") {
    const body = this.$("mobileMenuBody");
    if (!body) return null;
    const positions = {};
    this._mobileMenuScrollTargets(body).forEach(([key, el]) => {
      positions[key] = { top: el.scrollTop || 0, left: el.scrollLeft || 0 };
    });
    return { page: String(page || "main"), positions };
  }

  _rememberMobileMenuScroll(page = this._state.menuPage || "main") {
    const snapshot = this._captureMobileMenuScroll(page);
    if (!snapshot) return;
    if (!this._state.mobileMenuScrollPositions || typeof this._state.mobileMenuScrollPositions !== "object") {
      this._state.mobileMenuScrollPositions = {};
    }
    this._state.mobileMenuScrollPositions[snapshot.page] = snapshot.positions || {};
    if (snapshot.page === "settings") this._state.mobileSettingsScrollTop = snapshot.positions?.body?.top || 0;
  }

  _restoreMobileMenuScrollSnapshot(snapshot = null, page = this._state.menuPage || "main") {
    const key = String(page || snapshot?.page || "main");
    const positions = snapshot?.positions || this._state.mobileMenuScrollPositions?.[key] || {};
    const apply = () => {
      const body = this.$("mobileMenuBody");
      if (!body) return;
      this._mobileMenuScrollTargets(body).forEach(([targetKey, el]) => {
        const saved = positions[targetKey];
        if (!saved) return;
        const maxTop = Math.max(0, el.scrollHeight - el.clientHeight);
        const maxLeft = Math.max(0, el.scrollWidth - el.clientWidth);
        const nextTop = Math.min(Math.max(0, Number(saved.top || 0) || 0), maxTop);
        const nextLeft = Math.min(Math.max(0, Number(saved.left || 0) || 0), maxLeft);
        try { el.scrollTo({ top: nextTop, left: nextLeft, behavior: "auto" }); } catch (_) {
          el.scrollTop = nextTop;
          el.scrollLeft = nextLeft;
        }
        el.scrollTop = nextTop;
        el.scrollLeft = nextLeft;
      });
    };
    apply();
    // Repeated delayed restores fight native momentum in scrolling media lists.
    if (key.startsWith("library_") || key === "queue") return;
    requestAnimationFrame(() => {
      apply();
      requestAnimationFrame(apply);
    });
    setTimeout(apply, 80);
    setTimeout(apply, 180);
  }

  _restoreMobileMenuScroll(scrollTop = this._state.mobileSettingsScrollTop || 0, page = this._state.menuPage || "main") {
    const key = String(page || "main");
    const positions = { ...(this._state.mobileMenuScrollPositions?.[key] || {}) };
    if (Number.isFinite(Number(scrollTop))) {
      positions.body = { ...(positions.body || {}), top: Math.max(0, Number(scrollTop || 0) || 0) };
    }
    if (key === "settings") this._state.mobileSettingsScrollTop = positions.body?.top || 0;
    this._restoreMobileMenuScrollSnapshot({ page: key, positions }, key);
  }

  _normalizeMobileMenuPage(page = "main") {
    const raw = String(page || "main").trim().toLowerCase();
    const aliases = {
      actions: "main",
      menu: "main",
      player: "players",
      player_select: "players",
      select_player: "players",
      speaker: "players",
      speakers: "players",
      speaker_select: "players",
      active_players: "players_active",
    };
    const normalized = aliases[raw] || raw || "main";
    if (this._isHotelMode()) {
      const allowed = new Set(["main", "players", "players_active", "quick_search", "library_search", "media_detail", "artist_album_flow"]);
      return allowed.has(normalized) || String(normalized || "").startsWith("library_search") ? normalized : "main";
    }
    return normalized;
  }

  _restoreMobileMenuAfterBuild(reason = "build") {
    if (!this._state.menuOpen) return;
    this._state.menuPage = this._normalizeMobileMenuPage(this._state.menuPage || "main");
    this.$("mobileMenu")?.classList.add("open");
    this._renderMobileMenu().catch((error) => {
      this._debugLog?.("warn", `[Homeii Menu] failed to restore mobile menu after ${reason}`, error);
    });
  }

  _reopenSettingsMenuPreservingScroll({ rebuild = false, init = false } = {}) {
    const body = this.$("mobileMenuBody");
    const scrollTop = Math.max(0, Number(body?.scrollTop ?? this._state.mobileSettingsScrollTop ?? 0) || 0);
    this._state.mobileSettingsScrollTop = scrollTop;
    if (rebuild) this._build();
    if (init) this._init();
    this._openMobileMenu("settings", { scrollTop });
    this._restoreMobileMenuScroll(scrollTop, "settings");
  }

  /**
   * Lightweight refresh after a Settings change. Re-renders ONLY the
   * Settings menu body and any specifically-affected surface, instead of
   * rebuilding the entire card. Preserves scroll. Falls through to the
   * heavy _reopenSettingsMenuPreservingScroll if `categories.unknown` is true.
   *
   * Categories (all optional, default false):
   *   playerListChanged    — Pinned/excluded set changed; reload player list
   *                          and refresh the player chip strip.
   *   pinnedChanged        — Pinned player set changed; also re-evaluate the
   *                          front-pinned player.
   *   mainBarChanged       — Main-bar item visibility changed.
   *   quickActionsChanged  — Quick-action selection or order changed.
   *   libraryTabsChanged   — Library tab visibility changed.
   *   unknown              — Caller is not sure what changed; fall back to
   *                          the heavy path.
   */
  _refreshAfterSettingsChange(categories = {}) {
    if (categories.unknown || categories.mainBarChanged) {
      // The main-bar footer is built inline inside _build() and has no
      // separate surgical render method. Fall back to the heavy path so the
      // new/removed footer buttons appear immediately.
      this._reopenSettingsMenuPreservingScroll({ rebuild: true, init: true });
      return;
    }
    const body = this.$("mobileMenuBody");
    const scrollTop = Math.max(0, Number(body?.scrollTop ?? this._state.mobileSettingsScrollTop ?? 0) || 0);
    this._state.mobileSettingsScrollTop = scrollTop;
    if (categories.playerListChanged) {
      this._loadPlayers();
      // Refresh the active-player chip in the now-playing area so excluded
      // players disappear and the friendly name updates without a full rebuild.
      if (typeof this._renderPlayerSummary === "function") this._renderPlayerSummary();
    }
    if (categories.quickActionsChanged) {
      // Refresh the Quick Actions row in the now-playing area so toggled
      // checkboxes are immediately reflected on the card itself.
      if (typeof this._syncActiveQuickActionRow === "function") {
        this._syncActiveQuickActionRow({ force: true });
      }
    }
    void categories.libraryTabsChanged;
    this._openMobileMenu("settings", { scrollTop });
    this._restoreMobileMenuScroll(scrollTop, "settings");
  }

  _openMobileMenu(page = "main", options = {}) {
    const nextPage = this._normalizeMobileMenuPage(page);
    if (nextPage === "settings" && this._usesVisualSettings()) {
      this._toastSuccess(this._i18n("ui.card_settings_are_managed_from_the_visual_editor"));
      return;
    }
    const wasOpen = !!this._state.menuOpen;
    const previousPage = this._state.menuPage || "main";
    if (nextPage === "simple_wizard" && previousPage !== "simple_wizard") this._resetSimpleWizardState();
    if (nextPage === "discovery" && previousPage !== "discovery") this._startDiscoverySession();
    if (wasOpen) this._rememberMobileMenuScroll(previousPage);
    const hasExplicitScrollTop = options?.scrollTop !== undefined && options?.scrollTop !== null;
    const explicitScrollTop = Number(options?.scrollTop);
    const rememberedSettingsScrollTop = nextPage === "settings" ? Number(this._state.mobileSettingsScrollTop || 0) : null;
    const samePageScrollTop = wasOpen && previousPage === nextPage ? (this.$("mobileMenuBody")?.scrollTop || 0) : null;
    const restoreScrollTop = hasExplicitScrollTop && Number.isFinite(explicitScrollTop)
      ? explicitScrollTop
      : (Number.isFinite(samePageScrollTop) && samePageScrollTop > 0
        ? samePageScrollTop
        : (Number.isFinite(rememberedSettingsScrollTop) && rememberedSettingsScrollTop > 0 ? rememberedSettingsScrollTop : samePageScrollTop));
    this._state.menuOpen = true;
    this._state.menuPage = nextPage;
    let initialQueueScrollTop = null;
    if (!wasOpen || previousPage !== nextPage) {
      if (nextPage === "queue") {
        const queueItems = this._getNowPlayingQueueItems();
        const currentIndex = queueItems.findIndex((item) => this._isQueueItemCurrent(item));
        this._queueVirtualStart = currentIndex >= 0
          ? Math.max(0, Math.min(Math.max(0, queueItems.length - 72), currentIndex - 12))
          : 0;
        if (this._queueVirtualStart > 0 && options?.queueFlow !== true) {
          initialQueueScrollTop = this._queueVirtualStart * 104;
        }
      }
      this._mediaVirtualStarts.set(this._mediaVirtualPageKey(nextPage), 0);
    }
    this._state.mobileQueueFlowQuickOpen = nextPage === "queue" && options?.queueFlow === true;
    if (!String(nextPage || "").startsWith("library_") && nextPage !== "media_detail") {
      this._state.mobileMediaLayoutManual = false;
      this._state.mobileLibraryFlowPage = "";
    }
    this._applyLibraryDefaultLayoutForPage(this._state.menuPage);
    if (nextPage === "main" || nextPage === "settings" || String(nextPage).startsWith("library_")) this._state.menuStack = [];
    if (this._isManualFrontContentSelectionPage(nextPage)) {
      this._refreshManualFrontPlayerHold(this._manualFrontContentHoldMs());
    }
    this.$("mobileMenu")?.classList.add("open");
    this._syncCompactMenuOverlayState();
    const renderTask = Promise.resolve(this._renderMobileMenu()).catch((error) => {
      this._debugLog?.("warn", "[Homeii Menu] failed to render mobile menu", error);
      this._state.menuOpen = false;
      this._state.menuPage = "main";
      this.$("mobileMenu")?.classList.remove("open", "search-open", "discovery-open", "action-fullscreen-open", "library-fullscreen-open");
      this._syncCompactMenuOverlayState();
      this._toastError(error?.message || this._i18n("ui.try_again"));
    });
    const requestedScrollTop = restoreScrollTop !== null ? restoreScrollTop : initialQueueScrollTop;
    if (requestedScrollTop !== null) {
      renderTask.finally(() => {
        this._restoreMobileMenuScroll(requestedScrollTop, nextPage);
      });
    }
  }

  _closeMobileMenu() {
    this._state.menuOpen = false;
    this._state.menuPage = "main";
    this._state.menuStack = [];
    this._state.mobileQueueFlowQuickOpen = false;
    this._state.mobileMediaLayoutManual = false;
    this._state.mobileLibraryFlowPage = "";
    this._shortenManualFrontPlayerHold(this._manualFrontDefaultHoldMs());
    this._closeMobileQueueActionMenu();
    clearTimeout(this._mobileQueueArtworkPrefetchTimer);
    this._mobileQueueArtworkPrefetchTimer = null;
    this._closeSmartVoiceConfirm();
    this._syncCompactMenuOverlayState();
    this.$("mobileMenu")?.classList.remove("open", "search-open", "discovery-open", "action-fullscreen-open", "library-fullscreen-open");
    this.$("homeShortcutFab")?.removeAttribute("hidden");
    this.$("mobileMenuBody")?.classList.remove("search-mode", "library-mode", "library-flow-mode");
    if (this._state.controlRoomRestoreAfterMenu && this._controlRoomEnabled()) {
      this._state.controlRoomRestoreAfterMenu = false;
      this._state.controlRoomPanel = "";
      this._state.controlRoomOpen = true;
      this._syncControlRoomUi();
    }
  }

  _backMobileMenu() {
    if (this._state.menuPage === "media_detail" && Array.isArray(this._state.mobileLibraryDetailStack) && this._state.mobileLibraryDetailStack.length) {
      const previousDetail = this._state.mobileLibraryDetailStack.pop();
      const scrollSnapshot = previousDetail?._homeiiScrollSnapshot || null;
      const parentPage = previousDetail?._homeiiParentPage || this._libraryDetailParentPageForType(previousDetail?.media_type);
      const { _homeiiScrollSnapshot, _homeiiParentPage, ...detail } = previousDetail || {};
      this._state.mobileLibraryDetail = detail;
      this._state.mobileLibraryDetailParentPage = parentPage;
      this._syncCompactMenuOverlayState();
      this._renderMobileMenu();
      if (scrollSnapshot) {
        requestAnimationFrame(() => this._restoreMobileMenuScrollSnapshot(scrollSnapshot, "media_detail"));
      }
      return;
    }
    const prevRaw = this._state.menuStack.pop();
    if (!prevRaw) return this._closeMobileMenu();
    const prev = this._normalizeMobileMenuPage(prevRaw);
    this._state.menuPage = prev;
    if (prev !== "queue") this._state.mobileQueueFlowQuickOpen = false;
    this._applyLibraryDefaultLayoutForPage(this._state.menuPage);
    this._syncCompactMenuOverlayState();
    this._renderMobileMenu();
  }

  _pushMobileMenu(page) {
    const nextPage = this._normalizeMobileMenuPage(page);
    if (!nextPage || nextPage === this._state.menuPage) return;
    if (nextPage === "simple_wizard") this._resetSimpleWizardState();
    if (nextPage === "discovery") this._startDiscoverySession();
    this._state.menuStack.push(this._state.menuPage);
    this._state.menuPage = nextPage;
    if (nextPage !== "queue") this._state.mobileQueueFlowQuickOpen = false;
    if (!String(nextPage || "").startsWith("library_") && nextPage !== "media_detail") {
      this._state.mobileMediaLayoutManual = false;
      this._state.mobileLibraryFlowPage = "";
    }
    this._applyLibraryDefaultLayoutForPage(this._state.menuPage);
    if (this._isManualFrontContentSelectionPage(nextPage)) {
      this._refreshManualFrontPlayerHold(this._manualFrontContentHoldMs());
    }
    this._syncCompactMenuOverlayState();
    this._renderMobileMenu();
  }

  _applyLibraryDefaultLayoutForPage(page = this._state.menuPage) {
    if (!String(page || "").startsWith("library_")) return;
    if (this._state.mobileMediaLayoutManual === true) return;
    this._state.mobileMediaLayout = this._defaultMobileMediaLayout();
  }

  _isPhoneActionFullscreenMenuPage(page = "") {
    if (String(page || "") === "media_detail") return true;
    if (String(page || "") === "artist_album_flow") return true;
    if (String(page || "").startsWith("library_")) return true;
    return new Set([
      "main",
      "simple_wizard",
      "queue_settings",
      "quick_search",
      "players",
      "players_active",
      "sleep_timer",
      "announcements",
      "diagnostics",
      "queue",
      "transfer",
      "group",
      "ungroup_all",
      "stop_all",
    ]).has(String(page || ""));
  }

  _compactMenuOverlayOpen() {
    if (!this._isCompactTileMode() || !this._state?.menuOpen || !this._isPhoneActionFullscreenMenuPage(this._state.menuPage)) return false;
    const menu = this.$("mobileMenu");
    return !!menu?.classList?.contains("open");
  }

  _syncCompactMenuOverlayState() {
    const open = this._compactMenuOverlayOpen();
    this.classList.toggle("compact-menu-open", open);
    this.shadowRoot?.querySelector(".card")?.classList.toggle("compact-menu-open", open);
  }

  _isMobileSearchPage(page = this._state.menuPage) {
    return ["library_search", "quick_search"].includes(String(page || ""));
  }

  _navMenuItem(page, icon, title, subtitle = "", tone = "default") {
    return `
      <button class="menu-item action-tile tone-${this._esc(tone)}" data-menu-nav="${this._esc(page)}" title="${this._esc(title)}" aria-label="${this._esc(title)}">
        <span class="menu-item-main">
          <span class="menu-item-ico">${icon}</span>
          <span style="min-width:0;flex:1;">
            <span class="menu-item-title">${this._esc(title)}</span>
            <span class="menu-item-sub">${this._esc(subtitle)}</span>
          </span>
        </span>
      </button>
    `;
  }

  _createSimpleWizardState(overrides = {}) {
    return {
      step: "players",
      selectedPlayers: [],
      source: "genre",
      genre: "pop",
      customGenre: "",
      contentType: "playlist",
      query: "",
      candidates: [],
      selectedIndex: 0,
      loading: false,
      error: "",
      ...overrides,
    };
  }

  _resetSimpleWizardState() {
    this._simpleWizardToken = (this._simpleWizardToken || 0) + 1;
    this._state.simpleWizard = this._createSimpleWizardState({ selectedPlayers: this._simpleWizardDefaultPlayerIds() });
  }

  _simpleWizardPlayerPool() {
    this._loadPlayers();
    const players = Array.isArray(this._state.players) ? this._state.players : [];
    const pinnedEntities = new Set(this._resolvedPinnedPlayerEntities(players));
    return players
      .filter((player) => player?.entity_id)
      .filter((player) => !(typeof this._isLikelyBrowserPlayer === "function" && this._isLikelyBrowserPlayer(player)))
      .filter((player) => !pinnedEntities.size || pinnedEntities.has(player.entity_id) || this._isLocalSendspinPlayer(player));
  }

  _simpleWizardDefaultPlayerIds(players = this._simpleWizardPlayerPool()) {
    const selected = String(this._state.selectedPlayer || "").trim();
    if (selected && players.some((player) => player.entity_id === selected)) return [selected];
    const active = players.find((player) => this._isPlayerActive(player));
    return (active || players[0])?.entity_id ? [(active || players[0]).entity_id] : [];
  }

  _simpleWizardState() {
    const base = this._state.simpleWizard && typeof this._state.simpleWizard === "object"
      ? this._state.simpleWizard
      : this._createSimpleWizardState();
    const defaults = this._createSimpleWizardState();
    Object.keys(defaults).forEach((key) => {
      if (base[key] === undefined) base[key] = defaults[key];
    });
    const players = this._simpleWizardPlayerPool();
    const validIds = new Set(players.map((player) => player.entity_id));
    const selectedPlayers = (Array.isArray(base.selectedPlayers) ? base.selectedPlayers : [])
      .map((entityId) => String(entityId || "").trim())
      .filter((entityId, index, list) => entityId && validIds.has(entityId) && list.indexOf(entityId) === index);
    if (!selectedPlayers.length) selectedPlayers.push(...this._simpleWizardDefaultPlayerIds(players));
    base.selectedPlayers = selectedPlayers;
    base.source = base.source === "content" ? "content" : "genre";
    base.genre = this._simpleWizardGenres().some((genre) => genre.id === base.genre) ? base.genre : "pop";
    base.contentType = this._simpleWizardContentTypes().some((type) => type.id === base.contentType) ? base.contentType : "playlist";
    this._state.simpleWizard = base;
    return base;
  }

  _musicStyleCatalog(options = {}) {
    const t = (en, he, de = en) => this._discoveryGenreLabel(en, he, de);
    const style = (id, icon, label, subtitle, queries, extra = {}) => ({
      id,
      key: id,
      icon,
      label,
      subtitle,
      query: queries?.[0] || label,
      queries,
      ...extra,
    });
    const styles = [
      style("pop", "music_note", "Pop", t("Popular hits", "להיטים פופולריים"), ["pop hits playlist", "top pop playlist", "pop music"]),
      style("indie-pop", "music_note", "Indie Pop", t("Fresh alternative pop", "פופ אלטרנטיבי רענן"), ["indie pop playlist", "fresh indie pop", "alternative pop"]),
      style("k-pop", "music_note", "K-Pop", t("Korean pop", "פופ קוריאני"), ["k-pop playlist", "kpop hits", "korean pop"]),
      style("j-pop", "music_note", "J-Pop", t("Japanese pop", "פופ יפני"), ["j-pop playlist", "jpop hits", "japanese pop"]),
      style("hip-hop", "tracks", "Hip-Hop", t("Beats and flow", "ביטים וקצב"), ["hip hop playlist", "hip hop hits", "rap hip hop"]),
      style("rap", "tracks", "Rap", t("Rap essentials", "מיטב הראפ"), ["rap playlist", "rap hits", "new rap"]),
      style("trap", "tracks", "Trap", t("Modern trap", "טראפ עכשווי"), ["trap playlist", "trap hits", "modern trap"]),
      style("rnb", "heart_filled", "R&B", t("Smooth rhythm", "R&B"), ["r&b playlist", "rnb hits", "smooth r&b"]),
      style("soul", "heart_filled", "Soul", t("Warm vocals", "קולות חמים"), ["soul playlist", "neo soul", "soul classics"]),
      style("funk", "radio", "Funk", t("Groove and bass", "גרוב ובאס"), ["funk playlist", "funk classics", "groove funk"]),
      style("rock", "album", "Rock", t("Guitars and bands", "גיטרות ולהקות"), ["rock playlist", "rock hits", "rock music"]),
      style("classic-rock", "album", "Classic Rock", t("Rock classics", "קלאסיקות רוק"), ["classic rock playlist", "rock classics", "70s rock"]),
      style("alternative-rock", "album", "Alternative Rock", t("Alternative bands", "להקות אלטרנטיביות"), ["alternative rock playlist", "alt rock", "alternative music"]),
      style("indie-rock", "album", "Indie Rock", t("Independent rock", "רוק עצמאי"), ["indie rock playlist", "indie bands", "garage rock"]),
      style("punk", "album", "Punk", t("Fast guitars", "גיטרות מהירות"), ["punk rock playlist", "punk hits", "pop punk"]),
      style("metal", "album", "Metal", t("Heavy guitars", "גיטרות כבדות"), ["metal playlist", "heavy metal", "metal hits"]),
      style("electronic", "grid", "Electronic", t("Electronic music", "מוזיקה אלקטרונית"), ["electronic playlist", "electronica", "electronic music"]),
      style("edm", "grid", "EDM", t("Festival energy", "EDM"), ["edm playlist", "edm hits", "festival edm"]),
      style("house", "grid", "House", t("House music", "מוזיקת האוס"), ["house music playlist", "house hits", "club house"]),
      style("deep-house", "grid", "Deep House", t("Deep club sound", "צליל מועדונים עמוק"), ["deep house playlist", "deep house music", "melodic house"]),
      style("tech-house", "grid", "Tech House", t("Club groove", "גרוב למועדונים"), ["tech house playlist", "tech house music", "club tech house"]),
      style("techno", "grid", "Techno", t("Driving electronic", "אלקטרוניקה קצבית"), ["techno playlist", "techno music", "melodic techno"]),
      style("trance", "grid", "Trance", t("Uplifting trance", "טראנס מרומם"), ["trance playlist", "uplifting trance", "psytrance"]),
      style("drum-bass", "grid", "Drum & Bass", t("Fast breaks", "מקצבים מהירים"), ["drum and bass playlist", "dnb playlist", "liquid drum and bass"]),
      style("dubstep", "grid", "Dubstep", t("Bass drops", "באסים עוצמתיים"), ["dubstep playlist", "bass music", "dubstep hits"]),
      style("dance", "radio", "Dance", t("Dance hits", "להיטי דאנס"), ["dance playlist", "dance hits", "dance pop"]),
      style("disco", "radio", "Disco", t("Disco classics", "קלאסיקות דיסקו"), ["disco playlist", "disco classics", "nu disco"]),
      style("party", "radio", this._i18n("ui.party"), t("Party hits", "להיטים למסיבה"), ["party hits playlist", "party music", "dance party"]),
      style("workout", "stats", "Workout", t("Training energy", "אנרגיה לאימון"), ["workout playlist", "gym music", "running playlist"]),
      style("jazz", "music_note", "Jazz", t("Jazz essentials", "מיטב הג׳אז"), ["jazz playlist", "smooth jazz", "vocal jazz"]),
      style("blues", "music_note", "Blues", t("Blues classics", "קלאסיקות בלוז"), ["blues playlist", "blues classics", "modern blues"]),
      style("classical", "album", "Classical", t("Classical music", "מוזיקה קלאסית"), ["classical music playlist", "classical essentials", "orchestra classical"]),
      style("piano", "album", "Piano", t("Piano focus", "פסנתר לריכוז"), ["piano playlist", "classical piano", "peaceful piano"]),
      style("ambient", "moon", "Ambient", t("Soundscapes", "נופי צליל"), ["ambient playlist", "ambient music", "soundscape"]),
      style("chill", "moon", "Chill", t("Relaxed listening", "האזנה רגועה"), ["chill playlist", "chillout music", "relaxing chill"]),
      style("lofi", "moon", "Lo-Fi", t("Lo-fi beats", "ביטים של לו־פיי"), ["lo-fi playlist", "lofi beats", "lo-fi hip hop"]),
      style("acoustic", "album", "Acoustic", t("Unplugged sound", "צליל אקוסטי"), ["acoustic playlist", "unplugged music", "acoustic chill"]),
      style("folk", "album", "Folk", t("Folk songs", "שירי פולק"), ["folk playlist", "singer songwriter", "indie folk"]),
      style("country", "album", "Country", t("Country music", "מוזיקת קאנטרי"), ["country playlist", "country hits", "americana"]),
      style("reggae", "radio", "Reggae", t("Island groove", "מקצבי איים"), ["reggae playlist", "reggae classics", "dancehall reggae"]),
      style("latin", "radio", "Latin", t("Latin music", "מוזיקה לטינית"), ["latin playlist", "latin hits", "latin pop"]),
      style("reggaeton", "radio", "Reggaeton", t("Latin urban", "אורבני לטיני"), ["reggaeton playlist", "reggaeton hits", "latin urban"]),
      style("salsa", "radio", "Salsa", t("Salsa dance", "ריקודי סלסה"), ["salsa playlist", "salsa classics", "latin salsa"]),
      style("bachata", "radio", "Bachata", t("Bachata rhythm", "מקצבי בצ׳אטה"), ["bachata playlist", "bachata hits", "latin bachata"]),
      style("afrobeats", "radio", "Afrobeats", t("Afro rhythm", "מקצבים אפריקאיים"), ["afrobeats playlist", "afrobeats hits", "afropop"]),
      style("amapiano", "radio", "Amapiano", t("South African groove", "גרוב דרום אפריקאי"), ["amapiano playlist", "amapiano hits", "afro house amapiano"]),
      style("world", "radio", "World", t("Global sounds", "צלילים מהעולם"), ["world music playlist", "global music", "international playlist"]),
      style("soundtrack", "album", "Soundtracks", t("Movies and series", "סרטים וסדרות"), ["soundtrack playlist", "movie soundtracks", "film music"]),
      style("meditation", "moon", "Meditation", t("Calm focus", "ריכוז רגוע"), ["meditation music", "calm meditation", "relaxing instrumental"]),
      style("sleep", "moon", "Sleep", t("Quiet night", "לילה שקט"), ["sleep music", "sleep playlist", "deep sleep music"]),
      style("kids", "heart_filled", this._i18n("ui.kids"), t("Family music", "מוזיקה לכל המשפחה"), ["kids music playlist", "children songs", "family music kids"]),
      style("israeli", "music_note", this._i18n("ui.israeli"), t("Israeli music", "מוזיקה ישראלית"), ["מוזיקה ישראלית","israeli music","israeli hits"]),
      style("hebrew-hits", "music_note", t("Hebrew Hits", "להיטים בעברית"), t("Hebrew songs", "שירים בעברית"), ["להיטים בעברית","שירים בעברית","hebrew hits playlist"]),
      style("mizrahi", "radio", t("Mizrahi", "מזרחית"), t("Mediterranean pop", "פופ ים תיכוני"), ["מוזיקה מזרחית","להיטים מזרחית","mizrahit music"]),
      style("mediterranean", "radio", t("Mediterranean", "ים תיכונית"), t("Warm regional sound", "צליל ים תיכוני חם"), ["mediterranean music playlist","ים תיכונית","greek turkish mediterranean music"]),
      style("arabic", "radio", t("Arabic", "ערבית"), t("Arabic music", "מוזיקה ערבית"), ["arabic music playlist", "arabic hits", "middle eastern music"]),
      style("turkish", "radio", t("Turkish", "טורקית"), t("Turkish music", "מוזיקה טורקית"), ["turkish music playlist", "turkish pop", "turkish hits"]),
      style("greek", "radio", t("Greek", "יוונית"), t("Greek music", "מוזיקה יוונית"), ["greek music playlist", "greek hits", "greek pop"]),
      style("french", "radio", t("French", "צרפתית"), t("French music", "מוזיקה צרפתית"), ["french music playlist", "french pop", "chanson francaise"]),
      style("spanish", "radio", t("Spanish", "ספרדית"), t("Spanish music", "מוזיקה ספרדית"), ["spanish music playlist", "spanish pop", "musica espanola"]),
      style("singer-songwriter", "album", "Singer-Songwriter", t("Personal songs", "שירים אישיים"), ["singer songwriter playlist", "singer-songwriter", "acoustic singer songwriter"]),
      style("soft-pop", "music_note", "Soft Pop", t("Soft pop songs", "שירי פופ רכים"), ["soft pop playlist", "soft pop hits", "easy pop"]),
      style("pop-rock", "album", "Pop Rock", t("Pop guitars", "גיטרות פופ"), ["pop rock playlist", "pop rock hits", "guitar pop"]),
      style("electropop", "grid", "Electropop", t("Electronic pop", "פופ אלקטרוני"), ["electropop playlist", "electro pop", "synth pop"]),
      style("synth-pop", "grid", "Synth Pop", t("Synth classics", "קלאסיקות סינת׳"), ["synth pop playlist", "synthpop classics", "80s synth pop"]),
      style("dream-pop", "moon", "Dream Pop", t("Dreamy pop", "פופ חלומי"), ["dream pop playlist", "dreamy indie pop", "shoegaze dream pop"]),
      style("bedroom-pop", "music_note", "Bedroom Pop", t("Lo-fi pop", "פופ לו־פיי"), ["bedroom pop playlist", "lofi bedroom pop", "indie bedroom pop"]),
      style("hyperpop", "grid", "Hyperpop", t("Maximal pop", "פופ עשיר ונועז"), ["hyperpop playlist", "hyper pop", "glitch pop"]),
      style("emo", "heart_filled", "Emo", t("Emotional rock", "רוק רגשי"), ["emo playlist", "emo rock", "emo pop punk"]),
      style("post-punk", "album", "Post-Punk", t("Angular guitars", "גיטרות חדות"), ["post-punk playlist", "post punk classics", "dark post punk"]),
      style("new-wave", "grid", "New Wave", t("80s alternative", "אלטרנטיב משנות ה־80"), ["new wave playlist", "80s new wave", "new wave classics"]),
      style("goth", "moon", "Goth", t("Dark wave sound", "צליל דארק וייב"), ["goth playlist", "gothic rock", "darkwave"]),
      style("darkwave", "moon", "Darkwave", t("Dark synth sound", "סינתיסייזרים אפלים"), ["darkwave playlist", "dark wave", "coldwave"]),
      style("industrial", "grid", "Industrial", t("Heavy electronic", "אלקטרוניקה כבדה"), ["industrial playlist", "industrial rock", "industrial electronic"]),
      style("grunge", "album", "Grunge", t("90s guitars", "גיטרות משנות ה־90"), ["grunge playlist", "90s grunge", "grunge classics"]),
      style("hard-rock", "album", "Hard Rock", t("Hard guitars", "גיטרות כבדות"), ["hard rock playlist", "hard rock hits", "arena rock"]),
      style("soft-rock", "album", "Soft Rock", t("Soft rock classics", "קלאסיקות רוק רך"), ["soft rock playlist", "soft rock classics", "easy rock"]),
      style("prog-rock", "album", "Progressive Rock", t("Progressive rock", "רוק מתקדם"), ["progressive rock playlist", "prog rock", "classic prog rock"]),
      style("psychedelic-rock", "album", "Psychedelic Rock", t("Psych rock", "רוק פסיכדלי"), ["psychedelic rock playlist", "psych rock", "psychedelic music"]),
      style("shoegaze", "moon", "Shoegaze", t("Wall of sound", "קיר צליל"), ["shoegaze playlist", "dream pop shoegaze", "shoegaze classics"]),
      style("garage-rock", "album", "Garage Rock", t("Raw rock", "רוק מחוספס"), ["garage rock playlist", "garage rock revival", "raw rock"]),
      style("surf-rock", "radio", "Surf Rock", t("Surf guitars", "גיטרות גלישה"), ["surf rock playlist", "surf guitar", "surf rock classics"]),
      style("metalcore", "album", "Metalcore", t("Modern heavy", "צליל כבד עכשווי"), ["metalcore playlist", "modern metalcore", "metalcore hits"]),
      style("death-metal", "album", "Death Metal", t("Extreme metal", "מטאל קיצוני"), ["death metal playlist", "death metal classics", "melodic death metal"]),
      style("black-metal", "album", "Black Metal", t("Extreme dark metal", "מטאל קיצוני ואפל"), ["black metal playlist", "atmospheric black metal", "black metal classics"]),
      style("progressive-metal", "album", "Progressive Metal", t("Technical metal", "מטאל טכני"), ["progressive metal playlist", "prog metal", "technical metal"]),
      style("nu-metal", "album", "Nu Metal", t("90s heavy crossover", "צליל כבד משנות ה־90"), ["nu metal playlist", "nu metal hits", "rap metal"]),
      style("folk-metal", "album", "Folk Metal", t("Folk heavy sound", "פולק כבד"), ["folk metal playlist", "celtic metal", "viking metal"]),
      style("old-school-hip-hop", "tracks", "Old School Hip-Hop", t("Classic hip-hop", "היפ־הופ קלאסי"), ["old school hip hop playlist", "classic hip hop", "90s hip hop"]),
      style("boom-bap", "tracks", "Boom Bap", t("Classic beats", "ביטים קלאסיים"), ["boom bap playlist", "boom bap hip hop", "90s rap boom bap"]),
      style("conscious-rap", "tracks", "Conscious Rap", t("Lyrical rap", "ראפ לירי"), ["conscious rap playlist", "lyrical hip hop", "conscious hip hop"]),
      style("drill", "tracks", "Drill", t("Drill rap", "ראפ דריל"), ["drill playlist", "drill rap", "uk drill"]),
      style("grime", "tracks", "Grime", t("UK rap energy", "ראפ בריטי אנרגטי"), ["grime playlist", "uk grime", "grime hits"]),
      style("phonk", "grid", "Phonk", t("Dark drift beats", "ביטים אפלים"), ["phonk playlist", "drift phonk", "dark phonk"]),
      style("afro-trap", "tracks", "Afro Trap", t("Afro rap", "ראפ אפריקאי"), ["afro trap playlist", "afrotrap", "afro rap"]),
      style("neo-soul", "heart_filled", "Neo Soul", t("Modern soul", "סול עכשווי"), ["neo soul playlist", "modern soul", "neo soul r&b"]),
      style("motown", "heart_filled", "Motown", t("Motown classics", "קלאסיקות מוטאון"), ["motown playlist", "motown classics", "classic soul motown"]),
      style("gospel", "heart_filled", "Gospel", t("Gospel vocals", "שירת גוספל"), ["gospel playlist", "gospel music", "soul gospel"]),
      style("vocal-jazz", "music_note", "Vocal Jazz", t("Jazz vocals", "ג׳אז ווקאלי"), ["vocal jazz playlist", "jazz singers", "vocal jazz classics"]),
      style("smooth-jazz", "music_note", "Smooth Jazz", t("Smooth jazz", "ג׳אז רך"), ["smooth jazz playlist", "smooth jazz hits", "jazz lounge"]),
      style("bebop", "music_note", "Bebop", t("Bebop jazz", "ג׳אז ביבופ"), ["bebop playlist", "bebop jazz", "charlie parker style jazz"]),
      style("swing", "music_note", "Swing", t("Swing jazz", "ג׳אז סווינג"), ["swing playlist", "swing jazz", "big band swing"]),
      style("big-band", "music_note", "Big Band", t("Big band jazz", "ג׳אז ביג בנד"), ["big band playlist", "big band jazz", "swing orchestra"]),
      style("latin-jazz", "radio", "Latin Jazz", t("Latin jazz", "ג׳אז לטיני"), ["latin jazz playlist", "latin jazz classics", "bossa jazz"]),
      style("jazz-fusion", "grid", "Jazz Fusion", t("Fusion jazz", "ג׳אז פיוז׳ן"), ["jazz fusion playlist", "fusion jazz", "jazz rock fusion"]),
      style("opera", "album", "Opera", t("Opera voices", "קולות אופרה"), ["opera playlist", "opera classics", "classical opera"]),
      style("orchestral", "album", "Orchestral", t("Orchestra music", "מוזיקה תזמורתית"), ["orchestral playlist", "orchestra music", "symphony playlist"]),
      style("chamber", "album", "Chamber Music", t("Small ensemble", "הרכב קאמרי"), ["chamber music playlist", "classical chamber", "string quartet"]),
      style("baroque", "album", "Baroque", t("Baroque classical", "מוזיקת בארוק"), ["baroque playlist", "baroque classical", "bach baroque"]),
      style("romantic-classical", "album", "Romantic Classical", t("Romantic era", "התקופה הרומנטית"), ["romantic classical playlist", "romantic era classical", "chopin liszt classical"]),
      style("film-score", "album", "Film Score", t("Cinematic score", "פסקולים קולנועיים"), ["film score playlist", "cinematic score", "movie score"]),
      style("synthwave", "grid", "Synthwave", t("Retro synths", "סינתיסייזרים של פעם"), ["synthwave playlist", "retrowave", "80s synthwave"]),
      style("retrowave", "grid", "Retrowave", t("Retro electronic", "אלקטרוניקה נוסטלגית"), ["retrowave playlist", "retro wave", "outrun synthwave"]),
      style("downtempo", "moon", "Downtempo", t("Slow electronic", "אלקטרוניקה איטית"), ["downtempo playlist", "downtempo electronic", "chill downtempo"]),
      style("trip-hop", "moon", "Trip-Hop", t("Moody beats", "ביטים אווירתיים"), ["trip hop playlist", "trip-hop classics", "downtempo trip hop"]),
      style("chillhop", "moon", "Chillhop", t("Chill beats", "ביטים רגועים"), ["chillhop playlist", "chill hop beats", "lofi chillhop"]),
      style("future-bass", "grid", "Future Bass", t("Bright bass", "באסים בהירים"), ["future bass playlist", "future bass hits", "melodic bass"]),
      style("uk-garage", "grid", "UK Garage", t("UK club sound", "צליל מועדונים בריטי"), ["uk garage playlist", "ukg playlist", "2-step garage"]),
      style("breakbeat", "grid", "Breakbeat", t("Broken beats", "מקצבים שבורים"), ["breakbeat playlist", "breaks playlist", "electro breaks"]),
      style("hardstyle", "grid", "Hardstyle", t("Hard dance", "דאנס כבד"), ["hardstyle playlist", "hard dance", "hardstyle hits"]),
      style("minimal-techno", "grid", "Minimal Techno", t("Minimal club", "מינימל למועדונים"), ["minimal techno playlist", "minimal techno", "minimal electronic"]),
      style("progressive-house", "grid", "Progressive House", t("Melodic house", "האוס מלודי"), ["progressive house playlist", "melodic progressive house", "progressive house hits"]),
      style("electro", "grid", "Electro", t("Electro beats", "ביטים אלקטרוניים"), ["electro playlist", "electro music", "electro dance"]),
      style("idm", "grid", "IDM", t("Experimental electronic", "IDM"), ["idm playlist", "intelligent dance music", "experimental electronic"]),
      style("ska", "radio", "Ska", t("Ska rhythm", "מקצבי סקא"), ["ska playlist", "ska classics", "ska punk"]),
      style("dancehall", "radio", "Dancehall", t("Dancehall reggae", "רגאיי דאנסהול"), ["dancehall playlist", "dancehall reggae", "dancehall hits"]),
      style("dub", "radio", "Dub", t("Dub reggae", "דאב רגאיי"), ["dub playlist", "dub reggae", "roots dub"]),
      style("roots-reggae", "radio", "Roots Reggae", t("Roots reggae", "רוטס רגאיי"), ["roots reggae playlist", "roots reggae classics", "reggae roots"]),
      style("afro-house", "grid", "Afro House", t("Afro club sound", "אפרו למועדונים"), ["afro house playlist", "afro house music", "afro tech house"]),
      style("afropop", "radio", "Afropop", t("African pop", "פופ אפריקאי"), ["afropop playlist", "african pop", "afropop hits"]),
      style("highlife", "radio", "Highlife", t("West African sound", "צלילי מערב אפריקה"), ["highlife playlist", "ghana highlife", "west african highlife"]),
      style("soukous", "radio", "Soukous", t("Congo guitar sound", "גיטרות מקונגו"), ["soukous playlist", "congolese music", "african soukous"]),
      style("cumbia", "radio", "Cumbia", t("Cumbia rhythm", "מקצבי קומביה"), ["cumbia playlist", "cumbia classics", "latin cumbia"]),
      style("tango", "radio", "Tango", t("Tango classics", "קלאסיקות טנגו"), ["tango playlist", "argentine tango", "tango classics"]),
      style("bossa-nova", "music_note", "Bossa Nova", t("Brazilian jazz", "ג׳אז ברזילאי"), ["bossa nova playlist", "bossa nova classics", "brazilian bossa"]),
      style("samba", "radio", "Samba", t("Brazilian samba", "סמבה ברזילאית"), ["samba playlist", "brazilian samba", "samba classics"]),
      style("mpb", "radio", "MPB", t("Brazilian popular music", "MPB"), ["mpb playlist", "brazilian mpb", "musica popular brasileira"]),
      style("flamenco", "radio", "Flamenco", t("Spanish guitar", "גיטרה ספרדית"), ["flamenco playlist", "flamenco guitar", "spanish flamenco"]),
      style("bollywood", "radio", "Bollywood", t("Indian cinema", "קולנוע הודי"), ["bollywood playlist", "bollywood hits", "hindi film songs"]),
      style("indian-classical", "album", "Indian Classical", t("Indian classical", "קלאסית הודית"), ["indian classical music", "hindustani classical", "carnatic classical"]),
      style("punjabi", "radio", "Punjabi", t("Punjabi hits", "להיטים פנג׳אביים"), ["punjabi playlist", "punjabi hits", "bhangra punjabi"]),
      style("bhangra", "radio", "Bhangra", t("Bhangra dance", "ריקודי בהנגרה"), ["bhangra playlist", "bhangra hits", "punjabi bhangra"]),
      style("city-pop", "grid", "City Pop", t("Japanese city pop", "סיטי פופ יפני"), ["city pop playlist", "japanese city pop", "80s city pop"]),
      style("mandopop", "music_note", "Mandopop", t("Mandarin pop", "פופ מנדריני"), ["mandopop playlist", "mandarin pop", "chinese pop"]),
      style("cantopop", "music_note", "Cantopop", t("Cantonese pop", "פופ קנטונזי"), ["cantopop playlist", "cantonese pop", "hong kong pop"]),
      style("korean-indie", "music_note", "Korean Indie", t("Korean indie", "אינדי קוריאני"), ["korean indie playlist", "k-indie", "korean indie pop"]),
      style("persian", "radio", "Persian", t("Persian music", "מוזיקה פרסית"), ["persian music playlist", "persian pop", "iranian music"]),
      style("focus", "moon", "Focus", t("Music for focus", "מוזיקה לריכוז"), ["focus playlist", "deep focus music", "instrumental focus"]),
      style("study", "moon", "Study", t("Study music", "מוזיקה ללימודים"), ["study playlist", "study music", "concentration music"]),
      style("coffeehouse", "album", "Coffeehouse", t("Coffeehouse mood", "אווירת בית קפה"), ["coffeehouse playlist", "coffee shop music", "acoustic coffeehouse"]),
      style("dinner", "heart_filled", "Dinner", t("Dinner music", "מוזיקה לארוחה"), ["dinner playlist", "dinner music", "restaurant lounge"]),
      style("romance", "heart_filled", "Romance", t("Love songs", "שירי אהבה"), ["romantic playlist", "love songs", "romance music"]),
      style("sad", "moon", "Sad", t("Sad songs", "שירים עצובים"), ["sad songs playlist", "melancholy music", "heartbreak playlist"]),
      style("happy", "radio", "Happy", t("Feel-good songs", "שירים למצב רוח טוב"), ["happy playlist", "feel good music", "happy songs"]),
      style("summer", "radio", "Summer", t("Summer songs", "שירי קיץ"), ["summer playlist", "summer hits", "beach music"]),
      style("beach", "radio", "Beach", t("Beach music", "מוזיקה לחוף"), ["beach playlist", "beach music", "tropical playlist"]),
      style("road-trip", "radio", "Road Trip", t("Driving music", "מוזיקה לנהיגה"), ["road trip playlist", "driving music", "car playlist"]),
      style("gaming", "grid", "Gaming", t("Gaming music", "מוזיקה למשחקים"), ["gaming playlist", "gaming music", "electronic gaming"]),
      style("anime", "music_note", "Anime", t("Anime songs", "שירי אנימה"), ["anime playlist", "anime songs", "anime openings"]),
      style("50s", "radio", "50s", t("1950s music", "מוזיקה משנות ה־50"), ["50s playlist", "1950s music", "50s rock and roll"]),
      style("60s", "radio", "60s", t("1960s music", "מוזיקה משנות ה־60"), ["60s playlist", "1960s music", "60s hits"]),
      style("70s", "radio", "70s", t("1970s music", "מוזיקה משנות ה־70"), ["70s playlist", "1970s hits", "70s rock disco"]),
      style("80s", "grid", "80s", t("1980s music", "מוזיקה משנות ה־80"), ["80s playlist", "1980s hits", "80s pop rock"]),
      style("90s", "album", "90s", t("1990s music", "מוזיקה משנות ה־90"), ["90s playlist", "1990s hits", "90s pop rock"]),
      style("2000s", "music_note", "2000s", t("2000s music", "מוזיקה משנות ה־2000"), ["2000s playlist", "2000s hits", "00s music"]),
      style("2010s", "music_note", "2010s", t("2010s music", "מוזיקה משנות ה־2010"), ["2010s playlist", "2010s hits", "10s music"]),
      style("2020s", "music_note", "2020s", t("2020s music", "מוזיקה משנות ה־2020"), ["2020s playlist", "2020s hits", "new music hits"]),
      style("israeli-rock", "album", t("Israeli Rock", "רוק ישראלי"), t("Israeli bands", "להקות ישראליות"), ["רוק ישראלי","israeli rock","להקות רוק ישראליות"]),
      style("israeli-pop", "music_note", t("Israeli Pop", "פופ ישראלי"), t("Israeli pop hits", "להיטי פופ ישראלי"), ["פופ ישראלי","israeli pop","להיטי פופ ישראלי"]),
      style("israeli-rap", "tracks", t("Israeli Rap", "ראפ ישראלי"), t("Hebrew rap", "ראפ בעברית"), ["ראפ ישראלי","היפ הופ ישראלי","israeli rap"]),
      style("israeli-indie", "album", t("Israeli Indie", "אינדי ישראלי"), t("Local indie", "אינדי מקומי"), ["אינדי ישראלי","israeli indie","אינדי מקומי"]),
      style("sephardic", "radio", t("Sephardic", "ספרדית מסורתית"), t("Sephardic music", "מוזיקה ספרדית מסורתית"), ["sephardic music","מוזיקה ספרדית מסורתית","ladino music"]),
      style("klezmer", "radio", "Klezmer", t("Jewish folk", "פולק יהודי"), ["klezmer playlist", "klezmer music", "jewish folk music"]),
      style("jewish", "radio", t("Jewish", "יהודית"), t("Jewish music", "מוזיקה יהודית"), ["jewish music playlist","מוזיקה יהודית","jewish songs"]),
      style("hasidic", "radio", t("Hasidic", "חסידית"), t("Hasidic music", "מוזיקה חסידית"), ["hasidic music","מוזיקה חסידית","chassidic music"]),
      style("piyyut", "music_note", t("Piyyut", "פיוט"), t("Traditional liturgy", "פיוטים ותפילות"), ["פיוטים","piyyut","traditional jewish liturgy"]),
    ];
    return options.includeCustom
      ? [...styles, style("custom", "search", this._i18n("ui.free_style"), this._i18n("ui.type_anything"), [])]
      : styles;
  }

  _simpleWizardGenres() {
    return this._musicStyleCatalog({ includeCustom: true });
  }

  _simpleWizardContentTypes() {
    return [
      { id: "playlist", icon: "playlist", label: this._i18n("ui.playlist"), subtitle: this._i18n("ui.play_a_saved_list") },
      { id: "artist", icon: "artist", label: this._i18n("ui.artist"), subtitle: this._i18n("ui.play_an_artist") },
      { id: "artist_radio", icon: "radio", label: this._i18n("ui.artist_radio"), subtitle: this._i18n("ui.songs_around_an_artist") },
      { id: "library_radio", icon: "radio", label: this._i18n("ui.library_radio"), subtitle: this._i18n("ui.a_radio_station") },
    ];
  }

  _simpleWizardStepIndex(step = "") {
    const order = ["players", "source", "review"];
    const index = order.indexOf(step);
    return index >= 0 ? index : 0;
  }

  _simpleWizardProgressHtml(step = "players") {
    const current = this._simpleWizardStepIndex(step);
    const steps = [
      this._i18n("ui.players"),
      this._i18n("ui.music"),
      this._i18n("ui.play_2"),
    ];
    return `
      <div class="simple-wizard-progress" aria-hidden="true">
        ${steps.map((label, index) => `
          <span class="simple-wizard-progress-step ${index === current ? "active" : ""} ${index < current ? "done" : ""}">
            <span>${this._esc(String(index + 1))}</span>
            <strong>${this._esc(label)}</strong>
          </span>
        `).join("")}
      </div>
    `;
  }

  _simpleWizardSelectedPlayerNames(entityIds = []) {
    const ids = Array.isArray(entityIds) ? entityIds : [];
    if (ids.length > 1) return this._m(`${ids.length} players`, `${ids.length} נגנים`);
    const player = this._playerByEntityId(ids[0]);
    return player?.attributes?.friendly_name || ids[0] || this._i18n("ui.selected_player_3");
  }

  _simpleWizardPlayersHtml(state) {
    const players = this._simpleWizardPlayerPool();
    const selected = new Set(state.selectedPlayers || []);
    const allSelected = players.length > 0 && players.every((player) => selected.has(player.entity_id));
    if (!players.length) {
      return `
        <div class="simple-wizard-panel">
          <div class="notice open">${this._esc(this._i18n("ui.no_players_found_yet"))}</div>
        </div>
      `;
    }
    return `
      <div class="simple-wizard-panel">
        <div class="simple-wizard-title">${this._esc(this._i18n("ui.choose_where_to_play"))}</div>
        <div class="simple-wizard-player-grid">
          <button class="simple-wizard-player ${allSelected ? "active" : ""}" data-simple-all-players="1">
            <span class="simple-wizard-player-icon">${this._iconSvg("speaker")}</span>
            <span class="simple-wizard-player-copy">
              <span class="simple-wizard-option-title">${this._esc(this._i18n("ui.all_players"))}</span>
              <span class="simple-wizard-option-sub">${this._esc(this._i18n("ui.play_everywhere"))}</span>
            </span>
            <span class="simple-wizard-check">${this._iconSvg(allSelected ? "check" : "plus")}</span>
          </button>
          ${players.map((player) => {
            const entityId = player.entity_id;
            const active = selected.has(entityId);
            const art = this._playerArtworkUrl(player, 120);
            const name = player.attributes?.friendly_name || entityId;
            const subtitle = player.attributes?.media_title || this._playerStateLabel(player);
            return `
              <button class="simple-wizard-player ${active ? "active" : ""} ${this._isPlayerActive(player) ? "is-playing" : ""}" data-simple-player="${this._esc(entityId)}">
                <span class="simple-wizard-player-art">${art ? this._imgHtml(art, "", { fallbackIcon: "speaker" }) : this._iconSvg("speaker")}</span>
                <span class="simple-wizard-player-copy">
                  <span class="simple-wizard-option-title">${this._esc(name)}</span>
                  <span class="simple-wizard-option-sub">${this._esc(subtitle || "")}</span>
                </span>
                <span class="simple-wizard-check">${this._iconSvg(active ? "check" : "plus")}</span>
              </button>
            `;
          }).join("")}
        </div>
        <div class="simple-wizard-footer single">
          <button class="simple-wizard-primary" data-simple-next="source" ${selected.size ? "" : "disabled"}>${this._esc(this._i18n("ui.continue_2"))}</button>
        </div>
      </div>
    `;
  }

  _simpleWizardSourceHtml(state) {
    const source = state.source === "content" ? "content" : "genre";
    const selectedGenre = state.genre || "pop";
    const contentType = state.contentType || "playlist";
    const customGenre = String(state.customGenre || "").trim();
    const genreOptions = this._simpleWizardGenres();
    const selectedGenreMeta = genreOptions.find((genre) => genre.id === selectedGenre) || genreOptions[0];
    return `
      <div class="simple-wizard-panel">
        <div class="simple-wizard-title">${this._esc(this._i18n("ui.choose_the_music"))}</div>
        <div class="simple-wizard-source-grid">
          <button class="simple-wizard-source ${source === "genre" ? "active" : ""}" data-simple-source="genre">
            <span>${this._iconSvg("wand")}</span>
            <strong>${this._esc(this._m("Style", "סגנון"))}</strong>
          </button>
          <button class="simple-wizard-source ${source === "content" ? "active" : ""}" data-simple-source="content">
            <span>${this._iconSvg("library_music")}</span>
            <strong>${this._esc(this._i18n("ui.existing_content"))}</strong>
          </button>
        </div>
        ${source === "genre" ? `
          <label class="simple-wizard-search simple-wizard-category-picker">
            <span>${this._esc(this._m("Style", "סגנון"))}</span>
            <select id="simpleWizardGenreSelect" class="media-sort-select settings-select simple-wizard-select" aria-label="${this._esc(this._m("Style", "סגנון"))}">
              ${genreOptions.map((genre) => `<option value="${this._esc(genre.id)}" ${selectedGenre === genre.id ? "selected" : ""}>${this._esc(genre.label)}</option>`).join("")}
            </select>
          </label>
          <div class="simple-wizard-option active simple-wizard-selected-option">
            <span class="simple-wizard-option-icon">${this._iconSvg(selectedGenreMeta?.icon || "wand")}</span>
            <span>
              <span class="simple-wizard-option-title">${this._esc(selectedGenreMeta?.label || "")}</span>
              <span class="simple-wizard-option-sub">${this._esc(selectedGenreMeta?.subtitle || "")}</span>
            </span>
          </div>
          ${selectedGenre === "custom" ? `
            <label class="simple-wizard-search simple-wizard-free-style">
              <span>${this._esc(this._i18n("ui.free_style"))}</span>
              <input id="simpleWizardCustomGenreInput" type="text" value="${this._esc(customGenre)}" placeholder="${this._esc(this._i18n("ui.example_quiet_jazz_greek_music_workout"))}">
            </label>
          ` : ""}
        ` : `
          <div class="simple-wizard-option-grid">
            ${this._simpleWizardContentTypes().map((type) => `
              <button class="simple-wizard-option ${contentType === type.id ? "active" : ""}" data-simple-content="${this._esc(type.id)}">
                <span class="simple-wizard-option-icon">${this._iconSvg(type.icon)}</span>
                <span>
                  <span class="simple-wizard-option-title">${this._esc(type.label)}</span>
                  <span class="simple-wizard-option-sub">${this._esc(type.subtitle)}</span>
                </span>
              </button>
            `).join("")}
          </div>
          <label class="simple-wizard-search">
            <span>${this._esc(this._i18n("ui.name_or_keyword"))}</span>
            <input id="simpleWizardQueryInput" type="text" value="${this._esc(state.query || "")}" placeholder="${this._esc(this._i18n("ui.optional_2"))}">
          </label>
        `}
        <div class="simple-wizard-footer">
          <button class="simple-wizard-secondary" data-simple-back="players">${this._esc(this._i18n("ui.back_2"))}</button>
          <button class="simple-wizard-primary" data-simple-build="1">${this._esc(this._i18n("ui.find_music"))}</button>
        </div>
      </div>
    `;
  }

  _simpleWizardReviewHtml(state) {
    if (state.loading) {
      return `
        <div class="simple-wizard-panel simple-wizard-loading">
          <div class="simple-wizard-loader">${this._iconSvg("wand")}</div>
          <div class="simple-wizard-title">${this._esc(this._i18n("ui.finding_music"))}</div>
        </div>
      `;
    }
    const candidates = Array.isArray(state.candidates) ? state.candidates : [];
    if (!candidates.length) {
      return `
        <div class="simple-wizard-panel">
          <div class="notice open">${this._esc(state.error || this._i18n("ui.no_matching_content_was_found"))}</div>
          <div class="simple-wizard-footer">
            <button class="simple-wizard-secondary" data-simple-back="source">${this._esc(this._i18n("ui.back_2"))}</button>
            <button class="simple-wizard-primary" data-simple-build="1">${this._esc(this._i18n("ui.try_again"))}</button>
          </div>
        </div>
      `;
    }
    const index = Math.max(0, Math.min(candidates.length - 1, Number(state.selectedIndex || 0)));
    const candidate = candidates[index] || candidates[0];
    const art = candidate.image || "";
    return `
      <div class="simple-wizard-panel">
        <div class="simple-wizard-title">${this._esc(this._i18n("ui.ready_to_play"))}</div>
        <div class="simple-wizard-review-card">
          <span class="simple-wizard-review-art">${art ? this._imgHtml(art, "", { fallbackIcon: candidate.media_type === "radio" ? "radio" : "playlist" }) : this._iconSvg(candidate.media_type === "radio" ? "radio" : "playlist")}</span>
          <span class="simple-wizard-review-copy">
            <span class="simple-wizard-review-kicker">${this._esc(this._simpleWizardSelectedPlayerNames(state.selectedPlayers))}</span>
            <span class="simple-wizard-review-title">${this._esc(candidate.name || this._i18n("ui.selected_music"))}</span>
            <span class="simple-wizard-review-sub">${this._esc(candidate.subtitle || this._simpleWizardMediaTypeLabel(candidate.media_type))}</span>
          </span>
        </div>
        <div class="simple-wizard-section-head">
          <span>${this._esc(this._i18n("ui.results"))}</span>
          <small>${this._esc(this._i18n("ui.choose_one_clear_option"))}</small>
        </div>
        <div class="simple-wizard-result-grid">
          ${candidates.slice(0, 8).map((item, itemIndex) => {
            const itemArt = item.image || "";
            const itemType = this._simpleWizardMediaTypeLabel(item.media_type);
            return `
            <button class="simple-wizard-result ${itemIndex === index ? "active" : ""}" data-simple-candidate="${this._esc(String(itemIndex))}">
              <span class="simple-wizard-result-art">${itemArt ? this._imgHtml(itemArt, "", { fallbackIcon: item.media_type === "radio" ? "radio" : item.media_type === "artist" ? "artist" : "playlist" }) : this._iconSvg(item.media_type === "radio" ? "radio" : item.media_type === "artist" ? "artist" : "playlist")}</span>
              <span class="simple-wizard-result-copy">
                <span class="simple-wizard-result-kicker">${this._esc(itemType)}</span>
                <span class="simple-wizard-result-title">${this._esc(item.name || this._i18n("ui.option"))}</span>
                <span class="simple-wizard-result-sub">${this._esc(item.subtitle || itemType)}</span>
              </span>
              <span class="simple-wizard-result-check">${this._iconSvg(itemIndex === index ? "check" : "plus")}</span>
            </button>
          `; }).join("")}
        </div>
        <div class="simple-wizard-footer triple">
          <button class="simple-wizard-secondary" data-simple-back="source">${this._esc(this._i18n("ui.back_2"))}</button>
          <button class="simple-wizard-secondary" data-simple-build="1">${this._esc(this._i18n("ui.refresh"))}</button>
          <button class="simple-wizard-primary" data-simple-play="1">${this._esc(this._i18n("ui.play_now"))}</button>
        </div>
      </div>
    `;
  }

  _simpleWizardHtml() {
    const state = this._simpleWizardState();
    const step = ["players", "source", "review"].includes(state.step) ? state.step : "players";
    const body = step === "source"
      ? this._simpleWizardSourceHtml(state)
      : step === "review"
        ? this._simpleWizardReviewHtml(state)
        : this._simpleWizardPlayersHtml(state);
    return `
      <div class="simple-wizard-shell" data-simple-step="${this._esc(step)}">
        ${this._simpleWizardProgressHtml(step)}
        <div class="simple-wizard-toolbar">
          <button class="simple-wizard-reset-btn" data-simple-reset="1">${this._esc(this._i18n("ui.reset"))}</button>
        </div>
        ${body}
      </div>
    `;
  }

  _simpleWizardMediaTypeLabel(mediaType = "") {
    const type = String(mediaType || "").toLowerCase();
    if (type === "artist") return this._i18n("ui.artist");
    if (type === "radio") return this._i18n("ui.radio");
    if (type === "track") return this._i18n("ui.track");
    if (type === "album") return this._i18n("ui.album");
    return this._i18n("ui.playlist");
  }

  _simpleWizardCandidateFromItem(item = {}, fallbackType = "playlist", options = {}) {
    let normalized = {};
    try { normalized = this._normalizeMediaItem(item) || {}; } catch (_) {}
    const uri = String(options.uri || normalized.uri || item?.uri || item?.media_item?.uri || "").trim();
    if (!uri) return null;
    const mediaType = String(options.mediaType || normalized.media_type || item?.media_type || item?.type || fallbackType || "playlist").toLowerCase();
    const name = normalized.name || item?.name || item?.title || item?.media_item?.name || uri;
    const subtitle = options.subtitle
      || this._artistName(item)
      || normalized.artist
      || item?.artist
      || item?.artist_str
      || item?.album?.name
      || item?.metadata?.description
      || this._simpleWizardMediaTypeLabel(mediaType);
    const image = this._artUrl(item)
      || normalized.image
      || item?.image
      || item?.image_url
      || item?.media_item?.image
      || item?.media_item?.album?.image
      || "";
    return {
      uri,
      media_type: mediaType,
      name,
      subtitle,
      image,
      radioMode: !!options.radioMode,
    };
  }

  _simpleWizardUniqueCandidates(candidates = []) {
    const seen = new Set();
    return (Array.isArray(candidates) ? candidates : []).filter((candidate) => {
      const uri = String(candidate?.uri || "").trim();
      if (!uri || seen.has(uri)) return false;
      seen.add(uri);
      return true;
    });
  }

  async _simpleWizardFindCandidates(state = this._simpleWizardState()) {
    const out = [];
    const addGroup = (items = [], mediaType = "playlist", options = {}) => {
      (Array.isArray(items) ? items : []).forEach((item) => {
        const candidate = this._simpleWizardCandidateFromItem(item, mediaType, options);
        if (candidate) out.push(candidate);
      });
    };
    if (state.source !== "content") {
      const genre = this._simpleWizardGenres().find((item) => item.id === state.genre) || this._simpleWizardGenres()[0];
      const customQuery = String(state.customGenre || "").trim();
      const searchLabel = genre.id === "custom" && customQuery ? customQuery : genre.label;
      const queries = genre.id === "custom" && customQuery ? [customQuery] : (genre.queries || [genre.label]);
      for (const query of queries.slice(0, 3)) {
        try {
          const results = await this._search(query);
          addGroup(results.playlists, "playlist", { subtitle: searchLabel });
          addGroup(results.tracks, "track", { subtitle: searchLabel });
          addGroup(results.albums, "album", { subtitle: searchLabel });
          addGroup(results.radio, "radio", { subtitle: searchLabel });
        } catch (_) {}
        if (this._simpleWizardUniqueCandidates(out).length >= 8) break;
      }
      if (!out.length) {
        const fallbacks = await Promise.allSettled([
          this._fetchLibrary("playlist", "random", 18, false),
          this._fetchLibrary("album", "random", 12, false),
          this._fetchLibrary("radio", "random", 12, false),
        ]);
        fallbacks.forEach((result, index) => {
          if (result.status !== "fulfilled") return;
          addGroup(result.value, index === 1 ? "album" : index === 2 ? "radio" : "playlist", { subtitle: searchLabel });
        });
      }
      return this._shuffleDiscoveryItems(this._simpleWizardUniqueCandidates(out), Date.now() + (this._simpleWizardToken || 0)).slice(0, 8);
    }

    const query = String(state.query || "").trim();
    const type = state.contentType || "playlist";
    if (type === "library_radio") {
      if (query) {
        try {
          const results = await this._search(query);
          addGroup(results.radio, "radio");
        } catch (_) {}
        try {
          const stations = await this._fetchRadioBrowserStations(query, 18, { countryCode: this._mobileRadioBrowserCountry() || "all" });
          addGroup(stations, "radio");
        } catch (_) {}
      } else {
        const radios = await Promise.allSettled([
          this._fetchLibrary("radio", "sort_name", 80, true),
          this._fetchLibrary("radio", "random", 80, false),
          this._fetchRadioBrowserStations("", 30, { countryCode: this._mobileRadioBrowserCountry() || "all" }),
        ]);
        radios.forEach((result) => {
          if (result.status === "fulfilled") addGroup(result.value, "radio");
        });
      }
      return this._shuffleDiscoveryItems(this._simpleWizardUniqueCandidates(out), Date.now() + (this._simpleWizardToken || 0)).slice(0, 8);
    }

    if (type === "artist" || type === "artist_radio") {
      if (query) {
        try {
          const results = await this._search(query);
          addGroup(results.artists, "artist", {
            subtitle: type === "artist_radio" ? this._i18n("ui.artist_radio") : this._i18n("ui.artist"),
            radioMode: type === "artist_radio",
            mediaType: "artist",
          });
        } catch (_) {}
      } else {
        try {
          const artists = await this._fetchLibrary("artist", "sort_name", 80, false);
          addGroup(artists, "artist", {
            subtitle: type === "artist_radio" ? this._i18n("ui.artist_radio") : this._i18n("ui.artist"),
            radioMode: type === "artist_radio",
            mediaType: "artist",
          });
        } catch (_) {}
      }
      return this._shuffleDiscoveryItems(this._simpleWizardUniqueCandidates(out), Date.now() + (this._simpleWizardToken || 0)).slice(0, 8);
    }

    if (query) {
      try {
        const results = await this._search(query);
        addGroup(results.playlists, "playlist");
      } catch (_) {}
    } else {
      const playlists = await Promise.allSettled([
        this._loadScheduledStartPlaylists(),
        this._fetchLibrary("playlist", "sort_name", 120, true),
        this._fetchLibrary("playlist", "random", 80, false),
      ]);
      playlists.forEach((result) => {
        if (result.status === "fulfilled") addGroup(result.value, "playlist");
      });
    }
    return this._shuffleDiscoveryItems(this._simpleWizardUniqueCandidates(out), Date.now() + (this._simpleWizardToken || 0)).slice(0, 8);
  }

  async _simpleWizardBuildCandidates(sourceEl = null) {
    const state = this._simpleWizardState();
    const queryInput = this.$("simpleWizardQueryInput");
    const genreSelect = this.$("simpleWizardGenreSelect");
    const customGenreInput = this.$("simpleWizardCustomGenreInput");
    if (queryInput) state.query = queryInput.value || "";
    if (genreSelect) state.genre = this._simpleWizardGenres().some((genre) => genre.id === genreSelect.value) ? genreSelect.value : state.genre;
    if (customGenreInput) state.customGenre = customGenreInput.value || "";
    if (!state.selectedPlayers?.length) {
      state.step = "players";
      this._toastError(this._i18n("ui.choose_at_least_one_player"));
      await this._renderMobileMenu();
      return;
    }
    if (state.source !== "content" && state.genre === "custom" && !String(state.customGenre || "").trim()) {
      state.step = "source";
      this._toastError(this._i18n("ui.type_a_free_style_first"));
      await this._renderMobileMenu();
      return;
    }
    if (sourceEl) this._flashInteraction(sourceEl);
    const token = ++this._simpleWizardToken;
    state.step = "review";
    state.loading = true;
    state.error = "";
    state.candidates = [];
    state.selectedIndex = 0;
    await this._renderMobileMenu();
    try {
      const candidates = await this._simpleWizardFindCandidates(state);
      if (token !== this._simpleWizardToken) return;
      state.candidates = candidates;
      state.error = candidates.length ? "" : this._i18n("ui.no_matching_content_was_found");
    } catch (error) {
      if (token !== this._simpleWizardToken) return;
      state.candidates = [];
      state.error = error?.message || this._i18n("ui.could_not_find_music");
    } finally {
      if (token === this._simpleWizardToken) {
        state.loading = false;
        await this._renderMobileMenu();
      }
    }
  }

  _showSimpleWizardPopup(candidate = {}, entityIds = []) {
    const host = this.$("surprisePopup");
    if (!host) return;
    const targetName = this._simpleWizardSelectedPlayerNames(entityIds);
    const art = candidate.image || "";
    host.innerHTML = `
      <div class="surprise-popup-card simple-wizard-popup-card">
        <div class="surprise-popup-player">${this._esc(this._i18n("ui.playing_on_2"))}: ${this._esc(targetName)}</div>
        <div class="surprise-popup-art">${art ? this._imgHtml(art, "", { loading: "eager", fetchpriority: "high", fallbackIcon: "album" }) : this._iconSvg("wand")}</div>
        <div class="surprise-popup-title">${this._esc(candidate.name || this._i18n("ui.selected_music"))}</div>
      </div>
    `;
    host.classList.add("open", "simple-wizard-popup");
    clearTimeout(this._simpleWizardPopupTimer);
    this._simpleWizardPopupTimer = setTimeout(() => {
      host.classList.remove("open", "simple-wizard-popup");
    }, 1700);
  }

  async _simpleWizardPlay(sourceEl = null) {
    const state = this._simpleWizardState();
    const candidates = Array.isArray(state.candidates) ? state.candidates : [];
    const index = Math.max(0, Math.min(candidates.length - 1, Number(state.selectedIndex || 0)));
    const candidate = candidates[index];
    if (!candidate?.uri) {
      await this._simpleWizardBuildCandidates(sourceEl);
      return;
    }
    const targets = [...new Set((state.selectedPlayers || []).filter((entityId) => this._playerByEntityId(entityId)))];
    if (!targets.length) {
      state.step = "players";
      await this._renderMobileMenu();
      this._toastError(this._i18n("ui.choose_at_least_one_player"));
      return;
    }
    if (sourceEl) this._flashInteraction(sourceEl);
    const primaryId = targets[0];
    if (targets.length > 1) {
      try {
        const joined = await this._applySpeakerGroupFor(primaryId, targets.slice(1));
        if (!joined) {
          this._toastError(this._i18n("ui.select_at_least_two_players_to_create_a_group"));
          return;
        }
        await new Promise((resolve) => window.setTimeout(resolve, 250));
      } catch (error) {
        this._toastError(error?.message || this._i18n("ui.queue_action_failed"));
        return;
      }
    }
    const ok = await this._playMediaOnPlayers([primaryId], candidate.uri, candidate.media_type || "playlist", "play", {
      label: candidate.name || "",
      silent: true,
      radioMode: !!candidate.radioMode,
    });
    if (!ok) {
      this._toastError(this._i18n("ui.could_not_start_playback"));
      return;
    }
    this._selectPlayer(primaryId, true);
    this._showSimpleWizardPopup(candidate, targets);
    setTimeout(() => {
      this._closeMobileMenu();
      this._syncNowPlayingUI();
    }, 1750);
  }

  async _handleSimpleWizardClick(e) {
    const root = e.target.closest?.(".simple-wizard-shell");
    if (!root) return false;
    const button = e.target.closest?.("[data-simple-reset], [data-simple-player], [data-simple-all-players], [data-simple-next], [data-simple-back], [data-simple-source], [data-simple-genre], [data-simple-content], [data-simple-build], [data-simple-candidate], [data-simple-play]");
    if (!button) return false;
    e.preventDefault();
    e.stopPropagation();
    const state = this._simpleWizardState();
    if (button.dataset.simpleReset !== undefined) {
      this._resetSimpleWizardState();
      await this._renderMobileMenu();
      return true;
    }
    if (button.dataset.simpleAllPlayers !== undefined) {
      const players = this._simpleWizardPlayerPool();
      const ids = players.map((player) => player.entity_id);
      const selected = new Set(state.selectedPlayers || []);
      state.selectedPlayers = ids.length && ids.every((id) => selected.has(id)) ? this._simpleWizardDefaultPlayerIds(players) : ids;
      state.candidates = [];
      await this._renderMobileMenu();
      return true;
    }
    if (button.dataset.simplePlayer) {
      const entityId = button.dataset.simplePlayer;
      const selected = new Set(state.selectedPlayers || []);
      if (selected.has(entityId)) {
        if (selected.size <= 1) {
          this._toastError(this._i18n("ui.choose_at_least_one_player"));
          return true;
        }
        selected.delete(entityId);
      } else selected.add(entityId);
      state.selectedPlayers = Array.from(selected);
      state.candidates = [];
      await this._renderMobileMenu();
      return true;
    }
    if (button.dataset.simpleNext) {
      if (button.dataset.simpleNext === "source" && !state.selectedPlayers?.length) {
        this._toastError(this._i18n("ui.choose_at_least_one_player"));
        return true;
      }
      state.step = button.dataset.simpleNext;
      await this._renderMobileMenu();
      return true;
    }
    if (button.dataset.simpleBack) {
      state.step = button.dataset.simpleBack;
      await this._renderMobileMenu();
      return true;
    }
    if (button.dataset.simpleSource) {
      state.source = button.dataset.simpleSource === "content" ? "content" : "genre";
      state.candidates = [];
      state.selectedIndex = 0;
      await this._renderMobileMenu();
      return true;
    }
    if (button.dataset.simpleGenre) {
      state.genre = button.dataset.simpleGenre;
      state.candidates = [];
      state.selectedIndex = 0;
      await this._renderMobileMenu();
      return true;
    }
    if (button.dataset.simpleContent) {
      state.contentType = button.dataset.simpleContent;
      state.candidates = [];
      state.selectedIndex = 0;
      await this._renderMobileMenu();
      return true;
    }
    if (button.dataset.simpleBuild !== undefined) {
      await this._simpleWizardBuildCandidates(button);
      return true;
    }
    if (button.dataset.simpleCandidate !== undefined) {
      state.selectedIndex = Math.max(0, Number(button.dataset.simpleCandidate) || 0);
      await this._renderMobileMenu();
      return true;
    }
    if (button.dataset.simplePlay !== undefined) {
      await this._simpleWizardPlay(button);
      return true;
    }
    return false;
  }

  _sleepTimerActionTile(label, minutes, tone = "queue") {
    return `
      <button class="menu-item action-tile tone-${this._esc(tone)}" data-sleep-timer-start="${this._esc(String(minutes))}">
        <span class="menu-item-main">
          <span class="menu-item-ico">${this._iconSvg("timer")}</span>
          <span style="min-width:0;flex:1;">
            <span class="menu-item-title">${this._esc(label)}</span>
            <span class="menu-item-sub">${this._esc(this._i18n("ui.set_sleep_timer"))}</span>
          </span>
        </span>
      </button>
    `;
  }

  _sleepTimerMenuHtml() {
    this._loadPlayers();
    const remaining = this._sleepTimerRemainingLabel();
    const active = this._sleepTimerRemainingMs() > 0;
    const status = active
      ? this._m(`Active for ${remaining}`, `פעיל למשך ${remaining}`)
      : this._i18n("ui.no_sleep_timer_is_active");
    const schedules = this._scheduledStartSchedules();
    const editSchedule = schedules.find((schedule) => schedule.id === this._state.mobileStartScheduleEditId) || null;
    const showWakeEditor = !!editSchedule || this._state.mobileStartScheduleEditId === "__new__";
    const wakeDraftSchedule = showWakeEditor ? {
      id: editSchedule?.id || "__new__",
      time: this._state.mobileStartTimerTime || editSchedule?.time || "07:00",
      player: this._state.mobileStartTimerPlayer || editSchedule?.player || "",
      playlist: this._state.mobileStartTimerPlaylist ?? editSchedule?.playlist ?? "",
      playlistName: this._state.mobileStartTimerPlaylistName ?? editSchedule?.playlistName ?? "",
      volume: this._state.mobileStartTimerVolume ?? editSchedule?.volume ?? 35,
      days: this._state.mobileStartTimerDays || editSchedule?.days,
      afterRun: this._state.mobileStartTimerAfterRun || editSchedule?.afterRun || "keep",
    } : editSchedule;
    const scheduledTime = this._normalizeClockTime(wakeDraftSchedule?.time || "07:00", "07:00");
    const scheduledPlayer = this._scheduledStartPlayerId(wakeDraftSchedule);
    const scheduledVolume = Math.max(0, Math.min(100, Number(wakeDraftSchedule?.volume ?? 35) || 35));
    const scheduledDays = new Set(this._normalizeNightModeDays(wakeDraftSchedule?.days || this._state.mobileStartTimerDays));
    const scheduledAfterRun = String(wakeDraftSchedule?.afterRun || "keep") === "disable" ? "disable" : "keep";
    const nightMode = this._mobileNightMode();
    const nightWindow = this._nightModeWindow();
    const nightDays = new Set(this._nightModeDays());
    const activeTab = ["timers", "wake", "night"].includes(this._state.mobileSchedulesTab) ? this._state.mobileSchedulesTab : "timers";
    const schedulePlayers = this._strictSchedulePlayers();
    const playerOptions = schedulePlayers.map((player) => {
      const name = player.attributes?.friendly_name || player.entity_id;
      return `<option value="${this._esc(player.entity_id)}" ${player.entity_id === scheduledPlayer ? "selected" : ""}>${this._esc(name)}</option>`;
    }).join("");
    const scheduleRows = schedules.length ? `
      <div class="schedule-list">
        ${schedules.map((schedule) => {
          const player = this._playerByEntityId(this._scheduledStartPlayerId(schedule));
          const playerName = player?.attributes?.friendly_name || this._i18n("ui.selected_player_3");
          const afterRunLabel = schedule.afterRun === "disable"
            ? this._i18n("ui.turns_off_after_run")
            : this._i18n("ui.stays_active");
          const days = this._nightModeDayOptions()
            .filter(([value]) => this._normalizeNightModeDays(schedule.days).includes(value))
            .map(([, label]) => label)
            .join(" ");
          return `
            <div class="schedule-row ${schedule.enabled === false ? "disabled" : ""} ${schedule.id === this._state.mobileStartScheduleEditId ? "editing" : ""}">
              <button class="schedule-row-main" data-start-schedule-edit="${this._esc(schedule.id)}">
                <span class="schedule-row-time">${this._esc(schedule.time)}</span>
                <span class="schedule-row-copy">
                  <span class="schedule-row-title">${this._esc(playerName)}</span>
                  <span class="schedule-row-sub">${this._esc(`${this._scheduledStartPlaylistLabel(schedule)} · ${schedule.volume}% · ${afterRunLabel} · ${days}`)}</span>
                </span>
              </button>
              <div class="schedule-row-actions">
                <button class="settings-pill ${schedule.enabled !== false ? "active" : ""}" data-start-schedule-toggle="${this._esc(schedule.id)}">${this._esc(schedule.enabled !== false ? this._i18n("ui.on") : this._i18n("ui.off"))}</button>
                <button class="settings-pill" data-start-schedule-delete="${this._esc(schedule.id)}">${this._iconSvg("trash")}</button>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    ` : `<div class="notice open">${this._i18n("ui.no_wake_schedules_yet")}</div>`;
    const timersHtml = `
      <div class="settings-group scheduled-start-card schedule-panel-card schedule-timers-card">
        <div class="settings-label">${this._esc(this._i18n("ui.sleep_timer_2"))}</div>
        <div class="settings-hint">${this._esc(status)}</div>
        <div class="sleep-timer-action-row ${active ? "with-cancel" : ""}" aria-label="${this._esc(this._i18n("ui.sleep_timer_presets"))}">
          <button class="sleep-timer-action-btn" data-sleep-timer-start="15">${this._esc(this._m("15 min", "15 דק׳"))}</button>
          <button class="sleep-timer-action-btn" data-sleep-timer-start="30">${this._esc(this._m("30 min", "30 דק׳"))}</button>
          <button class="sleep-timer-action-btn" data-sleep-timer-start="60">${this._esc(this._m("60 min", "60 דק׳"))}</button>
          ${active ? `<button class="sleep-timer-action-btn danger" data-sleep-timer-cancel>${this._esc(this._i18n("ui.cancel_2"))}</button>` : ``}
        </div>
      </div>
    `;
    const wakeHtml = `
      <div class="wake-schedule-layout">
        <div class="settings-group scheduled-start-card wake-schedule-list-card">
          <div class="settings-label">${this._esc(this._i18n("ui.wake_schedules"))}</div>
          <div class="settings-hint">${this._esc(this._scheduledStartStatusLabel())}</div>
          ${scheduleRows}
          <div class="settings-actions">
            <button class="settings-pill" data-start-schedule-new>${this._esc(this._i18n("ui.new_schedule"))}</button>
          </div>
        </div>
        ${showWakeEditor ? `<div class="settings-group scheduled-start-card wake-schedule-editor-card">
          <div class="settings-label">${this._esc(editSchedule ? this._i18n("ui.edit_schedule") : this._i18n("ui.new_wake_schedule"))}</div>
          <div class="scheduled-start-grid">
            <label class="night-time-card" for="scheduledStartTimeInput">
              <span class="night-time-label">${this._esc(this._i18n("ui.start_time"))}</span>
              <input class="night-time-input" id="scheduledStartTimeInput" data-schedule-form-control type="time" value="${this._esc(scheduledTime)}" step="60" aria-label="${this._esc(this._i18n("ui.start_time"))}">
            </label>
            <label class="scheduled-start-field" for="scheduledStartPlayerSelect">
              <span class="settings-label">${this._esc(this._i18n("ui.player_2"))}</span>
              <select class="media-sort-select settings-select" id="scheduledStartPlayerSelect" data-schedule-form-control aria-label="${this._esc(this._i18n("ui.player_2"))}">
                ${playerOptions || `<option value="">${this._esc(this._i18n("ui.no_players_found"))}</option>`}
              </select>
            </label>
            <label class="scheduled-start-field" for="scheduledStartPlaylistSelect">
              <span class="settings-label">${this._esc(this._i18n("ui.playlist"))}</span>
              <select class="media-sort-select settings-select" id="scheduledStartPlaylistSelect" data-schedule-form-control aria-label="${this._esc(this._i18n("ui.playlist"))}">
                ${this._scheduledStartPlaylistOptionsHtml(wakeDraftSchedule)}
              </select>
            </label>
            <label class="scheduled-start-field" for="scheduledStartAfterRunSelect">
              <span class="settings-label">${this._esc(this._i18n("ui.after_run"))}</span>
              <select class="media-sort-select settings-select" id="scheduledStartAfterRunSelect" data-schedule-form-control aria-label="${this._esc(this._i18n("ui.after_run"))}">
                <option value="keep" ${scheduledAfterRun === "keep" ? "selected" : ""}>${this._esc(this._i18n("ui.stay_active"))}</option>
                <option value="disable" ${scheduledAfterRun === "disable" ? "selected" : ""}>${this._esc(this._i18n("ui.turn_off"))}</option>
              </select>
            </label>
          </div>
          <div class="settings-range scheduled-volume-field">
            <div class="settings-label">${this._esc(this._i18n("ui.volume"))}</div>
            <input id="scheduledStartVolumeInput" data-schedule-form-control type="range" min="0" max="100" step="1" value="${this._esc(String(scheduledVolume))}">
            <div class="settings-value">${this._esc(String(scheduledVolume))}%</div>
          </div>
          <div class="settings-label">${this._esc(this._i18n("ui.active_days"))}</div>
          <div class="settings-check-grid">
            ${this._nightModeDayOptions().map(([value, label]) => `
              <label class="settings-check-pill">
                <input type="checkbox" data-schedule-form-control data-start-timer-day="${this._esc(String(value))}" ${scheduledDays.has(value) ? "checked" : ""}>
                <span>${this._esc(label)}</span>
              </label>`).join("")}
          </div>
          <div class="settings-actions">
            <button class="settings-pill active" data-start-timer-save>${this._esc(editSchedule ? this._i18n("ui.save_schedule") : this._i18n("ui.create_schedule"))}</button>
            ${editSchedule ? `<button class="settings-pill" data-start-timer-clear>${this._esc(this._i18n("ui.delete_schedule"))}</button>` : ``}
          </div>
        </div>` : ``}
      </div>
    `;
    const nightScheduleControlsHtml = nightMode === "auto"
      ? `
        <div class="scheduled-start-grid two-col">
          <label class="night-time-card" for="mobileNightStartInput">
            <span class="night-time-label">${this._esc(this._i18n("ui.start_time_2"))}</span>
            <input class="night-time-input" id="mobileNightStartInput" data-schedule-form-control type="time" value="${this._esc(nightWindow.start)}" step="60" aria-label="${this._esc(this._i18n("ui.start_time_2"))}">
          </label>
          <label class="night-time-card" for="mobileNightEndInput">
            <span class="night-time-label">${this._esc(this._i18n("ui.end_time"))}</span>
            <input class="night-time-input" id="mobileNightEndInput" data-schedule-form-control type="time" value="${this._esc(nightWindow.end)}" step="60" aria-label="${this._esc(this._i18n("ui.end_time"))}">
          </label>
        </div>
        <div class="settings-label">${this._esc(this._i18n("ui.active_days"))}</div>
        <div class="settings-check-grid">
          ${this._nightModeDayOptions().map(([value, label]) => `
            <label class="settings-check-pill">
              <input type="checkbox" data-schedule-form-control data-setting-night-day="${this._esc(String(value))}" ${nightDays.has(value) ? "checked" : ""}>
              <span>${this._esc(label)}</span>
            </label>`).join("")}
        </div>
        <div class="settings-actions">
          <button class="settings-pill active" data-setting-night-window-save>${this._esc(this._i18n("ui.apply_schedule"))}</button>
        </div>
      `
      : `<div class="notice open">${this._esc(nightMode === "on"
          ? this._i18n("ui.night_mode_stays_on_until_you_choose_another_mode")
          : this._i18n("ui.night_mode_is_off_until_you_choose_another_mode"))}</div>`;
    const nightHtml = `
      <div class="settings-group scheduled-start-card schedule-panel-card schedule-night-card">
        <div class="settings-label">${this._esc(this._i18n("ui.night_mode"))}</div>
        <div class="settings-pills">
          ${this._settingsPill(this._i18n("ui.off"), "off", nightMode, "data-setting-night-mode")}
          ${this._settingsPill("Auto", "auto", nightMode, "data-setting-night-mode")}
          ${this._settingsPill(this._i18n("ui.on"), "on", nightMode, "data-setting-night-mode")}
        </div>
        ${nightScheduleControlsHtml}
      </div>
    `;
    return `
      <div class="settings-shell">
        <div class="schedule-tabs" role="tablist" aria-label="${this._esc(this._i18n("ui.schedules"))}">
          <button class="settings-pill ${activeTab === "timers" ? "active" : ""}" data-schedule-tab="timers">${this._esc(this._i18n("ui.timers"))}</button>
          <button class="settings-pill ${activeTab === "wake" ? "active" : ""}" data-schedule-tab="wake">${this._esc(this._i18n("ui.wake"))}</button>
          <button class="settings-pill ${activeTab === "night" ? "active" : ""}" data-schedule-tab="night">${this._esc(this._i18n("ui.night"))}</button>
        </div>
        <div class="schedule-content">
          ${activeTab === "wake" ? wakeHtml : activeTab === "night" ? nightHtml : timersHtml}
        </div>
      </div>
    `;
  }

  _mainMenuHtml() {
    return actionMenuHtml.call(this);
  }

  _playerArtworkUrl(player = null, size = 180) {
    if (!player) return "";
    const attrs = player.attributes || {};
    const localQueueArt = this._isLocalSendspinPlayer(player)
      ? this._queueItemImageUrl(this._state.maQueueState?.current_item, size)
      : "";
    return localQueueArt
      || this._imageUrl(attrs.entity_picture_local, size)
      || this._imageUrl(attrs.entity_picture, size)
      || this._imageUrl(attrs.media_image_url, size)
      || this._imageUrl(attrs.media_image, size)
      || this._imageUrl(attrs.thumbnail, size)
      || "";
  }

  _playersActionHubHtml(options = {}) {
    if (immersivePlayerEnabled(this)) {
      const players = this._state.players || [];
      const playing = players.filter((p) => p.state === "playing").length;
      const available = players.filter((p) => HomeiiPlayersFoundation.isPlayerAvailable(p)).length;
      return `<div class="player-choice-summary"><span>${available} ${this._m("available", "זמינים")} · ${playing} ${this._m("playing", "מנגנים")}</span><button data-menu-action="${this._esc(options.thisDeviceActionName || "connect_this_device")}">${this._esc(options.thisDeviceTitle || this._i18n("ui.player_on_this_device"))}</button></div>`;
    }
    const queueCount = this._getNowPlayingQueueItems().length || Number(this._state.maQueueState?.items || 0) || 0;
    return `
      <div class="players-action-bar">
        <div class="players-action-shell">
          <div class="players-action-hub">
            <button class="players-action-chip" data-menu-action="${this._esc(options.thisDeviceActionName || "connect_this_device")}" title="${this._esc(options.thisDeviceTitle || this._i18n("ui.player_on_this_device"))}" aria-label="${this._esc(options.thisDeviceTitle || this._i18n("ui.player_on_this_device"))}">
              <span class="players-action-icon">${this._iconSvg("this_device")}</span>
              ${this._mobileFooterMode() === "icon" ? "" : `<span class="players-action-label">${this._esc(this._i18n("ui.player_on_this_device"))}</span>`}
            </button>
            <button class="players-action-chip" data-menu-nav="queue" title="${this._esc(this._i18n("ui.queue_2"))}">
              <span class="players-action-icon">${this._iconSvg("queue")}</span>
              ${this._mobileFooterMode() === "icon" ? "" : `<span class="players-action-label">${this._esc(this._i18n("ui.queue_2"))}</span>`}
              ${queueCount ? `<strong class="players-action-badge">${this._esc(String(queueCount))}</strong>` : ``}
            </button>
            <button class="players-action-chip" data-menu-nav="group" title="${this._esc(this._i18n("ui.group_speakers_2"))}">
              <span class="players-action-icon">${this._iconSvg("speaker_group")}</span>
              ${this._mobileFooterMode() === "icon" ? "" : `<span class="players-action-label">${this._esc(this._i18n("ui.group"))}</span>`}
            </button>
            <button class="players-action-chip danger" data-menu-nav="stop_all" title="${this._esc(this._cleanAllLabel())}">
              <span class="players-action-icon">${this._iconSvg("stop")}</span>
              ${this._mobileFooterMode() === "icon" ? "" : `<span class="players-action-label">${this._esc(this._cleanAllLabel())}</span>`}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  _discoveryCategoryOptions() {
    return this._musicStyleCatalog().map((style) => ({
      ...style,
      key: style.id,
      query: style.query || style.queries?.[0] || style.label,
      queries: style.queries?.length ? style.queries : [`${style.label} playlist`],
    }));
  }

  _discoveryGenreFallbackOptions() {
    return [
      { key: "all", label: this._i18n("ui.all", {}, this._discoveryGenreLabel("All", "הכול", "Alle")), query: "" },
    ];
  }

  _discoveryCategory() {
    const categories = this._discoveryCategoryOptions();
    const found = categories.find((entry) => entry.key === this._state.discoveryCategoryKey) || categories[0];
    if (found?.key && this._state.discoveryCategoryKey !== found.key) this._state.discoveryCategoryKey = found.key;
    return found;
  }

  _startDiscoverySession() {
    this._state.discoverySessionSeed = Date.now() + Math.floor(Math.random() * 100000);
    this._state.discoveryExpandedUri = "";
  }

  _discoveryShuffleScore(item = {}, index = 0, seed = this._state.discoverySessionSeed || Date.now()) {
    const text = `${seed}|${item?.uri || ""}|${item?.name || item?.title || ""}|${index}`;
    let hash = 2166136261;
    for (let i = 0; i < text.length; i += 1) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  _shuffleDiscoveryItems(items = [], seed = this._state.discoverySessionSeed || Date.now()) {
    return (Array.isArray(items) ? items : [])
      .map((item, index) => ({ item, index, score: this._discoveryShuffleScore(item, index, seed) }))
      .sort((a, b) => (a.score - b.score) || (a.index - b.index))
      .map((entry) => entry.item);
  }

  _discoveryGenreKey(value = "") {
    const normalized = String(value || "")
      .trim()
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/^-+|-+$/g, "");
    return normalized || "genre";
  }

  _discoveryGenreOptionFromItem(item = {}, index = 0) {
    const mediaItem = item?.media_item || item?.item || item;
    const label = String(mediaItem?.name || mediaItem?.title || item?.name || item?.title || mediaItem?.item_id || mediaItem?.uri || "").trim();
    if (!label) return null;
    const itemId = String(mediaItem?.item_id || item?.item_id || mediaItem?.id || item?.id || "").trim();
    const uri = String(mediaItem?.uri || item?.uri || "").trim();
    const keySeed = itemId ? `genre-${itemId}` : (uri || label);
    return {
      key: this._discoveryGenreKey(keySeed) || `genre-${index}`,
      label,
      query: label,
      item_id: itemId,
      uri,
    };
  }

  _discoveryGenreLabel(en, he, de = en) {
    const lang = this._language();
    if (lang === "he") return he;
    if (lang === "de") return de;
    return en;
  }

  _discoveryPopularGenreProfiles() {
    return [
      { key: "pop", label: this._discoveryGenreLabel("Pop", "פופ", "Pop"), query: "pop", aliases: ["pop", "pop music", "afropop", "synthpop", "synth pop", "k-pop", "kpop", "j-pop", "jpop", "israeli pop"], children: [
        { key: "dance-pop", label: this._discoveryGenreLabel("Dance Pop", "דאנס פופ", "Dance-Pop"), query: "dance pop" },
        { key: "k-pop", label: this._discoveryGenreLabel("K-Pop", "קיי־פופ", "K-Pop"), query: "k-pop" },
        { key: "indie-pop", label: this._discoveryGenreLabel("Indie Pop", "אינדי פופ", "Indie-Pop"), query: "indie pop" },
        { key: "israeli-pop", label: this._discoveryGenreLabel("Israeli Pop", "פופ ישראלי", "Israelischer Pop"), query: "israeli pop" },
      ] },
      { key: "hip-hop", label: this._discoveryGenreLabel("Hip-Hop", "היפ־הופ", "Hip-Hop"), query: "hip hop", aliases: ["hip hop", "hip-hop", "hiphop", "rap", "trap"], children: [
        { key: "rap", label: this._discoveryGenreLabel("Rap", "ראפ", "Rap"), query: "rap" },
        { key: "trap", label: this._discoveryGenreLabel("Trap", "טראפ", "Trap"), query: "trap" },
        { key: "old-school", label: this._discoveryGenreLabel("Old School", "אולד סקול", "Old School"), query: "old school hip hop" },
        { key: "israeli-rap", label: this._discoveryGenreLabel("Israeli Rap", "ראפ ישראלי", "Israelischer Rap"), query: "israeli rap" },
      ] },
      { key: "rock", label: this._discoveryGenreLabel("Rock", "רוק", "Rock"), query: "rock", aliases: ["rock", "classic rock", "alt rock", "alternative rock", "hard rock", "soft rock", "punk"], children: [
        { key: "classic-rock", label: this._discoveryGenreLabel("Classic Rock", "רוק קלאסי", "Classic Rock"), query: "classic rock" },
        { key: "alternative-rock", label: this._discoveryGenreLabel("Alternative Rock", "רוק אלטרנטיבי", "Alternative Rock"), query: "alternative rock" },
        { key: "indie-rock", label: this._discoveryGenreLabel("Indie Rock", "אינדי רוק", "Indie-Rock"), query: "indie rock" },
        { key: "punk", label: this._discoveryGenreLabel("Punk", "פאנק רוק", "Punk"), query: "punk rock" },
      ] },
      { key: "electronic", label: this._discoveryGenreLabel("Electronic", "אלקטרונית", "Elektronisch"), query: "electronic", aliases: ["electronic", "electronica", "edm", "house", "deep house", "tech house", "afro house", "afro tech", "techno", "trance", "dubstep", "drum and bass", "dnb"], children: [
        { key: "house", label: this._discoveryGenreLabel("House", "האוס", "House"), query: "house music" },
        { key: "techno", label: this._discoveryGenreLabel("Techno", "טכנו", "Techno"), query: "techno" },
        { key: "trance", label: this._discoveryGenreLabel("Trance", "טראנס", "Trance"), query: "trance" },
        { key: "edm", label: this._discoveryGenreLabel("EDM", "EDM", "EDM"), query: "edm" },
      ] },
      { key: "dance", label: this._discoveryGenreLabel("Dance", "דאנס", "Dance"), query: "dance", aliases: ["dance", "club", "disco", "dance pop", "party"], children: [
        { key: "party", label: this._discoveryGenreLabel("Party", "מסיבה", "Party"), query: "party hits" },
        { key: "club", label: this._discoveryGenreLabel("Club", "מועדונים", "Club"), query: "club dance" },
        { key: "disco", label: this._discoveryGenreLabel("Disco", "דיסקו", "Disco"), query: "disco" },
        { key: "workout", label: this._discoveryGenreLabel("Workout", "אימון", "Training"), query: "workout dance" },
      ] },
      { key: "rnb", label: this._discoveryGenreLabel("R&B", "R&B", "R&B"), query: "r&b", aliases: ["r&b", "rnb", "rhythm and blues", "afro r&b"], children: [
        { key: "contemporary", label: this._discoveryGenreLabel("Contemporary", "עכשווי", "Zeitgenoessisch"), query: "contemporary r&b" },
        { key: "slow-jams", label: this._discoveryGenreLabel("Slow Jams", "שירים איטיים", "Slow Jams"), query: "slow jams" },
        { key: "rnb-hits", label: this._discoveryGenreLabel("R&B Hits", "להיטי R&B", "R&B-Hits"), query: "r&b hits" },
      ] },
      { key: "soul", label: this._discoveryGenreLabel("Soul", "סול", "Soul"), query: "soul", aliases: ["soul", "neo soul", "afro soul"], children: [
        { key: "neo-soul", label: this._discoveryGenreLabel("Neo Soul", "נאו סול", "Neo Soul"), query: "neo soul" },
        { key: "funk", label: this._discoveryGenreLabel("Funk", "פאנק", "Funk"), query: "funk soul" },
        { key: "motown", label: this._discoveryGenreLabel("Motown", "מוטאון", "Motown"), query: "motown soul" },
      ] },
      { key: "jazz", label: this._discoveryGenreLabel("Jazz", "ג׳אז", "Jazz"), query: "jazz", aliases: ["jazz", "smooth jazz", "vocal jazz", "bebop"], children: [
        { key: "smooth", label: this._discoveryGenreLabel("Smooth Jazz", "ג׳אז רך", "Smooth Jazz"), query: "smooth jazz" },
        { key: "vocal", label: this._discoveryGenreLabel("Vocal Jazz", "ג׳אז ווקאלי", "Vocal Jazz"), query: "vocal jazz" },
        { key: "fusion", label: this._discoveryGenreLabel("Fusion", "פיוז׳ן", "Fusion"), query: "jazz fusion" },
      ] },
      { key: "israeli", label: this._i18n("ui.israeli"), query: "israeli hebrew", aliases: ["israeli", "israel", "hebrew", "ישראל", "ישראלית", "עברית"], children: [
        { key: "mizrahi", label: this._discoveryGenreLabel("Mizrahi", "מזרחית", "Mizrahi"), query: "מוזיקה מזרחית" },
        { key: "hebrew-hits", label: this._discoveryGenreLabel("Hebrew Hits", "להיטים בעברית", "Hebraeische Hits"), query: "להיטים בעברית" },
        { key: "israeli-rock", label: this._discoveryGenreLabel("Israeli Rock", "רוק ישראלי", "Israelischer Rock"), query: "רוק ישראלי" },
      ] },
      { key: "chill", label: this._discoveryGenreLabel("Chill", "צ׳יל", "Chill"), query: "chill", aliases: ["chill", "chillout", "chill out", "lofi", "lo-fi", "lounge", "relax", "relaxing"], children: [
        { key: "lofi", label: this._discoveryGenreLabel("Lo-Fi", "לו־פיי", "Lo-Fi"), query: "lo-fi chill" },
        { key: "lounge", label: this._discoveryGenreLabel("Lounge", "לאונג׳", "Lounge"), query: "lounge chill" },
        { key: "acoustic", label: this._discoveryGenreLabel("Acoustic", "אקוסטי", "Akustisch"), query: "acoustic chill" },
        { key: "sleep", label: this._discoveryGenreLabel("Sleep", "שינה", "Schlaf"), query: "sleep music" },
      ] },
      { key: "classical", label: this._discoveryGenreLabel("Classical", "קלאסית", "Klassik"), query: "classical", aliases: ["classical", "classical music", "orchestra", "orchestral", "piano", "opera"], children: [
        { key: "piano", label: this._discoveryGenreLabel("Piano", "פסנתר", "Klavier"), query: "classical piano" },
        { key: "orchestra", label: this._discoveryGenreLabel("Orchestra", "תזמורת", "Orchester"), query: "orchestra classical" },
        { key: "opera", label: this._discoveryGenreLabel("Opera", "אופרה", "Oper"), query: "opera" },
      ] },
      { key: "latin", label: this._discoveryGenreLabel("Latin", "לטינית", "Latin"), query: "latin", aliases: ["latin", "reggaeton", "salsa", "bachata", "bossa nova", "latino"], children: [
        { key: "reggaeton", label: this._discoveryGenreLabel("Reggaeton", "רגאטון", "Reggaeton"), query: "reggaeton" },
        { key: "salsa", label: this._discoveryGenreLabel("Salsa", "סלסה", "Salsa"), query: "salsa" },
        { key: "bachata", label: this._discoveryGenreLabel("Bachata", "בצ׳אטה", "Bachata"), query: "bachata" },
        { key: "latin-pop", label: this._discoveryGenreLabel("Latin Pop", "פופ לטיני", "Latin Pop"), query: "latin pop" },
      ] },
      { key: "afro", label: this._discoveryGenreLabel("Afro", "אפרו", "Afro"), query: "afro", aliases: ["afro", "afrobeats", "afrobeat", "afropop", "afropiano", "amapiano", "afro house", "afro tech", "afro soul", "afro r&b", "afroswing"], children: [
        { key: "afrobeats", label: this._discoveryGenreLabel("Afrobeats", "אפרוביטס", "Afrobeats"), query: "afrobeats" },
        { key: "amapiano", label: this._discoveryGenreLabel("Amapiano", "אמאפיאנו", "Amapiano"), query: "amapiano" },
        { key: "afro-house", label: this._discoveryGenreLabel("Afro House", "אפרו האוס", "Afro House"), query: "afro house" },
        { key: "afropop", label: this._discoveryGenreLabel("Afropop", "אפרופופ", "Afropop"), query: "afropop" },
      ] },
      { key: "indie", label: this._discoveryGenreLabel("Indie", "אינדי", "Indie"), query: "indie", aliases: ["indie", "indie pop", "indie rock"], children: [
        { key: "indie-pop", label: this._discoveryGenreLabel("Indie Pop", "אינדי פופ", "Indie-Pop"), query: "indie pop" },
        { key: "indie-rock", label: this._discoveryGenreLabel("Indie Rock", "אינדי רוק", "Indie-Rock"), query: "indie rock" },
        { key: "alternative", label: this._discoveryGenreLabel("Alternative", "אלטרנטיבי", "Alternative"), query: "alternative music" },
      ] },
      { key: "metal", label: this._discoveryGenreLabel("Metal", "מטאל", "Metal"), query: "metal", aliases: ["metal", "heavy metal", "death metal", "black metal"], children: [
        { key: "heavy", label: this._discoveryGenreLabel("Heavy Metal", "הבי מטאל", "Heavy Metal"), query: "heavy metal" },
        { key: "alternative", label: this._discoveryGenreLabel("Alternative Metal", "מטאל אלטרנטיבי", "Alternative Metal"), query: "alternative metal" },
      ] },
      { key: "country", label: this._discoveryGenreLabel("Country", "קאנטרי", "Country"), query: "country", aliases: ["country", "americana", "bluegrass"] },
      { key: "reggae", label: this._discoveryGenreLabel("Reggae", "רגאיי", "Reggae"), query: "reggae", aliases: ["reggae", "dancehall", "dub"] },
      { key: "folk", label: this._discoveryGenreLabel("Folk", "פולק", "Folk"), query: "folk", aliases: ["folk", "singer songwriter", "singer-songwriter", "acoustic"] },
      { key: "ambient", label: this._discoveryGenreLabel("Ambient", "אמביינט", "Ambient"), query: "ambient", aliases: ["ambient", "new age", "soundscape"] },
      { key: "kids", label: this._i18n("ui.kids"), query: "kids", aliases: ["kids", "children", "childrens", "family", "ילדים"] },
    ];
  }

  _discoveryGenreMatchText(value = "") {
    return ` ${this._discoveryGenreKey(value).replace(/-/g, " ")} `;
  }

  _discoveryGenreProfileScore(genre = {}, profile = {}) {
    const haystack = this._discoveryGenreMatchText(genre.label || genre.query || genre.key || "");
    const compactHaystack = haystack.replace(/\s+/g, "");
    return [profile.key, profile.query, profile.label, ...(profile.aliases || [])].reduce((score, alias) => {
      const needle = this._discoveryGenreMatchText(alias).trim();
      if (!needle) return score;
      if (haystack.trim() === needle) return Math.max(score, 8);
      if (haystack.includes(` ${needle} `)) return Math.max(score, 5);
      if (compactHaystack.includes(needle.replace(/\s+/g, ""))) return Math.max(score, 2);
      return score;
    }, 0);
  }

  _discoveryGenreOptionsFlat(genres = []) {
    return (Array.isArray(genres) ? genres : []).flatMap((genre) => [
      genre,
      ...(Array.isArray(genre?.children) ? genre.children : []),
    ]);
  }

  _discoveryResponseItems(raw) {
    const candidates = [];
    const addCandidate = (value) => {
      if (!value) return;
      candidates.push(value);
      if (value && typeof value === "object" && !Array.isArray(value)) {
        candidates.push(value.response, value.result, value.items, value.genres);
      }
    };
    addCandidate(raw);
    addCandidate(raw?.response);
    addCandidate(raw?.result);
    for (const candidate of candidates) {
      if (Array.isArray(candidate)) return candidate;
      if (Array.isArray(candidate?.items)) return candidate.items;
      if (Array.isArray(candidate?.genres)) return candidate.genres;
    }
    return [];
  }

  _normalizeDiscoveryGenreOptions(genreItems = [], limit = 20) {
    const rawGenres = (Array.isArray(genreItems) ? genreItems : [])
      .map((item, index) => this._discoveryGenreOptionFromItem(item, index))
      .filter(Boolean);
    const profiles = this._discoveryPopularGenreProfiles();
    return profiles
      .map((profile, index) => {
        const score = rawGenres.reduce((best, genre) => Math.max(best, this._discoveryGenreProfileScore(genre, profile)), 0);
        const children = (Array.isArray(profile.children) ? profile.children : []).map((child) => ({
          ...child,
          key: `${profile.key}:${child.key}`,
          parent_key: profile.key,
          parent_label: profile.label,
        }));
        return {
          key: profile.key,
          label: profile.label,
          query: profile.query,
          children,
          score,
          index,
        };
      })
      .filter((genre) => genre.score > 0 || genre.index < limit)
      .sort((a, b) => a.index - b.index)
      .slice(0, limit);
  }

  async _loadDiscoveryGenresFromMusicAssistant() {
    if (!this._homeiiEngineRequired?.()) return this._normalizeDiscoveryGenreOptions([]);
    const engineReady = typeof this._ensureHomeiiEngineReadyForAction === "function"
      ? await this._ensureHomeiiEngineReadyForAction()
      : !!this._state?.engineAvailable;
    if (!engineReady) return this._normalizeDiscoveryGenreOptions([]);
    const genreItems = await this._fetchLibrary("genre", "sort_name", 120, false);
    return this._normalizeDiscoveryGenreOptions(genreItems);
  }

  _discoveryGenre(genres = []) {
    const options = Array.isArray(genres) && genres.length ? genres : this._discoveryGenreFallbackOptions();
    const flatOptions = this._discoveryGenreOptionsFlat(options);
    return flatOptions.find((entry) => entry.key === this._state.discoveryGenreKey) || options[0];
  }

  async _loadDiscoveryGenres() {
    const fallback = this._discoveryGenreFallbackOptions();
    const cacheKey = "discovery:genres:music-assistant";
    const ttl = Number(this._config.cache_ttl || 300000);
    const cached = this._cache.library.get(cacheKey);
    if (cached && Date.now() - cached.ts < ttl) return cached.items;
    let genres = [];
    try {
      genres = await this._loadDiscoveryGenresFromMusicAssistant();
    } catch {
      genres = this._normalizeDiscoveryGenreOptions([]);
    }
    const items = genres.length ? [fallback[0], ...genres] : fallback;
    this._cache.library.set(cacheKey, { ts: Date.now(), items });
    return items;
  }

  _discoveryQueryWithGenre(query = "", genre = null) {
    const baseQuery = String(query || "").trim();
    const genreQuery = String(genre?.key === "all" ? "" : (genre?.query || genre?.label || "")).trim();
    if (!genreQuery) return baseQuery;
    if (!baseQuery) return `${genreQuery} playlist`;
    if (baseQuery.toLowerCase().includes(genreQuery.toLowerCase())) return baseQuery;
    return `${genreQuery} ${baseQuery}`;
  }

  _discoveryUniqueItems(items = [], fallbackType = "playlist") {
    const seen = new Set();
    const unique = [];
    (Array.isArray(items) ? items : []).forEach((item) => {
      const normalized = this._normalizeMediaItem({ ...item, media_type: item?.media_type || fallbackType });
      const uri = String(normalized?.uri || "").trim();
      const name = String(normalized?.name || normalized?.title || "").trim().toLowerCase();
      const provider = String(normalized?.provider || normalized?.provider_domain || normalized?.provider_instance || "").trim().toLowerCase();
      const key = uri || `${provider}:${name}`;
      if (!key || seen.has(key)) return;
      seen.add(key);
      unique.push(normalized);
    });
    return unique;
  }

  async _searchDiscoveryProviderResults(query = "") {
    const q = String(query || "").trim();
    if (!q) return this._emptySearchResults();
    let results = this._emptySearchResults();
    try {
      results = this._normalizeSearchResponse(await this._callService("search", { query: q, limit: 30 }));
    } catch {
      try {
        results = this._normalizeSearchResponse(await this._callService("search", { name: q, limit: 30, media_type: ["playlist", "album", "track", "radio", "genre"] }));
      } catch {}
    }
    return results;
  }

  async _loadDiscoveryCategoryPlaylists(category = this._discoveryCategory(), genre = this._discoveryGenre()) {
    const queries = (Array.isArray(category?.queries) ? category.queries : [category?.query])
      .map((query) => String(query || "").trim())
      .filter(Boolean);
    const scopedQueries = (queries.length ? queries : ["recommended playlist"])
      .map((query) => this._discoveryQueryWithGenre(query, genre))
      .filter(Boolean);
    const genreScoped = String(genre?.key || "all") !== "all";
    const searchResults = genreScoped
      ? await Promise.allSettled(queries.map((query) =>
        category?.fresh ? this._searchDiscoveryProviderResults(query) : this._search(query)
      ))
      : [];
    const scopedSearchResults = await Promise.allSettled(scopedQueries.map((query) =>
      category?.fresh ? this._searchDiscoveryProviderResults(query) : this._search(query)
    ));
    const providerPlaylists = searchResults.flatMap((result) =>
      result.status === "fulfilled" && Array.isArray(result.value?.playlists)
        ? result.value.playlists
        : []
    );
    const scopedProviderPlaylists = scopedSearchResults.flatMap((result) =>
      result.status === "fulfilled" && Array.isArray(result.value?.playlists)
        ? result.value.playlists
        : []
    );
    const libraryResults = category?.fresh
      ? []
      : await Promise.allSettled(scopedQueries.slice(0, 2).map((query) => this._fetchLibrary("playlist", "sort_name", 14, false, query)));
    const libraryPlaylists = libraryResults.flatMap((result) =>
      result.status === "fulfilled" && Array.isArray(result.value) ? result.value : []
    );
    return this._discoveryUniqueItems([...scopedProviderPlaylists, ...providerPlaylists, ...libraryPlaylists], "playlist").slice(0, 30);
  }

  async _loadDiscoverySections(...args) {
    return loadDiscoverySections.apply(this, args);
  }

  _discoveryEndlessItems({ categoryPlaylists = [], recent = [], albums = [], radios = [] } = {}) {
    const sources = [
      { items: categoryPlaylists, type: "playlist", label: this._i18n("ui.provider_playlists") },
      { items: albums, type: "album", label: this._i18n("ui.discover_albums") },
      { items: recent, type: "track", label: this._i18n("ui.recently_played_2") },
      { items: radios, type: "radio", label: this._i18n("ui.favorite_radio") },
    ];
    const seen = new Set();
    const endless = [];
    sources.forEach((source) => {
      (Array.isArray(source.items) ? source.items : []).forEach((item) => {
        const normalized = this._normalizeMediaItem({ ...item, media_type: item?.media_type || source.type });
        const uri = String(normalized?.uri || "").trim();
        const name = String(normalized?.name || normalized?.title || "").trim().toLowerCase();
        const key = uri || `${source.type}:${name}`;
        if (!key || seen.has(key)) return;
        seen.add(key);
        endless.push({ ...normalized, media_type: normalized?.media_type || source.type, _homeiiDiscoveryLabel: source.label });
      });
    });
    return this._shuffleDiscoveryItems(endless, (this._state.discoverySessionSeed || Date.now()) + 53).slice(0, 58);
  }

  _discoveryOrbStyle(item = {}, index = 0) {
    const text = `${item?.uri || ""}|${item?.name || item?.title || ""}|${index}`;
    let hash = 0;
    for (let i = 0; i < text.length; i += 1) {
      hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;
    }
    const seed = Math.abs(hash || index + 1);
    const delays = [0, -1.2, -2.4, -3.6, -4.8, -6];
    return `--orb-size:156px;--orb-shift:0px;--orb-lift:0px;--orb-delay:${delays[seed % delays.length]}s;`;
  }

  _syncDiscoveryOrbSelection(activeUri = "") {
    const uri = String(activeUri || "");
    Array.from(this.shadowRoot?.querySelectorAll?.(".discovery-orb-field") || []).forEach((field) => {
      field.classList.toggle("has-active", !!uri);
    });
    Array.from(this.shadowRoot?.querySelectorAll?.(".discovery-orb[data-media-uri]") || []).forEach((button) => {
      const active = !!uri && button.dataset.mediaUri === uri;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  _discoveryOrbCloudHtml(items = [], activeCategory = null, activeGenre = null) {
    const playable = (Array.isArray(items) ? items : [])
      .filter((item) => String(item?.uri || "").trim())
      .slice(0, 58);
    if (!playable.length) return "";
    const genreLabel = activeGenre?.key && activeGenre.key !== "all" ? activeGenre.label : this._i18n("ui.all_genres");
    const activeUri = String(this._state.discoveryExpandedUri || "");
    const hasActive = !!activeUri && playable.some((item) => String(item?.uri || "") === activeUri);
    return `
      <section class="discovery-endless">
        <div class="discovery-endless-head">
          <div>
            <div class="discovery-endless-title">${this._esc(activeCategory?.label || this._i18n("ui.recommended"))}</div>
            <div class="discovery-endless-sub">${this._esc(`${this._i18n("ui.genre")}: ${genreLabel}`)}</div>
          </div>
        </div>
        <div class="discovery-orb-field ${hasActive ? "has-active" : ""}">
          ${playable.map((item, index) => {
            const mediaType = item?.media_type || "album";
            const titleText = item?.name || item?.title || this._i18n("ui.discover");
            const subText = this._artistName(item) || item?.artist || item?.album?.name || item?._homeiiDiscoveryLabel || this._emptyQuickSuggestionLabel(mediaType);
            const art = this._artUrl(item) || item?.image || item?.image_url || item?.album?.image || "";
            const active = String(this._state.discoveryExpandedUri || "") === String(item.uri || "");
            return `
              <button class="discovery-orb orb-${index % 7} ${active ? "is-active" : ""}" style="${this._esc(this._discoveryOrbStyle(item, index))}" data-media-uri="${this._esc(item.uri)}" data-media-type="${this._esc(mediaType)}" aria-pressed="${active ? "true" : "false"}" title="${this._esc(titleText)}">
                <span class="discovery-orb-art">
                  ${art ? this._imgHtml(art, "", { fallbackIcon: mediaType === "radio" ? "radio" : "album" }) : this._iconSvg(mediaType === "radio" ? "radio" : "album")}
                  <span class="discovery-orb-play" aria-hidden="true">${this._iconSvg("play")}</span>
                </span>
                <span class="discovery-orb-copy">
                  <span class="discovery-orb-title">${this._esc(titleText)}</span>
                  <span class="discovery-orb-sub">${this._esc(subText)}</span>
                </span>
              </button>
            `;
          }).join("")}
        </div>
      </section>
    `;
  }

  _discoveryPlayerFocusHtml(...args) {
    return discoveryPlayerFocusHtml.apply(this, args);
  }

  _updateDiscoveryMenuBody(...args) {
    return updateDiscoveryMenuBody.apply(this, args);
  }

  _discoveryMenuHtml(...args) {
    return discoveryMenuHtml.apply(this, args);
  }

  async _selectDiscoveryCategory(categoryKey = "") {
    const categories = this._discoveryCategoryOptions();
    const next = categories.find((entry) => entry.key === categoryKey) || categories[0];
    if (!next) return;
    this._state.discoveryCategoryKey = next.key;
    this._state.discoverySessionSeed = Date.now() + Math.floor(Math.random() * 100000);
    this._state.discoveryExpandedUri = "";
    try { localStorage.setItem(this._lsKey("homeii_music_flow_discovery_category_key"), this._state.discoveryCategoryKey || "pop"); } catch {}
    await this._renderMobileMenu();
  }

  async _selectDiscoveryGenre(genreKey = "") {
    this._state.discoveryGenreKey = String(genreKey || "all").trim() || "all";
    this._state.discoverySessionSeed = Date.now() + Math.floor(Math.random() * 100000);
    this._state.discoveryExpandedUri = "";
    try { localStorage.setItem(this._lsKey("homeii_music_flow_discovery_genre_key"), this._state.discoveryGenreKey || "all"); } catch {}
    await this._renderMobileMenu();
  }

  _playerRowHtml(p, attrs = "", active = false, options = {}) {
    if (!HomeiiPlayersFoundation.isPlayerAvailable(p)) return "";
    const art = this._playerArtworkUrl(p, 180);
    const activePlayback = p?.state === "playing";
    const showControls = !!options.controls;
    const showFrontPin = options.pin !== false;
    const frontPinned = this._frontPinnedPlayerEntity() === p?.entity_id;
    const friendlyName = this._playerDisplayName(p);
    const available = HomeiiPlayersFoundation.isPlayerAvailable(p);
    const track = available ? (p.attributes?.media_title || p.attributes?.media_artist || "") : this._i18n("ui.disconnected");
    const activityIcon = `<span class="player-premium-bars eq-icon ${activePlayback ? "is-active" : "is-static"}" aria-label="${this._esc(this._playerStateLabel(p))}"><span></span><span></span><span></span></span>`;
    const pinHtml = showFrontPin
      ? `<button type="button" class="player-premium-side player-front-pin ${frontPinned ? "active" : ""}" data-front-pin-player="${this._esc(p.entity_id)}" title="${this._esc(frontPinned ? this._m("Clear front pin", "בטל נעיצה בחזית") : this._m("Pin player to front", "נעץ נגן בחזית"))}" aria-pressed="${frontPinned ? "true" : "false"}">${this._iconSvg("pin")}</button>`
      : ``;
    if (immersivePlayerEnabled(this) && attrs.includes("data-menu-player=")) {
      return playerChoiceHtml(this, p, { attrs, active, available, name: friendlyName, track, art, pinHtml });
    }
    const body = `
      <button class="player-premium-head ${active ? "active" : ""} ${activePlayback ? "is-playing" : ""}" ${attrs}>
        <span class="player-premium-art">
          ${art ? this._imgHtml(art, "", { fallbackIcon: "speaker" }) : this._iconSvg("speaker")}
        </span>
        <span class="player-premium-copy">
          <span class="player-premium-title-row">
            <span class="player-premium-name">${this._esc(friendlyName)}</span>
            ${activityIcon}
          </span>
          ${track ? `<span class="player-premium-track">${this._esc(track)}</span>` : ``}
        </span>
      </button>
    `;
    if (!showControls) {
      return `
        <div class="player-menu-card ${active ? "active" : ""}">
          ${body}
          ${pinHtml}
        </div>
      `;
    }
    return `
      <div class="player-menu-card ${active ? "active" : ""}">
        ${body}
        ${pinHtml}
        ${playerVolumeControlsHtml(this, p)}
      </div>
    `;
  }

  _playersMenuHtml(options = {}) {
    this._loadPlayers();
    const hotelMode = this._isHotelMode();
    const selected = this._state.selectedPlayer;
    const players = (this._state.players || []).filter(HomeiiPlayersFoundation.isPlayerAvailable);
    const pinnedEntities = new Set(this._resolvedPinnedPlayerEntities(players));
    const browserPlayers = this._getBrowserPlayers(players);
    const rememberedThisDevice = this._getThisDevicePlayer(players);
    const connectingThisDevice = !!this._localSendspinConnecting;
    const waitingThisDevice = !!this._state.awaitingThisDevicePlayer;
    const desiredThisDevice = this._isLocalSendspinDesired();
    const localStatus = String(this._state.localSendspinStatus || "").toLowerCase();
    const disconnectingThisDevice = !!this._state.localSendspinDisconnecting || localStatus === "disconnecting";
    const connectedThisDevice = !!rememberedThisDevice || this._localSendspinConnected || localStatus === "connected";
    const startingThisDevice = !connectedThisDevice && !disconnectingThisDevice && (connectingThisDevice || waitingThisDevice || desiredThisDevice || ["connecting", "reconnecting", "suspended"].includes(localStatus));
    const disconnectedThisDevice = !connectedThisDevice && !startingThisDevice && localStatus === "disconnected";
    const thisDeviceAction = disconnectingThisDevice
      ? this._i18n("ui.disconnecting")
      : connectedThisDevice
        ? this._i18n("ui.connected")
        : startingThisDevice
          ? this._i18n("ui.connecting")
          : disconnectedThisDevice
            ? this._i18n("ui.disconnected")
            : this._i18n("ui.enable");
    const thisDeviceActionName = (connectedThisDevice || startingThisDevice || desiredThisDevice || connectingThisDevice || waitingThisDevice)
      ? "disconnect_this_device"
      : "connect_this_device";
    const thisDeviceLabel = this._i18n("ui.player_on_this_device");
    const thisDeviceTitle = `${thisDeviceLabel} · ${thisDeviceAction}`;
    const thisDeviceHtml = rememberedThisDevice
      ? `
        <div class="players-premium-grid">
          ${this._playerRowHtml(rememberedThisDevice, `data-menu-player="${this._esc(rememberedThisDevice.entity_id)}"`, rememberedThisDevice.entity_id === selected, { controls: !hotelMode, pin: true })}
        </div>
      `
      : ``;
    const frontPinnedEntityId = this._frontPinnedPlayerEntity(players);
    const visiblePlayers = players.filter((p) => (options.activeOnly || hotelMode || p.entity_id !== rememberedThisDevice?.entity_id) && !this._isLikelyBrowserPlayer(p) && (
      !pinnedEntities.size
      || pinnedEntities.has(p.entity_id)
      || p.entity_id === frontPinnedEntityId
      || p.entity_id === selected
      || p.state === "playing"
      || this._isPlayerActive(p)
    ));
    const filteredPlayers = options.activeOnly ? visiblePlayers.filter((p) => p.state === "playing") : visiblePlayers;
    if (options.activeOnly && !filteredPlayers.length) return `<div class="notice open">${this._i18n("ui.no_active_players")}</div>`;
    const manualFrontEntityId = this._manualFrontPlayerEntity(players);
    const rankPlayer = (player) => {
      if (player?.entity_id === frontPinnedEntityId) return 0;
      if (player?.entity_id === manualFrontEntityId || player?.entity_id === selected) return 1;
      if (player?.state === "playing") return 2;
      if (this._isPlayerActive(player)) return 3;
      return 4;
    };
    const orderedPlayers = filteredPlayers
      .map((player, index) => ({ player, index }))
      .sort((left, right) => {
        const rankDiff = rankPlayer(left.player) - rankPlayer(right.player);
        return rankDiff || left.index - right.index;
      })
      .map((entry) => entry.player);
    const otherPlayersHtml = orderedPlayers.map((p) => this._playerRowHtml(p, `data-menu-player="${this._esc(p.entity_id)}"`, p.entity_id === selected, { controls: !hotelMode, pin: true })).join("");
    const browserPlayersHtml = browserPlayers
      .filter((player) => !pinnedEntities.size || pinnedEntities.has(player.entity_id))
      .filter((player) => player.entity_id !== rememberedThisDevice?.entity_id)
      .map((p) => this._playerRowHtml(p, `data-menu-player="${this._esc(p.entity_id)}"`, p.entity_id === selected, { controls: !hotelMode, pin: true }))
      .join("");
    return `
      ${options.activeOnly || hotelMode ? "" : this._playersActionHubHtml({
        thisDeviceActionName,
        thisDeviceTitle,
      })}
      ${options.activeOnly || hotelMode ? "" : thisDeviceHtml}
      ${!players.length && !options.activeOnly ? `<div class="notice open">${this._i18n("ui.no_players_found_yet")}</div>` : ""}
      ${otherPlayersHtml ? `<div class="players-premium-grid">${otherPlayersHtml}</div>` : ""}
      ${browserPlayersHtml && !hotelMode ? `<div class="media-section-title">${this._esc(this._i18n("ui.browser_players"))}</div><div class="players-premium-grid">${browserPlayersHtml}</div>` : ""}
    `;
  }

  _transferMenuHtml() {
    if (this._hasPinnedPlayer()) {
      return `<div class="notice open">${this._i18n("ui.transfer_is_unavailable_while_a_pinned_player_is_configured")}</div>`;
    }
    const current = this._getSelectedPlayer();
    const others = (this._state.players || []).filter((p) => HomeiiPlayersFoundation.isPlayerAvailable(p) && p.entity_id !== current?.entity_id);
    if (!others.length) return `<div class="notice open">${this._i18n("ui.no_target_players_available_2")}</div>`;
    return `<div class="players-premium-grid">${others.map((p) => this._playerRowHtml(p, `data-menu-transfer="${this._esc(p.entity_id)}"`, false, { pin: false })).join("")}</div>`;
  }

  _settingsPill(label, value, current, attr = "data-setting-value") {
    return `<button class="settings-pill ${value === current ? "active" : ""}" ${attr}="${this._esc(value)}">${this._esc(label)}</button>`;
  }

  _settingsAccordionWrap(id, title, body) {
    const openSet = this._settingsAccordionOpenSet();
    const isOpen = openSet.has(id);
    const chevron = `<svg class="settings-accordion-chevron" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    return `
      <details class="settings-accordion" data-settings-accordion="${this._esc(id)}"${isOpen ? " open" : ""}>
        <summary class="settings-accordion-summary">
          <span class="settings-accordion-title">${this._esc(title)}</span>
          ${chevron}
        </summary>
        ${body}
      </details>
    `;
  }

  // Mirrors the namespacing pattern from PR #43 (feat/per-card-state-isolation).
  // When that lands, this helper can be replaced with the global _lsKey() it introduces.
  // Cards without card_id keep the unsuffixed key; cards with card_id get a per-card namespace
  // so two HOMEii Flow cards on the same dashboard don't share accordion open/closed state.
  _settingsLsKey(base) {
    const cardId = this._config?.card_id;
    if (!cardId) return base;
    const trimmed = String(cardId).trim();
    return trimmed ? `${base}__${trimmed}` : base;
  }

  _settingsAccordionOpenSet() {
    try {
      const raw = localStorage.getItem(this._settingsLsKey("homeii_music_flow_settings_accordion_open"));
      if (!raw) return new Set();
      const arr = JSON.parse(raw);
      return new Set(Array.isArray(arr) ? arr : []);
    } catch (_) { return new Set(); }
  }

  _persistSettingsAccordionOpen(set) {
    try {
      localStorage.setItem(
        this._settingsLsKey("homeii_music_flow_settings_accordion_open"),
        JSON.stringify(Array.from(set))
      );
    } catch (_) {}
  }

  _settingsMenuHtml() {
    this._loadPlayers();
    return `<div class="settings-shell">
      ${this._settingsAccordionWrap("display", this._i18n("ui.settings_section_display", {}, "Display"), this._settingsSectionDisplay())}
      ${this._settingsAccordionWrap("players_library", this._i18n("ui.settings_section_players_library", {}, "Players & Library"), this._settingsSectionPlayersLibrary())}
      ${this._settingsAccordionWrap("quick_actions_bar", this._i18n("ui.settings_section_quick_actions_bar", {}, "Quick Actions Bar"), this._settingsSectionQuickActionsBar())}
      ${this._settingsAccordionWrap("voice_assistant", this._i18n("ui.settings_section_voice_assistant", {}, "Voice Assistant"), this._settingsSectionVoiceAssistant())}
      ${this._settingsAccordionWrap("smart_home", this._i18n("ui.settings_section_smart_home", {}, "Smart Home"), this._settingsSectionSmartHome())}
      ${this._settingsAccordionWrap("announcements", this._i18n("ui.settings_section_announcements", {}, "Announcements"), this._settingsSectionAnnouncements())}
      ${this._settingsAccordionWrap("music_assistant", this._i18n("ui.settings_section_music_assistant", {}, "Music Assistant"), this._settingsSectionMusicAssistant())}
      <div class="settings-version">Version ${HOMEII_CARD_VERSION}</div>
    </div>`;
  }

  _settingsSectionDisplay() {
    const theme = this._state.cardTheme === "light" || this._state.cardTheme === "custom" ? this._state.cardTheme : "dark";
    const performanceProfile = this._performanceProfile();
    const dynamicThemeMode = this._mobileDynamicThemeMode();
    const backgroundMotionMode = this._mobileBackgroundMotionMode();
    const fontScale = Number(this._state.mobileFontScale || 1).toFixed(2);
    const iconScale = this._mobileIconScale().toFixed(2);
    const mobileLayoutMode = this._mobileLayoutMode();
    const compactMode = !!this._state.mobileCompactMode;
    const compactWidgetMode = this._mobileCompactWidgetMode();
    const showUpNext = this._mobileShowUpNextEnabled();
    const coverFlow = this._mobileCoverFlowEnabled();
    const footerMode = this._mobileFooterMode();
    const micMode = this._mobileMicMode();
    const homeShortcut = this._mobileHomeShortcutEnabled();
    return `
        <div class="settings-group">
          <div class="settings-label">${this._i18n("ui.language")}</div>
          ${this._settingsLanguageSelectHtml()}
        </div>
        <div class="settings-group">
          <div class="settings-label">${this._i18n("ui.theme_2")}</div>
          <div class="settings-pills">
            ${this._settingsPill(this._i18n("ui.dark"), "dark", theme, "data-setting-theme")}
            ${this._settingsPill(this._i18n("ui.light"), "light", theme, "data-setting-theme")}
            ${this._settingsPill(this._i18n("ui.custom"), "custom", theme, "data-setting-theme")}
          </div>
          <div class="settings-label">${this._i18n("ui.performance_profile")}</div>
          <div class="settings-pills performance-profile-pills">
            ${this._settingsPill("Full", "full", performanceProfile, "data-setting-performance-profile")}
            ${this._settingsPill("High", "high", performanceProfile, "data-setting-performance-profile")}
            ${this._settingsPill("Low", "low", performanceProfile, "data-setting-performance-profile")}
            ${this._settingsPill("Ultra Lite", "ultra_lite", performanceProfile, "data-setting-performance-profile")}
          </div>
          <div class="settings-hint">${this._i18n("ui.performance_profile_helper")}</div>
          <div class="settings-label">${this._i18n("ui.dynamic_theme")}</div>
          <div class="settings-pills">
            ${this._settingsPill(this._i18n("ui.off"), "off", dynamicThemeMode, "data-setting-dynamic-theme")}
            ${this._settingsPill("Auto", "auto", dynamicThemeMode, "data-setting-dynamic-theme")}
            ${this._settingsPill(this._i18n("ui.strong"), "strong", dynamicThemeMode, "data-setting-dynamic-theme")}
          </div>
          <div class="settings-hint">${this._i18n("ui.auto_extracts_colors_from_the_current_artwork_and_keeps_the_effect_subtl")}</div>
          <div class="settings-label">${this._i18n("ui.background_motion")}</div>
          <div class="settings-pills">
            ${this._settingsPill(this._i18n("ui.off"), "off", backgroundMotionMode, "data-setting-background-motion")}
            ${this._settingsPill(this._i18n("ui.subtle"), "subtle", backgroundMotionMode, "data-setting-background-motion")}
            ${this._settingsPill(this._i18n("ui.strong"), "strong", backgroundMotionMode, "data-setting-background-motion")}
            ${this._settingsPill(this._i18n("ui.extreme"), "extreme", backgroundMotionMode, "data-setting-background-motion")}
          </div>
          <div class="settings-hint">${this._i18n("ui.adds_motion_to_the_background_layers_subtle_keeps_it_calm_strong_is_noti")}</div>
          <div class="settings-color-wrap">
            <div class="settings-label">${this._i18n("ui.accent_color")}</div>
            <div class="settings-color-row">
              <input class="settings-color-picker" id="mobileCustomColorPicker" type="color" value="${this._esc(this._state.mobileCustomColor || "#f5a623")}">
              <div class="settings-value">${this._esc(String(this._state.mobileCustomColor || "#f5a623").toUpperCase())}</div>
            </div>
          </div>
          <div class="settings-range">
            <div class="settings-label">${this._i18n("ui.font_size")}</div>
            <input id="mobileFontScaleRange" type="range" min="0.5" max="1.5" step="0.05" value="${this._esc(fontScale)}">
            <div class="settings-value">${this._esc(fontScale)}x</div>
          </div>
          <div class="settings-range">
            <div class="settings-label">${this._i18n("ui.icon_size")}</div>
            <input id="mobileIconScaleRange" type="range" min="0.8" max="1.25" step="0.05" value="${this._esc(iconScale)}">
            <div class="settings-value">${this._esc(iconScale)}x</div>
          </div>
          <div class="settings-label">${this._esc(this._i18n("ui.mobile_layout_mode", {}, "Phone layout mode"))}</div>
          <div class="settings-pills">
            ${this._settingsPill("Auto", "auto", mobileLayoutMode, "data-setting-mobile-layout-mode")}
            ${this._settingsPill(this._i18n("ui.full", {}, "Full"), "full", mobileLayoutMode, "data-setting-mobile-layout-mode")}
            ${this._settingsPill(this._i18n("ui.edge_to_edge", {}, "Edge to edge"), "edge_to_edge", mobileLayoutMode, "data-setting-mobile-layout-mode")}
          </div>
          <div class="settings-hint">${this._esc(this._i18n("ui.mobile_layout_mode_helper", {}, "Auto uses the available card space. Full keeps the phone player inline. Edge to edge opens above the dashboard with an X button that returns to Full."))}</div>
          <div class="settings-label">${this._i18n("ui.compact_mode")}</div>
          <div class="settings-pills">
            ${this._settingsPill(this._i18n("ui.enabled"), "on", compactMode ? "on" : "off", "data-setting-compact-mode")}
            ${this._settingsPill(this._i18n("ui.disabled"), "off", compactMode ? "on" : "off", "data-setting-compact-mode")}
          </div>
          <div class="settings-label">${this._i18n("ui.compact_widget_mode")}</div>
          <div class="settings-pills">
            ${this._settingsPill("Auto", "auto", compactWidgetMode, "data-setting-compact-widget-mode")}
            ${this._settingsPill(this._i18n("ui.full"), "full", compactWidgetMode, "data-setting-compact-widget-mode")}
            ${this._settingsPill(this._i18n("ui.mini_widget"), "mini", compactWidgetMode, "data-setting-compact-widget-mode")}
          </div>
          <div class="settings-hint">${this._i18n("ui.choose_when_compact_mode_uses_the_two_row_mobile_widget")}</div>
          <div class="settings-label">${this._i18n("ui.show_up_next")}</div>
          <div class="settings-pills">
            ${this._settingsPill(this._i18n("ui.enabled"), "on", showUpNext ? "on" : "off", "data-setting-show-up-next")}
            ${this._settingsPill(this._i18n("ui.disabled"), "off", showUpNext ? "on" : "off", "data-setting-show-up-next")}
          </div>
          <div class="settings-label">${this._esc(this._i18n("ui.mobile_cover_flow", {}, "Artwork cover flow"))}</div>
          <div class="settings-pills">
            ${this._settingsPill(this._i18n("ui.enabled"), "on", coverFlow ? "on" : "off", "data-setting-cover-flow")}
            ${this._settingsPill(this._i18n("ui.disabled"), "off", coverFlow ? "on" : "off", "data-setting-cover-flow")}
          </div>
          <div class="settings-hint">${this._esc(this._i18n("ui.mobile_cover_flow_helper", {}, "Adds the experimental vertical 3D cover flow to the main artwork area."))}</div>
          <div class="settings-label">${this._i18n("ui.artwork_swipe")}</div>
          <div class="settings-pills">
            ${this._settingsPill(this._i18n("ui.change_song"), "play", this._mobileSwipeMode(), "data-setting-swipe-mode")}
            ${this._settingsPill(this._i18n("ui.browse_covers"), "browse", this._mobileSwipeMode(), "data-setting-swipe-mode")}
          </div>
          <div class="settings-label">${this._i18n("ui.microphone")}</div>
          <div class="settings-pills">
            ${this._settingsPill(this._i18n("ui.on"), "on", micMode, "data-setting-mic-mode")}
            ${this._settingsPill(this._i18n("ui.off_2"), "off", micMode, "data-setting-mic-mode")}
            ${this._settingsPill(this._i18n("ui.smart"), "smart", micMode, "data-setting-mic-mode")}
          </div>
          <div class="settings-label">${this._m("Player design", "עיצוב הנגן")}</div>
          <div class="settings-pills">
            ${this._settingsPill(this._m("Classic", "קלאסי"), "classic", immersivePlayerEnabled(this) ? "immersive" : "classic", "data-setting-player-design")}
            ${this._settingsPill("Immersive", "immersive", immersivePlayerEnabled(this) ? "immersive" : "classic", "data-setting-player-design")}
          </div>
          <div class="settings-label">${this._i18n("ui.footer_style")}</div>
          <div class="settings-pills">
            ${this._settingsPill(this._i18n("ui.icon_only"), "icon", footerMode, "data-setting-footer-mode")}
            ${this._settingsPill(this._i18n("ui.text_only"), "text", footerMode, "data-setting-footer-mode")}
            ${this._settingsPill(this._i18n("ui.icon_and_text"), "both", footerMode, "data-setting-footer-mode")}
          </div>
          <div class="settings-label">${this._i18n("ui.home_shortcut")}</div>
          <div class="settings-pills">
            ${this._settingsPill(this._i18n("ui.enabled"), "on", homeShortcut ? "on" : "off", "data-setting-home-shortcut")}
            ${this._settingsPill(this._i18n("ui.disabled"), "off", homeShortcut ? "on" : "off", "data-setting-home-shortcut")}
          </div>
          <div class="settings-label">${this._i18n("ui.home_path")}</div>
          <input class="media-sort-select settings-select" id="mobileHomeShortcutPathInput" type="text" value="${this._esc(this._mobileHomeShortcutPath())}" placeholder="/lovelace/home" aria-label="${this._esc(this._i18n("ui.home_path"))}">
          <div class="settings-hint">${this._i18n("ui.use_any_home_assistant_path_example_lovelace_home")}</div>
        </div>`;
  }

  _settingsSectionPlayersLibrary() {
    const pinnedPlayers = new Set(this._pinnedPlayerPreferences());
    const excludedPlayers = new Set(this._excludedPlayerPreferences());
    const playerSortMode = this._playerSortMode();
    const playerOrder = this._playerOrderPreferences();
    const optionPlayers = this._pinnedPlayerOptionPlayers([], { includeExcluded: true });
    const playerOptions = optionPlayers
      .map((player) => [player.entity_id, this._playerDisplayName(player, optionPlayers)]);
    const tabOptions = [
      ["library_playlists", this._i18n("ui.playlists")],
      ["library_artists", this._i18n("ui.artists")],
      ["library_albums", this._i18n("ui.albums")],
      ["library_tracks", this._i18n("ui.tracks")],
      ["library_radio", this._i18n("ui.radio")],
      ["library_podcasts", this._i18n("ui.podcasts")],
      ["library_liked", this._i18n("ui.liked")],
      ["library_search", this._i18n("ui.search")],
    ];
    const selectedTabs = new Set(this._mobileLibraryTabs());
    const libraryDefaultLayout = this._defaultMobileMediaLayout();
    const radioSourceMode = this._mobileRadioSourceMode();
    const radioCountry = this._mobileRadioBrowserCountry();
    const radioCountryOptions = this._radioBrowserCountryOptions();
    return `
        <div class="settings-group">
          <div class="settings-label">${this._i18n("ui.pinned_players")}</div>
          <div class="settings-check-grid">
            ${playerOptions.length ? playerOptions.map(([value, label]) => `
              <label class="settings-check-pill">
                <input type="checkbox" data-setting-pinned-player="${this._esc(value)}" ${pinnedPlayers.has(value) ? "checked" : ""}>
                <span>${this._esc(label)}</span>
              </label>`).join("") : `<div class="settings-hint">${this._i18n("ui.no_music_assistant_players_were_found_for_pinning")}</div>`}
          </div>
          <div class="settings-hint">${this._i18n("ui.only_music_assistant_players_are_shown_here_browser_and_local_sendspin_p")}</div>
          <div class="settings-label">${this._i18n("ui.excluded_players")}</div>
          <div class="settings-check-grid">
            ${playerOptions.length ? playerOptions.map(([value, label]) => `
              <label class="settings-check-pill">
                <input type="checkbox" data-setting-excluded-player="${this._esc(value)}" ${excludedPlayers.has(value) ? "checked" : ""}>
                <span>${this._esc(label)}</span>
              </label>`).join("") : `<div class="settings-hint">${this._i18n("ui.no_music_assistant_players_were_found_for_pinning")}</div>`}
          </div>
          <div class="settings-hint">${this._i18n("ui.choose_music_assistant_players_to_hide_from_the_card")}</div>
          <div class="settings-label">${this._i18n("ui.player_sort")}</div>
          <select class="media-sort-select settings-select" id="playerSortModeSelect" aria-label="${this._esc(this._i18n("ui.player_sort"))}">
            <option value="default" ${playerSortMode === "default" ? "selected" : ""}>${this._esc(this._i18n("ui.default_order"))}</option>
            <option value="alphabetical" ${playerSortMode === "alphabetical" ? "selected" : ""}>${this._esc(this._i18n("ui.alphabetical"))}</option>
            <option value="custom" ${playerSortMode === "custom" ? "selected" : ""}>${this._esc(this._i18n("ui.custom_order"))}</option>
          </select>
          ${playerSortMode === "custom" ? `
            <div class="settings-check-grid quick-actions-grid">
              ${playerOptions.map(([value, label]) => {
                const selectedIndex = playerOrder.includes(value) ? playerOrder.indexOf(value) : playerOrder.length + playerOptions.findIndex(([candidate]) => candidate === value);
                return `
                  <div class="settings-check-pill quick-action-pill">
                    <span>${this._esc(label)}</span>
                    <span class="quick-action-order-controls">
                      <button type="button" class="quick-action-order-btn" data-setting-player-order-move="${this._esc(value)}" data-direction="-1" title="${this._esc(this._i18n("ui.move_up"))}" ${selectedIndex <= 0 ? "disabled" : ""}>${this._iconSvg("up")}</button>
                      <button type="button" class="quick-action-order-btn" data-setting-player-order-move="${this._esc(value)}" data-direction="1" title="${this._esc(this._i18n("ui.move_down"))}" ${selectedIndex >= playerOptions.length - 1 ? "disabled" : ""}>${this._iconSvg("down")}</button>
                    </span>
                  </div>`;
              }).join("")}
            </div>
          ` : ``}
        </div>
        <div class="settings-group">
          <div class="settings-label">${this._i18n("ui.library_pages")}</div>
          <div class="settings-pills">
            ${this._settingsPill(this._i18n("ui.grid"), "grid", libraryDefaultLayout, "data-setting-library-default-layout")}
            ${this._settingsPill(this._i18n("ui.list"), "list", libraryDefaultLayout, "data-setting-library-default-layout")}
          </div>
          <div class="settings-hint">${this._i18n("ui.choose_how_library_pages_open_grid_or_list_can_still_be_changed_manually", {}, this._m("Choose how library pages open. You can still switch Grid/List inside the library.", "בחר איך דפי הספרייה נפתחים. עדיין אפשר להחליף Grid/List בתוך הספרייה."))}</div>
          <div class="settings-check-grid">
            ${tabOptions.map(([value, label]) => `
              <label class="settings-check-pill">
                <input type="checkbox" data-setting-library-tab="${this._esc(value)}" ${selectedTabs.has(value) ? "checked" : ""}>
                <span>${this._esc(label)}</span>
              </label>`).join("")}
          </div>
          <div class="settings-label">${this._esc(this._i18n("ui.radio_source", {}, "Radio source"))}</div>
          <select class="media-sort-select settings-select" id="mobileRadioSourceModeSelect" aria-label="${this._esc(this._i18n("ui.radio_source", {}, "Radio source"))}">
            <option value="combined" ${radioSourceMode === "combined" ? "selected" : ""}>${this._esc(this._m("Combined", "משולב"))}</option>
            <option value="ma_first" ${radioSourceMode === "ma_first" ? "selected" : ""}>${this._esc(this._m("Music Assistant first", "Music Assistant ראשון"))}</option>
            <option value="ma_only" ${radioSourceMode === "ma_only" ? "selected" : ""}>${this._esc(this._m("Music Assistant only", "Music Assistant בלבד"))}</option>
            <option value="radiobrowser_only" ${radioSourceMode === "radiobrowser_only" ? "selected" : ""}>${this._esc(this._m("RadioBrowser only", "RadioBrowser בלבד"))}</option>
          </select>
          <div class="settings-hint">${this._esc(this._m("Controls whether the Radio library page uses Music Assistant stations, RadioBrowser stations, or both.", "קובע אם דף הרדיו משתמש בתחנות Music Assistant, בתחנות RadioBrowser, או בשניהם."))}</div>
          <div class="settings-label">Radio Browser</div>
          <select class="media-sort-select settings-select" id="mobileRadioCountrySelect" aria-label="${this._esc(this._i18n("ui.radio_browser_country"))}">
            ${radioCountryOptions.map(([value, label]) => `<option value="${this._esc(value)}" ${value === radioCountry ? "selected" : ""}>${this._esc(label)}</option>`).join("")}
          </select>
          <div class="settings-hint">${this._i18n("ui.choose_a_country_or_all_countries_to_browse_every_country_inside_the_rad")}</div>
        </div>`;
  }

  _settingsSectionQuickActionsBar() {
    const quickActionOptions = this._mobileQuickActionOptions();
    const quickActions = this._mobileQuickActions();
    const selectedQuickActions = new Set(quickActions);
    const mainBarOptions = [
      ["search", this._i18n("ui.search")],
      ["library", this._i18n("ui.library")],
      ["players", this._i18n("ui.players")],
      ["actions", this._i18n("ui.actions_2")],
      ["settings", this._i18n("ui.settings")],
      ["theme", this._i18n("ui.theme_toggle")],
    ];
    const visibleMainBarOptions = mainBarOptions;
    const selectedMainBar = new Set(this._mobileMainBarItems());
    const showStudioMainBarOption = this._controlRoomEnabled();
    const studioShortcut = this._mobileStudioShortcutEnabled();
    const settingsMainBarLocked = !this._usesVisualSettings();
    const volumeMode = this._mobileVolumeMode();
    const volumeStepButtonsEnabled = this._mobileVolumeStepButtonsEnabled();
    const volumeStepPercent = this._mobileVolumeStepPercent();
    const likedMode = this._useMaLikedMode() ? "ma" : "local";
    return `
        <div class="settings-group quick-actions-settings-card">
          <div class="settings-label">${this._i18n("ui.quick_actions")}</div>
          <div class="settings-check-grid quick-actions-grid">
            ${quickActionOptions.map(({ value, label, icon, tone }) => {
              const selectedIndex = quickActions.indexOf(value);
              const selected = selectedIndex >= 0;
              return `
              <div class="settings-check-pill quick-action-pill ${tone === "danger" ? "danger" : ""}">
                <input type="checkbox" data-setting-quick-action="${this._esc(value)}" ${selectedQuickActions.has(value) ? "checked" : ""}>
                <span class="quick-action-setting-icon">${this._iconSvg(icon)}</span>
                <span class="quick-action-pill-label">${this._esc(label)}</span>
                ${selected ? `
                  <span class="quick-action-order-controls">
                    <button type="button" class="quick-action-order-btn" data-setting-quick-action-move="${this._esc(value)}" data-direction="-1" title="${this._esc(this._i18n("ui.move_up"))}" ${selectedIndex <= 0 ? "disabled" : ""}>${this._iconSvg("up")}</button>
                    <button type="button" class="quick-action-order-btn" data-setting-quick-action-move="${this._esc(value)}" data-direction="1" title="${this._esc(this._i18n("ui.move_down"))}" ${selectedIndex >= quickActions.length - 1 ? "disabled" : ""}>${this._iconSvg("down")}</button>
                  </span>
                ` : ``}
              </div>`;
            }).join("")}
          </div>
          <div class="settings-hint">${this._i18n("ui.choose_the_small_buttons_shown_under_the_song_title_timer_appears_first")}</div>
        </div>
        <div class="settings-group">
          <div class="settings-label">${this._i18n("ui.main_bar_items")}</div>
          <div class="settings-check-grid">
            ${showStudioMainBarOption ? `
              <label class="settings-check-pill">
                <input type="checkbox" data-setting-studio-shortcut ${studioShortcut ? "checked" : ""}>
                <span>${this._esc(this._controlRoomLabel())}</span>
              </label>
            ` : ``}
            ${visibleMainBarOptions.map(([value, label]) => {
              const locked = settingsMainBarLocked && value === "settings";
              return `
              <label class="settings-check-pill ${locked ? "is-locked" : ""}">
                <input type="checkbox" data-setting-main-bar-item="${this._esc(value)}" ${selectedMainBar.has(value) || locked ? "checked" : ""} ${locked ? "disabled" : ""}>
                <span>${this._esc(label)}</span>
                ${locked ? `<span class="settings-fixed-badge">${this._esc(this._i18n("ui.fixed"))}</span>` : ""}
              </label>`;
            }).join("")}
          </div>
          <div class="settings-label">${this._i18n("ui.volume_control_large_screen_only")}</div>
          <div class="settings-pills">
            ${this._settingsPill(this._i18n("ui.always_visible"), "always", volumeMode, "data-setting-volume-mode")}
            ${this._settingsPill(this._i18n("ui.button"), "button", volumeMode, "data-setting-volume-mode")}
          </div>
          <div class="settings-label">${this._i18n("ui.volume_step_buttons")}</div>
          <div class="settings-pills">
            ${this._settingsPill(this._i18n("ui.enabled"), "on", volumeStepButtonsEnabled ? "on" : "off", "data-setting-volume-step-buttons")}
            ${this._settingsPill(this._i18n("ui.disabled"), "off", volumeStepButtonsEnabled ? "on" : "off", "data-setting-volume-step-buttons")}
          </div>
          <div class="settings-range">
            <div class="settings-label">${this._i18n("ui.volume_step_percent")}</div>
            <input id="mobileVolumeStepRange" type="range" min="1" max="10" step="1" value="${this._esc(String(volumeStepPercent))}">
            <div class="settings-value">${this._esc(String(volumeStepPercent))}%</div>
          </div>
          <div class="settings-label">${this._i18n("ui.liked_sync")}</div>
          <div class="settings-pills">
            ${this._settingsPill("Music Assistant", "ma", likedMode, "data-setting-liked-mode")}
          </div>
        </div>`;
  }

  _settingsSectionVoiceAssistant() {
    const voiceAssistantEnabled = this._voiceAssistantEnabled();
    const voiceAssistantMode = this._voiceAssistantMode();
    const voiceAssistantSpeakFeedback = this._voiceAssistantSpeakFeedbackEnabled();
    const voiceAssistantAgentOptions = this._voiceAssistantAgentOptions();
    return `
        <div class="settings-group voice-assistant-settings-card">
          <div class="settings-label">${this._flowAssistantLabel()}</div>
          <div class="settings-pills">
            ${this._settingsPill(this._i18n("ui.enabled"), "on", voiceAssistantEnabled ? "on" : "off", "data-setting-voice-assistant")}
            ${this._settingsPill(this._i18n("ui.disabled"), "off", voiceAssistantEnabled ? "on" : "off", "data-setting-voice-assistant")}
          </div>
          <div class="settings-label">${this._i18n("ui.voice_assistant_mode")}</div>
          <div class="settings-pills">
            ${this._settingsPill(this._i18n("ui.hybrid_music_plus_assist"), "hybrid", voiceAssistantMode, "data-setting-voice-assistant-mode")}
            ${this._settingsPill(this._i18n("ui.music_only"), "music", voiceAssistantMode, "data-setting-voice-assistant-mode")}
            ${this._settingsPill(this._i18n("ui.assist_only"), "assist", voiceAssistantMode, "data-setting-voice-assistant-mode")}
          </div>
          <div class="settings-hint">${this._i18n("ui.hybrid_handles_music_locally_and_sends_unknown_commands_to_assist")}</div>
          <div class="settings-label">${this._i18n("ui.assist_agent")}</div>
          <select class="media-sort-select settings-select" id="voiceAssistantAgentSelect" aria-label="${this._esc(this._i18n("ui.assist_agent"))}">
            ${voiceAssistantAgentOptions.map((option) => `
              <option value="${this._esc(option.value)}" ${option.value === this._voiceAssistantAgentId() ? "selected" : ""}>${this._esc(option.label)}</option>
            `).join("")}
          </select>
          <div class="settings-hint">${this._i18n("ui.optional_assist_agent_leave_empty_for_home_assistant_default")}</div>
          <div class="settings-label">${this._i18n("ui.voice_feedback")}</div>
          <div class="settings-pills">
            ${this._settingsPill(this._i18n("ui.enabled"), "on", voiceAssistantSpeakFeedback ? "on" : "off", "data-setting-voice-feedback")}
            ${this._settingsPill(this._i18n("ui.disabled"), "off", voiceAssistantSpeakFeedback ? "on" : "off", "data-setting-voice-feedback")}
          </div>
          <div class="settings-hint">${this._i18n("ui.speak_voice_assistant_responses_out_loud")}</div>
        </div>`;
  }

  _settingsSectionSmartHome() {
    const ambientEntitiesText = this._ambientLightEntities().join(", ");
    const ambientPlayerMapText = this._ambientLightPlayerMap().join("\n");
    const screensaverAutoLyrics = this._screensaverAutoLyricsWhenPlaying();
    const powerButtonAction = this._powerButtonAction();
    const auxiliaryButtonConfigs = this._auxiliaryButtonConfigs();
    const auxiliaryIconOptions = [
      ["power", this._i18n("ui.power")],
      ["home", this._i18n("ui.home")],
      ["speaker", this._i18n("ui.players")],
      ["music_note", this._i18n("ui.music")],
      ["wand", this._i18n("ui.surprise_me")],
      ["grid", this._i18n("ui.actions_2")],
      ["settings", this._i18n("ui.settings")],
      ["heart_outline", this._i18n("ui.like_2")],
      ["play", this._i18n("ui.play")],
      ["stop", this._i18n("ui.stop_all")],
      ["radio", this._i18n("ui.radio")],
      ["timer", this._i18n("ui.timer")],
      ["info", this._i18n("ui.info")],
    ];
    auxiliaryButtonConfigs.forEach((button) => {
      const icon = String(button?.icon || "").trim();
      if (icon && !auxiliaryIconOptions.some(([value]) => value === icon)) auxiliaryIconOptions.unshift([icon, icon]);
    });
    return `
        <div class="settings-group smart-home-settings-card">
          <div class="settings-label">${this._i18n("ui.smart_home")}</div>
          <div class="settings-label">${this._i18n("ui.screensaver", {}, "Screensaver")}</div>
          <div class="settings-pills">
            ${this._settingsPill(this._i18n("ui.enabled"), "on", this._state.screensaverEnabled ? "on" : "off", "data-setting-screensaver")}
            ${this._settingsPill(this._i18n("ui.disabled"), "off", this._state.screensaverEnabled ? "on" : "off", "data-setting-screensaver")}
          </div>
          <div class="settings-label">${this._esc(this._i18n("ui.lyrics_while_playing", {}, "Lyrics while playing"))}</div>
          <div class="settings-pills">
            ${this._settingsPill(this._i18n("ui.enabled"), "on", screensaverAutoLyrics ? "on" : "off", "data-setting-screensaver-auto-lyrics")}
            ${this._settingsPill(this._i18n("ui.disabled"), "off", screensaverAutoLyrics ? "on" : "off", "data-setting-screensaver-auto-lyrics")}
          </div>
          <div class="settings-hint">${this._esc(this._i18n("ui.screensaver_lyrics_while_playing_helper", {}, "When enabled, the screensaver opens directly in lyrics mode while music is playing, and stays in clock mode when idle."))}</div>
          <div class="settings-label">${this._i18n("ui.ambient_light")}</div>
          <div class="settings-pills">
            ${this._settingsPill(this._i18n("ui.enabled"), "on", this._ambientLightEnabled() ? "on" : "off", "data-setting-ambient-light")}
            ${this._settingsPill(this._i18n("ui.disabled"), "off", this._ambientLightEnabled() ? "on" : "off", "data-setting-ambient-light")}
          </div>
          <input class="settings-text-input" id="ambientLightEntitiesInput" type="text" value="${this._esc(ambientEntitiesText)}" placeholder="light.living_room, light.tv">
          <div class="settings-hint">${this._i18n("ui.choose_only_the_lights_that_should_follow_the_music")}</div>
          <div class="settings-label">${this._i18n("ui.ambient_light_player_map")}</div>
          <textarea class="settings-text-input ambient-map-input" id="ambientLightPlayerMapInput" rows="3" placeholder="media_player.kitchen = light.kitchen">${this._esc(ambientPlayerMapText)}</textarea>
          <div class="settings-hint">${this._i18n("ui.ambient_light_player_map_helper")}</div>
          <div class="settings-range">
            <div class="settings-label">${this._i18n("ui.ambient_light_brightness")}</div>
            <input id="ambientLightBrightnessInput" type="range" min="1" max="100" step="1" value="${this._esc(String(this._ambientLightBrightness()))}">
            <div class="settings-value">${this._esc(String(Math.round(this._ambientLightBrightness())))}%</div>
          </div>
          <div class="scheduled-start-grid two-col">
            <label class="scheduled-start-field" for="ambientLightTransitionInput">
              <span class="settings-label">${this._i18n("ui.ambient_light_transition")}</span>
              <input class="media-sort-select settings-select" id="ambientLightTransitionInput" type="number" min="0" max="120" step="1" value="${this._esc(String(this._ambientLightTransition()))}">
            </label>
            <label class="scheduled-start-field" for="ambientLightCooldownInput">
              <span class="settings-label">${this._i18n("ui.ambient_light_cooldown")}</span>
              <input class="media-sort-select settings-select" id="ambientLightCooldownInput" type="number" min="0" max="120" step="1" value="${this._esc(String(this._ambientLightCooldown()))}">
            </label>
          </div>
          <div class="settings-label">${this._i18n("ui.auxiliary_buttons")}</div>
          <div class="settings-pills">
            ${this._settingsPill(this._i18n("ui.enabled"), "on", this._powerButtonEnabled() ? "on" : "off", "data-setting-power-button")}
            ${this._settingsPill(this._i18n("ui.disabled"), "off", this._powerButtonEnabled() ? "on" : "off", "data-setting-power-button")}
          </div>
          <input class="settings-text-input" id="powerButtonNameInput" type="text" value="${this._esc(this._state.powerButtonName || "")}" placeholder="${this._esc(this._i18n("ui.auxiliary_button"))}">
          <select class="media-sort-select settings-select" id="powerButtonIconSelect" aria-label="${this._esc(this._i18n("ui.auxiliary_button_icon"))}">
            ${auxiliaryIconOptions.map(([value, label]) => `<option value="${this._esc(value)}" ${value === this._powerButtonIcon() ? "selected" : ""}>${this._esc(label)}</option>`).join("")}
          </select>
          <select class="media-sort-select settings-select" id="powerButtonActionSelect" aria-label="${this._esc(this._i18n("ui.power_button_action"))}">
            <option value="stop_player" ${powerButtonAction === "stop_player" ? "selected" : ""}>${this._esc(this._i18n("ui.stop_player"))}</option>
            <option value="toggle" ${powerButtonAction === "toggle" ? "selected" : ""}>${this._esc(this._i18n("ui.toggle"))}</option>
            <option value="turn_on" ${powerButtonAction === "turn_on" ? "selected" : ""}>${this._esc(this._i18n("ui.turn_on"))}</option>
            <option value="turn_off" ${powerButtonAction === "turn_off" ? "selected" : ""}>${this._esc(this._i18n("ui.turn_off"))}</option>
            <option value="scene" ${powerButtonAction === "scene" ? "selected" : ""}>${this._esc(this._i18n("ui.scene"))}</option>
            <option value="script" ${powerButtonAction === "script" ? "selected" : ""}>${this._esc(this._i18n("ui.script"))}</option>
          </select>
          <input class="settings-text-input" id="powerButtonEntityInput" type="text" value="${this._esc(this._powerButtonEntity())}" placeholder="script.movie_time">
          ${auxiliaryButtonConfigs.slice(1).map((button, offset) => {
            const index = offset + 2;
            const action = HomeiiMobileSettingsFoundation.normalizePowerButtonAction(button.action);
            const icon = HomeiiMobileSettingsFoundation.normalizeAuxiliaryButtonIcon(button.icon || "power");
            return `
              <div class="settings-label">${this._esc(`${this._i18n("ui.auxiliary_button")} ${index}`)}</div>
              <div class="settings-pills">
                <button class="settings-pill ${button.enabled ? "active" : ""}" data-setting-aux-button="${this._esc(index)}" data-setting-aux-button-enabled="on">${this._esc(this._i18n("ui.enabled"))}</button>
                <button class="settings-pill ${!button.enabled ? "active" : ""}" data-setting-aux-button="${this._esc(index)}" data-setting-aux-button-enabled="off">${this._esc(this._i18n("ui.disabled"))}</button>
              </div>
              <input class="settings-text-input" id="auxButtonNameInput${index}" data-aux-button-name="${index}" type="text" value="${this._esc(button.name || "")}" placeholder="${this._esc(this._i18n("ui.auxiliary_button"))}">
              <select class="media-sort-select settings-select" id="auxButtonIconSelect${index}" data-aux-button-icon="${index}" aria-label="${this._esc(this._i18n("ui.auxiliary_button_icon"))}">
                ${auxiliaryIconOptions.map(([value, label]) => `<option value="${this._esc(value)}" ${value === icon ? "selected" : ""}>${this._esc(label)}</option>`).join("")}
              </select>
              <select class="media-sort-select settings-select" id="auxButtonActionSelect${index}" data-aux-button-action="${index}" aria-label="${this._esc(this._i18n("ui.auxiliary_button_action"))}">
                <option value="stop_player" ${action === "stop_player" ? "selected" : ""}>${this._esc(this._i18n("ui.stop_player"))}</option>
                <option value="toggle" ${action === "toggle" ? "selected" : ""}>${this._esc(this._i18n("ui.toggle"))}</option>
                <option value="turn_on" ${action === "turn_on" ? "selected" : ""}>${this._esc(this._i18n("ui.turn_on"))}</option>
                <option value="turn_off" ${action === "turn_off" ? "selected" : ""}>${this._esc(this._i18n("ui.turn_off"))}</option>
                <option value="scene" ${action === "scene" ? "selected" : ""}>${this._esc(this._i18n("ui.scene"))}</option>
                <option value="script" ${action === "script" ? "selected" : ""}>${this._esc(this._i18n("ui.script"))}</option>
              </select>
              <input class="settings-text-input" id="auxButtonEntityInput${index}" data-aux-button-entity="${index}" type="text" value="${this._esc(button.entity || "")}" placeholder="script.movie_time">
            `;
          }).join("")}
          <div class="settings-label">${this._i18n("ui.discovery_mode")}</div>
          <div class="settings-pills">
            ${this._settingsPill(this._i18n("ui.enabled"), "on", this._discoveryModeEnabled() ? "on" : "off", "data-setting-discovery-mode")}
            ${this._settingsPill(this._i18n("ui.disabled"), "off", this._discoveryModeEnabled() ? "on" : "off", "data-setting-discovery-mode")}
          </div>
        </div>`;
  }

  _settingsSectionAnnouncements() {
    const presets = Array.isArray(this._state.mobileAnnouncementPresets)
      ? this._state.mobileAnnouncementPresets.slice(0, 3)
      : this._defaultAnnouncementPresets().slice(0, 3);
    while (presets.length < 3) presets.push("");
    const announcementVolume = this._announcementVolumePct();
    const ttsEntity = this._announcementTtsEntity();
    const announcementLanguage = this._announcementLanguageSetting();
    const languageOptions = this._announcementLanguageOptions();
    return `
        <div class="settings-group announcement-settings-card">
          <div class="settings-label">${this._esc(this._i18n("ui.announcement_presets"))}</div>
          <div class="scheduled-start-grid two-col">
            ${presets.map((preset, index) => `
              <label class="scheduled-start-field">
                <span class="settings-label">${this._esc(`${this._i18n("ui.announcement")} ${index + 1}`)}</span>
                <input class="settings-text-input" data-announcement-preset-index="${this._esc(String(index))}" type="text" value="${this._esc(preset)}" placeholder="${this._esc(this._i18n("ui.type_an_announcement"))}">
              </label>
            `).join("")}
          </div>
          <div class="settings-hint">${this._esc(this._i18n("ui.configure_ready_made_announcement_phrases"))}</div>
          <div class="settings-range announcement-volume-field">
            <div class="settings-label">${this._esc(this._i18n("ui.announcement_volume_boost"))}</div>
            <input id="mobileAnnouncementVolumeInput" type="range" min="20" max="50" step="1" value="${this._esc(String(announcementVolume))}">
            <div class="settings-value">+${this._esc(String(announcementVolume))}%</div>
          </div>
          <div class="settings-label">${this._esc(this._i18n("ui.tts_entity"))}</div>
          <input class="settings-text-input" id="mobileAnnouncementTtsEntity" type="text" value="${this._esc(ttsEntity)}" placeholder="tts.home_assistant_cloud">
          <div class="settings-hint">${this._esc(this._i18n("ui.tts_entity_used_by_the_announcement_screen"))}</div>
          <div class="settings-label">${this._esc(this._i18n("ui.announcement_language"))}</div>
          <select class="media-sort-select settings-select" id="mobileAnnouncementTtsLanguageSelect" aria-label="${this._esc(this._i18n("ui.announcement_language"))}">
            ${languageOptions.map(([value, label]) => `<option value="${this._esc(value)}" ${value === announcementLanguage ? "selected" : ""}>${this._esc(label)}</option>`).join("")}
          </select>
          <div class="settings-hint">${this._esc(this._i18n("ui.auto_leaves_home_assistant_cloud_voice_defaults_untouched_manual_choices"))}</div>
        </div>`;
  }

  _settingsRangeHtml(id, label, value, min, max, step = 1, suffix = "") {
    const number = Number(value);
    const safeValue = Number.isFinite(number) ? number : Number(min || 0);
    return `
          <div class="settings-range">
            <div class="settings-label">${this._esc(label)}</div>
            <input id="${this._esc(id)}" type="range" min="${this._esc(String(min))}" max="${this._esc(String(max))}" step="${this._esc(String(step))}" value="${this._esc(String(safeValue))}">
            <div class="settings-value">${this._esc(`${safeValue.toFixed(step < 1 ? 2 : 0)}${suffix}`)}</div>
          </div>`;
  }

  _settingsSectionMusicAssistant() {
    return `
        <div class="settings-group">
          <div class="settings-label">Music Assistant</div>
          <div class="settings-actions">
            <button class="settings-pill active" data-menu-action="open_app">${this._i18n("ui.open_full_interface")}</button>
            <button class="settings-pill" data-menu-nav="diagnostics">${this._esc(this._m("Diagnostics", "אבחון"))}</button>
          </div>
        </div>`;
  }

  _diagnosticStatusLabel(status = "info") {
    const normalized = String(status || "info").toLowerCase();
    if (normalized === "ok") return "OK";
    if (normalized === "fail") return "X";
    if (normalized === "warn") return "!";
    return "i";
  }

  _diagnosticItem(status, title, detail = "", value = "") {
    return {
      status: ["ok", "fail", "warn", "info"].includes(String(status || "").toLowerCase()) ? String(status).toLowerCase() : "info",
      title: String(title || "").trim(),
      detail: String(detail || "").trim(),
      value: String(value || "").trim(),
    };
  }

  async _diagnosticProbeArtworkLoad(url = "") {
    const normalized = String(url || "").trim();
    if (!normalized) return { ok: false, skipped: true, reason: "No artwork URL was available." };
    const ImageCtor = typeof Image !== "undefined" ? Image : (typeof window !== "undefined" ? window.Image : null);
    if (typeof ImageCtor !== "function") {
      return { ok: false, skipped: true, reason: "The browser Image API is not available in this context." };
    }
    const probeImage = (src) => new Promise((resolve) => {
      let settled = false;
      let timeout = null;
      const finish = (ok, reason = "", img = null) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        if (img) {
          img.onload = null;
          img.onerror = null;
        }
        resolve({
          ok,
          skipped: false,
          reason,
          width: Number(img?.naturalWidth || 0) || 0,
          height: Number(img?.naturalHeight || 0) || 0,
        });
      };
      try {
        const img = new ImageCtor();
        img.decoding = "async";
        img.loading = "eager";
        img.onload = () => finish(true, "", img);
        img.onerror = () => finish(false, "Browser image load failed.", img);
        timeout = setTimeout(() => finish(false, "Timed out while loading artwork.", img), 4500);
        img.src = src;
        if (img.complete && img.naturalWidth > 0) finish(true, "", img);
      } catch (error) {
        finish(false, error?.message || "Browser image load failed.");
      }
    });
    const direct = await probeImage(normalized);
    if (direct.ok || direct.skipped) return direct;
    const isCrossOrigin = (() => {
      try {
        const currentOrigin = typeof window !== "undefined" ? window.location?.origin : "";
        const parsed = new URL(normalized, typeof window !== "undefined" ? window.location?.href : "http://homeii.local");
        return !!(currentOrigin && parsed.origin && parsed.origin !== currentOrigin);
      } catch (_) {
        return false;
      }
    })();
    if (!this._shouldFetchArtworkUrl?.(normalized, { crossOrigin: isCrossOrigin })) return direct;
    try {
      const objectUrl = await this._fetchArtworkBlobUrl(normalized, { crossOrigin: isCrossOrigin, cache: "no-store", timeoutMs: 6500 });
      if (!objectUrl || objectUrl === normalized) return direct;
      const fetched = await probeImage(objectUrl);
      if (fetched.ok) {
        return {
          ...fetched,
          reason: `Direct image load failed (${direct.reason || "unknown"}), but authenticated artwork fetch succeeded.`,
        };
      }
      return {
        ...direct,
        reason: `${direct.reason || "Browser image load failed."} Authenticated artwork fetch also failed to render (${fetched.reason || "unknown"}).`,
      };
    } catch (error) {
      return {
        ...direct,
        reason: `${direct.reason || "Browser image load failed."} Authenticated artwork fetch also failed (${error?.message || "unknown"}).`,
      };
    }
  }

  _diagnosticRenderedArtworkRows(add) {
    const root = this.shadowRoot;
    if (!root?.querySelectorAll) {
      add("info", "Rendered artwork DOM", "Skipped because the card shadow DOM is not available.");
      return;
    }
    const isArtworkImg = (img) => {
      const src = String(img?.currentSrc || img?.getAttribute?.("src") || "").trim();
      const data = img?.dataset || {};
      if (src.includes("/imageproxy") || src.includes("/api/media_player_proxy/")) return true;
      if (data.homeiiArtSrc || data.homeiiAppliedArtSrc || data.img) return true;
      return !!img?.closest?.(".media-items-list,.queue-list,.queue-panel,.now-art,.np-art,.menu-thumb,.queue-thumb,.art-stack-card,.compact-cover-image");
    };
    const images = Array.from(root.querySelectorAll("img")).filter(isArtworkImg);
    const broken = images.filter((img) => {
      const complete = img.complete === true;
      const naturalWidth = Number(img.naturalWidth || 0);
      const pendingDecoded = img.dataset?.homeiiArtReady === "0";
      return (complete && naturalWidth <= 0) || pendingDecoded;
    });
    const lazyPlaceholders = Array.from(root.querySelectorAll("[data-img]"));
    const fallbackPlaceholders = Array.from(root.querySelectorAll(".media-placeholder,.homeii-art-fallback,.art-stack-fallback,.static-fallback"));
    const menuState = this._state?.menuOpen ? `menu=${this._state.menuPage || "unknown"}` : "menu=closed";
    const detail = `Rendered ${images.length} artwork image(s), ${broken.length} broken/pending image(s), ${lazyPlaceholders.length} lazy placeholder(s), ${fallbackPlaceholders.length} fallback placeholder(s). Run diagnostics while the affected Library/Queue screen is open for the strongest signal.`;
    add(broken.length ? "warn" : "ok", "Rendered artwork DOM", detail, menuState);
  }

  _sanitizeDiagnosticUrl(value = "") {
    const raw = String(value || "").trim();
    if (!raw) return "";
    if (/(https?|wss?):\/\/<[^>]+>/i.test(raw)) {
      return raw.replace(/(token|access_token|auth)=([^&\s]+)/gi, "$1=<redacted>");
    }
    try {
      const baseHref = typeof window !== "undefined" && window.location?.href ? window.location.href : "http://homeii.local";
      const parsed = new URL(raw, baseHref);
      const port = parsed.port ? `:${parsed.port}` : "";
      return `${parsed.protocol}//${this._diagnosticHostPrivacyLabel(parsed.hostname)}${port}${this._diagnosticPathPrivacyLabel(parsed.pathname)}`;
    } catch (_) {
      return raw
        .replace(/(https?|wss?):\/\/[^\s]+/gi, (match) => this._sanitizeDiagnosticUrl(match))
        .replace(/(token|access_token|auth)=([^&\s]+)/gi, "$1=<redacted>");
    }
  }

  _diagnosticHostPrivacyLabel(hostname = "") {
    const host = String(hostname || "").trim().toLowerCase().replace(/^\[|\]$/g, "");
    if (!host) return "<host-redacted>";
    if (host === "localhost") return "<localhost>";
    if (host.endsWith(".ui.nabu.casa")) return "<redacted-nabu-casa>";
    const currentHost = typeof window !== "undefined" ? String(window.location?.hostname || "").toLowerCase() : "";
    if (currentHost && host === currentHost) return "<home-assistant-host>";
    if (this._isPrivateNetworkHost?.(host)) return "<private-host>";
    return "<external-host>";
  }

  _diagnosticPathPrivacyLabel(pathname = "") {
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

  _diagnosticUrlDescription(value = "") {
    const raw = String(value || "").trim();
    if (!raw) return "(empty)";
    try {
      const parsed = new URL(raw, typeof window !== "undefined" ? window.location.href : "http://homeii.local");
      const protocol = parsed.protocol.replace(/:$/, "") || "unknown";
      const hostLabel = this._diagnosticHostPrivacyLabel(parsed.hostname);
      const hostType = hostLabel
        .replace(/[<>]/g, "")
        .replace("redacted-", "");
      const pathLabel = this._diagnosticPathPrivacyLabel(parsed.pathname) || "/";
      return `protocol=${protocol}, host_type=${hostType}, port=${parsed.port || "default"}, path=${pathLabel}`;
    } catch (_) {
      return "invalid or unparseable URL";
    }
  }

  _redactDiagnosticText(text = "") {
    let output = String(text || "").replace(/Bearer\s+[A-Za-z0-9._-]+/g, "Bearer <redacted>");
    [
      this._diagnosticCurrentOrigin(),
      this._maBrowserUrl?.(),
    ].filter(Boolean).forEach((url) => {
      output = output.split(String(url)).join(this._sanitizeDiagnosticUrl(url));
    });
    try {
      const sendspinUrl = this._maBrowserUrl?.() ? this._localSendspinWsUrl?.() : "";
      if (sendspinUrl) output = output.split(sendspinUrl).join(this._sanitizeDiagnosticUrl(sendspinUrl));
    } catch (_) {}
    return output.replace(/(https?|wss?):\/\/[^\s]+/gi, (match) => this._sanitizeDiagnosticUrl(match));
  }

  _diagnosticBrowserSummary() {
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
    const appHints = [];
    if (/Home Assistant|HomeAssistant|io\.homeassistant|HA Companion/i.test(ua)) appHints.push("HA Companion");
    if (/\bwv\b|Android.*Version\/[\d.]+.*Chrome/i.test(ua)) appHints.push("Android WebView");
    if (/iPhone|iPad|iPod/i.test(ua) && /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS/i.test(ua)) appHints.push("iOS WebKit");
    const platform = String(nav?.platform || nav?.userAgentData?.platform || "").trim();
    return [found, platform, ...appHints].filter(Boolean).join(" / ");
  }

  _diagnosticViewportSummary() {
    const win = typeof window !== "undefined" ? window : {};
    const nav = typeof navigator !== "undefined" ? navigator : win.navigator;
    const width = Number(win.innerWidth || this.getBoundingClientRect?.().width || this.offsetWidth || 0);
    const height = Number(win.innerHeight || this.getBoundingClientRect?.().height || this.offsetHeight || 0);
    const dpr = Number(win.devicePixelRatio || 1);
    const touch = Number(nav?.maxTouchPoints || 0);
    const language = String(nav?.language || this._hass?.locale?.language || this._hass?.language || "").trim();
    return `${Math.round(width)}x${Math.round(height)}, DPR ${Number.isFinite(dpr) ? dpr.toFixed(2).replace(/\.00$/, "") : "?"}, touch ${touch}${language ? `, lang ${language}` : ""}`;
  }

  _diagnosticCurrentOrigin() {
    try {
      return typeof window !== "undefined" ? (window.location?.origin || window.location?.href || "") : "";
    } catch (_) {
      return "";
    }
  }

  _diagnosticUrlHasMixedContentRisk(url = "") {
    const raw = String(url || "").trim();
    if (!raw || typeof window === "undefined" || window.location?.protocol !== "https:") return false;
    try {
      return new URL(raw, window.location.href).protocol === "http:";
    } catch (_) {
      return /^http:\/\//i.test(raw);
    }
  }

  _diagnosticAccessDetail(url = "") {
    const raw = String(url || "").trim();
    if (!raw) return "Integration mode: the browser talks to Home Assistant only.";
    try {
      const parsed = new URL(raw, typeof window !== "undefined" ? window.location.href : "http://homeii.local");
      const maLocal = this._isPrivateNetworkHost?.(parsed.hostname);
      const haHost = typeof window !== "undefined" ? String(window.location?.hostname || "") : "";
      const haLocal = this._isPrivateNetworkHost?.(haHost);
      if (maLocal && haHost && !haLocal) {
        return "Music Assistant URL is local/private while Home Assistant looks external. Direct/Sendspin will only work through local network, VPN, or an HTTPS external MA URL.";
      }
      if (maLocal) return "Music Assistant URL is local/private. Direct/Sendspin should work only from the local network or VPN.";
      return "Music Assistant URL looks externally routable from this browser.";
    } catch (_) {
      return "Could not parse Music Assistant URL for local/external access checks.";
    }
  }

  _diagnosticSnapshotCount(snapshot = null) {
    const itemCount = Array.isArray(snapshot?.items) ? snapshot.items.length : 0;
    const stateCount = Number(snapshot?.state?.items ?? snapshot?.state?.items_count ?? snapshot?.items_count);
    if (itemCount) return itemCount;
    return Number.isFinite(stateCount) && stateCount >= 0 ? Math.round(stateCount) : 0;
  }

  _diagnosticPlayerMarkerSummary(player = null, hassEntities = this._hass?.entities || {}) {
    if (!player?.entity_id) return "(none)";
    const attrs = player.attributes || {};
    const registry = hassEntities?.[player.entity_id] || {};
    const markers = [];
    if (attrs.app_id) markers.push(`app_id=${attrs.app_id}`);
    if (attrs.mass_player_type) markers.push(`mass_player_type=${attrs.mass_player_type}`);
    if (attrs.active_queue) markers.push(`active_queue=${attrs.active_queue}`);
    if (attrs.queue_id) markers.push(`queue_id=${attrs.queue_id}`);
    if (registry.platform) markers.push(`registry_platform=${registry.platform}`);
    if (registry.integration) markers.push(`registry_integration=${registry.integration}`);
    if (!markers.length) markers.push("no strict MA markers");
    return markers.join(", ");
  }

  _diagnosticIsStrictMusicAssistantPlayer(player = null, hassEntities = this._hass?.entities || {}) {
    return !!(this._isDirectMaPlayer?.(player) || HomeiiPlayersFoundation.isMusicAssistantPlayer(player, hassEntities?.[player?.entity_id]));
  }

  _diagnosticSearchQuery() {
    const candidates = [
      this._state?.mediaQuery,
      this.$?.("mobileMediaSearchInput")?.value,
      this.$?.("artistDetailSearchInput")?.value,
    ];
    return candidates
      .map((value) => String(value || "").trim())
      .find(Boolean) || "";
  }

  _diagnosticSearchResultCount(results = {}) {
    return ["radio", "podcasts", "albums", "artists", "tracks", "playlists"]
      .reduce((total, group) => total + (Array.isArray(results?.[group]) ? results[group].length : 0), 0);
  }

  _diagnosticSearchResultBreakdown(results = {}) {
    return ["radio", "podcasts", "albums", "artists", "tracks", "playlists"]
      .map((group) => `${group}:${Array.isArray(results?.[group]) ? results[group].length : 0}`)
      .join(", ");
  }

  _diagnosticConfiguredEntityRows(add, selectedPlayer = null, hassStates = this._hass?.states || {}, hassEntities = this._hass?.entities || {}) {
    const configuredEntity = String(this._config?.entity || this.config?.entity || "").trim();
    const urlOverride = this._playerOverrideParamValue?.() || "";
    if (!configuredEntity) {
      add("info", "Configured entity", "No card entity is configured. HOMEii will choose from query-string override, active players, pinned players, remembered player, and visible player order.", "(none)");
      return;
    }
    const configuredPlayer = hassStates?.[configuredEntity] || null;
    if (!configuredPlayer) {
      add("fail", "Configured entity", "The configured entity was not found in Home Assistant states. Check the entity id in YAML or the visual editor.", configuredEntity);
      return;
    }
    const visiblePlayers = Array.isArray(this._state?.players) ? this._state.players : [];
    const visible = visiblePlayers.some((player) => player?.entity_id === configuredEntity);
    const selectedMatches = selectedPlayer?.entity_id === configuredEntity;
    const strictMa = this._diagnosticIsStrictMusicAssistantPlayer(configuredPlayer, hassEntities);
    const fallbackMa = !strictMa && this._isGenericMusicAssistantFallbackPlayer?.(configuredPlayer);
    const excluded = this._isPlayerExcluded?.(configuredPlayer);
    const activeSelected = selectedPlayer && selectedPlayer.entity_id !== configuredEntity && this._isPlayerActive?.(selectedPlayer);
    const configuredName = configuredPlayer.attributes?.friendly_name || configuredEntity;
    const selectedName = selectedPlayer?.attributes?.friendly_name || selectedPlayer?.entity_id || "(none)";
    let status = "ok";
    let detail = "Configured entity exists and is available as the card default player.";
    if (excluded) {
      status = "warn";
      detail = "Configured entity exists, but it is excluded in HOMEii settings.";
    } else if (!strictMa && !fallbackMa) {
      status = "warn";
      detail = "Configured entity exists, but it does not look like a Music Assistant player.";
    } else if (!visible) {
      status = "warn";
      detail = "Configured entity exists, but it is not in the current visible player list. Check pinned/excluded player filters.";
    } else if (urlOverride) {
      status = selectedMatches ? "ok" : "info";
      detail = selectedMatches
        ? "Configured entity is selected even with a query-string override present."
        : "A query-string player override is active, so it can intentionally win over the configured entity.";
    } else if (selectedMatches) {
      detail = "Configured entity is the currently selected player.";
    } else if (activeSelected) {
      status = "info";
      detail = "Another player is currently active, so HOMEii is showing the active player and keeping the configured entity as the fallback default.";
    } else {
      status = "warn";
      detail = "Configured entity exists, but HOMEii selected a different player. This usually means manual/front selection, pinned order, or remembered state is taking priority.";
    }
    add(status, "Configured entity", `${detail} Selected now: ${selectedName}.`, `${configuredName} | ${configuredEntity} | ${this._diagnosticPlayerMarkerSummary(configuredPlayer, hassEntities)}`);
  }

  async _diagnosticSearchRows(add, musicAssistantServices = []) {
    const query = this._diagnosticSearchQuery();
    const hasHaSearch = this._hasService?.("music_assistant", "search") || (Array.isArray(musicAssistantServices) && musicAssistantServices.includes("search"));
    const cacheSize = Number(this._cache?.library?.size || 0);
    add(
      this._state.engineAvailable ? "ok" : "fail",
      "Search providers",
      `Engine search ${this._state.engineAvailable ? "yes" : "no"}; HA search ${hasHaSearch ? "available to Engine" : "not exposed"}; Direct browser search disabled for HOMEii Flow 6; library cache entries ${cacheSize}.`,
      query ? `query="${query}"` : "(no active query)",
    );
    if (!query || query.length < 2) {
      add("info", "Search provider sample", "Open the affected Search screen, run the exact search term, then run diagnostics. HOMEii will measure that active query without guessing.", "skipped");
      return;
    }
    const timedSearch = async (label, searchOptions, timeoutMs) => {
      const started = Date.now();
      const results = await this._withTimeout(
        this._search(query, searchOptions),
        timeoutMs,
        this._timeoutMessage(label),
      );
      return {
        results,
        count: this._diagnosticSearchResultCount(results),
        breakdown: this._diagnosticSearchResultBreakdown(results),
        elapsed: Date.now() - started,
      };
    };
    try {
      const fast = await timedSearch("Music Assistant fast/library search", { fastOnly: true, limit: 12 }, 5200);
      add(
        fast.count ? "ok" : "warn",
        "Search fast/library sample",
        `${fast.count ? "Fast/library search returned results." : "Fast/library search returned no results."} ${fast.breakdown}`,
        `${fast.count} result(s), ${fast.elapsed}ms`,
      );
    } catch (error) {
      add("warn", "Search fast/library sample", error?.message || "Fast/library search failed.", query);
    }
    try {
      const providerTimeout = Math.max(9000, Math.min(22000, Number(this._musicAssistantTimeoutMs?.() || 12000) + 5000));
      const provider = await timedSearch("Music Assistant provider search", { providerOnly: true, limit: 12 }, providerTimeout);
      add(
        provider.count ? "ok" : "warn",
        "Search provider sample",
        `${provider.count ? "Provider search returned results." : "Provider search returned no results for this query. HOMEii should still keep showing library results and should not stop provider search just because library results exist."} ${provider.breakdown}`,
        `${provider.count} result(s), ${provider.elapsed}ms`,
      );
    } catch (error) {
      add("warn", "Search provider sample", `${error?.message || "Provider search failed."} This can be Music Assistant/provider latency, CORS/direct access, or a provider-side empty response.`, query);
    }
  }

  async _diagnosticQueueRows(add, selectedPlayer = null) {
    if (!selectedPlayer) {
      add("fail", "Queue snapshot", "No selected player is available, so queue checks cannot run.");
      return;
    }
    const playerAttrs = selectedPlayer.attributes || {};
    const playerProxyArt = this._bestArtworkUrl([
      playerAttrs.entity_picture_local,
      playerAttrs.entity_picture,
    ], { size: 300 });
    const playerRawArt = this._bestArtworkUrl([
      playerAttrs.current_media?.image_url,
      playerAttrs.currentMedia?.image_url,
      playerAttrs.media_image_url,
      playerAttrs.media_image,
    ], { size: 300 });
    if (playerProxyArt || playerRawArt) {
      const sourceDetail = [
        playerProxyArt ? `HA proxy ${this._sanitizeDiagnosticUrl(playerProxyArt)}` : "HA proxy unavailable",
        playerRawArt ? `MA current_media ${this._sanitizeDiagnosticUrl(playerRawArt)}` : "MA current_media unavailable",
      ].join("; ");
      add("info", "Current artwork sources", "HOMEii now prefers the Home Assistant media-player proxy for the current item and only then tries the raw Music Assistant artwork URL.", sourceDetail);
      if (playerProxyArt) {
        const playerProxyLoad = await this._diagnosticProbeArtworkLoad(playerProxyArt);
        add(
          playerProxyLoad.ok ? "ok" : "warn",
          "Current HA artwork browser load",
          playerProxyLoad.ok
            ? "The signed Home Assistant media-player artwork proxy loaded successfully in this browser."
            : `${playerProxyLoad.reason || "Browser image load failed."} The current player cannot use the Home Assistant artwork fallback from this access path.`,
          this._sanitizeDiagnosticUrl(playerProxyArt),
        );
      }
    } else {
      add("info", "Current artwork sources", "The selected player currently exposes neither a Home Assistant entity_picture nor a raw current_media artwork URL.");
    }
    const queueId = this._queueIdForPlayer?.(selectedPlayer) || this._directMaQueueId?.(selectedPlayer) || "";
    add(queueId ? "ok" : "warn", "Queue identity", queueId ? "Selected player exposes an active queue id." : "Selected player does not expose active_queue/queue_id. Some queue APIs may still infer it from the entity.", queueId || "(none)");
    add("info", "Queue providers", `Engine queue ${this._state.engineAvailable ? "yes" : "no"}; HA get_queue ${this._hasService?.("music_assistant", "get_queue") ? "available to Engine" : "not exposed"}; Direct browser queue disabled for HOMEii Flow 6.`);
    const uiQueueCount = Array.isArray(this._state.queueItems) ? this._state.queueItems.length : 0;
    const uiQueueStateCount = Number(this._state.maQueueState?.items);
    const uiLooksPartial = Number.isFinite(uiQueueStateCount) && uiQueueStateCount > uiQueueCount && uiQueueCount > 0;
    add(
      uiLooksPartial ? "warn" : "info",
      "Queue UI state",
      `Rendered queue items ${uiQueueCount}; queue state reports ${Number.isFinite(uiQueueStateCount) ? uiQueueStateCount : "unknown"} item(s).${uiLooksPartial ? " The rendered queue appears to be a partial window." : ""}`,
      this._state.maQueueState ? "state present" : "state missing",
    );

    const attempts = [];
    const snapshots = [];
    const runAttempt = async (label, fn) => {
      try {
        const snapshot = await fn();
        const count = this._diagnosticSnapshotCount(snapshot);
        const expected = typeof this._queueSnapshotExpectedCount === "function" ? this._queueSnapshotExpectedCount(snapshot) : 0;
        const partial = typeof this._queueSnapshotLooksPartial === "function" ? this._queueSnapshotLooksPartial(snapshot) : false;
        const countLabel = partial && expected > count
          ? `${count}/${expected} item(s), partial window`
          : `${count} item(s)`;
        attempts.push(`${label}: ${snapshot ? countLabel : "no snapshot"}`);
        if (snapshot) snapshots.push({ label, snapshot, count, expected, partial });
      } catch (error) {
        attempts.push(`${label}: ${error?.message || "failed"}`);
      }
    };

    await runAttempt("HOMEii Flow Engine queue", () => this._fetchMusicAssistantQueueSnapshot(selectedPlayer));

    const best = snapshots.sort((left, right) => right.count - left.count)[0];
    const detail = attempts.join("; ") || "No queue providers were available.";
    if (best?.count > 0) {
      const snapshotState = best.snapshot?.state || null;
      const snapshotItems = Array.isArray(best.snapshot?.items) ? best.snapshot.items : [];
      if (snapshotState && snapshotItems.length && typeof this._applyQueueSnapshot === "function") {
        this._applyQueueSnapshot(snapshotState, snapshotItems, true);
      }
      const repairedUiQueueCount = Array.isArray(this._state.queueItems) ? this._state.queueItems.length : 0;
      const mismatch = uiQueueCount === 0 && best.count > 0;
      const repaired = mismatch && repairedUiQueueCount > 0;
      add(
        best.partial ? "warn" : (repaired ? "ok" : (mismatch ? "warn" : "ok")),
        "Queue snapshot",
        best.partial
          ? `${detail}. The Engine returned a partial queue window; the card will keep the best Engine state it has and refresh the queue from Engine again after mutations.`
          : repaired
          ? `${detail}. Diagnostics applied the queue snapshot to the card UI state. Reopen the Queue screen if it was already open.`
          : (mismatch ? `${detail}. API returned queue items while the UI currently has no rendered queue items; refresh/reopen the queue panel and send this report if it remains empty.` : detail),
        `${best.label}: ${best.partial && best.expected > best.count ? `${best.count}/${best.expected}` : best.count}`,
      );
    } else if (best) {
      add("warn", "Queue snapshot", `${detail}. Queue API is reachable but returned no items; this can be normal for an idle/empty queue.`);
    } else {
      const strictPlayer = this._diagnosticIsStrictMusicAssistantPlayer(selectedPlayer);
      add(strictPlayer && !queueId ? "warn" : "fail", "Queue snapshot", strictPlayer && !queueId ? `${detail}. The selected Engine player has no active_queue/queue_id, so the Engine may not be able to resolve its Music Assistant queue.` : detail);
    }

    const queueItems = Array.isArray(best?.snapshot?.items) ? best.snapshot.items : [];
    if (!queueItems.length) {
      add("info", "Queue artwork sample", "Skipped because the selected player's queue returned no items.");
      return;
    }
    const artEntry = queueItems
      .map((item) => ({
        item,
        art: this._queueItemImageUrl?.(item, 300) || this._artUrl(item, { size: 300 }) || this._artUrl(item?.media_item || item, { size: 300 }),
      }))
      .find((entry) => entry.art);
    if (!artEntry) {
      add("warn", "Queue artwork sample", "Queue items were returned, but HOMEii could not infer artwork from the sample window.", `${best.label}: ${queueItems.length} item(s)`);
      return;
    }
    const media = artEntry.item?.media_item || artEntry.item;
    const title = media?.name || artEntry.item?.name || artEntry.item?.media_title || "queue item";
    const mixed = this._diagnosticUrlHasMixedContentRisk(artEntry.art);
    add(mixed ? "warn" : "ok", "Queue artwork sample", mixed ? "Queue artwork resolves to HTTP while the dashboard is HTTPS, so the browser may block it." : "Queue artwork URL was inferred from a selected-player queue item.", `${title} -> ${this._sanitizeDiagnosticUrl(artEntry.art)}`);
    const load = await this._diagnosticProbeArtworkLoad(artEntry.art);
    if (load.skipped) {
      add("info", "Queue artwork browser load", load.reason, `${title} -> ${this._sanitizeDiagnosticUrl(artEntry.art)}`);
    } else {
      add(
        load.ok ? "ok" : "warn",
        "Queue artwork browser load",
        load.ok
          ? "This browser loaded the queue artwork sample as an image."
          : `${load.reason} The artwork URL was inferred, but this browser could not display it from the current access path.`,
        `${title} -> ${this._sanitizeDiagnosticUrl(artEntry.art)}${load.ok && load.width && load.height ? ` (${load.width}x${load.height})` : ""}`,
      );
    }
  }

  async _diagnosticLibraryRows(add, musicAssistantServices = []) {
    if (!this._state.engineAvailable) {
      add("fail", "Library coverage", "Skipped because HOMEii Flow Engine is not available.");
      return;
    }
    add("info", "Library providers", `Engine library yes; HA get_library ${musicAssistantServices.includes("get_library") ? "available to Engine" : "not exposed"}; Direct browser library disabled for HOMEii Flow 6.`);

    const types = ["playlist", "artist", "album", "track", "radio"];
    const results = await Promise.all(types.map(async (type) => {
      try {
        const items = await this._fetchLibrary(type, "sort_name", 3, false);
        return { type, items: Array.isArray(items) ? items : [], error: "" };
      } catch (error) {
        return { type, items: [], error: error?.message || "failed" };
      }
    }));
    const parts = results.map((result) => {
      const artCount = result.items.filter((item) => this._artUrl(item, { size: 160 })).length;
      return `${result.type}:${result.error ? `error(${result.error})` : `${result.items.length} item(s), ${artCount} art`}`;
    });
    const totalItems = results.reduce((sum, result) => sum + result.items.length, 0);
    const failures = results.filter((result) => result.error).length;
    add(totalItems ? "ok" : (failures === results.length ? "fail" : "warn"), "Library coverage", parts.join("; "));

    const sampleResult = results.find((result) => result.items.length);
    const sample = sampleResult?.items?.[0] || null;
    if (!sample) {
      add("warn", "Library artwork sample", "No library item was returned, so artwork URL inference could not be checked.");
      return;
    }
    const art = this._artUrl(sample, { size: 300 });
    const sampleName = sample.name || sample.title || sample.media_item?.name || sampleResult.type;
    if (!art) {
      add("warn", "Library artwork sample", "A library item was returned, but HOMEii could not infer an artwork URL from it.", `${sampleResult.type}: ${sampleName}`);
      return;
    }
    const mixed = this._diagnosticUrlHasMixedContentRisk(art);
    add(mixed ? "warn" : "ok", "Library artwork sample", mixed ? "Artwork resolves to HTTP while the dashboard is HTTPS, so the browser may block it." : "Artwork URL was inferred for a sample library item.", `${sampleResult.type}: ${sampleName} -> ${this._sanitizeDiagnosticUrl(art)}`);
    const load = await this._diagnosticProbeArtworkLoad(art);
    if (load.skipped) {
      add("info", "Library artwork browser load", load.reason, `${sampleResult.type}: ${sampleName} -> ${this._sanitizeDiagnosticUrl(art)}`);
    } else {
      add(
        load.ok ? "ok" : "warn",
        "Library artwork browser load",
        load.ok
          ? "This browser loaded the library artwork sample as an image."
          : `${load.reason} The artwork URL was inferred, but this browser could not display it from the current access path.`,
        `${sampleResult.type}: ${sampleName} -> ${this._sanitizeDiagnosticUrl(art)}${load.ok && load.width && load.height ? ` (${load.width}x${load.height})` : ""}`,
      );
    }
  }

  _diagnosticsSummary(items = this._state.diagnosticsItems || []) {
    const list = Array.isArray(items) ? items : [];
    const failures = list.filter((item) => item.status === "fail").length;
    const warnings = list.filter((item) => item.status === "warn").length;
    if (!list.length) return this._m("Run a quick Music Assistant health check.", "הרץ בדיקת תקינות מהירה ל-Music Assistant.");
    if (failures) return this._m(`${failures} check${failures === 1 ? "" : "s"} need attention.`, `${failures} בדיקות דורשות טיפול.`);
    if (warnings) return this._m(`${warnings} check${warnings === 1 ? "" : "s"} need review.`, `${warnings} בדיקות דורשות בדיקה.`);
    return this._m("All core checks passed.", "כל הבדיקות המרכזיות עברו.");
  }

  _diagnosticRowHtml(item = {}) {
    const status = String(item.status || "info").toLowerCase();
    const icon = status === "ok" ? this._iconSvg("check") : status === "fail" ? this._iconSvg("close") : this._iconSvg("info");
    return `
      <div class="diagnostic-row status-${this._esc(status)}">
        <div class="diagnostic-status" aria-label="${this._esc(this._diagnosticStatusLabel(status))}">${icon}</div>
        <div class="diagnostic-copy">
          <div class="diagnostic-title">${this._esc(item.title || "")}</div>
          ${item.value ? `<div class="diagnostic-value">${this._esc(item.value)}</div>` : ""}
          ${item.detail ? `<div class="diagnostic-detail">${this._esc(item.detail)}</div>` : ""}
        </div>
      </div>`;
  }

  _diagnosticsMenuHtml() {
    const items = Array.isArray(this._state.diagnosticsItems) ? this._state.diagnosticsItems : [];
    const running = this._state.diagnosticsStatus === "running";
    const ranAt = Number(this._state.diagnosticsRunAt || 0);
    const ranAtText = ranAt ? new Date(ranAt).toLocaleString() : "";
    return `
      <div class="settings-shell diagnostics-shell">
        <div class="settings-group diagnostics-card">
          <div class="settings-label">${this._esc(this._m("HOMEii Diagnostics", "אבחון HOMEii"))}</div>
          <div class="settings-hint">${this._esc(this._m("Diagnostic v7 checks HOMEii Flow Engine, browser context, configured entity, player selection, search providers, group state, queue UI/API alignment, authenticated artwork loading, rendered artwork DOM, and Engine cache performance.", "Diagnostic v7 בודק את HOMEii Flow Engine, דפדפן, ישות מוגדרת, בחירת נגן, ספקי חיפוש, מצב קבוצה, התאמת תור UI/API, טעינת עטיפות מאומתת, מצב תמונות ב-DOM וביצועי מטמון Engine."))}</div>
          <div class="settings-actions diagnostics-actions">
            <button class="settings-pill active" data-menu-action="run_diagnostics" ${running ? "disabled" : ""}>${this._esc(running ? this._m("Running...", "מריץ...") : this._m("Run diagnostics", "הרץ אבחון"))}</button>
            <button class="settings-pill" data-menu-action="copy_diagnostics" ${items.length ? "" : "disabled"}>${this._esc(this._m("Copy report", "העתק דוח"))}</button>
          </div>
          <div class="diagnostic-summary">${this._esc(this._diagnosticsSummary(items))}</div>
          ${ranAtText ? `<div class="settings-hint">${this._esc(this._m("Last run", "הרצה אחרונה"))}: ${this._esc(ranAtText)}</div>` : ""}
        </div>
        ${running ? `<div class="notice open">${this._esc(this._m("Running checks...", "מריץ בדיקות..."))}</div>` : ""}
        ${items.length ? `<div class="diagnostics-list">${items.map((item) => this._diagnosticRowHtml(item)).join("")}</div>` : `<div class="notice open">${this._esc(this._m("No diagnostics have been run yet.", "עדיין לא הורץ אבחון."))}</div>`}
      </div>`;
  }

  async _diagnosticEngineRows(add) {
    const mode = this._homeiiEngineMode();
    if (!this._homeiiEngineEnabled()) {
      add("fail", "HOMEii Flow Engine", "HOMEii Flow 6 requires the HOMEii Flow Engine integration. There is no frontend-only compatibility path.", mode);
      return;
    }
    const context = await this._refreshHomeiiEngineContext({ force: true });
    if (context?.available) {
      const capabilitySummary = HomeiiEngineFoundation.summarizeHomeiiEngineCapabilities(context.capabilities);
      const version = context.version || "unknown version";
      add("ok", "HOMEii Flow Engine", `Connected to HOMEii Flow Engine ${version}. Capabilities: ${capabilitySummary}.`, mode);
      add("info", "Engine routing", "Card writes will use the resolved Engine instance/profile unless explicitly overridden in the card config.", `instance=${context.instanceId || "default"}; profile=${context.profileId || "default"}; transport=${this._state.engineLastTransport || "websocket"}`);
      const requiredConnections = context.raw?.required_connections || context.raw?.connections || this._state.engineRequiredConnections;
      if (requiredConnections && typeof requiredConnections === "object") {
        const maConnection = requiredConnections.music_assistant || requiredConnections.connections?.music_assistant || {};
        const queueConnection = requiredConnections.queue_provider || requiredConnections.connections?.queue_provider || {};
        const libraryConnection = requiredConnections.library_provider || requiredConnections.connections?.library_provider || {};
        const searchConnection = requiredConnections.search_provider || requiredConnections.connections?.search_provider || {};
        add(
          requiredConnections.ok ? "ok" : "warn",
          "Engine required connections",
          requiredConnections.summary || (requiredConnections.ok ? "Required connections are ready." : "One or more required connections need attention."),
          requiredConnections.status || "unknown",
        );
        add(
          maConnection.ok ? "ok" : "fail",
          "Engine Music Assistant connection",
          maConnection.message || "Music Assistant connection state was not reported.",
          `${Number(maConnection.music_assistant_player_count || 0)} MA player(s), ${Number(maConnection.service_count || 0)} service(s)`,
        );
        add(queueConnection.ok ? "ok" : "warn", "Engine queue provider", queueConnection.message || "Queue provider state was not reported.");
        add(libraryConnection.ok ? "ok" : "fail", "Engine library provider", libraryConnection.message || "Library provider state was not reported.");
        add(searchConnection.ok ? "ok" : "fail", "Engine search provider", searchConnection.message || "Search provider state was not reported.");
      }
      add(
        context.capabilities?.item_artwork_proxy ? "ok" : "info",
        "Engine item artwork proxy",
        context.capabilities?.item_artwork_proxy
          ? "Queue and Library artwork can be served through short-lived Home Assistant capability URLs without direct browser access to Music Assistant."
          : "This Engine version does not expose the item artwork proxy. Update HOMEii Flow Engine before using the 6.x card.",
      );
      const mediaCache = context.raw?.media_cache;
      if (mediaCache && typeof mediaCache === "object") {
        const cacheCapabilitiesReady = context.capabilities?.persistent_media_cache
          && context.capabilities?.stale_while_revalidate
          && context.capabilities?.request_coalescing;
        add(
          cacheCapabilitiesReady ? "ok" : "info",
          "Engine persistent media cache",
          `${Number(mediaCache.memory_entries || 0)} snapshot(s), ${Number(mediaCache.cached_items || 0)} cached item(s), ${Number(mediaCache.fresh_entries || 0)} fresh and ${Number(mediaCache.stale_entries || 0)} stale.`,
          `hits=${Number(mediaCache.memory_hits || 0)}; stale_hits=${Number(mediaCache.stale_hits || 0)}; coalesced=${Number(mediaCache.coalesced || 0)}; last_fetch=${Number(mediaCache.last_fetch_ms || 0)}ms; warm=${mediaCache.warm_status || "pending"}`,
        );
      }
      const cardPerformance = this._performanceMetrics || {};
      add(
        Number(cardPerformance.lastMenuRenderMs || 0) <= 200 ? "ok" : "warn",
        "Card menu render performance",
        `Last menu render ${Number(cardPerformance.lastMenuRenderMs || 0)}ms on ${cardPerformance.lastMenuPage || "none"} with ${Number(cardPerformance.lastMenuDomNodes || 0)} DOM node(s).`,
        `renders=${Number(cardPerformance.menuRenders || 0)}; slowest=${Number(cardPerformance.slowestMenuRenderMs || 0)}ms`,
      );
      if (context.capabilities?.schedule_calendar) {
        add("ok", "Engine schedule calendar", "HOMEii Flow Engine reports a Home Assistant calendar entity for stored schedules.");
      }
      const [playersResult, statsResult, schedulesResult, timersResult, volumeRulesResult, announcementsResult, activityResult, orchestrationResult, playbackStatsResult, screensaverResult] = await Promise.allSettled([
        this._homeiiEngineGetPlayers(),
        this._homeiiEngineGetStats(),
        this._homeiiEngineGetSchedules(),
        this._homeiiEngineGetTimers(),
        this._homeiiEngineCommand("volume_rules/get"),
        this._homeiiEngineGetAnnouncements(),
        this._homeiiEngineGetActivity(),
        this._homeiiEngineCommand("orchestration/status"),
        this._homeiiEngineGetPlaybackStats(),
        this._homeiiEngineGetScreensaver(),
      ]);
      const playerCount = Number(playersResult.value?.music_assistant_count ?? statsResult.value?.music_assistant_players ?? 0);
      if (playersResult.status === "fulfilled" || statsResult.status === "fulfilled") {
        const playingCount = Number(statsResult.value?.players_playing ?? 0);
        const groupedCount = Number(statsResult.value?.players_grouped ?? 0);
        const activePlayer = statsResult.value?.active_player_entity || statsResult.value?.active_player?.entity_id || "";
        add(playerCount ? "ok" : "warn", "Engine player state", `${playerCount} Music Assistant player(s), ${playingCount} playing, ${groupedCount} grouped.`, activePlayer ? `active=${activePlayer}` : "");
      }
      if (orchestrationResult.status === "fulfilled") {
        const orchestration = orchestrationResult.value || {};
        const scheduleCheck = orchestration.last_schedule_check || {};
        const lastAction = orchestration.last_schedule_action || {};
        const lastTimerAction = orchestration.last_timer_action || {};
        const lastVolumeAction = orchestration.last_volume_action || {};
        const lastButtonAction = orchestration.last_button_action || {};
        const schedulerDetail = scheduleCheck.local_time
          ? `Last schedule check at ${scheduleCheck.local_time}; ${scheduleCheck.schedule_count ?? 0} schedule(s), ${scheduleCheck.attempted_count ?? 0} attempted, ${scheduleCheck.executed_count ?? 0} executed, ${scheduleCheck.failed_count ?? 0} failed.`
          : "No schedule check has been recorded yet. Restart Home Assistant or run orchestration once if this stays empty.";
        const actionDetail = lastAction.error
          ? ` Last schedule action failed: ${lastAction.error}`
          : lastAction.provider
            ? ` Last schedule action used ${lastAction.provider}.`
            : "";
        const timerDetail = lastTimerAction.error
          ? ` Last timer action failed: ${lastTimerAction.error}`
          : lastTimerAction.provider
            ? ` Last timer action used ${lastTimerAction.provider}.`
            : "";
        const volumeDetail = lastVolumeAction.player
          ? ` Last volume rule adjusted ${lastVolumeAction.player}.`
          : "";
        const buttonDetail = lastButtonAction.action
          ? ` Last Engine button action: ${lastButtonAction.action}${lastButtonAction.ok === false && lastButtonAction.error ? ` (${lastButtonAction.error})` : ""}.`
          : "";
        add(orchestration.running ? "ok" : "warn", "Engine scheduler", `${schedulerDetail}${actionDetail}`, `running=${orchestration.running ? "yes" : "no"}; last_tick=${orchestration.last_tick_at || "(none)"}`);
        if (timerDetail || volumeDetail || buttonDetail) {
          add("info", "Engine background actions", `${timerDetail}${volumeDetail}${buttonDetail}`.trim());
        }
      }
      if (playbackStatsResult.status === "fulfilled") {
        const playbackStats = playbackStatsResult.value || {};
        const topPlayer = playbackStats.top_player_today || {};
        const topPlayerDetail = topPlayer.friendly_name
          ? `Top today: ${topPlayer.friendly_name}, ${topPlayer.minutes || 0} minute(s).`
          : "No top player yet.";
        add("info", "Engine playback statistics", `${playbackStats.today_minutes || 0} minute(s), ${playbackStats.today_sessions || 0} session(s) today.`, topPlayerDetail);
      }
      if (screensaverResult.status === "fulfilled") {
        const screen = screensaverResult.value || {};
        const config = screen.config || {};
        const resource = config.frontend_url || context.raw?.frontend?.system_screensaver_url || "/homeii_flow/homeii-flow-system-screensaver.js";
        add(screen.enabled ? "ok" : "info", "Engine system screensaver", `System-wide screensaver is ${screen.enabled ? "enabled" : "disabled"}; effective mode ${screen.effective_mode || "clock"} after ${screen.timeout_seconds || config.timeout_seconds || 90}s.`, `Resource: ${resource}`);
      }
      const schedules = Array.isArray(schedulesResult.value?.schedules) ? schedulesResult.value.schedules : [];
      const timers = Array.isArray(timersResult.value?.timers) ? timersResult.value.timers : [];
      const volumeRules = Array.isArray(volumeRulesResult.value?.volume_rules) ? volumeRulesResult.value.volume_rules : [];
      const activeVolumeRules = Array.isArray(volumeRulesResult.value?.active) ? volumeRulesResult.value.active : [];
      const announcements = Array.isArray(announcementsResult.value?.announcements) ? announcementsResult.value.announcements : [];
      const activity = Array.isArray(activityResult.value?.activity) ? activityResult.value.activity : [];
      if (schedulesResult.status === "fulfilled" || timersResult.status === "fulfilled" || volumeRulesResult.status === "fulfilled" || announcementsResult.status === "fulfilled" || activityResult.status === "fulfilled") {
        const localSchedules = this._scheduledStartSchedules();
        const localSleepTimerActive = this._sleepTimerRemainingMs() > 0;
        add("info", "Engine orchestration store", `${schedules.length} schedule(s), ${timers.length} timer(s), ${volumeRules.length} volume rule(s), ${announcements.length} announcement record(s), ${activity.length} activity event(s) stored in HOMEii Flow Engine. Card state has ${localSchedules.length} schedule(s) and ${localSleepTimerActive ? 1 : 0} active sleep timer(s).`);
        if (schedules.length) {
          add("info", "Engine schedule controls", `${schedules.length} per-schedule Run now button(s) should be available on the HOMEii Flow Engine device page after HA reloads the integration.`);
        }
        const lastActivity = activityResult.value?.last_activity || activity[0] || {};
        if (lastActivity?.message) {
          add("info", "Engine last activity", `${lastActivity.message}`, `${lastActivity.kind || "event"} · ${lastActivity.created_at || ""}`);
        }
        if (volumeRulesResult.status === "fulfilled") {
          const activeDetail = activeVolumeRules
            .slice(0, 4)
            .map((rule) => `${rule.player || "(no player)"} <= ${rule.max_volume ?? "?"}%`)
            .join("; ");
          add(volumeRules.length ? "ok" : "info", "Engine volume policies", `${activeVolumeRules.length}/${volumeRules.length} volume rule(s) active now.`, activeDetail);
        }
        const nextSchedule = schedulesResult.value?.next_schedule || {};
        if (nextSchedule?.next_run) {
          const label = [nextSchedule.name, nextSchedule.player, nextSchedule.media_name || nextSchedule.playlist_name].filter(Boolean).join(" · ");
          add("info", "Engine next schedule", `${nextSchedule.next_run}${label ? ` · ${label}` : ""}`);
        }
        const nextTimer = timersResult.value?.next_timer || {};
        if (nextTimer?.ends_at) {
          const remaining = Number(nextTimer.remaining_seconds ?? 0);
          const remainingText = Number.isFinite(remaining) ? ` · ${Math.max(0, Math.ceil(remaining / 60))} minute(s) remaining` : "";
          add("info", "Engine next timer", `${nextTimer.ends_at} · ${nextTimer.player || "(no player)"} · ${nextTimer.action || "stop"}${remainingText}`);
        }
        if (localSchedules.length) {
          const engineScheduleIds = new Set(schedules.map((schedule) => String(schedule?.id || schedule?.schedule_id || "").trim()).filter(Boolean));
          const missingSchedules = localSchedules.filter((schedule) => !engineScheduleIds.has(String(schedule?.id || "").trim()));
          if (missingSchedules.length) {
            add("warn", "Engine schedule sync", `${missingSchedules.length} card schedule(s) were not found in the Engine read-back result. Save one schedule again, then rerun diagnostics.`);
          } else {
            add("ok", "Engine schedule sync", "Card schedules were found in the Engine read-back result.");
          }
        }
        if (localSleepTimerActive) {
          const timerPlayer = String(this._state.mobileSleepTimerPlayer || this._state.selectedPlayer || this._getSelectedPlayer()?.entity_id || "").trim();
          const timerId = this._homeiiSleepTimerId(timerPlayer);
          const now = Date.now();
          const timerFound = timers.some((timer) => {
            const type = String(timer?.type || timer?.timer_type || "sleep");
            const targetMs = Date.parse(timer?.ends_at || timer?.target_at || "");
            const matchesId = String(timer?.id || timer?.timer_id || "").trim() === timerId;
            const matchesPlayer = timerPlayer && String(timer?.player || timer?.entity_id || "").trim() === timerPlayer;
            return type === "sleep" && (matchesId || matchesPlayer) && Number.isFinite(targetMs) && targetMs > now;
          });
          add(timerFound ? "ok" : "warn", "Engine sleep timer sync", timerFound
            ? "The active card sleep timer was found in the Engine read-back result."
            : "The card has an active sleep timer, but Engine did not return a matching active timer.");
        }
      }
      return;
    }
    const detail = "Engine mode is Required, but the Home Assistant integration did not answer. HOMEii Flow 6 will not run until the integration is installed, loaded, and refreshed.";
    const lastError = this._state.engineLastError ? ` Last error: ${this._state.engineLastError}` : "";
    add("fail", "HOMEii Flow Engine", `${detail}${lastError}`, mode);
  }

  async _runDiagnostics() {
    if (this._state.diagnosticsStatus === "running") return;
    this._state.diagnosticsStatus = "running";
    this._state.diagnosticsItems = [];
    if (this._state.menuOpen && this._state.menuPage === "diagnostics") await this._renderMobileMenu();

    const items = [];
    const add = (status, title, detail = "", value = "") => items.push(this._diagnosticItem(status, title, detail, value));
    const hassReady = !!(this._hass && this._hass.states && this._hass.services);
    const musicAssistantServices = Object.keys(this._hass?.services?.music_assistant || {});
    const hasIntegrationServices = musicAssistantServices.length > 0;
    const hassStates = this._hass?.states || {};
    const hassEntities = this._hass?.entities || {};
    const haMusicAssistantPlayers = Object.values(hassStates)
      .filter((entity) => HomeiiPlayersFoundation.isMusicAssistantPlayer(entity, hassEntities?.[entity.entity_id]));
    const genericMediaPlayers = Object.values(hassStates)
      .filter((entity) => entity?.entity_id?.startsWith?.("media_player."));
    let enginePlayers = Array.isArray(this._state.enginePlayers) ? this._state.enginePlayers : [];
    let selectedPlayer = this._getSelectedPlayer();
    let configEntryState = "";
    let configEntryFound = false;

    add("ok", "Card version", "HOMEii Flow runtime is loaded.", HOMEII_CARD_VERSION);
    add("ok", "Diagnostics version", "Diagnostic v7 is active.", "v7");
    add("info", "Browser", this._diagnosticBrowserSummary());
    add("info", "Viewport", this._diagnosticViewportSummary());
    add("info", "Diagnostic privacy", "External/private hostnames are redacted in visible and copied diagnostic output.");
    add(this._diagnosticCurrentOrigin() ? "ok" : "warn", "Home Assistant URL", this._diagnosticCurrentOrigin() ? this._diagnosticUrlDescription(this._diagnosticCurrentOrigin()) : "Could not read current Home Assistant origin.", this._diagnosticCurrentOrigin() ? this._sanitizeDiagnosticUrl(this._diagnosticCurrentOrigin()) : "");
    add(hassReady ? "ok" : "fail", "Home Assistant frontend", hassReady ? "The card can read Home Assistant state and services." : "The card does not have a usable Home Assistant frontend object.");
    add(musicAssistantServices.length ? "ok" : "fail", "Music Assistant services", musicAssistantServices.length ? `${musicAssistantServices.length} service(s) are exposed by Home Assistant.` : "No music_assistant services are exposed by Home Assistant.");
    add(hasIntegrationServices ? "ok" : "warn", "Music Assistant dependency", hasIntegrationServices ? "Home Assistant exposes Music Assistant services for the Engine to use." : "Home Assistant does not expose music_assistant services. HOMEii Flow Engine will not be able to provide full playback, queue, search and library data.");
    await this._diagnosticEngineRows(add);
    if (this._homeiiEngineRequired?.() && typeof this._refreshEnginePlayers === "function") {
      await this._refreshEnginePlayers({ force: true }).catch(() => []);
      enginePlayers = Array.isArray(this._state.enginePlayers) ? this._state.enginePlayers : [];
      selectedPlayer = this._getSelectedPlayer();
    }
    add("info", "Engine source of truth", "HOMEii Flow 6 uses HOMEii Flow Engine exclusively for players, queue, library, search, artwork and playback. Music Assistant credentials are not stored in the card.");

    if (this._hass?.connection?.sendMessagePromise) {
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
        if (preferred?.entry_id) {
          this._resolvedConfigEntryId = preferred.entry_id;
          this._resolvedConfigEntryState = String(preferred.state || "").trim();
          configEntryState = this._resolvedConfigEntryState;
          configEntryFound = true;
          add(preferred.state === "loaded" ? "ok" : "warn", "Music Assistant config entry", preferred.state === "loaded" ? "Home Assistant reports the Music Assistant entry as loaded." : "Home Assistant reports the Music Assistant entry as not fully loaded.", String(preferred.state || "unknown"));
        } else {
          configEntryState = "none";
          add("fail", "Music Assistant config entry", "No Music Assistant config entry was returned by Home Assistant.");
        }
      } catch (error) {
        configEntryState = "unreadable";
        add("warn", "Music Assistant config entry", error?.message || "Could not read Home Assistant config entries.");
      }
    } else {
      configEntryState = "unavailable";
      add("warn", "Music Assistant config entry", "Home Assistant connection API is not available in this frontend context.");
    }

    add(hasIntegrationServices || configEntryFound ? "ok" : "fail", "Integration signal", `services ${hasIntegrationServices ? "yes" : "no"}, config entry ${configEntryState || "unknown"}, engine ${this._state.engineAvailable ? "yes" : "no"}`);
    add(
      enginePlayers.length ? "ok" : "fail",
      "Music Assistant players",
      enginePlayers.length
        ? `${enginePlayers.length} Engine Music Assistant player(s). HA sees ${haMusicAssistantPlayers.length} strict MA player(s), ${genericMediaPlayers.length} generic media_player(s).`
        : `Engine returned no Music Assistant players. HA sees ${haMusicAssistantPlayers.length} strict MA player(s), ${genericMediaPlayers.length} generic media_player(s).`,
    );
    if (!selectedPlayer) {
      add("fail", "Selected player", "No selected player is available.");
    } else {
      const selectedName = selectedPlayer.attributes?.friendly_name || selectedPlayer.entity_id || "";
      const excluded = this._isPlayerExcluded?.(selectedPlayer);
      const selectedFromEngine = enginePlayers.some((player) => player?.entity_id === selectedPlayer.entity_id);
      add(selectedFromEngine && !excluded ? "ok" : "warn", "Selected player", excluded ? "The selected player is currently excluded in HOMEii settings." : (selectedFromEngine ? "Selected player was provided by HOMEii Flow Engine." : "Selected player was not found in the Engine player list."), `${selectedName} | ${this._diagnosticPlayerMarkerSummary(selectedPlayer, hassEntities)}`);
      const urlOverride = this._playerOverrideParamValue?.() || "";
      const configuredEntity = String(this._config?.entity || this.config?.entity || "").trim();
      const selectionSource = urlOverride
        ? `query string (${urlOverride})`
        : (configuredEntity ? `card entity (${configuredEntity})` : "automatic / remembered");
      add("info", "Player selection source", "Query-string player overrides win first, then card entity, then automatic/remembered selection.", selectionSource);
      this._diagnosticConfiguredEntityRows(add, selectedPlayer, hassStates, hassEntities);
      const groupIds = this._currentSpeakerGroupMemberIds?.(selectedPlayer.entity_id) || [];
      const groupNames = groupIds
        .map((entityId) => this._playerByEntityId?.(entityId)?.attributes?.friendly_name || entityId)
        .filter(Boolean);
      add(groupIds.length > 1 ? "ok" : "info", "Group state", groupIds.length > 1 ? `${groupIds.length} player(s) are currently grouped.` : "Selected player is not currently in a dynamic group.", groupNames.join(" · ") || "(none)");
      const groupOwnerId = this._currentSpeakerGroupOwnerId?.(selectedPlayer.entity_id) || selectedPlayer.entity_id || "";
      const groupOwnerName = this._playerByEntityId?.(groupOwnerId)?.attributes?.friendly_name || groupOwnerId || "(none)";
      const joinAvailable = !!this._hass?.services?.media_player?.join;
      const unjoinAvailable = !!this._hass?.services?.media_player?.unjoin;
      add(joinAvailable && unjoinAvailable ? "ok" : "warn", "Group service path", `media_player.join ${joinAvailable ? "yes" : "no"}, media_player.unjoin ${unjoinAvailable ? "yes" : "no"}`, `owner=${groupOwnerName}; selected_is_owner=${groupOwnerId === selectedPlayer.entity_id ? "yes" : "no"}; members=${groupIds.join(", ") || "(none)"}`);
    }

    add(hasIntegrationServices ? "ok" : "info", "Music Assistant credentials", "The internal URL, external URL and API token are owned only by HOMEii Flow Engine and are intentionally absent from the card.", "Engine only");
    add("ok", "Music Assistant transport", "Commands, realtime events and artwork are proxied through HOMEii Flow Engine. The card opens no authenticated MA REST or WebSocket connection.", "Engine only");
    if (this._state.maServerVersion) {
      const schema = this._state.maSchemaVersion ? `schema ${this._state.maSchemaVersion}` : "schema unavailable";
      add("info", "Music Assistant server version", "Version reported by the authenticated HOMEii Flow Engine event connection.", `${this._state.maServerVersion}; ${schema}`);
    }

    await this._diagnosticSearchRows(add, musicAssistantServices);
    await this._diagnosticQueueRows(add, selectedPlayer);
    await this._diagnosticLibraryRows(add, musicAssistantServices);
    this._diagnosticRenderedArtworkRows(add);

    this._state.diagnosticsItems = items;
    this._state.diagnosticsStatus = "done";
    this._state.diagnosticsRunAt = Date.now();
    if (this._state.menuOpen && this._state.menuPage === "diagnostics") await this._renderMobileMenu();
  }

  _diagnosticsReportText() {
    const items = Array.isArray(this._state.diagnosticsItems) ? this._state.diagnosticsItems : [];
    const lines = [
      "HOMEii Music Flow Diagnostics",
      "Diagnostics: v7",
      `Version: ${HOMEII_CARD_VERSION}`,
      `Generated: ${new Date(this._state.diagnosticsRunAt || Date.now()).toISOString()}`,
      `Browser: ${this._diagnosticBrowserSummary()}`,
      `Viewport: ${this._diagnosticViewportSummary()}`,
      "Privacy: external/private hostnames are redacted by default.",
      `HA URL: ${this._diagnosticCurrentOrigin() ? this._sanitizeDiagnosticUrl(this._diagnosticCurrentOrigin()) : ""}`,
      `HA URL detail: ${this._diagnosticUrlDescription(this._diagnosticCurrentOrigin())}`,
      "music_assistant_credentials: Engine only (not stored in card)",
      `homeii_engine_mode: ${this._homeiiEngineMode()}`,
      `homeii_engine_status: ${this._state.engineStatus || "unknown"}`,
      `homeii_engine_available: ${this._state.engineAvailable ? "yes" : "no"}`,
      `homeii_engine_version: ${this._state.engineVersion || "(none)"}`,
      `homeii_engine_instance_id configured: ${this._config?.homeii_engine_instance_id ? "yes" : "no"}`,
      `homeii_engine_profile_id configured: ${this._config?.homeii_engine_profile_id ? "yes" : "no"}`,
      `homeii_engine_instance_id resolved: ${this._state.engineInstanceId || "(none)"}`,
      `homeii_engine_profile_id resolved: ${this._state.engineProfileId || "(none)"}`,
      `homeii_engine_transport: ${this._state.engineLastTransport || "(none)"}`,
      `selected_player: ${this._state.selectedPlayer || "(none)"}`,
      "",
      "Checks:",
      ...items.map((item) => `- [${String(item.status || "info").toUpperCase()}] ${item.title}${item.value ? `: ${item.value}` : ""}${item.detail ? ` - ${item.detail}` : ""}`),
    ];
    return this._redactDiagnosticText(lines.join("\n"));
  }

  async _copyDiagnosticsReport() {
    const report = this._diagnosticsReportText();
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(report);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = report;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        textarea.remove();
      }
      this._toastSuccess(this._m("Diagnostics report copied", "דוח האבחון הועתק"));
    } catch (error) {
      this._toastError(error?.message || this._m("Could not copy diagnostics report", "לא ניתן להעתיק את דוח האבחון"));
    }
  }

  _libraryTabMeta(tab) {
    const map = {
      library_liked: { icon: "heart_filled", type: "liked", title: this._i18n("ui.liked") },
      library_playlists: { icon: "playlist", type: "playlist", title: this._i18n("ui.playlists") },
      library_artists: { icon: "artist", type: "artist", title: this._i18n("ui.artists") },
      library_albums: { icon: "album", type: "album", title: this._i18n("ui.albums") },
      library_tracks: { icon: "tracks", type: "track", title: this._i18n("ui.tracks") },
      library_radio: { icon: "radio", type: "radio", title: this._i18n("ui.radio") },
      library_podcasts: { icon: "podcast", type: "podcast", title: this._i18n("ui.podcasts") },
      library_search: { icon: "search", type: "search", title: this._i18n("ui.search") },
    };
    return map[tab] || map.library_playlists;
  }

  _libraryNavHtml(currentTab) {
    const tabs = this._mobileLibraryTabs();
    return `
      <div class="library-nav">
        ${tabs.map((tab) => {
          const meta = this._libraryTabMeta(tab);
          return `<button class="library-nav-btn ${tab === currentTab ? "active" : ""}" data-menu-nav="${this._esc(tab)}" title="${this._esc(meta.title)}" aria-label="${this._esc(meta.title)}" aria-current="${tab === currentTab ? "page" : "false"}">${this._iconSvg(meta.icon)}${this._mobileFooterMode() === "icon" ? "" : `<span>${this._esc(meta.title)}</span>`}</button>`;
        }).join("")}
      </div>
    `;
  }

  _libraryPlayerFocusHtml() {
    const player = this._getSelectedPlayer();
    const playerName = player?.attributes?.friendly_name || this._i18n("ui.choose_player");
    const isPlaying = player?.state === "playing";
    const groupCount = this._playerGroupCount(player);
    return `
      <button class="library-player-focus ${isPlaying ? "is-playing" : ""}" data-menu-nav="players">
        <span class="library-player-art">${this._iconSvg("speaker")}</span>
        <span class="library-player-copy">
          <span class="library-player-name">${this._esc(playerName)}</span>
          <span class="library-player-state">${this._esc(isPlaying ? (player?.attributes?.media_title || this._i18n("ui.playing")) : this._i18n("ui.ready"))}</span>
        </span>
        ${groupCount ? `<span class="player-group-badge library-focus-badge">${this._esc(groupCount)}</span>` : ``}
        <span class="eq-icon" aria-hidden="true"><span></span><span></span><span></span></span>
      </button>
    `;
  }

  _libraryShellHtml(content, currentTab) {
    return `
      <div class="library-shell">
        <div class="library-body">${content}</div>
        ${this._libraryNavHtml(currentTab)}
      </div>
    `;
  }

  _libraryDetailPopupShellHtml(content, className = "") {
    return `
      <div class="library-shell detail-popup-shell ${this._esc(className)}">
        <div class="library-body">${content}</div>
      </div>
    `;
  }

  _mediaDetailEntryData(item = {}, fallbackType = "track", parentDetail = {}) {
    const mediaItem = item?.media_item || {};
    const mediaType = String(item?.media_type || item?.type || mediaItem?.media_type || fallbackType || "track").toLowerCase();
    const albumValue = item?.album || mediaItem?.album || parentDetail?.album || {};
    const albumName = typeof albumValue === "string" ? albumValue : (albumValue?.name || parentDetail?.name || "");
    const artist = this._artistName(item)
      || item?.artist
      || item?.artist_str
      || parentDetail?.artist
      || "";
    const image = this._artUrl(item)
      || item?.image
      || item?.image_url
      || mediaItem?.image
      || mediaItem?.image_url
      || parentDetail?.image
      || parentDetail?.image_url
      || "";
    return {
      uri: String(item?.uri || mediaItem?.uri || "").trim(),
      media_type: mediaType,
      name: String(item?.name || item?.title || mediaItem?.name || mediaItem?.title || "").trim(),
      artist,
      album: albumName,
      image,
      favorite_scope: item?.radio_browser || item?.radio_browser_id || parentDetail?.radio_browser || parentDetail?.radio_browser_id
        ? "radio_browser"
        : (item?.favorite_scope || parentDetail?.favorite_scope || "library"),
    };
  }

  _mediaDetailDataAttrs(entry = {}) {
    return `data-media-uri="${this._esc(entry.uri || "")}" data-media-type="${this._esc(entry.media_type || "track")}" data-media-name="${this._esc(entry.name || "")}" data-media-artist="${this._esc(entry.artist || "")}" data-media-album="${this._esc(entry.album || "")}" data-media-image="${this._esc(entry.image || "")}" data-media-favorite-scope="${this._esc(entry.favorite_scope || "library")}"`;
  }

  _mediaDetailTrackRowsHtml(tracks = [], parentDetail = {}) {
    if (!tracks.length) return "";
    return `
      <div class="media-detail-track-list">
        ${tracks.map((track, index) => {
          const entry = this._mediaDetailEntryData(track, "track", parentDetail);
          const dataAttrs = this._mediaDetailDataAttrs(entry);
          const liked = this._isEntryLiked(entry);
          const sub = [entry.artist, entry.album].filter(Boolean).join(" · ");
          const duration = this._fmtDur(track?.duration || track?.media_item?.duration || 0);
          return `
            <div class="media-detail-track-row">
              <div class="media-detail-track-index">${this._esc(String(index + 1))}</div>
              <div class="media-detail-track-copy">
                <div class="media-detail-track-title">${this._esc(entry.name || this._i18n("ui.track"))}</div>
                <div class="media-detail-track-sub">${this._esc(sub || duration || "—")}</div>
              </div>
              ${duration ? `<div class="media-detail-track-duration">${this._esc(duration)}</div>` : ``}
              <div class="media-detail-track-actions">
                <button class="media-detail-action-btn primary" data-media-detail-action="play" ${dataAttrs} title="${this._esc(this._i18n("ui.play_now"))}" aria-label="${this._esc(this._i18n("ui.play_now"))}">${this._iconSvg("play")}</button>
                <button class="media-detail-action-btn" data-media-detail-action="add" ${dataAttrs} title="${this._esc(this._i18n("ui.add_to_queue"))}" aria-label="${this._esc(this._i18n("ui.add_to_queue"))}">${this._iconSvg("queue_add")}</button>
                <button class="media-detail-action-btn ${liked ? "active" : ""}" data-media-detail-action="like" ${dataAttrs} title="${this._esc(this._i18n("ui.like_2"))}" aria-label="${this._esc(this._i18n("ui.like_2"))}" aria-pressed="${liked ? "true" : "false"}">${this._iconSvg(liked ? "heart_filled" : "heart_outline")}</button>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `;
  }

  _albumBrowseSelectHtml(browse = null) {
    if (!browse?.albums?.length) return "";
    return `
      <label class="media-detail-album-picker">
        <span class="media-detail-picker-label">${this._esc(this._m("Album", "אלבום"))}</span>
        <select id="mediaDetailAlbumSelect" aria-label="${this._esc(this._m("Select album", "בחר אלבום"))}">
          ${browse.albums.map((album, index) => `
            <option value="${this._esc(String(index))}" ${index === browse.index ? "selected" : ""}>${this._esc(this._albumSelectLabel(album, index))}</option>
          `).join("")}
        </select>
      </label>
    `;
  }

  _libraryMediaDetailHtml(detail = {}) {
    const mediaType = String(detail.media_type || detail.type || "album").toLowerCase();
    if (mediaType === "artist") return this._libraryArtistDetailHtml(detail);
    const isPodcast = mediaType === "podcast";
    const kindTitle = isPodcast ? this._i18n("ui.podcasts") : mediaType === "playlist" ? this._i18n("ui.playlist") : this._i18n("ui.album");
    const title = detail.name || kindTitle;
    const subtitle = [detail.artist, typeof detail.album === "string" ? detail.album : detail.album?.name].filter(Boolean).join(" · ")
      || kindTitle;
    const art = detail.image || detail.image_url || this._artUrl(detail);
    const fallbackIcon = isPodcast ? "podcast" : mediaType === "playlist" ? "playlist" : "album";
    const tracks = Array.isArray(detail.tracks) ? detail.tracks : [];
    const loading = !!detail.loading;
    const itemLabel = isPodcast ? this._m("Episodes", "פרקים") : this._i18n("ui.tracks");
    const trackCount = tracks.length ? `${tracks.length} ${itemLabel.toLowerCase()}` : "";
    const emptyCopy = detail.error || (isPodcast
      ? this._m("No episodes were returned by the provider.", "הספק לא החזיר פרקים לפודקאסט הזה.")
      : this._m("No tracks were returned. You can still play it.", "לא חזרו רצועות. עדיין אפשר להפעיל."));
    const detailEntry = this._mediaDetailEntryData({ ...detail, image: art, image_url: art }, mediaType, detail);
    const detailDataAttrs = this._mediaDetailDataAttrs(detailEntry);
    const detailLiked = this._isEntryLiked(detailEntry);
    const browse = mediaType === "album" ? this._albumBrowseState(detail) : null;
    const kindLabel = mediaType === "album" ? this._albumKindLabel(detail) : "";
    const artHtml = art ? this._imgHtml(art, "", { fallbackIcon }) : this._iconSvg(fallbackIcon);
    return `
      <div class="media-detail-shell album-detail-shell">
        <div class="menu-list-item media-detail-hero album-detail-player">
          <span class="media-detail-art-stage">
            <span class="media-detail-art">${artHtml}</span>
            <span class="media-detail-player-actions media-detail-cover-actions">
              <button class="chip-btn media-detail-play-btn like ${detailLiked ? "active" : ""}" data-media-detail-action="like" ${detailDataAttrs} title="${this._esc(this._i18n("ui.like_2"))}" aria-label="${this._esc(this._i18n("ui.like_2"))}" aria-pressed="${detailLiked ? "true" : "false"}">${this._iconSvg(detailLiked ? "heart_filled" : "heart_outline")}</button>
            </span>
          </span>
          <span class="media-detail-copy">
            <span class="media-detail-kicker">${this._esc(kindTitle)}</span>
            <span class="media-detail-title">${this._esc(title)}</span>
            <span class="media-detail-sub">${this._esc(trackCount || subtitle || "—")}${kindLabel ? `<span class="media-detail-kind-badge">${this._esc(kindLabel)}</span>` : ``}</span>
            <span class="media-detail-player-actions media-detail-hero-actions">
              <button class="chip-btn media-detail-play-btn subtle" data-media-detail-action="add" ${detailDataAttrs} title="${this._esc(this._i18n("ui.add_to_queue"))}" aria-label="${this._esc(this._i18n("ui.add_to_queue"))}">${this._iconSvg("queue_add")}</button>
              <button class="chip-btn media-detail-play-btn" data-media-detail-action="play" ${detailDataAttrs} title="${this._esc(this._i18n("ui.play_now"))}" aria-label="${this._esc(this._i18n("ui.play_now"))}">${this._iconSvg("play")}</button>
            </span>
            ${browse ? this._albumBrowseSelectHtml(browse) : ``}
          </span>
        </div>
        <div class="media-detail-toolbar">
          <div class="media-section-title">${this._esc(itemLabel)}</div>
          ${trackCount ? `<div class="media-detail-count-badge">${this._esc(trackCount)}</div>` : ``}
        </div>
        ${loading
          ? this._loadingStateHtml(this._i18n("ui.loading_library"), { notice: true })
          : tracks.length
            ? this._mediaDetailTrackRowsHtml(tracks, detail)
            : `<div class="notice open media-detail-empty">${this._esc(emptyCopy)}</div>`}
      </div>
    `;
  }

  _artistAlbumYearGroups(albums = []) {
    const groups = new Map();
    (Array.isArray(albums) ? albums : []).forEach((album) => {
      const year = this._mediaYearValue(album);
      const key = year ? String(year) : this._m("Unknown year", "שנה לא ידועה");
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(album);
    });
    return Array.from(groups.entries()).sort(([left], [right]) => {
      const leftYear = Number(left);
      const rightYear = Number(right);
      if (Number.isFinite(leftYear) && Number.isFinite(rightYear)) return rightYear - leftYear;
      if (Number.isFinite(leftYear)) return -1;
      if (Number.isFinite(rightYear)) return 1;
      return String(left).localeCompare(String(right), this._isHebrew() ? "he" : "en", { sensitivity: "base", numeric: true });
    });
  }

  _artistInfoPopupHtml(title = "", description = "") {
    const body = String(description || "").trim()
      || this._m("Music Assistant did not return detailed artist information yet.", "Music Assistant עדיין לא החזיר מידע מפורט על האמן.");
    return `
      <div class="artist-info-backdrop" data-artist-info-close="1">
        <div class="artist-info-dialog" role="dialog" aria-modal="true" aria-label="${this._esc(title || this._i18n("ui.artist"))}">
          <div class="artist-info-head">
            <div class="artist-info-title">${this._esc(title || this._i18n("ui.artist"))}</div>
            <button class="artist-info-close" data-artist-info-close="1" title="${this._esc(this._i18n("ui.close"))}" aria-label="${this._esc(this._i18n("ui.close"))}">${this._iconSvg("close")}</button>
          </div>
          <div class="artist-info-body">${this._esc(body)}</div>
        </div>
      </div>
    `;
  }

  _libraryArtistDetailHtml(detail = {}) {
    const artistInfo = detail.artistInfo || detail;
    const title = artistInfo.name || detail.name || this._i18n("ui.artist");
    const art = this._artUrl(artistInfo, { size: 512 }) || detail.image || detail.image_url || this._artUrl(detail, { size: 512 });
    const description = this._artistDescriptionText(artistInfo);
    const albums = Array.isArray(detail.albums) ? detail.albums : [];
    const playlists = Array.isArray(detail.playlists) ? detail.playlists : [];
    const loading = !!detail.loading;
    const emptyCopy = detail.error || this._m("No albums were returned for this artist.", "לא חזרו אלבומים עבור האמן הזה.");
    const searchQuery = detail.artistSearchQuery || "";
    const searchOpen = !!detail.artistSearchOpen;
    const albumGroups = this._artistAlbumYearGroups(albums);
    const artistRadioTitle = this._m("Start artist radio", "הפעל רדיו אמן");
    return `
      <div class="media-detail-shell artist-detail-shell">
        <div class="artist-detail-hero">
          <span class="artist-detail-art">${art ? this._imgHtml(art, "", { fallbackIcon: "artist" }) : this._iconSvg("artist")}</span>
          <span class="artist-detail-copy">
            <span class="media-detail-kicker">${this._esc(this._i18n("ui.artist"))}</span>
            <span class="artist-detail-title">${this._esc(title)}</span>
          </span>
          <span class="artist-detail-actions">
            <button class="artist-hero-icon-btn" data-artist-radio="1" data-media-uri="${this._esc(detail.uri || artistInfo.uri || "")}" data-media-type="artist" data-media-name="${this._esc(title)}" title="${this._esc(artistRadioTitle)}" aria-label="${this._esc(artistRadioTitle)}">${this._iconSvg("radio")}</button>
            <button class="artist-hero-icon-btn" data-artist-search-toggle="1" title="${this._esc(this._i18n("ui.search"))}" aria-label="${this._esc(this._i18n("ui.search"))}" aria-expanded="${searchOpen ? "true" : "false"}">${this._iconSvg("search")}</button>
            <button class="artist-info-btn" data-artist-info-open="1" title="${this._esc(this._m("Artist info", "מידע על אמן"))}" aria-label="${this._esc(this._m("Artist info", "מידע על אמן"))}">${this._iconSvg("info")}</button>
          </span>
        </div>
        ${detail.artistInfoOpen ? this._artistInfoPopupHtml(title, description) : ``}
        ${searchOpen ? `
          <div class="artist-detail-search">
            <div class="media-search-shell artist-search-shell">
              <span>${this._iconSvg("search")}</span>
              <input id="artistDetailSearchInput" type="text" value="${this._esc(searchQuery)}" placeholder="${this._esc(this._m("Search another artist", "חיפוש אמן נוסף"))}">
              <button class="chip-btn artist-search-btn" data-artist-detail-search title="${this._esc(this._i18n("ui.search"))}"><span>${this._esc(this._i18n("ui.search"))}</span></button>
            </div>
          </div>
        ` : ``}
        ${loading
          ? this._loadingStateHtml(this._i18n("ui.loading_library"), { notice: true })
          : `
            <div class="artist-detail-section">
              <div class="artist-section-head">
                <div class="media-section-title">${this._esc(this._i18n("ui.albums"))}</div>
                <div class="artist-section-actions">
                  ${albums.length ? `<button class="media-layout-btn library-flow-toggle artist-album-flow-toggle" data-artist-album-flow-open="1" title="${this._esc(this._artistAlbumFlowLabel())}" aria-label="${this._esc(this._artistAlbumFlowLabel())}">${this._iconSvg("queue_flow")}<span>${this._esc(this._artistAlbumFlowLabel(true))}</span></button>` : ``}
                  ${albums.length ? `<div class="media-detail-count-badge">${this._esc(`${albums.length} ${this._i18n("ui.albums").toLowerCase()}`)}</div>` : ``}
                </div>
              </div>
              ${albumGroups.length
                ? albumGroups.map(([year, yearAlbums]) => `
                    <div class="artist-year-group">
                      <div class="artist-year-title">${this._esc(year)}</div>
                      ${this._mediaItemsListHtml(yearAlbums, "album", { albumBadges: true })}
                    </div>
                  `).join("")
                : `<div class="notice open media-detail-empty">${this._esc(emptyCopy)}</div>`}
            </div>
            <div class="artist-detail-section">
              <div class="media-section-title">${this._esc(this._m("Artist playlist recommendations", "המלצות פלייליסטים לאמן"))}</div>
              ${playlists.length
                ? this._mediaItemsListHtml(playlists, "playlist", { layout: "list" })
                : `<div class="notice open media-detail-empty">${this._esc(this._m("No playlist recommendations were returned yet.", "עדיין לא חזרו המלצות פלייליסטים."))}</div>`}
            </div>
          `}
      </div>
    `;
  }

  async _searchArtistDetailFromInput(sourceEl = null) {
    const input = this.$("artistDetailSearchInput");
    const query = String(input?.value || "").trim();
    if (!query) return false;
    if (this._state.mobileLibraryDetail) this._state.mobileLibraryDetail.artistSearchQuery = query;
    sourceEl?.setAttribute?.("aria-busy", "true");
    try {
      const results = await this._search(query);
      const normalizedQuery = HomeiiMediaQueueFoundation.normalizeComparableText(query);
      const artists = Array.isArray(results.artists) ? results.artists : [];
      const artist = artists.find((item) => HomeiiMediaQueueFoundation.normalizeComparableText(item?.name || "") === normalizedQuery) || artists[0];
      if (!artist) {
        this._toastError(this._m("No artist was found.", "לא נמצא אמן."));
        return false;
      }
      const opened = this._openLibraryMediaDetail({ ...artist, media_type: "artist" }, sourceEl, { replaceCurrentDetail: true });
      if (!opened) this._toastError(this._m("This artist cannot be opened from the returned result.", "לא ניתן לפתוח את האמן מהתוצאה שחזרה."));
      return opened;
    } catch (error) {
      this._toastError(error?.message || this._m("Artist search failed.", "חיפוש האמן נכשל."));
      return false;
    } finally {
      sourceEl?.removeAttribute?.("aria-busy");
    }
  }

  _librarySearchHomeHtml() {
    const q = this._state.mediaQuery || "";
    const voiceSupported = this._isVoiceSearchSupported();
    return `
      <div class="media-home-shell">
        <div class="media-search-zone">
          <div class="media-search-shell">
            <span>${this._iconSvg("search")}</span>
            <input id="mobileMediaSearchInput" type="text" value="${this._esc(q)}" placeholder="${this._i18n("ui.what_would_you_like_to_listen_to")}">
            <button class="media-voice-btn ${voiceSupported ? "" : "unsupported"}" id="mobileVoiceSearchBtn" title="${this._esc(this._i18n("ui.voice_search"))}">${this._iconSvg("mic")}</button>
            <button class="media-search-clear ${q ? "visible" : ""}" id="mobileMediaSearchClear" style="display:${q ? "" : "none"};" title="${this._esc(this._i18n("ui.clear_search"))}">×</button>
          </div>
        </div>
        <div id="mobileMediaSearchResults"></div>
      </div>
    `;
  }

  _quickSearchShellHtml() {
    return `
      <div class="quick-search-shell">
        ${this._librarySearchHomeHtml()}
      </div>
    `;
  }

  _quickSearchRecommendationItems(limit = 8) {
    const seen = new Set();
    const out = [];
    const pushItem = (item = {}, fallbackType = "track") => {
      const normalized = this._normalizeMediaItem({
        ...item,
        name: item.name || item.title || item.media_item?.name || "",
        media_type: item.media_type || item.type || fallbackType,
        image: item.image || item.image_url || item.media_item?.image || item.media_item?.album?.image || "",
      });
      const uri = String(normalized?.uri || item?.uri || "").trim();
      if (!uri || seen.has(uri) || out.length >= limit) return;
      seen.add(uri);
      out.push({
        ...normalized,
        uri,
        name: normalized.name || item.title || item.name || this._i18n("ui.recommended_track"),
        media_type: normalized.media_type || fallbackType,
        image: normalized.image || normalized.image_url || item.image || item.image_url || "",
      });
    };
    this._historyRecommendationItems(limit).forEach((item) => pushItem(item, item.media_type || "track"));
    (this._state.emptyQuickShelfItems || []).forEach((item) => pushItem(item, item.media_type || "album"));
    this._visibleRecentHistoryItems().forEach((item) => pushItem(item, item.media_type || "track"));
    return out.slice(0, limit);
  }

  _quickSearchRecommendationsHtml() {
    const items = this._quickSearchRecommendationItems(8);
    if (!items.length) {
      return `<div class="notice open">${this._esc(this._i18n("ui.recommendations_will_appear_once_homeii_flow_sees_your_queue_or_recent_l"))}</div>`;
    }
    return `
      <div class="media-results quick-search-recommendations">
        <div>
          <div class="media-section-title">${this._esc(this._i18n("ui.recommended"))}</div>
          ${this._mediaItemsListHtml(items, "track", { layout: "list", openDetails: false })}
        </div>
      </div>
    `;
  }

  _speechRecognitionCtor() {
    if (typeof window === "undefined") return null;
    return window.SpeechRecognition || window.webkitSpeechRecognition || null;
  }

  _isVoiceSearchSupported() {
    return !!this._speechRecognitionCtor();
  }

  _normalizeSmartVoiceCandidates(results = {}) {
    const order = [
      ["playlists", "playlist"],
      ["tracks", "track"],
      ["albums", "album"],
      ["artists", "artist"],
      ["radio", "radio"],
      ["podcasts", "podcast"],
    ];
    const items = [];
    order.forEach(([groupKey, mediaType]) => {
      const group = Array.isArray(results?.[groupKey]) ? results[groupKey] : [];
      group.forEach((item) => {
        const uri = String(item?.uri || item?.media_item?.uri || "").trim();
        if (!uri) return;
        const mediaItem = item?.media_item || {};
        const artist = this._artistName(item)
          || this._artistName(mediaItem)
          || item?.artist
          || item?.artist_str
          || item?.media_artist
          || mediaItem?.artist
          || mediaItem?.artist_str
          || mediaItem?.media_artist
          || "";
        items.push({
          uri,
          media_type: this._voiceAssistantCanonicalMediaType(item?.media_type || item?.type || mediaType, mediaType),
          name: item?.name || item?.title || mediaItem?.name || mediaItem?.title || uri,
          artist,
          album: item?.album?.name || item?.album || mediaItem?.album?.name || mediaItem?.album || "",
          image: this._artUrl(item) || item?.image || item?.image_url || mediaItem?.image || mediaItem?.image_url || "",
          _homeiiVoiceFocused: item?._homeiiVoiceFocused === true,
        });
      });
    });
    return items;
  }

  _currentSmartVoiceCandidate() {
    const state = this._state.mobileSmartVoice || null;
    if (!state?.candidates?.length) return null;
    const index = Math.max(0, Math.min(state.candidates.length - 1, Number(state.index || 0)));
    return state.candidates[index] || null;
  }

  _stopSmartVoiceCountdown() {
    clearInterval(this._mobileSmartVoiceTimer);
    this._mobileSmartVoiceTimer = null;
  }

  _closeSmartVoiceConfirm() {
    this._stopSmartVoiceCountdown();
    this._state.mobileSmartVoice = null;
    this.$("mobileSmartVoiceModal")?.classList.remove("open");
    const host = this.$("mobileSmartVoiceSheet");
    if (host) host.innerHTML = "";
  }

  _renderSmartVoiceConfirm() {
    const host = this.$("mobileSmartVoiceSheet");
    const state = this._state.mobileSmartVoice || null;
    const candidate = this._currentSmartVoiceCandidate();
    if (!host || !state || !candidate) return;
    const targetName = this._selectedPlayerName();
    const subtitle = [candidate.artist, candidate.album].filter(Boolean).join(" · ");
      host.innerHTML = `
      <div class="smart-voice-head">
        <div class="smart-voice-brand" aria-hidden="true">${this._tabletBrandSignatureHtml("smart-voice-logo")}</div>
        <div class="smart-voice-title">${this._esc(this._i18n("ui.smart_voice_selection"))}</div>
        <div class="smart-voice-target">${this._esc(this._i18n("ui.player_2"))}: ${this._esc(targetName)}</div>
      </div>
      <div class="smart-voice-card">
        <div class="smart-voice-chip">${this._iconSvg("mic")}<span>${this._esc(state.query || "")}</span></div>
        <div class="smart-voice-name">${this._esc(candidate.name || "")}</div>
        <div class="smart-voice-sub">${this._esc(subtitle || this._i18n("ui.ready_to_play"))}</div>
        <div class="smart-voice-countdown"><span>${this._esc(String(state.countdown || 0))}</span></div>
      </div>
      <div class="confirm-actions smart-voice-actions">
        <button class="menu-item" id="smartVoicePlayNowBtn">${this._esc(this._i18n("ui.play"))}</button>
        <button class="menu-item" id="smartVoiceOtherBtn">${this._esc(this._i18n("ui.other"))}</button>
        <button class="menu-item" id="smartVoiceCancelBtn">${this._esc(this._i18n("ui.cancel_2"))}</button>
      </div>
    `;
    host.querySelector("#smartVoiceCancelBtn")?.addEventListener("click", () => this._closeSmartVoiceConfirm());
    host.querySelector("#smartVoiceOtherBtn")?.addEventListener("click", () => this._chooseAnotherSmartVoiceCandidate());
    host.querySelector("#smartVoicePlayNowBtn")?.addEventListener("click", () => this._playSmartVoiceCandidateNow());
  }

  _openSmartVoiceConfirm(query = "", candidates = []) {
    if (!Array.isArray(candidates) || !candidates.length) {
      this._toastError(this._i18n("ui.no_matching_content_was_found"));
      return;
    }
    this._state.mobileSmartVoice = {
      query,
      candidates,
      index: 0,
      countdown: 5,
    };
    this.$("mobileSmartVoiceModal")?.classList.add("open");
    this._renderSmartVoiceConfirm();
    this._stopSmartVoiceCountdown();
    this._mobileSmartVoiceTimer = window.setInterval(() => {
      const state = this._state.mobileSmartVoice;
      if (!state) return this._closeSmartVoiceConfirm();
      state.countdown = Number(state.countdown || 0) - 1;
      if (state.countdown <= 0) {
        this._playSmartVoiceCandidateNow();
        return;
      }
      this._renderSmartVoiceConfirm();
    }, 1000);
  }

  _chooseAnotherSmartVoiceCandidate() {
    const state = this._state.mobileSmartVoice;
    if (!state?.candidates?.length) return;
    if (state.candidates.length === 1) {
      state.countdown = 5;
      this._renderSmartVoiceConfirm();
      return;
    }
    const currentUri = this._currentSmartVoiceCandidate()?.uri || "";
    const pool = state.candidates.filter((item) => item?.uri && item.uri !== currentUri);
    const next = pool[Math.floor(Math.random() * pool.length)] || state.candidates[(Number(state.index || 0) + 1) % state.candidates.length];
    const nextIndex = Math.max(0, state.candidates.findIndex((item) => item?.uri === next?.uri));
    state.index = nextIndex;
    state.countdown = 5;
    this._hapticTap([8]);
    this._renderSmartVoiceConfirm();
  }

  async _playSmartVoiceCandidateNow() {
    const candidate = this._currentSmartVoiceCandidate();
    if (!candidate?.uri) {
      this._closeSmartVoiceConfirm();
      return;
    }
    this._stopSmartVoiceCountdown();
    await this._playMedia(candidate.uri, candidate.media_type || "playlist", "play", { label: candidate.name || "" });
    this._closeSmartVoiceConfirm();
    this._closeMobileMenu();
  }

  _voiceAssistantRecognitionLanguage() {
    if (this._isHebrew()) return "he-IL";
    try {
      const languages = Array.isArray(window.navigator?.languages)
        ? window.navigator.languages
        : [window.navigator?.language || ""];
      if (languages.some((language) => String(language || "").toLowerCase().startsWith("he"))) return "he-IL";
    } catch (_) {}
    return "en-US";
  }

  _voiceAssistantAssistLanguage() {
    return this._voiceAssistantRecognitionLanguage().toLowerCase().startsWith("he") ? "he" : "en";
  }

  _normalizeVoiceCommandText(value = "") {
    return HomeiiVoiceMatchingFoundation.normalizeVoiceCommandText(value);
  }

  _voiceCommandHasAny(normalizedText = "", terms = []) {
    return HomeiiVoiceMatchingFoundation.voiceCommandHasAny(normalizedText, terms);
  }

  _voiceAssistantAliasIndex(normalizedText = "", alias = "") {
    return HomeiiVoiceMatchingFoundation.voiceAssistantAliasIndex(normalizedText, alias);
  }

  _voiceAssistantPlayerPool() {
    this._loadPlayers();
    return (this._state.players || [])
      .filter((player) => this._isMusicAssistantPlayer(player))
      .filter((player) => !this._isLikelyBrowserPlayer(player) || this._isLocalSendspinPlayer(player))
      .filter((player) => this._isAvailableThisDevicePlayer(player));
  }

  _voiceAssistantPlayerAliases(player = null) {
    if (!player) return [];
    const attrs = player.attributes || {};
    const raw = player.__homeiiRawPlayer || {};
    const candidates = [
      player.entity_id,
      String(player.entity_id || "").replace(/^media_player\./, "").replace(/_/g, " "),
      attrs.friendly_name,
      attrs.name,
      attrs.display_name,
      attrs.mass_player_id,
      attrs.player_id,
      raw.name,
      raw.display_name,
      raw.friendly_name,
    ];
    const aliases = [];
    candidates.forEach((value) => {
      const alias = this._normalizeVoiceCommandText(value);
      if (!alias || alias.length < 2) return;
      if (["media player", "music assistant", "homeii direct", "homeii flow"].includes(alias)) return;
      if (!aliases.includes(alias)) aliases.push(alias);
    });
    return aliases.sort((left, right) => right.length - left.length);
  }

  _voiceAssistantMentionedPlayers(transcript = "") {
    const normalized = this._normalizeVoiceCommandText(transcript);
    if (!normalized) return [];
    const matches = [];
    this._voiceAssistantPlayerPool().forEach((player) => {
      this._voiceAssistantPlayerAliases(player).forEach((alias) => {
        const index = this._voiceAssistantAliasIndex(normalized, alias);
        if (index < 0) return;
        matches.push({ player, alias, index, end: index + alias.length });
      });
    });
    const ranges = [];
    const seen = new Set();
    return matches
      .sort((left, right) => left.index - right.index || right.alias.length - left.alias.length)
      .filter((match) => {
        if (!match.player?.entity_id || seen.has(match.player.entity_id)) return false;
        const overlaps = ranges.some(([start, end]) => match.index < end && match.end > start);
        if (overlaps) return false;
        seen.add(match.player.entity_id);
        ranges.push([match.index, match.end]);
        return true;
      })
      .map((match) => match.player);
  }

  _voiceAssistantDefaultPlayer(excludeEntityIds = [], { allowIdle = false } = {}) {
    const excluded = new Set((Array.isArray(excludeEntityIds) ? excludeEntityIds : []).filter(Boolean));
    const players = this._voiceAssistantPlayerPool();
    const selected = this._getSelectedPlayer();
    if (selected?.entity_id && !excluded.has(selected.entity_id) && players.some((player) => player.entity_id === selected.entity_id)) return selected;
    return players.find((player) => player.state === "playing" && !excluded.has(player.entity_id))
      || (allowIdle ? players.find((player) => !excluded.has(player.entity_id)) : null)
      || null;
  }

  _resolveVoiceAssistantTarget(transcript = "") {
    const normalized = this._normalizeVoiceCommandText(transcript);
    const players = this._voiceAssistantPlayerPool();
    const explicit = players.find((player) => this._voiceAssistantPlayerAliases(player)
      .some((alias) => normalized.includes(alias)));
    if (explicit) return { player: explicit, explicit: true };
    const selected = this._getSelectedPlayer();
    if (selected && players.some((player) => player.entity_id === selected.entity_id)) {
      return { player: selected, explicit: false };
    }
    return {
      player: players.find((player) => player.state === "playing") || players[0] || null,
      explicit: false,
    };
  }

  _stripVoiceAssistantPlayerAliases(text = "", player = null) {
    return HomeiiVoiceMatchingFoundation.stripVoiceAssistantPlayerAliases(text, this._voiceAssistantPlayerAliases(player));
  }

  _extractVoiceAssistantMusicQuery(transcript = "", player = null) {
    return HomeiiVoiceMatchingFoundation.extractVoiceAssistantMusicQuery(transcript, this._voiceAssistantPlayerAliases(player));
  }

  _voiceAssistantQueueIntent(transcript = "") {
    const normalized = this._normalizeVoiceCommandText(transcript);
    if (!normalized) return null;
    const hasQueueWord = this._voiceCommandHasAny(normalized, ["queue", "current queue", "play queue", "music queue", "תור", "התור", "תור הניגון", "רשימת הניגון"]);
    const hasTransferWord = this._voiceCommandHasAny(normalized, ["transfer", "move", "send", "move queue", "transfer queue", "העבר", "להעביר", "תעביר", "העבירי", "שלח", "לשלוח"]);
    const mentioned = this._voiceAssistantMentionedPlayers(transcript);
    if (!hasTransferWord || (!hasQueueWord && mentioned.length < 2)) return null;
    let sourcePlayer = null;
    let targetPlayer = null;
    if (mentioned.length >= 2) {
      sourcePlayer = mentioned[0];
      targetPlayer = mentioned[1];
    } else if (mentioned.length === 1) {
      targetPlayer = mentioned[0];
      sourcePlayer = this._voiceAssistantDefaultPlayer([targetPlayer.entity_id]);
    }
    return {
      type: "queue_transfer",
      sourcePlayerId: sourcePlayer?.entity_id || "",
      targetPlayerId: targetPlayer?.entity_id || "",
    };
  }

  _voiceAssistantSpeakerGroupIntent(transcript = "") {
    const normalized = this._normalizeVoiceCommandText(transcript);
    if (!normalized) return null;
    const mentioned = this._voiceAssistantMentionedPlayers(transcript);
    const hasSpeakerWord = this._voiceCommandHasAny(normalized, ["speaker", "speakers", "player", "players", "room", "rooms", "רמקול", "רמקולים", "נגן", "נגנים", "חדר", "חדרים"]);
    const hasGroupWord = this._voiceCommandHasAny(normalized, ["group", "group speakers", "join", "connect speakers", "link speakers", "ungroup", "disconnect group", "speaker group", "קבוצה", "קבוצת נגנים", "קבוצת רמקולים", "חבר רמקולים", "חיבור רמקולים", "ניתוק רמקולים"]);
    const hasDisconnectWord = this._voiceCommandHasAny(normalized, ["ungroup", "disconnect group", "disconnect speakers", "unjoin", "clear group", "נתק", "תנתק", "לנתק", "הפרד", "להפריד", "בטל קבוצה"]);
    const hasConnectWord = this._voiceCommandHasAny(normalized, ["group", "join", "connect", "link", "pair", "activate speakers", "start speakers", "חבר", "תחבר", "לחבר", "צרף", "לצרף", "קבץ", "לקבץ"]);
    const allGroups = this._voiceCommandHasAny(normalized, ["all groups", "all speakers", "all players", "כל הקבוצות", "כל הרמקולים", "כל הנגנים", "כולם"]);
    const speakerCountHint = this._voiceCommandHasAny(normalized, ["two speakers", "2 speakers", "שני רמקולים", "2 רמקולים", "שני נגנים", "2 נגנים"]);
    if (hasDisconnectWord && (hasGroupWord || hasSpeakerWord || allGroups || mentioned.length)) {
      if (allGroups) return { type: "group_disconnect_all" };
      const player = mentioned[0] || this._voiceAssistantDefaultPlayer();
      return { type: "group_disconnect", playerId: player?.entity_id || "" };
    }
    if (!hasConnectWord || (!hasGroupWord && !hasSpeakerWord && !speakerCountHint && mentioned.length < 2)) return null;
    let primaryPlayer = null;
    let memberPlayers = [];
    if (mentioned.length >= 2) {
      primaryPlayer = mentioned[0];
      memberPlayers = mentioned.slice(1);
    } else if (mentioned.length === 1) {
      primaryPlayer = this._voiceAssistantDefaultPlayer([mentioned[0].entity_id]);
      memberPlayers = primaryPlayer ? [mentioned[0]] : [];
    }
    return {
      type: "group_connect",
      primaryPlayerId: primaryPlayer?.entity_id || "",
      memberPlayerIds: memberPlayers.map((player) => player?.entity_id).filter(Boolean),
    };
  }

  _voiceAssistantVolumeIntent(normalizedText = "") {
    return HomeiiVoiceMatchingFoundation.voiceAssistantVolumeIntent(normalizedText);
  }

  _voiceAssistantCommandIntent(transcript = "", player = null, { forceMusic = false } = {}) {
    const normalized = this._normalizeVoiceCommandText(transcript);
    if (!normalized) return { type: "unknown" };
    const queueIntent = this._voiceAssistantQueueIntent(transcript);
    if (queueIntent) return queueIntent;
    const speakerGroupIntent = this._voiceAssistantSpeakerGroupIntent(transcript);
    if (speakerGroupIntent) return speakerGroupIntent;
    const volumeIntent = this._voiceAssistantVolumeIntent(normalized);
    if (volumeIntent) return volumeIntent;
    if (this._voiceCommandHasAny(normalized, ["next", "skip", "הבא", "דלג", "תדלג", "הרצועה הבאה", "השיר הבא"])) return { type: "next" };
    if (this._voiceCommandHasAny(normalized, ["previous", "back", "last song", "הקודם", "אחורה", "הרצועה הקודמת", "השיר הקודם"])) return { type: "previous" };
    if (this._voiceCommandHasAny(normalized, ["pause", "hold", "השהה", "תשהה", "השהיה"])) return { type: "pause" };
    if (this._voiceCommandHasAny(normalized, ["stop", "turn off music", "עצור", "תעצור", "עצירה", "כבה מוזיקה"])) return { type: "stop" };
    if (this._voiceCommandHasAny(normalized, ["resume", "continue", "play music", "המשך", "תמשיך", "המשך לנגן"])) return { type: "resume" };
    const hasMusicVerb = this._voiceCommandHasAny(normalized, [
      "play",
      "put on",
      "listen to",
      "start music",
      "נגן",
      "תנגן",
      "נגני",
      "השמע",
      "תשמיע",
      "השמיעי",
      "שים",
      "שימי",
      "להאזין",
      "הפעל",
      "תפעיל",
      "הפעילי",
    ]);
    if (hasMusicVerb || forceMusic) {
      const query = this._extractVoiceAssistantMusicQuery(transcript, player);
      return query ? { type: "music", query } : { type: "resume" };
    }
    return { type: "unknown" };
  }

  _voiceAssistantRequestedMediaType(query = "") {
    return HomeiiVoiceMatchingFoundation.voiceAssistantRequestedMediaType(query);
  }

  _voiceAssistantCanonicalMediaType(value = "", fallback = "track") {
    return HomeiiVoiceMatchingFoundation.voiceAssistantCanonicalMediaType(value, fallback);
  }

  _voiceAssistantImportantMusicTokens(value = "") {
    return HomeiiVoiceMatchingFoundation.voiceAssistantImportantMusicTokens(value);
  }

  _voiceAssistantCleanMusicPhrase(value = "", { allowStopWordFallback = false } = {}) {
    return HomeiiVoiceMatchingFoundation.voiceAssistantCleanMusicPhrase(value, { allowStopWordFallback });
  }

  _voiceAssistantTransliterateHebrewToken(value = "") {
    return HomeiiVoiceMatchingFoundation.voiceAssistantTransliterateHebrewToken(value);
  }

  _voiceAssistantLatinPhoneticKeys(value = "") {
    return HomeiiVoiceMatchingFoundation.voiceAssistantLatinPhoneticKeys(value);
  }

  _voiceAssistantTextHasToken(normalizedText = "", token = "") {
    return HomeiiVoiceMatchingFoundation.voiceAssistantTextHasToken(normalizedText, token);
  }

  _voiceAssistantMatchedTokenCount(tokens = [], normalizedText = "") {
    return HomeiiVoiceMatchingFoundation.voiceAssistantMatchedTokenCount(tokens, normalizedText);
  }

  _voiceAssistantMusicQueryParts(query = "") {
    return HomeiiVoiceMatchingFoundation.voiceAssistantMusicQueryParts(query);
  }

  _voiceAssistantFocusedMusicQuery(query = "") {
    return HomeiiVoiceMatchingFoundation.voiceAssistantFocusedMusicQuery(query);
  }

  async _voiceAssistantFocusedMusicSearch(query = "", mediaType = "track") {
    const safeQuery = String(query || "").trim();
    const type = this._voiceAssistantCanonicalMediaType(mediaType, "track");
    if (!safeQuery) return this._emptySearchResults();
    try {
      const raw = await this._callService("search", { name: safeQuery, query: safeQuery, limit: 30, media_type: [type] });
      return this._normalizeSearchResponse(raw);
    } catch (_) {
      try {
        const raw2 = await this._callService("search", { name: safeQuery, limit: 30, media_type: type });
        return this._normalizeSearchResponse(raw2);
      } catch (_) {}
    }
    return this._emptySearchResults();
  }

  _markVoiceAssistantFocusedResults(results = {}) {
    const out = this._emptySearchResults();
    Object.keys(out).forEach((group) => {
      out[group] = (Array.isArray(results?.[group]) ? results[group] : [])
        .map((item) => ({ ...item, _homeiiVoiceFocused: true }));
    });
    return out;
  }

  _voiceAssistantCandidateScore(candidate = {}, query = "", request = this._voiceAssistantRequestedMediaType(query)) {
    return HomeiiVoiceMatchingFoundation.voiceAssistantCandidateScore(candidate, query, request);
  }

  _voiceAssistantCandidateMatch(candidate = {}, query = "", request = this._voiceAssistantRequestedMediaType(query), index = 0) {
    return HomeiiVoiceMatchingFoundation.voiceAssistantCandidateMatch(candidate, query, request, index);
  }

  _voiceAssistantRankedCandidates(results = {}, query = "") {
    return HomeiiVoiceMatchingFoundation.voiceAssistantRankedCandidates(
      this._normalizeSmartVoiceCandidates(results),
      query,
    );
  }

  _voiceAssistantBestCandidate(results = {}, query = "") {
    return HomeiiVoiceMatchingFoundation.voiceAssistantBestCandidate(
      this._normalizeSmartVoiceCandidates(results),
      query,
    );
  }

  async _playVoiceAssistantMusic(query = "", player = null) {
    const target = player || this._getSelectedPlayer();
    if (!target?.entity_id) {
      const message = this._i18n("ui.voice_command_no_player");
      this._toastError(message);
      return { handled: true, ok: false, message };
    }
    const safeQuery = String(query || "").trim();
    if (!safeQuery) {
      const message = this._i18n("ui.voice_command_not_understood");
      this._toastError(message);
      return { handled: true, ok: false, message };
    }
    this._toast(this._i18n("ui.voice_music_searching", { query: safeQuery }));
    try {
      let results = this._emptySearchResults();
      try {
        results = await this._search(safeQuery);
      } catch (error) {
        this._debugLog?.("warn", "[HOMEii Voice] Music search failed", { query: safeQuery, error });
      }
      const requested = this._voiceAssistantRequestedMediaType(safeQuery);
      const focusedQuery = this._voiceAssistantFocusedMusicQuery(safeQuery);
      const focusedType = this._voiceAssistantCanonicalMediaType(requested?.type || "track", "track");
      if (!this._hasSearchResults(results) && focusedQuery && focusedType) {
        const focusedResults = await this._voiceAssistantFocusedMusicSearch(focusedQuery, focusedType);
        results = this._mergeSearchResults(this._markVoiceAssistantFocusedResults(focusedResults), results);
      }
      const rankedCandidates = this._voiceAssistantRankedCandidates(results, safeQuery);
      const candidate = rankedCandidates.find((match) => match.accepted && match.candidate?.uri)?.candidate
        || rankedCandidates.find((match) => match.candidate?.uri)?.candidate
        || this._normalizeSmartVoiceCandidates(results).find((item) => item?.uri)
        || null;
      if (!candidate?.uri) {
        const message = this._i18n("ui.no_matching_content_was_found");
        this._toastError(message);
        return { handled: true, ok: false, message };
      }
      if (target.entity_id !== this._state.selectedPlayer) this._selectPlayer(target.entity_id, true);
      const title = candidate.name || safeQuery;
      this._updateVoiceAssistantDialog({ status: "processing", response: this._i18n("ui.voice_starting_playback", { title }) });
      const mediaType = this._voiceAssistantCanonicalMediaType(candidate.media_type || focusedType, focusedType);
      const played = await this._playMediaOnPlayer(target.entity_id, candidate.uri, mediaType, "play", {
        label: title,
        silent: true,
      });
      if (!played) {
        const message = this._i18n("ui.could_not_play_label", { label: title });
        this._toastError(message);
        return { handled: true, ok: false, message };
      }
      return {
        handled: true,
        ok: true,
        message: this._i18n("ui.voice_playing_result", { title }),
        autoCloseMs: 1400,
      };
    } catch (error) {
      const message = error?.message || this._i18n("ui.voice_command_failed");
      this._toastError(message);
      return { handled: true, ok: false, message };
    }
  }

  async _runVoiceAssistantPlayerManagementCommand(intent = {}) {
    const type = String(intent?.type || "");
    if (!["queue_transfer", "group_connect", "group_disconnect", "group_disconnect_all"].includes(type)) return null;
    try {
      if (type === "queue_transfer") {
        const sourcePlayerId = String(intent.sourcePlayerId || "").trim();
        const targetPlayerId = String(intent.targetPlayerId || "").trim();
        if (!sourcePlayerId || !targetPlayerId || sourcePlayerId === targetPlayerId) {
          const message = this._i18n("ui.voice_queue_transfer_needs_players");
          this._toastError(message);
          return { handled: true, ok: false, message };
        }
        const ok = await this._transferQueueBetween(sourcePlayerId, targetPlayerId, { silent: true });
        const source = this._controlRoomPlayerName(sourcePlayerId);
        const target = this._controlRoomPlayerName(targetPlayerId);
        const message = ok
          ? this._i18n("ui.voice_queue_transferred_between", { source, target })
          : this._i18n("ui.queue_action_failed");
        (ok ? this._toastSuccess : this._toastError).call(this, message);
        return { handled: true, ok, message, autoCloseMs: ok ? 1400 : 0 };
      }
      if (type === "group_connect") {
        const primaryPlayerId = String(intent.primaryPlayerId || "").trim();
        const memberPlayerIds = [...new Set((Array.isArray(intent.memberPlayerIds) ? intent.memberPlayerIds : []).filter((id) => id && id !== primaryPlayerId))];
        if (!primaryPlayerId || !memberPlayerIds.length) {
          const message = this._i18n("ui.voice_group_connect_needs_players");
          this._toastError(message);
          return { handled: true, ok: false, message };
        }
        const grouped = await this._applySpeakerGroupFor(primaryPlayerId, memberPlayerIds);
        if (!grouped) {
          const message = this._i18n("ui.select_at_least_two_players_to_create_a_group");
          this._toastError(message);
          return { handled: true, ok: false, message };
        }
        const primary = this._controlRoomPlayerName(primaryPlayerId);
        const members = memberPlayerIds.map((entityId) => this._controlRoomPlayerName(entityId)).join(", ");
        const message = this._i18n("ui.voice_group_connected_players", { primary, members });
        this._toastSuccess(message);
        setTimeout(() => {
          this._loadPlayers();
          this._refreshGroupingState();
          if (this._state.menuOpen) this._renderMobileMenu();
        }, 550);
        return { handled: true, ok: true, message, autoCloseMs: 1400 };
      }
      if (type === "group_disconnect") {
        const playerId = String(intent.playerId || "").trim();
        if (!playerId) {
          const message = this._i18n("ui.voice_group_disconnect_needs_player");
          this._toastError(message);
          return { handled: true, ok: false, message };
        }
        const ok = await this._clearSpeakerGroupFor(playerId);
        const player = this._controlRoomPlayerName(playerId);
        const message = ok
          ? this._i18n("ui.voice_group_disconnected_player", { player })
          : this._i18n("ui.player_groups_could_not_be_disconnected");
        (ok ? this._toastSuccess : this._toastError).call(this, message);
        return { handled: true, ok, message, autoCloseMs: ok ? 1200 : 0 };
      }
      if (type === "group_disconnect_all") {
        const result = await this._disconnectPlayerGroups({ silent: true });
        const ok = result?.ok !== false;
        const message = ok
          ? (Number(result?.count || 0) > 0 ? this._i18n("ui.all_player_groups_disconnected") : this._i18n("ui.no_player_groups_to_disconnect"))
          : this._i18n("ui.player_groups_could_not_be_disconnected");
        (ok ? this._toastSuccess : this._toastError).call(this, message);
        return { handled: true, ok, message, autoCloseMs: ok ? 1200 : 0 };
      }
    } catch (error) {
      const message = error?.message || this._i18n("ui.voice_command_failed");
      this._toastError(message);
      return { handled: true, ok: false, message };
    }
    return null;
  }

  async _runVoiceAssistantMediaCommand(intent = {}, player = null) {
    const playerManagementResult = await this._runVoiceAssistantPlayerManagementCommand(intent);
    if (playerManagementResult) return playerManagementResult;
    if (!player?.entity_id) {
      const message = this._i18n("ui.voice_command_no_player");
      this._toastError(message);
      return { handled: true, ok: false, message };
    }
    const entityId = player.entity_id;
    try {
      if (entityId !== this._state.selectedPlayer) this._selectPlayer(entityId, true);
      if (intent.type === "next" || intent.type === "previous") {
        await this._playerCmdFor(entityId, intent.type === "previous" ? "previous" : "next");
      } else if (intent.type === "pause") {
        await this._callHomeiiEnginePlayerCommand(entityId, "pause");
      } else if (intent.type === "resume") {
        await this._callHomeiiEnginePlayerCommand(entityId, "play");
      } else if (intent.type === "stop") {
        await this._callHomeiiEnginePlayerCommand(entityId, "stop");
      } else if (intent.type === "mute" || intent.type === "unmute") {
        const shouldMute = intent.type === "mute";
        if (this._isMuted(player) !== shouldMute && !await this._toggleMuteFor(entityId)) throw new Error(this._i18n("ui.mute_command_failed"));
      } else if (intent.type === "volume_set") {
        if (!await this._setPlayerVolumeFor(entityId, intent.level)) throw new Error(this._i18n("ui.playback_command_failed"));
      } else if (intent.type === "volume_delta") {
        const current = Number(player.attributes?.volume_level);
        const base = Number.isFinite(current) ? current : 0.35;
        if (!await this._setPlayerVolumeFor(entityId, Math.max(0, Math.min(1, base + Number(intent.delta || 0))))) throw new Error(this._i18n("ui.playback_command_failed"));
      } else {
        return { handled: false, ok: false, message: "" };
      }
      const actionLabel = ({
        next: this._m("next track", "הרצועה הבאה"),
        previous: this._m("previous track", "הרצועה הקודמת"),
        pause: this._m("pause", "השהיה"),
        resume: this._m("play", "ניגון"),
        stop: this._m("stop", "עצירה"),
        mute: this._m("mute", "השתקה"),
        unmute: this._m("unmute", "ביטול השתקה"),
        volume_set: this._m("volume", "עוצמת קול"),
        volume_delta: this._m("volume", "עוצמת קול"),
      })[intent.type] || this._i18n("ui.voice_command_executed");
      const message = this._i18n("ui.voice_command_completed_action", { action: actionLabel });
      this._toastSuccess(message);
      return { handled: true, ok: true, message, autoCloseMs: 1200 };
    } catch (error) {
      const message = error?.message || this._i18n("ui.voice_command_failed");
      this._toastError(message);
      return { handled: true, ok: false, message };
    }
  }

  _assistResponseSpeech(response = null) {
    const candidates = [
      response?.response?.speech?.plain?.speech,
      response?.response?.speech?.plain,
      response?.speech?.plain?.speech,
      response?.speech?.plain,
      response?.response?.speech,
      response?.speech,
    ];
    const found = candidates.find((value) => typeof value === "string" && value.trim());
    return String(found || "").trim();
  }

  async _sendVoiceCommandToAssist(transcript = "") {
    const text = String(transcript || "").trim();
    if (!text) return false;
    const payload = {
      type: "conversation/process",
      text,
      language: this._voiceAssistantAssistLanguage(),
    };
    const agentId = this._voiceAssistantAgentId();
    if (agentId) payload.agent_id = agentId;
    try {
      const response = await this._callHomeAssistantWs(payload);
      const speech = this._assistResponseSpeech(response);
      if (speech) this._toast(speech, "info", { duration: 6500 });
      else this._toastSuccess(this._i18n("ui.voice_command_sent"));
      return {
        handled: true,
        ok: true,
        message: speech || this._i18n("ui.voice_command_sent"),
      };
    } catch (error) {
      const message = error?.message || this._i18n("ui.voice_command_failed");
      this._toastError(message);
      return { handled: true, ok: false, message };
    }
  }

  async _handleVoiceAssistantTranscript(transcript = "") {
    const text = String(transcript || "").trim();
    if (!text) {
      const message = this._i18n("ui.no_speech_was_captured");
      this._toastError(message);
      return { handled: true, ok: false, message };
    }
    const mode = this._voiceAssistantMode();
    const target = this._resolveVoiceAssistantTarget(text);
    if (mode !== "assist") {
      const intent = this._voiceAssistantCommandIntent(text, target.player, { forceMusic: mode === "music" });
      if (intent.type === "music") {
        return this._playVoiceAssistantMusic(intent.query, target.player);
      }
      if (intent.type !== "unknown") {
        return this._runVoiceAssistantMediaCommand(intent, target.player);
      }
    }
    if (mode !== "music") {
      return this._sendVoiceCommandToAssist(text);
    }
    const message = this._i18n("ui.voice_command_not_understood");
    this._toastError(message);
    return { handled: true, ok: false, message };
  }

  _stopVoiceAssistantRecognition() {
    clearTimeout(this._voiceAssistantRecognitionTimer);
    this._voiceAssistantRecognitionTimer = null;
    const recognition = this._voiceAssistantRecognition;
    this._voiceAssistantRecognition = null;
    this._state.voiceAssistantListening = false;
    this.$("mobileVoiceAssistantBtn")?.classList.remove("listening");
    this.$("emptyVoiceAssistantBtn")?.classList.remove("listening");
    this.$("screensaverVoiceBtn")?.classList.remove("listening");
    try {
      if (recognition) recognition.__homeiiCancelled = true;
      recognition?.abort?.();
    } catch {}
  }

  _voiceAssistantStatusLabel(status = "") {
    const safeStatus = String(status || "").toLowerCase();
    if (safeStatus === "listening") return this._i18n("ui.voice_listening_status");
    if (safeStatus === "processing") return this._i18n("ui.voice_processing_status");
    if (safeStatus === "success") return this._i18n("ui.voice_done_status");
    if (safeStatus === "error") return this._i18n("ui.voice_error_status");
    return this._i18n("ui.voice_ready_status");
  }

  _voiceAssistantDialogIcon(status = "") {
    return String(status || "").toLowerCase() === "error" ? "close" : "mic";
  }

  _openVoiceAssistantDialog(status = "listening", updates = {}) {
    clearTimeout(this._voiceAssistantDialogCloseTimer);
    this._state.voiceAssistantDialogOpen = true;
    this._state.voiceAssistantKeepScreensaver = updates.keepScreensaver === true;
    this._state.voiceAssistantDialogStatus = status;
    this._state.voiceAssistantTranscript = updates.transcript ?? "";
    this._state.voiceAssistantResponse = updates.response ?? "";
    this._syncVoiceAssistantDialog();
  }

  _updateVoiceAssistantDialog(updates = {}) {
    if (updates.status && !["success", "error"].includes(String(updates.status || "").toLowerCase())) {
      clearTimeout(this._voiceAssistantDialogCloseTimer);
    }
    this._state.voiceAssistantDialogOpen = updates.open ?? this._state.voiceAssistantDialogOpen ?? true;
    if (updates.keepScreensaver !== undefined) this._state.voiceAssistantKeepScreensaver = updates.keepScreensaver === true;
    if (updates.status !== undefined) this._state.voiceAssistantDialogStatus = updates.status;
    if (updates.transcript !== undefined) this._state.voiceAssistantTranscript = updates.transcript;
    if (updates.response !== undefined) this._state.voiceAssistantResponse = updates.response;
    this._syncVoiceAssistantDialog();
  }

  _closeVoiceAssistantDialog({ stopRecognition = true } = {}) {
    clearTimeout(this._voiceAssistantDialogCloseTimer);
    clearTimeout(this._voiceAssistantRecognitionTimer);
    this._voiceAssistantRecognitionTimer = null;
    if (stopRecognition) this._stopVoiceAssistantRecognition();
    this._state.voiceAssistantDialogOpen = false;
    this._state.voiceAssistantKeepScreensaver = false;
    this._syncVoiceAssistantDialog();
  }

  _scheduleVoiceAssistantDialogClose(delayMs = 1500) {
    clearTimeout(this._voiceAssistantDialogCloseTimer);
    this._voiceAssistantDialogCloseTimer = setTimeout(() => {
      this._voiceAssistantDialogCloseTimer = null;
      this._closeVoiceAssistantDialog({ stopRecognition: false });
    }, Math.max(500, Number(delayMs) || 1500));
  }

  _syncVoiceAssistantDialog() {
    const host = this.$("voiceAssistantDialog");
    if (!host) return;
    const open = !!this._state.voiceAssistantDialogOpen;
    const status = String(this._state.voiceAssistantDialogStatus || "ready").toLowerCase();
    const transcript = String(this._state.voiceAssistantTranscript || "").trim();
    const response = String(this._state.voiceAssistantResponse || "").trim();
    const keepScreensaver = this._state.voiceAssistantKeepScreensaver === true;
    host.className = `voice-assistant-dialog ${open ? "open" : ""} ${keepScreensaver ? "keep-screensaver" : ""} status-${this._esc(status)}`;
    if (!open) {
      host.innerHTML = "";
      return;
    }
    if (!host.querySelector(".voice-assistant-panel")) {
      host.innerHTML = `
      <div class="voice-assistant-panel" data-screensaver-dialog role="dialog" aria-label="FLOW ASSISTANT">
        <div class="voice-assistant-head">
          <div class="voice-assistant-title-row">
            <span class="voice-assistant-icon" id="voiceAssistantDialogIconSlot"></span>
            <span class="voice-assistant-copy">
              <span class="voice-assistant-brand" aria-hidden="true">${this._tabletBrandSignatureHtml("voice-assistant-logo")}</span>
              <span class="voice-assistant-title">FLOW ASSISTANT</span>
              <span class="voice-assistant-status" id="voiceAssistantDialogStatus"></span>
            </span>
          </div>
          <button class="voice-assistant-close" id="voiceAssistantDialogClose" title="${this._esc(this._i18n("ui.close"))}">${this._iconSvg("close")}</button>
        </div>
        <div class="voice-assistant-meter" aria-hidden="true"><span></span></div>
        <div class="voice-assistant-wave" aria-hidden="true">
          <span></span><span></span><span></span><span></span><span></span>
        </div>
        <div class="voice-assistant-lines">
          <div class="voice-assistant-line">
            <span class="voice-assistant-line-label">${this._esc(this._i18n("ui.voice_transcript"))}</span>
            <span class="voice-assistant-line-text" id="voiceAssistantDialogTranscript"></span>
          </div>
          <div class="voice-assistant-line">
            <span class="voice-assistant-line-label">${this._esc(this._i18n("ui.voice_response"))}</span>
            <span class="voice-assistant-line-text" id="voiceAssistantDialogResponse"></span>
          </div>
        </div>
        <div class="voice-assistant-actions">
          <button type="button" id="voiceAssistantDialogRetry" class="primary">${this._esc(this._i18n("ui.try_again"))}</button>
          <button type="button" id="voiceAssistantDialogCloseSecondary">${this._esc(this._i18n("ui.close"))}</button>
        </div>
      </div>
    `;
      const panel = host.querySelector(".voice-assistant-panel");
      const keepPanelEvent = (event) => {
        if (this._state.screensaverOpen && this._state.voiceAssistantKeepScreensaver === true) {
          event.stopPropagation();
        }
      };
      panel?.addEventListener("pointerdown", keepPanelEvent);
      panel?.addEventListener("click", keepPanelEvent);
      panel?.addEventListener("keydown", keepPanelEvent);
      host.querySelector("#voiceAssistantDialogClose")?.addEventListener("click", () => this._closeVoiceAssistantDialog());
      host.querySelector("#voiceAssistantDialogCloseSecondary")?.addEventListener("click", () => this._closeVoiceAssistantDialog());
      host.querySelector("#voiceAssistantDialogRetry")?.addEventListener("click", () => {
        this._startVoiceAssistantCommand({ keepScreensaver: this._state.voiceAssistantKeepScreensaver === true });
      });
    }
    const retryBtn = host.querySelector("#voiceAssistantDialogRetry");
    if (retryBtn) retryBtn.hidden = status === "listening" || status === "processing";
    const iconSlot = host.querySelector("#voiceAssistantDialogIconSlot");
    const iconName = this._voiceAssistantDialogIcon(status);
    if (iconSlot && iconSlot.dataset.iconName !== iconName) {
      iconSlot.dataset.iconName = iconName;
      iconSlot.innerHTML = this._iconSvg(iconName);
    }
    const statusEl = host.querySelector("#voiceAssistantDialogStatus");
    if (statusEl) statusEl.textContent = this._voiceAssistantStatusLabel(status);
    const transcriptEl = host.querySelector("#voiceAssistantDialogTranscript");
    if (transcriptEl) {
      transcriptEl.textContent = transcript || this._i18n("ui.waiting_for_speech");
      transcriptEl.classList.toggle("voice-assistant-placeholder", !transcript);
    }
    const responseEl = host.querySelector("#voiceAssistantDialogResponse");
    if (responseEl) {
      responseEl.textContent = response || this._i18n("ui.voice_response_will_appear_here");
      responseEl.classList.toggle("voice-assistant-placeholder", !response);
    }
  }

  _voiceAssistantRecognitionErrorMessage(errorCode = "") {
    const code = String(errorCode || "").trim();
    if (code === "no-speech") return this._i18n("ui.no_speech_was_captured");
    if (code === "not-allowed" || code === "service-not-allowed") return this._i18n("ui.microphone_permission_or_browser_blocked");
    if (code === "language-not-supported") return this._i18n("ui.voice_language_is_not_supported");
    if (code === "network") return this._i18n("ui.voice_recognition_network_failed");
    return this._i18n("ui.voice_input_failed");
  }

  _speakVoiceAssistantFeedback(text = "") {
    const message = String(text || "").trim();
    if (!message || !this._voiceAssistantSpeakFeedbackEnabled()) return;
    if (typeof window === "undefined") return;
    const synth = window.speechSynthesis;
    if (!synth || typeof window.SpeechSynthesisUtterance !== "function") return;
    try {
      synth.cancel();
      const utterance = new window.SpeechSynthesisUtterance(message);
      utterance.lang = this._voiceAssistantRecognitionLanguage();
      utterance.rate = 1;
      utterance.pitch = 1;
      synth.speak(utterance);
    } catch (_) {}
  }

  _startVoiceAssistantCommand(options = {}) {
    const keepScreensaver = options?.keepScreensaver === true;
    const ignoreWhenListening = options?.ignoreWhenListening === true;
    const scheduleAutoClose = (status = "error", requestedDelay = null) => {
      const requested = Number(requestedDelay);
      const closeMs = Number.isFinite(requested) && requested > 0
        ? requested
        : this._flowAssistantAutoCloseMs(status);
      if (closeMs > 0) this._scheduleVoiceAssistantDialogClose(closeMs);
    };
    if (keepScreensaver) this._resetScreensaverTimer({ hide: false, activity: true });
    if (!this._voiceAssistantEnabled()) {
      const message = this._i18n("ui.voice_assistant_disabled");
      this._toastError(message);
      this._openVoiceAssistantDialog("error", { response: message, keepScreensaver });
      scheduleAutoClose("error");
      return;
    }
    if (this._mobileMicMode() === "off") {
      const message = this._i18n("ui.microphone_is_disabled");
      this._toastError(message);
      this._openVoiceAssistantDialog("error", { response: message, keepScreensaver });
      scheduleAutoClose("error");
      return;
    }
    if (this._state.voiceAssistantListening) {
      if (ignoreWhenListening) {
        this._openVoiceAssistantDialog("listening", {
          transcript: this._state.voiceAssistantTranscript || "",
          response: this._state.voiceAssistantResponse || "",
          keepScreensaver,
        });
        return;
      }
      this._stopVoiceAssistantRecognition();
      this._closeVoiceAssistantDialog();
      return;
    }
    if (!keepScreensaver) this._resetScreensaverTimer({ hide: true, activity: true });
    this._openVoiceAssistantDialog("listening", { transcript: "", response: "", keepScreensaver });
    const SpeechRecognition = this._speechRecognitionCtor();
    const micButtons = Array.from(this.shadowRoot?.querySelectorAll("#mobileVoiceAssistantBtn, #emptyVoiceAssistantBtn, #screensaverVoiceBtn") || []);
    if (!SpeechRecognition) {
      const message = this._i18n("ui.voice_input_is_not_supported_on_this_device");
      this._toastError(message);
      this._updateVoiceAssistantDialog({ status: "error", response: message, keepScreensaver });
      scheduleAutoClose("error");
      return;
    }
    clearTimeout(this._voiceAssistantRecognitionTimer);
    this._voiceAssistantRecognitionTimer = null;
    try { this._voiceAssistantRecognition?.abort?.(); } catch {}
    const recognition = new SpeechRecognition();
    this._voiceAssistantRecognition = recognition;
    recognition.lang = this._voiceAssistantRecognitionLanguage();
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;
    let capturedTranscript = "";
    let handled = false;
    let recognitionFailed = false;
    const stopListeningUi = () => {
      clearTimeout(this._voiceAssistantRecognitionTimer);
      this._voiceAssistantRecognitionTimer = null;
      this._state.voiceAssistantListening = false;
      micButtons.forEach((btn) => btn.classList.remove("listening"));
    };
    const finishTranscript = (transcript) => {
      if (handled) return;
      handled = true;
      stopListeningUi();
      if (this._voiceAssistantRecognition === recognition) this._voiceAssistantRecognition = null;
      try { recognition.abort?.(); } catch {}
      this._updateVoiceAssistantDialog({ status: "processing", transcript, response: this._i18n("ui.voice_processing_status") });
      this._withTimeout(
        this._handleVoiceAssistantTranscript(transcript),
        this._flowAssistantResponseTimeoutMs(),
        this._timeoutMessage(this._flowAssistantLabel()),
      ).then((result) => {
        const message = result?.message || (result?.ok === false ? this._i18n("ui.voice_command_failed") : this._i18n("ui.voice_command_executed"));
        const status = result?.ok === false ? "error" : "success";
        this._updateVoiceAssistantDialog({ status, transcript, response: message });
        if (result?.ok !== false) {
          this._speakVoiceAssistantFeedback(message);
        }
        scheduleAutoClose(status, result?.autoCloseMs);
      }).catch((error) => {
        const message = error?.message || this._i18n("ui.voice_command_failed");
        this._toastError(message);
        this._updateVoiceAssistantDialog({ status: "error", transcript, response: message });
        scheduleAutoClose("error");
      });
    };
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results || [])
        .map((result) => result?.[0]?.transcript || "")
        .join(" ")
        .trim();
      if (transcript) capturedTranscript = transcript;
      if (capturedTranscript) this._updateVoiceAssistantDialog({ status: "listening", transcript: capturedTranscript });
      const finalized = Array.from(event.results || []).some((result) => result?.isFinal);
      if (finalized && capturedTranscript) finishTranscript(capturedTranscript);
    };
    recognition.onerror = (event) => {
      if (handled) return;
      if (recognition.__homeiiCancelled) return;
      recognitionFailed = true;
      stopListeningUi();
      if (this._voiceAssistantRecognition === recognition) this._voiceAssistantRecognition = null;
      const message = this._voiceAssistantRecognitionErrorMessage(event?.error);
      this._toastError(message);
      this._updateVoiceAssistantDialog({ status: "error", response: message });
      scheduleAutoClose("error");
    };
    recognition.onend = () => {
      stopListeningUi();
      if (this._voiceAssistantRecognition === recognition) this._voiceAssistantRecognition = null;
      if (recognition.__homeiiCancelled) return;
      if (!handled && capturedTranscript) {
        finishTranscript(capturedTranscript);
      } else if (!handled && !recognitionFailed) {
        const message = this._i18n("ui.no_speech_was_captured");
        this._toastError(message);
        this._updateVoiceAssistantDialog({ status: "error", response: message });
        scheduleAutoClose("error");
      }
    };
    try {
      this._state.voiceAssistantListening = true;
      micButtons.forEach((btn) => btn.classList.add("listening"));
      this._hapticTap([8, 18, 8]);
      this._toast(this._i18n("ui.voice_assistant_listening"));
      recognition.start();
      this._voiceAssistantRecognitionTimer = setTimeout(() => {
        if (handled) return;
        handled = true;
        recognitionFailed = true;
        stopListeningUi();
        if (this._voiceAssistantRecognition === recognition) this._voiceAssistantRecognition = null;
        try {
          recognition.__homeiiCancelled = true;
          recognition.abort?.();
        } catch {}
        const message = this._timeoutMessage(this._flowAssistantLabel());
        this._toastError(message);
        this._updateVoiceAssistantDialog({ status: "error", transcript: capturedTranscript, response: message });
        scheduleAutoClose("error");
      }, this._flowAssistantListenTimeoutMs());
    } catch {
      stopListeningUi();
      if (this._voiceAssistantRecognition === recognition) this._voiceAssistantRecognition = null;
      const message = this._i18n("ui.voice_command_failed");
      this._toastError(message);
      this._updateVoiceAssistantDialog({ status: "error", response: message });
      scheduleAutoClose("error");
    }
  }

  async _handleSmartVoiceTranscript(transcript = "") {
    const query = String(transcript || "").trim();
    if (!query) return;
    this._state.mediaQuery = query;
    const input = this.$("mobileMediaSearchInput");
    if (input) input.value = query;
    this._toast(this._i18n("ui.searching_smart_selection"));
    const results = await this._search(query);
    const candidates = this._normalizeSmartVoiceCandidates(results);
    this._openSmartVoiceConfirm(query, candidates);
  }

  _startMobileVoiceSearch() {
    const SpeechRecognition = this._speechRecognitionCtor();
    const input = this.$("mobileMediaSearchInput");
    const micBtn = this.$("mobileVoiceSearchBtn");
    const micMode = this._mobileMicMode();
    if (!SpeechRecognition) {
      this._toastError(this._i18n("ui.voice_search_is_not_supported_on_this_device"));
      return;
    }
    if (micMode === "off") {
      this._toastError(this._i18n("ui.microphone_is_disabled"));
      return;
    }
    try {
      this._voiceRecognition?.abort?.();
    } catch (_) {}
    const recognition = new SpeechRecognition();
    this._voiceRecognition = recognition;
    recognition.lang = this._isHebrew() ? "he-IL" : "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;
    micBtn?.classList.add("listening");
    this._hapticTap([8, 18, 8]);
    this._toast(this._i18n("ui.listening"));
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results || [])
        .map((result) => result?.[0]?.transcript || "")
        .join(" ")
        .trim();
      if (!transcript) return;
      const finalized = Array.from(event.results || []).some((result) => result?.isFinal);
      this._state.mediaQuery = transcript;
      if (input) {
        input.value = transcript;
        input.focus({ preventScroll: true });
      }
      if (micMode === "smart" && finalized) {
        this._handleSmartVoiceTranscript(transcript).catch((error) => {
          this._toastError(error?.message || this._i18n("ui.voice_search_failed"));
        });
        return;
      }
      clearTimeout(this._searchTimer);
      this._searchTimer = setTimeout(() => this._renderMobileMediaResults(), 120);
    };
    recognition.onerror = () => {
      this._toastError(this._i18n("ui.voice_search_failed"));
    };
    recognition.onend = () => {
      micBtn?.classList.remove("listening");
      if (this._voiceRecognition === recognition) this._voiceRecognition = null;
    };
    try {
      recognition.start();
    } catch (_) {
      micBtn?.classList.remove("listening");
      this._toastError(this._i18n("ui.voice_search_failed"));
    }
  }

  _mobileSortOptions() {
    return [
      { value: "name_asc", label: this._i18n("ui.ascending") },
      { value: "name_desc", label: this._i18n("ui.descending") },
      { value: "date_desc", label: this._i18n("ui.newest") },
      { value: "date_asc", label: this._i18n("ui.oldest") },
    ];
  }

  _itemDateValue(item = {}) {
    const parseDate = (value) => {
      if (value === undefined || value === null || value === "") return 0;
      if (typeof value === "number") {
        if (!Number.isFinite(value) || value <= 0) return 0;
        if (value >= 1900 && value <= 2100) return Date.UTC(value, 0, 1);
        if (value > 1000000000000) return value;
        if (value > 1000000000) return value * 1000;
        return 0;
      }
      if (typeof value === "object") return this._itemDateValue(value);
      const raw = String(value || "").trim();
      if (!raw) return 0;
      const yearOnly = raw.match(/^(19|20)\d{2}$/);
      if (yearOnly) return Date.UTC(Number(yearOnly[0]), 0, 1);
      const numeric = Number(raw);
      if (Number.isFinite(numeric) && numeric > 0) return parseDate(numeric);
      const normalized = raw.replace(/^(\d{4}-\d{2}-\d{2})\s+/, "$1T").replace(/(\.\d{3})\d+/, "$1");
      const parsed = Date.parse(normalized);
      if (Number.isFinite(parsed)) return parsed;
      const yearMatch = raw.match(/\b(19|20)\d{2}\b/);
      return yearMatch ? Date.UTC(Number(yearMatch[0]), 0, 1) : 0;
    };
    const releaseCandidates = [
      item.release_date,
      item.releaseDate,
      item.release_year,
      item.releaseYear,
      item.year,
      item.metadata?.release_date,
      item.metadata?.releaseDate,
      item.metadata?.release_year,
      item.metadata?.releaseYear,
      item.metadata?.year,
      item.album?.release_date,
      item.album?.release_year,
      item.album?.year,
      item.media_item?.release_date,
      item.media_item?.release_year,
      item.media_item?.year,
      item.media_item?.metadata?.release_date,
      item.media_item?.metadata?.release_year,
      item.media_item?.metadata?.year,
    ];
    const libraryCandidates = [
      item.timestamp_added,
      item.date_added,
      item.added_at,
      item.created_at,
      item.modified_at,
      item.last_modified,
      item.last_updated,
      item.timestamp,
      item.updated_at,
      item.metadata?.timestamp_added,
      item.metadata?.date_added,
      item.metadata?.added_at,
      item.metadata?.created_at,
      item.metadata?.modified_at,
      item.metadata?.last_modified,
      item.metadata?.last_updated,
      item.metadata?.last_refresh,
      item.media_item?.timestamp_added,
      item.media_item?.date_added,
      item.media_item?.added_at,
      item.media_item?.last_modified,
      item.media_item?.last_updated,
      ...(Array.isArray(item.provider_mappings) ? item.provider_mappings.map((mapping) => mapping?.details) : []),
    ];
    for (const value of [...releaseCandidates, ...libraryCandidates]) {
      const parsed = parseDate(value);
      if (parsed > 0) return parsed;
    }
    return 0;
  }

  _sortLibraryItemsLocally(items = []) {
    const mode = this._state.mobileLibrarySort || "name_asc";
    const copy = [...items];
    if (mode === "name_desc") {
      return copy.sort((a, b) => String(b?.name || "").localeCompare(String(a?.name || ""), this._isHebrew() ? "he" : "en", { sensitivity: "base", numeric: true }));
    }
    if (mode === "date_desc") {
      const ranked = copy.map((item, index) => ({ item, index, date: this._itemDateValue(item) }));
      const withDates = ranked.some((entry) => entry.date > 0);
      if (!withDates) return [...copy];
      ranked.sort((a, b) => {
        if (a.date !== b.date) return b.date - a.date;
        return a.index - b.index;
      });
      return ranked.map((entry) => entry.item);
    }
    if (mode === "date_asc") {
      const ranked = copy.map((item, index) => ({ item, index, date: this._itemDateValue(item) }));
      const withDates = ranked.some((entry) => entry.date > 0);
      if (!withDates) return [...copy].reverse();
      ranked.sort((a, b) => {
        if (a.date !== b.date) return a.date - b.date;
        return b.index - a.index;
      });
      return ranked.map((entry) => entry.item);
    }
    return copy.sort((a, b) => String(a?.name || "").localeCompare(String(b?.name || ""), this._isHebrew() ? "he" : "en", { sensitivity: "base", numeric: true }));
  }

  _libraryTabSearchPageKey(page = this._state.menuPage) {
    const normalized = this._normalizeMobileMenuPage(page || this._state.menuPage || "");
    if (!String(normalized || "").startsWith("library_")) return "";
    if (normalized === "library_search") return "";
    return normalized;
  }

  _libraryTabSearchQuery(page = this._state.menuPage) {
    const key = this._libraryTabSearchPageKey(page);
    if (!key) return "";
    const queries = this._state.libraryTabSearchQueries || {};
    return String(queries[key] || "").trim();
  }

  _libraryTabSearchDraft(page = this._state.menuPage) {
    const key = this._libraryTabSearchPageKey(page);
    if (!key) return "";
    const drafts = this._state.libraryTabSearchDrafts || {};
    if (Object.prototype.hasOwnProperty.call(drafts, key)) return String(drafts[key] || "");
    return this._libraryTabSearchQuery(key);
  }

  _setLibraryTabSearchDraft(query = "", page = this._state.menuPage) {
    const key = this._libraryTabSearchPageKey(page);
    if (!key) return;
    const next = { ...(this._state.libraryTabSearchDrafts || {}) };
    const value = String(query || "");
    if (value) next[key] = value;
    else delete next[key];
    this._state.libraryTabSearchDrafts = next;
  }

  _setLibraryTabSearchQuery(query = "", page = this._state.menuPage) {
    const key = this._libraryTabSearchPageKey(page);
    if (!key) return;
    const next = { ...(this._state.libraryTabSearchQueries || {}) };
    const value = String(query || "").trim();
    if (value) next[key] = value;
    else delete next[key];
    this._state.libraryTabSearchQueries = next;
    this._setLibraryTabSearchDraft(value, key);
  }

  _commitLibraryTabSearchQuery(page = this._state.menuPage, query = null) {
    const key = this._libraryTabSearchPageKey(page);
    if (!key) return "";
    const value = query === null ? this._libraryTabSearchDraft(key) : String(query || "");
    this._setLibraryTabSearchQuery(value, key);
    return this._libraryTabSearchQuery(key);
  }

  _libraryFavoritesPageKey(page = this._state.menuPage) {
    const key = this._libraryTabSearchPageKey(page);
    if (!key || key === "library_search" || key === "library_liked") return "";
    return key;
  }

  _libraryFavoritesOnlyTabs() {
    const valid = new Set([
      ...this._defaultMobileLibraryTabs(),
      ...(typeof this._mobileLibraryTabs === "function" ? this._mobileLibraryTabs() : []),
      "library_liked",
      "library_search",
    ].map((id) => this._libraryFavoritesPageKey(id)).filter(Boolean));
    return [...new Set((Array.isArray(this._state.mobileLibraryFavoritesOnlyTabs) ? this._state.mobileLibraryFavoritesOnlyTabs : [])
      .map((page) => this._libraryFavoritesPageKey(page))
      .filter((page) => page && valid.has(page)))];
  }

  _libraryFavoritesOnlyEnabled(page = this._state.menuPage) {
    const key = this._libraryFavoritesPageKey(page);
    return !!key && this._libraryFavoritesOnlyTabs().includes(key);
  }

  _setLibraryFavoritesOnly(page = this._state.menuPage, enabled = false) {
    const key = this._libraryFavoritesPageKey(page);
    if (!key) return false;
    const next = new Set(this._libraryFavoritesOnlyTabs());
    if (enabled) next.add(key);
    else next.delete(key);
    this._state.mobileLibraryFavoritesOnlyTabs = Array.from(next);
    try { localStorage.setItem(this._lsKey("homeii_music_flow_mobile_library_favorites_tabs"), JSON.stringify(this._state.mobileLibraryFavoritesOnlyTabs)); } catch (_) {}
    this._cache.library.clear();
    return true;
  }

  _restoreLibraryTabSearchFocus() {
    const focusId = String(this._state.libraryTabSearchFocusId || "").trim();
    if (!focusId) return;
    this._state.libraryTabSearchFocusId = "";
    requestAnimationFrame(() => {
      const input = this.$(focusId);
      if (!input) return;
      input.focus?.({ preventScroll: true });
      try {
        const end = String(input.value || "").length;
        input.setSelectionRange?.(end, end);
      } catch (_) {}
    });
  }

  _libraryTabSearchPlaceholder(page = this._state.menuPage) {
    const meta = this._libraryTabMeta(page);
    const title = String(meta?.title || this._i18n("ui.media_2") || "").trim();
    return `${this._i18n("ui.search")} ${title}`.trim();
  }

  _libraryTabSearchBoxHtml(mode = "inline") {
    const draft = this._libraryTabSearchDraft();
    const query = this._libraryTabSearchQuery();
    const page = this._libraryTabSearchPageKey();
    const placeholder = this._libraryTabSearchPlaceholder();
    const className = mode === "row" ? "library-tab-search-row" : "library-toolbar-search library-toolbar-search-inline";
    const hasText = !!String(draft || query || "").trim();
    return `
      <div class="${className}">
        <button class="library-tab-search-submit library-tab-search-icon" data-library-tab-search-submit="${this._esc(page)}" title="${this._esc(this._i18n("ui.search"))}" aria-label="${this._esc(this._i18n("ui.search"))}">${this._iconSvg("search")}</button>
        <input id="${mode === "row" ? "mobileLibraryTabSearchRowInput" : "mobileLibraryTabSearchInput"}" data-library-tab-search-input="${this._esc(page)}" type="search" enterkeyhint="search" value="${this._esc(draft)}" placeholder="${this._esc(placeholder)}" aria-label="${this._esc(placeholder)}">
        <button class="library-tab-search-clear ${hasText ? "visible" : ""}" data-library-tab-search-clear="${this._esc(page)}" title="${this._esc(this._i18n("ui.clear_search"))}" aria-label="${this._esc(this._i18n("ui.clear_search"))}">×</button>
      </div>
    `;
  }

  _libraryItemSearchText(item = {}) {
    const media = item?.media_item || {};
    const artistNames = [
      this._artistName(item),
      item.artist,
      item.artist_str,
      media.artist,
      ...(Array.isArray(media.artists) ? media.artists.map((artist) => artist?.name) : []),
      ...(Array.isArray(item.artists) ? item.artists.map((artist) => artist?.name) : []),
    ];
    const albumValue = item.album || media.album || {};
    return [
      item.name,
      item.title,
      media.name,
      media.title,
      ...artistNames,
      typeof albumValue === "string" ? albumValue : albumValue?.name,
      item.publisher,
      item.metadata?.description,
      media.metadata?.description,
    ].filter(Boolean).join(" ");
  }

  _filterLibraryItemsByQuery(items = [], query = "") {
    const normalizedQuery = HomeiiMediaQueueFoundation.normalizeComparableText(query);
    if (!normalizedQuery) return Array.isArray(items) ? items : [];
    return (Array.isArray(items) ? items : []).filter((item) => (
      HomeiiMediaQueueFoundation.normalizeComparableText(this._libraryItemSearchText(item)).includes(normalizedQuery)
    ));
  }

  _dedupeLibraryItems(items = []) {
    const seen = new Set();
    return (Array.isArray(items) ? items : []).filter((item) => {
      const normalized = this._normalizeMediaItem(item);
      const key = String(normalized?.uri || item?.uri || item?.media_item?.uri || "").trim()
        || `${String(normalized?.media_type || item?.media_type || item?.type || "")}:${String(normalized?.name || item?.name || item?.title || "").trim()}`;
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  async _getLibraryTabItems(meta = {}, orderBy = "sort_name", limit = 250, query = "", favoritesOnly = false) {
    const mediaType = String(meta?.type || "").trim();
    if (!mediaType || mediaType === "liked" || mediaType === "search") return [];
    const search = String(query || "").trim();
    const onlyFavorites = favoritesOnly === true;
    if (!search) return this._getLibrary(mediaType, orderBy, limit, onlyFavorites);
    const cacheKey = `tab-search:${mediaType}:${orderBy}:${limit}:${onlyFavorites}:${search.toLowerCase()}`;
    const ttl = Number(this._config.cache_ttl || 300000);
    const cached = this._cache.library.get(cacheKey);
    if (cached && Date.now() - cached.ts < ttl) return cached.items;
    let items = [];
    try {
      items = await this._fetchLibrary(mediaType, orderBy, limit, onlyFavorites, search);
    } catch (error) {
      if (this._isMusicAssistantAvailabilityError(error)) {
        this._handleMusicAssistantIssue(error);
        throw error;
      } else if (orderBy !== "sort_name") {
        items = await this._fetchLibrary(mediaType, "sort_name", limit, onlyFavorites, search);
      } else {
        throw error;
      }
    }
    if (!items.length) {
      try {
        const fallbackItems = await this._getLibrary(mediaType, orderBy, limit, onlyFavorites);
        items = this._filterLibraryItemsByQuery(fallbackItems, search);
      } catch (_) {}
    }
    items = this._dedupeLibraryItems(items);
    if (items.length || !this._state.musicAssistantIssueMessage) {
      this._cache.library.set(cacheKey, { ts: Date.now(), items });
    }
    return items;
  }

  _libraryTabSearchResultGroup(mediaType = "") {
    const type = String(mediaType || "").toLowerCase();
    if (type === "podcast") return "podcasts";
    if (type === "album") return "albums";
    if (type === "artist") return "artists";
    if (type === "track") return "tracks";
    if (type === "playlist") return "playlists";
    if (type === "radio") return "radio";
    return "";
  }

  async _searchLibraryTabProviderItems(meta = {}, query = "", limit = 50) {
    const mediaType = String(meta?.type || "").trim();
    const search = String(query || "").trim();
    const group = this._libraryTabSearchResultGroup(mediaType);
    if (!mediaType || !group || !search) return [];
    const results = await this._search(search, { providerOnly: true, strict: true, limit });
    return this._dedupeLibraryItems((Array.isArray(results?.[group]) ? results[group] : []).map((item) => ({
      ...item,
      media_type: item?.media_type || mediaType,
    })));
  }

  _libraryItemStableKey(item = {}, fallbackType = "") {
    const normalized = this._normalizeMediaItem({ ...item, media_type: item?.media_type || fallbackType });
    const uri = String(normalized?.uri || item?.uri || item?.media_item?.uri || "").trim();
    if (uri) return `uri:${uri}`;
    const mediaType = String(normalized?.media_type || item?.media_type || fallbackType || "").toLowerCase();
    const name = HomeiiMediaQueueFoundation.normalizeComparableText(normalized?.name || item?.name || item?.title || item?.media_item?.name || "");
    const artist = HomeiiMediaQueueFoundation.normalizeComparableText(this._artistName(item) || item?.artist || item?.artist_str || "");
    return `${mediaType}:${name}:${artist}`;
  }

  _excludeLibraryDuplicateItems(providerItems = [], libraryItems = [], fallbackType = "") {
    const seen = new Set((Array.isArray(libraryItems) ? libraryItems : []).map((item) => this._libraryItemStableKey(item, fallbackType)).filter(Boolean));
    return (Array.isArray(providerItems) ? providerItems : []).filter((item) => {
      const key = this._libraryItemStableKey(item, fallbackType);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  _libraryTabSearchResultsHtml(libraryItems = [], providerItems = [], meta = {}, options = {}) {
    const mediaType = String(meta?.type || "track").trim() || "track";
    const providerLoading = options.providerLoading === true;
    const providerError = String(options.providerError || "").trim();
    const hasLibrary = Array.isArray(libraryItems) && libraryItems.length;
    const hasProvider = Array.isArray(providerItems) && providerItems.length;
    if (!hasLibrary && !hasProvider && !providerLoading && !providerError) {
      return `<div class="notice open">${this._i18n("ui.no_results_found")}</div>`;
    }
    return `
      <div class="media-results library-tab-search-results">
        <div>
          <div class="media-section-title">${this._esc(this._m("In library", "בספרייה"))}</div>
          ${hasLibrary ? this._mediaItemsListHtml(libraryItems, mediaType, { librarySkin: true }) : `<div class="notice open">${this._esc(this._m("No local library matches yet.", "לא נמצאו התאמות בספרייה המקומית."))}</div>`}
        </div>
        ${providerLoading || providerError || hasProvider ? `
          <div>
            <div class="media-section-title">${this._esc(this._m("Content providers", "ספקי תוכן"))}</div>
            ${providerLoading ? this._loadingStateHtml(this._i18n("ui.searching"), { notice: true }) : providerError ? `<div class="notice open">${this._esc(providerError)}</div>` : this._mediaItemsListHtml(providerItems, mediaType, { librarySkin: true })}
          </div>
        ` : ""}
      </div>
    `;
  }

  _mediaLayoutToolbarHtml() {
    const layout = this._state.mobileMediaLayout || this._defaultMobileMediaLayout();
    const sort = this._state.mobileLibrarySort || "name_asc";
    const page = this._libraryTabSearchPageKey();
    const isSearch = this._state.menuPage === "library_search";
    const tabSearchOpen = this._state.libraryTabSearchOpen === true || !!this._libraryTabSearchQuery(page);
    const libraryFlowActive = this._libraryFlowPageActive(page);
    const favoritesPage = this._libraryFavoritesPageKey(page);
    const favoritesLabel = this._i18n("ui.liked");
    return `
      <div class="media-toolbar library-toolbar library-toolbar-minimal">
        <div class="library-toolbar-player">
          ${this._libraryPlayerFocusHtml()}
        </div>
        ${this._libraryTabSearchBoxHtml("inline")}
        <div class="library-toolbar-actions library-toolbar-icons">
          <button class="media-layout-btn library-toolbar-search-toggle ${tabSearchOpen ? "active" : ""}" data-library-tab-search-toggle="${this._esc(page)}" title="${this._esc(this._i18n("ui.search"))}" aria-label="${this._esc(this._i18n("ui.search"))}" aria-expanded="${tabSearchOpen ? "true" : "false"}">${this._iconSvg("search")}</button>
          <div class="media-layout-toggle" role="tablist" aria-label="${this._esc(this._i18n("ui.media_layout"))}">
            ${favoritesPage ? `<button class="media-layout-btn library-favorites-toggle" data-library-liked-open="library_liked" title="${this._esc(favoritesLabel)}" aria-label="${this._esc(favoritesLabel)}">${this._iconSvg("heart_filled")}</button>` : ``}
            ${!isSearch ? `<button class="media-layout-btn" data-media-surprise="1" title="${this._esc(this._i18n("ui.surprise_me"))}">${this._iconSvg("wand")}</button>` : ``}
            ${!isSearch ? `<button class="media-layout-btn library-flow-toggle ${libraryFlowActive ? "active" : ""}" data-library-flow-toggle="${this._esc(page)}" title="${this._esc(this._libraryFlowLabel())}" aria-label="${this._esc(this._libraryFlowLabel())}" aria-pressed="${libraryFlowActive ? "true" : "false"}">${this._iconSvg("queue_flow")}</button>` : ``}
            <button class="media-layout-btn ${layout === "grid" ? "active" : ""}" data-media-layout="grid" title="${this._esc(this._i18n("ui.grid"))}">${this._iconSvg("grid")}</button>
            <button class="media-layout-btn ${layout === "list" ? "active" : ""}" data-media-layout="list" title="${this._esc(this._i18n("ui.list"))}">${this._iconSvg("list")}</button>
          </div>
        </div>
        <div class="library-toolbar-actions library-toolbar-sort">
          <select class="media-sort-select library-toolbar-sort-select" id="mobileLibrarySortSelect" aria-label="${this._esc(this._i18n("ui.sort"))}">
            ${this._mobileSortOptions().map((opt) => `<option value="${this._esc(opt.value)}" ${opt.value === sort ? "selected" : ""}>${this._esc(opt.label)}</option>`).join("")}
          </select>
        </div>
      </div>
      ${tabSearchOpen ? this._libraryTabSearchBoxHtml("row") : ""}
    `;
  }

  _albumTrackCount(item = {}) {
    const metadata = item?.metadata || item?.media_item?.metadata || {};
    const values = [
      item.track_count,
      item.trackCount,
      item.number_of_tracks,
      item.total_tracks,
      item.item_count,
      item.media_item?.track_count,
      item.media_item?.number_of_tracks,
      item.media_item?.total_tracks,
      metadata.track_count,
      metadata.trackCount,
      metadata.number_of_tracks,
      metadata.total_tracks,
      metadata.item_count,
      Array.isArray(item.tracks) ? item.tracks.length : 0,
      Array.isArray(item.media_item?.tracks) ? item.media_item.tracks.length : 0,
    ];
    for (const value of values) {
      const count = Math.round(Number(value || 0));
      if (Number.isFinite(count) && count > 0) return count;
    }
    return 0;
  }

  _albumCardBadgeHtml(item = {}) {
    const kind = this._albumKindLabel(item);
    const trackCount = this._albumTrackCount(item);
    if (!kind && !trackCount) return "";
    return `
      <span class="album-card-badge">
        ${kind ? `<span class="album-card-badge-kind">${this._esc(kind)}</span>` : ``}
        ${trackCount ? `<span class="album-card-badge-count">${this._esc(`${trackCount} ${this._i18n("ui.tracks").toLowerCase()}`)}</span>` : ``}
      </span>
    `;
  }

  _mediaVirtualPageKey(page = this._state.menuPage) {
    const normalizedPage = String(page || "media").trim() || "media";
    const detail = normalizedPage === "media_detail" ? (this._state.mobileLibraryDetail || {}) : {};
    const detailKey = String(detail.uri || detail.item_id || detail.id || "").trim();
    const query = normalizedPage.startsWith("library_") ? this._libraryTabSearchQuery(normalizedPage) : "";
    return [normalizedPage, detailKey, String(query || "").trim().toLowerCase()].join("|");
  }

  _mediaVirtualMetrics(layout = "list") {
    const width = Number(this.$("mobileMenuBody")?.clientWidth || this.clientWidth || 720);
    const columns = layout === "grid" ? Math.max(2, Math.min(6, Math.floor(width / 190))) : 1;
    return {
      columns,
      rowHeight: layout === "grid" ? 250 : 88,
      windowSize: columns * 14,
    };
  }

  _mediaItemsListHtml(items = [], mediaType, options = {}) {
    if (!items.length) return `<div class="notice open">${this._i18n("ui.no_results_found")}</div>`;
    const layout = options.layout || this._state.mobileMediaLayout || this._defaultMobileMediaLayout();
    const iconMap = { track: "tracks", radio: "radio", album: "album", artist: "artist", podcast: "podcast", playlist: "playlist" };
    const virtualEnabled = options.virtual !== false && items.length > 72;
    const virtualKey = this._mediaVirtualPageKey();
    const metrics = this._mediaVirtualMetrics(layout);
    const requestedStart = virtualEnabled ? Math.max(0, Number(this._mediaVirtualStarts.get(virtualKey) || 0)) : 0;
    const virtualStart = Math.floor(requestedStart / metrics.columns) * metrics.columns;
    const virtualEnd = virtualEnabled ? Math.min(items.length, virtualStart + metrics.windowSize) : items.length;
    const visibleItems = items.slice(virtualStart, virtualEnd);
    const topRows = Math.floor(virtualStart / metrics.columns);
    const bottomRows = Math.ceil(Math.max(0, items.length - virtualEnd) / metrics.columns);
    const spacerStyle = "grid-column:1/-1;pointer-events:none;";
    return `<div class="media-items-list layout-${this._esc(layout)}" data-homeii-virtual-total="${virtualEnabled ? this._esc(String(items.length)) : "0"}" data-virtual-columns="${this._esc(String(metrics.columns))}" data-virtual-row-height="${this._esc(String(metrics.rowHeight))}">${topRows ? `<div class="virtual-list-spacer top" style="${spacerStyle}height:${this._esc(String(topRows * metrics.rowHeight))}px" aria-hidden="true"></div>` : ""}${visibleItems.map((item) => {
      const entryMediaType = String(item?.media_type || item?.type || mediaType || "album").toLowerCase();
      const canOpenDetails = options.openDetails !== false && this._mediaTypeCanOpenDetails(entryMediaType);
      const art = this._artUrl(item);
      const fallbackIcon = iconMap[entryMediaType] || iconMap[mediaType] || "repeat";
      const thumbHtml = art
        ? `<span class="menu-thumb" data-img="${this._esc(art)}" data-placeholder="${this._esc(fallbackIcon)}">${this._iconSvg(fallbackIcon)}</span>`
        : `<span class="menu-thumb">${this._iconSvg(fallbackIcon)}</span>`;
      const artistName = this._artistName(item) || "";
      const sub = entryMediaType === "artist"
        ? this._i18n("ui.artist")
        : entryMediaType === "radio"
          ? (item.metadata?.description || "")
          : artistName || item.album?.name || item.publisher || "";
      const favoriteScope = item?.radio_browser || item?.radio_browser_id ? "radio_browser" : (item?.favorite_scope || options.favorite_scope || "library");
      const dataAttrs = `data-media-type="${this._esc(entryMediaType)}" data-media-name="${this._esc(item.name || "")}" data-media-artist="${this._esc(artistName)}" data-media-album="${this._esc(item.album?.name || "")}" data-media-image="${this._esc(art || "")}" data-media-favorite-scope="${this._esc(favoriteScope)}"`;
      return `
        <div class="menu-list-item media-entry ${this._esc(layout)} media-type-${this._esc(entryMediaType)}">
          <button class="media-entry-main" ${canOpenDetails ? `data-media-open="${this._esc(item.uri || "")}"` : `data-media-uri="${this._esc(item.uri || "")}"`} ${dataAttrs}>
            ${thumbHtml}
            <span style="min-width:0;flex:1;">
              <span class="menu-item-title">${this._esc(item.name || "")}</span>
              <span class="menu-item-sub">${this._esc(sub || "—")}</span>
            </span>
          </button>
          ${options.albumBadges && entryMediaType === "album" ? this._albumCardBadgeHtml(item) : ``}
          ${item.uri ? `<button class="chip-btn queue-more-btn media-play-btn" data-media-play="${this._esc(item.uri || "")}" ${dataAttrs} title="${this._esc(this._i18n("ui.play"))}" aria-label="${this._esc(this._i18n("ui.play"))}">${this._iconSvg("play")}</button>` : ``}
          <button class="chip-btn queue-more-btn media-more-btn" data-media-more="${this._esc(item.uri || "")}" ${dataAttrs} title="${this._esc(this._i18n("ui.actions_2"))}">${this._iconSvg("more")}</button>
        </div>
      `;
    }).join("")}${bottomRows ? `<div class="virtual-list-spacer bottom" style="${spacerStyle}height:${this._esc(String(bottomRows * metrics.rowHeight))}px" aria-hidden="true"></div>` : ""}</div>`;
  }

  _countryFlagEmoji(code = "") {
    return homeiiCountryFlagEmoji(code);
  }

  _radioBrowserCountriesHtml(countries = []) {
    if (!countries.length) return `<div class="notice open">${this._i18n("ui.no_radio_browser_countries_found")}</div>`;
    return `<div class="media-items-list layout-list radio-country-list">${countries.map((country) => {
      const flag = this._countryFlagEmoji(country.code);
      return `
      <button class="menu-list-item media-entry list radio-country-entry" data-radio-country="${this._esc(country.code)}" data-radio-country-name="${this._esc(country.name)}">
        <span class="media-entry-main">
          <span class="menu-thumb flag-thumb">${flag ? `<span class="flag-emoji">${this._esc(flag)}</span>` : this._iconSvg("radio")}</span>
          <span style="min-width:0;flex:1;">
            <span class="menu-item-title">${this._esc(country.name)}</span>
            <span class="menu-item-sub">${this._esc(`${country.stationcount} ${this._i18n("ui.stations")}`)}</span>
          </span>
        </span>
      </button>
    `;
    }).join("")}</div>`;
  }

  _radioBrowserCountryBackHtml(label = "") {
    return `
      <div class="radio-browser-country-head">
        <button class="media-layout-btn" data-radio-countries-back title="${this._esc(this._i18n("ui.back_to_countries"))}">${this._iconSvg("previous")}</button>
        <div class="media-section-title">${this._esc(label || this._i18n("ui.radio_browser"))}</div>
      </div>
    `;
  }

  _likedMediaEntriesHtml(entries = []) {
    if (!entries.length) return `<div class="notice open">${this._i18n("ui.no_liked_media_yet")}</div>`;
    const layout = this._state.mobileMediaLayout || this._defaultMobileMediaLayout();
    const selectedSet = new Set(Array.isArray(this._state.likedSelectedUris) ? this._state.likedSelectedUris : []);
    const playableCount = this._likedPlayableEntries(entries, true).length;
    return `
      <div class="liked-toolbar">
        <div class="liked-toolbar-actions">
          <button class="chip-btn" data-liked-play-all>${this._esc(this._i18n("ui.play_all"))}</button>
          <button class="chip-btn" data-liked-selection-toggle>${this._esc(this._state.likedSelectionMode ? this._i18n("ui.cancel_selection") : this._i18n("ui.select_2"))}</button>
          ${this._state.likedSelectionMode ? `<button class="chip-btn accent" data-liked-play-selected>${this._esc(this._i18n("ui.play_selected"))}${playableCount ? ` (${this._esc(String(playableCount))})` : ``}</button>` : ``}
        </div>
        <div class="media-layout-toggle liked-layout-toggle" role="tablist" aria-label="${this._esc(this._i18n("ui.media_layout"))}">
          <button class="media-layout-btn ${layout === "grid" ? "active" : ""}" data-media-layout="grid" title="${this._esc(this._i18n("ui.grid"))}" aria-pressed="${layout === "grid" ? "true" : "false"}">${this._iconSvg("grid")}</button>
          <button class="media-layout-btn ${layout === "list" ? "active" : ""}" data-media-layout="list" title="${this._esc(this._i18n("ui.list"))}" aria-pressed="${layout === "list" ? "true" : "false"}">${this._iconSvg("list")}</button>
        </div>
      </div>
      <div class="media-items-list layout-${this._esc(layout)} liked-items-list">${entries.map((entry) => {
        const uri = String(entry?.uri || "").trim();
        const checked = selectedSet.has(uri);
        const entryMediaType = String(entry.media_type || entry.type || "track").toLowerCase();
        const canOpenDetails = this._mediaTypeCanOpenDetails(entryMediaType);
        const entryArt = entry.image || entry.image_url || "";
        const dataAttrs = `data-media-type="${this._esc(entryMediaType)}" data-media-name="${this._esc(entry.name || "")}" data-media-artist="${this._esc(entry.artist || "")}" data-media-album="${this._esc(entry.album || "")}" data-media-image="${this._esc(entryArt)}" data-media-favorite-scope="${this._esc(entry.favorite_scope || "library")}"`;
        return `
          <div class="menu-list-item media-entry ${this._esc(layout)} liked-entry media-type-${this._esc(entryMediaType)}" ${canOpenDetails ? "" : `data-media-uri="${this._esc(uri)}"`} ${dataAttrs}>
            ${this._state.likedSelectionMode ? `<label class="liked-select-box ${checked ? "checked" : ""}"><input type="checkbox" data-liked-select-uri="${this._esc(uri)}" ${checked ? "checked" : ""}><span></span></label>` : ``}
            <button class="media-entry-main" ${canOpenDetails ? `data-media-open="${this._esc(uri)}"` : `data-media-uri="${this._esc(uri)}"`} ${dataAttrs}>
              <span class="menu-thumb">${entryArt ? this._imgHtml(entryArt, "", { fallbackIcon: "heart_filled" }) : this._iconSvg("heart_filled")}</span>
              <span style="min-width:0;flex:1;">
                <span class="menu-item-title">${this._esc(entry.name || "")}</span>
                <span class="menu-item-sub">${this._esc([entry.artist, entry.album].filter(Boolean).join(" · ") || "—")}</span>
              </span>
            </button>
            <div class="media-entry-actions">
              ${uri ? `<button class="chip-btn queue-more-btn media-play-btn" data-media-play="${this._esc(uri)}" ${dataAttrs} title="${this._esc(this._i18n("ui.play"))}" aria-label="${this._esc(this._i18n("ui.play"))}">${this._iconSvg("play")}</button>` : ``}
              <button class="chip-btn queue-more-btn media-more-btn" data-media-more="${this._esc(uri)}" ${dataAttrs} title="${this._esc(this._i18n("ui.actions_2"))}">${this._iconSvg("more")}</button>
            </div>
          </div>
        `;
      }).join("")}</div>
    `;
  }

  _mediaSearchSectionsHtml(results = {}, options = {}) {
    const sections = [
      ["radio", this._i18n("ui.radio"), results.radio || []],
      ["playlists", this._i18n("ui.playlists"), results.playlists || []],
      ["albums", this._i18n("ui.albums"), results.albums || []],
      ["artists", this._i18n("ui.artists"), results.artists || []],
      ["tracks", this._i18n("ui.tracks"), results.tracks || []],
      ["podcasts", this._i18n("ui.podcasts"), results.podcasts || []],
    ];
    const preferred = Array.isArray(this._config?.search_result_order) ? this._config.search_result_order : [];
    const order = [...new Set([...preferred, ...sections.map(([type]) => type)])];
    const used = sections.filter(([, , items]) => Array.isArray(items) && items.length)
      .sort(([left], [right]) => order.indexOf(left) - order.indexOf(right));
    if (!used.length) return `<div class="notice open">${this._i18n("ui.no_results_found")}</div>`;
    return `<div class="media-results">${used.map(([type, title, items]) => `
      <div>
        <div class="media-section-title">${this._esc(title)}</div>
        ${this._mediaItemsListHtml(items.slice(0, 8), type === "tracks" ? "track" : type === "playlists" ? "playlist" : type === "albums" ? "album" : type === "artists" ? "artist" : type === "podcasts" ? "podcast" : "radio", { layout: "list", openDetails: options.openDetails !== false })}
      </div>
    `).join("")}</div>`;
  }

  _bindMobileMediaSearch() {
    const input = this.$("mobileMediaSearchInput");
    const clearBtn = this.$("mobileMediaSearchClear");
    const voiceBtn = this.$("mobileVoiceSearchBtn");
    if (input && !input.dataset.boundSearch) {
      input.dataset.boundSearch = "1";
      input.addEventListener("input", this._boundMobileMediaInput);
    }
    if (voiceBtn && !voiceBtn.dataset.boundVoice) {
      voiceBtn.dataset.boundVoice = "1";
      voiceBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this._startMobileVoiceSearch();
      });
    }
    if (clearBtn && !clearBtn.dataset.boundClear) {
      clearBtn.dataset.boundClear = "1";
      clearBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this._state.mediaQuery = "";
        if (input) {
          input.value = "";
          input.focus({ preventScroll: true });
        }
        this._renderMobileMediaResults();
      });
    }
  }

  async _renderMobileMediaResults() {
    if (!this._state.menuOpen || !this._isMobileSearchPage()) return;
    const body = this.$("mobileMenuBody");
    const resultsHost = body?.querySelector("#mobileMediaSearchResults");
    const clearBtn = this.$("mobileMediaSearchClear");
    if (!resultsHost) return;
    const query = (this._state.mediaQuery || "").trim();
    this._state.mediaSearchToken = Number(this._state.mediaSearchToken || 0) + 1;
    const searchToken = this._state.mediaSearchToken;
    let completed = false;
    const isCurrentSearch = () => (
      this._state.menuOpen
      && this._state.mediaSearchToken === searchToken
      && this.$("mobileMenuBody")?.querySelector("#mobileMediaSearchResults") === resultsHost
      && this._isMobileSearchPage()
      && (this._state.mediaQuery || "").trim() === query
    );
    if (clearBtn) clearBtn.style.display = query ? "" : "none";
    if (clearBtn) clearBtn.classList.toggle("visible", !!query);
    if (!query) {
      resultsHost.innerHTML = this._state.menuPage === "quick_search" ? this._quickSearchRecommendationsHtml() : "";
      if (this._state.menuPage === "quick_search") this._hydrateImages(body);
      return;
    }
    const cachedResults = this._cachedLibrarySearchResults(query, 10);
    const searchRenderOptions = { openDetails: this._state.menuPage !== "quick_search" };
    let hasInterimResults = this._hasSearchResults(cachedResults);
    let fastResults = cachedResults;
    resultsHost.innerHTML = hasInterimResults
      ? this._mediaSearchSectionsHtml(cachedResults, searchRenderOptions)
      : this._loadingStateHtml(this._i18n("ui.searching"), { notice: true });
    if (hasInterimResults) this._hydrateImages(body);
    if (!hasInterimResults) {
      this._withTimeout(this._searchPreviewResults(query, 8), 3200, "Preview search timed out")
        .then((previewResults) => {
          if (completed || !isCurrentSearch() || hasInterimResults || !this._hasSearchResults(previewResults)) return;
          hasInterimResults = true;
          fastResults = previewResults;
          resultsHost.innerHTML = this._mediaSearchSectionsHtml(previewResults, searchRenderOptions);
          this._hydrateImages(body);
        })
        .catch(() => {});
    }
    let providerPromise = null;
    let providerError = null;
    let libraryError = null;
    try {
      providerPromise = (async () => {
        await new Promise((resolve) => setTimeout(resolve, 650));
        if (!isCurrentSearch()) return this._emptySearchResults();
        return this._withTimeout(
          this._search(query, { providerOnly: true, limit: 30, strict: true }),
          Math.max(this._musicAssistantTimeoutMs(), 18000),
          this._timeoutMessage("Music Assistant provider search"),
        );
      })().catch((error) => {
        providerError = error;
        this._debugLog("warn", "[HOMEii Flow] provider search failed", error);
        return this._emptySearchResults();
      });
      const libraryResults = await this._search(query, { fastOnly: true, limit: 25, strict: true });
      fastResults = this._mergeSearchResults(fastResults, libraryResults);
    } catch (error) {
      libraryError = error;
    }
    if (!isCurrentSearch()) return;
    if (this._hasSearchResults(fastResults)) {
      hasInterimResults = true;
      resultsHost.innerHTML = this._mediaSearchSectionsHtml(fastResults, searchRenderOptions);
      this._hydrateImages(body);
    } else if (!hasInterimResults) {
      resultsHost.innerHTML = this._loadingStateHtml(this._i18n("ui.searching"), { notice: true });
    }
    const applyProviderResults = (providerResults) => {
      if (!isCurrentSearch() || !this._hasSearchResults(providerResults)) return false;
      const mergedResults = this._mergeSearchResults(fastResults, providerResults);
      if (!this._hasSearchResults(mergedResults)) return false;
      resultsHost.innerHTML = this._mediaSearchSectionsHtml(mergedResults, searchRenderOptions);
      this._hydrateImages(body);
      return true;
    };
    if (providerPromise) {
      const providerResults = await providerPromise;
      completed = true;
      if (!isCurrentSearch()) return;
      if (applyProviderResults(providerResults)) hasInterimResults = true;
    }
    completed = true;
    if (!isCurrentSearch()) return;
    if (providerError || libraryError) {
      const notice = `<div class="notice open" role="alert">${this._esc(this._m(hasInterimResults ? "Some search sources could not be loaded. Try again." : "Search could not be completed. Try again.", hasInterimResults ? "חלק ממקורות החיפוש לא נטענו. נסה שוב." : "לא ניתן להשלים את החיפוש. נסה שוב."))}</div><button class="chip-btn" data-menu-action="retry_library">${this._esc(this._m("Retry", "נסה שוב"))}</button>`;
      if (hasInterimResults) resultsHost.insertAdjacentHTML("beforeend", notice);
      else resultsHost.innerHTML = notice;
    } else if (!hasInterimResults) {
      const mergedResults = this._mergeSearchResults(fastResults, this._emptySearchResults());
      resultsHost.innerHTML = this._mediaSearchSectionsHtml(mergedResults, searchRenderOptions);
      this._hydrateImages(body);
    }
  }

  _announcementsMenuHtml() {
    const text = this._state.mobileAnnouncementText || "";
    const presets = (this._state.mobileAnnouncementPresets || []).slice(0, 3);
    const targetValue = this._announcementTargetValue();
    const announcementVolume = this._announcementVolumePct();
    const announcementLanguage = this._announcementLanguageSetting();
    const targetOptions = [
      ["all", this._i18n("ui.announce_to_all_players")],
      ...this._announcementEligiblePlayers().map((player) => [player.entity_id, player.attributes?.friendly_name || player.entity_id]),
    ];
    const languageOptions = this._announcementLanguageOptions();
    return `
      <div class="announcements-shell">
        <div class="announcement-target">
          <span class="announcement-target-icon">${this._iconSvg("speaker")}</span>
          <select class="media-sort-select announcement-target-select" id="mobileAnnouncementTargetSelect" aria-label="${this._esc(this._i18n("ui.announcement_target"))}">
            ${targetOptions.map(([value, label]) => `<option value="${this._esc(value)}" ${value === targetValue ? "selected" : ""}>${this._esc(label)}</option>`).join("")}
          </select>
        </div>
        <div class="announcement-target announcement-language-target">
          <span class="announcement-target-icon">${this._iconSvg("announcement")}</span>
          <select class="media-sort-select announcement-target-select" id="mobileAnnouncementTtsLanguageSelect" aria-label="${this._esc(this._i18n("ui.announcement_language"))}">
            ${languageOptions.map(([value, label]) => `<option value="${this._esc(value)}" ${value === announcementLanguage ? "selected" : ""}>${this._esc(label)}</option>`).join("")}
          </select>
        </div>
        <div class="announcement-input-wrap">
          <textarea id="mobileAnnouncementText" class="announcement-textarea" rows="4" placeholder="${this._esc(this._i18n("ui.type_an_announcement"))}">${this._esc(text)}</textarea>
          <button class="announcement-voice-btn" data-announcement-voice title="${this._esc(this._i18n("ui.dictate"))}">${this._iconSvg("mic")}</button>
        </div>
        <div class="announcement-presets">
          ${presets.map((preset, index) => preset ? `
            <button class="settings-pill" data-announcement-preset-fill="${this._esc(index)}">${this._esc(preset)}</button>
          ` : ``).join("")}
        </div>
        <div class="settings-range announcement-volume-field">
          <div class="settings-label">${this._esc(this._i18n("ui.announcement_volume_boost"))}</div>
          <input id="mobileAnnouncementVolumeInput" type="range" min="20" max="50" step="1" value="${this._esc(String(announcementVolume))}">
          <div class="settings-value">+${this._esc(String(announcementVolume))}%</div>
        </div>
        <button class="action-btn announcement-send-btn" data-announcement-send>
          ${this._iconSvg("announcement")}
          <span>${this._esc(this._i18n("ui.announce"))}</span>
        </button>
      </div>
    `;
  }

  _announcementTtsEntity() {
    const explicit = String(this._state.mobileAnnouncementTtsEntity || this._config?.announcement_tts_entity || "").trim();
    if (explicit) return explicit;
    const ttsEntity = Object.keys(this._hass?.states || {}).find((entityId) => entityId.startsWith("tts."));
    return String(ttsEntity || "").trim();
  }

  _announcementLanguageOptions() {
    return [
      ["auto", this._i18n("ui.auto_cloud_default")],
      ["en-US", "English (US)"],
      ["en-GB", "English (UK)"],
      ["he-IL", this._i18n("ui.hebrew")],
      ["de-DE", "Deutsch"],
      ["fr-FR", "Français"],
      ["es-ES", "Español"],
      ["it-IT", "Italiano"],
    ];
  }

  _normalizeAnnouncementLanguage(value = "") {
    const normalized = String(value || "auto").trim();
    const allowed = new Set(this._announcementLanguageOptions().map(([option]) => option));
    return allowed.has(normalized) ? normalized : "auto";
  }

  _announcementLanguageSetting() {
    return this._normalizeAnnouncementLanguage(this._state.mobileAnnouncementTtsLanguage || this._config?.announcement_tts_language || "auto");
  }

  _announcementLanguageCode(text = "") {
    const configured = this._announcementLanguageSetting();
    if (configured !== "auto") return configured;
    return /[\u0590-\u05FF]/.test(String(text || "")) ? "he-IL" : "";
  }

  _announcementRecognitionLanguageCode() {
    const configured = this._announcementLanguageSetting();
    if (configured !== "auto") return configured;
    try {
      const browserLanguage = typeof navigator !== "undefined" ? navigator.language : "";
      const lang = this._hass?.locale?.language || this._hass?.language || browserLanguage || "";
      if (lang) return String(lang);
    } catch (_) {}
    return this._isHebrew() ? "he-IL" : "en-US";
  }

  _announcementPayloadWithLanguage(payload = {}, language = "") {
    const next = { ...payload };
    if (language) next.language = language;
    else delete next.language;
    if (next.options && !Object.keys(next.options).length) delete next.options;
    return next;
  }

  _preferredAnnouncementSayService(message = "") {
    const services = Object.keys(this._hass?.services?.tts || {});
    const hasHebrew = /[\u0590-\u05FF]/.test(String(message || ""));
    if (hasHebrew && services.includes("google_translate_say")) return "google_translate_say";
    return services.find((service) => service === "google_translate_say" || service.endsWith("_say")) || "";
  }

  _prepareAnnouncementVolumes(targets = []) {
    const boost = this._announcementVolumePct() / 100;
    return (Array.isArray(targets) ? targets : [])
      .map((player) => {
        const entityId = String(player?.entity_id || "").trim();
        const previousVolume = this._playerVolumeLevel(entityId);
        return {
          entityId,
          previousVolume,
          targetVolume: Number.isFinite(previousVolume) ? Math.max(0, Math.min(1, previousVolume + boost)) : boost,
          targetVolumePct: Math.round((Number.isFinite(previousVolume) ? Math.max(0, Math.min(1, previousVolume + boost)) : boost) * 100),
        };
      })
      .filter((snapshot) => snapshot.entityId);
  }

  _announcementVolumeSnapshot(playerOrEntityId, snapshots = []) {
    const entityId = String(playerOrEntityId?.entity_id || playerOrEntityId || "").trim();
    return snapshots.find((item) => item.entityId === entityId) || null;
  }

  _announcementTargetVolumePct(playerOrEntityId, snapshots = []) {
    const snapshot = this._announcementVolumeSnapshot(playerOrEntityId, snapshots);
    const value = Number(snapshot?.targetVolumePct);
    return Number.isFinite(value) ? Math.max(0, Math.min(100, Math.round(value))) : null;
  }

  _announcementTtsOptions(player, snapshots = [], language = "") {
    const options = {};
    if (language) options.language = language;
    const targetVolumePct = this._announcementTargetVolumePct(player, snapshots);
    if (Number.isFinite(targetVolumePct)) options.announce_volume = targetVolumePct;
    return options;
  }

  async _callMusicAssistantAnnouncement(player, url, snapshots = []) {
    const targetVolumePct = this._announcementTargetVolumePct(player, snapshots);
    return this._homeiiEngineAnnounce({
      message: url,
      player: player?.entity_id || "",
      players: [player?.entity_id || ""].filter(Boolean),
      volume: Number.isFinite(targetVolumePct) ? targetVolumePct : this._announcementVolumePct(),
      target: player?.entity_id || "",
    });
  }

  _announcementRestoreDelayMs(message = "") {
    const textLength = String(message || "").trim().length;
    return Math.max(5000, Math.min(22000, 3200 + textLength * 90));
  }

  _scheduleAnnouncementVolumeRestore(snapshots = [], delayMs = 0) {
    this._announcementVolumeRestoreTimers = this._announcementVolumeRestoreTimers || new Map();
    snapshots.forEach((snapshot) => {
      if (!snapshot?.entityId || !Number.isFinite(snapshot.previousVolume)) return;
      const existing = this._announcementVolumeRestoreTimers.get(snapshot.entityId);
      if (Array.isArray(existing)) existing.forEach((timer) => clearTimeout(timer));
      else if (existing) clearTimeout(existing);
      const baseDelay = Math.max(0, Number(delayMs) || 0);
      const delays = [baseDelay, baseDelay + 4500, baseDelay + 9000];
      const timers = delays.map((delay, index) => setTimeout(() => {
        this._setPlayerVolumeForAnnouncement(snapshot.entityId, snapshot.previousVolume).catch(() => {});
        if (index === delays.length - 1) this._announcementVolumeRestoreTimers.delete(snapshot.entityId);
      }, delay));
      this._announcementVolumeRestoreTimers.set(snapshot.entityId, timers);
    });
  }

  async _recordAnnouncementInHomeiiEngine(message = "", targets = [], options = {}) {
    if (!this._homeiiEngineEnabled()) return false;
    const cleanMessage = String(message || "").trim();
    if (!cleanMessage) return false;
    const players = (Array.isArray(targets) ? targets : [])
      .map((player) => String(player?.entity_id || player || "").trim())
      .filter(Boolean);
    try {
      const ready = await this._homeiiEngineReadyForPersistence();
      if (!ready) return false;
      await this._homeiiEngineAnnounce({
        message: cleanMessage,
        player: players.length === 1 ? players[0] : "",
        players,
        volume: this._announcementVolumePct(),
        language: String(options.language || "").trim(),
        target: String(options.target || this._announcementTargetValue() || "").trim(),
        sent: options.sent !== false,
      });
      return true;
    } catch (error) {
      this._debugLog("Engine announcement record skipped", error?.message || error);
      return false;
    }
  }

  async _sendMobileAnnouncement() {
    if (this._announcementSendPending) return;
    const message = String(this._state.mobileAnnouncementText || "").trim();
    const targetValue = this._announcementTargetValue();
    const eligiblePlayers = this._announcementEligiblePlayers();
    const targets = targetValue === "all"
      ? eligiblePlayers
      : eligiblePlayers.filter((player) => player.entity_id === targetValue);
    if (!message) {
      this._toastError(this._i18n("ui.enter_an_announcement_first"));
      return;
    }
    if (!targets.length) {
      this._toastError(this._i18n("ui.select_a_player_first"));
      return;
    }
    this._hapticTap([12, 24, 12]);
    const playerName = targetValue === "all"
      ? this._i18n("ui.all_players_2")
      : (targets[0]?.attributes?.friendly_name || targets[0]?.entity_id || this._selectedPlayerName());
    const preview = message.length > 72 ? `${message.slice(0, 69)}...` : message;
    const language = this._announcementLanguageCode(message);
    this._toast(this._i18n("ui.announcement_to_player_preview", {
      player: playerName,
      preview,
    }));
    this._announcementSendPending = true;
    try {
      const ttsEntity = this._announcementTtsEntity();
      const targetEntityIds = targets
        .map((player) => String(player?.entity_id || "").trim())
        .filter(Boolean);
      const volumeGroups = new Map();
      for (const snapshot of this._prepareAnnouncementVolumes(targets)) {
        const group = volumeGroups.get(snapshot.targetVolumePct) || [];
        group.push(snapshot.entityId);
        volumeGroups.set(snapshot.targetVolumePct, group);
      }
      const responses = await Promise.all([...volumeGroups].map(async ([volume, players]) => {
        try {
          const result = await this._homeiiEngineAnnounce({
            message, player: players.length === 1 ? players[0] : "", players,
            volume, language, tts_entity: ttsEntity, target: targetValue,
          });
          return Array.isArray(result?.results) && result.results.length ? result.results
            : players.map((player) => ({ player, ok: result?.ok === true || result?.sent === true }));
        } catch (error) {
          return players.map((player) => ({ player, ok: false, error: error?.message }));
        }
      }));
      const results = responses.flat();
      const failures = results.filter((item) => item?.ok !== true);
      const acknowledged = targetEntityIds.every((id) => results.some((item) => item?.player === id && item?.ok === true));
      if (!acknowledged || failures.length) {
        const names = targetEntityIds.filter((id) => !results.some((item) => item?.player === id && item?.ok === true))
          .map((id) => targets.find((player) => player.entity_id === id)?.attributes?.friendly_name || id);
        throw new Error(`${this._m("Announcement not confirmed", "הכריזה לא אושרה")}: ${names.join(", ") || playerName}`);
      }
      this._toastSuccess(this._i18n("ui.announcement_sent_to_player", { player: playerName }));
    } catch (error) {
      this._toastError(this._i18n("ui.announcement_failed_with_error", {
        error: error?.message ? `: ${error.message}` : "",
      }));
    } finally {
      // MA owns announcement completion and restores playback/volume. A browser
      // timer cannot infer audio duration and would overwrite later user changes.
      this._announcementSendPending = false;
    }
  }

  _startMobileAnnouncementVoice() {
    const SpeechRecognition = this._speechRecognitionCtor();
    const input = this.$("mobileAnnouncementText");
    if (!SpeechRecognition) {
      this._toastError(this._i18n("ui.voice_input_is_not_supported_on_this_device"));
      return;
    }
    try { this._voiceRecognition?.abort?.(); } catch (_) {}
    const recognition = new SpeechRecognition();
    this._voiceRecognition = recognition;
    recognition.lang = this._announcementRecognitionLanguageCode();
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;
    let capturedTranscript = false;
    let recognitionFailed = false;
    this._toast(this._i18n("ui.listening"));
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results || [])
        .map((result) => result?.[0]?.transcript || "")
        .join(" ")
        .trim();
      if (!transcript) return;
      capturedTranscript = true;
      this._state.mobileAnnouncementText = transcript;
      if (input) {
        input.value = transcript;
        input.focus({ preventScroll: true });
      }
    };
    recognition.onnomatch = () => {
      recognitionFailed = true;
      this._toastError(this._i18n("ui.no_speech_was_captured"));
    };
    recognition.onerror = () => {
      recognitionFailed = true;
      this._toastError(this._i18n("ui.voice_input_failed"));
    };
    recognition.onend = () => {
      if (!capturedTranscript && !recognitionFailed) this._toastError(this._i18n("ui.no_speech_was_captured"));
      if (this._voiceRecognition === recognition) this._voiceRecognition = null;
    };
    try { recognition.start(); } catch (_) { this._toastError(this._i18n("ui.voice_input_failed")); }
  }

  _groupPlayerStatusText(checked = false, connected = false, isOwner = false) {
    if (isOwner && connected && !checked) return this._m("Disconnects all", "מנתק הכל");
    if (isOwner && connected) return this._m("Master", "מוביל");
    if (checked && !connected) return this._m("Will join", "יצטרף");
    if (!checked && connected) return this._m("Will remove", "יוסר");
    if (checked || connected) return this._i18n("ui.connected");
    return this._m("Tap to join", "לחץ לצירוף");
  }

  _groupChangeSummaryText(groupDelta = null) {
    const delta = groupDelta || this._groupSelectionDelta(this._state.selectedPlayer, this._state.pendingGroupSelections || []);
    const parts = [];
    const ownerRemoved = !!(delta.ownerRemoved || (delta.owner && delta.removed?.includes?.(delta.owner)));
    if (ownerRemoved) {
      parts.push(this._m("Master removal disconnects all", "הסרת המוביל תנתק את כל הקבוצה"));
      return parts.join(" · ");
    }
    if (delta.added?.length) {
      parts.push(this._m(`${delta.added.length} to join`, delta.added.length === 1 ? "1 יצטרף" : `${delta.added.length} יצטרפו`));
    }
    if (delta.removed?.length) {
      parts.push(this._m(`${delta.removed.length} to remove`, delta.removed.length === 1 ? "1 יוסר" : `${delta.removed.length} יוסרו`));
    }
    return parts.filter(Boolean).join(" · ");
  }

  _syncMobileGroupActionState() {
    const selected = this._getSelectedPlayer();
    const groupDelta = this._groupSelectionDelta(selected?.entity_id, this._state.pendingGroupSelections || []);
    const hasChanges = !!(groupDelta.ownerRemoved || groupDelta.added.length || groupDelta.removed.length);
    const summary = this._groupChangeSummaryText(groupDelta);
    const summaryEl = this.shadowRoot?.querySelector("[data-group-change-summary]");
    if (summaryEl) {
      summaryEl.textContent = summary;
      summaryEl.hidden = !summary;
    }
    const applyButton = this.shadowRoot?.querySelector("[data-menu-action=\"apply_group\"]");
    if (applyButton) {
      applyButton.textContent = this._m("Update group", "עדכן קבוצה");
      applyButton.toggleAttribute("disabled", !hasChanges);
    }
  }

  _groupPlayerStatusClass(checked = false, connected = false, isOwner = false) {
    if (isOwner && connected && !checked) return "will-clear";
    if (isOwner && connected) return "master";
    if (checked && !connected) return "will-add";
    if (!checked && connected) return "will-remove";
    if (checked || connected) return "connected";
    return "idle";
  }

  _groupPlayerStatusIcon(checked = false, connected = false, isOwner = false) {
    if (isOwner && connected && !checked) return "close";
    if (isOwner && connected) return "speaker";
    if (!checked && connected) return "close";
    return checked ? "check" : "plus";
  }

  _groupMenuHtml() {
    this._refreshGroupingState();
    const players = this._getAvailableGroupPlayers();
    if (!players.length) return `<div class="notice open">${this._i18n("ui.no_extra_ma_players_2")}</div>`;
    const selected = this._getSelectedPlayer();
    const groupDelta = this._groupSelectionDelta(selected?.entity_id, this._state.pendingGroupSelections || []);
    const currentSet = new Set(groupDelta.currentAll || groupDelta.current);
    const desiredSet = new Set(groupDelta.desiredAll || groupDelta.desired);
    const ownerId = groupDelta.owner || "";
    const connectedNames = this._playerGroupMemberNames(selected);
    const groupCount = Math.max(this._playerGroupCount(selected), groupDelta.current.length ? groupDelta.current.length + 1 : 0);
    const groupVol = this._groupAverageVolume(selected);
    const groupVolumeAvailable = groupVol !== null && this._playerGroupMemberIds(selected).every((id) => HomeiiPlayersFoundation.playerCanSetVolume(this._playerByEntityId(id)));
    const changeSummary = this._groupChangeSummaryText(groupDelta);
    const hasChanges = !!(groupDelta.ownerRemoved || groupDelta.added.length || groupDelta.removed.length);
    const connectedRow = connectedNames.length > 1
      ? `<p class="group-members-summary">${this._esc(connectedNames.join(" · "))}</p>`
      : "";
    return `
      <div class="group-setup-intro"><h3>${this._esc(this._m("Listen together", "להאזין יחד"))}</h3><p>${this._esc(this._m("Select the speakers, then apply. Playback follows the group leader.", "בחר את הרמקולים ואז אשר. הניגון ימשיך לפי הנגן המוביל."))}</p></div>
      ${connectedRow}
      <div class="group-change-row" data-group-change-summary ${changeSummary ? "" : "hidden"}>${this._esc(changeSummary)}</div>
      ${groupCount > 1 ? `
        <details class="group-volume-card"><summary>${this._esc(this._i18n("ui.group_volume"))}</summary>
          <div class="group-volume-title">${this._esc(this._i18n("ui.group_volume"))}<span>${this._esc(String(groupCount))}</span></div>
          ${!groupVolumeAvailable ? `<div class="player-volume-unavailable" role="status">${this._esc(this._m("Not all members report a volume. Use the available player controls below.", "לא כל חברי הקבוצה מדווחים עוצמה. ניתן להשתמש בשליטה הזמינה לכל נגן בהמשך."))}</div>` : `          <div class="player-volume-row">
            <button class="player-mini-mute ${this._isGroupMuted(selected) ? "active" : ""}" data-group-mute="${this._esc(selected?.entity_id || "")}" title="${this._esc(this._i18n("ui.mute"))}">${this._iconSvg(this._isGroupMuted(selected) ? "volume_mute" : this._volumeIconName(selected))}</button>
            <input class="player-mini-volume" data-group-volume="${this._esc(selected?.entity_id || "")}" type="range" min="0" max="100" value="${groupVol}" style="--vol-pct:${groupVol}%">
          </div>`}

        </details>
      ` : ``}
      <div class="players-premium-grid">
      ${players.map((p) => {
        const checked = desiredSet.has(p.entity_id);
        const connected = currentSet.has(p.entity_id);
        const isOwner = p.entity_id === ownerId;
        const available = HomeiiPlayersFoundation.isPlayerAvailable(p);
        const statusClass = this._groupPlayerStatusClass(checked, connected, isOwner);
        const statusText = available ? this._groupPlayerStatusText(checked, connected, isOwner) : this._i18n("ui.disconnected");
        const playerGroupCount = this._playerGroupCount(p);
        const art = this._playerArtworkUrl(p, 180);
        const activePlayback = available && (p?.state === "playing" || (connected && this._playerByEntityId(ownerId)?.state === "playing"));
        const track = p.attributes?.media_title || p.attributes?.media_artist || "";
        return `
          <div class="group-player-card ${checked ? "checked" : ""} ${statusClass}" data-group-connected="${connected ? "true" : "false"}" data-group-owner="${isOwner ? "true" : "false"}">
            <label class="group-player-row player-premium-head ${checked ? "checked" : ""}">
              <span class="group-player-toggle ${checked ? "checked" : ""}" aria-hidden="true">${this._iconSvg(this._groupPlayerStatusIcon(checked, connected, isOwner))}</span>
              <span class="player-premium-art">
                ${art ? this._imgHtml(art, "", { loading: "lazy", fetchpriority: "low" }) : this._iconSvg("speaker")}
                ${playerGroupCount ? `<span class="player-group-badge">${this._esc(playerGroupCount)}</span>` : ``}
              </span>
              <span class="player-premium-copy">
                <span class="player-premium-title-row group-player-title-row">
                  <span class="player-premium-name">${this._esc(this._playerDisplayName(p, players))}</span>
                  <span class="player-premium-bars eq-icon ${activePlayback ? "is-active" : "is-static"}" aria-label="${this._esc(!available ? this._i18n("ui.disconnected") : activePlayback ? this._i18n("ui.playing") : this._i18n("ui.idle"))}"><span></span><span></span><span></span></span>
                </span>
                <span class="group-player-status ${statusClass}">${this._esc(statusText)}</span>
                ${track ? `<span class="player-premium-track">${this._esc(track)}</span>` : ``}
              </span>
              <input class="group-player-check" type="checkbox" data-menu-group-player="${this._esc(p.entity_id)}" data-group-owner="${isOwner ? "true" : "false"}" ${checked ? "checked" : ""} ${!available && !connected ? "disabled" : ""}>
            </label>
            ${available ? playerVolumeControlsHtml(this, p, { inline: true }) : ""}
          </div>
        `;
      }).join("")}
      </div>
      <div class="group-actions">
        <button class="action-btn" data-menu-action="apply_group" ${hasChanges ? "" : "disabled"}>${this._esc(groupCount > 1 ? this._m("Update group", "עדכן קבוצה") : this._m("Create group", "צור קבוצה"))}</button>
        ${groupCount > 1 ? `<button class="group-disconnect-all-btn" data-menu-action="clear_group">${this._esc(this._m("Disconnect all", "נתק הכול"))}</button>` : ""}
      </div>
    `;
  }

  _queueFlowCaptionForItem(item = null) {
    const media = item?.media_item || {};
    const isCurrent = item ? this._isQueueItemCurrent(item) : false;
    const attrs = isCurrent ? (this._getSelectedPlayer()?.attributes || {}) : {};
    const title = media.name || item?.name || attrs.media_title || "";
    const artist = Array.isArray(media.artists)
      ? media.artists.map((artistEntry) => artistEntry?.name).filter(Boolean).join(", ")
      : "";
    return {
      title,
      artist: artist || item?.media_artist || item?.artist_str || item?.artist || attrs.media_artist || "",
    };
  }

  _queueFlowCaptionForIndex(index = 0) {
    const items = Array.isArray(this._queueFlowCaptionItems) ? this._queueFlowCaptionItems : [];
    const safeIndex = Math.max(0, Math.min(items.length - 1, Math.round(Number(index) || 0)));
    return items[safeIndex] || { title: "", artist: "" };
  }

  _queueFlowWindowItems(queueItems = []) {
    const items = Array.isArray(queueItems) ? queueItems.filter(Boolean) : [];
    const activeIndex = Math.max(0, items.findIndex((item) => this._isQueueItemCurrent(item)));
    const maxItems = 72;
    if (items.length <= maxItems) return { items, activeIndex, startIndex: 0, totalCount: items.length };
    const half = Math.floor(maxItems / 2);
    const startIndex = Math.max(0, Math.min(items.length - maxItems, activeIndex - half));
    return {
      items: items.slice(startIndex, startIndex + maxItems),
      activeIndex: Math.max(0, activeIndex - startIndex),
      startIndex,
      totalCount: items.length,
    };
  }

  _libraryFlowWindowItems(items = []) {
    const entries = Array.isArray(items) ? items.filter(Boolean) : [];
    const maxItems = 72;
    if (entries.length <= maxItems) return { items: entries, activeIndex: 0, startIndex: 0, totalCount: entries.length };
    return {
      items: entries.slice(0, maxItems),
      activeIndex: 0,
      startIndex: 0,
      totalCount: entries.length,
    };
  }

  _libraryFlowCaptionForItem(item = {}, fallbackType = "album", options = {}) {
    const mediaType = String(item?.media_type || item?.type || fallbackType || "album").toLowerCase();
    const title = item?.name || item?.title || item?.media_item?.name || "";
    if (options.captionMode === "album_year") {
      const year = this._mediaYearValue(item);
      return { title, artist: year ? String(year) : "" };
    }
    if (options.captionMode === "radio_station") {
      return { title, artist: "" };
    }
    const artist = this._artistName(item)
      || item?.artist
      || item?.artist_str
      || item?.album?.name
      || item?.publisher
      || (mediaType === "artist" ? this._i18n("ui.artist") : "")
      || (mediaType === "radio" ? this._i18n("ui.radio") : "");
    return { title, artist };
  }

  _libraryFlowPickerHtml(items = [], mediaType = "album", options = {}) {
    const windowState = this._libraryFlowWindowItems(items);
    const entries = windowState.items;
    if (!entries.length) return `<div class="notice open">${this._i18n("ui.no_results_found")}</div>`;
    const activeIndex = windowState.activeIndex;
    const iconMap = { track: "tracks", radio: "radio", album: "album", artist: "artist", podcast: "podcast", playlist: "playlist" };
    const caption = this._libraryFlowCaptionForItem(entries[activeIndex] || entries[0], mediaType, options);
    this._queueFlowCaptionItems = entries.map((item) => this._libraryFlowCaptionForItem(item, mediaType, options));
    const extraClass = String(options.className || "").trim();
    const fullPage = options.fullPage === true;
    const stageHtml = `
        <div class="queue-flow-stage library-flow-stage ${this._esc(extraClass)} ${fullPage ? "library-flow-full-stage" : ""}" data-queue-flow-stage data-queue-flow-total="${this._esc(String(windowState.totalCount))}" data-queue-flow-start="${this._esc(String(windowState.startIndex))}">
          <div class="queue-flow-picker" data-queue-flow-picker>
            <div class="queue-flow-track">
              ${entries.map((item, index) => {
                const entryMediaType = String(item?.media_type || item?.type || mediaType || "album").toLowerCase();
                const canOpenDetails = options.openDetails !== false && this._mediaTypeCanOpenDetails(entryMediaType);
                const uri = String(item?.uri || item?.media_item?.uri || "").trim();
                const art = this._artUrl(item, { size: 220 }) || item?.image || item?.image_url || "";
                const artistName = this._artistName(item) || item?.artist || "";
                const albumName = typeof item?.album === "string" ? item.album : item?.album?.name || "";
                const fallbackIcon = iconMap[entryMediaType] || iconMap[mediaType] || "album";
                const itemCaption = this._libraryFlowCaptionForItem(item, mediaType, options);
                const actionAttr = uri ? (canOpenDetails ? `data-media-open="${this._esc(uri)}"` : `data-media-uri="${this._esc(uri)}"`) : "";
                const favoriteScope = item?.radio_browser || item?.radio_browser_id ? "radio_browser" : (item?.favorite_scope || options.favorite_scope || "library");
                return `
                  <button class="queue-flow-item library-flow-item ${index === activeIndex ? "active centered" : ""}" data-library-flow-item="1" ${actionAttr} data-flow-caption-title="${this._esc(itemCaption.title)}" data-flow-caption-artist="${this._esc(itemCaption.artist)}" data-media-type="${this._esc(entryMediaType)}" data-media-name="${this._esc(item?.name || item?.title || "")}" data-media-artist="${this._esc(artistName)}" data-media-album="${this._esc(albumName)}" data-media-image="${this._esc(art || "")}" data-media-favorite-scope="${this._esc(favoriteScope)}" ${uri ? "" : "disabled"}>
                    <span class="queue-flow-art" ${art ? `data-img="${this._esc(art)}" data-placeholder="${this._esc(fallbackIcon)}"` : ""}>
                      ${this._iconSvg(fallbackIcon)}
                    </span>
                  </button>
                `;
              }).join("")}
            </div>
          </div>
          <div class="queue-flow-caption" data-queue-flow-caption ${caption.title || caption.artist ? "" : "hidden"}>
            <div class="queue-flow-caption-title" data-queue-flow-caption-title>${this._esc(caption.title)}</div>
            <div class="queue-flow-caption-artist" data-queue-flow-caption-artist>${this._esc(caption.artist)}</div>
          </div>
        </div>
    `;
    if (fullPage) return stageHtml;
    return `
      <div class="library-flow-panel ${this._esc(extraClass)}">
        ${stageHtml}
      </div>
    `;
  }

  _queueFlowFallbackHtml() {
    const player = this._getSelectedPlayer();
    const item = this._state.maQueueState?.current_item || null;
    const attrs = player?.attributes || {};
    const art = this._queueItemImageUrl(item, 220)
      || this._currentArtworkUrl(player, item, 220, { preferPlayerArtwork: true })
      || this._imageUrl(attrs.entity_picture_local, 220)
      || this._imageUrl(attrs.entity_picture, 220)
      || this._imageUrl(attrs.media_image_url, 220);
    const caption = {
      title: item?.media_item?.name || item?.name || attrs.media_title || "",
      artist: item?.media_artist || item?.artist_str || attrs.media_artist || "",
    };
    this._queueFlowCaptionItems = [caption];
    return `
      <div class="queue-flow-stage queue-flow-empty" data-queue-flow-stage>
        <div class="queue-flow-picker" data-queue-flow-picker>
          <div class="queue-flow-track">
            <button class="queue-flow-item active centered queue-flow-static" disabled>
              <span class="queue-flow-art" ${art ? `data-img="${this._esc(art)}" data-placeholder="album"` : ""}>
                ${this._iconSvg("album")}
              </span>
            </button>
          </div>
        </div>
        <div class="queue-flow-caption" data-queue-flow-caption ${caption.title || caption.artist ? "" : "hidden"}>
          <div class="queue-flow-caption-title" data-queue-flow-caption-title>${this._esc(caption.title)}</div>
          <div class="queue-flow-caption-artist" data-queue-flow-caption-artist>${this._esc(caption.artist)}</div>
        </div>
      </div>
    `;
  }

  _queueFlowPickerHtml(queueItems = []) {
    if (!this._mobileQueueFlowMenuActive()) return "";
    const windowState = this._queueFlowWindowItems(queueItems);
    const items = windowState.items;
    if (!items.length) return this._queueFlowFallbackHtml();
    const activeIndex = windowState.activeIndex;
    const caption = this._queueFlowCaptionForItem(items[activeIndex] || items[0]);
    this._queueFlowCaptionItems = items.map((item) => this._queueFlowCaptionForItem(item));
    return `
      <div class="queue-flow-stage" data-queue-flow-stage data-queue-flow-total="${this._esc(String(windowState.totalCount))}" data-queue-flow-start="${this._esc(String(windowState.startIndex))}">
        <div class="queue-flow-picker" data-queue-flow-picker>
          <div class="queue-flow-track">
            ${items.map((item, index) => {
              const key = this._getQueueItemKey(item);
              const media = item.media_item || {};
              const img = this._queueItemImageUrl(item, 220);
              const current = this._isQueueItemCurrent(item);
              return `
                <button class="queue-flow-item ${current ? "active centered" : ""}" data-queue-flow-item="1" data-queue-item-id="${this._esc(key)}" data-uri="${this._esc(media.uri || this._getQueueItemUri(item) || "")}" data-type="${this._esc(media.media_type || item.media_type || "track")}" data-sort-index="${this._esc(item.sort_index ?? "")}" data-queue-position="${this._esc(String(windowState.startIndex + index + 1))}">
                  <span class="queue-flow-art" ${img ? `data-img="${this._esc(img)}" data-placeholder="album"` : ""}>
                    ${this._iconSvg("album")}
                  </span>
                </button>
              `;
            }).join("")}
          </div>
        </div>
        <div class="queue-flow-caption" data-queue-flow-caption ${caption.title || caption.artist ? "" : "hidden"}>
          <div class="queue-flow-caption-title" data-queue-flow-caption-title>${this._esc(caption.title)}</div>
          <div class="queue-flow-caption-artist" data-queue-flow-caption-artist>${this._esc(caption.artist)}</div>
        </div>
      </div>
    `;
  }

  _syncQueueFlowPickerCenter(picker = null) {
    const host = picker || this.$("mobileMenuBody")?.querySelector?.("[data-queue-flow-picker]");
    if (!host) return;
    const items = Array.from(host.querySelectorAll?.(".queue-flow-item") || []);
    if (!items.length) return;
    const first = items[0];
    const second = items[1] || null;
    const firstCenter = Number(first.offsetTop || 0) + (Number(first.offsetHeight || 0) / 2);
    const measuredStep = second ? Number(second.offsetTop || 0) - Number(first.offsetTop || 0) : 0;
    const itemStep = Math.max(1, measuredStep || (Number(first.offsetHeight || 0) + 22));
    const centerY = Number(host.scrollTop || 0) + (Number(host.clientHeight || 0) / 2);
    const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
    const nearestIndex = clamp(Math.round((centerY - firstCenter) / itemStep), 0, items.length - 1);
    items.forEach((item, index) => {
      const itemCenter = firstCenter + (index * itemStep);
      const distanceRatio = clamp((itemCenter - centerY) / itemStep, -3, 3);
      const absRatio = Math.abs(distanceRatio);
      const delta = nearestIndex >= 0 ? index - nearestIndex : 0;
      const depth = Math.min(3, Math.floor(absRatio + 0.62));
      const scale = clamp(1.06 - (absRatio * 0.15), 0.58, 1.06);
      const opacity = clamp(1 - (absRatio * 0.26), 0.18, 1);
      const blur = clamp(absRatio * 0.48, 0, 1.25);
      const z = clamp(30 - (absRatio * 38), -86, 30);
      const rotate = clamp(distanceRatio * -5.5, -16, 16);
      const saturate = clamp(1 - (absRatio * 0.13), 0.62, 1);
      const brightness = clamp(1 - (absRatio * 0.09), 0.7, 1);
      item.classList.toggle("centered", index === nearestIndex);
      item.classList.toggle("is-before", delta < 0);
      item.classList.toggle("is-after", delta > 0);
      item.classList.toggle("depth-1", depth === 1);
      item.classList.toggle("depth-2", depth === 2);
      item.classList.toggle("depth-3", depth >= 3);
      item.style.setProperty("--queue-flow-scale", scale.toFixed(3));
      item.style.setProperty("--queue-flow-opacity", opacity.toFixed(3));
      item.style.setProperty("--queue-flow-blur", `${blur.toFixed(2)}px`);
      item.style.setProperty("--queue-flow-z", `${z.toFixed(1)}px`);
      item.style.setProperty("--queue-flow-rotate", `${rotate.toFixed(2)}deg`);
      item.style.setProperty("--queue-flow-saturate", saturate.toFixed(3));
      item.style.setProperty("--queue-flow-brightness", brightness.toFixed(3));
      item.style.setProperty("--queue-flow-y", `${(distanceRatio * -2).toFixed(1)}px`);
    });
    const caption = host.closest?.("[data-queue-flow-stage]")?.querySelector?.("[data-queue-flow-caption]");
    if (caption) {
      const centeredItem = items[nearestIndex] || null;
      const entry = centeredItem?.dataset?.flowCaptionTitle !== undefined || centeredItem?.dataset?.flowCaptionArtist !== undefined
        ? { title: centeredItem?.dataset?.flowCaptionTitle || "", artist: centeredItem?.dataset?.flowCaptionArtist || "" }
        : this._queueFlowCaptionForIndex(nearestIndex);
      const titleEl = caption.querySelector?.("[data-queue-flow-caption-title]");
      const artistEl = caption.querySelector?.("[data-queue-flow-caption-artist]");
      if (titleEl) titleEl.textContent = entry.title || "";
      if (artistEl) artistEl.textContent = entry.artist || "";
      caption.hidden = !(entry.title || entry.artist);
    }
  }

  _bindQueueFlowPicker(body = this.$("mobileMenuBody")) {
    const pickers = Array.from(body?.querySelectorAll?.("[data-queue-flow-picker]") || []);
    if (!pickers.length) return;
    const scheduleFrame = (callback) => {
      if (typeof window !== "undefined" && typeof window.requestAnimationFrame === "function") window.requestAnimationFrame(callback);
      else setTimeout(callback, 0);
    };
    pickers.forEach((picker) => {
      if (!picker || picker.dataset.queueFlowBound === "1") return;
      picker.dataset.queueFlowBound = "1";
      picker.addEventListener("scroll", () => {
        scheduleFrame(() => this._syncQueueFlowPickerCenter(picker));
      }, { passive: true });
      const active = picker.querySelector(".queue-flow-item.active") || picker.querySelector(".queue-flow-item");
      const sync = () => {
        try { active?.scrollIntoView?.({ block: "center", inline: "nearest" }); } catch (_) {}
        this._syncQueueFlowPickerCenter(picker);
      };
      scheduleFrame(sync);
    });
  }

  _artistAlbumFlowMenuHtml() {
    const detail = this._state.mobileLibraryDetail || {};
    const albums = Array.isArray(detail.albums) ? detail.albums : [];
    return this._libraryFlowPickerHtml(albums, "album", {
      className: "artist-album-flow-page",
      captionMode: "album_year",
      fullPage: true,
    });
  }

  _queuePlaybackOptionsHtml(...args) {
    return queuePlaybackOptionsHtml.apply(this, args);
  }

  async _toggleQueueAutoplay(...args) {
    return toggleQueueAutoplay.apply(this, args);
  }

  _queueMenuHtml() {
    const queueItems = this._getNowPlayingQueueItems();
    const flowItems = this._mobileQueueFlowMenuActive() ? this._mobileQueueItemsSorted() : queueItems;
    const visibleQueueItems = queueItems.length ? queueItems : flowItems;
    const refreshFailed = this._state.queueSnapshotError?.entityId === this._state.selectedPlayer;
    const statusNotice = this._queuePlaybackOptionsHtml() + (refreshFailed ? `<div class="notice open" role="status">${this._esc(visibleQueueItems.length
      ? this._m("Queue refresh failed. Showing the last confirmed queue; retrying automatically.", "רענון התור נכשל. מוצג התור האחרון שאומת; מנסה שוב אוטומטית.")
      : this._m("Could not load the queue. Retrying automatically.", "לא ניתן לטעון את התור. מנסה שוב אוטומטית."))}</div>` : "");
    if (this._mobileQueueFlowMenuActive()) return statusNotice + this._queueFlowPickerHtml(flowItems);
    if (!visibleQueueItems.length && refreshFailed) return statusNotice;
    if (!visibleQueueItems.length) return statusNotice + `<div class="notice open">${this._i18n("ui.queue_is_empty")}</div>`;
    const virtualStart = Math.max(0, Math.min(visibleQueueItems.length, Number(this._queueVirtualStart || 0)));
    const virtualEnd = Math.min(visibleQueueItems.length, virtualStart + 72);
    const renderedQueueItems = visibleQueueItems.slice(virtualStart, virtualEnd);
    this._prefetchQueueArtworkWindow(flowItems.length ? flowItems : visibleQueueItems, { immediate: true, before: 2, after: 18, visibleStartIndex: virtualStart, visibleCount: renderedQueueItems.length });
    const rowHeight = 104;
    return `${statusNotice}${this._queueFlowPickerHtml(flowItems)}<div class="queue-list" data-homeii-virtual-total="${this._esc(String(visibleQueueItems.length))}" data-virtual-columns="1" data-virtual-row-height="${rowHeight}">${virtualStart ? `<div class="virtual-list-spacer top" style="height:${this._esc(String(virtualStart * rowHeight))}px;pointer-events:none" aria-hidden="true"></div>` : ""}${renderedQueueItems.map((item, index) => {
      const key = this._getQueueItemKey(item);
      const img = this._queueItemImageUrl(item, 120);
      const artist = item.media_item?.artists?.map((a) => a.name).join(", ") || "";
      const current = this._isQueueItemCurrent(item);
      const media = item.media_item || {};
      const expanded = String(this._state.expandedQueueItemId || "") === String(key || "");
      const displayPosition = virtualStart + index + 1;
      const queueLead = this._esc(String(displayPosition));
      return `
        <div class="queue-row ${current ? "active" : ""} ${expanded ? "expanded" : ""}" data-queue-item-id="${this._esc(key)}" data-uri="${this._esc(item.media_item?.uri || "")}" data-type="track" data-sort-index="${this._esc(item.sort_index ?? "")}" data-queue-position="${this._esc(String(displayPosition))}">
          <button class="queue-index queue-drag-handle" data-queue-drag title="${this._esc(this._m("Drag to reorder; use Actions to choose a position", "גרור לשינוי סדר; בתפריט הפעולות ניתן לבחור מיקום"))}" aria-label="${this._esc(this._m("Reorder", "שינוי סדר"))} ${queueLead}"><svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true"><circle cx="8" cy="6" r="1.6"/><circle cx="16" cy="6" r="1.6"/><circle cx="8" cy="12" r="1.6"/><circle cx="16" cy="12" r="1.6"/><circle cx="8" cy="18" r="1.6"/><circle cx="16" cy="18" r="1.6"/></svg></button>
          <div class="menu-thumb" ${img ? `data-img="${this._esc(img)}" data-placeholder="album"` : ""}>${this._iconSvg("album")}</div>
          <div class="queue-meta">
            <div class="queue-title">${this._esc(item.media_item?.name || item.name || "")}</div>
            <div class="queue-sub">${this._esc(artist)}</div>
          </div>
          <div class="queue-actions">
            <button class="chip-btn queue-more-btn" data-queue-menu="${this._esc(key)}" data-queue-uri="${this._esc(media.uri || "")}" data-queue-sort-index="${this._esc(item.sort_index ?? "")}" data-queue-position="${this._esc(String(displayPosition))}" data-queue-name="${this._esc(media.name || item.name || "")}" data-queue-artist="${this._esc(artist)}" data-queue-album="${this._esc(media.album?.name || "")}" data-queue-image="${this._esc(img || media.image || media.album?.image || "")}" title="${this._esc(this._i18n("ui.actions_2"))}" aria-expanded="${expanded ? "true" : "false"}">${this._iconSvg("more")}</button>
          </div>
          ${expanded ? this._renderQueueInlineActions(item, displayPosition, visibleQueueItems.length) : ""}
        </div>
      `;
    }).join("")}${virtualEnd < visibleQueueItems.length ? `<div class="virtual-list-spacer bottom" style="height:${this._esc(String((visibleQueueItems.length - virtualEnd) * rowHeight))}px;pointer-events:none" aria-hidden="true"></div>` : ""}</div>`;
  }

  _queueLikeEntryForItem(item = {}) {
    const media = item?.media_item || {};
    const artist = Array.isArray(media?.artists) ? media.artists.map((entry) => entry?.name).filter(Boolean).join(", ") : "";
    const image = this._queueItemImageUrl(item, 120) || media.image || media.image_url || media.album?.image || media.album?.image_url || "";
    return {
      uri: media.uri || item?.uri || "",
      media_type: media.media_type || item?.media_type || "track",
      name: media.name || item?.name || "",
      artist,
      album: media.album?.name || item?.album || "",
      image,
    };
  }

  _queueLikeActionButtonHtml(item = {}, key = "") {
    const itemKey = key || this._getQueueItemKey(item);
    const likeEntry = this._queueLikeEntryForItem(item);
    if (!String(likeEntry.uri || "").trim()) return "";
    const liked = this._isEntryLiked(likeEntry);
    return `<button class="chip-btn icon-only queue-inline-like like-action ${liked ? "active" : ""}" data-queue-action="like" data-queue-item-id="${this._esc(itemKey)}" data-queue-uri="${this._esc(likeEntry.uri)}" data-queue-type="${this._esc(likeEntry.media_type)}" data-queue-name="${this._esc(likeEntry.name)}" data-queue-artist="${this._esc(likeEntry.artist)}" data-queue-album="${this._esc(likeEntry.album)}" data-queue-image="${this._esc(likeEntry.image)}" title="${this._esc(this._i18n("ui.like_2"))}" aria-pressed="${liked ? "true" : "false"}" data-queue-liked="${liked ? "true" : "false"}">${this._iconSvg(liked ? "heart_filled" : "heart_outline")}</button>`;
  }

  _renderQueueInlineActions(item, displayPosition = null, queueCountOverride = null) {
    const key = this._getQueueItemKey(item);
    const queueCount = Math.max(1, Math.round(Number(queueCountOverride)) || this._getNowPlayingQueueItems().length || (this._state.queueItems || []).length || Number(this._state.maQueueState?.items || 1));
    const currentPosition = Math.max(1, Math.min(queueCount, Math.round(Number(displayPosition)) || this._queueDisplayPositionForEntry(item, Math.round(Number(item?.sort_index || 0)) + 1 || 1)));
    const likeActionHtml = this._queueLikeActionButtonHtml(item, key);
    return `
      <div class="queue-inline-actions">
        <button class="chip-btn primary ${this._mobileFooterMode() === "icon" ? "icon-only" : "text-action"}" data-queue-action="next" data-queue-item-id="${this._esc(key)}" title="${this._esc(this._i18n("ui.play_next"))}" aria-label="${this._esc(this._i18n("ui.play_next"))}">${this._iconSvg("queue_next")}${this._mobileFooterMode() === "icon" ? "" : `<span>${this._esc(this._i18n("ui.play_next"))}</span>`}</button>
        <button class="chip-btn secondary ${this._mobileFooterMode() === "icon" ? "icon-only" : "text-action"}" data-queue-action="play" data-queue-item-id="${this._esc(key)}" title="${this._esc(this._i18n("ui.play_now"))}" aria-label="${this._esc(this._i18n("ui.play_now"))}">${this._iconSvg("play")}${this._mobileFooterMode() === "icon" ? "" : `<span>${this._esc(this._i18n("ui.play_now"))}</span>`}</button>
        ${likeActionHtml}
        <label class="queue-inline-move">
          ${this._queueMoveSelectHtml(queueCount, currentPosition, { ...item, key, position: currentPosition })}
        </label>
        <button class="chip-btn warn icon-only" data-queue-action="remove" data-queue-item-id="${this._esc(key)}" title="${this._esc(this._i18n("ui.remove"))}">${this._iconSvg("trash")}</button>
      </div>`;
  }

  _setQueueInlineActionsExpanded(key = "") {
    const nextKey = String(key || "");
    this._state.expandedQueueItemId = nextKey;
    const body = this.$("mobileMenuBody");
    if (!body) return;
    body.querySelectorAll(".queue-row[data-queue-item-id]").forEach((row) => {
      const expanded = nextKey && String(row.dataset.queueItemId || "") === nextKey;
      const actions = row.querySelector(".queue-inline-actions");
      if (expanded && !actions) {
        const items = this._getNowPlayingQueueItems();
        const item = items.find((entry) => String(this._getQueueItemKey(entry)) === nextKey);
        if (item) row.insertAdjacentHTML("beforeend", this._renderQueueInlineActions(item, Number(row.dataset.queuePosition), items.length));
      } else if (!expanded) {
        actions?.remove();
      }
      row.classList.toggle("expanded", !!expanded);
      row.querySelector("[data-queue-menu]")?.setAttribute("aria-expanded", expanded ? "true" : "false");
    });
  }

  _scheduleVisibleQueueSync() {
    const body = this.$("mobileMenuBody");
    if (!this._state.menuOpen || this._state.menuPage !== "queue" || body?.dataset.menuPage !== "queue") return;
    if (body.dataset.queueSignature === this._queueRenderSignature() || this._visibleQueueSyncTimer) return;
    this._visibleQueueSyncTimer = setTimeout(() => {
      this._visibleQueueSyncTimer = null;
      if (!this.isConnected || !this._state.menuOpen || this._state.menuPage !== "queue") return;
      if (this._queueDragActive || this._queueDragPending || this._mobileQueueActionPending) { this._scheduleVisibleQueueSync(); return; }
      this._renderMobileMenu().catch(() => {});
    }, 180);
  }

  async _renderMobileMenu() {
    const body = this.$("mobileMenuBody");
    const title = this.$("mobileMenuTitle");
    const back = this.$("mobileMenuBackBtn");
    const aux = this.$("mobileMenuAuxBtn");
    const close = this.$("mobileMenuCloseBtn");
    if (!body || !title || !back || !aux || !close) return;
    const page = this._normalizeMobileMenuPage(this._state.menuPage || "main");
    if (page !== this._state.menuPage) this._state.menuPage = page;
    if (page === "sleep_timer" && this._isScheduleFormEditing()) return;
    const renderStarted = typeof performance !== "undefined" && typeof performance.now === "function"
      ? performance.now()
      : Date.now();
    const renderToken = (this._mobileMenuRenderToken = (this._mobileMenuRenderToken || 0) + 1);
    const isCurrentRender = () => (
      renderToken === this._mobileMenuRenderToken
      && this._state.menuOpen
      && this._state.menuPage === page
    );
    const previousRenderedPage = body.dataset.menuPage || "";
    const scrollSnapshot = previousRenderedPage === page ? this._captureMobileMenuScroll(page) : null;
    const finishMenuRender = () => {
      if (!isCurrentRender()) return false;
      body.dataset.menuPage = page;
      syncScreenDock(this, body.parentElement, page);
      if (page === "queue") body.dataset.queueSignature = this._queueRenderSignature();
      if (scrollSnapshot) this._restoreMobileMenuScrollSnapshot(scrollSnapshot, page);
      this._hydrateImages(body);
      this._bindQueueFlowPicker(body);
      const renderFinished = typeof performance !== "undefined" && typeof performance.now === "function"
        ? performance.now()
        : Date.now();
      const renderMs = Math.max(0, renderFinished - renderStarted);
      this._performanceMetrics.menuRenders += 1;
      this._performanceMetrics.lastMenuRenderMs = Number(renderMs.toFixed(2));
      this._performanceMetrics.slowestMenuRenderMs = Math.max(
        Number(this._performanceMetrics.slowestMenuRenderMs || 0),
        Number(renderMs.toFixed(2)),
      );
      this._performanceMetrics.lastMenuPage = page;
      this._performanceMetrics.lastMenuDomNodes = body.querySelectorAll?.("*")?.length || 0;
      return true;
    };
    const hasBackTarget = Array.isArray(this._state.menuStack) && this._state.menuStack.length > 0;
    const currentDetailType = page === "media_detail" ? this._libraryDetailMediaType(this._state.mobileLibraryDetail || {}) : "";
    const isArtistDetailPage = page === "media_detail" && currentDetailType === "artist";
    const isLibraryDetailPage = page === "media_detail";
    const isSearchPage = this._isMobileSearchPage(page);
    const isLibraryPage = page.startsWith("library_") || isLibraryDetailPage;
    const isTabletLibraryPage = (page.startsWith("library_") || isArtistDetailPage) && this._layoutModeConfig() === "tablet";
    const isPhoneFullscreenPage = this._isPhoneActionFullscreenMenuPage(page) || isArtistDetailPage;
    back.hidden = !(hasBackTarget || (page === "media_detail" && Array.isArray(this._state.mobileLibraryDetailStack) && this._state.mobileLibraryDetailStack.length));
    aux.hidden = true;
    close.hidden = false;
    body.classList.toggle("library-mode", isLibraryPage);
    body.classList.toggle("library-flow-mode", this._libraryFlowPageActive(page) || page === "artist_album_flow");
    body.classList.toggle("search-mode", isSearchPage);
    this.$("mobileMenu")?.classList.toggle("search-open", isSearchPage);
    this.$("mobileMenu")?.classList.toggle("discovery-open", page === "discovery");
    this.$("mobileMenu")?.classList.toggle("action-fullscreen-open", isPhoneFullscreenPage);
    this.$("mobileMenu")?.classList.toggle("library-fullscreen-open", isTabletLibraryPage);
    this.$("homeShortcutFab")?.toggleAttribute("hidden", page === "discovery" || isTabletLibraryPage);
    this._syncCompactMenuOverlayState();
    const menu = this.$("mobileMenu");
    const sheet = menu?.querySelector(".menu-sheet");
    const detail = page === "media_detail" ? (this._state.mobileLibraryDetail || {}) : null;
    const detailArt = detail ? this._libraryDetailArtworkUrl(detail, 960) : "";
    const menuArt = detailArt || this._currentArtworkUrl(this._getSelectedPlayer(), this._state.maQueueState?.current_item || null, 720);
    if (menu) {
      if (menuArt) {
        menu.style.setProperty("--menu-dynamic-art", `url(${JSON.stringify(menuArt)})`);
        menu.classList.add("has-menu-art");
      } else {
        menu.style.removeProperty("--menu-dynamic-art");
        menu.classList.remove("has-menu-art");
      }
      if (detail) this._applyMenuDetailTheme(menu, detailArt, detail);
      else this._clearMenuDetailTheme(menu);
    }
    const sheetClasses = [
      "sheet-actions",
      "sheet-simple",
      "sheet-players",
      "sheet-queue",
      "sheet-queue-flow",
      "sheet-library",
      "sheet-media-detail",
      "sheet-artist-detail",
      "sheet-search",
      "sheet-group",
      "sheet-transfer",
      "sheet-announcements",
      "sheet-settings",
      "sheet-schedules",
      "sheet-discovery",
    ];
    body.classList.remove(...sheetClasses);
    sheet?.classList.remove(...sheetClasses);
    const sheetClass =
      page === "main"
        ? "sheet-actions"
        : page === "discovery"
          ? "sheet-discovery"
          : page === "simple_wizard"
            ? "sheet-simple"
            : page === "players" || page === "players_active"
          ? "sheet-players"
          : page === "artist_album_flow"
            ? "sheet-queue-flow"
          : page === "queue"
            ? (this._mobileQueueFlowMenuActive() ? "sheet-queue-flow" : "sheet-queue")
            : page === "media_detail"
              ? (isArtistDetailPage ? "sheet-artist-detail" : "sheet-media-detail")
            : isSearchPage
              ? "sheet-search"
              : isLibraryPage
                ? "sheet-library"
                : page === "group"
                  ? "sheet-group"
                  : page === "transfer"
                    ? "sheet-transfer"
                    : page === "announcements"
                      ? "sheet-announcements"
                      : page === "settings" || page === "diagnostics" || page === "queue_settings"
                        ? "sheet-settings"
                        : page === "sleep_timer"
                          ? "sheet-schedules"
                          : "";
    if (sheetClass) {
      body.classList.add(sheetClass);
      sheet?.classList.add(sheetClass);
    }

    if (page === "main") {
      this._setMobileMenuHeader(this._i18n("ui.actions_2"), this._menuPageIcon(page));
      body.innerHTML = this._mainMenuHtml();
      finishMenuRender();
      return;
    }
    if (page === "simple_wizard") {
      this._setMobileMenuHeader("FLOW", this._menuPageIcon(page));
      body.innerHTML = this._simpleWizardHtml();
      finishMenuRender();
      return;
    }
    if (page === "discovery") {
      this._setMobileMenuHeader(this._i18n("ui.discover_music", {}, this._m("Discover", "גילוי מוזיקה")), this._menuPageIcon(page));
      const previous = this._discoveryLastView;
      const sameSelection = previous?.activeCategory?.key === this._discoveryCategory().key
        && previous?.selectedProvider === (this._state.discoveryProviderPath || "all");
      this._updateDiscoveryMenuBody(body, sameSelection ? previous : { providers: previous?.providers || [], loading: true });
      let discovery;
      try {
        discovery = await this._loadDiscoverySections();
        if (isCurrentRender()) this._discoveryLastView = discovery;
      } catch (error) {
        discovery = { providers: this._discoveryLastView?.providers || [], sections: [], error: this._m("Unable to load this source. Please retry.", "לא ניתן לטעון את המקור. נסה שוב.") };
        this._debugLog("warn", "[HOMEii Flow] Discovery source failed", error);
      }
      if (!isCurrentRender()) return;
      this._updateDiscoveryMenuBody(body, discovery);
      finishMenuRender();
      return;
    }
    if (page === "quick_search") {
      this._setMobileMenuHeader(this._i18n("ui.search"), this._menuPageIcon(page));
      body.innerHTML = this._quickSearchShellHtml();
      this._bindMobileMediaSearch();
      await this._renderMobileMediaResults();
      if (!isCurrentRender()) return;
      finishMenuRender();
      return;
    }
    if (page === "queue_settings") {
      this._setMobileMenuHeader(this._m("Playback preferences", "העדפות ניגון"), "settings");
      if (previousRenderedPage !== page || !body.querySelector(".queue-settings-form")) {
        await loadQueueSettings(this, body, isCurrentRender);
      }
      finishMenuRender();
      return;
    }
    if (page === "settings") {
      this._setMobileMenuHeader(this._i18n("ui.settings"), this._menuPageIcon(page));
      body.innerHTML = this._settingsMenuHtml();
      finishMenuRender();
      return;
    }
    if (page === "diagnostics") {
      this._setMobileMenuHeader(this._m("Diagnostics", "אבחון"), this._menuPageIcon(page));
      body.innerHTML = this._diagnosticsMenuHtml();
      finishMenuRender();
      return;
    }
    if (page === "media_detail") {
      const detail = this._state.mobileLibraryDetail || {};
      const mediaType = String(detail.media_type || "").toLowerCase();
      const iconName = mediaType === "podcast" ? "podcast" : mediaType === "playlist" ? "playlist" : mediaType === "artist" ? "artist" : "album";
      const fallbackTitle = mediaType === "playlist" ? this._i18n("ui.playlist") : mediaType === "artist" ? this._i18n("ui.artist") : this._i18n("ui.album");
      this._setMobileMenuHeader(detail.name || fallbackTitle, iconName, "players");
      body.innerHTML = this._libraryDetailPopupShellHtml(this._libraryMediaDetailHtml(detail), mediaType === "artist" ? "artist-detail-page-shell" : "");
      finishMenuRender();
      return;
    }
    if (page === "artist_album_flow") {
      this._setMobileMenuHeader("", "queue_flow");
      body.innerHTML = this._artistAlbumFlowMenuHtml();
      finishMenuRender();
      return;
    }
    if (page.startsWith("library_")) {
      const meta = this._libraryTabMeta(page);
      this._setMobileMenuHeader(meta.title, meta.icon, "players");
      if (page === "library_liked") {
        if (this._useMaLikedMode()) await this._loadMaLikedEntries(false);
        if (!isCurrentRender()) return;
        const likedEntries = this._likedEntries();
        const likedUriSet = new Set(likedEntries.map((entry) => String(entry?.uri || "").trim()).filter(Boolean));
        this._state.likedSelectedUris = (Array.isArray(this._state.likedSelectedUris) ? this._state.likedSelectedUris : []).filter((uri) => likedUriSet.has(String(uri || "").trim()));
        const likedQuery = this._libraryTabSearchQuery(page);
        const filteredLikedEntries = likedQuery ? this._filterLibraryItemsByQuery(likedEntries, likedQuery) : likedEntries;
        const likedContent = this._libraryFlowPageActive(page)
          ? this._libraryFlowPickerHtml(filteredLikedEntries, "track", { className: "library-liked-flow" })
          : this._likedMediaEntriesHtml(filteredLikedEntries);
        body.innerHTML = this._libraryShellHtml(`${this._mediaLayoutToolbarHtml()}${likedContent}`, page);
        this._applyMenuLibraryThemeFromItems(menu, filteredLikedEntries.length ? filteredLikedEntries : likedEntries, "track");
        finishMenuRender();
        this._restoreLibraryTabSearchFocus();
        return;
      }
      if (page === "library_search") {
        body.innerHTML = this._libraryShellHtml(this._librarySearchHomeHtml(), page);
        this._bindMobileMediaSearch();
        await this._renderMobileMediaResults();
        if (!isCurrentRender()) return;
        finishMenuRender();
        return;
      }
      const limitMap = { playlist: 250, artist: 250, album: 250, track: 350, radio: 200, podcast: 250 };
      const orderBy = this._mobileLibraryOrderBy();
      const tabSearchQuery = this._libraryTabSearchQuery(page);
      const favoritesOnly = this._libraryFavoritesOnlyEnabled(page);
      const limitKey = `${page}:${orderBy}:${favoritesOnly}:${tabSearchQuery.toLowerCase()}`;
      const limit = this._state.engineCapabilities?.library_pagination
        ? (this._state.libraryVisibleLimits?.[limitKey] || limitMap[meta.type] || 250)
        : (limitMap[meta.type] || 250);
      const loadMoreHtml = count => this._state.engineCapabilities?.library_pagination && count >= limit
        ? `<button type="button" class="chip-btn" data-library-load-more="${this._esc(limitKey)}" data-library-current-limit="${limit}">${this._esc(this._m("Load more from Music Assistant", "טען עוד מ־Music Assistant"))}</button>` : "";
      const cacheKey = tabSearchQuery
        ? `tab-search:${meta.type}:${orderBy}:${limit}:${favoritesOnly}:${tabSearchQuery.toLowerCase()}`
        : `${meta.type}:${orderBy}:${limit}:${favoritesOnly}`;
      const cachedLibrary = this._cache.library.get(cacheKey);
      if (!cachedLibrary && body.dataset.libraryLoadingKey !== cacheKey) {
        body.innerHTML = this._libraryShellHtml(this._loadingStateHtml(this._i18n("ui.loading"), { notice: true }), page);
        body.dataset.libraryLoadingKey = cacheKey;
      }
      const radioSourceMode = page === "library_radio" ? this._mobileRadioSourceMode() : "combined";
      const radioAllowsMa = favoritesOnly || radioSourceMode !== "radiobrowser_only";
      const radioAllowsBrowser = !favoritesOnly && radioSourceMode !== "ma_only";
      const radioPrefersMa = favoritesOnly || radioSourceMode === "ma_first" || radioSourceMode === "ma_only";
      let items = [];
      let libraryError = "";
      try {
        items = page === "library_radio" && !radioAllowsMa
          ? []
          : await this._getLibraryTabItems(meta, orderBy, limit, tabSearchQuery, favoritesOnly);
      } catch (error) {
        if (page !== "library_radio") {
          if (!isCurrentRender()) return;
          delete body.dataset.libraryLoadingKey;
          body.innerHTML = this._libraryShellHtml(`<div class="notice open" role="alert">${this._esc(error?.message || this._m("Could not load the library.", "לא ניתן לטעון את הספרייה."))}</div><button class="chip-btn" data-menu-action="retry_library">${this._esc(this._m("Retry", "נסה שוב"))}</button>`, page);
          finishMenuRender();
          return;
        }
        libraryError = error?.message || this._m("Could not load Music Assistant radio.", "לא ניתן לטעון רדיו מ-Music Assistant.");
      }
      if (body.dataset.libraryLoadingKey === cacheKey) delete body.dataset.libraryLoadingKey;
      if (!isCurrentRender()) return;
      const sortedItems = this._sortLibraryItemsLocally(items);
      let libraryThemeItems = sortedItems;
      if (tabSearchQuery && page !== "library_radio") {
        const flowActive = this._libraryFlowPageActive(page);
        const searchContent = (providerItems = [], options = {}) => `
          ${this._mediaLayoutToolbarHtml()}
          ${flowActive
            ? this._libraryFlowPickerHtml(sortedItems.length ? sortedItems : providerItems, meta.type, { className: "library-search-flow" })
            : this._libraryTabSearchResultsHtml(sortedItems, providerItems, meta, options)}
          ${loadMoreHtml(items.length)}
        `;
        body.innerHTML = this._libraryShellHtml(searchContent([], { providerLoading: true }), page);
        this._applyMenuLibraryThemeFromItems(menu, sortedItems, meta.type);
        finishMenuRender();
        this._restoreLibraryTabSearchFocus();
        if (favoritesOnly) {
          body.innerHTML = this._libraryShellHtml(searchContent([], {}), page);
          this._applyMenuLibraryThemeFromItems(menu, sortedItems, meta.type);
          finishMenuRender();
          this._restoreLibraryTabSearchFocus();
          return;
        }
        let providerItems = [];
        let providerError = "";
        try {
          const rawProviderItems = await this._searchLibraryTabProviderItems(meta, tabSearchQuery, 60);
          providerItems = this._excludeLibraryDuplicateItems(rawProviderItems, sortedItems, meta.type);
          if (!providerItems.length && !sortedItems.length) providerError = this._i18n("ui.no_results_found");
        } catch (error) {
          providerError = error?.message || this._i18n("ui.search_failed");
        }
        if (!isCurrentRender()) return;
        libraryThemeItems = sortedItems.length ? sortedItems : providerItems;
        body.innerHTML = this._libraryShellHtml(searchContent(providerItems, { providerError }), page);
        this._applyMenuLibraryThemeFromItems(menu, libraryThemeItems, meta.type);
        finishMenuRender();
        this._restoreLibraryTabSearchFocus();
        return;
      }
      const libraryFlowActive = this._libraryFlowPageActive(page);
      if (page === "library_radio" && libraryFlowActive) {
        let radioFlowItems = radioAllowsMa ? sortedItems : [];
        let radioFlowError = radioAllowsMa ? libraryError : "";
        if (radioAllowsBrowser && !(radioPrefersMa && radioFlowItems.length)) {
          try {
            const configuredCountry = this._mobileRadioBrowserCountry();
            const browseCountry = this._state.mobileRadioBrowseCountry || (configuredCountry === "all" ? "" : configuredCountry);
            const browserStations = await this._fetchRadioBrowserStations(tabSearchQuery || "", 80, { countryCode: browseCountry || configuredCountry || "all" });
            if (browserStations.length) {
              radioFlowItems = browserStations;
              radioFlowError = "";
            }
          } catch (error) {
            if (!radioFlowItems.length) radioFlowError = error?.message || this._i18n("ui.no_radio_stations_found");
          }
        }
        if (!isCurrentRender()) return;
        libraryThemeItems = radioFlowItems.length ? radioFlowItems : sortedItems;
        const radioFlowContent = radioFlowError && !radioFlowItems.length
          ? `<div class="notice open">${this._esc(radioFlowError)}</div>`
          : this._libraryFlowPickerHtml(radioFlowItems, meta.type, { className: "library-radio-flow", captionMode: "radio_station" });
        body.innerHTML = this._libraryShellHtml(`${this._mediaLayoutToolbarHtml()}${radioFlowContent}`, page);
        this._applyMenuLibraryThemeFromItems(menu, libraryThemeItems, meta.type);
        finishMenuRender();
        this._restoreLibraryTabSearchFocus();
        return;
      }
      let content = `${this._mediaLayoutToolbarHtml()}${libraryFlowActive ? this._libraryFlowPickerHtml(sortedItems, meta.type, { className: "library-tab-flow" }) : this._mediaItemsListHtml(sortedItems, meta.type, { librarySkin: true })}`;
      if (page === "library_radio") {
        const maRadioHtml = !radioAllowsMa
          ? ""
          : libraryError
          ? `<div class="notice open">${this._esc(libraryError)}</div>`
          : libraryFlowActive
            ? this._libraryFlowPickerHtml(sortedItems, meta.type, { className: "library-radio-flow" })
            : this._mediaItemsListHtml(sortedItems, meta.type, { librarySkin: true });
        const maRadioSectionHtml = maRadioHtml
          ? `<div>
              <div class="media-section-title">Music Assistant</div>
              ${maRadioHtml}
            </div>`
          : "";
        if (tabSearchQuery) {
          if (!radioAllowsBrowser) {
            content = `${this._mediaLayoutToolbarHtml()}${maRadioHtml}`;
          } else {
            try {
              const configuredCountry = this._mobileRadioBrowserCountry();
              const browserStations = await this._fetchRadioBrowserStations(tabSearchQuery, 80, { countryCode: configuredCountry || "all" });
              if (!libraryThemeItems.length && browserStations.length) libraryThemeItems = browserStations;
              if (isCurrentRender()) {
                const browserSectionHtml = `
                  <div>
                    <div class="media-section-title">Radio Browser</div>
                    ${libraryFlowActive ? this._libraryFlowPickerHtml(browserStations, meta.type, { className: "library-radio-browser-flow" }) : this._mediaItemsListHtml(browserStations, meta.type, { librarySkin: true })}
                  </div>`;
                content = `
                  ${this._mediaLayoutToolbarHtml()}
                  <div class="media-results">
                    ${radioPrefersMa ? `${maRadioSectionHtml}${browserSectionHtml}` : `${browserSectionHtml}${maRadioSectionHtml}`}
                  </div>
                `;
              }
            } catch (error) {
              const browserErrorSectionHtml = `
                <div>
                  <div class="media-section-title">Radio Browser</div>
                  <div class="notice open">${this._esc(error?.message || this._i18n("ui.no_radio_stations_found"))}</div>
                </div>`;
              content = `
                ${this._mediaLayoutToolbarHtml()}
                <div class="media-results">
                  ${radioPrefersMa ? `${maRadioSectionHtml}${browserErrorSectionHtml}` : `${browserErrorSectionHtml}${maRadioSectionHtml}`}
                </div>
              `;
            }
          }
        } else {
        if (!radioAllowsBrowser) {
          content = `${this._mediaLayoutToolbarHtml()}${maRadioHtml}`;
        } else {
        try {
          const configuredCountry = this._mobileRadioBrowserCountry();
          const browseCountry = this._state.mobileRadioBrowseCountry || (configuredCountry === "all" ? "" : configuredCountry);
          const browseLabel = this._radioBrowserCountryLabel(browseCountry);
          if (browseCountry) {
            let browserStations = [];
            let browserError = "";
            try {
              browserStations = await this._fetchRadioBrowserStations("", 80, { countryCode: browseCountry });
            } catch (error) {
              browserError = error?.message || this._i18n("ui.no_radio_stations_found");
            }
            if (!libraryThemeItems.length && browserStations.length) libraryThemeItems = browserStations;
            if (isCurrentRender()) {
              const browserSectionHtml = `
                <div>
                  ${configuredCountry === "all" ? this._radioBrowserCountryBackHtml(browseLabel) : `<div class="media-section-title">Radio Browser · ${this._esc(browseLabel)}</div>`}
                  ${browserError ? `<div class="notice open">${this._esc(browserError)}</div>` : libraryFlowActive ? this._libraryFlowPickerHtml(browserStations, meta.type, { className: "library-radio-browser-flow" }) : this._mediaItemsListHtml(browserStations, meta.type, { librarySkin: true })}
                </div>`;
              content = `
                ${this._mediaLayoutToolbarHtml()}
                <div class="media-results">
                  ${radioPrefersMa ? `${maRadioSectionHtml}${browserSectionHtml}` : `${browserSectionHtml}${maRadioSectionHtml}`}
                </div>
              `;
            }
          } else {
            const [countriesResult, browserStationsResult] = await Promise.allSettled([
              this._fetchRadioBrowserCountries(260),
              this._fetchRadioBrowserStations("", 40, { countryCode: "all" }),
            ]);
            const countries = countriesResult.status === "fulfilled" ? countriesResult.value : [];
            const browserStations = browserStationsResult.status === "fulfilled" ? browserStationsResult.value : [];
            const browserError = browserStationsResult.status === "rejected" ? (browserStationsResult.reason?.message || this._i18n("ui.no_radio_stations_found")) : "";
            const countriesError = countriesResult.status === "rejected" ? (countriesResult.reason?.message || this._i18n("ui.no_radio_browser_countries_found")) : "";
            if (!libraryThemeItems.length && browserStations.length) libraryThemeItems = browserStations;
            if (isCurrentRender()) {
              const browserSectionsHtml = `
                <div>
                  <div class="media-section-title">${this._esc(this._i18n("ui.worldwide_popular"))}</div>
                  ${browserError ? `<div class="notice open">${this._esc(browserError)}</div>` : libraryFlowActive ? this._libraryFlowPickerHtml(browserStations, meta.type, { className: "library-radio-browser-flow" }) : this._mediaItemsListHtml(browserStations, meta.type, { librarySkin: true })}
                </div>
                <div>
                  <div class="media-section-title">${this._esc(this._i18n("ui.radio_browser_countries"))}</div>
                  ${countriesError ? `<div class="notice open">${this._esc(countriesError)}</div>` : this._radioBrowserCountriesHtml(countries)}
                </div>`;
              content = `
                ${this._mediaLayoutToolbarHtml()}
                <div class="media-results">
                  ${radioPrefersMa ? `${maRadioSectionHtml}${browserSectionsHtml}` : `${browserSectionsHtml}${maRadioSectionHtml}`}
                </div>
              `;
            }
          }
        } catch (error) {
          content = `
            ${this._mediaLayoutToolbarHtml()}
            <div class="media-results">
              ${radioPrefersMa ? `${maRadioSectionHtml}<div><div class="media-section-title">Radio Browser</div><div class="notice open">${this._esc(error?.message || this._i18n("ui.no_radio_stations_found"))}</div></div>` : `<div><div class="media-section-title">Radio Browser</div><div class="notice open">${this._esc(error?.message || this._i18n("ui.no_radio_stations_found"))}</div></div>${maRadioSectionHtml}`}
            </div>
          `;
        }
        }
        }
      }
      if (!isCurrentRender()) return;
      content += loadMoreHtml(items.length);
      body.innerHTML = this._libraryShellHtml(content, page);
      this._applyMenuLibraryThemeFromItems(menu, libraryThemeItems, meta.type);
      finishMenuRender();
      this._restoreLibraryTabSearchFocus();
      return;
    }
    aux.hidden = true;

    const titles = {
      queue: this._i18n("ui.queue_2"),
      players: this._i18n("ui.players"),
      players_active: this._i18n("ui.active_players"),
      transfer: this._i18n("ui.transfer_queue"),
      group: this._i18n("ui.group_speakers_2"),
      sleep_timer: this._i18n("ui.schedules"),
      announcements: this._i18n("ui.announcements"),
      simple_wizard: "FLOW",
      ungroup_all: this._i18n("ui.disconnect_player_groups"),
      stop_all: this._i18n("ui.stop_all_players"),
    };
    const queueFlowActive = page === "queue" && this._mobileQueueFlowMenuActive();
    this._setMobileMenuHeader(
      queueFlowActive
        ? ""
        : (titles[page] || this._i18n("ui.menu")),
      this._menuPageIcon(page),
    );
    if (page === "queue") {
      if (queueFlowActive) {
        if (previousRenderedPage !== page || !this._state.maQueueState?.queue_id) {
          body.innerHTML = this._state.maQueueState?.queue_id ? this._queueMenuHtml() : this._loadingStateHtml(this._i18n("ui.loading"), { notice: true });
          this._hydrateImages(body);
          await this._ensureQueueSnapshot(true);
        }
        if (!isCurrentRender()) return;
        body.innerHTML = this._queueMenuHtml();
        finishMenuRender();
        this._bindQueueFlowPicker(body);
        return;
      }
      if (previousRenderedPage !== page || !this._state.maQueueState?.queue_id) {
        body.innerHTML = this._state.maQueueState?.queue_id ? this._queueMenuHtml() : this._loadingStateHtml(this._i18n("ui.loading"), { notice: true });
        this._hydrateImages(body);
        await this._ensureQueueSnapshot(true);
      }
      if (!isCurrentRender()) return;
      const queueCount = this._getNowPlayingQueueItems().length;
      body.innerHTML = `
        <div class="queue-page-head">
          <div class="queue-page-count">
            ${this._iconSvg("queue")}
            <strong>${this._esc(String(queueCount))}</strong>
          </div>
          <div class="queue-page-head-actions">
            ${this._mobileQueueFlowEnabled() ? `
              <button class="queue-head-transfer-btn queue-head-flow-btn" data-queue-flow-open="1" title="${this._esc(this._queueFlowLabel())}" aria-label="${this._esc(this._queueFlowLabel())}">
                ${this._iconSvg("queue_flow")}
                ${this._mobileFooterMode() === "icon" ? "" : `<span class="queue-head-transfer-label">${this._esc(this._queueFlowLabel())}</span>`}
              </button>` : ``}
            <button class="queue-head-transfer-btn" data-menu-nav="transfer" title="${this._esc(this._i18n("ui.transfer_queue_2"))}">
              ${this._iconSvg("repeat")}
              ${this._mobileFooterMode() === "icon" ? "" : `<span class="queue-head-transfer-label">${this._esc(this._i18n("ui.transfer_queue_3"))}</span>`}
            </button>
          </div>
        </div>
        ${this._queueMenuHtml()}
      `;
      finishMenuRender();
      this._bindQueueFlowPicker(body);
      return;
    }
    if (page === "players") body.innerHTML = this._playersMenuHtml();
    else if (page === "players_active") body.innerHTML = this._playersMenuHtml({ activeOnly: true });
    else if (page === "sleep_timer") {
      body.innerHTML = this._loadingStateHtml(this._i18n("ui.loading_schedules"), { notice: true });
      await Promise.allSettled([
        this._hydrateSchedulesFromHomeiiEngine(),
        this._hydrateSleepTimerFromHomeiiEngine(),
      ]);
      await this._loadScheduledStartPlaylists();
      if (!isCurrentRender()) return;
      body.innerHTML = this._sleepTimerMenuHtml();
    }
    else if (page === "transfer") body.innerHTML = this._transferMenuHtml();
    else if (page === "ai_radio") {
      this._setMobileMenuHeader(this._m("AI Radio", "רדיו AI"), "radio");
      await renderAiRadio(this, body);
      if (!isCurrentRender()) return;
    }
    else if (page === "group") body.innerHTML = this._groupMenuHtml();
    else if (page === "announcements") body.innerHTML = this._announcementsMenuHtml();
    else if (page === "ungroup_all") {
      body.innerHTML = this._loadingStateHtml(this._i18n("ui.disconnecting_player_groups"), { notice: true });
      await this._ungroupAllPlayers();
      if (!isCurrentRender()) return;
      this._closeMobileMenu();
    }
    else if (page === "stop_all") {
      this._closeMobileMenu();
      this._openCleanAllConfirm();
      return;
    }
    else {
      this._debugLog?.("warn", "[Homeii Menu] unknown mobile menu page", page);
      this._state.menuPage = "main";
      this._setMobileMenuHeader(this._i18n("ui.actions_2"), this._menuPageIcon("main"));
      body.innerHTML = this._mainMenuHtml();
    }
    finishMenuRender();
  }

  _handleMobileMenuPointerDown(e) {
    const target = e.target?.closest?.("[data-media-open]");
    const uri = String(target?.dataset?.mediaOpen || "").trim();
    const mediaType = String(target?.dataset?.mediaType || "album").toLowerCase();
    if (!uri || !this._mediaTypeCanOpenDetails(mediaType)) return;
    const key = `${mediaType}:${uri}`;
    if (this._libraryDetailPrefetches.has(key)) return;
    const entry = {
      uri,
      media_type: mediaType,
      name: target.dataset.mediaName || "",
      artist: target.dataset.mediaArtist || "",
      album: target.dataset.mediaAlbum || "",
      image: target.dataset.mediaImage || "",
      favorite_scope: target.dataset.mediaFavoriteScope || "library",
    };
    const task = mediaType === "artist"
      ? this._loadLibraryArtistDetail(entry)
      : this._loadLibraryMediaDetailTracks(entry);
    this._libraryDetailPrefetches.set(key, task);
    Promise.resolve(task)
      .catch(() => {})
      .finally(() => {
        if (this._libraryDetailPrefetches.get(key) === task) {
          this._libraryDetailPrefetches.delete(key);
        }
      });
  }

  async _handleMobileMenuClick(e) {
    // Shadow DOM retargets Event.target after dispatch; retain the clicked element across awaits.
    const eventTarget = e.target;
    // Stop the event before yielding so outer card actions cannot consume this menu click.
    e.stopPropagation();
    this._rememberMobileMenuScroll();
    const loadMore = eventTarget.closest?.("[data-library-load-more]");
    if (loadMore) {
      e.preventDefault();
      if (loadMore.disabled || !this._state.engineCapabilities?.library_pagination) return;
      loadMore.disabled = true;
      const key = loadMore.dataset.libraryLoadMore;
      this._state.libraryVisibleLimits ||= {};
      this._state.libraryVisibleLimits[key] = Number(loadMore.dataset.libraryCurrentLimit || 250) + 250;
      await this._renderMobileMenu();
      return;
    }
    if (this._shouldHoldManualFrontForContentSelection()) {
      this._refreshManualFrontPlayerHold(this._manualFrontContentHoldMs());
    }
    const scheduleFormControl = eventTarget.closest?.(".sheet-schedules input, .sheet-schedules select, .sheet-schedules textarea");
    if (scheduleFormControl && this._isScheduleFormControl(scheduleFormControl)) {
      this._markScheduleFormControlActive(scheduleFormControl);
      e.stopPropagation();
      return;
    }
    if (eventTarget.closest?.("[data-queue-move-target]")) {
      e.stopPropagation();
      return;
    }
    if (await this._handleSimpleWizardClick(e)) return;
    const artistInfoCloseBtn = eventTarget.closest(".artist-info-close");
    const artistInfoBackdrop = eventTarget.classList?.contains("artist-info-backdrop") ? eventTarget : null;
    if (artistInfoCloseBtn || artistInfoBackdrop) {
      e.preventDefault();
      e.stopPropagation();
      if (this._state.mobileLibraryDetail) this._state.mobileLibraryDetail.artistInfoOpen = false;
      await this._renderMobileMenu();
      return;
    }
    const artistInfoOpenBtn = eventTarget.closest("[data-artist-info-open]");
    if (artistInfoOpenBtn) {
      e.preventDefault();
      e.stopPropagation();
      this._flashInteraction(artistInfoOpenBtn);
      if (this._state.mobileLibraryDetail) this._state.mobileLibraryDetail.artistInfoOpen = true;
      await this._renderMobileMenu();
      return;
    }
    const artistRadioBtn = eventTarget.closest("[data-artist-radio]");
    if (artistRadioBtn) {
      e.preventDefault();
      e.stopPropagation();
      const detail = this._state.mobileLibraryDetail || {};
      const uri = String(artistRadioBtn.dataset.mediaUri || detail.uri || "").trim();
      if (!uri) return;
      const feedbackEl = this._showLibraryInteractionFeedback(artistRadioBtn, { loading: true, hold: true });
      try {
        const ok = await this._playMedia(uri, "artist", "play", {
          label: artistRadioBtn.dataset.mediaName || detail.name || this._i18n("ui.artist"),
          radioMode: true,
          silent: true,
          sourceEl: artistRadioBtn,
        });
        if (ok) this._toastSuccess(this._m("Artist radio started", "רדיו אמן הופעל"));
      } finally {
        this._clearLibraryInteractionFeedback(feedbackEl);
      }
      return;
    }
    const artistSearchToggleBtn = eventTarget.closest("[data-artist-search-toggle]");
    if (artistSearchToggleBtn) {
      e.preventDefault();
      e.stopPropagation();
      this._flashInteraction(artistSearchToggleBtn);
      if (this._state.mobileLibraryDetail) {
        this._state.mobileLibraryDetail.artistSearchOpen = !this._state.mobileLibraryDetail.artistSearchOpen;
      }
      await this._renderMobileMenu();
      if (this._state.mobileLibraryDetail?.artistSearchOpen) {
        requestAnimationFrame(() => this.$("artistDetailSearchInput")?.focus?.());
      }
      return;
    }
    const artistDetailSearchBtn = eventTarget.closest("[data-artist-detail-search]");
    if (artistDetailSearchBtn) {
      e.preventDefault();
      e.stopPropagation();
      this._flashInteraction(artistDetailSearchBtn);
      await this._searchArtistDetailFromInput(artistDetailSearchBtn);
      return;
    }
    const frontPinBtn = eventTarget.closest("[data-front-pin-player]");
    if (frontPinBtn?.dataset.frontPinPlayer) {
      e.preventDefault();
      e.stopPropagation();
      this._flashInteraction(frontPinBtn);
      this._toggleFrontPinnedPlayer(frontPinBtn.dataset.frontPinPlayer);
      await this._renderMobileMenu();
      return;
    }
    const quickActionMoveBtn = eventTarget.closest("[data-setting-quick-action-move]");
    if (quickActionMoveBtn) {
      e.preventDefault();
      e.stopPropagation();
      if (quickActionMoveBtn.disabled) return;
      const item = String(quickActionMoveBtn.dataset.settingQuickActionMove || "").trim();
      const direction = Number(quickActionMoveBtn.dataset.direction || 0);
      const actions = this._mobileQuickActions().slice();
      const index = actions.indexOf(item);
      const nextIndex = index + (direction < 0 ? -1 : 1);
      if (index < 0 || nextIndex < 0 || nextIndex >= actions.length) return;
      [actions[index], actions[nextIndex]] = [actions[nextIndex], actions[index]];
      this._flashInteraction(quickActionMoveBtn);
      this._state.mobileQuickActions = actions;
      this._persistMobileAppearance();
      this._refreshAfterSettingsChange({ quickActionsChanged: true });
      return;
    }
    const playerOrderMoveBtn = eventTarget.closest("[data-setting-player-order-move]");
    if (playerOrderMoveBtn) {
      e.preventDefault();
      e.stopPropagation();
      if (playerOrderMoveBtn.disabled) return;
      const item = String(playerOrderMoveBtn.dataset.settingPlayerOrderMove || "").trim();
      const direction = Number(playerOrderMoveBtn.dataset.direction || 0);
      const optionIds = this._pinnedPlayerOptionPlayers([], { includeExcluded: true }).map((player) => player.entity_id);
      const current = this._playerOrderPreferences();
      const actions = [
        ...current.filter((entityId) => optionIds.includes(entityId)),
        ...optionIds.filter((entityId) => !current.includes(entityId)),
      ];
      const index = actions.indexOf(item);
      const nextIndex = index + (direction < 0 ? -1 : 1);
      if (index < 0 || nextIndex < 0 || nextIndex >= actions.length) return;
      [actions[index], actions[nextIndex]] = [actions[nextIndex], actions[index]];
      this._flashInteraction(playerOrderMoveBtn);
      this._state.playerOrderEntities = actions;
      this._state.playerSortMode = "custom";
      this._persistMobileAppearance();
      // _loadPlayers() is handled by _refreshAfterSettingsChange via playerListChanged
      this._refreshAfterSettingsChange({ playerListChanged: true });
      return;
    }
    const announcementPresetBtn = eventTarget.closest("[data-announcement-preset-fill]");
    if (announcementPresetBtn) {
      e.preventDefault();
      e.stopPropagation();
      const index = Number(announcementPresetBtn.dataset.announcementPresetFill);
      const preset = (this._state.mobileAnnouncementPresets || [])[index] || "";
      this._state.mobileAnnouncementText = preset;
      const input = this.$("mobileAnnouncementText");
      if (input) input.value = preset;
      this._flashInteraction(announcementPresetBtn);
      this._hapticTap([8]);
      return;
    }
    const announcementVoiceBtn = eventTarget.closest("[data-announcement-voice]");
    if (announcementVoiceBtn) {
      e.preventDefault();
      e.stopPropagation();
      this._flashInteraction(announcementVoiceBtn);
      this._startMobileAnnouncementVoice();
      return;
    }
    const announcementSendBtn = eventTarget.closest("[data-announcement-send]");
    if (announcementSendBtn) {
      e.preventDefault();
      e.stopPropagation();
      this._flashInteraction(announcementSendBtn);
      await this._sendMobileAnnouncement();
      return;
    }
    const discoveryPathBtn = eventTarget.closest("[data-discovery-path], [data-discovery-retry]");
    if (discoveryPathBtn) {
      e.preventDefault();
      e.stopPropagation();
      if (discoveryPathBtn.hasAttribute("data-discovery-retry")) {
        const key = `discovery:results:${this._discoveryCategory().key}:${this._state.discoveryProviderPath || "all"}`;
        this._cache.library.delete(key);
      }
      if (discoveryPathBtn.dataset.discoveryPath) {
        this._state.discoveryBrowsePath = discoveryPathBtn.dataset.discoveryPath;
        this._state.discoveryBrowseTitle = discoveryPathBtn.dataset.discoveryTitle || "";
      }
      await this._renderMobileMenu();
      return;
    }
    const discoveryGenreBtn = eventTarget.closest("[data-discovery-genre]");
    if (discoveryGenreBtn?.dataset.discoveryGenre) {
      e.preventDefault();
      e.stopPropagation();
      this._flashInteraction(discoveryGenreBtn);
      await this._selectDiscoveryGenre(discoveryGenreBtn.dataset.discoveryGenre);
      return;
    }
    const volumePresetBtn = eventTarget.closest("[data-volume-preset]");
    if (volumePresetBtn) {
      const pct = Math.max(0, Math.min(100, Number(volumePresetBtn.dataset.volumePreset) || 0));
      this._setVolume(pct / 100);
      this._closeMobileVolumePresets();
      setTimeout(() => this._syncNowPlayingUI(), 120);
      return;
    }
    const likedSelectBox = eventTarget.closest(".liked-select-box");
    if (likedSelectBox) {
      e.preventDefault();
      e.stopPropagation();
      const input = likedSelectBox.querySelector("input[data-liked-select-uri]");
      if (!input) return;
      input.checked = !input.checked;
      const uri = String(input.dataset.likedSelectUri || "").trim();
      const next = new Set(Array.isArray(this._state.likedSelectedUris) ? this._state.likedSelectedUris : []);
      if (input.checked) next.add(uri); else next.delete(uri);
      this._state.likedSelectedUris = Array.from(next);
      await this._renderMobileMenu();
      return;
    }
    const likedPlayAllBtn = eventTarget.closest("[data-liked-play-all]");
    if (likedPlayAllBtn) {
      e.preventDefault();
      e.stopPropagation();
      this._flashInteraction(likedPlayAllBtn);
      const playable = this._likedPlayableEntries(this._likedEntries(), false);
      if (!playable.length) {
        this._toastError(this._i18n("ui.no_liked_tracks_to_play"));
        return;
      }
      await this._playAll(playable, false);
      this._closeMobileMenu();
      return;
    }
    const likedSelectionToggleBtn = eventTarget.closest("[data-liked-selection-toggle]");
    if (likedSelectionToggleBtn) {
      e.preventDefault();
      e.stopPropagation();
      this._flashInteraction(likedSelectionToggleBtn);
      this._state.likedSelectionMode = !this._state.likedSelectionMode;
      if (!this._state.likedSelectionMode) this._state.likedSelectedUris = [];
      await this._renderMobileMenu();
      return;
    }
    const likedPlaySelectedBtn = eventTarget.closest("[data-liked-play-selected]");
    if (likedPlaySelectedBtn) {
      e.preventDefault();
      e.stopPropagation();
      this._flashInteraction(likedPlaySelectedBtn);
      const playable = this._likedPlayableEntries(this._likedEntries(), true);
      if (!playable.length) {
        this._toastError(this._i18n("ui.no_selected_tracks_to_play"));
        return;
      }
      await this._playAll(playable, false);
      this._state.likedSelectionMode = false;
      this._state.likedSelectedUris = [];
      this._closeMobileMenu();
      return;
    }
    const likedRemoveBtn = eventTarget.closest("[data-liked-remove]");
    if (likedRemoveBtn?.dataset.likedRemove) {
      e.preventDefault();
      e.stopPropagation();
      if (this._useMaLikedMode()) {
        const uri = likedRemoveBtn.dataset.likedRemove;
        const likedEntry = this._likedEntries().find((entry) => String(entry?.uri || "").trim() === String(uri || "").trim());
        if (likedEntry) await this._toggleLikeEntry(likedEntry, likedRemoveBtn);
      } else {
        this._removeLikedUri(likedRemoveBtn.dataset.likedRemove);
      }
      await this._renderMobileMenu();
      return;
    }
    const queueAction = eventTarget.closest("[data-queue-action]");
    if (queueAction) {
      e.preventDefault();
      e.stopPropagation();
      const queueRow = queueAction.closest("[data-queue-item-id]");
      const action = queueAction.dataset.queueAction;
      const queueItemId = queueAction.dataset.queueItemId || queueRow?.dataset.queueItemId || "";
      if (action === "like") {
        const likeEntry = {
          uri: queueAction.dataset.queueUri || queueRow?.dataset.uri || "",
          media_type: queueAction.dataset.queueType || queueRow?.dataset.type || "track",
          name: queueAction.dataset.queueName || "",
          artist: queueAction.dataset.queueArtist || "",
          album: queueAction.dataset.queueAlbum || "",
          image: queueAction.dataset.queueImage || "",
        };
        if (!String(likeEntry.uri || "").trim()) return;
        const wasLiked = this._isEntryLiked(likeEntry);
        this._syncQueueLikeActionButton(queueAction, !wasLiked);
        const result = await this._toggleLikeEntry(likeEntry, queueAction);
        if (result === false) {
          this._syncQueueLikeActionButton(queueAction, wasLiked);
        } else {
          this._syncQueueLikeActionButton(queueAction, this._isEntryLiked(likeEntry));
        }
        await this._renderMobileMenu();
        return;
      }
      this._state.expandedQueueItemId = "";
      if (action === "play") {
        await this._playQueueItem(
          queueItemId,
          queueRow?.dataset.uri || "",
          queueRow?.dataset.type || "track",
          queueRow?.dataset.sortIndex || "",
        );
        await this._renderMobileMenu();
        return;
      }
      const targetPosition = action === "move_to" ? this._queueMoveTargetFromElement(queueAction) : null;
      if (action === "move_to" && !targetPosition) return;
      await this._handleQueueAction(action, queueItemId, queueRow?.dataset.uri || "", queueRow?.dataset.sortIndex || "", targetPosition);
      return;
    }
    const scheduleTabBtn = eventTarget.closest("[data-schedule-tab]");
    if (scheduleTabBtn?.dataset.scheduleTab) {
      e.preventDefault();
      e.stopPropagation();
      this._state.mobileScheduleControlActiveUntil = 0;
      const tab = String(scheduleTabBtn.dataset.scheduleTab || "");
      this._state.mobileSchedulesTab = ["timers", "wake", "night"].includes(tab) ? tab : "timers";
      this._persistMobileAppearance();
      await this._renderMobileMenu();
      return;
    }
    const startScheduleNewBtn = eventTarget.closest("[data-start-schedule-new]");
    if (startScheduleNewBtn) {
      e.preventDefault();
      e.stopPropagation();
      this._state.mobileScheduleControlActiveUntil = 0;
      this._flashInteraction(startScheduleNewBtn);
      this._state.mobileSchedulesTab = "wake";
      this._newScheduledStartDraft();
      this._persistMobileAppearance();
      await this._renderMobileMenu();
      return;
    }
    const startScheduleEditBtn = eventTarget.closest("[data-start-schedule-edit]");
    if (startScheduleEditBtn?.dataset.startScheduleEdit) {
      e.preventDefault();
      e.stopPropagation();
      this._state.mobileScheduleControlActiveUntil = 0;
      this._flashInteraction(startScheduleEditBtn);
      this._state.mobileSchedulesTab = "wake";
      this._editScheduledStart(startScheduleEditBtn.dataset.startScheduleEdit);
      this._persistMobileAppearance();
      await this._renderMobileMenu();
      return;
    }
    const startScheduleToggleBtn = eventTarget.closest("[data-start-schedule-toggle]");
    if (startScheduleToggleBtn?.dataset.startScheduleToggle) {
      e.preventDefault();
      e.stopPropagation();
      this._state.mobileScheduleControlActiveUntil = 0;
      this._flashInteraction(startScheduleToggleBtn);
      await this._toggleScheduledStart(startScheduleToggleBtn.dataset.startScheduleToggle);
      await this._renderMobileMenu();
      return;
    }
    const startScheduleDeleteBtn = eventTarget.closest("[data-start-schedule-delete]");
    if (startScheduleDeleteBtn?.dataset.startScheduleDelete) {
      e.preventDefault();
      e.stopPropagation();
      this._state.mobileScheduleControlActiveUntil = 0;
      this._flashInteraction(startScheduleDeleteBtn);
      await this._deleteScheduledStart(startScheduleDeleteBtn.dataset.startScheduleDelete);
      await this._renderMobileMenu();
      return;
    }
    const sleepTimerStartBtn = eventTarget.closest("[data-sleep-timer-start]");
    if (sleepTimerStartBtn?.dataset.sleepTimerStart) {
      e.preventDefault();
      e.stopPropagation();
      this._flashInteraction(sleepTimerStartBtn);
      await this._setSleepTimerMinutes(Number(sleepTimerStartBtn.dataset.sleepTimerStart || 15), "general");
      await this._renderMobileMenu();
      return;
    }
    const sleepTimerCancelBtn = eventTarget.closest("[data-sleep-timer-cancel]");
    if (sleepTimerCancelBtn) {
      e.preventDefault();
      e.stopPropagation();
      this._flashInteraction(sleepTimerCancelBtn);
      await this._clearSleepTimer(true);
      await this._renderMobileMenu();
      return;
    }
    const startTimerSaveBtn = eventTarget.closest("[data-start-timer-save]");
    if (startTimerSaveBtn) {
      e.preventDefault();
      e.stopPropagation();
      this._state.mobileScheduleControlActiveUntil = 0;
      this._flashInteraction(startTimerSaveBtn);
      await this._setScheduledStartFromMenu();
      await this._renderMobileMenu();
      return;
    }
    const startTimerClearBtn = eventTarget.closest("[data-start-timer-clear]");
    if (startTimerClearBtn) {
      e.preventDefault();
      e.stopPropagation();
      this._state.mobileScheduleControlActiveUntil = 0;
      this._flashInteraction(startTimerClearBtn);
      await this._clearScheduledStart(true);
      await this._renderMobileMenu();
      return;
    }
    const action = eventTarget.closest("[data-menu-action]");
    if (action) {
      this._flashInteraction(action);
      if (this._isHotelMode() && [
        "connect_this_device",
        "disconnect_this_device",
        "toggle_theme",
        "apply_group",
        "clear_group",
      ].includes(action.dataset.menuAction)) return;
      if (action.dataset.menuAction === "open_app") return this._openMusicAssistant();
      if (action.dataset.menuAction === "toggle_autoplay") return this._toggleQueueAutoplay();
      if (action.dataset.menuAction === "toggle_crossfade") return toggleQueueCrossfade.call(this);
      if (action.dataset.menuAction === "save_queue_settings") return saveQueueSettings(this);
      if (action.dataset.menuAction === "reload_queue_settings") {
        this.$("mobileMenuBody")?.querySelector(".queue-settings-form")?.remove();
        return this._renderMobileMenu();
      }
      if (action.dataset.menuAction === "retry_library") return this._renderMobileMenu();
      if (action.dataset.menuAction === "run_diagnostics") {
        await this._runDiagnostics();
        return;
      }
      if (action.dataset.menuAction === "copy_diagnostics") {
        await this._copyDiagnosticsReport();
        return;
      }
      if (action.dataset.menuAction === "connect_this_device") return this._connectThisDevicePlayer();
      if (action.dataset.menuAction === "disconnect_this_device") return this._disconnectThisDevicePlayer();
      if (action.dataset.menuAction === "toggle_lang") return this._toggleLanguage();
      if (action.dataset.menuAction === "toggle_theme") {
        this._toggleCardTheme();
        this._rebuildMobileUi({ reopenPage: this._state.menuPage || "settings", reopenStudio: this._state.controlRoomOpen });
        return;
      }
      if (action.dataset.menuAction === "apply_group") {
        const ok = await this._runMenuButtonLoading(action, this._m("Updating group", "מעדכן קבוצה"), () => this._applySpeakerGroup(), { kind: "connect" });
        if (ok) return this._closeMobileMenu();
        return;
      }
      if (action.dataset.menuAction === "clear_group") {
        const ok = await this._runMenuButtonLoading(action, this._m("Disconnecting all", "מנתק הכל"), () => this._clearSpeakerGroup(), { kind: "disconnect" });
        if (ok) return this._closeMobileMenu();
        return;
      }
    }
    const playerMuteBtn = eventTarget.closest("[data-player-mute]");
    if (playerMuteBtn?.dataset.playerMute) {
      e.preventDefault();
      e.stopPropagation();
      await this._toggleMuteFor(playerMuteBtn.dataset.playerMute);
      return;
    }
    const playerFavoriteBtn = eventTarget.closest("[data-player-favorite]");
    if (playerFavoriteBtn?.dataset.playerFavorite) {
      e.preventDefault();
      e.stopPropagation();
      this._flashInteraction(playerFavoriteBtn);
      try {
        await this._pressFavoriteButtonEntity(playerFavoriteBtn.dataset.playerFavorite);
        this._toastSuccess(this._i18n("ui.favorite_action_sent"));
        this._scheduleFavoriteReconcile(700);
      } catch (error) {
        this._toastError(this._i18n("ui.favorite_action_failed") + (error?.message ? `: ${error.message}` : ""));
      }
      return;
    }
    const groupMuteBtn = eventTarget.closest("[data-group-mute]");
    if (groupMuteBtn?.dataset.groupMute) {
      e.preventDefault();
      e.stopPropagation();
      await this._toggleGroupMuteFor(groupMuteBtn.dataset.groupMute);
      return;
    }
    const langBtn = eventTarget.closest("[data-setting-lang]");
    if (langBtn?.dataset.settingLang) {
      this._state.lang = langBtn.dataset.settingLang;
      try { localStorage.setItem(this._lsKey("homeii_music_flow_lang"), this._state.lang); } catch (_) {}
      this._reopenSettingsMenuPreservingScroll({ rebuild: true, init: true });
      return;
    }
    const themeBtn = eventTarget.closest("[data-setting-theme]");
    if (themeBtn?.dataset.settingTheme) {
      this._state.cardTheme = themeBtn.dataset.settingTheme;
      try { localStorage.setItem(this._lsKey("homeii_music_flow_theme"), this._state.cardTheme); } catch (_) {}
      this._persistMobileAppearance();
      this._reopenSettingsMenuPreservingScroll({ rebuild: true, init: true });
      return;
    }
    const dynamicThemeBtn = eventTarget.closest("[data-setting-dynamic-theme]");
    if (dynamicThemeBtn?.dataset.settingDynamicTheme) {
      this._flashInteraction(dynamicThemeBtn);
      this._state.mobileDynamicThemeMode = ["off", "auto", "strong"].includes(dynamicThemeBtn.dataset.settingDynamicTheme)
        ? dynamicThemeBtn.dataset.settingDynamicTheme
        : "auto";
      if (this._state.mobileDynamicThemeMode === "off") {
        this._state.mobileDynamicThemePalette = null;
      }
      this._persistMobileAppearance();
      this._applyDynamicThemeStyles();
      this._syncNowPlayingUI();
      this._reopenSettingsMenuPreservingScroll();
      return;
    }
    const performanceProfileBtn = eventTarget.closest("[data-setting-performance-profile]");
    if (performanceProfileBtn?.dataset.settingPerformanceProfile) {
      this._flashInteraction(performanceProfileBtn);
      const performanceProfile = HomeiiMobileSettingsFoundation.normalizePerformanceProfile(
        performanceProfileBtn.dataset.settingPerformanceProfile,
        false
      );
      this._state.performanceProfile = performanceProfile;
      this._state.performanceMode = ["low", "ultra_lite"].includes(performanceProfile);
      this._state.performanceModeLocalOverride = true;
      if (this._state.performanceMode) {
        this._state.mobileDynamicThemePalette = null;
        this._state.mobileDynamicThemeArtwork = "";
        this._state.mobileDynamicThemeArtworkUrl = "";
      }
      this._persistMobileAppearance();
      this._applyDynamicThemeStyles();
      this._applyBackgroundMotionStyles();
      this._syncNowPlayingUI();
      this._reopenSettingsMenuPreservingScroll({ rebuild: true, init: true });
      return;
    }
    const performanceModeBtn = eventTarget.closest("[data-setting-performance-mode]");
    if (performanceModeBtn?.dataset.settingPerformanceMode) {
      this._flashInteraction(performanceModeBtn);
      const performanceProfile = performanceModeBtn.dataset.settingPerformanceMode === "on" ? "low" : "full";
      this._state.performanceProfile = performanceProfile;
      this._state.performanceMode = performanceProfile === "low";
      this._state.performanceModeLocalOverride = true;
      if (this._state.performanceMode) {
        this._state.mobileDynamicThemePalette = null;
        this._state.mobileDynamicThemeArtwork = "";
        this._state.mobileDynamicThemeArtworkUrl = "";
      }
      this._persistMobileAppearance();
      this._applyDynamicThemeStyles();
      this._applyBackgroundMotionStyles();
      this._syncNowPlayingUI();
      this._reopenSettingsMenuPreservingScroll({ rebuild: true, init: true });
      return;
    }
    const backgroundMotionBtn = eventTarget.closest("[data-setting-background-motion]");
    if (backgroundMotionBtn?.dataset.settingBackgroundMotion) {
      this._flashInteraction(backgroundMotionBtn);
      this._state.mobileBackgroundMotionMode = ["off", "subtle", "strong", "extreme"].includes(backgroundMotionBtn.dataset.settingBackgroundMotion)
        ? backgroundMotionBtn.dataset.settingBackgroundMotion
        : "subtle";
      this._persistMobileAppearance();
      this._applyBackgroundMotionStyles();
      this._reopenSettingsMenuPreservingScroll();
      return;
    }
    const ambientLightBtn = eventTarget.closest("[data-setting-ambient-light]");
    if (ambientLightBtn?.dataset.settingAmbientLight) {
      this._flashInteraction(ambientLightBtn);
      this._state.ambientLightEnabled = ambientLightBtn.dataset.settingAmbientLight === "on";
      this._persistMobileAppearance();
      this._syncAmbientLightForCurrentMedia("settings");
      this._reopenSettingsMenuPreservingScroll();
      return;
    }
    const screensaverBtn = eventTarget.closest("[data-setting-screensaver]");
    if (screensaverBtn?.dataset.settingScreensaver) {
      this._flashInteraction(screensaverBtn);
      this._state.screensaverEnabled = screensaverBtn.dataset.settingScreensaver === "on";
      this._persistMobileAppearance();
      this._resetScreensaverTimer({ hide: true });
      this._reopenSettingsMenuPreservingScroll();
      return;
    }
    const screensaverAutoLyricsBtn = eventTarget.closest("[data-setting-screensaver-auto-lyrics]");
    if (screensaverAutoLyricsBtn?.dataset.settingScreensaverAutoLyrics) {
      this._flashInteraction(screensaverAutoLyricsBtn);
      this._state.screensaverAutoLyricsWhenPlaying = screensaverAutoLyricsBtn.dataset.settingScreensaverAutoLyrics === "on";
      if (!this._state.screensaverAutoLyricsWhenPlaying && !this._state.lyricsOpen) {
        this._state.screensaverLyricsOpen = false;
        this._clearLyricsState?.();
      } else if (this._state.screensaverOpen) {
        this._maybeOpenScreensaverLyricsForPlayback();
      }
      this._persistMobileAppearance();
      this._syncScreensaverUi();
      this._reopenSettingsMenuPreservingScroll();
      return;
    }
    const screensaverControlsBtn = eventTarget.closest("[data-setting-screensaver-controls]");
    if (screensaverControlsBtn?.dataset.settingScreensaverControls) {
      this._flashInteraction(screensaverControlsBtn);
      this._state.screensaverControlsEnabled = screensaverControlsBtn.dataset.settingScreensaverControls === "on";
      this._persistMobileAppearance();
      this._syncScreensaverUi();
      this._refreshAfterSettingsChange({});
      return;
    }
    const powerButtonBtn = eventTarget.closest("[data-setting-power-button]");
    if (powerButtonBtn?.dataset.settingPowerButton) {
      this._flashInteraction(powerButtonBtn);
      this._state.powerButtonEnabled = powerButtonBtn.dataset.settingPowerButton === "on";
      this._persistMobileAppearance();
      this._reopenSettingsMenuPreservingScroll({ rebuild: true, init: true });
      return;
    }
    const discoveryModeBtn = eventTarget.closest("[data-setting-discovery-mode]");
    if (discoveryModeBtn?.dataset.settingDiscoveryMode) {
      this._flashInteraction(discoveryModeBtn);
      this._state.discoveryModeEnabled = discoveryModeBtn.dataset.settingDiscoveryMode === "on";
      this._persistMobileAppearance();
      // discoveryMode only affects main nav menu (page="main"); will refresh on next navigation
      this._refreshAfterSettingsChange({});
      return;
    }
    const nightModeBtn = eventTarget.closest("[data-setting-night-mode]");
    if (nightModeBtn?.dataset.settingNightMode) {
      this._state.mobileScheduleControlActiveUntil = 0;
      this._flashInteraction(nightModeBtn);
      this._state.mobileNightMode = ["off", "auto", "on"].includes(nightModeBtn.dataset.settingNightMode)
        ? nightModeBtn.dataset.settingNightMode
        : "auto";
      this._persistMobileAppearance();
      this._rebuildMobileUi({ reopenPage: this._state.menuOpen ? (this._state.menuPage || "sleep_timer") : "sleep_timer", reopenStudio: this._state.controlRoomOpen });
      return;
    }
    const nightWindowSaveBtn = eventTarget.closest("[data-setting-night-window-save]");
    if (nightWindowSaveBtn) {
      this._state.mobileScheduleControlActiveUntil = 0;
      this._flashInteraction(nightWindowSaveBtn);
      const startInput = this.$("mobileNightStartInput");
      const endInput = this.$("mobileNightEndInput");
      const checkedDays = Array.from(this.shadowRoot?.querySelectorAll("input[data-setting-night-day]:checked") || [])
        .map((input) => Number(input.dataset.settingNightDay))
        .filter((value) => Number.isInteger(value) && value >= 0 && value <= 6);
      this._state.mobileNightModeStart = this._normalizeClockTime(startInput?.value || "22:00", "22:00");
      this._state.mobileNightModeEnd = this._normalizeClockTime(endInput?.value || "06:00", "06:00");
      this._state.mobileNightModeDays = this._normalizeNightModeDays(checkedDays);
      this._persistMobileAppearance();
      this._toastSuccess(this._i18n("ui.night_schedule_updated"));
      this._build();
      this._init();
      this._openMobileMenu(this._state.menuPage || "sleep_timer");
      return;
    }
    const sleepTimerBtn = eventTarget.closest("[data-setting-sleep-timer]");
    if (sleepTimerBtn) {
      this._flashInteraction(sleepTimerBtn);
      await this._cycleSleepTimer();
      this._reopenSettingsMenuPreservingScroll();
      return;
    }
    const sleepClearBtn = eventTarget.closest("[data-setting-sleep-clear]");
    if (sleepClearBtn) {
      this._flashInteraction(sleepClearBtn);
      await this._clearSleepTimer(true);
      this._reopenSettingsMenuPreservingScroll();
      return;
    }
    const compactModeBtn = eventTarget.closest("[data-setting-compact-mode]");
    if (compactModeBtn?.dataset.settingCompactMode) {
      this._flashInteraction(compactModeBtn);
      this._state.mobileCompactMode = compactModeBtn.dataset.settingCompactMode === "on";
      this._state.mobileCompactExpanded = false;
      this._persistMobileAppearance();
      this._reopenSettingsMenuPreservingScroll({ rebuild: true, init: true });
      return;
    }
    const mobileLayoutModeBtn = eventTarget.closest("[data-setting-mobile-layout-mode]");
    if (mobileLayoutModeBtn?.dataset.settingMobileLayoutMode) {
      this._flashInteraction(mobileLayoutModeBtn);
      const nextMode = HomeiiMobileSettingsFoundation.normalizeMobileLayoutMode(mobileLayoutModeBtn.dataset.settingMobileLayoutMode);
      this._state.mobileLayoutMode = nextMode;
      this._state.mobileEdgeToEdge = false;
      this._state.mobileEdgeReturnAvailable = false;
      if (!this._mobileCompactModeEnabled()) this._state.mobileCompactExpanded = false;
      this._persistMobileAppearance();
      if (nextMode === "edge_to_edge") {
        if (this._isVisualEditorContext()) {
          this._reopenSettingsMenuPreservingScroll({ rebuild: true, init: true });
          return;
        }
        this._closeMobileMenu();
        this._build();
        this._init();
        return;
      }
      this._reopenSettingsMenuPreservingScroll({ rebuild: true, init: true });
      return;
    }
    const compactWidgetModeBtn = eventTarget.closest("[data-setting-compact-widget-mode]");
    if (compactWidgetModeBtn?.dataset.settingCompactWidgetMode) {
      this._flashInteraction(compactWidgetModeBtn);
      this._state.mobileCompactWidgetMode = HomeiiMobileSettingsFoundation.normalizeMobileCompactWidgetMode(compactWidgetModeBtn.dataset.settingCompactWidgetMode);
      this._state.mobileCompactExpanded = false;
      this._persistMobileAppearance();
      this._reopenSettingsMenuPreservingScroll({ rebuild: true, init: true });
      return;
    }
    const compactEdgeToEdgeBtn = eventTarget.closest("[data-setting-compact-edge-to-edge]");
    if (compactEdgeToEdgeBtn?.dataset.settingCompactEdgeToEdge) {
      this._flashInteraction(compactEdgeToEdgeBtn);
      this._state.mobileCompactEdgeToEdge = compactEdgeToEdgeBtn.dataset.settingCompactEdgeToEdge === "on";
      this._persistMobileAppearance();
      this._reopenSettingsMenuPreservingScroll({ rebuild: true, init: true });
      return;
    }
    const showUpNextBtn = eventTarget.closest("[data-setting-show-up-next]");
    if (showUpNextBtn?.dataset.settingShowUpNext) {
      this._flashInteraction(showUpNextBtn);
      this._state.mobileShowUpNext = showUpNextBtn.dataset.settingShowUpNext === "on";
      this._persistMobileAppearance();
      this._syncMobileUpNextUi(this._mobileUpNextItem());
      this._reopenSettingsMenuPreservingScroll();
      return;
    }
    const coverFlowBtn = eventTarget.closest("[data-setting-cover-flow]");
    if (coverFlowBtn?.dataset.settingCoverFlow) {
      this._flashInteraction(coverFlowBtn);
      this._state.mobileCoverFlow = coverFlowBtn.dataset.settingCoverFlow === "on";
      if (!this._state.mobileCoverFlow) this._state.mobileArtBrowseOffset = 0;
      this._state.mobileArtRenderKey = "";
      this._persistMobileAppearance();
      this._reopenSettingsMenuPreservingScroll({ rebuild: true, init: true });
      return;
    }
    const swipeModeBtn = eventTarget.closest("[data-setting-swipe-mode]");
    if (swipeModeBtn?.dataset.settingSwipeMode) {
      this._flashInteraction(swipeModeBtn);
      this._state.mobileSwipeMode = swipeModeBtn.dataset.settingSwipeMode === "browse" ? "browse" : "play";
      this._state.mobileArtBrowseOffset = 0;
      this._persistMobileAppearance();
      this._reopenSettingsMenuPreservingScroll({ rebuild: true, init: true });
      return;
    }
    const homeShortcutBtn = eventTarget.closest("[data-setting-home-shortcut]");
    if (homeShortcutBtn?.dataset.settingHomeShortcut) {
      this._flashInteraction(homeShortcutBtn);
      const enabled = homeShortcutBtn.dataset.settingHomeShortcut === "on";
      this._state.mobileHomeShortcutEnabled = enabled;
      const actions = this._mobileQuickActions().filter((action) => action !== "home");
      this._state.mobileQuickActions = enabled ? ["home", ...actions] : actions;
      this._persistMobileAppearance();
      this._reopenSettingsMenuPreservingScroll({ rebuild: true, init: true });
      return;
    }
    const micModeBtn = eventTarget.closest("[data-setting-mic-mode]");
    if (micModeBtn?.dataset.settingMicMode) {
      this._flashInteraction(micModeBtn);
      this._state.mobileMicMode = micModeBtn.dataset.settingMicMode;
      this._persistMobileAppearance();
      this._reopenSettingsMenuPreservingScroll({ rebuild: true, init: true });
      return;
    }
    const voiceAssistantBtn = eventTarget.closest("[data-setting-voice-assistant]");
    if (voiceAssistantBtn?.dataset.settingVoiceAssistant) {
      this._flashInteraction(voiceAssistantBtn);
      this._state.voiceAssistantEnabled = voiceAssistantBtn.dataset.settingVoiceAssistant === "on";
      if (!this._state.voiceAssistantEnabled) this._stopVoiceAssistantRecognition();
      this._persistMobileAppearance();
      this._reopenSettingsMenuPreservingScroll({ rebuild: true, init: true });
      return;
    }
    const voiceAssistantModeBtn = eventTarget.closest("[data-setting-voice-assistant-mode]");
    if (voiceAssistantModeBtn?.dataset.settingVoiceAssistantMode) {
      this._flashInteraction(voiceAssistantModeBtn);
      this._state.voiceAssistantMode = HomeiiMobileSettingsFoundation.normalizeVoiceAssistantMode(voiceAssistantModeBtn.dataset.settingVoiceAssistantMode);
      this._persistMobileAppearance();
      this._reopenSettingsMenuPreservingScroll();
      return;
    }
    const voiceFeedbackBtn = eventTarget.closest("[data-setting-voice-feedback]");
    if (voiceFeedbackBtn?.dataset.settingVoiceFeedback) {
      this._flashInteraction(voiceFeedbackBtn);
      this._state.voiceAssistantSpeakFeedback = voiceFeedbackBtn.dataset.settingVoiceFeedback === "on";
      this._persistMobileAppearance();
      this._reopenSettingsMenuPreservingScroll();
      return;
    }
    const footerModeBtn = eventTarget.closest("[data-setting-footer-mode]");
    const playerDesignBtn = eventTarget.closest("[data-setting-player-design]");
    if (playerDesignBtn) {
      this._state.mobilePlayerDesign = playerDesignBtn.dataset.settingPlayerDesign === "immersive" ? "immersive" : "classic";
      this._persistMobileAppearance();
      this._reopenSettingsMenuPreservingScroll({ rebuild: true, init: true });
      return;
    }
    if (footerModeBtn?.dataset.settingFooterMode) {
      this._flashInteraction(footerModeBtn);
      this._state.mobileFooterMode = footerModeBtn.dataset.settingFooterMode;
      this._persistMobileAppearance();
      this._reopenSettingsMenuPreservingScroll({ rebuild: true, init: true });
      return;
    }
    const volumeModeBtn = eventTarget.closest("[data-setting-volume-mode]");
    if (volumeModeBtn?.dataset.settingVolumeMode) {
      this._flashInteraction(volumeModeBtn);
      this._state.mobileVolumeMode = volumeModeBtn.dataset.settingVolumeMode === "always" ? "always" : "button";
      this._persistMobileAppearance();
      this._reopenSettingsMenuPreservingScroll({ rebuild: true, init: true });
      return;
    }
    const volumeStepButtonsBtn = eventTarget.closest("[data-setting-volume-step-buttons]");
    if (volumeStepButtonsBtn?.dataset.settingVolumeStepButtons) {
      this._flashInteraction(volumeStepButtonsBtn);
      this._state.mobileVolumeStepButtonsEnabled = volumeStepButtonsBtn.dataset.settingVolumeStepButtons === "on";
      this._persistMobileAppearance();
      this._reopenSettingsMenuPreservingScroll({ rebuild: true, init: true });
      return;
    }
    const likedModeBtn = eventTarget.closest("[data-setting-liked-mode]");
    if (likedModeBtn?.dataset.settingLikedMode) {
      this._flashInteraction(likedModeBtn);
      this._state.mobileLikedMode = likedModeBtn.dataset.settingLikedMode;
      this._persistMobileAppearance();
      this._cache.library.delete("liked:ma");
      this._reopenSettingsMenuPreservingScroll({ rebuild: true, init: true });
      return;
    }
    const libraryTabSearchToggleBtn = eventTarget.closest("[data-library-tab-search-toggle]");
    if (libraryTabSearchToggleBtn) {
      e.preventDefault();
      e.stopPropagation();
      this._showLibraryInteractionFeedback(libraryTabSearchToggleBtn);
      this._state.libraryTabSearchOpen = this._state.libraryTabSearchOpen !== true;
      if (this._state.libraryTabSearchOpen) this._state.libraryTabSearchFocusId = "mobileLibraryTabSearchRowInput";
      await this._renderMobileMenu();
      return;
    }
    const libraryFavoritesToggleBtn = eventTarget.closest("[data-library-favorites-toggle]");
    const libraryLikedOpenBtn = eventTarget.closest('[data-library-liked-open], [data-menu-nav="library_liked"]');
    if (libraryLikedOpenBtn) {
      e.preventDefault();
      e.stopPropagation();
      this._showLibraryInteractionFeedback(libraryLikedOpenBtn, { loading: true, loadingMs: 450 });
      if (this._state.menuPage === "library_liked") {
        await this._renderMobileMenu();
      } else {
        this._pushMobileMenu("library_liked");
      }
      return;
    }
    if (libraryFavoritesToggleBtn) {
      e.preventDefault();
      e.stopPropagation();
      this._showLibraryInteractionFeedback(libraryFavoritesToggleBtn, { loading: true, loadingMs: 500 });
      const page = libraryFavoritesToggleBtn.dataset.libraryFavoritesToggle || this._state.menuPage;
      const nextEnabled = !this._libraryFavoritesOnlyEnabled(page);
      if (this._setLibraryFavoritesOnly(page, nextEnabled)) await this._renderMobileMenu();
      return;
    }
    const libraryTabSearchSubmitBtn = eventTarget.closest("[data-library-tab-search-submit]");
    if (libraryTabSearchSubmitBtn) {
      e.preventDefault();
      e.stopPropagation();
      const page = libraryTabSearchSubmitBtn.dataset.libraryTabSearchSubmit || this._state.menuPage;
      const input = libraryTabSearchSubmitBtn.closest(".library-toolbar-search, .library-tab-search-row")?.querySelector("[data-library-tab-search-input]");
      this._showLibraryInteractionFeedback(libraryTabSearchSubmitBtn, { loading: true, loadingMs: 700 });
      this._commitLibraryTabSearchQuery(page, input?.value ?? null);
      this._state.libraryTabSearchOpen = true;
      this._state.libraryTabSearchFocusId = input?.id || (libraryTabSearchSubmitBtn.closest(".library-tab-search-row") ? "mobileLibraryTabSearchRowInput" : "mobileLibraryTabSearchInput");
      await this._renderMobileMenu();
      return;
    }
    const libraryTabSearchClearBtn = eventTarget.closest("[data-library-tab-search-clear]");
    if (libraryTabSearchClearBtn) {
      e.preventDefault();
      e.stopPropagation();
      this._showLibraryInteractionFeedback(libraryTabSearchClearBtn);
      this._setLibraryTabSearchQuery("", libraryTabSearchClearBtn.dataset.libraryTabSearchClear || this._state.menuPage);
      this._state.libraryTabSearchOpen = true;
      this._state.libraryTabSearchFocusId = libraryTabSearchClearBtn.closest(".library-tab-search-row") ? "mobileLibraryTabSearchRowInput" : "mobileLibraryTabSearchInput";
      await this._renderMobileMenu();
      return;
    }
    const mediaDetailLayoutBtn = eventTarget.closest("[data-media-detail-layout]");
    if (mediaDetailLayoutBtn?.dataset.mediaDetailLayout) {
      this._flashInteraction(mediaDetailLayoutBtn);
      this._state.mobileMediaDetailLayout = mediaDetailLayoutBtn.dataset.mediaDetailLayout === "list" ? "list" : "grid";
      await this._renderMobileMenu();
      return;
    }
    const libraryFlowToggleBtn = eventTarget.closest("[data-library-flow-toggle]");
    if (libraryFlowToggleBtn?.dataset.libraryFlowToggle) {
      e.preventDefault();
      e.stopPropagation();
      const page = libraryFlowToggleBtn.dataset.libraryFlowToggle || this._state.menuPage;
      this._showLibraryInteractionFeedback(libraryFlowToggleBtn);
      this._state.mobileLibraryFlowPage = this._libraryFlowPageActive(page) ? "" : page;
      await this._renderMobileMenu();
      return;
    }
    const artistAlbumFlowOpenBtn = eventTarget.closest("[data-artist-album-flow-open]");
    if (artistAlbumFlowOpenBtn) {
      e.preventDefault();
      e.stopPropagation();
      this._showLibraryInteractionFeedback(artistAlbumFlowOpenBtn);
      this._pushMobileMenu("artist_album_flow");
      return;
    }
    const libraryDefaultLayoutBtn = eventTarget.closest("[data-setting-library-default-layout]");
    if (libraryDefaultLayoutBtn?.dataset.settingLibraryDefaultLayout) {
      this._flashInteraction(libraryDefaultLayoutBtn);
      this._state.mobileLibraryDefaultLayout = HomeiiMobileSettingsFoundation.normalizeMobileLibraryDefaultLayout(
        libraryDefaultLayoutBtn.dataset.settingLibraryDefaultLayout,
        this._defaultMobileMediaLayout()
      );
      this._state.mobileMediaLayoutManual = false;
      this._state.mobileMediaLayout = this._defaultMobileMediaLayout();
      this._persistMobileAppearance();
      this._reopenSettingsMenuPreservingScroll({ rebuild: true, init: true });
      return;
    }
    const mediaLayoutBtn = eventTarget.closest("[data-media-layout]");
    if (mediaLayoutBtn?.dataset.mediaLayout) {
      this._showLibraryInteractionFeedback(mediaLayoutBtn);
      this._state.mobileMediaLayout = mediaLayoutBtn.dataset.mediaLayout === "grid" ? "grid" : "list";
      this._state.mobileMediaLayoutManual = true;
      this._state.mobileLibraryFlowPage = "";
      await this._renderMobileMenu();
      return;
    }
    const mediaSurpriseBtn = eventTarget.closest("[data-media-surprise]");
    if (mediaSurpriseBtn) {
      const feedbackEl = this._showLibraryInteractionFeedback(mediaSurpriseBtn, { loading: true, hold: true });
      try {
        await this._playRandomFromPlaylists();
      } finally {
        this._clearLibraryInteractionFeedback(feedbackEl);
      }
      return;
    }
    const discoveryOrbBtn = eventTarget.closest(".discovery-orb[data-media-uri]");
    if (this._state.menuPage === "discovery" && discoveryOrbBtn?.dataset.mediaUri) {
      const uri = discoveryOrbBtn.dataset.mediaUri;
      if (this._state.discoveryExpandedUri !== uri || !discoveryOrbBtn.classList.contains("is-active")) {
        e.preventDefault();
        e.stopPropagation();
        this._state.discoveryExpandedUri = uri;
        this._syncDiscoveryOrbSelection(uri);
        this._showLibraryInteractionFeedback(discoveryOrbBtn);
        this._hapticTap([6]);
        return;
      }
      this._showLibraryInteractionFeedback(discoveryOrbBtn, { loading: true, loadingMs: 2800 });
      discoveryOrbBtn.classList.add("is-launching");
      discoveryOrbBtn.setAttribute("aria-busy", "true");
      this._hapticTap([10, 24, 10]);
    }
    const discoveryBlank = eventTarget.closest(".discovery-shell, .discovery-endless, .discovery-orb-field");
    if (this._state.menuPage === "discovery" && this._state.discoveryExpandedUri && discoveryBlank && !eventTarget.closest("button, a, input, textarea, select")) {
      e.preventDefault();
      e.stopPropagation();
      this._state.discoveryExpandedUri = "";
      this._syncDiscoveryOrbSelection("");
      this._hapticTap([4]);
      return;
    }
    const radioBackBtn = eventTarget.closest("[data-radio-countries-back]");
    if (radioBackBtn) {
      e.preventDefault();
      e.stopPropagation();
      this._showLibraryInteractionFeedback(radioBackBtn);
      this._state.mobileRadioBrowseCountry = "";
      this._state.mobileRadioBrowseCountryName = "";
      await this._renderMobileMenu();
      return;
    }
    const radioCountryBtn = eventTarget.closest("[data-radio-country]");
    if (radioCountryBtn?.dataset.radioCountry) {
      e.preventDefault();
      e.stopPropagation();
      this._showLibraryInteractionFeedback(radioCountryBtn, { loading: true, loadingMs: 1200 });
      this._hapticTap([8]);
      this._state.mobileRadioBrowseCountry = radioCountryBtn.dataset.radioCountry;
      this._state.mobileRadioBrowseCountryName = radioCountryBtn.dataset.radioCountryName || radioCountryBtn.dataset.radioCountry;
      await this._renderMobileMenu();
      return;
    }
    const nav = eventTarget.closest("[data-menu-nav]");
    if (nav) {
      this._showLibraryInteractionFeedback(nav);
      if (nav.dataset.menuNav === "stop_all") {
        e.preventDefault();
        e.stopPropagation();
        this._openCleanAllConfirm();
        return;
      }
      return this._pushMobileMenu(nav.dataset.menuNav);
    }
    const queueFlowOpenBtn = eventTarget.closest("[data-queue-flow-open]");
    if (queueFlowOpenBtn) {
      e.preventDefault();
      e.stopPropagation();
      this._showLibraryInteractionFeedback(queueFlowOpenBtn);
      this._state.mobileQueueFlowQuickOpen = true;
      await this._renderMobileMenu();
      return;
    }
    if (
      this._state.menuPage === "library_liked"
      && this._state.likedSelectionMode
      && (eventTarget.closest("[data-media-uri]") || eventTarget.closest("[data-media-play]") || eventTarget.closest("[data-media-open]"))
      && !eventTarget.closest(".liked-select-box")
    ) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    const mediaDetailActionBtn = eventTarget.closest("[data-media-detail-action]");
    if (mediaDetailActionBtn) {
      e.preventDefault();
      e.stopPropagation();
      await this._handleMediaDetailActionButton(mediaDetailActionBtn);
      return;
    }
    const mediaDetailBrowseBtn = eventTarget.closest("[data-media-detail-browse]");
    if (mediaDetailBrowseBtn) {
      e.preventDefault();
      e.stopPropagation();
      if (mediaDetailBrowseBtn.disabled) return;
      const feedbackEl = this._showLibraryInteractionFeedback(mediaDetailBrowseBtn, { loading: true, hold: true });
      const direction = mediaDetailBrowseBtn.dataset.mediaDetailBrowse === "prev" ? -1 : 1;
      try {
        await this._openLibraryAdjacentAlbum(direction, mediaDetailBrowseBtn);
      } finally {
        this._clearLibraryInteractionFeedback(feedbackEl);
      }
      return;
    }
    const mediaLikeBtn = eventTarget.closest("[data-media-like]");
    if (mediaLikeBtn) {
      e.preventDefault();
      e.stopPropagation();
      this._showLibraryInteractionFeedback(mediaLikeBtn);
      const scrollSnapshot = this._captureMobileMenuScroll(this._state.menuPage || "main");
      const ok = await this._toggleLikeEntry({
        uri: mediaLikeBtn.dataset.mediaLike,
        media_type: mediaLikeBtn.dataset.mediaType || "album",
        name: mediaLikeBtn.dataset.mediaName || "",
        artist: mediaLikeBtn.dataset.mediaArtist || "",
        album: mediaLikeBtn.dataset.mediaAlbum || "",
        image: mediaLikeBtn.dataset.mediaImage || "",
        favorite_scope: mediaLikeBtn.dataset.mediaFavoriteScope || "library",
      }, mediaLikeBtn);
      if (!ok) return;
      await this._renderMobileMenu();
      if (scrollSnapshot) this._restoreMobileMenuScrollSnapshot(scrollSnapshot, scrollSnapshot.page);
      return;
    }
    const mediaMoreBtn = eventTarget.closest("[data-media-more]");
    if (mediaMoreBtn) {
      e.preventDefault();
      e.stopPropagation();
      this._showLibraryInteractionFeedback(mediaMoreBtn);
      this._hapticTap([10]);
      this._openMobileMediaActionMenu({
        uri: mediaMoreBtn.dataset.mediaMore,
        media_type: mediaMoreBtn.dataset.mediaType || "album",
        name: mediaMoreBtn.dataset.mediaName || "",
        artist: mediaMoreBtn.dataset.mediaArtist || "",
        album: mediaMoreBtn.dataset.mediaAlbum || "",
        image: mediaMoreBtn.dataset.mediaImage || "",
        favorite_scope: mediaMoreBtn.dataset.mediaFavoriteScope || "library",
      });
      return;
    }
    const mediaPlayBtn = eventTarget.closest("[data-media-play]");
    if (mediaPlayBtn?.dataset.mediaPlay) {
      e.preventDefault();
      e.stopPropagation();
      const sourceEl = mediaPlayBtn.closest(".media-entry, .media-detail-hero") || mediaPlayBtn;
      const feedbackEl = this._showLibraryInteractionFeedback(sourceEl, { loading: true, hold: true });
      const label = mediaPlayBtn.dataset.mediaName || sourceEl.querySelector?.(".menu-item-title, .media-detail-title")?.textContent?.trim() || "";
      try {
        const played = await this._playMedia(mediaPlayBtn.dataset.mediaPlay, mediaPlayBtn.dataset.mediaType || "album", "play", {
          label,
          sourceEl,
          forceRadioHero: this._state.menuPage === "library_radio",
        });
        if (played) return this._closeMobileMenu();
        await this._renderMobileMenu();
      } finally {
        this._clearLibraryInteractionFeedback(feedbackEl);
      }
      return;
    }
    const mediaOpenBtn = eventTarget.closest("[data-media-open]");
    if (mediaOpenBtn?.dataset.mediaOpen) {
      e.preventDefault();
      e.stopPropagation();
      const sourceEl = mediaOpenBtn.closest(".media-entry") || mediaOpenBtn;
      const feedbackEl = this._showLibraryInteractionFeedback(sourceEl, { loading: true, loadingMs: 1600 });
      const opened = this._openLibraryMediaDetail({
        uri: mediaOpenBtn.dataset.mediaOpen,
        media_type: mediaOpenBtn.dataset.mediaType || "album",
        name: mediaOpenBtn.dataset.mediaName || sourceEl.querySelector?.(".menu-item-title")?.textContent?.trim() || "",
        artist: mediaOpenBtn.dataset.mediaArtist || "",
        album: mediaOpenBtn.dataset.mediaAlbum || "",
        image: mediaOpenBtn.dataset.mediaImage || "",
        favorite_scope: mediaOpenBtn.dataset.mediaFavoriteScope || "library",
      }, sourceEl);
      if (!opened) this._clearLibraryInteractionFeedback(feedbackEl);
      if (opened) return;
    }
    const mediaBtn = eventTarget.closest("[data-media-uri]");
    if (mediaBtn?.dataset.mediaUri) {
      e.preventDefault();
      e.stopPropagation();
      const sourceEl = mediaBtn.closest(".media-entry") || mediaBtn;
      const feedbackEl = this._showLibraryInteractionFeedback(sourceEl, { loading: true, hold: true });
      const label = mediaBtn.dataset.mediaName || mediaBtn.querySelector(".menu-item-title, .discovery-orb-title")?.textContent?.trim() || "";
      try {
        const played = await this._playMedia(mediaBtn.dataset.mediaUri, mediaBtn.dataset.mediaType || "album", "play", {
          label,
          sourceEl,
          forceRadioHero: this._state.menuPage === "library_radio",
        });
        if (played) return this._closeMobileMenu();
        await this._renderMobileMenu();
      } finally {
        this._clearLibraryInteractionFeedback(feedbackEl);
      }
      return;
    }
    const playerBtn = eventTarget.closest("[data-menu-player]");
    if (playerBtn) {
      this._selectPlayer(playerBtn.dataset.menuPlayer, true);
      this._toast(this._i18n("ui.player_selected"), "info", { position: "top" });
      const previousPage = this._state.menuStack[this._state.menuStack.length - 1];
      if (String(previousPage || "").startsWith("library_") || previousPage === "media_detail" || previousPage === "discovery") {
        this._state.menuPage = this._state.menuStack.pop();
        await this._renderMobileMenu();
        return;
      }
      return this._closeMobileMenu();
    }
    const queueFlowBtn = eventTarget.closest("[data-queue-flow-item]");
    if (queueFlowBtn) {
      e.preventDefault();
      e.stopPropagation();
      this._flashInteraction(queueFlowBtn);
      queueFlowBtn.classList?.add("queue-flow-selecting");
      try {
        const played = await this._playQueueItem(
          queueFlowBtn.dataset.queueItemId,
          queueFlowBtn.dataset.uri,
          queueFlowBtn.dataset.type || "track",
          queueFlowBtn.dataset.sortIndex || ""
        );
        if (played) this._closeMobileMenu();
        else await this._renderMobileMenu();
      } finally {
        queueFlowBtn.classList?.remove("queue-flow-selecting");
      }
      return;
    }
    const queueMenuBtn = eventTarget.closest("[data-queue-menu]");
    if (queueMenuBtn) {
      e.preventDefault();
      e.stopPropagation();
      const key = String(queueMenuBtn.dataset.queueMenu || "");
      this._setQueueInlineActionsExpanded(this._state.expandedQueueItemId === key ? "" : key);
      return;
    }
    if (eventTarget.closest(".queue-inline-actions")) {
      e.stopPropagation();
      return;
    }
    const transferBtn = eventTarget.closest("[data-menu-transfer]");
    if (transferBtn) {
      await this._transferQueueTo(transferBtn.dataset.menuTransfer);
      return this._closeMobileMenu();
    }
    const queueRow = eventTarget.closest(".queue-row");
    if (queueRow?.dataset.queueItemId || queueRow?.dataset.uri) {
      await this._playQueueItem(
        queueRow.dataset.queueItemId,
        queueRow.dataset.uri,
        queueRow.dataset.type || "track",
        queueRow.dataset.sortIndex || ""
      );
      this._closeMobileMenu();
      return;
    }
  }

  async _handleMobileMenuKeydown(e) {
    const libraryTabSearchInput = e.target?.closest?.("[data-library-tab-search-input]");
    if (!libraryTabSearchInput || e.key !== "Enter") return;
    e.preventDefault();
    e.stopPropagation();
    const page = libraryTabSearchInput.dataset.libraryTabSearchInput || this._state.menuPage;
    this._commitLibraryTabSearchQuery(page, libraryTabSearchInput.value || "");
    this._state.libraryTabSearchOpen = true;
    this._state.libraryTabSearchFocusId = libraryTabSearchInput.id || "";
    await this._renderMobileMenu();
  }

  async _handleMobileMenuChange(e) {
    if (e.target?.matches?.("[data-playback-speed]")) {
      if (e.type === "change") return setPlaybackSpeed(this, e.target);
      return;
    }
    if (e.target?.matches?.("[data-queue-setting]")) {
      updateQueueSettingVisibility(e.target.closest(".queue-settings-form"));
      return;
    }
    const libraryTabSearchInput = e.target?.closest?.("[data-library-tab-search-input]");
    if (libraryTabSearchInput) {
      const page = libraryTabSearchInput.dataset.libraryTabSearchInput || this._state.menuPage;
      this._setLibraryTabSearchDraft(libraryTabSearchInput.value || "", page);
      this._state.libraryTabSearchOpen = true;
      this._state.libraryTabSearchFocusId = libraryTabSearchInput.id || "";
      const wrap = libraryTabSearchInput.closest(".library-toolbar-search, .library-tab-search-row");
      const clearBtn = wrap?.querySelector("[data-library-tab-search-clear]");
      clearBtn?.classList?.toggle("visible", !!String(libraryTabSearchInput.value || "").trim() || !!this._libraryTabSearchQuery(page));
      return;
    }
    if (this._isScheduleFormControl(e.target)) this._markScheduleFormControlActive(e.target);
    if (e.type === "input" && e.target?.matches?.('input[type="checkbox"]')) return;
    if (e.target?.matches?.("[data-queue-move-auto]")) {
      await this._handleQueueMoveAutoChange(e);
      return;
    }
    if (e.target?.matches?.("[data-queue-move-target]")) return;
    this._rememberMobileMenuScroll();
    if (e.target?.id === "simpleWizardQueryInput") {
      const state = this._state.simpleWizard && typeof this._state.simpleWizard === "object"
        ? this._state.simpleWizard
        : this._createSimpleWizardState();
      state.query = e.target.value || "";
      this._state.simpleWizard = state;
      return;
    }
    if (e.target?.id === "simpleWizardGenreSelect") {
      const state = this._state.simpleWizard && typeof this._state.simpleWizard === "object"
        ? this._state.simpleWizard
        : this._createSimpleWizardState();
      state.genre = this._simpleWizardGenres().some((genre) => genre.id === e.target.value) ? e.target.value : "pop";
      state.candidates = [];
      state.selectedIndex = 0;
      this._state.simpleWizard = state;
      await this._renderMobileMenu();
      return;
    }
    if (e.target?.id === "simpleWizardCustomGenreInput") {
      const state = this._state.simpleWizard && typeof this._state.simpleWizard === "object"
        ? this._state.simpleWizard
        : this._createSimpleWizardState();
      state.customGenre = e.target.value || "";
      this._state.simpleWizard = state;
      return;
    }
    if (e.target?.id === "scheduledStartTimeInput") {
      if (e.target.value) this._state.mobileStartTimerTime = this._normalizeClockTime(e.target.value, this._state.mobileStartTimerTime || "07:00");
      return;
    }
    if (e.target?.id === "scheduledStartPlayerSelect") {
      this._state.mobileStartTimerPlayer = String(e.target.value || "").trim();
      return;
    }
    if (e.target?.id === "scheduledStartPlaylistSelect") {
      const playlist = String(e.target.value || "").trim();
      this._state.mobileStartTimerPlaylist = playlist;
      this._state.mobileStartTimerPlaylistName = playlist
        ? String(e.target.selectedOptions?.[0]?.textContent || "").trim()
        : "";
      return;
    }
    if (e.target?.id === "scheduledStartAfterRunSelect") {
      this._state.mobileStartTimerAfterRun = String(e.target.value || "keep") === "disable" ? "disable" : "keep";
      return;
    }
    const startDayCheckbox = e.target?.closest?.("input[data-start-timer-day]");
    if (startDayCheckbox) {
      this._state.mobileStartTimerDays = this._normalizeNightModeDays(
        Array.from(this.shadowRoot?.querySelectorAll("input[data-start-timer-day]:checked") || [])
          .map((input) => Number(input.dataset.startTimerDay))
          .filter((value) => Number.isInteger(value) && value >= 0 && value <= 6)
      );
      return;
    }
    const nightDayCheckbox = e.target?.closest?.("input[data-setting-night-day]");
    if (nightDayCheckbox) {
      this._state.mobileNightModeDays = this._normalizeNightModeDays(
        Array.from(this.shadowRoot?.querySelectorAll("input[data-setting-night-day]:checked") || [])
          .map((input) => Number(input.dataset.settingNightDay))
          .filter((value) => Number.isInteger(value) && value >= 0 && value <= 6)
      );
      return;
    }
    if (e.target?.id === "mobileAnnouncementText") {
      this._state.mobileAnnouncementText = e.target.value || "";
      return;
    }
    if (e.target?.id === "mobileAnnouncementTargetSelect") {
      this._state.mobileAnnouncementTarget = e.target.value || "";
      return;
    }
    if (e.target?.id === "mobileAnnouncementVolumeInput") {
      const pct = Math.max(20, Math.min(50, Number(e.target.value || 20)));
      this._state.mobileAnnouncementVolume = pct;
      const valueEl = e.target.closest(".announcement-volume-field")?.querySelector(".settings-value");
      if (valueEl) valueEl.textContent = `+${pct}%`;
      this._persistMobileAppearance();
      return;
    }
    if (e.target?.dataset?.announcementPresetIndex !== undefined) {
      const index = Number(e.target.dataset.announcementPresetIndex);
      if (Number.isFinite(index)) {
        const presets = Array.isArray(this._state.mobileAnnouncementPresets) ? [...this._state.mobileAnnouncementPresets] : ["", "", ""];
        presets[index] = e.target.value || "";
        this._state.mobileAnnouncementPresets = presets.slice(0, 3);
        this._persistMobileAppearance();
      }
      return;
    }
    if (e.target?.id === "mobileAnnouncementTtsEntity") {
      this._state.mobileAnnouncementTtsEntity = e.target.value || "";
      this._persistMobileAppearance();
      return;
    }
    if (e.target?.id === "mobileLanguageSelect") {
      this._state.lang = e.target.value || "en";
      try { localStorage.setItem(this._lsKey("homeii_music_flow_lang"), this._state.lang); } catch (_) {}
      this._reopenSettingsMenuPreservingScroll({ rebuild: true, init: true });
      return;
    }
    if (e.target?.id === "mobileAnnouncementTtsLanguageSelect") {
      this._state.mobileAnnouncementTtsLanguage = this._normalizeAnnouncementLanguage(e.target.value || "auto");
      this._persistMobileAppearance();
      return;
    }
    if (e.target?.id === "voiceAssistantAgentSelect") {
      this._state.voiceAssistantAgentId = String(e.target.value || "").trim();
      this._persistMobileAppearance();
      return;
    }
    if (e.target?.id === "ambientLightEntitiesInput") {
      this._state.ambientLightEntities = HomeiiMobileSettingsFoundation.normalizeEntityList(e.target.value || "");
      this._persistMobileAppearance();
      this._syncAmbientLightForCurrentMedia("settings");
      return;
    }
    if (e.target?.id === "ambientLightPlayerMapInput") {
      this._state.ambientLightPlayerMap = HomeiiMobileSettingsFoundation.normalizeStringArray(
        String(e.target.value || "").split(/[\n,]+/),
      );
      this._persistMobileAppearance();
      this._syncAmbientLightForCurrentMedia("settings");
      return;
    }
    if (e.target?.id === "ambientLightBrightnessInput") {
      const pct = HomeiiMobileSettingsFoundation.clampPercent(e.target.value || 35, 35, { min: 1, max: 100 });
      this._state.ambientLightBrightness = pct;
      const valueEl = e.target.closest(".settings-range")?.querySelector(".settings-value");
      if (valueEl) valueEl.textContent = `${Math.round(pct)}%`;
      this._persistMobileAppearance();
      this._syncAmbientLightForCurrentMedia("settings");
      return;
    }
    if (e.target?.id === "ambientLightTransitionInput") {
      this._state.ambientLightTransition = HomeiiMobileSettingsFoundation.clampSeconds(e.target.value || 3, 3, { min: 0, max: 120 });
      this._persistMobileAppearance();
      return;
    }
    if (e.target?.id === "ambientLightCooldownInput") {
      this._state.ambientLightCooldown = HomeiiMobileSettingsFoundation.clampSeconds(e.target.value || 8, 8, { min: 0, max: 120 });
      this._persistMobileAppearance();
      return;
    }
    if (e.target?.id === "screensaverClockModeSelect") {
      this._state.screensaverClockMode = HomeiiMobileSettingsFoundation.normalizeScreensaverClockMode(e.target.value || "digital");
      this._persistMobileAppearance();
      this._syncScreensaverUi();
      return;
    }
    if (e.target?.id === "powerButtonActionSelect") {
      this._state.powerButtonAction = HomeiiMobileSettingsFoundation.normalizePowerButtonAction(e.target.value || "stop_player");
      this._persistMobileAppearance();
      return;
    }
    if (e.target?.id === "powerButtonNameInput") {
      this._state.powerButtonName = String(e.target.value || "").trim();
      this._persistMobileAppearance();
      return;
    }
    if (e.target?.id === "powerButtonIconSelect") {
      this._state.powerButtonIcon = HomeiiMobileSettingsFoundation.normalizeAuxiliaryButtonIcon(e.target.value || "power");
      this._persistMobileAppearance();
      this._reopenSettingsMenuPreservingScroll({ rebuild: true, init: true });
      return;
    }
    if (e.target?.id === "powerButtonEntityInput") {
      this._state.powerButtonEntity = String(e.target.value || "").trim();
      this._persistMobileAppearance();
      return;
    }
    const auxButtonToggle = e.target?.closest?.("[data-setting-aux-button-enabled]");
    if (auxButtonToggle?.dataset?.settingAuxButton) {
      const index = Math.max(2, Math.min(4, Number(auxButtonToggle.dataset.settingAuxButton) || 2));
      const next = this._auxiliaryButtonConfigs().slice(1);
      const offset = index - 2;
      next[offset] = { ...(next[offset] || {}), enabled: auxButtonToggle.dataset.settingAuxButtonEnabled === "on" };
      this._state.auxiliaryButtons = next;
      this._persistMobileAppearance();
      this._reopenSettingsMenuPreservingScroll({ rebuild: true, init: true });
      return;
    }
    const auxNameInput = e.target?.closest?.("[data-aux-button-name]");
    if (auxNameInput) {
      const index = Math.max(2, Math.min(4, Number(auxNameInput.dataset.auxButtonName) || 2));
      const next = this._auxiliaryButtonConfigs().slice(1);
      const offset = index - 2;
      next[offset] = { ...(next[offset] || {}), name: String(auxNameInput.value || "").trim() };
      this._state.auxiliaryButtons = next;
      this._persistMobileAppearance();
      return;
    }
    const auxIconSelect = e.target?.closest?.("[data-aux-button-icon]");
    if (auxIconSelect) {
      const index = Math.max(2, Math.min(4, Number(auxIconSelect.dataset.auxButtonIcon) || 2));
      const next = this._auxiliaryButtonConfigs().slice(1);
      const offset = index - 2;
      next[offset] = { ...(next[offset] || {}), icon: HomeiiMobileSettingsFoundation.normalizeAuxiliaryButtonIcon(auxIconSelect.value || "power") };
      this._state.auxiliaryButtons = next;
      this._persistMobileAppearance();
      this._reopenSettingsMenuPreservingScroll({ rebuild: true, init: true });
      return;
    }
    const auxActionSelect = e.target?.closest?.("[data-aux-button-action]");
    if (auxActionSelect) {
      const index = Math.max(2, Math.min(4, Number(auxActionSelect.dataset.auxButtonAction) || 2));
      const next = this._auxiliaryButtonConfigs().slice(1);
      const offset = index - 2;
      next[offset] = { ...(next[offset] || {}), action: HomeiiMobileSettingsFoundation.normalizePowerButtonAction(auxActionSelect.value || "toggle") };
      this._state.auxiliaryButtons = next;
      this._persistMobileAppearance();
      return;
    }
    const auxEntityInput = e.target?.closest?.("[data-aux-button-entity]");
    if (auxEntityInput) {
      const index = Math.max(2, Math.min(4, Number(auxEntityInput.dataset.auxButtonEntity) || 2));
      const next = this._auxiliaryButtonConfigs().slice(1);
      const offset = index - 2;
      next[offset] = { ...(next[offset] || {}), entity: String(auxEntityInput.value || "").trim() };
      this._state.auxiliaryButtons = next;
      this._persistMobileAppearance();
      return;
    }
    const checkbox = e.target.closest("input[data-menu-group-player]");
    if (checkbox) {
      const entityId = checkbox.dataset.menuGroupPlayer;
      const next = new Set(this._state.pendingGroupSelections || []);
      if (checkbox.checked) next.add(entityId); else next.delete(entityId);
      this._state.pendingGroupSelections = Array.from(next);
      this._state.pendingGroupSelectionsDirty = true;
      const playerCard = checkbox.closest(".group-player-card");
      const connected = playerCard?.dataset?.groupConnected === "true";
      const isOwner = checkbox.dataset.groupOwner === "true" || playerCard?.dataset?.groupOwner === "true";
      if (isOwner) this._state.pendingGroupOwnerRemoval = !checkbox.checked;
      const statusClass = this._groupPlayerStatusClass(checkbox.checked, connected, isOwner);
      playerCard?.classList.toggle("checked", checkbox.checked);
      ["idle", "connected", "will-add", "will-remove", "master", "will-clear"].forEach((className) => playerCard?.classList.toggle(className, className === statusClass));
      playerCard?.querySelector(".group-player-row")?.classList.toggle("checked", checkbox.checked);
      const toggle = playerCard?.querySelector(".group-player-toggle");
      if (toggle) {
        toggle.classList.toggle("checked", checkbox.checked);
        toggle.innerHTML = this._iconSvg(this._groupPlayerStatusIcon(checkbox.checked, connected, isOwner));
      }
      const status = playerCard?.querySelector(".group-player-status");
      if (status) {
        ["idle", "connected", "will-add", "will-remove", "master", "will-clear"].forEach((className) => status.classList.toggle(className, className === statusClass));
        status.textContent = this._groupPlayerStatusText(checkbox.checked, connected, isOwner);
      }
      this._syncMobileGroupActionState();
      return;
    }
    if (e.target?.id === "mobileCustomColorPicker") {
      const color = e.target.value || "#f5a623";
      this._state.mobileCustomColor = color;
      this._persistMobileAppearance();
      this.style?.setProperty("--accent-color", color);
      this.shadowRoot?.querySelector(".card")?.style?.setProperty("--accent-color", color);
      this.shadowRoot?.querySelector(".card")?.style?.setProperty("--ma-accent", color);
      this._applyDynamicThemeStyles();
      const valueEl = e.target.closest(".settings-color-row")?.querySelector(".settings-value");
      if (valueEl) valueEl.textContent = String(color).toUpperCase();
      return;
    }
    if (e.target?.id === "mobileFontScaleRange") {
      this._state.mobileFontScale = Math.max(0.5, Math.min(1.5, Number(e.target.value || 1) || 1));
      this._persistMobileAppearance();
      this._reopenSettingsMenuPreservingScroll({ rebuild: true, init: true });
      return;
    }
    if (e.target?.id === "mobileIconScaleRange") {
      this._state.mobileIconScale = HomeiiMobileSettingsFoundation.clampMobileIconScale(e.target.value || 1);
      this._persistMobileAppearance();
      this._reopenSettingsMenuPreservingScroll({ rebuild: true, init: true });
      return;
    }
    if (e.target?.id === "mobileVolumeStepRange") {
      this._state.mobileVolumeStepPercent = HomeiiMobileSettingsFoundation.clampMobileVolumeStepPercent(e.target.value || 5);
      this._persistMobileAppearance();
      this._reopenSettingsMenuPreservingScroll({ rebuild: true, init: true });
      return;
    }
    if (e.target?.id === "scheduledStartVolumeInput") {
      const pct = Math.max(0, Math.min(100, Number(e.target.value || 0)));
      this._state.mobileStartTimerVolume = pct;
      const valueEl = e.target.closest(".scheduled-volume-field")?.querySelector(".settings-value");
      if (valueEl) valueEl.textContent = `${pct}%`;
      return;
    }
    if (e.target?.id === "mobileNightStartInput" || e.target?.id === "mobileNightEndInput") {
      if (e.target.value) {
        if (e.target.id === "mobileNightStartInput") {
          this._state.mobileNightModeStart = this._normalizeClockTime(e.target.value, this._state.mobileNightModeStart || "22:00");
        } else {
          this._state.mobileNightModeEnd = this._normalizeClockTime(e.target.value, this._state.mobileNightModeEnd || "06:00");
        }
      }
      return;
    }
    if (e.target?.dataset?.playerVolume) {
      const pct = Math.max(0, Math.min(100, Number(e.target.value || 0)));
      e.target.style.setProperty("--vol-pct", `${pct}%`);
      this._setPlayerVolumeFor(e.target.dataset.playerVolume, pct / 100);
      return;
    }
    if (e.target?.dataset?.groupVolume) {
      const pct = Math.max(0, Math.min(100, Number(e.target.value || 0)));
      e.target.style.setProperty("--vol-pct", `${pct}%`);
      this._setGroupVolumeFor(e.target.dataset.groupVolume, pct / 100);
      return;
    }
    if (e.target?.id === "mobileLibrarySortSelect") {
      this._state.mobileLibrarySort = e.target.value || "name_asc";
      try { localStorage.setItem(this._lsKey("homeii_music_flow_mobile_library_sort"), this._state.mobileLibrarySort); } catch (_) {}
      this._cache.library.clear();
      this._renderMobileMenu();
      return;
    }
    if (e.target?.id === "mediaDetailAlbumSelect") {
      const index = Number(e.target.value);
      if (Number.isInteger(index)) {
        await this._openLibraryBrowseAlbumAtIndex(index, e.target);
      }
      return;
    }
    if (e.target?.id === "discoveryProviderSelect") {
      this._state.discoveryProviderPath = e.target.value;
      this._state.discoveryBrowsePath = "";
      this._state.discoveryBrowseTitle = "";
      this._discoveryLastView = null;
      await this._renderMobileMenu();
      return;
    }
    if (e.target?.id === "discoveryCategorySelect") {
      this._startDiscoverySession();
      await this._selectDiscoveryCategory(e.target.value || "");
      this._persistMobileAppearance();
      return;
    }
    if (e.target?.id === "mobileRadioCountrySelect") {
      this._state.mobileRadioBrowserCountry = e.target.value || "all";
      this._state.mobileRadioBrowseCountry = "";
      this._state.mobileRadioBrowseCountryName = "";
      this._persistMobileAppearance();
      this._cache.library.delete("radio-browser:countries");
      this._reopenSettingsMenuPreservingScroll();
      return;
    }
    if (e.target?.id === "mobileRadioSourceModeSelect") {
      this._state.mobileRadioSourceMode = HomeiiMobileSettingsFoundation.normalizeMobileRadioSourceMode(e.target.value || "combined");
      this._state.mobileRadioBrowseCountry = "";
      this._state.mobileRadioBrowseCountryName = "";
      this._persistMobileAppearance();
      this._cache.library.clear();
      this._reopenSettingsMenuPreservingScroll();
      return;
    }
    if (e.target?.id === "mobileHomeShortcutPathInput") {
      this._state.mobileHomeShortcutPath = e.target.value || "/";
      this._persistMobileAppearance();
      return;
    }
    if (e.target?.id === "playerSortModeSelect") {
      this._state.playerSortMode = HomeiiMobileSettingsFoundation.normalizePlayerSortMode(e.target.value || "default");
      this._persistMobileAppearance();
      // _loadPlayers() is handled by _refreshAfterSettingsChange via playerListChanged
      this._refreshAfterSettingsChange({ playerListChanged: true });
      return;
    }
    const pinnedPlayerCheckbox = e.target?.closest?.("input[data-setting-pinned-player]");
    if (pinnedPlayerCheckbox) {
      const entityId = String(pinnedPlayerCheckbox.dataset.settingPinnedPlayer || "").trim();
      const next = new Set(this._pinnedPlayerPreferences());
      if (pinnedPlayerCheckbox.checked) next.add(entityId); else next.delete(entityId);
      this._state.pinnedPlayerEntities = Array.from(next);
      this._persistMobileAppearance();
      this._loadPlayers();
      if (this._state.selectedPlayer && !this._resolvedPinnedPlayerEntities().includes(this._state.selectedPlayer)) {
        this._state.selectedPlayer = this._resolvedPinnedPlayerEntity() || this._state.selectedPlayer;
      }
      this._refreshAfterSettingsChange({ playerListChanged: true, pinnedChanged: true });
      return;
    }
    const excludedPlayerCheckbox = e.target?.closest?.("input[data-setting-excluded-player]");
    if (excludedPlayerCheckbox) {
      const entityId = String(excludedPlayerCheckbox.dataset.settingExcludedPlayer || "").trim();
      const next = new Set(this._excludedPlayerPreferences());
      if (excludedPlayerCheckbox.checked) next.add(entityId); else next.delete(entityId);
      this._state.excludedPlayerEntities = Array.from(next);
      this._persistMobileAppearance();
      this._loadPlayers();
      if (this._state.selectedPlayer && this._isPlayerExcluded(this._state.selectedPlayer)) {
        this._state.selectedPlayer = this._resolvedPinnedPlayerEntity() || this._state.players?.[0]?.entity_id || null;
      }
      this._refreshAfterSettingsChange({ playerListChanged: true });
      return;
    }
    const tabCheckbox = e.target?.closest?.("input[data-setting-library-tab]");
    if (tabCheckbox) {
      const tab = tabCheckbox.dataset.settingLibraryTab;
      const current = new Set(this._mobileLibraryTabs());
      if (tabCheckbox.checked) current.add(tab); else current.delete(tab);
      const next = Array.from(current);
      this._state.mobileLibraryTabs = next.length ? next : this._defaultMobileLibraryTabs();
      this._persistMobileAppearance();
      this._refreshAfterSettingsChange({ libraryTabsChanged: true });
      return;
    }
    const mainBarCheckbox = e.target?.closest?.("input[data-setting-main-bar-item]");
    if (mainBarCheckbox) {
      const item = mainBarCheckbox.dataset.settingMainBarItem;
      if (!this._usesVisualSettings() && item === "settings") {
        mainBarCheckbox.checked = true;
        return;
      }
      const current = new Set(this._mobileMainBarItems());
      if (mainBarCheckbox.checked) current.add(item); else current.delete(item);
      const next = Array.from(current);
      this._state.mobileMainBarItems = next.length ? next : this._defaultMobileMainBarItems();
      this._persistMobileAppearance();
      this._refreshAfterSettingsChange({ mainBarChanged: true });
      return;
    }
    const quickActionCheckbox = e.target?.closest?.("input[data-setting-quick-action]");
    if (quickActionCheckbox) {
      const item = String(quickActionCheckbox.dataset.settingQuickAction || "").trim();
      const current = new Set(this._mobileQuickActions());
      if (quickActionCheckbox.checked) current.add(item); else current.delete(item);
      const next = Array.from(current);
      this._state.mobileQuickActions = next;
      if (item === "home") this._state.mobileHomeShortcutEnabled = !!quickActionCheckbox.checked;
      this._persistMobileAppearance();
      this._refreshAfterSettingsChange({ quickActionsChanged: true });
      return;
    }
    const screensaverControlCheckbox = e.target?.closest?.("input[data-setting-screensaver-control]");
    if (screensaverControlCheckbox) {
      const item = String(screensaverControlCheckbox.dataset.settingScreensaverControl || "").trim();
      const current = new Set(this._screensaverControlButtons({ includeDisabled: true }));
      if (screensaverControlCheckbox.checked) current.add(item); else current.delete(item);
      this._state.screensaverControlButtons = HomeiiMobileSettingsFoundation.normalizeScreensaverControlButtons(Array.from(current), []);
      this._persistMobileAppearance();
      this._syncScreensaverUi();
      this._reopenSettingsMenuPreservingScroll({ rebuild: true, init: true });
      return;
    }
    const studioShortcutCheckbox = e.target?.closest?.("input[data-setting-studio-shortcut]");
    if (studioShortcutCheckbox) {
      this._state.mobileStudioShortcutEnabled = !!studioShortcutCheckbox.checked;
      this._persistMobileAppearance();
      this._reopenSettingsMenuPreservingScroll({ rebuild: true });
      return;
    }
  }

  async _handleMobileMediaInput(e) {
    this._state.mediaQuery = e.target.value || "";
    clearTimeout(this._searchTimer);
    this._searchTimer = setTimeout(() => {
      if (this._state.menuOpen && this._isMobileSearchPage()) this._renderMobileMediaResults();
    }, 220);
  }
}

class HomeiiMusicFlowBaseEditor extends HomeiiBaseMusicEditor {
  constructor() {
    super();
    this._config = { ...HomeiiMusicFlowBaseCard.getStubConfig(), type: "custom:homeii-music-flow" };
  }

  _getCardCtor() {
    return HomeiiMusicFlowBaseCard;
  }

  setConfig(config) {
    const nextConfig = {
      ...HomeiiMusicFlowBaseCard.getStubConfig(),
      ...config,
      type: "custom:homeii-music-flow",
    };
    const validator = this._getConfigValidator?.();
    if (typeof validator === "function") {
      validator(nextConfig);
    }
    this._config = nextConfig;
    this._render();
  }

  _getConfigValidator() {
    return HomeiiConfigValidators.validateMobileCardEditorConfig;
  }
}

class HomeiiMusicFlowCard extends HomeiiMusicFlowBaseCard {
  static getStubConfig() {
    return HomeiiMusicFlowBaseCard.getStubConfig();
  }

  static getConfigForm() {
    return HomeiiMusicFlowBaseCard.getConfigForm();
  }

  static async getConfigElement() {
    return document.createElement(HOMEII_MOBILE_EDITOR_TAG);
  }
}
class HomeiiMusicMobileCard extends HomeiiMusicFlowBaseCard {
  static async getConfigElement() {
    return document.createElement(HOMEII_MOBILE_EDITOR_TAG);
  }
}
class HomeiiMusicFlowEditor extends HomeiiMusicFlowBaseEditor {}
class HomeiiMusicMobileEditor extends HomeiiMusicFlowBaseEditor {}

if (!customElements.get("homeii-music-flow")) {
  customElements.define("homeii-music-flow", HomeiiMusicFlowCard);
}

if (!customElements.get("homeii-music-mobile")) {
  customElements.define("homeii-music-mobile", HomeiiMusicMobileCard);
}

if (!customElements.get(HOMEII_MOBILE_EDITOR_TAG)) {
  customElements.define(HOMEII_MOBILE_EDITOR_TAG, HomeiiMusicFlowBaseEditor);
}

if (!customElements.get("homeii-music-flow-editor")) {
  customElements.define("homeii-music-flow-editor", HomeiiMusicFlowEditor);
}

if (!customElements.get("homeii-music-mobile-editor")) {
  customElements.define("homeii-music-mobile-editor", HomeiiMusicMobileEditor);
}

function registerHomeiiDashboardCard() {
  const customCardsRegistry = Array.isArray(window.customCards) ? window.customCards : (window.customCards = []);
  for (let index = customCardsRegistry.length - 1; index >= 0; index -= 1) {
    const card = customCardsRegistry[index];
    if (card?.type === "custom:homeii-music-flow" || card?.type === "homeii-music-flow") {
      customCardsRegistry.splice(index, 1);
    }
  }
  customCardsRegistry.push({
    type: "homeii-music-flow",
    name: "HOMEii Flow",
    description: `Premium Music Assistant dashboard card v${HOMEII_CARD_VERSION}`,
    preview: false,
    documentationURL: "https://github.com/r11a/homeii-music-flow",
  });
}

registerHomeiiDashboardCard();
if (typeof queueMicrotask === "function") queueMicrotask(registerHomeiiDashboardCard);
setTimeout(registerHomeiiDashboardCard, 500);
