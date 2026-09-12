# Beta 2 — single release tracker

Updated: 2026-09-11. Local planning document; no publication authorized by this tracking request.

Baseline: card 6.0.0-beta.1 and Engine 1.0.0-beta.1. Preserve published tags/assets. Ship a coordinated Beta 2 when ready and approved; do not scatter individual changes into releases. Determine whether an Engine release is needed from actual changes, not by assumption.

## Implemented locally — not installed or released

- [ ] **CarPlay recovery:** `src/sendspin-js/index.js` now resumes the media element after AudioContext recovery and rechecks playback intent after the await. Does not restart intentionally stopped playback. Regression tests in `tests/sendspin-scheduler.test.js`; 11 focused scheduler/auth tests passed. This fixes a recovery gap, NOT a confirmed CarPlay root cause. No device validation yet.
  - User reports this-device playback works without CarPlay, but repeatedly cuts out with wired AND wireless CarPlay, foreground/background/screen off. Latest iOS reported, exact version unknown.
  - Next: prepare/install a test build when requested, validate in the user's car. If unresolved, capture audio-context/media-element states, buffer/runway, connection and sync events rather than guessing or repeatedly auto-resuming.

## Requested — not implemented

- [ ] **Compact player redesign:** dedicated compact composition, balanced cover/metadata/transport, fixed slim bottom toolbar and low-height contextual fan with usable touch targets. Retain selected-player name, fan and expand access. Relevant available actions only. Larger workflows open expanded and return to compact on close. Preserve existing playback behavior and test narrow/wide, RTL/LTR, light/dark.
- [ ] **Hide source/quality badges:** community request for separate provider (e.g. Spotify) and audio-quality (e.g. Lossless) visibility options. Discussed positively; not implemented. Final defaults not approved; avoid silently changing upgraded configurations.

## Investigation / clarification

- [ ] **Issue #74 tablet beta regressions:** Lenovo TB-8505FS, HA Companion / Android WebView; historical viewport 853x533. Reports wrong progress, missing artwork, flickering and delayed next-track display. Active-player selection and lyrics reportedly work well. Historical Motion Off workaround applies to 5.9.3; NOT yet verified for beta.
  - Reporter confirms same tablet and cannot find Settings/Diagnostics. Capability exists; do not describe it as absent or conclude user is blocked before checking navigation.
  - User-confirmed path: fan → all settings → Smart → Diagnostics; also available in visual editor. English label may be System health; verify exact released labels before further instructions.
  - Navigation reply posted: https://github.com/r11a/homeii-music-flow/issues/74#issuecomment-5630300970
  - Await fresh beta diagnostics/screenshots and current MA/Engine versions. Existing diagnostic report is 5.9.3 and cannot validate the beta backend. Attached beta images still need visual inspection. Keep issue open; no fix claimed.
- [ ] **Community Home shortcut request:** existing return-to-player routes already exist. Clarify whether requester means HOMEii main player or HA dashboard before adding duplicate navigation. No implementation/product decision yet.
- [ ] **Engine explanation:** clarify prominently that HOMEii Flow Engine is a custom HA integration, not an App/add-on; Engine is branding. Explain why v6 requires it and MA remains responsible for providers/playback. User-facing reply drafted in conversation; no new documentation edit or publication performed for this item.

## Release discipline

- [ ] Review actual diff and tests; do not include unrelated README whitespace or old untracked marketing artifacts.
- [ ] Verify compact layout and affected screens on phone/tablet, light/dark, RTL/LTR; confirm diagnostics/settings discoverability.
- [ ] Record remaining hardware limitations honestly, particularly CarPlay; no claim of resolution without actual validation.
- [ ] Produce accurate changelog/install notes from completed work only; distinguish card and Engine changes.
- [ ] Obtain release instruction before publishing Beta 2; do not overwrite Beta 1 or make stable users auto-upgrade.

Keep this file updated as requests, implementation and validation change. Earlier broad beta-preparation requests must not be assumed unresolved or completed from conversation alone; inspect the implementation before carrying additional items forward.

## Local test installation — 2026-09-11

