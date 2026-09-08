# Troubleshooting

Use this page when HOMEii Music Flow loads but something does not behave as expected.

## First Step

Run Diagnostics from the card settings with the affected player selected.

Most issues become clearer once you know:

- whether Music Assistant services are visible
- whether the selected player has Music Assistant markers
- whether the queue identity exists
- whether library providers return items
- whether direct API is optional or required for the feature
- whether browser/HTTPS rules are blocking direct access

## No Players Appear

Check:

- Music Assistant is running.
- Music Assistant is connected to Home Assistant.
- Home Assistant exposes Music Assistant players as `media_player` entities.
- Player filters in HOMEii Music Flow are not hiding every player.
- The selected dashboard/card is not scoped to a missing player.

Run Diagnostics and look at:

- Music Assistant services
- Music Assistant config entry
- Music Assistant players
- selected player

## Selected Player Is Wrong

Possible causes:

- more than one HOMEii card shares browser-local settings
- no `card_id` is set
- query-string player override is active
- the old selected player no longer exists

Fix:

- set a unique `card_id` for each dashboard/card that should behave independently
- choose the player again
- remove unwanted `?player=...` or `?homeii_player=...` from the URL

## Queue Is Empty

Possible causes:

- the selected player has no active Music Assistant queue
- the selected player is a generic Home Assistant fallback player
- Home Assistant can control the player but cannot resolve a Music Assistant queue for it
- Music Assistant has not yet populated the queue after starting playback
- the item was started outside Music Assistant or through a provider that exposes limited queue metadata

Check Diagnostics:

- Queue identity
- Queue providers
- Queue snapshot
- Queue artwork sample

If the selected player does not expose `active_queue` or `queue_id`, queue details may be limited even while playback works.

## Library Is Empty

Check:

- Music Assistant library contains playlists/albums/artists/tracks.
- Music Assistant services are exposed in Home Assistant.
- Music Assistant config entry is loaded.
- Any direct Music Assistant URL is not accidentally set to a Home Assistant URL.

Diagnostics to inspect:

- Music Assistant services
- Integration signal
- Library providers
- Library coverage
- Library artwork sample

## Artwork Is Missing

Artwork can come through different paths:

- Home Assistant media proxy
- Music Assistant image proxy
- provider artwork URLs
- cached artwork from player/queue/library data

Common problems:

- browser cannot reach a local-only Music Assistant URL
- HTTPS dashboard tries to load HTTP artwork
- reverse proxy blocks image paths
- provider item has no artwork
- queue/library item exposes artwork differently than the main player

Run Diagnostics and check:

- HOMEii Flow Engine
- Music Assistant transport
- Queue artwork sample
- Library artwork sample
- Mixed content
- Access path

## Music Assistant transport fails

Open the HOMEii Flow Engine integration options and check the internal HTTP URL, optional external HTTPS URL, and API token there. The card intentionally has no duplicate URL or token fields. Restart the integration after changing connection options, then run the card diagnostics and verify Engine, Music Assistant health, player discovery, and artwork proxy status.

## Phone Shows Compact Instead Of Full

Possible causes:

- the dashboard card slot is too small
- Masonry layout compressed the card
- phone display mode is set to Compact
- the card shares the view with many other cards

Try:

- Panel view
- Section view with full width
- phone display mode Full
- phone display mode Edge to edge

## Fullscreen Or Edge-To-Edge Feels Wrong

Check:

- you are not testing inside the Home Assistant visual editor
- the card is not embedded in an unusual popup/container
- phone display mode is set intentionally
- Home Assistant app/browser is updated

Edge-to-edge mode is intended for normal dashboard use, not editing mode.

## Visual Editor Diagnostics Cannot Copy

Some mobile browsers and Companion app contexts block clipboard writes.

When that happens, HOMEii Music Flow should still show the report and mark the copy problem as a warning.

You can manually select/copy the visible report if the platform blocks the automatic copy action.

## Recommended Issue Template

When opening an issue, include:

```text
HOMEii Music Flow version:
Home Assistant version:
Music Assistant version:
Install method: HACS / manual
Device: desktop / phone / tablet / wall display
Browser or app:
Local or remote access:
Selected player:
What works:
What fails:
Diagnostics report:
Screenshots:
```
