# Changelog

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
