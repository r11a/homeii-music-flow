// player styles. Order is preserved by card-styles.js.
export default function() {
  return `.card.layout-tablet .tablet-rail {
          min-width:0;
          display:flex;
          flex-direction:column;
          align-items:stretch;
          gap:10px;
          min-height:0;
          height:100%;
          overflow:hidden;
          position:relative;
          z-index:7;
        }
        .card.layout-tablet.rtl .tablet-shell {
          grid-template-columns:minmax(0,1fr) var(--tablet-rail);
        }
        .hero-aura {
          position:absolute;
          top:-2%;
          left:50%;
          width:var(--flow-hero-aura-width);
          height:var(--flow-hero-aura-height);
          border-radius:999px;
          background:center / cover no-repeat;
          filter:blur(74px) saturate(1.08);
          opacity:.18;
          transform:translateX(-50%) scale(1.04);
          pointer-events:none;
          will-change:transform, opacity;
        }
        .theme-light .hero-aura {
          opacity:.12;
          filter:blur(82px) saturate(1.02) brightness(1.04);
        }
        .card.layout-tablet .hero-aura {
          left:32%;
          width:var(--flow-tablet-aura-width);
          height:var(--flow-tablet-aura-height);
          opacity:.14;
        }
        .theme-light.card.layout-tablet .hero-aura {
          opacity:.08;
        }
        .card.background-motion .hero-aura {
          animation:auraDrift var(--aura-motion-duration, 22s) ease-in-out infinite;
        }
        .card.dynamic-theme .hero-aura {
          filter:blur(80px) saturate(calc(1.02 + (.08 * var(--dynamic-theme-strength, .82))));
          opacity:calc(.14 + (.12 * var(--dynamic-theme-strength, .82)));
          mix-blend-mode:screen;
        }
        .card.layout-tablet.dynamic-theme .hero-aura {
          opacity:calc(.08 + (.06 * var(--dynamic-theme-strength, .82)));
        }
        .theme-light.card.dynamic-theme .hero-aura {
          opacity:calc(.1 + (.08 * var(--dynamic-theme-strength, .82)));
        }
        .player-chip,.status-pill,.accent-row,.menu-sheet,.notice,.menu-item,.menu-list-item,.queue-row {
          background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.12); backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px);
        }
        .theme-light .player-chip,.theme-light .status-pill,.theme-light .accent-row,.theme-light .menu-sheet,.theme-light .notice,.theme-light .menu-item,.theme-light .menu-list-item,.theme-light .queue-row {
          background:rgba(255,255,255,.62);
          border-color:rgba(147,161,183,.2);
          box-shadow:0 14px 34px rgba(110,127,153,.12);
          color:#1f2633;
        }
        .player-chip {
          min-width:0; width:100%; max-width:100%; padding:2px 4px 0; border-radius:0; direction:inherit; cursor:pointer; margin-top:0;
          overflow:visible; position:relative; z-index:1; background:none; border:none; box-shadow:none; backdrop-filter:none; -webkit-backdrop-filter:none;
        }
        .player-chip-inner { display:grid; grid-template-columns:30px minmax(0,1fr); gap:10px; align-items:center; min-width:0; }
        .player-chip-ico {
          width:30px; height:30px; border-radius:10px; display:grid; place-items:center;
          background:linear-gradient(135deg, rgba(247,191,92,.18), rgba(245,166,35,.08));
          border:1px solid rgba(245,166,35,.18); color:#ffc96b;
        }
        .player-chip-ico .ui-ic { width:46%; height:46%; }
.player-kicker { font-size:calc(9px * var(--v2-font-scale)); letter-spacing:.12em; text-transform:uppercase; color:rgba(255,255,255,.56); margin-bottom:2px; }
.player-name { font-size:calc(15px * var(--v2-font-scale)); font-weight:900; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.player-sub { margin-top:1px; font-size:calc(11px * var(--v2-font-scale)); color:rgba(255,255,255,.72); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .theme-light .player-chip {
          background:none;
          border:none;
          box-shadow:none;
          backdrop-filter:none;
          -webkit-backdrop-filter:none;
        }
        .player-focus {
          display:inline-flex;
          align-items:center;
          justify-content:center;
          gap:10px;
          margin:8px auto 0;
          width:auto;
          max-width:min(calc(100% - 32px), 430px);
          min-height:34px;
          padding:6px 12px;
          border-radius:18px;
          background:linear-gradient(180deg, rgba(255,255,255,.12), rgba(255,255,255,.05));
          border:1px solid rgba(255,255,255,.14);
          color:inherit;
          font:inherit;
          cursor:pointer;
          position:relative;
          z-index:1;
          overflow:hidden;
          backdrop-filter:blur(22px);
          -webkit-backdrop-filter:blur(22px);
          box-sizing:border-box;
          box-shadow:0 14px 34px rgba(0,0,0,.18), inset 0 1px 0 rgba(255,255,255,.09);
          transition:transform .18s ease, background-color .18s ease, border-color .18s ease, box-shadow .18s ease, opacity .18s ease;
        }
        .player-focus-nav {
          width:min(100%, 292px);
          margin-inline:auto;
          display:grid;
          grid-template-columns:44px minmax(0,1fr) 44px;
          align-items:center;
          gap:8px;
        }
        .player-focus-nav .player-focus {
          width:100%;
          max-width:100%;
          margin-top:0;
        }
        .player-focus-nav-btn {
          width:44px;
          min-width:44px;
          height:44px;
          padding:0;
          border:1px solid rgba(255,255,255,.12);
          border-radius:999px;
          background:rgba(255,255,255,.08);
          color:rgba(255,255,255,.92);
          box-shadow:0 10px 24px rgba(0,0,0,.12);
          display:grid;
          place-items:center;
          cursor:pointer;
          transition:transform .16s ease, color .16s ease, opacity .16s ease, background-color .16s ease, border-color .16s ease;
        }
        .player-focus-nav-btn .ui-ic {
          width:18px;
          height:18px;
        }
        .player-focus-nav-btn:disabled {
          opacity:.18;
          cursor:default;
        }
        .theme-light .player-focus-nav-btn {
          color:rgba(38,52,70,.84);
          background:rgba(255,255,255,.78);
          border-color:rgba(147,161,183,.2);
          box-shadow:0 10px 24px rgba(110,127,153,.12);
        }
        .player-focus-copy {
          min-width:0;
          display:flex;
          align-items:center;
          gap:8px;
          justify-content:center;
        }
        .player-focus-tags {
          display:flex;
          align-items:center;
          justify-content:center;
          flex-wrap:nowrap;
          gap:6px;
          min-height:0;
          min-width:0;
        }
        .player-focus-pill {
          min-height:20px;
          padding:0 8px;
          border-radius:999px;
          display:inline-flex;
          align-items:center;
          justify-content:center;
          gap:5px;
          font-size:10px;
          font-weight:950;
          line-height:1;
          border:1px solid rgba(255,255,255,.14);
          background:rgba(255,255,255,.08);
          color:rgba(255,255,255,.92);
        }
        .player-focus-pill.playing {
          color:#18120a;
          border-color:color-mix(in srgb, var(--ma-accent) 30%, transparent);
          background:linear-gradient(135deg, var(--ma-accent), color-mix(in srgb, var(--ma-accent) 70%, white 30%));
          box-shadow:0 10px 18px color-mix(in srgb, var(--ma-accent) 20%, transparent);
        }
        .player-focus-pill.night {
          border-color:rgba(168,182,255,.18);
          background:rgba(110,126,255,.12);
          color:#dce2ff;
        }
        .player-focus-pill.night.active {
          border-color:rgba(186,198,255,.28);
          background:linear-gradient(135deg, rgba(110,126,255,.26), rgba(141,154,255,.16));
          color:#f4f7ff;
          box-shadow:0 10px 18px rgba(69,82,145,.18);
        }
        .player-focus-pill .eq-icon {
          display:inline-flex !important;
          width:12px;
          height:10px;
          gap:2px;
        }
        .player-focus-pill .eq-icon span {
          width:2px;
        }
        .theme-light .player-focus-pill {
          color:#435066;
          border-color:rgba(147,161,183,.2);
          background:rgba(255,255,255,.74);
        }
        .theme-light .player-focus-pill.night {
          color:#506087;
          border-color:rgba(157,171,198,.24);
          background:rgba(235,240,255,.88);
        }
        .player-focus-art-wrap {
          display:flex;
          align-items:center;
          justify-content:center;
          width:auto;
          flex:none;
        }
        .player-focus-art {
          width:32px;
          height:32px;
          border-radius:999px;
          display:grid;
          place-items:center;
          background:rgba(255,255,255,.08) center/cover no-repeat;
          border:1px solid rgba(255,255,255,.14);
          box-shadow:0 12px 26px rgba(0,0,0,.14), inset 0 1px 0 rgba(255,255,255,.08);
          position:relative;
          overflow:hidden;
        }
        .player-focus-art.placeholder {
          background:
            radial-gradient(circle at 32% 24%, color-mix(in srgb, var(--ma-accent) 34%, rgba(255,255,255,.14)), transparent 42%),
            linear-gradient(145deg, rgba(255,255,255,.12), rgba(255,255,255,.04));
        }
        .player-focus-art .ui-ic {
          width:54%;
          height:54%;
          opacity:.7;
          position:relative;
          z-index:1;
        }
        .player-focus-art::after {
          content:"";
          position:absolute;
          inset:0;
          border-radius:inherit;
          background:radial-gradient(circle at 32% 22%, rgba(255,255,255,.22), transparent 44%);
          pointer-events:none;
        }
        .player-focus::before {
          content:"";
          position:absolute;
          inset:-18%;
          background:radial-gradient(circle at 22% 18%, color-mix(in srgb, var(--ma-accent) 28%, transparent), transparent 34%);
          opacity:.55;
          pointer-events:none;
        }
        .player-focus::after {
          content:"";
          position:absolute;
          inset:0;
          border-radius:inherit;
          pointer-events:none;
          box-shadow:inset 0 0 0 1px rgba(255,255,255,.06);
        }
        .card.layout-tablet .player-focus {
          justify-self:stretch;
          margin-top:0;
          max-width:100%;
          min-height:126px;
          padding:14px 12px 16px;
          border-radius:32px;
          flex-direction:column;
          gap:10px;
          justify-content:flex-start;
          align-items:center;
          text-align:center;
          background:
            radial-gradient(circle at 50% 0%, color-mix(in srgb, var(--ma-accent) 14%, transparent), transparent 52%),
            linear-gradient(180deg, rgba(255,255,255,.12), rgba(255,255,255,.045));
          border-color:rgba(255,255,255,.14);
          box-shadow:0 16px 36px rgba(0,0,0,.12), inset 0 1px 0 rgba(255,255,255,.08);
        }
        .card.layout-tablet .player-focus-art-wrap {
          display:flex;
          order:2;
        }
        .card.layout-tablet .player-focus-art {
          width:68px;
          height:68px;
          border-radius:999px;
        }
        .player-focus-name {
          font-size:calc(12px * var(--v2-font-scale));
          font-weight:900;
          line-height:1;
          white-space:nowrap;
          overflow:hidden;
          text-overflow:ellipsis;
          max-width:220px;
        }
        .card.layout-tablet .player-focus-name {
          order:1;
          font-size:calc(14px * var(--v2-font-scale));
          max-width:100%;
          text-align:center;
          line-height:1.15;
          white-space:normal;
          text-wrap:balance;
          font-weight:900;
        }
        .card.layout-tablet .player-focus-copy {
          order:1;
          display:grid;
          justify-items:center;
          gap:6px;
        }
        .card.layout-tablet .player-focus-tags {
          justify-content:center;
          flex-wrap:wrap;
          min-height:20px;
        }
        .player-focus-meta {
          display:flex;
          flex-direction:row;
          align-items:center;
          justify-content:center;
          gap:5px;
          min-width:0;
        }
        .player-focus-sub {
          max-width:100%;
          font-size:10px;
          font-weight:800;
          line-height:1.15;
          color:rgba(255,255,255,.66);
          text-align:center;
          white-space:nowrap;
          overflow:hidden;
          text-overflow:ellipsis;
        }
        .theme-light .player-focus-sub {
          color:rgba(33,41,57,.66);
        }
        .theme-light .player-focus-nav-btn:disabled {
          opacity:.26;
        }
        .card.layout-tablet .player-focus-meta {
          display:none;
        }
        .card.layout-tablet .player-focus-sub {
          display:none;
        }
        .player-focus.is-playing {
          box-shadow:0 20px 44px rgba(0,0,0,.16), inset 0 1px 0 rgba(255,255,255,.08), 0 0 0 1px rgba(255,255,255,.08);
        }
        .player-focus.is-playing .player-focus-name {
          color:color-mix(in srgb, currentColor 84%, var(--ma-accent) 16%);
        }
        .player-focus.is-playing::before {
          animation:playerFocusPulse 3.4s ease-in-out infinite;
        }
        .player-focus.is-playing .player-focus-art {
          box-shadow:0 0 0 1px color-mix(in srgb, var(--ma-accent) 28%, rgba(255,255,255,.08)), 0 0 0 12px color-mix(in srgb, var(--ma-accent) 12%, transparent), 0 16px 30px rgba(0,0,0,.18);
          animation:playerThumbPulse 3.2s ease-in-out infinite;
        }
        .eq-icon {
          display:none;
          align-items:flex-end;
          gap:3px;
          height:18px;
          width:20px;
          color:var(--ma-accent);
        }
        .player-focus .eq-icon,
        .player-focus.is-playing .eq-icon { display:none !important; }
        .menu-list-item.is-playing .eq-icon { display:inline-flex; }
        .eq-icon span {
          width:3px;
          border-radius:999px;
          background:currentColor;
          animation:eqPulse 1.15s ease-in-out infinite;
          transform-origin:center bottom;
        }
        .eq-icon span:nth-child(1) { height:9px; animation-delay:0s; }
        .eq-icon span:nth-child(2) { height:15px; animation-delay:.18s; }
        .eq-icon span:nth-child(3) { height:11px; animation-delay:.36s; }
        @keyframes playerFocusPulse {
          0%, 100% { transform:scale(1); opacity:.45; }
          50% { transform:scale(1.05); opacity:.72; }
        }
        @keyframes playerThumbPulse {
          0%,100% { transform:scale(1); }
          50% { transform:scale(1.04); }
        }
        @keyframes eqPulse {
          0%,100% { transform:scaleY(.55); opacity:.55; }
          50% { transform:scaleY(1.08); opacity:1; }
        }
        .hero-mobile-top {
          width:100%;
          display:grid;
          justify-items:center;
          margin-bottom:6px;
          position:relative;
          z-index:3;
        }
        .card:not(.layout-tablet):not(.height-short):not(.height-tight):not(.compact-collapsed) .hero-mobile-top {
          margin-top:-10px;
          margin-bottom:16px;
        }
        .card:not(.layout-tablet):not(.height-short):not(.height-tight):not(.compact-collapsed) .player-focus {
          margin-top:0;
        }
        .hero-split-shell {
          width:min(1180px, 100%);
          display:grid;
          gap:14px;
          align-items:center;
          position:relative;
          z-index:2;
        }
        .card.layout-tablet .hero-split-shell {
          width:100%;
          direction:ltr;
          grid-template-columns:minmax(0, 1.86fr) minmax(var(--flow-hero-info-min), 1fr);
          gap:var(--flow-hero-gap);
        }
        .hero-visual {
          position:relative;
          min-width:0;
          display:grid;
          justify-items:center;
          align-items:center;
        }
        .hero-info {
          min-width:0;
          display:grid;
          gap:14px;
          align-content:center;
          justify-items:center;
          text-align:center;
          position:relative;
          z-index:2;
        }
        .card.layout-tablet .hero-info {
          width:100%;
          max-width:390px;
          justify-items:start;
          text-align:start;
        }
        .card.rtl .hero-info {
          direction:rtl;
        }
        .hero-copy {
          display:grid;
          gap:8px;
          justify-items:center;
          text-align:center;
          width:100%;
          max-width:min(680px, 88%);
          min-width:0;
          position:relative;
          z-index:1;
          margin-top:0;
        }
        .card.layout-tablet .hero-copy {
          max-width:100%;
          gap:10px;
          justify-items:start;
          text-align:start;
          margin:0;
        }
        .hero-title {
          width:100%;
          max-width:100%;
          font-size:calc(28px * var(--v2-font-scale));
          font-weight:900;
          line-height:1.06;
          letter-spacing:-.035em;
          white-space:normal;
          overflow:hidden;
          text-overflow:ellipsis;
          display:-webkit-box;
          -webkit-line-clamp:2;
          -webkit-box-orient:vertical;
        }
        .card.layout-tablet .hero-title {
          font-size:var(--flow-tablet-title-size);
          text-wrap:balance;
          line-height:1.08;
        }
        .hero-sub {
          width:100%;
          max-width:100%;
          font-size:calc(13px * var(--v2-font-scale));
          color:rgba(255,255,255,.72);
          white-space:normal;
          overflow:hidden;
          text-overflow:ellipsis;
          display:-webkit-box;
          -webkit-line-clamp:2;
          -webkit-box-orient:vertical;
        }
        .np-sub.scroll-when-overflow {
          display:block;
          white-space:nowrap;
          overflow:hidden;
          text-overflow:clip;
          text-align:start;
          -webkit-line-clamp:unset;
          -webkit-box-orient:initial;
        }
        .np-sub.scroll-when-overflow .scrolling-text-inner {
          display:inline-flex;
          align-items:center;
          min-width:0;
          max-width:none;
          width:max-content;
          gap:var(--scroll-gap, 3rem);
        }
        .np-sub.scroll-when-overflow .scrolling-text-item {
          flex:0 0 auto;
          white-space:nowrap;
        }
        .np-sub.scroll-when-overflow.is-overflowing {
          -webkit-mask-image:linear-gradient(90deg, transparent 0, #000 12%, #000 88%, transparent 100%);
          mask-image:linear-gradient(90deg, transparent 0, #000 12%, #000 88%, transparent 100%);
        }
        .np-sub.scroll-when-overflow.is-overflowing .scrolling-text-inner {
          animation:homeiiSubtitleScroll var(--scroll-duration, 12s) linear infinite;
          will-change:transform;
        }
        @keyframes homeiiSubtitleScroll {
          from { transform:translateX(0); }
          to { transform:translateX(calc(-1 * var(--scroll-distance, 0px))); }
        }
        @media (prefers-reduced-motion: reduce) {
          .np-sub.scroll-when-overflow {
            text-overflow:ellipsis;
          }
          .np-sub.scroll-when-overflow.is-overflowing .scrolling-text-inner {
            max-width:100%;
            gap:0;
            animation:none;
          }
        }
        .hero-up-next {
          justify-content:center;
          text-align:center;
          width:auto;
          max-width:min(520px, 94%);
          margin-top:0;
        }
        .card.layout-tablet .hero-up-next {
          justify-content:flex-start;
          text-align:start;
          width:100%;
          max-width:100%;
        }
        .hero-info .night-quick-row {
          justify-content:center;
          margin-top:2px;
        }
        .card.layout-tablet .hero-info .night-quick-row {
          justify-content:flex-start;
        }
        .card.layout-tablet .hero-sub {
          font-size:var(--flow-tablet-sub-size);
          text-wrap:balance;
        }
        .center {
          display:flex;
          flex-direction:column;
          align-items:center;
          justify-content:center;
          width:100%;
          max-width:100%;
          min-width:0;
          gap:8px;
          min-height:0;
          padding-top:0;
          margin-top:0;
          overflow:hidden;
          position:relative;
        }
        .card.layout-tablet .center {
          width:100%;
          max-width:var(--tablet-max);
          margin-inline:auto;
          gap:14px;
          overflow:hidden;
          padding-bottom:2px;
          z-index:4;
          min-height:0;
          justify-content:center;
        }
        .art-stage {
          position:relative;
          width:min(760px, 100%);
          max-width:100%;
          margin-inline:auto;
          display:grid;
          justify-items:center;
          align-items:center;
          gap:10px;
          padding:0;
          justify-self:center;
          z-index:1;
        }
        .card.layout-tablet .art-stage {
          width:100%;
          display:grid;
          grid-template-columns:minmax(0,1fr);
          grid-template-areas:"shell";
          column-gap:0;
          row-gap:0;
          align-items:center;
          justify-content:center;
        }
        .mobile-art-shell {
          overflow:visible;
        }
        .mobile-art-shell > .art-source-badges {
          inset-block-start:4px;
          inset-inline-start:clamp(4px, 1.1cqi, 12px);
        }
        .card.layout-tablet .mobile-art-shell > .art-source-badges {
          inset-block-start:max(-24px, calc((var(--flow-autofit-art-height) - var(--flow-art-card-max-size)) / 2 - 24px));
          inset-inline-start:13%;
          max-width:64%;
          gap:5px;
          transform:translateX(8px);
        }
        .card.layout-tablet .source-badge {
          min-height:18px;
          padding:0 7px;
          font-size:9px;
          font-weight:850;
          color:rgba(255,255,255,.78);
          background:rgba(10,14,22,.34);
          border-color:rgba(255,255,255,.1);
          box-shadow:0 8px 18px rgba(0,0,0,.12);
          backdrop-filter:blur(10px);
          -webkit-backdrop-filter:blur(10px);
        }
        .card.layout-tablet .source-badge.quality {
          color:rgba(255,255,255,.82);
          background:rgba(255,255,255,.08);
        }
        .art-aura {
          position:absolute;
          top:50%;
          left:50%;
          width:var(--flow-art-aura-size);
          height:var(--flow-art-aura-size);
          border-radius:38%;
          background:center / cover no-repeat;
          filter:blur(44px) saturate(1.08);
          opacity:.62;
          transform:translate(-50%, -48%) scale(.98);
          pointer-events:none;
          will-change:transform, opacity;
        }
        .theme-light .art-aura {
          opacity:.28;
          filter:blur(50px) saturate(1.02) brightness(1.03);
        }
        .card.layout-tablet .art-aura {
          width:var(--flow-tablet-art-aura-size);
          height:var(--flow-tablet-art-aura-size);
          transform:translate(-50%, -44%) scale(1.02);
        }
        .card.background-motion .art-aura {
          animation:auraDrift calc(var(--aura-motion-duration, 22s) * .88) ease-in-out infinite reverse;
        }
        @media (prefers-reduced-motion: reduce) {
          .card.background-motion .bg,
          .card.background-motion .shade,
          .card.background-motion .glow,
          .card.background-motion .hero-aura,
          .card.background-motion .art-aura {
            animation:none !important;
          }
        }
        .card.dynamic-theme .art-aura {
          filter:blur(48px) saturate(calc(1.04 + (.08 * var(--dynamic-theme-strength, .82))));
          opacity:calc(.38 + (.14 * var(--dynamic-theme-strength, .82)));
          mix-blend-mode:screen;
        }
        .card.layout-tablet.dynamic-theme .art-aura {
          opacity:calc(.18 + (.08 * var(--dynamic-theme-strength, .82)));
        }
        .theme-light.card.dynamic-theme .art-aura {
          opacity:calc(.2 + (.08 * var(--dynamic-theme-strength, .82)));
        }
        .art-stack-view {
          position:relative;
          width:100%;
          height:var(--flow-art-stack-height);
          min-height:var(--flow-art-stack-height);
          isolation:isolate;
          direction:ltr;
          overflow:hidden;
          --art-drag-x:0px;
          --art-drag-y:0px;
        }
        .art-stack-viewport {
          position:relative;
          width:100%;
          height:var(--flow-art-stack-height);
          min-height:var(--flow-art-stack-height);
          overflow:hidden;
          direction:ltr;
          touch-action:pan-y;
          -webkit-user-select:none;
          user-select:none;
        }
        .art-stack-container {
          position:relative;
          width:100%;
          height:var(--flow-art-stack-height);
          min-height:var(--flow-art-stack-height);
          touch-action:pan-y;
          user-select:none;
          -webkit-user-select:none;
          direction:ltr;
        }
        .art-stack-slide {
          position:absolute;
          inset-block:0;
          left:50%;
          width:68%;
          min-width:0;
          display:flex;
          align-items:center;
          justify-content:center;
          padding:0;
          transition:
            transform .16s cubic-bezier(.22,.8,.24,1),
            opacity .16s ease,
            filter .16s ease;
          will-change:transform, opacity, filter;
        }
        .art-stack-card {
          position:relative;
          width:min(var(--flow-art-card-size), var(--flow-art-stack-height), 100%, var(--flow-art-card-max-size));
          height:auto;
          max-width:100%;
          max-height:var(--flow-art-card-max-size);
          aspect-ratio:1/1;
          border-radius:34px;
          overflow:hidden;
          display:grid;
          place-items:center;
          background:rgba(255,255,255,.07);
          border:1px solid rgba(255,255,255,.1);
          box-shadow:0 16px 30px rgba(0,0,0,.14);
          transition:transform .16s cubic-bezier(.22,.8,.24,1), opacity .16s ease, filter .16s ease;
          will-change:transform, opacity, filter;
          contain:paint;
        }
        .art-stack-view.dragging .art-stack-slide,
        .art-stack-view.dragging .art-stack-card {
          transition:none !important;
        }
        .art-stack-card img {
          position:absolute;
          inset:0;
          width:100%;
          height:100%;
          max-width:100%;
          max-height:100%;
          object-fit:contain;
          object-position:center;
          display:block;
          pointer-events:none;
          -webkit-user-drag:none;
        }
        .art-stack-card img[data-homeii-art-ready="0"] {
          opacity:1;
        }
        .art-stack-card img[data-homeii-art-ready="1"] {
          transition:opacity .12s ease-out;
        }
        .art-stack-slide.center {
          width:72%;
          z-index:3;
          transform:translateX(calc(-50% + var(--art-drag-x))) scale(1);
          opacity:1;
        }
        .art-stack-slide.center .art-stack-card {
          transform:translateY(0) scale(1);
          border-color:rgba(255,255,255,.16);
          box-shadow:
            0 30px 60px rgba(0,0,0,.26),
            0 0 0 1px rgba(255,255,255,.06),
            0 22px 48px rgba(var(--dynamic-glow-rgb, 255 178 56) / .14);
        }
        .art-stack-slide.prev,
        .art-stack-slide.next {
          width:50%;
          z-index:1;
        }
        .art-stack-slide.prev {
          transform:translateX(calc(-122% + (var(--art-drag-x) * .14))) scale(.72);
          opacity:.3;
        }
        .art-stack-slide.next {
          transform:translateX(calc(22% + (var(--art-drag-x) * .14))) scale(.72);
          opacity:.3;
        }
        .art-stack-slide.prev .art-stack-card {
          opacity:1;
          filter:saturate(.68) brightness(.82) contrast(.96);
          transform:perspective(900px) rotateY(16deg) scale(.82);
        }
        .art-stack-slide.next .art-stack-card {
          opacity:1;
          filter:saturate(.68) brightness(.82) contrast(.96);
          transform:perspective(900px) rotateY(-16deg) scale(.82);
        }
        .art-stack-view.cover-flow-mode {
          overflow:visible;
        }
        .art-stack-view.cover-flow-mode .cover-flow-viewport,
        .art-stack-view.cover-flow-mode .cover-flow-container {
          overflow:visible;
          touch-action:pan-x;
          perspective:1040px;
        }
        .art-stack-view.cover-flow-mode .cover-flow-container {
          transform-style:preserve-3d;
        }
        .art-stack-view.cover-flow-mode .cover-flow-slide {
          inset-block:auto;
          top:50%;
          left:50%;
          height:auto;
          width:72%;
          transform-origin:center center;
          pointer-events:auto;
        }
        .art-stack-view.cover-flow-mode .cover-flow-slide.flow-center {
          z-index:5;
          width:76%;
          opacity:1;
          filter:none;
          transform:translate(-50%, calc(-50% + var(--art-drag-y))) scale(1);
        }
        .art-stack-view.cover-flow-mode .cover-flow-slide.flow-before.flow-depth-1 {
          z-index:4;
          width:56%;
          opacity:.56;
          filter:saturate(.74) brightness(.86) blur(.4px);
          transform:translate(-50%, calc(-138% + (var(--art-drag-y) * .28))) scale(.7);
        }
        .art-stack-view.cover-flow-mode .cover-flow-slide.flow-after.flow-depth-1 {
          z-index:4;
          width:56%;
          opacity:.56;
          filter:saturate(.74) brightness(.86) blur(.4px);
          transform:translate(-50%, calc(38% + (var(--art-drag-y) * .28))) scale(.7);
        }
        .art-stack-view.cover-flow-mode .cover-flow-slide.flow-before.flow-depth-2 {
          z-index:2;
          width:42%;
          opacity:.22;
          filter:saturate(.48) brightness(.72) blur(4px);
          transform:translate(-50%, calc(-196% + (var(--art-drag-y) * .16))) scale(.52);
        }
        .art-stack-view.cover-flow-mode .cover-flow-slide.flow-after.flow-depth-2 {
          z-index:2;
          width:42%;
          opacity:.22;
          filter:saturate(.48) brightness(.72) blur(4px);
          transform:translate(-50%, calc(96% + (var(--art-drag-y) * .16))) scale(.52);
        }
        .card .art-stack-view.cover-flow-mode .cover-flow-slide.flow-center .art-stack-card {
          transform:translateZ(38px) rotateX(0deg) scale(1);
          border-color:rgba(255,255,255,.18);
        }
        .card .art-stack-view.cover-flow-mode .cover-flow-slide.flow-before .art-stack-card {
          transform:perspective(1040px) rotateX(-22deg) translateZ(-48px) scale(.9);
        }
        .card .art-stack-view.cover-flow-mode .cover-flow-slide.flow-after .art-stack-card {
          transform:perspective(1040px) rotateX(22deg) translateZ(-48px) scale(.9);
        }
        .art-stack-view.cover-flow-mode .cover-flow-slide.ghost {
          pointer-events:none;
        }
        .art-stack-slide.prev .art-stack-card::after,
        .art-stack-slide.next .art-stack-card::after {
          content:"";
          position:absolute;
          inset:0;
          background:
            linear-gradient(180deg, rgba(8,11,18,.26), rgba(8,11,18,.44)),
            radial-gradient(circle at center, transparent 32%, rgba(8,11,18,.18) 100%);
          pointer-events:none;
        }
        .theme-light .art-stack-slide.prev .art-stack-card::after,
        .theme-light .art-stack-slide.next .art-stack-card::after {
          background:
            linear-gradient(180deg, rgba(82,95,112,.14), rgba(82,95,112,.26)),
            radial-gradient(circle at center, transparent 36%, rgba(82,95,112,.08) 100%);
        }
        .art-stack-card.ghost {
          background:rgba(255,255,255,.04);
          border-color:rgba(255,255,255,.06);
          opacity:.16;
        }
        .art-stack-card.placeholder {
          background:
            radial-gradient(circle at 35% 25%, color-mix(in srgb, var(--ma-accent) 24%, transparent), transparent 34%),
            linear-gradient(135deg, rgba(255,255,255,.12), rgba(255,255,255,.03));
          display:grid;
          place-items:center;
        }
        .art-stack-fallback {
          width:100%;
          height:100%;
          max-width:100%;
          max-height:100%;
          display:grid;
          place-items:center;
          align-content:center;
          justify-content:center;
          margin:auto;
          color:color-mix(in srgb, var(--ma-accent) 76%, white 24%);
          position:relative;
          overflow:hidden;
          inset:0;
          transform:translateZ(0);
          background:
            radial-gradient(circle at 24% 20%, color-mix(in srgb, var(--ma-accent) 30%, transparent), transparent 28%),
            radial-gradient(circle at 74% 26%, color-mix(in srgb, var(--ma-accent) 18%, rgba(255,255,255,.18)), transparent 30%),
            linear-gradient(145deg, rgba(255,255,255,.12), rgba(255,255,255,.03));
        }
        .art-stack-fallback::before {
          content:"";
          position:absolute;
          inset:0;
          border-radius:inherit;
          background:radial-gradient(circle at center, color-mix(in srgb, var(--ma-accent) 34%, transparent), transparent 62%);
          filter:blur(24px);
          opacity:.74;
        }
        .art-stack-fallback::after {
          content:"";
          position:absolute;
          inset:12%;
          border-radius:28px;
          border:1px solid rgba(255,255,255,.12);
          background:linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.02));
          box-shadow:inset 0 1px 0 rgba(255,255,255,.12);
        }
        .fallback-disc {
          width:104px;
          height:104px;
          border-radius:999px;
          display:grid;
          place-items:center;
          background:rgba(12,16,24,.36);
          border:1px solid rgba(255,255,255,.18);
          z-index:1;
          box-shadow:0 18px 42px rgba(0,0,0,.22), inset 0 1px 0 rgba(255,255,255,.12);
          backdrop-filter:blur(14px);
          -webkit-backdrop-filter:blur(14px);
        }
        .fallback-disc .ui-ic { width:46px; height:46px; }
        .art-stack-fallback.brand-fallback .fallback-disc {
          width:62%;
          height:34%;
          min-width:118px;
          min-height:58px;
          border-radius:999px;
          background:rgba(12,16,24,.28);
        }
        .art-stack-brand-logo {
          width:82%;
          height:auto;
          max-height:58px;
          opacity:.78;
        }
        .surprise-me-card .surprise-me-wand {
          z-index:3;
        }
        .fallback-aura {
          position:absolute;
          inset:0;
          border-radius:inherit;
          background:
            radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--ma-accent) 24%, transparent), transparent 38%),
            radial-gradient(circle at 50% 72%, color-mix(in srgb, var(--ma-accent) 14%, transparent), transparent 52%);
          opacity:.95;
        }
        .fallback-note {
          color:#fff6e2;
          animation:fallbackNotePulse 1.9s ease-in-out infinite;
        }
        @keyframes fallbackPulse {
          0%, 100% { transform:scale(.92); opacity:.48; }
          50% { transform:scale(1.08); opacity:.78; }
        }
        @keyframes fallbackNotePulse {
          0%,100% { transform:scale(.96); box-shadow:0 18px 42px rgba(0,0,0,.22), inset 0 1px 0 rgba(255,255,255,.12); }
          50% { transform:scale(1.06); box-shadow:0 22px 46px color-mix(in srgb, var(--ma-accent) 18%, rgba(0,0,0,.22)), inset 0 1px 0 rgba(255,255,255,.18); }
        }
        .art-stack-cue {
          position:absolute;
          inset-block-start:50%;
          transform:translateY(-50%);
          width:28px;
          height:28px;
          display:grid;
          place-items:center;
          font-size:24px;
          font-weight:900;
          line-height:1;
          color:rgba(255,255,255,.42);
          text-shadow:0 10px 18px rgba(0,0,0,.2);
          pointer-events:none;
          animation:stackCueFade 2.6s ease-in-out infinite;
          z-index:4;
        }
        .art-stack-cue.start { inset-inline-start:8px; }
        .art-stack-cue.end { inset-inline-end:8px; animation-delay:1.25s; }
        .theme-light .art-stack-card {
          background:rgba(255,255,255,.58);
          border-color:rgba(142,157,180,.2);
          box-shadow:0 22px 42px rgba(111,126,150,.16);
        }
        .theme-light .art-stack-cue {
          color:rgba(44,56,72,.36);
          text-shadow:none;
        }
        @keyframes stackCueFade {
          0%, 100% { opacity:.08; }
          45% { opacity:.38; }
          60% { opacity:.2; }
        }
        .mobile-art-shell {
          position:relative;
          width:min(var(--flow-mobile-art-size), calc(100% - 28px));
          max-width:100%;
          margin-inline:auto;
          flex:0 0 auto;
          z-index:1;
          justify-self:center;
          display:block;
          box-sizing:border-box;
          padding:0;
          border-radius:0;
          background:transparent;
          border:none;
          backdrop-filter:none;
          -webkit-backdrop-filter:none;
          box-shadow:none;
          transition:transform .24s ease, opacity .24s ease;
        }
        .card.layout-tablet .mobile-art-shell {
          grid-area:shell;
          width:min(760px, 100%);
          padding:0;
          border-radius:0;
          box-shadow:none;
        }
        .card.layout-tablet .art-stack-view,
        .card.layout-tablet .art-stack-viewport,
        .card.layout-tablet .art-stack-container {
          height:var(--flow-autofit-art-height);
          min-height:var(--flow-autofit-art-height);
          max-height:var(--flow-autofit-art-height);
        }
        .card.layout-tablet .art-stack-slide {
          width:70%;
        }
        .card.layout-tablet .art-stack-slide.center {
          width:74%;
        }
        .card.layout-tablet .art-stack-slide.prev,
        .card.layout-tablet .art-stack-slide.next {
          width:44%;
        }
        .card.layout-tablet .art-stack-slide.prev {
          transform:translateX(calc(-118% + (var(--art-drag-x) * .12))) scale(.76);
          opacity:.34;
        }
        .card.layout-tablet .art-stack-slide.next {
          transform:translateX(calc(18% + (var(--art-drag-x) * .12))) scale(.76);
          opacity:.34;
        }
        .card.layout-tablet .art-stack-card {
          width:min(var(--flow-autofit-art-height), 100%, var(--flow-art-card-max-size));
          max-width:min(var(--flow-autofit-art-height), var(--flow-art-card-max-size));
          max-height:var(--flow-autofit-art-height);
        }
        .card.layout-tablet .art-stack-slide.prev .art-stack-card {
          transform:perspective(1080px) rotateY(14deg) scale(.84);
        }
        .card.layout-tablet .art-stack-slide.next .art-stack-card {
          transform:perspective(1080px) rotateY(-14deg) scale(.84);
        }
        .card.layout-tablet .art-stack-cue {
          width:34px;
          height:34px;
          font-size:28px;
        }
        .card.layout-tablet .art-stack-cue.start { inset-inline-start:18px; }
        .card.layout-tablet .art-stack-cue.end { inset-inline-end:18px; }
        .theme-light .mobile-art-shell { background:transparent; border:none; box-shadow:none; }
        .mobile-art-shell.swipe-next,
        .mobile-art-shell.swipe-prev { animation:none; }
        .np-art.mobile-art {
          width:100%; aspect-ratio:1/1; border-radius:36px; overflow:hidden; display:grid; place-items:center; margin-inline:auto;
          background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.12); box-shadow:0 24px 48px rgba(0,0,0,.24); font-size:72px; color:rgba(255,255,255,.72);
        }
        .np-art.mobile-art img { width:100%; height:100%; object-fit:contain; object-position:center center; }
        .homeii-art-fallback {
          width:100%;
          height:100%;
          display:grid;
          place-items:center;
          border-radius:inherit;
          background:
            radial-gradient(circle at 50% 36%, color-mix(in srgb, var(--accent) 28%, transparent), transparent 52%),
            linear-gradient(145deg, rgba(255,255,255,.1), rgba(255,255,255,.025));
          color:rgba(255,255,255,.78);
          box-shadow:inset 0 0 0 1px rgba(255,255,255,.08);
        }
        .homeii-art-fallback-disc {
          width:46%;
          height:46%;
          min-width:34px;
          min-height:34px;
          display:grid;
          place-items:center;
          border-radius:50%;
          background:rgba(0,0,0,.2);
          border:1px solid rgba(255,255,255,.12);
          box-shadow:0 16px 34px rgba(0,0,0,.18);
        }
        .homeii-art-fallback svg { width:48%; height:48%; color:currentColor; opacity:.92; }
        .mobile-art-actions {
          position:relative;
          inset:auto;
          display:flex;
          align-items:center;
          justify-content:center;
          gap:10px;
          width:auto;
          margin:0;
          padding:0;
          border-radius:0;
          background:transparent;
          border:none;
          backdrop-filter:none;
          -webkit-backdrop-filter:none;
          box-shadow:none;
          z-index:1;
        }
        .card.layout-tablet .mobile-art-actions {
          width:100%;
          margin:0;
          justify-content:flex-start;
          position:relative;
          z-index:4;
        }
        .mobile-art-actions.count-3 { grid-template-columns:none; }
        .mobile-art-fab {
          position:static;
          width:42px; min-width:42px; height:42px; border-radius:999px; border:1px solid rgba(255,255,255,.1);
          background:rgba(14,18,28,.26); backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px);
          color:#fff; display:grid; place-items:center; cursor:pointer; box-shadow:0 8px 18px rgba(0,0,0,.14);
          transition:transform .16s ease, background-color .16s ease, border-color .16s ease, color .16s ease, box-shadow .16s ease;
        }
        .card.layout-tablet .mobile-art-fab {
          width:40px;
          min-width:40px;
          height:40px;
          border-radius:999px;
        }
        .mobile-art-fab .ui-ic { width:20px; height:20px; }
        .mobile-art-fab.active { color:#f5a623; border-color:rgba(245,166,35,.34); background:rgba(245,166,35,.14); }
        .mobile-art-fab.danger-fab {
          color:#ffd6d6;
          border-color:rgba(255,105,115,.28);
          background:linear-gradient(145deg, rgba(255,85,95,.2), rgba(255,255,255,.06));
          box-shadow:0 10px 22px rgba(255,70,80,.1), 0 8px 18px rgba(0,0,0,.14);
        }
        .mobile-art-fab.danger-fab.pressed,
        .mobile-art-fab.danger-fab:active,
        .mobile-art-fab.danger-fab.busy {
          color:#fff;
          border-color:rgba(255,130,138,.48);
          background:linear-gradient(145deg, rgba(255,85,95,.32), rgba(255,255,255,.08));
        }
        .voice-assistant-fab { position:relative; overflow:visible; }
        .voice-assistant-fab.listening {
          color:var(--ma-accent);
          border-color:color-mix(in srgb, var(--ma-accent) 34%, rgba(255,255,255,.16));
          box-shadow:0 0 0 7px color-mix(in srgb, var(--ma-accent) 11%, transparent), 0 14px 26px rgba(0,0,0,.2);
        }
        .voice-assistant-fab.listening::after {
          content:"";
          position:absolute;
          inset:-8px;
          border-radius:999px;
          border:1px solid color-mix(in srgb, var(--ma-accent) 44%, transparent);
          animation:voiceAssistantListenPulse 1.1s ease-out infinite;
          pointer-events:none;
        }
        @keyframes voiceAssistantListenPulse {
          0% { transform:scale(.88); opacity:.78; }
          100% { transform:scale(1.38); opacity:0; }
        }
        .theme-light .np-art.mobile-art {
          background:rgba(255,255,255,.56);
          border-color:rgba(142,157,180,.2);
          box-shadow:0 22px 42px rgba(111,126,150,.18);
          color:rgba(64,74,87,.6);
        }
        .theme-light .homeii-art-fallback {
          color:rgba(48,55,68,.7);
          background:
            radial-gradient(circle at 50% 36%, color-mix(in srgb, var(--accent) 18%, transparent), transparent 54%),
            linear-gradient(145deg, rgba(255,255,255,.88), rgba(238,242,247,.58));
          box-shadow:inset 0 0 0 1px rgba(90,105,125,.12);
        }
        .theme-light .homeii-art-fallback-disc {
          background:rgba(255,255,255,.48);
          border-color:rgba(82,96,118,.12);
        }
        .theme-light .player-chip-ico,
        .theme-light .mobile-art-fab {
          background:rgba(255,255,255,.76);
          border-color:rgba(141,155,177,.22);
          box-shadow:0 12px 26px rgba(111,126,150,.16);
        }
        .theme-light .player-focus,
        .theme-light .mobile-art-actions {
          background:transparent;
          border-color:transparent;
          box-shadow:none;
        }
        .theme-light .mobile-art-fab { color:#1f2633; }
        .theme-light .mobile-art-fab.active {
          color:#f5a623;
          border-color:rgba(245,166,35,.38);
          background:rgba(245,166,35,.16);
        }
        .theme-light .mobile-art-fab.danger-fab {
          color:#b4232b;
          background:#fff1f2;
          border-color:rgba(180,35,43,.18);
          box-shadow:0 12px 26px rgba(180,35,43,.1);
        }
        .mobile-meta { display:none; }
        .bottom { display:grid; width:100%; max-width:100%; min-width:0; min-height:0; gap:12px; align-content:end; }
        .card.layout-tablet .bottom {
          width:100%;
          max-width:min(980px, 100%);
          margin-inline:auto;
          gap:12px;
          position:relative;
          z-index:5;
          margin-top:-2px;
        }
        .card.layout-tablet.tablet-auto-fit .tablet-shell {
          height:100%;
          min-height:0;
          align-items:stretch;
        }
        .card.layout-tablet.tablet-auto-fit .tablet-main {
          height:100%;
          min-height:0;
        }
        .card.layout-tablet.tablet-auto-fit .center {
          gap:12px;
        }
        .card.layout-tablet.tablet-auto-fit .hero-split-shell {
          grid-template-columns:minmax(0, 1.82fr) minmax(min(280px, var(--flow-hero-info-min)), 1fr);
          gap:var(--flow-hero-gap);
        }
        .card.layout-tablet.tablet-auto-fit .hero-info {
          max-width:360px;
        }
        .card.layout-tablet.tablet-auto-fit .art-stage {
          gap:8px;
        }
        .card.layout-tablet.tablet-auto-fit .mobile-art-shell {
          width:min(700px, 100%);
          padding:0;
          border-radius:0;
        }
        .card.layout-tablet.tablet-auto-fit .art-stack-view,
        .card.layout-tablet.tablet-auto-fit .art-stack-viewport,
        .card.layout-tablet.tablet-auto-fit .art-stack-container {
          height:var(--flow-autofit-art-height);
          min-height:var(--flow-autofit-art-height);
          max-height:var(--flow-autofit-art-height);
        }
        .card.layout-tablet.tablet-auto-fit .mobile-art-actions {
          margin:0;
        }
        .card.layout-tablet.tablet-auto-fit .hero-copy {
          max-width:100%;
          gap:8px;
          margin-top:0;
        }
        .card.layout-tablet.tablet-auto-fit .hero-title {
          font-size:calc(var(--flow-tablet-title-size) - 2px);
        }
        .card.layout-tablet.tablet-auto-fit .hero-sub {
          font-size:var(--flow-tablet-sub-size);
        }
        .card.layout-tablet.tablet-auto-fit .hero-up-next {
          max-width:min(460px, 90%);
          margin-top:0;
        }
        .card.layout-tablet.tablet-auto-fit .night-quick-row {
          gap:8px;
          transform:none;
        }
        .card.layout-tablet.tablet-auto-fit .bottom {
          gap:10px;
          margin-top:0;
        }
        .card.layout-tablet.tablet-auto-fit .progress-line {
          margin-top:0;
        }
        .card.layout-tablet.tablet-auto-fit .controls {
          gap:16px;
        }
        .card.layout-tablet.tablet-auto-fit.tablet-fit-dense .mobile-art-shell {
          --flow-art-card-max-size:var(--flow-dense-art-height);
          width:min(620px, 100%);
          padding:0;
          border-radius:0;
        }
        .card.layout-tablet.tablet-auto-fit.tablet-fit-dense .hero-split-shell {
          grid-template-columns:minmax(0, 1.72fr) minmax(min(250px, var(--flow-hero-info-min)), 1fr);
          gap:calc(var(--flow-hero-gap) * .78);
        }
        .card.layout-tablet.tablet-auto-fit.tablet-fit-dense .art-stack-view,
        .card.layout-tablet.tablet-auto-fit.tablet-fit-dense .art-stack-viewport,
        .card.layout-tablet.tablet-auto-fit.tablet-fit-dense .art-stack-container {
          height:var(--flow-dense-art-height);
          min-height:var(--flow-dense-art-height);
          max-height:var(--flow-dense-art-height);
        }
        .card.layout-tablet.tablet-auto-fit.tablet-fit-dense .art-stack-card {
          width:min(var(--flow-dense-art-height), 100%, var(--flow-art-card-max-size));
          max-width:min(var(--flow-dense-art-height), var(--flow-art-card-max-size));
          max-height:var(--flow-dense-art-height);
        }
        .card.layout-tablet.tablet-auto-fit.tablet-fit-dense .art-stack-slide {
          width:66%;
        }
        .card.layout-tablet.tablet-auto-fit.tablet-fit-dense .art-stack-slide.center {
          width:70%;
        }
        .card.layout-tablet.tablet-auto-fit.tablet-fit-dense .art-stack-slide.prev,
        .card.layout-tablet.tablet-auto-fit.tablet-fit-dense .art-stack-slide.next {
          width:40%;
        }
        .card.layout-tablet.tablet-auto-fit.tablet-fit-dense .hero-copy {
          gap:6px;
        }
        .card.layout-tablet.tablet-auto-fit.tablet-fit-dense .hero-title {
          font-size:max(18px, calc(var(--flow-tablet-title-size) - 8px));
          line-height:1.02;
        }
        .card.layout-tablet.tablet-auto-fit.tablet-fit-dense .hero-sub {
          font-size:max(11px, calc(var(--flow-tablet-sub-size) - 1px));
        }
        .card.layout-tablet.tablet-auto-fit.tablet-fit-dense .hero-up-next {
          transform:scale(.94);
          transform-origin:center top;
        }
        .card.layout-tablet.tablet-auto-fit.tablet-fit-dense .night-quick-row {
          gap:6px;
          transform:scale(.9);
        }
        .card.layout-tablet.tablet-auto-fit.tablet-fit-dense .mobile-art-actions {
          margin-top:-10px;
          margin-bottom:2px;
        }
        .card.layout-tablet.tablet-auto-fit.tablet-fit-dense .mobile-art-fab {
          width:38px;
          min-width:38px;
          height:38px;
        }
        .history-chip {
          width:100%;
          display:grid;
          grid-template-columns:36px minmax(0,1fr);
          align-items:center;
          gap:10px;
          padding:8px 10px;
          border:none;
          border-radius:18px;
          color:inherit;
          text-align:start;
          background:rgba(255,255,255,.08);
          border:1px solid rgba(255,255,255,.1);
          box-shadow:0 12px 24px rgba(0,0,0,.12);
          backdrop-filter:blur(14px);
          -webkit-backdrop-filter:blur(14px);
          cursor:pointer;
          transition:transform .16s ease, opacity .18s ease, border-color .18s ease;
        }
        .history-chip:hover {
          transform:translateY(-1px);
          border-color:rgba(var(--dynamic-accent-rgb, 224 161 27) / .28);
        }
        .history-chip:active {
          transform:translateY(1px) scale(.985);
        }
        .history-chip-art {
          width:36px;
          height:36px;
          border-radius:12px;
          overflow:hidden;
          display:grid;
          place-items:center;
          background:rgba(255,255,255,.08);
          box-shadow:inset 0 1px 0 rgba(255,255,255,.08);
        }
        .history-chip-art img {
          width:100%;
          height:100%;
          object-fit:cover;
          display:block;
        }
        .history-chip-copy {
          min-width:0;
          display:grid;
          gap:2px;
        }
        .history-chip-title,
        .history-chip-sub {
          white-space:nowrap;
          overflow:hidden;
          text-overflow:ellipsis;
        }
        .history-chip-title {
          font-size:12px;
          font-weight:800;
          color:#fffdf7;
        }
        .history-chip-sub {
          font-size:10px;
          font-weight:600;
          color:rgba(255,255,255,.62);
        }
        .theme-light .history-chip {
          background:rgba(255,255,255,.76);
          border-color:rgba(143,159,181,.16);
          box-shadow:0 12px 24px rgba(95,112,136,.12);
        }
        .theme-light .history-chip-title {
          color:#1f2633;
        }
        .theme-light .history-chip-sub {
          color:#5d6b7f;
        }
        .time-row,.controls,.accent-row,.progress-line { direction:ltr; }
        .time-row { display:contents; }
        .progress-line {
          display:grid;
          grid-template-columns:auto minmax(0,1fr) auto;
          align-items:center;
          gap:10px;
        }
        .empty-quick-shelf {
          --empty-quick-edge-fade:42px;
          --empty-quick-gap:16px;
          --empty-quick-card-width:214px;
          --empty-quick-two-card-min:calc((var(--empty-quick-edge-fade) * 2) + (var(--empty-quick-card-width) * 2) + var(--empty-quick-gap));
          display:flex;
          gap:var(--empty-quick-gap);
          width:min(980px, 100%);
          box-sizing:border-box;
          margin:0 auto;
          padding:8px var(--empty-quick-edge-fade) 10px;
          overflow-x:auto;
          scrollbar-width:none;
          -ms-overflow-style:none;
          scroll-snap-type:x proximity;
          scroll-padding-inline:var(--empty-quick-edge-fade);
          -webkit-mask-image:linear-gradient(90deg, transparent 0, rgba(0,0,0,.22) 10px, rgba(0,0,0,.72) 26px, #000 var(--empty-quick-edge-fade), #000 calc(100% - var(--empty-quick-edge-fade)), rgba(0,0,0,.72) calc(100% - 26px), rgba(0,0,0,.22) calc(100% - 10px), transparent 100%);
          mask-image:linear-gradient(90deg, transparent 0, rgba(0,0,0,.22) 10px, rgba(0,0,0,.72) 26px, #000 var(--empty-quick-edge-fade), #000 calc(100% - var(--empty-quick-edge-fade)), rgba(0,0,0,.72) calc(100% - 26px), rgba(0,0,0,.22) calc(100% - 10px), transparent 100%);
        }
        .rtl .empty-quick-shelf {
          padding-inline:var(--empty-quick-edge-fade);
        }
        .empty-quick-shelf::-webkit-scrollbar {
          display:none;
        }
        .empty-quick-card {
          position:relative;
          min-width:var(--empty-quick-card-width);
          max-width:var(--empty-quick-card-width);
          min-height:78px;
          padding:12px 14px;
          display:grid;
          grid-template-columns:48px minmax(0,1fr);
          gap:12px;
          align-items:center;
          border:none;
          border-radius:24px;
          color:inherit;
          background:linear-gradient(145deg, rgba(255,255,255,.12), rgba(255,255,255,.05));
          border:1px solid rgba(255,255,255,.12);
          box-shadow:0 18px 34px rgba(0,0,0,.14), inset 0 1px 0 rgba(255,255,255,.08);
          backdrop-filter:blur(18px);
          -webkit-backdrop-filter:blur(18px);
          cursor:pointer;
          scroll-snap-align:center;
          transition:transform .16s ease, border-color .16s ease, box-shadow .16s ease, background-color .16s ease;
        }
        .empty-quick-card:active,
        .empty-quick-card.pressed,
        .empty-quick-card.busy {
          transform:translateY(1px) scale(.98);
          border-color:color-mix(in srgb, var(--ma-accent) 34%, rgba(255,255,255,.14));
          box-shadow:0 12px 24px rgba(0,0,0,.12), 0 0 0 1px color-mix(in srgb, var(--ma-accent) 24%, transparent);
        }
        .empty-quick-card.busy,
        .empty-quick-card:disabled {
          cursor:progress;
        }
        .empty-quick-card.busy::after {
          content:"";
          position:absolute;
          inset:0;
          border-radius:inherit;
          background:linear-gradient(120deg, transparent 0%, color-mix(in srgb, var(--ma-accent) 18%, transparent) 45%, transparent 76%);
          transform:translateX(-100%);
          animation:emptyActionSweep .9s ease-in-out infinite;
          pointer-events:none;
        }
        .empty-quick-art {
          width:48px;
          height:48px;
          border-radius:16px;
          overflow:hidden;
          display:grid;
          place-items:center;
          background:linear-gradient(135deg, color-mix(in srgb, var(--ma-accent) 20%, transparent), rgba(255,255,255,.06));
          border:1px solid rgba(255,255,255,.12);
          box-shadow:0 10px 24px rgba(0,0,0,.16);
        }
        .empty-quick-art img {
          width:100%;
          height:100%;
          object-fit:cover;
          display:block;
        }
        .empty-quick-art .ui-ic {
          width:22px;
          height:22px;
        }
        .empty-quick-copy {
          min-width:0;
          display:grid;
          gap:4px;
          text-align:start;
        }
        .empty-quick-kicker {
          font-size:10px;
          font-weight:900;
          letter-spacing:.08em;
          text-transform:uppercase;
          color:rgba(255,255,255,.5);
        }
        .empty-quick-title {
          font-size:14px;
          font-weight:900;
          line-height:1.2;
          color:#f4f6fb;
          overflow:hidden;
          text-overflow:ellipsis;
          white-space:nowrap;
        }
        .card.layout-tablet .progress-line,
        .card.layout-tablet .controls {
          width:min(900px, 100%);
          margin-inline:auto;
        }
        .card.layout-tablet .progress-line {
          gap:12px;
          margin-top:4px;
        }
        .progress-time {
          font-size:13px;
          color:rgba(255,255,255,.76);
          min-width:40px;
          text-align:center;
        }
        .card.layout-tablet .progress-time {
          font-size:15px;
          min-width:52px;
          letter-spacing:.01em;
        }
        .theme-light .progress-time {
          color:#4b5c73;
        }
        .progress {
          height:10px;
          min-width:0;
          overflow:hidden;
          cursor:pointer;
          border-radius:999px;
          background:linear-gradient(180deg, rgba(255,255,255,.14), rgba(255,255,255,.08));
          border:1px solid rgba(255,255,255,.08);
          box-shadow:inset 0 1px 2px rgba(255,255,255,.05), inset 0 -1px 2px rgba(0,0,0,.18);
        }
        .card.layout-tablet .progress {
          height:8px;
        }
        .progress-fill {
          width:0%;
          height:100%;
          background:linear-gradient(90deg, var(--ma-accent), color-mix(in srgb, var(--ma-accent) 72%, white 28%));
          box-shadow:0 0 18px color-mix(in srgb, var(--ma-accent) 20%, transparent);
        }
        .controls { display:flex; align-items:center; justify-content:center; gap:12px; }
        .card.layout-tablet .controls {
          gap:18px;
          margin-top:4px;
        }
        .side-btn,.main-btn,.volume-btn,.menu-head button,.queue-actions .chip-btn,.action-btn {
          border:none; cursor:pointer; color:#fff; font:inherit;
          display:grid; place-items:center;
          background:linear-gradient(180deg, rgba(255,255,255,.14), rgba(255,255,255,.06));
          border:1px solid rgba(255,255,255,.14);
          backdrop-filter:blur(14px) saturate(138%);
          -webkit-backdrop-filter:blur(14px) saturate(138%);
        }
        .side-btn,.volume-btn {
          width:var(--flow-side-btn-size);
          height:var(--flow-side-btn-size);
          border-radius:19px;
          position:relative;
          overflow:visible;
          box-shadow:0 12px 26px rgba(0,0,0,.18), inset 0 1px 0 rgba(255,255,255,.08);
          transition:transform .16s ease, background .18s ease, border-color .18s ease, color .18s ease, box-shadow .18s ease;
        }
        .side-btn.minor-btn { width:var(--flow-minor-btn-size); height:var(--flow-minor-btn-size); border-radius:16px; }
        .main-btn {
          width:var(--flow-main-btn-size);
          height:var(--flow-main-btn-size);
          border-radius:50%;
          box-shadow:0 18px 34px rgba(0,0,0,.22), inset 0 1px 0 rgba(255,255,255,.18);
          background:linear-gradient(180deg, rgba(255,255,255,.18), rgba(255,255,255,.07));
          position:relative;
          overflow:visible;
        }
        .card.layout-tablet .side-btn,
        .card.layout-tablet .volume-btn {
          width:var(--flow-tablet-side-btn-size);
          height:var(--flow-tablet-side-btn-size);
          border-radius:999px;
          background:linear-gradient(180deg, rgba(255,255,255,.11), rgba(255,255,255,.045));
          box-shadow:0 10px 22px rgba(0,0,0,.14), inset 0 1px 0 rgba(255,255,255,.07);
        }
        .card.layout-tablet .side-btn.minor-btn { width:var(--flow-tablet-minor-btn-size); height:var(--flow-tablet-minor-btn-size); border-radius:999px; }
        .card.layout-tablet .main-btn { width:var(--flow-tablet-main-btn-size); height:var(--flow-tablet-main-btn-size); }
        .card.layout-tablet .main-btn::after {
          content:"";
          position:absolute;
          inset:-6px;
          border-radius:inherit;
          border:1px solid transparent;
          opacity:0;
          pointer-events:none;
        }
        .card.layout-tablet .main-btn.is-playing::after {
          border-color:rgba(255,255,255,.22);
          box-shadow:0 0 16px rgba(255,255,255,.12);
          animation:main-btn-pulse 2.4s ease-out infinite;
          opacity:.75;
        }
        @keyframes main-btn-pulse {
          0% { transform:scale(1); opacity:.58; }
          65% { transform:scale(1.08); opacity:.14; }
          100% { transform:scale(1.12); opacity:0; }
        }
        .side-btn .ui-ic,.volume-btn .ui-ic {
          width:56%;
          height:56%;
          filter:drop-shadow(0 2px 5px rgba(0,0,0,.22));
        }
        .side-btn.minor-btn .ui-ic {
          width:64%;
          height:64%;
        }
        .main-btn .ui-ic {
          width:52%;
          height:52%;
          filter:drop-shadow(0 3px 8px rgba(0,0,0,.24));
        }
        .card.layout-tablet .side-btn .ui-ic,
        .card.layout-tablet .volume-btn .ui-ic {
          width:48%;
          height:48%;
          opacity:.92;
          filter:drop-shadow(0 1px 3px rgba(0,0,0,.16));
        }
        .card.layout-tablet .side-btn.minor-btn .ui-ic {
          width:54%;
          height:54%;
        }
        .card.layout-tablet .main-btn .ui-ic {
          width:48%;
          height:48%;
          opacity:.94;
          filter:drop-shadow(0 2px 5px rgba(0,0,0,.18));
        }
        .side-btn .ui-ic *,
        .volume-btn .ui-ic *,
        .main-btn .ui-ic * {
          stroke-linecap:round;
          stroke-linejoin:round;
          vector-effect:non-scaling-stroke;
        }
        .side-btn.active {
          color:#fff7e4;
          border-color:color-mix(in srgb, var(--ma-accent) 48%, rgba(255,255,255,.16));
          background:
            radial-gradient(circle at 50% 28%, color-mix(in srgb, var(--ma-accent) 30%, rgba(255,255,255,.08)), transparent 58%),
            linear-gradient(180deg, color-mix(in srgb, var(--ma-accent) 24%, rgba(255,255,255,.10)), rgba(255,255,255,.06));
          box-shadow:0 14px 30px color-mix(in srgb, var(--ma-accent) 20%, rgba(0,0,0,.18)), inset 0 1px 0 rgba(255,255,255,.14);
        }
        .side-btn.minor-btn.active::after {
          content:"";
          position:absolute;
          left:50%;
          bottom:8px;
          width:5px;
          height:5px;
          border-radius:999px;
          transform:translateX(-50%);
          background:currentColor;
          box-shadow:0 0 12px color-mix(in srgb, var(--ma-accent) 54%, transparent);
          opacity:.96;
        }
        #mobileShuffleBtn.minor-btn.active::after {
          content:none;
          display:none;
        }
        #mobileShuffleBtn.active {
          border-color:color-mix(in srgb, var(--ma-accent) 58%, rgba(255,255,255,.18));
          box-shadow:
            0 0 0 1px color-mix(in srgb, var(--ma-accent) 35%, transparent),
            0 0 22px color-mix(in srgb, var(--ma-accent) 24%, transparent),
            inset 0 1px 0 rgba(255,255,255,.16);
        }
        #mobileRepeatBtn[data-repeat-mode="one"]::before,
        #mobileRepeatBtn[data-repeat-mode="all"]::before {
          position:absolute;
          inset-block-start:-5px;
          inset-inline-end:-5px;
          min-width:16px;
          height:16px;
          padding:0 2px;
          border-radius:999px;
          display:grid;
          place-items:center;
          font-size:9px;
          line-height:1;
          font-weight:950;
          color:#1a1306;
          background:color-mix(in srgb, var(--ma-accent) 78%, white 22%);
          box-shadow:0 4px 10px color-mix(in srgb, var(--ma-accent) 28%, transparent), inset 0 1px 0 rgba(255,255,255,.45);
          z-index:3;
          pointer-events:none;
        }
        #mobileRepeatBtn[data-repeat-mode="one"]::before { content:"1"; }
        #mobileRepeatBtn[data-repeat-mode="all"]::before { content:"8"; font-size:10px; }
        .card.layout-tablet .side-btn.minor-btn.active::after {
          bottom:13px;
          width:7px;
          height:7px;
        }
        .card.layout-tablet #mobileRepeatBtn[data-repeat-mode="one"]::before,
        .card.layout-tablet #mobileRepeatBtn[data-repeat-mode="all"]::before {
          inset-block-start:-4px;
          inset-inline-end:-4px;
          min-width:16px;
          height:16px;
          font-size:10px;
        }
        .side-btn.muted {
          border-color:rgba(214,76,76,.26);
          background:rgba(214,76,76,.18);
          color:#ff8f8f;
        }
        .volume-btn.active {
          color:#fff7e8;
          border-color:color-mix(in srgb, var(--ma-accent) 48%, transparent);
          background:linear-gradient(135deg, color-mix(in srgb, var(--ma-accent) 34%, transparent), color-mix(in srgb, var(--ma-accent) 18%, transparent));
          box-shadow:0 12px 28px color-mix(in srgb, var(--ma-accent) 26%, transparent);
        }
        .accent-row { display:grid; grid-template-columns:auto minmax(0,1fr) auto; gap:10px; align-items:center; padding:7px 9px; border-radius:18px; }
        .card.layout-tablet .accent-row {
          position:relative;
          inset:auto;
          transform:none;
          z-index:6;
          width:min(920px, 100%);
          min-height:0;
          grid-template-columns:auto minmax(0,1fr) auto;
          grid-template-rows:auto;
          justify-items:stretch;
          gap:12px;
          padding:10px 12px;
          border-radius:26px;
          background:rgba(14,18,28,.42);
          border:1px solid rgba(255,255,255,.12);
          backdrop-filter:blur(18px);
          -webkit-backdrop-filter:blur(18px);
          box-shadow:0 14px 28px rgba(0,0,0,.18);
          justify-self:center;
          align-self:start;
        }
        .theme-light .card.layout-tablet .accent-row {
          background:rgba(255,255,255,.58);
          border-color:rgba(141,155,177,.18);
          box-shadow:0 18px 34px rgba(111,126,150,.12);
        }
        .card.layout-tablet .accent-row .volume-btn {
          grid-row:auto;
          width:46px;
          height:46px;
          border-radius:999px;
          align-self:center;
        }
        .card.layout-tablet .accent-row .volume-value {
          grid-row:auto;
          min-width:54px;
          width:auto;
          text-align:end;
          font-size:14px;
          font-weight:900;
          align-self:center;
        }
        .card.layout-tablet .accent-row .tablet-volume-track {
          grid-row:auto;
          width:100%;
          height:auto;
          display:grid;
          place-items:center;
          align-self:center;
          justify-self:stretch;
        }
        .card.layout-tablet .accent-row .volume-slider {
          -webkit-appearance:none;
          appearance:none;
          writing-mode:horizontal-tb;
          direction:ltr;
          width:100%;
          height:7px;
          margin:0;
          align-self:center;
          justify-self:stretch;
          background:linear-gradient(to right,var(--ma-accent) 0%,var(--ma-accent) var(--vol-pct,50%),rgba(255,255,255,.22) var(--vol-pct,50%),rgba(255,255,255,.22) 100%);
          accent-color:var(--ma-accent);
        }
        .tablet-volume-popup {
          width:min(760px, calc(100cqi - 104px));
          border-radius:0;
          padding:0;
          background:transparent;
          border:none;
          box-shadow:none;
          backdrop-filter:none;
          -webkit-backdrop-filter:none;
          display:grid;
          grid-template-columns:auto minmax(0,1fr) auto;
          align-items:center;
          gap:16px;
        }
        .theme-light .tablet-volume-popup {
          background:transparent;
          border:none;
          box-shadow:none;
        }
        .tablet-volume-popup-head {
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:14px;
        }
        .tablet-volume-popup-title {
          font-size:20px;
          font-weight:900;
          letter-spacing:.01em;
        }
        .tablet-volume-popup-value {
          min-width:58px;
          min-height:44px;
          display:flex;
          align-items:center;
          justify-content:center;
          text-align:center;
          font-size:20px;
          font-weight:950;
          color:var(--ma-accent);
        }
        .tablet-volume-popup-body {
          display:grid;
          grid-template-columns:minmax(0,1fr) auto;
          gap:18px;
          align-items:center;
        }
        .tablet-volume-popup .volume-slider {
          width:100%;
          height:8px;
          margin:0;
          align-self:center;
          border-radius:999px;
          background:linear-gradient(to right,var(--ma-accent) 0%,var(--ma-accent) var(--vol-pct,50%),rgba(255,255,255,.16) var(--vol-pct,50%),rgba(255,255,255,.16) 100%);
        }
        .tablet-volume-popup .volume-slider::-webkit-slider-runnable-track {
          height:8px;
          border-radius:999px;
          background:transparent;
        }
        .tablet-volume-popup .volume-slider::-webkit-slider-thumb {
          width:30px;
          height:30px;
          margin-top:-11px;
          border-radius:999px;
          background:var(--ma-accent);
          border:2px solid rgba(255,255,255,.7);
          box-shadow:0 8px 18px rgba(0,0,0,.18);
        }
        .tablet-volume-popup .volume-slider::-moz-range-track {
          height:8px;
          border-radius:999px;
          background:transparent;
        }
        .tablet-volume-popup .volume-slider::-moz-range-thumb {
          width:30px;
          height:30px;
          border-radius:999px;
          background:var(--ma-accent);
          border:2px solid rgba(255,255,255,.7);
          box-shadow:0 8px 18px rgba(0,0,0,.18);
        }
        .theme-light .tablet-volume-popup .volume-slider {
          background:linear-gradient(to right,var(--ma-accent) 0%,var(--ma-accent) var(--vol-pct,50%),rgba(95,108,128,.14) var(--vol-pct,50%),rgba(95,108,128,.14) 100%);
        }
        .mobile-volume-inline {
          display:grid;
          grid-template-columns:auto minmax(0, 1fr) auto auto;
          align-items:center;
          gap:14px;
          width:100%;
        }
        .mobile-volume-inline .tablet-volume-track {
          min-width:0;
          width:100%;
        }
        .mobile-volume-inline .volume-value {
          min-width:52px;
          text-align:center;
        }
        .mobile-volume-inline .volume-btn {
          flex:0 0 auto;
          width:calc(var(--flow-side-btn-size) - 6px);
          height:calc(var(--flow-side-btn-size) - 6px);
        }
        .card.layout-tablet .mobile-volume-inline .volume-btn {
          width:46px;
          height:46px;
        }
        .mobile-volume-inline.has-volume-step-buttons {
          grid-template-columns:auto auto minmax(0, 1fr) auto auto auto;
          gap:8px;
        }
        .group-volume-btn[hidden] {
          display:none !important;
        }
        .volume-step-btn {
          width:38px;
          min-width:38px;
          height:38px;
          display:grid;
          place-items:center;
          border:0;
          border-radius:999px;
          background:transparent;
          color:rgba(255,255,255,.9);
          cursor:pointer;
          touch-action:manipulation;
          padding:0;
        }
        .volume-step-btn:hover,
        .volume-step-btn:focus-visible {
          background:rgba(255,255,255,.11);
          outline:none;
        }
        .volume-step-btn .ui-ic {
          width:20px;
          height:20px;
        }
        .card.layout-tablet .tablet-volume-inline {
          width:min(700px, 84%);
          margin:6px auto 0;
          padding:0;
          background:transparent;
          border:none;
          box-shadow:none;
        }
        .card.layout-tablet .tablet-volume-inline .volume-btn {
          width:46px;
          height:46px;
          border-radius:999px;
        }
        .card.layout-tablet .tablet-volume-inline .volume-btn .ui-ic,
        .card.layout-tablet .mobile-volume-inline .volume-btn .ui-ic {
          width:19px;
          height:19px;
        }
        .card.layout-tablet .tablet-volume-inline .volume-value {
          min-width:60px;
          text-align:center;
        }
        .volume-value {
          min-width:46px;
          text-align:end;
          font-size:13px;
          font-weight:900;
          color:rgba(255,255,255,.82);
          flex-shrink:0;
          border:none;
          background:transparent;
          padding:0;
          cursor:pointer;
        }
        .volume-slider {
          width:100%;
          height:18px;
          appearance:none;
          direction:ltr;
          background:transparent;
          outline:none;
          accent-color:var(--ma-accent);
        }
        .volume-slider::-webkit-slider-runnable-track {
          height:5px;
          border-radius:999px;
          background:linear-gradient(to right, var(--ma-accent) 0%, var(--ma-accent) var(--vol-pct,50%), rgba(255,255,255,.16) var(--vol-pct,50%), rgba(255,255,255,.16) 100%);
          box-shadow:inset 0 1px 1px rgba(255,255,255,.04), inset 0 -1px 1px rgba(0,0,0,.18);
        }
        .volume-slider::-webkit-slider-thumb {
          appearance:none;
          width:16px;
          height:16px;
          margin-top:-5.5px;
          border-radius:50%;
          background:linear-gradient(180deg, color-mix(in srgb, var(--ma-accent) 76%, white 24%), color-mix(in srgb, var(--ma-accent) 88%, black 12%));
          border:2px solid rgba(255,255,255,.72);
          box-shadow:0 5px 14px rgba(0,0,0,.18);
        }
        .volume-slider::-moz-range-track {
          height:5px;
          border-radius:999px;
          background:rgba(255,255,255,.16);
          box-shadow:inset 0 1px 1px rgba(255,255,255,.04), inset 0 -1px 1px rgba(0,0,0,.18);
        }
        .volume-slider::-moz-range-progress {
          height:5px;
          border-radius:999px;
          background:linear-gradient(90deg, var(--ma-accent), color-mix(in srgb, var(--ma-accent) 72%, white 28%));
        }
        .volume-slider::-moz-range-thumb {
          width:16px;
          height:16px;
          border-radius:50%;
          background:linear-gradient(180deg, color-mix(in srgb, var(--ma-accent) 76%, white 24%), color-mix(in srgb, var(--ma-accent) 88%, black 12%));
          border:2px solid rgba(255,255,255,.72);
          box-shadow:0 5px 14px rgba(0,0,0,.18);
        }
        .footer-nav {
          display:flex;
          align-items:stretch;
          gap:10px;
          width:100%;
          margin-top:12px;
          padding:10px;
          border-radius:28px;
          background:rgba(255,255,255,.08);
          border:1px solid rgba(255,255,255,.14);
          backdrop-filter:blur(18px);
          -webkit-backdrop-filter:blur(18px);
          box-shadow:0 20px 40px rgba(0,0,0,.18);
        }
        .card.layout-tablet .footer-nav {
          width:100%;
          margin-inline:auto;
          justify-content:flex-start;
          align-items:stretch;
          flex-direction:column;
          gap:12px;
          padding:0;
          border-radius:0;
          position:relative;
          z-index:5;
          background:transparent;
          border:none;
          backdrop-filter:none;
          -webkit-backdrop-filter:none;
          box-shadow:none;
          flex:1 1 auto;
        }
        .footer-btn {
          flex:1 1 0;
          min-width:0;
          min-height:72px;
          padding:10px 8px;
          border:none;
          border-radius:20px;
          display:grid;
          place-items:center;
          gap:6px;
          font:inherit;
          font-weight:800;
          font-size:calc(12px * var(--v2-font-scale));
          color:#fff;
          background:linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.04));
          border:1px solid rgba(255,255,255,.12);
          box-shadow:inset 0 1px 0 rgba(255,255,255,.06);
          cursor:pointer;
          transition:transform .18s ease, background-color .18s ease, border-color .18s ease, box-shadow .18s ease, color .18s ease;
        }
        .card.layout-tablet .footer-btn {
          flex:0 0 auto;
          min-height:78px;
          padding:10px 8px;
          border-radius:24px;
          font-size:calc(10px * var(--v2-font-scale));
          gap:7px;
        }
        .card.layout-tablet .footer-btn .ui-ic {
          width:22px;
          height:22px;
        }
        .footer-btn .ui-ic { width:22px; height:22px; }
        .footer-btn-label { white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:100%; }
        .footer-btn.accent {
          background:linear-gradient(135deg, rgba(245,166,35,.62), rgba(247,191,92,.48));
          border-color:rgba(255,203,101,.28);
          box-shadow:0 14px 28px rgba(224,161,27,.16), inset 0 1px 0 rgba(255,255,255,.08);
        }
        .footer-btn.soft-accent {
          background:linear-gradient(135deg, rgba(245,166,35,.22), rgba(247,191,92,.14));
          border-color:rgba(245,166,35,.22);
          color:#ffcb73;
        }
        .footer-nav .footer-btn,
        .footer-nav .footer-btn.accent,
        .footer-nav .footer-btn.soft-accent {
          color:inherit;
          background:linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.04));
          border-color:rgba(255,255,255,.12);
          box-shadow:inset 0 1px 0 rgba(255,255,255,.06);
        }
        .footer-nav > #playersFooterBtn { grid-column:1; }
        .footer-nav > #libraryToggleBtn { grid-column:2; }
        .footer-nav > #menuToggleBtn { grid-column:3; }
        .footer-nav > #settingsFooterBtn { grid-column:4; }
        .card.layout-tablet .active-players-bubble { display:none !important; }
        .theme-light .player-kicker { color:rgba(66,79,97,.58); }
        .theme-light .player-sub,
        .theme-light .hero-sub,
        .theme-light .time-row,
        .theme-light .menu-item-sub,
        .theme-light .queue-sub,
        .theme-light .media-section-title { color:rgba(55,68,85,.68); }
        .theme-light .hero-title,
        .theme-light .menu-title,
        .theme-light .menu-item-title,
        .theme-light .queue-title,
        .theme-light .player-name,
        .theme-light .status-pill,
        .theme-light .progress-time { color:#1f2633; }
        .theme-light .card,
        .theme-light .card button,
        .theme-light .card input,
        .theme-light .card select,
        .theme-light .card textarea {
          color:#1f2633;
        }
        .theme-light .card .settings-value,
        .theme-light .card .settings-check-pill span,
        .theme-light .card .footer-btn,
        .theme-light .card .player-focus-name,
        .theme-light .card .player-focus-kicker,
        .theme-light .card .player-focus-pill,
        .theme-light .card .menu-item-sub,
        .theme-light .card .queue-sub,
        .theme-light .card .hero-sub,
        .theme-light .card .np-sub,
        .theme-light .card .empty-quick-kicker {
          color:rgba(43,54,70,.84);
        }
        .theme-light .up-next-inline {
          background:transparent;
          box-shadow:none;
        }
        .theme-light .up-next-prefix {
          color:color-mix(in srgb, var(--ma-accent) 54%, #62708a);
        }
        .theme-light .up-next-art {
          background:rgba(232,238,247,.95);
        }
        .theme-light .up-next-art-fallback {
          color:#65758d;
        }
        .theme-light .card.empty-media .hero-sub,
        .theme-light .card.empty-media .np-sub {
          color:rgba(48,58,74,.8);
        }
        .theme-light .volume-value { color:rgba(45,57,73,.76); }
        .theme-light .progress {
          background:linear-gradient(180deg, rgba(255,255,255,.4), rgba(229,236,244,.26));
          border-color:rgba(109,123,145,.12);
          box-shadow:inset 0 1px 1px rgba(255,255,255,.58), inset 0 -1px 2px rgba(102,118,140,.08);
        }
        .theme-light .side-btn,.theme-light .main-btn,.theme-light .volume-btn,.theme-light .menu-head button,.theme-light .queue-actions .chip-btn,.theme-light .action-btn {
          color:#1f2633;
          background:linear-gradient(180deg, rgba(255,255,255,.54), rgba(243,247,252,.24));
          border-color:rgba(141,155,177,.26);
          box-shadow:0 12px 26px rgba(111,126,150,.14), inset 0 1px 0 rgba(255,255,255,.62);
        }
        .theme-light .side-btn.active {
          color:#7a5210;
          border-color:color-mix(in srgb, var(--ma-accent) 46%, rgba(141,155,177,.22));
          background:
            radial-gradient(circle at 50% 28%, color-mix(in srgb, var(--ma-accent) 22%, white 78%), transparent 58%),
            linear-gradient(180deg, color-mix(in srgb, var(--ma-accent) 18%, white 82%), rgba(255,255,255,.58));
          box-shadow:0 14px 28px color-mix(in srgb, var(--ma-accent) 16%, rgba(111,126,150,.12)), inset 0 1px 0 rgba(255,255,255,.72);
        }
        .theme-light .side-btn.muted {
          border-color:rgba(214,76,76,.24);
          background:rgba(214,76,76,.12);
          color:#b13d3d;
        }
        .theme-light .volume-btn.active {
          color:#8b5e12;
          border-color:color-mix(in srgb, var(--ma-accent) 42%, transparent);
          background:linear-gradient(135deg, color-mix(in srgb, var(--ma-accent) 18%, white 82%), color-mix(in srgb, var(--ma-accent) 10%, white 90%));
        }
        .theme-light .main-btn {
          background:linear-gradient(180deg, rgba(255,255,255,.8), rgba(237,242,249,.56));
        }
        .theme-light .card.layout-tablet .main-btn.is-playing::after {
          border-color:rgba(31,38,51,.16);
          box-shadow:0 0 16px rgba(31,38,51,.08);
        }
        .theme-light .volume-slider::-webkit-slider-runnable-track {
          background:linear-gradient(to right, var(--ma-accent) 0%, var(--ma-accent) var(--vol-pct,50%), rgba(95,108,128,.16) var(--vol-pct,50%), rgba(95,108,128,.16) 100%);
          box-shadow:inset 0 1px 1px rgba(255,255,255,.55), inset 0 -1px 1px rgba(102,118,140,.08);
        }
        .theme-light .volume-slider::-webkit-slider-thumb {
          border-color:rgba(255,255,255,.94);
          box-shadow:0 5px 14px rgba(96,112,135,.18);
        }
        .theme-light .volume-slider::-moz-range-track {
          background:rgba(95,108,128,.16);
          box-shadow:inset 0 1px 1px rgba(255,255,255,.55), inset 0 -1px 1px rgba(102,118,140,.08);
        }
        .theme-light .volume-slider::-moz-range-thumb {
          border-color:rgba(255,255,255,.94);
          box-shadow:0 5px 14px rgba(96,112,135,.18);
        }
        .theme-light .footer-nav {
          background:rgba(255,255,255,.66);
          border-color:rgba(147,161,183,.18);
          box-shadow:0 16px 34px rgba(110,127,153,.14);
        }
        .theme-light .top-settings-fab,
        .theme-light .home-shortcut-fab {
          background:rgba(255,255,255,.8);
          border-color:rgba(147,161,183,.18);
          color:#1f2633;
          box-shadow:0 12px 24px rgba(111,126,150,.14);
        }
        .theme-light .footer-btn {
          color:#1f2633;
          background:linear-gradient(180deg, rgba(255,255,255,.82), rgba(247,249,252,.72));
          border-color:rgba(147,161,183,.18);
          box-shadow:inset 0 1px 0 rgba(255,255,255,.42);
        }
        .theme-light .footer-btn.accent {
          color:#111827;
          background:linear-gradient(135deg, rgba(245,166,35,.72), rgba(247,191,92,.58));
          border-color:rgba(245,166,35,.26);
          box-shadow:0 14px 28px rgba(224,161,27,.14), inset 0 1px 0 rgba(255,255,255,.28);
        }
        .theme-light .footer-btn.soft-accent {
          color:#8b5e12;
          background:linear-gradient(135deg, rgba(245,166,35,.16), rgba(247,191,92,.12));
          border-color:rgba(245,166,35,.18);
        }
        .theme-light .footer-nav .footer-btn,
        .theme-light .footer-nav .footer-btn.accent,
        .theme-light .footer-nav .footer-btn.soft-accent {
          color:#1f2633;
          background:linear-gradient(180deg, rgba(255,255,255,.82), rgba(247,249,252,.72));
          border-color:rgba(147,161,183,.18);
          box-shadow:inset 0 1px 0 rgba(255,255,255,.42);
        }
        .theme-light .card.layout-tablet .footer-nav .footer-btn,
        .theme-light .card.layout-tablet .footer-nav .footer-btn.accent,
        .theme-light .card.layout-tablet .footer-nav .footer-btn.soft-accent {
          background:rgba(255,255,255,.5);
          border-color:rgba(147,161,183,.16);
          box-shadow:0 10px 22px rgba(111,126,150,.1), inset 0 1px 0 rgba(255,255,255,.34);
        }
        .theme-light .card.layout-tablet .player-focus {
          background:rgba(255,255,255,.5);
          border-color:rgba(147,161,183,.16);
          box-shadow:0 16px 30px rgba(111,126,150,.1);
        }
        .theme-custom .footer-nav,
        .theme-custom .menu-sheet,
        .theme-custom .notice,
        .theme-custom .accent-row,
        .theme-custom .menu-item,
        .theme-custom .menu-list-item,
        .theme-custom .queue-row {
          background:rgba(var(--v2-custom-rgb) / .16);
          border-color:rgba(var(--v2-custom-rgb) / .22);
          box-shadow:0 16px 34px rgba(0,0,0,.14);
          color:var(--v2-custom-text, #fff);
        }
        .theme-custom .footer-btn {
          color:var(--v2-custom-text, #fff);
          background:linear-gradient(180deg, rgba(var(--v2-custom-rgb) / .2), rgba(var(--v2-custom-rgb) / .12));
          border-color:rgba(var(--v2-custom-rgb) / .2);
        }
        .theme-custom .footer-btn.accent,
        .theme-custom .footer-btn.soft-accent {
          background:linear-gradient(135deg, rgba(var(--v2-custom-rgb) / .42), rgba(var(--v2-custom-rgb) / .26));
          border-color:rgba(var(--v2-custom-rgb) / .34);
        }
        .theme-custom .footer-nav .footer-btn,
        .theme-custom .footer-nav .footer-btn.accent,
        .theme-custom .footer-nav .footer-btn.soft-accent {
          color:var(--v2-custom-text, #fff);
          background:linear-gradient(180deg, rgba(var(--v2-custom-rgb) / .2), rgba(var(--v2-custom-rgb) / .12));
          border-color:rgba(var(--v2-custom-rgb) / .22);
        }
        .theme-custom .progress-time,
        .theme-custom .menu-item-title,
        .theme-custom .queue-title,
        .theme-custom .hero-title,
        .theme-custom .hero-sub,
        .theme-custom .up-next-title,
        .theme-custom .menu-title,
        .theme-custom .volume-value,
        .theme-custom .player-focus,
        .theme-custom .footer-btn,
        .theme-custom .menu-item-ico,
        .theme-custom .media-category-ico {
          color:#fff !important;
        }
        .theme-custom .up-next-prefix,
        .theme-custom .up-next-art-fallback {
          color:var(--v2-custom-text, #fff) !important;
        }
        .theme-custom .up-next-inline {
          background:transparent;
          border-color:transparent;
        }
        .status-pill { grid-area:status; display:inline-flex; align-items:center; gap:8px; width:fit-content; max-width:100%; padding:9px 14px; border-radius:999px; font-size:12px; font-weight:700; justify-self:start; cursor:pointer; }
        .status-pill.offline { background:rgba(214,86,86,.16); border-color:rgba(214,86,86,.26); }
        .status-dot { width:8px; height:8px; border-radius:50%; background:#4bd06e; box-shadow:0 0 10px rgba(75,208,110,.42); }
        .status-pill.offline .status-dot { background:#e26b6b; box-shadow:0 0 10px rgba(226,107,107,.42); }
        .notice { display:none; padding:14px 16px; border-radius:22px; line-height:1.45; }
        .notice.open { display:block; }
        .homeii-loading-state,
        .notice.open.homeii-loading-notice {
          min-height:180px;
          display:grid;
          place-items:center;
          text-align:center;
          padding:28px 16px;
          color:var(--ma-text-2);
          background:transparent;
          border:0;
        }
        `;
}
