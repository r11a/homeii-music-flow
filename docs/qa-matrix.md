## QA105 follow-up — 2026-09-09

- Repeat/shuffle now call the existing handlers directly; legacy synthetic clicks no longer bubble into the outside-click listener. Verified in local browser: both operations leave the fan expanded. Confirmed states remain derived from player data.
- Library feedback no longer jumps or flashes: restrained accent outline and a slower glass loading indicator; busy accessibility state preserved.
- Group confirmation must survive 5.5 seconds of fresh membership observations, rejecting a fleeting optimistic group.
- 423 tests passed / 34 skipped; 50 files; lint and build passed.
- MA was upgraded/restarted by the user during the initial test. Do not attribute that disconnect to closing the group screen.
- Repeated direct MA test on 2.11.0b2: original Computer/Kitchen IDs (now named מרכז/מטבח) remained grouped and playing at every 5-second observation through 30 seconds. Removed only Kitchen test membership afterwards; Computer continued playing. Card acceptance also passed: apply via QA105, leave the group screen, then direct MA read still reports both playing and grouped. Reopening players shows group volume/count 2. Remaining upstream inconsistency: Kitchen reports `available:false` while `playback_state:playing` and `synced_to` references Computer; its tile is therefore hidden under the user’s unavailable-player rule. Do not fabricate availability.
- QA105 file copied over local SMB and verified SHA256: `6ef4bbb5c3219ac305a951f98f3902d765fa948c601b3f7de12d80f51fba16ef`. Resource activated and fresh browser DOM confirms `homeii-music-flow-qa105.js?v=6ef4bbb5`. QA104 preserved.

## QA104 — local installation, 2026-09-09

- Card resource verified in a fresh browser DOM: `/local/community/homeii-music-flow/homeii-music-flow-qa104.js?v=f3c832ae`.
- SHA256: `f3c832aef1093bf5ea01fa7ac0833d27f4d2c65319af55174daf8d7dd4a50731`.
- 28 Engine files copied and verified through `\\192.168.1.171\config`; HA integration UI shows version `1.0.0-beta.1`, 1 device and 41 entities after restart.
- HA configuration check succeeded before restart. File transfer was local SMB; UI activation/restart used the existing authenticated external HA URL because local port 8123 was unreachable.
- Backup: `.homeii-backups/qa104-20260909-000546`, including prior Engine, QA103 card and Engine storage.
- Automated: card 422 passed / 34 skipped; Engine 65 passed; lint/build passed.
- Browser preview: 390px card stays within its container; fan reveal animation verified by computed style; light-mode fan resolves to rgba(250,251,252,.86) with blur(48px), final opacity 1. Search/library targets 44×44.
- Group persistence FAILED: initial group UI briefly showed Computer + Kitchen, but the user reported disappearance. A direct MA `players/cmd/set_members` test with only those two players showed Kitchen idle/ungrouped at 5, 10, 15 and 20 seconds. Do not consider grouping fixed. No global Stop All test.
- Missing 88FM logo: exact Radio Browser station UUID `29b28a1a-e60d-4b1a-b57d-e7d46b95f36c` returned an empty favicon in the upstream public directory. Do not claim every MA-library radio logo is fixed.

# QA Matrix

## QA103 card-only installation — 2026-09-08

- Installed the locally tested `6.0.0-beta.1` card as `/homeassistant/www/community/homeii-music-flow/homeii-music-flow-qa103.js` through File editor. Previous QA102 and main files remain unchanged for rollback.
- Updated the existing HA JavaScript resource to `/local/community/homeii-music-flow/homeii-music-flow-qa103.js?v=96871c6d`; resource UI and the script element in a freshly opened dashboard both confirmed this URL.
- Local SHA256: `96871c6d28a04594b8b7a88d423bac4cafd524c756a24ab6e9c703d6980e8fd1`. Remote file listing showed 3801.1 KiB. Direct external checksum fetch returned HTTP 403, so byte-for-byte remote hash verification was not completed.
- Fresh dashboard rendered artwork, track metadata, progress and volume 51%, with working Engine data. No playback changes were commanded. This is installation/startup verification, not full acceptance testing.
- Engine remains at its installed version (0.7.21); no HA restart, repository upload or release. Local Engine changes remain undeployed.
- Initial terminal reconnect was blocked by automatic approval review because Return could execute unknown pending input. No terminal command was executed; installation used the File editor UI instead. The earlier uploaded `/homeassistant/homeii-card-qa103.zip` is staging only.
- Rollback resource: `/local/community/homeii-music-flow/homeii-music-flow-qa102.js?v=f8ddc902`.


