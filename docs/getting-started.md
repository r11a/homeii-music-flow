# Getting Started

> **Preparing 6.0.0 Beta:** install Engine `1.0.0-beta.1` first. Read the [breaking upgrade and beta guide](BETA_GUIDE.md) before replacing 5.9.3. No beta release has been published by this preparation.

This guide gets HOMEii Music Flow running in Home Assistant for the first time.

## Before You Install

Confirm these first:

- Music Assistant is installed and running.
- Music Assistant is connected to Home Assistant.
- HOMEii Flow Engine `1.0.0-beta.1` for the prepared 6.0.0 beta pair is installed and loaded when using HOMEii Music Flow 6.0.0 or newer.
- Home Assistant shows at least one Music Assistant player as a `media_player`.
- You can control that player from Home Assistant before adding HOMEii Music Flow.

HOMEii Music Flow 6.0.0 is a visual frontend for HOMEii Flow Engine. It does not replace Music Assistant and it does not create players by itself, but it also does not run without the Engine.

## Install With HACS

1. Open Home Assistant.
2. Open HACS.
3. Open **Custom repositories**.
4. Add this repository:

```text
https://github.com/r11a/homeii-music-flow
```

5. Select category **Dashboard**.
6. Download **HOMEii Flow**.
7. Refresh the browser or restart Home Assistant if the card is not available immediately.

Add the card:

```yaml
type: custom:homeii-music-flow
```

If HACS does not add the resource automatically, add:

```text
/hacsfiles/homeii-music-flow/homeii-music-flow.js
```

## Manual Install

1. Create this folder:

```text
/config/www/community/homeii-music-flow/
```

2. Copy the full contents of `dist/` into that folder.
3. Add this Dashboard resource:

```text
/local/community/homeii-music-flow/homeii-music-flow.js?v=6.0.0
```

4. Add the card:

```yaml
type: custom:homeii-music-flow
```

## First Card

Minimal configuration:

```yaml
type: custom:homeii-music-flow
```

Recommended first configuration:

```yaml
type: custom:homeii-music-flow
language: auto
theme_mode: auto
phone_display_mode: auto
```

If you want the card to start on a specific player:

```yaml
type: custom:homeii-music-flow
entity: media_player.living_room
```

## First Run Checklist

After adding the card:

1. Open the card.
2. Select a player.
3. Play something through Music Assistant.
4. Open Library and confirm playlists/albums/tracks load.
5. Open Queue and confirm current/upcoming items load.
6. Open Settings and run Diagnostics.

If something fails, copy the Diagnostics report and use [Troubleshooting](./troubleshooting.md).

## Best First Dashboard Layout

For a dedicated music dashboard:

- Use **Panel view** for the most app-like experience.
- Use **Section view** when you want the card to share the dashboard with a few related cards.
- Use **Masonry** only if the card is one widget among many.

For phones:

- Use **Full** or **Edge to edge** for a full music app feeling.
- Use **Compact** when the card sits among other dashboard cards.

## Reusable Dashboards

HOMEii Music Flow includes two tools that make shared dashboards easier:

- `card_id` for separating local settings between card instances.
- URL player overrides for opening the same dashboard directly to a specific player.

Example card:

```yaml
type: custom:homeii-music-flow
card_id: house-music
```

Example dashboard URL:

```text
https://homeassistant.example.com/lovelace/music?player=kitchen_sonos
```

When the page opens, HOMEii Music Flow tries to select the player from the URL. This is useful when you reuse the same dashboard for different rooms, tablets, or users.

For the full rules, see [Configuration: Reusable Dashboards](./configuration.md#reusable-dashboards).

## Updating

After updating through HACS:

1. Refresh Home Assistant.
2. If the old version still appears, hard-refresh the browser.
3. On mobile, restart the Home Assistant Companion app if needed.
4. Confirm the version in card settings or Diagnostics.
