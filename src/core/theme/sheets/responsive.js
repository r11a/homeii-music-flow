// responsive styles. Order is preserved by card-styles.js.
export default function() {
  return `.toast-icon {
          width:24px;
          height:24px;
          border-radius:999px;
          display:grid;
          place-items:center;
          font-weight:900;
          flex-shrink:0;
          background:rgba(255,255,255,.12);
        }
        .toast-text { min-width:0; flex:1; line-height:1.35; font-weight:800; }
        .toast-ack {
          border:1px solid rgba(255,255,255,.22);
          border-radius:999px;
          padding:6px 10px;
          color:inherit;
          background:rgba(255,255,255,.13);
          font-size:11px;
          font-weight:900;
          cursor:pointer;
        }
        .toast-ack:hover { background:rgba(255,255,255,.2); }
        .toast.success { border-color:rgba(102,211,138,.28); background:rgba(22,45,34,.9); }
        .toast.success .toast-icon { color:#dff8e7; background:rgba(102,211,138,.26); }
        .toast.error { border-color:rgba(255,112,112,.28); background:rgba(58,24,28,.9); }
        .toast.error .toast-icon { color:#ffe3e3; background:rgba(255,112,112,.24); }
        @keyframes toastIn {
          from { transform:translateY(8px) scale(.98); opacity:0; }
          to { transform:translateY(0) scale(1); opacity:1; }
        }
        .theme-light .toast {
          color:#1f2633;
          background:rgba(255,255,255,.88);
          border-color:rgba(141,155,177,.22);
        }
        .theme-light .toast.success { background:rgba(237,252,242,.94); border-color:rgba(75,181,111,.26); }
        .theme-light .toast.error { background:rgba(255,241,241,.94); border-color:rgba(218,82,82,.24); }
        .hidden-tools { display:none !important; }
        .homeii-local-audio { position:absolute; width:1px; height:1px; opacity:0; pointer-events:none; inset:auto auto 0 0; }
        .rtl .player-chip,.rtl .menu-item-main,.rtl .menu-list-item,.rtl .queue-row,.rtl .media-category-row,.rtl .media-search-shell { direction:rtl; }
        .rtl .controls,.rtl .accent-row,.rtl .time-row,.rtl .queue-actions { direction:ltr; }
        .rtl .media-search-shell input {
          text-align:right;
        }
        .card:not(.rtl) .media-search-shell input {
          direction:ltr;
          text-align:left;
        }
        @media (max-width:600px) {
          .card {
            border-radius:22px;
            height:var(--mobile-height);
            min-height:min(var(--mobile-min-height), var(--mobile-height));
            max-height:var(--mobile-height);
          }
          .stage {
            gap:8px;
            grid-template-rows:minmax(0,1fr) auto auto;
            padding:max(12px, env(safe-area-inset-top)) max(12px, env(safe-area-inset-right)) max(10px, env(safe-area-inset-bottom)) max(12px, env(safe-area-inset-left));
          }
          .player-chip { padding:0 2px; }
          .player-focus {
            margin-top:0;
            max-width:min(calc(100% - 28px), 360px);
            min-height:32px;
            padding:6px 10px;
            border-radius:16px;
            gap:8px;
          }
          .player-focus-copy { gap:6px; }
          .player-focus-tags { min-height:0; gap:4px; flex-wrap:nowrap; }
          .player-focus-pill { min-height:18px; padding:0 7px; font-size:calc(9px * var(--v2-font-scale)); }
          .player-focus-name { font-size:calc(11px * var(--v2-font-scale)); max-width:min(46cqi, 180px); }
          .hero-mobile-top { margin-bottom:4px; }
          .hero-split-shell { gap:12px; }
          .hero-info { gap:10px; }
          .hero-copy { gap:4px; margin-top:0; }
          .hero-title { font-size:calc(18px * var(--v2-font-scale)); line-height:1.08; }
          .hero-sub { font-size:calc(12px * var(--v2-font-scale)); margin-top:0; }
          .hero-top { padding-bottom:0; }
          .center { margin-top:0; gap:8px; }
          .art-stage { width:100%; padding:0; gap:6px; }
          .art-stack-view,
          .art-stack-viewport,
          .art-stack-container { height:var(--flow-art-stack-height); min-height:var(--flow-art-stack-height); max-height:var(--flow-art-stack-height); }
          .art-stack-slide { width:74%; }
          .art-stack-slide.center { width:78%; }
          .art-stack-slide.prev,
          .art-stack-slide.next { width:56%; }
          .mobile-art-shell { width:min(var(--flow-mobile-art-size), calc(100% - 28px)); border-radius:0; padding:0; }
          .card.empty-media .mobile-art-shell { width:min(174px, 44cqi); height:min(174px, 44cqi); display:grid; place-items:center; border-radius:999px; overflow:visible; background:transparent; border:none; box-shadow:none; }
          .card.radio-media.empty-media .mobile-art-shell { width:min(292px, 72cqi); height:min(292px, 72cqi); border-radius:24px; }
          .card.empty-media .art-stack-view,
          .card.empty-media .art-stack-viewport,
          .card.empty-media .art-stack-container { width:100%; height:100%; min-height:100%; display:grid; place-items:center; overflow:visible; background:transparent; border:none; box-shadow:none; }
          .card.empty-media .surprise-me-card.magic-empty { width:min(168px, 42cqi); height:min(168px, 42cqi); border-radius:999px; overflow:hidden; }
          .card.empty-media .surprise-me-card.magic-empty.has-art { width:100%; height:100%; border-radius:22px; }
          .np-art.mobile-art { border-radius:22px; }
          .mobile-art-actions { width:auto; margin-top:0; padding:0; gap:8px; }
          .mobile-art-fab { width:38px; min-width:38px; height:38px; border-radius:999px; }
          .bottom { gap:8px; }
          .progress-line { gap:12px; margin-top:4px; }
          .controls { gap:10px; margin-top:4px; flex-wrap:nowrap; }
          .side-btn,.volume-btn { width:var(--flow-side-btn-size); height:var(--flow-side-btn-size); border-radius:18px; flex:0 0 auto; }
          .side-btn.minor-btn { width:var(--flow-minor-btn-size); height:var(--flow-minor-btn-size); border-radius:16px; flex:0 0 auto; }
          .main-btn { width:var(--flow-main-btn-size); height:var(--flow-main-btn-size); flex:0 0 auto; }
          .mobile-volume-inline { margin-top:4px; gap:10px; }
          .footer-nav { gap:8px; margin-top:6px; padding:8px; border-radius:18px; }
          .footer-btn { min-height:52px; border-radius:16px; font-size:calc(10px * var(--v2-font-scale)); gap:4px; }
          .footer-btn .ui-ic { width:20px; height:20px; }
          .empty-quick-shelf { gap:10px; padding:8px var(--empty-quick-edge-fade) 10px; }
          .empty-quick-card { min-width:172px; max-width:172px; min-height:68px; }
          .library-nav { gap:6px; padding:6px; border-radius:18px; }
          .library-nav-btn { min-height:48px; border-radius:14px; }
          .menu-sheet { border-radius:24px; }
          .menu-sheet.sheet-actions,
          .menu-sheet.sheet-schedules {
            width:100%;
            height:calc(100% - 4px);
            max-height:calc(100% - 4px);
            margin-top:0;
            border-radius:24px;
          }
          .menu-backdrop {
            padding:max(36px, env(safe-area-inset-top)) max(10px, env(safe-area-inset-right)) max(12px, env(safe-area-inset-bottom)) max(10px, env(safe-area-inset-left));
          }
          .menu-body.sheet-actions,
          .menu-body.sheet-schedules {
            padding:16px 12px 20px;
          }
          .menu-body.sheet-actions .action-grid {
            gap:12px;
          }
          .menu-body { padding:14px; }
          .media-search-zone {
            padding-bottom:8px;
          }
          .queue-list {
            gap:14px;
          }
          .media-items-list {
            gap:14px;
          }
          .media-items-list.layout-grid {
            --media-grid-thumb-size:var(--flow-media-grid-thumb);
            grid-template-columns:repeat(2, minmax(0, 1fr));
          }
          .media-entry.list {
            min-height:88px;
            padding:16px 14px;
          }
          .media-entry.grid {
            padding:11px 10px 13px;
            min-height:calc(var(--media-grid-thumb-size, 174px) + 58px);
            border-radius:22px;
          }
          .queue-row {
            grid-template-columns:18px 44px minmax(0,1fr) auto;
            min-height:58px;
            padding:8px 10px;
            row-gap:0;
            column-gap:7px;
          }
          .queue-index {
            width:18px;
          }
          .queue-row .menu-thumb {
            width:40px;
            height:40px;
            border-radius:14px;
          }
          .queue-actions .chip-btn { min-width:32px; min-height:32px; width:32px; border-radius:11px; }
          .group-actions { grid-template-columns:repeat(2, minmax(0, 1fr)); }
        }
        .card.height-short .stage {
          gap:6px;
          min-height:0;
        }
        .card.height-short .center,
        .card.height-short .bottom,
        .card.height-short .tablet-main {
          gap:6px !important;
          min-height:0;
        }
        .card.height-short .hero-split-shell,
        .card.height-short .hero-visual,
        .card.height-short .hero-info,
        .card.height-short .art-stage {
          min-height:0;
        }
        .card.height-short .hero-copy {
          gap:4px;
          min-width:0;
        }
        .card.height-short .hero-title,
        .card.height-short .hero-sub {
          display:-webkit-box;
          -webkit-box-orient:vertical;
          overflow:hidden;
        }
        .card.height-short .hero-title {
          -webkit-line-clamp:1;
          line-height:1.04;
        }
        .card.height-short .hero-sub {
          -webkit-line-clamp:1;
        }
        .card.height-short .progress-line {
          margin-top:0 !important;
        }
        .card.height-short .controls {
          gap:8px !important;
          margin-top:0 !important;
        }
        .card.height-short .mobile-volume-inline {
          margin-top:0 !important;
        }
        .card.height-short:not(.layout-tablet) .footer-nav {
          gap:6px !important;
          margin-top:2px !important;
          padding:6px !important;
          border-radius:16px !important;
        }
        .card.height-short:not(.layout-tablet) .footer-btn {
          min-height:42px !important;
          padding:6px !important;
          border-radius:14px !important;
        }
        .card.height-short:not(.layout-tablet) .footer-btn-label {
          display:none !important;
        }
        .card.height-short:not(.layout-tablet) .mobile-volume-inline {
          gap:8px !important;
        }
        .card.height-short.layout-tablet .footer-nav {
          gap:8px !important;
        }
        .card.height-short.layout-tablet .footer-btn {
          min-height:56px !important;
          border-radius:18px !important;
        }
        .card.height-short.layout-tablet .player-focus {
          min-height:58px !important;
          padding:8px !important;
        }
        .card.aspect-wide:not(.layout-tablet) {
          --flow-stage-pad-block:8px;
          --flow-stage-pad-inline:10px;
          --flow-hero-gap:14px;
          --flow-side-btn-size:42px;
          --flow-minor-btn-size:36px;
          --flow-main-btn-size:72px;
          --flow-mobile-art-size:clamp(156px, min(42cqi, var(--flow-mobile-art-budget)), 360px);
          --flow-art-stack-height:var(--flow-mobile-art-size);
          --flow-art-card-size:var(--flow-mobile-art-size);
        }
        .card.aspect-wide:not(.layout-tablet) > .mobile-brand-signature,
        .card.aspect-wide:not(.layout-tablet) .hero-mobile-top {
          display:none !important;
        }
        .card.aspect-wide:not(.layout-tablet) .stage {
          grid-template-rows:minmax(0,1fr) auto auto !important;
          gap:6px !important;
          min-height:0;
        }
        .card.aspect-wide:not(.layout-tablet) .center {
          justify-content:center;
          min-height:0;
          overflow:hidden;
        }
        .card.aspect-wide:not(.layout-tablet) .hero-split-shell {
          width:100%;
          max-width:min(980px, 100%);
          display:grid;
          grid-template-columns:minmax(180px, 1.16fr) minmax(0, .84fr);
          gap:14px !important;
          align-items:center;
        }
        .card.aspect-wide:not(.layout-tablet).rtl .hero-split-shell {
          direction:rtl;
        }
        .card.aspect-wide:not(.layout-tablet) .hero-info,
        .card.aspect-wide:not(.layout-tablet) .hero-copy {
          justify-items:start;
          text-align:start;
          max-width:100%;
          gap:6px;
        }
        .card.aspect-wide:not(.layout-tablet).rtl .hero-info,
        .card.aspect-wide:not(.layout-tablet).rtl .hero-copy {
          text-align:right;
        }
        .card.aspect-wide:not(.layout-tablet) .hero-title {
          font-size:calc(22px * var(--v2-font-scale));
          line-height:1.04;
          -webkit-line-clamp:2;
        }
        .card.aspect-wide:not(.layout-tablet) .hero-sub {
          font-size:calc(12px * var(--v2-font-scale));
          -webkit-line-clamp:1;
        }
        .card.aspect-wide:not(.layout-tablet) .art-stage,
        .card.aspect-wide:not(.layout-tablet) .hero-visual {
          min-height:0;
          width:100%;
        }
        .card.aspect-wide:not(.layout-tablet) .mobile-art-shell {
          width:var(--flow-mobile-art-size) !important;
          max-width:100% !important;
        }
        .card.aspect-wide:not(.layout-tablet) .art-stack-view,
        .card.aspect-wide:not(.layout-tablet) .art-stack-viewport,
        .card.aspect-wide:not(.layout-tablet) .art-stack-container {
          height:var(--flow-mobile-art-size) !important;
          min-height:var(--flow-mobile-art-size) !important;
          max-height:var(--flow-mobile-art-size) !important;
        }
        .card.aspect-wide:not(.layout-tablet) .mobile-art-actions {
          justify-content:flex-start !important;
          gap:6px !important;
          flex-wrap:nowrap !important;
          overflow:hidden;
        }
        .card.aspect-wide:not(.layout-tablet) .mobile-art-fab,
        .card.aspect-wide:not(.layout-tablet) .mobile-art-actions .history-toggle-fab,
        .card.aspect-wide:not(.layout-tablet) .mobile-timer-fab {
          width:34px !important;
          min-width:34px !important;
          height:34px !important;
        }
        .card.aspect-wide:not(.layout-tablet) .bottom {
          gap:5px !important;
          align-content:end;
        }
        .card.aspect-wide:not(.layout-tablet) .progress-line {
          gap:8px !important;
          margin-top:0 !important;
        }
        .card.aspect-wide:not(.layout-tablet) .progress-time {
          min-width:34px;
          font-size:11px;
        }
        .card.aspect-wide:not(.layout-tablet) .controls {
          gap:8px !important;
          margin-top:0 !important;
        }
        .card.aspect-wide:not(.layout-tablet) .mobile-volume-inline {
          display:grid !important;
          width:min(100%, 540px);
          margin:1px auto 0 !important;
          gap:8px !important;
        }
        .card.aspect-wide:not(.layout-tablet) .footer-nav {
          display:flex !important;
          width:max-content !important;
          max-width:min(100%, 560px) !important;
          min-width:0 !important;
          margin:2px auto 0 !important;
          padding:6px !important;
          gap:6px !important;
          border-radius:16px !important;
          justify-content:flex-start !important;
          align-items:center !important;
          overflow-x:auto !important;
          overflow-y:hidden !important;
          -webkit-overflow-scrolling:touch;
          scrollbar-width:none;
        }
        .card.aspect-wide:not(.layout-tablet) .footer-nav::-webkit-scrollbar {
          display:none;
        }
        .card.aspect-wide:not(.layout-tablet) .footer-btn {
          flex:0 0 42px !important;
          width:42px !important;
          min-width:42px !important;
          min-height:40px !important;
          height:40px !important;
          padding:6px !important;
          border-radius:14px !important;
        }
        .card.aspect-wide:not(.layout-tablet) .footer-btn .ui-ic {
          width:20px !important;
          height:20px !important;
        }
        .card.aspect-wide:not(.layout-tablet) .footer-nav.count-1,
        .card.aspect-wide:not(.layout-tablet) .footer-nav.count-2,
        .card.aspect-wide:not(.layout-tablet) .footer-nav.count-3,
        .card.aspect-wide:not(.layout-tablet) .footer-nav.count-4 {
          justify-content:center !important;
        }
        .card.aspect-wide:not(.layout-tablet) .footer-btn-label {
          display:none !important;
        }
        .card.aspect-wide:not(.layout-tablet) .menu-backdrop.open {
          align-items:stretch !important;
          justify-content:center !important;
          padding:max(10px, env(safe-area-inset-top)) max(10px, env(safe-area-inset-right)) max(10px, env(safe-area-inset-bottom)) max(10px, env(safe-area-inset-left)) !important;
        }
        .card.aspect-wide:not(.layout-tablet) .menu-sheet.sheet-actions,
        .card.aspect-wide:not(.layout-tablet) .menu-sheet.sheet-library,
        .card.aspect-wide:not(.layout-tablet) .menu-sheet.sheet-search,
        .card.aspect-wide:not(.layout-tablet) .menu-sheet.sheet-players,
        .card.aspect-wide:not(.layout-tablet) .menu-sheet.sheet-settings,
        .card.aspect-wide:not(.layout-tablet) .menu-sheet.sheet-queue {
          width:min(980px, calc(100% - 20px)) !important;
          max-width:min(980px, calc(100% - 20px)) !important;
          height:calc(100% - 20px) !important;
          max-height:calc(100% - 20px) !important;
          margin:auto !important;
          border-radius:22px !important;
        }
        .card.aspect-wide:not(.layout-tablet) .menu-body {
          overflow:auto !important;
          -webkit-overflow-scrolling:touch;
        }
        .card.aspect-wide:not(.layout-tablet) .menu-body.sheet-actions .action-grid {
          grid-template-columns:repeat(auto-fit, minmax(min(100%, 190px), 1fr)) !important;
          gap:12px !important;
        }
        .card.aspect-wide:not(.layout-tablet) .menu-body.sheet-actions .action-tile {
          min-width:0 !important;
          min-height:118px !important;
        }
        .card.aspect-wide:not(.layout-tablet) .menu-body.sheet-actions .action-tile .menu-item-main {
          grid-template-columns:58px minmax(0, 1fr) !important;
          gap:12px !important;
          padding:13px 14px !important;
        }
        .card.aspect-wide:not(.layout-tablet) .menu-body.sheet-actions .action-tile .menu-item-title,
        .card.aspect-wide:not(.layout-tablet) .menu-body.sheet-actions .action-tile .menu-item-sub {
          display:block !important;
          white-space:normal !important;
          overflow:visible !important;
          text-overflow:clip !important;
          overflow-wrap:anywhere !important;
        }
        .card.aspect-wide:not(.layout-tablet) .menu-body.sheet-actions .action-tile .menu-item-title {
          font-size:calc(16px * var(--v2-font-scale)) !important;
          line-height:1.16 !important;
          letter-spacing:0 !important;
        }
        .card.aspect-wide:not(.layout-tablet) .menu-body.sheet-actions .action-tile .menu-item-sub {
          font-size:calc(12px * var(--v2-font-scale)) !important;
          line-height:1.28 !important;
        }
        .card.aspect-wide:not(.layout-tablet) .media-items-list.layout-grid {
          grid-template-columns:repeat(auto-fill, minmax(118px, 1fr)) !important;
        }
        .card.height-tight:not(.layout-tablet) > .mobile-brand-signature,
        .card.height-tight:not(.layout-tablet) .hero-mobile-top {
          display:none !important;
        }
        .card.height-tight:not(.layout-tablet) .stage {
          grid-template-rows:minmax(0,1fr) auto auto !important;
        }
        .card.height-tight:not(.layout-tablet) .center {
          justify-content:center;
          overflow:hidden;
        }
        .card.height-tight:not(.layout-tablet) .hero-split-shell {
          width:100%;
          max-width:min(820px, 100%);
          display:grid;
          grid-template-columns:minmax(136px, 1.08fr) minmax(0, .92fr);
          gap:12px !important;
          align-items:center;
        }
        .card.height-tight:not(.layout-tablet).rtl .hero-split-shell {
          direction:rtl;
        }
        .card.height-tight:not(.layout-tablet) .hero-info,
        .card.height-tight:not(.layout-tablet) .hero-copy {
          justify-items:start;
          text-align:start;
          max-width:100%;
        }
        .card.height-tight:not(.layout-tablet).rtl .hero-info,
        .card.height-tight:not(.layout-tablet).rtl .hero-copy {
          text-align:right;
        }
        .card.height-tight:not(.layout-tablet) .art-stack-view,
        .card.height-tight:not(.layout-tablet) .art-stack-viewport,
        .card.height-tight:not(.layout-tablet) .art-stack-container {
          height:min(var(--flow-art-stack-height), 48dvh) !important;
          min-height:min(var(--flow-art-stack-height), 48dvh) !important;
          max-height:min(var(--flow-art-stack-height), 48dvh) !important;
        }
        .card.height-tight:not(.layout-tablet) .mobile-art-shell {
          width:min(270px, 46cqi, clamp(124px, calc(var(--flow-available-height) - 150px), 270px)) !important;
        }
        .card.height-tight:not(.layout-tablet) .mobile-art-actions {
          justify-content:flex-start !important;
          gap:6px !important;
          flex-wrap:nowrap !important;
          overflow:hidden;
        }
        .card.height-tight:not(.layout-tablet) .mobile-art-fab {
          width:34px !important;
          min-width:34px !important;
          height:34px !important;
        }
        .card.height-tight:not(.layout-tablet) .bottom {
          align-content:end;
        }
        .card.height-tight:not(.layout-tablet) .progress-time {
          min-width:34px;
          font-size:11px;
        }
        .card.height-tight:not(.layout-tablet) .mobile-volume-inline {
          display:grid !important;
          width:min(100%, 520px);
          margin:1px auto 0 !important;
          gap:7px !important;
        }
        .card.height-tight:not(.layout-tablet) .footer-nav {
          display:flex !important;
          width:max-content !important;
          max-width:min(100%, 540px) !important;
          min-width:0 !important;
          margin:2px auto 0 !important;
          padding:5px !important;
          gap:5px !important;
          border-radius:15px !important;
          justify-content:flex-start !important;
          align-items:center !important;
          overflow-x:auto !important;
          overflow-y:hidden !important;
          -webkit-overflow-scrolling:touch;
          scrollbar-width:none;
        }
        .card.height-tight:not(.layout-tablet) .footer-nav::-webkit-scrollbar {
          display:none;
        }
        .card.height-tight:not(.layout-tablet) .footer-btn {
          flex:0 0 40px !important;
          width:40px !important;
          min-width:40px !important;
          min-height:38px !important;
          height:38px !important;
          padding:5px !important;
          border-radius:13px !important;
        }
        .card.height-tight:not(.layout-tablet) .footer-btn .ui-ic {
          width:19px !important;
          height:19px !important;
        }
        .card.height-tight:not(.layout-tablet) .footer-nav.count-1,
        .card.height-tight:not(.layout-tablet) .footer-nav.count-2,
        .card.height-tight:not(.layout-tablet) .footer-nav.count-3,
        .card.height-tight:not(.layout-tablet) .footer-nav.count-4 {
          justify-content:center !important;
        }
        .card.height-tight:not(.layout-tablet) .footer-btn-label {
          display:none !important;
        }
        .card.height-tight:not(.layout-tablet) .menu-backdrop.open {
          align-items:stretch !important;
          justify-content:center !important;
          padding:max(8px, env(safe-area-inset-top)) max(8px, env(safe-area-inset-right)) max(8px, env(safe-area-inset-bottom)) max(8px, env(safe-area-inset-left)) !important;
        }
        .card.height-tight:not(.layout-tablet) .menu-sheet.sheet-actions,
        .card.height-tight:not(.layout-tablet) .menu-sheet.sheet-library,
        .card.height-tight:not(.layout-tablet) .menu-sheet.sheet-search,
        .card.height-tight:not(.layout-tablet) .menu-sheet.sheet-players,
        .card.height-tight:not(.layout-tablet) .menu-sheet.sheet-settings,
        .card.height-tight:not(.layout-tablet) .menu-sheet.sheet-queue {
          width:min(960px, calc(100% - 16px)) !important;
          max-width:min(960px, calc(100% - 16px)) !important;
          height:calc(100% - 16px) !important;
          max-height:calc(100% - 16px) !important;
          margin:auto !important;
          border-radius:20px !important;
        }
        .card.height-tight:not(.layout-tablet) .menu-body {
          overflow:auto !important;
          -webkit-overflow-scrolling:touch;
        }
        .card.height-tight:not(.layout-tablet) .menu-body.sheet-actions .action-grid {
          grid-template-columns:repeat(auto-fit, minmax(min(100%, 168px), 1fr)) !important;
          gap:10px !important;
        }
        .card.height-tight:not(.layout-tablet) .menu-body.sheet-actions .action-tile {
          min-width:0 !important;
          min-height:108px !important;
        }
        .card.height-tight:not(.layout-tablet) .menu-body.sheet-actions .action-tile .menu-item-main {
          grid-template-columns:52px minmax(0, 1fr) !important;
          gap:10px !important;
          padding:12px !important;
        }
        .card.height-tight:not(.layout-tablet) .menu-body.sheet-actions .action-tile .menu-item-ico {
          width:52px !important;
          height:52px !important;
          border-radius:17px !important;
        }
        .card.height-tight:not(.layout-tablet) .menu-body.sheet-actions .action-tile .menu-item-title,
        .card.height-tight:not(.layout-tablet) .menu-body.sheet-actions .action-tile .menu-item-sub {
          display:block !important;
          white-space:normal !important;
          overflow:visible !important;
          text-overflow:clip !important;
          overflow-wrap:anywhere !important;
        }
        .card.height-tight:not(.layout-tablet) .menu-body.sheet-actions .action-tile .menu-item-title {
          font-size:calc(15px * var(--v2-font-scale)) !important;
          line-height:1.16 !important;
          letter-spacing:0 !important;
        }
        .card.height-tight:not(.layout-tablet) .menu-body.sheet-actions .action-tile .menu-item-sub {
          font-size:calc(11px * var(--v2-font-scale)) !important;
          line-height:1.24 !important;
        }
        .card.height-tight:not(.layout-tablet) .media-items-list.layout-grid {
          grid-template-columns:repeat(auto-fill, minmax(108px, 1fr)) !important;
        }
        .card.height-tight.layout-tablet .tablet-shell {
          gap:10px !important;
        }
        .card.height-tight.layout-tablet .footer-nav {
          gap:6px !important;
        }
        .card.height-tight.layout-tablet .footer-btn {
          min-height:42px !important;
          padding:6px !important;
          border-radius:16px !important;
        }
        .card.height-tight.layout-tablet .footer-btn-label {
          display:none !important;
        }
        .card.height-tight.layout-tablet .player-focus {
          min-height:44px !important;
          padding:6px !important;
          gap:6px !important;
        }
        .card.height-tight.layout-tablet .player-focus-art {
          width:32px !important;
          height:32px !important;
        }
        .card.height-tight .hero-up-next,
        .card.height-tight .night-quick-row {
          display:none !important;
        }
      .mobile-volume-inline .volume-btn .ui-ic{width:20px;height:20px;}
.card:not(.layout-tablet) .mobile-volume-inline{grid-template-columns:auto minmax(0,1fr) auto auto;gap:10px;align-items:center;}
.card:not(.layout-tablet) .mobile-volume-inline .volume-value{order:1;min-width:46px;text-align:center;}
.card:not(.layout-tablet) .mobile-volume-inline .tablet-volume-track{order:2;}
.card:not(.layout-tablet) .mobile-volume-inline .volume-btn{order:3;width:38px;height:38px;border-radius:999px;}
.group-volume-btn[hidden]{display:none!important;}
.card:not(.layout-tablet) .mobile-volume-inline .volume-btn.active{background:rgba(170,38,38,.28)!important;border-color:rgba(255,98,98,.36)!important;color:#fff!important;box-shadow:0 10px 24px rgba(120,22,22,.22)!important;}
.card:not(.layout-tablet) .queue-action-item{min-height:58px;}
.card.mobile-content-dense:not(.layout-tablet){
  --flow-stage-pad-block:9px;
  --flow-shell-gap:12px;
  --flow-hero-gap:10px;
  --flow-side-btn-size:46px;
  --flow-minor-btn-size:38px;
  --flow-main-btn-size:84px;
  --flow-mobile-art-size:clamp(190px, min(72cqi, var(--flow-mobile-art-budget)), 370px);
  --flow-art-stack-height:var(--flow-mobile-art-size);
  --flow-art-card-size:var(--flow-mobile-art-size);
}
.card.mobile-content-dense:not(.layout-tablet) > .mobile-brand-signature{
  inset-block-start:2px;
  min-height:46px;
  width:clamp(170px, 48cqi, 260px);
  opacity:.52;
  z-index:2;
  transform:translateX(-50%) scale(.86);
  transform-origin:50% 0;
}
.card.mobile-content-dense:not(.layout-tablet) .stage{
  gap:6px!important;
  padding-block-start:max(7px, env(safe-area-inset-top))!important;
  padding-block-end:max(8px, env(safe-area-inset-bottom))!important;
}
.card.mobile-content-dense:not(.layout-tablet) .center{
  justify-content:center!important;
  gap:5px!important;
  padding-top:18px;
  overflow:visible;
}
.card.mobile-content-dense:not(.layout-tablet) .hero-mobile-top{
  min-height:34px;
  margin-bottom:0!important;
  overflow:visible;
  z-index:9;
}
.card.mobile-content-dense:not(.layout-tablet):not(.height-short):not(.height-tight) .center{
  padding-top:6px;
}
.card.mobile-content-dense:not(.layout-tablet):not(.height-short):not(.height-tight) .hero-mobile-top{
  margin-top:-6px!important;
  margin-bottom:14px!important;
}
.card.mobile-content-dense:not(.layout-tablet) .player-focus{
  margin-top:0!important;
  max-width:min(calc(100% - 76px), 360px)!important;
  min-height:32px!important;
  padding:5px 10px!important;
  gap:6px!important;
  border-radius:16px!important;
  overflow:visible;
}
.card.mobile-content-dense:not(.layout-tablet) .player-focus-copy{
  gap:6px!important;
  min-width:0;
}
.card.mobile-content-dense:not(.layout-tablet) .player-focus-tags{
  gap:4px!important;
  min-width:0;
  overflow:visible;
}
.card.mobile-content-dense:not(.layout-tablet) .player-focus-name{
  font-size:calc(11px * var(--v2-font-scale))!important;
  line-height:1.08!important;
  max-width:min(40cqi, 162px)!important;
}
.card.mobile-content-dense:not(.layout-tablet) .player-focus-art-wrap,
.card.mobile-content-dense:not(.layout-tablet) .player-focus-art{
  width:30px!important;
  height:30px!important;
}
.card.mobile-content-dense:not(.layout-tablet) .player-focus-pill{
  min-height:17px!important;
  padding:0 6px!important;
  font-size:calc(9px * var(--v2-font-scale))!important;
}
.card.mobile-content-dense:not(.layout-tablet) .hero-split-shell,
.card.mobile-content-dense:not(.layout-tablet) .hero-info,
.card.mobile-content-dense:not(.layout-tablet) .hero-copy{
  gap:5px!important;
  min-height:0;
}
.card.mobile-content-dense:not(.layout-tablet) .hero-split-shell{
  align-content:start;
  max-height:100%;
}
.card.mobile-content-dense:not(.layout-tablet) .hero-copy{
  max-width:min(94%, 520px)!important;
}
.card.mobile-content-dense:not(.layout-tablet) .hero-title{
  font-size:calc(18px * var(--v2-font-scale))!important;
  line-height:1.04!important;
  -webkit-line-clamp:1!important;
}
.card.mobile-content-dense:not(.layout-tablet) .hero-sub{
  font-size:calc(11px * var(--v2-font-scale))!important;
  line-height:1.16!important;
  -webkit-line-clamp:1!important;
}
.card.mobile-content-dense:not(.layout-tablet) .hero-up-next{
  max-width:min(94%, 440px)!important;
}
.card.mobile-content-dense:not(.layout-tablet) .up-next-art{
  width:18px!important;
  min-width:18px!important;
  height:18px!important;
  border-radius:6px!important;
}
.card.mobile-content-dense:not(.layout-tablet) .up-next-line{
  gap:4px!important;
}
.card.mobile-content-dense:not(.layout-tablet) .up-next-prefix{
  font-size:10px!important;
}
.card.mobile-content-dense:not(.layout-tablet) .up-next-title{
  font-size:11px!important;
}
.card.mobile-content-dense:not(.layout-tablet) .mobile-action-row-wrap{
  width:100%;
  min-height:38px;
  display:flex;
  justify-content:center;
  align-items:center;
  overflow:visible;
  position:relative;
  z-index:3;
}
.card.mobile-content-dense:not(.layout-tablet) .mobile-art-actions{
  gap:7px!important;
  flex-wrap:nowrap!important;
  overflow:visible!important;
}
.card.mobile-content-dense:not(.layout-tablet) .mobile-art-fab,
.card.mobile-content-dense:not(.layout-tablet) .mobile-art-actions .history-toggle-fab,
.card.mobile-content-dense:not(.layout-tablet) .mobile-timer-fab{
  width:38px!important;
  min-width:38px!important;
  height:38px!important;
}
.card.mobile-content-dense:not(.layout-tablet) .night-quick-row{
  margin-top:0!important;
  gap:5px!important;
  flex-wrap:nowrap!important;
  max-width:100%;
  overflow:visible;
}
.card.mobile-content-dense:not(.layout-tablet) .night-quick-btn.icon-only{
  width:28px!important;
  min-width:28px!important;
  height:28px!important;
  min-height:28px!important;
}
.card.mobile-content-dense:not(.layout-tablet) .night-quick-btn.icon-only .ui-ic{
  width:15px!important;
  height:15px!important;
}
.card.mobile-content-dense:not(.layout-tablet) .bottom{
  gap:6px!important;
}
.card.mobile-content-dense:not(.layout-tablet) .progress-line,
.card.mobile-content-dense:not(.layout-tablet) .controls,
.card.mobile-content-dense:not(.layout-tablet) .mobile-volume-inline{
  margin-top:0!important;
}
.card.mobile-content-dense:not(.layout-tablet) .controls{
  gap:8px!important;
}
.card.mobile-content-dense:not(.layout-tablet) .mobile-volume-inline{
  gap:8px!important;
}
.card.mobile-content-dense:not(.layout-tablet) .footer-nav{
  margin-top:1px!important;
  padding:6px!important;
  gap:6px!important;
}
.card.mobile-content-dense:not(.layout-tablet) .footer-btn{
  min-height:46px!important;
  padding:6px!important;
}
.card.mobile-content-dense.height-tight:not(.layout-tablet){
  --flow-mobile-art-size:clamp(150px, min(58cqi, calc(var(--flow-available-height) * .3)), 260px);
}
.card.mobile-content-dense.height-tight:not(.layout-tablet) .player-focus{
  min-height:28px!important;
  padding:4px 8px!important;
}
.card.mobile-content-dense.height-tight:not(.layout-tablet) .mobile-art-fab,
.card.mobile-content-dense.height-tight:not(.layout-tablet) .mobile-art-actions .history-toggle-fab,
.card.mobile-content-dense.height-tight:not(.layout-tablet) .mobile-timer-fab{
  width:34px!important;
  min-width:34px!important;
  height:34px!important;
}
.mobile-art-actions{position:relative!important;left:auto!important;right:auto!important;transform:none!important;inset-inline:auto!important;inset-block-end:auto!important;display:flex!important;align-items:center!important;justify-content:center!important;gap:10px!important;flex-wrap:wrap!important;margin-top:0!important;padding:0!important;border-radius:0!important;background:transparent!important;border:none!important;box-shadow:none!important;backdrop-filter:none!important;}
.card.layout-tablet .mobile-art-actions{position:relative!important;left:auto!important;right:auto!important;transform:none!important;inset-inline:auto!important;inset-block-end:auto!important;margin:0!important;justify-content:flex-start!important;z-index:4!important;}
.theme-light .mobile-art-actions{background:transparent!important;border-color:transparent!important;box-shadow:none!important;}
        .mobile-art-fab{width:42px;min-width:42px;height:42px;border-radius:999px;}
        .mobile-art-fab.pressed,.mobile-art-fab:active{transform:translateY(1px) scale(.94)!important;box-shadow:0 8px 16px rgba(0,0,0,.14)!important;border-color:color-mix(in srgb, var(--ma-accent) 34%, rgba(255,255,255,.18))!important;color:var(--ma-accent)!important;}
        .mobile-art-fab.disabled,.mobile-art-fab:disabled{opacity:.34!important;pointer-events:none!important;box-shadow:none!important;filter:saturate(.5);}
        .mobile-art-fab.hidden,[hidden].mobile-art-fab{display:none!important;}
        .mobile-art-actions .history-toggle-fab{position:static!important;inset:auto!important;transform:none!important;width:42px!important;min-width:42px!important;height:42px!important;border-radius:999px!important;opacity:1!important;}
        .mobile-art-actions .history-toggle-fab:active{transform:scale(.94)!important;}
        .mobile-timer-fab{width:42px;min-width:42px;gap:5px;padding:0 10px!important;overflow:hidden;white-space:nowrap;}
        .mobile-timer-fab.active{width:auto;min-width:76px;color:var(--ma-accent);}
        .mobile-timer-fab .mobile-timer-label{font-size:calc(11px * var(--v2-font-scale));font-weight:900;line-height:1;direction:ltr;}
        .mobile-timer-fab .mobile-timer-label[hidden]{display:none!important;}
        .player-focus-nav-btn.pressed,.player-focus-nav-btn:active{transform:scale(.9);color:var(--ma-accent);}
        .mobile-art-actions.count-4{gap:10px!important;}
@media (max-width: 600px){.mobile-art-actions{gap:8px!important;padding:0!important;margin-top:0!important;}.mobile-art-actions.count-4{gap:8px!important;}.mobile-art-fab{width:38px;min-width:38px;height:38px;}.mobile-art-actions .history-toggle-fab{width:38px!important;min-width:38px!important;height:38px!important;}.mobile-timer-fab{width:38px;min-width:38px;padding:0 8px!important;}.mobile-timer-fab.active{min-width:66px;}.mobile-timer-fab .mobile-timer-label{font-size:calc(10px * var(--v2-font-scale));}}
.card.aspect-wide:not(.layout-tablet) .mobile-art-actions,
.card.height-tight:not(.layout-tablet) .mobile-art-actions{
  width:min(100%, 186px)!important;
  max-width:min(100%, 186px)!important;
  min-height:34px!important;
  max-height:82px!important;
  display:flex!important;
  flex-wrap:wrap!important;
  justify-content:center!important;
  align-items:center!important;
  align-content:center!important;
  gap:6px 8px!important;
  overflow:visible!important;
}
.card.aspect-wide:not(.layout-tablet) .mobile-art-actions .mobile-art-fab,
.card.aspect-wide:not(.layout-tablet) .mobile-art-actions .history-toggle-fab,
.card.aspect-wide:not(.layout-tablet) .mobile-art-actions .mobile-timer-fab,
.card.height-tight:not(.layout-tablet) .mobile-art-actions .mobile-art-fab,
.card.height-tight:not(.layout-tablet) .mobile-art-actions .history-toggle-fab,
.card.height-tight:not(.layout-tablet) .mobile-art-actions .mobile-timer-fab{
  width:34px!important;
  min-width:34px!important;
  height:34px!important;
  min-height:34px!important;
  flex:0 0 34px!important;
}
.card.aspect-wide:not(.layout-tablet) .mobile-art-actions .mobile-timer-fab.active,
.card.height-tight:not(.layout-tablet) .mobile-art-actions .mobile-timer-fab.active{
  width:auto!important;
  min-width:62px!important;
  flex:0 0 auto!important;
}
@media (max-width: 820px){
  .history-drawer{inset-block:auto 16px;width:min(320px, calc(100% - 76px));max-height:min(56vh, 420px);}
  .history-toggle-fab{top:54%!important;inset-block-start:54%;inset-block-end:auto;width:38px;height:38px;border-radius:999px;transform:translateY(-50%);opacity:.9;}
  .history-toggle-fab .ui-ic{width:16px;height:16px;}
  .history-toggle-fab:active{transform:translateY(-50%) scale(.97);}
  .card:not(.layout-tablet) .sleep-timer-corner{top:calc(74px + env(safe-area-inset-top, 0px))!important;inset-block-start:calc(74px + env(safe-area-inset-top, 0px))!important;inset-block-end:auto;right:16px!important;left:auto!important;inset-inline-start:auto!important;inset-inline-end:16px!important;transform:none;justify-items:end;z-index:13;}
  .card:not(.layout-tablet) .sleep-timer-chip{min-height:30px;padding:0 9px;gap:5px;font-size:calc(11px * var(--v2-font-scale));box-shadow:0 10px 20px rgba(0,0,0,.18);}
  .card:not(.layout-tablet) .sleep-timer-chip .ui-ic{width:13px;height:13px;}
  .card:not(.layout-tablet) .sleep-timer-menu{grid-auto-flow:row;position:absolute;inset-block-start:36px;right:0;left:auto;inset-inline-start:auto;inset-inline-end:0;}
  .history-toggle-fab.left-edge{inset-inline-start:2px!important;}
  .history-toggle-fab.right-edge{inset-inline-end:2px!important;}
  .history-drawer.left-edge{inset-inline-start:14px;transform:translateX(calc(-100% - 14px));}
  .history-drawer.right-edge{inset-inline-end:14px;transform:translateX(calc(100% + 14px));}
  .history-drawer.open{transform:translateX(0);}
}
`;
}