## QA102 live installation — 2026-09-08

- Uploaded `.release/homeii-qa102.zip` and verified archive SHA256 `b2194acb0e3249499e5ba47897c7602f4e440c03dd3ed7a692507d8fe30ee574` plus every file hash before installation; compiled all Python sources before replacing files.
- Installed 27 files: Engine 0.7.21 and `homeii-music-flow-qa102.js`. Full Engine and existing card backups: `/homeassistant/.homeii-backups/qa102-20260908-165026` (also accessible through `/config`).
- Actual prior resource observed at installation was `/local/community/homeii-music-flow/homeii-music-flow.js?v=600-drawer-518cf215`, superseding the older QA101 assumption. The main file was preserved.
- Updated the existing resource through HA UI to `/local/community/homeii-music-flow/homeii-music-flow-qa102.js?v=f8ddc902`; no duplicate resource added.
- `ha core check` completed successfully. `ha core restart` dispatched at approximately 16:54. HA returned; the QA102 resource remained saved and a fresh dashboard tab rendered Computer, its 46% volume, current track artwork, waveform, history and dynamic background. No playback or volume mutations were performed. This confirms installation/startup, not the full release acceptance matrix.

## 6.0.0 local candidate — 2026-09-08, German and issue fixes

- Card: lint passed; 390 tests passed, 34 skipped across 49 files. The former legacy Stop-only stream test now runs against the Engine contract and covers both player control views.
- Engine 0.7.21: 52 tests and repository validator passed; library pagination includes a 691-item fixture and offset cache isolation.
- German PR #89 integrated locally, all dictionary keys/placeholders checked, explicit and automatic regional locale selection tested.
- Builds from the working installation and isolated lockfile installation match: `F8DDC902F74AC6A06FA5D7CE6CBE06935EADD1339612601874A85C058B8333CB`.
- Clean npm installation used Windows system CA trust (`NODE_USE_SYSTEM_CA=1`); TLS verification stayed enabled.
- This is local verification only. QA101 remains installed. Live grouping persistence, device-specific behavior, upgrade/rollback and the remaining release matrix are not certified by these checks.
- Additional focused editor test passed: partial form changes preserve `entity` through the emitted config, JSON serialization, card reload and editor reopening. This did not reproduce issue #69 and does not certify live dashboard navigation.
- Candidate archive: `.release/homeii-qa102.zip`, 27 files, SHA256 `b2194acb0e3249499e5ba47897c7602f4e440c03dd3ed7a692507d8fe30ee574`. Includes card QA102 and Engine 0.7.21, with per-file hashes. No files were installed during the subsequent terminal attempt: the terminal reported “Press ⏎ to Reconnect” and File editor navigation failed.

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

## 6.0.0 QA090 — 2026-09-08

- Deployed card SHA256: 25CE6990F15E2CEC60E6BA35DC94840517A6C4CFD730C3D3FF7F31973321F259; HA resource query updated to 600qa090. Engine 0.7.19 deployed and restarted earlier in this pass.
- Immersive is the default; explicitly saved classic selection remains supported.
- Queue icons visible in live HA. Pointer drag moved a future Computer queue item and restored the original relative order, without changing volume or issuing playback commands.
- Group empty change bubble hidden; live group grid and footer have no horizontal overflow at tested viewport. Announcements, timers and lyrics use shared surface styles.
- AI DJ host list loads four configured hosts through Engine. No DJ activation, announcement or timer was executed in this pass.
- Lint/build passed. Full suite: 346 passed, 35 skipped, one legacy default assumption failed; after making that classic-only fixture explicit, affected suites passed (93 passed, 28 skipped). Previous full run before default change: 347 passed, 35 skipped. Engine: 50 tests and validator passed.
- Physical phone haptics, mobile touch and the full viewport/theme release matrix remain unverified. Fan gives rotational drag feedback and changes pages on release; it is not a continuous ring of all actions.

