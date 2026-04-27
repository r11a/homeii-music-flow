# Repo Assets Checklist

The repo now uses `docs/brand/` for logo assets and `docs/media/` for stable GitHub-friendly image names.
The raw `PROJECT PICTUERS` folder can stay local as the source capture folder, but the README should reference only files from `docs/media/`.

## Current assets

- `homeii-flow-preview.gif`
- `docs/brand/homeii-flow-logo.svg`
- `hero-main-light.png`
- `history-light.png`
- `studio.png`
- `queue.png`
- `library.png`
- `players.png`
- `actions.png`
- `announcement.png`
- `lyrics.png`
- `settings.png`
- `tablet.png`
- `mobile-1.jpg` through `mobile-7.jpg`

## Still worth adding later

1. A real short screen-recording GIF of queue search and player switching
2. A real short screen-recording GIF of theme switching
3. A screenshot of the Home Assistant visual editor if it differs from the in-card settings UI
4. A clean before/after comparison against a simple default media card

## What each future asset should show

### Hero / main screenshot

- real artwork
- now-playing title and artist
- primary transport controls
- progress and volume visible
- premium spacing and color treatment

### Mini-player dashboard screenshot

- the compact card inside a real Lovelace dashboard
- proof that it stays elegant when embedded with other cards

### Queue and switching GIF

- open queue
- scroll queue
- search queue or library
- switch player
- transfer queue or select a new target player

Keep it short, ideally 8 to 15 seconds.

### Theme toggle GIF

- switch between light and dark
- show that contrast, artwork, and controls stay polished

### Editor/config screenshot

- built-in editor UI
- a few meaningful options visible
- enough context to prove this is configurable without YAML-only friction

### RTL/Hebrew screenshot

- Hebrew labels
- RTL layout alignment
- controls still readable and balanced

## Capture tips

- Use real artwork, not placeholders
- Avoid cluttered dashboards in screenshots
- Prefer narrow mobile aspect for the hero
- Keep one consistent theme language across captures
- Hide personal or device-sensitive information
- Crop tightly enough to feel intentional, but not so tight that context disappears

## README placement

The README currently places the assets in this order:

1. preview GIF
2. main now-playing screenshot
3. studio / players / queue
4. library / actions / settings
5. lyrics / announcements / tablet
6. mobile details

## Nice-to-have later

- short architecture diagram
- release badge and HACS badge after publishing flow is finalized
