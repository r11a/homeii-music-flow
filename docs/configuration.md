# Configuration

> **Preparing 6.0.0 Beta:** install Engine `1.0.0-beta.1` first. Read the [breaking upgrade and beta guide](BETA_GUIDE.md) before replacing 5.9.3. No beta release has been published by this preparation.

HOMEii Music Flow can be configured from the Home Assistant visual editor, the in-card settings screen, or YAML.

## Configuration Sources

There are two kinds of configuration:

- **YAML / visual editor config:** saved in the Home Assistant dashboard.
- **In-card settings:** saved in browser storage for the current browser/device.

Use the visual editor for structural options such as helper entities, card id, and default player. Configure the Music Assistant URL and token only in HOMEii Flow Engine. Use in-card settings for personal UI choices such as theme, layout, pinned players, quick actions, and phone behavior.

## Minimal YAML

```yaml
type: custom:homeii-music-flow
```

## Common YAML

```yaml
type: custom:homeii-music-flow
entity: media_player.living_room
language: auto
theme_mode: auto
phone_display_mode: auto
```

## Language and Search Ordering

German is available as `language: de`, in the language picker, or automatically when Home Assistant uses German (`language: auto`). The German dictionary incorporates [PR #89](https://github.com/r11a/homeii-music-flow/pull/89), contributed by rtreichl, and includes the current action-label setting.

Search section order can be configured in YAML. Omitted sections retain their default relative order after the configured sections; sections with no results remain hidden.

```yaml
search_result_order:
  - artists
  - albums
  - tracks
  - playlists
  - radio
  - podcasts
```

Large-library “Load more” controls require Engine 0.7.21 or newer and its `library_pagination` capability. Older Engines retain the existing first-page behavior.

## Music Assistant Connection

HOMEii Music Flow 6 has one supported backend path: **HOMEii Flow Engine**.

The card is the visual interface. The Engine talks to Home Assistant and Music Assistant, owns the queue/library/search/artwork/playback data path, and returns normalized data to the card. The card does not fall back to the old frontend-only Home Assistant/Music Assistant paths.

The card does not accept or store `ma_url`, `music_assistant_external_url`, or `ma_token` in 6.0.0. Existing legacy values are ignored and removed the next time the visual editor saves the card.

## HOMEii Flow Engine

HOMEii Music Flow 6 requires the HOMEii Flow Engine Home Assistant integration, version `1.0.0-beta.1` for the prepared 6.0.0 beta pair.

The card is now the visual interface only. Playback, players, queue, library, search, artwork, grouping, schedules, timers, statistics, announcements, volume rules, and diagnostics are handled by the Engine. If the Engine is not installed and loaded, the 6.x card shows an Engine-required message instead of using old frontend-only paths.

Supported card options:

```yaml
type: custom:homeii-music-flow
homeii_engine_mode: required
homeii_engine_timeout_ms: 3500
homeii_engine_instance_id: ""
homeii_engine_profile_id: ""
```

`homeii_engine_mode` supports:

- `required`: the only supported HOMEii Flow 6 mode. The card will not run without the Engine.

Users who want to keep the previous frontend/Home Assistant/Music Assistant behavior should stay on HOMEii Music Flow 5.9.x.

## Sendspin / This Device

The browser-based **This device** player is disabled in 6.0.0 Engine-only mode. Direct Sendspin authentication requires exposing an MA credential to the browser, which conflicts with the single secure Engine-owned connection model. Existing Music Assistant players continue to work normally.

## Reusable Dashboards

HOMEii Music Flow makes reusable dashboards easier with two related features:

- `card_id` separates local settings for different card instances.
- URL player overrides open the same dashboard directly to a specific player.

Use them when:

- one YAML/dashboard include is reused for many rooms
- one tablet should open directly to the kitchen player
- another dashboard should open directly to the bedroom player
- multiple HOMEii cards run in the same browser
- different users need different default players without duplicating the whole card configuration

## `card_id`

Use `card_id` when you run more than one HOMEii Music Flow card in the same browser and want separate local settings.

```yaml
type: custom:homeii-music-flow
card_id: kitchen-flow
entity: media_player.kitchen
```

Rules:

- `card_id` is optional.
- It can include letters, numbers, `_`, and `-`.
- Cards with the same `card_id` share in-card settings.
- Cards with different `card_id` values keep separate browser-local settings.

Adding `card_id` to an existing card may make it look like settings were reset once. The old browser settings still exist under the old global keys; the card now reads from the new card-scoped keys.

## Query-String Player Override

HOMEii Music Flow can read the selected player from the dashboard URL. This is useful for reusable dashboards and included YAML.

Supported examples:

```text
?player=kitchen_sonos
?homeii_player=kitchen_sonos
```

With `card_id`:

```text
?homeii_player_kitchen-flow=kitchen_sonos
```

The value can match a player entity id or common object-id style name, depending on the player exposed by Home Assistant.

## Open A Dashboard Directly To A Player

The simplest form is:

```text
?player=kitchen_sonos
```

Example:

```text
https://homeassistant.example.com/lovelace/music?player=kitchen_sonos
```

You can also use:

```text
?homeii_player=kitchen_sonos
```

If the dashboard contains more than one HOMEii Music Flow card, use a card-scoped parameter:

```yaml
type: custom:homeii-music-flow
card_id: kitchen-flow
```

```text
https://homeassistant.example.com/lovelace/music?homeii_player_kitchen-flow=kitchen_sonos
```

This tells only the card with `card_id: kitchen-flow` to use `kitchen_sonos`.

### Matching Rules

HOMEii Music Flow tries to match the URL value against available players.

Recommended values:

- full entity id: `media_player.kitchen_sonos`
- object id: `kitchen_sonos`
- a stable Music Assistant / Home Assistant player id when exposed

If the player is not found, the card falls back to its configured or last selected player.

### Practical Examples

Kitchen tablet:

```text
https://homeassistant.example.com/lovelace/music?player=kitchen_sonos
```

Bedroom tablet:

```text
https://homeassistant.example.com/lovelace/music?player=bedroom_speaker
```

Two cards on the same dashboard:

```text
https://homeassistant.example.com/lovelace/music?homeii_player_kitchen-flow=kitchen_sonos&homeii_player_bedroom-flow=bedroom_speaker
```

### Important Notes

- URL player overrides do not permanently rewrite the dashboard YAML.
- They only affect the browser session/card state.
- `card_id` is recommended when more than one HOMEii card can appear in the same browser.
- If the URL parameter points to a missing player, HOMEii Flow keeps using the normal selected player.

## Active Player Helper

HOMEii Music Flow can publish the currently selected player to an `input_text` helper.

Create a text helper in Home Assistant, then configure:

```yaml
type: custom:homeii-music-flow
active_player_helper_entity: input_text.homeii_flow_active_player
```

The helper stores values such as:

```text
media_player.kitchen
```

Use it in automations:

```yaml
alias: HOMEii Flow - Toggle active player
sequence:
  - service: media_player.media_play_pause
    target:
      entity_id: "{{ states('input_text.homeii_flow_active_player') }}"
```

## Recommended Defaults

For most users:

```yaml
type: custom:homeii-music-flow
language: auto
theme_mode: auto
phone_display_mode: auto
```

For wall tablets:

```yaml
type: custom:homeii-music-flow
language: auto
theme_mode: auto
phone_display_mode: full
```

For multiple cards in one browser:

```yaml
type: custom:homeii-music-flow
card_id: living-room-flow
entity: media_player.living_room
```
