// menus styles. Order is preserved by card-styles.js.
export default function() {
  return `.menu-body.sheet-schedules .settings-shell > .settings-group,
        .menu-body.sheet-schedules .settings-shell > .scheduled-start-card {
          align-self:start;
        }
        .menu-body.sheet-actions .menu-item {
          min-height:112px;
        }
        .menu-backdrop.search-open .menu-sheet {
          height:calc(100% - 8px);
          max-height:calc(100% - 8px);
          margin-top:0;
        }
        .card.layout-tablet .menu-sheet {
          width:min(calc(100% - 72px), 920px);
          max-width:min(calc(100% - 72px), 920px);
          max-height:calc(100% - 18px);
          height:calc(100% - 18px);
          margin-inline:auto;
          border-radius:28px;
          box-shadow:0 30px 70px rgba(0,0,0,.3);
        }
        .card.layout-tablet .menu-sheet.sheet-library,
        .card.layout-tablet .menu-sheet.sheet-search {
          width:min(calc(100% - 72px), 1120px);
          max-width:min(calc(100% - 72px), 1120px);
        }
        .card.layout-tablet .menu-sheet.sheet-actions,
        .card.layout-tablet .menu-sheet.sheet-simple,
        .card.layout-tablet .menu-sheet.sheet-schedules,
        .card.layout-tablet .menu-sheet.sheet-transfer,
        .card.layout-tablet .menu-sheet.sheet-announcements,
        .card.layout-tablet .menu-sheet.sheet-settings {
          width:min(calc(100% - 120px), 760px);
          max-width:min(calc(100% - 120px), 760px);
        }
        .card.layout-tablet .menu-sheet.sheet-players,
        .card.layout-tablet .menu-sheet.sheet-group {
          width:min(calc(100% - 100px), 900px);
          max-width:min(calc(100% - 100px), 900px);
        }
        .card.layout-tablet .menu-sheet.sheet-media-detail {
          width:min(calc(100% - 120px), 860px);
          max-width:min(calc(100% - 120px), 860px);
          height:min(820px, calc(100% - 46px));
          max-height:calc(100% - 46px);
          align-self:center;
        }
        .card.layout-tablet .menu-sheet.sheet-artist-detail {
          width:min(calc(100% - 72px), 1120px);
          max-width:min(calc(100% - 72px), 1120px);
        }
        .card.layout-tablet .menu-sheet.sheet-queue {
          width:min(calc(100% - 120px), 840px);
          max-width:min(calc(100% - 120px), 840px);
        }
        .card.layout-tablet .menu-sheet.confirm-sheet,
        .card.layout-tablet .menu-sheet.smart-voice-sheet {
          width:min(620px, calc(100% - 80px));
          max-width:min(620px, calc(100% - 80px));
          height:auto;
          max-height:min(760px, calc(100% - 48px));
          align-self:center;
          margin-inline:auto;
        }
        .menu-head { position:relative; display:grid; grid-template-columns:52px minmax(0,1fr) 52px; gap:10px; align-items:center; padding:18px 16px 14px; border-bottom:1px solid rgba(255,255,255,.08); }
        .card.layout-tablet .menu-head {
          grid-template-columns:48px minmax(0,1fr) 48px;
          gap:12px;
          padding:12px 14px 10px;
        }
        .menu-head button { width:44px; height:44px; border-radius:16px; font-size:22px; }
        .card.layout-tablet .menu-head button {
          width:42px;
          height:42px;
          border-radius:14px;
        }
        .card.layout-tablet .menu-backdrop {
          justify-content:center;
          align-items:stretch;
          padding:14px 18px;
        }
        .card.layout-tablet .players-premium-grid {
          direction:ltr;
          grid-template-columns:repeat(2,minmax(0,1fr));
          gap:16px;
        }
        .card.layout-tablet.rtl .players-premium-grid {
          direction:rtl;
        }
        .card.layout-tablet .player-menu-card {
          min-height:144px;
          padding:18px;
          gap:14px;
          border-radius:24px;
          background:rgba(255,255,255,.10);
          border:1px solid rgba(255,255,255,.16);
          backdrop-filter:blur(24px);
          -webkit-backdrop-filter:blur(24px);
          box-shadow:0 24px 48px rgba(0,0,0,.16), inset 0 1px 0 rgba(255,255,255,.12);
          text-align:start;
        }
        .card.layout-tablet.rtl .player-menu-card {
          direction:rtl;
          text-align:right;
        }
        .card.layout-tablet .player-premium-head {
          display:grid;
          grid-template-columns:64px minmax(0,1fr);
          gap:14px;
          align-items:center;
        }
        .card.layout-tablet.rtl .player-premium-head {
          grid-template-columns:minmax(0,1fr) 64px;
        }
        .card.layout-tablet .player-premium-art {
          width:58px;
          height:58px;
          border-radius:18px;
          overflow:hidden;
          background:rgba(255,255,255,.08);
        }
        .card.layout-tablet .player-premium-text {
          min-width:0;
        }
        .card.layout-tablet .player-premium-sub {
          margin-top:4px;
          opacity:.8;
        }
        .card.layout-tablet .player-volume-row {
          display:grid;
          grid-template-columns:44px minmax(0,1fr);
          gap:12px;
          align-items:center;
          padding-top:4px;
        }
        .card.layout-tablet.rtl .player-volume-row {
          grid-template-columns:minmax(0,1fr) 44px;
        }
        .card.layout-tablet .queue-list {
          width:min(100%, 780px);
          margin-inline:auto;
        }
        .card.layout-tablet .queue-row {
          min-height:78px;
          padding-inline:16px;
        }
        .card.layout-tablet #activePlayersBubble {
          display:none !important;
        }
        .card.layout-tablet .player-focus {
          min-height:122px;
          padding:16px 14px;
          border-radius:28px;
          display:grid;
          gap:10px;
          justify-items:center;
          background:rgba(255,255,255,.12);
          border:1px solid rgba(255,255,255,.18);
          backdrop-filter:blur(28px);
          -webkit-backdrop-filter:blur(28px);
          box-shadow:0 22px 40px rgba(0,0,0,.12), inset 0 1px 0 rgba(255,255,255,.12);
        }
        .card.empty-media .mobile-art-shell {
          width:min(174px, 38vw);
          padding:0;
          border-radius:999px;
          background:transparent;
          border:none;
          box-shadow:none;
          backdrop-filter:none;
          -webkit-backdrop-filter:none;
        }
        .card.empty-media .art-stack-view,
        .card.empty-media .art-stack-viewport,
        .card.empty-media .art-stack-container {
          height:170px;
          min-height:170px;
          max-height:170px;
        }
        .card.empty-media .center {
          gap:18px;
        }
        .card.empty-media .art-stage {
          min-height:0;
          display:grid;
          place-items:center;
        }
        .card.empty-media .hero-copy {
          margin-top:12px;
          gap:12px;
        }
        .card.empty-media .mobile-art-actions:not(.empty-quick-actions),
        .card.empty-media #mobileArtActions:not(.empty-quick-actions) {
          display:none !important;
        }
        .card.empty-media .mobile-art-actions.empty-quick-actions,
        .card.empty-media #mobileArtActions.empty-quick-actions {
          display:flex !important;
          justify-content:center;
          margin-top:0;
        }
        .card.empty-media .hero-title {
          max-width:min(900px, 100%);
          margin-inline:auto;
          font-size:clamp(28px, 4vw, 56px);
          line-height:1.06;
          letter-spacing:-.04em;
        }
        .card.empty-media .hero-sub {
          max-width:min(620px, 100%);
          margin-inline:auto;
          font-size:clamp(13px, 1.45vw, 17px);
          line-height:1.5;
          color:rgba(236,241,248,.76);
        }
        .card.empty-media .bottom {
          gap:22px;
        }
        .card.empty-media .progress-line {
          display:none;
        }
        .card.layout-tablet.empty-media .hero-split-shell {
          grid-template-columns:minmax(220px, 320px) minmax(0, 1fr) !important;
          align-items:center;
          justify-items:center;
          gap:clamp(46px, 5cqi, 92px);
          padding-left:clamp(42px, 4.4cqi, 84px);
        }
        .card.layout-tablet.empty-media .hero-visual {
          display:grid !important;
          justify-self:start;
          width:min(286px, 28vw);
          min-width:220px;
        }
        .card.layout-tablet.empty-media .art-stage {
          display:grid !important;
          place-items:center;
          width:100%;
          min-height:0;
          padding:0;
        }
        .card.layout-tablet.empty-media .mobile-art-shell {
          display:grid !important;
          place-items:center;
          width:168px;
          height:168px;
          padding:0;
          border-radius:999px;
          background:transparent;
          border:none;
          box-shadow:none;
          overflow:visible;
        }
        .card.layout-tablet.empty-media .empty-magic-stack.has-voice {
          padding-inline-end:clamp(52px, 4.2cqi, 70px);
        }
        .card.layout-tablet.empty-media .empty-voice-btn {
          inset-inline-end:0;
          inset-block-end:50%;
          transform:translate(72%, 50%);
        }
        .card.layout-tablet.empty-media .empty-voice-btn.pressed,
        .card.layout-tablet.empty-media .empty-voice-btn.busy {
          transform:translate(72%, 50%) scale(.94);
        }
        .card.layout-tablet.empty-media .art-stack-view {
          display:grid !important;
          place-items:center;
          width:168px;
          min-height:168px;
          background:transparent;
          border:none;
          box-shadow:none;
          overflow:visible;
        }
        .card.layout-tablet.empty-media .art-stack-viewport,
        .card.layout-tablet.empty-media .art-stack-container {
          display:contents !important;
          min-height:0 !important;
        }
        .card.layout-tablet.empty-media .hero-info {
          max-width:min(820px, 100%);
          align-items:center;
          text-align:center;
        }
        .card.layout-tablet.empty-media .empty-quick-shelf {
          width:min(1040px, max(var(--empty-quick-two-card-min), calc(100% - clamp(320px, 24cqi, 440px))));
          margin-left:clamp(300px, 22cqi, 420px);
          margin-right:auto;
          padding-inline:max(var(--empty-quick-edge-fade), calc(50% - 452px));
          scroll-padding-inline:max(var(--empty-quick-edge-fade), calc(50% - 452px));
        }
        .card.layout-tablet.empty-media .empty-quick-card {
          scroll-snap-align:start;
        }
        .card.radio-media .empty-quick-shelf {
          display:none !important;
        }
        .card.radio-media.empty-media .mobile-art-shell {
          width:min(840px, 100%);
          padding:14px 14px 10px;
          border-radius:42px;
        }
        .card.radio-media.empty-media .art-stack-view {
          height:clamp(246px, 26cqi, 356px);
          min-height:clamp(246px, 26cqi, 356px);
          max-height:clamp(246px, 26cqi, 356px);
          display:grid;
          place-items:center;
        }
        .card.layout-tablet.radio-media.empty-media .mobile-art-shell {
          width:min(520px, 56cqi);
          height:min(520px, 56cqi);
          border-radius:var(--ma-radius-xl);
        }
        .card.layout-tablet.radio-media.empty-media .art-stack-view,
        .card.layout-tablet.radio-media.empty-media .art-stack-viewport,
        .card.layout-tablet.radio-media.empty-media .art-stack-container {
          width:100%;
          height:100%;
          min-height:100%;
          max-height:100%;
          display:grid !important;
          place-items:center;
        }
        .radio-stage {
          position:relative;
          width:min(100%, 760px);
          min-height:clamp(230px, 24cqi, 330px);
          display:grid;
          place-items:center;
        }
        .radio-stage-card {
          position:absolute;
          inset-block-start:50%;
          transform:translateY(-50%);
          border-radius:36px;
          background:rgba(255,255,255,.28);
          border:1px solid rgba(255,255,255,.22);
          backdrop-filter:blur(18px);
          -webkit-backdrop-filter:blur(18px);
          box-shadow:0 18px 34px rgba(0,0,0,.10);
        }
        .radio-stage-card-main {
          width:min(360px, 44vw);
          aspect-ratio:1/1;
          z-index:2;
        }
        .radio-stage-card-side {
          width:min(248px, 28vw);
          aspect-ratio:1/1;
          inset-inline-start:12%;
          opacity:.42;
          filter:saturate(.82);
        }
        .radio-stage-card-side-end {
          inset-inline-start:auto;
          inset-inline-end:12%;
        }
        .radio-stage-fab {
          position:relative;
          z-index:3;
          width:152px;
          height:152px;
          border:none;
          border-radius:999px;
          display:grid;
          place-items:center;
          color:#fff8df;
          background:linear-gradient(180deg, rgba(66,63,55,.72), rgba(114,106,84,.52));
          box-shadow:0 26px 46px rgba(0,0,0,.18), 0 0 30px color-mix(in srgb, var(--ma-accent) 18%, transparent);
          cursor:pointer;
        }
        .radio-stage-fab .ui-ic {
          width:42px;
          height:42px;
        }
        .theme-light .radio-stage-card {
          background:rgba(255,255,255,.34);
          border-color:rgba(141,155,177,.18);
          box-shadow:0 18px 34px rgba(111,126,150,.12);
        }
        .theme-light .radio-stage-fab {
          color:#fffaf0;
          background:linear-gradient(180deg, rgba(112,106,85,.68), rgba(157,145,106,.48));
          box-shadow:0 22px 38px rgba(111,126,150,.14), 0 0 26px color-mix(in srgb, var(--ma-accent) 16%, transparent);
        }
        .card.layout-tablet .player-focus-name {
          font-size:13px;
          font-weight:900;
          text-align:center;
          line-height:1.3;
        }
        .card.layout-tablet .player-focus-art-wrap {
          width:60px;
          height:60px;
          display:grid;
          place-items:center;
        }
        .card.layout-tablet .player-focus-art {
          width:60px;
          height:60px;
          border-radius:999px;
          overflow:hidden;
          background-size:cover;
          background-position:center;
          box-shadow:0 12px 28px rgba(0,0,0,.18);
        }
        .card.layout-tablet .player-focus.playing .player-focus-art {
          animation:playerFocusPulse 3s ease-in-out infinite;
        }
        @keyframes playerFocusPulse {
          0%,100% { transform:scale(1); box-shadow:0 12px 28px rgba(0,0,0,.18); }
          50% { transform:scale(1.04); box-shadow:0 18px 32px rgba(245,166,35,.22); }
        }
        .card:not(.layout-tablet) .side-btn,
        .card:not(.layout-tablet) .side-btn.minor-btn,
        .card:not(.layout-tablet) .volume-btn {
          border-radius:999px;
        }
        .card:not(.layout-tablet) .mobile-volume-inline {
          grid-template-columns:auto minmax(0,1fr) auto auto;
          gap:10px;
          align-items:center;
        }
        .card:not(.layout-tablet) .mobile-volume-inline.has-volume-step-buttons {
          grid-template-columns:auto auto minmax(0,1fr) auto auto auto;
          gap:8px;
        }
        .card:not(.layout-tablet) .mobile-volume-inline .volume-value {
          order:3;
          min-width:46px;
          text-align:center;
        }
        .card:not(.layout-tablet) .mobile-volume-inline .tablet-volume-track {
          order:2;
        }
        .card:not(.layout-tablet) .mobile-volume-inline .volume-btn {
          order:1;
          width:42px;
          height:42px;
          border-radius:999px;
        }
        .card:not(.layout-tablet) .mobile-volume-inline.has-volume-step-buttons .volume-value {
          order:1;
        }
        .card:not(.layout-tablet) .mobile-volume-inline.has-volume-step-buttons .volume-step-minus {
          order:2;
        }
        .card:not(.layout-tablet) .mobile-volume-inline.has-volume-step-buttons .tablet-volume-track {
          order:3;
        }
        .card:not(.layout-tablet) .mobile-volume-inline.has-volume-step-buttons .volume-step-plus {
          order:4;
        }
        .card:not(.layout-tablet) .mobile-volume-inline.has-volume-step-buttons .volume-btn {
          order:5;
        }
        .card:not(.layout-tablet) .mobile-volume-inline .volume-btn.active {
          background:rgba(255,69,58,.24);
          border-color:rgba(255,69,58,.34);
          box-shadow:0 12px 22px rgba(255,69,58,.12), inset 0 1px 0 rgba(255,255,255,.16);
          color:#ff6c63;
        }
        .mobile-art-actions {
          inset-inline:auto 18px;
          inset-block-end:18px;
          display:flex;
          gap:10px;
          padding:0;
          background:transparent;
          border:none;
          box-shadow:none;
          backdrop-filter:none;
          -webkit-backdrop-filter:none;
        }
        .card.layout-tablet .mobile-art-actions {
          inset-inline:auto 20px;
          inset-block-end:18px;
        }
        .mobile-art-fab {
          width:46px;
          min-width:46px;
          height:46px;
          border-radius:999px;
          background:rgba(14,18,28,.34);
          border:1px solid rgba(255,255,255,.16);
          box-shadow:0 12px 24px rgba(0,0,0,.14), inset 0 1px 0 rgba(255,255,255,.08);
        }
        .card.layout-tablet .mobile-art-fab {
          width:44px;
          min-width:44px;
          height:44px;
        }
        .art-stack-fallback {
          background:radial-gradient(circle at 50% 35%, color-mix(in srgb, var(--ma-accent) 26%, rgba(255,255,255,.08)), transparent 55%);
        }
        .art-stack-fallback .fallback-disc {
          box-shadow:0 0 0 1px rgba(255,255,255,.08), 0 22px 48px color-mix(in srgb, var(--ma-accent) 18%, transparent);
        }
        .surprise-me-card {
          position:relative;
          width:100%;
          height:100%;
          border:none;
          border-radius:28px;
          overflow:hidden;
          display:grid;
          place-items:center;
          background:linear-gradient(180deg, rgba(255,255,255,.10), rgba(255,255,255,.04));
          color:#fff;
          font:inherit;
          cursor:pointer;
          box-shadow:0 26px 54px rgba(0,0,0,.18), inset 0 1px 0 rgba(255,255,255,.14);
        }
        .surprise-me-card.compact {
          border-radius:16px;
          box-shadow:0 12px 24px rgba(0,0,0,.12), inset 0 1px 0 rgba(255,255,255,.08);
        }
        .empty-magic-stack {
          position:relative;
          display:grid;
          place-items:center;
          width:max-content;
          max-width:100%;
          margin:auto;
          overflow:visible;
        }
        .surprise-me-card.magic-empty {
          width:168px;
          height:168px;
          border-radius:999px;
          background:
            radial-gradient(circle at 50% 20%, rgba(255,255,255,.18), transparent 26%),
            radial-gradient(circle at 18% 18%, color-mix(in srgb, var(--ma-accent) 48%, transparent), transparent 34%),
            linear-gradient(180deg, rgba(255,255,255,.12), rgba(255,255,255,.04));
          border:1px solid rgba(255,255,255,.12);
          box-shadow:0 26px 46px rgba(0,0,0,.18), inset 0 1px 0 rgba(255,255,255,.14);
          transition:transform .16s ease, box-shadow .18s ease, border-color .18s ease;
          animation:magic-empty-pulse 4.8s ease-in-out infinite;
        }
        .surprise-me-card.magic-empty::before {
          content:"";
          position:absolute;
          inset:-10px;
          border-radius:inherit;
          border:1px solid color-mix(in srgb, var(--ma-accent) 26%, transparent);
          box-shadow:0 0 0 8px color-mix(in srgb, var(--ma-accent) 7%, transparent);
          opacity:.38;
          animation:magic-empty-halo 4.8s ease-in-out infinite;
          pointer-events:none;
        }
        .surprise-me-card.magic-empty.has-art {
          width:min(360px, 44cqi);
          height:min(360px, 44cqi);
          max-width:100%;
          max-height:100%;
          border-radius:var(--ma-radius-xl);
          background:#11151d;
          animation:none;
        }
        .surprise-me-card.magic-empty.has-art::before {
          display:none;
        }
        .surprise-me-card.magic-empty.has-art img {
          position:absolute;
          inset:0;
          width:100%;
          height:100%;
          object-fit:cover;
        }
        .surprise-me-card.magic-empty.has-art .art-overlay {
          position:absolute;
          inset:auto 14px 14px auto;
          width:52px;
          height:52px;
          border-radius:999px;
          background:rgba(0,0,0,.34);
          border:1px solid rgba(255,255,255,.16);
          backdrop-filter:blur(18px);
          -webkit-backdrop-filter:blur(18px);
        }
        .surprise-me-card.magic-empty.has-art .art-overlay .ui-ic {
          width:24px;
          height:24px;
        }
        .surprise-me-glow {
          position:absolute;
          inset:0;
          background:
            radial-gradient(circle at 18% 18%, color-mix(in srgb, var(--ma-accent) 34%, transparent), transparent 32%),
            radial-gradient(circle at 82% 20%, rgba(255,255,255,.12), transparent 26%),
            radial-gradient(circle at 50% 72%, color-mix(in srgb, var(--ma-accent) 20%, transparent), transparent 34%);
          opacity:.95;
        }
        .surprise-me-label {
          position:relative;
          z-index:1;
          padding:14px 22px;
          border-radius:999px;
          background:rgba(255,255,255,.14);
          border:1px solid rgba(255,255,255,.18);
          backdrop-filter:blur(18px);
          -webkit-backdrop-filter:blur(18px);
          font-size:clamp(18px,2.1vw,26px);
          font-weight:900;
        }
        .surprise-me-card.compact .surprise-me-label {
          padding:8px 12px;
          font-size:clamp(12px, 1.4vw, 16px);
        }
        .surprise-me-wand {
          position:relative;
          z-index:1;
          width:100%;
          height:100%;
          display:grid;
          place-items:center;
          border-radius:inherit;
          background:transparent;
          border:none;
          box-shadow:none;
          color:#fff6d8;
        }
        .surprise-me-wand .ui-ic {
          width:60px;
          height:60px;
          filter:drop-shadow(0 0 10px color-mix(in srgb, var(--ma-accent) 34%, transparent));
        }
        .surprise-me-card.compact .surprise-me-wand .ui-ic {
          width:44px;
          height:44px;
        }
        .empty-voice-btn {
          position:absolute;
          inset-inline-end:-8px;
          inset-block-end:-8px;
          z-index:4;
          width:46px;
          height:46px;
          border-radius:999px;
          border:1px solid color-mix(in srgb, var(--ma-accent) 28%, rgba(255,255,255,.16));
          background:linear-gradient(180deg, rgba(255,255,255,.16), rgba(255,255,255,.07));
          color:#fff7df;
          display:grid;
          place-items:center;
          cursor:pointer;
          box-shadow:0 14px 28px rgba(0,0,0,.24), 0 0 0 5px rgba(255,255,255,.045), inset 0 1px 0 rgba(255,255,255,.14);
          backdrop-filter:blur(16px) saturate(130%);
          -webkit-backdrop-filter:blur(16px) saturate(130%);
          transition:transform .16s ease, border-color .18s ease, background .18s ease, box-shadow .18s ease, color .18s ease;
        }
        .empty-voice-btn .ui-ic {
          width:20px;
          height:20px;
        }
        .empty-voice-btn:hover,
        .empty-voice-btn.listening,
        .empty-voice-btn.pressed,
        .empty-voice-btn.busy {
          color:#fff;
          border-color:color-mix(in srgb, var(--ma-accent) 54%, rgba(255,255,255,.18));
          background:linear-gradient(180deg, color-mix(in srgb, var(--ma-accent) 28%, rgba(255,255,255,.14)), rgba(255,255,255,.07));
          box-shadow:0 16px 32px color-mix(in srgb, var(--ma-accent) 20%, rgba(0,0,0,.22)), 0 0 0 7px color-mix(in srgb, var(--ma-accent) 10%, transparent), inset 0 1px 0 rgba(255,255,255,.16);
        }
        .empty-voice-btn.pressed,
        .empty-voice-btn.busy {
          transform:scale(.94);
        }
        .empty-voice-btn.busy {
          cursor:progress;
        }
        .empty-voice-btn.listening::after {
          content:"";
          position:absolute;
          inset:-8px;
          border-radius:inherit;
          border:1px solid color-mix(in srgb, var(--ma-accent) 44%, transparent);
          animation:voiceAssistantListenPulse 1.1s ease-out infinite;
        }
        .empty-voice-btn.busy:not(.listening)::after {
          content:"";
          position:absolute;
          inset:-6px;
          border-radius:inherit;
          border:1px solid color-mix(in srgb, var(--ma-accent) 38%, transparent);
          animation:voiceAssistantListenPulse 1s ease-out infinite;
          pointer-events:none;
        }
        .card.layout-tablet .empty-voice-btn {
          width:50px;
          height:50px;
          inset-inline-end:-10px;
          inset-block-end:-10px;
        }
        .surprise-me-card.magic-empty:active,
        .surprise-me-card.magic-empty.pressed,
        .surprise-me-card.magic-empty.busy {
          transform:scale(.96);
          box-shadow:0 16px 30px rgba(0,0,0,.18), 0 0 0 1px color-mix(in srgb, var(--ma-accent) 34%, transparent), 0 0 26px color-mix(in srgb, var(--ma-accent) 22%, transparent);
        }
        .surprise-me-card.magic-empty.busy,
        .surprise-me-card.magic-empty:disabled {
          cursor:progress;
        }
        .surprise-me-card.magic-empty.busy::after {
          content:"";
          position:absolute;
          inset:12px;
          border-radius:inherit;
          border:1px solid color-mix(in srgb, var(--ma-accent) 44%, transparent);
          animation:voiceAssistantListenPulse 1.05s ease-out infinite;
          pointer-events:none;
        }
        @keyframes emptyActionSweep {
          0% { transform:translateX(-100%); opacity:.4; }
          45% { opacity:.95; }
          100% { transform:translateX(100%); opacity:.25; }
        }
        @keyframes magic-empty-pulse {
          0%,100% { box-shadow:0 26px 46px rgba(0,0,0,.18), inset 0 1px 0 rgba(255,255,255,.14); border-color:rgba(255,255,255,.12); }
          50% { box-shadow:0 28px 50px rgba(0,0,0,.18), 0 0 28px color-mix(in srgb, var(--ma-accent) 14%, transparent), inset 0 1px 0 rgba(255,255,255,.16); border-color:color-mix(in srgb, var(--ma-accent) 24%, rgba(255,255,255,.14)); }
        }
        @keyframes magic-empty-halo {
          0%,100% { opacity:.24; box-shadow:0 0 0 5px color-mix(in srgb, var(--ma-accent) 5%, transparent); }
          50% { opacity:.48; box-shadow:0 0 0 10px color-mix(in srgb, var(--ma-accent) 9%, transparent); }
        }
        .empty-magic-screen-ripple {
          position:absolute;
          left:var(--empty-ripple-x, 50%);
          top:var(--empty-ripple-y, 50%);
          width:16px;
          height:16px;
          border-radius:999px;
          pointer-events:none;
          z-index:8;
          transform:translate(-50%, -50%) scale(.2);
          background:
            radial-gradient(circle, color-mix(in srgb, var(--ma-accent) 28%, rgba(255,255,255,.38)) 0 10%, transparent 54%),
            radial-gradient(circle, transparent 38%, color-mix(in srgb, var(--ma-accent) 28%, transparent) 40% 42%, transparent 62%);
          filter:blur(.2px);
          animation:emptyMagicRipple 1s ease-out forwards;
        }
        @keyframes emptyMagicRipple {
          0% { opacity:.72; transform:translate(-50%, -50%) scale(.2); }
          60% { opacity:.34; }
          100% { opacity:0; transform:translate(-50%, -50%) scale(18); }
        }
        .empty-playback-loader {
          position:absolute;
          left:var(--empty-loader-x, 50%);
          top:var(--empty-loader-y, 50%);
          z-index:9;
          width:92px;
          height:42px;
          border-radius:999px;
          display:grid;
          grid-auto-flow:column;
          place-content:center;
          align-items:center;
          gap:8px;
          pointer-events:none;
          color:#fff8df;
          background:linear-gradient(180deg, rgba(255,255,255,.14), rgba(255,255,255,.06));
          border:1px solid color-mix(in srgb, var(--ma-accent) 28%, rgba(255,255,255,.16));
          box-shadow:0 18px 36px rgba(0,0,0,.22), 0 0 0 7px color-mix(in srgb, var(--ma-accent) 9%, transparent), inset 0 1px 0 rgba(255,255,255,.14);
          backdrop-filter:blur(18px) saturate(125%);
          -webkit-backdrop-filter:blur(18px) saturate(125%);
          transform:translate(-50%, -50%);
          animation:emptyPlaybackLoaderIn .18s ease-out both;
        }
        .empty-playback-loader span {
          width:8px;
          height:8px;
          border-radius:999px;
          background:currentColor;
          opacity:.52;
          animation:emptyPlaybackDot 1s ease-in-out infinite;
        }
        .empty-playback-loader span:nth-child(2) { animation-delay:.14s; }
        .empty-playback-loader span:nth-child(3) { animation-delay:.28s; }
        @keyframes emptyPlaybackLoaderIn {
          from { opacity:0; transform:translate(-50%, -50%) scale(.92); }
          to { opacity:1; transform:translate(-50%, -50%) scale(1); }
        }
        @keyframes emptyPlaybackDot {
          0%,100% { opacity:.38; transform:translateY(0); }
          45% { opacity:1; transform:translateY(-5px); }
        }
        .top-settings-fab {
          position:absolute;
          inset-block-start:18px;
          z-index:6;
          width:38px;
          height:38px;
          border-radius:14px;
          border:1px solid rgba(255,255,255,.12);
          background:rgba(14,18,28,.54);
          color:#fff;
          display:grid;
          place-items:center;
          box-shadow:0 12px 24px rgba(0,0,0,.18);
          backdrop-filter:blur(14px);
          -webkit-backdrop-filter:blur(14px);
        }
        .top-settings-fab,
        .top-settings-fab.ltr,
        .top-settings-fab.rtl {
          right:18px;
          left:auto;
          inset-inline-start:auto;
          inset-inline-end:auto;
        }
        .card.has-home-shortcut:not(.compact-expanded) > .top-settings-fab {
          right:70px;
        }
        .home-shortcut-fab {
          position:absolute;
          z-index:6;
          width:44px;
          height:44px;
          border-radius:999px;
          border:1px solid rgba(255,255,255,.12);
          background:rgba(14,18,28,.58);
          color:#fff;
          display:grid;
          place-items:center;
          box-shadow:0 14px 30px rgba(0,0,0,.2);
          backdrop-filter:blur(14px);
          -webkit-backdrop-filter:blur(14px);
        }
        .home-shortcut-fab .ui-ic { width:20px; height:20px; }
        .home-shortcut-fab.mobile { inset-block-start:18px; }
        .home-shortcut-fab.tablet { inset-block-end:22px; }
        .home-shortcut-fab,
        .home-shortcut-fab.ltr,
        .home-shortcut-fab.rtl {
          right:18px;
          left:auto;
          inset-inline-start:auto;
          inset-inline-end:auto;
        }
        .card.compact-expanded > .home-shortcut-fab.mobile {
          top:18px !important;
          right:auto !important;
          left:18px !important;
          inset-block-start:18px !important;
          inset-inline-start:auto !important;
          inset-inline-end:auto !important;
          z-index:8 !important;
        }
        .card.compact-expanded > .top-settings-fab {
          top:18px !important;
          right:66px !important;
          left:auto !important;
          inset-block-start:18px !important;
          inset-inline-start:auto !important;
          inset-inline-end:auto !important;
          z-index:9 !important;
        }
        .card.compact-expanded > .compact-collapse-fab {
          top:18px !important;
          right:18px !important;
          left:auto !important;
          inset-block-start:18px !important;
          inset-inline-start:auto !important;
          inset-inline-end:auto !important;
          z-index:10 !important;
        }
        .card.compact-expanded.has-top-settings > .compact-collapse-fab {
          right:18px !important;
        }
        .history-toggle-fab {
          position:absolute;
          inset-block-start:50%;
          z-index:7;
          width:40px;
          height:78px;
          border-radius:16px;
          border:1px solid rgba(255,255,255,.12);
          background:rgba(14,18,28,.42);
          color:rgba(248,251,255,.86);
          display:grid;
          place-items:center;
          box-shadow:0 14px 28px rgba(0,0,0,.16);
          backdrop-filter:blur(12px);
          -webkit-backdrop-filter:blur(12px);
          transform:translateY(-50%);
          opacity:.86;
          transition:transform .18s ease, background-color .18s ease, border-color .18s ease, box-shadow .18s ease, opacity .18s ease;
        }
        .history-toggle-fab.left-edge { inset-inline-start:14px; }
        .history-toggle-fab.right-edge { inset-inline-end:14px; }
        .history-toggle-fab .ui-ic {
          width:18px;
          height:18px;
        }
        .history-toggle-fab.active {
          color:var(--ma-accent);
          background:rgba(245,166,35,.12);
          border-color:rgba(245,166,35,.24);
          box-shadow:0 16px 30px rgba(0,0,0,.18), 0 0 0 1px rgba(245,166,35,.1);
          opacity:.96;
        }
        .history-toggle-fab:active {
          transform:translateY(-50%) scale(.97);
        }
        @keyframes historyTabletSignal {
          0%,100% { opacity:.68; filter:drop-shadow(0 0 0 transparent); }
          50% { opacity:1; filter:drop-shadow(0 0 9px color-mix(in srgb, var(--ma-accent) 34%, transparent)); }
        }
        .history-toggle-fab.tablet-history-fab {
          inset-block-start:50%!important;
          inset-block-end:auto!important;
          width:38px;
          height:78px;
          border-radius:0;
          border:0;
          background:transparent;
          color:rgba(248,251,255,.82);
          box-shadow:none;
          backdrop-filter:none;
          -webkit-backdrop-filter:none;
          filter:drop-shadow(0 10px 18px rgba(0,0,0,.32));
        }
        .history-toggle-fab.tablet-history-fab.left-edge { inset-inline-start:2px!important; }
        .history-toggle-fab.tablet-history-fab.right-edge { inset-inline-end:2px!important; }
        .history-toggle-fab.tablet-history-fab .ui-ic {
          width:29px;
          height:29px;
          animation:historyTabletSignal 2.4s ease-in-out infinite;
          transform:none;
        }
        .history-toggle-fab.tablet-history-fab.right-edge .ui-ic {
          transform:scaleX(-1);
          animation:historyTabletSignal 2.4s ease-in-out infinite;
        }
        .sleep-timer-corner {
          position:absolute;
          inset-block-start:auto;
          inset-block-end:calc(102px + env(safe-area-inset-bottom, 0px));
          z-index:12;
          display:grid;
          gap:8px;
          align-items:start;
          pointer-events:auto;
        }
        .sleep-timer-corner.right,
        .sleep-timer-corner.left {
          inset-inline-start:50%;
          inset-inline-end:auto;
          justify-items:center;
          transform:translateX(-50%);
        }
        .sleep-timer-corner[hidden],
        .sleep-timer-chip[hidden],
        .sleep-timer-menu[hidden] {
          display:none !important;
        }
        .card:not(.layout-tablet).has-sleep-timer .player-focus,
        .card:not(.layout-tablet).has-sleep-timer .player-focus-nav {
          margin-top:0;
        }
        .sleep-timer-chip,
        .sleep-timer-menu-btn {
          border:none;
          color:inherit;
          font:inherit;
        }
        .sleep-timer-chip {
          min-height:40px;
          padding:0 12px;
          border-radius:999px;
          display:inline-flex;
          align-items:center;
          gap:8px;
          border:1px solid rgba(255,255,255,.14);
          background:rgba(12,16,24,.68);
          color:#fff;
          box-shadow:0 14px 26px rgba(0,0,0,.22);
          backdrop-filter:blur(18px);
          -webkit-backdrop-filter:blur(18px);
          font-size:calc(12px * var(--v2-font-scale));
          font-weight:800;
        }
        .sleep-timer-chip .ui-ic { width:16px; height:16px; }
        .sleep-timer-menu {
          display:grid;
          grid-auto-flow:column;
          gap:8px;
          padding:8px;
          border-radius:18px;
          border:1px solid rgba(255,255,255,.12);
          background:rgba(9,12,18,.74);
          box-shadow:0 18px 34px rgba(0,0,0,.24);
          backdrop-filter:blur(20px);
          -webkit-backdrop-filter:blur(20px);
        }
        .sleep-timer-menu-btn {
          min-width:54px;
          min-height:38px;
          padding:0 12px;
          border-radius:14px;
          background:rgba(255,255,255,.08);
          color:#fff;
          font-size:calc(12px * var(--v2-font-scale));
          font-weight:800;
        }
        .sleep-timer-menu-btn.danger {
          background:rgba(255,122,122,.14);
          color:#ffd2d2;
        }
        .sleep-timer-menu-btn.ghost {
          background:rgba(255,255,255,.06);
          color:rgba(255,255,255,.82);
        }
        .theme-light .sleep-timer-chip {
          background:rgba(255,255,255,.86);
          border-color:rgba(147,161,183,.18);
          color:#1f2633;
        }
        .theme-light .sleep-timer-menu {
          background:rgba(255,255,255,.88);
          border-color:rgba(147,161,183,.18);
        }
        .theme-light .sleep-timer-menu-btn {
          background:rgba(240,244,250,.96);
          color:#1f2633;
        }
        .theme-light .sleep-timer-menu-btn.danger {
          background:rgba(255,236,236,.92);
          color:#8b2935;
        }
        .theme-light .sleep-timer-menu-btn.ghost {
          background:rgba(245,248,252,.84);
          color:#516177;
        }
        .history-drawer {
          position:absolute;
          inset-block:18px 18px;
          z-index:6;
          width:min(320px, calc(100% - 72px));
          display:grid;
          grid-template-rows:auto minmax(0,1fr);
          border-radius:26px;
          border:1px solid rgba(255,255,255,.12);
          background:rgba(12,16,24,.74);
          box-shadow:0 22px 44px rgba(0,0,0,.26);
          backdrop-filter:blur(18px);
          -webkit-backdrop-filter:blur(18px);
          opacity:0;
          pointer-events:none;
          transition:transform .24s ease, opacity .2s ease;
        }
        .history-drawer.left-edge {
          inset-inline-start:66px;
          transform:translateX(calc(-100% - 18px));
        }
        .history-drawer.right-edge {
          inset-inline-end:66px;
          transform:translateX(calc(100% + 18px));
        }
        .history-drawer.open {
          opacity:1;
          pointer-events:auto;
          transform:translateX(0);
        }
        .history-drawer-head {
          display:grid;
          gap:10px;
          align-items:start;
          min-height:58px;
          padding:16px 16px 10px;
          border-bottom:1px solid rgba(255,255,255,.08);
        }
        .history-drawer-title {
          font-size:14px;
          font-weight:900;
          letter-spacing:.08em;
          text-transform:uppercase;
          color:rgba(255,255,255,.66);
        }
        .history-drawer-tabs {
          display:flex;
          align-items:center;
          gap:6px;
          padding:4px;
          border-radius:999px;
          background:rgba(255,255,255,.06);
          border:1px solid rgba(255,255,255,.08);
        }
        .history-tab {
          min-height:30px;
          flex:1 1 0;
          padding:0 10px;
          border:none;
          border-radius:999px;
          background:transparent;
          color:rgba(255,255,255,.68);
          font:inherit;
          font-size:11px;
          font-weight:900;
          cursor:pointer;
        }
        .history-tab.active {
          color:#18120a;
          background:linear-gradient(135deg, var(--ma-accent), color-mix(in srgb, var(--ma-accent) 72%, white 28%));
          box-shadow:0 8px 16px color-mix(in srgb, var(--ma-accent) 16%, transparent);
        }
        .history-drawer-body {
          overflow:auto;
          display:grid;
          align-content:start;
          gap:8px;
          padding:12px 12px 14px;
        }
        .history-actions {
          display:flex;
          justify-content:flex-end;
          padding-bottom:2px;
        }
        .history-play-all-btn {
          min-height:32px;
          gap:7px;
        }
        .history-play-all-btn .ui-ic {
          width:14px;
          height:14px;
        }
        .history-empty {
          min-height:96px;
          display:grid;
          place-items:center;
          padding:12px;
          text-align:center;
          font-size:13px;
          font-weight:700;
          line-height:1.45;
          color:rgba(255,255,255,.66);
        }
        .theme-light .history-toggle-fab {
          color:#1f2633;
          background:transparent;
          border-color:transparent;
          box-shadow:none;
          filter:drop-shadow(0 10px 18px rgba(95,112,136,.24));
        }
        .theme-light .history-drawer {
          background:rgba(255,255,255,.88);
          border-color:rgba(143,159,181,.18);
          box-shadow:0 20px 40px rgba(95,112,136,.16);
        }
        .theme-light .history-drawer-head {
          border-bottom-color:rgba(143,159,181,.14);
        }
        .theme-light .history-drawer-title {
          color:#7b889b;
        }
        .theme-light .history-drawer-tabs {
          background:rgba(236,241,247,.86);
          border-color:rgba(143,159,181,.14);
        }
        .theme-light .history-tab {
          color:#69778c;
        }
        .theme-light .history-tab.active {
          color:#392805;
        }
        .theme-light .history-empty {
          color:#6f7d91;
        }
        .footer-theme-ic {
          width:22px;
          height:22px;
          display:grid;
          place-items:center;
          font-size:18px;
          line-height:1;
        }
        .menu-head button[hidden] { visibility:hidden; display:grid; }
        .menu-aux-btn {
          position:absolute;
          inset-block-start:18px;
          inset-inline-end:68px;
          z-index:2;
        }
        .menu-title {
          grid-column:2 / 3;
          justify-self:center;
          text-align:center;
          font-size:20px;
          font-weight:900;
          letter-spacing:-.02em;
          display:flex;
          align-items:center;
          justify-content:center;
          gap:10px;
          width:min(100%, max-content);
          max-width:min(100%, calc(100% - 32px));
          margin-inline:auto;
        }
        .menu-title-main {
          display:inline-flex;
          align-items:center;
          justify-content:center;
          gap:8px;
          min-width:0;
        }
        .menu-title-brand {
          position:absolute;
          left:18px;
          right:auto;
          top:50%;
          transform:translateY(-50%);
          width:92px;
          max-width:34vw;
          display:inline-grid;
          place-items:center;
          color:rgba(255,255,255,.62);
          opacity:.94;
          flex:0 0 auto;
          pointer-events:none;
        }
        .menu-head:has(#mobileMenuBackBtn:not([hidden])) .menu-title-brand {
          left:72px;
          width:78px;
        }
        .theme-light .menu-title-brand {
          color:rgba(31,38,51,.42);
        }
        .menu-title-logo {
          max-height:30px;
        }
        .card.layout-tablet .menu-title {
          font-size:19px;
        }
        .menu-title-icon {
          width:20px;
          height:20px;
          display:inline-flex;
          align-items:center;
          justify-content:center;
          color:var(--ma-accent);
          flex-shrink:0;
        }
        .menu-title-icon .ui-ic { width:20px; height:20px; }
        .rtl .menu-title { flex-direction:row-reverse; }
        .menu-aux-btn .ui-ic { width:20px; height:20px; }
        .menu-title.clickable { cursor:pointer; }
        .menu-body { overflow:auto; padding:16px; display:grid; gap:12px; align-content:start; min-height:0; position:relative; }
        .menu-body.sheet-settings {
          overflow-anchor:none;
          scroll-behavior:auto;
        }
        .diagnostics-shell {
          gap:12px;
        }
        .diagnostics-actions {
          display:flex;
          align-items:center;
          gap:10px;
          flex-wrap:wrap;
        }
        .diagnostic-summary {
          margin-top:4px;
          padding:10px 12px;
          border-radius:14px;
          background:rgba(255,255,255,.07);
          border:1px solid rgba(255,255,255,.1);
          font-size:13px;
          font-weight:850;
          line-height:1.35;
        }
        .theme-light .diagnostic-summary {
          background:rgba(255,255,255,.72);
          border-color:rgba(123,139,164,.18);
        }
        .diagnostics-list {
          display:grid;
          gap:10px;
        }
        .diagnostic-row {
          display:grid;
          grid-template-columns:36px minmax(0,1fr);
          gap:10px;
          align-items:start;
          padding:12px;
          border-radius:16px;
          background:rgba(255,255,255,.07);
          border:1px solid rgba(255,255,255,.1);
        }
        .theme-light .diagnostic-row {
          background:rgba(255,255,255,.78);
          border-color:rgba(123,139,164,.2);
        }
        .diagnostic-status {
          width:32px;
          height:32px;
          border-radius:12px;
          display:grid;
          place-items:center;
          background:rgba(255,255,255,.08);
          color:rgba(255,255,255,.74);
        }
        .diagnostic-status .ui-ic {
          width:18px;
          height:18px;
        }
        .diagnostic-row.status-ok .diagnostic-status {
          color:#5be58f;
          background:rgba(91,229,143,.12);
        }
        .diagnostic-row.status-fail .diagnostic-status {
          color:#ff7d8a;
          background:rgba(255,125,138,.13);
        }
        .diagnostic-row.status-warn .diagnostic-status {
          color:#ffd47a;
          background:rgba(255,212,122,.13);
        }
        .diagnostic-row.status-info .diagnostic-status {
          color:#7db7ff;
          background:rgba(125,183,255,.13);
        }
        .diagnostic-copy {
          min-width:0;
          display:grid;
          gap:4px;
        }
        .diagnostic-title {
          font-size:14px;
          font-weight:950;
        }
        .diagnostic-value {
          font-size:12px;
          font-weight:850;
          color:rgba(255,255,255,.72);
          overflow-wrap:anywhere;
        }
        .diagnostic-detail {
          font-size:12px;
          line-height:1.4;
          color:rgba(255,255,255,.58);
          overflow-wrap:anywhere;
        }
        .theme-light .diagnostic-status {
          background:rgba(238,243,248,.86);
          color:#546172;
        }
        .theme-light .diagnostic-value {
          color:rgba(31,38,51,.68);
        }
        .theme-light .diagnostic-detail {
          color:rgba(31,38,51,.54);
        }
        .card.layout-tablet .menu-body {
          padding:14px 16px 16px;
          gap:10px;
        }
        .menu-body.library-mode { overflow:hidden; display:grid; min-height:0; }
        .menu-body.library-mode {
          height:100%;
          max-height:100%;
          grid-template-rows:minmax(0,1fr);
        }
        .menu-body.search-mode .library-shell,
        .menu-body.search-mode .media-home-shell {
          min-height:0;
          height:100%;
        }
        .menu-body.search-mode .media-home-shell {
          grid-template-rows:auto minmax(0,1fr);
        }
        #mobileMediaSearchResults {
          min-height:0;
          overflow:auto;
        }
        .menu-body.search-mode .media-search-zone {
          position:sticky;
          top:0;
          z-index:3;
          padding-bottom:10px;
          background:linear-gradient(180deg, rgba(15,18,27,.92), rgba(15,18,27,.68), transparent);
        }
        .theme-light .menu-body.search-mode .media-search-zone {
          background:linear-gradient(180deg, rgba(239,244,250,.94), rgba(239,244,250,.72), transparent);
        }
        .theme-light .menu-backdrop {
          background:rgba(229,236,245,.58);
          backdrop-filter:blur(20px);
          -webkit-backdrop-filter:blur(20px);
        }
        .lyrics-backdrop {
          position:absolute; inset:0; z-index:70; display:none; align-items:center; justify-content:center;
          padding:max(12px, env(safe-area-inset-top)) max(12px, env(safe-area-inset-right)) max(12px, env(safe-area-inset-bottom)) max(12px, env(safe-area-inset-left));
          background:
            radial-gradient(circle at 18% 16%, rgba(var(--dynamic-accent-rgb,245 166 35) / .22), transparent 28%),
            linear-gradient(180deg, rgba(8,10,16,.62), rgba(6,8,14,.86));
          backdrop-filter:blur(18px); -webkit-backdrop-filter:blur(18px);
          overscroll-behavior:contain;
          overflow:hidden;
          isolation:isolate;
        }
        .lyrics-backdrop.open { display:flex; }
        .lyrics-backdrop::before {
          content:"";
          position:absolute;
          inset:-14%;
          z-index:0;
          pointer-events:none;
          background:var(--lyrics-dynamic-art, none) center/cover no-repeat;
          filter:blur(52px) saturate(1.18) brightness(.82);
          opacity:0;
          transform:scale(1.12);
          transition:opacity .24s ease;
        }
        .lyrics-backdrop.has-lyrics-art::before { opacity:.52; }
        .lyrics-backdrop::after {
          content:"";
          position:absolute;
          inset:0;
          z-index:0;
          pointer-events:none;
          background:
            radial-gradient(circle at 50% 18%, rgba(255,255,255,.10), transparent 30%),
            linear-gradient(180deg, rgba(6,8,14,.34), rgba(6,8,14,.78) 48%, rgba(4,6,12,.92));
        }
        .card.layout-tablet.lyrics-modal-open {
          overflow:hidden;
        }
        .card:not(.layout-tablet).lyrics-modal-open {
          overflow:hidden;
        }
        .lyrics-sheet {
          position:relative; z-index:1; isolation:isolate;
          width:min(1160px, calc(100% - 8px)); max-height:calc(100% - 8px); overflow:hidden; display:grid; grid-template-rows:auto minmax(0,1fr);
          border-radius:28px; border:1px solid rgba(255,255,255,.14);
          background:linear-gradient(180deg, rgba(18,21,32,.74), rgba(9,11,18,.88));
          box-shadow:0 28px 72px rgba(0,0,0,.38), inset 0 1px 0 rgba(255,255,255,.08);
          backdrop-filter:blur(26px) saturate(1.08);
          -webkit-backdrop-filter:blur(26px) saturate(1.08);
        }
        .theme-light .lyrics-sheet { background:rgba(255,255,255,.92); border-color:rgba(147,161,183,.2); }
        .lyrics-sheet::before {
          content:"";
          position:absolute;
          inset:-22%;
          z-index:0;
          pointer-events:none;
          background:var(--lyrics-dynamic-art, none) center/cover no-repeat;
          filter:blur(42px) saturate(1.16);
          transform:scale(1.1);
          opacity:.18;
        }
        .lyrics-sheet::after {
          content:"";
          position:absolute;
          inset:0;
          z-index:0;
          pointer-events:none;
          background:
            linear-gradient(180deg, rgba(18,21,32,.78), rgba(11,13,21,.86)),
            radial-gradient(circle at 50% 0%, rgba(var(--dynamic-accent-rgb,245 166 35) / .14), transparent 42%);
        }
        .theme-light .lyrics-sheet::after {
          background:
            linear-gradient(180deg, rgba(255,255,255,.82), rgba(245,248,253,.92)),
            radial-gradient(circle at 50% 0%, rgba(var(--dynamic-accent-rgb,245 166 35) / .12), transparent 42%);
        }
        .lyrics-head,
        .lyrics-body {
          position:relative;
          z-index:1;
        }
        .lyrics-head { display:grid; grid-template-columns:minmax(0,1fr) auto; align-items:start; gap:14px; padding:18px 16px 14px; border-bottom:1px solid rgba(255,255,255,.08); }
        .theme-light .lyrics-head { border-bottom-color:rgba(143,159,181,.16); }
        .lyrics-title-wrap { min-width:0; display:grid; gap:6px; text-align:center; }
        .lyrics-title-brand {
          width:120px;
          max-width:56%;
          margin-inline:auto;
          color:rgba(255,255,255,.64);
          opacity:.96;
          display:grid;
          place-items:center;
        }
        .theme-light .lyrics-title-brand {
          color:rgba(31,38,51,.42);
        }
        .lyrics-title { font-size:22px; font-weight:900; line-height:1.08; }
        .lyrics-sub { font-size:13px; color:rgba(255,255,255,.72); }
        .theme-light .lyrics-sub { color:rgba(55,68,85,.68); }
        .lyrics-head-actions { display:flex; align-items:center; justify-content:flex-end; flex-wrap:wrap; gap:10px; justify-self:end; }
        .lyrics-offset-controls,
        .lyrics-font-controls {
          display:inline-flex;
          align-items:center;
          gap:4px;
          padding:4px;
          border-radius:999px;
          background:rgba(255,255,255,.07);
          border:1px solid rgba(255,255,255,.08);
        }
        .lyrics-offset-btn,
        .lyrics-offset-label {
          border:none;
          min-width:34px;
          height:32px;
          border-radius:999px;
          display:inline-grid;
          place-items:center;
          background:transparent;
          color:rgba(255,255,255,.88);
          font:inherit;
          font-size:13px;
          font-weight:900;
        }
        .lyrics-offset-btn:active,
        .lyrics-offset-label:active {
          transform:scale(.96);
        }
        .lyrics-offset-label {
          min-width:52px;
          padding:0 8px;
          background:rgba(255,255,255,.08);
          color:#fff;
        }
        .lyrics-sync-btn {
          border:none;
          min-height:40px;
          padding:0 12px;
          border-radius:999px;
          display:inline-flex;
          align-items:center;
          gap:8px;
          background:rgba(255,255,255,.08);
          color:rgba(255,255,255,.86);
          font:inherit;
          font-size:13px;
          font-weight:800;
        }
        .lyrics-sync-btn.active {
          background:color-mix(in srgb, var(--ma-accent) 22%, rgba(255,255,255,.08));
          color:#fff;
          box-shadow:0 10px 24px color-mix(in srgb, var(--ma-accent) 22%, transparent);
        }
        .theme-light .lyrics-sync-btn {
          background:rgba(240,244,250,.92);
          color:#253041;
        }
        .theme-light .lyrics-offset-controls,
        .theme-light .lyrics-font-controls {
          background:rgba(240,244,250,.86);
          border-color:rgba(143,159,181,.16);
        }
        .theme-light .lyrics-offset-btn,
        .theme-light .lyrics-offset-label {
          color:#253041;
        }
        .theme-light .lyrics-offset-label {
          background:rgba(255,255,255,.82);
        }
        .theme-light .lyrics-sync-btn.active {
          background:color-mix(in srgb, var(--ma-accent) 16%, rgba(240,244,250,.96));
        }
        .lyrics-body { min-height:0; height:100%; overflow:auto; padding:clamp(24px, 4vw, 42px) clamp(18px, 5vw, 72px) 32px; white-space:pre-wrap; line-height:1.92; font-size:calc(clamp(18px, 3vw, 30px) * var(--lyrics-font-scale, 1)); color:#fff; text-align:center; scroll-behavior:smooth; display:grid; justify-items:center; overscroll-behavior:contain; -webkit-overflow-scrolling:touch; }
        .theme-light .lyrics-body { color:#1f2633; }
        .lyrics-state { display:grid; place-items:center; min-height:220px; text-align:center; color:rgba(255,255,255,.72); }
        .theme-light .lyrics-state { color:rgba(55,68,85,.68); }
        .lyrics-pre { margin:0; font:inherit; white-space:pre-wrap; text-align:center; }
        .lyrics-timeline {
          width:min(100%, 920px);
          margin-inline:auto;
          display:grid;
          gap:14px;
          padding:10px 4px 44vh;
        }
        .lyrics-line {
          width:100%;
          text-align:center;
          opacity:.42;
          transform:scale(.96);
          transform-origin:center;
          color:rgba(255,255,255,.78);
          font-weight:800;
          line-height:1.48;
          letter-spacing:.01em;
          transition:opacity .22s ease, transform .22s ease, color .22s ease, text-shadow .22s ease;
        }
        .lyrics-line.active {
          opacity:1;
          transform:scale(1.14);
          color:#fff;
          font-weight:950;
          text-shadow:0 0 22px color-mix(in srgb, var(--ma-accent) 46%, transparent), 0 8px 28px rgba(0,0,0,.34);
        }
        .theme-light .lyrics-line { color:rgba(31,38,51,.6); }
        .theme-light .lyrics-line.active {
          color:#101722;
          text-shadow:0 10px 26px color-mix(in srgb, var(--ma-accent) 28%, transparent);
        }
        .card.layout-tablet .lyrics-backdrop {
          align-items:center;
          padding:max(44px, env(safe-area-inset-top)) max(34px, env(safe-area-inset-right)) max(34px, env(safe-area-inset-bottom)) max(34px, env(safe-area-inset-left));
        }
        .card.layout-tablet .lyrics-sheet {
          width:min(1320px, calc(100% - 96px));
          max-height:calc(100% - 96px);
          border-radius:34px;
        }
        .card.layout-tablet .lyrics-head {
          align-items:center;
          gap:16px;
          padding:22px 24px 18px;
        }
        .card.layout-tablet .lyrics-title-wrap {
          min-width:0;
          padding-inline:24px;
        }
        .card.layout-tablet .lyrics-title,
        .card.layout-tablet .lyrics-sub {
          white-space:nowrap;
          overflow:hidden;
          text-overflow:ellipsis;
        }
        .card.layout-tablet .lyrics-title {
          font-size:clamp(24px, 2.8vw, 34px);
          line-height:1.18;
        }
        .card.layout-tablet .lyrics-body {
          padding-block-start:clamp(34px, 5vh, 56px);
        }
        @media (min-width: 901px) {
          .card:not(.layout-tablet) .lyrics-head {
            align-items:center;
            grid-template-columns:minmax(0, 1fr) minmax(280px, auto);
          }
          .card:not(.layout-tablet) .lyrics-head-actions {
            display:flex !important;
            visibility:visible !important;
            opacity:1 !important;
            flex-wrap:nowrap;
            max-width:min(640px, 48vw);
            overflow:auto;
            scrollbar-width:none;
          }
          .card:not(.layout-tablet) .lyrics-head-actions::-webkit-scrollbar {
            display:none;
          }
          .card:not(.layout-tablet) .lyrics-offset-controls,
          .card:not(.layout-tablet) .lyrics-font-controls,
          .card:not(.layout-tablet) .lyrics-sync-btn {
            flex:0 0 auto;
          }
        }
        @media (max-width: 600px) {
          .lyrics-backdrop {
            align-items:center;
            padding:max(8px, env(safe-area-inset-top)) max(8px, env(safe-area-inset-right)) max(8px, env(safe-area-inset-bottom)) max(8px, env(safe-area-inset-left));
          }
          .lyrics-sheet {
            width:100%;
            height:min(560px, calc(100% - 18px));
            max-height:calc(100% - 18px);
            border-radius:22px;
          }
          .lyrics-head {
            grid-template-columns:minmax(0,1fr);
            align-items:start;
            gap:8px;
            padding:12px 10px 10px;
          }
          .lyrics-title-wrap {
            gap:4px;
            text-align:center;
          }
          .rtl .lyrics-title-wrap {
            text-align:center;
          }
          .lyrics-title,
          .lyrics-sub {
            overflow:hidden;
            text-overflow:ellipsis;
          }
          .lyrics-title {
            font-size:16px;
            line-height:1.1;
            white-space:nowrap;
          }
          .lyrics-sub {
            font-size:12px;
            display:-webkit-box;
            -webkit-line-clamp:2;
            -webkit-box-orient:vertical;
          }
          .lyrics-head-actions {
            justify-self:center;
            flex-wrap:nowrap;
            gap:6px;
            max-width:100%;
            overflow:auto;
            scrollbar-width:none;
          }
          .lyrics-head-actions::-webkit-scrollbar {
            display:none;
          }
          .lyrics-sync-btn {
            min-height:36px;
            padding:0 10px;
            font-size:12px;
            white-space:nowrap;
          }
          .lyrics-offset-btn,
          .lyrics-offset-label {
            min-width:30px;
            height:30px;
            font-size:12px;
          }
          .lyrics-offset-label {
            min-width:46px;
          }
          .lyrics-body {
            padding:16px 14px 24px;
            font-size:calc(clamp(18px, 5.6vw, 26px) * var(--lyrics-font-scale, 1));
            align-content:start;
          }
          .lyrics-line.active {
            transform:scale(1.06);
          }
          .lyrics-timeline {
            width:100%;
            gap:16px;
            padding-bottom:42vh;
          }
        }
        .theme-light .menu-head {
          border-bottom-color:rgba(143,159,181,.16);
        }
        .menu-item,.menu-list-item,.queue-row,.media-search-shell,.media-category-row { width:100%; min-width:0; overflow:hidden; display:flex; align-items:center; gap:12px; padding:14px; border-radius:22px; color:#fff; text-align:inherit; transition:transform .16s ease, border-color .16s ease, background-color .16s ease, box-shadow .16s ease; }
        .menu-item,.menu-list-item { border:none; cursor:pointer; }
        .menu-item:active,
        .menu-list-item:active,
        .queue-row:active,
        .footer-btn:active,
        .control-btn:active,
        .main-btn:active,
        .settings-pill:active,
        .settings-check-pill:active,
        .library-nav-btn:active,
        .media-entry-main:active,
        .action-btn:active,
        .chip-btn:active {
          transform:scale(.985);
          border-color:color-mix(in srgb, var(--ma-accent) 34%, transparent);
          background-color:color-mix(in srgb, var(--ma-accent) 16%, transparent);
        }
        .menu-item-main { display:flex; align-items:center; gap:14px; min-width:0; flex:1; }
        .action-tile {
          min-height:104px;
          padding:0;
          align-items:stretch;
          border-radius:22px;
          background:
            linear-gradient(145deg, rgba(255,255,255,.12), rgba(255,255,255,.05)),
            radial-gradient(circle at 18% 18%, color-mix(in srgb, var(--ma-accent) 18%, transparent), transparent 40%);
          border:1px solid rgba(255,255,255,.12);
          box-shadow:0 18px 32px rgba(0,0,0,.16);
          position:relative;
        }
        .action-tile .menu-item-main {
          display:grid;
          grid-template-columns:58px minmax(0,1fr);
          align-items:center;
          gap:12px;
          width:100%;
          min-height:100%;
          padding:12px 14px;
        }
        .action-tile .menu-item-ico {
          width:58px;
          height:58px;
          border-radius:18px;
          box-shadow:0 14px 24px color-mix(in srgb, var(--ma-accent) 14%, transparent);
        }
        .action-tile .menu-item-title {
          font-size:19px;
          font-weight:950;
          letter-spacing:-.02em;
        }
        .action-tile-kicker {
          display:none;
          margin-bottom:4px;
          font-size:10px;
          font-weight:900;
          letter-spacing:.08em;
          text-transform:uppercase;
          color:rgba(255,255,255,.54);
        }
        .menu-body.sheet-actions .action-tile .menu-item-sub {
          display:-webkit-box !important;
          margin-top:4px;
          color:rgba(255,255,255,.68);
          font-size:13px;
          line-height:1.3;
          -webkit-line-clamp:2;
          -webkit-box-orient:vertical;
          overflow:hidden;
        }
        .action-tile-arrow {
          display:none;
        }
        .action-tile.tone-stop .menu-item-ico {
          background:linear-gradient(135deg, rgba(255,132,132,.24), rgba(255,180,120,.12));
          border-color:rgba(255,132,132,.26);
          color:#ff9d85;
        }
        .action-tile.tone-announcement .menu-item-ico {
          background:linear-gradient(135deg, rgba(126,214,255,.24), rgba(94,165,255,.12));
          border-color:rgba(126,214,255,.24);
          color:#8edaff;
        }
        .action-tile.tone-players .menu-item-ico,
        .action-tile.tone-group .menu-item-ico {
          background:linear-gradient(135deg, rgba(255,217,135,.28), rgba(245,166,35,.12));
        }
        .action-tile.tone-simple .menu-item-ico {
          background:
            linear-gradient(135deg, color-mix(in srgb, var(--ma-accent) 42%, rgba(255,255,255,.18)), rgba(126,214,255,.14)),
            radial-gradient(circle at 34% 22%, rgba(255,255,255,.3), transparent 38%);
          border-color:color-mix(in srgb, var(--ma-accent) 36%, transparent);
          color:#fff;
        }
        .simple-wizard-shell {
          display:grid;
          gap:18px;
          min-height:100%;
          align-content:start;
        }
        .simple-wizard-shell button {
          font:inherit;
          cursor:pointer;
        }
        .simple-wizard-progress {
          display:grid;
          grid-template-columns:repeat(3, minmax(0, 1fr));
          gap:10px;
        }
        .simple-wizard-progress-step {
          min-width:0;
          display:grid;
          grid-template-columns:28px minmax(0,1fr);
          align-items:center;
          gap:8px;
          padding:9px;
          border-radius:18px;
          background:linear-gradient(145deg, rgba(255,255,255,.08), rgba(255,255,255,.04));
          border:1px solid rgba(255,255,255,.12);
          color:rgba(255,255,255,.68);
          box-shadow:inset 0 1px 0 rgba(255,255,255,.08);
        }
        .simple-wizard-progress-step span {
          width:28px;
          height:28px;
          display:grid;
          place-items:center;
          border-radius:12px;
          background:rgba(255,255,255,.08);
          color:#fff;
          font-size:13px;
          font-weight:950;
        }
        .simple-wizard-progress-step strong {
          min-width:0;
          overflow:hidden;
          text-overflow:ellipsis;
          white-space:nowrap;
          font-size:12px;
          font-weight:900;
        }
        .simple-wizard-progress-step.active {
          color:#fff;
          border-color:color-mix(in srgb, var(--ma-accent) 34%, transparent);
          background:
            linear-gradient(145deg, color-mix(in srgb, var(--ma-accent) 22%, rgba(255,255,255,.08)), rgba(255,255,255,.05)),
            radial-gradient(circle at 15% 20%, rgba(255,255,255,.16), transparent 45%);
          box-shadow:0 16px 30px color-mix(in srgb, var(--ma-accent) 16%, transparent);
        }
        .simple-wizard-progress-step.done span {
          background:color-mix(in srgb, var(--ma-accent) 72%, #fff 10%);
        }
        .simple-wizard-toolbar {
          display:flex;
          justify-content:flex-end;
          margin-top:-4px;
        }
        .simple-wizard-reset-btn {
          min-height:38px;
          padding:0 18px;
          border-radius:999px;
          border:1px solid rgba(255,255,255,.14);
          background:linear-gradient(145deg, rgba(255,255,255,.1), rgba(255,255,255,.045));
          color:rgba(255,255,255,.82);
          font-size:13px;
          font-weight:900;
          box-shadow:inset 0 1px 0 rgba(255,255,255,.08), 0 12px 22px rgba(0,0,0,.12);
        }
        .simple-wizard-reset-btn:active {
          transform:translateY(1px);
        }
        .simple-wizard-panel {
          display:grid;
          gap:16px;
          animation:simpleWizardIn .2s ease;
        }
        @keyframes simpleWizardIn {
          from { opacity:0; transform:translateY(8px); }
          to { opacity:1; transform:translateY(0); }
        }
        .simple-wizard-title {
          color:#fff;
          font-size:24px;
          line-height:1.12;
          font-weight:950;
        }
        .simple-wizard-player-grid,
        .simple-wizard-option-grid {
          display:grid;
          grid-template-columns:repeat(2, minmax(0, 1fr));
          gap:12px;
        }
        .simple-wizard-player,
        .simple-wizard-option,
        .simple-wizard-source {
          min-width:0;
          width:100%;
          display:grid;
          align-items:center;
          gap:12px;
          border:none;
          color:#fff;
          text-align:inherit;
          background:
            linear-gradient(145deg, rgba(255,255,255,.12), rgba(255,255,255,.045)),
            radial-gradient(circle at 14% 18%, rgba(255,255,255,.08), transparent 42%);
          border:1px solid rgba(255,255,255,.13);
          box-shadow:inset 0 1px 0 rgba(255,255,255,.08), 0 20px 38px rgba(0,0,0,.17);
          transition:transform .16s ease, border-color .16s ease, background-color .16s ease, box-shadow .16s ease;
        }
        .simple-wizard-player {
          grid-template-columns:54px minmax(0,1fr) 34px;
          min-height:88px;
          padding:12px;
          border-radius:22px;
        }
        .simple-wizard-option {
          grid-template-columns:48px minmax(0,1fr);
          min-height:92px;
          padding:14px;
          border-radius:22px;
        }
        .simple-wizard-source-grid {
          display:grid;
          grid-template-columns:repeat(2, minmax(0, 1fr));
          gap:12px;
        }
        .simple-wizard-source {
          min-height:86px;
          justify-items:center;
          text-align:center;
          padding:14px;
          border-radius:22px;
        }
        .simple-wizard-source span,
        .simple-wizard-option-icon,
        .simple-wizard-player-icon,
        .simple-wizard-player-art,
        .simple-wizard-check {
          display:grid;
          place-items:center;
        }
        .simple-wizard-source .ui-ic {
          width:28px;
          height:28px;
        }
        .simple-wizard-source strong {
          font-size:18px;
          font-weight:950;
        }
        .simple-wizard-player-art,
        .simple-wizard-player-icon,
        .simple-wizard-option-icon {
          width:48px;
          height:48px;
          border-radius:16px;
          overflow:hidden;
          background:rgba(255,255,255,.08);
          color:var(--ma-accent);
          border:1px solid rgba(255,255,255,.12);
        }
        .simple-wizard-player-art img {
          width:100%;
          height:100%;
          object-fit:cover;
          display:block;
        }
        .simple-wizard-option-icon .ui-ic,
        .simple-wizard-player-icon .ui-ic,
        .simple-wizard-player-art .ui-ic {
          width:24px;
          height:24px;
        }
        .simple-wizard-player-copy,
        .simple-wizard-review-copy {
          min-width:0;
          display:grid;
          gap:3px;
        }
        .simple-wizard-option-title {
          display:block;
          min-width:0;
          overflow:hidden;
          text-overflow:ellipsis;
          white-space:nowrap;
          font-size:17px;
          line-height:1.2;
          font-weight:950;
        }
        .simple-wizard-option-sub {
          display:block;
          min-width:0;
          overflow:hidden;
          text-overflow:ellipsis;
          white-space:nowrap;
          color:rgba(255,255,255,.68);
          font-size:12px;
          line-height:1.25;
          font-weight:750;
        }
        .simple-wizard-check {
          width:34px;
          height:34px;
          border-radius:14px;
          background:rgba(255,255,255,.08);
          color:rgba(255,255,255,.76);
        }
        .simple-wizard-check .ui-ic {
          width:18px;
          height:18px;
        }
        .simple-wizard-player.active,
        .simple-wizard-option.active,
        .simple-wizard-source.active {
          border-color:color-mix(in srgb, var(--ma-accent) 42%, transparent);
          background:
            linear-gradient(145deg, color-mix(in srgb, var(--ma-accent) 20%, rgba(255,255,255,.09)), rgba(255,255,255,.055)),
            radial-gradient(circle at 18% 18%, color-mix(in srgb, var(--ma-accent) 22%, transparent), transparent 46%);
          box-shadow:0 20px 36px color-mix(in srgb, var(--ma-accent) 18%, rgba(0,0,0,.16));
        }
        .simple-wizard-option.free {
          border-style:solid;
          background:
            linear-gradient(145deg, rgba(255,255,255,.13), rgba(255,255,255,.05)),
            radial-gradient(circle at 84% 18%, color-mix(in srgb, var(--ma-accent) 18%, transparent), transparent 42%);
        }
        .simple-wizard-player.active .simple-wizard-check,
        .simple-wizard-option.active .simple-wizard-option-icon {
          background:color-mix(in srgb, var(--ma-accent) 72%, rgba(255,255,255,.16));
          color:#fff;
        }
        .simple-wizard-player.is-playing .simple-wizard-player-art {
          box-shadow:0 0 0 2px color-mix(in srgb, var(--ma-accent) 48%, transparent);
        }
        .simple-wizard-search {
          display:grid;
          gap:8px;
          color:rgba(255,255,255,.76);
          font-size:13px;
          font-weight:850;
        }
        .simple-wizard-search input {
          width:100%;
          min-height:58px;
          border-radius:20px;
          border:1px solid rgba(255,255,255,.13);
          background:rgba(255,255,255,.08);
          color:#fff;
          padding:0 16px;
          font:inherit;
          font-size:16px;
          outline:none;
        }
        .simple-wizard-search input:focus {
          border-color:color-mix(in srgb, var(--ma-accent) 46%, transparent);
          box-shadow:0 0 0 3px color-mix(in srgb, var(--ma-accent) 16%, transparent);
        }
        .simple-wizard-footer {
          position:sticky;
          inset-block-end:0;
          display:grid;
          grid-template-columns:repeat(2, minmax(0, 1fr));
          gap:10px;
          padding-top:8px;
          background:linear-gradient(180deg, transparent, rgba(14,16,24,.86) 30%, rgba(14,16,24,.94));
          z-index:2;
        }
        .simple-wizard-footer.triple {
          grid-template-columns:minmax(0,.8fr) minmax(0,.8fr) minmax(0,1.2fr);
        }
        .simple-wizard-footer.single {
          grid-template-columns:minmax(0,1fr);
        }
        .simple-wizard-primary,
        .simple-wizard-secondary {
          min-width:0;
          min-height:58px;
          border-radius:19px;
          border:1px solid rgba(255,255,255,.14);
          color:#fff;
          font-size:16px;
          font-weight:950;
          text-align:center;
          display:grid;
          place-items:center;
        }
        .simple-wizard-primary {
          background:
            linear-gradient(135deg, color-mix(in srgb, var(--ma-accent) 76%, #ffffff 10%), color-mix(in srgb, var(--ma-accent) 48%, #4f7cff 34%));
          box-shadow:0 18px 32px color-mix(in srgb, var(--ma-accent) 22%, rgba(0,0,0,.2));
        }
        .simple-wizard-secondary {
          background:rgba(255,255,255,.08);
        }
        .simple-wizard-primary:disabled {
          opacity:.44;
          cursor:not-allowed;
          box-shadow:none;
        }
        .simple-wizard-loading {
          min-height:260px;
          justify-items:center;
          align-content:center;
          text-align:center;
        }
        .simple-wizard-loader {
          width:82px;
          height:82px;
          display:grid;
          place-items:center;
          border-radius:28px;
          color:#fff;
          background:color-mix(in srgb, var(--ma-accent) 28%, rgba(255,255,255,.08));
          border:1px solid color-mix(in srgb, var(--ma-accent) 32%, transparent);
          animation:simpleWizardPulse 1.25s ease-in-out infinite;
        }
        .simple-wizard-loader .ui-ic {
          width:34px;
          height:34px;
        }
        @keyframes simpleWizardPulse {
          0%, 100% { transform:scale(1); opacity:.84; }
          50% { transform:scale(1.06); opacity:1; }
        }
        .simple-wizard-review-card {
          min-width:0;
          display:grid;
          grid-template-columns:108px minmax(0,1fr);
          gap:14px;
          align-items:center;
          padding:14px;
          border-radius:26px;
          background:
            linear-gradient(145deg, rgba(255,255,255,.13), rgba(255,255,255,.06)),
            radial-gradient(circle at 18% 16%, color-mix(in srgb, var(--ma-accent) 22%, transparent), transparent 48%);
          border:1px solid color-mix(in srgb, var(--ma-accent) 26%, rgba(255,255,255,.12));
          box-shadow:0 22px 42px rgba(0,0,0,.18);
        }
        .simple-wizard-review-art {
          width:108px;
          aspect-ratio:1/1;
          border-radius:24px;
          overflow:hidden;
          display:grid;
          place-items:center;
          background:rgba(255,255,255,.08);
          color:var(--ma-accent);
        }
        .simple-wizard-review-art img {
          width:100%;
          height:100%;
          object-fit:cover;
          display:block;
        }
        .simple-wizard-review-kicker {
          color:color-mix(in srgb, var(--ma-accent) 78%, #fff 18%);
          font-size:13px;
          font-weight:900;
        }
        .simple-wizard-review-title {
          min-width:0;
          overflow:hidden;
          text-overflow:ellipsis;
          display:-webkit-box;
          -webkit-line-clamp:2;
          -webkit-box-orient:vertical;
          color:#fff;
          font-size:24px;
          line-height:1.12;
          font-weight:950;
        }
        .simple-wizard-review-sub {
          min-width:0;
          overflow:hidden;
          text-overflow:ellipsis;
          white-space:nowrap;
          color:rgba(255,255,255,.7);
          font-size:14px;
          font-weight:750;
        }
        .simple-wizard-section-head {
          min-width:0;
          display:flex;
          align-items:end;
          justify-content:space-between;
          gap:10px;
          color:#fff;
          padding:0 2px;
        }
        .simple-wizard-section-head span {
          font-size:18px;
          font-weight:950;
        }
        .simple-wizard-section-head small {
          min-width:0;
          color:rgba(255,255,255,.6);
          font-size:12px;
          font-weight:800;
          text-align:end;
        }
        .simple-wizard-result-grid {
          display:grid;
          grid-template-columns:repeat(2, minmax(0, 1fr));
          gap:12px;
        }
        .simple-wizard-result {
          min-width:0;
          width:100%;
          min-height:112px;
          display:grid;
          grid-template-columns:76px minmax(0,1fr) 34px;
          align-items:center;
          gap:12px;
          padding:12px;
          border-radius:24px;
          border:1px solid rgba(255,255,255,.13);
          background:
            linear-gradient(145deg, rgba(255,255,255,.115), rgba(255,255,255,.045)),
            radial-gradient(circle at 16% 16%, rgba(255,255,255,.08), transparent 42%);
          color:#fff;
          text-align:inherit;
          box-shadow:inset 0 1px 0 rgba(255,255,255,.08), 0 20px 36px rgba(0,0,0,.16);
          transition:transform .16s ease, border-color .16s ease, background .16s ease, box-shadow .16s ease;
        }
        .simple-wizard-result.active {
          border-color:color-mix(in srgb, var(--ma-accent) 48%, transparent);
          background:
            linear-gradient(145deg, color-mix(in srgb, var(--ma-accent) 21%, rgba(255,255,255,.095)), rgba(255,255,255,.055)),
            radial-gradient(circle at 18% 14%, color-mix(in srgb, var(--ma-accent) 24%, transparent), transparent 48%);
          box-shadow:0 22px 42px color-mix(in srgb, var(--ma-accent) 18%, rgba(0,0,0,.18));
        }
        .simple-wizard-result-art {
          width:76px;
          aspect-ratio:1/1;
          display:grid;
          place-items:center;
          overflow:hidden;
          border-radius:22px;
          background:rgba(255,255,255,.08);
          border:1px solid rgba(255,255,255,.12);
          color:var(--ma-accent);
        }
        .simple-wizard-result-art img {
          width:100%;
          height:100%;
          object-fit:cover;
          display:block;
        }
        .simple-wizard-result-art .ui-ic {
          width:28px;
          height:28px;
        }
        .simple-wizard-result-copy {
          min-width:0;
          display:grid;
          gap:4px;
        }
        .simple-wizard-result-kicker {
          color:color-mix(in srgb, var(--ma-accent) 78%, #fff 16%);
          font-size:12px;
          font-weight:900;
        }
        .simple-wizard-result-title {
          min-width:0;
          overflow:hidden;
          text-overflow:ellipsis;
          display:-webkit-box;
          -webkit-line-clamp:2;
          -webkit-box-orient:vertical;
          color:#fff;
          font-size:17px;
          line-height:1.16;
          font-weight:950;
        }
        .simple-wizard-result-sub {
          min-width:0;
          overflow:hidden;
          text-overflow:ellipsis;
          white-space:nowrap;
          color:rgba(255,255,255,.65);
          font-size:12px;
          font-weight:760;
        }
        .simple-wizard-result-check {
          width:34px;
          height:34px;
          display:grid;
          place-items:center;
          border-radius:14px;
          background:rgba(255,255,255,.08);
          color:rgba(255,255,255,.78);
        }
        .simple-wizard-result.active .simple-wizard-result-check {
          background:color-mix(in srgb, var(--ma-accent) 72%, rgba(255,255,255,.16));
          color:#fff;
        }
        .simple-wizard-result-check .ui-ic {
          width:18px;
          height:18px;
        }
        .simple-wizard-candidates {
          display:flex;
          gap:8px;
          overflow:auto;
          padding-bottom:2px;
          scrollbar-width:none;
        }
        .simple-wizard-candidates::-webkit-scrollbar { display:none; }
        .simple-wizard-candidate {
          flex:0 0 auto;
          max-width:190px;
          min-height:42px;
          padding:0 14px;
          border-radius:16px;
          border:1px solid rgba(255,255,255,.12);
          background:rgba(255,255,255,.07);
          color:#fff;
          font-size:13px;
          font-weight:850;
        }
        .simple-wizard-candidate span {
          display:block;
          overflow:hidden;
          text-overflow:ellipsis;
          white-space:nowrap;
        }
        .simple-wizard-candidate.active {
          border-color:color-mix(in srgb, var(--ma-accent) 42%, transparent);
          background:color-mix(in srgb, var(--ma-accent) 18%, rgba(255,255,255,.08));
        }
        .surprise-popup.simple-wizard-popup {
          z-index:92;
        }
        .simple-wizard-popup-card {
          width:min(300px, calc(100% - 28px));
        }
        .theme-light .simple-wizard-progress-step,
        .theme-light .simple-wizard-player,
        .theme-light .simple-wizard-option,
        .theme-light .simple-wizard-source,
        .theme-light .simple-wizard-search input,
        .theme-light .simple-wizard-secondary,
        .theme-light .simple-wizard-reset-btn,
        .theme-light .simple-wizard-result,
        .theme-light .simple-wizard-candidate {
          background:rgba(255,255,255,.84);
          border-color:rgba(147,161,183,.2);
          color:#16202d;
          box-shadow:0 14px 28px rgba(110,127,153,.12);
        }
        .theme-light .simple-wizard-title,
        .theme-light .simple-wizard-option-title,
        .theme-light .simple-wizard-review-title,
        .theme-light .simple-wizard-section-head,
        .theme-light .simple-wizard-result-title {
          color:#16202d;
        }
        .theme-light .simple-wizard-option-sub,
        .theme-light .simple-wizard-review-sub,
        .theme-light .simple-wizard-section-head small,
        .theme-light .simple-wizard-result-sub,
        .theme-light .simple-wizard-search {
          color:#5f6c80;
        }
        .theme-light .simple-wizard-footer {
          background:linear-gradient(180deg, transparent, rgba(248,250,253,.9) 30%, rgba(248,250,253,.96));
        }
        @media (max-width:560px) {
          .simple-wizard-player-grid,
          .simple-wizard-option-grid,
          .simple-wizard-source-grid,
          .simple-wizard-result-grid {
            grid-template-columns:minmax(0,1fr);
          }
          .simple-wizard-toolbar {
            justify-content:stretch;
          }
          .simple-wizard-reset-btn {
            width:100%;
          }
          .simple-wizard-review-card {
            grid-template-columns:82px minmax(0,1fr);
          }
          .simple-wizard-result {
            grid-template-columns:66px minmax(0,1fr) 32px;
            min-height:94px;
            border-radius:22px;
          }
          .simple-wizard-result-art {
            width:66px;
            border-radius:19px;
          }
          .simple-wizard-review-art {
            width:82px;
            border-radius:20px;
          }
          .simple-wizard-review-title {
            font-size:20px;
          }
          .simple-wizard-footer.triple {
            grid-template-columns:minmax(0,1fr);
          }
        }
        .theme-light .action-tile {
          background:
            linear-gradient(145deg, rgba(255,255,255,.92), rgba(246,249,252,.84)),
            radial-gradient(circle at 18% 18%, color-mix(in srgb, var(--ma-accent) 16%, transparent), transparent 42%);
          border-color:rgba(147,161,183,.18);
          box-shadow:0 18px 32px rgba(110,127,153,.14);
        }
        .theme-light .action-tile-kicker {
          color:#8b97a8;
        }
        .menu-body.sheet-actions .theme-light .action-tile .menu-item-sub,
        .theme-light .menu-body.sheet-actions .action-tile .menu-item-sub {
          color:#5a6679;
        }
        .theme-light .action-tile-arrow {
          color:#8a96a8;
        }
        .menu-item-ico,.menu-thumb,.media-category-ico {
          width:48px;
          height:48px;
          border-radius:16px;
          overflow:hidden;
          flex-shrink:0;
          display:grid;
          place-items:center;
          background:linear-gradient(135deg, color-mix(in srgb, var(--ma-accent) 24%, transparent), color-mix(in srgb, var(--ma-accent) 12%, transparent));
          border:1px solid color-mix(in srgb, var(--ma-accent) 24%, transparent);
          color:var(--ma-accent);
        }
        .menu-item-ico .ui-ic { width:46%; height:46%; }
        .menu-thumb img { width:100%; height:100%; object-fit:cover; display:block; }
        .media-entry .menu-thumb img { object-fit:contain; object-position:center; }
        .player-thumb { position:relative; overflow:visible; }
        .player-thumb img { border-radius:inherit; }
        .player-group-badge {
          min-width:22px;
          height:22px;
          padding:0 6px;
          border-radius:999px;
          display:inline-flex;
          align-items:center;
          justify-content:center;
          background:linear-gradient(135deg, var(--ma-accent), color-mix(in srgb, var(--ma-accent) 72%, white 28%));
          color:#18120a;
          font-size:12px;
          line-height:1;
          font-weight:950;
          box-shadow:0 8px 18px color-mix(in srgb, var(--ma-accent) 24%, transparent);
          flex-shrink:0;
        }
        .player-thumb .player-group-badge {
          position:absolute;
          inset-inline-end:-7px;
          inset-block-start:-7px;
          z-index:2;
        }
        .player-focus-badge,
        .library-focus-badge {
          height:20px;
          min-width:20px;
          font-size:11px;
        }
        .menu-item-title,.queue-title { display:block; max-width:100%; font-size:16px; font-weight:800; line-height:1.25; white-space:normal; overflow:hidden; text-overflow:ellipsis; display:-webkit-box; -webkit-box-orient:vertical; -webkit-line-clamp:2; }
        .menu-item-sub,.queue-sub { display:block; max-width:100%; margin-top:4px; font-size:12px; color:rgba(255,255,255,.72); line-height:1.25; white-space:normal; overflow:hidden; text-overflow:ellipsis; display:-webkit-box; -webkit-box-orient:vertical; -webkit-line-clamp:2; }
        .menu-body .menu-item-sub,
        .menu-body .queue-sub { display:none !important; }
        .menu-item.active,.menu-list-item.active {
          border-color:color-mix(in srgb, var(--ma-accent) 28%, transparent);
          background:color-mix(in srgb, var(--ma-accent) 12%, transparent);
        }
        .menu-list-item.tap-feedback,
        .queue-row.tap-feedback {
          transform:translateY(-2px) scale(.988);
          border-color:color-mix(in srgb, var(--ma-accent) 34%, transparent);
          box-shadow:0 12px 30px color-mix(in srgb, var(--ma-accent) 16%, transparent);
        }
        .media-entry,
        .media-category-row,
        .radio-country-entry,
        .media-detail-hero,
        .library-nav-btn,
        .media-layout-btn,
        .media-detail-action-btn,
        .media-detail-play-btn,
        .media-detail-nav-btn,
        .artist-hero-icon-btn,
        .radio-stage-fab,
        .library-tab-search-submit,
        .library-tab-search-clear,
        .library-player-focus {
          position:relative;
        }
        `;
}
