# HOMEii Flow

<p align="center">
  <img src="https://raw.githubusercontent.com/r11a/homeii-music-flow/main/docs/brand/homeii-flow-logo.svg" alt="HOMEii Flow logo" width="280">
</p>

<p align="center">
  <strong>A premium Music Assistant dashboard card for Home Assistant.</strong><br>
  Built for wall tablets, phones, RTL/Hebrew homes, multi-room listening, and a real music-first experience.
</p>

<p align="center">
  <a href="https://my.home-assistant.io/redirect/hacs_repository/?owner=r11a&repository=homeii-music-flow&category=plugin">
    <img alt="Add HOMEii Flow to HACS" src="https://my.home-assistant.io/badges/hacs_repository.svg">
  </a>
  <a href="https://www.hacs.xyz/docs/use/download/download/">
    <img alt="Install HACS" src="https://img.shields.io/badge/Install-HACS-41BDF5?logo=homeassistant&logoColor=white">
  </a>
  <a href="https://github.com/r11a/homeii-music-flow/releases">
    <img alt="Download releases" src="https://img.shields.io/badge/Download-release-111111?logo=github">
  </a>
</p>

<p align="center">
  <a href="https://github.com/r11a/homeii-music-flow"><img alt="version" src="https://img.shields.io/badge/version-5.1.1-gold"></a>
  <img alt="Home Assistant" src="https://img.shields.io/badge/Home%20Assistant-Lovelace-41BDF5">
  <img alt="Music Assistant" src="https://img.shields.io/badge/Music%20Assistant-required-7C5CFF">
  <img alt="Sendspin" src="https://img.shields.io/badge/Sendspin-browser%20player-18B6FF">
  <img alt="HACS" src="https://img.shields.io/badge/HACS-custom%20repository-41BDF5">
  <img alt="Built with Codex" src="https://img.shields.io/badge/built%20with-Codex-111111">
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/r11a/homeii-music-flow/main/docs/media/homeii-flow-preview.gif" alt="HOMEii Flow preview" width="100%">
</p>

HOMEii Flow is a custom Home Assistant Lovelace card for Music Assistant. It turns music control into a polished listening surface: visual, fast, personal, and comfortable on both wall tablets and phones.

This project was created from a UX/product vision by a Home Assistant user with no programming background. The design direction, daily use cases, Hebrew/RTL needs, and experience goals came from real home use. The implementation was built iteratively with Codex.

## Why It Stands Out

- **Sendspin browser player built in:** turn the current browser, phone, tablet, or wall panel into a Music Assistant playback target directly from the card, with a session that survives Lovelace page changes while the dashboard stays open.
- **Premium now-playing experience:** artwork-led layout, dynamic atmosphere, elegant controls, full-screen lyrics, and responsive visual polish.
- **FLOW guided music wizard:** a simple step-by-step music flow for choosing players, picking a mood or existing content, reviewing visual results, and starting playback without learning the full Music Assistant UI.
- **Studio / Control Room:** choose players, group rooms, control volumes, move playback, and manage multi-room listening.
- **Mobile-first workflow:** queue, search, library, FLOW, actions, timers, announcements, settings, and player switching are designed for touch.
- **Real Music Assistant library flow:** playlists, albums, artists, tracks, radio, favorites, recent listening, and recommendations.
- **Hebrew and RTL ready:** layout, labels, alignment, and interaction patterns are built for Hebrew as a first-class use case.
- **Release-ready package:** HACS-ready `dist/` output includes the card, Sendspin files, Embla swipe support, and the brand asset.

## What's New In 5.1.1

- **HACS README assets fixed:** the logo, preview GIF, and screenshots now use absolute GitHub raw URLs so they render inside the HACS download screen.

## What's New In 5.1.0

- **FLOW replaces SIMPLE:** a polished guided wizard with a fresh start on every open, reset controls on every step, free-style mood search, and a visual results grid.
- **Queue actions inside the row:** queue items expand in place with clear `Play next`, `Play now`, move up/down, and remove actions instead of opening a modal.
- **Clear queue transfer entry:** the queue view now exposes a labeled transfer button with the queue count.
- **Better artwork browsing:** cover browsing keeps artwork fully visible and reacts immediately when a new item is selected.
- **History drawer reliability:** recent listening opens directly with the latest 10 items instead of waiting for a tab change.
- **Lyrics font controls:** lyrics now include `+`, `-`, and reset controls for font size.
- **Studio and modal polish:** more consistent brand/logo treatment and clearer action labels across opened panels.
- **Safer global stop:** `Stop all players` stops playback, clears queues, disconnects player groups, and disconnects the local `This device` player when present.
- **Updated defaults:** card height `850`, night mode off, next-song preview off, smart mic mode, visual-editor settings, dynamic theme auto, subtle background motion, icon+text footer, artwork swipe browsing, home shortcut off, and Music Assistant liked mode.

## Quick Install

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
3. Add this Lovelace resource:

```text
/local/community/homeii-music-flow/homeii-music-flow.js?v=5.1.1
```

4. Add the card:

```yaml
type: custom:homeii-music-flow
```

## Requirements

