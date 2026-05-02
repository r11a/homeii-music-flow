# Publishing Checklist

## 1. Prepare the GitHub repository

- Create or use a public GitHub repository named `homeii-music-flow`.
- Confirm the GitHub repository has a short description and relevant topics such as `home-assistant`, `hacs`, `lovelace`, `music-assistant`, `sendspin`, and `dashboard-card`.
- Push the full repository contents, including:
  - `README.md`
  - `LICENSE`
  - `hacs.json`
  - `dist/homeii-music-flow.js`
  - `dist/sendspin-js/`
  - `dist/vendor/embla-carousel.umd.js`
  - `dist/homeii-flow-logo.svg`
  - `docs/brand/homeii-flow-logo.svg`
  - `src/sendspin-js/`
  - `vendor/embla-carousel.umd.js`
  - `.github/workflows/validate.yml`
- Confirm the README renders:
  - the HOMEii Flow logo
  - the preview GIF
  - the screenshot tables
  - the HACS My Home Assistant button
  - the HACS download/install button

## 2. Create the 5.1.2 release

- Create a Git tag named `v5.1.2`.
- Create a GitHub release from that tag.
- Title the release `5.1.2`.
- Use the `5.1.2` section from `CHANGELOG.md` as the release notes.
- If you attach a release artifact, zip the contents of `dist/`; do not publish only a single JS file while the local Sendspin player and Embla swipe support are enabled.

## 3. Verify repository files after publishing

- Confirm `hacs.json` still points to `homeii-music-flow.js`.
- Confirm `dist/homeii-music-flow.js` matches the released runtime.
- Confirm `dist/sendspin-js/` exists for the local Sendspin browser player.
- Confirm `dist/vendor/embla-carousel.umd.js` exists for mobile swipe support.
- Confirm `dist/homeii-flow-logo.svg` and `docs/brand/homeii-flow-logo.svg` exist.
- Confirm the HACS validation workflow is enabled on GitHub.
- Confirm the README requirements section still matches the current release.
- Confirm the README Sendspin section explains `ma_url`, `ma_token`, local network preference, and the `This device` flow.

## 4. Add the repository to HACS as a custom repository

- Quick link:

`https://my.home-assistant.io/redirect/hacs_repository/?owner=r11a&repository=homeii-music-flow&category=plugin`

- Open Home Assistant.
- Open HACS.
- Open the menu and choose `Custom repositories`.
- Add the GitHub repository URL.
- Choose repository type `Dashboard`.
- Download the repository through HACS.

## 5. Verify the installed resource

If HACS does not add the resource automatically, add:

`/hacsfiles/homeii-music-flow/homeii-music-flow.js`

Then use the card with:

```yaml
type: custom:homeii-music-flow
```

## 6. Manual fallback

If you need a manual fallback release path, copy the full contents of:

`dist/`

to:

`/config/www/community/homeii-music-flow/`

Then load:

`/local/community/homeii-music-flow/homeii-music-flow.js?v=5.1.2`

## 7. Final pre-release smoke test

- Load the card after a hard browser refresh.
- Verify main player, compact player, FLOW, Studio, queue, library, actions, settings, lyrics, announcements, history, recommendations, and night mode screens.
- Verify `This device` creates a HOMEii Sendspin browser player and does not select an unrelated browser player.
- Verify phone, tablet, and desktop layouts.
- Verify light and dark themes.
- Verify HACS install path and manual install path.
