import { afterAll, beforeAll, describe, expect, it } from "vitest";

let HomeiiMusicFlowCard;
const originalGlobals = {
  customElements: globalThis.customElements,
  HTMLElement: globalThis.HTMLElement,
  window: globalThis.window,
};

beforeAll(async () => {
  const realSetTimeout = globalThis.setTimeout;
  globalThis.window = { customCards: [] };
  globalThis.HTMLElement = class {
    attachShadow() {
      const root = {
        addEventListener() {},
        getElementById() { return null; },
        querySelector() { return null; },
        querySelectorAll() { return []; },
      };
      this.shadowRoot = root;
      return root;
    }
  };
  globalThis.customElements = {
    registry: new Map(),
    define(name, ctor) { this.registry.set(name, ctor); },
    get(name) { return this.registry.get(name); },
  };
  globalThis.setTimeout = () => 0;
  try {
    await import("../src/homeii-music-flow.js");
  } finally {
    globalThis.setTimeout = realSetTimeout;
  }
  HomeiiMusicFlowCard = globalThis.customElements.get("homeii-music-flow");
});

afterAll(() => {
  globalThis.customElements = originalGlobals.customElements;
  globalThis.HTMLElement = originalGlobals.HTMLElement;
  globalThis.window = originalGlobals.window;
});

function createCard() {
  const card = new HomeiiMusicFlowCard();
  card._artistName = (item = {}) =>
    (Array.isArray(item.artists) ? item.artists.map((artist) => artist?.name).filter(Boolean).join(", ") : "")
    || item.artist
    || "";
  card._artUrl = () => "";
  return card;
}

describe("Hebrew command routing", () => {
  it.each([
    ["השיר הבא", "next"], ["הרצועה הקודמת", "previous"],
    ["השהה", "pause"], ["עצור", "stop"], ["המשך לנגן", "resume"],
  ])("routes %s to %s", (text, type) => {
    const card = createCard();
    card._voiceAssistantMentionedPlayers = () => [];
    expect(card._voiceAssistantCommandIntent(text).type).toBe(type);
  });
  it("recognizes a Hebrew queue transfer without changing player order", () => {
    const card = createCard();
    card._voiceAssistantMentionedPlayers = () => [{ entity_id: "media_player.computer" }, { entity_id: "media_player.kitchen" }];
    expect(card._voiceAssistantQueueIntent("העבר את התור מ־Computer אל Kitchen")).toEqual({ type: "queue_transfer", sourcePlayerId: "media_player.computer", targetPlayerId: "media_player.kitchen" });
  });
  it("recognizes explicit Hebrew group disconnection", () => {
    const card = createCard();
    card._voiceAssistantMentionedPlayers = () => [];
    expect(card._voiceAssistantSpeakerGroupIntent("נתק את כל הרמקולים")).toEqual({ type: "group_disconnect_all" });
  });
});