Installed to 192.168.1.171 only; no GitHub publication. Card JS + gzip backed up and replaced. Resource cache key `local=0608bdb6`; SHA256 `0608BDB689D9240E1BA2E7174A5E683C9E2313C50CA0229A7DECABE864A5A881`.

- CarPlay recovery gap fix included; still awaits physical CarPlay validation.
- Compact player now reuses main dock/fan and player picker, with low fan geometry, selected-player name, expand control, visible progress and balanced layout. All-actions catalogue expands and returns to compact on Back. Visually inspected demo at widths 360/420, dark/light; real tablet/touch acceptance still pending.
- Added `show_source_badge` and `show_quality_badge` to visual editor and runtime; omitted settings preserve existing badge visibility. No Engine change required.
- Corrected compact light-theme volume control contrast.
- 482 tests passed, 34 existing skips; lint and build passed. Final follow-up catalogue expansion and contrast changes built/linted after full suite.
- Issue #74 not fixed: code confirms Settings intentionally redirects to visual editor when visual settings are selected. Fresh reporter diagnostics still needed for artwork/progress/flicker.
- Home shortcut remains clarification-only. Engine documentation improvement remains pending.

This section supersedes earlier implementation/install status above; it is a local candidate, not a published Beta 2.

### Compact refinement installed locally — 2026-09-11
Removed inline volume row; dock percentage opens existing volume wheel. Cover column enlarged to 34%, transport fixed at 44/52/44px, waveform constrained to 26px, bottom dock inset, collapsed card height 272px to remove legacy empty space/clipping. Local SHA256 5010A43581C9288D3C287DA90D97FBF539AAD74C0907CAB0D24F4B29B5657002. Build/lint passed. Inspected bathroom dashboard without playback commands. No publication.

Compact follow-up: progress row increased from 28px to 36px to add approximately 4px breathing room above and below. Built and installed locally only.

Compact spacing final: explicit 12px gaps above and below the 26px progress tier; upper tier 152px, dock 48px, shell padding 4px. Cover capped at 152px to preserve tier spacing. Supersedes prior 36px progress-row adjustment. Build passed; installed JS/gzip locally on 192.168.1.171, verified SHA256 56836EEFBB41D414E5A548AE5B2636B223F10C506078B869CE1E804B36AE11A3. Resource key local=56836eef. Live bathroom-dashboard screenshot verified equal spacing and unclipped dock; no playback commands. No publication.

Compact icons: reuse E2E maximize/minimize SVGs for expand/collapse; muted compact volume percentage shows volume_mute icon and restores percentage when unmuted. Build passed; local installation only, resource local=d3d171c9. Live mute-state verification pending.

Compact dock refinement: swapped player and fan positions in compact layout; expand/collapse arrows reduced to 18px while preserving touch targets. Build passed, installed locally on 192.168.1.171; cache local=4066393e. Live compact screenshot verified. No publication.

Compact library shortcut: reused existing library button between fan and volume; compact search shortcut remains hidden. Build passed, deployed locally only with cache local=469e649f. Live screenshot verified placement.

## Beta 2 release audit — 2026-09-13

Publication authorized by user. Card 6.0.0-beta.2 uses Engine 1.0.0-beta.1 unchanged.
Completed: compact redesign/dock/fan/spacing/library shortcut; provider/quality badge toggles; library snapshot isolation by query; wheel touch propagation fix (#93); audio-route resume gap. Lint and 484 tests passed (34 existing skips); release build passed.
Screensaver: Engine setting was disabled locally. Enabled and saved; automatic activation visually verified with clock/artwork/track info. No Engine code fix required. System resource already registered.
Open: CarPlay interruptions remain despite earlier recovery fix; #74 tablet artwork/progress/flicker needs reporter device validation; Home shortcut clarification pending. Other older issues already addressed in Beta 1 remain awaiting reporter confirmation; do not close blindly. See RELEASE_NOTES_6.0.0-beta.2.md for current scope; historical unchecked entries above are superseded only where explicitly completed here.
Local bundle SHA256 C8E9F0AC8428C44C3696A8DE03ED2D40144F8755AD8C2D4AA1602364FE9C239E.
