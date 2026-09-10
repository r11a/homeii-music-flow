# QA121 local follow-up

Target: 192.168.1.171:8123 only. No external installation or repository publication.

- Installed resource: `/local/community/homeii-music-flow/homeii-music-flow-qa121.js?v=62c85c11`.
- SHA256: `62C85C11FAB243BC868CBEE1A077DB562EAAC14391AC16E9841DCAC5ACE5C8E3`. The SMB file and HTTP response match. Home Assistant resource URL was verified after saving.
- Prevent automatic screensaver activation while the player-selection fan is visible. A hidden fan does not suppress the screensaver.
- Full current card suite: 461 passed, 34 existing skipped tests, 59 passing files. Lint and production build passed.
- Live Engine playlist check: saved current queue as `QA local persistence` (100 items), left the view, reopened it and loaded the saved list. Deleted only that temporary list with the confirmation flow. Playback was not invoked or replaced.
- QA120 Engine installation remains active; this follow-up requires no Engine restart.
- Live group percentage check: opening the group's percentage control displayed the group wheel at 64%, matching the rounded mean of Center 81% and Kitchen 46%. Closed it without changing volume, mute or membership.

## Follow-up observation

A final read-only MA query showed Kitchen synced to Center again, at 46%/81%, both unmuted. Earlier QA120 recorded a successful disconnect. Asked whether the user reconnected them; do not attribute this to a defect or claim the group remains disconnected without resolving that distinction. No automatic disconnect was performed in response to this observation.

Resolved: the user confirmed reconnecting the players manually and subsequently disconnecting them. This observation is not an unexpected regrouping defect.

## QA122 volume overlay correction

- User identified the wheel rendering underneath the still-open group screen. The earlier accessibility-tree/geometry checks did not catch pointer occlusion.
- Root cause: edge-to-edge menu uses z-index 2147482602; the sibling wheel used 121. The wheel now uses 2147483203 to remain above fullscreen menu layers.
- Verified actual pointer hit testing for both individual and group wheels above the group screen at 320/390/768/1440px, with and without edge-to-edge. Close buttons also receive clicks, and the wheel remains inside the viewport. Screenshot inspected for the 390px edge-to-edge case.
- Lint/build passed. Installed local resource: `/local/community/homeii-music-flow/homeii-music-flow-qa122.js?v=4eb40f37`.
- SHA256: `4EB40F37234E329E89F0D6E402A9627D19D63CE525398F1B652AC49D5820F1D5`.

## Release status

This is a local acceptance build, not a declaration of public beta readiness. The hardware/CarPlay, legacy skipped-test coverage and architecture limitations recorded in QA120 remain explicit. The skipped tests include legacy direct-MA/HA fallback expectations; they have not been silently removed or counted as passing.
