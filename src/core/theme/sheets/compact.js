// compact styles. Order is preserved by card-styles.js.
export default function() {
  return `@media (prefers-reduced-motion: reduce) {
          .card.empty-media::before,
          .card.empty-media::after,
          .card.empty-media .hero-copy,
          .card.empty-media .empty-magic-stack {
            animation:none !important;
          }
        }
        .card.dynamic-theme .bg {
          background:
            radial-gradient(circle at 18% 18%, rgba(var(--dynamic-glow-rgb, 255 178 56) / calc(.16 * var(--dynamic-theme-strength, .82))), transparent 32%),
            radial-gradient(circle at 82% 12%, rgba(var(--dynamic-accent-rgb, 224 161 27) / calc(.12 * var(--dynamic-theme-strength, .82))), transparent 26%),
            linear-gradient(180deg, rgba(var(--dynamic-surface-rgb, 12 15 22) / .42), rgba(var(--dynamic-surface-rgb, 12 15 22) / .96)),
            #0c0f16;
        }
        .card.dynamic-theme .shade {
          background:
            linear-gradient(180deg, rgba(var(--dynamic-surface-rgb, 12 15 22) / .12), rgba(var(--dynamic-surface-rgb, 12 15 22) / .64) 34%, rgba(9,12,19,.96)),
            radial-gradient(circle at 50% 84%, rgba(var(--dynamic-accent-rgb, 224 161 27) / calc(.12 * var(--dynamic-theme-strength, .82))), transparent 28%);
        }
        .card.dynamic-theme .glow {
          background:
            radial-gradient(circle at 50% 76%, rgba(var(--dynamic-glow-rgb, 255 178 56) / calc(.22 * var(--dynamic-theme-strength, .82))), transparent 32%),
            radial-gradient(circle at 16% 18%, rgba(var(--dynamic-accent-rgb, 224 161 27) / calc(.14 * var(--dynamic-theme-strength, .82))), transparent 24%);
        }
        .theme-light.card.dynamic-theme .bg {
          filter:blur(32px) saturate(calc(1.04 + (.08 * var(--dynamic-theme-strength, .82)))) brightness(1.05);
          opacity:.88;
        }
        .theme-light.card.dynamic-theme .shade {
          background:
            linear-gradient(180deg, rgba(255,255,255,.06), rgba(239,244,250,.18) 16%, rgba(var(--dynamic-surface-rgb, 224 232 244) / .38) 56%, rgba(204,214,228,.76)),
            radial-gradient(circle at 50% 82%, rgba(var(--dynamic-accent-rgb, 224 161 27) / calc(.06 * var(--dynamic-theme-strength, .82))), transparent 26%);
        }
        .theme-light.card.dynamic-theme .glow {
          background:
            radial-gradient(circle at 18% 20%, rgba(var(--dynamic-glow-rgb, 255 178 56) / calc(.12 * var(--dynamic-theme-strength, .82))), transparent 24%),
            radial-gradient(circle at 82% 16%, rgba(var(--dynamic-accent-rgb, 224 161 27) / calc(.08 * var(--dynamic-theme-strength, .82))), transparent 20%),
            radial-gradient(circle at 50% 78%, rgba(var(--dynamic-glow-rgb, 255 178 56) / calc(.1 * var(--dynamic-theme-strength, .82))), transparent 24%);
        }
        .card.night-mode {
          border-color:rgba(168,182,255,.18);
          box-shadow:0 28px 60px rgba(8,12,26,.42);
        }
        .card.night-mode.dynamic-theme {
          border-color:rgba(var(--dynamic-accent-rgb, 168 182 255) / .22);
          box-shadow:
            0 28px 60px rgba(8,12,26,.42),
            0 0 0 1px rgba(var(--dynamic-accent-rgb, 168 182 255) / .08),
            0 18px 42px rgba(var(--dynamic-accent-rgb, 168 182 255) / .12);
        }
        .card.night-mode .shade {
          background:
            linear-gradient(180deg, rgba(8,11,24,.22), rgba(8,11,24,.82) 34%, rgba(7,10,20,.98)),
            radial-gradient(circle at 50% 84%, rgba(106,125,255,.14), transparent 28%);
        }
        .card.night-mode .glow {
          background:
            radial-gradient(circle at 50% 76%, rgba(126,142,255,.18), transparent 30%),
            radial-gradient(circle at 16% 18%, rgba(118,140,255,.12), transparent 24%);
        }
        .theme-light.card.night-mode {
          background:#e7edf7;
          box-shadow:0 24px 58px rgba(57,72,105,.24);
        }
        .theme-light.card.night-mode .shade {
          background:
            linear-gradient(180deg, rgba(230,236,247,.28), rgba(214,224,240,.56) 20%, rgba(202,213,232,.82) 64%, rgba(196,208,228,.92));
        }
        .theme-light.card.night-mode .glow {
          background:
            radial-gradient(circle at 22% 18%, rgba(142,160,255,.18), transparent 22%),
            radial-gradient(circle at 50% 78%, rgba(114,132,255,.12), transparent 30%);
        }
        .card.layout-tablet {
          --tablet-max: var(--flow-tablet-max);
          --tablet-rail: var(--flow-tablet-rail);
          --flow-art-card-max-size:var(--flow-autofit-art-height);
        }
        .tablet-brand-watermark {
          display:none;
        }
        .mobile-brand-signature {
          display:none;
        }
        .control-room-brand-watermark,
        .compact-brand-signature {
          display:none;
        }
        .menu-title-brand,
        .lyrics-title-brand,
        .control-room-head-brand,
        .control-room-brand-watermark,
        .history-drawer-brand,
        .queue-action-brand,
        .smart-voice-brand,
        .voice-assistant-brand,
        .screensaver-brand,
        .screensaver-empty-logo,
        .art-stack-brand-logo {
          display:none !important;
        }
        .card.layout-tablet > .tablet-brand-watermark {
          position:absolute;
          inset-block-end:28px;
          width:clamp(88px, 8cqi, 142px);
          height:auto;
          display:grid;
          place-items:center;
          pointer-events:none;
          z-index:4;
          color:rgba(245,248,255,.2);
          opacity:.44;
          mix-blend-mode:screen;
          filter:drop-shadow(0 8px 18px rgba(0,0,0,.14)) saturate(.82);
        }
        .card:not(.layout-tablet) > .mobile-brand-signature {
          position:absolute;
          inset-block-start:6px;
          left:50%;
          right:auto;
          width:clamp(210px, 58cqi, 326px);
          max-width:calc(100% - 104px);
          min-height:64px;
          display:grid;
          place-items:center;
          color:rgba(248,251,255,.7);
          opacity:1;
          pointer-events:none;
          z-index:8;
          mix-blend-mode:normal;
          transform:translateX(-50%);
          filter:drop-shadow(0 10px 22px rgba(0,0,0,.28)) saturate(.96);
        }
        .card.layout-tablet .control-room-scene > .control-room-brand-watermark {
          position:absolute;
          inset-block-end:28px;
          width:clamp(156px, 15cqi, 250px);
          height:auto;
          display:grid;
          place-items:center;
          pointer-events:none;
          z-index:1;
          color:rgba(245,248,255,.36);
          opacity:.88;
          mix-blend-mode:screen;
          filter:drop-shadow(0 10px 24px rgba(0,0,0,.2)) saturate(.9);
        }
        .card.layout-tablet.rtl > .tablet-brand-watermark {
          inset-inline-start:48px;
          inset-inline-end:auto;
        }
        .card.layout-tablet:not(.rtl) > .tablet-brand-watermark {
          inset-inline-end:48px;
          inset-inline-start:auto;
        }
        .card.layout-tablet.rtl .control-room-brand-watermark {
          inset-inline-start:48px;
          inset-inline-end:auto;
        }
        .card.layout-tablet:not(.rtl) .control-room-brand-watermark {
          inset-inline-end:48px;
          inset-inline-start:auto;
        }
        .tablet-brand-logo,
        .control-room-brand-logo,
        .control-room-head-logo,
        .menu-title-logo,
        .lyrics-title-logo,
        .queue-action-logo,
        .smart-voice-logo,
        .voice-assistant-logo,
        .screensaver-brand-logo,
        .screensaver-empty-logo,
        .art-stack-brand-logo {
          width:100%;
          height:auto;
          display:block;
          overflow:visible;
        }
        .mobile-brand-logo {
          width:100%;
          height:auto;
          max-height:62px;
          display:block;
          overflow:visible;
        }
        .brand-signature-logo .tablet-brand-home,
        .brand-signature-logo .tablet-brand-flow {
          fill:currentColor;
          font-family:var(--homeii-font-family);
          paint-order:stroke;
          stroke:rgba(2,6,14,.08);
          stroke-width:.7px;
        }
        .brand-signature-logo .tablet-brand-home {
          font-size:22px;
          font-weight:700;
          letter-spacing:8px;
          text-transform:uppercase;
        }
        .brand-signature-logo .tablet-brand-flow {
          font-size:11px;
          font-weight:650;
          letter-spacing:6px;
          opacity:.72;
          text-transform:uppercase;
        }
        .brand-signature-logo .tablet-brand-wave,
        .brand-signature-logo .tablet-brand-rule {
          stroke:currentColor;
          stroke-linecap:round;
          stroke-width:1.15;
          opacity:.46;
        }
        .brand-signature-logo .tablet-brand-rule {
          stroke-width:.75;
          opacity:.32;
        }
        .mobile-brand-logo .tablet-brand-home {
          font-size:20px;
          letter-spacing:7px;
        }
        .mobile-brand-logo .tablet-brand-flow {
          font-size:10px;
          letter-spacing:5px;
          opacity:.56;
        }
        .mobile-brand-logo .tablet-brand-wave {
          opacity:.22;
        }
        .mobile-brand-logo .tablet-brand-rule {
          opacity:.16;
        }
        .theme-light.card.layout-tablet > .tablet-brand-watermark {
          color:rgba(20,26,38,.18);
          opacity:.72;
          mix-blend-mode:multiply;
          filter:drop-shadow(0 10px 22px rgba(255,255,255,.2)) saturate(.82);
        }
        .theme-light.card.layout-tablet .control-room-brand-watermark {
          color:rgba(20,26,38,.16);
          opacity:.7;
          mix-blend-mode:multiply;
          filter:drop-shadow(0 10px 22px rgba(255,255,255,.2)) saturate(.82);
        }
        .theme-light.card.layout-tablet .tablet-brand-logo .tablet-brand-home,
        .theme-light.card.layout-tablet .tablet-brand-logo .tablet-brand-flow {
          stroke:rgba(255,255,255,.12);
        }
        .theme-light.card:not(.layout-tablet) > .mobile-brand-signature {
          color:rgba(22,28,40,.36);
          opacity:.9;
          mix-blend-mode:normal;
          filter:drop-shadow(0 8px 18px rgba(255,255,255,.24)) saturate(.84);
        }
        .theme-light.card:not(.layout-tablet) .mobile-brand-logo .tablet-brand-home,
        .theme-light.card:not(.layout-tablet) .mobile-brand-logo .tablet-brand-flow {
          stroke:rgba(255,255,255,.12);
        }
        @media (max-height: 620px) {
          .card.layout-tablet > .tablet-brand-watermark {
            width:clamp(116px, 11cqi, 170px);
            inset-block-end:18px;
            opacity:.62;
          }
          .card:not(.layout-tablet) > .mobile-brand-signature {
            width:clamp(158px, 44cqi, 232px);
            min-height:52px;
            opacity:.84;
          }
        }
        @keyframes homeiiCompactExpandCard {
          0% {
            opacity:.74;
            transform:translateY(12px) scale(.972);
            filter:blur(2px) saturate(.92);
          }
          62% {
            opacity:1;
            transform:translateY(-2px) scale(1.004);
            filter:blur(0) saturate(1.03);
          }
          100% {
            opacity:1;
            transform:translateY(0) scale(1);
            filter:none;
          }
        }
        @keyframes homeiiCompactContentRise {
          0% { opacity:.64; transform:translateY(14px) scale(.985); }
          100% { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes homeiiCompactTileReveal {
          0% {
            opacity:.72;
            transform:translateY(-8px) scale(.975);
            filter:blur(1px) saturate(.95);
          }
          100% {
            opacity:1;
            transform:translateY(0) scale(1);
            filter:none;
          }
        }
        .card.compact-transition-expand {
          animation:homeiiCompactExpandCard .42s cubic-bezier(.22, .78, .24, 1) both;
          transform-origin:center top;
          will-change:transform, opacity, filter;
        }
        .card.compact-transition-expand .hero-split-shell,
        .card.compact-transition-expand .bottom,
        .card.compact-transition-expand .footer-nav {
          animation:homeiiCompactContentRise .38s cubic-bezier(.2, .82, .22, 1) both;
          will-change:transform, opacity;
        }
        .card.compact-transition-expand .bottom { animation-delay:.04s; }
        .card.compact-transition-expand .footer-nav { animation-delay:.07s; }
        .card.compact-transition-collapse .compact-shell {
          animation:homeiiCompactTileReveal .34s cubic-bezier(.22, .78, .24, 1) both;
          transform-origin:center top;
          will-change:transform, opacity, filter;
        }
        @media (prefers-reduced-motion: reduce) {
          .card.compact-transition-expand,
          .card.compact-transition-expand .hero-split-shell,
          .card.compact-transition-expand .bottom,
          .card.compact-transition-expand .footer-nav,
          .card.compact-transition-collapse .compact-shell {
            animation:none !important;
          }
        }
        :host(.screensaver-page-open) {
          position:fixed !important;
          inset:0 !important;
          width:100vw !important;
          max-width:none !important;
          height:100dvh !important;
          min-height:100dvh !important;
          max-height:100dvh !important;
          z-index:2147483200 !important;
          display:block !important;
          overflow:visible !important;
          contain:none !important;
          border-radius:0 !important;
          background:#02060d;
        }
        :host(.screensaver-page-open) ha-card,
        :host(.screensaver-page-open) .card.screensaver-active {
          width:100vw !important;
          max-width:none !important;
          height:100dvh !important;
          min-height:100dvh !important;
          max-height:100dvh !important;
          border-radius:0 !important;
          overflow:visible !important;
          box-shadow:none !important;
        }
        :host(.screensaver-page-open) .card.screensaver-active {
          position:fixed !important;
          inset:0 !important;
          border:0 !important;
          background:#02060d !important;
        }
        :host(.screensaver-page-open) .screensaver-backdrop {
          position:fixed !important;
          inset:0 !important;
          width:100vw !important;
          height:100dvh !important;
          max-height:100dvh !important;
          border-radius:0 !important;
          z-index:2147483201 !important;
          padding:clamp(20px, 3vw, 42px) !important;
        }
        :host(.compact-popup-open) {
          position:fixed !important;
          inset:0 !important;
          width:100vw !important;
          height:100dvh !important;
          min-height:100dvh !important;
          max-height:100dvh !important;
          z-index:2147483000 !important;
          display:block !important;
          pointer-events:auto !important;
          contain:none !important;
          overflow:visible !important;
          background:rgba(0,0,0,.08);
        }
        :host(.mobile-edge-to-edge-open) {
          position:fixed !important;
          inset:0 !important;
          width:100vw !important;
          height:100dvh !important;
          min-height:100dvh !important;
          max-height:100dvh !important;
          z-index:2147482600 !important;
          display:block !important;
          pointer-events:auto !important;
          contain:none !important;
          overflow:visible !important;
          background:#02060d;
        }
        :host(.mobile-edge-to-edge-open) ha-card,
        :host(.mobile-edge-to-edge-open) .card.mobile-edge-to-edge {
          width:100vw !important;
          max-width:none !important;
          height:100dvh !important;
          min-height:100dvh !important;
          max-height:100dvh !important;
          border-radius:0 !important;
          overflow:hidden !important;
          box-shadow:none !important;
        }
        :host(.mobile-edge-to-edge-open) .card.mobile-edge-to-edge {
          position:fixed !important;
          inset:0 !important;
          border:0 !important;
          z-index:2147482601 !important;
        }
        :host(.mobile-edge-to-edge-open) .card.mobile-edge-to-edge .stage {
          height:100% !important;
          min-height:0 !important;
          max-height:100% !important;
        }
        :host(.mobile-edge-to-edge-open) .card.mobile-edge-to-edge .menu-backdrop.open,
        :host(.mobile-edge-to-edge-open) .card.mobile-edge-to-edge .queue-action-backdrop.open,
        :host(.mobile-edge-to-edge-open) .card.mobile-edge-to-edge .control-room-backdrop.open,
        :host(.mobile-edge-to-edge-open) .card.mobile-edge-to-edge .screensaver-backdrop.open {
          position:fixed !important;
          inset:0 !important;
          width:100vw !important;
          height:100dvh !important;
          min-height:100dvh !important;
          max-height:100dvh !important;
          padding:0 !important;
          margin:0 !important;
          border-radius:0 !important;
          align-items:stretch !important;
          justify-content:center !important;
          overflow:hidden !important;
          z-index:2147482602 !important;
        }
        :host(.mobile-edge-to-edge-open) .card.mobile-edge-to-edge .menu-backdrop.open .menu-sheet,
        :host(.mobile-edge-to-edge-open) .card.mobile-edge-to-edge .queue-action-backdrop.open .queue-action-sheet,
        :host(.mobile-edge-to-edge-open) .card.mobile-edge-to-edge .control-room-backdrop.open .control-room-shell {
          width:100vw !important;
          max-width:100vw !important;
          height:100dvh !important;
          max-height:100dvh !important;
          min-height:100dvh !important;
          margin:0 !important;
          border-radius:0 !important;
          box-shadow:none !important;
        }
        :host(.mobile-edge-to-edge-open) .card.mobile-edge-to-edge .menu-backdrop.open .menu-body,
        :host(.mobile-edge-to-edge-open) .card.mobile-edge-to-edge .queue-action-backdrop.open .queue-action-sheet {
          overflow:auto !important;
          -webkit-overflow-scrolling:touch;
        }
        :host(.mobile-edge-to-edge-open) .card.mobile-edge-to-edge .queue-action-backdrop.clean-all-confirm-backdrop.open {
          padding:max(20px, env(safe-area-inset-top)) 16px max(20px, env(safe-area-inset-bottom)) !important;
          align-items:center !important;
          justify-content:center !important;
        }
        :host(.mobile-edge-to-edge-open) .card.mobile-edge-to-edge .queue-action-backdrop.clean-all-confirm-backdrop.open .clean-all-confirm-sheet {
          width:min(420px, calc(100vw - 36px)) !important;
          max-width:calc(100vw - 36px) !important;
          height:auto !important;
          min-height:0 !important;
          max-height:calc(100dvh - 40px) !important;
          margin:auto !important;
          border-radius:26px !important;
          box-shadow:0 22px 60px rgba(0,0,0,.3) !important;
          overflow:auto !important;
        }
        .mobile-edge-corner-btn {
          position:absolute;
          top:max(12px, env(safe-area-inset-top, 0px));
          left:max(12px, env(safe-area-inset-left, 0px));
          z-index:2147482610;
          width:44px;
          height:44px;
          display:grid;
          place-items:center;
          border-radius:999px;
          border:1px solid rgba(255,255,255,.18);
          background:rgba(18,22,32,.7);
          color:#fff;
          box-shadow:0 14px 32px rgba(0,0,0,.34);
          backdrop-filter:blur(18px) saturate(130%);
          -webkit-backdrop-filter:blur(18px) saturate(130%);
          cursor:pointer;
        }
        .mobile-edge-exit {
          position:fixed;
        }
        :host(.mobile-edge-to-edge-open) .card.mobile-edge-to-edge:has(.menu-backdrop.open) > .mobile-edge-exit,
        :host(.mobile-edge-to-edge-open) .card.mobile-edge-to-edge:has(.queue-action-backdrop.open) > .mobile-edge-exit,
        :host(.mobile-edge-to-edge-open) .card.mobile-edge-to-edge:has(.control-room-backdrop.open) > .mobile-edge-exit,
        :host(.mobile-edge-to-edge-open) .card.mobile-edge-to-edge:has(.screensaver-backdrop.open) > .mobile-edge-exit,
        .card:has(.menu-backdrop.open) > .mobile-edge-return,
        .card:has(.queue-action-backdrop.open) > .mobile-edge-return,
        .card:has(.control-room-backdrop.open) > .mobile-edge-return,
        .card:has(.screensaver-backdrop.open) > .mobile-edge-return {
          display:none !important;
        }
        .mobile-edge-corner-btn.rtl {
          left:auto;
          right:max(12px, env(safe-area-inset-right, 0px));
        }
        .mobile-edge-corner-btn .ui-ic {
          width:20px;
          height:20px;
        }
        .theme-light .mobile-edge-corner-btn {
          background:rgba(255,255,255,.88);
          color:#172033;
          border-color:rgba(100,116,139,.22);
          box-shadow:0 14px 30px rgba(71,85,105,.2);
        }
        :host(.compact-window-popup-open) {
          position:fixed !important;
          top:max(76px, calc(env(safe-area-inset-top, 0px) + 18px)) !important;
          left:50% !important;
          right:auto !important;
          bottom:auto !important;
          transform:translateX(-50%) !important;
          width:min(var(--homeii-compact-window-width, 720px), calc(100vw - 32px)) !important;
          height:min(var(--homeii-compact-window-height, 760px), calc(100dvh - 112px)) !important;
          min-width:0 !important;
          min-height:360px !important;
          max-width:calc(100vw - 32px) !important;
          max-height:calc(100dvh - 112px) !important;
          z-index:2147482500 !important;
          display:block !important;
          pointer-events:auto !important;
          contain:none !important;
          overflow:visible !important;
          box-sizing:border-box !important;
          background:transparent !important;
        }
        :host(.compact-window-popup-open) ha-card {
          width:100% !important;
          height:100% !important;
          min-height:100% !important;
          max-height:100% !important;
          overflow:visible !important;
          pointer-events:auto !important;
          border-radius:32px !important;
          box-shadow:0 34px 90px rgba(0,0,0,.44), 0 0 0 1px rgba(255,255,255,.12) !important;
        }
        :host(.compact-window-popup-open) .card.compact-expanded,
        :host(.compact-window-popup-open) .card.compact-mode.compact-expanded {
          position:relative !important;
          inset:auto !important;
          width:100% !important;
          height:100% !important;
          min-width:0 !important;
          min-height:100% !important;
          max-width:100% !important;
          max-height:100% !important;
          pointer-events:auto !important;
          touch-action:auto !important;
          border-radius:32px !important;
          overflow:hidden !important;
        }
        :host(.compact-window-popup-open) .card.compact-expanded .stage,
        :host(.compact-window-popup-open) .card.compact-mode.compact-expanded .stage {
          height:100% !important;
          max-height:100% !important;
          min-height:0 !important;
          pointer-events:auto !important;
        }
        :host(.compact-window-popup-open) .card.compact-expanded .menu-backdrop,
        :host(.compact-window-popup-open) .card.compact-expanded .screensaver-backdrop,
        :host(.compact-window-popup-open) .card.compact-mode.compact-expanded .menu-backdrop,
        :host(.compact-window-popup-open) .card.compact-mode.compact-expanded .screensaver-backdrop {
          position:absolute !important;
          inset:0 !important;
        }
        @media (max-width: 760px) {
          :host(.compact-window-popup-open) {
            top:max(72px, calc(env(safe-area-inset-top, 0px) + 14px)) !important;
            width:min(var(--homeii-compact-window-width, 560px), calc(100vw - 20px)) !important;
            height:min(var(--homeii-compact-window-height, 680px), calc(100dvh - 156px)) !important;
            min-height:min(340px, calc(100dvh - 156px)) !important;
            max-width:calc(100vw - 20px) !important;
            max-height:calc(100dvh - 156px) !important;
          }
          :host(.compact-window-popup-open) ha-card,
          :host(.compact-window-popup-open) .card.compact-expanded,
          :host(.compact-window-popup-open) .card.compact-mode.compact-expanded {
            border-radius:28px !important;
          }
        }
        :host(.compact-tile-open) {
          display:block !important;
          position:relative !important;
          height:var(--homeii-compact-tile-height, 504px) !important;
          min-height:var(--homeii-compact-tile-height, 336px) !important;
          max-height:var(--homeii-compact-tile-height, 504px) !important;
          overflow:hidden !important;
          z-index:auto !important;
        }
        :host(.compact-tile-open) ha-card {
          height:100% !important;
          min-height:var(--homeii-compact-tile-height, 336px) !important;
          max-height:var(--homeii-compact-tile-height, 504px) !important;
          overflow:hidden !important;
          border-radius:32px;
        }
        :host(.compact-tile-open.compact-menu-open) {
          position:fixed !important;
          inset:0 !important;
          width:100vw !important;
          height:100dvh !important;
          min-height:100dvh !important;
          max-height:100dvh !important;
          z-index:2147483050 !important;
          overflow:visible !important;
          contain:none !important;
          pointer-events:auto !important;
          border-radius:0 !important;
        }
        :host(.compact-tile-open.compact-menu-open) ha-card,
        :host(.compact-tile-open.compact-menu-open) .card.compact-mode {
          width:100vw !important;
          height:100dvh !important;
          min-height:100dvh !important;
          max-height:100dvh !important;
          overflow:visible !important;
          contain:none !important;
          border-radius:0 !important;
        }
        :host(.compact-tile-open.compact-menu-open) .card.compact-mode .stage {
          height:100dvh !important;
          min-height:0 !important;
          max-height:100dvh !important;
          overflow:visible !important;
        }
        :host(.compact-tile-open.compact-menu-open) .card.compact-mode.compact-collapsed > .stage {
          opacity:0 !important;
          pointer-events:none !important;
        }
        :host(.compact-tile-open.compact-menu-open) .card.compact-mode.compact-collapsed .compact-shell {
          display:none !important;
        }
        :host(.compact-tile-open.compact-menu-open) .menu-backdrop.open {
          position:fixed !important;
          inset:0 !important;
          z-index:2147483051 !important;
          display:flex !important;
          align-items:stretch !important;
          justify-content:center !important;
          padding:max(14px, env(safe-area-inset-top)) 14px max(14px, env(safe-area-inset-bottom)) !important;
          background:rgba(5,7,12,.76) !important;
          pointer-events:auto !important;
        }
        :host(.compact-tile-open.compact-menu-open) .menu-backdrop.open .menu-sheet {
          width:min(960px, calc(100vw - 28px)) !important;
          max-width:min(960px, calc(100vw - 28px)) !important;
          height:calc(100dvh - 28px) !important;
          max-height:calc(100dvh - 28px) !important;
          margin:0 auto !important;
          border-radius:28px !important;
        }
        :host(.compact-tile-open.compact-menu-open) .menu-body.sheet-players {
          justify-items:center !important;
          align-content:start !important;
          padding:clamp(14px, 3vw, 28px) clamp(14px, 4vw, 36px) max(28px, env(safe-area-inset-bottom)) !important;
        }
        :host(.compact-tile-open.compact-menu-open) .menu-body.sheet-players .players-premium-grid {
          width:min(100%, 900px) !important;
          grid-template-columns:repeat(auto-fit, minmax(min(100%, 260px), 1fr)) !important;
          gap:14px !important;
        }
        @media (max-width: 640px) {
          :host(.compact-tile-open.compact-menu-open) .menu-backdrop.open {
            padding:0 !important;
          }
          :host(.compact-tile-open.compact-menu-open) .menu-backdrop.open .menu-sheet {
            width:100vw !important;
            max-width:100vw !important;
            height:100dvh !important;
            max-height:100dvh !important;
            border-radius:0 !important;
          }
        }
        :host(.volume-preset-open) {
          position:relative !important;
          z-index:2147483100 !important;
          overflow:visible !important;
          contain:none !important;
          isolation:isolate !important;
        }
        :host(.volume-preset-open) ha-card,
        :host(.volume-preset-open) .card.compact-mode {
          overflow:visible !important;
          contain:none !important;
        }
        :host(.volume-preset-open) .queue-action-backdrop.open {
          z-index:2147483101 !important;
        }
        :host(.volume-preset-open) .queue-action-sheet {
          z-index:2147483102 !important;
          position:relative;
        }
        :host(.compact-popup-open) ha-card {
          width:100vw !important;
          height:100dvh !important;
          min-height:100dvh !important;
          max-height:100dvh !important;
          overflow:visible !important;
          pointer-events:auto !important;
          border-radius:0 !important;
        }
        :host(.compact-popup-open) .card.compact-expanded,
        :host(.compact-popup-open) .card.compact-mode.compact-expanded {
          position:fixed !important;
          inset:0 !important;
          width:100vw !important;
          height:100dvh !important;
          min-width:0 !important;
          min-height:100dvh !important;
          max-width:none !important;
          max-height:100dvh !important;
          z-index:2147483001 !important;
          pointer-events:auto !important;
          touch-action:auto !important;
          border-radius:0 !important;
          box-shadow:0 34px 90px rgba(0,0,0,.46), 0 0 0 1px rgba(255,255,255,.1) !important;
          overflow:hidden !important;
        }
        :host(.compact-popup-open) .card.compact-expanded .stage,
        :host(.compact-popup-open) .card.compact-mode.compact-expanded .stage {
          height:100% !important;
          max-height:100% !important;
          min-height:0 !important;
          pointer-events:auto !important;
        }
        :host(.compact-popup-open) .card.compact-expanded button,
        :host(.compact-popup-open) .card.compact-expanded input,
        :host(.compact-popup-open) .card.compact-expanded select,
        :host(.compact-popup-open) .card.compact-expanded textarea,
        :host(.compact-popup-open) .card.compact-expanded .progress,
        :host(.compact-popup-open) .card.compact-expanded [role="button"],
        :host(.compact-popup-open) .card.compact-mode.compact-expanded button,
        :host(.compact-popup-open) .card.compact-mode.compact-expanded input,
        :host(.compact-popup-open) .card.compact-mode.compact-expanded select,
        :host(.compact-popup-open) .card.compact-mode.compact-expanded textarea,
        :host(.compact-popup-open) .card.compact-mode.compact-expanded .progress,
        :host(.compact-popup-open) .card.compact-mode.compact-expanded [role="button"] {
          pointer-events:auto !important;
        }
        :host(.compact-popup-open) .card.compact-expanded button,
        :host(.compact-popup-open) .card.compact-expanded [role="button"],
        :host(.compact-popup-open) .card.compact-mode.compact-expanded button,
        :host(.compact-popup-open) .card.compact-mode.compact-expanded [role="button"] {
          touch-action:manipulation !important;
        }
        :host(.compact-popup-open) .card.compact-expanded .menu-backdrop,
        :host(.compact-popup-open) .card.compact-expanded .screensaver-backdrop,
        :host(.compact-popup-open) .card.compact-mode.compact-expanded .menu-backdrop,
        :host(.compact-popup-open) .card.compact-mode.compact-expanded .screensaver-backdrop {
          position:absolute !important;
          inset:0 !important;
        }
        :host(.compact-popup-open) .card.compact-expanded .menu-backdrop.open,
        :host(.compact-popup-open) .card.compact-mode.compact-expanded .menu-backdrop.open {
          z-index:64 !important;
        }
        :host(.compact-popup-open) .card.compact-expanded .menu-backdrop.open .menu-sheet,
        :host(.compact-popup-open) .card.compact-mode.compact-expanded .menu-backdrop.open .menu-sheet {
          position:relative;
          z-index:65 !important;
        }
        :host(.compact-popup-open) .card.compact-expanded .menu-backdrop.open .menu-head,
        :host(.compact-popup-open) .card.compact-mode.compact-expanded .menu-backdrop.open .menu-head {
          position:relative;
          z-index:66 !important;
        }
        :host(.compact-popup-open) .card.compact-expanded .menu-backdrop.open,
        :host(.compact-popup-open) .card.compact-mode.compact-expanded .menu-backdrop.open,
        :host(.compact-popup-open) .card.compact-expanded .queue-action-backdrop.open,
        :host(.compact-popup-open) .card.compact-mode.compact-expanded .queue-action-backdrop.open,
        :host(.compact-popup-open) .card.compact-expanded .control-room-backdrop.open,
        :host(.compact-popup-open) .card.compact-mode.compact-expanded .control-room-backdrop.open,
        :host(.compact-popup-open) .card.compact-expanded .screensaver-backdrop.open,
        :host(.compact-popup-open) .card.compact-mode.compact-expanded .screensaver-backdrop.open {
          position:absolute !important;
          inset:0 !important;
          width:100% !important;
          height:100% !important;
          min-width:0 !important;
          min-height:100% !important;
          max-width:100% !important;
          max-height:100% !important;
          padding:0 !important;
          margin:0 !important;
          border-radius:0 !important;
          align-items:stretch !important;
          justify-content:center !important;
          overflow:hidden !important;
          z-index:90 !important;
        }
        :host(.compact-popup-open) .card.compact-expanded .menu-backdrop.open .menu-sheet,
        :host(.compact-popup-open) .card.compact-mode.compact-expanded .menu-backdrop.open .menu-sheet,
        :host(.compact-popup-open) .card.compact-expanded .queue-action-backdrop.open .queue-action-sheet,
        :host(.compact-popup-open) .card.compact-mode.compact-expanded .queue-action-backdrop.open .queue-action-sheet,
        :host(.compact-popup-open) .card.compact-expanded .control-room-backdrop.open .control-room-shell,
        :host(.compact-popup-open) .card.compact-mode.compact-expanded .control-room-backdrop.open .control-room-shell {
          width:100% !important;
          max-width:100% !important;
          height:100% !important;
          max-height:100% !important;
          min-height:100% !important;
          margin:0 !important;
          border-radius:0 !important;
          box-shadow:none !important;
        }
        :host(.compact-popup-open) .card.compact-expanded .menu-backdrop.open .menu-body,
        :host(.compact-popup-open) .card.compact-mode.compact-expanded .menu-backdrop.open .menu-body,
        :host(.compact-popup-open) .card.compact-expanded .queue-action-backdrop.open .queue-action-sheet,
        :host(.compact-popup-open) .card.compact-mode.compact-expanded .queue-action-backdrop.open .queue-action-sheet {
          overflow:auto !important;
          -webkit-overflow-scrolling:touch;
        }
        :host(.compact-popup-open) .card.compact-expanded .queue-action-backdrop.clean-all-confirm-backdrop.open,
        :host(.compact-popup-open) .card.compact-mode.compact-expanded .queue-action-backdrop.clean-all-confirm-backdrop.open {
          padding:max(20px, env(safe-area-inset-top)) 16px max(20px, env(safe-area-inset-bottom)) !important;
          align-items:center !important;
          justify-content:center !important;
        }
        :host(.compact-popup-open) .card.compact-expanded .queue-action-backdrop.clean-all-confirm-backdrop.open .clean-all-confirm-sheet,
        :host(.compact-popup-open) .card.compact-mode.compact-expanded .queue-action-backdrop.clean-all-confirm-backdrop.open .clean-all-confirm-sheet {
          width:min(420px, calc(100% - 36px)) !important;
          max-width:calc(100% - 36px) !important;
          height:auto !important;
          min-height:0 !important;
          max-height:calc(100% - 40px) !important;
          margin:auto !important;
          border-radius:26px !important;
          box-shadow:0 22px 60px rgba(0,0,0,.3) !important;
          overflow:auto !important;
        }
        @media (max-width: 760px) {
          :host(.compact-popup-open) .card.compact-expanded,
          :host(.compact-popup-open) .card.compact-mode.compact-expanded {
            inset:0 !important;
            border-radius:0 !important;
          }
        }
        .card.compact-mode.compact-collapsed {
          height:100%;
          min-height:100%;
          max-height:100%;
          min-width:0;
          border:none;
          border-radius:0;
          background:transparent !important;
          box-shadow:none;
          backdrop-filter:none;
          -webkit-backdrop-filter:none;
          overflow:hidden;
        }
        .card.compact-mode.compact-collapsed > .bg,
        .card.compact-mode.compact-collapsed > .shade,
        .card.compact-mode.compact-collapsed > .glow,
        .card.compact-mode.compact-collapsed > .compact-collapse-fab,
        .card.compact-mode.compact-collapsed > .top-settings-fab,
        .card.compact-mode.compact-collapsed > .home-shortcut-fab {
          display:none !important;
        }
        .card.compact-mode.compact-collapsed .stage {
          display:flex;
          justify-content:center;
          width:100%;
          height:100%;
          min-height:0;
          padding:max(8px, env(safe-area-inset-top)) max(8px, env(safe-area-inset-right)) max(8px, env(safe-area-inset-bottom)) max(8px, env(safe-area-inset-left));
        }
        .compact-shell {
          position:relative;
          display:grid;
          gap:16px;
          width:100%;
          height:100%;
          min-width:0;
          max-height:100%;
          overflow:hidden;
          padding:18px 20px;
          border-radius:32px;
          border:1px solid rgba(255,255,255,.14);
          background:
            linear-gradient(180deg, rgba(14,18,28,.78), rgba(10,12,20,.94)),
            rgba(9,12,18,.82);
          box-shadow:
            0 24px 54px rgba(0,0,0,.28),
            inset 0 1px 0 rgba(255,255,255,.06);
          backdrop-filter:blur(28px);
          -webkit-backdrop-filter:blur(28px);
        }
        .compact-backdrop-art,
        .compact-backdrop-shade,
        .compact-sheen {
          position:absolute;
          inset:0;
          pointer-events:none;
        }
        .compact-backdrop-art {
          inset:-24%;
          background-position:center;
          background-size:cover;
          filter:blur(52px) saturate(1.2) brightness(1.04);
          opacity:.58;
          transform:scale(1.18);
        }
        .compact-backdrop-shade {
          background:
            radial-gradient(circle at 16% 18%, rgba(255,210,126,.2), transparent 26%),
            linear-gradient(135deg, rgba(255,255,255,.08), transparent 34%),
            linear-gradient(180deg, rgba(5,8,14,.12), rgba(5,8,14,.6) 42%, rgba(5,8,14,.82));
        }
        .compact-sheen {
          background:
            radial-gradient(circle at 16% 22%, rgba(241,186,83,.22), transparent 24%),
            radial-gradient(circle at 82% 18%, rgba(255,255,255,.09), transparent 16%),
            radial-gradient(circle at 56% 100%, rgba(225,163,49,.15), transparent 28%);
        }
        .compact-content {
          position:relative;
          z-index:1;
          display:grid;
          gap:18px;
          width:min(100%, 720px);
          margin-inline:auto;
        }
        .compact-header {
          position:relative;
          display:flex;
          justify-content:center;
          align-items:center;
          min-height:38px;
        }
        .compact-player-chip {
          display:inline-flex;
          align-items:center;
          justify-content:center;
          min-width:0;
          max-width:min(100%, 220px);
          min-height:auto;
          padding:0;
          border:none;
          border-radius:0;
          background:transparent;
          color:#f9f5eb;
          cursor:pointer;
          box-shadow:none;
          backdrop-filter:none;
          text-align:center;
        }
        .compact-player-chip.is-playing {
          box-shadow:none;
        }
        .compact-player-copy {
          min-width:0;
          display:block;
        }
        .compact-player-label {
          display:block;
          font-family:var(--homeii-font-family);
          font-size:12px;
          font-weight:800;
          white-space:nowrap;
          overflow:hidden;
          text-overflow:ellipsis;
          letter-spacing:.01em;
        }
        .compact-player-tags {
          display:none;
        }
        .compact-expand-btn,
        .compact-collapse-fab {
          width:38px;
          height:38px;
          border:none;
          border-radius:12px;
          display:grid;
          place-items:center;
          background:transparent;
          color:#f5efe2;
          cursor:pointer;
          box-shadow:none;
          backdrop-filter:none;
        }
        .compact-expand-ref {
          position:absolute;
          top:0;
          right:0;
          border:1px solid rgba(255,255,255,.2);
          border-radius:15px;
          background:
            linear-gradient(145deg, rgba(255,255,255,.18), rgba(255,255,255,.07)),
            rgba(12,16,24,.24);
          box-shadow:
            0 14px 30px rgba(0,0,0,.2),
            inset 0 1px 0 rgba(255,255,255,.18);
          backdrop-filter:blur(16px);
          -webkit-backdrop-filter:blur(16px);
          transition:transform .16s ease, box-shadow .18s ease, background-color .18s ease;
        }
        .card.rtl .compact-expand-ref {
          right:0;
          left:auto;
        }
        .compact-expand-ref:hover {
          transform:translateY(-1px);
          box-shadow:
            0 18px 34px rgba(0,0,0,.24),
            0 0 0 1px color-mix(in srgb, var(--ma-accent) 18%, transparent),
            inset 0 1px 0 rgba(255,255,255,.22);
        }
        .compact-expand-ref:active {
          transform:translateY(1px) scale(.98);
        }
        .compact-expand-ref svg {
          width:24px;
          height:24px;
          opacity:.92;
          filter:drop-shadow(0 2px 5px rgba(0,0,0,.22));
        }
        .compact-collapse-fab {
          position:absolute;
          top:16px;
          z-index:9;
        }
        .compact-collapse-fab,
        .compact-collapse-fab.ltr,
        .compact-collapse-fab.rtl {
          left:16px;
          right:auto;
          inset-inline-start:auto;
          inset-inline-end:auto;
        }
        .card.compact-mode:not(.compact-collapsed) > .top-settings-fab.ltr { inset-inline-start:16px; inset-inline-end:auto; }
        .card.compact-mode:not(.compact-collapsed) > .top-settings-fab.rtl { inset-inline-end:16px; inset-inline-start:auto; }
        .card.control-room-open > .compact-collapse-fab,
        .card.control-room-open > .top-settings-fab,
        .card.control-room-open > .home-shortcut-fab {
          opacity:0 !important;
          pointer-events:none !important;
        }
        .compact-stage {
          display:grid;
          grid-template-columns:132px minmax(0, 1fr);
          gap:16px;
          align-items:center;
          min-width:0;
          width:100%;
          direction:ltr;
        }
        .compact-cover-wrap {
          position:relative;
          display:grid;
          place-items:center;
          justify-self:start;
          width:132px;
          height:132px;
          min-height:0;
          align-self:center;
        }
        .compact-brand-signature {
          position:absolute;
          inset-block-start:-34px;
          left:50%;
          width:142px;
          max-width:150%;
          display:grid;
          place-items:center;
          pointer-events:none;
          z-index:4;
          color:rgba(250,247,238,.72);
          opacity:.98;
          mix-blend-mode:normal;
          transform:translateX(-50%);
          filter:drop-shadow(0 10px 18px rgba(0,0,0,.28)) saturate(.96);
        }
        .compact-brand-logo {
          width:100%;
          height:auto;
          display:block;
          overflow:visible;
        }
        .compact-brand-logo .tablet-brand-home {
          font-size:19px;
          letter-spacing:6.5px;
        }
        .compact-brand-logo .tablet-brand-flow {
          font-size:9.5px;
          letter-spacing:4.5px;
          opacity:.64;
        }
        .compact-brand-logo .tablet-brand-wave {
          opacity:.32;
        }
        .compact-brand-logo .tablet-brand-rule {
          opacity:.2;
        }
        .theme-light .compact-brand-signature {
          color:rgba(24,30,42,.42);
          opacity:.9;
          mix-blend-mode:normal;
          filter:drop-shadow(0 8px 16px rgba(255,255,255,.28)) saturate(.82);
        }
        .art-source-badges {
          position:absolute;
          inset-block-start:10px;
          inset-inline-start:10px;
          z-index:7;
          display:flex;
          align-items:center;
          gap:6px;
          max-width:calc(100% - 20px);
          pointer-events:none;
        }
        .compact-source-badges {
          inset-block-start:6px;
          inset-inline-start:6px;
          max-width:calc(100% - 12px);
        }
        .source-badge {
          min-height:22px;
          padding:0 8px;
          border-radius:999px;
          display:inline-flex;
          align-items:center;
          justify-content:center;
          max-width:100%;
          font-family:var(--homeii-font-family);
          font-size:10px;
          font-weight:900;
          letter-spacing:.01em;
          white-space:nowrap;
          overflow:hidden;
          text-overflow:ellipsis;
          color:#f7fbff;
          background:rgba(10,14,22,.66);
          border:1px solid rgba(255,255,255,.14);
          box-shadow:0 10px 24px rgba(0,0,0,.18);
          backdrop-filter:blur(14px);
          -webkit-backdrop-filter:blur(14px);
        }
        .source-badge.quality {
          color:rgba(255,255,255,.92);
          background:rgba(255,255,255,.12);
        }
        .source-badge.provider-spotify { color:#1ed760; }
        .source-badge.provider-tidal { color:#f8f8f8; }
        .source-badge.provider-youtube { color:#ff6b6b; }
        .source-badge.provider-apple { color:#ffd2df; }
        .source-badge.provider-qobuz { color:#8cd0ff; }
        .source-badge.provider-deezer { color:#ffb36a; }
        .source-badge.provider-library,
        .source-badge.provider-radio { color:#ffe29a; }
        .card.hotel-mode .art-source-badges,
        .card.hotel-mode .media-more-btn,
        .card.hotel-mode .media-layout-btn,
        .card.hotel-mode .queue-head-transfer-btn,
        .card.hotel-mode [data-media-surprise],
        .card.hotel-mode [data-menu-action="connect_this_device"],
        .card.hotel-mode [data-menu-action="disconnect_this_device"] {
          display:none !important;
        }
        .card.hotel-mode .bg {
          background:
            radial-gradient(circle at 50% 18%, color-mix(in srgb, var(--ma-accent) 22%, transparent), transparent 42%),
            linear-gradient(180deg, rgba(12,15,22,.98), rgba(8,10,15,.99)) !important;
          filter:none !important;
          opacity:1 !important;
          transform:none !important;
        }
        .card.hotel-mode .compact-backdrop-art,
        .card.hotel-mode .compact-cover-echo,
        .card.hotel-mode .hero-aura,
        .card.hotel-mode .art-aura {
          background-image:none !important;
        }
        .card.hotel-mode .menu-backdrop::before,
        .card.hotel-mode .menu-sheet::before {
          background-image:none !important;
          opacity:0 !important;
        }
        .card.hotel-mode > .mobile-brand-signature,
        .card.hotel-mode > .tablet-brand-watermark {
          display:flex !important;
          opacity:.88;
        }
        .card.hotel-mode #mobileQuickSearchBtn {
          width:64px;
          min-width:64px;
          height:64px;
          border-radius:22px;
          background:
            radial-gradient(circle at 50% 22%, rgba(255,255,255,.24), transparent 58%),
            linear-gradient(135deg, color-mix(in srgb, var(--ma-accent) 38%, rgba(255,255,255,.12)), rgba(255,255,255,.08));
          border-color:color-mix(in srgb, var(--ma-accent) 42%, rgba(255,255,255,.16));
        }
        .theme-light .source-badge {
          color:#1f2633;
          background:rgba(255,255,255,.84);
          border-color:rgba(143,159,181,.18);
          box-shadow:0 10px 22px rgba(95,112,136,.14);
        }
        .theme-light .source-badge.quality {
          color:#3b4a61;
          background:rgba(240,245,252,.88);
        }
        .compact-cover-echo {
          position:absolute;
          inset:-18px;
          border-radius:30px;
          pointer-events:none;
          background-position:center;
          background-size:cover;
          filter:blur(28px) saturate(1.12);
          opacity:.42;
          transform:scale(1.06);
        }
        .compact-cover {
          position:relative;
          z-index:1;
          width:124px;
          height:124px;
          border:none;
          border-radius:32px;
          background:rgba(255,255,255,.05);
          box-shadow:
            0 14px 28px rgba(0,0,0,.22),
            inset 0 1px 0 rgba(255,255,255,.08),
            0 0 0 1px rgba(255,255,255,.07);
          cursor:pointer;
          overflow:hidden;
        }
        .compact-cover.placeholder {
          display:grid;
          place-items:center;
        }
        .compact-cover-image {
          width:100%;
          height:100%;
          display:block;
          object-fit:contain;
          object-position:center;
          border-radius:inherit;
          padding:2px;
          opacity:.96;
        }
        .compact-cover-image[data-homeii-art-ready="0"] {
          opacity:.96;
        }
        .compact-cover-image[data-homeii-art-ready="1"] {
          transition:opacity .12s ease-out;
        }
        .compact-cover-placeholder {
          position:absolute;
          inset:0;
          display:grid;
          place-items:center;
          color:rgba(255,255,255,.7);
          font-size:22px;
          pointer-events:none;
          opacity:0;
        }
        .compact-cover.placeholder .compact-cover-placeholder {
          opacity:1;
        }
        .compact-cover.placeholder .compact-cover-image {
          display:none;
        }
        .theme-light .compact-cover {
          background:rgba(255,255,255,.14);
        }
        .compact-main {
          min-width:0;
          display:grid;
          gap:4px;
          align-content:start;
          text-align:start;
          padding-top:2px;
        }
        .compact-copy {
          min-width:0;
          display:grid;
          gap:5px;
        }
        .compact-title {
          font-family:var(--homeii-font-family);
          font-size:clamp(15px, 2.4vw, 19px);
          font-weight:700;
          line-height:1.08;
          display:-webkit-box;
          -webkit-line-clamp:2;
          -webkit-box-orient:vertical;
          overflow:hidden;
          text-wrap:balance;
          color:#fffdf7;
        }
        .compact-sub {
          font-family:var(--homeii-font-family);
          font-size:12px;
          font-weight:500;
          line-height:1.3;
          color:rgba(255,255,255,.68);
          white-space:nowrap;
          overflow:hidden;
          text-overflow:ellipsis;
        }
        .up-next-inline {
          min-width:0;
          display:inline-flex;
          align-items:center;
          gap:8px;
          padding:0;
          border:none;
          background:transparent;
          color:inherit;
          text-align:inherit;
          cursor:pointer;
          box-shadow:none;
          backdrop-filter:none;
          -webkit-backdrop-filter:none;
          transition:transform .16s ease, opacity .18s ease;
        }
        .up-next-inline[hidden] {
          display:none !important;
        }
        .up-next-inline:hover {
          transform:translateY(-1px);
          opacity:.92;
        }
        .up-next-inline:active {
          transform:translateY(1px) scale(.99);
        }
        .card.rtl .up-next-inline {
          flex-direction:row-reverse;
        }
        .up-next-art {
          width:22px;
          height:22px;
          min-width:22px;
          border-radius:7px;
          overflow:hidden;
          display:grid;
          place-items:center;
          background:rgba(255,255,255,.08);
          box-shadow:inset 0 1px 0 rgba(255,255,255,.08);
        }
        .up-next-art img {
          width:100%;
          height:100%;
          display:block;
          object-fit:cover;
        }
        .up-next-art-fallback {
          width:14px;
          height:14px;
          display:grid;
          place-items:center;
          color:rgba(255,255,255,.72);
        }
        .up-next-art-fallback .ui-ic {
          width:14px;
          height:14px;
        }
        .up-next-line {
          min-width:0;
          display:flex;
          align-items:center;
          gap:5px;
          line-height:1;
        }
        .card.rtl .up-next-line {
          flex-direction:row-reverse;
        }
        .up-next-prefix {
          flex:0 0 auto;
          font-family:var(--homeii-font-family);
          font-size:11px;
          font-weight:800;
          color:color-mix(in srgb, var(--ma-accent) 62%, rgba(255,255,255,.66));
        }
        .up-next-title {
          font-family:var(--homeii-font-family);
          font-size:12px;
          font-weight:700;
          line-height:1.15;
          white-space:nowrap;
          overflow:hidden;
          text-overflow:ellipsis;
        }
        .compact-up-next {
          margin-top:2px;
          justify-content:flex-start;
          text-align:start;
          max-width:min(320px, 100%);
        }
        .card.rtl .compact-up-next {
          direction:rtl;
          flex-direction:row;
          justify-content:flex-start;
          text-align:right;
        }
        .compact-up-next .up-next-line {
          min-width:0;
          max-width:100%;
        }
        .night-quick-row {
          display:flex;
          flex-wrap:wrap;
          gap:8px;
          align-items:center;
          margin-top:10px;
          justify-content:center;
        }
        .night-quick-row.auto-mode {
          justify-content:center;
        }
        .night-quick-row.on-mode {
          justify-content:center;
        }
        .night-quick-btn {
          min-height:34px;
          padding:0 12px;
          border-radius:999px;
          border:1px solid rgba(255,255,255,.14);
          background:rgba(255,255,255,.08);
          color:inherit;
          display:inline-flex;
          align-items:center;
          gap:8px;
          font:inherit;
          font-size:12px;
          font-weight:850;
          letter-spacing:.01em;
          cursor:pointer;
          box-shadow:0 10px 24px rgba(0,0,0,.12);
          backdrop-filter:blur(18px);
          -webkit-backdrop-filter:blur(18px);
          transition:transform .16s ease, border-color .18s ease, background-color .18s ease, box-shadow .18s ease;
        }
        .night-quick-btn .ui-ic {
          width:16px;
          height:16px;
        }
        .night-quick-btn.icon-only {
          width:34px;
          min-width:34px;
          height:34px;
          min-height:34px;
          padding:0;
          justify-content:center;
          border-radius:999px;
        }
        .night-quick-btn.icon-only .ui-ic {
          width:17px;
          height:17px;
        }
        .night-quick-btn.soft {
          background:rgba(255,255,255,.05);
        }
        .night-quick-btn.active {
          border-color:color-mix(in srgb, var(--ma-accent) 32%, rgba(171,185,255,.46));
          background:linear-gradient(135deg, color-mix(in srgb, var(--ma-accent) 16%, rgba(111,126,255,.16)), rgba(255,255,255,.08));
          box-shadow:0 12px 28px color-mix(in srgb, var(--ma-accent) 12%, rgba(7,10,20,.22));
        }
        .theme-light .night-quick-btn {
          background:rgba(255,255,255,.72);
          border-color:rgba(147,161,183,.2);
          box-shadow:0 10px 24px rgba(110,127,153,.12);
        }
        .theme-light .night-quick-btn.soft {
          background:rgba(255,255,255,.56);
        }
        .theme-light .night-quick-btn.active {
          background:linear-gradient(135deg, color-mix(in srgb, var(--ma-accent) 20%, white 80%), rgba(255,255,255,.88));
        }
        .compact-copy .night-quick-row {
          margin-top:8px;
        }
        .compact-copy .night-quick-btn {
          min-height:30px;
          padding:0 10px;
          font-size:11px;
          box-shadow:none;
          background:rgba(255,255,255,.06);
        }
        .compact-copy .night-quick-btn.icon-only {
          width:30px;
          min-width:30px;
          height:30px;
          min-height:30px;
          padding:0;
        }
        .compact-controls {
          display:flex;
          align-items:center;
          justify-content:center;
          gap:22px;
          min-width:0;
          direction:ltr;
          margin-top:2px;
        }
        .compact-controls button {
          color:#fffdf8;
        }
        .compact-control-btn {
          width:48px !important;
          height:48px !important;
          border-radius:50% !important;
          background:transparent !important;
          border:none !important;
          box-shadow:none !important;
          backdrop-filter:none !important;
        }
        .compact-control-btn .ui-ic {
          width:24px;
          height:24px;
        }
        .compact-main-btn {
          width:66px !important;
          height:66px !important;
          border-radius:50% !important;
          background:rgba(255,255,255,.09) !important;
          border:1px solid rgba(255,255,255,.1) !important;
          box-shadow:
            0 10px 22px rgba(0,0,0,.15),
            inset 0 1px 0 rgba(255,255,255,.07) !important;
        }
        .compact-main-btn .ui-ic {
          width:28px;
          height:28px;
        }
        .compact-progress-row {
          display:grid;
          grid-template-columns:auto minmax(0,1fr) auto;
          align-items:center;
          gap:10px;
          direction:ltr;
          width:min(100%, 92%);
          margin:2px auto 0;
        }
        .compact-progress-time {
          font-size:11px;
          font-weight:700;
          color:rgba(255,255,255,.6);
          font-variant-numeric:tabular-nums;
        }
        .compact-progress-track {
          min-width:0;
          height:5px;
          border-radius:999px;
          background:rgba(255,255,255,.18);
          box-shadow:inset 0 1px 2px rgba(0,0,0,.12);
          overflow:hidden;
        }
        .compact-progress-track .progress-fill {
          background:linear-gradient(90deg, rgba(250,226,157,.98), rgba(255,255,255,.9));
          opacity:.98;
        }
        .compact-volume-inline {
          width:min(100%, 300px);
          margin-inline:auto;
          padding:0;
          border-radius:0;
          background:transparent;
          border:none;
          backdrop-filter:none;
          display:grid !important;
          grid-template-columns:auto auto minmax(0,1fr) auto;
          gap:10px;
          align-items:center;
          box-shadow:none;
        }
        .compact-volume-inline.has-volume-step-buttons {
          grid-template-columns:auto auto auto minmax(0,1fr) auto auto;
          gap:8px;
        }
        .compact-volume-inline .volume-step-btn {
          width:32px;
          min-width:32px;
          height:32px;
          color:rgba(255,248,232,.9);
        }
        .compact-volume-track {
          min-width:0;
        }
        .compact-volume-slider {
          width:100%;
          height:18px;
          appearance:none;
          direction:ltr;
          background:transparent;
          outline:none;
        }
        .compact-volume-slider::-webkit-slider-runnable-track {
          height:4px;
          border-radius:999px;
          background:linear-gradient(to right,var(--ma-accent) 0%,var(--ma-accent) var(--vol-pct,50%),rgba(255,255,255,.22) var(--vol-pct,50%),rgba(255,255,255,.22) 100%);
        }
        .compact-volume-slider::-webkit-slider-thumb {
          appearance:none;
          width:14px;
          height:14px;
          margin-top:-5px;
          border-radius:50%;
          background:#fff7dc;
          border:none;
          box-shadow:0 2px 8px rgba(0,0,0,.18);
        }
        .compact-volume-slider::-moz-range-track {
          height:4px;
          border-radius:999px;
          background:rgba(255,255,255,.22);
        }
        .compact-volume-slider::-moz-range-progress {
          height:4px;
          border-radius:999px;
          background:var(--ma-accent);
        }
        .compact-volume-slider::-moz-range-thumb {
          width:14px;
          height:14px;
          border-radius:50%;
          background:#fff7dc;
          border:none;
          box-shadow:0 2px 8px rgba(0,0,0,.18);
        }
        .compact-volume-value {
          min-width:40px;
          font-weight:700;
          font-size:11px;
          text-align:end;
          color:rgba(255,255,255,.62);
        }
        .compact-mute-btn {
          width:36px !important;
          height:36px !important;
          border-radius:50% !important;
          background:
            linear-gradient(145deg, rgba(255,255,255,.14), rgba(255,255,255,.055)) !important;
          border:1px solid rgba(255,255,255,.14) !important;
          box-shadow:
            0 10px 20px rgba(0,0,0,.14),
            inset 0 1px 0 rgba(255,255,255,.13) !important;
          padding:0 !important;
          color:rgba(255,248,232,.94) !important;
        }
        .compact-mute-btn .ui-ic {
          width:28px;
          height:28px;
        }
        .compact-mute-btn.muted {
          color:#ffcfbd !important;
        }
        .theme-light .compact-shell {
          border-color:rgba(255,255,255,.28);
          background:
            linear-gradient(180deg, rgba(255,255,255,.28), rgba(255,255,255,.16)),
            rgba(244,248,252,.18);
          box-shadow:
            0 24px 52px rgba(101,116,143,.16),
            inset 0 1px 0 rgba(255,255,255,.38);
        }
        .theme-light .compact-backdrop-art {
          opacity:.58;
          filter:blur(58px) saturate(1.04) brightness(1.02);
        }
        .theme-light .compact-backdrop-shade {
          background:
            radial-gradient(circle at 18% 22%, rgba(255,236,192,.22), transparent 24%),
            linear-gradient(180deg, rgba(248,250,255,.18), rgba(235,241,248,.42)),
            rgba(232,238,246,.34);
        }
        .theme-light .compact-sheen {
          background:
            radial-gradient(circle at 16% 18%, rgba(255,220,160,.16), transparent 24%),
            radial-gradient(circle at 72% 56%, rgba(255,255,255,.2), transparent 30%),
            radial-gradient(circle at 50% 100%, rgba(216,186,144,.14), transparent 24%);
        }
        .theme-light .compact-player-chip,
        .theme-light .compact-volume-inline {
          color:#243144;
          background:transparent;
          border-color:rgba(153,167,188,.24);
        }
        .theme-light .compact-progress-time,
        .theme-light .compact-volume-value,
        .theme-light .compact-sub {
          color:rgba(43,57,76,.78);
        }
        .theme-light .compact-title {
          color:#1d2938;
        }
        .theme-light .compact-controls button,
        .theme-light .compact-mute-btn {
          color:#243144;
        }
        .theme-light .compact-expand-ref,
        .theme-light .compact-mute-btn {
          background:
            linear-gradient(145deg, rgba(255,255,255,.76), rgba(255,255,255,.38)) !important;
          border-color:rgba(142,157,180,.2) !important;
          box-shadow:
            0 12px 24px rgba(104,120,145,.16),
            inset 0 1px 0 rgba(255,255,255,.72) !important;
        }
        .card.rtl .compact-main {
          direction:rtl;
          text-align:right;
        }
        @media (max-width: 760px) {
          .compact-shell {
            gap:16px;
            padding:16px;
          }
          .compact-stage {
            grid-template-columns:116px minmax(0,1fr);
            gap:14px;
          }
          .compact-cover-wrap {
            width:116px;
            height:116px;
          }
          .compact-cover {
            width:108px;
            height:108px;
            border-radius:28px;
          }
          .compact-title {
            font-size:clamp(15px, 3.2vw, 18px);
          }
        }
        @media (max-width: 520px) {
          .compact-shell {
            border-radius:28px;
            padding:16px;
          }
          .compact-content {
            gap:16px;
          }
          .compact-header {
            min-height:36px;
          }
          .compact-stage {
            grid-template-columns:110px minmax(0,1fr);
            gap:12px;
            align-items:center;
          }
          .compact-cover-wrap {
            width:110px;
            height:110px;
          }
          .compact-cover {
            width:104px;
            height:104px;
            border-radius:28px;
          }
          .compact-main {
            gap:5px;
          }
          .compact-title {
            font-size:clamp(14px, 4.1vw, 17px);
          }
          .compact-sub {
            font-size:calc(11px * var(--v2-font-scale));
          }
          .compact-controls {
            gap:22px;
          }
          .compact-control-btn {
            width:44px !important;
            height:44px !important;
          }
          .compact-control-btn .ui-ic { width:22px; height:22px; }
          .compact-main-btn {
            width:58px !important;
            height:58px !important;
          }
          .compact-main-btn .ui-ic { width:25px; height:25px; }
          .compact-progress-row {
            gap:7px;
            width:100%;
          }
          .compact-progress-time {
            font-size:10px;
          }
          .compact-volume-inline {
            width:min(100%, 260px);
          }
        }
        .card.compact-mode.compact-mini-widget .stage {
          padding:max(6px, env(safe-area-inset-top)) max(6px, env(safe-area-inset-right)) max(6px, env(safe-area-inset-bottom)) max(6px, env(safe-area-inset-left)) !important;
        }
        .card.compact-mode.compact-mini-widget .compact-shell {
          gap:0;
          padding:14px 14px 15px;
          border-radius:24px;
          min-height:0;
          position:relative;
        }
        .card.compact-mode.compact-mini-widget .compact-content {
          width:100%;
          max-width:none;
          height:100%;
          min-height:0;
          align-content:center;
          gap:10px 12px;
          grid-template-columns:82px minmax(0,1fr) 34px;
          grid-template-rows:34px minmax(58px, auto) 46px 42px;
          grid-template-areas:
            ". player ."
            "cover copy ."
            "cover controls controls"
            "volume volume volume";
          align-items:center;
        }
        .card.compact-mode.compact-mini-widget .compact-header,
        .card.compact-mode.compact-mini-widget .compact-stage {
          display:contents;
        }
        .card.compact-mode.compact-mini-widget .compact-brand-signature,
        .card.compact-mode.compact-mini-widget .compact-source-badges,
        .card.compact-mode.compact-mini-widget .compact-cover-echo,
        .card.compact-mode.compact-mini-widget .compact-progress-row,
        .card.compact-mode.compact-mini-widget .compact-up-next,
        .card.compact-mode.compact-mini-widget .night-quick-row {
          display:none !important;
        }
        .card.compact-mode.compact-mini-widget .compact-player-chip {
          grid-area:player;
          display:inline-flex !important;
          justify-self:center;
          align-self:center;
          width:auto;
          max-width:min(230px, calc(100% - 44px));
          min-height:30px !important;
          height:30px !important;
          padding:0 14px !important;
          border:1px solid rgba(255,255,255,.16) !important;
          border-radius:999px !important;
          background:rgba(18,22,31,.46) !important;
          color:rgba(255,255,255,.9) !important;
          box-shadow:inset 0 1px 0 rgba(255,255,255,.12), 0 8px 20px rgba(0,0,0,.18) !important;
          backdrop-filter:blur(14px) !important;
          -webkit-backdrop-filter:blur(14px) !important;
          z-index:5;
        }
        .card.compact-mode.compact-mini-widget .compact-player-copy {
          min-width:0;
          display:block;
        }
        .card.compact-mode.compact-mini-widget .compact-player-label {
          display:block;
          max-width:100%;
          font-size:11px;
          line-height:1;
          overflow:hidden;
          text-overflow:ellipsis;
          white-space:nowrap;
        }
        .card.compact-mode.compact-mini-widget .compact-expand-ref {
          position:absolute !important;
          top:9px;
          right:9px;
          width:30px !important;
          min-width:30px !important;
          height:30px !important;
          min-height:30px !important;
          border-radius:10px;
          z-index:6;
          padding:0 !important;
        }
        .card.compact-mode.compact-mini-widget .compact-expand-ref svg {
          width:15px;
          height:15px;
        }
        .card.compact-mode.compact-mini-widget .compact-cover-wrap {
          grid-area:cover;
          width:82px;
          height:82px;
          justify-self:start;
          align-self:center;
        }
        .card.compact-mode.compact-mini-widget .compact-cover {
          width:78px !important;
          height:78px !important;
          border-radius:18px;
        }
        .card.compact-mode.compact-mini-widget .compact-cover-image {
          object-fit:contain;
          padding:0;
        }
        .card.compact-mode.compact-mini-widget .compact-main {
          grid-area:copy;
          padding:0;
          align-self:center;
          min-width:0;
          padding-inline-end:6px;
        }
        .card.compact-mode.compact-mini-widget .compact-copy {
          gap:2px;
        }
        .card.compact-mode.compact-mini-widget .compact-title {
          font-size:clamp(15px, 3.8vw, 18px);
          line-height:1.12;
          -webkit-line-clamp:1;
          text-wrap:normal;
        }
        .card.compact-mode.compact-mini-widget .compact-sub {
          font-size:11.5px;
          line-height:1.2;
        }
        .card.compact-mode.compact-mini-widget .compact-controls {
          grid-area:controls;
          justify-content:center;
          justify-self:stretch;
          gap:10px;
          margin:0;
        }
        .card.compact-mode.compact-mini-widget .compact-control-btn {
          width:34px !important;
          min-width:34px !important;
          height:34px !important;
          min-height:34px !important;
        }
        .card.compact-mode.compact-mini-widget .compact-control-btn .ui-ic {
          width:17px;
          height:17px;
        }
        .card.compact-mode.compact-mini-widget .compact-main-btn {
          width:46px !important;
          min-width:46px !important;
          height:46px !important;
          min-height:46px !important;
          border-width:1px !important;
        }
        .card.compact-mode.compact-mini-widget .compact-main-btn .ui-ic {
          width:20px;
          height:20px;
        }
        .card.compact-mode.compact-mini-widget .compact-volume-inline {
          grid-area:volume;
          width:100%;
          max-width:none;
          justify-self:stretch;
          margin:0;
          gap:8px;
          min-height:40px;
          grid-template-columns:auto minmax(118px,1fr) auto;
        }
        .card.compact-mode.compact-mini-widget .compact-volume-inline.has-volume-step-buttons {
          grid-template-columns:auto auto minmax(118px,1fr) auto auto;
          gap:8px;
        }
        .card.compact-mode.compact-mini-widget .compact-volume-track {
          display:block !important;
          min-width:118px;
          order:3;
        }
        .card.compact-mode.compact-mini-widget .compact-volume-slider {
          height:20px;
        }
        .card.compact-mode.compact-mini-widget .compact-mute-btn {
          width:34px !important;
          min-width:34px !important;
          height:34px !important;
          min-height:34px !important;
          order:1;
        }
        .card.compact-mode.compact-mini-widget .compact-mute-btn .ui-ic {
          width:18px;
          height:18px;
        }
        .card.compact-mode.compact-mini-widget .compact-volume-inline .volume-step-btn {
          width:34px;
          min-width:34px;
          height:34px;
          min-height:34px;
          border-radius:999px;
        }
        .card.compact-mode.compact-mini-widget .compact-volume-inline .volume-step-btn .ui-ic {
          width:16px;
          height:16px;
        }
        .card.compact-mode.compact-mini-widget .compact-volume-inline .volume-step-minus {
          order:2;
        }
        .card.compact-mode.compact-mini-widget .compact-volume-inline .volume-step-plus {
          order:4;
        }
        .card.compact-mode.compact-mini-widget .compact-volume-value {
          min-width:40px;
          font-size:11px;
          text-align:center;
          order:5;
        }
        @media (max-width: 360px) {
          .card.compact-mode.compact-mini-widget .compact-content {
            grid-template-columns:66px minmax(0,1fr) 30px;
            grid-template-rows:30px minmax(50px, auto) 40px 38px;
            grid-template-areas:
              ". player ."
              "cover copy ."
              "cover controls controls"
              "volume volume volume";
            gap:8px 8px;
          }
          .card.compact-mode.compact-mini-widget .compact-cover-wrap {
            width:66px;
            height:66px;
          }
          .card.compact-mode.compact-mini-widget .compact-cover {
            width:62px !important;
            height:62px !important;
            border-radius:15px;
          }
          .card.compact-mode.compact-mini-widget .compact-control-btn {
            width:30px !important;
            min-width:30px !important;
            height:30px !important;
            min-height:30px !important;
          }
          .card.compact-mode.compact-mini-widget .compact-main-btn {
            width:40px !important;
            min-width:40px !important;
            height:40px !important;
            min-height:40px !important;
          }
          .card.compact-mode.compact-mini-widget .compact-expand-ref {
            top:9px;
            right:9px;
            width:28px !important;
            min-width:28px !important;
            height:28px !important;
            min-height:28px !important;
          }
          .card.compact-mode.compact-mini-widget .compact-player-chip {
            height:28px !important;
            min-height:28px !important;
            max-width:min(174px, calc(100% - 36px));
            padding:0 10px !important;
          }
          .card.compact-mode.compact-mini-widget .compact-volume-inline {
            width:100%;
            gap:6px;
            min-height:36px;
            grid-template-columns:auto minmax(84px,1fr) auto;
          }
          .card.compact-mode.compact-mini-widget .compact-volume-inline.has-volume-step-buttons {
            grid-template-columns:auto auto minmax(84px,1fr) auto auto;
          }
          .card.compact-mode.compact-mini-widget .compact-volume-track {
            min-width:84px;
          }
          .card.compact-mode.compact-mini-widget .compact-volume-inline .volume-step-btn,
          .card.compact-mode.compact-mini-widget .compact-mute-btn {
            width:30px !important;
            min-width:30px !important;
            height:30px !important;
            min-height:30px !important;
          }
        }
        @media (max-width: 320px) {
          .card.compact-mode.compact-mini-widget .compact-shell {
            padding:11px 10px 12px;
          }
          .card.compact-mode.compact-mini-widget .compact-content {
            grid-template-columns:60px minmax(0,1fr) 28px;
            grid-template-rows:28px minmax(46px, auto) 38px 36px;
            grid-template-areas:
              ". player ."
              "cover copy ."
              "cover controls controls"
              "volume volume volume";
            gap:7px 6px;
          }
          .card.compact-mode.compact-mini-widget .compact-cover-wrap {
            width:60px;
            height:60px;
          }
          .card.compact-mode.compact-mini-widget .compact-cover {
            width:56px !important;
            height:56px !important;
            border-radius:14px;
          }
          .card.compact-mode.compact-mini-widget .compact-control-btn {
            width:28px !important;
            min-width:28px !important;
            height:28px !important;
            min-height:28px !important;
          }
          .card.compact-mode.compact-mini-widget .compact-main-btn {
            width:38px !important;
            min-width:38px !important;
            height:38px !important;
            min-height:38px !important;
          }
          .card.compact-mode.compact-mini-widget .compact-expand-ref {
            top:8px;
            right:8px;
            width:25px !important;
            min-width:25px !important;
            height:25px !important;
            min-height:25px !important;
          }
          .card.compact-mode.compact-mini-widget .compact-title {
            font-size:13px;
          }
          .card.compact-mode.compact-mini-widget .compact-sub,
          .card.compact-mode.compact-mini-widget .compact-volume-value {
            font-size:10px;
          }
        }
        .card.compact-mode {
          border-radius:22px;
        }
        .card.compact-mode .stage {
          gap:6px;
          padding:max(12px, env(safe-area-inset-top)) max(12px, env(safe-area-inset-right)) max(12px, env(safe-area-inset-bottom)) max(12px, env(safe-area-inset-left));
        }
        .card.compact-mode .center,
        .card.compact-mode .bottom,
        .card.compact-mode .tablet-main {
          gap:8px !important;
        }
        .card.compact-mode .hero-title {
          font-size:var(--flow-compact-title-size) !important;
          line-height:.92 !important;
        }
        .card.compact-mode .hero-sub {
          font-size:14px !important;
          line-height:1.25 !important;
        }
        .card.compact-mode .mobile-art-fab {
          width:40px !important;
          min-width:40px !important;
          height:40px !important;
        }
        .card.compact-mode .side-btn {
          width:54px !important;
          height:54px !important;
        }
        .card.compact-mode .main-btn {
          width:82px !important;
          height:82px !important;
        }
        .card.compact-mode .footer-btn {
          min-height:42px !important;
          padding:10px 12px !important;
        }
        .card.compact-mode .progress-line {
          margin-top:0 !important;
        }
        .card.compact-mode .progress-time {
          font-size:12px !important;
        }
        .card.compact-mode .notice {
          padding:8px 10px !important;
          min-height:0 !important;
        }
        .card.compact-mode .mobile-volume-inline {
          margin-top:2px;
        }
        .stage {
          position:relative; z-index:1; height:100%;
          width:100%;
          max-width:100%;
          min-width:0;
          display:grid; grid-template-rows:minmax(0,1fr) auto auto;
          gap:8px;
          padding:max(var(--flow-stage-pad-block), env(safe-area-inset-top)) max(var(--flow-stage-pad-inline), env(safe-area-inset-right)) max(var(--flow-stage-pad-block), env(safe-area-inset-bottom)) max(var(--flow-stage-pad-inline), env(safe-area-inset-left));
        }
        .card.mobile-layout-forced-full:not(.layout-tablet).height-short .stage,
        .card.mobile-layout-forced-full:not(.layout-tablet).height-tight .stage {
          overflow-y:auto;
          overscroll-behavior:contain;
          -webkit-overflow-scrolling:touch;
          grid-template-rows:auto auto auto;
          align-content:start;
        }
        .card.mobile-layout-forced-full:not(.layout-tablet).height-short .center,
        .card.mobile-layout-forced-full:not(.layout-tablet).height-tight .center {
          overflow:visible;
        }
        .card.layout-tablet .stage {
          gap:0;
          padding:max(var(--flow-stage-pad-block), env(safe-area-inset-top)) max(var(--flow-stage-pad-block), env(safe-area-inset-right)) max(var(--flow-stage-pad-block), env(safe-area-inset-bottom)) max(var(--flow-stage-pad-block), env(safe-area-inset-left));
          grid-template-rows:minmax(0,1fr);
          align-content:stretch;
          min-height:0;
        }
        .card.layout-tablet .tablet-shell {
          width:100%;
          height:100%;
          display:grid;
          grid-template-columns:var(--tablet-rail) minmax(0, 1fr);
          gap:var(--flow-shell-gap);
          align-items:stretch;
          min-height:0;
          overflow:hidden;
        }
        .card.layout-tablet .tablet-main {
          min-width:0;
          display:grid;
          grid-template-rows:minmax(0,1fr) auto;
          gap:12px;
          align-content:stretch;
          justify-items:center;
          min-height:0;
          height:100%;
        }
        `;
}
