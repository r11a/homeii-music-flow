// Classic library styles. Original cascade order is preserved.
export default `          .grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(126px, 1fr)); gap:14px; }
          .media-card { cursor:pointer; min-width:0; transition:transform 180ms ease; }
          .media-card:hover { transform:translateY(-3px); }
          .media-card.playing .media-art {
            border-color:color-mix(in srgb, var(--ma-accent) 28%, transparent);
            box-shadow:0 0 0 1px color-mix(in srgb, var(--ma-accent) 40%, transparent);
          }
          .media-art {
            position:relative;
            aspect-ratio:1/1;
            border-radius:18px;
            border:1px solid var(--ma-border);
            margin-bottom:8px;
            background:var(--ma-soft);
            overflow:hidden;
          }
          .media-placeholder {
            position:absolute;
            inset:0;
            display:grid;
            place-items:center;
            font-size:28px;
            color:var(--ma-text-3);
          }
          .homeii-art-fallback {
            width:100%;
            height:100%;
            display:grid;
            place-items:center;
            border-radius:inherit;
            background:
              radial-gradient(circle at 50% 36%, color-mix(in srgb, var(--ma-accent) 28%, transparent), transparent 52%),
              linear-gradient(145deg, rgba(255,255,255,.09), rgba(255,255,255,.025));
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
            box-shadow:0 12px 28px rgba(0,0,0,.18);
          }
          .homeii-art-fallback svg {
            width:48%;
            height:48%;
            color:currentColor;
            opacity:.92;
          }
          .theme-light .homeii-art-fallback {
            color:rgba(48,55,68,.7);
            background:
              radial-gradient(circle at 50% 36%, color-mix(in srgb, var(--ma-accent) 18%, transparent), transparent 54%),
              linear-gradient(145deg, rgba(255,255,255,.86), rgba(238,242,247,.56));
            box-shadow:inset 0 0 0 1px rgba(90,105,125,.12);
          }
          .theme-light .homeii-art-fallback-disc {
            background:rgba(255,255,255,.48);
            border-color:rgba(82,96,118,.12);
          }
          .media-overlay {
            position:absolute;
            inset:0;
            display:grid;
            place-items:center;
            background:linear-gradient(180deg, transparent, rgba(0,0,0,0.18), rgba(0,0,0,0.54));
            opacity:0;
            transition:opacity 180ms ease;
          }
          .theme-light .media-overlay { background:linear-gradient(180deg, transparent, rgba(255,255,255,0.04), rgba(0,0,0,0.16)); }
          .media-card:hover .media-overlay { opacity:1; }
          .play-bubble {
            width:42px;
            height:42px;
            border-radius:50%;
            display:grid;
            place-items:center;
            background:linear-gradient(135deg, var(--ma-accent), color-mix(in srgb, var(--ma-accent) 72%, white 28%));
            color:#111;
          }
          .playing-badge {
            position:absolute;
            bottom:6px;
            left:6px;
            padding:3px 6px;
            border-radius:8px;
            font-size:10px;
            font-weight:700;
            color:#111;
            background:linear-gradient(135deg, var(--ma-accent), color-mix(in srgb, var(--ma-accent) 72%, white 28%));
            display:none;
          }
          .media-card.playing .playing-badge { display:inline-flex; }
          .media-title { font-size:12.5px; font-weight:600; }
          .track-list { display:flex; flex-direction:column; gap:6px; }
          .track-row {
            display:flex;
            align-items:center;
            gap:12px;
            min-width:0;
            padding:10px 12px;
            border-radius:14px;
            background:transparent;
            border:1px solid transparent;
            cursor:pointer;
          }
          .track-row:hover { background:var(--ma-soft); }
          .track-row.playing {
            background:color-mix(in srgb, var(--ma-accent) 14%, transparent);
            border-color:color-mix(in srgb, var(--ma-accent) 28%, transparent);
          }
          .track-num { width:24px; text-align:center; color:var(--ma-text-3); font-size:11px; flex-shrink:0; }
          .track-row.playing .track-num { color:var(--ma-accent); }
          .track-art { width:42px; height:42px; border-radius:12px; flex-shrink:0; }
          .track-meta { flex:1; min-width:0; }
          .track-name { font-size:12.5px; font-weight:600; }
          .track-row.playing .track-name { color:var(--ma-accent); }
          .track-dur { font-size:11px; color:var(--ma-text-3); flex-shrink:0; }
          .state-box {
            min-height:240px;
            display:grid;
            place-items:center;
            text-align:center;
            padding:24px;
            color:var(--ma-text-3);
          }
          .spinner {
            width:24px;
            height:24px;
            border:2px solid color-mix(in srgb, var(--ma-text-3) 25%, transparent);
            border-top-color:var(--ma-accent);
            border-radius:50%;
            animation:spin .8s linear infinite;
            margin:0 auto 10px;
          }
          @keyframes spin { to { transform:rotate(360deg); } }
          .homeii-loading-state {
            min-height:240px;
            display:grid;
            place-items:center;
            text-align:center;
            padding:24px;
            color:var(--ma-text-2);
          }
          .homeii-loading-content {
            display:grid;
            justify-items:center;
            gap:12px;
          }
          .homeii-loading-mark {
            position:relative;
            width:70px;
            height:70px;
            display:grid;
            place-items:center;
          }
          .homeii-loading-ring {
            position:absolute;
            inset:8px;
            border-radius:999px;
            border:2px solid color-mix(in srgb, var(--ma-text-3) 16%, transparent);
            border-top-color:color-mix(in srgb, var(--ma-accent) 88%, #fff 8%);
            animation:homeiiLoadingSpin 1.4s linear infinite;
          }
          .homeii-loading-ring.secondary {
            inset:17px;
            opacity:.58;
            animation-duration:2.1s;
            animation-direction:reverse;
          }
          .homeii-loading-core {
            width:15px;
            height:15px;
            border-radius:999px;
            background:var(--ma-accent);
            box-shadow:0 0 24px color-mix(in srgb, var(--ma-accent) 56%, transparent);
            animation:homeiiLoadingPulse 1.2s ease-in-out infinite;
          }
          .homeii-loading-text {
            color:var(--ma-text-2);
            font-size:13px;
            font-weight:850;
          }
          @keyframes homeiiLoadingSpin { to { transform:rotate(360deg); } }
          @keyframes homeiiLoadingPulse {
            0%,100% { transform:scale(.86); opacity:.62; }
            50% { transform:scale(1.08); opacity:1; }
          }
          @media (prefers-reduced-motion: reduce) {
            .homeii-loading-ring,
            .homeii-loading-core {
              animation:none;
            }
          }
          .queue-panel {
            position:absolute;
            inset:0;
            z-index:210;
            display:flex;
            flex-direction:column;
            background:rgba(8,12,18,0.42);
            backdrop-filter:blur(18px);
            -webkit-backdrop-filter:blur(18px);
          }
          .theme-light .queue-panel {
            background:rgba(236,241,247,0.58);
            backdrop-filter:blur(20px);
            -webkit-backdrop-filter:blur(20px);
          }
          .queue-shell {
            width:min(1100px, calc(100% - 20px));
            height:min(calc(100% - 20px), var(--ma-effective-height));
            margin:auto;
            display:flex;
            flex-direction:column;
            border-radius:26px;
            border:1px solid var(--ma-modal-border);
            background:
              linear-gradient(180deg, color-mix(in srgb, var(--ma-accent) 6%, transparent), transparent 20%),
              linear-gradient(180deg, color-mix(in srgb, var(--ma-modal-bg) 96%, transparent), color-mix(in srgb, var(--ma-modal-bg) 90%, black 10%));
            box-shadow:0 24px 60px rgba(0,0,0,0.22);
            overflow:hidden;
          }
          .theme-light .queue-shell {
            background:linear-gradient(180deg, rgba(255,255,255,0.94), rgba(247,250,255,0.92));
            box-shadow:0 22px 50px rgba(31,41,55,0.14);
          }
          .queue-header {
            display:flex;
            align-items:center;
            gap:14px;
            padding:18px 20px;
            border-bottom:1px solid var(--ma-border);
            background:color-mix(in srgb, var(--ma-modal-soft) 92%, transparent);
            backdrop-filter:blur(12px);
            -webkit-backdrop-filter:blur(12px);
          }
          .queue-art {
            width:58px;
            height:58px;
            border-radius:16px;
            flex-shrink:0;
            border:1px solid var(--ma-border);
            overflow:hidden;
            box-shadow:0 8px 18px rgba(0,0,0,0.12);
          }
          .queue-meta { min-width:0; flex:1; }
          .queue-title {
            font-size:18px;
            font-weight:800;
            white-space:nowrap;
            overflow:hidden;
            text-overflow:ellipsis;
          }
          .queue-sub {
            margin-top:3px;
            font-size:12px;
            color:var(--ma-text-3);
            white-space:nowrap;
            overflow:hidden;
            text-overflow:ellipsis;
          }
          .queue-scroll {
            flex:1;
            overflow-y:auto;
            padding:16px;
            background:linear-gradient(180deg, rgba(255,255,255,0.02), transparent 18%);
          }
          .queue-item {
            display:flex;
            align-items:center;
            gap:12px;
            padding:12px 14px;
            border-radius:16px;
            cursor:pointer;
            border:1px solid transparent;
            background:transparent;
            transition:180ms ease;
            margin-bottom:8px;
          }
          .queue-item:hover {
            background:color-mix(in srgb, var(--ma-soft) 82%, transparent);
            border-color:color-mix(in srgb, var(--ma-border) 78%, transparent);
          }
          .queue-item.active {
            background:linear-gradient(90deg, color-mix(in srgb, var(--ma-accent) 16%, transparent), transparent 72%), color-mix(in srgb, var(--ma-soft) 88%, transparent);
            border-color:color-mix(in srgb, var(--ma-accent) 26%, transparent);
            box-shadow:0 8px 20px rgba(0,0,0,0.08);
          }
          .queue-item.past { opacity:.44; }
          .queue-num {
            width:28px;
            text-align:center;
            font-size:12px;
            font-weight:700;
            color:var(--ma-text-3);
            flex-shrink:0;
          }
          .queue-item.active .queue-num,.queue-item.active .queue-name { color:var(--ma-accent); }
          .queue-thumb {
            width:46px;
            height:46px;
            border-radius:13px;
            flex-shrink:0;
            border:1px solid var(--ma-border);
            overflow:hidden;
          }
          .queue-item-meta { flex:1; min-width:0; }
          .queue-name { font-size:13px; font-weight:700; }
          .queue-artist { font-size:11.5px; color:var(--ma-text-3); margin-top:2px; }
          .queue-dur { font-size:11px; color:var(--ma-text-3); flex-shrink:0; }
          .queue-actions,.mini-queue-actions {
            display:flex;
            gap:10px;
            align-items:center;
            flex-wrap:wrap;
            direction:ltr;
          }
          .mini-queue-actions .chip-btn,.queue-actions .chip-btn {
            padding:10px 14px;
            min-width:46px;
            min-height:42px;
            font-size:14px;
            font-weight:800;
            border-radius:12px;
            background:color-mix(in srgb, var(--ma-panel) 82%, transparent);
            box-shadow:0 6px 18px rgba(0,0,0,0.12);
          }
          .mini-queue-actions .chip-btn:disabled,.queue-actions .chip-btn:disabled {
            opacity:.52;
            cursor:progress;
          }
          .queue-item-meta {
            flex:1;
            min-width:0;
          }
          .queue-actions {
            margin-inline-start:auto;
          }
          .theme-light .queue-item,
          .theme-light .queue-header {
            box-shadow:none;
          }
`;
