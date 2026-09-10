# Forum launch post — publish only after both beta downloads are public

Suggested category: Share your Projects. Post to the Home Assistant Community forum only; no Facebook publication is planned.

## Title
[PUBLIC BETA] HOMEii Flow 6 — Your music. Within reach.

## Post
> **PUBLIC BETA — not a stable release. Back up first. Install the Engine before upgrading 5.9.3.**

Hi everyone,

I’m opening the first opt-in beta of **HOMEii Music Flow 6.0**, together with **HOMEii Flow Engine 1.0**, and would love feedback from people using Music Assistant on real phones, tablets and speakers.

The focus is the listening experience: prominent artwork, artwork-driven colors, light/dark glass surfaces and contextual action wheels that keep common actions within reach. Browse your library, swipe through recommendations, manage the queue and choose the speaker without losing your place.

**Watch the one-minute preview:**
https://github.com/r11a/homeii-music-flow/blob/v6.0.0-beta.1/artifacts/HOMEii-Flow-Film-60s.mp4

The preview is an edited demonstration of the interface, including staged playback. It is not an uninterrupted recording or a performance guarantee.

### Need to go back?
Restore your saved 5.9.3 card file, resource URL and dashboard configuration, then reload all clients. Disable beta-created schedules/timers first; changing the card does not stop Engine automations. Use your HA backup if reverting backend state. The [beginner guide](https://github.com/r11a/homeii-music-flow/blob/v6.0.0-beta.1/docs/INSTALL_STEP_BY_STEP.md) includes the complete rollback steps.

### Two pieces, one experience
- **Music Flow 6.0.0-beta.1** is the dashboard card: contextual wheels, library/search, queue, responsive player controls and optional classic layout.
- **Flow Engine 1.0.0-beta.1** is the required HA custom integration: shared MA access/state, artwork, diagnostics, timers, schedules and supported automation features that can operate while the card is closed.

Optional features such as local-device Sendspin playback, synchronized lyrics and AI Radio depend on your MA installation, provider, browser and speakers. This is a community beta and hardware coverage is still growing.

### Important if you use 5.9.3
**This is a breaking upgrade. Do not update the card alone.** Back up HA and your dashboard, install/configure the matching Engine first, then install the beta card. Keep native MA available while testing. Stable users can stay on 5.9.3.

- Card: https://github.com/r11a/homeii-music-flow
- Required Engine: https://github.com/r11a/homeii-flow-engine
- Install and rollback: https://github.com/r11a/homeii-music-flow/blob/v6.0.0-beta.1/docs/BETA_GUIDE.md
- What to test: https://github.com/r11a/homeii-music-flow/blob/v6.0.0-beta.1/docs/BETA_TESTING.md
- Report a bug: https://github.com/r11a/homeii-music-flow/issues/new?template=beta_bug.yml

The versions will be marked **Pre-release, not Latest**. Please opt in deliberately; users with beta/custom update automations should review those settings.

I’m especially interested in scrolling/touch behavior, light/dark readability, queue updates, speaker groups, and the onboarding experience. Please include both component versions, HA/MA versions and your device/speaker details. Keep one reproducible bug per issue and never share tokens or backups.

Thanks for helping shape the beta. Feedback and practical suggestions are welcome here; linking bugs to an issue will help keep fixes and retests organized.

## Publisher checks

Before posting: confirm both releases are publicly downloadable, replace candidate-branch links with the published tag links, test the video link anonymously, and verify issue forms exist on each repository's default branch. Do not post while the Engine repo is private.


## German translation

Thank you to [Richard Treichl (@rtreichl)](https://github.com/rtreichl) for contributing German language support in [PR #89](https://github.com/r11a/homeii-music-flow/pull/89).