- Home Assistant with Lovelace custom cards enabled.
- Music Assistant installed, running, and connected to Home Assistant.
- At least one Music Assistant player exposed as a Home Assistant `media_player`.
- HACS for the easiest install path, or manual access to `/config/www/community/`.
- A modern browser for the dashboard: Chrome, Edge, Safari, or a modern Android/iOS browser.
- For the local Sendspin browser player: a direct Music Assistant URL and Music Assistant token configured in the card settings.
- For best Sendspin performance: the browser device and Music Assistant should be on the same local network.
- Sendspin URL security must match the dashboard: if Home Assistant is opened over `https://`, configure Music Assistant with an `https://` URL so HOMEii Flow can use `wss://`; browsers block `http://` / `ws://` Sendspin from an HTTPS dashboard.
- If Home Assistant is opened locally over `http://`, a local `http://` Music Assistant URL is usually fine and HOMEii Flow will use `ws://`.
- Mobile browsers can pause audio and WebSocket work when the app is backgrounded or the phone is locked. HOMEii Flow remembers the active "This device" intent during the current app/browser session and reconnects when the dashboard becomes active again.
- Optional: a configured `tts.*` entity for text-to-speech announcements.
- Optional but recommended: correct Home Assistant internal/external URLs, especially for phones, tablets, and remote access.

## Sendspin Browser Player

HOMEii Flow includes a local browser player flow powered by Sendspin. In the card this appears as **This device**.

What it does:

- connects the current browser directly to Music Assistant through Sendspin
- registers the phone, tablet, PC browser, or wall panel as a playable Music Assistant target
- lets the device appear in the player list once Music Assistant publishes it back to Home Assistant
- keeps a HOMEii-specific player identity so the card does not accidentally pick a random browser player from another tab
- keeps the active local player alive at dashboard/tab level while moving between Lovelace pages or dashboards in the same Home Assistant session
- removes the HOMEii local player immediately when **Disconnect this device** is used
- packages the required `sendspin-js` runtime in `dist/sendspin-js/`

What you need:

1. Music Assistant running and reachable from the device.
2. `ma_url` configured in the card settings.
3. `ma_token` configured in the card settings.
4. Press **Connect this device** from the player screen.
5. Select the new HOMEii browser player when it appears.

Notes:

- Sendspin is built into Music Assistant and the provider is enabled by default.
- Sendspin is still a technical preview in Music Assistant, so behavior can change over time.
- Local network playback is preferred. Remote playback depends on Music Assistant, browser, WebRTC, and network conditions.
- HTTPS matters: an HTTPS Home Assistant dashboard cannot open an insecure `ws://` Sendspin connection. Use an HTTPS Music Assistant URL, or open Home Assistant locally over HTTP when testing on the same network.
- Mobile lifecycle matters: iOS, Android, and WebView-based apps can suspend browser audio/WebSocket work when the app is backgrounded or the phone is locked. HOMEii Flow will reconnect the HOMEii Sendspin player when the dashboard becomes active again, but it cannot force the operating system to keep a locked/backgrounded browser alive forever.
- Lovelace navigation is handled inside HOMEii Flow: the local Sendspin audio element and connection intent are kept outside the card instance, so moving between dashboard pages should not require reconnecting.
- Use **Disconnect this device** in the player screen when you want HOMEii Flow to stop reconnecting the local browser player.
- Mobile browsers may require a user gesture before audio playback is allowed after a reconnect.

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
- Dashboard-level local session so the browser player is not tied to one Lovelace card instance
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
- Current defaults: height `850`, night mode `off`, up-next `off`, mic `smart`, settings source `visual editor`, dynamic theme `auto`, background motion `subtle`, footer `icon+text`, font scale `1`, artwork swipe `browse`, home shortcut `off`, liked mode `Music Assistant`
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
```

### Sendspin / This Device Configuration

```yaml
type: custom:homeii-music-flow
ma_url: "http://YOUR_MUSIC_ASSISTANT_HOST:8095"
ma_token: "YOUR_MUSIC_ASSISTANT_TOKEN"
```

Use the visual editor or in-card settings whenever possible.

## Project Structure

```text
dist/homeii-music-flow.js             HACS/manual runtime
dist/sendspin-js/                     packaged local Sendspin browser player files
dist/vendor/embla-carousel.umd.js     packaged swipe support
dist/homeii-flow-logo.svg             packaged brand asset
src/homeii-music-flow.js              source snapshot for the card
src/sendspin-js/                      source copy of Sendspin browser player files
vendor/embla-carousel.umd.js          source copy of Embla used by the release package
src/core/                             extracted foundation helpers
src/config/                           config validators
tests/                                regression coverage
scripts/release.mjs                   release sync tooling
docs/brand/                           logo and brand assets
docs/media/                           GitHub/HACS README screenshots and GIF
docs/qa-matrix.md                     viewport/theme/interaction release gate
```

HACS plugin repositories must expose the dashboard JavaScript in `dist/` or the repository root. HOMEii Flow keeps the full installable runtime in `dist/` because the local Sendspin player, Embla, and logo asset are required at runtime.

## Development

```text
npm install
npm run build
npm run lint
npm test
```

Current packaged version: `5.1.1`

## Release Readiness

Before publishing a release:

- Run `npm run build`.
- Run `npm run lint`.
- Run `npm test`.
- Confirm `dist/homeii-music-flow.js` exists.
- Confirm `dist/sendspin-js/` exists.
- Confirm `dist/vendor/embla-carousel.umd.js` exists.
- Confirm `dist/homeii-flow-logo.svg` exists.
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
- Codex for helping turn a non-programmer's product and UX vision into a working release-ready card.

## Documentation

- [Local deployment guide](./LOCAL_DEPLOYMENT.md)
- [Publishing checklist](./PUBLISHING.md)
- [QA matrix](./docs/qa-matrix.md)
- [Repo assets checklist](./docs/repo-assets-checklist.md)
- [Changelog](./CHANGELOG.md)