## 6.0.0 QA092 — 2026-09-08

- Replaced fan page-only gestures with continuous arc positioning of persistent action buttons. Drag verified live: visible queue/lyrics/favorite/player/timer actions moved to favorite/player/timer/transfer/group. Added capability-gated AI Radio routing. Pointer click suppression and movement before release covered by tests.
- Shared blurred artwork pseudo-layer and theme-specific contrast veil across menus/dialogs, queue actions, lyrics, history, control room and small popups. All-actions icons 29px and titles 16px.
- Lyrics action opens the full lyrics sheet; centered title/text, fullscreen sizing and safe-area padding. Automatic screensaver now blocked while lyrics or fan are open. Live full lyrics shell and artwork background inspected; physical iPhone safe-area remains unverified.
- Queue grip gets its own 36px grid track in phone/tablet layouts; adjacent artwork retains its own track.
- Lint/build passed; immersive tests 12 passed, queue drag 2 passed, lyrics MA 4 passed. Live viewport override did not resize the main tab (786x791); do not count as physical phone or responsive visual verification.
- Deployed SHA256 42F63E42BBDD00BEA6516442A1C09C51FD2B37E14923DEB3CE504EFE92B37ABC, resource QA092. No playback or volume mutations in this pass.

## 6.0.0 QA093 — touch capture fix

- A bubbling lostpointercapture from the touched child button cancelled the fan gesture when capture transferred to the fan. Ignore child capture loss and acquire capture only once after the drag threshold.
- Regression test simulates button capture loss between two pointer moves, checks continued motion and prevents accidental action dispatch. Immersive suite: 13 passed; build passed.
- Deployed SHA256 80C6784035CCA31752B5FA82DEB5F76881F594F3067355535FC23F0793B2FE0B. Physical phone touch remains a user-device verification.

## 6.0.0 QA094 — local device foreground and continuous fan navigation

- This-device action selects an already connected local player immediately with the existing manual selection path and closes menus. Initial connection refreshes Engine players until the local player is available, then selects it; failures do not claim selection. Added this-device action to the fan.
- Fan arrows rotate the same persistent wheel by one action instead of replacing pages. Touch capture fix retained.
- 19 tests passed (fan and Sendspin); build passed. SHA256 54C91D66E32BE1518D313BF57CF04987CCA997569F277B8A5ED74086B1F4ECBF. HA resource QA094 verified. Physical touch and first-connection foreground flow require live-device verification.

## 6.0.0 QA095 — visible glass backgrounds

- Shared dark artwork veil reduced from .78 to .40; light veil .60. Artwork blur 44px, saturation 1.08. Artwork layer explicitly above surface background and below content; redundant header scrims removed. Targeted text shadows preserve label separation.
- Library category backgrounds prefer current playback artwork rather than replacing it with the first item. Detail pages retain their own artwork.
- Live visual checks after content load: playlists, artists, albums, tracks, radio, podcasts; search empty state; album detail with tracks; all-actions screen. Background visible in each. This is not a claim that every nested screen/theme/device combination was exercised.
- Lint/build passed. HA resource QA095 verified; SHA256 2BB19743CFD944ED71B3CBEAB21189A3B86915102F0FA52505A23147326922A4.

## 6.0.0 QA096 — queue, contextual navigation and media actions

