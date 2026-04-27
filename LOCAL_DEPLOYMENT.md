# Local Deployment Guide

## Canonical Runtime

Use only this card type in Home Assistant:

`custom:homeii-music-flow`

Use only this runtime file in Home Assistant `www`:

`homeii-music-flow.js`

Use only this Lovelace resource pattern:

`/local/homeii-music-flow.js?v=5.0.0`

From now on, bump only the query version after `?v=`.
Do not change the file name again unless there is a hard cache emergency.

## Project Source Of Truth

Versioned source files live under `src/`.

Current working version:

`src/ma-browser-card-mobile-v5.0.0.js`

Current distribution build:

`dist/ma-browser-card-mobile-v5.0.0.js`

Stable deploy target:

`dist/homeii-music-flow.js`

`dist/homeii-music-flow.js` should always be a copy of the latest approved versioned build.

## Current 5.0.0 Mapping

- Edit: `src/ma-browser-card-mobile-v5.0.0.js`
- Review/share: `dist/ma-browser-card-mobile-v5.0.0.js`
- Deploy to HA `www`: `dist/homeii-music-flow.js`
- Lovelace type: `custom:homeii-music-flow`
- Lovelace resource: `/local/homeii-music-flow.js?v=5.0.0`

## Cache Reset Rule

If a new version is approved:

1. Create a new versioned source file under `src/`
2. Create the matching versioned file under `dist/`
3. Copy that approved `dist` file over `dist/homeii-music-flow.js`
4. Replace the HA `www/homeii-music-flow.js`
5. Update only the resource query version

Example:

`/local/homeii-music-flow.js?v=5.0.0`

## Foundation Note

Starting with `4.9.0`, release prep is expected to come from:

- `npm run build`
- `npm run release`
- `npm run lint`
- `npm test`

## Do Not Use

Do not use these as active runtime names anymore:

- `custom:ma-browser-card-mobile`
- `homeii-music-mobile-reset.js`
- `homeii-music-flow-clean.js`
- `homeii-music-flow-full-v5.0.0.js`
- old `homeii-music-mobile-v4.*.js`
- old `homeii-browser-card-v*.js`

Keep them only as history/reference.
