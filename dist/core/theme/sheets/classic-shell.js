// Classic shell styles. Original cascade order is preserved.
export default function({allocatedHeight,effectiveHeight,uiScale,mainOpacity,popupOpacity,darkBgAlpha,darkSidebarAlpha,darkPanelAlpha,lightBgAlpha,lightPanelAlpha}) { return `
          :host {
            display:block;
            container-type:inline-size;
            container-name:homeii-browser-host;
            margin:0 !important;
            padding:0 !important;
            background:transparent !important;
            border:none !important;
            box-shadow:none !important;
            --ma-accent: var(--accent-color, #e0a11b);
            --ma-radius-xl: 22px;
            overflow:hidden !important;
            border-radius:var(--ma-radius-xl);
            --ma-card-height: ${Math.round(allocatedHeight || effectiveHeight)}px;
            --ma-effective-height: ${effectiveHeight}px;
            --ma-ui-scale: ${uiScale.toFixed(3)};
            --ma-main-opacity: ${mainOpacity.toFixed(2)};
            --ma-popup-opacity: ${popupOpacity.toFixed(2)};
            --ma-shell-pad: calc(16px * var(--ma-ui-scale));
            --ma-shell-gap: calc(14px * var(--ma-ui-scale));
            --ma-control-size: calc(42px * var(--ma-ui-scale));
            --ma-chip-height: calc(44px * var(--ma-ui-scale));
            --ma-np-art-size: calc(96px * var(--ma-ui-scale));
            --ma-now-button-size: calc(58px * var(--ma-ui-scale));
            --ma-now-main-button-size: calc(82px * var(--ma-ui-scale));
            --ma-track-title-size: calc(24px * var(--ma-ui-scale));
            --ma-blur: blur(18px);
            --homeii-font-family:var(--paper-font-body1_-_font-family, var(--primary-font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif));
            font-family:var(--homeii-font-family);
          }
          ha-card {
            background:transparent !important;
            border:none !important;
            box-shadow:none !important;
            overflow:hidden !important;
            border-radius:var(--ma-radius-xl);
          }
          .card.rtl,
          .card.rtl button,
          .card.rtl input,
          .card.rtl textarea,
          .card.rtl select {
            font-family:var(--homeii-font-family);
          }
          .theme-dark {
            --ma-bg: rgba(18,20,26,${darkBgAlpha.toFixed(2)});
            --ma-sidebar: rgba(14,16,22,${darkSidebarAlpha.toFixed(2)});
            --ma-topbar: rgba(20,22,29,${Math.max(0.36, Math.min(0.94, mainOpacity * 0.92)).toFixed(2)});
            --ma-panel: rgba(24,26,33,${darkPanelAlpha.toFixed(2)});
            --ma-soft: rgba(255,255,255,0.07);
            --ma-soft-2: rgba(255,255,255,0.10);
            --ma-border: rgba(255,255,255,0.10);
            --ma-text-1: var(--primary-text-color, #f1f3f8);
            --ma-text-2: var(--secondary-text-color, #b7bccb);
            --ma-text-3: rgba(200,205,220,0.65);
            --ma-shadow: 0 18px 44px rgba(0,0,0,0.34);
            --ma-modal-bg: rgba(18,22,30,${Math.max(0.68, popupOpacity).toFixed(2)});
            --ma-modal-soft: rgba(255,255,255,0.06);
            --ma-modal-border: rgba(255,255,255,0.14);
          }
          .theme-light {
            --ma-bg: rgba(248,250,253,${Math.max(0.84, lightBgAlpha + 0.16).toFixed(2)});
            --ma-sidebar: rgba(236,241,247,${Math.max(0.88, mainOpacity + 0.12).toFixed(2)});
            --ma-topbar: rgba(242,246,251,${Math.max(0.9, mainOpacity + 0.16).toFixed(2)});
            --ma-panel: rgba(255,255,255,${Math.max(0.9, lightPanelAlpha + 0.18).toFixed(2)});
            --ma-soft: rgba(18,25,36,0.055);
            --ma-soft-2: rgba(18,25,36,0.12);
            --ma-border: rgba(18,25,36,0.14);
            --ma-text-1: #16202d;
            --ma-text-2: #445166;
            --ma-text-3: rgba(22,32,45,0.72);
            --ma-shadow: 0 18px 44px rgba(28,35,45,0.10);
            --ma-modal-bg: rgba(255,255,255,${Math.max(0.82, popupOpacity).toFixed(2)});
            --ma-modal-soft: rgba(20,24,32,0.04);
            --ma-modal-border: rgba(20,24,32,0.12);
          }
          * { box-sizing:border-box; }
          *::before,*::after { box-sizing:border-box; }
          .card {
            display:grid;
            grid-template-columns:220px minmax(0,1fr);
            container-type:inline-size;
            container-name:homeii-browser-card;
            position:relative;
            width:100%;
            height:min(var(--ma-card-height), calc(100dvh - 24px));
            min-height:min(520px, var(--ma-effective-height));
            max-height:calc(100dvh - 24px);
            overflow:hidden;
            border-radius:var(--ma-radius-xl);
            background:linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01)), var(--ma-bg);
            color:var(--ma-text-1);
            border:1px solid var(--ma-border);
            box-shadow:var(--ma-shadow);
            backdrop-filter: var(--ma-blur);
            -webkit-backdrop-filter: var(--ma-blur);
          }
          .card.rtl { direction:rtl; }
          .sidebar {
            min-width:0;
            display:flex;
            flex-direction:column;
            background:var(--ma-sidebar);
            border-inline-end:1px solid var(--ma-border);
            backdrop-filter:blur(16px);
            -webkit-backdrop-filter:blur(16px);
          }
          .brand {
            display:flex;
            align-items:center;
            gap:12px;
            padding:18px 16px 16px;
            border-bottom:1px solid var(--ma-border);
          }
          .brand-icon {
            width:38px;
            height:38px;
            border-radius:12px;
            display:grid;
            place-items:center;
            background:linear-gradient(135deg, var(--ma-accent), color-mix(in srgb, var(--ma-accent) 74%, white 26%));
            color:#111;
            font-weight:700;
            flex-shrink:0;
            box-shadow:0 10px 24px rgba(224,161,27,0.22);
            cursor:pointer;
            transition:transform 180ms ease, box-shadow 180ms ease, opacity 180ms ease;
          }
          .brand-icon:hover {
            transform:translateY(-1px) scale(1.02);
            box-shadow:0 14px 30px rgba(224,161,27,0.28);
          }
          .brand-icon.playing {
            animation:brandPulseFade 2.8s ease-in-out infinite;
          }
          @keyframes brandPulseFade {
            0% { opacity:1; transform:scale(1); }
            50% { opacity:.72; transform:scale(1.045); }
            100% { opacity:1; transform:scale(1); }
          }
          .brand-title { font-size:15px; font-weight:700; }
          .brand-sub { font-size:11px; color:var(--ma-text-3); }
          .nav { flex:1; overflow-y:auto; padding:12px 10px; }
          .nav-label { font-size:10px; text-transform:uppercase; letter-spacing:.12em; color:var(--ma-text-3); padding:10px 10px 6px; }
          .nav-btn {
            width:100%;
            display:flex;
            align-items:center;
            gap:10px;
            border:1px solid transparent;
            background:transparent;
            color:var(--ma-text-2);
            padding:10px 12px;
            border-radius:13px;
            cursor:pointer;
            margin-bottom:4px;
            text-align:start;
            font:inherit;
            transition:180ms ease;
          }
          .nav-btn:hover { background:var(--ma-soft); color:var(--ma-text-1); }
          .nav-btn.active {
            color:var(--ma-accent);
            background:color-mix(in srgb, var(--ma-accent) 14%, transparent);
            border-color:color-mix(in srgb, var(--ma-accent) 28%, transparent);
          }
          .nav-ico { width:18px; text-align:center; flex-shrink:0; }
          .player-panel {
            padding:16px 14px 14px;
            border-top:1px solid var(--ma-border);
            background:color-mix(in srgb, var(--ma-sidebar) 88%, black 12%);
            display:flex;
            flex-direction:column;
            gap:14px;
          }
          .np-row {
            display:flex;
            flex-direction:column;
            align-items:center;
            gap:12px;
            margin-bottom:0;
            min-width:0;
            cursor:pointer;
            text-align:center;
          }
          .np-art,.track-art,.queue-thumb,.queue-art,.mini-queue-thumb { background:var(--ma-soft); display:grid; place-items:center; overflow:hidden; }
          .np-art {
            width:104px;
            height:104px;
            border-radius:28px;
            flex-shrink:0;
            border:1px solid color-mix(in srgb, var(--ma-border) 96%, transparent);
            box-shadow:0 16px 30px rgba(0,0,0,0.14);
          }
          .np-art img,.track-art img,.queue-thumb img,.queue-art img,.mini-queue-thumb img,.media-art img,.now-art img {
            width:100%;
            height:100%;
            object-fit:cover;
            display:block;
          }
          .np-art img,.media-art img,.now-art img {
            object-fit:contain;
            object-position:center;
          }
          .np-meta {
            width:100%;
            min-width:0;
          }
          .np-title,.media-title,.track-name,.queue-name,.mini-queue-name { white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
          .np-title {
            font-size:15px;
            font-weight:800;
            line-height:1.15;
          }
          .np-sub,.media-sub,.track-sub,.queue-artist,.mini-queue-artist { font-size:11px; color:var(--ma-text-3); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
          .controls,.now-controls-main { display:flex; align-items:center; justify-content:center; gap:8px; }
          .card.rtl .controls,.card.rtl .now-controls-main { direction:ltr; }
          .card.rtl .volume-row,.card.rtl .now-volume { direction:ltr; }
          .controls {
            margin-bottom:0;
            gap:14px;
          }
          .icon-btn,.play-btn,.lang-btn,.close-btn,.big-round-btn,.big-main-btn,.theme-btn {
            border:none;
            cursor:pointer;
            font:inherit;
            transition:180ms ease;
            display:grid;
            place-items:center;
          }
          .ui-ic {
            width:60%;
            height:60%;
            display:block;
            flex-shrink:0;
            pointer-events:none;
            overflow:visible;
            shape-rendering:geometricPrecision;
          }
          .ui-ic * {
            vector-effect:non-scaling-stroke;
          }
          ha-icon.ui-ic {
            --mdc-icon-size:100%;
            width:60%;
            height:60%;
            display:inline-flex;
            align-items:center;
            justify-content:center;
          }
          .play-btn .ui-ic,
          .big-main-btn .ui-ic {
            width:58%;
            height:58%;
          }
          .immersive-btn.small .ui-ic {
            width:48%;
            height:48%;
          }
          .immersive-btn.primary .ui-ic {
            width:54%;
            height:54%;
          }
          .icon-btn,.lang-btn,.close-btn,.theme-btn {
            width:42px;
            height:42px;
            border-radius:14px;
            background:color-mix(in srgb, var(--ma-soft) 92%, transparent);
            color:var(--ma-text-2);
            border:1px solid color-mix(in srgb, var(--ma-border) 96%, transparent);
            box-shadow:0 6px 16px rgba(0,0,0,0.06);
          }
          .theme-light .icon-btn,
          .theme-light .lang-btn,
          .theme-light .close-btn,
          .theme-light .theme-btn {
            background:rgba(255,255,255,0.44);
          }
          .icon-btn:hover,.lang-btn:hover,.close-btn:hover,.theme-btn:hover { background:var(--ma-soft); color:var(--ma-text-1); }
          .icon-btn.active,.big-round-btn.active,.theme-btn.active {
            color:var(--ma-accent);
            background:color-mix(in srgb, var(--ma-accent) 14%, transparent);
            border-color:color-mix(in srgb, var(--ma-accent) 28%, transparent);
          }
          .group-volume-btn[hidden] { display:none!important; }
          .group-volume-btn.active {
            color:var(--ma-accent);
            background:color-mix(in srgb, var(--ma-accent) 14%, transparent);
            border-color:color-mix(in srgb, var(--ma-accent) 28%, transparent);
          }
          .play-btn,.big-main-btn {
            width:94px;
            height:94px;
            border-radius:28px;
            font-size:32px;
            box-shadow:0 18px 34px rgba(224,161,27,0.24);
          }
          .play-btn {
            width:64px;
            height:64px;
            border-radius:22px;
            box-shadow:0 14px 30px rgba(224,161,27,0.24);
            font-size:22px;
          }
          .progress,.now-progress { position:relative; height:8px; border-radius:999px; background:var(--ma-soft-2); overflow:hidden; cursor:pointer; touch-action:none; }
          .progress::before,.now-progress::before,.immersive-progress::before {
            content:"";
            position:absolute;
            inset:-12px 0;
          }
          .progress { display:none; }
          .progress-fill,.now-progress-fill {
            height:100%;
            width:0%;
            background:linear-gradient(90deg, var(--ma-accent), color-mix(in srgb, var(--ma-accent) 72%, white 28%));
          }
          .player-label { display:none; }
          .player-select { display:none; }
          .volume-row,.now-volume { display:flex; align-items:center; gap:12px; }
          .volume-range,.now-volume input {
            width:100%;
            appearance:none;
            height:8px;
            border-radius:999px;
            outline:none;
            background:linear-gradient(to right, var(--ma-accent) 0%, var(--ma-accent) var(--vol-pct, 50%), var(--ma-soft-2) var(--vol-pct, 50%), var(--ma-soft-2) 100%);
          }
          .volume-range::-webkit-slider-thumb,.now-volume input::-webkit-slider-thumb {
            appearance:none;
            width:18px;
            height:18px;
            border-radius:50%;
            background:var(--ma-accent);
            border:none;
          }
          .volume-range::-moz-range-thumb,.now-volume input::-moz-range-thumb {
            width:18px;
            height:18px;
            border-radius:50%;
            background:var(--ma-accent);
            border:none;
          }
          .main {
            min-width:0;
            min-height:0;
            display:flex;
            flex-direction:column;
            overflow:hidden;
            position:relative;
            backdrop-filter:blur(14px);
            -webkit-backdrop-filter:blur(14px);
            box-shadow:0 18px 44px rgba(0,0,0,0.24);
          }
          .topbar {
            display:flex;
            flex-direction:column;
            gap:10px;
            padding:14px 18px 14px;
            border-bottom:1px solid var(--ma-border);
            background:linear-gradient(180deg, color-mix(in srgb, var(--ma-topbar) 94%, transparent), color-mix(in srgb, var(--ma-topbar) 80%, transparent));
            backdrop-filter:blur(16px);
            -webkit-backdrop-filter:blur(16px);
            overflow-x:auto;
            overflow-y:hidden;
          }
          .topbar-row,.player-summary-row {
            display:flex;
            align-items:center;
            gap:10px;
            flex-wrap:nowrap !important;
            width:max-content;
            min-width:100%;
          }
          .player-summary-row {
            display:none;
          }
          .search {
            flex:1 1 320px;
            min-width:180px;
            display:flex;
            align-items:center;
            gap:10px;
            min-height:48px;
            padding:0 16px;
            border-radius:18px;
            background:color-mix(in srgb, var(--ma-soft) 92%, transparent);
            border:1px solid color-mix(in srgb, var(--ma-border) 96%, transparent);
            box-shadow:inset 0 1px 0 rgba(255,255,255,0.04);
          }
          .theme-light .search {
            background:rgba(255,255,255,0.92);
            box-shadow:inset 0 1px 0 rgba(255,255,255,0.75);
          }
          .search input {
            flex:1;
            min-width:0;
            border:none;
            background:transparent;
            color:var(--ma-text-1);
            outline:none;
            font:inherit;
          }
          .search input::placeholder { color:var(--ma-text-3); }
          .topbar-actions,.summary-actions {
            display:flex;
            gap:10px;
            align-items:center;
            flex-wrap:nowrap;
            flex:0 0 auto;
            margin-inline-start:auto;
          }
          .status-pill {
            display:inline-flex;
            align-items:center;
            gap:10px;
            min-height:46px;
            padding:0 16px;
            border-radius:999px;
            border:1px solid color-mix(in srgb, var(--ma-border) 96%, transparent);
            background:color-mix(in srgb, var(--ma-soft) 90%, transparent);
            color:var(--ma-text-2);
            font-size:13px;
            font-weight:600;
            white-space:nowrap;
            box-shadow:0 6px 16px rgba(0,0,0,0.06);
          }
          .theme-light .status-pill {
            background:rgba(255,255,255,0.9);
          }
          .status-dot { width:8px; height:8px; border-radius:50%; background:#46c16f; box-shadow:0 0 10px rgba(70,193,111,0.4); }
          .status-pill.offline .status-dot { background:#d66; box-shadow:0 0 10px rgba(214,102,102,0.35); }
          .selected-player-box {
            display:flex;
            align-items:center;
            gap:12px;
            min-width:220px;
            max-width:340px;
            flex:0 0 clamp(220px, 24cqi, 340px);
            min-height:48px;
            padding:0 16px;
            border-radius:18px;
            border:1px solid color-mix(in srgb, var(--ma-border) 96%, transparent);
            background:color-mix(in srgb, var(--ma-soft) 94%, transparent);
            box-shadow:0 8px 20px rgba(0,0,0,0.06);
          }
          .theme-light .selected-player-box {
            background:rgba(255,255,255,0.92);
          }
          .selected-player-meta { min-width:0; flex:1; }
          .selected-player-title {
            font-size:12px;
            font-weight:800;
            color:var(--ma-text-1);
            letter-spacing:-0.01em;
            white-space:nowrap;
            overflow:hidden;
            text-overflow:ellipsis;
          }
          .selected-player-sub {
            font-size:11px;
            color:var(--ma-text-3);
            white-space:nowrap;
            overflow:hidden;
            text-overflow:ellipsis;
            margin-top:1px;
          }
          .chip-dot {
            width:10px;
            height:10px;
            border-radius:50%;
            background:rgba(255,255,255,0.32);
            flex-shrink:0;
            box-shadow:0 0 0 5px rgba(255,255,255,0.04);
          }
          .theme-light .chip-dot { background:rgba(20,24,32,0.22); }
          .content { flex:1; min-height:0; overflow-y:auto; padding:16px; }
          .content.now-playing-mode { overflow:hidden; }
          .brand {
            padding:calc(16px * var(--ma-ui-scale));
            gap:calc(12px * var(--ma-ui-scale));
          }
          .brand-icon {
            width:calc(38px * var(--ma-ui-scale));
            height:calc(38px * var(--ma-ui-scale));
            border-radius:calc(12px * var(--ma-ui-scale));
          }
          .brand-title { font-size:calc(15px * var(--ma-ui-scale)); }
          .brand-sub { font-size:calc(11px * var(--ma-ui-scale)); }
          .player-panel { padding:var(--ma-shell-pad); gap:calc(14px * var(--ma-ui-scale)); }
          .np-art {
            width:var(--ma-np-art-size);
            height:var(--ma-np-art-size);
            border-radius:calc(26px * var(--ma-ui-scale));
            cursor:pointer;
            transition:transform 180ms ease, box-shadow 180ms ease;
          }
          .np-art:hover {
            transform:translateY(-1px) scale(1.015);
            box-shadow:0 18px 34px rgba(0,0,0,0.16);
          }
          .np-title { font-size:calc(15px * var(--ma-ui-scale)); }
          .topbar { padding:calc(14px * var(--ma-ui-scale)); }
          .topbar-row,.player-summary-row,.topbar-actions,.summary-actions { gap:calc(10px * var(--ma-ui-scale)); }
          .search {
            min-height:calc(46px * var(--ma-ui-scale));
            padding:0 calc(14px * var(--ma-ui-scale));
            border-radius:calc(18px * var(--ma-ui-scale));
          }
          .content { padding:var(--ma-shell-pad); }
          .chip-btn {
            min-height:var(--ma-chip-height);
            padding:0 calc(14px * var(--ma-ui-scale));
            border-radius:calc(16px * var(--ma-ui-scale));
          }
          .icon-btn,.lang-btn,.close-btn,.theme-btn {
            width:var(--ma-control-size);
            height:var(--ma-control-size);
            border-radius:calc(14px * var(--ma-ui-scale));
          }
          .selected-player-box,.status-pill {
            min-height:calc(46px * var(--ma-ui-scale));
            padding:0 calc(15px * var(--ma-ui-scale));
            border-radius:calc(18px * var(--ma-ui-scale));
          }
          .section { margin-bottom:calc(24px * var(--ma-ui-scale)); }
          .section { margin-bottom:28px; }
          .section-header { display:flex; align-items:center; gap:10px; flex-wrap:wrap; margin-bottom:12px; }
          .section-title { font-size:15px; font-weight:700; }
          .section-badge,.now-queue-count {
            padding:3px 9px;
            border-radius:999px;
            background:var(--ma-soft);
            border:1px solid var(--ma-border);
            color:var(--ma-text-3);
            font-size:11px;
          }
          .section-actions { margin-inline-start:auto; display:flex; gap:6px; flex-wrap:wrap; }
          .chip-btn {
            border:1px solid color-mix(in srgb, var(--ma-border) 96%, transparent);
            background:color-mix(in srgb, var(--ma-soft) 92%, transparent);
            color:var(--ma-text-2);
            border-radius:16px;
            min-height:44px;
            padding:0 14px;
            font:inherit;
            font-size:12px;
            font-weight:700;
            cursor:pointer;
            display:inline-flex;
            align-items:center;
            justify-content:center;
            gap:8px;
            backdrop-filter:blur(10px);
            -webkit-backdrop-filter:blur(10px);
            transition:180ms ease;
            box-shadow:0 6px 16px rgba(0,0,0,0.06);
          }
          .theme-light .chip-btn {
            background:rgba(255,255,255,0.92);
          }
          .chip-btn:hover {
            color:var(--ma-accent);
            background:color-mix(in srgb, var(--ma-accent) 14%, transparent);
            border-color:color-mix(in srgb, var(--ma-accent) 28%, transparent);
          }
          .chip-btn.warn { color:#ffcf7a; border-color:rgba(255,207,122,0.18); }
          .chip-btn.active {
            color:var(--ma-accent);
            border-color:color-mix(in srgb, var(--ma-accent) 30%, transparent);
            background:color-mix(in srgb, var(--ma-accent) 12%, transparent);
          }
`; }
