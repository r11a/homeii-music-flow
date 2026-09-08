# HOMEii Flow Beta — your music, throughout your home

**Prepared versions: Music Flow `6.0.0-beta.1` + Flow Engine `1.0.0-beta.1`.**

Status: source and documentation preparation only. No beta release or tag has been published as part of this preparation. Stable users should remain on **5.9.3** until they deliberately choose a published beta.

| Project | Role | Repository |
|---|---|---|
| HOMEii Music Flow | The dashboard experience: artwork, library, contextual controls and player selection | [Card](https://github.com/r11a/homeii-music-flow) |
| HOMEii Flow Engine | The Home Assistant integration: authenticated MA access, shared state and automation services | [Engine](https://github.com/r11a/homeii-flow-engine) |

The Engine repository is currently private. A missing/404 page may mean access is not granted. Public accessibility or a deliberately published Engine package must be resolved before opening the beta to everyone; there is no public download promise yet.

> [!WARNING]
> **UPGRADING FROM 5.9.3 IS A BREAKING CHANGE. DO NOT UPDATE ONLY THE CARD.**
>
> Music Flow 6 requires HOMEii Flow Engine. Install, configure and verify the matching Engine **before** replacing the 5.9.3 card. The old browser-direct Music Assistant URL/token connection and Queue Actions fallback are not the supported 6.0 backend. Without a working Engine the new card will not provide normal music controls.
>
> Back up Home Assistant, your dashboard YAML, resource URL, current card file and any existing Engine before testing. Keep a working way to use native Music Assistant. Do not use this beta as your only way to control important announcements or time-sensitive automations.

## What makes this beta different

HOMEii Flow brings a music-focused interface to the dashboard: the current artwork shapes the atmosphere, the main player puts listening controls first, and contextual action wheels keep useful actions close to your thumb. The Engine gives that interface a shared backend inside Home Assistant, instead of asking each browser to maintain its own direct MA connection.

| Experience | Included in the candidate | Availability and limits |
|---|---|---|
| Immersive player | Prominent artwork, dynamic colors, glass surfaces, larger controls and responsive layouts; existing presentation remains selectable | Artwork, viewport and device performance affect the result; full device validation is ongoing |
| Contextual actions | Wheels for the active screen, dedicated icons, optional action labels and access to additional actions | Actions depend on server, player and media capabilities |
| Playback and volume | Seek, playback controls, volume changes, unmute after an acknowledged positive volume change and Stop-only streams | Seek needs seekable media; not every radio stream or player supports every command |
| Queue | Retained queue during refresh, active-queue resolution, item actions and drag reordering | Provider and player behavior remain subject to beta testing |
| Library and search | Albums, artists, tracks, playlists, radio and podcasts; paginated library reads; configurable result section order | Only connected providers and exposed APIs can return content; service outages remain possible |
| Discover | Genre-based discovery combining available provider results, MA library matches and radio sources | This is not unrestricted access to Spotify editorial catalogs; provider capabilities govern available results |
| Lyrics | MA metadata lookup, synchronized lyrics when supplied and an artwork-aware view | Lyrics are not guaranteed for every track; direct LRCLIB lookup is opt-in |
| This device | Sendspin playback through an authenticated HA/Engine transport | Requires MA support and browser audio permission/user interaction; mobile background behavior varies |
| Multi-room | Player selection, group operations and queue transfer | Group persistence is still under investigation on the test setup; do not assume every player combination is stable |
| Smart playback | MA Autoplay, crossfade, playback preferences and spoken-media speed controls | Only when supported; speed applies to supported podcasts/audiobooks, not ordinary music |
| AI Radio DJ | Select/configure the queue DJ from hosts already set up in MA | Requires the corresponding MA 2.11 beta APIs/plugin/configuration. Model, voice and host setup stays in MA; provider costs may apply |
| HA automation | Engine schedules, timers, volume policies, announcements, entities and diagnostic services | Actions can affect real speakers even while the card is closed; test with one selected player |
| Language and typography | Bundled Heebo, RTL/Hebrew, German and the existing community translations | Some newer inline interface text may still use English fallback; translation feedback is welcome |

These are implemented candidate capabilities, not a guarantee of identical behavior across every provider, browser or speaker. Unavailable actions are intended to stay hidden and return when available; please report exceptions.

## Requirements and compatibility

| Requirement | Beta expectation |
|---|---|
| Card / Engine pair | Use `6.0.0-beta.1` with `1.0.0-beta.1`; earlier development Engine versions are not the recommended beta pair |
| Home Assistant | Engine metadata declares HA `2025.1.0` as its floor; this is not certification of every release since then. Prefer a current supported HA release and report your exact Core version |
| Music Assistant | Running server with **API schema 63 or newer**, a valid MA API token and the official Music Assistant HA integration loaded |
| MA versions | Development testing includes MA 2.10/2.11 beta work; do not infer support for every 2.10 build. The schema handshake and capability checks decide compatibility; some early builds do not meet the schema requirement |
| Players | At least one working MA player exposed through the official HA integration; verify it in native MA first |
| Network | HA must reach MA's HTTP(S) server/API address and WebSocket endpoint; include the actual port. An HA ingress page is not an MA API URL |
| Browser | A modern browser; secure HA access is recommended, particularly for microphone and browser playback features |
| Installation access | Ability to install a custom HA integration and add/update a dashboard JavaScript module; HACS is optional |
| Optional features | Connected music providers, a supported TTS provider for speech, MA AI Radio configuration for DJ controls and browser permission for local playback |

The Engine is a **custom integration**, not an add-on, not a replacement for Music Assistant and not a replacement for the official MA integration. It does not create provider subscriptions or turn unsupported speakers into MA players.

## Safe upgrade from 5.9.3

1. **Record what works.** Note HA/MA versions, current card version, selected players and the existing dashboard resource URL. Save dashboard YAML and any browser-specific preferences you want to recreate. Browser storage is device-local and may not be covered by an HA backup.
2. **Back up before changing either component.** Keep the 5.9.3 JavaScript file and resource URL. If an Engine is already installed, preserve its component directory and take a full HA backup that includes its stored configuration. Do not post backups or API tokens in an issue.
3. **Confirm native MA first.** Play/pause and inspect the queue of one test speaker in MA. Resolve MA connection/provider problems before testing the new card.
4. **Install Engine `1.0.0-beta.1` first**, following the Engine guide below. Restart HA; copying Python files alone does not load the integration.
5. In **Settings → Devices & services → Add integration**, add **HOMEii Flow Engine**. Enter the real MA server URL, port and MA API token. Optional external MA URL is a server fallback, not your HA ingress dashboard URL.
6. If upgrading an existing development Engine, retain its configured entry and use **Configure → General settings** as needed. Do not delete and recreate entries as a routine upgrade step. The `1.0.0-beta.1` name does not itself imply a stable release or a new storage format.
7. Verify the Engine entry loads without setup errors. If setup fails, **stop here and keep 5.9.3 active**. Check schema compatibility, URL, port and authentication.
8. Once a beta is published, deliberately download the exact card beta. Keep a copy of the old module and update the **existing** resource; do not load both versions of the same custom element. For preparation before publication, use the named candidate branch only if you are intentionally testing development source.
9. Use a new versioned filename or resource query string to avoid cached JavaScript, then fully reload each browser/companion app. Close stale dashboard tabs if different versions appear.
10. Open the card's diagnostics/settings. Confirm the displayed card and Engine versions, MA connection and player/queue data. Start with one speaker at a modest volume, then expand testing.

Minimal card YAML remains:

```yaml
type: custom:homeii-music-flow
homeii_engine_mode: required
```

An existing `entity` can remain as the preferred player. Preserve `card_id` values when already used. Configure MA connection secrets in the **Engine**, not dashboard YAML. Remove obsolete card connection secrets from the updated dashboard after securely recording the prior configuration for rollback. Backend timers/schedules and browser visual preferences are different stores; do not assume all old frontend-only settings migrate automatically.

## Installation paths after publication

**Engine manual installation:** copy the package's `custom_components/homeii_flow` directory into `/config/custom_components/homeii_flow`. The `manifest.json` must be directly inside that directory, not inside a second nested `homeii_flow` folder. Restart HA and add/configure the integration. See the [Engine repository](https://github.com/r11a/homeii-flow-engine) for its installation and automation guide.

**Card manual installation:** use the built `homeii-music-flow.js`, not the unbundled file in `src`. Put it under `/config/www/community/homeii-music-flow/` (or another deliberately chosen `www` directory) and register the corresponding `/local/...` URL as a JavaScript module. Update the existing resource to avoid duplicate registration.

**HACS:** once a published beta and accessible repositories exist, use the card repository as a Dashboard repository and the Engine repository as an Integration repository. Select the exact beta deliberately. HACS UI wording varies by version. Do not select the moving development branch if you want a reproducible beta installation.

## Opt-in updates, not a forced upgrade

The publication plan is GitHub **Pre-release**, explicitly **not Latest**, with stable `5.9.3` remaining the normal stable card release. Preparing/pushing source branches is not publishing a release.

HACS beta visibility and update entities are controlled by the user's settings. Users who enable beta versions or run custom update automations may still receive or install a prerelease. We cannot disable their automations from this repository. For deliberate testing, disable automatic updates for these repositories, choose the exact beta manually and read both release notes before any subsequent beta upgrade. See [HACS beta switches](https://www.hacs.dev/docs/use/entities/switch/) and [GitHub prereleases](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository).

## First listening test

- Confirm artwork/title and the selected player agree with MA.
- Test play/pause or Stop, next/previous, seek on a normal seekable track, volume and mute/unmute.
- Open the queue, move a noncurrent item and confirm the actual MA order; test a large playlist and library pagination.
- Search a new query, then change it quickly. Failures should remain distinguishable from genuine empty results.
- Test light/dark artwork, phone/tablet orientation, small cards, edge-to-edge safe areas and wheel navigation.
- Test groups, transfer, local Sendspin, lyrics and announcements separately, on explicitly selected speakers. Inspect the resulting MA state rather than relying only on a toast.

## Known limits before wider release

- Sustained group persistence and hardware-specific DLNA behavior are not certified.
- Safari/iOS background audio, long sessions and interruption recovery need more real-device coverage.
- Some tablet, small-card, edge-to-edge and artwork-contrast combinations remain under review.
- Provider-specific discovery, lyrics, metadata and AI features depend on what MA exposes.
- Default-player persistence was covered in an editor test, but the reported live dashboard case is not reproduced yet.
- Some requested provider/storage browsing and album-artist filtering remain open work. The issue tracker is not closed just because a candidate exists.
- There are 34 skipped legacy card tests still to classify. Passing automated tests does not replace device testing.

## Roll back without guessing

1. Disable beta-created schedules/timers/volume policies that you do not want running independently of the card.
2. Restore your saved **5.9.3 card file and exact resource URL**, then restore the saved dashboard configuration and fully reload the browser. Confirm only one module is registered.
3. If you upgraded an existing Engine, restore its saved component files and restart HA. If configuration/storage also changed, use the corresponding full HA backup; do not hand-edit `.storage` to improvise a downgrade.
4. If Engine was newly added solely for beta testing, disable its entry after returning to the old card if you no longer want its backend automation. Do not remove the official MA integration or MA library.
5. Verify native MA and the restored card before re-enabling any automations. Restoring just the card does not reverse backend changes or actions already sent to speakers.

## Help shape the beta

For interface problems use [card issues](https://github.com/r11a/homeii-music-flow/issues); for Engine setup, backend services or persistent state use [Engine issues](https://github.com/r11a/homeii-flow-engine/issues) when accessible. If unsure, start with a card issue and include both versions.

Include: card and Engine version, HA Core and MA version/schema, browser/device, player model/protocol, provider/media type, exact reproduction, expected versus actual result, whether native MA behaves the same way, and a redacted diagnostic excerpt. For UI problems add viewport/orientation and a screenshot. Never include tokens, cookies, full backups or private connection credentials. Existing issues should receive additional evidence rather than duplicate reports.

## Evidence and release gates

Before beta version labeling, the card candidate passed 392 tests plus lint/build and GitHub CI; Engine passed 52 tests and repository validation. QA102 with development Engine 0.7.21 was installed and HA restarted successfully. Those checks are useful evidence, **not a live installation test of the newly numbered beta pair**.

Before publishing: verify the exact numbered packages, public Engine access or packaging, the upgrade/rollback path, download contents and checksums, and the Pre-release/not-Latest flags. Do not announce a download until the actual assets are available.

[Detailed configuration](configuration.md) · [Feature reference](features.md) · [Diagnostics](diagnostics.md) · [Hebrew upgrade guide](BETA_UPGRADE_HE.md)
