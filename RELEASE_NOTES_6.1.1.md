# HOMEii Music Flow 6.1.1

Stable patch release · 25 October 2026 · Companion: HOMEii Flow Engine 1.1.0 (unchanged).

## Continuous artwork browsing

- Fix artwork browsing stopping after the next cover: load the complete queue on demand when the player initially has only a small now-playing snapshot.
- Support consecutive mouse drags as well as touch swipes. Dragging browses; tapping selects. Suppress the accidental click generated after a mouse drag.
- Keep browsing usable when an artwork image fails to load or decode, using the normal fallback instead of blocking navigation.
- Restart the ten-second return-to-current-track timer after interaction and avoid resetting in the middle of a gesture or transition.
- Apply queue loading to vertical cover browsing and mouse-wheel navigation too.

## Updating

From 6.1.0: update the card in HACS, then refresh your dashboard clients. No Engine update or configuration migration is required. Keep only one HOMEii JavaScript resource. If you use a manually configured local test resource, switch it back to the HACS-managed resource to receive this release.

**Upgrading from 5.9.3 is a breaking migration:** install and configure HOMEii Flow Engine first, and back up your dashboard configuration and old card before replacing it. Follow the [step-by-step installation and upgrade guide](docs/INSTALL_STEP_BY_STEP.md).

This patch fixes cover browsing. It does not claim to resolve Spotify provider rate limits or Music Assistant playback-lock timeouts.

## Verification

- 555 tests passed; 37 existing tests skipped.
- Lint and production build passed.
- Consecutive browsing and automatic return verified on the local Home Assistant dashboard; user confirmed the fix.
