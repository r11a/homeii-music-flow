# HOMEii Music Flow 6.1.2

Stable patch release · 25 October 2026 · Recommended companion: [HOMEii Flow Engine 1.1.1](https://github.com/r11a/homeii-flow-engine/releases/tag/v1.1.1).

## Search reliability and responsiveness

- Remove the duplicate preview/library search request.
- Request up to ten provider results per type initially, avoiding extra Spotify search pages delaying the first results.
- Search only the relevant media type when searching inside a library category.
- Hebrew queries are preserved end to end. Hebrew and English provider results were verified on the local dashboard, including Spotify items outside the local library.
- Engine 1.1.1 stops caching empty provider responses for 30 seconds: MA may return an empty response at its soft timeout while its provider search continues in the background.

## Library controls and scrolling

- Make **Album artists only** visible as a labeled toggle in Library → Artists. The new screen dock previously hid the toolbar containing this control (#78).
- Add **Pin stations to player** in Library → Radio. The station selector opens expanded; if no stations have been marked as favorites, it offers radio-library stations instead. Choose up to five shortcuts for the player, saved per card/device. Compact tiles still omit these shortcuts.
- Use one main scrolling area for normal library list/grid views, avoiding nested scroll containers swallowing gestures or clipping content. Cover-flow views retain their own scrolling.

## Updating

Update **Engine to 1.1.1 first**, restart Home Assistant, then update the **card to 6.1.2** and refresh dashboard clients. Existing settings are retained. Keep exactly one HOMEii JavaScript resource. If you used a local test resource, switch back to the HACS-managed resource.

**Upgrading from 5.9.3 is a breaking migration:** version 6 requires the separate HOMEii Flow Engine integration. Back up Home Assistant and dashboard YAML, install and configure the Engine before replacing your old card, and follow the [installation/upgrade/rollback guide](docs/INSTALL_STEP_BY_STEP.md).

These fixes reduce unnecessary searches and avoid stale empty results. Spotify rate limits and MA provider availability can still delay external searches; this release does not bypass provider limits.