- Deployed through authenticated HA UI with backup and checksum validation. Card SHA256: 86909BD3F33990160E93919180E62B0AB9C90691EF697B412E145A50CBF43A9C. Resource QA096 verified. HA configuration check and restart succeeded; Engine 0.7.20 verified in integrations UI.
- Queue snapshots no longer reconcile authoritative Engine metadata with stale HA attributes. Empty queues clear their items. Visible queue updates are coalesced and deferred during dragging.
- Shared mobile bottom dock and contextual wheel added to menus, media/queue actions, lyrics and history. Queue entries and timer durations use the existing action handlers. This does not establish coverage of every legacy overlay.
- Media action sheet adds shuffle, library save, details and capability-gated editable playlist selection. Playlist writes require an explicit destination and prevent duplicate submission. No live playlist was modified during verification.
- Group confirmation now explicitly refreshes Engine players; an Engine error cannot replay the mutation through the HA fallback. Computer/Kitchen live attempts have not yet demonstrated persistent membership. Group save remains an open release issue.
- Full card suite before the group adjustment: 361 passed, 35 skipped (48 files, maxWorkers=2). After group adjustment: affected suites 87 passed, 28 skipped. Lint/build passed. Engine: 51 tests and validator passed.
- Local media action layout inspected in a 390px iframe; timer layout inspected separately. Physical phone gestures, haptics, safe areas and full release matrix remain unverified. External HA websocket connections dropped repeatedly during live verification.

## Post-QA096 — contextual wheel presentation cleanup (local build)

- Hide duplicate lyrics controls, timer presets and header back button only at widths where the shared dock is visible. Preserve source handlers for wheel dispatch, filters and status information. Remove duplicate queue/group shortcuts from the players action hub.
- Main immersive overlay close button has a transparent background. Other confirmation dialogs retain their controls.
- Phone player selection uses a single column, stronger selection outline, larger player names/artwork and up to two lines for track titles, with consistent RTL alignment.
- Lint and seven existing dock/lyrics tests passed; production build passed. Player list inspected in a 390px preview iframe. This build is not yet deployed; LAN deployment endpoint remained unreachable. Group persistence is still unresolved.

### QA097 deployment

- Installed after explicit user request through HA File editor, alongside the previous bundle: `/local/community/homeii-music-flow/homeii-music-flow-qa097.js?v=75b4d75c`.
- Public served file SHA256 matches local build: `75B4D75C440D3A5CF2CAD12F7610B59C19F29201C2CFB55E9119D12D64FBE665`. Existing resource updated and verified in HA UI. Previous QA096 file retained for rollback. No Engine change, HA restart or player mutation.

## QA098 — contextual actions and fullscreen presentation

- All-actions inside a screen wheel expands that screen's action list and reuses its dispatch, rather than opening the global menu. Bottom back dismisses the list first. Player wheels offer transfer, grouping, this device and the existing player settings section. Queue item action sheets use their own actions rather than the entire queue wheel.
- Library toolbar controls moved into its wheel; player summary/duplicate action toolbar hidden at mobile-dock widths, with search and sorting retained. Media actions fill the card and include a library-return control.
- Corrected the actual E2E corner controls to minimal minimize/maximize glyphs with transparent backgrounds and retained 44px touch targets. Main artwork fallback now uses the existing brand logo, with its previously hidden display explicitly restored and contained aspect ratio.
- Lint/build passed; 24 affected tests passed. Local 390px visual checks: media action screen, its contextual all-actions list, and logo fallback. Physical phone safe-area and every nested screen remain unverified.
- Deployed `/local/community/homeii-music-flow/homeii-music-flow-qa098.js?v=d8cb79d3`; resource verified in HA UI. Served/local SHA256 match: `D8CB79D35BBCC7B4C033EAC8FB619E7D7236B35887F3C92250EDF09C0E55A82D`. QA097 retained. No playback mutations or HA restart. Group persistence remains a separate unresolved release issue.

## QA099 — bounded screens and persistent cover browsing

