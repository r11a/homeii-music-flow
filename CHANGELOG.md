# Changelog

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
