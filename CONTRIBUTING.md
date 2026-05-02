# Contributing To HOMEii Flow

Thank you for wanting to help improve HOMEii Flow.

HOMEii Flow is not meant to be just another Home Assistant card. The goal is to make Music Assistant feel like a polished, visual, app-like music experience inside Home Assistant, especially for wall tablets, phones, multi-room homes, and Hebrew/RTL users. Contributions are welcome when they protect that direction.

## Good Contributions

Good contributions usually do one of these things:

- Make the card easier and more reliable to use in a real home.
- Improve the touch experience on phones, tablets, and wall panels.
- Improve Music Assistant integration without adding setup friction.
- Improve RTL/Hebrew support and keep English support clean.
- Fix HACS packaging, Home Assistant dashboard picker behavior, or browser compatibility.
- Add focused tests around shared state, config defaults, media handling, or layout helpers.
- Improve documentation, screenshots, release notes, or install guidance.

## Before You Start

For larger UI, flow, or behavior changes, please open an issue first and describe:

- What user problem the change solves.
- Which screen or workflow is affected.
- How it should behave on phone, tablet, and desktop.
- Whether it changes configuration, defaults, HACS packaging, or Music Assistant calls.

Small fixes, documentation improvements, and clear bug fixes can go straight to a pull request.

## Project Setup

Clone the repository and install dependencies:

```bash
git clone https://github.com/r11a/homeii-music-flow.git
cd homeii-music-flow
npm install
```

Run the validation checks:

```bash
npm run check
```

Build the release package:

```bash
npm run build
```

## Main Files

- `src/homeii-music-flow.js` is the main card implementation.
- `src/core/` contains shared helpers for state, media, layout, theme, and validation.
- `src/sendspin-js/` contains the local browser player support.
- `tests/` contains Vitest coverage for shared logic.
- `dist/` is the HACS-ready release output.
- `hacs.json` tells HACS which JavaScript file to load.
- `README.md`, `CHANGELOG.md`, `PUBLISHING.md`, and `LOCAL_DEPLOYMENT.md` document install, release, and deployment behavior.

Most feature work should start in `src/`. Do not hand-edit generated release output in `dist/` unless the change is specifically about packaging and you understand the release flow.

## Development Rules

- Keep changes focused. Avoid unrelated refactors in the same pull request.
- Preserve existing variable names and local patterns unless there is a clear reason to change them.
- Prefer small, understandable helpers over broad rewrites.
- Do not add telemetry, tracking, analytics, or external network calls unrelated to Home Assistant or Music Assistant functionality.
- Do not include personal Home Assistant URLs, tokens, player IDs, screenshots with private data, or local credentials.
- Keep the card usable without a complicated setup path.
- Keep visual changes consistent with the premium, app-like HOMEii Flow style.

## UI And UX Guidelines

HOMEii Flow is designed for everyday touch use. When changing the interface:

- Prioritize clarity over feature density.
- Keep the current queue, player state, and selected action visible whenever possible.
- Avoid modals when an inline or drawer interaction is clearer.
- Make primary actions obvious and secondary actions quiet.
- Test long Hebrew labels, RTL alignment, and narrow phone layouts.
- Check that text does not overflow buttons, cards, headers, or bottom bars.
- Keep phone, tablet, desktop, and wall-panel use cases in mind.

## HACS And Release Package Requirements

HACS installs the package from `dist/`, so release safety matters.

Before a release-oriented pull request is merged, confirm:

- `npm run build` completes successfully.
- `dist/homeii-music-flow.js` exists.
- `dist/sendspin-js/` exists when the local browser player is enabled.
- `dist/vendor/embla-carousel.umd.js` exists when swipe browsing is enabled.
- `dist/homeii-flow-logo.svg` exists.
- `hacs.json` still points to `homeii-music-flow.js`.
- The card type remains:

```yaml
type: custom:homeii-music-flow
```

## Testing

Run:

```bash
npm run lint
npm run test
npm run build
```

For UI changes, also smoke test in Home Assistant:

- Add the resource through HACS or `/local/community/homeii-music-flow/homeii-music-flow.js`.
- Add the card from the dashboard picker when possible.
- Verify manual YAML still works.
- Test main player, compact player, FLOW, Studio, queue, library, actions, timers, settings, lyrics, history, and recommendations.
- Test phone, tablet, and desktop widths.
- Test dark and light themes.
- Test RTL/Hebrew text where relevant.

## Pull Request Checklist

Before opening a pull request:

- Explain what changed and why.
- Include screenshots or screen recordings for visible UI changes.
- Mention which Home Assistant and Music Assistant versions you tested with.
- Mention whether the change affects HACS install, `dist/`, config defaults, or card picker registration.
- Run `npm run check`.
- Run `npm run build` when runtime or package output changes.
- Update `README.md` or `CHANGELOG.md` when users need to know about the change.

## Bug Reports

Please include:

- HOMEii Flow version.
- Home Assistant version.
- Music Assistant version.
- Browser and device type.
- How the card was installed: HACS or manual.
- The card YAML configuration, with private values removed.
- Console errors from the browser developer tools, if available.
- Clear steps to reproduce the issue.

## Feature Requests

Please describe the real-life use case, not only the proposed button or setting.

Helpful details:

- Who is using it: phone user, wall tablet, guest, child, multi-room listener, etc.
- What they are trying to do.
- What currently feels confusing, slow, or missing.
- Why this belongs inside HOMEii Flow instead of Home Assistant core, Music Assistant, or another card.

## Release Ownership

Maintainers handle version bumps, tags, GitHub Releases, and final HACS release validation.

If your pull request changes release behavior, update the relevant documentation and call it out clearly in the PR.

## License

By contributing, you agree that your contribution is licensed under the MIT License used by this project.
