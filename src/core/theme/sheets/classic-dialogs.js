// Classic dialogs styles. Original cascade order is preserved.
export default function({modalOverlayAlpha}) { return `          .ctx-menu {
            position:absolute;
            z-index:80;
            min-width:214px;
            max-width:min(268px, calc(100% - 24px));
            max-height:min(56vh, 360px);
            overflow:auto;
            padding:8px;
            border-radius:18px;
            border:1px solid var(--ma-border);
            background:var(--ma-panel);
            backdrop-filter:blur(14px);
            -webkit-backdrop-filter:blur(14px);
            box-shadow:0 18px 44px rgba(0,0,0,0.24);
            display:grid;
            gap:6px;
          }
          .ctx-item { display:flex; align-items:center; gap:10px; min-height:42px; padding:10px 12px; border-radius:14px; color:var(--ma-text-1); cursor:pointer; font-size:13px; font-weight:800; }
          .ctx-item:hover { background:var(--ma-soft); }
          .ctx-ico { width:18px; height:18px; text-align:center; color:var(--ma-text-2); flex-shrink:0; display:grid; place-items:center; }
          .ctx-ico .ui-ic { width:15px; height:15px; }
          .queue-ctx-menu {
            min-width:186px;
            max-width:min(220px, calc(100% - 24px));
            padding:6px;
            gap:4px;
            border-radius:16px;
          }
          .queue-ctx-menu .ctx-item {
            min-height:38px;
            padding:8px 10px;
            border-radius:12px;
            font-size:12px;
            font-weight:800;
          }
          .queue-ctx-menu .ctx-ico {
            width:16px;
            height:16px;
          }
          .queue-ctx-menu .ctx-ico .ui-ic {
            width:14px;
            height:14px;
          }
          .ctx-sep { height:1px; margin:6px 4px; background:rgba(255,255,255,.12); }
          .ctx-caption { padding:4px 8px 2px; font-size:11px; font-weight:800; letter-spacing:.08em; text-transform:uppercase; color:var(--ma-text-3); }
          .toast-wrap {
            position:absolute;
            inset-inline-end:16px;
            bottom:16px;
            z-index:60;
            display:flex;
            flex-direction:column;
            gap:8px;
            pointer-events:none;
          }
          .toast-wrap.center-toast {
            inset:0;
            bottom:auto;
            align-items:center;
            justify-content:center;
            padding:18px;
          }
          .toast-wrap.top-toast {
            top:max(16px, env(safe-area-inset-top));
            bottom:auto;
            inset-inline:16px;
            align-items:center;
          }
          .toast {
            padding:10px 14px;
            border-radius:12px;
            border:1px solid var(--ma-border);
            background:var(--ma-panel);
            color:var(--ma-text-1);
            font-size:12px;
            display:flex;
            align-items:center;
            gap:8px;
            pointer-events:auto;
            backdrop-filter:blur(12px);
            -webkit-backdrop-filter:blur(12px);
          }
          .toast-text { min-width:0; flex:1; }
          .toast-ack {
            border:1px solid color-mix(in srgb, var(--ma-accent) 42%, transparent);
            border-radius:999px;
            padding:5px 10px;
            color:var(--ma-text-1);
            background:color-mix(in srgb, var(--ma-accent) 18%, transparent);
            font-size:11px;
            font-weight:800;
            cursor:pointer;
          }
          .toast.centered {
            max-width:min(420px, calc(100% - 48px));
            padding:14px 18px;
            border-radius:18px;
            font-size:14px;
            font-weight:850;
            text-align:center;
            box-shadow:0 22px 54px rgba(0,0,0,.28), inset 0 1px 0 rgba(255,255,255,.12);
          }
          .modal-backdrop {
            position:absolute;
            inset:0;
            z-index:220;
            display:none;
            align-items:center;
            justify-content:center;
            background:rgba(10,14,22,${modalOverlayAlpha.toFixed(2)});
            backdrop-filter:blur(10px);
            -webkit-backdrop-filter:blur(10px);
            padding:20px;
          }
          .modal-backdrop.open { display:flex; }
          .modal {
            width:min(760px,100%);
            max-height:min(84vh,760px);
            overflow:auto;
            border-radius:26px;
            border:1px solid var(--ma-modal-border);
            background:
              linear-gradient(180deg, color-mix(in srgb, var(--ma-accent) 7%, transparent), transparent 22%),
              linear-gradient(180deg, color-mix(in srgb, var(--ma-modal-bg) 96%, transparent), color-mix(in srgb, var(--ma-modal-bg) 88%, black 12%));
            backdrop-filter:blur(22px);
            -webkit-backdrop-filter:blur(22px);
            box-shadow:0 28px 70px rgba(0,0,0,0.26);
            overflow-x:hidden;
            color:var(--ma-text-1);
          }
          .theme-light .modal {
            background:
              linear-gradient(180deg, rgba(255,255,255,0.92), rgba(247,250,255,0.88));
            box-shadow:0 24px 60px rgba(31,41,55,0.16);
          }
          .theme-light .modal-header,
          .theme-light .queue-header {
            background:rgba(255,255,255,0.9);
          }
          .theme-light .modal-title,
          .theme-light .modal-section-title,
          .theme-light .player-card-title,
          .theme-light .group-name,
          .theme-light .queue-title,
          .theme-light .media-title,
          .theme-light .track-name,
          .theme-light .selected-player-title,
          .theme-light .now-track-title {
            color:var(--ma-text-1);
          }
          .theme-light .modal-subtitle,
          .theme-light .player-card-sub,
          .theme-light .player-card-track,
          .theme-light .queue-sub,
          .theme-light .selected-player-sub,
          .theme-light .now-track-subtitle,
          .theme-light .track-sub,
          .theme-light .media-sub {
            color:var(--ma-text-2);
          }
          .modal-header {
            display:flex;
            align-items:center;
            gap:12px;
            padding:18px 20px;
            border-bottom:1px solid color-mix(in srgb, var(--ma-border) 96%, transparent);
            background:linear-gradient(180deg, color-mix(in srgb, var(--ma-modal-soft) 96%, transparent), transparent);
            position:sticky;
            top:0;
            z-index:2;
            backdrop-filter:blur(16px);
            -webkit-backdrop-filter:blur(16px);
          }
          .modal-header-icon {
            width:42px;
            height:42px;
            border-radius:14px;
            display:grid;
            place-items:center;
            background:color-mix(in srgb, var(--ma-accent) 16%, transparent);
            border:1px solid color-mix(in srgb, var(--ma-accent) 26%, transparent);
            color:var(--ma-accent);
            font-size:18px;
            flex-shrink:0;
          }
          .modal-header-meta { min-width:0; flex:1; }
          .modal-title { font-size:16px; font-weight:800; letter-spacing:-0.01em; }
          .modal-subtitle {
            margin-top:2px;
            font-size:11.5px;
            color:var(--ma-text-3);
            white-space:nowrap;
            overflow:hidden;
            text-overflow:ellipsis;
          }
          .modal-body { padding:18px 20px 20px; }
          .modal-section {
            border:1px solid color-mix(in srgb, var(--ma-modal-border) 92%, transparent);
            background:color-mix(in srgb, var(--ma-modal-soft) 72%, transparent);
            border-radius:20px;
            padding:14px;
            margin-bottom:14px;
            box-shadow:0 10px 24px rgba(0,0,0,0.06);
          }
          .theme-light .modal-section {
            background:rgba(255,255,255,0.72);
            box-shadow:0 10px 24px rgba(31,41,55,0.08);
          }
          .modal-section:last-child { margin-bottom:0; }
          .modal-section-top {
            display:flex;
            align-items:center;
            gap:10px;
            flex-wrap:wrap;
            margin-bottom:12px;
          }
          .modal-section-title { font-size:12px; font-weight:800; color:var(--ma-text-1); }
          .modal-section-badge {
            padding:4px 9px;
            border-radius:999px;
            background:color-mix(in srgb, var(--ma-soft) 94%, transparent);
            border:1px solid color-mix(in srgb, var(--ma-border) 96%, transparent);
            color:var(--ma-text-3);
            font-size:11px;
            font-weight:700;
          }
          .group-list { display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:10px; margin-bottom:14px; }
          .group-item,.player-card {
            display:flex;
            align-items:center;
            gap:12px;
            padding:12px 12px;
            border-radius:16px;
            border:1px solid color-mix(in srgb, var(--ma-border) 96%, transparent);
            background:color-mix(in srgb, var(--ma-panel) 78%, transparent);
            cursor:pointer;
            min-width:0;
            transition:180ms ease;
            box-shadow:0 8px 18px rgba(0,0,0,0.08);
          }
          .theme-light .group-item,
          .theme-light .player-card {
            background:rgba(255,255,255,0.88);
            box-shadow:0 8px 18px rgba(31,41,55,0.07);
          }
          .group-item:hover,.player-card:hover {
            transform:translateY(-1px);
            border-color:color-mix(in srgb, var(--ma-accent) 28%, transparent);
            background:color-mix(in srgb, var(--ma-accent) 8%, transparent);
          }
          .group-item.checked,.player-card.active {
            border-color:color-mix(in srgb, var(--ma-accent) 32%, transparent);
            background:linear-gradient(90deg, color-mix(in srgb, var(--ma-accent) 12%, transparent), transparent 68%), color-mix(in srgb, var(--ma-accent) 12%, transparent);
            box-shadow:0 10px 22px rgba(224,161,27,0.10);
          }
          .group-item input { margin:0; accent-color:var(--ma-accent); flex-shrink:0; }
          .group-icon,
          .player-card-icon {
            width:42px;
            height:42px;
            border-radius:14px;
            display:grid;
            place-items:center;
            background:color-mix(in srgb, var(--ma-soft) 92%, transparent);
            border:1px solid color-mix(in srgb, var(--ma-border) 96%, transparent);
            font-size:18px;
            flex-shrink:0;
          }
          .group-meta { min-width:0; flex:1; }
          .group-name { min-width:0; font-size:13px; font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
          .group-sub { min-width:0; font-size:11px; color:var(--ma-text-3); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-top:2px; }
          .group-actions { display:flex; gap:8px; flex-wrap:wrap; }
          .player-modal-grid { display:grid; grid-template-columns:1fr; gap:14px; }
          .player-group-title { font-size:12px; font-weight:800; color:var(--ma-text-2); margin-bottom:10px; }
          .player-list { display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:10px; }
          .player-card { align-items:flex-start; text-align:start; width:100%; }
          .player-card-dot { width:10px; height:10px; border-radius:50%; background:var(--ma-text-3); margin-top:6px; flex-shrink:0; box-shadow:0 0 0 5px rgba(255,255,255,0.03); }
          .player-card.playing .player-card-dot { background:#46c16f; box-shadow:0 0 10px rgba(70,193,111,0.35); }
          .player-card.paused .player-card-dot { background:#d9a441; }
          .player-card-meta { min-width:0; flex:1; }
          .player-card-top {
            display:flex;
            align-items:center;
            gap:8px;
            justify-content:space-between;
            margin-bottom:4px;
          }
          .player-card-title { font-size:13px; font-weight:800; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
          .player-card-badge {
            padding:3px 8px;
            border-radius:999px;
            background:color-mix(in srgb, var(--ma-soft) 94%, transparent);
            border:1px solid color-mix(in srgb, var(--ma-border) 96%, transparent);
            color:var(--ma-text-3);
            font-size:10px;
            font-weight:800;
            flex-shrink:0;
          }
          .player-card.active .player-card-badge {
            color:var(--ma-accent);
            border-color:color-mix(in srgb, var(--ma-accent) 28%, transparent);
            background:color-mix(in srgb, var(--ma-accent) 10%, transparent);
          }
          .player-card-sub,.player-card-track { font-size:11px; color:var(--ma-text-3); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
          .player-card-art,
          .group-art {
            width:52px;
            height:52px;
            border-radius:16px;
            overflow:hidden;
            border:1px solid color-mix(in srgb, var(--ma-border) 94%, transparent);
            background:color-mix(in srgb, var(--ma-soft) 92%, transparent);
            display:grid;
            place-items:center;
            flex-shrink:0;
            font-size:22px;
            color:var(--ma-text-3);
            box-shadow:0 8px 18px rgba(0,0,0,0.10);
          }
          .player-card-art img,
          .group-art img {
            width:100%;
            height:100%;
            object-fit:cover;
            display:block;
          }
          .group-item {
            justify-content:flex-start;
            align-items:center;
            gap:12px;
          }
          .group-item input {
            order:2;
            width:24px;
            height:24px;
            margin-inline-start:auto;
          }
          .group-item .group-meta {
            order:1;
            min-width:0;
            flex:1;
          }
          .group-item .group-name {
            font-size:16px;
            font-weight:800;
            color:var(--ma-text-1);
            white-space:nowrap;
            overflow:hidden;
            text-overflow:ellipsis;
          }
          .group-item .group-sub {
            display:none;
          }
`; }
