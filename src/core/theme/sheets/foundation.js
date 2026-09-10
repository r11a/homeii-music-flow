// foundation styles. Order is preserved by card-styles.js.
export default function({ hostMinWidth, height, minCardHeight, fontScale, iconScale, customRgb, customText, customColor, fullInlineTargetHeight }) {
  return `
        :host { display:block; container-type:inline-size; container-name:homeii-flow-host; width:100%; min-width:${hostMinWidth}; max-width:100%; margin:0 !important; padding:0 !important; background:transparent !important; border:none !important; box-shadow:none !important; overflow:hidden !important; border-radius:var(--ma-radius-xl); --ma-radius-xl:28px; --mobile-height:${height}px; --mobile-min-height:${minCardHeight}px; --v2-font-scale:${fontScale}; --v2-icon-scale:${iconScale}; --v2-custom-rgb:${customRgb}; --v2-custom-text:${customText}; --accent-color:${customColor}; --ma-accent: var(--accent-color, #e0a11b); }
        ha-card { background:transparent !important; border:none !important; box-shadow:none !important; overflow:hidden !important; border-radius:var(--ma-radius-xl); }
        * { box-sizing:border-box; }
        .side-btn .ui-ic,
        .main-btn .ui-ic,
        .volume-btn .ui-ic,
        .mobile-art-fab .ui-ic,
        .footer-btn .ui-ic,
        .compact-control-btn .ui-ic,
        .compact-main-btn .ui-ic,
        .empty-voice-btn .ui-ic {
          transform:scale(var(--v2-icon-scale, 1));
          transform-origin:center;
        }
        .card {
          position:relative; overflow:hidden; isolation:isolate; color:#fff;
          container-type:inline-size;
          container-name:homeii-flow-card;
          width:100%;
          max-width:100%;
          height:var(--mobile-height);
          min-height:min(var(--mobile-min-height), var(--mobile-height));
          max-height:var(--mobile-height);
          border-radius:var(--ma-radius-xl); border:1px solid rgba(255,255,255,.1);
          background:#0c0f16; box-shadow:0 24px 56px rgba(0,0,0,.3);
          font-size:calc(16px * var(--v2-font-scale));
          --flow-stage-pad-block:16px;
          --flow-stage-pad-inline:14px;
          --flow-shell-gap:28px;
          --flow-tablet-rail:102px;
          --flow-tablet-max:calc(100cqi - 34px);
          --flow-hero-gap:40px;
          --flow-hero-info-min:300px;
          --flow-hero-aura-width:min(980px, 74cqi);
          --flow-hero-aura-height:260px;
          --flow-tablet-aura-width:min(820px, 56cqi);
          --flow-tablet-aura-height:320px;
          --flow-tablet-title-size:30px;
          --flow-tablet-sub-size:14px;
          --flow-compact-title-size:64px;
          --flow-side-btn-size:58px;
          --flow-minor-btn-size:48px;
          --flow-main-btn-size:118px;
          --flow-tablet-side-btn-size:64px;
          --flow-tablet-minor-btn-size:54px;
          --flow-tablet-main-btn-size:110px;
          --flow-art-aura-size:min(420px, 42cqi);
          --flow-tablet-art-aura-size:min(520px, 42cqi);
          --flow-mobile-art-size:clamp(190px, min(72cqi, var(--flow-mobile-art-budget)), 420px);
          --flow-art-stack-height:var(--flow-mobile-art-size);
          --flow-art-card-size:var(--flow-mobile-art-size);
          --flow-art-card-max-size:var(--flow-art-stack-height);
          --flow-autofit-art-height:clamp(320px, min(34cqi, var(--flow-tablet-art-budget)), 620px);
          --flow-dense-art-height:clamp(250px, min(28cqi, var(--flow-tablet-dense-art-budget)), 480px);
          --flow-sheet-gutter:96px;
          --flow-sheet-queue-gutter:160px;
          --flow-sheet-narrow-gutter:180px;
          --flow-sheet-pad-block:18px;
          --flow-sheet-pad-inline:24px;
          --flow-media-grid-thumb:clamp(148px, 42cqi, 188px);
          --flow-tablet-media-grid-thumb:clamp(178px, 18cqi, 224px);
          --flow-control-room-brand-width:clamp(118px, 18cqi, 210px);
          --flow-full-mobile-target-height:${fullInlineTargetHeight}px;
        }
        .card.size-xs {
          --flow-stage-pad-block:12px;
          --flow-stage-pad-inline:10px;
          --flow-shell-gap:16px;
          --flow-hero-gap:20px;
          --flow-tablet-rail:86px;
          --flow-tablet-title-size:24px;
          --flow-tablet-sub-size:12px;
          --flow-compact-title-size:44px;
          --flow-side-btn-size:48px;
          --flow-minor-btn-size:40px;
          --flow-main-btn-size:84px;
          --flow-tablet-side-btn-size:54px;
          --flow-tablet-minor-btn-size:46px;
          --flow-tablet-main-btn-size:92px;
          --flow-mobile-art-size:clamp(156px, min(66cqi, var(--flow-mobile-short-art-budget)), 286px);
          --flow-art-stack-height:var(--flow-mobile-art-size);
          --flow-art-card-size:var(--flow-mobile-art-size);
          --flow-autofit-art-height:clamp(230px, min(52cqi, var(--flow-tablet-art-budget)), 340px);
          --flow-dense-art-height:clamp(210px, min(48cqi, var(--flow-tablet-dense-art-budget)), 300px);
          --flow-sheet-gutter:28px;
          --flow-sheet-queue-gutter:28px;
          --flow-sheet-narrow-gutter:28px;
          --flow-sheet-pad-inline:12px;
          --flow-media-grid-thumb:clamp(132px, 52cqi, 164px);
        }
        .card.size-sm {
          --flow-stage-pad-block:14px;
          --flow-stage-pad-inline:12px;
          --flow-shell-gap:20px;
          --flow-hero-gap:24px;
          --flow-tablet-rail:92px;
          --flow-tablet-title-size:26px;
          --flow-compact-title-size:52px;
          --flow-side-btn-size:52px;
          --flow-main-btn-size:96px;
          --flow-tablet-side-btn-size:58px;
          --flow-tablet-main-btn-size:100px;
          --flow-mobile-art-size:clamp(170px, min(68cqi, var(--flow-mobile-art-budget)), 340px);
          --flow-art-stack-height:var(--flow-mobile-art-size);
          --flow-art-card-size:var(--flow-mobile-art-size);
          --flow-sheet-gutter:40px;
          --flow-sheet-queue-gutter:48px;
          --flow-sheet-narrow-gutter:48px;
          --flow-media-grid-thumb:clamp(142px, 44cqi, 174px);
        }
        .card.size-md {
          --flow-shell-gap:22px;
          --flow-hero-gap:28px;
          --flow-tablet-rail:96px;
          --flow-tablet-title-size:28px;
          --flow-compact-title-size:58px;
          --flow-sheet-gutter:56px;
          --flow-sheet-queue-gutter:72px;
          --flow-sheet-narrow-gutter:72px;
        }
        .card.size-lg {
          --flow-shell-gap:28px;
          --flow-hero-gap:36px;
        }
        .card.size-xl {
          --flow-shell-gap:34px;
          --flow-hero-gap:46px;
          --flow-tablet-title-size:34px;
          --flow-tablet-sub-size:16px;
          --flow-compact-title-size:76px;
        }
        .card.height-short {
          --flow-stage-pad-block:10px;
          --flow-shell-gap:16px;
          --flow-hero-gap:22px;
          --flow-tablet-title-size:24px;
          --flow-tablet-sub-size:12px;
          --flow-compact-title-size:42px;
          --flow-side-btn-size:48px;
          --flow-minor-btn-size:40px;
          --flow-main-btn-size:86px;
          --flow-tablet-side-btn-size:54px;
          --flow-tablet-minor-btn-size:46px;
          --flow-tablet-main-btn-size:92px;
          --flow-hero-aura-height:190px;
          --flow-tablet-aura-height:230px;
          --flow-mobile-art-size:clamp(142px, min(58cqi, var(--flow-mobile-short-art-budget)), 280px);
          --flow-art-stack-height:var(--flow-mobile-art-size);
          --flow-art-card-size:var(--flow-mobile-art-size);
          --flow-autofit-art-height:clamp(220px, min(24cqi, var(--flow-tablet-art-budget)), 360px);
          --flow-dense-art-height:clamp(200px, min(22cqi, var(--flow-tablet-dense-art-budget)), 320px);
          --flow-sheet-pad-block:12px;
        }
        .card.height-tight {
          --flow-stage-pad-block:8px;
          --flow-shell-gap:12px;
          --flow-hero-gap:14px;
          --flow-tablet-rail:78px;
          --flow-tablet-title-size:20px;
          --flow-tablet-sub-size:11px;
          --flow-compact-title-size:34px;
          --flow-side-btn-size:42px;
          --flow-minor-btn-size:36px;
          --flow-main-btn-size:72px;
          --flow-tablet-side-btn-size:44px;
          --flow-tablet-minor-btn-size:38px;
          --flow-tablet-main-btn-size:76px;
          --flow-hero-aura-height:150px;
          --flow-tablet-aura-height:180px;
          --flow-mobile-art-size:clamp(122px, min(50cqi, var(--flow-mobile-tight-art-budget)), 220px);
          --flow-art-stack-height:var(--flow-mobile-art-size);
          --flow-art-card-size:var(--flow-mobile-art-size);
          --flow-autofit-art-height:clamp(168px, min(20cqi, var(--flow-tablet-art-budget)), 260px);
          --flow-dense-art-height:clamp(152px, min(18cqi, var(--flow-tablet-dense-art-budget)), 230px);
          --flow-sheet-pad-block:10px;
        }
        .card button,
        .card input,
        .card select,
        .card textarea { font:inherit; }
        .theme-light.card {
          color:#1f2633;
          border-color:rgba(135,152,178,.22);
          background:#eef2f7;
          box-shadow:0 22px 56px rgba(73,89,110,.18);
        }
        .theme-custom.card {
          color:var(--v2-custom-text, #fff);
          border-color:rgba(var(--v2-custom-rgb) / .18);
          background:rgba(var(--v2-custom-rgb) / .14);
          box-shadow:0 22px 56px rgba(0,0,0,.16);
        }
        .card.dynamic-theme {
          border-color:rgba(var(--dynamic-accent-rgb, 224 161 27) / .24);
          box-shadow:
            0 24px 56px rgba(0,0,0,.28),
            0 0 0 1px rgba(var(--dynamic-accent-rgb, 224 161 27) / .08),
            0 18px 42px rgba(var(--dynamic-glow-rgb, 255 178 56) / .12);
        }
        .theme-light.card.dynamic-theme {
          box-shadow:
            0 22px 56px rgba(73,89,110,.16),
            0 0 0 1px rgba(var(--dynamic-accent-rgb, 224 161 27) / .08),
            0 18px 40px rgba(var(--dynamic-glow-rgb, 255 178 56) / .1);
        }
        .bg,.shade,.glow { position:absolute; inset:0; pointer-events:none; }
        .bg {
          background:
            radial-gradient(circle at 18% 20%, rgba(255,181,64,.18), transparent 34%),
            linear-gradient(180deg, rgba(9,12,19,.34), rgba(9,12,19,.94)),
            #0c0f16;
          background-position:center center; background-size:cover; background-repeat:no-repeat;
          filter:blur(30px) saturate(1.08); transform:scale(1.08); opacity:.9;
          overflow:hidden;
          will-change:transform, opacity;
        }
        .bg::before,
        .bg::after {
          content:"";
          position:absolute;
          inset:-1px;
          background:var(--homeii-bg-art-current, none) center / cover no-repeat;
          opacity:.72;
          pointer-events:none;
          transition:opacity .52s cubic-bezier(.22,.78,.24,1);
          will-change:opacity;
        }
        .bg::after {
          background:var(--homeii-bg-art-next, none) center / cover no-repeat;
          opacity:0;
        }
        .bg.bg-art-transitioning::before {
          opacity:0;
        }
        .bg.bg-art-transitioning::after {
          opacity:.72;
        }
        @media (prefers-reduced-motion: reduce) {
          .bg::before,
          .bg::after {
            transition:none !important;
          }
        }
        .shade {
          background:linear-gradient(180deg, rgba(9,12,19,.18), rgba(9,12,19,.78) 38%, rgba(9,12,19,.98));
          will-change:opacity, filter;
        }
        .glow {
          background:radial-gradient(circle at 50% 76%, rgba(255,178,56,.2), transparent 30%);
          will-change:transform, opacity;
        }
        @keyframes backgroundFloat {
          0% { transform:translate3d(0, 0, 0) scale(var(--bg-motion-scale, 1.13)); opacity:.9; }
          22% { transform:translate3d(calc(var(--bg-motion-shift, 28px) * .62), calc(var(--bg-motion-shift, 28px) * -.42), 0) scale(calc(var(--bg-motion-scale, 1.13) + .024)); opacity:.98; }
          52% { transform:translate3d(calc(var(--bg-motion-shift, 28px) * -.78), calc(var(--bg-motion-shift, 28px) * .52), 0) scale(calc(var(--bg-motion-scale, 1.13) + .05)); opacity:1; }
          78% { transform:translate3d(calc(var(--bg-motion-shift, 28px) * .28), calc(var(--bg-motion-shift, 28px) * .22), 0) scale(calc(var(--bg-motion-scale, 1.13) + .016)); opacity:.95; }
          100% { transform:translate3d(0, 0, 0) scale(var(--bg-motion-scale, 1.13)); opacity:.9; }
        }
        @keyframes glowDrift {
          0% { transform:translate3d(0, 0, 0) scale(1); opacity:.74; }
          50% { transform:translate3d(calc(var(--bg-motion-shift, 28px) * -.58), calc(var(--bg-motion-shift, 28px) * .38), 0) scale(calc(1 + (.085 * var(--bg-motion-strength, 1)))); opacity:1; }
          100% { transform:translate3d(0, 0, 0) scale(1); opacity:.74; }
        }
        @keyframes shadeBreathe {
          0% { opacity:.94; filter:saturate(1); }
          50% { opacity:calc(.82 - (.04 * (var(--bg-motion-strength, 1) - 1))); filter:saturate(calc(1 + (.08 * var(--bg-motion-strength, 1)))); }
          100% { opacity:.94; filter:saturate(1); }
        }
        @keyframes auraDrift {
          0% { transform:translate3d(0, 0, 0) scale(1.08); }
          50% { transform:translate3d(calc(var(--bg-motion-shift, 28px) * .34), calc(var(--bg-motion-shift, 28px) * -.26), 0) scale(calc(1.08 + (.042 * var(--bg-motion-strength, 1)))); opacity:1; }
          100% { transform:translate3d(0, 0, 0) scale(1.08); }
        }
        @keyframes idleLightOrbsDrift {
          0%,100% { transform:translate3d(-2%, 1%, 0) scale(.98); opacity:.34; }
          28% { transform:translate3d(4%, -3%, 0) scale(1.06); opacity:.48; }
          58% { transform:translate3d(-5%, -1%, 0) scale(1.12); opacity:.4; }
          82% { transform:translate3d(2%, 4%, 0) scale(1.02); opacity:.46; }
        }
        @keyframes idleLightOrbsBloom {
          0%,100% { transform:translate3d(3%, -2%, 0) scale(1.02); opacity:.26; filter:blur(2px) saturate(1.06); }
          42% { transform:translate3d(-4%, 4%, 0) scale(1.16); opacity:.38; filter:blur(4px) saturate(1.18); }
          72% { transform:translate3d(2%, 1%, 0) scale(.96); opacity:.32; filter:blur(1px) saturate(1.1); }
        }
        @keyframes idleElementFloat {
          0%,100% { transform:translate3d(0, 0, 0); }
          50% { transform:translate3d(0, -4px, 0); }
        }
        .card.background-motion .bg {
          animation:backgroundFloat var(--bg-motion-duration, 24s) ease-in-out infinite;
        }
        .card.background-motion .shade {
          animation:shadeBreathe var(--shade-motion-duration, 20s) ease-in-out infinite;
        }
        .card.background-motion .glow {
          animation:glowDrift var(--glow-motion-duration, 18s) ease-in-out infinite;
          mix-blend-mode:screen;
        }
        .card.background-motion.motion-strong .glow {
          opacity:1;
        }
        .theme-light .bg {
          filter:blur(32px) saturate(1.1) brightness(1.06);
          opacity:.86;
        }
        .theme-light .shade {
          background:
            linear-gradient(180deg, rgba(255,255,255,.06), rgba(228,235,244,.22) 18%, rgba(210,220,232,.54) 58%, rgba(196,207,221,.78));
        }
        .theme-light .glow {
          background:
            radial-gradient(circle at 18% 20%, rgba(255,193,92,.14), transparent 22%),
            radial-gradient(circle at 82% 16%, rgba(255,153,84,.1), transparent 20%),
            radial-gradient(circle at 50% 78%, rgba(255,188,74,.12), transparent 26%);
        }
        .theme-custom .bg {
          filter:blur(32px) saturate(1.1);
          opacity:.96;
        }
        .theme-custom .shade {
          background:
            linear-gradient(180deg, rgba(var(--v2-custom-rgb) / .18), rgba(var(--v2-custom-rgb) / .22) 20%, rgba(14,18,28,.18) 56%, rgba(14,18,28,.1));
        }
        .theme-custom .glow {
          background:
            radial-gradient(circle at 18% 20%, rgba(var(--v2-custom-rgb) / .28), transparent 26%),
            radial-gradient(circle at 82% 16%, rgba(var(--v2-custom-rgb) / .18), transparent 22%),
            radial-gradient(circle at 50% 78%, rgba(var(--v2-custom-rgb) / .22), transparent 30%);
        }
        .card.empty-media::before,
        .card.empty-media::after {
          content:"";
          position:absolute;
          inset:-18%;
          z-index:0;
          pointer-events:none;
          mix-blend-mode:screen;
          filter:blur(2px) saturate(1.16);
          opacity:.42;
          will-change:transform, opacity, filter;
        }
        .card.empty-media::before {
          background:
            radial-gradient(circle at 18% 72%, rgba(var(--dynamic-accent-rgb, 245 166 35) / .24), transparent 15%),
            radial-gradient(circle at 76% 18%, rgba(96,165,250,.18), transparent 13%),
            radial-gradient(circle at 58% 88%, rgba(244,114,182,.13), transparent 12%),
            radial-gradient(circle at 34% 28%, rgba(255,255,255,.10), transparent 10%);
          animation:idleLightOrbsDrift 24s ease-in-out infinite;
        }
        .card.empty-media::after {
          inset:-22%;
          background:
            radial-gradient(circle at 82% 68%, rgba(45,212,191,.16), transparent 16%),
            radial-gradient(circle at 12% 22%, rgba(250,204,21,.15), transparent 12%),
            radial-gradient(circle at 52% 46%, rgba(147,197,253,.12), transparent 18%);
          opacity:.34;
          animation:idleLightOrbsBloom 30s ease-in-out infinite;
        }
        .card.empty-media .hero-copy,
        .card.empty-media .empty-magic-stack {
          animation:idleElementFloat 11s ease-in-out infinite;
          will-change:transform;
        }
        .card.empty-media .empty-magic-stack {
          animation-delay:-3.5s;
        }
        .card.performance-lite.empty-media::before,
        .card.performance-lite.empty-media::after,
        .card.performance-lite.empty-media .hero-copy,
        .card.performance-lite.empty-media .empty-magic-stack {
          animation:none;
        }
        .theme-light.card.empty-media::before,
        .theme-light.card.empty-media::after {
          mix-blend-mode:normal;
          opacity:.3;
          filter:blur(1px) saturate(1.05);
        }
        `;
}