- Removed the seven-second cover-browse reset. The selected preview persists until an explicit playback/player/queue-anchor change. Fake-timer regression verifies no automatic jump after ten seconds; this does not establish live MA playback acknowledgement latency.
- Shared docks and duplicate-control suppression now apply at all viewport widths. Sheets have a bounded flex layout with separate content scrolling and navigation, while all-actions overlays are anchored to the sheet viewport. Group footer remains in the content flow. Media-action scrim/surface opacity reduced.
- Corrected inherited two-column artwork grid and 320px artwork maximum. At 1440x900, player, artwork shell and center cover all measure center x=720 (previously cover x=668.1).
- Browser iframe measurements: group 1024x600 action footer ends at y=495.8 before dock y=510.4; players all-actions 320x400 fits y=8.8–325.2 above dock; media actions 390x844 content ends at y=777.2 where navigation begins. A keyboard End attempt did not scroll the test content and is not counted as an actual scroll interaction test. No physical phone or exhaustive theme/device release claim.
- Lint/build and 21 affected tests passed. Served QA099 SHA256 matches local: `79F4B1EB4090B589176A1FB32AB543A52462773D4B00BA2273FA9210F4EC6787`. Group persistence remains unresolved; no live player mutations in this pass.

## QA101 — semantic wheels, direct player selection and tablet presentation

- QA099 and QA100 were uploaded for verification but never activated. QA101 includes their layout/browse fixes and all subsequent wheel changes.
- Context wheels preserve the original action SVG instead of using a repeated generic fallback. Font/offset/duration controls retain meaningful values. Added dedicated group add/remove, schedule and refresh symbols; all-actions uses the same renderer.
- Player wheels include available rendered player choices with circular current artwork (speaker fallback when absent), selected outline, stable entity identity and the existing selection handler. No new playback command is introduced by selection.
- Main wheel now routes announcements directly. Discovery wheel is limited to named genres using the existing category filter; provider selection remains on the page.
- Tablet source badges are hidden above artwork; cover cap increased to 560px while bounded by available width/height. Restored the existing tablet history handle and gave it a blurred glass surface. E2E expand/contract arrows are 22px within a 44px control in the main bottom dock.
- Lint/build passed and 25 focused tests passed. Local browser player wheel verified with Computer/Kitchen choices and selected ring; fixture players have no artwork and correctly use speaker fallbacks. Previous QA099 viewport measurements cover layout fixes, not physical hardware or exhaustive responsive certification.
- Installed resource verified in HA UI: `/local/community/homeii-music-flow/homeii-music-flow-qa101.js?v=4cbed749`. Local/served SHA256: `4CBED749CF2BAFD504271A5D50ABD6AD93F46EC7275771C6BEC06B42D5523E0F`. Dashboard card loaded and E2E control appeared within dock. File chooser suffered a prolonged browser-control stall; final server hash was verified before activation.
- QA098 retained for rollback. No HA restart, Engine update or live audio/group mutation in this pass. Group persistence and full release matrix remain unresolved; no claim that all prior release work is complete.

## 2026-09-08 — availability recovery and release preparation (local build)

- Unavailable players are omitted from player choices, transfer targets and group choices without deleting group membership from state. Choices return on the next available snapshot. Open context/main wheels and all-actions panels reconcile availability; wheel movement defers reconciliation until pointer release and retains the central action when possible.
- Main-wheel availability uses the shared player predicate, including explicit available=false. Action identities no longer shift merely because an earlier source button becomes disabled.
- Group confirmation now requires a fresh Engine read started after the mutation; rejected/stale reads cannot confirm cached membership. Ordinary catalog refresh still preserves the last good player list. Group methods extracted behind existing card wrappers into core/media/speaker-groups.js.
- Corrected default screensaver delay handling for null override. Added package-lock, build/version guards and CI/release gating. Engine pyproject version aligned with manifest 0.7.20 and repository validator checks parity.
- Final local lint/build passed. Full regression: 48 files, **375 passed / 35 existing skipped**, 34.85 seconds. Engine baseline: 51 unittest tests passed; repository validator passed after version-parity check was added.
- Local bundle SHA256: `0B1E9E0BF7F53E02FDE28AF6F1A1D81E1FE578D71C76C5A148266ACD7D076F1E`. **Not deployed**; live remains QA101.
- Live grouping comparison only touched Computer/Kitchen: both card-created and native-MA-created groups initially displayed two members and later reverted to separate players. Last native MA view showed Computer alone and Kitchen unchecked. No playback or volume commands were sent. Root cause and durable grouping remain open; freshness fix is not evidence that delayed group loss is solved.
- Isolated npm ci verification did not complete: offline cache miss, then npm internal exit-handler failure online. CI itself has not run. These remain release gates, not successful clean-install evidence.
- Current release checklist and limitations: [RELEASE_READINESS_6.0.0_HE.md](RELEASE_READINESS_6.0.0_HE.md). No tag, push, public release or claim of complete release readiness.


