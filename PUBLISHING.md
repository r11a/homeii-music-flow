# Publishing Checklist

## 1. Prepare the GitHub repository

- Create or use a public GitHub repository named `homeii-music-flow`.
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

## 2. Create the 5.0.0 release

- Create a Git tag named `v5.0.0`.
- Create a GitHub release from that tag.
- Title the release `5.0.0`.
- Use the `5.0.0` section from `CHANGELOG.md` as the release notes.
- If you attach a release artifact, zip the contents of `dist/`; do not publish only a single JS file while the local Sendspin player and Embla swipe support are enabled.

## 3. Verify repository files after publishing

- Confirm `hacs.json` still points to `homeii-music-flow.js`.
- Confirm `dist/homeii-music-flow.js` matches the released runtime.
- Confirm `dist/sendspin-js/` exists for the local Sendspin browser player.
- Confirm `dist/vendor/embla-carousel.umd.js` exists for mobile swipe support.
- Confirm `dist/homeii-flow-logo.svg` and `docs/brand/homeii-flow-logo.svg` exist.
- Confirm the HACS validation workflow is enabled on GitHub.

## 4. Add the repository to HACS as a custom repository

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

`/local/community/homeii-music-flow/homeii-music-flow.js?v=5.0.0`
