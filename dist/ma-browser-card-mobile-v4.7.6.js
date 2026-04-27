﻿﻿class MABrowserCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    this._hass = null;
    this._config = {};
    this._built = false;
    this._resolvedConfigEntryId = "";

    this._state = {
      view: "home",
      query: "",
      nowPlayingQuery: "",
      selectedPlayer: null,
      players: [],
      wsReady: false,
      queueVisible: false,
      queueItems: [],
      maQueueState: null,
      lang: "auto",
      pendingGroupSelections: [],
      nowPlayingUri: "",
      renderToken: 0,
      playerModalOpen: false,
      hasAutoSelectedPlayer: false,
      cardTheme: "auto",
      modalMode: "players",
      sidePanelToken: 0,
      immersiveNowPlayingOpen: false,
      lyricsOpen: false,
      lyricsLines: [],
      lyricsActiveIndex: -1,
      tracksLayout: "list",
      queueActionPending: false,
      emptyQuickShelfItems: [],
      emptyQuickShelfMode: "default",
      forceRadioHero: false,
      likedSelectionMode: false,
      likedSelectedUris: [],
      controlRoomOpen: false,
      controlRoomSelectedPlayers: [],
      controlRoomLibraryQuery: "",
      controlRoomLibraryResults: [],
      controlRoomLibraryLoading: false,
      controlRoomTransferSource: "",
      controlRoomTransferTarget: "",
      controlRoomPanel: "",
      controlRoomVisiblePlayers: [],
      controlRoomRenderedHtml: "",
    };

    this._pollTimer = null;
    this._progressTimer = null;
    this._searchTimer = null;
    this._nowPlayingSearchTimer = null;
    this._volumeTimer = null;
    this._bigVolumeTimer = null;
    this._controlRoomVolumeTimer = null;
    this._seekTimer = null;
    this._resizeTimer = null;

    this._ws = null;
    this._wsPending = new Map();
    this._wsMsgId = 100;

    this._imgObserver = null;
    this._imgObserverRoot = null;
    this._ctxMenu = null;
    this._ctxMenuOpenedAt = 0;
    this._lastVolumeByPlayer = new Map();
    this._softMutedPlayers = new Set();

    this._cache = {
      library: new Map(),
      lyrics: new Map(),
    };

    this._boundDocClick = this._handleDocumentClick.bind(this);
    this._boundContentClick = this._handleContentClick.bind(this);
    this._boundContentContext = this._handleContentContext.bind(this);
    this._boundQueuePanelClick = this._handleQueuePanelClick.bind(this);
    this._boundWindowResize = this._handleWindowResize.bind(this);
    this._imageBlobCache = new Map();
    this._imageFailed = new Set();
    this._resizeListening = false;
    this._lastViewportWidth = typeof window !== "undefined" ? window.innerWidth : 0;
    this._lastViewportHeight = typeof window !== "undefined" ? window.innerHeight : 0;
  }

  setConfig(config) {
    this._config = {
      height: 760,
      rtl: true,
      language: "auto",
      cache_ttl: 300000,
      show_ma_button: true,
      ma_interface_url: "/music-assistant",
      ma_interface_target: "_self",
      theme_mode: "auto",
      show_theme_toggle: true,
      main_opacity: 0.66,
      popup_opacity: 0.92,
      ...config,
    };

    try {
      this._state.lang = localStorage.getItem("ma_browser_card_lang") || this._config.language || "auto";
    } catch (_) {
      this._state.lang = this._config.language || "auto";
    }

    try {
      this._state.cardTheme = localStorage.getItem("ma_browser_card_theme") || this._config.theme_mode || "auto";
    } catch (_) {
      this._state.cardTheme = this._config.theme_mode || "auto";
    }
    try {
      this._state.tracksLayout = localStorage.getItem("ma_browser_card_tracks_layout") || "list";
    } catch (_) {
      this._state.tracksLayout = "list";
    }

    this._maUrl = String(this._config.ma_url || "").trim().replace(/\/$/, "");
    this._maToken = this._config.ma_token || "";
    this._resolvedConfigEntryId = String(this._config.config_entry_id || "").trim();
  }

  set hass(hass) {
    this._hass = hass;

    if (!this._built) {
      this._built = true;
      this._build();
      this._init();
      return;
    }

    this._loadPlayers();
    this._renderPlayerSummary();
    this._syncBrandPlayingState();
    this._syncNowPlayingUI();
  }

  getCardSize() {
    return 7;
  }

  static getStubConfig() {
    return {
      type: "custom:ma-browser-card",
      config_entry_id: "",
      ma_url: "",
      ma_token: "",
      height: 760,
      rtl: true,
      language: "auto",
      show_ma_button: true,
      ma_interface_url: "/music-assistant",
      ma_interface_target: "_self",
      theme_mode: "auto",
      show_theme_toggle: true,
      main_opacity: 0.66,
      popup_opacity: 0.92,
    };
  }

  static _legacyGetConfigElementDisabled() {
    ensureHaEditorComponents();
    return undefined;
  }

  static getConfigForm() {
    return getBaseCardConfigForm();
  }

  static assertConfig(config) {
    if (!config || typeof config !== "object" || Array.isArray(config)) {
      throw new Error("Card config must be an object");
    }
  }

  _isHebrew() {
    if (this._state.lang === "he") return true;
    if (this._state.lang === "en") return false;
    return !!this._config.rtl;
  }

  _effectiveTheme() {
    if (this._state.cardTheme === "dark") return "dark";
    if (this._state.cardTheme === "light") return "light";
    return this._hass?.themes?.darkMode ? "dark" : "light";
  }

  _hasDirectMAConnection() {
    return !!this._maUrl;
  }

  _hasRealtimeDirectMA() {
    return !!(this._maUrl && this._maToken);
  }

  _mediaRefsEquivalent(uriA = "", uriB = "", fallbackType = "track") {
    const left = String(uriA || "").trim();
    const right = String(uriB || "").trim();
    if (!left || !right) return false;
    if (left === right) return true;
    const leftRef = this._parseMediaReference(left, fallbackType);
    const rightRef = this._parseMediaReference(right, fallbackType);
    return !!(
      leftRef.provider
      && rightRef.provider
      && leftRef.provider === rightRef.provider
      && leftRef.media_type === rightRef.media_type
      && leftRef.item_id
      && leftRef.item_id === rightRef.item_id
    );
  }

  _t(text) {
    if (!this._isHebrew()) return text;
    const map = {
      Home: "בית",
      "Now Playing": "מתנגן עכשיו",
      Radio: "רדיו",
      Podcasts: "פודקאסטים",
      Albums: "אלבומים",
      Artists: "אמנים",
      Tracks: "שירים",
      Playlists: "פלייליסטים",
      "Nothing playing": "לא מתנגן",
      "Open queue": "פתח תור",
      Shuffle: "ערבוב",
      Previous: "הקודם",
      "Play / Pause": "נגן / השהה",
      Next: "הבא",
      Repeat: "חזרה",
      Seek: "קפיצה",
      "Playing on": "מתנגן על",
      "Loading players...": "טוען נגנים...",
      Mute: "השתק",
      "Search everything...": "חפש בכל מקום...",
      Clear: "נקה",
      Connecting: "מתחבר",
      Connected: "מחובר",
      "Connecting...": "מתחבר...",
      "Loading...": "טוען...",
      "No content found": "לא נמצא תוכן",
      "Favorite Radio": "תחנות מועדפות",
      "Recently Added": "נוספו לאחרונה",
      Discover: "גלה",
      "All Albums": "כל האלבומים",
      "All Artists": "כל האמנים",
      "All Tracks": "כל השירים",
      "All Podcasts": "כל הפודקאסטים",
      "Radio Stations": "תחנות רדיו",
      Queue: "תור ניגון",
      "Play all": "נגן הכל",
      "Shuffle all": "ערבב הכל",
      Search: "חיפוש",
      "No results": "אין תוצאות",
      "Loading library...": "טוען ספרייה...",
      "Loading queue...": "טוען תור...",
      "Queue is empty": "התור ריק",
      "Playback started": "הניגון התחיל",
      "Select a player first": "בחר נגן קודם",
      "Try again": "נסה שוב",
      "Recently Played": "נוגן לאחרונה",
      "Play now": "נגן עכשיו",
      "Shuffle play": "נגן בערבוב",
      "Play next": "נגן הבא",
      "Add to queue": "הוסף לתור",
      "No players found": "לא נמצאו נגנים",
      "Fallback mode": "מצב בסיסי",
      "Up Next": "הבא בתור",
      "No active media": "אין מדיה פעילה",
      Unknown: "לא ידוע",
      items: "פריטים",
      "Open full queue": "פתח תור מלא",
      "Search in queue": "חיפוש בעמודת התור",
      "Search queue and library...": "חפש בתור ובספרייה...",
      "Clear search": "נקה חיפוש",
      "Queue results": "תוצאות בעמודת התור",
      "Back to queue": "חזרה לתור",
      "Group Speakers": "חיבור רמקולים",
      "Apply Group": "חבר קבוצה",
      Ungroup: "נתק קבוצה",
      "No extra MA players": "אין נגני MA נוספים",
      "Group updated": "הקבוצה עודכנה",
      "Group cleared": "הקבוצה פורקה",
      Language: "שפה",
      Back: "חזרה",
      "Open Music Assistant": "פתח Music Assistant",
      "Open Music Assistant?": "מעבר ל-Music Assistant",
      "Open the full Music Assistant interface?": "האם לפתוח את הממשק המלא של Music Assistant?",
      Continue: "מעבר",
      Cancel: "ביטול",
      "Selected Player": "נגן נבחר",
      Idle: "פנוי",
      Playing: "מנגן",
      Paused: "מושהה",
      "Choose Player": "בחר נגן",
      "This Device": "המכשיר הזה",
      "Browser Players": "נגני דפדפן",
      "Connect This Device": "חבר את המכשיר הזה",
      "Open Music Assistant on this device to activate the browser player": "פתח את Music Assistant במכשיר הזה כדי להפעיל את נגן הדפדפן",
      "Waiting for this device player...": "ממתין לנגן של המכשיר הזה...",
      "Remember as this device": "שייך למכשיר הזה",
      "This device player connected": "נגן המכשיר חובר",
      "Other players": "נגנים נוספים",
      Theme: "ערכת תצוגה",
      "Transfer Queue": "העבר תור",
      "Move to next": "העבר לבא בתור",
      Remove: "הסר",
      Up: "למעלה",
      Down: "למטה",
      "Choose target player": "בחר נגן יעד",
      "Queue transferred": "התור הועבר",
      "Queue action failed": "פעולה על התור נכשלה",
      "Music Assistant config entry was not found": "לא נמצא Config Entry של Music Assistant",
      "Reorder queue": "סידור תור",
      Dark: "כהה",
      Light: "בהיר",
      "No target players available": "אין נגנים זמינים להעברה",
      "No queue item to rebuild": "לא נמצא פריט פעיל לתור",
      "Layout adapted to height": "הפריסה הותאמה לגובה",
      "Open Player Picker": "בחר נגן",
      Lyrics: "מילים",
      "Track Lyrics": "מילות השיר",
      "Loading lyrics...": "טוען מילים...",
      "No lyrics found": "לא נמצאו מילים לשיר הזה",
      "Lyrics unavailable right now": "המילים לא זמינות כרגע",
      Like: "לייק",
      Grid: "גריד",
      List: "רשימה",
      Settings: "הגדרות",
      Library: "ספריה",
      Players: "נגנים",
      "Active Players": "נגנים פעילים",
      "Stop all players": "עצור את כל הנגנים",
      Today: "היום",
      Week: "השבוע",
      Enabled: "פעיל",
      Disabled: "כבוי",
      "Sort ascending": "סדר עולה",
      "Sort descending": "סדר יורד",
      Newest: "הכי חדש",
      Oldest: "הכי ישן",
      "Volume presets": "בחירת ווליום",
      "Set volume": "קבע ווליום",
    };
    return map[text] || text;
  }

  _iconSvg(name) {
    const icons = {
      play: `<svg class="ui-ic" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M8 5.5v13l10-6.5z"/></svg>`,
      pause: `<svg class="ui-ic" viewBox="0 0 24 24" aria-hidden="true"><rect x="6.5" y="5" width="4" height="14" rx="1.2" fill="currentColor"></rect><rect x="13.5" y="5" width="4" height="14" rx="1.2" fill="currentColor"></rect></svg>`,
      previous: `<svg class="ui-ic" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 6h2v12H7zM18 6.5v11L10.5 12z"/></svg>`,
      next: `<svg class="ui-ic" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M15 6h2v12h-2zM6 6.5v11L13.5 12z"/></svg>`,
      shuffle: `<svg class="ui-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M16 5h3v3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path><path d="M4 7h5l7 10h3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path><path d="M16 19h3v-3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path><path d="M4 17h5l2-3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path><path d="M13 10l3-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>`,
      repeat: `<svg class="ui-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7h10l-2-2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path><path d="M17 17H7l2 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path><path d="M17 7l2 2-2 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path><path d="M7 17l-2-2 2-2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>`,
      repeat_one: `<svg class="ui-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7h10l-2-2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path><path d="M17 17H7l2 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path><path d="M17 7l2 2-2 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path><path d="M7 17l-2-2 2-2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path><path fill="currentColor" d="M11.2 9.8h1.5v4.9h-1.5z"></path><path fill="currentColor" d="M10.4 10.7l1.8-1.3v1.7z"></path></svg>`,
      speaker: `<svg class="ui-ic" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M14 4.5 9.5 8H6.8A1.8 1.8 0 0 0 5 9.8v4.4A1.8 1.8 0 0 0 6.8 16h2.7l4.5 3.5c.6.4 1.4 0 1.4-.8V5.3c0-.8-.8-1.2-1.4-.8Z"></path><path d="M17.5 9.2a4 4 0 0 1 0 5.6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path><path d="M19.6 6.8a7 7 0 0 1 0 10.4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>`,
      volume_mute: `<svg class="ui-ic" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M14 4.5 9.5 8H6.8A1.8 1.8 0 0 0 5 9.8v4.4A1.8 1.8 0 0 0 6.8 16h2.7l4.5 3.5c.6.4 1.4 0 1.4-.8V5.3c0-.8-.8-1.2-1.4-.8Z"></path><path d="m18 9 4 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path><path d="m22 9-4 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>`,
      volume_low: `<svg class="ui-ic" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M14 4.5 9.5 8H6.8A1.8 1.8 0 0 0 5 9.8v4.4A1.8 1.8 0 0 0 6.8 16h2.7l4.5 3.5c.6.4 1.4 0 1.4-.8V5.3c0-.8-.8-1.2-1.4-.8Z"></path><path d="M18 10.2a2.6 2.6 0 0 1 0 3.6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>`,
      volume_high: `<svg class="ui-ic" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M14 4.5 9.5 8H6.8A1.8 1.8 0 0 0 5 9.8v4.4A1.8 1.8 0 0 0 6.8 16h2.7l4.5 3.5c.6.4 1.4 0 1.4-.8V5.3c0-.8-.8-1.2-1.4-.8Z"></path><path d="M17.5 9.2a4 4 0 0 1 0 5.6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path><path d="M19.6 6.8a7 7 0 0 1 0 10.4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>`,
      library_music: `<svg class="ui-ic" viewBox="0 0 24 24" aria-hidden="true"><rect x="4.5" y="5" width="9" height="14" rx="2.2" fill="none" stroke="currentColor" stroke-width="2"></rect><path d="M15.5 8.5v7.2a2.3 2.3 0 1 0 1.5 2.15V10l3-1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path><path d="M7.5 9h3.5M7.5 12h3.5M7.5 15h2.2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>`,
      media: `<svg class="ui-ic" viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="7" height="7" rx="2" fill="none" stroke="currentColor" stroke-width="2"></rect><rect x="13" y="4" width="7" height="7" rx="2" fill="none" stroke="currentColor" stroke-width="2"></rect><rect x="4" y="13" width="7" height="7" rx="2" fill="none" stroke="currentColor" stroke-width="2"></rect><rect x="13" y="13" width="7" height="7" rx="2" fill="none" stroke="currentColor" stroke-width="2"></rect></svg>`,
      menu: `<svg class="ui-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 7h12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path><path d="M6 12h12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path><path d="M6 17h12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>`,
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
      more: `<svg class="ui-ic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="6.5" cy="12" r="1.6" fill="currentColor"></circle><circle cx="12" cy="12" r="1.6" fill="currentColor"></circle><circle cx="17.5" cy="12" r="1.6" fill="currentColor"></circle></svg>`,
      mic: `<svg class="ui-ic" viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="4" width="6" height="10" rx="3" fill="none" stroke="currentColor" stroke-width="2"></rect><path d="M6 11.5a6 6 0 0 0 12 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path><path d="M12 17.5V21" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path><path d="M9 21h6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>`,
      announcement: `<svg class="ui-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 10v4a2 2 0 0 0 2 2h2l5 3V5L9 8H7a2 2 0 0 0-2 2Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"></path><path d="M17 9.5a3.5 3.5 0 0 1 0 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path><path d="M19.5 7a7 7 0 0 1 0 10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>`,
      stop: `<svg class="ui-ic" viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="7" width="10" height="10" rx="1.8" fill="currentColor"></rect></svg>`,
      up: `<svg class="ui-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 18V7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path><path d="m7.5 11.5 4.5-4.5 4.5 4.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>`,
      down: `<svg class="ui-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 6v11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path><path d="m7.5 12.5 4.5 4.5 4.5-4.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>`,
      trash: `<svg class="ui-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path><path d="M9 7V5.8A1.8 1.8 0 0 1 10.8 4h2.4A1.8 1.8 0 0 1 15 5.8V7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path><path d="M8 7.5v9.2A2.3 2.3 0 0 0 10.3 19h3.4A2.3 2.3 0 0 0 16 16.7V7.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path><path d="M10.5 10.5v5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path><path d="M13.5 10.5v5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>`,
      check: `<svg class="ui-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 12.5 4 4L18 8.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"></path></svg>`,
      close: `<svg class="ui-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="m7 7 10 10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path><path d="m17 7-10 10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>`,
    };
    return icons[name] || "";
  }

  _setButtonIcon(el, name) {
    if (!el) return;
    el.innerHTML = this._iconSvg(name);
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
    this._imageFailed.clear();
    this._imageBlobCache.clear();
    const rtl = this._isHebrew();
    const theme = this._effectiveTheme();
    const configuredHeight = Math.max(420, Number(this._config.height || 760));
    const viewportHeight = typeof window !== "undefined" ? window.innerHeight || configuredHeight : configuredHeight;
    const effectiveHeight = Math.max(360, Math.min(configuredHeight, viewportHeight - 24));
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
          margin:0 !important;
          padding:0 !important;
          background:transparent !important;
          border:none !important;
          box-shadow:none !important;
          overflow:visible !important;
          --ma-accent: var(--accent-color, #e0a11b);
          --ma-radius-xl: 22px;
          --ma-card-height: ${configuredHeight}px;
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
          overflow:visible !important;
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
          width:56%;
          height:56%;
          display:block;
          flex-shrink:0;
          pointer-events:none;
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
        .progress,.now-progress { height:8px; border-radius:999px; background:var(--ma-soft-2); overflow:hidden; cursor:pointer; }
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
          flex:0 0 clamp(220px, 24vw, 340px);
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
          width:min(100%, 980px);
          display:grid;
          place-items:center;
        }
        .immersive-art {
          width:min(100%, min(54vh, 920px));
          max-height:46vh;
          aspect-ratio:16/9;
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
          object-fit:cover;
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
          width:min(100%, 1180px);
          margin:0 auto;
          height:14px;
          border-radius:999px;
          background:rgba(255,255,255,0.16);
          overflow:hidden;
          cursor:pointer;
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
            width:min(100%, min(50vh, 860px));
            max-height:46vh;
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
            width:min(100%, min(42vh, 720px));
            max-height:38vh;
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
            width:min(100%, calc(100vw - 16px));
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
      .mobile-volume-inline .volume-btn .ui-ic{width:22px;height:22px;}
.card:not(.layout-tablet) .mobile-volume-inline{grid-template-columns:auto minmax(0,1fr) auto;gap:10px;align-items:center;}
.card:not(.layout-tablet) .mobile-volume-inline .volume-value{order:1;min-width:46px;text-align:center;}
.card:not(.layout-tablet) .mobile-volume-inline .tablet-volume-track{order:2;}
.card:not(.layout-tablet) .mobile-volume-inline .volume-btn{order:3;width:42px;height:42px;border-radius:999px;}
.card:not(.layout-tablet) .mobile-volume-inline .volume-btn.active{background:rgba(170,38,38,.28)!important;border-color:rgba(255,98,98,.36)!important;color:#fff!important;box-shadow:0 10px 24px rgba(120,22,22,.22)!important;}
.card:not(.layout-tablet) .queue-action-item{min-height:58px;margin-bottom:10px;}
.mobile-art-actions{left:50%!important;right:auto!important;transform:translateX(-50%)!important;inset-inline:auto!important;inset-block-end:16px!important;display:flex!important;align-items:center!important;justify-content:center!important;gap:10px!important;padding:0!important;border-radius:0!important;background:transparent!important;border:none!important;box-shadow:none!important;backdrop-filter:none!important;}
.card.layout-tablet .mobile-art-actions{left:50%!important;right:auto!important;transform:translateX(-50%)!important;inset-inline:auto!important;inset-block-end:18px!important;}
.theme-light .mobile-art-actions{background:transparent!important;border-color:transparent!important;box-shadow:none!important;}
.mobile-art-fab{width:46px;min-width:46px;height:46px;border-radius:999px;}
@media (max-width: 600px){.mobile-art-actions{left:50%!important;right:auto!important;transform:translateX(-50%)!important;inset-inline:auto!important;inset-block-end:12px!important;gap:8px!important;}.mobile-art-fab{width:42px;min-width:42px;height:42px;}}
.card.layout-tablet .menu-backdrop{justify-content:center!important;align-items:stretch!important;padding:18px 24px!important;}
.card.layout-tablet .menu-sheet{width:min(calc(100% - 96px), 920px)!important;max-width:min(calc(100% - 96px), 920px)!important;max-height:calc(100% - 26px)!important;height:calc(100% - 26px)!important;margin-inline:auto!important;}
.card.layout-tablet .menu-sheet.sheet-library,.card.layout-tablet .menu-sheet.sheet-search{width:min(calc(100% - 96px), 1120px)!important;max-width:min(calc(100% - 96px), 1120px)!important;}
.card.layout-tablet .menu-sheet.sheet-queue{width:min(calc(100% - 160px), 980px)!important;max-width:min(calc(100% - 160px), 980px)!important;}
.card.layout-tablet .menu-sheet.sheet-actions,.card.layout-tablet .menu-sheet.sheet-players,.card.layout-tablet .menu-sheet.sheet-groupplayers,.card.layout-tablet .menu-sheet.sheet-settings{width:min(calc(100% - 180px), 860px)!important;max-width:min(calc(100% - 180px), 860px)!important;}
.card.layout-tablet .queue-list{max-width:920px;margin-inline:auto;}
.card.layout-tablet .queue-row{min-height:88px!important;}
.card.layout-tablet .active-player-chip .bars,.card.layout-tablet .active-player-card .bars{display:none!important;}

</style>

      <div class="card ${rtl ? "rtl" : ""} theme-${visualTheme}${theme === "custom" ? " theme-custom" : ""}" style="--v2-custom-text:${this._state.mobileCustomTextTone === "dark" ? "#1f2633" : "#ffffff"};">
        <aside class="sidebar">
          <div class="brand">
            <button class="brand-icon" id="brandPlayersBtn" title="${this._t("Open Music Assistant")}">▶</button>
            <div>
      <div class="brand-title">homeii-music-flow</div>
              <div class="brand-sub">Music Assistant</div>
            </div>
          </div>

          <nav class="nav">
            <button class="nav-btn active" data-view="home"><span class="nav-ico">⌂</span><span>${this._t("Home")}</span></button>
            <button class="nav-btn" data-view="now_playing"><span class="nav-ico">▶</span><span>${this._t("Now Playing")}</span></button>
            <button class="nav-btn" data-view="radio"><span class="nav-ico">📻</span><span>${this._t("Radio")}</span></button>
            <button class="nav-btn" data-view="podcasts"><span class="nav-ico">🎙</span><span>${this._t("Podcasts")}</span></button>
            <button class="nav-btn" data-view="albums"><span class="nav-ico">◉</span><span>${this._t("Albums")}</span></button>
            <button class="nav-btn" data-view="artists"><span class="nav-ico">♪</span><span>${this._t("Artists")}</span></button>
            <button class="nav-btn" data-view="tracks"><span class="nav-ico">♫</span><span>${this._t("Tracks")}</span></button>
            <button class="nav-btn" data-view="playlists"><span class="nav-ico">☰</span><span>${this._t("Playlists")}</span></button>
          </nav>

          <div class="player-panel">
            <div class="np-row" id="npRow" title="${this._t("Now Playing")}">
              <div class="np-art" id="npArt">♪</div>
              <div class="np-meta">
                <div class="np-title" id="npTitle">${this._t("Nothing playing")}</div>
                <div class="np-sub" id="npSub">—</div>
              </div>
            </div>

            <div class="controls">
              <button class="icon-btn" id="btnPrev" title="${this._t("Previous")}">${this._iconSvg("previous")}</button>
              <button class="play-btn" id="btnPlay" title="${this._t("Play / Pause")}">${this._iconSvg("play")}</button>
              <button class="icon-btn" id="btnNext" title="${this._t("Next")}">${this._iconSvg("next")}</button>
            </div>

            <div class="volume-row">
              <button class="icon-btn" id="btnMute" title="${this._t("Mute")}">${this._iconSvg("volume_high")}</button>
              <input class="volume-range" id="volSlider" type="range" min="0" max="100" value="50" style="--vol-pct:50%">
            </div>

            <select class="player-select" id="playerSel" aria-hidden="true" tabindex="-1">
              <option value="">${this._t("Loading players...")}</option>
            </select>
          </div>
        </aside>

        <section class="main">
          <div class="topbar">
            <div class="topbar-row">
              <div class="search" id="searchWrap">
                <span>🔍</span>
                <input id="searchInp" type="text" placeholder="${this._t("Search everything...")}">
                <button class="icon-btn" id="searchClear" style="display:none;" title="${this._t("Clear")}">✕</button>
              </div>

              <div class="selected-player-box" id="selectedPlayerBox">
                <div class="chip-dot"></div>
                <div class="selected-player-meta">
                  <div class="selected-player-title" id="selectedPlayerTitle">${this._t("Selected Player")}</div>
                  <div class="selected-player-sub" id="selectedPlayerSub">—</div>
                </div>
              </div>

              <div class="topbar-actions">
                <button class="chip-btn" id="choosePlayerBtn">${this._t("Choose Player")}</button>
                <button class="theme-btn" id="themeToggleBtn" style="display:${this._config.show_theme_toggle ? "" : "none"};">${theme === "dark" ? "☀" : "🌙"}</button>
                <button class="chip-btn" id="maOpenBtn" style="display:none;">MA</button>
                <button class="lang-btn" id="langBtn" title="${this._t("Language")}">${rtl ? "EN" : "עב"}</button>
                <div class="status-pill offline" id="statusPill"><span class="status-dot"></span><span id="statusText">${this._t("Connecting")}</span></div>
              </div>
            </div>
          </div>

          <div class="content" id="content">
            <div class="state-box"><div><div class="spinner"></div><div>${this._t("Connecting...")}</div></div></div>
          </div>

          <div class="modal-backdrop" id="groupModal">
            <div class="modal">
              <div class="modal-header">
                <div class="modal-header-icon">🔗</div>
                <div class="modal-header-meta">
                  <div class="modal-title">${this._t("Group Speakers")}</div>
                  <div class="modal-subtitle" id="groupModalSubtitle">${this._t("Choose target player")}</div>
                </div>
                <button class="close-btn" id="groupModalClose">✕</button>
              </div>
              <div class="modal-body">
                <div class="modal-section">
                  <div class="modal-section-top">
                    <div class="modal-section-title">${this._t("Group Speakers")}</div>
                    <div class="modal-section-badge" id="groupCountBadge">0</div>
                  </div>
                  <div class="group-list" id="groupList"></div>
                </div>
                <div class="group-actions">
                  <button class="chip-btn" id="applyGroupBtn">${this._t("Apply Group")}</button>
                  <button class="chip-btn warn" id="unGroupBtn">${this._t("Ungroup")}</button>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-backdrop" id="playerModal">
            <div class="modal">
              <div class="modal-header">
                <div class="modal-header-icon" id="playerModalIcon">🎵</div>
                <div class="modal-header-meta">
                  <div class="modal-title" id="playerModalTitle">${this._t("Choose Player")}</div>
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
    if (!this._resizeListening) {
      window.addEventListener("resize", this._boundWindowResize);
      this._resizeListening = true;
    }
    this.$("playerSel")?.addEventListener("change", (e) => this._selectPlayer(e.target.value || null, true));
    this.$("btnPlay").addEventListener("click", () => this._togglePlay());
    this.$("btnPrev").addEventListener("click", () => this._playerCmd("previous"));
    this.$("btnNext").addEventListener("click", () => this._playerCmd("next"));
    
    this.$("btnMute").addEventListener("click", () => this._toggleMute());
    this.$("npRow").addEventListener("click", () => this._toggleQueue());
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

    this.$("progressBar")?.addEventListener("click", (e) => this._seekFromProgress(e));

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
    this.$("content").addEventListener("contextmenu", this._boundContentContext);
    this.$("groupList").addEventListener("change", (e) => this._handleGroupChange(e));
    this.$("applyGroupBtn").addEventListener("click", () => this._applySpeakerGroup());
    this.$("unGroupBtn").addEventListener("click", () => this._clearSpeakerGroup());
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

  _toggleLanguage() {
    this._state.lang = this._isHebrew() ? "en" : "he";
    try { localStorage.setItem("ma_browser_card_lang", this._state.lang); } catch (_) {}

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
    clearTimeout(this._resizeTimer);

    this._built = false;
    this._state.view = currentView;
    this._state.query = currentQuery;
    this._state.nowPlayingQuery = currentNowPlayingQuery;
    this._state.queueVisible = false;
    this._state.playerModalOpen = false;
    this._state.maQueueState = null;
    this._state.queueItems = [];
    this._state.nowPlayingUri = "";
    this._state.selectedPlayer = currentPlayer;
    this._state.hasAutoSelectedPlayer = hadAutoSelected;
    this._state.cardTheme = currentTheme;
    this._state.immersiveNowPlayingOpen = false;
    this._imageFailed = new Set();
    this._imageBlobCache.clear();

    this._build();
    this._init().then(() => {
      if (currentImmersive && this._state.view === "now_playing") this._openImmersiveNowPlaying();
    });
  }

  _toggleCardTheme() {
    const effective = this._effectiveTheme();
    this._state.cardTheme = effective === "dark" ? "light" : "dark";
    try { localStorage.setItem("ma_browser_card_theme", this._state.cardTheme); } catch (_) {}
    const card = this.shadowRoot.querySelector(".card");
    if (card) {
      card.classList.remove("theme-dark", "theme-light");
      card.classList.add(`theme-${this._effectiveTheme()}`);
    }
    this._updateThemeButton();
  }

  _playerStateLabel(player) {
    if (!player) return this._t("Idle");
    if (player.state === "playing") return this._t("Playing");
    if (player.state === "paused") return this._t("Paused");
    return this._t("Idle");
  }

  _isPlayerActive(player) {
    if (!player) return false;
    const attrs = player.attributes || {};
    return player.state === "playing" || player.state === "paused" || !!attrs.media_title || !!attrs.active_queue;
  }

  _thisDeviceStorageKey() {
    return `homeii-this-device-player::${this._config?.ma_url || location.origin || "default"}`;
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

  _isLikelyBrowserPlayer(player) {
    if (!player) return false;
    const attrs = player.attributes || {};
    const haystack = [
      player.entity_id,
      attrs.friendly_name,
      attrs.mass_player_type,
      attrs.mass_player_id,
      attrs.app_id,
      attrs.provider,
      attrs.provider_name,
      attrs.source,
      attrs.model,
    ].filter(Boolean).join(" ").toLowerCase();
    return haystack.includes("sendspin")
      || haystack.includes("browser")
      || haystack.includes("web player")
      || haystack.includes("this device");
  }

  _getBrowserPlayers(players = this._state.players || []) {
    return (Array.isArray(players) ? players : []).filter((p) => this._isLikelyBrowserPlayer(p));
  }

  _getThisDevicePlayer(players = this._state.players || []) {
    const rememberedId = this._getRememberedThisDevicePlayerId();
    if (!rememberedId) return null;
    return (Array.isArray(players) ? players : []).find((p) => p.entity_id === rememberedId) || null;
  }

  _connectThisDevicePlayer() {
    this._state.awaitingThisDevicePlayer = true;
    this._state.knownBrowserPlayerIds = this._getBrowserPlayers().map((p) => p.entity_id);
    this._toast(this._t("Open Music Assistant on this device to activate the browser player"));
    this._openMusicAssistant();
  }

  _selectPlayer(entityId, manual = false) {
    const pinnedEntity = typeof this._resolvedPinnedPlayerEntity === "function" ? this._resolvedPinnedPlayerEntity() : "";
    const nextEntityId = pinnedEntity || entityId;
    if (!nextEntityId) return;
    if (manual && pinnedEntity && entityId && entityId !== pinnedEntity) {
      this._toast(this._m("Player is pinned from settings", "הנגן מקובע מתוך ההגדרות"));
    }
    this._state.selectedPlayer = nextEntityId;
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
    if (title) title.textContent = selected?.attributes?.friendly_name || this._t("Selected Player");
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
    themeBtn.title = `${this._t("Theme")}: ${this._t(effective === "dark" ? "Dark" : "Light")}`;
  }

  _syncBrandPlayingState() {
    const btn = this.$("brandPlayersBtn");
    const player = this._getSelectedPlayer();
    if (!btn) return;
    const isPlaying = player?.state === "playing";
    btn.classList.toggle("playing", !!isPlaying);
    btn.title = this._t("Open Music Assistant");
  }

  _setPlayerModalHeader(mode = "players") {
    const icon = this.$("playerModalIcon");
    const subtitle = this.$("playerModalSubtitle");
    const selected = this._getSelectedPlayer();
    if (icon) icon.textContent = mode === "transfer" ? "⇆" : "🎵";
    if (!subtitle) return;
    if (mode === "transfer") {
      subtitle.textContent = selected?.attributes?.friendly_name || this._t("Choose target player");
      return;
    }
    const count = (this._state.players || []).length;
    subtitle.textContent = `${count} ${this._t("items")}`;
  }

  _renderPlayerModal() {
    this._state.modalMode = "players";
    this.$("playerModalTitle").textContent = this._t("Choose Player");
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
              const art = p.attributes?.entity_picture_local || p.attributes?.entity_picture || "";
              return `
                <button class="player-card ${stateCls} ${selected ? "active" : ""}" data-modal-player="${this._esc(p.entity_id)}">
                  <span class="player-card-dot"></span>
                  <span class="player-card-art">${art ? `<img src="${this._esc(art)}" alt="">` : `<span class="player-card-icon">${p.state === "playing" ? "▶" : p.state === "paused" ? "⏸" : "♪"}</span>`}</span>
                  <span class="player-card-meta">
                    <span class="player-card-top">
                      <span class="player-card-title">${this._esc(name)}</span>
                      <span class="player-card-badge">${selected ? this._esc(this._t("Selected Player")) : this._esc(this._playerStateLabel(p))}</span>
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
    body.innerHTML = `<div class="player-modal-grid">${renderGroup(this._t("Playing"), activePlayers)}${renderGroup(this._t("Other players"), others)}</div>`;
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
    backdrop.onclick = null;
    backdrop.innerHTML = "";
    this._state.immersiveNowPlayingOpen = false;
  }

  _currentTrackInfo() {
    const player = this._getSelectedPlayer();
    const queueItem = this._state.maQueueState?.current_item || null;
    const media = queueItem?.media_item || {};
    const title = media?.name || player?.attributes?.media_title || "";
    const artists = Array.isArray(media?.artists) ? media.artists.map((artist) => artist?.name).filter(Boolean).join(", ") : "";
    const artist = artists || player?.attributes?.media_artist || "";
    const album = media?.album?.name || player?.attributes?.media_album_name || "";
    const duration = Number(queueItem?.duration || player?.attributes?.media_duration || 0);
    const key = [title, artist, album].map((part) => String(part || "").trim().toLowerCase()).join("|");
    return { title, artist, album, duration, key };
  }

  _saveMobileRecentHistory() {
    try {
      localStorage.setItem("ma_browser_card_mobile_recent_history", JSON.stringify((this._state.mobileRecentHistory || []).slice(0, 10)));
    } catch (_) {}
  }

  _sourceProviderMeta(value = "") {
    const raw = String(value || "").trim();
    const normalized = raw.toLowerCase();
    if (!normalized) return null;
    if (/(spotify)/.test(normalized)) return { key: "spotify", label: "Spotify" };
    if (/(tidal)/.test(normalized)) return { key: "tidal", label: "TIDAL" };
    if (/(youtube|ytmusic)/.test(normalized)) return { key: "youtube", label: "YouTube Music" };
    if (/(apple)/.test(normalized)) return { key: "apple", label: "Apple Music" };
    if (/(qobuz)/.test(normalized)) return { key: "qobuz", label: "Qobuz" };
    if (/(deezer)/.test(normalized)) return { key: "deezer", label: "Deezer" };
    if (/(filesystem|local|library|file)/.test(normalized)) return { key: "library", label: this._m("Library", "ספריה") };
    if (/(radio_browser|radiobrowser|tunein|radio)/.test(normalized)) return { key: "radio", label: this._m("Radio", "רדיו") };
    return { key: normalized.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 24) || "source", label: raw };
  }

  _qualityBadgeLabel(values = []) {
    const haystack = (Array.isArray(values) ? values : [values])
      .flatMap((value) => Array.isArray(value) ? value : [value])
      .map((value) => {
        if (typeof value !== "object" || value === null) return String(value || "");
        try {
          return JSON.stringify(value);
        } catch (_) {
          return String(value || "");
        }
      })
      .join(" | ")
      .toLowerCase();
    if (!haystack) return "";
    if (/(hi[\s-]?res|24[\s-]?bit|88\.2|96[\s-]?khz|96000|176\.4|192[\s-]?khz|192000)/.test(haystack)) return "Hi-Res";
    if (/(lossless|flac|alac|wav|aiff|pcm)/.test(haystack)) return "Lossless";
    return "";
  }

  _currentSourceBadgeMeta(player = this._getSelectedPlayer(), queueItem = this._state.maQueueState?.current_item || null) {
    const currentQueueItem = queueItem || this._state.maQueueState?.current_item || null;
    const media = currentQueueItem?.media_item || currentQueueItem || {};
    const parsed = this._parseMediaReference(
      media?.uri || currentQueueItem?.uri || currentQueueItem?.media_content_id || player?.attributes?.media_content_id || "",
      media?.media_type || currentQueueItem?.media_type || player?.attributes?.media_content_type || "track"
    );
    const mappings = []
      .concat(Array.isArray(media?.provider_mappings) ? media.provider_mappings : [])
      .concat(Array.isArray(currentQueueItem?.provider_mappings) ? currentQueueItem.provider_mappings : []);
    const providerCandidates = [
      media?.provider,
      media?.provider_name,
      media?.provider_domain,
      media?.provider_instance,
      currentQueueItem?.provider,
      currentQueueItem?.provider_name,
      currentQueueItem?.provider_domain,
      currentQueueItem?.provider_instance,
      player?.attributes?.provider,
      player?.attributes?.provider_name,
      parsed.provider,
      ...mappings.flatMap((mapping) => [mapping?.provider, mapping?.provider_domain, mapping?.provider_instance, mapping?.provider_name]),
    ].filter(Boolean);
    const providerMeta = providerCandidates.map((value) => this._sourceProviderMeta(value)).find(Boolean) || null;
    const qualityLabel = this._qualityBadgeLabel([
      media?.audio_format,
      media?.quality,
      media?.streamdetails,
      media?.metadata,
      currentQueueItem?.audio_format,
      currentQueueItem?.quality,
      currentQueueItem?.streamdetails,
      currentQueueItem?.metadata,
      player?.attributes?.media_codec,
      player?.attributes?.media_format,
      ...mappings.map((mapping) => mapping?.details),
      ...mappings.map((mapping) => mapping?.quality),
      ...mappings.map((mapping) => mapping?.audio_format),
    ]);
    return {
      providerKey: providerMeta?.key || "",
      providerLabel: providerMeta?.label || "",
      qualityLabel,
    };
  }

  _currentHistorySnapshot(player = this._getSelectedPlayer(), queueItem = this._state.maQueueState?.current_item || null) {
    const currentQueueItem = queueItem || this._state.maQueueState?.current_item || null;
    const media = currentQueueItem?.media_item || currentQueueItem || {};
    const title = media?.name || currentQueueItem?.name || player?.attributes?.media_title || "";
    const artist = Array.isArray(media?.artists)
      ? media.artists.map((entry) => entry?.name).filter(Boolean).join(", ")
      : (media?.artist_str || player?.attributes?.media_artist || "");
    const album = media?.album?.name || currentQueueItem?.album || player?.attributes?.media_album_name || "";
    const uri = String(this._getQueueItemUri(currentQueueItem) || media?.uri || player?.attributes?.media_content_id || "").trim();
    const mediaType = String(media?.media_type || currentQueueItem?.media_type || player?.attributes?.media_content_type || "track").toLowerCase();
    const key = [title, artist, album].map((part) => String(part || "").trim().toLowerCase()).join("|");
    if (!key || !uri || mediaType === "radio") return null;
    const sourceMeta = this._currentSourceBadgeMeta(player, currentQueueItem);
    return {
      key,
      uri,
      media_type: mediaType || "track",
      title,
      artist,
      album,
      image: this._queueItemImageUrl(currentQueueItem, 180) || this._artUrl(media) || this._artUrl(currentQueueItem) || "",
      provider_label: sourceMeta.providerLabel || "",
      quality_label: sourceMeta.qualityLabel || "",
    };
  }

  _rememberRecentPlayback(player = this._getSelectedPlayer(), queueItem = this._state.maQueueState?.current_item || null) {
    const snapshot = this._currentHistorySnapshot(player, queueItem);
    if (!snapshot) return;
    const previous = this._state.mobileCurrentHistoryEntry || null;
    if (previous?.key === snapshot.key && previous?.uri === snapshot.uri) {
      this._state.mobileCurrentHistoryEntry = snapshot;
      return;
    }
    if (previous?.uri && previous?.key && previous.key !== snapshot.key) {
      const next = [previous, ...((this._state.mobileRecentHistory || []).filter((entry) => entry?.uri && entry.uri !== previous.uri && entry.key !== snapshot.key))];
      this._state.mobileRecentHistory = next.slice(0, 10);
      this._saveMobileRecentHistory();
    }
    this._state.mobileCurrentHistoryEntry = snapshot;
  }

  _visibleRecentHistoryItems() {
    const currentKey = this._state.mobileCurrentHistoryEntry?.key || "";
    return (Array.isArray(this._state.mobileRecentHistory) ? this._state.mobileRecentHistory : [])
      .filter((entry) => entry?.uri && entry?.key && entry.key !== currentKey)
      .slice(0, 5);
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
    this._setHistoryDrawerOpen(next);
  }

  _syncRecentHistoryUi() {
    const host = this.$("historyDrawerBody");
    const drawer = this.$("historyDrawer");
    const button = this.$("historyToggleFab");
    if (!host) return;
    if (!this._getSelectedPlayer()) {
      host.innerHTML = "";
      drawer?.setAttribute("hidden", "");
      button?.setAttribute("hidden", "");
      this._setHistoryDrawerOpen(false);
      return;
    }
    drawer?.removeAttribute("hidden");
    button?.removeAttribute("hidden");
    const items = this._visibleRecentHistoryItems();
    if (!items.length) {
      host.innerHTML = `<div class="history-empty">${this._esc(this._m("Play a few tracks and they will appear here.", "נגן כמה שירים והם יופיעו כאן."))}</div>`;
      return;
    }
    host.innerHTML = `
      ${items.map((item, index) => `
        <button class="history-chip" data-history-index="${this._esc(String(index))}" title="${this._esc(item.title || "")}">
          <span class="history-chip-art">${item.image ? `<img src="${this._esc(item.image)}" alt="">` : this._iconSvg("music_note")}</span>
          <span class="history-chip-copy">
            <span class="history-chip-title">${this._esc(item.title || this._m("Recent track", "שיר קודם"))}</span>
            <span class="history-chip-sub">${this._esc(item.artist || item.album || item.provider_label || "—")}</span>
          </span>
        </button>
      `).join("")}
    `;
    host.querySelectorAll("[data-history-index]").forEach((btn) => btn.addEventListener("click", async (e) => {
      const trigger = e.currentTarget;
      const index = Number(trigger.dataset.historyIndex);
      const item = this._visibleRecentHistoryItems()[index];
      if (!item?.uri) return;
      this._pressUiButton(trigger);
      await this._playMedia(item.uri, item.media_type || "track", "play", {
        label: item.title || "",
        sourceEl: trigger,
      });
      this._setHistoryDrawerOpen(false);
    }));
  }

  _controlRoomEnabled() {
    return this._layoutModeConfig() === "tablet" && !this._isCompactTileMode();
  }

  _controlRoomAllPlayers() {
    this._loadPlayers();
    const players = Array.isArray(this._state.players) ? this._state.players : [];
    const visible = players.filter((player) => !this._isLikelyBrowserPlayer(player));
    return visible.length ? visible : players;
  }

  _controlRoomVisiblePlayerIds() {
    const players = this._controlRoomAllPlayers();
    const validIds = new Set(players.map((player) => player.entity_id));
    let visibleIds = (Array.isArray(this._state.controlRoomVisiblePlayers) ? this._state.controlRoomVisiblePlayers : [])
      .filter((entityId) => validIds.has(entityId));
    if (!visibleIds.length) visibleIds = players.map((player) => player.entity_id);
    if (!visibleIds.length && players[0]?.entity_id) visibleIds = [players[0].entity_id];
    this._state.controlRoomVisiblePlayers = visibleIds;
    return visibleIds;
  }

  _controlRoomPlayers() {
    const players = this._controlRoomAllPlayers();
    const visibleIds = new Set(this._controlRoomVisiblePlayerIds());
    const filtered = players.filter((player) => visibleIds.has(player.entity_id));
    return filtered.length ? filtered : players;
  }

  _playerByEntityId(entityId = "") {
    if (!entityId) return null;
    return (this._state.players || []).find((player) => player.entity_id === entityId) || this._hass?.states?.[entityId] || null;
  }

  _controlRoomSelectedPlayerIds() {
    const players = this._controlRoomPlayers();
    const validIds = new Set(players.map((player) => player.entity_id));
    let selected = (Array.isArray(this._state.controlRoomSelectedPlayers) ? this._state.controlRoomSelectedPlayers : [])
      .filter((entityId) => validIds.has(entityId));
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
    this._state.controlRoomSelectedPlayers = next;
    this._syncControlRoomTransferDefaults();
    this._syncControlRoomUi();
  }

  _toggleControlRoomPlayerSelection(entityId) {
    if (!entityId) return;
    const current = this._controlRoomSelectedPlayerIds();
    const next = current.includes(entityId)
      ? current.filter((id) => id !== entityId)
      : [...current, entityId];
    this._setControlRoomSelection(next);
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
      <div class="control-room-picker-list">
        ${allPlayers.map((player) => {
          const entityId = player.entity_id;
          const active = activeIds.has(entityId);
          const art = player.attributes?.entity_picture_local || player.attributes?.entity_picture || "";
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

  _openControlRoom() {
    if (!this._controlRoomEnabled()) return;
    this._state.controlRoomOpen = true;
    this._state.controlRoomPanel = "";
    this._controlRoomSelectedPlayerIds();
    this._syncControlRoomTransferDefaults();
    this.$("controlRoomBackdrop")?.classList.add("open");
    this._syncControlRoomUi();
  }

  _closeControlRoom() {
    this._state.controlRoomOpen = false;
    this._state.controlRoomPanel = "";
    this.$("controlRoomBackdrop")?.classList.remove("open");
  }

  _toggleControlRoomPanel(panel = "") {
    const next = String(panel || "");
    this._state.controlRoomPanel = this._state.controlRoomPanel === next ? "" : next;
    this._syncControlRoomUi();
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
        const artists = Array.isArray(item?.artists) ? item.artists.map((artist) => artist?.name).filter(Boolean).join(", ") : "";
        entries.push({
          uri: item?.uri || "",
          media_type: item?.media_type || mediaType,
          name: item?.name || item?.title || "",
          subtitle: artists || item?.album?.name || item?.metadata?.description || "",
          image: this._artUrl(item) || item?.image || item?.image_url || item?.media_item?.image || "",
        });
      });
    });
    return entries.filter((entry) => entry.uri).slice(0, 14);
  }

  async _searchControlRoomLibrary(query = "") {
    const normalizedQuery = String(query || "").trim();
    this._state.controlRoomLibraryQuery = normalizedQuery;
    if (!normalizedQuery) {
      this._state.controlRoomLibraryLoading = false;
      this._state.controlRoomLibraryResults = [];
      this._syncControlRoomUi();
      return;
    }
    const token = Date.now();
    this._state.controlRoomLibraryToken = token;
    this._state.controlRoomLibraryLoading = true;
    this._syncControlRoomUi();
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
    this._syncControlRoomUi();
  }

  async _startControlRoomLibraryVoice() {
    const SpeechRecognition = this._speechRecognitionCtor();
    if (!SpeechRecognition) {
      this._toastError(this._m("Voice input is not supported on this device", "הכתבה קולית לא נתמכת במכשיר הזה"));
      return;
    }
    try { this._voiceRecognition?.abort?.(); } catch (_) {}
    const recognition = new SpeechRecognition();
    this._voiceRecognition = recognition;
    recognition.lang = this._isHebrew() ? "he-IL" : "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;
    this._toast(this._m("Listening...", "מקשיב..."));
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
    recognition.onerror = () => this._toastError(this._m("Voice input failed", "הכתבה קולית נכשלה"));
    recognition.onend = () => {
      if (this._voiceRecognition === recognition) this._voiceRecognition = null;
    };
    try { recognition.start(); } catch (_) { this._toastError(this._m("Voice input failed", "הכתבה קולית נכשלה")); }
  }

  async _playControlRoomLibraryEntry(entry) {
    const selectedIds = this._controlRoomSelectedPlayerIds();
    const primaryId = selectedIds[0] || this._controlRoomPrimaryPlayerId();
    if (!entry?.uri || !primaryId) return false;
    const groupMembers = selectedIds.slice(1);
    if (groupMembers.length) {
      await this._applySpeakerGroupFor(primaryId, groupMembers);
    }
    return this._playMediaOnPlayer(primaryId, entry.uri, entry.media_type || "album", "play", {
      label: entry.name || "",
      silent: false,
    });
  }

  _controlRoomPlayerTileHtml(player) {
    const selectedIds = this._controlRoomSelectedPlayerIds();
    const primaryId = this._controlRoomPrimaryPlayerId();
    const isSelected = selectedIds.includes(player.entity_id);
    const isPrimary = primaryId === player.entity_id;
    const playing = player.state === "playing";
    const art = player.attributes?.entity_picture_local || player.attributes?.entity_picture || "";
    const name = player.attributes?.friendly_name || player.entity_id;
    const track = player.attributes?.media_title || this._m("Idle", "ממתין");
    const volume = Math.round((player.attributes?.volume_level || 0) * 100);
    const groupCount = this._playerGroupCount(player);
    const stateLabel = this._playerStateLabel(player);
    const tileStyle = art ? `style="--control-room-tile-art:url('${this._esc(art)}')"` : "";
    return `
      <article class="control-room-tile ${isSelected ? "selected" : ""} ${isPrimary ? "primary" : ""} ${playing ? "is-playing" : ""}" data-room-tile="${this._esc(player.entity_id)}" ${tileStyle}>
        <div class="control-room-tile-bg"></div>
        <div class="control-room-tile-shade"></div>
        <button class="control-room-select-fab ${isSelected ? "active" : ""}" data-room-select="${this._esc(player.entity_id)}" title="${this._esc(this._m("Select player", "בחר נגן"))}">
          ${this._iconSvg(isSelected ? "check" : "grid")}
        </button>
        <button class="control-room-tile-main" data-room-primary="${this._esc(player.entity_id)}" title="${this._esc(name)}">
          <span class="control-room-tile-copy">
            <span class="control-room-tile-pills">
              ${isPrimary ? `<span class="control-room-primary-pill">${this._esc(this._m("Primary", "ראשי"))}</span>` : ``}
              ${groupCount ? `<span class="control-room-float-pill">${this._esc(`${groupCount}`)}</span>` : ``}
              ${playing ? `<span class="control-room-float-pill live">${this._esc(this._m("Live", "חי"))}</span>` : ``}
            </span>
            <span class="control-room-tile-track">${this._esc(track)}</span>
            <span class="control-room-tile-name">${this._esc(name)}</span>
            <span class="control-room-tile-state">${this._esc(stateLabel)}</span>
          </span>
        </button>
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
    if (loading) return `<div class="control-room-empty subtle">${this._esc(this._m("Searching library...", "מחפש בספריה..."))}</div>`;
    if (!query) return `<div class="control-room-empty subtle">${this._esc(this._m("Search and tap a cover to play it on the selected players.", "חפש ולחץ על עטיפה כדי לנגן על הנגנים שנבחרו."))}</div>`;
    if (!results.length) return `<div class="control-room-empty subtle">${this._esc(this._m("No media found for this search.", "לא נמצאה מדיה לחיפוש הזה."))}</div>`;
    return `
      <div class="control-room-media-grid">
        ${results.map((entry, index) => `
          <button class="control-room-media-card" data-room-library-play="${this._esc(String(index))}">
            <span class="control-room-media-art">${entry.image ? `<img src="${this._esc(entry.image)}" alt="">` : this._iconSvg(this._controlRoomMediaTypeIcon(entry.media_type))}</span>
            <span class="control-room-media-copy">
              <span class="control-room-media-title">${this._esc(entry.name || this._m("Media", "מדיה"))}</span>
              <span class="control-room-media-sub">${this._esc(entry.subtitle || entry.media_type || "")}</span>
            </span>
          </button>
        `).join("")}
      </div>
    `;
  }

  _controlRoomPanelHtml(players = []) {
    const panel = String(this._state.controlRoomPanel || "");
    if (!panel) return ``;
    if (panel === "selection") {
      return `
        <div class="control-room-tray open compact">
          <div class="control-room-tray-head">
            <div class="control-room-tray-title">${this._esc(this._m("Connected players", "נגנים מחוברים"))}</div>
            <div class="control-room-tray-sub">${this._esc(this._m("Choose which players stay in the current control selection.", "בחר אילו נגנים יישארו בבחירה הנוכחית."))}</div>
          </div>
          ${this._controlRoomPlayerChoiceRows("selection")}
        </div>
      `;
    }
    if (panel === "visible") {
      return `
        <div class="control-room-tray open compact">
          <div class="control-room-tray-head">
            <div class="control-room-tray-title">${this._esc(this._m("Visible tiles", "אריחים מוצגים"))}</div>
            <div class="control-room-tray-sub">${this._esc(this._m("Choose which players appear as tiles in the room.", "בחר אילו נגנים יופיעו כאריחים בחדר."))}</div>
          </div>
          ${this._controlRoomPlayerChoiceRows("visible")}
        </div>
      `;
    }
    if (panel === "transfer") {
      const source = this._state.controlRoomTransferSource || "";
      const target = this._state.controlRoomTransferTarget || "";
      return `
        <div class="control-room-tray open">
          <div class="control-room-transfer-bar">
            <select id="controlRoomTransferSource">
              ${players.map((player) => `<option value="${this._esc(player.entity_id)}" ${player.entity_id === source ? "selected" : ""}>${this._esc(player.attributes?.friendly_name || player.entity_id)}</option>`).join("")}
            </select>
            <span class="control-room-transfer-arrow">${this._iconSvg("next")}</span>
            <select id="controlRoomTransferTarget">
              ${players.filter((player) => player.entity_id !== source).map((player) => `<option value="${this._esc(player.entity_id)}" ${player.entity_id === target ? "selected" : ""}>${this._esc(player.attributes?.friendly_name || player.entity_id)}</option>`).join("")}
            </select>
            <button class="control-room-tray-btn primary" data-room-transfer title="${this._esc(this._m("Transfer queue", "העבר תור"))}">
              ${this._iconSvg("queue")}
            </button>
          </div>
        </div>
      `;
    }
    if (panel === "library") {
      return `
        <div class="control-room-tray open wide">
          <label class="control-room-search">
            ${this._iconSvg("search")}
            <input id="controlRoomLibraryInput" type="search" placeholder="${this._esc(this._m("Search the library...", "חפש בספריה..."))}" value="${this._esc(this._state.controlRoomLibraryQuery || "")}" autocomplete="off" spellcheck="false">
            <button type="button" class="control-room-search-mic" data-room-library-mic title="${this._esc(this._m("Voice search", "חיפוש קולי"))}">
              ${this._iconSvg("mic")}
            </button>
          </label>
          <div class="control-room-library-results" id="controlRoomLibraryResults">${this._controlRoomLibraryResultsHtml()}</div>
        </div>
      `;
    }
    return ``;
  }

  _controlRoomHtml() {
    if (!this._controlRoomEnabled()) return "";
    const players = this._controlRoomPlayers();
    const selectedIds = this._controlRoomSelectedPlayerIds();
    const primary = this._controlRoomPrimaryPlayer();
    const primaryArt = primary?.attributes?.entity_picture_local || primary?.attributes?.entity_picture || "";
    const sceneStyle = primaryArt ? `style="--control-room-scene-art:url('${this._esc(primaryArt)}')"` : "";
    const primaryName = primary?.attributes?.friendly_name || this._m("Selected player", "נגן נבחר");
    const primaryTrack = primary?.attributes?.media_title || this._m("Idle", "ממתין");
    const primaryPlaying = primary?.state === "playing";
    const primaryMuted = primary ? this._isMuted(primary) : false;
    const visiblePlayerIds = this._controlRoomVisiblePlayerIds();
    return `
      <div class="control-room-scene ${primaryArt ? "has-art" : ""}" ${sceneStyle}>
        <div class="control-room-scene-bg"></div>
        <div class="control-room-scene-glow"></div>
        <div class="control-room-layout">
          <div class="control-room-grid-wrap">
            <div class="control-room-grid">
              ${players.map((player) => this._controlRoomPlayerTileHtml(player)).join("")}
            </div>
          </div>
          ${this._controlRoomPanelHtml(players)}
          <div class="control-room-dock">
            <div class="control-room-now-pill">
              <span class="control-room-now-art">${primaryArt ? `<img src="${this._esc(primaryArt)}" alt="">` : this._iconSvg("music")}</span>
              <span class="control-room-now-copy">
                <span class="control-room-now-kicker">${this._esc(this._m("Selected player", "נגן נבחר"))}</span>
                <span class="control-room-now-name">${this._esc(primaryName)}</span>
                <span class="control-room-now-track">${this._esc(primaryTrack)}</span>
              </span>
            </div>
            <div class="control-room-dock-section player">
              <button class="control-room-dock-btn" data-room-selection-action="player_playpause" title="${this._esc(this._m("Play / Pause", "נגן / השהה"))}">
                ${this._iconSvg(primaryPlaying ? "pause" : "play")}
              </button>
              <button class="control-room-dock-btn" data-room-selection-action="player_next" title="${this._esc(this._m("Next", "הבא"))}">
                ${this._iconSvg("next")}
              </button>
              <button class="control-room-dock-btn ${primaryMuted ? "active" : ""}" data-room-selection-action="player_mute" title="${this._esc(this._m("Mute", "השתק"))}">
                ${this._iconSvg(primary ? this._volumeIconName(primary) : "speaker")}
              </button>
            </div>
            <span class="control-room-dock-divider" aria-hidden="true"></span>
            <div class="control-room-dock-section room">
              <button class="control-room-selection-pill ${this._state.controlRoomPanel === "selection" ? "active" : ""}" data-room-selection-action="selection" title="${this._esc(this._m("Connected players", "נגנים מחוברים"))}">
                ${this._esc(String(selectedIds.length))}
              </button>
              <button class="control-room-dock-btn ${this._state.controlRoomPanel === "visible" ? "active" : ""}" data-room-selection-action="visible" title="${this._esc(this._m("Visible tiles", "אריחים מוצגים"))}">
                ${this._iconSvg("grid")}
                <span class="control-room-badge-count">${this._esc(String(visiblePlayerIds.length))}</span>
              </button>
              <button class="control-room-dock-btn ${this._state.controlRoomPanel === "library" ? "active" : ""}" data-room-selection-action="library" title="${this._esc(this._m("Media library", "ספריית מדיה"))}">
                ${this._iconSvg("album")}
              </button>
              <button class="control-room-dock-btn ${this._state.controlRoomPanel === "transfer" ? "active" : ""}" data-room-selection-action="transfer" title="${this._esc(this._m("Transfer queue", "העבר תור"))}">
                ${this._iconSvg("queue")}
              </button>
              <button class="control-room-dock-btn" data-room-selection-action="group" title="${this._esc(this._m("Group selected", "חבר קבוצה"))}">
                ${this._iconSvg("speaker")}
              </button>
              <button class="control-room-dock-btn" data-room-selection-action="ungroup" title="${this._esc(this._m("Ungroup", "נתק קבוצה"))}">
                ${this._iconSvg("close")}
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  _syncControlRoomUi() {
    if (!this._controlRoomEnabled()) return;
    const host = this.$("controlRoomBody");
    const backdrop = this.$("controlRoomBackdrop");
    if (backdrop) backdrop.classList.toggle("open", !!this._state.controlRoomOpen);
    if (!host) return;
    const activeEl = this.shadowRoot?.activeElement;
    const restoreLibraryInput = activeEl?.id === "controlRoomLibraryInput";
    const selectionStart = restoreLibraryInput ? activeEl.selectionStart : null;
    const selectionEnd = restoreLibraryInput ? activeEl.selectionEnd : null;
    const nextHtml = this._controlRoomHtml();
    if (this._state.controlRoomRenderedHtml !== nextHtml) {
      host.innerHTML = nextHtml;
      this._state.controlRoomRenderedHtml = nextHtml;
    }
    const input = this.$("controlRoomLibraryInput");
    if (input) {
      input.value = this._state.controlRoomLibraryQuery || "";
      if (restoreLibraryInput) {
        input.focus({ preventScroll: true });
        if (typeof selectionStart === "number" && typeof selectionEnd === "number") {
          try { input.setSelectionRange(selectionStart, selectionEnd); } catch (_) {}
        }
      }
    }
  }

  _syncSourceBadgesUi(player = this._getSelectedPlayer(), queueItem = this._state.maQueueState?.current_item || null) {
    const meta = player ? this._currentSourceBadgeMeta(player, queueItem) : null;
    this.shadowRoot?.querySelectorAll("[data-art-source-badges]")?.forEach((host) => {
      if (!meta?.providerLabel && !meta?.qualityLabel) {
        host.innerHTML = "";
        host.hidden = true;
        return;
      }
      host.innerHTML = [
        meta.providerLabel
          ? `<span class="source-badge provider ${this._esc(`provider-${meta.providerKey || "source"}`)}">${this._esc(meta.providerLabel)}</span>`
          : ``,
        meta.qualityLabel
          ? `<span class="source-badge quality">${this._esc(meta.qualityLabel)}</span>`
          : ``,
      ].filter(Boolean).join("");
      host.hidden = false;
    });
  }

  _stripLyricsTimestamps(text = "") {
    return String(text || "")
      .replace(/\r/g, "")
      .replace(/^\[[a-z]+:[^\]]*\]\s*$/gim, "")
      .replace(/\[\d{1,3}:\d{2}(?:[.:]\d{1,3})?\]\s*/g, "")
      .trim();
  }

  _coerceLyricsRawText(value) {
    if (!value) return "";
    if (typeof value === "string") return String(value || "").replace(/\r/g, "").trim();
    if (typeof value === "object") {
      return String(
        value.syncedLyrics
        || value.synced_lyrics
        || value.plainLyrics
        || value.plain_lyrics
        || value.lyrics
        || value.text
        || "",
      ).replace(/\r/g, "").trim();
    }
    return "";
  }

  _coerceLyricsText(value) {
    return this._stripLyricsTimestamps(this._coerceLyricsRawText(value));
  }

  _parseLrcLyrics(text = "") {
    const rows = [];
    const raw = String(text || "").replace(/\r/g, "");
    const timeTag = /\[(\d{1,3}):(\d{2})(?:[.:](\d{1,3}))?\]/g;
    raw.split("\n").forEach((line) => {
      const tags = [...line.matchAll(timeTag)];
      if (!tags.length) return;
      const lyric = line.replace(/\[[^\]]+\]/g, "").trim();
      if (!lyric) return;
      tags.forEach((tag) => {
        const minutes = Number(tag[1]);
        const seconds = Number(tag[2]);
        const fraction = String(tag[3] || "0");
        const millis = Number(fraction.padEnd(3, "0").slice(0, 3));
        const time = minutes * 60 + seconds + millis / 1000;
        if (Number.isFinite(time)) rows.push({ time, text: lyric });
      });
    });
    return rows
      .sort((a, b) => a.time - b.time)
      .filter((row, idx, list) => idx === 0 || row.time !== list[idx - 1].time || row.text !== list[idx - 1].text);
  }

  _extractCurrentLyricsRawText() {
    const queueItem = this._state.maQueueState?.current_item || {};
    const media = queueItem.media_item || {};
    const metadata = media.metadata || queueItem.metadata || {};
    const candidates = [
      queueItem.lyrics,
      queueItem.plainLyrics,
      queueItem.plain_lyrics,
      queueItem.syncedLyrics,
      queueItem.synced_lyrics,
      media.lyrics,
      media.plainLyrics,
      media.plain_lyrics,
      media.syncedLyrics,
      media.synced_lyrics,
      metadata.lyrics,
      metadata.plainLyrics,
      metadata.plain_lyrics,
      metadata.syncedLyrics,
      metadata.synced_lyrics,
    ];
    for (const candidate of candidates) {
      const text = this._coerceLyricsRawText(candidate);
      if (text) return text;
    }
    return "";
  }

  _extractCurrentLyricsText() {
    return this._stripLyricsTimestamps(this._extractCurrentLyricsRawText());
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

  _closeLyricsModal() {
    const backdrop = this.$("lyricsBackdrop");
    if (!backdrop) return;
    backdrop.classList.remove("open");
    backdrop.onclick = null;
    backdrop.innerHTML = "";
    this._state.lyricsOpen = false;
    this._state.lyricsLines = [];
    this._state.lyricsActiveIndex = -1;
  }

  _renderLyricsModalShell(title, subtitle, bodyHtml) {
    const backdrop = this.$("lyricsBackdrop");
    if (!backdrop) return;
    backdrop.innerHTML = `
      <div class="lyrics-sheet">
        <div class="lyrics-head">
          <div class="lyrics-title-wrap">
            <div class="lyrics-title">${this._esc(title || this._t("Track Lyrics"))}</div>
            <div class="lyrics-sub">${this._esc(subtitle || "")}</div>
          </div>
          <button class="close-btn" id="lyricsCloseBtn">✕</button>
        </div>
        <div class="lyrics-body">${bodyHtml}</div>
      </div>`;
    backdrop.classList.add("open");
    backdrop.onclick = (e) => { if (e.target === backdrop) this._closeLyricsModal(); };
    backdrop.querySelector("#lyricsCloseBtn")?.addEventListener("click", () => this._closeLyricsModal());
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

  _syncLyricsHighlight(force = false) {
    if (!this._state.lyricsOpen) return;
    const lines = Array.isArray(this._state.lyricsLines) ? this._state.lyricsLines : [];
    if (!lines.length) return;
    const timeline = this.shadowRoot?.querySelector("#lyricsTimeline");
    if (!timeline) return;
    const position = this._getCurrentPosition();
    let activeIndex = 0;
    for (let i = 0; i < lines.length; i += 1) {
      if (Number(lines[i]?.time || 0) <= position + 0.15) activeIndex = i;
      else break;
    }
    if (!force && activeIndex === this._state.lyricsActiveIndex) return;
    this._state.lyricsActiveIndex = activeIndex;
    timeline.querySelectorAll(".lyrics-line").forEach((row, index) => {
      row.classList.toggle("active", index === activeIndex);
    });
    const activeRow = timeline.querySelector(`.lyrics-line[data-lyrics-index="${activeIndex}"]`);
    if (activeRow) {
      activeRow.scrollIntoView({ block: "center", behavior: force ? "auto" : "smooth" });
    }
  }

  async _openLyricsModal() {
    const backdrop = this.$("lyricsBackdrop");
    if (!backdrop) return;
    this.shadowRoot.querySelector(".card")?.appendChild(backdrop);
    const info = this._currentTrackInfo();
    const subtitle = [info.artist, info.album].filter(Boolean).join(" · ");
    this._state.lyricsOpen = true;
    const token = `${Date.now()}-${Math.random()}`;
    this._lyricsRequestToken = token;
    this._renderLyricsModalShell(
      info.title || this._t("Track Lyrics"),
      subtitle,
      `<div class="lyrics-state">${this._esc(this._t("Loading lyrics..."))}</div>`,
    );
    try {
      const payload = await this._fetchLyricsForCurrentTrack();
      if (!this._state.lyricsOpen || this._lyricsRequestToken !== token) return;
      const text = payload?.text || "";
      const lines = Array.isArray(payload?.lrc) ? payload.lrc : [];
      this._state.lyricsLines = lines;
      this._state.lyricsActiveIndex = -1;
      this._renderLyricsModalShell(
        info.title || this._t("Track Lyrics"),
        subtitle,
        lines.length
          ? this._lyricsTimelineHtml(lines)
          : text
          ? `<pre class="lyrics-pre">${this._esc(text)}</pre>`
          : `<div class="lyrics-state">${this._esc(this._t("No lyrics found"))}</div>`,
      );
      if (lines.length) requestAnimationFrame(() => this._syncLyricsHighlight(true));
    } catch (_) {
      if (!this._state.lyricsOpen || this._lyricsRequestToken !== token) return;
      this._state.lyricsLines = [];
      this._state.lyricsActiveIndex = -1;
      this._renderLyricsModalShell(
        info.title || this._t("Track Lyrics"),
        subtitle,
        `<div class="lyrics-state">${this._esc(this._t("Lyrics unavailable right now"))}</div>`,
      );
    }
  }

  _likedStorageKey() {
    return "ma_browser_card_likes_v2";
  }

  _likedMetaStorageKey() {
    return "ma_browser_card_like_meta_v2";
  }

  _loadLikedUris() {
    if (!this._likedUris) {
      const liked = new Set();
      try {
        const raw = JSON.parse(localStorage.getItem(this._likedStorageKey()) || "[]");
        if (Array.isArray(raw)) raw.filter(Boolean).forEach((uri) => liked.add(String(uri)));
      } catch (_) {}
      ["ma_browser_card_likes", "ma_browser_card_mobile_likes"].forEach((key) => {
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
    const player = this._getSelectedPlayer();
    const queueItem = this._state.maQueueState?.current_item || {};
    const media = queueItem?.media_item || {};
    const playerUri = String(player?.attributes?.media_content_id || "").trim();
    const uri = playerUri || this._getCurrentMediaUri();
    const artist = Array.isArray(media?.artists)
      ? media.artists.map((a) => a?.name).filter(Boolean).join(", ")
      : (player?.attributes?.media_artist || "");
    const parsed = this._parseMediaReference(uri, media?.media_type || queueItem?.media_type || player?.attributes?.media_content_type || "track");
    return {
      uri,
      ...parsed,
      media_type: parsed.media_type || media?.media_type || queueItem?.media_type || "track",
      name: player?.attributes?.media_title || media?.name || uri || this._m("Unknown", "לא ידוע"),
      artist: artist || "",
      album: media?.album?.name || player?.attributes?.media_album_name || "",
      image: this._queueItemImageUrl(queueItem, 240) || media?.image || media?.album?.image || player?.attributes?.entity_picture_local || player?.attributes?.entity_picture || "",
    };
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
    const uri = this._getCurrentMediaUri();
    if (!uri) return false;
    const override = this._state.currentMediaFavoriteOverride || null;
    if (override?.uri === uri && Date.now() - Number(override.ts || 0) < 8000) {
      return !!override.liked;
    }
    const queueItem = this._state.maQueueState?.current_item || {};
    const queueFavorite = queueItem?.media_item?.favorite;
    if (typeof queueFavorite === "boolean") return queueFavorite;
    if (typeof queueItem?.favorite === "boolean") return queueItem.favorite;
    const currentEntry = this._currentMediaLikeMeta();
    if (this._useMaLikedMode()) {
      const cache = this._cache.library.get("liked:ma");
      const likedItems = Array.isArray(cache?.items) ? cache.items : [];
      if (Array.isArray(cache?.items)) {
        return likedItems.some((item) => this._mediaRefsEquivalent(String(item?.uri || "").trim(), uri, item?.media_type || "track"))
          || !!this._matchFavoriteLibraryItem(currentEntry, likedItems);
      }
      return false;
    }
    const liked = this._loadLikedUris().has(uri);
    if (liked) return true;
    return false;
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
      const nextLiked = !likedNow;
      this._setCurrentMediaFavoriteOverride(nextLiked, entry);
      this._applyMaFavoriteOptimisticState(entry, nextLiked);
      if (sourceEl) this._flashInteraction(sourceEl);
      entry.favorite = nextLiked;
      if (entry.media_item) entry.media_item.favorite = nextLiked;
      try {
        if (likedNow) {
          await this._unfavoriteCurrentViaMassQueue();
          this._toast(this._m("Removed from Music Assistant liked", "הוסר מאהבתי של מיוזיק אסיסטנט"));
        } else {
          const pressTarget = playerEntityId || fallbackFavoriteEntity;
          if (!pressTarget) throw new Error("Favorite button was not found");
          await this._pressFavoriteButtonEntity(pressTarget);
          this._toast(this._m("Added to Music Assistant liked", "נוסף לאהבתי של מיוזיק אסיסטנט"));
        }
        [140, 520, 1400, 3000].forEach((delay) => setTimeout(() => this._refreshFavoriteState(true).catch(() => {}), delay));
        return true;
      } catch (error) {
        this._clearCurrentMediaFavoriteOverride();
        this._applyMaFavoriteOptimisticState(entry, likedNow);
        entry.favorite = likedNow;
        if (entry.media_item) entry.media_item.favorite = likedNow;
        this._toastError(this._isHebrew()
          ? `פעולת אהבתי של מיוזיק אסיסטנט נכשלה${error?.message ? `: ${error.message}` : ""}`
          : `Music Assistant favorite action failed${error?.message ? `: ${error.message}` : ""}`);
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
        this._toast(likedNow ? this._m("Removed from Music Assistant liked", "הוסר מאהבתי של מיוזיק אסיסטנט") : this._m("Added to Music Assistant liked", "נוסף לאהבתי של מיוזיק אסיסטנט"));
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
          this._toast(likedNow ? this._m("Removed from Music Assistant liked", "הוסר מאהבתי של מיוזיק אסיסטנט") : this._m("Added to Music Assistant liked", "נוסף לאהבתי של מיוזיק אסיסטנט"));
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
      this._toast(likedNow ? this._m("Removed from Music Assistant liked", "הוסר מאהבתי של מיוזיק אסיסטנט") : this._m("Added to Music Assistant liked", "נוסף לאהבתי של מיוזיק אסיסטנט"));
      if (sourceEl) this._flashInteraction(sourceEl);
      [300, 900, 1800].forEach((delay) => setTimeout(() => this._refreshFavoriteState(true).catch(() => {}), delay));
      entry.favorite = !likedNow;
      if (entry.media_item) entry.media_item.favorite = !likedNow;
      return true;
    } catch (error) {
      this._toastError(this._isHebrew()
        ? `פעולת אהבתי של מיוזיק אסיסטנט נכשלה${error?.message ? `: ${error.message}` : ""}`
        : `Music Assistant favorite action failed${error?.message ? `: ${error.message}` : ""}`);
      return false;
    }
  }

  async _toggleMaLikeEntryDirect(entry = {}, likedNow = false, mediaType = "track") {
    if (!this._hasDirectMAConnection()) return false;
    const uri = String(entry?.uri || "").trim();
    if (!uri) return false;
    if (!likedNow) {
      const ref = this._parseMediaReference(uri, mediaType);
      const playerUri = String(this._getSelectedPlayer()?.attributes?.media_content_id || "").trim();
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
    const nextEntry = {
      uri: String(entry?.uri || "").trim(),
      media_type: entry?.media_type || entry?.type || "track",
      item_id: entry?.item_id || "",
      provider: entry?.provider || "",
      library_item_id: entry?.library_item_id || "",
      name: entry?.name || entry?.title || entry?.media_item?.name || "",
      artist: entry?.artist || entry?.media_artist || entry?.media_item?.artists?.map?.((artist) => artist?.name).filter(Boolean).join(", ") || "",
      album: entry?.album || entry?.media_item?.album?.name || "",
      image: entry?.image || entry?.media_item?.image || entry?.media_item?.album?.image || "",
      favorite: !!liked,
    };
    const cache = this._cache.library.get("liked:ma");
    const items = Array.isArray(cache?.items) ? [...cache.items] : [];
    const idx = items.findIndex((item) =>
      this._mediaRefsEquivalent(String(item?.uri || "").trim(), nextEntry.uri, item?.media_type || nextEntry.media_type || "track")
      || !!this._matchFavoriteLibraryItem(nextEntry, [item])
    );
    if (liked) {
      if (idx >= 0) items[idx] = { ...items[idx], ...nextEntry, favorite: true };
      else items.unshift(nextEntry);
    } else if (idx >= 0) {
      items.splice(idx, 1);
    }
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
    const ref = this._parseMediaReference(uri, mediaType);
    if (ref.provider === "library" && ref.item_id) {
      return { media_type: ref.media_type || mediaType, library_item_id: ref.item_id };
    }
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
    const canonicalEntry = this._findMaLikedEntryMatch(entry, likedItems);
    if (canonicalEntry) {
      const canonicalArgs = this._favoriteRemoveArgsFromItem(canonicalEntry, mediaType);
      if (canonicalArgs) return canonicalArgs;
    }
    const resolvedFromCache = this._matchFavoriteLibraryItem(entry, likedItems);
    if (resolvedFromCache) return resolvedFromCache;
    const currentEntry = this._entryTargetsCurrentMedia(entry) ? this._currentMediaLikeMeta() : null;
    if (currentEntry?.uri && currentEntry.uri !== uri) {
      const currentResolved = this._matchFavoriteLibraryItem(currentEntry, likedItems);
      if (currentResolved) return currentResolved;
    }
    try {
      const remote = await this._callDirectMaCommand("music/item_by_uri", { uri });
      const remoteArgs = this._favoriteRemoveArgsFromItem(remote, mediaType);
      if (remoteArgs) return remoteArgs;
    } catch (_) {}
    return null;
  }

  _findMaLikedEntryMatch(entry = {}, likedItems = []) {
    if (!Array.isArray(likedItems) || !likedItems.length) return null;
    const targetUri = String(entry?.uri || "").trim();
    const targetType = String(entry?.media_type || entry?.type || "track").toLowerCase();
    const targetLibraryId = String(entry?.library_item_id || "").trim();
    const targetItemId = String(entry?.item_id || entry?.id || "").trim();
    const targetProvider = String(entry?.provider || entry?.provider_domain || entry?.provider_instance || "").trim().toLowerCase();
    const targetTitle = String(entry?.name || entry?.title || entry?.media_item?.name || "").trim().toLowerCase();
    const targetArtist = String(
      entry?.artist
      || entry?.artists?.map?.((artist) => artist?.name).filter(Boolean).join(", ")
      || entry?.media_item?.artists?.map?.((artist) => artist?.name).filter(Boolean).join(", ")
      || entry?.media_artist
      || ""
    ).trim().toLowerCase();
    for (const item of likedItems) {
      const candidateLibraryId = String(item?.library_item_id || "").trim();
      const candidateItemId = String(item?.item_id || item?.id || "").trim();
      const candidateProvider = String(item?.provider || item?.provider_domain || item?.provider_instance || "").trim().toLowerCase();
      const candidateUri = String(item?.uri || "").trim();
      const candidateType = String(item?.media_type || item?.type || "").toLowerCase();
      if (targetLibraryId && candidateLibraryId && targetLibraryId === candidateLibraryId) {
        return item;
      }
      if (targetItemId && candidateItemId && targetProvider && candidateProvider && targetItemId === candidateItemId && targetProvider === candidateProvider) {
        return item;
      }
      if (candidateUri && targetUri && candidateUri === targetUri) {
        return item;
      }
      const parsedTarget = this._parseMediaReference(targetUri, targetType || "track");
      const parsedCandidate = this._parseMediaReference(candidateUri, candidateType || targetType || "track");
      if (parsedTarget.provider && parsedCandidate.provider && parsedTarget.provider === parsedCandidate.provider && parsedTarget.item_id && parsedTarget.item_id === parsedCandidate.item_id) {
        return item;
      }
      const candidateTitle = String(item?.name || item?.title || item?.media_item?.name || "").trim().toLowerCase();
      const candidateArtist = String(
        item?.artist
        || item?.artists?.map?.((artist) => artist?.name).filter(Boolean).join(", ")
        || item?.media_item?.artists?.map?.((artist) => artist?.name).filter(Boolean).join(", ")
        || item?.media_artist
        || ""
      ).trim().toLowerCase();
      if (targetTitle && candidateTitle === targetTitle && (!targetArtist || !candidateArtist || candidateArtist === targetArtist || candidateArtist.includes(targetArtist) || targetArtist.includes(candidateArtist))) {
        return item;
      }
    }
    return null;
  }

  _matchFavoriteLibraryItem(entry = {}, likedItems = []) {
    const match = this._findMaLikedEntryMatch(entry, likedItems);
    return match ? this._favoriteRemoveArgsFromItem(match, entry?.media_type || entry?.type || "track") : null;
  }

  _favoriteRemoveArgsFromItem(item = {}, fallbackType = "track") {
    if (!item || typeof item !== "object") return null;
    const mediaType = String(item.media_type || item.type || item.media_item?.media_type || fallbackType || "track").toLowerCase();
    const parsed = this._parseMediaReference(item.uri || item.media_item?.uri || "", mediaType);
    const explicitLibraryId = item.library_item_id
      || ((String(item.provider || item.provider_domain || item.provider_instance || "").toLowerCase() === "library") ? (item.item_id || item.id || "") : "");
    const libraryItemId = String(parsed.provider === "library" ? parsed.item_id : explicitLibraryId || "").trim();
    if (!libraryItemId) return null;
    return { media_type: parsed.media_type || mediaType, library_item_id: libraryItemId };
  }

  _isEntryLiked(entry = {}) {
    const uri = String(entry?.uri || "").trim();
    if (this._useMaLikedMode()) {
      const cache = this._cache.library.get("liked:ma");
      const likedItems = Array.isArray(cache?.items) ? cache.items : [];
      if (Array.isArray(cache?.items)) {
        return uri
          ? likedItems.some((item) => this._mediaRefsEquivalent(String(item?.uri || "").trim(), uri, item?.media_type || entry?.media_type || "track"))
            || !!this._matchFavoriteLibraryItem(entry, likedItems)
          : !!this._matchFavoriteLibraryItem(entry, likedItems);
      }
      return !!entry?.favorite || !!entry?.media_item?.favorite;
    }
    return !!entry?.favorite || (uri ? this._loadLikedUris().has(uri) : false);
  }

  _parseMediaReference(uri = "", fallbackType = "track") {
    const value = String(uri || "").trim();
    const fallback = { uri: value, media_type: String(fallbackType || "track").toLowerCase(), provider: "", item_id: "", media_id: value };
    if (!value.includes("://")) return fallback;
    const [providerRaw, restRaw] = value.split("://");
    const provider = String(providerRaw || "").trim();
    const rest = String(restRaw || "").replace(/^\/+/, "");
    const segments = rest.split("/").filter(Boolean);
    if (!segments.length) return { ...fallback, provider };
    const mediaType = String(segments[0] || fallback.media_type).toLowerCase();
    const itemId = segments.slice(1).join("/") || rest;
    return {
      uri: value,
      provider,
      media_type: mediaType || fallback.media_type,
      item_id: itemId,
      media_id: itemId || value,
    };
  }

  _showQueueItemMenu(clientX, clientY, entry = {}) {
    this._dismissCtx();
    const mount = this.$("mobileMenu")?.classList.contains("open")
      ? (this.$("mobileMenu")?.querySelector(".menu-body") || this.$("mobileMenu")?.querySelector(".menu-sheet") || this.$("mobileMenu"))
      : this.shadowRoot.querySelector(".card");
    if (!mount) return;
    const liked = this._isEntryLiked(entry);
    const menu = document.createElement("div");
    menu.className = "ctx-menu queue-ctx-menu";
    menu.innerHTML = `
      <div class="ctx-item" data-queue-popup="up"><span class="ctx-ico">${this._iconSvg("previous")}</span><span>${this._esc(this._m("Up", "למעלה"))}</span></div>
      <div class="ctx-item" data-queue-popup="next"><span class="ctx-ico">${this._iconSvg("next")}</span><span>${this._esc(this._m("Move to next", "העבר לבא בתור"))}</span></div>
      <div class="ctx-item" data-queue-popup="down"><span class="ctx-ico">${this._iconSvg("repeat")}</span><span>${this._esc(this._m("Down", "למטה"))}</span></div>
      <div class="ctx-item" data-queue-popup="like"><span class="ctx-ico">${this._iconSvg(liked ? "heart_filled" : "heart_outline")}</span><span>${this._esc(this._m("Like", "אהבתי"))}</span></div>
      <div class="ctx-item" data-queue-popup="remove"><span class="ctx-ico">${this._iconSvg("menu")}</span><span>${this._esc(this._m("Remove", "הסר"))}</span></div>
      <div class="ctx-item" data-queue-popup="close"><span class="ctx-ico">×</span><span>${this._esc(this._m("Close", "סגור"))}</span></div>`;
    menu.addEventListener("click", (e) => e.stopPropagation());
    menu.querySelectorAll(".ctx-item").forEach((item) => item.addEventListener("click", async (e) => {
      e.stopPropagation();
      const action = item.dataset.queuePopup;
      if (action === "close") {
        this._dismissCtx();
        return;
      }
      if (action === "like") this._toggleLikeEntry(entry, item);
      else await this._handleQueueAction(action, entry.queue_item_id);
      this._dismissCtx();
      if (this._state.menuOpen && this._state.menuPage === "queue") await this._renderMobileMenu();
    }));
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

    const title = player.attributes.media_title || this._t("No active media");
    const artist = player.attributes.media_artist || this._t("Unknown");
    const album = player.attributes.media_album_name || "";
    const playerName = player.attributes.friendly_name || player.entity_id;
    const art = player.attributes.entity_picture_local || player.attributes.entity_picture;
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
            <div class="immersive-player-pill" id="immersivePlayerName">${this._esc(`${this._t("Playing on")}: ${playerName}`)}</div>
          </div>
        </div>
        <div class="immersive-body">
          <div class="immersive-art-wrap">
            <div class="immersive-art" id="immersiveArt">${art ? `<img src="${this._esc(art)}" alt="">` : "♪"}</div>
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
              <button class="chip-btn immersive-player-picker-btn" id="immersiveChoosePlayerBtn" title="${this._t("Open Player Picker")}">${this._iconSvg("speaker")}</button>
              <button class="chip-btn" id="immersiveQueueBtn">${this._t("Open full queue")}</button>
              <button class="chip-btn" id="immersiveTransferBtn">${this._t("Transfer Queue")}</button>
            </div>
          </div>
        </div>
      </div>`;

    backdrop.querySelector("#immersiveCloseBtn")?.addEventListener("click", () => this._closeImmersiveNowPlaying());
    backdrop.onclick = (e) => { if (e.target === backdrop) this._closeImmersiveNowPlaying(); };
    backdrop.querySelector("#immersiveProgressBar")?.addEventListener("click", (e) => this._seekFromProgress(e));
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
    const art = player.attributes.entity_picture_local || player.attributes.entity_picture;
    const repeat = player.attributes.repeat || "off";
    const title = player.attributes.media_title || this._t("No active media");
    const artist = player.attributes.media_artist || this._t("Unknown");
    const album = player.attributes.media_album_name || "";
    const playerName = player.attributes.friendly_name || player.entity_id;
    backdrop.querySelector(".immersive-title")?.replaceChildren(document.createTextNode(title));
    backdrop.querySelector(".immersive-subtitle")?.replaceChildren(document.createTextNode([artist, album].filter(Boolean).join(" · ")));
    backdrop.querySelector("#immersivePlayerName")?.replaceChildren(document.createTextNode(`${this._t("Playing on")}: ${playerName}`));
    const play = backdrop.querySelector("#immersivePlayBtn");
    this._setButtonIcon(play, this._playPauseIconName(player));
    const shuffle = backdrop.querySelector("#immersiveShuffleBtn");
    if (shuffle) shuffle.classList.toggle("active", !!player.attributes.shuffle);
    const repeatBtn = backdrop.querySelector("#immersiveRepeatBtn");
    if (repeatBtn) {
      repeatBtn.classList.toggle("active", repeat !== "off");
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
    if (artBox) artBox.innerHTML = art ? `<img src="${this._esc(art)}" alt="">` : "♪";
    const bg = backdrop.querySelector(".immersive-bg");
    if (bg) bg.style.backgroundImage = art ? `url("${art}")` : "";
    const glow = backdrop.querySelector(".immersive-cover-glow");
    if (glow) glow.style.backgroundImage = art ? `url("${art}")` : "";
  }

  _handleWindowResize() {
    clearTimeout(this._resizeTimer);
    this._resizeTimer = setTimeout(() => {
      if (!this.isConnected || !this._built) return;
      const reopenImmersive = this._state.immersiveNowPlayingOpen;
      const currentWidth = window.innerWidth || 0;
      const currentHeight = window.innerHeight || 0;
      const active = this.shadowRoot?.activeElement || document.activeElement;
      const activeTag = active?.tagName?.toLowerCase?.() || "";
      const editingText = active && (activeTag === "input" || activeTag === "textarea" || active?.isContentEditable);
      const widthDelta = Math.abs(currentWidth - this._lastViewportWidth);
      const heightDelta = Math.abs(currentHeight - this._lastViewportHeight);
      const keyboardLikeResize = editingText && (
        (widthDelta < 120 && heightDelta > 18) ||
        (widthDelta < 8 && heightDelta > 0)
      );
      this._lastViewportWidth = currentWidth;
      this._lastViewportHeight = currentHeight;
      if (keyboardLikeResize) return;
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

  _renderLoading(text = this._t("Loading...")) {
    this.$("content").classList.remove("now-playing-mode");
    this.$("content").innerHTML = `<div class="state-box"><div><div class="spinner"></div><div>${this._esc(text)}</div></div></div>`;
  }

  _renderEmpty(text = this._t("No content found")) {
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
          ${retryFn ? `<div style="margin-top:12px;"><button class="chip-btn" id="retryBtn">${this._t("Try again")}</button></div>` : ""}
        </div>
      </div>`;
    if (retryFn) this.$("retryBtn")?.addEventListener("click", retryFn, { once: true });
  }

  async _renderHome() {
    const token = this._nextRenderToken();
    this._renderLoading(this._t("Loading library..."));
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
      if (radio.length) html += this._sectionHtml(this._t("Favorite Radio"), radio, "radio", true);
      if (recentlyPlayed.length) html += this._sectionHtml(this._t("Recently Played"), recentlyPlayed, "album", true);
      if (recentAlbums.length) html += this._sectionHtml(this._t("Recently Added"), recentAlbums, "album", true);
      if (randomAlbums.length) html += this._sectionHtml(this._t("Discover"), randomAlbums, "album", true);
      this.$("content").classList.remove("now-playing-mode");
      this.$("content").innerHTML = html || `<div class="state-box">${this._esc(this._t("No content found"))}</div>`;
      this._hydrateImages();
      this._highlightNowPlaying();
    } catch (e) {
      if (!this._isValidRender(token)) return;
      this._renderError(e, () => this._renderHome());
    }
  }

  async _renderRadio() { return this._renderGridCollection("radio", this._t("Radio Stations"), 5000, false); }
  async _renderPodcasts() { return this._renderGridCollection("podcast", this._t("All Podcasts"), 500, false); }
  async _renderAlbums() { return this._renderGridCollection("album", this._t("All Albums"), 500, false); }
  async _renderArtists() { return this._renderGridCollection("artist", this._t("All Artists"), 500, false); }
  async _renderPlaylists() { return this._renderGridCollection("playlist", this._t("Playlists"), 500, false); }

  _setTracksLayout(layout) {
    this._state.tracksLayout = layout === "grid" ? "grid" : "list";
    try { localStorage.setItem("ma_browser_card_tracks_layout", this._state.tracksLayout); } catch (_) {}
    if (this._state.view === "tracks") this._renderTracks();
  }

  async _renderTracks() {
    const token = this._nextRenderToken();
    this._renderLoading(this._t("Loading..."));
    try {
      const items = await this._getLibrary("track", "sort_name", 500);
      if (!this._isValidRender(token)) return;
      const isGrid = this._state.tracksLayout === "grid";
      this.$("content").classList.remove("now-playing-mode");
      this.$("content").innerHTML = `
        <div class="section">
          <div class="section-header">
            <div class="section-title">${this._esc(this._t("All Tracks"))}</div>
            <div class="section-badge">${items.length}</div>
            <div class="section-actions">
              <button class="chip-btn ${isGrid ? "active" : ""}" id="tracksGridBtn">${this._t("Grid")}</button>
              <button class="chip-btn ${!isGrid ? "active" : ""}" id="tracksListBtn">${this._t("List")}</button>
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
    this._renderLoading(this._t("Loading..."));
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
    this._renderLoading(`${this._t("Search")}: ${query}`);
    try {
      const res = await this._search(query);
      if (!this._isValidRender(token)) return;
      const { radio = [], podcasts = [], albums = [], artists = [], tracks = [], playlists = [] } = res;
      let html = `<div class="section"><div class="section-header"><div class="section-title">${this._esc(this._t("Search"))}: ${this._esc(query)}</div></div></div>`;
      if (radio.length) html += this._sectionHtml(this._t("Radio"), radio, "radio", false);
      if (podcasts.length) html += this._sectionHtml(this._t("Podcasts"), podcasts, "podcast", false);
      if (albums.length) html += this._sectionHtml(this._t("Albums"), albums, "album", false);
      if (artists.length) html += this._sectionHtml(this._t("Artists"), artists, "artist", false);
      if (tracks.length) {
        html += `<div class="section"><div class="section-header"><div class="section-title">${this._esc(this._t("Tracks"))}</div><div class="section-badge">${tracks.length}</div><div class="section-actions">${this._sectionActionButtons(tracks)}</div></div><div class="track-list">${tracks.map((item, i) => this._trackRowHtml(item, i + 1)).join("")}</div></div>`;
      }
      if (playlists.length) html += this._sectionHtml(this._t("Playlists"), playlists, "playlist", false);
      if (!radio.length && !podcasts.length && !albums.length && !artists.length && !tracks.length && !playlists.length) html = `<div class="state-box">${this._esc(this._t("No results"))}: "${this._esc(query)}"</div>`;
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
    this._renderLoading(this._t("Loading..."));
    try {
      await this._ensureQueueSnapshot();
      this._refreshGroupingState();
      if (!this._isValidRender(token)) return;
      const player = this._getSelectedPlayer();
      if (!player) return this._renderEmpty(this._t("No active media"));

      const title = player.attributes.media_title || this._t("No active media");
      const artist = player.attributes.media_artist || this._t("Unknown");
      const album = player.attributes.media_album_name || "";
      const state = player.state || "idle";
      const art = player.attributes.entity_picture_local || player.attributes.entity_picture;
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
              <div class="now-art" id="nowHeroArt">${art ? `<img src="${this._esc(art)}" alt="">` : "♪"}</div>
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
                  <button class="chip-btn now-player-picker-btn" id="choosePlayerInlineBtn" title="${this._t("Open Player Picker")}">${this._iconSvg("speaker")}</button>
                </div>
              </div>
            </div>
          </div>

          <div class="now-right">
            <div class="now-card now-queue-card">
              <div class="now-queue-toolbar">
                <div class="now-queue-header">
                  <div class="now-queue-title" id="nowQueuePanelTitle">${this._t("Up Next")}</div>
                  <div class="now-queue-count" id="nowQueuePanelCount">${queueItems.length}</div>
                  <div class="group-inline">
                    <button class="chip-btn" id="openQueueBtn">${this._t("Open full queue")}</button>
                    <button class="chip-btn" id="transferQueueBtn">${this._t("Transfer Queue")}</button>
                    <button class="chip-btn" id="groupBtn">${this._t("Group Speakers")}</button>
                  </div>
                </div>
                <div class="search now-queue-search">
                  <span>🔍</span>
                  <input id="nowQueueSearchInput" type="text" value="${this._esc(nowPlayingQuery)}" placeholder="${this._t("Search queue and library...")}">
                  <button class="icon-btn" id="nowQueueSearchClear" style="display:${nowPlayingQuery.trim() ? "" : "none"};" title="${this._t("Clear search")}">✕</button>
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
      return `<div class="now-side-scroll"><div class="state-box" style="min-height:120px;">${this._esc(this._t("Queue is empty"))}</div></div>`;
    }
    return `<div class="now-side-scroll"><div class="now-queue-list">${queueItems.map((item) => this._miniQueueItemHtml(item)).join("")}</div></div>`;
  }

  _nowPlayingSearchResultsHtml(query, results) {
    const { radio = [], podcasts = [], albums = [], artists = [], tracks = [], playlists = [] } = results || {};
    const total = radio.length + podcasts.length + albums.length + artists.length + tracks.length + playlists.length;
    if (!total) {
      return `<div class="now-side-scroll"><div class="state-box">${this._esc(this._t("No results"))}: "${this._esc(query)}"</div></div>`;
    }

    let html = `
      <div class="now-side-scroll">
        <div class="side-search-summary">
          <div class="side-search-summary-text">${this._esc(this._t("Queue results"))}: "${this._esc(query)}"</div>
          <button class="chip-btn" id="backToQueueBtn">${this._esc(this._t("Back to queue"))}</button>
        </div>`;
    if (radio.length) html += this._sectionHtml(this._t("Radio"), radio, "radio", false);
    if (podcasts.length) html += this._sectionHtml(this._t("Podcasts"), podcasts, "podcast", false);
    if (albums.length) html += this._sectionHtml(this._t("Albums"), albums, "album", false);
    if (artists.length) html += this._sectionHtml(this._t("Artists"), artists, "artist", false);
    if (tracks.length) {
      html += `<div class="section"><div class="section-header"><div class="section-title">${this._esc(this._t("Tracks"))}</div><div class="section-badge">${tracks.length}</div></div><div class="track-list">${tracks.map((item, i) => this._trackRowHtml(item, i + 1)).join("")}</div></div>`;
    }
    if (playlists.length) html += this._sectionHtml(this._t("Playlists"), playlists, "playlist", false);
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
      title.textContent = this._t("Up Next");
      count.textContent = String(queueItems.length);
      body.innerHTML = this._queuePanelHtml(queueItems);
      this._hydrateImages();
      this._highlightNowPlaying();
      return;
    }

    title.textContent = this._t("Search");
    count.textContent = "…";
    body.innerHTML = `<div class="now-side-scroll"><div class="state-box" style="min-height:120px;">${this._esc(this._t("Loading..."))}</div></div>`;

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
      body.innerHTML = `<div class="now-side-scroll"><div class="state-box">${this._esc(e?.message || this._t("Try again"))}</div></div>`;
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
    this.$("bigProgressBar")?.addEventListener("click", (e) => this._seekFromProgress(e));
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
    return `<button class="chip-btn" data-action="play-all" data-items="${encoded}">${this._esc(this._t("Play all"))}</button><button class="chip-btn" data-action="shuffle-all" data-items="${encoded}">${this._esc(this._t("Shuffle all"))}</button>`;
  }

  _mediaCardHtml(item, forcedType = null) {
    const mediaType = forcedType || item.media_type || "album";
    const uri = item.uri || "";
    const name = item.name || "";
    const artUrl = this._artUrl(item);
    const artist = mediaType === "artist" ? (this._isHebrew() ? "אמן" : "Artist") : mediaType === "radio" ? (item.metadata?.description || "") : this._artistName(item) || item.album?.name || "";
    const placeholder = mediaType === "radio" ? "📻" : mediaType === "artist" ? "🎤" : mediaType === "podcast" ? "🎙" : "💿";
    const imgAttrs = artUrl ? `data-img="${this._esc(artUrl)}" data-placeholder="${placeholder}"` : "";
    return `<div class="media-card" data-uri="${this._esc(uri)}" data-type="${this._esc(mediaType)}"><div class="media-art" ${imgAttrs}><div class="media-placeholder">${placeholder}</div><div class="media-overlay"><div class="play-bubble">▶</div></div><div class="playing-badge">▶</div></div><div class="media-title">${this._esc(name)}</div><div class="media-sub">${this._esc(artist)}</div></div>`;
  }

  _trackRowHtml(item, index = 1) {
    const artUrl = this._artUrl(item);
    const name = item.name || "";
    const artist = this._artistName(item);
    const sub = [artist, item.album?.name].filter(Boolean).join(" · ");
    const imgAttrs = artUrl ? `data-img="${this._esc(artUrl)}" data-placeholder="♫"` : "";
    return `<div class="track-row" data-uri="${this._esc(item.uri || "")}" data-type="track"><div class="track-num">${index}</div><div class="track-art" ${imgAttrs}>♫</div><div class="track-meta"><div class="track-name">${this._esc(name)}</div><div class="track-sub">${this._esc(sub)}</div></div><div class="track-dur">${this._fmtDur(item.duration)}</div></div>`;
  }

  _getQueueItemKey(item) {
    return String(item?.queue_item_id || item?.item_id || item?.id || item?.sort_index || item?.media_item?.uri || item?.uri || "");
  }

  _getQueueItemUri(item) {
    return item?.media_item?.uri || item?.uri || item?.streamdetails?.uri || "";
  }

  _queueItemPrimaryArtist(item = {}) {
    return item?.media_artist
      || item?.artist
      || item?.media_item?.artist
      || (Array.isArray(item?.media_item?.artists) ? item.media_item.artists.map((artist) => artist?.name).filter(Boolean).join(", ") : "")
      || "";
  }

  _queueItemPrimaryTitle(item = {}) {
    return item?.media_item?.name || item?.media_title || item?.name || "";
  }

  _mobileUpNextItem() {
    const queueState = this._state.maQueueState || {};
    if (queueState?.next_item) return queueState.next_item;
    const items = Array.isArray(this._state.queueItems) ? this._state.queueItems : [];
    if (!items.length) return null;
    const currentIndex = Number(queueState.current_index);
    if (Number.isFinite(currentIndex)) {
      return items.find((item) => Number(item?.sort_index) === currentIndex + 1)
        || items.find((item) => Number(item?.sort_index) > currentIndex)
        || null;
    }
    const currentKey = this._getQueueItemKey(queueState.current_item);
    if (currentKey) {
      const index = items.findIndex((item) => this._getQueueItemKey(item) === currentKey);
      if (index >= 0 && index < items.length - 1) return items[index + 1];
    }
    return items[1] || null;
  }

  _syncMobileUpNextUi(item = null) {
    const buttons = Array.from(this.shadowRoot?.querySelectorAll?.("[data-up-next-inline]") || []);
    const enabled = this._mobileShowUpNextEnabled();
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
      const title = this._queueItemPrimaryTitle(item) || this._m("Up next", "הבא בתור");
      const art = this._queueItemImageUrl(item, 72);
      button.hidden = false;
      button.dataset.queueItemId = this._getQueueItemKey(item);
      button.dataset.uri = this._getQueueItemUri(item);
      button.dataset.type = item?.media_item?.media_type || item?.media_type || "track";
      button.dataset.sortIndex = Number.isFinite(Number(item?.sort_index)) ? String(item.sort_index) : "";
      button.title = this._isHebrew() ? `הבא בתור: ${title}` : `Up next: ${title}`;
      if (artEl) {
        artEl.innerHTML = art ? `<img src="${this._esc(art)}" alt="">` : `<span class="up-next-art-fallback">${this._iconSvg("tracks")}</span>`;
      }
      if (prefixEl) prefixEl.textContent = this._m("Up next", "הבא בתור");
      if (titleEl) titleEl.textContent = title;
    });
  }

  async _playMobileUpNext() {
    const item = this._mobileUpNextItem();
    if (!item) {
      this._toast(this._m("No next track in queue", "אין שיר הבא בתור"));
      return;
    }
    const queueItemId = this._getQueueItemKey(item);
    const uri = this._getQueueItemUri(item);
    const mediaType = item?.media_item?.media_type || item?.media_type || "track";
    const sortIndex = Number.isFinite(Number(item?.sort_index)) ? Number(item.sort_index) : "";
    const played = await this._playQueueItem(queueItemId, uri, mediaType, sortIndex);
    if (played) this._toastSuccess(this._m("Skipped to up next", "עבר לשיר הבא בתור"));
  }

  _miniQueueItemHtml(item) {
    const img = this._queueItemImageUrl(item, 120);
    const artist = item.media_item?.artists?.map((a) => a.name).join(", ") || "";
    const currentIndex = this._state.maQueueState?.current_index ?? -999;
    const isActive = item.sort_index === currentIndex;
    const key = this._getQueueItemKey(item);
    return `
      <div class="mini-queue-item ${isActive ? "active" : ""}" data-uri="${this._esc(item.media_item?.uri || "")}" data-type="track" data-sort-index="${this._esc(item.sort_index ?? "")}" data-queue-item-id="${this._esc(key)}">
        <div class="mini-queue-index">${isActive ? "▶" : (item.sort_index ?? "")}</div>
        <div class="mini-queue-thumb">${img ? `<img src="${this._esc(img)}" alt="">` : "♫"}</div>
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
      await this._handleQueueAction(queueActionBtn.dataset.queueAction, queueActionBtn.dataset.queueItemId);
      return;
    }

    const secBtn = e.target.closest('[data-action="play-all"], [data-action="shuffle-all"]');
    if (secBtn) {
      const items = JSON.parse(secBtn.dataset.items || "[]");
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
      await this._handleQueueAction(queueActionBtn.dataset.queueAction, queueActionBtn.dataset.queueItemId);
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
    this._dismissCtx();
    const card = this.shadowRoot.querySelector(".card");
    const menu = document.createElement("div");
    menu.className = "ctx-menu";
    menu.innerHTML = `
      <div class="ctx-item" data-enqueue="play"><span class="ctx-ico">▶</span><span>${this._esc(this._t("Play now"))}</span></div>
      <div class="ctx-item" data-enqueue="shuffle"><span class="ctx-ico">⇄</span><span>${this._esc(this._t("Shuffle play"))}</span></div>
      <div class="ctx-item" data-enqueue="next"><span class="ctx-ico">⏭</span><span>${this._esc(this._t("Play next"))}</span></div>
      <div class="ctx-item" data-enqueue="add"><span class="ctx-ico">＋</span><span>${this._esc(this._t("Add to queue"))}</span></div>`;
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

  async _refreshQueueAfterMutation(delay = 160) {
    if (delay > 0) {
      await new Promise((resolve) => window.setTimeout(resolve, delay));
    }
    await this._ensureQueueSnapshot(true);
    if (this._state.view === "now_playing") this._renderNowPlayingPage();
    if (this._state.queueVisible) await this._renderQueueItems();
  }

  _queueItemsContainCurrent(items = [], queueState = this._state.maQueueState) {
    if (!Array.isArray(items) || !items.length || !queueState) return false;
    const hasCurrentIndex = queueState.current_index !== "" && queueState.current_index !== null && queueState.current_index !== undefined;
    const currentIndex = hasCurrentIndex ? Number(queueState.current_index) : NaN;
    const currentKey = this._getQueueItemKey(queueState.current_item);
    return items.some((item) =>
      (Number.isFinite(currentIndex) && Number(item?.sort_index) === currentIndex)
      || (currentKey && this._getQueueItemKey(item) === currentKey)
    );
  }

  _queueItemMatchesPlayer(item, player = this._getSelectedPlayer()) {
    if (!item || !player) return false;
    const playerUri = String(player?.attributes?.media_content_id || "").trim();
    const itemUri = String(this._getQueueItemUri(item) || "").trim();
    if (playerUri && itemUri) {
      return this._mediaRefsEquivalent(playerUri, itemUri, item?.media_item?.media_type || item?.media_type || "track");
    }
    const playerTitle = String(player?.attributes?.media_title || "").trim().toLowerCase();
    if (!playerTitle) return false;
    const playerArtist = String(player?.attributes?.media_artist || "").trim().toLowerCase();
    const title = String(item?.media_item?.name || item?.media_title || item?.name || "").trim().toLowerCase();
    const artists = String(item?.media_artist || (item?.media_item?.artists || []).map((artist) => artist?.name).filter(Boolean).join(", ") || "").trim().toLowerCase();
    return title === playerTitle && (!playerArtist || !artists || artists.includes(playerArtist) || playerArtist.includes(artists));
  }

  _applyQueueSnapshot(queueState, items = [], force = false) {
    if (!queueState) return;
    const normalizedState = { ...queueState };
    const pendingUntil = Number(this._state.mobileQueuePlayPendingUntil || 0);
    const hasPendingPlay = pendingUntil > Date.now();
    const pendingKey = String(this._state.mobileQueuePlayPendingKey || "");
    const pendingUri = String(this._state.mobileQueuePlayPendingUri || "");
    const pendingIndexRaw = this._state.mobileQueuePlayPendingIndex;
    const pendingIndex = pendingIndexRaw !== null && pendingIndexRaw !== "" && pendingIndexRaw !== undefined
      ? Number(pendingIndexRaw)
      : NaN;
    const shouldConsiderReplace = force || !this._state.queueItems.length || this._state.view === "now_playing" || this._state.queueVisible;
    const nextItems = Array.isArray(items)
      ? [...items].filter(Boolean).sort((a, b) => Number(a?.sort_index ?? 0) - Number(b?.sort_index ?? 0))
      : [];
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
      const matchesPending = (pendingKey && incomingKey === pendingKey)
        || (pendingUri && this._mediaRefsEquivalent(incomingUri, pendingUri, normalizedState.current_item?.media_item?.media_type || normalizedState.current_item?.media_type || "track"))
        || (Number.isFinite(pendingIndex) && Number.isFinite(incomingIndex) && pendingIndex === incomingIndex);
      if (!matchesPending && this._state.maQueueState?.current_item) {
        normalizedState.current_index = this._state.maQueueState.current_index;
        normalizedState.current_item = this._state.maQueueState.current_item;
        normalizedState.next_item = this._state.maQueueState.next_item;
        freezeQueueItemsForPendingPlay = true;
      } else if (matchesPending) {
        const playerCaughtUp = this._queueItemMatchesPlayer(normalizedState.current_item);
        if (playerCaughtUp) {
          this._state.mobileQueuePlayPendingUntil = 0;
          this._state.mobileQueuePlayPendingKey = "";
          this._state.mobileQueuePlayPendingIndex = null;
          this._state.mobileQueuePlayPendingUri = "";
        }
      }
    }
    this._state.maQueueState = normalizedState;
    if (!shouldConsiderReplace || !nextItems.length) return;
    if (freezeQueueItemsForPendingPlay) return;
    const existingItems = Array.isArray(this._state.queueItems) ? this._state.queueItems : [];
    const totalItems = Number(queueState?.items);
    const looksPartial = Number.isFinite(totalItems) && totalItems > 0 && nextItems.length < Math.min(totalItems, 25);
    const existingLooksBetter = existingItems.length > nextItems.length && this._queueItemsContainCurrent(existingItems, normalizedState);
    if (looksPartial && existingLooksBetter) return;
    this._state.queueItems = nextItems;
  }

  async _callMassQueueService(service, queueItemId) {
    const player = this._getSelectedPlayer();
    if (!player || !queueItemId || !this._hasMassQueueService(service)) return false;
    try {
      await this._hass.callService("mass_queue", service, {
        entity: player.entity_id,
        queue_item_id: String(queueItemId),
      });
      return true;
    } catch (_) {
      return false;
    }
  }

  async _callMassQueueCommand(command, data = {}) {
    // Some mass_queue versions expose send_command but fail internally for MA queue
    // actions. Keep it opt-in so queue selection does not surface HA service errors.
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

  _markMobileQueuePlayPending(item, playIndex) {
    if (!item && !Number.isFinite(playIndex)) return;
    this._state.mobileQueuePlayPendingUntil = Date.now() + 4500;
    this._state.mobileQueuePlayPendingKey = item ? (this._getQueueItemKey(item) || this._getQueueItemUri(item) || "") : "";
    this._state.mobileQueuePlayPendingIndex = Number.isFinite(playIndex) ? playIndex : null;
    this._state.mobileQueuePlayPendingUri = item ? (this._getQueueItemUri(item) || "") : "";
  }

  _clearMobileQueuePlayPending() {
    this._state.mobileQueuePlayPendingUntil = 0;
    this._state.mobileQueuePlayPendingKey = "";
    this._state.mobileQueuePlayPendingIndex = null;
    this._state.mobileQueuePlayPendingUri = "";
  }

  _resolveQueuePlayIndex(queueItemId = "", fallbackUri = "", explicitSortIndex = "") {
    const hasExplicitIndex = explicitSortIndex !== "" && explicitSortIndex !== null && explicitSortIndex !== undefined;
    const normalizedExplicit = hasExplicitIndex ? Number(explicitSortIndex) : NaN;
    if (Number.isFinite(normalizedExplicit)) return normalizedExplicit;
    const key = String(queueItemId || "").trim();
    const uri = String(fallbackUri || "").trim();
    const match = (this._state.queueItems || []).find((item) =>
      (key && this._getQueueItemKey(item) === key) || (uri && this._mediaRefsEquivalent(this._getQueueItemUri(item), uri, item?.media_item?.media_type || item?.media_type || "track"))
    );
    const resolved = Number(match?.sort_index);
    return Number.isFinite(resolved) ? resolved : null;
  }

  _getQueueItemByIndexOrKey(sortIndex = "", queueItemId = "", fallbackUri = "") {
    const hasIndex = sortIndex !== "" && sortIndex !== null && sortIndex !== undefined;
    const normalizedIndex = hasIndex ? Number(sortIndex) : NaN;
    const key = String(queueItemId || "").trim();
    const uri = String(fallbackUri || "").trim();
      return (this._state.queueItems || []).find((item) =>
        (Number.isFinite(normalizedIndex) && Number(item?.sort_index) === normalizedIndex)
        || (key && this._getQueueItemKey(item) === key)
        || (uri && this._mediaRefsEquivalent(this._getQueueItemUri(item), uri, item?.media_item?.media_type || item?.media_type || "track"))
      ) || null;
  }

  async _playQueueItem(queueItemId, fallbackUri = "", mediaType = "track", sortIndex = "") {
    if ((!queueItemId && !fallbackUri) || this._state.queueActionPending) return false;
    this._setQueueBusy(true);
    try {
      const playIndex = this._resolveQueuePlayIndex(queueItemId, fallbackUri, sortIndex);
      const currentContextBeforePlay = this._mobileArtStackContext();
      const currentSortIndexBeforePlay = Number(currentContextBeforePlay.queueItems?.[currentContextBeforePlay.baseIndex]?.sort_index);
      const currentForStepBeforePlay = Number.isFinite(currentSortIndexBeforePlay) ? currentSortIndexBeforePlay : currentContextBeforePlay.baseIndex;
      const optimisticItem = this._getQueueItemByIndexOrKey(playIndex, queueItemId, fallbackUri);
      if (optimisticItem && Number.isFinite(playIndex)) {
        this._markMobileQueuePlayPending(optimisticItem, playIndex);
        this._state.maQueueState = {
          ...(this._state.maQueueState || {}),
          current_index: playIndex,
          current_item: optimisticItem,
          next_item: (this._state.queueItems || []).find((item) => Number(item?.sort_index) === playIndex + 1) || null,
        };
        this._state.mobileArtBrowseOffset = 0;
        this._syncNowPlayingUI();
      }
      const player = this._getSelectedPlayer();
      const queueId = player?.attributes?.active_queue;
      if (queueId && Number.isFinite(playIndex) && this._hasDirectMAConnection()) {
        try {
          await this._callDirectMaCommand("player_queues/play_index", { queue_id: queueId, index: playIndex });
          this._refreshQueueAfterMutation(700).catch(() => {});
          this._refreshQueueAfterMutation(1450).catch(() => {});
          this._refreshQueueAfterMutation(2850).catch(() => {});
          return true;
        } catch (_) {
          // Keep falling through to Home Assistant service fallbacks.
        }
      }
      if (queueId && Number.isFinite(playIndex)) {
        const usedMassCommand = await this._callMassQueueCommand("player_queues/play_index", { queue_id: queueId, index: playIndex });
        if (usedMassCommand) {
          this._refreshQueueAfterMutation(700).catch(() => {});
          this._refreshQueueAfterMutation(1450).catch(() => {});
          this._refreshQueueAfterMutation(2850).catch(() => {});
          return true;
        }
      }
      const usedMassQueue = await this._callMassQueueService("play_queue_item", queueItemId);
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
      this._toast(e?.message || this._t("Queue action failed"));
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
        throw new Error(this._t("Music Assistant config entry was not found"));
      }
      serviceData = { config_entry_id: configEntryId, ...serviceData };
    }
    return this._hass.connection.sendMessagePromise({
      type: "call_service",
      domain: "music_assistant",
      service,
      service_data: serviceData,
      return_response: true,
    });
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
      const entries = await this._hass.connection.sendMessagePromise({
        type: "config_entries/get",
        domain: "music_assistant",
      });
      const list = Array.isArray(entries) ? entries : [];
      const preferred = list.find((entry) => entry?.state === "loaded")
        || list.find((entry) => entry?.state === "setup_retry")
        || list.find((entry) => entry?.state === "not_loaded")
        || list[0];
      this._resolvedConfigEntryId = preferred?.entry_id || "";
      return this._resolvedConfigEntryId;
    } catch (_) {
      this._resolvedConfigEntryId = explicit || "";
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
    const flatImage = item.media_image || item.image_url || "";
    const sortIndex = Number(item.sort_index);
    const positionIndex = Number(item.position);
    return {
      ...item,
      media_item: {
        ...mediaItem,
        uri: mediaItem?.uri || item.uri || item.media_content_id || item.media_id || item.item_id || "",
        name: mediaItem?.name || item.name || item.media_title || "",
        artists,
        album,
      },
      image: item.image || flatImage || mediaItem?.image || album?.image || null,
      image_url: item.image_url || flatImage || mediaItem?.image_url || null,
      sort_index: Number.isFinite(sortIndex) ? sortIndex : (Number.isFinite(positionIndex) ? positionIndex : fallbackIndex),
      queue_item_id: item.queue_item_id || item.item_id || item.id || mediaItem?.uri || item.media_content_id || item.uri || String(fallbackIndex),
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
    const res = await this._callService("get_library", data);
    const raw = res?.response ?? res;
    return raw?.items ?? (Array.isArray(raw) ? raw : []);
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
      if (orderBy !== "sort_name") items = await this._fetchLibrary(mediaType, "sort_name", limit, favoritesOnly);
      else throw error;
    }
    this._cache.library.set(key, { ts: Date.now(), items });
    return items;
  }

  _radioBrowserCountryOptions() {
    const base = [
      ["all", this._m("All countries", "כל המדינות")],
      ["IL", this._m("Israel", "ישראל")],
      ["US", this._m("United States", "ארצות הברית")],
      ["GB", this._m("United Kingdom", "בריטניה")],
      ["DE", this._m("Germany", "גרמניה")],
      ["FR", this._m("France", "צרפת")],
      ["IT", this._m("Italy", "איטליה")],
      ["ES", this._m("Spain", "ספרד")],
      ["NL", this._m("Netherlands", "הולנד")],
      ["GR", this._m("Greece", "יוון")],
      ["TR", this._m("Turkey", "טורקיה")],
      ["CA", this._m("Canada", "קנדה")],
      ["AU", this._m("Australia", "אוסטרליה")],
    ];
    const current = this._mobileRadioBrowserCountry();
    if (current !== "all" && !base.some(([code]) => code === current)) {
      base.push([current, current]);
    }
    return base;
  }

  _mobileRadioBrowserCountry() {
    const value = String(this._state.mobileRadioBrowserCountry || "all").trim().toUpperCase();
    return value && value !== "ALL" ? value : "all";
  }

  _radioBrowserCountryLabel(code = "") {
    const normalized = String(code || "").trim().toUpperCase();
    if (!normalized || normalized === "ALL") return this._m("All countries", "כל המדינות");
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
      currentQueueItem?.provider,
      currentMedia?.name,
      currentQueueItem?.name,
      player?.attributes?.media_title,
      player?.attributes?.media_album_name,
      player?.attributes?.media_artist,
    ]
      .map((value) => String(value || "").toLowerCase())
      .filter(Boolean)
      .join(" | ");
    return /(radio|radiobrowser|radio_browser|stationuuid|station|tunein|streamurl|stream url|icy|webradio)/.test(haystack);
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
    this._toastSuccess(this._m("Radio station changed", "תחנת הרדיו הוחלפה"));
    return true;
  }

  _normalizeSearchResponse(raw) {
    const out = { radio: [], podcasts: [], albums: [], artists: [], tracks: [], playlists: [] };
    if (!raw) return out;
    const src = raw.response ?? raw;
    const readGroup = (value) => Array.isArray(value) ? value : (value?.items && Array.isArray(value.items) ? value.items : []);
    out.radio = readGroup(src.radio || src.radios);
    out.podcasts = readGroup(src.podcast || src.podcasts);
    out.albums = readGroup(src.album || src.albums);
    out.artists = readGroup(src.artist || src.artists);
    out.tracks = readGroup(src.track || src.tracks);
    out.playlists = readGroup(src.playlist || src.playlists);
    return out;
  }

  async _search(query) {
    const q = String(query || "").trim();
    if (!q) return { radio: [], podcasts: [], albums: [], artists: [], tracks: [], playlists: [] };
    let globalResults = { radio: [], podcasts: [], albums: [], artists: [], tracks: [], playlists: [] };
    try {
      const raw = await this._callService("search", { query: q, limit: 25 });
      globalResults = this._normalizeSearchResponse(raw);
    } catch (_) {
      try {
        const raw2 = await this._callService("search", { name: q, limit: 25, media_type: ["radio", "podcast", "album", "artist", "track", "playlist"] });
        globalResults = this._normalizeSearchResponse(raw2);
      } catch (_) {}
    }
    const hasGlobal = Object.values(globalResults).some((arr) => arr.length);
    if (hasGlobal) return globalResults;
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

  _connectMA() {
    if (!this._hasRealtimeDirectMA()) {
      this._state.wsReady = false;
      this._syncStatus();
      return;
    }
    if (this._ws) {
      try { this._ws.close(); } catch (_) {}
      this._ws = null;
    }
    const pageIsHttps = window.location.protocol === "https:";
    const maIsHttp = this._maUrl.startsWith("http://");
    if (pageIsHttps && maIsHttp) {
      this._state.wsReady = false;
      this._syncStatus();
      return;
    }
    const wsUrl = this._maUrl.replace(/^http:\/\//, "ws://").replace(/^https:\/\//, "wss://") + "/ws";
    try {
      const ws = new WebSocket(wsUrl);
      this._ws = ws;
      this._state.wsReady = false;
      this._syncStatus();
      ws.onmessage = (e) => {
        const msg = JSON.parse(e.data);
        if (msg.server_version && !msg.message_id) {
          ws.send(JSON.stringify({ message_id: "auth", command: "auth", args: { token: this._maToken } }));
          return;
        }
        if (msg.message_id === "auth") {
          this._state.wsReady = !!msg.result?.authenticated;
          this._syncStatus();
          return;
        }
        const pending = this._wsPending.get(msg.message_id);
        if (pending) {
          this._wsPending.delete(msg.message_id);
          if (msg.error_code) pending.reject(new Error(msg.details || `MA error ${msg.error_code}`));
          else pending.resolve(msg.result);
        }
      };
      ws.onerror = () => { this._state.wsReady = false; this._syncStatus(); };
      ws.onclose = () => {
        this._state.wsReady = false;
        this._syncStatus();
        setTimeout(() => { if (this.isConnected && this._hasRealtimeDirectMA()) this._connectMA(); }, 8000);
      };
    } catch (_) {
      this._state.wsReady = false;
      this._syncStatus();
    }
  }

  _wsSend(command, args = {}) {
    return new Promise((resolve, reject) => {
      if (!this._ws || !this._state.wsReady) return reject(new Error("MA WS not ready"));
      const id = String(++this._wsMsgId);
      this._wsPending.set(id, { resolve, reject });
      this._ws.send(JSON.stringify({ message_id: id, command, args }));
      setTimeout(() => {
        if (this._wsPending.has(id)) {
          this._wsPending.delete(id);
          reject(new Error("MA WS timeout"));
        }
      }, 10000);
    });
  }

  async _callDirectMaCommand(command, args = {}) {
    if (this._state.wsReady) {
      return this._wsSend(command, args);
    }
    if (!this._maUrl) {
      throw new Error("Direct Music Assistant API is not configured");
    }
    const headers = {
      "Content-Type": "application/json",
      "Accept": "application/json",
    };
    if (this._maToken) headers.Authorization = `Bearer ${this._maToken}`;
    const response = await fetch(`${this._maUrl}/api`, {
      method: "POST",
      credentials: "include",
      mode: "cors",
      headers,
      body: JSON.stringify({
        message_id: `rest_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        command,
        args,
      }),
    });
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
    return this._hass.connection.sendMessagePromise({
      type: "call_service",
      domain,
      service,
      service_data: { ...serviceData },
      return_response: !!returnResponse,
    });
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
    return this._hass.connection.sendMessagePromise(payload);
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
    let entities = Object.values(this._hass.states).filter((entity) => {
      if (!entity.entity_id.startsWith("media_player.")) return false;
      const a = entity.attributes || {};
      return a.app_id === "music_assistant" || a.mass_player_type || a.active_queue;
    });
    if (!entities.length) entities = Object.values(this._hass.states).filter((entity) => entity.entity_id.startsWith("media_player."));
    this._state.players = entities;
    if (!entities.length) {
      if (sel) sel.innerHTML = `<option value="">${this._esc(this._t("No players found"))}</option>`;
      return;
    }
    const rememberedThisDevice = this._getThisDevicePlayer(entities);
    const pinnedEntity = typeof this._resolvedPinnedPlayerEntity === "function" ? this._resolvedPinnedPlayerEntity(entities) : "";
    if (this._state.awaitingThisDevicePlayer) {
      const knownIds = new Set(this._state.knownBrowserPlayerIds || []);
      const browserPlayers = this._getBrowserPlayers(entities);
      const newcomer = browserPlayers.find((p) => !knownIds.has(p.entity_id));
      if (newcomer) {
        this._rememberThisDevicePlayer(newcomer.entity_id);
        this._state.awaitingThisDevicePlayer = false;
        this._state.knownBrowserPlayerIds = [];
        this._state.selectedPlayer = newcomer.entity_id;
        this._state.hasAutoSelectedPlayer = true;
        this._toast(this._t("This device player connected"));
      }
    }
    if (pinnedEntity) {
      this._state.selectedPlayer = pinnedEntity;
      this._state.hasAutoSelectedPlayer = true;
    } else {
      const currentStillExists = this._state.selectedPlayer && entities.some((p) => p.entity_id === this._state.selectedPlayer);
      if (!currentStillExists) this._state.selectedPlayer = null;
      if (!this._state.hasAutoSelectedPlayer && !this._state.selectedPlayer) {
        const activePlayers = entities.filter((p) => this._isPlayerActive(p));
        const preferred = rememberedThisDevice || activePlayers.find((p) => p.state === "playing") || activePlayers[0] || entities[0];
        if (preferred) {
          this._state.selectedPlayer = preferred.entity_id;
          this._state.hasAutoSelectedPlayer = true;
        }
      }
      if (!this._state.selectedPlayer && entities[0]) this._state.selectedPlayer = entities[0].entity_id;
    }
    if (sel) {
      sel.innerHTML = entities.map((entity) => {
        const active = this._isPlayerActive(entity) ? "● " : "";
        const name = entity.attributes.friendly_name || entity.entity_id;
        return `<option value="${this._esc(entity.entity_id)}">${this._esc(active + name)}</option>`;
      }).join("");
      sel.value = this._state.selectedPlayer || "";
    }
  }

  _getSelectedPlayer() {
    if (!this._state.selectedPlayer || !this._hass) return null;
    return this._hass.states[this._state.selectedPlayer] || null;
  }

  async _playMediaOnPlayer(entityId, uri, mediaType = "album", enqueue = "play", options = {}) {
    if (!entityId) return false;
    const label = this._mediaFeedbackLabel(uri, options.label || "");
    try {
      const shouldReplaceQueue = enqueue === "play" || enqueue === "shuffle";
      if (shouldReplaceQueue) {
        await this._clearQueueForPlayer(entityId);
      }
      if (enqueue === "shuffle") {
        await this._hass.callService("media_player", "shuffle_set", { entity_id: entityId, shuffle: true });
      }
      const serviceData = {
        entity_id: entityId,
        media_id: uri,
        media_type: mediaType,
        enqueue: enqueue === "shuffle" ? "play" : enqueue,
      };
      if (options.radioMode) serviceData.radio_mode = true;
      await this._hass.callService("music_assistant", "play_media", serviceData);
      if (!options.silent) {
        const targetPlayer = this._playerByEntityId(entityId);
        this._toastMediaQueued(label, targetPlayer?.attributes?.friendly_name || entityId);
      }
      if (entityId === this._state.selectedPlayer) setTimeout(() => this._ensureQueueSnapshot(true), 600);
      return true;
    } catch (_) {
      if (!options.silent) {
        this._toastError(this._isHebrew()
          ? `לא הצלחתי לנגן: ${label}`
          : `Could not play: ${label}`);
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
        : this._m("Started on selected player", "הופעל על הנגן הנבחר");
      (successCount ? this._toastSuccess : this._toastError).call(this, successCount ? successMessage : this._m("Could not start playback", "לא הצלחתי להתחיל ניגון"));
    }
    return successCount > 0;
  }

  async _playMedia(uri, mediaType = "album", enqueue = "play", options = {}) {
    if (!this._state.selectedPlayer) {
      this._toastError(this._t("Select a player first"));
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
    if (!this._state.selectedPlayer) return this._toast(this._t("Select a player first"));
    await this._clearQueueForPlayer(this._state.selectedPlayer);
    if (shuffle) {
      await this._hass.callService("media_player", "shuffle_set", { entity_id: this._state.selectedPlayer, shuffle: true });
    }
    await this._hass.callService("music_assistant", "play_media", {
      entity_id: this._state.selectedPlayer,
      media_id: items[0].uri,
      media_type: items[0].media_type || "album",
      enqueue: "play",
    });
    for (let i = 1; i < items.length; i++) {
      await this._hass.callService("music_assistant", "play_media", {
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
    this._hass.callService("media_player", player.state === "playing" ? "media_pause" : "media_play", { entity_id: player.entity_id });
  }

  _playerCmd(cmd) {
    const player = this._getSelectedPlayer();
    if (!player) return;
    const { queueItems, baseIndex } = this._mobileArtStackContext();
    const targetIndex = cmd === "previous" ? baseIndex - 1 : baseIndex + 1;
    const targetItem = Array.isArray(queueItems) ? queueItems[targetIndex] : null;
    if (targetItem) {
      this._setOptimisticMobileQueueItem(targetItem);
      this._refreshMobileArtStack(true);
      this._syncNowPlayingUI();
    }
    this._hass.callService("media_player", cmd === "previous" ? "media_previous_track" : "media_next_track", { entity_id: player.entity_id });
    setTimeout(() => this._ensureQueueSnapshot(true), 700);
    setTimeout(() => this._ensureQueueSnapshot(true), 1500);
    setTimeout(() => this._ensureQueueSnapshot(true), 2850);
  }

  async _playerCmdFor(entityId, cmd = "next") {
    const player = this._playerByEntityId(entityId);
    if (!player) return;
    const service = cmd === "previous" ? "media_previous_track" : "media_next_track";
    await this._hass.callService("media_player", service, { entity_id: player.entity_id });
    if (entityId === this._state.selectedPlayer) {
      setTimeout(() => this._ensureQueueSnapshot(true), 700);
      setTimeout(() => this._ensureQueueSnapshot(true), 1500);
    }
  }

  async _togglePlayFor(entityId) {
    if (!entityId) return;
    await this._hass.callService("media_player", "media_play_pause", { entity_id: entityId });
  }

  async _stepQueueByDelta(delta) {
    const player = this._getSelectedPlayer();
    const steps = Math.abs(Math.trunc(Number(delta) || 0));
    if (!player || !steps) return !steps;
    const service = delta > 0 ? "media_next_track" : "media_previous_track";
    for (let i = 0; i < steps; i += 1) {
      await this._hass.callService("media_player", service, { entity_id: player.entity_id });
      if (i < steps - 1) {
        await new Promise((resolve) => window.setTimeout(resolve, 85));
      }
    }
    return true;
  }

  _toggleShuffle() {
    const player = this._getSelectedPlayer();
    if (!player) return;
    this._hass.callService("media_player", "shuffle_set", { entity_id: player.entity_id, shuffle: !player.attributes.shuffle });
  }

  _toggleRepeat() {
    const player = this._getSelectedPlayer();
    if (!player) return;
    const modes = ["off", "one", "all"];
    const current = player.attributes.repeat || "off";
    const next = modes[(modes.indexOf(current) + 1) % modes.length];
    this._hass.callService("media_player", "repeat_set", { entity_id: player.entity_id, repeat: next });
  }

  _setVolume(level) {
    const player = this._getSelectedPlayer();
    if (!player) return;
    const normalized = Math.max(0, Math.min(1, Number(level) || 0));
    this._hass.callService("media_player", "volume_set", { entity_id: player.entity_id, volume_level: normalized });
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
    try {
      await this._hass.callService("media_player", "volume_mute", { entity_id: entityId, is_volume_muted: !currentlyMuted });
    } catch (_) {}
    if (!currentlyMuted) {
      this._softMutedPlayers.add(entityId);
      if (currentVolume > 0) this._setVolume(0);
    } else {
      this._softMutedPlayers.delete(entityId);
      const restoreVolume = this._lastVolumeByPlayer.get(entityId) ?? 0.35;
      if (currentVolume === 0) this._setVolume(restoreVolume);
      try {
        await this._hass.callService("media_player", "volume_mute", { entity_id: entityId, is_volume_muted: false });
      } catch (_) {}
    }
    setTimeout(() => this._syncNowPlayingUI(), 120);
  }

  _syncStatus() {
    const pill = this.$("statusPill");
    const text = this.$("statusText");
    if (!pill || !text) return;
    if (this._maToken && this._maUrl) {
      if (this._state.wsReady) {
        pill.classList.remove("offline");
        text.textContent = this._t("Connected");
      } else {
        pill.classList.add("offline");
        text.textContent = this._t("Connecting");
      }
    } else {
      pill.classList.remove("offline");
      text.textContent = this._t("Connected");
    }
  }

  _getCurrentDuration() {
    const player = this._getSelectedPlayer();
    return this._state.maQueueState?.current_item?.duration || player?.attributes?.media_duration || 0;
  }

  _getCurrentPosition() {
    const player = this._getSelectedPlayer();
    let position = this._state.maQueueState?.elapsed_time;
    if (position == null) position = player?.attributes?.media_position || 0;
    if (this._state.maQueueState && player?.state === "playing" && this._state.maQueueState.elapsed_time_last_updated) {
      const now = Date.now() / 1000;
      position += Math.max(0, now - this._state.maQueueState.elapsed_time_last_updated);
    } else if (player?.state === "playing" && player?.attributes?.media_position_updated_at) {
      const updatedAt = new Date(player.attributes.media_position_updated_at).getTime();
      if (!Number.isNaN(updatedAt)) {
        position += Math.max(0, (Date.now() - updatedAt) / 1000);
      }
    }
    return position || 0;
  }

  async _seekFromProgress(e) {
    const player = this._getSelectedPlayer();
    if (!player) return;
    const duration = this._getCurrentDuration();
    if (!duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newPos = Math.floor(duration * pct);
    clearTimeout(this._seekTimer);
    this._seekTimer = setTimeout(() => {
      this._hass.callService("media_player", "media_seek", { entity_id: player.entity_id, seek_position: newPos });
    }, 50);
  }

  _syncNowPlayingUI() {
    const player = this._getSelectedPlayer();
    if (!player) return;
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
    this.$("npTitle").textContent = queueTitle || player.attributes.media_title || this._t("Nothing playing");
    this.$("npSub").textContent = queueArtist || player.attributes.media_artist || "—";
    const art = queueArt || player.attributes.entity_picture_local || player.attributes.entity_picture;
    const artBox = this.$("npArt");
    if (art && artBox?.querySelector("img")?.getAttribute("src") !== art) artBox.innerHTML = `<img src="${this._esc(art)}" alt="">`;
    else if (!art) artBox.innerHTML = "♪";
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
  }

  _syncNowPlayingPageLive() {
    if (this._state.view !== "now_playing") return;
    const player = this._getSelectedPlayer();
    if (!player) return;
    const title = player.attributes.media_title || this._t("No active media");
    const artist = player.attributes.media_artist || this._t("Unknown");
    const album = player.attributes.media_album_name || "";
    const duration = this._getCurrentDuration();
    const position = this._getCurrentPosition();
    const pct = duration ? Math.min(100, (position / duration) * 100) : 0;
    const vol = Math.round((player.attributes.volume_level || 0) * 100);
    const art = player.attributes.entity_picture_local || player.attributes.entity_picture;
    const repeat = player.attributes.repeat || "off";
    const bigPlay = this.$("bigPlayBtn");
    this._setButtonIcon(bigPlay, this._playPauseIconName(player));
    const bigShuffle = this.$("bigShuffleBtn");
    if (bigShuffle) bigShuffle.classList.toggle("active", !!player.attributes.shuffle);
    const bigRepeat = this.$("bigRepeatBtn");
    if (bigRepeat) {
      bigRepeat.classList.toggle("active", repeat !== "off");
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
    if (heroArt) heroArt.innerHTML = art ? `<img src="${this._esc(art)}" alt="">` : "♪";
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
    this._syncNightModeUi();
    const player = this._getSelectedPlayer();
    if (!player) return;
    const duration = this._getCurrentDuration();
    if (this._state.lyricsOpen) this._syncLyricsHighlight();
    if (!duration) return;
    const position = this._getCurrentPosition();
    const pct = Math.min(100, (position / duration) * 100);
    this.$("progressFill") && (this.$("progressFill").style.width = `${pct}%`);
    this.$("bigProgressFill") && (this.$("bigProgressFill").style.width = `${pct}%`);
    this.$("bigCurTime") && (this.$("bigCurTime").textContent = this._fmtDur(position));
    this.$("bigTotalTime") && (this.$("bigTotalTime").textContent = this._fmtDur(duration));
  }

  async _updateNowPlayingState() {
    this._syncSleepTimerState();
    const player = this._getSelectedPlayer();
    if (!player) return;
    await this._ensureQueueSnapshot();
    this._refreshGroupingState();
    this._loadPlayers();
    this._syncNowPlayingUI();
    if (this._state.queueVisible) this._renderQueueItems();
    if (this._state.playerModalOpen) {
      if (this._state.modalMode === "transfer") this._openTransferQueuePicker(true);
      else this._renderPlayerModal();
    }
  }

  async _ensureQueueSnapshot(force = false) {
    const player = this._getSelectedPlayer();
    if (!player) return;
    const queueId = player.attributes.active_queue;
    if (queueId && this._hasDirectMAConnection()) {
      try {
        const queueState = await this._callDirectMaCommand("player_queues/get", { queue_id: queueId });
        let queueItems = [];
        if (force || !this._state.queueItems.length || this._state.view === "now_playing" || this._state.queueVisible) {
          const totalItems = Math.max(1, Number(queueState.items) || 0);
          const limit = Math.min(1000, Math.max(50, totalItems));
          const fullSnapshot = await this._callDirectMaCommand("player_queues/items", { queue_id: queueId, limit, offset: 0 });
          queueItems = Array.isArray(fullSnapshot)
            ? fullSnapshot.map((item, index) => this._normalizeQueueItem(item, index)).filter(Boolean)
            : [];
        }
        this._applyQueueSnapshot(queueState, queueItems, force);
        return;
      } catch (_) {}
    }

    try {
      const payload = { entity_id: player.entity_id, limit: 250 };
      if (queueId) payload.queue_id = queueId;
      const snapshot = await this._callService("get_queue", payload, { includeConfigEntryId: false });
      const normalized = this._normalizeQueueSnapshot(snapshot, player.entity_id);
      const queueData = normalized?.items?.length ? normalized : await this._fetchMassQueueItemsSnapshot(player);
      if (!queueData) return;
      this._applyQueueSnapshot(queueData.state, queueData.items, force);
    } catch (_) {
      const queueData = await this._fetchMassQueueItemsSnapshot(player);
      if (!queueData) return;
      this._applyQueueSnapshot(queueData.state, queueData.items, force);
    }
  }

  _queueItemImageUrl(item, size = 120) {
    return this._imageUrl(item?.media_image, size)
      || this._imageUrl(item?.image_url, size)
      || this._imageUrl(item?.image, size)
      || this._artUrl(item?.media_item || item)
      || this._imageUrl(item?.media_item?.image, size)
      || this._imageUrl(item?.media_item?.album?.image, size)
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
    if (subtitle) subtitle.textContent = selected?.attributes?.friendly_name || this._t("Choose Player");
    if (badge) badge.textContent = String(players.length);
    list.innerHTML = players.length ? players.map((p) => {
      const checked = (this._state.pendingGroupSelections || []).includes(p.entity_id);
      return `<label class="group-item ${checked ? "checked" : ""}"><span class="group-meta"><span class="group-name">${this._esc(p.attributes.friendly_name || p.entity_id)}</span><span class="group-sub"></span></span><input type="checkbox" data-group-player="${this._esc(p.entity_id)}" ${checked ? "checked" : ""}></label>`;
    }).join("") : `<div class="state-box" style="min-height:80px;padding:8px 0;">${this._esc(this._t("No extra MA players"))}</div>`;
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
    checkbox.closest(".group-item")?.classList.toggle("checked", checkbox.checked);
  }

  async _applySpeakerGroupFor(entityId, groupMembers = []) {
    if (!entityId) return;
    await this._hass.callService("media_player", "join", {
      entity_id: entityId,
      group_members: [...new Set((Array.isArray(groupMembers) ? groupMembers : []).filter((id) => id && id !== entityId))],
    });
  }

  async _applySpeakerGroup() {
    const player = this._getSelectedPlayer();
    if (!player) return;
    const groupMembers = [...(this._state.pendingGroupSelections || [])];
    await this._applySpeakerGroupFor(player.entity_id, groupMembers);
    this._toast(this._t("Group updated"));
    this._closeGroupModal();
    setTimeout(() => { this._refreshGroupingState(); if (this._state.view === "now_playing") this._renderNowPlayingPage(); }, 500);
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
        await Promise.allSettled(targets.map((id) => this._callHaServiceRaw("media_player", "unjoin", { entity_id: id })));
      }
      this._state.pendingGroupSelections = [];
      setTimeout(() => {
        this._loadPlayers();
        this._refreshGroupingState();
        if (this._state.menuOpen) this._renderMobileMenu();
      }, 500);
      return true;
    }
    try {
      await this._callHaServiceRaw("media_player", "unjoin", { entity_id: player.entity_id });
    } catch (_) {}
    this._state.pendingGroupSelections = [];
    setTimeout(() => { this._refreshGroupingState(); if (this._state.view === "now_playing") this._renderNowPlayingPage(); }, 500);
    return true;
  }

  async _clearSpeakerGroup() {
    const player = this._getSelectedPlayer();
    if (!player) return;
    await this._clearSpeakerGroupFor(player.entity_id);
    this._toast(this._t("Group cleared"));
    this._closeGroupModal();
  }

  _toggleQueue() {
    if (this._state.queueVisible) this._hideQueue();
    else this._showQueue();
  }

  async _showQueue() {
    const player = this._getSelectedPlayer();
    if (!player) return;
    this._state.queueVisible = true;
    this._hideQueue();
    const panel = document.createElement("div");
    panel.className = "queue-panel";
    panel.id = "queuePanel";
    const art = player.attributes.entity_picture_local || player.attributes.entity_picture;
    panel.innerHTML = `
      <div class="queue-shell">
      <div class="queue-header">
        <div class="queue-art">${art ? `<img src="${this._esc(art)}" alt="">` : "♪"}</div>
        <div class="queue-meta"><div class="queue-title">${this._esc(player.attributes.media_title || this._t("Queue"))}</div><div class="queue-sub" id="queueSub">${this._esc(player.attributes.media_artist || "")}</div></div>
        <button class="close-btn" id="queueClose">✕</button>
      </div>
      <div class="queue-scroll" id="queueScroll"><div class="state-box"><div><div class="spinner"></div><div>${this._esc(this._t("Loading queue..."))}</div></div></div></div>
      </div>`;
    this.shadowRoot.querySelector(".card")?.appendChild(panel);
    panel.querySelector("#queueClose").addEventListener("click", () => this._hideQueue());
    panel.addEventListener("click", this._boundQueuePanelClick);
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
        queueScroll.innerHTML = `<div class="state-box">${this._esc(this._t("Queue is empty"))}</div>`;
        return;
      }
      const currentIndex = queueState.current_index ?? 0;
      const totalItems = queueState.items ?? 0;
      const queueItems = this._state.queueItems || [];
      queueSub.textContent = `${player.attributes.media_artist || ""}${player.attributes.media_artist ? " · " : ""}${totalItems} ${this._t("items")}`;
      if (!Array.isArray(queueItems) || !queueItems.length) {
        queueScroll.innerHTML = `<div class="state-box">${this._esc(this._t("Queue is empty"))}</div>`;
        return;
      }
      queueScroll.innerHTML = queueItems.map((item, idx) => {
        const current = item.sort_index === currentIndex;
        const past = item.sort_index < currentIndex;
        const img = this._queueItemImageUrl(item, 120);
        const artist = item.media_item?.artists?.map((a) => a.name).join(", ") || "";
        const key = this._getQueueItemKey(item);
        return `
          <div class="queue-item ${current ? "active" : ""} ${past ? "past" : ""}" data-uri="${this._esc(item.media_item?.uri || "")}" data-type="track" data-queue-item-id="${this._esc(key)}" data-sort-index="${this._esc(item.sort_index ?? "")}">
            <div class="queue-num">${current ? "▶" : (item.sort_index ?? idx + 1)}</div>
            <div class="queue-thumb">${img ? `<img src="${this._esc(img)}" alt="">` : "♫"}</div>
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

  async _handleQueueAction(action, queueItemId) {
    const player = this._getSelectedPlayer();
    if (!player || !queueItemId || this._state.queueActionPending) return;

    const allItems = [...(this._state.queueItems || [])];
    const currentIndex = this._state.maQueueState?.current_index ?? 0;
    const currentPos = this._getCurrentPosition();
    const idx = allItems.findIndex((i) => this._getQueueItemKey(i) === String(queueItemId));
    if (idx === -1) return;

    try {
      this._setQueueBusy(true);
      const massQueueServiceByAction = {
        up: "move_queue_item_up",
        down: "move_queue_item_down",
        next: "move_queue_item_next",
        remove: "remove_queue_item",
      };
      const usedMassQueue = await this._callMassQueueService(massQueueServiceByAction[action], queueItemId);
      if (usedMassQueue) {
        await this._refreshQueueAfterMutation(140);
        return;
      }

      let reordered = [...allItems];
      if (action === "remove") {
        reordered.splice(idx, 1);
      } else if (action === "up") {
        const firstMovableIdx = reordered.findIndex((i) => (i.sort_index ?? Number.MAX_SAFE_INTEGER) > currentIndex);
        if (firstMovableIdx !== -1 && idx > firstMovableIdx) {
          [reordered[idx - 1], reordered[idx]] = [reordered[idx], reordered[idx - 1]];
        }
      } else if (action === "down") {
        if ((reordered[idx]?.sort_index ?? -1) > currentIndex && idx < reordered.length - 1) {
          [reordered[idx + 1], reordered[idx]] = [reordered[idx], reordered[idx + 1]];
        }
      } else if (action === "next") {
        const item = reordered[idx];
        const insertAfter = reordered.findIndex((i) => (i.sort_index ?? -1) === currentIndex);
        const targetIdx = Math.max(0, insertAfter + 1);
        if (item && idx > targetIdx) {
          reordered.splice(idx, 1);
          reordered.splice(targetIdx, 0, item);
        }
      }

      await this._rebuildQueue(player.entity_id, reordered, currentPos);
      await this._refreshQueueAfterMutation(180);
    } catch (e) {
      this._toast(e?.message || this._t("Queue action failed"));
    } finally {
      this._setQueueBusy(false);
    }
  }

  async _clearQueueForPlayer(entityId) {
    try {
      await this._hass.callService("media_player", "clear_playlist", { entity_id: entityId });
    } catch (_) {}
    try {
      await this._hass.callService("media_player", "media_stop", { entity_id: entityId });
    } catch (_) {}
  }

  async _rebuildQueue(targetEntityId, orderedItems, seekPosition = 0) {
    const currentIndex = this._state.maQueueState?.current_index ?? 0;
    const currentItem = orderedItems.find((i) => (i.sort_index ?? -1) === currentIndex) || orderedItems[0];
    const itemsAfterCurrent = orderedItems.filter((i) => i !== currentItem);

    const currentUri = this._getQueueItemUri(currentItem);
    if (!currentUri) throw new Error(this._t("No queue item to rebuild"));

    const uriList = [currentUri, ...itemsAfterCurrent.map((i) => this._getQueueItemUri(i)).filter(Boolean)];

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
    this.$("playerModalTitle").textContent = this._t("Transfer Queue");
    this._setPlayerModalHeader("transfer");
    const player = this._getSelectedPlayer();
    if (!player) return;
    const others = (this._state.players || []).filter((p) => p.entity_id !== player.entity_id);
    const body = this.$("playerModalBody");
    if (!body) return;
    if (!others.length) {
      body.innerHTML = `<div class="modal-section"><div class="state-box" style="min-height:120px;">${this._esc(this._t("No target players available"))}</div></div>`;
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
            <div class="modal-section-title">${this._t("Choose target player")}</div>
            <div class="modal-section-badge">${others.length}</div>
          </div>
          <div class="player-list">
            ${others.map((p) => `
              <button class="player-card ${p.state === "playing" ? "playing" : p.state === "paused" ? "paused" : "idle"}" data-transfer-player="${this._esc(p.entity_id)}">
                <span class="player-card-dot"></span>
                <span class="player-card-art">${(p.attributes?.entity_picture_local || p.attributes?.entity_picture) ? `<img src="${this._esc(p.attributes?.entity_picture_local || p.attributes?.entity_picture)}" alt="">` : `<span class="player-card-icon">${p.state === "playing" ? "▶" : p.state === "paused" ? "⏸" : "♪"}</span>`}</span>
                <span class="player-card-meta">
                  <span class="player-card-top">
                    <span class="player-card-title">${this._esc(p.attributes?.friendly_name || p.entity_id)}</span>
                    <span class="player-card-badge">${this._esc(this._playerStateLabel(p))}</span>
                  </span>
                  <span class="player-card-sub">${this._esc(this._playerStateLabel(p))}</span>
                  <span class="player-card-track">${this._esc(p.attributes?.media_title || "—")}</span>
                </span>
              </button>`).join("")}
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
        await this._hass.callService("music_assistant", "transfer_queue", {
          entity_id: targetPlayerEntityId,
          source_player: sourcePlayer.entity_id,
          auto_play: true,
        });
      } catch (_) {
        if (!usingSelectedSource || !items.length) throw _;
        await this._rebuildQueue(targetPlayerEntityId, items, currentPos);
        try {
          await this._hass.callService("media_player", "media_stop", { entity_id: sourcePlayer.entity_id });
        } catch (_) {}
      }

      if (options.selectTarget !== false) this._selectPlayer(targetPlayerEntityId, true);
      if (!options.silent) this._toast(this._t("Queue transferred"));
      setTimeout(() => this._ensureQueueSnapshot(true), 1200);
      return true;
    } catch (e) {
      if (!options.silent) this._toast(e?.message || this._t("Queue action failed"));
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
    if (!item || typeof item !== "object") return item;
    const imageUrl = this._artUrl(item);
    return imageUrl && item.image_url !== imageUrl ? { ...item, image_url: imageUrl } : item;
  }

  _imageProxyUrl(path, provider = "", size = 300) {
    if (!path) return null;
    if (/^(https?:|data:|blob:)/i.test(path)) return path;
    if (String(path).startsWith("/")) return String(path);
    if (!this._maUrl) return null;
    const providerKey = provider || "";
    return `${this._maUrl}/imageproxy?path=${encodeURIComponent(path)}${providerKey ? `&provider=${encodeURIComponent(providerKey)}` : ""}&size=${size}`;
  }

  _imageUrl(value, size = 300, seen = new Set(), depth = 0) {
    if (!value || depth > 5) return null;
    if (typeof value === "string") {
      const raw = String(value).trim();
      if (!raw) return null;
      if (/^(https?:|data:|blob:)/i.test(raw)) return raw;
      if (raw.startsWith("/")) return raw;
      if (raw.startsWith("imageproxy?")) return `/${raw}`;
      if (raw.startsWith("imageproxy/")) return `/${raw}`;
      if (raw.includes("/imageproxy?")) return raw;
      return this._imageProxyUrl(raw, "", size);
    }
    if (typeof value !== "object") return null;
    if (seen.has(value)) return null;
    seen.add(value);

    if (Array.isArray(value)) {
      for (const entry of value) {
        const resolved = this._imageUrl(entry, size, seen, depth + 1);
        if (resolved) return resolved;
      }
      return null;
    }

    if (value.url) return value.url;

    const rawPath = value.path || value.image_path || value.thumb_path || value.cover_path;
    if (rawPath) {
      return this._imageProxyUrl(
        rawPath,
        value.provider || value.provider_id || value.provider_instance || value.provider_domain || value.provider_name || "",
        size,
      );
    }

    const priorityKeys = [
      "image",
      "images",
      "image_url",
      "imageUrl",
      "thumb",
      "thumbnail",
      "small",
      "medium",
      "large",
      "cover",
      "cover_image",
      "artwork",
      "picture",
      "fanart",
      "square",
      "album",
      "media_item",
      "metadata",
    ];

    for (const key of priorityKeys) {
      const resolved = this._imageUrl(value[key], size, seen, depth + 1);
      if (resolved) return resolved;
    }

    for (const entry of Object.values(value)) {
      if (!entry || typeof entry !== "object") continue;
      const resolved = this._imageUrl(entry, size, seen, depth + 1);
      if (resolved) return resolved;
    }

    return null;
  }

  _artUrl(item) {
    return this._imageUrl(item?.image_url, 300)
      || this._imageUrl(item?.image, 300)
      || this._imageUrl(item?.album?.image_url, 300)
      || this._imageUrl(item?.album?.image, 300)
      || this._imageUrl(item?.metadata?.images, 300)
      || this._imageUrl(item?.album?.metadata?.images, 300)
      || null;
  }
  _artistName(item) { return Array.isArray(item?.artists) ? item.artists.map((a) => a.name).join(", ") : ""; }
  _fmtDur(sec) {
    if (!sec || Number.isNaN(sec)) return "0:00";
    const total = Math.floor(sec);
    const minutes = Math.floor(total / 60);
    const seconds = String(total % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
  }
  _esc(value) {
    return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  _toast(message, variant = "info") {
    const wrap = this.$("toastWrap");
    if (!wrap) return;
    const el = document.createElement("div");
    const safeVariant = ["success", "error", "info"].includes(variant) ? variant : "info";
    el.className = `toast ${safeVariant}`;
    const icon = safeVariant === "success" ? "✓" : safeVariant === "error" ? "×" : "i";
    el.innerHTML = `<span class="toast-icon">${icon}</span><span class="toast-text">${this._esc(message)}</span>`;
    wrap.appendChild(el);
    setTimeout(() => el.remove(), 3300);
  }

  _toastSuccess(message) {
    this._toast(message, "success");
  }

  _toastError(message) {
    this._toast(message, "error");
  }

  _showSurprisePopup(item = {}) {
    const host = this.$("surprisePopup");
    if (!host) return;
    const playerName = this._selectedPlayerName();
    const art = this._artUrl(item) || item?.image || item?.media_item?.image || item?.media_item?.album?.image || "";
    const title = item?.name || this._m("Random playlist", "פלייליסט אקראי");
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
    return player?.attributes?.friendly_name || player?.entity_id || this._t("Choose Player");
  }

  _mediaFeedbackLabel(uri = "", fallback = "") {
    const text = String(fallback || "").trim();
    if (text) return text;
    const normalizedUri = String(uri || "").trim();
    if (!normalizedUri) return this._t("Media");
    const queueHit = (this._state.queueItems || []).find((item) => this._getQueueItemUri(item) === normalizedUri);
    if (queueHit?.media_item?.name) return queueHit.media_item.name;
    const separator = normalizedUri.lastIndexOf("/");
    if (separator >= 0 && separator < normalizedUri.length - 1) return decodeURIComponent(normalizedUri.slice(separator + 1));
    return normalizedUri;
  }

  _toastMediaQueued(label, targetName) {
    const mediaLabel = this._mediaFeedbackLabel("", label);
    const target = String(targetName || "").trim() || this._selectedPlayerName();
    const message = this._isHebrew()
      ? `נבחר: ${mediaLabel} · יעד: ${target}`
      : `Selected: ${mediaLabel} · Target: ${target}`;
    this._toastSuccess(message);
  }

  _hydrateImages() {
    const root = this.$("content");
    if (!root) return;
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
    if (!url || !el?.isConnected) {
      if (el?.isConnected) el.innerHTML = `<div class="media-placeholder">${fallback}</div>`;
      return;
    }
    if (this._imageFailed.has(url)) {
      if (el.isConnected) el.innerHTML = `<div class="media-placeholder">${fallback}</div>`;
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
      if (el.isConnected) el.innerHTML = `<div class="media-placeholder">${fallback}</div>`;
    }
  }

  disconnectedCallback() {
    clearInterval(this._pollTimer);
    clearInterval(this._progressTimer);
    clearTimeout(this._searchTimer);
    clearTimeout(this._volumeTimer);
    clearTimeout(this._bigVolumeTimer);
    clearTimeout(this._seekTimer);
    if (this._imgObserver) {
      this._imgObserver.disconnect();
      this._imgObserver = null;
    }
    if (this._ws) {
      try { this._ws.onclose = null; this._ws.close(); } catch (_) {}
      this._ws = null;
    }
    if (this._ctxMenu) {
      this._ctxMenu.remove();
      this._ctxMenu = null;
    }
    document.removeEventListener("click", this._boundDocClick);
    if (this._resizeListening) {
      window.removeEventListener("resize", this._boundWindowResize);
      this._resizeListening = false;
    }
    this._imageBlobCache.clear();
    this._imageFailed.clear();
  }
}

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

const HOMEII_CARD_VERSION = "4.7.6";
const HOMEII_BROWSER_EDITOR_TAG = "homeii-music-flow-browser-editor-v5000";
const HOMEII_MOBILE_EDITOR_TAG = "homeii-music-flow-editor-v5000";

function detectEditorHebrew() {
  try {
    const lang =
      document?.querySelector("home-assistant")?.hass?.locale?.language
      || document?.querySelector("home-assistant")?.hass?.language
      || document?.documentElement?.lang
      || "";
    return String(lang).toLowerCase().startsWith("he");
  } catch (_) {
    return false;
  }
}

function assertStringIfDefined(value, key) {
  if (value == null) return;
  if (typeof value !== "string") throw new Error(`${key} must be a string`);
}

function assertBooleanIfDefined(value, key) {
  if (value == null) return;
  if (typeof value !== "boolean") throw new Error(`${key} must be a boolean`);
}

function assertNumberIfDefined(value, key) {
  if (value == null) return;
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new Error(`${key} must be a number`);
  }
}

function assertStringArrayIfDefined(value, key) {
  if (value == null) return;
  if (!Array.isArray(value) || value.some((entry) => typeof entry !== "string")) {
    throw new Error(`${key} must be an array of strings`);
  }
}

function assertValueInList(value, key, allowedValues) {
  if (value == null) return;
  if (!allowedValues.includes(value)) {
    throw new Error(`${key} must be one of: ${allowedValues.join(", ")}`);
  }
}

function validateBaseCardEditorConfig(config) {
  if (!config || typeof config !== "object" || Array.isArray(config)) {
    throw new Error("Card config must be an object");
  }

  assertStringIfDefined(config.config_entry_id, "config_entry_id");
  assertStringIfDefined(config.ma_url, "ma_url");
  assertStringIfDefined(config.ma_token, "ma_token");
  assertStringIfDefined(config.ma_interface_url, "ma_interface_url");
  assertValueInList(config.ma_interface_target, "ma_interface_target", ["_self", "_blank"]);
  assertNumberIfDefined(config.height, "height");
  assertNumberIfDefined(config.main_opacity, "main_opacity");
  assertNumberIfDefined(config.popup_opacity, "popup_opacity");
  assertNumberIfDefined(config.cache_ttl, "cache_ttl");
  assertValueInList(config.language, "language", ["auto", "he", "en"]);
  assertValueInList(config.theme_mode, "theme_mode", ["auto", "dark", "light"]);
  assertBooleanIfDefined(config.rtl, "rtl");
  assertBooleanIfDefined(config.show_ma_button, "show_ma_button");
  assertBooleanIfDefined(config.show_theme_toggle, "show_theme_toggle");
}

function validateMobileCardEditorConfig(config) {
  validateBaseCardEditorConfig(config);

  assertValueInList(config.layout_mode, "layout_mode", ["auto", "mobile", "tablet"]);
  assertValueInList(config.settings_source, "settings_source", ["device", "visual", "ui", "card"]);
  assertValueInList(config.night_mode, "night_mode", ["off", "auto", "on"]);
  assertStringIfDefined(config.night_mode_auto_start, "night_mode_auto_start");
  assertStringIfDefined(config.night_mode_auto_end, "night_mode_auto_end");
  assertStringIfDefined(config.favorite_button_entity, "favorite_button_entity");
  assertBooleanIfDefined(config.allow_local_likes, "allow_local_likes");
  assertBooleanIfDefined(config.use_mass_queue_send_command, "use_mass_queue_send_command");
  assertStringIfDefined(config.mobile_custom_color, "mobile_custom_color");
  assertValueInList(config.mobile_dynamic_theme_mode, "mobile_dynamic_theme_mode", ["off", "auto", "strong"]);
  assertValueInList(config.mobile_background_motion_mode, "mobile_background_motion_mode", ["off", "subtle", "strong"]);
  assertValueInList(config.mobile_custom_text_tone, "mobile_custom_text_tone", ["light", "dark"]);
  assertNumberIfDefined(config.mobile_font_scale, "mobile_font_scale");
  assertBooleanIfDefined(config.mobile_footer_search_enabled, "mobile_footer_search_enabled");
  assertValueInList(config.mobile_footer_mode, "mobile_footer_mode", ["icon", "text", "both"]);
  assertBooleanIfDefined(config.mobile_home_shortcut, "mobile_home_shortcut");
  assertValueInList(config.mobile_volume_mode, "mobile_volume_mode", ["always", "button"]);
  assertValueInList(config.mobile_mic_mode, "mobile_mic_mode", ["on", "off", "smart"]);
  assertStringArrayIfDefined(config.mobile_library_tabs, "mobile_library_tabs");
  assertStringArrayIfDefined(config.mobile_main_bar_items, "mobile_main_bar_items");
  assertValueInList(config.mobile_liked_mode, "mobile_liked_mode", ["ma", "local"]);
  assertValueInList(config.mobile_swipe_mode, "mobile_swipe_mode", ["play", "browse"]);
  assertStringIfDefined(config.mobile_radio_browser_country, "mobile_radio_browser_country");
  assertStringArrayIfDefined(config.mobile_announcement_presets, "mobile_announcement_presets");
  assertStringIfDefined(config.announcement_tts_entity, "announcement_tts_entity");
  assertBooleanIfDefined(config.mobile_compact_mode, "mobile_compact_mode");
  assertBooleanIfDefined(config.mobile_show_up_next, "mobile_show_up_next");
  assertStringIfDefined(config.pinned_player_entity, "pinned_player_entity");
}

function getBaseCardConfigForm() {
  const he = detectEditorHebrew();
  return {
    schema: [
      {
        type: "expandable",
        name: "general_section",
        title: he ? "כללי ותצוגה" : "General and Display",
        flatten: true,
        schema: [
          {
            type: "grid",
            name: "general_grid",
            flatten: true,
            column_min_width: "220px",
            schema: [
              { name: "height", selector: { number: { min: 360, max: 1400, step: 10, mode: "box" } } },
              { name: "language", selector: { select: { mode: "dropdown", options: [
                { value: "auto", label: "Auto" },
                { value: "he", label: he ? "עברית" : "Hebrew" },
                { value: "en", label: he ? "אנגלית" : "English" },
              ] } } },
              { name: "theme_mode", selector: { select: { mode: "dropdown", options: [
                { value: "auto", label: "Auto" },
                { value: "dark", label: he ? "כהה" : "Dark" },
                { value: "light", label: he ? "בהיר" : "Light" },
              ] } } },
              { name: "rtl", selector: { boolean: {} } },
              { name: "main_opacity", selector: { number: { min: 0.3, max: 1, step: 0.02, mode: "box" } } },
              { name: "popup_opacity", selector: { number: { min: 0.4, max: 1, step: 0.02, mode: "box" } } },
            ],
          },
        ],
      },
      {
        type: "expandable",
        name: "connection_section",
        title: he ? "חיבור והתנהגות" : "Connection and Behavior",
        flatten: true,
        schema: [
          {
            type: "grid",
            name: "connection_grid",
            flatten: true,
            column_min_width: "220px",
            schema: [
              { name: "config_entry_id", selector: { text: {} } },
              { name: "ma_url", selector: { text: { type: "url" } } },
              { name: "ma_token", selector: { text: {} } },
              { name: "ma_interface_url", selector: { text: {} } },
              { name: "ma_interface_target", selector: { select: { mode: "dropdown", options: [
                { value: "_self", label: "_self" },
                { value: "_blank", label: "_blank" },
              ] } } },
              { name: "show_ma_button", selector: { boolean: {} } },
              { name: "show_theme_toggle", selector: { boolean: {} } },
              { name: "cache_ttl", selector: { number: { min: 0, max: 3600000, step: 1000, mode: "box" } } },
            ],
          },
        ],
      },
    ],
    computeLabel: (schema) => ({
      config_entry_id: "Config Entry ID",
      ma_url: he ? "כתובת Music Assistant" : "Music Assistant URL",
      ma_token: he ? "טוקן Music Assistant" : "Music Assistant token",
      ma_interface_url: he ? "נתיב ממשק MA" : "MA interface path",
      ma_interface_target: he ? "פתיחת ממשק" : "Open interface in",
      show_ma_button: he ? "כפתור MA" : "Show MA button",
      show_theme_toggle: he ? "כפתור ערכת נושא" : "Show theme toggle",
      cache_ttl: he ? "זמן קאש" : "Cache TTL",
      height: he ? "גובה הכרטיס" : "Card height",
      language: he ? "שפה" : "Language",
      theme_mode: he ? "ערכת נושא" : "Theme mode",
      night_mode: he ? "מצב לילה" : "Night mode",
      night_mode_auto_start: he ? "שעת התחלה ללילה" : "Night start time",
      night_mode_auto_end: he ? "שעת סיום ללילה" : "Night end time",
      mobile_show_up_next: he ? "הצגת הבא בתור" : "Show Up Next",
      rtl: "RTL",
      main_opacity: he ? "שקיפות ראשית" : "Main opacity",
      popup_opacity: he ? "שקיפות חלונות" : "Popup opacity",
    })[schema.name],
    computeHelper: (schema) => ({
      config_entry_id: he ? "מזהה ה־config entry של Music Assistant, אם רוצים קישור ישיר דרך Home Assistant." : "Music Assistant config entry id, if you want direct integration lookup through Home Assistant.",
      ma_url: he ? "השאר ריק אם הכרטיס ניגש ל־Music Assistant דרך Home Assistant בלבד." : "Leave empty if the card should use Home Assistant only.",
      ma_token: he ? "נדרש רק אם אתה עובד מול כתובת MA ישירה." : "Only needed when using a direct Music Assistant URL.",
      ma_interface_url: he ? "נתיב לפתיחת ממשק Music Assistant." : "Path used when opening the Music Assistant interface.",
      cache_ttl: he ? "משך הקאש במילישניות עבור קריאות נתונים מסוימות." : "Cache duration in milliseconds for selected data requests.",
      height: he ? "גובה הכרטיס בפיקסלים." : "Card height in pixels.",
      main_opacity: he ? "שקיפות הרקע הראשי של הכרטיס." : "Opacity for the main card background.",
      popup_opacity: he ? "שקיפות חלונות וקופצים." : "Opacity for popups and overlays.",
    })[schema.name],
    assertConfig: (config) => {
      if (!config || typeof config !== "object" || Array.isArray(config)) {
        throw new Error("Card config must be an object");
      }
    },
  };
}

function getMobileEditorTexts() {
  const he = detectEditorHebrew();
  return {
    sections: {
      general: he ? "כללי" : "General",
      display: he ? "תצוגה ומובייל" : "Display and Mobile",
      connection: he ? "חיבור והתנהגות" : "Connection and Behavior",
      mainbar: he ? "סרגל ראשי" : "Main Bar",
      library: he ? "דפי ספרייה" : "Library Tabs",
      announcements: he ? "כריזה" : "Announcements",
    },
    labels: {
      settings_source: he ? "מקור ההגדרות" : "Settings source",
      layout_mode: he ? "מצב פריסה" : "Layout mode",
      height: he ? "גובה הכרטיס" : "Card height",
      main_opacity: he ? "שקיפות ראשית" : "Main opacity",
      popup_opacity: he ? "שקיפות חלונות" : "Popup opacity",
      language: he ? "שפה" : "Language",
      theme_mode: he ? "ערכת נושא" : "Theme mode",
      rtl: "RTL",
      mobile_custom_color: he ? "צבע מוביל" : "Accent color",
      mobile_dynamic_theme_mode: he ? "ערכת נושא דינמית" : "Dynamic theme",
      mobile_background_motion_mode: he ? "תנועת רקע" : "Background motion",
      mobile_custom_text_tone: he ? "טון טקסט" : "Text tone",
      mobile_font_scale: he ? "סקייל פונט" : "Font scale",
      mobile_compact_mode: he ? "מצב קומפקטי" : "Compact mode",
      mobile_swipe_mode: he ? "סוויפ על עטיפה" : "Artwork swipe",
      mobile_footer_search_enabled: he ? "חיפוש בפוטר" : "Footer search",
      mobile_mic_mode: he ? "מיקרופון" : "Microphone",
      mobile_footer_mode: he ? "סגנון פוטר" : "Footer style",
      mobile_home_shortcut: he ? "כפתור בית" : "Home shortcut",
      mobile_volume_mode: he ? "בקרת ווליום" : "Volume mode",
      mobile_liked_mode: he ? "מצב אהבתי" : "Liked mode",
      mobile_radio_browser_country: he ? "מדינת רדיו" : "Radio Browser country",
      mobile_main_bar_items: he ? "פריטי סרגל ראשי" : "Main bar items",
      mobile_library_tabs: he ? "טאבי ספרייה" : "Library tabs",
      mobile_announcement_presets: he ? "משפטי כריזה" : "Announcement presets",
      announcement_tts_entity: he ? "ישות TTS" : "TTS entity",
      pinned_player_entity: he ? "נגן מקובע" : "Pinned player",
      config_entry_id: "Config Entry ID",
      ma_url: he ? "כתובת Music Assistant" : "Music Assistant URL",
      ma_token: he ? "טוקן Music Assistant" : "Music Assistant token",
      favorite_button_entity: he ? "ישות כפתור Like" : "Favorite button entity",
      ma_interface_url: he ? "נתיב ממשק MA" : "MA interface path",
      ma_interface_target: he ? "פתיחת ממשק" : "Open interface in",
      show_ma_button: he ? "כפתור MA" : "Show MA button",
      show_theme_toggle: he ? "כפתור ערכת נושא" : "Show theme toggle",
      cache_ttl: he ? "זמן קאש" : "Cache TTL",
      allow_local_likes: he ? "אהבתי מקומי" : "Allow local likes",
      use_mass_queue_send_command: he ? "Fallback mass_queue/send_command" : "mass_queue/send_command fallback",
    },
    helpers: {
      settings_source: he ? "בחר אם ההגדרות נשלטות מתוך ה־UI בכרטיס או מתוך הגדרות הכרטיס בדשבורד." : "Choose whether settings are controlled from the in-card UI or from the card configuration in the dashboard.",
      layout_mode: he ? "Auto בוחר מובייל או טאבלט לפי רוחב בפועל." : "Auto chooses mobile or tablet based on actual width.",
      theme_mode: he ? "כולל גם מצב אישי כמו במסך ההגדרות של הכרטיס." : "Includes the custom theme mode from the in-card settings screen.",
      night_mode: he ? "Off מכבה, On מפעיל תמיד, ו־Auto פועל לפי חלון השעות שהגדרת." : "Off disables it, On keeps it active, and Auto follows the configured time window.",
      night_mode_auto_start: he ? "פורמט מומלץ: HH:MM כמו 22:00." : "Recommended format: HH:MM such as 22:00.",
      night_mode_auto_end: he ? "פורמט מומלץ: HH:MM כמו 06:00. אפשר לחצות חצות." : "Recommended format: HH:MM such as 06:00. Crossing midnight is supported.",
      mobile_show_up_next: he ? "מציג או מסתיר את שורת השיר הבא במסך הניגון." : "Show or hide the inline next-track row in Now Playing.",
      mobile_dynamic_theme_mode: he ? "מחלץ צבעים מעטיפת האלבום ומחיל אותם על הממשק." : "Extract colors from the current artwork and apply them to the interface.",
      mobile_background_motion_mode: he ? "שולט אם רקע הכרטיס נע בעדינות, ובאיזו עוצמה." : "Control whether the card background moves gently, and how strong the motion feels.",
      mobile_font_scale: he ? "אותו טווח גודל שקיים במסך ההגדרות." : "Same font-size range used in the in-card settings screen.",
      mobile_compact_mode: he ? "מציג נגן אריח עצמאי וקומפקטי עם עטיפה, פקדי בסיס, ווליום וכפתור הרחבה." : "Shows a standalone compact player tile with artwork, basic controls, volume and an expand action.",
      mobile_swipe_mode: he ? "קובע האם סוויפ על עטיפת האלבום יעביר שיר או ידפדף עטיפות." : "Choose whether artwork swipe changes track or browses covers.",
      mobile_footer_search_enabled: he ? "מפעיל או מכבה את כפתור החיפוש בפוטר." : "Enable or disable the footer search button.",
      mobile_mic_mode: he ? "זהה לבחירת המיקרופון במסך ההגדרות." : "Matches the microphone setting from the in-card settings screen.",
      mobile_footer_mode: he ? "קובע אם הפוטר יוצג כאייקונים, טקסט או שניהם." : "Choose icons, text, or both for the footer.",
      mobile_home_shortcut: he ? "מפעיל את כפתור הבית הצף." : "Enable the floating home shortcut button.",
      mobile_volume_mode: he ? "רלוונטי במיוחד במסכים גדולים." : "Mainly relevant on larger layouts.",
      mobile_liked_mode: he ? "מצב Local שימושי רק אם Local likes מופעל." : "Local mode is only meaningful when local likes are enabled.",
      mobile_radio_browser_country: he ? "אותה רשימת מדינות בסיסית שמופיעה במסך ההגדרות." : "Uses the same base country list shown in the in-card settings screen.",
      mobile_main_bar_items: he ? "בחר אילו כפתורים יופיעו בסרגל הראשי." : "Choose which actions appear in the main bar.",
      mobile_library_tabs: he ? "בחר אילו טאבים יהיו זמינים במסך הספרייה." : "Choose which tabs are available in the library screen.",
      mobile_announcement_presets: he ? "אפשר להגדיר כמה משפטי כריזה מוכנים מראש." : "Configure ready-made announcement phrases.",
      mobile_custom_color: he ? "בחר צבע בסיס לעיצוב המובייל." : "Choose the accent color for the mobile layout.",
      favorite_button_entity: he ? "ישות אופציונלית לכפתור Like חיצוני." : "Optional entity used for an external favorite button.",
      announcement_tts_entity: he ? "ישות TTS שתשמש למסך הכריזה." : "TTS entity used by the announcement screen.",
      pinned_player_entity: he ? "כשנבחר נגן, הכרטיס יישאר עליו ולא יאפשר מעבר לנגנים אחרים מתוך ה־UI." : "When selected, the card stays locked to this player and disables switching to other players from the UI.",
      allow_local_likes: he ? "מפעיל אפשרות לעבור ל־Liked mode מקומי." : "Enables switching to local liked mode.",
      use_mass_queue_send_command: he ? "Fallback למערכות שבהן תור ההשמעה דורש נתיב service חלופי." : "Fallback for setups that need an alternate queue service path.",
    },
    options: {
      settings_source: [
        { value: "ui", label: he ? "מה־UI בתוך הכרטיס" : "In-card UI" },
        { value: "card", label: he ? "מהגדרות הכרטיס" : "Card configuration" },
      ],
      layout_mode: [
        { value: "auto", label: "Auto" },
        { value: "mobile", label: he ? "מובייל" : "Mobile" },
        { value: "tablet", label: he ? "טאבלט" : "Tablet" },
      ],
      language: [
        { value: "auto", label: "Auto" },
        { value: "he", label: he ? "עברית" : "Hebrew" },
        { value: "en", label: he ? "אנגלית" : "English" },
      ],
      theme_mode: [
        { value: "auto", label: "Auto" },
        { value: "dark", label: he ? "כהה" : "Dark" },
        { value: "light", label: he ? "בהיר" : "Light" },
        { value: "custom", label: he ? "אישי" : "Custom" },
      ],
      night_mode: [
        { value: "off", label: he ? "כבוי" : "Off" },
        { value: "auto", label: "Auto" },
        { value: "on", label: he ? "פעיל" : "On" },
      ],
      mobile_custom_text_tone: [
        { value: "light", label: he ? "בהיר" : "Light" },
        { value: "dark", label: he ? "כהה" : "Dark" },
      ],
      mobile_dynamic_theme_mode: [
        { value: "off", label: he ? "כבוי" : "Off" },
        { value: "auto", label: "Auto" },
        { value: "strong", label: he ? "חזק" : "Strong" },
      ],
      mobile_background_motion_mode: [
        { value: "off", label: he ? "כבוי" : "Off" },
        { value: "subtle", label: he ? "עדין" : "Subtle" },
        { value: "strong", label: he ? "חזק" : "Strong" },
      ],
      mobile_swipe_mode: [
        { value: "play", label: he ? "מעביר שיר" : "Change track" },
        { value: "browse", label: he ? "מדפדף עטיפות" : "Browse covers" },
      ],
      mobile_mic_mode: [
        { value: "on", label: he ? "פעיל" : "On" },
        { value: "off", label: he ? "כבוי" : "Off" },
        { value: "smart", label: he ? "חכם" : "Smart" },
      ],
      mobile_footer_mode: [
        { value: "icon", label: he ? "אייקון בלבד" : "Icon only" },
        { value: "text", label: he ? "מלל בלבד" : "Text only" },
        { value: "both", label: he ? "אייקון ומלל" : "Icon + text" },
      ],
      mobile_volume_mode: [
        { value: "button", label: he ? "כפתור" : "Button" },
        { value: "always", label: he ? "פעיל תמיד" : "Always visible" },
      ],
      mobile_liked_mode: [
        { value: "ma", label: "Music Assistant" },
        { value: "local", label: he ? "מקומי" : "Local" },
      ],
      ma_interface_target: [
        { value: "_self", label: "_self" },
        { value: "_blank", label: "_blank" },
      ],
      mobile_main_bar_items: [
        { value: "search", label: he ? "חיפוש" : "Search" },
        { value: "library", label: he ? "ספרייה" : "Library" },
        { value: "players", label: he ? "נגנים" : "Players" },
        { value: "actions", label: he ? "פעולות" : "Actions" },
        { value: "settings", label: he ? "הגדרות" : "Settings" },
        { value: "theme", label: he ? "שמש / ירח" : "Theme toggle" },
      ],
      mobile_library_tabs: [
        { value: "library_search", label: he ? "חיפוש" : "Search" },
        { value: "library_playlists", label: he ? "פלייליסטים" : "Playlists" },
        { value: "library_artists", label: he ? "אמנים" : "Artists" },
        { value: "library_albums", label: he ? "אלבומים" : "Albums" },
        { value: "library_tracks", label: he ? "שירים" : "Tracks" },
        { value: "library_radio", label: he ? "רדיו" : "Radio" },
        { value: "library_podcasts", label: he ? "פודקאסטים" : "Podcasts" },
        { value: "library_liked", label: he ? "אהבתי" : "Liked" },
      ],
    },
  };
}

function getRadioBrowserCountrySelectorOptions() {
  const he = detectEditorHebrew();
  return [
    { value: "all", label: he ? "כל המדינות" : "All countries" },
    { value: "IL", label: he ? "ישראל" : "Israel" },
    { value: "US", label: he ? "ארצות הברית" : "United States" },
    { value: "GB", label: he ? "בריטניה" : "United Kingdom" },
    { value: "DE", label: he ? "גרמניה" : "Germany" },
    { value: "FR", label: he ? "צרפת" : "France" },
    { value: "IT", label: he ? "איטליה" : "Italy" },
    { value: "ES", label: he ? "ספרד" : "Spain" },
    { value: "NL", label: he ? "הולנד" : "Netherlands" },
    { value: "GR", label: he ? "יוון" : "Greece" },
    { value: "TR", label: he ? "טורקיה" : "Turkey" },
    { value: "CA", label: he ? "קנדה" : "Canada" },
    { value: "AU", label: he ? "אוסטרליה" : "Australia" },
  ];
}

function normalizeSettingsSource(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (["card", "visual", "config", "card_config", "editor"].includes(normalized)) return "card";
  if (["ui", "device", "local", "in_card"].includes(normalized)) return "ui";
  return "ui";
}

function getMobileCardConfigForm() {
  const t = getMobileEditorTexts();
  return {
    schema: [
      {
        type: "expandable",
        name: "general_section",
        title: t.sections.general,
        flatten: true,
        schema: [
          {
            type: "grid",
            name: "general_grid",
            flatten: true,
            column_min_width: "220px",
            schema: [
              { name: "settings_source", selector: { select: { mode: "dropdown", options: t.options.settings_source } } },
              { name: "layout_mode", selector: { select: { mode: "dropdown", options: t.options.layout_mode } } },
              { name: "height", selector: { number: { min: 480, max: 1400, step: 10, mode: "box" } } },
              { name: "main_opacity", selector: { number: { min: 0.3, max: 1, step: 0.02, mode: "slider" } } },
              { name: "popup_opacity", selector: { number: { min: 0.4, max: 1, step: 0.02, mode: "slider" } } },
              { name: "language", selector: { select: { mode: "dropdown", options: t.options.language } } },
              { name: "theme_mode", selector: { select: { mode: "dropdown", options: t.options.theme_mode } } },
              { name: "night_mode", selector: { select: { mode: "dropdown", options: t.options.night_mode } } },
              { name: "night_mode_auto_start", selector: { text: {} } },
              { name: "night_mode_auto_end", selector: { text: {} } },
              { name: "mobile_show_up_next", selector: { boolean: {} } },
              { name: "rtl", selector: { boolean: {} } },
              { name: "mobile_compact_mode", selector: { boolean: {} } },
              { name: "pinned_player_entity", selector: { entity: { multiple: false, filter: [{ domain: "media_player" }] } } },
            ],
          },
        ],
      },
      {
        type: "expandable",
        name: "display_section",
        title: t.sections.display,
        flatten: true,
        schema: [
          {
            type: "grid",
            name: "display_grid",
            flatten: true,
            column_min_width: "220px",
            schema: [
              { name: "mobile_custom_color", selector: { text: { type: "color" } } },
              { name: "mobile_dynamic_theme_mode", selector: { select: { mode: "dropdown", options: t.options.mobile_dynamic_theme_mode } } },
              { name: "mobile_background_motion_mode", selector: { select: { mode: "dropdown", options: t.options.mobile_background_motion_mode } } },
              { name: "mobile_custom_text_tone", selector: { select: { mode: "dropdown", options: t.options.mobile_custom_text_tone } } },
              { name: "mobile_font_scale", selector: { number: { min: 0.9, max: 1.3, step: 0.05, mode: "slider" } } },
              { name: "mobile_swipe_mode", selector: { select: { mode: "dropdown", options: t.options.mobile_swipe_mode } } },
              { name: "mobile_footer_search_enabled", selector: { boolean: {} } },
              { name: "mobile_mic_mode", selector: { select: { mode: "dropdown", options: t.options.mobile_mic_mode } } },
              { name: "mobile_footer_mode", selector: { select: { mode: "dropdown", options: t.options.mobile_footer_mode } } },
              { name: "mobile_home_shortcut", selector: { boolean: {} } },
              { name: "mobile_volume_mode", selector: { select: { mode: "dropdown", options: t.options.mobile_volume_mode } } },
              { name: "mobile_liked_mode", selector: { select: { mode: "dropdown", options: t.options.mobile_liked_mode } } },
              { name: "mobile_radio_browser_country", selector: { select: { mode: "dropdown", options: getRadioBrowserCountrySelectorOptions() } } },
            ],
          },
        ],
      },
      {
        type: "expandable",
        name: "connection_section",
        title: t.sections.connection,
        flatten: true,
        schema: [
          {
            type: "grid",
            name: "connection_grid",
            flatten: true,
            column_min_width: "220px",
            schema: [
              { name: "config_entry_id", selector: { text: {} } },
              { name: "ma_url", selector: { text: { type: "url" } } },
              { name: "ma_token", selector: { text: {} } },
              { name: "favorite_button_entity", selector: { entity: { multiple: false } } },
              { name: "ma_interface_url", selector: { text: {} } },
              { name: "ma_interface_target", selector: { select: { mode: "dropdown", options: t.options.ma_interface_target } } },
              { name: "show_ma_button", selector: { boolean: {} } },
              { name: "show_theme_toggle", selector: { boolean: {} } },
              { name: "cache_ttl", selector: { number: { min: 0, max: 3600000, step: 1000, mode: "box" } } },
              { name: "allow_local_likes", selector: { boolean: {} } },
              { name: "use_mass_queue_send_command", selector: { boolean: {} } },
            ],
          },
        ],
      },
      {
        type: "expandable",
        name: "mainbar_section",
        title: t.sections.mainbar,
        flatten: true,
        schema: [
          {
            name: "mobile_main_bar_items",
            selector: {
              select: {
                multiple: true,
                mode: "list",
                options: t.options.mobile_main_bar_items,
              },
            },
          },
        ],
      },
      {
        type: "expandable",
        name: "library_section",
        title: t.sections.library,
        flatten: true,
        schema: [
          {
            name: "mobile_library_tabs",
            selector: {
              select: {
                multiple: true,
                mode: "list",
                options: t.options.mobile_library_tabs,
              },
            },
          },
        ],
      },
      {
        type: "expandable",
        name: "announcements_section",
        title: t.sections.announcements,
        flatten: true,
        schema: [
          {
            type: "grid",
            name: "announcements_grid",
            flatten: true,
            column_min_width: "220px",
            schema: [
              { name: "mobile_announcement_presets", selector: { text: { multiple: true } } },
              { name: "announcement_tts_entity", selector: { entity: { multiple: false } } },
            ],
          },
        ],
      },
    ],
    computeLabel: (schema) => t.labels[schema.name],
    computeHelper: (schema) => t.helpers[schema.name],
    assertConfig: (config) => {
      if (!config || typeof config !== "object" || Array.isArray(config)) {
        throw new Error("Card config must be an object");
      }
    },
  };
}

class MABrowserCardEditor extends HTMLElement {
  constructor() {
    super();
    this._config = MABrowserCard.getStubConfig();
    this._hass = null;
  }

  connectedCallback() {
    this.style.display = "block";
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  setConfig(config) {
    this._config = {
      ...MABrowserCard.getStubConfig(),
      ...config,
    };
    this._render();
  }

  _isHebrew() {
    const lang = this._hass?.locale?.language || this._hass?.language || "";
    return String(lang).toLowerCase().startsWith("he");
  }

  _dispatchConfig() {
    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config: this._config },
      bubbles: true,
      composed: true,
    }));
  }

  _render() {
    const config = {
      ...MABrowserCard.getStubConfig(),
      ...this._config,
    };
    const he = this._isHebrew();

    this.innerHTML = `
      <div style="display:block;min-height:220px;padding:20px;border:3px solid #ff9800;border-radius:16px;background:#1f1f1f;color:#fff;direction:${he ? "rtl" : "ltr"};">
        <div style="font-size:20px;font-weight:800;margin-bottom:8px;">${he ? "EDITOR LOADED" : "EDITOR LOADED"}</div>
        <div style="font-size:14px;opacity:0.9;line-height:1.5;margin-bottom:16px;">${he ? "אם אתה רואה את הבלוק הזה, העורך הוויזואלי נטען. עכשיו נשאר רק שדה אחד לבדיקה." : "If you can see this block, the visual editor loaded. There is only one field for testing now."}</div>
        <label for="homeii-card-height" style="display:block;font-size:14px;font-weight:700;margin-bottom:8px;">${he ? "גובה הכרטיס" : "Card height"}</label>
        <input id="homeii-card-height" type="number" min="360" max="1400" step="10" value="${Number(config.height || 760)}" style="display:block;width:100%;min-height:46px;padding:10px 12px;border-radius:12px;border:2px solid #ff9800;background:#fff;color:#111;font-size:16px;">
      </div>
    `;

    this.querySelector("#homeii-card-height")?.addEventListener("input", (event) => {
      const nextValue = Number(event.currentTarget.value || 0) || 760;
      this._config = {
        ...this._config,
        height: nextValue,
      };
      this._dispatchConfig();
    });
  }
}

if (!customElements.get("ma-browser-card")) {
  customElements.define("ma-browser-card", MABrowserCard);
}

if (!customElements.get(HOMEII_BROWSER_EDITOR_TAG)) {
  customElements.define(HOMEII_BROWSER_EDITOR_TAG, MABrowserCardEditor);
}

if (!customElements.get("ma-browser-card-editor")) {
  customElements.define("ma-browser-card-editor", MABrowserCardEditor);
}

window.customCards = window.customCards || [];
if (!window.customCards.some((c) => c.type === "ma-browser-card")) {
  window.customCards.push({
    type: "ma-browser-card",
    name: "homeii-music-flow",
    description: `homeii-music-flow browser for Music Assistant in Home Assistant v${HOMEII_CARD_VERSION}`,
    preview: true,
  });
}

class MABrowserCardMobile extends MABrowserCard {
  constructor() {
    super();
    this._state.menuOpen = false;
    this._state.menuPage = "main";
    this._state.menuStack = [];
    this._state.mediaQuery = "";
    this._state.mobileMediaLayout = this._defaultMobileMediaLayout();
    this._state.mobileLibrarySort = "name_asc";
    this._state.mediaSearchToken = 0;
    this._state.mobileQueueActionEntry = null;
    this._state.mobileCustomColor = "#f5a623";
    this._state.mobileDynamicThemeMode = "auto";
    this._state.mobileCustomTextTone = "light";
    this._state.mobileFontScale = 1;
    this._state.mobileNightMode = "auto";
    this._state.mobileNightModeStart = "22:00";
    this._state.mobileNightModeEnd = "06:00";
    this._state.mobileNightModeDays = [0, 1, 2, 3, 4, 5, 6];
    this._state.mobileSleepTimerEndsAt = 0;
    this._state.mobileSleepTimerPlayer = "";
    this._state.mobileCompactMode = false;
    this._state.mobileShowUpNext = true;
    this._state.mobileRecentHistory = [];
    this._state.mobileCurrentHistoryEntry = null;
    this._state.mobileHistoryDrawerOpen = false;
    this._state.mobileCompactExpanded = false;
    this._state.mobileFooterSearchEnabled = false;
    this._state.mobileFooterMode = "both";
    this._state.mobileHomeShortcutEnabled = false;
    this._state.mobileVolumeMode = "button";
    this._state.mobileMicMode = "on";
    this._state.mobileLibraryTabs = ["library_search", "library_playlists", "library_artists", "library_albums", "library_tracks", "library_radio", "library_podcasts"];
    this._state.mobileMainBarItems = ["actions", "players", "library", "settings"];
    this._state.mobileLikedMode = "ma";
    this._state.mobileSwipeMode = "play";
    this._state.mobileRadioBrowserCountry = "all";
    this._state.mobileRadioBrowseCountry = "";
    this._state.mobileRadioBrowseCountryName = "";
    this._state.mobileAnnouncementText = "";
    this._state.mobileAnnouncementPresets = [
      this._m("Dinner is ready", "האוכל מוכן"),
      this._m("Please come to the living room", "נא להגיע לסלון"),
      this._m("Leaving in five minutes", "יוצאים בעוד חמש דקות"),
    ];
    this._state.mobileAnnouncementTtsEntity = "";
    this._state.pinnedPlayerEntity = "";
    this._state.mobileArtBrowseOffset = 0;
    this._state.mobileArtAnchorKey = "";
    this._state.activeArtworkTouch = null;
    this._state.mobileArtBrowseOffset = 0;
    this._state.mobileArtBrowseAnchorIndex = -1;
    this._state.mobileArtRenderKey = "";
    this._state.mobileQueuePlayPendingUntil = 0;
    this._state.mobileQueuePlayPendingKey = "";
    this._state.mobileQueuePlayPendingIndex = null;
    this._state.mobileQueuePlayPendingUri = "";
    this._mobileEmbla = null;
    this._mobileEmblaLoadPromise = null;
    this._mobileEmblaSyncing = false;
    this._mobileArtBrowseResetTimer = null;
    this._mobileSmartVoiceTimer = null;
    this._mobileDynamicThemePaletteCache = new Map();
    this._mobileDynamicThemeToken = 0;
    this._state.mobileSmartVoice = null;
    this._boundMobileMenuClick = this._handleMobileMenuClick.bind(this);
    this._boundMobileMenuChange = this._handleMobileMenuChange.bind(this);
    this._boundMobileMediaInput = this._handleMobileMediaInput.bind(this);
    try { this._state.mobileCustomColor = localStorage.getItem("ma_browser_card_mobile_custom_color") || "#f5a623"; } catch (_) {}
    try { this._state.mobileDynamicThemeMode = localStorage.getItem("ma_browser_card_mobile_dynamic_theme_mode") || "auto"; } catch (_) {}
    try { this._state.mobileBackgroundMotionMode = localStorage.getItem("ma_browser_card_mobile_background_motion_mode") || "subtle"; } catch (_) {}
    try { this._state.mobileCustomTextTone = localStorage.getItem("ma_browser_card_mobile_custom_text") || "light"; } catch (_) {}
    try { this._state.mobileFontScale = Number(localStorage.getItem("ma_browser_card_mobile_font_scale") || 1) || 1; } catch (_) {}
    try { this._state.mobileNightMode = localStorage.getItem("ma_browser_card_mobile_night_mode") || "auto"; } catch (_) {}
    try { this._state.mobileNightModeStart = localStorage.getItem("ma_browser_card_mobile_night_start") || "22:00"; } catch (_) {}
    try { this._state.mobileNightModeEnd = localStorage.getItem("ma_browser_card_mobile_night_end") || "06:00"; } catch (_) {}
    try { this._state.mobileNightModeDays = this._normalizeNightModeDays(localStorage.getItem("ma_browser_card_mobile_night_days")); } catch (_) {}
    try { this._state.mobileSleepTimerEndsAt = Number(localStorage.getItem("ma_browser_card_mobile_sleep_timer_at") || 0) || 0; } catch (_) {}
    try { this._state.mobileSleepTimerPlayer = localStorage.getItem("ma_browser_card_mobile_sleep_timer_player") || ""; } catch (_) {}
    try { this._state.mobileCompactMode = JSON.parse(localStorage.getItem("ma_browser_card_mobile_compact_mode") ?? "false"); } catch (_) {}
    try { this._state.mobileShowUpNext = JSON.parse(localStorage.getItem("ma_browser_card_mobile_show_up_next") ?? "true"); } catch (_) {}
    try {
      const rawHistory = JSON.parse(localStorage.getItem("ma_browser_card_mobile_recent_history") || "[]");
      if (Array.isArray(rawHistory)) this._state.mobileRecentHistory = rawHistory.slice(0, 10);
    } catch (_) {}
    try { this._state.mobileLibrarySort = localStorage.getItem("ma_browser_card_mobile_library_sort") || "name_asc"; } catch (_) {}
    try { this._state.mobileFooterSearchEnabled = JSON.parse(localStorage.getItem("ma_browser_card_mobile_footer_search") ?? "false"); } catch (_) {}
    try { this._state.mobileFooterMode = localStorage.getItem("ma_browser_card_mobile_footer_mode") || "both"; } catch (_) {}
    try { this._state.mobileHomeShortcutEnabled = JSON.parse(localStorage.getItem("ma_browser_card_mobile_home_shortcut") ?? "false"); } catch (_) {}
    try { this._state.mobileVolumeMode = localStorage.getItem("ma_browser_card_mobile_volume_mode") || "button"; } catch (_) {}
    try { this._state.mobileMicMode = localStorage.getItem("ma_browser_card_mobile_mic_mode") || "on"; } catch (_) {}
    try { this._state.mobileSwipeMode = localStorage.getItem("ma_browser_card_mobile_swipe_mode") || "play"; } catch (_) {}
    try { this._state.mobileRadioBrowserCountry = localStorage.getItem("ma_browser_card_mobile_radio_country") || "all"; } catch (_) {}
    try {
      const rawTabs = JSON.parse(localStorage.getItem("ma_browser_card_mobile_library_tabs") || "[]");
      if (Array.isArray(rawTabs) && rawTabs.length) this._state.mobileLibraryTabs = rawTabs;
    } catch (_) {}
    try {
      const rawMainBar = JSON.parse(localStorage.getItem("ma_browser_card_mobile_main_bar_items") || "[]");
      if (Array.isArray(rawMainBar) && rawMainBar.length) this._state.mobileMainBarItems = rawMainBar;
    } catch (_) {}
    try { this._state.pinnedPlayerEntity = localStorage.getItem("ma_browser_card_mobile_pinned_player") || ""; } catch (_) {}
    try { this._state.mobileLikedMode = localStorage.getItem("ma_browser_card_mobile_liked_mode") || "ma"; } catch (_) {}
    try {
      const presets = JSON.parse(localStorage.getItem("ma_browser_card_mobile_announcement_presets") || "[]");
      if (Array.isArray(presets) && presets.length) this._state.mobileAnnouncementPresets = presets.slice(0, 3);
    } catch (_) {}
    try { this._state.mobileAnnouncementTtsEntity = localStorage.getItem("ma_browser_card_mobile_announcement_tts_entity") || this._config?.announcement_tts_entity || ""; } catch (_) {}
  }

  _defaultMobileMediaLayout() {
    return this._layoutModeConfig() === "tablet" ? "grid" : "list";
  }

  static getStubConfig() {
    return {
      ...MABrowserCard.getStubConfig(),
      type: "custom:homeii-music-flow",
      show_ma_button: false,
      layout_mode: "auto",
      settings_source: "ui",
      night_mode: "auto",
      night_mode_auto_start: "22:00",
      night_mode_auto_end: "06:00",
      night_mode_days: [0, 1, 2, 3, 4, 5, 6],
      mobile_show_up_next: true,
      favorite_button_entity: "",
      allow_local_likes: false,
      use_mass_queue_send_command: false,
      mobile_custom_color: "#f5a623",
      mobile_dynamic_theme_mode: "auto",
      mobile_background_motion_mode: "subtle",
      mobile_custom_text_tone: "light",
      mobile_font_scale: 1,
      mobile_compact_mode: false,
      mobile_footer_search_enabled: false,
      mobile_footer_mode: "both",
      mobile_home_shortcut: false,
      mobile_volume_mode: "button",
      mobile_mic_mode: "on",
      mobile_library_tabs: ["library_search", "library_playlists", "library_artists", "library_albums", "library_tracks", "library_radio", "library_podcasts"],
      mobile_main_bar_items: ["actions", "players", "library", "settings"],
      mobile_liked_mode: "ma",
      mobile_swipe_mode: "play",
      mobile_radio_browser_country: "all",
      mobile_announcement_presets: [
        "האוכל מוכן",
        "נא להגיע לסלון",
        "יוצאים בעוד חמש דקות",
      ],
      announcement_tts_entity: "",
      pinned_player_entity: "",
    };
  }

  static _editorIsHebrew() {
    try {
      const lang =
        document?.querySelector("home-assistant")?.hass?.locale?.language ||
        document?.querySelector("home-assistant")?.hass?.language ||
        document?.documentElement?.lang ||
        "";
      return String(lang).toLowerCase().startsWith("he");
    } catch (_) {
      return false;
    }
  }

  static _legacyGetConfigElementDisabled() {
    ensureHaEditorComponents();
    return undefined;
  }

  static getConfigForm() {
    return getMobileCardConfigForm();
  }

  static assertConfig(config) {
    if (!config || typeof config !== "object" || Array.isArray(config)) {
      throw new Error("Card config must be an object");
    }
  }

  static _legacyConfigFormDisabled() {
    return undefined;
  }

  static _legacyEditorTexts() {
    const he = this._editorIsHebrew();
    return {
      sections: {
        general: he ? "כללי" : "General",
        display: he ? "תצוגה ומובייל" : "Display and Mobile",
        connection: he ? "חיבור והתנהגות" : "Connection and Behavior",
        mainbar: he ? "סרגל ראשי" : "Main Bar",
        library: he ? "דפי ספרייה" : "Library Tabs",
        announcements: he ? "כריזה" : "Announcements",
      },
      labels: {
        settings_source: he ? "מקור ההגדרות" : "Settings source",
        layout_mode: he ? "מצב פריסה" : "Layout mode",
        height: he ? "גובה הכרטיס" : "Card height",
        main_opacity: he ? "שקיפות ראשית" : "Main opacity",
        popup_opacity: he ? "שקיפות חלונות" : "Popup opacity",
        language: he ? "שפה" : "Language",
        theme_mode: he ? "ערכת נושא" : "Theme mode",
        rtl: he ? "RTL" : "RTL",
        mobile_custom_color: he ? "צבע מוביל" : "Accent color",
        mobile_custom_text_tone: he ? "טון טקסט" : "Text tone",
        mobile_font_scale: he ? "סקייל פונט" : "Font scale",
        mobile_swipe_mode: he ? "סוויפ על עטיפה" : "Artwork swipe",
        mobile_footer_search_enabled: he ? "חיפוש בפוטר" : "Footer search",
        mobile_mic_mode: he ? "מיקרופון" : "Microphone",
        mobile_footer_mode: he ? "סגנון פוטר" : "Footer style",
        mobile_home_shortcut: he ? "כפתור בית" : "Home shortcut",
        mobile_volume_mode: he ? "בקרת ווליום" : "Volume mode",
        mobile_liked_mode: he ? "מצב אהבתי" : "Liked mode",
        mobile_radio_browser_country: he ? "מדינת רדיו" : "Radio Browser country",
        mobile_main_bar_items: he ? "פריטי סרגל ראשי" : "Main bar items",
        mobile_library_tabs: he ? "טאבי ספרייה" : "Library tabs",
        mobile_announcement_presets: he ? "משפטי כריזה" : "Announcement presets",
        announcement_tts_entity: he ? "ישות TTS" : "TTS entity",
        config_entry_id: "Config Entry ID",
        ma_url: he ? "כתובת Music Assistant" : "Music Assistant URL",
        ma_token: he ? "טוקן Music Assistant" : "Music Assistant token",
        favorite_button_entity: he ? "ישות כפתור Like" : "Favorite button entity",
        ma_interface_url: he ? "נתיב ממשק MA" : "MA interface path",
        ma_interface_target: he ? "פתיחת ממשק" : "Open interface in",
        show_ma_button: he ? "כפתור MA" : "Show MA button",
        show_theme_toggle: he ? "כפתור ערכת נושא" : "Show theme toggle",
        cache_ttl: he ? "זמן קאש" : "Cache TTL",
        allow_local_likes: he ? "אהבתי מקומי" : "Allow local likes",
        use_mass_queue_send_command: he ? "Fallback mass_queue/send_command" : "mass_queue/send_command fallback",
      },
      helpers: {
        settings_source: he ? "בחירה ב־Visual מבטלת את מסך ההגדרות מתוך הכרטיס." : "Choosing Visual disables the in-card settings screen.",
        mobile_main_bar_items: he ? "בחר אילו כפתורים יופיעו בסרגל הראשי." : "Choose which actions appear in the main bar.",
        mobile_library_tabs: he ? "בחר אילו טאבים יהיו זמינים במסך הספרייה." : "Choose which tabs are available in the library screen.",
        mobile_announcement_presets: he ? "אפשר להגדיר כמה משפטי כריזה מוכנים מראש." : "Configure ready-made announcement phrases.",
      },
      options: {
        settings_source: [
          { value: "device", label: he ? "מהמכשיר / הממשק" : "Per device / in-card" },
          { value: "visual", label: he ? "מהעורך הוויזואלי" : "Visual editor" },
        ],
        layout_mode: [
          { value: "auto", label: "Auto" },
          { value: "mobile", label: he ? "מובייל" : "Mobile" },
          { value: "tablet", label: he ? "טאבלט" : "Tablet" },
        ],
        language: [
          { value: "auto", label: "Auto" },
          { value: "he", label: he ? "עברית" : "Hebrew" },
          { value: "en", label: he ? "אנגלית" : "English" },
        ],
        theme_mode: [
          { value: "auto", label: "Auto" },
          { value: "dark", label: he ? "כהה" : "Dark" },
          { value: "light", label: he ? "בהיר" : "Light" },
          { value: "custom", label: he ? "אישי" : "Custom" },
        ],
        mobile_custom_text_tone: [
          { value: "light", label: he ? "בהיר" : "Light" },
          { value: "dark", label: he ? "כהה" : "Dark" },
        ],
        mobile_swipe_mode: [
          { value: "play", label: he ? "מעביר שיר" : "Change track" },
          { value: "browse", label: he ? "מדפדף עטיפות" : "Browse covers" },
        ],
        mobile_mic_mode: [
          { value: "on", label: he ? "פעיל" : "On" },
          { value: "off", label: he ? "כבוי" : "Off" },
          { value: "smart", label: he ? "חכם" : "Smart" },
        ],
        mobile_footer_mode: [
          { value: "icon", label: he ? "אייקון בלבד" : "Icon only" },
          { value: "text", label: he ? "מלל בלבד" : "Text only" },
          { value: "both", label: he ? "אייקון ומלל" : "Icon + text" },
        ],
        mobile_volume_mode: [
          { value: "button", label: he ? "כפתור" : "Button" },
          { value: "always", label: he ? "פעיל תמיד" : "Always visible" },
        ],
        mobile_liked_mode: [
          { value: "ma", label: "Music Assistant" },
          { value: "local", label: he ? "מקומי" : "Local" },
        ],
        ma_interface_target: [
          { value: "_self", label: "_self" },
          { value: "_blank", label: "_blank" },
        ],
        mobile_main_bar_items: [
          { value: "search", label: he ? "חיפוש" : "Search" },
          { value: "library", label: he ? "ספרייה" : "Library" },
          { value: "players", label: he ? "נגנים" : "Players" },
          { value: "actions", label: he ? "פעולות" : "Actions" },
          { value: "settings", label: he ? "הגדרות" : "Settings" },
          { value: "theme", label: he ? "שמש / ירח" : "Theme toggle" },
        ],
        mobile_library_tabs: [
          { value: "library_search", label: he ? "חיפוש" : "Search" },
          { value: "library_playlists", label: he ? "פלייליסטים" : "Playlists" },
          { value: "library_artists", label: he ? "אמנים" : "Artists" },
          { value: "library_albums", label: he ? "אלבומים" : "Albums" },
          { value: "library_tracks", label: he ? "שירים" : "Tracks" },
          { value: "library_radio", label: he ? "רדיו" : "Radio" },
          { value: "library_podcasts", label: he ? "פודקאסטים" : "Podcasts" },
          { value: "library_liked", label: he ? "אהבתי" : "Liked" },
        ],
      },
    };
  }

  static _legacyGetConfigForm() {
    const t = this._legacyEditorTexts();
    return {
      schema: [
        {
          type: "expandable",
          name: "general_section",
          title: t.sections.general,
          flatten: true,
          schema: [
            { name: "settings_source", selector: { select: { mode: "dropdown", options: t.options.settings_source } } },
            { name: "layout_mode", selector: { select: { mode: "dropdown", options: t.options.layout_mode } } },
            { name: "height", selector: { number: { min: 480, max: 1400, step: 10, mode: "box" } } },
            { name: "main_opacity", selector: { number: { min: 0.3, max: 1, step: 0.02, mode: "box" } } },
            { name: "popup_opacity", selector: { number: { min: 0.4, max: 1, step: 0.02, mode: "box" } } },
            { name: "language", selector: { select: { mode: "dropdown", options: t.options.language } } },
            { name: "theme_mode", selector: { select: { mode: "dropdown", options: t.options.theme_mode } } },
            { name: "rtl", selector: { boolean: {} } },
          ],
        },
        {
          type: "expandable",
          name: "display_section",
          title: t.sections.display,
          flatten: true,
          schema: [
            { name: "mobile_custom_color", selector: { text: {} } },
            { name: "mobile_dynamic_theme_mode", selector: { select: { mode: "dropdown", options: t.options.mobile_dynamic_theme_mode } } },
            { name: "mobile_background_motion_mode", selector: { select: { mode: "dropdown", options: t.options.mobile_background_motion_mode } } },
            { name: "mobile_custom_text_tone", selector: { select: { mode: "dropdown", options: t.options.mobile_custom_text_tone } } },
            { name: "mobile_font_scale", selector: { number: { min: 0.9, max: 1.3, step: 0.05, mode: "box" } } },
            { name: "mobile_swipe_mode", selector: { select: { mode: "dropdown", options: t.options.mobile_swipe_mode } } },
            { name: "mobile_footer_search_enabled", selector: { boolean: {} } },
            { name: "mobile_mic_mode", selector: { select: { mode: "dropdown", options: t.options.mobile_mic_mode } } },
            { name: "mobile_footer_mode", selector: { select: { mode: "dropdown", options: t.options.mobile_footer_mode } } },
            { name: "mobile_volume_mode", selector: { select: { mode: "dropdown", options: t.options.mobile_volume_mode } } },
            { name: "mobile_liked_mode", selector: { select: { mode: "dropdown", options: t.options.mobile_liked_mode } } },
            { name: "mobile_radio_browser_country", selector: { text: {} } },
          ],
        },
        {
          type: "expandable",
          name: "connection_section",
          title: t.sections.connection,
          flatten: true,
          schema: [
            { name: "config_entry_id", selector: { text: {} } },
            { name: "ma_url", selector: { text: {} } },
            { name: "ma_token", selector: { text: {} } },
            { name: "favorite_button_entity", selector: { entity: { multiple: false } } },
            { name: "ma_interface_url", selector: { text: {} } },
            { name: "ma_interface_target", selector: { select: { mode: "dropdown", options: t.options.ma_interface_target } } },
            { name: "show_ma_button", selector: { boolean: {} } },
            { name: "show_theme_toggle", selector: { boolean: {} } },
            { name: "cache_ttl", selector: { number: { min: 0, max: 3600000, step: 1000, mode: "box" } } },
            { name: "allow_local_likes", selector: { boolean: {} } },
            { name: "use_mass_queue_send_command", selector: { boolean: {} } },
          ],
        },
        {
          type: "expandable",
          name: "mainbar_section",
          title: t.sections.mainbar,
          flatten: true,
          schema: [
            {
              name: "mobile_main_bar_items",
              selector: {
                select: {
                  multiple: true,
                  mode: "list",
                  options: t.options.mobile_main_bar_items,
                },
              },
            },
          ],
        },
        {
          type: "expandable",
          name: "library_section",
          title: t.sections.library,
          flatten: true,
          schema: [
            {
              name: "mobile_library_tabs",
              selector: {
                select: {
                  multiple: true,
                  mode: "list",
                  options: t.options.mobile_library_tabs,
                },
              },
            },
          ],
        },
        {
          type: "expandable",
          name: "announcements_section",
          title: t.sections.announcements,
          flatten: true,
          schema: [
            { name: "mobile_announcement_presets", selector: { text: { multiple: true } } },
            { name: "announcement_tts_entity", selector: { entity: { multiple: false } } },
          ],
        },
      ],
      computeLabel: (schema) => t.labels[schema.name],
      computeHelper: (schema) => t.helpers[schema.name],
    };
  }

  setConfig(config) {
    super.setConfig({
      ...MABrowserCardMobile.getStubConfig(),
      ...config,
      settings_source: normalizeSettingsSource(config?.settings_source),
    });
    this._applyConfiguredMobileSettings();
  }

  _usesVisualSettings() {
    return normalizeSettingsSource(this._config?.settings_source) === "card";
  }

  _mobileCompactModeEnabled() {
    return !!this._state.mobileCompactMode;
  }

  _mobileShowUpNextEnabled() {
    return this._state.mobileShowUpNext !== false;
  }

  _mobileDynamicThemeMode() {
    const mode = String(this._state.mobileDynamicThemeMode || "auto").toLowerCase();
    return ["off", "auto", "strong"].includes(mode) ? mode : "auto";
  }

  _mobileBackgroundMotionMode() {
    const mode = String(this._state.mobileBackgroundMotionMode || "subtle").toLowerCase();
    return ["off", "subtle", "strong"].includes(mode) ? mode : "subtle";
  }

  _backgroundMotionEnabled() {
    return this._mobileBackgroundMotionMode() !== "off";
  }

  _backgroundMotionAmount() {
    return this._mobileBackgroundMotionMode() === "strong" ? "1.35" : "1";
  }

  _isCompactTileMode() {
    return this._mobileCompactModeEnabled() && !this._state.mobileCompactExpanded;
  }

  _setCompactExpanded(expanded) {
    this._state.mobileCompactExpanded = !!expanded && this._mobileCompactModeEnabled();
    this._build();
    this._init();
  }

  _pinnedPlayerPreference() {
    return String(this._state.pinnedPlayerEntity || "").trim();
  }

  _resolvedPinnedPlayerEntity(players = this._state.players || []) {
    const raw = this._pinnedPlayerPreference();
    if (!raw) return "";
    const normalized = raw.toLowerCase();
    const match = (Array.isArray(players) ? players : []).find((player) => String(player?.entity_id || "").toLowerCase() === normalized);
    return match?.entity_id || "";
  }

  _hasPinnedPlayer() {
    return !!this._resolvedPinnedPlayerEntity();
  }

  _applyConfiguredMobileSettings() {
    if (!this._config) return;
    const cfg = this._config;
    if (this._usesVisualSettings()) {
      this._state.lang = String(cfg.language || "auto");
      this._state.cardTheme = String(cfg.theme_mode || "auto");
      this._state.mobileCustomColor = String(cfg.mobile_custom_color || "#f5a623");
      this._state.mobileDynamicThemeMode = ["off", "auto", "strong"].includes(String(cfg.mobile_dynamic_theme_mode || "").toLowerCase()) ? String(cfg.mobile_dynamic_theme_mode).toLowerCase() : "auto";
      this._state.mobileBackgroundMotionMode = ["off", "subtle", "strong"].includes(String(cfg.mobile_background_motion_mode || "").toLowerCase()) ? String(cfg.mobile_background_motion_mode).toLowerCase() : "subtle";
      this._state.mobileCustomTextTone = String(cfg.mobile_custom_text_tone || "light") === "dark" ? "dark" : "light";
      this._state.mobileFontScale = Math.max(0.9, Math.min(1.3, Number(cfg.mobile_font_scale || 1) || 1));
      this._state.mobileNightMode = ["off", "auto", "on"].includes(String(cfg.night_mode || "").toLowerCase()) ? String(cfg.night_mode).toLowerCase() : "auto";
      this._state.mobileNightModeStart = this._normalizeClockTime(cfg.night_mode_auto_start || "22:00", "22:00");
      this._state.mobileNightModeEnd = this._normalizeClockTime(cfg.night_mode_auto_end || "06:00", "06:00");
      this._state.mobileNightModeDays = this._normalizeNightModeDays(cfg.night_mode_days);
      this._state.mobileCompactMode = !!cfg.mobile_compact_mode;
      this._state.mobileShowUpNext = cfg.mobile_show_up_next !== false;
      if (!this._state.mobileCompactMode) this._state.mobileCompactExpanded = false;
      this._state.mobileFooterSearchEnabled = !!cfg.mobile_footer_search_enabled;
      this._state.mobileFooterMode = ["icon", "text", "both"].includes(String(cfg.mobile_footer_mode || "")) ? String(cfg.mobile_footer_mode) : "both";
      this._state.mobileHomeShortcutEnabled = !!cfg.mobile_home_shortcut;
      this._state.mobileVolumeMode = ["always", "button"].includes(String(cfg.mobile_volume_mode || "")) ? String(cfg.mobile_volume_mode) : "button";
      this._state.mobileMicMode = ["on", "off", "smart"].includes(String(cfg.mobile_mic_mode || "")) ? String(cfg.mobile_mic_mode) : "on";
      this._state.mobileLikedMode = ["ma", "local"].includes(String(cfg.mobile_liked_mode || "")) ? String(cfg.mobile_liked_mode) : "ma";
      this._state.mobileSwipeMode = ["play", "browse"].includes(String(cfg.mobile_swipe_mode || "")) ? String(cfg.mobile_swipe_mode) : "play";
      this._state.mobileRadioBrowserCountry = String(cfg.mobile_radio_browser_country || "all");
      this._state.mobileLibraryTabs = Array.isArray(cfg.mobile_library_tabs) && cfg.mobile_library_tabs.length
        ? cfg.mobile_library_tabs
        : this._defaultMobileLibraryTabs();
      this._state.mobileMainBarItems = Array.isArray(cfg.mobile_main_bar_items) && cfg.mobile_main_bar_items.length
        ? cfg.mobile_main_bar_items
        : this._defaultMobileMainBarItems();
      this._state.mobileAnnouncementPresets = Array.isArray(cfg.mobile_announcement_presets) && cfg.mobile_announcement_presets.length
        ? cfg.mobile_announcement_presets.slice(0, 3)
        : [
            this._m("Dinner is ready", "האוכל מוכן"),
            this._m("Please come to the living room", "נא להגיע לסלון"),
            this._m("Leaving in five minutes", "יוצאים בעוד חמש דקות"),
          ];
      this._state.mobileAnnouncementTtsEntity = String(cfg.announcement_tts_entity || "");
      this._state.pinnedPlayerEntity = String(cfg.pinned_player_entity || "").trim();
    } else if (String(cfg.announcement_tts_entity || "").trim() && !String(this._state.mobileAnnouncementTtsEntity || "").trim()) {
      this._state.mobileAnnouncementTtsEntity = String(cfg.announcement_tts_entity || "").trim();
    }
  }

  _layoutModeConfig() {
    const raw = String(this._config?.layout_mode || "auto").toLowerCase();
    if (raw === "mobile" || raw === "tablet") return raw;
    const rectWidth = Number(this.getBoundingClientRect?.().width || 0);
    const hostWidth = Number(this.offsetWidth || 0);
    const viewportWidth = typeof window !== "undefined" ? Number(window.innerWidth || 0) : 0;
    const width = Math.max(rectWidth, hostWidth, viewportWidth);
    return width >= 900 ? "tablet" : "mobile";
  }

  _m(en, he) {
    return this._isHebrew() ? he : en;
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
    const rgb = this._customRgb().split(" ").map((v) => Number(v || 0));
    const [r, g, b] = rgb;
    const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    return luminance < 0.58;
  }

  _customTextColor() {
    return "#ffffff";
  }

  _customRgb() {
    const hex = String(this._state.mobileCustomColor || "#f5a623").replace("#", "").trim();
    const norm = hex.length === 3 ? hex.split("").map((c) => c + c).join("") : hex.padEnd(6, "0").slice(0, 6);
    const r = parseInt(norm.slice(0, 2), 16) || 245;
    const g = parseInt(norm.slice(2, 4), 16) || 166;
    const b = parseInt(norm.slice(4, 6), 16) || 35;
    return `${r} ${g} ${b}`;
  }

  _clampByte(value) {
    return Math.max(0, Math.min(255, Math.round(Number(value) || 0)));
  }

  _normalizeRgbTuple(value, fallback = [245, 166, 35]) {
    if (Array.isArray(value) && value.length >= 3) {
      return value.slice(0, 3).map((entry) => this._clampByte(entry));
    }
    if (typeof value === "string") {
      const parts = value.trim().split(/[,\s]+/).map((entry) => Number(entry));
      if (parts.length >= 3 && parts.every((entry) => Number.isFinite(entry))) {
        return parts.slice(0, 3).map((entry) => this._clampByte(entry));
      }
    }
    return fallback.map((entry) => this._clampByte(entry));
  }

  _rgbTupleToString(tuple = [245, 166, 35]) {
    const [r, g, b] = this._normalizeRgbTuple(tuple);
    return `${r} ${g} ${b}`;
  }

  _rgbTupleToHex(tuple = [245, 166, 35]) {
    return `#${this._normalizeRgbTuple(tuple).map((entry) => this._clampByte(entry).toString(16).padStart(2, "0")).join("")}`;
  }

  _mixRgb(left = [245, 166, 35], right = [255, 255, 255], ratio = 0.5) {
    const weight = Math.max(0, Math.min(1, Number(ratio) || 0));
    const from = this._normalizeRgbTuple(left);
    const to = this._normalizeRgbTuple(right);
    return from.map((entry, index) => this._clampByte(entry + ((to[index] - entry) * weight)));
  }

  _rgbToHsl(tuple = [245, 166, 35]) {
    let [r, g, b] = this._normalizeRgbTuple(tuple).map((entry) => entry / 255);
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const lightness = (max + min) / 2;
    if (max === min) return [0, 0, lightness];
    const delta = max - min;
    const saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);
    let hue = 0;
    switch (max) {
      case r: hue = ((g - b) / delta) + (g < b ? 6 : 0); break;
      case g: hue = ((b - r) / delta) + 2; break;
      default: hue = ((r - g) / delta) + 4; break;
    }
    return [hue / 6, saturation, lightness];
  }

  _hslToRgb(hue = 0, saturation = 0, lightness = 0.5) {
    const h = ((Number(hue) % 1) + 1) % 1;
    const s = Math.max(0, Math.min(1, Number(saturation) || 0));
    const l = Math.max(0, Math.min(1, Number(lightness) || 0));
    if (s === 0) {
      const value = this._clampByte(l * 255);
      return [value, value, value];
    }
    const hueToRgb = (p, q, t) => {
      let value = t;
      if (value < 0) value += 1;
      if (value > 1) value -= 1;
      if (value < 1 / 6) return p + ((q - p) * 6 * value);
      if (value < 1 / 2) return q;
      if (value < 2 / 3) return p + ((q - p) * (2 / 3 - value) * 6);
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : (l + s - (l * s));
    const p = (2 * l) - q;
    return [
      this._clampByte(hueToRgb(p, q, h + (1 / 3)) * 255),
      this._clampByte(hueToRgb(p, q, h) * 255),
      this._clampByte(hueToRgb(p, q, h - (1 / 3)) * 255),
    ];
  }

  _tunePaletteColor(tuple = [245, 166, 35], options = {}) {
    const [hue, saturation, lightness] = this._rgbToHsl(tuple);
    const minSat = Number(options.minSaturation ?? 0.42);
    const minLight = Number(options.minLightness ?? 0.42);
    const maxLight = Number(options.maxLightness ?? 0.6);
    const sat = Math.max(minSat, saturation);
    const light = Math.max(minLight, Math.min(maxLight, lightness));
    return this._hslToRgb(hue, sat, light);
  }

  _dynamicThemePalette() {
    return this._mobileDynamicThemeMode() === "off" ? null : (this._state.mobileDynamicThemePalette || null);
  }

  _dynamicThemeActive() {
    return !!this._dynamicThemePalette()?.accent;
  }

  _activeAccentColor() {
    return this._dynamicThemePalette()?.accent || this._state.mobileCustomColor || "#f5a623";
  }

  _activeAccentRgb() {
    return this._dynamicThemePalette()?.accent_rgb || this._customRgb();
  }

  _dynamicThemeStrengthValue() {
    return this._mobileDynamicThemeMode() === "strong" ? "1.35" : "1";
  }

  _mobileBackdropOverlay(theme = this._effectiveTheme()) {
    const palette = this._dynamicThemePalette();
    if (!palette) {
      return theme === "light"
        ? `radial-gradient(circle at 18% 20%, rgba(255,187,88,.28), transparent 30%), radial-gradient(circle at 84% 16%, rgba(255,150,108,.16), transparent 22%), linear-gradient(180deg, rgba(255,255,255,.24), rgba(236,242,248,.72), rgba(228,235,244,.92))`
        : `radial-gradient(circle at 18% 20%, rgba(255,181,64,.24), transparent 32%), radial-gradient(circle at 82% 16%, rgba(255,128,76,.12), transparent 20%), linear-gradient(180deg, rgba(9,12,19,.26), rgba(9,12,19,.82), rgba(9,12,19,.98))`;
    }
    const accent = palette.accent_rgb || this._activeAccentRgb();
    const surface = palette.surface_rgb || accent;
    const glow = palette.glow_rgb || accent;
    return theme === "light"
      ? `radial-gradient(circle at 18% 20%, rgba(${accent} / .24), transparent 30%), radial-gradient(circle at 84% 16%, rgba(${glow} / .16), transparent 22%), linear-gradient(180deg, rgba(255,255,255,.24), rgba(${surface} / .42), rgba(${surface} / .62))`
      : `radial-gradient(circle at 18% 20%, rgba(${accent} / .24), transparent 32%), radial-gradient(circle at 82% 16%, rgba(${glow} / .14), transparent 20%), linear-gradient(180deg, rgba(${surface} / .18), rgba(9,12,19,.82), rgba(9,12,19,.98))`;
  }

  _applyDynamicThemeStyles() {
    const host = this;
    const card = this.shadowRoot?.querySelector(".card");
    const accent = this._activeAccentColor();
    const palette = this._dynamicThemePalette();
    host.style?.setProperty("--accent-color", accent);
    host.style?.setProperty("--ma-accent", accent);
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
    const vars = mode === "strong"
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
            const accent = this._tunePaletteColor(vivid.map((entry) => this._clampByte(entry / vividWeight)), {
              minSaturation: this._mobileDynamicThemeMode() === "strong" ? 0.58 : 0.46,
              minLightness: 0.42,
              maxLightness: this._mobileDynamicThemeMode() === "strong" ? 0.56 : 0.6,
            });
            const surface = this._mixRgb(base, accent, this._mobileDynamicThemeMode() === "strong" ? 0.32 : 0.2);
            const glow = this._mixRgb(accent, [255, 255, 255], this._mobileDynamicThemeMode() === "strong" ? 0.12 : 0.2);
            resolve({
              accent: this._rgbTupleToHex(accent),
              accent_rgb: this._rgbTupleToString(accent),
              surface_rgb: this._rgbTupleToString(surface),
              glow_rgb: this._rgbTupleToString(glow),
            });
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
      this._state.mobileDynamicThemePalette = null;
      this._applyDynamicThemeStyles();
      return;
    }
    if (this._state.mobileDynamicThemeArtwork === artworkKey) {
      this._applyDynamicThemeStyles();
      return;
    }
    this._state.mobileDynamicThemeArtwork = artworkKey;
    const token = ++this._mobileDynamicThemeToken;
    const palette = await this._extractDynamicThemePalette(normalizedArt);
    if (token !== this._mobileDynamicThemeToken) return;
    this._state.mobileDynamicThemePalette = palette;
    this._applyDynamicThemeStyles();
    this._applyBackgroundMotionStyles();
    this._syncNowPlayingUI();
  }

  _mobileNightMode() {
    const mode = String(this._state.mobileNightMode || "auto").toLowerCase();
    return ["off", "auto", "on"].includes(mode) ? mode : "auto";
  }

  _normalizeClockTime(value, fallback = "22:00") {
    const match = String(value || "").trim().match(/^(\d{1,2})(?::(\d{1,2}))?$/);
    if (!match) return fallback;
    const hours = Math.max(0, Math.min(23, Number(match[1]) || 0));
    const minutes = Math.max(0, Math.min(59, Number(match[2] ?? 0) || 0));
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  }

  _clockMinutesOfDay(value, fallback = "22:00") {
    const normalized = this._normalizeClockTime(value, fallback);
    const [hours, minutes] = normalized.split(":").map((part) => Number(part) || 0);
    return (hours * 60) + minutes;
  }

  _defaultNightModeDays() {
    return [0, 1, 2, 3, 4, 5, 6];
  }

  _normalizeNightModeDays(value) {
    let source = value;
    if (typeof source === "string") {
      const raw = source.trim();
      if (!raw) return this._defaultNightModeDays();
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) source = parsed;
      } catch (_) {
        source = raw.split(/[,\s]+/);
      }
    }
    const normalized = Array.isArray(source)
      ? source
          .map((entry) => Number(entry))
          .filter((entry) => Number.isInteger(entry) && entry >= 0 && entry <= 6)
      : [];
    const unique = Array.from(new Set(normalized)).sort((a, b) => a - b);
    return unique.length ? unique : this._defaultNightModeDays();
  }

  _nightModeDays() {
    return this._normalizeNightModeDays(this._state.mobileNightModeDays);
  }

  _nightModeDayOptions() {
    return [
      [0, this._m("Sun", "א׳")],
      [1, this._m("Mon", "ב׳")],
      [2, this._m("Tue", "ג׳")],
      [3, this._m("Wed", "ד׳")],
      [4, this._m("Thu", "ה׳")],
      [5, this._m("Fri", "ו׳")],
      [6, this._m("Sat", "ש׳")],
    ];
  }

  _nightModeWindow() {
    return {
      start: this._normalizeClockTime(this._state.mobileNightModeStart || "22:00", "22:00"),
      end: this._normalizeClockTime(this._state.mobileNightModeEnd || "06:00", "06:00"),
    };
  }

  _isMinutesInsideWindow(minutes, startMinutes, endMinutes) {
    if (startMinutes === endMinutes) return true;
    if (startMinutes < endMinutes) {
      return minutes >= startMinutes && minutes < endMinutes;
    }
    return minutes >= startMinutes || minutes < endMinutes;
  }

  _isNightModeActive(date = new Date()) {
    const mode = this._mobileNightMode();
    if (mode === "off") return false;
    if (mode === "on") return true;
    const nowMinutes = (date.getHours() * 60) + date.getMinutes();
    const windowRange = this._nightModeWindow();
    const startMinutes = this._clockMinutesOfDay(windowRange.start, "22:00");
    const endMinutes = this._clockMinutesOfDay(windowRange.end, "06:00");
    if (!this._isMinutesInsideWindow(nowMinutes, startMinutes, endMinutes)) return false;
    const enabledDays = new Set(this._nightModeDays());
    const currentDay = Number(date.getDay());
    if (startMinutes === endMinutes || startMinutes < endMinutes) {
      return enabledDays.has(currentDay);
    }
    const windowOwnerDay = nowMinutes >= startMinutes ? currentDay : ((currentDay + 6) % 7);
    return enabledDays.has(windowOwnerDay);
  }

  _sleepTimerRemainingMs(now = Date.now()) {
    const target = Number(this._state.mobileSleepTimerEndsAt || 0);
    if (!target || target <= now) return 0;
    return target - now;
  }

  _sleepTimerRemainingLabel() {
    const remaining = this._sleepTimerRemainingMs();
    if (!remaining) return "";
    const totalMinutes = Math.max(1, Math.ceil(remaining / 60000));
    if (totalMinutes < 60) return `${totalMinutes}m`;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return minutes ? `${hours}h ${minutes}m` : `${hours}h`;
  }

  _cycleNightMode() {
    const order = ["auto", "on", "off"];
    const current = this._mobileNightMode();
    const next = order[(order.indexOf(current) + 1) % order.length];
    this._state.mobileNightMode = next;
    this._persistMobileAppearance();
    this._build();
    this._init();
    if (this._state.menuOpen) this._openMobileMenu(this._state.menuPage || "settings");
  }

  _clearSleepTimer(showToast = false) {
    this._state.mobileSleepTimerEndsAt = 0;
    this._state.mobileSleepTimerPlayer = "";
    this._persistMobileAppearance();
    this._syncNightModeUi();
    if (showToast) {
      this._toast(this._m("Sleep timer cleared", "טיימר השינה בוטל"));
    }
  }

  _cycleSleepTimer() {
    const currentRemaining = this._sleepTimerRemainingMs();
    const steps = [15, 30, 45, 60, 0];
    if (!currentRemaining) {
      const player = this._getSelectedPlayer();
      if (!player?.entity_id) {
        this._toastError(this._m("Select a player first", "בחר נגן קודם"));
        return;
      }
      this._state.mobileSleepTimerEndsAt = Date.now() + (steps[0] * 60000);
      this._state.mobileSleepTimerPlayer = player.entity_id;
      this._persistMobileAppearance();
      this._syncNightModeUi();
      this._toastSuccess(this._m("Sleep timer set for 15 minutes", "טיימר שינה הופעל ל־15 דקות"));
      return;
    }
    const currentMinutes = Math.max(1, Math.ceil(currentRemaining / 60000));
    const nextStep = steps.find((value) => value > currentMinutes) ?? 0;
    if (!nextStep) {
      this._clearSleepTimer(true);
      return;
    }
    const player = this._getSelectedPlayer();
    this._state.mobileSleepTimerEndsAt = Date.now() + (nextStep * 60000);
    this._state.mobileSleepTimerPlayer = player?.entity_id || this._state.mobileSleepTimerPlayer || "";
    this._persistMobileAppearance();
    this._syncNightModeUi();
    this._toastSuccess(this._isHebrew()
      ? `טיימר שינה עודכן ל־${nextStep} דקות`
      : `Sleep timer updated to ${nextStep} minutes`);
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
        label: pick.name || this._m("Chill mix", "מיקס רגוע"),
        silent: true,
      });
      if (ok) {
        this._toastSuccess(this._m("Starting a chill mix", "מפעיל מיקס רגוע"));
      }
    } catch (error) {
      this._toastError(error?.message || this._m("Could not start chill mix", "לא ניתן להפעיל מיקס רגוע"));
    }
  }

  async _resolveQuickMixEntry() {
    const currentQueueItem = this._state.maQueueState?.current_item || null;
    const currentMedia = currentQueueItem?.media_item || {};
    const player = this._getSelectedPlayer();
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
        name: title || this._m("Quick mix", "מיקס מהיר"),
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
          name: best.name || title || this._m("Quick mix", "מיקס מהיר"),
        }
      : null;
  }

  async _startQuickMix() {
    try {
      const entry = await this._resolveQuickMixEntry();
      if (!entry?.uri || !this._supportsMusicAssistantRadioMode(entry.media_type || "")) {
        this._toastError(this._m("Could not build Quick Mix from the current song", "לא הצלחתי לבנות Quick Mix מהשיר הנוכחי"));
        return;
      }
      const ok = await this._playMedia(entry.uri, entry.media_type || "track", "play", {
        label: entry.name || this._m("Quick mix", "מיקס מהיר"),
        radioMode: true,
        silent: true,
      });
      if (ok) {
        this._toastSuccess(this._m("Quick mix started", "המיקס המהיר הופעל"));
        return;
      }
      this._toastError(this._m("Could not start Quick Mix", "לא ניתן להפעיל Quick Mix"));
    } catch (error) {
      this._toastError(error?.message || this._m("Could not start Quick Mix", "לא ניתן להפעיל Quick Mix"));
    }
  }

  _syncSleepTimerState() {
    const target = Number(this._state.mobileSleepTimerEndsAt || 0);
    if (!target) return;
    if (target > Date.now()) return;
    const entityId = String(this._state.mobileSleepTimerPlayer || this._state.selectedPlayer || "").trim();
    this._state.mobileSleepTimerEndsAt = 0;
    this._state.mobileSleepTimerPlayer = "";
    this._persistMobileAppearance();
    this._syncNightModeUi();
    if (entityId) {
      this._hass.callService("media_player", "media_pause", { entity_id: entityId });
    }
    this._toastSuccess(this._m("Sleep timer finished", "טיימר השינה הסתיים"));
  }

  _syncNightModeUi() {
    const card = this.shadowRoot?.querySelector(".card");
    const active = this._isNightModeActive();
    const mode = this._mobileNightMode();
    const sleepActive = this._sleepTimerRemainingMs() > 0;
    if (this._state.mobileNightRenderedActive !== active || this._state.mobileNightRenderedMode !== mode) {
      this._state.mobileNightRenderedActive = active;
      this._state.mobileNightRenderedMode = mode;
      const reopenMenu = this._state.menuOpen ? (this._state.menuPage || "settings") : "";
      this._build();
      this._init();
      if (reopenMenu) this._openMobileMenu(reopenMenu);
      return;
    }
    if (card) {
      card.classList.toggle("night-mode", active);
      card.classList.toggle("night-mode-enabled", mode !== "off");
    }
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
        ? this._isHebrew()
          ? `מצב לילה אוטומטי ${this._nightModeWindow().start}-${this._nightModeWindow().end}`
          : `Night mode auto ${this._nightModeWindow().start}-${this._nightModeWindow().end}`
        : mode === "on"
          ? this._m("Night mode is always on", "מצב לילה פעיל תמיד")
          : this._m("Night mode is off", "מצב לילה כבוי");
    }
    const sleepBtn = this.$("nightSleepBtn");
    if (sleepBtn) {
      sleepBtn.hidden = mode !== "on";
      sleepBtn.classList.toggle("active", sleepActive);
      sleepBtn.title = sleepActive
        ? this._isHebrew()
          ? `טיימר שינה פעיל: ${this._sleepTimerRemainingLabel()}`
          : `Sleep timer active: ${this._sleepTimerRemainingLabel()}`
        : this._m("Tap to start a sleep timer", "לחץ כדי להפעיל טיימר שינה");
    }
    const chillBtn = this.$("nightChillBtn");
    if (chillBtn) {
      chillBtn.hidden = mode !== "on";
    }
  }

  _persistMobileAppearance() {
    if (this._usesVisualSettings()) return;
    try { localStorage.setItem("ma_browser_card_mobile_custom_color", this._state.mobileCustomColor || "#f5a623"); } catch (_) {}
    try { localStorage.setItem("ma_browser_card_mobile_dynamic_theme_mode", this._mobileDynamicThemeMode()); } catch (_) {}
    try { localStorage.setItem("ma_browser_card_mobile_background_motion_mode", this._mobileBackgroundMotionMode()); } catch (_) {}
    try { localStorage.setItem("ma_browser_card_mobile_custom_text", this._state.mobileCustomTextTone || "light"); } catch (_) {}
    try { localStorage.setItem("ma_browser_card_mobile_font_scale", String(this._state.mobileFontScale || 1)); } catch (_) {}
    try { localStorage.setItem("ma_browser_card_mobile_night_mode", this._mobileNightMode()); } catch (_) {}
    try { localStorage.setItem("ma_browser_card_mobile_night_start", this._normalizeClockTime(this._state.mobileNightModeStart || "22:00", "22:00")); } catch (_) {}
    try { localStorage.setItem("ma_browser_card_mobile_night_end", this._normalizeClockTime(this._state.mobileNightModeEnd || "06:00", "06:00")); } catch (_) {}
    try { localStorage.setItem("ma_browser_card_mobile_night_days", JSON.stringify(this._nightModeDays())); } catch (_) {}
    try { localStorage.setItem("ma_browser_card_mobile_sleep_timer_at", String(Number(this._state.mobileSleepTimerEndsAt || 0) || 0)); } catch (_) {}
    try { localStorage.setItem("ma_browser_card_mobile_sleep_timer_player", this._state.mobileSleepTimerPlayer || ""); } catch (_) {}
    try { localStorage.setItem("ma_browser_card_mobile_compact_mode", JSON.stringify(!!this._state.mobileCompactMode)); } catch (_) {}
    try { localStorage.setItem("ma_browser_card_mobile_show_up_next", JSON.stringify(this._mobileShowUpNextEnabled())); } catch (_) {}
    try { localStorage.setItem("ma_browser_card_mobile_footer_search", JSON.stringify(!!this._state.mobileFooterSearchEnabled)); } catch (_) {}
    try { localStorage.setItem("ma_browser_card_mobile_footer_mode", this._state.mobileFooterMode || "both"); } catch (_) {}
    try { localStorage.setItem("ma_browser_card_mobile_home_shortcut", JSON.stringify(!!this._state.mobileHomeShortcutEnabled)); } catch (_) {}
    try { localStorage.setItem("ma_browser_card_mobile_volume_mode", this._mobileVolumeMode()); } catch (_) {}
    try { localStorage.setItem("ma_browser_card_mobile_mic_mode", this._mobileMicMode()); } catch (_) {}
    try { localStorage.setItem("ma_browser_card_mobile_library_tabs", JSON.stringify(this._mobileLibraryTabs())); } catch (_) {}
    try { localStorage.setItem("ma_browser_card_mobile_main_bar_items", JSON.stringify(this._mobileMainBarItems())); } catch (_) {}
    try { localStorage.setItem("ma_browser_card_mobile_liked_mode", this._state.mobileLikedMode || "ma"); } catch (_) {}
    try { localStorage.setItem("ma_browser_card_mobile_swipe_mode", this._state.mobileSwipeMode || "play"); } catch (_) {}
    try { localStorage.setItem("ma_browser_card_mobile_radio_country", this._mobileRadioBrowserCountry()); } catch (_) {}
    try { localStorage.setItem("ma_browser_card_mobile_announcement_presets", JSON.stringify(this._state.mobileAnnouncementPresets || [])); } catch (_) {}
    try { localStorage.setItem("ma_browser_card_mobile_announcement_tts_entity", this._state.mobileAnnouncementTtsEntity || ""); } catch (_) {}
    try { localStorage.setItem("ma_browser_card_mobile_pinned_player", this._pinnedPlayerPreference()); } catch (_) {}
  }

  _defaultMobileLibraryTabs() {
    return ["library_search", "library_playlists", "library_artists", "library_albums", "library_tracks", "library_radio", "library_podcasts"];
  }

  _defaultMobileMainBarItems() {
    return ["actions", "players", "library", "settings"];
  }

  _mobileHomeShortcutEnabled() {
    return !!this._state.mobileHomeShortcutEnabled;
  }

  _goHomeAssistantDashboard() {
    try {
      window.location.assign("/");
    } catch (_) {
      try { window.location.href = "/"; } catch (_) {}
    }
  }

  _mobileMainBarItems() {
    const allowed = new Set(["search", "library", "players", "actions", "settings", "theme"]);
    const hidePlayers = this._hasPinnedPlayer();
    const fallback = this._usesVisualSettings()
      ? this._defaultMobileMainBarItems().filter((item) => item !== "settings")
      : this._defaultMobileMainBarItems();
    const source = Array.isArray(this._state.mobileMainBarItems) && this._state.mobileMainBarItems.length
      ? this._state.mobileMainBarItems
      : fallback;
    const cleaned = source
      .filter((item) => allowed.has(item))
      .filter((item) => !(this._usesVisualSettings() && item === "settings"))
      .filter((item) => !(hidePlayers && item === "players"));
    const normalizedFallback = fallback.filter((item) => !(hidePlayers && item === "players"));
    return cleaned.length ? cleaned : normalizedFallback;
  }

  _mobileLibraryTabs() {
    const allowed = new Set(["library_playlists", "library_artists", "library_albums", "library_tracks", "library_radio", "library_podcasts", "library_liked", "library_search"]);
    const source = Array.isArray(this._state.mobileLibraryTabs) && this._state.mobileLibraryTabs.length
      ? this._state.mobileLibraryTabs
      : this._defaultMobileLibraryTabs();
    const cleaned = source.filter((tab) => allowed.has(tab));
    const tabs = cleaned.length ? cleaned : this._defaultMobileLibraryTabs();
    return tabs.includes("library_search")
      ? ["library_search", ...tabs.filter((tab) => tab !== "library_search")]
      : tabs;
  }

  _mobileFooterMode() {
    const mode = String(this._state.mobileFooterMode || "both");
    return ["icon", "text", "both"].includes(mode) ? mode : "both";
  }

  _mobileMicMode() {
    const mode = String(this._state.mobileMicMode || "on").toLowerCase();
    return ["on", "off", "smart"].includes(mode) ? mode : "on";
  }

  _mobileVolumeMode() {
    const mode = String(this._state.mobileVolumeMode || "button").toLowerCase();
    return ["always", "button"].includes(mode) ? mode : "button";
  }

  _entityMatchTokens(value = "") {
    return String(value || "")
      .toLowerCase()
      .replace(/^media_player\./, "")
      .replace(/^button\./, "")
      .replace(/[_\-.]+/g, " ")
      .split(/\s+/)
      .map((token) => token.trim())
      .filter((token) => token && token.length > 1);
  }

  _favoriteButtonEntityForPlayer(player = null) {
    const explicit = String(this._config?.favorite_button_entity || "").trim();
    if (explicit && this._hass?.states?.[explicit]) return explicit;
    if (this._hass?.states?.["button.bathroom_favorite_current_song_2"]) {
      const selected = player || this._getSelectedPlayer();
      const selectedName = `${selected?.entity_id || ""} ${selected?.attributes?.friendly_name || ""}`.toLowerCase();
      if (!selectedName || selectedName.includes("bathroom") || selectedName.includes("מקלחת")) {
        return "button.bathroom_favorite_current_song_2";
      }
    }
    const buttons = Object.values(this._hass?.states || {}).filter((entity) => {
      if (!entity?.entity_id?.startsWith("button.")) return false;
      const search = `${entity.entity_id} ${entity.attributes?.friendly_name || ""}`.toLowerCase();
      return search.includes("favorite") || search.includes("אהוב") || search.includes("אהבתי");
    });
    if (!buttons.length) return "";
    if (buttons.length === 1) return buttons[0]?.entity_id || "";
    const tokens = [
      ...this._entityMatchTokens(player?.entity_id || ""),
      ...this._entityMatchTokens(player?.attributes?.friendly_name || ""),
    ].filter((token) => !["media", "player", "speaker", "room", "homeii", "browser", "music", "assistant", "רמקולים", "נגן"].includes(token));
    const scored = buttons
      .map((entity) => {
        const haystack = `${entity.entity_id} ${entity.attributes?.friendly_name || ""}`.toLowerCase();
        const score = tokens.reduce((sum, token) => sum + (haystack.includes(token) ? 1 : 0), 0);
        const currentSongBoost = /(current|song|track|playing|נוכחי|מתנגן)/.test(haystack) ? 0.5 : 0;
        return { entity_id: entity.entity_id, score: score + currentSongBoost };
      })
      .sort((a, b) => b.score - a.score);
    if (scored[0]?.score > 0) return scored[0].entity_id;
    const genericCurrent = buttons.find((entity) => /(current|song|track|playing|נוכחי|מתנגן)/.test(`${entity.entity_id} ${entity.attributes?.friendly_name || ""}`.toLowerCase()));
    if (genericCurrent?.entity_id) return genericCurrent.entity_id;
    return "";
  }

  _favoriteButtonDeviceId(entityId = "") {
    const target = String(entityId || "").trim();
    if (!target) return "";
    return String(this._hass?.entities?.[target]?.device_id || "").trim();
  }

  _favoriteButtonEntity() {
    return this._favoriteButtonEntityForPlayer(this._getSelectedPlayer());
  }

  _entryTargetsCurrentMedia(entry = {}) {
    const current = this._currentMediaLikeMeta();
    const currentUri = String(current?.uri || "").trim();
    const entryUri = String(entry?.uri || "").trim();
    if (currentUri && entryUri) {
      return this._mediaRefsEquivalent(currentUri, entryUri, entry?.media_type || current?.media_type || "track");
    }
    const currentTitle = String(current?.name || "").trim().toLowerCase();
    const entryTitle = String(entry?.name || entry?.title || "").trim().toLowerCase();
    if (!currentTitle || !entryTitle || currentTitle !== entryTitle) return false;
    const currentArtist = String(current?.artist || "").trim().toLowerCase();
    const entryArtist = String(entry?.artist || "").trim().toLowerCase();
    return !currentArtist || !entryArtist || currentArtist === entryArtist || currentArtist.includes(entryArtist) || entryArtist.includes(currentArtist);
  }

  async _pressFavoriteButtonEntity(entityId = "") {
    const target = String(entityId || "").trim();
    if (!target) return false;
    const deviceId = this._favoriteButtonDeviceId(target);
    if (deviceId) {
      await this._hass.callService("button", "press", { device_id: deviceId });
      return true;
    }
    await this._hass.callService("button", "press", { entity_id: target });
    return true;
  }

  async _unfavoriteCurrentViaMassQueue() {
    const player = this._getSelectedPlayer();
    const entityId = String(player?.entity_id || this._state.selectedPlayer || "").trim();
    if (!entityId || !this._hass?.services?.mass_queue?.unfavorite_current_item) return false;
    await this._hass.callService("mass_queue", "unfavorite_current_item", { entity: entityId });
    return true;
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

  async _waitForFavoriteState(entry = {}, expected = true, delays = [500, 1500, 3200]) {
    for (const delay of delays) {
      await new Promise((resolve) => window.setTimeout(resolve, delay));
      await this._refreshFavoriteState(true);
      if (!!this._isEntryLiked(entry) === !!expected) return true;
    }
    return !!this._isEntryLiked(entry) === !!expected;
  }

  _useMaLikedMode() {
    if (this._config?.allow_local_likes !== true) return true;
    return String(this._state.mobileLikedMode || "ma") === "ma";
  }

  _mobileSwipeMode() {
    return String(this._state.mobileSwipeMode || "play") === "browse" ? "browse" : "play";
  }

  _activePlayingPlayers() {
    return (this._state.players || []).filter((p) => p?.state === "playing");
  }

  _announcementEligiblePlayers() {
    return (this._state.players || [])
      .filter((player) => player?.entity_id)
      .filter((player) => !this._isLikelyBrowserPlayer(player));
  }

  _announcementTargetValue() {
    const raw = String(this._state.mobileAnnouncementTarget || "").trim();
    if (raw === "all") return "all";
    const eligible = this._announcementEligiblePlayers();
    if (eligible.some((player) => player.entity_id === raw)) return raw;
    return this._state.selectedPlayer || eligible[0]?.entity_id || "";
  }

  _mobileNavigableActivePlayers() {
    const pinnedEntity = this._resolvedPinnedPlayerEntity();
    if (pinnedEntity) {
      const pinnedPlayer = (this._state.players || []).find((player) => player.entity_id === pinnedEntity);
      return pinnedPlayer ? [pinnedPlayer] : [];
    }
    return (this._state.players || [])
      .filter((player) => this._isPlayerActive(player))
      .filter((player) => !this._isLikelyBrowserPlayer(player));
  }

  _syncMobilePlayerNavButtons() {
    const enabled = !this._hasPinnedPlayer() && this._mobileNavigableActivePlayers().length > 1;
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

  _cycleActivePlayer(step = 1) {
    if (this._hasPinnedPlayer()) {
      this._syncMobilePlayerNavButtons();
      return;
    }
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
    const ids = Array.isArray(player?.attributes?.group_members)
      ? player.attributes.group_members.filter(Boolean)
      : [];
    if (player?.entity_id && ids.length && !ids.includes(player.entity_id)) ids.unshift(player.entity_id);
    return [...new Set(ids)];
  }

  _playerGroupCount(player) {
    if (this._isStaticGroupPlayer(player)) return 0;
    const count = this._playerGroupMemberIds(player).length;
    return count > 1 ? count : 0;
  }

  _playerGroupMemberNames(player) {
    const ids = this._playerGroupMemberIds(player);
    const byId = new Map((this._state.players || []).map((p) => [p.entity_id, p]));
    return ids
      .map((id) => byId.get(id)?.attributes?.friendly_name || id)
      .filter(Boolean);
  }

  _isStaticGroupPlayer(player) {
    if (!player) return false;
    const attrs = player.attributes || {};
    const typeText = [
      player.entity_id,
      attrs.friendly_name,
      attrs.mass_player_type,
      attrs.player_type,
      attrs.type,
      attrs.grouping_type,
      attrs.group_type,
      attrs.device_class,
    ].map((value) => String(value || "").toLowerCase()).join(" ");
    const looksLikeGroup = !!(attrs.is_group || attrs.is_group_player || attrs.group_childs || attrs.group_children || attrs.group_members?.length > 1);
    return looksLikeGroup && /(sync|static|group|party|all speakers|whole home|everywhere)/.test(typeText);
  }

  _groupAverageVolume(player) {
    const ids = this._playerGroupMemberIds(player);
    const byId = new Map((this._state.players || []).map((p) => [p.entity_id, p]));
    const volumes = ids
      .map((id) => byId.get(id)?.attributes?.volume_level)
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value));
    if (!volumes.length) return Math.round((player?.attributes?.volume_level || 0) * 100);
    return Math.round((volumes.reduce((sum, value) => sum + value, 0) / volumes.length) * 100);
  }

  _groupedPlayerIds() {
    const ids = new Set();
    const byId = new Map((this._state.players || []).map((p) => [p.entity_id, p]));
    for (const player of (this._state.players || [])) {
      if (this._isLikelyBrowserPlayer(player)) continue;
      if (this._isStaticGroupPlayer(player)) continue;
      const members = this._playerGroupMemberIds(player);
      if (members.length > 1) {
        members
          .filter((id) => id && id !== player.entity_id)
          .filter((id) => !this._isLikelyBrowserPlayer(byId.get(id)))
          .filter((id) => !this._isStaticGroupPlayer(byId.get(id)))
          .forEach((id) => ids.add(id));
      }
    }
    return Array.from(ids);
  }

  async _disconnectPlayerGroups(options = {}) {
    const ids = this._groupedPlayerIds();
    if (!ids.length) {
      if (!options.silent) this._toastSuccess(this._m("No player groups to disconnect", "אין קבוצות נגנים לניתוק"));
      return { ok: true, count: 0, failed: false };
    }
    const dynamicIds = ids.filter((id) => {
      const target = (this._state.players || []).find((p) => p.entity_id === id) || this._hass?.states?.[id];
      return target && !this._isStaticGroupPlayer(target);
    });
    if (!dynamicIds.length) {
      if (!options.silent) this._toastSuccess(this._m("No dynamic player groups to disconnect", "אין קבוצות נגנים דינמיות לניתוק"));
      return { ok: true, count: 0, failed: false };
    }
    const results = await Promise.allSettled(dynamicIds.map((id) => this._callHaServiceRaw("media_player", "unjoin", { entity_id: id })));
    const succeeded = results.filter((result) => result.status === "fulfilled").length;
    const failed = succeeded === 0;
    setTimeout(() => {
      this._loadPlayers();
      this._refreshGroupingState();
      if (this._state.menuOpen) this._renderMobileMenu();
    }, 550);
    if (!options.silent) {
      (failed ? this._toastError : this._toastSuccess).call(this, failed
        ? this._m("Player groups could not be disconnected", "קבוצות הנגנים לא נותקו")
        : this._m("All player groups disconnected", "כל קבוצות הנגנים נותקו"));
    }
    return { ok: !failed, count: dynamicIds.length, failed };
  }

  async _stopAllPlayers() {
    const activePlayers = this._activePlayingPlayers();
    const groupedIds = this._groupedPlayerIds();
    const targetIds = [...new Set([
      ...activePlayers.map((player) => player.entity_id).filter(Boolean),
      ...groupedIds,
    ])];
    if (!targetIds.length) {
      this._toastError(this._m("No active players", "אין נגנים פעילים"));
      return;
    }
    this._hapticTap([18, 24, 18]);
    const results = await Promise.allSettled(targetIds.map((entityId) => this._clearQueueForPlayer(entityId)));
    const groupResult = await this._disconnectPlayerGroups({ silent: true });
    const failed = results.some((result) => result.status === "rejected") || groupResult.failed;
    (failed ? this._toastError : this._toastSuccess).call(this, failed
      ? this._m("Some players could not be stopped or cleared", "חלק מהנגנים לא נעצרו או לא נוקו")
      : this._m("Stopped all players, cleared playlists and disconnected groups", "כל הנגנים נעצרו, התורים נוקו והקבוצות נותקו"));
    setTimeout(() => this._updateNowPlayingState(), 500);
  }

  async _ungroupAllPlayers() {
    this._hapticTap([14, 18, 14]);
    await this._disconnectPlayerGroups();
  }

  _menuPageIcon(page) {
    const map = {
      main: "menu",
      settings: "settings",
      queue: "queue",
      players: "speaker",
      players_active: "stats",
      transfer: "repeat",
      group: "speaker",
      ungroup_all: "speaker",
      stop_all: "stop",
      announcements: "announcement",
      library_liked: "heart_filled",
      library_playlists: "playlist",
      library_artists: "artist",
      library_albums: "album",
      library_tracks: "tracks",
      library_radio: "radio",
      library_podcasts: "podcast",
      library_search: "search",
    };
    return map[page] || "menu";
  }

  _setMobileMenuHeader(label, iconName, titleAction = "") {
    const title = this.$("mobileMenuTitle");
    if (!title) return;
    title.innerHTML = `<span class="menu-title-icon">${this._iconSvg(iconName)}</span><span class="menu-title-text">${this._esc(label)}</span>`;
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

  _setPlayerVolumeFor(entityId, level) {
    const normalized = Math.max(0, Math.min(1, Number(level) || 0));
    if (!entityId) return;
    this._hass.callService("media_player", "volume_set", { entity_id: entityId, volume_level: normalized });
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
    if (!entityId) return;
    const player = (this._state.players || []).find((p) => p.entity_id === entityId) || this._hass?.states?.[entityId];
    if (!player) return;
    const currentlyMuted = this._isMuted(player);
    try {
      await this._hass.callService("media_player", "volume_mute", { entity_id: entityId, is_volume_muted: !currentlyMuted });
    } catch (_) {}
    if (!currentlyMuted) this._softMutedPlayers.add(entityId);
    else this._softMutedPlayers.delete(entityId);
    setTimeout(() => this._renderMobileMenu(), 120);
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
    await Promise.all(targets.map(async (id) => {
      try {
        await this._hass.callService("media_player", "volume_mute", { entity_id: id, is_volume_muted: shouldMute });
      } catch (_) {}
      if (shouldMute) this._softMutedPlayers.add(id);
      else this._softMutedPlayers.delete(id);
    }));
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
    const icon = `<span class="footer-theme-ic" aria-hidden="true">${effective === "dark" ? "☀" : "☾"}</span>`;
    const label = `<span class="footer-btn-label">${this._esc(this._m("Theme", "ערכת נושא"))}</span>`;
    if (mode === "icon") return icon;
    if (mode === "text") return label;
    return `${icon}${label}`;
  }

  _mobileCurrentQueueIndex() {
    const rawIndex = this._state.maQueueState?.current_index;
    const currentIndex = rawIndex !== "" && rawIndex !== null && rawIndex !== undefined ? Number(rawIndex) : NaN;
    if (Number.isFinite(currentIndex)) return currentIndex;
    return -1;
  }

  _mobileQueueItemsSorted() {
    return [...(this._state.queueItems || [])]
      .filter(Boolean)
      .sort((a, b) => Number(a?.sort_index ?? 0) - Number(b?.sort_index ?? 0));
  }

  _mobileArtStackContext() {
    const queueItems = this._mobileQueueItemsSorted();
    const currentIndex = this._mobileCurrentQueueIndex();
    const player = this._getSelectedPlayer();
    const currentItem = this._state.maQueueState?.current_item || null;
    const hasPendingPlay = Number(this._state.mobileQueuePlayPendingUntil || 0) > Date.now();
    const pendingKey = String(this._state.mobileQueuePlayPendingKey || "").trim();
    const pendingUri = String(this._state.mobileQueuePlayPendingUri || "").trim();
    const pendingIndexRaw = this._state.mobileQueuePlayPendingIndex;
    const pendingIndex = pendingIndexRaw !== "" && pendingIndexRaw !== null && pendingIndexRaw !== undefined ? Number(pendingIndexRaw) : NaN;
    const playerUri = String(player?.attributes?.media_content_id || "").trim();
    const currentItemTitle = currentItem?.media_item?.name || currentItem?.media_title || currentItem?.name || "";
    const currentItemArtist = currentItem?.media_artist || (currentItem?.media_item?.artists || []).map((artist) => artist?.name).filter(Boolean).join(", ") || "";
    const playerTitle = String(hasPendingPlay ? (currentItemTitle || player?.attributes?.media_title || "") : (player?.attributes?.media_title || currentItemTitle || "")).trim().toLowerCase();
    const playerArtist = String(hasPendingPlay ? (currentItemArtist || player?.attributes?.media_artist || "") : (player?.attributes?.media_artist || currentItemArtist || "")).trim().toLowerCase();
    let baseIndex = -1;
    const titleMatches = (item) => {
      if (!item || !playerTitle) return false;
      const title = String(item?.media_item?.name || item?.media_title || item?.name || "").trim().toLowerCase();
      const artists = String(item?.media_artist || (item?.media_item?.artists || []).map((artist) => artist?.name).filter(Boolean).join(", ") || "").trim().toLowerCase();
      return title === playerTitle && (!playerArtist || artists.includes(playerArtist) || playerArtist.includes(artists));
    };
    if (hasPendingPlay) {
      const pendingMatch = queueItems.findIndex((item) =>
        (pendingKey && this._getQueueItemKey(item) === pendingKey)
        || (pendingUri && this._mediaRefsEquivalent(this._getQueueItemUri(item), pendingUri, item?.media_item?.media_type || item?.media_type || "track"))
        || (Number.isFinite(pendingIndex) && Number(item?.sort_index) === pendingIndex)
      );
      if (pendingMatch >= 0) baseIndex = pendingMatch;
    }
    if (currentItem) {
      const currentKey = this._getQueueItemKey(currentItem);
      const currentUri = this._getQueueItemUri(currentItem);
      const keyIndex = queueItems.findIndex((item) =>
        (currentKey && this._getQueueItemKey(item) === currentKey)
        || (currentUri && this._mediaRefsEquivalent(this._getQueueItemUri(item), currentUri, item?.media_item?.media_type || item?.media_type || "track"))
      );
      if (keyIndex >= 0 && (hasPendingPlay || !playerTitle || titleMatches(queueItems[keyIndex]))) baseIndex = keyIndex;
    }
    if (baseIndex < 0 && playerUri) {
      baseIndex = queueItems.findIndex((item) => this._mediaRefsEquivalent(this._getQueueItemUri(item), playerUri, item?.media_item?.media_type || item?.media_type || "track"));
    }
    if (baseIndex < 0 && !playerUri && playerTitle) {
      baseIndex = queueItems.findIndex((item) => titleMatches(item));
    }
    if (baseIndex < 0 && Number.isFinite(currentIndex)) {
      baseIndex = queueItems.findIndex((item) => Number(item?.sort_index) === currentIndex);
    }
    if (baseIndex < 0 && Number.isFinite(currentIndex) && currentIndex >= 0 && currentIndex < queueItems.length) {
      baseIndex = currentIndex;
    }
    if (baseIndex < 0) baseIndex = 0;
    const minOffset = queueItems.length ? -baseIndex : 0;
    const maxOffset = queueItems.length ? (queueItems.length - 1 - baseIndex) : 0;
    const offset = Math.max(minOffset, Math.min(maxOffset, Number(this._state.mobileArtBrowseOffset || 0)));
    const displayIndex = Math.max(0, Math.min(queueItems.length - 1, baseIndex + offset));
    return { queueItems, baseIndex, displayIndex, offset };
  }

  _mobileArtStackItems() {
    const { queueItems, displayIndex, offset } = this._mobileArtStackContext();
    const current = queueItems[displayIndex] || this._state.maQueueState?.current_item || null;
    const previous = displayIndex > 0 ? queueItems[displayIndex - 1] : null;
    const next = displayIndex < queueItems.length - 1 ? queueItems[displayIndex + 1] : this._state.maQueueState?.next_item || null;
    return { previous, current, next, offset };
  }

  _setOptimisticMobileQueueItem(item) {
    if (!item) return;
    const queueItems = this._mobileQueueItemsSorted();
    const key = this._getQueueItemKey(item);
    const itemIndex = queueItems.findIndex((candidate) => this._getQueueItemKey(candidate) === key);
    const sortIndex = Number(item?.sort_index);
    const currentIndex = Number.isFinite(sortIndex) ? sortIndex : (itemIndex >= 0 ? itemIndex : this._state.maQueueState?.current_index);
    this._markMobileQueuePlayPending(item, Number(currentIndex));
    this._state.maQueueState = {
      ...(this._state.maQueueState || {}),
      current_index: currentIndex,
      current_item: item,
      next_item: itemIndex >= 0 ? (queueItems[itemIndex + 1] || null) : (this._state.maQueueState?.next_item || null),
    };
    this._state.mobileArtAnchorKey = key || this._getQueueItemUri(item) || "";
    this._state.mobileArtBrowseOffset = 0;
  }

  _mobileArtStackRenderKey() {
    const stack = this._mobileArtStackItems();
    return [
      this._getQueueItemKey(stack.previous) || "p0",
      this._getQueueItemKey(stack.current) || "c0",
      this._getQueueItemKey(stack.next) || "n0",
      this._mobileSwipeMode(),
    ].join("|");
  }

  _mobileArtFallbackHtml() {
    return `
      <div class="art-stack-fallback static-fallback">
        <div class="fallback-aura"></div>
        <div class="fallback-disc fallback-note">${this._iconSvg("music_note")}</div>
      </div>
    `;
  }

  _mobileStackCardHtml(item, position = "center") {
    const isCurrent = position === "center";
    const art = this._queueItemImageUrl(item, isCurrent ? 420 : 220)
      || item?.media_image
      || item?.image
      || item?.image_url
      || item?.media_item?.image
      || item?.media_item?.image_url
      || item?.media_item?.album?.image
      || item?.media_item?.album?.image_url
      || (isCurrent ? (this._getSelectedPlayer()?.attributes?.entity_picture_local || this._getSelectedPlayer()?.attributes?.entity_picture || "") : "");
    const label = item?.media_item?.name || item?.name || (isCurrent ? (this._getSelectedPlayer()?.attributes?.media_title || "") : "");
    return `
      <div class="art-stack-card ${position} ${!art ? "placeholder" : ""}">
        ${art ? `<img src="${this._esc(art)}" alt="${this._esc(label)}">` : this._mobileArtFallbackHtml()}
      </div>
    `;
  }

  _mobileStackSlideHtml(item, position = "center") {
    const queueItemId = this._getQueueItemKey(item);
    const uri = item?.media_item?.uri || item?.uri || "";
    const mediaType = item?.media_item?.media_type || item?.media_type || "track";
    const sortIndex = Number.isFinite(Number(item?.sort_index)) ? Number(item.sort_index) : "";
    return `
      <div class="art-stack-slide ${position}" data-art-position="${position}" data-queue-item-id="${this._esc(queueItemId || "")}" data-uri="${this._esc(uri)}" data-type="${this._esc(mediaType)}" data-sort-index="${this._esc(sortIndex)}">
        ${this._mobileStackCardHtml(item, position)}
      </div>
    `;
  }

  _mobileArtworkStackHtml() {
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
    const urls = [stack.previous, stack.current, stack.next]
      .map((item) => this._queueItemImageUrl(item, 420) || item?.media_image || item?.image || item?.image_url || item?.media_item?.image || item?.media_item?.image_url || item?.media_item?.album?.image || "")
      .filter(Boolean);
    for (const src of urls) {
      try {
        const img = new Image();
        img.decoding = "async";
        img.src = src;
      } catch (_) {}
    }
  }

  async _ensureEmblaLoaded() {
    if (window.EmblaCarousel) return window.EmblaCarousel;
    if (this._mobileEmblaLoadPromise) return this._mobileEmblaLoadPromise;
    const src = this._config.mobile_embla_url || "/local/vendor/embla-carousel.umd.js";
    this._mobileEmblaLoadPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector('script[data-homeii-embla]');
      if (existing) {
        if (window.EmblaCarousel) return resolve(window.EmblaCarousel);
        existing.addEventListener("load", () => resolve(window.EmblaCarousel), { once: true });
        existing.addEventListener("error", reject, { once: true });
        return;
      }
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.dataset.homeiiEmbla = "1";
      script.onload = () => resolve(window.EmblaCarousel);
      script.onerror = reject;
      document.head.appendChild(script);
    });
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
    if (this._mobileSwipeMode() !== "browse" || !Number(this._state.mobileArtBrowseOffset || 0)) return;
    this._mobileArtBrowseResetTimer = setTimeout(() => {
      this._state.mobileArtBrowseOffset = 0;
      this._refreshMobileArtStack(true);
    }, 7000);
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
    const touch = e.touches?.[0];
    if (!touch) return;
    this._state.activeArtworkTouch = { x: touch.clientX, y: touch.clientY, t: Date.now(), dx: 0, active: true };
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
    if (Math.abs(dx) <= Math.abs(dy)) return;
    if (e.cancelable) e.preventDefault();
    const limited = Math.max(-92, Math.min(92, dx * 0.72));
    this._setArtDragOffset(limited);
  }

  _setArtDragOffset(px = 0) {
    const artHost = this.$("npArt");
    if (artHost) artHost.style.setProperty("--art-drag-x", `${Math.round(px)}px`);
  }

  _clearArtDragOffset() {
    const artHost = this.$("npArt");
    if (artHost) artHost.style.setProperty("--art-drag-x", "0px");
  }

  _commitArtSwipe(direction, applyChange) {
    const artShell = this.$("mobileArtShell");
    const artHost = this.$("npArt");
    if (!artShell) {
      applyChange?.();
      return;
    }
    artShell.classList.remove("dragging", "commit-next", "commit-prev");
    artHost?.classList.remove("dragging", "resetting");
    this._setArtDragOffset(direction === "next" ? -132 : 132);
    setTimeout(() => {
      artHost?.classList.add("resetting");
      applyChange?.();
      this._clearArtDragOffset();
      requestAnimationFrame(() => {
        artHost?.classList.remove("resetting", "dragging");
        artShell.classList.remove("commit-next", "commit-prev", "swipe-next", "swipe-prev");
      });
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
    if (Math.abs(dx) < 34 || Math.abs(dx) < Math.abs(dy) || dt > 650) {
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
        this._playQueueItem(targetQueueItemId, targetUri, targetType, targetSortIndex)
          .then((ok) => { if (!ok) this._ensureQueueSnapshot(true); })
          .catch(() => this._ensureQueueSnapshot(true));
      } else {
        this._playAdjacentRadioStation(dx < 0 ? "next" : "previous").then((playedRadio) => {
          if (playedRadio) return;
          this._state.mobileArtBrowseOffset = dx < 0 ? 1 : -1;
          this._refreshMobileArtStack(true);
          this._playerCmd(dx < 0 ? "next" : "previous");
        });
      }
    });
  }

  _refreshMobileArtStack(force = false) {
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
      artHost.innerHTML = this._mobileArtworkStackHtml();
      this._state.mobileArtRenderKey = renderKey;
      queueMicrotask(() => this._initMobileArtCarousel());
    }
    const currentQueueItem = this._state.maQueueState?.current_item || null;
    const playingArt = this._queueItemImageUrl(currentQueueItem, 420)
      || currentQueueItem?.media_image
      || currentQueueItem?.image
      || currentQueueItem?.image_url
      || currentQueueItem?.media_item?.image
      || currentQueueItem?.media_item?.image_url
      || currentQueueItem?.media_item?.album?.image
      || currentQueueItem?.media_item?.album?.image_url
      || player?.attributes?.entity_picture_local
      || player?.attributes?.entity_picture
      || "";
    const previewArt = this._queueItemImageUrl(stack.current, 420)
      || stack.current?.media_image
      || stack.current?.image
      || stack.current?.image_url
      || stack.current?.media_item?.image
      || stack.current?.media_item?.image_url
      || stack.current?.media_item?.album?.image
      || stack.current?.media_item?.album?.image_url
      || playingArt;
    const art = (this._mobileSwipeMode() === "browse" && stack.offset !== 0) ? playingArt : previewArt;
    if (artAura) artAura.style.backgroundImage = art ? `url("${this._esc(art)}")` : "";
    if (heroAura) heroAura.style.backgroundImage = art ? `url("${this._esc(art)}")` : "";
    if (this._mobileSwipeMode() === "browse" && stack.offset !== 0) {
      const browseTitle = stack.current?.media_item?.name || stack.current?.name || player?.attributes?.media_title || this._m("Nothing playing", "לא מתנגן");
      const browseArtist = stack.current?.media_item?.artists?.map((a) => a.name).join(", ")
        || stack.current?.artist_str
        || player?.attributes?.media_artist
        || "";
      const browseAlbum = stack.current?.media_item?.album?.name || player?.attributes?.media_album_name || "";
      if (this.$("npTitle")) this.$("npTitle").textContent = browseTitle;
      if (this.$("npSub")) this.$("npSub").textContent = [browseArtist, browseAlbum].filter(Boolean).join(" · ") || "—";
      this._scheduleMobileArtBrowseReset();
    } else {
      const hasPendingPlay = Number(this._state.mobileQueuePlayPendingUntil || 0) > Date.now();
      const queueTitle = currentQueueItem?.media_item?.name || currentQueueItem?.media_title || currentQueueItem?.name || "";
      const queueArtist = currentQueueItem?.media_artist || (currentQueueItem?.media_item?.artists || []).map((a) => a?.name).filter(Boolean).join(", ") || "";
      const queueAlbum = currentQueueItem?.media_item?.album?.name || currentQueueItem?.media_album_name || "";
      if (this.$("npTitle")) this.$("npTitle").textContent = hasPendingPlay
        ? (queueTitle || player?.attributes?.media_title || this._m("Nothing playing", "לא מתנגן"))
        : (player?.attributes?.media_title || queueTitle || this._m("Nothing playing", "לא מתנגן"));
      const subParts = hasPendingPlay
        ? [queueArtist || player?.attributes?.media_artist || "", queueAlbum || player?.attributes?.media_album_name || ""]
        : [player?.attributes?.media_artist || queueArtist || "", player?.attributes?.media_album_name || queueAlbum || ""];
      if (this.$("npSub")) this.$("npSub").textContent = subParts.filter(Boolean).join(" · ") || "—";
      clearTimeout(this._mobileArtBrowseResetTimer);
      this._mobileArtBrowseResetTimer = null;
    }
  }

  async _handleMobileArtTap(e) {
    if (Date.now() - Number(this._state.mobileArtJustSwipedAt || 0) < 260) return;
    const slide = e.target.closest(".art-stack-slide");
    if (!slide) return;
    const position = slide.dataset.artPosition || "center";
    if (this._mobileSwipeMode() !== "browse") {
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
    const queueItemId = slide.dataset.queueItemId || "";
    const uri = slide.dataset.uri || "";
    if (!queueItemId && !uri) return;
    const played = await this._playQueueItem(queueItemId, uri, slide.dataset.type || "track", slide.dataset.sortIndex || "");
    if (!played) return;
    this._state.mobileArtBrowseOffset = 0;
    clearTimeout(this._mobileArtBrowseResetTimer);
    this._mobileArtBrowseResetTimer = null;
    this._refreshMobileArtStack(true);
  }

  _build() {
    const rtl = this._isHebrew();
    const theme = this._effectiveTheme();
    const visualTheme = this._visualTheme();
    const layoutMode = this._layoutModeConfig();
    const compactMode = this._mobileCompactModeEnabled();
    const compactTileMode = this._isCompactTileMode();
    const nightMode = this._mobileNightMode();
    const nightActive = this._isNightModeActive();
    const sleepTimerActive = this._sleepTimerRemainingMs() > 0;
    const showNightRow = nightMode !== "off";
    const height = Number(this._config.height || 760);
    this._state.mobileNightRenderedActive = nightActive;
    this._state.mobileNightRenderedMode = nightMode;
    const nightQuickRowHtml = showNightRow ? `
      <div class="night-quick-row ${nightMode === "auto" ? "auto-mode" : "on-mode"}" id="nightQuickRow" ${showNightRow ? "" : "hidden"}>
        <button class="night-quick-btn icon-only ${nightActive || nightMode === "on" ? "active" : "soft"}" id="nightModeQuickBtn" title="${this._esc(this._m("Night mode", "מצב לילה"))}">
          ${this._iconSvg("moon")}
        </button>
        <button class="night-quick-btn icon-only ${sleepTimerActive ? "active" : ""}" id="nightSleepBtn" title="${this._esc(this._m("Sleep timer", "טיימר שינה"))}" ${nightMode === "on" ? "" : "hidden"}>
          ${this._iconSvg("timer")}
        </button>
        <button class="night-quick-btn icon-only soft" id="nightChillBtn" title="${this._esc(this._m("Chill mix", "מיקס רגוע"))}" ${nightMode === "on" ? "" : "hidden"}>
          ${this._iconSvg("wand")}
        </button>
      </div>` : ``;
    const playerFocusCoreHtml = `
        <button class="player-focus" id="activePlayerChip" title="${this._m("Choose Player", "בחר נגן")}">
          <span class="player-focus-copy">
            <span class="player-focus-name" id="selectedPlayerTitle">${this._m("Selected Player", "נגן נבחר")}</span>
            <span class="player-focus-tags" id="selectedPlayerTags"></span>
          </span>
          <span class="player-focus-art-wrap" aria-hidden="true">
            <span class="player-focus-art" id="selectedPlayerThumb"></span>
          </span>
        </button>
      `;
    const playerFocusHtml = playerFocusCoreHtml;
    const volumeMode = layoutMode === "tablet" ? this._mobileVolumeMode() : (compactMode ? "button" : "always");
    const mainBarItems = this._mobileMainBarItems();
    const controlRoomEnabled = this._controlRoomEnabled();
    const mainBarButtons = [];
    if (controlRoomEnabled) {
      mainBarButtons.push(`<button class="footer-btn control-room-entry" data-mainbar-action="control_room" title="${this._m("Control Room", "חדר בקרה")}">${this._mobileFooterButtonInner("grid", this._m("Control Room", "חדר בקרה"))}</button>`);
    }
    if (mainBarItems.includes("actions")) {
      mainBarButtons.push(`<button class="footer-btn" data-mainbar-action="actions" title="${this._m("Actions", "פעולות")}">${this._mobileFooterButtonInner("menu", this._m("Actions", "פעולות"))}</button>`);
    }
    if (mainBarItems.includes("players")) {
      mainBarButtons.push(`<button class="footer-btn" data-mainbar-action="players" title="${this._m("Players", "נגנים")}">${this._mobileFooterButtonInner("speaker", this._m("Players", "נגנים"))}</button>`);
    }
    if (mainBarItems.includes("library")) {
      mainBarButtons.push(`<button class="footer-btn soft-accent" data-mainbar-action="library" title="${this._m("Library", "ספריה")}">${this._mobileFooterButtonInner("library_music", this._m("Library", "ספריה"))}</button>`);
    }
    if (mainBarItems.includes("search")) {
      mainBarButtons.push(`<button class="footer-btn" data-mainbar-action="search" title="${this._m("Search", "חיפוש")}">${this._mobileFooterButtonInner("search", this._m("Search", "חיפוש"))}</button>`);
    }
    if (mainBarItems.includes("settings")) {
      mainBarButtons.push(`<button class="footer-btn accent" data-mainbar-action="settings" title="${this._m("Settings", "הגדרות")}">${this._mobileFooterButtonInner("settings", this._m("Settings", "הגדרות"))}</button>`);
    }
    if (mainBarItems.includes("theme")) {
      mainBarButtons.push(`<button class="footer-btn" data-mainbar-action="theme" title="${this._m("Theme", "ערכת נושא")}">${this._mobileThemeFooterInner()}</button>`);
    }
    const volumeHtml = `
      <div class="mobile-volume-inline${layoutMode === "tablet" ? " tablet-volume-inline" : ""}">
        <button class="volume-value" id="mobileVolPctLabel" title="${this._m("Volume presets", "בחירת ווליום")}">50%</button>
        <div class="tablet-volume-track">
          <input class="volume-slider" id="volSlider" type="range" min="0" max="100" value="50" style="--vol-pct:50%">
        </div>
        <button class="volume-btn" id="btnMute">${this._iconSvg("volume_high")}</button>
      </div>`;
    const footerHtml = `<div class="footer-nav">${mainBarButtons.join("")}</div>`;
    const topSettingsFabHtml = compactTileMode || this._usesVisualSettings() || mainBarItems.includes("settings")
      ? ``
      : `<button class="top-settings-fab ${rtl ? "rtl" : "ltr"}" data-mainbar-action="settings" title="${this._m("Settings", "הגדרות")}">${this._iconSvg("settings")}</button>`;
    const compactCollapseFabHtml = compactMode && !compactTileMode
      ? `<button class="compact-collapse-fab ${rtl ? "rtl" : "ltr"}" id="compactCollapseBtn" title="${this._m("Collapse compact player", "חזרה למצב קומפקטי")}">${this._iconSvg("close")}</button>`
      : ``;
    const homeShortcutFabHtml = !compactTileMode && this._mobileHomeShortcutEnabled()
      ? `<button class="home-shortcut-fab ${layoutMode === "tablet" ? "tablet" : "mobile"} ${rtl ? "ltr" : "rtl"}" id="homeShortcutFab" title="${this._m("Home", "בית")}">${this._iconSvg("home")}</button>`
      : ``;
    const historyEdgeClass = rtl ? "left-edge" : "right-edge";
    const historyToggleFabHtml = !compactTileMode
      ? `<button class="history-toggle-fab ${historyEdgeClass}" id="historyToggleFab" title="${this._m("Recently played", "נוגן לאחרונה")}" aria-expanded="false" hidden>${this._iconSvg("queue")}</button>`
      : ``;
    const controlRoomBackdropHtml = controlRoomEnabled ? `
      <div class="control-room-backdrop" id="controlRoomBackdrop">
        <div class="control-room-shell">
          <div class="control-room-head">
            <button class="control-room-close" id="controlRoomCloseBtn" title="${this._esc(this._m("Close", "סגור"))}">${this._iconSvg("close")}</button>
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
            <button class="compact-expand-btn compact-expand-ref" id="compactExpandBtn" title="${this._m("Expand player", "הרחב נגן")}">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20L22 4H2L12 20Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>
            </button>
            <button class="compact-player-chip" id="activePlayerChip" title="${this._m("Choose Player", "בחר נגן")}">
              <span class="compact-player-copy">
                <span class="compact-player-label" id="selectedPlayerTitle">${this._m("Selected Player", "נגן נבחר")}</span>
              </span>
            </button>
          </div>
          <div class="compact-stage">
            <div class="compact-cover-wrap">
              <div class="art-source-badges compact-source-badges" data-art-source-badges hidden></div>
              <div class="compact-cover-echo" id="compactCoverAura"></div>
              <button class="compact-cover" id="npArt" title="${this._m("Play artwork action", "פעולת עטיפה")}">
                <img class="compact-cover-image" id="compactCoverImage" alt="">
                <span class="compact-cover-placeholder">${this._iconSvg("wand")}</span>
              </button>
            </div>
            <div class="compact-main">
              <div class="compact-copy">
                <div class="compact-title np-title" id="npTitle">${this._m("Nothing playing", "לא מתנגן")}</div>
                <div class="compact-sub np-sub" id="npSub">—</div>
                <button class="up-next-inline compact-up-next" data-up-next-inline hidden>
                  <span class="up-next-art"></span>
                  <span class="up-next-line">
                    <span class="up-next-prefix">${this._m("Up next", "הבא בתור")}</span>
                    <span class="up-next-title"></span>
                  </span>
                </button>
                ${nightQuickRowHtml}
              </div>
            </div>
          </div>
          <div class="compact-controls">
            <button class="side-btn compact-control-btn" id="btnPrev">${this._iconSvg("previous")}</button>
            <button class="main-btn compact-main-btn" id="btnPlay">${this._iconSvg("play")}</button>
            <button class="side-btn compact-control-btn" id="btnNext">${this._iconSvg("next")}</button>
          </div>
          <div class="compact-progress-row">
            <span class="compact-progress-time" id="bigCurTime">0:00</span>
            <div class="progress compact-progress-track" id="progressBar"><div class="progress-fill" id="progressFill"></div></div>
            <span class="compact-progress-time" id="bigTotalTime">0:00</span>
          </div>
          <div class="compact-volume-inline">
            <button class="volume-btn compact-mute-btn" id="btnMute">${this._iconSvg("volume_high")}</button>
            <div class="tablet-volume-track compact-volume-track">
              <input class="volume-slider compact-volume-slider" id="volSlider" type="range" min="0" max="100" value="50" style="--vol-pct:50%">
            </div>
            <button class="volume-value compact-volume-value" id="mobileVolPctLabel" title="${this._m("Volume presets", "בחירת ווליום")}">50%</button>
          </div>
        </div>
      </div>`;
    const centerHtml = `
      <div class="center">
        <div class="hero-aura" id="mobileHeroAura"></div>
        <div class="art-stage">
          ${layoutMode === "tablet" ? `` : playerFocusHtml}
          <div class="art-aura" id="mobileArtAura"></div>
          <div class="mobile-art-shell" id="mobileArtShell">
            <div class="art-source-badges" data-art-source-badges hidden></div>
            <div class="art-stack-view" id="npArt">
              ${this._mobileArtworkStackHtml()}
            </div>
          <div class="mobile-art-actions count-4" id="mobileArtActions">
            <button class="mobile-art-fab" id="mobileLikeBtn" title="${this._t("Like")}">${this._iconSvg(this._currentMediaFavoriteState() ? "heart_filled" : "heart_outline")}</button>
            <button class="mobile-art-fab" id="mobileLyricsBtn" title="${this._t("Lyrics")}">${this._iconSvg("lyrics")}</button>
            <button class="mobile-art-fab" id="mobileQueueBtn" title="${this._m("Open queue", "פתח תור")}">${this._iconSvg("queue")}</button>
            <button class="mobile-art-fab" id="mobileRandomBtn" title="${this._m("Quick mix", "מיקס מהיר")}">${this._iconSvg("radio")}</button>
          </div>
          </div>
        </div>
        <div class="hero-copy">
          <div class="hero-title np-title" id="npTitle">${this._m("Nothing playing", "לא מתנגן")}</div>
          <div class="hero-sub np-sub" id="npSub">—</div>
          <button class="up-next-inline hero-up-next" data-up-next-inline hidden>
            <span class="up-next-art"></span>
            <span class="up-next-line">
              <span class="up-next-prefix">${this._m("Up next", "הבא בתור")}</span>
              <span class="up-next-title"></span>
            </span>
          </button>
          ${nightQuickRowHtml}
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
          <button class="side-btn" id="btnPrev">${this._iconSvg("previous")}</button>
          <button class="main-btn" id="btnPlay">${this._iconSvg("play")}</button>
          <button class="side-btn" id="btnNext">${this._iconSvg("next")}</button>
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
      <style>
        :host { display:block; width:100%; max-width:100%; margin:0 !important; padding:0 !important; background:transparent !important; border:none !important; box-shadow:none !important; overflow:visible !important; --mobile-height:${height}px; --v2-font-scale:${this._state.mobileFontScale || 1}; --v2-custom-rgb:${this._customRgb()}; --v2-custom-text:${this._customTextColor()}; --accent-color:${this._state.mobileCustomColor || "#e0a11b"}; --ma-accent: var(--accent-color, #e0a11b); }
        ha-card { background:transparent !important; border:none !important; box-shadow:none !important; overflow:visible !important; }
        * { box-sizing:border-box; }
        .card {
          position:relative; overflow:hidden; isolation:isolate; color:#fff;
          width:100%;
          max-width:100%;
          height:min(var(--mobile-height), calc(100dvh - 10px));
          min-height:min(620px, calc(100dvh - 10px));
          max-height:calc(100dvh - 10px);
          border-radius:28px; border:1px solid rgba(255,255,255,.1);
          background:#0c0f16; box-shadow:0 24px 56px rgba(0,0,0,.3);
        }
        .theme-light.card {
          color:#1f2633;
          border-color:rgba(135,152,178,.22);
          background:#eef2f7;
          box-shadow:0 22px 56px rgba(73,89,110,.18);
        }
        .theme-custom.card {
          color:var(--v2-custom-text, #fff);
          border-color:rgba(var(--v2-custom-rgb) / .18);
          background:rgba(var(--v2-custom-rgb) / .14);
          box-shadow:0 22px 56px rgba(0,0,0,.16);
        }
        .card.dynamic-theme {
          border-color:rgba(var(--dynamic-accent-rgb, 224 161 27) / .24);
          box-shadow:
            0 24px 56px rgba(0,0,0,.28),
            0 0 0 1px rgba(var(--dynamic-accent-rgb, 224 161 27) / .08),
            0 18px 42px rgba(var(--dynamic-glow-rgb, 255 178 56) / .12);
        }
        .theme-light.card.dynamic-theme {
          box-shadow:
            0 22px 56px rgba(73,89,110,.16),
            0 0 0 1px rgba(var(--dynamic-accent-rgb, 224 161 27) / .08),
            0 18px 40px rgba(var(--dynamic-glow-rgb, 255 178 56) / .1);
        }
        .bg,.shade,.glow { position:absolute; inset:0; pointer-events:none; }
        .bg {
          background:
            radial-gradient(circle at 18% 20%, rgba(255,181,64,.18), transparent 34%),
            linear-gradient(180deg, rgba(9,12,19,.34), rgba(9,12,19,.94)),
            #0c0f16;
          background-position:center center; background-size:cover; background-repeat:no-repeat;
          filter:blur(30px) saturate(1.08); transform:scale(1.08); opacity:.9;
          will-change:transform, opacity;
        }
        .shade {
          background:linear-gradient(180deg, rgba(9,12,19,.18), rgba(9,12,19,.78) 38%, rgba(9,12,19,.98));
          will-change:opacity, filter;
        }
        .glow {
          background:radial-gradient(circle at 50% 76%, rgba(255,178,56,.2), transparent 30%);
          will-change:transform, opacity;
        }
        @keyframes backgroundFloat {
          0% { transform:translate3d(0, 0, 0) scale(var(--bg-motion-scale, 1.13)); opacity:.9; }
          22% { transform:translate3d(calc(var(--bg-motion-shift, 28px) * .62), calc(var(--bg-motion-shift, 28px) * -.42), 0) scale(calc(var(--bg-motion-scale, 1.13) + .024)); opacity:.98; }
          52% { transform:translate3d(calc(var(--bg-motion-shift, 28px) * -.78), calc(var(--bg-motion-shift, 28px) * .52), 0) scale(calc(var(--bg-motion-scale, 1.13) + .05)); opacity:1; }
          78% { transform:translate3d(calc(var(--bg-motion-shift, 28px) * .28), calc(var(--bg-motion-shift, 28px) * .22), 0) scale(calc(var(--bg-motion-scale, 1.13) + .016)); opacity:.95; }
          100% { transform:translate3d(0, 0, 0) scale(var(--bg-motion-scale, 1.13)); opacity:.9; }
        }
        @keyframes glowDrift {
          0% { transform:translate3d(0, 0, 0) scale(1); opacity:.74; }
          50% { transform:translate3d(calc(var(--bg-motion-shift, 28px) * -.58), calc(var(--bg-motion-shift, 28px) * .38), 0) scale(calc(1 + (.085 * var(--bg-motion-strength, 1)))); opacity:1; }
          100% { transform:translate3d(0, 0, 0) scale(1); opacity:.74; }
        }
        @keyframes shadeBreathe {
          0% { opacity:.94; filter:saturate(1); }
          50% { opacity:calc(.82 - (.04 * (var(--bg-motion-strength, 1) - 1))); filter:saturate(calc(1 + (.08 * var(--bg-motion-strength, 1)))); }
          100% { opacity:.94; filter:saturate(1); }
        }
        @keyframes auraDrift {
          0% { transform:translate3d(0, 0, 0) scale(1.08); }
          50% { transform:translate3d(calc(var(--bg-motion-shift, 28px) * .34), calc(var(--bg-motion-shift, 28px) * -.26), 0) scale(calc(1.08 + (.042 * var(--bg-motion-strength, 1)))); opacity:1; }
          100% { transform:translate3d(0, 0, 0) scale(1.08); }
        }
        .card.background-motion .bg {
          animation:backgroundFloat var(--bg-motion-duration, 24s) ease-in-out infinite;
        }
        .card.background-motion .shade {
          animation:shadeBreathe var(--shade-motion-duration, 20s) ease-in-out infinite;
        }
        .card.background-motion .glow {
          animation:glowDrift var(--glow-motion-duration, 18s) ease-in-out infinite;
          mix-blend-mode:screen;
        }
        .card.background-motion.motion-strong .glow {
          opacity:1;
        }
        .theme-light .bg {
          filter:blur(32px) saturate(1.1) brightness(1.06);
          opacity:.96;
        }
        .theme-light .shade {
          background:
            linear-gradient(180deg, rgba(255,255,255,.18), rgba(239,244,250,.52) 22%, rgba(232,238,246,.88) 62%, rgba(226,233,242,.95));
        }
        .theme-light .glow {
          background:
            radial-gradient(circle at 18% 20%, rgba(255,193,92,.22), transparent 26%),
            radial-gradient(circle at 82% 16%, rgba(255,153,84,.15), transparent 24%),
            radial-gradient(circle at 50% 78%, rgba(255,188,74,.18), transparent 30%);
        }
        .theme-custom .bg {
          filter:blur(32px) saturate(1.1);
          opacity:.96;
        }
        .theme-custom .shade {
          background:
            linear-gradient(180deg, rgba(var(--v2-custom-rgb) / .18), rgba(var(--v2-custom-rgb) / .22) 20%, rgba(14,18,28,.18) 56%, rgba(14,18,28,.1));
        }
        .theme-custom .glow {
          background:
            radial-gradient(circle at 18% 20%, rgba(var(--v2-custom-rgb) / .28), transparent 26%),
            radial-gradient(circle at 82% 16%, rgba(var(--v2-custom-rgb) / .18), transparent 22%),
            radial-gradient(circle at 50% 78%, rgba(var(--v2-custom-rgb) / .22), transparent 30%);
        }
        .card.dynamic-theme .bg {
          background:
            radial-gradient(circle at 18% 18%, rgba(var(--dynamic-glow-rgb, 255 178 56) / calc(.16 * var(--dynamic-theme-strength, .82))), transparent 32%),
            radial-gradient(circle at 82% 12%, rgba(var(--dynamic-accent-rgb, 224 161 27) / calc(.12 * var(--dynamic-theme-strength, .82))), transparent 26%),
            linear-gradient(180deg, rgba(var(--dynamic-surface-rgb, 12 15 22) / .42), rgba(var(--dynamic-surface-rgb, 12 15 22) / .96)),
            #0c0f16;
        }
        .card.dynamic-theme .shade {
          background:
            linear-gradient(180deg, rgba(var(--dynamic-surface-rgb, 12 15 22) / .12), rgba(var(--dynamic-surface-rgb, 12 15 22) / .64) 34%, rgba(9,12,19,.96)),
            radial-gradient(circle at 50% 84%, rgba(var(--dynamic-accent-rgb, 224 161 27) / calc(.12 * var(--dynamic-theme-strength, .82))), transparent 28%);
        }
        .card.dynamic-theme .glow {
          background:
            radial-gradient(circle at 50% 76%, rgba(var(--dynamic-glow-rgb, 255 178 56) / calc(.22 * var(--dynamic-theme-strength, .82))), transparent 32%),
            radial-gradient(circle at 16% 18%, rgba(var(--dynamic-accent-rgb, 224 161 27) / calc(.14 * var(--dynamic-theme-strength, .82))), transparent 24%);
        }
        .theme-light.card.dynamic-theme .bg {
          filter:blur(32px) saturate(calc(1.04 + (.08 * var(--dynamic-theme-strength, .82)))) brightness(1.05);
          opacity:.98;
        }
        .theme-light.card.dynamic-theme .shade {
          background:
            linear-gradient(180deg, rgba(255,255,255,.18), rgba(239,244,250,.46) 18%, rgba(var(--dynamic-surface-rgb, 224 232 244) / .58) 60%, rgba(226,233,242,.94)),
            radial-gradient(circle at 50% 82%, rgba(var(--dynamic-accent-rgb, 224 161 27) / calc(.1 * var(--dynamic-theme-strength, .82))), transparent 30%);
        }
        .theme-light.card.dynamic-theme .glow {
          background:
            radial-gradient(circle at 18% 20%, rgba(var(--dynamic-glow-rgb, 255 178 56) / calc(.18 * var(--dynamic-theme-strength, .82))), transparent 28%),
            radial-gradient(circle at 82% 16%, rgba(var(--dynamic-accent-rgb, 224 161 27) / calc(.12 * var(--dynamic-theme-strength, .82))), transparent 24%),
            radial-gradient(circle at 50% 78%, rgba(var(--dynamic-glow-rgb, 255 178 56) / calc(.16 * var(--dynamic-theme-strength, .82))), transparent 30%);
        }
        .card.night-mode {
          border-color:rgba(168,182,255,.18);
          box-shadow:0 28px 60px rgba(8,12,26,.42);
        }
        .card.night-mode.dynamic-theme {
          border-color:rgba(var(--dynamic-accent-rgb, 168 182 255) / .22);
          box-shadow:
            0 28px 60px rgba(8,12,26,.42),
            0 0 0 1px rgba(var(--dynamic-accent-rgb, 168 182 255) / .08),
            0 18px 42px rgba(var(--dynamic-accent-rgb, 168 182 255) / .12);
        }
        .card.night-mode .shade {
          background:
            linear-gradient(180deg, rgba(8,11,24,.22), rgba(8,11,24,.82) 34%, rgba(7,10,20,.98)),
            radial-gradient(circle at 50% 84%, rgba(106,125,255,.14), transparent 28%);
        }
        .card.night-mode .glow {
          background:
            radial-gradient(circle at 50% 76%, rgba(126,142,255,.18), transparent 30%),
            radial-gradient(circle at 16% 18%, rgba(118,140,255,.12), transparent 24%);
        }
        .theme-light.card.night-mode {
          background:#e7edf7;
          box-shadow:0 24px 58px rgba(57,72,105,.24);
        }
        .theme-light.card.night-mode .shade {
          background:
            linear-gradient(180deg, rgba(230,236,247,.28), rgba(214,224,240,.56) 20%, rgba(202,213,232,.82) 64%, rgba(196,208,228,.92));
        }
        .theme-light.card.night-mode .glow {
          background:
            radial-gradient(circle at 22% 18%, rgba(142,160,255,.18), transparent 22%),
            radial-gradient(circle at 50% 78%, rgba(114,132,255,.12), transparent 30%);
        }
        .card.layout-tablet {
          --tablet-max: min(1320px, calc(100vw - 34px));
          --tablet-rail: 102px;
        }
        .card.compact-mode.compact-collapsed {
          height:auto;
          min-height:0;
          max-height:none;
          min-width:0;
          border:none;
          border-radius:0;
          background:transparent !important;
          box-shadow:none;
          backdrop-filter:none;
          -webkit-backdrop-filter:none;
        }
        .card.compact-mode.compact-collapsed > .bg,
        .card.compact-mode.compact-collapsed > .shade,
        .card.compact-mode.compact-collapsed > .glow,
        .card.compact-mode.compact-collapsed > .compact-collapse-fab,
        .card.compact-mode.compact-collapsed > .top-settings-fab,
        .card.compact-mode.compact-collapsed > .home-shortcut-fab {
          display:none !important;
        }
        .card.compact-mode.compact-collapsed .stage {
          display:flex;
          justify-content:center;
          width:100%;
          padding:max(8px, env(safe-area-inset-top)) max(8px, env(safe-area-inset-right)) max(8px, env(safe-area-inset-bottom)) max(8px, env(safe-area-inset-left));
        }
        .compact-shell {
          position:relative;
          display:grid;
          gap:16px;
          width:100%;
          min-width:0;
          overflow:hidden;
          padding:18px 20px;
          border-radius:32px;
          border:1px solid rgba(255,255,255,.14);
          background:
            linear-gradient(180deg, rgba(14,18,28,.78), rgba(10,12,20,.94)),
            rgba(9,12,18,.82);
          box-shadow:
            0 24px 54px rgba(0,0,0,.28),
            inset 0 1px 0 rgba(255,255,255,.06);
          backdrop-filter:blur(28px);
          -webkit-backdrop-filter:blur(28px);
        }
        .compact-backdrop-art,
        .compact-backdrop-shade,
        .compact-sheen {
          position:absolute;
          inset:0;
          pointer-events:none;
        }
        .compact-backdrop-art {
          inset:-24%;
          background-position:center;
          background-size:cover;
          filter:blur(52px) saturate(1.2) brightness(1.04);
          opacity:.58;
          transform:scale(1.18);
        }
        .compact-backdrop-shade {
          background:
            radial-gradient(circle at 16% 18%, rgba(255,210,126,.2), transparent 26%),
            linear-gradient(135deg, rgba(255,255,255,.08), transparent 34%),
            linear-gradient(180deg, rgba(5,8,14,.12), rgba(5,8,14,.6) 42%, rgba(5,8,14,.82));
        }
        .compact-sheen {
          background:
            radial-gradient(circle at 16% 22%, rgba(241,186,83,.22), transparent 24%),
            radial-gradient(circle at 82% 18%, rgba(255,255,255,.09), transparent 16%),
            radial-gradient(circle at 56% 100%, rgba(225,163,49,.15), transparent 28%);
        }
        .compact-content {
          position:relative;
          z-index:1;
          display:grid;
          gap:18px;
          width:min(100%, 720px);
          margin-inline:auto;
        }
        .compact-header {
          position:relative;
          display:flex;
          justify-content:center;
          align-items:center;
          min-height:38px;
        }
        .compact-player-chip {
          display:inline-flex;
          align-items:center;
          justify-content:center;
          min-width:0;
          max-width:min(100%, 220px);
          min-height:auto;
          padding:0;
          border:none;
          border-radius:0;
          background:transparent;
          color:#f9f5eb;
          cursor:pointer;
          box-shadow:none;
          backdrop-filter:none;
          text-align:center;
        }
        .compact-player-chip.is-playing {
          box-shadow:none;
        }
        .compact-player-copy {
          min-width:0;
          display:block;
        }
        .compact-player-label {
          display:block;
          font-family:'Heebo','Rubik','Outfit','Segoe UI',system-ui,sans-serif;
          font-size:12px;
          font-weight:800;
          white-space:nowrap;
          overflow:hidden;
          text-overflow:ellipsis;
          letter-spacing:.01em;
        }
        .compact-player-tags {
          display:none;
        }
        .compact-expand-btn,
        .compact-collapse-fab {
          width:38px;
          height:38px;
          border:none;
          border-radius:12px;
          display:grid;
          place-items:center;
          background:transparent;
          color:#f5efe2;
          cursor:pointer;
          box-shadow:none;
          backdrop-filter:none;
        }
        .compact-expand-ref {
          position:absolute;
          top:0;
          right:0;
        }
        .card.rtl .compact-expand-ref {
          right:0;
          left:auto;
        }
        .compact-expand-ref svg {
          width:26px;
          height:26px;
          opacity:.92;
        }
        .compact-collapse-fab {
          position:absolute;
          top:16px;
          z-index:9;
        }
        .compact-collapse-fab.ltr { right:16px; }
        .compact-collapse-fab.rtl { left:16px; }
        .compact-stage {
          display:grid;
          grid-template-columns:112px minmax(0, 1fr);
          gap:18px;
          align-items:center;
          min-width:0;
          width:100%;
          direction:ltr;
        }
        .compact-cover-wrap {
          position:relative;
          display:grid;
          place-items:center;
          justify-self:start;
          width:112px;
          height:112px;
          min-height:0;
          align-self:center;
        }
        .art-source-badges {
          position:absolute;
          inset-block-start:10px;
          inset-inline-start:10px;
          z-index:7;
          display:flex;
          align-items:center;
          gap:6px;
          max-width:calc(100% - 20px);
          pointer-events:none;
        }
        .compact-source-badges {
          inset-block-start:6px;
          inset-inline-start:6px;
          max-width:calc(100% - 12px);
        }
        .source-badge {
          min-height:22px;
          padding:0 8px;
          border-radius:999px;
          display:inline-flex;
          align-items:center;
          justify-content:center;
          max-width:100%;
          font-family:'Heebo','Rubik','Outfit','Segoe UI',system-ui,sans-serif;
          font-size:10px;
          font-weight:900;
          letter-spacing:.01em;
          white-space:nowrap;
          overflow:hidden;
          text-overflow:ellipsis;
          color:#f7fbff;
          background:rgba(10,14,22,.66);
          border:1px solid rgba(255,255,255,.14);
          box-shadow:0 10px 24px rgba(0,0,0,.18);
          backdrop-filter:blur(14px);
          -webkit-backdrop-filter:blur(14px);
        }
        .source-badge.quality {
          color:rgba(255,255,255,.92);
          background:rgba(255,255,255,.12);
        }
        .source-badge.provider-spotify { color:#1ed760; }
        .source-badge.provider-tidal { color:#f8f8f8; }
        .source-badge.provider-youtube { color:#ff6b6b; }
        .source-badge.provider-apple { color:#ffd2df; }
        .source-badge.provider-qobuz { color:#8cd0ff; }
        .source-badge.provider-deezer { color:#ffb36a; }
        .source-badge.provider-library,
        .source-badge.provider-radio { color:#ffe29a; }
        .theme-light .source-badge {
          color:#1f2633;
          background:rgba(255,255,255,.84);
          border-color:rgba(143,159,181,.18);
          box-shadow:0 10px 22px rgba(95,112,136,.14);
        }
        .theme-light .source-badge.quality {
          color:#3b4a61;
          background:rgba(240,245,252,.88);
        }
        .compact-cover-echo {
          position:absolute;
          inset:-16px;
          border-radius:24px;
          pointer-events:none;
          background-position:center;
          background-size:cover;
          filter:blur(28px) saturate(1.12);
          opacity:.42;
          transform:scale(1.06);
        }
        .compact-cover {
          position:relative;
          z-index:1;
          width:102px;
          height:102px;
          border:none;
          border-radius:30px;
          background:rgba(255,255,255,.05);
          box-shadow:
            0 14px 28px rgba(0,0,0,.22),
            inset 0 1px 0 rgba(255,255,255,.08),
            0 0 0 1px rgba(255,255,255,.07);
          cursor:pointer;
          overflow:hidden;
        }
        .compact-cover.placeholder {
          display:grid;
          place-items:center;
        }
        .compact-cover-image {
          width:100%;
          height:100%;
          display:block;
          object-fit:contain;
          object-position:center;
          border-radius:inherit;
          padding:2px;
          opacity:.96;
        }
        .compact-cover-placeholder {
          position:absolute;
          inset:0;
          display:grid;
          place-items:center;
          color:rgba(255,255,255,.7);
          font-size:22px;
          pointer-events:none;
          opacity:0;
        }
        .compact-cover.placeholder .compact-cover-placeholder {
          opacity:1;
        }
        .compact-cover.placeholder .compact-cover-image {
          display:none;
        }
        .theme-light .compact-cover {
          background:rgba(255,255,255,.14);
        }
        .compact-main {
          min-width:0;
          display:grid;
          gap:4px;
          align-content:start;
          text-align:start;
          padding-top:2px;
        }
        .compact-copy {
          min-width:0;
          display:grid;
          gap:5px;
        }
        .compact-title {
          font-family:'Heebo','Rubik','Outfit','Segoe UI',system-ui,sans-serif;
          font-size:clamp(15px, 2.4vw, 19px);
          font-weight:700;
          line-height:1.08;
          display:-webkit-box;
          -webkit-line-clamp:2;
          -webkit-box-orient:vertical;
          overflow:hidden;
          text-wrap:balance;
          color:#fffdf7;
        }
        .compact-sub {
          font-family:'Heebo','Rubik','Outfit','Segoe UI',system-ui,sans-serif;
          font-size:12px;
          font-weight:500;
          line-height:1.3;
          color:rgba(255,255,255,.68);
          white-space:nowrap;
          overflow:hidden;
          text-overflow:ellipsis;
        }
        .up-next-inline {
          min-width:0;
          display:inline-flex;
          align-items:center;
          gap:8px;
          padding:0;
          border:none;
          background:transparent;
          color:inherit;
          text-align:inherit;
          cursor:pointer;
          box-shadow:none;
          backdrop-filter:none;
          -webkit-backdrop-filter:none;
          transition:transform .16s ease, opacity .18s ease;
        }
        .up-next-inline[hidden] {
          display:none !important;
        }
        .up-next-inline:hover {
          transform:translateY(-1px);
          opacity:.92;
        }
        .up-next-inline:active {
          transform:translateY(1px) scale(.99);
        }
        .card.rtl .up-next-inline {
          flex-direction:row-reverse;
        }
        .up-next-art {
          width:22px;
          height:22px;
          min-width:22px;
          border-radius:7px;
          overflow:hidden;
          display:grid;
          place-items:center;
          background:rgba(255,255,255,.08);
          box-shadow:inset 0 1px 0 rgba(255,255,255,.08);
        }
        .up-next-art img {
          width:100%;
          height:100%;
          display:block;
          object-fit:cover;
        }
        .up-next-art-fallback {
          width:14px;
          height:14px;
          display:grid;
          place-items:center;
          color:rgba(255,255,255,.72);
        }
        .up-next-art-fallback .ui-ic {
          width:14px;
          height:14px;
        }
        .up-next-line {
          min-width:0;
          display:flex;
          align-items:center;
          gap:5px;
          line-height:1;
        }
        .card.rtl .up-next-line {
          flex-direction:row-reverse;
        }
        .up-next-prefix {
          flex:0 0 auto;
          font-family:'Heebo','Rubik','Outfit','Segoe UI',system-ui,sans-serif;
          font-size:11px;
          font-weight:800;
          color:color-mix(in srgb, var(--ma-accent) 62%, rgba(255,255,255,.66));
        }
        .up-next-title {
          font-family:'Heebo','Rubik','Outfit','Segoe UI',system-ui,sans-serif;
          font-size:12px;
          font-weight:700;
          line-height:1.15;
          white-space:nowrap;
          overflow:hidden;
          text-overflow:ellipsis;
        }
        .compact-up-next {
          margin-top:2px;
          justify-content:flex-start;
          text-align:start;
          max-width:min(320px, 100%);
        }
        .night-quick-row {
          display:flex;
          flex-wrap:wrap;
          gap:8px;
          align-items:center;
          margin-top:10px;
          justify-content:center;
        }
        .night-quick-row.auto-mode {
          justify-content:center;
        }
        .night-quick-row.on-mode {
          justify-content:center;
        }
        .night-quick-btn {
          min-height:34px;
          padding:0 12px;
          border-radius:999px;
          border:1px solid rgba(255,255,255,.14);
          background:rgba(255,255,255,.08);
          color:inherit;
          display:inline-flex;
          align-items:center;
          gap:8px;
          font:inherit;
          font-size:12px;
          font-weight:850;
          letter-spacing:.01em;
          cursor:pointer;
          box-shadow:0 10px 24px rgba(0,0,0,.12);
          backdrop-filter:blur(18px);
          -webkit-backdrop-filter:blur(18px);
          transition:transform .16s ease, border-color .18s ease, background-color .18s ease, box-shadow .18s ease;
        }
        .night-quick-btn .ui-ic {
          width:16px;
          height:16px;
        }
        .night-quick-btn.icon-only {
          width:34px;
          min-width:34px;
          height:34px;
          min-height:34px;
          padding:0;
          justify-content:center;
          border-radius:999px;
        }
        .night-quick-btn.icon-only .ui-ic {
          width:17px;
          height:17px;
        }
        .night-quick-btn.soft {
          background:rgba(255,255,255,.05);
        }
        .night-quick-btn.active {
          border-color:color-mix(in srgb, var(--ma-accent) 32%, rgba(171,185,255,.46));
          background:linear-gradient(135deg, color-mix(in srgb, var(--ma-accent) 16%, rgba(111,126,255,.16)), rgba(255,255,255,.08));
          box-shadow:0 12px 28px color-mix(in srgb, var(--ma-accent) 12%, rgba(7,10,20,.22));
        }
        .theme-light .night-quick-btn {
          background:rgba(255,255,255,.72);
          border-color:rgba(147,161,183,.2);
          box-shadow:0 10px 24px rgba(110,127,153,.12);
        }
        .theme-light .night-quick-btn.soft {
          background:rgba(255,255,255,.56);
        }
        .theme-light .night-quick-btn.active {
          background:linear-gradient(135deg, color-mix(in srgb, var(--ma-accent) 20%, white 80%), rgba(255,255,255,.88));
        }
        .compact-copy .night-quick-row {
          margin-top:8px;
        }
        .compact-copy .night-quick-btn {
          min-height:30px;
          padding:0 10px;
          font-size:11px;
          box-shadow:none;
          background:rgba(255,255,255,.06);
        }
        .compact-copy .night-quick-btn.icon-only {
          width:30px;
          min-width:30px;
          height:30px;
          min-height:30px;
          padding:0;
        }
        .compact-controls {
          display:flex;
          align-items:center;
          justify-content:center;
          gap:22px;
          min-width:0;
          direction:ltr;
          margin-top:2px;
        }
        .compact-controls button {
          color:#fffdf8;
        }
        .compact-control-btn {
          width:48px !important;
          height:48px !important;
          border-radius:50% !important;
          background:transparent !important;
          border:none !important;
          box-shadow:none !important;
          backdrop-filter:none !important;
        }
        .compact-control-btn .ui-ic {
          width:24px;
          height:24px;
        }
        .compact-main-btn {
          width:66px !important;
          height:66px !important;
          border-radius:50% !important;
          background:rgba(255,255,255,.09) !important;
          border:1px solid rgba(255,255,255,.1) !important;
          box-shadow:
            0 10px 22px rgba(0,0,0,.15),
            inset 0 1px 0 rgba(255,255,255,.07) !important;
        }
        .compact-main-btn .ui-ic {
          width:28px;
          height:28px;
        }
        .compact-progress-row {
          display:grid;
          grid-template-columns:auto minmax(0,1fr) auto;
          align-items:center;
          gap:10px;
          direction:ltr;
          width:min(100%, 92%);
          margin:2px auto 0;
        }
        .compact-progress-time {
          font-size:11px;
          font-weight:700;
          color:rgba(255,255,255,.6);
          font-variant-numeric:tabular-nums;
        }
        .compact-progress-track {
          min-width:0;
          height:5px;
          border-radius:999px;
          background:rgba(255,255,255,.18);
          box-shadow:inset 0 1px 2px rgba(0,0,0,.12);
          overflow:hidden;
        }
        .compact-progress-track .progress-fill {
          background:linear-gradient(90deg, rgba(250,226,157,.98), rgba(255,255,255,.9));
          opacity:.98;
        }
        .compact-volume-inline {
          width:min(100%, 300px);
          margin-inline:auto;
          padding:0;
          border-radius:0;
          background:transparent;
          border:none;
          backdrop-filter:none;
          display:grid !important;
          grid-template-columns:auto minmax(0,1fr) auto;
          gap:10px;
          align-items:center;
          box-shadow:none;
        }
        .compact-volume-track {
          min-width:0;
        }
        .compact-volume-slider {
          width:100%;
          height:18px;
          appearance:none;
          direction:ltr;
          background:transparent;
          outline:none;
        }
        .compact-volume-slider::-webkit-slider-runnable-track {
          height:4px;
          border-radius:999px;
          background:linear-gradient(to right,var(--ma-accent) 0%,var(--ma-accent) var(--vol-pct,50%),rgba(255,255,255,.22) var(--vol-pct,50%),rgba(255,255,255,.22) 100%);
        }
        .compact-volume-slider::-webkit-slider-thumb {
          appearance:none;
          width:14px;
          height:14px;
          margin-top:-5px;
          border-radius:50%;
          background:#fff7dc;
          border:none;
          box-shadow:0 2px 8px rgba(0,0,0,.18);
        }
        .compact-volume-slider::-moz-range-track {
          height:4px;
          border-radius:999px;
          background:rgba(255,255,255,.22);
        }
        .compact-volume-slider::-moz-range-progress {
          height:4px;
          border-radius:999px;
          background:var(--ma-accent);
        }
        .compact-volume-slider::-moz-range-thumb {
          width:14px;
          height:14px;
          border-radius:50%;
          background:#fff7dc;
          border:none;
          box-shadow:0 2px 8px rgba(0,0,0,.18);
        }
        .compact-volume-value {
          min-width:40px;
          font-weight:700;
          font-size:11px;
          text-align:end;
          color:rgba(255,255,255,.62);
        }
        .compact-mute-btn {
          width:36px !important;
          height:36px !important;
          border-radius:0 !important;
          background:transparent !important;
          border:none !important;
          box-shadow:none !important;
          padding:0 !important;
          color:rgba(255,248,232,.94) !important;
        }
        .compact-mute-btn .ui-ic {
          width:28px;
          height:28px;
        }
        .compact-mute-btn.muted {
          color:#ffcfbd !important;
        }
        .theme-light .compact-shell {
          border-color:rgba(255,255,255,.28);
          background:
            linear-gradient(180deg, rgba(255,255,255,.28), rgba(255,255,255,.16)),
            rgba(244,248,252,.18);
          box-shadow:
            0 24px 52px rgba(101,116,143,.16),
            inset 0 1px 0 rgba(255,255,255,.38);
        }
        .theme-light .compact-backdrop-art {
          opacity:.58;
          filter:blur(58px) saturate(1.04) brightness(1.02);
        }
        .theme-light .compact-backdrop-shade {
          background:
            radial-gradient(circle at 18% 22%, rgba(255,236,192,.22), transparent 24%),
            linear-gradient(180deg, rgba(248,250,255,.18), rgba(235,241,248,.42)),
            rgba(232,238,246,.34);
        }
        .theme-light .compact-sheen {
          background:
            radial-gradient(circle at 16% 18%, rgba(255,220,160,.16), transparent 24%),
            radial-gradient(circle at 72% 56%, rgba(255,255,255,.2), transparent 30%),
            radial-gradient(circle at 50% 100%, rgba(216,186,144,.14), transparent 24%);
        }
        .theme-light .compact-player-chip,
        .theme-light .compact-volume-inline {
          color:#243144;
          background:transparent;
          border-color:rgba(153,167,188,.24);
        }
        .theme-light .compact-progress-time,
        .theme-light .compact-volume-value,
        .theme-light .compact-sub {
          color:rgba(43,57,76,.78);
        }
        .theme-light .compact-title {
          color:#1d2938;
        }
        .theme-light .compact-controls button,
        .theme-light .compact-mute-btn {
          color:#243144;
        }
        .card.rtl .compact-main {
          direction:rtl;
          text-align:right;
        }
        @media (max-width: 760px) {
          .compact-shell {
            gap:16px;
            padding:16px;
          }
          .compact-stage {
            grid-template-columns:88px minmax(0,1fr);
            gap:16px;
          }
          .compact-cover-wrap {
            width:88px;
            height:88px;
          }
          .compact-cover {
            width:84px;
            height:84px;
            border-radius:24px;
          }
          .compact-title {
            font-size:clamp(15px, 3.2vw, 18px);
          }
        }
        @media (max-width: 520px) {
          .compact-shell {
            border-radius:28px;
            padding:16px;
          }
          .compact-content {
            gap:16px;
          }
          .compact-header {
            min-height:36px;
          }
          .compact-stage {
            grid-template-columns:88px minmax(0,1fr);
            gap:12px;
            align-items:center;
          }
          .compact-cover-wrap {
            width:88px;
            height:88px;
          }
          .compact-cover {
            width:84px;
            height:84px;
            border-radius:24px;
          }
          .compact-main {
            gap:5px;
          }
          .compact-title {
            font-size:clamp(14px, 4.1vw, 17px);
          }
          .compact-sub {
            font-size:11px;
          }
          .compact-controls {
            gap:22px;
          }
          .compact-control-btn {
            width:44px !important;
            height:44px !important;
          }
          .compact-control-btn .ui-ic { width:22px; height:22px; }
          .compact-main-btn {
            width:58px !important;
            height:58px !important;
          }
          .compact-main-btn .ui-ic { width:25px; height:25px; }
          .compact-progress-row {
            gap:7px;
            width:100%;
          }
          .compact-progress-time {
            font-size:10px;
          }
          .compact-volume-inline {
            width:min(100%, 260px);
          }
        }
        .card.compact-mode {
          border-radius:22px;
        }
        .card.compact-mode .stage {
          gap:6px;
          padding:max(12px, env(safe-area-inset-top)) max(12px, env(safe-area-inset-right)) max(12px, env(safe-area-inset-bottom)) max(12px, env(safe-area-inset-left));
        }
        .card.compact-mode .center,
        .card.compact-mode .bottom,
        .card.compact-mode .tablet-main {
          gap:8px !important;
        }
        .card.compact-mode .hero-title {
          font-size:clamp(42px, 10vw, 76px) !important;
          line-height:.92 !important;
        }
        .card.compact-mode .hero-sub {
          font-size:14px !important;
          line-height:1.25 !important;
        }
        .card.compact-mode .mobile-art-fab {
          width:40px !important;
          min-width:40px !important;
          height:40px !important;
        }
        .card.compact-mode .side-btn {
          width:54px !important;
          height:54px !important;
        }
        .card.compact-mode .main-btn {
          width:82px !important;
          height:82px !important;
        }
        .card.compact-mode .footer-btn {
          min-height:42px !important;
          padding:10px 12px !important;
        }
        .card.compact-mode .progress-line {
          margin-top:0 !important;
        }
        .card.compact-mode .progress-time {
          font-size:12px !important;
        }
        .card.compact-mode .notice {
          padding:8px 10px !important;
          min-height:0 !important;
        }
        .card.compact-mode .mobile-volume-inline {
          margin-top:2px;
        }
        .stage {
          position:relative; z-index:1; height:100%;
          width:100%;
          max-width:100%;
          min-width:0;
          display:grid; grid-template-rows:auto minmax(0,1fr) auto auto;
          gap:8px;
          padding:max(16px, env(safe-area-inset-top)) max(14px, env(safe-area-inset-right)) max(16px, env(safe-area-inset-bottom)) max(14px, env(safe-area-inset-left));
        }
        .card.layout-tablet .stage {
          gap:0;
          padding:max(16px, env(safe-area-inset-top)) max(16px, env(safe-area-inset-right)) max(16px, env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-left));
          grid-template-rows:auto auto auto auto;
          align-content:start;
        }
        .card.layout-tablet .tablet-shell {
          width:100%;
          height:100%;
          display:grid;
          grid-template-columns:var(--tablet-rail) minmax(0, 1fr);
          gap:28px;
          align-items:start;
        }
        .card.layout-tablet .tablet-main {
          min-width:0;
          display:grid;
          gap:12px;
          align-content:start;
          justify-items:center;
        }
        .card.layout-tablet .tablet-rail {
          min-width:0;
          display:flex;
          flex-direction:column;
          align-items:stretch;
          gap:10px;
          min-height:100%;
          position:relative;
          z-index:7;
        }
        .card.layout-tablet.rtl .tablet-shell {
          grid-template-columns:minmax(0,1fr) var(--tablet-rail);
        }
        .hero-aura {
          position:absolute;
          inset:-12% -10% -6%;
          background:center / cover no-repeat;
          filter:blur(52px) saturate(1.14);
          opacity:.44;
          transform:scale(1.08);
          pointer-events:none;
          will-change:transform, opacity;
        }
        .theme-light .hero-aura {
          opacity:.34;
          filter:blur(56px) saturate(1.08) brightness(1.08);
        }
        .card.background-motion .hero-aura {
          animation:auraDrift var(--aura-motion-duration, 22s) ease-in-out infinite;
        }
        .card.dynamic-theme .hero-aura {
          filter:blur(58px) saturate(calc(1.04 + (.14 * var(--dynamic-theme-strength, .82))));
          opacity:calc(.28 + (.22 * var(--dynamic-theme-strength, .82)));
          mix-blend-mode:screen;
        }
        .theme-light.card.dynamic-theme .hero-aura {
          opacity:calc(.24 + (.12 * var(--dynamic-theme-strength, .82)));
        }
        .player-chip,.status-pill,.accent-row,.menu-sheet,.notice,.menu-item,.menu-list-item,.queue-row {
          background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.12); backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px);
        }
        .theme-light .player-chip,.theme-light .status-pill,.theme-light .accent-row,.theme-light .menu-sheet,.theme-light .notice,.theme-light .menu-item,.theme-light .menu-list-item,.theme-light .queue-row {
          background:rgba(255,255,255,.62);
          border-color:rgba(147,161,183,.2);
          box-shadow:0 14px 34px rgba(110,127,153,.12);
          color:#1f2633;
        }
        .player-chip {
          min-width:0; width:100%; max-width:100%; padding:2px 4px 0; border-radius:0; direction:inherit; cursor:pointer; margin-top:0;
          overflow:visible; position:relative; z-index:1; background:none; border:none; box-shadow:none; backdrop-filter:none; -webkit-backdrop-filter:none;
        }
        .player-chip-inner { display:grid; grid-template-columns:30px minmax(0,1fr); gap:10px; align-items:center; min-width:0; }
        .player-chip-ico {
          width:30px; height:30px; border-radius:10px; display:grid; place-items:center;
          background:linear-gradient(135deg, rgba(247,191,92,.18), rgba(245,166,35,.08));
          border:1px solid rgba(245,166,35,.18); color:#ffc96b;
        }
        .player-chip-ico .ui-ic { width:46%; height:46%; }
        .player-kicker { font-size:9px; letter-spacing:.12em; text-transform:uppercase; color:rgba(255,255,255,.56); margin-bottom:2px; }
        .player-name { font-size:15px; font-weight:900; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .player-sub { margin-top:1px; font-size:11px; color:rgba(255,255,255,.72); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .theme-light .player-chip {
          background:none;
          border:none;
          box-shadow:none;
          backdrop-filter:none;
          -webkit-backdrop-filter:none;
        }
        .player-focus {
          display:inline-flex;
          align-items:center;
          justify-content:center;
          gap:10px;
          margin:18px auto 0;
          width:auto;
          max-width:min(58vw, 196px);
          min-height:36px;
          padding:7px 12px;
          border-radius:18px;
          background:linear-gradient(180deg, rgba(255,255,255,.12), rgba(255,255,255,.05));
          border:1px solid rgba(255,255,255,.14);
          color:inherit;
          font:inherit;
          cursor:pointer;
          position:relative;
          z-index:1;
          overflow:hidden;
          backdrop-filter:blur(22px);
          -webkit-backdrop-filter:blur(22px);
          box-sizing:border-box;
          box-shadow:0 14px 34px rgba(0,0,0,.18), inset 0 1px 0 rgba(255,255,255,.09);
          transition:transform .18s ease, background-color .18s ease, border-color .18s ease, box-shadow .18s ease, opacity .18s ease;
        }
        .player-focus-nav {
          width:min(100%, 292px);
          margin-inline:auto;
          display:grid;
          grid-template-columns:44px minmax(0,1fr) 44px;
          align-items:center;
          gap:8px;
        }
        .player-focus-nav .player-focus {
          width:100%;
          max-width:100%;
          margin-top:0;
        }
        .player-focus-nav-btn {
          width:44px;
          min-width:44px;
          height:44px;
          padding:0;
          border:1px solid rgba(255,255,255,.12);
          border-radius:999px;
          background:rgba(255,255,255,.08);
          color:rgba(255,255,255,.92);
          box-shadow:0 10px 24px rgba(0,0,0,.12);
          display:grid;
          place-items:center;
          cursor:pointer;
          transition:transform .16s ease, color .16s ease, opacity .16s ease, background-color .16s ease, border-color .16s ease;
        }
        .player-focus-nav-btn .ui-ic {
          width:18px;
          height:18px;
        }
        .player-focus-nav-btn:disabled {
          opacity:.18;
          cursor:default;
        }
        .theme-light .player-focus-nav-btn {
          color:rgba(38,52,70,.84);
          background:rgba(255,255,255,.78);
          border-color:rgba(147,161,183,.2);
          box-shadow:0 10px 24px rgba(110,127,153,.12);
        }
        .player-focus-copy {
          min-width:0;
          display:grid;
          gap:6px;
          justify-items:center;
        }
        .player-focus-tags {
          display:flex;
          align-items:center;
          justify-content:center;
          flex-wrap:wrap;
          gap:6px;
          min-height:20px;
        }
        .player-focus-pill {
          min-height:20px;
          padding:0 8px;
          border-radius:999px;
          display:inline-flex;
          align-items:center;
          justify-content:center;
          gap:5px;
          font-size:10px;
          font-weight:950;
          line-height:1;
          border:1px solid rgba(255,255,255,.14);
          background:rgba(255,255,255,.08);
          color:rgba(255,255,255,.92);
        }
        .player-focus-pill.playing {
          color:#18120a;
          border-color:color-mix(in srgb, var(--ma-accent) 30%, transparent);
          background:linear-gradient(135deg, var(--ma-accent), color-mix(in srgb, var(--ma-accent) 70%, white 30%));
          box-shadow:0 10px 18px color-mix(in srgb, var(--ma-accent) 20%, transparent);
        }
        .player-focus-pill.night {
          border-color:rgba(168,182,255,.18);
          background:rgba(110,126,255,.12);
          color:#dce2ff;
        }
        .player-focus-pill.night.active {
          border-color:rgba(186,198,255,.28);
          background:linear-gradient(135deg, rgba(110,126,255,.26), rgba(141,154,255,.16));
          color:#f4f7ff;
          box-shadow:0 10px 18px rgba(69,82,145,.18);
        }
        .player-focus-pill .eq-icon {
          display:inline-flex !important;
          width:12px;
          height:10px;
          gap:2px;
        }
        .player-focus-pill .eq-icon span {
          width:2px;
        }
        .theme-light .player-focus-pill {
          color:#435066;
          border-color:rgba(147,161,183,.2);
          background:rgba(255,255,255,.74);
        }
        .theme-light .player-focus-pill.night {
          color:#506087;
          border-color:rgba(157,171,198,.24);
          background:rgba(235,240,255,.88);
        }
        .player-focus-art-wrap {
          display:none;
          align-items:center;
          justify-content:center;
          width:100%;
        }
        .player-focus-art {
          width:54px;
          height:54px;
          border-radius:18px;
          display:block;
          background:rgba(255,255,255,.08) center/cover no-repeat;
          border:1px solid rgba(255,255,255,.14);
          box-shadow:0 12px 26px rgba(0,0,0,.14), inset 0 1px 0 rgba(255,255,255,.08);
          position:relative;
          overflow:hidden;
        }
        .player-focus-art.placeholder {
          background:
            radial-gradient(circle at 32% 24%, color-mix(in srgb, var(--ma-accent) 34%, rgba(255,255,255,.14)), transparent 42%),
            linear-gradient(145deg, rgba(255,255,255,.12), rgba(255,255,255,.04));
        }
        .player-focus-art::after {
          content:"";
          position:absolute;
          inset:0;
          border-radius:inherit;
          background:radial-gradient(circle at 32% 22%, rgba(255,255,255,.22), transparent 44%);
          pointer-events:none;
        }
        .player-focus::before {
          content:"";
          position:absolute;
          inset:-18%;
          background:radial-gradient(circle at 22% 18%, color-mix(in srgb, var(--ma-accent) 28%, transparent), transparent 34%);
          opacity:.55;
          pointer-events:none;
        }
        .player-focus::after {
          content:"";
          position:absolute;
          inset:0;
          border-radius:inherit;
          pointer-events:none;
          box-shadow:inset 0 0 0 1px rgba(255,255,255,.06);
        }
        .card.layout-tablet .player-focus {
          justify-self:stretch;
          margin-top:0;
          max-width:100%;
          min-height:126px;
          padding:14px 12px 16px;
          border-radius:32px;
          flex-direction:column;
          gap:10px;
          justify-content:flex-start;
          align-items:center;
          text-align:center;
          background:
            radial-gradient(circle at 50% 0%, color-mix(in srgb, var(--ma-accent) 14%, transparent), transparent 52%),
            linear-gradient(180deg, rgba(255,255,255,.12), rgba(255,255,255,.045));
          border-color:rgba(255,255,255,.14);
          box-shadow:0 16px 36px rgba(0,0,0,.12), inset 0 1px 0 rgba(255,255,255,.08);
        }
        .card.layout-tablet .player-focus-art-wrap {
          display:flex;
          order:2;
        }
        .card.layout-tablet .player-focus-art {
          width:68px;
          height:68px;
          border-radius:22px;
        }
        .player-focus-name {
          font-size:calc(12px * var(--v2-font-scale));
          font-weight:900;
          line-height:1;
          white-space:nowrap;
          overflow:hidden;
          text-overflow:ellipsis;
          max-width:calc(100vw - 120px);
        }
        .card.layout-tablet .player-focus-name {
          order:1;
          font-size:calc(14px * var(--v2-font-scale));
          max-width:100%;
          text-align:center;
          line-height:1.15;
          white-space:normal;
          text-wrap:balance;
          font-weight:900;
        }
        .card.layout-tablet .player-focus-copy {
          order:1;
        }
        .card.layout-tablet .player-focus-tags {
          justify-content:center;
        }
        .player-focus-meta {
          display:flex;
          flex-direction:row;
          align-items:center;
          justify-content:center;
          gap:5px;
          min-width:0;
        }
        .player-focus-sub {
          max-width:100%;
          font-size:10px;
          font-weight:800;
          line-height:1.15;
          color:rgba(255,255,255,.66);
          text-align:center;
          white-space:nowrap;
          overflow:hidden;
          text-overflow:ellipsis;
        }
        .theme-light .player-focus-sub {
          color:rgba(33,41,57,.66);
        }
        .theme-light .player-focus-nav-btn:disabled {
          opacity:.26;
        }
        .card.layout-tablet .player-focus-meta {
          display:none;
        }
        .card.layout-tablet .player-focus-sub {
          display:none;
        }
        .player-focus.is-playing {
          box-shadow:0 20px 44px rgba(0,0,0,.16), inset 0 1px 0 rgba(255,255,255,.08), 0 0 0 1px rgba(255,255,255,.08);
        }
        .player-focus.is-playing .player-focus-name {
          color:color-mix(in srgb, currentColor 84%, var(--ma-accent) 16%);
        }
        .player-focus.is-playing::before {
          animation:playerFocusPulse 3.4s ease-in-out infinite;
        }
        .player-focus.is-playing .player-focus-art {
          box-shadow:0 0 0 1px color-mix(in srgb, var(--ma-accent) 28%, rgba(255,255,255,.08)), 0 0 0 12px color-mix(in srgb, var(--ma-accent) 12%, transparent), 0 16px 30px rgba(0,0,0,.18);
          animation:playerThumbPulse 3.2s ease-in-out infinite;
        }
        .eq-icon {
          display:none;
          align-items:flex-end;
          gap:3px;
          height:18px;
          width:20px;
          color:var(--ma-accent);
        }
        .player-focus .eq-icon,
        .player-focus.is-playing .eq-icon { display:none !important; }
        .menu-list-item.is-playing .eq-icon { display:inline-flex; }
        .eq-icon span {
          width:3px;
          border-radius:999px;
          background:currentColor;
          animation:eqPulse 1.15s ease-in-out infinite;
          transform-origin:center bottom;
        }
        .eq-icon span:nth-child(1) { height:9px; animation-delay:0s; }
        .eq-icon span:nth-child(2) { height:15px; animation-delay:.18s; }
        .eq-icon span:nth-child(3) { height:11px; animation-delay:.36s; }
        @keyframes playerFocusPulse {
          0%, 100% { transform:scale(1); opacity:.45; }
          50% { transform:scale(1.05); opacity:.72; }
        }
        @keyframes playerThumbPulse {
          0%,100% { transform:scale(1); }
          50% { transform:scale(1.04); }
        }
        @keyframes eqPulse {
          0%,100% { transform:scaleY(.55); opacity:.55; }
          50% { transform:scaleY(1.08); opacity:1; }
        }
        .hero-copy {
          display:grid;
          gap:6px;
          justify-items:center;
          text-align:center;
          width:100%;
          min-width:0;
          position:relative;
          z-index:1;
          margin-top:-2px;
        }
        .card.layout-tablet .hero-copy {
          max-width:min(860px, 84%);
          gap:6px;
          margin-top:2px;
          margin-bottom:0;
        }
        .hero-title {
          max-width:100%;
          font-size:calc(30px * var(--v2-font-scale));
          font-weight:900;
          line-height:1.04;
          letter-spacing:-.035em;
          white-space:nowrap;
          overflow:hidden;
          text-overflow:ellipsis;
        }
        .card.layout-tablet .hero-title {
          font-size:clamp(22px, 2.35vw, 34px);
          white-space:normal;
          text-wrap:balance;
          line-height:1.05;
        }
        .hero-sub {
          max-width:100%;
          font-size:calc(14px * var(--v2-font-scale));
          color:rgba(255,255,255,.76);
          white-space:nowrap;
          overflow:hidden;
          text-overflow:ellipsis;
        }
        .hero-up-next {
          justify-content:center;
          text-align:center;
          width:auto;
          max-width:min(520px, 94%);
          margin-top:2px;
        }
        .hero-copy .night-quick-row {
          justify-content:center;
        }
        .card.layout-tablet .hero-sub {
          font-size:clamp(13px, 1vw, 16px);
          white-space:normal;
          text-wrap:balance;
        }
        .center {
          display:flex;
          flex-direction:column;
          align-items:center;
          justify-content:flex-start;
          width:100%;
          max-width:100%;
          min-width:0;
          gap:8px;
          min-height:0;
          padding-top:0;
          margin-top:0;
          overflow:hidden;
          position:relative;
        }
        .card.layout-tablet .center {
          width:100%;
          max-width:var(--tablet-max);
          margin-inline:auto;
          gap:10px;
          overflow:visible;
          padding-bottom:2px;
          z-index:4;
        }
        .art-stage {
          position:relative;
          width:100%;
          max-width:100%;
          margin-inline:auto;
          display:grid;
          justify-items:center;
          align-items:center;
          gap:8px;
          padding:0;
          justify-self:center;
        }
        .card.layout-tablet .art-stage {
          width:min(980px, 100%);
          display:grid;
          grid-template-columns:minmax(0,1fr);
          grid-template-areas:"shell";
          column-gap:0;
          row-gap:0;
          align-items:center;
          justify-content:center;
        }
        .mobile-art-shell {
          overflow:hidden;
        }
        .mobile-art-shell > .art-source-badges {
          inset-block-start:12px;
          inset-inline-start:12px;
        }
        .art-aura {
          position:absolute;
          inset:1% -2% 7%;
          border-radius:36px;
          background:center / cover no-repeat;
          filter:blur(42px) saturate(1.12);
          opacity:.8;
          transform:scale(1.08);
          pointer-events:none;
          will-change:transform, opacity;
        }
        .theme-light .art-aura {
          opacity:.58;
          filter:blur(44px) saturate(1.08) brightness(1.05);
        }
        .card.background-motion .art-aura {
          animation:auraDrift calc(var(--aura-motion-duration, 22s) * .88) ease-in-out infinite reverse;
        }
        @media (prefers-reduced-motion: reduce) {
          .card.background-motion .bg,
          .card.background-motion .shade,
          .card.background-motion .glow,
          .card.background-motion .hero-aura,
          .card.background-motion .art-aura {
            animation:none !important;
          }
        }
        .card.dynamic-theme .art-aura {
          filter:blur(44px) saturate(calc(1.04 + (.12 * var(--dynamic-theme-strength, .82))));
          opacity:calc(.5 + (.22 * var(--dynamic-theme-strength, .82)));
          mix-blend-mode:screen;
        }
        .theme-light.card.dynamic-theme .art-aura {
          opacity:calc(.42 + (.12 * var(--dynamic-theme-strength, .82)));
        }
        .art-stack-view {
          position:relative;
          width:100%;
          min-height:min(60vw, 352px);
          isolation:isolate;
          direction:ltr;
          overflow:hidden;
          --art-drag-x:0px;
        }
        .art-stack-viewport {
          position:relative;
          width:100%;
          min-height:min(60vw, 352px);
          overflow:hidden;
          direction:ltr;
          touch-action:pan-y;
          -webkit-user-select:none;
          user-select:none;
        }
        .art-stack-container {
          position:relative;
          width:100%;
          min-height:min(60vw, 352px);
          touch-action:pan-y;
          user-select:none;
          -webkit-user-select:none;
          direction:ltr;
        }
        .art-stack-slide {
          position:absolute;
          inset-block:0;
          left:50%;
          width:68%;
          min-width:0;
          display:flex;
          align-items:center;
          justify-content:center;
          padding:0;
          transition:
            transform .16s cubic-bezier(.22,.8,.24,1),
            opacity .16s ease,
            filter .16s ease;
          will-change:transform, opacity, filter;
        }
        .art-stack-card {
          position:relative;
          width:100%;
          aspect-ratio:1/1;
          border-radius:30px;
          overflow:hidden;
          display:grid;
          place-items:center;
          background:rgba(255,255,255,.08);
          border:1px solid rgba(255,255,255,.12);
          box-shadow:0 24px 48px rgba(0,0,0,.2);
          transition:transform .16s cubic-bezier(.22,.8,.24,1), opacity .16s ease, filter .16s ease;
          will-change:transform, opacity, filter;
        }
        .art-stack-view.dragging .art-stack-slide,
        .art-stack-view.dragging .art-stack-card {
          transition:none !important;
        }
        .art-stack-card img {
          width:100%;
          height:100%;
          object-fit:contain;
          object-position:center;
          display:block;
          pointer-events:none;
          -webkit-user-drag:none;
        }
        .art-stack-slide.center {
          z-index:3;
          transform:translateX(calc(-50% + var(--art-drag-x))) scale(1);
          opacity:1;
        }
        .art-stack-slide.prev,
        .art-stack-slide.next { z-index:1; }
        .art-stack-slide.prev {
          transform:translateX(calc(-106% + (var(--art-drag-x) * .34))) scale(.84);
          opacity:.56;
        }
        .art-stack-slide.next {
          transform:translateX(calc(6% + (var(--art-drag-x) * .34))) scale(.84);
          opacity:.56;
        }
        .art-stack-slide.prev .art-stack-card {
          opacity:1;
          filter:saturate(.88);
          transform:perspective(900px) rotateY(18deg) scale(.9);
        }
        .art-stack-slide.next .art-stack-card {
          opacity:1;
          filter:saturate(.88);
          transform:perspective(900px) rotateY(-18deg) scale(.9);
        }
        .art-stack-card.ghost {
          background:rgba(255,255,255,.04);
          border-color:rgba(255,255,255,.06);
          opacity:.16;
        }
        .art-stack-card.placeholder {
          background:
            radial-gradient(circle at 35% 25%, color-mix(in srgb, var(--ma-accent) 24%, transparent), transparent 34%),
            linear-gradient(135deg, rgba(255,255,255,.12), rgba(255,255,255,.03));
          display:grid;
          place-items:center;
        }
        .art-stack-fallback {
          width:100%;
          height:100%;
          max-width:100%;
          max-height:100%;
          display:grid;
          place-items:center;
          align-content:center;
          justify-content:center;
          margin:auto;
          color:color-mix(in srgb, var(--ma-accent) 76%, white 24%);
          position:relative;
          overflow:hidden;
          inset:0;
          transform:translateZ(0);
          background:
            radial-gradient(circle at 24% 20%, color-mix(in srgb, var(--ma-accent) 30%, transparent), transparent 28%),
            radial-gradient(circle at 74% 26%, color-mix(in srgb, var(--ma-accent) 18%, rgba(255,255,255,.18)), transparent 30%),
            linear-gradient(145deg, rgba(255,255,255,.12), rgba(255,255,255,.03));
        }
        .art-stack-fallback::before {
          content:"";
          position:absolute;
          inset:0;
          border-radius:inherit;
          background:radial-gradient(circle at center, color-mix(in srgb, var(--ma-accent) 34%, transparent), transparent 62%);
          filter:blur(24px);
          opacity:.74;
        }
        .art-stack-fallback::after {
          content:"";
          position:absolute;
          inset:12%;
          border-radius:28px;
          border:1px solid rgba(255,255,255,.12);
          background:linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.02));
          box-shadow:inset 0 1px 0 rgba(255,255,255,.12);
        }
        .fallback-disc {
          width:104px;
          height:104px;
          border-radius:34px;
          display:grid;
          place-items:center;
          background:rgba(12,16,24,.36);
          border:1px solid rgba(255,255,255,.18);
          z-index:1;
          box-shadow:0 18px 42px rgba(0,0,0,.22), inset 0 1px 0 rgba(255,255,255,.12);
          backdrop-filter:blur(14px);
          -webkit-backdrop-filter:blur(14px);
        }
        .fallback-disc .ui-ic { width:46px; height:46px; }
        .fallback-aura {
          position:absolute;
          inset:0;
          border-radius:inherit;
          background:
            radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--ma-accent) 24%, transparent), transparent 38%),
            radial-gradient(circle at 50% 72%, color-mix(in srgb, var(--ma-accent) 14%, transparent), transparent 52%);
          opacity:.95;
        }
        .fallback-note {
          color:#fff6e2;
          animation:fallbackNotePulse 1.9s ease-in-out infinite;
        }
        @keyframes fallbackPulse {
          0%, 100% { transform:scale(.92); opacity:.48; }
          50% { transform:scale(1.08); opacity:.78; }
        }
        @keyframes fallbackNotePulse {
          0%,100% { transform:scale(.96); box-shadow:0 18px 42px rgba(0,0,0,.22), inset 0 1px 0 rgba(255,255,255,.12); }
          50% { transform:scale(1.06); box-shadow:0 22px 46px color-mix(in srgb, var(--ma-accent) 18%, rgba(0,0,0,.22)), inset 0 1px 0 rgba(255,255,255,.18); }
        }
        .art-stack-cue {
          position:absolute;
          inset-block-start:50%;
          transform:translateY(-50%);
          width:28px;
          height:28px;
          display:grid;
          place-items:center;
          font-size:24px;
          font-weight:900;
          line-height:1;
          color:rgba(255,255,255,.42);
          text-shadow:0 10px 18px rgba(0,0,0,.2);
          pointer-events:none;
          animation:stackCueFade 2.6s ease-in-out infinite;
          z-index:4;
        }
        .art-stack-cue.start { inset-inline-start:8px; }
        .art-stack-cue.end { inset-inline-end:8px; animation-delay:1.25s; }
        .theme-light .art-stack-card {
          background:rgba(255,255,255,.58);
          border-color:rgba(142,157,180,.2);
          box-shadow:0 22px 42px rgba(111,126,150,.16);
        }
        .theme-light .art-stack-cue {
          color:rgba(44,56,72,.36);
          text-shadow:none;
        }
        @keyframes stackCueFade {
          0%, 100% { opacity:.08; }
          45% { opacity:.38; }
          60% { opacity:.2; }
        }
        .mobile-art-shell {
          position:relative;
          width:min(440px, calc(100% - 2px));
          max-width:100%;
          margin-inline:auto;
          flex:0 0 auto;
          z-index:1;
          justify-self:center;
          display:block;
          box-sizing:border-box;
          padding:16px 14px 14px;
          border-radius:42px;
          background:rgba(255,255,255,.06);
          border:1px solid rgba(255,255,255,.12);
          backdrop-filter:blur(18px);
          -webkit-backdrop-filter:blur(18px);
          box-shadow:0 20px 44px rgba(0,0,0,.16);
          transition:transform .24s ease, opacity .24s ease;
        }
        .card.layout-tablet .mobile-art-shell {
          grid-area:shell;
          width:min(840px, 100%);
          padding:14px 14px 10px;
          border-radius:42px;
          box-shadow:0 24px 46px rgba(0,0,0,.16);
        }
        .card.layout-tablet .art-stack-view,
        .card.layout-tablet .art-stack-viewport,
        .card.layout-tablet .art-stack-container {
          min-height:clamp(246px, 26vw, 356px);
        }
        .card.layout-tablet .art-stack-slide {
          width:42%;
        }
        .card.layout-tablet .art-stack-slide.prev {
          transform:translateX(calc(-110% + (var(--art-drag-x) * .34))) scale(.82);
          opacity:.44;
        }
        .card.layout-tablet .art-stack-slide.next {
          transform:translateX(calc(10% + (var(--art-drag-x) * .34))) scale(.82);
          opacity:.44;
        }
        .card.layout-tablet .art-stack-slide.prev .art-stack-card {
          transform:perspective(1080px) rotateY(16deg) scale(.9);
        }
        .card.layout-tablet .art-stack-slide.next .art-stack-card {
          transform:perspective(1080px) rotateY(-16deg) scale(.9);
        }
        .card.layout-tablet .art-stack-cue {
          width:34px;
          height:34px;
          font-size:28px;
        }
        .card.layout-tablet .art-stack-cue.start { inset-inline-start:18px; }
        .card.layout-tablet .art-stack-cue.end { inset-inline-end:18px; }
        .theme-light .mobile-art-shell {
          background:rgba(255,255,255,.34);
          border-color:rgba(141,155,177,.18);
          box-shadow:0 18px 36px rgba(111,126,150,.14);
        }
        .mobile-art-shell.swipe-next,
        .mobile-art-shell.swipe-prev { animation:none; }
        .np-art.mobile-art {
          width:100%; aspect-ratio:1/1; border-radius:36px; overflow:hidden; display:grid; place-items:center; margin-inline:auto;
          background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.12); box-shadow:0 24px 48px rgba(0,0,0,.24); font-size:72px; color:rgba(255,255,255,.72);
        }
        .np-art.mobile-art img { width:100%; height:100%; object-fit:contain; object-position:center center; }
        .mobile-art-actions {
          position:relative;
          inset:auto;
          display:flex;
          align-items:center;
          justify-content:center;
          gap:10px;
          width:auto;
          margin:12px auto 0;
          padding:0;
          border-radius:0;
          background:transparent;
          border:none;
          backdrop-filter:none;
          -webkit-backdrop-filter:none;
          box-shadow:none;
        }
        .card.layout-tablet .mobile-art-actions {
          width:auto;
          margin-top:-10px;
          margin-bottom:6px;
          position:relative;
          z-index:4;
        }
        .mobile-art-actions.count-3 { grid-template-columns:none; }
        .mobile-art-fab {
          position:static;
          width:48px; min-width:48px; height:48px; border-radius:999px; border:1px solid rgba(255,255,255,.14);
          background:rgba(14,18,28,.48); backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px);
          color:#fff; display:grid; place-items:center; cursor:pointer; box-shadow:0 12px 28px rgba(0,0,0,.2);
          transition:transform .16s ease, background-color .16s ease, border-color .16s ease, color .16s ease, box-shadow .16s ease;
        }
        .card.layout-tablet .mobile-art-fab {
          width:46px;
          min-width:46px;
          height:46px;
          border-radius:999px;
        }
        .mobile-art-fab .ui-ic { width:20px; height:20px; }
        .mobile-art-fab.active { color:#f5a623; border-color:rgba(245,166,35,.34); background:rgba(245,166,35,.14); }
        .theme-light .np-art.mobile-art {
          background:rgba(255,255,255,.56);
          border-color:rgba(142,157,180,.2);
          box-shadow:0 22px 42px rgba(111,126,150,.18);
          color:rgba(64,74,87,.6);
        }
        .theme-light .player-chip-ico,
        .theme-light .mobile-art-fab {
          background:rgba(255,255,255,.76);
          border-color:rgba(141,155,177,.22);
          box-shadow:0 12px 26px rgba(111,126,150,.16);
        }
        .theme-light .player-focus,
        .theme-light .mobile-art-actions {
          background:transparent;
          border-color:transparent;
          box-shadow:none;
        }
        .theme-light .mobile-art-fab { color:#1f2633; }
        .theme-light .mobile-art-fab.active {
          color:#f5a623;
          border-color:rgba(245,166,35,.38);
          background:rgba(245,166,35,.16);
        }
        .mobile-meta { display:none; }
        .bottom { display:grid; width:100%; max-width:100%; min-width:0; gap:10px; align-content:end; }
        .card.layout-tablet .bottom {
          width:100%;
          max-width:min(980px, 100%);
          margin-inline:auto;
          gap:10px;
          position:relative;
          z-index:5;
          margin-top:-4px;
        }
        .history-chip {
          width:100%;
          display:grid;
          grid-template-columns:36px minmax(0,1fr);
          align-items:center;
          gap:10px;
          padding:8px 10px;
          border:none;
          border-radius:18px;
          color:inherit;
          text-align:start;
          background:rgba(255,255,255,.08);
          border:1px solid rgba(255,255,255,.1);
          box-shadow:0 12px 24px rgba(0,0,0,.12);
          backdrop-filter:blur(14px);
          -webkit-backdrop-filter:blur(14px);
          cursor:pointer;
          transition:transform .16s ease, opacity .18s ease, border-color .18s ease;
        }
        .history-chip:hover {
          transform:translateY(-1px);
          border-color:rgba(var(--dynamic-accent-rgb, 224 161 27) / .28);
        }
        .history-chip:active {
          transform:translateY(1px) scale(.985);
        }
        .history-chip-art {
          width:36px;
          height:36px;
          border-radius:12px;
          overflow:hidden;
          display:grid;
          place-items:center;
          background:rgba(255,255,255,.08);
          box-shadow:inset 0 1px 0 rgba(255,255,255,.08);
        }
        .history-chip-art img {
          width:100%;
          height:100%;
          object-fit:cover;
          display:block;
        }
        .history-chip-copy {
          min-width:0;
          display:grid;
          gap:2px;
        }
        .history-chip-title,
        .history-chip-sub {
          white-space:nowrap;
          overflow:hidden;
          text-overflow:ellipsis;
        }
        .history-chip-title {
          font-size:12px;
          font-weight:800;
          color:#fffdf7;
        }
        .history-chip-sub {
          font-size:10px;
          font-weight:600;
          color:rgba(255,255,255,.62);
        }
        .theme-light .history-chip {
          background:rgba(255,255,255,.76);
          border-color:rgba(143,159,181,.16);
          box-shadow:0 12px 24px rgba(95,112,136,.12);
        }
        .theme-light .history-chip-title {
          color:#1f2633;
        }
        .theme-light .history-chip-sub {
          color:#5d6b7f;
        }
        .time-row,.controls,.accent-row,.progress-line { direction:ltr; }
        .time-row { display:contents; }
        .progress-line {
          display:grid;
          grid-template-columns:auto minmax(0,1fr) auto;
          align-items:center;
          gap:10px;
        }
        .empty-quick-shelf {
          display:flex;
          gap:16px;
          width:min(980px, 100%);
          margin:0 auto;
          padding:8px 8px 10px;
          overflow-x:auto;
          scrollbar-width:none;
          -ms-overflow-style:none;
          scroll-snap-type:x proximity;
        }
        .empty-quick-shelf::-webkit-scrollbar {
          display:none;
        }
        .empty-quick-card {
          min-width:214px;
          max-width:214px;
          min-height:78px;
          padding:12px 14px;
          display:grid;
          grid-template-columns:48px minmax(0,1fr);
          gap:12px;
          align-items:center;
          border:none;
          border-radius:24px;
          color:inherit;
          background:linear-gradient(145deg, rgba(255,255,255,.12), rgba(255,255,255,.05));
          border:1px solid rgba(255,255,255,.12);
          box-shadow:0 18px 34px rgba(0,0,0,.14), inset 0 1px 0 rgba(255,255,255,.08);
          backdrop-filter:blur(18px);
          -webkit-backdrop-filter:blur(18px);
          cursor:pointer;
          scroll-snap-align:center;
          transition:transform .16s ease, border-color .16s ease, box-shadow .16s ease, background-color .16s ease;
        }
        .empty-quick-card:active,
        .empty-quick-card.pressed {
          transform:translateY(1px) scale(.98);
          border-color:color-mix(in srgb, var(--ma-accent) 34%, rgba(255,255,255,.14));
          box-shadow:0 12px 24px rgba(0,0,0,.12), 0 0 0 1px color-mix(in srgb, var(--ma-accent) 24%, transparent);
        }
        .empty-quick-art {
          width:48px;
          height:48px;
          border-radius:16px;
          overflow:hidden;
          display:grid;
          place-items:center;
          background:linear-gradient(135deg, color-mix(in srgb, var(--ma-accent) 20%, transparent), rgba(255,255,255,.06));
          border:1px solid rgba(255,255,255,.12);
          box-shadow:0 10px 24px rgba(0,0,0,.16);
        }
        .empty-quick-art img {
          width:100%;
          height:100%;
          object-fit:cover;
          display:block;
        }
        .empty-quick-art .ui-ic {
          width:22px;
          height:22px;
        }
        .empty-quick-copy {
          min-width:0;
          display:grid;
          gap:4px;
          text-align:start;
        }
        .empty-quick-kicker {
          font-size:10px;
          font-weight:900;
          letter-spacing:.08em;
          text-transform:uppercase;
          color:rgba(255,255,255,.5);
        }
        .empty-quick-title {
          font-size:14px;
          font-weight:900;
          line-height:1.2;
          color:#f4f6fb;
          overflow:hidden;
          text-overflow:ellipsis;
          white-space:nowrap;
        }
        .card.layout-tablet .progress-line,
        .card.layout-tablet .controls {
          width:min(920px, 100%);
          margin-inline:auto;
        }
        .card.layout-tablet .progress-line {
          gap:10px;
          margin-top:2px;
        }
        .progress-time {
          font-size:13px;
          color:rgba(255,255,255,.74);
          min-width:38px;
          text-align:center;
        }
        .card.layout-tablet .progress-time {
          font-size:14px;
          min-width:48px;
        }
        .theme-light .progress-time {
          color:#4b5c73;
        }
        .progress { height:12px; border-radius:999px; overflow:hidden; cursor:pointer; background:rgba(255,255,255,.16); box-shadow:inset 0 1px 2px rgba(0,0,0,.18); min-width:0; }
        .card.layout-tablet .progress {
          height:10px;
        }
        .progress-fill {
          width:0%;
          height:100%;
          background:linear-gradient(90deg, var(--ma-accent), color-mix(in srgb, var(--ma-accent) 72%, white 28%));
        }
        .controls { display:flex; align-items:center; justify-content:center; gap:10px; }
        .card.layout-tablet .controls {
          gap:22px;
          margin-top:2px;
        }
        .side-btn,.main-btn,.volume-btn,.menu-head button,.queue-actions .chip-btn,.action-btn {
          border:none; cursor:pointer; color:#fff; font:inherit;
          display:grid; place-items:center; background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.12);
        }
        .side-btn,.volume-btn { width:60px; height:60px; border-radius:20px; box-shadow:0 14px 28px rgba(0,0,0,.18); }
        .side-btn.minor-btn { width:50px; height:50px; border-radius:17px; }
        .main-btn { width:124px; height:124px; border-radius:50%; box-shadow:0 20px 36px rgba(0,0,0,.22); background:linear-gradient(135deg,rgba(255,255,255,.18),rgba(255,255,255,.1)); position:relative; overflow:visible; }
        .card.layout-tablet .side-btn,
        .card.layout-tablet .volume-btn { width:68px; height:68px; border-radius:999px; }
        .card.layout-tablet .side-btn.minor-btn { width:56px; height:56px; border-radius:999px; }
        .card.layout-tablet .main-btn { width:116px; height:116px; }
        .card.layout-tablet .main-btn::after {
          content:"";
          position:absolute;
          inset:-6px;
          border-radius:inherit;
          border:1px solid transparent;
          opacity:0;
          pointer-events:none;
        }
        .card.layout-tablet .main-btn.is-playing::after {
          border-color:rgba(255,255,255,.22);
          box-shadow:0 0 16px rgba(255,255,255,.12);
          animation:main-btn-pulse 2.4s ease-out infinite;
          opacity:.75;
        }
        @keyframes main-btn-pulse {
          0% { transform:scale(1); opacity:.58; }
          65% { transform:scale(1.08); opacity:.14; }
          100% { transform:scale(1.12); opacity:0; }
        }
        .side-btn .ui-ic,.volume-btn .ui-ic { width:42%; height:42%; }
        .side-btn.minor-btn .ui-ic { width:38%; height:38%; }
        .main-btn .ui-ic { width:44%; height:44%; }
        .side-btn.active { border-color:rgba(245,166,35,.34); background:rgba(245,166,35,.14); }
        .side-btn.muted {
          border-color:rgba(214,76,76,.26);
          background:rgba(214,76,76,.18);
          color:#ff8f8f;
        }
        .volume-btn.active {
          color:#fff7e8;
          border-color:color-mix(in srgb, var(--ma-accent) 48%, transparent);
          background:linear-gradient(135deg, color-mix(in srgb, var(--ma-accent) 34%, transparent), color-mix(in srgb, var(--ma-accent) 18%, transparent));
          box-shadow:0 12px 28px color-mix(in srgb, var(--ma-accent) 26%, transparent);
        }
        .accent-row { display:grid; grid-template-columns:auto minmax(0,1fr) auto; gap:10px; align-items:center; padding:7px 9px; border-radius:18px; }
        .card.layout-tablet .accent-row {
          position:relative;
          inset:auto;
          transform:none;
          z-index:6;
          width:min(920px, 100%);
          min-height:0;
          grid-template-columns:auto minmax(0,1fr) auto;
          grid-template-rows:auto;
          justify-items:stretch;
          gap:12px;
          padding:10px 12px;
          border-radius:26px;
          background:rgba(14,18,28,.42);
          border:1px solid rgba(255,255,255,.12);
          backdrop-filter:blur(18px);
          -webkit-backdrop-filter:blur(18px);
          box-shadow:0 14px 28px rgba(0,0,0,.18);
          justify-self:center;
          align-self:start;
        }
        .theme-light .card.layout-tablet .accent-row {
          background:rgba(255,255,255,.58);
          border-color:rgba(141,155,177,.18);
          box-shadow:0 18px 34px rgba(111,126,150,.12);
        }
        .card.layout-tablet .accent-row .volume-btn {
          grid-row:auto;
          width:54px;
          height:54px;
          border-radius:999px;
          align-self:center;
        }
        .card.layout-tablet .accent-row .volume-value {
          grid-row:auto;
          min-width:54px;
          width:auto;
          text-align:end;
          font-size:14px;
          font-weight:900;
          align-self:center;
        }
        .card.layout-tablet .accent-row .tablet-volume-track {
          grid-row:auto;
          width:100%;
          height:auto;
          display:grid;
          place-items:center;
          align-self:center;
          justify-self:stretch;
        }
        .card.layout-tablet .accent-row .volume-slider {
          -webkit-appearance:none;
          appearance:none;
          writing-mode:horizontal-tb;
          direction:ltr;
          width:100%;
          height:7px;
          margin:0;
          align-self:center;
          justify-self:stretch;
          background:linear-gradient(to right,var(--ma-accent) 0%,var(--ma-accent) var(--vol-pct,50%),rgba(255,255,255,.22) var(--vol-pct,50%),rgba(255,255,255,.22) 100%);
          accent-color:var(--ma-accent);
        }
        .tablet-volume-popup {
          width:min(760px, calc(100vw - 104px));
          border-radius:0;
          padding:0;
          background:transparent;
          border:none;
          box-shadow:none;
          backdrop-filter:none;
          -webkit-backdrop-filter:none;
          display:grid;
          grid-template-columns:auto minmax(0,1fr) auto;
          align-items:center;
          gap:16px;
        }
        .theme-light .tablet-volume-popup {
          background:transparent;
          border:none;
          box-shadow:none;
        }
        .tablet-volume-popup-head {
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:14px;
        }
        .tablet-volume-popup-title {
          font-size:20px;
          font-weight:900;
          letter-spacing:.01em;
        }
        .tablet-volume-popup-value {
          min-width:58px;
          text-align:center;
          font-size:20px;
          font-weight:950;
          color:var(--ma-accent);
        }
        .tablet-volume-popup-body {
          display:grid;
          grid-template-columns:minmax(0,1fr) auto;
          gap:18px;
          align-items:center;
        }
        .tablet-volume-popup .volume-slider {
          width:100%;
          height:22px;
          border-radius:999px;
          background:linear-gradient(to right,var(--ma-accent) 0%,var(--ma-accent) var(--vol-pct,50%),rgba(255,255,255,.16) var(--vol-pct,50%),rgba(255,255,255,.16) 100%);
        }
        .tablet-volume-popup .volume-slider::-webkit-slider-thumb {
          width:30px;
          height:30px;
          border-radius:999px;
          background:var(--ma-accent);
          border:2px solid rgba(255,255,255,.7);
          box-shadow:0 8px 18px rgba(0,0,0,.18);
        }
        .tablet-volume-popup .volume-slider::-moz-range-thumb {
          width:30px;
          height:30px;
          border-radius:999px;
          background:var(--ma-accent);
          border:2px solid rgba(255,255,255,.7);
          box-shadow:0 8px 18px rgba(0,0,0,.18);
        }
        .theme-light .tablet-volume-popup .volume-slider {
          background:linear-gradient(to right,var(--ma-accent) 0%,var(--ma-accent) var(--vol-pct,50%),rgba(95,108,128,.14) var(--vol-pct,50%),rgba(95,108,128,.14) 100%);
        }
        .mobile-volume-inline {
          display:grid;
          grid-template-columns:auto minmax(0, 1fr) auto;
          align-items:center;
          gap:12px;
          width:100%;
        }
        .mobile-volume-inline .tablet-volume-track {
          min-width:0;
          width:100%;
        }
        .mobile-volume-inline .volume-value {
          min-width:52px;
          text-align:center;
        }
        .mobile-volume-inline .volume-btn {
          flex:0 0 auto;
        }
        .card.layout-tablet .tablet-volume-inline {
          width:min(720px, 92%);
          margin:4px auto 0;
          padding:0;
          background:transparent;
          border:none;
          box-shadow:none;
        }
        .card.layout-tablet .tablet-volume-inline .volume-btn {
          width:58px;
          height:58px;
          border-radius:999px;
        }
        .card.layout-tablet .tablet-volume-inline .volume-value {
          min-width:58px;
          text-align:center;
        }
        .volume-value {
          min-width:44px;
          text-align:end;
          font-size:12px;
          font-weight:800;
          color:rgba(255,255,255,.78);
          flex-shrink:0;
          border:none;
          background:transparent;
          padding:0;
          cursor:pointer;
        }
        .volume-slider { width:100%; appearance:none; height:7px; border-radius:999px; outline:none; background:linear-gradient(to right,var(--ma-accent) 0%,var(--ma-accent) var(--vol-pct,50%),rgba(255,255,255,.22) var(--vol-pct,50%),rgba(255,255,255,.22) 100%); accent-color:var(--ma-accent); }
        .volume-slider::-webkit-slider-thumb { appearance:none; width:17px; height:17px; border-radius:50%; background:var(--ma-accent); border:none; }
        .volume-slider::-moz-range-thumb { width:17px; height:17px; border-radius:50%; background:var(--ma-accent); border:none; }
        .footer-nav {
          display:flex;
          align-items:stretch;
          gap:10px;
          width:100%;
          margin-top:12px;
          padding:10px;
          border-radius:28px;
          background:rgba(255,255,255,.08);
          border:1px solid rgba(255,255,255,.14);
          backdrop-filter:blur(18px);
          -webkit-backdrop-filter:blur(18px);
          box-shadow:0 20px 40px rgba(0,0,0,.18);
        }
        .card.layout-tablet .footer-nav {
          width:100%;
          margin-inline:auto;
          justify-content:flex-start;
          align-items:stretch;
          flex-direction:column;
          gap:12px;
          padding:0;
          border-radius:0;
          position:relative;
          z-index:5;
          background:transparent;
          border:none;
          backdrop-filter:none;
          -webkit-backdrop-filter:none;
          box-shadow:none;
          flex:1 1 auto;
        }
        .footer-btn {
          flex:1 1 0;
          min-width:0;
          min-height:72px;
          padding:10px 8px;
          border:none;
          border-radius:20px;
          display:grid;
          place-items:center;
          gap:6px;
          font:inherit;
          font-weight:800;
          font-size:calc(12px * var(--v2-font-scale));
          color:#fff;
          background:linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.04));
          border:1px solid rgba(255,255,255,.12);
          box-shadow:inset 0 1px 0 rgba(255,255,255,.06);
          cursor:pointer;
          transition:transform .18s ease, background-color .18s ease, border-color .18s ease, box-shadow .18s ease, color .18s ease;
        }
        .card.layout-tablet .footer-btn {
          flex:0 0 auto;
          min-height:78px;
          padding:10px 8px;
          border-radius:24px;
          font-size:calc(10px * var(--v2-font-scale));
          gap:7px;
        }
        .card.layout-tablet .footer-btn .ui-ic {
          width:22px;
          height:22px;
        }
        .footer-btn .ui-ic { width:22px; height:22px; }
        .footer-btn-label { white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:100%; }
        .footer-btn.accent {
          background:linear-gradient(135deg, rgba(245,166,35,.62), rgba(247,191,92,.48));
          border-color:rgba(255,203,101,.28);
          box-shadow:0 14px 28px rgba(224,161,27,.16), inset 0 1px 0 rgba(255,255,255,.08);
        }
        .footer-btn.soft-accent {
          background:linear-gradient(135deg, rgba(245,166,35,.22), rgba(247,191,92,.14));
          border-color:rgba(245,166,35,.22);
          color:#ffcb73;
        }
        .footer-nav .footer-btn,
        .footer-nav .footer-btn.accent,
        .footer-nav .footer-btn.soft-accent {
          color:inherit;
          background:linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.04));
          border-color:rgba(255,255,255,.12);
          box-shadow:inset 0 1px 0 rgba(255,255,255,.06);
        }
        .footer-nav > #playersFooterBtn { grid-column:1; }
        .footer-nav > #libraryToggleBtn { grid-column:2; }
        .footer-nav > #menuToggleBtn { grid-column:3; }
        .footer-nav > #settingsFooterBtn { grid-column:4; }
        .card.layout-tablet .active-players-bubble { display:none !important; }
        .theme-light .player-kicker { color:rgba(66,79,97,.58); }
        .theme-light .player-sub,
        .theme-light .hero-sub,
        .theme-light .time-row,
        .theme-light .menu-item-sub,
        .theme-light .queue-sub,
        .theme-light .media-section-title { color:rgba(55,68,85,.68); }
        .theme-light .hero-title,
        .theme-light .menu-title,
        .theme-light .menu-item-title,
        .theme-light .queue-title,
        .theme-light .player-name,
        .theme-light .status-pill,
        .theme-light .progress-time { color:#1f2633; }
        .theme-light .card,
        .theme-light .card button,
        .theme-light .card input,
        .theme-light .card select,
        .theme-light .card textarea {
          color:#1f2633;
        }
        .theme-light .card .settings-value,
        .theme-light .card .settings-check-pill span,
        .theme-light .card .footer-btn,
        .theme-light .card .player-focus-name,
        .theme-light .card .player-focus-kicker,
        .theme-light .card .player-focus-pill,
        .theme-light .card .menu-item-sub,
        .theme-light .card .queue-sub,
        .theme-light .card .hero-sub,
        .theme-light .card .np-sub,
        .theme-light .card .empty-quick-kicker {
          color:rgba(43,54,70,.84);
        }
        .theme-light .up-next-inline {
          background:transparent;
          box-shadow:none;
        }
        .theme-light .up-next-prefix {
          color:color-mix(in srgb, var(--ma-accent) 54%, #62708a);
        }
        .theme-light .up-next-art {
          background:rgba(232,238,247,.95);
        }
        .theme-light .up-next-art-fallback {
          color:#65758d;
        }
        .theme-light .card.empty-media .hero-sub,
        .theme-light .card.empty-media .np-sub {
          color:rgba(48,58,74,.8);
        }
        .theme-light .volume-value { color:rgba(55,68,85,.72); }
        .theme-light .progress { background:rgba(65,76,92,.14); }
        .theme-light .side-btn,.theme-light .main-btn,.theme-light .volume-btn,.theme-light .menu-head button,.theme-light .queue-actions .chip-btn,.theme-light .action-btn {
          color:#1f2633;
          background:rgba(255,255,255,.58);
          border-color:rgba(141,155,177,.22);
          box-shadow:0 12px 28px rgba(111,126,150,.14);
        }
        .theme-light .side-btn.active {
          border-color:rgba(245,166,35,.38);
          background:rgba(245,166,35,.16);
        }
        .theme-light .side-btn.muted {
          border-color:rgba(214,76,76,.24);
          background:rgba(214,76,76,.12);
          color:#b13d3d;
        }
        .theme-light .volume-btn.active {
          color:#8b5e12;
          border-color:color-mix(in srgb, var(--ma-accent) 42%, transparent);
          background:linear-gradient(135deg, color-mix(in srgb, var(--ma-accent) 18%, white 82%), color-mix(in srgb, var(--ma-accent) 10%, white 90%));
        }
        .theme-light .main-btn {
          background:linear-gradient(135deg, rgba(255,255,255,.82), rgba(241,245,251,.68));
        }
        .theme-light .card.layout-tablet .main-btn.is-playing::after {
          border-color:rgba(31,38,51,.16);
          box-shadow:0 0 16px rgba(31,38,51,.08);
        }
        .theme-light .footer-nav {
          background:rgba(255,255,255,.66);
          border-color:rgba(147,161,183,.18);
          box-shadow:0 16px 34px rgba(110,127,153,.14);
        }
        .theme-light .top-settings-fab,
        .theme-light .home-shortcut-fab {
          background:rgba(255,255,255,.8);
          border-color:rgba(147,161,183,.18);
          color:#1f2633;
          box-shadow:0 12px 24px rgba(111,126,150,.14);
        }
        .theme-light .footer-btn {
          color:#1f2633;
          background:linear-gradient(180deg, rgba(255,255,255,.82), rgba(247,249,252,.72));
          border-color:rgba(147,161,183,.18);
          box-shadow:inset 0 1px 0 rgba(255,255,255,.42);
        }
        .theme-light .footer-btn.accent {
          color:#111827;
          background:linear-gradient(135deg, rgba(245,166,35,.72), rgba(247,191,92,.58));
          border-color:rgba(245,166,35,.26);
          box-shadow:0 14px 28px rgba(224,161,27,.14), inset 0 1px 0 rgba(255,255,255,.28);
        }
        .theme-light .footer-btn.soft-accent {
          color:#8b5e12;
          background:linear-gradient(135deg, rgba(245,166,35,.16), rgba(247,191,92,.12));
          border-color:rgba(245,166,35,.18);
        }
        .theme-light .footer-nav .footer-btn,
        .theme-light .footer-nav .footer-btn.accent,
        .theme-light .footer-nav .footer-btn.soft-accent {
          color:#1f2633;
          background:linear-gradient(180deg, rgba(255,255,255,.82), rgba(247,249,252,.72));
          border-color:rgba(147,161,183,.18);
          box-shadow:inset 0 1px 0 rgba(255,255,255,.42);
        }
        .theme-light .card.layout-tablet .footer-nav .footer-btn,
        .theme-light .card.layout-tablet .footer-nav .footer-btn.accent,
        .theme-light .card.layout-tablet .footer-nav .footer-btn.soft-accent {
          background:rgba(255,255,255,.5);
          border-color:rgba(147,161,183,.16);
          box-shadow:0 10px 22px rgba(111,126,150,.1), inset 0 1px 0 rgba(255,255,255,.34);
        }
        .theme-light .card.layout-tablet .player-focus {
          background:rgba(255,255,255,.5);
          border-color:rgba(147,161,183,.16);
          box-shadow:0 16px 30px rgba(111,126,150,.1);
        }
        .theme-custom .footer-nav,
        .theme-custom .menu-sheet,
        .theme-custom .notice,
        .theme-custom .accent-row,
        .theme-custom .menu-item,
        .theme-custom .menu-list-item,
        .theme-custom .queue-row {
          background:rgba(var(--v2-custom-rgb) / .16);
          border-color:rgba(var(--v2-custom-rgb) / .22);
          box-shadow:0 16px 34px rgba(0,0,0,.14);
          color:var(--v2-custom-text, #fff);
        }
        .theme-custom .footer-btn {
          color:var(--v2-custom-text, #fff);
          background:linear-gradient(180deg, rgba(var(--v2-custom-rgb) / .2), rgba(var(--v2-custom-rgb) / .12));
          border-color:rgba(var(--v2-custom-rgb) / .2);
        }
        .theme-custom .footer-btn.accent,
        .theme-custom .footer-btn.soft-accent {
          background:linear-gradient(135deg, rgba(var(--v2-custom-rgb) / .42), rgba(var(--v2-custom-rgb) / .26));
          border-color:rgba(var(--v2-custom-rgb) / .34);
        }
        .theme-custom .footer-nav .footer-btn,
        .theme-custom .footer-nav .footer-btn.accent,
        .theme-custom .footer-nav .footer-btn.soft-accent {
          color:var(--v2-custom-text, #fff);
          background:linear-gradient(180deg, rgba(var(--v2-custom-rgb) / .2), rgba(var(--v2-custom-rgb) / .12));
          border-color:rgba(var(--v2-custom-rgb) / .22);
        }
        .theme-custom .progress-time,
        .theme-custom .menu-item-title,
        .theme-custom .queue-title,
        .theme-custom .hero-title,
        .theme-custom .hero-sub,
        .theme-custom .up-next-title,
        .theme-custom .menu-title,
        .theme-custom .volume-value,
        .theme-custom .player-focus,
        .theme-custom .footer-btn,
        .theme-custom .menu-item-ico,
        .theme-custom .media-category-ico {
          color:#fff !important;
        }
        .theme-custom .up-next-prefix,
        .theme-custom .up-next-art-fallback {
          color:var(--v2-custom-text, #fff) !important;
        }
        .theme-custom .up-next-inline {
          background:transparent;
          border-color:transparent;
        }
        .status-pill { grid-area:status; display:inline-flex; align-items:center; gap:8px; width:fit-content; max-width:100%; padding:9px 14px; border-radius:999px; font-size:12px; font-weight:700; justify-self:start; cursor:pointer; }
        .status-pill.offline { background:rgba(214,86,86,.16); border-color:rgba(214,86,86,.26); }
        .status-dot { width:8px; height:8px; border-radius:50%; background:#4bd06e; box-shadow:0 0 10px rgba(75,208,110,.42); }
        .status-pill.offline .status-dot { background:#e26b6b; box-shadow:0 0 10px rgba(226,107,107,.42); }
        .notice { display:none; padding:14px 16px; border-radius:22px; line-height:1.45; }
        .notice.open { display:block; }
        .menu-backdrop {
          position:absolute; inset:0; z-index:30; display:none; align-items:stretch; justify-content:center;
          padding:max(30px, env(safe-area-inset-top)) max(10px, env(safe-area-inset-right)) max(12px, env(safe-area-inset-bottom)) max(10px, env(safe-area-inset-left));
          background:rgba(8,10,16,.48); backdrop-filter:blur(18px); -webkit-backdrop-filter:blur(18px);
        }
        .menu-backdrop.open { display:flex; }
        .menu-backdrop.search-open {
          align-items:stretch;
        }
        .card.layout-tablet .menu-backdrop {
          align-items:stretch;
          justify-content:flex-start;
          padding:max(14px, env(safe-area-inset-top)) 14px max(14px, env(safe-area-inset-bottom)) 14px;
        }
        .card.layout-tablet.rtl .menu-backdrop {
          justify-content:flex-start;
        }
        .queue-action-backdrop {
          position:fixed; inset:0; z-index:85; display:none; align-items:center; justify-content:center;
          padding:max(20px, env(safe-area-inset-top)) 16px max(20px, env(safe-area-inset-bottom));
          background:rgba(8,10,16,.28);
          backdrop-filter:blur(12px);
          -webkit-backdrop-filter:blur(12px);
        }
        .queue-action-backdrop.open { display:flex; }
        .queue-action-sheet {
          width:min(100%, 292px);
          max-height:min(78vh, 520px);
          overflow:auto;
          padding:12px;
          border-radius:24px;
          border:1px solid rgba(255,255,255,.12);
          background:rgba(17,19,28,.92);
          box-shadow:0 24px 56px rgba(0,0,0,.28);
          display:grid;
          gap:10px;
        }
        .queue-action-sheet.tablet-volume-sheet-host {
          width:min(760px, calc(100vw - 72px));
          padding:0;
          border:none;
          background:transparent;
          box-shadow:none;
        }
        .theme-light .queue-action-sheet {
          background:rgba(255,255,255,.94);
          border-color:rgba(141,155,177,.22);
          box-shadow:0 18px 38px rgba(111,126,150,.18);
        }
        .queue-action-item {
          min-height:56px;
          border:none;
          border-radius:18px;
          display:flex;
          align-items:center;
          justify-content:center;
          gap:10px;
          padding:12px 14px;
          color:inherit;
          background:transparent;
          font:inherit;
          font-size:14px;
          font-weight:800;
          cursor:pointer;
          text-align:center;
        }
        .queue-action-item:hover {
          background:rgba(255,255,255,.06);
          transform:translateY(-1px);
        }
        .theme-light .queue-action-item:hover {
          background:rgba(31,38,51,.06);
        }
        .queue-action-item .ui-ic {
          width:16px;
          height:16px;
        }
        .queue-action-item.warn {
          color:#ffcf86;
        }
        .queue-action-item:not(.warn) .ui-ic,
        .queue-action-item:not(.warn) {
          color:var(--ma-accent);
        }
        .queue-action-header {
          display:grid;
          gap:4px;
          padding:8px 10px 10px;
          text-align:center;
          border-bottom:1px solid rgba(255,255,255,.08);
          margin-bottom:4px;
        }
        .theme-light .queue-action-header {
          border-bottom-color:rgba(141,155,177,.16);
        }
        .queue-action-player {
          font-size:11px;
          font-weight:900;
          letter-spacing:.08em;
          text-transform:uppercase;
          color:rgba(255,255,255,.56);
        }
        .theme-light .queue-action-player {
          color:rgba(55,68,85,.54);
        }
        .queue-action-title {
          font-size:16px;
          font-weight:900;
          line-height:1.2;
          color:inherit;
        }
        .confirm-sheet {
          width:min(100%, 460px);
          max-width:calc(100% - 28px);
          min-height:0;
          padding:24px;
        }
        .confirm-copy {
          color:var(--muted);
          line-height:1.75;
          font-size:15px;
        }
        .confirm-actions {
          display:grid;
          grid-template-columns:repeat(2, minmax(0, 1fr));
          gap:12px;
          margin-top:20px;
        }
        .confirm-actions .menu-item {
          min-height:54px;
          justify-content:center;
          text-align:center;
        }
        .smart-voice-sheet {
          width:min(100%, 520px);
          gap:18px;
        }
        .smart-voice-head {
          display:grid;
          gap:6px;
          text-align:center;
        }
        .smart-voice-title {
          font-size:22px;
          font-weight:950;
        }
        .smart-voice-target {
          color:var(--muted);
          font-size:13px;
          font-weight:800;
        }
        .smart-voice-card {
          display:grid;
          gap:12px;
          padding:18px;
          border-radius:24px;
          background:rgba(255,255,255,.06);
          border:1px solid rgba(255,255,255,.1);
          text-align:center;
        }
        .theme-light .smart-voice-card {
          background:rgba(255,255,255,.82);
          border-color:rgba(147,161,183,.18);
        }
        .smart-voice-chip {
          width:fit-content;
          max-width:100%;
          margin:0 auto;
          display:inline-flex;
          align-items:center;
          gap:8px;
          padding:8px 14px;
          border-radius:999px;
          background:color-mix(in srgb, var(--ma-accent) 14%, rgba(255,255,255,.08));
          color:var(--ma-accent);
          font-size:12px;
          font-weight:900;
        }
        .smart-voice-chip .ui-ic { width:16px; height:16px; }
        .smart-voice-name {
          font-size:24px;
          font-weight:950;
          line-height:1.15;
        }
        .smart-voice-sub {
          color:var(--muted);
          font-size:14px;
          line-height:1.5;
        }
        .smart-voice-countdown {
          width:72px;
          height:72px;
          margin:6px auto 0;
          border-radius:50%;
          display:grid;
          place-items:center;
          background:color-mix(in srgb, var(--ma-accent) 16%, rgba(255,255,255,.08));
          border:1px solid color-mix(in srgb, var(--ma-accent) 28%, rgba(255,255,255,.12));
          color:var(--ma-accent);
          font-size:28px;
          font-weight:950;
          box-shadow:0 18px 34px rgba(0,0,0,.14);
        }
        .smart-voice-actions {
          grid-template-columns:repeat(3, minmax(0, 1fr));
        }
        .menu-sheet {
          width:min(100%, 720px);
          max-height:calc(100% - 8px);
          margin-top:auto;
          position:relative;
          display:grid;
          grid-template-rows:auto minmax(0,1fr);
          overflow:hidden;
          border-radius:30px;
          box-shadow:0 24px 60px rgba(0,0,0,.34);
        }
        .action-grid {
          display:grid;
          grid-template-columns:minmax(0,1fr);
          gap:12px;
          align-content:start;
          width:100%;
        }
        .menu-sheet.sheet-actions {
          height:calc(100% - 8px);
          max-height:calc(100% - 8px);
          margin-top:0;
        }
        .menu-body.sheet-actions {
          padding:16px 14px 20px;
        }
        .menu-body.sheet-actions .menu-item {
          min-height:112px;
        }
        .menu-backdrop.search-open .menu-sheet {
          height:calc(100% - 8px);
          max-height:calc(100% - 8px);
          margin-top:0;
        }
        .card.layout-tablet .menu-sheet {
          width:min(calc(100% - 72px), 920px);
          max-width:min(calc(100% - 72px), 920px);
          max-height:calc(100% - 18px);
          height:calc(100% - 18px);
          margin-inline:auto;
          border-radius:28px;
          box-shadow:0 30px 70px rgba(0,0,0,.3);
        }
        .card.layout-tablet .menu-sheet.sheet-library,
        .card.layout-tablet .menu-sheet.sheet-search {
          width:min(calc(100% - 72px), 1120px);
          max-width:min(calc(100% - 72px), 1120px);
        }
        .card.layout-tablet .menu-sheet.sheet-actions,
        .card.layout-tablet .menu-sheet.sheet-transfer,
        .card.layout-tablet .menu-sheet.sheet-announcements,
        .card.layout-tablet .menu-sheet.sheet-settings {
          width:min(calc(100% - 120px), 760px);
          max-width:min(calc(100% - 120px), 760px);
        }
        .card.layout-tablet .menu-sheet.sheet-players,
        .card.layout-tablet .menu-sheet.sheet-group {
          width:min(calc(100% - 100px), 900px);
          max-width:min(calc(100% - 100px), 900px);
        }
        .card.layout-tablet .menu-sheet.sheet-queue {
          width:min(calc(100% - 120px), 840px);
          max-width:min(calc(100% - 120px), 840px);
        }
        .card.layout-tablet .menu-sheet.confirm-sheet,
        .card.layout-tablet .menu-sheet.smart-voice-sheet {
          width:min(620px, calc(100% - 80px));
          max-width:min(620px, calc(100% - 80px));
          height:auto;
          max-height:min(760px, calc(100% - 48px));
          align-self:center;
          margin-inline:auto;
        }
        .menu-head { position:relative; display:grid; grid-template-columns:52px minmax(0,1fr) 52px; gap:10px; align-items:center; padding:18px 16px 14px; border-bottom:1px solid rgba(255,255,255,.08); }
        .card.layout-tablet .menu-head {
          grid-template-columns:48px minmax(0,1fr) 48px;
          gap:12px;
          padding:12px 14px 10px;
        }
        .menu-head button { width:44px; height:44px; border-radius:16px; font-size:22px; }
        .card.layout-tablet .menu-head button {
          width:42px;
          height:42px;
          border-radius:14px;
        }
        .card.layout-tablet .menu-backdrop {
          justify-content:center;
          align-items:stretch;
          padding:14px 18px;
        }
        .card.layout-tablet .players-premium-grid {
          direction:ltr;
          grid-template-columns:repeat(2,minmax(0,1fr));
          gap:16px;
        }
        .card.layout-tablet.rtl .players-premium-grid {
          direction:rtl;
        }
        .card.layout-tablet .player-menu-card {
          min-height:144px;
          padding:18px;
          gap:14px;
          border-radius:24px;
          background:rgba(255,255,255,.10);
          border:1px solid rgba(255,255,255,.16);
          backdrop-filter:blur(24px);
          -webkit-backdrop-filter:blur(24px);
          box-shadow:0 24px 48px rgba(0,0,0,.16), inset 0 1px 0 rgba(255,255,255,.12);
          text-align:start;
        }
        .card.layout-tablet.rtl .player-menu-card {
          direction:rtl;
          text-align:right;
        }
        .card.layout-tablet .player-premium-head {
          display:grid;
          grid-template-columns:58px minmax(0,1fr);
          gap:14px;
          align-items:center;
        }
        .card.layout-tablet.rtl .player-premium-head {
          grid-template-columns:minmax(0,1fr) 58px;
        }
        .card.layout-tablet .player-premium-art {
          width:58px;
          height:58px;
          border-radius:18px;
          overflow:hidden;
          background:rgba(255,255,255,.08);
        }
        .card.layout-tablet .player-premium-text {
          min-width:0;
        }
        .card.layout-tablet .player-premium-sub {
          margin-top:4px;
          opacity:.8;
        }
        .card.layout-tablet .player-volume-row {
          display:grid;
          grid-template-columns:44px minmax(0,1fr);
          gap:12px;
          align-items:center;
          padding-top:4px;
        }
        .card.layout-tablet.rtl .player-volume-row {
          grid-template-columns:minmax(0,1fr) 44px;
        }
        .card.layout-tablet .queue-list {
          width:min(100%, 780px);
          margin-inline:auto;
        }
        .card.layout-tablet .queue-row {
          min-height:78px;
          padding-inline:16px;
        }
        .card.layout-tablet #activePlayersBubble {
          display:none !important;
        }
        .card.layout-tablet .player-focus {
          min-height:122px;
          padding:16px 14px;
          border-radius:28px;
          display:grid;
          gap:10px;
          justify-items:center;
          background:rgba(255,255,255,.12);
          border:1px solid rgba(255,255,255,.18);
          backdrop-filter:blur(28px);
          -webkit-backdrop-filter:blur(28px);
          box-shadow:0 22px 40px rgba(0,0,0,.12), inset 0 1px 0 rgba(255,255,255,.12);
        }
        .card.empty-media .mobile-art-shell {
          width:min(174px, 38vw);
          padding:0;
          border-radius:999px;
          background:transparent;
          border:none;
          box-shadow:none;
          backdrop-filter:none;
          -webkit-backdrop-filter:none;
        }
        .card.empty-media .art-stack-view,
        .card.empty-media .art-stack-viewport,
        .card.empty-media .art-stack-container {
          min-height:170px;
        }
        .card.empty-media .center {
          gap:18px;
        }
        .card.empty-media .art-stage {
          min-height:0;
          display:grid;
          place-items:center;
        }
        .card.empty-media .hero-copy {
          margin-top:12px;
          gap:12px;
        }
        .card.empty-media .mobile-art-actions,
        .card.empty-media #mobileArtActions {
          display:none !important;
        }
        .card.empty-media .hero-title {
          max-width:min(900px, 100%);
          margin-inline:auto;
          font-size:clamp(28px, 4vw, 56px);
          line-height:1.06;
          letter-spacing:-.04em;
        }
        .card.empty-media .hero-sub {
          max-width:min(620px, 100%);
          margin-inline:auto;
          font-size:clamp(13px, 1.45vw, 17px);
          line-height:1.5;
          color:rgba(236,241,248,.76);
        }
        .card.empty-media .bottom {
          gap:22px;
        }
        .card.empty-media .progress-line {
          display:none;
        }
        .card.radio-media .empty-quick-shelf {
          display:none !important;
        }
        .card.radio-media .mobile-art-shell {
          width:min(840px, 100%);
          padding:14px 14px 10px;
          border-radius:42px;
        }
        .card.radio-media .art-stack-view {
          min-height:clamp(246px, 26vw, 356px);
          display:grid;
          place-items:center;
        }
        .radio-stage {
          position:relative;
          width:min(100%, 760px);
          min-height:clamp(230px, 24vw, 330px);
          display:grid;
          place-items:center;
        }
        .radio-stage-card {
          position:absolute;
          inset-block-start:50%;
          transform:translateY(-50%);
          border-radius:36px;
          background:rgba(255,255,255,.28);
          border:1px solid rgba(255,255,255,.22);
          backdrop-filter:blur(18px);
          -webkit-backdrop-filter:blur(18px);
          box-shadow:0 18px 34px rgba(0,0,0,.10);
        }
        .radio-stage-card-main {
          width:min(360px, 44vw);
          aspect-ratio:1/1;
          z-index:2;
        }
        .radio-stage-card-side {
          width:min(248px, 28vw);
          aspect-ratio:1/1;
          inset-inline-start:12%;
          opacity:.42;
          filter:saturate(.82);
        }
        .radio-stage-card-side-end {
          inset-inline-start:auto;
          inset-inline-end:12%;
        }
        .radio-stage-fab {
          position:relative;
          z-index:3;
          width:152px;
          height:152px;
          border:none;
          border-radius:999px;
          display:grid;
          place-items:center;
          color:#fff8df;
          background:linear-gradient(180deg, rgba(66,63,55,.72), rgba(114,106,84,.52));
          box-shadow:0 26px 46px rgba(0,0,0,.18), 0 0 30px color-mix(in srgb, var(--ma-accent) 18%, transparent);
          cursor:pointer;
        }
        .radio-stage-fab .ui-ic {
          width:42px;
          height:42px;
        }
        .theme-light .radio-stage-card {
          background:rgba(255,255,255,.34);
          border-color:rgba(141,155,177,.18);
          box-shadow:0 18px 34px rgba(111,126,150,.12);
        }
        .theme-light .radio-stage-fab {
          color:#fffaf0;
          background:linear-gradient(180deg, rgba(112,106,85,.68), rgba(157,145,106,.48));
          box-shadow:0 22px 38px rgba(111,126,150,.14), 0 0 26px color-mix(in srgb, var(--ma-accent) 16%, transparent);
        }
        .card.layout-tablet .player-focus-name {
          font-size:13px;
          font-weight:900;
          text-align:center;
          line-height:1.3;
        }
        .card.layout-tablet .player-focus-art-wrap {
          width:60px;
          height:60px;
          display:grid;
          place-items:center;
        }
        .card.layout-tablet .player-focus-art {
          width:60px;
          height:60px;
          border-radius:20px;
          overflow:hidden;
          background-size:cover;
          background-position:center;
          box-shadow:0 12px 28px rgba(0,0,0,.18);
        }
        .card.layout-tablet .player-focus.playing .player-focus-art {
          animation:playerFocusPulse 3s ease-in-out infinite;
        }
        @keyframes playerFocusPulse {
          0%,100% { transform:scale(1); box-shadow:0 12px 28px rgba(0,0,0,.18); }
          50% { transform:scale(1.04); box-shadow:0 18px 32px rgba(245,166,35,.22); }
        }
        .card:not(.layout-tablet) .side-btn,
        .card:not(.layout-tablet) .side-btn.minor-btn,
        .card:not(.layout-tablet) .volume-btn {
          border-radius:999px;
        }
        .card:not(.layout-tablet) .mobile-volume-inline {
          grid-template-columns:auto minmax(0,1fr) auto;
          gap:10px;
          align-items:center;
        }
        .card:not(.layout-tablet) .mobile-volume-inline .volume-value {
          order:3;
          min-width:46px;
          text-align:center;
        }
        .card:not(.layout-tablet) .mobile-volume-inline .tablet-volume-track {
          order:2;
        }
        .card:not(.layout-tablet) .mobile-volume-inline .volume-btn {
          order:1;
          width:42px;
          height:42px;
          border-radius:999px;
        }
        .card:not(.layout-tablet) .mobile-volume-inline .volume-btn.active {
          background:rgba(255,69,58,.24);
          border-color:rgba(255,69,58,.34);
          box-shadow:0 12px 22px rgba(255,69,58,.12), inset 0 1px 0 rgba(255,255,255,.16);
          color:#ff6c63;
        }
        .mobile-art-actions {
          inset-inline:auto 18px;
          inset-block-end:18px;
          display:flex;
          gap:10px;
          padding:0;
          background:transparent;
          border:none;
          box-shadow:none;
          backdrop-filter:none;
          -webkit-backdrop-filter:none;
        }
        .card.layout-tablet .mobile-art-actions {
          inset-inline:auto 20px;
          inset-block-end:18px;
        }
        .mobile-art-fab {
          width:46px;
          min-width:46px;
          height:46px;
          border-radius:999px;
          background:rgba(14,18,28,.34);
          border:1px solid rgba(255,255,255,.16);
          box-shadow:0 12px 24px rgba(0,0,0,.14), inset 0 1px 0 rgba(255,255,255,.08);
        }
        .card.layout-tablet .mobile-art-fab {
          width:44px;
          min-width:44px;
          height:44px;
        }
        .art-stack-fallback {
          background:radial-gradient(circle at 50% 35%, color-mix(in srgb, var(--ma-accent) 26%, rgba(255,255,255,.08)), transparent 55%);
        }
        .art-stack-fallback .fallback-disc {
          box-shadow:0 0 0 1px rgba(255,255,255,.08), 0 22px 48px color-mix(in srgb, var(--ma-accent) 18%, transparent);
        }
        .surprise-me-card {
          position:relative;
          width:100%;
          height:100%;
          border:none;
          border-radius:28px;
          overflow:hidden;
          display:grid;
          place-items:center;
          background:linear-gradient(180deg, rgba(255,255,255,.10), rgba(255,255,255,.04));
          color:#fff;
          font:inherit;
          cursor:pointer;
          box-shadow:0 26px 54px rgba(0,0,0,.18), inset 0 1px 0 rgba(255,255,255,.14);
        }
        .surprise-me-card.compact {
          border-radius:16px;
          box-shadow:0 12px 24px rgba(0,0,0,.12), inset 0 1px 0 rgba(255,255,255,.08);
        }
        .surprise-me-card.magic-empty {
          width:168px;
          height:168px;
          border-radius:999px;
          background:
            radial-gradient(circle at 50% 20%, rgba(255,255,255,.18), transparent 26%),
            radial-gradient(circle at 18% 18%, color-mix(in srgb, var(--ma-accent) 48%, transparent), transparent 34%),
            linear-gradient(180deg, rgba(255,255,255,.12), rgba(255,255,255,.04));
          border:1px solid rgba(255,255,255,.12);
          box-shadow:0 26px 46px rgba(0,0,0,.18), inset 0 1px 0 rgba(255,255,255,.14);
          transition:transform .16s ease, box-shadow .18s ease, border-color .18s ease;
          animation:magic-empty-pulse 2.9s ease-in-out infinite;
        }
        .surprise-me-glow {
          position:absolute;
          inset:0;
          background:
            radial-gradient(circle at 18% 18%, color-mix(in srgb, var(--ma-accent) 34%, transparent), transparent 32%),
            radial-gradient(circle at 82% 20%, rgba(255,255,255,.12), transparent 26%),
            radial-gradient(circle at 50% 72%, color-mix(in srgb, var(--ma-accent) 20%, transparent), transparent 34%);
          opacity:.95;
        }
        .surprise-me-label {
          position:relative;
          z-index:1;
          padding:14px 22px;
          border-radius:999px;
          background:rgba(255,255,255,.14);
          border:1px solid rgba(255,255,255,.18);
          backdrop-filter:blur(18px);
          -webkit-backdrop-filter:blur(18px);
          font-size:clamp(18px,2.1vw,26px);
          font-weight:900;
        }
        .surprise-me-card.compact .surprise-me-label {
          padding:8px 12px;
          font-size:clamp(12px, 1.4vw, 16px);
        }
        .surprise-me-wand {
          position:relative;
          z-index:1;
          width:100%;
          height:100%;
          display:grid;
          place-items:center;
          border-radius:inherit;
          background:transparent;
          border:none;
          box-shadow:none;
          color:#fff6d8;
        }
        .surprise-me-wand .ui-ic {
          width:56px;
          height:56px;
          filter:drop-shadow(0 0 14px color-mix(in srgb, var(--ma-accent) 52%, transparent));
        }
        .surprise-me-card.magic-empty:active,
        .surprise-me-card.magic-empty.pressed {
          transform:scale(.96);
          box-shadow:0 16px 30px rgba(0,0,0,.18), 0 0 0 1px color-mix(in srgb, var(--ma-accent) 34%, transparent), 0 0 26px color-mix(in srgb, var(--ma-accent) 22%, transparent);
        }
        @keyframes magic-empty-pulse {
          0%,100% { transform:scale(1); box-shadow:0 26px 46px rgba(0,0,0,.18), inset 0 1px 0 rgba(255,255,255,.14); }
          50% { transform:scale(1.035); box-shadow:0 30px 54px rgba(0,0,0,.18), 0 0 30px color-mix(in srgb, var(--ma-accent) 18%, transparent), inset 0 1px 0 rgba(255,255,255,.16); }
        }
        .top-settings-fab {
          position:absolute;
          inset-block-start:18px;
          z-index:6;
          width:38px;
          height:38px;
          border-radius:14px;
          border:1px solid rgba(255,255,255,.12);
          background:rgba(14,18,28,.54);
          color:#fff;
          display:grid;
          place-items:center;
          box-shadow:0 12px 24px rgba(0,0,0,.18);
          backdrop-filter:blur(14px);
          -webkit-backdrop-filter:blur(14px);
        }
        .top-settings-fab.ltr { inset-inline-end:18px; }
        .top-settings-fab.rtl { inset-inline-start:18px; }
        .home-shortcut-fab {
          position:absolute;
          z-index:6;
          width:52px;
          height:52px;
          border-radius:999px;
          border:1px solid rgba(255,255,255,.12);
          background:rgba(14,18,28,.58);
          color:#fff;
          display:grid;
          place-items:center;
          box-shadow:0 14px 30px rgba(0,0,0,.2);
          backdrop-filter:blur(14px);
          -webkit-backdrop-filter:blur(14px);
        }
        .home-shortcut-fab .ui-ic { width:24px; height:24px; }
        .home-shortcut-fab.mobile { inset-block-start:10px; }
        .home-shortcut-fab.tablet { inset-block-end:22px; }
        .home-shortcut-fab.ltr { inset-inline-end:18px; }
        .home-shortcut-fab.rtl { inset-inline-start:18px; }
        .history-toggle-fab {
          position:absolute;
          inset-block-start:50%;
          z-index:7;
          width:40px;
          height:78px;
          border-radius:16px;
          border:1px solid rgba(255,255,255,.12);
          background:rgba(14,18,28,.42);
          color:#fff;
          display:grid;
          place-items:center;
          box-shadow:0 14px 28px rgba(0,0,0,.16);
          backdrop-filter:blur(12px);
          -webkit-backdrop-filter:blur(12px);
          transform:translateY(-50%);
          opacity:.86;
          transition:transform .18s ease, background-color .18s ease, border-color .18s ease, box-shadow .18s ease, opacity .18s ease;
        }
        .history-toggle-fab.left-edge { inset-inline-start:14px; }
        .history-toggle-fab.right-edge { inset-inline-end:14px; }
        .history-toggle-fab .ui-ic { width:18px; height:18px; }
        .history-toggle-fab.active {
          color:var(--ma-accent);
          background:rgba(245,166,35,.12);
          border-color:rgba(245,166,35,.24);
          box-shadow:0 16px 30px rgba(0,0,0,.18), 0 0 0 1px rgba(245,166,35,.1);
          opacity:.96;
        }
        .history-toggle-fab:active {
          transform:translateY(-50%) scale(.97);
        }
        .history-drawer {
          position:absolute;
          inset-block:18px 18px;
          z-index:6;
          width:min(320px, calc(100% - 72px));
          display:grid;
          grid-template-rows:auto minmax(0,1fr);
          border-radius:26px;
          border:1px solid rgba(255,255,255,.12);
          background:rgba(12,16,24,.74);
          box-shadow:0 22px 44px rgba(0,0,0,.26);
          backdrop-filter:blur(18px);
          -webkit-backdrop-filter:blur(18px);
          opacity:0;
          pointer-events:none;
          transition:transform .24s ease, opacity .2s ease;
        }
        .history-drawer.left-edge {
          inset-inline-start:66px;
          transform:translateX(calc(-100% - 18px));
        }
        .history-drawer.right-edge {
          inset-inline-end:66px;
          transform:translateX(calc(100% + 18px));
        }
        .history-drawer.open {
          opacity:1;
          pointer-events:auto;
          transform:translateX(0);
        }
        .history-drawer-head {
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:10px;
          min-height:58px;
          padding:16px 16px 10px;
          border-bottom:1px solid rgba(255,255,255,.08);
        }
        .history-drawer-title {
          font-size:14px;
          font-weight:900;
          letter-spacing:.08em;
          text-transform:uppercase;
          color:rgba(255,255,255,.66);
        }
        .history-drawer-body {
          overflow:auto;
          display:grid;
          align-content:start;
          gap:8px;
          padding:12px 12px 14px;
        }
        .history-empty {
          min-height:96px;
          display:grid;
          place-items:center;
          padding:12px;
          text-align:center;
          font-size:13px;
          font-weight:700;
          line-height:1.45;
          color:rgba(255,255,255,.66);
        }
        .theme-light .history-toggle-fab {
          color:#1f2633;
          background:rgba(255,255,255,.84);
          border-color:rgba(143,159,181,.18);
          box-shadow:0 16px 30px rgba(95,112,136,.16);
        }
        .theme-light .history-drawer {
          background:rgba(255,255,255,.88);
          border-color:rgba(143,159,181,.18);
          box-shadow:0 20px 40px rgba(95,112,136,.16);
        }
        .theme-light .history-drawer-head {
          border-bottom-color:rgba(143,159,181,.14);
        }
        .theme-light .history-drawer-title {
          color:#7b889b;
        }
        .theme-light .history-empty {
          color:#6f7d91;
        }
        .footer-theme-ic {
          width:22px;
          height:22px;
          display:grid;
          place-items:center;
          font-size:18px;
          line-height:1;
        }
        .menu-head button[hidden] { visibility:hidden; display:grid; }
        .menu-aux-btn {
          position:absolute;
          inset-block-start:18px;
          inset-inline-end:68px;
          z-index:2;
        }
        .menu-title {
          grid-column:2 / 3;
          justify-self:center;
          text-align:center;
          font-size:20px;
          font-weight:900;
          letter-spacing:-.02em;
          display:flex;
          align-items:center;
          justify-content:center;
          gap:10px;
          width:max-content;
          max-width:min(100%, calc(100% - 32px));
          margin-inline:auto;
        }
        .card.layout-tablet .menu-title {
          font-size:19px;
        }
        .menu-title-icon {
          width:20px;
          height:20px;
          display:inline-flex;
          align-items:center;
          justify-content:center;
          color:var(--ma-accent);
          flex-shrink:0;
        }
        .menu-title-icon .ui-ic { width:20px; height:20px; }
        .rtl .menu-title { flex-direction:row-reverse; }
        .menu-aux-btn .ui-ic { width:20px; height:20px; }
        .menu-title.clickable { cursor:pointer; }
        .menu-body { overflow:auto; padding:16px; display:grid; gap:12px; align-content:start; min-height:0; position:relative; }
        .card.layout-tablet .menu-body {
          padding:14px 16px 16px;
          gap:10px;
        }
        .menu-body.library-mode { overflow:hidden; display:grid; min-height:0; }
        .menu-body.library-mode {
          height:100%;
          max-height:100%;
          grid-template-rows:minmax(0,1fr);
        }
        .menu-body.search-mode .library-shell,
        .menu-body.search-mode .media-home-shell {
          min-height:0;
          height:100%;
        }
        .menu-body.search-mode .media-home-shell {
          grid-template-rows:auto minmax(0,1fr);
        }
        #mobileMediaSearchResults {
          min-height:0;
          overflow:auto;
        }
        .menu-body.search-mode .media-search-zone {
          position:sticky;
          top:0;
          z-index:3;
          padding-bottom:10px;
          background:linear-gradient(180deg, rgba(15,18,27,.92), rgba(15,18,27,.68), transparent);
        }
        .theme-light .menu-body.search-mode .media-search-zone {
          background:linear-gradient(180deg, rgba(239,244,250,.94), rgba(239,244,250,.72), transparent);
        }
        .theme-light .menu-backdrop {
          background:rgba(229,236,245,.58);
          backdrop-filter:blur(20px);
          -webkit-backdrop-filter:blur(20px);
        }
        .lyrics-backdrop {
          position:absolute; inset:0; z-index:70; display:none; align-items:center; justify-content:center;
          padding:max(16px, env(safe-area-inset-top)) max(16px, env(safe-area-inset-right)) max(16px, env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-left));
          background:rgba(8,10,16,.58); backdrop-filter:blur(18px); -webkit-backdrop-filter:blur(18px);
        }
        .lyrics-backdrop.open { display:flex; }
        .lyrics-sheet {
          width:min(100%, 720px); max-height:calc(100% - 8px); overflow:hidden; display:grid; grid-template-rows:auto minmax(0,1fr);
          border-radius:28px; border:1px solid rgba(255,255,255,.12); background:rgba(17,19,28,.88); box-shadow:0 24px 60px rgba(0,0,0,.34);
        }
        .theme-light .lyrics-sheet { background:rgba(255,255,255,.92); border-color:rgba(147,161,183,.2); }
        .lyrics-head { display:grid; grid-template-columns:48px minmax(0,1fr) 48px; align-items:start; gap:14px; padding:18px 16px 14px; border-bottom:1px solid rgba(255,255,255,.08); }
        .theme-light .lyrics-head { border-bottom-color:rgba(143,159,181,.16); }
        .lyrics-title-wrap { min-width:0; display:grid; gap:6px; text-align:center; grid-column:2; }
        .lyrics-title { font-size:22px; font-weight:900; line-height:1.08; }
        .lyrics-sub { font-size:13px; color:rgba(255,255,255,.72); }
        .theme-light .lyrics-sub { color:rgba(55,68,85,.68); }
        .lyrics-head .close-btn { grid-column:3; justify-self:end; }
        .lyrics-body { overflow:auto; padding:22px 18px 26px; white-space:pre-wrap; line-height:1.92; font-size:clamp(18px, 4.6vw, 24px); color:#fff; text-align:center; scroll-behavior:smooth; }
        .theme-light .lyrics-body { color:#1f2633; }
        .lyrics-state { display:grid; place-items:center; min-height:220px; text-align:center; color:rgba(255,255,255,.72); }
        .theme-light .lyrics-state { color:rgba(55,68,85,.68); }
        .lyrics-pre { margin:0; font:inherit; white-space:pre-wrap; text-align:center; }
        .lyrics-timeline {
          display:grid;
          gap:14px;
          padding:10px 4px 42vh;
        }
        .lyrics-line {
          opacity:.42;
          transform:scale(.96);
          transform-origin:center;
          color:rgba(255,255,255,.78);
          font-weight:800;
          letter-spacing:.01em;
          transition:opacity .22s ease, transform .22s ease, color .22s ease, text-shadow .22s ease;
        }
        .lyrics-line.active {
          opacity:1;
          transform:scale(1.07);
          color:#fff;
          font-weight:950;
          text-shadow:0 0 22px color-mix(in srgb, var(--ma-accent) 46%, transparent), 0 8px 28px rgba(0,0,0,.34);
        }
        .theme-light .lyrics-line { color:rgba(31,38,51,.6); }
        .theme-light .lyrics-line.active {
          color:#101722;
          text-shadow:0 10px 26px color-mix(in srgb, var(--ma-accent) 28%, transparent);
        }
        .theme-light .menu-head {
          border-bottom-color:rgba(143,159,181,.16);
        }
        .menu-item,.menu-list-item,.queue-row,.media-search-shell,.media-category-row { width:100%; min-width:0; overflow:hidden; display:flex; align-items:center; gap:12px; padding:14px; border-radius:22px; color:#fff; text-align:inherit; transition:transform .16s ease, border-color .16s ease, background-color .16s ease, box-shadow .16s ease; }
        .menu-item,.menu-list-item { border:none; cursor:pointer; }
        .menu-item:active,
        .menu-list-item:active,
        .queue-row:active,
        .footer-btn:active,
        .control-btn:active,
        .main-btn:active,
        .settings-pill:active,
        .settings-check-pill:active,
        .library-nav-btn:active,
        .media-entry-main:active,
        .action-btn:active,
        .chip-btn:active {
          transform:scale(.985);
          border-color:color-mix(in srgb, var(--ma-accent) 34%, transparent);
          background-color:color-mix(in srgb, var(--ma-accent) 16%, transparent);
        }
        .menu-item-main { display:flex; align-items:center; gap:14px; min-width:0; flex:1; }
        .action-tile {
          min-height:104px;
          padding:0;
          align-items:stretch;
          border-radius:22px;
          background:
            linear-gradient(145deg, rgba(255,255,255,.12), rgba(255,255,255,.05)),
            radial-gradient(circle at 18% 18%, color-mix(in srgb, var(--ma-accent) 18%, transparent), transparent 40%);
          border:1px solid rgba(255,255,255,.12);
          box-shadow:0 18px 32px rgba(0,0,0,.16);
          position:relative;
        }
        .action-tile .menu-item-main {
          display:grid;
          grid-template-columns:58px minmax(0,1fr);
          align-items:center;
          gap:12px;
          width:100%;
          min-height:100%;
          padding:12px 14px;
        }
        .action-tile .menu-item-ico {
          width:58px;
          height:58px;
          border-radius:18px;
          box-shadow:0 14px 24px color-mix(in srgb, var(--ma-accent) 14%, transparent);
        }
        .action-tile .menu-item-title {
          font-size:19px;
          font-weight:950;
          letter-spacing:-.02em;
        }
        .action-tile-kicker {
          display:none;
          margin-bottom:4px;
          font-size:10px;
          font-weight:900;
          letter-spacing:.08em;
          text-transform:uppercase;
          color:rgba(255,255,255,.54);
        }
        .menu-body.sheet-actions .action-tile .menu-item-sub {
          display:-webkit-box !important;
          margin-top:4px;
          color:rgba(255,255,255,.68);
          font-size:13px;
          line-height:1.3;
          -webkit-line-clamp:2;
          -webkit-box-orient:vertical;
          overflow:hidden;
        }
        .action-tile-arrow {
          display:none;
        }
        .action-tile.tone-stop .menu-item-ico {
          background:linear-gradient(135deg, rgba(255,132,132,.24), rgba(255,180,120,.12));
          border-color:rgba(255,132,132,.26);
          color:#ff9d85;
        }
        .action-tile.tone-announcement .menu-item-ico {
          background:linear-gradient(135deg, rgba(126,214,255,.24), rgba(94,165,255,.12));
          border-color:rgba(126,214,255,.24);
          color:#8edaff;
        }
        .action-tile.tone-players .menu-item-ico,
        .action-tile.tone-group .menu-item-ico {
          background:linear-gradient(135deg, rgba(255,217,135,.28), rgba(245,166,35,.12));
        }
        .theme-light .action-tile {
          background:
            linear-gradient(145deg, rgba(255,255,255,.92), rgba(246,249,252,.84)),
            radial-gradient(circle at 18% 18%, color-mix(in srgb, var(--ma-accent) 16%, transparent), transparent 42%);
          border-color:rgba(147,161,183,.18);
          box-shadow:0 18px 32px rgba(110,127,153,.14);
        }
        .theme-light .action-tile-kicker {
          color:#8b97a8;
        }
        .menu-body.sheet-actions .theme-light .action-tile .menu-item-sub,
        .theme-light .menu-body.sheet-actions .action-tile .menu-item-sub {
          color:#5a6679;
        }
        .theme-light .action-tile-arrow {
          color:#8a96a8;
        }
        .menu-item-ico,.menu-thumb,.media-category-ico {
          width:48px;
          height:48px;
          border-radius:16px;
          overflow:hidden;
          flex-shrink:0;
          display:grid;
          place-items:center;
          background:linear-gradient(135deg, color-mix(in srgb, var(--ma-accent) 24%, transparent), color-mix(in srgb, var(--ma-accent) 12%, transparent));
          border:1px solid color-mix(in srgb, var(--ma-accent) 24%, transparent);
          color:var(--ma-accent);
        }
        .menu-item-ico .ui-ic { width:46%; height:46%; }
        .menu-thumb img { width:100%; height:100%; object-fit:cover; display:block; }
        .player-thumb { position:relative; overflow:visible; }
        .player-thumb img { border-radius:inherit; }
        .player-group-badge {
          min-width:22px;
          height:22px;
          padding:0 6px;
          border-radius:999px;
          display:inline-flex;
          align-items:center;
          justify-content:center;
          background:linear-gradient(135deg, var(--ma-accent), color-mix(in srgb, var(--ma-accent) 72%, white 28%));
          color:#18120a;
          font-size:12px;
          line-height:1;
          font-weight:950;
          box-shadow:0 8px 18px color-mix(in srgb, var(--ma-accent) 24%, transparent);
          flex-shrink:0;
        }
        .player-thumb .player-group-badge {
          position:absolute;
          inset-inline-end:-7px;
          inset-block-start:-7px;
          z-index:2;
        }
        .player-focus-badge,
        .library-focus-badge {
          height:20px;
          min-width:20px;
          font-size:11px;
        }
        .menu-item-title,.queue-title { display:block; max-width:100%; font-size:16px; font-weight:800; line-height:1.25; white-space:normal; overflow:hidden; text-overflow:ellipsis; display:-webkit-box; -webkit-box-orient:vertical; -webkit-line-clamp:2; }
        .menu-item-sub,.queue-sub { display:block; max-width:100%; margin-top:4px; font-size:12px; color:rgba(255,255,255,.72); line-height:1.25; white-space:normal; overflow:hidden; text-overflow:ellipsis; display:-webkit-box; -webkit-box-orient:vertical; -webkit-line-clamp:2; }
        .menu-body .menu-item-sub,
        .menu-body .queue-sub { display:none !important; }
        .menu-item.active,.menu-list-item.active {
          border-color:color-mix(in srgb, var(--ma-accent) 28%, transparent);
          background:color-mix(in srgb, var(--ma-accent) 12%, transparent);
        }
        .menu-list-item.tap-feedback,
        .queue-row.tap-feedback {
          transform:translateY(-2px) scale(.988);
          border-color:color-mix(in srgb, var(--ma-accent) 34%, transparent);
          box-shadow:0 12px 30px color-mix(in srgb, var(--ma-accent) 16%, transparent);
        }
        .theme-dark .menu-sheet,
        .theme-dark .notice,
        .theme-dark .menu-item,
        .theme-dark .menu-list-item,
        .theme-dark .queue-row,
        .theme-dark .media-search-shell,
        .theme-dark .media-category-row {
          background:linear-gradient(180deg, rgba(44,46,52,.58), rgba(24,26,31,.50));
          border-color:rgba(255,255,255,.12);
          color:#f4f6fb;
          backdrop-filter:blur(22px);
          -webkit-backdrop-filter:blur(22px);
        }
        .theme-dark .media-sort-select,
        .theme-dark .settings-select,
        .theme-dark .settings-text-input,
        .theme-dark .announcement-textarea {
          background:linear-gradient(180deg, rgba(34,36,42,.62), rgba(16,18,22,.58));
          color:#f4f6fb;
          border-color:rgba(255,255,255,.12);
          color-scheme:dark;
        }
        .theme-dark .media-sort-select option,
        .theme-dark .settings-select option {
          background:#1a1d22;
          color:#f4f6fb;
        }
        .theme-dark .menu-item-sub,
        .theme-dark .queue-sub,
        .theme-dark .settings-hint {
          color:rgba(236,241,248,.68);
        }
        .theme-dark .menu-backdrop,
        .theme-dark .queue-action-backdrop {
          background:rgba(4,5,8,.34);
          backdrop-filter:blur(24px);
          -webkit-backdrop-filter:blur(24px);
        }
        .theme-dark .queue-action-sheet,
        .theme-dark .lyrics-sheet,
        .theme-dark .player-menu-card,
        .theme-dark .group-player-card,
        .theme-dark .settings-group,
        .theme-dark .announcement-target,
        .theme-dark .surprise-popup-card,
        .theme-dark .player-focus {
          background:linear-gradient(180deg, rgba(46,48,54,.62), rgba(24,26,31,.52));
          border-color:rgba(255,255,255,.12);
          box-shadow:0 22px 48px rgba(0,0,0,.22), inset 0 1px 0 rgba(255,255,255,.08);
          backdrop-filter:blur(22px);
          -webkit-backdrop-filter:blur(22px);
        }
        .theme-dark .announcement-target-select,
        .theme-dark #mobileAnnouncementTargetSelect {
          background:linear-gradient(180deg, rgba(36,38,44,.68), rgba(18,20,24,.58));
          border-color:rgba(255,255,255,.12);
          color:#f4f6fb;
        }
        .theme-dark #mobileAnnouncementTargetSelect option {
          background:#1a1d22;
          color:#f4f6fb;
        }
        .theme-dark .settings-pill,
        .theme-dark .settings-check-pill,
        .theme-dark .empty-quick-card {
          background:linear-gradient(180deg, rgba(50,52,58,.54), rgba(24,26,31,.44));
          border-color:rgba(255,255,255,.12);
          box-shadow:0 16px 34px rgba(0,0,0,.18);
        }
        .theme-dark .empty-quick-kicker {
          color:rgba(236,241,248,.56);
        }
        .theme-light .empty-quick-card {
          background:linear-gradient(145deg, rgba(255,255,255,.88), rgba(242,246,251,.76));
          border-color:rgba(147,161,183,.18);
          box-shadow:0 16px 30px rgba(111,126,150,.14);
        }
        .theme-light .empty-quick-kicker {
          color:#7f8a9b;
        }
        .theme-light .empty-quick-title {
          color:#1f2633;
        }
        .theme-light .surprise-me-card.magic-empty {
          background:
            radial-gradient(circle at 50% 24%, rgba(31,38,51,.08), transparent 30%),
            radial-gradient(circle at 18% 18%, color-mix(in srgb, var(--ma-accent) 28%, rgba(31,38,51,.06)), transparent 34%),
            linear-gradient(180deg, rgba(255,255,255,.82), rgba(240,244,250,.66));
          border-color:rgba(147,161,183,.18);
          box-shadow:0 18px 36px rgba(111,126,150,.14), inset 0 1px 0 rgba(255,255,255,.46);
        }
        .theme-light .surprise-me-wand {
          color:#1f2633;
        }
        .theme-light .surprise-me-wand .ui-ic {
          filter:drop-shadow(0 0 12px rgba(31,38,51,.10));
        }
        .theme-light .surprise-me-card.magic-empty:active,
        .theme-light .surprise-me-card.magic-empty.pressed {
          box-shadow:0 14px 28px rgba(111,126,150,.12), 0 0 0 1px rgba(31,38,51,.10), 0 0 18px rgba(31,38,51,.08);
        }
        .theme-light .menu-item.active,
        .theme-light .menu-list-item.active,
        .theme-light .queue-row.active {
          background:color-mix(in srgb, var(--ma-accent) 14%, transparent);
          border-color:color-mix(in srgb, var(--ma-accent) 30%, transparent);
        }
        .media-search-shell,.media-category-row {
          border:1px solid rgba(255,255,255,.12);
          background:rgba(255,255,255,.08);
        }
        .theme-light .media-search-shell,
        .theme-light .media-category-row {
          background:rgba(255,255,255,.62);
          border-color:rgba(147,161,183,.2);
          color:#1f2633;
        }
        .media-home-shell { display:grid; gap:14px; align-content:start; }
        .library-shell {
          position:relative;
          display:grid;
          grid-template-rows:auto minmax(0,1fr) auto;
          gap:14px;
          min-height:100%;
          height:100%;
        }
        .library-player-focus {
          display:flex;
          align-items:center;
          justify-content:center;
          gap:10px;
          width:100%;
          min-height:54px;
          padding:10px 14px;
          border:none;
          border-radius:20px;
          background:rgba(255,255,255,.08);
          border:1px solid rgba(255,255,255,.12);
          color:inherit;
          font:inherit;
          font-weight:900;
          font-size:16px;
          cursor:pointer;
        }
        .theme-light .library-player-focus {
          background:rgba(255,255,255,.72);
          border-color:rgba(147,161,183,.2);
        }
        .library-player-focus .eq-icon { display:none; }
        .library-player-focus.is-playing .eq-icon { display:inline-flex; }
        .library-body {
          display:grid;
          gap:14px;
          align-content:start;
          min-height:0;
          overflow:auto;
          padding-inline-end:2px;
        }
        .card.layout-tablet .library-body {
          gap:14px;
        }
        .library-nav {
          display:grid;
          grid-template-columns:repeat(7, minmax(0, 1fr));
          gap:8px;
          padding:8px;
          border-radius:22px;
          background:rgba(255,255,255,.08);
          border:1px solid rgba(255,255,255,.12);
          backdrop-filter:blur(18px);
          -webkit-backdrop-filter:blur(18px);
          position:sticky;
          bottom:0;
          align-self:end;
          z-index:5;
        }
        .rtl .library-nav {
          direction:rtl;
        }
        .rtl .library-nav-btn {
          direction:ltr;
        }
        .card.layout-tablet .library-nav {
          gap:6px;
          padding:6px;
          border-radius:16px;
        }
        .theme-light .library-nav {
          background:rgba(255,255,255,.72);
          border-color:rgba(147,161,183,.2);
        }
        .library-nav-btn {
          min-height:56px;
          border:none;
          border-radius:18px;
          display:grid;
          place-items:center;
          background:transparent;
          color:inherit;
          cursor:pointer;
          transition:transform .16s ease, background-color .16s ease, box-shadow .16s ease, color .16s ease;
        }
        .card.layout-tablet .library-nav-btn {
          min-height:46px;
          border-radius:16px;
        }
        .library-nav-btn.tap-feedback {
          transform:translateY(-2px) scale(.96);
          box-shadow:0 12px 22px color-mix(in srgb, var(--ma-accent) 22%, transparent);
        }
        .library-nav-btn .ui-ic { width:22px; height:22px; }
        .library-nav-btn.active {
          color:#18120a;
          background:linear-gradient(135deg, var(--ma-accent), color-mix(in srgb, var(--ma-accent) 72%, white 28%));
          box-shadow:0 10px 18px color-mix(in srgb, var(--ma-accent) 18%, transparent);
        }
        .media-search-zone {
          position:sticky;
          top:-2px;
          z-index:8;
          padding:2px 0 10px;
          background:linear-gradient(180deg, rgba(12,15,22,.96), rgba(12,15,22,.78) 72%, rgba(12,15,22,0));
        }
        .theme-light .media-search-zone {
          background:linear-gradient(180deg, rgba(247,250,253,.98), rgba(247,250,253,.82) 72%, rgba(247,250,253,0));
        }
        .media-search-shell {
          display:grid;
          grid-template-columns:20px minmax(0,1fr) 38px 20px;
          padding:12px 14px;
          gap:10px;
          align-items:center;
          position:relative;
          z-index:1;
        }
        .media-search-shell input {
          border:none;
          background:transparent;
          color:#fff;
          font:inherit;
          outline:none;
          min-width:0;
          width:100%;
          text-align:start;
          direction:auto;
        }
        .theme-light .media-search-shell input { color:#1f2633; }
        .media-search-shell input::placeholder { color:rgba(255,255,255,.52); }
        .theme-light .media-search-shell input::placeholder { color:rgba(55,68,85,.52); }
        .media-search-clear {
          border:none;
          background:transparent;
          color:rgba(255,255,255,.72);
          width:34px;
          height:34px;
          border-radius:12px;
          display:grid;
          place-items:center;
          font-size:22px;
          font-weight:950;
          line-height:1;
          cursor:pointer;
          transition:transform .16s ease, background-color .16s ease, color .16s ease, box-shadow .16s ease;
        }
        .theme-light .media-search-clear:not(.visible) { color:rgba(31,38,51,.68); }
        .media-search-clear.visible {
          color:#fff;
          background:linear-gradient(135deg, rgba(225,63,63,.98), rgba(180,36,36,.92));
          box-shadow:0 12px 22px rgba(197,48,48,.22);
        }
        .media-search-clear.visible:active {
          transform:scale(.92);
        }
        .media-voice-btn {
          width:38px;
          height:38px;
          border:none;
          border-radius:14px;
          display:grid;
          place-items:center;
          color:#18120a;
          background:linear-gradient(135deg, var(--ma-accent), color-mix(in srgb, var(--ma-accent) 72%, white 28%));
          box-shadow:0 10px 20px color-mix(in srgb, var(--ma-accent) 18%, transparent);
          cursor:pointer;
          transition:transform .16s ease, box-shadow .16s ease, opacity .16s ease;
        }
        .media-voice-btn .ui-ic { width:19px; height:19px; }
        .media-voice-btn:active { transform:scale(.94); }
        .media-voice-btn.unsupported { opacity:.52; filter:saturate(.55); }
        .media-voice-btn.listening {
          animation:voicePulse 1s ease-in-out infinite;
          box-shadow:0 0 0 8px color-mix(in srgb, var(--ma-accent) 14%, transparent), 0 14px 26px color-mix(in srgb, var(--ma-accent) 22%, transparent);
        }
        .theme-light .media-search-clear:not(.visible) { color:rgba(55,68,85,.76); }
        @keyframes voicePulse {
          0%,100% { transform:scale(1); }
          50% { transform:scale(1.07); }
        }
        .media-categories {
          display:grid;
          gap:10px;
        }
        .media-home-content {
          display:grid;
          gap:14px;
          align-content:start;
        }
        .media-category-row {
          border:none;
          cursor:pointer;
          justify-content:flex-start;
        }
        .media-category-ico .ui-ic { width:46%; height:46%; }
        .media-results {
          display:grid;
          gap:18px;
        }
        .media-toolbar {
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:12px;
          margin:2px 0 8px;
        }
        .media-toolbar-left,
        .media-toolbar-right {
          display:flex;
          align-items:center;
          gap:10px;
          min-width:0;
        }
        .library-toolbar-actions {
          display:flex;
          align-items:center;
          gap:8px;
        }
        .media-sort-select {
          min-height:42px;
          min-width:112px;
          padding:0 14px;
          border-radius:16px;
          border:1px solid rgba(255,255,255,.12);
          background:rgba(255,255,255,.08);
          color:inherit;
          font:inherit;
          font-size:13px;
          font-weight:800;
          outline:none;
        }
        .theme-light .media-sort-select {
          background:rgba(255,255,255,.68);
          border-color:rgba(147,161,183,.2);
          color:#1f2633;
        }
        .media-layout-toggle {
          display:inline-flex;
          align-items:center;
          gap:6px;
          padding:6px;
          border-radius:18px;
          background:rgba(255,255,255,.08);
          border:1px solid rgba(255,255,255,.12);
          backdrop-filter:blur(16px);
          -webkit-backdrop-filter:blur(16px);
        }
        .theme-light .media-layout-toggle {
          background:rgba(255,255,255,.68);
          border-color:rgba(147,161,183,.2);
        }
        .media-layout-btn {
          min-width:40px;
          min-height:38px;
          padding:8px 10px;
          border:none;
          border-radius:14px;
          background:transparent;
          color:inherit;
          font:inherit;
          font-size:0;
          font-weight:800;
          cursor:pointer;
          display:grid;
          place-items:center;
        }
        .media-layout-btn.tap-feedback {
          transform:translateY(-2px) scale(.96);
          box-shadow:0 12px 22px color-mix(in srgb, var(--ma-accent) 22%, transparent);
        }
        .media-layout-btn .ui-ic { width:18px; height:18px; }
        .media-layout-btn.active {
          color:#18120a;
          background:linear-gradient(135deg, var(--ma-accent), color-mix(in srgb, var(--ma-accent) 72%, white 28%));
          box-shadow:0 10px 18px color-mix(in srgb, var(--ma-accent) 18%, transparent);
        }
        .media-items-list {
          display:grid;
          gap:16px;
          align-content:start;
        }
        .media-items-list.layout-grid {
          grid-template-columns:repeat(auto-fill, minmax(138px, 1fr));
        }
        .card.layout-tablet .media-items-list.layout-grid {
          grid-template-columns:repeat(auto-fill, minmax(180px, 1fr));
        }
        .media-items-list.layout-list {
          grid-template-columns:1fr;
        }
        .media-entry {
          width:100%;
          min-width:0;
          overflow:hidden;
          border:none;
          gap:10px;
        }
        .media-entry-main {
          min-width:0;
          flex:1;
          display:flex;
          align-items:center;
          gap:12px;
          border:none;
          background:none;
          color:inherit;
          padding:0;
          text-align:inherit;
          cursor:pointer;
        }
        .media-more-btn {
          flex-shrink:0;
          min-width:38px;
          min-height:38px;
          width:38px;
          border-radius:14px;
          display:grid;
          place-items:center;
          color:var(--ma-accent);
        }
        .media-more-btn .ui-ic {
          width:17px;
          height:17px;
        }
        .theme-light .media-more-btn {
          color:var(--ma-accent);
          background:color-mix(in srgb, var(--ma-accent) 14%, rgba(255,255,255,.86));
          border:1px solid color-mix(in srgb, var(--ma-accent) 30%, rgba(147,161,183,.2));
          box-shadow:0 10px 18px color-mix(in srgb, var(--ma-accent) 14%, rgba(111,126,150,.12));
        }
        .media-entry.list {
          min-height:82px;
          gap:12px;
          padding:14px 14px;
          align-items:center;
          border-radius:22px;
        }
        .media-entry.list .menu-thumb {
          width:52px;
          height:52px;
          border-radius:16px;
        }
        .media-entry .menu-thumb .ui-ic {
          width:44%;
          height:44%;
          opacity:.68;
        }
        .flag-thumb {
          font-size:26px;
          line-height:1;
        }
        .flag-emoji {
          display:block;
          filter:saturate(1.05);
        }
        .media-entry.grid {
          display:grid;
          grid-template-columns:minmax(0,1fr) auto;
          align-content:start;
          justify-items:stretch;
          gap:12px;
          padding:16px 14px 18px;
          text-align:center;
        }
        .media-entry.grid .media-entry-main {
          display:grid;
          justify-items:center;
          align-content:start;
          gap:12px;
        }
        .media-entry.grid .menu-thumb {
          width:100%;
          max-width:150px;
          height:auto;
          aspect-ratio:1/1;
          border-radius:22px;
        }
        .media-entry.grid .media-more-btn {
          align-self:start;
        }
        .media-entry.grid .menu-item-sub {
          margin-top:6px;
        }
        .media-section-title {
          font-size:12px;
          letter-spacing:.12em;
          text-transform:uppercase;
          color:rgba(255,255,255,.56);
          margin:4px 2px 0;
        }
        .radio-browser-country-head {
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:12px;
          margin:4px 0 12px;
        }
        .radio-browser-country-head .media-section-title {
          flex:1;
          margin:0;
        }
        .radio-country-entry {
          cursor:pointer;
        }
        .queue-list {
          display:grid;
          gap:16px;
          align-content:start;
        }
        .card.layout-tablet .queue-page-head {
          width:min(100%, 760px);
          margin:0 auto 14px;
        }
        .card.layout-tablet .queue-list {
          width:min(100%, 760px);
          margin:0 auto;
          gap:10px;
        }
        .queue-page-head {
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:12px;
          margin-bottom:10px;
        }
        .queue-page-head-title {
          font-size:15px;
          font-weight:900;
          letter-spacing:.02em;
        }
        .queue-page-head-actions {
          display:flex;
          align-items:center;
          gap:8px;
        }
        .queue-head-transfer-btn {
          min-width:70px;
          height:42px;
          border:none;
          border-radius:14px;
          display:inline-flex;
          align-items:center;
          justify-content:center;
          background:rgba(255,255,255,.08);
          border:1px solid rgba(255,255,255,.12);
          color:inherit;
          cursor:pointer;
          backdrop-filter:blur(16px);
          -webkit-backdrop-filter:blur(16px);
          gap:4px;
          font-size:11px;
          font-weight:900;
        }
        .queue-head-transfer-count {
          line-height:1;
          color:var(--ma-accent);
          font-size:12px;
          font-weight:900;
        }
        .theme-light .queue-head-transfer-btn {
          background:rgba(255,255,255,.78);
          border-color:rgba(147,161,183,.2);
        }
        .queue-row {
          display:grid;
          grid-template-columns:18px 46px minmax(0,1fr) auto;
          grid-template-areas:"idx thumb meta actions";
          align-items:center;
          cursor:pointer;
          min-height:58px;
          padding:7px 11px;
          row-gap:0;
          column-gap:9px;
          border-radius:18px;
        }
        .card.layout-tablet .queue-row {
          min-height:74px;
          padding:10px 14px;
          border-radius:22px;
          grid-template-columns:48px minmax(0,1fr) 56px;
          grid-template-areas:"actions meta thumb";
          column-gap:14px;
        }
        .queue-row .menu-thumb { grid-area:thumb; }
        .queue-row .menu-thumb {
          width:42px;
          height:42px;
          border-radius:14px;
        }
        .card.layout-tablet .queue-row .menu-thumb {
          width:56px;
          height:56px;
          border-radius:18px;
          justify-self:end;
        }
        .queue-index {
          grid-area:idx;
          width:20px;
          padding-top:0;
          align-self:center;
          margin-top:0;
          text-align:center;
          font-size:12px;
          color:rgba(255,255,255,.58);
          flex-shrink:0;
        }
        .card.layout-tablet .queue-index {
          display:none;
        }
        .queue-meta { grid-area:meta; min-width:0; flex:1; padding-inline-end:4px; }
        .card.layout-tablet .queue-meta { padding-inline-end:0; }
        .queue-actions { grid-area:actions; display:flex; gap:8px; flex-wrap:nowrap; direction:ltr; margin-top:0; align-items:center; }
        .card.layout-tablet .queue-actions { justify-self:start; }
        .queue-actions .chip-btn { min-width:34px; min-height:34px; width:34px; border-radius:12px; font-size:14px; font-weight:800; padding:0; }
        .card.layout-tablet .queue-actions .chip-btn { min-width:42px; min-height:42px; width:42px; border-radius:14px; }
        .queue-actions .chip-btn.warn { color:#ffcf86; }
        .queue-eq {
          display:inline-flex;
          align-items:flex-end;
          justify-content:center;
          gap:2px;
          width:16px;
          height:14px;
          margin-inline:auto;
          color:var(--ma-accent);
        }
        .queue-eq span {
          width:2px;
          border-radius:999px;
          background:currentColor;
          animation:eqPulse 1.15s ease-in-out infinite;
          transform-origin:center bottom;
        }
        .queue-eq span:nth-child(1) { height:7px; animation-delay:0s; }
        .queue-eq span:nth-child(2) { height:12px; animation-delay:.18s; }
        .queue-eq span:nth-child(3) { height:8px; animation-delay:.36s; }
        .player-menu-card {
          display:grid;
          gap:14px;
          padding:16px;
          border-radius:28px;
          background:
            linear-gradient(135deg, rgba(255,255,255,.12), rgba(255,255,255,.04)),
            radial-gradient(circle at 16% 18%, color-mix(in srgb, var(--ma-accent) 16%, transparent), transparent 34%);
          border:1px solid rgba(255,255,255,.14);
          backdrop-filter:blur(18px);
          -webkit-backdrop-filter:blur(18px);
          box-shadow:0 18px 34px rgba(0,0,0,.14);
        }
        .card.layout-tablet .player-menu-card,
        .card.layout-tablet .group-player-card {
          gap:8px;
          padding:14px 14px 12px;
          border-radius:22px;
          min-height:0;
        }
        .theme-light .player-menu-card {
          background:
            linear-gradient(135deg, rgba(255,255,255,.94), rgba(245,248,252,.82)),
            radial-gradient(circle at 18% 18%, color-mix(in srgb, var(--ma-accent) 16%, transparent), transparent 34%);
          border-color:rgba(147,161,183,.2);
          box-shadow:0 18px 34px rgba(111,126,150,.12);
        }
        .player-menu-card.active {
          background:
            linear-gradient(135deg, color-mix(in srgb, var(--ma-accent) 18%, rgba(255,255,255,.08)), rgba(255,255,255,.08)),
            radial-gradient(circle at 16% 18%, color-mix(in srgb, var(--ma-accent) 18%, transparent), transparent 34%);
          border-color:color-mix(in srgb, var(--ma-accent) 34%, rgba(255,255,255,.14));
          box-shadow:0 18px 36px color-mix(in srgb, var(--ma-accent) 20%, rgba(0,0,0,.18));
        }
        .theme-light .player-menu-card.active {
          background:linear-gradient(135deg, color-mix(in srgb, var(--ma-accent) 18%, rgba(255,255,255,.78)), rgba(255,255,255,.82));
          border-color:color-mix(in srgb, var(--ma-accent) 30%, rgba(147,161,183,.2));
        }
        .player-menu-card .menu-list-item {
          min-height:0;
          padding:0;
          background:transparent;
          border:none;
          box-shadow:none;
        }
        .player-menu-card .menu-thumb {
          width:48px;
          height:48px;
          border-radius:16px;
        }
        .player-menu-card .menu-thumb .ui-ic {
          width:46%;
          height:46%;
          opacity:.72;
        }
        .player-volume-row {
          display:grid;
          grid-template-columns:auto minmax(0,1fr) auto;
          align-items:center;
          gap:10px;
          padding:4px 4px 4px 6px;
          border-radius:18px;
          background:rgba(255,255,255,.04);
        }
        .card.layout-tablet .player-volume-row {
          padding:8px 8px 0;
          gap:12px;
          grid-template-columns:40px minmax(0,1fr) 46px;
        }
        .player-menu-card.active .player-volume-row {
          background:color-mix(in srgb, var(--ma-accent) 10%, transparent);
        }
        .player-mini-mute {
          width:36px;
          height:36px;
          border:none;
          border-radius:14px;
          display:grid;
          place-items:center;
          color:inherit;
          background:rgba(255,255,255,.08);
          border:1px solid rgba(255,255,255,.12);
          cursor:pointer;
        }
        .player-mini-mute.active {
          color:#fff7e8;
          background:linear-gradient(135deg, color-mix(in srgb, var(--ma-accent) 34%, transparent), color-mix(in srgb, var(--ma-accent) 18%, transparent));
          border-color:color-mix(in srgb, var(--ma-accent) 40%, transparent);
        }
        .player-mini-mute .ui-ic { width:18px; height:18px; }
        .player-mini-volume {
          width:100%;
          appearance:none;
          height:6px;
          border-radius:999px;
          outline:none;
          background:linear-gradient(to right,var(--ma-accent) 0%,var(--ma-accent) var(--vol-pct,50%),rgba(255,255,255,.2) var(--vol-pct,50%),rgba(255,255,255,.2) 100%);
        }
        .player-mini-volume::-webkit-slider-thumb { appearance:none; width:14px; height:14px; border-radius:50%; background:var(--ma-accent); border:none; }
        .player-mini-volume::-moz-range-thumb { width:14px; height:14px; border-radius:50%; background:var(--ma-accent); border:none; }
        .player-mini-value {
          display:block;
          min-width:42px;
          text-align:end;
          font-size:13px;
          font-weight:900;
          color:rgba(255,255,255,.78);
        }
        .theme-light .player-mini-mute {
          color:#1f2633;
          background:rgba(255,255,255,.74);
          border-color:rgba(147,161,183,.2);
        }
        .theme-light .player-mini-mute.active {
          color:#8b5e12;
          background:linear-gradient(135deg, color-mix(in srgb, var(--ma-accent) 18%, white 82%), color-mix(in srgb, var(--ma-accent) 10%, white 90%));
        }
        .theme-light .player-mini-value { color:#4b5c73; }
        .players-premium-grid {
          display:grid;
          grid-template-columns:minmax(0, 1fr);
          gap:14px;
        }
        .card.layout-tablet .players-premium-grid {
          grid-template-columns:repeat(2, minmax(0, 1fr));
          gap:16px;
          width:min(100%, 720px);
          margin:0 auto;
        }
        .card.layout-tablet.rtl .players-premium-grid {
          direction:rtl;
        }
        .card.layout-tablet .menu-body {
          padding:18px 20px 22px;
        }
        .card.layout-tablet .menu-body.sheet-actions,
        .card.layout-tablet .menu-body.sheet-players,
        .card.layout-tablet .menu-body.sheet-queue,
        .card.layout-tablet .menu-body.sheet-transfer,
        .card.layout-tablet .menu-body.sheet-group,
        .card.layout-tablet .menu-body.sheet-announcements,
        .card.layout-tablet .menu-body.sheet-settings {
          justify-items:center;
        }
        .card.layout-tablet .action-grid {
          display:grid;
          grid-template-columns:repeat(2, minmax(0,1fr));
          gap:10px;
          align-content:start;
          width:min(100%, 660px);
          margin:0 auto;
        }
        .card.layout-tablet .action-grid .menu-item {
          min-height:114px;
          border-radius:22px;
        }
        .theme-light .card.layout-tablet .action-grid .menu-item {
          box-shadow:0 16px 30px rgba(110,127,153,.12);
        }
        .card.layout-tablet .action-grid .menu-item-main {
          gap:12px;
          align-items:center;
        }
        .card.layout-tablet .action-grid .menu-item-ico {
          width:50px;
          height:50px;
          border-radius:16px;
        }
        .card.layout-tablet .action-grid .menu-item-title {
          font-size:18px;
          font-weight:900;
          letter-spacing:-.02em;
        }
        .card.layout-tablet .player-menu-card {
          min-height:152px;
          padding:16px 16px 14px;
          border-radius:26px;
          background:
            linear-gradient(180deg, rgba(255,255,255,.14), rgba(255,255,255,.06)),
            radial-gradient(circle at top, color-mix(in srgb, var(--ma-accent) 10%, transparent), transparent 55%);
          border:1px solid rgba(255,255,255,.12);
          box-shadow:0 18px 40px rgba(0,0,0,.16), inset 0 1px 0 rgba(255,255,255,.08);
          gap:12px;
        }
        .theme-light .card.layout-tablet .player-menu-card,
        .theme-light .card.layout-tablet .group-player-card {
          background:rgba(255,255,255,.5);
          border-color:rgba(147,161,183,.18);
          box-shadow:0 16px 30px rgba(110,127,153,.12);
        }
        .card.layout-tablet .player-premium-head {
          grid-template-columns:58px minmax(0,1fr);
          gap:14px;
          align-items:center;
        }
        .card.layout-tablet .player-menu-card .menu-thumb {
          width:58px;
          height:58px;
          border-radius:20px;
        }
        .card.layout-tablet .player-premium-name {
          font-size:17px;
          line-height:1.12;
          letter-spacing:-.02em;
        }
        .card.layout-tablet .player-premium-track {
          font-size:13px;
          line-height:1.35;
          color:rgba(255,255,255,.62);
        }
        .theme-light .card.layout-tablet .player-premium-track {
          color:rgba(31,38,51,.58);
        }
        .card.layout-tablet .player-premium-side {
          display:none;
        }
        .card.layout-tablet .player-mini-mute {
          width:44px;
          height:44px;
          border-radius:16px;
        }
        .card.layout-tablet .player-mini-volume {
          height:14px;
        }
        .card.layout-tablet .player-mini-value {
          display:block;
        }
        .player-premium-head {
          width:100%;
          border:none;
          background:transparent;
          padding:0;
          display:grid;
          grid-template-columns:auto minmax(0,1fr) auto;
          gap:12px;
          align-items:center;
          color:inherit;
          text-align:inherit;
          cursor:pointer;
        }
        .player-premium-art {
          position:relative;
          width:58px;
          height:58px;
          border-radius:18px;
          overflow:hidden;
          display:grid;
          place-items:center;
          background:rgba(255,255,255,.08);
          border:1px solid rgba(255,255,255,.12);
          box-shadow:0 12px 24px rgba(0,0,0,.14);
        }
        .player-premium-art img { width:100%; height:100%; object-fit:cover; display:block; }
        .player-premium-art .ui-ic { width:46%; height:46%; opacity:.68; }
        .player-premium-copy {
          min-width:0;
          display:grid;
          gap:7px;
        }
        .player-premium-kicker {
          font-size:11px;
          font-weight:900;
          letter-spacing:.04em;
          text-transform:uppercase;
          color:rgba(255,255,255,.54);
        }
        .card.layout-tablet .player-premium-art {
          width:52px;
          height:52px;
          border-radius:16px;
        }
        .player-premium-name {
          font-size:18px;
          font-weight:950;
          line-height:1.15;
          color:inherit;
        }
        .card.layout-tablet .player-premium-name {
          font-size:17px;
        }
        .player-premium-meta {
          display:flex;
          align-items:center;
          gap:8px;
          flex-wrap:wrap;
          color:var(--muted);
          font-size:12px;
          font-weight:800;
        }
        .player-premium-track {
          min-width:0;
          overflow:hidden;
          text-overflow:ellipsis;
          white-space:nowrap;
        }
        .card.layout-tablet .player-premium-track {
          font-size:12px;
        }
        .player-premium-state {
          display:inline-flex;
          align-items:center;
          gap:6px;
          padding:5px 10px;
          border-radius:999px;
          background:color-mix(in srgb, var(--ma-accent) 12%, rgba(255,255,255,.08));
          color:var(--ma-accent);
          border:1px solid color-mix(in srgb, var(--ma-accent) 22%, rgba(255,255,255,.12));
        }
        .player-premium-state .eq-icon { margin:0; width:14px; height:12px; }
        .player-premium-side {
          display:grid;
          gap:8px;
          justify-items:end;
        }
        .player-favorite-btn {
          width:36px;
          min-width:36px;
          min-height:36px;
          padding:0;
          border-radius:14px;
          display:grid;
          place-items:center;
        }
        .player-favorite-btn .ui-ic { width:18px; height:18px; }
        .player-premium-active {
          min-width:32px;
          height:28px;
          padding:0 10px;
          border-radius:999px;
          display:grid;
          place-items:center;
          font-size:12px;
          font-weight:950;
          color:var(--ma-accent);
          background:color-mix(in srgb, var(--ma-accent) 12%, rgba(255,255,255,.08));
          border:1px solid color-mix(in srgb, var(--ma-accent) 22%, rgba(255,255,255,.12));
        }
        .player-menu-card.active .player-premium-name {
          color:color-mix(in srgb, var(--ma-accent) 42%, currentColor);
        }
        .theme-light .player-premium-art {
          background:rgba(255,255,255,.88);
          border-color:rgba(147,161,183,.2);
        }
        .theme-light .player-premium-state,
        .theme-light .player-premium-active {
          background:color-mix(in srgb, var(--ma-accent) 12%, rgba(255,255,255,.86));
          border-color:color-mix(in srgb, var(--ma-accent) 18%, rgba(147,161,183,.18));
        }
        .theme-light .player-premium-kicker {
          color:rgba(55,68,85,.52);
        }
        .liked-toolbar {
          display:flex;
          flex-wrap:wrap;
          gap:10px;
          margin-bottom:12px;
        }
        .liked-select-box {
          width:22px;
          min-width:22px;
          height:22px;
          display:grid;
          place-items:center;
          flex-shrink:0;
          cursor:pointer;
          user-select:none;
        }
        .liked-select-box input {
          position:absolute;
          opacity:0;
          pointer-events:none;
          width:1px;
          height:1px;
        }
        .liked-select-box span {
          width:18px;
          height:18px;
          border-radius:5px;
          border:2px solid rgba(255,255,255,.32);
          background:rgba(255,255,255,.06);
          display:grid;
          place-items:center;
          transition:transform .16s ease, border-color .16s ease, background .16s ease, box-shadow .16s ease;
        }
        .liked-select-box.checked span {
          background:color-mix(in srgb, var(--ma-accent) 18%, rgba(255,255,255,.08));
          border-color:color-mix(in srgb, var(--ma-accent) 70%, rgba(255,255,255,.24));
          box-shadow:0 10px 20px color-mix(in srgb, var(--ma-accent) 24%, transparent);
          transform:scale(1.04);
        }
        .liked-select-box.checked span::before {
          content:"✓";
          color:var(--ma-accent);
          font-size:13px;
          font-weight:1000;
          line-height:1;
        }
        .theme-light .liked-select-box span {
          border-color:rgba(55,68,85,.28);
          background:rgba(255,255,255,.88);
        }
        .liked-remove-btn { min-width:40px; min-height:38px; border-radius:14px; font-size:15px; font-weight:900; color:#ffcf86; flex-shrink:0; }
        .group-connected-row {
          display:grid;
          gap:6px;
          padding:12px 14px;
          border-radius:18px;
          background:color-mix(in srgb, var(--ma-accent) 12%, rgba(255,255,255,.08));
          border:1px solid color-mix(in srgb, var(--ma-accent) 22%, rgba(255,255,255,.12));
          color:inherit;
        }
        .group-connected-row span {
          font-size:12px;
          font-weight:800;
          color:rgba(255,255,255,.66);
        }
        .group-connected-row strong {
          font-size:15px;
          line-height:1.35;
          font-weight:900;
        }
        .theme-light .group-connected-row {
          background:color-mix(in srgb, var(--ma-accent) 12%, rgba(255,255,255,.76));
          border-color:color-mix(in srgb, var(--ma-accent) 20%, rgba(147,161,183,.2));
        }
        .theme-light .group-connected-row span { color:rgba(55,68,85,.64); }
        .group-volume-card {
          display:grid;
          gap:10px;
          padding:14px;
          border-radius:20px;
          background:linear-gradient(135deg, color-mix(in srgb, var(--ma-accent) 14%, rgba(255,255,255,.08)), rgba(255,255,255,.06));
          border:1px solid color-mix(in srgb, var(--ma-accent) 24%, rgba(255,255,255,.12));
          box-shadow:0 16px 34px rgba(0,0,0,.12);
        }
        .theme-light .group-volume-card {
          background:linear-gradient(135deg, color-mix(in srgb, var(--ma-accent) 16%, rgba(255,255,255,.82)), rgba(255,255,255,.78));
          border-color:color-mix(in srgb, var(--ma-accent) 22%, rgba(147,161,183,.22));
        }
        .group-volume-title {
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:12px;
          font-size:15px;
          font-weight:950;
        }
        .group-volume-title span {
          min-width:34px;
          height:28px;
          border-radius:999px;
          display:grid;
          place-items:center;
          color:var(--ma-accent);
          background:color-mix(in srgb, var(--ma-accent) 12%, rgba(255,255,255,.1));
          border:1px solid color-mix(in srgb, var(--ma-accent) 22%, rgba(255,255,255,.12));
          font-size:13px;
          font-weight:950;
        }
        .group-player-card {
          display:grid;
          gap:10px;
          padding:12px;
          border-radius:20px;
          background:rgba(255,255,255,.08);
          border:1px solid rgba(255,255,255,.12);
        }
        .theme-light .group-player-card {
          background:rgba(255,255,255,.78);
          border-color:rgba(147,161,183,.18);
        }
        .group-player-card .group-player-row {
          padding:0;
          background:transparent;
          border:none;
          box-shadow:none;
        }
        .group-player-card .player-premium-head {
          align-items:flex-start;
        }
        .group-player-check {
          width:24px;
          height:24px;
          margin-top:16px;
          accent-color:var(--ma-accent);
          flex-shrink:0;
        }
        .group-inline-volume {
          padding:4px;
          background:rgba(255,255,255,.06);
        }
        .theme-light .group-inline-volume { background:rgba(242,246,250,.72); }
        .group-actions { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
        .card.layout-tablet .group-actions {
          gap:12px;
        }
        .action-btn { min-height:50px; border-radius:18px; font-size:14px; font-weight:800; }
        .action-btn.warn { color:#ffcf86; }
        .group-player-row .menu-item-title { font-size:18px; font-weight:900; }
        .group-player-row input[type="checkbox"] {
          width:24px;
          height:24px;
          margin:0;
          accent-color:var(--ma-accent);
          flex-shrink:0;
        }
        .settings-shell {
          display:grid;
          gap:16px;
          align-content:start;
        }
        .rtl .settings-shell,
        .rtl .settings-card {
          direction:rtl;
          text-align:right;
        }
        .rtl .settings-shell,
        .rtl .settings-group {
          direction:rtl;
          text-align:right;
        }
        .settings-group {
          display:grid;
          gap:10px;
          padding:16px;
          border-radius:18px;
          background:rgba(255,255,255,.08);
          border:1px solid rgba(255,255,255,.12);
          backdrop-filter:blur(18px);
          -webkit-backdrop-filter:blur(18px);
        }
        .theme-light .settings-group {
          background:rgba(255,255,255,.72);
          border-color:rgba(147,161,183,.2);
        }
        .settings-label {
          font-size:13px;
          font-weight:900;
          letter-spacing:.06em;
          text-transform:uppercase;
          color:rgba(255,255,255,.64);
        }
        .theme-light .settings-label { color:rgba(55,68,85,.64); }
        .settings-pills,.settings-actions { display:flex; flex-wrap:wrap; gap:10px; }
        .rtl .settings-pills,
        .rtl .settings-actions,
        .rtl .settings-range {
          direction:rtl;
          justify-content:flex-start;
        }
        .settings-pill {
          min-height:42px;
          padding:0 16px;
          border:none;
          border-radius:14px;
          background:rgba(255,255,255,.08);
          border:1px solid rgba(255,255,255,.12);
          color:inherit;
          font:inherit;
          font-weight:800;
          cursor:pointer;
        }
        .theme-light .settings-pill {
          background:rgba(255,255,255,.78);
          border-color:rgba(147,161,183,.2);
        }
        .settings-pill.active {
          color:#18120a;
          background:linear-gradient(135deg,#f7bf5c,#f5a623);
          box-shadow:0 10px 18px rgba(224,161,27,.18);
        }
        .settings-color-wrap,.settings-range { display:grid; gap:10px; }
        .night-window-grid {
          display:grid;
          grid-template-columns:repeat(2, minmax(0,1fr));
          gap:12px;
        }
        .night-time-card {
          display:grid;
          gap:10px;
          padding:14px;
          border-radius:18px;
          background:rgba(255,255,255,.06);
          border:1px solid rgba(255,255,255,.12);
          box-shadow:inset 0 1px 0 rgba(255,255,255,.04);
        }
        .theme-light .night-time-card {
          background:rgba(255,255,255,.76);
          border-color:rgba(147,161,183,.2);
          box-shadow:0 10px 24px rgba(110,127,153,.08);
        }
        .night-time-label {
          font-size:12px;
          font-weight:900;
          letter-spacing:.04em;
          color:rgba(255,255,255,.62);
        }
        .theme-light .night-time-label {
          color:rgba(55,68,85,.62);
        }
        .night-time-input {
          width:100%;
          min-width:0;
          min-height:64px;
          padding:0 18px;
          border-radius:20px;
          border:1px solid rgba(255,255,255,.14);
          background:rgba(10,14,22,.32);
          color:#f4f7ff;
          font-family:'Heebo','Rubik','Outfit','Segoe UI',system-ui,sans-serif;
          font-size:26px;
          font-weight:950;
          letter-spacing:.01em;
          outline:none;
          direction:ltr;
          text-align:left;
          box-shadow:0 12px 26px rgba(0,0,0,.12);
          color-scheme:dark;
        }
        .night-time-input:focus {
          border-color:color-mix(in srgb, var(--ma-accent) 42%, rgba(255,255,255,.18));
          box-shadow:0 0 0 4px color-mix(in srgb, var(--ma-accent) 14%, transparent), 0 14px 28px rgba(0,0,0,.14);
        }
        .theme-light .night-time-input {
          background:rgba(255,255,255,.94);
          border-color:rgba(147,161,183,.22);
          color:#1f2633;
          box-shadow:0 12px 26px rgba(111,126,150,.1);
          color-scheme:light;
        }
        .night-time-input::-webkit-calendar-picker-indicator {
          opacity:.82;
          cursor:pointer;
        }
        .theme-light .night-time-input::-webkit-calendar-picker-indicator {
          opacity:.68;
        }
        .settings-select {
          width:100%;
          max-width:none;
        }
        .settings-hint {
          color:rgba(255,255,255,.58);
          font-size:12px;
          line-height:1.45;
          margin-top:2px;
        }
        .theme-light .settings-hint {
          color:rgba(55,68,85,.62);
        }
        .card.layout-mobile .controls .minor-btn,
        .card.layout-mobile .controls .side-btn,
        .card.layout-mobile .controls .play-btn,
        .card.layout-mobile .controls .volume-btn {
          border-radius:999px !important;
        }
        .card.layout-mobile .controls .volume-btn.is-muted,
        .card.layout-mobile .player-mini-mute.is-muted {
          background:rgba(160,42,48,.22) !important;
          border-color:rgba(160,42,48,.28) !important;
          color:#fff !important;
          box-shadow:0 12px 22px rgba(110,18,28,.16), inset 0 1px 0 rgba(255,255,255,.08);
        }
        .player-focus-meta,
        .player-focus-sub,
        .active-players-bubble {
          display:none !important;
        }
        .card.layout-tablet .queue-list {
          width:min(100%, 680px);
          gap:12px;
        }
        .card.layout-tablet .queue-row {
          min-height:68px;
          padding:10px 12px;
          border-radius:20px;
        }
        .card.layout-tablet .players-premium-grid {
          gap:18px;
        }
        .settings-version {
          margin-top:10px;
          text-align:center;
          font-size:12px;
          font-weight:800;
          letter-spacing:.08em;
          color:rgba(255,255,255,.46);
        }
        .theme-light .settings-version {
          color:rgba(33,41,57,.42);
        }
        .settings-text-input,
        .announcement-textarea {
          width:100%;
          min-width:0;
          border:1px solid rgba(255,255,255,.12);
          border-radius:16px;
          background:rgba(255,255,255,.08);
          color:inherit;
          font:inherit;
          font-weight:800;
          padding:12px 14px;
          outline:none;
        }
        .settings-text-input:focus,
        .announcement-textarea:focus {
          border-color:color-mix(in srgb, var(--ma-accent) 44%, transparent);
          box-shadow:0 0 0 4px color-mix(in srgb, var(--ma-accent) 12%, transparent);
        }
        .theme-light .settings-text-input,
        .theme-light .announcement-textarea {
          background:rgba(255,255,255,.74);
          border-color:rgba(147,161,183,.22);
          color:#1f2633;
        }
        @media (max-width: 760px) {
          .night-window-grid {
            grid-template-columns:minmax(0,1fr);
          }
          .night-time-input {
            min-height:58px;
            font-size:23px;
          }
        }
        .announcements-shell {
          display:grid;
          gap:14px;
        }
        .announcement-target {
          min-height:56px;
          display:grid;
          grid-template-columns:22px minmax(0,1fr);
          align-items:center;
          gap:10px;
          padding:0 12px;
          border-radius:20px;
          border:1px solid color-mix(in srgb, var(--ma-accent) 24%, transparent);
          background:color-mix(in srgb, var(--ma-accent) 12%, transparent);
          font-size:17px;
          font-weight:950;
        }
        .announcement-target-select {
          width:100%;
          min-width:0;
          border:none;
          background:transparent;
          box-shadow:none;
          padding:0;
          font:inherit;
          color:inherit;
        }
        .theme-dark .announcement-target {
          background:rgba(20,24,32,.74);
          border-color:rgba(255,255,255,.12);
        }
        .theme-dark .announcement-target-select {
          background:rgba(15,18,28,.82);
          color:#f4f6fb;
          border-radius:14px;
          padding:10px 12px;
          border:1px solid rgba(255,255,255,.12);
          color-scheme:dark;
        }
        .theme-dark #mobileAnnouncementTargetSelect option {
          background:#171d28;
          color:#f4f6fb;
        }
        .announcement-input-wrap {
          position:relative;
          display:grid;
        }
        .announcement-textarea {
          resize:vertical;
          min-height:124px;
          line-height:1.5;
          padding-inline-end:64px;
        }
        .announcement-voice-btn {
          position:absolute;
          inset-block-start:10px;
          inset-inline-end:10px;
          width:44px;
          height:44px;
          border:none;
          border-radius:16px;
          display:grid;
          place-items:center;
          color:#18120a;
          background:linear-gradient(135deg, var(--ma-accent), color-mix(in srgb, var(--ma-accent) 72%, white 28%));
          box-shadow:0 12px 22px color-mix(in srgb, var(--ma-accent) 18%, transparent);
          cursor:pointer;
        }
        .announcement-voice-btn .ui-ic { width:20px; height:20px; }
        .announcement-presets {
          display:flex;
          flex-wrap:wrap;
          gap:10px;
        }
        .surprise-popup {
          position:absolute;
          inset-inline:0;
          inset-block-end:calc(116px + env(safe-area-inset-bottom));
          display:none;
          justify-content:center;
          pointer-events:none;
          z-index:88;
        }
        .surprise-popup.open {
          display:flex;
          animation:toastIn .22s ease;
        }
        .surprise-popup-card {
          width:min(244px, calc(100% - 28px));
          display:grid;
          gap:10px;
          justify-items:center;
          padding:14px;
          border-radius:24px;
          border:1px solid rgba(255,255,255,.14);
          background:rgba(15,18,28,.88);
          backdrop-filter:blur(22px);
          -webkit-backdrop-filter:blur(22px);
          box-shadow:0 22px 48px rgba(0,0,0,.24);
        }
        .surprise-popup-player {
          font-size:13px;
          font-weight:900;
          color:rgba(255,255,255,.78);
          text-align:center;
        }
        .surprise-popup-art {
          width:118px;
          height:118px;
          border-radius:24px;
          overflow:hidden;
          display:grid;
          place-items:center;
          background:linear-gradient(145deg, rgba(255,255,255,.12), rgba(255,255,255,.04));
          border:1px solid rgba(255,255,255,.14);
          color:var(--ma-accent);
        }
        .surprise-popup-art img { width:100%; height:100%; object-fit:cover; display:block; }
        .surprise-popup-art .ui-ic { width:34px; height:34px; }
        .surprise-popup-title {
          font-size:18px;
          font-weight:950;
          line-height:1.15;
          text-align:center;
          color:#fff;
        }
        .theme-light .surprise-popup-card {
          background:rgba(255,255,255,.92);
          border-color:rgba(147,161,183,.2);
          box-shadow:0 18px 34px rgba(110,127,153,.16);
        }
        .theme-light .surprise-popup-player { color:#5f6c80; }
        .theme-light .surprise-popup-title { color:#16202d; }
        .theme-light .surprise-popup-art {
          background:linear-gradient(145deg, rgba(255,255,255,.96), rgba(244,247,251,.88));
          border-color:rgba(147,161,183,.18);
        }
        .announcement-send-btn {
          min-height:58px;
          justify-content:center;
          gap:10px;
          font-size:17px;
        }
        .announcement-send-btn .ui-ic { width:22px; height:22px; }
        .settings-stat-row {
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:12px;
          font-size:14px;
          font-weight:800;
        }
        .settings-color-row {
          display:grid;
          grid-template-columns:54px minmax(0,1fr);
          gap:12px;
          align-items:center;
        }
        .rtl .settings-color-row {
          direction:rtl;
        }
        .settings-check-grid {
          display:grid;
          gap:10px;
          grid-template-columns:repeat(auto-fit, minmax(130px, 1fr));
        }
        .settings-check-pill {
          min-height:44px;
          display:flex;
          align-items:center;
          gap:10px;
          padding:0 14px;
          border-radius:14px;
          background:rgba(255,255,255,.08);
          border:1px solid rgba(255,255,255,.12);
          font-weight:800;
        }
        .theme-light .settings-check-pill {
          background:rgba(255,255,255,.78);
          border-color:rgba(147,161,183,.2);
        }
        .settings-check-pill input {
          width:18px;
          height:18px;
          margin:0;
          accent-color:var(--ma-accent);
        }
        .rtl .settings-check-pill {
          direction:rtl;
          justify-content:flex-start;
          text-align:right;
        }
        .rtl .settings-select {
          direction:rtl;
          text-align:right;
        }
        .settings-color-picker {
          width:54px;
          height:54px;
          padding:0;
          border:none;
          border-radius:50%;
          overflow:hidden;
          background:none;
          cursor:pointer;
        }
        .settings-range input {
          width:100%;
          accent-color:var(--ma-accent);
        }
        .settings-value {
          font-size:14px;
          font-weight:800;
        }
        .active-players-bubble {
          position:absolute;
          inset-inline-start:12px;
          inset-block-start:14px;
          z-index:4;
          display:none;
          align-items:center;
          justify-content:center;
          min-height:34px;
          width:36px;
          height:36px;
          padding:0;
          border:none;
          border-radius:999px;
          color:var(--ma-accent);
          background:rgba(14,18,28,.46);
          border:1px solid rgba(255,255,255,.12);
          backdrop-filter:blur(16px);
          -webkit-backdrop-filter:blur(16px);
          box-shadow:0 12px 28px rgba(0,0,0,.18);
          cursor:pointer;
        }
        .active-players-bubble.open { display:inline-flex; }
        .active-players-bubble .eq-icon,
        .active-players-bubble .ui-ic { display:none !important; }
        .active-players-bubble #activePlayersCount {
          font-size:14px;
          font-weight:900;
          line-height:1;
          color:inherit !important;
        }
        .theme-light .active-players-bubble {
          color:var(--ma-accent);
          background:rgba(255,255,255,.74);
          border-color:rgba(147,161,183,.2);
          box-shadow:0 12px 28px rgba(111,126,150,.16);
        }
        .theme-light .active-players-bubble #activePlayersCount {
          color:var(--ma-accent);
        }
        .toast-wrap { position:absolute; inset-inline:16px; bottom:max(16px, env(safe-area-inset-bottom)); z-index:40; display:grid; gap:8px; pointer-events:none; }
        .toast {
          min-height:48px;
          padding:12px 14px;
          border-radius:16px;
          color:#fff;
          background:rgba(17,19,28,.9);
          border:1px solid rgba(255,255,255,.12);
          backdrop-filter:blur(14px);
          -webkit-backdrop-filter:blur(14px);
          display:flex;
          align-items:center;
          gap:10px;
          box-shadow:0 16px 34px rgba(0,0,0,.22);
          animation:toastIn .18s ease-out;
        }
        .toast-icon {
          width:24px;
          height:24px;
          border-radius:999px;
          display:grid;
          place-items:center;
          font-weight:900;
          flex-shrink:0;
          background:rgba(255,255,255,.12);
        }
        .toast-text { min-width:0; line-height:1.35; font-weight:800; }
        .toast.success { border-color:rgba(102,211,138,.28); background:rgba(22,45,34,.9); }
        .toast.success .toast-icon { color:#dff8e7; background:rgba(102,211,138,.26); }
        .toast.error { border-color:rgba(255,112,112,.28); background:rgba(58,24,28,.9); }
        .toast.error .toast-icon { color:#ffe3e3; background:rgba(255,112,112,.24); }
        @keyframes toastIn {
          from { transform:translateY(8px) scale(.98); opacity:0; }
          to { transform:translateY(0) scale(1); opacity:1; }
        }
        .theme-light .toast {
          color:#1f2633;
          background:rgba(255,255,255,.88);
          border-color:rgba(141,155,177,.22);
        }
        .theme-light .toast.success { background:rgba(237,252,242,.94); border-color:rgba(75,181,111,.26); }
        .theme-light .toast.error { background:rgba(255,241,241,.94); border-color:rgba(218,82,82,.24); }
        .hidden-tools { display:none !important; }
        .rtl .player-chip,.rtl .menu-item-main,.rtl .menu-list-item,.rtl .queue-row,.rtl .media-category-row,.rtl .media-search-shell { direction:rtl; }
        .rtl .controls,.rtl .accent-row,.rtl .time-row,.rtl .queue-actions { direction:ltr; }
        .rtl .media-search-shell input {
          text-align:right;
        }
        @media (max-width:600px) {
          .card {
            border-radius:22px;
            height:min(var(--ma-card-height), 100dvh);
            max-height:100dvh;
          }
          .stage {
            gap:8px;
            grid-template-rows:auto minmax(0,1fr) auto auto;
            padding:max(12px, env(safe-area-inset-top)) max(12px, env(safe-area-inset-right)) max(10px, env(safe-area-inset-bottom)) max(12px, env(safe-area-inset-left));
          }
          .player-chip { padding:0 2px; }
          .player-focus {
            margin-top:4px;
            max-width:min(46vw, 152px);
            min-height:32px;
            padding:6px 10px;
            border-radius:16px;
            gap:8px;
          }
          .player-focus-copy { gap:4px; }
          .player-focus-tags { min-height:18px; gap:4px; }
          .player-focus-pill { min-height:18px; padding:0 7px; font-size:9px; }
          .player-focus-name { font-size:11px; max-width:100%; }
          .hero-copy { gap:4px; margin-top:8px; }
          .hero-title { font-size:18px; line-height:1.08; }
          .hero-sub { font-size:12px; margin-top:0; }
          .hero-top { padding-bottom:0; }
          .center { margin-top:0; gap:8px; }
          .art-stage { width:100%; padding:0; gap:6px; }
          .art-stack-view,
          .art-stack-viewport,
          .art-stack-container { min-height:min(44vw, 228px); }
          .art-stack-slide { width:72%; }
          .mobile-art-shell { width:min(272px, calc(100% - 36px)); border-radius:28px; padding:10px 10px 10px; }
          .np-art.mobile-art { border-radius:22px; }
          .mobile-art-actions { width:auto; margin-top:10px; padding:0; gap:8px; }
          .mobile-art-fab { width:38px; min-width:38px; height:38px; border-radius:999px; }
          .bottom { gap:10px; }
          .progress-line { gap:10px; margin-top:6px; }
          .controls { gap:8px; margin-top:2px; flex-wrap:nowrap; }
          .side-btn,.volume-btn { width:46px; height:46px; border-radius:16px; flex:0 0 auto; }
          .side-btn.minor-btn { width:38px; height:38px; border-radius:14px; flex:0 0 auto; }
          .main-btn { width:80px; height:80px; flex:0 0 auto; }
          .mobile-volume-inline { margin-top:2px; gap:8px; }
          .footer-nav { gap:8px; margin-top:6px; padding:8px; border-radius:18px; }
          .footer-btn { min-height:52px; border-radius:16px; font-size:10px; gap:4px; }
          .footer-btn .ui-ic { width:20px; height:20px; }
          .empty-quick-shelf { gap:10px; padding:8px 2px 10px; }
          .empty-quick-card { min-width:172px; max-width:172px; min-height:68px; }
          .library-nav { gap:6px; padding:6px; border-radius:18px; }
          .library-nav-btn { min-height:48px; border-radius:14px; }
          .menu-sheet { border-radius:24px; }
          .menu-sheet.sheet-actions {
            width:100%;
            height:calc(100% - 4px);
            max-height:calc(100% - 4px);
            margin-top:0;
            border-radius:24px;
          }
          .menu-backdrop {
            padding:max(36px, env(safe-area-inset-top)) max(10px, env(safe-area-inset-right)) max(12px, env(safe-area-inset-bottom)) max(10px, env(safe-area-inset-left));
          }
          .menu-body.sheet-actions {
            padding:16px 12px 20px;
          }
          .menu-body.sheet-actions .action-grid {
            gap:12px;
          }
          .menu-body { padding:14px; }
          .media-search-zone {
            padding-bottom:8px;
          }
          .queue-list {
            gap:14px;
          }
          .media-items-list {
            gap:14px;
          }
          .media-items-list.layout-grid {
            grid-template-columns:repeat(2, minmax(0, 1fr));
          }
          .media-entry.list {
            min-height:88px;
            padding:16px 14px;
          }
          .media-entry.grid {
            padding:14px 12px 16px;
          }
          .queue-row {
            grid-template-columns:18px 44px minmax(0,1fr) auto;
            min-height:58px;
            padding:8px 10px;
            row-gap:0;
            column-gap:8px;
          }
          .queue-index {
            width:18px;
          }
          .queue-row .menu-thumb {
            width:40px;
            height:40px;
            border-radius:14px;
          }
          .queue-actions .chip-btn { min-width:32px; min-height:32px; width:32px; border-radius:11px; }
          .group-actions { grid-template-columns:1fr; }
        }
      .mobile-volume-inline .volume-btn .ui-ic{width:22px;height:22px;}
.card:not(.layout-tablet) .mobile-volume-inline{grid-template-columns:auto minmax(0,1fr) auto;gap:10px;align-items:center;}
.card:not(.layout-tablet) .mobile-volume-inline .volume-value{order:1;min-width:46px;text-align:center;}
.card:not(.layout-tablet) .mobile-volume-inline .tablet-volume-track{order:2;}
.card:not(.layout-tablet) .mobile-volume-inline .volume-btn{order:3;width:42px;height:42px;border-radius:999px;}
.card:not(.layout-tablet) .mobile-volume-inline .volume-btn.active{background:rgba(170,38,38,.28)!important;border-color:rgba(255,98,98,.36)!important;color:#fff!important;box-shadow:0 10px 24px rgba(120,22,22,.22)!important;}
.card:not(.layout-tablet) .queue-action-item{min-height:58px;}
.mobile-art-actions{position:relative!important;left:auto!important;right:auto!important;transform:none!important;inset-inline:auto!important;inset-block-end:auto!important;display:flex!important;align-items:center!important;justify-content:center!important;gap:10px!important;flex-wrap:wrap!important;margin-top:10px!important;padding:0!important;border-radius:0!important;background:transparent!important;border:none!important;box-shadow:none!important;backdrop-filter:none!important;}
.card.layout-tablet .mobile-art-actions{position:relative!important;left:auto!important;right:auto!important;transform:none!important;inset-inline:auto!important;inset-block-end:auto!important;margin-top:4px!important;margin-bottom:2px!important;z-index:4!important;}
.theme-light .mobile-art-actions{background:transparent!important;border-color:transparent!important;box-shadow:none!important;}
        .mobile-art-fab{width:48px;min-width:48px;height:48px;border-radius:999px;}
        .mobile-art-fab.pressed,.mobile-art-fab:active{transform:translateY(1px) scale(.94)!important;box-shadow:0 8px 16px rgba(0,0,0,.14)!important;border-color:color-mix(in srgb, var(--ma-accent) 34%, rgba(255,255,255,.18))!important;color:var(--ma-accent)!important;}
        .mobile-art-fab.disabled,.mobile-art-fab:disabled{opacity:.34!important;pointer-events:none!important;box-shadow:none!important;filter:saturate(.5);}
        .mobile-art-fab.hidden,[hidden].mobile-art-fab{display:none!important;}
        .player-focus-nav-btn.pressed,.player-focus-nav-btn:active{transform:scale(.9);color:var(--ma-accent);}
        .mobile-art-actions.count-4{gap:12px!important;}
@media (max-width: 600px){.mobile-art-actions{gap:8px!important;padding:8px 12px!important;}.mobile-art-actions.count-4{gap:10px!important;}.mobile-art-fab{width:42px;min-width:42px;height:42px;}}
@media (max-width: 820px){
  .history-drawer{inset-block:auto 16px;width:min(320px, calc(100% - 76px));max-height:min(56vh, 420px);}
  .history-toggle-fab{inset-block-start:58%;inset-block-end:auto;width:34px;height:58px;border-radius:14px;transform:translateY(-50%);opacity:.76;}
  .history-toggle-fab .ui-ic{width:16px;height:16px;}
  .history-toggle-fab:active{transform:translateY(-50%) scale(.97);}
  .history-drawer.left-edge{inset-inline-start:14px;transform:translateX(calc(-100% - 14px));}
  .history-drawer.right-edge{inset-inline-end:14px;transform:translateX(calc(100% + 14px));}
  .history-drawer.open{transform:translateX(0);}
}
.card.layout-tablet .menu-backdrop{justify-content:center!important;align-items:stretch!important;padding:18px 24px!important;}
.card.layout-tablet .menu-sheet{width:min(calc(100% - 96px), 920px)!important;max-width:min(calc(100% - 96px), 920px)!important;max-height:calc(100% - 26px)!important;height:calc(100% - 26px)!important;margin-inline:auto!important;}
.card.layout-tablet .menu-sheet.sheet-library,.card.layout-tablet .menu-sheet.sheet-search{width:min(calc(100% - 96px), 1120px)!important;max-width:min(calc(100% - 96px), 1120px)!important;}
.card.layout-tablet .menu-sheet.sheet-queue{width:min(calc(100% - 160px), 980px)!important;max-width:min(calc(100% - 160px), 980px)!important;}
.card.layout-tablet .menu-sheet.sheet-actions,.card.layout-tablet .menu-sheet.sheet-players,.card.layout-tablet .menu-sheet.sheet-groupplayers,.card.layout-tablet .menu-sheet.sheet-settings{width:min(calc(100% - 180px), 860px)!important;max-width:min(calc(100% - 180px), 860px)!important;}
.card.layout-tablet .queue-list{max-width:920px;margin-inline:auto;}
.card.layout-tablet .queue-row{min-height:88px!important;}
.card.layout-tablet .active-player-chip .bars,.card.layout-tablet .active-player-card .bars{display:none!important;}
.card.layout-tablet.rtl,.card.layout-tablet.rtl button,.card.layout-tablet.rtl input,.card.layout-tablet.rtl textarea,.card.layout-tablet.rtl select{font-family:'Heebo','Rubik','Outfit','Segoe UI',system-ui,sans-serif!important;}
.card.layout-tablet.rtl .hero-title,.card.layout-tablet.rtl .menu-title,.card.layout-tablet.rtl .player-premium-name,.card.layout-tablet.rtl .player-premium-kicker,.card.layout-tablet.rtl .settings-label,.card.layout-tablet.rtl .menu-item-title{font-family:'Rubik','Heebo','Outfit','Segoe UI',system-ui,sans-serif!important;}
.card.layout-tablet.rtl .players-premium-grid{direction:ltr!important;}
.card.layout-tablet.rtl .player-menu-card{direction:ltr!important;text-align:start!important;}
.card.layout-tablet.rtl .player-premium-head{grid-template-columns:58px minmax(0,1fr)!important;}
.card.layout-tablet.rtl .player-premium-copy{direction:rtl;text-align:right;}
.card.layout-tablet.rtl .player-volume-row{grid-template-columns:40px minmax(0,1fr) 46px!important;}
.card.layout-tablet.rtl .player-mini-value{text-align:end!important;}
.theme-light .player-menu-card{color:#1f2633!important;}
.theme-light .player-premium-name{color:#16202d!important;}
.theme-light .player-premium-kicker{color:#6c7889!important;}
.theme-light .player-premium-track{color:#556276!important;}
.theme-light .player-premium-meta{color:#5c687b!important;}
.theme-light .player-mini-value{color:#435066!important;}
.control-room-backdrop{position:absolute;inset:0;display:flex;align-items:stretch;justify-content:center;padding:0;opacity:0;pointer-events:none;transition:opacity .26s ease;z-index:28;background:rgba(6,10,18,.12);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);}
.control-room-backdrop.open{opacity:1;pointer-events:auto;}
.control-room-shell{position:relative;width:100%;height:100%;min-height:100%;max-height:none;display:grid;grid-template-rows:auto minmax(0,1fr);border-radius:inherit;overflow:hidden;border:none;background:transparent;box-shadow:none;}
.theme-light .control-room-shell{background:transparent;}
.control-room-head{position:absolute;inset-inline:0;inset-block-start:0;display:flex;justify-content:flex-end;padding:22px 24px;z-index:4;pointer-events:none;}
.control-room-close{width:46px;height:46px;border-radius:18px;border:1px solid rgba(255,255,255,.14);background:rgba(10,13,20,.34);color:#fff;display:grid;place-items:center;backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);pointer-events:auto;}
.theme-light .control-room-close{border-color:rgba(26,39,61,.1);background:rgba(255,255,255,.62);color:#1b2740;}
.control-room-close .ui-ic{width:18px;height:18px;}
.control-room-body-host{min-height:0;height:100%;overflow:hidden;padding:0;display:flex;}
.control-room-scene{position:relative;min-height:100%;width:100%;flex:1;padding:20px 22px 20px;display:grid;overflow:hidden;}
.control-room-scene-bg,.control-room-scene-glow{position:absolute;inset:0;pointer-events:none;}
.control-room-scene-bg{background:
  radial-gradient(circle at 18% 18%, rgba(var(--dynamic-accent-rgb,245 166 35) / .24), transparent 28%),
  radial-gradient(circle at 84% 16%, rgba(var(--dynamic-glow-rgb,255 175 92) / .18), transparent 24%),
  linear-gradient(180deg, rgba(255,255,255,.05), rgba(255,255,255,.01));
  filter:blur(16px);
  transform:scale(1.08);
  animation:control-room-scene-drift 28s ease-in-out infinite alternate;}
.control-room-scene.has-art .control-room-scene-bg{background:
  radial-gradient(circle at 16% 18%, rgba(var(--dynamic-accent-rgb,245 166 35) / .32), transparent 26%),
  radial-gradient(circle at 82% 18%, rgba(var(--dynamic-glow-rgb,255 175 92) / .24), transparent 24%),
  linear-gradient(180deg, rgba(7,10,17,.08), rgba(7,10,17,.22) 34%, rgba(7,10,17,.68) 100%),
  var(--control-room-scene-art) center/cover no-repeat;
  filter:saturate(1.08) blur(18px);
  opacity:.94;
  transform:scale(1.14);
  animation:control-room-scene-drift 32s ease-in-out infinite alternate;}
.control-room-scene-glow{background:
  radial-gradient(circle at 22% 22%, rgba(var(--dynamic-accent-rgb,245 166 35) / .28), transparent 28%),
  radial-gradient(circle at 76% 62%, rgba(var(--dynamic-glow-rgb,255 175 92) / .18), transparent 30%),
  radial-gradient(circle at 52% 78%, rgba(var(--dynamic-accent-rgb,245 166 35) / .12), transparent 34%),
  linear-gradient(180deg, rgba(255,255,255,.02), rgba(255,255,255,0));
  mix-blend-mode:screen;opacity:.88;animation:control-room-glow-breathe 22s ease-in-out infinite;}
.theme-light .control-room-scene-glow{opacity:.58;}
.control-room-layout{position:relative;z-index:1;min-height:100%;display:grid;grid-template-rows:minmax(0,1fr);}
.control-room-grid-wrap{min-height:0;height:100%;padding:24px 28px 120px;display:flex;align-items:stretch;justify-content:center;}
.control-room-grid{width:100%;height:100%;display:grid;grid-template-columns:repeat(auto-fit,minmax(380px,1fr));gap:18px;align-content:space-between;justify-content:stretch;justify-items:stretch;margin-inline:auto;grid-auto-rows:max-content;}
.control-room-tile{position:relative;width:100%;aspect-ratio:16 / 9;display:grid;grid-template-rows:minmax(0,1fr) auto;gap:10px;padding:16px 16px 14px;border-radius:30px;overflow:hidden;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.05);box-shadow:0 20px 44px rgba(0,0,0,.2), inset 0 1px 0 rgba(255,255,255,.12);transition:transform .24s ease,border-color .24s ease,box-shadow .24s ease,opacity .24s ease,filter .24s ease;transform-origin:center bottom;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);}
.control-room-tile:hover{transform:translateY(-3px);}
.control-room-tile.selected{transform:translateY(-18px) scale(1.045);border-color:rgba(var(--dynamic-accent-rgb,245 166 35) / .54);box-shadow:0 34px 78px rgba(0,0,0,.4),0 0 0 1px rgba(var(--dynamic-accent-rgb,245 166 35) / .18),0 22px 48px rgba(var(--dynamic-accent-rgb,245 166 35) / .12);z-index:3;filter:saturate(1.06);}
.control-room-tile.primary{outline:1px solid rgba(255,255,255,.12);}
.control-room-grid:hover .control-room-tile:not(.selected){opacity:.88;transform:translateY(0) scale(.985);}
.theme-light .control-room-tile{border-color:rgba(27,41,66,.08);background:rgba(255,255,255,.54);box-shadow:0 16px 34px rgba(28,42,68,.12);}
.control-room-tile::before{content:"";position:absolute;inset:1px;border-radius:28px;background:linear-gradient(180deg, rgba(255,255,255,.18), rgba(255,255,255,0) 28%, rgba(255,255,255,.03) 100%);pointer-events:none;opacity:.68;z-index:0;}
.theme-light .control-room-tile::before{opacity:.5;}
.control-room-tile-bg,.control-room-tile-shade{position:absolute;inset:0;pointer-events:none;}
.control-room-tile-bg{background:
  radial-gradient(circle at 80% 18%, rgba(var(--dynamic-accent-rgb,245 166 35) / .18), transparent 26%),
  linear-gradient(180deg, rgba(255,255,255,.05), rgba(255,255,255,.02));
  transform:scale(1.02);}
.control-room-tile[style*='--control-room-tile-art'] .control-room-tile-bg{background:var(--control-room-tile-art) center/cover no-repeat;filter:saturate(1.12) contrast(1.02);transform:scale(1.06);}
.control-room-tile-shade{background:linear-gradient(180deg, rgba(10,13,20,.1) 0%, rgba(10,13,20,.08) 22%, rgba(10,13,20,.46) 62%, rgba(10,13,20,.88) 100%);}
.theme-light .control-room-tile-shade{background:linear-gradient(180deg, rgba(255,255,255,.12) 0%, rgba(255,255,255,.04) 34%, rgba(245,248,252,.86) 100%);}
.control-room-tile-main,.control-room-volume-row,.control-room-select-fab{position:relative;z-index:1;}
.control-room-tile-main{display:flex;align-items:flex-end;justify-content:flex-start;min-height:100%;background:none;border:none;color:inherit;text-align:inherit;padding:0;}
.control-room-select-fab{position:absolute;inset-block-start:14px;inset-inline-end:14px;width:40px;height:40px;padding:0;border-radius:15px;border:1px solid rgba(255,255,255,.14);background:rgba(9,12,18,.28);color:#fff;display:grid;place-items:center;backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);box-shadow:0 10px 22px rgba(0,0,0,.18);}
.control-room-select-fab.active{background:rgba(var(--dynamic-accent-rgb,245 166 35) / .24);border-color:rgba(var(--dynamic-accent-rgb,245 166 35) / .3);}
.theme-light .control-room-select-fab{background:rgba(255,255,255,.58);border-color:rgba(27,40,62,.08);color:#1f2a42;}
.control-room-select-fab .ui-ic{width:16px;height:16px;}
.control-room-tile-copy{display:grid;gap:8px;min-width:0;padding-inline:2px;}
.control-room-tile-pills{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
.control-room-float-pill,.control-room-primary-pill{display:inline-flex;align-items:center;min-height:26px;padding:0 10px;border-radius:999px;border:1px solid rgba(255,255,255,.14);background:rgba(9,12,18,.3);font-size:11px;font-weight:800;color:#fff;backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);}
.theme-light .control-room-float-pill,.theme-light .control-room-primary-pill{background:rgba(255,255,255,.56);border-color:rgba(27,40,62,.08);color:#223049;}
.control-room-primary-pill{background:rgba(var(--dynamic-accent-rgb,245 166 35) / .22);border-color:rgba(var(--dynamic-accent-rgb,245 166 35) / .24);}
.control-room-float-pill.live{background:rgba(38,183,108,.2);border-color:rgba(116,227,166,.22);}
.control-room-tile-track{font-size:13px;font-weight:700;color:rgba(255,255,255,.8);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 8px 18px rgba(0,0,0,.28);}
.control-room-tile-name{font-size:28px;font-weight:900;line-height:.98;letter-spacing:-.035em;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 10px 24px rgba(0,0,0,.34);}
.control-room-tile-state{font-size:12px;font-weight:700;color:rgba(255,255,255,.62);}
.theme-light .control-room-tile-track{color:#33445c;}
.theme-light .control-room-tile-name{color:#162238;}
.theme-light .control-room-tile-state{color:#72829a;}
.control-room-volume-row{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:10px;padding:8px 10px 2px;border-radius:18px;background:rgba(9,12,18,.22);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);}
.theme-light .control-room-volume-row{background:rgba(255,255,255,.46);}
.control-room-volume{width:100%;}
.control-room-volume-value{min-width:34px;font-size:11px;font-weight:800;color:rgba(255,255,255,.78);text-align:end;}
.theme-light .control-room-volume-value{color:#4f6077;}
.control-room-tray{position:absolute;inset-inline-start:50%;inset-block-end:112px;display:grid;gap:12px;align-self:end;width:min(1180px, calc(100% - 44px));padding:14px 16px;border-radius:30px;border:1px solid rgba(255,255,255,.12);background:rgba(9,12,18,.4);backdrop-filter:blur(26px);-webkit-backdrop-filter:blur(26px);box-shadow:0 24px 60px rgba(0,0,0,.28);z-index:4;transform:translateX(-50%);}
.control-room-tray.compact{width:min(760px, calc(100% - 44px));}
.control-room-tray.wide{width:min(1100px, 100%);}
.theme-light .control-room-tray{background:rgba(255,255,255,.62);border-color:rgba(27,41,66,.08);box-shadow:0 14px 30px rgba(28,42,68,.12);}
.control-room-tray-head{display:grid;gap:4px;padding:2px 2px 0;}
.control-room-tray-title{font-size:15px;font-weight:900;color:#fff;}
.control-room-tray-sub{font-size:12px;color:rgba(255,255,255,.62);}
.theme-light .control-room-tray-title{color:#18253a;}
.theme-light .control-room-tray-sub{color:#71829a;}
.control-room-transfer-bar{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr) auto;align-items:center;gap:12px;}
.control-room-transfer-bar select,.control-room-search{min-height:52px;border-radius:18px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.08);color:#fff;font:inherit;}
.theme-light .control-room-transfer-bar select,.theme-light .control-room-search{background:rgba(245,248,252,.94);border-color:rgba(27,40,62,.08);color:#18253a;}
.control-room-transfer-bar select{padding:0 14px;outline:none;}
.control-room-transfer-arrow{width:44px;height:44px;border-radius:16px;display:grid;place-items:center;color:rgba(255,255,255,.8);background:rgba(255,255,255,.06);}
.theme-light .control-room-transfer-arrow{color:#3d4f69;background:rgba(236,241,247,.94);}
.control-room-tray-btn{width:52px;height:52px;border-radius:18px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.08);color:#fff;display:grid;place-items:center;}
.control-room-tray-btn.primary{background:rgba(var(--dynamic-accent-rgb,245 166 35) / .22);border-color:rgba(var(--dynamic-accent-rgb,245 166 35) / .28);}
.control-room-search{display:grid;grid-template-columns:20px minmax(0,1fr) 40px;align-items:center;gap:10px;padding:0 12px 0 16px;}
.control-room-search input{width:100%;background:none;border:none;outline:none;color:inherit;font:inherit;}
.control-room-search .ui-ic{width:18px;height:18px;opacity:.72;}
.control-room-search-mic{width:36px;height:36px;padding:0;border-radius:12px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.08);color:inherit;display:grid;place-items:center;}
.theme-light .control-room-search-mic{background:rgba(234,240,247,.9);border-color:rgba(27,40,62,.08);}
.control-room-search-mic .ui-ic{opacity:.9;}
.control-room-library-results{min-height:0;max-height:300px;overflow:auto;padding-inline-end:4px;}
.control-room-picker-list{display:grid;gap:10px;max-height:320px;overflow:auto;padding-inline-end:4px;}
.control-room-picker-row{display:grid;grid-template-columns:52px minmax(0,1fr) 28px;align-items:center;gap:12px;padding:10px 12px;border-radius:20px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.06);color:inherit;text-align:inherit;}
.control-room-picker-row.active{border-color:rgba(var(--dynamic-accent-rgb,245 166 35) / .28);background:rgba(var(--dynamic-accent-rgb,245 166 35) / .14);}
.theme-light .control-room-picker-row{background:rgba(255,255,255,.82);border-color:rgba(28,42,68,.08);}
.control-room-picker-art{width:52px;height:52px;border-radius:16px;overflow:hidden;background:rgba(255,255,255,.08);display:grid;place-items:center;color:#fff;}
.theme-light .control-room-picker-art{background:rgba(234,240,247,.96);color:#30415a;}
.control-room-picker-art img{width:100%;height:100%;object-fit:cover;display:block;}
.control-room-picker-art .ui-ic{width:18px;height:18px;}
.control-room-picker-copy{display:grid;gap:2px;min-width:0;}
.control-room-picker-title,.control-room-picker-sub{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.control-room-picker-title{font-size:14px;font-weight:800;color:#fff;}
.control-room-picker-sub{font-size:12px;color:rgba(255,255,255,.58);}
.theme-light .control-room-picker-title{color:#18253a;}
.theme-light .control-room-picker-sub{color:#73849a;}
.control-room-picker-check{width:28px;height:28px;border-radius:999px;background:rgba(255,255,255,.08);display:grid;place-items:center;color:#fff;}
.theme-light .control-room-picker-check{background:rgba(234,240,247,.96);color:#2e3f58;}
.control-room-picker-check .ui-ic{width:14px;height:14px;}
.control-room-media-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(138px,1fr));gap:12px;}
.control-room-media-card{display:grid;gap:10px;padding:10px;border-radius:20px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.06);color:inherit;text-align:inherit;}
.theme-light .control-room-media-card{background:rgba(255,255,255,.78);border-color:rgba(28,42,68,.08);}
.control-room-media-art{aspect-ratio:1/1;border-radius:16px;overflow:hidden;background:rgba(255,255,255,.08);display:grid;place-items:center;color:rgba(255,255,255,.78);}
.theme-light .control-room-media-art{background:rgba(235,240,246,.96);color:#506178;}
.control-room-media-art img{width:100%;height:100%;object-fit:cover;display:block;}
.control-room-media-copy{display:grid;gap:4px;min-width:0;}
.control-room-media-title,.control-room-media-sub{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.control-room-media-title{font-size:13px;font-weight:800;color:#fff;}
.control-room-media-sub{font-size:11px;color:rgba(255,255,255,.6);}
.theme-light .control-room-media-title{color:#17253a;}
.theme-light .control-room-media-sub{color:#74839a;}
.control-room-empty{min-height:72px;display:grid;place-items:center;padding:16px;text-align:center;font-size:13px;color:rgba(255,255,255,.62);}
.control-room-empty.subtle{min-height:92px;border-radius:18px;border:1px dashed rgba(255,255,255,.12);}
.theme-light .control-room-empty{color:#6f8097;}
.theme-light .control-room-empty.subtle{border-color:rgba(27,41,66,.1);}
.control-room-dock{position:absolute;inset-inline-start:50%;inset-block-end:8px;display:flex;align-items:center;justify-content:center;gap:14px;flex-wrap:nowrap;max-width:calc(100% - 28px);margin-inline:auto;padding:14px 18px;border-radius:30px 30px 22px 22px;border:1px solid rgba(255,255,255,.14);background:rgba(9,12,18,.48);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);box-shadow:0 18px 40px rgba(0,0,0,.26);transform:translateX(-50%);}
.theme-light .control-room-dock{background:rgba(255,255,255,.68);border-color:rgba(28,42,68,.08);box-shadow:0 14px 30px rgba(28,42,68,.12);}
.control-room-now-pill{display:flex;align-items:center;gap:12px;min-width:280px;max-width:360px;padding:8px 12px 8px 8px;border-radius:999px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06);box-shadow:0 10px 24px rgba(0,0,0,.16);}
.theme-light .control-room-now-pill{background:rgba(245,248,252,.94);border-color:rgba(28,42,68,.08);}
.control-room-now-art{width:54px;height:54px;border-radius:18px;overflow:hidden;display:grid;place-items:center;flex:none;background:rgba(255,255,255,.08);color:#fff;}
.theme-light .control-room-now-art{background:rgba(229,236,244,.96);color:#2a3a52;}
.control-room-now-art img{width:100%;height:100%;object-fit:cover;display:block;}
.control-room-now-art .ui-ic{width:22px;height:22px;}
.control-room-now-copy{display:grid;gap:2px;min-width:0;}
.control-room-now-kicker{font-size:11px;font-weight:800;color:rgba(255,255,255,.56);}
.control-room-now-name{font-size:15px;font-weight:900;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.control-room-now-track{font-size:12px;color:rgba(255,255,255,.72);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.theme-light .control-room-now-kicker{color:#6e7f96;}
.theme-light .control-room-now-name{color:#18253a;}
.theme-light .control-room-now-track{color:#61738b;}
.control-room-dock-section{display:flex;align-items:center;gap:10px;}
.control-room-dock-divider{width:1px;height:34px;background:rgba(255,255,255,.12);display:block;}
.theme-light .control-room-dock-divider{background:rgba(28,42,68,.08);}
.control-room-selection-pill{display:inline-flex;align-items:center;justify-content:center;min-width:56px;height:56px;padding:0 16px;border-radius:999px;background:rgba(var(--dynamic-accent-rgb,245 166 35) / .28);border:1px solid rgba(var(--dynamic-accent-rgb,245 166 35) / .32);font-size:13px;font-weight:900;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:120px;box-shadow:0 12px 28px rgba(0,0,0,.22);}
.control-room-selection-pill.active{background:rgba(var(--dynamic-accent-rgb,245 166 35) / .38);}
.theme-light .control-room-selection-pill{color:#433006;}
.control-room-dock-btn{width:56px;height:56px;padding:0;border-radius:18px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.08);color:#fff;display:grid;place-items:center;box-shadow:0 10px 24px rgba(0,0,0,.12);}
.control-room-dock-btn.active{background:rgba(var(--dynamic-accent-rgb,245 166 35) / .26);border-color:rgba(var(--dynamic-accent-rgb,245 166 35) / .32);}
.theme-light .control-room-dock-btn{background:rgba(245,248,252,.94);border-color:rgba(28,42,68,.08);color:#1b2740;}
.control-room-dock-btn .ui-ic,.control-room-tray-btn .ui-ic{width:20px;height:20px;}
.control-room-dock-btn{position:relative;}
.control-room-badge-count{position:absolute;inset-block-start:4px;inset-inline-end:4px;min-width:18px;height:18px;padding:0 5px;border-radius:999px;background:rgba(var(--dynamic-accent-rgb,245 166 35) / .96);color:#fff;font-size:10px;font-weight:900;display:grid;place-items:center;line-height:1;}
.control-room-dock-section.player .control-room-dock-btn:first-child{width:64px;}
.control-room-dock-section.player .control-room-dock-btn:first-child .ui-ic{width:22px;height:22px;}
.control-room-scene::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg, rgba(6,9,16,.12), rgba(6,9,16,.16) 44%, rgba(6,9,16,.28) 100%);pointer-events:none;}
@keyframes control-room-scene-drift{
  from{transform:scale(1.14) translate3d(-1.2%, -1.1%, 0);}
  to{transform:scale(1.18) translate3d(1.4%, 1%, 0);}
}
@keyframes control-room-glow-breathe{
  0%,100%{opacity:.8;transform:scale(1);}
  50%{opacity:.94;transform:scale(1.04);}
}
@media (prefers-reduced-motion: reduce){
  .control-room-scene-bg,.control-room-scene-glow{animation:none!important;}
}
.footer-btn.control-room-entry{background:rgba(var(--dynamic-accent-rgb,245 166 35) / .18);border-color:rgba(var(--dynamic-accent-rgb,245 166 35) / .22);}
.theme-light .footer-btn.control-room-entry{background:rgba(var(--dynamic-accent-rgb,245 166 35) / .12);}
@media (max-width: 1280px){
  .control-room-grid-wrap{padding:24px 20px 118px;}
  .control-room-grid{grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:14px;max-width:100%;}
  .control-room-tile.selected{transform:translateY(-12px) scale(1.03);}
  .control-room-tray{inset-block-end:102px;width:min(1080px, calc(100% - 36px));}
  .control-room-tray.compact{width:min(680px, calc(100% - 36px));}
  .control-room-dock{inset-block-end:6px;padding:12px 14px;gap:10px;max-width:calc(100% - 16px);}
  .control-room-now-pill{min-width:220px;max-width:260px;}
  .control-room-dock-btn,.control-room-selection-pill{width:auto;height:50px;min-width:50px;}
  .control-room-dock-divider{display:none;}
}

</style>
      <div class="card ${rtl ? "rtl" : ""} theme-${visualTheme} layout-${layoutMode}${compactMode ? " compact-mode" : ""}${compactTileMode ? " compact-collapsed" : compactMode ? " compact-expanded" : ""}${nightActive ? " night-mode" : ""}${showNightRow ? " night-mode-enabled" : ""}">
        <div class="bg" id="mobileBg"></div><div class="shade"></div><div class="glow"></div>
        ${compactCollapseFabHtml}
        ${topSettingsFabHtml}
        ${homeShortcutFabHtml}
        ${historyToggleFabHtml}
        <div class="stage">
          ${compactTileMode ? compactTileHtml : (layoutMode === "tablet" ? tabletStageHtml : `${centerHtml}${bottomHtml}${footerHtml}`)}
        </div>
        <aside class="history-drawer ${historyEdgeClass}" id="historyDrawer" hidden>
          <div class="history-drawer-head">
            <div class="history-drawer-title">${this._esc(this._m("Recently played", "נוגן לאחרונה"))}</div>
          </div>
          <div class="history-drawer-body" id="historyDrawerBody"></div>
        </aside>
        ${controlRoomBackdropHtml}
        <div class="menu-backdrop" id="mobileMenu">
          <div class="menu-sheet">
            <div class="menu-head">
              <button id="mobileMenuBackBtn" hidden title="${this._m("Back", "חזור")}">‹</button>
              <div class="menu-title" id="mobileMenuTitle">${this._m("Menu", "תפריט")}</div>
              <button id="mobileMenuAuxBtn" class="menu-aux-btn" hidden title="${this._m("Liked", "אהבתי")}">${this._iconSvg("heart_outline")}</button>
              <button id="mobileMenuCloseBtn" title="${this._m("Close", "סגור")}">×</button>
            </div>
            <div class="menu-body" id="mobileMenuBody"></div>
          </div>
        </div>
        <div class="menu-backdrop" id="maConfirmModal">
          <div class="menu-sheet confirm-sheet">
            <div class="menu-head">
              <div></div>
              <div class="menu-title">${this._t("Open Music Assistant?")}</div>
              <button id="maConfirmCloseBtn" title="${this._m("Close", "סגור")}">×</button>
            </div>
            <div class="menu-body">
              <div class="confirm-copy">${this._t("Open the full Music Assistant interface?")}</div>
              <div class="confirm-actions">
                <button class="menu-item" id="maConfirmContinueBtn">${this._t("Continue")}</button>
                <button class="menu-item" id="maConfirmCancelBtn">${this._t("Cancel")}</button>
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
        <div class="menu-backdrop" id="mobileSmartVoiceModal">
          <div class="menu-sheet confirm-sheet smart-voice-sheet" id="mobileSmartVoiceSheet"></div>
        </div>
        <div class="hidden-tools"><select id="playerSel"></select><button id="themeToggleBtn"></button><button id="langBtn"></button><button id="maOpenBtn"></button><div id="content"></div></div>
        <div class="lyrics-backdrop" id="lyricsBackdrop"></div>
        <div class="toast-wrap" id="toastWrap"></div>
        <div class="surprise-popup" id="surprisePopup"></div>
      </div>
    `;

    this._applyDynamicThemeStyles();
    this._applyBackgroundMotionStyles();
    this._setHistoryDrawerOpen(this._state.mobileHistoryDrawerOpen);
    this._syncControlRoomUi();
    this.$("btnPlay")?.addEventListener("click", () => this._togglePlay());
    this.$("btnPrev")?.addEventListener("click", () => this._playerCmd("previous"));
    this.$("btnNext")?.addEventListener("click", () => this._playerCmd("next"));
    this.$("mobileShuffleBtn")?.addEventListener("click", () => this._toggleShuffle());
    this.$("mobileRepeatBtn")?.addEventListener("click", () => this._toggleRepeat());
    this.$("btnMute")?.addEventListener("click", () => this._toggleMute());
    this.$("controlVolumeBtn")?.addEventListener("click", () => this._openTabletVolumePopup());
    this.$("compactExpandBtn")?.addEventListener("click", () => this._setCompactExpanded(true));
    this.$("compactCollapseBtn")?.addEventListener("click", () => this._setCompactExpanded(false));
    this.$("mobileLyricsBtn")?.addEventListener("click", (e) => {
      this._pressUiButton(e.currentTarget);
      this._openLyricsModal();
    });
    this.$("mobileLikeBtn")?.addEventListener("click", (e) => {
      this._pressUiButton(e.currentTarget);
      this._toggleLikeCurrentMedia(e.currentTarget);
    });
    this.$("mobileQueueBtn")?.addEventListener("click", (e) => {
      if (!this._pressUiButton(e.currentTarget)) return;
      this._openMobileMenu("queue");
    });
    this.$("mobileRandomBtn")?.addEventListener("click", (e) => {
      if (!this._pressUiButton(e.currentTarget)) return;
      this._startQuickMix();
    });
    this.shadowRoot.querySelectorAll("[data-up-next-inline]").forEach((btn) => btn.addEventListener("click", async (e) => {
      if (!this._pressUiButton(e.currentTarget)) return;
      await this._playMobileUpNext();
    }));
    this.$("nightModeQuickBtn")?.addEventListener("click", (e) => {
      if (!this._pressUiButton(e.currentTarget)) return;
      this._cycleNightMode();
    });
    this.$("nightSleepBtn")?.addEventListener("click", (e) => {
      if (!this._pressUiButton(e.currentTarget)) return;
      this._cycleSleepTimer();
    });
    this.$("nightChillBtn")?.addEventListener("click", async (e) => {
      if (!this._pressUiButton(e.currentTarget)) return;
      await this._playNightMix();
    });
    this.$("homeShortcutFab")?.addEventListener("click", (e) => {
      if (!this._pressUiButton(e.currentTarget)) return;
      this._goHomeAssistantDashboard();
    });
    this.$("historyToggleFab")?.addEventListener("click", (e) => {
      if (!this._pressUiButton(e.currentTarget)) return;
      this._toggleHistoryDrawer();
    });
    this.$("controlRoomCloseBtn")?.addEventListener("click", (e) => {
      if (!this._pressUiButton(e.currentTarget)) return;
      this._closeControlRoom();
    });
    this.$("controlRoomBackdrop")?.addEventListener("click", async (e) => {
      if (e.target?.id === "controlRoomBackdrop") {
        this._closeControlRoom();
        return;
      }
      const selectBtn = e.target.closest("[data-room-select]");
      if (selectBtn) {
        e.preventDefault();
        e.stopPropagation();
        this._toggleControlRoomPlayerSelection(selectBtn.dataset.roomSelect);
        return;
      }
      const primaryBtn = e.target.closest("[data-room-primary]");
      if (primaryBtn) {
        e.preventDefault();
        e.stopPropagation();
        this._setControlRoomPrimary(primaryBtn.dataset.roomPrimary);
        return;
      }
      const playBtn = e.target.closest("[data-room-toggle-play]");
      if (playBtn) {
        e.preventDefault();
        e.stopPropagation();
        await this._togglePlayFor(playBtn.dataset.roomTogglePlay);
        setTimeout(() => this._updateNowPlayingState(), 250);
        return;
      }
      const nextBtn = e.target.closest("[data-room-next]");
      if (nextBtn) {
        e.preventDefault();
        e.stopPropagation();
        await this._playerCmdFor(nextBtn.dataset.roomNext, "next");
        setTimeout(() => this._updateNowPlayingState(), 250);
        return;
      }
      const muteBtn = e.target.closest("[data-room-mute]");
      if (muteBtn) {
        e.preventDefault();
        e.stopPropagation();
        await this._toggleMuteFor(muteBtn.dataset.roomMute);
        setTimeout(() => this._updateNowPlayingState(), 160);
        return;
      }
      const transferBtn = e.target.closest("[data-room-transfer]");
      if (transferBtn) {
        e.preventDefault();
        e.stopPropagation();
        const ok = await this._transferQueueBetween(this._state.controlRoomTransferSource, this._state.controlRoomTransferTarget, { silent: true });
        if (ok) this._state.controlRoomPanel = "";
        if (ok) this._toastSuccess(this._m("Queue transferred", "התור הועבר"));
        else this._toastError(this._m("Could not transfer the queue", "לא הצלחתי להעביר את התור"));
        setTimeout(() => this._updateNowPlayingState(), 300);
        return;
      }
      const libraryPlayBtn = e.target.closest("[data-room-library-play]");
      if (libraryPlayBtn) {
        e.preventDefault();
        e.stopPropagation();
        const entry = (this._state.controlRoomLibraryResults || [])[Number(libraryPlayBtn.dataset.roomLibraryPlay)];
        if (!entry?.uri) return;
        await this._playControlRoomLibraryEntry(entry);
        this._state.controlRoomPanel = "";
        setTimeout(() => this._updateNowPlayingState(), 350);
        return;
      }
      const libraryMicBtn = e.target.closest("[data-room-library-mic]");
      if (libraryMicBtn) {
        e.preventDefault();
        e.stopPropagation();
        this._startControlRoomLibraryVoice();
        return;
      }
      const selectionToggleBtn = e.target.closest("[data-room-selection-toggle]");
      if (selectionToggleBtn) {
        e.preventDefault();
        e.stopPropagation();
        this._toggleControlRoomPlayerSelection(selectionToggleBtn.dataset.roomSelectionToggle);
        return;
      }
      const visibleToggleBtn = e.target.closest("[data-room-visible-toggle]");
      if (visibleToggleBtn) {
        e.preventDefault();
        e.stopPropagation();
        this._toggleControlRoomVisiblePlayer(visibleToggleBtn.dataset.roomVisibleToggle);
        return;
      }
      const dockBtn = e.target.closest("[data-room-selection-action]");
      if (dockBtn) {
        e.preventDefault();
        e.stopPropagation();
        const action = dockBtn.dataset.roomSelectionAction;
        const selectedIds = this._controlRoomSelectedPlayerIds();
        if (action === "library" || action === "transfer" || action === "selection" || action === "visible") {
          this._toggleControlRoomPanel(action);
          return;
        }
        const primaryId = this._controlRoomPrimaryPlayerId();
        if (action === "player_playpause") {
          if (!primaryId) return;
          await this._togglePlayFor(primaryId);
          setTimeout(() => this._updateNowPlayingState(), 250);
          return;
        }
        if (action === "player_next") {
          if (!primaryId) return;
          await this._playerCmdFor(primaryId, "next");
          setTimeout(() => this._updateNowPlayingState(), 250);
          return;
        }
        if (action === "player_mute") {
          if (!primaryId) return;
          await this._toggleMuteFor(primaryId);
          setTimeout(() => this._updateNowPlayingState(), 160);
          return;
        }
        if (!selectedIds.length) return;
        if (action === "playpause") {
          await Promise.allSettled(selectedIds.map((entityId) => this._togglePlayFor(entityId)));
          setTimeout(() => this._updateNowPlayingState(), 250);
          return;
        }
        if (action === "next") {
          await Promise.allSettled(selectedIds.map((entityId) => this._playerCmdFor(entityId, "next")));
          setTimeout(() => this._updateNowPlayingState(), 250);
          return;
        }
        if (action === "group") {
          const groupPrimaryId = selectedIds[0];
          const members = selectedIds.slice(1);
          if (members.length < 1) {
            this._toastError(this._m("Select at least two players to create a group", "בחר לפחות שני נגנים כדי ליצור קבוצה"));
            return;
          }
          await this._applySpeakerGroupFor(groupPrimaryId, members);
          this._toastSuccess(this._m("Group updated", "הקבוצה עודכנה"));
          setTimeout(() => this._updateNowPlayingState(), 350);
          return;
        }
        if (action === "ungroup") {
          await Promise.allSettled(selectedIds.map((entityId) => this._clearSpeakerGroupFor(entityId)));
          this._toastSuccess(this._m("Group cleared", "הקבוצה נותקה"));
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
        this._build();
        if (reopenPage) this._openMobileMenu(reopenPage);
      }
    }));
    this.$("activePlayerChip")?.addEventListener("click", () => {
      if (Number(this._state.activePlayerSwipeLockUntil || 0) > Date.now()) return;
      if (this._hasPinnedPlayer()) {
        this._toast(this._m("Player is pinned from settings", "הנגן מקובע מתוך ההגדרות"));
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
        if (this.$("npArt")?.dataset.emptyAction === "random") {
          this._pressUiButton(this.$("npArt"));
          await this._playRandomFromPlaylists();
          return;
        }
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
    this.$("mobileQueueActionSheet")?.addEventListener("click", async (e) => {
      const btn = e.target.closest("[data-queue-popup],[data-media-popup]");
      if (!btn) return;
      const entry = this._state.mobileQueueActionEntry || null;
      const action = btn.dataset.queuePopup || btn.dataset.mediaPopup;
      if (action === "close") return this._closeMobileQueueActionMenu();
      if (!entry) return;
      if (this._state.mobileActionContext === "media") {
        await this._handleMobileMediaAction(action, entry);
      } else if (action === "like") {
        await this._toggleLikeEntry(entry, btn);
      } else {
        await this._handleQueueAction(action, entry.queue_item_id);
      }
      this._closeMobileQueueActionMenu();
      if (this._state.menuOpen && (this._state.menuPage === "queue" || String(this._state.menuPage || "").startsWith("library_"))) {
        await this._renderMobileMenu();
      }
    });
    this.$("maConfirmCloseBtn")?.addEventListener("click", () => this._closeMaConfirm());
    this.$("maConfirmCancelBtn")?.addEventListener("click", () => this._closeMaConfirm());
    this.$("maConfirmContinueBtn")?.addEventListener("click", () => this._confirmMusicAssistantOpen());
    this.$("maConfirmModal")?.addEventListener("click", (e) => { if (e.target === this.$("maConfirmModal")) this._closeMaConfirm(); });
    this.$("mobileMenuBody")?.addEventListener("click", this._boundMobileMenuClick);
    this.$("mobileMenuBody")?.addEventListener("change", this._boundMobileMenuChange);
    this.$("progressBar")?.addEventListener("click", (e) => this._seekFromProgress(e));
    this.$("mobileVolPctLabel")?.addEventListener("click", () => this._openMobileVolumePresets());
    this.$("volSlider")?.addEventListener("input", (e) => {
      const pct = Number(e.target.value || 0);
      e.target.style.setProperty("--vol-pct", `${pct}%`);
      this._setButtonIcon(this.$("btnMute"), pct === 0 ? "volume_mute" : pct < 40 ? "volume_low" : "volume_high");
      this.$("btnMute")?.classList.toggle("muted", pct === 0);
      const volLabel = this.$("mobileVolPctLabel");
      if (volLabel) volLabel.textContent = `${pct}%`;
      clearTimeout(this._volumeTimer);
      this._volumeTimer = setTimeout(() => this._setVolume(pct / 100), 120);
    });
  }

  async _init() {
    try {
      this._state.view = "now_playing";
      this._loadPlayers();
      this._connectMA();
      this._refreshGroupingState();
      await this._ensureQueueSnapshot();
      this._renderCurrentView();
      this._startLoops();
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
    if (title) title.textContent = player?.attributes?.friendly_name || this._m("Selected Player", "נגן נבחר");
    if (sub) sub.textContent = "";
    if (tags) {
      const groupCount = this._playerGroupCount(player);
      const pinned = this._hasPinnedPlayer();
      const nightMode = this._mobileNightMode();
      const nightActive = this._isNightModeActive();
      tags.innerHTML = [
        pinned
          ? `<span class="player-focus-pill pinned"><span>${this._esc(this._m("Pinned", "מקובע"))}</span></span>`
          : ``,
        nightMode !== "off"
          ? `<span class="player-focus-pill ${nightActive ? "night active" : "night"}"><span>${this._esc(this._m("Night", "לילה"))}</span></span>`
          : ``,
        player?.state === "playing"
          ? `<span class="player-focus-pill playing"><span class="eq-icon" aria-hidden="true"><span></span><span></span><span></span></span><span>${this._esc(this._m("Playing", "מנגן"))}</span></span>`
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
      thumb.style.backgroundImage = art ? `url("${art}")` : "";
      thumb.classList.toggle("placeholder", !art);
    }
    this._syncMobilePlayerNavButtons();
    this._setMobileRandomFabVisible(true);
  }

  _openMobileQueueActionMenu(entry = {}) {
    this._state.mobileActionContext = "queue";
    this._state.mobileQueueActionEntry = entry;
    const host = this.$("mobileQueueActionSheet");
    const liked = this._isEntryLiked(entry);
    const currentInfo = this._currentTrackInfo();
    if (host) {
      host.innerHTML = `
        <div class="queue-action-header">
          <div class="queue-action-player">${this._esc(this._selectedPlayerName())}</div>
          <div class="queue-action-title">${this._esc(entry.name || currentInfo.title || this._m("Queue actions", "פעולות תור"))}</div>
        </div>
        <button class="queue-action-item" data-queue-popup="up">${this._iconSvg("up")}<span>${this._esc(this._m("Move up", "הזז למעלה"))}</span></button>
        <button class="queue-action-item" data-queue-popup="down">${this._iconSvg("down")}<span>${this._esc(this._m("Move down", "הזז למטה"))}</span></button>
        <button class="queue-action-item" data-queue-popup="next">${this._iconSvg("next")}<span>${this._esc(this._m("Play next", "נגן הבא"))}</span></button>
        <button class="queue-action-item" data-queue-popup="remove">${this._iconSvg("trash")}<span>${this._esc(this._m("Remove", "הסר"))}</span></button>
        <button class="queue-action-item" data-queue-popup="like">${this._iconSvg(liked ? "heart_filled" : "heart_outline")}<span>${this._esc(this._m("Like", "סמן אהבתי"))}</span></button>
        <button class="queue-action-item warn" data-queue-popup="close">${this._iconSvg("close")}<span>${this._esc(this._m("Close", "סגור"))}</span></button>
      `;
    }
    this.$("mobileQueueActionModal")?.classList.add("open");
  }

  _openMobileMediaActionMenu(entry = {}) {
    this._state.mobileActionContext = "media";
    this._state.mobileQueueActionEntry = entry;
    const host = this.$("mobileQueueActionSheet");
    const liked = this._isEntryLiked(entry);
    const currentInfo = this._currentTrackInfo();
    const mediaType = entry.media_type || entry.type || "album";
    const radioMode = this._supportsMusicAssistantRadioMode(mediaType);
    if (host) {
      host.innerHTML = `
        <div class="queue-action-header">
          <div class="queue-action-player">${this._esc(this._selectedPlayerName())}</div>
          <div class="queue-action-title">${this._esc(entry.name || currentInfo.title || this._m("Media actions", "פעולות מדיה"))}</div>
        </div>
        <button class="queue-action-item" data-media-popup="play">${this._iconSvg("play")}<span>${this._esc(this._m("Play", "נגן"))}</span></button>
        <button class="queue-action-item" data-media-popup="play_clear">${this._iconSvg("play")}<span>${this._esc(this._m("Play now and clear queue", "נגן עכשיו נקה תור"))}</span></button>
        <button class="queue-action-item" data-media-popup="next">${this._iconSvg("next")}<span>${this._esc(this._m("Play next", "נגן הבא"))}</span></button>
        <button class="queue-action-item" data-media-popup="next_clear">${this._iconSvg("next")}<span>${this._esc(this._m("Play next and clear queue", "נגן הבא ונקה תור"))}</span></button>
        <button class="queue-action-item" data-media-popup="add">${this._iconSvg("queue")}<span>${this._esc(this._m("Add to queue", "הוסף לתור"))}</span></button>
        ${radioMode ? `<button class="queue-action-item" data-media-popup="radio_mode">${this._iconSvg("radio")}<span>${this._esc(this._m("Start radio mode", "הפעל Radio"))}</span></button>` : ``}
        <button class="queue-action-item" data-media-popup="like">${this._iconSvg(liked ? "heart_filled" : "heart_outline")}<span>${this._esc(this._m(liked ? "Remove like" : "Like", liked ? "בטל אהבתי" : "סמן אהבתי"))}</span></button>
        <button class="queue-action-item warn" data-media-popup="close">${this._iconSvg("close")}<span>${this._esc(this._m("Close", "סגור"))}</span></button>
      `;
    }
    this.$("mobileQueueActionModal")?.classList.add("open");
  }

  _closeMobileQueueActionMenu() {
    this._state.mobileActionContext = "";
    this._state.mobileQueueActionEntry = null;
    this.$("mobileQueueActionModal")?.classList.remove("open");
  }

  async _handleMobileMediaAction(action, entry = {}) {
    if (!entry?.uri) return;
    const label = String(entry.name || "").trim();
    if (action === "like") {
      const wasLiked = this._isEntryLiked(entry);
      await this._toggleLikeEntry(entry);
      if (!this._useMaLikedMode()) {
        this._toastSuccess(wasLiked ? this._m("Removed from liked", "הוסר מאהבתי") : this._m("Added to liked", "נוסף לאהבתי"));
      }
      return;
    }
    if (action === "play" || action === "play_clear") {
      await this._playMedia(entry.uri, entry.media_type || "album", "play", { label });
      return;
    }
    if (action === "next") {
      const ok = await this._playMedia(entry.uri, entry.media_type || "album", "next", { label, silent: true });
      if (ok) this._toastSuccess(this._m("Will play next", "ינוגן הבא"));
      return;
    }
    if (action === "next_clear") {
      await this._clearQueueForPlayer(this._state.selectedPlayer);
      const ok = await this._playMedia(entry.uri, entry.media_type || "album", "next", { label, silent: true });
      if (ok) this._toastSuccess(this._m("Queue cleared and item moved next", "התור נוקה והפריט הוגדר לבא בתור"));
      return;
    }
    if (action === "add") {
      const ok = await this._playMedia(entry.uri, entry.media_type || "album", "add", { label, silent: true });
      if (ok) this._toastSuccess(this._m("Added to queue", "נוסף לתור"));
    }
    if (action === "radio_mode") {
      const mediaType = entry.media_type || "album";
      if (!this._supportsMusicAssistantRadioMode(mediaType)) {
        this._toastError(this._m("Radio mode is not available for this media type", "Radio לא זמין לסוג המדיה הזה"));
        return;
      }
      const ok = await this._playMedia(entry.uri, mediaType, "play", { label, radioMode: true, silent: true });
      if (ok) this._toastSuccess(this._m("Radio mode started", "Radio הופעל"));
    }
  }

  _openMobileVolumePresets() {
    const host = this.$("mobileVolumePresetSheet");
    if (!host) return;
    host.classList.remove("tablet-volume-sheet-host");
    const current = Math.round((this._getSelectedPlayer()?.attributes?.volume_level || 0) * 100);
    const values = Array.from({ length: 11 }, (_, index) => 100 - (index * 10));
    host.innerHTML = values.map((value) => `
      <button class="queue-action-item ${value === current ? "active" : ""}" data-volume-preset="${value}">
        <span>${value}%</span>
      </button>
    `).join("");
    this.$("mobileVolumePresetModal")?.classList.add("open");
  }

  _openTabletVolumePopup() {
    const host = this.$("mobileVolumePresetSheet");
    const player = this._getSelectedPlayer();
    if (!host || !player) return;
    host.classList.add("tablet-volume-sheet-host");
    const pct = Math.max(0, Math.min(100, Math.round((player.attributes?.volume_level || 0) * 100)));
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
      if (pctLabel) pctLabel.textContent = `${nextPct}%`;
      if (muteBtn) this._setButtonIcon(muteBtn, nextPct === 0 ? "volume_mute" : nextPct < 40 ? "volume_low" : "volume_high");
      clearTimeout(this._volumeTimer);
      this._volumeTimer = setTimeout(() => this._setVolume(nextPct / 100), 90);
    });
    muteBtn?.addEventListener("click", () => this._toggleMute());
    this.$("mobileVolumePresetModal")?.classList.add("open");
  }

  _closeMobileVolumePresets() {
    this.$("mobileVolumePresetSheet")?.classList.remove("tablet-volume-sheet-host");
    this.$("mobileVolumePresetModal")?.classList.remove("open");
  }

  _emptyQuickSuggestionLabel(mediaType = "album") {
    const type = String(mediaType || "album").toLowerCase();
    if (type === "playlist") return this._m("Playlist", "פלייליסט");
    if (type === "radio") return this._m("Radio", "רדיו");
    if (type === "track") return this._m("Track", "שיר");
    return this._m("Album", "אלבום");
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

  async _renderEmptyQuickShelf() {
    const host = this.$("emptyQuickShelf");
    if (!host) return;
    const shelfMode = String(this._state.emptyQuickShelfMode || "default");
    const fixedItems = Array.isArray(this._state.emptyQuickShelfItems) ? this._state.emptyQuickShelfItems : [];
    if (fixedItems.length) {
      host.innerHTML = fixedItems.map((item) => {
        const art = this._artUrl(item) || item?.image || item?.media_item?.image || item?.media_item?.album?.image || "";
        const title = item?.name || item?.title || this._m("Quick play", "ניגון מהיר");
        const mediaType = item?.media_type || "album";
        return `
          <button class="empty-quick-card" data-empty-media-uri="${this._esc(item.uri)}" data-empty-media-type="${this._esc(mediaType)}" title="${this._esc(title)}">
            <span class="empty-quick-art">${art ? `<img src="${this._esc(art)}" alt="">` : this._iconSvg(mediaType === "radio" ? "radio" : mediaType === "playlist" ? "queue" : "music")}</span>
            <span class="empty-quick-copy">
              <span class="empty-quick-kicker">${this._esc(this._emptyQuickSuggestionLabel(mediaType))}</span>
              <span class="empty-quick-title">${this._esc(title)}</span>
            </span>
          </button>
        `;
      }).join("");
      host.hidden = false;
      host.querySelectorAll("[data-empty-media-uri]").forEach((btn) => btn.addEventListener("click", async (e) => {
        const mediaBtn = e.currentTarget;
        const uri = mediaBtn.dataset.emptyMediaUri || "";
        const mediaType = mediaBtn.dataset.emptyMediaType || "album";
        if (!uri) return;
        this._pressUiButton(mediaBtn);
        await this._playMedia(uri, mediaType, "play", {
          label: mediaBtn.getAttribute("title") || "",
          sourceEl: mediaBtn,
        });
      }));
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
        const title = item?.name || item?.title || this._m("Quick play", "ניגון מהיר");
        const mediaType = item?.media_type || "album";
        return `
          <button class="empty-quick-card" data-empty-media-uri="${this._esc(item.uri)}" data-empty-media-type="${this._esc(mediaType)}" title="${this._esc(title)}">
            <span class="empty-quick-art">${art ? `<img src="${this._esc(art)}" alt="">` : this._iconSvg(mediaType === "radio" ? "radio" : mediaType === "playlist" ? "queue" : "music")}</span>
            <span class="empty-quick-copy">
              <span class="empty-quick-kicker">${this._esc(this._emptyQuickSuggestionLabel(mediaType))}</span>
              <span class="empty-quick-title">${this._esc(title)}</span>
            </span>
          </button>
        `;
      }).join("");
      host.hidden = false;
      host.querySelectorAll("[data-empty-media-uri]").forEach((btn) => btn.addEventListener("click", async (e) => {
        const mediaBtn = e.currentTarget;
        const uri = mediaBtn.dataset.emptyMediaUri || "";
        const mediaType = mediaBtn.dataset.emptyMediaType || "album";
        if (!uri) return;
        this._pressUiButton(mediaBtn);
        await this._playMedia(uri, mediaType, "play", {
          label: mediaBtn.getAttribute("title") || "",
          sourceEl: mediaBtn,
        });
      }));
    } catch (_) {
      if (this._emptyQuickShelfToken !== token) return;
      this._state.emptyQuickShelfItems = [];
      host.hidden = true;
      host.innerHTML = "";
    }
  }

  _renderEmpty(text = this._m("No active media", "אין מדיה פעילה"), options = {}) {
    const notice = this.$("mobileNotice");
    if (notice) {
      notice.classList.remove("open");
      notice.textContent = "";
    }
    const card = this.shadowRoot.querySelector(".card");
    const wasEmpty = card?.classList.contains("empty-media");
    card?.classList.add("empty-media");
    const nextShelfMode = String(options.shelfMode || "default");
    if (this._state.emptyQuickShelfMode !== nextShelfMode) {
      this._state.emptyQuickShelfMode = nextShelfMode;
      this._state.emptyQuickShelfItems = [];
    }
    this.$("mobileArtActions")?.setAttribute("hidden", "");
    if (this.$("npTitle")) this.$("npTitle").textContent = text;
    if (this.$("npSub")) this.$("npSub").textContent = options.subtitle || this._m("Choose something from the quick shelf or tap the wand for a random playlist.", "בחר משהו מהמדף המהיר או לחץ על השרביט לפלייליסט אקראי.");
    if (this.$("bigCurTime")) this.$("bigCurTime").textContent = "0:00";
    if (this.$("bigTotalTime")) this.$("bigTotalTime").textContent = "0:00";
    if (this.$("progressFill")) this.$("progressFill").style.width = "0%";
    if (!wasEmpty || !this.$("surpriseMeBtn")) {
      if (this.$("npArt")) this.$("npArt").innerHTML = `
        <button class="surprise-me-card compact magic-empty" id="surpriseMeBtn" aria-label="${this._esc(options.artLabel || this._m("Surprise me", "תפתיע אותי"))}">
          <span class="surprise-me-glow"></span>
          <span class="surprise-me-wand">${this._iconSvg(options.artIcon || "wand")}</span>
        </button>
      `;
      this.$("surpriseMeBtn")?.addEventListener("click", (e) => {
        this._pressUiButton(e.currentTarget);
        if (options.artAction === "radio") this._playRandomRadioStation();
        else this._playRandomFromPlaylists();
      });
    }
    this._setMobileRandomFabVisible(false);
    this._setMobileRandomFabDisabled(false);
    this._destroyMobileEmbla();
    this._state.mobileArtRenderKey = "";
    this._mobileDynamicThemeToken += 1;
    this._state.mobileDynamicThemeArtwork = "";
    this._state.mobileDynamicThemePalette = null;
    this._applyDynamicThemeStyles();
    this._syncSourceBadgesUi(null, null);
    this._syncRecentHistoryUi();
    if (this.$("mobileArtAura")) this.$("mobileArtAura").style.backgroundImage = "";
    if (this.$("mobileHeroAura")) this.$("mobileHeroAura").style.backgroundImage = "";
    if (this.$("compactBackdropArt")) this.$("compactBackdropArt").style.backgroundImage = "";
    if (this.$("compactCoverAura")) this.$("compactCoverAura").style.backgroundImage = "";
    if (!wasEmpty || !this.$("emptyQuickShelf")?.children?.length) {
      this._renderEmptyQuickShelf().catch(() => {});
    }
    this._updateActivePlayersBubble();
  }

  async _playRandomFromPlaylists() {
    try {
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
        this._toastError(this._m("No playlists found", "לא נמצאה מוזיקה אקראית"));
        return;
      }
      const pick = playlists[Math.floor(Math.random() * playlists.length)];
      if (!pick?.uri) {
        this._toastError(this._m("Could not choose media", "לא ניתן לבחור מדיה"));
        return;
      }
      const ok = await this._playMedia(pick.uri, pick.media_type || "playlist", "play", {
        label: pick.name || this._m("Random playlist", "פלייליסט אקראי"),
        silent: true,
      });
      if (ok) {
        this._showSurprisePopup(pick);
        this._toastSuccess(this._m("Playing a random playlist", "מנגן פלייליסט אקראי"));
      }
    } catch (error) {
      this._toastError(error?.message || this._m("Could not start playback", "לא ניתן להתחיל ניגון"));
    }
  }

  async _playRandomRadioStation() {
    try {
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
        this._toastError(this._m("No radio stations found", "לא נמצאו תחנות רדיו"));
        return;
      }
      const pick = stations[Math.floor(Math.random() * stations.length)];
      const ok = await this._playMedia(pick.uri, "radio", "play", {
        label: pick.name || this._m("Random radio", "רדיו אקראי"),
        silent: true,
      });
      if (ok) this._toastSuccess(this._m("Playing a random radio station", "מנגן תחנת רדיו אקראית"));
    } catch (error) {
      this._toastError(error?.message || this._m("Could not start radio playback", "לא ניתן להתחיל ניגון רדיו"));
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
        <button class="radio-stage-fab" id="radioHeroBtn" aria-label="${this._esc(this._m("Random radio", "רדיו אקראי"))}">
          ${this._iconSvg("radio")}
        </button>
      </div>
    `;
    this.$("radioHeroBtn")?.addEventListener("click", (e) => {
      this._pressUiButton(e.currentTarget);
      this._playRandomRadioStation();
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

  _syncNowPlayingUI() {
    this._syncSleepTimerState();
    this._syncNightModeUi();
    const player = this._getSelectedPlayer();
    if (!player) {
      this._syncControlRoomUi();
      return;
    }
    const compactTileMode = this._isCompactTileMode();
    const renderCompactTile = ({ title = "", subtitle = "", art = "", icon = "music_note", duration = 0, position = 0, emptyAction = "", upNextItem = null, sourceQueueItem = null }) => {
      if (!compactTileMode) return false;
      const artHost = this.$("npArt");
      const artImage = this.$("compactCoverImage");
      const compactBackdrop = this.$("compactBackdropArt");
      const compactCoverAura = this.$("compactCoverAura");
      const bg = this.$("mobileBg");
      const browseStack = this._mobileArtStackItems();
      const browsePreviewArt = this._queueItemImageUrl(browseStack.current, 420)
        || browseStack.current?.media_image
        || browseStack.current?.image
        || browseStack.current?.image_url
        || browseStack.current?.media_item?.image
        || browseStack.current?.media_item?.image_url
        || browseStack.current?.media_item?.album?.image
        || browseStack.current?.media_item?.album?.image_url
        || "";
      const effectiveArt = (this._mobileSwipeMode() === "browse" && Number(browseStack.offset || 0) !== 0)
        ? (browsePreviewArt || art)
        : art;
      const overlay = this._mobileBackdropOverlay(this._effectiveTheme());
      if (artHost) {
        artHost.classList.toggle("placeholder", !effectiveArt);
        artHost.style.backgroundImage = "";
        artHost.dataset.emptyAction = emptyAction || "";
      }
      if (artImage) {
        if (effectiveArt) artImage.src = effectiveArt;
        else artImage.removeAttribute("src");
        artImage.alt = title || this._m("Artwork", "עטיפה");
      }
      this._syncDynamicThemeArtwork(effectiveArt || "").catch(() => {});
      if (compactBackdrop) compactBackdrop.style.backgroundImage = effectiveArt ? `url("${this._esc(effectiveArt)}")` : "";
      if (compactCoverAura) compactCoverAura.style.backgroundImage = effectiveArt ? `url("${this._esc(effectiveArt)}")` : "";
      if (bg) bg.style.backgroundImage = effectiveArt ? `${overlay}, url("${this._esc(effectiveArt)}")` : "";
      if (this.$("npTitle")) this.$("npTitle").textContent = title || this._m("Nothing playing", "לא מתנגן");
      if (this.$("npSub")) this.$("npSub").textContent = subtitle || "—";
      this._syncMobileUpNextUi(upNextItem);
      this._syncSourceBadgesUi(player, sourceQueueItem);
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
      const shelf = this.$("emptyQuickShelf");
      if (shelf) {
        shelf.hidden = true;
        shelf.innerHTML = "";
      }
      if (renderCompactTile({
        title: this._m("No player selected", "לא נבחר נגן"),
        subtitle: this._m("Use expand to open the full player", "השתמש בהרחבה כדי לפתוח את הנגן המלא"),
        art: "",
        emptyAction: "random",
      })) return;
      this._renderEmpty();
      this._syncStatus();
      this._updateActivePlayersBubble();
      return;
    }
    const cardRoot = this.shadowRoot.querySelector(".card");
    cardRoot?.classList.remove("empty-media");
    cardRoot?.classList.remove("radio-media");
    this.$("activePlayerChip")?.classList.toggle("playing", player.state === "playing");
    this._clearNotice();
    this._setButtonIcon(this.$("btnPlay"), this._playPauseIconName(player));
    this.$("btnPlay")?.classList.toggle("is-playing", player.state === "playing");
    this._setButtonIcon(this.$("btnMute"), this._volumeIconName(player));
    this._setButtonIcon(this.$("controlVolumeBtn"), this._volumeIconName(player));
    this.$("controlVolumeBtn")?.classList.toggle("muted", this._isMuted(player));
    this._setButtonIcon(this.$("mobileShuffleBtn"), "shuffle");
    this._setButtonIcon(this.$("mobileRepeatBtn"), (player.attributes.repeat || "off") === "one" ? "repeat_one" : "repeat");
    this.$("mobileShuffleBtn")?.classList.toggle("active", !!player.attributes.shuffle);
    this.$("mobileRepeatBtn")?.classList.toggle("active", (player.attributes.repeat || "off") !== "off");
    const tabletPopupSlider = this.$("tabletPopupVolSlider");
    const tabletPopupMuteBtn = this.$("tabletPopupMuteBtn");
    const tabletPopupVolPct = this.$("tabletPopupVolPct");
    const tabletVol = Math.max(0, Math.min(100, Math.round((player.attributes?.volume_level || 0) * 100)));
    if (tabletPopupSlider) {
      tabletPopupSlider.value = tabletVol;
      tabletPopupSlider.style.setProperty("--vol-pct", `${tabletVol}%`);
    }
    if (tabletPopupVolPct) tabletPopupVolPct.textContent = `${tabletVol}%`;
    if (tabletPopupMuteBtn) this._setButtonIcon(tabletPopupMuteBtn, this._volumeIconName(player));
    const currentAnchorKey = this._getQueueItemKey(this._state.maQueueState?.current_item) || `${player.entity_id}:${player.attributes.media_content_id || player.attributes.media_title || ""}`;
    if (this._state.mobileArtAnchorKey !== currentAnchorKey) {
      this._state.mobileArtAnchorKey = currentAnchorKey;
      this._state.mobileArtBrowseOffset = 0;
    }
    const stack = this._mobileArtStackItems();
    const currentQueueItem = this._state.maQueueState?.current_item || null;
    const currentMedia = currentQueueItem?.media_item || {};
    const hasPendingPlay = Number(this._state.mobileQueuePlayPendingUntil || 0) > Date.now();
    const playerUri = String(player.attributes.media_content_id || "").trim();
    const queueUri = String(this._getQueueItemUri(currentQueueItem) || "").trim();
    const queueTitle = currentMedia?.name || currentQueueItem?.name || "";
    const currentTitle = hasPendingPlay
      ? (queueTitle || player.attributes.media_title || this._m("Nothing playing", "לא מתנגן"))
      : (player.attributes.media_title || queueTitle || this._m("Nothing playing", "לא מתנגן"));
    const currentArtist = Array.isArray(currentMedia?.artists)
      ? currentMedia.artists.map((artist) => artist?.name).filter(Boolean).join(", ")
      : "";
    const currentAlbum = hasPendingPlay
      ? (currentMedia?.album?.name || currentQueueItem?.album || player.attributes.media_album_name || "")
      : (player.attributes.media_album_name || currentMedia?.album?.name || currentQueueItem?.album || "");
    const currentMediaType = String(
      currentMedia?.media_type
      || currentQueueItem?.media_type
      || player.attributes.media_content_type
      || player.attributes.media_channel
      || ""
    ).toLowerCase();
    const upNextItem = this._mobileUpNextItem();
    const forceRadioHero = !!this._state.forceRadioHero;
    const likelyRadioPlayback = this._isLikelyRadioPlayback(player, currentQueueItem, currentMedia);
    const hasPlayableMedia = !!(player.attributes.media_title || player.attributes.media_content_id || currentQueueItem?.name || currentMedia?.name);
    if (!hasPlayableMedia) {
      this._state.forceRadioHero = false;
      this._syncSourceBadgesUi(null, null);
      this._syncRecentHistoryUi();
      if (renderCompactTile({
        title: this._m("Player is ready", "הנגן מוכן"),
        subtitle: player.attributes?.friendly_name || this._m("Nothing is playing right now", "לא מתנגן כרגע"),
        art: player.attributes.entity_picture_local || player.attributes.entity_picture || "",
        duration: 0,
        position: 0,
        emptyAction: "random",
        upNextItem: null,
        sourceQueueItem: null,
      })) {
        this.$("btnPlay")?.classList.remove("is-playing");
        this.$("btnMute")?.classList.toggle("muted", this._isMuted(player));
        return;
      }
      this._renderEmpty(this._m("Player is ready - nothing is playing right now", "הנגן זמין – לא מתנגן כרגע כלום"));
      this._syncMobileUpNextUi(null);
      this.$("btnPlay")?.classList.remove("is-playing");
      this._renderPlayerSummary();
      this._syncStatus();
      this._syncLikeButtons();
      this._updateActivePlayersBubble();
      this._syncControlRoomUi();
      return;
    }
    if (currentMediaType === "radio" || forceRadioHero || likelyRadioPlayback) {
      this._rememberRecentPlayback(player, currentQueueItem);
      this._syncRecentHistoryUi();
      this._syncSourceBadgesUi(player, currentQueueItem);
      const radioDuration = this._getCurrentDuration();
      const radioPosition = this._getCurrentPosition();
      if (renderCompactTile({
        title: currentTitle || this._m("Radio", "רדיו"),
        subtitle: [currentArtist || player.attributes.media_artist || "", currentAlbum].filter(Boolean).join(" · ") || "—",
        art: player.attributes.media_image || player.attributes.media_image_url || player.attributes.entity_picture_local || player.attributes.entity_picture || "",
        icon: "radio",
        duration: radioDuration,
        position: radioPosition,
        upNextItem,
        sourceQueueItem: currentQueueItem,
      })) {
        const radioVol = Math.round((player.attributes.volume_level || 0) * 100);
        if (this.$("volSlider")) {
          this.$("volSlider").value = radioVol;
          this.$("volSlider").style.setProperty("--vol-pct", `${radioVol}%`);
        }
        this.$("btnMute")?.classList.toggle("active", this._isMuted(player));
        this.$("btnMute")?.classList.toggle("muted", this._isMuted(player));
        this.$("btnPlay")?.classList.toggle("is-playing", player.state === "playing");
        return;
      }
      this._renderEmpty(currentTitle || this._m("Radio", "רדיו"), {
        subtitle: [currentArtist || player.attributes.media_artist || "", currentAlbum].filter(Boolean).join(" · ") || "—",
        shelfMode: "radio",
        artLabel: this._m("Random radio", "רדיו אקראי"),
        artIcon: "radio",
        artAction: "radio",
      });
      this._syncMobileUpNextUi(upNextItem);
      if (this.$("progressFill")) this.$("progressFill").style.width = radioDuration ? `${Math.min(100, (radioPosition / radioDuration) * 100)}%` : "0%";
      if (this.$("bigCurTime")) this.$("bigCurTime").textContent = this._fmtDur(radioPosition);
      if (this.$("bigTotalTime")) this.$("bigTotalTime").textContent = this._fmtDur(radioDuration);
      const radioVol = Math.round((player.attributes.volume_level || 0) * 100);
      if (this.$("volSlider")) {
        this.$("volSlider").value = radioVol;
        this.$("volSlider").style.setProperty("--vol-pct", `${radioVol}%`);
      }
      const radioVolLabel = this.$("mobileVolPctLabel");
      if (radioVolLabel) radioVolLabel.textContent = `${radioVol}%`;
      this.$("btnMute")?.classList.toggle("active", this._isMuted(player));
      this.$("btnMute")?.classList.toggle("muted", this._isMuted(player));
      this.$("btnPlay")?.classList.toggle("is-playing", player.state === "playing");
      this._renderPlayerSummary();
      this._syncStatus();
      this._syncLikeButtons();
      this._updateActivePlayersBubble();
      return;
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
    if (this.$("npSub")) this.$("npSub").textContent = [currentArtist || player.attributes.media_artist || "", currentAlbum].filter(Boolean).join(" · ") || "—";
    this._rememberRecentPlayback(player, currentQueueItem);
    this._syncRecentHistoryUi();
    this._syncSourceBadgesUi(player, currentQueueItem);
    this._syncMobileUpNextUi(upNextItem);
    const playingArt = this._queueItemImageUrl(currentQueueItem, 420)
      || currentQueueItem?.media_image
      || currentQueueItem?.image
      || currentQueueItem?.image_url
      || currentQueueItem?.media_item?.image
      || currentQueueItem?.media_item?.image_url
      || currentQueueItem?.media_item?.album?.image
      || currentQueueItem?.media_item?.album?.image_url
      || player.attributes.media_image
      || player.attributes.media_image_url
      || player.attributes.thumbnail
      || player.attributes.entity_picture_local
      || player.attributes.entity_picture;
    const previewArt = this._queueItemImageUrl(stack.current, 420)
      || stack.current?.media_item?.image
      || stack.current?.media_item?.album?.image
      || playingArt;
    const art = (this._mobileSwipeMode() === "browse" && stack.offset !== 0)
      ? playingArt
      : ((Number(stack.offset || 0) !== 0 && previewArt) ? previewArt : playingArt);
    const duration = this._getCurrentDuration();
    const position = this._getCurrentPosition();
    if (renderCompactTile({
      title: currentTitle,
      subtitle: [currentArtist || player.attributes.media_artist || "", currentAlbum].filter(Boolean).join(" · ") || "—",
      art,
      duration,
      position,
      upNextItem,
      sourceQueueItem: currentQueueItem,
    })) {
      const vol = Math.round((player.attributes.volume_level || 0) * 100);
      if (this.$("volSlider")) {
        this.$("volSlider").value = vol;
        this.$("volSlider").style.setProperty("--vol-pct", `${vol}%`);
      }
      this.$("btnMute")?.classList.toggle("active", this._isMuted(player));
      this.$("btnMute")?.classList.toggle("muted", this._isMuted(player));
      this._syncControlRoomUi();
      return;
    }
    this._refreshMobileArtStack();
    const bg = this.$("mobileBg");
    if (bg) {
      const overlay = this._mobileBackdropOverlay(this._effectiveTheme());
      bg.style.backgroundImage = art ? `${overlay}, url("${this._esc(art)}")` : "";
    }
    this._syncDynamicThemeArtwork(art || "").catch(() => {});
    const vol = Math.round((player.attributes.volume_level || 0) * 100);
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
    const nowPlayingUri = playerUri || queueUri || "";
    if (nowPlayingUri !== this._state.nowPlayingUri) {
      this._state.nowPlayingUri = nowPlayingUri;
      this._highlightNowPlaying();
    }
    this._renderPlayerSummary();
    this._syncStatus();
    this._syncLikeButtons();
    this._updateActivePlayersBubble();
    this._syncControlRoomUi();
  }

  _syncNowPlayingPageLive() {
    this._syncNowPlayingUI();
  }

  _openMobileMenu(page = "main") {
    if (page === "settings" && this._usesVisualSettings()) {
      this._toastSuccess(this._m("Card settings are managed from the visual editor", "הגדרות הכרטיס מנוהלות מתוך העורך הוויזואלי"));
      return;
    }
    if (page === "players" && this._hasPinnedPlayer()) {
      this._toast(this._m("Player is pinned from settings", "הנגן מקובע מתוך ההגדרות"));
      return;
    }
    this._state.menuOpen = true;
    this._state.menuPage = page || "main";
    if (String(this._state.menuPage).startsWith("library_") && this._layoutModeConfig() === "tablet") {
      this._state.mobileMediaLayout = "grid";
    }
    if (page === "main" || page === "settings" || String(page).startsWith("library_")) this._state.menuStack = [];
    this.$("mobileMenu")?.classList.add("open");
    this._renderMobileMenu();
  }

  _closeMobileMenu() {
    this._state.menuOpen = false;
    this._state.menuPage = "main";
    this._state.menuStack = [];
    this._closeMobileQueueActionMenu();
    this._closeSmartVoiceConfirm();
    this.$("mobileMenu")?.classList.remove("open", "search-open");
    this.$("mobileMenuBody")?.classList.remove("search-mode", "library-mode");
  }

  _backMobileMenu() {
    const prev = this._state.menuStack.pop();
    if (!prev) return this._closeMobileMenu();
    this._state.menuPage = prev;
    this._renderMobileMenu();
  }

  _pushMobileMenu(page) {
    if (!page || page === this._state.menuPage) return;
    this._state.menuStack.push(this._state.menuPage);
    this._state.menuPage = page;
    if (String(this._state.menuPage).startsWith("library_") && this._layoutModeConfig() === "tablet") {
      this._state.mobileMediaLayout = "grid";
    }
    this._renderMobileMenu();
  }

  _navMenuItem(page, icon, title, subtitle = "", tone = "default") {
    return `
      <button class="menu-item action-tile tone-${this._esc(tone)}" data-menu-nav="${this._esc(page)}">
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

  _mainMenuHtml() {
    return `
      <div class="action-grid">
        ${this._navMenuItem("queue", this._iconSvg("queue"), this._m("Queue", "תור"), this._m("See what plays next", "בדוק מה מתנגן הבא"), "queue")}
        ${this._navMenuItem("players", this._iconSvg("speaker"), this._m("Players", "נגנים"), this._m("Choose target and volume", "בחר יעד ושלוט בווליום"), "players")}
        ${this._navMenuItem("library_liked", this._iconSvg("heart_filled"), this._m("Liked", "אהבתי"), this._m("Open saved songs", "פתח שירים שמורים"), "liked")}
        ${this._navMenuItem("transfer", this._iconSvg("repeat"), this._m("Transfer Queue", "העבר תור"), this._m("Move music to another player", "העבר מוזיקה לנגן אחר"), "transfer")}
        ${this._navMenuItem("announcements", this._iconSvg("announcement"), this._m("Announcements", "כריזה"), this._m("Send a voice message", "שלח כריזה קולית"), "announcement")}
        ${this._navMenuItem("group", this._iconSvg("speaker"), this._m("Group Speakers", "קבוצת נגנים"), this._m("Create a room group", "צור קבוצת חדרים"), "group")}
        ${this._navMenuItem("ungroup_all", this._iconSvg("close"), this._m("Disconnect player groups", "נתק קבוצות נגנים"), this._m("Restore each player", "החזר כל נגן לעצמו"), "ungroup")}
        ${this._navMenuItem("stop_all", this._iconSvg("stop"), this._m("Stop all players", "עצור את כל הנגנים"), this._m("Stop and clear playback", "עצור ונקה את הניגון"), "stop")}
      </div>
    `;
  }

  _playerRowHtml(p, attrs = "", active = false, options = {}) {
    const art = p.attributes?.entity_picture_local || p.attributes?.entity_picture;
    const playing = p.state === "playing";
    const showControls = !!options.controls;
    const vol = Math.round((p.attributes?.volume_level || 0) * 100);
    const friendlyName = p.attributes?.friendly_name || p.entity_id;
    const track = p.attributes?.media_title || this._m("Nothing is playing", "לא מנגן כעת");
    const stateLabel = active ? this._m("Selected player", "נגן נבחר") : this._playerStateLabel(p);
    const stateIcon = playing ? `<span class="eq-icon"><span></span><span></span><span></span></span>` : "";
    const body = `
      <button class="player-premium-head ${active ? "active" : ""} ${playing ? "is-playing" : ""}" ${attrs}>
        <span class="player-premium-art">
          ${art ? `<img src="${this._esc(art)}" alt="">` : this._iconSvg("speaker")}
        </span>
        <span class="player-premium-copy">
          <span class="player-premium-kicker">${this._esc(stateLabel)}</span>
          <span class="player-premium-name">${this._esc(friendlyName)}</span>
          <span class="player-premium-meta">
            <span class="player-premium-track">${this._esc(track)}</span>
            <span class="player-premium-state">${stateIcon}${this._esc(this._playerStateLabel(p))}</span>
          </span>
        </span>
      </button>
    `;
    if (!showControls) {
      return `
        <div class="player-menu-card ${active ? "active" : ""}">
          ${body}
        </div>
      `;
    }
    return `
      <div class="player-menu-card ${active ? "active" : ""}">
        ${body}
        <div class="player-volume-row">
          <button class="player-mini-mute ${this._isMuted(p) ? "active" : ""}" data-player-mute="${this._esc(p.entity_id)}" title="${this._esc(this._t("Mute"))}">${this._iconSvg(this._volumeIconName(p))}</button>
          <input class="player-mini-volume" data-player-volume="${this._esc(p.entity_id)}" type="range" min="0" max="100" value="${vol}" style="--vol-pct:${vol}%">
          <span class="player-mini-value">${vol}%</span>
        </div>
      </div>
    `;
  }

  _playersMenuHtml(options = {}) {
    this._loadPlayers();
    if (this._hasPinnedPlayer()) {
      return `<div class="notice open">${this._m("Player switching is locked because a pinned player is configured", "החלפת נגנים נעולה כי הוגדר נגן מקובע")}</div>`;
    }
    const selected = this._state.selectedPlayer;
    const players = this._state.players || [];
    if (!players.length) return `<div class="notice open">${this._m("No players found", "לא נמצאו נגנים")}</div>`;
    const visiblePlayers = players.filter((p) => !this._isLikelyBrowserPlayer(p));
    const filteredPlayers = options.activeOnly ? visiblePlayers.filter((p) => p.state === "playing") : visiblePlayers;
    const finalPlayers = filteredPlayers.length ? filteredPlayers : (options.activeOnly ? [] : (visiblePlayers.length ? visiblePlayers : players));
    if (!finalPlayers.length) return `<div class="notice open">${this._m("No active players", "אין נגנים פעילים")}</div>`;
    return `<div class="players-premium-grid">${finalPlayers.map((p) => this._playerRowHtml(p, `data-menu-player="${this._esc(p.entity_id)}"`, p.entity_id === selected, { controls: true })).join("")}</div>`;
  }

  _transferMenuHtml() {
    if (this._hasPinnedPlayer()) {
      return `<div class="notice open">${this._m("Transfer is unavailable while a pinned player is configured", "העברת ניגון אינה זמינה כשמוגדר נגן מקובע")}</div>`;
    }
    const current = this._getSelectedPlayer();
    const others = (this._state.players || []).filter((p) => p.entity_id !== current?.entity_id);
    if (!others.length) return `<div class="notice open">${this._m("No target players available", "אין נגני יעד זמינים")}</div>`;
    return `<div class="players-premium-grid">${others.map((p) => this._playerRowHtml(p, `data-menu-transfer="${this._esc(p.entity_id)}"`)).join("")}</div>`;
  }

  _settingsPill(label, value, current, attr = "data-setting-value") {
    return `<button class="settings-pill ${value === current ? "active" : ""}" ${attr}="${this._esc(value)}">${this._esc(label)}</button>`;
  }

  _settingsMenuHtml() {
    this._loadPlayers();
    const theme = this._state.cardTheme === "light" || this._state.cardTheme === "custom" ? this._state.cardTheme : "dark";
    const dynamicThemeMode = this._mobileDynamicThemeMode();
    const backgroundMotionMode = this._mobileBackgroundMotionMode();
    const fontScale = Number(this._state.mobileFontScale || 1).toFixed(2);
    const compactMode = !!this._state.mobileCompactMode;
    const showUpNext = this._mobileShowUpNextEnabled();
    const nightMode = this._mobileNightMode();
    const nightWindow = this._nightModeWindow();
    const nightDays = new Set(this._nightModeDays());
    const nightDayOptions = this._nightModeDayOptions();
    const sleepTimerLabel = this._sleepTimerRemainingLabel();
    const footerMode = this._mobileFooterMode();
    const volumeMode = this._mobileVolumeMode();
    const micMode = this._mobileMicMode();
    const homeShortcut = this._mobileHomeShortcutEnabled();
    const likedMode = this._useMaLikedMode() ? "ma" : "local";
    const mainBarOptions = [
      ["search", this._m("Search", "חיפוש")],
      ["library", this._m("Library", "ספריה")],
      ["players", this._m("Players", "נגנים")],
      ["actions", this._m("Actions", "פעולות")],
      ["settings", this._m("Settings", "הגדרות")],
      ["theme", this._m("Theme toggle", "מצב כהה/בהיר")],
    ];
    const tabOptions = [
      ["library_playlists", this._m("Playlists", "פלייליסטים")],
      ["library_artists", this._m("Artists", "אמנים")],
      ["library_albums", this._m("Albums", "אלבומים")],
      ["library_tracks", this._m("Tracks", "שירים")],
      ["library_radio", this._m("Radio", "רדיו")],
      ["library_podcasts", this._m("Podcasts", "פודקאסטים")],
      ["library_liked", this._m("Liked", "אהבתי")],
      ["library_search", this._m("Search", "חיפוש")],
    ];
    const selectedTabs = new Set(this._mobileLibraryTabs());
    const selectedMainBar = new Set(this._mobileMainBarItems());
    const radioCountry = this._mobileRadioBrowserCountry();
    const radioCountryOptions = this._radioBrowserCountryOptions();
    const pinnedPlayer = this._pinnedPlayerPreference();
    const playerOptions = [["", this._m("Not pinned", "ללא קיבוע")], ...((this._state.players || []).map((player) => [player.entity_id, player.attributes?.friendly_name || player.entity_id]))];
    const visibleMainBarOptions = pinnedPlayer ? mainBarOptions.filter(([value]) => value !== "players") : mainBarOptions;
    return `
      <div class="settings-shell">
        <div class="settings-group">
          <div class="settings-label">${this._m("Language", "שפה")}</div>
          <div class="settings-pills">
            ${this._settingsPill("EN", "en", this._state.lang, "data-setting-lang")}
            ${this._settingsPill("עב", "he", this._state.lang, "data-setting-lang")}
          </div>
        </div>
        <div class="settings-group">
          <div class="settings-label">${this._m("Theme", "ערכת נושא")}</div>
          <div class="settings-pills">
            ${this._settingsPill(this._m("Dark", "כהה"), "dark", theme, "data-setting-theme")}
            ${this._settingsPill(this._m("Light", "בהיר"), "light", theme, "data-setting-theme")}
            ${this._settingsPill(this._m("Custom", "אישי"), "custom", theme, "data-setting-theme")}
          </div>
          <div class="settings-label">${this._m("Dynamic theme", "ערכת נושא דינמית")}</div>
          <div class="settings-pills">
            ${this._settingsPill(this._m("Off", "כבוי"), "off", dynamicThemeMode, "data-setting-dynamic-theme")}
            ${this._settingsPill("Auto", "auto", dynamicThemeMode, "data-setting-dynamic-theme")}
            ${this._settingsPill(this._m("Strong", "חזק"), "strong", dynamicThemeMode, "data-setting-dynamic-theme")}
          </div>
          <div class="settings-hint">${this._m("Auto extracts colors from the current artwork and keeps the effect subtle. Strong makes the palette richer and brighter.", "מצב Auto מחלץ צבעים מהעטיפה הפעילה ושומר על מראה עדין. מצב Strong נותן נוכחות עשירה ובולטת יותר.")}</div>
          <div class="settings-label">${this._m("Background motion", "תנועת רקע")}</div>
          <div class="settings-pills">
            ${this._settingsPill(this._m("Off", "כבוי"), "off", backgroundMotionMode, "data-setting-background-motion")}
            ${this._settingsPill(this._m("Subtle", "עדין"), "subtle", backgroundMotionMode, "data-setting-background-motion")}
            ${this._settingsPill(this._m("Strong", "חזק"), "strong", backgroundMotionMode, "data-setting-background-motion")}
          </div>
          <div class="settings-hint">${this._m("Adds very gentle motion to the background layers. Subtle keeps it calm, Strong gives the card a bit more life.", "מוסיף תנועה עדינה מאוד לשכבות הרקע. מצב עדין שומר על מראה רגוע, ומצב חזק נותן מעט יותר חיים לכרטיס.")}</div>
          <div class="settings-label">${this._m("Night mode", "מצב לילה")}</div>
          <div class="settings-pills">
            ${this._settingsPill(this._m("Off", "כבוי"), "off", nightMode, "data-setting-night-mode")}
            ${this._settingsPill("Auto", "auto", nightMode, "data-setting-night-mode")}
            ${this._settingsPill(this._m("On", "פעיל"), "on", nightMode, "data-setting-night-mode")}
          </div>
          <div class="settings-color-wrap">
            <div class="settings-label">${this._m("Night window", "חלון לילה")}</div>
            <div class="night-window-grid">
              <label class="night-time-card" for="mobileNightStartInput">
                <span class="night-time-label">${this._m("Start time", "שעת התחלה")}</span>
                <input class="night-time-input" id="mobileNightStartInput" type="time" value="${this._esc(nightWindow.start)}" step="60" aria-label="${this._esc(this._m("Start time", "שעת התחלה"))}">
              </label>
              <label class="night-time-card" for="mobileNightEndInput">
                <span class="night-time-label">${this._m("End time", "שעת סיום")}</span>
                <input class="night-time-input" id="mobileNightEndInput" type="time" value="${this._esc(nightWindow.end)}" step="60" aria-label="${this._esc(this._m("End time", "שעת סיום"))}">
              </label>
            </div>
          </div>
          <div class="settings-label">${this._m("Active days", "ימים פעילים")}</div>
          <div class="settings-check-grid">
            ${nightDayOptions.map(([value, label]) => `
              <label class="settings-check-pill">
                <input type="checkbox" data-setting-night-day="${this._esc(String(value))}" ${nightDays.has(value) ? "checked" : ""}>
                <span>${this._esc(label)}</span>
              </label>`).join("")}
          </div>
          <div class="settings-actions">
            <button class="settings-pill active" data-setting-night-window-save>${this._m("Apply schedule", "אישור")}</button>
          </div>
          <div class="settings-hint">${this._m("Auto mode turns on between Start time and End time, on the selected days, even when the range crosses midnight.", "מצב Auto נכנס לפעולה בין שעת ההתחלה לשעת הסיום, בימים שבחרת, גם אם הטווח חוצה חצות.")}</div>
          <div class="settings-label">${this._m("Sleep timer", "טיימר שינה")}</div>
          <div class="settings-actions">
            <button class="settings-pill ${sleepTimerLabel ? "active" : ""}" data-setting-sleep-timer>${this._esc(sleepTimerLabel ? `${this._m("Sleep", "שינה")} ${sleepTimerLabel}` : this._m("Cycle timer", "הפעל / שנה טיימר"))}</button>
            ${sleepTimerLabel ? `<button class="settings-pill" data-setting-sleep-clear>${this._esc(this._m("Clear timer", "בטל טיימר"))}</button>` : ``}
          </div>
          <div class="settings-color-wrap">
            <div class="settings-label">${this._m("Accent color", "צבע מוביל")}</div>
            <div class="settings-color-row">
              <input class="settings-color-picker" id="mobileCustomColorPicker" type="color" value="${this._esc(this._state.mobileCustomColor || "#f5a623")}">
              <div class="settings-value">${this._esc(String(this._state.mobileCustomColor || "#f5a623").toUpperCase())}</div>
            </div>
          </div>
          <div class="settings-range">
            <div class="settings-label">${this._m("Font size", "גודל פונט")}</div>
            <input id="mobileFontScaleRange" type="range" min="0.9" max="1.3" step="0.05" value="${this._esc(fontScale)}">
            <div class="settings-value">${this._esc(fontScale)}x</div>
          </div>
          <div class="settings-label">${this._m("Compact mode", "מצב קומפקטי")}</div>
          <div class="settings-pills">
            ${this._settingsPill(this._m("Enabled", "פעיל"), "on", compactMode ? "on" : "off", "data-setting-compact-mode")}
            ${this._settingsPill(this._m("Disabled", "כבוי"), "off", compactMode ? "on" : "off", "data-setting-compact-mode")}
          </div>
          <div class="settings-label">${this._m("Show Up Next", "הצג הבא בתור")}</div>
          <div class="settings-pills">
            ${this._settingsPill(this._m("Enabled", "פעיל"), "on", showUpNext ? "on" : "off", "data-setting-show-up-next")}
            ${this._settingsPill(this._m("Disabled", "כבוי"), "off", showUpNext ? "on" : "off", "data-setting-show-up-next")}
          </div>
          <div class="settings-label">${this._m("Artwork swipe", "סוויפ על עטיפה")}</div>
          <div class="settings-pills">
            ${this._settingsPill(this._m("Change song", "מעביר שיר"), "play", this._mobileSwipeMode(), "data-setting-swipe-mode")}
            ${this._settingsPill(this._m("Browse covers", "מדפדף עטיפות"), "browse", this._mobileSwipeMode(), "data-setting-swipe-mode")}
          </div>
          <div class="settings-label">${this._m("Footer search button", "כפתור חיפוש בפוטר")}</div>
          <div class="settings-pills">
            ${this._settingsPill(this._m("Enabled", "פעיל"), "on", this._state.mobileFooterSearchEnabled ? "on" : "off", "data-setting-footer-search")}
            ${this._settingsPill(this._m("Disabled", "כבוי"), "off", this._state.mobileFooterSearchEnabled ? "on" : "off", "data-setting-footer-search")}
          </div>
          <div class="settings-label">${this._m("Microphone", "שימוש במיקרופון")}</div>
          <div class="settings-pills">
            ${this._settingsPill(this._m("On", "פעיל"), "on", micMode, "data-setting-mic-mode")}
            ${this._settingsPill(this._m("Off", "מנותק"), "off", micMode, "data-setting-mic-mode")}
            ${this._settingsPill(this._m("Smart", "חכם"), "smart", micMode, "data-setting-mic-mode")}
          </div>
          <div class="settings-label">${this._m("Footer style", "מראה פוטר")}</div>
          <div class="settings-pills">
            ${this._settingsPill(this._m("Icon only", "אייקון בלבד"), "icon", footerMode, "data-setting-footer-mode")}
            ${this._settingsPill(this._m("Text only", "מלל בלבד"), "text", footerMode, "data-setting-footer-mode")}
            ${this._settingsPill(this._m("Icon and text", "אייקון ומלל"), "both", footerMode, "data-setting-footer-mode")}
          </div>
          <div class="settings-label">${this._m("Home shortcut", "כפתור בית")}</div>
          <div class="settings-pills">
            ${this._settingsPill(this._m("Enabled", "פעיל"), "on", homeShortcut ? "on" : "off", "data-setting-home-shortcut")}
            ${this._settingsPill(this._m("Disabled", "כבוי"), "off", homeShortcut ? "on" : "off", "data-setting-home-shortcut")}
          </div>
          <div class="settings-label">${this._m("Pinned player", "נגן מקובע")}</div>
          <select class="media-sort-select settings-select" id="mobilePinnedPlayerSelect" aria-label="${this._esc(this._m("Pinned player", "נגן מקובע"))}">
            ${playerOptions.map(([value, label]) => `<option value="${this._esc(value)}" ${value === pinnedPlayer ? "selected" : ""}>${this._esc(label)}</option>`).join("")}
          </select>
          <div class="settings-hint">${this._m("When a player is pinned, the card stays on that player and hides player switching.", "כשמוגדר נגן מקובע, הכרטיס נשאר עליו ומסתיר מעבר בין נגנים.")}</div>
          <div class="settings-label">${this._m("Main bar items", "פריטים בסרגל הראשי")}</div>
          <div class="settings-check-grid">
            ${visibleMainBarOptions.map(([value, label]) => `
              <label class="settings-check-pill">
                <input type="checkbox" data-setting-main-bar-item="${this._esc(value)}" ${selectedMainBar.has(value) ? "checked" : ""}>
                <span>${this._esc(label)}</span>
              </label>`).join("")}
          </div>
          <div class="settings-label">${this._m("Volume control (large screen only)", "בקרת ווליום (זמין רק במסך גדול)")}</div>
          <div class="settings-pills">
            ${this._settingsPill(this._m("Always visible", "פעיל תמיד"), "always", volumeMode, "data-setting-volume-mode")}
            ${this._settingsPill(this._m("Button", "כפתור"), "button", volumeMode, "data-setting-volume-mode")}
          </div>
          <div class="settings-label">${this._m("Liked sync", "סנכרון אהבתי")}</div>
          <div class="settings-pills">
            ${this._settingsPill("Music Assistant", "ma", likedMode, "data-setting-liked-mode")}
            ${this._config?.allow_local_likes === true ? this._settingsPill(this._m("Local", "מקומי"), "local", likedMode, "data-setting-liked-mode") : ""}
          </div>
          <div class="settings-label">Radio Browser</div>
          <select class="media-sort-select settings-select" id="mobileRadioCountrySelect" aria-label="${this._esc(this._m("Radio Browser country", "מדינת Radio Browser"))}">
            ${radioCountryOptions.map(([value, label]) => `<option value="${this._esc(value)}" ${value === radioCountry ? "selected" : ""}>${this._esc(label)}</option>`).join("")}
          </select>
          <div class="settings-hint">${this._m("Choose a country, or All countries to browse every country inside the Radio tab.", "בחר מדינה, או כל המדינות כדי לדפדף בכל המדינות מתוך טאב הרדיו.")}</div>
        </div>
        <div class="settings-group">
          <div class="settings-label">${this._m("Library pages", "דפי ספריה")}</div>
          <div class="settings-check-grid">
            ${tabOptions.map(([value, label]) => `
              <label class="settings-check-pill">
                <input type="checkbox" data-setting-library-tab="${this._esc(value)}" ${selectedTabs.has(value) ? "checked" : ""}>
                <span>${this._esc(label)}</span>
              </label>`).join("")}
          </div>
        </div>
        <div class="settings-group">
          <div class="settings-label">Music Assistant</div>
          <div class="settings-actions">
            <button class="settings-pill active" data-menu-action="open_app">${this._m("Open full interface", "פתיחת ממשק מלא")}</button>
          </div>
        </div>
        <div class="settings-group">
          <div class="settings-label">${this._m("Announcement presets", "משפטי כריזה")}</div>
          ${(this._state.mobileAnnouncementPresets || []).slice(0, 3).map((preset, index) => `
            <input class="settings-text-input" data-announcement-preset-index="${this._esc(index)}" type="text" value="${this._esc(preset || "")}" placeholder="${this._esc(this._m("Preset message", "משפט מוגדר מראש"))}">
          `).join("")}
          <div class="settings-label">${this._m("TTS entity", "ישות TTS")}</div>
          <input class="settings-text-input" id="mobileAnnouncementTtsEntity" type="text" value="${this._esc(this._state.mobileAnnouncementTtsEntity || "")}" placeholder="tts.home_assistant_cloud">
          <div class="settings-hint">${this._m("Text announcements use Home Assistant TTS into the selected Music Assistant player. URL announcements use Music Assistant announcement playback.", "כריזה מטקסט משתמשת ב־TTS של Home Assistant אל נגן Music Assistant שנבחר. כריזה מקישור משתמשת בניגון הכרזה של Music Assistant.")}</div>
        </div>
                <div class="settings-version">Version ${HOMEII_CARD_VERSION}</div>
      </div>
    `;
  }

  _libraryTabMeta(tab) {
    const map = {
      library_liked: { icon: "heart_filled", type: "liked", title: this._m("Liked", "אהבתי") },
      library_playlists: { icon: "playlist", type: "playlist", title: this._m("Playlists", "פלייליסטים") },
      library_artists: { icon: "artist", type: "artist", title: this._m("Artists", "אמנים") },
      library_albums: { icon: "album", type: "album", title: this._m("Albums", "אלבומים") },
      library_tracks: { icon: "tracks", type: "track", title: this._m("Tracks", "שירים") },
      library_radio: { icon: "radio", type: "radio", title: this._m("Radio", "רדיו") },
      library_podcasts: { icon: "podcast", type: "podcast", title: this._m("Podcasts", "פודקאסטים") },
      library_search: { icon: "search", type: "search", title: this._m("Search", "חיפוש") },
    };
    return map[tab] || map.library_playlists;
  }

  _libraryNavHtml(currentTab) {
    const tabs = this._mobileLibraryTabs();
    return `
      <div class="library-nav">
        ${tabs.map((tab) => {
          const meta = this._libraryTabMeta(tab);
          return `<button class="library-nav-btn ${tab === currentTab ? "active" : ""}" data-menu-nav="${this._esc(tab)}">${this._iconSvg(meta.icon)}</button>`;
        }).join("")}
      </div>
    `;
  }

  _libraryShellHtml(content, currentTab) {
    const player = this._getSelectedPlayer();
    const playerName = player?.attributes?.friendly_name || this._m("Choose Player", "בחר נגן");
    const isPlaying = player?.state === "playing";
    const groupCount = this._playerGroupCount(player);
    return `
      <div class="library-shell">
        <button class="library-player-focus ${isPlaying ? "is-playing" : ""}" data-menu-nav="players">
          <span>${this._esc(playerName)}</span>
          ${groupCount ? `<span class="player-group-badge library-focus-badge">${this._esc(groupCount)}</span>` : ``}
          <span class="eq-icon" aria-hidden="true"><span></span><span></span><span></span></span>
        </button>
        <div class="library-body">${content}</div>
        ${this._libraryNavHtml(currentTab)}
      </div>
    `;
  }

  _librarySearchHomeHtml() {
    const q = this._state.mediaQuery || "";
    const voiceSupported = this._isVoiceSearchSupported();
    return `
      <div class="media-home-shell">
        <div class="media-search-zone">
          <div class="media-search-shell">
            <span>${this._iconSvg("search")}</span>
            <input id="mobileMediaSearchInput" type="text" value="${this._esc(q)}" placeholder="${this._m("What would you like to listen to?", "לאיזה תוכן תרצו להאזין? ")}">
            <button class="media-voice-btn ${voiceSupported ? "" : "unsupported"}" id="mobileVoiceSearchBtn" title="${this._esc(this._m("Voice search", "חיפוש קולי"))}">${this._iconSvg("mic")}</button>
            <button class="media-search-clear ${q ? "visible" : ""}" id="mobileMediaSearchClear" style="display:${q ? "" : "none"};" title="${this._esc(this._m("Clear search", "נקה חיפוש"))}">×</button>
          </div>
        </div>
        <div id="mobileMediaSearchResults"></div>
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
        items.push({
          uri,
          media_type: item?.media_type || item?.type || mediaType,
          name: item?.name || item?.media_item?.name || uri,
          artist: this._artistName(item) || item?.artist || "",
          album: item?.album?.name || item?.media_item?.album?.name || "",
          image: this._artUrl(item) || item?.image || item?.media_item?.image || "",
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
        <div class="smart-voice-title">${this._esc(this._m("Smart voice selection", "בחירה קולית חכמה"))}</div>
        <div class="smart-voice-target">${this._esc(this._m("Player", "נגן"))}: ${this._esc(targetName)}</div>
      </div>
      <div class="smart-voice-card">
        <div class="smart-voice-chip">${this._iconSvg("mic")}<span>${this._esc(state.query || "")}</span></div>
        <div class="smart-voice-name">${this._esc(candidate.name || "")}</div>
        <div class="smart-voice-sub">${this._esc(subtitle || this._m("Ready to play", "מוכן לניגון"))}</div>
        <div class="smart-voice-countdown"><span>${this._esc(String(state.countdown || 0))}</span></div>
      </div>
      <div class="confirm-actions smart-voice-actions">
        <button class="menu-item" id="smartVoicePlayNowBtn">${this._esc(this._m("Play", "נגן"))}</button>
        <button class="menu-item" id="smartVoiceOtherBtn">${this._esc(this._m("Other", "אחר"))}</button>
        <button class="menu-item" id="smartVoiceCancelBtn">${this._esc(this._m("Cancel", "בטל"))}</button>
      </div>
    `;
    host.querySelector("#smartVoiceCancelBtn")?.addEventListener("click", () => this._closeSmartVoiceConfirm());
    host.querySelector("#smartVoiceOtherBtn")?.addEventListener("click", () => this._chooseAnotherSmartVoiceCandidate());
    host.querySelector("#smartVoicePlayNowBtn")?.addEventListener("click", () => this._playSmartVoiceCandidateNow());
  }

  _openSmartVoiceConfirm(query = "", candidates = []) {
    if (!Array.isArray(candidates) || !candidates.length) {
      this._toastError(this._m("No matching content was found", "לא נמצא תוכן מתאים"));
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

  async _handleSmartVoiceTranscript(transcript = "") {
    const query = String(transcript || "").trim();
    if (!query) return;
    this._state.mediaQuery = query;
    const input = this.$("mobileMediaSearchInput");
    if (input) input.value = query;
    this._toast(this._m("Searching smart selection...", "מחפש בחירה חכמה..."));
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
      this._toastError(this._m("Voice search is not supported on this device", "חיפוש קולי לא נתמך במכשיר הזה"));
      return;
    }
    if (micMode === "off") {
      this._toastError(this._m("Microphone is disabled", "המיקרופון מנותק"));
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
    this._toast(this._m("Listening...", "מקשיב..."));
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
          this._toastError(error?.message || this._m("Voice search failed", "החיפוש הקולי נכשל"));
        });
        return;
      }
      clearTimeout(this._searchTimer);
      this._searchTimer = setTimeout(() => this._renderMobileMediaResults(), 120);
    };
    recognition.onerror = () => {
      this._toastError(this._m("Voice search failed", "החיפוש הקולי נכשל"));
    };
    recognition.onend = () => {
      micBtn?.classList.remove("listening");
      if (this._voiceRecognition === recognition) this._voiceRecognition = null;
    };
    try {
      recognition.start();
    } catch (_) {
      micBtn?.classList.remove("listening");
      this._toastError(this._m("Voice search failed", "החיפוש הקולי נכשל"));
    }
  }

  _mobileSortOptions() {
    return [
      { value: "name_asc", label: `${this._m("Ascending", "סדר עולה")} ↑` },
      { value: "name_desc", label: `${this._m("Descending", "סדר יורד")} ↓` },
      { value: "date_desc", label: this._m("Newest", "הכי חדש") },
      { value: "date_asc", label: this._m("Oldest", "הכי ישן") },
    ];
  }

  _itemDateValue(item = {}) {
    const candidates = [
      item.timestamp_added,
      item.added_at,
      item.created_at,
      item.modified_at,
      item.timestamp,
      item.updated_at,
      item.metadata?.timestamp_added,
      item.metadata?.added_at,
      item.metadata?.created_at,
      item.metadata?.updated_at,
      item.metadata?.release_date,
      item.metadata?.last_updated,
      item.provider_mappings?.[0]?.details,
      item.metadata?.last_refresh,
      item.year,
      item.metadata?.year,
      item.media_item?.year,
    ].filter((v) => v !== undefined && v !== null && v !== "");
    for (const value of candidates) {
      if (typeof value === "number") return value;
      const parsed = Date.parse(String(value));
      if (!Number.isNaN(parsed)) return parsed;
      const num = Number(value);
      if (Number.isFinite(num)) return num;
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

  _mediaLayoutToolbarHtml() {
    const layout = this._state.mobileMediaLayout || this._defaultMobileMediaLayout();
    const sort = this._state.mobileLibrarySort || "name_asc";
    const isSearch = this._state.menuPage === "library_search";
    return `
      <div class="media-toolbar">
        <div class="media-toolbar-left">
          <select class="media-sort-select" id="mobileLibrarySortSelect" aria-label="${this._esc(this._m("Sort", "מיון"))}">
            ${this._mobileSortOptions().map((opt) => `<option value="${this._esc(opt.value)}" ${opt.value === sort ? "selected" : ""}>${this._esc(opt.label)}</option>`).join("")}
          </select>
        </div>
        <div class="media-toolbar-right">
          <div class="media-layout-toggle" role="tablist" aria-label="${this._esc(this._m("Media layout", "תצוגת מדיה"))}">
            ${!isSearch ? `<button class="media-layout-btn subtle-heart ${this._state.menuPage === "library_liked" ? "active" : ""}" data-menu-nav="library_liked" title="${this._esc(this._m("Liked", "אהבתי"))}">${this._iconSvg("heart_filled")}</button>` : ``}
            ${!isSearch ? `<button class="media-layout-btn" data-media-surprise="1" title="${this._esc(this._m("Surprise me", "תפתיע אותי"))}">${this._iconSvg("wand")}</button>` : ``}
            <button class="media-layout-btn ${layout === "grid" ? "active" : ""}" data-media-layout="grid" title="${this._esc(this._m("Grid", "גריד"))}">${this._iconSvg("grid")}</button>
            <button class="media-layout-btn ${layout === "list" ? "active" : ""}" data-media-layout="list" title="${this._esc(this._m("List", "רשימה"))}">${this._iconSvg("list")}</button>
          </div>
        </div>
      </div>
    `;
  }

  _mediaItemsListHtml(items = [], mediaType, options = {}) {
    if (!items.length) return `<div class="notice open">${this._m("No results found", "לא נמצאו תוצאות")}</div>`;
    const layout = options.layout || this._state.mobileMediaLayout || this._defaultMobileMediaLayout();
    const iconMap = { track: "tracks", radio: "radio", album: "album", artist: "artist", podcast: "podcast", playlist: "playlist" };
    return `<div class="media-items-list layout-${this._esc(layout)}">${items.map((item) => {
      const art = this._artUrl(item);
      const sub = mediaType === "artist"
        ? this._m("Artist", "אמן")
        : mediaType === "radio"
          ? (item.metadata?.description || "")
          : this._artistName(item) || item.album?.name || item.publisher || "";
      return `
        <div class="menu-list-item media-entry ${this._esc(layout)}">
          <button class="media-entry-main" data-media-uri="${this._esc(item.uri || "")}" data-media-type="${this._esc(mediaType)}">
            <span class="menu-thumb">${art ? `<img src="${this._esc(art)}" alt="">` : this._iconSvg(iconMap[mediaType] || "repeat")}</span>
            <span style="min-width:0;flex:1;">
              <span class="menu-item-title">${this._esc(item.name || "")}</span>
              <span class="menu-item-sub">${this._esc(sub || "—")}</span>
            </span>
          </button>
          <button class="chip-btn queue-more-btn media-more-btn" data-media-more="${this._esc(item.uri || "")}" data-media-type="${this._esc(mediaType)}" data-media-name="${this._esc(item.name || "")}" data-media-artist="${this._esc(this._artistName(item) || "")}" data-media-album="${this._esc(item.album?.name || "")}" data-media-image="${this._esc(art || "")}" title="${this._esc(this._m("Actions", "פעולות"))}">${this._iconSvg("more")}</button>
        </div>
      `;
    }).join("")}</div>`;
  }

  _countryFlagEmoji(code = "") {
    const cc = String(code || "").trim().toUpperCase();
    if (!/^[A-Z]{2}$/.test(cc)) return "";
    return String.fromCodePoint(...[...cc].map((char) => 127397 + char.charCodeAt(0)));
  }

  _radioBrowserCountriesHtml(countries = []) {
    if (!countries.length) return `<div class="notice open">${this._m("No Radio Browser countries found", "לא נמצאו מדינות Radio Browser")}</div>`;
    return `<div class="media-items-list layout-list radio-country-list">${countries.map((country) => {
      const flag = this._countryFlagEmoji(country.code);
      return `
      <button class="menu-list-item media-entry list radio-country-entry" data-radio-country="${this._esc(country.code)}" data-radio-country-name="${this._esc(country.name)}">
        <span class="media-entry-main">
          <span class="menu-thumb flag-thumb">${flag ? `<span class="flag-emoji">${this._esc(flag)}</span>` : this._iconSvg("radio")}</span>
          <span style="min-width:0;flex:1;">
            <span class="menu-item-title">${this._esc(country.name)}</span>
            <span class="menu-item-sub">${this._esc(`${country.stationcount} ${this._m("stations", "תחנות")}`)}</span>
          </span>
        </span>
      </button>
    `;
    }).join("")}</div>`;
  }

  _radioBrowserCountryBackHtml(label = "") {
    return `
      <div class="radio-browser-country-head">
        <button class="media-layout-btn" data-radio-countries-back title="${this._esc(this._m("Back to countries", "חזרה למדינות"))}">${this._iconSvg("previous")}</button>
        <div class="media-section-title">${this._esc(label || this._m("Radio Browser", "Radio Browser"))}</div>
      </div>
    `;
  }

  _likedMediaEntriesHtml(entries = []) {
    if (!entries.length) return `<div class="notice open">${this._m("No liked media yet", "עדיין לא נשמרו מועדפים")}</div>`;
    const selectedSet = new Set(Array.isArray(this._state.likedSelectedUris) ? this._state.likedSelectedUris : []);
    const playableCount = this._likedPlayableEntries(entries, true).length;
    return `
      <div class="liked-toolbar">
        <button class="chip-btn" data-liked-play-all>${this._esc(this._m("Play all", "נגן הכל"))}</button>
        <button class="chip-btn" data-liked-selection-toggle>${this._esc(this._state.likedSelectionMode ? this._m("Cancel selection", "בטל בחירה") : this._m("Select", "בחירה"))}</button>
        ${this._state.likedSelectionMode ? `<button class="chip-btn accent" data-liked-play-selected>${this._esc(this._m("Play selected", "נגן נבחרים"))}${playableCount ? ` (${this._esc(String(playableCount))})` : ``}</button>` : ``}
      </div>
      <div class="media-items-list layout-list">${entries.map((entry) => {
        const uri = String(entry?.uri || "").trim();
        const checked = selectedSet.has(uri);
        return `
          <div class="menu-list-item media-entry list liked-entry" data-media-uri="${this._esc(uri)}" data-media-type="${this._esc(entry.media_type || "track")}">
            ${this._state.likedSelectionMode ? `<label class="liked-select-box ${checked ? "checked" : ""}"><input type="checkbox" data-liked-select-uri="${this._esc(uri)}" ${checked ? "checked" : ""}><span></span></label>` : ``}
            <span class="menu-thumb">${entry.image ? `<img src="${this._esc(entry.image)}" alt="">` : this._iconSvg(entry.media_type === "radio" ? "speaker" : entry.media_type === "artist" ? "speaker" : entry.media_type === "podcast" ? "speaker" : entry.media_type === "playlist" ? "repeat" : entry.media_type === "album" ? "repeat" : "next")}</span>
            <span style="min-width:0;flex:1;">
              <span class="menu-item-title">${this._esc(entry.name || "")}</span>
              <span class="menu-item-sub">${this._esc([entry.artist, entry.album].filter(Boolean).join(" · ") || "—")}</span>
            </span>
            <button class="chip-btn warn liked-remove-btn" data-liked-remove="${this._esc(uri)}" title="${this._esc(this._m("Remove from liked", "הסר מהמועדפים"))}">✕</button>
          </div>
        `;
      }).join("")}</div>
    `;
  }

  _mediaSearchSectionsHtml(results = {}) {
    const sections = [
      ["radio", this._m("Radio", "רדיו"), results.radio || []],
      ["playlists", this._m("Playlists", "פלייליסטים"), results.playlists || []],
      ["albums", this._m("Albums", "אלבומים"), results.albums || []],
      ["artists", this._m("Artists", "אמנים"), results.artists || []],
      ["tracks", this._m("Tracks", "שירים"), results.tracks || []],
      ["podcasts", this._m("Podcasts", "פודקאסטים"), results.podcasts || []],
    ];
    const used = sections.filter(([, , items]) => Array.isArray(items) && items.length);
    if (!used.length) return `<div class="notice open">${this._m("No results found", "לא נמצאו תוצאות")}</div>`;
    return `<div class="media-results">${used.map(([type, title, items]) => `
      <div>
        <div class="media-section-title">${this._esc(title)}</div>
        ${this._mediaItemsListHtml(items.slice(0, 8), type === "tracks" ? "track" : type === "playlists" ? "playlist" : type === "albums" ? "album" : type === "artists" ? "artist" : type === "podcasts" ? "podcast" : "radio", { layout: "list" })}
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
    if (!this._state.menuOpen || this._state.menuPage !== "library_search") return;
    const body = this.$("mobileMenuBody");
    const resultsHost = body?.querySelector("#mobileMediaSearchResults");
    const clearBtn = this.$("mobileMediaSearchClear");
    if (!resultsHost) return;
    const query = (this._state.mediaQuery || "").trim();
    if (clearBtn) clearBtn.style.display = query ? "" : "none";
    if (clearBtn) clearBtn.classList.toggle("visible", !!query);
    if (!query) {
      resultsHost.innerHTML = "";
      return;
    }
    const token = ++this._state.mediaSearchToken;
    resultsHost.innerHTML = `<div class="notice open">${this._m("Searching...", "מחפש...")}</div>`;
    const results = await this._search(query);
    if (!this._state.menuOpen || this._state.menuPage !== "library_search" || token !== this._state.mediaSearchToken) return;
    resultsHost.innerHTML = this._mediaSearchSectionsHtml(results);
  }

  _announcementsMenuHtml() {
    const text = this._state.mobileAnnouncementText || "";
    const presets = (this._state.mobileAnnouncementPresets || []).slice(0, 3);
    const targetValue = this._announcementTargetValue();
    const targetOptions = [
      ["all", this._m("Announce to all players", "כרוז לכולם")],
      ...this._announcementEligiblePlayers().map((player) => [player.entity_id, player.attributes?.friendly_name || player.entity_id]),
    ];
    return `
      <div class="announcements-shell">
        <div class="announcement-target">
          <span class="menu-title-icon">${this._iconSvg("speaker")}</span>
          <select class="media-sort-select announcement-target-select" id="mobileAnnouncementTargetSelect" aria-label="${this._esc(this._m("Announcement target", "יעד כריזה"))}">
            ${targetOptions.map(([value, label]) => `<option value="${this._esc(value)}" ${value === targetValue ? "selected" : ""}>${this._esc(label)}</option>`).join("")}
          </select>
        </div>
        <div class="announcement-input-wrap">
          <textarea id="mobileAnnouncementText" class="announcement-textarea" rows="4" placeholder="${this._esc(this._m("Type an announcement...", "הקלד הודעת כריזה..."))}">${this._esc(text)}</textarea>
          <button class="announcement-voice-btn" data-announcement-voice title="${this._esc(this._m("Dictate", "הכתבה קולית"))}">${this._iconSvg("mic")}</button>
        </div>
        <div class="announcement-presets">
          ${presets.map((preset, index) => preset ? `
            <button class="settings-pill" data-announcement-preset-fill="${this._esc(index)}">${this._esc(preset)}</button>
          ` : ``).join("")}
        </div>
        <button class="action-btn announcement-send-btn" data-announcement-send>
          ${this._iconSvg("announcement")}
          <span>${this._esc(this._m("Announce", "כרוז"))}</span>
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

  _announcementLanguageCode(text = "") {
    return /[\u0590-\u05FF]/.test(String(text || "")) ? "he-IL" : "en-US";
  }

  _preferredAnnouncementSayService(message = "") {
    const services = Object.keys(this._hass?.services?.tts || {});
    const hasHebrew = /[\u0590-\u05FF]/.test(String(message || ""));
    if (hasHebrew && services.includes("google_translate_say")) return "google_translate_say";
    return services.find((service) => service === "google_translate_say" || service.endsWith("_say")) || "";
  }

  async _sendMobileAnnouncement() {
    const message = String(this._state.mobileAnnouncementText || "").trim();
    const targetValue = this._announcementTargetValue();
    const eligiblePlayers = this._announcementEligiblePlayers();
    const targets = targetValue === "all"
      ? eligiblePlayers
      : eligiblePlayers.filter((player) => player.entity_id === targetValue);
    const isHebrewMessage = /[\u0590-\u05FF]/.test(message);
    if (!message) {
      this._toastError(this._m("Enter an announcement first", "קודם צריך להזין הודעת כריזה"));
      return;
    }
    if (!targets.length) {
      this._toastError(this._t("Select a player first"));
      return;
    }
    this._hapticTap([12, 24, 12]);
    const playerName = targetValue === "all"
      ? this._m("all players", "כל הנגנים")
      : (targets[0]?.attributes?.friendly_name || targets[0]?.entity_id || this._selectedPlayerName());
    const preview = message.length > 72 ? `${message.slice(0, 69)}...` : message;
    const language = this._announcementLanguageCode(message);
    this._toast(this._isHebrew()
      ? `כריזה אל ${playerName}: ${preview}`
      : `Announcement to ${playerName}: ${preview}`);
    try {
      const sayService = this._preferredAnnouncementSayService(message);
      const ttsEntity = this._announcementTtsEntity();
      for (const player of targets) {
        if (/^https?:\/\//i.test(message)) {
          await this._callHaServiceTargeted("music_assistant", "play_announcement", {
            entity_id: player.entity_id,
            url: message,
          }, { entity_id: player.entity_id });
          continue;
        }
        const trySpeak = async () => {
          const speakAttempts = /[\u0590-\u05FF]/.test(message)
            ? [
                { media_player_entity_id: player.entity_id, message, cache: false, language, options: { language } },
                { media_player_entity_id: player.entity_id, message, cache: false },
              ]
            : [
                { media_player_entity_id: player.entity_id, message, cache: false, language, options: { language } },
                { media_player_entity_id: player.entity_id, message, cache: false },
              ];
          let speakError = null;
          for (const payload of speakAttempts) {
            try {
              await this._callHaServiceTargeted("tts", "speak", payload, { entity_id: ttsEntity });
              return true;
            } catch (error) {
              speakError = error;
            }
          }
          if (speakError) throw speakError;
          return false;
        };
        if (isHebrewMessage && ttsEntity && this._hasService("tts", "speak")) {
          await trySpeak();
          continue;
        }
        if (sayService) {
          const sayAttempts = isHebrewMessage
            ? [
                { entity_id: player.entity_id, message, cache: false, language },
                { entity_id: player.entity_id, message, cache: false },
              ]
            : [
                { entity_id: player.entity_id, message, cache: false, language },
                { entity_id: player.entity_id, message, cache: false },
              ];
          let sayError = null;
          for (const payload of sayAttempts) {
            try {
              await this._callHaServiceTargeted("tts", sayService, payload, { entity_id: player.entity_id });
              sayError = null;
              break;
            } catch (error) {
              sayError = error;
            }
          }
          if (!sayError) continue;
          if (ttsEntity && this._hasService("tts", "speak")) {
            await trySpeak();
            continue;
          }
          throw sayError;
        } else if (ttsEntity && this._hasService("tts", "speak")) {
          await trySpeak();
        } else {
          throw new Error(this._m("No TTS service or entity is configured", "לא הוגדר שירות או ישות TTS"));
        }
      }
      this._toastSuccess(this._isHebrew()
        ? `הכריזה נשלחה אל ${playerName}`
        : `Announcement sent to ${playerName}`);
    } catch (error) {
      this._toastError(this._isHebrew()
        ? `הכריזה נכשלה${error?.message ? `: ${error.message}` : ""}`
        : `Announcement failed${error?.message ? `: ${error.message}` : ""}`);
    }
  }

  _startMobileAnnouncementVoice() {
    const SpeechRecognition = this._speechRecognitionCtor();
    const input = this.$("mobileAnnouncementText");
    if (!SpeechRecognition) {
      this._toastError(this._m("Voice input is not supported on this device", "הכתבה קולית לא נתמכת במכשיר הזה"));
      return;
    }
    try { this._voiceRecognition?.abort?.(); } catch (_) {}
    const recognition = new SpeechRecognition();
    this._voiceRecognition = recognition;
    recognition.lang = this._isHebrew() ? "he-IL" : "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;
    this._toast(this._m("Listening...", "מקשיב..."));
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results || [])
        .map((result) => result?.[0]?.transcript || "")
        .join(" ")
        .trim();
      if (!transcript) return;
      this._state.mobileAnnouncementText = transcript;
      if (input) {
        input.value = transcript;
        input.focus({ preventScroll: true });
      }
    };
    recognition.onerror = () => this._toastError(this._m("Voice input failed", "הכתבה קולית נכשלה"));
    recognition.onend = () => {
      if (this._voiceRecognition === recognition) this._voiceRecognition = null;
    };
    try { recognition.start(); } catch (_) { this._toastError(this._m("Voice input failed", "הכתבה קולית נכשלה")); }
  }

  _groupMenuHtml() {
    const players = this._getAvailableGroupPlayers();
    if (!players.length) return `<div class="notice open">${this._m("No extra MA players", "אין נגנים נוספים")}</div>`;
    const selected = this._getSelectedPlayer();
    const connectedNames = this._playerGroupMemberNames(selected);
    const groupCount = this._playerGroupCount(selected);
    const groupVol = this._groupAverageVolume(selected);
    const connectedRow = connectedNames.length > 1
      ? `<div class="group-connected-row"><span>${this._esc(this._m("Connected", "מחוברים"))}</span><strong>${this._esc(connectedNames.join(" · "))}</strong></div>`
      : "";
    return `
      ${connectedRow}
      ${groupCount ? `
        <div class="group-volume-card">
          <div class="group-volume-title">${this._esc(this._m("Group volume", "ווליום קבוצה"))}<span>${this._esc(String(groupCount))}</span></div>
          <div class="player-volume-row">
            <button class="player-mini-mute ${this._isGroupMuted(selected) ? "active" : ""}" data-group-mute="${this._esc(selected?.entity_id || "")}" title="${this._esc(this._t("Mute"))}">${this._iconSvg(this._isGroupMuted(selected) ? "volume_mute" : this._volumeIconName(selected))}</button>
            <input class="player-mini-volume" data-group-volume="${this._esc(selected?.entity_id || "")}" type="range" min="0" max="100" value="${groupVol}" style="--vol-pct:${groupVol}%">
          </div>
        </div>
      ` : ``}
      <div class="players-premium-grid">
      ${players.map((p) => {
        const checked = (this._state.pendingGroupSelections || []).includes(p.entity_id);
        const playerGroupCount = this._playerGroupCount(p);
        const vol = Math.round((p.attributes?.volume_level || 0) * 100);
        const art = p.attributes?.entity_picture_local || p.attributes?.entity_picture;
        const playing = p.state === "playing";
        return `
          <div class="group-player-card">
            <label class="group-player-row player-premium-head">
              <span class="player-premium-art">
                ${art ? `<img src="${this._esc(art)}" alt="">` : this._iconSvg("speaker")}
                ${playerGroupCount ? `<span class="player-group-badge">${this._esc(playerGroupCount)}</span>` : ``}
              </span>
              <span class="player-premium-copy">
                <span class="player-premium-name">${this._esc(p.attributes?.friendly_name || p.entity_id)}</span>
                <span class="player-premium-meta">
                  ${playing ? `<span class="player-premium-state"><span class="eq-icon" aria-hidden="true"><span></span><span></span><span></span></span><span>${this._esc(this._m("Playing", "מנגן"))}</span></span>` : ``}
                </span>
              </span>
              <input class="group-player-check" type="checkbox" data-menu-group-player="${this._esc(p.entity_id)}" ${checked ? "checked" : ""}>
            </label>
            <div class="player-volume-row group-inline-volume">
              <button class="player-mini-mute ${this._isMuted(p) ? "active" : ""}" data-player-mute="${this._esc(p.entity_id)}" title="${this._esc(this._t("Mute"))}">${this._iconSvg(this._volumeIconName(p))}</button>
              <input class="player-mini-volume" data-player-volume="${this._esc(p.entity_id)}" type="range" min="0" max="100" value="${vol}" style="--vol-pct:${vol}%">
            </div>
          </div>
        `;
      }).join("")}
      </div>
      <div class="group-actions">
        <button class="action-btn" data-menu-action="apply_group">${this._m("Apply Group", "חבר קבוצה")}</button>
        <button class="action-btn warn" data-menu-action="clear_group">${this._m("Ungroup", "נתק קבוצה")}</button>
      </div>
    `;
  }

  _queueMenuHtml() {
    const queueItems = this._getNowPlayingQueueItems();
    if (!queueItems.length) return `<div class="notice open">${this._m("Queue is empty", "התור ריק")}</div>`;
    const activelyPlaying = this._getSelectedPlayer()?.state === "playing";
    return `<div class="queue-list">${queueItems.map((item) => {
      const key = this._getQueueItemKey(item);
      const img = this._queueItemImageUrl(item, 120);
      const artist = item.media_item?.artists?.map((a) => a.name).join(", ") || "";
      const current = item.sort_index === (this._state.maQueueState?.current_index ?? -1);
      const media = item.media_item || {};
      const queueLead = current && activelyPlaying
        ? `<span class="queue-eq" aria-hidden="true"><span></span><span></span><span></span></span>`
        : (current ? "▶" : this._esc(item.sort_index ?? ""));
      return `
        <div class="queue-row ${current ? "active" : ""}" data-queue-item-id="${this._esc(key)}" data-uri="${this._esc(item.media_item?.uri || "")}" data-type="track" data-sort-index="${this._esc(item.sort_index ?? "")}">
          <div class="queue-index">${queueLead}</div>
          <div class="menu-thumb">${img ? `<img src="${this._esc(img)}" alt="">` : "♫"}</div>
          <div class="queue-meta">
            <div class="queue-title">${this._esc(item.media_item?.name || item.name || "")}</div>
            <div class="queue-sub">${this._esc(artist)}</div>
          </div>
          <div class="queue-actions">
            <button class="chip-btn queue-more-btn" data-queue-menu="${this._esc(key)}" data-queue-uri="${this._esc(media.uri || "")}" data-queue-name="${this._esc(media.name || item.name || "")}" data-queue-artist="${this._esc(artist)}" data-queue-album="${this._esc(media.album?.name || "")}" data-queue-image="${this._esc(img || media.image || media.album?.image || "")}" title="${this._esc(this._m("Actions", "פעולות"))}">${this._iconSvg("more")}</button>
          </div>
        </div>
      `;
    }).join("")}</div>`;
  }

  async _renderMobileMenu() {
    const body = this.$("mobileMenuBody");
    const title = this.$("mobileMenuTitle");
    const back = this.$("mobileMenuBackBtn");
    const aux = this.$("mobileMenuAuxBtn");
    const close = this.$("mobileMenuCloseBtn");
    if (!body || !title || !back || !aux || !close) return;
    const page = this._state.menuPage || "main";
    const closeOnlyPages = new Set(["main", "settings", "players", "players_active", "queue", "transfer", "group", "announcements"]);
    const isRootPage = closeOnlyPages.has(page) || page.startsWith("library_");
    back.hidden = isRootPage;
    aux.hidden = true;
    close.hidden = !isRootPage;
    body.classList.toggle("library-mode", page.startsWith("library_"));
    body.classList.toggle("search-mode", page === "library_search");
    this.$("mobileMenu")?.classList.toggle("search-open", page === "library_search");
    const menu = this.$("mobileMenu");
    const sheet = menu?.querySelector(".menu-sheet");
    const sheetClasses = [
      "sheet-actions",
      "sheet-players",
      "sheet-queue",
      "sheet-library",
      "sheet-search",
      "sheet-group",
      "sheet-transfer",
      "sheet-announcements",
      "sheet-settings",
    ];
    body.classList.remove(...sheetClasses);
    sheet?.classList.remove(...sheetClasses);
    const sheetClass =
      page === "main"
        ? "sheet-actions"
        : page === "players" || page === "players_active"
          ? "sheet-players"
          : page === "queue"
            ? "sheet-queue"
            : page === "library_search"
              ? "sheet-search"
              : page.startsWith("library_")
                ? "sheet-library"
                : page === "group"
                  ? "sheet-group"
                  : page === "transfer"
                    ? "sheet-transfer"
                    : page === "announcements"
                      ? "sheet-announcements"
                      : page === "settings"
                        ? "sheet-settings"
                        : "";
    if (sheetClass) {
      body.classList.add(sheetClass);
      sheet?.classList.add(sheetClass);
    }

    if (page === "main") {
      this._setMobileMenuHeader(this._m("Actions", "פעולות"), this._menuPageIcon(page));
      body.innerHTML = this._mainMenuHtml();
      return;
    }
    if (page === "settings") {
      this._setMobileMenuHeader(this._m("Settings", "הגדרות"), this._menuPageIcon(page));
      body.innerHTML = this._settingsMenuHtml();
      return;
    }
    if (page.startsWith("library_")) {
      const meta = this._libraryTabMeta(page);
      this._setMobileMenuHeader(meta.title, meta.icon, "players");
      if (page === "library_liked") {
        if (this._useMaLikedMode()) await this._loadMaLikedEntries(true);
        const likedEntries = this._likedEntries();
        const likedUriSet = new Set(likedEntries.map((entry) => String(entry?.uri || "").trim()).filter(Boolean));
        this._state.likedSelectedUris = (Array.isArray(this._state.likedSelectedUris) ? this._state.likedSelectedUris : []).filter((uri) => likedUriSet.has(String(uri || "").trim()));
        body.innerHTML = this._libraryShellHtml(this._likedMediaEntriesHtml(likedEntries), page);
        return;
      }
      if (page === "library_search") {
        body.innerHTML = this._libraryShellHtml(this._librarySearchHomeHtml(), page);
        this._bindMobileMediaSearch();
        await this._renderMobileMediaResults();
        return;
      }
      body.innerHTML = `<div class="notice open">${this._m("Loading...", "טוען...")}</div>`;
      const limitMap = { playlist: 250, artist: 250, album: 250, track: 350, radio: 200, podcast: 250 };
      const items = await this._getLibrary(meta.type, this._mobileLibraryOrderBy(), limitMap[meta.type] || 250);
      if (!this._state.menuOpen || this._state.menuPage !== page) return;
      const sortedItems = this._sortLibraryItemsLocally(items);
      let content = `${this._mediaLayoutToolbarHtml()}${this._mediaItemsListHtml(sortedItems, meta.type)}`;
      if (page === "library_radio") {
        try {
          const configuredCountry = this._mobileRadioBrowserCountry();
          const browseCountry = this._state.mobileRadioBrowseCountry || (configuredCountry === "all" ? "" : configuredCountry);
          const browseLabel = this._radioBrowserCountryLabel(browseCountry);
          if (browseCountry) {
            const browserStations = await this._fetchRadioBrowserStations("", 80, { countryCode: browseCountry });
            if (this._state.menuOpen && this._state.menuPage === page) {
              content = `
                ${this._mediaLayoutToolbarHtml()}
                <div class="media-results">
                  <div>
                    <div class="media-section-title">Music Assistant</div>
                    ${this._mediaItemsListHtml(sortedItems, meta.type)}
                  </div>
                  <div>
                    ${configuredCountry === "all" ? this._radioBrowserCountryBackHtml(browseLabel) : `<div class="media-section-title">Radio Browser · ${this._esc(browseLabel)}</div>`}
                    ${this._mediaItemsListHtml(browserStations, meta.type)}
                  </div>
                </div>
              `;
            }
          } else {
            const [countries, browserStations] = await Promise.all([
              this._fetchRadioBrowserCountries(260),
              this._fetchRadioBrowserStations("", 40, { countryCode: "all" }),
            ]);
            if (this._state.menuOpen && this._state.menuPage === page) {
              content = `
                ${this._mediaLayoutToolbarHtml()}
                <div class="media-results">
                  <div>
                    <div class="media-section-title">Music Assistant</div>
                    ${this._mediaItemsListHtml(sortedItems, meta.type)}
                  </div>
                  <div>
                    <div class="media-section-title">${this._esc(this._m("Radio Browser countries", "מדינות Radio Browser"))}</div>
                    ${this._radioBrowserCountriesHtml(countries)}
                  </div>
                  <div>
                    <div class="media-section-title">${this._esc(this._m("Worldwide popular", "פופולרי בעולם"))}</div>
                    ${this._mediaItemsListHtml(browserStations, meta.type)}
                  </div>
                </div>
              `;
            }
          }
        } catch (_) {}
      }
      body.innerHTML = this._libraryShellHtml(content, page);
      return;
    }
    aux.hidden = true;

    const titles = {
      queue: this._m("Queue", "תור"),
      players: this._m("Players", "נגנים"),
      players_active: this._m("Active Players", "נגנים פעילים"),
      transfer: this._m("Transfer Queue", "העבר תור"),
      group: this._m("Group Speakers", "קבוצת נגנים"),
      announcements: this._m("Announcements", "כריזה"),
      ungroup_all: this._m("Disconnect player groups", "נתק קבוצות נגנים"),
      stop_all: this._m("Stop all players", "עצור את כל הנגנים"),
    };
    this._setMobileMenuHeader(titles[page] || this._m("Menu", "תפריט"), this._menuPageIcon(page));
    if (page === "queue") {
      body.innerHTML = `<div class="notice open">${this._m("Loading...", "טוען...")}</div>`;
      await this._ensureQueueSnapshot(true);
      if (!this._state.menuOpen || this._state.menuPage !== "queue") return;
      const queueCount = this._getNowPlayingQueueItems().length;
      body.innerHTML = `
        <div class="queue-page-head">
          <div class="queue-page-head-title">${this._esc(this._m("Queue", "תור"))}</div>
          <button class="queue-head-transfer-btn" data-menu-nav="transfer" title="${this._esc(this._m("Transfer queue", "העבר תור"))}">
            ${this._iconSvg("repeat")}
            <span class="queue-head-transfer-count">${this._esc(String(queueCount))}</span>
          </button>
        </div>
        ${this._queueMenuHtml()}
      `;
      return;
    }
    if (page === "players") body.innerHTML = this._playersMenuHtml();
    else if (page === "players_active") body.innerHTML = this._playersMenuHtml({ activeOnly: true });
    else if (page === "transfer") body.innerHTML = this._transferMenuHtml();
    else if (page === "group") body.innerHTML = this._groupMenuHtml();
    else if (page === "announcements") body.innerHTML = this._announcementsMenuHtml();
    else if (page === "ungroup_all") {
      body.innerHTML = `<div class="notice open">${this._m("Disconnecting player groups...", "מנתק קבוצות נגנים...")}</div>`;
      await this._ungroupAllPlayers();
      this._closeMobileMenu();
    }
    else if (page === "stop_all") {
      body.innerHTML = `<div class="notice open">${this._m("Stop all players", "עצור את כל הנגנים")}</div>`;
      await this._stopAllPlayers();
      this._closeMobileMenu();
    }
  }

  async _handleMobileMenuClick(e) {
    const announcementPresetBtn = e.target.closest("[data-announcement-preset-fill]");
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
    const announcementVoiceBtn = e.target.closest("[data-announcement-voice]");
    if (announcementVoiceBtn) {
      e.preventDefault();
      e.stopPropagation();
      this._flashInteraction(announcementVoiceBtn);
      this._startMobileAnnouncementVoice();
      return;
    }
    const announcementSendBtn = e.target.closest("[data-announcement-send]");
    if (announcementSendBtn) {
      e.preventDefault();
      e.stopPropagation();
      this._flashInteraction(announcementSendBtn);
      await this._sendMobileAnnouncement();
      return;
    }
    const volumePresetBtn = e.target.closest("[data-volume-preset]");
    if (volumePresetBtn) {
      const pct = Math.max(0, Math.min(100, Number(volumePresetBtn.dataset.volumePreset) || 0));
      this._setVolume(pct / 100);
      this._closeMobileVolumePresets();
      setTimeout(() => this._syncNowPlayingUI(), 120);
      return;
    }
    const likedSelectBox = e.target.closest(".liked-select-box");
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
    const likedPlayAllBtn = e.target.closest("[data-liked-play-all]");
    if (likedPlayAllBtn) {
      e.preventDefault();
      e.stopPropagation();
      this._flashInteraction(likedPlayAllBtn);
      const playable = this._likedPlayableEntries(this._likedEntries(), false);
      if (!playable.length) {
        this._toastError(this._m("No liked tracks to play", "אין שירים מועדפים לנגן"));
        return;
      }
      await this._playAll(playable, false);
      this._closeMobileMenu();
      return;
    }
    const likedSelectionToggleBtn = e.target.closest("[data-liked-selection-toggle]");
    if (likedSelectionToggleBtn) {
      e.preventDefault();
      e.stopPropagation();
      this._flashInteraction(likedSelectionToggleBtn);
      this._state.likedSelectionMode = !this._state.likedSelectionMode;
      if (!this._state.likedSelectionMode) this._state.likedSelectedUris = [];
      await this._renderMobileMenu();
      return;
    }
    const likedPlaySelectedBtn = e.target.closest("[data-liked-play-selected]");
    if (likedPlaySelectedBtn) {
      e.preventDefault();
      e.stopPropagation();
      this._flashInteraction(likedPlaySelectedBtn);
      const playable = this._likedPlayableEntries(this._likedEntries(), true);
      if (!playable.length) {
        this._toastError(this._m("No selected tracks to play", "אין שירים נבחרים לנגן"));
        return;
      }
      await this._playAll(playable, false);
      this._state.likedSelectionMode = false;
      this._state.likedSelectedUris = [];
      this._closeMobileMenu();
      return;
    }
    const likedRemoveBtn = e.target.closest("[data-liked-remove]");
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
    const queueAction = e.target.closest("[data-queue-action]");
    if (queueAction) {
      e.preventDefault();
      e.stopPropagation();
      await this._handleQueueAction(queueAction.dataset.queueAction, queueAction.dataset.queueItemId);
      await this._renderMobileMenu();
      return;
    }
    const action = e.target.closest("[data-menu-action]");
    if (action) {
      this._flashInteraction(action);
      if (action.dataset.menuAction === "open_app") return this._openMusicAssistant();
      if (action.dataset.menuAction === "toggle_lang") return this._toggleLanguage();
      if (action.dataset.menuAction === "toggle_theme") return this._toggleCardTheme();
      if (action.dataset.menuAction === "apply_group") {
        await this._applySpeakerGroup();
        return this._closeMobileMenu();
      }
      if (action.dataset.menuAction === "clear_group") {
        await this._clearSpeakerGroup();
        return this._closeMobileMenu();
      }
    }
    const playerMuteBtn = e.target.closest("[data-player-mute]");
    if (playerMuteBtn?.dataset.playerMute) {
      e.preventDefault();
      e.stopPropagation();
      await this._toggleMuteFor(playerMuteBtn.dataset.playerMute);
      return;
    }
    const playerFavoriteBtn = e.target.closest("[data-player-favorite]");
    if (playerFavoriteBtn?.dataset.playerFavorite) {
      e.preventDefault();
      e.stopPropagation();
      this._flashInteraction(playerFavoriteBtn);
      try {
        await this._pressFavoriteButtonEntity(playerFavoriteBtn.dataset.playerFavorite);
        this._toastSuccess(this._m("Favorite action sent", "פעולת אהבתי נשלחה"));
        [300, 900, 1800].forEach((delay) => setTimeout(() => this._refreshFavoriteState(true).catch(() => {}), delay));
      } catch (error) {
        this._toastError(this._m("Favorite action failed", "פעולת אהבתי נכשלה") + (error?.message ? `: ${error.message}` : ""));
      }
      return;
    }
    const groupMuteBtn = e.target.closest("[data-group-mute]");
    if (groupMuteBtn?.dataset.groupMute) {
      e.preventDefault();
      e.stopPropagation();
      await this._toggleGroupMuteFor(groupMuteBtn.dataset.groupMute);
      return;
    }
    const langBtn = e.target.closest("[data-setting-lang]");
    if (langBtn?.dataset.settingLang) {
      this._state.lang = langBtn.dataset.settingLang;
      try { localStorage.setItem("ma_browser_card_lang", this._state.lang); } catch (_) {}
      this._build();
      this._init();
      this._openMobileMenu("settings");
      return;
    }
    const themeBtn = e.target.closest("[data-setting-theme]");
    if (themeBtn?.dataset.settingTheme) {
      this._state.cardTheme = themeBtn.dataset.settingTheme;
      try { localStorage.setItem("ma_browser_card_theme", this._state.cardTheme); } catch (_) {}
      this._persistMobileAppearance();
      this._build();
      this._init();
      this._openMobileMenu("settings");
      return;
    }
    const dynamicThemeBtn = e.target.closest("[data-setting-dynamic-theme]");
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
      this._openMobileMenu("settings");
      return;
    }
    const backgroundMotionBtn = e.target.closest("[data-setting-background-motion]");
    if (backgroundMotionBtn?.dataset.settingBackgroundMotion) {
      this._flashInteraction(backgroundMotionBtn);
      this._state.mobileBackgroundMotionMode = ["off", "subtle", "strong"].includes(backgroundMotionBtn.dataset.settingBackgroundMotion)
        ? backgroundMotionBtn.dataset.settingBackgroundMotion
        : "subtle";
      this._persistMobileAppearance();
      this._applyBackgroundMotionStyles();
      this._openMobileMenu("settings");
      return;
    }
    const nightModeBtn = e.target.closest("[data-setting-night-mode]");
    if (nightModeBtn?.dataset.settingNightMode) {
      this._flashInteraction(nightModeBtn);
      this._state.mobileNightMode = ["off", "auto", "on"].includes(nightModeBtn.dataset.settingNightMode)
        ? nightModeBtn.dataset.settingNightMode
        : "auto";
      this._persistMobileAppearance();
      this._build();
      this._init();
      this._openMobileMenu("settings");
      return;
    }
    const nightWindowSaveBtn = e.target.closest("[data-setting-night-window-save]");
    if (nightWindowSaveBtn) {
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
      this._toastSuccess(this._m("Night schedule updated", "לוח הזמנים של מצב לילה עודכן"));
      this._build();
      this._init();
      this._openMobileMenu("settings");
      return;
    }
    const sleepTimerBtn = e.target.closest("[data-setting-sleep-timer]");
    if (sleepTimerBtn) {
      this._flashInteraction(sleepTimerBtn);
      this._cycleSleepTimer();
      this._openMobileMenu("settings");
      return;
    }
    const sleepClearBtn = e.target.closest("[data-setting-sleep-clear]");
    if (sleepClearBtn) {
      this._flashInteraction(sleepClearBtn);
      this._clearSleepTimer(true);
      this._openMobileMenu("settings");
      return;
    }
    const compactModeBtn = e.target.closest("[data-setting-compact-mode]");
    if (compactModeBtn?.dataset.settingCompactMode) {
      this._flashInteraction(compactModeBtn);
      this._state.mobileCompactMode = compactModeBtn.dataset.settingCompactMode === "on";
      this._state.mobileCompactExpanded = false;
      this._persistMobileAppearance();
      this._build();
      this._init();
      this._openMobileMenu("settings");
      return;
    }
    const showUpNextBtn = e.target.closest("[data-setting-show-up-next]");
    if (showUpNextBtn?.dataset.settingShowUpNext) {
      this._flashInteraction(showUpNextBtn);
      this._state.mobileShowUpNext = showUpNextBtn.dataset.settingShowUpNext === "on";
      this._persistMobileAppearance();
      this._syncMobileUpNextUi(this._mobileUpNextItem());
      this._openMobileMenu("settings");
      return;
    }
    const swipeModeBtn = e.target.closest("[data-setting-swipe-mode]");
    if (swipeModeBtn?.dataset.settingSwipeMode) {
      this._flashInteraction(swipeModeBtn);
      this._state.mobileSwipeMode = swipeModeBtn.dataset.settingSwipeMode === "browse" ? "browse" : "play";
      this._state.mobileArtBrowseOffset = 0;
      this._persistMobileAppearance();
      this._build();
      this._init();
      this._openMobileMenu("settings");
      return;
    }
    const footerSearchBtn = e.target.closest("[data-setting-footer-search]");
    if (footerSearchBtn?.dataset.settingFooterSearch) {
      this._flashInteraction(footerSearchBtn);
      this._state.mobileFooterSearchEnabled = footerSearchBtn.dataset.settingFooterSearch === "on";
      this._persistMobileAppearance();
      this._build();
      this._init();
      this._openMobileMenu("settings");
      return;
    }
    const homeShortcutBtn = e.target.closest("[data-setting-home-shortcut]");
    if (homeShortcutBtn?.dataset.settingHomeShortcut) {
      this._flashInteraction(homeShortcutBtn);
      this._state.mobileHomeShortcutEnabled = homeShortcutBtn.dataset.settingHomeShortcut === "on";
      this._persistMobileAppearance();
      this._build();
      this._init();
      this._openMobileMenu("settings");
      return;
    }
    const micModeBtn = e.target.closest("[data-setting-mic-mode]");
    if (micModeBtn?.dataset.settingMicMode) {
      this._flashInteraction(micModeBtn);
      this._state.mobileMicMode = micModeBtn.dataset.settingMicMode;
      this._persistMobileAppearance();
      this._build();
      this._init();
      this._openMobileMenu("settings");
      return;
    }
    const footerModeBtn = e.target.closest("[data-setting-footer-mode]");
    if (footerModeBtn?.dataset.settingFooterMode) {
      this._flashInteraction(footerModeBtn);
      this._state.mobileFooterMode = footerModeBtn.dataset.settingFooterMode;
      this._persistMobileAppearance();
      this._build();
      this._init();
      this._openMobileMenu("settings");
      return;
    }
    const volumeModeBtn = e.target.closest("[data-setting-volume-mode]");
    if (volumeModeBtn?.dataset.settingVolumeMode) {
      this._flashInteraction(volumeModeBtn);
      this._state.mobileVolumeMode = volumeModeBtn.dataset.settingVolumeMode === "always" ? "always" : "button";
      this._persistMobileAppearance();
      this._build();
      this._init();
      this._openMobileMenu("settings");
      return;
    }
    const likedModeBtn = e.target.closest("[data-setting-liked-mode]");
    if (likedModeBtn?.dataset.settingLikedMode) {
      this._flashInteraction(likedModeBtn);
      this._state.mobileLikedMode = likedModeBtn.dataset.settingLikedMode;
      this._persistMobileAppearance();
      this._cache.library.delete("liked:ma");
      this._build();
      this._init();
      this._openMobileMenu("settings");
      return;
    }
    const mediaLayoutBtn = e.target.closest("[data-media-layout]");
    if (mediaLayoutBtn?.dataset.mediaLayout) {
      this._flashInteraction(mediaLayoutBtn);
      this._state.mobileMediaLayout = mediaLayoutBtn.dataset.mediaLayout === "grid" ? "grid" : "list";
      await this._renderMobileMenu();
      return;
    }
    const mediaSurpriseBtn = e.target.closest("[data-media-surprise]");
    if (mediaSurpriseBtn) {
      this._flashInteraction(mediaSurpriseBtn);
      await this._playRandomFromPlaylists();
      return;
    }
    const radioBackBtn = e.target.closest("[data-radio-countries-back]");
    if (radioBackBtn) {
      e.preventDefault();
      e.stopPropagation();
      this._flashInteraction(radioBackBtn);
      this._state.mobileRadioBrowseCountry = "";
      this._state.mobileRadioBrowseCountryName = "";
      await this._renderMobileMenu();
      return;
    }
    const radioCountryBtn = e.target.closest("[data-radio-country]");
    if (radioCountryBtn?.dataset.radioCountry) {
      e.preventDefault();
      e.stopPropagation();
      this._flashInteraction(radioCountryBtn);
      this._hapticTap([8]);
      this._state.mobileRadioBrowseCountry = radioCountryBtn.dataset.radioCountry;
      this._state.mobileRadioBrowseCountryName = radioCountryBtn.dataset.radioCountryName || radioCountryBtn.dataset.radioCountry;
      await this._renderMobileMenu();
      return;
    }
    const nav = e.target.closest("[data-menu-nav]");
    if (nav) {
      nav.classList.add("tap-feedback");
      setTimeout(() => nav.classList.remove("tap-feedback"), 180);
      return this._pushMobileMenu(nav.dataset.menuNav);
    }
    if (this._state.menuPage === "library_liked" && this._state.likedSelectionMode && e.target.closest("[data-media-uri]") && !e.target.closest(".liked-select-box")) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    const mediaBtn = e.target.closest("[data-media-uri]");
    if (mediaBtn?.dataset.mediaUri) {
      const label = mediaBtn.querySelector(".menu-item-title")?.textContent?.trim() || "";
      await this._playMedia(mediaBtn.dataset.mediaUri, mediaBtn.dataset.mediaType || "album", "play", {
        label,
        sourceEl: mediaBtn,
        forceRadioHero: this._state.menuPage === "library_radio",
      });
      return this._closeMobileMenu();
    }
    const mediaMoreBtn = e.target.closest("[data-media-more]");
    if (mediaMoreBtn) {
      e.preventDefault();
      e.stopPropagation();
      this._flashInteraction(mediaMoreBtn);
      this._hapticTap([10]);
      this._openMobileMediaActionMenu({
        uri: mediaMoreBtn.dataset.mediaMore,
        media_type: mediaMoreBtn.dataset.mediaType || "album",
        name: mediaMoreBtn.dataset.mediaName || "",
        artist: mediaMoreBtn.dataset.mediaArtist || "",
        album: mediaMoreBtn.dataset.mediaAlbum || "",
        image: mediaMoreBtn.dataset.mediaImage || "",
      });
      return;
    }
    const playerBtn = e.target.closest("[data-menu-player]");
    if (playerBtn) {
      if (this._hasPinnedPlayer()) {
        this._toast(this._m("Player is pinned from settings", "הנגן מקובע מתוך ההגדרות"));
        return;
      }
      this._selectPlayer(playerBtn.dataset.menuPlayer, true);
      this._toast(this._m("Player selected", "הנגן נבחר"));
      const previousPage = this._state.menuStack[this._state.menuStack.length - 1];
      if (String(previousPage || "").startsWith("library_")) {
        this._state.menuPage = this._state.menuStack.pop();
        await this._renderMobileMenu();
        return;
      }
      return this._closeMobileMenu();
    }
    const queueMenuBtn = e.target.closest("[data-queue-menu]");
    if (queueMenuBtn) {
      e.preventDefault();
      e.stopPropagation();
      const anchorRect = queueMenuBtn.getBoundingClientRect();
      this._openMobileQueueActionMenu({
        queue_item_id: queueMenuBtn.dataset.queueMenu,
        uri: queueMenuBtn.dataset.queueUri,
        media_type: "track",
        name: queueMenuBtn.dataset.queueName,
        artist: queueMenuBtn.dataset.queueArtist,
        album: queueMenuBtn.dataset.queueAlbum,
        image: queueMenuBtn.dataset.queueImage,
        anchorRect,
      });
      return;
    }
    const transferBtn = e.target.closest("[data-menu-transfer]");
    if (transferBtn) {
      await this._transferQueueTo(transferBtn.dataset.menuTransfer);
      return this._closeMobileMenu();
    }
    const queueRow = e.target.closest(".queue-row");
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

  _handleMobileMenuChange(e) {
    if (e.target?.id === "mobileAnnouncementText") {
      this._state.mobileAnnouncementText = e.target.value || "";
      return;
    }
    if (e.target?.id === "mobileAnnouncementTargetSelect") {
      this._state.mobileAnnouncementTarget = e.target.value || "";
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
    const checkbox = e.target.closest("input[data-menu-group-player]");
    if (checkbox) {
      const entityId = checkbox.dataset.menuGroupPlayer;
      const next = new Set(this._state.pendingGroupSelections || []);
      if (checkbox.checked) next.add(entityId); else next.delete(entityId);
      this._state.pendingGroupSelections = Array.from(next);
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
      this._state.mobileFontScale = Number(e.target.value || 1) || 1;
      this._persistMobileAppearance();
      this._build();
      this._init();
      this._openMobileMenu("settings");
      return;
    }
    if (e.target?.id === "mobileNightStartInput" || e.target?.id === "mobileNightEndInput") {
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
      try { localStorage.setItem("ma_browser_card_mobile_library_sort", this._state.mobileLibrarySort); } catch (_) {}
      this._cache.library.clear();
      this._renderMobileMenu();
      return;
    }
    if (e.target?.id === "mobileRadioCountrySelect") {
      this._state.mobileRadioBrowserCountry = e.target.value || "all";
      this._state.mobileRadioBrowseCountry = "";
      this._state.mobileRadioBrowseCountryName = "";
      this._persistMobileAppearance();
      this._cache.library.delete("radio-browser:countries");
      this._openMobileMenu("settings");
      return;
    }
    if (e.target?.id === "mobilePinnedPlayerSelect") {
      this._state.pinnedPlayerEntity = e.target.value || "";
      this._persistMobileAppearance();
      this._loadPlayers();
      this._build();
      this._init();
      this._openMobileMenu("settings");
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
      this._openMobileMenu("settings");
      return;
    }
    const mainBarCheckbox = e.target?.closest?.("input[data-setting-main-bar-item]");
    if (mainBarCheckbox) {
      const item = mainBarCheckbox.dataset.settingMainBarItem;
      const current = new Set(this._mobileMainBarItems());
      if (mainBarCheckbox.checked) current.add(item); else current.delete(item);
      const next = Array.from(current);
      this._state.mobileMainBarItems = next.length ? next : this._defaultMobileMainBarItems();
      this._persistMobileAppearance();
      this._build();
      this._openMobileMenu("settings");
      return;
    }
  }

  async _handleMobileMediaInput(e) {
    this._state.mediaQuery = e.target.value || "";
    clearTimeout(this._searchTimer);
    this._searchTimer = setTimeout(() => {
      if (this._state.menuOpen && this._state.menuPage === "library_search") this._renderMobileMediaResults();
    }, 220);
  }
}

class MABrowserCardMobileEditor extends MABrowserCardEditor {
  constructor() {
    super();
    this._config = { ...MABrowserCardMobile.getStubConfig(), type: "custom:homeii-music-flow" };
  }

  setConfig(config) {
    this._config = {
      ...MABrowserCardMobile.getStubConfig(),
      ...config,
      type: "custom:homeii-music-flow",
    };
    this._render();
  }
}

class HomeiiMusicFlowCard extends MABrowserCardMobile {}
class HomeiiMusicMobileCard extends MABrowserCardMobile {}
class HomeiiMusicFlowEditor extends MABrowserCardMobileEditor {}
class HomeiiMusicMobileEditor extends MABrowserCardMobileEditor {}

if (!customElements.get("ma-browser-card-mobile")) {
  customElements.define("ma-browser-card-mobile", MABrowserCardMobile);
}

if (!customElements.get("homeii-music-flow")) {
  customElements.define("homeii-music-flow", HomeiiMusicFlowCard);
}

if (!customElements.get("homeii-music-mobile")) {
  customElements.define("homeii-music-mobile", HomeiiMusicMobileCard);
}

if (!customElements.get("ma-browser-card-mobile-editor")) {
  customElements.define("ma-browser-card-mobile-editor", MABrowserCardMobileEditor);
}

if (!customElements.get(HOMEII_MOBILE_EDITOR_TAG)) {
  customElements.define(HOMEII_MOBILE_EDITOR_TAG, MABrowserCardMobileEditor);
}

if (!customElements.get("homeii-music-flow-editor")) {
  customElements.define("homeii-music-flow-editor", HomeiiMusicFlowEditor);
}

if (!customElements.get("homeii-music-mobile-editor")) {
  customElements.define("homeii-music-mobile-editor", HomeiiMusicMobileEditor);
}

if (!window.customCards.some((c) => c.type === "custom:homeii-music-flow")) {
  window.customCards.push({
    type: "custom:homeii-music-flow",
    name: "homeii-music-flow",
    description: `Luxury mobile Music Assistant flow with premium compact tile v${HOMEII_CARD_VERSION}`,
    preview: true,
  });
}


