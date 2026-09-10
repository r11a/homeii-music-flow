# HOMEii Music Flow — Beta Preview film

## Motion revision

- New deliverable: `HOMEii-Flow-Film-60s.mp4`, 60 seconds, 1920×1080, 30 fps output, H.264/AAC.
- Continuous 25 fps recordings of the production card components in an isolated local filming fixture, shown in phone and tablet frames. Backend playback is staged; this is not an uninterrupted recording of the live Home Assistant instance.
- Main recordings cover action-wheel drag, circular volume gestures, cover browsing/track changes and the queue artwork wheel. A visible touch marker demonstrates the single-pointer gesture; no actual human hand was filmed.
- Short group, recommendation, discovery and queue-reorder inserts use the previous live captures. These short inserts retain their original capture cadence. Lyrics uses a continuous recording of the real lyrics component with original demonstration text, titled Home in Motion / HOMEii Sessions.
- Camera push-ins, perspective movement, short transitions, artwork colors, light/dark variants and brief typographic cards replace the previous static editorial layout.
- New original restrained 120 BPM electronic score, without vocals or third-party music recordings.
- Sources: `.release/promo/studio.html`, `record-studio.mjs`, `render-ad.py`, and `motion/*.webm`.
- No live home configuration or playback changes were made during this revision. No repository publication or external deployment.

## Previous live cut

- Duration: 60 seconds. Full HD, 1920×1080, 24 fps, H.264 / AAC MP4.
- English typography, no narration; original synthesized ambient soundtrack.
- Current cut: `HOMEii-Music-Flow-Live-60s.mp4`, captured from the authenticated local installation at 192.168.1.171. The earlier `HOMEii-Music-Flow-60s.mp4` is a superseded isolated-preview draft.
- The card language was set to English. Both light and dark appearances were captured; the configured dark appearance was restored afterward.
- Only Kitchen and Center were used for playback/group operations. Their ungrouped state, unmuted state and volumes (46% / 68%) were verified afterward against Music Assistant. Center playback was advanced during filming; the queue drag demonstration moved Señorita ahead of The Hills.
- Editorial focus: rotating action wheel, Recommendations, Discover, queue artwork wheel, queue drag and drop, connect/disconnect, volume wheel, seek/track change, synchronized lyrics and Smart / Engine features.
- The film is edited from live UI image sequences; source capture cadence is lower than the 24 fps delivery timeline. It is not a continuous 60-second screen recording.
- Closing card identifies this as a Beta Preview, not a released stable product.
- Logo repair is a separate generated asset (`HOMEii-Flow-logo-padded.png`); it does not replace the installed card logo.
- Current live captures: `.release/promo/live/`; editable render source: `.release/promo/render-live.py`. The original synthesized score is `.release/promo/score.wav`.

This is a first promotional cut for review. It has not been published externally.