describe.skip("legacy frontend Music Assistant player filtering", () => {
  it("does not fall back to generic Home Assistant media players", () => {
    const card = createCard();
    const genericPlayer = {
      entity_id: "media_player.tv",
      state: "idle",
      attributes: { friendly_name: "TV" },
    };
    const musicAssistantPlayer = {
      entity_id: "media_player.ma_living_room",
      state: "idle",
      attributes: { friendly_name: "MA Living Room", app_id: "music_assistant" },
    };
    card._hass = {
      states: {
        [genericPlayer.entity_id]: genericPlayer,
        [musicAssistantPlayer.entity_id]: musicAssistantPlayer,
      },
    };
    card._state.players = [];
    card._directMaPlayers = [];

    expect(card._playerByEntityId(genericPlayer.entity_id)).toBe(null);
    expect(card._playerByEntityId(musicAssistantPlayer.entity_id)).toBe(musicAssistantPlayer);
  });

  it("clears stale selections when no Music Assistant players are available", () => {
    const card = createCard();
    card._hass = {
      states: {
        "media_player.tv": {
          entity_id: "media_player.tv",
          state: "idle",
          attributes: { friendly_name: "TV" },
        },
      },
    };
    card._state.selectedPlayer = "media_player.tv";
    card._state.hasAutoSelectedPlayer = true;

    card._loadPlayers();

    expect(card._state.players).toEqual([]);
    expect(card._state.selectedPlayer).toBe(null);
    expect(card._state.musicAssistantIssueMessage).toContain("Music Assistant");
  });

  it("uses generic media players as Music Assistant compatibility targets when the service exists", () => {
    const card = createCard();
    const genericPlayer = {
      entity_id: "media_player.ceiling",
      state: "idle",
      attributes: { friendly_name: "Ceiling" },
    };
    card._hass = {
      states: {
        [genericPlayer.entity_id]: genericPlayer,
      },
      services: {
        music_assistant: { play_media: {} },
      },
    };

    card._loadPlayers();

    expect(card._state.players).toEqual([genericPlayer]);
    expect(card._state.selectedPlayer).toBe(genericPlayer.entity_id);
    expect(card._state.musicAssistantIssueMessage).toBe("");
    expect(card._isMusicAssistantPlayer(genericPlayer)).toBe(true);
  });

  it("loads Music Assistant players identified by the entity registry", () => {
    const card = createCard();
    const musicAssistantPlayer = {
      entity_id: "media_player.bedroom",
      state: "idle",
      attributes: { friendly_name: "Bedroom" },
    };
    card._hass = {
      states: {
        [musicAssistantPlayer.entity_id]: musicAssistantPlayer,
      },
      entities: {
        [musicAssistantPlayer.entity_id]: { platform: "music_assistant" },
      },
    };

    card._loadPlayers();

    expect(card._state.players).toEqual([musicAssistantPlayer]);
    expect(card._state.selectedPlayer).toBe(musicAssistantPlayer.entity_id);
    expect(card._state.musicAssistantIssueMessage).toBe("");
  });

  it("keeps a manually selected idle player sticky while returning to the library picker", () => {
    const card = createCard();
    card._syncActivePlayerHelper = () => {};
    card._syncNowPlayingUI = () => {};
    card._renderPlayerSummary = () => {};
    card._syncBrandPlayingState = () => {};
    const livingRoom = {
      entity_id: "media_player.living_room",
      state: "playing",
      attributes: { friendly_name: "Living Room", app_id: "music_assistant" },
    };
    const kitchen = {
      entity_id: "media_player.kitchen",
      state: "idle",
      attributes: { friendly_name: "Kitchen", app_id: "music_assistant" },
    };
    card._hass = {
      states: {
        [livingRoom.entity_id]: livingRoom,
        [kitchen.entity_id]: kitchen,
      },
    };
    card._state.pinnedPlayerEntities = [livingRoom.entity_id];
    card._loadPlayers();
    expect(card._state.selectedPlayer).toBe(livingRoom.entity_id);

    card._state.menuOpen = true;
    card._state.menuPage = "players";
    card._state.menuStack = ["library_playlists"];
    card._selectPlayer(kitchen.entity_id, true);

    expect(card._state.selectedPlayer).toBe(kitchen.entity_id);
    expect(card._state.manualFrontPlayerUntil - Date.now()).toBeGreaterThan(4 * 60 * 1000);

    card._loadPlayers();
    expect(card._state.selectedPlayer).toBe(kitchen.entity_id);

    card._state.menuOpen = false;
    card._shortenManualFrontPlayerHold();
    expect(card._state.manualFrontPlayerUntil - Date.now()).toBeGreaterThan(4 * 60 * 1000);
    card._state.manualFrontPlayerUntil = Date.now() - 1;
    kitchen.state = "playing";
    card._loadPlayers();
    expect(card._state.selectedPlayer).toBe(kitchen.entity_id);
    expect(card._state.manualFrontPlayerUntil - Date.now()).toBeGreaterThan(4 * 60 * 1000);
    card._clearManualFrontPlayer({ sync: false });
  });

  it("lets music_assistant.play_media replace playback without manually clearing first", async () => {
    const card = createCard();
    const calls = [];
    card._state.selectedPlayer = "media_player.main";
    card._clearQueueForPlayer = async () => calls.push({ domain: "homeii", service: "clear" });
    card._callHaServiceRaw = async (domain, service, data) => calls.push({ domain, service, data });
    card._toastMediaQueued = () => {};
    card._playerByEntityId = () => ({ entity_id: "media_player.main", attributes: { friendly_name: "Main" } });

    const ok = await card._playMediaOnPlayer("media_player.main", "spotify://album/one", "album", "play", { silent: true });

    expect(ok).toBe(true);
    expect(calls).toEqual([{
      domain: "music_assistant",
      service: "play_media",
      data: {
        entity_id: "media_player.main",
        media_id: "spotify://album/one",
        media_type: "album",
        enqueue: "play",
      },
    }]);
  });

  it("sets shuffle before play_media without manually clearing the player", async () => {
    const card = createCard();
    const calls = [];
    card._clearQueueForPlayer = async () => calls.push({ domain: "homeii", service: "clear" });
    card._callHaServiceRaw = async (domain, service, data) => calls.push({ domain, service, data });

    const ok = await card._playMediaOnPlayer("media_player.main", "spotify://playlist/mix", "playlist", "shuffle", { silent: true });

    expect(ok).toBe(true);
    expect(calls).toEqual([
      {
        domain: "media_player",
        service: "shuffle_set",
        data: { entity_id: "media_player.main", shuffle: true },
      },
      {
        domain: "music_assistant",
        service: "play_media",
        data: {
          entity_id: "media_player.main",
          media_id: "spotify://playlist/mix",
          media_type: "playlist",
          enqueue: "play",
        },
      },
    ]);
  });
});

