# HOMEii Music Flow 6.0.2

September 27, 2026 · Stable release · Companion: [HOMEii Flow Engine 1.0.2](https://github.com/r11a/homeii-flow-engine/releases/tag/v1.0.2)

A rotating action fan, consistent icons and typography, smoother artwork transitions, Brazilian Portuguese, and player-selection fixes. The main player's layout remains unchanged.

## Upgrade

**From 5.9.3: install and configure the Engine first.** Music Flow 6 requires the separate HOMEii Flow Engine integration and the official Music Assistant integration. Back up HA and the current dashboard/resource, install Engine 1.0.2, restart HA, and verify the MA connection before installing card 6.0.2. Music Assistant API schema 63+ is required; optional actions remain capability-dependent.

**From 6.0.x:** retain your Engine entry and card configuration. Update the companion Engine to 1.0.2 and restart HA, then update the card and fully reload each browser/Companion App. Engine 1.0.2 is a maintenance package with the same runtime behavior as 1.0.1; this card introduces no new backend API requirement or storage migration.

Keep exactly one card resource. For manual installations use `/local/community/homeii-music-flow/homeii-music-flow.js?v=6.0.2`; HACS users retain the HACS-managed URL. Do not load an old dated module alongside the new file.

[Installation and rollback guide](https://github.com/r11a/homeii-music-flow/blob/v6.0.2/docs/INSTALL_STEP_BY_STEP.md)

## New design and interaction

- Continuous rotating action fan with drag momentum and alignment to the selected action. Icons and labels stay upright; compact screens show three actions and wider fans show five.
- New rotating `rotate-3d` trigger, staged fan-unfold opening, and a soft dissolve on closing.
- Pull an action upward and release to select it. After the upward threshold, the fan dissolves and the selected action runs once. Short pulls, cancellation, or moving back below the threshold do not execute an action; sideways dragging rotates the fan.
- Smooth artwork crossfades with subtle scale motion. Repeated updates for the same artwork preserve the current transition; rapid track changes clean up the previous animation.
- Consistent local SVG icon system based on Lucide, Heebo typography, and shared dark/light surfaces across menus, lists, tiles and settings.
- Subtle pressed states for transport and dock controls. Reduced-motion preferences and Ultra Lite mode are respected.
- Existing main-player geometry, custom HA icon support, action availability and saved fan ordering are preserved.

## Configuration and accessibility

- Main-bar ordering is editable in settings and through seven optional `mobile_main_bar_item_1` … `mobile_main_bar_item_7` slots. Unspecified selected items retain their relative order; duplicates and unavailable slots are ignored.
- Home remains a valid main-bar item. Main-bar and quick-action controls are available in the immersive visual editor.
- `show_empty_quick_shelf: false` hides idle recommendations and skips their loading work.
- The full action catalog manages focus, supports Escape, and returns focus to its trigger. Closing fans are made inactive, and animation frames, timers and resize observers are cleaned up on disposal.
- Brazilian Portuguese (`pt-BR`) is available in configuration, the visual editor and automatic locale detection, with dictionary/placeholder regression coverage.

## Newly shipped fixes and contributions

| Reference | Included in 6.0.2 | Credit |
|---|---|---|
| [Issue #99](https://github.com/r11a/homeii-music-flow/issues/99) | Physical speakers are no longer treated as external browsers solely because their name or ID contains `sendspin`. Manual, pinned and Sticky selection retain the real speaker. | [@JustinGT](https://github.com/JustinGT) |
| [PR #100](https://github.com/r11a/homeii-music-flow/pull/100) | Configured pinned/excluded players survive missing or blocked localStorage in kiosk WebViews; existing stored preferences still take precedence. | [@cjlist](https://github.com/cjlist) |
| [PR #103](https://github.com/r11a/homeii-music-flow/pull/103) | Brazilian Portuguese translation, locale registration and distributable dictionary. | [Gabriel Caputo / @gabrielcaputo](https://github.com/gabrielcaputo) |

The #99 and #100 source fixes were on the repository after 6.0.1; 6.0.2 is their first tagged card package.

## Previously resolved reports retained in this release

These are cumulative 6.x improvements, **not newly fixed by 6.0.2**. Links retain the original reports, discussion and contributors.

| Reports | Resolution already included |
|---|---|
| [#65](https://github.com/r11a/homeii-music-flow/issues/65), [#95](https://github.com/r11a/homeii-music-flow/issues/95) | Favorite handling and the current-track action sheet, including supported playlist actions. |
| [#68](https://github.com/r11a/homeii-music-flow/issues/68), [#79](https://github.com/r11a/homeii-music-flow/issues/79), [PR #84](https://github.com/r11a/homeii-music-flow/pull/84) | Queue retrieval and full snapshots for large queues. |
| [#69](https://github.com/r11a/homeii-music-flow/issues/69), [#97](https://github.com/r11a/homeii-music-flow/issues/97) | Configured/default player selection and Sticky/Master behavior. |
| [#73](https://github.com/r11a/homeii-music-flow/issues/73) | Direct Music Assistant interface URL/port handling. |
| [#74](https://github.com/r11a/homeii-music-flow/issues/74), [#93](https://github.com/r11a/homeii-music-flow/issues/93) | Tablet background treatment and swipe/touch isolation. |
| [#75](https://github.com/r11a/homeii-music-flow/issues/75), [#77](https://github.com/r11a/homeii-music-flow/issues/77) | Capability-aware Stop controls and MA-aligned playback commands. |
| [#81](https://github.com/r11a/homeii-music-flow/issues/81), [#82](https://github.com/r11a/homeii-music-flow/issues/82) | Engine-owned authenticated transport replacing browser-direct MA authorization/CORS paths. |
| [#83](https://github.com/r11a/homeii-music-flow/issues/83) | Search request ordering, partial results and failure feedback. |
| [#85](https://github.com/r11a/homeii-music-flow/issues/85), [#88](https://github.com/r11a/homeii-music-flow/issues/88) | Album and playlist ordering. |
| [#86](https://github.com/r11a/homeii-music-flow/issues/86), [#87](https://github.com/r11a/homeii-music-flow/issues/87) | Search section ordering and paginated library retrieval. |
| [#92](https://github.com/r11a/homeii-music-flow/issues/92) | Display controls and Home navigation; 6.0.2 extends main-bar ordering and idle-shelf controls. |
| [#94](https://github.com/r11a/homeii-music-flow/issues/94), [#98](https://github.com/r11a/homeii-music-flow/issues/98) | Track-state refresh and artwork recovery; 6.0.2 adds cover-transition polish. |

## Still open

- [#96](https://github.com/r11a/homeii-music-flow/issues/96): interaction between permanent Music Assistant groups and ad-hoc grouping. This release does not claim to resolve it.
- [#72](https://github.com/r11a/homeii-music-flow/issues/72), [#76](https://github.com/r11a/homeii-music-flow/issues/76), [#78](https://github.com/r11a/homeii-music-flow/issues/78), [#101](https://github.com/r11a/homeii-music-flow/issues/101), [#102](https://github.com/r11a/homeii-music-flow/issues/102) remain outside the fixes claimed here. Per-user family configuration and Assist STT announcement dictation are not newly implemented.

## Credits

Product direction and maintenance: **Ronen Atsil / HOMEii**. Thanks to **Gabriel Caputo**, **@cjlist** and **@JustinGT** for this release's translation, patch and reproducible report; **@rtreichl** for German; **@greytuk** for large-queue work; and all existing translators and testers credited in the README. Thank you to **@AkoreJepade, @drshaw-lab, @SPESINO, @KeviinCosmos, @ewiottenhof-create, @faduchesne, @heullin, @wtevin2003, @Zulfurion, @wimjanse, @SDHall15, @dumet12138, @jcleek and @mic62** for the linked 6.x reports.

Built on **Home Assistant, Music Assistant, HACS, Sendspin and Embla**. Icons: **Lucide / Feather contributors** under the included ISC/MIT notices. Typography: **Heebo contributors** under the bundled font license. Codex assisted with implementation and verification. HOMEii is an independent community project.

## Verification and limits

- All 61 card test files pass: 512 tests passed, 37 legacy tests skipped. Lint and production build pass; committed distribution artifacts are verified by release CI.
- Main-player geometry compared with the pre-design version at 320 px and 390 px widths; light/dark, compact, library and settings flows checked locally.
- The design build was installed on a live local HA dashboard. Icon, Heebo, fan opening and upward selection of Queue were verified; both plain and gzip HTTP responses matched the build.
- Speaker playback, every provider, and long-running multi-room behavior are not certified by these UI checks. Existing player/provider capability restrictions still apply.

For a 6.0.1 rollback, restore its single card resource and reload clients. For a full 5.9.3 rollback, follow the linked guide and review Engine schedules/rules that remain active independently of the card.
