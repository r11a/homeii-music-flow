# Diagnostics

Diagnostics helps users and maintainers understand whether HOMEii Music Flow, Home Assistant, Music Assistant, the browser, and optional direct features are working together correctly.

## Where To Open Diagnostics

Diagnostics is available from:

- the in-card Settings screen
- the Home Assistant visual editor

For support issues, prefer running Diagnostics from the card itself after selecting the player that has the problem.

## What Diagnostics Shows

Diagnostics v7 includes:

- HOMEii Music Flow version
- diagnostics version
- browser and platform
- viewport size, DPR, touch points, and language
- privacy-safe Home Assistant URL details
- privacy-safe Music Assistant URL details
- Home Assistant frontend availability
- Music Assistant services
- required HOMEii Flow Engine bridge status
- Music Assistant config entry state
- integration signal
- strict Music Assistant player count
- generic Home Assistant media player visibility count
- selected player markers
- selected player source
- configured entity visibility and selection explanation
- current group state and group service path
- browser-direct Music Assistant API status
- browser-direct Music Assistant WebSocket state
- Sendspin browser support
- Sendspin endpoint readiness
- search provider availability
- active search query sample timing and result counts
- queue identity
- queue provider availability
- queue UI state
- queue snapshot result
- queue artwork sample
- queue artwork browser load result
- library provider availability
- library coverage
- library artwork sample
- library artwork browser load result
- authenticated artwork fetch fallback result
- rendered artwork DOM health

External and private hostnames are redacted by default in visible and copied output.

## Status Levels

Diagnostics uses four status levels.

| Status | Meaning |
| --- | --- |
| OK | The check looks healthy |
| FAIL | This check is blocking or clearly broken |
| WARN | The feature may still work, but something needs attention |
| INFO | Context only, not a problem by itself |

## Integration Signal

The most important checks are:

- Music Assistant services
- Music Assistant config entry
- Music Assistant players
- selected player markers
- queue providers
- library providers

If Music Assistant services are exposed, HOMEii Flow Engine can use the Home Assistant integration path even when direct browser access is unavailable. The card still requires the Engine; this is not a frontend-only fallback path.

## HOMEii Flow Engine

The HOMEii Flow Engine check reports the required HOMEii Flow 6 backend integration.

Possible outcomes:

- **OK:** the Engine integration answered the card and reported its version/capabilities.
- **INFO:** informational Engine details such as version, browser context, or capability notes.
- **FAIL:** the Engine did not answer, is too old, or is missing a required capability. The HOMEii Flow 6 card will not use legacy frontend-only paths.

This check does not replace Music Assistant diagnostics. It adds backend visibility for Engine-owned features such as player state, schedules, timers, statistics, policies, playback proxying, queue transfer, grouping orchestration, Sendspin state, the server-side Music Assistant command bridge, and smarter recommendations.

## Music Assistant transport

HOMEii Flow 6 does not call the authenticated Music Assistant API from the browser. The Engine selects the configured internal/external URL, holds the token, maintains the event stream, and proxies commands and artwork through Home Assistant. This removes browser CORS, mixed-content, and duplicate-handshake failures from the card path.

## Queue Diagnostics

Queue checks show:

- whether the selected player exposes a queue identity
- which queue providers are available
- whether the rendered Queue UI has items
- whether Home Assistant can fetch queue data
- whether the Engine queue provider is available
- whether queue artwork can be inferred
- whether the current browser can actually load the sampled artwork

If the selected player is not returned by HOMEii Flow Engine as a Music Assistant player, the 6.x card treats that as an Engine/player mapping problem rather than falling back to generic Home Assistant player behavior.

If queue APIs return items but the rendered Queue UI is empty, Diagnostics reports that mismatch directly. That is the strongest signal for a card-side queue rendering/state issue.

## Library Diagnostics

Library checks show:

- whether Engine-backed library services are available
- whether the Engine can reach Music Assistant library data
- whether playlists, artists, albums, tracks, and radio return items
- whether artwork is found for sample items

If library coverage is zero, check Music Assistant integration state, selected config entry, and whether the Music Assistant library is actually populated.

If artwork URLs are inferred but the browser cannot load them, Diagnostics reports the browser load result separately. This helps distinguish "Music Assistant did not provide artwork" from "the browser cannot display artwork from this access path."

## Group Diagnostics

Group checks show:

- whether the selected player is currently grouped
- which player appears to be the group owner/master
- current group members where Home Assistant exposes them
- which Engine-backed grouping path is available
- whether group actions are expected to use the Engine group orchestration path

If a group action reports success but nothing changes, share Diagnostics together with the exact selected player and the speakers you tried to add or remove.

## Sendspin Diagnostics

Sendspin checks show:

- browser WebSocket support
- AudioContext support
- audio element support
- local runtime state
- computed WebSocket endpoint
- access mode

Sendspin requires direct Music Assistant browser access. HOMEii Flow Engine remains required for the card, but the browser still needs a direct Music Assistant URL/token when the browser itself should become a Sendspin player.

## What To Share In An Issue

When opening an issue, include:

- HOMEii Music Flow version
- Home Assistant version
- Music Assistant version
- browser or Companion app
- phone/tablet/desktop
- the Diagnostics report
- screenshot of the broken screen
- what player was selected
- whether it happens locally, remotely, or both

Do not manually paste private hostnames if Diagnostics redacted them.
