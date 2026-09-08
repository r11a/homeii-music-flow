# Changelog

## 6.0.0 - in progress

Release preparation (2026-09-08, local candidate):

- Add German from PR #89 by rtreichl, including automatic locale selection and the current action-label translation.
- Add configurable search section ordering (`search_result_order`, #86).
- Preserve MA album order when disc/track metadata is incomplete (#85); keep playlist order unchanged (#88).
- Distinguish failed searches from empty results, retain partial results, and reject stale responses when repeating a query (#83).
- Add capability-gated library pagination through Engine 0.7.21, with protection against failed or inconsistent later pages (#87).
- Use Stop for Stop-only streams in both the main player and player list (#75).

Reliability audit (2026-09-07, not a public release):

- Redesign action navigation and media/queue sheets with consistent buttons, dedicated icons, optional labels, and protection against duplicate submissions.
- Add server-supported global playback preferences for Autoplay, Smart Shuffle and transitions through the Engine, with partial updates and readback verification.
- Keep unavailable group-member volume unknown instead of displaying a false zero or an incorrect group average.
- Use MA's native upcoming-queue operation for “Play next”, avoiding stale local position calculations.
- Prefer real Spotify genre categories through MA browse, with explicit playlist-search fallback for providers without a matching category. Keep discovery and queue options in focused source modules.
- Add Crossfade with server readback; keep mounted queues visible during background updates and build move-position controls only for the expanded row.
- Unmute after an acknowledged positive volume change, preserve mute at zero, and report failed unmute commands. Verified on Computer.
- Confirm sleep-timer deadlines and cancellation in the Engine; roll back failed saves and do not resurrect removed timers. Verified persistence across page reload and cancellation.
- Unify menu, dialog, lyrics, history, Studio and toast surfaces with translucent graphite/white backgrounds and blur; remove conflicting artwork overlays.
- Discover by genre across selected music providers, MA genre-tagged library items and radio tags. Share concurrent loads and retain results during player refreshes.
- Surface failed group disconnections and partial announcement failures; prevent duplicate announcement dispatch and browser-timed volume restoration.
- Add authenticated HA Sendspin transport with Engine 0.7.7+; the MA token stays on the server. Engine 0.7.9 fixes background callback execution and reuses entity statistics snapshots.
- Browse individual podcast episodes, preserve episode media types, and surface failed detail requests instead of showing a false empty library.
- Add queue Autoplay using confirmed MA state; prevent successful batch notifications when a player action failed.
- Bundle Heebo locally, refine library covers and action icons, reduce repeated branding, and make action labels opt-in through the existing display setting.
- Fetch lyrics through MA's native metadata API, prefer synchronized lyrics, coalesce requests and permit retries after failure. Direct LRCLIB access remains opt-in.
- Preserve local Sendspin volume across reconnections; prevent stale player album metadata from contaminating podcast history.
- Fix narrow-screen heading clipping and logo aspect ratio; align header action icons and touch targets.
- Restore damaged Hebrew genre labels, search queries, control feedback and voice-command keywords; remove premature Studio volume success notifications.
- Send volume changes immediately with per-player serialization and latest-value coalescing; roll back failed changes without inventing mute state.
- Keep player and queue refreshes running during event bursts and refresh player state after acknowledged controls.
- Preserve Shadow DOM click targets across asynchronous menu handlers so player and media actions reach the selected control.
- Respect native player availability and coalesce catalog refreshes without keeping removed players indefinitely.
- Avoid replaying uncertain mutations over HTTP; distinguish queue read failures from confirmed empty queues.
- Preserve absolute queue indices and explicit current-item metadata in partial snapshots.
- Add a checksum-verified local deployment script that replaces the card only after the upload finishes.
- Live installation findings and remaining release checks: [reliability audit](docs/RELIABILITY_AUDIT_2026_09_07_HE.md).

Breaking change:

- HOMEii Music Flow 6 requires HOMEii Flow Engine. The card no longer runs through legacy frontend-only Home Assistant/Music Assistant fallback paths.
- The card is now the visual interface. HOMEii Flow Engine `0.7.2` or newer is the required backend for players, playback, queue, library, favorites, search, artwork, grouping, schedules, timers, statistics, announcements, diagnostics, and the authenticated Music Assistant API/event bridge.
- Engine 0.7.2 declares Music Assistant as a required Home Assistant dependency, validates MA 2.10 API schema 65 or newer, probes real library/search/full queue-item contracts before reporting Healthy, caches provider discovery, and exposes MA autoplay and Smart Shuffle queue state.
- Engine 0.6.1 added aggregated favorites reads and revisioned favorite mutations; the media-tab heart now opens the Liked page instead of acting as an ambiguous favorites-only filter.
- Browsing previous/next queue artwork now resolves the browsed item's cover instead of reusing the active player's `entity_picture`.
- Repeated library renders share one foreground request, stale card data remains visible during refresh, and an already-visible library is no longer replaced by a second loading screen.
- Large queue and library pages now use a bounded recycled DOM window with top/bottom spacers, nearby media details prefetch on intent, duplicate detail requests coalesce, stale renders are discarded, and diagnostics report menu render cost.
- Music Assistant commands now use one Engine-owned authenticated transport. The obsolete card-owned MA WebSocket/REST command path was removed to eliminate duplicate handshakes and browser token handling.
- Engine 0.5.3 and card 6.0.0 add last-known-good player, queue, library, and connection behavior, lazy artwork hydration, normalized previous/next queue artwork, and a bounded server-side artwork cache for smoother navigation during Music Assistant reconnects.
- `homeii_engine_mode` is normalized to `required`; old `auto`/`off` style behavior is intentionally unsupported.
- Browser-direct Music Assistant access is disabled for core card routing. `ma_url`/`ma_token` remain only for Sendspin/local-device browser playback; Engine MA credentials are configured in the HA integration.

Changed:

- The HACS runtime is now one self-contained JavaScript file: Sendspin, its Opus fallback decoder, and Embla are bundled instead of being loaded from sibling paths that HACS does not install.
- Removed the Google Fonts stylesheet import; the card now uses the Home Assistant/system font stack and works without a third-party font request.
- External LRCLIB lookup is now opt-in through `lrclib_lyrics_enabled` (disabled by default), while lyrics embedded by Music Assistant remain available locally. The README documents the endpoint and disclosed listening metadata.
- Player commands, playback, queue actions, queue transfer, library reads, search, artwork resolution, Music Assistant command calls, and group orchestration now fail closed when HOMEii Flow Engine is missing or too old.
- The visual editor, in-card diagnostics, and configuration docs now describe the Engine as mandatory instead of optional.
- Local HA favorite-button, local-liked, and card-side announcement dispatch fallbacks are disabled in Engine-required mode.
- Engine 0.5.1 now authenticates every MA API request, resolves the active queue with the MA 2.10 contract, merges full queue state with all queue items, proxies authenticated artwork without exposing the MA token, and safely replaces its realtime connection during HA options reload.
- The card subscribes to Engine-forwarded MA events and debounces queue, player and library refreshes, including automatic reconnect recovery.
- Engine 0.5.2 prevents local artwork proxy URLs from being registered as new artwork sources, preserves already-decorated queue/library items, and limits cache invalidation to relevant MA events.
- Progress-only MA events no longer force full queue/player/library renders. Structural events are coalesced, which prevents cover placeholders and visible flicker during playback.
- An Engine version change now clears stale queue, library, failed-image and blob caches automatically.
- Music Assistant URL/token fields were removed from the card and are now owned only by the Engine integration. Browser-direct MA and the built-in This Device/Sendspin player are disabled in Engine-only mode.
- Engine setup/options now accept a preferred internal MA URL and an optional external HTTPS fallback; authenticated realtime reconnect rotates between both addresses without exposing either credential to the card.

## 5.9.4 - 2026-07-12

Local stability candidate. Not published yet.

Fixed:

- Hides raw `media_player.*` entity ids from runtime player cards while keeping them available in configuration/editor flows.
- Adds a session-scoped queue snapshot cache so a fuller queue can survive dashboard navigation when Home Assistant later returns only a tiny partial queue window.
- Opens the direct Music Assistant interface from `ma_url` when `ma_interface_url` is still the default `/music-assistant` path.
- Keeps Library search input aligned to the active LTR/RTL layout.
- Reduces dynamic-theme aura strength on tablet layouts so the effect does not sit over the controls.
- Tightens progress calculation by keeping the selected player as the authoritative progress source and safely converting millisecond position values when the duration proves they are milliseconds.
- Adds Music Assistant 2.9 artwork compatibility by rebasing opaque imageproxy URLs through the configured browser-safe MA URL, avoiding unnecessary authenticated CORS preflights, and retaining the legacy path/provider endpoint as a compatibility fallback.
- Keeps current Now Playing artwork on Home Assistant's signed media-player proxy when available and does not replace a visible cover until the next candidate has decoded successfully.
- Preserves an absolute Music Assistant image host from the HA/MA payload instead of always rewriting it to `ma_url`; the configured external URL and legacy endpoint are now fallback candidates.
- Routes Queue and Library flow artwork through the guarded artwork loader instead of inserting unverified image URLs directly into the DOM.
- Keeps the center artwork stack on the current player's Home Assistant proxy outside an explicit pending-track transition.
- Shows and sends Stop instead of Pause for active streams that advertise Home Assistant Stop support without Pause support.
- Normalizes Home Assistant library items that omit `uri`, and keeps the refreshed Music Assistant favorites list authoritative over stale queue favorite flags so Radio favorites no longer silently no-op or visually roll back after a successful add.
- Records the Music Assistant server/schema version from the Direct WebSocket greeting for future diagnostics.
- Uses HOMEii Flow Engine 0.1.33's short-lived, opaque-token same-origin artwork proxy for Queue and Library covers when available, so browser clients no longer need direct Music Assistant image access.
- Falls back to the Engine's authenticated HTTP read bridge when Home Assistant's custom WebSocket command path stalls, preventing the card from silently dropping back to broken Direct MA artwork URLs.
- Clears stale Queue/Library artwork caches when the Engine item-artwork proxy becomes available, so old snapshots with failing MA imageproxy URLs do not keep reappearing after a refresh.
- Historical 5.x compatibility note: this local candidate still carried broad HA/MA compatibility routes. The 6.0.0 breaking-change line above removes those routes and requires HOMEii Flow Engine.

Validation target:

- `node --check src/homeii-music-flow.js`
- `node --check src/core/base-music-card.js`
- `npm.cmd run build`
- Focused Vitest coverage for player-card labels, Music Assistant interface launch, queue snapshot cache, and progress timing.
- Full Vitest suite passed locally: 26 files, 243 tests.

## 5.9.3 - 2026-06-20

Focused stability release for queue, search, configured-player selection, Radio favorites, progress timing, and Diagnostics.

Fixed:

- Detects partial Music Assistant queue snapshots instead of treating them as a clean OK state.
- Keeps fuller rendered queue data when a new queue API response only contains a partial window.
- Makes configured `entity` work as a stable default player while preserving query-string overrides and currently active playback priority.
- Shows entity ids in player-selection surfaces to help users distinguish duplicate friendly names.
- Continues provider/direct Music Assistant search after fast library results, then merges provider results back into the UI.
- Uses Direct Music Assistant `music/search` for provider search when direct access is available.
- Fixes RadioBrowser/external radio favorite handling so selected stations do not depend on the currently playing item.
- Keeps LTR search input alignment scoped to non-RTL layouts.
- Improves progress calculation by preferring trusted player timing when queue timing drifts.

Diagnostics:

- Adds Diagnostics v7.
- Adds a Configured entity check that explains whether the configured entity exists, is visible, is excluded, is a Music Assistant player, or was overridden by another selection source.
- Adds Search providers checks that report HA search, Direct `music/search`, active query, result counts, and timing for fast/library search versus provider search.
- Improves Queue UI state and Queue snapshot wording when only a partial queue window is available.

Validation:

- `node --check src/homeii-music-flow.js`
- `node --check src/core/base-music-card.js`
- `npm.cmd run build`
- `npm.cmd test`
- Full Vitest suite passed locally: 231 tests.

## 5.9.2 - 2026-06-16

Focused hotfix for in-card Settings and Diagnostics access.

Fixed:

- Fixed the in-card Settings screen crash: `this._settingsSectionAnnouncements is not a function`.
- Restored the Announcements section inside in-card Settings.
- Restored access to Music Assistant Diagnostics from the in-card Settings screen.
- Clarified the no-player/setup message when a direct Music Assistant URL is configured without the Home Assistant Music Assistant integration. Direct/Sendspin access does not replace the HA integration path.

Notes:

- This release does not change playback or queue resolution logic.
- Users affected by empty Queue screens should update to 5.9.2, open Diagnostics from the card, and share the report while Music Assistant shows a queue but HOMEii shows an empty queue.

Validation:

- `node --check src/homeii-music-flow.js`
- `node --check dist/homeii-music-flow.js`
- `npm.cmd test -- tests/runtime-baseline.test.js tests/settings-accordion.test.js`
- Production build and release artifact sync passed locally for `5.9.2`.

## 5.9.1 - 2026-06-15

Focused stable update for playback stability, group usability, diagnostics depth, Music Assistant 2.9 recommendation hooks, screensaver lyrics controls, and small routing fixes.

Added:

- Clearer group management experience with per-player status labels: Connected, Master, Tap to join, Will join, Will remove, and Disconnects all.
- The group screen now keeps every player visible, including the selected/current master player, so the group owner is always explicit.
- Update Group and Disconnect All now use matching side-by-side actions in the mobile group screen.
- Group change summary so users can see exactly what will be added or removed before pressing Apply Group.
- Diff-based group apply logic: removing a speaker only unjoins the removed speaker and does not clear the whole group, so the remaining connected speakers should keep playing.
- Safer group screen actions: the group page now uses one Update Group action, so removing a single speaker is done by marking that speaker for removal and applying the change instead of pressing a full ungroup button.
- A distinct Disconnect All group action is available again for users who intentionally want to break the whole group.
- Group volume shortcut on the main player volume row. It appears only when the selected player is part of a group and opens the group volume controls directly.
- Favorites-only filtering for mobile library pages, including a Music Assistant-only favorites path for Radio so it does not mix external RadioBrowser results with saved MA favorites.
- Radio source mode for the mobile Radio library: Combined, Music Assistant first, Music Assistant only, or RadioBrowser only.
- Diagnostic v6 with selected-player source, group-state visibility, queue UI state, and warnings when queue APIs return data but the rendered queue is empty.
- Diagnostic v6 probes browser artwork loading, authenticated artwork fetch fallback, and rendered artwork DOM health so external-access image failures are tied to the exact display path.
- Diagnostics now reports the group service path, including `media_player.join`, `media_player.unjoin`, selected/group owner identity, and current members.
- Historical note: HOMEii Flow Engine bridge infrastructure was introduced here as optional preparation for a future integration. HOMEii Flow 6.0.0 makes that Engine path mandatory and removes the fallback behavior.
- Native Music Assistant 2.9 recommendation support for HOMEii recommendations and Studio Mix flows when the direct MA API is available.
- Screensaver can automatically open Lyrics mode while music is playing, while keeping the normal clock mode when idle.
- Configurable screensaver Lyrics controls for Sync lyrics, Smaller lyrics, and Larger lyrics when Screensaver controls are explicitly enabled.
- Screensaver can now be configured from a dedicated Screensaver section in the visual editor.

Fixed:

- Restores the 5.9.0 playback service path so `music_assistant.play_media` remains the primary playback call and does not get replaced by generic `media_player.play_media` fallback behavior.
- Keeps query-string player override behavior from 5.9.0 while avoiding configured-player selection logic that could interfere with real playback.
- Queue Flow now refreshes the selected queue before opening, reducing stale or empty queue screens after recent playback changes.
- Diagnostics now applies a valid queue snapshot back into the card UI state when the queue API returns items but the rendered queue is empty.
- Wide/desktop lyrics view keeps font-size, sync, and timing controls visible and horizontally scrollable when space is tight.
- The mobile Radio tab can avoid RadioBrowser entirely when Music Assistant-only mode is selected, reducing extra calls and visual noise for users who only want MA stations.
- Group selection no longer resyncs over unsaved user changes while the group modal is open.
- Removal-only group changes no longer call `join` again for the remaining speakers.
- Group changes now wait for Home Assistant to confirm the expected group state before showing success, avoiding false "done" feedback when the backend ignores or rejects the change.
- Opening the group screen from a group member now rebases add/remove actions onto the actual group owner instead of accidentally treating the selected member as the leader.
- Removing the current group master from a member-selected view is treated as an intentional full-group disconnect, matching Home Assistant/Music Assistant behavior instead of pretending it can be removed like a normal member.
- Unchecking the selected master is also treated as an intentional full-group disconnect.
- Clean All confirmation now stays a compact confirmation dialog in edge-to-edge and compact-popup contexts instead of inheriting full-screen queue-action sizing.
- Cross-origin hydrated artwork now uses direct browser image loading instead of a `fetch()` blob path that can be blocked by CORS when Home Assistant is opened through an external URL.
- Cross-origin Music Assistant `imageproxy` artwork can now use authenticated fetch-to-blob loading when `ma_token` is configured, fixing external HTTPS/Nabu Casa cases where raw `<img>` loading cannot pass Authorization.
- Library List/Grid preference is honored across library pages, search results, liked entries, and artist album sections instead of forcing Grid in several render paths.
- Screensaver Lyrics auto-open respects manual dismissal per track, so closing Lyrics does not immediately reopen it for the same song.

Validation:

- Full Vitest suite passed locally: 229 tests.
- Production build and release artifact sync passed locally for `5.9.1`.

## 5.9.0 - 2026-06-03

Major mobile, diagnostics, settings, and community release after the 5.8.x stabilization cycle.

Added:

- Optional `card_id` YAML key. When set, HOMEii Flow namespaces browser-storage keys by the chosen id so multiple dashboards in the same browser can keep separate player selection, theme, layout, pinned/excluded players, screensaver settings, and other in-card customizations.
- `src/core/state/card-id.js` foundation helpers with validation and storage-key scoping coverage.
- `card_id` validator and visual-editor field in the Connection And Behavior section.
- Settings accordion sections for Display, Players & Library, Quick Actions & Bar, Voice Assistant, Smart Home & Screensaver, Announcements, and Music Assistant.
- Targeted Settings refresh path for high-frequency toggles so pinned/excluded players, Quick Actions, footer/main bar items, library tabs, player sort/order, screensaver controls, and discovery mode no longer rebuild the whole card on every click.
- Query-string player override support through `?player=kitchen_sonos`, `?homeii_player=kitchen_sonos`, and card-scoped `?homeii_player_<card_id>=kitchen_sonos` links.
- Optional phone edge-to-edge mode so the normal mobile layout can occupy the full viewport and open menus as frontmost full-screen layers.
- Fast Queue Flow is now part of the default mobile Quick Actions set, while still removable from Quick Actions when a user does not want it.
- A clearer Players screen action hub with four icon-and-text actions: This device, Queue, Groups, and Clear all.
- Phone display mode now exposes Edge to edge as part of the layout-mode choice instead of a separate toggle, with a top X button that returns the card to Full mode.
- Queue includes a dedicated Fast Queue Flow entry button and a distinct queue-flow icon.
- Library pages now offer the same vertical wheel browsing style for playlists, artists, albums, tracks, liked items, radio stations, and artist-detail albums.
- Artist album wheel opens as a dedicated full-screen Queue Flow-style page with its own close button instead of rendering inside the artist albums section.

Migration note:

- Adding `card_id` to a card that previously had no `card_id` will appear to reset that card's in-card customizations once. The old global values stay in localStorage under their original keys; the card just starts reading from card-scoped keys.

Fixed:

- Preserves complete queue snapshots when Home Assistant first returns a partial or empty queue after starting a playlist, avoiding the beta 8 regression where only one or two tracks appeared.
- Visual-editor diagnostics on mobile now still shows the diagnostic report when the HA Companion/browser blocks clipboard access; copy failure is reported as a warning instead of replacing the report.
- The player-selected toast now appears near the top so it does not cover the volume slider.
- Full-screen mobile sheets and menus receive edge-to-edge sizing in phone edge-to-edge mode, reducing layer overlap between controls.
- Visual-editor diagnostics uses explicit readable colors so Home Assistant theme variables cannot produce low-contrast text.
- Visual-editor player settings list strict Music Assistant players instead of every generic Home Assistant `media_player`, while preserving already configured legacy ids.
- Danish localization placeholder fixes from PR #56 so runtime variables such as `{player}`, `{title}`, `{count}`, and `{remaining}` resolve correctly.
- Mobile library toolbar keeps the Library Wheel button compact so it does not overlap search, sort, player focus, or quick action buttons on phone-width screens.
- Radio and artist-album wheel pages now use a single Queue Flow-style scroll stage, with cleaner captions for album year and station name.

Community credits:

- Thanks @tocDK for the Danish localization work and the PR ideas around `card_id`, settings performance, artwork cache behavior, and follow-up Danish placeholder fixes that were incorporated into 5.9.0.

## 5.8.2-beta.8 - 2026-06-03

Focused beta follow-up for issue #28 after beta 7 exposed the next Home Assistant service-call layer.

Release focus:

- Keeps exposed `music_assistant` services as a valid integration signal even when the config entry reports `not_loaded`.
- Still passes the discovered `config_entry_id` to Home Assistant `music_assistant` service calls when the services require it, fixing `required key not provided @ data['config_entry_id']` library failures.
- Removes `queue_id` from the Home Assistant `music_assistant.get_queue` diagnostic path so HA receives only the selected `entity_id`.
- Improves Diagnostic v3 wording for generic HA fallback players, so Alexa/other fallback entities are no longer described as strict Music Assistant-marked players.
- Softens queue diagnostics when a fallback selected player has no Music Assistant queue identity.

Validation:

- Targeted lint and runtime/settings regression tests passed before the release version bump.
- Full lint, full Vitest, production build, and release artifact sync were run for the final beta package.

## 5.8.2-beta.7 - 2026-06-02

Targeted beta follow-up for issue #28, Diagnostic v3, and the phone Queue Flow entry point.

Release focus:

- Keeps HOMEii usable through the Home Assistant Music Assistant integration when HA exposes `music_assistant` services even if config entry lookup returns `not_loaded`.
- Allows generic HA `media_player` entities as Music Assistant compatibility fallback targets only when the integration service signal exists.
- Upgrades in-card and visual-editor diagnostics to Diagnostic v3 with integration signal, strict/fallback player counts, selected-player markers, queue providers, library providers, browser context, Direct API, and Sendspin checks.
- Classifies browser-blocked Direct API failures such as CORS/preflight or `Failed to fetch` as optional access-path warnings when the HA integration is available.
- Removes the phone Queue Flow button above the artwork and keeps Queue Flow available through Quick Actions.
- Removes the invalid `limit` payload from the HA `music_assistant.get_queue` queue snapshot path.
- Keeps diagnostics privacy redaction for external/private hostnames.

Validation:

- Targeted lint and runtime/settings regression tests were run before the release version bump.
- Full lint, full Vitest, production build, and release artifact sync were run for the final beta package.

## 5.8.2-beta.6 - 2026-06-02

Cache-busting beta rebuild for the Diagnostic v2 privacy and queue-artwork fixes from beta 5.

Release focus:

- Publishes the diagnostics privacy fix under a new version so Home Assistant, HACS, and browser resource caching reliably load the updated frontend bundle.
- Redacts external/private hostnames in visible and copied diagnostics output by default, while preserving protocol, host type, port, and path category for troubleshooting.
- Adds a Queue artwork sample check so diagnostics can distinguish between an empty/unreachable queue and queue items whose artwork cannot be resolved.
- Adds a close button to the visual-editor diagnostics panel.
- Keeps all beta 5 Diagnostic v2, HA integration-first, Sendspin/browser, queue, library, and artwork checks.

Validation:

- Full lint, full Vitest, production build, and release artifact sync were run for the final beta package.

## 5.8.2-beta.5 - 2026-06-02

Targeted beta follow-up for Diagnostic v2, visual-editor diagnostics, Sendspin/browser diagnostics, and Home Assistant integration-first operation.

Release focus:

- Upgrades the in-card Diagnostics screen to Diagnostic v2 with browser, viewport, Home Assistant URL, access path, mixed-content, Direct Music Assistant, Sendspin endpoint/support, queue, library, and artwork checks.
- Keeps diagnostics readable in the UI with green OK, red FAIL, yellow WARN, and blue INFO rows, plus a copyable report for GitHub issues.
- Adds a Diagnostics button to the Home Assistant visual editor near the version label, so setup checks can be run before opening the full card settings screen.
- Redacts external/private hostnames in visible and copied diagnostics output by default, while preserving protocol, host type, port, and path category for troubleshooting.
- Adds a Queue artwork sample check so diagnostics can distinguish between an empty/unreachable queue and queue items whose artwork cannot be resolved.
- Adds a close button to the visual-editor diagnostics panel.
- Treats the Home Assistant Music Assistant integration as the primary supported path: playback, HA queue snapshots, selected-player checks, and player artwork can still work when direct Music Assistant access is not configured.
- Avoids rendering Music Assistant `/imageproxy` paths as broken Home Assistant artwork when the browser cannot directly reach Music Assistant.
- Reports Direct/Sendspin issues as optional access-path diagnostics when the Home Assistant integration is available, rather than implying that the whole card is broken.

Validation:

- Targeted runtime and media foundation tests passed after the source fixes.
- Full lint, full Vitest, production build, and release artifact sync were run for the final beta package.

## 5.8.2-beta.4 - 2026-06-01

Targeted beta follow-up for Music Assistant troubleshooting, invalid direct URL handling, Danish localization, and low-resource artwork cache behavior.

Release focus:

- Adds an in-card Diagnostics screen under Settings > Music Assistant that checks Home Assistant connectivity, Music Assistant services/config entry state, visible MA players, selected player, `ma_url`, mixed-content risk, direct MA API reachability, WebSocket status, and a small library smoke test.
- Adds a copyable diagnostics report so users can paste one clean report into GitHub issues instead of scattering logs across discussion threads.
- Treats Home Assistant Music Assistant ingress URLs as invalid `ma_url` values for Direct MA API use and tells the user to leave `ma_url` empty or use the direct Music Assistant Web Server URL.
- Adds a short cooldown after failed direct MA API calls such as `404`/`405`, preventing repeated request storms when `ma_url` points to the wrong endpoint.
- Scales the decoded artwork LRU cache by `performance_profile`, reducing memory pressure for `lite` and `ultra_lite` dashboards while keeping the default profile unchanged.
- Adds Danish (`da`) localization and exposes it in the language picker.

Validation:

- Targeted runtime, localization, and state-derived tests passed after the source fixes.
- Full lint, full Vitest, production build, and release artifact sync were run for the final beta package.

## 5.8.2-beta.3 - 2026-05-31

Targeted beta follow-up for Music Assistant setups where Home Assistant reports the MA config entry as `not_loaded` while direct Music Assistant access is configured.

Release focus:

- Stops using a discovered Music Assistant config entry when Home Assistant reports that entry as anything other than `loaded`.
- Falls back to the direct Music Assistant API for library browsing when HA service calls fail because the MA config entry is unavailable.
- Falls back to direct Music Assistant queue playback for selected players that expose an active queue when `music_assistant.play_media` fails with an MA availability error.
- Adds regression coverage for `Music Assistant entry not_loaded`, direct library fallback, and direct playback fallback.

Validation:

- Targeted runtime, player foundation, and voice-assistant matching tests passed after the source fix.

## 5.8.2-beta.2 - 2026-05-31

Targeted beta follow-up for the main artwork placeholder regression on Music Assistant 2.8.x browser players.

Release focus:

- Falls back to the active player `entity_picture` when the mobile main artwork stack has no queue artwork/current queue item to display.
- Prevents the phone main screen from rendering the artwork placeholder when Home Assistant already exposes valid `media_player_proxy` artwork for the selected player.
- Adds runtime coverage for the Music Assistant 2.8.x browser-player payload shape reported in issue #41.

Validation:

- Targeted runtime and media foundation tests passed after the source fix.

## 5.8.2-beta.1 - 2026-05-31

Beta validation release for the now-playing artwork regression reported after 5.8.0/5.8.1.

Release focus:

- Restores the 5.7.x priority for current now-playing artwork by preferring the Home Assistant player artwork (`entity_picture` / media player proxy) before Music Assistant queue image-proxy artwork.
- Loads selected-player and control-room queue snapshots through the Home Assistant Music Assistant service first, using Direct MA only as a fallback when the integration does not return usable queue items.
- Keeps Music Assistant queue artwork priority for pending queue transitions so tapping a queue item still updates the title and artwork atomically while the player catches up.
- Adds runtime regression coverage for HA-first queue snapshots, the current-artwork priority, and the pending queue-artwork exception.
- Updates the release workflow so beta tags such as `v5.8.2-beta.1` are published as GitHub pre-releases and are not marked as Latest.

Validation:

- Targeted runtime and media foundation tests passed.
- Full ESLint passed.
- Vite production build passed.
- Release artifacts were regenerated and synced into `dist/`.

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