## Post-QA105 — regression and native LinkPlay investigation (2026-09-09, local)

- Media action feedback now reuses the shelf three-dot glass animation. Pending commands cannot be dispatched twice; failures leave the action screen open; controls restore their previous disabled state. Both success/failure regressions pass.
- Playlist detail no longer first sends the invalid `provider_instance_or_domain` argument. The valid `provider_instance_id_or_domain` path remains; this removes one guaranteed failed attempt observed in MA logs.
- Group disconnect uses the reachable leader's MA set_members command. A follower that withdraws its AirPlay endpoint no longer receives an ignored unjoin. Both master-removal runtime tests now exercise the Engine contract; legacy fallback failure tests remain.
- Group volume opens its dedicated view, deduplicates member targets, awaits all writes and reports partial failures by player name. It does not declare all members updated when one fails.
- Native LinkPlay live repeat: Computer/Kitchen initially idle and ungrouped. Six samples over 30 seconds showed Kitchen synced to Computer and playing, but available=false. During this period the native HA LinkPlay Kitchen entity reported playing and source=Follower, yet its group_members was empty. This is conflicting availability/group metadata, not evidence that all native group controls work. No fabricated availability override added.
- Temporary group removed through leader; test-started playback stopped and test-created queue cleared. No other players targeted. Native audio audibility, follower volume, reopening the group UI and longer soak remain release gates.
- Full initial run: 425 passed, 2 failed, 34 skipped. The failures were two old HA-unjoin test contracts. After adapting these to Engine dispatch and adding group-volume coverage, affected suites passed: 103 passed, 27 skipped. The 49 other suites passed in the initial run. Engine: 65 passed. Lint and production build passed (release packaging succeeded on retry after a transient file-open failure).
- New source/bundle is local, not installed or published. QA105 remains the activated HA resource. UI polish is not yet visually accepted on this new build.

### 5.9.3 reported-regression release gates

