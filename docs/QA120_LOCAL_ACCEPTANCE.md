# QA120 — local acceptance and remaining release gates

Target: 192.168.1.171:8123 only. Card 6.0.0-beta.1; Engine 1.0.0-beta.1. No external deployment, push or release.

Installed resource: `/local/community/homeii-music-flow/homeii-music-flow-qa120.js?v=f5e93caa`
SHA256: F5E93CAA4C1195DB435DDABBF6768A9FECDB2407C4CA023BB8866BB57FFB1955
Engine backup: `C:\Users\RONEN~1.RON\AppData\Local\Temp\homeii-engine-qa120-a680d8be75e343b19fd0045af2236bb0`
Engine updated runtime.py plus new player_timing.py. HA configuration check passed; restart completed after renewed explicit user approval.

## Confirmed live findings and fixes
- WiiM exposed stale player-level elapsed_time=0/timestamp while current_media held the newer paired clock. Engine and card now choose position and timestamp together from the newest valid snapshot, preserving zero. After restart, Center's progress advanced within the track rather than immediately showing its end.
- User authorized Center (מרכז) and Kitchen (מטבח) for this round. Group persisted over multiple minutes, a page exit and a full dashboard refresh. MA read-only query confirmed Kitchen synced to Center.
- Group volume changed both players; independent volumes were restored to Center 81%, Kitchen 46%. Kitchen mute/unmute confirmed through MA.
- Disconnecting Kitchen via the group volume view succeeded; Kitchen remained available for reconnect. Final group was disconnected, matching the initial state.
- A 15-minute timer on Kitchen survived HA restart and showed 8 minutes remaining. It was cancelled successfully afterward; no test timer remains.
- Per-player/group sliders are explicitly LTR, with 10px track / 24px thumb and 44px touch height in immersive mode. Percentage buttons open the existing volume wheel for the explicit player or group, without changing the selected player.
- Live Kitchen percentage opened Kitchen's wheel while Center stayed selected; mute/unmute updated both the row and wheel labels/pressed state.
- Compact wheel positioning prevents the close control/title from being clipped.
- Saved-playlist and volume-limit responses no longer reopen a screen after navigation. Compact saved-playlist layout no longer overflows horizontally.
- System screensaver settings additionally expose clock style, artwork, auto lyrics and the existing show-on-connected-screens command. Smart links follow Engine capability flags.
- Automatic screensaver is suppressed while an action catalogue or volume wheel is open.

## Verification
- Full card suite before final volume additions: 458 passed, 34 pre-existing skips, 59 files.
- Subsequent volume/group/runtime checks: 100 passed, 27 existing skips; extracted-volume focused check: 26 passed.
- Engine: 80 tests passed; repository validator passed.
- Lint and production build passed.
- Responsive screens: light/dark, phone and tablet; no horizontal overflow, visible scrollbars or out-of-viewport dock in measured cases.
- Diagnostics, saved playlists, volume limits and players also tested at 320px.
- Volume controls/wheel checked at 320/390/768/1440: LTR, 44px controls, title/close within viewport. Browser preview uses fixtures; live checks above are distinguished.

## Current-round completion map
See QA118_LOCAL_ROUND.md for individual implementations: recommendation feedback, album play, light volume contrast, immersive performance/editor, fan order and categories, queue transfer, player group shortcut, waveform retrieval, timer recursion, Engine operational views, device/user/global fan persistence, transitions, drag grouping, track radio, English onboarding, saved playlists, automatic diagnostics and local audio recovery.
New features are in dedicated modules or extend their existing logical modules. Volume UI synchronization was extracted from the base card into player-volume.js.

## Public beta gates still open
- Real wired/wireless CarPlay verification is reserved for the user tomorrow.
- Physical touch drag feel, prolonged playback and additional hardware/providers still need acceptance; a passing fixture matrix does not certify every display.
- The large legacy card/base files are not fully decomposed. This round adds modular boundaries without claiming a complete architectural rewrite or smaller bundle (about 4 MB / 897 KB gzip).
- 34 existing skipped tests and historical issue/release gates are not represented as resolved by this round. Public beta readiness remains separate from local installation.
- Waveform depends on real MA analysis; unavailable analysis remains a regular progress bar, never fabricated data.

## MA capability audit
The official MA 2.10 overview identifies configurable autoplay, Smart Shuffle, Smart Fades, AI Radio DJ, provider recommendations and player grouping as relevant listening capabilities:
https://www.music-assistant.io/blog/2026/08/26/music-assistant-2-10/
The existing Engine queue-settings adapter exposes only fields present in the connected server (including autoplay mode/playlist, smart shuffle and transitions). AI DJ requires the provider; track radio is a separate action. Recommendations use native MA folders. New experimental capabilities are not enabled solely from the version label.
