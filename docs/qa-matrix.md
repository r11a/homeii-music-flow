# QA Matrix

This matrix is the release gate for the `4.9.x` stabilization cycle. Every release candidate from `4.8.8` onward should be checked against these scenarios before promoting the runtime file.

## Core Scenarios

| Scenario | What to verify |
| --- | --- |
| Mobile narrow | Hero, controls, progress, and volume stay aligned with no horizontal overflow. |
| Tablet landscape | Split hero remains balanced and media controls feel centered, not detached. |
| Tablet portrait | Rail, hero, and bottom spacing remain readable and stable. |
| Desktop wide | No stretched controls, broken gradients, or empty dead zones. |
| RTL | Titles, rails, queue, and sliders stay visually correct and input-safe. |
| Light theme | Contrast, text legibility, slider track visibility, and button outlines remain premium. |
| Dark theme | Hero hierarchy stays clear and background effects do not muddy the artwork. |
| Idle state | Empty state remains elegant with no broken art placeholders or stale metadata. |
| Playing state | Progress, play state, active buttons, and artwork update without visual jumps. |
| Long metadata | Long title / artist / album do not break layout or collide with action clusters. |
| Missing artwork | Fallback artwork, aura, and title layout remain stable. |
| Unavailable player | Card fails gracefully with usable status messaging and no JS crashes. |

## Interaction Pass

| Interaction | What to verify |
| --- | --- |
| Play / pause | State, icon, and pulse visuals update without double-render artifacts. |
| Previous / next | Controls react immediately and metadata/artwork stay in sync. |
| Progress seek | Drag, click, and release update the visual state correctly. |
| Volume slider | Thumb, fill, mute state, and percentage remain consistent across themes. |
| Theme toggle | No stale colors, unreadable text, or broken translucency after toggling. |
| Player switch | Selected player chip, metadata, and queue all switch together. |

## Release Rule

- `5.1.5` is blocked by any known `P0` or `P1` bug in the matrix above.
- Cosmetic `P3` issues may ship only if they are documented and non-regressive.
- Any regression found in one viewport/theme combination must be retested across the rest of the matrix after the fix lands.
