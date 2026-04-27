# homeii-music-flow

Premium Home Assistant dashboard card for Music Assistant, focused on a polished mobile-first experience, a visual now-playing layout, a compact luxury mini-player, and a built-in visual editor.

For the exact local workflow and which file is the current source of truth, see:

- [LOCAL_DEPLOYMENT.md](./LOCAL_DEPLOYMENT.md)

## Status

`5.0.0` is the first stable public release of this repository.

The repository is now structured for:

- GitHub publishing
- HACS custom repository installation
- future HACS default-listing submission

The `4.8.8` to `4.9.9` cycle was dedicated to internal stabilization, refactoring, release tooling, and device/theme reliability without intentional UI redesigns.

## Features

- Mobile-first Music Assistant player card
- Compact premium mini-player tile
- Full visual card editor
- Pinned player support
- UI-controlled vs card-config-controlled settings
- Hebrew / English friendly UI
- Theme, layout, library, announcements, and playback controls

## Repository layout

```text
dist/homeii-music-flow.js   # HACS release file
src/homeii-music-flow.js    # working source snapshot
src/index.js                # bundler entry point
src/core/                   # extracted foundation helpers
src/config/                 # extracted config validators
tests/                      # stabilization tests
scripts/release.mjs         # versioned release sync
docs/qa-matrix.md           # device/theme regression matrix
package.json
hacs.json
README.md
LICENSE
.github/workflows/validate.yml
```

## HACS installation

1. Push this repository to GitHub as a public repository named `homeii-music-flow`.
2. In Home Assistant, open HACS.
3. Open the menu and choose `Custom repositories`.
4. Add your GitHub repository URL.
5. Choose repository type `Dashboard`.
6. Download the repository through HACS.
7. Add the resource if HACS does not add it automatically:

```text
/hacsfiles/homeii-music-flow/homeii-music-flow.js
```

8. Use the card with:

```yaml
type: custom:homeii-music-flow
```

## Manual installation

1. Copy `dist/homeii-music-flow.js` to your Home Assistant `www` directory.
2. Add this dashboard resource:

```text
/local/homeii-music-flow.js
```

3. Use the card with:

```yaml
type: custom:homeii-music-flow
```

## Versioning

Current packaged version: `5.0.0`

## Development workflow

Foundation tooling starts in `4.9.0`:

```text
npm install
npm run build
npm run lint
npm test
```

`npm run build` is intended to bundle `src/index.js` into `dist/homeii-music-flow.js` and then sync the versioned runtime snapshots automatically.

During the stabilization cycle, manual deployment is still supported with the same single runtime file:

`dist/homeii-music-flow.js`

## Release notes

See [CHANGELOG.md](./CHANGELOG.md) for the `5.0.0` release summary and the stabilization milestones that led into it.

## Publishing

See [PUBLISHING.md](./PUBLISHING.md) for the exact GitHub release and HACS publishing checklist.

## Notes for publishing

- HACS dashboard/plugin repositories need a `README.md` and `hacs.json` in the repository root.
- HACS expects a `.js` file that matches the repository name, either in the repository root or under `dist/`.
- GitHub releases are strongly recommended, and are required if you later want the repository included in the default HACS list.

## Sources

- [HACS plugin/dashboard requirements](https://www.hacs.xyz/docs/publish/plugin/)
- [HACS manifest and publishing basics](https://www.hacs.xyz/docs/publish/start/)
- [HACS validation GitHub Action](https://www.hacs.xyz/docs/publish/action/)
- [HACS default inclusion requirements](https://www.hacs.xyz/docs/publish/include/)
