# HOMEii Music Flow 6.0.0-beta.2

**Opt-in BETA, not a stable release. Compatible with HOMEii Flow Engine 1.0.0-beta.1.**

> **Upgrading from 5.9.3 is a breaking upgrade.** Back up Home Assistant and your dashboard first. Install and configure the [Engine custom integration](https://github.com/r11a/homeii-flow-engine) before updating the card. Follow the [installation and rollback guide](https://github.com/r11a/homeii-music-flow/blob/v6.0.0-beta.2/docs/INSTALL_STEP_BY_STEP.md). Stable users can stay on 5.9.3.

## What changed

- **Compact player redesigned:** larger artwork, balanced transport controls, equal spacing around the progress display, and an inset bottom bar with player name, action wheel, library, volume and expand controls. Volume opens the existing wheel; mute replaces the compact percentage with a muted-speaker icon. Fine expand/collapse arrows retain comfortable touch targets. All-actions opens expanded and returns to compact.
- **Library response isolation:** cached responses for different sorting, favorites, search, page size and offsets no longer share one revision slot. An older cached response for another filter could previously be rejected and appear empty until changing filters. Older responses for the same query are still rejected.
- **Dashboard swipe isolation (#93):** wheel touch events stay inside the card instead of bubbling into dashboard swipe navigation. Pointer rotation remains available.
- **Optional artwork badges (#92):** separate visual-editor/YAML settings `show_source_badge` and `show_quality_badge`. Both retain their previous visible default; set either to `false` to hide it.
- **Local playback recovery:** resume the media element after recovering an interrupted AudioContext, while respecting a stop that occurs during recovery. This is **not a confirmed CarPlay fix**.
- Updated beta guidance to reflect the public Engine repository and the compatible Beta 2 / Engine Beta 1 pairing.

## Screensaver and settings

The **system screensaver** is configured under the action wheel → All actions → Smart → Screensaver. Enable it and choose **Save to Engine**. It is separate from the card's own screensaver preferences. The dashboard resource `/homeii_flow/homeii-flow-system-screensaver.js` must be registered as a JavaScript module for system-wide operation. On the local installation, enabling the previously disabled Engine setting restored automatic activation; no Engine code update was needed.

For card settings, use the Home Assistant visual card editor when visual settings are selected. Diagnostics are available in the editor and under **Smart → System health** in the card.

## Known limitations — please read

- **CarPlay remains unresolved:** repeated playback interruptions were reported with wired and wireless CarPlay, including foreground, background and locked-screen use. Do not upgrade expecting this to be fixed.
- **Issue #74 remains open:** missing artwork, progress timing, flickering and delayed next-track updates on the reported tablet still need device-specific verification. No blanket fix is claimed.
- The requested Home shortcut is awaiting clarification (HOMEii player vs HA dashboard).
- Other existing provider/device-specific issues remain open pending reproduction or reporter confirmation; this release does not claim every open issue is resolved.

## Upgrade from Beta 1

1. Keep your configured Engine 1.0.0-beta.1; this card update does not require an Engine reinstall or HA restart.
2. In HACS choose the prerelease `6.0.0-beta.2`, or replace your existing card JS with this release's asset.
3. Keep exactly one card resource registered. Fully reload your browser/companion app.
4. Verify the version in diagnostics. Test opening the library without changing filters, the compact dock, and wheel navigation.
5. To roll back, reinstall card `6.0.0-beta.1` and reload. Returning to 5.9.3 requires restoring the previous card configuration/resource; see the rollback guide above.

## Validation and feedback

Lint passed; 484 tests passed, with 34 existing skips. Hardware CarPlay validation is outstanding. Report exact card/Engine/MA/HA versions, device/browser, reproduction steps and redacted diagnostics using [GitHub Issues](https://github.com/r11a/homeii-music-flow/issues). Never include API tokens or backups.
