# Changelog

## Unreleased

### Changed

- Artwork cache: the LRU cap on the decoded-artwork bitmap cache is now scaled by `performance_profile` rather than hard-coded at 180. The `full` profile is intentionally left at 180 so default users see no change. Lighter profiles get tighter caps to recover idle memory on kiosk / low-RAM devices: `high` = 120, `low` = 60, `ultra_lite` = 30. The cap selector is a new `maxDecodedArtworkCache(profile)` in `src/core/state/derived.js` that falls back to the `full` value for unknown or empty profile strings, so existing behavior is preserved. Verified end-to-end on a real card instance: pre-filling 50 entries, switching to `ultra_lite`, and triggering one decode evicts down to exactly 30.

### Added

- Danish (`da`) localization. Adds `src/localization/da.js` with all 925 keys translated via DeepL using a glossary that locks brand names (HOMEii Flow, Music Assistant, Sendspin, Spotify, etc.) and music-domain terms (Library, Queue, Playlist, etc.) to consistent renderings. Registered in `src/localization/index.js` and exposed as "Dansk" in the language picker. Native Danish speaker review by submitter (Danish household using the card daily for kids' room dashboards).

## 5.8.1 - 2026-05-31

Focused hotfix release for Music Assistant compatibility and artwork regressions found after 5.8.0.

Release focus:

- Restores Music Assistant 2.8.x player compatibility when Home Assistant exposes MA players without the newer MA state/entity markers.
- Keeps the Music Assistant requirement guard intact when the backend is genuinely missing.
- Avoids manually clearing the player queue immediately before `music_assistant.play_media`, reducing race conditions that could drop queue wrappers and now-playing artwork on browser/Sendspin players.
- Rejects invalid Music Assistant image-proxy IDs so artwork can fall back to the older path/provider image-proxy URL shape.
- Keeps the visual editor usable with generic MA-backed media players in older MA/Home Assistant combinations.
- Prevents the card screensaver from opening while the card is being edited in the Home Assistant visual editor.

Validation:

- Full Vitest suite passed.
- Vite production build passed.
- Full ESLint passed.
- Release artifacts were regenerated and synced into `dist/`.

## 5.8.0 - 2026-05-30

Next public release after 5.7.1, focused on architecture, mobile layout control, artwork and queue reliability, screensaver lyrics, library detail flows, Flow Assistant matching, and release confidence.

Release focus:

- Reworks the runtime into focused foundation modules for state, players, queue, favorites, media presentation, artwork, now-playing, responsive layout, palette handling, editor forms, RadioBrowser countries, and voice matching.
- Adds phone layout modes: Auto, Full, and Compact.
- Adds compact edge-to-edge control so compact expand can open edge-to-edge or as a floating window.
- Hardens mobile queue transitions so title, artist, album, URI, artwork, and selected player stay aligned while Music Assistant catches up.
- Adds lyrics support inside the screensaver, including an optional `lyrics` screensaver button.
- Adds per-tab library search, richer album/artist/playlist detail surfaces, better loading feedback, and stronger item deduping.
- Improves Flow Assistant matching for Hebrew speech, Latin/English metadata, artist requests, playlist requests, title-only matches, and fallback focused search.
- Updates release tooling, cache-busting, dist artifact sync, version alignment, and runtime regression coverage for 5.8.0.

Architecture and release tooling:

- Adds `src/core/base-music-card.js` for the shared card runtime.
- Adds `src/config/editor-forms.js` and `src/config/editor-element.js` for visual-editor schema and element setup.
- Adds focused helper modules under `src/core/` for layout, palette, state, media, players, queue, favorites, RadioBrowser countries, and voice matching.
- Copies `src/core` and `src/config` into `dist/` during release artifact sync.
- Adds versioned cache-busting imports for localization, config, and core modules.
- Updates package, source, dist runtime, localization imports, and editor tags to `5.8.0`.
- Adds runtime baseline tests for source/dist/package version alignment, card/editor registration, editor shell setup, and bundled dist import.

Mobile, compact, and dashboard fit:

- Adds `mobile_layout_mode` with Auto, Full, and Compact options in settings and the visual editor.
- Adds `mobile_compact_edge_to_edge` in settings and the visual editor.
- Improves automatic compact recommendations for narrow and short dashboard slots.
- Improves mini-widget selection and Section dashboard reserved height for compact layouts.
- Allows forced full phone layouts on short/tight screens to scroll instead of cutting controls.
- Improves tablet auto-fit and dense UI behavior when Night mode or Up Next are enabled.
- Adds panel-fill and resize strategy helpers to reduce unnecessary heavy rebuilds.

Artwork, queue, and now playing:

- Adds decoded artwork caching and immediate image `src` rendering before decode completes.
- Adds artwork prefetching for current, next, previous, nearby, and visible queue rows.
- Adds stronger Music Assistant image-proxy handling, including image-proxy paths, proxy IDs, normalized sizes, base64 local images, thumbnails, covers, album artwork, media images, and nested metadata images.
- Prevents new-track titles from pairing with old-track artwork during pending queue transitions.
- Locks the target player during pending queue playback so another active player does not steal focus.
- Adds queue mutation pending state for optimistic reorder/mutation flows.
- Improves duration and timestamp parsing across numeric, string, ISO, and millisecond payloads.

Lyrics and screensaver:

- Adds `lyrics` to configurable screensaver controls.
- Lets the screensaver open while lyrics are active.
- Moves an open lyrics modal into screensaver lyrics mode without leaving the modal behind.
- Adds tablet lyrics-to-screensaver behavior.
- Refreshes lyrics when the current track changes.
- Keeps screensaver lyrics active during playback or freshly paused state, then exits cleanly after inactivity.

Library, search, radio, and favorites:

- Adds per-tab library search queries and drafts.
- Restores search focus after library rerenders.
- Adds tab-specific filtering and mixed result grouping.
- Adds media detail shells for albums, playlists, and artists.
- Adds album browse selection and track-row rendering inside detail pages.
- Adds visible feedback/loading states for library entries, category rows, radio country entries, detail heroes, layout buttons, search buttons, discovery items, and player focus controls.
- Improves RadioBrowser country labels, translated common countries, and flag helpers.
- Avoids classifying normal tracks as radio just because their title contains "radio".
- Improves favorite matching, optimistic favorite cache behavior, and favorite removal argument resolution.

Flow Assistant and player behavior:

- Moves voice matching into a dedicated module.
- Improves Hebrew and English command normalization.
- Adds Hebrew-to-Latin phonetic matching against Latin Music Assistant metadata.
- Improves natural playlist-by-artist and songs-by-artist requests.
- Uses focused search when broad Music Assistant search fails or is too noisy.
- Rejects unrelated search results instead of playing by media type alone.
- Improves preferred front-player resolution with custom player order.
- Deduplicates `active_player_helper_entity` writes.
- Adds configurable `mobile_announcement_volume` and restores the previous volume after announcements.

Existing foundations preserved:

- Keeps Hotel Mode, HTTPS Music Assistant external URL support, This Device / Sendspin, Media Session screensaver behavior, Control Room / Studio, Quick Actions, POWER actions, auxiliary buttons, Night mode, sleep timer, start schedules, Up Next, Discovery mode, Quick Mix, recent playback history, local/Music Assistant liked modes, artwork swipe browsing, ambient light sync, grouped-player feedback, front-player pinning, and bundled English/Hebrew/Spanish/French/Italian/Lithuanian/Chinese localization.

## 5.7.1 - 2026-05-26

Polish, safety, and hospitality release for the 5.7.x cycle.

Release focus:

- Adds Hotel Mode for guest-safe and family-safe dashboards.
- Hardens player priority, front pinning, and temporary manual player selection.
- Adds an HTTPS-safe Music Assistant external URL option for Nabu Casa / Companion App users.
- Integrates the latest merged PRs from jingle-jew.
- Adds Italian localization from Dieghito72.
- Improves group feedback, Discover, library/radio behavior, tablet polish, and release packaging.

Hotel Mode:

- Adds `hotel_mode: true` for a simplified hotel-safe interface.
- Removes main navigation items in Hotel Mode.
- Hides queue management, advanced settings, grouping/transfer actions, long-press actions, theme toggle, media-source badges, and secondary controls.
- Keeps core playback controls, shuffle/repeat, previous/next, search, artwork browsing, volume slider, and volume +/- controls.
- Keeps player selection available while removing advanced join, disconnect, and transfer options from that picker.
- Restores the HOMEII FLOW logo in Hotel Mode.
- Keeps glassmorphism and aura-lighting while reducing duplicate artwork/background layers.
- Returns the search control to the original artwork-action position.
- Slims Hotel Mode player/volume rows and keeps the UI calmer for shared spaces.

Player priority, pins, and selection:

- Adds front-player priority across the player surfaces.
- Uses the intended hierarchy: temporary manual selection, front pin, currently playing player, then configured/default player behavior.
- Allows manual selection even when another player is pinned or playing.
- Clears temporary manual selection when leaving and returning to the dashboard page.
- Adds a compact front pin with better top-corner placement, smaller footprint, no extra container, grey inactive state, and cover-accent active color.
- Keeps pinned players above playing players where pinning is explicitly requested.
- Removes the front pin from queue-transfer player selection.

Music Assistant, Sendspin, and HTTPS:

- Adds `music_assistant_external_url` / "Music Assistant external URL".
- Uses the HTTPS external Music Assistant URL for Sendspin websocket/browser-player connections when Home Assistant is loaded over HTTPS.
- Keeps local/internal `ma_url` behavior for HTTP/LAN dashboards.
- Shows an explicit mixed-content/setup error instead of trying to bypass browser security rules.
- Routes remote artwork through the Music Assistant image proxy when possible.
- Improves RadioBrowser/radio artwork fallback paths.
- Keeps the Music Assistant player registry detection fix from the local 5.7.0 work.
- Adds the PR #36 Sendspin fallback for macOS native Home Assistant WebView when MediaStreamDestination is unavailable.

Merged contributor work:

- Includes PR #34 from jingle-jew: keeps Sendspin Media Session active in the screensaver and restores quick shelf edge guarantees.
- Includes PR #35 from jingle-jew: keeps Media Session metadata and playback state synced while the screensaver is open.
- Includes PR #36 from jingle-jew: falls back to direct AudioContext output when macOS native Home Assistant WebView lacks MediaStreamDestination.
- Includes PR #37 from Dieghito72: adds Italian localization and registers it in the language picker.
- Adds release credit for jingle-jew / Julien Moreau B. for PRs, French wording work, and testing feedback.
- Adds release credit for Dieghito72 for the Italian translation contribution.

Grouping, FLOW, and player management:

- Adds loading feedback for group join and disconnect actions.
- Adds separate join/disconnect action animation states so group commands feel responsive.
- Clears shared group volume state immediately after disconnecting a group.
- Improves the group player selection window and top-corner add/remove affordances.
- Moves add/remove controls closer to the card corner and uses clearer selected-state feedback.
- Changes FLOW multi-player behavior so choosing more than one player enters join/group behavior instead of starting separate playback attempts.
- Fixes "Clean all" so stale local player artwork is cleared after stopping/disconnecting players.

Discover, library, liked, and recommendations:

- Keeps Discover open when changing players from inside Discover on tablet.
- Moves the Discover style selector into the active-player area on tablet.
- Restores RadioBrowser station visibility in the library flow.
- Adds grid/list view controls to the tablet Liked screen.
- Restores the 5.7.0 mobile recommendation drawer button behavior in the quick-action row.
- Keeps the tablet recommendation drawer as a subtle edge arrow.
- Fixes the mobile recommendation drawer button so it keeps the same glass button treatment as the other quick actions.

UI and interaction polish:

- Restores the 5.7.0 magic-wand icon after experimental replacements.
- Shrinks tablet mute controls and their internal icon.
- Refines player-card pin placement and sizing.
- Refines group buttons, add/remove indicators, volume rows, and tablet spacing.
- Adds smooth fade-in and fade-out transitions for entering and exiting the screensaver.
- Removes the experimental Crossfade control until Music Assistant/service support is reliable enough.
- Bundles English, Hebrew/RTL, Spanish, French, Italian, Lithuanian, and Simplified Chinese dictionaries in the release package.
- Keeps theme, localization, and release package artifacts synced for 5.7.1.

## 5.7.0 - 2026-05-23

Major community release focused on Music Assistant safety, compact/mobile dashboards, full-screen interaction, weak-device performance, player control reliability, and localization.

This release was shaped by a long feedback cycle from real Home Assistant dashboards. Thank you to everyone who opened issues, sent screenshots, tested local beta builds, and asked for practical improvements. Many of the changes below came directly from user requests, and the goal was to add as much as possible without breaking the premium player experience.

Highlights:

- Rebuilds the **compact card** so it behaves correctly inside Home Assistant Section dashboards, sits beside other cards without overlaying them, opens a true full-screen popup, captures pointer events inside the popup, and keeps phone/tablet layouts usable.
- Adds a **Mini player** compact mode for mobile dashboards: a smaller two-row music widget with artwork, track text, previous/play/next, volume controls, active-player access, and a cleaner full-screen expand button.
- Adds stronger **performance profiles** for weak devices: Full, High, Low, and Ultra Lite. Ultra Lite reduces blur, transparency, animation, dynamic backgrounds, motion, and expensive visual effects while preserving the important controls.
- Enforces **Music Assistant player safety**. HOMEii Flow no longer falls back to unrelated Home Assistant `media_player` entities when Music Assistant is missing, inactive, or exposes no valid MA players. The card now shows a clear setup message instead.
- Improves Home Assistant **Section dashboard fit** with better height handling, compact/full layouts, mobile breakpoints, popup sizing, and manual-height support.
- Expands **screensaver controls** with configurable buttons for Flow Assistant, previous/next, play/pause, power, mute, and like, plus dynamic artwork color, lighter idle animation, and performance-aware rendering.
- Adds a much larger **style and genre catalog** for FLOW and Discover so users choose familiar music styles instead of a tiny fixed category list.
- Bundles **Spanish, French, and Lithuanian** translations alongside English, Hebrew, and Simplified Chinese.

Music Assistant, players, and grouping:

- Shows a clear Music Assistant requirement notice when the integration is unavailable, inactive, or has no supported players.
- Prevents non-Music-Assistant Home Assistant players from appearing in the card as a fallback.
- Adds player exclusion from the visual editor.
- Adds player sorting by alphabet or custom order.
- Sizes custom player-order controls by the real number of available players instead of showing a fixed long list.
- Improves active-player selector behavior in compact, mini, full, screensaver, and opened player surfaces.
- Hardens group join, disconnect, queue transfer, stop, and clear flows around Music Assistant beta behavior and unsupported idle devices.
- Reduces false success/error feedback when grouping or disconnecting speakers.
- Improves player group UI cards, selection feedback, and volume controls.

Compact, Mini, mobile, and Section layout:

- Adds the Mini two-row compact card mode for dashboards where the normal compact card still uses too much vertical space.
- Keeps the regular compact card available as a richer compact experience.
- Moves compact full-screen views into a true popup-like surface that uses the screen instead of resizing the card in place.
- Fixes compact full-screen clicks passing through to cards underneath.
- Fixes compact full-screen controls that only allowed the close button to work.
- Fixes compact cards stacking under or over unrelated Home Assistant cards in Section dashboards.
- Improves compact album art sizing and cover browsing.
- Allows cover browsing selections in compact mode to start the selected item.
- Replaces the old triangle compact expand button with a clearer full-screen icon.
- Adds active-player access to the Mini card header.
- Moves Mini/mobile volume into its own row where needed to avoid crowding the media controls.
- Improves mobile proportions, hit areas, control sizes, and text clipping.
- Better handles narrow intermediate widths by wrapping actions, opening full-screen menus, or favoring compact layouts instead of crushing tablet layout controls.

Quick Actions and auxiliary controls:

- Moves Home into the Quick Actions row and keeps it available when the player is idle.
- Adds Quick Action ordering in the visual editor.
- Fixes Quick Actions disappearing after music starts and only returning after a page refresh.
- Hides irrelevant Quick Actions from the idle player view.
- Adds multiple auxiliary buttons with configurable names, Home Assistant icon selection, and actions.
- Adds a dedicated search Quick Action that opens a clean search-only popup.
- Adds better action menu tile sizing so labels and icons do not clip.
- Supports two-row Quick Actions on constrained layouts to preserve artwork space.

Media controls and volume:

- Improves immediate feedback for play, pause, shuffle, repeat, previous, next, mute, and volume.
- Adds optional plus/minus volume buttons with a configurable 1-10 percent step and a 5 percent default.
- Fixes plus/minus volume changing from the wrong baseline.
- Fixes volume slider and percentage not updating immediately after choosing a preset.
- Fixes the compact volume preset popup stacking under other cards.
- Enlarges and balances media-control icons, especially shuffle and repeat.
- Moves the repeat badge outside the icon center so it no longer blocks the repeat glyph.
- Changes shuffle active state to a border/glow treatment instead of an icon-covering dot.
- Tunes tablet media controls and reduces the mute button size.

Screensaver and ambient visuals:

- Adds configurable screensaver button visibility, including existing Flow Assistant and previous/next controls.
- Keeps Flow Assistant above the screensaver and prevents it from closing the screensaver unintentionally.
- Removes the experimental `screensaver_kiosk_mode` option because it did not provide a useful difference in Home Assistant chrome behavior.
- Uses a full-page screensaver surface similar to compact full-screen mode.
- Adds gentle idle animation for no-content screens and idle players.
- Keeps dynamic color and ambient-light behavior updating during screensaver playback where Home Assistant/browser visibility allows it.
- Reduces screensaver motion and visual cost in Ultra Lite mode.

FLOW, Discover, library, search, queue, and lyrics:

- Replaces fixed FLOW category choices with a larger familiar style catalog.
- Applies the expanded style catalog to Discover too.
- Makes Discover recommendations less repetitive between opens.
- Shows the active player inside Discover.
- Adjusts Discover recommendation orbs on narrow screens so items do not overlap.
- Adds default library view setting for Grid or List while preserving manual per-page switching.
- Adds grid mode inside playlist and album drill-in views.
- Improves library navigation so it does not unexpectedly return to the main page.
- Adds History play-all.
- Adds like support to queue row actions with clearer visual feedback.
- Repositions queue row actions so like does not trigger row playback accidentally.
- Redesigns the lyrics panel with a more polished dynamic background, clearer typography, and better alignment across devices.
- Expands opened Studio panels and media sheets so they use more of the screen instead of half-height panels.

Flow Assistant:

- Adds response/open-time limits so assistant panels do not remain active too long.
- Fixes assistant dialogs opening behind the screensaver.
- Fixes screensaver Flow Assistant so it opens over the current screensaver without exiting it.
- Fixes an empty `Menu` overlay that could cover the correct player selector after a rebuild.

Localization:

- Adds Spanish localization. Thank you to Daniel Eduardo Gonzalez ([@danielxb-ar](https://github.com/danielxb-ar)).
- Adds Lithuanian localization. Thank you to Donatas / donatassmarterhome.
- Adds French localization, updated from the repository contribution and completed for the 5.7.0 keys. Thank you to Julien Moreau Brousseau and to Jingle Jew for wording corrections.
- Keeps Simplified Chinese localization bundled. Thank you again to [@gao19970120](https://github.com/gao19970120).
- Fixes French language selection staying in English after choosing French in the editor.

Bug fixes:

- Fixes the library loading spinner loop reported in issue #19.
- Fixes the fixed-height/tablet Section dashboard regression reported in issue #17 by respecting manual height and Section layout constraints more carefully.
- Fixes delayed media-control response and missing immediate UI feedback.
- Fixes idle player view missing the Home action.
- Fixes idle recommendations changing too aggressively while the idle page is open.
- Fixes overlapping elements in media/action menus and opened screens.
- Fixes broken-looking small icons, including the library icon treatment.
- Fixes tablet and mobile intermediate layouts losing access to controls.
- Fixes compact popup sizing on phones.
- Fixes player selector from Mini/compact opening the wrong tiny surface before the real selector.
- Fixes volume dropdown/preset z-index from compact cards.
- Fixes screensaver Flow Assistant panel layering.
- Fixes quick action state mismatches after playback starts.
- Fixes French localization registration and release packaging.
- Fixes release localization cache busting for the expanded language package.

## 5.6.1 - 2026-05-20

Release packaging hotfix for the Simplified Chinese language option.

- Fixes the visual-editor language dropdown not showing `简体中文 / Simplified Chinese` for some users after installing 5.6.0.
- Root cause: the Chinese dictionary and `LANGUAGE_OPTIONS` were present in the release, but the main card imported `./localization/index.js` without a version query, so Home Assistant/browser cache could keep the older language-options module.
- Adds release-time cache-busting to the packaged `dist/homeii-music-flow.js` localization import and to the dictionary imports inside `dist/localization/index.js`.
- Keeps runtime behavior otherwise unchanged from 5.6.0.

## 5.6.0 - 2026-05-20

Release focus: Flow Assistant voice commands, richer library browsing, radio artwork reliability, cleaner tablet/saver controls, and a full bug-fix rollup from the local 5.5.1 test cycle.

Highlights:

- Adds the experimental **Flow Assistant** voice command layer. It can be opened from the player, the empty-state music screen, and the screensaver. Voice commands are still experimental; failed examples, browser/device details, and community feedback are welcome so the matching can keep improving.
- Renames the voice dialog from `Voice assistant` to **Flow Assistant** and adds HOMEii Flow branding inside the assistant panel.
- Adds elegant microphone entry points in the empty-state player and screensaver, with better click feedback and guards against repeated delayed actions.
- Keeps the screensaver active while Flow Assistant is open, so touching the assistant dialog does not leave the idle display. The screensaver exits only when the user taps the empty background area.
- Adds optional previous/next controls to the screensaver when screensaver media controls are enabled.
- Adds library drill-in for playlists and albums: tapping an item can open its track list first, while a small `Play` button starts the whole item directly.
- Adds clearer tap feedback to library and recommendation content, including subtle loading feedback while playback starts.
- Adds `Clear all` as a selectable Quick Action with a red-toned icon and a small confirmation popup that explains it disconnects all active players before running.
- Improves media control states so shuffle, repeat-one, and repeat-all are visually clearer when active.
- Improves the empty-state wand area with calmer animation, spacing, and visual feedback.
- Bundles Simplified Chinese localization. Thank you to [@gao19970120](https://github.com/gao19970120) for the Chinese translation contribution.

Bug fixes:

- Fixes `_getAllocatedCardHeight` shrinking the card when Home Assistant reported a positive `getBoundingClientRect().top` during initial layout. The card now avoids losing height just because it is rendered lower on the page.
- Restores cleaner card fit after the height fix so the player does not create unnecessary page scrolling on normal tablet/desktop dashboards.
- Fixes rounded-corner leaks by clipping the host/card surface consistently and keeping internal layers aligned to the same radius treatment.
- Fixes radio playback cover art in the normal player. Radio stations that expose live `entity_picture` artwork now show that dynamic artwork in the main player, not only in the screensaver.
- Fixes the broken/empty radio cover slot by using safer artwork fallbacks and HOMEii branding when a station image cannot be loaded.
- Fixes radio layout spacing so the radio artwork, microphone action, metadata, and side actions no longer crowd or float in awkward positions on wide tablet views.
- Avoids false radio handling for normal songs or playlists that merely contain the word `radio` in their title or URI.
- Expands the radio country selector in the visual editor and in-card settings so users can choose from the full country list instead of a small sample list.
- Fixes visual-editor labels in the Flow Assistant section so they use readable text instead of underscore-style internal keys.
- Fixes visual-editor labels for assistant icon sizing and related controls.
- Renames the Quick Actions assistant option to **Flow Assistant** so it matches the user-facing feature name.
- Fixes repeat button ambiguity by distinguishing repeat-one from repeat-all in the active UI state.
- Fixes empty-player controls that sometimes required multiple taps before opening a panel or starting an action.
- Prevents stacked delayed actions from repeated taps on the empty-state wand/microphone area.
- Restores reliable Hebrew Flow Assistant matching for commands such as playing a song by artist and playing a playlist by artist/name after the local matching regression.
- Adds regression coverage for Flow Assistant command matching so common Hebrew play requests do not silently break again.
- Improves assistant failure handling so unsupported speech-service/browser failures are surfaced cleanly instead of looking like a successful command with an unrelated response.
- Fixes the screensaver Flow Assistant button so it opens the assistant without changing the clean screensaver layout or forcing an unwanted exit.
- Fixes library/recommendation click behavior so feedback appears immediately while Music Assistant starts playback.
- Tightens radio and missing-artwork fallback behavior across player and screensaver surfaces so both views resolve artwork from the same safer priority chain.
- Updates localization tests to include the new Simplified Chinese dictionary and language option.
- Updates release packaging so `src/localization/zh.js` is synced into `dist/localization/zh.js`.

## 5.5.0 - 2026-05-17

Released update from 5.4.2.

- Adds optional Home Assistant ambient light sync that maps the current artwork palette to selected `light.*` entities with brightness, transition, cooldown, and optional per-player light mappings.
- Adds an optional artwork screensaver with digital/analog clock modes, current cover, date, track metadata, configurable message, clock size, and clock position controls.
- Fixes the screensaver idle timer so it starts from the moment the card page becomes visible instead of inheriting idle time from a previous dashboard page.
- Adds an optional POWER button in the player controls that can stop the active player or call `toggle`, `turn_on`, `turn_off`, `scene`, or `script` actions on a selected Home Assistant entity.
- Adds fullscreen Discovery mode with cover-orb browsing, provider-backed mood/genre selectors, fresh/random playlist discovery, recent music, albums, and radio sections.
- Adds optional inline Up Next display and Night mode controls without forcing them into existing layouts when space is tight.
- Reworks responsive sizing around the actual card/container width and allocated height instead of only `window.innerWidth`.
- Adds ResizeObserver-driven layout recovery for dashboard column changes, sidebar changes, visual-editor open/close cycles, mobile rotation, kiosk views, and tablet/desktop resizes.
- Expands layout profiling with width, height, and aspect-aware classes so phone, phone-landscape, tablet, desktop, and short-height modes get different spacing and artwork budgets.
- Improves mobile/tablet/kiosk fit by tightening vertical budgets, preventing content overlap, containing artwork inside its frame, preserving larger artwork when space allows, and reducing accidental page scroll.
- Removes the old fixed `850` height from the default card config. The optional `height` config still works as a fallback/manual override, but the card now prefers the space Home Assistant actually gives it.
- Adds English and Hebrew localization dictionaries backed by shared translation helpers, visual-editor labels, and tests.
- Adds `HOW_TO_ADD_A_LANGUAGE.md` and `TRANSLATING.md` so future languages can be added by copying the English dictionary, translating values, registering the language, and rebuilding release artifacts.
- Improves the visual editor for ambient-light player mappings by using friendly field labels instead of internal helper names.
- Updates validators, mobile settings state, responsive layout tests, localization tests, and the release sync script so `src/localization/` is packaged into `dist/localization/`.

## 5.4.2 - 2026-05-14

Released update from 5.4.1.

- Removes the duplicate top settings gear and moves the tablet home shortcut to the upper corner opposite the side rail.
- Improves main-player artwork refresh by preferring live player artwork when the current queue item is stale.
- Adds announcement TTS language selection while keeping Auto mode on the Home Assistant Cloud default voice.
- Restyles the Players action tabs into a clean icon-only strip and moves `Player on this device` into the same row.
- Splits the red disconnect-all action into a separate labeled button and uses a dedicated speaker-group icon for grouping.
- Limits the pinned-player selectors to Music Assistant players, hiding browser/local Sendspin players to reduce setup confusion.
- Fully disables the Home shortcut while Studio is open and adds a short close-tap guard so closing Studio cannot also trigger Home navigation.
- Uses announcement preset defaults that match the selected interface language instead of always falling back to Hebrew.
- Removes the extra current-path helper row from the visual editor body.

## 5.4.1 - 2026-05-10

Distribution hotfix for the withdrawn 5.4.0 release.

- Republishes the 5.4.0 card fixes as `5.4.1` without adding a custom release zip asset, so HACS can use the normal repository release/tag contents and the complete `dist/` package.
- Keeps the runtime logic unchanged from 5.4.0; this release is intentionally limited to packaging/versioning.
- Bumps runtime/editor tags to `5.4.1` so Home Assistant browsers do not reuse cached `5.4.0` resources.
- Updates README and publishing instructions to avoid custom zip assets for HACS releases.

## 5.4.0 - 2026-05-10

Community fix cycle for tablet library artwork, local browser playback, search, queue ergonomics, player controls, and visual polish.

Player and local browser playback:

- Sets the default interface language to English instead of automatic language detection, while preserving explicit YAML and saved in-card language choices.
- Restores the local Sendspin browser player loader to the packaged `dist/sendspin-js/index.js` runtime instead of the broken dynamic bundle path.
- Fixes `This device` / Sendspin player startup errors after HACS/manual installs, including the invalid `./core/core.js` and missing `sendspin-js.bundle.js` paths.
- Makes the `This device` control behave as a smaller toggle in the Players screen, with clear connected/disconnected visual state.
- Improves local player connect/disconnect handling so repeated taps do not leave the UI in a half-connected state.
- Adds optimistic player volume state so sliders and percentages update immediately while Music Assistant/Home Assistant catches up.
- Fixes player-card volume controls so changing the slider updates the shown percentage.
- Fixes player-card mute so muting drops the visible volume to `0%`, and unmuting restores the previous volume when possible.
- Keeps mute/volume behavior aligned for normal Home Assistant media players and direct Music Assistant players.
- Updates the player icon to the regular speaker-style icon instead of the mute-looking speaker icon.
- Replaces the player-card red/green text badges with active/static equalizer bars; idle players now show a static gray bar instead of active animation.

Players, grouping, and actions:

- Reworks the mobile/tablet Players screen into one unified action hub for queue count, transfer queue, grouping, and stop-all controls.
- Removes the separate `Active players` button and the extra `Additional players` heading from the Players screen.
- Makes action tabs/cards smaller, calmer, and closer to the rest of the HOMEii Flow interface.
- Keeps a back path from player action screens to the Players screen.
- Moves group join controls into plus/minus buttons beside the player name instead of a separate checkbox row.
- Adds dynamic artwork-blur backgrounds to opened sheets and modals for a more premium visual feel.

Queue:

- Numbers the queue rows by visible position.
- Changes the queue header to show only a queue icon plus item count, with transfer queue staying in its own action.
- Removes extra queue/location wording that made the queue action row feel crowded.
- Replaces one-step move up/down controls with a direct position selector.
- Applies queue move-to-position immediately after selecting a number, without a separate Apply button.
- Closes the queue action row after a successful move so the interaction feels immediate.
- Preserves safer queue move behavior around the currently playing item and Music Assistant queue indexes.

Library, search, and artwork:

- Fixes tablet/mobile library artwork for built-in Music Assistant playlists by using the same lazy artwork hydration path as desktop.
- Keeps Music Assistant built-in playlist covers visible in grid/list layouts instead of falling back to generic icons.
- Improves nested Music Assistant artwork handling, including image objects, provider paths, metadata images, cover fields, artwork fields, and album metadata.
- Adds library/search image hydration after mobile library and search result rendering.
- Keeps the direct Music Assistant global search flow that can return provider results outside the local library.
- Adds a cached/library preview layer so mobile search can show useful results faster while the full Music Assistant search continues.
- Falls back through multiple Music Assistant search payload shapes and then local library search, improving compatibility across MA versions and providers.
- Keeps search results grouped by radio, playlists, albums, artists, tracks, and podcasts.

Quick Mix and recommendations:

- Smooths the Quick Mix transition so the UI no longer pauses on an empty-looking wand/choice screen before the selected mix appears.
- Remembers the list used to create a Quick Mix and places it first in the recommendations drawer.
- Keeps Quick Mix feedback centered when used outside Studio, while Studio suppresses noisy toast messages.

Visual polish and layout:

- Improves Android/tablet light mode readability across library, sheets, menus, text, and controls.
- Moves opened-screen logo/header treatment away from the center so it balances with the close/back controls.
- Updates library opened screens to combine title, actions, and current-player focus more cleanly.
- Makes library action controls circular icon buttons without the heavy container treatment on larger tablet layouts.
- Adds a compact player-focus bubble in the library toolbar with artwork, player name, state, group count, and equalizer state.
- Refines media list/grid cards, more-action buttons, spacing, opacity, and text hierarchy for a more premium feel.
- Removes the visual-editor settings gear from the in-card UI/settings mode path.
- Bumps the runtime/editor tags to `5.4.0` so Home Assistant reloads the refreshed editor and card bundle instead of cached `5.3.0` assets.

Documentation:

- Adds Active Player Helper documentation to the README, including setup steps and automation/template examples.
- Updates the packaged version, cache-busting example, and release checklist from `5.3.0` to `5.4.0`.

## 5.3.0 - 2026-05-07

Studio Evolution and community stability release.

- Adds local Studio scene saving: store the current selected players, visible player set, grouping intent, volume levels, and current media when Music Assistant exposes a playable URI.
- Adds saved-scene run/delete controls inside the Studio Scenes panel.
- Adds grouped-player summaries above the Studio wall so active groups are easier to understand before choosing actions.
- Adds direct Music Hub shortcuts for playlists, artists, albums, tracks, and radio.
- Adds a Studio Actions `Stop all` entry that uses the global stop flow for playback, queues, groups, and the local browser player.
- Adds target player, protocol, Direct API, realtime token, Sendspin, and player-count context to Studio Pro.
- Adds a shortcut from Studio Pro / Actions to the full Music Assistant interface.
- Tightens Queue Cockpit layout with a more opaque panel, contained source/target lanes, and safer internal scrolling.
- Fixes remote artwork handling by normalizing local, Home Assistant, and Music Assistant artwork URLs and avoiding private-network artwork URLs when the browser is connected remotely.
- Adds artwork cache-busting for current media so desktop browsers refresh cover art without requiring a full page reload.
- Replaces the missing-art screen with a HOMEii-style premium artwork fallback instead of the old oversized generic placeholder.
- Adds friendly in-card notices when Music Assistant config/player discovery is not ready, avoiding console-only startup errors.
- Adds optional `active_player_helper_entity` support for an `input_text` helper that receives the active player entity id for automations and templates.
- Adds first-startup README guidance for player discovery, remote artwork, Direct MA URL/token, HACS resources, and the optional active-player helper.

## 5.2.0 - 2026-05-05

Studio Focus Mode and Control Room release.

Studio experience:

- Rebuilds Studio around a clearer target-first flow: current control target, primary playback controls, and four main areas for Players, Music, Queue, and Actions.
- Keeps Studio powerful without turning the bottom bar into a wall of buttons: advanced tools now live inside contextual Music Hub and Actions panels.
- Upgrades the player wall with live player tiles, selected-state feedback, queue count, protocol/status badges, volume control, mute, play/pause, next, and clearer multi-player targeting.
- Adds multi-player control from Studio for play/pause, next, mute, stop, clear queue, group, ungroup, and visible-player management.
- Adds group-aware Studio behavior so selected or grouped players are easier to understand as one control target.

Music and queue tools:

- Adds Music Hub access to Studio search, full library browsing, Smart Mix, recent listening, favorites, and scene presets.
- Upgrades Studio Search with visual result cards and clear Play, Next, Add, Radio, and Like actions.
- Adds Queue Cockpit for source/target queue inspection, transfer, clone without deleting the source, refresh, and clear queue.
- Keeps advanced Music Assistant operations feature-detected so missing Direct MA API support hides or disables Pro tools instead of breaking the basic Studio.

Actions and Pro tools:

- Adds Studio access to timers/schedules, Announcement Studio, This Device Sendspin controls, and Pro diagnostics.
- Redesigns Announcement Studio with a clearer target chip, compact compose area, volume boost control, less-transparent panel treatment, and a calmer send action.
- Adds a weak-device Performance Mode that disables heavy blur, dynamic theme extraction, background motion, and heavy visual effects for smoother Nest Hub / older tablet use.

Bug fixes and polish:

- Fixes the Studio close-button overlap when opening Studio from compact mode after expanding to full screen.
- Fixes This Device Sendspin connection from Studio so the local browser player appears as a Studio tile and becomes the active Studio target.
- Fixes in-card Performance Mode toggling so it can be disabled from the card settings after being enabled.
- Fixes queue inline action open/close behavior so the action row responds immediately instead of briefly hiding the list.
- Tightens Studio panel opacity, shared card/button scale, icon alignment, text hierarchy, and RTL/Hebrew readability.

## 5.1.6 - 2026-05-03

In-card UI settings access fix.

- Keeps `Settings` permanently available in the main bar when `settings_source` is set to UI/in-card mode, even if saved settings, YAML, or older local state omit it.
- Locks the Settings item in the in-card main bar selector so it is clear that it cannot be disabled in UI mode.
- Bumps editor custom element tags so Home Assistant loads the refreshed visual editor after the release update.

## 5.1.5 - 2026-05-02

Home Assistant Dashboard picker registry fix.

- Mutates the existing `window.customCards` array in place instead of replacing it, matching Home Assistant's picker implementation which imports and keeps the original array reference.

## 5.1.4 - 2026-05-02

Stronger Home Assistant Dashboard picker registration.

- Re-registers HOMEii Flow custom-card metadata after module load to survive picker/resource load timing.
- Exposes picker config methods directly on the final `HomeiiMusicFlowCard` class instead of relying only on static inheritance.

## 5.1.3 - 2026-05-02

Home Assistant Dashboard picker fix.

- Registered HOMEii Flow with `window.customCards` using the element type expected by Home Assistant's card picker.
- Updated stub configuration to omit `type`, while preserving normal YAML usage with `type: custom:homeii-music-flow`.
- Disabled live picker preview and clear stale picker metadata from older loaded bundles so new cards do not open through the compact preview path.

## 5.1.2 - 2026-05-02

HACS README refresh.

- Republished the README updates in a new release so Home Assistant/HACS can pull the fixed logo, screenshots, personal project background, and Dashboard wording instead of older cached `5.1.0` content.

## 5.1.1 - 2026-05-02

HACS presentation fix.

- Updated README logo, preview, and screenshot links to absolute GitHub raw URLs so they render inside the HACS download screen.

## 5.1.0 - 2026-05-02

Feature and release-readiness update for the next repository distribution.

Highlights:

- Renamed the guided music experience from SIMPLE to FLOW.
- Added the FLOW wizard with clean state on open, reset controls on every step, player selection, mood/content choices, free-style mood search, visual result cards, playback confirmation, and automatic return to the main player.
- Reworked queue actions into an inline row expansion with clear play-next, play-now, move up/down, and remove controls.
- Added a clear transfer-queue label and queue count to the queue header.
- Improved artwork browsing so covers remain fully visible and selected artwork reacts immediately.
- Fixed the recent history drawer so it opens with the latest 10 items.
- Added lyrics font size controls.
- Polished Studio, opened panels, logo/header treatment, and action labels.
- Updated the global stop action to stop players, clear queues, disconnect groups, and disconnect the local Sendspin player when present.
- Updated release defaults for height, night mode, up-next, mic mode, settings source, dynamic theme, background motion, footer mode, font scale, artwork browsing, home shortcut, and liked mode.

## 5.0.0 - 2026-04-27

First stable public release for GitHub and HACS distribution.

Highlights:

- Stabilized the card on top of the `custom:homeii-music-flow` runtime path.
- Preserved the approved visual direction while avoiding intentional UI churn during the stabilization cycle.
- Added release tooling, versioned runtime snapshots, and a predictable deployment flow.
- Prepared the repository for HACS custom repository installation.
- Added a growing test foundation around the highest-risk pure logic areas.

Foundation work completed during the stabilization cycle:

- `4.8.8` tooling foundation, QA matrix, validators, editor locale, and release sync flow.
- `4.8.9` runtime/editor config validation and locale wiring.
- `4.9.0` state defaults and derived state helpers.
- `4.9.1` mobile settings normalization.
- `4.9.2` responsive layout helpers.
- `4.9.3` palette and dynamic theme helpers.
- `4.9.4` night mode and sleep timer helpers.
- `4.9.5` media queue and current-item matching helpers.
- `4.9.6` favorites and optimistic favorite-state helpers.
- `4.9.7` player, pinned-player, and grouping helpers.
- `4.9.8` media presentation helpers for artwork, metadata, lyrics, and duration formatting.
- `4.9.9` history, source-badge, and recent-playback helpers.

## 4.9.9 - 2026-04-27

- Final pre-release stabilization pass for history and source snapshot helpers.

## 4.9.8 - 2026-04-27

- Extracted media presentation helpers for artwork, lyrics, and formatting.

## 4.9.7 - 2026-04-27

- Extracted player and group identity foundations.

## 4.9.6 - 2026-04-27

- Extracted favorites and optimistic liked-state foundations.

## 4.9.5 - 2026-04-27

- Extracted media queue identity and matching foundations.

## 4.9.4 - 2026-04-27

- Extracted night mode and sleep timer foundations.

## 4.9.3 - 2026-04-27

- Extracted palette and dynamic-theme foundations.

## 4.9.2 - 2026-04-27

- Extracted responsive layout foundations.

## 4.9.1 - 2026-04-27

- Extracted mobile settings normalization foundations.

## 4.9.0 - 2026-04-27

- Extracted state defaults and derived-state foundations.

## 4.8.9 - 2026-04-27

- Wired config validation and editor locale through reusable foundations.

## 4.8.8 - 2026-04-27

- Introduced the release tooling, QA matrix, and initial foundation structure used by the stabilization cycle.