describe("now playing subtitle", () => {
  it("disables subtitle scrolling in Ultra Lite performance mode", () => {
    const card = createCard();
    card._state.lang = "en";
    card._state.performanceProfile = "full";

    expect(card._nowPlayingSubtitleShouldScroll(true)).toBe(true);

    card._state.performanceProfile = "ultra_lite";

    expect(card._nowPlayingSubtitleShouldScroll(true)).toBe(false);
  });
});

describe("voice assistant music matching", () => {
  it("rejects unrelated search results instead of auto-playing by media type only", () => {
    const card = createCard();
    const result = card._voiceAssistantBestCandidate({
      tracks: [
        {
          uri: "spotify://track/wrong",
          media_type: "track",
          name: "באמצע הלילה",
          artist: "סתם וגודי",
        },
      ],
    }, "את השיר מישל של נועם בתן");

    expect(result).toBe(null);
  });

  it("prefers the song and artist that match the spoken Hebrew request", () => {
    const card = createCard();
    const result = card._voiceAssistantBestCandidate({
      tracks: [
        {
          uri: "spotify://track/wrong",
          media_type: "track",
          name: "באמצע הלילה",
          artist: "סתם וגודי",
        },
        {
          uri: "spotify://track/michelle",
          media_type: "track",
          name: "מישל",
          artist: "נועם בתן",
        },
      ],
    }, "נגן את השיר מישל של נועם בתן");

    expect(result?.uri).toBe("spotify://track/michelle");
  });

  it("matches Hebrew speech against Latin Music Assistant metadata", () => {
    const card = createCard();
    const result = card._voiceAssistantBestCandidate({
      tracks: [
        {
          uri: "spotify://track/wrong",
          media_type: "track",
          name: "באמצע הלילה",
          artist: "סתם וגודי",
        },
        {
          uri: "spotify://track/michelle-latin",
          media_type: "track",
          name: "Michelle",
          artist: "Noam Bettan",
        },
      ],
    }, "נגן את השיר מישל של נועם בתן");

    expect(result?.uri).toBe("spotify://track/michelle-latin");
  });

  it("accepts natural artist-only Hebrew requests such as songs by an artist", () => {
    const card = createCard();
    const result = card._voiceAssistantBestCandidate({
      tracks: [
        {
          uri: "spotify://track/idan",
          media_type: "track",
          name: "בראשית",
          media_item: {
            artists: [{ name: "עידן רייכל" }],
          },
        },
      ],
    }, "נגן שירים של עידן רייכל");

    expect(result?.uri).toBe("spotify://track/idan");
  });

  it("uses focused playlist search for natural playlist-by-artist requests", async () => {
    const card = createCard();
    const player = { entity_id: "media_player.office" };
    const calls = [];
    let played = null;
    card._state.selectedPlayer = player.entity_id;
    card._getSelectedPlayer = () => player;
    card._i18n = (key, params = {}) => params.title || params.query || key;
    card._toast = () => {};
    card._toastError = () => {};
    card._updateVoiceAssistantDialog = () => {};
    card._search = async (query) => {
      calls.push(["global", query]);
      return card._emptySearchResults();
    };
    card._voiceAssistantFocusedMusicSearch = async (query, mediaType) => {
      calls.push(["focused", query, mediaType]);
      return {
        ...card._emptySearchResults(),
        playlists: [
          {
            uri: "spotify://playlist/shlomo",
            media_type: "playlist",
            name: "This Is Shlomo Artzi",
          },
        ],
      };
    };
    card._playMediaOnPlayer = async (entityId, uri, mediaType) => {
      played = { entityId, uri, mediaType };
      return true;
    };

    const result = await card._playVoiceAssistantMusic("פלייליסט של שלמה ארצי", player);

    expect(result.ok).toBe(true);
    expect(calls).toContainEqual(["focused", "שלמה ארצי", "playlist"]);
    expect(played).toEqual({
      entityId: "media_player.office",
      uri: "spotify://playlist/shlomo",
      mediaType: "playlist",
    });
  });

  it("keeps voice playback working when the broad search path fails", async () => {
    const card = createCard();
    const player = { entity_id: "media_player.office" };
    let played = null;
    card._state.selectedPlayer = player.entity_id;
    card._getSelectedPlayer = () => player;
    card._i18n = (key, params = {}) => params.title || params.query || key;
    card._toast = () => {};
    card._toastError = () => {};
    card._debugLog = () => {};
    card._updateVoiceAssistantDialog = () => {};
    card._search = async () => {
      throw new Error("global search unavailable");
    };
    card._voiceAssistantFocusedMusicSearch = async () => ({
      ...card._emptySearchResults(),
      playlists: [
        {
          uri: "spotify://playlist/shlomo",
          media_type: "playlists",
          name: "This Is Shlomo Artzi",
        },
      ],
    });
    card._playMediaOnPlayer = async (entityId, uri, mediaType) => {
      played = { entityId, uri, mediaType };
      return true;
    };

    const result = await card._playVoiceAssistantMusic("פלייליסט של שלמה ארצי", player);

    expect(result.ok).toBe(true);
    expect(played).toEqual({
      entityId: "media_player.office",
      uri: "spotify://playlist/shlomo",
      mediaType: "playlist",
    });
  });

  it("accepts a title match even when artist metadata is missing from the search result", () => {
    const card = createCard();
    const result = card._voiceAssistantBestCandidate({
      tracks: [
        {
          uri: "spotify://track/michelle-no-artist",
          media_type: "track",
          name: "מישל",
        },
      ],
    }, "נגן את השיר מישל של נועם בתן");

    expect(result?.uri).toBe("spotify://track/michelle-no-artist");
  });

  it("still accepts a clear one-word title match", () => {
    const card = createCard();
    const result = card._voiceAssistantBestCandidate({
      tracks: [
        {
          uri: "spotify://track/imagine",
          media_type: "track",
          name: "Imagine",
          artist: "John Lennon",
        },
      ],
    }, "play imagine");

    expect(result?.uri).toBe("spotify://track/imagine");
  });
});

describe("radio playback detection", () => {
  it("does not classify a track as radio just because the title contains radio", () => {
    const card = createCard();
    const player = {
      attributes: {
        media_content_type: "track",
        media_content_id: "spotify://track/slow-radio",
        media_title: "Slow Radio",
      },
    };
    const queueItem = {
      media_type: "track",
      media_item: {
        media_type: "track",
        name: "Slow Radio",
        uri: "spotify://track/slow-radio",
      },
    };

    expect(card._isLikelyRadioPlayback(player, queueItem, queueItem.media_item)).toBe(false);
  });

  it("classifies RadioBrowser stream metadata as radio", () => {
    const card = createCard();
    const player = {
      attributes: {
        media_content_type: "music",
        media_content_id: "https://example.com/stream",
      },
    };
    const queueItem = {
      media_item: {
        media_type: "music",
        provider: "radiobrowser",
        metadata: { stationuuid: "abc" },
      },
    };

    expect(card._isLikelyRadioPlayback(player, queueItem, queueItem.media_item)).toBe(true);
  });
});
