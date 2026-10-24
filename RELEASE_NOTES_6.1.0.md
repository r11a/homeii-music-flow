# HOMEii Music Flow 6.1.0

Stable release · 24 October 2026 · Companion: [Engine 1.1.0](https://github.com/r11a/homeii-flow-engine/releases/tag/v1.1.0).

## Upgrade first: Engine, then card

**BREAKING MIGRATION FROM 5.9.3:** version 6 requires the HOMEii Flow Engine Home Assistant integration. Do not replace a working 5.9.3 card before installing and configuring the Engine. Back up Home Assistant, dashboard YAML and the current resource. See the [beginner installation guide](docs/INSTALL_STEP_BY_STEP.md).

For existing 6.0.x users: back up HA, update Engine to 1.1.0, restart HA and confirm the integration is loaded. Then update the card to 6.1.0 and refresh all dashboard clients. Keep exactly one HOMEii JavaScript resource. Do not delete the integration entry to upgrade. New Engine-dependent controls are capability-gated.

## Playback and responsiveness

- Native MA play_media route without fetching the entire playlist before playback. Immediate navigation to the player with non-blocking feedback and real MA artwork/state updates.
- Repeated identical selections are coalesced. While a request is running, only the newest pending selection is retained; stale UI responses cannot override newer navigation. MA cannot cancel a play_media operation already executing on its server.
- Faster player feedback, prioritized initial library artwork and local MA image-proxy preference.
- Correct library WebSocket registration in the companion Engine; dedicated, scoped event subscriptions for non-admin users.

## Interface

- Classic, Floating Ribbon and Orbit wheel styles; translucent adaptive surfaces and a glass navigation strip. Petal settings migrate to Ribbon.
- Unified library artwork, Play/More positioning, RTL alignment, category contrast, detail typography and action surfaces.
- Smaller queue drag icons with the existing touch target preserved.
- Explicit E2E collapse persists across refresh, including visual-settings configurations.
- Retired FLOW 3 settings migrate to Immersive.
- Album-artist filtering and up to five pinned favorite radio shortcuts per card/device (not shown in compact tiles).

## More useful smart-home controls

- Smart → Scenes: saved player/group/media/volume/artwork-lighting scenes, backed by the Engine and callable from HA automations.
- Optional gradual wake-up volume (up to ten minutes), temporary suspension of volume limits and a fix for wake volume 0% incorrectly becoming 35%.
- Optional finite queue copying without stopping the source. The destination queue is replaced and playback starts at the beginning of the current track; this is not speaker synchronization.
- Optional announcement dictation through HA Assist STT. Select it in the visual editor; HTTPS, microphone permission and a configured STT pipeline are required. Browser recognition remains the default; Assist failure does not silently send audio to a browser cloud recognizer.
- MA 2.11 statistics where supported, including corrected top-track names/timezone and genre distribution when supplied by MA.
- Clearer diagnostics and support for routing cards to separate Engine instances. HOMEii profile IDs do not themselves create MA user/provider access boundaries.

## Community credit

Thank you **[Roy75 / Kobra](https://github.com/Roy75)** for the Dutch translation in [PR #105](https://github.com/r11a/homeii-music-flow/pull/105). Existing German credit remains with [Richard Treichl / rtreichl](https://github.com/rtreichl), and thanks to all community translators and bug reporters.

## Validation and known limits

Card suite: 549 passed, 37 existing skips; Engine suite: 109 passed. Lint/build and focused upgrade-compatibility regressions passed. Live local checks covered library playback, seeking, queue reordering, E2E persistence and Engine startup. These are not exhaustive hardware certification.

Actual multi-account MA permissions, microphone/Whisper, physical Safari devices and reporter-specific static groups still need field confirmation. Queue copy and wake fades have automated coverage but have not completed live multi-speaker/audio acceptance. Copy rejects dynamic, same-group, incomplete and over-2,000-item queues. In-progress wake fades cancel at HA shutdown; saved schedules persist. NSPanel native Flutter rendering is not supported by this JavaScript card.

## Rollback and reporting

To return to the previous stable pair, reinstall card 6.0.2 and Engine 1.0.2, restart HA and restore the previous resource URL. New scenes and other 1.1-only options are not supported by the old Engine. For exact restoration, restore the pre-upgrade HA backup, including Engine storage and dashboard configuration. To return to 5.9.3, restore its card/resource and dashboard backup; disable Engine schedules/automations you no longer want running.

Report issues with both versions, HA/MA versions, browser/device, reproduction steps and redacted diagnostics from Smart → Diagnostics. Never post tokens, passwords or full unredacted configuration.