| Area | Required acceptance before marking resolved |
|---|---|
| Queue (#68/#79, large queues #84) | 691 items with correct order/current item; remote changes and empty queue reflected; player switch/transfer never mixes queue identities; drag under latency and disconnect. |
| Artwork/radio (#65) | Same station updates track artwork; missing/proxy/broken image fallback; late old image cannot overwrite new track; favorites consistent across screens. |
| Player selection (#69/#75/#77) | Editor-save-reload preserves chosen player; unavailable players disappear and return; correct stop/pause capability; reported DLNA hardware reproduction still required. |
| Search/library (#83/#85/#87/#88) | Cold provider response/error is distinct from empty; late results cannot replace a new search; full pagination and album/playlist order preserved. |
| Transport/performance | One mutation per gesture; no retry of uncertain writes on a second transport; bounded/coalesced reads; fresh state after reconnect; no unhandled partial group-volume failure. |
| UI | Phone/tablet/desktop, light/dark, E2E, small card, all-action sheets: no hidden essential controls, stale feedback, clipped navigation or visible unwanted scrollbars. |

Automated passes are not substitutions for provider/hardware-specific live acceptance. Existing report statuses must not be closed from architectural changes alone.


### QA106 activation

- Activated the existing HA resource through the authenticated Resources UI: `/local/community/homeii-music-flow/homeii-music-flow-qa106.js?v=7bfcd690`. No duplicate resource added. QA105 file retained for rollback.
- SHA256: `7BFCD69093BAA922B27C469FF3457ADB739CBCF4342D00B64F9AA07AB495CEA2`. Engine unchanged; no HA restart needed. Native LinkPlay availability remains unresolved.


## Native LinkPlay root cause and correction — 2026-09-09

- Reproduced automatic member removal in official MA UI and in direct MA commands. Exact MA 2.11.0b2 `players/controller.py` removes memberships when a player becomes unavailable; this was not established as another browser sending a removal.
- Existing DLNA provider was disabled. Native generic LinkPlay follower loses AirPlay availability while grouped; without another available protocol MA marked it unavailable and removed it. Enabled the existing DLNA provider in official MA settings.
- After correction, six direct MA samples over 30 seconds showed Kitchen available=true, playing, and synced to Computer, with reciprocal leader members. AirPlay was unavailable but DLNA remained available. Direct test group was removed normally.
- Created the same two-player group through QA106 card. MA confirmed it; card displayed both playing. Kitchen mute=true then mute=false were independently verified through MA. Exiting the group screen did not remove membership. No other player was targeted; existing Computer queue and volume were preserved.
- Removed experimental Engine native_linkplay fallback entirely after diagnosing the configuration cause. Restored pre-experiment runtime, removed helper/tests, and passed all 65 Engine tests. Restored runtime installed through local SMB with hash verification; normal HA restart requested.
- Post-restart acceptance passed: HA reconnected; group remained present on reopening; group-volume shortcut opened its dedicated slider. Card Kitchen mute=true/false and volume 20 -> 19 -> 20 were verified independently in MA, without experimental fallback. Group remains connected for user listening. Longer soak and audible synchronization remain (cannot be inferred from API state).

### Generic LinkPlay troubleshooting

For Up2Stream/Rakoit generic LinkPlay devices with MA 2.11.0b2, check Settings > Providers > DLNA if grouping immediately disappears. Ensure DLNA discovers the same physical devices and stays available while AirPlay enters follower mode. Native grouping is still LinkPlay; DLNA supplies an available protocol/control route. Do not create duplicate players or fake availability. Verify other hardware and MA versions separately.


## Customizable wheels and Smart screens — 2026-09-09, local candidate

- One action catalogue now powers the wheel and its complete screen. Per-card browser preferences hide shortcuts only, preserve complete available actions, and support explicit Save/Cancel, checkbox selection, drag handles and keyboard reorder. Preferences remain when capabilities temporarily disappear. Main and contextual wheels share this component; player picker and player screen share player shortcut preferences.
- Main player chip opens a players-only wheel (available players, artwork/icon/name), with a separate Players screen button. Selected state outlines the symbol only. Replaced wand graphic with an orbital Flow mark.
- Recommendations is a full page of MA `music/recommendations` folders. Loading/error/empty are distinct; late responses do not overwrite another screen.
- Smart hub links announcements, timers/wake-up, schedules, listening stats, lighting, system screensaver and shared night preferences. Screensaver and lighting forms use existing Engine commands; night preferences add validated profile-scoped `interface/get`, `interface/set` and HA `set_interface_preferences`, stored in the existing Engine store and returned in context. Display night mode does not change music volume.
- Group volume view reuses group/member controls, retains disconnected members for reconnection within the same leader session, and applies membership changes through the existing group path. No group operation was tested on physical devices in this candidate yet.
- Optional `volume_wheel` editor toggle opens a rotary-style control with wheel/touch/keyboard and mute, using existing volume commands.
- Engine lighting status includes last applied timestamp and media title. A backend-only test verifies different track colors without any browser, plus existing stale-track/disable/conflict tests. Live card shows a configured light named מזנון, but selected player was idle. Physical background-follow verification remains outstanding.
- Visual local checks: full catalogue and editor, light phone and dark wide layout, available-only player wheel. Not a complete device matrix. Local HA ports 445 and 8095 were unreachable in the final check; this candidate is NOT installed. QA106 remains the installed version.

Validation: 435 card tests passed, 34 pre-existing skipped; affected suites rechecked after final fixes. Engine: 68 tests passed. ESLint and production build passed. New candidate remains local, not deployed or published.


### QA107 external installation — 2026-09-09
- Installed card and Engine via authorized external HA File editor/Terminal. All 30 file hashes verified; Python sources compiled before replacement.
- Backup: `/homeassistant/.homeii-backups/qa107-20260909-114033`; previous QA106 card retained.
- HA core check passed, restart completed, resource QA107 active. Live all-actions editor entry, Smart hub, and Engine-backed night-preferences capability verified.
- Physical lighting and group playback not retested during installation. Other dashboard resources emit unrelated loading/duplicate-element errors.


### QA108 — installed externally, 2026-09-09
- Rotary volume follows angular pointer movement including the +/-pi seam. Default enabled; wheel/keyboard controls retained. Regression test added.
- MA 2.11 recommendations require `music/recommendations/items` per folder. Added bounded concurrent hydration shared with history recommendations; live shelves now populate. Source: https://github.com/music-assistant/server/blob/2.11.0b2/music_assistant/controllers/music/recommendations/controller.py
- Missing waveform analysis retries after 10 seconds; never fabricates bins. MA returns null until analysis exists.
- Immersive resize within the same layout no longer rebuilds the card; Studio forced refresh does not replace identical HTML. Physical tablet flicker still needs device verification.
- Smart forms, RTL, group-volume floating rectangle and fan themes (adaptive default/dark/light) updated. Editor hides identified classic-only controls and immersive-only fields for the opposite design. Full cross-screen RTL audit remains incomplete.
- Lyrics default is 140% for unset preferences; existing saved preferences retained. Karaoke toggle is visibly selected and its wheel remains open; active-line treatment is clearer. Word timing still requires Enhanced LRC, not synthetic timing.
- Full suite: 437 passed / 34 skipped. Subsequent affected suites: 102 passed / 27 skipped. Lint/build passed.
- Live QA108 hash 5bdf3179a9a1624df2dd4f49c5d5138cc4f99ac908cace2d3231b4af5c913bdd; QA107 retained. Engine unchanged from QA107. Physical group controls, startup waveform completion and karaoke playback are not yet acceptance-tested.


## QA110 — 2026-09-09: library latency and shared UI

- Card: first paginated library request is 60 items; existing Load more remains. Non-pagination backends retain previous limits.
- Fresh larger library cache entries serve smaller reads while preserving sort/favorite boundaries.
- Artist albums stop successful fallback chains; no unconditional 2,000-album scan. Artist playlist recommendations enrich the same cached detail asynchronously with navigation/cache guards.
- Engine: six first-page shelves warm with concurrency capped at two, rather than large sequential collections; persistent cache retained.
- Shared immersive headings, tabs, action/chip buttons and fields normalized. Phone recommendations classified as fullscreen; shelf widths use card dimensions.
- Artist/album specificity conflicts corrected; album mobile areas stack, track rows share one scroll flow, scrollbars hidden without disabling scrolling.
- Validation: lint/build passed, card 439 passed / 34 skipped; Engine 69 passed. New tests cover nonblocking artist content, cache isolation and slow-shelf warm-up concurrency.
- Local visual review used demo data: album/artist, library tabs, recommendations, players, group/transfer, queue, schedules, announcements, settings, diagnostics, discovery, search, smart tools and light/dark representative layouts. It is not proof of every live provider result, every nested editor or physical phone/tablet gesture. Studio/lyrics/history fixture navigation needs a separate isolated verification; not counted as fully verified.
- Install: QA110 card plus Engine runtime only, SHA-256 verified; previous runtime backed up. HA configuration check passed. Live restart verification recorded separately.
