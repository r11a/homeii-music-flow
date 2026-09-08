# Feature Guide

This page explains the main HOMEii Music Flow features and when to use them.

## Main Player

The main player is the center of the card.

It shows:

- current artwork
- title, artist, and album
- source/provider badge
- progress and duration
- volume and mute
- shuffle and repeat
- previous, play/pause, and next
- selected player
- quick actions

HOMEii Music Flow uses artwork colors to create a dynamic visual atmosphere. If artwork is missing, it falls back to a neutral presentation instead of showing broken UI.

## Queue

The Queue screen shows the current Music Assistant queue.

Depending on what Music Assistant exposes, the card can:

- show current and upcoming tracks
- search the queue
- play an item now
- play next
- add to queue
- remove from queue
- move items where supported
- clear queue where supported

Queue behavior depends on the selected player exposing a usable Music Assistant queue identity. Diagnostics can show whether the selected player exposes `active_queue`, `queue_id`, or only a generic Home Assistant fallback.

## Queue Wheel

Queue Wheel is a fast vertical browsing mode for the queue.

Use it when:

- the queue is long
- you are on a phone
- you want quick visual navigation
- you want a cleaner “music app” style queue view

Queue Wheel is enabled in the default mobile quick actions set and can be removed from Quick Actions if you do not use it.

## Library

The Library screen exposes Music Assistant library content.

Supported library areas include:

- playlists
- artists
- albums
- tracks
- radio
- liked/favorite content where available

Library features include:

- search
- play all
- shuffle all
- play now
- add to queue
- favorite/liked actions where supported
- artwork-aware cards and lists

## Library Wheel

Library Wheel brings the Queue Wheel browsing style into the music library.

Available for:

- playlists
- artists
- albums
- tracks
- liked items
- radio stations
- albums inside an artist page

Artist-album and radio wheel pages open as dedicated full-screen browsing stages, with clear captions such as album year or station name.

## Lyrics Privacy

Lyrics embedded in Music Assistant metadata are used locally. The LRCLIB fallback is opt-in and disabled by default.

Enabling `lrclib_lyrics_enabled: true` allows the browser to send the current title, artist, album, and duration to `https://lrclib.net/api/get`, followed by `https://lrclib.net/api/search` when needed. Keep it disabled if listening details must not leave the Home Assistant/Music Assistant environment.

## Reusable Dashboard Features

HOMEii Music Flow supports reusable dashboard patterns.

The main tools are:

- `card_id` for per-card browser settings.
- URL player overrides such as `?player=kitchen_sonos`.
- card-scoped URL overrides such as `?homeii_player_kitchen-flow=kitchen_sonos`.

Use these when one dashboard should serve multiple rooms or devices without duplicating the whole YAML file.

See [Configuration: Reusable Dashboards](./configuration.md#reusable-dashboards).

## Players

The Players screen controls where music plays.

It includes:

- selected player
- other Music Assistant players
- This device / Sendspin browser player
- queue access
- group controls
- clear/stop actions

The top action hub uses four clear icon-and-text actions in one row for This device, Queue, Groups, and Clear all.

## Studio / Control Room

Studio is the larger multi-room control surface.

Use it for:

- selecting the primary player
- controlling several rooms
- grouping and ungrouping speakers
- per-room volume
- moving playback
- searching and playing content while managing rooms

Studio is intended for tablet and desktop layouts. It is not the same as the phone player screen.

## This Device / Sendspin

This Device turns the current browser into a Music Assistant playback target through Sendspin.

Use it for:

- a wall tablet speaker
- a phone browser player
- a desktop browser player
- quick local playback without a separate speaker entity

This feature is disabled in HOMEii Flow 6 Engine-only mode so the card never stores or receives Music Assistant credentials.

## FLOW Guided Wizard

FLOW is a guided music starter.

It helps a non-technical user choose:

- player
- mood
- playlist
- artist
- artist radio
- library radio
- free-style music request

It is useful when someone wants to start music without searching through the whole library.

## Search

Search appears in multiple places:

- global library search
- tab-specific library search
- queue search
- FLOW search
- Studio search

Search behavior depends on Music Assistant providers and the available library APIs.

## Lyrics

Lyrics provide a wider, immersive song view.

Supported behavior includes:

- centered lyric display
- synced or plain lyric content where available
- offset controls
- font size controls
- unavailable states when lyrics are not provided

## Announcements

Announcements let HOMEii Music Flow send text-to-speech messages.

Use it for:

- house announcements
- quick preset messages
- typed messages
- voice dictation where the browser supports it

You need a working Home Assistant TTS entity for the best experience.

## Favorites And Likes

HOMEii Music Flow can show and update liked/favorite state where Music Assistant exposes it.

Depending on the media type and provider, this can apply to:

- current track
- library tracks
- albums
- playlists
- radio stations

Some favorite behavior is provider-dependent.

## History And Recommendations

HOMEii Music Flow can show recent listening and recommendation-style surfaces.

Use these when:

- you want to return to something recently played
- you want quick suggestions
- you want less manual search

## Night Mode And Timers

The card includes listening comfort tools:

- sleep timer
- quick timer buttons
- scheduled start
- night mode
- lower-intensity display behavior

These are useful for bedrooms, kids rooms, and wall tablets.

## Diagnostics

Diagnostics is now a core support feature, not an afterthought.

Use it whenever a user reports:

- missing artwork
- empty queue
- no players
- library not loading
- Sendspin not connecting
- HTTPS/HTTP problems
- mobile-only behavior

See [Diagnostics](./diagnostics.md).
