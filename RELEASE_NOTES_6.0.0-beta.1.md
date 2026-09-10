# HOMEii Music Flow 6.0.0 Beta 1

**Public beta — opt in deliberately and back up first.**

> [!WARNING]
> **Breaking upgrade from 5.9.3. Do not update the card alone.** Install and configure the matching Engine first, restart HA and confirm it loads. Back up the old card, resource URL, dashboard and HA before testing. Browser-direct MA credentials and the old Queue Actions fallback are not the supported 6.0 connection path.

## Highlights

- Artwork-driven immersive player, contextual action wheels, shared glass surfaces, responsive controls and optional classic presentation.
- Engine-backed playback, queue/library reads, authenticated artwork, favorites, player state and automation services.
- Library pagination, clearer search failures, stale-response protection, preserved album/playlist ordering and optional search-section ordering.
- Capability-dependent Sendspin, lyrics, discovery, playback preferences, spoken-media speed and configured MA AI Radio DJ controls.
- Bundled Heebo, RTL and community localization, including German from PR #89 by rtreichl.
- Fresh group confirmation, acknowledged volume/unmute handling, Stop-only stream controls and diagnostics.

## Before installing

Read [requirements, exact install order and rollback](docs/BETA_GUIDE.md). Use MA schema 63+ and the official MA integration. The Engine is mandatory. Do not assume every MA 2.10 build or every player supports all features. Download the matching Engine from its linked repository.

## Known beta limitations

Grouping has been exercised on the development speakers; other speaker/protocol combinations still need beta coverage. Safari/iOS background audio, sustained sessions, some viewport/safe-area combinations and hardware-dependent announcements require more validation. Lyrics and discovery depend on providers. 34 legacy frontend tests remain excluded because v6 uses the Engine backend. Automated tests do not replace physical-device testing. This is not a stable release or a promise of a fault-free installation.

## Update policy

Published as GitHub **Pre-release**, explicitly **not Latest**. Stable 5.9.3 remains the normal release. Users with beta updates/custom automations enabled may still install prereleases; disable those automations for deliberate manual testing. 

## Feedback

Use [card issues](https://github.com/r11a/homeii-music-flow/issues) or the [Engine tracker](https://github.com/r11a/homeii-flow-engine/issues) when accessible. Include card/Engine/HA/MA versions, device and player details, exact steps and redacted diagnostics. Do not post tokens, cookies or backups.


## German translation

Thank you to [Richard Treichl (@rtreichl)](https://github.com/rtreichl) for contributing German language support in [PR #89](https://github.com/r11a/homeii-music-flow/pull/89).


