# HOMEii Music Flow 6.0.0 Beta 1

**Draft release notes — not published.** Requires **HOMEii Flow Engine `1.0.0-beta.1`**. [Engine repository](https://github.com/r11a/homeii-flow-engine) · [Complete beta guide](docs/BETA_GUIDE.md).

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

Read [requirements, exact install order and rollback](docs/BETA_GUIDE.md). Use MA schema 63+ and the official MA integration. The Engine is mandatory. Do not assume every MA 2.10 build or every player supports all features. Public access to the currently private Engine repo/package must be arranged before publication.

## Known beta limitations

Group persistence and device-specific DLNA remain under investigation. Safari/iOS background audio, sustained sessions, some viewport/safe-area combinations and hardware-dependent announcements require more validation. Lyrics and discovery depend on providers. Some requested capabilities and 34 legacy skipped tests remain open. This is not a stable release or a promise of a fault-free installation.

## Update policy

Planned as GitHub **Pre-release**, explicitly **not Latest**. Stable 5.9.3 remains the normal release. Users with beta updates/custom automations enabled may still install prereleases; disable those automations for deliberate manual testing. Do not publish this file as a release until the final numbered packages and downloads have been checked.

## Feedback

Use [card issues](https://github.com/r11a/homeii-music-flow/issues) or the [Engine tracker](https://github.com/r11a/homeii-flow-engine/issues) when accessible. Include card/Engine/HA/MA versions, device and player details, exact steps and redacted diagnostics. Do not post tokens, cookies or backups.
