# QA118 — current local round

Target: 192.168.1.171:8123 only. No Git push, release or external deployment.
Card: 6.0.0-beta.1. Engine: 1.0.0-beta.1.
Resource: /local/community/homeii-music-flow/homeii-music-flow-qa118.js?v=f88b975f
SHA256: f88b975f0f2b60148ee2e970744bb78836a1b724f3d5b47e713c569b98007618

## Implemented in QA116–118
- Timer: prevent rebuild recursion when immersive layout omits classic timer controls.
- Recommendation tiles: positioned, restrained pending feedback using the existing action lifecycle.
- Album play control: explicit visible 52px touch target; existing play handler retained.
- Light theme volume plus/minus: dark readable controls.
- Performance selector next to interface selector; classic-only controls hidden in immersive editor.
- Immersive performance profile removes blur/shadows, background motion and animation delays, uses fewer waveform bars; existing decoded-image cache limits retained.
- Context fan actions: default functional ordering, complete catalogue categories, saved ordering remains authoritative.
- Queue transfer visible; distinct transfer icon; group shortcut in player selector.
- Waveform request begins before duration metadata arrives, real MA analysis only. Unavailable analysis is retried without fabricating waveform data.
- Wheel preferences: device override, authenticated HA user scope, administrator global default, Engine persistence and rollback tests.
- Drag a single player onto an eligible target: preserves target membership, validates availability, waits for existing authoritative confirmation, floating preview, target highlight and confirmed transition to group. An already-grouped source must be disconnected first.
- Group connect/disconnect status animation represents confirmed operations, not optimistic success.
- Current-track radio shortcut uses existing MA radio-mode playback path.
- Engine saved playlists: save queue / media, append media, play using a single list command against the active queue, delete with confirmation.
- Engine onboarding: direct MA URL/token guidance, default IDs, card setup next step.
- Smart tools: volume limits with player, times, days, enabled state and deletion; existing Engine enforcement used.
- Live diagnostic module: immediate view, refresh every 15s while open/visible, no Run button; offline/unknown distinction; existing sanitized report export.
- Diagnostic style in its own stylesheet; green/yellow/red/gray states plus accessible labels.
- CarPlay/local audio: microtask queue batching and interrupted audio-context recovery on foreground. Physical verification remains pending user test tomorrow.

## Validation completed
- Card full suite: 450 passed, 34 existing skips (before last focused additions).
- Subsequent focused suites for new diagnostics, save deduplication, editor ordering and drag confirmation passed.
- Engine: 77 tests and repository validator passed.
- ESLint and production builds passed.
- Preview matrix: players, group, queue, albums, discovery, timers, announcements in light/dark at 390x844, 768x1024, 1024x768; no horizontal overflow or dock below viewport, no page errors.
- New screen preview: diagnostics, saved playlists, volume rules, players at phone/tablet/desktop widths; no horizontal overflow. 320px run halted because the harness waits for immersive controls hidden by compact mode; this is not a successful 320px certification.
- Live HA: Engine restarted, new capabilities visible, Smart and Engine playlist pages open, diagnostics returns actual connections/queue/artwork/waveform status.

## Acceptance still requiring verification
- Real CarPlay wired/wireless via This device: user will test tomorrow.
- Physical group longevity and drag on actual touch hardware; tests must remain limited to Computer/Kitchen.
- All device sizes and long running sessions cannot be certified by the preview matrix alone.
- MA cannot supply waveform immediately for every newly streamed track; never claim an unconditional waveform guarantee.
- Public beta release gates in RELEASE_READINESS_6.0.0_HE.md remain open; QA118 is a local test candidate.

## Architecture
New live diagnostics, volume-rule view and Engine playlist persistence are separate modules. Existing playlist UI, group and preference modules are extended rather than duplicated. Main bundled file remains about 3.99 MB (~895 KB gzip); splitting source files does not itself reduce the download. Deferred code loading is not yet introduced because resource/cache compatibility needs its own verified change.
