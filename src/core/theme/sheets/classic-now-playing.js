// Classic now-playing styles. Original cascade order is preserved.
export default `          .now-layout {
            height:100%;
            display:grid;
            grid-template-columns:minmax(320px,42%) minmax(0,58%);
            gap:calc(16px * var(--ma-ui-scale));
            min-height:0;
          }
          .now-left,.now-right { min-height:0; display:flex; flex-direction:column; gap:calc(14px * var(--ma-ui-scale)); overflow:hidden; }
          .now-right > .now-card { flex:1; }
          .now-card {
            border:1px solid var(--ma-border);
            background:var(--ma-panel);
            border-radius:calc(24px * var(--ma-ui-scale));
            backdrop-filter:blur(16px);
            -webkit-backdrop-filter:blur(16px);
            box-shadow:0 10px 28px rgba(0,0,0,0.16);
          }
          .now-art-card {
            padding:calc(18px * var(--ma-ui-scale));
            min-height:0;
            display:flex;
            flex-direction:column;
            justify-content:center;
            box-shadow:0 16px 34px rgba(0,0,0,0.12);
            flex:1 1 auto;
          }
          .now-art {
            width:min(100%, clamp(200px, 34vh, 420px));
            aspect-ratio:1/1;
            max-width:100%;
            border-radius:24px;
            overflow:hidden;
            background:var(--ma-soft);
            display:grid;
            place-items:center;
            font-size:54px;
            color:var(--ma-text-3);
            border:1px solid var(--ma-border);
            box-shadow:0 16px 34px rgba(0,0,0,0.14);
            margin-inline:auto;
          }
          .now-track-meta { padding-top:12px; min-width:0; }
          .now-track-title {
            font-size:var(--ma-track-title-size);
            font-weight:900;
            line-height:1.06;
            margin-bottom:6px;
            letter-spacing:-0.02em;
            word-break:break-word;
          }
          .now-track-subtitle {
            font-size:14px;
            color:var(--ma-text-2);
            word-break:break-word;
            line-height:1.45;
          }
          .now-controls-card {
            padding:calc(18px * var(--ma-ui-scale));
            box-shadow:0 16px 34px rgba(0,0,0,0.10);
            display:grid;
            gap:calc(14px * var(--ma-ui-scale));
            align-content:start;
            overflow:hidden;
            flex:0 0 auto;
          }
          .now-time-row { display:flex; justify-content:space-between; gap:10px; font-size:12px; color:var(--ma-text-3); }
          .now-progress {
            height:12px;
            border-radius:999px;
            box-shadow:inset 0 1px 2px rgba(0,0,0,0.08);
          }
          .now-controls-main { gap:calc(10px * var(--ma-ui-scale)); flex-wrap:nowrap; justify-content:center; }
          .big-round-btn {
            width:var(--ma-now-button-size);
            height:var(--ma-now-button-size);
            border-radius:calc(20px * var(--ma-ui-scale));
            background:color-mix(in srgb, var(--ma-soft) 96%, transparent);
            color:var(--ma-text-1);
            border:1px solid color-mix(in srgb, var(--ma-border) 96%, transparent);
            box-shadow:0 12px 24px rgba(0,0,0,0.10);
          }
          .big-main-btn {
            width:var(--ma-now-main-button-size);
            height:var(--ma-now-main-button-size);
            border-radius:50%;
            font-size:calc(28px * var(--ma-ui-scale));
            box-shadow:0 14px 32px rgba(224,161,27,0.22);
          }
          .now-controls-bottom { display:grid; grid-template-columns:minmax(0,1fr) auto; gap:calc(12px * var(--ma-ui-scale)); align-items:center; }
          .now-volume {
            width:100%;
            display:grid;
            grid-template-columns:auto minmax(0,1fr);
            align-items:center;
            gap:calc(12px * var(--ma-ui-scale));
          }
          .now-volume input {
            width:100%;
            flex:unset;
            min-width:0;
          }
          .now-actions {
            display:flex;
            gap:8px;
            flex-wrap:wrap;
            justify-content:flex-end;
            align-items:center;
          }
          .now-player-picker-btn { font-size:12px; }
          .now-queue-card { padding:calc(16px * var(--ma-ui-scale)); min-height:0; display:flex; flex-direction:column; overflow:hidden; }
          .now-queue-toolbar { display:grid; gap:calc(12px * var(--ma-ui-scale)); margin-bottom:calc(12px * var(--ma-ui-scale)); }
          .now-queue-toolbar .now-queue-header { margin-bottom:0; }
          .now-queue-header { display:flex; align-items:center; gap:10px; margin-bottom:12px; flex-wrap:wrap; }
          .now-queue-title { font-size:15px; font-weight:700; }
          .now-queue-body { flex:1; min-height:0; overflow:hidden; display:flex; flex-direction:column; }
          .now-side-scroll {
            min-height:0;
            flex:1;
            overflow:auto;
            padding-inline-end:4px;
          }
          .now-queue-list {
            min-height:0;
            flex:1;
            overflow-y:visible;
            overflow-x:hidden;
            display:flex;
            flex-direction:column;
            gap:8px;
          }
          .now-queue-search {
            width:100%;
            min-width:0;
            flex:unset;
          }
          .side-search-summary {
            display:flex;
            align-items:center;
            justify-content:space-between;
            gap:10px;
            flex-wrap:wrap;
            margin-bottom:12px;
          }
          .side-search-summary-text {
            font-size:12px;
            color:var(--ma-text-3);
          }
          .mini-queue-item {
            display:flex;
            align-items:center;
            gap:10px;
            min-width:0;
            padding:10px 10px;
            border-radius:14px;
            background:transparent;
            border:1px solid transparent;
            cursor:pointer;
            position:relative;
          }
          .mini-queue-item:hover { background:var(--ma-soft); }
          .mini-queue-item.active {
            background:linear-gradient(90deg, color-mix(in srgb, var(--ma-accent) 18%, transparent), transparent 70%), var(--ma-soft);
            border-color:color-mix(in srgb, var(--ma-accent) 34%, transparent);
          }
          .mini-queue-item.active::before {
            content:'';
            position:absolute;
            inset-inline-start:0;
            top:8px;
            bottom:8px;
            width:3px;
            border-radius:999px;
            background:linear-gradient(180deg, var(--ma-accent), color-mix(in srgb, var(--ma-accent) 70%, white 30%));
          }
          .mini-queue-thumb { width:40px; height:40px; border-radius:11px; flex-shrink:0; }
          .mini-queue-meta { flex:1; min-width:0; }
          .mini-queue-name { font-size:12px; font-weight:600; }
          .mini-queue-item.active .mini-queue-name { color:var(--ma-text-1); font-weight:700; }
          .mini-queue-item.active .mini-queue-artist,.mini-queue-item.active .mini-queue-index { color:color-mix(in srgb, var(--ma-accent) 68%, white 32%); }
          .mini-queue-index { width:22px; text-align:center; font-size:11px; color:var(--ma-text-3); flex-shrink:0; }
          .group-inline { display:flex; align-items:center; gap:8px; margin-inline-start:auto; flex-wrap:wrap; }
          @media (max-width:1280px) {
            .now-controls-bottom { grid-template-columns:minmax(0,1fr) auto; }
            .now-actions { justify-content:flex-start; }
            .now-volume { width:100%; }
            .now-volume input { flex:1; min-width:0; }
            .now-controls-main { justify-content:center; }
          }
          @media (max-width:1100px) { .now-layout { grid-template-columns:1fr; grid-template-rows:auto minmax(0,1fr); } }
          @media (max-width:920px) {
            .card { grid-template-columns:1fr; height:min(var(--ma-card-height), calc(100dvh - 24px)); min-height:min(620px, var(--ma-effective-height)); }
            .sidebar {
              border-inline-end:none;
              border-bottom:1px solid var(--ma-border);
              display:grid;
              grid-template-columns:minmax(0,1fr);
            }
            .brand {
              padding:12px;
              border-bottom:1px solid color-mix(in srgb, var(--ma-border) 92%, transparent);
            }
            .nav { display:flex; gap:8px; overflow-x:auto; overflow-y:hidden; flex:unset; padding:10px; }
            .nav-label { display:none; }
            .nav-btn { width:auto; margin-bottom:0; white-space:nowrap; }
            .player-panel {
              display:grid;
              grid-template-columns:minmax(0,1fr) auto;
              gap:10px 12px;
              padding:12px;
              border-top:1px solid color-mix(in srgb, var(--ma-border) 92%, transparent);
            }
            .np-row {
              flex-direction:row;
              align-items:center;
              text-align:start;
              gap:10px;
            }
            .np-art {
              width:72px;
              height:72px;
              border-radius:20px;
            }
            .np-meta { flex:1; }
            .controls {
              margin-inline-start:auto;
              gap:10px;
            }
            .volume-row {
              grid-column:1 / -1;
            }
            .topbar {
              overflow-x:visible;
              overflow-y:visible;
            }
            .topbar-row,.player-summary-row {
              width:100%;
              min-width:0;
              display:grid;
              grid-template-columns:minmax(0,1fr) auto;
              grid-template-areas:
                "player actions"
                "search search";
              align-items:center;
              gap:10px;
            }
            .search {
              grid-area:search;
              width:100%;
              min-width:0;
            }
            .selected-player-box {
              grid-area:player;
              width:100%;
              min-width:0;
              max-width:none;
              flex:none;
            }
            .topbar-actions {
              grid-area:actions;
              margin-inline-start:0;
              justify-self:end;
              max-width:100%;
              overflow-x:auto;
              overflow-y:hidden;
              padding-bottom:2px;
            }
            .status-pill { width:auto; justify-content:center; }
            .now-controls-bottom { grid-template-columns:1fr; }
            .now-actions { justify-content:flex-start; }
            .group-list,.player-list { grid-template-columns:1fr; }
            .modal-backdrop {
              padding:
                max(12px, env(safe-area-inset-top))
                max(12px, env(safe-area-inset-right))
                max(12px, env(safe-area-inset-bottom))
                max(12px, env(safe-area-inset-left));
            }
          }
          @media (max-width:720px) {
            :host { --ma-radius-xl: 18px; }
            .card {
              height:min(var(--ma-card-height), calc(100dvh - 12px));
              max-height:calc(100dvh - 12px);
              border-radius:20px;
            }
            .brand {
              padding:10px 12px;
              gap:10px;
            }
            .brand-sub { display:none; }
            .player-panel {
              grid-template-columns:minmax(0,1fr);
              padding:10px 12px 12px;
            }
            .np-row {
              gap:10px;
            }
            .np-art {
              width:64px;
              height:64px;
              border-radius:18px;
            }
            .np-title { font-size:14px; }
            .controls {
              margin-inline-start:0;
              justify-content:flex-start;
            }
            .play-btn {
              width:58px;
              height:58px;
              border-radius:20px;
            }
            .topbar { padding:12px; }
            .content { padding:12px; }
            .topbar-row,.player-summary-row {
              grid-template-columns:1fr;
              grid-template-areas:
                "actions"
                "player"
                "search";
            }
            .topbar-actions {
              justify-self:stretch;
              width:100%;
              justify-content:flex-start;
              flex-wrap:nowrap;
            }
            .search,
            .selected-player-box {
              width:100%;
              min-width:0;
            }
            .selected-player-box {
              min-height:44px;
            }
            .icon-btn,.lang-btn,.close-btn,.theme-btn {
              width:40px;
              height:40px;
            }
            .status-pill {
              min-height:40px;
              padding:0 12px;
            }
            .now-layout {
              height:auto;
              min-height:0;
              gap:12px;
            }
            .now-left,.now-right {
              gap:12px;
            }
            .now-art-card {
              padding:16px;
            }
            .now-art {
              width:min(100%, 280px);
              border-radius:20px;
            }
            .now-track-meta {
              padding-top:10px;
              text-align:center;
            }
            .now-track-title { font-size:22px; }
            .now-track-subtitle { font-size:13px; }
            .now-controls-card { padding:16px; gap:12px; }
            .now-time-row { font-size:11px; }
            .now-progress { height:10px; }
            .big-round-btn { width:54px; height:54px; border-radius:18px; }
            .big-main-btn { width:76px; height:76px; font-size:26px; }
            .now-controls-main {
              flex-wrap:nowrap;
              gap:8px;
            }
            .now-controls-bottom {
              grid-template-columns:1fr;
              gap:10px;
            }
            .now-volume {
              grid-template-columns:auto minmax(0,1fr);
              gap:10px;
            }
            .now-actions {
              width:100%;
              justify-content:flex-start;
            }
            .now-actions .chip-btn {
              width:100%;
            }
            .now-queue-card {
              padding:14px;
            }
            .now-queue-header {
              gap:8px;
            }
            .group-inline {
              width:100%;
              margin-inline-start:0;
              gap:8px;
            }
            .group-inline .chip-btn {
              flex:1 1 calc(50% - 4px);
            }
            .mini-queue-item {
              padding:10px 8px;
              gap:8px;
            }
            .mini-queue-actions .chip-btn,.queue-actions .chip-btn {
              min-width:40px;
              min-height:38px;
              padding:8px 10px;
              font-size:13px;
            }
            .modal {
              width:min(100%, calc(100cqi - 16px));
              max-height:calc(100dvh - 16px);
              border-radius:20px;
            }
            .immersive-shell {
              padding:
                max(12px, env(safe-area-inset-top))
                max(12px, env(safe-area-inset-right))
                max(12px, env(safe-area-inset-bottom))
                max(12px, env(safe-area-inset-left));
            }
          }
          @media (max-width:480px) {
            .card {
              min-height:min(560px, var(--ma-card-height));
              border-radius:18px;
            }
            .brand-title { font-size:14px; }
            .brand-sub { font-size:10px; }
            .nav { padding:8px; gap:6px; }
            .nav-btn { width:auto; min-height:40px; padding:0 12px; }
            .topbar-row { gap:8px; width:100%; min-width:0; }
            .topbar-actions { gap:8px; }
            .status-pill,.selected-player-box { width:auto; }
            .now-layout { gap:12px; }
            .now-art-card,.now-controls-card,.now-queue-card { border-radius:20px; }
            .now-track-title { font-size:20px; }
            .now-track-subtitle { font-size:13px; }
            .big-round-btn { width:48px; height:48px; border-radius:16px; }
            .big-main-btn { width:68px; height:68px; font-size:24px; }
            .play-btn {
              width:54px;
              height:54px;
              border-radius:18px;
            }
            .np-art {
              width:58px;
              height:58px;
              border-radius:16px;
            }
            .selected-player-title {
              font-size:11px;
            }
            .selected-player-sub {
              font-size:10px;
            }
            .group-inline .chip-btn {
              flex:1 1 100%;
            }
            .now-controls-main {
              gap:6px;
            }
            .mini-queue-actions .chip-btn,.queue-actions .chip-btn {
              min-width:36px;
              min-height:36px;
              padding:8px;
            }
            .modal-body { padding:14px; }
          }
        .mobile-volume-inline .volume-btn .ui-ic{width:20px;height:20px;}
  .card:not(.layout-tablet) .mobile-volume-inline{grid-template-columns:auto minmax(0,1fr) auto auto;gap:10px;align-items:center;}
  .card:not(.layout-tablet) .mobile-volume-inline .volume-value{order:1;min-width:46px;text-align:center;}
  .card:not(.layout-tablet) .mobile-volume-inline .tablet-volume-track{order:2;}
  .card:not(.layout-tablet) .mobile-volume-inline .volume-btn{order:3;width:38px;height:38px;border-radius:999px;}
  .card:not(.layout-tablet) .mobile-volume-inline.has-volume-step-buttons{grid-template-columns:auto auto minmax(0,1fr) auto auto auto;gap:8px;}
  .card:not(.layout-tablet) .mobile-volume-inline.has-volume-step-buttons .volume-value{order:1;}
  .card:not(.layout-tablet) .mobile-volume-inline.has-volume-step-buttons .volume-step-minus{order:2;}
  .card:not(.layout-tablet) .mobile-volume-inline.has-volume-step-buttons .tablet-volume-track{order:3;}
  .card:not(.layout-tablet) .mobile-volume-inline.has-volume-step-buttons .volume-step-plus{order:4;}
  .card:not(.layout-tablet) .mobile-volume-inline.has-volume-step-buttons .volume-btn{order:5;}
  .card:not(.layout-tablet) .mobile-volume-inline .volume-btn.active{background:rgba(170,38,38,.28)!important;border-color:rgba(255,98,98,.36)!important;color:#fff!important;box-shadow:0 10px 24px rgba(120,22,22,.22)!important;}
  .card:not(.layout-tablet) .queue-action-item{min-height:58px;margin-bottom:10px;}
  .mobile-art-actions{left:50%!important;right:auto!important;transform:translateX(-50%)!important;inset-inline:auto!important;inset-block-end:16px!important;display:flex!important;align-items:center!important;justify-content:center!important;gap:10px!important;padding:0!important;border-radius:0!important;background:transparent!important;border:none!important;box-shadow:none!important;backdrop-filter:none!important;}
  .card.layout-tablet .mobile-art-actions{left:50%!important;right:auto!important;transform:translateX(-50%)!important;inset-inline:auto!important;inset-block-end:18px!important;}
  .theme-light .mobile-art-actions{background:transparent!important;border-color:transparent!important;box-shadow:none!important;}
  .mobile-art-fab{width:46px;min-width:46px;height:46px;border-radius:999px;}
  @media (max-width: 600px){.mobile-art-actions{left:50%!important;right:auto!important;transform:translateX(-50%)!important;inset-inline:auto!important;inset-block-end:12px!important;gap:8px!important;}.mobile-art-fab{width:42px;min-width:42px;height:42px;}}
  .card.layout-tablet .menu-backdrop{justify-content:center!important;align-items:stretch!important;padding:var(--flow-sheet-pad-block) var(--flow-sheet-pad-inline)!important;}
  .card.layout-tablet .menu-sheet{width:min(calc(100% - var(--flow-sheet-gutter)), 920px)!important;max-width:min(calc(100% - var(--flow-sheet-gutter)), 920px)!important;max-height:calc(100% - 26px)!important;height:calc(100% - 26px)!important;margin-inline:auto!important;}
  .card.layout-tablet .menu-sheet.sheet-library,.card.layout-tablet .menu-sheet.sheet-search{width:min(calc(100% - var(--flow-sheet-gutter)), 1120px)!important;max-width:min(calc(100% - var(--flow-sheet-gutter)), 1120px)!important;}
  .card.layout-tablet .menu-sheet.sheet-queue{width:min(calc(100% - var(--flow-sheet-queue-gutter)), 980px)!important;max-width:min(calc(100% - var(--flow-sheet-queue-gutter)), 980px)!important;}
  .card.layout-tablet .menu-sheet.sheet-actions,.card.layout-tablet .menu-sheet.sheet-simple,.card.layout-tablet .menu-sheet.sheet-schedules,.card.layout-tablet .menu-sheet.sheet-players,.card.layout-tablet .menu-sheet.sheet-groupplayers,.card.layout-tablet .menu-sheet.sheet-settings{width:min(calc(100% - var(--flow-sheet-narrow-gutter)), 860px)!important;max-width:min(calc(100% - var(--flow-sheet-narrow-gutter)), 860px)!important;}
  .card.layout-tablet .menu-sheet.sheet-schedules{width:min(calc(100% - var(--flow-sheet-gutter)), 1080px)!important;max-width:min(calc(100% - var(--flow-sheet-gutter)), 1080px)!important;}
  .card.layout-tablet .menu-body.sheet-schedules{justify-items:stretch!important;align-content:start!important;overflow:auto!important;}
  .card.layout-tablet .menu-body.sheet-schedules .settings-shell{height:auto!important;min-height:100%!important;grid-template-rows:auto auto!important;overflow:visible!important;}
  .card.layout-tablet .wake-schedule-layout{height:auto!important;display:grid!important;grid-template-columns:minmax(0,1fr)!important;align-items:stretch!important;overflow:visible!important;}
  .card.layout-tablet .wake-schedule-list-card{max-height:none!important;overflow:visible!important;}
  .card.layout-tablet .wake-schedule-editor-card{overflow:visible!important;}
  .card.layout-tablet .scheduled-start-grid{grid-template-columns:minmax(0,1fr)!important;}
  .card.layout-tablet .sleep-timer-corner{inset-block-end:22px!important;inset-block-start:auto!important;transform:none!important;justify-items:end!important;z-index:8!important;}
  .card.layout-tablet.rtl .sleep-timer-corner{inset-inline-end:76px!important;inset-inline-start:auto!important;}
  .card.layout-tablet:not(.rtl) .sleep-timer-corner{inset-inline-start:76px!important;inset-inline-end:auto!important;}
  .card.layout-tablet .queue-list{max-width:920px;margin-inline:auto;}
  .card.layout-tablet .queue-row{min-height:88px!important;}
  .card.layout-tablet .active-player-chip .bars,.card.layout-tablet .active-player-card .bars{display:none!important;}
  .menu-backdrop{overflow:hidden;isolation:isolate;}
  .menu-backdrop::before{content:"";position:absolute;inset:-42px;background:var(--menu-dynamic-art, var(--dynamic-art-url, none)) center/cover no-repeat;filter:blur(42px) saturate(1.12) brightness(.86);transform:scale(1.12);opacity:0;pointer-events:none;z-index:0;transition:opacity .22s ease;}
  .menu-backdrop.has-menu-art::before{opacity:.58;}
  .menu-backdrop::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(5,7,12,.46),rgba(8,10,16,.72));pointer-events:none;z-index:0;}
  .theme-light .menu-backdrop::after{background:linear-gradient(180deg,rgba(238,243,250,.34),rgba(222,229,240,.68));}
  .menu-backdrop>.menu-sheet{position:relative;z-index:1;isolation:isolate;}
  .menu-sheet::before{content:"";position:absolute;inset:-24px;background:var(--menu-dynamic-art, var(--dynamic-art-url, none)) center/cover no-repeat;filter:blur(30px) saturate(1.08);transform:scale(1.08);opacity:0;pointer-events:none;z-index:0;}
  .menu-backdrop.has-menu-art .menu-sheet::before{opacity:.22;}
  .menu-sheet::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(20,22,31,.82),rgba(12,14,22,.94));pointer-events:none;z-index:0;}
  .theme-light .menu-sheet::after{background:linear-gradient(180deg,rgba(255,255,255,.86),rgba(245,248,253,.94));}
  .menu-sheet>*,.menu-head,.menu-body{position:relative;z-index:1;}
  .card.dynamic-theme .modal{position:relative;overflow:hidden;isolation:isolate;}
  .card.dynamic-theme .modal::before{content:"";position:absolute;inset:-24px;background:var(--dynamic-art-url, none) center/cover no-repeat;filter:blur(34px) saturate(1.08);transform:scale(1.08);opacity:.22;pointer-events:none;z-index:0;}
  .card.dynamic-theme .modal::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(20,22,31,.8),rgba(12,14,22,.92));pointer-events:none;z-index:0;}
  .theme-light.card.dynamic-theme .modal::after{background:linear-gradient(180deg,rgba(255,255,255,.84),rgba(245,248,253,.94));}
  .card.dynamic-theme .modal>*{position:relative;z-index:1;}
  .group-player-card{position:relative;}
  .group-player-card.checked,.group-player-row.checked{border-color:rgba(var(--dynamic-accent-rgb,245 166 35) / .42)!important;background:linear-gradient(180deg,rgba(var(--dynamic-accent-rgb,245 166 35) / .13),rgba(255,255,255,.06))!important;}
  .group-player-card .player-premium-head{position:relative;padding:10px 50px 0 0!important;}
  .group-player-title-row{gap:8px;}
  .group-player-toggle{position:absolute;top:6px;right:7px;left:auto;bottom:auto;width:29px;height:29px;border-radius:0;display:inline-grid;place-items:center;flex:0 0 auto;border:0;background:transparent;color:rgba(210,216,226,.62);box-shadow:none;opacity:.9;z-index:2;pointer-events:none;transition:transform .15s ease,opacity .15s ease,color .15s ease,filter .15s ease;}
  .group-player-toggle.checked{color:rgb(var(--dynamic-accent-rgb,245 166 35));filter:drop-shadow(0 0 8px rgba(var(--dynamic-accent-rgb,245 166 35) / .34));opacity:1;}
  .group-item-toggle{width:28px;height:28px;border-radius:999px;display:inline-grid;place-items:center;flex:0 0 auto;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.08);color:var(--ma-text-1);box-shadow:inset 0 1px 0 rgba(255,255,255,.12);}
  .group-item-toggle.checked{border-color:rgba(var(--dynamic-accent-rgb,245 166 35) / .42);background:rgba(var(--dynamic-accent-rgb,245 166 35) / .18);color:var(--ma-accent);}
  .theme-light .group-player-toggle{color:rgba(74,84,100,.62);}
  .theme-light .group-player-toggle.checked{color:rgb(var(--dynamic-accent-rgb,245 166 35));}
  .theme-light .group-item-toggle{border-color:rgba(26,39,61,.14);background:rgba(255,255,255,.74);color:#263247;}
  .group-player-toggle .ui-ic{width:18px;height:18px;}
  .group-item-toggle .ui-ic{width:15px;height:15px;}
  .group-player-check,.group-player-card .group-player-check,.group-item input[type="checkbox"]{position:absolute!important;width:1px!important;height:1px!important;opacity:0!important;pointer-events:none!important;margin:0!important;}
  .group-item .group-name{display:flex;align-items:center;gap:10px;min-width:0;}
  .group-item .group-name .group-item-toggle{margin-inline-start:auto;}
  .action-btn.busy{position:relative;display:inline-flex!important;align-items:center;justify-content:center;gap:8px;cursor:progress!important;pointer-events:none;color:var(--ma-accent);border-color:rgba(var(--dynamic-accent-rgb,245 166 35) / .34);background:linear-gradient(180deg,rgba(var(--dynamic-accent-rgb,245 166 35) / .2),rgba(255,255,255,.07));}
  .action-btn.busy::before{content:"";width:14px;height:14px;border-radius:999px;border:2px solid currentColor;border-inline-end-color:transparent;animation:spin .72s linear infinite;}
  .action-btn.busy::after{content:"";position:absolute;inset:-4px;border-radius:inherit;border:1px solid rgba(var(--dynamic-accent-rgb,245 166 35) / .28);animation:voiceAssistantListenPulse 1s ease-out infinite;pointer-events:none;}

`;
