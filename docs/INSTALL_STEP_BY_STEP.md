# Install HOMEii Flow PUBLIC BETA 1 — beginner walkthrough

**This is a BETA, not a stable release. Participation is optional; 5.9.3 remains available for stable users.**

> [!CAUTION]
> **STOP: upgrading from 5.9.3 is a breaking change. Do not replace the card first.**
> Version 6 requires the separate HOMEii Flow Engine integration. Install, configure and verify Engine **1.0.0-beta.1** while keeping card **5.9.3** working. Only then replace the card with **6.0.0-beta.1**. A card-only update will not provide the supported v6 connection.

These instructions describe the prepared beta packages. If the releases are not visible or the Engine repository returns 404, do not substitute a random development ZIP: public access has not opened for you yet.

## 1. Understand the three components

- **Music Assistant (MA)** already manages your providers and speakers. It must work independently first.
- **HOMEii Flow Engine** is a Home Assistant custom integration installed under `custom_components`. It is not an HA add-on/app.
- **HOMEii Music Flow** is a JavaScript dashboard card installed under `www` and registered as a dashboard resource.

A Spotify API key, an HA access token and an MA access token are different credentials. The Engine needs an **MA access token**.

## 2. Before downloading

1. Sign in to HA with an administrator account.
2. Open native Music Assistant. Choose one speaker and confirm an ordinary track plays.
3. In HA → Settings → Devices & services, confirm the official **Music Assistant** integration is loaded. The Engine depends on it.
4. Check the [compatibility table](BETA_GUIDE.md#requirements-and-compatibility). The Engine requires MA API schema 63+. A version name alone is not proof that every optional feature is supported.
5. Locate your HA configuration directory: the directory containing `configuration.yaml`. This guide calls it `/config`; your file-sharing tool may show it simply as `config`.
6. Use your existing File editor, Studio Code Server, Samba share or container volume access. Do not change installation method just to follow a path example. HA Container users access the mapped configuration volume.

## 3. Back up — required for existing users

1. Create a Home Assistant backup using its backup controls and retain a copy you can restore.
2. Save the dashboard YAML/configuration containing the old card.
3. Open `/config/lovelace/resources` in your HA browser (append this path to your own HA address). Copy the existing HOMEii resource URL into a note.
4. Copy the old card file to a safe backup location outside the active resource path.
5. If an Engine is already installed, back up its complete component folder and HA backup/storage. Do not delete the existing integration entry merely to update files.
6. Record current versions. Keep native MA available as your fallback.

**Checkpoint:** you can name the old resource URL and locate both the old file and HA backup. If not, stop before replacing anything.

## 4. Download the matching Engine

1. Open [Engine releases](https://github.com/r11a/homeii-flow-engine/releases).
2. Select exactly **1.0.0-beta.1**, marked **Pre-release**.
3. Under Assets, download `homeii-flow-engine-1.0.0-beta.1.zip`.
4. Extract it on your computer. Inside it, locate `custom_components/homeii_flow`.
5. Copy the complete `homeii_flow` directory into HA's `/config/custom_components/`.
6. Create `custom_components` if it does not exist. If updating an existing Engine, replace the component files as one matching set; do not combine individual Python files from different versions.

The result must look like this:

```text
/config/
  configuration.yaml
  custom_components/
    homeii_flow/
      manifest.json
      __init__.py
      config_flow.py
      ...other files and subfolders...
```

**Wrong:** `/config/custom_components/homeii_flow/custom_components/homeii_flow/manifest.json` — this is an extra nested directory.

7. Restart Home Assistant, not just the browser. Wait for HA to return.
8. Existing Engine users: retain the integration entry and verify it loads with the new version. New users continue below.

## 5. Create the MA token and find its address

1. Open **Music Assistant itself**.
2. Open **Settings → Profile** and create a long-lived access token. Give it a recognizable name such as `HOMEii Flow Engine`.
3. Copy the token to a private place temporarily. Do not put it in dashboard YAML or a GitHub issue.
4. Find the direct MA server address reachable from HA. The usual port is **8095**, for example `http://192.168.1.100:8095`. Replace the example with your server's actual address/port.
5. Do not use the HA address ending in `:8123`, a dashboard URL, or an ingress path such as `/...music_assistant...`.
6. If you use containers or an app with different networking, use its actual HA-reachable MA endpoint. Do not invent an address from the example.

Token instructions are documented in the [official MA API guide](https://www.music-assistant.io/api/).

## 6. Complete Engine onboarding

1. HA → **Settings → Devices & services → Add integration**.
2. Search for **HOMEii Flow Engine** and open it.
3. Choose a connection method: **Sign in with a Music Assistant username and password** creates a dedicated token, or **Paste a Music Assistant API token** uses the token from step 5. Automatic sign-in requires MA built-in credentials, not an HA login. The password is not stored. The fields below describe the manual route.
4. Read the setup instructions at the top of the form.
4. Fill in:

| Field | What a normal single-instance installation should use |
|---|---|
| Name | Leave HOMEii Flow Engine, or choose a display name |
| Instance ID | Leave `default` |
| Default profile ID | Leave `default` |
| Music Assistant server URL | The direct MA address from step 5 |
| Music Assistant external HTTPS URL | Leave blank unless you have a real external MA API endpoint; an HA ingress URL is not valid |
| Music Assistant API token | Paste the MA token, not a Spotify key or HA token |


5. Select Submit. The form validates the connection before saving.
6. If an error appears, fix it using the troubleshooting table below. **Do not upgrade the card yet.**
7. When the integration is created, open its entry and confirm it loads without a setup error.

**Checkpoint:** Engine 1.0.0-beta.1 is installed and loaded, and native MA still plays on your test speaker. Only now continue.

## 7. Install or upgrade the card

Manual installation is the explicit beta path here; official HACS catalog inclusion is not required. If HACS already manages your old card, disable its automatic updates while deliberately testing a manual beta, so it cannot overwrite your chosen files.

1. Open [card releases](https://github.com/r11a/homeii-music-flow/releases).
2. Select **6.0.0-beta.1**, marked **Pre-release**.
3. Download the card package or the `homeii-music-flow.js`, `homeii-flow-logo-v2.png` and `homeii-flow-icon.png` assets. Use built release assets, not `src/homeii-music-flow.js`.
4. Create `/config/www/homeii-flow-beta/`.
5. Copy the built JS and image files there. If using the complete package, extract its contents into that folder, with the JS at its root.
6. Check this exact file exists: `/config/www/homeii-flow-beta/homeii-music-flow.js`.
7. In HA, open your profile and enable Advanced mode if the Resources controls are hidden. Open **Settings → Dashboards → Resources** (some versions put Resources in the three-dot menu), or navigate directly to `/config/lovelace/resources`.
8. **Existing users:** edit the existing HOMEii resource. **New users:** choose Add resource.
9. Enter this URL and resource type:

```text
URL: /local/homeii-flow-beta/homeii-music-flow.js?v=6.0.0-beta.1
Type: JavaScript module
```

`/local/` maps to HA's `/config/www/`. It is a browser URL, not a filesystem folder.

10. Save. **Do not keep two registered resources for old and new versions of this card.** Different dashboards still share the same frontend custom element registration; a second dashboard is not isolation from the resource change.
11. Fully reload the browser. Close/reopen the companion app if it still shows the old version. Clear its frontend cache only if ordinary reload does not work; menu names vary by device.

YAML-managed resource users should update their existing resource declaration instead of duplicating it through the UI. See [HA resource registration](https://developers.home-assistant.io/docs/frontend/custom-ui/registering-resources/).

## 8. Add or edit the card

1. Open your dashboard → Edit dashboard → Add card (or edit your existing card).
2. Select HOMEii Music Flow if listed, or use Manual with:

```yaml
type: custom:homeii-music-flow
homeii_engine_mode: required
```

3. For a normal single Engine, leave instance/profile overrides blank/default. Do not copy old browser-direct MA credentials into v6.
4. In the visual editor choose the interface and performance profile at the top. Use a reduced-performance profile on a weak tablet if needed.
5. Save and leave dashboard edit mode.
6. Open diagnostics and confirm the expected card/Engine versions and connection status.
7. Select one available player, start at low volume and test Play/Pause, seek on a track, volume, queue and search.

## 9. If something goes wrong

| Symptom | Check |
|---|---|
| Engine not in Add integration | Folder nesting, manifest location and full HA restart |
| Invalid API response | Direct MA URL/port; an HA/ingress login page is not the API |
| Token rejected | Generate/paste an MA Profile token; remove accidental surrounding whitespace |
| Unsupported version/schema | Update MA to a compatible API schema; do not bypass validation |
| Custom element does not exist | Resource URL/type, HTTP file availability and full reload |
| Already registered/custom element error | Remove duplicate old/new HOMEii resources and reload |
| Old interface/version remains | Confirm edited resource URL and version query; close stale tabs/cache |
| No players or playback fails | Verify official MA integration and native MA playback first |
| Optional action missing | Provider/player/server may not support it; unavailable capabilities are hidden |

Use the [tester guide](BETA_TESTING.md) for diagnostics and reporting. Never share tokens, cookies or backups.

## 10. Return to 5.9.3 if needed

1. Stop/remove any beta test schedules and timers you created. Replacing the card does not stop Engine automations.
2. Restore the saved old resource URL and old card file. Remove any duplicate beta resource entry.
3. Restore your saved dashboard configuration if you changed it incompatibly.
4. Fully reload all clients and verify 5.9.3 with native MA available.
5. If you also need to revert the integration/backend, use the matching backup. Do not delete HA `.storage` files manually.

A successful install on one device is not a guarantee for every speaker/browser. This beta is deliberately opt-in; keep a working rollback until you are satisfied.


