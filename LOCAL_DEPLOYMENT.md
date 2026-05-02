# Local Deployment Guide

## Canonical Runtime

Use only this card type in Home Assistant:

`custom:homeii-music-flow`

Use only this runtime package folder in Home Assistant `www`:

`/config/www/community/homeii-music-flow/`

Use only this Lovelace resource pattern:

`/local/community/homeii-music-flow/homeii-music-flow.js?v=5.1.1`

From now on, bump only the query version after `?v=`.
Do not change the file name again unless there is a hard cache emergency.

## Project Source Of Truth

Main source file:

`src/homeii-music-flow.js`

Stable deploy target:

`dist/`

`dist/` should always be the latest approved install package.

## Current 5.1.1 Mapping

- Edit: `src/homeii-music-flow.js`
- Review/share: `dist/`
- Deploy to HA `www`: copy the full contents of `dist/` into `www/community/homeii-music-flow/`
- Package includes: `homeii-music-flow.js`, `sendspin-js/`, `vendor/embla-carousel.umd.js`, `homeii-flow-logo.svg`
- Lovelace type: `custom:homeii-music-flow`
- Lovelace resource: `/local/community/homeii-music-flow/homeii-music-flow.js?v=5.1.1`

## Cache Reset Rule

If a new version is approved:

1. Run the build/release script
2. Replace the contents of `www/community/homeii-music-flow/` with the contents of `dist/`
3. Update only the resource query version

Example:

`/local/community/homeii-music-flow/homeii-music-flow.js?v=5.1.1`

## Foundation Note

Starting with `4.9.0`, release prep is expected to come from:

- `npm run build`
- `npm run release`
- `npm run lint`
- `npm test`

## Do Not Keep In The Repo

Old runtime snapshots and backup copies should live in Git history or GitHub Releases, not in the active repository.
