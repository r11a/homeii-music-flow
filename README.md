<p align="center"><img src="docs/brand/homeii-flow-logo.png" alt="HOMEii Flow" width="360"></p>
<h1 align="center">HOMEii Music Flow</h1>
<p align="center"><strong>Make your Home Assistant dashboard feel like a place for music.</strong><br>Artwork-driven atmosphere, contextual controls and your Music Assistant library — across the screens in your home.</p>
<p align="center"><img alt="Card beta candidate" src="https://img.shields.io/badge/Card-6.0.0--beta.1-c89b56"><img alt="Matching Engine" src="https://img.shields.io/badge/Engine-1.0.0--beta.1-41BDF5"><img alt="Preparation only" src="https://img.shields.io/badge/Status-not_released-555555"></p>
<p align="center"><a href="docs/BETA_GUIDE.md">Beta guide</a> · <a href="docs/BETA_UPGRADE_HE.md">שדרוג בעברית</a> · <a href="https://github.com/r11a/homeii-flow-engine">Required Engine</a> · <a href="docs/features.md">Features</a> · <a href="https://github.com/r11a/homeii-music-flow/issues">Feedback</a></p>

> [!WARNING]
> **STOP BEFORE UPGRADING FROM 5.9.3: INSTALL THE ENGINE FIRST.**
> Music Flow 6 requires HOMEii Flow Engine. Updating only the JavaScript card can leave your dashboard without working music controls. Back up HA, your dashboard and current card resource. Configure and verify the Engine before replacing the card. Read the [complete upgrade and rollback guide](docs/BETA_GUIDE.md#safe-upgrade-from-593).

> [!IMPORTANT]
> **This is beta preparation, not a published beta release.** Planned pair: card **`6.0.0-beta.1`** and Engine **`1.0.0-beta.1`**. Source branches and documentation are available for review; no beta tag/Release is being published now. [5.9.3 remains the stable release](https://github.com/r11a/homeii-music-flow/releases/tag/v5.9.3). The Engine repository is currently private; access/public packaging must be resolved before community downloads open.

## A new listening experience, with a backend built for HA

The immersive player gives the artwork room to breathe. Dynamic color and glass surfaces carry the mood through the interface, while contextual action wheels bring the next useful control closer to your hand. Keep the previous presentation if it suits your dashboard better.

The matching [HOMEii Flow Engine](https://github.com/r11a/homeii-flow-engine) runs inside Home Assistant. It connects the interface and HA automations to Music Assistant, shares player/queue state, proxies artwork and keeps connection credentials off the card configuration. Music Assistant remains the source of your music and player capabilities.

| Explore | Included in the beta candidate |
|---|---|
| Listen | Immersive artwork, seek controls, clearer volume, dedicated icons, contextual wheels and existing-layout selection |
| Browse | Library, playlists, albums, artists, radio, podcasts, provider search and genre-based discovery |
| Stay in control | Queue actions/reordering, player selection, capability-aware commands, group operations and transfer |
| Make it yours | Dark/light glass themes, artwork backgrounds, bundled Heebo, RTL and community translations including German |
| Go beyond the card | Engine timers, schedules, volume policies, HA entities, announcements and diagnostic services |
| Explore MA's capabilities | Sendspin This device, synchronized lyrics when available, supported playback preferences and configured AI Radio DJ |

Features depend on MA, the provider, player and browser. Group persistence, some device layouts and mobile background playback still need beta testing. The [capability table and known limitations](docs/BETA_GUIDE.md#what-makes-this-beta-different) describe what is implemented and where support is conditional.

## Start with the right pair

1. Read the [breaking-change checklist](docs/BETA_GUIDE.md#safe-upgrade-from-593), especially if using 5.9.3.
2. Install/configure [Engine `1.0.0-beta.1`](https://github.com/r11a/homeii-flow-engine), then restart and verify HA.
3. Once published, deliberately select card `6.0.0-beta.1`; do not load old and new card modules together.
4. Check both displayed versions and test one MA speaker before enabling automation or groups.

**Requirements:** official MA integration in HA, MA API schema **63+**, a valid MA API token configured in the Engine, a reachable MA server and a working MA player. MA version labels alone do not guarantee optional API availability. See [full requirements](docs/BETA_GUIDE.md#requirements-and-compatibility).

The future beta is intended as **Pre-release, not Latest**. Stable users can stay on 5.9.3. Beta visibility and user-created update automations cannot be controlled by this repository; testers should opt in deliberately and disable automatic updates for these components when manual control is desired.

## Documentation and community

- [Full beta guide: requirements, installation, features, upgrade, rollback and test plan](docs/BETA_GUIDE.md)
- [אזהרת שדרוג והוראות בעברית](docs/BETA_UPGRADE_HE.md)
- [Engine installation, configuration, HA services and examples](https://github.com/r11a/homeii-flow-engine)
- [Configuration reference](docs/configuration.md) · [Feature reference](docs/features.md) · [Diagnostics](docs/diagnostics.md)
- [Draft beta release notes](RELEASE_NOTES_6.0.0-beta.1.md)

Feedback from different speakers, music providers and real phones/tablets is the purpose of this beta. Include both component versions and a reproducible example; never post connection tokens or full backups.

The sections below retain the broader feature/configuration reference and stable-release history. For this beta, the version pair and migration steps above take precedence over historical development-version references.


## 6.0.0 Engine-First Architecture

HOMEii Flow 6.0.0 is a breaking-change generation.

The prepared `6.0.0-beta.1` card is paired with **HOMEii Flow Engine `1.0.0-beta.1`**. The card is the visual interface; the Engine is the required backend for players, playback, revisioned queue/library/favorites state, search, artwork, grouping, schedules, timers, statistics, announcements, diagnostics, and the authenticated Music Assistant API/event bridge.

For 6.0.0 the Engine is also the only authenticated Music Assistant transport. Library shelves and media details use persistent stale-while-revalidate caches, artwork uses stable same-origin proxy URLs, and long queue/library pages are rendered incrementally. This keeps credentials out of the browser and avoids duplicate WebSocket handshakes.

The current reliability audit and live validation limits are documented in [the September 7 audit](docs/RELIABILITY_AUDIT_2026_09_07_HE.md). This working build is not yet approved for a public 6.0.0 release.

There is no legacy frontend-only fallback in 6.0.0. Users who do not want to install the Engine should stay on the latest 5.9.x release.

## 5.9.3 Stability Release

HOMEii Flow 5.9.3 is a focused stability release on top of 5.9.2. It improves queue handling, configured-player selection, provider search, Radio favorites, progress timing, and Diagnostics while keeping the release scoped to bug fixes and supportability.

Release focus:

- **Queue stability:** detects partial Music Assistant queue snapshots and avoids treating them as clean OK states.
- **Player selection clarity:** configured `entity` works as a stable default, and player selection surfaces expose entity ids when friendly names are ambiguous.
- **Search improvements:** fast library results can appear immediately while provider/direct Music Assistant search continues and merges in later.
- **Radio favorites:** external/RadioBrowser station favorites no longer depend on the currently playing item.
- **Diagnostics v7:** adds configured-entity and search-provider checks for cleaner support reports.

After updating, hard-refresh with:

```text
/local/community/homeii-music-flow/homeii-music-flow.js?v=5.9.3
```



## Quick Install

The instructions below are the existing installation reference. **For the prepared beta, use the [Engine-first beta installation guide](docs/BETA_GUIDE.md) and deliberately select the exact beta only after publication.** The stable version references below do not download the beta.

### Add To HACS

Use the My Home Assistant button:

[![Open your Home Assistant instance and add this repository to HACS.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=r11a&repository=homeii-music-flow&category=plugin)

Or add it manually:

1. Open Home Assistant.
2. Open HACS.
3. Open `Custom repositories`.
4. Add:

```text
https://github.com/r11a/homeii-music-flow
```

5. Select category `Dashboard` in the UI. HACS internally calls this category `plugin`.
6. Download `HOMEii Flow`.
7. Add the card:

```yaml
type: custom:homeii-music-flow
```

If HACS does not add the resource automatically, add:

```text
/hacsfiles/homeii-music-flow/homeii-music-flow.js
```

### Manual Install

1. Create:

```text
/config/www/community/homeii-music-flow/
```

2. Copy the full contents of `dist/` into that folder.
3. Add this Dashboard resource:

```text
/local/community/homeii-music-flow/homeii-music-flow.js?v=5.9.3
```

4. Add the card:

```yaml
type: custom:homeii-music-flow
```

## Requirements

- Home Assistant with Dashboard custom cards enabled.
- Music Assistant installed, running, and connected to Home Assistant.
- HOMEii Flow Engine `1.0.0-beta.1` installed and loaded for the prepared `6.0.0-beta.1` card; MA API schema 63+ is required.
- At least one Music Assistant player exposed as a Home Assistant `media_player`.
- HACS for the easiest install path, or manual access to `/config/www/community/`.
- A modern browser for the dashboard: Chrome, Edge, Safari, or a modern Android/iOS browser.
- Optional: a configured `tts.*` entity for text-to-speech announcements.
- Optional but recommended: correct Home Assistant internal/external URLs, especially for phones, tablets, and remote access.

## First Startup Checklist

If the card loads but feels incomplete, check these first:

- Music Assistant is installed, running, and exposes at least one player as a Home Assistant `media_player`.
- The Dashboard resource points to `/hacsfiles/homeii-music-flow/homeii-music-flow.js` for HACS, or to the copied `/local/community/...` file for manual installs.
- If you use HOMEii Flow remotely, confirm Home Assistant external/internal URLs are correct. The browser communicates only with Home Assistant; the Engine communicates with Music Assistant.
- If artwork is missing only when away from home, verify the Engine artwork proxy in Diagnostics. The browser should not need direct access to Music Assistant.
- If no players are shown, check Music Assistant player exposure and remove overly strict pinned-player filters from the card settings.
- Optional automation helper: create an `input_text`, then set `active_player_helper_entity` so automations can read the current HOMEii Flow target.

## Active Player Helper

HOMEii Flow can optionally publish the currently selected/active player to a Home Assistant helper. This is useful when you want automations, scripts, templates, dashboard buttons, or voice flows to know which player HOMEii Flow is currently controlling.

The card does not create a Home Assistant entity by itself. Create an `input_text` helper once, then point HOMEii Flow to it. The card will keep that helper updated with the active player `entity_id`.

### Setup

1. In Home Assistant, open **Settings > Devices & services > Helpers**.
2. Select **Create Helper**.
3. Choose **Text**.
4. Name it, for example: `HOMEii Flow Active Player`.
5. Copy the created entity id, for example:

```yaml
input_text.homeii_flow_active_player
```

6. Add it to the HOMEii Flow card configuration:

```yaml
type: custom:homeii-music-flow
active_player_helper_entity: input_text.homeii_flow_active_player
```

You can also select the helper from the visual card editor in the connection/settings section.

### What The Helper Stores

When HOMEii Flow is controlling the living room player, the helper value becomes:

```text
media_player.living_room
```

When you switch HOMEii Flow to another player, the helper updates automatically:

```text
media_player.kitchen
```

### Example: Play/Pause The Current HOMEii Flow Player

```yaml
alias: HOMEii Flow - Toggle active player
sequence:
  - service: media_player.media_play_pause
    target:
      entity_id: "{{ states('input_text.homeii_flow_active_player') }}"
```

### Example: Set Volume On The Current HOMEii Flow Player

```yaml
alias: HOMEii Flow - Set active player volume
sequence:
  - service: media_player.volume_set
    target:
      entity_id: "{{ states('input_text.homeii_flow_active_player') }}"
    data:
      volume_level: 0.35
```

### Example: Use It In A Template

```yaml
{{ state_attr(states('input_text.homeii_flow_active_player'), 'friendly_name') }}
```

### Example: Only Run If HOMEii Flow Has A Player

```yaml
condition:
  - condition: template
    value_template: "{{ states('input_text.homeii_flow_active_player') | regex_match('^media_player\\.') }}"
```

## Running Multiple Dashboards In One Browser

By default, every HOMEii Flow card in the same browser shares its in-card customizations (theme, layout, excluded players, pinned players, screensaver settings, and the rest) via a single set of browser-storage keys. That keeps phones, tablets, and the desktop dashboard in sync when you only run one HOMEii Flow card.

If you want **separate** dashboards — for example one card per kid's bedroom, or a kitchen wall tablet showing one player and a living-room phone view showing another — give each card its own `card_id`:

```yaml
type: custom:homeii-music-flow
card_id: ida-music
entity: media_player.ida_vaerelse
```

```yaml
type: custom:homeii-music-flow
card_id: toke-music
entity: media_player.toke_vaerelse
```

Rules:

- `card_id` is optional. Cards without it behave exactly as before (shared state).
- `card_id` must be 1-64 characters of letters, digits, `-`, or `_`.
- Two cards that share the same `card_id` will share state — useful when you want a phone and a wall tablet to stay in sync within one dashboard.
- Adding `card_id` to a card that previously had no `card_id` will appear to reset its in-card customizations once. The old global values still live in localStorage under the original keys; the card now reads from the new card-scoped keys. Reconfigure once via the in-card Settings panel and you are done.
- This only affects browser-local UI state. Music Assistant playback, your `media_player` entities, and Home Assistant configuration are unaffected.

## Sendspin Browser Player

HOMEii Flow includes a local browser player flow powered by Sendspin. In the card this appears as **This device**.

HOMEii Flow 6 does not expose Music Assistant credentials to the browser. The built-in **This device** Sendspin player is therefore disabled in Engine-only mode. Existing Music Assistant speaker/player entities remain fully supported.

## Screenshots

### Main Experience

<p align="center">
  <img src="https://raw.githubusercontent.com/r11a/homeii-music-flow/main/docs/media/hero-main-light.png" alt="Main now playing layout" width="100%">
</p>

### Studio / Players / Queue

| Studio | Players | Queue |
| --- | --- | --- |
| <img src="https://raw.githubusercontent.com/r11a/homeii-music-flow/main/docs/media/studio.png" alt="Studio player grid" width="100%"> | <img src="https://raw.githubusercontent.com/r11a/homeii-music-flow/main/docs/media/players.png" alt="Player selection and grouping" width="100%"> | <img src="https://raw.githubusercontent.com/r11a/homeii-music-flow/main/docs/media/queue.png" alt="Queue panel" width="100%"> |

### Library / Actions / Settings

| Library | Actions | Settings |
| --- | --- | --- |
| <img src="https://raw.githubusercontent.com/r11a/homeii-music-flow/main/docs/media/library.png" alt="Music Assistant library browser" width="100%"> | <img src="https://raw.githubusercontent.com/r11a/homeii-music-flow/main/docs/media/actions.png" alt="Actions and schedules menu" width="100%"> | <img src="https://raw.githubusercontent.com/r11a/homeii-music-flow/main/docs/media/settings.png" alt="Settings panel" width="100%"> |

### Lyrics / Announcements / Tablet

| Lyrics | Announcements | Tablet |
| --- | --- | --- |
| <img src="https://raw.githubusercontent.com/r11a/homeii-music-flow/main/docs/media/lyrics.png" alt="Lyrics screen" width="100%"> | <img src="https://raw.githubusercontent.com/r11a/homeii-music-flow/main/docs/media/announcement.png" alt="Announcement screen" width="100%"> | <img src="https://raw.githubusercontent.com/r11a/homeii-music-flow/main/docs/media/tablet.png" alt="Tablet layout" width="100%"> |

### Mobile Details

| Mobile 1 | Mobile 2 | Mobile 3 |
| --- | --- | --- |
| <img src="https://raw.githubusercontent.com/r11a/homeii-music-flow/main/docs/media/mobile-1.jpg" alt="Mobile screenshot 1" width="100%"> | <img src="https://raw.githubusercontent.com/r11a/homeii-music-flow/main/docs/media/mobile-2.jpg" alt="Mobile screenshot 2" width="100%"> | <img src="https://raw.githubusercontent.com/r11a/homeii-music-flow/main/docs/media/mobile-3.jpg" alt="Mobile screenshot 3" width="100%"> |

| Mobile 4 | Mobile 5 | Mobile 6 |
| --- | --- | --- |
| <img src="https://raw.githubusercontent.com/r11a/homeii-music-flow/main/docs/media/mobile-4.jpg" alt="Mobile screenshot 4" width="100%"> | <img src="https://raw.githubusercontent.com/r11a/homeii-music-flow/main/docs/media/mobile-5.jpg" alt="Mobile screenshot 5" width="100%"> | <img src="https://raw.githubusercontent.com/r11a/homeii-music-flow/main/docs/media/mobile-6.jpg" alt="Mobile screenshot 6" width="100%"> |

| History | Mobile 7 |
| --- | --- |
| <img src="https://raw.githubusercontent.com/r11a/homeii-music-flow/main/docs/media/history-light.png" alt="History and recommendations drawer" width="100%"> | <img src="https://raw.githubusercontent.com/r11a/homeii-music-flow/main/docs/media/mobile-7.jpg" alt="Mobile screenshot 7" width="100%"> |

## Feature Highlights

### Listening Experience

- Premium artwork-first now-playing screen
- Dynamic background and color atmosphere from current artwork
- Full player, compact player, mobile player, tablet layout, and desktop layout
- Album art, title, artist, album, source, progress, volume, and queue context
- Clean neutral fallback when no artwork is available
- Light, dark, and auto theme behavior

### Sendspin / This Device

- Local browser player connection from inside the card
- HOMEii-specific Sendspin player identity
- Direct authenticated Sendspin WebSocket bridge
- Reconnect on dashboard return, app focus, `pageshow`, and network-online events
- Dashboard-level local session so the browser player is not tied to one Dashboard card instance
- Grace period when leaving the dashboard page before stopping the local player
- Manual disconnect action to stop automatic reconnect for this browser session
- Device discovery after connection
- "This device" and "Browser players" player flows
- Local sync delay storage
- Packaged `sendspin-js` runtime for HACS/manual installs

### FLOW Guided Wizard

- Step-by-step music wizard for non-technical users
- Clean restart every time FLOW is opened from the actions menu
- Reset button on every step
- Player and multi-player selection
- Choose by mood or from existing library content
- Mood presets: calm, energetic, morning, night, kids, Israeli, and free style
- Existing content modes: playlist, artist, artist radio, and library radio
- Free-style text search for custom moods or situations
- Visual result grid with large rounded cards, artwork, media type, and clear selection state
- Playback confirmation overlay before returning to the main player

### Studio / Control Room

- Player grid for room control
- Select primary player
- Multi-player selection
- Speaker grouping and ungrouping
- Per-room volume sliders
- Move/transfer playback foundations
- Search and play library media from Studio
- Labeled action dock for search, queue transfer, grouping, and ungrouping
- Stable tablet panel layout and scroll handling

### Queue

- Queue panel and full queue view
- Current item and up-next display
- Queue search
- Inline expandable queue-row actions
- Play now, play next, add to queue, remove, and move actions where supported
- Clear transfer-queue label and queue-count button
- Artwork and duration display
- Empty queue and loading states

### Library

- Music Assistant playlists, albums, artists, tracks, radio, and podcasts
- Library search
- Play all, shuffle all, play now, add to queue
- Favorite/liked handling
- Radio Browser support with country/filter/search foundations
- Clean grid and list views for touch

### Lyrics

- Wide lyrics screen
- Centered, immersive lyric presentation
- Synced lyrics offset controls
- Lyrics font size controls with `+`, `-`, and reset
- Lyrics cache and unavailable states
- Mobile/tablet layout fixes for long song and artist names

#### External lyrics and privacy

Lyrics embedded in Music Assistant metadata stay inside the Home Assistant/Music Assistant connection. The optional LRCLIB fallback is disabled by default.

If you explicitly enable `lrclib_lyrics_enabled: true`, and Music Assistant has not supplied embedded lyrics, the browser sends the current track title, artist, album, and duration to `https://lrclib.net/api/get` and may then use `https://lrclib.net/api/search`. This exposes those listening details and the browser's public IP address to LRCLIB. Leave the option disabled for a fully local lyrics path.

### Timers, Schedules, And Night Mode

- Sleep timer countdown
- Quick timer buttons
- Scheduled start actions
- Choose player, days, time, volume, and playlist
- Random pleasant morning fallback when no playlist is selected
- Night mode off / auto / on
- Night mode time window and day selection
- Mobile timer display above the active player button

### History And Recommendations

- Recent listening drawer
- Last 10 recent items shown immediately when opening history
- Recommendations tab
- Playlist recommendations
- Queue/recent-based suggestion foundations
- Quick play from history or recommendation chips

### Announcements

- Announcement page
- Target player selection
- Text-to-speech announcements
- Preset announcement buttons
- Voice dictation when the browser supports it
- Automatic Hebrew/English language detection

### Mobile UX

- One-handed control layout
- Active player button
- Mobile main bar customization
- Compact volume controls
- Artwork swipe/browse support through Embla
- Immediate artwork selection feedback while browsing covers
- Mobile settings saved locally
- Touch-sized controls and RTL-safe layout

### Settings And Editor

- Built-in Home Assistant visual editor support
- In-card settings panels
- Language, theme, layout, color, motion, footer, volume, mic, swipe, liked, night mode, and shortcut settings
- Announcement preset and TTS entity settings
- Current defaults: auto-fit card height, night mode `off`, up-next `off`, mic `smart`, settings source `visual editor`, dynamic theme `auto`, background motion `subtle`, footer `icon+text`, font scale `1`, artwork swipe `browse`, home shortcut `off`, liked mode `Music Assistant`
- Config validation and tested state helpers

## Full Feature Map

<details>
<summary>Open the complete feature map</summary>

### Now Playing

- Artwork-first now-playing presentation
- Blurred artwork background and ambient treatment
- Track title, artist, album, and source metadata
- Source/provider badge display
- Neutral missing-artwork fallback
- Idle, unavailable, loading, paused, and playing states
- Long title and long artist handling
- Hebrew/RTL-safe metadata alignment
- Main layout for tablet and desktop
- Mobile layout for narrow screens
- Immersive full player view
- Compact dashboard mode
- Up-next visibility support
- Recent playback foundations

### Playback Controls

- Play / pause
- Previous track
- Next track
- Shuffle toggle
- Repeat toggle
- Repeat-one icon/state support
- Progress bar
- Seek interaction
- Live progress refresh
- Transport controls in regular and immersive layouts
- Touch-friendly control sizing
- Visual active states

### Volume

- Volume slider
- Mute / unmute
- Soft mute handling
- Last volume memory by player
- Large player volume controls
- Control-room volume controls
- Volume presets
- Mobile volume mode: always visible or button-triggered
- Per-player volume display
- Slider fill and thumb styling for light/dark modes

### Queue

- Embedded queue panel
- Full queue view
- Compact queue cards
- Mini queue list
- Active queue item highlighting
- Previous/past queue styling
- Up-next state resolution
- Queue search
- Queue and library combined search flow
- Clear search and back-to-queue behavior
- Queue item artwork
- Queue item duration
- Queue item context actions
- Inline row expansion for touch-safe actions
- Text actions for play next and play now
- Wider centered move up/down action buttons
- Red translucent remove action
- Play now
- Shuffle play
- Play next
- Add to queue
- Remove from queue
- Move up/down where supported
- Queue transfer label and count in the queue header
- Queue transfer between players foundations
- Empty queue state
- Queue action feedback

### Music Assistant Library

- Library home view
- Playlists
- Artists
- Albums
- Tracks
- Radio
- Podcasts
- Favorite radio
- Recently played
- Recently added
- Discover/random album sections
- Library caching
- Grid collection rendering
- Track list rendering
- Track grid/list toggle
- Play all
- Shuffle all
- Add library item to queue
- Play library item now
- Search across library categories
- No-results state
- Loading and error states

### Radio Browser

- Radio Browser country list support
- Country filter support
- Top-voted station discovery
- Station search
- Radio metadata normalization
- Radio identity detection
- Radio playback detection
- Radio artwork/favicon support where available

### Favorites And Likes

- Music Assistant favorite detection
- Local liked-state mode
- Optimistic favorite updates
- Favorite cache entries
- Current-media favorite matching
- Queue-based favorite state resolution
- Favorite remove-argument resolution
- Favorite radio support
- Liked library tab support

### Players And Multi-Room

- Player picker
- Selected player summary
- Active players view
- Browser player detection
- This-device Sendspin flow
- Waiting-for-device-player state
- Other players section
- Pinned player support
- Multiple pinned players
- Player grouping
- Group speakers modal
- Apply group
- Ungroup
- Group membership detection
- Static group handling foundations
- Derived group stats
- Stop all players with stop, queue clear, group disconnect, and local Sendspin disconnect
- Player transfer target selection
- Player state indicators
- Player artwork/track preview

### Announcements

- Announcement screen
- Target player selection
- Announcement text input
- Up to three presets
- Preset fill buttons
- TTS entity configuration
- Automatic TTS entity fallback detection
- Text-to-speech announcements
- Music Assistant announcement playback fallback
- Hebrew/English announcement language detection
- Voice dictation when supported
- Success/failure feedback

### Sleep Timer, Scheduling, And Night Mode

- Sleep timer menu
- +15 / +30 / +60 minute actions
- Clear/cancel timer
- Timer countdown label
- Timer footer/chip display
- Timer persistence in local storage
- Scheduled start by hour
- Scheduled start by selected days
- Scheduled start player selection
- Scheduled start volume
- Scheduled start playlist selection
- Mobile-safe schedule controls for narrow iPhone layouts
- Random pleasant morning fallback
- Night mode: off / auto / on
- Night mode start/end times
- Night mode day selection
- Overnight window handling
- Night-mode-triggered timer state
- Helper tests for foundations

### Actions

- Dedicated actions menu
- FLOW guided wizard
- Scheduling shortcut
- Sleep timer shortcut
- Announcements shortcut
- Queue/player action shortcuts
- Home shortcut option
- Studio shortcut option
- Fast mobile access to high-use controls

### FLOW Guided Wizard

- Guided three-step flow: players, music, play
- Clean state on every open from the actions menu
- Reset action on every step
- All players and individual player selection
- Mood-based search
- Existing content search
- Free-style mood query
- Playlist, artist, artist radio, and library radio flows
- Visual results grid
- Large rounded result cards with artwork and media type
- Active result highlighting
- Play confirmation overlay
- Automatic return to the main player after starting playback

### Search

- Global search input
- Search clear button
- Debounced search timers
- Search across radio, podcasts, albums, artists, tracks, and playlists
- Queue search
- Library search
- Side search summary
- No-results messaging
- Mobile/tablet search adaptation

### Theme And Visual System

- Auto / light / dark theme modes
- Theme toggle
- Custom color support
- Dynamic theme from current artwork
- Dynamic theme modes: off / auto / strong
- Dynamic palette cache
- Background motion modes: off / subtle / strong / extreme
- Light theme refinements
- Dark theme refinements
- Accent color resolution
- Palette tuning helpers
- Background glow and artwork aura
- High-contrast text handling
- Custom text tone: light/dark

### Mobile, Tablet, And Desktop UX

- Mobile-first shell
- Mobile compact mode
- Expandable compact behavior
- Mobile up-next toggle
- Mobile footer modes: icon / text / both
- Optional footer search
- Mobile main bar customization
- Mobile library tab customization
- Mobile font scale
- Mobile swipe mode
- Mobile mic mode
- Mobile volume mode
- Mobile home shortcut
- Mobile studio shortcut
- Tablet layout mode
- Auto layout mode
- Height-aware layout adaptation
- Desktop wide layout
- Responsive grid behavior
- Tablet sheet sizing for library, search, queue, actions, players, group players, and settings

### Language And RTL

- English labels
- Hebrew labels
- Auto language mode
- Manual language toggle
- RTL layout support
- RTL-safe controls
- Hebrew-friendly settings labels
- Hebrew announcement flow
- Editor locale helpers

### Adding A Language

- Start from `src/localization/en.js` and translate values only.
- Register the new file in `src/localization/index.js`.
- Add the language to `LANGUAGE_OPTIONS`.
- Add the language code to `RTL_LANGUAGE_CODES` only for right-to-left languages.
- Run `npm test`, `npm run build`, and `node scripts/release.mjs`.
- Use `TRANSLATING.md` for the full string glossary and `HOW_TO_ADD_A_LANGUAGE.md` for the step-by-step release checklist.

### Reliability And Release Foundation

- Structured `src/core` foundation helpers
- Config validators
- State defaults and derived state helpers
- Mobile settings normalization
- Responsive layout helpers
- Palette and dynamic theme helpers
- Night mode and sleep timer helpers
- Media queue identity and matching helpers
- Favorites and optimistic favorite-state helpers
- Player, pinned-player, and grouping helpers
- Media presentation helpers
- History and source-badge helpers
- Vitest coverage for high-risk logic
- ESLint configuration
- Vite build flow
- Release sync script
- HACS validation workflow
- QA matrix for viewport/theme/interaction checks

</details>

## Basic Configuration

```yaml
type: custom:homeii-music-flow
language: auto
rtl: true
theme_mode: auto
show_theme_toggle: true
# Optional: create this helper in Home Assistant first.
active_player_helper_entity: input_text.homeii_flow_active_player
```

Use the visual editor or in-card settings whenever possible.

## Project Structure

```text
dist/homeii-music-flow.js             self-contained HACS/manual runtime (includes Sendspin and Embla)
dist/sendspin-js/                     source/license copy; not loaded by the production bundle
dist/vendor/embla-carousel.umd.js     source/license copy; not loaded by the production bundle
dist/homeii-flow-logo.svg             packaged legacy brand asset
dist/homeii-flow-logo.png             packaged transparent HOMEii Flow logo
dist/homeii-flow-icon.png             packaged HOMEii Flow app icon
src/homeii-music-flow.js              source snapshot for the card
src/sendspin-js/                      source copy of Sendspin browser player files
vendor/embla-carousel.umd.js          source copy of Embla used by the release package
src/core/                             extracted foundation helpers
src/config/                           config validators
tests/                                regression coverage
scripts/release.mjs                   release sync tooling
RELEASE_NOTES_5.9.3.md                detailed GitHub release notes for the current stable release
docs/README.md                        complete user documentation hub
docs/brand/                           logo and brand assets
docs/media/                           GitHub/HACS README screenshots and GIF
docs/qa-matrix.md                     viewport/theme/interaction release gate
```

HACS installs the single `dist/homeii-music-flow.js` dashboard resource. The production bundle inlines the Sendspin browser player and Embla carousel, does not load sibling JavaScript files, and does not fetch external web fonts. The extra files in `dist/` support manual inspection, licensing, and legacy manual installs; they are not runtime dependencies for HACS.

## Development

```text
npm install
npm run build
npm run lint
npm test
```

Current packaged version: `5.9.3`

## Release Readiness

Before publishing a release:

- Run `npm run build`.
- Run `npm run lint`.
- Run `npm test`.
- Confirm `dist/homeii-music-flow.js` exists.
- Confirm the built file contains no runtime references to `./sendspin-js/`, `./vendor/`, or `fonts.googleapis.com`.
- Confirm `dist/homeii-flow-logo.svg`, `dist/homeii-flow-logo.png`, and `dist/homeii-flow-icon.png` exist.
- Confirm the README renders all screenshots.
- Create a GitHub release, not only a tag.
- Install through HACS as a custom repository and verify the resource path.
- Test phone, tablet, and desktop layouts.
- Test Sendspin "This device" connection on at least one browser device.

## Support

HOMEii Flow is free and built as an independent community project. If it improves your Home Assistant music dashboard and you want to support continued polish, fixes, documentation, and new features, sponsorship is appreciated.

No pressure: stars, feedback, screenshots, bug reports, and thoughtful feature ideas also help a lot.

<p align="center">
  <a href="https://github.com/sponsors/r11a">
    <img alt="Sponsor HOMEii Flow" src="https://img.shields.io/badge/Sponsor-HOMEii%20Flow-EA4AAA?logo=githubsponsors&logoColor=white">
  </a>
</p>

## Credits

HOMEii Flow is an independent community project and is not an official Music Assistant or Home Assistant project.

Credit and thanks:

- [Music Assistant](https://www.music-assistant.io/) for the music server, Home Assistant integration, library model, player control, announcements, and Sendspin support that make this card possible.
- [Sendspin](https://www.music-assistant.io/player-support/sendspin/) and the Open Home Foundation for the browser/local playback protocol used by the "This device" player flow.
- [Home Assistant](https://www.home-assistant.io/) for the dashboard platform.
- [HACS](https://www.hacs.xyz/) for the custom repository distribution path.
- [Embla Carousel](https://www.embla-carousel.com/) for the packaged swipe foundation.
- Daniel Eduardo Gonzalez ([@danielxb-ar](https://github.com/danielxb-ar)) for the Spanish translation.
- Donatas / donatassmarterhome for the Lithuanian translation.
- Julien Moreau B. / [jingle-jew](https://github.com/jingle-jew) for the French translation, French wording corrections, PR #34, PR #35, PR #36, Sendspin / Media Session improvements, and 5.7.x testing feedback.
- [@Dieghito72](https://github.com/Dieghito72) for the Italian translation contribution.
- [@gao19970120](https://github.com/gao19970120) for the Simplified Chinese translation contribution.
- [@TheBamse](https://github.com/TheBamse) for the Danish translation contribution and performance-focused PRs.
- Codex for helping turn a non-programmer's product and UX vision into a working release-ready card.

## Documentation

- [Complete user documentation](./docs/README.md)
- [Local deployment guide](./LOCAL_DEPLOYMENT.md)
- [Publishing checklist](./PUBLISHING.md)
- [5.9.3 release notes](./RELEASE_NOTES_5.9.3.md)
- [Older releases and tags](https://github.com/r11a/homeii-music-flow/releases)
- [QA matrix](./docs/qa-matrix.md)
- [Repo assets checklist](./docs/repo-assets-checklist.md)
- [Changelog](./CHANGELOG.md)
