# HOMEii Flow Beta 1 — tester guide

Use Music Flow **6.0.0-beta.1** with Flow Engine **1.0.0-beta.1**. This is an opt-in test release, not a replacement for stable 5.9.3.

## Install safely

1. Back up Home Assistant, dashboard YAML and the existing JavaScript resource/file.
2. Confirm music plays on one speaker in native Music Assistant.
3. Follow the [Engine setup](https://github.com/r11a/homeii-flow-engine#installation). Install the complete `custom_components/homeii_flow` directory and restart HA.
4. In HA, open Settings → Devices & services → Add integration → HOMEii Flow Engine. The onboarding form explains the direct MA URL and MA API token. Keep instance/profile defaults for a single setup. Do not use the HA URL, ingress URL, or a Spotify key as the MA connection credentials.
5. Submit and resolve any authentication/schema/network error before continuing. Confirm the Engine loads and exposes its entities.
6. Follow the [card upgrade guide](BETA_GUIDE.md#safe-upgrade-from-593). Replace the existing resource; do not register old and new versions together. Reload the browser and verify both versions in diagnostics.
7. Start at a comfortable volume with one speaker. Add groups, timers and lighting only after basic playback works.

## First test session (about 15 minutes)

| Test | Expected result |
|---|---|
| Open diagnostics | Version/connection status is visible; errors are actionable |
| Play, pause, next, previous | Real player changes match the card |
| Seek | Seekable track moves to the selected position; live streams need not support it |
| Volume and mute | Actual volume/mute matches; repeated operations remain reliable |
| Search and recommendations | Grid scrolls vertically; recommendation row swipes horizontally; phone has two columns |
| Album/playlist | Whole-item Play/actions work; item actions remain available |
| Queue | Current item refreshes, drag reorder persists after reopening |
| Choose player | Selected name is visible; returning from the picker restores the original screen |
| Optional group | Connect two compatible players; close/reopen and verify real membership; disconnect |
| Light/dark and small screen | Text is readable, controls do not overlap, screens can be closed |
| Optional This device | Audio starts after interaction; report browser/background/CarPlay separately |
| Optional lyrics/waveform | Show available data; absence of provider timing or analysis must not fabricate it |

For an extended test, listen for 30–60 minutes, change tracks/providers and reopen the dashboard. Record delays, stale state and reconnect behavior. Compare failures with native MA. Test schedules/announcements only on an appropriate speaker and remove test schedules afterwards.

## Report a bug

Use [the structured bug form](https://github.com/r11a/homeii-music-flow/issues/new?template=beta_bug.yml). Engine-only problems can go to [the Engine tracker](https://github.com/r11a/homeii-flow-engine/issues). One reproducible problem per issue; search existing issues first and add evidence there when it matches.

Include exact Card, Engine, HA and MA versions; browser/OS; player model/protocol; steps; expected/actual result; frequency; and whether native MA behaves the same. For visual issues include screen size, light/dark and performance profile. Redact tokens, cookies, addresses and personal information from logs/screenshots. Never upload a full HA backup.

Use [feedback](https://github.com/r11a/homeii-music-flow/issues/new?template=beta_feedback.yml) for suggestions. Forum replies are welcome, but actionable bugs should have a linked issue so they can be tracked.

## Tracking and retesting

The issue is the record: reproduction → investigation → fix reference → version to retest → tester confirmation. Do not close an issue merely because a change was coded. Maintainers should link a fix and request verification when hardware-specific behavior cannot be reproduced locally.

## Rollback

Restore the old card file/resource and dashboard configuration. Disable beta-created timers/schedules before removing the Engine. Restore the matching HA backup if backend state also needs reverting. Keep native MA available throughout testing.
