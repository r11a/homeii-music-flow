# HOMEii Flow — your music, throughout your home

**Stable versions: Music Flow `6.0.2` + Flow Engine `1.0.2`.**

Status: stable release. The filename is retained for existing links. Follow the [current installation guide](INSTALL_STEP_BY_STEP.md) and [6.0.2 release notes](../RELEASE_NOTES_6.0.2.md). The Engine-first migration from 5.9.3 still applies.

| Project | Role | Repository |
|---|---|---|
| HOMEii Music Flow | The dashboard experience: artwork, library, contextual controls and player selection | [Card](https://github.com/r11a/homeii-music-flow) |
| HOMEii Flow Engine | The Home Assistant integration: authenticated MA access, shared state and automation services | [Engine](https://github.com/r11a/homeii-flow-engine) |

The Engine repository is public. Install it as a Home Assistant custom integration, not as an App/add-on.

> [!WARNING]
> **UPGRADING FROM 5.9.3 IS A BREAKING CHANGE. DO NOT UPDATE ONLY THE CARD.**
>
> Music Flow 6 requires HOMEii Flow Engine. Install, configure and verify the matching Engine **before** replacing the 5.9.3 card. The old browser-direct Music Assistant URL/token connection and Queue Actions fallback are not the supported 6.0 backend. Without a working Engine the new card will not provide normal music controls.
>
> Back up Home Assistant, your dashboard YAML, resource URL, current card file and any existing Engine before testing. Keep a working way to use native Music Assistant. Do not use this release as your only way to control important announcements or time-sensitive automations.

## What makes HOMEii Flow different

HOMEii Flow brings a music-focused interface to the dashboard: the current artwork shapes the atmosphere, the main player puts listening controls first, and contextual action wheels keep useful actions close to your thumb. The Engine gives that interface a shared backend inside Home Assistant, instead of asking each browser to maintain its own direct MA connection.

| Experience | Included in the release | Availability and limits |
|---|---|---|
| Immersive player | Prominent artwork, dynamic colors, glass surfaces, larger controls and responsive layouts; existing presentation remains selectable | Artwork, viewport and device performance affect the result; full device validation is ongoing |
| Contextual actions | Wheels for the active screen, dedicated icons, optional action labels and access to additional actions | Actions depend on server, player and media capabilities |
| Playback and volume | Seek, playback controls, volume changes, unmute after an acknowledged positive volume change and Stop-only streams | Seek needs seekable media; not every radio stream or player supports every command |
| Queue | Retained queue during refresh, active-queue resolution, item actions and drag reordering | Provider and player behavior remain subject to beta testing |
| Library and search | Albums, artists, tracks, playlists, radio and podcasts; paginated library reads; configurable result section order | Only connected providers and exposed APIs can return content; service outages remain possible |
| Discover | Genre-based discovery combining available provider results, MA library matches and radio sources | This is not unrestricted access to Spotify editorial catalogs; provider capabilities govern available results |
| Lyrics | MA metadata lookup, synchronized lyrics when supplied and an artwork-aware view | Lyrics are not guaranteed for every track; direct LRCLIB lookup is opt-in |
| This device | Sendspin playback through an authenticated HA/Engine transport | Requires MA support and browser audio permission/user interaction; mobile background behavior varies |
| Multi-room | Player selection, group operations and queue transfer | Grouping has been exercised on development speakers; do not assume every player/protocol combination behaves identically |
| Smart playback | MA Autoplay, crossfade, playback preferences and spoken-media speed controls | Only when supported; speed applies to supported podcasts/audiobooks, not ordinary music |
| AI Radio DJ | Select/configure the queue DJ from hosts already set up in MA | Requires the corresponding MA 2.11 beta APIs/plugin/configuration. Model, voice and host setup stays in MA; provider costs may apply |
| HA automation | Engine schedules, timers, volume policies, announcements, entities and diagnostic services | Actions can affect real speakers even while the card is closed; test with one selected player |
| Language and typography | Bundled Heebo, RTL/Hebrew, German, Brazilian Portuguese and the existing community translations | Some newer inline interface text may still use English fallback; translation feedback is welcome |

These are implemented capabilities, not a guarantee of identical behavior across every provider, browser or speaker. Unavailable actions are intended to stay hidden and return when available; please report exceptions.

## Requirements and compatibility

| Requirement | Release requirement |
|---|---|
| Card / Engine pair | Use `6.0.2` with `1.0.2`; earlier development Engine versions are not the recommended stable pair |
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
4. **Install Engine `1.0.2` first**, following the Engine guide below. Restart HA; copying Python files alone does not load the integration.
5. In **Settings → Devices & services → Add integration**, add **HOMEii Flow Engine**. Enter the real MA server URL, port and MA API token. Optional external MA URL is a server fallback, not your HA ingress dashboard URL.
6. If upgrading an existing development Engine, retain its configured entry and use **Configure → General settings** as needed. Do not delete and recreate entries as a routine upgrade step. Version 1.0.2 does not introduce a new storage format.
7. Verify the Engine entry loads without setup errors. If setup fails, **stop here and keep 5.9.3 active**. Check schema compatibility, URL, port and authentication.
8. Download card **6.0.2**. Keep a copy of the old module and update the **existing** resource; do not load both versions of the same custom element.
9. Keep the canonical filename and update the resource query string to avoid cached JavaScript, then fully reload each browser/companion app. Close stale dashboard tabs if different versions appear.
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

**HACS:** use the card repository as a Dashboard repository and the Engine repository as an Integration repository. Choose card 6.0.2 and Engine 1.0.2. HACS UI wording varies by version; use tagged releases for reproducible installations.

## Update policy

Card 6.0.2 and Engine 1.0.2 are stable **Latest** releases. Users upgrading from 5.9.3 must complete the Engine-first migration before allowing card updates. Existing update automations remain under the user's control. Read both release notes and back up before updating.

## First listening test

- Confirm artwork/title and the selected player agree with MA.
- Test play/pause or Stop, next/previous, seek on a normal seekable track, volume and mute/unmute.
- Open the queue, move a noncurrent item and confirm the actual MA order; test a large playlist and library pagination.
- Search a new query, then change it quickly. Failures should remain distinguishable from genuine empty results.
- Test light/dark artwork, phone/tablet orientation, small cards, edge-to-edge safe areas and wheel navigation.
- Test groups, transfer, local Sendspin, lyrics and announcements separately, on explicitly selected speakers. Inspect the resulting MA state rather than relying only on a toast.

## Known limits

- Sustained group persistence and hardware-specific DLNA behavior are not certified.
- Safari/iOS background audio, long sessions and interruption recovery need more real-device coverage.
- Some tablet, small-card, edge-to-edge and artwork-contrast combinations remain under review.
- Provider-specific discovery, lyrics, metadata and AI features depend on what MA exposes.
- Permanent MA groups versus ad-hoc grouping remain under investigation in [#96](https://github.com/r11a/homeii-music-flow/issues/96).
- Some requested provider/storage browsing and album-artist filtering remain open work. The issue tracker is not closed just because a candidate exists.
- There are 37 skipped legacy card tests. Passing automated tests does not replace device testing.

## Roll back without guessing

1. Disable Engine-created schedules/timers/volume policies that you do not want running independently of the card.
2. Restore your saved **5.9.3 card file and exact resource URL**, then restore the saved dashboard configuration and fully reload the browser. Confirm only one module is registered.
3. If you upgraded an existing Engine, restore its saved component files and restart HA. If configuration/storage also changed, use the corresponding full HA backup; do not hand-edit `.storage` to improvise a downgrade.
4. If Engine was newly added solely for testing, disable its entry after returning to the old card if you no longer want its backend automation. Do not remove the official MA integration or MA library.
5. Verify native MA and the restored card before re-enabling any automations. Restoring just the card does not reverse backend changes or actions already sent to speakers.

## Support and reporting

For interface problems use [card issues](https://github.com/r11a/homeii-music-flow/issues); for Engine setup, backend services or persistent state use [Engine issues](https://github.com/r11a/homeii-flow-engine/issues) in the public tracker. If unsure, start with a card issue and include both versions.

Include: card and Engine version, HA Core and MA version/schema, browser/device, player model/protocol, provider/media type, exact reproduction, expected versus actual result, whether native MA behaves the same way, and a redacted diagnostic excerpt. For UI problems add viewport/orientation and a screenshot. Never include tokens, cookies, full backups or private connection credentials. Existing issues should receive additional evidence rather than duplicate reports.

## Evidence and release gates

The 6.0.2 design was checked in local responsive previews and on a live HA dashboard, including fan opening and upward selection of Queue. Release validation covers the complete card suite, lint, build and distribution consistency; Engine 1.0.2 passes 87 tests and repository validation. See the [release notes](../RELEASE_NOTES_6.0.2.md) for the exact scope and limits. This does not certify every provider or speaker.

[Detailed configuration](configuration.md) · [Feature reference](features.md) · [Diagnostics](diagnostics.md) · [Hebrew upgrade guide](BETA_UPGRADE_HE.md)

