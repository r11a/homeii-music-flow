// Genre discovery data loading and presentation. Reuses the card transport and media components.

export async function loadDiscoverySections() {
    const categories = this._discoveryCategoryOptions();
    const activeCategory = this._discoveryCategory();
    const profile = this._discoveryPopularGenreProfiles().find((item) => item.key === activeCategory.key);
    const query = profile?.query || activeCategory.key.replaceAll("-", " ");
    const selectedProvider = this._state.discoveryProviderPath || "all";
    const resultKey = `discovery:results:${activeCategory.key}:${selectedProvider}`;
    const cachedResult = this._cache.library.get(resultKey);
    if (cachedResult && Date.now() - cachedResult.ts < 60000) return cachedResult.items;
    this._discoveryLoads ||= new Map();
    if (this._discoveryLoads.has(resultKey)) return this._discoveryLoads.get(resultKey);
    const normalize = (items) => this._discoveryUniqueItems(Array.isArray(items) ? items : [], "playlist");
    const readCatalog = async (key, command, args) => {
      const cached = this._cache.library.get(key);
      if (cached && Date.now() - cached.ts < 60000) return cached.items;
      const items = await this._callEngineMaCommand(command, args);
      if (!Array.isArray(items)) throw new Error("Invalid discovery catalogue response");
      this._cache.library.set(key, { ts: Date.now(), items });
      return items;
    };
    let providers = [];
    let providerSearchFallback = false;
    let providerSearchFailed = false;
    const tasks = [
      (async () => {
        const root = await readCatalog("discovery:sources", "music/browse", { path: "root" });
        providers = root.filter((item) => item.media_type === "folder" && item.path?.includes("://") && !/^(builtin|radiobrowser|podcastfeed|ambient_sounds)/.test(item.path));
        const chosen = selectedProvider === "all" ? providers : providers.filter((item) => item.path === selectedProvider);
        if (!chosen.length) return [];
        const aliases = new Set([query, activeCategory.label, ...(profile?.aliases || [])].map((value) => this._discoveryGenreKey(value)));
        const curated = await Promise.all(chosen.map(async (provider) => {
          // Spotify exposes its curated genre catalogue through MA 2.10+ browse.
          // Follow returned paths; never manufacture provider category IDs.
          if (!provider.path.startsWith("spotify")) return { search: provider };
          try {
            const folders = await readCatalog(`discovery:folders:${provider.path}`, "music/browse", { path: provider.path });
            const genreRoot = folders.find((item) => item.media_type === "folder" && (item.translation_key === "genres_and_moods" || item.path?.split("://")[1] === "categories"));
            if (!genreRoot) return { search: provider };
            const categories = await readCatalog(`discovery:genres:${genreRoot.path}`, "music/browse", { path: genreRoot.path });
            const genre = categories.find((item) => item.media_type === "folder" && aliases.has(this._discoveryGenreKey(item.name || "")));
            if (!genre?.path) return { search: provider };
            const items = await readCatalog(`discovery:genre-items:${genre.path}`, "music/browse", { path: genre.path });
            return { items: items.filter((item) => item.media_type === "playlist") };
          } catch (_) {
            return { search: provider };
          }
        }));
        const searchProviders = curated.filter((result) => result.search).map((result) => result.search.path.split("://")[0]);
        providerSearchFallback = searchProviders.length > 0;
        let searched = [];
        if (searchProviders.length) {
          try {
            const result = await this._callEngineMaCommand("music/search", { search_query: query, media_types: ["playlist"], limit: 16, providers: searchProviders });
            searched = this._normalizeSearchResponse(result).playlists;
          } catch (error) {
            if (!curated.some((result) => result.items?.length)) throw error;
            providerSearchFailed = true;
          }
        }
        return normalize([...curated.flatMap((result) => result.items || []), ...searched]);
      })(),
      (async () => {
        const genres = await readCatalog("discovery:library-genres", "music/genres/library_items", { limit: 1000 });
        const key = (value) => this._discoveryGenreKey(value);
        const aliases = new Set([query, activeCategory.label, ...(profile?.aliases || [])].map(key));
        const ids = genres.filter((item) => [item.name, ...(Array.isArray(item.aliases) ? item.aliases : [])].some((name) => typeof name === "string" && aliases.has(key(name))))
          .map((item) => Number(item.item_id)).filter(Number.isFinite);
        if (!ids.length) return [];
        const groups = await Promise.all(["playlists", "albums", "tracks", "radios"].map((type) => this._callEngineMaCommand(`music/${type}/library_items`, { genre: ids, limit: 12 })));
        return normalize(groups.flat());
      })(),
      this._fetchRadioBrowserStations("", 16, { tag: query }),
    ];
    const pending = Promise.allSettled(tasks).then((results) => {
    const names = [this._m("From music providers", "מספקי המוזיקה"), this._m("From your MA library", "מספריית MA שלך"), this._m("Radio for this genre", "רדיו לז׳אנר הזה")];
    const sections = results.map((result, index) => ({
      name: names[index], type: index === 2 ? "radio" : "playlist",
      description: index === 0 && providerSearchFailed ? this._m("Some providers could not be searched. Available genre collections are shown.", "לא ניתן היה לחפש בחלק מהספקים. מוצגות קטגוריות הז׳אנר הזמינות.") : index === 0 && providerSearchFallback ? this._m("Provider genre collections, with playlist search where a genre collection is unavailable.", "קטגוריות ז׳אנר מהספקים, ובמקורות ללא קטגוריה זמינה — חיפוש פלייליסטים.") : "",
      items: result.status === "fulfilled" ? normalize(result.value) : [],
      error: result.status === "rejected" ? this._m("This source could not be loaded. Retry.", "לא ניתן לטעון את המקור הזה. נסה שוב.") : "",
    }));
      const result = { categories, activeCategory, providers, selectedProvider, sections };
      this._cache.library.set(resultKey, { ts: Date.now(), items: result });
      return result;
    }).finally(() => this._discoveryLoads.delete(resultKey));
    this._discoveryLoads.set(resultKey, pending);
    return pending;
  }

