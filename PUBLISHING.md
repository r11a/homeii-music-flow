# Publishing Checklist

## 1. Prepare the GitHub repository

- Create or use a public GitHub repository named `homeii-music-flow`.
- Push the full repository contents, including:
  - `README.md`
  - `LICENSE`
  - `hacs.json`
  - `dist/homeii-music-flow.js`
  - `.github/workflows/validate.yml`

## 2. Create the 5.0.0 release

- Create a Git tag named `v5.0.0`.
- Create a GitHub release from that tag.
- Title the release `5.0.0`.
- Use the `5.0.0` section from `CHANGELOG.md` as the release notes.
- Attach `dist/homeii-music-flow.js` if you want a direct downloadable runtime artifact.

## 3. Verify repository files after publishing

- Confirm `hacs.json` still points to `homeii-music-flow.js`.
- Confirm the repository root contains `homeii-music-flow.js`.
- Confirm `dist/homeii-music-flow.js` matches the released runtime.
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

If you need a manual fallback release path, copy:

`dist/homeii-music-flow.js`

to Home Assistant `www` and load:

`/local/homeii-music-flow.js?v=5.0.0`