export function discoveryPlayerFocusHtml() {
    const player = this._getSelectedPlayer();
    const playerName = player?.attributes?.friendly_name || this._i18n("ui.choose_player");
    const isPlaying = player?.state === "playing";
    const groupCount = this._playerGroupCount(player);
    const art = this._playerArtworkUrl(player, 120);
    const stateLabel = isPlaying
      ? (player?.attributes?.media_title || this._i18n("ui.playing"))
      : this._i18n("ui.ready");
    return `
      <button class="discovery-player-focus ${isPlaying ? "is-playing" : ""}" data-menu-nav="players" title="${this._esc(this._i18n("ui.choose_player"))}">
        <span class="discovery-player-kicker">${this._esc(this._i18n("ui.selected_player"))}</span>
        <span class="discovery-player-art">${art ? this._imgHtml(art, "", { fallbackIcon: "speaker" }) : this._iconSvg("speaker")}</span>
        <span class="discovery-player-copy">
          <span class="discovery-player-name">${this._esc(playerName)}</span>
          <span class="discovery-player-state">${this._esc(stateLabel)}</span>
        </span>
        ${groupCount ? `<span class="player-group-badge discovery-player-badge">${this._esc(groupCount)}</span>` : ``}
      </button>
    `;
  }

export function updateDiscoveryMenuBody(body, view) {
    const html = this._discoveryMenuHtml(view);
    // Preserve images, native select focus and scroll when only the viewport/player clock changes.
    if (body._discoveryMarkup === html && body.querySelector(".discovery-catalog")) return;
    body.innerHTML = html;
    body._discoveryMarkup = html;
  }

export function discoveryMenuHtml({ categories = this._discoveryCategoryOptions(), activeCategory = this._discoveryCategory(), providers = [], selectedProvider = this._state.discoveryProviderPath || "all", sections = [], loading = false, error = "" } = {}) {
    return `
      <div class="discovery-catalog">
        <div class="discovery-catalog-toolbar">
          <label class="discovery-category-select"><span>${this._esc(this._m("Genre", "ז׳אנר"))}</span>
            <select class="media-sort-select settings-select" id="discoveryCategorySelect" aria-label="${this._esc(this._m("Genre", "ז׳אנר"))}">
              ${categories.map((item) => `<option value="${this._esc(item.key)}" ${item.key === activeCategory.key ? "selected" : ""}>${this._esc(item.label)}</option>`).join("")}
            </select>
          </label>
          <label class="discovery-category-select"><span>${this._esc(this._m("Music providers", "ספקי מוזיקה"))}</span>
            <select class="media-sort-select settings-select" id="discoveryProviderSelect" aria-label="${this._esc(this._m("Music providers", "ספקי מוזיקה"))}">
              <option value="all" ${selectedProvider === "all" ? "selected" : ""}>${this._esc(this._m("All connected providers", "כל הספקים המחוברים"))}</option>
              ${providers.map((item) => `<option value="${this._esc(item.path)}" ${item.path === selectedProvider ? "selected" : ""}>${this._esc(item.name)}</option>`).join("")}
            </select>
          </label>
        </div>
        <div class="discovery-catalog-heading"><div><h2>${this._iconSvg(activeCategory.icon || "music_note")} ${this._esc(activeCategory.label)}</h2><p>${this._esc(this._m("Music providers, your library and radio — matched to your genre", "ספקי מוזיקה, הספרייה שלך ורדיו — לפי הז׳אנר שבחרת"))}</p></div></div>
        ${this._discoveryPlayerFocusHtml()}
        ${loading ? this._loadingStateHtml(this._m("Finding music for your genre", "מחפש מוזיקה לז׳אנר שבחרת"), { notice: true }) : ""}
        ${error ? `<div class="notice open" role="alert">${this._esc(error)}<button class="chip-btn" data-discovery-retry>${this._esc(this._m("Retry", "נסה שוב"))}</button></div>` : ""}
        ${sections.map((section) => `<section class="discovery-result-section"><h3>${this._esc(section.name)}</h3>${section.description ? `<p class="settings-hint">${this._esc(section.description)}</p>` : ""}${section.error
          ? `<div class="notice open" role="alert">${this._esc(section.error)} <button class="chip-btn" data-discovery-retry>${this._esc(this._m("Retry", "נסה שוב"))}</button></div>`
          : section.items.length ? this._mediaItemsListHtml(section.items, section.type, { layout: "grid", librarySkin: true, virtual: false })
          : `<div class="notice open">${this._esc(this._m("No matches for this genre in this source.", "לא נמצאו במקור הזה התאמות לז׳אנר הנבחר."))}</div>`}</section>`).join("")}
      </div>
    `;
  }
